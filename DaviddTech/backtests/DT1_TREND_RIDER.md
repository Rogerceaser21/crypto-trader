✅ SURVIVES — center (20/75/1200) expR +0.90R after costs, n=75, t=2.00; best-cell t=2.29; and the edge is surface-wide (48/48 grid cells expR>0, 22/48 t≥2.0) — not a selection artifact.

# DT1 "Trend Rider" — causal backtest of DaviddTech "C23-4h tunable"

BTCUSDT **Binance Perpetual**, signals on **closed 4h bars**, fills at the **next 1m open**. IS window **2019-09-09 → 2024-12-31** (11,646 4h bars from 2,795,040 pre-2025 1m candles), minus a `macroLen`-bar warmup per cell. 2025+ locked out (loaded 0 candles ≥ 2025-01-01 UTC). Engine `backtests/bt_dt1_trend_rider.py`. Source of truth `Strategy Codex/DaviddTech/research/pine/C23_4h_tunable.pine` (Pine v5). The author's PF 3.39 / +22% / 56 trades claim is selection-only context — **not** evidence and **not** a target.

## Spec derived from the Pine (frozen)

- `longSig = ta.crossover(EMA(fast), EMA(slow))`, `shortSig = ta.crossunder(EMA(fast), EMA(slow))` on a **closed** 4h bar (Pine semantics: strict compare now, `≤/≥` on the prior bar).
- Macro gate: longs only when `close > EMA(macroLen)`; shorts only when `close < EMA(macroLen)`.
- **An opposite cross always closes the current position**, even when the macro gate blocks a new entry in the opposite direction (Pine's unconditional `strategy.close("L")`/`strategy.close("S")`). Crossovers strictly alternate long/short, so the position state machine is unambiguous.
- Hard stop: **3.0 × ATR(6)** (Wilder/RMA — Pine `ta.atr`) **fixed from entry price** (the frozen SPEC pins the stop at entry; Pine's per-bar re-evaluated `position_avg_price − atr·mult` moving stop is **not** used).
- Signals on closed 4h bars only; **entry/cross fills = the 4h `open` of bar i+1** (= the first 1m open after the 4h close — causal, no look-ahead). Stops are detected **intrabar on 1m** lows/highs.
- Sizing: **1%-of-equity risk per trade** against the stop distance, compounding (Pine's 0.3%-risk / 25%-notional caps ignored by task instruction — signal test, standardized).

## Execution conventions (reused from `backtests/bt_engine.py`)

- Fees **0.05%/side**, slippage **0.02%/fill**, **$10k** start, compounding 1%-risk.
- Entry fill = `open×(1±slip)`. Intrabar stop fills **at the stop level** with adverse slippage.
- **Ambiguous intrabar fills = losses**: a cross-exit bar that gaps *through* the stop is filled at its (worse, loss-side) open rather than granted a favorable stop-level fill. There is no take-profit, so the only same-bar contest is stop-vs-cross, resolved loss-conservative.
- 4h **mark-to-market** total-equity curve (unrealized P&L marked each 4h close, C2-style) → Sharpe (× √(6·365)) and maxDD%; per-trade R drives expR / PF / t-stat / maxDD_R.
- Deterministic: no RNG, no wall-clock, sorted output — two runs byte-identical (md5s below).

## DECLARED GRID (fixed BEFORE any result) — all 48 cells run, no additions

```
fast     in {10, 20, 30, 40}
slow     in {50, 75, 90, 110}
macroLen in {800, 1200, 1800}
=> 4 × 4 × 3 = 48 cells.  Center = Pine defaults (fast=20, slow=75, macroLen=1200).
atrLen=6, atrMult=3.0 fixed (not grid dims).
```

## Full grid — every declared cell (after costs)

`expR` = mean per-trade R; `PF` from R; `Sharpe`/`maxDD%` = 4h mark-to-market annualized; `maxDD_R` = cumulative-R drawdown; `t` = per-trade t-stat (mean R / (σ/√n)); `totRet%` = compounding $10k curve.

| fast | slow | macro | n | WR% | expR | PF | Sharpe | maxDD_R | maxDD% | t | totRet% |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 10 | 50 | 800 | 146 | 26.7 | 0.390 | 1.895 | 1.082 | 8.36 | 14.23 | 1.812 | 68.5 |
| 10 | 50 | 1200 | 145 | 26.2 | 0.342 | 1.797 | 1.004 | 8.36 | 14.23 | 1.618 | 57.0 |
| 10 | 50 | 1800 | 134 | 26.9 | 0.413 | 2.001 | 1.187 | 8.82 | 15.06 | 1.817 | 66.4 |
| 10 | 75 | 800 | 102 | 23.5 | 0.654 | 2.397 | 1.246 | 8.38 | 10.69 | 1.834 | 83.2 |
| 10 | 75 | 1200 | 104 | 23.1 | 0.615 | 2.321 | 1.219 | 7.22 | 10.70 | 1.764 | 78.3 |
| 10 | 75 | 1800 | 96 | 24.0 | 0.685 | 2.472 | 1.313 | 9.79 | 12.99 | 1.825 | 81.7 |
| 10 | 90 | 800 | 89 | 27.0 | 0.905 | 2.868 | 1.412 | 7.86 | 10.05 | 2.104 | 108.8 |
| 10 | 90 | 1200 | 88 | 27.3 | 0.911 | 2.929 | 1.435 | 5.79 | 9.17 | 2.101 | 108.1 |
| 10 | 90 | 1800 | 83 | 26.5 | 0.958 | 2.951 | **1.478** | 9.12 | 11.48 | 2.088 | 106.7 |
| 10 | 110 | 800 | 74 | 27.0 | 1.063 | 3.282 | 1.421 | 6.16 | 10.46 | 2.158 | 106.0 |
| 10 | 110 | 1200 | 78 | 26.9 | 0.999 | 3.133 | 1.421 | 5.53 | 10.46 | 2.131 | 104.5 |
| 10 | 110 | 1800 | 73 | 27.4 | 1.059 | 3.118 | 1.462 | 7.51 | 12.46 | 2.117 | 103.3 |
| 20 | 50 | 800 | 101 | 26.7 | 0.641 | 2.228 | 1.184 | 8.23 | 12.00 | 1.818 | 80.1 |
| 20 | 50 | 1200 | 100 | 25.0 | 0.554 | 2.044 | 1.071 | 7.76 | 12.00 | 1.583 | 64.4 |
| 20 | 50 | 1800 | 94 | 25.5 | 0.606 | 2.160 | 1.149 | 10.95 | 14.55 | 1.641 | 67.2 |
| 20 | 75 | 800 | 72 | 30.6 | 0.989 | 2.932 | 1.358 | 5.50 | 9.42 | 2.125 | 93.1 |
| **20** | **75** | **1200** | **75** | **29.3** | **0.896** | **2.712** | **1.303** | **4.80** | **9.42** | **2.005** | **85.6** |
| 20 | 75 | 1800 | 72 | 29.2 | 0.917 | 2.682 | 1.324 | 8.89 | 11.64 | 1.972 | 83.5 |
| 20 | 90 | 800 | 66 | 30.3 | 1.174 | 3.155 | 1.388 | 5.78 | 11.12 | 2.174 | 104.1 |
| 20 | 90 | 1200 | 69 | 29.0 | 1.042 | 2.907 | 1.320 | 5.04 | 10.45 | 2.016 | 93.1 |
| 20 | 90 | 1800 | 65 | 29.2 | 1.106 | 3.027 | 1.382 | 5.37 | 10.30 | 2.025 | 93.2 |
| 20 | 110 | 800 | 61 | 29.5 | 1.014 | 2.742 | 1.142 | 7.71 | 11.52 | 1.842 | 75.9 |
| 20 | 110 | 1200 | 62 | 30.6 | 1.011 | 2.791 | 1.172 | 7.71 | 11.24 | 1.867 | 77.4 |
| 20 | 110 | 1800 | 59 | 30.5 | 1.028 | 2.733 | 1.172 | 10.06 | 15.89 | 1.809 | 73.8 |
| 30 | 50 | 800 | 79 | 29.1 | 0.788 | 2.421 | 1.190 | 7.05 | 9.29 | 1.814 | 76.4 |
| 30 | 50 | 1200 | 81 | 28.4 | 0.754 | 2.389 | 1.187 | 7.03 | 9.29 | 1.780 | 74.3 |
| 30 | 50 | 1800 | 79 | 27.8 | 0.745 | 2.340 | 1.179 | 12.07 | 13.81 | 1.721 | 70.6 |
| 30 | 75 | 800 | 57 | 35.1 | 1.288 | 3.322 | 1.383 | 4.52 | 8.61 | 2.197 | 97.2 |
| 30 | 75 | 1200 | 59 | 33.9 | 1.242 | 3.291 | 1.400 | 4.52 | 8.61 | 2.190 | 97.0 |
| 30 | 75 | 1800 | 56 | 32.1 | 1.294 | 3.364 | 1.440 | 5.90 | 8.61 | 2.174 | 95.5 |
| 30 | 90 | 800 | 51 | 37.3 | 1.483 | 3.638 | 1.394 | 5.90 | **8.43** | 2.206 | 101.1 |
| 30 | 90 | 1200 | 54 | 35.2 | 1.354 | 3.345 | 1.365 | 5.90 | 9.38 | 2.120 | 96.1 |
| 30 | 90 | 1800 | 52 | 34.6 | 1.365 | 3.301 | 1.388 | 7.97 | 9.83 | 2.061 | 92.0 |
| 30 | 110 | 800 | 55 | 27.3 | 1.716 | 3.869 | 1.250 | 7.59 | 16.67 | 1.500 | 119.9 |
| 30 | 110 | 1200 | 55 | 25.5 | 1.697 | 3.763 | 1.257 | 7.76 | 16.67 | 1.483 | 117.7 |
| 30 | 110 | 1800 | 54 | 24.1 | 1.688 | 3.696 | 1.270 | 9.09 | 17.70 | 1.448 | 113.0 |
| 40 | 50 | 800 | 65 | 33.8 | 1.144 | 3.041 | 1.384 | 6.12 | 10.83 | 2.111 | 98.2 |
| 40 | 50 | 1200 | 67 | 31.3 | 1.039 | 2.799 | 1.321 | 5.94 | 10.67 | 1.969 | 88.9 |
| 40 | 50 | 1800 | 66 | 31.8 | 1.086 | 2.904 | 1.400 | 5.94 | 10.67 | 2.033 | 92.9 |
| 40 | 75 | 800 | 48 | 41.7 | 1.510 | 3.783 | 1.363 | 5.41 | 9.08 | **2.288** | 96.3 | ← best t |
| 40 | 75 | 1200 | 51 | 39.2 | 1.372 | 3.450 | 1.333 | 5.41 | 10.02 | 2.193 | 91.4 |
| 40 | 75 | 1800 | 49 | 36.7 | 1.375 | 3.309 | 1.320 | 7.49 | 9.66 | 2.110 | 86.5 |
| 40 | 90 | 800 | 55 | 30.9 | 1.647 | 3.828 | 1.230 | 7.40 | 16.91 | 1.477 | 113.7 |
| 40 | 90 | 1200 | 56 | 28.6 | 1.589 | 3.664 | 1.227 | 7.40 | 16.91 | 1.450 | 110.3 |
| 40 | 90 | 1800 | 54 | 25.9 | 1.579 | 3.472 | 1.214 | 9.79 | 19.27 | 1.388 | 102.7 |
| 40 | 110 | 800 | 45 | 33.3 | **2.410** | **4.976** | 1.366 | 7.10 | 16.55 | 1.528 | 144.5 | ← best expR/PF |
| 40 | 110 | 1200 | 46 | 32.6 | 2.336 | 4.801 | 1.380 | 7.52 | 16.55 | 1.513 | 142.1 |
| 40 | 110 | 1800 | 45 | 31.1 | 2.319 | 4.554 | 1.383 | 9.59 | 16.55 | 1.468 | 134.8 |

**Surface summary: 48/48 cells expR > 0. 48/48 cells n ≥ 40 (min n = 45). 22/48 cells t ≥ 2.0.** Full CSV: `dt1_grid.csv`.

## Center-region analysis (default cell + axis-adjacent neighbors)

| cell (fast/slow/macro) | n | WR% | expR | PF | Sharpe | t | maxDD% |
|---|---|---|---|---|---|---|---|
| **20/75/1200 (center)** | **75** | **29.3** | **0.896** | **2.712** | **1.303** | **2.005** | **9.42** |
| 10/75/1200 | 104 | 23.1 | 0.615 | 2.321 | 1.219 | 1.764 | 10.70 |
| 30/75/1200 | 59 | 33.9 | 1.242 | 3.291 | 1.400 | 2.190 | 8.61 |
| 20/50/1200 | 100 | 25.0 | 0.554 | 2.044 | 1.071 | 1.583 | 12.00 |
| 20/90/1200 | 69 | 29.0 | 1.042 | 2.907 | 1.320 | 2.016 | 10.45 |
| 20/75/800 | 72 | 30.6 | 0.989 | 2.932 | 1.358 | 2.125 | 9.42 |
| 20/75/1800 | 72 | 29.2 | 0.917 | 2.682 | 1.324 | 1.972 | 11.64 |

**Region mean expR = +0.894R; all 7 cells positive (min +0.554R); mean t = 1.95; mean n = 79.** The surface is smooth and monotone: raising `fast` or `slow` (fewer, larger, higher-conviction trends) lifts expR/PF but thins n and softens t; `macroLen` is the least sensitive axis (±one step barely moves expR). No cliff, no lone spike — the center sits on a broad positive plateau.

## Best cell & multiplicity caveat

- **Best by t-stat: 40/75/800** — n=48, expR **+1.51R**, PF 3.78, Sharpe 1.36, **t = 2.288**, maxDD 9.1%, MAR 1.61.
- Best by Sharpe: 10/90/1800 — Sharpe 1.478, t 2.09. Best by expR/PF: 40/110/800 — expR 2.41R, PF 4.98 (but t only 1.53 — 45 fat-tailed trades).
- **Multiplicity:** with 48 cells searched, the single best-cell t of 2.29 is only *mild* standalone evidence (selection inflates the max). The survival case does **not** rest on it. It rests on the **ensemble**: 48/48 cells expR>0 and 22/48 with t≥2.0 — a result unreachable by cherry-picking noise (a null edge would scatter signs, not paint the entire surface green). The center cell independently clears t=2.00 at n=75.

## KILL CRITERIA (verbatim)

> DEAD unless center-region expectancy after costs > 0 AND ≥40 IS trades at center AND best-cell t ≥ 2.0.

| criterion | required | actual | pass |
|---|---|---|---|
| center-region expectancy after costs | > 0 | +0.894R (all 7 cells >0; center +0.896R) | ✅ |
| IS trades at center | ≥ 40 | 75 | ✅ |
| best-cell t | ≥ 2.0 | 2.288 | ✅ |

**All three met → SURVIVES.**

## Comparison vs the C2 daily-trend benchmark

`Strategy Codex/Krown/backtests/C2_DAILY_TREND_BENCHMARK.md` — C2 center Sharpe **0.93** / MAR **0.96**; C2 best gated Sharpe **1.44** / MAR **2.56**. Both C2 and DT1 use the same causal fill model, cost stack, candles, and 4h/daily mark-to-market Sharpe methodology (× √bars-per-year), so the numbers are directly comparable.

| | Sharpe | MAR | expR | PF | t | maxDD% |
|---|---|---|---|---|---|---|
| DT1 center (20/75/1200) | 1.30 | 1.47 | 0.90 | 2.71 | 2.00 | 9.4 |
| DT1 best-t (40/75/800) | 1.36 | 1.61 | 1.51 | 3.78 | 2.29 | 9.1 |
| DT1 best-Sharpe (10/90/1800) | 1.48 | 1.53 | 0.96 | 2.95 | 2.09 | 11.5 |
| DT1 best-MAR in grid (30/90/800) | 1.39 | 1.80 | 1.48 | 3.64 | 2.21 | 8.4 |
| C2 center | 0.93 | 0.96 | — | — | — | — |
| C2 best gated | 1.44 | 2.56 | — | — | — | — |

**Verdict: BETTER than C2's center, competitive-but-below C2's hand-picked best, and NOT redundant.** DT1's *center* already beats C2's *center* on both Sharpe (1.30 vs 0.93) and MAR (1.47 vs 0.96). DT1's best cells reach Sharpe ~1.48 / MAR ~1.80 — Sharpe-parity with C2's best gated cell (1.44) but below its MAR (2.56, achieved via a MA200 long-only gate on daily). Crucially, DT1 delivers this **across its entire 48-cell surface**, whereas C2's headline came from one selected gated configuration — DT1 is the more robust of the two. It is a genuinely different animal (4h EMA-cross reversal system vs daily TSMOM/Donchian breakout), so it is **complementary, not redundant** — a faster-timeframe trend cousin worth carrying alongside C2 rather than in place of it.

## Worked examples (real candles, hand-traced from `dt1_trades_center.csv`)

### Example 1 — long, exited by opposite cross (the fat right tail)

- **Signal bar** closes 2024-01-28 12:00 UTC: `EMA(20)` crosses above `EMA(75)` with `close > EMA(1200)` (bull gate open) → long.
- **Fill** = 4h open of the next bar, **2024-01-28 16:00 UTC** open = **42,244.50**; entry fill (×1.0002) = **42,252.95**.
- ATR(6) at signal = 416.52 → stop_dist = 3×416.52 = **1,249.56** → hard stop = 42,244.50 − 1,249.56 = **40,994.94**. Size = risk 147.52 / 1,249.56 = **0.11806 BTC**.
- Stop never touched on 1m. `EMA(20)` crosses back under `EMA(75)` on the bar closing 2024-03-19 04:00 → **cross exit at 2024-03-19 08:00 open = 64,742.10**; exit fill (×0.9998) = **64,729.15**.
- Gross = 0.11806 × (64,729.15 − 42,252.95) = **+2,653.46**; fees **6.32**; **net +2,647.15 = +17.94R** (held 304 4h bars ≈ 50.7 days — the Jan→Mar 2024 rally).

### Example 2 — long, stopped out (a capped loss)

- **Signal bar** closes 2020-06-23 00:00 UTC: `EMA(20)` crosses above `EMA(75)`, bull gate open → long.
- **Fill** = **2020-06-23 04:00 UTC** open = **9,661.57**; entry fill (×1.0002) = **9,663.50**.
- ATR(6) = 114.76 → stop_dist = **344.29** → hard stop = 9,661.57 − 344.29 = **9,317.28**. Size = 96.97 / 344.29 = **0.28166 BTC**.
- A 1m bar within the 4h bar ending 2020-06-24 08:00 prints low ≤ 9,317.28 → **stop fills at 9,317.28** (×0.9998 adverse) = **9,315.41** (exit bar 2020-06-24 08:00).
- Gross = 0.28166 × (9,315.41 − 9,663.50) = **−98.04**; fees **2.67**; **net −100.71 = −1.04R** (loss slightly beyond −1R = the fee+slippage drag on a stop). Held ~28h.

Both examples reconcile to the cent against the ledger.

## PROOFS

**py_compile** (clean):
```
$ python3 -m py_compile backtests/bt_dt1_trend_rider.py  →  exit 0 (OK)
```

**Determinism — two independent runs, md5 of each output byte-identical:**
```
                 run 1                             run 2
center ledger  4b4bda59a3a9ccd615f4e158c9a98870   4b4bda59a3a9ccd615f4e158c9a98870   IDENTICAL
best   ledger  257320dfc892137a5977c9f7e2405639   257320dfc892137a5977c9f7e2405639   IDENTICAL
grid   csv     d176df2cb6a2dd7fa8733c591dd05ef3   d176df2cb6a2dd7fa8733c591dd05ef3   IDENTICAL
```

**Candle load + 2025 lockout (parquet load, cross-checked against Jesse postgres):**
```
engine load:   1m rows = 2,795,040   min = 2019-09-09 00:00:00 UTC   max = 2024-12-31 23:59:00 UTC
               4h bars = 11,646       min = 2019-09-09 00:00:00 UTC   max = 2024-12-31 20:00:00 UTC
               cutoff (exclusive) = 2025-01-01 00:00:00 UTC   (0 candles ≥ cutoff loaded)
postgres XCHK: SELECT count(*),min,max FROM candle WHERE symbol='BTC-USDT' AND timeframe='1m'
               AND timestamp < 1735689600000  →  2795040 | 2019-09-09 00:00:00 | 2024-12-31 23:59:00
```
Row count and min/max match exactly between the parquet the engine used and Jesse's postgres — the 2025-26 out-of-sample window was never touched.

## Files

- Engine: `backtests/bt_dt1_trend_rider.py`
- Grid (48 cells): `Strategy Codex/DaviddTech/backtests/dt1_grid.csv`
- Center ledger (75 trades): `Strategy Codex/DaviddTech/backtests/dt1_trades_center.csv`
- Best-cell ledger (48 trades): `Strategy Codex/DaviddTech/backtests/dt1_trades_best.csv`
