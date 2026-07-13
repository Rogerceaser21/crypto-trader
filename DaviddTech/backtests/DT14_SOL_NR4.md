✅ SURVIVES — clears all 3 declared kill-gates: **center-region expR = +0.077R (>0, all 7 cells positive)**, **464 center trades (≥40)**, **best-cell t = 2.45 (≥2.0)**. Three caveats belong on the verdict line: (1) the CENTER cell's **own** t is **1.36 — well below 2.0**; survival leans entirely on the best-of-27 gate (same shape as DT13). (2) **All 3 significant cells sit at `rr=2.2` (the grid's MAX reward-ratio)** and the best cell **(2.5, 2.2, 40) is the literal extreme corner** — all three parameters maxed: an edge-of-grid + multiplicity flag, with the honest possibility that the true optimum wants `rr>2.2`, *outside* the declared grid. (3) The edge is **long-tilted** (center long **+0.104R** n=239 vs short **+0.049R** n=225) BUT — the decisive contrast with DT13 — the short leg is **ALIVE and COUNTER-CYCLICAL**: it **carried the 2022 SOL bear (+18.3R short vs −5.8R long)** while the long leg carried the 2021/2023 bull. DT14 is materially **less of a pure SOL-beta proxy** than its DT13 cousin — a genuine (if thin) *regime-adaptive* breakout that flips direction, not a one-way dip-buy. Provisionally alive; the locked 2025+ OOS (with legs reported separately) is the real gate.

# DT14 "SOL NR4 Breakout" — causal backtest of DaviddTech library strategy "C25-023-NR4-BREAKOUT"

SOLUSDT-perp **4h bars built from 1m OHLCV** (UTC-aligned buckets 00/04/08/12/16/20, label/closed=left), narrow-range breakout detection on **closed 4h bars**, fills at the **next 1m open**, a **moving BRACKET** (stop `entryRef ∓ slMult·ATR` **and** target `entryRef ± rr·slMult·ATR`, *both* re-evaluated each bar with the current ATR) plus a **maxBars time-stop**, sizing at **flat 1%-equity risk vs the initial stop distance**. IS window **2020-09-14 → 2024-12-31** (9,419 4h bars from 2,260,380 pre-2025 1m candles; **SOL's history is shorter than BTC/ETH — only ~4.3y IS**, warmup = 14 ATR bars). 2025+ locked out (loaded **0** candles ≥ 2025-01-01 UTC). Engine `backtests/bt_dt14_sol_nr4.py`. Source of truth `Strategy Codex/DaviddTech/research/pine_ethsol/SOL_C25_023_NR4_BREAKOUT.pine` (Pine v5, 39 lines) — same systematic **C-series author** as the validated BTC "Vol-Surge Breakout" (DT2, C25-021) and the SOL "Drive-Failure Fade" (DT13, C25-016).

> **Author's claim (selection-only context — NOT evidence, NOT a target):** PF 1.18, Sharpe 0.67, +22%, DD 10.7%, 300 trades over 2.9y. *Notably* the claim **reproduces closely** on the Pine-default CENTER cell here: our (2.0, 1.8, 30) lands **PF 1.149** (claim 1.18), **Sharpe 0.661** (claim 0.67), **maxDD 13.3%** (claim 10.7%), **464 trades over 4.3y** = ~300 per 2.9y (claim 300). The author was not fabricating; the spec replication is faithful and the edge is real-but-thin — which is exactly why the low PF × best-of-27 gate makes the significance the whole ballgame.

## SPEC — derived from the Pine (frozen), with the load-bearing indexing spelled out

### The NR4 condition (Pine lines 8–12) — READ CAREFULLY, replicated LITERALLY
```
r0 = high - low                                   # range of the CURRENT bar
r1 = high[1] - low[1]                             # range of bar[-1]
r2 = high[2] - low[2]                             # range of bar[-2]
r3 = high[3] - low[3]                             # range of bar[-3]
nr4 = r1 <= r2  and  r1 <= r3  and  r1 <= r0[1]
```
**`r0[1]` is the SERIES `r0` shifted one bar** = `(high−low)[1]` = `high[1]−low[1]` = **`r1` EXACTLY**. So the third conjunct `r1 <= r0[1]` is `r1 <= r1` → **ALWAYS TRUE**. The Pine's "NR4" therefore reduces to
```
nr4  ≡  (r1 <= r2)  and  (r1 <= r3)
```
i.e. **bar[-1]'s range is the narrowest of the last THREE bars {bar[-1], bar[-2], bar[-3]}** — an **NR3 mislabelled NR4** (a *true* NR4 would compare against `r4 = high[4]−low[4]`, not the tautological `r0[1]`; this is an author bug). Per the frozen-spec mandate we implement the Pine **AS WRITTEN** — the tautological conjunct is coded explicitly in `signal_arrays()` and a runtime assertion confirms `r1 <= r0[1]` is True on every defined bar (proof below). We do **not** "fix" it to a real NR4; the Pine is the spec.

### Signals (Pine lines 13–14) — the double lag
```
longSig  = nr4[1] and close > high[1]
shortSig = nr4[1] and close < low[1]
```
`nr4[1]` = `nr4` one bar back. On the CLOSED signal bar *i*:
- `nr4[1]` true ⇒ **range(i−2) is narrowest of {range(i−2), range(i−3), range(i−4)}** → the **NR (contraction) bar is i−2**.
- `close > high[1]` ⇒ **close(i) > high(i−1)** → the breakout reference is the high/low of bar **i−1** (the bar right after the NR bar), and the trigger is bar **i**'s CLOSE.

So the geometry is: NR bar at *i−2*, break-reference bar at *i−1*, trigger close at *i*. Replicated 1:1 as `longSig[i] = nr4_shift1[i] & (c4[i] > h4[i−1])`, `shortSig[i] = nr4_shift1[i] & (c4[i] < l4[i−1])`. `longSig` is checked first (Pine `if…else if`), so a (near-impossible) double trigger resolves long.

### Execution (Pine lines 15–38) — LONG **and** SHORT, flat-only, moving bracket
- `pyramiding=0`: a new signal is ignored while a position is open (Pine `if strategy.position_size == 0`). Only the exits below flatten.
- **ENTRY** at the **next 1m open** after the signal bar closes == the 4h OPEN of bar *i+1* (causal). `entryRef := signal-bar 4h CLOSE`; `entryBar := signal-bar index` (the time-stop clock runs from the **signal** bar).
- **EXIT — MOVING BRACKET** (`strategy.exit(stop=…, limit=…)`, placed at each bar's close while in a position, live the next bar):
  - LONG: `stop = entryRef − slMult·atr`, `target = entryRef + rr·slMult·atr`.
  - SHORT: `stop = entryRef + slMult·atr`, `target = entryRef − rr·slMult·atr`.
  - `entryRef` is **fixed**; `atr` is **re-evaluated every bar** ⇒ **BOTH levels drift with the current ATR** (a moving bracket, DT2/DT13 moving-stop precedent extended to two sides). The bracket computed at the close of bar *j−1* (using `atr[j−1]`) is the level tested intrabar during bar *j* — causal, one-bar lag. **No bracket is active on the entry bar itself** (first exit order placed at the entry bar's close, tested from the next bar). Intrabar fills detected on **1m data**, filled **AT the level with adverse slippage**. Within a testing bar the 1m sub-bars are walked in order: the **earlier** of stop/target wins; a **single 1m sub-bar touching BOTH → ambiguous → LOSS (stop)**.
  - **TIME-STOP** `bar_index − entryBar ≥ maxBars` (4h bars) → `strategy.close` ⇒ market at the **next 4h open**. A pending time-stop fills at the bar **open** (chronologically first), **before** any intrabar bracket on that bar — so it wins same-bar contests, and if that bar gaps through a level the open fill is already the adverse price.

### Sizing (declared) — flat 1%-equity risk vs the INITIAL stop distance
```
risk      = equity · 1%
init_dist = slMult · atr[sig_bar]
size      = risk / init_dist ;  R = net_pnl / risk
```
Equity compounds sequentially; per-trade R is size-normalised, so **expR / PF / Sharpe-on-R / t are equity-independent** — only totRet and the mark-to-market maxDD% depend on the compounding path. Realized R at the *moving* bracket can differ from −1 / +rr (both levels drift with ATR between signal and exit).

### Execution conventions (`bt_engine.py` / DT2, DT13 scaffolding)
Fees **0.05%/side**, slippage **0.02%/fill**, **$10k** start. long: `entry=ref·(1+slip)`, all exits `ref·(1−slip)`; short mirrored (stop/target/time-stop/eod all **adverse** slippage). 1m data for intrabar touch. **4h** mark-to-market equity curve (long+short aware, idle bars included) → Sharpe ×√(2190) & maxDD%; per-trade R drives expR/PF/t/maxDD_R. Deterministic (no RNG / wall-clock, sorted output) — two runs byte-identical (md5s below).

## DECLARED GRID (fixed BEFORE any result) — exactly 27 cells, no additions
```
slMult  ∈ {1.5, 2.0, 2.5}
rr      ∈ {1.4, 1.8, 2.2}
maxBars ∈ {20, 30, 40}                          # 3 × 3 × 3 = 27
CENTER = (slMult 2.0, rr 1.8, maxBars 30)       = Pine defaults
CENTER-REGION = center + one grid step on each axis (7 cells):
  (2.0,1.8,30)· (1.5,1.8,30) (2.5,1.8,30) · (2.0,1.4,30) (2.0,2.2,30) · (2.0,1.8,20) (2.0,1.8,40)
```

## 27-CELL GRID (IS, after costs) — expR, trades, PF, Sharpe, maxDD%, t
`maxDD%` = mark-to-market equity drawdown; `t` = per-trade R t-stat (ddof=1). **Bold** = t ≥ 2.0.

| slMult | rr | maxBars | trades | WR% | expR | PF | Sharpe | maxDD% | t |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1.5 | 1.4 | 20 | 713 | 43.9 | +0.029 | 1.055 | 0.33 | 21.9 | 0.68 |
| 1.5 | 1.4 | 30 | 701 | 44.4 | +0.034 | 1.063 | 0.38 | 23.1 | 0.79 |
| 1.5 | 1.4 | 40 | 693 | 44.3 | +0.037 | 1.069 | 0.41 | 22.1 | 0.86 |
| 1.5 | 1.8 | 20 | 637 | 39.9 | +0.057 | 1.105 | 0.55 | 17.2 | 1.16 |
| 1.5 | 1.8 | 30 | 609 | 38.6 | +0.043 | 1.073 | 0.39 | 18.6 | 0.82 |
| 1.5 | 1.8 | 40 | 596 | 38.1 | +0.040 | 1.068 | 0.37 | 21.9 | 0.76 |
| 1.5 | 2.2 | 20 | 593 | 37.4 | +0.047 | 1.082 | 0.41 | 20.1 | 0.85 |
| 1.5 | 2.2 | 30 | 555 | 34.6 | +0.040 | 1.065 | 0.33 | 18.3 | 0.67 |
| 1.5 | 2.2 | 40 | 539 | 33.6 | +0.015 | 1.023 | 0.12 | 22.0 | 0.24 |
| 2.0 | 1.4 | 20 | 558 | 45.7 | +0.060 | 1.133 | 0.65 | 11.7 | 1.35 |
| 2.0 | 1.4 | 30 | 512 | 44.9 | +0.046 | 1.091 | 0.45 | 16.1 | 0.94 |
| 2.0 | 1.4 | 40 | 496 | 45.6 | +0.063 | 1.124 | 0.60 | 12.5 | 1.25 |
| 2.0 | 1.8 | 20 | 519 | 44.5 | +0.073 | 1.156 | 0.70 | 13.8 | 1.44 |
| **2.0** | **1.8** | **30 (CENTER)** | **464** | **41.2** | **+0.078** | **1.149** | **0.66** | **13.3** | **1.36** |
| 2.0 | 1.8 | 40 | 436 | 41.3 | +0.100 | 1.184 | 0.80 | 15.5 | 1.63 |
| 2.0 | 2.2 | 20 | 495 | 43.6 | +0.091 | 1.191 | 0.81 | 15.4 | 1.63 |
| **2.0** | **2.2** | **30** | **430** | **40.9** | **+0.140** | **1.266** | **1.08** | **12.9** | **2.12** |
| **2.0** | **2.2** | **40** | **400** | **40.2** | **+0.162** | **1.293** | **1.14** | **12.1** | **2.26** |
| 2.5 | 1.4 | 20 | 480 | 49.6 | +0.083 | 1.218 | 0.90 | 12.7 | 1.88 |
| 2.5 | 1.4 | 30 | 430 | 44.9 | +0.029 | 1.061 | 0.28 | 20.9 | 0.57 |
| 2.5 | 1.4 | 40 | 396 | 44.9 | +0.053 | 1.108 | 0.47 | 11.9 | 0.96 |
| 2.5 | 1.8 | 20 | 453 | 47.5 | +0.100 | 1.251 | 0.99 | 12.6 | 1.99 |
| 2.5 | 1.8 | 30 | 395 | 42.8 | +0.062 | 1.123 | 0.52 | 13.2 | 1.02 |
| 2.5 | 1.8 | 40 | 358 | 42.7 | +0.118 | 1.234 | 0.90 | 13.4 | 1.78 |
| 2.5 | 2.2 | 20 | 440 | 47.3 | +0.097 | 1.244 | 0.91 | 19.8 | 1.86 |
| 2.5 | 2.2 | 30 | 369 | 43.4 | +0.105 | 1.217 | 0.81 | 12.1 | 1.56 |
| **2.5** | **2.2** | **40 (BEST-t)** | **325** | **44.0** | **+0.189** | **1.379** | **1.25** | **12.3** | **2.45** |

**27/27 cells positive-expectancy**, but the *strength* is monotone in `rr` and `slMult`: only the **`rr=2.2` block reaches significance** — exactly **3 cells clear t≥2.0**: (2.0, 2.2, 30) t=2.12, (2.0, 2.2, 40) t=2.26, (2.5, 2.2, 40) t=2.45 — **all three at the highest reward-ratio**, two of the three at `maxBars=40` (also grid max). Raising `rr` (let the breakout run to a far target), widening `slMult`, and lengthening `maxBars` all help — the classic breakout "let winners run" gradient. The edge lives on the `rr=2.2` edge of the grid and is asking for parameters *past* it (`rr>2.2`) — a robustness warning, not a plateau. Note `rr=1.4` (cutting winners short) is uniformly the weakest column.

## CENTER-REGION ANALYSIS
Center-region (7 cells) expR in declared order **[+0.078, +0.043, +0.062, +0.046, +0.140, +0.073, +0.100]** → **mean +0.077R > 0** (kill-gate #1 PASS), **all 7 positive**. Their t's are [1.36, 0.82, 1.02, 0.94, **2.12**, 1.44, 1.63]: the strongest neighbour is the **`rr` step up to 2.2 — which is itself significant (t=2.12)** — and the weakest is the `slMult` step down to 1.5 (t=0.82). Unlike DT13 (whose significant cells all sat 2 steps from center in the far `driveMin=2.0` block), DT14 has **a t≥2.0 cell directly adjacent to center on the rr axis**, so the significant region *touches* the shipped setting rather than hiding in a distant corner. The sign is robust; the *significance* is directional — it lives on the high-`rr` side and thins out toward `rr=1.4`.

### Best cell + multiplicity caveat (27 cells)
**Best-t = (slMult 2.5, rr 2.2, maxBars 40)**: n=325, WR 44.0%, expR **+0.189R**, PF **1.379**, Sharpe **1.25**, t **2.45**, maxDD **12.3%**, totRet **+79.1%**, CAGR **+14.5%**, MAR **1.19**. This is the **literal extreme corner of the grid** — all three parameters at their maximum — selected as best-of-27, the two conditions that most inflate a t-stat. It is *not* an isolated spike (its neighbours (2.0,2.2,40) t=2.26 and (2.0,2.2,30) t=2.12 also clear 2.0, forming a small contiguous significant cluster along the `rr=2.2` edge), but that cluster **hugs the maximum-reward-ratio boundary**, so the honest read is that the true optimum plausibly sits at `rr>2.2` / `maxBars>40`, **outside** the declared grid — possible edge-of-grid over-fit that a locked OOS need not reward. Treat t=2.45 as "real but corner-selected", not a robust plateau.

### Long/short split & the per-year regime story — the decisive contrast with DT13
| cell | long n / WR / expR / netR | short n / WR / expR / netR |
|:--|:--|:--|
| CENTER (2.0,1.8,30) | 239 / 42.7% / **+0.104** / **+24.9R** | 225 / 39.6% / **+0.049** / **+11.1R** |
| BEST (2.5,2.2,40)   | 164 / 46.3% / **+0.289** / **+47.4R** | 161 / 41.6% / **+0.087** / **+14.0R** |

The long leg is the larger contributor (~69% of center netR), **but the short leg is genuinely positive**, not the dead coin-flip DT13's was (DT13 center short = **−0.006R**). The per-year decomposition at CENTER is the real headline:

| year | total netR | long netR (n) | short netR (n) | SOL regime |
|---:|---:|---:|---:|:--|
| 2020 (partial) | +1.5 | −3.1 (15) | +4.6 (18) | recovery |
| 2021 | −0.3 | +11.3 (69) | **−11.7 (51)** | parabolic bull → net flat |
| 2022 | **+12.5** | −5.8 (46) | **+18.3 (58)** | −90% bear → **short leg carries** |
| 2023 | +4.1 | +10.9 (52) | −6.8 (53) | recovery bull |
| 2024 | +18.3 | +11.6 (57) | +6.7 (45) | bull, both legs work |

This is **regime-adaptive**, not one-directional beta: the **short leg carried the 2022 collapse (+18.3R)** when the long leg lost (−5.8R), and the long leg carried the 2021/2023 up-legs. DT13 was "dip-buying a structurally bull asset" (long-only, dead short). DT14's short breakout **actually monetised the bear**, so **DT14 is materially less exposed to the SOL-beta trap** — its 2022 profit is the single strongest evidence it is a real breakout rather than a beta proxy. The residual concern remains that the *net* edge is long-tilted and every year's magnitude is small; a locked 2025+ OOS with legs split is still the deciding test.

### Exit mix (moving stop / target / time-stop) — the mechanism is real
| cell | stop (n / netR) | target (n / netR) | time-stop (n / netR) | eod |
|:--|:--|:--|:--|:--|
| CENTER (2.0,1.8,30) | 242 / **−233.3R** | 138 / **+244.4R** | 83 / **+25.2R** | 1 / −0.2R |
| BEST (2.5,2.2,40)   | 165 / **−157.4R** | 68 / **+158.1R** | 91 / **+60.9R** | 1 / −0.2R |
A clean three-way structure: **capped stops** (each bounded near −1R by the moving stop) bleed a controlled amount, **targets bank the ~+rr wins**, and **time-stops** flush the stragglers roughly flat-to-slightly-positive. At center 242 stops (−233R) are offset by 138 targets (+244R) + 83 time-stops (+25R) = **+36R total = 464 × +0.078R** ✓. At the BEST cell the longer `maxBars=40` shifts weight from stops to time-stops (91, +61R) — letting trades mature is where the extra expR comes from. The moving bracket is load-bearing and the structure is mechanically sound, not an artifact. Effectively 1 `eod` flush (one position open at the 2024-12-31 boundary).

## KILL CRITERIA (verbatim) & evaluation
> **DEAD unless center-region expR after costs > 0 AND ≥40 IS trades at center AND best-cell t ≥ 2.0.**

| gate | requirement | result | verdict |
|:--|:--|:--|:--:|
| 1 | center-region expR after costs > 0 | **+0.077R** (all 7 cells +) | ✅ PASS |
| 2 | ≥ 40 IS trades at center | **464** | ✅ PASS |
| 3 | best-cell t ≥ 2.0 | **2.45** | ✅ PASS |

All three met → **not DEAD → SURVIVES.** Honest framing: gate #1 passes but the center cell's *own* t is **1.36**; gate #3 passes comfortably (+0.45 over the line) but on a **best-of-27, extreme-corner** cell sitting on the `rr=2.2` grid edge. A real-but-thin edge that clears the letter of the gauntlet, aided by an adjacent-to-center significant cell (2.0,2.2,30) that DT13 lacked.

## C2 BENCHMARK COMPARISON
C2 reference (BTC daily): center **Sharpe 0.93 / MAR 0.96**; best-gated **Sharpe 1.44 / MAR 2.56**.

| build | asset/TF | exit | expR | PF | Sharpe | maxDD% | MAR |
|:--|:--|:--|--:|--:|--:|--:|--:|
| DT14 CENTER (2.0,1.8,30) | SOL 4h | moving bracket ±2.0·ATR, rr 1.8 | +0.078 | 1.15 | **0.66** | 13.3 | **0.59** |
| DT14 BEST (2.5,2.2,40)   | SOL 4h | moving bracket ±2.5·ATR, rr 2.2 | +0.189 | 1.38 | **1.25** | 12.3 | **1.19** |
| C2 center | BTC daily | — | — | — | 0.93 | — | 0.96 |
| C2 best-gated | BTC daily | — | — | — | 1.44 | — | 2.56 |

DT14 sits **below C2 on both bars**: its center Sharpe (0.66) trails C2's plain center (0.93), and its best cell (Sharpe 1.25 / MAR 1.19) falls short of C2's gated best (1.44 / 2.56). Its standout is **low drawdown** — ~12–13% at both center and best (the target leg + tight moving stop cap the tail), materially better DD than DT13 (22–27%). So DT14 is **lower-Sharpe but lower-DD** than DT13's center, and further from the C2 gated bar than either.

**vs DT13 (its SOL C-series cousin — center +0.077R / t 1.84, long-leg-driven):** DT14 center **+0.078R / t 1.36** — an **almost identical per-trade edge** to DT13, but a **weaker t** (1.36 vs 1.84) because DT14 runs **~⅓ the trade count** (464 vs 1,313) at **higher per-trade variance** (a real +rr target leg vs DT13's capped-stop/time-stop-only structure). The **same SOL-beta concern applies in principle** — but is **substantially milder in practice**: DT13's short leg was dead (−0.006R) making it a long-only beta proxy, whereas **DT14's short leg is +0.049R and counter-cyclical (carried 2022)**. DT14 trades DT13's brute-n significance for **regime symmetry and half the drawdown**.

## WORKED EXAMPLES (real timestamps, CENTER ledger `dt14_trades_center.csv`, hand-traced)

**1 — LONG target win (moving bracket, the profit engine).** Signal bar **2020-11-06 00:00 UTC** (idx 317): C **1.5361**, `atr`=0.06691. NR bar = idx 315 (`nr4[1]` = nr4@316 = True: rng[315]=0.1147 ≤ rng[314] and ≤ rng[313]). Trigger `close 1.5361 > high[1]=high@316 1.4217` ✓ ⇒ **LONG**. Fill next 1m open **2020-11-06 04:00** @ 1.5364 → entry_fill 1.5367 (+slip); `init_dist`=2.0·0.06691=**0.1338**, initial target `entryRef+1.8·2.0·atr` = 1.7770. ATR then *rose* (0.06691→0.07959 by the 12:00 close), so the **moving target drifted up** to **1.8226** for the **16:00** bar; that bar's 1m high hit **1.8847 ≥ 1.8226** → target fill @ 1.8226 (adverse slip) on **2020-11-06 16:00**, 3 bars held → net **+$212.9 → R +2.12**. The moving bracket in action: the target followed rising volatility and banked a bigger win than the static level would have.

**2 — SHORT stop loss (capped by the moving stop).** Signal bar **2020-09-17 00:00 UTC** (idx 17): O 2.5400 / H 2.7000 / L 2.4696 / **C 2.4836**, `atr`=0.27671. NR bar = idx 15 (`nr4[1]` = nr4@16 = True: rng[15]=0.1753 ≤ rng[14]=0.1870 and ≤ rng[13]=0.2405). Trigger `close 2.4836 < low[1]=low@16 2.4844` ✓ ⇒ **SHORT** @ fill 2.4831 (next open 04:00, −slip). `init_dist`=2.0·0.27671=**0.5534**, initial stop `entryRef+2·atr`=3.0370. SOL rallied into the short; the **moving stop tightened** as ATR fell, exiting @ **2.9797** on **2020-09-18 04:00** → net **−$90.3 → R −0.90** (loss *smaller* than 1R because the moving stop had drifted **inside** the initial distance — 0.496 vs 0.553). A textbook capped short loser: fading nothing here, this is the breakout that failed, and the moving stop bounded the damage below 1R.

*(Both re-derived directly from the resampled 4h OHLC + Wilder ATR + 1m intrabar path; every figure matches the ledger to printed precision, including the one-bar causal lag and the ATR-driven drift of both bracket levels.)*

## PROOFS
- **NR4 tautology confirmed at runtime**: `r1 <= r0[1]` evaluated True on **every** defined bar (`taut_ok=True`) — the third conjunct is vacuous exactly as read; the implemented signal == the Pine-as-written. Raw signal counts over the IS window: **760 long, 705 short** triggers (before the flat-only gate).
- **Deterministic ledger, two independent runs** (CENTER cell recomputed from a fresh full sim; CSV bytes md5'd):
  - run #1 md5 = `3b9372bbee8f7e8b8b1cc7d32772d0fb`
  - run #2 md5 = `3b9372bbee8f7e8b8b1cc7d32772d0fb`  → **equal ✅**
  - center file md5 = `3b9372bbee8f7e8b8b1cc7d32772d0fb` · best file md5 = `6c977b868ffb0d0750695b10c254f3c1` · grid csv md5 = `6bca693b148c3ccde5063978daf490b2`
- **`py_compile`**: `python3 -m py_compile backtests/bt_dt14_sol_nr4.py` → **exit 0, no output (clean)** ✅
- **Hard <2025 lockout**: 1m candles loaded = **2,260,380**, min **2020-09-14 07:00:00+00:00**, max **2024-12-31 23:59:00+00:00**; candles ≥ 2025-01-01 UTC loaded = **0**. 4h bars = **9,419** (min 2020-09-14 04:00, max 2024-12-31 20:00). IS ≈ **4.3y** (SOL's shorter history), warmup 14 ATR bars. Trades/year at center: 2020=33 (partial), 2021=120, 2022=104, 2023=105, 2024=102 — evenly distributed across bull *and* bear years, not a single-regime artifact. ✅
- **Author-claim reproduction** (independent sanity signal): center PF 1.149 vs claim 1.18, Sharpe 0.661 vs 0.67, maxDD 13.3% vs 10.7%, ~300 trades/2.9y — a faithful replication of the published build.

### Ledgers (next to this report)
- `dt14_grid.csv` — all 27 cells.
- `dt14_trades_center.csv` — CENTER (2.0, 1.8, 30), 464 trades.
- `dt14_trades_best.csv` — BEST-t (2.5, 2.2, 40), 325 trades.

**Bottom line.** DT14 **survives the three declared gates** and — unusually for this campaign — the author's PF ~1.18 / Sharpe ~0.67 claim **reproduces honestly** on the Pine-default cell, confirming a faithful spec (including the deliberately-preserved NR4→NR3 tautology bug). The breakout mechanism is genuine (capped moving stops + a real +rr target leg + reversion-flushing time-stops), 27/27 cells are positive, and **the short leg is alive and counter-cyclical — it monetised the 2022 SOL bear**, which is the strongest evidence DT14 is a real regime-adaptive breakout rather than the long-only SOL-beta proxy DT13 turned out to be. Against that: the edge is **thin** (center +0.078R, own t 1.36), all significance lives on the **`rr=2.2` grid edge** with the best cell at the **literal extreme corner**, and it sits **below C2** on risk-adjusted terms (though with notably lower DD, ~12–13%). The decisive next gate is the **locked 2025+ OOS on the `rr=2.2` region with the long/short legs reported separately**: if the short leg keeps working through a non-trending/bear stretch, DT14 graduates from "provisionally alive" to a validated breakout; if the whole edge collapses to the long leg, it rejoins DT13 as a dressed-up beta play. **Provisionally alive — the most regime-robust of the SOL C-series so far, but not yet validated.**
