✅ SURVIVES kill-criteria (center 45/400 center-region expR **+3.30R** proxy after costs, n=**88** at center, best-cell **t=2.519** — and the best cell *is* the Pine default; all **9/9** grid cells expR>0, t≥2.06, PF≥2.51) — but **REDUNDANT vs DT1** (weekly-R Pearson **r=0.72**, same BTC EMA-cross trend edge) **AND carries a disqualifying NO-STOP drawdown**: maxDD **30.5%** vs DT1's 9.4% (3.2× deeper, structurally *uncapped*). Its higher headline Sharpe/MAR/t is bought with an unbounded per-trade tail (worst trade −4.35R, loss > sizing unit because nothing stops it out). **Do NOT add a book slot** — it is the trend-family FLOOR that confirms the raw crossover edge is real and simple, nothing more.

# DT20 "Slow EMA Crossover baseline" — causal backtest of DaviddTech "BTC 1H Long EMA Crossover"

BTCUSDT **Binance Perpetual**, signals on **closed 1h bars**, fills at the **next 1m open**. IS window **2019-09-09 → 2024-12-31** (46,584 1h bars from 2,795,040 pre-2025 1m candles), minus a `slowLen`-bar warmup per cell (≈ 5.27 yr of live curve at center). 2025+ locked out (0 candles ≥ 2025-01-01 UTC loaded). Engine `backtests/bt_dt20_ema_baseline.py`. Source of truth `Strategy Codex/DaviddTech/research/pine/BTC_1H_Long_EMA_Crossover.pine` (Pine v5, **20 lines** — the simplest strategy in the library).

**Author claim is SELECTION-ONLY context — not evidence and not a target:** PF 2.37, +241%, DD 18.5%, 174 trades, ~3 yr. The headline **+241% is inflated by `default_qty_type=percent_of_equity, default_qty_value=100`** — i.e. 100%-of-equity compounding on every trade (leverage, not edge). We strip that and test the raw signal at a **flat 1%-equity risk**. The result below is what the bare crossover is actually worth un-leveraged.

## Spec derived from the Pine (frozen)

- `fastEma = EMA(close, fastLength)`, `slowEma = EMA(close, slowLength)`.
- **ENTRY:** `ta.crossover(fastEma, slowEma)` on a **closed** 1h bar → go **LONG** (Pine semantics: strict compare now, `≤` on the prior bar).
- **EXIT:** `ta.crossunder(fastEma, slowEma)` on a **closed** 1h bar → `strategy.close("Long")`.
- **LONG-ONLY, FLAT-ONLY:** no shorts, no pyramiding. Crosses strictly alternate for a fixed `(fast, slow)` pair (a crossover forces `fast>slow`, so the next cross event must be a crossunder), so the state machine is unambiguous: enter-when-flat, exit-when-long. Verified: exit mix at center is **100% cross** (no dangling open position).
- **⚠ NO STOP EXISTS in the Pine — this is an EXIT-SIGNAL-ONLY system.** A losing trade runs until the opposite cross fires; there is **no cap on per-trade adverse excursion**. This is the single most important fact about DT20 and the reason maxDD is reported prominently and honestly below. (The ETH cousin DT10 died partly on exactly this unbounded-DD structure — same skeptical prior applies here.)

### Risk unit (declared PROXY — read this before reading any "R")

There is **no real stop**, so R cannot be measured against a stop distance that actually gets hit. We declare a **PROXY risk unit = 2 × ATR(14) captured at entry** and size *as if* risking 1% of equity at that distance: `stop_dist = 2·ATR(14)[signal bar]`, `size = (equity·1%)/stop_dist`, `R = net / (equity·1%)`. Long-only, compounding.

**Consequence you must keep in mind:** because the proxy 2·ATR distance is *tight* and nothing ever stops the trade out, **R here is not comparable to DT1/DT18/DT19's R** (those were measured against a *real* 3–4.5·ATR stop that actually fired). A quiet-ATR entry that catches a big trend books tens of R (biggest center trade **+58.1R**); a loser can exceed the sizing unit (worst center trade **−4.35R**, i.e. loss > 1R — impossible in a stopped system). Treat `expR`/`totRet%` as **proxy-sizing artifacts** and lean on the **leverage-invariant** metrics (Sharpe, MAR, maxDD%, t-stat, WR) for any cross-strategy comparison.

## Fill-model divergence from Pine (stated)

Pine runs `process_orders_on_close=true` → entries **and** exits fill **at the signal bar's CLOSE** (same-bar). We use the house **causal** model: signal detected on the **closed** 1h bar, order fills at the **open of the next 1h bar** (= first 1m open after the close). This removes same-bar look-ahead and is strictly more conservative. Combined with stripping the 100%-of-equity compounding, it is why our flat-risk result differs from the author's +241%.

## Execution conventions (reused from `backtests/bt_engine.py` via DT1/DT18/DT19 scaffolding)

- Fees **0.05%/side**, slippage **0.02%/fill**, **$10k** start, compounding 1%-risk.
- Entry fill = `open×(1+slip)`; exit fill = `open×(1−slip)` (adverse both ends).
- **Ambiguous fills = losses — here VACUOUS:** exits are **close-based** (a single crossunder condition on the closed bar), so there is **no** intrabar contest between a stop and a target to tie-break. With no stop, **no 1m intrabar machinery is used at all** — the fill model reduces to next-1h-open. The only conservative element is that next-open vs Pine's same-bar close.
- 1h **mark-to-market** total-equity curve (unrealized P&L marked each 1h close, C2-style) → Sharpe (× √(24·365)) and maxDD%; per-trade R drives expR / PF / t-stat / maxDD_R. MAR = CAGR% / maxDD%.
- Deterministic: no RNG, no wall-clock, sorted output — two runs byte-identical (md5s below).

## DECLARED GRID (fixed BEFORE any result) — exactly 9 cells, no additions

```
fastLength in {30, 45, 60}
slowLength in {300, 400, 500}
=> 3 × 2-dims = 9 cells.  Center = Pine defaults (fastLength=45, slowLength=400).
```

**A 9-cell (3×3, two dims) grid deliberately lowers the multiplicity burden vs the 27-cell (3×3×3) grids used for the stopped strategies.** This system has only **two** free parameters (fast, slow) — there is no stop-mult or regime-len third axis to sweep — so 9 cells is the honest, complete parameter space, not a truncation.

## Full grid — every declared cell (after costs)

`expR` = mean per-trade **proxy** R; `PF` from R; `Sharpe`/`maxDD%` = 1h mark-to-market annualized; `maxDD_R` = cumulative-R drawdown; `t` = per-trade t-stat (mean R / (σ/√n)); `totRet%` = compounding $10k curve (proxy-sizing — inflated, see risk-unit note); `MAR` = CAGR/maxDD%.

| fast | slow | n | WR% | expR | PF | Sharpe | maxDD_R | maxDD% | t | totRet% | MAR |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 30 | 300 | 130 | 22.3 | 2.028 | 2.512 | 1.373 | 32.53 | 35.12 | 2.057 | 627 | 1.298 |
| 30 | 400 | 105 | 28.6 | 2.895 | 3.121 | 1.556 | 32.32 | 34.77 | 2.350 | 965 | 1.628 |
| 30 | 500 | 90 | 27.8 | 3.525 | 3.489 | 1.609 | 33.07 | 33.58 | 2.442 | 1097 | 1.796 |
| 45 | 300 | 113 | 24.8 | 2.537 | 2.789 | 1.443 | 29.81 | 32.54 | 2.114 | 758 | 1.543 |
| **45** | **400 ◆★** | **88** | **30.7** | **3.549** | **3.432** | **1.629** | **28.64** | **30.54** | **2.519** | **1099** | **1.971** |
| 45 | 500 | 75 | 29.3 | 3.888 | 3.412 | 1.503 | 35.79 | 35.21 | 2.371 | 883 | 1.545 |
| 60 | 300 | 94 | 29.8 | 2.829 | 2.832 | 1.414 | 29.49 | 32.80 | 2.134 | 670 | 1.438 |
| 60 | 400 | 78 | 26.9 | 3.647 | 3.111 | 1.458 | 40.30 | 39.91 | 2.250 | 796 | 1.292 |
| 60 | 500 | 74 | 28.4 | 3.857 | 3.224 | 1.462 | 41.15 | 39.17 | 2.232 | 792 | 1.317 |

◆ = center (Pine defaults). ★ = best cell by t-stat. **All 9 cells: expR > 0, t ≥ 2.06, PF ≥ 2.51, WR 22–31% (classic low-WR / fat-right-tail trend profile). But every cell also carries a 30–40% maxDD** — the no-stop tax is uniform across the surface, not a center artifact. Full CSV: `dt20_grid.csv`.

## Center-region analysis

Center + its 4 axis-adjacent neighbours (one grid step on one axis):

| cell (fast/slow) | expR | PF | Sharpe | maxDD% | t |
|---|---|---|---|---|---|
| 45/400 (center) | 3.549 | 3.432 | 1.629 | 30.54 | 2.519 |
| 30/400 | 2.895 | 3.121 | 1.556 | 34.77 | 2.350 |
| 60/400 | 3.647 | 3.111 | 1.458 | 39.91 | 2.250 |
| 45/300 | 2.537 | 2.789 | 1.443 | 32.54 | 2.114 |
| 45/500 | 3.888 | 3.412 | 1.503 | 35.21 | 2.371 |

**Center-region mean expR after costs = +3.303R (proxy)** — all 5 cells positive, t between 2.11 and 2.52, no sign flips or cliffs. The surface is smooth: raising `slow` monotonically lifts expR (fewer, longer-held, deeper trends) while raising `fast` above 45 pushes maxDD toward 40%. The center is the *sweet spot on the risk-adjusted axis* — it posts the **best Sharpe (1.63), best MAR (1.97), and shallowest maxDD% (30.5%) of the whole grid**, and is simultaneously the **highest-t cell**. Robust, not a fitted spike.

## Best cell + multiplicity caveat

Best by t-stat = **45/400 — which is the Pine default (center)**, t=2.519. There is no separate "best" to worry about: the parameter the author shipped is literally the highest-t cell in the declared grid, and it is also the Sharpe/MAR/maxDD optimum. The four next-best cells (30/500, 45/500, 30/400, 45/300 at t 2.35–2.44) cluster tightly on the `slow≥400` ridge, so the pick is not a fragile peak. Ledger `dt20_trades_best.csv` = `dt20_trades_center.csv` (same cell). This is a robustness *positive*.

## KILL CRITERIA (verbatim)

> **DEAD unless center-region expR after costs > 0 AND ≥ 40 IS trades at center AND best-cell t ≥ 2.0.**

| Gate | Threshold | Actual | Pass? |
|---|---|---|---|
| Center-region expR after costs | > 0 | **+3.303R** (proxy) | ✅ |
| IS trades at center | ≥ 40 | **88** | ✅ |
| Best-cell t | ≥ 2.0 | **2.519** | ✅ |

**All three pass → SURVIVES the declared kill-criteria.** (Center t=2.519 clears 2.0 independently.) Note the criteria intentionally do **not** gate on drawdown — the SURVIVES verdict is a statement about signal significance, *not* a recommendation to trade; the 30.5% no-stop maxDD is handled in the DT1 comparison below.

## DT1 comparison + redundancy call

DT1 "Trend Rider" (validated benchmark): center 20/75/1200, 4h, both-sided, **3·ATR fixed stop**. DT20: 45/400, 1h, long-only, **no stop**. Same causal fill model, cost stack, candles, sizing frame, and mark-to-market Sharpe methodology → directly comparable **on the leverage-invariant metrics**. The `expR`/`totRet%` rows are **NOT comparable** (DT20's proxy 2·ATR unit vs DT1's real 3·ATR stop) and are shown greyed for context only.

| Metric | DT20 center (45/400) | DT1 center (20/75/1200) | Winner |
|---|---|---|---|
| Sharpe | **1.63** | 1.30 | DT20 |
| MAR | **1.97** | 1.47 | DT20 |
| t-stat | **2.519** | 2.005 | DT20 |
| WR% | **30.7** | 29.3 | ≈ tie |
| PF | **3.43** | 2.71 | DT20 |
| **maxDD%** | 30.54 | **9.42** | **DT1 (3.2× shallower)** |
| **maxDD_R** | 28.64 | **4.80** | **DT1** |
| stop | **none (uncapped tail)** | 3·ATR fixed | **DT1** |
| _expR (proxy — not comparable)_ | _+3.549R_ | _+0.896R_ | _— (different risk unit)_ |
| _totRet% (proxy — not comparable)_ | _1099_ | _85.6_ | _— (sizing artifact)_ |
| n | 88 | 75 | — |

**Weekly-R Pearson vs `dt1_trades_center.csv`: r = 0.7171** (268 weeks union; DT20 active 80 wk, DT1 active 71 wk).

**C2 line** — Krown daily-trend benchmark: C2 center Sharpe **0.93** / MAR **0.96**; C2 best-gated Sharpe **1.44** / MAR **2.56**. DT20 center (Sharpe **1.63** / MAR **1.97**) **beats C2 center on both** and beats C2 best-gated on **Sharpe** (1.63 vs 1.44), trailing it on **MAR** (1.97 vs 2.56).

### Beat / diversify / redundant → **REDUNDANT (least-correlated clone, but disqualified by no-stop DD)**

- **Not a diversifier.** r=0.72 weekly is the *lowest* of the three trend clones (DT18 0.80, DT19 0.82), because DT20 trades a different timeframe (1h vs 4h) and is long-only — but 0.72 is still a strong same-family correlation. It is the **same BTC EMA-cross trend edge**; adding it to a book that holds DT1 buys little real diversification.
- **Appears to "beat" DT1 on the headline risk-adjusted metrics** (Sharpe 1.63>1.30, MAR 1.97>1.47, t 2.52>2.00) — but that edge is **bought with a 3.2× deeper, structurally *uncapped* drawdown** (30.5% vs 9.4%, no stop). A single bear trend that never crosses under can bleed far past 30%; the worst realized trade already lost **−4.35R** (more than the sizing unit). This is a *fragile* way to hold the same signal, and the reason the SURVIVES verdict is **not** a trade recommendation.
- **Verdict: carry ONE trend-family line — DT1** (validated, locked, 3·ATR-stopped, 9.4% DD). DT20 does **not** earn a separate book slot: it is redundant (r=0.72) and its no-stop tail is disqualifying. Its value is diagnostic — it proves the raw crossover edge is real, simple, and significant even at the library's floor. If anything from DT20 is worth carrying forward, it is only as a reminder that DT1's fixed stop is what makes the *same* edge holdable.

### Trend-family conclusion (3 of 3 clones tested)

DT18 (r=0.80, redundant-**and-worse**), DT19 (r=0.82, redundant-**but-refines** via trailing stop), DT20 (r=0.72, redundant-**higher-DD** floor). **All three DaviddTech trend clones collapse onto DT1's single edge — none diversifies it.** The takeaway: the DaviddTech "trend family" is *one* edge (BTC EMA-cross trend-following) re-expressed with different exits/timeframes/sides; the library offers **no independent trend alpha beyond DT1**. The book carries exactly one trend line (DT1), with DT19's trailing exit flagged as an optional drawdown-refinement of it and DT20 archived as the confirming floor.

## Worked examples (hand-traced from `dt20_trades_center.csv`)

**Example 1 — first center trade, a loser that exceeds 1R (the no-stop tax in one trade):**
- Crossover on closed bar 1130 (2019-10-26 02:00 close), long fills at bar 1131 open `entry_ref=9657.88` → `entry_fill=9657.88×1.0002=9659.81`.
- `entry_atr=295.443`, proxy risk unit `stop_dist = 2×295.443 = 590.89`; `risk=$100` (first trade, 1% of $10k), `size = 100/590.89 = 0.169237`.
- Price rolled over; crossunder on bar 1468 → exit fills bar 1469 open `exit_ref=8822.07` → `exit_fill=8822.07×0.9998=8820.31`.
- `gross = 0.169237×(8820.31 − 9659.81) = −142.08`; `fees = 0.169237×(9659.81+8820.31)×0.0005 = 1.56`; `net = −143.64`; **R = −143.64/100 = −1.436** ✓ (matches ledger). **R < −1 because nothing stopped it out** — a stopped system (DT1) would have capped this near −1R. This is the structural risk in miniature.

**Example 2 — the biggest center winner (+58R), showing why proxy-R explodes:**
- Crossover into the Jan-2023 rally, long fills bar (entry 2023-01-04 15:00) `entry_ref=16820.9` → `entry_fill=16824.26`.
- `entry_atr=44.2245` — a **very quiet** ATR right before the move → proxy `stop_dist = 88.45` is tiny → `size = risk/stop_dist = 266.15/88.45 = 3.009` BTC (equity had compounded to ≈$26.6k).
- Held with **no profit cap** until the crossunder on 2023-02-09; exit `exit_ref=21989.5` → `exit_fill=21985.1`.
- `gross = 3.009×(21985.1 − 16824.26) = 15,529`; `fees = 3.009×(16824.26+21985.1)×0.0005 = 58.4`; `net = 15,471`; **R = 15,471/266.15 = 58.1** ✓. A low-ATR entry sizes big, then a +31% trend with no stop and no target → 58 proxy-R on one trade. **This single mechanic — tight proxy unit × uncapped trend hold — is the entire reason DT20's expR (3.5R) and totRet (1099%) dwarf DT1's, and exactly why those two rows are not comparable across strategies.**

## PROOFS

**py_compile:**
```
$ python3 -m py_compile backtests/bt_dt20_ema_baseline.py
PY_COMPILE_OK
```

**Determinism — md5 of ledgers, two independent runs (byte-identical):**
```
run 1   md5 center ledger: 65936c2da80653059c3de474b9ebed66
run 2   md5 center ledger: 65936c2da80653059c3de474b9ebed66
run 1   md5 best   ledger: 65936c2da80653059c3de474b9ebed66   (best == center cell 45/400)
run 2   md5 best   ledger: 65936c2da80653059c3de474b9ebed66
run 1   md5 grid csv     : f880046f7b3249236f9ae42b202c4c41
run 2   md5 grid csv     : f880046f7b3249236f9ae42b202c4c41
```

**Candle count + <2025 lockout proof:**
```
1m rows loaded: 2,795,040   min=2019-09-09 00:00:00+00:00   max=2024-12-31 23:59:00+00:00
1h bars:           46,584   min=2019-09-09 00:00:00+00:00   max=2024-12-31 23:00:00+00:00
cutoff (exclusive): 2025-01-01 00:00:00+00:00   →  0 candles ≥ 2025-01-01 UTC
```
Max 1m timestamp is `2024-12-31 23:59` and max 1h bar opens `2024-12-31 23:00` (closes 23:59) — the entire 2025 out-of-sample period is untouched.

## Files

- Engine: `backtests/bt_dt20_ema_baseline.py`
- Report: `Strategy Codex/DaviddTech/backtests/DT20_EMA_CROSS_BASELINE.md`
- Ledgers: `dt20_trades_center.csv` (88 trades) · `dt20_trades_best.csv` (== center, 88 trades) · `dt20_grid.csv` (9 cells)
- Stats dump: `backtests/_dt20_stats.json`
