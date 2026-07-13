# Digest: Brinks

## Summary
A very short (~2.5 min) visual walkthrough of the two Brinks trade setups on a diagram: an Asian-session range breakout (up for the M-side, down for the W-side), a retracement into the Asia→UK or UK→US changeover, and a second M/W peak whose candle closing at 3:45 or 9:45 (NY time) as an inverted hammer/hammer is the entry trigger. Stop goes beyond the first peak; initial take profit at the next "market maker candle." It confirms the PDF spec's timing and adds the Asia-range-breakout precondition, but almost every level is pointed at on screen rather than spoken.

## Exact rules
- [00:08] Precondition: **Asian session consolidation** — price ranging. Toward the **end of the Asian session**, price shifts UP out of the range (M-side setup).
- [00:08]–[00:39] Still before/as Asia closes, price comes back to **retrace**; then the **changeover period** (Asia→UK, or UK→US) begins.
- [00:39] During the changeover, the **second side of the M** forms. The second peak "is the one that needs to have the **inverted hammer**."
- [01:09] **Entry trigger:** if that candle "closed at **3:45 or 9:45** as an inverted hammer, that's your entry." (Implies the 15m candle spanning 3:30–3:45 / 9:30–9:45 — matches the PDF's 15M chart + 3:30-3:45/9:30-9:45 NY windows.)
- [01:09] **Stop loss:** above the peak of the **first** M-peak (matches PDF "stop at first peak").
- [01:09]–[01:39] **Take profit:** "depending on what's left where the **market maker candle** is, that is where you would set your **initial take profit**" — i.e., TP at the next MM (vector) candle level; wording garbled, target object is on the diagram.
- [01:39]–[02:09] **W-side mirror:** Asian consolidation → **breakdown** toward the end of Asia → retracement (still in Asia, or in UK if the changeover is UK→US) → during "the half hour period" into UK/US open, the candle at **3:45 closes as a hammer** → **entry on the very next candle open**, "stop loss under here" (below the hammer / second peak — screen gesture), TP wherever the next market maker candle is.
- [02:09] Hard filter: "it has to be at the **exact right time of the day** and at the **exact right breakout period of the high and the low of the Asian session**." (No valid Brinks without both the clock window and the Asia-range breakout.)

## Pattern definition attempt
**Brinks W (long; M mirror with inverted hammer):**
- Asia session forms a range; near Asia's end, price breaks DOWN out of the range (sweeping the Asia low).
- Price retraces off that breakdown into the session changeover.
- The second (lower) leg back down forms the W's second peak during the 3:30–3:45am (Asia→UK changeover) or 9:30–9:45am (UK→US changeover) NY window on the 15m chart.
- Trigger: the 15m candle closing at exactly 3:45 (or 9:45) closes as a hammer (inverted hammer for the M short).
- Entry: market order at the open of the very next 15m candle.
- Stop: M — above the first peak's high; W — spoken only as "under here" (most consistent mirror reading: below the first peak's low; the PDF's "stop at first peak" supports that; below the hammer low is the alternative reading).
- TP: initial TP at the nearest prior "market maker candle" (vector candle) level.
- Video adds vs PDF: the Asia-range breakout + retrace precondition; entry specifically on next candle open after the 3:45/9:45 close. Video omits (does not contradict): HOD/LOD location, 3 fast bursts lead-in, 30–90min peak spacing, 2h time stop, weekend ban.

## Chart-dependent moments
- [01:09], [01:39] "wherever the next market maker candle is" — the TP object is only identifiable on the diagram; what qualifies as the MM candle (nearest prior vector candle? its open? its wick?) is not spoken. Critical for coding TP.
- [01:39]–[02:09] "your stop loss under here" — W-side stop location is a pure gesture (first-peak low vs hammer low). Critical for coding the stop.
- [00:08]–[00:39] The size of the range breakout and how deep the retracement runs are drawn, not described.
- Timeframe (15m) is implied by the 3:45/9:45 candle closes but never stated in this video — confirmed only by the PDF.

## Quantifiability
**3/5** (effectively 4 when merged with the PDF spec) — clock times and candle triggers are exact, but the TP definition ("market maker candle") and the W-side stop are gestures, and "breakout of the Asian range" has no quantitative definition.

## Suspected mishears / unclear passages
- [00:39] "Low key is definitely what happened today, has it? I haven't now looked at the charts." — garbled aside; likely "Low-key that's definitely what happened today, hasn't it? I haven't yet looked at the charts." No rule content.
- [02:09] "Doug, please make sense." — likely "Does that make sense?" or addressed to a member named Doug ("Doug, does this make sense?"). This appears to be a live/Discord walkthrough, not a produced lesson.
- [01:09] "depending on what's left where the market maker candle is" — possibly "depending on where the last market maker candle is" ("what's left" ≈ "the last"). Materially affects the TP rule; flag for video review.
- [01:09] "345 or 945" = 3:45 / 9:45 (NY time per PDF; timezone never stated in this video).

## New jargon
- **Market maker candle** — used here as the take-profit target level (presumably a vector/high-volume candle from a prior session); not defined in this video.
- **Changeover period** — the Asia→UK / UK→US transition window in which the second peak must form.

## Visual findings (frames at 01:09, 01:39, 02:09 — viewed 2026-07-11)
The video is a schematic lesson: hand-drawn zigzag diagrams on a blank TradingView chart with colored session bands, not live candles.
- **[01:39] resolves the TP question**: the M-side diagram has a **red shaded box sitting above the M's two peaks** (the stop zone) and a **green shaded box below, at the origin of the impulse move that preceded the M** (the initial TP zone). So "recovery of the market maker candle" = price returning to the base of the prior impulse (vector) candle — TP at the level where that impulse candle opened/originated, not merely the nearest EMA.
- **[01:09] stop zone confirmation**: the red box spans the area just above BOTH peaks of the M — consistent with "stop above first peak," drawn as a zone over the double-top rather than a level on peak 1 alone.
- **[02:09] W-side**: cursor sits at the low of the second V-leg of the W diagram (the second peak of the W) — supports the mirror reading: stop below the W's peak zone (below both lows), entry on the reversal off the second low.
- Diagram context: left drawing = the Brinks M at a session changeover after an Asia-range breakout; right drawing = a consolidation (range) resolving into a W and a rise — the two setup variants side by side.
