# Mouse Movement Lab — exploratory user-controlled feature (v0.7)

**Claim boundary:** This experiment detects mouse movement variability *inside a deliberately enabled test pad*. It does **not** establish whether a person is experiencing restlessness, anxiety, stress, illness, or any particular emotion.

## How to try it

1. Open PausePilot and select **Mouse Movement Lab · Experimental**.
2. Click **Start 5-second baseline**. Move your mouse/trackpad cursor gently and naturally *inside the dotted pad* for about five seconds. If you didn't move enough, continue gently until calibration completes.
3. After **Baseline ready**, keep moving normally to see a low-variation observation, then try a few quick back-and-forth zigzags to explore a possible **Movement variation increased** indication.
4. If the movement pattern differs sufficiently from the short calibration window, PausePilot offers a nonintrusive invitation to pause. Choose **Dismiss** to ignore it.
5. Press **Stop & clear**. The data is discarded and the experiment stops. It also stops if you leave the page, switch feature tabs, or switch windows.

## What it measures

The system reduces about four seconds of mouse movement inside the pad to three approximate metrics: average cursor speed (px/sec), meaningful direction changes/sec, and reversals/sec. Before making any comparison it collects a five-second personal baseline. A conservative heuristic notices *combined* increases in turning/reversals and movement, not speed alone. These thresholds are hand-chosen for a technical demonstration, not fitted to human clinical or behavioral ground truth.

## Privacy boundaries

- Disabled by default. No monitoring or recording until someone presses Start.
- Only pointer movement over the dedicated lab pad is captured. Not other pages, not other app windows, not the Chrome extension, and not the rest of PausePilot.
- Mouse/trackpad pointer events only. Touch and stylus are not inferred as mouse movement.
- The latest few seconds of coordinates live only in ephemeral JS memory for calculations; there is no network request, AI model call, analytics log, persistent storage, or file export.
- Switching away, blurring the window or pressing Stop clears the sample buffer.
- The demo is **not** an always-on monitor or medical/mental health product.

## Known limitations

Mouse DPI/sensitivity, pointer acceleration, screen size, trackpad versus mouse, motor disabilities, user intention, task complexity, and physical working space can all change these metrics. Short baseline calibration can be noisy. Direction reversals can reflect ordinary reading or navigation; they cannot establish negative emotion. False positives and missed patterns are expected. No accuracy estimate is claimed.

## Tests and rollout

Run `npm test` and `npm run security:audit` before deploying. Check browser behavior manually because this environment may block headless navigation:

- Baseline requires activity and never enables tracking by default.
- Slow straight movement → no pattern-change warning.
- Repeated zigzags → possible pattern-change warning (not guaranteed; depends on how you move).
- Quick straight motion alone → no warning.
- Stop clears measurements; tab/window switch also stops.
- Email Guard and Comment Guard remain working as before.
- Nothing in this lab calls `/api/analyze` or requires the funded OpenAI API.
