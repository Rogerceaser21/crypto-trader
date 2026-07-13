# v2-Liquidation levels — Digest

## Summary
Tour of Hyblock's liquidation-levels chart: leverage-tiered liquidation bands above/below price, bubble/spike size as liquidity-pool size, the participation count, and the long-vs-short liquidation delta. Gives the two headline thresholds of the method: combined participation > 1,000 for a "real" move, and a ~$20B liquidation delta as the reversal-watch trigger (explicitly NOT an automatic reversal and NOT a prerequisite).

## Exact rules & settings
- **Platform:** Hyblock liquidation chart; requires the **Advanced subscription** (course Discord reposts it, so members don't strictly need it). [00:30]–[01:00]
- **Chart semantics:** everything **above** price = short liquidation levels (hit if price reverses up); everything **below** = long liquidation levels. [01:30]
- **Leverage color tiers:** shorts — blue = 25x, teal = 50x, army green = 100x; longs — pink = 25x, orange = 100x, red(ish) = 50x. The closer to current price, the higher the leverage. A legend/"map" exists at the bottom of the chart. [01:30]–[02:31], [09:34]
- **Level ↔ leverage mapping heuristic:** L1 drop takes the 100x traders, L2 drop the 50x, L3 drop the 25x; once those are done, start looking for a potential reversal. 10x-and-below are generally not the target (liq points too far). Prime MM targets = 25x/50x/100x. [02:31]–[03:31]
- **Bubbles/spikes:** larger bubble = larger liquidation pool = target for a sharp stop hunt or trend reversal; the right-hand-side spikes show the same info. Hover with the "2 flag" toggle to read the exact price of a spike. [03:31]–[04:31]
- **Participation count / sentiment:** the short-liqs vs long-liqs counts (example: 61 shorts vs 530 longs = heavily long retail sentiment → "eventually game over for them"). [04:31]–[05:01]
- **Thin-book threshold:** shorts+longs combined should be **> 1,000**; under that (~600 in example) = price moving on low participation → potential **fake move**. [05:01]–[05:31]
- **Delta subchart:** green = more longs at liquidation risk, red = more shorts; a red→green flip marks a bias change (shown lining up with a W formation and a level-1 rise). [05:31]–[06:32]
- **Delta magnitude rule:** hover near current price → bracket shows date, time, and delta with a "B" suffix ($ billions of extra longs vs shorts). **~$20B is the pay-attention mark** — historically where reversals mostly happened. [07:02]–[07:32]
  - NOT an automatic reversal: at $27B but only level 2, still expect the third rise — the level model overrides. >20B means "plan ahead, a bigger move is coming." [08:03]–[08:33]
  - NOT a prerequisite: reversals can happen at $4B or $10B if liquidity is concentrated near price (e.g., all long spikes clustered just below → a quick spike down collects them). [08:33]–[09:34]
- **Combination rule:** always combine (1) how many are trading now, (2) where the highest liquidity concentration is, (3) what level you're in, (4) the delta — never one input alone. [09:34]
- **Confluence inputs when >20B:** upcoming news event that could trigger the midweek reversal; current level; nearby unrecovered vector. [08:03]–[08:33]

## Data-source requirements
- **Hyblock (paid, Advanced plan):** estimated liquidation levels by leverage tier, liquidation bubbles/spikes, long/short liquidation counts, cumulative liquidation delta ($B). All are *estimates* derived from open positions.
- For backtesting this must be replicated or substituted: options are Hyblock API history (if purchasable), Coinglass liquidation heatmap, or synthesizing liq levels from OI + entry-price estimates with standard liq-price formulas per leverage tier (25/50/100x). The delta-$B series and participation counts are the hardest to reproduce; flag as a major data dependency.
- Also needs the level-count engine (candles) and news calendar for the combination rule.

## Chart-dependent moments
- [02:00]–[02:31] Color-tier identification done by zooming on screen — tier colors could differ in current Hyblock UI.
- [03:31]–[04:31] "Large bubble" / "large spike" size threshold is entirely visual — needs a percentile/relative-size definition to code.
- [06:01]–[06:32] The delta-flip-equals-W example and "you can see this would be a level one rise" read off the delta pane visually.
- [09:03]–[09:34] The "all liquidity concentrated here" early-reversal example — concentration is eyeballed.

## Quantifiability: 3/5
Two explicit numeric thresholds (>1,000 combined participants; ~$20B delta watch) and a clean leverage-tier mapping. Blocked from 5 by: proprietary estimated data, "large bubble/spike" undefined, and the 20B rule being a discretionary watch condition (can reverse at 4–10B) rather than a trigger.

## Suspected mishears / unclear passages
- "high block" throughout = **Hyblock**.
- [02:31] "then there's kind of a **ready** one the ready one is showing 50" → almost certainly "a **reddy/red** one" (50x long color).
- [06:32] "bought in this amount of **lungs**" → "longs".
- [08:03] "if this is a level **to** rise" → "level two rise".
- [08:33] "Don't worry about what you can **train** now" → "trade now".
- [04:31]/[07:02] "Wat"/"Bat the end" = "W at" / "B at the end" (concatenations).
- [00:00] "current open position liquidity" — slightly garbled; means "current open positions and their liquidation levels".

## New jargon
- **Liquidation delta** — $ imbalance of longs-at-risk vs shorts-at-risk (the "B" number).
- **Bubbles / spikes** — Hyblock's two renderings of liquidation-pool size.
- **1 flag / 2 flag toggle** — Hyblock UI control for hover/price readout.
- **Participation count** — number of long vs short accounts at liquidation risk.
- **Midweek reversal** — the news-triggered trend flip the weekly model anticipates.

## Visual findings (watch pass 2, 2026-07-11)
- **Exact tool + settings captured:** "Hyblock Liquidation Levels – BTCUSDT [binance]" chart generated from a settings bar: **Timeframe = 1 min (locked), Exchange = Binance, Ticker = BTC, Granularity slider, Setting Preset = Default, [Run] / [Save Graph]** — i.e. the chart is a *generated snapshot*, re-run on demand, not a streaming panel. Header shows "Last Updated: 2023-03-13 23:31–23:35 UTC" plus the participation counts inline: "**Total short liquidations 61 / Total long liquidations 530**" (the exact 61/530 example in the transcript).
- **Panel anatomy confirmed:** main pane = price line with per-leverage liquidation lines + bubbles (blue band 25x shorts dominates above; teal 50x, grey-green 100x nearer price; pink/orange/red long tiers below); right pane = **"Liq Profile"** side-histogram ($0–400M axis in this session); bottom pane = **"Cumulative Liq Levels Delta"** (y-axis 0–30B, green = long-side excess, red = short-side).
- **Hover readouts (video has red-arrow edit annotations pointing at them):** tooltips give `(date, time, price)` + series + $ size, e.g. "(Mar 13 2023, 15:36, 24.3445k) 190.06M", "(Mar 12 2023, 22:17, 21.06458k) **Long Liqs 50x** 181.11M", "(Mar 13 2023, 14:08, 22.91513k) **Long Liqs 100x** 401.29M" — so individual spikes are attributable to a leverage tier and dollar size. Delta hover reads "(Mar 13 2023, 23:08, **27.1423B**) Cumulative P…" — the transcript's "$27B" example, confirmed on-screen.
- **Delta-flip example visually verified:** Mar 9–14 2023 window; the delta pane sits red through the Mar 10–12 basing (the W), flips green on Mar 13 exactly as the L1 rise starts, then steps up to 27B into the L2 — matches the narrated read.
- **Data-source implications:** everything shown is Binance-BTC-only estimates at 1-min granularity; spike sizes are $M per level per tier, delta is a cumulative $B series. Substitution for backtests must produce: per-tier liq-level lines (25/50/100x), per-level $ pool sizes, long/short participation counts, and a cumulative delta series. (Nav bar again shows **Api Explorer** — check Hyblock API for historical pulls.) The 0:20 homepage frame notes "10+ products, 60+ custom indicators".
- Teaching frames saved to `media/liquidation-levels/`: `hyblock-liq-bands-25x50x100x-full-chart.jpg`, `hyblock-settings-bar-binance-btc-spike-hover-arrow.jpg`, `hyblock-hover-long-liqs-50x-181M-arrow.jpg`, `hyblock-hover-long-liqs-100x-401M-liqprofile.jpg`, `hyblock-participation-61-shorts-530-longs-header.jpg`, `hyblock-delta-pane-red-to-green-flip-w-formation.jpg`, `hyblock-delta-hover-27.14B-readout.jpg`.
