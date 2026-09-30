# Sunsplitter — Current Status

`schema_version: 2`
`updated_utc: 2026-09-29`
`source_main_sha: 8d23109b63b844e0703fb36643f14b91b8800c90`
`source_main_tree: a6b96e0907de586f6cdd31cf15db09bc1341ddaf`
`runtime_baseline_sha: 8d23109b63b844e0703fb36643f14b91b8800c90`
`runtime_src_tree: 992f7c57e18709acc08c8ee3cddcfdea816a6acf`
`audited_recovery_base_sha: e4f84409759760d31fcf47b8a227802a61421f51`
`protected_recovery_head_sha: 41d43f7d22e08efb742a0773ea422c91aa70c170`
`version_lane_sha: fa47b26e19db24d75b0eaa32af92822947ba11ec`
`owner_playtest_pin_sha: a91a26d47ac76a976ca4406caf9b04511c11ba82`

This is the compact rolling handoff. Process: `/AGENTS.md`. Future scope: `ROADMAP.md`. Dispositions: `LOCKS.md`. Vocabulary in this file follows ROADMAP §1: **LANDED ON VERSION LANE** is merge-committed into `version/0.30.1-main-reconcile-ci.1` and is not on `main` and is not certified. **SHIPPED** is present on `main` and recorded here as current repository truth; it is not a Release or deploy. **CERTIFIED** applies only to the last certified baseline below. Nothing on the version lane is SHIPPED or CERTIFIED.

## Release and authority state

`observed_runtime: main@8d23109 — SHIPPED observation of GitHub main; not certified`
`version_lane_head: fa47b26e19db24d75b0eaa32af92822947ba11ec — LANDED ON VERSION LANE after PR #418 SUN-ROADMAP-TIP-SYNC-2451-01; not SHIPPED; not CERTIFIED`
`audited_recovery_base: e4f8440 — preserved historical NO-PUBLISH recovery base`
`last_certified_baseline_label: 0.28.1d`
`version_integrity: NOT_CERTIFIED`
`release_state: NO-PUBLISH`
`release_artifact: none authorized`
`deployment: none authorized`
`sequential_gate_closure: none credited from 0.28.2 onward`
`pc_readiness_0_36: tip-named pack closed-for-FEED (NOT certified; 0.36 PAINT; last certified 0.28.1d)`

Main's `src` tree is byte-identical to protected recovery head `41d43f7` (`992f7c57e18709acc08c8ee3cddcfdea816a6acf`). Main and that protected head are not repository-equivalent: their art, pipeline, and authority-document trees differ. The audited recovery base `e4f8440` remains provenance, not the current observed runtime and not a release candidate. Version-lane `src` has advanced past that pin; those bytes are LANDED ON VERSION LANE only. Do not cite `main@8d23109` as the work tip.

Current main art is **PRESENT / UNRECONCILED / NO INTEGRATION OR RELEASE CREDIT**. No art decision, wiring approval, roster approval, publication right, or release credit is implied by image presence.

PIPE-BOOT and PIPE-BOOT-R1 were accepted and closed in the protected recovery lineage (`93ccb43e141da544b999ba2c45f664a19428a5e3`, then `0b600935aa6e21d4898bcc9c7ad09e78893ec6e7`). They are protected governance/pipeline evidence only; they grant no gameplay, release, certification, publication, deployment, or sequential-gate credit.

Owner playtesting uses Netlify pin `a91a26d`. This file does not remint PIN-02 and does not authorize a new Netlify pin.

PR 45 and draft PR 46 remain held and untouched.

## Current work

`milestone: SUN-ROADMAP-TIP-SYNC-FA47-01 — tip honesty after PR #418`
`state: DOCS ONLY AT fa47b26e — no JPEG / no wire / no gameplay; NO-PUBLISH / NOT_CERTIFIED`
`governed_branch: version/0.30.1-main-reconcile-ci.1`
`owner: Grok / program office; Manraj remains sole publish authority`

### SUN-ROADMAP-TIP-SYNC-FA47-01 (this tip)

Docs/status only. Records live lane HEAD `fa47b26e19db24d75b0eaa32af92822947ba11ec` after PR **#418** `SUN-ROADMAP-TIP-SYNC-2451-01` (parents `2451fa09` + `7b8b5dab`). Does not remint #418 / #417 / #415. Does not invent OPEN 0.37 or OPEN 0.38. Does not mint or certify. Does not reopen Heavy UIUX PASS intro NEXT+SKIP on pin `6ab9fa37`. HOLD-ART REMINT2 chat `2f15e2ba` WAIT_PR — do not collide. Never merge hollow/wrong-shape **#401 / #402 / #403 / #405 / #407 / #408 / #410 / #411**. Never Copilot **#414**. Never **#416** CORRUPT.

| Pin | Live value | Meaning |
|---|---|---|
| `source_main_sha` | `8d23109b63b844e0703fb36643f14b91b8800c90` | GitHub `main` HEAD. SHIPPED observation only. Not the work tip. |
| `source_main_tree` | `a6b96e0907de586f6cdd31cf15db09bc1341ddaf` | Bound in `scripts/verify.mjs` and fixtures. |
| `runtime_src_tree` | `992f7c57e18709acc08c8ee3cddcfdea816a6acf` | Main `src` tree. Same as protected recovery `src`. |
| Lane `HEAD` | `fa47b26e19db24d75b0eaa32af92822947ba11ec` | LANDED ON VERSION LANE only. After PR #418 SUN-ROADMAP-TIP-SYNC-2451-01. Work tip. |
| Fixture certification string | `NO-PUBLISH / NOT_CERTIFIED` | Unchanged. |
| `pc_readiness_0_36` | tip-named pack closed-for-FEED | Not a 0.36 exit. |

`identityAndAuthorityChecks` still requires the original STATUS field lines and the L-025 through L-028 disposition lines. Those strings stay in their original sections only.

Live lane tip cite: `fa47b26e19db24d75b0eaa32af92822947ba11ec` after PR **#418**. Receipt: `docs/SUN_ROADMAP_TIP_SYNC_FA47.md`. That cite is the pre-PR lane HEAD, not this docs PR's merge SHA. Prior STATUS live cite `2451fa09` / PR **#417** is historical. `0.36` stays PAINT, not OPEN. Do not invent OPEN 0.37.

Lane facts below are LANDED ON VERSION LANE. They are not SHIPPED and not CERTIFIED. Last certified remains `0.28.1d`.

### Tip-named 0.36 PC evidence pack (closed-for-FEED)

| PR | Ticket | Lane meaning |
|---|---|---|
| 249 | `SUN-V036-PC-KEYBOARD-01` | ALREADY_SATISFIED. |
| 257 | `SUN-V036-PC-HOVER-FOCUS-01` | ALREADY_SATISFIED. |
| 256 | `SUN-V036-PC-DESKTOP-MATRIX-01` | Desktop viewport evidence packet. |
| 258 | `SUN-V036-PC-VIEWPORT-01` | ALREADY_SATISFIED. |
| 252 | `SUN-V036-PC-KEYBOARD-RUN-01` | Keyboard-only run packet. |
| 367 | `SUN-V036-PC-WIDESCREEN-REVALIDATE-01` | ALREADY_SATISFIED. |

Closed-for-FEED is not a 0.36 certify exit.

### Drained on the version lane (do not reopen as a new queue)

- **0.30.1–0.32 / 0.33 / 0.34 / 0.35:** drain recorded on the lane. Still `NOT_CERTIFIED`.

### Recently landed

| PR | Ticket | Lane meaning |
|---|---|---|
| 418 | `SUN-ROADMAP-TIP-SYNC-2451-01` | Merge `fa47b26e19db24d75b0eaa32af92822947ba11ec`. Pointer hop after #417. Do not remint this id. |
| 417 | `SUN-ROADMAP-TIP-SYNC-4226-01` | Historical live-tip parent `2451fa09c9c0ebc09932ecaca95d0860fa2b67b5`. Do not remint. |
| 415 | `SUN-ROADMAP-TIP-SYNC-EE0E-01` | Historical live-tip parent `4226ae8317d275a3ecee2ef53b272f9737863364`. Do not remint. |
| 413 | `SUN-ROADMAP-TIP-SYNC-5DE6-01` | Historical live-tip parent `ee0e89c18b436319eb4c53a84e22b933920b3c31`. Do not remint. |
| 412 | `SUN-ROADMAP-TIP-SYNC-2570-01` | Historical live-tip parent `5de6597370f8e5e6cebd1dd29efaec686f537baa`. Do not remint. |
| 409 | `SUN-ROADMAP-TIP-SYNC-048C-01` | Historical live-tip parent `2570da2c1239c79f09d65ef21b4620749f273ea7`. Do not remint. |
| 399 | `SUN-FIX-CRISIS-PLATE-01-REMINT` | Historical parent `048c7a506e7cfe1e7ff0e8681656fed7c55498ac`. Do not remint. Hollow follow-ons #401–#403/#405/#407/#408/#410/#411 are not merge authority. |
| 385 | `SUN-DOCS-TIP-HONESTY-5800-01` | Historical tip-honesty at `04c4a806`. Do not remint. |
| 384 | `SUN-DOCS-TIP-HONESTY-D47C-01` | Historical. Do not remint. |
| 383 | `SUN-DOCS-TIP-HONESTY-526F-01` | Historical. Do not remint. |
| 371 | `SUN-PLAYTEST-RESPONSE-DRAIN-HONESTY-01` | Leftovers 5–9 ALREADY_SATISFIED. Do not remint. |
| 369 | `SUN-V037-EXTERNAL-REVIEW-PLAN-01` | Two-stranger plan paper. Execution PARKED. Do not remint. |
| 360 | `SUN-CREW-BOARD-FOLLOW-CLARITY-01` | First Crew tap holds `#crew-sheet` closed. KEEP `renderCrewPanel("lena")`. Do not remint. |
| 376 | MAPFIX / restore | **CLOSED UNMERGED**. Never merge. Do not remint. |

`VERSION.md` first line on this tip is `0.36` paint. Not certification.

### Holds (unchanged except 0.37 park + #376 close + hollow-PR ban)

- **0.36 PC Readiness is not certified.** Pack is closed-for-FEED only.
- **0.37 stranger / external review PARKED.** **Do not invent OPEN 0.38.**
- ART-R2 broad campaign held. Amara-route parked. PR 45 / draft PR 46 untouched.
- **Do not merge #297.** **Do not merge #376.** **Do not merge #401 / #402 / #403 / #405 / #407 / #408 / #410 / #411.** Never Copilot **#414**. Never **#416** CORRUPT.
- No remint of PRs 107–418 as spent ids. No Netlify pin remint.
- Heavy UIUX PASS intro NEXT+SKIP on pin `6ab9fa37` — do not reopen intro softlock.
- HOLD-ART REMINT2 chat `2f15e2ba` WAIT_PR — do not collide.
- `SUN-HITL-UNSHADOW-01` PARKED. Trust / Commander / plate / Vess PARKED.
- L-025–L-028 are not reopened here.

## L-025–L-028 dispositions

- **L-025 — LOCKED:** Commander Option B. The rendered-path gender/canon audit and document synchronization remain implementation work; this reconciliation changes no gameplay prose.
- **L-026 — LOCKED:** retain Last Off-Shift zero/one routes solely as tested defensive save-recovery guards and preserve `junctionChoice`. Required coverage remains implementation work.
- **L-027 — LOCKED:** retire `vess_course_lost` and its promised downstream-course consequence. Runtime removal remains implementation work.
- **L-028 — DEFERRED:** default RETIRE unless qualifying mobile-PX evidence meets the pre-registered, Manraj-approved threshold. No indicator is authorized.

L-020 through L-024 remain ruled. This handoff does not reopen L-004, art governance, product/canon scope outside L-025–L-028, or any release gate.

## Verification and CI state

Green version-lane checks are candidate evidence only. They do not certify, ship, or close a sequential gate. This ticket has no ruleset-mutation authority.

## Blockers

- `NO-PUBLISH / NOT_CERTIFIED` remains controlling; no release artifact or deployment authority exists.
- Last certified baseline remains `0.28.1d`. The version lane is not certified.
- This ticket has no merge-to-main, tag, release, Netlify, or deploy authority.

## Next action

**This ticket:** merge-commit `SUN-ROADMAP-TIP-SYNC-FA47-01` into `version/0.30.1-main-reconcile-ci.1`, then stop. Do not remint #418. Do not merge hollow PRs. Do not FEED 0.37 strangers. Do not invent OPEN 0.37 / 0.38.

**Grok / orchestrator (`$ S2`):** after this merge, named owner-OPEN tickets only. Netlify HOLD.

**Manraj:** remains sole publish authority. `NO-PUBLISH / NOT_CERTIFIED` remains controlling.

<!-- STATUS_COMPLETE -->
