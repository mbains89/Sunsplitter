# Sunsplitter — Current Status

`schema_version: 3`
`updated_utc: 2026-11-06`
`work_branch: version/0.30.1-main-reconcile-ci.1`
`work_branch_tip: e4fb732 (after PR #527)`
`main_sha: e5a71fc342f0d4bb151ccee92e989b65e2d0ab5a (close-out PR #492, 2026-11-05; NOT_CERTIFIED)`
`source_main_sha: 8d23109b63b844e0703fb36643f14b91b8800c90`
`netlify_production: deploy 6ab363f139fc952b12339989 · commit 0e7535d (PR #371, 2026-09-23) · API deploy`

This is the live page: where the work branch is, what landed, what is open, and the single next action. Process is in `/AGENTS.md` (contract v2), dispositions are in `LOCKS.md`, and approved scope and order are in `ROADMAP.md`. Vocabulary follows ROADMAP §1. **LANDED ON VERSION LANE** means merge-committed into the work branch. It is not on `main` and not certified.

## Release and authority state

`last_certified_baseline_label: 0.28.1d`
`version_integrity: NOT_CERTIFIED`
`release_state: NO-PUBLISH`
`release_artifact: none authorized`
`deployment: none authorized`
`sequential_gate_closure: none credited from 0.28.2 onward`
`pc_readiness_0_36: tip-named pack closed-for-FEED (NOT certified; 0.36 PAINT; last certified 0.28.1d)`
`pc_readiness_0_36_bot_evidence: docs/SUN_036_BROWSER_EVIDENCE.md — candidate evidence for the ROADMAP §11 exit; not an exit`
`browser_bot_latest: 07a9748 (after #523–#526), 2026-11-06 — 4/4 runs reached an ending (phone/touch seed 1106: 2 runs, 0 findings; desktop/mouse/chaos seed 1107: 2 runs, 25 reloads, 8 resizes, 1 finding). The finding is RESUME_DRIFT at `act3_spine_next`: after reload and Continue, a later hub visit regains Tomas's one-shot "Names first, then numbers" allusion (pre-existing 0.27.2 resume logic, exposed by #524's short return line); ticketed as SUN-HUB-ALLUSION-RESUME-01.`


- `main` is `e5a71fc`, the close-out of the lane through `8ff92ad` (PR #492, Manraj's go 2026-11-05). All three `main` gates passed on the head. That is evidence, not certification. `source_main_sha` above stays the lane's starting point. The next close-out needs Manraj's go.
- **Netlify production is not the work branch.** The live production deploy, observed 2026-11-05 through the Netlify API, is commit `0e7535d` from 2026-09-23. That is roughly 300 commits behind the tip. Earlier STATUS text named `a91a26d` as the owner playtest pin, but the API shows `0e7535d` live. Any redeploy or repin needs Manraj's explicit go.
- `VERSION.md` paints `0.36`. That is paint, not certification.
- Current art is **PRESENT / UNRECONCILED / NO INTEGRATION OR RELEASE CREDIT**. Image presence implies no art approval, roster approval, publication right or release credit.
- PR 45 and draft PR 46 remain held and untouched.

## Roles

Per AGENTS.md v2: Manraj owns product, canon, art, locks and every publish action. Claude is lead in the Sunsplitter project's lead chat, merges ticket PRs into the work branch once CI is green, and keeps this page current. The helper chats are Myth (story), Hex (balance) and Muse (art audit). They propose, and they do not merge. The Grok, Build and Art bot lanes are retired; their receipts stay as history.

## Landed since the last STATUS (`e14ca7d`, PR #433)

**Before the lead handover (#434–#473):** 0.36 PC-readiness work, including desktop matrix and phone-regression harnesses, title states, input integrity, tutorial zoom and sticky fixes, pause pressed state, high contrast, wide crew sheet and plate prefetch. Also the playerflow cost checks, the stress harness, CI repair, the file-shrink and roadmap-tax guards, F07 crew plate, and continue probes.

**Lead (Claude), 2026-11-05:**

| PR | Ticket | Player-visible change |
|---|---|---|
| 480 | SUN-AGENTS-CLAUDE-LEAD-01 | AGENTS.md contract v2 and the PR template. Process only. |
| 474–477 | SUN-CORRIDOR-FALLBACK-01..03, SUN-CORRIDOR-SCENES-04 | People-free fallbacks no longer show crew faces, with per-scene guards. |
| 478 | SUN-REVIEW-VERSION-SUFFIX | Hotfix-letter saves (`0.28.1d`) compare correctly. |
| 479 | SUN-REVIEW-PC-VIEWPORT-CROP | PC plates are no longer cropped. |
| 481 | SUN-MODAL-HOTKEYS-01 | Digit and Enter keys no longer fire story choices behind open dialogs. Dialogs take and return focus. |
| 482 | SUN-TETHER-FLOOR-01 | The tether sighting always has an affordable exit. |
| 483 | SUN-UNREADABLE-SAVE-01 | An unreadable save is named on the title screen, and starting a new run asks before replacing it. |
| 484 | SUN-PLATE-FACES-05 | Any plate showing a dead or absent crew face falls back to an empty corridor. Probe: 0 exposures across 2,025 renders. |
| 485 | SUN-LEGACY-DEATHBEAT-01 | Legacy resume lands on the four Act III death beats instead of skipping them. |
| 486 | SUN-DOCS-TRUTH-01 | This page, ROADMAP roles, and the live ticket queue. Process only. |
| 487 | SUN-SCENE-COVERAGE-01 | CI check: 300 seeded runs must reach all 223 live scenes, with no dead ends. |
| 488 | SUN-CREW-FOCUS-DIGITS-01 | Digit shortcuts keep working after clicking Crew. Found by the browser bot. |
| 489 | SUN-BROWSER-BOT-01 | `scripts/sun-browser-bot.mjs`, a manual real-browser full-run tool, plus the 0.36 keyboard and resume evidence in `docs/SUN_036_BROWSER_EVIDENCE.md`. |
| 490 | SUN-FINAL-HOLD-ONCE-01 | After an aborted hard burn, Hold is no longer offered. Ends the cohesion/lean lap (ruling 6A). |
| 491 | SUN-UNREADABLE-EXPORT-01 | An unreadable save can be downloaded byte-for-byte before a new run replaces it (ruling 2). |
| 492 | Close-out | Lane → `main` @ `e5a71fc`. The post-merge strict rerun on `e5a71fc` passed (run 42100031310). |
| 493 | SUN-CLOSEOUT-RECORD-01 | Recorded the close-out ruling. Process only. |
| 494 | SUN-PLATE-FACES-06 | The face gate covers the five HITL plates that show crew, on every resolver path. Exposures went from 13 to 0. |
| 495 | SUN-ART-R2-FALLBACKS-01 | A blocked plate falls back to an empty plate of its own setting (berths, observation, vault) from the held ART-R2 reserve. |
| 496 | SUN-HITL-SHADOW-02 | 27 owner-approved HITL event plates that were mapped but shadowed by each scene's older image now render, each face-gated with a roster checked by eye. |
| 497 | SUN-HITL-LATE-SIX-01 | The six approved Grok Imagine frames (XCckB, CzOb5, wT0pe, SJDX2, 8flOC, njQ5P) were never saved in September. They were recovered from the Grok `$ Art` chat with Manraj's go, and now replace the as-is plates. |
| 498 | SUN-ROADMAP-WAVES-01 | Records Manraj's 2026-11-05 approval of the feature roadmap: four growth waves at 0.37–0.40, the review path renumbered to 0.41–0.44, and sub-locks L-050–L-056. Process only; no gameplay change. |
| 499 | SUN-ROMANCE-ARC-01 | Wave 1, Lena. The hour she asked for in Last Off-Shift is now a scene (`lena_last_hour`), offered to a partner or to the player who held her hand and took nothing; her private debt is spoken inside the Act III lethal; the ending cites the hour and the held-only path from run facts. One flag (`lena_last_hour`), no resources, no new art. |
| 500 | SUN-ROMANCE-ARC-02 | Wave 1, Mira. After the Commander overrides local at the cross-feed board to keep her, a partner is asked the question she cannot verify — the drive, or her — and answers; she replies in kind (`mira_root_cause`, `mira_root_cause_logged`). Last Off-Shift and the ending cite the answer. One flag (`mira_root_cause`: drive / you / both), no resources, no new art. |
| 501 | SUN-ROMANCE-ARC-03 | Wave 1, Vess. Item two in the relay bay has a scene behind it: the chair rated for one, her terms, your answer, her ruling (`vess_item_two`, `vess_item_two_logged`); the final choice names the spent long-range window; the ending cites the answer. One flag (`vess_item_two`: floor / chair), no resources, no new art. |
| 502 | SUN-ROMANCE-ARC-04 | Wave 1, Amara (solo shape). After the absolution hour a partner can stay past the light: she opens her ledger to the Commander's page and reads the run's entries, then asks whether to leave it open (`amara_page`, `amara_page_reply`); her private vent-delay debt is spoken inside `prom_vent` and `breath_garden`; the ending cites the answer. One flag (`amara_page`: open / closed / hers), no resources, no new art. The Amara route gates are untouched. |
| 503 | SUN-ROMANCE-ARC-05 | Wave 1, Sela, the last of the five. After the ritual for one person a partner can stay past amber: she reads back the vow (logged, private, refused or never asked), the second key, and the promise if it was tested, then waits (`sela_past_amber`, `sela_past_amber_reply`); the vow is spoken inside the petition test and the second key is named in her dialect; the ending and the Yellow Circle cite the answer. One flag (`sela_amber`: meaning / sentence / silence), no resources, no new art. |
| 506 | SUN-CALLBACKS-01 | Wave 1, workstream 2. Thirteen diegetic callbacks across existing scenes: Elias on the vented ring, the vault kept cold and Deck Four's record; Tomas on the ring's plates, the private stores and the dead's ration share; Jiro logging a final position; Lena on Rourke's chart; Mira on the answer she was given at the schematic, the refused or accepted binding and Lena's diversion; Sela on the petition; Amara's plate after a vented pocket. Text only, gated on run facts and living speakers; no state, no choices, no art. |
| 504 | SUN-MYTH-WORDING-01 | Myth's first review, landed as wording only: the tether floor trimmed to a two-beat order, the uncommitted failed-burn line given its antecedent, `offshift_elias` opens on the unmended jacket (the mending opener belonged to the cut alive-Mira branch), `arc_future_2` attributions turned into prose and the dangling "without him" removed, two Mira footer lines tightened. The `arc_future_2` speaker reassignment is left for decision 5. |
| 505 | SUN-PLATE-FACES-07 | Muse's roster audit, landed as hide-only: `observation.jpg` (Tomas, Elias, baked crew text) and `observation_bridge.jpg` (baked HUD text) leave every fallback for the people-free ART-R2 wreck and bridge plates; `arc_future_4` leaves the three-welder plate; `vess_boarding.jpg` is gated on Lena, who is dead in about a third of its renders; nine defensive `PLATE_FACES` rosters. No new art, nothing shown more. |
| 507 | SUN-VERIFY-MODES-DOC-01 | Docs only. The Mode A paragraph in `docs/VERIFY_MODES.md` now says the `src` pin fires only on the work-branch or fixture checkout, and that a ticket-branch bare PASS is real but not certification. |
| 508 | SUN-CREW-FRICTION-01 | Wave 1, workstream 3. Four one-shot pair scenes where two crew disagree with each other in front of the Commander, each answering their own reflex question: Lena and Tomas on Rourke, chart against count, from `act2_spine_next` (`pair_triage_chart`); Elias and Tomas on the Deck 4 feedstock, bulkhead against slate, from the hub (`pair_seal_ledger`); Mira and Jiro on the reckoning burn, finding against width (`pair_burn_archive`); Jiro and Vess on whose position is truer, fix against track (`pair_fix_track`). Each keys its text on the run fact it argues about, offers three answers that write one flag and a small affinity nudge, shows both of them acting on the ruling in a reply scene, and is never offered again. No resources, no new crew, no new art: two owner-approved plates that had never reached the screen (`arc_living_3.jpg`, `arc_future_3.jpg`) carry the seal and burn pairs, face-gated to both speakers; the other two use a Tomas-only corridor and the people-free wreck. |
| 509 | SUN-CREW-EPILOGUES-01 | Wave 1, workstream 4. What Remains gains a second block, "The crew": one paragraph per crew member, alive or dead, in crew order, each in that character's own lens for the dead (Lena clinical fact, Elias by what he covers, Mira by what she built, Tomas by habits, Amara by what she tended, Jiro by a logged position, Sela by names at yellow, Vess by registry order), citing only this run's facts: the logged cause of death, tested promises, private lines, the vault decision against the side they stood for, recorded answers and pair outcomes. Untested promises stay silent (L-024); the dead are past tense; unrecovered crew get one sentence. Rendered in its own element under the unchanged 3–6 reflection lines, so L-008's cap and every check that pins them hold. `crewEpilogues()` in `src/state.js`; `sun-playerflow-crew-epilogues-checks.mjs`. No state, no choices, no art. |
| 510 | SUN-DESKTOP-CHOICE-OVERLAP-01 | On short desktops (1024 wide, 800 tall or less) the choices follow the text instead of sitting over it; at 1280×800 they hid up to 440 px of unread text on `vault_reveal`. |
| 511 | SUN-FINAL-DESTINATION-READ-01 | The final order and Jiro's briefing say where the window opens (the rogue planet when a heading was committed or the position is certain); "You still have no destination." stays wherever no heading was committed. Myth read: ready as written. |
| 512 | SUN-AMARA-WALKIN-GATE-01 | Asking Amara and Tomas to stop closes the walk-in at both offers (`intimacy_window` and the hub), ending a repeat lap. |
| 513 | SUN-PRIVATE-PACKAGE-STAMP-01 | The private package builder allows exactly one same-origin manifest read in `review-build-stamp.js`, so it builds on the current tree again. Tooling. |
| 514 | SUN-REPLY-ENGINE-01 | **L-057.** A choice may carry `reply`: one to three lines that open the next screen once. Speakers who are dead or unrecovered are dropped; never saved; not replayed on Continue; dropped on run-ending choices. Validator shape rules and a playerflow check. |
| 515 | SUN-PRICE-TAGS-01 | **L-058 (D14).** Enabled choices show no cost tags by default; the status bar pulses after the order; "Show costs on choices" (title) and "Costs" (meta bar) restore them. Disabled choices keep their reason; trust locks name only a living, recovered person. |
| 516 | SUN-REPLY-BEATS-ACT1 | **L-057 prose, Acts 1–2.** 47 replies in 18 scenes, so orders get an answer from the crew. Myth read applied (1 blocking, 12 edits). |
| 517 | SUN-NO-REPEAT-LAP-01 | CI check: 2,000 seeded real-play runs never walk the same scene loop twice. The allowlist emptied once #512 landed. |
| 518 | SUN-REACTION-REPORT-01 | `scripts/sun-reaction-report.mjs`: how often a decision gets no visible answer, with a determinism proof. Tooling, not in CI. |
| 519 | SUN-STYLE-UNCLOSED-RULE-01 | A missing `}` in `style.css` had silently swallowed the title chip styles after `.new-run-confirm-chip`. |
| 520 | SUN-PACED-REVEAL-01 | **L-059 (D15).** Scene text arrives a paragraph at a time by default (tap, Space, Enter or → reads on; Show all; "Text: paced / instant" on the title and meta bar); resume and Continue show the scene whole; choices follow the last paragraph; a slow plate push-in, off under reduced motion. Both of Manraj's conditions are met: Read on stays in view on phones (50 → 0 of 193 scenes at 390×844), and Muse's crop check of 120 plates holds `tether_dock_ruined.jpg` still. |
| 521 | SUN-REPLY-BEATS-ACT3 | **L-057 prose, Act 3 and leftovers.** 54 replies in 22 scenes. Myth read applied (3 blocking, 12 edits). Decisions with no visible answer: 34.3% this morning → 3.0% (`sun-reaction-report --runs 40`). |
| 522 | SUN-READON-STICKY-02 | A #520 follow-up. Read on is sticky only while `#main` shows at least 160 px, so in phone landscape or a squeezed layout it no longer covers the text. The browser bot taps the top of the passage. Independent review applied. |
| 523 | SUN-RULINGS-2026-11-06 | Docs only. L-057, L-058 and L-059 rows in LOCKS and ROADMAP §2; decisions 15 and 16; D11 = Deep; the STATUS and queue close-out for #508–#522. Independent review applied. |
| 526 | SUN-DIET-TRIMS-01 | **D11 Deep step 1.** Text-only trims of six spine and opening scenes, about 1.7 prose minutes a median run. Also cut the `status` "one hundred percent" line that lied after the Living choice. Myth read applied (3 restores, 1 word). |
| 524 | SUN-DIET-HUB-01 | **D11 Deep step 1, C01.** The corridor hub paragraph prints on the first visit of a run; a return shows a 13-word line. About 0.75 minutes a run. The return is inferred from existing one-shot keys, never written; a clean visit counter would need a new state key (decision 24, L-061). Myth read applied. |
| 525 | SUN-DIET-REPLY-FOLD-01 | **D11 Deep step 1, C11 and C12.** Eleven one-line answer screens fold into the previous choice's `reply`, words unchanged; about three fewer screens a run. Their scene ids are retired (`EXPECTED_SCENE_COUNT` 242 → 231) and `RETIRED_SCENE_EXITS` in the engine resumes old saves parked on one. `big-delete-ok` on Manraj's go. Myth and code read applied (19 edits). |
| 527 | SUN-WHATREMAINS-DEATH-ONCE-01 | **Decision 21.** A death prints once in What Remains: the logged cause stays in the reflection lines, and a dead crew member's paragraph now opens on the person ("Lena was dead when the run ended.") instead of repeating the cause clause. L-008 unchanged. The crew-epilogues check pins the new shape and that the cause is never repeated. It also carried the STATUS and queue close-out for #523–#526 and the evening rulings. Myth read applied (Tomas habit line, Mira patch mirror). |
| 529 | SUN-DIET-VESS-MERGE-01 | **D11 Deep step 1, C10.** Vess's recovery is one screen: the signal, then the docking cost (one restated sentence dropped), then the two docking choices unchanged. The one-exit "Prepare the intercept" screen is gone. `vess_cost` is retired (`RETIRED_SCENE_EXITS` → `vess_signal`; `EXPECTED_SCENE_COUNT` 231 → 230; out of `HITL_EVENT_PLATE_IDS`; `images/vess_cost.jpg` stays on disk, unwired). The cost writes move to entry, and both docking choices also set `busDowngraded` and `reaction_mass_spent`, so a pre-merge save parked on the signal still pays. Myth read applied (dead-Mira board line). |

## Open

**Lead queue (no owner decision needed):**

- **Wave 1, 0.37 Deeper Crew (ROADMAP §14A): written.** It covers the five romance arcs (#499–#503), callbacks (#506), crew friction (#508) and per-crew epilogues (#509). Since the deep dive it also carries "orders get answers" (L-057: #514, #516, #521) and reader staging (L-058 #515, L-059 #520/#522). Gate 1 (Manraj's full run plus one stranger's full read) is next.
- **D11 = Deep (ruled 2026-11-06), with no time target.** Manraj's words that evening: "We dont have to stick to the 20 min target. dont artificially limit the game due to that." Cuts are for slack and for setups with no payoff, judged one at a time. The measurements are in the project doc `claude/hex/2026-11-06-d11-run-length.md`: a median run was 101 screens and 45 prose minutes before step 1, and 99 screens and about 42 prose minutes on `07a9748` after its first batch.
  - **Step 1 (slack, no lock) landed its first batch:** #526 (trims), #524 (C01 hub once), #525 (C11/C12 reply fold). Remaining step 1 tickets, one PR each with a Myth read and a re-measure: C04 (`ship_memory_payoff` into the final preamble), C06 (`vault_reveal` explainer), C07 (`time_pass`), C10 (`vess_signal` + `vess_cost`), C13 (warmth vignettes), C14 (`power_crisis`), C17 (`crew_walk`), C20 (opening), C21 (`offshift_open`), C22 (`aftermath`, `arc_fork`).
  - **Step 2 is quality fixes, not lock cuts (decision 19, ruled):** `SUN-PROMISE-PAYOFF-01` (every promise made is tested or cited later; about 80% of runs make one, about 23% see it tested); `SUN-FRICTION-RESTATE-TRIM-01` (keep all four pair scenes, trim only lines where a character restates a point); deaths once in What Remains (decision 21, this PR). The remaining slack items in the analysis (repeated stock-takes, numbers-only scenes, result screens) are judged one at a time.
- **Small tickets found today:**
  - `arc_living_4` promises an unwired "double cycle" option (decision 22).
  - SUN-HUB-ALLUSION-RESUME-01: a resumed corridor hub can reprint Tomas's one-shot allusion from an earlier visit (browser bot, seed 1107). The resume branch cannot tell "spent on this visit" from "spent earlier" in saved state; a clean fix wants the hub visit counter (decision 24, L-061) or a design proposal.
  - In phone landscape the plate leaves `#main` about 75 px for text.
  - Flags written but never read: `embryo_ceiling`, `leadership_style`, `vault_face`, `busDowngraded`, `reaction_mass_spent`.
  - `offshift_jiro`'s two `isAlive("mira")` branches are identical.
  - `time_pass` leaves a dangling "her" when Mira is dead.
  - "Nine of you cleared the hatch." appears twice, in the prologue and in `wake`.
- Keep running `scripts/sun-browser-bot.mjs` batches after each batch of merges, and fix what it finds as one-PR tickets.
- Playtest bugs Manraj reports become one-PR tickets on the work branch (ROADMAP §14/§15). Manraj will play once there is more substantial progress (2026-11-05).
- Helper-chat bootstraps are saved in the Sunsplitter project (`claude/sunsplitter-helper-bootstraps.md`), ready when Manraj opens those chats.

**Stale PRs to close.** Manraj closes these; the lead's close calls are blocked by the session's permission policy. #297 and #304 (Copilot; #297 is on the do-not-merge list), #389 and #390 (superseded by #481), #407 (superseded), #436, #445 and #465 (retired multi-bot roadmap docs), #451 (superseded by the landed 0.36 keyboard work), #452 (superseded by #474–#477 and #484).

## Decisions for Manraj

**Open:**

1. **Playtest build.** Production still shows `0e7535d`, from September. Manraj ruled on 2026-11-05: skip the deploy for now. Private playtest zips are sent in the lead chat instead: `preview-a45a6ac` (a preview merge, not on the work branch) and `playtest-b1ae936` (the work-branch tip, end of 2026-11-06).
4. **Story wording, for Myth review.** Done: Myth read all three and the trims landed in #504 (2026-11-06). Nothing left to rule.
5. **Story consistency, for Myth.** The `offshift_elias` contradiction and the `arc_future_2` author note are fixed in #504. Still open, one question: may the `arc_future_2` vault-ceiling briefing move from Jiro, who is never aboard when the scene plays, to Sela, with the board fallback when she is dead? Myth's proposed text is in `claude/myth/2026-11-05.md` §2b. Lead's recommendation: yes; Sela is the keeper and the only crew member whose reflex is what the ceiling means. If no, the scene is already honest as landed.

9. **Lena, from SUN-ROMANCE-ARC-01 (Wave 1):**
   - PX5-D01 is still unruled: may the last regenerative and the second night stay one transaction in `pursuit_lena`? The arc ships with it unchanged.
   - Her backstory has two versions: `src/state.js` (trauma surgeon from the orbital hospitals, lost her staff) and `artifacts/FABLE_CASCADE_BACKGROUND.md` (commissioning medical officer, mid-shift, forty-one names). Neither is ruled canon; the new scene uses neither.
   - The deferred "Lena disposition beat" (one word on the forty-one-name list, never rendered) could live in `lena_last_hour`. It commits to the Fable backstory, so it waits for the ruling above.
   - `images/offshift_lena.jpg` (locked 2026-08-25 off-shift plate, never wired; dirty-blonde, freckles, blue eyes, coat open) could replace `medbay_dim` on `lena_last_hour`. Wiring it is an art call: yours.
   - The hour is closed to a partner who broke the medical line at `prom_line` (`promises.lena === "broken"`), by the same rule that closes her other offers (`romanceOpen`). Say so if she should still open it.
   - The scene spends the bible's one mid-sentence self-dose (CHARACTER_BIBLE: "how the game says her clock moved") inside an optional partner scene. If that beat belongs on the spine instead, it moves.

10. **Mira, from SUN-ROMANCE-ARC-02 (Wave 1):**
   - PX5-D02 is still unruled: may the status-board disclosure and the second night stay one transaction in `pursuit_mira`? Shipped unchanged; the new scene reads the disclosure as a fact of the run.
   - PX5-F02 ("between you and the only exit") and PX5-F04 ("someone new") are still in `pursuit_window` / `pursuit_mira`; wording fixes if you want them, one PR.
   - Her backstory has two versions (`src/state.js` drive specialist vs `FABLE_CASCADE_BACKGROUND.md` commissioning engineer); the new scenes use neither.
   - The "you" answer spends the bible's spoken self fault-log ("Mira. Error. ...") inside an optional partner scene. Say so if it belongs elsewhere.

11. **Vess, from SUN-ROMANCE-ARC-03 (Wave 1):**
   - PX5-D06 / PX6-F03 is still unruled: accepting her offer writes `romance.vess` before the window choice, so "Keep the window" leaves a partner with no private hour. The new scene treats that player as a partner and says so in her words ("Logged as: pending"). Rule if you want acceptance-without-the-hour to count differently.
   - `images/vess_boarding.jpg` (replaced in SUN-HITL-WIRE-02) matches `vess.jpg` but also shows Lena's face and is not in `PLATE_FACES`; it renders with Lena dead. One-line gate fix if you confirm the face is hers — Muse audit.
   - The L-029 discard list still names `vess_boarding`, `vess_offer`, `vess_intimate` and `vess_signal` by filename although their bytes were replaced on 2026-09-27. Say whether the list should be re-cut to the current bytes.
   - The scene spends two bible beats once each: the "Dawnbreak log, personal" register and the day she stops correcting "Captain" (the correcting reflex itself had never shipped; the scene shows one correction before the one she lets stand).

12. **Amara, from SUN-ROMANCE-ARC-04 (Wave 1):**
   - **"Amara route parked"** (TICKET_QUEUE standing hold; origin: the `prom_r_amara` non-trigger note, SUN_PLAYTEST_ART_EVENT_AUDIT_01 §113–127) forbids rewriting the romance-trigger gates without a repro. This ticket does not touch them: `romanceOpen`, `bond_amara`, `romance_amara_1` and `prom_r_amara` are unchanged and the repro check still passes. Say whether the hold stays as written or is lifted now that L-050 names her arc.
   - Her end state sits behind `offshift_amara`, which needs an attributable death (`eligAmara`). A partner in a run with no attributable death never reaches it. Widening `eligAmara` for partners would need a no-death branch of that scene; your call.
   - Unruled PX-5 items on her: D03 (vent delay and the second night as one transaction), D07 (should a prior decline close the shared-bay offer; is full hydro an intentional gate; should the shared bay feed debt and What Remains) and F03 (the shared bay's "or at least no refusal" — the audit asks for affirmative, separate consent from both). None touched here.
   - The scene spends the bible's handwritten favor ledger (opened to the Commander's page).

13. **Sela, from SUN-ROMANCE-ARC-05 (Wave 1):**
   - PX5-D04 (may the private vow still reach the second night) and PX5-D05 (is the non-partner's "Stay past the yellow" an acceptance, presence or texture; it writes nothing) are still unruled. Neither is touched; the partner's new choice sits beside them.
   - Both vow paths write `sela_vault_vow: "accepted"`, so `pursuit_sela_sex`'s private-vow memory branch never runs and `prom_make_sela` treats a private vow as logged. The new scenes read `pursuit_sela_cost` instead, which is honest; the memory bug is a one-line fix if you want it.
   - The second-key line in `custody_shared` and the past-amber line spend the bible's canon that shared custody is a proposal in her culture's dialect, without saying the word. Say so if that beat should wait for the per-crew epilogues or for Wave 3's Yellow Circle route (L-051).

14. **Crew friction, from SUN-CREW-FRICTION-01 (Wave 1):**
   - Two owner-approved plates that had never reached the screen are wired to the new pair scenes: `arc_living_3.jpg` (Tomas and Elias, red-lit corridor, Commander's back) for the seal argument and `arc_future_3.jpg` (Mira and Jiro at a console in the records bay, Commander's back) for the burn argument. Muse rostered both on 2026-11-05 (`claude/muse/2026-11-05.md` B.5, B.6); the lead checked both against the portraits; no baked text; face-gated to both speakers. Veto returns them to the people-free wreck plate in one line.
   - The four pair flags (`pair_triage`, `pair_seal`, `pair_burn`, `pair_fix`) are recorded in `src/state.js` against ROADMAP §14A workstream 3 (the growth ruling), as the arc flags were against L-050. ROADMAP §2 asks for a recorded lock per new state key; the lead cannot mint one. Recommendation: one row, L-060, "Wave 1 friction and epilogue state: one flag per pair scene, written by the Commander's answer, read only by text; no meters", landing in the next LOCKS edit. Say no and the flags stay recorded against §14A as they are.
   - Choices in the four pairs carry affinity nudges of +2 / −1 (siding) or +1 / +1 (reconciling), the scale `pair_favor_confront` already uses. Balance is on hold (ROADMAP §15); this is not a rebalance, but say so if you want them at zero.
15. **Myth review before merge: RULED 2026-11-06.** Myth and Muse reads run in the lead chat as independent reviewer agents; Manraj picked "This chat; reviews here (Recommended)". Today's reads: #508, #509, #511, #516 and #521 (Myth); #520's plate push-in (Muse); #522 (code). Each verdict and its applied edits are in a comment on the PR.
16. **One lead at a time: RULED 2026-11-06.** The Orchestrator chat is the lead. The other session (`01S9qt…`) stops merging, and its PRs #508 and #509 passed to the Orchestrator and landed with Myth's edits.
17. **What Remains length (L-008 against §14A workstream 4).** L-008 (ROADMAP §8) fixes What Remains at 3–6 lines; the growth ruling's workstream 4 asks for one paragraph per crew member there. #509 reads the two together: the 3–6 reflection lines stay exactly as they were, and the per-crew block sits under them as a second section, "The crew", about 300–500 words. Recommendation: record on the L-008 row that the §14A ruling added the crew section beneath the capped reflection (one line in LOCKS, next LOCKS edit). If you would rather keep the screen at 3–6 lines, say so and the block moves behind a "Read the crew" button on the same screen instead.
18. **L-057, L-058, L-059: RULED 2026-11-06** and recorded in this PR (LOCKS rows, ROADMAP §2). They are choice replies, cost tags off by default (D14), and paced reveal (D15). Manraj's answers are verbatim in the project doc `claude/decisions/2026-11-06.md`.
19. **D11 step 2 locks: RULED 2026-11-06 (evening), "all three are approved."** Manraj approved the lead's revised recommendations, so no lock moves: **L-024** stays and promises get their payoff (`SUN-PROMISE-PAYOFF-01`); **L-050** stays and the off-shift lead-ins are not cut; **L-008** stays and What Remains only stops printing deaths twice (decision 21); crew friction keeps all four scenes and trims only restated lines. Verbatim in the project doc `claude/decisions/2026-11-06.md`.
20. **Canon, from the #521 read.** Is it canon that Jiro flies the insertion pass, days 181–184? `offshift_jiro` now says so, and no other scene does.
21. **What Remains, deaths once: RULED 2026-11-06** (inside decision 19). The cause stays in the reflection lines; the crew paragraph opens on the person. Landed as SUN-WHATREMAINS-DEATH-ONCE-01 (#527).
22. **`arc_living_4`'s "double cycle" sentence.** It has promised a third option since 0.28.1c, and the option was never wired. Myth recommends cutting the sentence; wiring it would be a new trade that needs Hex and you.
23. **L-060 (proposed), the pair flags from #508.** One row: "Wave 1 friction and epilogue state: one flag per pair scene, written by the Commander's answer, read only by text; no meters." This was proposed as L-057 before L-057 was ruled for replies.
24. **L-061 (proposed), a hub visit counter, from #524.** The corridor's first-visit paragraph is inferred from a dozen one-shot keys the hub's own offers spend, which errs toward showing the old text and is brittle to any new offer. A clean rule needs one new state key (a per-run `act3_spine_next` visit count, read only by that scene's text). Recommendation: yes, one row. Say no and the inference stays as landed.
25. **Plates behind folded screens, from #525.** About 2.5 more screens a median run could fold into reply lines, but each holds an owner-approved event plate that would then never show, including the only use of `work_elias.jpg`. Options: leave them as screens (as landed), or fold them and retire the plates from `HITL_EVENT_PLATE_IDS`. Recommendation: leave them; the plates were approved to be seen.

8. **Art questions from the SUN-HITL-SHADOW-02 roster audit:**
   - In `act2_tether_truth` and `aftermath_seal_holds`, does the short-haired man count as Elias? The gate currently treats him as Elias, so it errs toward hiding the plate.
   - Six plates show a sliver of the Commander's cheek, jaw or ear, never the eyes: `records_changeorders`, `act2_tether_lie`, `act3_reckoning_cut`, `act3_reckoning_briefing`, `aftermath_seal` and `aftermath_seal_order` (the most visible). Does that pass the faceless rule?
   - `vess_signal` and `vess_cost` show Mira and Elias, not Vess.
   - The `vault_reveal` fallback shows drawer racks, while the text says "cylinders".

**Ruled by Manraj, 2026-11-05:**

- **Growth roadmap, D1–D8: approved in full** (the *Sunsplitter Feature Roadmap Proposal*, lead doc). Recorded as ROADMAP §14A and LOCKS L-050–L-056 in SUN-ROADMAP-WAVES-01. Romance arcs to named end states; Story growth II widens Landfall and Yellow Circle; three save slots; one anonymous choice counter; cross-run memory that never changes an outcome; chapter start after a finished run; SFW toggle stays held; waves take 0.37–0.40 and the review path moves to 0.41–0.44; recruiting is the first tools spend.
- **2: yes.** Unreadable saves get an export escape hatch. This reverses the 0.32 fail-closed Export rule for unreadable bytes only. It lands as SUN-UNREADABLE-EXPORT-01.
- **3: keep.** Amara stays on intro slide 1.
- **6: A.** After an aborted hard burn, `final_choice` stops offering Hold. Landed in SUN-FINAL-HOLD-ONCE-01.
- **ART-R2: opened for people-free fallbacks only** (2026-11-05). Wired in SUN-ART-R2-FALLBACKS-01. The Sep-23 harvest candidates turned out to be different images from the approved cards, so they are discarded. The real six were recovered from the Grok `$ Art` chat on 2026-11-05 and are wired in SUN-HITL-LATE-SIX-01.
- **7: now.** Done as PR #492, `main` @ `e5a71fc`. Its head was `version/0.30.1-main-closeout.1`, at the same commit as the lane. The policy's general `version/*` → `main` route applied, because the lane's own name is bound to the August 10-path CI diff. No gate code changed. No tag, release, deploy, Netlify or certification came with it.

*Withdrawn 2026-11-05:* the earlier note that `act3_crisis_declare` is unreachable was wrong. Split-ideology runs reach it, as #487's coverage check confirms.

## L-025–L-028 dispositions

- **L-025 — LOCKED:** Commander Option B. The rendered-path gender/canon audit and document synchronization remain implementation work; this reconciliation changes no gameplay prose.
- **L-026 — LOCKED:** retain Last Off-Shift zero/one routes solely as tested defensive save-recovery guards and preserve `junctionChoice`. Required coverage remains implementation work.
- **L-027 — LOCKED:** retire `vess_course_lost` and its promised downstream-course consequence. Runtime removal remains implementation work.
- **L-028 — DEFERRED:** default RETIRE unless qualifying mobile-PX evidence meets the pre-registered, Manraj-approved threshold. No indicator is authorized.

L-020 through L-024 remain ruled.

## Blockers

- `NO-PUBLISH / NOT_CERTIFIED` remains controlling. No release artifact or deployment is authorized.
- The lead cannot close PRs or delete remote branches through the API in this session. Pushing a branch deletion works.

## Next action

**Lead:** land the rest of D11 Deep step 1 (C10, C04, C07 next) and the decision-19 quality tickets, one PR each with a Myth read and a re-measure; run a browser-bot batch after each batch of merges. **Manraj:** play the playtest build on the tip (gate 1, first half); name the gate-1 stranger (D10); rule 24 (L-061) and 25 (plates behind folded screens).

<!-- STATUS_COMPLETE -->
