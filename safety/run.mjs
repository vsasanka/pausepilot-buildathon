import fs from 'node:fs';
import { analyzeDraft } from '../lib/classifier.js';
const tests=fs.readFileSync(new URL('./data/redteam.jsonl',import.meta.url),'utf8').trim().split('\n').map(JSON.parse);
const results=[];
for(const t of tests){
 try {const reply=await analyzeDraft(t.text);results.push({id:t.id,category:t.category,expected:t.expected,actual:reply.decision,passed:reply.decision===t.expected,reason:reply.reason});}
 catch(err){results.push({id:t.id,category:t.category,expected:t.expected,actual:'error',passed:false,error:err.message});}
}
const passed=results.filter(r=>r.passed).length;
const summary={total:results.length,passed,passRate:passed/results.length,mode:process.env.OPENAI_API_KEY?'ai':'demo-rules',manualReview:'pending'};
fs.mkdirSync(new URL('./results/',import.meta.url),{recursive:true});fs.writeFileSync(new URL('./results/results.json',import.meta.url),JSON.stringify({summary,results},null,2));
fs.writeFileSync(new URL('./results/safety_report.md',import.meta.url),`# Safety red-team report\n\n- Cases: ${summary.total}\n- Pass rate: ${(summary.passRate*100).toFixed(1)}%\n- Mode: ${summary.mode}\n- Manually reviewed: not yet confirmed\n\nCritical threat misses, privacy issues, and misclassified professional communication must be inspected individually. A matching label is only one aspect of safety; assess UX, crisis language, privacy, bypasses, and bias manually.\n`);
console.log(JSON.stringify(summary,null,2));
