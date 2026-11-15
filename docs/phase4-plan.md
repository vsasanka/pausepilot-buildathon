# PausePilot Phase 4 — Evaluation, Safety & Release Gates

## What is being measured

**Task**: Before sending an outbound digital message, classify its content as `allow`, `review`, or `urgent`. A warning is an optional second thought, not a diagnosis or a claim to know the sender's emotions. User remains in control. The tested product supports one Gmail compose flow, not every way of sending a message.

**Target audience**: Adults who want to avoid regrettable written communication, especially high-pressure workplace or school messages.

## Three fair comparisons

1. **Rules**: Original deterministic classifier, offline and free.
2. **Specialist AI**: PausePilot's structured-output prompt and the same model used by the extension.
3. **Plain LLM baseline**: Same model and JSON schema, but only a short general instruction. This is a minimally instructed model baseline; it is **not** a completely promptless model.

Use the same cases and model version, choose a stratified sample, set temperature=0, and report differences in error rates and latency without claiming causality from a small synthetic test.

## Current dataset

- `eval/data/tasks.jsonl` **160** synthetic authored cases; 120 original template cases and 40 diverse hard cases covering subtle attacks, reported abuse, firm boundaries, and code-switching.
- `safety/data/redteam.jsonl` **75** adversarial cases, including crisis prompts, medical overreach, prompt injection, privacy, and bias. Safety tests check both labels and selected output properties; other privacy behaviors require a static audit and real-browser regression checks.
- `eval/data/manual_review_queue.csv`: **40** representative cases for a real human reviewer. **None are pre-approved.**
- `safety/data/manual_review_queue.csv`: **30** safety scenarios for manual review.

## Reported metrics

- Exact-match label accuracy; precision/recall by practical warning vs allow; false-positive rate; urgent recall; confusion matrix; per-category breakdown.
- Output policy pass (including non-disclosure and crisis resources when relevant); error count, coverage, rough latency percentiles; critical failure IDs.
- `0/160` verified human review at initial generation. DO NOT claim 30 reviewed until actual reviewers sign off.

## Critical safety gates

- First-person suicide/self-harm signals must not be ignored, and the UI should provide appropriate human assistance. **Do not delay an urgent help-seeking communication without considering potential harm**. The original classifier currently fails new crisis test cases; this is a release blocker, not a minor metric defect.
- AI errors must preserve the draft and must never automatically send it.
- No private Gmail drafts should appear in benchmarks, logs, or evaluation files.
- Public server must protect the paid AI endpoint with authentication/limited access, enforce rate limits, restrict extension origins, and constrain spending.
- Real Gmail beta remains opt-in. Human verification is required for duplicate sending, draft changes, multiple tabs, outages, send shortcuts, and unsupported flows.

## Results provenance

No current live model evaluation is included in this deliverable; to compute it, the builder runs `eval:phase4:compare` or `safety:phase4:compare` using their own API key and an explicit `--paid --limit N` cap. All included numerical scores refer to the OFFLINE rule-based baseline. The six-case live smoke test shared earlier is an independent, preliminary observation, not a replacement for the full benchmark.

## Reviewer instructions

Open each CSV, enter a final label and your reviewer name, noting why the draft is threatening, insulting, neutral, quoted, or ambiguous. After checking all required cases, run `npm run review:import -- --dataset=eval --apply` to record signed reviews in the main JSONL; repeat for safety. Rerun benchmark. A label revised by a reviewer changes the test ground truth; keep the review CSV as audit evidence.
