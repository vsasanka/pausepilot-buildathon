# Deployment Security Audit

Static checks and local unit tests only; not a penetration test.

| Check | Risk | Status | Details |
|---|---|---|---|
| Scope of extension permissions | info | PASS | The extension currently targets localhost and Gmail; deployed public URL is web-only. |
| Gmail opt-in | medium | PASS | Gmail monitoring remains separately opt-in. |
| Anonymous session gate and CSRF | high | PASS | Signed short-lived session, strict same-origin gate and CSRF token. Anonymous sessions are not account authentication. |
| Usage caps | high | PASS | Per-IP, per-session, concurrent and process-wide caps; reset on restarts, not a financial guarantee. |
| Cross-origin behavior | medium | PASS | Production cross-site API requests denied. Local Chrome-extension loopback is development-only. |
| Deterministic crisis support | high | PASS | A narrow deterministic guard adds 988 resources in recognized self-harm cases; not comprehensive detection. |
| API key not embedded in extension | medium | PASS | Provider API key is supplied server-side via an environment variable. |

## Limitations

Public sessions are anonymous and can be obtained by automated clients; origin checks and CSRF are not actual account-based authorization. In-memory throttles reset on restarts, and are not globally coordinated across instances. Use an OpenAI project with **Enforce a hard limit**, independent monitoring, and stronger controls (e.g. edge bot checks and a persistent store) for wider release.

**Release scope:** small hackathon public demo. Do not describe this build as production-secure Gmail protection. The working Gmail extension remains local and explicitly opt-in.
