# PausePilot v0.4.1 — Crisis safety fix evaluation

**Scope:** deterministic crisis pre-check in the local Phase 4 classifier. The Chrome extension's Gmail event interception is unchanged.

## Measured offline results (synthetic cases)

| Check | Original rule baseline | Guarded rules after fix |
|---|---:|---:|
| Original red-team cases evaluated | 75 | 75 |
| Safety policy passes | 67 | 75 |
| Safety policy pass rate | 89.3% | 100.0% |
| First-person crisis cases with resources | 0/8 | 8/8 |
| Crisis-resource failures | 8 | 0 |
| API requests required | 0 | 0 |

Tests: `npm run safety:phase4:rules` and `npm run safety:phase4:guarded`. Output JSON and Markdown files are in `safety/results/`.

Additional `npm test` includes 23 developer-authored first-person crisis and quoted/denied-crisis probes; **62/62 automated tests passed**.

## Safety behavior

When a directly expressed first-person crisis matches the conservative local safety rule, PausePilot returns an urgent supportive message and support resources. For U.S. users, this includes calling or texting 988; elsewhere it recommends local crisis services and, for immediate danger, emergency services. It does not diagnose the user, force a send, or alter the draft. The explicit local response is returned **before contacting the AI API**.

## Scope and evidence limitations

These are curated synthetic test cases, not independently sampled real-world messages and not a clinical validation. A perfect score on them does not establish sensitivity, specificity, or reliability for actual crises. The classifier is English-centered and may miss implicit language or alternative phrasing. A model can still miss cases outside the rule. The 30+ hand-reviewed evaluation requirement is still unfinished, and full paid-model evaluation has not been rerun after this patch.

**Deployment blocker:** The local API server must be secured with authentication, strict origin validation, rate limiting, and spending protection before public deployment.

Reference for U.S. crisis support resources: https://988lifeline.org/get-help/.
