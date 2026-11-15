# PausePilot — Buildathon Public Demo v0.6

**An opt-in second thought before a digital action.** A browser-based demonstration of potentially impulsive communications being reviewed *at send/post time*, with user control, model-independent crisis guardrails, and optional real AI classification.

## Try locally

```bash
npm test
npm start
```

Visit `http://localhost:4173` to use the offline rule-based mode. To use paid AI classification instead, create a **local, untracked** `.env` file from `.env.example` containing `OPENAI_API_KEY`, then run:

```bash
npm run start:ai
```

**Live deployment:** see [`DEPLOY_PUBLIC.md`](DEPLOY_PUBLIC.md). This ZIP does not itself create a public URL; deploy it from GitHub to Render to obtain an actual HTTPS link.

## Features

- **Email Send Guard:** simulated email composer with context-aware review.
- **Comment Guard:** simulated comment composer reusing the same protected analysis service.
- **Shared safety layer:** direct crisis examples receive supported resources without requiring paid model access.
- **Controlled demonstration:** no outgoing emails or real comments; no keylogging or passive surveillance.
- **Extendable design:** feature definitions in [`features/registry.js`](features/registry.js), guide at [`docs/ADDING_FEATURES.md`](docs/ADDING_FEATURES.md).
- **Hackathon evidence:** evaluation and red-team datasets plus reproducible scripts remain included.

The v0.4.1 Chrome extension is retained in the `extension` folder for local Gmail testing, but public hosting does not connect the extension to the server.

## Important limits

This is a hackathon prototype, not a mental-health diagnosis or emergency-support product. Anonymous demo sessions and in-memory request caps are not adequate identity or financial controls for a large public launch. Use dedicated API credits, enforce a provider-level spending limit, and test with synthetic text.
