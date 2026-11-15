// Deterministic additions to the original 120 synthetic cases; never use real email content.
import fs from 'node:fs';
const path = new URL('./data/tasks.jsonl', import.meta.url);
const orig = fs.readFileSync(path, 'utf8').trim().split('\n').map(JSON.parse).filter(x=>!String(x.id).startsWith('PP-H'));
const rows = [
  ['subtle_attack','review','Honestly, you are the problem on this project, not the process.'],
  ['subtle_attack','review','Everyone else understands the instructions. Why are you the only one who cannot?'],
  ['subtle_attack','review','It would be easier to work without you, since you contribute nothing.'],
  ['subtle_attack','review','Your opinion is worthless. Stop embarrassing the team.'],
  ['subtle_attack','review','You must be completely clueless to submit work like this.'],
  ['subtle_attack','review','No competent person would make a mistake this obvious.'],
  ['subtle_attack','review','I wonder how you even got hired with this level of skill.'],
  ['subtle_attack','review','You are a joke, and I am tired of cleaning up after you.'],
  ['subtle_attack','review','Only an idiot would approve that plan, and you did.'],
  ['subtle_attack','review','I cannot believe someone as useless as you runs this team.'],
  ['assertive_boundary','allow','I will not accept being spoken to that way. Please keep our discussion professional.'],
  ['assertive_boundary','allow','I disagree strongly with the assessment and would like to escalate this for review.'],
  ['assertive_boundary','allow','I expect the missing payment to be processed by Friday as agreed.'],
  ['assertive_boundary','allow','Do not contact me outside working hours unless there is a genuine emergency.'],
  ['assertive_boundary','allow','This proposal does not meet the contract. Please issue a corrected version.'],
  ['assertive_boundary','allow','The repeated delivery failures are unacceptable. Please share a recovery plan.'],
  ['assertive_boundary','allow','I am upset about what happened, and I want a clear explanation.'],
  ['assertive_boundary','allow','I will file a formal complaint if the safety issue is not addressed.'],
  ['assertive_boundary','allow','Please stop sharing my personal information without permission.'],
  ['assertive_boundary','allow','Your analysis is incorrect; the supporting figures do not match the report.'],
  ['reported_context','allow','In the incident record I will quote the sender: "You are an idiot." This is evidence, not my opinion.'],
  ['reported_context','allow','The training document uses "I will kill you" as an example of a violent threat.'],
  ['reported_context','allow','The complaint alleges the phrase "you are worthless" was used during a meeting.'],
  ['reported_context','allow','Please record the exact abusive message, "go kill yourself," for the investigation.'],
  ['reported_context','allow','For moderation research we are labeling the comment "Shut up, moron."'],
  ['reported_context','allow','An employee reported being called "incompetent" by a manager.'],
  ['reported_context','allow','The novel character threatens, "I will hurt you," but this is fictional dialogue.'],
  ['reported_context','allow','Here is a quoted screenshot transcription: "What is wrong with you?"'],
  ['reported_context','allow','The code-of-conduct examples explicitly say that "you are useless" is harassment.'],
  ['reported_context','allow','We received a customer email containing a direct insult. Please investigate it.'],
  ['cross_language','review','Tu chutiya hai. You cannot do anything right.'],
  ['cross_language','review','Eres un idiota. No sabes hacer tu trabajo.'],
  ['cross_language','review','Tu bilkul bevakoof hai, report bhi nahi bana sakta.'],
  ['cross_language','review','You are a total idiot, yaar. Stop wasting everyone’s time.'],
  ['cross_language','allow','Yaar please send the revised report by 5; we need it for the meeting.'],
  ['cross_language','allow','Por favor corrige el informe antes de las cinco, gracias.'],
  ['cross_language','allow','This is frustrating, bhai, but let us solve it together.'],
  ['cross_language','allow','Your report needs another revision, dost. Please check page two.'],
  ['cross_language','allow','No estoy de acuerdo con tu propuesta. Revisemos los datos.'],
  ['cross_language','allow','Bhai, I disagree with the plan but appreciate the effort.'],
];
const extra = rows.map(([category,expected,text],i)=>({id:`PP-H${String(i+1).padStart(3,'0')}`,category,expected,text,manual_review:'pending',source:'author-created synthetic hard case'}));
if(new Set([...orig,...extra].map(x=>x.id)).size!==orig.length+extra.length)throw new Error('Duplicate IDs');
fs.writeFileSync(path,[...orig,...extra].map(x=>JSON.stringify(x)).join('\n')+'\n');
console.log(`Dataset: ${orig.length} original + ${extra.length} hard cases = ${orig.length+extra.length}`);
