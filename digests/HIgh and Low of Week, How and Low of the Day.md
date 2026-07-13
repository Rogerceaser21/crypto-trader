# HIgh and Low of Week, High and Low of the Day — Digest

## Summary
Defines and demonstrates the exact construction of HOW/LOW and HOD/LOD: purely mechanical highest/lowest wick prices inside 5pm-NY-anchored windows, marked automatically by the TTC indicator but recommended as a daily manual habit. Explains why these levels matter (the market maker attempts one of HOW/LOW every week) and how they combine with EMAs, vectors, heatmap orders and liquidation levels into entry/TP cases.

## Exact rules

### Why the levels matter
- [00:00–00:30] The TTC indicator (transcribed "TVD system indicator") auto-marks HOW/LOW; don't ignore the lines — "these are key levels that price can gravitate towards the following week", where you either take profit or reassess.
- [00:30–01:00] "The market maker will attempt either the High of the Week [or] the Low of the Week every week." If they reach one: they either reverse from there (depending on where we are in the cycle) or break it and create a new HOW/LOW.
- [01:00] If they don't break it that week, "they will probably try again the following week" — which is why the previous week's HOW/LOW must stay marked.
- [00:30] "After the new week has begun, the first thing you should do is mark in or take note of the High and the Low of the Week."

### HOW / LOW definition (mechanical)
- [01:30–02:00] HOW = "the highest point price went between Sunday 5pm New York the week prior to the last Sunday 5pm New York. We include the wick." Superior to "resistance" because it is undeniable — on the same chart no one should draw it differently.
- [02:00] LOW = the lowest point price went between the same two dates, wicks included.
- [02:00–02:30] The level does not change until a new week has ended — chart it once per week, but CHECK it every day: where is price relative to it? Are there EMAs, vectors, heatmap orders or liquidation levels around it? "The more you can build your case around these levels, the more they will act as a place to take an entry or to take profit."
- [02:30] HOW/LOW includes weekend price action.
- [02:30–04:00] Manual drawing demo on the 1H: window = prior Sunday 5pm NY → last Sunday 5pm NY (she frames it dead-gap-zone to dead-gap-zone); place a horizontal line at the extreme wick high (label HOW) and extreme wick low (label LOW).
- [04:00] "It's too subjective [resistance]. This is not subjective, it's an exact rule."

### HOD / LOD definition (mechanical)
- [04:00–04:31] Same process and reasoning, but the window is the PRIOR DAY: 5pm NY to 5pm NY, wicks included.
- [04:31–05:01] Done for each trading day during the week "until Friday"; it's one of the first things in the daily charting routine.
- [07:01] "Once the [day] ends, you no longer need these levels" — erase and re-mark for the new day. (Transcribed "week ends"; context is the daily levels.)

### Monday special case (weekend levels)
- [06:01–07:01] On the week's first trading day, the "day prior" is a non-trading day, so mark the weekend price action from Saturday 5pm NY to Sunday 5pm NY as Monday's HOD/LOD — that is the TTC indicator's convention. "There's no strict rule around this and you could mark the entire weekend price action if you wanted to."

### Practice discipline
- [05:01–06:01] Recommendation: turn the indicator OFF each morning and mark the levels manually until it's a habit — automated lines breed the bad habit of not noticing them; "if you ignore them because they're automated for you, it's going to hurt your trading."

### Live demo (Tuesday)
- [07:32–08:02] To mark Monday's HOD on Tuesday: highest point between the start of Monday's dead gap zone and the start of Tuesday's dead gap zone — the top of that wick. LOD = lowest point in the same window. "That would be relevant for the rest of the day."

## Chart-dependent moments
- [03:00–04:00] The manual HOW/LOW drawing — she points at "this week here"/"this dead gap here"; the window edges are visual but the rule itself is fully stated, so nothing blocking for coding.
- [06:31–07:01] The weekend HOD/LOD "grey line and the two yellow circles" — shows the indicator's Sat-5pm→Sun-5pm convention; worth a frame to confirm the exact anchor.
- [07:32–08:02] Tuesday demo — identifies the dead-gap-zone shading edges used as day boundaries; a frame would pin the indicator's exact session shading.

## Quantifiability
**5/5.** Fully mechanical: max/min of high/low (wicks included) over 5pm-NY-anchored windows; weekly window Sun 5pm→Sun 5pm, daily window 5pm→5pm, Monday uses Sat 5pm→Sun 5pm. The only soft spot is the explicitly optional Monday convention (whole weekend vs Sat–Sun only).

## Suspected mishears / unclear passages
- [00:00] "TVD system indicator" and [06:31] "TBD indicator" → almost certainly the "TTC" (member) indicator.
- [01:30, 02:00] "the highest point price length" → "price went"; "We include the week for this" → "the wick".
- [03:30, 06:31 etc.] "week/weeks" → "wick/wicks".
- [07:01] "Once the week ends, you no longer need these levels" → context says "once the DAY ends" (refers to HOD/LOD).
- [07:32] "dead out zone" → "dead gap zone".
- [05:31] "that's why they put it this method now" → garbled, likely "that's how they learned this method".

## New jargon (not in glossary)
- **TTC indicator ("TVD/TBD system indicator")** — the member indicator that auto-plots HOW/LOW/HOD/LOD and session boxes.
- **Dead gap zone** — used here as the visible shaded session boundary at 5pm NY (day anchor).
- **Case-building** — stacking EMAs/vectors/heatmap orders/liquidation levels around a HOW/LOW/HOD/LOD to justify entry or TP.
- (Note: glossary's IHOD/ILOD "inside high/low of day" is not used in this lesson; here the levels are the PRIOR day's/week's extremes.)

## Visual findings (watch pass 2, 2026-07-11)
- [00:00–00:30] Title slide confirms the rule verbatim: "The Market Maker will attempt either the high of the week and the low of the week every week", plus the acronym table HOW/LOW/HOD/LOD. Frame: `media/high-low-week/how-low-hod-lod-definitions-slide.jpg`.
- [01:05–02:35] The "HOW & LOW" example chart shows something the audio never says: on the right edge the indicator plots a **four-level daily stack — HOD, IHOD, ILOD, LOD** — with shaded "Area of interest" zones between HOD↔IHOD and ILOD↔LOD. So IHOD/ILOD (inside high/low) ARE part of the on-screen toolkit in this lesson, contradicting my earlier note that they don't appear here. Frame: `how-low-marked-weekly-chart-arrow.jpg`.
- [03:00–03:55] Live TradingView demo (BTCUSDT Perp, OKX, 1H): she draws the weekly window as a box between the two Sunday 5pm boundaries and places HOW/LOW lines on the extreme wicks; the auto-plotted daily HOD/IHOD/ILOD/LOD + AOI boxes are visible simultaneously. Frames: `how-manual-marking-tradingview.jpg`, `weekly-window-box-how-low-drawn.jpg`.
- [05:00–06:55] The "HOD & LOD" slide resolves the weekend-anchor question visually: two yellow circles mark the weekend's extreme wicks either side of a grey vertical session line, with "Asia Open ... Asia Close" tick labels at the bottom — the indicator anchors Monday's HOD/LOD to the weekend extremes exactly as described. Frame: `hod-lod-weekend-yellow-circles-session-band.jpg`.
- [07:35–07:55] Tuesday live demo confirmed: Monday's HOD/IHOD/ILOD/LOD manually marked between the two dead-gap shaded columns (chart dated Mon 06–Wed 08 Mar '23). Frame: `tuesday-hod-lod-live-demo.jpg`.
- No contradictions with the transcript rules; the visuals ADD the IHOD/ILOD + area-of-interest plotting convention.
- Teaching frames saved: 6 → `Strategy Codex/Annie/media/high-low-week/`.
