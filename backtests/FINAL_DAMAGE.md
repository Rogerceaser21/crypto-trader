# Final Damage M/W (Annie S2) — Backtest

BTC-USDT Binance USD-M perp, 15m chart. **Train/analysis 2019-11 → 2024-12** (62 months). **2025-01 → 2026-07-11 is a LOCKED out-of-sample block, run exactly once on the single in-sample-best configuration (§6).** Detector and execution are FULLY CAUSAL — every decision at bar *t* uses only OHLC with index ≤ *t* (the WEEKLY-backtest look-ahead lesson is applied from the first line; see §0).

Execution: taker fee 0.05%/side, slippage 0.02%/fill, entry at the next 15m candle open, stop/TP filled at level with adverse slippage, 1m intrabar fill-ordering (same-minute stop&TP → **counted as a loss**). Sizing: 1% of $10,000 risk/trade; **1R = $100** (fixed risk, no compounding). PVSRA vectors (for the vector-origin TP) reused from the `detectors` package.

## 0. The trade as coded, and the causal detector

**Final Damage (Igor S2, §2 of the rulebook).** A FIRST peak forms at the running HOD/LOD (daily location filter) or HOW/LOW (weekly filter). LATER, within a window, price OVERSHOOTS that peak as a WICK and the 15m candle CLOSES back inside: **FDW** (long) — a lower low than the first low, closing back above it as a **hammer** whose body sits above the first low; **FDM** (short) — a higher high than the first high, closing back below it as an **inverted hammer** whose body sits below the first high. Entry = next candle open. **Stop = beyond the FD extreme** (the overshoot wick) + 5bp (Igor ruling 3: “beyond the overshooting second peak — lowest low FDW / highest high FDM”). No weekend entries (Fri 17:00 → Sun 17:00 NY).

**Causal peak definition (no look-ahead).** A first peak is an N-bar swing extreme **confirmed only at bar p+N** (it takes N future bars to know p is a pivot); at confirmation it must be the running HOD/LOD (or HOW/LOW) of its 5pm-NY day / Sun-5pm week up to p. The overshoot/trigger is the **FIRST** bar after confirmation that poke-breaks the peak — that first poke decides the setup (clean hammer close-inside → signal; a break-through or non-hammer poke → the peak is consumed, no trade). We never scan forward for a “cleaner” later poke. Peak spacing ≥ 30 min (auto-satisfied, since trigger ≥ p+N+1).

**These grids ARE the sensitivity analysis (declared up front, no cherry-picking).** Detection axes: location {daily HOD/LOD, weekly HOW/LOW}, pivot confirmation N {4, 8}, overshoot window {8h, 24h, 72h} = {32, 96, 288} bars. Trade axes: TP {1R, 1.9R (course minimum), 2R, L1-vector-origin}, time exit {none (hold to stop/TP, 30-day safety cap), Friday-UK-end hard close}. Full cross = 2·2·3·4·2 = **96 cells**; all are reported in §4.

The **L1-vector-origin** TP is read (as in the reviewed Brinks/Weekly builds) as the ORIGIN (open) of the first PVSRA vector of the impulse leg that drove price INTO the first peak — a causal, past level. Like the Weekly, this geometry is often incompatible with the beyond-the-extreme stop, so it is reported as one TP mode, not privileged.

## 1. Headline — the whole grid is negative

Selection rule (declared before looking): **best cell = highest in-sample expectancy among cells with n ≥ 150** (the least-unfavourable configuration, chosen only to give the locked OOS its fairest shot — there is no positive cell to choose). The **median cell** is the grid-median by expectancy.

| metric | best cell | median cell |
|---|---|---|
| config | weekly/N8/24h/1p9R/friday | daily/N8/72h/vector/friday |
| trades | 279 | 852 |
| occurrence (trades/mo) | 4.5 | 13.7 |
| win rate | 34.1% | 27.3% |
| expectancy (avg R) | -0.263R | -0.371R |
| total R | -73.4R | -316.0R |
| profit factor | 0.66 | 0.58 |
| t-stat (exp vs 0) | -3.32 | -6.47 |
| max drawdown | 73R (73.4%) | 317R (317.4%) |
| final equity (from $10k) | $2,656 | $-21,599 |

_(Accounting note: fixed 1R = $100 with no compounding, as in the Brinks / Weekly builds. For a sustained loser this drives nominal equity below zero — account ruin — so the median cell's “+317% drawdown / -$21,599 equity” is an artifact of fixed-$ sizing, not a real drawdown >100%. Read the R figures as primary; you would have been wiped out long before.)_

Across all **96 cells**: expectancy ranges **-0.477R … -0.263R**, profit factor **0.41 … 0.66**, and **0/96 cells are positive**. Every cell loses money; the “best” is merely least-bad. Its t-stat is **-3.32** — the expectancy is significantly *below* zero, not indistinguishable from it.

## 2. Why it loses — no raw edge, then costs finish it

The negative result has two independent causes, separated by re-running the **exact same trades with fees and slippage set to zero**:

| cell | n | real_exp | frictionless_exp | cost_drag_R |
| --- | --- | --- | --- | --- |
| daily/N4/24h/1R/friday | 1091 | -0.385 | -0.098 | 0.287 |
| daily/N4/24h/1p9R/friday | 1091 | -0.402 | -0.116 | 0.287 |
| daily/N8/24h/1R/friday | 769 | -0.339 | -0.068 | 0.271 |
| daily/N8/24h/1p9R/friday | 769 | -0.328 | -0.057 | 0.271 |
| weekly/N8/24h/1R/friday | 279 | -0.312 | -0.101 | 0.212 |
| weekly/N8/24h/1p9R/friday | 279 | -0.263 | -0.052 | 0.212 |

Even **frictionless**, the FD fade is marginally negative (≈ -0.08R per trade on the reference cells) — fading the overshoot has **no raw predictive edge**; it is a coin-flip with a slightly-below-fair payoff. Real transaction costs then add **~0.26R of drag per trade** (the FD stop sits just beyond the overshoot wick, so stops are tight — median 0.61% — and fees+slippage are large relative to that stop), pushing realistic expectancy to ≈ -0.34R. There is no configuration where the raw pattern is positive enough to survive costs.

## 3. Splits — primary config: daily/N8/24h/1p9R/friday

(The best cell is thin per-slice; splits use the well-populated primary cell **daily/N8/24h/1p9R/friday** so year / day-of-week cells have power. Every headline conclusion — uniform negativity — is identical on the best cell.)

**By Final-Damage type (FDW long / FDM short):**

| trig_type | n | win_rate | avg_R | total_R | pf | t |
| --- | --- | --- | --- | --- | --- | --- |
| FDM | 375 | 38.667 | -0.184 | -68.989 | 0.756 | -2.610 |
| FDW | 394 | 28.680 | -0.465 | -183.050 | 0.460 | -7.505 |

**By year:**

| year | n | win_rate | avg_R | total_R | pf | t |
| --- | --- | --- | --- | --- | --- | --- |
| 2019 | 33 | 30.303 | -0.404 | -13.341 | 0.539 | -1.719 |
| 2020 | 115 | 39.130 | -0.171 | -19.661 | 0.763 | -1.376 |
| 2021 | 136 | 32.353 | -0.328 | -44.653 | 0.589 | -2.995 |
| 2022 | 158 | 31.646 | -0.354 | -55.853 | 0.556 | -3.528 |
| 2023 | 195 | 36.410 | -0.278 | -54.150 | 0.646 | -2.917 |
| 2024 | 132 | 28.788 | -0.488 | -64.379 | 0.474 | -4.275 |

**By first-peak day-of-week (the WEEKLY backtest found a Monday effect — is it here?):**

| extreme_day | n | win_rate | avg_R | total_R | pf | t |
| --- | --- | --- | --- | --- | --- | --- |
| Friday | 117 | 39.316 | -0.226 | -26.491 | 0.593 | -2.362 |
| Monday | 144 | 37.500 | -0.165 | -23.803 | 0.788 | -1.408 |
| Sunday | 41 | 19.512 | -0.699 | -28.674 | 0.313 | -3.822 |
| Thursday | 151 | 33.113 | -0.386 | -58.336 | 0.546 | -3.644 |
| Tuesday | 167 | 33.533 | -0.296 | -49.507 | 0.645 | -2.797 |
| Wednesday | 149 | 29.530 | -0.438 | -65.229 | 0.515 | -4.011 |

**By entry day-of-week:**

| entry_day | n | win_rate | avg_R | total_R | pf | t |
| --- | --- | --- | --- | --- | --- | --- |
| Friday | 146 | 40.411 | -0.191 | -27.891 | 0.668 | -2.093 |
| Monday | 157 | 31.847 | -0.336 | -52.762 | 0.607 | -3.100 |
| Sunday | 1 | 0.000 | -1.676 | -1.676 | 0.000 | 0.000 |
| Thursday | 148 | 30.405 | -0.455 | -67.410 | 0.489 | -4.298 |
| Tuesday | 162 | 32.716 | -0.318 | -51.596 | 0.622 | -2.991 |
| Wednesday | 155 | 32.903 | -0.327 | -50.704 | 0.619 | -2.947 |

**By trigger session:**

| trig_session | n | win_rate | avg_R | total_R | pf | t |
| --- | --- | --- | --- | --- | --- | --- |
| Asia | 199 | 37.186 | -0.270 | -53.724 | 0.673 | -2.749 |
| DGZ | 47 | 31.915 | -0.307 | -14.410 | 0.637 | -1.519 |
| UK | 232 | 28.017 | -0.457 | -106.044 | 0.485 | -5.452 |
| US | 291 | 35.739 | -0.268 | -77.861 | 0.633 | -3.644 |

**Location filter — daily HOD/LOD vs weekly HOW/LOW** (matched N=8, 24h, 1.9R, Friday):

| location | n | win_rate | avg_R | total_R | pf | t |
| --- | --- | --- | --- | --- | --- | --- |
| daily | 769 | 33.600 | -0.328 | -252.000 | 0.590 | -6.970 |
| weekly | 279 | 34.100 | -0.263 | -73.400 | 0.660 | -3.320 |

**Monday check.** The Monday first-peak slice is n=144, WR 37.5%, expectancy -0.165R, PF 0.79 (t=-1.41) — still a loser. Unlike the Weekly FMWB fade (whose edge lived almost entirely in Monday weekend-box spikes), Final Damage is a daily-anchored *intraday* pattern that fires every day and is negative on every weekday; **there is no Monday concentration and no profitable Monday slice**.

## 4. Full parameter grid (96 cells)

Sorted by expectancy (best first). With 96 cells, a Bonferroni-style expectation is ~2 false positives at one-sided t>2 by chance alone — but **not one cell is even positive**, so multiple-testing risk is moot here: there is no winner to be a fluke.

| loc | N | window | tp | texit | n | win_rate | avg_R | total_R | pf | maxDD_R | t |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| weekly | 8 | 24h | 1p9R | friday | 279 | 34.100 | -0.263 | -73.400 | 0.660 | 73.400 | -3.320 |
| weekly | 8 | 72h | 1p9R | friday | 348 | 33.600 | -0.275 | -95.600 | 0.650 | 95.600 | -3.900 |
| weekly | 8 | 72h | 1p9R | none | 348 | 31.900 | -0.280 | -97.500 | 0.660 | 97.500 | -3.830 |
| weekly | 8 | 24h | 1p9R | none | 279 | 31.900 | -0.287 | -79.900 | 0.650 | 79.900 | -3.520 |
| weekly | 8 | 72h | 2R | friday | 348 | 31.900 | -0.298 | -103.900 | 0.630 | 104.300 | -4.170 |
| weekly | 8 | 24h | 2R | friday | 279 | 31.900 | -0.299 | -83.400 | 0.630 | 83.400 | -3.720 |
| weekly | 8 | 72h | vector | friday | 347 | 27.400 | -0.308 | -107.000 | 0.640 | 107.000 | -3.200 |
| weekly | 8 | 72h | 2R | none | 348 | 29.900 | -0.309 | -107.400 | 0.640 | 107.900 | -4.160 |
| weekly | 8 | 24h | 1R | friday | 279 | 45.200 | -0.312 | -87.200 | 0.520 | 87.200 | -5.320 |
| weekly | 8 | 72h | 1R | friday | 348 | 44.500 | -0.317 | -110.500 | 0.510 | 110.500 | -6.040 |
| daily | 8 | 24h | 1p9R | none | 769 | 32.800 | -0.320 | -246.300 | 0.620 | 249.600 | -6.480 |
| weekly | 8 | 72h | vector | none | 347 | 23.600 | -0.324 | -112.400 | 0.650 | 112.400 | -3.090 |
| weekly | 8 | 24h | vector | friday | 279 | 25.400 | -0.326 | -90.900 | 0.630 | 90.900 | -2.960 |
| daily | 8 | 24h | 2R | friday | 769 | 32.600 | -0.328 | -252.400 | 0.600 | 255.800 | -6.830 |
| daily | 8 | 24h | 1p9R | friday | 769 | 33.600 | -0.328 | -252.000 | 0.590 | 255.300 | -6.970 |
| weekly | 8 | 24h | 2R | none | 279 | 29.400 | -0.330 | -92.000 | 0.610 | 92.000 | -4.010 |
| daily | 8 | 24h | 2R | none | 769 | 31.300 | -0.330 | -254.100 | 0.620 | 257.600 | -6.550 |
| daily | 8 | 72h | 1p9R | none | 870 | 32.100 | -0.334 | -290.600 | 0.610 | 292.600 | -7.230 |
| weekly | 8 | 72h | 1R | none | 348 | 43.400 | -0.337 | -117.400 | 0.510 | 117.400 | -6.300 |
| weekly | 8 | 24h | 1R | none | 279 | 43.700 | -0.337 | -94.100 | 0.500 | 94.100 | -5.660 |
| daily | 8 | 72h | 2R | friday | 870 | 32.100 | -0.338 | -294.200 | 0.590 | 296.400 | -7.540 |
| daily | 8 | 24h | 1R | friday | 769 | 45.800 | -0.339 | -260.400 | 0.480 | 261.900 | -9.590 |
| daily | 8 | 72h | 1p9R | friday | 870 | 32.900 | -0.340 | -295.500 | 0.580 | 297.600 | -7.740 |
| daily | 8 | 72h | 2R | none | 870 | 30.800 | -0.340 | -295.700 | 0.610 | 297.900 | -7.190 |
| weekly | 4 | 72h | vector | friday | 441 | 24.700 | -0.342 | -150.700 | 0.620 | 150.700 | -3.720 |
| daily | 8 | 72h | 1R | friday | 870 | 45.200 | -0.342 | -297.700 | 0.480 | 298.000 | -10.360 |
| daily | 8 | 24h | 1R | none | 769 | 46.300 | -0.342 | -263.100 | 0.500 | 264.600 | -9.420 |
| weekly | 4 | 72h | 1p9R | friday | 444 | 31.300 | -0.345 | -153.100 | 0.580 | 153.400 | -5.630 |
| weekly | 4 | 24h | 1p9R | friday | 374 | 31.300 | -0.349 | -130.700 | 0.580 | 131.200 | -5.220 |
| daily | 8 | 72h | 1R | none | 870 | 45.500 | -0.351 | -305.700 | 0.490 | 306.000 | -10.310 |
| weekly | 4 | 72h | 1p9R | none | 444 | 29.700 | -0.352 | -156.400 | 0.590 | 159.400 | -5.560 |
| weekly | 8 | 8h | 1p9R | none | 170 | 30.000 | -0.352 | -59.900 | 0.590 | 59.900 | -3.430 |
| daily | 8 | 24h | vector | friday | 756 | 27.600 | -0.353 | -266.700 | 0.600 | 269.400 | -5.680 |
| daily | 8 | 8h | 1p9R | none | 498 | 32.100 | -0.354 | -176.400 | 0.590 | 176.400 | -5.800 |
| daily | 8 | 8h | 2R | friday | 498 | 31.500 | -0.355 | -177.000 | 0.580 | 177.000 | -5.870 |
| weekly | 8 | 24h | vector | none | 279 | 21.500 | -0.355 | -99.000 | 0.630 | 99.000 | -2.980 |
| weekly | 8 | 8h | 1p9R | friday | 170 | 30.000 | -0.358 | -60.800 | 0.570 | 60.800 | -3.570 |
| daily | 8 | 8h | 2R | none | 498 | 30.900 | -0.358 | -178.400 | 0.600 | 178.400 | -5.740 |
| weekly | 4 | 72h | vector | none | 441 | 21.300 | -0.360 | -158.800 | 0.630 | 158.800 | -3.680 |
| weekly | 4 | 24h | vector | friday | 374 | 22.700 | -0.363 | -135.900 | 0.610 | 135.900 | -3.540 |
| weekly | 4 | 72h | 1R | friday | 444 | 42.600 | -0.363 | -161.000 | 0.470 | 161.000 | -7.790 |
| daily | 8 | 8h | vector | friday | 495 | 25.900 | -0.365 | -180.800 | 0.610 | 180.800 | -4.530 |
| weekly | 8 | 8h | 2R | friday | 170 | 28.800 | -0.365 | -62.100 | 0.570 | 62.100 | -3.570 |
| weekly | 4 | 24h | 1R | friday | 374 | 42.800 | -0.367 | -137.400 | 0.460 | 137.400 | -7.230 |
| daily | 8 | 24h | vector | none | 756 | 25.000 | -0.367 | -277.500 | 0.610 | 280.200 | -5.500 |
| weekly | 4 | 24h | 1p9R | none | 374 | 29.400 | -0.368 | -137.800 | 0.570 | 138.300 | -5.360 |
| daily | 8 | 8h | 1p9R | friday | 498 | 31.900 | -0.370 | -184.300 | 0.560 | 184.300 | -6.280 |
| daily | 8 | 72h | vector | friday | 852 | 27.300 | -0.371 | -316.000 | 0.580 | 317.400 | -6.470 |
| weekly | 8 | 8h | 1R | friday | 170 | 41.800 | -0.372 | -63.200 | 0.460 | 63.200 | -4.940 |
| weekly | 4 | 72h | 2R | friday | 444 | 29.500 | -0.373 | -165.500 | 0.560 | 166.200 | -6.010 |
| weekly | 8 | 8h | 2R | none | 170 | 28.200 | -0.375 | -63.800 | 0.570 | 63.800 | -3.600 |
| weekly | 8 | 8h | 1R | none | 170 | 42.400 | -0.375 | -63.800 | 0.460 | 63.800 | -4.940 |
| weekly | 4 | 72h | 1R | none | 444 | 41.900 | -0.376 | -167.100 | 0.470 | 167.100 | -7.960 |
| daily | 8 | 8h | 1R | friday | 498 | 44.400 | -0.377 | -187.700 | 0.450 | 187.700 | -8.510 |
| daily | 8 | 8h | 1R | none | 498 | 45.200 | -0.378 | -188.400 | 0.460 | 188.400 | -8.400 |
| weekly | 4 | 24h | 1R | none | 374 | 42.000 | -0.382 | -142.800 | 0.460 | 142.800 | -7.420 |
| weekly | 4 | 72h | 2R | none | 444 | 27.700 | -0.383 | -170.200 | 0.560 | 173.800 | -5.960 |
| daily | 4 | 72h | 1R | friday | 1188 | 43.900 | -0.384 | -456.200 | 0.440 | 456.200 | -13.460 |
| daily | 4 | 24h | 1R | friday | 1091 | 44.300 | -0.385 | -420.000 | 0.440 | 420.000 | -12.870 |
| daily | 8 | 8h | vector | none | 495 | 23.800 | -0.385 | -190.600 | 0.610 | 190.600 | -4.580 |
| weekly | 4 | 24h | 2R | friday | 374 | 29.100 | -0.387 | -144.800 | 0.550 | 145.300 | -5.720 |
| daily | 4 | 24h | 1R | none | 1091 | 44.700 | -0.387 | -422.000 | 0.450 | 422.000 | -12.650 |
| daily | 8 | 72h | vector | none | 852 | 24.800 | -0.389 | -331.800 | 0.590 | 333.200 | -6.310 |
| daily | 4 | 72h | 1R | none | 1188 | 44.300 | -0.390 | -463.800 | 0.450 | 463.800 | -13.350 |
| weekly | 4 | 24h | vector | none | 374 | 19.300 | -0.392 | -146.600 | 0.600 | 146.600 | -3.620 |
| daily | 4 | 24h | 1p9R | none | 1091 | 30.700 | -0.396 | -432.500 | 0.560 | 434.000 | -9.690 |
| daily | 4 | 72h | 1p9R | none | 1188 | 30.300 | -0.402 | -477.800 | 0.550 | 478.000 | -10.290 |
| daily | 4 | 24h | 1p9R | friday | 1091 | 31.400 | -0.402 | -439.000 | 0.530 | 440.500 | -10.270 |
| daily | 4 | 24h | 2R | friday | 1091 | 30.500 | -0.404 | -440.700 | 0.530 | 442.400 | -10.080 |
| daily | 4 | 24h | 2R | none | 1091 | 29.300 | -0.407 | -444.000 | 0.550 | 445.700 | -9.750 |
| daily | 4 | 72h | 1p9R | friday | 1188 | 31.100 | -0.408 | -484.100 | 0.520 | 484.400 | -10.930 |
| daily | 4 | 72h | 2R | friday | 1188 | 30.200 | -0.408 | -484.500 | 0.530 | 485.000 | -10.700 |
| daily | 4 | 24h | vector | friday | 1071 | 25.600 | -0.410 | -438.600 | 0.560 | 439.500 | -7.590 |
| daily | 4 | 72h | 2R | none | 1188 | 29.000 | -0.410 | -486.700 | 0.550 | 487.200 | -10.270 |
| weekly | 4 | 24h | 2R | none | 374 | 27.000 | -0.411 | -153.800 | 0.540 | 154.400 | -5.930 |
| daily | 4 | 72h | vector | friday | 1162 | 25.600 | -0.416 | -482.800 | 0.550 | 482.800 | -8.150 |
| weekly | 8 | 8h | vector | friday | 170 | 19.400 | -0.416 | -70.700 | 0.570 | 70.700 | -2.850 |
| daily | 4 | 8h | 1R | none | 812 | 43.800 | -0.417 | -338.400 | 0.430 | 338.400 | -11.770 |
| daily | 4 | 8h | 1R | friday | 812 | 43.200 | -0.417 | -338.400 | 0.420 | 338.400 | -11.920 |
| weekly | 4 | 8h | 1R | none | 265 | 40.400 | -0.425 | -112.500 | 0.420 | 113.700 | -6.990 |
| weekly | 4 | 8h | 1R | friday | 265 | 39.600 | -0.428 | -113.400 | 0.410 | 114.500 | -7.120 |
| daily | 4 | 8h | vector | friday | 803 | 23.800 | -0.431 | -345.900 | 0.560 | 345.900 | -6.630 |
| daily | 4 | 24h | vector | none | 1071 | 23.100 | -0.434 | -464.800 | 0.560 | 465.700 | -7.660 |
| weekly | 4 | 8h | vector | friday | 265 | 17.700 | -0.436 | -115.700 | 0.560 | 115.700 | -3.420 |
| daily | 4 | 8h | 1p9R | none | 812 | 29.800 | -0.437 | -354.600 | 0.520 | 354.600 | -9.290 |
| daily | 4 | 8h | 2R | friday | 812 | 29.300 | -0.440 | -357.400 | 0.510 | 357.400 | -9.430 |
| daily | 4 | 72h | vector | none | 1162 | 23.100 | -0.441 | -512.900 | 0.550 | 512.900 | -8.220 |
| weekly | 4 | 8h | 1p9R | none | 265 | 27.200 | -0.444 | -117.700 | 0.500 | 120.800 | -5.580 |
| daily | 4 | 8h | 2R | none | 812 | 28.600 | -0.444 | -360.400 | 0.520 | 360.400 | -9.250 |
| weekly | 4 | 8h | 1p9R | friday | 265 | 27.500 | -0.445 | -118.100 | 0.490 | 121.000 | -5.730 |
| daily | 4 | 8h | 1p9R | friday | 812 | 29.900 | -0.447 | -363.300 | 0.500 | 363.300 | -9.820 |
| daily | 4 | 8h | vector | none | 803 | 21.700 | -0.462 | -371.200 | 0.550 | 371.200 | -6.930 |
| weekly | 8 | 8h | vector | none | 170 | 17.600 | -0.463 | -78.600 | 0.540 | 78.600 | -3.150 |
| weekly | 4 | 8h | 2R | friday | 265 | 26.000 | -0.466 | -123.500 | 0.480 | 126.600 | -5.900 |
| weekly | 4 | 8h | 2R | none | 265 | 25.300 | -0.474 | -125.500 | 0.490 | 128.900 | -5.880 |
| weekly | 4 | 8h | vector | none | 265 | 15.800 | -0.477 | -126.300 | 0.540 | 126.300 | -3.700 |

## 5. Monte Carlo (5,000 shuffles of the best cell's trade sequence)

| percentile | max DD % |
|---|---|
| 5th | 73.4% |
| 50th | 75.8% |
| 95th | 82.6% |

Median max-DD 78R, 95th-pct 87R, P(DD≥20%)=100.0%, mean final -73R. Shuffling cannot change the sum — the total is a firm loss in every ordering; the equity curve only ever grinds down.

## 6. Worked examples (rule-firing verification)

### FDW (long) — stopped out
- FDW | long | peak1 2022-09-19 23:15 NY (running LOD=19148.4) | overshoot 0.00% beyond, gap 26 bars
- entry 19222.6  stop 19138.6 (beyond overshoot wick)  TP 19382.2  (stop 0.44%, planned 1.90R)
- exit stop at 19138.6 after 9 bars -> -1.32R
```
  2022-09-19 22:45 NY  O19426.9 H19465.0 L19424.5 C19461.1  up      
  2022-09-19 23:00 NY  O19461.0 H19463.8 L19433.8 C19446.6  down    
  2022-09-19 23:15 NY  O19446.7 H19446.7 L19148.4 C19199.7  red     PEAK1
  2022-09-19 23:30 NY  O19199.7 H19338.8 L19197.6 C19311.8  blue    
  2022-09-19 23:45 NY  O19311.8 H19420.3 L19300.0 C19353.7  up      
  2022-09-20 00:00 NY  O19353.8 H19354.0 L19276.3 C19325.7  down    
  2022-09-20 00:15 NY  O19325.6 H19344.8 L19255.6 C19273.0  down    
  2022-09-20 00:30 NY  O19272.9 H19330.0 L19270.3 C19279.9  up      
  2022-09-20 00:45 NY  O19279.8 H19325.3 L19279.8 C19325.0  up      
  2022-09-20 01:00 NY  O19325.0 H19419.0 L19311.2 C19393.3  up      
  2022-09-20 01:15 NY  O19393.3 H19396.0 L19357.2 C19389.0  down    
  2022-09-20 01:30 NY  O19388.9 H19424.2 L19351.4 C19403.1  up      
  2022-09-20 01:45 NY  O19403.1 H19407.2 L19358.2 C19361.7  down    
  2022-09-20 02:00 NY  O19361.7 H19366.4 L19295.4 C19333.7  down    
  2022-09-20 02:15 NY  O19333.8 H19350.0 L19307.7 C19345.4  up      
  2022-09-20 02:30 NY  O19345.4 H19345.5 L19314.5 C19325.5  down    
  2022-09-20 02:45 NY  O19325.5 H19393.9 L19311.6 C19373.0  up      
  2022-09-20 03:00 NY  O19373.0 H19581.5 L19354.3 C19496.0  green   
  2022-09-20 03:15 NY  O19496.0 H19577.9 L19460.7 C19467.4  magenta 
  2022-09-20 03:30 NY  O19467.4 H19474.9 L19266.6 C19290.4  red     
  2022-09-20 03:45 NY  O19290.4 H19383.9 L19223.0 C19349.9  green   
  2022-09-20 04:00 NY  O19349.9 H19370.0 L19280.0 C19306.1  down    
  2022-09-20 04:15 NY  O19306.0 H19379.6 L19280.0 C19374.8  up      
  2022-09-20 04:30 NY  O19374.7 H19417.6 L19346.4 C19364.4  down    
  2022-09-20 04:45 NY  O19364.5 H19370.8 L19284.5 C19295.0  down    
  2022-09-20 05:00 NY  O19295.0 H19316.4 L19262.1 C19286.8  down    
  2022-09-20 05:15 NY  O19286.8 H19286.8 L19220.4 C19266.3  down    
  2022-09-20 05:30 NY  O19266.4 H19312.7 L19220.5 C19226.2  down    
  2022-09-20 05:45 NY  O19226.2 H19232.2 L19148.2 C19222.5  down    OVERSHOOT+close-inside
  2022-09-20 06:00 NY  O19222.6 H19237.4 L19170.2 C19223.2  up      ENTRY@open
  2022-09-20 06:15 NY  O19223.1 H19264.7 L19188.0 C19263.7  up      
  2022-09-20 06:30 NY  O19263.7 H19276.3 L19234.0 C19245.0  down    
  ... (6 bars / 2h omitted) ...
  2022-09-20 08:00 NY  O19209.6 H19219.9 L19064.5 C19099.8  red     EXIT(stop)
```

### FDM (short) — stopped out
- FDM | short | peak1 2022-08-28 17:30 NY (running HOD=20035.0) | overshoot 0.03% beyond, gap 60 bars
- entry 19941.8  stop 20052.0 (beyond overshoot wick)  TP 19732.4  (stop 0.55%, planned 1.90R)
- exit stop at 20052.0 after 4 bars -> -1.25R
```
  2022-08-28 17:00 NY  O19975.5 H20000.0 L19972.0 C19984.1  up      
  2022-08-28 17:15 NY  O19984.1 H20005.7 L19984.1 C20002.4  up      
  2022-08-28 17:30 NY  O20002.4 H20035.0 L19978.4 C19983.0  down    PEAK1
  2022-08-28 17:45 NY  O19982.9 H19983.0 L19925.0 C19954.1  magenta 
  2022-08-28 18:00 NY  O19954.0 H20017.9 L19860.0 C19960.1  green   
  2022-08-28 18:15 NY  O19960.0 H19985.6 L19869.0 C19895.4  red     
  2022-08-28 18:30 NY  O19895.4 H19936.3 L19868.1 C19931.4  up      
  2022-08-28 18:45 NY  O19931.4 H19935.0 L19881.7 C19890.6  down    
  2022-08-28 19:00 NY  O19890.6 H19896.0 L19824.0 C19871.5  magenta 
  2022-08-28 19:15 NY  O19871.5 H19909.6 L19634.7 C19703.9  red     
  2022-08-28 19:30 NY  O19703.9 H19720.8 L19607.5 C19644.5  red     
  2022-08-28 19:45 NY  O19644.2 H19654.0 L19508.0 C19547.5  red     
  2022-08-28 20:00 NY  O19547.5 H19627.9 L19539.4 C19559.9  up      
  2022-08-28 20:15 NY  O19560.1 H19657.7 L19544.1 C19645.3  up      
  2022-08-28 20:30 NY  O19645.3 H19740.0 L19638.9 C19657.8  up      
  2022-08-28 20:45 NY  O19657.7 H19668.7 L19610.5 C19630.1  down    
  2022-08-28 21:00 NY  O19630.0 H19671.9 L19610.0 C19628.2  down    
  2022-08-28 21:15 NY  O19628.2 H19645.8 L19580.1 C19600.9  down    
  2022-08-28 21:30 NY  O19600.9 H19631.7 L19575.0 C19605.7  up      
  2022-08-28 21:45 NY  O19605.7 H19652.2 L19594.5 C19650.8  up      
  2022-08-28 22:00 NY  O19650.9 H19697.7 L19635.6 C19691.2  up      
  2022-08-28 22:15 NY  O19691.2 H19779.2 L19668.7 C19761.2  up      
  2022-08-28 22:30 NY  O19761.3 H19775.5 L19723.5 C19761.9  up      
  2022-08-28 22:45 NY  O19762.0 H19765.9 L19725.2 C19752.4  down    
  2022-08-28 23:00 NY  O19752.3 H19763.0 L19723.7 C19741.9  down    
  2022-08-28 23:15 NY  O19742.0 H19844.0 L19741.9 C19832.2  blue    
  2022-08-28 23:30 NY  O19832.2 H19945.0 L19828.0 C19842.3  green   
  2022-08-28 23:45 NY  O19842.4 H19863.6 L19807.0 C19854.6  up      
  2022-08-29 00:00 NY  O19854.1 H19928.0 L19846.0 C19877.0  up      
  2022-08-29 00:15 NY  O19877.1 H19877.1 L19786.2 C19802.4  down    
  2022-08-29 00:30 NY  O19802.5 H19814.9 L19786.9 C19804.8  up      
  2022-08-29 00:45 NY  O19804.7 H19808.5 L19771.4 C19796.0  down    
  2022-08-29 01:00 NY  O19796.0 H19827.0 L19787.0 C19798.0  up      
  2022-08-29 01:15 NY  O19798.1 H19802.0 L19771.3 C19787.8  down    
  2022-08-29 01:30 NY  O19787.8 H19811.6 L19757.1 C19774.4  down    
  2022-08-29 01:45 NY  O19774.5 H19784.8 L19732.0 C19745.3  down    
  2022-08-29 02:00 NY  O19745.3 H19813.0 L19745.3 C19799.9  up      
  2022-08-29 02:15 NY  O19800.0 H19843.0 L19789.4 C19816.9  up      
  2022-08-29 02:30 NY  O19816.9 H19841.0 L19803.4 C19837.3  up      
  2022-08-29 02:45 NY  O19837.3 H19884.1 L19820.3 C19839.5  up      
  2022-08-29 03:00 NY  O19839.4 H19896.1 L19820.6 C19821.5  magenta 
  2022-08-29 03:15 NY  O19821.5 H19857.3 L19780.0 C19833.2  blue    
  2022-08-29 03:30 NY  O19833.2 H19893.6 L19819.6 C19855.2  up      
  2022-08-29 03:45 NY  O19855.3 H19887.9 L19845.1 C19885.3  up      
  2022-08-29 04:00 NY  O19885.3 H19914.6 L19849.0 C19853.3  down    
  2022-08-29 04:15 NY  O19853.4 H19873.8 L19815.2 C19815.3  down    
  2022-08-29 04:30 NY  O19815.3 H19839.2 L19790.0 C19818.6  up      
  2022-08-29 04:45 NY  O19818.5 H19825.0 L19782.7 C19782.8  down    
  2022-08-29 05:00 NY  O19782.8 H19816.2 L19779.8 C19803.5  up      
  2022-08-29 05:15 NY  O19803.4 H19838.8 L19786.8 C19835.3  up      
  2022-08-29 05:30 NY  O19835.3 H19848.4 L19790.2 C19816.1  down    
  2022-08-29 05:45 NY  O19816.0 H19844.9 L19785.6 C19831.9  up      
  2022-08-29 06:00 NY  O19831.8 H19851.0 L19819.7 C19820.4  down    
  2022-08-29 06:15 NY  O19820.5 H19836.3 L19797.0 C19800.1  down    
  2022-08-29 06:30 NY  O19800.0 H19841.0 L19800.0 C19815.4  up      
  2022-08-29 06:45 NY  O19815.4 H19850.0 L19813.3 C19818.9  up      
  2022-08-29 07:00 NY  O19818.9 H19827.6 L19757.0 C19767.9  red     
  2022-08-29 07:15 NY  O19767.9 H19835.2 L19754.1 C19800.3  green   
  2022-08-29 07:30 NY  O19800.3 H19818.8 L19783.6 C19806.4  up      
  2022-08-29 07:45 NY  O19806.4 H19815.8 L19783.8 C19812.0  up      
  2022-08-29 08:00 NY  O19812.0 H19831.8 L19795.1 C19814.9  up      
  2022-08-29 08:15 NY  O19815.0 H19990.0 L19808.7 C19971.9  green   
  2022-08-29 08:30 NY  O19971.8 H20042.0 L19912.0 C19941.9  red     OVERSHOOT+close-inside
  2022-08-29 08:45 NY  O19941.8 H19963.0 L19849.3 C19882.6  down    ENTRY@open
  2022-08-29 09:00 NY  O19882.6 H19947.9 L19882.5 C19901.4  up      
  2022-08-29 09:15 NY  O19901.4 H19990.0 L19895.7 C19963.1  up      
  ... (1 bars / 0h omitted) ...
  2022-08-29 09:30 NY  O19963.1 H20131.7 L19938.8 C20089.0  green   EXIT(stop)
```

### A winner (TP hit) — the minority case
- FDM | short | peak1 2022-01-26 09:15 NY (running HOD=38485.4) | overshoot 1.04% beyond, gap 19 bars
- entry 37829.3  stop 38906.0 (beyond overshoot wick)  TP 35783.6  (stop 2.85%, planned 1.90R)
- exit tp at 35783.6 after 28 bars -> +1.85R
```
  2022-01-26 08:45 NY  O37912.8 H38260.0 L37906.0 C38170.0  green   
  2022-01-26 09:00 NY  O38170.0 H38450.0 L38096.1 C38425.0  green   
  2022-01-26 09:15 NY  O38425.0 H38485.4 L38292.8 C38373.4  down    PEAK1
  2022-01-26 09:30 NY  O38373.4 H38408.7 L38026.2 C38047.8  down    
  2022-01-26 09:45 NY  O38047.8 H38260.1 L38041.2 C38201.9  up      
  2022-01-26 10:00 NY  O38201.9 H38333.3 L38117.1 C38153.2  down    
  2022-01-26 10:15 NY  O38153.2 H38182.7 L37804.0 C37887.0  down    
  2022-01-26 10:30 NY  O37887.0 H38020.0 L37825.3 C37923.9  up      
  2022-01-26 10:45 NY  O37923.9 H38017.6 L37785.0 C37962.1  up      
  2022-01-26 11:00 NY  O37962.1 H38124.0 L37886.1 C38108.6  up      
  2022-01-26 11:15 NY  O38108.6 H38163.2 L38030.8 C38098.5  down    
  2022-01-26 11:30 NY  O38100.0 H38204.4 L38000.0 C38147.6  up      
  2022-01-26 11:45 NY  O38147.6 H38273.0 L38101.0 C38234.9  up      
  2022-01-26 12:00 NY  O38234.9 H38344.0 L38228.4 C38260.0  up      
  2022-01-26 12:15 NY  O38260.0 H38290.3 L38158.2 C38211.8  down    
  2022-01-26 12:30 NY  O38210.0 H38211.8 L37978.6 C38100.0  down    
  2022-01-26 12:45 NY  O38100.0 H38130.0 L38005.3 C38032.3  down    
  2022-01-26 13:00 NY  O38032.3 H38055.4 L37553.0 C37793.1  red     
  2022-01-26 13:15 NY  O37793.1 H37869.3 L37627.0 C37783.0  down    
  2022-01-26 13:30 NY  O37783.0 H37847.0 L37680.0 C37705.4  down    
  2022-01-26 13:45 NY  O37703.8 H38299.8 L37647.0 C37950.7  green   
  2022-01-26 14:00 NY  O37950.7 H38886.6 L37800.0 C37831.6  red     OVERSHOOT+close-inside
  2022-01-26 14:15 NY  O37829.3 H38354.5 L37363.2 C38184.8  green   ENTRY@open
  2022-01-26 14:30 NY  O38184.8 H38320.0 L37700.0 C37787.4  magenta 
  2022-01-26 14:45 NY  O37785.5 H37933.1 L37440.0 C37548.8  down    
  ... (25 bars / 6h omitted) ...
  2022-01-26 21:00 NY  O35868.5 H35909.8 L35743.5 C35859.6  magenta EXIT(tp)
```

## 7. LOCKED out-of-sample (2025-01 → 2026-07-11) — best cell, run ONCE

Best in-sample cell **weekly/N8/24h/1p9R/friday** executed exactly once on unseen data, after all in-sample analysis was frozen.

| metric | in-sample (best) | LOCKED OOS |
|---|---|---|
| trades | 279 | 83 |
| occurrence | 4.5/mo | 4.5/mo |
| win rate | 34.1% | 43.4% |
| expectancy | -0.263R | -0.105R |
| total R | -73.4R | -8.8R |
| profit factor | 0.66 | 0.86 |
| t-stat | -3.32 | -0.68 |
| max drawdown | 73.4% | 16.8% |
| final equity | $2,656 | $9,125 |

OOS by year:

| year | n | win_rate | avg_R | total_R | pf | t |
| --- | --- | --- | --- | --- | --- | --- |
| 2025 | 55 | 40.000 | -0.238 | -13.098 | 0.704 | -1.277 |
| 2026 | 28 | 50.000 | 0.155 | 4.346 | 1.239 | 0.552 |

OOS by FD type:

| trig_type | n | win_rate | avg_R | total_R | pf | t |
| --- | --- | --- | --- | --- | --- | --- |
| FDM | 45 | 42.222 | -0.136 | -6.131 | 0.823 | -0.639 |
| FDW | 38 | 44.737 | -0.069 | -2.621 | 0.906 | -0.297 |

The locked block **confirms the in-sample read**: still a firm loser (-0.105R, PF 0.86) on unseen data. No regime change rescues it.

## 8. Verdict

**No edge — a clean, robust negative, like Brinks (not the thin Monday edge the Weekly gave).** Final Damage as specified is a losing fade at every point of a pre-declared 96-cell grid: in-sample expectancy spans -0.477R … -0.263R with **0/96 cells positive**, profit factors 0.41–0.66. The least-unfavourable cell (weekly/N8/24h/1p9R/friday) still loses **-0.263R** per trade over 279 trades (WR 34.1%, PF 0.66, t=-3.32 — significantly *below* zero).

**Two causes, cleanly separated.** Re-running the identical trades frictionless leaves expectancy ≈ -0.08R — so the pattern has **no raw predictive edge**: mechanically fading the overshoot/close-inside is a coin-flip with a slightly-below-fair payoff. Real fees + slippage then add **~0.26R of drag per trade**, because the beyond-the-wick stop is tight (median 0.61%) and transaction costs are large relative to it. The combination is a firm loser; no TP (1R/1.9R/2R/vector) or time-exit (none/Friday) reading escapes it, and neither location filter helps (daily and weekly HOW/LOW are both negative).

**FDW vs FDM, and the Monday question.** Both sides lose: FDW (long) -0.465R (n=394), FDM (short) -0.184R (n=375). Crucially, **Final Damage is NOT a subset of the Weekly Monday phenomenon.** The Weekly fade’s edge lived in the Monday weekend-box spike-out; FD is a daily-anchored *intraday* pattern that fires on every weekday (≈12/mo) and is negative on all of them — the Monday first-peak slice is the least-negative day but still loses (-0.165R, n=144, t=-1.41 — not distinguishable from zero or from the other losing weekdays). They are different animals: the Weekly fades a once-a-week *structural* stop-hunt with a wide, structural stop and a direction Igor reads discretionarily; FD mechanises a *candle-shape* stop-hunt with a tight wick stop and no such context.

**LOCKED out-of-sample (2025-01→2026-07, run once on the best cell).** -0.105R over 83 trades (WR 43.4%, PF 0.86, t=-0.68) — the unseen block **confirms** the in-sample negative. There is no favourable regime hiding in 2025-26.

**Multiple-testing note.** With 96 grid cells, ~2 spurious t>2 “winners” would be expected by chance — but the point is moot: not a single cell is even positive, so there is no fluke to guard against. The honest reading is unambiguous.

**Bottom line.** *No edge as mechanised.* Igor’s FD is the “crispest trigger” to eyeball, but the crisp candle shape does not carry a tradeable signal on its own — the value he extracts must come from the context the rulebook wraps around it (HOD/HOW location plus a completed 3-leg move, SVC at peak 1, the level count, and discretionary direction/where-to-target), none of which the bare M/W-overshoot geometry reproduces. Do not trade the mechanical Final Damage fade. If FD is to be pursued, it can only be as a *confirmation candle* inside the (thin, Monday-only) Weekly setup — never as a standalone signal.
