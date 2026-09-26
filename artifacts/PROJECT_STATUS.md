# Sunsplitter — Current Status

`schema_version: 2`
`updated_utc: 2026-09-26`
`source_main_sha: 8d23109b63b844e0703fb36643f14b91b8800c90`
`source_main_tree: a6b96e0907de586f6cdd31cf15db09bc1341ddaf`
`runtime_baseline_sha: 8d23109b63b844e0703fb36643f14b91b8800c90`
`runtime_src_tree: 992f7c57e18709acc08c8ee3cddcfdea816a6acf`
`audited_recovery_base_sha: e4f84409759760d31fcf47b8a227802a61421f51`
`protected_recovery_head_sha: 41d43f7d22e08efb742a0773ea422c91aa70c170`
`version_lane_sha: f84c8249131bdc9805e4d5832cdce196251f571d`
`owner_playtest_pin_sha: a91a26d47ac76a976ca4406caf9b04511c11ba82`

This is the compact rolling handoff. Process: `/AGENTS.md`. Future scope: `ROADMAP.md`. Dispositions: `LOCKS.md`. Vocabulary in this file follows ROADMAP §1: **LANDED ON VERSION LANE** is merge-committed into `version/0.30.1-main-reconcile-ci.1` and is not on `main` and is not certified. **SHIPPED** is present on `main` and recorded here as current repository truth; it is not a Release or deploy. **CERTIFIED** applies only to the last certified baseline below. Nothing on the version lane is SHIPPED or CERTIFIED.

## Release and authority state

`observed_runtime: main@8d23109 — SHIPPED observation of GitHub main; not certified`
`version_lane_head: f84c8249131bdc9805e4d5832cdce196251f571d — LANDED ON VERSION LANE after PR #381 TIP-HONESTY-6161; not SHIPPED; not CERTIFIED`
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

`milestone: SUN-DOCS-TIP-HONESTY-F84C-01 — tip honesty after PR #381`
`state: DOCS ONLY AT f84c8249 — 0.37 strangers PARKED; #376 MAPFIX in-flight unpaid; no JPEG / no wire / no gameplay; NO-PUBLISH / NOT_CERTIFIED`
`governed_branch: version/0.30.1-main-reconcile-ci.1`
`owner: Grok / program office; Manraj remains sole publish authority`

### SUN-DOCS-TIP-HONESTY-F84C-01 (this tip)

Docs/status only. Records live lane HEAD `f84c8249131bdc9805e4d5832cdce196251f571d` after PR **#381** `SUN-DOCS-TIP-HONESTY-6161-01`. Ancestry: **#371** @ `0e7535df` then **#377** @ `5d20c123` then **#378** @ `13a45eb5` then **#379** @ `f5766707` then **#380** @ `616128b6` then **#381** @ `f84c8249`. Owner GO 2026-09-22: **0.37 stranger / external review PARKED**. Does not remint #381 / #380 / #379 / #378 / #377 / #371. Does not invent OPEN 0.38. Does not mint or certify. PR **#376** MAPFIX stays in-flight unpaid — this ticket does not claim it merged.

| Pin | Live value | Meaning |
|---|---|---|
| `source_main_sha` | `8d23109b63b844e0703fb36643f14b91b8800c90` | GitHub `main` HEAD. SHIPPED observation only. |
| `source_main_tree` | `a6b96e0907de586f6cdd31cf15db09bc1341ddaf` | Bound in `scripts/verify.mjs` and `scripts/fixtures/main-reconcile-ci-pr-baseline.json`. |
| `runtime_src_tree` | `992f7c57e18709acc08c8ee3cddcfdea816a6acf` | Main `src` tree. Same as protected recovery `src`. |
| Lane `HEAD` | `f84c8249131bdc9805e4d5832cdce196251f571d` | LANDED ON VERSION LANE only. After PR #381 TIP-HONESTY-6161. |
| Fixture certification string | `NO-PUBLISH / NOT_CERTIFIED` | Unchanged. |
| `pc_readiness_0_36` | tip-named pack closed-for-FEED | Not a 0.36 exit. |

`identityAndAuthorityChecks` still requires the original STATUS field lines and the L-025 through L-028 disposition lines. Those strings stay in their original sections only. Lane `src` may differ from the main src pin; the src-equality gate applies only to the original main-reconcile ticket route.

Live lane tip cite: `f84c8249131bdc9805e4d5832cdce196251f571d` after PR **#381**. Receipt: `docs/SUN_DOCS_TIP_HONESTY_F84C.md`. That cite is the pre-PR lane HEAD, not this docs PR's merge SHA. Honesty-6161 cite `616128b6` / PR #380 remains historical ancestry. `0.36` stays PAINT, not OPEN. Do not invent OPEN 0.38.

Lane facts below are LANDED ON VERSION LANE. They are not SHIPPED and not CERTIFIED. Last certified remains `0.28.1d`.

### Tip-named 0.36 PC evidence pack (closed-for-FEED)

Merged onto `version/0.30.1-main-reconcile-ci.1`. Docs receipts. Not a certify exit. Do not remint these ids.

| PR | Ticket | Lane meaning |
|---|---|---|
| 249 | `SUN-V036-PC-KEYBOARD-01` | PR 84 keyboard revalidate. ALREADY_SATISFIED. Receipt `docs/SUN_V036_PC_KEYBOARD_01.md`. |
| 257 | `SUN-V036-PC-HOVER-FOCUS-01` | Hover/focus/pressed tokens. ALREADY_SATISFIED. Receipt `docs/SUN_V036_PC_HOVER_FOCUS_01.md`. |
| 256 | `SUN-V036-PC-DESKTOP-MATRIX-01` | Desktop viewport evidence packet. Receipt `docs/SUN_V036_PC_DESKTOP_MATRIX_01.md`. |
| 258 | `SUN-V036-PC-VIEWPORT-01` | Viewport/zoom/resize cites #256. ALREADY_SATISFIED. Receipt `docs/SUN_V036_PC_VIEWPORT_01.md`. |
| 252 | `SUN-V036-PC-KEYBOARD-RUN-01` | Keyboard-only run packet. Receipt `docs/SUN_V036_PC_KEYBOARD_RUN_01.md`. |
| 367 | `SUN-V036-PC-WIDESCREEN-REVALIDATE-01` | PR 85 plate-beside-prose still live. ALREADY_SATISFIED. Receipt `docs/SUN_V036_PC_WIDESCREEN_REVALIDATE_01.md`. |

Closed-for-FEED means orchestrator must not re-FEED these six spent ids. It does **not** mean 0.36 PC Readiness passed, certified, or opened as a product exit.

### Drained on the version lane (do not reopen as a new queue)

- **0.30.1–0.32:** previously recorded drain/exit on the lane. Still `NOT_CERTIFIED`.
- **0.33 playtest tickets:** one-PR playtest repairs and named ART-R2 one-scene retargets landed through PR 142. Player-facing label remains `0.33` in older playtest docs.
- **0.34 Mobile UX / a11y / perf:** PRs 107–109 merge-committed on the lane. Drain recorded. Not certified.
- **0.35 Packaging and private itch:** PRs 110–113 merge-committed on the lane. Refresh PRs 143–145 rebind package and non-public drafts to playtest pin `a91a26d`. Drain recorded. Not publication. Not certified.

### Recently landed

| PR | Ticket | Lane meaning |
|---|---|---|
| 381 | `SUN-DOCS-TIP-HONESTY-6161-01` | Pointed STATUS/QUEUE at `616128b6`. Ancestry floor. Do not remint. |
| 380 | `SUN-DOCS-TIP-HONESTY-F576-01` | Pointed STATUS/QUEUE at `f5766707`. Do not remint. |
| 379 | `SUN-DOCS-TIP-HONESTY-13A45-01` | Pointed STATUS/QUEUE at `13a45eb5`. Do not remint. |
| 378 | `SUN-DOCS-TIP-HONESTY-5D20-01` | Pointed STATUS/QUEUE at `5d20c123`. Do not remint. |
| 377 | `SUN-DOCS-TIP-HONESTY-0E75-01` | Pointed STATUS/QUEUE at `0e7535df`. Do not remint. |
| 371 | `SUN-PLAYTEST-RESPONSE-DRAIN-HONESTY-01` | Leftovers 5–9 ALREADY_SATISFIED. Do not remint. |
| 369 | `SUN-V037-EXTERNAL-REVIEW-PLAN-01` | Two-stranger plan paper. Execution PARKED. Do not remint. |
| 368 | `SUN-DOCS-PC036-PACK-CLOSE-01` | Tip-named 0.36 PC pack closed-for-FEED. Not certified. |
| 360 | `SUN-CREW-BOARD-FOLLOW-CLARITY-01` | First Crew tap holds `#crew-sheet` closed. KEEP `renderCrewPanel("lena")`. Do not remint. |
| 249 / 257 / 256 / 258 / 252 / 367 | tip-named 0.36 PC pack | Closed-for-FEED. Not certified. |

`VERSION.md` first line on this tip is `0.36` paint. That is player-facing paint on the lane, not certification and not a 0.36 milestone exit.

Style bible `artifacts/SUN_ART_STYLE_BIBLE.md` is **LOCKED**. Do not generate plates in Cursor / Grok Bot.

PR **#376** MAPFIX / restore is **in-flight unpaid**. Do not claim merged. Do not touch `src/state.js` / `src/engine.js` from this ticket.

### Holds (unchanged except 0.37 park)

- **0.36 PC Readiness is not certified.** The tip-named evidence pack is closed-for-FEED only.
- **0.37 stranger / external review PARKED** (owner GO 2026-09-22).
- **Do not invent OPEN 0.38.**
- ART-R2 **broad campaign** remains held. Amara-route parked. PR 45 / draft PR 46 untouched.
- Ignore Copilot leftovers #297 / #304 unless owner names them. **Do not merge #297.**
- No main close-out, tag, Release, deploy, or certification language.
- No remint of PRs 107–381. Remint HOLD Approve-only. No Netlify pin remint.
- L-025–L-028 are not reopened here.

## L-025–L-028 dispositions

- **L-025 — LOCKED:** Commander Option B. The rendered-path gender/canon audit and document synchronization remain implementation work; this reconciliation changes no gameplay prose.
- **L-026 — LOCKED:** retain Last Off-Shift zero/one routes solely as tested defensive save-recovery guards and preserve `junctionChoice`. Required coverage remains implementation work.
- **L-027 — LOCKED:** retire `vess_course_lost` and its promised downstream-course consequence. Runtime removal remains implementation work.
- **L-028 — DEFERRED:** default RETIRE unless qualifying mobile-PX evidence meets the pre-registered, Manraj-approved threshold. No indicator is authorized.

L-020 through L-024 remain ruled. This handoff does not reopen L-004, art governance, product/canon scope outside L-025–L-028, or any release gate.

## Verification and CI state

The version lane carries dependency-free `scripts/verify.mjs` and `scripts/simulate.mjs` plus version/main Actions workflows. Green version-lane checks are candidate evidence only. They do not certify, ship, or close a sequential gate.

Live GitHub rulesets (read-only GET, 2026-08-31): `21894580` covers `version/*`; `21894561` covers `main`; `21051662` covers only `recovery/e4f8440-nopub`. This ticket has no ruleset-mutation authority.

## Blockers

- `NO-PUBLISH / NOT_CERTIFIED` remains controlling; no release artifact or deployment authority exists.
- Last certified baseline remains `0.28.1d`. The version lane is not certified.
- L-025–L-027 gameplay/coverage work is not implemented by this docs ticket; L-028 remains deferred.
- This ticket has no merge-to-main, tag, release, Netlify, or deploy authority.

## Next action

**This ticket:** merge-commit `SUN-DOCS-TIP-HONESTY-F84C-01` into `version/0.30.1-main-reconcile-ci.1`, then stop. Docs/status only. Do not remint #381 / #380 / #379 / #378 / #377 / #371. Do not FEED 0.37 strangers. Do not claim #376 merged. Do not close out to `main`, tag, certify, deploy, or invent OPEN 0.38.

**Grok / orchestrator (`$ S1`):** after this merge, keep building named owner-OPEN tickets. 0.37 strangers stay PARKED. Remint HOLD Approve-only. Netlify HOLD. #376 stays on `$S2`.

**Manraj:** remains sole publish authority. `NO-PUBLISH / NOT_CERTIFIED` remains controlling.

<!-- STATUS_COMPLETE -->
