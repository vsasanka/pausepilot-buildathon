# PausePilot v0.2 — AI classification design

## What the model judges

Potentially harmful **outbound communication** at the moment the user clicks Send. This application does not claim to detect stress, infer mood, or diagnose mental health.

Input: user-controlled draft text (up to 5,000 characters), channel email/comment. Drafts are treated as untrusted data. Server-side model endpoint uses strict structured JSON schema.

Output:

```json
{"decision":"review","reason":"This sounds like a personal attack.","evidence":"Direct insult","suggestion":"Describe the problem and the requested change, not the person's character.","mode":"ai","confidence":null}
```

The model is asked to return one of:

- `allow`: ordinary, firm but respectful, or reported/quoted harmful language.
- `review`: personally insulting, degrading, hostile escalation toward recipient.
- `urgent`: explicit threat of violence or encouragement to self-harm directed to another person, not quoted or reported.

This is a communication risk estimate, not an emotional diagnosis. Rules mode is visibly labeled `demo-rules` when the API key is absent.

## Safety of interception

- The sender controls the final action. No AI decision silently sends, deletes, or rewrites the draft.
- On AI-provider error/refusal, unfinished completion, bad JSON, or timeout, the extension preserves the draft and requires explicit user action.
- A direct threatening message should trigger stronger review; the app is not an emergency service.
- Response reasons are short and do not need to echo user-provided sensitive text.
- No passwords or keypresses are collected in the app's intended flow.
- Local development server has no authentication or rate limiting. Do **not** deploy an exposed paid API endpoint without access control, abuse prevention, usage limits, and logging that avoids draft content.

## Limits

The classifier may miss indirect threats, sarcasm, cultural nuance, or unsafe context. It may unnecessarily interrupt an assertive message. The tests are synthetic and have not been verified with an independent, manually labeled real-world sample.

## Validation plan

1. Confirm extension interception + original text retained in Chrome.
2. Run six illustrative model smoke tests, inspect any mismatches.
3. Manually review at least 30 of the 120 seeded eval labels, revise ambiguous cases, then execute the full benchmark with the same model settings.
4. Inspect the 50 red-team cases for prompt injection, bias, privacy leakage, quoted threats and actual threats; do not rely on exact label match alone.
5. Measure a baseline using the same examples. Do not report synthetic rule-mode scores as measured AI accuracy.
6. Validate Gmail button adapter separately; shortcuts and all Gmail send paths are not yet covered.

## AI setup

Official reference: https://developers.openai.com/api/docs/guides/structured-outputs
