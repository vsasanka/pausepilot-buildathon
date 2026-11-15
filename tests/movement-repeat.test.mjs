import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.join(path.dirname(fileURLToPath(import.meta.url)),'../extension');
const ctx={};ctx.globalThis=ctx;vm.runInNewContext(readFileSync(path.join(root,'movement-engine.js'),'utf8'),ctx);
const make=ctx.PausePilotMovement.createAlertGate;
test('an alert needs two observed changed windows',()=>{
 const gate=make();assert.equal(gate.observe('changed',1000).alert,false);assert.equal(gate.observe('changed',1450).alert,true);
});
test('sustained zigzag movement does not repeatedly alert',()=>{
 const gate=make();gate.observe('changed',1000);assert.equal(gate.observe('changed',1450).alert,true);
 for(let t=1900;t<45000;t+=450)assert.equal(gate.observe('changed',t).alert,false);
 assert.equal(gate.snapshot().alerts,1);
});
test('fresh movement episode can alert again after recovery and cooldown',()=>{
 const gate=make();gate.observe('changed',1000);gate.observe('changed',1450);
 gate.observe('idle',6000);
 assert.equal(gate.observe('changed',6500).alert,false);
 assert.equal(gate.observe('changed',7000).alert,false); // cooldown
 gate.observe('idle',22000);
 gate.observe('changed',23000);assert.equal(gate.observe('changed',23500).alert,true);
 assert.equal(gate.snapshot().alerts,2);
});
test('two normal windows re-arm after a change',()=>{
 const gate=make();gate.observe('changed',1000);gate.observe('changed',1450);
 gate.observe('usual',6000);assert.equal(gate.snapshot().armed,false);
 gate.observe('usual',6500);assert.equal(gate.snapshot().armed,true);
 gate.observe('changed',26000);assert.equal(gate.observe('changed',26500).alert,true);
});
test('quiet period prevents an alert even with changed movement',()=>{
 const gate=make();gate.observe('changed',1000,15000);assert.equal(gate.observe('changed',2000,15000).alert,false);
 assert.equal(gate.observe('changed',16000,15000).alert,true);
});
test('no-activity comparison cannot create alerts',()=>{
 const gate=make();gate.observe('insufficient',1000);gate.observe('insufficient',6000);assert.equal(gate.snapshot().alerts,0);
});
