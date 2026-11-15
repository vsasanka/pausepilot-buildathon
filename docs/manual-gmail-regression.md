# Gmail manual regression checklist — user-reported evidence

**Source:** A voluntary hands-on beta test reported by the builder on November 14, 2026; the tool did not independently observe delivery or browser automation. The one-email count was confirmed by the tester. **No private email content is stored here.**

| ID | Test | Status | Evidence / next test |
|---|---|---|---|
| GM-01 | Gmail regular Send displays pre-send review for abusive test draft | User reported pass | Screenshot of popup in real Gmail |
| GM-02 | Return to editing preserves original draft | User reported pass | Tester confirmed draft unchanged |
| GM-03 | Keep draft leaves message recoverable | User reported pass | Tester confirmed Gmail Drafts |
| GM-04 | Keyboard shortcut causes an interception | User reported pass | Tester reported shortcut test passed; exact shortcut confirmation not independently verified |
| GM-05 | Allow one send then fresh native Send delivers exactly once | User reported pass | Tester confirmed exactly one email was sent |
| GM-06 | Change draft after approval invalidates token | Partially observed | Screenshot showed 'Draft changed while checking'; test body, recipient, and subject separately |
| GM-07 | API outage leaves draft unsent | Not tested | Stop server during only a self-addressed test |
| GM-08 | Two concurrent compose windows cannot share approval | Not tested | Open two drafts; approve one only |
| GM-09 | Multiple fast Send clicks cannot cause duplicate delivery | Not tested | Use controlled lab only for rapid clicks |
| GM-10 | Multiple tabs / page refresh do not bypass protection | Not tested | Use test account and no sensitive mail |
| GM-11 | Inline reply, schedule send, send & archive | Unsupported / not verified | Do not claim coverage |
| GM-12 | Chrome extension reconnect after reload | User reported pass | Reloading extension and Gmail resolved check-unavailable incident |

No recipient address or draft body is included. These results do not demonstrate universal Gmail interception, zero bypasses, or clinical harm reduction.
