# Weekly Setup (Week 1 — Entry and TP's) — Digest

## Summary
First of four worked-example weeks (deliberately from December 2022, "the worst month to trade" due to low volume). Walks through three potential trades in one week — the FMWB M-trade, the real-trend W-trade, and a post-MWR M that should be skipped — each with an aggressive (second-peak) and conservative (post-level-1 retest) entry variant, actual R:R numbers, and the timeframe protocol (1H for the setup, 15m for the entry).

## Exact rules

### Timeframe protocol
- [01:00–01:30] The weekly setup is traded on the 1-hour timeframe, but once the peak formation that creates the week's M/W is identified, "it's best to drop down to the 15 minute time frame for the actual entry because this will give you a better risk to reward".
- [01:30–02:00] After the entry is taken on the 15m, switch back to the 1H — the 1H is the timeframe on which the 3 levels are counted. Trap: 3 levels on the 15m may equal only 1 level on the 1H, so staying on 15m makes you exit at level 1 thinking the swing is done.
- [02:00–02:30] Two legitimate plans: (a) skip the Sunday/Monday false move entirely, wait for the real trend, take the 3-day swing on the 1H; or (b) trade FMWB, then the 3-day swing, then MWR. Either way, once the real trend starts, levels are read on the 1H.

### Trade 1 — FMWB (M formation out of the weekend box)
- [00:30–01:00] Prior week trended up; weekend spike high created the M = the FMWB. The lower high after the spike "could not repeat the level — that's what made the M formation".
- [03:31–04:31] The trap out of the weekend box creates a vector — that red candle becomes the area of interest. Price moves away, comes back to repeat the level "but it didn't close back inside that candle" → M confirmed, safe entry. Any of the (four) wick candles in that zone can be the trigger; stop loss above the first candle's peak.
- [04:31–05:32] Conservative entry: after the M, price broke the 50 EMA (blue line) with volume, then retested. In the board meeting: wicks to the low at the very start = end of drop level 1; then wicks to the high = the trap; those wicks could not get back above the 50 EMA. Trigger = bearish candlestick confirmation at the end of the board meeting — "that green vector followed by the gray one that fully covered it — that's a bearish engulfing".
- [05:32] Because there are stop hunts in the board meeting, the stop loss can be very small — "it only needs to clear the 50 EMA and the wicks".
- [06:02] Target for both entries = the low of the week. Price broke a bit below it, but "just take your profit where your target is". Results: aggressive 7.8:1, conservative 9.8:1.

### Trade 2 — real trend (W on the 1H)
- [06:32–07:02] FMWB completed; trap wick at the bottom created the first peak of the W; price repeated the level but couldn't get back into the wick → W formation on the 1H (no need to drop to 15m here since the real trend is on the 1H).
- [07:02] Entry: wait for price to get back above the low of the week, or aggressive entry on the second peak W. "Once price breaks a high/low of the week, a new high/low of the week is getting created" — so the broken LOW itself means little; the W around it is the long signal.
- [07:32] Level 1 broke the 50 EMA with the big green candle but did NOT run to the 200 EMA — that's fine when the 200 is far away; the requirement is only "level one break the 50 EMA with that volume", then assess retrace vs board meeting.
- [08:02] The board meeting held the 50 EMA the whole time; no stop hunt, wicks both sides but top wicks noticeably longer → safe conservative entry.
- [08:33–09:33] In the board meeting, drop to the 15m to look for stop hunts. Long top-wicks = triggering/stopping short traders who drew that level as resistance ("the more it hits a level..." crowd). Once you know they're trapping shorts, enter long with stop "under the EMAs that are acting as the dynamic support".
- [10:03] Results: aggressive 3.66:1, conservative 4.5:1 — conservative better because the small sideways board meeting allowed a tighter stop.
- [10:03–10:33] Lesson: if you miss the M/W, don't skip the week — the 50-EMA retest (or any retest condition) after level 1 can be the better-paying trade.

### Trade 3 — post-MWR M: SKIP (trade-quality filter)
- [10:33–11:03] Reasons to skip: (1) second peak "couldn't even get close" to the first M → stop must be wide; (2) 50 EMA too close to be the target → target must be an unrecovered vector; (3) the chosen level-2 vector was mostly recovered (candles eat into it) so only the bottom of the candle was usable.
- [11:03–11:33] Resulting R:R 1.4:1 → "that's not a good trade to me, we don't get out of bed for that as we say in TTC". Implied minimum acceptable R:R is meaningfully above 1.4:1 (elsewhere stated as ~1.9–2).
- [11:33–12:03] By the time a proper lower high formed, it was end of Friday US session going into the weekend trap → no entry at all.
- [12:03] M's and W's in the right place are not enough without a good target — an M can be a "consolidating level" (a stall) instead of running levels down.

## Chart-dependent moments
- [00:30–01:00] The weekend-box spike high and the "lower high that could not repeat the level" — the tolerance for "could not repeat" is only visible on chart; needed to code M-confirmation.
- [04:01–04:31] "There's one two three there's four week candles" — which candles count as valid triggers in the second-peak zone.
- [05:02] The bearish-engulfing trigger candle pair (green vector fully covered by gray candle) — exact pattern shown, not fully specified verbally.
- [08:02–09:03] Wick-length comparison in the board meeting (top vs bottom) — the visual threshold for "longer" is uncoded.
- [10:33–11:03] Assessing that the level-2 vector was "mostly recovered" — recovery judgment made by eye on chart.

## Quantifiability
**3/5.** Entry sequencing, stop anchors, invalidation (close back inside the candle) and the two entry styles are near-mechanical; blocked from 5 by unquantified wick-length comparisons, "couldn't get close" repeat-tolerances, and vector-recovery judgment for target selection.

## Suspected mishears / unclear passages
- Throughout: "week/weeks" → "wick/wicks" (e.g. [06:32] "the trap in the week down the bottom").
- [04:31] "bearish and gulfy" → "bearish engulfing".
- [05:32] "stock loss" → "stop loss".
- [03:01] "FOMC meeting minutes... Wednesday the 23rd of November" — dates match Nov 2022 FOMC minutes; plausible, not a mishear.
- [12:03] "there can be stats and there can be consolidating levels" → unclear; likely "there can be stalls" or "traps". Meaning: an M/W can consolidate instead of trend.
- [11:03] "the vector that I chose which is the level two vector" — phrasing garbled but meaning recoverable.

## Visual findings (targeted watch 2026-07-11)
Frames pulled at 00:45, 03:45, 04:10 (1024px), 04:25, 05:05 (1024px), 05:25, 05:30 (1024px), 05:50, 08:10, 09:00, 10:45, 11:05, 11:20.

- **[00:45] Week overview — DATE CONTRADICTION.** The on-screen ForexFactory calendar panel covers **Nov 20–26, 2022** with FOMC Meeting Minutes on Wed Nov 23, and the chart's date axis runs 19→24 Nov (status bar reads "Wed 23 Nov '22"). So this "Week 1" example is late November 2022, despite her saying all examples were grabbed from December 2022. The overview chart is annotated with: Weekend Trap, M Formation, Trapped Traders, LOW, Level One/Two/Three boxes on each swing, and "Unrecovered Vector" as the upper target.
- **[04:10] Trap-candle close-back-inside rule — RESOLVED.** The aggressive-entry chart shows: a green **"Weekend Trap" box** drawn around the weekend consolidation; the trap spike breaks *above* the box top — a red candle with a tall upper wick — and a shaded horizontal **"Area of Interest (AOI)"** band is drawn from that trap candle extending right. The band spans roughly the trap candle's body-to-peak zone. When price returns, a cluster of small candles (the "four wick candles") *poke upper wicks into the AOI band but all bodies close below its lower edge* — that is what "didn't close back inside that candle" means: wick penetration of the trap-vector zone is fine, a body close inside it is not. Stop-loss = above the AOI band top (the first candle's peak). Any of those wick candles is a valid trigger.
- **[05:05–05:30] Board-meeting tiny stop — RESOLVED.** The conservative-entry chart shows the post-M drop through the blue 50 EMA, then a small consolidation labelled **"Board Meeting"** sitting *below* the 50 EMA. Early candles wick to the low (end of drop level 1), later candles wick up into/at the 50 EMA but no body reclaims it. A thin shaded rectangle is drawn immediately **above the board-meeting wick highs / the 50 EMA line** — that rectangle is the stop zone: the stop sits just above the highest board-meeting wick + the 50 EMA, far below the M's first peak. The trigger at the board meeting's right edge is a green candle followed by a dark candle whose body fully covers the green one (the bearish engulfing), though at frame resolution the exact pair is only just discernible.
- **[05:50] R:R comparison confirmed.** Side-by-side "Agressive 7.8:1 RR" / "Conservative 9.8:1 RR" cards; both target the same LOW level ("Level Three" box), the conservative card's board-meeting stop box is visibly a fraction of the aggressive one's peak-clearing stop.
- **[08:10–09:00] W-trade board meeting wicks — RESOLVED.** On the 1H (08:10), the board meeting rides on top of the blue 50 EMA the whole way; the red arrow marks entry at the board-meeting exit. On the 15m view (09:00), the top wicks in the board meeting are visibly ~2x the bottom wicks — the visual "longer" is unmistakable at a glance rather than marginal; entry with stop under the EMA cluster acting as dynamic support. Levels One/Two/Three boxes step up to the 200 EMA and then the AOI (green vector in the weekend trap).
- **[10:45–11:20] The 1.4:1 skip example — RESOLVED.** On-screen text: **"Mid-Week Reversal"** and **"Only a 1.4:1 RR — Skip It"**. Geometry: after the news-event peak (M formation shaded box, red zigzag), the second peak forms *well below* the first — roughly the lower third of the M's height — so the stop (above the first peak) is wide. The target is a full-width red horizontal line labelled **"Vector Target"** drawn at the *bottom edge* of the chosen level-2 vector (its body having been mostly eaten by later candles — the candles visibly overlap all but the lowest part of the vector). Entry-to-target distance is visually not much larger than entry-to-stop, matching 1.4:1. Confirms: vector recovery is judged by candle bodies overlapping the vector's range, and a mostly-recovered vector forces the target to the vector's far edge.

## New jargon (not in glossary)
- **Area of interest** — the vector/zone a trade is anchored to (entry zone or the zone price must not reclaim).
- **Weekend box** — drawn box around weekend price action (defined precisely in the Weekly 1H lesson).
- **"We don't get out of bed for that"** — TTC shorthand for sub-minimum R:R (~<2:1).
- **Consolidating level** — an M/W that resolves sideways instead of running the 3 levels.
- **Dynamic support** — EMAs acting as the moving support under a board meeting.
