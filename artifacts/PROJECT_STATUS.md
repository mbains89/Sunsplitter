# Sunsplitter — Current Status

`schema_version: 3`
`updated_utc: 2026-11-05`
`work_branch: version/0.30.1-main-reconcile-ci.1`
`work_branch_tip: 24999ca (after PR #485)`
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

- `main` is `8d23109`. It has not moved and is far behind the work branch. Close-out to `main` needs Manraj.
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

## Open

**Lead queue (no owner decision needed):**

- Helper-chat bootstrap prompts for Myth, Hex and Muse, saved in the Sunsplitter project.
- Playtest bugs Manraj reports become one-PR tickets on the work branch (ROADMAP §14/§15).

**Stale PRs to close.** Manraj closes these; the lead's close calls are blocked by the session's permission policy. #297 and #304 (Copilot; #297 is on the do-not-merge list), #389 and #390 (superseded by #481), #407 (superseded), #436, #445 and #465 (retired multi-bot roadmap docs), #451 (superseded by the landed 0.36 keyboard work), #452 (superseded by #474–#477 and #484).

## Decisions for Manraj

1. **Playtest build.** Production shows `0e7535d`, from September. Should the lead deploy the work-branch tip as a Netlify preview (not production) so you can play the current game?
2. **Unreadable saves.** #483 names them but keeps Export hidden, per the 0.32 fail-closed rule. Do you want an "export the unreadable bytes" escape hatch? It would reverse that rule.
3. **Intro slide 1 plate shows Amara.** The art-event audit checks lock it. Keep it, or route it to Muse for a people-free alternative?
4. **Story wording, for Myth review.** The tether floor line (#482) and the unreadable-save message (#483) are lead-written.
5. **Story consistency, for Myth.** The `offshift_elias` mending/unmended contradiction, and the `arc_future_2` author note.
6. **Dead scene.** `act3_crisis_declare` is unreachable. Cut it, or wire it?
7. **Balance, for Hex.** A cohesion farming loop at `final_choice`.
8. **Close-out.** When to consolidate the work branch onto `main`.

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

**Manraj:** answer decision 1 (preview deploy of the tip). Then play it and report bugs; each bug becomes a one-PR ticket.

<!-- STATUS_COMPLETE -->
