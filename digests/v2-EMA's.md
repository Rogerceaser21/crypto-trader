# v2-EMA's — Digest

## Summary
Defines the five EMAs used throughout the method as "dynamic support/resistance" and maps them onto the 3-level (L1/L2/L3) market-maker cycle: which EMA gets broken/retested at each level, how "trend acceleration" (EMAs fanning away from price) marks the L3 trap, and how flattening EMAs mark board meetings. Ends by tying trend exhaustion to the Stopping Volume Candle.

## Exact rules & settings
- **EMA set (all timeframes, always the same):** 10 and 20 = "fast" (turquoise / red on the TBD indicator); 50 = "mid" (blue); 200 and 800 = "slow" (yellow / purple). All pre-loaded on the "Trade By Design" (TBD) indicator. [01:30]–[02:00]
- **Timeframe:** levels are visible on all timeframes but "most highly visible on the one hour." [03:01]
- **Core reversal rule:** after a level-3 rise spikes the high → wait for an M, short it. After a level-3 drop spikes the low → wait for a W, long it. "That is all we care about." [04:01]–[04:31]
- **Trend duration:** once a peak is identified the trend should run ~3 days minimum ("3 day swing"). [04:31], [06:32]
- **Retail-late signals (context, not entries):** on day 2 / level 2 the 50 and 200 EMAs cross on the 1h; MACD zero-line crosses; RSI bounces — all considered "too late." [04:31]–[05:02]
- **Trend acceleration:** at level 3 market-maker candles cause price to extend away from the EMAs (EMAs fan out, visible gap especially vs the 50 EMA). This looks like momentum but is the trap right before reversal. [06:02], [08:04]–[09:04]
- **Entry sequence per cycle:**
  - Price crosses the 10 and 20 EMA first, usually on a second M or W — that is the entry, in addition to a hammer, railroad, or other candlestick confirmation. [06:32]
  - Price then breaks the 50 EMA with the level-1 rise/drop; usually runs to the 200 EMA and rejects; that rejection starts the pullback into the board meeting. [07:03]
  - The board meeting should **hold the 50 EMA**; watch wick spikes for inducement. Entry for level 2 = after a stop hunt, or a W (in rises) / M (in drops). [07:03] (transcript says "an information" — almost certainly "an M formation")
  - **Level-2 target = 800 EMA or the next unrecovered vector candle — ideally both aligned.** [07:03]
- **Consolidation variant:** if price consolidates, EMAs tighten/flatten; the retest level is still the 50 EMA (the 50 will cross the 200 as price returns). If the 200 is too close to be a useful target, use a previous unrecovered vector candle instead. [07:34]
- **Magnet principle:** price/EMA gaps close one of two ways — price retraces to the EMA, or price goes sideways and the EMA catches up. [09:04]–[10:05]
- **Trend-end tells:** EMAs sloping (down-right = downtrend, up-right = uptrend) then **flattening** = market maker deciding; after a board meeting, an M or W = decision made. [10:05]–[11:05]
- **Final exhaustion signal:** the downtrend (or uptrend) keeps running as long as price gaps away from EMAs and returns; it is finished off by a **Stopping Volume Candle**. [11:05]

## Data-source requirements
- OHLCV candles only. EMAs 10/20/50/200/800 are trivially replicable; no paid platform needed.
- "TBD (Trade By Design) indicator" is a proprietary course TradingView indicator, but for EMAs it is just the 5 lengths above.
- MACD / RSI mentioned only as retail-lag examples, not inputs.

## Chart-dependent moments
- [08:04]–[10:35] Live-chart walkthrough of fanning / "bubble" between price and EMA — gap size that qualifies as "trend acceleration" is never quantified (matters if used as an L3 detector).
- [07:03] "looking for spikes to see who the market maker is inducing" — wick-reading inside board meeting shown visually only.
- [10:35] The board-meeting-then-M example ("widths to the high, widths to the low") is entirely pointed at on-screen.

## Quantifiability: 3/5
EMA lengths, break/retest sequence, and targets are exact; blocked from 5 by undefined thresholds for "fanning out," "flattening," gap size, and how a "peak" / level count is formally identified.

## Suspected mishears / unclear passages
- "marker maker" throughout = market maker.
- "Mor", "Wor", "Wafter", "Mafter", "Mand" = "M or", "W or", "W after" etc. (concatenation artifacts throughout).
- [06:32] "candidacy confirmation" → "candlestick confirmation".
- [06:32] "With change direction this is the hint that the trend is ending" — garbled; probably "which is the hint that the trend is ending".
- [07:03] "or an information" → "or an M formation".
- [10:35] "widths to the high widths to the low" → "wicks to the high, wicks to the low".
- [02:30]–[03:01] "three level rise" vs "third touch" passage is tangled but meaning recoverable (3 touches ≈ 3 levels done → reversal).

## New jargon
- **TBD / Trade By Design indicator** — course's TradingView indicator bundling the EMAs + PVSRA candle colors.
- **Trend acceleration** — EMAs fanning away from price at L3.
- **Vector candle / unrecovered vector** — high-volume colored candle whose range price hasn't revisited (used as targets).
- **Railroad** — candlestick confirmation pattern (railroad tracks).
- **Fast/mid/slow EMAs** — 10-20 / 50 / 200-800 grouping.

## Visual findings (targeted watch 2026-07-11)

- **[01:45] — EMA set CONFIRMED from a branded slide** (not the chart legend, which stays collapsed): slide titled "TBD EMA's" (tradetravelchill.com, "TREND INDICATOR") with three chart thumbnails labeled **"Fast Moving — 10 & 20"** (turquoise + red lines), **"Mid-Point — 50"** (blue line), **"Slow Moving — 200 & 800"** (yellow + purple lines). Matches the transcript exactly; no settings dialog is ever opened in this lesson, so smoothing type/source aren't verifiable here (assume standard EMA on close).
- **[04:50] — 50/200 cross at Level Two (slide, annotated chart):** slide "THE TREND (EMA'S)" shows a W-shaped green zigzag (double bottom), labels "Level One" at the first rally and "Level Two" at the second, with a callout **"EMA Cross at Level Two"** pointing at the blue 50 crossing UP through the yellow 200 while the level-two rally is already well underway — the visual proof that the retail golden-cross signal fires one full level late. Purple 800 is far below and flat.
- **[08:20]–[08:45] — flattening vs fanning on the real chart (15m BTCUSDT OKX):** the board meeting appears as all five EMAs braided into a single flat horizontal band with price chopping through them (~23,2xx). "Trend acceleration" is then two very large green candles: candle #1 breaks out, a mini-BM pulls price back only as deep as the **10 EMA**, then candle #2 extends again (to ~24,5xx). "Fanning" visually = the fast EMAs peeling away from the slow ones in parallel arcs beneath the run, with clear dark space (no touches) between price and the ribbon.
- **[09:10] — the "gap":** she circles the empty space between the rally's candles and the EMA stack — the qualifying gap in the example is roughly the height of one of the big momentum candles measured to the 50 EMA (visually ~2-3x the normal candle range; still no numeric threshold stated → **remains open**).
- **[09:50] — the two gap-closing modes, same screen:** left instance — price retraces down and tags the 50; right instance — price goes sideways along the top and the EMAs curl up to meet it. Both modes visible in one screenful, matching the magnet rule.
- **[10:15]–[11:05] — downtrend walkthrough:** new chart, downtrend, with a "**Trapped Traders**" label boxed at the consolidation top. At [11:05] she has drawn a red M zigzag over that top consolidation (BM with wicks both sides → M = decision made). Below/right, olive circles mark each "bubble → return" cycle on the way down: price drops away from the EMAs, then pulls back up to tag the fast EMA/50 area, repeatedly. Flattening of the yellow 200 across the top marks the decision zone; the down-sloping ribbon afterward marks the confirmed trend. Resolves what the [10:35] example looks like; the "wicks to the high, wicks to the low" are the range-edge pokes inside the boxed consolidation.

**Contradictions:** none. Colors/lengths confirmed 10 (turquoise), 20 (red), 50 (blue), 200 (yellow), 800 (purple). Open items after watching: numeric gap threshold for "trend acceleration," and formal flatness criterion — neither is ever quantified on screen.
