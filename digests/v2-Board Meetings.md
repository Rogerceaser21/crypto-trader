# v2-Board Meetings — Digest

## Summary
Board meetings are the consolidations between levels, in two flavors: retracement (trade it with staggered fib entries) and sideways (trade it off stop hunts or board-meeting M/W shapes). Gives concrete stop-loss placement rules (clear the W's first peak, and the 50 EMA if price is above it) and the timing pattern that inducement wicks come at the start of a board meeting while the stop hunt comes at the end.

## Exact rules & settings
- **Definition:** board meetings happen between levels; either sideways price or a retracement. [00:00]
- **Retracement board meeting entry:** fib from the **peak of the prior level to the bottom of the prior level**; the retracement targets one of the **38.2 / 50 / 61.8** fib levels, entered on bearish (or bullish) candlestick confirmation there. [01:00]–[02:00]
- **Staggered orders:** instead of one entry, split across all three fibs (example: 90 contracts → 30/30/30 at 38.2/50/61.8); average entry lands mid-zone. [02:00]
- **Stop loss (retracement type):** above the peak (of the prior level). Rationale: "if it comes back above the previous level's high, you don't want to be in that trade anyway." Tight stops are "the biggest trap ever." [02:00]–[02:30]
- **Sideways board meeting tell:** EMAs flatten out. [03:01]
- **What to look for inside a board meeting:** stop hunts, or an M/W shape. [04:01]
- **Direction filter:** only look for **W**s in board meetings during the **rise** phase (after a peak-formation W), only **M**s during the **drop** phase. "Don't go looking for Ws at level two drop." Anything else = unpredictable, stay out. [04:01]–[05:02]
- **Relaxed M/W criteria inside board meetings:** no Stopping Volume Candle required, no "market maker showing up three times on the inside right side" — you're literally just looking for the shape. [05:02]
- **Stop loss (board-meeting W entry, no stop hunt seen):** below the first peak (i.e., first low) of the W, or below the board-meeting wicks. [05:32]–[06:03]
- **50 EMA stop rule:** if the W forms **above** the 50 EMA, the stop must clear **both** the W's first-peak wick **and** the 50 EMA. If price is below the 50 EMA, clearing the candle wick is enough. [06:03]–[06:33]
- **Stop-hunt timing pattern:** trap/inducement wicks appear at the **start** of a board meeting (triggering breakout longs + stopping out shorts); the **stop hunt comes at the end** and is the final trigger before price breaks to the next level. If you see one-sided wicks early, wait — don't enter until the stop hunt. [07:03]–[08:03]
- **Stop hunt identification:** a break below the range low where longs' stops sat (or liquidations for 100x traders). [08:03]

## Data-source requirements
- OHLCV candles + fib retracement tool + the EMA set (esp. 50 EMA). Nothing paid; fully replicable.

## Chart-dependent moments
- [01:00]–[01:30] Fib anchor selection ("peak of the level prior to the bottom of the level prior") demonstrated only on-screen — anchor precision matters for coding.
- [05:02]–[05:32] The "tricky" long board meeting with an embedded W — what qualifies as the W shape is shown, not defined (pivot depth/spacing unquantified).
- [06:33]–[08:03] The stop-hunt board meeting example — which wick is "the" stop hunt vs early inducement is visual; needs a rule (e.g., break of range extreme late in the range).

## Quantifiability: 3/5
Fib levels, staggering, and SL placement are exact and codable. Blocked from 5 by: no formal definition of board-meeting boundaries, of the M/W "shape" (relaxed criteria = shape only), or of what distinguishes end-of-range stop hunt from mid-range noise.

## Suspected mishears / unclear passages
- "Mor" / "Wor" / "Wafter" / "Wat" / "Wix" = "M or", "W or", "wicks" (throughout; "Wix"/"weeks" = wicks).
- [00:30] "trap move before I can reverse it" → likely "before the market maker reverses it".
- [01:00] "other trade sales don't work" → "trade styles".
- [02:30] "type stop losses" → "tight stop losses".
- [03:31] "breakout traders put a buy stock just above resistance" → "buy stop".
- [05:02] "you don't see the math maker show up the three times" → "market maker show up three times" (reference to full M/W criteria from the M&W lesson).
- [05:32] "a really long already board meeting" → unclear; possibly "orderly" or just "really long".
- [08:03] "a hundred Xtraders" = 100x-leverage traders.

## New jargon
- **Retracement board meeting** vs **sideways board meeting** — the two consolidation types.
- **Inducement wicks** — early-range wicks designed to trigger breakout traders.
- **First peak of the W** — first low pivot of the W (course uses "peak" for both tops and bottoms).
- **Inside right side** — the right leg of an M/W where full criteria would require 3 market-maker appearances (defined in the M&W lesson).

## Visual findings (targeted watch 2026-07-11)

**Chart context:** same layout as the VSC lesson — TradingView, BTCUSDT Perpetual Swap · **15m** · OKX, "Day Trade Str…" layout, PVSRA-colored candles + colored volume subpane, EMA ribbon (teal/red/blue fast set + yellow slow ~200 curve + deep purple slower line), Trade By Design session row (Asia Open / Asia Close-UK Open / UK Close / US Close) with shaded session bands.

- **[01:15] — M + levels sketch:** she hand-draws a red zigzag polyline over the chart: an M over the top (peak ≈24,050, 2 Mar '23), then descending segments marking drop L1 → retrace → drop L2 → retrace, projecting drop L3. Board meetings are the retrace segments of this polyline — she never draws a separate "board meeting boundary" object for the retracement type.
- **[01:50]–[02:10] — fib anchors (RESOLVES the anchor question):** fib retracement drawn **top-down on the prior drop leg**: 100% anchor at the swing HIGH where the prior drop began (≈23,800, the lower high of 2 Mar ~10:00 — "peak of the level prior"), 0% anchor at that drop's swing LOW (≈23,190 — "bottom of the level prior"). So for a drop sequence the retracement BM is measured on the *most recent completed down-leg*, not the whole move from the M top. Levels visible on her fib: 100 / 78.6 / **65.00 (highlighted gold)** / 61.8 / 50 / 38.2 / 23.6 / 0, plus what appears to be a 127.2% extension below 0. Note the non-standard **65% level** styled in gold next to 61.8 — her template includes it (golden-pocket-style band 61.8–65). In the example the retrace topped exactly in the 61.8–65 band (price ≈23,564 vs 61.8 ≈23,570) before the next drop leg (huge red candle Fri 3 Mar ~14:00).
- **[03:10]–[03:40] — sideways BM + inducement wick:** the sideways BM is shown as a horizontal range (~23,150–23,330, Sun 26 Feb) with the fast EMAs visibly braided/flat inside it and the yellow slow EMA gliding flat through it. At [03:40] she circles ONE candle mid-range whose **upper wick pokes above the range top** — that is the "inducing longs" candle. The wick exceeds the prior range high by a small margin (a few tens of dollars on BTC) and closes back inside.
- **[04:10] — W inside the BM (RESOLVES what the relaxed W looks like):** a box outlines the range; a small red W polyline is traced along the range lows: first dip ≈23,20x, bounce to mid-range, second dip slightly LOWER (≈23,15x, sweeping the first low's wicks), then the rally out. So the relaxed BM-W is just two range-low tests where the second may undercut the first — no SVC, no vector requirement; breakout followed with large green candles to ≈23,650.
- **[05:20]–[06:15] — long BM + hypothetical 50 EMA:** the "tricky" long BM is a multi-session sideways stretch labeled with an "Up Trend" callout; the W is again two adjacent dips near the range low before a very large green breakout. For the 50-EMA rule she does NOT open settings; she sketches a green diagonal line UNDER the W's lows ("if the 50 EMA was like this") — i.e. hypothetical 50 EMA below price → stop must clear both the W's first-peak wick and that line. In the actual example price was below the 50 EMA, so wick-clearance sufficed. EMA lengths not confirmable in this video (legend collapsed).
- **[06:55]–[08:10] — stop-hunt BM (RESOLVES inducement vs stop hunt):** range ≈23,05x–23,2xx (early Feb). At [07:25] two olive circles ring **upper wicks in the first third of the range** (inducement — both poke above range top). At [07:55] a third circle rings a dip in the **final quarter of the range** that breaks BELOW the range low (undercuts by roughly the same margin the inducements overshot) — the stop hunt. Immediately after that circled dip, price broke upward out of the range to the next level (~23,8xx). Geometry rule confirmed visually: inducement wicks = counter-direction pokes early; stop hunt = with-trap-direction range-extreme break late, followed within a few candles by the true breakout the OTHER way.

**Contradictions:** none. Two additions the transcript missed: (1) her fib template contains a custom **65%** gold level alongside 61.8; (2) the BM-W's second low may sweep below the first low — the shape still counts.
