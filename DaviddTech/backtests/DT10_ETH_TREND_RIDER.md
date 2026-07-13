❌ DEAD — best-cell t = 1.59 < 2.0 (0 of 27 cells reach significance) → fails kill-gate #3. Center expR +1.92R / PF 2.50 is real but fat-tailed (WR 15.6%, one +68.6R winner carries it) and rides an unbounded **45.6% drawdown** because the Pine has no hard stop. The trend edge ports to ETH; this exit-signal-only implementation is not investable.

# DT10 "EMA Trend Rider (ETH 1h)" — causal backtest of DaviddTech library strategy

ETHUSDT **1h bars built from 1m closes**, signals on **closed 1h bars**, fills at the **next 1m open**. IS window **2019-11-27 → 2024-12-31** (44,681 1h bars from 2,680,815 pre-2025 1m candles), minus a `slowLen+slopeLb`-bar warmup per cell (511 bars ≈ 21 days at center). 2025+ locked out (loaded **0** candles ≥ 2025-01-01 UTC). Engine `backtests/bt_dt10_eth_trend_rider.py`. Source of truth `Strategy Codex/DaviddTech/research/pine_ethsol/ETH_EMA_Trend_Rider_ETH_1h_BTC_validated.pine` (Pine v5, 32 lines).

> **Author's claim (selection-only context — NOT evidence, NOT a target):** PF 2.62, Sharpe 1.39, +590%, DD 24.3%, 79 trades over 3.8y. See the selection-bias asterisk below — the author's own header comments quote **2025-26 out-of-sample** results, i.e. his parameter choice **saw our locked OOS window**.

## Spec derived from the Pine (frozen)

- Regime EMA `emaS = ta.ema(close, slowLen)`. Entry line `upLine = emaS·(1+entBuf/100)`; exit line `dnLine = emaS·(1−exBuf/100)`.
- `emaRising = emaS[i] > emaS[i−slopeLb]` (EMA rising over the slope lookback).
- **LONG ENTRY** on a **closed** bar `i` where `close>upLine AND close[1]<=upLine[1]` (crossUp) **AND** `emaRising` **AND currently flat**.
- **EXIT** on a **closed** bar `j` where `close<dnLine AND close[1]>=dnLine[1]` (crossDn) while in a position.
- **NO hard stop exists in the Pine** — this is an **exit-signal-only** system. Losers run until price crosses back below the exit line, however far that is. maxDD is reported **honestly** on the mark-to-market curve; there is no protective stop and drawdowns are correspondingly deep. Convention stated up front.
- **Long-only** (`strategy.long` / `strategy.close` only).
- Signals on closed 1h bars only; **entry/exit fills = the 1h `open` of bar i+1** (a 1h bar's open is by construction its first 1m open, so "next 1m open after the close" **is** `o1h[i+1]` — causal, no look-ahead).

### Risk-unit definition (declared)

The Pine sizes at `percent_of_equity=100` (full-notional). Per task, that is standardized to the project's **1%-equity risk** convention, measured against **the distance from the entry price to the exit line at entry**:

```
risk_dist = entry_ref − dnLine[signal_bar]          (long; entry sits above the exit line, so > 0)
size      = (equity × 1%) / risk_dist
R         = net_pnl / (equity × 1%)                 (= net / initial risk)
```

There is **no stop at `risk_dist`** — it is only the *unit* in which R is denominated (the initial distance to where an exit-signal would fire if the EMA held still). Equity compounds sequentially (DT1-style), but per-trade R is equity-independent (the fee/risk term cancels equity), so **expR / PF / t-stat are identical whether flat or compounding** — only the $ curve (Sharpe, maxDD%, totRet) compounds.

## Execution conventions (reused from `backtests/bt_engine.py` / DT1-DT5 scaffolding)

- Fees **0.05%/side**, slippage **0.02%/fill**, **$10k** start, compounding 1%-risk.
- Entry fill `= open×(1+slip)`; exit fill `= open×(1−slip)` (long).
- **Ambiguous fills = losses**: irrelevant here beyond the honest next-open fill — exits are **close-signal only**, so there is no intrabar stop-vs-TP contest to tie-break (the reason the task flags "little tie-breaking needed").
- 1h **mark-to-market** total-equity curve (unrealized P&L marked each 1h close) → Sharpe (× √(24·365)) and maxDD%; per-trade R drives expR / PF / t-stat / maxDD_R. MAR = CAGR / maxDD%.
- Deterministic: no RNG, no wall-clock, sorted output — two runs byte-identical (md5s below).

## DECLARED GRID (fixed BEFORE any result) — all 27 cells run, no additions

```
slowLen in {350, 450, 550}
entBuf  in {0.10, 0.19, 0.30}   (%)
exBuf   in {0.50, 0.74, 1.00}   (%)
=> 3 × 3 × 3 = 27 cells.  Center = Pine defaults (slowLen=450, entBuf=0.19, exBuf=0.74).
slopeLb = 61 (Pine default) for ALL 27 grid cells.
slopeLb sensitivity {40, 61, 90} run on the CENTER cell ONLY (below).
```

## Full grid — every declared cell (after costs)

`expR` = mean per-trade R; `PF` from R; `Sharpe`/`maxDD%` = 1h mark-to-market annualized; `maxDD_R` = cumulative-R drawdown; `t` = per-trade t-stat (mean R / (σ/√n)); `totRet%` = compounding $10k curve; `MAR` = CAGR/maxDD%.

| slowLen | entBuf | exBuf | n | WR% | expR | PF | Sharpe | maxDD_R | maxDD% | t | totRet% | MAR |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 350 | 0.10 | 0.50 | 125 | 18.4 | 1.519 | 1.992 | 0.776 | 65.9 | 58.0 | 1.216 | 200.0 | 0.419 |
| 350 | 0.10 | 0.74 | 112 | 20.5 | 0.933 | 1.710 | 0.618 | 52.5 | 50.4 | 1.071 | 98.4 | 0.289 |
| 350 | 0.10 | 1.00 | 100 | 22.0 | 0.942 | 1.800 | 0.675 | 39.5 | 41.4 | 1.183 | 98.9 | 0.352 |
| 350 | 0.19 | 0.50 | 123 | 20.3 | 1.027 | 1.721 | 0.649 | 54.3 | 52.1 | 1.137 | 124.1 | 0.332 |
| 350 | 0.19 | 0.74 | 113 | 22.1 | 0.935 | 1.753 | 0.665 | 45.6 | 45.9 | 1.168 | 108.9 | 0.342 |
| 350 | 0.19 | 1.00 | 99 | 22.2 | 0.978 | 1.857 | 0.726 | 37.3 | 37.8 | 1.281 | 108.3 | 0.414 |
| 350 | 0.30 | 0.50 | 117 | 21.4 | 1.398 | 2.054 | 0.877 | 32.7 | 35.5 | 1.456 | 220.0 | 0.729 |
| 350 | 0.30 | 0.74 | 108 | 23.1 | 1.237 | 2.052 | 0.863 | 29.8 | 31.8 | 1.460 | 173.1 | 0.692 |
| 350 | 0.30 | 1.00 | 94 | 23.4 | 1.274 | 2.165 | 0.911 | 22.6 | 26.5 | 1.565 | 159.7 | 0.785 |
| 450 | 0.10 | 0.50 | 105 | 14.3 | 1.735 | 2.162 | 0.822 | 44.5 | 49.3 | 1.318 | 221.9 | 0.530 |
| 450 | 0.10 | 0.74 | 95 | 15.8 | 1.929 | 2.468 | 0.943 | 36.2 | 45.6 | 1.518 | 264.5 | 0.641 |
| 450 | 0.10 | 1.00 | 82 | 18.3 | 1.855 | 2.558 | 0.946 | 26.8 | 38.5 | 1.580 | 217.8 | 0.669 |
| 450 | 0.19 | 0.50 | 105 | 14.3 | 1.766 | 2.238 | 0.852 | 42.6 | 48.8 | 1.345 | 233.6 | 0.553 |
| **450** | **0.19** | **0.74** | **96** | **15.6** | **1.918** | **2.502** | **0.956** | **35.7** | **45.6** | **1.526** | **268.0** | **0.648** |
| 450 | 0.19 | 1.00 | 83 | 18.1 | 1.839 | 2.588 | 0.961 | 25.9 | 38.1 | **1.587** | 219.7 | 0.680 | ← best t |
| 450 | 0.30 | 0.50 | 107 | 14.0 | 1.480 | 2.080 | 0.774 | 47.2 | 46.6 | 1.232 | 174.5 | 0.476 |
| 450 | 0.30 | 0.74 | 97 | 15.5 | 1.370 | 2.102 | 0.782 | 40.3 | 43.4 | 1.292 | 153.6 | 0.467 |
| 450 | 0.30 | 1.00 | 84 | 17.9 | 1.397 | 2.227 | 0.819 | 29.7 | 36.3 | 1.380 | 142.7 | 0.530 |
| 550 | 0.10 | 0.50 | 100 | 15.0 | 1.500 | 2.084 | 0.718 | 49.5 | 58.9 | 1.202 | 157.5 | 0.352 |
| 550 | 0.10 | 0.74 | 85 | 16.5 | 0.776 | 1.562 | 0.458 | 52.5 | 50.3 | 0.868 | 53.2 | 0.176 |
| 550 | 0.10 | 1.00 | 79 | 17.7 | 0.752 | 1.618 | 0.485 | 43.2 | 45.3 | 0.929 | 52.7 | 0.194 |
| 550 | 0.19 | 0.50 | 98 | 15.3 | 0.935 | 1.688 | 0.530 | 46.0 | 49.3 | 0.977 | 78.3 | 0.247 |
| 550 | 0.19 | 0.74 | 84 | 16.7 | 0.797 | 1.581 | 0.468 | 51.9 | 50.0 | 0.882 | 54.9 | 0.182 |
| 550 | 0.19 | 1.00 | 79 | 17.7 | 0.750 | 1.622 | 0.487 | 43.4 | 45.4 | 0.929 | 52.7 | 0.193 |
| 550 | 0.30 | 0.50 | 95 | 16.8 | 1.108 | 1.848 | 0.619 | 44.6 | 48.6 | 1.124 | 104.3 | 0.314 |
| 550 | 0.30 | 0.74 | 84 | 17.9 | 0.890 | 1.669 | 0.527 | 51.7 | 49.9 | 0.986 | 67.4 | 0.217 |
| 550 | 0.30 | 1.00 | 79 | 19.0 | 0.804 | 1.675 | 0.521 | 45.1 | 46.3 | 0.995 | 59.2 | 0.209 |

**Surface summary: 27/27 cells expR > 0 (min +0.750R). 27/27 cells n ≥ 40 (min n = 79). 0/27 cells t ≥ 2.0 (max t = 1.587). Every cell carries a 26–59% drawdown (min maxDD% = 26.5).** Full CSV: `dt10_grid.csv`.

## slopeLb sensitivity — CENTER cell (450 / 0.19 / 0.74) only

| slopeLb | n | WR% | expR | PF | Sharpe | maxDD% | t | totRet% | MAR |
|---|---|---|---|---|---|---|---|---|---|
| 40 | 99 | 17.2 | 1.387 | 2.096 | 0.830 | 37.2 | 1.351 | 166.9 | 0.578 |
| **61** (default) | **96** | **15.6** | **1.918** | **2.502** | **0.956** | **45.6** | **1.526** | **268.0** | **0.648** |
| 90 | 98 | 14.3 | 1.258 | 1.975 | 0.492 | 49.2 | 1.219 | 133.7 | 0.373 |

The author's default `slopeLb=61` sits on a **local expR/Sharpe peak** — both neighbours (40 → 1.39R, 90 → 1.26R) are materially worse. That is another tuning fingerprint (see selection-bias note). Even at its own peak, `slopeLb=61` clears neither t=2.0 nor a tolerable drawdown. CSV: `dt10_slope_sens.csv`.

## Center-region analysis (default cell + axis-adjacent neighbors)

| cell (slow/ent/ex) | n | WR% | expR | PF | Sharpe | t | maxDD% |
|---|---|---|---|---|---|---|---|
| **450/0.19/0.74 (center)** | **96** | **15.6** | **1.918** | **2.502** | **0.956** | **1.526** | **45.6** |
| 350/0.19/0.74 | 113 | 22.1 | 0.935 | 1.753 | 0.665 | 1.168 | 45.9 |
| 550/0.19/0.74 | 84 | 16.7 | 0.797 | 1.581 | 0.468 | 0.882 | 50.0 |
| 450/0.10/0.74 | 95 | 15.8 | 1.929 | 2.468 | 0.943 | 1.518 | 45.6 |
| 450/0.30/0.74 | 97 | 15.5 | 1.370 | 2.102 | 0.782 | 1.292 | 43.4 |
| 450/0.19/0.50 | 105 | 14.3 | 1.766 | 2.238 | 0.852 | 1.345 | 48.8 |
| 450/0.19/1.00 | 83 | 18.1 | 1.839 | 2.588 | 0.961 | 1.587 | 38.1 |

**Region mean expR = +1.508R; all 7 cells positive (min +0.797R); mean t = 1.28; mean n = 96; every cell drawdown 38–50%.** The expectancy is genuinely positive and reasonably smooth — the trend-riding *direction* is real on ETH — but **not a single region cell (or grid cell) reaches statistical significance**, and the whole neighborhood lives inside ~40–50% drawdowns. Raising `slowLen` to 550 (slower regime, fewer trends) *collapses* both expR and t; `slowLen=450` with a tight `entBuf` is the visible sweet spot the author landed on.

## Best cell & multiplicity caveat

- **Best by t-stat: 450 / 0.19 / 1.00** — n=83, expR **+1.84R**, PF 2.59, Sharpe 0.96, **t = 1.587**, maxDD 38.1%, MAR 0.68. **Still below the t ≥ 2.0 bar.**
- Best by expR: 450/0.10/0.74 (+1.93R, t 1.52); best by MAR: 350/0.30/1.00 (0.785, but t 1.57 and PF 2.17). No metric and no cell produces a significant, low-drawdown configuration.
- **Multiplicity:** with 27 cells searched, even the *maximum* t of 1.587 is inflated by selection — and it *still* fails. A null-edge surface would scatter t-stats around 0; here they are uniformly positive (a real directional edge) but uniformly **sub-2.0** (too few, too fat-tailed to be significant). The survival case cannot be rescued by cherry-picking: the best of 27 does not clear the gate.

## KILL CRITERIA (verbatim)

> DEAD unless center-region expR after costs > 0 AND ≥40 IS trades at center AND best-cell t ≥ 2.0.

| criterion | required | actual | pass |
|---|---|---|---|
| center-region expR after costs | > 0 | +1.508R (all 7 cells >0; center +1.918R) | ✅ |
| IS trades at center | ≥ 40 | 96 | ✅ |
| best-cell t | ≥ 2.0 | **1.587** (max over all 27 cells) | ❌ |

**Two of three met, but the conjunction requires all three → ❌ DEAD.** The strategy has real positive expectancy but fails the significance gate: at 15.6% win rate the R-distribution is dominated by a handful of monster trend winners (one +68.6R trade alone is ~36% of the center's total +184R), so the standard error swamps the mean (t = 1.53). Compounding the problem, the exit-signal-only design (no hard stop) produces a **45.6% mark-to-market drawdown** at center — un-investable regardless of expectancy.

## Selection-bias asterisk (the author saw 2025-26)

The Pine's own header comments read: *"Uses the BTC walk-forward-validated params (0.19/0.74/61) … OOS 2025-01→2026-07: PF 2.96, +73.8%, DD 23.1%, Sharpe 1.36"* and *"per-asset re-optimization was tested and REJECTED (boundary params, OOS PF 1.10 vs these 2.96)."* Both sentences prove the author **evaluated candidate parameters against the 2025-26 window that is our project-locked out-of-sample set**, then kept the params that scored best there. That is textbook look-ahead in the *selection* step: any performance the author quotes (and any agreement between his params and a good OOS number) is contaminated and carries **zero** evidential weight. Our test deliberately never touched a 2025+ candle (proof below) — the DEAD verdict rests only on the honest 2019-2024 IS surface. The fact that `slopeLb=61` and `entBuf=0.19/exBuf=0.74` each sit on local IS optima (slope sensitivity + grid above) is consistent with a parameter set fitted, not discovered.

## Comparison — is the trend-riding edge cross-asset?

Same causal fill model, cost stack, and mark-to-market Sharpe methodology across all three, so the numbers are directly comparable.

| | asset / TF | stop? | expR | PF | Sharpe | t | maxDD% | MAR |
|---|---|---|---|---|---|---|---|---|
| **DT10 center** (450/0.19/0.74) | ETH 1h | **none** | 1.918 | 2.50 | 0.96 | 1.53 | **45.6** | 0.65 |
| **DT10 best-t** (450/0.19/1.00) | ETH 1h | **none** | 1.839 | 2.59 | 0.96 | 1.59 | 38.1 | 0.68 |
| DT1 center (20/75/1200) | BTC 4h | 3×ATR | 0.896 | 2.71 | **1.30** | **2.00** | **9.4** | **1.47** |
| C2 center | BTC daily | — | — | — | 0.93 | — | — | 0.96 |
| C2 best gated | BTC daily | — | — | — | **1.44** | — | — | **2.56** |

**The directional edge ports; the risk construction does not.** DT10's ETH surface is uniformly positive-expectancy (27/27 cells) — trend-riding *works* on ETH just as DT1 showed it works on BTC, so the edge is genuinely cross-asset. But DT10 buys its higher raw expR (1.9R vs DT1's 0.9R) with a **broken risk profile**: no protective stop → 38–59% drawdowns (4–6× DT1's 9.4%) and a fat-tailed R-distribution that never reaches significance (max t 1.59 vs DT1's clean 2.00). DT10 also lands *below* even C2's plain center (Sharpe 0.96 vs 0.93 is a tie; MAR 0.65 vs 0.96 is a loss) and is not remotely near C2's best gated cell (Sharpe 1.44 / MAR 2.56). **Conclusion:** the trend-rider concept is cross-asset real, but *this* Pine — long-only, exit-signal-only, no stop — is the wrong implementation of it. DT1's stop-bounded BTC cousin is the survivor; DT10 is what the same idea looks like without risk management.

## Worked examples (real candles, hand-traced from `dt10_trades_center.csv`)

### Example 1 — long, the +68.6R trend winner that carries the whole cell

- **Signal bar** opens 2020-12-24 20:00 UTC and closes 21:00: `close` crosses above `upLine = EMA(450)·1.0019` with `EMA(450)` rising over 61 bars → long. Exit line at entry `dnLine = EMA(450)·0.9926 = 597.61`.
- **Fill** = 1h open of the next bar, **2020-12-24 21:00 UTC** open = **604.98**; entry fill (×1.0002) = **605.10**.
- Risk unit = 604.98 − 597.61 = **7.374** (1.22% of price). Size = risk 179.80 / 7.374 = **24.383 ETH**.
- **No stop.** `close` finally crosses back below the exit line on the bar closing 2021-01-22 00:00 → **cross exit at 2021-01-22 00:00 open = 1,111.82**; exit fill (×0.9998) = **1,111.60**.
- Gross = 24.383 × (1,111.60 − 605.10) = **+12,349.7**; fees **20.9**; **net +12,328.79 = +68.57R** (held 675 1h bars ≈ 28.1 days — the Dec-2020→Jan-2021 ETH breakout from ~$600 to ~$1,110).

### Example 2 — long, the −3.7R loser that shows the no-stop tail

- **Signal bar** opens 2023-03-01 03:00 UTC, closes 04:00: crossUp + EMA rising → long. Exit line at entry `dnLine = 1,614.00`.
- **Fill** = **2023-03-01 04:00 UTC** open = **1,637.69**; entry fill (×1.0002) = **1,638.02**.
- Risk unit = 1,637.69 − 1,614.00 = **23.689** (1.45% of price). Size = risk 419.43 / 23.689 = **17.705 ETH**.
- Price falls **~5.3%** below entry — **far past the 1.45% risk unit, because there is no stop** — before `close` crosses below the exit line on the bar closing 2023-03-03 02:00 → **cross exit at 1,551.77 open**; exit fill (×0.9998) = **1,551.46**.
- Gross = 17.705 × (1,551.46 − 1,638.02) = **−1,532.5**; fees **28.3**; **net −1,560.78 = −3.72R** (held 46 bars ≈ 1.9 days). A single loser worth **−3.7R** — impossible under DT1's ~−1R hard stop — is exactly why DT10's variance is too high to clear t=2.0 and its drawdown reaches 45.6%.

Both examples reconcile to the cent against `dt10_trades_center.csv`.

## PROOFS

**py_compile** (clean):
```
$ python3 -m py_compile backtests/bt_dt10_eth_trend_rider.py  →  exit 0 (OK)
```

**Determinism — two independent runs, md5 of each output byte-identical:**
```
                 run 1                             run 2
center ledger  22444ac8752830c8cba3e4d86624f519  22444ac8752830c8cba3e4d86624f519  IDENTICAL
best   ledger  8295d8f97765f5188cc934dca653fa88  8295d8f97765f5188cc934dca653fa88  IDENTICAL
grid   csv     6181e07b4328ff51dc813e6003b8b14a  6181e07b4328ff51dc813e6003b8b14a  IDENTICAL
slope  csv     3bde87a3c230e47ef21b2da931e69d2c  3bde87a3c230e47ef21b2da931e69d2c  IDENTICAL
```

**Candle load + 2025 lockout (parquet `backtests/data/ethusdt_1m.parquet`):**
```
engine load:   1m rows = 2,680,815   min = 2019-11-27 07:45:00 UTC   max = 2024-12-31 23:59:00 UTC
               1h bars = 44,681       min = 2019-11-27 07:00:00 UTC   max = 2024-12-31 23:00:00 UTC
               cutoff (exclusive) = 2025-01-01 00:00:00 UTC   →  candles ≥ cutoff loaded = 0
file total (unfiltered) = 3,482,895 rows, 2019-11-27 → 2026-07-11; the 2025-26 rows were filtered
out BEFORE any indicator or signal computation — the locked OOS window was never evaluated.
```

## Files

- Engine: `backtests/bt_dt10_eth_trend_rider.py`
- Grid (27 cells): `Strategy Codex/DaviddTech/backtests/dt10_grid.csv`
- slopeLb sensitivity: `Strategy Codex/DaviddTech/backtests/dt10_slope_sens.csv`
- Center ledger (96 trades): `Strategy Codex/DaviddTech/backtests/dt10_trades_center.csv`
- Best-cell ledger (83 trades): `Strategy Codex/DaviddTech/backtests/dt10_trades_best.csv`
