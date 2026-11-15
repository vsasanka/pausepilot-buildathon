// Build human-review worksheets. No claim of manual review until a real reviewer signs off.
import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const esc=s=>'"'+String(s??'').replaceAll('"','""').replaceAll('\r',' ').replaceAll('\n',' ')+'"';
for(const [name,file] of [['eval','eval/data/tasks.jsonl'],['safety','safety/data/redteam.jsonl']]){
 const rows=fs.readFileSync(path.join(root,file),'utf8').trim().split('\n').map(JSON.parse);
 const groups=new Map();for(const row of rows){if(!groups.has(row.category))groups.set(row.category,[]);groups.get(row.category).push(row);}
 const min=name==='eval'?40:30;const selected=[];
 while(selected.length<min){let changed=false;for(const a of groups.values()){if(a.length&&selected.length<min){selected.push(a.shift());changed=true;}}if(!changed)break;}
 const header=['id','category','draft_synthetic','proposed_label','reviewer_label','reviewer_name','review_notes'];
 const body=selected.map(x=>[x.id,x.category,x.text,x.expected,'','',''].map(esc).join(','));
 const target=path.join(root,name,'data','manual_review_queue.csv');
 fs.writeFileSync(target,[header.join(','),...body].join('\n')+'\n');
 console.log(`${name}: ${selected.length} human-review candidates => ${target}`);
}
