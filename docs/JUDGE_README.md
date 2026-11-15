# Judge quick start — PausePilot

## Open the demo
**https://pausepilot-buildathon-demo.onrender.com**

No download or extension is required. The website is a **safe simulation**: it does not deliver email or post comments. Try a desktop browser or incognito session.

## One-minute interactive walkthrough
1. Select **Email Guard**, then the **Firm but professional** example. Press Send and observe that an ordinary assertive message can proceed without a reconsideration warning.
2. Select **Personal attack**, then press Send. PausePilot displays an explanation and offers **Return to editing**, **Keep draft**, or a simulated send.
3. Select **Return to editing**; the original text is intact.
4. Switch to **Comment Guard**. Select a hostile sample and press Post to see the same safety and evaluation flow.

The classification may occasionally be wrong; we explicitly evaluate false positives and false negatives.

## What AI adds
PausePilot checks context at **the action point** rather than requiring a stress check-in. It distinguishes, imperfectly, direct insults from professional assertiveness and quoted abuse. The user always decides whether to proceed.

## Evidence (not product outcome proof)
- 160-case original rules baseline: 140/160 exact label matches (87.5%).
- 12-case preliminary live pilot: specialized AI 11/12, plain LLM 10/12, rules 9/12.
- Offline safety after a crisis patch: 75/75 curated cases with guardrails, compared with 67/75 originally.
- Labels are synthetic and full human review and full live-model evaluation are pending. No evidence yet of reduced actual regret or stress.

## Real-world extension
An **opt-in, locally installed Gmail extension** was separately manually tested: pre-send warning, editing, draft preservation, and one successful authorized email delivery. It is **not** published in the Web Store and is not required for this website.

## Limitations and privacy
No real email or comments are sent by this web demo. The system is not an emotion detector or mental-health treatment. For real AI requests, selected draft text goes to the model provider when users press Send/Post. Do not submit confidential data. Anonymously accessible browser sessions and in-memory rate caps are intended only for a limited demo.

## Team and links
- Repository: https://github.com/vsasanka/pausepilot-buildathon (currently private; organizers need access).
- Problem statement: [../problem.md](../problem.md)
- Evaluation: [eval_report.md](eval_report.md)
- Safety: [crisis_fix_report.md](crisis_fix_report.md)
- Demo/pitch instructions: [DEMO_SCRIPT.md](DEMO_SCRIPT.md)
