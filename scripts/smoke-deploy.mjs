// Run after deployment. Default verifies access controls without sending a paid AI request.
const target=process.argv.find(x=>x.startsWith('https://'));
if(!target){console.error('Usage: npm run smoke:deploy -- https://your-service.onrender.com [--ai]');process.exit(2);}
const base=new URL(target).origin;
const health=await fetch(base+'/api/health');
if(!health.ok)throw Error('Health check failed: '+health.status);
console.log('PASS public health:',(await health.json()).ok);
const bad=await fetch(base+'/api/analyze',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text:'hello'})});
if(bad.status!==403)throw Error('Unauthenticated request was not rejected: '+bad.status);
console.log('PASS request without session rejected:',bad.status);
const ses=await fetch(base+'/api/session',{headers:{Origin:base,'Sec-Fetch-Site':'same-origin'}});
if(!ses.ok)throw Error('Session endpoint failed: '+ses.status);
const session=await ses.json();const cookie=ses.headers.get('set-cookie')?.split(';')[0];
if(!session.csrf||!cookie)throw Error('Missing CSRF/cookie');
console.log('PASS secure demo session created');
const rogue=await fetch(base+'/api/analyze',{method:'POST',headers:{Origin:'https://untrusted.example','Content-Type':'application/json',Cookie:cookie,'X-PausePilot-CSRF':session.csrf},body:JSON.stringify({text:'hello'})});
if(rogue.status!==403)throw Error('Cross-origin request not rejected: '+rogue.status);
console.log('PASS cross-origin API request rejected');
if(process.argv.includes('--ai')){
 const reply=await fetch(base+'/api/analyze',{method:'POST',headers:{Origin:base,'Sec-Fetch-Site':'same-origin',Cookie:cookie,'X-PausePilot-CSRF':session.csrf,'Content-Type':'application/json'},body:JSON.stringify({text:'Hi, could you send me the document this afternoon?',channel:'email'})});
 if(!reply.ok)throw Error('AI request returned '+reply.status+' '+await reply.text());
 const data=await reply.json();if(!['allow','review','urgent'].includes(data.decision))throw Error('Invalid analysis');
 console.log('PASS paid AI analysis:',data.mode,data.decision);
}
