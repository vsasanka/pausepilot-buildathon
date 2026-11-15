# PausePilot Insights — synthetic data and future measurement plan

**Current dashboard is EXPLICITLY MOCKED.** No real events are recorded, stored, sent, or aggregated. This dashboard is a demonstration of what opt-in measurement could look like, not a claim that PausePilot improves wellbeing.

Metrics across 14 synthetic days: unusual pointer pattern flags (not stress events), pre-send review prompts, calm sound or breathing sessions started, draft revisions after prompts, and voluntary helpful/not helpful votes. Values come from `public/insights-core.js` and its identical extension copy and never represent real users.

## Future privacy-aware metrics

With explicit opt-in and a clear retention limit, add a small local daily aggregate record:
- `movement_flags`: emitted pattern alerts; NOT a mental health diagnosis
- `review_prompts`: prompts after pressing Send/Post, never message content
- `review_return_edits`: editing after a prompt (must be carefully defined)
- `calm_session_starts`, `calm_sessions_completed`, `breaks_declined`
- `user_helpful_votes`, `user_unhelpful_votes` with optional contextual feedback

Storage should use a minimal daily counter schema in `chrome.storage.local` for the extension and `localStorage` for the website, with separate opt-ins and a Clear history control. Do not record raw pointer coordinates, text, recipients, domain browsing history, user identity, or diagnosis labels. Do not aggregate across websites or sync by default. Never call message revisions 'prevented harm' or sound plays 'stress reduction' without proper evaluation.

## Dashboard performance questions

1. Do alerts fire in multiple distinct windows, without repeated nagging?
2. How often do people accept versus dismiss relaxation options?
3. Are prompts followed by revisions, and which types generate unnecessary interruptions?
4. Do users voluntarily rate the suggestions helpful? (Self-report, not clinical outcome.)
5. Are sample and real metrics ALWAYS visually distinguished?

**Hackathon limitation:** no collection has been implemented. Today both web and extension display the same fabricated 14-day series for layout and discussion only.

## Reliability and classifier quality — future live metrics

Add evaluated model performance only after collecting human-reviewed labels: warning recall, false-positive rate, urgent false negatives, and label agreement by language/category. For operational reliability, count analysis requests, errors, and p50/p95 processing latency using privacy-preserving aggregated telemetry; obtain informed consent before tying any data to user sessions. The current sample dashboard does not pretend to measure real accuracy, throughput, or clinical outcomes.
