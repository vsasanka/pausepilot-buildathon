import fs from 'node:fs';
import { analyzeDraft } from '../lib/classifier.js';
const tasks=fs.readFileSync(new URL('./data/tasks.jsonl', import.meta.url),'utf8').trim().split('\n').map(JSON.parse);
const results=[];
for(const t of tasks){
  const start=Date.now();
  try{const result=await analyzeDraft(t.text);results.push({id:t.id,category:t.category,expected:t.expected,actual:result.decision,passed:t.expected===result.decision,ms:Date.now()-start,mode:result.mode,manual_review:t.manual_review});}
  catch(err){results.push({id:t.id,category:t.category,expected:t.expected,actual:'error',passed:false,error:err.message,ms:Date.now()-start});}
}
const passed=results.filter(r=>r.passed).length;
const tp=results.filter(r=>r.expected!=='allow'&&r.actual!=='allow'&&r.actual!=='error').length;
const fn=results.filter(r=>r.expected!=='allow'&&r.actual==='allow').length;
const fp=results.filter(r=>r.expected==='allow'&&r.actual!=='allow').length;
const tn=results.filter(r=>r.expected==='allow'&&r.actual==='allow').length;
const summary={total:results.length,passed,accuracy:passed/results.length,warningRecall:(tp+fn)?tp/(tp+fn):null,falsePositiveRate:(fp+tn)?fp/(fp+tn):null,mode:process.env.OPENAI_API_KEY?'ai':'demo-rules',manuallyReviewed:0,labelStatus:'PENDING MANUAL REVIEW'};
const out=new URL('./results/',import.meta.url);fs.mkdirSync(out,{recursive:true});
fs.writeFileSync(new URL('results.json',out),JSON.stringify({summary,results},null,2));
fs.writeFileSync(new URL('eval_report.md',out),`# PausePilot evaluation report\n\n- Mode: **${summary.mode}**\n- Cases: **${summary.total}**\n- Exact-match accuracy: **${(summary.accuracy*100).toFixed(1)}%**\n- Warning recall: **${(summary.warningRecall*100).toFixed(1)}%**\n- False-positive rate: **${(summary.falsePositiveRate*100).toFixed(1)}%**\n- Hand-reviewed cases: **0 confirmed** (manual review still required)\n\n> Important: These are synthetic authored templates, not independent real-user validation. Review and correct >=30 expected labels before submission. Compare against a baseline model and inspect failures.\n`);
console.log(JSON.stringify(summary,null,2));
