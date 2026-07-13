❌ DEAD — fails 2 of the 3 kill gates outright and does not generalize. Over the full 5.3y in-sample window the compression-dwell breakout is **net-losing on all 27 grid cells** (expR −0.070 to −0.205, PF 0.73–0.91). Center (20, 6, (1.6, 3.2)): **n = 164, expR −0.1185R, PF 0.841, Sharpe −0.48, t = −1.07, maxDD 28.6%, −19.0% total**. Center-region mean expR **−0.0987** (gate: > 0 ❌); best-cell t **−0.575** (gate: ≥ 2.0 ❌); only the ≥40-trades gate passes (164). **Not a single cell clears t ≥ 2.0 — the max t over the whole grid is −0.575 (i.e. the "best" cell still loses money).** The author's ~1.5y PF 2.08 / +4.4% was a small-sample regime artifact; it collapses to a losing system out-of-his-window. Weekly-R correlation to the validated DT3 compression-release engine is only **+0.15** — so DT24 is not even a redundant re-skin of DT3, it is a *mechanically distinct and unprofitable* take on the compression theme. **Redundant? No. Additive? No — it has no edge to add.** Wave 7 of 7 closes the BTC bench.

# DT24 — "Compression-Dwell Breakout" (CDB-v1, 1h BTC)

Causal, signal-only backtest of the DaviddTech-community Pine v6 strategy **"CDB-v1 Compression Dwell Breakout"** (author **Haris Ramdedovic**) — BTC bench **wave 7 of 7 (final)**. This was the **second reserve** for the original top-5 selection. Unlike most scraped library scripts it is **well-engineered Pine v6 with explicit no-lookahead comments** ("no lookahead: prior-bar box, current closed bar"), so it earns a fair, faithful test. The decisive feature: the author's claimed window is only **~1.5 years** — our **5.3-year** in-sample run is precisely the generalization test that a 1.5y headline cannot survive on its own. **It does not survive.**

**Source of truth:** `Strategy Codex/DaviddTech/research/pine/CDB_v1_Compression_Dwell_Breakout.pine` (Pine v6, 75 lines). **Engine:** `backtests/bt_dt24_compression_dwell.py`. The author's headline (**PF 2.08 / +4.4% / DD 1.8% / 64 trades / ~1.5y**) is **selection-only context — not evidence and not a target.** The **+4.4%** and **DD 1.8%** both come off `default_qty_type=percent_of_equity, default_qty_value=25` (25%-of-equity fixed sizing) over a tiny window — artefacts of position size and sample length, not the signal. We **strip** the 25%-equity sizing (and the author's 0.06% commission) and test the raw signal at a flat, honest **1%-of-equity risk vs the frozen ATR stop distance**, with the bench's 0.05%/side + 0.02%/fill costs.

---

## Spec (frozen, derived line-by-line from the Pine)

- **Bars:** 1h, built from 1m (UTC 1-hour buckets). **Long *and* short, flat-only** (pyramiding 0). Every entry gate on the **closed** 1h bar `i`; fill at the **next 1m open = the 1h open of bar i+1** (causal, no look-ahead).
- **State per closed bar** (Pine 22–31): `atrS = ta.atr(14)`; `atrL = ta.atr(100)`; `boxHi = ta.highest(high, boxLen)`, `boxLo = ta.lowest(low, boxLen)` (current bar inclusive); `comp = (boxHi−boxLo) ≤ 3.0·atrL ∧ atrS ≤ 0.85·atrL`; `dwell := comp ? dwell[1]+1 : 0` (sequential counter); **`armed = dwell[1] ≥ minDwell`** (compression must have held *through the prior bar*).
- **Breakout-bar quality** (Pine 34–36): `rng = high−low`; `eff = |close−open|/rng` (0 if rng=0); `volOk = volume > ta.sma(volume,20)`.
- **LONG** (Pine 38): `armed ∧ close > boxHi[1] ∧ eff ≥ 0.55 ∧ close ≥ high − 0.25·rng ∧ volOk`.
  **SHORT** (Pine 39): `armed ∧ close < boxLo[1] ∧ eff ≥ 0.55 ∧ close ≤ low + 0.25·rng ∧ volOk`. `boxHi[1]/boxLo[1]` = the **prior** bar's box (excludes the breakout bar itself) — so the breakout is measured against a box that does *not* contain the current bar. Long and short are mutually exclusive in practice (close cannot be both above `boxHi[1]` and below `boxLo[1]`); long is checked first.
- **Entries** (Pine 41–49): only when **flat** ∧ `(bar_index − lastExitBar) > 12` (cooldown). Fill = `open[i+1]`.
- **Exits** (Pine 51–72). Bracket set **once at position open** and **frozen**. Pine's `justOpened` fires on the **entry bar i+1**, where `atrS` is read → **`atrS_at_open`**:
  - `avg_price = open[i+1]` (raw fill, no slippage — Pine `position_avg_price`);
  - LONG `stop = avg_price − slAtr·atrS_open`, `target = avg_price + tpAtr·atrS_open`; SHORT mirrored.
  - `atrS_open` is known only at the **close of i+1**, so the bracket is active for testing from **bar i+2 onward** (Pine places the exit order at the close of i+1; earliest fill i+2). The entry bar i+1 itself carries **no** bracket — testing it intrabar with an end-of-i+1 ATR would be look-ahead.
  - **Stop/target tested intrabar via 1m** throughout the hold: if a single 1h bar's range spans **both** levels, 1m data disambiguates fill order; a single 1m bar touching **both** is **ambiguous = LOSS** (booked the stop). Unresolved = stop. Fills at the level with adverse slippage (bt_engine house convention).
  - **Time stop** (Pine 71–72): when `bar_index − entryBar ≥ 48`, market `close_all` → fill at the next 1m open (`open[b+1]`).
- **Sizing / RISK UNIT (declared):** flat **1%-of-(compounding)-equity** risk vs the frozen stop distance `slAtr·atrS_open`. `size = 0.01·equity / (slAtr·atrS_open)`; `R = net / (equity·1%)`. Long & short, compounding. R-space metrics (expR/PF/WR/t/maxDD_R) are invariant to compounding-vs-fixed sizing.
- **Costs:** 0.05% fee/side, 0.02% slippage/fill, $10k start — identical to DT1..DT23 & `bt_engine.py`. **Sharpe** annualised at 24·365 = **8 760** 1h bars/yr.

**Stripped from the Pine:** the 25%-of-equity fixed sizing (`default_qty_value=25`) and the author's 0.06% commission. **Fill-model divergence (stated):** Pine `calc_on_every_tick=false` fills the market entry/time-exit at the next bar's open — we match that; intrabar stop/target fills at the level with adverse slippage (house convention). Strictly causal: every gate uses only closed-bar data ≤ `i`; fills at `open[i+1]`; the frozen ATR is read at the entry bar and the bracket tested only from i+2.

---

## Declared grid — 27 cells (fixed BEFORE any result)

`boxLen {15, 20, 25}` × `minDwell {4, 6, 8}` × `(slAtr, tpAtr) ∈ {(1.2,2.4), (1.6,3.2), (2.0,4.0)}` = **3 × 3 × 3 = 27.** Pine defaults **(20, 6, (1.6,3.2)) = CENTER.** Fixed across the grid: `atrS` len 14, `atrL` len 100, `compMax` 3.0, `volCompMax` 0.85, `effMin` 0.55, the 0.25-range strong-close test, `SMA(volume,20)`, `maxBars` 48, `cooldown` 12. No other cells, no post-hoc additions. All three (slAtr, tpAtr) pairs hold the **2:1 target:stop ratio** the Pine defaults use.

---

## Full results — all 27 cells (IS 2019-09-09 → 2024-12-31 minus 100-bar warmup)

| boxLen | minDwell | (slAtr,tpAtr) | n | WR% | expR | PF | Sharpe | maxDD% | t |
|---:|---:|:--:|---:|---:|---:|---:|---:|---:|---:|
| 15 | 4 | (1.2,2.4) | 283 | 35.0 | −0.139 | 0.82 | −0.69 | 39.9 | −1.629 |
| 15 | 4 | (1.6,3.2) | 272 | 35.3 | −0.085 | 0.88 | −0.44 | 33.6 | −0.979 |
| 15 | 4 | (2.0,4.0) | 258 | 32.9 | −0.132 | 0.82 | −0.69 | 40.3 | −1.536 |
| 15 | 6 | (1.2,2.4) | 251 | 35.5 | −0.127 | 0.83 | −0.60 | 38.1 | −1.395 |
| 15 | 6 | (1.6,3.2) | 243 | 35.0 | −0.099 | 0.87 | −0.48 | 39.4 | −1.077 |
| 15 | 6 | (2.0,4.0) | 233 | 32.2 | −0.148 | 0.80 | −0.74 | 42.9 | −1.638 |
| 15 | 8 | (1.2,2.4) | 217 | 33.2 | −0.203 | 0.75 | −0.90 | 42.0 | −2.102 |
| 15 | 8 | (1.6,3.2) | 211 | 32.7 | −0.176 | 0.77 | −0.80 | 40.0 | −1.814 |
| 15 | 8 | (2.0,4.0) | 204 | 30.4 | −0.205 | 0.73 | −0.97 | 41.4 | −2.147 |
| 20 | 4 | (1.2,2.4) | 201 | 37.3 | −0.071 | 0.91 | −0.29 | 25.6 | −0.686 |
| 20 | 4 | (1.6,3.2) | 197 | 36.0 | −0.074 | 0.90 | −0.33 | 27.3 | −0.729 |
| 20 | 4 | (2.0,4.0) | 191 | 33.5 | −0.116 | 0.84 | −0.53 | 29.9 | −1.169 |
| 20 | 6 | (1.2,2.4) | 168 | 35.7 | −0.123 | 0.84 | −0.47 | 28.1 | −1.099 |
| **20** | **6** | **(1.6,3.2)** | **164** | **34.8** | **−0.118** | **0.84** | **−0.48** | **28.5** | **−1.070** ◄ **CENTER** |
| 20 | 6 | (2.0,4.0) | 159 | 34.0 | −0.097 | 0.86 | −0.41 | 23.8 | −0.891 |
| 20 | 8 | (1.2,2.4) | 148 | 36.5 | −0.102 | 0.87 | −0.38 | 23.8 | −0.853 |
| 20 | 8 | (1.6,3.2) | 144 | 36.1 | −0.083 | 0.89 | −0.32 | 22.8 | −0.695 |
| 20 | 8 | (2.0,4.0) | 140 | 35.0 | −0.070 | 0.90 | −0.29 | 20.9 | −0.589 |
| 25 | 4 | (1.2,2.4) | 124 | 36.3 | −0.106 | 0.86 | −0.36 | 18.8 | −0.810 |
| 25 | 4 | (1.6,3.2) | 122 | 34.4 | −0.134 | 0.82 | −0.49 | 21.8 | −1.049 |
| 25 | 4 | (2.0,4.0) | 119 | 32.8 | −0.135 | 0.81 | −0.51 | 22.3 | −1.068 |
| 25 | 6 | (1.2,2.4) | 106 | 36.8 | −0.094 | 0.88 | −0.29 | 17.4 | −0.655 |
| 25 | 6 | (1.6,3.2) | 106 | 35.8 | −0.096 | 0.87 | −0.33 | 16.6 | −0.690 |
| 25 | 6 | (2.0,4.0) | 106 | 34.9 | −0.078 | 0.89 | −0.29 | 16.3 | **−0.575** ◄ best-t |
| 25 | 8 | (1.2,2.4) | 90 | 35.6 | −0.138 | 0.82 | −0.40 | 19.4 | −0.895 |
| 25 | 8 | (1.6,3.2) | 90 | 35.6 | −0.114 | 0.85 | −0.36 | 16.3 | −0.760 |
| 25 | 8 | (2.0,4.0) | 90 | 34.4 | −0.098 | 0.86 | −0.33 | 14.4 | −0.666 |

**Structure of the surface (read this before the verdict):**
1. **Every one of the 27 cells is expR-negative** (from −0.070 to −0.205) and **every PF is below 1.0** (0.73 to 0.91). There is **no** corner, no axis, no parameter combination where the compression-dwell breakout is profitable after honest costs. This is the mirror image of DT23, where all 27 cells were *positive*.
2. **The "best" cell (max-t) is (25,6,(2.0,4.0)) at t = −0.575** — i.e. the single least-bad cell in the whole box still *loses money* and is not remotely significant. **0 of 27 cells clear t ≥ 2.0**; the two most-negative (15,8,·) cells are significantly *negative* (t ≈ −2.1), meaning their losses are real, not noise.
3. **WR is a flat ~33–37% everywhere** while the target:stop ratio is 2:1 — so to break even the system would need WR ≈ 34%+ *with* the 2R winners actually landing. They do not land often enough: the ~34% win rate at 2:1 is right at the theoretical break-even, and costs + the ambiguous-fill LOSS convention push it under water in every cell.
4. **Longer boxLen / higher minDwell tighten the drawdown but not the sign.** boxLen 25 halves maxDD vs boxLen 15 (≈16% vs ≈40%) because it fires fewer, cleaner breakouts — but expR stays negative throughout. Requiring *more* compression before the breakout does not manufacture an edge; it just trades less to lose less.

---

## Long / short split & exit mix (center, 164 trades)

| side | n | WR% | expR | PF |
|---|---:|---:|---:|---:|
| long | 89 | 37.1 | −0.059 | 0.917 |
| short | 75 | 32.0 | **−0.189** | 0.758 |

**Shorts are the worse half by a wide margin** (−0.189R vs −0.059R): breakout-*downs* on BTC over 2019–2024 fade far more often than breakout-ups, consistent with the secular uptrend. Neither side is profitable, but the short book is where most of the bleed lives.

| exit type | count | share | mechanics |
|---|---:|---:|---|
| stop (intrabar, fixed) | 106 | 64.6% | `avg_price ∓ 1.6·atrS_open`, tested on 1m from bar i+2; both-touched 1h bar → 1m tie-break; same-1m both → **LOSS** |
| target (intrabar, fixed) | 54 | 32.9% | `avg_price ± 3.2·atrS_open` — a clean 2R win |
| time stop (market) | 4 | 2.4% | `bar_index − entryBar ≥ 48` → market next open |

**Nearly two-thirds of trades stop out.** The breakout is a false signal far more often than it runs: 106 stops to 54 targets, so the ~2:1 payoff geometry cannot compensate. Time stops almost never fire (4/164) — trades resolve to a level well within the 48-bar cap (avg hold 8.8 bars).

---

## Tail-dependence (center)

Center cell, **164 trades, total −19.4R**, 57 wins / 107 losses:

| slice | trades | expR | t | note |
|---|---:|---:|---:|---|
| **all** | 164 | **−0.118** | **−1.07** | net-losing |
| **drop top-1 winner** | 163 | −0.130 | −1.19 | |
| **drop top-3 winners** | 161 | **−0.157** | **−1.42** | |

Because total R is **negative**, the usual "top-1 share" framing inverts: the biggest winners are the *only* thing keeping the loss from being worse. **Remove the three fattest winners and the system loses more** (−0.157R, t = −1.42). There is no fat-tail *edge* here — there is a fat-tail *cushion* on an otherwise deeper loss. A profitable version of this strategy does not exist anywhere in the sample.

---

## KILL CRITERIA (verbatim) & verdict

> **DEAD unless center-region expR after costs > 0 AND ≥40 IS trades at center AND best-cell t ≥ 2.0.**

| Criterion | Threshold | Actual | Pass |
|---|---|---|---|
| Center-region expR after costs | > 0 | **−0.0987** (mean of 7 cells) | ❌ |
| IS trades at center | ≥ 40 | **164** | ✅ |
| Best-cell t | ≥ 2.0 | **−0.575** (25,6,(2.0,4.0)) | ❌ |

**Two of three gates FAIL → ❌ DEAD.** And not marginally: the center-region expR is negative on *all seven* cells, and the best-cell t is not merely below 2.0 — it is *negative*, because the least-bad cell in the entire 27-cell box is still a money-loser. The only gate it clears is the trivial one (trade count). There is no cherry-pick, no axis perturbation, and no sub-slice of the sample that produces a positive, let alone significant, edge.

---

## Generalization verdict — does his 1.5y result hold over 5.3y?

**No — it fails completely.** The author's ~1.5-year headline (**PF 2.08, +4.4%, 64 trades**) does not survive contact with the full 5.3-year in-sample window. Over 5.3y the *same signal* at the *same defaults* produces **PF 0.841, −19.0%, 164 trades, expR −0.118R, t −1.07** — and every one of the 26 neighbouring grid cells is likewise net-losing. His 64-trade window was long enough to look like an edge and short enough to *be* one only by accident: a compression-breakout system is exquisitely regime-sensitive, and a ~1.5y slice (almost certainly a stretch of the 2023–2024 low-volatility grind where tight ranges resolved cleanly) flatters it. Expand to five and a half years spanning the 2019 chop, the 2020 crash, the 2021 blow-off, the 2022 bear and the 2023–24 recovery, and the breakouts are false ~65% of the time. **This is the textbook cautionary case for the project's "5.3y in-sample, one locked OOS" discipline: a well-coded, honestly-authored, no-lookahead strategy with a plausible 1.5y PF above 2 is still a losing system once you demand it work across regimes.** The engineering quality of the Pine is not in question; the edge simply is not there.

---

## Benchmark, sibling correlation & redundant/additive call

**vs C2** (the campaign's Krown reference): C2 center Sharpe **0.93** / MAR **0.96**; C2 best-gated Sharpe **1.44** / MAR **2.56**. DT24 center Sharpe **−0.48** / MAR **−0.136**, best cell Sharpe **−0.29** / MAR **−0.107** — **negative on both axes, far below C2 and below every prior DT-bench engine.** No comparison is meaningful beyond "it loses money."

**Weekly-R correlation (DT24 center ledger vs siblings' center ledgers, Pearson of weekly-summed R, full-union method):**

| vs | strategy | Pearson r | both-active weeks | read |
|---|---|---:|---:|---|
| **DT3** | 1h KAMA+Squeeze (validated compression-release) | **+0.152** | 92 | weakly correlated |
| **DT23** | 4h Volume-Spike (validated volume engine) | **+0.067** | 50 | independent |

**Redundant/additive call → NEITHER (moot, because there is no edge).** The task flagged that DT24's thesis *overlaps* DT3 — both are "compression → release" engines — so a high correlation would have branded DT24 a redundant re-skin. **It is not.** The weekly-R correlation to DT3 is only **+0.152** (they share ~2% of variance), and to DT23 only **+0.067**. Mechanically, DT24 and DT3 attack the same *idea* (trade the expansion out of a quiet range) through **completely different machinery** — DT3 uses a KAMA-efficiency + Bollinger/Keltner squeeze release; DT24 uses an ATR-box-height + ATR-ratio dwell counter with a strong-close/volume breakout filter — and the low correlation confirms they fire on different weeks. But the redundant-vs-additive question presupposes a *positive* edge to classify. DT24 has none: it is **not redundant** with DT3 (different, uncorrelated signal) and **not additive** to the book (negative expectancy on all 27 cells). It contributes only losses. DT3's compression-release edge stands; DT24's does not replicate it.

---

## Worked examples (real timestamps, hand-traced, fully causal — compression state shown)

**Example A — SHORT breakout → STOP loss (−1.21R).** Signal bar **2019-09-16 12:00 UTC** (bar 180). Compression state carried in from the prior bars: **`dwell[1] = 15`** (compression had held for 15 consecutive bars *through bar 179*), so `armed = 15 ≥ minDwell 6` ✓. The breakout bar itself has `comp = False` — it is the *expansion* out of the box, exactly as intended. Raw candle: O 10 282.03 / H 10 282.03 / L 10 134.46 / **C 10 147.09**, volume 1 205.7. Gate check, each conjunct from raw values:
- `armed` ✓ (dwell[1] = 15 ≥ 6);
- `close 10 147.09 < boxLo[1] 10 265.32` ✓ (broke below the prior 20-bar box floor);
- `eff = |10 147.09 − 10 282.03| / 147.57 = 0.914 ≥ 0.55` ✓ (decisive body);
- strong-short level = `low + 0.25·rng = 10 134.46 + 0.25·147.57 = 10 171.35`; `close 10 147.09 ≤ 10 171.35` ✓ (closed in the bottom quarter);
- `volume 1 205.7 > vsma 847.3` ✓.

All five pass ⇒ enter SHORT at the **open of the next bar, 2019-09-16 13:00**, `avg_price` **10 148.37**, fill 10 146.34 (−slip). `atrS_open = 42.697` ⇒ `stop = 10 148.37 + 1.6·42.697 = 10 216.69`, `target = 10 148.37 − 3.2·42.697 = 10 011.74`, `stop_dist = 68.32`, size = 100/68.32 = 1.464. Price rallies; the 1m high breaches the stop and the exit books at **10 216.69** on **2019-09-16 21:00**, fill 10 218.73 (adverse +slip), held 8 bars. Net **−1.209R**. Causal: every gate uses bar ≤ 180; fill = open[181]; ATR read at bar 181; stop tested only from bar 182 onward.

**Example B — LONG breakout → STOP loss (−1.11R).** Signal bar **2019-10-02 23:00 UTC** (bar 575). `dwell[1] = 10 ≥ 6` ✓ (`comp` on the breakout bar itself is True here — the box is still tight even as price pokes out). Raw candle: O 8 260.54 / H 8 365.92 / L 8 259.08 / **C 8 352.14**, volume 2 396.7. Gates: `armed` ✓; `close 8 352.14 > boxHi[1] 8 280.00` ✓; `eff = |8 352.14 − 8 260.54| / 106.84 = 0.857 ≥ 0.55` ✓; strong-long level = `high − 0.25·rng = 8 365.92 − 26.71 = 8 339.21`, `close 8 352.14 ≥ 8 339.21` ✓ (closed in the top quarter); `volume 2 396.7 > vsma 1 282.7` ✓. Enter LONG **2019-10-03 00:00**, `avg_price` **8 353.40**, fill 8 355.07; `atrS_open = 65.312` ⇒ `stop = 8 353.40 − 1.6·65.312 = 8 248.90`, `target = 8 353.40 + 3.2·65.312 = 8 562.40`. The breakout immediately fails; the 1m low breaches the stop and the exit books at **8 248.90** on **2019-10-03 07:00**, held 7 bars. Net **−1.111R**.

These are the **first two center trades** — a short breakout and a long breakout, back-to-back, *both* stopping out. They are a fair snapshot of the whole sample: the compression state machine arms correctly and the breakout filter fires on genuinely decisive, high-volume bars, but the subsequent move reverses far more often than it continues, and 64.6% of trades die at the stop.

---

## Indicator & state-machine hand-checks (re-derivable, in `bt_dt24_compression_dwell.py`)

- **ATR-S(14)** (`handcheck_atr`): vectorised Wilder ATR vs an independent slow `(prev·13 + TR)/14` loop over 5 real bars past warmup — **max |diff| = 0.0** (bit-identical).
- **ATR-L(100)** (`handcheck_atr`): same check at length 100 — **max |diff| = 0.0**.
- **SMA(volume,20)** (`handcheck_vsma`): vectorised rolling mean vs a from-scratch 20-bar window mean at three spot bars — **max |diff| = 1.82 × 10⁻¹²**.
- **Dwell counter** (`handcheck_dwell`): the vectorised `dwell := comp ? dwell[1]+1 : 0` array vs a from-scratch replay of the recurrence from bar 0 over a 200-bar window — **exact match (OK = True)**.
- **Gate re-derivation:** both worked examples above recompute all five entry conjuncts (armed / box-break / eff / strong-close / volume) and the frozen bracket from raw OHLCV and reproduce the ledger to the cent.

---

## PROOFS

- **py_compile:** `python3 -m py_compile backtests/bt_dt24_compression_dwell.py` → **OK (exit 0).**
- **Determinism (two independent runs):** ledger md5s **identical run 1 = run 2**, re-verified directly on the written files — center **`01f2cc855c61867209e2519a03cf57a6`**, best **`08ddf78f779f06db543db20f2bb59839`**, grid csv **`5184578fe5ba4f4917a989665964aedd`**. No RNG, no wall-clock.
- **2025 lockout:** 1m candles loaded **2 795 040**, min **2019-09-09 00:00:00+00:00**, max **2024-12-31 23:59:00+00:00**; **candles ≥ 2025-01-01 = 0**, `any_2025 = False`. 1h bars **46 584** (max open 2024-12-31 23:00 UTC). IS span **5.314 yr** minus 100-bar (ATR-100) warmup. No 2025+ candle enters any run.
- **Ambiguous / same-1m = LOSS:** a 1h bar spanning both stop and target is disambiguated on 1m; a single 1m bar touching both is booked the **stop**. Intrabar stop/target fills at the level with adverse slippage; bracket active only from bar i+2 (no look-ahead on the entry-bar ATR).

## Files

- Engine: `backtests/bt_dt24_compression_dwell.py`
- Report: `Strategy Codex/DaviddTech/backtests/DT24_COMPRESSION_DWELL.md`
- Ledgers: `Strategy Codex/DaviddTech/backtests/dt24_trades_center.csv`, `dt24_grid.csv` (27 cells), `dt24_trades_best.csv`
- Stats dump: `backtests/_dt24_stats.json`
