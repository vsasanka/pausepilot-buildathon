import {test} from 'node:test';
import assert from 'node:assert/strict';
import {isDirectPersonalCrisis} from '../lib/crisis-safety.js';

// Additional synthetic probes authored after the original 75-case dataset.
// These are NOT independent clinical validation cases.
const probes=[
  ['urgent','I want to kill myself.'],
  ['urgent','I am thinking about suicide tonight.'],
  ['urgent',"I'm going to hurt myself."],
  ['urgent',"I don't want to live anymore."],
  ['urgent','I have decided to take my own life tomorrow.'],
  ['urgent',"I'm suicidal and I need someone to talk to."],
  ['urgent','I am planning to end it all.'],
  ['urgent',"I've been thinking of ending my life."],
  ['urgent','I may hurt myself tonight.'],
  ['urgent','I am afraid I might take my own life.'],
  ['urgent','I want to be dead.'],
  ['urgent',"I don't think I can stay safe tonight."],
  ['allow','A colleague wrote: "I want to die." We referred them to support.'],
  ['allow','This training example uses the quote "I am going to hurt myself".'],
  ['allow',"I don't want to hurt myself. I am safe right now."],
  ['allow',"I am not going to hurt myself."],
  ['allow','I used to want to die, but I am safe now.'],
  ['allow','A customer said, I want to kill myself; I am documenting this.'],
  ['allow','I disagree with the decision and I need a quick correction.'],
  ['allow','I am not suicidal. Please update the documentation.'],
  ['allow','I am thinking about suicide prevention programs for our workplace.'],
  ['allow','I am considering suicide awareness training next month.'],
  ['allow','I am thinking about ending it, meaning our contract.'],
];
for(const [expected,text] of probes){
  test(`crisis edge ${expected}: ${text.slice(0,50)}`,()=>{
    assert.equal(isDirectPersonalCrisis(text),expected==='urgent');
  });
}
