❌ DEAD — fails 2 of 3 kill-gates: center-region expR = **−2.72R** (0 of 7 cells positive) and best-cell t = **−0.87** (< 2.0). Every one of the 27 declared cells has **negative expectancy** (max expR = −1.13R) and **every cell blows the account** (mark-to-market drawdown 102–212%, compounded equity goes negative). Diagnosis: the Pine is a **stop-and-reverse, always-in-market** system with **no hard stop**; its long leg has a modest real edge (center +1.37R) but its forced short leg gets run over during ETH bull trends (center −8.22R; one short held **138 days** for **−194R**, ~2× account equity). High win rate (61%) masks catastrophic negative skew (PF 0.46). Not investable in any tested configuration.

# DT11 "ETH EWO+RSI Exhaustion" — causal backtest of DaviddTech library strategy

ETHUSDT **4h bars built from 1m OHLCV**, signals on **closed 4h bars**, fills at the **next 1m open**. IS window **2019-11-27 → 2024-12-31** (11,171 4h bars from 2,680,815 pre-2025 1m candles), minus a 40-bar warmup. 2025+ locked out (loaded **0** candles ≥ 2025-01-01 UTC). Engine `backtests/bt_dt11_eth_ewo.py`. Source of truth `Strategy Codex/DaviddTech/research/pine_ethsol/ETH_EWO_RSI_advanced_Signals_Strategy_Ex.pine` (Pine v6, 124 lines, © Pridarasx).

> **Author's claim (selection-only context — NOT evidence, NOT a target):** PF 1.89, Sharpe 1.03, +103%, DD 13.9%, 147 trades over 5.3y. A public TradingView library script; the quoted headline is the author's own promotional selection and carries zero evidential weight against a clean causal test.

## SPEC — derived from the Pine (frozen; ambiguities resolved most-literal, each declared)

### Indicators (all on the 4h series)
- `hl2 = (high+low)/2`, `hlc3 = (high+low+close)/3`.
- **EWO** = `ta.sma(hl2, 5) − ta.sma(hl2, 34)` (EWO_FAST / EWO_SLOW fixed 5 / 34).
- **RSI** = `ta.rsi(close, rsi_len)` (Wilder RMA).
- **MFI** = `ta.mfi(hlc3, 14)` (Pine money-flow: rolling 14-bar sum of positive vs negative `hlc3·volume`, split by the sign of `Δhlc3`; MFI_LEN fixed 14).
- **vol_ma** = `ta.sma(volume, 20)`; **vol_ok** = `volume > vol_ma·0.8` (VOL_MA_LEN fixed 20).
- **ATR14** = `ta.atr(14)` (Wilder) — used **only** as the risk unit (see below), never as a stop.

### Exhaustion / breakout state (Pine lines 41–49, 65–67)
- `var bool oversold_zone = false`. Each bar: **if `rsi < rsi_oversold` → set TRUE**. It is a persistent latch — once RSI dips below the threshold it **stays** true until reset. **Reset to FALSE on any bar where `raw_buy` fires** (line 66–67). Meaning: *"RSI has visited deep-oversold at some point since the last long entry."*
  - *Resolution (literal):* the latch is `var` (persists across bars) and is set from the **current** bar's RSI before `raw_buy` is evaluated. Since `raw_buy` needs RSI crossing **up** through 40 while the latch needs RSI **< rsi_oversold (≤35)**, the two never coincide on one bar — so at a buy the latch reflects a *prior* oversold visit. Implemented exactly so.
- `breakout_barrier = ta.highest(high, lookback_len)[1]` = `max(high[i−1], …, high[i−lookback_len])` — the highest high of the prior `lookback_len` bars, **excluding the current bar** (the `[1]` offset). Fully causal.
- `price_breaking_out = close > breakout_barrier`.

### Signal logic (Pine lines 51–63)
- `raw_buy  = ta.crossover(rsi,40) AND mfi>30 AND ewo>ewo[1] AND vol_ok AND (price_breaking_out OR oversold_zone)`
- `raw_sell = ta.crossunder(rsi,60) AND mfi<70 AND ewo<ewo[1] AND vol_ok`
- `ta.crossover(rsi,40)` = `rsi[i−1] ≤ 40 AND rsi[i] > 40`; `ta.crossunder(rsi,60)` = `rsi[i−1] ≥ 60 AND rsi[i] < 60`.
- **`pre_buy` / `pre_sell` (lines 54, 60) and every `alert()` call are ALERT-ONLY** (cosmetic labels/notifications) and place **no orders** → excluded from the backtest by design. *Resolution declared:* only `strategy.entry` calls (lines 85, 88) move the position.

### Signal-frequency latch (Pine lines 69–81)
- `var int last_signal = 0`. `buy_signal = raw_buy AND last_signal≠1` (then `last_signal:=1`); `sell_signal = raw_sell AND last_signal≠−1` (then `last_signal:=−1`). Because a buy needs RSI crossing **up** through 40 and a sell needs RSI crossing **down** through 60 (never both on one bar), executed entries **strictly alternate** Long, Short, Long, Short…

### Execution (Pine lines 83–88) — STOP-AND-REVERSE, ALWAYS-IN-MARKET
- `if buy_signal: strategy.entry("Long", strategy.long)`; `if sell_signal: strategy.entry("Short", strategy.short)`.
- `strategy.entry` with `pyramiding=0` **reverses** when in the opposite position. With the alternating latch, the first signal opens a position and **every subsequent (opposite) signal reverses it**. After the first entry the model is **continuously long-or-short**; a "trade" runs from one entry to the next opposite entry — the reversal is simultaneously the exit of the old trade and the entry of the new one at the same next-open fill. The final open position is closed at the last 4h close (`eod`, honest).
- **NO hard stop / NO take-profit / NO `strategy.exit` exists in the Pine.** ⇒ **EXIT-SIGNAL-ONLY.** A loser runs until the opposite reversal fires, however far price travels. **maxDD is reported honestly on the mark-to-market curve; there is no protective stop.** Stated up front.

### Fills / timing
- Signals on **closed 4h bars only**; entry/exit fill = the 4h `open` of bar `i+1`. A 4h bar's open is by construction its first 1m open, so "next 1m open after the close" **is** `o4h[i+1]` — causal, no look-ahead. Pine default `process_orders_on_close=false` fills at next-bar open, matching.

### Risk-unit definition (declared — there is no stop distance to size against)
The Pine's default sizing is fixed-fraction. The task standardizes to the project's **1%-equity-risk** convention using a **declared proxy** risk unit, because no stop exists:
```
risk_dist = ATR14 at the SIGNAL bar i (last closed 4h bar before the fill)   # "1× ATR14 at entry"
size      = (equity × 1%) / ATR14[i]
R         = net_pnl / (equity × 1%)          (= net / initial risk)
```
ATR14 is **NOT a stop** — nothing exits at ±1 ATR — it is only the *unit* in which R is denominated so R is well-defined for an exit-signal-only system. Equity compounds sequentially; per-trade R is equity-independent (the fee/risk term cancels equity), so **expR / PF / t-stat are identical flat vs compounding** — only the $ curve (Sharpe, maxDD%, totRet) compounds.

### Execution conventions (reused from `backtests/bt_engine.py` / DT1–DT10 scaffolding)
- Fees **0.05%/side**, slippage **0.02%/fill**, **$10k** start, compounding 1%-risk.
- long: `entry_fill=open·(1+slip)`, `exit_fill=open·(1−slip)`; short: `entry_fill=open·(1−slip)`, `exit_fill=open·(1+slip)`.
- **Ambiguous fills = losses:** N/A beyond the honest next-open fill — exits are reversal-signal-only, so there is no intrabar stop-vs-TP contest to tie-break.
- 4h **mark-to-market** total-equity curve (unrealized P&L marked each 4h close, long+short aware) → Sharpe (×√(6·365)) and maxDD%; per-trade R drives expR / PF / t-stat / maxDD_R. MAR = CAGR / maxDD%.
- Deterministic: no RNG, no wall-clock, sorted output — two runs byte-identical (md5s below).

## DECLARED GRID (fixed BEFORE any result) — all 27 cells run, no additions
```
rsi_oversold in {25, 30, 35}      (Exhaustion RSI Level)
lookback_len in {5, 10, 15}       (Breakout Lookback Bars)
rsi_len      in {10, 14, 18}      (RSI Length)
=> 3 × 3 × 3 = 27 cells.  Center = Pine defaults (rsi_oversold=30, lookback_len=10, rsi_len=14).
EWO lengths fixed 5/34 ; MFI 14 ; vol_ma 20 ; ATR 14 — held constant across all cells.
```

## Full grid — every declared cell (after costs)

`expR` = mean per-trade R; `PF` from R; `Sharpe`/`maxDD%` = 4h mark-to-market annualized; `maxDD_R` = cumulative-R drawdown; `t` = per-trade t-stat (mean R / (σ/√n)); `totRet%` = compounding $10k curve; `MAR` = CAGR/maxDD% ("—" where CAGR undefined because the compounded account went ≤ 0).

| os | lb | rl | n | WR% | expR | PF | Sharpe | maxDD_R | maxDD% | t | totRet% | MAR |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 25 | 5 | 10 | 101 | 62.4 | −2.478 | 0.518 | 0.386 | 318.8 | 143.5 | −1.112 | −120.3 | — |
| 25 | 5 | 14 | 63 | 55.6 | −3.909 | 0.428 | 0.350 | 284.7 | 206.1 | −1.157 | −135.2 | — |
| 25 | 5 | 18 | 47 | 61.7 | −5.486 | 0.346 | 0.321 | 309.4 | 133.9 | −1.194 | −118.0 | — |
| 25 | 10 | 10 | 97 | 63.9 | −2.487 | 0.524 | 0.395 | 313.3 | 143.0 | −1.075 | −122.5 | — |
| 25 | 10 | 14 | 55 | 56.4 | −4.315 | 0.401 | 0.382 | 275.8 | 212.3 | −1.144 | −144.9 | — |
| 25 | 10 | 18 | 41 | 61.0 | −6.165 | 0.349 | 0.321 | 317.5 | 133.9 | −1.169 | −118.8 | — |
| 25 | 15 | 10 | 97 | 63.9 | −2.487 | 0.524 | 0.395 | 313.3 | 143.0 | −1.075 | −122.5 | — |
| 25 | 15 | 14 | 55 | 56.4 | −4.315 | 0.401 | 0.382 | 275.8 | 212.3 | −1.144 | −144.9 | — |
| 25 | 15 | 18 | 39 | 59.0 | −6.657 | 0.330 | 0.321 | 316.8 | 133.9 | −1.202 | −117.6 | — |
| 30 | 5 | 10 | 105 | 62.9 | −1.158 | 0.698 | 0.637 | 190.2 | 102.2 | −0.895 | −93.8 | −0.413 |
| 30 | 5 | 14 | 77 | 58.4 | −3.360 | 0.456 | 0.325 | 297.1 | 199.5 | −1.196 | −128.0 | — |
| 30 | 5 | 18 | 63 | 63.5 | −1.650 | 0.636 | 0.656 | 164.5 | 105.1 | −0.970 | −86.1 | −0.307 |
| **30** | **10** | **14** | **75** | **61.3** | **−3.363** | **0.459** | **0.341** | **290.6** | **199.5** | **−1.173** | **−131.1** | **—** | ← center
| 30 | 10 | 10 | 105 | 62.9 | −1.127 | 0.705 | 0.638 | 186.9 | 102.1 | **−0.869** | −93.6 | −0.409 | ← best t
| 30 | 10 | 18 | 61 | 63.9 | −1.687 | 0.639 | 0.656 | 163.4 | 105.1 | −0.957 | −86.0 | −0.306 |
| 30 | 15 | 10 | 105 | 62.9 | −1.127 | 0.705 | 0.638 | 186.9 | 102.1 | −0.869 | −93.6 | −0.409 |
| 30 | 15 | 14 | 75 | 61.3 | −3.363 | 0.459 | 0.341 | 290.6 | 199.5 | −1.173 | −131.1 | — |
| 30 | 15 | 18 | 61 | 63.9 | −1.687 | 0.639 | 0.656 | 163.4 | 105.1 | −0.957 | −86.0 | −0.306 |
| 35 | 5 | 10 | 107 | 62.6 | −1.145 | 0.699 | 0.636 | 192.7 | 102.2 | −0.897 | −93.9 | −0.415 |
| 35 | 5 | 14 | 79 | 58.2 | −1.800 | 0.609 | 0.635 | 180.6 | 104.7 | −1.175 | −92.3 | −0.379 |
| 35 | 5 | 18 | 67 | 62.7 | −1.620 | 0.630 | 0.654 | 167.4 | 105.0 | −1.015 | −86.7 | −0.312 |
| 35 | 10 | 10 | 107 | 62.6 | −1.145 | 0.699 | 0.636 | 192.7 | 102.2 | −0.897 | −93.9 | −0.415 |
| 35 | 10 | 14 | 79 | 58.2 | −1.800 | 0.609 | 0.635 | 180.6 | 104.7 | −1.175 | −92.3 | −0.379 |
| 35 | 10 | 18 | 67 | 64.2 | −1.434 | 0.671 | 0.659 | 155.0 | 105.0 | −0.893 | −85.0 | −0.297 |
| 35 | 15 | 10 | 107 | 62.6 | −1.145 | 0.699 | 0.636 | 192.7 | 102.2 | −0.897 | −93.9 | −0.415 |
| 35 | 15 | 14 | 79 | 58.2 | −1.800 | 0.609 | 0.635 | 180.6 | 104.7 | −1.175 | −92.3 | −0.379 |
| 35 | 15 | 18 | 67 | 64.2 | −1.434 | 0.671 | 0.659 | 155.0 | 105.0 | −0.893 | −85.0 | −0.297 |

**Surface summary: 0/27 cells expR > 0 (max = −1.127R, min = −6.657R). 0/27 cells t ≥ 2.0 — every t-stat is NEGATIVE (max −0.869, min −1.202). Every cell's compounded account is destroyed: maxDD% 102.1–212.3, totRet% −85 to −145 (i.e. equity crosses zero).** This is not a marginal or insignificant edge — it is a **consistently losing** system across the entire declared parameter box. Full CSV: `dt11_grid.csv`.

*Note — lookback is nearly inert:* rows for `lb=10` and `lb=15` are byte-identical at every `(os,rl)` (e.g. 30/10/14 ≡ 30/15/14), and `lb=5` barely differs. The breakout barrier almost never binds because the `(price_breaking_out OR oversold_zone)` clause is satisfied by the persistent `oversold_zone` latch long before the barrier matters — so one of the strategy's two headline "exhaustion" filters does essentially nothing on ETH 4h.

## Center-region analysis (default cell + axis-adjacent neighbours)

| cell (os/lb/rl) | n | WR% | expR | PF | Sharpe | t | maxDD% |
|---|---|---|---|---|---|---|---|
| **30/10/14 (center)** | **75** | **61.3** | **−3.363** | **0.459** | **0.341** | **−1.173** | **199.5** |
| 25/10/14 | 55 | 56.4 | −4.315 | 0.401 | 0.382 | −1.144 | 212.3 |
| 35/10/14 | 79 | 58.2 | −1.800 | 0.609 | 0.635 | −1.175 | 104.7 |
| 30/5/14 | 77 | 58.4 | −3.360 | 0.456 | 0.325 | −1.196 | 199.5 |
| 30/15/14 | 75 | 61.3 | −3.363 | 0.459 | 0.341 | −1.173 | 199.5 |
| 30/10/10 | 105 | 62.9 | −1.127 | 0.705 | 0.638 | −0.869 | 102.1 |
| 30/10/18 | 61 | 63.9 | −1.687 | 0.639 | 0.656 | −0.957 | 105.1 |

**Region mean expR = −2.72R; 0 of 7 cells positive (all range −1.13R to −4.32R); mean t = −1.10; every cell drawdown 102–212%.** The neighbourhood is uniformly and deeply negative — there is no "sweet spot" hiding adjacent to the defaults. The best neighbours (30/10/10, expR −1.13R) merely lose *less*.

### Long/short split at center (30/10/14) — the mechanism of failure

| leg | n | WR% | expR | net R |
|---|---|---|---|---|
| **Long** | 38 | 68.4 | **+1.367** | **+51.96** |
| **Short** | 37 | 54.1 | **−8.220** | **−304.15** |

The **long leg has a genuine modest edge** (+1.37R, 68% WR) — consistent with DT10's finding that trend-long works on ETH. The **short leg is a catastrophe** (−8.22R): the stop-and-reverse design *forces* the model to hold a short at all times it is not long, with **no stop**, straight into ETH's largest bull impulses. A single short (Oct 2020 → Feb 2021, held **138 days**) lost **−194R** — ~2× the entire account equity — and dwarfs the entire long-leg profit. The high 61% overall win rate is textbook **negative skew**: many small correct calls, rare account-ending losers (PF 0.46).

## Best cell & multiplicity caveat

- **Best by t-stat (max over all 27): 30 / 10 / 10** — n=105, expR **−1.13R**, PF 0.705, Sharpe 0.638, **t = −0.869**, maxDD **102.1%**, MAR −0.41. Its own split: long +1.52R (n=53), short −3.82R (n=52) — same broken structure, softened only by RSI(10) shortening holds.
- Best by expR is the *same* cell (−1.127R). There is no metric under which any cell is profitable.
- **Multiplicity:** with 27 cells searched, the *maximum* t is still **−0.87** — negative. A null-edge surface scatters t around 0; here the entire surface sits **below** zero, which is *stronger* than "insignificant": it is significantly *bad* on the losing side. Cherry-picking cannot rescue it — the best of 27 loses money and blows the account.

## KILL CRITERIA (verbatim)

> DEAD unless center-region expR after costs > 0 AND ≥40 IS trades at center AND best-cell t ≥ 2.0.

| criterion | required | actual | pass |
|---|---|---|---|
| center-region expR after costs | > 0 | **−2.72R** (0 of 7 cells > 0; center −3.36R) | ❌ |
| IS trades at center | ≥ 40 | 75 | ✅ |
| best-cell t | ≥ 2.0 | **−0.869** (max over all 27 cells) | ❌ |

**Fails 2 of 3 → ❌ DEAD.** The conjunction fails on both the expectancy gate and the significance gate; only the trade-count gate passes. The strategy is not merely un-investable — it is *net-negative* everywhere in the declared box, and the always-in-market/no-stop construction guarantees eventual ruin (100–212% drawdowns).

## Comparison — C2 benchmark & cross-strategy context

Same causal fill model, cost stack, and mark-to-market Sharpe methodology, so numbers are directly comparable.

| | asset / TF | stop? | expR | PF | Sharpe | t | maxDD% | MAR |
|---|---|---|---|---|---|---|---|---|
| **DT11 center** (30/10/14) | ETH 4h | **none (S&R)** | **−3.363** | 0.46 | 0.34 | **−1.17** | **199.5** | — |
| **DT11 best-t** (30/10/10) | ETH 4h | **none (S&R)** | −1.127 | 0.71 | 0.64 | −0.87 | 102.1 | −0.41 |
| DT11 center — LONG leg only | ETH 4h | none | +1.367 | — | — | — | — | — |
| DT10 center (EMA trend, long-only) | ETH 1h | none | +1.918 | 2.50 | 0.96 | 1.53 | 45.6 | 0.65 |
| C2 center | BTC daily | — | — | — | **0.93** | — | — | **0.96** |
| C2 best gated | BTC daily | — | — | — | **1.44** | — | — | **2.56** |

**DT11 is far below every benchmark.** Against C2's plain center (Sharpe 0.93 / MAR 0.96) DT11's center posts Sharpe 0.34 and an **undefined/negative MAR** (the account is destroyed, so CAGR < 0); it is nowhere near C2's best gated cell (Sharpe 1.44 / MAR 2.56). Even its *best* cell (Sharpe 0.64, MAR −0.41) loses. The one salvageable component is the **long leg** (+1.37R center), which merely re-confirms DT10's result that *trend-long works on ETH* — but that edge is buried and then obliterated by the forced, unstopped short leg. **Conclusion:** the "EWO+RSI exhaustion" concept, as this Pine implements it (stop-and-reverse, always-in-market, no stop, decorative breakout filter), is the wrong machine to express whatever long-side edge exists.

## Worked examples (real candles, hand-traced from `dt11_trades_center.csv`)

### Example 1 — the −194R short that blows the account (min-R trade; the no-stop tail)

- **Signal bar** i=1921 opens **2020-10-12 08:00 UTC**, closes 12:00: `close`=366.42. RSI(14) **crosses under 60** (rsi[i−1]=65.77 → rsi[i]=51.32), `mfi`=35.49 (< 70), `ewo`=14.887 < `ewo[i−1]`=16.281 (turning down), `vol_ok`=True → `raw_sell` fires; `last_signal` was +1 → **short**.
- **Fill** = 4h open of the next bar, **2020-10-12 12:00 UTC** open = **366.42**; short entry fill (×0.9998) = **366.35**.
- Risk unit = ATR14[i] = **5.803** (1.58% of price). Size = risk 53.57 / 5.803 = **9.231 ETH** (account already down to ≈$5,357 from prior short losses).
- **No stop.** ETH rallies from $366 to $1,490 while the short is held; it only closes when RSI finally crosses **up** through 40 and a `raw_buy` reverses it on the bar closing **2021-02-27 04:00 UTC** → exit at **1,492.64** open; exit fill (×1.0002) = **1,492.94**.
- Gross = 9.231 × (366.35 − 1,492.94) = **−10,399.6**; fees **8.4**; **net −10,408.04 = −194.30R**, held **826 4h bars ≈ 138 days**. One trade loses ~2× the whole account — the exact ruin mechanism a hard stop would have prevented.

### Example 2 — the +20.6R short that works (max-R trade; the COVID crash)

- **Signal bar** i=609 opens **2020-03-07 16:00 UTC**, closes 20:00: `close`=238.97. RSI(14) crosses under 60 (rsi[i−1]=66.86 → rsi[i]=54.88), `mfi`=55.81 (< 70), `ewo`=13.059 < `ewo[i−1]`=13.303 (turning down), `vol_ok`=True → `raw_sell` → **short**.
- **Fill** = **2020-03-07 20:00 UTC** open = **238.91**; short entry fill (×0.9998) = **238.86**. Risk unit = ATR14[i] = **5.887** (2.46% of price); size = 53.13 / 5.887 = **10.367 ETH**.
- The **COVID crash** takes ETH to ≈$117 before RSI crosses back up through 40 and a `raw_buy` reverses it on the bar closing **2020-03-17 04:00 UTC** → exit at **117.61** open; exit fill (×1.0002) = **117.63**.
- Gross = 10.367 × (238.86 − 117.63) = **+1,256.6**; fees **1.7**; **net +1,254.95 = +20.56R**, held **56 bars ≈ 9.3 days**. Shorts *can* win big — but this same unstopped short construction (Example 1) also produces −194R, and over 2019–2024 the losers win: short leg net **−304R**.

Both examples reconcile to the cent against `dt11_trades_center.csv`.

## PROOFS

**py_compile** (clean):
```
$ python3 -m py_compile backtests/bt_dt11_eth_ewo.py   →   exit 0 (PY_COMPILE_OK)
```

**Determinism — two independent runs, md5 of each output byte-identical:**
```
                 run 1                             run 2
center ledger  2b072332647f766c68a0b2d6453ce092  2b072332647f766c68a0b2d6453ce092  IDENTICAL
best   ledger  248d24529bd384af94996c853b575199  248d24529bd384af94996c853b575199  IDENTICAL
grid   csv     da6b0e1f5c310c9af7d21b135ad79bc2  da6b0e1f5c310c9af7d21b135ad79bc2  IDENTICAL
```

**Candle load + 2025 lockout (parquet `backtests/data/ethusdt_1m.parquet`):**
```
engine load:   1m rows = 2,680,815   min = 2019-11-27 07:45:00 UTC   max = 2024-12-31 23:59:00 UTC
               4h bars = 11,171       min = 2019-11-27 04:00:00 UTC   max = 2024-12-31 20:00:00 UTC
               cutoff (exclusive) = 2025-01-01 00:00:00 UTC   →  candles ≥ cutoff loaded = 0
file total (unfiltered) = 3,482,895 rows, 2019-11-27 → 2026-07-11; the 2025-26 rows (802,080)
were filtered out BEFORE any indicator or signal computation — the locked OOS window was never evaluated.
```

## Files

- Engine: `backtests/bt_dt11_eth_ewo.py`
- Grid (27 cells): `Strategy Codex/DaviddTech/backtests/dt11_grid.csv`
- Center ledger (75 trades): `Strategy Codex/DaviddTech/backtests/dt11_trades_center.csv`
- Best-cell ledger (105 trades): `Strategy Codex/DaviddTech/backtests/dt11_trades_best.csv`
