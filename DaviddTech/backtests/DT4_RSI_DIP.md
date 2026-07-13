✅ SURVIVES (marginal / fragile) — center (18,40,300): +0.512R after costs over 75 IS trades, PF 2.25, Sharpe 1.07, but center t = **1.93 (<2)**; passes the pre-registered kill-gate only because best-cell (14,35,200) t = **2.040** clears the 2.0 bar by a whisker and it is the *max over 27 cells*. Cost-robust (survives 0.01→0.03% slip, t 2.00→1.87) — the one place every dead Krown 1m/15m scalp failed — because it holds ~51 bars (≈13 h), i.e. it is a swing system on 15m candles, not a scalp. HEAVY caveats: extreme right-tail dependence (1 trade = 30% of center R, top-3 = 68%; drop the top winner and t → 1.63), chandelier-width fragility (at 3.5× the edge nearly vanishes: expR 0.15, t 0.96), and the trendLen "trend filter" is nearly inert (DMI/ADX gate dominates). DD-halt ablation is a no-op (max equity DD 8.1% never reaches the 12% trigger).

# DT4 — "RSI Dip-Recovery in Uptrend" (策略667 15分钟稳健高仓位版, "Strategy 667, 15m")

Causal, signal-only backtest of a DaviddTech library strategy — the campaign's **low-timeframe test.** Every Krown 1m/15m scalp died on the cost floor; the skeptical prior was that a "15m" DaviddTech strategy dies there too. It does not — but only because it is not actually a scalp.

**Source of truth:** `Strategy Codex/DaviddTech/research/pine/667_15.pine` (Pine v5, 56 lines). **Engine:** `backtests/bt_dt4_rsi_dip.py`. The 1h sibling `667.pine` is a **robustness reference only** (one comparison line at the end; center-equivalent params on 1h; no grid).

The author's headline (**PF 2.96 / +36% / DD 4% / 72 trades / 6y**) is **selection-only context, not evidence and not a target.** We test the signal at honest sizing (flat 1%-equity risk vs the initial stop distance), with the source's **fitted quirks stripped** from the base run: the 50–80% minimum/maximum-exposure floor and the account-drawdown halt are both removed (the halt is re-tested separately as a mandatory ablation).

---

## Spec (frozen, derived line-by-line from `667_15.pine`)

- **Bars:** 15m, built from 1m closes (UTC 15-minute buckets). **Long-only, flat only** (pyramiding 0). All entry conditions on the **closed** bar `i`; fill at the **next 1m open = the 15m open of bar i+1** (causal, no look-ahead).
- **Indicators:** `trendEma = ta.ema(close, trendLen)`; `rsi = ta.rsi(close, rsiLen)` (Wilder RMA, SMA seed); `[+DI, −DI, ADX] = ta.dmi(diLen=48, adxSmooth=42)`; `atr = ta.atr(44)` (Wilder RMA of TrueRange).
- **Entry gate** (Pine line 38): `enoughHistory` (bar_index > max(trendLen, dipLookback, diLen+adxSmooth, atrLen)) ∧ `ta.crossover(rsi, recoverLevel=45)` ∧ `ta.lowest(rsi, dipLookback=4) < dipLevel` ∧ `close > trendEma` ∧ `+DI > −DI` ∧ `ADX > 20`.
- **Exits — moving stop** (Pine 43–51). While in position, each bar j: `highestSinceEntry := max(highestSinceEntry, high[j])` (includes the entry bar's high); `initialStop_j = entry_price − 3.0·atr[j]`; `chandelierStop_j = highestSinceEntry_j − 4.5·atr[j]`; `stop_j = max(initialStop_j, chandelierStop_j)`. **Pine re-evaluates BOTH legs with the CURRENT bar's atr every bar → a moving stop** (entry_price fixed; atr and highestSinceEntry vary). Replicated faithfully. **Causality:** the stop computed at the close of bar j−1 is the level tested **intrabar on 1m lows during bar j**; no stop is active on the entry bar itself (Pine places the first stop at the entry bar's close → tested from the next bar). Stop fill = **at the level with adverse slippage**; if the first touching 1m bar **gaps through** the level (its open already ≤ level) the fill is that worse open — never favourable → **ambiguous / gap = LOSS.**
- **Sizing (base):** flat 1%-of-(compounding)-equity risk vs the **initial** stop distance `3.0·atr[i]`. `size = 0.01·equity / (3.0·atr[i])`. **Stripped:** `qty = max(minQty, min(riskQty, maxQty))` exposure floor → base uses `riskQty` only.
- **Stripped from base:** the account-drawdown halt (re-tested in the ablation below).
- **Costs:** 0.05% fee/side, 0.02% slippage/fill (base), $10k start — identical to DT1/DT2/DT3 & `bt_engine.py`. **Sharpe** annualised at 4·24·365 = 35 040 15m bars/yr.

---

## Declared grid — 27 cells (fixed BEFORE any result)

`rsiLen {14, 18, 22}` × `dipLevel {35, 40, 45}` × `trendLen {200, 300, 400}` = **3 × 3 × 3 = 27.** Pine defaults **(18, 40, 300) = CENTER.** Fixed across the grid: recoverLevel 45, dipLookback 4, DMI(48,42), ADX>20, ATR44, initial stop 3.0×, chandelier 4.5×. **Chandelier {3.5, 4.5, 5.5}** and **slippage {0.01%, 0.02%, 0.03%}** sensitivities are on the **center cell only.** No other cells, no post-hoc additions.

---

## Full results — all 27 cells (IS 2019-09-09 → 2024-12-31 minus warmup)

| rsiLen | dipLevel | trendLen | n | WR% | expR | PF | Sharpe | maxDD% | t |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 14 | 35 | 200 | 39 | 48.7 | 0.802 | 3.15 | 1.13 | 8.3 | **2.04** ◄best |
| 14 | 35 | 300 | 39 | 48.7 | 0.802 | 3.15 | 1.13 | 8.3 | 2.04 |
| 14 | 35 | 400 | 39 | 48.7 | 0.802 | 3.15 | 1.13 | 8.3 | 2.04 |
| 14 | 40 | 200 | 172 | 36.0 | 0.062 | 1.12 | 0.23 | 27.8 | 0.49 |
| 14 | 40 | 300 | 169 | 36.7 | 0.075 | 1.15 | 0.27 | 26.6 | 0.58 |
| 14 | 40 | 400 | 165 | 37.0 | 0.095 | 1.19 | 0.34 | 26.0 | 0.72 |
| 14 | 45 | 200 | 337 | 34.1 | 0.017 | 1.03 | 0.08 | 30.3 | 0.20 |
| 14 | 45 | 300 | 335 | 34.3 | 0.020 | 1.04 | 0.10 | 29.8 | 0.23 |
| 14 | 45 | 400 | 329 | 34.7 | 0.034 | 1.07 | 0.17 | 29.5 | 0.38 |
| 18 | 35 | 200 | 9 | 55.6 | 0.435 | 1.98 | 0.36 | 3.7 | 0.79 |
| 18 | 35 | 300 | 9 | 55.6 | 0.435 | 1.98 | 0.36 | 3.7 | 0.79 |
| 18 | 35 | 400 | 9 | 55.6 | 0.435 | 1.98 | 0.36 | 3.7 | 0.79 |
| **18** | **40** | **300** | **75** | **49.3** | **0.512** | **2.25** | **1.07** | **8.1** | **1.93** ◄**CENTER** |
| 18 | 40 | 200 | 75 | 49.3 | 0.512 | 2.25 | 1.07 | 8.1 | 1.93 |
| 18 | 40 | 400 | 75 | 49.3 | 0.512 | 2.25 | 1.07 | 8.1 | 1.93 |
| 18 | 45 | 200 | 263 | 35.7 | 0.046 | 1.09 | 0.21 | 24.2 | 0.45 |
| 18 | 45 | 300 | 260 | 36.2 | 0.054 | 1.11 | 0.24 | 23.7 | 0.52 |
| 18 | 45 | 400 | 254 | 36.6 | 0.075 | 1.15 | 0.33 | 22.2 | 0.71 |
| 22 | 35 | 200 | 1 | 0.0 | −1.230 | 0.00 | −0.59 | 1.2 | — |
| 22 | 35 | 300 | 1 | 0.0 | −1.230 | 0.00 | −0.59 | 1.2 | — |
| 22 | 35 | 400 | 1 | 0.0 | −1.230 | 0.00 | −0.59 | 1.2 | — |
| 22 | 40 | 200 | 37 | 45.9 | 0.259 | 1.65 | 0.45 | 11.2 | 1.03 |
| 22 | 40 | 300 | 37 | 45.9 | 0.259 | 1.65 | 0.45 | 11.2 | 1.03 |
| 22 | 40 | 400 | 37 | 45.9 | 0.259 | 1.65 | 0.45 | 11.2 | 1.03 |
| 22 | 45 | 200 | 175 | 38.3 | 0.067 | 1.13 | 0.24 | 19.0 | 0.48 |
| 22 | 45 | 300 | 175 | 38.3 | 0.070 | 1.14 | 0.25 | 18.5 | 0.50 |
| 22 | 45 | 400 | 170 | 38.8 | 0.088 | 1.17 | 0.31 | 17.3 | 0.62 |

**Structure of the surface (read this before the verdict):**
1. **`trendLen` is nearly inert.** Across 200/300/400 the trade set is often *identical* (e.g. every (14,35,·) cell = n 39, expR 0.802; every (18,40,·) = n 75, expR 0.512). The DMI(48,42)/ADX>20 + deep-RSI-dip gate is so restrictive that `close > EMA(trendLen)` is almost never the binding constraint. **The 27 cells collapse to ≈9 distinct (rsiLen × dipLevel) trade sets** — the effective multiple-comparison count is far below 27, and the "trend filter" the strategy is named for barely does anything.
2. **The edge lives in the deep-dip, low-count corner.** `dipLevel = 35–40` with `rsiLen 14–18` gives expR 0.26–0.80; **`dipLevel = 45` (shallow dip) collapses expR to +0.02…+0.09** — every one of those 9 cells is a hair above the cost floor with maxDD 17–30%. This is a "buy genuine RSI capitulation inside an uptrend" system; demand only a shallow dip and it dies.
3. **Every non-degenerate cell is positive** (23/27 have expR > 0; the exceptions are the two n=1 degenerate (22,35,·) cells). But only the (14,35) trade set clears t ≥ 2.

---

## Sensitivity — center cell (18, 40, 300)

**Chandelier ATR multiple** (initial-stop 3.0× fixed):

| chandelier | n | WR% | expR | PF | Sharpe | maxDD% | t |
|---:|---:|---:|---:|---:|---:|---:|---:|
| 3.5 | 76 | 43.4 | 0.146 | 1.39 | 0.42 | 8.9 | 0.96 |
| **4.5 (default)** | 75 | 49.3 | **0.512** | 2.25 | 1.07 | 8.1 | **1.93** |
| 5.5 | 74 | 54.1 | 0.616 | 2.46 | 1.10 | 6.9 | 2.27 |

**This is the single biggest fragility.** At a plausible tighter trail (3.5×) the edge nearly vanishes (expR 0.15, t 0.96) — the tighter chandelier whipsaws the position out before the rare fat winner develops. The default 4.5× sits on the favourable side of a steep gradient, and 5.5× is better still. The entire edge is "a wide trail that lets the right tail run."

**Slippage** (±50% around the 0.02% base):

| slippage | n | WR% | expR | PF | Sharpe | maxDD% | t |
|---:|---:|---:|---:|---:|---:|---:|---:|
| 0.01% | 75 | 49.3 | 0.529 | 2.32 | 1.11 | 7.7 | 2.00 |
| **0.02% (base)** | 75 | 49.3 | 0.512 | 2.25 | 1.07 | 8.1 | 1.93 |
| 0.03% | 75 | 48.0 | 0.494 | 2.18 | 1.03 | 8.4 | 1.87 |

**Cost-robust — the notable positive.** Degradation is ~0.017R per 0.01% slip; expR stays > +0.49R and t > 1.87 across the whole band. **This is exactly where the Krown 1m/15m scalps died and DT4 does not** — because mean hold is **51.4 bars ≈ 12.8 h**, so the ~0.14% round-trip cost is trivial against a multi-R swing. The "15m" label is misleading: this is a half-day swing system that happens to time entries on 15m bars.

---

## DD-halt ablation (mandatory) — center cell, 12% account-drawdown halt ON

| config | n | WR% | expR | PF | Sharpe | maxDD% | totRet% | last exit |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| base (halt stripped) | 75 | 49.3 | 0.512 | 2.25 | 1.07 | 8.1 | 43.9 | 2024-11-12 |
| **+ 12% DD-halt ON** | 75 | 49.3 | 0.512 | 2.25 | 1.07 | 8.1 | 43.9 | 2024-11-12 |

**The halt is inert at the center: identical ledger (byte-for-byte).** The center's peak-to-trough mark-to-market equity drawdown is **8.1%**, which never reaches the 12% halt trigger, so `riskHalt` is never true across the full 2019–2024 history. The equity-feedback quirk therefore **adds nothing and costs nothing here.** (Faithful mechanics: `equityPeak` is monotone, so were the halt ever tripped while flat it would be a *ratchet* — equity can't recover with no open trade — and could permanently stop trading. That failure mode simply never fires at this configuration because the drawdown stays shallow.)

---

## KILL CRITERIA (verbatim) & verdict

> **DEAD unless center-region expR after costs > 0 AND ≥40 IS trades at center AND best-cell t ≥ 2.0.**

| Criterion | Threshold | Actual | Pass |
|---|---|---|---|
| Center-region expR after costs | > 0 | **+0.337** (mean of 7 cells) | ✅ |
| IS trades at center | ≥ 40 | **75** | ✅ |
| Best-cell t | ≥ 2.0 | **2.040** (cell 14,35,200) | ✅ (barely) |

All three met → **✅ SURVIVES** by the pre-registered rule. But it is the **weakest, most fragile survivor of the DT family**, and the pass is marginal on two of the three axes:

- **Center is itself sub-threshold: t = 1.93 < 2.0.** The gate is cleared only by the *best* cell, which is the max-t over the grid.
- **Best-cell t = 2.040 is a coin-flip pass.** It is the maximum over ≈9 effectively-distinct trade sets (trendLen inert), on just **n = 39** trades, and it clears 2.0 by 0.04. Under multiplicity this is not a robust rejection of the null.
- **Extreme right-tail dependence at center:** total 38.36R over 75 trades; the **single biggest trade = 11.44R = 29.8%** of the total, **top-3 = 67.6%.** Removing the top winner drops expR 0.512→0.364 and **t 1.93→1.63**; removing the top-3 drops expR→0.173 and **t→0.95.** The edge is a fat-tail bet, not a steady grind. (Mitigant: expR stays positive even after excising the 3 biggest winners, and trades are spread evenly across all six years — 9–17/yr — so this is a genuine fat-right-tail distribution, not a single-regime artifact.)

**Position it as:** a real but marginal, wide-trail, fat-tail long-only edge that clears the pre-registered bar on the letter, not with conviction.

---

## Center-region analysis

Center + one-grid-step neighbours on each axis (7 cells):

| cell (rsiLen, dipLevel, trendLen) | n | expR | PF | Sharpe | t |
|---|---:|---:|---:|---:|---:|
| **(18,40,300) center** | 75 | 0.512 | 2.25 | 1.07 | 1.93 |
| (14,40,300) | 169 | 0.075 | 1.15 | 0.27 | 0.58 |
| (22,40,300) | 37 | 0.259 | 1.65 | 0.45 | 1.03 |
| (18,35,300) | 9 | 0.435 | 1.98 | 0.36 | 0.79 |
| (18,45,300) | 260 | 0.054 | 1.11 | 0.24 | 0.52 |
| (18,40,200) | 75 | 0.512 | 2.25 | 1.07 | 1.93 |
| (18,40,400) | 75 | 0.512 | 2.25 | 1.07 | 1.93 |
| **mean expR** | | **+0.337** | | | |

The region is uniformly positive (min +0.054) but **highly dispersed** and **the center is a local peak, not a plateau.** Two of the three axis-neighbours that actually change the trade set — (14,40,300) at expR 0.075 and (18,45,300) at 0.054 — sit near the cost floor with 3–4× the drawdown. The region-mean +0.337 is dragged up by the three inert trendLen-twins of the center itself. Move one real step toward a shallower dip (dipLevel 40→45) or a noisier RSI (rsiLen 18→14) and expR falls ~7–10×. That is a sharp ridge, not a robust basin.

**Best cell & multiplicity caveat.** Best by max-t = **(14, 35, 200)**: n=39, WR 48.7%, expR +0.802, PF 3.15, Sharpe 1.13, maxDD 8.3%, **t 2.040**, CAGR ≈5.8%, MAR ≈0.70. Three cautions: (a) it is the **maximum** t over the grid, and (14,35,200)=(14,35,300)=(14,35,400) are the *same* trade set (trendLen inert), so "best" is one config counted three times, not three confirmations; (b) **n=39** — one fat winner swings its t; (c) it clears the 2.0 gate by 0.04. Do **not** read it as a deployable config — read the whole (deep-dip) ridge, and read it skeptically.

---

## Exit mix at center (75 trades)

| exit type | count | share | mechanics |
|---|---:|---:|---|
| moving stop (intrabar, 1m) | 75 | 100% | `max(entry−3·ATR, highestSinceEntry−4.5·ATR)`, re-evaluated each bar with current ATR; gap-through = worse fill; ambiguous = LOSS |

**Every trade exits on the moving stop** — there is no other exit in the Pine (no TP, no time stop, no opposite signal). Winners are stops that ratcheted *above* entry via the chandelier (realised R > 0, e.g. +1.45R in Example B); losers are the initial 3×ATR stop, cut to roughly −0.9R because the moving initial-stop drifts up slightly as ATR contracts. This is why the design *is* the chandelier width — see the sensitivity table.

---

## 1h sibling comparison (`667.pine` defaults, single run — reference only)

Center-equivalent params on 1h (trendLen 200, rsiLen 14, dipLevel 40, dipLookback 24, DMI 14/14, ATR 22, stops 2.5×/3.0×; no grid, no halt):

| | n | WR% | expR | PF | Sharpe | maxDD% | t |
|---|---:|---:|---:|---:|---:|---:|---:|
| 1h sibling | 33 | 51.5 | 0.394 | 2.21 | 0.71 | 5.5 | 1.27 |

**Same sign, same shape, even weaker significance.** The 1h sibling is positive with a PF (2.21) essentially matching the 15m center (2.25), which corroborates that the *sign* of the edge is not a 15m artifact. But n=33 and t=1.27 — it would **not** pass the kill gate on its own. Robustness read: the edge shows up on both timeframes but is low-n and sub-significant on both. Consistent, not strong.

---

## Benchmark & sibling comparison

**vs C2** (the campaign's Krown reference): C2 center Sharpe **0.93** / MAR **0.96**; C2 best-gated Sharpe **1.44** / MAR **2.56**.
DT4 center Sharpe **1.07** / MAR **0.88** — **beats C2's center on Sharpe**, marginally below on MAR. DT4 best (14,35,200) Sharpe **1.13** / MAR **0.70** — below C2's gated ceiling on both. So DT4's default config edges C2's default on risk-adjusted return but, unlike DT3, does **not** approach C2's optimised-gated ceiling.

**vs sibling DaviddTech tests** (same engine, costs, window):
- **DT1** (4h Trend Rider): +0.896R, Sharpe 1.30 — higher per-trade edge and firmer significance.
- **DT2** (4h Vol-Surge): +0.296R, Sharpe 1.29, n=198 — lower R than DT4 but far more trades and steadier.
- **DT3** (1h KAMA+Squeeze): +0.282R, Sharpe 1.10, n=242 — closest sibling in Sharpe; DT4 has a higher per-trade edge (+0.51R) but on **⅓ the trades (75 vs 242)** and with weaker significance.

**Weekly-R correlation (DT4 center ledger vs siblings' center ledgers):**
- vs **DT1**: Pearson **−0.018** (16 overlapping active weeks) — **uncorrelated.**
- vs **DT2**: Pearson **+0.015** (35 overlapping weeks) — **uncorrelated.**
- vs **DT3**: Pearson **+0.150** (51 overlapping weeks) — **mildly positive** (both long-only BTC trend/pullback). DT4 is the most diversifying of the four relative to DT1/DT2, but it trades too rarely (75 trades / 6 yr) to be a workhorse.

---

## Worked examples (real timestamps, hand-traced, fully causal)

**Example A — loss, moving stop (−0.91R).** Signal bar **2019-10-08 10:00 UTC**. On the closed signal bar: RSI path `[36.82, 41.96, 42.30, 48.94]` → `lowest(RSI,4)=36.82 < 40` ✓ (deep dip present) and `crossover(RSI,45)` ✓ (42.30 ≤ 45 < 48.94); ADX **29.96 > 20** ✓; +DI **26.54 > −DI 19.72** ✓; close **8197.05 > EMA₃₀₀ 8091.40** ✓. Enter at the **open of the next bar, 2019-10-08 10:15**, entry_ref 8197.16, fill 8198.80 (+slip). Initial stop distance = 3·ATR(30.76) = 92.29 → size 1.0835 BTC. First stop placed at the entry bar's close = 8105.41 (init) vs 8067.44 (chandelier) → 8105.41. Price chops sideways (highestSinceEntry frozen at 8205.06), the moving initial-stop drifts up as ATR eases, and the 1m low breaches it at **2019-10-08 20:30**; exit_ref 8124.57, fill 8122.94 (adverse). Net **−91.03 → −0.910R** (better than −1R because the moving stop rose from 8105 toward 8125). Causal: all gates use ≤ bar 2824; fill = open[2825]; stop tested only from bar 2826 on.

**Example B — win, chandelier trail (+1.45R).** Signal bar **2019-10-10 14:00 UTC**. RSI path `[34.73, 43.61, 43.62, 47.27]` → `lowest(RSI,4)=34.73 < 40` ✓, `crossover(RSI,45)` ✓ (43.62 ≤ 45 < 47.27); ADX **20.40 > 20** ✓ (barely); +DI **21.95 > −DI 20.84** ✓; close **8497.99 > EMA₃₀₀ 8327.20** ✓. Enter **2019-10-10 14:15**, ref 8497.99, fill 8499.69, stop dist 3·ATR(31.06)=93.18, size 1.0635. As price rises, `highestSinceEntry` ratchets 8498 → 8515 → 8525 → … and the chandelier (`high − 4.5·ATR`) climbs with it (8359 → 8378 → 8389 → …), eventually overtaking the flat initial stop. The trailing stop is hit at **2019-10-11 05:15**, exit_ref 8645.56 (**above entry**), fill 8643.83, net **+144.17 → +1.455R**, held 60 bars. This is the mechanism the whole edge depends on: a wide chandelier that stays out of the way until a real move, then locks in a multi-R exit.

---

## Indicator hand-check (re-derivable)

Five consecutive real 15m bars, **2019-11-03 05:00–06:00 UTC**, center params (rsiLen 18, trendLen 300). A reviewer can recompute each gate from raw candles:

| bar | time | close | EMA₃₀₀ | RSI | lowest(RSI,4) | +DI | −DI | ADX | ATR | close>EMA | +DI>−DI | ADX>20 |
|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|:--:|:--:|:--:|
| 5300 | 05:00 | 9247.80 | 9231.92 | 35.45 | 35.45 | 20.09 | 22.91 | 20.02 | 23.98 | ✓ | ✗ | ✓ |
| 5301 | 05:15 | 9259.00 | 9232.10 | 39.12 | 35.45 | 19.50 | 22.24 | 19.70 | 24.21 | ✓ | ✗ | ✗ |
| 5302 | 05:30 | 9264.95 | 9232.31 | 41.01 | 35.45 | 19.19 | 21.88 | 19.39 | 24.09 | ✓ | ✗ | ✗ |
| 5303 | 05:45 | 9265.00 | 9232.53 | 41.02 | 35.45 | 19.40 | 21.68 | 19.06 | 23.79 | ✓ | ✗ | ✗ |
| 5304 | 06:00 | 9260.32 | 9232.72 | 39.93 | 39.12 | 19.29 | 21.95 | 18.76 | 23.41 | ✓ | ✗ | ✗ |

**This stretch is a NON-entry** even though a deep dip (RSI 35.45 < 40) and `close > EMA` are both present: **−DI > +DI throughout** (downward directional pressure), so the DMI direction gate correctly blocks the long. It illustrates that the DMI/ADX gate — not the trend EMA — is the binding filter (bar 5301 also fails a crossover-45 requirement and, from bar 5301 on, ADX drops below 20). Faithful gate behaviour.

**Unit / independent checks** (in `bt_dt4_rsi_dip.py`):
- **RSI** (`_handcheck_rsi`): Wilder RSI(3) on a known 8-bar series reproduces a from-scratch hand-computation to < 1e-9 (e.g. bar 3 = 85.7143, bar 6 = 45.4054).
- **DMI** (`_handcheck_dmi`): on a clean monotone uptrend, +DI 68.85 > −DI 0.00, ADX 100 — correct degenerate limit.
- **ATR** (`_handcheck_atr`): vectorised ATR(44) vs an independent slow Wilder loop over 5 real bars — **max abs diff 0.0** (bit-identical).

---

## PROOFS

- **py_compile:** `python3 -m py_compile backtests/bt_dt4_rsi_dip.py` → **OK (exit 0).**
- **Determinism (two independent runs):** center-ledger md5 run1 = run2 = **`b47a1ef14a531af63b084e926646f3d8`** (identical). best md5 **`108fe22beb0dcdecaa62c6cf0278dd18`**; grid md5 **`6826c6ac67d24322ded1952c86ee9e76`** (both identical across the two runs). No RNG, no wall-clock.
- **2025 lockout:** 1m candles loaded **2,795,040**, min **2019-09-09 00:00:00+00:00**, max **2024-12-31 23:59:00+00:00**; `any_2025 = False`. 15m bars **186,336** (max 2024-12-31 23:45 UTC); 1h bars **46,584** (max 2024-12-31 23:00 UTC). No 2025+ candle enters any run.
- **Ambiguous/gap = LOSS:** intrabar stop fills at the level with adverse slippage; a 1m bar that gaps through the level fills at its (worse) open. 100% of center exits are stops.

## Files

- Engine: `backtests/bt_dt4_rsi_dip.py`
- Report: `Strategy Codex/DaviddTech/backtests/DT4_RSI_DIP.md`
- Ledgers: `Strategy Codex/DaviddTech/backtests/dt4_trades_center.csv`, `dt4_grid.csv` (27 cells), `dt4_trades_best.csv`
- Stats dump: `backtests/_dt4_stats.json`
