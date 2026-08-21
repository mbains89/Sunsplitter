# Sunsplitter — Current Status

`schema_version: 1`  
`updated_utc: 2026-08-21`
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

`tested_runtime_sha: 23951012655b0037a55e82c755b66dd4d852f20b` (protected ART-INTEGRATION-R2 governance merge; required recovery checks passed; recovery evidence, not certification)
`verify_mjs: present on tree`  
`simulate_mjs: present on tree`  
`pipe_boot_r1_dispatch_base: d7728f7ea6f6ee3f4966d73dc6316c3c26491f6e`  
`pipe_boot_r1_approved_head_sha: b4d932527b7899fb9467f341cd83e01901e207b2`  
`pipe_boot_r1_approved_tree_sha: 3befa469312fb00e45f2871b349510ff7e0a4042`  
`pipe_boot_r1_synthetic_merge_sha: 69bdc0d79f0c5228815f17c47b96e629d75a1a22`  
`pipe_boot_r1_merge_sha: 0b600935aa6e21d4898bcc9c7ad09e78893ec6e7`  
`governed_recovery_successor_sha: 23951012655b0037a55e82c755b66dd4d852f20b`
`rec_01_approved_head_sha: 7824aac5615df58cfeb7c26361ad4c04c8f47ad9`
`rec_01_approved_tree_sha: 9ccbfbbcceed2c98900fabd635830abe3b5a424c`
`rec_01_merge_sha: 9bb4ccf7efbf856ffed569436787f779ad195698`
`rec_01_control_state: CLOSED / LANDED — protected PR #22 merged 2026-08-19T23:25:16Z; NO-PUBLISH and NOT_CERTIFIED remain active`
`lock_record_r1_approved_head_sha: 1d7d57fdff10b51d3b66921d44c594dd6a830f4b`
`lock_record_r1_approved_tree_sha: 0af206bdc531b355598840402e94be297e297fc8`
`lock_record_r1_merge_sha: 8a840397d80b8fe1027a22ca89603d92f0e562e6`
`lock_record_r1_control_state: CLOSED / LANDED — protected PR #23; NO-PUBLISH and NOT_CERTIFIED remain active`
`art_r2_governance_approved_head_sha: a00aab77faa0d4881be4962b435a5e80a0741e40`
`art_r2_governance_approved_head_tree: 96829ad0e01619f56bed2121a666645b3f9b5259`
`art_r2_governance_merge_sha: 23951012655b0037a55e82c755b66dd4d852f20b`
`art_r2_governance_control_state: CLOSED / LANDED — protected PR #25 merged 2026-08-20T14:13:18Z; NO-PUBLISH and NOT_CERTIFIED remain active`
`art_r2_held_head_sha: 7fe31675b678d041c980605ed5c5533d3ea22581`
`art_r2_held_head_tree: 52551891fe55324bc2fcd073bff56b9a8cd2c061`
`art_r2_held_synthetic_merge_sha: c18d8c71243623914601efcf5b88ab952eda637f`
`art_r2_final_adjudication: HOLD — NOT ELIGIBLE; PR route passes, protected-push route rejects predecessor 2395101 and incorrectly selects the obsolete issue #15 fixture`
`art_r2_push_ratchet_superseded_head_sha: b68bc42fc1a3efd72314c90b01f5aaa66ce2df74`
`art_r2_push_ratchet_superseded_head_tree: b4f141c82ed89c78e260c01acecd1dc2a6c793d0`
`art_r2_push_ratchet_b01_state: CORRECTION AUTHORIZED / CANDIDATE NOT ADJUDICATED — superseded predicate accepted a distinct raw commit object; correction binds the exact raw payload and a byte-projected policy-source self-seal; final corrected head and tree are recorded externally in draft PR #27 after deterministic construction to avoid literal self-reference`
`art_r2_push_ratchet_b01_alternate_sha: 653a71903ac810c1065e171dae90060f07279d85 — same protected parent, tree, paths, modes, file bytes, and normalized manifest text as the superseded head; prohibited by exact raw-object correction`
`art_r2_push_ratchet_b01_old_raw: payload 755 bytes / SHA-256 33638b74e5dcc296c0b57535eb58ec20cd0bda37ca341f7cba8122c21a4693da; message 493 bytes / SHA-256 3be268eea78476ea13aa0b7c4e71b2bf545bff33a34456cc106cac253c155956 / no terminal LF`
`art_r2_push_ratchet_b01_alternate_raw: payload 690 bytes / SHA-256 f16fb6f2ac10d8d70d009545ce9f389a168b96b40a5f53fa20dec0c5e2b92205; message 494 bytes / SHA-256 70f6274b0f29fb3d581e2e31faa2eae3abd2ca9d8611425ae5e1931003ab7c81 / terminal LF`
`art_r2_push_ratchet_b01_reproduction: exact alternate reconstructed as a real Git object; real equivalent successor 01b3cd1666d39aad32b14a528a4a9b0e2703cc32 with ordered parents [23951012655b0037a55e82c755b66dd4d852f20b, 653a71903ac810c1065e171dae90060f07279d85] passed the superseded PR and protected-push policy routes`
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

`milestone: ART-R2-PUSH-RATCHET-R1-B01 — exact raw-commit correction on existing draft PR #27; independent adjudication required before any protected successor`
`ticket: ART-R2-PUSH-RATCHET-R1-B01 governs only the exact three-path correction and lease-protected replacement of the existing precursor candidate; reconciliation and every protected merge require separate tickets`
`pipe_boot_acceptance: ACCEPTED — Manraj — 2026-08-19`
`rec_ratchet_01_authorization: APPROVED — Manraj — 2026-08-19`
`rec_ratchet_01_source_sha: 78a64c7a180a34e786da3eefac42a06f50703bab`
`rec_ratchet_01_state: CLOSED / LANDED — protected PR #21; merge 5e93b68a7412bcbed041e7c74a985ae30682a1d2; governance and policy only`
`rec_01_state: CLOSED / LANDED — protected PR #22; merge 9bb4ccf7efbf856ffed569436787f779ad195698`
`rec_01_pull_request: https://github.com/mbains89/Sunsplitter/pull/22`
`lock_record_r1_authorization: APPROVED / CLOSED — Manraj — protected merge 2026-08-20`
`lock_record_ruling_sha: 009fca7884e360486ddda172c389f480b62323a5`
`art_integration_r2_authorization: APPROVED — Manraj — 2026-08-20`
`art_integration_r2_wave2_archive_sha256: 1d1b23afbaeafda3b4f865302ab9f605e8e38780bf94abafa0c5c68ab52bd485 — 129/129 internal records PASS — 34 runtime plates`
`art_integration_r2_wave3_archive_sha256: 6f1f40886a112fe6b2e0e543690cecce36a522b5daf408b784a21f67821e633f — 45/45 manifest entries PASS — 21 runtime plates`
`art_integration_r2_governance_state: CLOSED / LANDED — protected PR #25 merge 23951012655b0037a55e82c755b66dd4d852f20b`
`art_integration_r2_implementation_state: TOPOLOGY-CONDITIONAL — held at 7fe31675b678d041c980605ed5c5533d3ea22581 before the precursor successor; eligible only as an exact content-preserving reconciliation head plus fresh adjudication after that successor; landed only through a separately authorized protected ART merge`
`art_r2_push_ratchet_authorization: B01 CORRECTION APPROVED — Manraj — 2026-08-21`
`art_r2_push_ratchet_state: B01 CORRECTION / CANDIDATE / DRAFT / UNMERGED — superseded b68bc42fc1a3efd72314c90b01f5aaa66ce2df74 is not eligible; corrected exact head must pass attributable checks and a new independent adjudication; no merge is authorized here`
`owner: GROK / PROGRAM OFFICE NEXT — issue and perform a new independent exact-head adjudication of the corrected PR #27 candidate; Build may not self-adjudicate or begin any later phase`
`state: FAIL-CLOSED — PR #27 remains draft and unmerged; PR #26 remains held and unchanged; REC-RATCHET-02 and REC-02 blocked; NO-PUBLISH / NOT CERTIFIED remain active`
`governed_branch: recovery/e4f8440-nopub`
`precursor_branch: ticket/art-r2-push-ratchet-r1`
`held_implementation_branch: ticket/art-integration-r2-55`
`dispatch_base_sha: 23951012655b0037a55e82c755b66dd4d852f20b`
`dispatch_base_tree: 96829ad0e01619f56bed2121a666645b3f9b5259`
`audited_gameplay_runtime_provenance: e4f84409759760d31fcf47b8a227802a61421f51`

## Historical REC-01 evidence

`ticket: REC-01 / GitHub issue #13 — quiet_tomas rewind`
`state: SUPERSEDED EVIDENCE — closed and unmerged; do not continue or count as recovery evidence`
`implementation_branch: ticket/0.30.1-01-quiet-tomas-rewind`  
`observed_isolated_head: 8e4fe42f376444049105e27ff7005a6220e88b9a`
`original_dispatch_base_sha: 93ccb43e141da544b999ba2c45f664a19428a5e3`

## Blocked

- Every RECOVERY-DEC §4 correction after REC-01 remains blocked pending separate dispatch. REC-01 is closed at protected merge `9bb4ccf7efbf856ffed569436787f779ad195698`.
- PIPE-BOOT-R1 remains closed at `0b600935aa6e21d4898bcc9c7ad09e78893ec6e7`; later protected successors are REC-RATCHET-01 at `5e93b68a7412bcbed041e7c74a985ae30682a1d2`, REC-01 at `9bb4ccf7efbf856ffed569436787f779ad195698`, and LOCK-RECORD-R1 at `8a840397d80b8fe1027a22ca89603d92f0e562e6`.
- At this status revision, ART-INTEGRATION-R2 PR #26 was held at `7fe31675b678d041c980605ed5c5533d3ea22581`; that commit remains the immutable implementation anchor. While protected head is `23951012655b0037a55e82c755b66dd4d852f20b`, PR #26 may not change. After an exact precursor successor, only a separately authorized reconciliation merge with ordered parents `[7fe31675b678d041c980605ed5c5533d3ea22581, precursor-successor]` may advance it, without content edits and without marking it ready.
- While protected head is `23951012655b0037a55e82c755b66dd4d852f20b`, the corrected ART-R2-PUSH-RATCHET-R1-B01 candidate must first pass attributable checks and a new independent exact-head adjudication. The superseded head `b68bc42fc1a3efd72314c90b01f5aaa66ce2df74`, alternate `653a71903ac810c1065e171dae90060f07279d85`, and any successor that uses either are ineligible. Only a later, separately authorized exact protected precursor merge may create the successor needed by a new PR #26 reconciliation ticket.
- REC-RATCHET-02 / issue #24 and REC-02 remain blocked. This precursor does not start, duplicate, repin, or modify either stage.
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
- LOCK-RECORD-R1 landed through protected PR #23 at merge `8a840397d80b8fe1027a22ca89603d92f0e562e6`, tree `0af206bdc531b355598840402e94be297e297fc8`
- ART-INTEGRATION-R2 governance landed through protected PR #25 at merge `23951012655b0037a55e82c755b66dd4d852f20b`, tree `96829ad0e01619f56bed2121a666645b3f9b5259`
- ART-INTEGRATION-R2 implementation PR #26 was open, draft, unmerged, and unchanged at `7fe31675b678d041c980605ed5c5533d3ea22581` at this status revision; that commit remains the held implementation anchor, and any later head must be the exact separately authorized reconciliation described above
- ART-R2-PUSH-RATCHET-R1-B01 is the sole active repair at this status revision while the protected head remains `23951012655b0037a55e82c755b66dd4d852f20b`: exact raw-commit identity correction on the existing three-path precursor and draft PR #27; no runtime, artwork, fixture, workflow, PR #26, or later-stage change

## Next action

**Exact next action:** Grok / program office issues and performs a new independent exact-head adjudication of the corrected draft PR #27 candidate, binding the exact head, tree, parent, raw commit-object evidence, three changed-file hashes, and attributable CI. No merge, PR #26 reconciliation, REC-RATCHET-02, or REC-02 action is authorized from this record. `NO-PUBLISH / NOT CERTIFIED` remains active.

<!-- STATUS_COMPLETE -->
