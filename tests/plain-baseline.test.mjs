import {test} from 'node:test';import assert from 'node:assert/strict';
import {analyzeWithPlainModel} from '../lib/plain-baseline.js';
test('plain baseline uses same strict schema and a minimally instructed prompt',async()=>{
 let sent;
 const fetchImpl=async(_url,opts)=>{sent=JSON.parse(opts.body);return {ok:true,json:async()=>({choices:[{finish_reason:'stop',message:{content:JSON.stringify({decision:'review',reason:'Potential insult',evidence:'tone',suggestion:'Rephrase'})}}]})};};
 const answer=await analyzeWithPlainModel('You are an idiot',{apiKey:'test-only',fetchImpl});
 assert.equal(answer.decision,'review');assert.equal(answer.mode,'plain-llm-baseline');
 assert.equal(sent.response_format.json_schema.strict,true);
 assert.equal(sent.temperature,0);
 assert.ok(!sent.messages[0].content.includes('professional but firm criticism')); // no expert rubric injected
});
test('provider error fails visibly and never returns allow',async()=>{
 const fetchImpl=async()=>({ok:false,status:429,json:async()=>({error:{code:'insufficient_quota'}})});
 await assert.rejects(analyzeWithPlainModel('Hello',{apiKey:'test-only',fetchImpl}),/429/);
});
