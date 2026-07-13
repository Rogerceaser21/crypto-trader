# Annii's Swing Trading System — Digest

## Summary
A very short clip (starts mid-sentence, ~90 seconds of content) in which Annie states her core weekly "backflip" swing system in its purest form: ride the W long through the three rises, open a partial short at the stopping volume candle while the long is still open (hedged), then complete the flip — full short, close long — at the second peak of the M. "You're never out of a trade for the weekly setup."

## Exact rules

- [00:00] Context (mid-sentence): you take the counter-position "in the other direction and you're trying to catch the [coming backflip — transcribed 'Colombian bad clip']. Why? Because whatever you'd lose if you're wrong will be more than made up for on the trade that you have from earlier that is currently at level three." → The open level-3 winner is the hedge that finances the early counter-entry.
- [00:00–00:30] Sequence step 1: W formation → take a long position → "I would stay in this trade for my three level rises."
- [00:30] Step 2: "Once I've identified the three level rises, I'm waiting for the stopping volume candle. My long position is still open."
- [00:30–01:00] Step 3: SVC appears → "I open a short position." The long stays open (some profit already taken off): "What if I'm wrong? So I keep my long position open."
- [01:00] Step 4: price comes back up to create the second side of the M → "This is when I add the rest of my short position and close my long position."
- [01:00–01:30] Net effect: "I'm actually never out of a trade. This is my three day swing every week. I catch the long three rises, partial profit on my long, exit on my long, partial entry on my short, full entry on my short and then you just backflip all the time. You're never out of a trade for the weekly setup."
- [01:30] Duration note: the swings are usually 3-day swings but "sometimes they turn out to be… one week swings".

Implied parameters (from the companion lesson "Weekly 1H Daily Entries, Take profits" [59:45–68:51]): the partial short at the SVC is ~25% of intended size, adds come on the 3 hits that build the second peak, and the full flip coincides with closing the opposite position — this clip is the compressed statement of that same system.

## Chart-dependent moments
- [00:00] "We're going to W formation. We can't see it on here. So let's just pretend we had a W formation. I took a long position here." — the entire walkthrough is finger-on-chart with hypothetical marks; no prices or shapes are recoverable from audio alone. Low stakes though: the fuller rule set exists in the Weekly 1H lesson.

## Quantifiability
**3/5.** The state machine is fully specifiable (long → 3 rises → SVC → partial short + keep long → second peak M → full short + close long), but this clip alone gives no sizes for "some profit off" / "partial short", no SVC definition thresholds, and no invalidation rule if the second peak never forms. (Companion lessons supply most of these.)

## Suspected mishears / unclear passages
- [00:00] "you're trying to catch the Colombian bad clip" → almost certainly "the coming backflip" (her signature term; "bad clip"/"bad flip" = "backflip" in other transcripts too).
- [01:30] "That's that. Final formation. Are we ready? Let's get excited." → likely "Final Damage formation" — the transition to the next lesson (FD M/W); worth confirming against the video.
- [00:30] "That makes sense." → probably "Does that make sense?" (rhetorical).

## New jargon (not in glossary)
- **Backflip** (already in glossary) — here fully specified as: partial short AT the SVC (long still open), full flip at the second M peak.
- **Second side M** — the second peak / right side of the M (same as "second peak M" elsewhere).
- No genuinely new terms beyond that; this clip is a compression of the position-building system.

## Visual findings (watch pass 2, 2026-07-11)
- The entire clip is delivered over ONE static annotated chart: **"W or M Staggered Entries"** — page 14/16 of a course PDF titled "Risk and Trade Management" (visible in the browser file path). Chart: Bitcoin/TetherUS PERPETUAL FUTURES, **4H**, BINANCE. So the "backflip" walkthrough is finger-on-slide, not a live drawing — and the swing timeframe shown is the 4H.
- The slide's printed labels resolve the open sizing questions from the transcript pass:
  - "SVC identified — **Enter at candle close**"
  - "**Stop Loss above wick or HOD/W**" (red zone above the SVC)
  - "**Position 1, 25% of your 1% total risk**" and "**Position 2, 75% of your 1% total risk**" (two staggered entry lines: 25% at the SVC, 75% at the second-peak M)
  - "Candle stick reversal patte[r]n as second peak M" (the add trigger)
  - "**3 drops, SVC, exit**" (the exit at the opposite SVC)
  This confirms the 25/75 split implied by the Weekly-1H lesson and adds the entry timing (candle close) and the exit condition label. Frame: `media/swing-system/w-m-staggered-entries-master-slide.jpg`.
- [01:48] She flips through Mission Control at the end, exposing two bonus course documents (captured full-res):
  - **"Trading the Business Model on Higher Time Frames"** (14-page doc) — quantifies minimum model durations on the 15m TF: W formation = left-side drop 1 candle + SVC 1 candle + inside left side 2–4 candles + inside right side 2–4 candles; Level One = 2–4 candles (1h); Board meeting = 4–8 candles (2h); rise 2 + BM = 3h; rise 3 + BM = 3h; **total ≈ 11.5h, double (≈23h) for the M + 3-level drop**. Frame: `model-minimum-durations-15m-doc.jpg`. This is new quantitative material not in any transcript.
  - A Notes entry "**Building Positions — Using Fibs**" (28 Jan 2023): a "FIB level position builder" variant — once the M peak forms, draw fibs over the move; staggered positions at fib retrace levels ("Position 1, 25% of your 1% total risk" plus a larger tranche higher), stop above the "MM candle zone" at the 100% fib, exits framed by the −127.20%/−161.80% extensions near "3 drops, SVC, exit". Frame: `fib-level-position-builder-note.jpg`.
- Contradictions: none — but note the slide's example is the M/short direction (long ridden up, flip to short), the mirror of the W narration; the mechanics match.
- Teaching frames saved: 3 → `Strategy Codex/Annie/media/swing-system/`.
