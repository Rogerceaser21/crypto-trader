❌ DEAD — 667's own 1h defaults fail TWO of three kill gates: center (14,40,200) has **n = 33 IS trades (< 40)** and **NO cell in the entire 27-cell grid reaches t = 2.0 (max t = 1.481** at best cell 10,40,150). The per-trade edge is real in *sign* (all 27 cells expR > 0, center +0.394R, PF 2.21) but is never statistically significant and is carried almost entirely by one trade: at center the **single biggest winner = 62.3% of total R**, the **top-3 = 111.6%** (i.e. the other 30 trades net **negative**), and dropping just the top 3 turns center expR **−0.050R (t −0.33).** This center cell reproduces DT4's 1h sanity line (n=33, +0.394R, t=1.27) bit-for-bit — confirming the port, and confirming the 1h variant was never significant. **667 family CLOSED.**

# DT22 — "RSI Dip-Recovery 1h" (策略667 RSI回调+DMI+Chandelier)

Causal, signal-only backtest of the **1h variant** of DaviddTech Strategy 667, run at **its own `667.pine` defaults with its own declared grid** — BTC bench wave 5 of 7. This task settles the 667 family. The 15m sibling (**DT4**, `667_15.pine`) was a marginal/fragile survivor that Igor subsequently **disregarded**; DT4's report carried only a *single-run* 1h line (n=33, +0.394R, t=1.27). Here the 1h variant gets a full 27-cell grid on its own terms: **survive → partial rehabilitation of the family; die → family closed.** It dies.

**Source of truth:** `Strategy Codex/DaviddTech/research/pine/667.pine` (Pine v5, 46 lines). **Engine:** `backtests/bt_dt22_rsi_dip_1h.py`. The author's headline (**PF 1.98 / +62% / DD 10.3% / 114 trades / 6y**) is **selection-only context — not evidence and not a target.** We test the signal at honest sizing (flat 1%-equity risk vs the initial stop distance) with the source's **fitted quirks stripped**: the 50–80% min/max-exposure floor is removed (`667.pine` has no DD-halt, so there is nothing else to strip).

---

## Spec (frozen, derived line-by-line from `667.pine`)

- **Bars:** 1h, built from 1m closes (UTC 1-hour buckets). **Long-only, flat only** (pyramiding 0). All entry conditions on the **closed** bar `i`; fill at the **next 1m open = the 1h open of bar i+1** (causal, no look-ahead).
- **Indicators** (Pine 19–22): `trendEma = ta.ema(close, trendLen)`; `rsi = ta.rsi(close, rsiLen)` (Wilder RMA, SMA seed); `[+DI, −DI, ADX] = ta.dmi(diLen=14, adxSmooth=14)`; `atr = ta.atr(22)` (Wilder RMA of TrueRange).
- **Entry gate** (Pine 30–31): `ta.crossover(rsi, recoverLevel=45)` ∧ `ta.lowest(rsi, dipLookback=24) < dipLevel` ∧ `close > trendEma` ∧ `+DI > −DI` ∧ `ADX > 20`. (Warm-up gate `bar_index > max(trendLen, 24, diLen+adxSmooth=28, 22)` enforces causal history.)
- **Exits — moving stop** (Pine 36–43). While in position, each bar j: `highestSinceEntry := max(highestSinceEntry, high[j])` (incl. entry-bar high); `initialStop_j = entry_price − 2.5·atr[j]`; `chandelierStop_j = highestSinceEntry_j − 3.0·atr[j]`; `stop_j = max(initialStop_j, chandelierStop_j)`. **Pine re-evaluates BOTH legs with the CURRENT bar's atr every bar → a moving stop** (entry_price fixed; atr & highestSinceEntry vary). Replicated faithfully. **Causality:** the stop computed at the close of bar j−1 is the level tested **intrabar on 1m lows during bar j**; no stop is active on the entry bar itself (Pine places the first stop at the entry bar's close → tested from the next bar). Stop fill = **at the level with adverse slippage**; if the first touching 1m bar **gaps through** the level (its open already ≤ level) the fill is that worse open — never favourable → **ambiguous / gap = LOSS.**
- **Sizing (base):** flat 1%-of-(compounding)-equity risk vs the **initial** stop distance `2.5·atr[i]`. `size = 0.01·equity / (2.5·atr[i])`. **Stripped:** `qty = max(minQty, min(riskQty, maxQty))` 50–80%-equity exposure floor → base uses `riskQty` only.
- **Costs:** 0.05% fee/side, 0.02% slippage/fill (base), $10k start — identical to DT1/DT2/DT3/DT4 & `bt_engine.py`. **Sharpe** annualised at 24·365 = 8 760 1h bars/yr.

---

## Declared grid — 27 cells (fixed BEFORE any result)

`rsiLen {10, 14, 18}` × `dipLevel {35, 40, 45}` × `trendLen {150, 200, 300}` = **3 × 3 × 3 = 27.** Pine defaults **(14, 40, 200) = CENTER.** Fixed across the grid: recoverLevel 45, dipLookback 24, DMI(14,14), ADX>20, ATR22, initial stop 2.5×, chandelier 3.0×. **Slippage {0.01%, 0.02%, 0.03%}** cost sensitivity is on the **center cell only** (supporting, not a grid axis). No other cells, no post-hoc additions.

---

## Full results — all 27 cells (IS 2019-09-09 → 2024-12-31 minus warmup)

| rsiLen | dipLevel | trendLen | n | WR% | expR | PF | Sharpe | maxDD% | t |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 10 | 35 | 150 | 52 | 40.4 | 0.208 | 1.55 | 0.50 | 7.7 | 0.94 |
| 10 | 35 | 200 | 48 | 39.6 | 0.241 | 1.61 | 0.54 | 7.0 | 0.99 |
| 10 | 35 | 300 | 47 | 31.9 | 0.012 | 1.03 | 0.02 | 8.4 | 0.05 |
| 10 | 40 | 150 | 93 | 46.2 | 0.216 | 1.60 | 0.72 | 11.6 | **1.481** ◄best |
| 10 | 40 | 200 | 87 | 44.8 | 0.208 | 1.55 | 0.66 | 11.0 | 1.34 |
| 10 | 40 | 300 | 84 | 38.1 | 0.056 | 1.13 | 0.18 | 14.3 | 0.36 |
| 10 | 45 | 150 | 170 | 41.2 | 0.111 | 1.29 | 0.51 | 15.7 | 1.13 |
| 10 | 45 | 200 | 164 | 40.2 | 0.103 | 1.26 | 0.46 | 14.7 | 1.01 |
| 10 | 45 | 300 | 154 | 39.0 | 0.079 | 1.19 | 0.34 | 14.2 | 0.75 |
| 14 | 35 | 150 | 20 | 40.0 | 0.399 | 2.17 | 0.55 | 4.9 | 0.86 |
| 14 | 35 | 200 | 18 | 38.9 | 0.507 | 2.37 | 0.63 | 3.6 | 0.97 |
| 14 | 35 | 300 | 19 | 31.6 | 0.177 | 1.43 | 0.24 | 5.3 | 0.38 |
| 14 | 40 | 150 | 37 | 45.9 | 0.331 | 2.08 | 0.65 | 5.6 | 1.20 |
| **14** | **40** | **200** | **33** | **45.5** | **0.394** | **2.21** | **0.70** | **5.5** | **1.27** ◄**CENTER** |
| 14 | 40 | 300 | 33 | 39.4 | 0.151 | 1.42 | 0.28 | 6.6 | 0.52 |
| 14 | 45 | 150 | 58 | 48.3 | 0.276 | 1.91 | 0.73 | 5.6 | 1.45 |
| 14 | 45 | 200 | 52 | 46.2 | 0.269 | 1.83 | 0.66 | 6.1 | 1.28 |
| 14 | 45 | 300 | 51 | 41.2 | 0.091 | 1.25 | 0.23 | 7.4 | 0.45 |
| 18 | 35 | 150 | 18 | 33.3 | 0.141 | 1.33 | 0.18 | 4.8 | 0.29 |
| 18 | 35 | 200 | 15 | 26.7 | 0.116 | 1.23 | 0.12 | 5.2 | 0.20 |
| 18 | 35 | 300 | 16 | 25.0 | 0.008 | 1.02 | −0.01 | 6.6 | 0.01 |
| 18 | 40 | 150 | 28 | 39.3 | 0.336 | 1.94 | 0.56 | 6.3 | 0.94 |
| 18 | 40 | 200 | 25 | 40.0 | 0.439 | 2.16 | 0.65 | 4.7 | 1.08 |
| 18 | 40 | 300 | 24 | 33.3 | 0.168 | 1.42 | 0.25 | 6.2 | 0.43 |
| 18 | 45 | 150 | 39 | 35.9 | 0.150 | 1.36 | 0.31 | 8.0 | 0.55 |
| 18 | 45 | 200 | 34 | 35.3 | 0.206 | 1.46 | 0.38 | 6.8 | 0.66 |
| 18 | 45 | 300 | 31 | 32.3 | 0.057 | 1.13 | 0.10 | 7.7 | 0.18 |

**Structure of the surface (read this before the verdict):**
1. **Every one of the 27 cells is positive** (expR from +0.008 to +0.507). The *sign* of the edge — "buy an RSI-45 recovery out of a recent deep dip, inside an uptrend, with DMI up-direction" — is robust across the whole parameter box. That is the only good news.
2. **But no cell is significant.** The **maximum t-stat over all 27 cells is 1.481** (best cell 10,40,150). Two-thirds of the cells sit below t = 1.0. On 1h, the entry gate is far more restrictive than on 15m — the whole grid trades 15–170 times over 6 years, so even genuinely positive cells lack the sample to reject the null.
3. **`trendLen = 300` is uniformly the worst.** Unlike DT4's 15m surface (where trendLen was *inert*), on 1h the 300-bar EMA ≈ 12.5 days is a slow, laggy filter that admits late-trend entries: across every (rsiLen×dipLevel) pair, expR collapses at trendLen 300 (e.g. 14/40: 0.331→0.394→0.151 for 150/200/300; 10/40: 0.216→0.208→0.056). trendLen 150–200 is the working band.
4. **Deep-dip (35) starves the sample; shallow-dip (45) survives but dilutes.** dipLevel 35 gives the highest per-trade expR (14,35,200 = +0.507) but only n = 15–20 — far too few. dipLevel 45 keeps expR positive (+0.09…+0.28) at 3–5× the count. Neither corner produces a significant, adequately-sampled cell.

---

## Tail-dependence (mandatory — DT4's disease, worse here)

Center cell (14,40,200), 33 trades, **total +12.99R**, 15 wins / 18 losses (median trade is a **loss**):

| slice | trades | expR | t | share of total R |
|---|---:|---:|---:|---:|
| **all** | 33 | **+0.394** | **1.27** | 100% |
| top-1 winner alone | 1 | — | — | **62.3%** (8.09R) |
| top-3 winners | 3 | — | — | **111.6%** (14.50R) |
| **drop top-1** | 32 | **+0.153** | **0.76** | 37.7% |
| **drop top-3** | 30 | **−0.050** | **−0.33** | −11.6% |

**This is catastrophic tail concentration — materially worse than DT4's 15m center** (where top-1 = 30%, top-3 = 68%, drop-top-3 still *positive* at +0.17R). Here **one trade** — the Feb-2024 breakout, **+8.09R in 12 bars** — is **62% of all profit for six years.** The **top-3 exceed the total (111.6%)**, meaning the remaining 30 trades net **negative**. Excise the three biggest winners and the "edge" is **−0.050R, t −0.33** — a loser. Drop even the single top trade and t falls to 0.76. The center is not a distribution with a fat right tail; it is essentially one lottery ticket plus noise.

Best cell (10,40,150) is only marginally less tail-driven: top-1 40.2%, top-3 79.7%, drop-top-3 → +0.045R (t 0.43). Note the top-1 winner (8.087R) is the **same Feb-2024 trade** appearing in both cells.

---

## Cost sensitivity — center cell (slippage ±50% around the 0.02% base)

| slippage | n | WR% | expR | PF | Sharpe | maxDD% | t |
|---:|---:|---:|---:|---:|---:|---:|---:|
| 0.01% | 33 | 45.5 | 0.405 | 2.25 | 0.72 | 5.4 | 1.30 |
| **0.02% (base)** | 33 | 45.5 | **0.394** | 2.21 | 0.70 | 5.5 | **1.27** |
| 0.03% | 33 | 45.5 | 0.382 | 2.19 | 0.69 | 5.5 | 1.23 |

**Cost-robust** (≈0.011R degradation per 0.01% slip) — consistent with the long ~22.7-bar (≈22.7 h) hold; like DT4, this is a swing system, not a scalp, so costs are not what kills it. **What kills it is significance and tail dependence, not the cost floor.**

---

## KILL CRITERIA (verbatim) & verdict

> **DEAD unless center-region expR after costs > 0 AND ≥40 IS trades at center AND best-cell t ≥ 2.0.**

| Criterion | Threshold | Actual | Pass |
|---|---|---|---|
| Center-region expR after costs | > 0 | **+0.329** (mean of 7 cells) | ✅ |
| IS trades at center | ≥ 40 | **33** | ❌ |
| Best-cell t | ≥ 2.0 | **1.481** (max over all 27 cells) | ❌ |

**Two of three gates FAIL → ❌ DEAD.** The center-region edge is positive (gate 1 passes), but the center produces only **33 trades** (gate 2 fails, ≥40 required) and **not one cell in the grid reaches t = 2.0** — the maximum is 1.481, a full 0.5σ short of the bar (gate 3 fails). This is not a marginal miss like DT4's 15m variant (which cleared the gate on a best-cell t of 2.040): the 1h variant is decisively sub-threshold on significance and sample size simultaneously.

---

## Center-region analysis

Center + one-grid-step neighbours on each axis (7 cells):

| cell (rsiLen, dipLevel, trendLen) | n | expR | PF | Sharpe | t |
|---|---:|---:|---:|---:|---:|
| **(14,40,200) center** | 33 | 0.394 | 2.21 | 0.70 | 1.27 |
| (10,40,200) | 87 | 0.208 | 1.55 | 0.66 | 1.34 |
| (18,40,200) | 25 | 0.439 | 2.16 | 0.65 | 1.08 |
| (14,35,200) | 18 | 0.507 | 2.37 | 0.63 | 0.97 |
| (14,45,200) | 52 | 0.269 | 1.83 | 0.66 | 1.28 |
| (14,40,150) | 37 | 0.331 | 2.08 | 0.65 | 1.20 |
| (14,40,300) | 33 | 0.151 | 1.42 | 0.28 | 0.52 |
| **mean expR** | | **+0.329** | | | |

The region is **uniformly positive (min +0.151) but uniformly insignificant — every neighbour has t < 1.35.** The center is not a sharp peak (as at DT4) nor a robust plateau; it is a broad, low, flat mound that never rises to significance. Widening the dip to 45 or lengthening trend to 300 pulls expR down; deepening the dip to 35 lifts expR but starves n to 18. There is no configuration in the neighbourhood that is both adequately sampled and significant.

**Best cell & multiplicity caveat.** Best by max-t = **(10, 45→40, 150)** — precisely **(10, 40, 150)**: n=93, WR 46.2%, expR +0.216, PF 1.60, Sharpe 0.72, maxDD 11.6%, **t 1.481**, CAGR ≈3.68%, MAR ≈0.32. Three cautions: (a) it is the **maximum** t over 27 cells — under even mild multiplicity, a max-of-27 of 1.481 is entirely consistent with no true edge; (b) it is still tail-driven (top-1 = 40% of R, the same Feb-2024 trade); (c) it does not clear 2.0 — so unlike DT4, the *best* cell cannot rescue the verdict. Do **not** read it as deployable; read the whole surface as a consistently-positive-sign, never-significant edge.

---

## Exit mix at center (33 trades)

| exit type | count | share | mechanics |
|---|---:|---:|---|
| moving stop (intrabar, 1m) | 33 | 100% | `max(entry − 2.5·ATR, highestSinceEntry − 3.0·ATR)`, re-evaluated each bar with current ATR; gap-through = worse fill; ambiguous = LOSS |

**Every trade exits on the moving stop** — there is no TP, no time stop, no opposite-signal exit in `667.pine`. Winners are stops that ratcheted *above* entry via the 3.0× chandelier; losers are the initial 2.5× stop, cut to roughly −0.5R because the moving initial-stop drifts up as ATR eases (both worked examples below are exactly this). The design *is* the chandelier trail — and on 1h the trail is tighter (3.0× vs DT4's 4.5×), so it clips more would-be winners before the rare fat move develops, which is precisely why the surviving profit collapses onto one trade.

---

## 667-family verdict

| variant | source | center | center expR / t | best-cell t (grid) | tail (top-1 / top-3 / drop-top-3) | kill gate |
|---|---|---|---:|---:|---|:--:|
| **DT4** (15m) | `667_15.pine` | (18,40,300) | +0.512R / **1.93** | **2.040** (14,35,200) | 30% / 68% / **+0.17R** | ✅ marginal (later disregarded) |
| **DT22** (1h) | `667.pine` | (14,40,200) | +0.394R / **1.27** | **1.481** (10,40,150) | 62% / 112% / **−0.05R** | ❌ dead |

**FAMILY CLOSED.** Both timeframes show the same positive-*sign* edge and the same 100%-moving-stop mechanics, but **neither is statistically robust at its own defaults**, and the 1h variant is **strictly worse on every axis that matters**: lower center t (1.27 vs 1.93), lower best-cell t (1.48 vs 2.04 — and 1h's best fails 2.0 whereas 15m's cleared it), and **far more extreme tail dependence** (one trade = 62% of profit vs 30%; the bottom-30 net negative; drop-top-3 goes from +0.17R at 15m to −0.05R at 1h). DT4 was a fragile survivor Igor already set aside; DT22 does not even reach that bar. There is no timeframe of Strategy 667 that clears the pre-registered significance test. **The 667 family is closed — no rehabilitation.**

---

## Benchmark & sibling comparison

**vs C2** (the campaign's Krown reference): C2 center Sharpe **0.93** / MAR **0.96**; C2 best-gated Sharpe **1.44** / MAR **2.56**.
DT22 center Sharpe **0.705** / MAR **0.435** — **below C2's center on both.** DT22 best (10,40,150) Sharpe **0.719** / MAR **0.316** — far below C2's optimised-gated ceiling on both. Unlike DT4 (which edged C2's *center* on Sharpe), DT22 is **below C2 on every axis, at center and at best.**

**Weekly-R correlation (DT22 center ledger vs siblings' center ledgers):**
- vs **DT1** (4h Trend Rider): Pearson **−0.044** (7 overlapping active weeks) — uncorrelated, but the overlap is tiny.
- vs **DT2** (4h Vol-Surge): Pearson **−0.014** (18 overlapping weeks) — uncorrelated.
- vs **DT3** (1h KAMA+Squeeze): Pearson **−0.006** (21 overlapping weeks) — uncorrelated.

DT22 is statistically independent of DT1/DT2/DT3 — but that is moot: it trades only **33 times in six years** (≈5.5/yr) and its P&L is one trade, so it is neither a workhorse nor a usable diversifier.

---

## Worked examples (real timestamps, hand-traced, fully causal)

**Example A — loss, moving initial-stop (−0.51R).** Signal bar **2019-10-14 16:00 UTC** (bar 856). On the closed signal bar: RSI path `[44.57, 40.33, 38.79, 54.93]` → prior-bar RSI 38.79 ≤ 45 < 54.93 this bar ⇒ `crossover(RSI,45)` ✓; `lowest(RSI,24)=31.85 < 40` ✓ (deep dip present); ADX **22.85 > 20** ✓; +DI **28.16 > −DI 22.12** ✓; close **8329.76 > EMA₂₀₀ 8312.23** ✓. Enter at the **open of the next bar, 2019-10-14 17:00**, entry_ref 8329.72, fill 8331.39 (+slip). Initial stop distance = 2.5·ATR(45.40) = 113.49 → size 0.8812 BTC. First stop at the entry bar's close = max(init 8217.27, chand 8220.07) = **8220.07**. Price chops (highestSinceEntry peaks at 8372.47 by 19:00); the chandelier ratchets to ~8283 as ATR eases and the 1m low breaches it at **2019-10-15 07:00**; exit_ref 8283.12, fill 8281.46 (adverse). Net **−51.31 → −0.513R**, held 14 bars. Causal: all gates use ≤ bar 856; fill = open[857]; stop tested only from bar 857 onward.

**Example B — loss, moving initial-stop (−0.50R).** Signal bar **2019-12-08 09:00 UTC** (bar 2169). RSI path `[45.46, 43.54, 44.38, 54.21]` → prior-bar 44.38 ≤ 45 < 54.21 ⇒ `crossover(RSI,45)` ✓; `lowest(RSI,24)=35.84 < 40` ✓; ADX **23.46 > 20** ✓; +DI **23.21 > −DI 18.69** ✓; close **7483.87 > EMA₂₀₀ 7407.47** ✓. Enter **2019-12-08 10:00**, ref 7483.83, fill 7485.33, stop dist 2.5·ATR(47.56) = 118.90, size 0.8368. The trail climbs with highestSinceEntry (7500 → 7539 → 7559 …), the chandelier rising 7366 → 7397 → 7426, but the move stalls and the moving stop is hit at **2019-12-09 15:00**, exit_ref 7434.58, fill 7433.09, net **−49.95 → −0.502R**, held 29 bars. (These are the ledger's first two center trades — both losers, illustrating that the median trade loses ~0.5R and all the profit lives in the rare right tail.)

---

## Indicator hand-check (re-derivable)

Five consecutive real 1h bars, **2020-04-16 20:00 → 2020-04-17 00:00 UTC**, center params (rsiLen 14, trendLen 200). A reviewer can recompute each gate from raw candles:

| bar time | close | EMA₂₀₀ | RSI | lowest(RSI,24) | +DI | −DI | ADX | ATR | close>EMA | +DI>−DI | ADX>20 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|:--:|:--:|:--:|
| 04-16 20:00 | 7043.12 | 6879.10 | 62.45 | 22.86 | 25.53 | 15.64 | 30.15 | 90.28 | ✓ | ✓ | ✓ |
| 04-16 21:00 | 7059.45 | 6880.90 | 63.54 | 22.86 | 25.23 | 14.99 | 29.82 | 88.66 | ✓ | ✓ | ✓ |
| 04-16 22:00 | 7148.50 | 6883.56 | 68.89 | 22.86 | 29.92 | 13.74 | 30.33 | 89.70 | ✓ | ✓ | ✓ |
| 04-16 23:00 | 7098.15 | 6885.69 | 63.24 | 22.86 | 28.74 | 12.42 | 31.00 | 91.57 | ✓ | ✓ | ✓ |
| 04-17 00:00 | 7056.96 | 6887.40 | 58.98 | 32.75 | 26.05 | 15.32 | 30.64 | 93.36 | ✓ | ✓ | ✓ |

**This stretch is a NON-entry** even though the dip (lowest RSI,24 = 22.86 < 40), the trend (`close > EMA`) and both DMI gates all pass: **RSI is already 59–69, well above 45, so there is no fresh `crossover(RSI,45)` in the window.** It illustrates that the RSI-45 up-crossover — not the trend EMA or the DMI — is the binding filter that keeps the sample so small on 1h. Faithful gate behaviour.

**Unit / independent checks** (in `bt_dt22_rsi_dip_1h.py`):
- **RSI** (`_handcheck_rsi`): Wilder RSI(3) on a known 8-bar series reproduces a from-scratch hand-computation to < 1e-9 (e.g. bar 3 = 85.7143, bar 6 = 45.4054). **OK.**
- **DMI** (`_handcheck_dmi`): on a clean monotone uptrend, +DI 68.85 > −DI 0.00, ADX 100 — correct degenerate limit. **OK.**
- **ATR** (`_handcheck_atr`): vectorised ATR(22) vs an independent slow Wilder loop over 5 real bars — **max abs diff 0.0** (bit-identical).

---

## PROOFS

- **py_compile:** `python3 -m py_compile backtests/bt_dt22_rsi_dip_1h.py` → **OK (exit 0).**
- **Determinism (two independent runs):** ledger md5s **identical run 1 = run 2** — center **`9fbce964160cc5ced87ab02997a42415`**, best **`a72e37860c23c7cf2f055eef127e8375`**, grid csv **`21270dd5c3a84aec64da99cb1cb97add`**. No RNG, no wall-clock.
- **2025 lockout:** 1m candles loaded **2,795,040**, min **2019-09-09 00:00:00+00:00**, max **2024-12-31 23:59:00+00:00**; `any_2025 = False`. 1h bars **46,584** (max 2024-12-31 23:00 UTC). IS span **5.314 yr**. No 2025+ candle enters any run.
- **Port cross-check:** this center cell (14,40,200) reproduces DT4's single-run 1h sanity line **bit-for-bit** — n=33, +0.394R, PF 2.21, Sharpe 0.71, maxDD 5.5%, t 1.27 — confirming the 1h engine port is faithful and that DT4's "1h sibling" was in fact run at `667.pine` defaults.
- **Ambiguous/gap = LOSS:** intrabar stop fills at the level with adverse slippage; a 1m bar that gaps through the level fills at its (worse) open. 100% of center exits are moving stops.

## Files

- Engine: `backtests/bt_dt22_rsi_dip_1h.py`
- Report: `Strategy Codex/DaviddTech/backtests/DT22_RSI_DIP_1H.md`
- Ledgers: `Strategy Codex/DaviddTech/backtests/dt22_trades_center.csv`, `dt22_grid.csv` (27 cells), `dt22_trades_best.csv`
- Stats dump: `backtests/_dt22_stats.json`
