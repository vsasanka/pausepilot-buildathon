(() => {
  'use strict';
  const isDemo = location.origin === 'http://localhost:4173' && location.pathname !== '/gmail-lab.html';
  const isGmailLab = location.origin === 'http://localhost:4173' && location.pathname === '/gmail-lab.html';
  const isGmail = location.hostname === 'mail.google.com' || isGmailLab;
  const G = globalThis.PausePilotGmail;
  let enabled = false;
  let gmailEnabled = false; // Must be opted into separately from the demo.
  let busy = false;
  let bypassDemo = false;
  let overlay = null;
  let approval = null; // Ephemeral token; never persisted.
  let currentRequest = 0;
  const APPROVAL_MS = 45000;
  const css = `
    :host{all:initial;font-family:ui-sans-serif,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#263734}
    .shade{position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;background:#182c30aa;padding:16px;box-sizing:border-box}
    .panel{width:min(100%,450px);background:#fff;border-radius:18px;padding:24px;box-sizing:border-box;box-shadow:0 20px 70px #132e304d}
    .brand{font-size:11px;color:#327761;text-transform:uppercase;letter-spacing:1.5px;font-weight:800}
    h2{font-size:23px;letter-spacing:-.6px;margin:10px 0}p{font-size:14px;color:#56706b;line-height:1.55}
    .tip{background:#edf5ef;border-radius:10px;padding:12px;color:#315646;font-size:13px;line-height:1.5}
    .buttons{display:grid;gap:8px;margin-top:18px;grid-template-columns:1fr 1fr}
    button{cursor:pointer;font:600 13px ui-sans-serif,system-ui;border:0;border-radius:9px;padding:11px 10px}
    button.primary{grid-column:1/-1;background:#246f5c;color:#fff}
    button.secondary{background:#eaf3ed;color:#205b4b}button.tertiary{background:#fff;color:#46675d;border:1px solid #d7e4dc}
    .small{font-size:11px;margin-top:12px;color:#6c7d78}
  `;
  function reflectStatus() {
    if (isDemo && document.documentElement) document.documentElement.dataset.ppProtected = enabled ? 'enabled' : 'disabled';
    if (isGmailLab && document.documentElement) document.documentElement.dataset.ppGmailEnabled = enabled && gmailEnabled ? 'enabled' : 'disabled';
  }
  chrome.storage.local.get({enabled:false,gmailEnabled:false}, value=>{
    enabled=!!value.enabled;gmailEnabled=!!value.gmailEnabled;reflectStatus();
  });
  chrome.storage.onChanged.addListener((changes,area)=>{
    if(area!=='local')return;
    if(changes.enabled)enabled=!!changes.enabled.newValue;
    if(changes.gmailEnabled)gmailEnabled=!!changes.gmailEnabled.newValue;
    reflectStatus();
    if (!enabled || !gmailEnabled) { approval=null; currentRequest++; if(isGmail)removeOverlay(); }
    if (!enabled && isDemo) removeOverlay();
  });
  if(isDemo || isGmailLab) document.addEventListener('DOMContentLoaded',reflectStatus,{once:true});

  function removeOverlay(){if(overlay){overlay.remove();overlay=null;}}
  function setGuardState(state,decision='',mode='') {
    if(!document.documentElement || !(isDemo || isGmailLab))return;
    document.documentElement.dataset.ppLastState=state;
    document.documentElement.dataset.ppLastDecision=decision;
    document.documentElement.dataset.ppLastMode=mode;
    if(isGmailLab && globalThis.CustomEvent) document.dispatchEvent(new CustomEvent('pausepilot:lab-state',{detail:{state,decision,mode}}));
  }
  function note(text){if(!isDemo)return;const activity=document.getElementById('activity');if(activity)activity.textContent=text;}
  function showDialog({title,reason,suggestion,details,actions}) {
    removeOverlay();
    overlay=document.createElement('div');overlay.id='pausepilot-extension-ui';
    overlay.style.cssText='position:fixed;inset:0;z-index:2147483647;pointer-events:auto';
    const shadow=overlay.attachShadow({mode:'open'});
    const style=document.createElement('style');style.textContent=css;shadow.append(style);
    const shade=document.createElement('div');shade.className='shade';
    const panel=document.createElement('section');panel.className='panel';panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-label','PausePilot review');
    const brand=document.createElement('div');brand.className='brand';brand.textContent='✳ PausePilot · pre-send review';
    const heading=document.createElement('h2');heading.textContent=title;
    const paragraph=document.createElement('p');paragraph.textContent=reason;
    const tip=document.createElement('div');tip.className='tip';tip.textContent=suggestion;
    const buttons=document.createElement('div');buttons.className='buttons';
    for(const action of actions){const button=document.createElement('button');button.textContent=action.title;button.className=action.className;button.addEventListener('click',()=>{removeOverlay();action.onClick();});buttons.append(button);}
    const footer=document.createElement('div');footer.className='small';footer.textContent=details;
    panel.append(brand,heading,paragraph,tip,buttons,footer);shade.append(panel);shadow.append(shade);document.documentElement.append(overlay);
    buttons.querySelector('button')?.focus();
    shadow.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();removeOverlay();}});
  }
  function evaluate(text){return new Promise(resolve=>{
    chrome.runtime.sendMessage({type:'PAUSEPILOT_ANALYZE',text},response=>{
      if(chrome.runtime.lastError)return resolve({ok:false,error:'Extension connection failed; draft preserved.'});
      resolve(response||{ok:false,error:'Analysis failed; draft preserved.'});
    });
  });}

  // The existing web demo interception remains unchanged in purpose.
  function reviewForDemo(event){
    const form=event.target;
    if(!form||form.id!=='demoCompose')return;
    if(bypassDemo){bypassDemo=false;setGuardState('approved send resumed',document.documentElement.dataset.ppLastDecision||'approved',document.documentElement.dataset.ppLastMode||'');return;}
    event.preventDefault();event.stopImmediatePropagation();
    if(busy)return;
    const textarea=document.getElementById('messageBody');
    const initial=textarea?.value?.trim();if(!initial)return;
    busy=true;setGuardState('intercepted and checking');note('Chrome extension intercepted the Send action. Checking your draft...');
    evaluate(initial).then(response=>{
      if(!enabled){setGuardState('disabled during review');note('Extension disabled. Draft preserved. Click Send again.');return;}
      if(textarea.value.trim()!==initial){setGuardState('draft changed; retry');note('Draft changed during review; press Send again to recheck.');return;}
      const sendApproved=()=>{
        if(textarea.value.trim()!==initial){note('Draft changed; please press Send again for a fresh check.');return;}
        form.dataset.ppApproved='1';form.dataset.ppDecision=response.ok?response.result.decision:'explicit user approval after error';bypassDemo=true;form.requestSubmit();
      };
      if(!response.ok){setGuardState('analysis failed; draft preserved','error');note(response.error||'Analysis unavailable; draft preserved.');showDialog({title:'Could not check this message',reason:'The analysis service is unavailable. Nothing was sent.',suggestion:'You can keep editing, retry the check, or explicitly send this demo message anyway.',details:'No automatic sending after an error.',actions:[{title:'Return to editing',className:'primary',onClick:()=>textarea.focus()},{title:'Send anyway',className:'secondary',onClick:sendApproved},{title:'Keep draft',className:'tertiary',onClick:()=>{}}]});return;}
      if(response.result.decision==='allow'){setGuardState('review finished','allow',response.result.mode);note('Review complete: no concern detected. Continuing send.');sendApproved();return;}
      setGuardState('warning displayed',response.result.decision,response.result.mode);note('PausePilot displayed a review before sending; draft is intact.');
      showDialog({title:response.result.decision==='urgent'?'Please review this carefully':'One moment before you send',reason:response.result.reason,suggestion:response.result.suggestion||'Consider stating the issue and request without a personal attack.',details:`${response.result.mode==='ai'?'AI':response.result.mode==='safety-rule'?'Local safety check':'Rule-based demonstration'} · Your decision is final.`,actions:[{title:'Return to editing',className:'primary',onClick:()=>textarea.focus()},{title:'Send anyway',className:'secondary',onClick:sendApproved},{title:'Keep draft',className:'tertiary',onClick:()=>{note('Draft kept; no message sent.');}}]});
    }).finally(()=>{busy=false;});
  }

  function stop(event){event.preventDefault();event.stopImmediatePropagation();event.stopPropagation();}
  function getContext(event, isKeyboard=false) {
    const raw=G?.findButton(event.target);
    let button=raw&&G.isSendButton(raw)?raw:null;
    if(!button && isKeyboard){
      // Ctrl/⌘+Enter from the body/subject: locate a single native Send button.
      const active=event.target?.closest?.('[role="dialog"], .M9');
      if(active){const candidates=Array.from(active.querySelectorAll('button,[role="button"]')).filter(G.isSendButton);if(candidates.length===1)button=candidates[0];}
    }
    if(!button)return null;
    const composer=G.findComposer(button);
    if(!composer)return null;
    if(isKeyboard && !composer.root.contains(event.target))return null;
    return {button,composer};
  }
  function eligible(){return enabled && gmailEnabled && isGmail;}
  function approvedFor(ctx,shot){
    if(!approval)return false;
    if(Date.now()>=approval.expiresAt || approval.composer!==ctx.composer.root || approval.fingerprint!==shot.fingerprint){approval=null;return false;}
    return true;
  }
  function makeApproval(ctx,shot) {
    if(!eligible())return;
    const now=G.snapshot(ctx.composer);
    if(!now || now.fingerprint!==shot.fingerprint){
      approval=null;
      setGuardState('approval rejected: draft changed');
      showDialog({
        title:'Draft changed — approval not granted',
        reason:'PausePilot detected a change in the draft or recipients after the review.',
        suggestion:'Return to Gmail and press Send to analyze the current draft again.',
        details:'Nothing was sent by PausePilot.',
        actions:[{title:'Return to Gmail',className:'primary',onClick:()=>ctx.composer.body?.focus()}]
      });
      return;
    }
    approval={composer:ctx.composer.root,fingerprint:shot.fingerprint,expiresAt:Date.now()+APPROVAL_MS};
    setGuardState('approved for one native send');
    showDialog({
      title:'Approved for the next Send click',
      reason:'Nothing has been sent yet. Select Return to Gmail, then click Gmail’s blue Send button again within 45 seconds.',
      suggestion:'If you change the draft or recipients, the approval is canceled and another check will run.',
      details:'One-time approval · Gmail sends only after your second click.',
      actions:[{title:'Return to Gmail',className:'primary',onClick:()=>ctx.composer.body.focus()},{title:'Cancel approval',className:'tertiary',onClick:()=>{approval=null;}}]
    });
  }
  async function analyzeGmail(ctx) {
    const shot=G.snapshot(ctx.composer);
    if(!shot || !shot.body){setGuardState('empty/unrecognized draft');return;}
    const generation=++currentRequest;
    busy=true;approval=null;
    setGuardState('intercepted and checking');
    try{
      const response=await evaluate(shot.body);
      if(generation!==currentRequest || !eligible())return;
      const latest=G.snapshot(ctx.composer);
      if(!latest || latest.fingerprint!==shot.fingerprint){
        setGuardState('draft changed; retry');
        showDialog({title:'Draft changed while checking',reason:'Please press Send again to check the latest version.',suggestion:'The draft was not sent.',details:'Gmail beta',actions:[{title:'Return to Gmail',className:'primary',onClick:()=>ctx.composer.body.focus()}]});return;
      }
      if(!response.ok){setGuardState('analysis unavailable','error');
        showDialog({title:'Check unavailable',reason:'PausePilot could not analyze this draft. Nothing was sent by the extension.',suggestion:'Please retry after checking the local server, or explicitly disable Gmail protection in the extension popup.',details:'No automatic send on error.',actions:[{title:'Keep draft',className:'primary',onClick:()=>ctx.composer.body.focus()}]});return;
      }
      setGuardState('review finished',response.result.decision,response.result.mode);
      if(response.result.decision==='allow'){
        makeApproval(ctx,shot);return;
      }
      showDialog({
        title:response.result.decision==='urgent'?'Please review this message carefully':'One moment before you send',
        reason:response.result.reason,
        suggestion:response.result.suggestion||'Consider stating your concern without a personal attack.',
        details:`${response.result.mode==='ai'?'AI review':response.result.mode==='safety-rule'?'Local safety check':'Rule-based demonstration'} · No message has been sent by PausePilot.`,
        actions:[
          {title:'Return to editing',className:'primary',onClick:()=>ctx.composer.body.focus()},
          {title:'Approve next Send',className:'secondary',onClick:()=>makeApproval(ctx,shot)},
          {title:'Keep draft',className:'tertiary',onClick:()=>ctx.composer.body.focus()}
        ]
      });
    }catch{
      setGuardState('unexpected analysis error','error');
      showDialog({title:'Check unavailable',reason:'Your draft remains in Gmail.',suggestion:'Nothing was sent by PausePilot. Please retry after checking your connection.',details:'Gmail beta',actions:[{title:'Back to Gmail',className:'primary',onClick:()=>ctx.composer.body.focus()}]});
    }finally{busy=false;}
  }

  // Block native pointer and mouse events while an unapproved Send action is
  // being checked. Gmail may attach handlers to pointerdown/mousedown, not click.
  function onGmailPointer(event){
    if(!eligible())return;
    const ctx=getContext(event);
    if(!ctx)return;
    const shot=G.snapshot(ctx.composer);
    if(!shot?.body)return;
    if(approvedFor(ctx,shot))return;
    stop(event);
  }
  function onGmailClick(event){
    if(!eligible())return;
    const ctx=getContext(event);
    if(!ctx)return;
    const shot=G.snapshot(ctx.composer);
    if(!shot?.body)return;
    if(approvedFor(ctx,shot)){
      approval=null;
      setGuardState('approved native send click released');
      return; // Native Gmail click proceeds (no synthetic send).
    }
    stop(event);
    if(!busy)void analyzeGmail(ctx);
  }
  function onGmailKeyDown(event){
    if(!eligible() || event.repeat)return;
    const modifierEnter=(event.ctrlKey || event.metaKey)&&event.key==='Enter';
    const keyboardClick=(event.key==='Enter' || event.key===' ')&&G.isSendButton(G.findButton(event.target));
    if(!modifierEnter && !keyboardClick)return;
    const ctx=getContext(event,true);
    if(!ctx)return;
    const shot=G.snapshot(ctx.composer);
    if(!shot?.body)return;
    // Even an approved shortcut is paused. The second action must be a native
    // mouse click to avoid Gmail's keyboard confirmation/dialog behavior.
    stop(event);
    if(!busy)void analyzeGmail(ctx);
  }

  document.addEventListener('submit',event=>{if(enabled&&isDemo)reviewForDemo(event);},true);
  if(isGmail){
    window.addEventListener('pointerdown',onGmailPointer,true);
    window.addEventListener('mousedown',onGmailPointer,true);
    window.addEventListener('click',onGmailClick,true);
    window.addEventListener('keydown',onGmailKeyDown,true);
  }
})();
