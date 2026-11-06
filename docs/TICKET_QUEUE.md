# Sunsplitter ticket queue

Live coordination queue for the lead and helper chats (AGENTS.md v2 §1). Status and decisions are in `artifacts/PROJECT_STATUS.md`. History is in git: this file's tip-sync history up to PR #434 is in `git log -- docs/TICKET_QUEUE.md`.

Work branch: `version/0.30.1-main-reconcile-ci.1`. Branch tickets as `ticket/0.30.1-<name>`, one concern each.

## In flight

| Ticket | Owner | State |
|---|---|---|
| SUN-ROMANCE-ARC-02 (Mira) | Lead | This PR. `mira_root_cause` pair after the cross-feed board, the Last Off-Shift callback and the ending footer. |
| SUN-ROMANCE-ARC-03 (Vess) | Lead | Next. |

## Wave 1 — 0.37 Deeper Crew (ROADMAP §14A), in order

| Ticket | Scope |
|---|---|
| SUN-ROMANCE-ARC-01..05 | Lena, Mira, Vess, Amara, Sela. One PR per arc. |
| SUN-CALLBACKS-01 | 12–15 diegetic callbacks across existing scenes (promise, attributable death, ideology). |
| SUN-CREW-FRICTION-01 | Three or four pair scenes where crew disagree with each other. |
| SUN-CREW-EPILOGUES-01 | One paragraph per crew member in What Remains. |

Gate 1: Manraj plays a full run on the tip; one stranger reads a full run; verify, coverage and the browser bot are green; face exposures stay at zero.

## Waiting on Manraj

- Gate 1 (above) once the Wave 1 tickets land.
- STATUS decision 8 (art questions from the roster audit).
- Close the stale PRs listed in STATUS.

## Helper asks (once each helper chat exists)

| Helper | Ask |
|---|---|
| Myth | Review the SUN-ROMANCE-ARC-01 lines (`lena_last_hour`, scenes-48; the partner line in `act3_lethal_lena_clock`, scenes-19; the held-only line in `offshift_lena`; the ending footer in engine.js) and the SUN-ROMANCE-ARC-02 lines (`mira_root_cause` and `mira_root_cause_logged`, scenes-24; the callback in `offshift_mira`, scenes-49; the footer). Both landed after an independent fresh-agent read; a second read in your own chat is welcome. Then each later arc PR's new lines before merge (voice, continuity, dead-character honesty). Also the lead-written lines from #482 (tether floor), #483 (unreadable save) and #490 (failed burn); rule on the `offshift_elias` mending/unmended contradiction and the `arc_future_2` author note. |
| Hex | Measure how often each romance is pursued to its last scene after SUN-ROMANCE-ARC-01..05 land; propose trust or cost tuning if any arc is unreachable in practice. |
| Muse | Audit the face map in `src/engine.js` `PLATE_FACES` against the official portraits. No new art until Wave 4. |

## Standing holds

- Never merge #297, #376, #401–#403, #405, #407, #408, #410, #411, #414 or #416. Leave PR 45 and draft PR 46.
- ART-R2 held except people-free fallbacks. Amara route parked. Leftover 13 (ending cinematic) parked for Muse/HITL.
- Leftovers 10–12 are ALREADY_SATISFIED. F07 crew plate is ALREADY_SATISFIED. Do not remint either.
- No mint or certify, no Netlify, no `main` close-out, no leftover drain without Manraj. Wave paint moves only when he names it.
