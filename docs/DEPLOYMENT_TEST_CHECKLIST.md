# PausePilot — Deployment Acceptance Checklist

## Local security checks

- [ ] `npm test` passes (includes session, CSRF, throttling, error-path tests)
- [ ] `npm run security:audit` writes `safety/results/security-audit.md`
- [ ] `npm run eval:phase4:rules` / `npm run safety:phase4:guarded` run if needed; baseline data is unchanged
- [ ] `.env` is not committed or present in the published repository

## Public website checks

- [ ] Public HTTPS URL responds without local installation
- [ ] `/api/health` returns HTTP 200 (does not include a secret)
- [ ] `npm run smoke:deploy -- <url>` passes without paid model calls
- [ ] Optional `npm run smoke:deploy -- <url> --ai` returns a structured `ai` decision
- [ ] Angry message triggers a review popup and preserves text on Return to editing
- [ ] Polite message proceeds only as a simulated web-demo send
- [ ] Clearly personal-crisis synthetic sample produces local crisis resource information
- [ ] AI failures leave the text intact and display a retryable error
- [ ] Both desktop and mobile layouts work

## Operational safeguards

- [ ] OpenAI key created in a dedicated project, not embedded in GitHub or extension files
- [ ] Provider project has an enforceable spending limit (where available) and alerts
- [ ] Public daily and per-session limits configured
- [ ] Render service environment variables entered securely
- [ ] Public link tested on a second browser/device
- [ ] Logs reviewed without dumping private drafts
- [ ] Public demo is labeled a beta demonstration, not medical advice

## Explicitly NOT verified by this deployment

- Full cross-browser or real-world security audit
- Persistent, multi-instance, distributed request throttling
- Full paid benchmark completion and hand-reviewed labels
- Connection of installed Gmail extension to the deployed API
