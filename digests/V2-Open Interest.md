# V2-Open Interest — Digest

## Summary
Defines open interest mechanics (OI up = longs AND shorts both entering; down = both exiting; flat = contract transfer) and turns OI into the board-meeting oracle of the method: consolidation + rising OI = breakout coming and **no stop hunt needed**; consolidation + flat/falling OI = **stop hunt likely first**. Also covers using OI drops to track trapped traders through M/W formation and using an OI ramp into a news event to anticipate the level-3-then-midweek-reversal sequence. The most backtest-friendly lesson of the tool set.

## Exact rules & settings
- **OI mechanics:** OI +$5M means $5M of longs AND $5M of shorts entered; −$10M means both sides exited $10M; unchanged = transfer of contracts (one opens as another closes). Buys/sells ≠ longs/shorts — every entry/exit maps to the 8 transaction types shown on screen. [00:30]–[03:02]
- **MM bookkeeping rationale:** the MM ends up warehousing all open interest; falling OI at a price = MM closing matching positions. [03:02]–[03:32]
- **Volatility link (small TFs):** high volatility usually comes with **OI decrease** (stops/liquidations/TPs auto-trigger = net exit; no time to enter). [04:02]–[04:33]
- **Rule 1 — breakout:** price consolidating + OI **increasing** = stops/liquidation fuel building → breakout with a **liquidity cascade** is coming. (Worked example: the ~16.5K consolidation that formed the second side of the W, trapping bears before the fast shift up.) [04:33]–[06:03]
- **Rule 2 — fakeout:** price consolidating + OI **flat or decreasing** = not enough stops/liqs for a cascade → likelihood of **fakeout / stop hunt** increases; price may print higher-lows/lower-highs instead of breaking. (Example: sideways board meeting where inducement failed → MM issued the fake spike up, trend flipped down.) [06:03]–[07:34]
- **Rule 3 — trapped traders:** consolidation + rising OI, then breakout → one side trapped. Watch for the **OI drop** as price moves away (some trapped exit at loss / winners take profit — that's the inside left side of the W); if the return leg (second side of the W) does **not** release the remaining trapped traders, they're fuel for the new trend. Use at M/W formation and at level retraces (line the trap zone up with the previous level's vector). [07:34]–[10:05], [12:05]–[12:35]
- **Rule 4 — board-meeting stop-hunt predictor (the headline table):**
  - Board meeting + OI **increasing** → breakout incoming, **stop hunt NOT necessary** (MM is getting its contracts) → you may position inside the board meeting. [10:35]–[11:05]
  - Board meeting + OI **flat or decreasing** → **stop hunt likely before the major move** → wait, then enter as soon as the stop hunt prints. [11:05]–[11:35]
  - This decides *whether to open in the board meeting or wait for the hunt* — and rescues missed M/W entries via post-L1/post-L2 entries. [11:35]–[12:05]
- **Rule 5 — retrace trap:** price retracing + OI **increasing** = traders being trapped in an M/W or a retracement **before continuation**; if the trap zone lines up with the previous level's vector candle → re-entry area for the next level. [12:05]–[12:35]
- **Rule 6 — news ramp:** a large OI increase in the consolidation before a news event (CPI in the example, shown as a grey dotted line) = hint the news delivers **level 3 before a potential midweek reversal**. [14:06]–[14:36]
- **Full worked sequence:** consolidation+OI-rise → breakdown traps traders → SVC → OI drop on inside-left-side → W completes without releasing traps → consolidation+OI-rise → L1 → consolidation+OI-rise → L2 → big OI ramp into CPI → L3 → midweek reversal watch. [12:35]–[14:36]

## Data-source requirements
- **Open interest time series** (USD-denominated, per-exchange or aggregate) at 1h-or-finer resolution — available from free/cheap sources (Coinalyze, Coinglass, exchange APIs e.g. Binance futures OI). **Source/exchange never specified in the video** — flag: aggregate vs Binance-only can differ.
- OHLCV candles for the consolidation/level context; economic calendar (Forex Factory) for Rule 6.
- No Hyblock/TradingLite dependency — most replicable tool lesson in the set.

## Chart-dependent moments
- [05:03]–[06:03] The 16.5K W example — the consolidation boundaries and "slowly rising" OI slope are read visually.
- [08:34]–[09:35] "see where I've marked OI drop" — the size/duration of a meaningful OI drop is shown, not defined.
- [14:06] "a rather large increase" in OI before CPI — magnitude unquantified.
- [03:02] The 8-transaction-type table is on screen only (recoverable from first principles).

## Quantifiability: 4/5
Rules are relational (consolidating price × OI slope → breakout/fakeout/stop-hunt expectations) and directly codable against free data. Blocked from 5 by: no thresholds for "increasing/flat/decreasing" OI (needs slope/percent definitions), no formal consolidation detector, and unspecified OI source/aggregation.

## Suspected mishears / unclear passages
- [00:00] "Open interest **tables** the total positions" → "**tallies**".
- [00:30] "Open interest means that both longs and shorts are entering" → missing word: "**An increase in** open interest means...".
- [01:31] "500 million at **505 pm** ... at **605 pm**" → 5:05pm / 6:05pm.
- [02:01] "**Buying sells** are not the same thing as longs and shorts" → "**Buys and sells**".
- [06:03] "it might just be **continued** volatility" → unclear; possibly "**contained**" or "**reduced**" volatility (context: fakeout, no cascade).
- [13:36] "this **bought** us level one rise" → "**brought**".
- "Wformation/Mor/Wsee/Wand" concatenations throughout.

## New jargon
- **OI delta** — the change in open interest (±$).
- **Liquidity cascade** — chain-triggered stops/liquidations on breakout.
- **Transfer of contracts** — OI-flat regime (positions changing hands).
- **Trapped traders / releasing the trap** — breakeven-revisit logic on the W's second side.
- **Post-level-1 / post-level-2 entries** — OI-timed board-meeting entries when the M/W was missed.

## Visual findings (watch pass 2, 2026-07-11)
- [00:00] Opens on a "Trade by Design — PART ONE" title card (tradetravelchill.com) — this lesson belongs to the Trade by Design module.
- [01:00] Definitions slide confirms the numbers and fixes the mishears: "$500 million to $505 million → OI Delta +5million"; "$500 million to $490 million → OI Delta −10mil"; unchanged example is "$500 million at **5:05pm** ... at **6:05pm**" (mishear resolved). Frame: `media/open-interest/oi-increase-decrease-unchanged-definitions.jpg`.
- [02:10] The 8-transaction-type table captured in full (Market Buy/Sell × Limit Sell/Buy × entering/exiting → Increase/No Change/Decrease). Credit line printed on the slide: **hyblockcapital.com** — the table (and likely her OI framework) sources from Hyblock. Frame: `oi-eight-transaction-types-table-hyblock.jpg`.
- **OI indicator/source on screen:** the OI series is displayed as a small red/green candle/dot series in a sub-pane below price on TradingView-style charts. All example charts are cropped screenshots — **no legend or settings pane is ever visible**, so the exact indicator/exchange feed remains unconfirmed; the only on-screen attribution anywhere is the hyblockcapital.com credit. The data-source flag in this digest stands.
- [04:40–05:30] Rule 1 visual: inset labelled "Consolidation" with a green rising arrow drawn under the OI pane, red arrow to the breakout leg on the main chart. Frame: `oi-rising-consolidation-breakout-rule.jpg`.
- [06:35–07:10] Rule 2 visual: consolidation box with roughly flat OI in the sub-pane, then the fake spike up (big green candle immediately engulfed red) — the fakeout example. Frame: `oi-flat-consolidation-fakeout-spike.jpg`.
- [08:00–08:50, 13:20] Rule 3 fully annotated on-slide: "Consolidating" box → breakdown → "**Trapped Traders**" arrow at the LOW → "**Price Reaches Almost Break Even But Not Exact**" (yellow circle on the W's second side — her printed wording for the not-released trap) → "**OI Drop = Traders Exited**" arrow on the red OI dip. This defines the OI-drop marking the digest flagged as visual-only. Frames: `oi-drop-trapped-traders-breakeven-retest.jpg`, `oi-w-trapped-traders-zoom-annotated.jpg`.
- [10:20–12:20] The headline table exists as a printed slide, "**OI CHEATSHEET**": (1) Price Board Meeting + OI Increasing → "Breakout Incoming, SH Not necessary"; (2) Price Board Meeting + OI Decreasing or Flat → "Stop Hunt Likely Before Major Move Is Made"; (3) Price Retracing + OI Increasing → "Traders getting Trapped in an M or W or a Retrace before Continuation". Matches Rules 4–5 verbatim. Frame: `oi-cheatsheet-board-meeting-stop-hunt-rules.jpg`.
- [14:15] Rule 6 visual: Level One/Two boxes, "Consolidating" box at the top, a vertical dotted line labelled **CPI**, and a long green arrow under the rising OI running straight into the CPI line — the news-ramp → level-3 hint. Frame: `oi-ramp-into-cpi-level3-rule.jpg`.
- Contradictions: none — every transcript rule matches its slide; the cheatsheet wording is now exact.
- Teaching frames saved: 8 → `Strategy Codex/Annie/media/open-interest/`.
