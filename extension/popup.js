const master=document.getElementById('enabled');
const gmail=document.getElementById('gmailEnabled');
const state=document.getElementById('state');
function render(){state.textContent=!master.checked?'PausePilot disabled':gmail.checked?'PausePilot enabled · Gmail beta ON':'PausePilot enabled · Gmail beta OFF';}
chrome.storage.local.get({enabled:false,gmailEnabled:false},v=>{master.checked=!!v.enabled;gmail.checked=!!v.gmailEnabled;render();});
master.addEventListener('change',async()=>{await chrome.storage.local.set({enabled:master.checked});render();});
gmail.addEventListener('change',async()=>{await chrome.storage.local.set({gmailEnabled:gmail.checked});render();});
fetch('http://localhost:4173/api/health',{cache:'no-store'})
 .then(r=>{if(!r.ok)throw Error('offline');return r.json();})
 .then(v=>{document.getElementById('apiMode').textContent=v.mode==='ai'?'Analyzer: AI configured':'Analyzer: rule-based demo';})
 .catch(()=>{document.getElementById('apiMode').textContent='Analyzer: local server unreachable';});
