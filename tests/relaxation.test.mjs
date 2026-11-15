import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {runInNewContext} from 'node:vm';
const root=path.join(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>readFileSync(path.join(root,p),'utf8');
const g={setTimeout,clearTimeout}; runInNewContext(read('public/relaxation-core.js'),g);
const R=g.PausePilotRelaxation;
class Param {value=0;setValueAtTime(v){this.value=v;}setTargetAtTime(v){this.value=v;}linearRampToValueAtTime(v){this.value=v;}exponentialRampToValueAtTime(v){this.value=v;}cancelScheduledValues(){}}
class Node {gain=new Param();frequency=new Param();type='';connect(){return this;}disconnect(){} start(){}stop(){}}
class FakeContext {state='running';sampleRate=1000;currentTime=0;destination=new Node();createGain(){return new Node();}createBiquadFilter(){return new Node();}createBuffer(){return {getChannelData:()=>new Float32Array(2000)}}createBufferSource(){return new Node();}createOscillator(){return new Node();}async resume(){this.state='running';}async suspend(){this.state='suspended';}async close(){this.state='closed';}}
test('shared audio engine is identical in website and Chrome extension',()=>assert.equal(read('public/relaxation-core.js'),read('extension/relaxation-core.js')));
test('original soundscapes available with no external network or persistent stores',()=>{
 assert.deepEqual(Array.from(R.SOUNDS),['rain','ocean','forest']);
 for(const forbidden of ['fetch(','XMLHttpRequest','sendBeacon','localStorage','sessionStorage','indexedDB','chrome.storage']) assert.equal(read('public/relaxation-core.js').includes(forbidden),false,forbidden);
});
test('breathing cues remain gentle and cycle continuously',()=>{
 assert.equal(R.breathingPhase(0).name,'Inhale gently');
 assert.equal(R.breathingPhase(3999).name,'Inhale gently');
 assert.equal(R.breathingPhase(4000).name,'Exhale slowly');
 assert.equal(R.breathingPhase(9999).name,'Exhale slowly');
 assert.equal(R.breathingPhase(10000).name,'Inhale gently');
});
test('automatic sounds default off and require explicit arm',async()=>{
 const e=R.createEngine({AudioContextClass:FakeContext,clock:()=>100000});
 assert.equal(e.state().autoArmed,false);
 assert.equal(await e.onPatternAlert(),false);
 assert.equal(e.state().playing,false);
 await e.armAutomatic(true);
 assert.equal(await e.onPatternAlert(),true);
 assert.equal(e.state().playing,true);
 await e.dispose();
});
test('automatic sound respects cooldown and never starts twice while playing',async()=>{
 let t=100000;const e=R.createEngine({AudioContextClass:FakeContext,clock:()=>t});
 await e.armAutomatic(true);assert.equal(await e.onPatternAlert(),true);
 assert.equal(await e.onPatternAlert(),false);
 e.stop();t+=45000;assert.equal(await e.onPatternAlert(),false);
 t+=46000;assert.equal(await e.onPatternAlert(),true);
 await e.dispose();
});
test('volume is bounded, and stop releases audio immediately',async()=>{
 const e=R.createEngine({AudioContextClass:FakeContext});
 e.preferences({sound:'not-a-sound',level:100,seconds:999});
 assert.equal(e.state().chosen,'rain');assert.equal(e.state().volume,0.16);assert.equal(e.state().durationSec,60);
 await e.play({sound:'ocean',level:0,seconds:10});
 assert.equal(e.state().playing,true);assert.equal(e.state().volume,0);assert.equal(e.state().sound,'ocean');
 e.stop();assert.equal(e.state().playing,false);await e.dispose();
});
test('web controls are present, optional and dedicated to movement lab',()=>{
 const html=read('public/index.html');
 for(const id of ['relaxStudio','relaxPlay','relaxStop','relaxAuto','relaxBreathe','relaxNudgePlay','relaxNudgeQuiet'])assert.match(html,new RegExp(`id="${id}"`));
 assert.match(read('public/relaxation-studio.js'),/engine\.onPatternAlert/);
 assert.match(read('public/relaxation-studio.js'),/prefers-reduced-motion/);
});
test('extension only changes movement UI; email interception and service-worker remain separate',()=>{
 const manifest=JSON.parse(read('extension/manifest.json'));
 assert.equal(manifest.version,'0.4.6');
 assert.ok(manifest.content_scripts[1].js.includes('relaxation-core.js'));
 assert.equal(manifest.content_scripts[0].js.includes('movement-monitor.js'),false);
 assert.match(read('extension/movement-monitor.js'),/id="autoSound" type="checkbox"/);
 assert.ok(read('extension/movement-monitor.js').includes("if($('autoSound').checked&&relax)"));
});
