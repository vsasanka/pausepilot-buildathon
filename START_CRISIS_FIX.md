# PausePilot v0.4.1 — Crisis safety regression fix

This is a **patch of Phase 4 v0.4**, not a rebuild of your Gmail integration.

## Upgrade on your Mac

1. Stop the currently running PausePilot server (`Ctrl+C`).
2. Unzip this package into a new folder. Copy your **private** `.env` file from your previously working `pausepilot-phase4` folder to the new `pausepilot-phase4` folder. Never share or commit `.env`.
3. In Terminal, open the extracted `pausepilot-phase4` folder:

   ```bash
   npm test
   npm run safety:phase4:rules
   npm run safety:phase4:guarded
   npm run start:ai
   ```

4. On Chrome: you may keep your old extension for an initial backend-only test because it sends to the same local API. To display the more accurate label **Local safety check**, reload the new `extension/` folder using `chrome://extensions` > Load unpacked. Keep only one PausePilot installed. Refresh Gmail after the extension is changed.
5. Confirm both PausePilot and Gmail protection are enabled in the extension popup.
6. Test the **web demo** on `http://localhost:4173` using a synthetic crisis phrase such as `I am thinking of killing myself tonight.` and click Send. You should see an urgent safety prompt containing `988` and the original draft should remain. This does **not** send an email.
7. In actual Gmail, test **only with an email addressed to yourself**, and use **Return to editing** or **Keep draft** on any crisis-themed test draft. Do not send crisis test content to other people.

## Evaluation

The two offline commands intentionally test different methods:

- `safety:phase4:rules` — original unmodified rule-based baseline, expected 67/75 on the original synthetic set.
- `safety:phase4:guarded` — new on-device deterministic pre-check + original rules, expected 75/75 on the same synthetic set.

Outputs are in `safety/results/phase4-rules.md` and `safety/results/phase4-guarded.md`.

`npm test` includes 23 additional synthetic crisis and non-crisis probes. These are developer-authored cases, **not independent human validation**.

## What changed

- `lib/crisis-safety.js`: conservative first-person crisis rule, removes quoted text, handles explicit denials, and supplies appropriate human support resources without consulting a model.
- `lib/classifier.js`: locally recognized crises are checked **before** the network call; AI prompt now also instructs the model about first-person crisis language.
- `extension/content-script.js` and `public/app.js`: label deterministic intervention as **Local safety check**, rather than as a generic rule-based demo or an AI judgment. The Gmail button and keyboard interception algorithms were **not changed**.
- `scripts/phase4-run.mjs`: adds a distinct `guarded` evaluation mode, preserving the old baseline.
- `tests/crisis-safety.test.mjs`, `tests/crisis-edgecases.test.mjs`, `tests/ui-safety.test.mjs`: regression tests.

## Known limitations / release blockers

- The first-person language rule is deliberately narrow. Implicit distress, many other languages, and complicated reporting/quotation patterns can still be missed or misinterpreted. In-depth expert review and user testing have not happened.
- The test cases were assembled by developers. A 100% pass rate on those cases **does not mean a 100% real-world safety rate**.
- The Chrome extension has not been independently retested in real Gmail after this update; repeat the self-addressed regression checklist.
- **Do not deploy the funded API endpoint to the public internet as-is.** It currently lacks mandatory authentication, server-side usage limits, and restrictive extension origin allowlisting. Use only locally until secured.
- No paid model evaluations are run or claimed in this package. Your previous 12-case comparison results remain separate and preliminary.
- If the AI provider fails for a non-matching message, PausePilot continues to keep the draft rather than silently send.

For source information about the U.S. 988 crisis line, see https://988lifeline.org/get-help/ . Elsewhere, a user should contact their local crisis service; immediate danger warrants local emergency services.

**After deploying new extension files, always reload the Chrome extension and refresh Gmail.** A stale content script may lose its messaging connection and show `Check unavailable`; never repeatedly force a send during that state.
