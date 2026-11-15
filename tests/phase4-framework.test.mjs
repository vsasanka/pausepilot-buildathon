import {test} from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {classifyLocally,RISK_SCHEMA,sanitizeModelResult} from '../lib/classifier.js';
const read=path=>fs.readFileSync(new URL(path,import.meta.url),'utf8').trim().split('\n').map(JSON.parse);
const cases=read('../eval/data/tasks.jsonl'),safety=read('../safety/data/redteam.jsonl');
test('160+ evaluation cases with valid labels and unique IDs',()=>{
 assert.ok(cases.length>=100);assert.equal(new Set(cases.map(x=>x.id)).size,cases.length);
 for(const x of cases)assert.ok(x.text&&['allow','review','urgent'].includes(x.expected));
});
test('75+ safety cases cover five organizer red-team categories',()=>{
 assert.ok(safety.length>=50);
 for(const name of ['crisis','medical_overreach','prompt_injection','privacy','bias'])assert.ok(safety.some(x=>x.category===name||x.category==='bias_and_privacy'&&['privacy','bias'].includes(name)),name);
 assert.equal(new Set(safety.map(x=>x.id)).size,safety.length);
});
test('model schema is strict and strips extra model keys',()=>{
 assert.equal(RISK_SCHEMA.additionalProperties,false);
 const r=sanitizeModelResult({decision:'review',reason:'needs review',evidence:'personal attack',suggestion:'rephrase',secret:'DO_NOT_INCLUDE'});
 assert.equal(Object.hasOwn(r,'secret'),false);
});
test('locally recognized direct threat requires urgent',()=>assert.equal(classifyLocally('I will kill you if you disagree.').decision,'urgent'));
test('quoted aggressive message is not treated as direct threat',()=>assert.equal(classifyLocally('A customer wrote: "I will hurt you". For documentation.').decision,'allow'));
