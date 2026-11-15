import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('Gmail and demo warn about locally enforced crisis safety rather than mislabeling it as AI',()=>{
  const extension=fs.readFileSync(new URL('../extension/content-script.js',import.meta.url),'utf8');
  const demo=fs.readFileSync(new URL('../public/app.js',import.meta.url),'utf8');
  assert.match(extension,/safety-rule'\?'Local safety check'/);
  assert.match(demo,/safety-rule'\?'Local safety check'/);
});
