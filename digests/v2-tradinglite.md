# v2-tradinglite — Digest

## Summary
Mechanics-of-the-tool lesson for TradingLite: what the heatmap numbers mean (current-candle limit orders above = shorts, below = longs), why closed-candle data is mostly stale, and how to tune the color-intensity slider so outsized walls stand out at a glance. Ends with hover-readout (size @ price) feeding chart levels, plus a passing note that VPVR works as in TradingView.

## Exact rules & settings
- **Semantics:** in the **current candle**, orders above price = current limit-order **shorts**; orders below = current limit-order **longs**. [00:00]
- **Stale data rule:** on closed candles the heatmap shows orders that remained **when that candle closed** — orders may since be cancelled/replaced, so ignore historical cells... [00:30]
- **...except persistence:** a line that **stays at one level for many, many candles** IS worth attention. [00:30]–[01:00]
- **What counts as a big wall (worked example):** current candle showed 1.1K (BTC) at 23,700 and another 1.3K, versus surrounding orders of ~200–500 → the 1K+ walls are the standouts (~2–5x the ambient book). [01:30]
- **Intensity calibration procedure:** look at the current candle, find the really-high orders, then toggle the intensity/threshold control until those walls are "super bright" and everything else darkens — so key areas are visible zoomed-out without hunting. Adjust the other side (red/asks) the same way. Recalibrate as often as daily depending on the order book. [01:00]–[02:31]
- **Hover readout:** clicking/hovering a wall shows three columns — e.g., **1.4K BTC of orders at 23,575** — and that price is what you mark on your TradingView chart (ties into the charting-heatmaps lesson). [02:31]–[03:01]
- **VPVR:** available in TradingLite; "use it the same way you would in TradingView"; on/off is personal preference. [03:31]
- TradingLite's own Learning Center recommended for deeper heatmap education. [03:31]–[04:01]

## Data-source requirements
- **TradingLite (paid):** live L2 orderbook heatmap with per-level order sizes (BTC-denominated), per-candle book state. For backtesting: needs historical order book depth (e.g., Binance L2 snapshot archives) — walls are cancellable, so candle-close snapshots understate what was displayed intraday; flag as a significant reconstruction problem.
- No candle/indicator requirements of its own.

## Chart-dependent moments
- [01:00]–[02:31] The entire intensity-slider calibration is visual ("toggle until those orders become very very stand out"); for coding, replace with a numeric rule — e.g., wall ≥ N× the median book level (the example implies roughly ≥2x the largest ambient orders, ~1,000+ BTC vs 200–500).
- [02:31]–[03:01] The three-column hover readout layout is UI-specific.

## Quantifiability: 3/5
The one worked example gives usable magnitudes (1.1–1.4K BTC walls vs 200–500 ambient → a ~2x+ prominence ratio can be inferred), and the persistence rule is codable. Blocked from 5 by: no explicit threshold for "really high level order," no persistence duration ("many many candles"), and paid/hard-to-archive data.

## Suspected mishears / unclear passages
- "trading light" = **TradingLite** (throughout).
- [01:30] "1.1 **Kat** 23,700" → "1.1K **at** 23,700" (concatenation; same with "1.4 Kthere").
- [02:01] "that might be something that you would just **daily**" → "**adjust** daily".
- [00:00] Opening starts mid-sentence ("get into the details...") — beginning of the video likely clipped.
- [03:01] "the column is in the middle" → "the column in the middle" (readout = size in middle column, price to its right).

## New jargon
- **Wall / high-level order** — outsized resting limit order that should "stand out at a glance."
- **Persistence line** — an order level maintained across many closed candles (the one meaningful historical signal).
- **VPVR** — Volume Profile Visible Range (standard TradingView tool, also in TradingLite).

## Visual findings (watch pass 2, 2026-07-11)
- **Exact tool state:** TradingLite web app on **BTCUSDT Binance, 4h timeframe** (not 1h), layout = heatmap chart with numeric per-level order sizes overlaid, VPVR profile on the chart's right edge, plus right-hand ORDERBOOK panel (Grouping = 10) and TRADES panel (Min. Size = 10, Sound Alert = 0.1). The intensity control is the **orange/red gradient slider in the top toolbar**; frames before/after calibration show the handle moved right and all sub-wall levels visibly darkened while 1.2k–1.4k rows glow white.
- **Wall example captured with size readout:** hover popup shows three columns (bid size | ask size | price): 453@23,650 / 299@23,625 / 793@23,600 / **1.4k@23,575** / 654@23,550 / 364@23,525 / 593@23,500 — and at 02:55 the video adds a **red arrow annotation pointing at the 1.4k cell**. Ambient book levels around it are ~230–800, so the wall is ~2–3x ambient, consistent with the digest's inferred prominence ratio. (Live values drifted between takes: transcript's "1.1K @ 23,700" appears in an earlier frame as a 1.2k row; the hover example is 1.4k @ 23,575 exactly as transcribed.)
- **A second, larger wall visible:** a bright band at ~23,700 reads **1.4k → 10k** in the calibrated view — walls grow live on screen between frames, nicely illustrating why she says to recalibrate and never trust closed-candle cells.
- **Official docs confirm stale-data semantics:** she scrolls TradingLite's Learning Center; the Heatmap Basics article states "At the end of each candle's life, a snapshot of the Order Book (liquidity) is captured. These snapshots collectively form the heatmap" and "Limit sell orders, above price; Limit buy orders, below price" — matching the digest's rules verbatim. Backtest implication confirmed: historical heatmap = candle-close snapshots only.
- Teaching frames saved to `media/tradinglite/`: `tradinglite-heatmap-overview-btcusdt-4h.jpg`, `tradinglite-hover-popup-size-price-columns.jpg`, `tradinglite-intensity-calibrated-walls-standout.jpg`, `tradinglite-wall-example-1.4k-btc-at-23575-arrow.jpg`, `tradinglite-zoomed-out-bright-walls-full-ui.jpg`, `tradinglite-docs-heatmap-snapshot-semantics.jpg`.
