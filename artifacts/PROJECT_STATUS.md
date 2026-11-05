# Sunsplitter — Current Status

`schema_version: 3`
`updated_utc: 2026-11-05`
`work_branch: version/0.30.1-main-reconcile-ci.1`
`work_branch_tip: 211f6dc (after PR #494)`
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
| this PR | SUN-ART-R2-FALLBACKS-01 | A blocked plate falls back to an empty plate of its own setting (berths, observation, vault) from the held ART-R2 reserve. |

## Open

**Lead queue (no owner decision needed):**

- Keep running `scripts/sun-browser-bot.mjs` batches after each batch of merges, and fix what it finds as one-PR tickets.
- Playtest bugs Manraj reports become one-PR tickets on the work branch (ROADMAP §14/§15). Manraj will play once there is more substantial progress (2026-11-05).
- Helper-chat bootstraps are saved in the Sunsplitter project (`claude/sunsplitter-helper-bootstraps.md`), ready when Manraj opens those chats.

**Stale PRs to close.** Manraj closes these; the lead's close calls are blocked by the session's permission policy. #297 and #304 (Copilot; #297 is on the do-not-merge list), #389 and #390 (superseded by #481), #407 (superseded), #436, #445 and #465 (retired multi-bot roadmap docs), #451 (superseded by the landed 0.36 keyboard work), #452 (superseded by #474–#477 and #484).

## Decisions for Manraj

**Open:**

1. **Playtest build.** Production shows `0e7535d`, from September. Manraj ruled 2026-11-05: skip for now, and preview when he wants to play.
4. **Story wording, for Myth review.** The lines written by the lead: the tether floor (#482), the unreadable-save message (#483) and the failed-burn line (`final_choice`, SUN-FINAL-HOLD-ONCE-01).
5. **Story consistency, for Myth.** The `offshift_elias` mending/unmended contradiction, and the `arc_future_2` author note.

**Ruled by Manraj, 2026-11-05:**

- **2: yes.** Unreadable saves get an export escape hatch. This reverses the 0.32 fail-closed Export rule for unreadable bytes only. It lands as SUN-UNREADABLE-EXPORT-01.
- **3: keep.** Amara stays on intro slide 1.
- **6: A.** After an aborted hard burn, `final_choice` stops offering Hold. Landed in SUN-FINAL-HOLD-ONCE-01.
- **ART-R2: opened for people-free fallbacks only** (2026-11-05). Wired in SUN-ART-R2-FALLBACKS-01. The four Sep-23 harvest candidates for the unsaved Imagine frames stay unapproved, and the shipped versions remain, until Manraj verifies them in the Grok art chat.
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

**Lead:** SUN-HITL-SHADOW-02. Unshadow the 27 owner-approved event plates whose scenes' own `image` overrides their mapped plate, face-gating each one. Then the next browser-bot batch. **Manraj:** say when you want a preview deploy to play.

<!-- STATUS_COMPLETE -->
