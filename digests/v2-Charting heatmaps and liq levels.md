# v2-Charting heatmaps and liq levels — Digest

## Summary
Live 1h BTC walkthrough of the full confluence workflow: mark unrecovered vectors and count levels FIRST (to avoid bias), check the news calendar for the midweek-reversal window, then overlay Hyblock liquidation spikes and TradingLite high-level limit orders, keeping only levels that align with vectors/EMAs/weekly highs-lows. The output is a target zone for the L3 reversal ("where you start looking for M's, not where you automatically open shorts").

## Exact rules & settings
- **Timeframe:** 1 hour. [00:00]
- **Step 0 — area of interest:** mark the nearest **unrecovered vector** above (for longs) — one rejection that couldn't get back into the zone strengthens it; that's the target if long from a W. [00:00]–[00:30]
- **Step 1 — count levels (EMA sequence):** W created the low of last week → L1 rise breaks the 50 EMA **with volume** → runs to the 200 EMA → rejection. In strong trends the retest may only reach the 10 or 20 EMA instead of the 50. [00:30]–[01:00]
- **Macro filter:** a bounce off the 10 EMA *against* the macro trend (e.g., 1h uptrend in a macro bear market) = "massive caution... potentially fake." Bouncing off the 10 WITH the macro trend is fine/strong. [01:00]–[01:30]
- **Step 2 — news timing:** after L2, find the next news event on **Forex Factory** (set local timezone). CPI / Core PPI named. Logic: L3 should complete before or after the event → the event is the candidate **midweek reversal** trigger; if L3 doesn't come before it, expect retrace into the news and L3 after. [02:00]–[03:01]
- **Ordering rule (anti-bias):** mark levels + area of interest **before** opening heatmaps/liquidation levels, "otherwise you'll build a bias." [04:01]–[04:32]
- **High-of-week retest:** if price broke the weekly high, a retest of it before L3 is on the table. [04:32]
- **Step 3 — Hyblock above price:** find highest spike, read exact price (example 24,822), draw it on chart labeled "liquidation level"; then the next-highest (25,225) as the break-beyond level. Both inside the marked unrecovered vector = target confirmed; only reassess if price breaks the zone. [06:03]–[07:03]
- **Step 4 — Hyblock below price (retrace map):** a retracement before L3 takes out **late longs** before the shorts. Mark the below-price spikes near price (example 23,645; ignore the deeper ones while only at L2). [07:03]–[08:03]
- **Keep/discard filter for marked liq levels:** keep only levels that align with something significant — bottom/middle/start/end of a **vector candle**, an **EMA** (20 EMA in example), or a **high/low of the week retest**; discard non-aligned ones. [08:03]–[09:04], [09:35]
- **Step 5 — TradingLite:** find highest limit orders above price (example: 25,200, labeled "Binance shorts"). If it "marries up" with a Hyblock liquidation level AND sits in the vector zone → **that is the target for the day**. If already long: **front-run it as take-profit**. If flat: that's where you start looking for M's — never auto-short it (orders can be pulled). [09:35]–[11:06]
- **Below-price TradingLite:** highest bid wall (example 1.3K BTC at 23,575, labeled "Binance longs"); compare with the below-price liq levels — a tiny retrace there wipes $256M of open positions. [11:06]–[12:06]
- **Iterate:** after each target fills, repeat — next high-level orders, match to Hyblock, confluence with key level / EMA / high-low of day/week / vector candle. [12:06]–[12:36]

## Data-source requirements
- OHLCV candles + EMA set + vector-candle marking (replicable, free).
- **Hyblock** liquidation spikes with exact prices (paid, estimated data).
- **TradingLite** limit-order heatmap incl. order sizes in BTC (paid; historical orderbook depth is very hard to source for backtests — would need exchange L2 snapshots or a substitute like Coinglass/Bookmap archives).
- **Forex Factory** economic calendar (free; historical calendars downloadable) — needed to time midweek-reversal candidates.

## Chart-dependent moments
- [00:00]–[00:30] Choosing "the next highest vector I can find" and judging "one rejection that couldn't get back into the zone" — visual.
- [01:30]–[02:00] "All of that is probably only ONE rise on the 1h" — the multi-swing-to-one-level judgment call is the crux of level counting and is done entirely by eye.
- [06:03]–[06:33] Reading exact spike prices by hover ("very hard to hover and get the exact one").
- [08:34] "the third one is probably around about 50% of this vector candle just eyeing it off" — alignment tolerance never quantified (matters: need a % band for "lines up with").
- [10:05]–[10:35] Judging which heatmap orders are "highest level" is visual brightness-based.

## Quantifiability: 3/5
The workflow is a well-ordered, codable pipeline with concrete confluence conditions; blocked from 5 by unquantified alignment tolerances ("lines up with"), visual level counting, and dependence on point-in-time paid heatmap data that is hard to reconstruct historically.

## Suspected mishears / unclear passages
- [00:30] "it created the **law of last week**" → "the **low** of last week".
- [06:03] "change to this **double thing**" → the Hyblock "2 flag" hover toggle (from the Liquidation-levels lesson).
- [10:35] "I marked these ones as **finance short**" → "**Binance** shorts"; [11:36] "my template marked as **buying it alongs**" → "**Binance longs**".
- [11:36] "which actually would have been where the one was that I **raised**" → "**erased**".
- [12:36] "that is how you nail **life**" → likely "nail **it**" / "nail **levels**".
- [05:02] "Wrise retrace rise" = "W, rise, retrace, rise".
- [00:30]/[04:32] "Wformation"/"Mformation" concatenations throughout.

## New jargon
- **Area of interest** — the unrecovered-vector target zone.
- **Marrying up** — Hyblock liq level + TradingLite order wall + vector/EMA confluence.
- **Front-run** — taking profit just before a marked liquidity level.
- **Midweek reversal** — news-timed L3 trend flip.
- **Binance shorts / Binance longs** — chart-label template names for TradingLite walls.

## Visual findings (watch pass 2, 2026-07-11)
- **Chart platform detail:** the working chart is **TradingView, BTCUSDT Perpetual Swap Contract, 1h, OKX** — she charts OKX perps while the liquidity data (Hyblock = Binance BTC; TradingLite walls labelled "Binance Shorts/Longs") is Binance-based. Cross-exchange mismatch is implicitly accepted; a backtest can do the same.
- **Indicator stack visible:** EMA ribbon; auto-plotted **HOD / LOD / HOW / iHOD / iLOD** high-low labels; session-dot strip (Asia/UK/US); "Market Session Information" panel (shows Current Session: **Dead Zone / Gap**, Next: Asian Session) — the session/Dead-Zone tooling from the sessions lessons is running during this workflow.
- **Step 0 visualised:** the "area of interest" is a shaded **"Area of Interest (AOI)" box** (~24.8k–25.2k) drawn across the chart top, not just a line; W low marked with a green zig-zag arrow.
- **News step confirmed:** Forex Factory week Mar 12–18 2023 on screen — Fed Announcement (Mon 13), **CPI m/m + y/y + Core CPI Tue 14 @ 11:30pm**, Core PPI/Retail Sales Wed 15 — matching the "CPI tonight" narration; date anchors the whole walkthrough to Mar 13–14 2023.
- **Hyblock readings verified on-screen:** red-arrow annotations point at the highest short-liq spikes above price (the 24,822 / 25,225 picks); below-price hover tooltip reads "(Mar 13 2023, 15:01, **23.64547k**) **Long Liqs 100x** 258.18M" — the transcript's "23,645 / $256M wiped" is actually a 100x-long pool of **$258.18M** (exact figure recovered).
- **The marriage moment captured:** chart shows drawn "Liquidation Level" lines at **25,225 / 24,822** (above) and **23,394 / 22,917** (below, post-filter), then a **"Binance Shorts" line at 25,200** sitting right under the 25,225 liq level — right-axis chips 25225.0 and 25200.0 stacked adjacent, inside the AOI/vector zone = the stated "target for the day". Final frame adds **"Binance Longs" at 23,575** with the re-added 23,645 liq level just below.
- **Alignment tolerance hint:** the marry example is a 25-point gap on a ~25,000 price (~0.1%); the wall-to-liq-level offset (25,200 vs 25,225) and the 23,575 wall vs 23,645 liq (~0.3%) give empirical bounds for coding the "lines up with" band (suggest ≤0.3–0.5%).
- Teaching frames saved to `media/charting-heatmaps/`: `step0-aoi-unrecovered-vector-1h-okx.jpg`, `step1-w-low-of-week-level1-rise-ema-break.jpg`, `step2-forexfactory-cpi-ppi-news-week.jpg`, `step3-hyblock-highest-spike-above-price-arrow.jpg`, `step4-liquidation-levels-drawn-above-below.jpg`, `step5-binance-shorts-25200-marries-liq-25225-arrow.jpg`, `hyblock-hover-23645-long-liqs-100x-258M.jpg`, `final-marked-chart-full-confluence.jpg`.
