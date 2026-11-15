# PausePilot v0.3.1 — Gmail approval fix (Mac)

## What changed

- **Approve next Send** does NOT send automatically. After approving, select **Return to Gmail**, then click Gmail's **blue Send** button again within **45 seconds**.
- Fingerprinting no longer includes Gmail's changing "Draft saved" / "Saving..." status text, which could accidentally revoke an approval even when the draft was unchanged.
- If the draft changes between analysis and approval, an explicit error dialog tells you to retry.
- This is still a beta adapter. **Use only a self-addressed harmless test message to verify actual delivery.**

## Update from v0.3

1. Stop the old server and extract the updated folder `pausepilot-gmail-fix`.
2. Copy your existing private `.env` to the new folder; **never upload or share `.env`**.
3. Run `npm test`, then `npm run start:ai`.
4. Visit `chrome://extensions`, remove or disable the old PausePilot extension, select **Load unpacked**, and choose the new `pausepilot-gmail-fix/extension` directory. Do not leave two PausePilot extensions enabled.
5. Grant site access to `http://localhost:4173/*` and `https://mail.google.com/*`, enable **PausePilot** and **Gmail beta protection** in the toolbar popup, and reload Gmail.

## Live Gmail test (only email yourself)

1. Compose a new message to yourself. Use **harmless test text**, like `Testing PausePilot. Please confirm this message arrives once.`
2. Click Gmail's blue **Send** button. PausePilot should pause even a safe draft, then show the **Approved for the next Send click** explanation.
3. Click **Return to Gmail** and **click Gmail's blue Send button again within 45 seconds**.
4. Verify Gmail's **Sent** folder shows **exactly one** message and your inbox receives **exactly one**.
5. If it does not send, record whether the next click shows a new review, whether the compose window remains open, and any harmless technical error. Do not disable protection and click repeatedly. Do not try this with other recipients.

## Important scope

This patch was verified by automated Node tests, not a live Chrome/Gmail run in this environment. Do not treat it as comprehensive send protection. Chrome/Gmail changes may alter behavior. Evaluation and safety benchmarks still need to be reviewed and run.

For the full background and initial setup see README.md and docs/gmail-test-checklist.md (these describe v0.3; their 15-second approval period is superseded by this guide).
