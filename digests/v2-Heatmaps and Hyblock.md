# v2-Heatmaps and Hyblock — Digest

## Summary
Explains the conceptual difference between the two paid tools — Hyblock shows *already-open* leveraged positions and their estimated liquidation prices; TradingLite shows *resting limit orders* waiting to be filled — and Annie's "marrying" thesis: large TradingLite walls are placed by MM algorithms precisely where Hyblock shows liquidation pools, so their overlap predicts where the Stopping Volume Candle (and hence the first side of the M/W) will print. Heatmap levels are targets, never direct reversal entries.

## Exact rules & settings
- **Hyblock =** current open leveraged positions + *estimated* liquidation levels ("fairly accurate... but an estimate" — wicks may overshoot/undershoot slightly). Bigger liquidity area = bigger MM target. [00:30]–[01:31]
- **TradingLite =** people *waiting* to enter — resting limit orders, not open positions. [02:32]–[03:02]
- **Use 1 — magnet zone / TP front-running:** if long and a big liquidity pool sits above, take profit just in front of it (example: liquidity at $25,000 → TP at $24,950) to avoid the quick reversal. [01:31]–[02:01]
- **Use 2 — reversal targeting:** combine the delta + high liquidity levels with the 3-levels/M-W framework to nail the reversal target better than chart-only. [02:01]–[02:32]
- **Marrying thesis:** MM bots trade across 50+ crypto exchanges; retail cannot post that much volume at one price → an outsized TradingLite wall is MM-placed. If it coincides with a Hyblock liquidation pool, the wall exists **to create the Stopping Volume Candle** there (absorb the move AND collect the liquidations). [03:02]–[04:33]
- **Do NOT trade heatmap levels as direct reversals** ("very dangerous") — use them **as targets**. [04:33]
- **Entry logic at the married level:** SVC printing on the big wall at the liquidation pool = expected **first side of the M or W** — especially meaningful at level 3. Even experts should only take a **staggered partial** entry there, not a full position. [04:33]–[05:03]
- **Follow-through check:** after the first-side wick, check TradingLite — how many of the wall's orders were consumed in that wick? If the wall **remains large** → expect an M pattern or W formation (price to come back for the inside right side). [05:03]–[05:33]
- **Second-side estimation:** as price moves away then returns, watch whether the high-level orders **move up** (for a W) or **move down** (for an M) — that migration marks where the second side will form. [05:33]–[06:03]

## Data-source requirements
- **Hyblock** (paid): open-position liquidation estimates, delta.
- **TradingLite** (paid): live orderbook heatmap with order sizes; the follow-through check additionally needs *order-wall consumption over time* (i.e., historical depth snapshots at wick resolution) — the hardest data requirement in the course to backtest. Substitutes: raw exchange L2 depth archives (Binance historical depth), Bookmap recordings, or dropping the consumption check and proxying with volume absorbed at the level.
- Candles + level count from the core method.

## Chart-dependent moments
- [05:03]–[06:03] The whole first-side/second-side order-migration sequence is promised as "I'll show you all of this when we get to live charts" — no visual here, but the described dynamics (wall consumed vs remaining, wall migrating up/down) need snapshot-diff logic to code.
- [03:33] "over 50 crypto exchanges" claim — background, not codable.

## Quantifiability: 2/5
Clear directional logic (wall + liq pool = SVC target; wall persists = expect second side) but zero numeric thresholds: "high level of liquidity," "really large order," and "remains a high level" are all undefined; and the follow-through/migration checks require intraday depth history.

## Suspected mishears / unclear passages
- "high block" = **Hyblock**; "trading line" [02:32], [03:02] = **TradingLite** (recurring).
- [05:33] "we're either going to create a **h pattern** or a w formation" → almost certainly "an **M pattern** or a W formation".
- [04:33] "take out where I know that there are high levels of open position liquidations" — sentence tangled but meaning recoverable.
- [00:00] "TTC" — course name (Trading TTC), correctly transcribed.

## New jargon
- **Magnet zone** — liquidity pool that attracts price; used for TP placement.
- **Marrying** — requiring TradingLite wall + Hyblock liquidation pool at the same price.
- **First side / inside right side of the M or W** — the two touches of the reversal pattern; SVC expected on the first side.
- **Order-wall migration** — walls moving up (W) or down (M) to mark the second side.

## Visual findings (watch pass 2, 2026-07-11)
- **Structure:** ~0:00–2:45 alternates between a course slide, the live Hyblock web UI, and a TradingView chart; from ~2:45 to the end (the whole "marrying"/SVC/first-side discussion) the screen is a **static "LIQUIDITY SOFTWARE" slide** — confirming the digest note that the live demo is deferred to the charting lesson.
- **Slide text (codifies the definitions):** "Current Open Positions — Estimates of potential price levels where liquidation events may occur; if a trader knows the locations of other traders' liquidation levels, it may provide an edge; to be used as magnetic zones, high risk-to-reward reversal plays, managing risks like stop-loss placement." / "Current Limit Orders — Real-time liquidity heatmap & order-flow tools; helps you rapidly determine which price levels are of interest to the market." (Hyblock screenshot top-right, TradingLite heatmap bottom-right.)
- **Hyblock UI captured (0:40), binance/btcusdt, Mar 20–25 2023:** main pane = price with per-leverage liquidation lines + bubbles; right pane = **"Liq Profile"** histogram (x-axis in $0–200M); bottom pane = **"Liq Levels Delta"** (green/red, y-axis 0 to −15B). **Exact legend series names:** `Price [binance, btcusdt]`, `Shorts`, `Longs`, `Short Liqs 25x`, `Short Liqs 50x`, `Short Liqs 100x`, `Long Liqs 25x`, `Long Liqs 50x`, `Long Liqs 100x`, plus bubble series `Short 25/50/100`, `Long 25/50(/100)`. Nav bar shows **"Api Explorer"** — Hyblock exposes an API, a candidate for historical data for backtests. Colors match the Liquidation-levels lesson (blue 25x / teal 50x / green 100x shorts; pink/red/orange longs).
- **Front-running shown concretely (1:45):** TradingView **BTCUSDT Perpetual Swap, 15m, OKX** chart with a drawn horizontal line labeled **"Liquidation Level"** below price (~27,029 vs price 27,461) — the magnet-zone/TP illustration. Chart also runs her EMA ribbon + a "Market Session Information" panel (Current Session: Weekend, Next Trading Session: **Dead Zone**) with Asia/UK/US session dots — ties to the Dead Zone/session tooling seen elsewhere in the course.
- Recording date: menu bar reads Sun 2 Apr 2023, 5:19 pm.
- Teaching frames saved to `media/heatmaps-hyblock/`: `hyblock-liq-levels-ui-legend-delta-liqprofile.jpg`, `tradingview-liquidation-level-frontrun-tp-example.jpg`, `liquidity-software-slide-openpositions-vs-limitorders.jpg`, `tradingview-15m-okx-session-info-ema-ribbon.jpg`.
