✅ SURVIVES — clears all 3 declared kill-gates: **center-region expR = +0.087R (>0)**, **253 center trades (≥40)**, **best-cell t = 2.23 (≥2.0)**. And the significance is a *contiguous plateau*, not a lucky spike: the edge grows **monotonically** with the locked cycle length — every one of the 9 `centerPeriod=64` cells is negative, every `96` cell is marginally positive (max t 1.55), every `128` cell is positive with **t > 1.8** and **5/9 clear t ≥ 2.0** (PF 1.35–1.57, maxDD 5–9%). The mechanical reason DT12 lives where DT10/DT11 died is the one thing they lacked: a **hard bracket stop**. The same "ETH longs work, shorts get run over" reality is present, but the ±slPct stop converts the catastrophic short tail (DT11's −194R single trade) into a bounded, survivable drag — and at the longer `128`-bar (~5.3-day) cycle the lock filter picks clean enough swings that **both legs turn net-positive** (best cell: long +0.28R / short +0.28R). CAVEAT: the Pine's *own* default `centerPeriod=96` is only **marginal** (t 0.98, expR +0.08R, DD 18.5%) — survival requires lengthening the assumed cycle to 128. It survives as a *concept with a robust parameter region*, not at the shipped setting.

# DT12 "ETH PLL Cycle-Lock" — causal backtest of DaviddTech library strategy "PLL inv p96 lock1.2"

ETHUSDT **1h bars built from 1m OHLCV**, PLL state machine evolved **bar-by-bar from bar 0**, signals on **closed 1h bars**, fills at the **next 1m open**, hard **±slPct / ±tpPct brackets** (1m intrabar tie-break, ambiguous = loss). IS window **2019-11-27 → 2024-12-31** (44,681 1h bars from 2,680,815 pre-2025 1m candles), warmup `bar_index>300` before any entry. 2025+ locked out (loaded **0** candles ≥ 2025-01-01 UTC). Engine `backtests/bt_dt12_eth_pll.py`. Source of truth `Strategy Codex/DaviddTech/research/pine_ethsol/ETH_PLL_Conservative_ETH_1h_gauntlet.pine` (Pine v5, 61 lines, author "lozzy bot").

> **Author's claim (selection-only context — NOT evidence, NOT a target):** PF 1.46, Sharpe 0.99, +31%, DD 6.9%, 176 trades over 3.4y. A public TradingView library script; the quoted headline is the author's own promotional selection and carries zero evidential weight against a clean causal test. (Notably the claimed **DD 6.9% / 176 trades** matches this test's `128`-block much better than the `96` default — see grid.)

## SPEC — derived from the Pine (frozen; recursive state replicated bar-for-bar)

### Detrended, RMS-normalised oscillator (Pine lines 16–19)
- `trend  = ta.sma(close, 200)` (detrendLen=200).
- `osc    = nz(close − trend)` — `nz` → **0** during the 200-bar SMA warmup.
- `oscRms = sqrt( max( nz(ta.sma(osc·osc, 200)), 1e-10 ) )` — the **1e-10 floor is on the MEAN** (before sqrt), i.e. an effective floor of 1e-5 on `oscRms`. The `osc·osc` SMA sums the nz'd (0-during-warmup) squares, so the RMS is under-filled until bar ~398 — a warmup artifact reproduced **exactly** as the Pine computes it.
- `norm = osc / oscRms`. `warmedUp = bar_index > 205`.

### PLL recursive state (persistent `var`; evolves EVERY bar, Pine lines 21–46)
init `phase=0, freq=nomFreq, integrator=0, iLpf=0, qLpf=0`. Per bar, in **exact Pine order**:
```
cosRef = cos(phase) ; sinRef = sin(phase)
i_inst = warmedUp ?  norm·cosRef : 0        # 0 until bar_index>205
q_inst = warmedUp ? −norm·sinRef : 0
iLpf  += 0.15·(i_inst − iLpf)               # lpfAlpha=0.15
qLpf  += 0.15·(q_inst − qLpf)
denom  = sqrt(iLpf²+qLpf²) + iLpf
phaseErr = denom>1e-10 ? 2·atan(qLpf/denom) : (qLpf≥0 ? +π : −π)
integrator = warmedUp ? integrator + Ki·phaseErr : 0     # Ki = loopBW² = 0.0016
freqRaw    = nomFreq + Kp·phaseErr + integrator          # Kp = 1.4142·loopBW = 0.056568
freqClamped= clamp(freqRaw, 0.4·nomFreq, 2.0·nomFreq)
if freqClamped ≠ freqRaw:  integrator = freqClamped − nomFreq − Kp·phaseErr   # back-correction
freq  = freqClamped ; phase += freq ; wrap phase into [0, 2π)
lockQ = sqrt(iLpf²+qLpf²) / 0.7071
sinP  = sin(phase)                          # uses the UPDATED (post-advance) phase
```
`nomFreq = 2π/centerPeriod`. The hard-coded `var float freq=0.06544984695` (= 2π/96) is **never read before line 39 overwrites it**, so the grid's per-`centerPeriod` init is immaterial. During pre-warmup `iLpf=qLpf=0` exactly ⇒ `denom=0` ⇒ `phaseErr=+π` every bar ⇒ `freqRaw` clamps to `fMax` — the phase free-runs deterministically until warmup, replicated bar-for-bar.

### Signals & execution (Pine lines 47–61) — LONG **and** SHORT, brackets + zero-cross reversal
- `longSig  = crossover(sinP,0)  = sinP[i−1] ≤ 0 AND sinP[i] > 0`
- `shortSig = crossunder(sinP,0) = sinP[i−1] ≥ 0 AND sinP[i] < 0`
- `locked = lockQ > lockThresh`; `ready = warmedUp AND bar_index > 300`.
- Per-bar order (Pine 52–59): an **opposite** zero-cross **always closes** the current position (lines 52–55, *no* ready/locked check — even unlocked); an entry opens **only when `ready AND locked`** (lines 56–59). When both fire on one bar this is a **reversal** = close + open at the same next-open fill.
- **BRACKETS** (Pine 60–61, `strategy.exit` both sides, live from entry, OCO):
  - long : `stop = entry·(1−slPct/100)`, `target = entry·(1+tpPct/100)`
  - short: `stop = entry·(1+slPct/100)`, `target = entry·(1−tpPct/100)`
  - fire on **any** bar from entry onward (incl. the entry bar). When a single 1h bar's range spans **both** stop and target, the 1m candles inside the hour disambiguate fill order; earliest 1m touching both, or unresolved ⇒ booked a **LOSS (stop)**. Intrabar bracket (before the close) **takes priority** over the close-based zero-cross on the same bar.

### Fills / timing (causal — overrides Pine `process_orders_on_close` for honesty)
Signals on **closed 1h bars only**; every market fill (entry / zero-cross exit / reversal) = the 1h `open` of bar `i+1`. A 1h bar's open **is** its first 1m open, so "next 1m open after the close" == `o1h[i+1]` — no look-ahead. Bracket fills are **at the level** with adverse slippage.

### Sizing (declared) — FLAT 1%-equity risk vs the slPct stop distance
```
risk      = EQ0 · 1% = $100   (FLAT, non-compounding — "flat 1%-equity risk")
risk_dist = entry_ref · slPct/100     (= |entry − stop|)
size      = risk / risk_dist ;  R = net_pnl / risk
```
Unlike DT10/DT11 there **is** a real stop distance, so R is denominated against the actual protective stop (not a proxy). Equity is flat/additive; per-trade R is size-normalised.

### Execution conventions (reused from `bt_engine.py` / DT10–DT11 scaffolding)
Fees **0.05%/side**, slippage **0.02%/fill**, **$10k** start. long: `entry=ref·(1+slip)`, `exit=ref·(1−slip)`; short mirrored. 1h **mark-to-market** equity curve (long+short aware, idle bars included) → Sharpe ×√(24·365) & maxDD%; per-trade R drives expR / PF / t / maxDD_R. **Ambiguous intrabar bracket = LOSS**, 1m tie-break. Deterministic (no RNG / wall-clock, sorted output) — two runs byte-identical (md5s below).

## DECLARED GRID (fixed BEFORE any result) — exactly 27 cells, no additions
```
centerPeriod ∈ {64, 96, 128}
lockThresh   ∈ {1.0, 1.2, 1.4}
(slPct,tpPct)∈ {(3,9), (4,12), (5,15)}          # 3 × 3 × 3 = 27
CENTER = (96, 1.2, (4,12))  = Pine defaults
CENTER-REGION = center + one grid step on each axis (7 cells):
  (96,1.2,4/12)· (64,1.2,4/12) (128,1.2,4/12) · (96,1.0,4/12) (96,1.4,4/12) · (96,1.2,3/9) (96,1.2,5/15)
```

## 27-CELL GRID (IS, after costs) — expR, trades, PF, Sharpe, maxDD%, t
`maxDD%` = mark-to-market equity drawdown; `t` = per-trade R t-stat (ddof=1). **Bold** = t ≥ 2.0.

| centerPeriod | lock | sl/tp | trades | WR% | expR | PF | Sharpe | maxDD% | t |
|---:|---:|:---:|---:|---:|---:|---:|---:|---:|---:|
| 64 | 1.0 | 3/9  | 458 | 35.4 | −0.106 | 0.81 | −0.78 | 50.2 | −1.82 |
| 64 | 1.0 | 4/12 | 458 | 39.7 | −0.048 | 0.90 | −0.37 | 27.4 | −0.92 |
| 64 | 1.0 | 5/15 | 458 | 41.0 | −0.054 | 0.86 | −0.52 | 27.4 | −1.19 |
| 64 | 1.2 | 3/9  | 368 | 36.1 | −0.093 | 0.83 | −0.59 | 37.1 | −1.44 |
| 64 | 1.2 | 4/12 | 368 | 40.2 | −0.039 | 0.91 | −0.24 | 20.5 | −0.66 |
| 64 | 1.2 | 5/15 | 368 | 41.3 | −0.053 | 0.87 | −0.43 | 22.0 | −1.03 |
| 64 | 1.4 | 3/9  | 293 | 35.8 | −0.130 | 0.77 | −0.73 | 39.6 | −1.83 |
| 64 | 1.4 | 4/12 | 293 | 39.6 | −0.059 | 0.87 | −0.35 | 22.3 | −0.91 |
| 64 | 1.4 | 5/15 | 293 | 41.0 | −0.074 | 0.82 | −0.53 | 21.8 | −1.29 |
| 96 | 1.0 | 3/9  | 304 | 38.5 | +0.064 | 1.11 | +0.39 | 21.3 | +0.76 |
| 96 | 1.0 | 4/12 | 304 | 41.1 | +0.064 | 1.13 | +0.44 | 17.5 | +0.84 |
| 96 | 1.0 | 5/15 | 304 | 43.4 | +0.077 | 1.19 | +0.59 | 12.0 | +1.12 |
| 96 | 1.2 | 3/9  | 253 | 38.3 | +0.082 | 1.14 | +0.41 | 22.6 | +0.87 |
| **96** | **1.2** | **4/12 (CENTER)** | **253** | **41.1** | **+0.081** | **1.17** | **+0.48** | **18.5** | **+0.98** |
| 96 | 1.2 | 5/15 | 253 | 43.5 | +0.084 | 1.20 | +0.56 | 11.6 | +1.12 |
| 96 | 1.4 | 3/9  | 211 | 37.4 | +0.073 | 1.13 | +0.34 | 22.8 | +0.71 |
| 96 | 1.4 | 4/12 | 211 | 40.3 | +0.103 | 1.22 | +0.53 | 19.0 | +1.11 |
| 96 | 1.4 | 5/15 | 211 | 43.6 | +0.130 | 1.33 | +0.76 | 11.8 | +1.55 |
| 128 | 1.0 | 3/9  | 220 | 39.5 | +0.204 | 1.35 | +1.01 | 9.1 | +1.86 |
| 128 | 1.0 | 4/12 | 220 | 40.9 | +0.186 | 1.36 | +0.98 | 7.0 | +1.82 |
| 128 | 1.0 | 5/15 | 220 | 43.2 | +0.166 | 1.38 | +0.97 | 5.4 | +1.85 |
| **128** | **1.2** | **3/9**  | **189** | **41.8** | **+0.260** | **1.46** | **+1.17** | **6.2** | **+2.17** |
| **128** | **1.2** | **4/12** | **189** | **43.4** | **+0.231** | **1.46** | **+1.10** | **7.2** | **+2.09** |
| 128 | 1.2 | 5/15 | 189 | 45.5 | +0.192 | 1.44 | +1.02 | 5.5 | +1.97 |
| **128** | **1.4** | **3/9**  | **151** | **41.7** | **+0.283** | **1.50** | **+1.10** | **6.1** | **+2.09** |
| **128** | **1.4** | **4/12 (BEST-t)** | **151** | **43.7** | **+0.281** | **1.57** | **+1.16** | **6.6** | **+2.23** |
| **128** | **1.4** | **5/15** | **151** | **45.7** | **+0.240** | **1.56** | **+1.11** | **5.5** | **+2.15** |

**18/27 cells positive-expectancy; the sign is set almost entirely by `centerPeriod`:** cp64 = 9/9 negative, cp96 = 9/9 marginally positive (max t 1.55), cp128 = 9/9 positive with t > 1.8 and 5/9 at t ≥ 2.0. Longer assumed cycle → cleaner locks → stronger, lower-DD edge, monotonically.

## 5-BAR HAND-CHECK — primary engine vs INDEPENDENT slow-loop recompute
Two independent implementations of the recursive PLL (the primary numpy-scalar engine vs a from-scratch pure-`math` slow loop with its own SMA/osc/RMS recompute and its own variable layout), bars 350–354 (centerPeriod=96, deep in the active region). **Max abs diff = 1.465e-14 ≤ 1e-9.** ✅

| bar | time (UTC) | phase (eng / slow) | freq | I=iLpf | Q=qLpf | lockQ | Δmax |
|---:|:---|:---|:---|:---|:---|:---|---:|
| 350 | 2019-12-11 21:00 | 4.280335059576 / …576 | 0.026179938780 | 1.209901751120 | −1.867961743125 | 3.147455583246 | 1.35e-14 |
| 351 | 2019-12-11 22:00 | 4.306514998356 / …356 | 0.026179938780 | 1.177871096134 | −1.911887181352 | 3.175780103859 | 1.13e-14 |
| 352 | 2019-12-11 23:00 | 4.332694937136 / …136 | 0.026179938780 | 1.129385192885 | −1.923415633539 | 3.154404551201 | 1.15e-14 |
| 353 | 2019-12-12 00:00 | 4.358874875916 / …916 | 0.026179938780 | 1.124305964255 | −2.046694433854 | 3.302461687225 | 1.27e-14 |
| 354 | 2019-12-12 01:00 | 4.385054814696 / …696 | 0.026179938780 | 1.137107291673 | −2.231395876815 | 3.541824629709 | 1.47e-14 |

(freq pinned at `fMin = 0.4·2π/96 = 0.02617993878` — the loop is clamping to its minimum here, i.e. holding a long lock; the two engines agree to ~1e-14 through 350 recursive bars of that clamp.)

## CENTER-REGION ANALYSIS
Center-region (7 cells) expR values: **[+0.081, −0.039, +0.231, +0.064, +0.103, +0.082, +0.084]** → **mean +0.087R > 0** (kill-gate #1 PASS). Six of seven positive; the one negative is the `centerPeriod=64` neighbor — the axis that kills the edge. Along the two axes the Pine leaves at their default value (lockThresh, sl/tp), the region is uniformly positive; the only sign change is stepping cycle length **down** to 64.

### Best cell + multiplicity caveat
**Best-t = (128, 1.4, (4,12))**: n=151, WR 43.7%, expR **+0.281R**, PF **1.57**, Sharpe **1.16**, t **2.23**, maxDD **6.6%**, totRet **+42.4%**, CAGR **+7.2%**, MAR **1.09**. Best-of-27 selection **would** normally demand a heavy multiplicity discount — but here the significance is **not an isolated spike**: **5 mutually-adjacent cells** (128 × {1.2,1.4} × {3/9,4/12,5/15}) all clear t ≥ 2.0, and the *entire* 9-cell cp128 block is positive at t > 1.8. A contiguous significant plateau spanning two full parameter axes is structural, not a lucky draw; the multiplicity concern is materially reduced (though the *point* t=2.23 should still be read as "≈ the ≥2.0 bar", not "comfortably above" it).

### Long/short split (CENTER 96 vs BEST 128)
| cell | long n / expR / netR | short n / expR / netR |
|:--|:--|:--|
| CENTER (96,1.2,4/12) | 130 / **+0.177** / +23.0R | 123 / **−0.020** / −2.4R |
| BEST (128,1.4,4/12)  | 73 / **+0.282** / +20.6R | 78 / **+0.279** / +21.8R |
At the Pine default the long leg carries the whole result and the short leg is a mild net drag (the familiar ETH-bull short problem — but **bounded** by the stop, unlike DT11's −194R blow-up). At the 128-bar cycle **both legs are positive and balanced** — the longer lock captures genuine down-swings, not just noise.

### Exit mix (bracket stop / target vs zero-cross)
| cell | brk_stop | brk_tp | zerocross | eod |
|:--|:--|:--|:--|:--|
| CENTER (96) | 106 trades / **−109.7R** | 29 / **+86.0R** | 118 / **+44.3R** | 0 |
| BEST (128)  | 65 / −67.3R | 30 / **+89.0R** | 56 / +20.7R | 0 |
The engine is **many small capped stops + fewer larger targets + trend-riding zero-cross exits**. At center the zero-cross exits (letting a locked trend run until the cycle flips) are the true profit engine (+44R); the +tpPct target is hit only 29× but pays +86R; stops bleed −110R but each is bounded to ~1R. Net +20.6R = 253 × +0.081R. ✓ The **hard stop is load-bearing** — it is exactly the risk cap DT10/DT11 lacked.

## KILL CRITERIA (verbatim) & evaluation
> **DEAD unless center-region expR after costs > 0 AND ≥40 IS trades at center AND best-cell t ≥ 2.0.**

| gate | requirement | result | verdict |
|:--|:--|:--|:--:|
| 1 | center-region expR after costs > 0 | **+0.087R** | ✅ PASS |
| 2 | ≥ 40 IS trades at center | **253** | ✅ PASS |
| 3 | best-cell t ≥ 2.0 | **2.23** | ✅ PASS |

All three met → **not DEAD → SURVIVES.** (Honest framing: gate #3 clears by 0.23 and gate #1 by +0.087R — this is a *pass*, not a rout; see caveats above and the C2 gap below.)

## C2 benchmark comparison
C2 reference (BTC daily): center **Sharpe 0.93 / MAR 0.96**; best-gated **Sharpe 1.44 / MAR 2.56**.

| build | asset/TF | stop | expR | PF | Sharpe | maxDD% | MAR |
|:--|:--|:--|--:|--:|--:|--:|--:|
| DT12 CENTER (96,1.2,4/12) | ETH 1h | ±4/12% brk | +0.081 | 1.17 | **0.48** | 18.5 | **0.20** |
| DT12 BEST (128,1.4,4/12)  | ETH 1h | ±4/12% brk | +0.281 | 1.57 | **1.16** | 6.6 | **1.09** |
| C2 center | BTC daily | — | — | — | 0.93 | — | 0.96 |
| C2 best-gated | BTC daily | — | — | — | 1.44 | — | 2.56 |

DT12's **center trails C2's plain center** (Sharpe 0.48 vs 0.93, MAR 0.20 vs 0.96) — at the shipped parameter it is a weak system. But DT12's **128-region best beats C2's plain center** on both axes (Sharpe 1.16 vs 0.93; MAR 1.09 vs 0.96) while still falling **short of C2's best-gated** (1.44 / 2.56). So DT12 lands *between* C2's two benchmarks — a real, positive, low-DD edge, materially better than DT10 (MAR 0.65, DD 45.6%) and DT11 (account destroyed), but not best-in-class. Note the per-bar Sharpe here **includes idle flat bars** (DT12 is not always-in-market), which deflates it vs an always-in benchmark — the trade-level quality (PF 1.57, WR 43.7%, DD 6.6%) is the fairer read.

## WORKED EXAMPLES (real timestamps, CENTER ledger `dt12_trades_center.csv`)
**1 — bracket-TARGET win (short).** Signal bar 2019-12-16 15:00 UTC: `sinP` crosses **down** through 0 (+0.001684 → −0.043051), `lockQ` 1.638 > 1.2 (locked) and ready ⇒ short. Fill next 1m open 2019-12-16 16:00 @ 140.892; stop 146.557 / target 124.010. Price falls; target touched, exit @ 124.034 on 2019-12-17 19:00 (27 bars). net **+$296.71 → R +2.97**.

**2 — bracket-STOP loss (short).** Signal bar 2020-01-05 03:00 UTC: `sinP` −cross (+0.000451 → −0.025726), `lockQ` 1.837 (locked) ⇒ short @ 136.073 (fill 2020-01-05 04:00), stop 141.544. ETH rallies; stop touched, exit @ 141.572 on 2020-01-06 10:00 (30 bars). net **−$103.57 → R −1.04**. A textbook capped loser — the exact tail DT11 left uncapped.

**3 — zero-cross trend-capture (long, the profit engine).** Signal 2024-09-19 14:00 UTC: `sinP` +cross, `lockQ` 1.506 (locked) ⇒ long @ 2425.05 (fill 15:00). Neither bracket is hit for 98 bars; the position is closed only when the cycle flips (opposite `shortSig` zero-cross) on 2024-09-23 17:00 @ 2662.27. net **R +2.41** — a +9.8% swing ridden by the lock, not the target.

## PROOFS
- **Deterministic ledger, two independent runs** (center cell recomputed from a fresh PLL pass + fresh cell sim):
  - run #1 md5 = `a6941bb4d966fb6de2fb75e80da55662`
  - run #2 md5 = `a6941bb4d966fb6de2fb75e80da55662`  → **equal ✅**
  - grid csv md5 = `5748cfc77cf87d18f6ac853f40afa2fe` · best ledger md5 = `24912d07e1636620cf3dd49288ee7db6`
- **`py_compile`**: `python3 -m py_compile backtests/bt_dt12_eth_pll.py` → exit 0, no output (clean). ✅
- **Hard <2025 lockout**: 1m candles loaded = **2,680,815**, min **2019-11-27 07:45:00+00:00**, max **2024-12-31 23:59:00+00:00**; candles ≥ 2025-01-01 UTC loaded = **0**. 1h bars = **44,681** (min 2019-11-27 07:00, max 2024-12-31 23:00). ✅
- **Hand-check**: engine vs independent slow-loop max abs diff over 5 bars = **1.465e-14 ≤ 1e-9**. ✅

### Ledgers (next to this report)
- `dt12_grid.csv` — all 27 cells.
- `dt12_trades_center.csv` — CENTER (96,1.2,4/12), 253 trades.
- `dt12_trades_best.csv` — BEST-t (128,1.4,4/12), 151 trades.

**Bottom line.** DT12 is the **first DaviddTech ETH strategy to survive the gauntlet** — and it survives for a diagnosable reason: the PLL provides a genuine (if modest) cycle-timing edge on ETH 1h, and unlike DT10/DT11 it is wrapped in a **hard bracket stop** that caps the short-side tail into a bounded cost. The catch worth flagging to any forward test: the edge is **real only at a longer cycle (`centerPeriod` 128, not the shipped 96)**, and even the best cell sits *at* — not comfortably above — the t ≥ 2.0 bar. A locked 2025+ OOS confirmation on the 128-region (never yet run) is the decisive next gate before any capital.
