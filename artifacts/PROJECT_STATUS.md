# Sunsplitter — Current Status

`schema_version: 2`
`updated_utc: 2026-09-22`
`source_main_sha: 8d23109b63b844e0703fb36643f14b91b8800c90`
`source_main_tree: a6b96e0907de586f6cdd31cf15db09bc1341ddaf`
`runtime_baseline_sha: 8d23109b63b844e0703fb36643f14b91b8800c90`
`runtime_src_tree: 992f7c57e18709acc08c8ee3cddcfdea816a6acf`
`audited_recovery_base_sha: e4f84409759760d31fcf47b8a227802a61421f51`
`protected_recovery_head_sha: 41d43f7d22e08efb742a0773ea422c91aa70c170`
`version_lane_sha: 50ec4895168774dd9341633fb46ee6d364a81707`
`owner_playtest_pin_sha: a91a26d47ac76a976ca4406caf9b04511c11ba82`

This is the compact rolling handoff. Process: `/AGENTS.md`. Future scope: `ROADMAP.md`. Dispositions: `LOCKS.md`. Vocabulary in this file follows ROADMAP §1: **LANDED ON VERSION LANE** is merge-committed into `version/0.30.1-main-reconcile-ci.1` and is not on `main` and is not certified. **SHIPPED** is present on `main` and recorded here as current repository truth; it is not a Release or deploy. **CERTIFIED** applies only to the last certified baseline below. Nothing on the version lane is SHIPPED or CERTIFIED.

## Release and authority state

`observed_runtime: main@8d23109 — SHIPPED observation of GitHub main; not certified`
`version_lane_head: 50ec4895168774dd9341633fb46ee6d364a81707 — LANDED ON VERSION LANE after PR #363 RECEIPT-VERIFY-MODES; not SHIPPED; not CERTIFIED`
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

`milestone: SUN-ROADMAP-UPCOMING-01 — tip honesty after PR #363 + upcoming versions table`
`state: DOCS ONLY AT 50ec4895 — no JPEG / no wire / no gameplay; NO-PUBLISH / NOT_CERTIFIED`
`governed_branch: version/0.30.1-main-reconcile-ci.1`
`owner: Grok / program office; Manraj remains sole publish authority`

### SUN-ROADMAP-UPCOMING-01 (this tip)

Docs/status only. Records live lane HEAD `50ec4895168774dd9341633fb46ee6d364a81707` after PR **#363** RECEIPT-VERIFY-MODES, and lands the labeled upcoming-version table on ROADMAP. Closes the pointer lie left by #352 / #362 (STATUS/QUEUE still cited `c3626434` / #345 at that HEAD). Does not remint #363 / #362 / #352 / #351 / #306 / #326. Does not mint, certify, deploy, or invent OPEN 0.37.

| Pin | Live value | Meaning |
|---|---|---|
| `source_main_sha` | `8d23109b63b844e0703fb36643f14b91b8800c90` | GitHub `main` HEAD. SHIPPED observation only. |
| `source_main_tree` | `a6b96e0907de586f6cdd31cf15db09bc1341ddaf` | Bound in `scripts/verify.mjs` and `scripts/fixtures/main-reconcile-ci-pr-baseline.json`. |
| `runtime_src_tree` | `992f7c57e18709acc08c8ee3cddcfdea816a6acf` | Main `src` tree. Same as protected recovery `src`. |
| Lane `HEAD` | `50ec4895168774dd9341633fb46ee6d364a81707` | LANDED ON VERSION LANE only. After PR #363 RECEIPT-VERIFY-MODES. |
| Fixture certification string | `NO-PUBLISH / NOT_CERTIFIED` | Unchanged. |

`identityAndAuthorityChecks` still requires the original STATUS field lines and the L-025 through L-028 disposition lines. Those strings stay in their original sections only. Lane `src` may differ from the main src pin; the src-equality gate applies only to the original main-reconcile ticket route.

Live lane tip cite: `50ec4895168774dd9341633fb46ee6d364a81707` after PR #363 RECEIPT-VERIFY-MODES (`SUN-RECEIPT-VERIFY-MODES-01`). Receipt: `docs/SUN_ROADMAP_UPCOMING_01.md`. That cite is the pre-PR lane HEAD, not this docs PR's merge SHA. Honesty-02 cite `c3626434` / PR #345, tip-sync-351 cite `3aa2053f` / PR #351, and style-bible lock pin `55143745` remain historical, not the live tip. `0.36` stays PAINT, not OPEN. Do not invent OPEN 0.37.

Proof note: `artifacts/SUN_VERIFY_MAIN_POSTURE_LANE_01.md` remains the earlier posture proof. This ticket does not remint that identity.

Lane facts below are LANDED ON VERSION LANE. They are not SHIPPED and not CERTIFIED. Last certified remains `0.28.1d`.

### Drained on the version lane (do not reopen as a new queue)

- **0.30.1–0.32:** previously recorded drain/exit on the lane. Still `NOT_CERTIFIED`.
- **0.33 playtest tickets:** one-PR playtest repairs and named ART-R2 one-scene retargets landed through PR 142. Player-facing label remains `0.33` in older playtest docs. Playtest-closed ledger is a later ticket identity, not this branch.
- **0.34 Mobile UX / a11y / perf:** PRs 107–109 (`SUN-V034-MOBILE-UX-01`, `SUN-V034-A11Y-01`, `SUN-V034-PERF-01`) merge-committed on the lane. Drain recorded. Not certified.
- **0.35 Packaging and private itch:** PRs 110–113 (`SUN-V035-PRIVATE-PACKAGE-01`, `SUN-V035-CONTENT-NOTICE-01`, `SUN-V035-PHONE-RESUME-01`, `SUN-V035-PRIVATE-DRAFTS-01`) merge-committed on the lane. Refresh PRs 143–145 rebind package and non-public drafts to playtest pin `a91a26d` / archive SHA-256 `47d8d9c9fdea11971e8e62763344ff5308453358d6ada42fb14e88b102408a58`. Drain recorded. Not publication. Not certified.

### Recently landed

| PR | Ticket | Lane meaning |
|---|---|---|
| 363 | `SUN-RECEIPT-VERIFY-MODES-01` | AGENTS receipt-path honesty + `docs/VERIFY_MODES.md`. STATUS/QUEUE were incomplete there. |
| 362 | `SUN-FABLE-HONESTY-01` | Receipt only. Recorded pointer lie. Do not remint. |
| 360 | `SUN-CREW-BOARD-FOLLOW-CLARITY-01` | First Crew tap shows living board. Keep `renderCrewPanel("lena")`. |
| 352 | `SUN-ROADMAP-TIP-SYNC-351-01` | Receipt only. Claimed STATUS/QUEUE retarget missing from diff. |
| 351 | `SUN-CASCADE-ALLUSIVE-PAYOFF-01` | `flags.changeorders` logged\|buried on `reckon_summary`. Tomas "People were tier four." unspent. Do not remint. |
| 349 | `SUN-HITL-WIRE-REMAP-01` | SKIP 1–3 / ALREADY_SATISFIED 4–5. Docs receipt only. Do not remint. |
| 348 | `SUN-TITLE-CONTINUE-CREW-02` | Continue chip = saved visible living crew. Not corrupt #297. |
| 347 | `SUN-DOCS-TIP-HONESTY-02` | Historical tip honesty after #345. |
| 346 | `SUN-ART-PLATE-LOOP-01` | One docs brief (`romance_lena_1`). Not JPEG. |
| 345 | `SUN-STILL-BURNING-CORRIDOR-01` | Historical prior tip `c3626434`. |
| 326 | `SUN-LETHAL-RESUME-DEATHBEAT-01` | Resume death-beat harness. Do not remint. |
| 306 | `SUN-EMBRYO-COUNT-SWEEP-01` | Spoken 140,006 live. Do not remint. |
| 247 | `SUN-V036-PACK-NEXT-10` | Pack 0.30.3 ALREADY_SATISFIED; queue exhausted. |
| 241 | `SUN-ROADMAP-PLAN-01` | ROADMAP + LOCKS digest tip honesty and labeled 0.36→0.37 plan. Not certify. Not OPEN 0.37. |
| 238 | `SUN-V036-COMMANDER-CREATE-HINT-01` | Lane chrome. Not 0.36 PC-readiness exit. |
| 237 | `SUN-V036-CONTENT-NOTICE-CLARITY-01` | Lane chrome. Not 0.36 PC-readiness exit. |

`VERSION.md` first line on this tip is `0.36` paint. That is player-facing paint on the lane, not certification and not a 0.36 milestone exit.

Style bible `artifacts/SUN_ART_STYLE_BIBLE.md` is **LOCKED** by owner OPEN 2026-09-16 art HITL. Do not generate plates in Cursor / Grok Bot. Do not start BODY-REFERENCE or a new ART-PLATE-LOOP identity on this branch. PR **#346** already dispatched one brief.

Hunch check, verified: `SUN-V035-PHONE-RESUME-01` (PR 112, merge `e3b7472`) remains an ancestor of the current lane. Treat phone-resume as **ALREADY_SATISFIED** on the lane. Do not mint a retry.

### Holds (unchanged)

- **0.36 PC Readiness is not certified and is not opened as a mint from this file.** ROADMAP may plan the finish. This file does not authorize implementation.
- **Do not invent OPEN 0.37.**
- ART-R2 **broad campaign** (binary regen batch) remains held.
- Amara-route parked.
- PR 45 / draft PR 46 untouched.
- Ignore Copilot leftovers #297 / #304 unless owner names them.
- No main close-out, tag, Release, deploy, or certification language.
- No remint of PRs 107–363 as a new drain queue. Remint HOLD Approve-only. No Netlify pin remint / PIN-02 remint.
- L-025–L-028 are not reopened here. LOCKS dispositions are unchanged except the ROADMAP digest line synced by this ticket.

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

**This ticket:** merge-commit `SUN-ROADMAP-UPCOMING-01` into `version/0.30.1-main-reconcile-ci.1`, then stop. Docs/status only. Do not remint #363 / #352 / #351 / #306 / #326. Do not close out to `main`, tag, certify, deploy, or invent OPEN 0.37.

**Grok / orchestrator (`$ S1`):** after this merge, wait for owner OPEN of a named new ticket. Remint HOLD Approve-only. Do not invent extra OPEN. Netlify HOLD.

**Manraj:** remains sole publish authority and sole grok.com plate approver. Green CI is not merge-to-main authority. `NO-PUBLISH / NOT_CERTIFIED` remains controlling.

<!-- STATUS_COMPLETE -->
