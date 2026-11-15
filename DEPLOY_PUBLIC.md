# PausePilot v0.6 — Public web demonstration deployment

## What we are publishing

One public **Node web service** with two interactive modules:

- **Email Send Guard** — compose, pre-send analysis, optional warning, preserve or simulate send.
- **Comment Guard** — compose, pre-post analysis, optional warning, preserve or simulate post.

Both features use the same restricted AI model API and model-independent crisis safeguard. The website **never sends real emails or posts comments**. The already-tested Gmail Chrome extension remains local and is not modified by this deployment.

## Fast path: Render Blueprint

1. Create a **private empty** repository at `https://github.com/new`, e.g. `pausepilot-buildathon` under your account. Do not initialize with README, .gitignore or license.
2. Extract this project ZIP. In Terminal run these commands from the extracted `pausepilot-public-v06` folder:

   ```bash
   git init
   git add .
   git commit -m "PausePilot v0.6 modular web demo"
   git branch -M main
   git remote add origin https://github.com/YOUR-ACCOUNT/pausepilot-buildathon.git
   git push -u origin main
   ```

3. On Render (https://dashboard.render.com/), select **New → Blueprint**, connect that GitHub repository, and use the included `render.yaml`.
4. Enter `OPENAI_API_KEY` in Render's environment-variable prompt. Use a dedicated project API key with a conservative **enforced hard spending limit** set in your OpenAI platform settings. Never put this key in GitHub or `.env.example`.
5. Confirm the `PAUSEPILOT_SESSION_SECRET` is automatically generated from `render.yaml`. Apply/deploy. Render will produce an HTTPS address. **The example URL in documentation is not a real deployment.**
6. Open the actual Render URL in an incognito window; select Email and Comment tabs and try both a harmless and an aggressive sample. Verify no real content is sent or posted.
7. Run tests on the live instance from your Mac:

   ```bash
   npm run smoke:deploy -- https://YOUR-REAL-APP.onrender.com
   npm run smoke:deploy -- https://YOUR-REAL-APP.onrender.com --ai
   ```

   The first command does not spend API tokens; the `--ai` command triggers one paid model request.

## Manual service alternative

Render **New → Web Service**; connect repo, runtime Node, `npm install` build command, `npm start` start command, `/api/health` health check. Set `OPENAI_API_KEY`, `OPENAI_MODEL`, `PAUSEPILOT_SESSION_SECRET` (random 32+ characters), and the request cap values listed in `.env.example`.

## Future features / updates

The app uses the shared feature registry described in `docs/ADDING_FEATURES.md`. Add a new module, write tests, push a commit to `main`, and Render automatically redeploys from the connected branch (when auto-deploy is enabled). There is no need to reinstall or republish a Chrome extension to update the website.

## Security and demo boundaries

- Demo allows anonymous short-lived sessions. It is **not** full user authentication; API abuse is still possible.
- IP/session/daily request caps are stored in memory and reset on service restarts. They are NOT an absolute financial spending guarantee.
- Set an OpenAI project budget hard limit to protect the small prepaid balance. Watch usage during the demo.
- User draft text is sent to the model provider only when users click Send/Post, with consent disclosure. Do not paste real confidential messages into the demo.
- The site does not have any real outbound send/post integration.
- Render free web services can go idle; open the live site shortly before pitching and consider a paid instance if availability is critical.
- Public web app and local Gmail extension are separate; do not point the extension at this service without a dedicated authenticated extension API and further testing.
