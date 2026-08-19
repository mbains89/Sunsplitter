# Sunsplitter — Current Status

`schema_version: 1`  
`updated_utc: 2026-08-19`  
`authority_migration_base: 3789062f1d0703f63feb8ada66503bb773879550`

This is the compact rolling handoff. Process: `/AGENTS.md`. Future scope: `ROADMAP.md`. Dispositions: `LOCKS.md`.

## Release / recovery state

`runtime_baseline_sha: e4f84409759760d31fcf47b8a227802a61421f51`  
`release_label: NO-PUBLISH recovery base`  
`release_state: NO-PUBLISH`  
`last_certified_baseline_label: 0.28.1d`  
`last_certified_baseline_sha_associated: 2bb4517707df90702a9b78fe0fa8fb55c1852dd8`  
`production_url: NOT_AUTHORIZED`  
`release_artifact: none authorized from this base`  
`version_integrity: NOT_CERTIFIED`

**HARD STOP.** Tree at `e4f8440` is the audited NO-PUBLISH recovery base only. Candidate labels such as `0.30` do not certify any sequential gate. No deploy, tag, Release, or itch.io upload from this base.

Authority documents:
- `artifacts/GOV-01_AUTHORITY_RECONCILIATION.md`
- `artifacts/RECOVERY-DEC_AMENDMENT.md`
- Branch `recovery/e4f8440-nopub` + `artifacts/PIPE-BOOT_RECOVERY_PIPELINE.md`

## Active work

`milestone: Governance recovery bootstrap complete`  
`state: GOVERNANCE_BOOTSTRAP_COMPLETE — awaiting Manraj acceptance of PIPE-BOOT before any integrity dispatch`  
`governed_branch: recovery/e4f8440-nopub`  
`owner: Grok / program office`

## Blocked

- All correction / integrity implementation until Manraj accepts PIPE-BOOT and issues a bounded dispatch.
- Publication, tagging, deploy, monetization frozen.
- Sequential gates from 0.28.2 onward remain uncertified.
- L-025, L-026, L-027, L-028 open.

## Open locks (remaining)

- L-025 — Commander identity A/B
- L-026 — Last Off-Shift zero/one branches
- L-027 — `vess_course_lost` consumer or retirement
- L-028 — Ticket 2 new-crew indicator

## Next action

**Manraj:** Accept or reject PIPE-BOOT.  
**Grok:** Only after acceptance, dispatch a bounded integrity ticket limited to the RECOVERY-DEC list. No correction work before that.

<!-- STATUS_COMPLETE -->
