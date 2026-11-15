import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {analyzeDraft} from './lib/classifier.js';
import {createSecurity} from './lib/deploy-security.js';
import {getFeature,listFeatures} from './features/registry.js';

const root=path.dirname(fileURLToPath(import.meta.url));
const publicDir=path.join(root,'public');
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'application/javascript; charset=utf-8','.svg':'image/svg+xml'};
const securityHeaders={
  'X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer',
  'X-Frame-Options':'DENY','Permissions-Policy':'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy':"default-src 'self'; connect-src 'self'; script-src 'self'; style-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'",
};
function sendJson(res,status,data){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store',...securityHeaders});res.end(JSON.stringify(data));}
function sendText(res,status,message){res.writeHead(status,{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store',...securityHeaders});res.end(message);}
async function bodyJson(req){
  let parts=[],bytes=0;
  for await (const chunk of req){bytes+=chunk.length;if(bytes>16000) {const e=new Error('Payload too large');e.code=413;throw e;}parts.push(chunk);}
  return JSON.parse(Buffer.concat(parts).toString('utf8'));
}
export function createAppServer(options={}) {
  const security=options.security||createSecurity();
  const analyze=options.analyze||analyzeDraft;
  const production=security.production;
  if(production && !process.env.OPENAI_API_KEY && !options.analyze) throw new Error('OPENAI_API_KEY is required for public deployment');
  return http.createServer(async(req,res)=>{
    // No wildcard CORS: production Chrome extension access is deliberately not enabled.
    // Local development extensions can reach loopback; browser same-origin requests
    // rely on a signed session, CSRF header, and the standard browser origin policy.
    const origin=req.headers.origin||'';
    if (security.localExtension(req) && origin){
      res.setHeader('Access-Control-Allow-Origin',origin);res.setHeader('Vary','Origin');
    }
    const u=new URL(req.url||'/', 'http://localhost');
    if(req.method==='OPTIONS' && u.pathname==='/api/analyze'){
      if(!security.localExtension(req))return sendText(res,403,'Not permitted');
      res.setHeader('Access-Control-Allow-Methods','POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers','Content-Type');res.writeHead(204);return res.end();
    }
    if(u.pathname==='/api/health' && req.method==='GET') return sendJson(res,200,{ok:true,mode:process.env.OPENAI_API_KEY?'ai':'demo-rules'});
    if(u.pathname==='/api/features' && req.method==='GET') return sendJson(res,200,{features:listFeatures()});
    if(u.pathname==='/api/session' && req.method==='GET'){
      if(!security.isSameOrigin(req) && req.headers.origin)return sendJson(res,403,{error:'Cross-origin request denied'});
      if(req.headers['sec-fetch-site']&&!['same-origin','none'].includes(req.headers['sec-fetch-site']))return sendJson(res,403,{error:'Cross-site request denied'});
      const data=security.newSession(res,req);return sendJson(res,data.ok?200:data.status,data);
    }
    if(u.pathname==='/api/analyze' && req.method==='POST'){
      const permit=security.requireAuthForAnalyze(req);
      if(!permit.ok)return sendJson(res,permit.status||403,{error:permit.error||'Unauthorized'});
      const limit=security.rateLimitAnalyze(req,permit);
      if(!limit.ok)return sendJson(res,limit.status,{error:limit.error});
      try{
        const data=await bodyJson(req);const text=data?.text;
        const feature=getFeature(data?.channel||'email');
        if(!feature)return sendJson(res,400,{error:'Unsupported demo feature.'});
        if(typeof text!=='string'||!text.trim()||text.length>5000)return sendJson(res,400,{error:'Provide 1–5,000 characters of message text.'});
        const result=await analyze(text,{channel:feature.classifierChannel});return sendJson(res,200,result);
      }catch(err){
        // Do not log users' private draft content or the provider's raw error body.
        const status=err.code===413?413:503;
        return sendJson(res,status,{error:status===413?'Request too large.':'Analysis unavailable. Your draft has not been sent.'});
      }finally{limit.release();}
    }
    if(req.method!=='GET'&&req.method!=='HEAD')return sendText(res,405,'Method not allowed');
    let pathname;try{pathname=decodeURIComponent(u.pathname);}catch{return sendText(res,400,'Bad path');}
    const target=path.resolve(publicDir,'.'+(pathname==='/'?'/index.html':pathname));
    if(!target.startsWith(publicDir+path.sep))return sendText(res,403,'Forbidden');
    if(pathname.startsWith('/api/'))return sendText(res,404,'Not found');
    try{
      const data=await readFile(target);
      res.writeHead(200,{'Content-Type':mime[path.extname(target)]||'application/octet-stream','Cache-Control':'no-store',...securityHeaders});
      return res.end(req.method==='HEAD'?undefined:data);
    }catch{return sendText(res,404,'Not found');}
  });
}
const runningFile=process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url);
if(runningFile){
  const port=Number(process.env.PORT||4173);
  const host=process.env.NODE_ENV==='production'?'0.0.0.0':'127.0.0.1';
  createAppServer().listen(port,host,()=>console.log(`PausePilot listening on ${host}:${port} (${process.env.OPENAI_API_KEY?'AI':'demo-rules'})`));
}
