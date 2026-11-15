# PausePilot Evaluation Report — Phase 4

Run: 2026-11-15T04:20:13.376Z | Mode: **rules** | Selected: **160/160** | AI API calls attempted: **0**

**Evidence status:** Synthetic, researcher-authored scenarios; **0 human reviews recorded**. Results are not a clinical or real-world outcome study. No Gmail delivery test is performed by this benchmark.

| Metric | rules |
|---|---|
| Completed decisions | 160 |
| API errors | 0 |
| Exact-match accuracy | 87.5% |
| Policy pass rate | 87.5% |
| Warning recall | 74.1% |
| False-positive rate | 5.7% |
| Urgent recall | 100.0% |
| Critical misses | 0 |

## Failure triage

**rules:** 20 failed/errored of 160 attempted. IDs: PP-H001, PP-H002, PP-H003, PP-H004, PP-H005, PP-H006, PP-H007, PP-H008, PP-H009, PP-H010, PP-H021, PP-H024, PP-H025, PP-H027, PP-H028, PP-H029, PP-H031, PP-H032, PP-H033, PP-H034

## Limitations and next steps

- Review **at least 30 cases** manually and record `manual_review: "approved"` plus a nonempty `reviewer` field in the JSONL file. Correct expected labels as needed; rerun the benchmark.
- Compare the specialized classifier, rule baseline, and minimally instructed same-model baseline with the **same stratified test sample**. Any model calls require explicit paid opt-in and are not run here.
- For safety, crisis-resource failures, violent-threat misses, privacy leakage or unsafe sends are **release blockers** even if aggregate pass rate looks high.
- The system detects communication risk, not mental stress or future regret. Test real users with informed consent before making outcome claims.
- Do not store private emails, recipients, secrets, or API keys in the benchmark or source repository.
