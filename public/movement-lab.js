import {summarizeMovement,hasEnoughMovement,compareMovement,createAlertGate,MOVEMENT_EXPERIMENT} from './movement-core.js';
import {installRelaxationStudio} from './relaxation-studio.js';

// The lab attaches only to a dedicated pad after explicit opt-in; data is kept
// in short-lived JS memory and never sent to the server or stored persistently.
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const tab=$('movementTab'), lab=$('movementLab'), bench=$('messageWorkbench');
  const pad=$('motionPad'), start=$('motionStart'), stop=$('motionStop');
  if(!tab || !lab || !pad) return;
  const relax=installRelaxationStudio();

  let running=false, startAt=0, baseline=null, stage='idle', samples=[], lastMoveAt=0, interval=null;
  const alerts=createAlertGate({cooldownMs:20000,confirmWindows:2,recoveryWindows:2});
  let quietUntil=0;
  const status=$('motionStatus'), description=$('motionDescription'), nudge=$('motionNudge');
  const now=()=>performance.now();

  function resetUI(){
    status.textContent='Not monitoring';description.textContent='Enable the experiment when you want to try it. We\'ll first observe how you normally move the pointer.';
    $('motionVariationLabel').textContent='No data';$('motionVariationFill').style.width='0%';
    $('motionVariationFill').classList.remove('elevated');
    $('motionTurnRate').textContent='—';$('motionSpeed').textContent='—';
    $('motionPadLabel').textContent='Press Start, then move slowly and naturally in this area.';
    nudge.hidden=true;
  }
  function endSession(message){
    void relax.shutdown();
    running=false;stage='idle';startAt=0;baseline=null;lastMoveAt=0;samples=[];alerts.reset();quietUntil=0;
    if(interval){clearInterval(interval);interval=null;}
    pad.classList.remove('is-monitoring');start.disabled=false;stop.disabled=true;
    resetUI();
    if(message){status.textContent=message;description.textContent='Your movement samples have been cleared. Start again whenever you choose.';}
  }
  function showLab(){
    if(!$('modal').classList.contains('hidden')) return;
    bench.hidden=true;lab.hidden=false;document.getElementById('insightsPanel').hidden=true;document.getElementById('insightsTab').classList.remove('active');document.getElementById('insightsTab').setAttribute('aria-selected','false');resumeSession();
    tab.classList.add('active');tab.setAttribute('aria-selected','true');
    for(const b of document.querySelectorAll('[data-feature]')){b.classList.remove('active');b.setAttribute('aria-selected','false');}
  }
  function hideLab(){
    if(lab.hidden) return;
    pauseSession();lab.hidden=true;bench.hidden=false;
    tab.classList.remove('active');tab.setAttribute('aria-selected','false');
  }
  tab.addEventListener('click',showLab);
  const insightsTab=$('insightsTab'),insightsPanel=$('insightsPanel');
  insightsTab.addEventListener('click',()=>{if(!$('modal').classList.contains('hidden'))return;hideLab();bench.hidden=true;insightsPanel.hidden=false;insightsTab.classList.add('active');insightsTab.setAttribute('aria-selected','true');for(const b of document.querySelectorAll('[data-feature]')){b.classList.remove('active');b.setAttribute('aria-selected','false');}});
  for(const b of document.querySelectorAll('[data-feature]')) b.addEventListener('click',()=>{hideLab();insightsPanel.hidden=true;insightsTab.classList.remove('active');insightsTab.setAttribute('aria-selected','false');bench.hidden=false;});

  function pauseSession(){
    if(!running)return;
    running=false;samples=[];lastMoveAt=0;
    if(interval){clearInterval(interval);interval=null;}
    status.textContent='Paused · baseline kept';description.textContent='Return to this tab to resume. Recent pointer samples were cleared.';
  }
  function resumeSession(){
    if(running||stage==='idle'||document.hidden||!document.hasFocus()||lab.hidden)return;
    if(!baseline){stage='baseline';startAt=now();}else stage='monitor';
    samples=[];lastMoveAt=0;running=true;
    status.textContent=baseline?'Baseline restored':'Building baseline · 5s';
    description.textContent=baseline?'Monitoring resumed without recalibration.':'Move naturally to calibrate.';
    interval=setInterval(tick,350);
  }
  function onMove(event){
    if(!running || event.pointerType!=='mouse' || document.hidden || lab.hidden) return;
    const t=now();
    lastMoveAt=t;
    samples.push({x:event.clientX,y:event.clientY,t});
    const cutoff=t-6000;
    while(samples.length>1 && samples[0].t<cutoff) samples.shift();
    // Hard cap; never let temporary cursor samples consume unbounded memory.
    if(samples.length>750) samples.splice(0,samples.length-750);
  }
  function breakSegment(){
    if(running) samples.push({t:now(),break:true});
  }
  pad.addEventListener('pointermove',onMove,{passive:true});
  pad.addEventListener('pointerleave',breakSegment,{passive:true});
  function showMetrics(metrics){
    $('motionTurnRate').textContent=metrics.turnsPerSecond.toFixed(1);
    $('motionSpeed').textContent=Math.round(metrics.averageSpeed).toLocaleString();
  }
  function tick(){
    if(!running)return;
    const t=now();
    if(stage==='baseline'){
      const remaining=Math.max(0,Math.ceil((MOVEMENT_EXPERIMENT.baselineMs-(t-startAt))/1000));
      status.textContent=remaining?`Building baseline · ${remaining}s`:'Checking baseline…';
      if(t-startAt<MOVEMENT_EXPERIMENT.baselineMs)return;
      const window=samples.filter(s=>s.t>=t-5000);
      const candidate=summarizeMovement(window,5000);
      showMetrics(candidate);
      if(!hasEnoughMovement(candidate)){
        status.textContent='Move a little more';
        description.textContent='We need a few gentle pointer movements inside the pad to set a baseline. There is no rush.';
        $('motionPadLabel').textContent='Keep moving naturally in this pad to complete calibration.';
        return;
      }
      baseline=candidate;stage='monitor';samples=[];lastMoveAt=0;alerts.reset();
      status.textContent='Baseline ready';description.textContent='Now try moving normally or making quick zigzags. We will compare only short movement windows.';
      $('motionPadLabel').textContent='Move your cursor here. Try a few deliberate zigzags to explore the indicator.';
      return;
    }
    const recent=samples.filter(s=>s.t>=t-MOVEMENT_EXPERIMENT.currentWindowMs);
    const metrics=summarizeMovement(recent,MOVEMENT_EXPERIMENT.currentWindowMs);
    if(!lastMoveAt||t-lastMoveAt>MOVEMENT_EXPERIMENT.stillMs){
      status.textContent='Waiting for movement';description.textContent='Move your cursor within the pad to compare with your baseline.';
      $('motionVariationLabel').textContent='No recent motion';$('motionVariationFill').style.width='0%';
      $('motionVariationFill').classList.remove('elevated');
      alerts.observe('idle',t,quietUntil);samples=[];lastMoveAt=0;
      return;
    }
    showMetrics(metrics);
    const signal=compareMovement(metrics,baseline);
    if(signal.state==='insufficient'){
      status.textContent='Gathering observations';description.textContent='A little more movement is needed for this short window.';
      $('motionVariationLabel').textContent='Collecting';$('motionVariationFill').style.width='12%';
      $('motionVariationFill').classList.remove('elevated');
      alerts.observe('insufficient',t,quietUntil);
      return;
    }
    status.textContent=signal.state==='changed'?'Movement variation increased':'Movement near baseline';
    description.textContent=signal.reason+' This cannot establish whether you feel restless.';
    $('motionVariationLabel').textContent=signal.state==='changed'?'Elevated variation':'Within comparison range';
    $('motionVariationFill').style.width=signal.variation+'%';
    $('motionVariationFill').classList.toggle('elevated',signal.state==='changed');
    const result=alerts.observe(signal.state==='changed'?'changed':'usual',t,quietUntil);
    if(result.alert && !relax.shouldQuiet()){
      nudge.hidden=false;void relax.onMovementAlert();
    }
  }
  start.addEventListener('click',()=>{
    endSession();
    running=true;stage='baseline';startAt=now();start.disabled=true;stop.disabled=false;
    pad.classList.add('is-monitoring');
    status.textContent='Building baseline · 5s';
    description.textContent='Move your mouse or trackpad pointer gently and naturally inside the pad for about five seconds.';
    $('motionPadLabel').textContent='Move naturally for 5 seconds. We are learning your own baseline.';
    interval=setInterval(tick,350);
  });
  stop.addEventListener('click',()=>endSession('Stopped · data cleared'));
  $('motionDismiss').addEventListener('click',()=>{nudge.hidden=true;quietUntil=now()+20000;});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseSession();else resumeSession();});
  window.addEventListener('blur',pauseSession);window.addEventListener('focus',resumeSession);
  window.addEventListener('pagehide',()=>endSession());
  resetUI();
})();
