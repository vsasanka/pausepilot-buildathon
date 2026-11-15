import { analyzeDraft } from '../lib/classifier.js';

const key=process.env.OPENAI_API_KEY?.trim();
if (!key || key==='YOUR_API_KEY_HERE' || key==='REPLACE_WITH_YOUR_KEY') {
  console.error('No real OPENAI_API_KEY found. Add your private key to .env and rerun npm run smoke:ai.');
  process.exit(1);
}
const cases = [
  {name:'Direct personal insult',expected:'review',text:"You've messed this up again. Do you even read my emails? Fix it immediately."},
  {name:'Firm and professional',expected:'allow',text:'This report contains errors. Please correct the figures by 5 PM.'},
  {name:'Reported abuse, not endorsed',expected:'allow',text:'A customer wrote: "You are an idiot." Please document this in our incident report.'},
  {name:'Ordinary disagreement',expected:'allow',text:'I strongly disagree with this plan. Can we talk through the risks?'},
  {name:'Direct threat',expected:'urgent',text:'I will hurt you if you do not fix this.'},
  {name:'Sarcasm without personal attack',expected:'allow',text:'Oh wonderful, another meeting. Could we discuss this asynchronously instead?'},
];
let matching=0, evaluated=0, errors=0, blocked=false;
console.log('PausePilot LIVE AI smoke test (6 illustrative cases; NOT the hackathon benchmark)');
for (const item of cases) {
  try {
    const out=await analyzeDraft(item.text);
    const matches=out.decision===item.expected;
    matching+=Number(matches); evaluated++;
    console.log(`${matches?'PASS':'REVIEW'} | ${item.name} | expected=${item.expected} actual=${out.decision} mode=${out.mode}`);
    if(!matches)console.log(`   Reason: ${out.reason}`);
  }catch(e){
    errors++;
    console.log(`ERROR | ${item.name} | ${e.message}`);
    if (e.status === 429) {
      blocked = true;
      if (e.apiCode === 'credit_balance_exhausted' || e.apiCode === 'insufficient_quota') {
        console.log('ACTION: Check API credit balance and billing. Retrying immediately will not fix missing credits.');
      } else if (e.apiCode?.includes('spend_limit') || e.apiCode?.includes('usage_limit')) {
        console.log('ACTION: Check organization/project spend and usage limits.');
      } else {
        console.log('ACTION: Inspect account limits and the API error code. If it is a temporary rate limit, retry later.');
      }
      if (e.retryAfterSeconds !== undefined) console.log(`Retry-After: ${e.retryAfterSeconds} seconds`);
      console.log('STOPPED: Remaining API calls skipped after the first HTTP 429.');
      break;
    }
  }
}
console.log(`Results: ${matching}/${evaluated} evaluated cases matched; ${errors} API errors; ${cases.length - evaluated - errors} unattempted.`);
if (blocked) process.exitCode = 1;
console.log('Manual review and broader evaluation are still required.');
