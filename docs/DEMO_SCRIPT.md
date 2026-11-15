# Three-minute PausePilot pitch and 45-second recording

**Live URL:** https://pausepilot-buildathon-demo.onrender.com

0:00–0:25 — Problem: people ask AI for advice once they realize they need it, but impulsive digital sends happen earlier. PausePilot offers a second thought without guessing emotions.

0:25–0:45 — Evidence: external Twitter product tests found 34% revised or cancelled prompted replies; randomized research found a 6% reduction in offensive tweets among prompted users. Neither number describes our product's effect.

0:45–1:10 — Show the public app's Email and Comment Guard tabs. Explain that sending/posting is safely simulated.

1:10–1:35 — Select **Firm but professional** and click Send. Explain the value of not interrupting normal professional communication.

1:35–2:05 — Select **Personal attack** and click Send. Show warning, **Return to editing**, and preserved draft.

2:05–2:25 — Show Comment Guard hostile reply. Briefly mention the separately tested local Gmail extension proof of concept; do not present it as a published Chrome Web Store product.

2:25–2:45 — Explain preliminary benchmarks: 11/12 specialized AI, 10/12 plain LLM, 9/12 rules on a small pilot; 75/75 curated offline safety cases after adding deterministic crisis support. Human review and full paid model benchmarking remain incomplete.

2:45–3:00 — Invite judges to try the public link. Future success metrics: missed risky messages, false warnings, intentional revision rates, and unintended send count.

## Pre-recorded demo video required by the kickoff deck

Capture 45–60 seconds of the **actual hosted website** using macOS Shift+Command+5:
1. Email Guard: firm example proceeds normally.
2. Email Guard: personal attack prompts review, Return to editing preserves text.
3. Comment Guard: hostile reply prompts review.
4. End with the public URL.

Do not show Gmail private inboxes, personal addresses, or API keys. Put the video file or share link in the repository's `docs/` folder and submission form. This video has **not** yet been recorded.

## Judges' likely questions
- **Real sends?** Not from the public web demo. Local Gmail extension proof of concept was separately tested with a self-addressed email.
- **Why AI?** Nuance across direct insults, quotes, sarcasm, and appropriate assertiveness. Advantage shown only on a small pilot so far.
- **What if AI fails?** Preserve the draft; do not automatically send or delete.
- **Safety?** Crisis support for certain explicit statements, no diagnosis, user control, server-side key and limited request caps. Not a substitute for clinical care.
