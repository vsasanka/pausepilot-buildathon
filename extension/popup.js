const master=document.getElementById('enabled');
const gmail=document.getElementById('gmailEnabled');
const state=document.getElementById('state');
const movement=document.getElementById('movementEnabled');
function render(){state.textContent=!master.checked?'PausePilot disabled':`PausePilot ON · Gmail ${gmail.checked?'ON':'OFF'} · Movement ${movement.checked?'ON':'OFF'}`;}
chrome.storage.local.get({enabled:false,gmailEnabled:false,movementEnabled:false},v=>{master.checked=!!v.enabled;gmail.checked=!!v.gmailEnabled;movement.checked=!!v.movementEnabled;render();});
master.addEventListener('change',async()=>{await chrome.storage.local.set({enabled:master.checked});render();});
gmail.addEventListener('change',async()=>{await chrome.storage.local.set({gmailEnabled:gmail.checked});render();});
movement.addEventListener('change',async()=>{await chrome.storage.local.set({movementEnabled:movement.checked});render();});
fetch('http://localhost:4173/api/health',{cache:'no-store'})
 .then(r=>{if(!r.ok)throw Error('offline');return r.json();})
 .then(v=>{document.getElementById('apiMode').textContent=v.mode==='ai'?'Analyzer: AI configured':'Analyzer: rule-based demo';})
 .catch(()=>{document.getElementById('apiMode').textContent='Analyzer: local server unreachable';});

// Opens a separate tab: no background metrics collection or Gmail overlay clutter.
document.getElementById('openInsights')?.addEventListener('click',()=>chrome.tabs.create({url:chrome.runtime.getURL('insights.html')}));
