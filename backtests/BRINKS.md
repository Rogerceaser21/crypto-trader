# Brinks Trade (Annie S1) — Backtest

BTC-USDT Binance USD-M perp, 15m. Data 2019-09-09 → 2026-07-11 (2497 days, 82 months). 1m candles from Jesse postgres (verified identical to Binance perp on 3 spot-checked days).

Execution: taker fee 0.05%/side, slippage 0.02%/fill, entry at next-candle open, stop/TP filled at level with adverse slippage, 1m intrabar fill-ordering (same-minute stop&TP → counted as loss). Sizing: 1% of $10,000 risk/trade; **1R = $100 = 1% of account** (fixed risk, no compounding).

## 0. Rules as coded (S1 spec, mechanised)

- **Windows:** only the 15m candle opening 03:30 NY (closes 03:45, UK changeover) and opening 09:30 NY (closes 09:45, US changeover). NY clock + 5pm-NY day + sessions reused from `detectors/anchors.py` (DST via zoneinfo). Never Sat/Sun (by 5pm-NY trading day).
- **Precondition:** the trigger candle sits at the day's LOD (W/long) / HOD (M/short); price swept beyond the preceding Asia-session range (19:00–02:00 NY) in that direction; a first peak (swing extreme) formed 2–6 bars (30–90 min) earlier with a retracement bounce between it and the trigger.
- **Trigger patterns** (mirror for the M/short short-side):
  - *hammer* = lower wick ≥ `wick_mult`×body (base 2×) AND body in the top third of the candle range AND upper wick ≤ 15% of range;
  - *inverted hammer* = the vertical mirror (upper wick ≥ 2×body, body in bottom third, lower wick ≤ 15%);
  - *railroad tracks* = two adjacent opposite-colour candles, ranges within 30% of each other, both range ≥ 1.5× the prior-10-bar average range (bearish→bullish for a long, bullish→bearish for a short).
- **Entry:** next 15m candle open. **Stop:** beyond BOTH peaks (worse of the two extremes) + a 5bp zone buffer. **TP1:** the OPEN (origin) of the first PVSRA vector candle (≥150% of prior-10 avg volume) in the impulse leg that drove price into the first peak — the 'market-maker candle' recovery level.
- **Time stop:** at the 2h checkpoint, exit at market unless unrealised ≥ 0.3R; runners continue to an 8h hard cap. PVSRA/vectors reused from `detectors/pvsra.py`, consistent with `detectors/CALIBRATION.md`.

## 1. Headline

| metric | value |
|---|---|
| signals detected | 50 |
| trades taken | 50 |
| occurrence | 0.61 trades/month |
| win rate | 36.0% |
| avg R (expectancy) | -0.393R |
| median R | -1.124R |
| total R | -19.67R |
| profit factor | 0.46 |
| avg win / avg loss | +0.93R / -1.14R |
| max drawdown | 24.3R  (24.3% of account) |
| best / worst trade | +4.90R / -1.62R |
| longest losing streak | 5 |
| final equity (from $10k) | $8,033 |

Exit-type mix: stop=27, tp=15, timestop=7, hardcap=1.

## 2. Splits

**By changeover window (UK 03:45 vs US 09:45 NY):**

| window | n | win_rate | avg_R | total_R | pf |
| --- | --- | --- | --- | --- | --- |
| UK | 25 | 36.000 | -0.198 | -4.942 | 0.732 |
| US | 25 | 36.000 | -0.589 | -14.726 | 0.179 |

**By pattern (W=long vs M=short):**

| pattern | n | win_rate | avg_R | total_R | pf |
| --- | --- | --- | --- | --- | --- |
| M | 23 | 34.783 | -0.743 | -17.089 | 0.082 |
| W | 27 | 37.037 | -0.095 | -2.578 | 0.855 |

**By trigger (hammer vs railroad):**

| trig_type | n | win_rate | avg_R | total_R | pf |
| --- | --- | --- | --- | --- | --- |
| hammer | 43 | 32.558 | -0.439 | -18.896 | 0.420 |
| railroad | 7 | 57.143 | -0.110 | -0.771 | 0.796 |

**By year (regime stability):**

| year | n | win_rate | avg_R | total_R | pf |
| --- | --- | --- | --- | --- | --- |
| 2020 | 9 | 44.444 | -0.296 | -2.668 | 0.495 |
| 2021 | 13 | 30.769 | -0.739 | -9.613 | 0.050 |
| 2022 | 8 | 25.000 | -0.355 | -2.839 | 0.535 |
| 2023 | 10 | 20.000 | -0.567 | -5.670 | 0.471 |
| 2024 | 4 | 75.000 | 0.354 | 1.417 | 2.098 |
| 2025 | 6 | 50.000 | -0.049 | -0.294 | 0.897 |

## 3. Walk-forward honesty

The strategy has **no tuned parameters**; every threshold is taken from the spec. Year-by-year total R: 2020: -2.7R (n=9), 2021: -9.6R (n=13), 2022: -2.8R (n=8), 2023: -5.7R (n=10), 2024: +1.4R (n=4), 2025: -0.3R (n=6).
Calendar years with data but **zero qualifying signals**: 2019, 2026 (setup simply never presented).
The single positive year (2024) is only 4 trades — small-sample noise, not a regime where the setup works.
Positive years: 1/6. Best year 2024 (+1.4R); worst 2021 (-9.6R). No single year carries a profit that the rest gives back — the result is consistently near or below zero across regimes, i.e. the edge is absent rather than concentrated.

## 4. Monte Carlo (5,000 shuffles of the trade sequence)

| percentile | max drawdown (% of account) |
|---|---|
| 5th | 19.7% |
| 50th | 21.7% |
| 95th | 26.1% |

Median max-DD 22.0R, 95th-pct 26.9R. P(max drawdown ≥ 20% of account) = **77.7%**. Mean final result -19.7R (shuffling cannot change the sum; it only reorders — the negative total is invariant).

## 5. Sensitivity grid

Vary hammer strictness (wick:body 1.5/2/3×), time-stop (1/2/3h), TP (vector origin / 1R / 2R). A real edge survives its neighbourhood.

| wick_mult | tp_mode | timestop_h | n | win_rate | avg_R | total_R | pf | maxDD_R |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1.500 | vector | 1.000 | 50 | 28.000 | -0.311 | -15.550 | 0.480 | 18.000 |
| 1.500 | vector | 2.000 | 50 | 36.000 | -0.393 | -19.670 | 0.460 | 24.300 |
| 1.500 | vector | 3.000 | 50 | 36.000 | -0.352 | -17.590 | 0.540 | 22.200 |
| 1.500 | 1R | 1.000 | 51 | 31.400 | -0.403 | -20.560 | 0.280 | 21.900 |
| 1.500 | 1R | 2.000 | 51 | 41.200 | -0.470 | -23.990 | 0.320 | 25.300 |
| 1.500 | 1R | 3.000 | 51 | 41.200 | -0.477 | -24.350 | 0.360 | 25.700 |
| 1.500 | 2R | 1.000 | 51 | 19.600 | -0.461 | -23.500 | 0.290 | 23.900 |
| 1.500 | 2R | 2.000 | 51 | 29.400 | -0.556 | -28.350 | 0.320 | 28.300 |
| 1.500 | 2R | 3.000 | 51 | 29.400 | -0.537 | -27.390 | 0.370 | 27.400 |
| 2.000 | vector | 1.000 | 50 | 28.000 | -0.311 | -15.550 | 0.480 | 18.000 |
| 2.000 | vector | 2.000 | 50 | 36.000 | -0.393 | -19.670 | 0.460 | 24.300 |
| 2.000 | vector | 3.000 | 50 | 36.000 | -0.352 | -17.590 | 0.540 | 22.200 |
| 2.000 | 1R | 1.000 | 51 | 31.400 | -0.403 | -20.560 | 0.280 | 21.900 |
| 2.000 | 1R | 2.000 | 51 | 41.200 | -0.470 | -23.990 | 0.320 | 25.300 |
| 2.000 | 1R | 3.000 | 51 | 41.200 | -0.477 | -24.350 | 0.360 | 25.700 |
| 2.000 | 2R | 1.000 | 51 | 19.600 | -0.461 | -23.500 | 0.290 | 23.900 |
| 2.000 | 2R | 2.000 | 51 | 29.400 | -0.556 | -28.350 | 0.320 | 28.300 |
| 2.000 | 2R | 3.000 | 51 | 29.400 | -0.537 | -27.390 | 0.370 | 27.400 |
| 3.000 | vector | 1.000 | 42 | 28.600 | -0.335 | -14.090 | 0.470 | 15.400 |
| 3.000 | vector | 2.000 | 42 | 35.700 | -0.435 | -18.280 | 0.400 | 19.700 |
| 3.000 | vector | 3.000 | 42 | 35.700 | -0.367 | -15.430 | 0.520 | 16.800 |
| 3.000 | 1R | 1.000 | 43 | 30.200 | -0.434 | -18.660 | 0.270 | 19.400 |
| 3.000 | 1R | 2.000 | 43 | 39.500 | -0.522 | -22.430 | 0.270 | 23.200 |
| 3.000 | 1R | 3.000 | 43 | 39.500 | -0.512 | -22.020 | 0.330 | 22.800 |
| 3.000 | 2R | 1.000 | 43 | 18.600 | -0.497 | -21.350 | 0.280 | 21.800 |
| 3.000 | 2R | 2.000 | 43 | 27.900 | -0.603 | -25.940 | 0.280 | 25.900 |
| 3.000 | 2R | 3.000 | 43 | 27.900 | -0.564 | -24.250 | 0.340 | 24.300 |

(wick:body 1.5× and 2× produce identical trades — the 'body in top third' rule is the binding constraint on hammer shape, so the multiplier only bites at 3×, which merely thins the sample from 50 to 42 without turning it positive.)

Cells with positive expectancy: **0/27**. None — the setup is negative across the entire neighbourhood (robustly unprofitable, not fragile-but-real).

## 6. Worked examples (rule-firing verification)

### Long W hammer, TP hit at vector origin
- long / US window / trigger=hammer / pattern=W
- entry 48933.0  stop 48089.2  TP 49174.2  (stop 1.72%, planned 0.29R)
- exit tp at 49174.2 after 2 bars -> +0.20R
```
  2021-12-28 04:30 NY  O49290.0 H49339.8 L49118.4 C49174.2  down    
  2021-12-28 04:45 NY  O49174.2 H49254.2 L49002.0 C49010.4  magenta ORIGIN(TP)
  2021-12-28 05:00 NY  O49013.4 H49161.0 L48745.2 C48867.6  red     
  2021-12-28 05:15 NY  O48867.6 H49082.7 L48867.6 C49057.5  up      
  2021-12-28 05:30 NY  O49057.5 H49076.0 L48943.6 C48998.4  down    
  2021-12-28 05:45 NY  O48998.4 H49041.7 L48920.0 C49026.8  up      
  2021-12-28 06:00 NY  O49026.8 H49073.4 L48892.2 C49002.1  down    
  2021-12-28 06:15 NY  O49002.1 H49190.2 L48984.2 C49100.0  up      
  2021-12-28 06:30 NY  O49100.0 H49187.3 L49090.1 C49122.5  up      
  2021-12-28 06:45 NY  O49120.3 H49220.2 L49120.3 C49182.1  up      
  2021-12-28 07:00 NY  O49182.1 H49182.1 L49069.4 C49163.0  down    
  2021-12-28 07:15 NY  O49163.0 H49273.0 L49142.0 C49247.0  up      
  2021-12-28 07:30 NY  O49247.0 H49361.0 L49192.6 C49204.8  down    
  2021-12-28 07:45 NY  O49204.8 H49244.0 L49081.2 C49087.5  down    
  2021-12-28 08:00 NY  O49087.5 H49175.6 L48957.8 C49074.5  magenta 
  2021-12-28 08:15 NY  O49074.5 H49148.4 L49052.9 C49125.5  up      
  2021-12-28 08:30 NY  O49133.8 H49274.6 L49059.3 C49250.1  up      
  2021-12-28 08:45 NY  O49250.1 H49254.0 L48965.0 C49012.3  red     
  2021-12-28 09:00 NY  O49012.3 H49095.4 L48811.0 C48936.3  red     PEAK1
  2021-12-28 09:15 NY  O48936.3 H49073.8 L48900.3 C49044.1  up      
  2021-12-28 09:30 NY  O49044.1 H49054.3 L48113.3 C48933.0  red     TRIGGER
  2021-12-28 09:45 NY  O48933.0 H49152.0 L48795.3 C49060.3  blue    ENTRY@open
  2021-12-28 10:00 NY  O49060.3 H49230.7 L48950.0 C49009.2  down    
  2021-12-28 10:15 NY  O49007.6 H49059.3 L48872.1 C49056.6  up      
```

### Long W, TP hit at vector origin
- long / UK window / trigger=railroad / pattern=W
- entry 9159.0  stop 9111.4  TP 9216.1  (stop 0.52%, planned 1.20R)
- exit tp at 9216.1 after 1 bars -> +0.93R
```
  2020-02-25 20:45 NY  O9248.2 H9268.0 L9216.0 C9217.5  down    
  2020-02-25 21:00 NY  O9216.1 H9239.4 L9140.9 C9159.5  red     ORIGIN(TP)
  2020-02-25 21:15 NY  O9159.5 H9200.8 L9117.7 C9193.8  blue    
  2020-02-25 21:30 NY  O9194.0 H9231.5 L9184.0 C9212.9  up      
  2020-02-25 21:45 NY  O9212.9 H9235.6 L9205.0 C9213.4  up      
  2020-02-25 22:00 NY  O9213.0 H9218.0 L9190.0 C9208.0  down    
  2020-02-25 22:15 NY  O9208.0 H9212.1 L9150.0 C9152.2  down    
  2020-02-25 22:30 NY  O9152.3 H9186.8 L9150.0 C9167.0  up      
  2020-02-25 22:45 NY  O9167.4 H9188.5 L9148.5 C9178.9  up      
  2020-02-25 23:00 NY  O9178.9 H9178.9 L9130.0 C9140.0  down    
  2020-02-25 23:15 NY  O9139.8 H9166.4 L9137.2 C9144.5  up      
  2020-02-25 23:30 NY  O9143.9 H9173.8 L9140.1 C9165.0  up      
  2020-02-25 23:45 NY  O9164.8 H9195.3 L9160.9 C9193.0  up      
  2020-02-26 00:00 NY  O9193.0 H9193.0 L9153.8 C9162.1  down    
  2020-02-26 00:15 NY  O9162.5 H9173.6 L9155.3 C9161.5  down    
  2020-02-26 00:30 NY  O9163.4 H9199.0 L9163.4 C9191.9  up      
  2020-02-26 00:45 NY  O9192.6 H9218.1 L9190.8 C9212.7  up      
  2020-02-26 01:00 NY  O9212.7 H9225.6 L9200.0 C9200.9  down    
  2020-02-26 01:15 NY  O9200.9 H9206.0 L9184.4 C9204.0  up      
  2020-02-26 01:30 NY  O9204.2 H9223.1 L9203.7 C9218.6  up      
  2020-02-26 01:45 NY  O9218.6 H9230.7 L9209.4 C9225.8  up      
  2020-02-26 02:00 NY  O9225.4 H9229.0 L9191.2 C9200.5  magenta 
  2020-02-26 02:15 NY  O9200.5 H9202.2 L9174.0 C9175.0  down    
  2020-02-26 02:30 NY  O9175.3 H9182.0 L9163.0 C9175.6  up      
  2020-02-26 02:45 NY  O9175.6 H9182.0 L9145.0 C9157.6  down    PEAK1
  2020-02-26 03:00 NY  O9158.5 H9188.3 L9148.0 C9179.1  up      
  2020-02-26 03:15 NY  O9179.6 H9187.2 L9130.1 C9132.3  down    
  2020-02-26 03:30 NY  O9132.3 H9164.8 L9116.0 C9159.0  blue    TRIGGER
  2020-02-26 03:45 NY  O9159.0 H9241.7 L9158.7 C9205.9  green   ENTRY@open
  2020-02-26 04:00 NY  O9205.1 H9213.8 L9151.0 C9169.5  magenta 
  2020-02-26 04:15 NY  O9168.9 H9169.9 L9136.7 C9155.9  down    
```

### Short M, stopped out (counter-trend cost drag)
- short / US window / trigger=hammer / pattern=M
- entry 8485.0  stop 8515.7  TP 8267.8  (stop 0.36%, planned 7.06R)
- exit stop at 8515.7 after 5 bars -> -1.39R
```
  2020-01-24 06:00 NY  O8256.0 H8271.9 L8248.0 C8267.2  up      
  2020-01-24 06:15 NY  O8267.8 H8339.0 L8266.0 C8330.2  green   ORIGIN(TP)
  2020-01-24 06:30 NY  O8330.9 H8417.8 L8329.4 C8390.2  green   
  2020-01-24 06:45 NY  O8390.4 H8422.6 L8358.0 C8416.6  up      
  2020-01-24 07:00 NY  O8416.6 H8464.1 L8371.2 C8408.7  magenta 
  2020-01-24 07:15 NY  O8408.8 H8416.0 L8386.0 C8409.1  up      
  2020-01-24 07:30 NY  O8409.1 H8449.0 L8409.1 C8430.1  up      
  2020-01-24 07:45 NY  O8430.1 H8455.0 L8422.0 C8443.7  up      
  2020-01-24 08:00 NY  O8444.0 H8452.3 L8421.0 C8425.5  down    
  2020-01-24 08:15 NY  O8425.2 H8445.0 L8421.2 C8431.1  up      
  2020-01-24 08:30 NY  O8431.1 H8440.5 L8422.5 C8429.0  down    
  2020-01-24 08:45 NY  O8428.3 H8480.0 L8428.1 C8467.6  up      PEAK1
  2020-01-24 09:00 NY  O8467.8 H8480.0 L8445.8 C8473.3  up      
  2020-01-24 09:15 NY  O8473.3 H8479.9 L8452.5 C8475.0  up      
  2020-01-24 09:30 NY  O8475.0 H8511.5 L8475.0 C8484.4  blue    TRIGGER
  2020-01-24 09:45 NY  O8485.0 H8498.0 L8470.0 C8471.7  down    ENTRY@open
  2020-01-24 10:00 NY  O8472.0 H8490.8 L8442.8 C8452.2  down    
  2020-01-24 10:15 NY  O8452.0 H8506.0 L8442.4 C8494.4  blue    
```

## Verdict

**No edge after costs.** On the exact S1 spec the Brinks trade fires only 0.61×/month and returns -0.393R per trade (36.0% win rate, PF 0.46, total -19.7R over 50 trades). The core problem is structural: the setup's stops are tight (~0.7% of price on average), so the ~0.14% round-trip cost plus adverse stop slippage turns every loss into ~1.2R and eats the whole theoretical 2.3R payoff. Win rate would need to clear ~40% to pay for that and it sits at 36.0%.

**Least-bad conditions:** the W side and the UK changeover are the only cuts that approach break-even; the M side is a clear drag (BTC's multi-year uptrend punishes the short/M setups). But 'least bad' here still means at/below zero — not a tradable subset on this sample.

**Robustness:** 0/27 sensitivity cells are positive, so this is not a fragile-but-real edge hiding behind one parameter choice — it is robustly unprofitable across hammer strictness, time-stop and TP definition. The Monte-Carlo 95th-pct drawdown is 26.1% of account with a 77.7% chance of a ≥20% drawdown, but that is drawdown around a losing mean, not risk-of-ruin on an edge.

**What would change the verdict:** (1) a materially tighter, better-defined TP that lifts win rate above ~45% while keeping R≥1.5; (2) a structural filter that removes the counter-trend short/M trades; (3) much larger sample — 50 trades over 7 years is thin, and the honest reading is 'no evidence of an edge' more than 'proven negative'. As specified and costed, do not trade it. What *could* kill even a hinted edge: the tight-stop cost drag and the discretionary TP ('market-maker candle') that the spec never pins down numerically.
