# Sunsplitter — Current Status

`schema_version: 2`
`updated_utc: 2026-09-06`
`source_main_sha: 8d23109b63b844e0703fb36643f14b91b8800c90`
`source_main_tree: a6b96e0907de586f6cdd31cf15db09bc1341ddaf`
`runtime_baseline_sha: 8d23109b63b844e0703fb36643f14b91b8800c90`
`runtime_src_tree: 992f7c57e18709acc08c8ee3cddcfdea816a6acf`
`audited_recovery_base_sha: e4f84409759760d31fcf47b8a227802a61421f51`
`protected_recovery_head_sha: 41d43f7d22e08efb742a0773ea422c91aa70c170`
`version_lane_sha: 9e9025ebccef2a99daffcd615ecc42d82b6f38bd`
`owner_playtest_pin_sha: a91a26d47ac76a976ca4406caf9b04511c11ba82`

This is the compact rolling handoff. Process: `/AGENTS.md`. Future scope: `ROADMAP.md`. Dispositions: `LOCKS.md`. Vocabulary in this file follows ROADMAP §1: **LANDED ON VERSION LANE** is merge-committed into `version/0.30.1-main-reconcile-ci.1` and is not on `main` and is not certified. **SHIPPED** is present on `main` and recorded here as current repository truth; it is not a Release or deploy. **CERTIFIED** applies only to the last certified baseline below. Nothing on the version lane is SHIPPED or CERTIFIED.

## Release and authority state

`observed_runtime: main@8d23109 — SHIPPED observation of GitHub main; not certified`
`version_lane_head: 9e9025e — LANDED ON VERSION LANE after PR 171; not SHIPPED; not CERTIFIED`
`audited_recovery_base: e4f8440 — preserved historical NO-PUBLISH recovery base`
`last_certified_baseline_label: 0.28.1d`
`version_integrity: NOT_CERTIFIED`
`release_state: NO-PUBLISH`
`release_artifact: none authorized`
`deployment: none authorized`
`sequential_gate_closure: none credited from 0.28.2 onward`
`pc_readiness_0_36: not opened`

Main's `src` tree is byte-identical to protected recovery head `41d43f7` (`992f7c57e18709acc08c8ee3cddcfdea816a6acf`). Main and that protected head are not repository-equivalent: their art, pipeline, and authority-document trees differ. The audited recovery base `e4f8440` remains provenance, not the current observed runtime and not a release candidate. Version-lane `src` has advanced past that pin; those bytes are LANDED ON VERSION LANE only.

Current main art is **PRESENT / UNRECONCILED / NO INTEGRATION OR RELEASE CREDIT**. No art decision, wiring approval, roster approval, publication right, or release credit is implied by image presence.

PIPE-BOOT and PIPE-BOOT-R1 were accepted and closed in the protected recovery lineage (`93ccb43e141da544b999ba2c45f664a19428a5e3`, then `0b600935aa6e21d4898bcc9c7ad09e78893ec6e7`). They are protected governance/pipeline evidence only; they grant no gameplay, release, certification, publication, deployment, or sequential-gate credit.

Owner playtesting uses Netlify pin `a91a26d`. This file does not remint PIN-02 and does not authorize a new Netlify pin.

PR 45 and draft PR 46 remain held and untouched.

## Current work

`milestone: SUN-VERIFY-MAIN-POSTURE-LANE-01 — verify main vs version-lane identity pins`
`state: MAIN-POSTURE VERIFY ON TIP 9e9025e — 0.36 not opened; NO-PUBLISH / NOT_CERTIFIED`
`governed_branch: version/0.30.1-main-reconcile-ci.1`
`owner: Grok / program office; Manraj remains sole publish authority`

### SUN-VERIFY-MAIN-POSTURE-LANE-01 (this tip)

Verified on lane tip `9e9025e` after PR 171 (`SUN-VOICE-HYGIENE-01`). Privacy-loop and voice hygiene are DONE. This ticket does not certify.

| Pin | Live value | Meaning |
|---|---|---|
| `source_main_sha` | `8d23109b63b844e0703fb36643f14b91b8800c90` | GitHub `main` HEAD. SHIPPED observation only. |
| `source_main_tree` | `a6b96e0907de586f6cdd31cf15db09bc1341ddaf` | Bound in `scripts/verify.mjs` and `scripts/fixtures/main-reconcile-ci-pr-baseline.json`. |
| `runtime_src_tree` | `992f7c57e18709acc08c8ee3cddcfdea816a6acf` | Main `src` tree. Same as protected recovery `src`. |
| Lane `HEAD` | `9e9025ebccef2a99daffcd615ecc42d82b6f38bd` | LANDED ON VERSION LANE only. |
| Fixture certification string | `NO-PUBLISH / NOT_CERTIFIED` | Unchanged. |

`identityAndAuthorityChecks` still requires the original STATUS field lines and the L-025 through L-028 disposition lines. Those strings stay in their original sections only. Lane `src` may differ from the main src pin; the src-equality gate applies only to the original main-reconcile ticket route.

Proof note: `artifacts/SUN_VERIFY_MAIN_POSTURE_LANE_01.md`.

Lane facts below are LANDED ON VERSION LANE. They are not SHIPPED and not CERTIFIED. Last certified remains `0.28.1d`.

### Drained on the version lane (do not reopen as a new queue)

- **0.30.1–0.32:** previously recorded drain/exit on the lane. Still `NOT_CERTIFIED`.
- **0.33 playtest tickets:** one-PR playtest repairs and named ART-R2 one-scene retargets landed through PR 142. Player-facing label remains `0.33`. Playtest-closed ledger is a later ticket identity, not this branch.
- **0.34 Mobile UX / a11y / perf:** PRs 107–109 (`SUN-V034-MOBILE-UX-01`, `SUN-V034-A11Y-01`, `SUN-V034-PERF-01`) merge-committed on the lane. Drain recorded. Not certified.
- **0.35 Packaging and private itch:** PRs 110–113 (`SUN-V035-PRIVATE-PACKAGE-01`, `SUN-V035-CONTENT-NOTICE-01`, `SUN-V035-PHONE-RESUME-01`, `SUN-V035-PRIVATE-DRAFTS-01`) merge-committed on the lane. Refresh PRs 143–145 rebind package and non-public drafts to playtest pin `a91a26d` / archive SHA-256 `47d8d9c9fdea11971e8e62763344ff5308453358d6ada42fb14e88b102408a58`. Drain recorded. Not publication. Not certified.

### Recently landed (PRs 141–147)

| PR | Ticket | Lane meaning |
|---|---|---|
| 141 | `SUN-V035-ART-R2-ELIAS-SEALANT-01` | Sealant beat retarget off the cup plate. LANDED ON VERSION LANE. |
| 142 | `SUN-V035-ART-R2-PLAYTEST-CLOSE-01` | Named PLAYTEST_SUN art cluster proved **ALREADY_SATISFIED** after PRs 133–141. Proof only. |
| 143 | `SUN-V035-PRIVATE-PACKAGE-REFRESH-01` | Private package refresh to `a91a26d`. Not a remint of 107–142 as a new identity. |
| 144 | `SUN-V035-CONTENT-NOTICE-REVISIT-01` | Reopen existing content notice from title utilities. Not a settings dashboard. Not L-040. |
| 145 | `SUN-V035-PRIVATE-DRAFTS-REFRESH-01` | Non-public drafts bound to the PR 143 digest. No public page. |
| 146 | `SUN-V035-STATUS-DOCS-01` | Planning-docs sync. LANDED ON VERSION LANE. |
| 147 | `SUN-V035-PLAYTEST-CLOSED-LEDGER-01` | PLAYTEST_SUN findings closed to PRs. LANDED ON VERSION LANE. |

This ticket (`SUN-PLAYTEST-ART-EVENT-AUDIT-01`) is the owner playtest art↔event
audit: one in-tree retarget (`bond_mira` → `quiet_mira.jpg`), Grok brief stubs
with a standing **portrait identity-lock**, pack note `SUN-ART-BODY-REFERENCE-01`
(front/back body refs planned; no bytes here), and a **draft** style bible
`artifacts/SUN_ART_STYLE_BIBLE.md` (owner must lock it before grok.com loops;
body_ref pack is after that lock). No event-plate generation in Cursor.
Ordered post-0.35 / pre-0.36 follow-ups live in
`artifacts/SUN_PLAYTEST_RESPONSE_PLAN.md`. It is not a remint of PR 142.
**0.36 is not opened.**

Hunch check, verified: `SUN-V035-PHONE-RESUME-01` (PR 112, merge `e3b7472`) is an ancestor of `1a8e8a5`. Private-package phone-resume guide/server/manifest checks already exist. Treat phone-resume as **ALREADY_SATISFIED** on the lane. Do not mint a retry. Owner physical play remains playtesting evidence, not certification.

### Holds (unchanged)

- **0.36 not opened.** Do not mint PC-readiness work from this file.
- ART-R2 **broad campaign** (binary regen batch) remains held. Named Grok brief stubs from this ticket are instructions, not a campaign reopen and not wiring authority.
- Amara-route parked.
- PR 45 / draft PR 46 untouched.
- No main close-out, tag, Release, deploy, or certification language.
- No remint of PRs 107–171. No Netlify pin remint / PIN-02 remint.
- L-025–L-028 are not reopened here. LOCKS dispositions are unchanged. ROADMAP digest in LOCKS may be rewritten if current-work bullets change; that is not a lock ruling.

## L-025–L-028 dispositions

- **L-025 — LOCKED:** Commander Option B. The rendered-path gender/canon audit and document synchronization remain implementation work; this reconciliation changes no gameplay prose.
- **L-026 — LOCKED:** retain Last Off-Shift zero/one routes solely as tested defensive save-recovery guards and preserve `junctionChoice`. Required coverage remains implementation work.
- **L-027 — LOCKED:** retire `vess_course_lost` and its promised downstream-course consequence. Runtime removal remains implementation work.
- **L-028 — DEFERRED:** default RETIRE unless qualifying mobile-PX evidence meets the pre-registered, Manraj-approved threshold. No indicator is authorized.

L-020 through L-024 remain ruled. This handoff does not reopen L-004, art governance, product/canon scope outside L-025–L-028, or any release gate.

## Verification and CI state

The version lane carries dependency-free `scripts/verify.mjs` and `scripts/simulate.mjs` plus version/main Actions workflows. Green version-lane checks are candidate evidence only. They do not certify, ship, or close a sequential gate. Known remaining findings stay attributable and may not be accepted, weakened, or ratcheted into certification.

Live GitHub rulesets (read-only GET, 2026-08-31): `21894580` covers `version/*` and requires `version-release-policy`, `version-verify`, and `version-simulation-smoke`; `21894561` covers `main` and requires `main-release-policy`, `main-verify`, and `main-simulation-gate`; `21051662` covers only `recovery/e4f8440-nopub` and still requires legacy `release-policy`, `verify`, and `simulation-gate`. This ticket has no ruleset-mutation authority and does not change those rulesets.

## Blockers

- `NO-PUBLISH / NOT_CERTIFIED` remains controlling; no release artifact or deployment authority exists.
- Last certified baseline remains `0.28.1d`. The version lane is not certified.
- L-025–L-027 gameplay/coverage work is not implemented by this docs ticket; L-028 remains deferred.
- Strict candidate simulation must reach zero at its locked thresholds; current known failures remain blockers, not an accepted baseline.
- This ticket has no merge-to-main, tag, release, Netlify, or deploy authority.

## Next action

**This ticket:** merge-commit `SUN-VERIFY-MAIN-POSTURE-LANE-01` into `version/0.30.1-main-reconcile-ci.1`, then stop. Docs/proof only. Do not close out to `main`, tag, certify, deploy, or mint 0.36.

**Grok / orchestrator (`$ S1`):** after this merge, follow `artifacts/SUN_PLAYTEST_RESPONSE_PLAN.md`. First: owner-lock `artifacts/SUN_ART_STYLE_BIBLE.md`. Then `SUN-ART-BODY-REFERENCE-01` in grok.com (front/back). Then the NEEDS_GROK_PLATE event loop in grok.com, one beat at a time. Wire only owner-approved assets after Canon PASS/HOLD/REJECT. Do not mint 0.36.

**Manraj:** remains sole publish authority. Approves the style bible, then each grok.com plate personally. Green CI is not merge-to-main authority. `NO-PUBLISH / NOT_CERTIFIED` remains controlling. No close-out to `main`, tag, release, deploy, or PIN-02 remint.

<!-- STATUS_COMPLETE -->
