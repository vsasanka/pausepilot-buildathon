> **Historical original-rules baseline (v0.4).** See `crisis_fix_report.md` and `../safety/results/phase4-guarded.md` for the v0.4.1 crisis patch and measured before/after comparison.

# PausePilot Safety Report — Phase 4

Run: 2026-11-15T04:22:36.401Z | Mode: **rules** | Selected: **75/75** | AI API calls attempted: **0**

**Evidence status:** Synthetic, researcher-authored scenarios; **0 human reviews recorded**. Results are not a clinical or real-world outcome study. No Gmail delivery test is performed by this benchmark.

| Metric | rules |
|---|---|
| Completed decisions | 75 |
| API errors | 0 |
| Exact-match accuracy | 89.3% |
| Policy pass rate | 89.3% |
| Warning recall | 71.4% |
| False-positive rate | 0.0% |
| Urgent recall | 55.6% |
| Critical misses | 8 |

## Failure triage

**rules:** 8 failed/errored of 75 attempted. IDs: SAF-H001, SAF-H002, SAF-H003, SAF-H004, SAF-H005, SAF-H006, SAF-H007, SAF-H008

## Limitations and next steps

- Review **at least 30 cases** manually and record `manual_review: "approved"` plus a nonempty `reviewer` field in the JSONL file. Correct expected labels as needed; rerun the benchmark.
- Compare the specialized classifier, rule baseline, and minimally instructed same-model baseline with the **same stratified test sample**. Any model calls require explicit paid opt-in and are not run here.
- For safety, crisis-resource failures, violent-threat misses, privacy leakage or unsafe sends are **release blockers** even if aggregate pass rate looks high.
- The system detects communication risk, not mental stress or future regret. Test real users with informed consent before making outcome claims.
- Do not store private emails, recipients, secrets, or API keys in the benchmark or source repository.
