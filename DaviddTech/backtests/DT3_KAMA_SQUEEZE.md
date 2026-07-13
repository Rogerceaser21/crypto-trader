✅ SURVIVES — center (32,0.20,2.8/5): +0.282R after costs over 242 IS trades, PF 1.56, Sharpe 1.10, t 2.10; center-region mean expR +0.293 (all 8 cells >0); best cell (24,0.20,2.4/4) t 2.56; all 36 grid cells have positive expR. CAVEAT: center t is fragile — one Oct-2019 fat-tail trade is 19% of total R and removing it drops center t to 1.85 (classic trend-follower tail dependence).

# DT3 — Flagship "KAMA + Squeeze" (KAMA Final Video Replication v1)

Causal, signal-only backtest of DaviddTech's own flagship-video replication.
**Source of truth:** `Strategy Codex/DaviddTech/research/pine/KFVR_v1_R1_rolling_tercile_regime_1h.pine` (Pine v6, 212 lines). **Engine:** `backtests/bt_dt3_kama_squeeze.py`.

The author's headline (PF 2.42 / Sharpe 1.5 / **+1451%** / 110 trades / 3y) is **selection-only context, not evidence.** The +1451% is a leverage illusion: 10× margin × vol-regime size multipliers up to 7.4×. We test the **signal** at honest sizing — flat 1%-equity risk vs the initial stop distance, **no leverage, no regime multipliers.** (Regime sizing exists in the source and is deliberately **not** tested.)

---

## Spec (frozen, derived line-by-line from the Pine)

- **Bars:** 1h, built from 1m closes (UTC hourly buckets). **Long-only.** All entry conditions on the **closed** bar `i`; fill at the **next 1m open = the 1h open of bar i+1** (causal).
- **KAMA** (Pine 58–70): efficiencyLength `L` (gridded), fast 2, slow 50. `ER = |close−close[L]| / Σ|Δclose|_L`; `SC=(ER·(2/3−2/51)+2/51)²`; `kama = kama[1] + SC·(close−kama[1])` (recursive, seed=close₀); `kamaRising = kama>kama[1]`.
- **Squeeze** (Pine 72–92), length 16: BB = sma(close,16) ± 2.0·**stdev(close,16)** [Pine `biased=true` ⇒ **population** stdev]; KC = sma(close,16) ± 1.5·**sma(ta.tr,16)** [SMA of TrueRange, *not* ATR]. `squeezeOn = BB fully inside KC`. `squeezeReleased = squeezeOn[1] and count[1]≥2 and not squeezeOn`.
- **Momentum** (Pine 93–94): `src = close − avg(avg(highest(high,16),lowest(low,16)), sma(close,16))`; `momentum = ta.linreg(src,16,0)` (OLS endpoint / LSMA value at the current bar).
- **Entry gate:** squeezeReleased ∧ momentum>0 ∧ momentum>momentum[1] ∧ close>kama ∧ kamaRising ∧ ER>minEff ∧ atr>0, **flat only** (pyramiding 0).
- **Exits:** `initialStop = close[i] − initMult·ATR14[i]` **frozen** for the life of the trade, tested **intrabar on 1m lows** (1m tie-break), filled at level with adverse slip, **ambiguous = LOSS**. Close-based **trail** `trailLevel = max(trailLevel, close[j] − trailMult·ATR14[j])` (ratchets up only) → `trailExit` when `close ≤ trailLevel`. **Forced exit** when `close<kama ∧ momentum<0` (priority over trail). Trail/forced are close-based and fill at the next 1m open (as Pine).
- **Sizing:** flat 1%-of-(compounding)-equity risk vs the initial stop distance `initMult·ATR14[i]`. No leverage, no regime multiplier.
- **Costs:** 0.05% fee/side, 0.02% slippage/fill, $10k start (identical to DT1/DT2 & `bt_engine.py`).

---

## Declared grid — 36 cells (fixed BEFORE any result)

`efficiencyLength {24, 32, 48}` × `minEff {0.15, 0.20, 0.25}` × `(initialStop, trail) {(2.4,4), (2.8,5), (3.2,5), (2.8,4)}` = **3 × 3 × 4 = 36**. Pine defaults **(32, 0.20, (2.8,5)) = CENTER**. No other cells, no post-hoc additions.

All 36 declared cells: {24,32,48}×{0.15,0.20,0.25}×{2.4/4, 2.8/5, 3.2/5, 2.8/4} — every combination is run and reported below.

---

## Full results — all 36 cells (IS 2019-09-09 → 2024-12-31 minus warmup)

| effLen | minEff | stop | trail | n | WR% | expR | PF | Sharpe | maxDD% | t |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 24 | 0.15 | 2.4 | 4 | 389 | 32.6 | 0.232 | 1.42 | 1.04 | 17.4 | 2.08 |
| 24 | 0.15 | 2.8 | 4 | 387 | 33.1 | 0.192 | 1.39 | 0.98 | 16.5 | 1.96 |
| 24 | 0.15 | 2.8 | 5 | 387 | 33.1 | 0.202 | 1.41 | 1.03 | 16.4 | 2.05 |
| 24 | 0.15 | 3.2 | 5 | 386 | 33.2 | 0.159 | 1.35 | 0.91 | 16.1 | 1.81 |
| 24 | 0.20 | 2.4 | 4 | 313 | 36.1 | 0.337 | 1.63 | 1.30 | 14.5 | **2.56** ◄best |
| 24 | 0.20 | 2.8 | 4 | 311 | 36.7 | 0.287 | 1.60 | 1.26 | 13.2 | 2.48 |
| 24 | 0.20 | 2.8 | 5 | 311 | 36.7 | 0.299 | 1.63 | 1.30 | 13.2 | 2.56 |
| 24 | 0.20 | 3.2 | 5 | 311 | 36.7 | 0.241 | 1.55 | 1.19 | 12.4 | 2.34 |
| 24 | 0.25 | 2.4 | 4 | 256 | 37.1 | 0.362 | 1.69 | 1.22 | 14.9 | 2.44 |
| 24 | 0.25 | 2.8 | 4 | 254 | 37.8 | 0.309 | 1.66 | 1.20 | 13.7 | 2.38 |
| 24 | 0.25 | 2.8 | 5 | 254 | 37.8 | 0.324 | 1.69 | 1.25 | 13.7 | 2.46 |
| 24 | 0.25 | 3.2 | 5 | 254 | 37.8 | 0.265 | 1.62 | 1.15 | 12.9 | 2.28 |
| 32 | 0.15 | 2.4 | 4 | 327 | 31.8 | 0.222 | 1.39 | 0.90 | 16.7 | 1.79 |
| 32 | 0.15 | 2.8 | 4 | 322 | 32.6 | 0.199 | 1.39 | 0.91 | 14.5 | 1.79 |
| 32 | 0.15 | 2.8 | 5 | 322 | 32.6 | 0.211 | 1.42 | 0.96 | 14.3 | 1.87 |
| 32 | 0.15 | 3.2 | 5 | 318 | 33.0 | 0.179 | 1.39 | 0.91 | 13.3 | 1.78 |
| 32 | 0.20 | 2.4 | 4 | 243 | 32.5 | 0.324 | 1.57 | 1.11 | 13.5 | 2.11 |
| 32 | 0.20 | 2.8 | 4 | 242 | 33.1 | 0.266 | 1.53 | 1.04 | 12.2 | 2.01 |
| **32** | **0.20** | **2.8** | **5** | **242** | **33.1** | **0.282** | **1.56** | **1.10** | **12.1** | **2.10** ◄**CENTER** |
| 32 | 0.20 | 3.2 | 5 | 240 | 33.3 | 0.229 | 1.50 | 1.00 | 11.3 | 1.92 |
| 32 | 0.25 | 2.4 | 4 | 177 | 32.8 | 0.357 | 1.63 | 1.06 | 13.0 | 2.04 |
| 32 | 0.25 | 2.8 | 4 | 176 | 33.5 | 0.294 | 1.58 | 0.99 | 12.2 | 1.94 |
| 32 | 0.25 | 2.8 | 5 | 176 | 33.5 | 0.294 | 1.58 | 0.99 | 12.2 | 1.94 |
| 32 | 0.25 | 3.2 | 5 | 175 | 33.7 | 0.231 | 1.49 | 0.88 | 10.6 | 1.71 |
| 48 | 0.15 | 2.4 | 4 | 250 | 30.4 | 0.389 | 1.66 | 1.20 | 13.2 | 2.17 |
| 48 | 0.15 | 2.8 | 4 | 244 | 32.4 | 0.363 | 1.70 | 1.25 | 11.5 | 2.26 |
| 48 | 0.15 | 2.8 | 5 | 243 | 32.1 | 0.385 | 1.74 | 1.31 | 11.5 | 2.36 |
| 48 | 0.15 | 3.2 | 5 | 240 | 32.5 | 0.340 | 1.72 | 1.29 | 10.4 | 2.34 |
| 48 | 0.20 | 2.4 | 4 | 187 | 30.5 | 0.446 | 1.79 | 1.14 | 14.8 | 2.01 |
| 48 | 0.20 | 2.8 | 4 | 183 | 32.2 | 0.411 | 1.82 | 1.17 | 12.1 | 2.07 |
| 48 | 0.20 | 2.8 | 5 | 182 | 31.9 | 0.440 | 1.87 | 1.24 | 11.8 | 2.18 |
| 48 | 0.20 | 3.2 | 5 | 180 | 32.2 | 0.384 | 1.83 | 1.21 | 9.1 | 2.13 |
| 48 | 0.25 | 2.4 | 4 | 135 | 30.4 | 0.445 | 1.78 | 0.95 | 18.2 | 1.63 |
| 48 | 0.25 | 2.8 | 4 | 130 | 33.1 | 0.477 | 1.98 | 1.11 | 13.0 | 1.91 |
| 48 | 0.25 | 2.8 | 5 | 130 | 32.3 | 0.512 | 2.05 | 1.18 | 12.6 | 2.02 |
| 48 | 0.25 | 3.2 | 5 | 128 | 32.8 | 0.460 | 2.04 | 1.18 | 11.5 | 2.02 |

**Every one of the 36 cells has positive expR** (range +0.159 to +0.512). t-stat range 1.63–2.56; **20 of 36 cells have t ≥ 2.0.** Low win rate (30–38%) with positive expectancy and PF 1.35–2.05 = a textbook trend-follower payoff shape (few large winners, many small losers).

---

## KILL CRITERIA (verbatim) & verdict

> **DEAD unless center-region expR after costs > 0 AND ≥40 IS trades at center AND best-cell t ≥ 2.0.**

| Criterion | Threshold | Actual | Pass |
|---|---|---|---|
| Center-region expR after costs | > 0 | **+0.293** (mean of 8 cells, all >0) | ✅ |
| IS trades at center | ≥ 40 | **242** | ✅ |
| Best-cell t | ≥ 2.0 | **2.56** (cell 24,0.20,2.4/4) | ✅ |

All three met → **✅ SURVIVES.**

**Fragility caveat (mandatory read):** center total = 68.1R over 242 trades. The **single largest trade contributes 13.06R = 19.2%** of the total, and the top-3 contribute 44.9%. Excluding just the biggest winner drops center expR 0.282→0.229 and **center t 2.10→1.85 (below 2.0).** The center cell's significance is tail-dependent. The best cell (n=313, t=2.56) and the eff48 cells (PF up to 2.05) are more robust, but the whole family shares the same "edge lives in the right tail" character. This is real trend-following behaviour, not a bug — but position it as a **fat-tail bet**, not a steady-grind edge.

---

## Center-region analysis

Center + one-grid-step neighbours on each axis (8 cells):

| cell (effLen,minEff,stop/trail) | n | expR | PF | Sharpe | t |
|---|---:|---:|---:|---:|---:|
| **(32,0.20,2.8/5) center** | 242 | 0.282 | 1.56 | 1.10 | 2.10 |
| (24,0.20,2.8/5) | 311 | 0.299 | 1.63 | 1.30 | 2.56 |
| (48,0.20,2.8/5) | 182 | 0.440 | 1.87 | 1.24 | 2.18 |
| (32,0.15,2.8/5) | 322 | 0.211 | 1.42 | 0.96 | 1.87 |
| (32,0.25,2.8/5) | 176 | 0.294 | 1.58 | 0.99 | 1.94 |
| (32,0.20,2.4/4) | 243 | 0.324 | 1.57 | 1.11 | 2.11 |
| (32,0.20,3.2/5) | 240 | 0.229 | 1.50 | 1.00 | 1.92 |
| (32,0.20,2.8/4) | 242 | 0.267 | 1.53 | 1.04 | 2.01 |
| **mean expR** | | **+0.293** | | | |

The region is uniformly positive and low-dispersion (expR 0.21–0.44). expR **rises with effLen** (smoother KAMA = more selective, fewer but larger-edge trades) and **rises with minEff** (tighter efficiency gate). Sensible monotonic behaviour — no cliffs.

**Best cell & multiplicity caveat.** Best by max-t = **(24, 0.20, 2.4/4)**: n=313, expR +0.337, PF 1.63, Sharpe 1.30, maxDD 14.5%, **t 2.56**, CAGR 20.6%, MAR 1.42. With **36 cells selected by max-t**, a single best-cell t must be discounted for multiple comparisons (expected max under noise is inflated). Mitigants: (a) its neighbour (24,0.20,2.8/5) is essentially tied at t=2.56, so "best" is a plateau not a spike; (b) all 36 cells are positive; (c) the center itself passes. Do not read the best cell as the deployable config — read the **whole positive surface**.

---

## Exit-mix at center (242 trades)

| exit type | count | share | mechanics |
|---|---:|---:|---|
| forced (close<kama ∧ mom<0) | 169 | 69.8% | dominant — momentum/trend flip, fills next 1m open |
| initial stop (intrabar, 1m) | 71 | 29.3% | −1R-ish loss cutter, ambiguous=LOSS |
| trail (close ≤ 5·ATR trail) | 2 | 0.8% | rarely binds — the 5×ATR ratchet is very wide, so the forced exit almost always fires first |
| eod | 0 | 0.0% | — |

The forced momentum exit is the engine of this system; the 5×ATR trail is nearly vestigial at the tested multipliers (this is faithful to the Pine — the momentum-flip exit structurally pre-empts the wide trail).

---

## Benchmark comparison

**vs C2** (the campaign's Krown reference): C2 center Sharpe **0.93** / MAR **0.96**; C2 best-gated Sharpe **1.44** / MAR **2.56**.
DT3 center Sharpe **1.10** / MAR **1.07** — **beats C2 at center on both.** DT3 best Sharpe **1.30** / MAR **1.42** — below C2's gated-best (1.44 / 2.56). So DT3's *default* config is stronger than C2's default, but C2's optimised-gated config still has the higher risk-adjusted ceiling.

**vs sibling DaviddTech tests** (same engine, same costs, same window):
- **DT1** (4h Trend Rider): +0.896R, Sharpe 1.30 — higher per-trade edge; DT3 is lower-R (+0.28) but trades ~2× as often (242 vs DT1 ledger) at a comparable Sharpe.
- **DT2** (4h Vol-Surge): +0.296R, Sharpe 1.29, n=198 — DT3 (+0.282R, Sharpe 1.10, n=242) is the closest sibling in per-trade edge and shares its low-WR/fat-tail profile.

**Weekly-R correlation (center ledger vs siblings' center ledgers):**
- vs DT1: Pearson **−0.013** (47 overlapping active weeks) — effectively **uncorrelated**; different return stream.
- vs DT2: Pearson **+0.224** (96 overlapping active weeks) — **mildly positive** (both are volatility/breakout-flavoured, both long BTC). Useful but not redundant diversification.

---

## Worked examples (real timestamps, hand-traced)

**Example A — big winner, forced exit (Oct-2019 pump).** Signal bar 1114 = **2019-10-25 11:00 UTC**; all gates true on the closed bar (squeezeReleased ✓, momentum>0 ✓ & rising ✓, close>kama ✓, kamaRising ✓, ER>0.20 ✓). Enter at **open of bar 1115 = 2019-10-25 12:00**, entry_ref 7569.24, fill 7570.75 (+slip). initialStop = 7569.24 − 2.8·ATR = 7439.20 (dist 129.79 → size = $99.84 / 129.79 = 0.769 BTC). BTC then ran to ~9500 (the China/Xi blockchain-endorsement pump). Forced-exit condition (close<kama ∧ momentum<0) first true on **bar 1140 = 2019-10-26 12:00**; exit fills at **open of bar 1141 = 2019-10-26 13:00 = 9275.52**. Net **+1303.42 → +13.06R.** Fully causal (verified: entry indicators use only ≤bar 1114; forced flag confirmed on bar 1140; exit_ref == open[1141]).

**Example B — initial stop, loss.** Signal 2019-11-10 16:00 → enter **2019-11-10 17:00** at 9025.37 (ref 9023.57). initialStop = 9023.57 − 2.8·ATR = 8833.80 (dist 189.79, size 0.592 BTC). Price fell intrabar; 1m low breached 8833.80 during **bar 1517 = 2019-11-11 05:00**; exit at the stop with adverse slip 8832.04. Net **−119.67 → −1.066R** (slightly worse than −1R because of fees + slippage on both fills; this is the ambiguous-=-LOSS / adverse-fill discipline).

---

## KAMA / Squeeze hand-check (re-derivable)

Five consecutive real bars, **2020-03-06 04:00–08:00 UTC** (1h), efficiencyLength 32. A reviewer can recompute each column from raw candles:

| bar | time | close | ER(32) | KAMA(32) | rising | bb_basis=sma(c,16) | bb_dev=2·stdev(c,16) | kc_width=1.5·sma(tr,16) | bb_up | kc_up | squeezeOn | count | momentum |
|---:|---|---:|---:|---:|:--:|---:|---:|---:|---:|---:|:--:|---:|---:|
| 4300 | 04:00 | 9054.40 | 0.3362 | 9005.33 | ✓ | 9077.39 | 79.544 | 86.189 | 9156.93 | 9163.58 | ✓ | 5 | −55.393 |
| 4301 | 05:00 | 9114.99 | 0.3614 | 9013.09 | ✓ | 9078.97 | 81.442 | 89.898 | 9160.41 | 9168.87 | ✓ | 6 | −45.209 |
| 4302 | 06:00 | 9102.90 | 0.3345 | 9018.66 | ✓ | 9083.35 | 78.533 | 85.950 | 9161.88 | 9169.30 | ✓ | 7 | −44.394 |
| 4303 | 07:00 | 9107.48 | 0.3317 | 9024.10 | ✓ | 9084.21 | 79.266 | 83.569 | 9163.47 | 9167.78 | ✓ | 8 | −35.516 |
| 4304 | 08:00 | 9122.00 | 0.2649 | 9028.23 | ✓ | 9086.05 | 81.297 | 82.610 | 9167.34 | 9168.66 | ✓ | 9 | −24.946 |

Worked check on bar 4300: `squeezeOn` ⇔ `bb_up < kc_up ∧ bb_lo > kc_lo` ⇔ `bb_dev < kc_width` ⇔ `79.544 < 86.189` = **true** (squeeze building, count 5). KAMA rising (9005.33 > prior). This stretch is squeeze-ON, so **not** an entry (entry needs squeezeReleased = on→off). momentum is negative here (price below the mid/sma composite) — also blocks entry — illustrating the gate correctly filtering a squeeze-build phase.

**Independent verification** (`bt_dt3_kama_squeeze.py` vectorised engine vs a from-scratch loop recompute over bars 4300–4304): max abs diff — KAMA **0.0**, BB-dev **4.5e-10**, KC-width **0.0**, momentum **6.6e-13**. Indicators reproduce to floating-point precision. The linreg convention is unit-tested in `_handcheck_linreg()` (constant→constant, linear ramp→endpoint value, manual OLS match).

---

## PROOFS

- **py_compile:** `python3 -m py_compile backtests/bt_dt3_kama_squeeze.py` → **OK (exit 0)**.
- **Determinism (two independent runs):** center-ledger md5 run1 = run2 = **`ed997d825ab0bb073dacaeaebc7a9aeb`** (identical). best md5 **`6f25c9bea79dd78924a4d6393bfa0864`**; grid md5 **`5600f20e988cc67a422d0229f014c394`**.
- **2025 lockout:** 1m candles loaded **2,795,040**, min **2019-09-09 00:00:00+00:00**, max **2024-12-31 23:59:00+00:00**; `any_2025 = False`. 1h bars **46,584**, min 2019-09-09 00:00, max **2024-12-31 23:00 UTC**. No 2025+ candle enters the run.
- **Causal-fill audit:** 0/242 center trades violate `entry_bar == sig_bar+1` and `entry_ref == 1h_open[sig_bar+1]`.
- **Linreg unit check:** const→7.0, ramp-end→9.0, manual-OLS 5.6 == engine 5.6.

## Files

- Engine: `backtests/bt_dt3_kama_squeeze.py`
- Report: `Strategy Codex/DaviddTech/backtests/DT3_KAMA_SQUEEZE.md`
- Ledgers: `Strategy Codex/DaviddTech/backtests/dt3_trades_center.csv`, `dt3_grid.csv` (36 cells), `dt3_trades_best.csv`
- Stats dump: `backtests/_dt3_stats.json`
