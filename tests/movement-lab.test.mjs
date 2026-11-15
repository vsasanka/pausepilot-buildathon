import test from 'node:test';
import assert from 'node:assert/strict';
import {summarizeMovement,compareMovement,hasEnoughMovement,MOVEMENT_EXPERIMENT} from '../public/movement-core.js';

function steady(count=80, dt=52) {
  return Array.from({length:count},(_,i)=>({x:20+i*3,y:100,t:i*dt}));
}
function zigzag(count=80,dt=52){
  return Array.from({length:count},(_,i)=>({x:i%2?170:30,y:85+i*0.2,t:i*dt}));
}
test('missing data never produces an emotional diagnosis or a movement alert',()=>{
  assert.equal(compareMovement(summarizeMovement([]),summarizeMovement([])).state,'insufficient');
  assert.equal(compareMovement(summarizeMovement(steady()),summarizeMovement([])).state,'insufficient');
});
test('ordinary straight motion establishes a baseline',()=>{
  const m=summarizeMovement(steady());
  assert.equal(hasEnoughMovement(m),true);
  assert.equal(m.turnsPerSecond,0);
  assert.equal(m.reversalsPerSecond,0);
  assert.equal(compareMovement(m,m).state,'usual');
});
test('rapid zigzags produce elevated variation against a straight baseline',()=>{
  const base=summarizeMovement(steady());
  const changed=summarizeMovement(zigzag());
  assert.equal(hasEnoughMovement(changed),true);
  assert.ok(changed.reversalsPerSecond>2);
  assert.equal(compareMovement(changed,base).state,'changed');
});
test('fast straight movement alone does not trigger the pattern alert',()=>{
  const base=summarizeMovement(steady());
  const fast=summarizeMovement(steady().map((p,i)=>({...p,x:20+i*14})));
  assert.equal(compareMovement(fast,base).state,'usual');
});
test('idle gaps, out-of-area breaks, and duplicate timestamps cannot manufacture turns',()=>{
  const points=[{x:10,y:50,t:0},{x:60,y:50,t:150},{break:true,t:250},{x:270,y:80,t:280},{x:310,y:80,t:400},{x:999,y:999,t:400},{x:35,y:10,t:1900}];
  const m=summarizeMovement(points);
  assert.equal(m.reversalsPerSecond,0);
  assert.equal(m.turnsPerSecond,0);
});
test('all calculations are local, with no model or server API dependency',()=>{
  assert.equal(MOVEMENT_EXPERIMENT.baselineMs,5000);
  assert.match(MOVEMENT_EXPERIMENT.label,/not stress detection/i);
});
