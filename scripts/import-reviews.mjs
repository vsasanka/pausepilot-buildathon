// Updates the evaluation JSONL only with explicit reviewer entries from the CSV worksheet.
import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const args=process.argv.slice(2);
const dataset=(args.find(s=>s.startsWith('--dataset='))||'--dataset=eval').split('=')[1];
if(!['eval','safety'].includes(dataset))throw Error('Use --dataset=eval or --dataset=safety');
if(!args.includes('--apply'))throw Error('This mutates expected labels; pass --apply after carefully reviewing the CSV');
const dataDir=path.join(root,dataset,'data');
const csv=fs.readFileSync(path.join(dataDir,'manual_review_queue.csv'),'utf8');
function splitCsv(s){const out=[];let row=[],part='',quoted=false;for(let i=0;i<s.length;i++){const c=s[i];if(c==='"'){if(quoted&&s[i+1]==='"'){part+='"';i++;}else quoted=!quoted;}else if(c===','&&!quoted){row.push(part);part='';}else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&s[i+1]==='\n')i++;row.push(part);if(row.some(x=>x!==''))out.push(row);row=[];part='';}else part+=c;}if(part||row.length){row.push(part);out.push(row);}if(quoted)throw Error('Unclosed CSV quote');return out;}
const [headers,...records]=splitCsv(csv);const index=Object.fromEntries(headers.map((h,i)=>[h,i]));
for(const field of ['id','reviewer_label','reviewer_name'])if(!(field in index))throw Error('CSV missing '+field);
const file=path.join(dataDir,dataset==='eval'?'tasks.jsonl':'redteam.jsonl');
const cases=fs.readFileSync(file,'utf8').trim().split('\n').map(JSON.parse);
const byId=new Map(cases.map(x=>[x.id,x]));let count=0;
for(const rec of records){const id=rec[index.id],label=(rec[index.reviewer_label]||'').trim(),reviewer=(rec[index.reviewer_name]||'').trim();if(!label&&!reviewer)continue;
 if(!['allow','review','urgent'].includes(label)||!reviewer)throw Error('Incomplete reviewer entry for '+id);
 if(!byId.has(id))throw Error('Unknown case '+id);
 const item=byId.get(id);item.expected=label;item.reviewer=reviewer;item.manual_review='approved';item.review_notes=(rec[index.review_notes]||'').slice(0,800);count++;
}
if(!count)throw Error('No completed reviews found; enter reviewer_label and reviewer_name in the CSV');
fs.writeFileSync(file,cases.map(x=>JSON.stringify(x)).join('\n')+'\n');
console.log(`Recorded ${count} verified human review entries in ${dataset} JSONL. Rerun Phase 4 benchmark for revised scores.`);
