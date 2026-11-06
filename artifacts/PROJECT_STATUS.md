# Sunsplitter — Current Status

`schema_version: 3`
`updated_utc: 2026-11-06`
`work_branch: version/0.30.1-main-reconcile-ci.1`
`work_branch_tip: 3f45133 (after PR #507)`
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
`browser_bot_latest: cadf259 (src tree 2831f07, all five romance arcs in), 2026-11-06 — 28/28 runs reached an ending, 0 findings (phone and desktop × mouse, keys, touch, tab; chaos reloads and resizes)`

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
| this PR | SUN-CREW-EPILOGUES-01 | Wave 1, workstream 4. What Remains gains a second block, "The crew": one paragraph per crew member, alive or dead, in crew order, each in that character's own lens for the dead (Lena clinical fact, Elias by what he covers, Mira by what she built, Tomas by habits, Amara by what she tended, Jiro by a logged position, Sela by names at yellow, Vess by registry order), citing only this run's facts: the logged cause of death, tested promises, private lines, the vault decision against the side they stood for, recorded answers and pair outcomes. Untested promises stay silent (L-024); the dead are past tense; unrecovered crew get one sentence. Rendered in its own element under the unchanged 3–6 reflection lines, so L-008's cap and every check that pins them hold. `crewEpilogues()` in `src/state.js`; `sun-playerflow-crew-epilogues-checks.mjs`. No state, no choices, no art. |

## Open

**Lead queue (no owner decision needed):**

- **Wave 1, 0.37 Deeper Crew (ROADMAP §14A):** `SUN-ROMANCE-ARC-01` (Lena) first, then Mira, Vess, Amara, Sela; then callbacks, crew friction and per-crew epilogues. One PR each, prose offered to Myth before merge. Gate 1 is Manraj's full run plus one stranger's full read.
- Keep running `scripts/sun-browser-bot.mjs` batches after each batch of merges, and fix what it finds as one-PR tickets.
- Playtest bugs Manraj reports become one-PR tickets on the work branch (ROADMAP §14/§15). Manraj will play once there is more substantial progress (2026-11-05).
- Helper-chat bootstraps are saved in the Sunsplitter project (`claude/sunsplitter-helper-bootstraps.md`), ready when Manraj opens those chats.

**Stale PRs to close.** Manraj closes these; the lead's close calls are blocked by the session's permission policy. #297 and #304 (Copilot; #297 is on the do-not-merge list), #389 and #390 (superseded by #481), #407 (superseded), #436, #445 and #465 (retired multi-bot roadmap docs), #451 (superseded by the landed 0.36 keyboard work), #452 (superseded by #474–#477 and #484).

## Decisions for Manraj

**Open:**

1. **Playtest build.** Production shows `0e7535d`, from September. Manraj ruled 2026-11-05: skip for now, and preview when he wants to play.
4. **Story wording, for Myth review.** The lines written by the lead: the tether floor (#482), the unreadable-save message (#483) and the failed-burn line (`final_choice`, SUN-FINAL-HOLD-ONCE-01).
5. **Story consistency, for Myth.** The `offshift_elias` mending/unmended contradiction, and the `arc_future_2` author note.

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

17. **What Remains length (L-008 against §14A workstream 4).** L-008 (ROADMAP §8) fixes What Remains at 3–6 lines; the growth ruling's workstream 4 asks for one paragraph per crew member there. This PR reads the two together: the 3–6 reflection lines stay exactly as they were, and the per-crew block sits under them as a second section, "The crew", about 300–500 words. Recommendation: record on the L-008 row that the §14A ruling added the crew section beneath the capped reflection (one line in LOCKS, next LOCKS edit). If you would rather keep the screen at 3–6 lines, say so and the block moves behind a "Read the crew" button on the same screen instead.

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

**Lead:** land `SUN-CREW-EPILOGUES-01` on Myth's read (decision 15), then a browser-bot batch on the tip; Wave 1 is then written and waits on gate 1. **Manraj:** paste the Myth block into the Myth chat (the holds on the open prose PRs); then a full run on the tip is the first half of gate 1, and naming one stranger to read a full run is the second.

<!-- STATUS_COMPLETE -->
