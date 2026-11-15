import './relaxation-core.js';

// UI layer; the sound engine is shared with the unpacked Chrome extension.
export function installRelaxationStudio() {
  const $=id=>document.getElementById(id);
  const C=globalThis.PausePilotRelaxation;
  const chosenSounds=document.querySelectorAll('.relax-sound');
  let breathTimer=0,breathStart=0,quietUntil=0,chosen='rain',lastBreathPhase='';
  const status=$('relaxState');
  const engine=C.createEngine({onState: state=>{
    $('relaxPlay').textContent=state.playing?'♪ Playing…':'▶ Play 30s';
    $('relaxPlay').disabled=state.playing;
  }});
  const say=text=>{status.textContent=text;};
  function settings(){return {sound:chosen,level:Number($('relaxVolume').value)/100,seconds:30};}
  function speak(phase){
    if(!$('relaxVoice').checked||!window.speechSynthesis||typeof SpeechSynthesisUtterance!=='function')return;
    try{window.speechSynthesis.cancel();const voice=new SpeechSynthesisUtterance(phase==='Inhale gently'?'Breathe in gently':'Breathe out slowly');voice.lang='en-US';voice.rate=.86;voice.volume=.55;window.speechSynthesis.speak(voice);}catch{say('Voice unavailable; visual breathing is still available.');}
  }
  function stopBreathing() {
    if(window.speechSynthesis)try{window.speechSynthesis.cancel();}catch{}
    lastBreathPhase='';
    if(breathTimer){clearInterval(breathTimer);breathTimer=0;}
    $('relaxBreath').hidden=true;
    $('relaxBreathe').textContent='Start 30s breathing guide';
  }
  function endAll({unarm=false}={}){
    engine.stop();stopBreathing();
    if(unarm){$('relaxAuto').checked=false;void engine.armAutomatic(false);}
    say('Stopped. Nothing has been recorded.');
  }
  async function startSound(){
    try{await engine.play(settings());say(`${chosen[0].toUpperCase()+chosen.slice(1)} ambience playing softly for 30 seconds. You can stop anytime.`);}
    catch{say('Browser blocked audio. Click Play again or check site sound permissions.');}
  }
  for(const btn of chosenSounds)btn.addEventListener('click',()=>{
    chosen=C.soundChoice(btn.dataset.sound);
    for(const x of chosenSounds){const yes=x===btn;x.classList.toggle('active',yes);x.setAttribute('aria-pressed',String(yes));}
    engine.preferences(settings());
  });
  $('relaxVolume').addEventListener('input',()=>{
    const v=Number($('relaxVolume').value);$('relaxVolumeLabel').textContent=v===0?'Silent':v<=8?'Low':'Medium';
    engine.preferences(settings());
  });
  $('relaxPlay').addEventListener('click',()=>void startSound());
  $('relaxStop').addEventListener('click',()=>endAll());
  $('relaxAuto').addEventListener('change',async()=>{
    try{
      await engine.armAutomatic($('relaxAuto').checked);
      say($('relaxAuto').checked?'Automatic sound armed for this page only; sound remains silent until the next movement alert.':'Automatic sound is off.');
    }catch{ $('relaxAuto').checked=false;say('Could not enable audio. Try pressing Play first.'); }
  });
  $('relaxBreathe').addEventListener('click',()=>{
    if(breathTimer){stopBreathing();say('Breathing guide stopped.');return;}
    breathStart=performance.now();lastBreathPhase='';$('relaxBreath').hidden=false;
    $('relaxBreathe').textContent='Stop breathing guide';
    say('A gentle 30-second breathing guide. Follow at your own comfortable pace.');
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function tick(){
      const elapsed=performance.now()-breathStart;
      if(elapsed>=30000){stopBreathing();say('Breathing pause complete. Continue when ready.');return;}
      const phase=C.breathingPhase(elapsed);
      if(phase.name!==lastBreathPhase){lastBreathPhase=phase.name;speak(phase.name);}
      $('relaxBreathLabel').textContent=phase.name;
      $('relaxBreathTime').textContent=`${Math.ceil((30000-elapsed)/1000)}s`;
      $('relaxOrb').style.transform=reduced?'none':`scale(${phase.scale})`;
    }
    tick();breathTimer=setInterval(tick,180);
  });
  $('relaxNudgePlay').addEventListener('click',()=>{
    if(Date.now()<quietUntil)return;
    void startSound();
  });
  $('relaxNudgeQuiet').addEventListener('click',()=>{
    quietUntil=Date.now()+5*60000;
    $('motionNudge').hidden=true;
    say('Movement reminders paused for five minutes.');
  });
  async function onMovementAlert(){
    if(Date.now()<quietUntil){$('motionNudge').hidden=true;return;}
    if($('relaxAuto').checked){
      const started=await engine.onPatternAlert();
      if(started)say('Your opted-in ambience started after a movement-variation signal.');
    }
  }
  async function shutdown(){endAll({unarm:true});await engine.pause();}
  document.addEventListener('visibilitychange',()=>{if(document.hidden)void shutdown();});
  window.addEventListener('blur',()=>void shutdown());
  window.addEventListener('pagehide',()=>void engine.dispose());
  return Object.freeze({onMovementAlert,shutdown,shouldQuiet:()=>Date.now()<quietUntil});
}
