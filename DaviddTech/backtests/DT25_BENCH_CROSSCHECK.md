# ✅ cross-check 2/2 PASS · JOB1 DT23 STRONG PASS (MC prob≤0 0.0053) · JOB2 DT21 PASS but NOT book-eligible (long leg fails MC) · JOB3 DT19 trail refines DT1: INCONCLUSIVE

_DT25 — BTC bench-wave validation: JOB1 DT23 Volume-Spike (Jesse cross-check + MC), JOB2 DT21 Jewel-proxy (Jesse cross-check + MC + mandatory leg-split), JOB3 DT19-vs-DT1 refinement (MC head-to-head, no Jesse port). Jesse 2.5.0, seed 20260712._

Job verdicts: DT23 STRONG PASS · DT21 PASS WITH CAVEATS (not book-eligible: edge is short-leg/bug-dependent) · DT19-trail-refines-DT1 INCONCLUSIVE

---

## Part A — Jesse cross-check (independent execution engine) — JOBS 1 & 2

Each config's reference ledger is replayed through **Jesse 2.5.0** inside the docker container. Jesse pulls BTC-USDT 1m candles (`Binance Perpetual Futures`) from its OWN postgres store and its order engine decides every fill — entry at the entry-bar open; **DT23** a FROZEN bracket armed natively (stop = entry−1.5×ATR14@entry = native stop, target = entry+3×that = native take-profit) and resolved intrabar on 1m, ema-exit trades market-filled at the recorded exit bar; **DT21** the moving ATR-trail stop armed at the exact recorded exit level (level mode, per the DT6 DT2/DT4 & DT16 DT13/DT14 precedent) and filled intrabar, reverse-entry exits market-filled at the exit bar. The only systematic difference from our engine is the reference's 0.02%/fill slippage, which Jesse does not charge.

| config | our expR | Jesse expR | ΔexpR | our n | Jesse n | matched | our PF | Jesse PF | corr(ΔR,slip) | entry-fill bp | forced-liq | cross-check |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| DT23 center 2.0/1.5/3.0 | +0.3350 | +0.3547 | +0.0197 | 161 | 161 | 161 | 1.62 | 1.67 | 0.9265 | 0.167 | 0 | PASS |
| DT21 center 40/2.0/25 | +0.2396 | +0.2419 | +0.0023 | 199 | 199 | 199 | 1.61 | 1.62 | 0.0666 | 0.218 | 3 | PASS |

PASS (per task) = |ΔexpR| ≤ 0.05R AND exact trade count AND all trades matched. Both pass with small POSITIVE ΔexpR — Jesse is marginally better because it does not charge the reference's 0.02%/fill slippage (the DT6/DT16 signature). DT23 (discrete frozen brackets) matches cleanly (ΔexpR +0.020 ≈ predicted slippage, corr 0.93, 0 forced-liq). DT21 is a continuous long/short **reversal** system with tight trade interleaving (5 same-bar trades, 46 signals within 2 bars of the prior exit); to replay it without a sequential-fill stall, DTReplay runs in reversal mode (catch-up entry to the reference exit bar + exit-bar-anchored level force-close, env-gated so DT6/DT16 are byte-unchanged). All 199 trades execute and match; 3 of 171 ATR-trail levels were not reached by Jesse's 1m candles within the reference exit bar and market-closed one bar later (forced-liq=3), which is why DT21's mean ΔR (+0.0023) sits BELOW pure predicted slippage (+0.0134) and its corr(ΔR,slip) is low — the net effect is still a clean PASS (ΔexpR +0.0023 ≪ 0.05).

Exit-type breakdown (reference reason → Jesse exit) and slippage attribution:

- **DT23 (center 2.0/1.5/3.0)** — ref reasons: {ema_exit 45, stop 71, target 45}; Jesse exits: {open 45, stop 71, target 45}. mean ΔR +0.01974 vs predicted slippage-R +0.01925 (resid mean +0.000496, |resid|max 0.03550); entry-fill 0.167/5.704 bp mean/max, exit-fill 0.016/0.621 bp mean/max.
- **DT21 (center 40/2.0/25)** — ref reasons: {reverse 28, trail 171}; Jesse exits: {forced_liq 3, level 168, open 28}. mean ΔR +0.00225 vs predicted slippage-R +0.01340 (resid mean -0.011151, |resid|max 1.28463); entry-fill 0.218/24.945 bp mean/max, exit-fill 4.032/541.563 bp mean/max.

---

## Part B — Monte Carlo (trade-order bootstrap, 10000 draws, seed 20260712)

| config | job | n | center totalR | MC median termR | MC 5th-pct termR | 95th-pct maxDD (R) | 95th-pct maxDD (%) | prob(totalR≤0) | survives (<5%) |
|---|---|---|---|---|---|---|---|---|---|
| DT23 center 2.0/1.5/3.0 | JOB1 | 161 | +53.93 | +53.589 | +18.457 | 18.92 | 17.58 | 0.0053 | YES |
| DT21 center 40/2.0/25 | JOB2 | 199 | +47.69 | +47.071 | +11.946 | 17.75 | 16.50 | 0.0125 | YES |
| DT19 center | JOB3 | 105 | +62.85 | +61.151 | +25.065 | 10.13 | 9.72 | 0.0008 | YES |
| DT1 center | JOB3 | 75 | +67.22 | +65.475 | +16.713 | 17.02 | 15.85 | 0.0103 | YES |

---

## Part C — Mandatory stress

### JOB1 DT23 — drop-top-K (tail-health), K=1..3

| config | scenario | n | expR | totalR | t | PF | prob(totalR≤0) | p5 termR | note |
|---|---|---|---|---|---|---|---|---|---|
| dt23 | drop_top_1 | 160 | 0.3186 | 50.968 | 2.377 | 1.582 | nan | nan | dropped_R=2.963 |
| dt23 | drop_top_2 | 159 | 0.3019 | 48.006 | 2.257 | 1.548 | nan | nan | dropped_R=5.926 |
| dt23 | drop_top_3 | 158 | 0.2851 | 45.046 | 2.134 | 1.514 | nan | nan | dropped_R=8.886 |

Top-3 trades = 16.5% of total R. The edge is not tail-dependent — dropping the three biggest winners leaves expectancy strongly positive (see t-stats above).

### JOB2 DT21 — leg-split bootstrap (mandatory: is the edge bug-dependent?)

| config | scenario | n | expR | totalR | t | PF | prob(totalR≤0) | p5 termR | note |
|---|---|---|---|---|---|---|---|---|---|
| dt21 | long_only_boot | 102 | 0.1311 | 13.37 | 1.058 | 1.337 | 0.1428 | -6.495 | leg=long (n=102) |
| dt21 | short_only_boot | 97 | 0.3538 | 34.319 | 1.808 | 1.908 | 0.0214 | 5.634 | leg=short (n=97) |

Edge decomposition: long leg totalR 13.37 (n=102, 28% of total), short leg totalR 34.32 (n=97, 72% of total). **Long-leg bootstrap prob(totalR≤0) = 0.1428** (FAILS the 5% gate); short-leg prob(totalR≤0) = 0.0214. The short leg carries the author's bugs and carries the majority of the edge; the long leg alone FAILS MC badly → **NOT BOOK-ELIGIBLE (edge is short-leg/bug-dependent)**.

---

## JOB 3 — DT19 (EMA cross + ATR trail) vs DT1 (same signal, frozen stop) — MC head-to-head

| strategy | n | expR | totalR | MC median termR | MC 5th-pct termR | 95th-pct maxDD (R) | 95th-pct maxDD (%) | prob(totalR≤0) |
|---|---|---|---|---|---|---|---|---|
| DT19 trail | 105 | +0.5986 | +62.85 | +61.151 | +25.065 | 10.13 | 9.72 | 0.0008 |
| DT1 frozen | 75 | +0.8963 | +67.22 | +65.475 | +16.713 | 17.02 | 15.85 | 0.0103 |

**Paired weekly comparison** (union of weekly R series, R bucketed by exit_time = realised PnL, empty weeks = 0): n = 268 weeks, mean weekly diff (DT19−DT1) = -0.0163R, one-sample t on the diff = -0.223 (weekly ΣR: DT19 +62.85 vs DT1 +67.22).

**CONCLUSION: DT19 trail refines DT1: INCONCLUSIVE** — DT1's frozen stop keeps higher per-trade edge (expR +0.896 vs +0.599) and total (67.2R vs 62.9R), while DT19's trail cuts tail risk (prob≤0 0.0008 vs 0.0103, p95 maxDD 9.7% vs 15.8%); the week-matched PnL difference is null (t -0.22), so neither dominates.

---

## Part D — Verdicts

### JOB1 — DT23 Volume-Spike (4h BTC long-only) — **STRONG PASS**
- cross-check PASS (ΔexpR +0.0197, n 161↔161, matched 161/161, forced-liq 0); MC survives (prob≤0 0.0053, p5 termR +18.46); tail healthy (top-3 16.5% of total, drop-top-3 t stays strong). Headline new-engine candidate confirmed.

### JOB2 — DT21 Jewel-proxy (4h BTC long+short) — **PASS WITH CAVEATS (not book-eligible: edge is short-leg/bug-dependent)**
- cross-check PASS (ΔexpR +0.0023, n 199↔199, matched 199/199, forced-liq 3); full-ledger MC survives (prob≤0 0.0125), BUT the mandatory leg-split shows the **long leg alone FAILS MC** (prob≤0 0.1428, p5 -6.49) while the short leg (author's bugs) survives (prob≤0 0.0214) and carries 72% of the edge. The edge is therefore bug-dependent → **NOT BOOK-ELIGIBLE**.

### JOB3 — DT19 trail vs DT1 frozen stop — **DT19 refines DT1: INCONCLUSIVE**
- DT1's frozen stop keeps higher per-trade edge (expR +0.896 vs +0.599) and total (67.2R vs 62.9R), while DT19's trail cuts tail risk (prob≤0 0.0008 vs 0.0103, p95 maxDD 9.7% vs 15.8%); the week-matched PnL difference is null (t -0.22), so neither dominates.

---

## Proofs

- **MC determinism:** seed 20260712, 10000 draws. `dt25_mc_summary.csv` md5 `6268e28b6455cfa787aa76ce4e423109`.
- **Stress determinism:** `dt25_stress.csv` md5 `7e28fb26a59e623ed3f26e1bb52b8235` (same seed lineage; DT21 leg-splits seed +200 long / +300 short).
- **JOB3 determinism:** `_dt25_job3.json` md5 `c4b137c6e8f6a8362c067839e18e3fd5` (DT19/DT1 same seed 20260712).
- **dt23 signals:** `/Users/igor/Claude Trading/jesse/port/dt25/signals_dt23.csv` md5 `9dfb75faaeb5cc0bf5d7454899e424d4`.
- **dt21 signals:** `/Users/igor/Claude Trading/jesse/port/dt25/signals_dt21.csv` md5 `1128a87b81f687c1fb0596eef2028cd7`.
- **Jesse ledgers:** `jesse/port/dt25/out/<key>_jesse.csv` md5 — dt23 `5c60e8a2848972455467fca3c9f651ad`; dt21 `1a6757266dfe2129d879f987487e305f`.
- **Jesse run log:** `/Users/igor/Claude Trading/jesse/port/dt25/out/run_log.txt` (candle min/max + per-config metrics + determinism).
- **Candle window (Jesse):** BTC-USDT 2019-09-09 → 2024-12-31 23:59 UTC (get_candles finish 2025-01-01 exclusive; run asserts no 2025+ candle) — locked OOS untouched.
- **py_compile:** `backtests/bt_dt25_crosscheck.py`, `jesse/port/dt25/run_dt25.py`, `jesse/strategies/DTReplay/__init__.py` compile clean (see run log).