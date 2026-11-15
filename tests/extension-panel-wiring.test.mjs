import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const base=path.join(path.dirname(fileURLToPath(import.meta.url)),'../extension');
const source=readFileSync(path.join(base,'movement-monitor.js'),'utf8');

// The movement UI is rendered into a shadow DOM from a template string.
// Ensure every queried control actually exists in the rendered markup, rather
// than simply matching references to variables in a unit test. The v0.4.3
// regression came from attaching a listener to an absent #pause element.
test('every queried element in the extension movement panel is rendered',()=>{
  const declared=new Set([...source.matchAll(/\bid=["']([A-Za-z][\w-]*)["']/g)].map(m=>m[1]));
  const selectors=new Set([...source.matchAll(/\$\(['"]([A-Za-z][\w-]*)['"]\)/g)].map(m=>m[1]));
  const missing=[...selectors].filter(id=>!declared.has(id));
  assert.deepEqual(missing,[],`Shadow DOM elements queried but not present: ${missing.join(', ')}`);
  for (const control of ['reset','playSound','stopSound','breathe','autoSound','stop']) assert.ok(selectors.has(control));
});

test('extension revision includes the corrected controls without changing email send logic',()=>{
  const manifest=JSON.parse(readFileSync(path.join(base,'manifest.json'),'utf8'));
  assert.equal(manifest.version,'0.4.6');
  assert.ok(manifest.content_scripts[1].js.includes('movement-monitor.js'));
  assert.ok(!source.includes("$('pause')"));
  assert.ok(source.includes("$('playSound').addEventListener('click'"));
  assert.ok(source.includes("$('reset').addEventListener('click'"));
});
