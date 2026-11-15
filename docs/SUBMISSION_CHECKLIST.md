# Submission status and remaining actions (November 15, 2026)

The final participant guide specifies **Sunday, November 15, 2026, at 12:00 PM PST** (1:00 PM Arizona time). Upload the complete team folder to https://tiny.cc/BuildTeams26. The 90-second demo has been recorded by the team and must be added to the upload folder.

- [x] Public live interactive demo: https://pausepilot-buildathon-demo.onrender.com
- [x] Main website flows manually verified by builder in incognito mode.
- [x] Private source repository with app code: https://github.com/vsasanka/pausepilot-buildathon
- [x] 160 functional evaluation examples and 75 red-team safety examples committed.
- [x] Reproducible offline evaluation / safety scripts and results.
- [x] Initial AI pilot comparison documented (12 examples only).
- [x] Offline guarded-rule safety suite passed 75/75 curated tests after crisis fix.
- [x] Completed **40 named human reviews**; corrected one proposed label and updated eval/data/tasks.jsonl and eval report.
- [ ] Run full live AI evaluation and safety comparison, or prominently label pilot results as preliminary.
- [ ] Verify hosted API smoke tests from a laptop:
    `npm run smoke:deploy -- https://pausepilot-buildathon-demo.onrender.com`
    `npm run smoke:deploy -- https://pausepilot-buildathon-demo.onrender.com --ai`
- [ ] Set an enforced OpenAI project spending limit. In-memory server rate caps can reset on restart.
- [ ] Add **five-slide pitch.pdf** under docs/ (provided separately in the ChatGPT submission pack).
- [ ] Record a short real hosted-app video and add the file or share URL under docs/.
- [ ] Invite organizers to private GitHub repository, or follow event template-repo instructions.
- [ ] Complete the official submission form with team, URL, repository, headline evaluation and safety results, video link, and pitch.
- [ ] Open Render site before presenting; free instance may sleep after 15 minutes idle.

**Claims discipline:** Public web app sends no real emails or comments. The local Gmail extension is separately tested but not publicly published. Do not claim clinically proven stress reduction, 100% real-world safety, or 91.7% accuracy on the complete dataset.

**Render security:** Signed anonymous sessions, CSRF checks, same-origin requests, per-IP/session limits and server-side API key. These are bounded hackathon demo controls, not production identity management. 
