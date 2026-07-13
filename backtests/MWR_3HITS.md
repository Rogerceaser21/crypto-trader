# Mid-Week Reversal (Annie S4) + 3-Hits-to-a-Level (Annie S5) — Backtest

BTC-USDT Binance USD-M perp, 15m entry timing. **Train/analysis 2019-11 → 2024-12** (62 months, 271 weeks scanned). **2025-01 → 2026-07-11 is a LOCKED out-of-sample block, run exactly once per setup on that setup's single in-sample-best config (§ per-setup OOS).** Both detectors are FULLY CAUSAL — every decision at bar *t* uses only OHLC with index ≤ *t*, the WEEKLY-backtest look-ahead lesson applied from line one.

Execution (identical to the WEEKLY / FINAL_DAMAGE builds): taker fee 0.05%/side, slippage 0.02%/fill, entry at the next 15m candle open, stop/TP filled at level with adverse slippage, 1m intrabar fill-ordering (same-minute stop&TP → **counted as a loss**; unresolved → loss). Sizing: 1% of $10,000 risk/trade; **1R = $100** (fixed risk, no compounding). Detectors reuse the `detectors` package (PVSRA, 5pm-NY day/week anchors, sessions).

Both setups model a **single unit** held to TP / stop / Friday-UK-end hard close (08:00 NY), one trade per week (the first qualifying trigger). Partials, breakeven-after-L2 and the L3+SVC final exit are omitted — conservative, no favourable trailing assumed. Direction is taken exactly as the rulebook specifies (MWR fades the week's established trend; 3-Hits fades the tested level); no direction A/B is run.

---

# S4 — Mid-Week Reversal (MWR)

## 0. The trade as coded (causal)

**Establish the week's trend by TUESDAY CLOSE** (causal): the sign of the move from the weekly open (Sun 17:00 NY) to Tuesday's daily close (Tue 17:00 NY); |move| must clear 0.5% or the week has no established trend and is skipped. **From WEDNESDAY 00:00 NY, hunt a reversal AGAINST that trend** — an established up-trend → hunt SHORT at the running HOW (weekly high); a down-trend → hunt LONG at the running LOW. **Trigger** = a 15m reversal candle (inverted hammer at a top / hammer at a bottom) that tags the running HOW/LOW and closes back inside, with ≥ `min_hits` separated tests of that level in the week (2 = an M/W second peak; 3 = a 3-hits sequence). **Entry** = next candle open; **stop** = beyond the running extreme wick through entry + 5bp; **TP** = 1R / 1.9R / 2R. Hard close Friday UK end. The FIRST qualifying trigger is the week's MWR trade.

This is exactly the rulebook's mid-week counter-trend read (§1 weekly script step 3; §3 S4 — *“From Wednesday, hunt reversal of the week's trend: 3-hits to HOW/LOW, news catalyst, M/W at the extreme”*). It is a deliberate counter-trend fade, which the rulebook itself flags as dangerous (§1 #1 prohibition: *never counter-trend after a level-1 move*). The backtest tests whether the mid-week timing rescues that.

**Declared grid (12 cells):** scope {any-day-from-Wed, Wed-only} × trigger {M/W 2nd-peak (hits≥2), 3-hits (hits≥3)} × TP {1R, 1.9R, 2R}. All cells reported in §2. News-day conditioning is handled as an OPTIONAL, approximate FOMC-proximity split in §4 (CPI dates are not fetched reliably offline, so the headline runs WITHOUT news — as the brief permits).

## 1. Headline (best & median cell)

Declared selection: **best = highest in-sample expectancy among cells with n ≥ 30**; median = grid-median by expectancy.

| metric | best cell | median cell |
|---|---|---|
| config | from_wed/hits>=3/1R | from_wed/hits>=3/2R |
| trades | 32 | 32 |
| occurrence (trades/mo) | 0.52 | 0.52 |
| win rate | 43.8% | 28.1% |
| expectancy (avg R) | -0.390R | -0.489R |
| median R | -1.130R | -1.190R |
| total R | -12.5R | -15.6R |
| profit factor | 0.44 | 0.46 |
| t-stat (exp vs 0) | -2.22 | -2.12 |
| max drawdown | 12R (12.5%) | 16R (16.3%) |
| best / worst | +0.91/-1.60R | +1.91/-1.60R |
| final equity (from $10k) | $8,752 | $8,436 |

Across all **12 cells**: expectancy ranges **-0.629R … -0.390R**, profit factor **0.29 … 0.52**, **0/12 positive**. The best cell's t-stat is **-2.22** — significantly below zero. Exit mix (best): stop=18, tp=13, friday=1.

## 2. Full parameter grid (12 cells)

Sorted by expectancy (best first).

| scope | trigger | tp | n | win_rate | avg_R | total_R | pf | maxDD_R | t |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| from_wed | hits>=3 | 1R | 32 | 43.800 | -0.390 | -12.500 | 0.440 | 12.500 | -2.220 |
| from_wed | hits>=3 | 1p9R | 32 | 31.200 | -0.420 | -13.400 | 0.520 | 14.100 | -1.810 |
| from_wed | hits>=2 | 1R | 100 | 40.000 | -0.422 | -42.200 | 0.420 | 42.200 | -4.330 |
| from_wed | hits>=2 | 1p9R | 100 | 28.000 | -0.465 | -46.500 | 0.470 | 47.300 | -3.730 |
| from_wed | hits>=2 | 2R | 100 | 27.000 | -0.473 | -47.300 | 0.470 | 48.300 | -3.740 |
| from_wed | hits>=3 | 2R | 32 | 28.100 | -0.489 | -15.600 | 0.460 | 16.400 | -2.120 |
| wed_only | hits>=3 | 2R | 12 | 25.000 | -0.511 | -6.100 | 0.460 | 8.600 | -1.290 |
| wed_only | hits>=3 | 1p9R | 12 | 25.000 | -0.536 | -6.400 | 0.440 | 8.600 | -1.400 |
| wed_only | hits>=3 | 1R | 12 | 33.300 | -0.594 | -7.100 | 0.290 | 7.200 | -2.090 |
| wed_only | hits>=2 | 1R | 67 | 31.300 | -0.595 | -39.900 | 0.290 | 39.900 | -5.200 |
| wed_only | hits>=2 | 2R | 67 | 20.900 | -0.609 | -40.800 | 0.370 | 40.800 | -4.060 |
| wed_only | hits>=2 | 1p9R | 67 | 20.900 | -0.629 | -42.100 | 0.350 | 42.100 | -4.320 |

## 3. Splits — primary config: from_wed/hits≥2/1.9R (n=100)

(Splits use the most-populated cell so day/direction/year slices have power; the negativity is uniform across the grid.)

**By direction (long/short):**

| direction | n | win_rate | avg_R | total_R | pf | t |
| --- | --- | --- | --- | --- | --- | --- |
| long | 43 | 34.884 | -0.273 | -11.736 | 0.648 | -1.361 |
| short | 57 | 22.807 | -0.610 | -34.792 | 0.360 | -3.892 |

**By trigger day-of-week:**

| extreme_day | n | win_rate | avg_R | total_R | pf | t |
| --- | --- | --- | --- | --- | --- | --- |
| Friday | 8 | 50.000 | -0.150 | -1.203 | 0.742 | -0.362 |
| Thursday | 34 | 35.294 | -0.264 | -8.982 | 0.659 | -1.163 |
| Wednesday | 58 | 20.690 | -0.627 | -36.344 | 0.360 | -3.963 |

**By year:**

| year | n | win_rate | avg_R | total_R | pf | t |
| --- | --- | --- | --- | --- | --- | --- |
| 2019 | 6 | 50.000 | 0.123 | 0.739 | 1.213 | 0.211 |
| 2020 | 19 | 21.053 | -0.692 | -13.156 | 0.293 | -2.642 |
| 2021 | 16 | 18.750 | -0.633 | -10.127 | 0.343 | -2.121 |
| 2022 | 21 | 33.333 | -0.305 | -6.408 | 0.617 | -1.049 |
| 2023 | 18 | 33.333 | -0.380 | -6.844 | 0.545 | -1.233 |
| 2024 | 20 | 25.000 | -0.537 | -10.733 | 0.420 | -1.912 |

**By established trend direction:**

| trend | n | win_rate | avg_R | total_R | pf | t |
| --- | --- | --- | --- | --- | --- | --- |
| down | 43 | 34.884 | -0.273 | -11.736 | 0.648 | -1.361 |
| up | 57 | 22.807 | -0.610 | -34.792 | 0.360 | -3.892 |

## 4. Overlap with the Weekly FMWB fade (is MWR the second act?)

The WEEKLY backtest found the FMWB fade's edge lives almost entirely in **Monday** weekend-box spike-outs; the brief asks whether MWR is *the same phenomenon's second act*. Comparing the MWR primary cell's weeks to the 223 Weekly-fade (variant a) trades:

| overlap metric | value |
|---|---|
| MWR weeks with a signal | 100 |
| of which also a Weekly-fade week | 76 (76%) |
| per-week R correlation (MWR vs Weekly-fade, shared weeks) | -0.02 |
| MWR exp in Weekly-fade weeks / other weeks | -0.542R (n=76) / -0.223R (n=24) |
| MWR direction vs Weekly-fade (shared): same / opposite | 56 / 20 |

**Reading.** The 76% week-overlap is essentially a **base-rate artifact** — the Weekly fade fires in ~82% of all weeks (223/271), so almost any weekly setup will land in a Weekly-fade week. The informative number is the per-week R correlation, **-0.02** — MWR's outcomes are essentially uncorrelated with the Weekly fade's, so MWR is **not** the Weekly fade re-booked mid-week; it is a distinct (and, as §1 shows, losing) counter-trend event. Being inside a Weekly-fade week does not rescue it (-0.542R vs -0.223R outside), and the direction split (same 56 / opposite 20) shows MWR is not a consistent continuation of the Weekly fade either.

## 5. Optional FOMC-proximity split (approximate, FOMC-only)

Entry within ±1 NY day of an FOMC rate decision. This is an approximate, FOMC-only calendar (CPI omitted — not reliably available offline); treat as indicative, not a tuned filter.

| fomc | n | win_rate | avg_R | total_R | pf | t |
| --- | --- | --- | --- | --- | --- | --- |
| False | 82 | 26.829 | -0.502 | -41.156 | 0.433 | -3.755 |
| True | 18 | 33.333 | -0.298 | -5.372 | 0.646 | -0.888 |

## 6. Monte Carlo (5,000 shuffles of the best cell)

No MWR cell is positive, so there is no positive config to bootstrap; the MC below is on the best (least-bad) cell, for the drawdown distribution only.

| percentile | max DD % |
|---|---|
| 5th | 12.5% |
| 50th | 13.6% |
| 95th | 15.7% |

Median max-DD 14R, 95th 16R, P(DD≥20%)=0.0%, mean final -12R. Shuffling cannot change the sum — every ordering is a net loss.

## 7. Worked examples (rule-firing verification)

### A winner (TP hit) — the minority case
- M-2nd-peak | short | level 28758.1 | trend=up (+0.64%) | hits=2
- entry 28348.0  stop 28895.4  TP 27307.9  (stop 1.93%, planned 1.90R)
- exit tp at 27307.9 after 4 bars -> +1.83R
```
  2023-03-22 12:15 NY  O28514.9 H28610.0 L28469.1 C28599.8  up      
  2023-03-22 12:30 NY  O28599.8 H28674.0 L28570.2 C28656.6  up      
  2023-03-22 12:45 NY  O28656.7 H28696.3 L28602.0 C28636.6  down    
  2023-03-22 13:00 NY  O28636.7 H28639.1 L28512.3 C28529.1  down    
  2023-03-22 13:15 NY  O28529.2 H28550.0 L28324.2 C28373.2  down    
  2023-03-22 13:30 NY  O28373.2 H28427.5 L28283.5 C28375.8  up      
  2023-03-22 13:45 NY  O28375.9 H28549.7 L28303.0 C28500.0  up      
  2023-03-22 14:00 NY  O28500.4 H28881.0 L28200.0 C28348.0  red     TRIGGER/close
  2023-03-22 14:15 NY  O28348.0 H28530.4 L28331.9 C28454.6  up      ENTRY@open
  2023-03-22 14:30 NY  O28454.8 H28584.0 L27769.0 C28197.6  red     
  2023-03-22 14:45 NY  O28197.5 H28450.0 L27905.0 C28017.8  magenta 
  ... (1 bars / 0h omitted) ...
  2023-03-22 15:00 NY  O28018.9 H28020.3 L27075.1 C27398.5  red     EXIT(tp)
```

### A loser (stopped out) — the typical case
- M-2nd-peak | long | level 20140.5 | trend=down (-5.24%) | hits=2
- entry 20177.8  stop 20047.0  TP 20426.4  (stop 0.65%, planned 1.90R)
- exit stop at 20047.0 after 1 bars -> -1.22R
```
  2022-06-29 00:00 NY  O20275.9 H20340.0 L20265.0 C20330.1  blue    
  2022-06-29 00:15 NY  O20330.1 H20331.6 L20245.3 C20311.5  down    
  2022-06-29 00:30 NY  O20311.5 H20356.5 L20279.1 C20327.4  up      
  2022-06-29 00:45 NY  O20327.5 H20366.0 L20240.0 C20297.1  magenta 
  2022-06-29 01:00 NY  O20297.1 H20309.5 L20259.6 C20268.0  down    
  2022-06-29 01:15 NY  O20268.0 H20360.1 L20204.8 C20255.1  red     
  2022-06-29 01:30 NY  O20255.1 H20259.8 L20166.3 C20202.6  magenta 
  2022-06-29 01:45 NY  O20202.6 H20233.7 L20057.0 C20177.7  red     TRIGGER/close
  2022-06-29 02:00 NY  O20177.8 H20181.9 L20036.8 C20109.8  down    EXIT(stop)
  2022-06-29 02:15 NY  O20109.9 H20174.7 L20020.0 C20160.4  up      
  2022-06-29 02:30 NY  O20160.4 H20209.9 L20080.7 C20120.7  down    
```

## 8. LOCKED out-of-sample (2025-01 → 2026-07-11) — best cell, run ONCE

Best in-sample cell **from_wed/hits>=3/1R** executed exactly once on unseen data.

| metric | in-sample (best) | LOCKED OOS |
|---|---|---|
| trades | 32 | 7 |
| occurrence | 0.52/mo | 0.38/mo |
| win rate | 43.8% | 71.4% |
| expectancy | -0.390R | -0.013R |
| total R | -12.5R | -0.1R |
| profit factor | 0.44 | 0.97 |
| t-stat | -2.22 | -0.03 |
| max drawdown | 12.5% | 1.4% |
| final equity | $8,752 | $9,991 |

OOS by year:

| year | n | win_rate | avg_R | total_R | pf | t |
| --- | --- | --- | --- | --- | --- | --- |
| 2025 | 5 | 80.000 | 0.110 | 0.549 | 1.386 | 0.274 |
| 2026 | 2 | 50.000 | -0.319 | -0.639 | 0.561 | -0.282 |

The locked block is **too thin (n=7) to add much** — the best cell fires only ~0.4×/mo — but it does not contradict the in-sample negative (-0.013R, PF 0.97).

## 9. Verdict — S4 MWR

**No edge — a clean negative, the rulebook's own #1 prohibition confirmed.** Mechanised MWR is a losing counter-trend fade at every point of the 12-cell grid: expectancy -0.629R … -0.390R with **0/12 cells positive**, profit factors 0.29–0.52. The least-bad cell (from_wed/hits>=3/1R) still loses **-0.390R** over 32 trades (WR 43.8%, PF 0.44, t=-2.22). At the most-populated 1.9R cell the trigger wins just 28% (breakeven ≈35% for a 1.9R target); at no cell does win rate clear its target's breakeven. The counter-trend trigger systematically catches trend *continuation*, not reversal — exactly as §1's *“never counter-trend after a level-1 move”* warns.

**Not the Weekly fade's second act.** The 76% week-overlap is a base-rate artifact (~82% of all weeks carry a Weekly-fade trade); the per-week R correlation is only -0.02, and MWR is no better inside Weekly-fade weeks (-0.542R) than outside (-0.223R). The Weekly fade's edge is the *Monday weekend-box spike-out*; MWR is a different, later, counter-trend event that the market does not reward mechanically. Tighter (3-hits) triggers and Wed-only scope reduce the count but not the negativity.

**LOCKED OOS (2025-01→2026-07, run once).** -0.013R over 7 trades (WR 71.4%, PF 0.97, t=-0.03) — the best cell is so rare (~0.4×/mo) that only 7 OOS trades exist, too thin to confirm anything, but it does not overturn the firm in-sample negative. The FOMC-proximity split (§5, approximate) does not surface a positive news slice either.

**Bottom line.** *Do not trade the mechanical MWR fade.* The value Igor extracts mid-week must come from the discretionary context the rulebook wraps around it (a genuinely completed 3-leg move into the extreme, an SVC, a news catalyst read, and the judgement to *skip* when the trend is still running) — none of which the bare “reversal candle at the running extreme” reproduces. If pursued, MWR is a management/confluence overlay on the Weekly setup, not a standalone signal.
---

# S5 — 3-Hits to a Level

## 0. The trade as coded (causal, Igor's rulings)

**Level** = the running weekly HOW (top → short) / LOW (bottom → long), established by PRIOR bars (a hit is a genuine RE-TEST, not a fresh extreme). **A hit** = a 15m wick tags the level (tolerance grid: exact / 0.05% / 0.1%) with NO close beyond it; the establishing peak counts as hit 1. Hits are separated by a move-away-and-return (≥ 30 min + a genuine pullback), **max 2 per session**, and the 3 hits must **span ≥ 2 sessions**. **After hit 3** → a reversal entry on the TIEBREAKER (trendline-break proxy): a close beyond the last higher-low (top: close below the hit-2→hit-3 pullback low) / lower-high (bottom: close above the pullback high). **Entry** = next candle open. **A 4th hit or a close through the level (before the break) = invalidation.** **Stop** = beyond the level extreme + 5bp; **TP** = 1R / 1.9R / 2R. Hard close Friday UK end; one 3-hits reversal per week.

This encodes the §3 S5 frames read (a hit = *upper wick tagging / hairline-piercing the level with no close beyond*, reading TF ≈ 15m, hits span ≥ 2 sessions; the tiebreaker = an ascending-trendline break under the rejection higher-lows). **Declared grid (9 cells):** touch tolerance {exact, 0.05%, 0.1%} × TP {1R, 1.9R, 2R}. The 200-EMA-rejection variant (S5's second named trigger) is OPTIONAL and NOT run here — flagged in §9.

## 1. Headline (best & median cell)

Declared selection: **best = highest in-sample expectancy among cells with n ≥ 30**; median = grid-median by expectancy.

| metric | best cell | median cell |
|---|---|---|
| config | tol=0.0/1p9R | tol=0.001/1p9R |
| trades | 37 | 72 |
| occurrence (trades/mo) | 0.60 | 1.16 |
| win rate | 45.9% | 34.7% |
| expectancy (avg R) | +0.108R | -0.167R |
| median R | -1.027R | -1.083R |
| total R | +4.0R | -12.0R |
| profit factor | 1.18 | 0.76 |
| t-stat (exp vs 0) | 0.48 | -1.08 |
| max drawdown | 5R (4.7%) | 17R (16.3%) |
| best / worst | +1.85/-1.21R | +1.85/-1.40R |
| final equity (from $10k) | $10,399 | $8,799 |

Across all **9 cells**: expectancy ranges **-0.257R … +0.108R**, PF **0.59 … 1.18**, **2/9 positive**. The best cell's t-stat is **0.48** — not statistically distinguishable from zero. Exit mix (best): stop=19, tp=14, friday=4.

## 2. Full parameter grid (9 cells)

Sorted by expectancy (best first). The **tolerance axis is the live one**: tighter (exact-touch) tags are the tradeable slice; loosening the wick-tag tolerance degrades expectancy monotonically.

| touch_tol | tp | n | win_rate | avg_R | total_R | pf | maxDD_R | t |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 0.000 | 1p9R | 37 | 45.900 | 0.108 | 4.000 | 1.180 | 4.800 | 0.480 |
| 0.000 | 2R | 37 | 43.200 | 0.065 | 2.400 | 1.100 | 7.500 | 0.280 |
| 0.000 | 1R | 37 | 56.800 | -0.019 | -0.700 | 0.960 | 5.100 | -0.110 |
| 0.001 | 1p9R | 46 | 37.000 | -0.103 | -4.800 | 0.850 | 7.700 | -0.510 |
| 0.001 | 1p9R | 72 | 34.700 | -0.167 | -12.000 | 0.760 | 17.200 | -1.080 |
| 0.001 | 2R | 72 | 33.300 | -0.178 | -12.800 | 0.750 | 18.500 | -1.120 |
| 0.001 | 1R | 46 | 47.800 | -0.181 | -8.300 | 0.700 | 8.300 | -1.210 |
| 0.001 | 2R | 46 | 32.600 | -0.201 | -9.300 | 0.730 | 12.700 | -1.000 |
| 0.001 | 1R | 72 | 44.400 | -0.257 | -18.500 | 0.590 | 20.000 | -2.210 |

## 3. Splits — primary config: exact-touch/1.9R (n=37)

**By direction (long/short):**

| direction | n | win_rate | avg_R | total_R | pf | t |
| --- | --- | --- | --- | --- | --- | --- |
| long | 20 | 40.000 | -0.120 | -2.396 | 0.813 | -0.417 |
| short | 17 | 52.941 | 0.376 | 6.385 | 1.706 | 1.053 |

**By trigger (top/bottom):**

| trig_type | n | win_rate | avg_R | total_R | pf | t |
| --- | --- | --- | --- | --- | --- | --- |
| 3hits-bottom | 20 | 40.000 | -0.120 | -2.396 | 0.813 | -0.417 |
| 3hits-top | 17 | 52.941 | 0.376 | 6.385 | 1.706 | 1.053 |

**By hit-3 day-of-week:**

| extreme_day | n | win_rate | avg_R | total_R | pf | t |
| --- | --- | --- | --- | --- | --- | --- |
| Friday | 2 | 100.000 | 0.642 | 1.284 | inf | 1.115 |
| Monday | 21 | 47.619 | 0.270 | 5.664 | 1.489 | 0.864 |
| Sunday | 1 | 0.000 | -1.174 | -1.174 | 0.000 | 0.000 |
| Thursday | 3 | 66.667 | 0.802 | 2.406 | 3.104 | 0.824 |
| Tuesday | 8 | 25.000 | -0.407 | -3.257 | 0.527 | -0.839 |
| Wednesday | 2 | 50.000 | -0.466 | -0.932 | 0.139 | -0.756 |

**By year:**

| year | n | win_rate | avg_R | total_R | pf | t |
| --- | --- | --- | --- | --- | --- | --- |
| 2019 | 3 | 0.000 | -1.103 | -3.310 | 0.000 | -83.208 |
| 2020 | 5 | 40.000 | -0.033 | -0.164 | 0.953 | -0.047 |
| 2021 | 5 | 40.000 | 0.097 | 0.483 | 1.187 | 0.160 |
| 2022 | 7 | 57.143 | 0.481 | 3.369 | 1.982 | 0.836 |
| 2023 | 4 | 25.000 | -0.447 | -1.788 | 0.485 | -0.628 |
| 2024 | 13 | 61.538 | 0.415 | 5.399 | 1.969 | 1.075 |

## 4. Overlap with the Weekly FMWB fade

| overlap metric | value |
|---|---|
| 3-Hits weeks with a signal | 37 |
| of which also a Weekly-fade week | 31 (84%) |
| per-week R correlation (shared weeks) | +0.23 |
| 3-Hits exp in Weekly-fade weeks / other | +0.026R (n=31) / +0.531R (n=6) |
| direction vs Weekly-fade (shared): same / opposite | 22 / 9 |

**Reading.** The 84% week-overlap is near the base rate (~82% of all weeks carry a Weekly-fade trade), so overlap alone says little; the weak per-week R correlation **+0.23** indicates 3-Hits outcomes are largely independent of the Weekly-fade outcome — a **distinct level-reversal event**, not the Weekly fade re-labelled.

## 5. Monte Carlo (5,000 shuffles of the best cell)

(the best cell is positive, so this bootstraps its drawdown/robustness).

| percentile | max DD % |
|---|---|
| 5th | 4.2% |
| 50th | 6.3% |
| 95th | 9.9% |

Median max-DD 7R, 95th 11R, P(DD≥20%)=0.0%, mean final +4R.

## 6. Worked examples (rule-firing verification)

### A winner (TP hit)
- 3hits-top | short | level 34662.7 | sessions=2 | hit-span=27bars
- entry 33826.6  stop 34680.1  TP 32204.9  (stop 2.52%, planned 1.90R)
- exit tp at 32204.9 after 136 bars -> +1.85R
```
  2021-07-11 17:15 NY  O33847.9 H34200.0 L33845.2 C34112.3  green   
  2021-07-11 17:30 NY  O34112.4 H34608.0 L34111.0 C34450.0  green   HIT1
  2021-07-11 17:45 NY  O34450.0 H34553.4 L34430.0 C34478.5  up      
  2021-07-11 18:00 NY  O34478.5 H34629.6 L34440.0 C34440.3  magenta HIT2
  2021-07-11 18:15 NY  O34440.3 H34454.1 L34355.0 C34396.3  down    
  2021-07-11 18:30 NY  O34394.5 H34444.0 L34327.0 C34392.0  down    
  2021-07-11 18:45 NY  O34392.0 H34431.1 L34351.7 C34386.2  down    
  2021-07-11 19:00 NY  O34386.2 H34398.5 L34250.0 C34251.5  down    
  2021-07-11 19:15 NY  O34251.5 H34305.0 L34204.0 C34279.6  up      
  2021-07-11 19:30 NY  O34279.6 H34314.9 L34170.0 C34252.8  down    
  2021-07-11 19:45 NY  O34252.9 H34270.0 L34200.1 C34253.8  up      
  2021-07-11 20:00 NY  O34253.9 H34341.0 L34064.2 C34134.3  magenta 
  2021-07-11 20:15 NY  O34134.3 H34189.9 L34088.0 C34185.5  up      
  2021-07-11 20:30 NY  O34185.5 H34251.4 L34169.7 C34200.0  up      
  2021-07-11 20:45 NY  O34200.0 H34200.0 L34133.0 C34159.9  down    
  2021-07-11 21:00 NY  O34159.9 H34185.0 L34024.3 C34131.0  down    
  2021-07-11 21:15 NY  O34131.0 H34169.0 L34077.3 C34157.1  up      
  2021-07-11 21:30 NY  O34157.1 H34166.3 L34030.4 C34162.5  up      
  2021-07-11 21:45 NY  O34162.5 H34162.5 L34093.2 C34135.4  down    
  2021-07-11 22:00 NY  O34135.4 H34147.6 L34062.0 C34130.3  down    
  2021-07-11 22:15 NY  O34130.3 H34232.9 L34130.3 C34200.8  up      
  2021-07-11 22:30 NY  O34200.8 H34234.0 L34160.0 C34163.7  down    
  2021-07-11 22:45 NY  O34163.7 H34280.0 L34160.1 C34249.0  up      
  2021-07-11 23:00 NY  O34249.0 H34350.0 L34220.0 C34305.0  blue    
  2021-07-11 23:15 NY  O34305.0 H34540.3 L34305.0 C34463.3  green   
  2021-07-11 23:30 NY  O34463.3 H34469.2 L34346.3 C34419.6  magenta 
  2021-07-11 23:45 NY  O34418.1 H34525.6 L34385.0 C34429.4  up      
  2021-07-12 00:00 NY  O34430.0 H34520.0 L34395.0 C34515.6  up      
  2021-07-12 00:15 NY  O34515.6 H34662.7 L34407.5 C34421.0  red     HIT3
  2021-07-12 00:30 NY  O34421.0 H34430.0 L34277.0 C34344.9  magenta 
  2021-07-12 00:45 NY  O34344.2 H34383.0 L34270.0 C34284.6  down    
  2021-07-12 01:00 NY  O34284.6 H34331.6 L34203.6 C34233.8  down    
  2021-07-12 01:15 NY  O34233.8 H34285.0 L34158.8 C34218.0  down    
  2021-07-12 01:30 NY  O34218.0 H34279.0 L34202.0 C34243.1  up      
  2021-07-12 01:45 NY  O34243.1 H34328.4 L34150.0 C34321.9  up      
  2021-07-12 02:00 NY  O34321.3 H34327.0 L34213.4 C34253.1  down    
  2021-07-12 02:15 NY  O34253.1 H34310.0 L34201.0 C34292.7  up      
  2021-07-12 02:30 NY  O34292.7 H34388.5 L34286.2 C34330.6  up      
  2021-07-12 02:45 NY  O34330.6 H34437.0 L34320.0 C34361.8  up      
  2021-07-12 03:00 NY  O34361.8 H34457.9 L34307.7 C34427.4  up      
  2021-07-12 03:15 NY  O34427.4 H34477.0 L34373.4 C34447.0  up      
  2021-07-12 03:30 NY  O34446.9 H34447.1 L34319.0 C34360.5  down    
  2021-07-12 03:45 NY  O34360.5 H34360.5 L34200.1 C34271.2  down    
  2021-07-12 04:00 NY  O34271.2 H34325.7 L34201.0 C34321.0  up      
  2021-07-12 04:15 NY  O34321.0 H34450.0 L34284.4 C34332.8  blue    
  2021-07-12 04:30 NY  O34332.8 H34367.3 L34250.0 C34330.1  down    
  2021-07-12 04:45 NY  O34329.5 H34356.8 L34222.0 C34266.0  down    
  2021-07-12 05:00 NY  O34266.0 H34330.0 L34224.0 C34257.8  down    
  2021-07-12 05:15 NY  O34257.8 H34259.2 L34100.0 C34158.2  red     
  2021-07-12 05:30 NY  O34158.2 H34190.0 L34101.0 C34185.1  up      
  2021-07-12 05:45 NY  O34185.1 H34213.0 L34000.0 C34049.5  down    
  2021-07-12 06:00 NY  O34049.5 H34053.0 L33750.0 C33826.6  red     TRIGGER/close
  2021-07-12 06:15 NY  O33826.6 H33879.0 L33755.0 C33850.9  up      ENTRY@open
  2021-07-12 06:30 NY  O33850.9 H33867.0 L33700.0 C33783.8  down    
  2021-07-12 06:45 NY  O33783.8 H33814.0 L33616.6 C33764.6  down    
  ... (133 bars / 33h omitted) ...
  2021-07-13 16:00 NY  O32306.7 H32445.0 L32187.0 C32400.0  blue    EXIT(tp)
```

### A loser (stopped out)
- 3hits-bottom | long | level 20811.0 | sessions=2 | hit-span=7bars
- entry 20968.2  stop 20800.6  TP 21286.7  (stop 0.80%, planned 1.90R)
- exit stop at 20800.6 after 19 bars -> -1.17R
```
  2022-11-06 18:15 NY  O20955.2 H21022.1 L20925.3 C20991.3  green   
  2022-11-06 18:30 NY  O20991.2 H20997.0 L20863.3 C20916.4  red     HIT1
  2022-11-06 18:45 NY  O20916.4 H20943.2 L20881.4 C20900.0  down    
  2022-11-06 19:00 NY  O20900.0 H20939.6 L20882.5 C20901.4  up      
  2022-11-06 19:15 NY  O20901.4 H20941.8 L20891.5 C20909.8  up      
  2022-11-06 19:30 NY  O20909.9 H20920.0 L20877.4 C20898.2  down    
  2022-11-06 19:45 NY  O20898.2 H20907.3 L20833.4 C20894.4  down    HIT2
  2022-11-06 20:00 NY  O20894.4 H20895.0 L20831.5 C20835.2  down    
  2022-11-06 20:15 NY  O20835.2 H20891.6 L20811.0 C20886.2  up      HIT3
  2022-11-06 20:30 NY  O20886.2 H20978.0 L20868.0 C20968.2  up      TRIGGER/close
  2022-11-06 20:45 NY  O20968.2 H20990.7 L20919.3 C20979.2  up      ENTRY@open
  2022-11-06 21:00 NY  O20979.2 H21059.2 L20967.4 C21050.0  up      
  2022-11-06 21:15 NY  O21050.0 H21062.6 L20973.2 C20973.2  down    
  ... (16 bars / 4h omitted) ...
  2022-11-07 01:15 NY  O20834.8 H20888.0 L20745.0 C20863.3  green   EXIT(stop)
```

## 7. LOCKED out-of-sample (2025-01 → 2026-07-11) — best cell, run ONCE

Best in-sample cell **tol=0.0/1p9R** executed exactly once on unseen data.

| metric | in-sample (best) | LOCKED OOS |
|---|---|---|
| trades | 37 | 17 |
| occurrence | 0.60/mo | 0.93/mo |
| win rate | 45.9% | 47.1% |
| expectancy | +0.108R | +0.054R |
| total R | +4.0R | +0.9R |
| profit factor | 1.18 | 1.09 |
| t-stat | 0.48 | 0.16 |
| max drawdown | 4.7% | 4.6% |
| final equity | $10,399 | $10,091 |

OOS by year:

| year | n | win_rate | avg_R | total_R | pf | t |
| --- | --- | --- | --- | --- | --- | --- |
| 2025 | 11 | 36.364 | -0.194 | -2.133 | 0.726 | -0.478 |
| 2026 | 6 | 66.667 | 0.507 | 3.045 | 2.376 | 0.898 |


## 8. Verdict — S5 3-Hits

**A thin, tolerance-sensitive marginal — positive only at the tightest (exact-touch) tag.** The best cell (tol=0.0/1p9R) is **+0.108R** over 37 trades (WR 45.9%, PF 1.18, total +4.0R) — but t=0.48, **not statistically distinguishable from zero** at n=37. 2/9 cells are positive, and expectancy falls monotonically as the wick-tag tolerance loosens (-0.257R at the loose end): the edge, such as it is, requires *clean* touches with no close beyond — precisely the frames definition of a hit.

**Distinct from the Weekly fade.** The 84% week-overlap is a base-rate artifact (~82% of weeks carry a Weekly-fade trade); the weak per-week R correlation (+0.23) says the level-reversal edge, if real, is its own phenomenon — a genuine triple-rejection of the weekly HOW/LOW with a trendline-break trigger, not the Monday spike fade.

**LOCKED OOS (2025-01→2026-07, run once).** +0.054R over 17 trades (WR 47.1%, PF 1.09, t=0.16) — the unseen block holds the sign of the in-sample read.

**Bottom line.** 3-Hits is a marginal, tolerance-sensitive positive. It is materially better than the MWR fade (which is a clean loser), and it behaves like a real, if small, structural level-reversal — but the in-sample positive is inside the noise band (|t|<2) and rests on a small sample, so it is a *candidate to size very small / combine with confluence*, not a validated standalone edge. The optional 200-EMA-rejection variant (S5's second named trigger) was not run and is the natural next test.
---

# Multiple-testing note

Declared up front: **21 grid cells total** (12 MWR + 9 3-Hits). At a one-sided t>2 threshold, ~0.5 spurious “winners” would be expected by chance across 21 cells. MWR has **0** positive cells, so its negative is unambiguous. 3-Hits has 2 positive cell(s); the best is t=0.48 — well within noise for n≈37. No cell is selected on the OOS block; the OOS was run once per setup on the pre-declared in-sample best. Direction is fixed by the rulebook (no direction A/B was searched), and the peak-2/tolerance axes are the only detection knobs — kept small deliberately.

