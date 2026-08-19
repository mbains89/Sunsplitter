# Sunsplitter — Current Status

`schema_version: 1`  
`updated_utc: 2026-08-19`  
`authority_migration_base: 3789062f1d0703f63feb8ada66503bb773879550`

This is the compact rolling handoff. Process: `/AGENTS.md`. Future scope: `ROADMAP.md`. Dispositions: `LOCKS.md`. Recovery authority: `GOV-01_AUTHORITY_RECONCILIATION.md`, `RECOVERY-DEC_AMENDMENT.md`, `PIPE-BOOT_RECOVERY_PIPELINE.md`.

## Release / recovery state

`runtime_baseline_sha: e4f84409759760d31fcf47b8a227802a61421f51`  
`release_label: NO-PUBLISH recovery base (candidate labels such as 0.30 do not certify)`  
`release_state: NO-PUBLISH`  
`last_certified_baseline_label: 0.28.1d`  
`last_certified_baseline_sha_associated: 2bb4517707df90702a9b78fe0fa8fb55c1852dd8`  
`production_url: NOT_AUTHORIZED`  
`release_artifact: none authorized from this base`  
`artifact_digest: none — no release created`  
`version_integrity: NOT_CERTIFIED — tree carries mixed historical labels; recovery in progress`

**HARD STOP:** No deploy, tag, GitHub Release, itch.io upload, or public “released” claim from this base until a later Manraj authorization lifts NO-PUBLISH after governed integrity evidence.

## Verification — latest attributable evidence

`tested_runtime_sha: e4f84409759760d31fcf47b8a227802a61421f51` (audited recovery base, not certified)  
`verify_mjs: present on tree`  
`simulate_mjs: present on tree`  
`external_audits: SUNSPLITTER_HOSTILE_PREPUBLICATION_AUDIT_E4F8440_2026-08-18.md + SUNSPLITTER_ULTRA_QUALITY_CRUCIBLE_2026-08-18.md (external evidence; not summed; unique findings preserved)`  
`playable_file_match_reported: 190/190 (deployment provenance inferred, not certified)`

## Active work

`milestone: 0.30.1 bounded integrity recovery`  
`ticket: REC-01 / GitHub issue #13 — quiet_tomas rewind`  
`pipe_boot_acceptance: ACCEPTED — Manraj — 2026-08-19`  
`owner: Build / implementation agent`  
`state: DISPATCHED — implementation not yet started`  
`pull_request: none`  
`governed_branch: recovery/e4f8440-nopub`  
`implementation_branch: ticket/0.30.1-01-quiet-tomas-rewind`  
`dispatch_base_sha: 93ccb43e141da544b999ba2c45f664a19428a5e3`

## Blocked

- Only REC-01 / issue #13 implementation is authorized. Every other RECOVERY-DEC §4 correction remains blocked pending its own bounded dispatch.
- All sequential gates from 0.28.2 onward remain uncertified.
- Publication, tagging, deploy, monetization frozen.
- L-025, L-026, L-027, L-028 remain open decision gates.

## Open locks (remaining)

- L-025 — Commander identity A/B
- L-026 — Last Off-Shift zero/one branches
- L-027 — `vess_course_lost` consumer or retirement
- L-028 — Ticket 2 new-crew indicator

L-020 through L-024 previously ruled; recovery does not reopen them. Full language in `LOCKS.md` + RECOVERY-DEC §4 for implementation posture.

## Canon and repository deltas (governance only)

- `artifacts/GOV-01_AUTHORITY_RECONCILIATION.md` on main
- `artifacts/RECOVERY-DEC_AMENDMENT.md` on main
- `artifacts/PIPE-BOOT_RECOVERY_PIPELINE.md` on `recovery/e4f8440-nopub`
- REC-01 dispatched as GitHub issue #13 on `ticket/0.30.1-01-quiet-tomas-rewind`
- No gameplay, narrative, art, or publication bytes changed by this dispatch

## Next action

**Build / implementation agent:** Implement REC-01 / issue #13 only on `ticket/0.30.1-01-quiet-tomas-rewind`, preserve NO-PUBLISH, run the required targeted and full verification, and open an evidence-bearing PR to `recovery/e4f8440-nopub`.

<!-- STATUS_COMPLETE -->
