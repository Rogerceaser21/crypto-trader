❌ DEAD — center (0.3,1.5,4.0) is a net loser: expR **−0.163R** after costs over 352 IS trades, PF 0.80, Sharpe −0.82, t **−1.90**; center-region mean expR **−0.144 (<0)** and best-of-27 cell t **−0.375 (<2.0)** — the kill gate fails on two of three axes, and **all 27 grid cells have negative expR, PF<1, Sharpe<0, and every calendar year loses.** The "failed sweep of prior low, reclaim, trend-aligned" pattern carries **no directional edge** here — win rate sits *on the geometric break-even line* and costs sink it.

# DT5 — "Liquidity-Sweep Reversal" ("BTC/USD CRT v12", Candle Range Theory)

Causal, signal-only backtest of a DaviddTech library strategy from the **Smart-Money-Concepts / Candle-Range-Theory school** — a conceptual cousin of Annie's liquidity-sweep ideas, so the **concept verdict matters as much as the numbers.** Skeptical prior: naked counter-trend triggers died universally in the Annie campaign; this one is *trend-aligned* (close>EMA, RSI>50, ADX>15) but *reversal-shaped* (buy the reclaim after a stop-hunt of the prior low). It dies too — and cleanly.

**Source of truth:** `Strategy Codex/DaviddTech/research/pine/BTC_USD_Candle_Range_Theory.pine` (Pine v5, 50 lines). **Engine:** `backtests/bt_dt5_sweep_reversal.py`. The author's headline (**PF 2.30 / +11% / 51 trades / 2.5 y**) is **selection-only context — not evidence and not a target.** We test the signal at honest sizing (flat 1%-equity risk vs stop distance) with an **honest bracket** that fixes the Pine's sloppy exit (below).

---

## Spec (frozen, derived line-by-line from the Pine)

- **Bars:** 1h, built from 1m candles (UTC hourly buckets). **Long-only, flat only.** All entry conditions on the **closed** signal bar `i`; fill at the **next 1m open = the 1h open of bar i+1** (causal, no look-ahead).
- **Indicators (closed bar `i`):** `atr = ta.atr(14)` (Wilder RMA of TrueRange); `ema = ta.ema(close, ema_len)`; `rsi = ta.rsi(close, 14)` (Wilder); `adx = ta.dmi(14,14)` (ADX only).
- **Entry gate** (Pine lines 23–31): `low[i] < low[i−1] − min_sweep·atr[i]` (**the sweep**) ∧ `close[i] > low[i−1]` ∧ `close[i] < high[i−1]` (**closed back inside the prior bar's range**) ∧ `close[i] > open[i]` (**bullish body**) ∧ `close[i] > ema[i]` (**trend**) ∧ `rsi[i] > 50` (**momentum**) ∧ `adx[i] > 15` (**regime**) ∧ flat ∧ `atr[i]` defined & > 0.
- **Sizing:** flat 1%-of-(compounding)-equity risk vs the stop distance `= sl_mult·atr[i]`. `size = 0.01·equity / (sl_mult·atr[i])`.
- **Costs:** 0.05% fee/side, 0.02% slippage/fill, $10k start — identical to DT1–DT4 & `bt_engine.py`. **Sharpe** annualised at 24·365 = **8 760** 1h bars/yr.

### Honest-bracket divergence from the Pine (deliberate, stated)

The Pine exit (lines 33–46) is:
```
long_sl = close − atr·sl_mult ;  long_tp = close + atr·tp_mult
if low <= long_sl or high >= long_tp:  strategy.close("Long")
```
Two problems, both fixed here:

1. **Anchor.** The Pine anchors the bracket on the **signal-bar close**. We anchor on the **actual entry fill** (next-bar open + slippage) — the price you truly trade from. `stop = entry_fill − sl_mult·atr[i]`, `target = entry_fill + tp_mult·atr[i]`. Slightly more adverse, and honest.
2. **Straddle ordering.** The Pine's `low<=sl or high>=tp` is evaluated on **1h bars with no intrabar ordering**, so a bar that touches BOTH levels is booked however TradingView's broker guesses (typically the **favourable** tp fill). We resolve straddles on **1m data**; a 1m bar that touches both is booked as the **LOSS (stop)**. Stops that gap through the level fill at the worse open; target fills are capped at the target (a favourable gap grants nothing). **No time stop** (the Pine has none) → an un-hit trade runs to end-of-data.

> **The honesty tax the Pine never paid — measured:** at the center cell, **0 trades** were resolved as same-1m-bar ambiguous straddles, and **0 stops gapped through** the level. So DT5's death is **not** a costs/ambiguity artifact — it is the **raw signal being negative.** (With stop 1.5·ATR and target 4·ATR apart, no single 1m bar spans the ~5.5·ATR gap; the tax simply never bites, and it still loses.)

---

## Declared grid — 27 cells (fixed BEFORE any result)

`min_sweep {0.2, 0.3, 0.5}` × `sl_mult {1.0, 1.5, 2.0}` × `tp_mult {3.0, 4.0, 5.0}` = **3 × 3 × 3 = 27.** Pine defaults **(0.3, 1.5, 4.0) = CENTER.** Fixed across the grid: `ema_len 50`, `atr 14`, `rsi 14`, `adx(14,14) > 15`. **`ema_len {50, 100}`** sensitivity is on the **center cell only.** **Contingency (declared):** if the center yielded < 40 IS trades we would add `min_sweep 0.1` as a labelled post-hoc widening (informative only, cannot rescue the gate). **Not triggered — center has 352 trades.**

---

## Full results — all 27 cells (IS 2019-09-09 → 2024-12-31 minus warmup)

| min_sweep | sl_mult | tp_mult | trades | WR% | expR | PF | Sharpe | maxDD% | t |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 0.2 | 1.0 | 3.0 | 618 | 24.6 | −0.184 | 0.79 | −1.12 | 72.2 | −2.65 |
| 0.2 | 1.0 | 4.0 | 569 | 19.7 | −0.185 | 0.80 | −0.92 | 69.7 | −2.21 |
| 0.2 | 1.0 | 5.0 | 545 | 16.5 | −0.179 | 0.82 | −0.78 | 68.5 | −1.87 |
| 0.2 | 1.5 | 3.0 | 558 | 33.0 | −0.120 | 0.84 | −0.85 | 58.6 | −2.01 |
| 0.2 | 1.5 | 4.0 | 506 | 27.5 | −0.103 | 0.87 | −0.60 | 54.1 | −1.41 |
| 0.2 | 1.5 | 5.0 | 475 | 23.8 | −0.079 | 0.91 | −0.40 | 47.6 | −0.93 |
| 0.2 | 2.0 | 3.0 | 515 | 40.6 | −0.067 | 0.90 | −0.53 | 46.2 | −1.24 |
| 0.2 | 2.0 | 4.0 | 456 | 34.2 | −0.056 | 0.92 | −0.35 | 39.2 | −0.83 |
| 0.2 | 2.0 | 5.0 | 419 | 29.4 | **−0.053** | 0.93 | −0.29 | 38.1 | −0.68 |
| 0.3 | 1.0 | 3.0 | 395 | 25.6 | −0.146 | 0.83 | −0.72 | 52.1 | −1.66 |
| 0.3 | 1.0 | 4.0 | 379 | 21.1 | −0.115 | 0.88 | −0.48 | 56.4 | −1.09 |
| 0.3 | 1.0 | 5.0 | 374 | 16.8 | −0.159 | 0.84 | −0.59 | 62.4 | −1.37 |
| 0.3 | 1.5 | 3.0 | 371 | 31.0 | −0.181 | 0.76 | −1.08 | 55.8 | −2.51 |
| **0.3** | **1.5** | **4.0** | **352** | **25.9** | **−0.163** | **0.80** | **−0.82** | **54.8** | **−1.90 ◄CENTER** |
| 0.3 | 1.5 | 5.0 | 343 | 21.3 | −0.188 | 0.78 | −0.84 | 55.8 | −1.96 |
| 0.3 | 2.0 | 3.0 | 347 | 38.6 | −0.118 | 0.82 | −0.79 | 43.1 | −1.80 |
| 0.3 | 2.0 | 4.0 | 321 | 32.7 | −0.102 | 0.86 | −0.56 | 42.2 | −1.30 |
| 0.3 | 2.0 | 5.0 | 312 | 27.9 | −0.107 | 0.86 | −0.52 | 43.7 | −1.20 |
| 0.5 | 1.0 | 3.0 | 141 | 26.2 | −0.115 | 0.87 | −0.34 | 30.6 | −0.78 |
| 0.5 | 1.0 | 4.0 | 141 | 22.0 | **−0.066** | 0.93 | −0.16 | 30.8 | **−0.38 ◄best-t** |
| 0.5 | 1.0 | 5.0 | 140 | 17.9 | −0.093 | 0.90 | −0.21 | 38.9 | −0.48 |
| 0.5 | 1.5 | 3.0 | 135 | 31.1 | −0.173 | 0.77 | −0.63 | 28.9 | −1.44 |
| 0.5 | 1.5 | 4.0 | 135 | 25.9 | −0.156 | 0.81 | −0.49 | 30.9 | −1.12 |
| 0.5 | 1.5 | 5.0 | 134 | 22.4 | −0.137 | 0.84 | −0.39 | 34.7 | −0.87 |
| 0.5 | 2.0 | 3.0 | 130 | 39.2 | −0.099 | 0.85 | −0.41 | 23.5 | −0.92 |
| 0.5 | 2.0 | 4.0 | 129 | 33.3 | −0.080 | 0.89 | −0.29 | 23.7 | −0.64 |
| 0.5 | 2.0 | 5.0 | 128 | 28.9 | −0.068 | 0.91 | −0.22 | 29.9 | −0.48 |

**`ema_len` sensitivity (center cell, only ema_len varied):**

| ema_len | trades | WR% | expR | PF | Sharpe | maxDD% | t |
|---:|---:|---:|---:|---:|---:|---:|---:|
| **50 (default)** | 352 | 25.9 | −0.163 | 0.80 | −0.82 | 54.8 | −1.90 |
| 100 | 326 | 27.0 | −0.120 | 0.85 | −0.57 | 49.5 | −1.32 |

A longer trend filter trims a few of the worst trades but **stays firmly negative** — the trend-length knob does not hide an edge.

### Structure of the surface (read this before the verdict)

1. **There is no positive corner anywhere.** All 27 cells: **expR < 0, PF < 1, Sharpe < 0, t < 0.** The "least-bad" cell is (0.2, 2.0, 5.0) at expR −0.053 (still a loser). This is not a fragile ridge with one good basin — it is a uniformly negative surface.
2. **Win rate sits ON the geometric break-even line — the filters add zero edge.** For a fixed-bracket long, break-even WR (before costs) = `sl/(sl+tp)`. Compare achieved WR to that line:
   - sl1.0/tp3.0 → BE **25.0%**; achieved 24.6 / 25.6 / 26.2% — *on the line.*
   - sl1.5/tp4.0 (center) → BE **27.3%**; achieved 27.5 / 25.9 / 25.9% — *on or below.*
   - sl2.0/tp3.0 → BE **40.0%**; achieved 40.6 / 38.6 / 39.2% — *on or below.*
   The sweep + close-inside + trend + RSI + ADX stack lifts the hit rate to **no better than a coin flip at the payoff ratio.** With gross expectancy ≈ 0 by construction, the ~0.14% round-trip cost (plus targets capped at level while stops fill at level) turns **every** cell net-negative. **The pattern predicts nothing; the geometry + costs do the rest.**
3. **Wider stops / higher targets only shrink the loss toward zero** (more break-even-ish WR, smaller per-trade cost drag) — they never cross into positive. `sl_mult 1.0` (tight stop) is worst (WR far below BE, deepest drawdowns to 72%); the whole gradient points *away* from a survivable region, not toward one.

---

## Center-region analysis

Center + one-grid-step neighbours on each axis (7 cells):

| cell (min_sweep, sl_mult, tp_mult) | trades | expR | PF | Sharpe | t | maxDD% |
|---|---:|---:|---:|---:|---:|---:|
| **(0.3, 1.5, 4.0) center** | 352 | −0.163 | 0.80 | −0.82 | −1.90 | 54.8 |
| (0.2, 1.5, 4.0) | 506 | −0.103 | 0.87 | −0.60 | −1.41 | 54.1 |
| (0.5, 1.5, 4.0) | 135 | −0.156 | 0.81 | −0.49 | −1.12 | 30.9 |
| (0.3, 1.0, 4.0) | 379 | −0.115 | 0.88 | −0.48 | −1.09 | 56.4 |
| (0.3, 2.0, 4.0) | 321 | −0.102 | 0.86 | −0.56 | −1.30 | 42.2 |
| (0.3, 1.5, 3.0) | 371 | −0.181 | 0.76 | −1.08 | −2.51 | 55.8 |
| (0.3, 1.5, 5.0) | 343 | −0.188 | 0.78 | −0.84 | −1.96 | 55.8 |
| **mean expR** | | **−0.144** | | | | |

**Every neighbour is negative** (range −0.10 to −0.19). The region-mean expR is **−0.144 < 0** — the kill gate's first criterion fails outright, and it fails with *margin*, not by a whisker. The center is not a peak on a positive surface; it is an ordinary point on a negative plane.

**Best cell & multiplicity caveat.** "Best" by max-t over the 27 cells = **(0.5, 1.0, 4.0)**: n=141, WR 22.0%, expR **−0.066**, PF 0.93, Sharpe −0.16, **t −0.375.** It is the *least-negative* cell, still a **losing** configuration, and its t is negative — nowhere near the +2.0 bar. Because we searched 27 cells, even this "best" is an optimistic upper bound on a distribution whose entire mass is below zero.

---

## KILL CRITERIA (verbatim) & verdict

> **DEAD unless center-region expR after costs > 0 AND ≥ 40 IS trades at center AND best-cell t ≥ 2.0.**

| Criterion | Threshold | Actual | Pass |
|---|---|---|---|
| Center-region expR after costs | > 0 | **−0.144** (mean of 7 cells) | ❌ |
| IS trades at center | ≥ 40 | **352** | ✅ |
| Best-cell t | ≥ 2.0 | **−0.375** (cell 0.5,1.0,4.0) | ❌ |

Two of three fail → **❌ DEAD.** This is the **first outright-dead strategy in the DT family** (DT1 strong, DT2/DT3 clear survivors, DT4 marginal survivor) — and, tellingly, it is the one shaped like a **liquidity-sweep reversal.** The death is robust, not marginal:
- **Every one of 27 cells loses** (expR −0.05 to −0.19; PF 0.76–0.93).
- **Every calendar year loses** at center: 2019 −0.27, 2020 −0.07, 2021 −0.14, 2022 −0.48, 2023 −0.12, 2024 −0.06 (mean R/yr). No single-regime artifact — it bleeds through bull, bear, and chop.
- **Drawdowns are large** (center maxDD 54.8% of equity; the tight-stop corner reaches 72%).
- **The honesty tax was zero and it still died** (0 ambiguous 1m straddles, 0 gap-through stops at center) — so this is the raw pattern, not an execution penalty.

---

## Ambiguous-bar count (the honesty tax his engine never paid)

At the **center cell: 0 of 352 trades** were resolved as same-1m-bar ambiguous straddles (both stop and target touched inside one 1m bar → booked as loss), and **0 stops gapped through** the level. Exit mix: **261 stops (74.1%) / 91 targets (25.9%).** The favourable-straddle loophole in the Pine's 1h `low<=sl or high>=tp` exit therefore *could* only ever have helped it at the margin — and here it wouldn't have helped at all, because the stop (1.5·ATR) and target (4·ATR) are ~5.5·ATR apart, far wider than any 1m bar. **The strategy is a net loser on the merits, with no honesty tax owed.**

---

## CONCEPT verdict — does "failed sweep of prior low in an uptrend" carry any signal?

**No — not as a mechanical trigger, on BTC 1h, 2019–2024.** The Candle-Range-Theory / SMC thesis is that a wick below the prior low that *reclaims* into the prior range is a **stop-hunt-then-reversal** — a high-probability long. Mechanized into six explicit conditions (sweep depth, close-back-inside, bullish body, trend, RSI>50, ADX>15), that thesis produces a hit rate that lands **exactly on the payoff-ratio break-even line** and **never above it** — i.e. the "reversal" is statistically indistinguishable from entering long at random with the same bracket. The sweep depth doesn't help (0.2 vs 0.3 vs 0.5·ATR all lose); requiring a *deeper* reclaim, wider stop, or higher target only shrinks the loss toward the cost floor. The worked examples below show textbook setups — a clean 0.33·ATR sweep-and-reclaim, and a violent 4·ATR wick-and-reclaim — **both stop out.**

**What this means for Annie's liquidity-sweep ideas.** It is a direct, same-school corroboration of the campaign's recurring finding: **a naked, mechanized sweep/reclaim trigger has no edge**, even when trend-aligned (this one demanded close>EMA, RSI>50, ADX>15 and *still* died — so "counter-trend" was never the sole culprit; the *reversal shape itself* is the problem). If Annie's liquidity-sweep concept has value, that value must live in the **discretionary context she layers on top** — HTF market structure, session/time-of-day, specific swing-point selection, confluence, and trade management — none of which this 6-condition mechanization captures. The takeaway for her rulebook: **do not deploy "sweep of prior low + reclaim" as a standalone entry.** Treat a raw sweep as *at best* a location filter that needs an independent, separately-validated edge to fire alongside it — never as the trigger itself. Extraordinary claims (SMC "stop-hunt reversal") require the extra context to be the thing carrying the signal, and this test shows the raw pattern is not.

---

## Benchmark & sibling comparison

**vs C2** (the campaign's Krown reference): C2 center Sharpe **0.93** / MAR **0.96**; C2 best-gated Sharpe **1.44** / MAR **2.56**. DT5 center Sharpe **−0.82** (MAR negative — equity ends −46%). DT5 does not merely underperform C2's ceiling; it fails to clear zero. It is not on the same axis as a survivor.

**vs sibling DaviddTech tests** (same engine, costs, window): DT1 +0.90R (Sharpe 1.30), DT2 +0.30R (1.29), DT3 +0.28R (1.10), DT4 +0.51R (1.07, marginal). **DT5 −0.16R (Sharpe −0.82)** is the lone loser — the SMC/CRT reversal is the shape that breaks the family's streak.

**Weekly-R correlation (DT5 center ledger vs siblings' center ledgers):**
- vs **DT1** (4h Trend Rider): Pearson **+0.031** (46 overlapping active weeks) — uncorrelated.
- vs **DT2** (4h Vol-Surge): Pearson **+0.073** (107 weeks) — uncorrelated.
- vs **DT3** (1h KAMA+Squeeze): Pearson **+0.149** (138 weeks) — mildly positive (both long-only BTC on lower TF).
- vs **DT4** (15m RSI-Dip): Pearson **+0.038** (53 weeks) — uncorrelated.

Low correlation is normally a diversification argument — but only for a *positive* edge. A near-uncorrelated **negative-expectancy** stream is not a diversifier; it is an independent way to lose money. There is nothing here to blend.

---

## Worked examples (real timestamps, hand-traced, fully causal)

**Example A — textbook shallow sweep, still a loss (−1.14R).** Signal bar **2019-09-13 11:00 UTC** (bar 107). Prior bar: low 10272.02, high 10323.51. ATR(14)=60.15, `min_sweep 0.3` → sweep threshold = 10272.02 − 0.3·60.15 = **10253.97**; bar low **10251.99 < 10253.97** ✓ (**sweep depth 0.33·ATR** — just breaches). Close **10306.52 > prev_low 10272.02** ✓ and **< prev_high 10323.51** ✓ (reclaimed inside). Bullish body (10306.52 > open 10272.91) ✓; close > EMA₅₀ 10248.71 ✓; RSI 53.29 > 50 ✓; ADX 29.60 > 15 ✓. **Enter next bar open** 10306.52, fill **10308.58** (+0.02%). stop = 10308.58 − 1.5·60.15 = **10218.35**; target = 10308.58 + 4·60.15 = **10549.20**. Price rolls over; the 1m low breaches the stop **5 bars later**; exit_ref 10218.35, fill 10216.31 (adverse), net **−113.6 → −1.136R** (worse than −1R by the round-trip cost). Causal: all gates ≤ bar 107; fill = open[108]; bracket tested from the entry bar's 1m stream on.

**Example B — violent 4·ATR sweep-and-reclaim, still a loss (−1.12R).** Signal bar **2019-09-15 01:00 UTC** (bar 145). Prior bar: low 10312.05, high 10359.20. ATR 69.59, threshold = 10312.05 − 0.3·69.59 = 10291.17; bar low **10024.81** ≪ threshold ✓ (**sweep depth 4.13·ATR** — a deep stop-run wick). Close **10332.65** reclaims inside (> 10312.05, < 10359.20) ✓; bullish body ✓; close > EMA₅₀ 10305.66 ✓; RSI 51.02 > 50 ✓ (barely); ADX 18.25 > 15 ✓. **Enter** 2019-09-15 02:00 open 10331.84, fill **10333.91**. stop = 10333.91 − 1.5·69.59 = **10229.52**; target = 10333.91 + 4·69.59 = **10612.26**. The "reversal" fails — stop hit **34 bars later**, R **−1.118**. The archetypal deep-sweep reclaim the concept is built on resolves as a loss.

Both of the first two center trades are losses — representative of a 25.9% win-rate ledger where 261 of 352 trades stop out.

---

## Indicator hand-check (re-derivable)

Five consecutive real 1h bars, **2020-04-08 14:00–18:00 UTC**, center params (ema_len 50). A reviewer can recompute each gate from raw candles:

| bar | time | open | high | low | close | prev_low | prev_high | EMA₅₀ | RSI | ADX | ATR | close>EMA | RSI>50 | ADX>15 |
|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|:--:|:--:|:--:|
| 5102 | 14:00 | 7217.99 | 7269.44 | 7216.40 | 7267.67 | 7192.00 | 7306.18 | 7222.12 | 49.90 | 16.17 | 87.62 | ✓ | ✗ | ✓ |
| 5103 | 15:00 | 7267.50 | 7299.00 | 7252.00 | 7273.79 | 7216.40 | 7269.44 | 7224.15 | 50.46 | 15.14 | 84.72 | ✓ | ✓ | ✓ |
| 5104 | 16:00 | 7273.81 | 7332.00 | 7250.00 | 7319.15 | 7252.00 | 7299.00 | 7227.87 | 54.54 | 14.73 | 84.53 | ✓ | ✓ | ✗ |

**None of these is an entry** — the **sweep** condition (`low < prev_low − 0.3·ATR`) is not met on any of them (e.g. bar 5103 low 7252.00 vs threshold 7216.40 − 25.4 = 7191; nowhere near), and bar 5102 also fails RSI>50 while bar 5104 fails ADX>15. Illustrates that the sweep is the rare, binding trigger while the momentum/regime gates prune around it. Faithful gate behaviour.

**Unit / independent checks** (in `bt_dt5_sweep_reversal.py`):
- **RSI** (`_handcheck_rsi`): Wilder RSI(3) on a known 8-bar series reproduces a from-scratch hand-computation to < 1e-9 (bar 3 = 85.7143, bar 6 = 45.4054).
- **ATR** (`_handcheck_atr`): vectorised ATR(14) vs an independent slow Wilder loop over 5 real bars — **max abs diff 0.0** (bit-identical).
- **Bracket resolver** (`_handcheck_bracket`): synthetic 1m tape confirms tp-only → tp, stop-only → stop, and **both-in-one-bar → stop (LOSS)** — the ambiguous=loss rule verified.

---

## PROOFS

- **py_compile:** `python3 -m py_compile backtests/bt_dt5_sweep_reversal.py` → **OK (exit 0).**
- **Determinism (two independent runs):** center-ledger md5 run1 = run2 = **`fab8b58f74f4853d5c532299028ae088`** (identical). best-ledger md5 = **`eb6f7d3d56dbda99fa535d9a19aa4a05`**; grid-csv md5 = **`15b63f492c537e7537afb0b3c7e52cd6`** — both identical across the two runs. No RNG, no wall-clock.
- **2025 lockout:** 1m candles loaded **2,795,040**, min **2019-09-09 00:00:00+00:00**, max **2024-12-31 23:59:00+00:00**; `any_2025 = False`. 1h bars **46,584** (max 2024-12-31 23:00 UTC). The source parquet extends to 2026-07-11 — the strict `< 2025-01-01 00:00 UTC` filter removes it; no 2025+ candle enters any run.
- **Ambiguous / gap = LOSS:** bracket resolved on 1m tie-break; same-1m-bar straddle → stop (loss); stop gap-through → worse open; target capped at level. At center: **0 ambiguous, 0 gap-through**, 261 stops / 91 targets.

## Files

- Engine: `backtests/bt_dt5_sweep_reversal.py`
- Report: `Strategy Codex/DaviddTech/backtests/DT5_SWEEP_REVERSAL.md`
- Ledgers: `Strategy Codex/DaviddTech/backtests/dt5_trades_center.csv`, `dt5_grid.csv` (27 cells), `dt5_trades_best.csv`
- Stats dump: `backtests/_dt5_stats.json`
