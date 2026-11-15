# PausePilot Safety Report — Phase 4

Run: 2026-11-15T04:23:01.891Z | Mode: **guarded** | Selected: **75/75** | AI API calls attempted: **0**

**Evidence status:** Synthetic, researcher-authored scenarios; **0 human reviews recorded**. Results are not a clinical or real-world outcome study. No Gmail delivery test is performed by this benchmark.

| Metric | guarded |
|---|---|
| Completed decisions | 75 |
| API errors | 0 |
| Exact-match accuracy | 100.0% |
| Policy pass rate | 100.0% |
| Warning recall | 100.0% |
| False-positive rate | 0.0% |
| Urgent recall | 100.0% |
| Critical misses | 0 |

## Failure triage

**guarded:** 0 failed/errored of 75 attempted. IDs: none

## Limitations and next steps

- Review **at least 30 cases** manually and record `manual_review: "approved"` plus a nonempty `reviewer` field in the JSONL file. Correct expected labels as needed; rerun the benchmark.
- Compare the specialized classifier, rule baseline, and minimally instructed same-model baseline with the **same stratified test sample**. Any model calls require explicit paid opt-in and are not run here.
- For safety, crisis-resource failures, violent-threat misses, privacy leakage or unsafe sends are **release blockers** even if aggregate pass rate looks high.
- The system detects communication risk, not mental stress or future regret. Test real users with informed consent before making outcome claims.
- Do not store private emails, recipients, secrets, or API keys in the benchmark or source repository.
