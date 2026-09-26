# Sunsplitter — Current Status

`schema_version: 2`
`updated_utc: 2026-09-26`
`source_main_sha: 8d23109b63b844e0703fb36643f14b91b8800c90`
`source_main_tree: a6b96e0907de586f6cdd31cf15db09bc1341ddaf`
`runtime_baseline_sha: 8d23109b63b844e0703fb36643f14b91b8800c90`
`runtime_src_tree: 992f7c57e18709acc08c8ee3cddcfdea816a6acf`
`audited_recovery_base_sha: e4f84409759760d31fcf47b8a227802a61421f51`
`protected_recovery_head_sha: 41d43f7d22e08efb742a0773ea422c91aa70c170`
`version_lane_sha: 5800b42c21c9424ac2cdf1fd7759b2b11b8b4017`
`owner_playtest_pin_sha: a91a26d47ac76a976ca4406caf9b04511c11ba82`

This is the compact rolling handoff. Process: `/AGENTS.md`. Future scope: `ROADMAP.md`. Dispositions: `LOCKS.md`. Vocabulary in this file follows ROADMAP §1: **LANDED ON VERSION LANE** is merge-committed into `version/0.30.1-main-reconcile-ci.1` and is not on `main` and is not certified. **SHIPPED** is present on `main` and recorded here as current repository truth; it is not a Release or deploy. **CERTIFIED** applies only to the last certified baseline below. Nothing on the version lane is SHIPPED or CERTIFIED.

## Release and authority state

`observed_runtime: main@8d23109 — SHIPPED observation of GitHub main; not certified`
`version_lane_head: 5800b42c21c9424ac2cdf1fd7759b2b11b8b4017 — LANDED ON VERSION LANE after PR #384 TIP-HONESTY-D47C; not SHIPPED; not CERTIFIED`
`audited_recovery_base: e4f8440 — preserved historical NO-PUBLISH recovery base`
`last_certified_baseline_label: 0.28.1d`
`version_integrity: NOT_CERTIFIED`
`release_state: NO-PUBLISH`
`release_artifact: none authorized`
`deployment: none authorized`
`sequential_gate_closure: none credited from 0.28.2 onward`
`pc_readiness_0_36: tip-named pack closed-for-FEED (NOT certified; 0.36 PAINT; last certified 0.28.1d)`

Main's `src` tree is byte-identical to protected recovery head `41d43f7` (`992f7c57e18709acc08c8ee3cddcfdea816a6acf`). Main and that protected head are not repository-equivalent: their art, pipeline, and authority-document trees differ. The audited recovery base `e4f8440` remains provenance, not the current observed runtime and not a release candidate. Version-lane `src` has advanced past that pin; those bytes are LANDED ON VERSION LANE only.

Current main art is **PRESENT / UNRECONCILED / NO INTEGRATION OR RELEASE CREDIT**. No art decision, wiring approval, roster approval, publication right, or release credit is implied by image presence.

PIPE-BOOT and PIPE-BOOT-R1 were accepted and closed in the protected recovery lineage (`93ccb43e141da544b999ba2c45f664a19428a5e3`, then `0b600935aa6e21d4898bcc9c7ad09e78893ec6e7`). They are protected governance/pipeline evidence only; they grant no gameplay, release, certification, publication, deployment, or sequential-gate credit.

Owner playtesting uses Netlify pin `a91a26d`. This file does not remint PIN-02 and does not authorize a new Netlify pin.

PR 45 and draft PR 46 remain held and untouched.

## Current work

`milestone: SUN-DOCS-TIP-HONESTY-5800-01 — tip honesty after PR #384`
`state: DOCS ONLY AT 5800b42c — 0.37 strangers PARKED; #376 MAPFIX in-flight unpaid; no JPEG / no wire / no gameplay; NO-PUBLISH / NOT_CERTIFIED`
`governed_branch: version/0.30.1-main-reconcile-ci.1`
`owner: Grok / program office; Manraj remains sole publish authority`

### SUN-DOCS-TIP-HONESTY-5800-01 (this tip)

Docs/status only. Records live lane HEAD `5800b42c21c9424ac2cdf1fd7759b2b11b8b4017` after PR **#384** `SUN-DOCS-TIP-HONESTY-D47C-01`. Ancestry: **#371** @ `0e7535df` then **#377** @ `5d20c123` then **#378** @ `13a45eb5` then **#379** @ `f5766707` then **#380** @ `616128b6` then **#381** @ `f84c8249` then **#382** @ `526fb32a` then **#383** @ `d47c5e0c` then **#384** @ `5800b42c`. Owner GO 2026-09-22: **0.37 stranger / external review PARKED**. Does not remint #384–#371. Does not invent OPEN 0.38. Does not mint or certify. PR **#376** MAPFIX stays in-flight unpaid — this ticket does not claim it merged.

| Pin | Live value | Meaning |
|---|---|---|
| `source_main_sha` | `8d23109b63b844e0703fb36643f14b91b8800c90` | GitHub `main` HEAD. SHIPPED observation only. |
| `source_main_tree` | `a6b96e0907de586f6cdd31cf15db09bc1341ddaf` | Bound in `scripts/verify.mjs` and fixtures. |
| `runtime_src_tree` | `992f7c57e18709acc08c8ee3cddcfdea816a6acf` | Main `src` tree. Same as protected recovery `src`. |
| Lane `HEAD` | `5800b42c21c9424ac2cdf1fd7759b2b11b8b4017` | LANDED ON VERSION LANE only. After PR #384 TIP-HONESTY-D47C. |
| Fixture certification string | `NO-PUBLISH / NOT_CERTIFIED` | Unchanged. |
| `pc_readiness_0_36` | tip-named pack closed-for-FEED | Not a 0.36 exit. |

`identityAndAuthorityChecks` still requires the original STATUS field lines and the L-025 through L-028 disposition lines. Those strings stay in their original sections only.

Live lane tip cite: `5800b42c21c9424ac2cdf1fd7759b2b11b8b4017` after PR **#384**. Receipt: `docs/SUN_DOCS_TIP_HONESTY_5800.md`. That cite is the pre-PR lane HEAD, not this docs PR's merge SHA. Honesty-D47C cite `d47c5e0c` / PR #383 remains historical ancestry. `0.36` stays PAINT, not OPEN. Do not invent OPEN 0.38.

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
| 384 | `SUN-DOCS-TIP-HONESTY-D47C-01` | Pointed STATUS/QUEUE at `d47c5e0c`. Ancestry floor. Do not remint. |
| 383 | `SUN-DOCS-TIP-HONESTY-526F-01` | Pointed STATUS/QUEUE at `526fb32a`. Do not remint. |
| 382 | `SUN-DOCS-TIP-HONESTY-F84C-01` | Pointed STATUS/QUEUE at `f84c8249`. Do not remint. |
| 381 | `SUN-DOCS-TIP-HONESTY-6161-01` | Pointed STATUS/QUEUE at `616128b6`. Do not remint. |
| 380 | `SUN-DOCS-TIP-HONESTY-F576-01` | Pointed STATUS/QUEUE at `f5766707`. Do not remint. |
| 379 | `SUN-DOCS-TIP-HONESTY-13A45-01` | Pointed STATUS/QUEUE at `13a45eb5`. Do not remint. |
| 378 | `SUN-DOCS-TIP-HONESTY-5D20-01` | Pointed STATUS/QUEUE at `5d20c123`. Do not remint. |
| 377 | `SUN-DOCS-TIP-HONESTY-0E75-01` | Pointed STATUS/QUEUE at `0e7535df`. Do not remint. |
| 371 | `SUN-PLAYTEST-RESPONSE-DRAIN-HONESTY-01` | Leftovers 5–9 ALREADY_SATISFIED. Do not remint. |
| 369 | `SUN-V037-EXTERNAL-REVIEW-PLAN-01` | Two-stranger plan paper. Execution PARKED. Do not remint. |
| 360 | `SUN-CREW-BOARD-FOLLOW-CLARITY-01` | First Crew tap holds `#crew-sheet` closed. KEEP `renderCrewPanel("lena")`. Do not remint. |

`VERSION.md` first line on this tip is `0.36` paint. Not certification.

PR **#376** MAPFIX / restore is **in-flight unpaid**. Do not claim merged. Do not touch `src/`.

### Holds (unchanged except 0.37 park)

- **0.36 PC Readiness is not certified.** Pack is closed-for-FEED only.
- **0.37 stranger / external review PARKED.** **Do not invent OPEN 0.38.**
- ART-R2 broad campaign held. Amara-route parked. PR 45 / draft PR 46 untouched.
- **Do not merge #297.** No remint of PRs 107–384. No Netlify pin remint.
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

**This ticket:** merge-commit `SUN-DOCS-TIP-HONESTY-5800-01` into `version/0.30.1-main-reconcile-ci.1`, then stop. Do not remint #384–#371. Do not FEED 0.37 strangers. Do not claim #376 merged. Do not invent OPEN 0.38.

**Grok / orchestrator (`$ S1`):** after this merge, named owner-OPEN tickets only. #376 stays on `$S2`. Netlify HOLD.

**Manraj:** remains sole publish authority. `NO-PUBLISH / NOT_CERTIFIED` remains controlling.

<!-- STATUS_COMPLETE -->
