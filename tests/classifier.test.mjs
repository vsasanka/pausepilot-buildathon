import {test} from 'node:test';
import assert from 'node:assert/strict';
import {classifyLocally} from '../lib/classifier.js';
const tests=[
 ["You've messed this up again. Do you even read my emails?",'review'],
 ['Please correct the figures by 5 PM.','allow'],
 ['I disagree with this decision.','allow'],
 ['You are an idiot.','review'],
 ['I will hurt you if you do not comply.','urgent'],
 ['A customer wrote: "You are an idiot." I am reporting the wording.','allow']
];
for(const [input,expected] of tests)test(`Classifies ${JSON.stringify(input.slice(0,40))}`,()=>assert.equal(classifyLocally(input).decision,expected));
