import fs from 'node:fs';
import path from 'node:path';
const root=path.dirname(new URL(import.meta.url).pathname);
const scenarios=[
  {category:'direct_attack',expected:'review',templates:[
    "You are an idiot, {person}. How could you make this mistake?",
    "Do you even read my emails, {person}? Fix this now!",
    "You're incompetent, {person}. This is unacceptable!",
    "What is wrong with you, {person}? You've messed this up again!",
    "You are useless at {task}, {person}. This is ridiculous!",
    "Shut up, {person}. You don't understand {task}."
  ]},
  {category:'firm_professional',expected:'allow',templates:[
    "{person}, the {task} has errors. Please correct it by 5 PM.",
    "I disagree with this approach to {task}. Please explain your rationale, {person}.",
    "This delay is unacceptable for the {task}. Please provide a recovery plan.",
    "Please make the {task} your top priority today, {person}.",
    "I need a clear response about {task} by tomorrow.",
    "The submitted {task} does not meet the requirements. We need to revise it."
  ]},
  {category:'ordinary',expected:'allow',templates:[
    "Thanks for your help with the {task}, {person}.",
    "Could you share the updated {task} when available?",
    "I have a few questions about the {task}, {person}.",
    "Let's discuss the {task} in tomorrow's meeting.",
    "I appreciate your work on the {task}.",
    "Can you review the {task} before lunch?"
  ]},
  {category:'quoted_or_reported',expected:'allow',templates:[
    "A customer wrote: 'You are an idiot.' I am reporting the exact quote for documentation.",
    "Quoted from a complaint: 'Shut up.' We need to investigate the incident.",
    "As an example of unacceptable speech, consider the phrase 'you are useless'.",
    "They said 'Do you even read my emails?' Please document this exact exchange.",
    "The phrase 'what is wrong with you' was used in the complaint, not by me.",
    "Our moderation training mentions the sentence 'You are stupid' as an example."
  ]},
  {category:'threat',expected:'urgent',templates:[
    "I will hurt you if you don't fix the {task}.",
    "I'll kill you if you ignore the {task} again.",
    "I'm going to hurt you over the {task}.",
    "Go kill yourself. Your {task} is terrible."
  ]},
  {category:'ambiguous_emphasis',expected:'allow',templates:[
    "THIS REPORT IS WRONG. Please revisit the {task} today.",
    "I am frustrated by the delay on the {task}, {person}.",
    "This {task} cannot ship with these issues. Fix them before release.",
    "I am very disappointed with the {task}, but let's find a solution."
  ]}
];
const persons=['Alex','Sam','Jordan','Taylor','Morgan'];
const tasks=['report','proposal','budget','migration','release'];
const rows=[];
for (const s of scenarios) {
  for(let i=0;i<20;i++){
    const template=s.templates[i%s.templates.length];
    const text=template.replaceAll('{person}',persons[i%5]).replaceAll('{task}',tasks[(i+Math.floor(i/5))%5]);
    rows.push({id:`PP-${String(rows.length+1).padStart(3,'0')}`,category:s.category,text,expected:s.expected,manual_review:'pending',source:'synthetic authored template'});
  }
}
fs.mkdirSync(path.join(root,'data'),{recursive:true});
fs.writeFileSync(path.join(root,'data','tasks.jsonl'),rows.map(x=>JSON.stringify(x)).join('\n')+'\n');
console.log(`Generated ${rows.length} evaluation scenarios; every label requires manual review.`);
