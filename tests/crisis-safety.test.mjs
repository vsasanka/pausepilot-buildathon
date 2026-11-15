import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {isDirectPersonalCrisis, ensureCrisisResources} from '../lib/crisis-safety.js';
import {analyzeDraft} from '../lib/classifier.js';

const safety=fs.readFileSync(new URL('../safety/data/redteam.jsonl',import.meta.url),'utf8').trim().split('\n').map(JSON.parse);
const knownCrisis=safety.filter(x=>x.category==='crisis');
const crisisQuotes=safety.filter(x=>x.category==='crisis_quote');

test('all eight first-person crisis safety cases trigger a local urgent response and resources',()=>{
  assert.equal(knownCrisis.length,8);
  for(const row of knownCrisis){
    assert.equal(isDirectPersonalCrisis(row.text),true,row.id);
    const result=ensureCrisisResources(row.text,{decision:'allow',reason:'no',suggestion:''});
    assert.equal(result.decision,'urgent',row.id);
    assert.match(result.reason+' '+result.suggestion,/988/,row.id);
    assert.equal(result.safetyGuard,true,row.id);
    assert.ok(result.suggestion.length<=200,row.id);
  }
});

test('quoted crisis examples are not promoted to urgent',()=>{
  assert.ok(crisisQuotes.length>=2);
  for(const row of crisisQuotes)assert.equal(isDirectPersonalCrisis(row.text),false,row.id);
  for(const text of [
    'The phrase "I am thinking of killing myself" appears in a training guide.',
    'A customer wrote: "I want to end my life." We escalated the ticket.',
    'I said "I want to die" in a fictional script, not as a message about myself.',
    'I do not want to harm myself. I am safe and requesting a correction.',
    'I am not suicidal, and I am safe right now.',
    'I strongly disagree with this decision. Please respond.',
  ])assert.equal(isDirectPersonalCrisis(text),false,text);
});

test('a clear direct first-person crisis outside a reported quote still triggers',()=>{
  assert.equal(isDirectPersonalCrisis('Someone wrote: "I want to die." I am thinking of killing myself tonight.'),true);
});

test('crisis response is available without internet, an API key, or model approval',async()=>{
  let invoked=false;
  const result=await analyzeDraft('I am thinking of killing myself tonight.',{}, {
    apiKey:'fake', fetchImpl:async()=>{invoked=true;throw Error('Should never send this draft to an AI service');},
  });
  assert.equal(invoked,false);
  assert.equal(result.decision,'urgent');
  assert.equal(result.mode,'safety-rule');
  assert.match(result.suggestion,/988/);
  assert.doesNotMatch(result.reason+' '+result.suggestion,/you are diagnosed/i);
});

test('a reported self-harm quotation continues to the normal AI classifier',async()=>{
  const response=await analyzeDraft('A patient wrote: "I have a plan to hurt myself." We are documenting this.',{}, {
    apiKey:'fake', fetchImpl:async()=>({ok:true,async json(){return {choices:[{finish_reason:'stop',message:{content:JSON.stringify({decision:'allow',reason:'Reported quote',evidence:'Report',suggestion:''})}}]};}}),
  });
  assert.equal(response.decision,'allow');
  assert.equal(response.mode,'ai');
});
