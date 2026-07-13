# Digest: Final Damage M and W

## Summary
Short lesson defining the Final Damage variant of the M/W: a W whose second low undercuts the first (or an M whose second high exceeds the first) — the MM running the stops of traders who were right, or collecting more contracts. It remains a valid, tradable M/W but only in the right location and only with a specific 15-minute reversal-candle trigger, and it carries a higher failure rate because market structure hasn't changed.

## Exact rules
- [00:00] **FDW definition:** a W where the second peak (low) is a **lower low** than the first peak AND the second peak is a **hammer**.
- [00:30] Cause: MM is either spiking the stops of traders who got the first low right, or didn't get enough commitment on the first low and drops lower to pick up more contracts.
- [00:30] **FDM** works the same way: second peak is a **higher high** than the first peak.
- [01:00] **Location filter (mandatory):** a lower-low W is valid only at the **low of the week or low of the day**; a higher-high M only at the **high of the day or high of the week**. "It has to be in the right place."
- [01:00]–[01:30] **Trigger (mandatory):** a **hammer on the 15-minute timeframe** on the second peak of the W, or an **inverted hammer** on the second peak of the M. "That's the only time you could say it's a final damage M or W."
- [01:30]–[02:00] Risk framing: still a valid M/W, but chance of being wrong is higher because "technically the market structure hasn't changed" (the overshoot printed a new low/high). If it works, likely a **better risk:reward** (entry nearer the extreme).
- [02:00] Discretion rule: FD trades are optional — journal them and keep taking them only if your own stats support it. "Some people are going to pick final damage M or Ws beautifully and some people just won't."

## Pattern definition attempt
**FDW (bullish; FDM mirror):**
- Context (inherited from parent M/W lesson): after a 3-level drop, price at LOD or LOW.
- Low 1 forms; price pulls away from it.
- Low 2: price returns and prints a **lower low than low 1** (overshoot depth unbounded in the words — no maximum stated).
- Trigger: the low-2 candle **closes as a hammer on the 15m chart**. No hammer on 15m → not an FDW, no trade.
- Entry/stop/TP: not restated in this video — presumably inherited from the standard M/W and Brinks rules (entry next candle after the hammer close; stop below the hammer/second peak; but note the standard "stop at first peak" is impossible here since peak 2 is beyond peak 1 — placement for FD is an open question).
- Invalidation: second peak not a 15m hammer/inverted hammer; pattern not located at LOD/LOW (W) or HOD/HOW (M).

## Chart-dependent moments
- None fatal — this is a slide/talk segment — but two coding-critical gaps are never shown OR stated:
  - [00:30] Maximum allowed overshoot of the second peak beyond the first (any lower low at all? 0.1%? one ATR?). Unbounded as spoken.
  - [01:30] Stop placement for FD trades — the standard "stop above/below the first peak" is inverted here (second peak is the extreme); never addressed.

## Visual findings (targeted watch 2026-07-11)
Scene-aware pass over the full 2:29 video; frames at 00:00, 00:30, 00:45, 01:00, 01:15, 01:30, 02:15. All slides ("MECHANICS OF THE M & W" deck).

- **[00:45–01:00] "Entry" and "Stop Loss" ARE drawn on screen — but they are the VICTIM'S trade, not the FD trade.** The FDW slide labels a short white line "Entry" at the consolidation just after the FIRST low, and a long white line "Stop Loss" slightly below that entry but at/above the first low's wick region; a red arrow points at the second, deeper drop punching through that line. Timing matches the narration of the trader who "peaked at the bottom, opened a long with a really nice tight stop loss" and got spiked. Do NOT read these labels as FD trade parameters: the entry precedes the second low and the stop sits above the pattern's extreme. **The FD trade's own stop placement is never drawn or stated anywhere in the video — still open.** (Inference for coding remains: stop must go beyond the second/deeper peak, since it is the new extreme, but that is our inference, not her drawing.)
- **[00:00, 01:30] Overshoot depth of low 2 vs low 1 (PARTIALLY RESOLVED — two examples, no bound).** Live-style FDW chart: low 2's hammer wick prints visibly below low 1 — eyeballed roughly 15–25% of the W's total height deeper, with most of the overshoot being wick, not body; the reversal candle is a long-lower-wick hammer. The zoomed schematic at 01:00 shows a much smaller overshoot ("a little lower" — a few ticks below low 1's wick). So her own visuals range from marginal to ~quarter-pattern-height overshoots; no maximum is drawn. The consistent feature: the overshoot is a wick spike that closes back above low 1's level (the hammer body sits above the first low).
- **[00:30, 01:15] FDM schematic confirms the mirror:** red zigzag M whose second apex is drawn clearly above the first, the second-peak candle being a green candle with a tall upper wick (inverted-hammer shape), followed by the drop away (red arrow).
- **The green W zigzags are drawn schematically deeper than the candles** — the zigzag's second V extends below the actual wick low for emphasis. Measure overshoot from candle wicks, not from her zigzag lines.

## Quantifiability
**4/5** — The trigger is unusually crisp (second peak beyond first + 15m hammer/inverted hammer + at LOD/LOW or HOD/HOW). Blocked from 5 by the unbounded overshoot depth and unspecified FD-specific stop/TP.

## Suspected mishears / unclear passages
- [00:00] "second peak is a lower low than the first peak" — for a W the "peaks" are lows; wording consistent, just note "peak" = extreme of each side.
- [00:30], [01:00] "stock losses" = "stop losses"; "pick up more contract" = "contracts."
- [01:00] "your chance of being wrong a higher" = "is higher."
- Recurring "Mor W" / "Wor M" merges throughout.

## New jargon
- **Final Damage (FD/FDM/FDW)** — the overshoot variant defined here (matches glossary).
- **Commitment / contracts** — MM's accumulated position; the stated motive for the overshoot.
- No other new terms beyond the glossary.
