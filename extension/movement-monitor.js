// Optional pointer movement variability experiment for selected Chrome tabs.
// Deliberately independent of the Gmail Send Guard and AI endpoint.
// No pointer coordinates are transmitted or stored across sessions.
(() => {
'use strict';
const M = globalThis.PausePilotMovement;
const R = globalThis.PausePilotRelaxation;
if (!M || !R || !['mail.google.com','localhost','pausepilot-buildathon-demo.onrender.com'].includes(location.hostname)) return;
const isLocal = location.hostname === 'localhost' && location.port === '4173';
if (location.hostname === 'localhost' && !isLocal) return;

let master = false, consent = false;
let running = false, stage = 'idle', started = 0, samples = [], baseline = null;
let lastSample = 0, lastMove = 0, timer = 0;
const alerts = M.createAlertGate({cooldownMs:20000,confirmWindows:2,recoveryWindows:2});
let host = null, ui = null, minimized = false;
let relax=null, breathTimer=0, breathStart=0, quietUntil=0;
let lastBreathPhase='', voiceSpoken=false;
const now = () => performance.now();
const cutoffMs = 6200;
const throttleMs = 35;
const alertCooldownMs = 20000; // Separate from the audio engine's 90s auto-play cooldown.
const $ = id => ui?.getElementById(id);

function makeUI(){
  if (host) return;
  host = document.createElement('div');
  host.id = 'pausepilot-movement-monitor';
  host.style.cssText = 'all:initial;position:fixed;left:16px;bottom:16px;z-index:2147483600;pointer-events:auto';
  const shadow = host.attachShadow({mode:'open'}); ui = shadow;
  const style=document.createElement('style'); style.textContent=`
  :host{all:initial}*{box-sizing:border-box}
  .panel{font-family:system-ui,-apple-system,sans-serif;background:#fafffb;color:#183d31;border:1px solid #b9d8c6;box-shadow:0 8px 28px #152f2840;border-radius:14px;width:280px;padding:13px;font-size:12px;line-height:1.45}
  .top{display:flex;align-items:center;gap:8px}.brand{font-weight:800;flex:1;font-size:12px}.chip{font-size:10px;font-weight:700;color:#477260;background:#eaf3ed;padding:3px 7px;border-radius:50px}
  .sub{font-size:11px;color:#516f63;margin-top:7px}.status{font-size:14px;font-weight:750;margin-top:9px}.metrics{display:flex;gap:14px;margin:10px 0;color:#35584a;font-variant-numeric:tabular-nums}
  .metric strong{display:block;color:#204835;font-size:16px}.notice{background:#fff5e8;border:1px solid #e2cba5;color:#6f4a18;border-radius:9px;padding:8px;margin:10px 0}
  button{cursor:pointer;background:#e7f3eb;color:#204c3e;border:0;border-radius:7px;padding:6px 8px;font-size:11px;font-weight:650}button.primary{background:#287456;color:white}button:focus-visible{outline:2px solid #134a38;outline-offset:2px}
  .buttons{display:flex;gap:5px;flex-wrap:wrap;margin-top:9px}.icon{padding:3px 7px}.small{font-size:10px;color:#65786d;margin-top:7px}
  .relax{margin-top:11px;border:1px solid #c8dfd0;border-radius:9px;padding:9px;background:#f4faf5}.relax summary{cursor:pointer;font-weight:800;font-size:12px;color:#276548}
  .relax p{font-size:10px;color:#668272;line-height:1.5;margin:7px 0}.relax-row{display:flex;gap:6px;align-items:center;margin:8px 0}.relax select{flex:1;min-width:0;background:#fff;color:#235742;border:1px solid #c5dbce;border-radius:6px;padding:5px;font-size:11px}
  .relax input[type=range]{width:100%;accent-color:#24785b}.relax input[type=checkbox]{accent-color:#24785b}.relax label{font-size:11px;color:#355e49;line-height:1.4}
  .breath{display:flex;gap:9px;align-items:center;padding:8px;background:#e6f4eb;border-radius:8px;margin:8px 0;font-size:11px}.orb{width:27px;height:27px;border-radius:50%;background:#73b69a;flex-shrink:0;transform:scale(.78);transition:transform .22s linear}
  .tiny{font-size:10px;color:#647c70}.quiet{font-size:10px;color:#466f5c;margin-top:6px}
  @media(prefers-reduced-motion:reduce){.orb{transition:none;transform:none!important}}
  [hidden]{display:none!important}
  `;
  const container=document.createElement('aside');container.className='panel';container.setAttribute('aria-label','PausePilot experimental movement monitor');
  container.innerHTML=`
    <div class="top"><strong class="brand">✳ PausePilot · Pointer Lab</strong><span class="chip">Experimental</span><button id="fold" class="icon" aria-label="Minimize movement monitor">−</button></div>
    <div id="content">
      <div class="status" id="status" role="status">Starting calibration…</div>
      <div class="sub" id="explanation">Move naturally with your mouse or trackpad for five seconds.</div>
      <div class="metrics"><div class="metric">Turns / second<strong id="turns">—</strong></div><div class="metric">Speed (px/s)<strong id="speed">—</strong></div></div>
      <div class="notice" id="nudge" hidden>
        <strong>Movement variation is elevated.</strong><div>This is not a stress diagnosis. Want a quick break?</div>
        <div class="buttons"><button id="playNudge" class="primary">♪ Calm sound</button><button id="breatheNudge">Breathe</button><button id="dismiss">Not now</button><button id="quietNudge">Quiet 5 min</button></div>
      </div>
      <div class="buttons"><button id="reset">Recalibrate</button><button id="stop">Stop & clear</button></div>
      <div class="small" id="alertStats">Movement alerts this tab: 0 · 20s minimum cooldown</div>
      <details class="relax" id="relaxDetails"><summary>🌿 Calming sounds & breathing</summary>
        <p>Optional original soundscapes. Never a stress diagnosis. No audio until you opt in.</p>
        <div class="relax-row"><label for="sound">Sound</label><select id="sound" aria-label="Choose ambience"><option value="rain">Gentle rain</option><option value="ocean">Ocean swell</option><option value="forest">Forest breeze</option></select></div>
        <label for="volume">Volume</label><input id="volume" type="range" min="0" max="16" value="8" aria-label="Relaxation volume"/>
        <div class="buttons"><button id="playSound" class="primary">▶ Play 30s</button><button id="stopSound">■ Stop</button></div>
        <label><input id="autoSound" type="checkbox"/> Auto-play after movement alert (this tab only)</label>
        <div class="breath" id="breath" hidden><span id="breathOrb" class="orb" aria-hidden="true"></span><b id="breathLabel">Inhale gently</b><span id="breathTime">30s</span></div>
        <div class="buttons"><button id="breathe">Start 30s breathing guide</button></div>
        <label><input id="voiceGuide" type="checkbox"/> Speak breathing cues (optional)</label>
        <div id="soundStatus" class="quiet" role="status">Silent until you choose.</div>
      </details>
      <div class="small">Local-only; no cursor paths sent or saved. Audio stops when this tab loses focus.</div>
    </div>`;
  shadow.append(style,container);
  (document.body || document.documentElement).appendChild(host);
  $('fold').addEventListener('click',()=>{minimized=!minimized;$('content').hidden=minimized;$('fold').textContent=minimized?'+':'−';$('fold').setAttribute('aria-label',minimized?'Expand movement monitor':'Minimize movement monitor');});
  $('stop').addEventListener('click',()=>chrome.storage.local.set({movementEnabled:false}));
  // The old #pause element was removed from the panel; attaching a listener
  // to it threw during initialization and stopped calibration and audio wiring.
  $('reset').addEventListener('click',()=>start());
  installRelaxationControls();
  $('dismiss').addEventListener('click',()=>{$('nudge').hidden=true;quietUntil=Math.max(quietUntil,now()+20000);});
  $('quietNudge').addEventListener('click',()=>{quietUntil=now()+5*60000;$('nudge').hidden=true;});
  $('playNudge').addEventListener('click',()=>{$('relaxDetails').open=true;void startSound();$('nudge').hidden=true;});
  $('breatheNudge').addEventListener('click',()=>{$('relaxDetails').open=true;startBreathing();$('nudge').hidden=true;});
}
function stopVoice(){
  if(voiceSpoken && window.speechSynthesis){try{window.speechSynthesis.cancel();}catch{}}
  voiceSpoken=false;lastBreathPhase='';
}
function sayBreathCue(phase){
  if(!$('voiceGuide')?.checked || !window.speechSynthesis || typeof SpeechSynthesisUtterance!=='function')return;
  try{
    if(voiceSpoken)window.speechSynthesis.cancel();
    const utterance=new SpeechSynthesisUtterance(phase==='Inhale gently'?'Breathe in gently':'Breathe out slowly');
    utterance.lang='en-US';utterance.rate=.86;utterance.volume=.55;
    voiceSpoken=true;window.speechSynthesis.speak(utterance);
  }catch{if(ui)$('soundStatus').textContent='Spoken guidance unavailable. Visual breathing still works.';}
}
function stopBreathing(){
  if(breathTimer){clearInterval(breathTimer);breathTimer=0;}
  stopVoice();
  if(ui){$('breath').hidden=true;$('breathe').textContent='Start 30s breathing guide';}
}
function shutdownRelaxation(){
  stopBreathing();if(relax){void relax.dispose();relax=null;}
  if(ui&&$('autoSound')){$('autoSound').checked=false;$('soundStatus').textContent='Stopped. Sound off.';}
}
async function startSound(){
  if(!relax)return;
  try{await relax.play({sound:$('sound').value,level:Number($('volume').value)/100,seconds:30});
    $('soundStatus').textContent='Playing soft, original ambience for 30s. Stop at any time.';
  }catch{if(ui)$('soundStatus').textContent='Audio unavailable. Try playing again or check browser sound settings.';}
}
function startBreathing(){
  if(!ui)return;
  if(breathTimer){stopBreathing();return;}
  breathStart=performance.now();lastBreathPhase='';$('breath').hidden=false;$('breathe').textContent='Stop breathing guide';
  const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const tick=()=>{
    if(!ui){stopBreathing();return;}
    const elapsed=performance.now()-breathStart;
    if(elapsed>=30000){stopBreathing();$('soundStatus').textContent='Breathing pause complete.';return;}
    const ph=R.breathingPhase(elapsed);
    if(ph.name!==lastBreathPhase){lastBreathPhase=ph.name;sayBreathCue(ph.name);}
    $('breathLabel').textContent=ph.name;$('breathTime').textContent=`${Math.ceil((30000-elapsed)/1000)}s`;
    $('breathOrb').style.transform=reduced?'none':`scale(${ph.scale})`;
  };
  tick();breathTimer=setInterval(tick,180);
}
function installRelaxationControls(){
  relax=R.createEngine({onState: state=>{
    if(!ui)return;
    $('playSound').disabled=state.playing;
    $('playSound').textContent=state.playing?'♪ Playing…':'▶ Play 30s';
  }});
  $('playSound').addEventListener('click',()=>void startSound());
  $('stopSound').addEventListener('click',()=>{relax?.stop();stopBreathing();$('soundStatus').textContent='Sound stopped.';});
  $('volume').addEventListener('input',()=>relax?.preferences({level:Number($('volume').value)/100}));
  $('sound').addEventListener('change',()=>relax?.preferences({sound:$('sound').value}));
  $('autoSound').addEventListener('change',async()=>{
    if(!relax)return;
    try{await relax.armAutomatic($('autoSound').checked);
      if(ui)$('soundStatus').textContent=$('autoSound').checked?'Auto-play enabled for this tab session.':'Auto-play disabled.';
    }catch{if(ui){$('autoSound').checked=false;$('soundStatus').textContent='Could not enable sound. Try manual Play.';}}
  });
  $('breathe').addEventListener('click',startBreathing);
  $('voiceGuide').addEventListener('change',()=>{if(!$('voiceGuide').checked)stopVoice();});
}
function update(status,explanation,metrics) {
  if(!ui) return;
  $('status').textContent=status;
  $('explanation').textContent=explanation;
  if(metrics){$('turns').textContent=metrics.turnsPerSecond.toFixed(1);$('speed').textContent=String(Math.round(metrics.averageSpeed));}
}
function detachTracking(){
  running=false;
  if(timer){clearInterval(timer);timer=0;}
  window.removeEventListener('pointermove',onPointer,true);
  samples=[];lastSample=lastMove=0;
}
function clear(removeWidget=true){
  detachTracking();shutdownRelaxation();
  stage='idle';baseline=null;alerts.reset();quietUntil=0;started=0;
  if(removeWidget&&host){host.remove();host=null;ui=null;minimized=false;}
}
function pauseForBackground(){
  if(!running)return;
  // Keep the established per-tab baseline, but discard any partial movement window.
  detachTracking();stopBreathing();relax?.stop();
  if(ui){$('nudge').hidden=true;update('Paused · tab inactive',baseline?'Baseline kept. Tracking resumes when you return.':'Calibration will resume when you return.');}
}
function attachTracking(){
  running=true;samples=[];lastSample=lastMove=0;
  window.addEventListener('pointermove',onPointer,{capture:true,passive:true});
  timer=setInterval(tick,450);
}
function start(){
  // Explicit Recalibrate resets the personal baseline, not the sound preferences.
  detachTracking();stopBreathing();relax?.stop();
  baseline=null;alerts.reset();quietUntil=0;stage='idle';
  if(!master||!consent||document.hidden||!document.hasFocus())return;
  makeUI();$('nudge').hidden=true;
  stage='baseline';started=now();attachTracking();
  $('alertStats').textContent='Movement alerts this tab: 0 · 20s minimum cooldown';
  update('Calibrating · 5 seconds','Move the pointer naturally across this page. Nothing is uploaded.');
}
function resume(){
  if(!master||!consent || running || document.hidden || !document.hasFocus())return;
  makeUI();
  if(baseline){
    stage='active';attachTracking();
    update('Baseline restored','Welcome back. Movement detection resumed without recalibration.');
  }else{
    stage='baseline';started=now();attachTracking();
    update('Calibrating · 5 seconds','Move the pointer naturally across this page. Nothing is uploaded.');
  }
}
function onPointer(event){
  if(!running || document.hidden || !document.hasFocus())return;
  if(event.pointerType&&event.pointerType!=='mouse')return; // trackpads report mouse
  if(event.target===host || event.composedPath?.().includes(host))return;
  if(document.getElementById('pausepilot-extension-ui'))return;
  const t=now();if(t-lastSample < throttleMs)return;
  lastSample=lastMove=t;
  samples.push({x:event.clientX,y:event.clientY,t});
  while(samples.length>1&&samples[0].t<t-cutoffMs)samples.shift();
  if(samples.length>175)samples.splice(0,samples.length-175); // bounded, short-lived memory
}
function tick(){
  if(!running)return;
  const t=now();
  if(stage==='baseline'){
    const seconds=Math.max(0,Math.ceil((M.MOVEMENT_EXPERIMENT.baselineMs-(t-started))/1000));
    if(seconds) {update(`Calibrating · ${seconds}s`,'Move naturally across this page; no need to hurry.');return;}
    const candidate=M.summarizeMovement(samples.filter(x=>x.t>=t-5000),5000);
    if(!M.hasEnoughMovement(candidate)){
      update('Keep moving to calibrate','Not enough movement yet. Gently move the pointer for a few more seconds.',candidate);return;
    }
    baseline=candidate;stage='active';samples=[];lastSample=lastMove=0;
    update('Baseline ready','Try normal movement, then quick zigzags. We compare only short windows.',candidate);
    return;
  }
  if(!lastMove || t-lastMove>1600){
    // Clear stale samples so movement after an idle period is a fresh episode.
    samples=[];lastSample=lastMove=0;
    alerts.observe('idle',t,quietUntil);
    update('Waiting for movement','Baseline kept. Move the pointer for another comparison.');return;
  }
  const current=M.summarizeMovement(samples.filter(x=>x.t>=t-4200),4200);
  const result=M.compareMovement(current,baseline);
  if(result.state==='insufficient'){
    alerts.observe('insufficient',t,quietUntil);
    update('Gathering movement','A few more motions are needed for a reliable comparison.',current);return;
  }
  const decision=alerts.observe(result.state,t,quietUntil);
  if(result.state==='changed'){
    update('Unusual movement variation',result.reason+' This cannot tell how you feel.',current);
    if(decision.alert){
      $('nudge').hidden=false;
      $('alertStats').textContent=`Movement alerts this tab: ${decision.alerts} · ${Math.round(alertCooldownMs/1000)}s minimum cooldown`;
      if($('autoSound').checked&&relax){void relax.onPatternAlert().then(played=>{if(played&&ui)$('soundStatus').textContent='Opted-in calming sound started after movement alert.';});}
    }
  }else{
    update('Near your baseline',result.reason,current);
  }
}
function sync(){
  if(master&&consent){resume();}
  else clear();
}
chrome.storage.local.get({enabled:false,movementEnabled:false},v=>{master=!!v.enabled;consent=!!v.movementEnabled;sync();});
chrome.storage.onChanged.addListener((changes,area)=>{
  if(area!=='local')return;
  if(changes.enabled)master=!!changes.enabled.newValue;
  if(changes.movementEnabled)consent=!!changes.movementEnabled.newValue;
  sync();
});
document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseForBackground();else sync();});
window.addEventListener('blur',pauseForBackground);
window.addEventListener('focus',()=>sync());
window.addEventListener('pagehide',()=>clear());
})();
