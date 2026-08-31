# Sunsplitter — Current Status

`schema_version: 2`
`updated_utc: 2026-08-30`
`source_main_sha: 8d23109b63b844e0703fb36643f14b91b8800c90`
`source_main_tree: a6b96e0907de586f6cdd31cf15db09bc1341ddaf`
`runtime_baseline_sha: 8d23109b63b844e0703fb36643f14b91b8800c90`
`runtime_src_tree: 992f7c57e18709acc08c8ee3cddcfdea816a6acf`
`audited_recovery_base_sha: e4f84409759760d31fcf47b8a227802a61421f51`
`protected_recovery_head_sha: 41d43f7d22e08efb742a0773ea422c91aa70c170`

This is the compact rolling handoff for GitHub `main`. Process: `/AGENTS.md`. Future scope: `ROADMAP.md`. Dispositions: `LOCKS.md`. The containing ticket branch proposes authority and CI reconciliation; nothing in this file describes unmerged ticket bytes as present on `main`.

## Release and authority state

`observed_runtime: main@8d23109 — controlling repository/runtime observation, not certified`
`audited_recovery_base: e4f8440 — preserved historical NO-PUBLISH recovery base`
`last_certified_baseline_label: 0.28.1d`
`version_integrity: NOT_CERTIFIED`
`release_state: NO-PUBLISH`
`release_artifact: none authorized`
`deployment: none authorized`
`sequential_gate_closure: none credited from 0.28.2 onward`

Main's `src` tree is byte-identical to protected recovery head `41d43f7` (`992f7c57e18709acc08c8ee3cddcfdea816a6acf`). Main and that protected head are not repository-equivalent: their art, pipeline, and authority-document trees differ. The audited recovery base `e4f8440` remains provenance, not the current observed runtime and not a release candidate.

Current main art is **PRESENT / UNRECONCILED / NO INTEGRATION OR RELEASE CREDIT**. No art decision, wiring approval, roster approval, publication right, or release credit is implied by image presence.

PIPE-BOOT and PIPE-BOOT-R1 were accepted and closed in the protected recovery lineage (`93ccb43e141da544b999ba2c45f664a19428a5e3`, then `0b600935aa6e21d4898bcc9c7ad09e78893ec6e7`). They are protected governance/pipeline evidence only; they grant no gameplay, release, certification, publication, deployment, or sequential-gate credit.

## L-025–L-028 dispositions

- **L-025 — LOCKED:** Commander Option B. The rendered-path gender/canon audit and document synchronization remain implementation work; this reconciliation changes no gameplay prose.
- **L-026 — LOCKED:** retain Last Off-Shift zero/one routes solely as tested defensive save-recovery guards and preserve `junctionChoice`. Required coverage remains implementation work.
- **L-027 — LOCKED:** retire `vess_course_lost` and its promised downstream-course consequence. Runtime removal remains implementation work.
- **L-028 — DEFERRED:** default RETIRE unless qualifying mobile-PX evidence meets the pre-registered, Manraj-approved threshold. No indicator is authorized.

L-020 through L-024 remain ruled. This reconciliation does not reopen L-004, art governance, product/canon scope outside L-025–L-028, or any release gate.

## Verification and CI state

Main currently contains dependency-free `scripts/verify.mjs` and `scripts/simulate.mjs`, but no main/version Actions workflows or compact main/version release-policy script. The existing verifier covers current structural/runtime fixtures. The existing simulator's smoke routes are useful diagnostics, not the locked random/cheapest/priciest 6,000-run candidate gate.

This ticket is authorized to add non-certifying version smoke and a strict close-out gate without changing runtime, art, release, or deployment bytes. Until the ticket merges through the governed lane and required contexts/rulesets are separately aligned, its green results are candidate evidence only. Known V4/V5 findings must remain attributable and may not be accepted, weakened, or ratcheted into certification.

Current live ruleset `21051662` still requires legacy contexts (`release-policy`, `verify`, `simulation-gate`) on `version/*`. The approved later ruleset split is specified in `GITHUB_PUSH_RULES.md` but is not applied by this ticket.

## Blockers

- `NO-PUBLISH / NOT_CERTIFIED` remains controlling; no release artifact or deployment authority exists.
- L-025–L-027 gameplay/coverage work is not implemented by this governance-and-CI ticket; L-028 remains deferred.
- Strict candidate simulation must reach zero at its locked thresholds; current known failures remain blockers, not an accepted baseline.
- Required GitHub contexts cannot be changed by this ticket. Any mismatch between legacy protection and the new canonical names blocks merge without authorizing a bypass or ruleset mutation.

## Next action

**Manraj:** after the ticket PR reports its exact-head local and available CI evidence, review the bounded authority/CI reconciliation and decide whether to authorize the separate ruleset update; do not merge this ticket under legacy-context ambiguity.

<!-- STATUS_COMPLETE -->
