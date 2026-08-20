# Sunsplitter — Current Status

`schema_version: 1`  
`updated_utc: 2026-08-20`
`authority_migration_base: 3789062f1d0703f63feb8ada66503bb773879550`

This is the compact rolling handoff. Process: `/AGENTS.md`. Future scope: `ROADMAP.md`. Dispositions: `LOCKS.md`. Recovery authority: `GOV-01_AUTHORITY_RECONCILIATION.md`, `RECOVERY-DEC_AMENDMENT.md`, `PIPE-BOOT_RECOVERY_PIPELINE.md`, `PIPE-BOOT-R1_RECOVERY_PIPELINE_RECONCILIATION.md`.

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

`tested_runtime_sha: 9bb4ccf7efbf856ffed569436787f779ad195698` (protected REC-01 merge; approved head tree validated; recovery evidence, not certification)
`verify_mjs: present on tree`  
`simulate_mjs: present on tree`  
`pipe_boot_r1_dispatch_base: d7728f7ea6f6ee3f4966d73dc6316c3c26491f6e`  
`pipe_boot_r1_approved_head_sha: b4d932527b7899fb9467f341cd83e01901e207b2`  
`pipe_boot_r1_approved_tree_sha: 3befa469312fb00e45f2871b349510ff7e0a4042`  
`pipe_boot_r1_synthetic_merge_sha: 69bdc0d79f0c5228815f17c47b96e629d75a1a22`  
`pipe_boot_r1_merge_sha: 0b600935aa6e21d4898bcc9c7ad09e78893ec6e7`  
`governed_recovery_successor_sha: 9bb4ccf7efbf856ffed569436787f779ad195698`
`rec_01_approved_head_sha: 7824aac5615df58cfeb7c26361ad4c04c8f47ad9`
`rec_01_approved_tree_sha: 9ccbfbbcceed2c98900fabd635830abe3b5a424c`
`rec_01_merge_sha: 9bb4ccf7efbf856ffed569436787f779ad195698`
`rec_01_control_state: CLOSED / LANDED — protected PR #22 merged 2026-08-19T23:25:16Z; NO-PUBLISH and NOT_CERTIFIED remain active`
`pipe_boot_r1_ci: PASS — ready-for-review runs 32295713512 and 32295713513; six required jobs successful`  
`pipe_boot_r1_control_state: CLOSED / LANDED — PR #16 merged after exact-head program-office adjudication; NO-PUBLISH and NOT_CERTIFIED remain active`
`github_workflows_at_dispatch_base: ABSENT`
`verify_mjs_at_dispatch_base: FAIL — three stale 0.29 expectations against existing 0.30 surfaces`
`simulate_mjs_at_dispatch_base: CONTRACT MISMATCH — required random/cheapest/priciest 2,000-run V1/V4/V5 reporting absent; V5 detector coverage not proven comprehensive`
`recovery_required_checks: ACTIVE — ruleset 21051662 requires release-policy, verify, and simulation-gate with the branch up to date`
`recovery_ruleset_or_branch_protection: ACTIVE — ruleset 21051662 targets main and recovery/e4f8440-nopub; empty bypass list; pull request required; deletion and force-push blocked`
`tag_creation_protection: ACTIVE — ruleset 21051665 targets all tags; empty bypass list; creation and deletion restricted; force-push blocked`
`netlify_build_state: STOPPED — project sunsplitter / site 6af8d4bc-df5f-4e41-8042-57a10108a2a9`
`netlify_published_deploy_lock: ACTIVE — deploy 6a85163bab20340008f53e95 at e4f84409759760d31fcf47b8a227802a61421f51`
`netlify_build_hooks: NONE`
`netlify_production_deployment_methods: GIT-ONLY — CLI, MCP, and API production deploys blocked`
`external_audits: SUNSPLITTER_HOSTILE_PREPUBLICATION_AUDIT_E4F8440_2026-08-18.md + SUNSPLITTER_ULTRA_QUALITY_CRUCIBLE_2026-08-18.md (external evidence; not summed; unique findings preserved)`  
`playable_file_match_reported: 190/190 (deployment provenance inferred, not certified)`

## Active work

`milestone: LOCK-RECORD-R1 — governed L-025–L-028 disposition record`
`ticket: LOCK-RECORD-R1 — exact-route policy amendment plus authority synchronization`
`pipe_boot_acceptance: ACCEPTED — Manraj — 2026-08-19`
`rec_ratchet_01_authorization: APPROVED — Manraj — 2026-08-19`
`rec_ratchet_01_source_sha: 78a64c7a180a34e786da3eefac42a06f50703bab`
`rec_ratchet_01_state: CLOSED / LANDED — protected PR #21; merge 5e93b68a7412bcbed041e7c74a985ae30682a1d2; governance and policy only`
`rec_01_state: CLOSED / LANDED — protected PR #22; merge 9bb4ccf7efbf856ffed569436787f779ad195698`
`rec_01_pull_request: https://github.com/mbains89/Sunsplitter/pull/22`
`lock_record_r1_authorization: APPROVED — Manraj — 2026-08-19`
`lock_record_ruling_sha: 009fca7884e360486ddda172c389f480b62323a5`
`owner: Build / GPT-Codex; disposition authority recorded for Grok / program office`
`state: LOCK-RECORD-R1 DRAFT PR ONLY; no gameplay implementation; NO-PUBLISH / NOT CERTIFIED remain active`
`governed_branch: recovery/e4f8440-nopub`
`implementation_branch: ticket/0.30.1-locks-l025-l028-r1`
`dispatch_base_sha: 9bb4ccf7efbf856ffed569436787f779ad195698`
`audited_gameplay_runtime_provenance: e4f84409759760d31fcf47b8a227802a61421f51`

## Historical REC-01 evidence

`ticket: REC-01 / GitHub issue #13 — quiet_tomas rewind`
`state: SUPERSEDED EVIDENCE — closed and unmerged; do not continue or count as recovery evidence`
`implementation_branch: ticket/0.30.1-01-quiet-tomas-rewind`  
`observed_isolated_head: 8e4fe42f376444049105e27ff7005a6220e88b9a`
`original_dispatch_base_sha: 93ccb43e141da544b999ba2c45f664a19428a5e3`

## Blocked

- Every RECOVERY-DEC §4 correction after REC-01 remains blocked pending separate dispatch. REC-01 is closed at protected merge `9bb4ccf7efbf856ffed569436787f779ad195698`.
- PIPE-BOOT-R1 remains closed at `0b600935aa6e21d4898bcc9c7ad09e78893ec6e7`; later protected successors are REC-RATCHET-01 at `5e93b68a7412bcbed041e7c74a985ae30682a1d2` and REC-01 at `9bb4ccf7efbf856ffed569436787f779ad195698`.
- All sequential gates from 0.28.2 onward remain uncertified.
- Publication, tagging, deployment, and monetization remain frozen.
- Implementation flowing from L-025 through L-027 requires separate dispatch and applicable gates. L-028 is DEFERRED and defaults to retirement unless its recorded mobile-PX threshold condition is met.

## Decision dispositions recorded 2026-08-19

- L-025 — LOCKED: Commander identity Option B; rendered-path audit and synchronization remain pending.
- L-026 — LOCKED: retain zero/one branches solely as tested defensive save-recovery guards; coverage is not yet dispatched.
- L-027 — LOCKED: retire `vess_course_lost` and its promised downstream-course consequence; removal is not yet dispatched.
- L-028 — DEFERRED: default RETIRE unless mobile PX meets a pre-registered, Manraj-approved comprehension threshold; no indicator is authorized.

L-020 through L-024 remain ruled; recovery does not reopen them. Historical recovery documents that call L-025–L-028 open remain evidence of their earlier state; current disposition is controlled by `LOCKS.md`.

## Canon and repository deltas (governance only)

- `artifacts/GOV-01_AUTHORITY_RECONCILIATION.md` on main
- `artifacts/RECOVERY-DEC_AMENDMENT.md` on main
- `artifacts/PIPE-BOOT_RECOVERY_PIPELINE.md` on `recovery/e4f8440-nopub`
- `artifacts/PIPE-BOOT-R1_RECOVERY_PIPELINE_RECONCILIATION.md` records exact-base discrepancy and issue #15 dispatch
- PIPE-BOOT-R1 / issue #15 landed through protected PR #16 as governed recovery successor `0b600935aa6e21d4898bcc9c7ad09e78893ec6e7`
- REC-RATCHET-01 landed through protected PR #21 at merge `5e93b68a7412bcbed041e7c74a985ae30682a1d2`, recording the post-rewind ratchet transition and arming one exact REC-01 route
- REC-01 / issue #13 landed through protected PR #22 at merge `9bb4ccf7efbf856ffed569436787f779ad195698` (approved head `7824aac5615df58cfeb7c26361ad4c04c8f47ad9`, tree `9ccbfbbcceed2c98900fabd635830abe3b5a424c`); the earlier isolated head `8e4fe42f376444049105e27ff7005a6220e88b9a` remains closed, unmerged, and non-evidence
- LOCK-RECORD-R1 records owner dispositions and one exact policy route only; it authorizes no gameplay, narrative, art, publication, certification, or sequential-gate closure

## Next action

**Independent Grok / program office:** Adjudicate the exact LOCK-RECORD-R1 draft head after all required checks pass. Do not merge, implement gameplay, tag, release, deploy, or publish. `NO-PUBLISH / NOT CERTIFIED` remains active.

<!-- STATUS_COMPLETE -->
