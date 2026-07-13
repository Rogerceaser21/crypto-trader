# Backflip Swing (Annie S6) as a portfolio layer over the Weekly Monday fade — Backtest

BTC-USDT Binance USD-M perp, 15m timing. The base is the ONE validated signal — the **Weekly Monday-spike FADE** (bt_weekly variant a, TP=1.9R fixed, `extreme_day==Monday`; re-run causally from the detector, not read from stale CSVs). The layer is Annie's S6 **backflip**: when the faded move's leg sequence completes and a stopping candle prints, open a starter in the OPPOSITE direction and (on a second-peak confirmation) flip fully. **Train 2019-11 → 2024-12** (271 weeks; 91 Monday base trades). **2025-01 → 2026-07-11 is a LOCKED out-of-sample block, run once on the best config (§6).**

Costs identical to every sibling build: taker 0.05%/side, slippage 0.02%/fill, entry at next 15m open, stop/TP at level with adverse slippage, 1m intrabar fill-ordering (same-minute stop&TP → **loss**). 1R = $100 (1% of $10k, fixed risk). Everything below is **fully causal** — every flip decision at bar *t* uses only OHLC ≤ *t*.

## 0. The layer as coded (causal)

For each Monday-fade base trade, while it runs: (1) watch the faded move's **leg sequence complete** — 3 levels counted on 15m by the causal `levels.count_levels` from the L1 break, **OR** the base hitting its 1.9R target; (2) require an **SVC-class stopping candle** on the completion side (body<wick, PVSRA ≥150% high-volume; an **engulfing** candle also qualifies on this sub-1H timeframe, per Igor's SVC ruling). At that bar, open a **starter in the OPPOSITE direction** (a base short → flip long; a base long → flip short — i.e. *with* the original Monday spike, betting the exhausted trend reverses). Starter size = **25% of the base trade's position size** (Igor ruling 7: $10k → $2.5k, not 25% of a risk unit). On the **second-peak confirmation** (a close-confirmed higher-low for a long flip / lower-high for a short flip forming after the SVC) → **full flip**: close the base remainder if still open, and scale the flip to full 1%-risk size. Flip **stop beyond the completion extreme** (rulebook), flip **TP 1.9R**, hard close Friday UK end. Config **C** replaces the 25%→full sizing with a **33%×3 ladder** (three equal 0.33×base tranches at the SVC, the second peak, and a third continuation). The **weekend-trap** A/B closes the whole system at Friday UK *open* (02:00 NY) instead of UK end when ≥2 levels are done.

**Direction is the crux.** The flip is a *counter-trend reversal* entered **after** three legs — structurally the same bet as MWR / 3-Hits, which already backtested negative-to-marginal. Whether the SVC + second-peak confirmation rescues that is the whole question.

## 1. A vs B vs C — headline (in-sample, per-week portfolio R over the 91 Monday weeks)

| metric | A: base alone | B: +backflip 25% | C: +33%×3 ladder |
|---|---|---|---|
| weeks (base trades) | 91 | 91 | 91 |
| flip legs fired | — | 64 | 64 |
| win rate (portfolio wk) | 54.9% | 51.6% | 53.8% |
| expectancy (avg R/wk) | +0.382R | +0.234R | +0.236R |
| total R | +34.76R | +21.33R | +21.49R |
| profit factor | 2.05 | 1.54 | 1.63 |
| max drawdown | 4.6R (4.1%) | 5.9R (5.2%) | 4.5R (4.3%) |
| best / worst wk | +1.89/-1.25 | +2.16/-1.90 | +2.01/-1.94 |
| t-stat (exp vs 0) | 2.98 | 1.80 | 2.01 |
| final equity | $13,476 | $12,133 | $12,149 |

**The layer subtracts money.** Base alone is **+34.76R** (exp +0.382R, PF 2.05); adding the backflip drops the portfolio to **+21.33R** (B) / **+21.49R** (C) — roughly **13R of the validated edge burned**. Expectancy falls from +0.382R to +0.234R and PF from 2.05 to 1.54. Every layered config underperforms base-alone.

## 2. Per-leg attribution (config B, 25% starter)

| leg | total R | note |
|---|---|---|
| base legs (natural, no early close) | +34.76R | the validated Monday fade |
| base legs (as run in B, force-closed at full flip) | +33.99R | early close costs -0.77R |
| flip starter (P1, 25%) | -4.24R | |
| flip add (P2, scale-to-full) | -8.42R | the *full flip* bleeds most |
| **flip legs total** | **-12.66R** | |
| **portfolio B total** | **+21.33R** | base-in-B +33.99 + flip -12.66 |

Both flip legs lose; the **P2 add is worse than the P1 starter** — scaling *into* the reversal at full size is the single most damaging action. Force-closing the base at the full-flip bar also gives back a little of the base edge (-0.77R).

## 3. Flip legs alone (config B) — is the reversal bet real?

| metric | flip legs (fired weeks) |
|---|---|
| flip legs | 64 |
| win rate | 21.9% |
| expectancy | -0.198R |
| total R | -12.66R |
| profit factor | 0.40 |
| t-stat | -2.23 |
| exit mix | stop=49, tp=11, friday=4 |

**21.9% win rate at a 1.9R target** (breakeven ≈35%) — the flip is a clean loser, 49 of 64 stopping out. This is the MWR/3-Hits counter-trend result again: a late reversal bet after three legs is *not* rewarded mechanically. The SVC + second-peak confirmation does not rescue it.

**By flip direction:**

| flip_dir | n | win_rate | avg_R | total_R | pf |
| --- | --- | --- | --- | --- | --- |
| long | 24 | 12.500 | -0.321 | -7.708 | 0.163 |
| short | 40 | 27.500 | -0.124 | -4.952 | 0.580 |

## 4. Weekend-trap early-exit toggle (whole layered system)

| config | total R | exp | PF | maxDD% |
|---|---|---|---|---|
| B (trap off) | +21.33R | +0.234R | 1.54 | 5.2% |
| B+trap | +19.78R | +0.217R | 1.50 | 5.2% |
| C (trap off) | +21.49R | +0.236R | 1.63 | 4.3% |
| C+trap | +20.28R | +0.223R | 1.59 | 5.1% |

The weekend trap makes it **slightly worse** (+21.33R → +19.78R for B): closing at Friday UK open when ≥2 levels are done also cuts some base Monday winners short, and the flip legs it trims were not the problem. Toggle it off.

## 5. Monte Carlo (5,000 shuffles of the per-week R sequence)

Run on the **best config (A, base alone)** and on the headline layer (B) so the drawdown change is visible.

| percentile | A: base alone maxDD% | B: +backflip maxDD% |
|---|---|---|
| 5th | 2.9% | 4.0% |
| 50th | 4.3% | 6.1% |
| 95th | 7.0% | 9.9% |

A: median max-DD 5.2R, 95th 8.3R, P(DD≥20%)=0.0%, mean final +34.8R. B: median 6.9R, 95th 11.3R, P(DD≥20%)=0.0%, mean final +21.3R. The layer both **lowers mean final R and raises drawdown** — the worst of both.

## 6. LOCKED out-of-sample (2025-01 → 2026-07-11) — best config = A, run once

In-sample the **best config is A (base alone)** — the layer subtracts in every variant. The OOS block below was run once; A/B/C are all shown so the layer's OOS effect is on the record.

| metric | A: base alone | B: +backflip 25% | C: +33%×3 |
|---|---|---|---|
| weeks scanned | 78 | 78 | 78 |
| Monday base trades | 28 | 28 | 28 |
| win rate | 60.7% | 50.0% | 50.0% |
| expectancy | +0.536R | +0.195R | +0.135R |
| total R | +15.01R | +5.46R | +3.77R |
| profit factor | 2.50 | 1.36 | 1.28 |
| max drawdown | 2.3% | 3.1% | 3.4% |
| final equity | $11,501 | $10,546 | $10,377 |

OOS flip legs (B): n=22, WR 31.8%, exp -0.057R, total -1.26R, PF 0.83. The layer **bleeds out-of-sample too** — base alone +15.01R vs B +5.46R. The result replicates: never-flat costs money on unseen data as well.

## 7. Worked examples (rule-firing verification)

### Bleed case — base wins, flip stops out (the typical 49/64)
- week 2023-10-01 | base short fade -> FLIP long | base exit friday (+0.49R) | flip exit stop (-1.69R)
- completion: 15m levels=3; SVC(bottom) at trigger; starter=25% of base size then scaled to full 1%
- flip entry 27456.7  stop 27241.4  TP 27865.8  (flip stop 0.78%)
```
  2023-10-02 17:00 NY  O27836.6 H27863.9 L27754.0 C27780.0  down    
  2023-10-02 17:15 NY  O27780.1 H27859.9 L27766.1 C27855.6  up      
  2023-10-02 17:30 NY  O27855.5 H27855.6 L27510.0 C27583.9  red     
  2023-10-02 17:45 NY  O27583.9 H27583.9 L27255.0 C27456.7  red     SVC-TRIGGER
  2023-10-02 18:00 NY  O27456.7 H27474.7 L27326.5 C27407.3  down    FLIP-STARTER@open
  2023-10-02 18:15 NY  O27407.3 H27521.0 L27382.0 C27512.2  up      
  2023-10-02 18:30 NY  O27512.1 H27527.0 L27467.7 C27512.6  up      
  2023-10-02 18:45 NY  O27512.5 H27544.6 L27490.0 C27537.0  up      
  2023-10-02 19:00 NY  O27537.1 H27554.7 L27460.0 C27468.4  down    
  2023-10-02 19:15 NY  O27468.4 H27523.1 L27455.0 C27518.0  up      
  2023-10-02 19:30 NY  O27518.0 H27596.8 L27517.0 C27578.4  up      
  2023-10-02 19:45 NY  O27578.4 H27608.4 L27467.2 C27477.6  down    FULL-FLIP-ADD@open
  2023-10-02 20:00 NY  O27477.7 H27526.8 L27465.1 C27483.4  up      
  2023-10-02 20:15 NY  O27483.5 H27540.0 L27470.0 C27536.7  up      
  ... (62 bars / 16h omitted) ...
  2023-10-03 11:45 NY  O27311.7 H27349.0 L27212.3 C27332.0  up      FLIP-EXIT(stop)
```

### The minority — a flip that reached 1.9R TP
- week 2023-06-25 | base long fade -> FLIP short | base exit stop (-1.10R) | flip exit tp (+1.42R)
- completion: 15m levels=3; SVC(top) at trigger; starter=25% of base size then scaled to full 1%
- flip entry 30741.9  stop 31014.0  TP 30224.9  (flip stop 0.89%)
```
  2023-06-27 09:15 NY  O30603.8 H30636.7 L30567.3 C30590.7  down    
  2023-06-27 09:30 NY  O30590.7 H30635.0 L30506.0 C30569.6  down    
  2023-06-27 09:45 NY  O30569.6 H30609.4 L30520.0 C30600.0  up      
  2023-06-27 10:00 NY  O30599.9 H30998.5 L30572.0 C30741.9  green   SVC-TRIGGER
  2023-06-27 10:15 NY  O30741.9 H30869.0 L30670.2 C30838.9  blue    FLIP-STARTER@open
  2023-06-27 10:30 NY  O30839.0 H30898.0 L30701.3 C30730.4  down    
  2023-06-27 10:45 NY  O30730.5 H30819.0 L30702.0 C30795.5  up      
  2023-06-27 11:00 NY  O30795.5 H30809.5 L30551.0 C30638.1  down    
  2023-06-27 11:15 NY  O30638.2 H30658.6 L30539.5 C30558.1  down    FULL-FLIP-ADD@open
  2023-06-27 11:30 NY  O30558.0 H30629.9 L30351.0 C30486.8  down    
  2023-06-27 11:45 NY  O30486.8 H30552.3 L30480.0 C30487.4  up      
  ... (63 bars / 16h omitted) ...
  2023-06-28 03:30 NY  O30331.3 H30349.2 L30162.6 C30192.9  red     FLIP-EXIT(tp)
```

## 8. Verdict — does 'never flat' survive contact with costs?

**No. Base alone is better — trade the Monday fade flat-to-cash, not the backflip.** The validated Monday fade returns **+34.76R** (exp +0.382R, PF 2.05, WR 54.9%). Layering the backflip drops the portfolio to **+21.33R** (B, 25% starter) / **+21.49R** (C, 33%×3) — the layer burns ≈13R of a 35R edge. Expectancy falls from +0.382R to +0.234R, PF from 2.05 to 1.54, and Monte-Carlo drawdown *rises* while mean final R *falls*.
**The flip legs are a clean loser** — 21.9% WR at a 1.9R target (breakeven ≈35%), -0.198R expectancy, PF 0.40, 49 of 64 stopping out. Attribution is unambiguous: the base legs carry all the profit (+34.76R), the starter loses -4.24R, and the **full-flip add loses -8.42R** — scaling into the reversal is the most expensive move. Forcing the base closed at the full flip also gives back -0.77R of base edge.
**Why it fails.** The flip is a *counter-trend reversal entered after three completed legs* — structurally identical to the MWR (0/12 positive) and 3-Hits (marginal) fades that already lost mechanically. An SVC and a second-peak close-confirmation are not enough to turn a late reversal bet positive; the completed trend more often *continues* than cleanly reverses inside the same week. Igor's discretionary 'never flat' works because he reads which reversals are real and sizes/exits by feel — the mechanised version just adds a losing counter-trend book on top of a good fade.
**LOCKED OOS (2025-01→2026-07, run once).** Base alone +15.01R vs B +5.46R / C +3.77R; OOS flip WR 31.8%. The layer subtracts out-of-sample as well — the in-sample read holds.
**Bottom line.** Keep the flagship as a *single-unit Monday fade to 1.9R, then flat*. The backflip is a discretionary-only overlay; as a mechanical portfolio layer it bleeds the validated edge and raises drawdown. Do not deploy it.
