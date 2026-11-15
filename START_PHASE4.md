> Updated v0.4.1: start with [START_CRISIS_FIX.md](START_CRISIS_FIX.md) for the crisis-safety patch and offline before/after evaluation.

# START HERE — Phase 4 Evaluation and Safety (PausePilot v0.4)

**Do NOT replace your currently working Chrome extension for Phase 4.** This package is based on the working v0.3.1 Gmail code, with added evaluation scripts and reports. The Gmail adapter and service endpoint logic were left unchanged.

## On your Mac

1. Extract ZIP to a new `pausepilot-phase4` folder.
2. Copy your PRIVATE `.env` file from the previous working PausePilot folder into `pausepilot-phase4/`. Never paste the key into chat or commit it.
3. Open Terminal in the extracted folder. Run the free tests:

```bash
npm test
npm run eval:phase4:rules
npm run safety:phase4:rules
npm run security:audit
```

4. Live AI vs original rules vs minimally instructed LLM baseline. **These calls are billable**; an explicit opt-in and case limit is required. First try a small, balanced sample:

```bash
npm run eval:phase4:compare -- --paid --limit=12
npm run safety:phase4:compare -- --paid --limit=12
```

5. If billing and results look reasonable, run a larger sample (160 evaluation scenarios and 75 safety scenarios, up to 470 total model calls if both 3-way comparisons run completely). Check remaining API credits before doing this:

```bash
npm run eval:phase4:compare -- --paid --limit=160
npm run safety:phase4:compare -- --paid --limit=75
```

**Caution:** The full 3-way runs make **two paid requests per case** (specialist + plain LLM). The rules baseline is free. Requests stop on reported authentication or quota errors. No guarantee of total cost; actual usage depends on provider pricing and token counts. Do not repeat runs unnecessarily. If the API rate-limits, stop and investigate rather than retrying aggressively.

## Where results go

- `eval/results/phase4-rules.md` — actual offline baseline report
- `safety/results/phase4-rules.md` — actual offline safety report
- `eval/results/phase4-compare.md` — paid comparison report once you run it
- `safety/results/phase4-compare.md` — paid safety comparison once you run it
- `safety/results/security-audit.md` — high-risk deployment issues
- `docs/manual-gmail-regression.md` — user-reported Gmail test record

The original filenames `docs/eval_report.md` and `docs/safety_report.md` contain the latest offline rule scores. **After a paid comparison, use the `phase4-compare.md` reports as evidence.**

## Required human review

- Open `eval/data/manual_review_queue.csv` (40 rows) and `safety/data/manual_review_queue.csv` (30 rows).
- For **at least 30 evaluation cases**, a real team member must fill `reviewer_label` (allow/review/urgent), `reviewer_name`, and optional notes. These are **not** auto-approved. Consider having a second reviewer resolve ambiguous cases.
- Do the same for safety cases, especially all critical crisis tests.
- Save the worksheets as CSV and import verified edits:

```bash
npm run review:import -- --dataset=eval --apply
npm run review:import -- --dataset=safety --apply
npm run eval:phase4:rules
npm run safety:phase4:rules
```

Human review can change expected labels; that is why labels and the audit worksheet are preserved.

## Major findings so far

- Offline rules: **140/160 exact-match evaluation cases (87.5%)**.
- Offline rules: **67/75 policy-passing safety cases (89.3%)**.
- **Critical blocker:** 8/8 added first-person crisis cases were missed by the rules classifier and lacked crisis support resources. Must be fixed before describing the app as crisis-safe.
- **Deployment blockers:** public API is not authenticated/rate-limited and CORS trusts arbitrary Chrome extension origins. Do not deploy the funded API as-is to an open public URL.
- These are synthetic scores, not evidence of mental-health outcomes or user regret prevented.

## Submission reminders

The buildathon also requires a public interactive URL, 30+ hand-reviewed benchmark cases, 50+ safety prompts, a reproducible evaluation, `problem.md`, and a 5-slide pitch with a recorded demonstration. These are **not all complete yet**. In particular, the public API must be hardened before deployment.
