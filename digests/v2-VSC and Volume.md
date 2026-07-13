# v2-VSC and Volume — Digest

*(Filename "VSC" = SVC, Stopping Volume Candle — confirmed by content.)*

## Summary
Explains the PVSRA candle-coloring scheme ("vector candles") that drives level counting: candles are colored when their volume is a multiple of the prior 10-candle average. The 3-level move ends with a Stopping Volume Candle (SVC) — small body, long wick, volume spike — and a valid L3 SVC is one whose wick price never returns to.

## Exact rules & settings
- **Coloring rule (PVSRA — transcript says "PDSRA"):** a candle is colored **red** when its volume is a **200% increase over the average volume of the prior 10 candles** on a down candle. [00:00]–[00:30]
- **Green** = same 200%-of-10-candle-average rule to the upside. [03:01]
- **Blue** (upside) and **magenta** (downside) = **150% increase** in volume. [03:01]–[03:31]
- **False positives:** a candle can color merely because prior volume was extremely low (the blue-candle example) — so a colored candle alone is not a level. [00:30]–[01:00]
- **Level-counting rule:** to count a level, the candle must be colored **and** spike unusually versus surrounding volume (visible on the PVSRA volume subpane). [01:00]–[01:31]
- **Multi-candle levels:** a level can be 3–4 colored candles clustered in one period, counted as ONE level, not three. [01:31]
- **Fallback if level count is unclear:** don't force it — "the levels are going to end with a stopping volume candle. So I just wait for that." SVC = signal that levels are in and reversal is starting. [02:01]–[02:31]
- **SVC validity test:** SVCs can print at level 2, but then price returns to (recovers) the SVC's wick. A true level-3 SVC = **price fails to return to the wick** ("if price returns into the wick, the damage hasn't been done yet"). [02:31]–[03:01]
- **150% candles as exhaustion hint:** in a rise, sequence green → retracement → green → retracement → **blue** = volume still strong but weakening → hints the move may pause/accumulate. A blue candle at the end of a 3-level rise is "not a guarantee of a reversal, it's a guarantee of a break" (consolidation follows). Magenta = same to the downside. [03:31]–[04:02]
- **SVC definition:** "a small bodied candle with a large wick with a spike in volume at level three." [04:02]

## Data-source requirements
- OHLCV candles + volume only. Fully replicable — PVSRA coloring is a public formula (note: standard PVSRA also uses a volume×spread ("climax") condition; the transcript states only the volume multiple, so verify against the actual TBD indicator code before backtesting).
- No paid platform required.

## Chart-dependent moments
- [01:31] Which clustered candles merge into "one level" — shown by pointing; no rule for the max gap between candles of the same level.
- [02:31]–[03:01] L2-SVC vs L3-SVC comparison relies on seeing which wick price returned to; the "returns to the wick" test needs a definition (touch wick extreme? enter wick range? within N candles?).
- [03:31] The green/blue candle sequence example is visual.

## Quantifiability: 4/5
Thresholds (200% / 150% of 10-candle average) are explicit and the SVC-wick-recovery test is mechanizable. Blocked from 5 by: no numeric body/wick ratio for "small body, large wick," no window for the wick-recovery test, and fuzzy multi-candle level grouping.

## Suspected mishears / unclear passages
- [00:00] "PDSRA" → **PVSRA** (Price, Volume, S&R Analysis); also "the PDSRA volume" [00:30].
- [02:31], [03:01] "price never returned to this week" / "returns into the week" → "**wick**" (recurring Whisper mishear: week = wick).
- [03:01] "the high level volume and the red candles are a 200% increase" — garbled; likely "the high-volume red candles are...".
- [03:31] "green retracement, green retracement blue" — compressed; meaning recovered as sequence description.

## New jargon
- **PVSRA** — the candle-coloring/volume scheme (mistranscribed PDSRA/TVSRA).
- **Vector candle** — a PVSRA-colored (200%/150%) candle; levels are counted from these.
- **Break** (as in "guarantee of a break") — a pause/consolidation, not a reversal.
- **"Damage"** — the final stop-run move at L3 (see also "Final Damage" lesson).

## Visual findings (targeted watch 2026-07-11)

**Chart context (all frames):** TradingView, BTCUSDT Perpetual Swap Contract · **15m** · OKX, layout named "Day Trade Str…" (Day Trade Strategy). Indicators are collapsed in the legend (a folder of ~5), so pane-legend names are NOT readable — but full-screen red text overlays name them explicitly: at [00:10] "INDICATOR: **TRADE BY DESIGN**" and at [00:40] "INDICATOR: **PVSRA**". Trade By Design is evidently the session indicator (row of labels "Asia Open / Asia Close-UK Open / UK Close / US Close" with dotted progress bars + shaded vertical session bands); PVSRA is the candle-coloring + colored volume subpane. Overlay also includes 4 EMAs (yellow slow ~200-length curve, plus blue, red, teal faster ones) and a deep purple very-slow line below price — settings not shown in this video (no dialog opened).

**Candle palette confirmed:** normal candles render white/grey; vectors render red (200% down), green (200% up), **blue-violet** (150% up), **magenta/pink-purple** (150% down). Volume subpane bars share the same colors, so a "spike vs surrounding volume" check is read off the bottom pane.

- **[01:34] — cluster→one-level (RESOLVES the [01:31] open question, partially):** she draws olive circles on the **volume subpane**, not the price pane. One large circle encloses a cluster of ~4-6 adjacent elevated colored volume bars (Mon 30 Jan '23 ~15:00–18:00) — that whole burst = ONE level; a separate small circle rings a lone later spike = its own level. So grouping is judged on contiguous volume-spike bursts in the volume pane; the candles in a cluster are adjacent/near-adjacent (within roughly an hour on the 15m chart, i.e. ~4 bars). Still no explicit max-gap rule, but the example gap is 0–1 normal bars between colored ones.
- **[02:45] — L3 SVC (RESOLVES what a valid SVC looks like):** big olive circle at the terminal swing low (Tue 31 Jan ~00:00–01:30, low ≈22,650). The circled SVC is a **blue-violet** candle (150% vector, not 200%) at the very bottom of the 3-level decline: body is small (roughly the top third of the candle's range), lower wick ~2x the body, closing off the low. All subsequent price action bases ABOVE the wick low — later dips (Feb) bottom ≈22,800, never re-entering the wick — the visual meaning of "price never returned to this wick."
- **[02:58] — L2 SVC comparison (RESOLVES the wick-recovery test's meaning, not its window):** a second, smaller circle appears mid-decline (Mon 30 Jan ~21:00–22:45, ≈23,000–23,050) around an earlier blue candle with a lower wick. Price bounced off it, continued down to the true low, and then the later recovery/range on the right sits at 23,000–23,200 — i.e. price traded **back through the entire wick range** of that candle. So "returns into the wick" = price re-enters the wick's price band (any trade back into it), not merely tagging the extreme. No time window is drawn or stated — the return here happened ~1 day later and still invalidated it. **Remains open:** whether a return counts only until a new setup forms, and the exact body:wick ratio threshold.
- **[03:35]–[03:50] — green/green/blue sequence (RESOLVES the [03:31] visual):** left rally on the same 15m chart (Sun 29 Jan): a green vector spike up (~12:00), sideways retracement, a second green cluster pushing to the top (~23,900–23,950), then the next push prints only a **blue-violet** candle at the high — after which price goes flat/sideways along the top for ~half a day (the "guarantee of a break" consolidation) before the 3-level decline begins. The blue candle is comparable in size to the greens; the tell is the color downgrade (200%→150%), not candle size.
- **[04:05]:** wider view of the same top — consolidation band after the blue candles clearly visible before rollover; no new rule content.

**Contradictions:** none vs the transcript. One nuance: both example SVCs are 150% (blue) vectors — an SVC does not need to be a 200% (red/green) vector, only colored + a visible spike vs neighbors.
