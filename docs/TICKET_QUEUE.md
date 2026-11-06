# Sunsplitter ticket queue

Live coordination queue for the lead and helper chats (AGENTS.md v2 §1). Status and decisions are in `artifacts/PROJECT_STATUS.md`. History is in git: this file's tip-sync history up to PR #434 is in `git log -- docs/TICKET_QUEUE.md`.

Work branch: `version/0.30.1-main-reconcile-ci.1`. Branch tickets as `ticket/0.30.1-<name>`, one concern each.

## Next

One PR each, with a Myth read for any prose.

| Ticket | Owner | Scope |
|---|---|---|
| SUN-PROMISE-PAYOFF | Lead | STATUS decision 19 (L-024 unchanged): every promise made pays off, tested or cited later. Design first: the lead sends Manraj each promise and where it pays off, and prose starts only on his approval. |
| SUN-REMAINS-DEATH-ONCE-01 | Lead | STATUS decision 21 (L-008 unchanged): a death prints once in What Remains. The cause stays in the reflection lines; a dead crew member's paragraph opens on the person. |
| SUN-FRICTION-TRIMS-01 | Lead | STATUS decision 19: the four pair scenes from #508 stay; trim only restated lines. |
| SUN-CONTINUITY-01 | Lead; Myth proposes | Continuity fixes from the motions deep dive (item 9): the missing are missed, Vess named, template leaks, contradictions. |
| SUN-LANDSCAPE-PLATE-01 | Lead | In phone landscape the plate leaves `#main` about 75 px for text. |
| SUN-DIET-VESS-01 | Lead | Slack (C10): `vess_signal` and `vess_cost` become one screen. Re-measure after. |

## Wave 1 — 0.37 Deeper Crew (ROADMAP §14A), in order

| Ticket | Scope |
|---|---|
| SUN-ROMANCE-ARC-01..05 | Lena, Mira, Vess, Amara, Sela. One PR per arc. Landed: #499, #500, #501, #502, #503. |
| SUN-CALLBACKS-01 | 12–15 diegetic callbacks across existing scenes (promise, attributable death, ideology). Landed: #506, thirteen. |
| SUN-CREW-FRICTION-01 | Four pair scenes where crew disagree with each other: Lena–Tomas on Rourke, Elias–Tomas on the Deck 4 feedstock, Mira–Jiro on the burn, Jiro–Vess on the fix. Landed: #508. |
| SUN-CREW-EPILOGUES-01 | One paragraph per crew member in What Remains. Landed: #509. |
| Orders get answers (L-057) | Choice replies: engine #514, Acts 1–2 #516, Act 3 #521. Decisions with no visible answer went from 34.3% to 2.9%. Reader staging: #515 (L-058), #520 and #522 (L-059). |

Gate 1: Manraj plays a full run on the tip; one stranger reads a full run; verify, coverage and the browser bot are green; face exposures stay at zero.

## D11 run length (ruled 2026-11-06): no target

There is no run-length target (STATUS decision 19; ROADMAP §PX-2). Cuts remove only slack, repetition, or setups that never pay off, each judged on its own. Earlier measurements are in the project doc `claude/hex/2026-11-06-d11-run-length.md`; on `07a9748` a median run is 99 screens.

- **Step 1, landed:** #524 SUN-DIET-HUB-01 (C01, the hub paragraph once a run), #525 SUN-DIET-REPLY-FOLD-01 (C11/C12, eleven answer screens into replies, 242 → 231 scenes) and #526 SUN-DIET-TRIMS-01 (C06, C07, C17, C20–C22, ten opening and spine scenes trimmed). Each had a Myth read, applied before merge.
- **Slack candidates, judged one at a time:** C10 is `SUN-DIET-VESS-01` above. Then C04 (fold `ship_memory_payoff` into the final preamble), C13 (warmth vignettes) and C14 (`power_crisis`). Each is one PR with a Myth read and a re-measure.
- **Small tickets found today:**
  - the `arc_living_4` "double cycle" sentence (decision 22);
  - five flags written but never read;
  - `offshift_jiro`'s two identical `isAlive("mira")` branches.

## Waiting on Manraj

- The `SUN-PROMISE-PAYOFF` design, when the lead sends it.
- Gate 1: a full run on the tip (the end-of-day playtest build) and one stranger's full read (D10).
- STATUS decisions 14/23 (the friction plates and L-060 for the pair flags), 17 (the What Remains crew section on the L-008 row), 20 (Jiro and the insertion pass), 22 (`arc_living_4`), 5 (`arc_future_2` speaker) and 8 (the art questions).
- Close the stale PRs listed in STATUS.

## Helper asks (once each helper chat exists)

| Helper | Ask |
|---|---|
| Myth | Done in the lead chat today (decision 15): #508, #509, #511, #516, #521, #524, #525 and #526 read, edits applied. Next: the decision-19 tickets and the slack candidates as they open. |
| Hex | Measure how often each romance is pursued to its last scene after SUN-ROMANCE-ARC-01..05 land; propose trust or cost tuning if any arc is unreachable in practice. |
| Muse | Audit the face map in `src/engine.js` `PLATE_FACES` against the official portraits, starting with `images/vess_boarding.jpg` (shows Lena's face, ungated). No new art until Wave 4. |

## Standing holds

- Never merge #297, #376, #401–#403, #405, #407, #408, #410, #411, #414 or #416. Leave PR 45 and draft PR 46.
- ART-R2 held except people-free fallbacks. Amara route parked (the romance-trigger gates; SUN-ROMANCE-ARC-04 added an end state behind Last Off-Shift without touching them — STATUS decision 12 asks Manraj whether the hold stays). Leftover 13 (ending cinematic) parked for Muse/HITL.
- Leftovers 10–12 are ALREADY_SATISFIED. F07 crew plate is ALREADY_SATISFIED. Do not remint either.
- No mint or certify, no Netlify, no `main` close-out, no leftover drain without Manraj. Wave paint moves only when he names it.
