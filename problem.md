# PausePilot — Problem, solution, and evidence

**Target user:** Adults in college and early-career roles who write email or online comments under time pressure.

**Problem:** It is easy to send a personal attack or other potentially regrettable message faster than one can reflect. An app that requires a user to recognize and type out their stress misses the decisive instant. We focus on a user's **digital action**, not diagnosing their mental state.

**External evidence of need:** Twitter reported that 34% of users receiving reconsideration prompts revised or did not send their initial reply in its early tests (Twitter product blog, May 5, 2021). A separate randomized study reported 6% fewer offensive posts among prompted users relative to controls (Katsaros et al., ICWSM, 2022). These figures are **not PausePilot results**.
- https://blog.x.com/en_us/topics/product/2021/tweeting-with-consideration
- https://arxiv.org/abs/2112.00773

**Our solution:** A controlled, opt-in intervention at Send/Post time. PausePilot analyzes the user's drafted text, offers a brief context-aware explanation when warranted, and lets the user **return to editing, retain a draft, or proceed**. The public website simulates sends and posts; no real content is delivered.

**Why AI:** Meaning depends on context, including quotations, sarcasm, multilingual text and professionally assertive communication. Our specialized AI aims to reduce both missed risk and unnecessary interruptions compared with crude keyword rules. The results so far are preliminary, not a claim of superior field performance.

**Delivered:** A public interactive web app with Email Guard and Comment Guard, verified manually across five user flows in incognito mode. Separately, an opt-in local Chrome extension was manually tested inside Gmail, including a single user-approved delivery with no duplicate.

**Measurements and limits:**
- Initial 12-case live pilot: specialized AI 11/12; plain LLM 10/12; rules 9/12 exact label matches. The sample is very small.
- Full 160-case **original rules** baseline: 140/160 label matches (87.5%); the equivalent full paid-model evaluation is pending.
- Curated offline safety suite: 75/75 guarded-rule checks after crisis fix, compared with 67/75 old rules; does not show general safety on unseen material.
- At least 30 human reviews are required for the hackathon and are **not yet documented**.
- The product has not demonstrated any real-world reduction in stress, regret or offensive communication.

**Responsible AI:** No emotional diagnosis or routine keystroke collection; opt-in; no automatic sending; draft preservation; crisis resources for certain clear statements; provider key remains server-side; browser sessions and request rate limits. Public messages may be sent to the AI provider on Send/Post. Do not enter confidential information. Anonymous demo sessions and in-memory caps are not production-grade financial/security guarantees.

**Next distribution channel:** University and early-career communities for validated, voluntary testing. The real Chrome extension can be submitted to the Chrome Web Store after appropriate permission, privacy and security review.
