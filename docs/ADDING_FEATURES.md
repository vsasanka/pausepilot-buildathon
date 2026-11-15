# Adding features to PausePilot

**Architecture goal:** add an interaction type without rewriting the protected API, AI classifier, review modal, or deployment settings.

## How it is organized

| Folder/file | Purpose |
| --- | --- |
| `features/registry.js` | Authoritative list of enabled interactive text modules and scenario examples. |
| `server.js` | Shared secure HTTP routes; `GET /api/features` provides the registry to the browser; `POST /api/analyze` validates selected feature and invokes the classifier. |
| `lib/classifier.js` | Common AI classifier, prompt safeguards, and offline rules. |
| `lib/crisis-safety.js` | Model-independent high-confidence crisis guard and resources. |
| `lib/deploy-security.js` | Browser sessions, CSRF, request caps, and origin protection. |
| `public/index.html`, `public/app.js` | Generic composer, tabs, warning modal, per-feature draft preservation. |
| `extension/` | Existing **local** Gmail integration; not connected to the public service. |
| `tests/` | Backend and feature tests. |

## Add another text guard

1. Add one object to `FEATURE_REGISTRY` in `features/registry.js` with a unique `id`, `title`, `composerTitle`, `fieldLabel`, `action`, `description`, and 3+ safe example scenarios. Set `classifierChannel` to an existing reviewed classifier channel (`email` or `comment`). For example, a direct-message guard can use the `comment` channel initially.
2. Add a tab with matching `data-feature="your-id"` to `public/index.html`. The existing web UI will obtain its copy and example buttons from `/api/features`.
3. Add module-specific form fields only if genuinely needed. The shared editor already handles text, drafts, decision modal, and API errors.
4. Add at least five cases to evaluation/safety data, including a safe message, hostile message, quote, language variation, and ambiguous context.
5. Run `npm test` and verify two manual scenarios on deployed site after pushing to GitHub.

## Add a new kind of signal (not text)

A focus-drift signal is NOT an email/comment. It requires consent, a separately designed signal collector, documented privacy treatment, and its own evaluator and test cases. Do not send tab history or raw browsing events to the communication-risk classifier. Add it as a distinct feature module and route after testing the privacy and false-positive risks.

## Release discipline

- Never edit deployed API keys, CI secrets, or local `.env` into the repo.
- Use a branch and pull request for new features; the included GitHub Actions tests run before merge.
- The live application is a simulation: it must never send email or publish comments.
- Review every new feature against the hackathon's safety and privacy requirements before enabling.
- Keep the working local Gmail extension separate from public web development.
