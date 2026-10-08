# Sunsplitter — Forward roadmap and job queue

SOURCE main@8d23109b · LANE version/0.30.1-main-reconcile-ci.1@520be6ad4d8dcfc26df0e6668ee81de458bf17ad · TASK SUN-ROADMAP-FEEDS-1007-01 · MODE proposal

Owner approved this restock in the Game Dev room, 2026-10-07. This file is planning. It does not certify, mint, tag, Release, close the lane onto main, or deploy Netlify.

Lock line: lane 0.30.1 · certified 0.28.1d · NO-PUBLISH · 0.36 PAINT.

Codex numbering is authority. Do not reuse 0.31–0.33 for PC, outside review, or commercial itch. Those jobs are 0.36 / 0.37 / 0.39.

## What is true today

| Surface | State |
|---|---|
| Write lane | version/0.30.1-main-reconcile-ci.1 @ 520be6ad (merge PR #434, cites content tip e14ca7d2 / PR #433) |
| main | 8d23109b · VERSION 0.30 · SHIPPED observation only. Do not promote the lane onto main. Leave PR 45 and draft PR 46 untouched. |
| Paint | VERSION.md first line is 0.36. That is PAINT, not a passed PC exit and not certification. |
| Last certified | 0.28.1d. Nothing after it is certified. |
| Player build | Same static browser game on phone and PC. Nine survivors. Commander faceless. Adult romance permanent. No combat, inventory, quest log, or management sim. |
| 0.30.1–0.35 | Landed on the lane. Drain closed. Do not reopen as a queue. |

Lane artifacts/ROADMAP.md before this PR still cited runtime c3626434. This rewrite retargets authority to 520be6ad. It does not edit PROJECT_STATUS.md, TICKET_QUEUE.md, or LOCKS.md. Historical L-010/L-011 labels inside LOCKS.md that say 0.31/0.32 do not override this spine.

## Jobs already running — do not brief again

| Job | Treat as | Files it owns | Do not |
|---|---|---|---|
| Button States | SUN-V036-PC-HOVER-FOCUS-01 in flight | css/style.css | Remint. Do not take style.css. |
| Window Resize | SUN-V036-PC-VIEWPORT-01 / widescreen revalidate in flight | css/style.css, viewport layout | Remint. Do not take style.css. |
| 0.37 review build | Paper already on lane (artifacts/SUN_V037_*, docs/SUN_V037_EXTERNAL_REVIEW_PLAN_01.md). Execution in flight per owner. | docs/artifacts review packet | Open a second review-build. Do not invent OPEN 0.37 from this roadmap. |
| Crew-plate F07 | ALREADY_SATISFIED by PR #433 SUN-HITL-UNSHADOW-01 (rebind scene plate on Crew close). | src/hitl-unshadow.js | Remint F07. Do not merge Copilot #414. |

Hollow or corrupt open PRs stay unmerged: #297, #304 unless owner names it, #372, #373, #374, #389, #390, #393, #397, #401, #403, #405, #407, #411, #414, #416. A feed that needs the same fix uses a new id and a new overlay file. It does not revive those branches.

## How a builder uses a feed

Paste one file from artifacts/feeds/. Already done only counts with proof, then start the next queued job in the same run. Proof is a merged lane diff or a failing-then-passing harness, not a docs receipt. End every run with: IDLE_FOR_ORCH · ticket · PR|NO_PR · reason.

No portrait generation, edit, or borrow. A ticket that needs a new face is marked needs approved art and stops. Netlify is playtest gate, owner call. Owner decisions are ASK-FIRST.

## 0.36 — PC Readiness

Player-facing goal: a stranger on a desktop can start, focus every control, resize the window, and finish the same story the phone plays, without a hidden mouse requirement and without a second ruleset.

Entry: paint is already 0.36. Exit (ASK-FIRST before anyone calls it passed): keyboard-only start-to-end, resize/zoom/fullscreen keep choices reachable, button states distinct, phone layout not regressed. No native wrapper, gamepad, cloud save, or PC-only branch.

### In flight (not in feeds/)

Button States, Window Resize, 0.37 review build, crew-plate F07. See table above.

### Next build tickets (the six feeds)

Parallel group A (disjoint files): 1, 5, 6. Group B is sequential: 2 then 3 then 4, because they share title/ending chrome. Group A may run beside Group B.

1. SUN-FEED-KEYBOARD-CHOICE-01 — Visible: arrow/number/Enter activates the focused enabled choice. Files: src/pc-choice-keys.js, index.html script tag, scripts/pc-choice-keys-checks.mjs. Dep: Button States only if focus-visible is missing. Parallel with 5 and 6 if index.html is serialized.
2. SUN-FEED-NEW-RUN-CONFIRM-01 — Visible: New run asks before it wipes an existing save. Files: src/new-run-confirm.js, index.html tag, scripts/new-run-confirm-checks.mjs. Paper docs/SUN_V036_NEW_RUN_CONFIRM_01.md is not proof. Not parallel with 3.
3. SUN-FEED-ENDING-SKIP-LABEL-01 — Visible: Skip names the cinematic it skips and does not swallow the death beat or ending facts. Files: src/ending-skip-label.js, scripts/ending-skip-label-checks.mjs. Paper docs/SUN_V036_ENDING_SKIP_CLARITY_01.md is not proof. After 2. Parallel with 1 and 5.
4. SUN-FEED-WHAT-REMAINS-LABEL-01 — Visible: after the ending, What Remains is a labeled optional step, not a dead end. Files: src/what-remains-label.js, scripts/what-remains-label-checks.mjs. Paper docs/SUN_V036_WHAT_REMAINS_ENTRY_01.md is not proof. After 3.
5. SUN-FEED-SAVE-EXPORT-HONESTY-01 — Visible: export/import is findable and a failed import says why. Files: src/save-export-honesty.js, scripts/save-export-honesty-checks.mjs. Paper docs/SUN_V036_EXPORT_IMPORT_CLARITY_01.md is not proof. Parallel with 1 and 6.
6. SUN-FEED-DESKTOP-MATRIX-HARNESS-01 — Visible: at 1280 and 1920 the choice column is still on screen. Files: scripts/desktop-matrix-checks.mjs only. Playtest gate, owner call, if a human pass is wanted. No Netlify. Parallel with 1 and 5. After Window Resize before anyone calls the check an exit.

### Later 0.36, not in this feed drop

- Choice-disabled reason line (honest missing resource or dead crew). Needs choice renderer. After Button States so it does not take style.css. ASK-FIRST if copy tone is disputed.
- Scene-id footer hide outside phone. Collides with Window Resize (style.css). Do not fire while resize is in flight. Open #304 is not the vehicle.
- Shared-bytes note in the 0.37 packet: phone and PC are one build. Harness only. Do not add a PC story branch.
- Thumb 44px hit targets. After Window Resize. css/style.css. Not parallel with Button States.

## 0.37 — Outside Review

Player-facing goal: two people who have never played finish a private build and come back with a ranked list of what lied, what softlocked, and what they could not finish.

Entry ASK-FIRST: 0.36 keyboard and resize evidence exists, or the owner names an earlier private candidate. The review-build job already running is the packet, not this exit. This roadmap does not open 0.37.

Tickets:

- SUN-V037-CANDIDATE-FREEZE-01 — Visible: reviewers get one named zip and SHA, not a moving lane. Files: docs receipt + package allowlist. Dep: review build in flight. Playtest gate, owner call. No Netlify unless the owner names a SHA.
- SUN-V037-PROBE-01 — Visible: probes for dead speech, unpaid cost, save loss, softlock, false ending. Files: scripts/v037-probe-checks.mjs plus the existing SUN_V037 probe docs. Parallel with the freeze doc if it does not edit the same receipt.
- SUN-V037-FINDING-INTAKE-01 — Visible: each finding names scene, device, and repro. Files: docs template only. After the two runs. Repairs are new one-concern ids, not a mid-version invented here.

Exit ASK-FIRST: both reviewers finished or blockers ranked; P0 closed and retested. No public page. No paying players.

## 0.38 — Player Validation Cohort

Player-facing goal: a small named cohort plays the frozen private candidate, and the owner can tell a crash from a taste note before anyone changes the story.

Entry: 0.37 P0 closed or owner-deferred. Tickets:

- SUN-V038-THRESHOLDS-01 — Stop/continue rules written before results are read. Docs only. ASK-FIRST on the thresholds.
- SUN-V038-DEVICE-MATRIX-01 — One phone and one desktop row, same SHA. Docs + harness. Parallel with thresholds.
- SUN-V038-FINDING-SPLIT-01 — Separate correctness, access, experience, and market. Docs only. After the runs.

No new cast. No portrait work.

## 0.39 — Commercial itch

Player-facing goal: the public page describes the bytes a buyer actually gets, including the adult content, and does not promise a certified or Steam build.

Entry: 0.38 go/wait/stay-private. Tickets:

- SUN-V039-LICENSE-AUDIT-01 — Fonts, third-party code, and image rights listed. Docs only. Parallel with disclosures.
- SUN-V039-DISCLOSURES-01 — Adult classification, AI disclosure, content descriptors. ASK-FIRST on final wording. Do not soften adult routes.
- SUN-V039-STORE-COPY-01 — Store text matches the frozen SHA. Docs only. After disclosures.
- Cover and page art: needs approved art. Do not generate portraits. ASK-FIRST.
- Price, tax, and support posture: ASK-FIRST. Not a build ticket.

Netlify is not the commercial host. Steam is post-1.0 and ASK-FIRST.

## 0.40 — Launch rehearsal

Player-facing goal: none yet. The owner can roll back a private candidate, reinstall it, and load an older save without publishing.

Entry: 0.39 store truth drafted. Tickets:

- SUN-V040-FREEZE-01 — One RC identity, digest recorded. Docs + package script. Does not publish.
- SUN-V040-SAVE-MIGRATION-01 — An older lane save still resumes. scripts/ only. Parallel with freeze if it does not edit the packager.
- SUN-V040-ROLLBACK-01 — Written rollback steps against that digest. Docs only.

No tag and no GitHub Release unless the owner names them. Playtest gate, owner call, for any preview.

## 1.0 — Public release

Player-facing goal: a stranger can start, save, resume, and finish on phone or PC, the consequence engine does not lie, and the adult routes are still in the build.

Entry: separate owner go/no-go after 0.40 rehearsal. Not automatic.

Tickets, all ASK-FIRST before fire:

- SUN-V100-CLOSEOUT-01 — Lane promoted only if the owner names the SHA. main is not the work tip until then.
- SUN-V100-PUBLIC-PAGE-01 — itch page uses the frozen copy and approved art. needs approved art for any new plate.
- SUN-V100-SUPPORT-01 — One support path and a known-issues line. Docs only.

## Parallel map (this drop)

| Ticket | May run beside | Must not run beside |
|---|---|---|
| Keyboard choice | Save export, desktop harness | Another index.html script-order edit |
| New run confirm | Keyboard choice, save export | Ending skip, What Remains |
| Ending skip | Keyboard choice, desktop harness | New run confirm, What Remains |
| What Remains | Save export | Ending skip |
| Save export | Keyboard choice, desktop harness | Another save-slot overlay |
| Desktop harness | Keyboard choice, save export | Window Resize, if the check is being used as exit evidence |

style.css stays with Button States and Window Resize until those jobs stop.

## Do not remint

HITL remap #307 STOP. Embryo sweep #306 (spoken count stays one hundred forty thousand and six; HUD stays 0–100). Lethal-resume #326. ADD-KEYS-A. Cascade payoff #351. F07 / #433. Title Continue count #348 (do not merge #297). Tip-sync #434 and earlier pointer hops. Leftovers 10–12. Amara-route expansion. Event-order shuffle (accepted limitation). Tomas “People were tier four.” (reserved, unspent).

## Open questions for Manraj

- Damage-cause canon is still OPEN. Working rec is climb-out debris / incomplete cast-off. Do not rewrite ship_exterior until you lock it.
- ART-R2 stays HELD. Say if a single plate may be wired from the approved set.
- Amara route stays PARKED. A repro of a wiring bug is a named defect, not a route expansion.
- Breast-cover toggle stays HELD.
- Whether 0.36 may be called passed, and whether 0.37 reviewers may start, is yours. This file does not open either.
- Any Netlify pin is playtest gate, owner call. Name the SHA or it does not fire.
- Close-out onto main, certify, tag, and public itch are separate yes/no calls.
- New portraits are needs approved art. Builders do not generate, edit, or borrow faces.
