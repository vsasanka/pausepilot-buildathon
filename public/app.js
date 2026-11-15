(() => {
  'use strict';
  const $=id=>document.getElementById(id);
  const form=$('demoCompose'), textarea=$('messageBody'), activity=$('activity');
  const modal=$('modal');let processing=false,reviewedText='',pendingResult=null,returnFocus=null;
  let csrfPromise=null;
  let currentFeature='email';
  const drafts={email: textarea.value,comment:''};
  const defaultFeatures=[
    {id:'email',title:'Email Send Guard',action:'Send email',composerTitle:'Compose an email',fieldLabel:'Email message',examples:[
      {id:'angry',label:'Personal attack',text:"You've messed this up again. Do you even read my emails? Fix it immediately."},
      {id:'firm',label:'Firm but professional',text:'The report contains three errors. Please correct the figures and send an updated copy before 5 PM.'},
      {id:'quoted',label:'Quoted complaint',text:"A customer wrote: 'You are an idiot.' I'm sharing the exact wording for our incident record, not directing it at you."}]},
    {id:'comment',title:'Comment Guard',action:'Post comment',composerTitle:'Compose a comment',fieldLabel:'Comment text',examples:[
      {id:'angry',label:'Hostile reply',text:'You are an idiot. Do you even understand what you are talking about?'},
      {id:'firm',label:'Respectful disagreement',text:'I disagree with that conclusion. Could you share the source for this claim?'},
      {id:'quoted',label:'Reporting abuse',text:"Someone replied 'You are worthless.' I am documenting this comment to report the harassment."}]}
  ];
  let features=defaultFeatures;
  function activeFeature(){return features.find(f=>f.id===currentFeature)||features[0];}
  function chooseFeature(id){
    if(processing||!modal.classList.contains('hidden'))return;
    if(!features.some(f=>f.id===id))return;
    drafts[currentFeature]=textarea.value;
    currentFeature=id;
    const feature=activeFeature();
    textarea.value=drafts[id]||'';
    $('recipientRow').hidden=id!=='email';$('subjectRow').hidden=id!=='email';
    $('composeTitle').textContent=feature.composerTitle;
    $('bodyLabel').textContent=feature.fieldLabel;
    $('sendText').textContent=feature.action;
    $('composerHint').textContent=id==='email'?'Simulation only · No email is sent':'Simulation only · No comment is published';
    for (const btn of document.querySelectorAll('[data-feature]')) {
      const selected=btn.dataset.feature===id;btn.classList.toggle('active',selected);btn.setAttribute('aria-selected',String(selected));
    }
    const host=$('exampleButtons');host.replaceChildren();
    for(const item of feature.examples||[]){
      const btn=document.createElement('button');btn.type='button';btn.className='example';btn.textContent=item.label;
      btn.dataset.example=item.id;host.append(btn);
    }
    syncCounter();setStatus(`${feature.title} ready. ${id==='comment'?'Only a simulated post is created.':'Only a simulated email is created.'}`);
  }
  document.querySelectorAll('[data-feature]').forEach(btn=>btn.addEventListener('click',()=>chooseFeature(btn.dataset.feature)));
  fetch('/api/features').then(r=>r.json()).then(data=>{
    if(Array.isArray(data.features)&&data.features.some(f=>f.id==='email'))features=data.features;
    chooseFeature(currentFeature);
  }).catch(()=>{});

  async function getCsrf(force=false){
    if(!csrfPromise || force){csrfPromise=fetch('/api/session',{credentials:'same-origin',cache:'no-store'}).then(async r=>{const d=await r.json();if(!r.ok||!d.csrf)throw Error('Cannot start protected session');return d.csrf;});}
    return csrfPromise;
  }
  getCsrf().catch(()=>setStatus('Secure session unavailable. Refresh to retry.'));
  function setStatus(text) {activity.textContent=text;}
  function syncCounter(){ $('characters').textContent=`${textarea.value.length} / 5000`; }
  function extensionInstalled(){return document.documentElement.dataset.ppProtected==='enabled';}
  function syncExtension(){
    $('extensionState').textContent=extensionInstalled()?'Chrome extension active':'Web-only mode';
    const state=document.documentElement.dataset.ppLastState;
    const decision=document.documentElement.dataset.ppLastDecision;
    const mode=document.documentElement.dataset.ppLastMode;
    $('guardState').textContent=extensionInstalled()
      ? (decision ? `Last extension verdict: ${decision} · ${mode==='ai'?'Real AI':mode==='safety-rule'?'Local safety check':mode==='demo-rules'?'Demo rules':'Analyzed'}` : state ? `Guard: ${state}` : 'Guard: awaiting send test')
      : 'Guard: web-only testing';
  }
  const observer=new MutationObserver(syncExtension);observer.observe(document.documentElement,{attributes:true,attributeFilter:['data-pp-protected','data-pp-last-state','data-pp-last-decision','data-pp-last-mode']});syncExtension();
  function closeModal(){modal.classList.add('hidden');returnFocus?.focus();}
  function simulateSend(source='unknown'){
    setStatus(`${currentFeature==='email'?'Simulated email sent':'Simulated comment posted'} ✓ Nothing was actually delivered or published. Path: ${source}.`);
    textarea.value='';drafts[currentFeature]='';syncCounter();
  }
  async function assess(text){
    const csrf=await getCsrf();
    const response=await fetch('/api/analyze',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json','X-PausePilot-CSRF':csrf},body:JSON.stringify({text,channel:currentFeature})});
    const payload=await response.json();
    if(response.status===403){csrfPromise=null;throw Error('Secure session expired. Refresh the page and try again.');}
    if(!response.ok)throw Error(payload.error||'Analysis failed');return payload;
  }
  function noteModelResult(result) {
    if(result?.mode==='ai') {
      $('modeName').textContent='Real AI classification verified';
      $('modeDescription').textContent='A server-side model evaluated the draft on this send attempt.';
      $('modeBullet').style.background='#38976b';
    }
  }
  function showReview(result,text){
    reviewedText=text;pendingResult=result;returnFocus=document.activeElement;
    $('modalTitle').textContent=result.decision==='urgent'?'Consider this message carefully':'One moment before you send';
    $('modalReason').textContent=result.reason;
    $('modalSuggestion').textContent=result.suggestion||'You can edit, save, or send anyway.';
    $('modalMeta').textContent=`${result.mode==='ai'?'AI review':result.mode==='safety-rule'?'Local safety check':'Demonstration rules'} · PausePilot will not change your words or send without your decision.`;
    modal.classList.remove('hidden');$('editButton').focus();
  }
  form.addEventListener('submit',async ev=>{
    ev.preventDefault();
    if(extensionInstalled()){
      if(form.dataset.ppApproved==='1'){
        form.dataset.ppApproved='0';
        const verdict=form.dataset.ppDecision||'approved';
        delete form.dataset.ppDecision;
        simulateSend(`extension ${verdict}`);
      }else{
        setStatus('Send was not approved by the extension. Draft preserved. Check the guard status above.');
      }
      return;
    }
    if(processing)return;
    const text=textarea.value;
    const checkedFeature=currentFeature;
    if(!text.trim())return;
    processing=true;$('sendButton').disabled=true;setStatus('Checking message before sending...');
    try{
      const result=await assess(text);noteModelResult(result);
      if(textarea.value!==text || currentFeature!==checkedFeature){setStatus('Your draft or feature changed during review. Run the check again.');return;}
      if(result.decision==='allow'){simulateSend('web-only allow');}
      else{showReview(result,text);setStatus('Potential concern found. Your draft has not been sent.');}
    }catch(err){setStatus(`Analysis unavailable: ${err.message}. Your draft is intact. You can retry.`);}
    finally{processing=false;$('sendButton').disabled=false;}
  });
  $('editButton').addEventListener('click',()=>{closeModal();setStatus('Draft preserved. Make any changes and press Send when ready.');textarea.focus();});
  $('saveButton').addEventListener('click',()=>{closeModal();setStatus('Draft preserved on this page. Nothing has been sent.');});
  $('sendAnywayButton').addEventListener('click',()=>{
    if(textarea.value!==reviewedText){closeModal();setStatus('Draft changed. Please review the updated version before sending.');return;}
    closeModal();simulateSend('web-only send anyway');
  });
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!modal.classList.contains('hidden'))closeModal();});
  $('exampleButtons').addEventListener('click',event=>{
    const btn=event.target.closest('[data-example]');if(!btn)return;
    const item=activeFeature().examples.find(x=>x.id===btn.dataset.example);if(!item)return;
    textarea.value=item.text;drafts[currentFeature]=item.text;syncCounter();
    setStatus('Example loaded. Press the action button to test the intervention.');textarea.focus();
  });
  textarea.addEventListener('input',syncCounter);syncCounter();
  fetch('/api/health').then(r=>r.json()).then(data=>{
    const ai=data.mode==='ai';$('modeName').textContent=ai?'AI configured — awaiting a test':'Rule-based demo mode';
    $('modeDescription').textContent=ai?'Real AI is configured. Use a send test to verify the model responds; drafts are shared with the provider on Send.':'Set OPENAI_API_KEY on the server to enable actual AI classification.';
    $('modeBullet').style.background=ai?'#38976b':'#d3a352';
  }).catch(()=>{$('modeName').textContent='Analysis server unavailable';$('modeDescription').textContent='Start the local Node server first.';});
})();
