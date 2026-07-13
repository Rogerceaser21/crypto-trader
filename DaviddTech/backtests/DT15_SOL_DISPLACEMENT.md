❌ DEAD — fails 2 of 3 declared kill-gates outright and is not close on either: **center-region expR = −0.093R (< 0; all 7 region cells negative)** and **best-cell t = −1.92 (< 2.0, and itself negative)**. Only the trade-count gate passes (1,604 center trades ≥ 40). The kill is not a corner miss — it is **uniform**: **0 / 27 grid cells have positive expR** (grid-wide max expR = **−0.046R**, max PF = **0.908** — the single best-of-27 cell still loses money), and center expectancy is negative in **every calendar year** 2020→2024. IDR reversion on SOL 1h is a ~47%-WR, ~1:1-payoff coin flip that the 0.05% fee + 0.02% slippage over ~1.6k trades taxes straight into the ground (center Sharpe **−2.08**, totret **−82%**, maxDD **84%**). This is the third SOL reversion/fade tested and the first to die outright — confirming the skeptical prior.

---

# DT15 "SOL Displacement Reversion" — causal backtest of DaviddTech library strategy "IDR — Inefficient Displacement Reversion" (author Mike Black)

SOLUSDT-perp **1h bars built from 1m OHLCV** (UTC hourly buckets, label/closed=left). A **Kaufman-Efficiency-Ratio-gated mean-reversion**: fade a bar that stretched ≥ `zThresh` ATRs from a 20-EMA equilibrium *and then started reverting*, but **only in a choppy/inefficient regime** (ER ≤ `erRegimeMax`) and only when ATR is not blowing up. Signals on **closed 1h bars**, fills at the **next 1m open**, exit via a **single STATIC ATR bracket** (stop `−atrStopMult·ATR`, target `+atrTpMult·ATR`, both frozen at the fill) plus a **`maxBars` time-stop**, sizing at **flat 1%-equity risk vs the initial stop distance**. IS window **2020-09-14 → 2024-12-31** (37,673 1h bars from 2,260,380 pre-2025 1m candles; **SOL history is short — only ~4.3y IS**, warmup = 20 bars). 2025+ locked out (loaded **0** candles ≥ 2025-01-01 UTC). Engine `backtests/bt_dt15_sol_idr.py`. Source of truth `Strategy Codex/DaviddTech/research/pine_ethsol/SOL_IDR_Inefficient_Displacement_Reversi.pine` (Pine v5, 62 lines) — a *different* author (Mike Black) from the systematic C-series that produced DT13/DT14.

Author claim (selection-only context — **NOT evidence, NOT a target**): PF 1.29, Sharpe 0.72, +9%, DD 8.2%, 142 trades, 2.0y. **Does not reproduce** — the claim is a 2-year, 142-trade slice; on the full 4.3y IS the same defaults produce **PF 0.80 over 1,604 trades**.

---

## 1 · DERIVED SPEC (FROZEN — line-by-line from the Pine; resolutions declared, each most-literal)

**Timeframe.** The Pine declares no `request.security` / timeframe → run on **1h** per task. `ema`, `atr`, `er`, `volBlowup` all computed on closed 1h bars.

**Indicators (closed 1h bar `i`).**
- `ema = ta.ema(close, 20)` — EMA of close. *Resolution:* Pine `ta.ema` is **SMA-seeded at index 19**, `na` before; replicated. (Immaterial vs a first-value seed after the ~20-bar warmup; declared.)
- `atr = ta.atr(14)` — Wilder RMA of True Range, SMA seed at index 13.
- `z = atr>0 ? (close−ema)/atr : 0` — displacement z-score (`na` in warmup).
- **Kaufman Efficiency Ratio** — `change = |close − close[20]|`; `volPath = math.sum(|close − close[1]|, 20)` (rolling 20-term sum of 1-bar path); `er = volPath>0 ? change/volPath : 0`. `choppy = er ≤ erRegimeMax`. ER ∈ [0,1]: **0 = pure chop, 1 = pure trend**; the strategy trades **only when ER is LOW**.
- **Vol blow-up filter** — `atrPrev = atr[5]`; `volBlowup = atrPrev>0 ? (atr/atrPrev − 1) > volExpMax : false`.

**Entry (flat-only, `pyramiding=0`).** On closed bar `i`:
- `longCond  = z[1] ≤ −zThresh AND z > z[1] AND choppy AND not volBlowup` → the **prior** bar `i−1` was stretched **below** equilibrium by ≥ `zThresh` ATRs, bar `i` is **reverting up** (`z[i] > z[i−1]`), regime is choppy, no vol blow-up.
- `shortCond = z[1] ≥ +zThresh AND z < z[1] AND choppy AND not volBlowup` → mirror.
- `choppy` and `volBlowup` are read on the **current** bar `i`; the two-sided `z` condition uses bars `i−1` and `i`. Long is checked first (Pine order); the two conditions are mutually exclusive for `zThresh ≥ 0.5`.
- Market entry → fills at the **next 1m open = the 1h open of bar `i+1`** (a 1h open is by construction its first 1m open → causal). `entryAtr := atr` — a **`var float` captured at the signal bar and FROZEN** for the trade.

**Exit — a SINGLE STATIC bracket (the load-bearing resolution).**
- Long: `stop = position_avg_price − atrStopMult·entryAtr`, `target = position_avg_price + atrTpMult·entryAtr`. Short: mirror.
- *Resolution (declared):* **both anchors are CONSTANT** — `position_avg_price` (the fill price) is fixed for the life of the position and `entryAtr` is frozen — so **unlike DT13/DT14 (which re-evaluate ATR each bar → a MOVING bracket), the DT15 bracket is STATIC**: computed once at the fill and tested unchanged on every subsequent bar. The bracket is anchored at the **actual slipped fill** `entry_fill` (= `strategy.position_avg_price` incl. slippage — the most-literal analog).
- *Resolution (declared, the one deliberate departure from DT13/DT14):* the static bracket is **live on the entry bar `i+1` itself**, tested from the fill minute onward. Pine's broker emulator fills a market entry at the bar open then tests same-bar stop/limit orders against that bar's range; because this bracket is **fully known at entry** (nothing to wait for), the literal reading tests the entry bar. DT13/DT14's "no exit on the entry bar" was correct *there* because their brackets MOVE and are only defined from the next bar's ATR — that rationale does not apply to a static bracket.
- Intrabar fills detected on **1m sub-bars**, filled AT the level with **adverse slippage**. Within a 1m sub-bar the earlier of stop/target wins; a **single 1m sub-bar touching BOTH → ambiguous → LOSS (stop)**.

**Time stop.** `barsInTrade = ta.barssince(position_size==0)` → equals `(bar_index − signal_bar)` (position turns non-zero on fill bar `i+1`; last flat bar is signal bar `i`). Fires when `barsInTrade ≥ maxBars` → `strategy.close_all` → **market close at the next 1h open**. A pending time-stop fills at the bar **open** (chronologically first) → wins any same-bar contest with the bracket.

**Sizing (declared — Pine's own 20%-equity notional is OVERRIDDEN per task).** Flat 1%-of-(compounding)-equity risk vs the **initial stop distance**, which the Pine *does* define: `init_dist = atrStopMult·entryAtr` (frozen ATR at the signal bar). `size = (equity·1%)/init_dist`; `R = net/risk`. `expR / PF / Sharpe-on-R / t` are size-normalised (equity-independent); only `totret` and the mark-to-market `maxDD%` depend on the compounding path.

**Engine.** fee 0.05%/side, slippage 0.02%/fill, $10k start, compounding 1%-risk; ambiguous = LOSS; 1m tie-break; 1h mark-to-market Sharpe ×√(24·365); deterministic (byte-identical ledgers across two runs — md5s below).

---

## 2 · DECLARED GRID (fixed BEFORE any result — 3×3×3 = 27 cells, default = center cell)

The Pine has **10 numeric inputs**. Per task, the **3 most structural** are kept as axes; the other **7 are FROZEN at defaults**. No post-hoc additions.

| Axis | Values | Why it is an axis |
|---|---|---|
| `zThresh` | **1.0 / 1.3 / 1.6** | Most entry-defining: the displacement-trigger magnitude (how stretched a bar must be to be faded). |
| `erRegimeMax` | **0.20 / 0.30 / 0.40** | The **regime GATE = the strategy's entire thesis** ("revert only in a choppy/inefficient regime"). 0.20 = stricter/choppier, 0.40 = looser. |
| `atrStopMult` | **1.5 / 2.0 / 2.5** | The stop = the **R denominator (sizing)** *and* the survival level; drives the whole R/PF/t distribution. Chosen as the 3rd axis (over `atrTpMult`) as the most outcome-structural remaining knob, keeping parity with DT13's SOL-fade grid. |

**FROZEN (with reason):** `emaLen=20` (equilibrium anchor, secondary to the z-threshold itself) · `atrLen=14` (z & stop scale, standard) · `erRegimeLen=20` (ER *window*; the gate *level* `erRegimeMax` is the axis, not the length) · `volExpMax=0.50`, `volSlopeLen=5` (secondary vol-blow-up filter) · `atrTpMult=2.0` (reward leg; **at center this makes RR = 1:1, and RR varies across the `atrStopMult` axis: 1.33 / 1.0 / 0.80** — declared, not a hidden knob) · `maxBars=24` (time-stop horizon, secondary).

**CENTER = (zThresh 1.3, erRegimeMax 0.30, atrStopMult 2.0) = Pine defaults.**

---

## 3 · FULL GRID TABLE (27 cells; IS 2020-09-14→2024-12-31; after costs)

expR in **R**, maxDD% on the compounding 1h equity curve, `t` = per-trade t-stat. **Every cell is negative; the center row is bold-marked ‹C›.**

| zThr | erMax | stop | n | wr% | expR | PF | Sharpe | maxDD_R | maxDD% | t |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1.0 | 0.20 | 1.5 | 1647 | 43.7 | −0.0531 | 0.908 | −0.94 | 110.2 | 69.9 | **−1.92** ‹best-t› |
| 1.0 | 0.20 | 2.0 | 1493 | 49.2 | −0.0554 | 0.887 | −1.10 | 100.1 | 65.6 | −2.25 |
| 1.0 | 0.20 | 2.5 | 1398 | 53.3 | −0.0463 | 0.889 | −1.02 | 79.9 | 57.1 | −2.08 |
| 1.0 | 0.30 | 1.5 | 2409 | 43.0 | −0.0714 | 0.878 | −1.52 | 196.5 | 87.9 | −3.13 |
| 1.0 | 0.30 | 2.0 | 2116 | 48.0 | −0.0835 | 0.834 | −1.96 | 196.0 | 87.2 | −4.04 |
| 1.0 | 0.30 | 2.5 | 1906 | 52.4 | −0.0654 | 0.847 | −1.66 | 140.3 | 77.0 | −3.43 |
| 1.0 | 0.40 | 1.5 | 2893 | 42.0 | −0.0912 | 0.847 | −2.11 | 283.9 | 95.1 | −4.39 |
| 1.0 | 0.40 | 2.0 | 2467 | 47.5 | −0.0918 | 0.820 | −2.31 | 243.7 | 92.2 | −4.80 |
| 1.0 | 0.40 | 2.5 | 2194 | 51.3 | −0.0793 | 0.818 | −2.15 | 187.1 | 85.8 | −4.46 |
| 1.3 | 0.20 | 1.5 | 1047 | 42.3 | −0.0831 | 0.860 | −1.17 | 106.7 | 67.8 | −2.40 |
| 1.3 | 0.20 | 2.0 | 977 | 48.1 | −0.0802 | 0.841 | −1.28 | 91.2 | 61.6 | −2.63 |
| 1.3 | 0.20 | 2.5 | 930 | 52.3 | −0.0664 | 0.845 | −1.18 | 70.1 | 51.9 | −2.43 |
| 1.3 | 0.30 | 1.5 | 1783 | 41.8 | −0.0970 | 0.837 | −1.77 | 190.5 | 86.7 | −3.67 |
| **1.3** | **0.30** | **2.0** | **1604** | **47.1** | **−0.1025** | **0.800** | **−2.08** | **177.4** | **84.3** | **−4.33 ‹C›** |
| 1.3 | 0.30 | 2.5 | 1461 | 51.9 | −0.0758 | 0.824 | −1.67 | 120.2 | 71.6 | −3.49 |
| 1.3 | 0.40 | 1.5 | 2344 | 41.1 | −0.1109 | 0.816 | −2.30 | 275.4 | 94.5 | −4.82 |
| 1.3 | 0.40 | 2.0 | 2033 | 47.0 | −0.1055 | 0.795 | −2.39 | 229.3 | 90.8 | −5.01 |
| 1.3 | 0.40 | 2.5 | 1811 | 51.3 | −0.0853 | 0.806 | −2.07 | 163.7 | 81.9 | −4.36 |
| 1.6 | 0.20 | 1.5 | 561 | 40.8 | −0.1290 | 0.789 | −1.35 | 83.0 | 58.1 | −2.76 |
| 1.6 | 0.20 | 2.0 | 536 | 46.6 | −0.1184 | 0.774 | −1.39 | 70.3 | 51.9 | −2.89 |
| 1.6 | 0.20 | 2.5 | 519 | 50.3 | −0.1089 | 0.760 | −1.43 | 60.9 | 46.8 | −2.97 |
| 1.6 | 0.30 | 1.5 | 1163 | 41.7 | −0.1063 | 0.823 | −1.58 | 137.7 | 76.6 | −3.26 |
| 1.6 | 0.30 | 2.0 | 1068 | 47.2 | −0.1083 | 0.791 | −1.80 | 126.1 | 73.2 | −3.72 |
| 1.6 | 0.30 | 2.5 | 1002 | 51.8 | −0.0838 | 0.810 | −1.53 | 91.0 | 61.5 | −3.17 |
| 1.6 | 0.40 | 1.5 | 1718 | 41.0 | −0.1187 | 0.805 | −2.12 | 219.5 | 90.0 | −4.42 |
| 1.6 | 0.40 | 2.0 | 1528 | 47.2 | −0.1037 | 0.799 | −2.05 | 173.8 | 83.7 | −4.26 |
| 1.6 | 0.40 | 2.5 | 1373 | 51.6 | −0.0832 | 0.812 | −1.77 | 124.9 | 72.9 | −3.68 |

**Grid summary: cells with expR > 0 = 0 / 27. Cells with t ≥ 2.0 = 0 / 27. Grid-wide max expR = −0.0463R. Max PF = 0.908. Max (least-negative) t = −1.92.** The whole parameter surface loses money.

**Readable structure in the death.** Two monotone gradients, both consistent with a real-but-negative signal: (1) expR is **least-negative at the strictest regime gate** (`erRegimeMax=0.20`: mean −0.079R) and **worst at the loosest** (`0.40`: −0.097R) — the "only trade in chop" thesis points the *right* way, it just never crosses zero. (2) Wider stops (`2.5`) are less-negative than tight (`1.5`) because tight stops get whipped more, but a wider stop also means fewer, bigger losses — no combination escapes. Higher `zThresh` (more extreme stretch required) **reduces** trade count sharply but makes expR *more* negative (1.6 col worse than 1.0), i.e. the most extreme stretches revert *least* reliably — the opposite of what the strategy needs.

**Long/short split at center (1.3, 0.30, 2.0).** Both legs bleed:

| leg | n | wr% | expR | net R |
|---|---:|---:|---:|---:|
| long | 808 | 45.7 | −0.128 | −103.3 |
| short | 796 | 48.5 | −0.077 | −61.2 |

Symmetric death — this is *not* the long-only-SOL-beta pattern DT13 showed; the reversion mechanism fails in both directions. (Longs are slightly worse, consistent with fading dips in a structurally rising asset.)

**Exit mix at center.** stop 768 (net **−799 R**) · target 645 (net **+620 R**) · timestop 191 (net **+15 R**) · eod 0. The bracket is ~1:1, so wins and losses roughly cancel in *count-weighted* terms — but each of the 768 stops books ~−1.02R and each of the 645 targets only ~+0.98R (cost drag on both sides), and the residual −0.10R/trade is precisely the **fee+slippage tax on a coin flip**.

---

## 4 · CENTER-REGION ANALYSIS + BEST CELL

**Center-region (7 axis-adjacent cells).** expR in declared order — center, ±zThresh, ±erRegimeMax, ±atrStopMult:
`[−0.1025, −0.0835, −0.1083, −0.0802, −0.1055, −0.0970, −0.0758]` → **mean = −0.0933R < 0**, **0 / 7 positive**. **Kill-gate #1 FAILS.** There is no positive neighbourhood anywhere near the shipped setting; the least-bad neighbour (`atrStopMult` step up to 2.5, −0.076R) is still a firm loser.

**Best cell = (zThresh 1.0, erRegimeMax 0.20, atrStopMult 1.5)** by max t among n ≥ 2: n=1647, wr 43.7%, **expR −0.053R, PF 0.908, Sharpe −0.94, t = −1.92, maxDD 70%**. The "best" cell is the **least-negative loser**, sits on **two grid edges** (min zThresh, min erRegimeMax — the strictest-regime corner), and its t is **negative and below the 2.0 gate**. **Kill-gate #3 FAILS.** Multiplicity caveat is moot: with 0/27 positive cells there is nothing to over-fit *to* — best-of-27 selection cannot manufacture an edge that does not exist in a single cell.

---

## 5 · KILL CRITERIA (verbatim)

> **DEAD unless center-region expR after costs > 0 AND ≥ 40 IS trades at center AND best-cell t ≥ 2.0.**

| Gate | Requirement | DT15 | Verdict |
|---|---|---|---|
| #1 center-region expR | > 0 | **−0.0933R** | ❌ FAIL |
| #2 center trades | ≥ 40 | **1,604** | ✅ pass |
| #3 best-cell t | ≥ 2.0 | **−1.92** | ❌ FAIL |

**Fails 2 of 3 — DEAD.** Neither failing gate is a near miss: center-region expR is negative by ~0.09R, and the best cell's t is not merely below 2.0 but *negative*.

---

## 6 · C2 BENCHMARK + vs DT13 / DT14

**C2 reference (BTC daily-trend):** center **Sharpe 0.93 / MAR 0.96**; best-gated **Sharpe 1.44 / MAR 2.56**.

| Setup | Sharpe | MAR | expR | PF |
|---|---:|---:|---:|---:|
| C2 center | 0.93 | 0.96 | — | — |
| C2 best-gated | 1.44 | 2.56 | — | — |
| **DT15 center** | **−2.08** | **−0.39** | **−0.103** | **0.80** |
| **DT15 best cell** | **−0.94** | **−0.29** | **−0.053** | **0.91** |

DT15 is not below C2 — it is **on the wrong side of zero on every axis** (Sharpe, MAR, expR, PF all negative or < 1). There is no comparison to make beyond "C2 makes money, DT15 loses it."

**vs DT13 / DT14 (the other two SOL tests — both marginal 🟡):** DT13 (drive-failure fade) and DT14 (NR4 breakout) each *survived* on a best-of-27 gate with center expR ≈ **+0.077R** and best-cell t ≈ 2.18 / 2.45; **DT15 is the first SOL strategy to die outright** — center expR **−0.103R** and **0/27 positive cells** vs their 27/27 positive. The distinction is mechanism: DT13/DT14 monetise *momentum/continuation* (a failed drive flushing, a contraction breaking out) which SOL's volatility rewards; DT15 fades *toward* a mean on a chop filter, and on 1h SOL that mean-reversion edge is smaller than the round-trip cost. Reversion dies where breakout survives — the through-line of this project (BTC liquidity-sweep died; SOL drive-fade/NR4 only marginal; SOL displacement-reversion dead).

---

## 7 · WORKED EXAMPLES (hand-traced on real timestamps, center cell 1.3/0.30/2.0)

**Example A — SHORT, stopped out (a losing fade of a spike).**
- **Signal** bar 87, `2020-09-17 22:00 UTC`: close 2.8080, ema(20) 2.6741, atr(14) 0.0985. `z[i−1] = +2.795` (prior bar stretched **above** equilibrium by 2.8 ATRs, ≥ +1.3 ✓), `z[i] = +1.359` (`< z[i−1]` → reverting down ✓), `er = 0.234 ≤ 0.30` (choppy ✓), `volBlowup = false` ✓ → **shortCond** fires.
- **Entry** bar 88, `23:00`: 1h open 2.8089 → short fill `2.8089·(1−0.0002) = 2.8083`. `entryAtr = 0.0985` frozen; `init_dist = 2.0·0.0985 = 0.1970` (= sizing stop distance).
- **Static stop** = fill + 2.0·entryAtr = `2.8083 + 0.1970 = 3.0053`; static target = fill − 0.1970 = 2.6113.
- SOL kept rising (adverse for a short); the stop was tagged at bar 99, `2020-09-18 10:00`. exit_ref 3.0053, exit_fill `3.0053·(1+0.0002) = 3.0059` (adverse). net −101.78 on 100 risk → **R = −1.018** (the extra 1.8% beyond −1R is the two-sided fee+slippage), bars_held 11.

**Example B — LONG, hit target (a winning fade of a dip).**
- **Signal** bar 158, `2020-09-20 21:00 UTC`: close 2.7607, ema(20) 2.8608, atr(14) 0.0702. `z[i−1] = −1.967` (prior bar stretched **below** equilibrium, ≤ −1.3 ✓), `z[i] = −1.427` (`> z[i−1]` → reverting up ✓), `er = 0.263 ≤ 0.30` ✓ → **longCond** fires.
- **Entry** bar 159, `22:00`: 1h open 2.7606 → long fill `2.7606·(1+0.0002) = 2.7612`. `init_dist = 2.0·0.0702 = 0.1404`.
- **Static target** = fill + 2.0·0.0702 = `2.7612 + 0.1404 = 2.9016`; static stop = 2.6208.
- Reverted up and tagged the target two bars later, bar 161 `2020-09-21 00:00`. exit_ref 2.9015 (≈ target), exit_fill 2.9009 (adverse). net +96.68 → **R = +0.976**, bars_held 2.

Together A and B show the structural problem in miniature: a **symmetric 2·ATR / 2·ATR (RR 1:1) bracket** where the winning target pays **+0.976R** and the losing stop costs **−1.018R** after costs. At the center's 47% win rate, `0.47·0.976 − 0.53·1.018 ≈ −0.08R` per trade (plus a small time-stop drag) → the observed **−0.10R**. The reversion signal is real enough to be a near-coin-flip, but the coin is taxed on every toss.

---

## 8 · PROOFS

**Determinism (two independent runs of the center cell → byte-identical ledgers):**
```
md5 center ledger run#1: 245f940ab626febaabb7aa2d8c527a6d
md5 center ledger run#2: 245f940ab626febaabb7aa2d8c527a6d   equal=True
md5 center file (dt15_trades_center.csv): 245f940ab626febaabb7aa2d8c527a6d
md5 best   file (dt15_trades_best.csv)  : 3072b4b6b58467f81c869c20258cece7
md5 grid   file (dt15_grid.csv)         : ed886be0261621ce8206259a503d070c
```

**py_compile (clean):**
```
$ python3 -m py_compile backtests/bt_dt15_sol_idr.py && echo OK
PY_COMPILE_OK
```

**Candle count + 2025 lockout proof (the hard window):**
```
1m rows loaded: 2,260,380   min = 2020-09-14 07:00:00+00:00   max = 2024-12-31 23:59:00+00:00
1h bars       : 37,673      min = 2020-09-14 07:00:00+00:00   max = 2024-12-31 23:00:00+00:00
cutoff (exclusive) = 2025-01-01 00:00:00+00:00   candles ≥ cutoff loaded = 0
```
Max 1m timestamp is `2024-12-31 23:59 UTC` and **zero** candles ≥ 2025-01-01 were loaded → the locked OOS window is untouched.

**Raw signal counts at center** (before flat-only gating): long 1,382, short 1,457 = 2,839 raw → 1,604 taken (the rest fire while a position is already open; `pyramiding=0` blocks them).

**Yearly center expR (every year negative — not a regime artefact):**

| year | n | expR | net R |
|---|---:|---:|---:|
| 2020 | 128 | −0.191 | −24.4 |
| 2021 | 382 | −0.074 | −28.1 |
| 2022 | 358 | −0.076 | −27.3 |
| 2023 | 342 | −0.111 | −38.0 |
| 2024 | 394 | −0.119 | −46.7 |

**Artifacts:**
- Engine: `backtests/bt_dt15_sol_idr.py` (py_compile clean)
- Grid: `Strategy Codex/DaviddTech/backtests/dt15_grid.csv`
- Center ledger: `Strategy Codex/DaviddTech/backtests/dt15_trades_center.csv` (1,604 trades)
- Best-cell ledger: `Strategy Codex/DaviddTech/backtests/dt15_trades_best.csv`
- Stats JSON: `backtests/_dt15_stats.json`

---

**Bottom line.** DT15 **dies on the first two kill-gates and is not close on either**, and the kill is as clean as this project has produced: **0 / 27 grid cells positive**, grid-wide best expR **−0.046R**, center **−0.103R** with a **−82% total return** and **84% max drawdown**, symmetric across long/short, negative in every calendar year. The author's PF 1.29 / +9% claim is a **142-trade, 2-year selection slice** that evaporates on the full 4.3y, 1,604-trade sample. The spec reproduces faithfully (the ER-choppy gate even nudges expR the *right* direction), so this is not a modelling error — it is a genuine, robust **absence of edge**: 1h displacement-reversion on SOL is a ~47%-WR, ~1:1-payoff coin flip and the fee+slippage tax turns every toss into a loss. Consistent with the skeptical prior and the project through-line — **reversion/fade keeps dying where breakout/continuation survives**. **DEAD; do not carry to OOS.**
