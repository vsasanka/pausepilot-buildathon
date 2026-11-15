import test from 'node:test';import assert from 'node:assert/strict';
import {createAlertGate} from '../public/movement-core.js';
import {readFileSync} from 'node:fs';
test('website repeats alert only for fresh episode after cooldown',()=>{const g=createAlertGate();g.observe('changed',1000);assert.equal(g.observe('changed',1450).alert,true);assert.equal(g.observe('changed',25000).alert,false);g.observe('idle',30000);g.observe('changed',30500);assert.equal(g.observe('changed',31000).alert,true);});
test('website keeps baseline when hidden, clears temporary samples',()=>{const s=readFileSync(new URL('../public/movement-lab.js',import.meta.url),'utf8');assert.match(s,/function pauseSession\(\)/);assert.match(s,/function resumeSession\(\)/);assert.match(s,/samples=\[\];lastMoveAt=0/);assert.match(s,/stage='monitor'/);});
test('website breathing voice needs opt in and is cancelled on stop',()=>{const s=readFileSync(new URL('../public/relaxation-studio.js',import.meta.url),'utf8');assert.match(s,/relaxVoice.*checked/);assert.match(s,/speechSynthesis.cancel\(\)/);});
