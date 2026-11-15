// PausePilot Relaxation Engine — original procedural ambience; no remote audio.
// Shared verbatim between the public website and Chrome extension.
// Does not store drafts or pointer coordinates, collect analytics, or fetch data.
(() => {
  'use strict';
  const SOUNDS = Object.freeze(['rain','ocean','forest']);
  const MIN_COOLDOWN_MS = 90000;
  const CYCLE_MS = 10000; // 4 seconds in, 6 seconds out. Guidance, not treatment.
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,Number.isFinite(Number(v))?Number(v):a));
  function breathingPhase(elapsedMs) {
    const ms=Math.max(0,Number(elapsedMs)||0)%CYCLE_MS;
    return ms<4000 ? {name:'Inhale gently',progress:ms/4000,scale:0.78+0.22*ms/4000} :
      {name:'Exhale slowly',progress:(ms-4000)/6000,scale:1-0.22*(ms-4000)/6000};
  }
  function soundChoice(choice){return SOUNDS.includes(choice)?choice:'rain';}
  function createEngine({AudioContextClass,clock=()=>Date.now(),onState=()=>{}}={}) {
    const AC=AudioContextClass||globalThis.AudioContext||globalThis.webkitAudioContext;
    let ctx=null,active=null,stopTimer=0,autoArmed=false,lastAutomatic=-Infinity;
    let volume=0.08,chosen='rain',durationSec=30;
    const state=()=>({playing:!!active,sound:active?.sound||null,autoArmed,chosen,volume,durationSec});
    function notify(){onState(state());}
    function preferences({sound,level,seconds}={}){
      if(sound!==undefined)chosen=soundChoice(sound);
      if(level!==undefined)volume=clamp(level,0,0.16);
      if(seconds!==undefined)durationSec=clamp(seconds,10,60);
      if(active?.master&&ctx){
        active.master.gain.setTargetAtTime(volume,ctx.currentTime,0.08);
      }
      notify();return state();
    }
    async function activate() {
      if(!AC)throw Error('Audio is not supported in this browser.');
      if(!ctx)ctx=new AC();
      if(ctx.state==='suspended')await ctx.resume();
      return ctx;
    }
    async function armAutomatic(value) {
      autoArmed=!!value;
      if(autoArmed){
        try{await activate();}catch(err){autoArmed=false;notify();throw err;}
      }
      notify();return autoArmed;
    }
    function clearTimers(){if(stopTimer){clearTimeout(stopTimer);stopTimer=0;}}
    function stop(){
      clearTimers();
      const old=active;active=null;
      if(old&&ctx){
        const t=ctx.currentTime;
        try{old.master.gain.cancelScheduledValues(t);old.master.gain.setTargetAtTime(0,t,.07);}catch{}
        for(const osc of old.oscillators){try{osc.stop(t+.25);}catch{}}
        try{old.source.stop(t+.25);}catch{}
        setTimeout(()=>{try{old.source.disconnect();old.filter.disconnect();old.soundGain.disconnect();old.master.disconnect();}catch{}},350);
      }
      notify();
    }
    function generateNoise(context,type) {
      const length=Math.floor(context.sampleRate*2);
      const buffer=context.createBuffer(1,length,context.sampleRate);
      const data=buffer.getChannelData(0);
      let brown=0;
      for(let i=0;i<length;i++){
        const white=(Math.random()*2-1);
        if(type==='rain') data[i]=white*0.18;
        else {brown=(brown+white*.028)/1.028;data[i]=clamp(brown*2.8,-1,1);}
      }
      return buffer;
    }
    function addForestChirps(context,destination,oscillators,atTime){
      // Tiny original oscillator chirps — no licensed recordings or melodies.
      for(let i=0;i<3;i++){
        const t=atTime+i*9+3;
        const o=context.createOscillator(),g=context.createGain();
        o.type='sine';o.frequency.setValueAtTime(550+i*110,t);
        o.frequency.exponentialRampToValueAtTime(850+i*105,t+.24);
        g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.018,t+.08);
        g.gain.exponentialRampToValueAtTime(.0001,t+.40);
        o.connect(g);g.connect(destination);o.start(t);o.stop(t+.41);
        oscillators.push(o);
      }
    }
    async function play({sound,level,seconds}={}){
      preferences({sound,level,seconds});
      const context=await activate();
      stop();
      const start=context.currentTime;
      const master=context.createGain();master.gain.setValueAtTime(0,start);
      master.gain.linearRampToValueAtTime(volume,start+1);
      master.connect(context.destination);
      const filter=context.createBiquadFilter();filter.type='lowpass';
      filter.frequency.value=chosen==='rain'?3400:chosen==='ocean'?690:1250;
      const soundGain=context.createGain();soundGain.gain.value=1;
      filter.connect(soundGain);soundGain.connect(master);
      const source=context.createBufferSource();source.buffer=generateNoise(context,chosen);source.loop=true;
      source.connect(filter);
      const oscillators=[];
      if(chosen==='ocean'){
        // Ocean-style wave swell, 12-second cycle.
        const swell=context.createOscillator(),amount=context.createGain();
        swell.type='sine';swell.frequency.value=1/12;
        soundGain.gain.value=.72;amount.gain.value=.24;swell.connect(amount);amount.connect(soundGain.gain);
        swell.start();oscillators.push(swell);
      } else if(chosen==='forest')addForestChirps(context,master,oscillators,start);
      source.start(start);
      active={source,filter,master,soundGain,oscillators,sound:chosen};
      stopTimer=setTimeout(()=>stop(),durationSec*1000);
      notify();return state();
    }
    async function onPatternAlert(){
      if(!autoArmed)return false;
      const t=clock();
      if(t-lastAutomatic<MIN_COOLDOWN_MS||active)return false;
      lastAutomatic=t;
      try{await play();return true;}catch{autoArmed=false;notify();return false;}
    }
    async function pause(){stop(); if(ctx?.state==='running')await ctx.suspend();}
    async function dispose(){autoArmed=false;stop();if(ctx){try{await ctx.close();}catch{}ctx=null;}}
    return Object.freeze({preferences,activate,armAutomatic,play,onPatternAlert,stop,pause,dispose,state});
  }
  globalThis.PausePilotRelaxation=Object.freeze({createEngine,breathingPhase,soundChoice,SOUNDS,MIN_COOLDOWN_MS});
})();
