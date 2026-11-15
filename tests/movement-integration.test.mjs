import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const fromPublic = path => readFile(new URL('../public/'+path,import.meta.url),'utf8');

test('movement lab is opt-in and keeps existing email/comment selectors',async()=>{
  const html=await fromPublic('index.html');
  assert.match(html,/id="movementTab"/);
  assert.match(html,/id="movementLab" hidden/);
  assert.match(html,/id="motionStart"/);
  assert.match(html,/data-feature="email"/);
  assert.match(html,/data-feature="comment"/);
  assert.match(html,/type="module" src="\/movement-lab.js"/);
});
test('movement listeners are limited to pad and no motion data is sent or persisted',async()=>{
  const script=await fromPublic('movement-lab.js');
  assert.match(script,/pad\.addEventListener\('pointermove',onMove/);
  assert.match(script,/if\(!running \|\| event\.pointerType!==\x27mouse\x27/);
  assert.doesNotMatch(script,/\b(fetch|XMLHttpRequest|sendBeacon|localStorage|sessionStorage|indexedDB)\s*\(/);
  assert.match(script,/samples=\[\]/);
  assert.match(script,/visibilitychange/);
});
