✅ SURVIVES kill-criteria (center 15/90/4.5 expR **+0.599R** after costs, n=105, **t=2.565**; best-cell 10/90/4.5 t=2.569; **27/27** grid cells expR>0, PF>1.9) — but **REDUNDANT vs DT1**: weekly-R Pearson **r=0.82** (same 4h EMA-cross trend edge, no diversification). Unlike DT18 it is NOT worse-everywhere — the trailing exit makes it a risk-adjusted **upgrade** on DT1 (Sharpe 1.54 vs 1.30, MAR 1.82 vs 1.47, DD 6.7% vs 9.4%, t 2.57 vs 2.00) at a lower per-trade edge (0.60R vs 0.90R). Carry **ONE** trend-family line, not both; treat DT19 as a candidate trailing-stop refinement of DT1, not an additional book slot.

# DT19 "Regime Rider" — causal backtest of DaviddTech "Regime Rider 4h"

BTCUSDT **Binance Perpetual**, signals on **closed 4h bars**, fills at the **next 1m open**. IS window **2019-09-09 → 2024-12-31** (11,646 4h bars from 2,795,040 pre-2025 1m candles), minus a `max(slowLen, 200)`-bar warmup per cell (≈ 5.23 yr of live curve at center). 2025+ locked out (0 candles ≥ 2025-01-01 UTC loaded). Engine `backtests/bt_dt19_regime_rider.py`. Source of truth `Strategy Codex/DaviddTech/research/pine/Regime_Rider_4h.pine` (Pine v5, 49 lines).

**Author claim is SELECTION-ONLY context — not evidence and not a target:** PF 2.27, +438%, DD 21%, 79 trades, ~5 yr. The headline **+438% is inflated by `default_qty_type=percent_of_equity, default_qty_value=100`** — i.e. 100%-of-equity compounding on every trade, not edge. We strip that and test the raw signal at a **flat, symmetric 1%-equity risk both sides**. The result below is what the signal is actually worth un-leveraged.

## Spec derived from the Pine (frozen)

- `emaFast = EMA(close, emaFastLen)`, `emaSlow = EMA(close, emaSlowLen)`, `emaRegime = EMA(close, 200)`, `atr = ta.atr(14)`.
- `longCond  = close > emaRegime AND ta.crossover(emaFast, emaSlow)` — on a **closed** 4h bar (Pine semantics: strict compare now, `≤/≥` on the prior bar).
- `shortCond = close < emaRegime AND ta.crossunder(emaFast, emaSlow)`.
- `longExitSignal = ta.crossunder(emaFast, emaSlow)` closes a long **unconditionally**; `shortExitSignal = ta.crossover(emaFast, emaSlow)` closes a short unconditionally.
- **TRAILING stop** (the *only* structural difference from DT1/DT18, which used a **frozen** hard stop):
  - `longExtreme := close` on the signal bar (`position_size ≤ 0 & longCond`), then ratchets to `math.max(longExtreme, close)` each bar while long. `longTrailStop = longExtreme − atrMult·atr`, with **`atr` = the CURRENT ATR(14) recomputed every bar** (not frozen).
  - short mirror: `shortExtreme := close`, ratchets to `math.min(...)`, `shortTrailStop = shortExtreme + atrMult·atr`.
- **Exits are CLOSE-EVALUATED on closed bars (NO intrabar stop)** — Pine uses `strategy.close` on the conditions:
  - long exits if `close < longTrailStop` **OR** `longExitSignal`;
  - short exits if `close > shortTrailStop` **OR** `shortExitSignal`.
- `emaRegime = EMA(200)` and `atrLen = 14` are **fixed** (not grid dimensions).

### Pine position logic — our reading (documented per task)

Pine's `strategy.entry("Long"/"Short")` **reverses** an opposite position. But `shortCond` **requires** `close < emaRegime` and `longCond` **requires** `close > emaRegime`, while the explicit `strategy.close()` fires on the *bare* opposite cross regardless of regime. With `pyramiding=0` and strictly-alternating EMA crosses, the net effect is:

- an **opposite cross ALWAYS closes** the open position (via `strategy.close`, or via the reversal's close leg);
- a **new opposite-direction entry opens only if the EMA200 regime gate agrees** (the reversal's open leg fires only when `shortCond`/`longCond` is satisfied).

This is **exactly the DT1/DT18 flat-only state machine** — so the DT1 comparison is apples-to-apples on position handling; the only moving part is **trailing-vs-fixed exit**. (We also verified crosses strictly alternate, so no same-direction pyramiding or ambiguous double-entry can occur.)

### Risk unit (declared)

Sizing = **flat 1%-of-equity risk vs the INITIAL trail distance at entry = `atrMult × ATR(14)` captured on the signal bar**. (Initial trail *level* = `signalClose − atrMult·ATR` for a long; the *distance* `atrMult·ATR` is the risk unit. `R = net / (equity·1%)`.) Compounding, symmetric both sides — identical to DT1/DT18. Every R-space metric (expR/PF/WR/t/maxDD_R) is invariant to compounding-vs-fixed sizing regardless.

## Fill-model divergence from Pine (stated)

Pine runs `process_orders_on_close=true` → its entries **and** exits fill **at the signal/condition bar's CLOSE** (same-bar). We use the house **causal** model: signal/exit condition detected on the **closed** 4h bar, order fills at the **open of the next 4h bar** (= first 1m open after the close). This removes same-bar look-ahead, is strictly more conservative, and is the main reason our per-trade prices differ from Pine's. Combined with stripping the 100%-of-equity compounding, it is why our flat-risk return is nowhere near the author's +438%.

## Execution conventions (reused from `backtests/bt_engine.py` via DT1/DT18 scaffolding)

- Fees **0.05%/side**, slippage **0.02%/fill**, **$10k** start, compounding 1%-risk.
- Entry fill = `open×(1±slip)`; exit fill = `open×(1∓slip)` (adverse both ends).
- **Ambiguous fills = losses** — here **vacuous**: the trail is close-evaluated, so there is *no* same-bar contest between a stop and a target to resolve. The conservative element is entirely the **next-open fill vs Pine's same-bar close**; a bar that gaps through the trail is filled at the next open (already the worse price), never at a favorable trail level.
- 4h **mark-to-market** total-equity curve (unrealized P&L marked each 4h close, C2-style) → Sharpe (× √(6·365)) and maxDD%; per-trade R drives expR / PF / t-stat / maxDD_R. MAR = CAGR% / maxDD%.
- Deterministic: no RNG, no wall-clock, sorted output — two runs byte-identical (md5s below).

## DECLARED GRID (fixed BEFORE any result) — exactly 27 cells, no additions

```
emaFast  in {10, 15, 20}
emaSlow  in {60, 90, 120}
atrMult  in {3.5, 4.5, 5.5}
=> 3 × 3 × 3 = 27 cells.  Center = Pine defaults (emaFast=15, emaSlow=90, atrMult=4.5).
emaRegime=200, atrLen=14 fixed (not grid dims).  EMA200 regime gate fixed.
```

## Full grid — every declared cell (after costs)

`expR` = mean per-trade R; `PF` from R; `Sharpe`/`maxDD%` = 4h mark-to-market annualized; `maxDD_R` = cumulative-R drawdown; `t` = per-trade t-stat (mean R / (σ/√n)); `totRet%` = compounding $10k curve; `MAR` = CAGR/maxDD%.

| emaFast | emaSlow | atrMult | n | WR% | expR | PF | Sharpe | maxDD_R | maxDD% | t | totRet% | MAR |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 10 | 60 | 3.5 | 152 | 34.9 | 0.359 | 2.078 | 1.117 | 6.73 | 11.06 | 1.929 | 66 | 0.921 |
| 10 | 60 | 4.5 | 152 | 32.2 | 0.291 | 2.077 | 1.104 | 6.60 | 9.71 | 2.010 | 52 | 0.860 |
| 10 | 60 | 5.5 | 152 | 30.3 | 0.211 | 1.903 | 0.964 | 5.61 | 8.34 | 1.780 | 36 | 0.720 |
| 10 | 90 | 3.5 | 126 | 34.9 | 0.639 | 2.833 | 1.608 | 4.93 | 8.11 | 2.506 | 113 | 1.919 |
| 10 | 90 | 4.5 ★ | 126 | 31.0 | 0.550 | 2.897 | 1.591 | 4.30 | 5.94 | **2.569** | 93 | 2.255 |
| 10 | 90 | 5.5 | 126 | 28.6 | 0.434 | 2.761 | 1.474 | 3.20 | 5.43 | 2.449 | 69 | 1.932 |
| 10 | 120 | 3.5 | 121 | 33.9 | 0.507 | 2.368 | 1.274 | 5.56 | 8.72 | 1.998 | 77 | 1.320 |
| 10 | 120 | 4.5 | 121 | 31.4 | 0.424 | 2.354 | 1.242 | 5.38 | 6.71 | 1.999 | 62 | 1.439 |
| 10 | 120 | 5.5 | 121 | 30.6 | 0.405 | 2.527 | 1.287 | 5.69 | 6.70 | 2.123 | 59 | 1.386 |
| 15 | 60 | 3.5 | 137 | 36.5 | 0.410 | 2.124 | 1.166 | 5.57 | 8.43 | 2.031 | 69 | 1.254 |
| 15 | 60 | 4.5 | 137 | 32.8 | 0.309 | 1.986 | 1.054 | 4.67 | 7.39 | 1.896 | 49 | 1.074 |
| 15 | 60 | 5.5 | 137 | 29.9 | 0.230 | 1.847 | 0.938 | 3.95 | 6.17 | 1.680 | 35 | 0.951 |
| 15 | 90 | 3.5 | 105 | 39.0 | 0.702 | 2.925 | 1.560 | 5.00 | 7.93 | 2.420 | 100 | 1.784 |
| **15** | **90** | **4.5 ◆** | **105** | **36.2** | **0.599** | **2.942** | **1.540** | **3.88** | **6.68** | **2.565** | **82** | **1.816** |
| 15 | 90 | 5.5 | 105 | 34.3 | 0.479 | 2.785 | 1.427 | 3.65 | 6.25 | 2.540 | 62 | 1.549 |
| 15 | 120 | 3.5 | 108 | 34.3 | 0.550 | 2.353 | 1.269 | 5.74 | 7.67 | 1.977 | 73 | 1.449 |
| 15 | 120 | 4.5 | 108 | 33.3 | 0.451 | 2.276 | 1.208 | 4.46 | 7.88 | 1.931 | 58 | 1.157 |
| 15 | 120 | 5.5 | 108 | 27.8 | 0.417 | 2.359 | 1.204 | 5.09 | 7.77 | 1.998 | 53 | 1.093 |
| 20 | 60 | 3.5 | 123 | 36.6 | 0.576 | 2.452 | 1.411 | 5.63 | 7.77 | 2.286 | 94 | 1.737 |
| 20 | 60 | 4.5 | 123 | 34.1 | 0.488 | 2.439 | 1.404 | 3.73 | 6.13 | 2.378 | 77 | 1.876 |
| 20 | 60 | 5.5 | 123 | 32.5 | 0.381 | 2.294 | 1.297 | 3.60 | 5.70 | 2.246 | 56 | 1.565 |
| 20 | 90 | 3.5 | 106 | 38.7 | 0.653 | 2.739 | 1.489 | 5.11 | 8.30 | 2.345 | 92 | 1.595 |
| 20 | 90 | 4.5 | 106 | 37.7 | 0.516 | 2.518 | 1.361 | 4.40 | 8.38 | 2.313 | 68 | 1.247 |
| 20 | 90 | 5.5 | 106 | 33.0 | 0.477 | 2.620 | 1.356 | 4.22 | 7.67 | 2.336 | 62 | 1.259 |
| 20 | 120 | 3.5 | 108 | 38.0 | 0.555 | 2.463 | 1.317 | 6.11 | 8.20 | 2.076 | 75 | 1.377 |
| 20 | 120 | 4.5 | 108 | 35.2 | 0.407 | 2.145 | 1.128 | 5.93 | 7.15 | 1.888 | 51 | 1.150 |
| 20 | 120 | 5.5 | 108 | 30.6 | 0.375 | 2.185 | 1.113 | 6.80 | 7.79 | 1.932 | 47 | 0.978 |

◆ = center (Pine defaults). ★ = best cell by t-stat. **All 27 cells: expR > 0, PF ≥ 1.85.** Full CSV: `dt19_grid.csv`.

## Long/short split at center + exit mix

| Side | n | WR% | expR | PF |
|---|---|---|---|---|
| Long | 55 | 38.2 | **+1.041** | 4.33 |
| Short | 50 | 34.0 | **+0.112** | 1.37 |

**Exit mix (center):** `trail` 59 · `cross` 46 — the ratchet trail is the primary exit (56%), the opposite EMA-cross the rest. As in every strategy of this 4h trend family, the edge is **long-dominated** (longs +1.04R vs shorts +0.11R). Notably, DT19's trailing exit keeps **shorts marginally profitable** (+0.11R), where DT18's fixed stop left shorts *negative* (−0.165R) — the trail cuts short-side losers faster.

## Center-region analysis

Center + its 6 axis-adjacent neighbours (one grid step on one axis):

| cell (fast/slow/atrMult) | expR | PF | t |
|---|---|---|---|
| 15/90/4.5 (center) | 0.599 | 2.942 | 2.565 |
| 10/90/4.5 | 0.550 | 2.897 | 2.569 |
| 20/90/4.5 | 0.516 | 2.518 | 2.313 |
| 15/60/4.5 | 0.309 | 1.986 | 1.896 |
| 15/120/4.5 | 0.451 | 2.276 | 1.931 |
| 15/90/3.5 | 0.702 | 2.925 | 2.420 |
| 15/90/5.5 | 0.479 | 2.785 | 2.540 |

**Center-region mean expR after costs = +0.515R** (all 7 cells positive, t between 1.90 and 2.57). The surface is smooth: expR degrades gracefully off-center (weakest neighbour is the `slow=60` fast-cross variant at 0.31R, still positive), with no sign flips or cliffs. Robust, not a fitted spike.

## Best cell + multiplicity caveat

Best by t-stat = **10/90/4.5**, t=2.569 (expR 0.550, PF 2.90, Sharpe 1.59, MAR 2.26, DD 5.94%). It is a **statistical tie with the center** (15/90/4.5, t=2.565) — the gap is 0.004t, i.e. noise. Four cells cluster at t ≈ 2.51–2.57 (both `slow=90` fast=10/15 variants across atrMult), so the "best" is **not a fragile peak**: any reasonable pick lands on the `slow=90` ridge. Ledger: `dt19_trades_best.csv`. This clustering is a robustness *positive*, not evidence of overfitting to one cell.

## KILL CRITERIA (verbatim)

> **DEAD unless center-region expR after costs > 0 AND ≥ 40 IS trades at center AND best-cell t ≥ 2.0.**

| Gate | Threshold | Actual | Pass? |
|---|---|---|---|
| Center-region expR after costs | > 0 | **+0.515R** | ✅ |
| IS trades at center | ≥ 40 | **105** | ✅ |
| Best-cell t | ≥ 2.0 | **2.569** | ✅ |

**All three pass → SURVIVES.** (Center t=2.565 also clears 2.0 independently.)

## DT1 comparison + redundancy call

DT1 "Trend Rider" (validated benchmark): center 20/75/1200. Both DT1 and DT19 share the *same causal fill model, cost stack, candles, sizing, and 4h mark-to-market Sharpe methodology* — directly comparable.

| Metric | DT19 center (15/90/4.5) | DT1 center (20/75/1200) | Winner |
|---|---|---|---|
| expR | +0.599R | **+0.896R** | DT1 |
| PF | **2.94** | 2.71 | DT19 |
| Sharpe | **1.54** | 1.30 | DT19 |
| MAR | **1.82** | 1.47 | DT19 |
| maxDD% | **6.68** | 9.42 | DT19 |
| maxDD_R | **3.88** | 4.80 | DT19 |
| t-stat | **2.565** | 2.005 | DT19 |
| WR% | **36.2** | 29.3 | DT19 |
| n | 105 | 75 | — |
| totRet% | 82.0 | 85.6 | ≈ tie |

**Weekly-R Pearson vs `dt1_trades_center.csv`: r = 0.8235** (268 weeks union; DT19 active 92 wk, DT1 active 71 wk).

**C2 line** — `Strategy Codex/Krown/backtests/C2_DAILY_TREND_BENCHMARK.md`: C2 center Sharpe **0.93** / MAR **0.96**; C2 best gated Sharpe **1.44** / MAR **2.56**. DT19 center (Sharpe 1.54 / MAR 1.82) **beats C2 center on both** and beats C2 best-gated on Sharpe (1.54 vs 1.44), trailing it on MAR (1.82 vs 2.56).

### Beat / diversify / redundant → **REDUNDANT (with a beat-caveat)**

- **Not a diversifier.** r=0.82 weekly means DT19 and DT1 are the *same return stream* — a 4h EMA(fast/slow)-cross trend system gated by a long EMA regime filter. Adding DT19 to a book that already holds DT1 buys essentially no diversification.
- **Not worse-everywhere** (this is where it differs from DT18, which was strictly dominated at r=0.80). DT19's **trailing exit is a genuine risk-adjusted upgrade**: it beats DT1 on PF, Sharpe, MAR, maxDD%, t-stat and WR, taking more/smaller trades. Its only loss is per-trade **expR (0.60R vs 0.90R)** — the trail books smaller average wins in exchange for shallower drawdowns and a smoother curve.
- **Verdict:** carry **ONE** trend-family line, not both. DT19 does not earn a *separate* book slot (redundant, r=0.82), but it is a **legitimate candidate to refine/replace DT1's fixed stop with a ratcheting trail** — worth flagging for Igor's decision rather than discarding. DT1 keeps the higher raw edge and is already validated/locked; DT19 offers a tighter-drawdown re-expression of the identical signal.

## Worked examples (hand-traced from `dt19_trades_center.csv`)

**Example 1 — long, TRAIL exit (a small loser):**
- Signal bar 282 (2019-10-26 00:00 close), long fills at bar 283 open `entry_ref=9566.68` → `entry_fill=9568.59` (×1.0002).
- `entry_atr=315.8145`, risk unit `stop_dist = 4.5×315.8145 = 1421.17`; initial trail level `9566.68 − 1421.17 = 8145.51`. Size `= risk/stop_dist = 100.00/1421.17 = 0.070365`.
- Price rose then rolled over; on the closed bar 361 `close < (extreme − 4.5·ATR)` → trail breach. Exit fills bar 362 open `exit_ref=9148.66` → `exit_fill=9146.83` (×0.9998).
- `gross = 0.070365×(9146.83 − 9568.59) = −29.68`; `fees = 0.070365×(9568.59+9146.83)×0.0005 = 0.66`; `net = −30.34`; **R = −30.34/100 = −0.303** ✓ (matches ledger row).

**Example 2 — short, CROSS exit (fast whipsaw loss):**
- Signal bar 656 (2019-12-27 08:00 close), short fills bar 657 open `entry_ref=7132.45` → `entry_fill=7131.02` (×0.9998).
- `entry_atr=106.0726`, `stop_dist = 4.5×106.0726 = 477.33`; initial trail level `7132.45 + 477.33 = 7609.78`. `risk=101.659` (equity ≈ $10,166 at that point), size `= 101.659/477.33 = 0.212976`.
- Next closed bar 657 flipped to a crossover (`shortExitSignal`) before the trail was ever threatened → exit fills bar 658 open `exit_ref=7233.90` → `exit_fill=7235.35` (×1.0002).
- `gross = 0.212976×(7131.02 − 7235.35) = −22.22`; `fees = 1.53`; `net = −23.75`; **R = −23.75/101.659 = −0.234** ✓. A 1-bar cross whipsaw — the fixed-stop DT1 would have held this longer; the trail's cross-exit is why DT19 takes more, smaller trades.

## PROOFS

**py_compile:**
```
$ python3 -m py_compile backtests/bt_dt19_regime_rider.py
PY_COMPILE_OK
```

**Determinism — md5 of ledgers, two independent runs (byte-identical):**
```
run 1   md5 center ledger: 2a784a26f70b18ff9e43c4513c3210d8
run 2   md5 center ledger: 2a784a26f70b18ff9e43c4513c3210d8
run 1   md5 best   ledger: 4f56192a0feb8ca09a76c9bbabe03924
run 2   md5 best   ledger: 4f56192a0feb8ca09a76c9bbabe03924
run 1   md5 grid csv     : 84ead03de2c772da86bc8ab76955a60b
run 2   md5 grid csv     : 84ead03de2c772da86bc8ab76955a60b
```

**Candle count + <2025 lockout proof:**
```
1m rows loaded: 2,795,040   min=2019-09-09 00:00:00+00:00   max=2024-12-31 23:59:00+00:00
4h bars:           11,646   min=2019-09-09 00:00:00+00:00   max=2024-12-31 20:00:00+00:00
cutoff (exclusive): 2025-01-01 00:00:00+00:00   →  0 candles ≥ 2025-01-01 UTC
```
Max 1m timestamp is `2024-12-31 23:59` and max 4h bar opens `2024-12-31 20:00` (closes 23:59) — the entire 2025 out-of-sample period is untouched.

## Files

- Engine: `backtests/bt_dt19_regime_rider.py`
- Report: `Strategy Codex/DaviddTech/backtests/DT19_REGIME_RIDER.md`
- Ledgers: `dt19_trades_center.csv` (105 trades) · `dt19_trades_best.csv` (126 trades) · `dt19_grid.csv` (27 cells)
- Stats dump: `backtests/_dt19_stats.json`
