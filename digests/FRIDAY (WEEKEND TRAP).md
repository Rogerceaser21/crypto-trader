# Digest: FRIDAY (WEEKEND TRAP)

## Summary
Describes the Friday "weekend trap": the MM uses Friday's UK session to issue a false move at UK open, runs a counter-trend for a few hours, repeats the false move near UK close, then consolidates into the US session, which may or may not reverse. For the weekly setup its role is purely as a **take-profit signal** on the 3-day/3-level swing — close by Friday UK rather than hold over the weekend, when the MM is "off duty" and price action is unreliable.

## Exact rules
- [00:00] The weekend trap is tradable on the **daily setup**, but for the **weekly setup** it should ONLY be used to take profit on the three-day three-level swing.
- [00:00] Friday is the end of the MM's trading week; the trap is usually issued in the **UK session on Friday**.
- [00:00]–[00:30] Rationale (speculative, per Annie): if UK doesn't trap enough people by UK close, the US MM (highest volume) finishes the job — which is why US sometimes reverses Friday's price and sometimes continues the trend. (Non-deterministic: US reversal is a "possibly.")
- [00:30]–[01:00] **Trap sequence:** (1) around UK open, an aggressive (false) move; (2) MM pulls back against that move and runs a few-hour trend; (3) around **8am New York** they may consolidate; (4) toward the **end of UK**, one more extension/false move — usually (not always) a repeat of the initial false-move level; (5) consolidation until the US session; (6) US possibly reverses.
- [01:30] The end-of-UK repeat is what traps traders over the weekend (held trades go nowhere).
- [02:00] Weekend trading: MM off duty, majors have almost no tradable price action; **alts (mid-to-low cap)** can present opportunities because lower volume lets large retail accounts move price — advanced traders only. Beginners: avoid weekends or paper trade. [02:30] Annie personally does not trade weekends.
- [02:30] Weekday advantage: triggers cluster around **session changeovers**, so you only need to come to the charts about **twice a day for an hour or two**. No such rule exists on weekends.
- [03:01]–[03:31] Worked example 1: M formation → level 1-2-3 drop; yellow circle = the take-profit area at the Friday UK repeat.
- [03:31]–[04:02] Worked example 2: only **two** level drops had completed by Friday. Decision rule illustrated: don't hold through the weekend hoping for level 3 — in this example US fully reversed back to level 1 and would have erased all unrealized profit on the short.
- [04:32]–[05:02] Worked example 3: price DID fall further in US, but "at the time of UK, you couldn't have known" → the rule stands: **if you can see your three levels and a repeat of the level in Friday's UK session, take profit** ("I'm not risking it, I'm taking my money").

## Pattern definition attempt
This is a **session template + exit rule**, not an entry pattern:
- **Template (Friday only, times per course session definitions, NY-anchored):** false move #1 = aggressive candle(s) at/near UK open against the direction of the subsequent intraday trend → trend runs a few hours → optional consolidation ~8:00 NY → false move #2 near UK close revisiting the false-move-#1 level (a second touch of roughly the same extreme) → consolidation → US open resolves it (reverse or continue; not predictable).
- **Codable exit rule:** if holding a weekly-setup 3-day swing on Friday and (a) three levels are complete, or (b) price during Friday UK re-tests the session-open false-move extreme (the "repeat"), then close the position before UK close / before US. Never carry the weekly swing over the weekend. If only 2 levels are done by Friday, still close rather than hold for level 3.
- Undefined: what magnitude qualifies as the "aggressive move"; the price tolerance for "repeat of the level"; exact UK open/close timestamps (needs the course's session-times definition).

## Chart-dependent moments
- [00:30]–[01:00] Size/duration of the false move and the "few hour trend" — only visible on the examples; no numeric definition of "aggressive."
- [03:01] The yellow-circle TP area — where exactly within the repeat you exit (touch of level? candle close?) is a screen gesture.
- [04:32] "the two repeats of the level in the yellow dots" — the level-match tolerance between the two repeats is only visible on the chart.
- [01:30] Session boundaries are read off the chart's gray session dots — the underlying UK open/close clock times are assumed knowledge from another lesson.

## Quantifiability
**3/5** — Day (Friday), session (UK), and the exit decision are fully codable; blocked from 5 because "aggressive move," "repeat of the level," and the exact exit trigger within the repeat have no numeric thresholds, and US reversal is explicitly probabilistic.

## Suspected mishears / unclear passages
- [00:00] "by UK clothes" = "by UK close."
- [02:00] "you can find that **ults** at times give you some really good trade opportunities" = "alts" (altcoins).
- [03:31], [04:02] "Mformation" = "M formation" (recurring merge).
- [00:30] "they will issue a false move, which is usually, but not always, a repeat of the initial false move at session open" — slightly ambiguous whether the repeat matches the *level* or the *direction* of the initial move; examples ([01:30], [05:02]) suggest it revisits the same price level.

## New jargon
- **Weekend trap** — the Friday UK false-move/repeat sequence.
- **Daily setup vs weekly setup** — two distinct trading modes; the trap is an entry-grade event only on the daily setup.
- **MM "off duty"** — weekends; low-volume regime where the model doesn't apply.
- **Session changeover** — recurring trigger window concept (charts visited ~twice a day).

## Visual findings (targeted watch 2026-07-11)

**Format note:** this lesson uses branded slides ("WEEKEND TRAP" / "THE TRAP", ttc / tradetravelchill.com) with chart screenshots, not a live TradingView screen. Sessions are shown as a row of gray dots with changeover labels; the labels read "**US Close Asia Open**", "**Asia Close/UK Open**", "**UK Close/US Open**" — i.e. in her session model the sessions tile back-to-back (UK open = Asia close; US open = UK close), so "Friday UK" is the full span between those two markers. EMA ribbon (turquoise/red/blue/yellow/purple) present on all screenshots.

- **[01:35] — trap geometry example (RESOLVES "repeat of the level"):** at the "Asia Close/UK Open" marker, after a long decline, one **green counter-trend candle** spikes up (fake move #1). She draws a **horizontal green line at that candle's HIGH**, extending right. The red zigzag beneath shows the few-hour trend running DOWN, then curling back up; near "UK Close/US Open" a second green candle's high **touches the horizontal line exactly** — the "repeat" is an exact-ish retest of the fake move's extreme (a line touch, not a zone; tolerance visually ~a wick's width). Immediately after the UK Close/US Open marker, large red candles reverse it hard downward ("US reversed it").
- **[01:35] — "aggressive move" magnitude (partially resolves):** in this example the UK-open fake candle is only ~1.5-2x surrounding bodies — its distinguishing feature is being **opposite-colored against the prevailing multi-hour trend right at the session marker**, not raw size. So "aggressive" ≠ necessarily huge; direction-against-trend at UK open is the tell.
- **[03:05]–[03:25] — worked example 1:** full view: red M zigzag at top, "Level One/Two/Three" labels stepping down a multi-day decline, olive circle at the Friday-UK area after level three. Zoom: decline → UK open pushes UP (bottom-is-in trap) → trend runs DOWN → at end of UK the circled cluster **re-tests the level** (circle sits ON the UK Close/US Open marker; a white horizontal line connects the earlier level to the circled retest) → after the marker, visibly enormous blue/red candles (the "US volatility"). TP gesture = the circle around the end-of-UK retest touch, i.e. exit on the repeat touch before US opens.
- **[03:45]–[04:25] — worked example 2 (only 2 levels done):** full view shows M + only "Level One" and "Level Two" labels, circle at the level-2 low on Friday. Zoom: UK open pushes price up slightly, trend runs down to the low, then near end-of-UK a **giant green candle ~5-8x surrounding bodies** rips back up (this end-of-UK "push up" is the extension/false move; a magenta/purple vector marker sits beside it), and after US Open price keeps going UP — the full reversal that "went all the way back to level one." Confirms the decision rule visually: with 2 levels done, holding the short over the weekend surrendered everything.
- **[04:40]–[05:05] — worked example 3 (two repeats):** full view: M + Levels One/Two/Three, then **two small olive circles side by side** at the same price level in Friday's UK (the "two repeats of the level in the yellow dots") — two separate retest touches of the same level, at matching highs (visual tolerance again ~wick precision), before price fell further in the US (steep drop at the bottom right beyond the circles). Zoom re-shows the [01:35]-style geometry: fake move up at UK open, horizontal line, trend down, end-of-UK repeat touching the line, US then reversing the repeat (resuming the drop).

**Contradictions/clarifications:** none against the transcript. Clarified: (a) the "repeat" matches the *level* (price extreme) of the initial false move, drawn as a horizontal line off the fake candle's high — the ambiguity flagged in mishears is settled; (b) "US reversed it" in the zooms means US reversed the *end-of-UK false move* (which can mean resuming the true trend, ex.1/3, or fully reversing the week's trend, ex.2); (c) aggressive-move size is inconsistent across examples (1.5-2x up to 5-8x neighbors) → still no codable magnitude threshold; counter-trend color at the session marker is the more reliable feature.
