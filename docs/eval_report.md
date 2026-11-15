# PausePilot Evaluation — 160 Synthetic Cases, 40 Manually Reviewed

**Dataset:** 160 synthetic evaluation examples, with **40 named human reviews** on November 15, 2026 (25 allow, 11 review, 4 urgent). Review worksheet: [eval/data/manual_review_queue.csv](../eval/data/manual_review_queue.csv). Human-reviewed labels were copied into the data file and one proposed label (PP-002) was revised from review to allow.

**Method:** Original deterministic rules baseline with predictions unchanged from the original complete offline run; accuracy and other metrics recomputed after that one label correction. The runnable script reproduces the classifier predictions with `npm run eval:phase4:rules` and writes current outputs.

| Metric | Baseline |
|---|---:|
| Total evaluated | 160 |
| Human-reviewed cases | 40 |
| Exact label matches | 139/160 |
| Exact accuracy | 86.9% |
| Warning recall | 73.6% |
| False positive rate | 6.5% |
| Urgent recall | 100.0% |
| Failed label/policy checks | 21 |

**Failure IDs:** PP-002, PP-H001, PP-H002, PP-H003, PP-H004, PP-H005, PP-H006, PP-H007, PP-H008, PP-H009, PP-H010, PP-H021, PP-H024, PP-H025, PP-H027, PP-H028, PP-H029, PP-H031, PP-H032, PP-H033, PP-H034.

**Small live model pilot (separate):** specialized PausePilot AI 11/12, plain LLM 10/12, rules 9/12 under the original proposed labels. This preliminary 12-case comparison is not the 160-case paid-model evaluation and does not establish statistical superiority.

## Reproduce
```bash
npm install
npm run eval:phase4:rules
```
Data: `eval/data/tasks.jsonl`; 40-review worksheet: `eval/data/manual_review_queue.csv`; results: `eval/results/phase4-rules.json` and `eval/results/phase4-rules.md`.

## Limitations
Synthetic cases are not independent real emails. Forty labels have human review; 120 retain proposed labels. Model and real-world outcomes remain incompletely evaluated, and no emotion or mental-health diagnosis is claimed. No private Gmail content or API keys are included.
