✅ SURVIVES kill-criteria (center 8/100/2.5 expR +0.497R after costs, n=206, t=1.90; best-cell 13/100/2.0 t=2.35; 27/27 grid cells expR>0) — but **REDUNDANT vs DT1**: weekly-R Pearson **r=0.80**, strictly worse than DT1 on expR / PF / Sharpe / MAR / t, and the entire edge is long-side (shorts −0.165R). Keep DT1; do not carry Fugu as a separate line.

# DT18 "Fugu Profit Sprint" — causal backtest of DaviddTech "Fugu Profit Sprint BTC 4H SideRisk v6"

BTCUSDT **Binance Perpetual**, signals on **closed 4h bars**, fills at the **next 1m open**. IS window **2019-09-09 → 2024-12-31** (11,646 4h bars from 2,795,040 pre-2025 1m candles), minus a `max(slowLen, trendLen)`-bar warmup per cell (≈ 5.27 yr of live curve at center). 2025+ locked out (loaded 0 candles ≥ 2025-01-01 UTC). Engine `backtests/bt_dt18_fugu.py`. Source of truth `Strategy Codex/DaviddTech/research/pine/Fugu_Profit_Sprint_BTC_4H_SideRisk_v6.pine` (Pine v5, 64 lines).

**Author claim is SELECTION-ONLY context — not evidence and not a target:** PF 2.17, +495%, DD 19.7%, 241 trades, 6.2 yr. The author's own header comments admit the v3→v6 headline came from **risk-scaling along the same equity curve, not new edge** — long risk 1.85% vs short 0.35%, fitted to keep max DD strictly < 20% ("FRONTIER WARNING: max DD ~19.74% leaves almost no buffer"). We **strip the sizing games** and test the raw signal at a **flat, symmetric 1%-equity risk both sides**. The result below shows exactly what that asymmetric risk was hiding: **shorts lose money**, so down-weighting them to 0.35% is curve-cosmetics, not alpha.

## Spec derived from the Pine (frozen)

- `fast = EMA(fastLen)`, `slow = EMA(slowLen)`, `trend = EMA(trendLen=100)`.
- `goLong  = ta.crossover(fast, slow) AND close > EMA(100)`; `goShort = ta.crossunder(fast, slow) AND close < EMA(100)` — on a **closed** 4h bar (Pine semantics: strict compare now, `≤/≥` on the prior bar).
- `exitLong = ta.crossunder(fast, slow)` and `exitShort = ta.crossover(fast, slow)` fire **unconditionally** (no trend gate). Structurally this is identical to DT1: **an opposite cross always closes the position**, and a *new* opposite-direction entry is admitted only if the trend gate agrees. Crosses strictly alternate, so the state machine is unambiguous.
- Hard stop: **atrStop × ATR(10)** (Wilder/RMA — Pine `ta.atr`) **frozen at entry**. Pine re-issues `strategy.exit` every bar off `position_avg_price − atrStop·entryAtr`, but with `entryAtr` captured on the entry bar and `position_avg_price` constant while open, the stop **level never moves** — a static hard stop, which is what we simulate. We freeze `entryAtr = ATR(10)` at the **signal bar** and pin the stop off our entry reference.
- Flat only (`position_size ≤ 0` to go long, `≥ 0` to go short).
- Sizing: **flat 1%-of-equity risk, symmetric both sides**. Pine's side-specific 1.85%/0.35% risk and 1.6× notional cap are **discarded** — pure signal test. Compounding, matching DT1's sizing model so the DT1 comparison is apples-to-apples. (Every R-space metric — expR/PF/WR/t/maxDD_R — is invariant to compounding vs fixed sizing regardless.)
- `trendLen=100`, `atrLen=10` are **fixed** (not grid dimensions).

## Fill-model divergence from Pine (stated)

Pine runs `process_orders_on_close=true` → its fills landed **at the signal-bar close** (same-bar). We instead use the house **causal** model: signal on the **closed** 4h bar, entry/cross-exit at the **open of the next 4h bar** (= first 1m open after the close). This removes same-bar look-ahead and is strictly more conservative; it is the main reason our per-trade prices differ from Pine's, and part of why our un-leveraged flat-risk return is nowhere near the author's +495% (the rest is the stripped 1.85× long-risk leverage).

## Execution conventions (reused from `backtests/bt_engine.py` via DT1 scaffolding)

- Fees **0.05%/side**, slippage **0.02%/fill**, **$10k** start, compounding 1%-risk.
- Entry fill = `open×(1±slip)`. Intrabar stop fills **at the stop level** with adverse slippage, detected on 1m lows/highs.
- **Ambiguous intrabar fills = losses**: a cross-exit bar that gaps *through* the stop is filled at its worse loss-side open, never granted a favorable stop-level fill. No take-profit exists, so the only same-bar contest is stop-vs-cross, resolved loss-conservative.
- 4h **mark-to-market** total-equity curve (unrealized P&L marked each 4h close, C2-style) → Sharpe (× √(6·365)) and maxDD%; per-trade R drives expR / PF / t-stat / maxDD_R. MAR = CAGR% / maxDD%.
- Deterministic: no RNG, no wall-clock, sorted output — two runs byte-identical (md5s below).

## DECLARED GRID (fixed BEFORE any result) — exactly 27 cells, no additions

```
fastLen  in {5, 8, 13}
slowLen  in {75, 100, 125}
atrStop  in {2.0, 2.5, 3.0}
=> 3 × 3 × 3 = 27 cells.  Center = Pine defaults (fast=8, slow=100, atrStop=2.5).
trendLen=100, atrLen=10 fixed (not grid dims).
```

## Full grid — every declared cell (after costs)

`expR` = mean per-trade R; `PF` from R; `Sharpe`/`maxDD%` = 4h mark-to-market annualized; `maxDD_R` = cumulative-R drawdown; `t` = per-trade t-stat (mean R / (σ/√n)); `totRet%` = compounding $10k curve; `MAR` = CAGR/maxDD%.

| fast | slow | atrStop | n | WR% | expR | PF | Sharpe | maxDD_R | maxDD% | t | totRet% | MAR |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 5 | 75 | 2.0 | 279 | 24.4 | 0.461 | 1.812 | 1.230 | 12.5 | 20.29 | 2.052 | 204 | 1.155 |
| 5 | 75 | 2.5 | 279 | 25.8 | 0.397 | 1.867 | 1.296 | 10.2 | 17.55 | 2.196 | 169 | 1.178 |
| 5 | 75 | 3.0 | 279 | 25.8 | 0.324 | 1.835 | 1.259 | 9.2 | 14.92 | 2.149 | 127 | 1.131 |
| 5 | 100 | 2.0 | 244 | 22.1 | 0.438 | 1.764 | 1.019 | 16.2 | 17.63 | 1.774 | 148 | 1.065 |
| 5 | 100 | 2.5 | 244 | 22.5 | 0.418 | 1.855 | 1.142 | 10.3 | 15.61 | 1.896 | 143 | 1.177 |
| 5 | 100 | 3.0 | 244 | 23.8 | 0.379 | 1.943 | 1.227 | 8.5 | 13.08 | 2.055 | 130 | 1.307 |
| 5 | 125 | 2.0 | 198 | 24.2 | 0.652 | 2.103 | 1.228 | 25.5 | 25.53 | 2.109 | 207 | 0.931 |
| 5 | 125 | 2.5 | 198 | 25.3 | 0.600 | 2.195 | 1.334 | 15.1 | 16.47 | 2.227 | 188 | 1.351 |
| 5 | 125 | 3.0 | 198 | 25.8 | 0.505 | 2.184 | 1.333 | 10.5 | 13.69 | 2.242 | 147 | 1.373 |
| 8 | 75 | 2.0 | 235 | 23.4 | 0.522 | 1.852 | 1.134 | 15.9 | 21.47 | 1.852 | 181 | 1.007 |
| 8 | 75 | 2.5 | 235 | 24.7 | 0.414 | 1.795 | 1.101 | 16.4 | 21.07 | 1.826 | 133 | 0.825 |
| 8 | 75 | 3.0 | 235 | 25.5 | 0.350 | 1.789 | 1.099 | 12.6 | 16.91 | 1.843 | 108 | 0.879 |
| 8 | 100 | 2.0 | 206 | 21.4 | 0.542 | 1.840 | 1.061 | 20.1 | 21.53 | 1.809 | 158 | 0.913 |
| **8** | **100** | **2.5** | **206** | **22.3** | **0.497** | **1.893** | **1.142** | **10.4** | **13.49** | **1.903** | **144** | **1.367** |
| 8 | 100 | 3.0 | 206 | 23.3 | 0.423 | 1.896 | 1.147 | 8.5 | 11.78 | 1.934 | 117 | 1.347 |
| 8 | 125 | 2.0 | 172 | 24.4 | 0.808 | 2.286 | 1.321 | 14.4 | 16.45 | 2.105 | 231 | 1.553 |
| 8 | 125 | 2.5 | 172 | 25.0 | 0.618 | 2.163 | 1.245 | 12.2 | 14.70 | 2.006 | 155 | 1.324 |
| 8 | 125 | 3.0 | 172 | 25.6 | 0.503 | 2.079 | 1.202 | 11.5 | 13.60 | 1.950 | 117 | 1.165 |
| 13 | 75 | 2.0 | 188 | 23.9 | 0.607 | 1.907 | 1.106 | 18.7 | 19.81 | 1.869 | 165 | 1.026 |
| 13 | 75 | 2.5 | 188 | 25.0 | 0.558 | 1.945 | 1.186 | 8.5 | 14.98 | 1.934 | 150 | 1.265 |
| 13 | 75 | 3.0 | 188 | 26.1 | 0.476 | 1.935 | 1.198 | 7.4 | 11.41 | 1.969 | 122 | 1.434 |
| 13 | 100 | 2.0 | 166 | 26.5 | **0.975** | **2.461** | **1.468** | 11.1 | 20.56 | **2.350** | **308** | 1.485 | ← best t / expR / PF / Sharpe / totRet |
| 13 | 100 | 2.5 | 166 | 26.5 | 0.730 | 2.249 | 1.341 | 9.3 | 17.92 | 2.188 | 192 | 1.256 |
| 13 | 100 | 3.0 | 166 | 27.7 | 0.611 | 2.196 | 1.326 | 8.5 | 14.01 | 2.188 | 150 | 1.352 |
| 13 | 125 | 2.0 | 142 | 20.4 | 0.840 | 2.193 | 1.169 | 17.3 | 24.15 | 1.900 | 177 | 0.883 |
| 13 | 125 | 2.5 | 142 | 21.1 | 0.605 | 1.959 | 1.030 | 14.9 | 20.95 | 1.700 | 110 | 0.724 |
| 13 | 125 | 3.0 | 142 | 22.5 | 0.492 | 1.887 | 0.989 | 12.2 | 17.53 | 1.652 | 85 | 0.709 |

**Surface summary: 27/27 cells expR > 0. 27/27 cells n ≥ 40 (min n = 142). 12/27 cells t ≥ 2.0.** The edge is real and surface-wide — but note WR sits at 21–28% throughout: this is a **low-hit-rate, fat-right-tail trend follower** that lives or dies on a handful of large winners. Full CSV: `dt18_grid.csv`.

## Center-region analysis (default cell + axis-adjacent neighbors)

| cell (fast/slow/atrStop) | n | WR% | expR | PF | Sharpe | t | maxDD% | MAR |
|---|---|---|---|---|---|---|---|---|
| **8/100/2.5 (center)** | **206** | **22.3** | **0.497** | **1.893** | **1.142** | **1.903** | **13.49** | **1.367** |
| 5/100/2.5 | 244 | 22.5 | 0.418 | 1.855 | 1.142 | 1.896 | 15.61 | 1.177 |
| 13/100/2.5 | 166 | 26.5 | 0.730 | 2.249 | 1.341 | 2.188 | 17.92 | 1.256 |
| 8/75/2.5 | 235 | 24.7 | 0.414 | 1.795 | 1.101 | 1.826 | 21.07 | 0.825 |
| 8/125/2.5 | 172 | 25.0 | 0.618 | 2.163 | 1.245 | 2.006 | 14.70 | 1.324 |
| 8/100/2.0 | 206 | 21.4 | 0.542 | 1.840 | 1.061 | 1.809 | 21.53 | 0.913 |
| 8/100/3.0 | 206 | 23.3 | 0.423 | 1.896 | 1.147 | 1.934 | 11.78 | 1.347 |

**Region mean expR = +0.520R; all 7 cells positive (min +0.414R); mean t = 1.95; mean n = 204.** The surface is smooth and monotone: raising `fast` or `slow` (fewer, larger-conviction trends) lifts expR/PF but thins n; a **tighter** `atrStop` raises expR but blows out maxDD (2.0× hits 21–26% DD, 3.0× tames it to 12–14%) — the classic stop-width/return trade-off, and precisely the DD-frontier the author was fighting. The center sits on a broad positive plateau; no cliff, no lone spike.

## Best cell & multiplicity caveat

- **Best by t-stat (and simultaneously by expR, PF, Sharpe, totRet): 13/100/2.0** — n=166, expR **+0.975R**, PF 2.46, Sharpe 1.47, **t = 2.350**, maxDD 20.6%, MAR 1.49.
- **Multiplicity:** with 27 cells searched, a single best-cell t of 2.35 is only *mild* standalone evidence (selection inflates the max). The survival case does **not** rest on it — it rests on the ensemble: **27/27 cells expR > 0** and **12/27 with t ≥ 2.0**, a pattern a null edge could not paint. Note the best cell buys its higher expR with a **20.6% maxDD** (worse than center's 13.5%) — it is the aggressive-stop corner, exactly where the author's "DD < 20%" constraint bites; it is not a free upgrade over center.

## Long vs short split at center (8/100/2.5) — the headline finding

| side | n | WR% | expR | PF |
|---|---|---|---|---|
| long | 103 | 25.2 | **+1.160** | 3.12 |
| short | 103 | 19.4 | **−0.165** | 0.71 |

**Symmetric-risk shorts are a net loser (−0.165R, PF 0.71).** 100% of the strategy's edge is long-side; the short book is dead weight that a symmetric test refuses to hide. This is the mechanical reason the author cut short risk to 0.35% — not to diversify, but to **mute a losing sleeve** so it wouldn't drag the leveraged long equity curve. Stripped of that cosmetic, Fugu is a long-biased 4h EMA-cross trend follower with a broken short side.

**Exit mix at center:** cross **139** (67.5%) · stop **66** (32.0%) · eod **1** (0.5%). Cross-exits dominate — trades run until the EMAs re-cross, the stop only cuts a third of them. **Per-year R (center):** 2019 −7.9 · 2020 +52.8 · 2021 +5.7 · 2022 −8.2 · 2023 +33.4 · 2024 +26.7 — edge concentrated in the 2020/2023/2024 trend years, flat-to-negative in chop (2021/2022), consistent with a directional trend engine.

## KILL CRITERIA (verbatim)

> DEAD unless center-region expR after costs > 0 AND ≥40 IS trades at center AND best-cell t ≥ 2.0.

| criterion | required | actual | pass |
|---|---|---|---|
| center-region expR after costs | > 0 | +0.520R (all 7 cells > 0; center +0.497R) | ✅ |
| IS trades at center | ≥ 40 | 206 | ✅ |
| best-cell t | ≥ 2.0 | 2.350 (13/100/2.0) | ✅ |

**All three met → SURVIVES the mechanical kill criteria.** But surviving the floor ≠ worth carrying — see the DT1 verdict below.

## DT1 comparison — beat / diversify / REDUNDANT?

DT1 "Trend Rider" (validated benchmark): center 20/75/1200 → expR **+0.896R**, PF **2.71**, Sharpe **1.30**, MAR **1.47**, t **2.00**, **75 trades**; best-t 40/75/800 → expR +1.51, PF 3.78, Sharpe 1.36, t 2.29, MAR 1.61. Both DT1 and DT18 use the **same** candles, causal fill model, cost stack, 1%-risk sizing, and 4h mark-to-market Sharpe methodology — directly comparable.

| | Sharpe | MAR | expR | PF | t | maxDD% | n |
|---|---|---|---|---|---|---|---|
| **DT18 Fugu center (8/100/2.5)** | 1.14 | 1.37 | 0.497 | 1.89 | 1.90 | 13.5 | 206 |
| **DT18 Fugu best-t (13/100/2.0)** | 1.47 | 1.49 | 0.975 | 2.46 | 2.35 | 20.6 | 166 |
| **DT1 Trend Rider center (20/75/1200)** | **1.30** | **1.47** | **0.896** | **2.71** | **2.00** | 9.4 | 75 |
| **DT1 Trend Rider best-t (40/75/800)** | 1.36 | 1.61 | 1.51 | 3.78 | 2.29 | 9.1 | 48 |

**Weekly-R Pearson correlation (center vs center, weekly buckets by exit time): r = 0.80** over 274 shared weeks. High.

### C2 daily-trend benchmark line
`Strategy Codex/Krown/backtests/C2_DAILY_TREND_BENCHMARK.md` — C2 center Sharpe **0.93** / MAR **0.96**; C2 best gated Sharpe **1.44** / MAR **2.56**. DT18 center (Sharpe 1.14 / MAR 1.37) beats C2's *center* but trails C2's best gated cell — same standing DT1 already holds, only weaker.

### Call: **REDUNDANT** (not better, not a diversifier)

- **Not better.** DT18's center is worse than DT1's center on **every** quality axis — Sharpe 1.14 < 1.30, MAR 1.37 < 1.47, expR 0.50 < 0.90, PF 1.89 < 2.71, t 1.90 < 2.00, and a deeper maxDD (13.5% > 9.4%). DT18's *best-t* cell only reaches Sharpe/MAR parity with DT1's *center* while carrying a 20.6% drawdown — comparing DT18's cherry-picked best against DT1's default and still not winning.
- **Not a diversifier.** r = 0.80 weekly-R: the two systems win and lose in the same weeks because they are the *same animal* — a 4h EMA-cross trend follower on BTC. Fugu just crosses more often (206 vs 75 trades) with a faster fast-EMA (5/8/13 vs 20/30/40), so it takes **more, lower-quality trades of the same edge** and layers on a **losing short book** DT1's slower structure avoids.
- **Verdict:** DT1 dominates DT18 — higher risk-adjusted return, cleaner drawdown, and no dead short sleeve — while capturing the same underlying trend factor. **Carry DT1; do not add Fugu as a separate strategy line.** Its only research value is as confirmation that the DaviddTech "4h EMA-cross trend" family is genuinely positive on BTC (two independent parameterizations, r=0.80, both expR>0 surface-wide) — but one representative of that family (DT1) is enough.

## Worked examples (real candles, hand-traced from `dt18_trades_center.csv`)

### Example 1 — long, exited by opposite cross (the fat right tail that carries the strategy)

- **Signal bar** closes 2020-10-08 12:00 UTC: `EMA(8)` crosses above `EMA(100)` with `close > EMA(100)` (bull gate open) → long.
- **Fill** = 4h open of the next bar, **2020-10-08 16:00 UTC** open = **10,892.69**; entry fill (×1.0002) = **10,894.87**.
- ATR(10) at signal = **109.063** → stop_dist = 2.5 × 109.063 = **272.66** → hard stop = 10,892.69 − 272.66 = **10,620.03** ✓ (matches ledger to the cent). Size = risk / 272.66 = **0.37676 BTC**.
- Stop never touched on 1m. `EMA(8)` crosses back under `EMA(100)` on the bar closing 2020-11-27 08:00 → **cross exit at 2020-11-27 12:00 open = 16,797.19**; exit fill (×0.9998) = **16,793.83**.
- Gross = 0.37676 × (16,793.83 − 10,894.87) = **+2,222.50**; fees **5.22**; **net +2,217.28 = +21.58R** (the Oct→Nov 2020 breakout, held ~50 days).

### Example 2 — short, stopped out (a capped loss, and why symmetric shorts bleed)

- **Signal bar** closes 2023-08-13 20:00 UTC: `EMA(8)` crosses below `EMA(100)` with `close < EMA(100)` (bear gate open) → short.
- **Fill** = **2023-08-14 00:00 UTC** open = **29,293.30**; entry fill (×0.9998) = **29,287.44**.
- ATR(10) = **109.7079** → stop_dist = 2.5 × 109.7079 = **274.27** → hard stop = 29,293.30 + 274.27 = **29,567.57** ✓. Size = risk / 274.27 = **0.60824 BTC**.
- A 1m bar inside the 4h bar ending 2023-08-14 12:00 prints high ≥ 29,567.57 → **stop fills at 29,567.57** (×1.0002 adverse) = **29,573.48** (exit bar 2023-08-14 12:00).
- Gross = 0.60824 × (29,287.44 − 29,573.48) = **−173.98**; fees **17.90**; **net −191.88 = −1.15R** (loss beyond −1R = fee+slippage drag on a tight-stop short). Held ~12h — a textbook short chopped out in a range, the pattern that makes the short book's expR negative.

Both examples reconcile to the cent against the ledger.

## PROOFS

**py_compile** (clean):
```
$ python3 -m py_compile backtests/bt_dt18_fugu.py  →  exit 0 (OK)
```

**Determinism — two independent runs, md5 of each output byte-identical:**
```
                 run 1                             run 2
center ledger  b1d95a9f4b2ab48671776c93054264cd   b1d95a9f4b2ab48671776c93054264cd   IDENTICAL
best   ledger  ee663bfdf05b736b94bd846ad12efd20   ee663bfdf05b736b94bd846ad12efd20   IDENTICAL
grid   csv     36e7e119bd728b0bdeaea1570cef3890   36e7e119bd728b0bdeaea1570cef3890   IDENTICAL
```

**Candle load + 2025 lockout (parquet load `backtests/data/btcusdt_1m.parquet`):**
```
engine load:   1m rows = 2,795,040   min = 2019-09-09 00:00:00 UTC   max = 2024-12-31 23:59:00 UTC
               4h bars = 11,646       min = 2019-09-09 00:00:00 UTC   max = 2024-12-31 20:00:00 UTC
               cutoff (exclusive) = 2025-01-01 00:00:00 UTC   (0 candles ≥ cutoff loaded)
```
Max 1m timestamp is 2024-12-31 23:59 UTC — the 2025-26 out-of-sample window was never touched.

## Files

- Engine: `backtests/bt_dt18_fugu.py`
- Grid (27 cells): `Strategy Codex/DaviddTech/backtests/dt18_grid.csv`
- Center ledger (206 trades): `Strategy Codex/DaviddTech/backtests/dt18_trades_center.csv`
- Best-cell ledger (166 trades): `Strategy Codex/DaviddTech/backtests/dt18_trades_best.csv`
- Stats JSON: `backtests/_dt18_stats.json`
