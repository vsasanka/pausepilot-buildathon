import test from 'node:test';
import assert from 'node:assert/strict';
import {createAppServer} from '../server.js';
import {createSecurity} from '../lib/deploy-security.js';

async function withServer(options, run){
  let calls=0;
  const security=createSecurity({origin:'https://pausepilot.test',production:false,secret:'test-secret-for-signed-session-only-123456',...options});
  const server=createAppServer({security,analyze:async(text)=>{calls++;if(text==='force-error')throw Error('provider down');return {decision:'review',mode:'ai',reason:'A personal attack',evidence:'Insult',suggestion:'Review your wording'};}});
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  try {await run({base:`http://127.0.0.1:${server.address().port}`,calls:()=>calls});}
  finally{await new Promise(r=>server.close(r));}
}
const goodHeaders={'Origin':'https://pausepilot.test','Sec-Fetch-Site':'same-origin'};
async function session(base){
  const res=await fetch(base+'/api/session',{headers:goodHeaders});
  assert.equal(res.status,200);
  const payload=await res.json();
  return {csrf:payload.csrf,cookie:res.headers.get('set-cookie').split(';')[0]};
}
async function send(base,s,extra={},text='You are an idiot'){
  return fetch(base+'/api/analyze',{method:'POST',headers:{...goodHeaders,'Content-Type':'application/json','Cookie':s.cookie,'X-PausePilot-CSRF':s.csrf,...extra},body:JSON.stringify({text})});
}

test('public demo has signed session, CSRF token, and no key in health',async()=>{
  await withServer({},async({base})=>{
    const health=await fetch(base+'/api/health');assert.equal(health.status,200);
    assert.equal((await health.json()).ok,true);
    const s=await session(base);
    const good=await send(base,s);assert.equal(good.status,200);assert.equal((await good.json()).decision,'review');
  });
});
test('rejects direct POST without a session and malicious origin',async()=>{
  await withServer({},async({base,calls})=>{
    const without=await fetch(base+'/api/analyze',{method:'POST',headers:{...goodHeaders,'Content-Type':'application/json'},body:JSON.stringify({text:'hey'})});
    assert.equal(without.status,403);
    const s=await session(base);
    assert.equal((await send(base,s,{'Origin':'https://evil.example'})).status,403);
    assert.equal((await send(base,s,{'X-PausePilot-CSRF':'wrong'})).status,403);
    assert.equal((await send(base,{...s,cookie:s.cookie.replace(/.$/,'0')})).status,403);
    assert.equal(calls(),0);
  });
});
test('limits billable API usage per session and globally',async()=>{
  await withServer({perSessionHour:2,globalDay:2},async({base,calls})=>{
    const s=await session(base);
    assert.equal((await send(base,s)).status,200);
    assert.equal((await send(base,s)).status,200);
    assert.equal((await send(base,s)).status,429);
    const s2=await session(base);assert.equal((await send(base,s2)).status,429);
    assert.equal(calls(),2);
  });
});
test('no draft or private provider exception is leaked when AI fails',async()=>{
  await withServer({},async({base})=>{
    const s=await session(base);const res=await send(base,s,{},'force-error');
    assert.equal(res.status,503);
    const value=await res.text();assert.doesNotMatch(value,/provider down|force-error/);
    assert.match(value,/draft has not been sent/);
  });
});
test('cross-site session and preflight are rejected, static site has security headers',async()=>{
  await withServer({},async({base})=>{
    const cross=await fetch(base+'/api/session',{headers:{Origin:'https://evil.example','Sec-Fetch-Site':'cross-site'}});assert.equal(cross.status,403);
    const pre=await fetch(base+'/api/analyze',{method:'OPTIONS',headers:{Origin:'https://evil.example'}});assert.equal(pre.status,403);
    const root=await fetch(base+'/');assert.equal(root.status,200);
    assert.match(root.headers.get('content-security-policy'),/script-src 'self'/);
    assert.equal(root.headers.get('x-frame-options'),'DENY');
  });
});
test('expired sessions and excessive POST bodies are rejected',async()=>{
  let t=1000000000000;
  await withServer({now:()=>t},async({base})=>{
    const s=await session(base);
    let res=await send(base,s,{},'x'.repeat(6000));assert.equal(res.status,400);
    t+=91*60*1000;res=await send(base,s);assert.equal(res.status,403);
  });
});
