/**
 * Narrow, auditable pre-send safety intervention for clear, first-person crisis
 * statements. It is NOT a diagnosis or a comprehensive suicide-risk detector.
 * Deliberately avoid classifying quoted/reported text as the sender's crisis.
 * Do not transmit clearly detected personal-crisis text to the model provider.
 */

// Avoid interpreting directly quoted or email-reported statements as the
// author's own. Keep contractions (I'm, I'll) intact.
function removeQuotedText(value) {
  return String(value || '')
    .replace(/“[^”\n]*”|"[^"\n]*"|‘[^’\n]*’/g, ' ')
    .replace(/(^|[\s(])'[^'\n]{0,500}'(?=[\s).,!?:;]|$)/gm, '$1 ')
    .replace(/^\s*>[^\n]*$/gm, ' ');
}

const firstPerson = /\b(?:i|i'm|i’m|i am|i've|i’ve|i have|myself|my own)\b/i;
const directlyConcerning = [
  /\b(?:kill|killing|harm|harming|hurt|hurting)\s+myself\b/i,
  /\b(?:take|taking)\s+my\s+(?:own\s+)?life\b/i,
  /\b(?:end|ending)\s+my\s+life\b/i,
  /\b(?:commit|committing|considering|thinking\s+(?:about|of))\s+suicide\b/i,
  /\b(?:i(?:\s+am|'m|’m))\s+suicidal\b/i,
  /\b(?:i\s+(?:want|wish|need|plan|intend)\s+to)\s+(?:die|end\s+it\s+all)\b/i,
  /\bi\s+(?:am|['’]m)\s+(?:planning|preparing)\s+to\s+end\s+it\s+all\b/i,
  /\bi\s+(?:want|wish)\s+to\s+be\s+dead(?=[.,!?]|$)/i,
  /\bi\s+(?:do\s+not|don't|don’t)\s+think\s+i\s+can\s+stay\s+safe(?:\s+(?:tonight|today|anymore))?\b/i,
  /\b(?:i\s+(?:do\s+not|don't|don’t)\s+want\s+to\s+(?:be\s+alive|live))\b/i,
  /\b(?:i\s+(?:am|'m|’m)\s+in\s+danger\s+from\s+myself)\b/i,
];
const contextual = /\b(?:i\s+(?:think|believe|feel)\s+i\s+(?:may|might|could)\s+(?:hurt|harm|kill)\s+myself|i\s+have\s+(?:a\s+)?plan\s+to\s+(?:hurt|harm|kill)\s+myself)\b/i;
const reportingContext = /\b(?:a\s+(?:customer|patient|student|colleague|friend|person)\s+(?:said|wrote|reported)|he\s+(?:said|wrote)|she\s+(?:said|wrote)|they\s+(?:said|wrote)|quoted\s+from|the\s+(?:phrase|sentence|quote)|for\s+documentation|i\s+am\s+reporting|in\s+the\s+(?:story|novel|script))\b/i;

export function isDirectPersonalCrisis(text) {
  const scrubbed = removeQuotedText(text).trim()
    // Clear denials are not themselves statements of intent. A separate
    // affirmative statement in the same draft will still be evaluated.
    .replace(/\bi\s+(?:do\s+not|don't|don’t|never)\s+(?:want|plan|intend|need)\s+to\s+(?:kill|hurt|harm)\s+myself\b/gi, ' ')
    .replace(/\bi\s+(?:will\s+not|won't|won’t)\s+(?:kill|hurt|harm)\s+myself\b/gi, ' ')
    .replace(/\bi\s+(?:am|['’]m)\s+not\s+going\s+to\s+(?:kill|hurt|harm)\s+myself\b/gi, ' ');
  if (!firstPerson.test(scrubbed)) return false;
  // When a reported quote is unmarked, prefer human review to guessing it is
  // the author's intent. A clear new first-person sentence can still trigger.
  const segments = scrubbed.split(/(?<=[.!?])\s+|\n+/).map(s => s.trim()).filter(Boolean);
  for (const segment of segments) {
    if (reportingContext.test(segment)) continue;
    // Discussion of prevention or research is not itself a direct crisis.
    const actual = segment.replace(/\b(?:thinking\s+(?:about|of)|considering|planning)\s+suicide\s+(?:prevention|awareness|research|policy|training|education)\b/gi, ' ');
    if (!firstPerson.test(actual)) continue;
    if (directlyConcerning.some(p => p.test(actual)) || contextual.test(actual)) return true;
  }
  return false;
}

export const CRISIS_RESPONSE = Object.freeze({
  decision: 'urgent',
  reason: 'This may describe an immediate personal safety concern. Reaching out to someone you trust can help.',
  evidence: 'Possible first-person safety crisis; not a diagnosis.',
  suggestion: 'If you are seeking help, you can still send this. In the U.S., call or text 988 for support. Elsewhere, contact local crisis services; for immediate danger, call emergency services.',
  mode: 'safety-rule',
  confidence: null,
  safetyGuard: true,
});

export function ensureCrisisResources(text, existing) {
  if (!isDirectPersonalCrisis(text)) return existing;
  // The reviewed, fixed response is deterministic: a model cannot accidentally
  // omit resources or replace them with unsafe suggestions.
  return {...CRISIS_RESPONSE};
}
