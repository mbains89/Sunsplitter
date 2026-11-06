# Sunsplitter ticket queue

Live coordination queue for the lead and helper chats (AGENTS.md v2 §1). Status and decisions are in `artifacts/PROJECT_STATUS.md`. History is in git: this file's tip-sync history up to PR #434 is in `git log -- docs/TICKET_QUEUE.md`.

Work branch: `version/0.30.1-main-reconcile-ci.1`. Branch tickets as `ticket/0.30.1-<name>`, one concern each.

## In flight

| Ticket | Owner | State |
|---|---|---|
| SUN-DIET-HUB-01 | Lead | D11 Deep step 1, C01: the corridor hub paragraph prints once a run. Draft PR; holds for a Myth read of the return line. |
| SUN-DIET-REPLY-FOLD-01 | Lead | D11 Deep step 1, C11/C12: one-line answer screens become the previous choice's reply. Draft PR; holds for a Myth read. |

## Wave 1 — 0.37 Deeper Crew (ROADMAP §14A), in order

| Ticket | Scope |
|---|---|
| SUN-ROMANCE-ARC-01..05 | Lena, Mira, Vess, Amara, Sela. One PR per arc. Landed: #499, #500, #501, #502, #503. |
| SUN-CALLBACKS-01 | 12–15 diegetic callbacks across existing scenes (promise, attributable death, ideology). Landed: #506, thirteen. |
| SUN-CREW-FRICTION-01 | Four pair scenes where crew disagree with each other: Lena–Tomas on Rourke, Elias–Tomas on the Deck 4 feedstock, Mira–Jiro on the burn, Jiro–Vess on the fix. Landed: #508. |
| SUN-CREW-EPILOGUES-01 | One paragraph per crew member in What Remains. Landed: #509. |
| Orders get answers (L-057) | Choice replies: engine #514, Acts 1–2 #516, Act 3 #521. Decisions with no visible answer went from 34.3% to 2.9%. Reader staging: #515 (L-058), #520 and #522 (L-059). |

Gate 1: Manraj plays a full run on the tip; one stranger reads a full run; verify, coverage and the browser bot are green; face exposures stay at zero.

## D11 Deep (ruled 2026-11-06): next tickets

Plan and measurements: the project doc `claude/hex/2026-11-06-d11-run-length.md`.

- **Step 1** needs no lock. Besides the two in flight above:
  - C04: fold `ship_memory_payoff` into the final preamble.
  - C06: trim the `vault_reveal` explainer.
  - C07: trim `time_pass`.
  - C10: merge `vess_signal` and `vess_cost`.
  - C13: warmth vignettes.
  - C14: `power_crisis`.
  - C17: trim `crew_walk`.
  - C20: trim the opening.
  - C21: trim `offshift_open`.
  - C22: trim `aftermath` and `arc_fork`.

  One PR each, a Myth read for the prose, and a re-measure after each.
- **Step 2** waits on STATUS decision 19 (L-024, L-050, L-008).
- **Small tickets found today:**
  - `status` says "one hundred percent" after the Living choice;
  - the `arc_living_4` "double cycle" sentence (decision 22);
  - the phone-landscape plate leaves `#main` about 75 px;
  - five flags written but never read;
  - `offshift_jiro`'s two identical `isAlive("mira")` branches.

## Waiting on Manraj

- STATUS decision 19: the three locks for D11 Deep step 2.
- Gate 1: a full run on the tip (the end-of-day playtest build) and one stranger's full read (D10).
- STATUS decisions 14/23 (the friction plates and L-060 for the pair flags), 17/21 (What Remains), 20 (Jiro and the insertion pass), 22 (`arc_living_4`), 5 (`arc_future_2` speaker) and 8 (the art questions).
- Close the stale PRs listed in STATUS.

## Helper asks (once each helper chat exists)

| Helper | Ask |
|---|---|
| Myth | Done in the lead chat today (decision 15): #508, #509, #511, #516 and #521 read, edits applied. Next: the D11 step 1 prose trims as they open. |
| Hex | Measure how often each romance is pursued to its last scene after SUN-ROMANCE-ARC-01..05 land; propose trust or cost tuning if any arc is unreachable in practice. |
| Muse | Audit the face map in `src/engine.js` `PLATE_FACES` against the official portraits, starting with `images/vess_boarding.jpg` (shows Lena's face, ungated). No new art until Wave 4. |

## Standing holds

- Never merge #297, #376, #401–#403, #405, #407, #408, #410, #411, #414 or #416. Leave PR 45 and draft PR 46.
- ART-R2 held except people-free fallbacks. Amara route parked (the romance-trigger gates; SUN-ROMANCE-ARC-04 added an end state behind Last Off-Shift without touching them — STATUS decision 12 asks Manraj whether the hold stays). Leftover 13 (ending cinematic) parked for Muse/HITL.
- Leftovers 10–12 are ALREADY_SATISFIED. F07 crew plate is ALREADY_SATISFIED. Do not remint either.
- No mint or certify, no Netlify, no `main` close-out, no leftover drain without Manraj. Wave paint moves only when he names it.
