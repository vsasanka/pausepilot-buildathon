# PausePilot v0.9 — Web + Extension with Sample Insights

1. Run `npm test` and `npm run security:audit` from this folder. `npm start` runs local rule demo; `npm run start:ai` uses local untracked .env when configured.
2. Visit http://localhost:4173. Select `Mouse Movement Lab`, Start, establish five-second baseline, then try sharp zigzag motions. Tab away and back: baseline should be restored. New alert requires normal/idle recovery and 20-second cooldown.
3. Try Rain/Ocean/Forest Play 30s. Select `Speak breathing cues` and start 30s breathing. Audible speech uses browser text-to-speech and can be unavailable on some machines.
4. Select `Insights · Sample data`. Charts show 14 explicitly synthetic days. Test metric dropdown.
5. Chrome: disable older PausePilot, load unpacked `extension` directory. Click `View sample insights` from popup. The extension Insights tab displays the same 14-day sample dataset, without collecting telemetry. The extension retains Gmail Send Guard v0.4.5.
6. Public deploy: push tracked code to the private `vsasanka/pausepilot-buildathon` repo with the included `PUSH_WEB_V09.command`; on Render, verify both web demos and Insights. `render.yaml` remains unchanged. Never commit `.env` or API secrets.

**Claims:** These are pointer movement patterns, not measured stress. No real results or diagnoses. Do not use synthetic dashboard metrics as evaluation statistics. The dashboard stores nothing about visitors.
