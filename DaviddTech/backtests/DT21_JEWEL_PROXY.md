✅ SURVIVES kill-criteria (center 40/2.0/25 expR **+0.240R** after costs, n=199, **t=2.092**; center-region expR **+0.221R**, all 7 cells positive; best cell 45/2.0/30 **t=2.486**; **27/27** grid cells expR>0) — and unlike every trend-family DT it is a **genuine diversifier**: weekly-R Pearson **≈0 vs DT1/DT2/DT3** (−0.06 / −0.07 / +0.05), a counter-trend fade that is orthogonal to the trend book. **BUT three heavy caveats:** (1) thin per-trade edge (0.24R) — this is a high-turnover fade, not a big-edge system; (2) it is **short-dominated (short +0.354R vs long +0.131R)** and the short side is the one that carries **BOTH author bugs** — no ADX filter and the `isAboveBand` reuse — so the "rescue" is the **ATR trail + a permissive overbought-fade short**, NOT the advertised ADX/range "Jewel filters"; (3) **fixing the bugs KILLS the pass** — the declared symmetric-short sensitivity drops center to expR +0.159R, **t=1.518 (below 2.0)**. The survive is real but **contingent on preserving the author's bugs**; treat DT21 as a diversifying counter-trend candidate to be re-validated, not a clean win for the ADX-filtered Jewel thesis.

# DT21 "Triple-Stochastic + ADX" — causal backtest of DaviddTech "SC-TR-jewel_proxy-adx-range_de-atr_trail"

BTCUSDT **Binance Perpetual**, signals on **closed 4h bars**, fills at the **next 1m open**. IS window **2019-09-09 → 2024-12-31** (11,646 4h bars from 2,795,040 pre-2025 1m candles), minus a 100-bar warmup (the range-deviation percentile window) — ≈ **5.27 yr** of live curve at center. 2025+ locked out (**0 candles ≥ 2025-01-01 UTC loaded**). Engine `backtests/bt_dt21_jewel_proxy.py`. Source of truth `Strategy Codex/DaviddTech/research/pine/SC_adhoc.pine` (Pine v5, 55 lines, author Lindsey Petrone).

**Author claim is SELECTION-ONLY context — not evidence and not a target:** PF 1.96, +258%, DD 11.3%, 211 trades, ~6.2 yr. The +258% comes off a fixed `default_qty_type=strategy.cash, default_qty_value=22500` on 15k capital (1.5× fixed notional) — **STRIPPED**. We test the raw signal at a **flat, symmetric 1%-equity risk both sides**.

**Skeptical prior (per brief):** the entry is a proxy of Krown's **"Jewel" triple-stochastic alignment — a family that DIED in our Krown campaign**. DT21 bolts on an ADX regime filter, a range-deviation location filter and an ATR trail, on the longest window in the bench. The filters were "the only hope." The result below adjudicates whether they rescue it.

## Spec derived from the Pine (frozen, AS-WRITTEN)

- `jw_fast_s = SMA(ta.stoch(close,high,low,5),3)`, `jw_mid_s = SMA(stoch(…,14),3)`, `jw_slow_s = SMA(stoch(…,34),3)` where `ta.stoch = 100·(close−lowest(low,len))/(highest(high,len)−lowest(low,len))`.
- `ADX` = 3rd output of `ta.dmi(14,14)` (Wilder DMI, `ADX = rma(DX,14)`).
- `rangeHigh = ta.percentile_nearest_rank(high,100,90)` (90th of last 100 highs), `rangeLow = percentile_nearest_rank(low,100,10)` (10th of last 100 lows). `isAboveBand = high>rangeHigh`, `isBelowBand = low<rangeLow`.
- **LONG** (closed bar): `jw_fast_s>jw_mid_s>jw_slow_s` AND all three `< L` AND `jw_fast_s` **rising** AND `ADX < adxMax` AND `NOT isAboveBand`.
- **SHORT (AS-WRITTEN)** (closed bar): `jw_fast_s<jw_mid_s<jw_slow_s` AND all three `> 100−L` AND `jw_fast_s` **falling** AND `NOT isAboveBand`.

### ⚠️ TWO AUTHOR BUGS ON THE SHORT SIDE (preserved, tested as-written, flagged)

1. **No ADX condition on the short.** The long is gated by `ADX < adxMax`; the short has **no ADX term at all**. The strategy's headline "regime filter" only touches longs.
2. **The short reuses `isAboveBand` (not the mirror `isBelowBand`).** `NOT isAboveBand` on a *short* only blocks the entry when price is simultaneously poking a ~100-bar **high** — it is a near-permanent pass, and structurally it is the *wrong-signed* location filter for a short. The intended mirror would be `NOT isBelowBand`.

Both are tested exactly as written. A **single declared sensitivity row** (center params, comparison only) swaps in the *intended* symmetric short — `ADX < adxMax AND NOT isBelowBand` — to measure what the bugs are worth. **The bugs help** (see below).

### Position logic (Pine `pyramiding=0`, `strategy.entry` reverses) — our reading

`longEntry` and `shortEntry` are **mutually exclusive** per bar (cannot have `fast>mid>slow` AND `fast<mid<slow`), so at most one fires. With `pyramiding=0`: flat + signal → open that side (fill next 4h open); in-position + same-side signal → blocked (no add); in-position + **opposite** signal → **reverse** (close at next open, open opposite at next open); the ATR trail stop can close intrabar at any time. A **flat-or-reversing** state machine.

### Exit — ATR trailing stop as an INTRABAR STOP order (the structural difference from DT19)

`long: trail = max(prev_trail, close − trailMult·ATR14)`, updated at each 4h **close**; the level set at close of bar *b* is the active stop **during bar b+1**. Short mirrors with `min(…, close + trailMult·ATR14)`. Seed at entry `= close(signalBar) ∓ trailMult·ATR(signalBar)` (known at entry — the same level Pine places at the signal-bar close). Trail **resets when flat**. Unlike DT19's close-evaluated trail, DT21's stop **fills intrabar at the level**: if bar *b*'s `low ≤ trail` (long) / `high ≥ trail` (short) the stop fires during the bar; fill reference `= min(open_b, trail)` long / `max(open_b, trail)` short (a bar that **gaps through** the trail fills at the worse open, never the favorable level), then adverse slippage.

**1m tie-break / ambiguous = LOSS is VACUOUS here:** there is a *single* stop order and *no* take-profit, so no intrabar stop-vs-target contest exists to resolve. The conservative elements that embody the convention are (i) the gap-through **open** fill and (ii) a bar that both **enters and hits its seed trail is booked a LOSS** (same-bar stop). The 4h low/high is a mathematically exact "did the bar touch the single stop level" test — 1m cannot change the answer for one level.

### Fill-model divergence from Pine (stated)

Pine `process_orders_on_close=true` fills entries/reversals **at the signal bar's close** (same-bar). We use the house **causal** model: condition detected on the **closed** 4h bar, fill at the **open of the next 4h bar** (= first 1m open after the close). Strictly more conservative (no same-bar look-ahead). Combined with stripping the fixed-cash 1.5× notional, this is why our flat-risk return (+57% center) is nowhere near the author's +258%.

### Risk unit (declared)

Flat **1%-of-equity risk vs the INITIAL trail distance at entry = `trailMult × ATR(14)` on the signal bar**. `R = net / (equity·1%)`, symmetric both sides, compounding — identical model to DT18/DT19. R-space metrics (expR/PF/WR/t/maxDD_R) are invariant to compounding-vs-fixed sizing.

## Execution conventions (reused from `backtests/bt_engine.py` via DT18/DT19 scaffolding)

Fees **0.05%/side**, slippage **0.02%/fill**, **$10k** start, compounding 1%-risk. Entry fill `= open×(1±slip)`; trail exit fill `= level×(1∓slip)`; reverse/eod exit fill `= next-open×(1∓slip)` (adverse both ends). 4h **mark-to-market** total-equity curve → Sharpe (× √(6·365)) and maxDD%; per-trade R drives expR/PF/t/maxDD_R; MAR = CAGR%/maxDD%. Deterministic: no RNG, no wall-clock, sorted output — two runs byte-identical (md5s below). Diagnostic: **0** degenerate flat-range stoch bars over the whole series (no division-by-zero neutralisation ever triggered).

## DECLARED GRID (fixed BEFORE any result) — exactly 27 cells, no additions

```
L        in {35, 40, 45}      (long < L ; short > 100−L)
trailMult in {1.5, 2.0, 2.5}  (ATR-trail multiplier)
adxMax   in {20, 25, 30}      (ADX ceiling — LONG side only, as-written)
=> 3 × 3 × 3 = 27 cells.  Center = Pine defaults (L=40, trailMult=2.0, adxMax=25).
stoch lengths 5/14/34 smooth 3, ATR/DMI len 14, range lookback 100 fixed (not grid dims).
```

## Full grid — every declared cell (after costs)

`expR` = mean per-trade R; `PF` from R; `Sharpe`/`maxDD%` = 4h mark-to-market annualized; `maxDD_R` = cumulative-R drawdown; `t` = per-trade t-stat (mean R / (σ/√n)); `totRet%` = compounding $10k curve; `MAR` = CAGR/maxDD%.

| L | trailMult | adxMax | n | WR% | expR | PF | Sharpe | maxDD_R | maxDD% | t | totRet% | MAR |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 35 | 1.5 | 20 | 122 | 36.1 | 0.135 | 1.301 | 0.457 | 12.57 | 13.00 | 0.933 | 16 | 0.222 |
| 35 | 1.5 | 25 | 172 | 36.6 | 0.141 | 1.318 | 0.591 | 16.62 | 16.49 | 1.207 | 25 | 0.262 |
| 35 | 1.5 | 30 | 221 | 38.0 | 0.213 | 1.489 | 0.964 | 8.82 | 9.98 | 1.730 | 55 | 0.864 |
| 35 | 2.0 | 20 | 117 | 46.2 | 0.360 | 1.982 | 1.106 | 5.76 | 7.35 | 2.093 | 49 | 1.077 |
| 35 | 2.0 | 25 | 162 | 43.8 | 0.314 | 1.853 | 1.243 | 5.45 | 7.27 | **2.381** | 63 | 1.329 |
| 35 | 2.0 | 30 | 207 | 41.1 | 0.267 | 1.691 | 1.227 | 6.49 | 7.23 | 2.168 | 68 | 1.437 |
| 35 | 2.5 | 20 | 108 | 47.2 | 0.197 | 1.540 | 0.660 | 6.83 | 8.09 | 1.374 | 22 | 0.480 |
| 35 | 2.5 | 25 | 154 | 45.5 | 0.256 | 1.696 | 1.055 | 7.79 | 9.64 | 2.060 | 46 | 0.767 |
| 35 | 2.5 | 30 | 197 | 42.1 | 0.209 | 1.542 | 1.007 | 6.95 | 7.98 | 1.848 | 47 | 0.957 |
| 40 | 1.5 | 20 | 150 | 34.0 | 0.081 | 1.175 | 0.309 | 16.07 | 16.00 | 0.650 | 11 | 0.125 |
| 40 | 1.5 | 25 | 214 | 35.5 | 0.127 | 1.283 | 0.596 | 16.65 | 16.61 | 1.219 | 28 | 0.290 |
| 40 | 1.5 | 30 | 268 | 36.2 | 0.177 | 1.396 | 0.892 | 9.55 | 10.57 | 1.631 | 54 | 0.811 |
| 40 | 2.0 | 20 | 140 | 42.1 | 0.236 | 1.596 | 0.835 | 7.98 | 9.34 | 1.602 | 36 | 0.648 |
| **40** | **2.0** | **25 ◆** | **199** | **41.2** | **0.240** | **1.615** | **1.084** | **6.76** | **7.89** | **2.092** | **57** | **1.134** |
| 40 | 2.0 | 30 | 248 | 38.7 | 0.201 | 1.496 | 1.037 | 7.63 | 8.48 | 1.864 | 59 | 1.084 |
| 40 | 2.5 | 20 | 129 | 43.4 | 0.106 | 1.273 | 0.408 | 9.46 | 10.79 | 0.862 | 13 | 0.222 |
| 40 | 2.5 | 25 | 187 | 43.9 | 0.197 | 1.517 | 0.932 | 8.62 | 9.11 | 1.831 | 42 | 0.749 |
| 40 | 2.5 | 30 | 233 | 41.2 | 0.157 | 1.392 | 0.850 | 9.23 | 9.53 | 1.575 | 40 | 0.696 |
| 45 | 1.5 | 20 | 181 | 33.1 | 0.090 | 1.192 | 0.374 | 20.66 | 19.79 | 0.777 | 15 | 0.137 |
| 45 | 1.5 | 25 | 250 | 35.2 | 0.142 | 1.317 | 0.720 | 19.38 | 18.06 | 1.462 | 39 | 0.354 |
| 45 | 1.5 | 30 | 311 | 36.7 | 0.220 | 1.491 | 1.151 | 10.18 | 10.82 | 2.076 | 88 | 1.178 |
| 45 | 2.0 | 20 | 167 | 40.7 | 0.198 | 1.477 | 0.795 | 11.17 | 11.77 | 1.500 | 36 | 0.509 |
| 45 | 2.0 | 25 | 229 | 41.5 | 0.232 | 1.589 | 1.162 | 10.84 | 10.71 | 2.194 | 65 | 0.935 |
| 45 | 2.0 | 30 ★ | 283 | 40.3 | 0.264 | 1.655 | 1.430 | 7.63 | 8.28 | **2.486** | 102 | 1.722 |
| 45 | 2.5 | 20 | 152 | 42.1 | 0.090 | 1.222 | 0.386 | 14.22 | 15.16 | 0.794 | 13 | 0.155 |
| 45 | 2.5 | 25 | 213 | 44.1 | 0.187 | 1.487 | 0.971 | 10.50 | 10.47 | 1.875 | 46 | 0.704 |
| 45 | 2.5 | 30 | 263 | 43.0 | 0.188 | 1.477 | 1.091 | 10.86 | 11.77 | 1.996 | 59 | 0.782 |

◆ = center (Pine defaults). ★ = best cell by t-stat. **All 27 cells: expR > 0** (range +0.081 … +0.360, median +0.197). **8 cells clear t ≥ 2.0, 6 of them on the `trailMult=2.0` row.** Full CSV: `dt21_grid.csv`.

**Structure of the surface:** `trailMult=2.0` is a clean ridge (every 2.0 cell has t ∈ 1.50–2.49 and maxDD% ≤ 11.8), while `trailMult=1.5` is the danger row — tight trails whipsaw into **13–20% drawdowns** and t < 1.5. `trailMult=2.5` is mid. The Pine default 2.0 lands on the good ridge; the ATR-trail multiplier is the dominant robustness axis, more than L or adxMax.

## Long/short split at center (40/2.0/25) + exit mix

| Side | n | WR% | expR | PF |
|---|---|---|---|---|
| Long | 102 | 39.2 | +0.131 | 1.337 |
| Short | 97 | 43.3 | **+0.354** | **1.908** |

**Exit mix (center):** `trail` 171 (86%) · `reverse` 28 (14%) — no `eod`. The intrabar ATR trail is overwhelmingly the exit; opposite-signal reversals are rare.

**The edge is SHORT-dominated (+0.354R vs +0.131R)** — the exact opposite of the long-dominated 4h trend family (DT1/DT18/DT19). And the strong side is the **buggy** one: the short carries *no* ADX filter and the wrong-signed location filter. This is the central tension in DT21 — the advertised "ADX-filtered Jewel" long is the *weak* half; the workhorse is a lightly-filtered overbought **fade short** ridden by the ATR trail.

## ⚠️ Declared sensitivity — the "intended" symmetric short (bug-fix), center params only

Swap the as-written short for `jw_fast_s<jw_mid_s<jw_slow_s AND all>100−L AND falling AND **ADX<adxMax** AND **NOT isBelowBand**`:

| Variant (center 40/2.0/25) | total n | expR | PF | Sharpe | t | short n | short expR | short WR% |
|---|---|---|---|---|---|---|---|---|
| **AS-WRITTEN (bugs kept)** | 199 | **+0.240** | 1.615 | 1.084 | **2.092** | 97 | **+0.354** | 43.3 |
| Symmetric "intended" (bugs fixed) | 217 | +0.159 | 1.375 | 0.763 | **1.518** | 115 | +0.169 | 39.1 |

**Fixing the bugs makes DT21 worse and pushes center t below 2.0.** Why (measured directly on the center ledger):
- **ADX-bug:** 35 of 97 as-written shorts (36%) had `ADX ≥ 25` at signal — the missing ADX term lets them through, and they average **+0.295R** (profitable). The intended `ADX<25` filter would *discard* these positive-EV shorts. (The 62 ADX<25 shorts average +0.387R.)
- **isAboveBand-reuse bug:** **0** as-written shorts had `isBelow=True` at signal — an overbought-alignment short is never simultaneously poking a 100-bar low, so the intended `NOT isBelowBand` filter is **vacuous** (blocks nothing), whereas the as-written `NOT isAboveBand` *does* bind (blocks overbought-into-fresh-high shorts). That is why the "fixed" short takes **more** trades (115 vs 97) yet a **lower** average — it removes a filter that was actually helping and adds one that mostly removes winners.

**Takeaway:** DT21's statistical pass is **contingent on the author's bugs**. The "principled" symmetric version fails the best-cell/center t≥2 bar. This is a yellow flag on durability, not a disqualifier under the declared criteria.

## Center-region analysis

Center + its 6 axis-adjacent neighbours (one grid step on one axis):

| cell (L/trail/adxMax) | expR | PF | t | maxDD% |
|---|---|---|---|---|
| 40/2.0/25 (center) | 0.240 | 1.615 | 2.092 | 7.89 |
| 35/2.0/25 | 0.314 | 1.853 | 2.381 | 7.27 |
| 45/2.0/25 | 0.232 | 1.589 | 2.194 | 10.71 |
| 40/1.5/25 | 0.127 | 1.283 | 1.219 | 16.61 |
| 40/2.5/25 | 0.197 | 1.517 | 1.831 | 9.11 |
| 40/2.0/20 | 0.236 | 1.596 | 1.602 | 9.34 |
| 40/2.0/30 | 0.201 | 1.496 | 1.864 | 8.48 |

**Center-region mean expR after costs = +0.221R** (all 7 cells positive → kill-gate cleared). The surface is monotone-ish but **not flat**: the weakest neighbour is the `trailMult=1.5` variant (0.127R, t=1.22, **16.6% DD**) — the tight-trail axis is where the edge and the drawdown control both fall apart. No sign flips or cliffs, but the region is anchored by `trailMult=2.0`; step off it toward 1.5 and the case weakens sharply.

## Best cell + multiplicity caveat

Best by t-stat = **45/2.0/30**, t=2.486 (expR 0.264, PF 1.655, Sharpe 1.430, MAR 1.722, DD 8.28%, n=283). Note it sits at the **loosest L and loosest ADX** corner of the `trailMult=2.0` ridge — the "best" pulls toward *more permissive filters / more trades*, consistent with the finding that the filters are not the edge (the ATR trail + trade count are). It is **not a lone spike**: eight cells clear t≥2.0 and six of them lie on the `trailMult=2.0` row (t 1.50–2.49), so the trail-multiplier choice is robust; but the specific `L=45, adxMax=30` pick is a mild turnover-maximising corner, not a principled optimum. Ledger: `dt21_trades_best.csv` (283 trades). Center and best are the same story at slightly different turnover.

## KILL CRITERIA (verbatim)

> **DEAD unless center-region expR after costs > 0 AND ≥ 40 IS trades at center AND best-cell t ≥ 2.0.**

| Gate | Threshold | Actual | Pass? |
|---|---|---|---|
| Center-region expR after costs | > 0 | **+0.221R** (7/7 cells positive) | ✅ |
| IS trades at center | ≥ 40 | **199** | ✅ |
| Best-cell t | ≥ 2.0 | **2.486** | ✅ |

**All three pass → SURVIVES.** (Center t=2.092 also clears 2.0 independently.) The declared criteria decide the verdict; the caveats above (thin edge, short/bug dependence, symmetric-fix failing) inform how much weight to place on it — they do **not** move the goalposts.

## Krown-Jewel context — does the filtered version rescue the dead Jewel family?

**Qualified yes — but not for the advertised reason.** The raw Krown "Jewel" triple-stochastic alignment died as a standalone trigger. DT21 (triple-stoch proxy + ADX + range + ATR trail) **passes all three kill gates and adds real diversification** (r≈0 vs the whole trend book), which the dead raw Jewel never offered. So the *packaged* strategy clears the bar. **However**, the rescue is carried by (a) the **ATR trail** (86% of exits; `trailMult=2.0` is the dominant robustness axis) and (b) a **permissive overbought-fade short** — the side that has **no ADX filter** — not by the ADX regime filter the strategy is named for. The ADX-gated **long** is the *weaker* half (+0.131R). And the pass **evaporates when the short bugs are fixed** (t 2.09→1.52). Net: the filters do not cleanly resurrect the Jewel signal; a **trailing-stop counter-trend fade** does, and its statistical significance leans on author bugs. Carry DT21 forward as a *diversifying counter-trend candidate for re-validation*, explicitly flagged that its survival is bug-contingent.

## C2 comparison + cross-DT weekly-R correlations

C2 benchmark (`Strategy Codex/Krown/backtests/C2_DAILY_TREND_BENCHMARK.md`): C2 center **Sharpe 0.93 / MAR 0.96**; C2 best-gated **Sharpe 1.44 / MAR 2.56**.

| | Sharpe | MAR |
|---|---|---|
| C2 center | 0.93 | 0.96 |
| C2 best-gated | 1.44 | 2.56 |
| **DT21 center (40/2.0/25)** | **1.084** | **1.134** |
| **DT21 best (45/2.0/30)** | **1.430** | **1.722** |

DT21 center **beats C2 center on both** Sharpe and MAR. DT21 best **essentially ties C2 best-gated on Sharpe** (1.43 vs 1.44) but trails on MAR (1.72 vs 2.56).

**Weekly-summed-R Pearson vs prior center ledgers** (union of active weeks, missing weeks = 0R; DT21 active 145 wk):

| vs | r | weeks | note |
|---|---|---|---|
| DT1 center (`dt1_trades_center.csv`) | **−0.059** | 274 | DT1 active 71 wk |
| DT2 center (`dt2_trades_center.csv`) | **−0.065** | 276 | DT2 active 153 wk |
| DT3 center (`dt3_trades_center.csv`) | **+0.045** | 276 | DT3 active 183 wk |

**All three ≈ 0 (|r| ≤ 0.065).** DT21 is **statistically uncorrelated** with the DT trend/breakout book — it is a distinct **counter-trend fade** return stream. This is DT21's strongest positive: where DT18/DT19 were redundant with DT1 (r≈0.80), DT21 is a genuine diversifier. If it survives out-of-sample re-validation with the bug caveat resolved, it earns a *separate* book slot rather than replacing an existing line.

## Worked examples (hand-traced from `dt21_trades_center.csv`, arithmetic verified to the cent)

**Example 1 — LONG, TRAIL exit (ratchet turns a full stop into a partial loss):**
- Signal bar `2019-10-16 20:00` close. Stochs `jw_fast_s=24.18 > jw_mid_s=13.35 > jw_slow_s=9.71`, all `< 40=L` ✓; `jw_fast_s` **rising** (24.18 > prior 18.44) ✓; `ADX=21.71 < 25` ✓; `NOT isAboveBand` ✓ → **LONG**.
- Fills next open `2019-10-17 00:00` `entry_ref=7994.76 → entry_fill=7996.36` (×1.0002). `entry_atr=105.53`, risk unit `stop_dist=2.0×105.53=211.07`, **seed trail = 7994.76… (signalClose − 2·ATR) = 7781.14**. `size = risk/stop_dist = 104.06/211.07 = 0.493028`.
- Price rose a little (trail ratcheted **up** from 7781.14 toward ~7881) then fell through it → intrabar trail stop. Exit `exit_ref=7881.10 → exit_fill=7879.52` (×0.9998).
- `gross = 0.493028×(7879.52 − 7996.36) = −57.61`; `fees = 0.493028×(7996.36+7879.52)×0.0005 = 3.91`; `net = −61.52`; **R = −61.52/104.06 = −0.591** ✓. The ratchet cut what would have been a −1R stop to −0.59R.

**Example 2 — SHORT, TRAIL exit (winner; note ADX is NOT checked on the short):**
- Signal bar `2019-11-05 00:00` close. Stochs `jw_fast_s=65.53 < jw_mid_s=66.94 < jw_slow_s=72.44`, all `> 60=100−L` ✓; `jw_fast_s` **falling** (65.53 < prior 73.74) ✓; `NOT isAboveBand` ✓ → **SHORT**. `ADX=13.92` here (happens to be low, but **the short applies no ADX gate** — bug 1).
- Fills next open `2019-11-05 04:00` `entry_ref=9410.00 → entry_fill=9408.12` (×0.9998). `entry_atr=131.16`, `stop_dist=262.33`, **seed trail = 9410 + 2·ATR = 9672.33**. `size = 104.76/262.33 = 0.399330`.
- Price fell; the trail ratcheted **down** toward ~9012, then bounced up through it. Exit `exit_ref=9012.47 → exit_fill=9014.27` (×1.0002).
- `gross = 0.399330×(9408.12 − 9014.27) = 157.28`; `fees = 3.68`; `net = 153.60`; **R = 153.60/104.76 = +1.466** ✓.

**Example 3 — the ADX-bug being materially profitable (a short `ADX≥25` would block):**
- Signal `2022-05-05 00:00`, overbought alignment `jw_fast_s=83.29 < 87.76 < 88.43`, all `> 60`, falling; **`ADX=26.02` — the intended `ADX<25` filter WOULD reject this short**, but as-written it fires. Short at `39731.30`, seed trail `40951.83`; rode the May-2022 collapse to a trail exit at `31999.04`. `net=+896.45`, **R = +6.29**. This single trade — one of 35 `ADX≥25` shorts (mean +0.295R) the bug admits — is the kind of big down-leg fade the "fixed" symmetric version would forgo.

## PROOFS

**py_compile:**
```
$ python3 -m py_compile backtests/bt_dt21_jewel_proxy.py
PY_COMPILE_OK
```

**Determinism — md5 of ledgers, two independent runs (byte-identical):**
```
run 1   md5 center ledger: 075eb469b99c02a252c8e80f66af83d7
run 2   md5 center ledger: 075eb469b99c02a252c8e80f66af83d7
run 1   md5 best   ledger: 4d8b92f4aea34bdebe3ee1b6204bf224
run 2   md5 best   ledger: 4d8b92f4aea34bdebe3ee1b6204bf224
run 1   md5 grid csv     : 68bb76fff7fcd88393a13a1ec3152d4d
run 2   md5 grid csv     : 68bb76fff7fcd88393a13a1ec3152d4d
```

**Candle count + <2025 lockout proof:**
```
1m rows loaded: 2,795,040   min=2019-09-09 00:00:00+00:00   max=2024-12-31 23:59:00+00:00
4h bars:           11,646   min=2019-09-09 00:00:00+00:00   max=2024-12-31 20:00:00+00:00
cutoff (exclusive): 2025-01-01 00:00:00+00:00   →  0 candles ≥ 2025-01-01 UTC loaded
degenerate flat-range stoch bars: 0   warmup: 100 bars
```
Max 1m timestamp is `2024-12-31 23:59` and the last 4h bar opens `2024-12-31 20:00` (closes 23:59) — the entire 2025 out-of-sample period is untouched.

## Files

- Engine: `backtests/bt_dt21_jewel_proxy.py`
- Report: `Strategy Codex/DaviddTech/backtests/DT21_JEWEL_PROXY.md`
- Ledgers: `dt21_trades_center.csv` (199 trades) · `dt21_trades_best.csv` (283 trades) · `dt21_grid.csv` (27 cells)
- Stats dump: `backtests/_dt21_stats.json`
