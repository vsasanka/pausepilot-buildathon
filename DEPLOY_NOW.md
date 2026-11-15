# PausePilot v0.5 — Publish the web demo (Render)

This release focuses on a **public interactive web demonstration**. Your already verified Gmail Chrome extension continues to use the **local** `http://localhost:4173` backend. It is not automatically connected to Render. **Do not replace your working extension just to publish the web demo.**

## 0. Keep your API key private

Do not upload `.env`. This ZIP contains `.env.example` with no key. In Render, add the secret in the Environment settings. Create a **dedicated OpenAI project and API key** for the demo, and enable **Enforce a hard limit** for spending in the OpenAI project dashboard. Set a low limit you can afford. The app's in-memory caps are additional safeguards, not financial guarantees.

## 1. Put the unzipped folder in a GitHub repository

From Terminal in the `pausepilot-deploy-v05` folder:

```bash
git init
git add .
git commit -m "PausePilot hackathon secure public demo"
git branch -M main
```

On GitHub, create an **empty private repository**, e.g. `pausepilot-buildathon`, without a generated README. Copy its HTTPS URL and run:

```bash
git remote add origin https://github.com/YOUR-USERNAME/pausepilot-buildathon.git
git push -u origin main
```

If you don't already have GitHub authentication configured, GitHub may ask you to authenticate with its CLI or a personal access token. **Never paste your OpenAI key** into a Git prompt or repository.

## 2. Deploy on Render

1. Visit <https://dashboard.render.com/> and sign in.
2. Click **New → Blueprint** and connect your GitHub repo.
3. Render reads `render.yaml` and creates one Node web service, named `pausepilot-buildathon-demo` unless that name is already taken. Compute plan: **Free** (you can choose paid for no spin-down).
4. When prompted, enter `OPENAI_API_KEY` from the dedicated OpenAI project. The `PAUSEPILOT_SESSION_SECRET` is generated automatically by Render.
5. Review the listed settings, select **Apply / Deploy**, and wait for the deployment to show **Live**.
6. Render provides an HTTPS URL like `https://pausepilot-buildathon-demo.onrender.com`. Yours may differ; do not assume this example is your URL.

**If Render offers manual Web Service setup instead of Blueprint:** choose runtime `Node`, build command `npm install`, start command `npm start`, health path `/api/health`, and set these env vars in Render: `OPENAI_API_KEY`, `OPENAI_MODEL=gpt-4.1-mini`, `PAUSEPILOT_SESSION_SECRET` (random 32+ characters), `PAUSEPILOT_GLOBAL_DAILY_CAP=100`, `PAUSEPILOT_PER_IP_MINUTE=6`, `PAUSEPILOT_PER_SESSION_HOUR=20`, `PAUSEPILOT_MAX_IN_FLIGHT=2`. Render automatically provides `PORT`, `NODE_ENV=production`, and `RENDER_EXTERNAL_URL`.

## 3. Check the deployed service

Open your actual HTTPS URL in a private/incognito tab. Try the Angry email scenario: the warning should appear before the simulated send. Try a firm, professional message: it should be allowed. The test composer **never sends real emails**.

From your Mac's Terminal, in the project folder:

```bash
npm run smoke:deploy -- https://YOUR-ACTUAL-URL.onrender.com
```

This checks public health, unauthorized access rejection, browser-session creation, and cross-origin rejection **without spending API credits**. To add one real model call:

```bash
npm run smoke:deploy -- https://YOUR-ACTUAL-URL.onrender.com --ai
```

## 4. Keep the Gmail extension operational

Continue using your existing verified extension pointing to the **local** `http://localhost:4173` API. A Render public URL alone does not make Gmail protection work when the local server is stopped. Updating extension API host, Chrome permissions, access control, and privacy disclosure needs a separate integration release.

## 5. Before the judges arrive

- Verify the URL on a second device / private window (no extension installed).
- Keep the Render dashboard available for deploy logs and alerts.
- Avoid free-tier spin-down by opening the site shortly before your demo; the Free instance can take around a minute to wake after 15 idle minutes.
- Monitor your OpenAI project's usage and spend limit.
- Do not share personal Gmail drafts or private account data in the demo; synthetic examples are sufficient.

## Known limitations

- The app offers **anonymous** short-lived browser sessions, not account login or strong identity checks. Automated clients can obtain sessions.
- Rate limits and daily caps are in-memory; restarting/replicating the server resets or duplicates them. They help constrain incidental abuse, not determined attackers.
- CORS and `Origin` checks alone are not authentication. The signed session/CSRF gate improves browser request handling but is not a substitute for an identity system.
- Public live AI access still consumes your funded API credits. A provider-enforced hard spend limit is important. Render's free instance is not recommended for production deployment.
- This is a hackathon demo, not a medical, emergency, or clinically validated mental-health tool.
- Site-specific Gmail interception has been tested only in your earlier controlled scenarios, and is not included on the public URL.
