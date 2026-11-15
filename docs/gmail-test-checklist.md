# PausePilot v0.3 — Gmail beta validation checklist

**Testing status:** Local logic/unit tests run. Real Gmail interception, including Gmail's native Send event order, is **not yet verified**. This is a beta prototype, not a guarantee that an email won't send.

## Before testing

1. Send **only to your own test email address**. Never test with a boss, colleague, client, or sensitive recipient.
2. Confirm the project is running with `npm run start:ai` and the popup says `Analyzer: AI configured`.
3. Remove/unload the old PausePilot extension before loading the new `extension/` folder. Two copies might conflict.
4. In `chrome://extensions` > PausePilot > **Site access**, allow `https://mail.google.com/*`; reload Gmail.
5. In the PausePilot toolbar popup, enable **PausePilot** and **Gmail beta protection**. The second switch is initially OFF.
6. The extension sends selected draft body text to your local PausePilot server and, if AI configured, to the AI provider **only when you try Send**. Use test text only.

## Test A — Local Gmail lab (no email can be delivered)

Open `http://localhost:4173/gmail-lab.html` and verify the heading says **SIMULATED GMAIL — NO EMAIL EVER DELIVERED**.

- [ ] Gmail beta enabled is shown on the lab. If not, check both popup switches and refresh.
- [ ] Click the **Send** button with the built-in insulting message. A PausePilot warning should appear and **Simulated sends: 0** should remain.
- [ ] Choose **Return to editing**; original draft remains unchanged.
- [ ] Try again, then choose **Allow one send**. Close the confirmation with **Return to Gmail** and click the native **Send** button within 15 seconds. Counter increments **exactly once**.
- [ ] Click Send again. You should get a fresh check, not a second unreviewed send.
- [ ] Replace text with `Please review the report by 5 PM. Thank you.`; click Send. Expect an approval dialog, but **no automatic send**. The second click should be required.
- [ ] Change the subject or recipient after approval. The next Send should require another check.
- [ ] With the editor focused, press **⌘+Enter** on Mac. It should initiate review instead of silently sending.
- [ ] Stop the server, then click Send. An error should preserve the draft; restart the server afterward.
- [ ] Disable Gmail beta in the popup, refresh, then click Send: the local simulated counter should increment without review. **Do not repeat this disabled-state test with a real recipient.**

## Test B — Actual Gmail (only to yourself)

- [ ] Open Gmail in Chrome, start a fresh **New Message** (not inline reply).
- [ ] Set **To** to your own email address. Write a clearly insulting *test* email.
- [ ] Click Gmail's normal **Send** button **once**. Confirm a PausePilot prompt is displayed and the email is **not in Sent**.
- [ ] Choose **Return to editing**. Verify the draft body, recipient, and subject remain unchanged.
- [ ] Click Gmail Send again > choose **Allow one send** > close PausePilot's confirmation > click Gmail's native Send **once more**. Confirm **exactly one email** arrives and exactly one appears in Sent.
- [ ] Repeat with a neutral message to yourself. The first click should pause and the second click should proceed; no warning about hostile tone should appear.
- [ ] Try **⌘+Enter** from a regular compose window. Confirm the check appears before any email is delivered. Verify Gmail's own keyboard confirmation dialog if configured.
- [ ] Change the draft after approval and confirm PausePilot requests a fresh analysis.
- [ ] Test an API/server outage. Confirm no mail leaves automatically and the draft is available.
- [ ] Test a second compose window. Approval from the first window must not authorize a send in the second.

**Stop and report immediately** if an email reaches Sent before PausePilot intervenes. This identifies an unsupported Gmail layout or send path. Turn off Gmail beta until corrected.

## Known limitations

- **Not verified against live Gmail in this environment.** Google can change its DOM and event-handling order.
- Supports recognized **New Message compose dialogs** (`[role="dialog"]` or `.M9`) with an accessible message body and a labeled native Send button. May not cover inline replies, forward popups, schedule send, Send & archive, offline queue, mobile Gmail, add-ons, or alternate Gmail layouts.
- Standard click and common **⌘/Ctrl+Enter** are interception targets, not a guarantee of comprehensive protection. Other shortcuts and programmatic sends may bypass this adapter.
- A page might have handlers triggered outside the event paths intercepted here. Don't use it to prevent real-world consequential sends until audited.
- The second click is deliberate: PausePilot never programmatically calls Gmail's Send button. A second click may still fail if Gmail changes its UI; check your Sent folder.
- A detected alteration to a draft's body/subject/recipient invalidates the approval; some unusual Gmail recipient widgets may require further adaptation.
- Errors preserve the draft. If absolutely necessary, users can explicitly disable protection in the toolbar; don't disable it during sensitive workflows.

## What to capture for troubleshooting

- Whether the popup shows **Gmail beta ON**.
- The visible text of the Gmail Send button or its `aria-label` / `data-tooltip` attributes (but **not** private email content).
- Whether it is a New Message, pop-out, or inline reply.
- Whether the message appears in **Sent** before the PausePilot popup.
- Any Console error from Gmail's DevTools, after removing personal text and tokens.
