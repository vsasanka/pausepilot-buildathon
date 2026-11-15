// PausePilot Movement Lab — isolated, local-only exploratory signal.
// This module has no fetch, storage or AI calls. A movement pattern does NOT imply stress.

const MIN_STROKE_PX = 16;
const MAX_GAP_MS = 450;
const DEFAULT_WINDOW_MS = 4200;

const round = n => Math.round(n * 10) / 10;

/**
 * Reduce a short in-memory set of samples to approximate device-dependent
 * movement metrics. Samples are {x,y,t} in pixels/milliseconds, with optional
 * {break:true,t} to exclude movement outside the opt-in pad.
 */
export function summarizeMovement(samples, windowMs = DEFAULT_WINDOW_MS) {
  if (!Array.isArray(samples) || samples.length < 2) return emptySummary();
  const valid = samples.filter(s => Number.isFinite(s.t) && (s.break || (Number.isFinite(s.x) && Number.isFinite(s.y))));
  if (valid.length < 2) return emptySummary();
  const latest = valid[valid.length - 1].t;
  const windowed = valid.filter(s => s.t >= latest - windowMs);
  if (windowed.length < 2) return emptySummary();
  const durationMs = Math.max(0, windowed[windowed.length - 1].t - windowed[0].t);

  let totalDistance = 0;
  let segmentCount = 0;
  let last = null;
  let strokeAnchor = null;
  let previousStroke = null;
  let directionalChanges = 0;
  let reversals = 0;
  let strokes = 0;
  for (const point of windowed) {
    if (point.break) { last = null; strokeAnchor = null; previousStroke = null; continue; }
    if (!last) { last = point; strokeAnchor = point; continue; }
    const dt = point.t - last.t;
    if (dt <= 0 || dt > MAX_GAP_MS) {
      last = point; strokeAnchor = point; previousStroke = null; continue;
    }
    const step = Math.hypot(point.x - last.x, point.y - last.y);
    if (step > 0) { totalDistance += step; segmentCount++; }
    last = point;
    const dx = point.x - strokeAnchor.x;
    const dy = point.y - strokeAnchor.y;
    const size = Math.hypot(dx, dy);
    if (size < MIN_STROKE_PX) continue;
    const stroke = {dx, dy, size};
    strokes++;
    if (previousStroke) {
      const cosine = (previousStroke.dx * dx + previousStroke.dy * dy) / (previousStroke.size * size);
      if (cosine < 0.1) directionalChanges++;
      if (cosine < -0.6) reversals++;
    }
    previousStroke = stroke;
    strokeAnchor = point;
  }
  const seconds = durationMs / 1000;
  return {
    durationMs,
    count: segmentCount,
    strokes,
    distancePx: round(totalDistance),
    averageSpeed: seconds > 0 ? round(totalDistance / seconds) : 0,
    turnsPerSecond: seconds > 0 ? round(directionalChanges / seconds) : 0,
    reversalsPerSecond: seconds > 0 ? round(reversals / seconds) : 0,
  };
}

export function emptySummary() {
  return {durationMs:0,count:0,strokes:0,distancePx:0,averageSpeed:0,turnsPerSecond:0,reversalsPerSecond:0};
}

export function hasEnoughMovement(metrics) {
  return metrics.durationMs >= 2400 && metrics.count >= 12 && metrics.strokes >= 4 && metrics.distancePx >= 110;
}

/**
 * Returns a *movement* observation, never an inferred emotional state.
 * Thresholds are deliberately conservative, unvalidated heuristic values.
 */
export function compareMovement(metrics, baseline) {
  if (!hasEnoughMovement(metrics) || !hasEnoughMovement(baseline))
    return {state:'insufficient',variation:0,reason:'Not enough motion to compare.'};
  const speedRatio = metrics.averageSpeed / Math.max(baseline.averageSpeed, 40);
  const turnJump = metrics.turnsPerSecond - baseline.turnsPerSecond;
  const reverseJump = metrics.reversalsPerSecond - baseline.reversalsPerSecond;
  const manyTurns = metrics.turnsPerSecond >= Math.max(1.8, baseline.turnsPerSecond * 2 + 0.6);
  const manyReversals = metrics.reversalsPerSecond >= Math.max(0.85, baseline.reversalsPerSecond * 2 + 0.45);
  const faster = speedRatio >= 1.5 && metrics.averageSpeed >= 115;
  const elevated = metrics.distancePx >= 175 &&
    ((manyTurns && (manyReversals || faster)) || (manyReversals && faster));
  // Qualitative UI indicator. Not a probability, confidence level, or stress score.
  const variation = Math.max(8, Math.min(100, Math.round(18 +
    Math.max(0, speedRatio - 1) * 16 + Math.max(0, turnJump) * 16 + Math.max(0, reverseJump) * 12)));
  return {
    state:elevated?'changed':'usual',
    variation,
    reason:elevated?'More rapid direction changes than your short baseline.':'No strong pattern change in this brief window.'
  };
}

export const MOVEMENT_EXPERIMENT = Object.freeze({
  baselineMs:5000,
  currentWindowMs:4200,
  stillMs:1400,
  label:'Experimental movement variability only — not stress detection',
});

// A new signal needs a fresh episode after recovery or idle, plus a cooldown.
export function createAlertGate({cooldownMs=20000,confirmWindows=2,recoveryWindows=2}={}) {
  let armed=true, changedStreak=0, recoveredStreak=0, lastAlert=-Infinity, alerts=0;
  const snapshot=()=>({armed,changedStreak,recoveredStreak,lastAlert,alerts});
  function observe(kind,time,quietUntil=0) {
    if(kind==='changed'){
      changedStreak++;recoveredStreak=0;
      if(armed && changedStreak>=confirmWindows && time-lastAlert>=cooldownMs && time>=quietUntil){
        armed=false;lastAlert=time;alerts++;return {...snapshot(),alert:true};
      }
    }else if(kind==='idle' || kind==='usual'){
      changedStreak=0;recoveredStreak++;
      if(kind==='idle' || recoveredStreak>=recoveryWindows)armed=true;
    }else{
      changedStreak=0;recoveredStreak=0; // insufficient data never creates an alert
    }
    return {...snapshot(),alert:false};
  }
  function reset(){armed=true;changedStreak=0;recoveredStreak=0;lastAlert=-Infinity;alerts=0;}
  return Object.freeze({observe,snapshot,reset});
}


