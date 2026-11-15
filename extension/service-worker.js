const API_BASE = 'http://localhost:4173'; // Replace and add the production host permission before deploying.
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if(message?.type!=='PAUSEPILOT_ANALYZE') return;
  const source=sender?.url || '';
  if(!(source.startsWith('http://localhost:4173/') || source.startsWith('https://mail.google.com/'))) {
    sendResponse({ok:false,error:'Source not supported'});return;
  }
  if(typeof message.text!=='string'||message.text.length>5000||!message.text.trim()) {
    sendResponse({ok:false,error:'Invalid message text'});return;
  }
  (async()=>{
    const controller = new AbortController();
    const timeout=setTimeout(()=>controller.abort(),12000);
    try {
      const response=await fetch(`${API_BASE}/api/analyze`,{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({text:message.text,channel:'email'}),signal:controller.signal
      });
      const data=await response.json();
      if(!response.ok || !['allow','review','urgent'].includes(data.decision)) throw new Error(data.error||'Invalid analysis result');
      sendResponse({ok:true,result:data});
    }catch(e){sendResponse({ok:false,error:'Analysis unavailable; the extension has preserved your draft.'});}
    finally{clearTimeout(timeout);}
  })();
  return true;
});
