# Sunsplitter ticket queue

Live coordination queue for the lead and helper chats (AGENTS.md v2 §1). Status and decisions are in `artifacts/PROJECT_STATUS.md`. History is in git: this file's tip-sync history up to PR #434 is in `git log -- docs/TICKET_QUEUE.md`.

Work branch: `version/0.30.1-main-reconcile-ci.1`. Branch tickets as `ticket/0.30.1-<name>`, one concern each.

## In flight

| Ticket | Owner | State |
|---|---|---|
| SUN-DIET-VESS-MERGE-01 (#529) | Lead | D11 Deep step 1, C10: `vess_signal` and `vess_cost` become one screen. Read and ready; waits on STATUS decision 25 (retire `vess_cost.jpg`). |
| SUN-LATE-HOUR-CAP-01 | Lead | Only if Manraj says yes to STATUS decision 26: one late hour a night, to the first pending partner in crew order. |

## Wave 1 — 0.37 Deeper Crew (ROADMAP §14A), in order

| Ticket | Scope |
|---|---|
| SUN-ROMANCE-ARC-01..05 | Lena, Mira, Vess, Amara, Sela. One PR per arc. Landed: #499, #500, #501, #502, #503. |
| SUN-CALLBACKS-01 | 12–15 diegetic callbacks across existing scenes (promise, attributable death, ideology). Landed: #506, thirteen. |
| SUN-CREW-FRICTION-01 | Four pair scenes where crew disagree with each other: Lena–Tomas on Rourke, Elias–Tomas on the Deck 4 feedstock, Mira–Jiro on the burn, Jiro–Vess on the fix. Landed: #508. |
| SUN-CREW-EPILOGUES-01 | One paragraph per crew member in What Remains. Landed: #509. |
| Orders get answers (L-057) | Choice replies: engine #514, Acts 1–2 #516, Act 3 #521. Decisions with no visible answer went from 34.3% to 2.9%. Reader staging: #515 (L-058), #520 and #522 (L-059). |
| SUN-ROMANCE-ENDINGS-REACH-01 | Decision 12 widened: every partner's last scene follows a late hour, whoever was picked at Last Off-Shift. Landed: #534. |

Gate 1: Manraj plays a full run on the tip; one stranger reads a full run; verify, coverage and the browser bot are green; face exposures stay at zero.

## D11 Deep (ruled 2026-11-06, no time target): next tickets

Plan and measurements: the project doc `claude/hex/2026-11-06-d11-run-length.md`. Cuts are for slack and for setups with no payoff, judged one at a time; the 20-minute figure is not a target (Manraj, 2026-11-06 evening).

- **Step 1** needs no lock. Landed: C01 (#524), C11/C12 (#525), the first trims (#526), C04 (#532). C10 is in flight above. Still to write:
  - C06: trim the `vault_reveal` explainer.
  - C07: trim `time_pass`.
  - C13: warmth vignettes.
  - C14: `power_crisis`.
  - C17: trim `crew_walk`.
  - C20: trim the opening.
  - C21: trim `offshift_open`.
  - C22: trim `aftermath` and `arc_fork`.

  One PR each, a Myth read for the prose, and a re-measure after each.
- **Step 2 is quality fixes (STATUS decision 19, ruled; no lock moves):**
  - SUN-PROMISE-PAYOFF-01: every promise made is tested or cited later (L-024 stays). Hex's design is in the project doc `claude/hex/2026-11-08-promise-payoff.md`; it waits on STATUS decision 27.
  - Friction restatements: landed as SUN-FRICTION-TRIMS-01 (#531).
  - Deaths once in What Remains: landed (#527, decision 21).
  - Off-shift lead-ins are not cut (L-050 stays). What Remains is not cut (L-008 stays).
- **Small tickets.** Landed: the phone-landscape plate (#533), `offshift_jiro` (#531), `time_pass` and the hatch count (#528), the hub resume line (#535). Open:
  - the `arc_living_4` "double cycle" sentence (decision 22);
  - five flags written but never read;
  - a death printed three times when a broken promise kills its holder;
  - "You are the Commander." read three times in the opening;
  - the plate cover-crops about 40% at 768×1024;
  - `final_choice`'s "Other debts are louder." with nothing after it (probably unreachable).

## Waiting on Manraj

- Gate 1: a full run on the tip (`playtest-c4d748c`, sent 2026-11-09) and one stranger's full read (D10).
- STATUS decisions 25 (#529's `vess_cost.jpg`, and the plates behind the screens #525 left unfolded), 26 (one late hour a night), 27 (the promise payoff design), 28 (which lead session continues) and 24 (L-061, a hub visit counter).
- STATUS decisions 14/23 (the friction plates and L-060 for the pair flags), 17 (What Remains crew block on the L-008 row), 20 (Jiro and the insertion pass), 22 (`arc_living_4`), 5 (`arc_future_2` speaker) and 8 (the art questions).
- Close the stale PRs listed in STATUS.

## Helper asks (once each helper chat exists)

| Helper | Ask |
|---|---|
| Myth | Done in the lead chat (decision 15): #508, #509, #511, #516, #521, #524, #525, #526, #529, #531, #532 and #534 read, edits applied. Next: each D11 step 1 ticket as it opens. |
| Hex | Done: the romance reach measurement (weekly watch 2026-11-07; fixed by #534) and the promise payoff design (2026-11-08). Next: re-measure run length after the next step 1 batch. |
| Muse | Audit the face map in `src/engine.js` `PLATE_FACES` against the official portraits, starting with `images/vess_boarding.jpg` (shows Lena's face, ungated). No new art until Wave 4. |

## Standing holds

- Never merge #297, #376, #401–#403, #405, #407, #408, #410, #411, #414 or #416. Leave PR 45 and draft PR 46.
- ART-R2 held except people-free fallbacks. Amara route parked (the romance-trigger gates; SUN-ROMANCE-ARC-04 added an end state behind Last Off-Shift without touching them — STATUS decision 12 asks Manraj whether the hold stays). Leftover 13 (ending cinematic) parked for Muse/HITL.
- Leftovers 10–12 are ALREADY_SATISFIED. F07 crew plate is ALREADY_SATISFIED. Do not remint either.
- No mint or certify, no Netlify, no `main` close-out, no leftover drain without Manraj. Wave paint moves only when he names it.
