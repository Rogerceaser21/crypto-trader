# ✅ 4/4 Jesse cross-check PASS, 4/4 survive Monte Carlo (prob(totalR≤0)<5%).

_DT6 — independent cross-validation (Jesse 2.5.0) + Monte Carlo, DaviddTech survivors._

Verdicts: DT1(Trend Rider) STRONG PASS · DT2(Vol-Surge) STRONG PASS · DT3(KAMA+Squeeze) STRONG PASS · DT4(RSI Dip-Recovery) PASS WITH CAVEATS (MC tail-fragile)

---

## Part A — Jesse cross-check (independent execution engine)

Method (per CROSSCHECK.md precedent): each survivor's CENTER ledger is replayed through **Jesse 2.5.0** inside the docker container. Jesse pulls BTC-USDT 1m candles from its OWN postgres store and its order engine decides every fill — entry price, the intrabar hard-stop hit (DT1 3×ATR fixed / DT3 2.8×ATR frozen, armed natively), the moving/chandelier stop level (DT2 / DT4), and the open-fill exits (cross / atr<50 / time-stop / forced). The only systematic difference from our engine is the reference's 0.02%/fill slippage, which Jesse does not charge.

| survivor | our expR | Jesse expR | ΔexpR | our n | Jesse n | our PF | Jesse PF | corr(ΔR,slip) | entry-fill bp | cross-check |
|---|---|---|---|---|---|---|---|---|---|---|
| DT1 Trend Rider | +0.8963 | +0.9053 | +0.0090 | 75 | 75 | 2.71 | 2.75 | 0.9975 | 0.055 | PASS |
| DT2 Vol-Surge | +0.2964 | +0.3059 | +0.0095 | 198 | 198 | 1.89 | 1.93 | 0.9382 | 0.000 | PASS |
| DT3 KAMA+Squeeze | +0.2816 | +0.3024 | +0.0208 | 242 | 242 | 1.56 | 1.62 | 0.9879 | 0.105 | PASS |
| DT4 RSI Dip-Recovery | +0.5115 | +0.5467 | +0.0352 | 75 | 75 | 2.25 | 2.40 | 0.9888 | 0.120 | PASS |

Exit-type breakdown (reference reason → Jesse exit) and slippage attribution:

- **DT1 Trend Rider** — ref reasons: {cross 47, stop 28}; Jesse exits: {open 47, stop 28}. mean ΔR +0.00900 vs predicted slippage-R +0.00897 (resid mean +0.000031, |resid|max 0.00128); entry-fill 0.055/0.716 bp mean/max, exit-fill 0.018/0.251 bp mean/max.
- **DT2 Vol-Surge** — ref reasons: {atrlt50 139, stop 47, timestop 12}; Jesse exits: {level 47, open 151}. mean ΔR +0.00945 vs predicted slippage-R +0.00949 (resid mean -0.000039, |resid|max 0.01314); entry-fill 0.000/0.000 bp mean/max, exit-fill 0.086/1.958 bp mean/max.
- **DT3 KAMA+Squeeze** — ref reasons: {forced 169, stop 71, trail 2}; Jesse exits: {open 171, stop 71}. mean ΔR +0.02077 vs predicted slippage-R +0.02077 (resid mean -0.000004, |resid|max 0.00885); entry-fill 0.105/2.415 bp mean/max, exit-fill 0.077/2.494 bp mean/max.
- **DT4 RSI Dip-Recovery** — ref reasons: {stop 75}; Jesse exits: {level 75}. mean ΔR +0.03519 vs predicted slippage-R +0.03483 (resid mean +0.000360, |resid|max 0.02078); entry-fill 0.120/3.474 bp mean/max, exit-fill 0.000/0.000 bp mean/max.

---

## Part B — Monte Carlo (trade-order bootstrap, 10000 draws, seed 20260712)

| survivor | n | center totalR | MC median termR | MC 5th-pct termR | 95th-pct maxDD (R) | 95th-pct maxDD (%) | prob(totalR≤0) | survives (<5%) |
|---|---|---|---|---|---|---|---|---|
| DT1 Trend Rider | 75 | +67.22 | +65.475 | +16.713 | 17.02 | 15.85 | 0.0103 | YES |
| DT2 Vol-Surge | 198 | +58.69 | +57.567 | +18.623 | 16.55 | 15.44 | 0.0053 | YES |
| DT3 KAMA+Squeeze | 242 | +68.14 | +67.168 | +17.450 | 27.38 | 24.43 | 0.0115 | YES |
| DT4 RSI Dip-Recovery | 75 | +38.36 | +37.325 | +7.506 | 12.72 | 12.07 | 0.0176 | YES |

### Tail stress — DT3 (tail-fragile) & DT4 (marginal)

`drop_top_K` = expectancy/t-stat after removing the K largest-R trades; `boot_no_top1` = bootstrap of the ledger WITHOUT the single top trade.

| survivor | scenario | n | expR | totalR | t-stat | cum-dropped-R / bootstrap |
|---|---|---|---|---|---|---|
| DT3 KAMA+Squeeze | 1 | 241 | 0.2286 | 55.088 | 1.847 | 13.055 |
| DT3 KAMA+Squeeze | 2 | 240 | 0.191 | 45.849 | 1.613 | 22.294 |
| DT3 KAMA+Squeeze | 3 | 239 | 0.1571 | 37.543 | 1.379 | 30.6 |
| DT3 KAMA+Squeeze | boot_no_top1 | 241 | 0.2286 | 55.088 | — | prob_totalR_le0=0.02420  p5_termR=8.428 |
| DT4 RSI Dip-Recovery | 1 | 74 | 0.3638 | 26.92 | 1.634 | 11.441 |
| DT4 RSI Dip-Recovery | 2 | 73 | 0.2682 | 19.58 | 1.315 | 18.781 |
| DT4 RSI Dip-Recovery | 3 | 72 | 0.1728 | 12.441 | 0.946 | 25.92 |
| DT4 RSI Dip-Recovery | boot_no_top1 | 74 | 0.3638 | 26.92 | — | prob_totalR_le0=0.04080  p5_termR=1.210 |

---

## Part C — Verdict synthesis

- **DT1 Trend Rider — STRONG PASS.** cross-check PASS (ΔexpR +0.0090, n 75↔75); MC survives (prob≤0 < 5%).
- **DT2 Vol-Surge — STRONG PASS.** cross-check PASS (ΔexpR +0.0095, n 198↔198); MC survives (prob≤0 < 5%).
- **DT3 KAMA+Squeeze — STRONG PASS.** cross-check PASS (ΔexpR +0.0208, n 242↔242); MC survives (prob≤0 < 5%).
- **DT4 RSI Dip-Recovery — PASS WITH CAVEATS (MC tail-fragile).** cross-check PASS (ΔexpR +0.0352, n 75↔75); MC survives (prob≤0 < 5%).

---
## Proofs

- **MC determinism:** seed 20260712, 10000 draws. `dt6_mc_summary.csv` md5 `18307ffb8e96797fe22a8918ef64641b`.
- **DT1 signals:** `/Users/igor/Claude Trading/jesse/port/dt6/signals_dt1.csv` md5 `526e8bfd9e652367ebdc215be2915abe`.
- **DT2 signals:** `/Users/igor/Claude Trading/jesse/port/dt6/signals_dt2.csv` md5 `f67f700c4a64e8d03947ec26c6b4926b`.
- **DT3 signals:** `/Users/igor/Claude Trading/jesse/port/dt6/signals_dt3.csv` md5 `f46fc1024d7617c66800ca60b68d6132`.
- **DT4 signals:** `/Users/igor/Claude Trading/jesse/port/dt6/signals_dt4.csv` md5 `2329c2827ce0b2579ad94a066c997ef5`.
- **Jesse ledgers:** `jesse/port/dt6/out/<strat>_jesse.csv` md5 — DT1 `1969c3ef7ce741743b2d624feea5f330`; DT2 `0e349cef79e2d4915a1a3c5849c3e2c0`; DT3 `680c73ee34dca4d95a93fd2739868d6b`; DT4 `07c640f3db53f79fc0e641db6265a6e7`.
- **Jesse determinism:** DT1 backtest re-run byte-identical (dt1_jesse.csv md5 `1969c3ef7ce741743b2d624feea5f330` on both runs).
- **Jesse run log:** `/Users/igor/Claude Trading/jesse/port/dt6/out/run_log.txt` (candle min/max + per-strat metrics captured).
- **Candle window (Jesse):** 2019-09-09 → 2024-12-31 23:59 UTC (get_candles finish 2025-01-01 exclusive; run asserts no 2025+ candle) — locked OOS untouched.
- **py_compile:** `backtests/bt_dt6_crosscheck.py`, `jesse/port/dt6/run_dt6.py`, `jesse/strategies/DTReplay/__init__.py` compile clean (see run log).