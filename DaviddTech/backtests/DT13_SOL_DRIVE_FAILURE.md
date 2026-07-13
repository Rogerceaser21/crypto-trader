✅ SURVIVES — clears all 3 declared kill-gates: **center-region expR = +0.068R (>0, all 7 cells positive)**, **1,313 center trades (≥40)**, **best-cell t = 2.18 (≥2.0)**. But it is a *thin, corner-hugging, one-directional* survival, not a robust edge. Three hard caveats belong on the same line as the verdict: (1) the CENTER cell's **own** t is **1.84 — below 2.0**; survival leans entirely on the best-of-27 gate. (2) **Only 3/27 cells reach t≥2.0 and all three sit in the `driveMin=2.0` corner** (the best cell is the literal grid extreme, all three params maxed) — an edge-of-grid + multiplicity flag. (3) The whole edge is **LONG-ONLY**: at center the long leg is +0.154R (n=684) while the short leg is **−0.006R (n=629, dead)**; DT13 is not a symmetric drive-fade, it is **dip-buying a structurally bull asset** (SOL ~20×'d over the IS window), so its expectancy is largely SOL beta and is the single biggest OOS risk. It passes the letter of the gauntlet on the strength of a huge n; treat it as *conditionally alive pending a bear/sideways OOS*, not validated.

# DT13 "SOL Open-Drive-Failure Fade" — causal backtest of DaviddTech library strategy "C25-016-OPEN-DRIVE-FAILURE"

SOLUSDT-perp **1h bars built from 1m OHLCV**, failed-drive detection on **closed 1h bars**, fills at the **next 1m open**, a **moving hard stop** (`entryRef ∓ slMult·ATR`, re-evaluated each bar with current ATR — no TP) plus a **maxBars time-stop**, sizing at **flat 1%-equity risk vs the initial stop distance**. IS window **2020-09-14 → 2024-12-31** (37,673 1h bars from 2,260,380 pre-2025 1m candles; **SOL's history is shorter than BTC/ETH — only ~4.3y IS**, warmup = 14 ATR bars). 2025+ locked out (loaded **0** candles ≥ 2025-01-01 UTC). Engine `backtests/bt_dt13_sol_drive_failure.py`. Source of truth `Strategy Codex/DaviddTech/research/pine_ethsol/SOL_C25_016_OPEN_DRIVE_FAILURE.pine` (Pine v5, 37 lines) — same systematic **C-series author** as the validated BTC "Vol-Surge Breakout" (DT2, C25-021).

> **Author's claim (selection-only context — NOT evidence, NOT a target):** PF 1.24, Sharpe 1.13, +73%, DD 17.4%, 849 trades over 2.9y. A public library headline carrying zero evidential weight against a clean causal test. *Notably* — unlike most fades in this project — the claim roughly **reproduces** here: our `driveMin=2.0` region lands PF **1.20–1.27**, Sharpe **~1.07**, DD **19–35%**, and the author's 849-trade count sits between our `driveMin=1.5` (1,313) and `2.0` (606–759) signal densities. The author was not fabricating; the edge is real-but-thin, which is exactly why the low PF (1.24) × huge n makes the **significance test the whole ballgame**.

## SPEC — derived from the Pine (frozen)

### Failed-drive detection (Pine lines 7–12, on a CLOSED 1h bar)
- `atr = ta.atr(14)` — Wilder RMA of True Range, SMA seed at index 13.
- `rng = high − low`;  `clv = rng>0 ? (close−low)/rng : 0.5` (close location value; 0.5 if the bar has zero range).
- `failUp = rng > driveMin·atr AND clv < 0.30` → a big-range bar that **closed in its bottom 30%** = a failed upside drive → **SHORT** (fade the failed rally).
- `failDn = rng > driveMin·atr AND clv > 0.70` → big range, **closed in top 30%** = failed downside drive → **LONG** (fade the failed sell-off).

### Signals & execution (Pine lines 13–36) — LONG **and** SHORT, flat-only
- `pyramiding=0`: a new signal is ignored while a position is open (Pine `if strategy.position_size == 0`). Only the two exits below flatten.
- **ENTRY** at the **next 1m open** after the signal bar closes. A 1h bar's open **is** its first 1m open, so "open of bar i+1" == `o1h[i+1]` (causal, no look-ahead). `entryRef := signal-bar CLOSE`; `entryBar := signal-bar index` (the time-stop clock runs from the **signal** bar, not the fill bar).
- **EXIT (a) MOVING HARD STOP** `= entryRef ∓ slMult·atr`, **re-evaluated every bar with the CURRENT bar's atr** (Pine `strategy.exit(stop=…)` runs on every open bar ⇒ a *moving* stop; `entryRef` fixed, `atr` changes). The level computed at the close of bar *j−1* (using `atr[j−1]`) is the level tested intrabar during bar *j* — causal, one-bar lag. **No stop is active on the entry bar itself** (Pine places the first stop only at the entry bar's close, tested from the next bar) — identical to the DT2 precedent. There is **no take-profit**.
- **EXIT (b) TIME-STOP** `bar_index − entryBar ≥ maxBars` (1h bars) → `strategy.close` ⇒ market order, fills at the **next 1h open**. Within a bar the Pine (re)places the stop *then* checks the time-stop; a fired `strategy.close` fills at the bar **open** (chronologically first), so a pending time-stop resolves **before** any intrabar stop on the same bar — and if that bar gaps through the stop, the open fill is already the worse price. **Ambiguity = LOSS.**

### Sizing (declared) — flat 1%-equity risk vs the INITIAL stop distance
```
risk      = equity · 1%
init_dist = slMult · atr[sig_bar]          (the atr the Pine uses to size qtyRaw)
size      = risk / init_dist ;  R = net_pnl / risk
```
Equity compounds sequentially (DT1/DT2-style); per-trade R is size-normalised, so **expR / PF / Sharpe-on-R / t-stat are equity-independent** — only totRet and the mark-to-market maxDD% depend on the compounding path. Realized R at the *moving* stop can differ from −1 (the stop drifts with ATR between signal and exit).

### Execution conventions (reused from `bt_engine.py` / DT2, DT10–DT12 scaffolding)
Fees **0.05%/side**, slippage **0.02%/fill**, **$10k** start. long: `entry=ref·(1+slip)`, `exit=ref·(1−slip)`; short mirrored (stop/time-stop/eod all filled with **adverse** slippage). 1m data used for intrabar stop-touch. 1h **mark-to-market** equity curve (long+short aware, idle bars included) → Sharpe ×√(24·365) & maxDD%; per-trade R drives expR/PF/t/maxDD_R. Deterministic (no RNG / wall-clock, sorted output) — two runs byte-identical (md5s below).

## DECLARED GRID (fixed BEFORE any result) — exactly 27 cells, no additions
```
driveMin ∈ {1.25, 1.5, 2.0}
slMult   ∈ {1.5, 2.0, 2.5}
maxBars  ∈ {16, 24, 36}                     # 3 × 3 × 3 = 27
CENTER = (driveMin 1.5, slMult 2.0, maxBars 24)  = Pine defaults
CENTER-REGION = center + one grid step on each axis (7 cells):
  (1.5,2.0,24)· (1.25,2.0,24) (2.0,2.0,24) · (1.5,1.5,24) (1.5,2.5,24) · (1.5,2.0,16) (1.5,2.0,36)
```

## 27-CELL GRID (IS, after costs) — expR, trades, PF, Sharpe, maxDD%, t
`maxDD%` = mark-to-market equity drawdown; `t` = per-trade R t-stat (ddof=1). **Bold** = t ≥ 2.0.

| driveMin | slMult | maxBars | trades | WR% | expR | PF | Sharpe | maxDD% | t |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1.25 | 1.5 | 16 | 2172 | 37.6 | +0.017 | 1.029 | 0.24 | 56.4 | 0.49 |
| 1.25 | 1.5 | 24 | 1856 | 33.5 | +0.021 | 1.031 | 0.24 | 52.3 | 0.49 |
| 1.25 | 1.5 | 36 | 1553 | 28.1 | +0.039 | 1.054 | 0.35 | 46.7 | 0.71 |
| 1.25 | 2.0 | 16 | 1961 | 43.9 | +0.027 | 1.056 | 0.45 | 39.9 | 0.91 |
| 1.25 | 2.0 | 24 | 1645 | 39.3 | +0.032 | 1.057 | 0.43 | 34.7 | 0.87 |
| 1.25 | 2.0 | 36 | 1334 | 35.8 | +0.066 | 1.104 | 0.67 | 26.5 | 1.35 |
| 1.25 | 2.5 | 16 | 1850 | 45.5 | +0.001 | 1.001 | 0.00 | 51.8 | 0.02 |
| 1.25 | 2.5 | 24 | 1516 | 42.3 | +0.004 | 1.009 | 0.06 | 30.4 | 0.14 |
| 1.25 | 2.5 | 36 | 1207 | 39.9 | +0.050 | 1.091 | 0.57 | 35.6 | 1.14 |
| 1.50 | 1.5 | 16 | 1669 | 37.4 | +0.022 | 1.037 | 0.27 | 34.1 | 0.56 |
| 1.50 | 1.5 | 24 | 1454 | 33.6 | +0.058 | 1.088 | 0.59 | 36.6 | 1.20 |
| 1.50 | 1.5 | 36 | 1255 | 29.1 | +0.115 | 1.157 | 0.90 | 31.7 | 1.80 |
| 1.50 | 2.0 | 16 | 1542 | 43.3 | +0.045 | 1.093 | 0.65 | 27.8 | 1.31 |
| **1.50** | **2.0** | **24 (CENTER)** | **1313** | **39.8** | **+0.077** | **1.139** | **0.90** | **22.2** | **1.84** |
| 1.50 | 2.0 | 36 | 1117 | 34.9 | +0.100 | 1.158 | 0.91 | 29.6 | 1.82 |
| 1.50 | 2.5 | 16 | 1480 | 45.4 | +0.036 | 1.089 | 0.61 | 23.5 | 1.24 |
| 1.50 | 2.5 | 24 | 1234 | 43.7 | +0.054 | 1.113 | 0.72 | 17.9 | 1.47 |
| 1.50 | 2.5 | 36 | 1032 | 39.3 | +0.074 | 1.133 | 0.75 | 21.0 | 1.50 |
| 2.00 | 1.5 | 16 | 788 | 38.6 | +0.057 | 1.095 | 0.47 | 37.5 | 0.97 |
| 2.00 | 1.5 | 24 | 733 | 35.1 | +0.145 | 1.221 | 1.00 | 26.8 | 1.97 |
| 2.00 | 1.5 | 36 | 685 | 30.7 | +0.146 | 1.205 | 0.83 | 35.0 | 1.68 |
| 2.00 | 2.0 | 16 | 759 | 43.9 | +0.053 | 1.108 | 0.53 | 33.7 | 1.08 |
| 2.00 | 2.0 | 24 | 696 | 40.9 | +0.113 | 1.203 | 0.94 | 27.9 | 1.88 |
| **2.00** | **2.0** | **36** | **639** | **37.7** | **+0.159** | **1.258** | **1.06** | **32.9** | **2.12** |
| 2.00 | 2.5 | 16 | 746 | 46.8 | +0.041 | 1.099 | 0.49 | 30.8 | 0.99 |
| **2.00** | **2.5** | **24** | **673** | **45.8** | **+0.106** | **1.225** | **1.02** | **19.5** | **2.06** |
| **2.00** | **2.5** | **36 (BEST-t)** | **606** | **42.4** | **+0.141** | **1.267** | **1.07** | **27.1** | **2.18** |

**27/27 cells positive-expectancy**, but the *strength* is monotone in `driveMin` and only the **`driveMin=2.0` block reaches significance**: exactly **3 cells clear t≥2.0** — (2.0, 2.0, 36) t=2.12, (2.0, 2.5, 24) t=2.06, (2.0, 2.5, 36) t=2.18 — **all three in the highest-drive-threshold corner** (with (2.0, 1.5, 24) t=1.97 just under). Raising `driveMin` (fewer, cleaner "genuine exhaustion" drives) and lengthening `maxBars` (let the reversion mature) both help; `driveMin=1.25` (noisy) never gets above t=1.35. The edge lives in the corner and is asking for parameters *past* the grid's edge — a robustness warning, not a plateau.

## CENTER-REGION ANALYSIS
Center-region (7 cells) expR: **[+0.077, +0.032, +0.113, +0.058, +0.054, +0.045, +0.100]** → **mean +0.068R > 0** (kill-gate #1 PASS), **all 7 positive**. The region is uniformly positive but uniformly *sub-significant* — the strongest neighbour is the `driveMin=2.0` step (t=1.88), the weakest the `driveMin=1.25` step (t=0.87). The sign is robust; the *significance* is not — every cell in and around the center sits below t=2.0. This is a shallow, broad edge, not a sharp one.

### Best cell + multiplicity caveat
**Best-t = (driveMin 2.0, slMult 2.5, maxBars 36)**: n=606, WR 42.4%, expR **+0.141R**, PF **1.267**, Sharpe **1.07**, t **2.18**, maxDD **27.1%**, totRet **+118.0%**, CAGR **+19.9%**, MAR **0.73**. This is the **literal extreme corner of the grid** (all three parameters at their maximum), selected as best-of-27 — the two conditions that most inflate a t-stat. It is *not* an isolated spike (its neighbours (2.0,2.0,36) and (2.0,2.5,24) also clear 2.0, so there is a small contiguous significant cluster), but that cluster hugs the driveMin=2.0 edge and clears the bar by only **+0.18**. Read t=2.18 as "**just over** the 2.0 line", and note the honest possibility that the true optimum is at `driveMin>2.0` / `maxBars>36`, outside what was declared — i.e. this may be edge-of-grid over-fit that a locked OOS will not reward.

### Long/short split (CENTER vs BEST) — the decisive asymmetry
| cell | long n / WR / expR / netR | short n / WR / expR / netR |
|:--|:--|:--|
| CENTER (1.5,2.0,24) | 684 / 40.8% / **+0.154** / **+105.5R** | 629 / 38.8% / **−0.006** / **−3.9R** |
| BEST (2.0,2.5,36)   | 352 / 42.6% / **+0.219** / **+77.0R** | 254 / 42.1% / **+0.034** / **+8.5R** |
At center the **long leg is the entire edge** (+105R) and the **short leg is dead** (−0.006R, a coin-flip). Even at the best cell the long leg (+0.219R) does ~90% of the work and the short leg is barely positive (+0.034R). This is the *expected* SOL asymmetry taken to its logical end: **fading a failed sell-off = buying a dip on an asset that trended up ~20× across the IS window**, so the long-fade harvests mean-reversion *plus* structural drift, while the short-fade (selling a failed rally into a bull) has its reversion cancelled by the trend. **DT13's expectancy is materially a long-only SOL-beta play** — the mechanism that makes it survive IS is the same one that makes it fragile to a bear/sideways 2025+ OOS.

### Exit mix (moving stop vs time-stop) — the mechanism is real
| cell | stop (n / netR) | time-stop (n / netR) | eod |
|:--|:--|:--|:--|
| CENTER (1.5,2.0,24) | 669 / **−688.3R** | 644 / **+789.8R** | 0 |
| BEST (2.0,2.5,36)   | 293 / **−303.5R** | 313 / **+389.0R** | 0 |
The engine is **many capped ~1R stops offset by time-stop exits that bank the reversion**: at center 669 stops bleed −688R (each bounded near −1R by the moving stop) while 644 time-stops pay +790R, netting +101.5R = 1,313 × +0.077R. ✓ The **moving stop is load-bearing** (it caps the tail exactly as it did for DT2/DT12), and the time-stop is the profit-realiser — a mechanically sound, non-artifactual structure. Zero `eod` flushes (all positions closed by stop or time-stop within the window).

## KILL CRITERIA (verbatim) & evaluation
> **DEAD unless center-region expR after costs > 0 AND ≥40 IS trades at center AND best-cell t ≥ 2.0.**

| gate | requirement | result | verdict |
|:--|:--|:--|:--:|
| 1 | center-region expR after costs > 0 | **+0.068R** (all 7 cells +) | ✅ PASS |
| 2 | ≥ 40 IS trades at center | **1,313** | ✅ PASS |
| 3 | best-cell t ≥ 2.0 | **2.18** | ✅ PASS |

All three met → **not DEAD → SURVIVES.** Honest framing: gate #1 passes but every center-region cell is *individually* sub-significant (center's own t=1.84); gate #3 passes by **+0.18** on a best-of-27, extreme-corner cell. This is a **pass on a technicality of scale** (849→1,313 trades give the thin per-trade edge enough n to register), not a decisive win.

## C2 BENCHMARK COMPARISON
C2 reference (BTC daily): center **Sharpe 0.93 / MAR 0.96**; best-gated **Sharpe 1.44 / MAR 2.56**.

| build | asset/TF | stop | expR | PF | Sharpe | maxDD% | MAR |
|:--|:--|:--|--:|--:|--:|--:|--:|
| DT13 CENTER (1.5,2.0,24) | SOL 1h | moving ±2.0·ATR | +0.077 | 1.14 | **0.90** | 22.2 | **1.01** |
| DT13 BEST (2.0,2.5,36)   | SOL 1h | moving ±2.5·ATR | +0.141 | 1.27 | **1.07** | 27.1 | **0.73** |
| C2 center | BTC daily | — | — | — | 0.93 | — | 0.96 |
| C2 best-gated | BTC daily | — | — | — | 1.44 | — | 2.56 |

DT13's **center Sharpe (0.90) essentially matches C2's plain center (0.93)** and its center MAR (1.01) edges C2's (0.96) — a genuinely comparable risk-adjusted return at the shipped setting, better than DT12's center (Sharpe 0.48). But its **best cell (Sharpe 1.07 / MAR 0.73) falls well short of C2's best-gated (1.44 / 2.56)** — and DT13's best MAR is actually *worse* than its center because the corner cell trades higher DD (27%) for the extra expR. So DT13 sits **near C2's plain-center bar but nowhere near C2's gated best**, and its per-bar Sharpe includes idle flat bars (deflating it vs an always-in benchmark).

**vs DT2 (its BTC C-series cousin):** DT2 center **+0.296R, Sharpe 1.29, n=198**. DT13 center **+0.077R, Sharpe 0.90, n=1,313** — a **~4× weaker per-trade edge** spread over **~6.6× more trades**. DT2 is the higher-quality sibling (a breakout that rides trend); DT13 is a thin fade that only reaches significance by brute sample size, and only on its long (beta-aligned) leg.

## WORKED EXAMPLES (real timestamps, CENTER ledger `dt13_trades_center.csv`, hand-traced)
**1 — LONG fade win (failDn → long, time-stop).** Signal bar **2020-10-08 12:00 UTC**: O 2.1686 / H 2.2669 / L 2.1518 / C 2.2633, `atr`=0.06473 → `rng`=0.1151 > `1.5·atr`=0.0971 ✓ and `clv`=(2.2633−2.1518)/0.1151=**0.969 > 0.70** ⇒ failed sell-off ⇒ LONG. Fill next 1m open **2020-10-08 13:00** @ 2.2634 → entry_fill 2.2639 (+slip); `init_dist`=2·0.06473=0.1295, moving stop starts at 2.1338 and is never touched (SOL rallies). Held the full **24 bars** to the time-stop, exit @ 2.5876 on **2020-10-09 13:00** → net **+$216.94 → R +2.48**. The long-fade capturing a +14% bounce — the profit engine in miniature.

**2 — SHORT fade loss (failUp → short, moving stop, capped).** Signal bar **2020-09-17 03:00 UTC**: O 2.5818 / H 2.6231 / L 2.4696 / C 2.4836, `atr`=0.09673 → `rng`=0.1535 > `1.5·atr`=0.1451 ✓ and `clv`=(2.4836−2.4696)/0.1535=**0.091 < 0.30** ⇒ failed rally ⇒ SHORT @ 2.4836 (fill 2020-09-17 04:00, entry_fill 2.4831 −slip). SOL keeps climbing; the **moving stop** set at the **12:00 close** (atr 0.09684) = entryRef+2·atr = **2.6773** is pierced by the **13:00** high (2.6855) → exit @ 2.6773 (adverse slip 2.6778) on **2020-09-17 13:00**, 9 bars held → net **−$101.75 → R −1.02**. A textbook capped short loser — and a microcosm of why the short leg nets ≈0: fading rallies into an uptrend just feeds the moving stop.

**3 — LONG fade loss (failDn → long, moving stop).** Signal **2020-09-21 03:00 UTC** ⇒ LONG @ 2.9918 (fill 04:00), moving stop ~2.845; SOL breaks lower, stop hit @ 2.8382 on **2020-09-21 07:00** (3 bars) → net **−$102.31 → R −1.06.** The stop caps even the long-side losers near 1R — confirming the loss tail is bounded on both legs.

## PROOFS
- **Deterministic ledger, two independent runs** (CENTER cell recomputed from a fresh full sim; CSV bytes md5'd):
  - run #1 md5 = `007ec9b417a7a1c179532fe5b739fb5f`
  - run #2 md5 = `007ec9b417a7a1c179532fe5b739fb5f`  → **equal ✅**
  - center file md5 = `007ec9b417a7a1c179532fe5b739fb5f` · best file md5 = `fbd9c2e0914165a288916b2309e67859` · grid csv md5 = `4b976839d8ffa9aefb93c33361ee6cc5`
- **`py_compile`**: `python3 -m py_compile backtests/bt_dt13_sol_drive_failure.py` → exit 0, no output (clean). ✅
- **Hard <2025 lockout**: 1m candles loaded = **2,260,380**, min **2020-09-14 07:00:00+00:00**, max **2024-12-31 23:59:00+00:00**; candles ≥ 2025-01-01 UTC loaded = **0**. 1h bars = **37,673** (min 2020-09-14 07:00, max 2024-12-31 23:00). IS ≈ **4.3y** (SOL's shorter history vs BTC/ETH), warmup 14 ATR bars. Trades/year at center: 2020=101, 2021=309, 2022=302, 2023=298, 2024=303 — evenly distributed, not a single-regime artifact. ✅
- **Hand-check**: Examples 1 & 2 re-derived directly from the resampled 1h OHLC + Wilder ATR (rng, clv, driveMin·atr, moving-stop path, next-open fill) — every figure matches the ledger to the printed precision, including the one-bar causal lag of the moving stop (stop tested during the 13:00 bar = the level set at the 12:00 close). ✅

### Ledgers (next to this report)
- `dt13_grid.csv` — all 27 cells.
- `dt13_trades_center.csv` — CENTER (1.5, 2.0, 24), 1,313 trades.
- `dt13_trades_best.csv` — BEST-t (2.0, 2.5, 36), 606 trades.

**Bottom line.** DT13 **survives the three declared gates** and is the biggest-sample test in the campaign — but it survives *thinly and one-sidedly*. The drive-fade mechanism is genuine (capped moving stops + reversion-banking time-stops, a sound structure), the author's PF ~1.24 claim reproduces honestly, and 27/27 cells are positive. Yet the edge is **sub-significant everywhere except a 3-cell `driveMin=2.0` corner**, the CENTER's own t is 1.84, and **~90% of the expectancy is the long (dip-buying) leg on an asset that 20×'d** — i.e. largely SOL beta, not a symmetric reversion edge. The decisive next gate is a **locked 2025+ OOS run on the `driveMin=2.0` region, with the long/short legs reported separately**: if the short leg stays dead and the long leg only works while SOL trends up, DT13 is a beta proxy dressed as a strategy. Provisionally alive; not yet trustworthy.
