# Sunsplitter — Current Status

`schema_version: 1`  
`updated_utc: 2026-08-19`  
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

`tested_runtime_sha: e4f84409759760d31fcf47b8a227802a61421f51` (audited recovery base, not certified)  
`verify_mjs: present on tree`  
`simulate_mjs: present on tree`  
`pipe_boot_r1_dispatch_base: d7728f7ea6f6ee3f4966d73dc6316c3c26491f6e`  
`pipe_boot_r1_approved_head_sha: b4d932527b7899fb9467f341cd83e01901e207b2`  
`pipe_boot_r1_approved_tree_sha: 3befa469312fb00e45f2871b349510ff7e0a4042`  
`pipe_boot_r1_synthetic_merge_sha: 69bdc0d79f0c5228815f17c47b96e629d75a1a22`  
`pipe_boot_r1_merge_sha: 0b600935aa6e21d4898bcc9c7ad09e78893ec6e7`  
`governed_recovery_successor_sha: 0b600935aa6e21d4898bcc9c7ad09e78893ec6e7`  
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

`milestone: Governance recovery bootstrap complete; REC-01 disposition pending`  
`ticket: NONE — PIPE-BOOT-R1 closed; REC-01 remains frozen`  
`pipe_boot_acceptance: ACCEPTED — Manraj — 2026-08-19`  
`owner: Grok / program office`  
`state: PIPE-BOOT-R1 CLOSED / LANDED at governed recovery successor 0b600935aa6e21d4898bcc9c7ad09e78893ec6e7; no correction ticket authorized`  
`pull_request: https://github.com/mbains89/Sunsplitter/pull/16 (merged)`  
`governed_branch: recovery/e4f8440-nopub`  
`implementation_branch: ticket/0.30.1-pipe-boot-r1 (merged source branch)`  
`dispatch_base_sha: d7728f7ea6f6ee3f4966d73dc6316c3c26491f6e`  
`audited_gameplay_runtime_provenance: e4f84409759760d31fcf47b8a227802a61421f51`

## Frozen work

`ticket: REC-01 / GitHub issue #13 — quiet_tomas rewind`
`state: FROZEN — do not merge, continue, or count as recovery evidence`
`implementation_branch: ticket/0.30.1-01-quiet-tomas-rewind`  
`observed_isolated_head: 8e4fe42f376444049105e27ff7005a6220e88b9a`
`original_dispatch_base_sha: 93ccb43e141da544b999ba2c45f664a19428a5e3`

## Blocked

- Every RECOVERY-DEC §4 correction remains blocked. PIPE-BOOT-R1 is closed, but REC-01 / issue #13 remains frozen until Grok / program office separately adjudicates and dispatches it.
- The PIPE-BOOT-R1 prerequisite is closed at governed recovery successor `0b600935aa6e21d4898bcc9c7ad09e78893ec6e7`; that closure does not authorize any correction, merge, release, or deployment.
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
- `artifacts/PIPE-BOOT-R1_RECOVERY_PIPELINE_RECONCILIATION.md` records exact-base discrepancy and issue #15 dispatch
- PIPE-BOOT-R1 / issue #15 landed through protected PR #16 as governed recovery successor `0b600935aa6e21d4898bcc9c7ad09e78893ec6e7`
- REC-01 / issue #13 is frozen at isolated observed head `8e4fe42`; it is not merged into the recovery line
- No gameplay, narrative, art, or publication bytes are authorized by PIPE-BOOT-R1

## Next action

**Grok / program office:** Separately adjudicate REC-01 / issue #13 at frozen head `8e4fe42f376444049105e27ff7005a6220e88b9a` against governed recovery successor `0b600935aa6e21d4898bcc9c7ad09e78893ec6e7`; keep REC-01 frozen unless and until explicitly dispatched. `NO-PUBLISH / NOT CERTIFIED` remains active.

<!-- STATUS_COMPLETE -->
