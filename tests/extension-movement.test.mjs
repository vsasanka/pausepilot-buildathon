import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=join(dirname(fileURLToPath(import.meta.url)),'../extension');
const code=name=>readFileSync(join(root,name),'utf8');
const c={};c.globalThis=c;vm.runInNewContext(code('movement-engine.js'),c);
const {summarizeMovement,compareMovement,hasEnoughMovement,MOVEMENT_EXPERIMENT}=c.PausePilotMovement;
const steady=(count=80,scale=3)=>Array.from({length:count},(_,i)=>({x:20+i*scale,y:100,t:i*52}));
const zigzag=(count=80)=>Array.from({length:count},(_,i)=>({x:i%2?170:30,y:85+i*.2,t:i*52}));
const manifest=JSON.parse(code('manifest.json'));
test('manifest supports Gmail, local, and hosted PausePilot only',()=>{
 const lab=manifest.content_scripts.find(s=>s.js.includes('movement-monitor.js'));
 assert.deepEqual(lab.matches,['http://localhost:4173/*','https://mail.google.com/*','https://pausepilot-buildathon-demo.onrender.com/*']);
 assert.equal(manifest.manifest_version,3);
 assert.equal(lab.run_at,'document_idle');
 assert.ok(!manifest.permissions.includes('tabs'));
});
test('Gmail Send Guard remains independent and previous content script byte-identical',()=>{
 assert.equal(manifest.content_scripts[0].js.at(-1),'content-script.js');
 assert.ok(!code('content-script.js').includes('movementEnabled'));
 assert.match(code('service-worker.js'),/PAUSEPILOT_ANALYZE/);
});
test('movement needs explicit opt in and master toggle',()=>{
 const src=code('movement-monitor.js');
 assert.match(src,/master&&consent/);
 assert.match(src,/movementEnabled:false/);
 assert.match(code('popup.js'),/movementEnabled/);
});
test('no movement coordinates uploaded or persisted',()=>{
 const src=code('movement-monitor.js');
 for(const text of ['fetch(', 'XMLHttpRequest','sendBeacon(', 'localStorage','sessionStorage','indexedDB','PAUSEPILOT_ANALYZE'])assert.equal(src.includes(text),false,text);
 assert.match(src,/samples\.length>175/);
 assert.match(src,/window\.removeEventListener\('pointermove'/);
 assert.match(src,/document\.addEventListener\('visibilitychange'/);
});
test('calibration requires enough movement',()=>{
 assert.equal(MOVEMENT_EXPERIMENT.baselineMs,5000);
 assert.equal(hasEnoughMovement(summarizeMovement(steady())),true);
 assert.equal(compareMovement(summarizeMovement([]),summarizeMovement(steady())).state,'insufficient');
});
test('rapid zigzags alert against steady personal baseline',()=>{
 assert.equal(compareMovement(summarizeMovement(zigzag()),summarizeMovement(steady())).state,'changed');
});
test('fast straight pointer travel alone does not alert',()=>{
 assert.equal(compareMovement(summarizeMovement(steady(80,15)),summarizeMovement(steady())).state,'usual');
});
test('no false alert from duplicate timestamps and idle gaps',()=>{
 const samples=[{x:10,y:10,t:0},{x:100,y:10,t:100},{x:1000,y:10,t:100},{x:5,y:5,t:3000}];
 assert.equal(summarizeMovement(samples).reversalsPerSecond,0);
});
test('analysis is framed as movement variation, not a stress diagnosis',()=>{
 assert.match(code('movement-monitor.js'),/not a stress diagnosis/i);
 assert.match(MOVEMENT_EXPERIMENT.label,/not stress detection/i);
});
