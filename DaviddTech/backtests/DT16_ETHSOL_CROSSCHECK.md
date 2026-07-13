# ✅ cross-check 4/4 PASS · MC 2/4 survive (prob(totalR≤0)<5%) · verdicts: DT12 PASS WITH CAVEATS · DT13 PASS WITH CAVEATS · DT14 FAIL (MC leg)

_DT16 — independent cross-validation (Jesse 2.5.0) + Monte Carlo + mandatory stress, ETH/SOL wave survivors DT12 / DT13 / DT14._

Config verdicts: DT12 center 96/1.2/(4,12) — FAIL (MC leg) · DT12 robust 128/1.4/(4,12) — STRONG PASS · DT13 center 1.5/2.0/24 — PASS WITH CAVEATS · DT14 center 2.0/1.8/30 — FAIL (MC leg)

---

## Part A — Jesse cross-check (independent execution engine)

Each config's reference ledger is replayed through **Jesse 2.5.0** inside the docker container. Jesse pulls the config's OWN symbol 1m candles (ETH-USDT / SOL-USDT, `Binance Perpetual Futures`) from its postgres store and its order engine decides every fill — entry price at the entry-bar open; DT12's FIXED bracket armed natively (stop=stop-loss, target=take-profit) and resolved intrabar on 1m; DT13/DT14 moving ATR stop/target armed at the recorded exit level (level mode, per the DT6 DT2/DT4 precedent) and filled intrabar; the market exits (zero-cross / time-stop / eod) market-filled at the exit-bar open. The only systematic difference from our engine is the reference's 0.02%/fill slippage, which Jesse does not charge.

| config | our expR | Jesse expR | ΔexpR | our n | Jesse n | our PF | Jesse PF | corr(ΔR,slip) | entry-fill bp | forced-liq | cross-check |
|---|---|---|---|---|---|---|---|---|---|---|---|
| DT12 center 96/1.2/(4,12) | +0.0814 | +0.0915 | +0.0101 | 253 | 253 | 1.17 | 1.20 | 0.2553 | 0.239 | 0 | PASS |
| DT12 robust 128/1.4/(4,12) | +0.2806 | +0.2905 | +0.0100 | 151 | 151 | 1.57 | 1.60 | 0.2453 | 0.156 | 0 | PASS |
| DT13 center 1.5/2.0/24 | +0.0773 | +0.0900 | +0.0126 | 1313 | 1313 | 1.14 | 1.16 | 0.1101 | 0.000 | 1 | PASS |
| DT14 center 2.0/1.8/30 | +0.0777 | +0.0848 | +0.0071 | 464 | 464 | 1.15 | 1.16 | 0.1401 | 0.000 | 0 | PASS |

PASS = |ΔexpR| ≤ 0.05R AND exact trade count AND exit-type match (≤1% force-liq tolerance). Every ΔexpR is small and POSITIVE (Jesse is marginally better because it does not charge the reference's 0.02%/fill slippage) — the DT6 signature. corr(ΔR,slip) is lower than DT6's ~0.99 because the per-trade dR here is a near-constant slippage offset (tiny variance) plus a handful of market-exit open-fill jitter trades; what matters is that the MEAN dR equals predicted slippage to <0.001R residual (below).

Exit-type breakdown (reference reason → Jesse exit) and slippage attribution:

- **DT12 (center 96/1.2/(4,12))** — ref reasons: {brk_stop 106, brk_tp 29, zerocross 118}; Jesse exits: {open 118, stop 106, target 29}. mean ΔR +0.01013 vs predicted slippage-R +0.01002 (resid mean +0.000107, |resid|max 0.01334); entry-fill 0.239/5.340 bp mean/max, exit-fill 0.063/3.030 bp mean/max.
- **DT12 (robust 128/1.4/(4,12))** — ref reasons: {brk_stop 65, brk_tp 30, zerocross 56}; Jesse exits: {open 56, stop 65, target 30}. mean ΔR +0.00995 vs predicted slippage-R +0.01000 (resid mean -0.000048, |resid|max 0.00897); entry-fill 0.156/1.976 bp mean/max, exit-fill 0.064/3.479 bp mean/max.
- **DT13 (center 1.5/2.0/24)** — ref reasons: {stop 669, timestop 644}; Jesse exits: {forced_liq 1, level 668, open 644}. mean ΔR +0.01263 vs predicted slippage-R +0.01341 (resid mean -0.000777, |resid|max 1.29215); entry-fill 0.000/0.000 bp mean/max, exit-fill 0.573/188.412 bp mean/max.
- **DT14 (center 2.0/1.8/30)** — ref reasons: {eod 1, stop 242, target 138, timestop 83}; Jesse exits: {level 380, open 84}. mean ΔR +0.00710 vs predicted slippage-R +0.00613 (resid mean +0.000973, |resid|max 0.44548); entry-fill 0.000/0.000 bp mean/max, exit-fill 0.652/237.290 bp mean/max.

---

## Part B — Monte Carlo (trade-order bootstrap, 10000 draws, seed 20260712)

| config | n | center totalR | MC median termR | MC 5th-pct termR | 95th-pct maxDD (R) | 95th-pct maxDD (%) | prob(totalR≤0) | survives (<5%) |
|---|---|---|---|---|---|---|---|---|
| DT12 center 96/1.2/(4,12) | 253 | +20.59 | +20.224 | -14.293 | 30.88 | 27.22 | 0.1624 | NO |
| DT12 robust 128/1.4/(4,12) | 151 | +42.37 | +42.347 | +11.419 | 17.43 | 16.32 | 0.0097 | YES |
| DT13 center 1.5/2.0/24 | 1313 | +101.54 | +101.981 | +12.805 | 63.53 | 49.27 | 0.0305 | YES |
| DT14 center 2.0/1.8/30 | 464 | +36.04 | +35.394 | -7.747 | 36.56 | 31.59 | 0.0891 | NO |

DT12 cp96 (center) vs cp128 (robust) side by side is the first two rows above: **cp128 robust survives** (prob≤0 0.97%, p5 termR +11.4) while **cp96 center FAILS** (prob≤0 16.2%, p5 termR -14.3). The robust region roughly triples center expectancy (+0.281R vs +0.081R) on ~40% fewer trades — the center config's edge is too thin to clear the MC survival gate.

---

## Part C — Mandatory stress

### DT12 — drop-top-K (Oct-2019-style tail question), both configs

| config | scenario | n | expR | totalR | t | PF | prob(totalR≤0) | p5 termR | note |
|---|---|---|---|---|---|---|---|---|---|
| dt12c | drop_top_1 | 252 | 0.0699 | 17.621 | 0.847 | 1.147 | nan | nan | dropped_R=2.967 |
| dt12c | drop_top_2 | 251 | 0.0584 | 14.654 | 0.712 | 1.122 | nan | nan | dropped_R=5.934 |
| dt12c | drop_top_3 | 250 | 0.0467 | 11.687 | 0.573 | 1.097 | nan | nan | dropped_R=8.901 |
| dt12b | drop_top_1 | 150 | 0.2627 | 39.401 | 2.093 | 1.53 | nan | nan | dropped_R=2.967 |
| dt12b | drop_top_2 | 149 | 0.2445 | 36.434 | 1.956 | 1.49 | nan | nan | dropped_R=5.934 |
| dt12b | drop_top_3 | 148 | 0.2261 | 33.467 | 1.816 | 1.45 | nan | nan | dropped_R=8.901 |

Top-3 trades = 43.2% of center totalR and 21.0% of robust totalR.

### DT13 — leg split + regime split (the SOL-beta question)

| config | scenario | n | expR | totalR | t | PF | prob(totalR≤0) | p5 termR | note |
|---|---|---|---|---|---|---|---|---|---|
| dt13c | long_only_boot | 684 | 0.1542 | 105.492 | 2.44 | 1.28 | 0.0043 | 37.074 | leg=long |
| dt13c | short_only_boot | 629 | -0.0063 | -3.95 | -0.115 | 0.989 | 0.547 | -60.663 | leg=short |
| dt13c | regime_bull_2020-09_2021-12 | 410 | 0.0508 | 20.824 | 0.692 | 1.091 | nan | nan | entry in [2020-09-01,2022-01-01) |
| dt13c | regime_bear_2022 | 302 | 0.1031 | 31.136 | 1.24 | 1.193 | nan | nan | entry in [2022-01-01,2023-01-01) |
| dt13c | regime_recovery_2023-01_2024-12 | 601 | 0.0825 | 49.583 | 1.268 | 1.146 | nan | nan | entry in [2023-01-01,2025-01-01) |
| dt13c | bull_longs_subset | 217 | 0.2025 | 43.936 | 1.789 | 1.374 | nan | nan | share of total edge = 43.3% |

Edge decomposition: long leg totalR 105.49, short leg totalR -3.95 (long share 104%). Bull-regime (2020-09→2021-12) longs alone = 43.94R = **43% of total edge**. The short leg is net-negative (dead).

### DT14 — leg split + regime split + drop-top-K

| config | scenario | n | expR | totalR | t | PF | prob(totalR≤0) | p5 termR | note |
|---|---|---|---|---|---|---|---|---|---|
| dt14c | long_only_boot | 239 | 0.1043 | 24.931 | 1.281 | 1.202 | 0.0957 | -6.679 | leg=long |
| dt14c | short_only_boot | 225 | 0.0494 | 11.105 | 0.611 | 1.094 | 0.2611 | -18.833 | leg=short |
| dt14c | regime_bull_2020-09_2021-12 | 153 | 0.0076 | 1.158 | 0.075 | 1.013 | nan | nan | entry in [2020-09-01,2022-01-01) |
| dt14c | regime_bear_2022 | 104 | 0.1202 | 12.501 | 0.992 | 1.242 | nan | nan | entry in [2022-01-01,2023-01-01) |
| dt14c | regime_recovery_2023-01_2024-12 | 207 | 0.1081 | 22.376 | 1.269 | 1.215 | nan | nan | entry in [2023-01-01,2025-01-01) |
| dt14c | bull_longs_subset | 84 | 0.0982 | 8.248 | 0.678 | 1.176 | nan | nan | share of total edge = 22.9% |
| dt14c | drop_top_K_check | 464 | nan | 36.036 | nan | nan | nan | nan | top3 share 20.9% <= 40%, drop-top-K not required |

Edge decomposition: long leg totalR 24.93, short leg totalR 11.11 (long share 69%). Bull-regime longs = 8.25R (23% of total). Top-3 share = 20.9%.

---

## Part D — Verdict per survivor

### DT12 ETH PLL Cycle-Lock — **PASS WITH CAVEATS**
Both configs cross-check clean; the split is entirely in Monte Carlo. The **robust cp128 region STRONG-PASSES** (prob≤0 0.97%, drop-top-3 t still 1.82); the **center cp96 config FAILS the MC survival gate** (prob≤0 16.2%) and is tail-fragile (drop-top-3 t 0.57). Deploy only the robust region.

- **DT12 (center 96/1.2/(4,12)) — FAIL (MC leg).** cross-check PASS (ΔexpR +0.0101, n 253↔253, forced-liq 0); MC FAIL (prob≤0 0.1624). · tail-fragile (drop-top-3 edge collapses)
- **DT12 (robust 128/1.4/(4,12)) — STRONG PASS.** cross-check PASS (ΔexpR +0.0100, n 151↔151, forced-liq 0); MC survives (prob≤0 0.0097).

### DT13 SOL Drive-Failure fade — **PASS WITH CAVEATS**
Cross-checks clean and the full ledger survives MC (prob≤0 3.05%), but the edge is **one-sided long**: short leg totalR is net-negative and its bootstrap has prob≤0 54.7% (dead). ~100% of edge is longs, 43% of it bull-regime longs — i.e. largely SOL beta. Tradeable as a long-only SOL fade, not as a symmetric strategy.

- **DT13 (center 1.5/2.0/24) — PASS WITH CAVEATS.** cross-check PASS (ΔexpR +0.0126, n 1313↔1313, forced-liq 1); MC survives (prob≤0 0.0305). · one-sided: short leg dead (totalR=-3.95), edge is long-leg only (104%)

### DT14 SOL NR4 Breakout — **FAIL (MC leg)**
Cross-checks clean, but **FAILS the MC survival gate** (prob≤0 8.9%) and the leg-split shows neither leg is independently robust (long boot prob≤0 9.6%, short 26.1%). No tail dependence (top-3 only 21%). Does not clear the bar.

- **DT14 (center 2.0/1.8/30) — FAIL (MC leg).** cross-check PASS (ΔexpR +0.0071, n 464↔464, forced-liq 0); MC FAIL (prob≤0 0.0891).

---
## Proofs

- **MC determinism:** seed 20260712, 10000 draws. `dt16_mc_summary.csv` md5 `ae03a658ddb6fdfafbb6b12553e659fc`.
- **Stress determinism:** `dt16_stress.csv` md5 `09cb5d3e9e760fdc06e14b0ef1593ad7` (same seed lineage).
- **dt12c signals:** `/Users/igor/Claude Trading/jesse/port/dt16/signals_dt12c.csv` md5 `a477fbc92e4273f3a6711ddae1ba6b08`.
- **dt12b signals:** `/Users/igor/Claude Trading/jesse/port/dt16/signals_dt12b.csv` md5 `c6d96386f309d0a03770073e6bac57e9`.
- **dt13c signals:** `/Users/igor/Claude Trading/jesse/port/dt16/signals_dt13c.csv` md5 `577e18467c655a5f1e11704263deabd9`.
- **dt14c signals:** `/Users/igor/Claude Trading/jesse/port/dt16/signals_dt14c.csv` md5 `8ea66f0d69bbd3799a76c52c9b2d0caa`.
- **Jesse ledgers:** `jesse/port/dt16/out/<key>_jesse.csv` md5 — dt12c `59036c8e1344b6946f4e523b7c41701f`; dt12b `dcaa87f61c8b12c78994088b7eaf6d33`; dt13c `ac9b7638e63ffcfe14cb1d69e615607e`; dt14c `a5045f863ea033702edacdcaa72bb71b`.
- **Jesse determinism:** dt12c + dt13c re-run byte-identical in the container (dt12c md5 `59036c8e1344b6946f4e523b7c41701f`, dt13c md5 `ac9b7638e63ffcfe14cb1d69e615607e` on both runs).
- **Jesse run log:** `/Users/igor/Claude Trading/jesse/port/dt16/out/run_log.txt` (candle min/max + per-config metrics captured).
- **Candle window (Jesse):** ETH-USDT 2019-11-28 → 2024-12-31 23:59, SOL-USDT 2020-09-15 → 2024-12-31 23:59 UTC (get_candles finish 2025-01-01 exclusive; run asserts no 2025+ candle) — locked OOS untouched.
- **py_compile:** `backtests/bt_dt16_crosscheck.py`, `jesse/port/dt16/run_dt16.py`, `jesse/strategies/DTReplay/__init__.py` compile clean (see run log).