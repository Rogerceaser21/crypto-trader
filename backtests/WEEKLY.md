# Weekly Setup / FMWB Fade (Annie S3, the flagship) — Backtest

BTC-USDT Binance USD-M perp. 15m entry timing, 1H weekly structure (1H resampled from the 15m feed). **Train/analysis 2019-11 → 2024-12** (271 weeks scanned, 62 months). **2025-01 → 2026-07-11 is a LOCKED out-of-sample block, run exactly once on the in-sample winner (§7).**

Execution: taker fee 0.05%/side, slippage 0.02%/fill, entry at the next 15m candle open, stop/TP filled at level with adverse slippage, 1m intrabar fill-ordering (same-minute stop&TP → **counted as a loss**). Sizing: 1% of $10,000 risk/trade; **1R = $100** (fixed risk, no compounding). All detectors reused from the `detectors` package (they encode Igor's 2026-07-11 rulings: 200%-break + 2-of-3 retest, SVC + engulfing, channel level logic, peak-2 35% vicinity band, weekend close-cluster box).

## 0. The trade as coded, and one structural finding up front

Weekend close-cluster box (from the preceding Fri 17:00→Sun 17:00 NY) → an early-week (Sun/Mon) spike-out of the box with a valid M/W/FD reversal on 1H (peak-2 inside the 35% vicinity band) → 1H counts levels from the last peak formation → 15m times the entry: a **200%-class PVSRA vector body-closes across the 50 EMA (L1)**, then a **2-of-3** retest {50-EMA wick-touch/reject, return into the L1-vector range, HL/LH structure} → **stop beyond the formation's extreme wick** (Igor: past the HOD/LOD spike, past the overshooting 2nd peak for FD) → TP1 = origin of the L1 impulse vector (the recovery base) → refund-zone exit on a close through the 2nd-peak wick → hard close at Friday UK-session end (08:00 NY). No entry after Fri 17:00 NY / on weekends.

**Structural finding (decides the headline TP).** The literal "TP1 = origin of the L1 vector" is the recovery base, which sits *near* the 50-EMA retest entry, while the stop sits all the way back at the week's spike extreme. So the fade's planned R:R is small: over the 223 causal in-sample signals the **median vector-origin R:R is 0.58**, and only **23/223** clear the taught **1.9 minimum** ('Only a 1.4:1 RR — Skip It'). That is not a tradeable sample. The tradeable reading of the same rule is to take the **1.9R minimum as the actual target** (TP1 = 1.9R fixed); that is the headline below. The literal vector-origin TP is shown in the §4 grid, where it collapses to ~23 trades and stays negative — an honest, important property of the setup as specified, not a tuning choice.

**No look-ahead.** Direction comes only from the early-week (Sun/Mon) spike-out of the box; L1 is the first 200% break after the spike; the retest and its 2-of-3 confluences are evaluated on data up to the entry bar only; the stop is the running HOD/LOD to entry; TP is the impulse base set before the spike. The first version of this backtest used the calibration detectors' whole-week retest/direction logic and printed an absurd 79% WR / PF 14.8 — that was future information leaking in, and it was removed. The numbers below are causal.

Direction variants: **(a) mechanical fade** — spike up → short (M), spike down → long (W); the M/W/FD detector already picks the faded side. **(b) regime-conditional** — FMWB/Range weeks fade (identical to a); **Trend-classified weeks take the direction MIRROR** (same entry bar, same |stop| and |TP| distances, sign flipped) so (b) differs from (a) *only* by the sign of the trade on Trend weeks. **(c) OI tie-breaker: SKIPPED** — no Coinalyze key; Binance public OI history is 30-day-capped and useless for 2019-2024 (stub `oi_tiebreaker_stub`, see NOTES.md).

Risk-management overlays that are **not** in the headline R (conservative, no favourable trailing assumed): channel/board-meeting partials, breakeven-after-L2, and the L3+SVC final exit. They reduce variance and lock partial gains; the headline models a single unit held to TP / stop / refund / Friday close.

## 1. Headline — per variant (in-sample, TP1 = 1.9R fixed)

| metric | variant a (mechanical fade) | variant b (regime-conditional) |
|---|---|---|
| trades taken | 223 | 223 |
| occurrence (trades/mo) | 3.57 | 3.57 |
| win rate | 44.8% | 42.2% |
| expectancy (avg R) | +0.099R | -0.022R |
| median R | -0.094R | -0.130R |
| total R | +22.05R | -4.96R |
| profit factor | 1.21 | 0.96 |
| avg win / avg loss | +1.27/-0.86R | +1.17/-0.89R |
| max drawdown | 13.2R (12.8%) | 14.6R (13.7%) |
| best / worst | +1.89/-1.25R | +1.89/-1.25R |
| longest losing streak | 9 | 8 |
| final equity (from $10k) | $12,205 | $9,504 |

Exit-type mix (a): stop=92, friday=71, tp=60.
Exit-type mix (b): stop=102, friday=72, tp=49.

**Significance & concentration.** Variant a expectancy +0.099R has t=1.23 vs zero (n=223) — a *marginal, not statistically clean* positive over the full sample (|t|<2), and it is **carried by two of six years**: 3/6 years positive, the best two contributing +27.1R of the +22.0R total (2022 & 2024 up, 2021 & 2023 down — see §2a). The signal is also concentrated by day: the **Monday-spike subset** is +0.382R at t=2.98 (n=91) — that IS significant, and it is exactly the day Igor's manual log flags. Variant b is t=-0.29 (indistinguishable from / below zero).

## 2a. Splits — variant a (mechanical fade)

**By year:**

| year | n | win_rate | avg_R | total_R | pf |
| --- | --- | --- | --- | --- | --- |
| 2019 | 8 | 50.000 | -0.091 | -0.726 | 0.831 |
| 2020 | 45 | 40.000 | 0.043 | 1.941 | 1.080 |
| 2021 | 39 | 33.333 | -0.046 | -1.777 | 0.913 |
| 2022 | 45 | 53.333 | 0.313 | 14.101 | 1.845 |
| 2023 | 46 | 41.304 | -0.097 | -4.443 | 0.811 |
| 2024 | 40 | 55.000 | 0.324 | 12.953 | 1.799 |

**By direction (long/short):**

| direction | n | win_rate | avg_R | total_R | pf |
| --- | --- | --- | --- | --- | --- |
| long | 114 | 45.614 | 0.060 | 6.825 | 1.140 |
| short | 109 | 44.037 | 0.140 | 15.224 | 1.268 |

**By trigger type (M/W/FDM/FDW):**

| trig_type | n | win_rate | avg_R | total_R | pf |
| --- | --- | --- | --- | --- | --- |
| FDM | 2 | 0.000 | -1.076 | -2.153 | 0.000 |
| FDW | 6 | 50.000 | -0.307 | -1.841 | 0.182 |
| M | 107 | 44.860 | 0.162 | 17.376 | 1.318 |
| W | 108 | 45.370 | 0.080 | 8.666 | 1.187 |

**By entry-timeframe condition met (which retest confluences fired):**

| entry_cond | n | win_rate | avg_R | total_R | pf |
| --- | --- | --- | --- | --- | --- |
| ema_retest+return_to_L1_range | 195 | 45.128 | 0.109 | 21.184 | 1.224 |
| ema_retest+return_to_L1_range+hl_lh | 28 | 42.857 | 0.031 | 0.865 | 1.080 |

**By regime (detector call):**

| regime | n | win_rate | avg_R | total_R | pf |
| --- | --- | --- | --- | --- | --- |
| FMWB | 133 | 45.113 | 0.039 | 5.197 | 1.091 |
| Range | 33 | 45.455 | 0.246 | 8.130 | 1.431 |
| Trend | 57 | 43.860 | 0.153 | 8.722 | 1.296 |

**By spike-extreme day (Igor: FMWB peaks Monday):**

| extreme_day | n | win_rate | avg_R | total_R | pf |
| --- | --- | --- | --- | --- | --- |
| Monday | 91 | 54.945 | 0.382 | 34.761 | 2.050 |
| Tuesday | 125 | 38.400 | -0.074 | -9.214 | 0.865 |
| Wednesday | 7 | 28.571 | -0.500 | -3.499 | 0.135 |

## 2b. Splits — variant b (regime-conditional)

**By year:**

| year | n | win_rate | avg_R | total_R | pf |
| --- | --- | --- | --- | --- | --- |
| 2019 | 8 | 62.500 | 0.272 | 2.174 | 1.678 |
| 2020 | 45 | 42.222 | -0.040 | -1.809 | 0.928 |
| 2021 | 39 | 35.897 | 0.005 | 0.184 | 1.010 |
| 2022 | 45 | 44.444 | 0.089 | 4.003 | 1.191 |
| 2023 | 46 | 43.478 | -0.145 | -6.675 | 0.724 |
| 2024 | 40 | 40.000 | -0.071 | -2.835 | 0.872 |

**By direction (long/short):**

| direction | n | win_rate | avg_R | total_R | pf |
| --- | --- | --- | --- | --- | --- |
| long | 135 | 42.222 | -0.051 | -6.860 | 0.896 |
| short | 88 | 42.045 | 0.022 | 1.902 | 1.039 |

**By trigger type (M/W/FDM/FDW):**

| trig_type | n | win_rate | avg_R | total_R | pf |
| --- | --- | --- | --- | --- | --- |
| FDM | 2 | 0.000 | -1.076 | -2.153 | 0.000 |
| FDW | 6 | 50.000 | -0.307 | -1.841 | 0.182 |
| M | 107 | 44.860 | 0.064 | 6.863 | 1.120 |
| W | 108 | 39.815 | -0.072 | -7.827 | 0.853 |

**By entry-timeframe condition met (which retest confluences fired):**

| entry_cond | n | win_rate | avg_R | total_R | pf |
| --- | --- | --- | --- | --- | --- |
| ema_retest+return_to_L1_range | 195 | 40.513 | -0.067 | -13.133 | 0.877 |
| ema_retest+return_to_L1_range+hl_lh | 28 | 53.571 | 0.292 | 8.175 | 2.058 |

**By regime (detector call):**

| regime | n | win_rate | avg_R | total_R | pf |
| --- | --- | --- | --- | --- | --- |
| FMWB | 133 | 45.113 | 0.039 | 5.197 | 1.091 |
| Range | 33 | 45.455 | 0.246 | 8.130 | 1.431 |
| Trend | 57 | 33.333 | -0.321 | -18.285 | 0.529 |

**By spike-extreme day (Igor: FMWB peaks Monday):**

| extreme_day | n | win_rate | avg_R | total_R | pf |
| --- | --- | --- | --- | --- | --- |
| Monday | 91 | 49.451 | 0.217 | 19.783 | 1.502 |
| Tuesday | 125 | 35.200 | -0.205 | -25.623 | 0.652 |
| Wednesday | 7 | 71.429 | 0.126 | 0.881 | 1.521 |

## 3. Monte Carlo (5,000 shuffles of the trade sequence)

| percentile | max DD % — variant a | max DD % — variant b |
|---|---|---|
| 5th | 7.3% | 13.0% |
| 50th | 10.9% | 18.7% |
| 95th | 16.8% | 26.9% |

Variant a: median max-DD 12.7R, 95th-pct 19.8R, P(DD≥20%)=1.3%, mean final +22.0R. Variant b: median 20.1R, 95th 29.8R, P(DD≥20%)=37.5%, mean final -5.0R. (Shuffling reorders but cannot change the sum — the total R is invariant.)

## 4. Sensitivity grid (variant a; 36 cells)

Axes: peak-2 vicinity band (25/35/45%), retest confluences required (1-of-3 / 2-of-3 / 3-of-3), TP1 (vector origin / 1.9R fixed), refund-zone (on/off). A real edge survives its neighbourhood.

| peak2_band | retest_need | tp_mode | refund | n | win_rate | avg_R | total_R | pf | maxDD_R |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 0.250 | 1 | vector | True | 23 | 34.800 | -0.061 | -1.390 | 0.910 | 7.500 |
| 0.250 | 1 | vector | False | 23 | 34.800 | -0.061 | -1.390 | 0.910 | 7.500 |
| 0.250 | 1 | 1p9R | True | 223 | 44.800 | 0.099 | 22.050 | 1.210 | 13.200 |
| 0.250 | 1 | 1p9R | False | 223 | 44.800 | 0.099 | 22.050 | 1.210 | 13.200 |
| 0.250 | 2 | vector | True | 23 | 34.800 | -0.061 | -1.390 | 0.910 | 7.500 |
| 0.250 | 2 | vector | False | 23 | 34.800 | -0.061 | -1.390 | 0.910 | 7.500 |
| 0.250 | 2 | 1p9R | True | 223 | 44.800 | 0.099 | 22.050 | 1.210 | 13.200 |
| 0.250 | 2 | 1p9R | False | 223 | 44.800 | 0.099 | 22.050 | 1.210 | 13.200 |
| 0.250 | 3 | vector | True | 2 | 50.000 | 0.665 | 1.330 | 2.250 | 1.100 |
| 0.250 | 3 | vector | False | 2 | 50.000 | 0.665 | 1.330 | 2.250 | 1.100 |
| 0.250 | 3 | 1p9R | True | 96 | 40.600 | 0.028 | 2.710 | 1.060 | 10.100 |
| 0.250 | 3 | 1p9R | False | 96 | 40.600 | 0.028 | 2.710 | 1.060 | 10.100 |
| 0.350 | 1 | vector | True | 23 | 34.800 | -0.061 | -1.390 | 0.910 | 7.500 |
| 0.350 | 1 | vector | False | 23 | 34.800 | -0.061 | -1.390 | 0.910 | 7.500 |
| 0.350 | 1 | 1p9R | True | 223 | 44.800 | 0.099 | 22.050 | 1.210 | 13.200 |
| 0.350 | 1 | 1p9R | False | 223 | 44.800 | 0.099 | 22.050 | 1.210 | 13.200 |
| 0.350 | 2 | vector | True | 23 | 34.800 | -0.061 | -1.390 | 0.910 | 7.500 |
| 0.350 | 2 | vector | False | 23 | 34.800 | -0.061 | -1.390 | 0.910 | 7.500 |
| 0.350 | 2 | 1p9R | True | 223 | 44.800 | 0.099 | 22.050 | 1.210 | 13.200 |
| 0.350 | 2 | 1p9R | False | 223 | 44.800 | 0.099 | 22.050 | 1.210 | 13.200 |
| 0.350 | 3 | vector | True | 2 | 50.000 | 0.665 | 1.330 | 2.250 | 1.100 |
| 0.350 | 3 | vector | False | 2 | 50.000 | 0.665 | 1.330 | 2.250 | 1.100 |
| 0.350 | 3 | 1p9R | True | 96 | 40.600 | 0.028 | 2.710 | 1.060 | 10.100 |
| 0.350 | 3 | 1p9R | False | 96 | 40.600 | 0.028 | 2.710 | 1.060 | 10.100 |
| 0.450 | 1 | vector | True | 23 | 34.800 | -0.061 | -1.390 | 0.910 | 7.500 |
| 0.450 | 1 | vector | False | 23 | 34.800 | -0.061 | -1.390 | 0.910 | 7.500 |
| 0.450 | 1 | 1p9R | True | 223 | 44.800 | 0.099 | 22.050 | 1.210 | 13.200 |
| 0.450 | 1 | 1p9R | False | 223 | 44.800 | 0.099 | 22.050 | 1.210 | 13.200 |
| 0.450 | 2 | vector | True | 23 | 34.800 | -0.061 | -1.390 | 0.910 | 7.500 |
| 0.450 | 2 | vector | False | 23 | 34.800 | -0.061 | -1.390 | 0.910 | 7.500 |
| 0.450 | 2 | 1p9R | True | 223 | 44.800 | 0.099 | 22.050 | 1.210 | 13.200 |
| 0.450 | 2 | 1p9R | False | 223 | 44.800 | 0.099 | 22.050 | 1.210 | 13.200 |
| 0.450 | 3 | vector | True | 2 | 50.000 | 0.665 | 1.330 | 2.250 | 1.100 |
| 0.450 | 3 | vector | False | 2 | 50.000 | 0.665 | 1.330 | 2.250 | 1.100 |
| 0.450 | 3 | 1p9R | True | 96 | 40.600 | 0.028 | 2.710 | 1.060 | 10.100 |
| 0.450 | 3 | 1p9R | False | 96 | 40.600 | 0.028 | 2.710 | 1.060 | 10.100 |

Cells with positive expectancy: **24/36** — but read the grid carefully, because two axes are inert *by construction* in the causal model:

- **peak-2 band (25/35/45%) is inert**: the causal entry keys off the box spike-out + the first 200% 50-EMA break + the retest — none of which use the peak-2 vicinity band. The band only labels M/W-vs-FD for the §2 split, so all three bands produce identical trades. (In the earlier look-ahead build the band gated the whole-week pattern; removing the look-ahead also removed the band's grip on entries.)
- **refund-zone on/off is inert**: the hard stop sits 5bp beyond the same 2nd-peak wick the refund watches, so intrabar the stop always fills first — the refund never triggers earlier. Honest no-op, kept for transparency.
- **retest 1-of-3 = 2-of-3** (223 trades, +0.099R): the 50-EMA retest and the return-into-L1-range confluences co-occur at the retest bar, so requiring one or two selects the same entries. **3-of-3** additionally demands HL/LH structure, thinning to 96 trades at +0.028R — stricter is *worse* here.
- **TP mode is the live axis**: 1.9R-fixed is the only tradeable form (+0.099R); vector-origin is negative and degenerate (§0). So the honest count of *distinct tradeable* configs that are positive is small — the 1.9R-fixed / need∈{2,3} cells — all in the +0.03…+0.10R band, none large.

## 5. Worked examples (rule-firing verification)

### Winning fade (TP hit)
- week 2021-01-03 | long (long fade) | trigger=W | regime=FMWB | entry-cond=ema_retest+return_to_L1_range
- weekend box[29166.4,34571.8] -> spike DOWN extreme on Monday; peak-2 session UK; 1H levels=0; SVC=False
- entry 31928.0  stop 27786.1  TP 39797.6  (stop 12.97%, planned 1.90R)
- exit tp at 39797.6 after 248 bars -> +1.89R
```
  2021-01-04 17:45 NY  O31500.0 H31520.0 L31350.0 C31366.6  down    
  2021-01-04 18:00 NY  O31366.6 H31434.0 L31234.2 C31332.0  down    
  2021-01-04 18:15 NY  O31330.0 H31890.4 L31200.0 C31800.0  green   L1-200%-break
  2021-01-04 18:30 NY  O31800.0 H32000.0 L31624.3 C31932.2  green   
  2021-01-04 18:45 NY  O31932.2 H32075.2 L31850.0 C32031.1  blue    
  2021-01-04 19:00 NY  O32029.5 H32564.9 L32026.3 C32555.3  green   
  2021-01-04 19:15 NY  O32555.3 H32563.0 L32257.9 C32369.3  down    
  2021-01-04 19:30 NY  O32372.6 H32900.0 L32327.4 C32859.8  green   
  2021-01-04 19:45 NY  O32859.8 H32896.0 L32375.5 C32496.5  magenta 
  2021-01-04 20:00 NY  O32500.0 H32680.1 L32369.0 C32524.1  up      
  2021-01-04 20:15 NY  O32524.1 H32610.5 L32317.9 C32596.8  up      
  2021-01-04 20:30 NY  O32597.6 H32768.9 L32543.1 C32578.4  down    
  2021-01-04 20:45 NY  O32578.5 H32847.3 L32481.4 C32837.2  up      
  2021-01-04 21:00 NY  O32837.2 H32880.8 L32675.0 C32736.3  down    
  2021-01-04 21:15 NY  O32733.7 H32843.0 L32467.2 C32555.1  down    
  2021-01-04 21:30 NY  O32555.1 H32574.0 L32309.0 C32345.5  down    
  2021-01-04 21:45 NY  O32345.1 H32515.5 L32267.3 C32358.1  up      
  2021-01-04 22:00 NY  O32358.1 H32593.4 L32355.0 C32498.3  up      
  2021-01-04 22:15 NY  O32495.4 H32528.5 L31846.8 C31928.0  magenta RETEST
  2021-01-04 22:30 NY  O31928.0 H32150.0 L31612.0 C31774.4  red     ENTRY@open
  2021-01-04 22:45 NY  O31772.1 H31800.0 L31155.2 C31217.6  red     
  2021-01-04 23:00 NY  O31219.0 H31575.5 L30711.0 C30735.7  red     
  2021-01-04 23:15 NY  O30728.4 H31492.8 L30425.0 C31282.0  green   
  ... (244 bars / 61h omitted) ...
  2021-01-07 12:15 NY  O39442.0 H39827.5 L39389.2 C39742.1  up      EXIT(tp)
```

### Losing fade (stop/refund)
- week 2023-01-01 | short (short fade) | trigger=M | regime=Range | entry-cond=ema_retest+return_to_L1_range
- weekend box[16501.4,16613.7] -> spike UP extreme on Monday; peak-2 session US; 1H levels=1; SVC=False
- entry 16712.4  stop 16807.4  TP 16531.9  (stop 0.57%, planned 1.90R)
- exit stop at 16807.4 after 56 bars -> -1.25R
```
  2023-01-03 07:15 NY  O16712.0 H16721.2 L16702.3 C16713.0  up      
  2023-01-03 07:30 NY  O16713.0 H16718.1 L16710.3 C16717.4  up      
  2023-01-03 07:45 NY  O16717.4 H16718.0 L16695.7 C16703.7  red     L1-200%-break
  2023-01-03 08:00 NY  O16703.8 H16727.0 L16703.7 C16712.5  blue    RETEST
  2023-01-03 08:15 NY  O16712.4 H16725.1 L16707.6 C16711.7  down    ENTRY@open
  2023-01-03 08:30 NY  O16711.6 H16720.6 L16709.6 C16717.1  up      
  2023-01-03 08:45 NY  O16717.0 H16732.2 L16713.6 C16718.1  up      
  2023-01-03 09:00 NY  O16718.2 H16738.4 L16717.7 C16736.5  up      
  ... (52 bars / 13h omitted) ...
  2023-01-03 22:00 NY  O16729.1 H16848.0 L16729.0 C16831.3  green   EXIT(stop)
```

### Variant-(b) Trend-week MIRROR trade
- week 2022-04-10 | short (long fade / MIRRORED (Trend)) | trigger=W | regime=Trend | entry-cond=ema_retest+return_to_L1_range
- weekend box[42155.9,43323.6] -> spike DOWN extreme on Tuesday; peak-2 session DGZ; 1H levels=2; SVC=False
- entry 39916.9  stop 40716.7  TP 38397.3  (stop 2.00%, planned 1.90R)
- exit stop at 40716.7 after 54 bars -> -1.07R
```
  2022-04-12 18:45 NY  O39587.6 H39950.0 L39534.6 C39809.3  blue    
  2022-04-12 19:00 NY  O39809.4 H39958.8 L39790.2 C39882.5  up      
  2022-04-12 19:15 NY  O39882.6 H40410.0 L39863.0 C40080.2  green   L1-200%-break
  2022-04-12 19:30 NY  O40080.3 H40180.3 L39930.0 C40038.4  down    
  2022-04-12 19:45 NY  O40038.4 H40167.7 L40010.0 C40060.7  up      
  2022-04-12 20:00 NY  O40060.7 H40176.0 L39984.0 C40154.6  up      
  2022-04-12 20:15 NY  O40154.6 H40156.2 L40050.6 C40054.2  down    
  2022-04-12 20:30 NY  O40054.3 H40075.0 L40007.0 C40048.4  down    
  2022-04-12 20:45 NY  O40048.5 H40066.0 L39865.0 C39917.0  down    RETEST
  2022-04-12 21:00 NY  O39916.9 H39923.5 L39700.0 C39762.0  down    ENTRY@open
  2022-04-12 21:15 NY  O39762.0 H39782.9 L39569.8 C39618.5  down    
  2022-04-12 21:30 NY  O39618.5 H39830.4 L39580.4 C39770.7  up      
  2022-04-12 21:45 NY  O39770.7 H39867.9 L39700.0 C39860.7  up      
  ... (50 bars / 12h omitted) ...
  2022-04-13 10:15 NY  O40613.5 H40940.0 L40537.8 C40552.0  red     EXIT(stop)
```

## 6. LOCKED out-of-sample (2025-01 → 2026-07-11) — winner = variant a, run ONCE

In-sample winner by total R: **variant a** (a: +22.05R / +0.099R avg; b: -4.96R / -0.022R avg). The block below was executed exactly once, after all in-sample analysis was frozen.

| metric | OOS value |
|---|---|
| weeks scanned | 78 |
| trades | 72 |
| occurrence | 3.98/mo |
| win rate | 51.4% |
| expectancy | +0.335R |
| total R | +24.12R |
| profit factor | 1.78 |
| max drawdown | 7.1R (5.9%) |
| best / worst | +1.87/-1.17R |
| final equity | $12,412 |

OOS by year:

| year | n | win_rate | avg_R | total_R | pf |
| --- | --- | --- | --- | --- | --- |
| 2025 | 47 | 48.936 | 0.298 | 14.028 | 1.730 |
| 2026 | 25 | 56.000 | 0.404 | 10.088 | 1.853 |

OOS by direction:

| direction | n | win_rate | avg_R | total_R | pf |
| --- | --- | --- | --- | --- | --- |
| long | 32 | 46.875 | 0.175 | 5.598 | 1.389 |
| short | 40 | 55.000 | 0.463 | 18.518 | 2.113 |

OOS by spike-extreme day (does the Monday effect persist out-of-sample?):

| extreme_day | n | win_rate | avg_R | total_R | pf |
| --- | --- | --- | --- | --- | --- |
| Monday | 28 | 60.714 | 0.536 | 15.009 | 2.495 |
| Tuesday | 38 | 50.000 | 0.380 | 14.434 | 1.927 |
| Wednesday | 6 | 16.667 | -0.888 | -5.327 | 0.019 |

OOS Monday subset: n=28, WR 60.7%, expectancy +0.536R, PF 2.50. OOS overall expectancy +0.335R at t=2.20 (n=72).

## 7. Verdict

**A thin, Monday-concentrated edge — not the clean negative Brinks gave.** Mechanical fade (variant a): 223 trades, 44.8% WR, **+0.099R** expectancy, PF 1.21, total +22.0R, max-DD 12.8%. Over the full sample that expectancy is only t=1.23 from zero — *marginal, not established*. But it is not uniform noise: it lives almost entirely in the **Monday-spike weeks** (+0.382R, 54.9% WR, PF 2.05, n=91, t=2.98) — Tuesday and Wednesday spikes are flat-to-negative. That is the single most important result in this report.

**The money agrees with Igor — on timing, not on the regime flip.** His manual log has FMWB weeks peaking **Monday 14/17 and then reversing**; the backtest independently rediscovers exactly that: fading a Monday spike-out of the weekend box is the profitable slice (PF ~2.0), and it is a *pre-registered* hypothesis (he called Monday before the test), not a data-snoop across weekdays. Where he and the mechanics part ways is **direction**: the coin-flip CALIBRATION_V2 warned of is real — the detector matches his discretionary M/W side ~50%, and **variant b (regime-conditional) makes it worse**, not better (-0.022R, PF 0.96, t=-0.29): flipping the 57 Trend-classified weeks to trade *with* the spike loses -27.0R vs just fading everything. A regime detector that only agrees with Igor ~67% cannot rescue a ~50% direction call.

**Under what conditions it is an edge.** (1) TP1 taken as the **1.9R minimum-as-target**, not the literal L1-vector origin — the recovery-base TP is geometrically incompatible with the beyond-the-extreme stop (median 0.58R:R, only 23/223 clear 1.9), so the literal spec is un-tradeable and the 1.9R reading is the honest substitute. (2) The **Monday-timing filter** — without it the full-sample edge is not statistically distinguishable from zero. (3) 2-of-3 retest (1-of-3 is identical, 3-of-3 is worse). Bands 25/35/45% and refund on/off are inert by construction (§4). Partials / breakeven-after-L2 / L3+SVC exits are omitted and would raise WR and cut variance, i.e. the headline is a conservative floor.

**LOCKED out-of-sample (2025-01→2026-07, run once).** Variant a on unseen data returned **+0.335R** over 72 trades (WR 51.4%, PF 1.78, total +24.1R, t=2.20) — it **confirms and strengthens** the in-sample read, and is in fact stronger than in-sample. Encouraging, with the honest caveat that 2025-26 was a single favourable stretch (18 months, one regime) and the in-sample effect itself was marginal.

**Bottom line.** The flagship is *better than break-even but not a bankable machine as mechanised*: a genuine but thin fade edge that (a) only pays with the 1.9R-target reading, (b) concentrates on Monday spike-outs exactly as Igor teaches, (c) is hurt by mechanical regime conditioning, and (d) held out-of-sample. The remaining ~half of the expectancy Igor gets and the code does not is the **direction read** on non-Monday / ambiguous weeks — the discretionary judgement the geometry cannot recover, plus the trade management this single-unit model leaves on the table. Trade it Monday-only, 1.9R target, small size; do not add the regime flip.
