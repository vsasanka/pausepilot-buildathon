import {createHmac, randomBytes, timingSafeEqual} from 'node:crypto';

// Demo access is anonymous. Signed sessions + CSRF protect browser-origin requests;
// per-IP/per-session/global caps restrict abuse. They are NOT account authentication.
// For a paid multi-instance product, use an external rate-limit store and identity.
export function createSecurity(config = {}) {
  const now = config.now || (() => Date.now());
  const secret = config.secret || process.env.PAUSEPILOT_SESSION_SECRET || randomBytes(32).toString('hex');
  const production = config.production ?? process.env.NODE_ENV === 'production';
  if (production && secret.length < 32) throw new Error('PAUSEPILOT_SESSION_SECRET must be at least 32 characters in production');
  const expectedOrigin = config.origin || process.env.PUBLIC_ORIGIN || process.env.RENDER_EXTERNAL_URL || `http://localhost:${process.env.PORT || 4173}`;
  const allowedOrigin = new URL(expectedOrigin).origin;
  const limits = {
    perIpMinute: Number(config.perIpMinute ?? process.env.PAUSEPILOT_PER_IP_MINUTE ?? 8),
    perSessionHour: Number(config.perSessionHour ?? process.env.PAUSEPILOT_PER_SESSION_HOUR ?? 30),
    globalDay: Number(config.globalDay ?? process.env.PAUSEPILOT_GLOBAL_DAILY_CAP ?? 150),
    parallel: Number(config.parallel ?? process.env.PAUSEPILOT_MAX_IN_FLIGHT ?? 3),
  };
  for (const [k,v] of Object.entries(limits)) if(!Number.isInteger(v) || v<1 || v>10000)throw new Error(`Bad limit ${k}`);
  const counters = new Map();
  let inFlight = 0;
  function mac(str) {return createHmac('sha256',secret).update(str).digest('hex');}
  function equal(a,b) { if(typeof a!=='string'||typeof b!=='string'||a.length!==b.length) return false;return timingSafeEqual(Buffer.from(a),Buffer.from(b));}
  function isLoopback(ip='') {return ip==='::1'||ip==='127.0.0.1'||ip.startsWith('::ffff:127.');}
  function clientIp(req){
    // On Render, the upstream appends the direct client address as the last
    // x-forwarded-for segment. Avoid trusting the leftmost, user-forged entry.
    // On local development use the socket address, not caller-supplied headers.
    const direct=req.socket?.remoteAddress||'unknown';
    if (!production) return direct;
    const xff=req.headers['x-forwarded-for'];
    if (typeof xff==='string' && xff.length<512) return xff.split(',').at(-1).trim()||direct;
    return direct;
  }
  function hit(key,max,windowMs){
    const t=now(); const row=counters.get(key);
    if (!row || row.ends<=t){counters.set(key,{ends:t+windowMs,count:1});return true;}
    if(row.count>=max)return false;
    row.count++;return true;
  }
  function sweep(){if(counters.size<6000)return;const t=now();for(const[k,v]of counters)if(v.ends<=t)counters.delete(k);}
  function cookiePart(req,name){const cookie=req.headers.cookie||''; const part=cookie.split(';').map(x=>x.trim()).find(x=>x.startsWith(name+'='));return part?.slice(name.length+1)||'';}
  const lifetime = 90*60*1000;
  function newSession(res,req){
    sweep();
    if(!hit(`init:${clientIp(req)}`,20,60*60*1000))return {ok:false,status:429,error:'Too many session requests; try later.'};
    const id=randomBytes(18).toString('hex');const ts=now().toString(36);
    const value=`${id}.${ts}.${mac(`${id}.${ts}`)}`;
    res.setHeader('Set-Cookie',`pp_session=${value}; HttpOnly; SameSite=Strict; Path=/api; Max-Age=5400${production?'; Secure':''}`);
    return {ok:true,csrf:mac('csrf:'+id),expiresInSeconds:5400};
  }
  function validateSession(req){
    const raw=cookiePart(req,'pp_session');const match=/^([a-f0-9]{36})\.([0-9a-z]+)\.([a-f0-9]{64})$/.exec(raw);
    if(!match)return {ok:false,error:'Missing session; refresh the page.'};
    const [,id,ts,sig]=match;
    if(!equal(mac(`${id}.${ts}`),sig))return {ok:false,error:'Invalid session; refresh the page.'};
    const stamp=parseInt(ts,36);
    if(!Number.isSafeInteger(stamp)||stamp>now()+60000||now()-stamp>lifetime)return {ok:false,error:'Session expired; refresh the page.'};
    if(!equal(req.headers['x-pausepilot-csrf'],mac('csrf:'+id)))return {ok:false,error:'Session verification failed; refresh the page.'};
    return {ok:true,id};
  }
  function isSameOrigin(req){
    const origin=req.headers.origin;
    const site=req.headers['sec-fetch-site'];
    if (origin!==allowedOrigin || (site && !['same-origin','none'].includes(site)))return false;
    return true;
  }
  function localExtension(req){
    return !production && isLoopback(req.socket?.remoteAddress) &&
      (typeof req.headers.origin==='string' && req.headers.origin.startsWith('chrome-extension://'));
  }
  function requireAuthForAnalyze(req) {
    if(localExtension(req))return {ok:true,id:'local-extension'};
    if(!isSameOrigin(req))return {ok:false,status:403,error:'Cross-origin requests are not permitted.'};
    const session=validateSession(req);
    return session.ok?session:{...session,status:403};
  }
  function rateLimitAnalyze(req,session){
    sweep();const ip=clientIp(req);
    if(inFlight>=limits.parallel)return {ok:false,status:429,error:'PausePilot is busy. Try again shortly.'};
    if(!hit(`ip:${ip}`,limits.perIpMinute,60000))return {ok:false,status:429,error:'Too many requests. Wait a minute.'};
    if(!hit(`session:${session.id}`,limits.perSessionHour,3600000))return {ok:false,status:429,error:'This session has reached its hourly limit.'};
    if(!hit('global',limits.globalDay,86400000))return {ok:false,status:429,error:'The public AI demo has reached its daily request cap.'};
    inFlight++;
    return {ok:true,release(){inFlight=Math.max(0,inFlight-1);}};
  }
  return {production,allowedOrigin,limits,newSession,requireAuthForAnalyze,rateLimitAnalyze,isSameOrigin,localExtension};
}
