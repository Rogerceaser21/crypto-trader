# LIQUIDITY — Digest

## Summary
Conceptual lesson (appears to be a mid-video excerpt) on the market maker as the mandatory counterparty: retail continuation patterns (e.g., ascending triangle) are validated by the MM at levels 1–2 and reversed at level 3, where FOMO entries become the MM's liquidity via stop losses and liquidation levels. The one actionable takeaway is a level-based filter on pattern trading.

## Exact rules & settings
- **Ascending-triangle trap:** after an uptrend into an ascending triangle, retail expects continuation; the MM sells the breakout to them — the breakout at the end of the cycle is the trap. [00:00]–[01:01]
- **Trap construction:** the M/W consolidation is where the MM "jams" traders into the wrong direction; at level 3 FOMO traders open at the worst time, and their stop losses / liquidation levels become MM liquidity. [01:01]–[02:01]
- **MM P&L cycle:** MM builds positions during the M/W, lets price run through the three rises while opening opposite positions and taking profit; trapped shorts' liquidations become MM profit on the way up. [02:01]
- **The codable filter:** "most patterns will play out during level 1 and level 2 but they don't play out at level 3 because that's where the market maker is issuing the reversal" → trade retail patterns only at L1/L2, **avoid all pattern/breakout trades at level 3**. [03:02]–[03:32]
- Transcript cuts off at "that being said many stop hunts are issued" [03:32] — continuation missing (likely picked up in "Liquidity 2" or another segment).

## Data-source requirements
- None beyond OHLCV candles; purely conceptual. The filter depends entirely on the level-counting engine (from the vector-candle/PVSRA lesson).

## Chart-dependent moments
- None critical — no chart is referenced concretely enough to matter for coding. (The lesson references "the one formation video" for M/W construction.)

## Quantifiability: 2/5
Only one rule is codable (no pattern-continuation trades at L3), and it inherits all the ambiguity of level counting. The rest is narrative rationale.

## Suspected mishears / unclear passages
- Starts mid-sentence ("scenario. Let's say price...") and ends mid-sentence — this transcript is a fragment of a longer video. [00:00], [03:32]
- [01:01] "the Wor Mformation also covered in the one formation video" → probably "the M formation video" (or "the formations video").
- "Wor / Mor / Wwas" concatenations = "W or M" etc.
- [02:31] "few and far between" passage is fine; no other suspected mishears.

## New jargon
- **Jamming** — MM forcing retail into wrong-side positions during M/W consolidation.
- **FOMO traders at level 3** — the MM's stated target cohort.
- (Reinforces glossary: stop losses and liquidation levels ARE the "liquidity" in the method's vocabulary.)

## Visual findings (watch pass 2, 2026-07-11)
- **Fragment question RESOLVED:** the .mov is a screen recording of the TTC course *web player*, and at recording t=00:02 the player scrubber already reads **02:43** (~38% through the lesson, total ≈7 min). The recording was started mid-lesson and stopped before the lesson ended (~6:35 of ~7:00) — so the transcript starting/ending mid-sentence is a **capture artifact, not a transcription clip**. The first ~2:43 and last ~0:30 of the original lesson are simply missing from our copy.
- **True lesson identity:** player breadcrumb reads "Part One: Trade by Design System > **Liquidity Providing vs Being Liquidity**" (badge: IN PROGRESS). That is the lesson's real title; "LIQUIDITY.mov" is the member's filename.
- **The entire visible video is ONE static annotated slide** (TTC-branded, dark chart with EMA ribbon and PVSRA-coloured candles): a long uptrend into a flat-top consolidation, annotated "Up Trend" → "Ascending Triangle" → "Break Out / Retail Longs / **But who's selling?**" at the breakout candle. No live charting, no other visuals — confirms the digest's "purely conceptual" call and that no chart-dependent rules are hiding in the visuals.
- Note the slide shows the breakout actually continuing UP hard after the label — the slide illustrates the *question* (who sells to breakout buyers), while the L3-reversal trap discussion is audio-only over this same still.
- Teaching frame saved: `media/liquidity/ascending-triangle-trap-annotated-slide.jpg` (2268x1474, full slide with all three callouts).
