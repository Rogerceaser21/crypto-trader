✅ SURVIVES — clears ALL THREE kill gates decisively and is the strongest DT-bench result to date: center (2.0,1.5,3.0) **n = 161 IS trades, expR +0.335R, PF 1.62, Sharpe 1.09, t = 2.497**; center-region mean expR **+0.333R**; **best-cell t = 2.933** (2.0,1.5,2.0). Uniquely, the edge is **not tail-driven** — at center the biggest single winner is only **5.5%** of total R and the **top-3 = 16.5%**; drop the three fattest trades and the edge is still **+0.285R, t = 2.13**. **All 27 cells are expR-positive and 22 of 27 clear t ≥ 2.0.** A genuinely **NEW ENGINE**: distinct volume-confirmation mechanism, max weekly-R correlation to the book is only **+0.447** (DT3). IS-only — advances to the locked 2025-26 OOS run + Jesse cross-validation before any deployment claim.

# DT23 — "Volume-Spike Confirmation" (v5F A3, 4h BTC)

Causal, signal-only backtest of the hand-defined research archetype **"v5F A3 Volume Spike"** — BTC bench **wave 6 of 7**. This is an **honest, hand-authored** archetype (not a scraped library strategy); it was the **first reserve** for the original top-5 selection. Its mechanism — a **volume-confirmed trend-continuation long** — is **distinct from every prior DT engine** (which key off stochastics, RSI, KAMA, EMA-cross or DMI). The question this task settles: does a volume-spike gate on a 4h uptrend produce a real, robust, *additive* edge, or is it a re-skin of a trend engine we already own? **It is a real, robust, additive edge.**

**Source of truth:** `Strategy Codex/DaviddTech/research/pine/v5F_A3_Volume_Spike_4h.pine` (Pine v5, 29 lines). **Engine:** `backtests/bt_dt23_volume_spike.py`. The author's headline (**PF 1.77 / +11% / DD 2.3% / 137 trades / ~4y**) is **selection-only context — not evidence and not a target.** The **+11%** comes off `default_qty_type=percent_of_equity, default_qty_value=10` (10%-of-equity fixed sizing) and the **DD 2.3%** off that same tiny sizing — both are artefacts of the author's position size, not the signal. We **strip** the 10%-equity sizing and test the raw signal at a flat, honest **1%-of-equity risk vs the frozen ATR stop distance**. (Notably, the author's **PF 1.77** lands close to our honest center **PF 1.62** — the headline was *not* a pure leverage illusion, unlike the +241%/+258% return claims of DT20/DT21.)

---

## Spec (frozen, derived line-by-line from the Pine)

- **Bars:** 4h, built from 1m (UTC buckets 00/04/08/12/16/20). **Long-only, flat only** (pyramiding 0). All entry conditions on the **closed** 4h bar `i`; fill at the **next 1m open = the 4h open of bar i+1** (causal, no look-ahead).
- **Indicators** (Pine 9–13): `vsma = ta.sma(volume,20)`; `ema20 = ta.ema(close,20)`; `ema200 = ta.ema(close,200)`; `atr = ta.atr(14)` (Wilder RMA of TrueRange); `upperHalf = close ≥ low + 0.5·(high−low)` (close in the upper half of the bar's range).
- **Entry gate** (Pine 14): `volume > vsma·volume_mult` ∧ `close > open` ∧ `upperHalf` ∧ `close > ema20` ∧ `close > ema200`. Five conjuncts: a **volume spike**, a **green bar closing strong**, above **both** the fast and slow trend EMAs. Warm-up gate `bar_index ≥ 200` (EMA200 span) enforces causal history.
- **Exits** (Pine 15–28). `pendRisk = atr_stop_mult · ATR(14)` captured on the **signal bar** and **frozen at entry**. `stop = entry − pendRisk`, `target = entry + reward_r · pendRisk` — **both FIXED from the entry price** (not trailing). While in position:
  - **stop / target** are tested **intrabar** (via 1m) throughout the hold. If the same 4h bar touches **both**, 1m data disambiguates fill order; a single 1m bar that touches **both** is **ambiguous = LOSS** (booked as the stop). Unresolved = stop. Fill = **at the level with adverse slippage** (house `bt_engine` convention).
  - **EMA20 close-exit:** on any **closed** 4h bar with `close < ema20`, **market-exit at the next 1m open** (= next 4h open). The intrabar stop/target (fires mid-bar) **takes precedence** over the same bar's close-exit (fires at the close).
  - The stop/target levels are computed off the **raw** next-bar open (Pine `position_avg_price`, no slippage); slippage is applied only to the **fills**.
- **Sizing / RISK UNIT (declared):** flat **1%-of-(compounding)-equity** risk vs `pendRisk`. `size = 0.01·equity / pendRisk`; `R = net / (equity·1%)`. Long-only, compounding. R-space metrics (expR/PF/WR/t/maxDD_R) are invariant to compounding-vs-fixed sizing.
- **Costs:** 0.05% fee/side, 0.02% slippage/fill, $10k start — identical to DT1/DT2/DT3 & `bt_engine.py`. **Sharpe** annualised at 6·365 = **2 190** 4h bars/yr.

**Fill-model divergence from Pine (stated):** Pine `process_orders_on_close=false` fills the market entry at the next bar's open — we match that on entries and the EMA close-exit. Strictly causal: every gate uses only closed-bar data ≤ `i`; fills at `open[i+1]`.

---

## Declared grid — 27 cells (fixed BEFORE any result)

`volume_mult {1.5, 2.0, 2.5}` × `atr_stop_mult {1.0, 1.5, 2.0}` × `reward_r {2.0, 3.0, 4.0}` = **3 × 3 × 3 = 27.** Pine defaults **(2.0, 1.5, 3.0) = CENTER.** Fixed across the grid: `vsma` length 20, EMA 20/200, ATR 14, the four non-volume entry conjuncts, and the EMA20 close-exit. No other cells, no post-hoc additions.

---

## Full results — all 27 cells (IS 2019-09-09 → 2024-12-31 minus 200-bar warmup)

| volume_mult | atr_stop | reward_r | n | WR% | expR | PF | Sharpe | maxDD% | t |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1.5 | 1.0 | 2.0 | 383 | 39.4 | 0.125 | 1.21 | 0.75 | 13.8 | 1.730 |
| 1.5 | 1.0 | 3.0 | 328 | 32.9 | 0.191 | 1.29 | 0.89 | 13.3 | 1.964 |
| 1.5 | 1.0 | 4.0 | 292 | 31.5 | 0.301 | 1.45 | 1.15 | 13.6 | 2.501 |
| 1.5 | 1.5 | 2.0 | 301 | 41.2 | 0.221 | 1.46 | 1.29 | 8.5 | 2.917 |
| 1.5 | 1.5 | 3.0 | 266 | 35.0 | 0.229 | 1.44 | 1.07 | 9.5 | 2.349 |
| 1.5 | 1.5 | 4.0 | 243 | 34.6 | 0.336 | 1.66 | 1.33 | 10.0 | 2.861 |
| 1.5 | 2.0 | 2.0 | 262 | 40.1 | 0.198 | 1.49 | 1.20 | 8.4 | 2.691 |
| 1.5 | 2.0 | 3.0 | 234 | 37.6 | 0.269 | 1.67 | 1.34 | 7.6 | 2.904 |
| 1.5 | 2.0 | 4.0 | 222 | 36.9 | 0.287 | 1.72 | 1.29 | 7.6 | 2.720 |
| 2.0 | 1.0 | 2.0 | 217 | 43.3 | 0.233 | 1.40 | 1.02 | 11.9 | 2.359 |
| 2.0 | 1.0 | 3.0 | 192 | 36.5 | 0.348 | 1.55 | 1.17 | 11.5 | 2.613 |
| 2.0 | 1.0 | 4.0 | 175 | 33.1 | 0.436 | 1.65 | 1.21 | 14.5 | 2.653 |
| **2.0** | **1.5** | **2.0** | **185** | **44.3** | **0.298** | **1.61** | **1.29** | **7.9** | **2.933** ◄ best |
| **2.0** | **1.5** | **3.0** | **161** | **37.9** | **0.335** | **1.62** | **1.09** | **10.3** | **2.497** ◄ **CENTER** |
| 2.0 | 1.5 | 4.0 | 151 | 35.8 | 0.419 | 1.76 | 1.22 | 11.9 | 2.599 |
| 2.0 | 2.0 | 2.0 | 163 | 42.3 | 0.275 | 1.64 | 1.22 | 9.0 | 2.730 |
| 2.0 | 2.0 | 3.0 | 148 | 38.5 | 0.329 | 1.75 | 1.21 | 9.6 | 2.596 |
| 2.0 | 2.0 | 4.0 | 142 | 37.3 | 0.373 | 1.83 | 1.23 | 10.0 | 2.521 |
| 2.5 | 1.0 | 2.0 | 130 | 43.8 | 0.226 | 1.38 | 0.78 | 10.8 | 1.760 |
| 2.5 | 1.0 | 3.0 | 121 | 35.5 | 0.289 | 1.43 | 0.76 | 13.4 | 1.719 |
| 2.5 | 1.0 | 4.0 | 113 | 33.6 | 0.393 | 1.57 | 0.85 | 14.0 | 1.931 |
| 2.5 | 1.5 | 2.0 | 116 | 46.6 | 0.315 | 1.62 | 1.04 | 6.8 | 2.398 |
| 2.5 | 1.5 | 3.0 | 105 | 41.9 | 0.376 | 1.69 | 0.97 | 8.6 | 2.234 |
| 2.5 | 1.5 | 4.0 | 98 | 39.8 | **0.520** | **1.94** | 1.19 | 10.5 | 2.508 |
| 2.5 | 2.0 | 2.0 | 104 | 47.1 | 0.292 | 1.68 | 0.98 | 7.5 | 2.285 |
| 2.5 | 2.0 | 3.0 | 95 | 43.2 | 0.394 | 1.90 | 1.11 | 9.1 | 2.410 |
| 2.5 | 2.0 | 4.0 | 93 | 41.9 | 0.402 | 1.91 | 0.99 | 8.2 | 2.191 |

**Structure of the surface (read this before the verdict):**
1. **Every one of the 27 cells is expR-positive** (from +0.125 to +0.520), and **22 of 27 clear t ≥ 2.0.** The *sign* and the *significance* of the edge — "buy a strong-closing green 4h bar on a volume spike, above both the 20- and 200-EMA" — are robust across essentially the whole parameter box. This is categorically different from every prior DT bench result, where positivity was fragile and significance was the exception (DT22: max t 1.48; DT4: single cell at 2.04).
2. **The 5 sub-2.0 cells are all `atr_stop = 1.0`** at the `volume_mult` corners (1.5 and 2.5). A 1.0×ATR stop is too tight for a 4h continuation trade — it gets whipsawed out before the move develops (WR holds but expR/Sharpe sag: the 1.0 rows carry the highest maxDD% and lowest Sharpe). Loosening the stop to 1.5–2.0× lifts every one of those corners above 2.0. The stop distance, not the volume threshold, is the only soft axis.
3. **Higher `reward_r` monotonically lifts expR** (e.g. at center-volume/center-stop: 0.298 → 0.335 → 0.419 for r = 2/3/4) while trading WR down — the classic low-WR/high-RR trend profile. r = 4 maximises per-trade expectancy; r = 2 maximises Sharpe (tighter, more frequent wins). The book can pick along that axis; the *sign* survives everywhere.
4. **`volume_mult` trades sample size against per-trade quality:** 1.5 gives n ≈ 220–380 at expR ≈ 0.13–0.34; 2.5 gives n ≈ 90–130 at expR ≈ 0.23–0.52. The 2.0 center is the balance point — enough trades (n ≥ 142 across its 9 cells) at strong expectancy.

---

## Tail-dependence (mandatory — and this is where DT23 separates itself)

Center cell (2.0,1.5,3.0), **161 trades, total +53.93R**, 61 wins / 100 losses (a 38%-WR system living on 3:1 winners):

| slice | trades | expR | t | share of total R |
|---|---:|---:|---:|---:|
| **all** | 161 | **+0.335** | **2.497** | 100% |
| top-1 winner alone | 1 | — | — | **5.5%** (2.96R) |
| top-3 winners | 3 | — | — | **16.5%** (8.89R) |
| **drop top-1** | 160 | **+0.319** | **2.38** | 94.5% |
| **drop top-3** | 158 | **+0.285** | **2.13** | 83.5% |

**This is the opposite of tail dependence.** The single biggest winner is **5.5%** of six years of profit (vs DT22's **62%**); the top-3 are **16.5%** (vs DT22's **112%**). Excise the three fattest trades and the edge is **still +0.285R at t = 2.13** — i.e. the remaining 158 trades, stripped of their best three, are *individually significant on their own*. Because the target caps every winner at ~3R and no single trade can run further, the P&L is spread across dozens of wins rather than concentrated in one lottery ticket. **This is a distributional edge, not a fat-tail artefact** — the property every prior DT survivor lacked.

Best cell (2.0,1.5,2.0) is even flatter: top-1 = **3.6%**, top-3 = **10.7%**, drop-top-3 → **+0.271R, t = 2.65.**

---

## KILL CRITERIA (verbatim) & verdict

> **DEAD unless center-region expR after costs > 0 AND ≥40 IS trades at center AND best-cell t ≥ 2.0.**

| Criterion | Threshold | Actual | Pass |
|---|---|---|---|
| Center-region expR after costs | > 0 | **+0.333** (mean of 7 cells) | ✅ |
| IS trades at center | ≥ 40 | **161** | ✅ |
| Best-cell t | ≥ 2.0 | **2.933** (2.0,1.5,2.0) | ✅ |

**All three gates PASS → ✅ SURVIVES.** And not marginally: the center itself (not just the best cell) is significant at **t = 2.497**; the center trades **161 times** (4× the 40-trade floor); and the best-cell t of **2.933** clears the 2.0 bar by nearly a full sigma. The margin above every gate is the widest in the DT bench.

**Skeptical caveat (per project rule "too-good = look-ahead until proven causal"):** this is the strongest result in the bench, so it earns extra scrutiny — see PROOFS. Causality was verified line-by-line: entry gates use only closed-bar data ≤ i, fill at open[i+1]; ATR frozen at the signal bar; stop/target from the entry open; intrabar exits read only 1m bars *inside* the holding bar; ambiguous = LOSS; EMA-exit fills next open; flat-only (no overlapping positions); hard 2025 lockout with **0 candles ≥ cutoff**. The profile — **38% WR, PF 1.6, Sharpe 1.1** — is a textbook low-WR/high-RR volume-confirmed trend system, *not* an implausible 79%-WR flag. **SURVIVES = advances to the locked OOS 2025-26 run + Jesse cross-validation**, not "deployable today."

---

## Center-region analysis

Center + one-grid-step neighbours on each axis (7 cells):

| cell (vol_mult, atr_stop, reward_r) | n | expR | PF | Sharpe | t |
|---|---:|---:|---:|---:|---:|
| **(2.0,1.5,3.0) center** | 161 | 0.335 | 1.62 | 1.09 | **2.497** |
| (1.5,1.5,3.0) | 266 | 0.229 | 1.44 | 1.07 | 2.349 |
| (2.5,1.5,3.0) | 105 | 0.376 | 1.69 | 0.97 | 2.234 |
| (2.0,1.0,3.0) | 192 | 0.348 | 1.55 | 1.17 | 2.613 |
| (2.0,2.0,3.0) | 148 | 0.329 | 1.75 | 1.21 | 2.596 |
| (2.0,1.5,2.0) | 185 | 0.298 | 1.61 | 1.29 | 2.933 |
| (2.0,1.5,4.0) | 151 | 0.419 | 1.76 | 1.22 | 2.599 |
| **mean expR** | | **+0.333** | | | |

The region is a **broad, high, uniformly-significant plateau**: all 7 cells sit between **expR +0.229 and +0.419** and between **t 2.23 and 2.93.** The center is not a fragile peak (DT4) nor an insignificant mound (DT22) — it is a genuine table-top. Every one-step move keeps expR ≥ +0.23 and t ≥ 2.23. There is no direction you can perturb the parameters that breaks significance.

**Best cell & multiplicity caveat.** Best by max-t = **(2.0, 1.5, 2.0)**: n = 185, WR 44.3%, expR +0.298, PF 1.61, Sharpe **1.293**, maxDD **7.9%**, **t 2.933**, CAGR ≈ 10.7%, **MAR 1.37**. Two honest cautions: (a) it is the **maximum** t over 27 cells, so a small multiplicity haircut applies — but here it is moot, because the *center itself* clears the gate at t 2.497 and the *entire region* is significant, so the verdict does **not** depend on cherry-picking the best cell (unlike DT4/DT22, where only the max cell approached the bar). (b) The best cell simply picks the tighter r = 2 target, buying Sharpe/MAR at the cost of raw expectancy — a sizing preference, not a different edge. **Tail multiplicity is a non-issue** given 22/27 cells clear 2.0 and all 27 are positive.

---

## Exit mix at center (161 trades)

| exit type | count | share | mechanics |
|---|---:|---:|---|
| stop (intrabar, fixed) | 71 | 44.1% | `entry − 1.5·ATR₍entry₎`, tested on 1m within each hold bar; both-touched 4h bar → 1m tie-break; same-1m both → LOSS |
| target (intrabar, fixed) | 45 | 28.0% | `entry + 3.0·1.5·ATR₍entry₎` = `entry + 4.5·ATR`; a clean 3R win |
| EMA20 close-exit (market) | 45 | 28.0% | closed 4h bar `close < ema20` → market next open; **16 of these close in profit, 29 at a loss** |

**Three working exit modes, none dominant.** Unlike DT22 (100% single moving-stop) or DT20 (100% opposite-cross), DT23's P&L is a genuine blend: the fixed 3R target harvests the ~28% of trades that run, the fixed stop cuts the ~44% that fail immediately, and the EMA20 close-exit gracefully retires the ~28% that stall between the two levels (booking a small win or small loss instead of waiting for a full stop-out). This three-legged exit is a large part of *why* the tail stays flat — winners are capped and stalled trades are cut early, so no single trade dominates.

---

## Benchmark, sibling correlation & new-engine call

**vs C2** (the campaign's Krown reference): C2 center Sharpe **0.93** / MAR **0.96**; C2 best-gated Sharpe **1.44** / MAR **2.56**.
- **DT23 center Sharpe 1.095 / MAR 1.007 — ABOVE C2's center on BOTH axes.** DT23 is the **first DT-bench engine to beat C2's center** on Sharpe *and* MAR simultaneously.
- DT23 best (2.0,1.5,2.0) Sharpe **1.293** / MAR **1.366** — Sharpe approaches, MAR still below, C2's *optimised-gated* ceiling (1.44 / 2.56). So: beats C2 at center, trails C2's best-gated MAR. A real, top-tier result without matching the single best-tuned Krown cell.

**Weekly-R correlation (DT23 center ledger vs siblings' center ledgers, Pearson of weekly-summed R):**

| vs | strategy | Pearson r | overlapping active weeks | read |
|---|---|---:|---:|---|
| **DT1** | 4h Trend Rider | **−0.035** | 30 | independent |
| **DT2** | 4h Vol-Surge | **+0.237** | 77 | mildly correlated |
| **DT3** | 1h KAMA+Squeeze | **+0.447** | 87 | moderately correlated |

**NEW-ENGINE CALL → GENUINELY NEW ENGINE (additive, not redundant).** Three reasons:
1. **The mechanism is unique to the book.** No other DT engine uses a volume-spike confirmation gate. Tellingly, even against the *other* volume engine — **DT2 (Vol-Surge)** — the weekly-R correlation is only **+0.237**: DT2 keys off volume differently (it carries shorts / reversal behaviour), so the two volume plays are *not* the same trade.
2. **Max correlation to the entire book is +0.447** (DT3), a **moderate** overlap — well short of the ~0.7+ that would flag redundancy. Both DT23 and DT3 are long trend-continuation systems that necessarily fire in the same bull regimes, which explains (and bounds) the overlap; but at r = 0.45 they share under **20% of variance**, so DT23 contributes substantial independent P&L.
3. **It is the only distribution-robust survivor** (flat tail, uniformly-significant plateau), so it diversifies the book on *quality* as well as *timing*.

**Honest caveat on the call:** the +0.447 DT3 overlap means DT23 is **not fully orthogonal** — expect moderate co-drawdown with DT3 in trend-off regimes. It is a strong *additive* engine, not an *independent* one. That is still the best diversification profile any DT-bench survivor has offered.

---

## Worked examples (real timestamps, hand-traced, fully causal — volume ratio shown)

**Example A — TARGET win (+2.96R).** Signal bar **2019-10-25 16:00 UTC** (bar 280). Closed-bar raw candle: O 8267.50 / H 8800.00 / L 8257.25 / **C 8631.73**, **volume 73 559.9**. Gate check, each conjunct from raw values:
- `volume 73 559.9 > vsma 17 944.0 × 2.0 = 35 888.1` ✓ — **volume ratio = 4.10×** (a genuine spike);
- `close 8631.73 > open 8267.50` ✓ (green);
- `upperHalf`: half-level = 8257.25 + 0.5·(8800.00−8257.25) = **8528.63**; close 8631.73 ≥ 8528.63 ✓ (closed in upper half);
- `close 8631.73 > ema20 7794.61` ✓; `close 8631.73 > ema200 8399.79` ✓.

All five pass ⇒ enter at the **open of the next bar, 2019-10-25 20:00**, entry_ref **8633.45**, fill 8635.18 (+slip). `pendRisk = 1.5·ATR(206.08) = 309.12` → stop **8324.33**, target 8633.45 + 3·309.12 = **9560.81**, size = 100/309.12 = 0.3235 BTC. Price runs; the 4h high of the entry bracket reaches the target and the exit books at **9560.81** on **2019-10-26 00:00**, fill 9558.90 (adverse −slip). Net **+295.88 → +2.959R**, held 2 bars. Causal: every gate uses bar ≤ 280; fill = open[281]; target tested only from bar 281 onward.

**Example B — STOP loss (−1.03R).** Signal bar **2019-10-26 00:00 UTC** (bar 282, the very next re-entry after A exits). Raw candle: O 8650.00 / H 10 408.48 / L 8626.89 / **C 9563.07**, **volume 99 990.2**. Gates: `volume 99 990.2 > vsma 22 845.7 × 2.0 = 45 691.5` ✓ — **ratio = 4.38×**; green ✓; half-level = 8626.89 + 0.5·(10 408.48−8626.89) = **9517.68**, close 9563.07 ≥ 9517.68 ✓; `close > ema20 8036.74` ✓; `close > ema200 8413.83` ✓. Enter **2019-10-26 04:00**, entry_ref **9566.68**, fill 9568.59; `pendRisk = 1.5·ATR(315.81) = 473.72` → stop **9092.96**, target **10 987.85**. Risk has stepped to **$102.96** (1% of the $10 295.88 equity after A's win, compounding), so size = 102.96/473.72 = **0.2173 BTC**. The move immediately reverses; the 1m low breaches the stop and the exit books at **9092.96** on **2019-10-26 08:00**, fill 9091.14 (adverse). Net **−105.80 → −1.028R** (just past −1R from slippage + fees), held 2 bars.

These are the **first two center trades** — a +2.96R target win immediately followed by a −1.03R stop — illustrating the honest 3:1 payoff geometry and that consecutive high-volume signals are traded independently, flat-only, with no overlap.

---

## Indicator hand-checks (re-derivable, in `bt_dt23_volume_spike.py`)

- **ATR(14)** (`handcheck_atr`): the vectorised Wilder ATR vs an independent slow `(prev·13 + TR)/14` loop over all 11 646 bars — **max |diff| = 1.14 × 10⁻¹²** (bit-faithful).
- **SMA(volume,20)** (`handcheck_vsma`): vectorised rolling mean vs a from-scratch 20-bar window mean at three spot bars (500 / 5000 / tail) — **max |diff| = 7.28 × 10⁻¹²**.
- **Gate re-derivation:** both worked examples above recompute all five entry conjuncts from raw OHLCV and reproduce the ledger's entry/stop/target to the cent.

---

## PROOFS

- **py_compile:** `python3 -m py_compile backtests/bt_dt23_volume_spike.py` → **OK (exit 0).**
- **Determinism (two independent runs):** ledger md5s **identical run 1 = run 2** — center **`d5067597ce8d1394a4186393a2ae2fbd`**, best **`4945ca7cddb3ed3eba3f3d943ae5cd78`**, grid csv **`f914cc4c2db5da6f6fa519fc0f9d123a`**. No RNG, no wall-clock. (md5 re-verified directly on the written files.)
- **2025 lockout:** 1m candles loaded **2 795 040**, min **2019-09-09 00:00:00+00:00**, max **2024-12-31 23:59:00+00:00**; **candles ≥ 2025-01-01 = 0**, `any_2025 = False`. 4h bars **11 646** (max open 2024-12-31 20:00 UTC). IS span **5.226 yr** minus 200-bar warmup. No 2025+ candle enters any run.
- **Ambiguous / same-1m = LOSS:** a 4h bar touching both stop and target is disambiguated on 1m; a single 1m bar touching both is booked the **stop**. Intrabar stop/target fills at the level with adverse slippage.

## Files

- Engine: `backtests/bt_dt23_volume_spike.py`
- Report: `Strategy Codex/DaviddTech/backtests/DT23_VOLUME_SPIKE.md`
- Ledgers: `Strategy Codex/DaviddTech/backtests/dt23_trades_center.csv`, `dt23_grid.csv` (27 cells), `dt23_trades_best.csv`
- Stats dump: `backtests/_dt23_stats.json`
