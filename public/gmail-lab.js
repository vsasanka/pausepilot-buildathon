let sent=0;
const result=document.getElementById('result'),native=document.getElementById('nativeSend');
function display(){const root=document.documentElement;result.textContent=`Simulated sends: ${sent} · Last extension action: ${root.dataset.ppLastState||'none'} · Decision: ${root.dataset.ppLastDecision||'-'}`;document.getElementById('status').textContent=root.dataset.ppGmailEnabled==='enabled'?'Gmail beta enabled':'Gmail beta disabled or extension unavailable';}
native.addEventListener('click',()=>{sent++;display();});
native.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();native.click();}});
document.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key==='Enter' && e.target.id==='body'){e.preventDefault();sent++;display();}});
document.addEventListener('pausepilot:lab-state',display);
new MutationObserver(display).observe(document.documentElement,{attributes:true,attributeFilter:['data-pp-gmail-enabled','data-pp-last-state','data-pp-last-decision']});
display();
