# Annie / Trading TTC — Strategy Codex
*Synthesized 2026-07-11 from: 24 video transcripts (45,393 words), 5 course PDFs, and Igor's manual backtest spreadsheet (~40 hand-labelled weeks, Nov 2022–Oct 2023 + May–Aug 2025).*
*v2 — updated same day after a targeted visual watch of 12 videos (~150 frames at digest-flagged timestamps). Rules confirmed or corrected from her actual screen are marked ✅frames; per-moment detail lives in each digest's "Visual findings" section.*

Every rule below is tagged **[M]** mechanical (codeable as stated), **[P]** parameterizable (mechanical once we pick a threshold), or **[J]** judgment (needs a proxy or human call). Timestamped sources live in `digests/`.

---

## Igor's rulings (2026-07-11)

*Igor (course graduate, the client) answered the open questions on 2026-07-11. **These rulings are FINAL and override every prior interpretation in this document.** They are woven into §§1–4 below, and the [P]/[J] tags on the affected rule lines were updated the same day.*

1. **Retest validity — RESOLVED.** Precondition: the 50 EMA must be broken by a vector candle (red or green PVSRA = 200% class). Then a retest entry is valid when **2 of these 4** conditions are met: ① 50-EMA retest, ② return to the Level-1 vector, ③ higher-low (uptrend) / lower-high (downtrend) structure, ④ heatmap/liquidation level present. *(We have no Hyblock/TradingLite → condition ④ comes from free Coinalyze/Coinglass liquidation data, or the rule runs as 2-of-3 when liq data is unavailable.)*
2. **SVC — RESOLVED.** Size of the volume spike is subjective, but the shape is fixed: higher volume than usual (PVSRA high-volume class), a long wick (either side), body smaller than the wick. It's a "stopping volume candle" — price stops there and usually reverses. On timeframes under 1H, an **engulfing candle** also qualifies as the stopping signal.
3. **Final Damage stop — RESOLVED.** Stop goes beyond the extreme peak of the formation — i.e. beyond the overshooting second peak (lowest low of the FD-W / highest high of the FD-M). Igor: "of course it's going to be lower than the lowest or the highest peak of that formation."
4. **Board meetings — RESOLVED.** A board meeting is just a **channel** — her fancy name for a sideways channel. Usually sideways, can slope up or down, can retrace back to the breaking PVSRA candle. No special boundary-drawing rules exist.
5. **Peak-2 vicinity — RESOLVED (soft).** 25–35% shortfall is the extreme edge; peak 2 should be "in the vicinity" of peak 1 or it's not an M/W. No hard number — we calibrate the threshold against his 36 labelled weeks.
6. **Subscriptions — RESOLVED.** He has neither. TradingLite went out of business (was useful but buggy); Hyblock too expensive. All liquidity/OI features use free Coinalyze/Coinglass substitutes.
7. **Backflip starter — RESOLVED (corrects the slide).** It's **25% of the initial trade's position size** (initial trade $10,000 → opposite short $2,500), **NOT** 25% of a 1% risk unit. Alternative he offered: 33% three times. *Igor's ruling supersedes the slide reading.*
8. **EMA fan-out — RESOLVED as judgment call.** No number exists. Demote from a hard filter to an optional proxy (e.g. EMA gap ≥2–3× recent candle range), to be A/B tested in backtests.

---

## 1. The Market Structure Model (the scaffolding everything runs on)

**Time anchors — fully mechanical, 5/5:**
- Daily open: **5pm New York**. HOD/LOD = prior 5pm→5pm extremes. [M]
- Week: **Sunday 5pm NY → Sunday 5pm NY**, weekend included. HOW/LOW = extreme wicks of that window. Monday uses Sat 5pm→Sun 5pm for its "prior day". [M]
- Sessions: Dead Zone (post-US lull) → **Asia** (ranges) → **UK** (trends 6–8h) → **US** (reverses UK after a false move 1.5–2h post-open). [M window / J behavior]
- **Weekend box**: drawn from the candle after Friday US close, to close-clusters not wicks [P — cluster rule]. Never trade weekends on majors; never enter right after Friday 5pm NY close. [M]

**The weekly script:**
1. Sun/Mon: **fake move** (FMWB) — weekend stop hunt / spike out of the weekend box. No weekend stop-hunt or M/W = no FMWB trade exists that week. [M-ish]
2. Real trend runs in **3 legs (L1/L2/L3)** separated by **board meetings** (consolidations).
3. Wed/Thu: **mid-week reversal (MWR)** watch, usually on news.
4. Friday: **weekend trap** — false move at UK open, repeat near UK close. TP signal only, never an entry. Close weekly trades by end of Friday UK. [M]
- MM "attempts the HOW or LOW every week."
- Igor's data agrees: FMWB weeks peak **Monday** 14/17; MWR clusters **Tue/Wed**, mostly US session; FMWB median move ~4%, Trend weeks ~10% (trade them differently).

**Level (leg) grammar:**
- Start every level count **from the last peak formation**. [P]
- L1 must break the 50 EMA **with a high-volume vector** or it doesn't count. [M — vector = red/green PVSRA (200%) candle; this is the precondition for the retest menu (Igor 2026-07-11)]
- Initial TP = the **L1 vector** (order-flow imbalance logic; verify with Fixed Range Volume Profile). [M]
- "Damage is done": vertical move + extended board meeting = no more levels owed; the count may complete on 15m. [J]
- Retail patterns work at L1/L2 and **fail at L3** — no breakout/pattern trades at L3. [M once levels are counted]
- After L3 + SVC: leg sequence complete → expect opposite M/W ("backflip" point).

**The #1 prohibition:** never counter-trend after a level-1 rise/drop — even on a 200 EMA reversal candle. Never counter-trend the 200 EMA after L1. [M]

---

## 2. Shared Components (the vocabulary the setups compose)

**EMA stack (all timeframes): 10, 20, 50, 200, 800.**
Cycle: 10/20 cross on second M/W peak → L1 breaks 50 → run to 200, reject → board meeting holds the 50 → L2 (entry after stop hunt/M-W) → L2 target = 800 EMA or unrecovered vector. EMA fan-out at L3 = trap ("trend acceleration"); flattening = board meeting. [J — no taught number; fan-out is an **optional proxy** (EMA gap ≥2–3× recent candle range), A/B test in backtests (Igor 2026-07-11)]

**PVSRA volume candles — numeric, directly codeable:**
- Red/green = volume ≥ **200%** of prior-10-candle average. Blue/magenta = ≥ **150%**. [M]
- **Vector** = such a high-volume impulse candle. "Unrecovered vector" = price hasn't traded back through it. [P — recovery def]
- **SVC (Stopping Volume Candle)** = small body + long wick + volume spike at the end of L3. ✅frames: her example SVCs are **150% (blue) class**, not only 200%; visually ~3–5× neighboring volume. **SVC box** = the candle's full wick-to-wick range extended right; "price returns into the wick" = any trade back into that range; the box is only *invalidated* by a solid **close beyond its far edge** (the SVC's extreme wick). [M — shape is fixed (PVSRA high-volume + long wick + body smaller than the wick); spike size is subjective; on TFs under 1H an **engulfing candle** also qualifies as the stopping signal (Igor 2026-07-11)]
- Blue candle at the end of a rise = pause, not reversal. ✅frames: level grouping is read on the **volume subpane** — one contiguous burst of ~4–6 elevated colored bars = one level; a lone spike = its own level.
- Her chart stack identified on screen: **PVSRA** (candle/volume coloring — public indicator, replicable exactly) + **"Trade by Design"** (session boxes). Chart: BTCUSDT Perp 15m, OKX.

**M/W pattern validity:**
- Only after a completed 3-leg move, located at HOD/HOW (M) or LOD/LOW (W). [M given level counter]
- Perfect M: SVC at peak 1 → 3 trap-candles on the inside-right → 50 EMA break with volume. ✅frames: the 3 trap candles = **three consecutive same-color candles pushing into the level on the lower TF (15m→5m), the third ending in a failed wick-spike into the SVC box; entry cue = the first opposite-color candle after them.** [M]
- Peak 2 = lower high; re-entry into the SVC box is fine at any depth — **only a solid close beyond the box's far edge invalidates**; a close back out the near edge re-validates. ✅frames. [M]
- 50 EMA retest validity ✅frames: price returns to touch the EMA **from the trade side and rejects — wicks touch, bodies don't cross**. [M]
- Multi-session M/W (the #1 weekly entry): peak 1 in one session, peak 2 falls short in a later session/day; best = peak 1 Asia, peak 2 at UK open at HOW/HOD. Validation on candle close as hammer/inverted hammer "**or other reversal candle**" (✅frames caption). Stop ✅frames: below the **first spike's wick low / LOD** (W); mirror above spike high / HOD (M). Peak-2 shortfall ✅frames: ~**25–35% of the internal leg** in her one measured example. [P — peak 2 just needs to be "in the vicinity" of peak 1; 25–35% is the extreme edge, not a hard cut; calibrate the threshold on Igor's labelled weeks (Igor 2026-07-11)]
- **Final Damage variant (FDM/FDW):** second peak *overshoots* the first (FDW second low BELOW first low; FDM second high ABOVE first high), at LOD/LOW / HOD/HOW, mandatory 15m hammer/inverted-hammer close on the second peak. ✅frames: the overshoot is a **wick** beyond peak 1 that **closes back inside** (hammer body above the first low), observed marginal to ~25% of pattern height. Higher failure rate, better R:R. [M — stop goes **beyond the formation's extreme peak** (lowest low of the FD-W / highest high of the FD-M); the slide's drawn "Stop Loss" belongs to the trapped victim's trade, not the FD entry (Igor 2026-07-11)]

**Entry/retest validity (weekly setup):** precondition — the 50 EMA is broken by a vector candle (red/green PVSRA, 200% class); then a retest entry is valid when **2 of the 4** are present {50 EMA retest / origin vector retest / HL-LH structure / heatmap-liq level}. With no Hyblock/TradingLite, ④ uses free Coinalyze/Coinglass liq data, or run 2-of-3 (Igor 2026-07-11). Invalidation ONLY on a close back beyond the second peak (a no-volume L1 is not an exit). Refund zone: cut second-peak entries on a close through the second-peak wick. [M]

**Risk & management template:**
- 1% account risk per built position; staggering 25/25/50 (fib 38.2/50/61.8 or 61.8–78.6 band) or 25/75. ✅frames: fib anchors = **100% at the swing high of the most recent completed leg, 0% at its low**; her template adds a custom **gold 65% level** and the example entries land in the 61.8–65 band. [M]
- **Minimum R:R = 1.9.** ✅frames: position tool shows Target 2.77%/Stop 1.45% ≈ 1.91 accepted; an explicit on-screen "Only a 1.4:1 RR — Skip It". [M]
- Stop-move law: breakeven only after retracement + L2 starts; never trail below the initial TP. [M]
- Partials at board meetings; final exit at L3 + SVC. [M given detectors]
- Never hold through scheduled news with 3 levels counted; skip MWR when a news wick forces a wide stop. Asia range >2% = don't trade that day. [M]
- Igor's news log agrees: post-news reversal >> continuation on CPI/FOMC days.

---

## 3. The Setups

**Priority correction (Igor, 2026-07-11):** Brinks is NOT the first priority — it rarely fires (backtest confirmed: 0.61 signals/month) but is big when it does. **The Weekly Setup / FMWB fade (S3) is the flagship and first backtest priority**, then Final Damage (S2). Brinks backtested 2026-07-11: no edge as specified (see backtests/BRINKS.md; only near-breakeven slice = W/longs in the UK window).

### S1. Brinks Trade — (was priority 1 for mechanical simplicity; deprioritized per Igor — rare but big)
15M. Only two candles/day: **3:30–3:45am and 9:30–9:45am NY**. Precondition: price at HOD/LOD; Asia-range breakout near Asia close, then retracement into the changeover. Lead-in: ~3 fast bursts; second M/W peak 30–90 min after first. Trigger: the candle closing at 3:45/9:45 closes as inverted hammer (M) / hammer (W) — or railroad tracks. Entry next candle open. ✅frames: **stop = red zone drawn above BOTH peaks of the M** (mirror below the W's lows); **TP1 = green zone at the origin of the prior impulse (vector) candle** — "recovery of the MM candle" means price returning to the impulse's base. Then trail behind consolidation zones. **Time stop: close if not in decent profit within 2h.** Never weekends.

### S2. Final Damage M/W — priority 2 (crispest trigger)
15M hammer/inverted-hammer close on an overshooting second peak at LOD/LOW (FDW) or HOD/HOW (FDM). ✅frames: overshoot = wick beyond peak 1 closing back inside, up to ~25% of pattern height. **Stop (Igor 2026-07-11):** beyond the formation's extreme peak — past the overshooting second peak (lowest low FDW / highest high FDM); the slide's "Stop Loss" label belongs to the trapped victim's trade, not this entry.

### S3. Weekly Setup / FMWB fade — priority 3 (the flagship; Igor's ground truth)
Weekend box (✅frames: drawn to **candle-close clusters**, edges cutting through wicks) → Sun/Mon spike-out + M/W/FD forms (multi-session ideal) → 1H counts levels **from the last peak formation**, 15M times entry → valid retest entry (see §2) → stop beyond second peak → **TP1 = origin of the L1 vector** (✅frames: teal band at the vector's origin, cross-checked with a **Fixed Range Volume Profile low-volume "crevice"** just beyond it) → partials at board meetings, final at L3+SVC or Friday UK end. Exit law ✅frames: refund-zone exit on a **close through the second-peak wick**; breakeven only after L2 starts, stop parked just beyond the TP1 band. Igor's 40 labelled weeks calibrate the detectors (regime, peak day, session, 50EMA retest, BBWP<35, 3-levels, SVC columns).

### S4. Mid-Week Reversal — priority 4
From Wednesday, hunt reversal of the week's trend: 3-hits to HOW/LOW, news catalyst, M/W at the extreme. Igor's MWR tab: reversals cluster Tue/Wed, mostly US session. Entry mechanics shared with S3.

### S5. 3 Hits to a Level — priority 5
3 failed tests of HOW/LOW at L3 → reversal imminent; a 4th hit → continuation. ✅frames: a "hit" = an upper **wick tagging (or hairline-piercing) the level with no close beyond it**; reading timeframe ≈ **15m**; written slide confirms hits must span a **minimum of 2 sessions**. Tiebreaker after hit 3 ✅frames: ascending trendline under the rejection higher-lows, a lower high forming clearly below the level → break of that trendline = down; another higher low = up. Confluence: MWR due or news. 200 EMA rejection = the second named weekly setup. *(Open: entry/stop/TP mechanics — likely S3's.)*

### S6. Backflip Swing (meta-strategy layered on S3–S5)
Never flat: long the 3 rises → L3 SVC → partial profit + open a starter short sized at **25% of the initial trade's position size** (Igor 2026-07-11: initial $10k → $2.5k short; **not** 25% of a 1% risk unit — alt 33%×3, supersedes the slide) (hedged by the still-open long) → second M peak → full short + close long → repeat. Adds on 3-hits. This is a portfolio/state machine over the other setups' signals, not a separate signal.

### S7. OI-conditioned behavior filter (overlay)
Consolidation + OI rising = breakout without stop hunt (may enter inside the board meeting); OI flat/falling = expect stop hunt first, enter after. Retrace + OI rising = trap → re-entry at prior vector. OI ramp into news = L3 then MWR. Free data. Most backtestable tools-lesson.

### Weekend Trap (Friday) — exit rule, not a setup
False move at Friday UK open → repeat of the level near UK close. If 3 levels done (even 2), take profit rather than hold the weekend.

---

## 4. Data Requirements

| Need | Source | Status |
|---|---|---|
| 1m/5m/15m/1H/4H BTC (+alts) candles+volume, multi-year | Binance via Jesse import | Free ✅ |
| Open interest history | Binance/Coinalyze API | Free ✅ |
| Economic calendar (CPI/FOMC/NFP) | Forex Factory / FRED | Free ✅ |
| Hyblock liq levels & 20B delta | Coinalyze / Coinglass (free) | **Not subscribed** — Igor 2026-07-11 (too expensive); substitute free Coinalyze/Coinglass |
| TradingLite heatmap walls | Coinalyze / Coinglass (free) | **Not subscribed** — Igor 2026-07-11 (TradingLite defunct); substitute free Coinalyze/Coinglass |
| PVSRA candle colors | computed from OHLCV | Free ✅ (we code it) |

## 5. Questions for Igor — ALL RESOLVED 2026-07-11 (✅ = answered by frames or by Igor)
~~3. Minimum R:R~~ ✅ **1.9** (on-screen). ~~5. High-volume vector~~ ✅ PVSRA vector-colored candle whose **body closes across** the 50 EMA. ~~6b. 3-hits touch tolerance~~ ✅ wick tag, no close beyond. ~~9 (partially)~~ ✅ her Asia-range example measures **wick-to-wick, ILOD→IHOD**.

**All resolved 2026-07-11 by Igor** — full text in **§ Igor's rulings** at the top; one-line answers below:
1. **Retest validity** ✅ Precondition: 50 EMA broken by a vector candle (red/green PVSRA 200%); then **2 of the 4** {50 EMA retest, origin vector, HL/LH structure, heatmap-liq}; 2-of-3 when no liq data.
2. **SVC volume multiplier** ✅ Size is subjective; shape is fixed (PVSRA high-volume + long wick + body smaller than the wick); sub-1H, an engulfing candle also qualifies.
3. **Final Damage stop** ✅ Beyond the formation's extreme peak (past the overshooting second peak — lowest low FDW / highest high FDM).
4. **Sideways board-meeting boundaries** ✅ It's just a channel (her name for a sideways channel); can slope or retrace to the breaking PVSRA candle; no special boundary rules.
5. **Peak-2 shortfall** ✅ Peak 2 just needs to be "in the vicinity" of peak 1; 25–35% is the extreme edge; calibrate on the labelled weeks.
6. **Hyblock / TradingLite** ✅ Neither (TradingLite defunct; Hyblock too expensive) — free Coinalyze/Coinglass substitutes.
7. **Backflip starter short** ✅ 25% of the **initial trade's position size** ($10k → $2.5k), **not** 25% of a 1% risk unit (alt 33%×3); supersedes the slide reading.
8. **EMA "fan-out"** ✅ No number; optional proxy (EMA gap ≥2–3× recent candle range), A/B test.

## 5b. v2.1 addendum — full-course watch completed (all 24 videos)
- **Durations doc** (caught on screen in the Swing System video): minimum candle counts on 15m for W formation / level / board meeting; W cycle ≈ 11.5h; full M+W cycle ≈ 23h — hard time-filters for the pattern detector. Frame: `media/swing-system/`.
- Backflip sizing from her printed slide: **P1 at the SVC (enter at candle close), P2 at the second-peak reversal candle**; stop above wick or HOD/W; exit at "3 drops + SVC". Fib builder: staggered adds, **stop at the 100% fib**. **Correction (Igor 2026-07-11):** the starter is **25% of the initial trade's position size** ($10k → $2.5k), **not** "25% of your 1% total risk" as the slide reads (alt: 33%×3) — Igor's ruling supersedes the slide.
- Printed R:R benchmarks across the Week 2–4 examples: 3.5:1 to 5.5:1 typical; MWR "4.6:1 close in UK or 6:1 if close at LOW"; skip-checklist "No Entry, All bad RR, Bad timing, Skip It".
- OI cheatsheet slide (verbatim capture) attributed to **hyblockcapital.com**; her OI source/exchange is never shown on screen — treat OI feed choice as ours.
- The HOW/LOW indicator also plots **HOD, IHOD, ILOD, LOD with "Area of Interest" zones** between outer and inner levels.
- Her charts are **OKX perps** while her liquidity data is **Binance** — she accepts the cross-exchange mismatch; so can we.
- The LIQUIDITY video is incomplete **at the source** (recording starts mid-lesson) — not a transcription defect.

## 6. Proposed Build Order (after Igor's review)
1. **Foundations**: candle data import; session/weekly anchors; PVSRA; EMA stack; vector/SVC detectors; level counter; M/W/FD detector.
2. **Calibration**: run detectors over Igor's ~40 labelled weeks; tune until they agree with his labels; view his 41 TradingView snapshots for disagreements.
3. **Backtests** in priority order S1→S5, each with fees/slippage, 2019–2026 data, walk-forward splits, Monte Carlo on trade sequence, parameter sensitivity.
4. **S6 backflip** as a portfolio layer over the best-performing signal set; **S7 OI filter** as an A/B toggle on everything.
