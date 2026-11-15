import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const server=read('server.js');
const protection=read('lib/deploy-security.js');
const crisis=read('lib/crisis-safety.js');
const worker=read('extension/service-worker.js');
const manifest=JSON.parse(read('extension/manifest.json'));
const popup=read('extension/popup.js');
const findings=[
 {id:'SEC-1',severity:'info',name:'Scope of extension permissions',status:manifest.content_scripts.every(x=>x.matches.every(m=>m.includes('localhost:4173')||m.includes('mail.google.com')))?'PASS':'REVIEW',evidence:'The extension currently targets localhost and Gmail; deployed public URL is web-only.'},
 {id:'SEC-2',severity:'medium',name:'Gmail opt-in',status:popup.includes('gmailEnabled:false')?'PASS':'REVIEW',evidence:'Gmail monitoring remains separately opt-in.'},
 {id:'SEC-3',severity:'high',name:'Anonymous session gate and CSRF',status:server.includes('requireAuthForAnalyze')&&protection.includes('timingSafeEqual')&&protection.includes('HttpOnly')?'PASS':'OPEN',evidence:'Signed short-lived session, strict same-origin gate and CSRF token. Anonymous sessions are not account authentication.'},
 {id:'SEC-4',severity:'high',name:'Usage caps',status:server.includes('rateLimitAnalyze')&&protection.includes('globalDay')?'PASS':'OPEN',evidence:'Per-IP, per-session, concurrent and process-wide caps; reset on restarts, not a financial guarantee.'},
 {id:'SEC-5',severity:'medium',name:'Cross-origin behavior',status:protection.includes('localExtension')&&protection.includes('isSameOrigin')&&!server.includes("origin.startsWith('chrome-extension://')")?'PASS':'REVIEW',evidence:'Production cross-site API requests denied. Local Chrome-extension loopback is development-only.'},
 {id:'SEC-6',severity:'high',name:'Deterministic crisis support',status:crisis.includes('CRISIS_RESPONSE')&&crisis.includes('988')?'PASS':'REVIEW',evidence:'A narrow deterministic guard adds 988 resources in recognized self-harm cases; not comprehensive detection.'},
 {id:'SEC-7',severity:'medium',name:'API key not embedded in extension',status:/OPENAI_API_KEY|sk-[a-zA-Z0-9]{12,}/.test(worker)?'OPEN':'PASS',evidence:'Provider API key is supplied server-side via an environment variable.'},
];
fs.mkdirSync(path.join(root,'safety','results'),{recursive:true});
fs.writeFileSync(path.join(root,'safety','results','security-audit.json'),JSON.stringify(findings,null,2));
let md='# Deployment Security Audit\n\nStatic checks and local unit tests only; not a penetration test.\n\n| Check | Risk | Status | Details |\n|---|---|---|---|\n';
for(const f of findings)md+=`| ${f.name} | ${f.severity} | ${f.status} | ${f.evidence} |\n`;
md+='\n## Limitations\n\nPublic sessions are anonymous and can be obtained by automated clients; origin checks and CSRF are not actual account-based authorization. In-memory throttles reset on restarts, and are not globally coordinated across instances. Use an OpenAI project with **Enforce a hard limit**, independent monitoring, and stronger controls (e.g. edge bot checks and a persistent store) for wider release.\n\n**Release scope:** small hackathon public demo. Do not describe this build as production-secure Gmail protection. The working Gmail extension remains local and explicitly opt-in.\n';
fs.writeFileSync(path.join(root,'safety','results','security-audit.md'),md);
console.log(findings.map(x=>`${x.status.padEnd(6)} ${x.id}: ${x.name}`).join('\n'));
