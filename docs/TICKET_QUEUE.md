# Sunsplitter ticket queue

Live coordination queue for the lead and helper chats (AGENTS.md v2 §1). Status and decisions are in `artifacts/PROJECT_STATUS.md`. History is in git: this file's tip-sync history up to PR #434 is in `git log -- docs/TICKET_QUEUE.md`.

Work branch: `version/0.30.1-main-reconcile-ci.1`. Branch tickets as `ticket/0.30.1-<name>`, one concern each.

## In flight

| Ticket | Owner | State |
|---|---|---|
| Helper bootstrap prompts (Myth, Hex, Muse) | Lead | Draft. Saved in the Sunsplitter project, not in the repo. |

## Waiting on Manraj

See PROJECT_STATUS "Decisions for Manraj". The first one gates the rest: a preview deploy of the tip so playtest can resume on current bytes.

## Helper asks (once each helper chat exists)

| Helper | Ask |
|---|---|
| Myth | Review the lead-written lines from #482 (tether floor) and #483 (unreadable save). Rule on the `offshift_elias` mending/unmended contradiction and the `arc_future_2` author note. |
| Hex | Reproduce and size the cohesion farming loop at `final_choice`, then propose a fix. |
| Muse | People-free candidate for intro slide 1, if Manraj wants one. Audit the face map in `src/engine.js` `PLATE_FACES` against the official portraits. |

## Standing holds

- Never merge #297, #376, #401–#403, #405, #407, #408, #410, #411, #414 or #416. Leave PR 45 and draft PR 46.
- ART-R2 held. Amara route parked. 0.37 external review parked. Leftover 13 (ending cinematic) parked for Muse/HITL.
- Leftovers 10–12 are ALREADY_SATISFIED. F07 crew plate is ALREADY_SATISFIED. Do not remint either.
- No mint or certify, no Netlify, no `main` close-out, no leftover drain without Manraj.
