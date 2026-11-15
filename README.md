> **Latest release: v0.9.** Email Guard, Comment Guard, on-device Mouse Movement Lab with persistent per-tab baseline, optional calming soundscapes and spoken breathing cues, plus a 14-day **synthetic-data** Insights dashboard in both web app and Chrome extension. No user analytics are collected by that dashboard. See [release setup](START_WEB_V09.md) and [measurement plan](docs/INSIGHTS_METRICS.md). The website is updated through Render after this GitHub commit deploys.

# PausePilot — AI for Good Buildathon Demo (v0.6)

**Your second thought, before your first mistake.**

- **Public interactive demo:** https://pausepilot-buildathon-demo.onrender.com
- **Source repository:** https://github.com/vsasanka/pausepilot-buildathon
- **Judge overview:** [docs/JUDGE_README.md](docs/JUDGE_README.md)
- **Pitch and recording:** [docs/DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md)
- **Submission checklist:** [docs/SUBMISSION_CHECKLIST.md](docs/SUBMISSION_CHECKLIST.md)

PausePilot is an opt-in AI-assisted pre-send/pre-post reconsideration demo for adults who write email or comments under pressure. The website simulates sending/posting; **it never sends real emails or publishes actual comments**. It does not infer or diagnose emotions.

## Public features

- **Email Guard:** Write a draft, attempt a simulated send, receive a contextual review when warranted, or return to editing with text intact.
- **Comment Guard:** Test the same AI and safety layer before a simulated social comment is posted.
- **Safety controls:** Deterministic crisis-support response for certain explicit statements, user-controlled decisions, signed anonymous web sessions, CSRF checks and in-memory request caps.
- **Expandable architecture:** Add new modules through [features/registry.js](features/registry.js) and [docs/ADDING_FEATURES.md](docs/ADDING_FEATURES.md).

An **independent local Gmail extension proof of concept** was manually tested: opt-in send interception, return to editing, draft preservation and one self-addressed authorized delivery were confirmed. The public website does not automatically install or connect that extension.

## Running locally

```bash
npm test
npm run security:audit
npm start
```

Open http://localhost:4173 for rule-based demo mode. For live AI on a developer machine, create an untracked `.env` from `.env.example` with your own `OPENAI_API_KEY`, then run `npm run start:ai`. Never commit `.env`.

## Check the hosted deployment

```bash
npm run smoke:deploy -- https://pausepilot-buildathon-demo.onrender.com
npm run smoke:deploy -- https://pausepilot-buildathon-demo.onrender.com --ai
```

The second command makes one billable model request. A browser tested the five main user flows, including the incognito experience. The external smoke-test command has not yet been confirmed.

## Evidence, in context

- 160 synthetic functional examples: **140/160** matched original rule baseline labels (87.5%). This is **not** the specialized live AI score.
- Preliminary 12-case pilot: specialized AI **11/12** (91.7%); plain LLM **10/12** (83.3%); rules **9/12** (75%). Sample too small for robust generalization.
- 75 curated offline safety examples: original rules **67/75**; guarded rules after crisis patch **75/75**. This does not establish real-world safety.
- **30+ human-reviewed benchmark labels are still pending**, along with the full live AI benchmark.

See [docs/eval_report.md](docs/eval_report.md), [docs/crisis_fix_report.md](docs/crisis_fix_report.md), [safety/results/phase4-guarded.md](safety/results/phase4-guarded.md). These artifacts are intended for transparent reporting, not as claims of clinical efficacy.

## Deployment and costs

The app runs as one Render web service using [render.yaml](render.yaml). `OPENAI_API_KEY` must remain on the server. The anonymous session gate and in-memory caps are **not full user authentication**, and limits reset on service restart. Enforce a conservative OpenAI project spending limit for public demos. Render Free services may sleep when idle.

**This is a prototype, not a medical, diagnostic, or emergency response service.**
