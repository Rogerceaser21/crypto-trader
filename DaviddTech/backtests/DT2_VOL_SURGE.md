✅ SURVIVES — center (50/80/2.5) expR +0.296R after costs, n=198, t=2.24; best-cell (70/70/2.0) t=2.81; and the edge is surface-wide (27/27 grid cells expR>0, 25/27 t≥2.0) — not a selection artifact.

# DT2 "Volatility-Surge Breakout" — causal backtest of DaviddTech "C25-021-ATR-PERCENTILE-SURGE"

BTCUSDT **Binance Perpetual**, signals on **closed 4h bars**, fills at the **next 1m open**. IS window **2019-09-09 → 2024-12-31** (11,646 4h bars from 2,795,040 pre-2025 1m candles, ~5.31 y), minus a per-cell warmup. 2025+ locked out (0 candles ≥ 2025-01-01 UTC loaded). Engine `backtests/bt_dt2_vol_surge.py`. Source of truth `Strategy Codex/DaviddTech/research/pine/QL_ATR_Percentile_Surge_BTC_4h.pine` (Pine v5, 38 lines). The author's **PF 2.00 / +66% / 191-trade** claim is selection-only context — **not** evidence and **not** a target.

## Spec derived from the Pine (frozen)

- `atr = ta.atr(14)` (Wilder/RMA of True Range, SMA seed). `atrPct = ta.percentrank(atr, pctLen)`.
- **`surge = ta.crossover(atrPct, pctThr)`** → `atrPct[t] > pctThr` **and** `atrPct[t−1] ≤ pctThr`, on a **closed** 4h bar.
- **Direction** `dir = close > ta.ema(close,20) ? +1 : −1`, evaluated on the signal bar → `close > EMA20` long, else short.
- **pyramiding=0**: a new surge is **ignored while a position is open** (Pine's `if strategy.position_size == 0` entry gate). Only the exits below flatten; there is no stop-and-reverse.
- **Entry**: `entryRef := close` (the signal-bar 4h close). Fill at the **next 1m open** after the 4h close = the 4h `open` of bar i+1 (causal, no look-ahead).
- **Exits** (Pine lines 30–37):
  - **(a) Hard stop, MOVING.** Pine calls `strategy.exit(stop = entryRef ∓ slMult*atr)` on **every** bar the position is open, with the **current** bar's `atr`. `entryRef` is fixed at the signal-bar close; `atr` changes each bar → **the stop level moves every bar** (a long's stop = `entryRef − slMult·atr_current`; a short's = `entryRef + slMult·atr_current`). This is replicated faithfully: the stop order set at the close of bar j−1 (using `atr[j−1]`) is the level tested intrabar on bar j (causal). **Consequence:** realized R at a stop is **not** pinned to −1 — if ATR expanded, the stop is further out (loss > 1R); if ATR contracted, the stop ratcheted in (loss < 1R). No stop is active on the entry bar itself (Pine places the first stop only at the entry bar's close).
  - **(b) `atrPct < 50`** on a closed bar → `strategy.close` (market at the **next** bar open). This is the volatility-normalisation exit — it fires far more often than the stop.
  - **(c) Time stop** `bar_index − entryBar ≥ maxBars` (default 42). Pine sets `entryBar` on the **signal** bar, so the clock counts from the signal bar, not the fill bar → market close at the next bar open.
- **Sizing**: fixed **1%-of-(compounding)-equity** risk vs the **initial** stop distance (`= slMult·atr` at the signal bar). `size = risk$ / (slMult·atr_signal)`; `$10k` start.

### `ta.percentrank` reading + hand-check (load-bearing)

Pine `ta.percentrank(x, len)` = "the percent of the previous `len` values that are **≤** the current value" — it **excludes** the current bar and compares the previous `len` values with `≤`:
`atrPct[t] = 100 · #{ k∈[1..len] : atr[t−k] ≤ atr[t] } / len`, range 0..100.

Hand-checked in code (`_handcheck()`, asserted every run) on `x=[5,1,3,2,4,3]`, `len=3`:

| t (value) | previous 3 | count ≤ value | percentrank |
|---|---|---|---|
| t=3 (2) | [5,1,3] | 1 → {1} | 33.33 |
| t=4 (4) | [1,3,2] | 3 → {1,3,2} | 100.00 |
| t=5 (3) | [3,2,4] | 2 → {3,2} | 66.67 |

Engine output = `{3: 33.3333, 4: 100.0, 5: 66.6667}` — **exact match**. (ATR's 13 leading NaNs are masked so every percentrank window is fully defined: `atrPct` is NaN until index `13 + pctLen`.)

## Execution conventions (reused from `backtests/bt_engine.py` / `bt_dt1_trend_rider.py`)

- Fees **0.05%/side**, slippage **0.02%/fill**, **$10k** start, compounding 1%-risk.
- Entry fill = `open×(1±slip)`. Intrabar stop filled **at the (moving) level** with adverse slippage; market exits (b/c) fill at the **next-bar open** with adverse slippage.
- **Ambiguous = loss.** This is a single-stop / no-TP design, so the only same-bar contest is a pending market-close (executes at the bar **open**, chronologically first) vs an intrabar stop → the open fill wins, and if the bar gapped **through** the stop the open is already the worse loss-side price. Never a favourable fill.
- 4h **mark-to-market** total-equity curve (unrealised P&L marked each 4h close, C2-style) → Sharpe (× √(6·365)) and maxDD%; per-trade R drives expR / PF / t / maxDD_R.
- Deterministic: no RNG, no wall-clock; chronological trades; sorted grid — two runs byte-identical (md5s below).

## DECLARED GRID (fixed BEFORE any result) — all 27 cells run, no additions

```
pctLen in {30, 50, 70}
pctThr in {70, 80, 90}
slMult in {2.0, 2.5, 3.0}
=> 3 × 3 × 3 = 27 cells.  Center = Pine defaults (pctLen=50, pctThr=80, slMult=2.5).
maxBars = 42 fixed for the 27-cell grid; {28, 56} sensitivity on the CENTER cell only.
atrLen=14, emaLen=20 fixed (not grid dims).
```

## Full grid — every declared cell (after costs)

`expR` = mean per-trade R; `PF` from R; `Sharpe`/`maxDD%` = 4h mark-to-market annualised; `maxDD_R` = cumulative-R drawdown; `t` = per-trade t-stat (mean R / (σ/√n)). ★C = center, ◆B = best cell.

| pctLen | pctThr | slMult | n | WR% | expR | PF | Sharpe | maxDD_R | maxDD% | t |
|---|---|---|---|---|---|---|---|---|---|---|
| 30 | 70 | 2.0 | 340 | 43.5 | 0.270 | 1.765 | 1.462 | 10.94 | 11.44 | 2.423 |
| 30 | 70 | 2.5 | 325 | 44.6 | 0.214 | 1.694 | 1.364 | 8.14 | 8.87 | 2.270 |
| 30 | 70 | 3.0 | 316 | 45.9 | 0.194 | 1.772 | 1.427 | 7.05 | 8.03 | 2.400 |
| 30 | 80 | 2.0 | 292 | 41.1 | 0.280 | 1.752 | 1.363 | 12.11 | 12.47 | 2.314 |
| 30 | 80 | 2.5 | 284 | 41.5 | 0.213 | 1.661 | 1.239 | 12.09 | 12.24 | 2.118 |
| 30 | 80 | 3.0 | 275 | 42.2 | 0.192 | 1.703 | 1.280 | 8.93 | 9.40 | 2.193 |
| 30 | 90 | 2.0 | 254 | 42.5 | 0.311 | 1.878 | 1.408 | 10.43 | 10.28 | 2.401 |
| 30 | 90 | 2.5 | 248 | 41.5 | 0.234 | 1.752 | 1.271 | 12.00 | 11.54 | 2.174 |
| 30 | 90 | 3.0 | 241 | 44.0 | 0.216 | 1.813 | 1.343 | 8.20 | 8.61 | 2.303 |
| 50 | 70 | 2.0 | 251 | 44.6 | 0.351 | 1.970 | 1.470 | 7.59 | 8.51 | 2.645 |
| 50 | 70 | 2.5 | 246 | 45.5 | 0.265 | 1.860 | 1.350 | 7.13 | 8.34 | 2.426 |
| 50 | 70 | 3.0 | 241 | 44.4 | 0.169 | 1.600 | 1.023 | 7.99 | 8.31 | 1.862 |
| 50 | 80 | 2.0 | 205 | 48.8 | 0.380 | 1.987 | 1.378 | 9.11 | 10.19 | 2.405 |
| 50 | 80 | 2.5 | 198 | 49.0 | 0.296 | 1.888 | 1.286 | 7.86 | 8.63 | **2.242 ★C** |
| 50 | 80 | 3.0 | 193 | 49.7 | 0.215 | 1.740 | 1.098 | 6.09 | 6.72 | 1.952 |
| 50 | 90 | 2.0 | 178 | 46.6 | 0.356 | 1.878 | 1.198 | 10.04 | 10.70 | 2.125 |
| 50 | 90 | 2.5 | 167 | 49.7 | 0.325 | 2.018 | 1.273 | 6.89 | 8.01 | 2.282 |
| 50 | 90 | 3.0 | 161 | 52.2 | 0.305 | 2.135 | 1.361 | 4.44 | 5.67 | 2.447 |
| 70 | 70 | 2.0 | 218 | 44.0 | 0.430 | 2.195 | 1.624 | 6.21 | 7.05 | **2.810 ◆B** |
| 70 | 70 | 2.5 | 214 | 44.4 | 0.321 | 2.001 | 1.465 | 5.33 | 5.91 | 2.543 |
| 70 | 70 | 3.0 | 208 | 45.2 | 0.244 | 1.866 | 1.299 | 3.83 | 4.95 | 2.310 |
| 70 | 80 | 2.0 | 173 | 46.2 | 0.501 | 2.208 | 1.566 | 5.40 | 6.75 | 2.679 |
| 70 | 80 | 2.5 | 165 | 48.5 | 0.440 | 2.248 | 1.615 | 4.68 | 5.66 | 2.717 |
| 70 | 80 | 3.0 | 162 | 48.1 | 0.289 | 1.904 | 1.266 | 3.95 | 4.84 | 2.224 |
| 70 | 90 | 2.0 | 148 | 45.9 | 0.488 | 2.148 | 1.452 | 7.29 | 8.68 | 2.446 |
| 70 | 90 | 2.5 | 135 | 50.4 | 0.432 | 2.296 | 1.443 | 4.80 | 6.02 | 2.566 |
| 70 | 90 | 3.0 | 134 | 52.2 | 0.382 | 2.337 | 1.482 | 3.54 | 4.29 | 2.655 |

**Grid summary: expR > 0 in 27/27 cells (range +0.169 … +0.501R); t ≥ 2.0 in 25/27** (only `50/70/3.0` t=1.86 and `50/80/3.0` t=1.95 dip below — both are the wide-stop `slMult=3.0` corners at `pctLen=50`). Sharpe 1.02–1.62 across the whole grid. The edge is **not** parameter-fragile.

### maxBars sensitivity (center cell 50/80/2.5 only)

| maxBars | n | expR | PF | Sharpe | maxDD% | t |
|---|---|---|---|---|---|---|
| 28 | 208 | 0.248 | 1.740 | 1.194 | 9.14 | 2.203 |
| **42** (default) | **198** | **0.296** | **1.888** | **1.286** | **8.63** | **2.242** |
| 56 | 194 | 0.334 | 1.979 | 1.393 | 8.63 | 2.374 |

Monotone: a **longer** time stop improves expR/PF/Sharpe (the winners run further before the vol-normalisation exit); all three stay expR>0 and t>2. The edge does not hinge on the exact time-stop length.

## Center-region analysis (axis-adjacent neighbours, one grid step on one axis)

| cell | n | expR | PF | t |
|---|---|---|---|---|
| **50/80/2.5 (center)** | 198 | **0.296** | 1.888 | 2.242 |
| 30/80/2.5 (−pctLen) | 284 | 0.213 | 1.661 | 2.118 |
| 70/80/2.5 (+pctLen) | 165 | 0.440 | 2.248 | 2.717 |
| 50/70/2.5 (−pctThr) | 246 | 0.265 | 1.860 | 2.426 |
| 50/90/2.5 (+pctThr) | 167 | 0.325 | 2.018 | 2.282 |
| 50/80/2.0 (−slMult) | 205 | 0.380 | 1.987 | 2.405 |
| 50/80/3.0 (+slMult) | 193 | 0.215 | 1.740 | 1.952 |

**Region mean expR = +0.305R; all 7 cells expR>0 (min +0.213R); 6/7 t≥2.0.** Structure is legible: expR **rises with pctLen** (30→50→70) and **falls with slMult** (2.0→3.0). A **longer** percentile lookback (rarer, more-selective surges) and a **tighter** stop are strictly better — the center's `slMult=2.5` is mid-pack, and `pctLen=70` is the richer corner. No neighbour flips sign; the center sits on a broad positive plateau, not a spike.

## Best cell — `pctLen=70, pctThr=70, slMult=2.0` (with multiplicity caveat)

n=218, expR **+0.430R**, PF 2.195, Sharpe **1.624**, maxDD% 7.05, **t=2.810**, totRet 141.7% → CAGR ≈ **18.1%**, MAR ≈ **2.56**. **Caveat (27 cells):** with 27 draws, a single t≈2.81 is not extraordinary in isolation. But it is **not** a lone outlier — 25/27 cells clear t≥2.0 and the best cell sits at the corner the whole surface points to (high pctLen, low slMult), so the ranking is a *gradient*, not a fluke. Read the best cell as the honest top of a real, monotone surface — reserve the OOS run for it (or the center) later.

## KILL CRITERIA (verbatim, applied)

> **DEAD unless center-region expR after costs > 0 AND ≥40 IS trades at center AND best-cell t ≥ 2.0.**

- center-region expR after costs > 0 → **PASS** (center +0.296R; region mean +0.305R; all 7 region cells > 0).
- ≥40 IS trades at center → **PASS** (n = **198**).
- best-cell t ≥ 2.0 → **PASS** (best t = **2.810**; center itself t = 2.242).

All three pass → **SURVIVES.**

## Long vs short split (center cell)

| side | n | WR% | expR | net $ (of $10k start, compounding) |
|---|---|---|---|---|
| long | 109 | 49.5 | +0.347 | +5,083 |
| short | 89 | 48.3 | +0.234 | +2,317 |

**Both sides are positive** — a mild long tilt (expR 0.347 vs 0.234) but no dead leg. The short side carries real edge here (unlike many BTC systems), because entries fire on a *volatility* surge in the direction of the EMA20 trend and exit on vol normalisation, capturing the expansion move either way.

### Exit-reason mix (center): `atrPct<50` 139 · stop 47 · timestop 12

The design is **vol-normalisation-driven, not stop-driven**: 70% of trades exit because the ATR percentile falls back below 50 (the move matured), only ~24% get stopped, ~6% time out. This is why WR is high (49%) and losses are contained — the moving stop, which *tightens* as ATR contracts, clips losers below 1R (see worked example #2).

## Benchmark comparison

**vs C2 (campaign yardstick — daily TSMOM/Donchian).** C2 center Sharpe **0.93** / MAR **0.96**; C2 best-gated Sharpe **1.44** / MAR **2.56**. DT2 **beats C2 at both ends**: center Sharpe **1.29** / MAR **1.27** > C2 center; best-cell Sharpe **1.62** / MAR **2.56** ≥ C2 best-gated. DT2 also does it with **far more trades** (198 center vs 28) and a much shallower drawdown (−8.6% vs C2 center's −15.1%), so the significance rests on more independent events.

**vs DT1 (the 4h Trend Rider survivor).** DT1 center: expR **+0.896R**, Sharpe **1.30**, MAR **1.47**, n=75. DT2 center: expR **+0.296R**, Sharpe **1.29**, MAR **1.27**, n=198. DT2 is a **lower-per-trade-edge, higher-frequency** system with a near-identical Sharpe — it earns its keep through *count*, not per-trade size.

**Correlation with DT1 — complementary, not redundant.** Weekly summed-R of the two center ledgers (`dt1_trades_center.csv` vs `dt2_trades_center.csv`), aligned across 186 union weeks with 38 both-active weeks: **Pearson = −0.003** (essentially zero). DT2 is a **different edge** (vol-percentile mean-reversion of the expansion move) from DT1 (EMA-cross trend), so the two are **strong diversifiers** — a blended book would cut variance materially. This is the more valuable read than either alone.

## Worked examples (hand-traced, real timestamps, center cell 50/80/2.5)

**Example 1 — short, `atrPct<50` exit, +4.89R (the vol-normalisation winner).**
- **Signal bar** closes 2019-09-23 20:00 UTC: `atrPct` crossed above pctThr=80 (vol surge) and `close < EMA20` → short. `entryRef = 9701.96` (signal-bar close). `atr_signal ≈ 127.43` → initial stop distance `2.5×127.43 = 318.58`; initial stop `9701.96 + 318.58 = 10,020.5`.
- **Entry** fills at the open of 2019-09-24 00:00, adverse: `entry_fill = 9,699.16`. `size = $100 / 318.58 = 0.3139 BTC` (1% of $10k).
- **Held** as BTC sold off; `atr` rose then fell — the moving stop stayed above price, never touched. When `atrPct` dropped below 50 (vol normalised) the position market-closed at the 2019-09-29 04:00 open: `exit_fill = 8,131.79`.
- **P&L**: gross `0.3139×(9,699.16 − 8,131.79) = +$492.0`; fees `0.3139×(9,699.16+8,131.79)×0.0005 = $2.80`; **net +$489.18 → R = +4.89**. The `atrPct<50` exit is what banks the expansion move.

**Example 2 — short, MOVING-stop exit, −0.96R (loss < 1R because ATR contracted).**
- **Signal bar** closes 2019-10-23 12:00: surge + `close < EMA20` → short, `entryRef = 7,420.87`, `atr_signal ≈ 125.69` → initial stop distance 314.23, initial stop `7,735.10`.
- **Entry** at 2019-10-23 16:00 open, `entry_fill = 7,423.52`.
- Price ground back up; **ATR contracted**, so the moving stop **ratcheted down** from 7,735.10 to `entryRef + 2.5×atr_current = 7,715.39` (a *tighter* stop). Price tagged it intrabar on 2019-10-25 12:00: `exit_fill = 7,716.93` (at level, adverse).
- **P&L**: **net −$100.64 → R = −0.958** — a **sub-1R loss** precisely because the stop tightened as volatility fell. This is the faithful moving-stop behaviour flagged in the spec; a fixed-from-entry stop would have lost the full ~1R+.

*(Third exit type for completeness: 2020-01-03 16:00 long, `entryRef 7,316.01`, hit the maxBars=42 time stop on 2020-01-10 16:00 at 8,066.65 → net +$284.06, R = +2.76 — the time stop banks a runner that never triggered the vol-normalisation exit.)*

## PROOFS

- **Determinism** — trade ledger from two independent runs of `python3 backtests/bt_dt2_vol_surge.py`, byte-identical:
  - center ledger `dt2_trades_center.csv` md5 = `015b3829f9656119a7af82cef1e82b8d` (run 1) = `015b3829f9656119a7af82cef1e82b8d` (run 2)
  - best ledger `dt2_trades_best.csv` md5 = `682a2f4ef370b4af0dc45be4e9e122cc` (both runs)
  - grid `dt2_grid.csv` md5 = `17a0d2760fb76996797083e2bb653a39` (both runs)
- **py_compile** — `python3 -m py_compile backtests/bt_dt2_vol_surge.py` → clean (`PY_COMPILE_OK`).
- **Candle load / 2025 lockout** — 1m rows loaded = **2,795,040**; min = **2019-09-09 00:00:00+00:00**, max = **2024-12-31 23:59:00+00:00**; `any candle ≥ 2025-01-01 UTC = False`. Resampled to **11,646** 4h bars (min 2019-09-09 00:00, max 2024-12-31 20:00). The 2025+ out-of-sample block was never loaded or evaluated.
- **percentrank hand-check** — asserted `True` every run (`{3:33.3333, 4:100.0, 5:66.6667}` = expected).

## Artefacts

- Engine: `backtests/bt_dt2_vol_surge.py`
- Full 27-cell grid: `Strategy Codex/DaviddTech/backtests/dt2_grid.csv`
- Center ledger (198 trades): `Strategy Codex/DaviddTech/backtests/dt2_trades_center.csv`
- Best-cell ledger (218 trades): `Strategy Codex/DaviddTech/backtests/dt2_trades_best.csv`
- Machine stats: `backtests/_dt2_stats.json`
