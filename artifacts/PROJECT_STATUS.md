# Sunsplitter — Current Status

`schema_version: 1`
`updated_utc: 2026-08-22`
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

`tested_runtime_sha: 23951012655b0037a55e82c755b66dd4d852f20b` (protected ART-INTEGRATION-R2 governance successor; recovery evidence, not certification)
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
`art_r2_governance_approved_tree_sha: 96829ad0e01619f56bed2121a666645b3f9b5259`
`art_r2_governance_merge_sha: 23951012655b0037a55e82c755b66dd4d852f20b`
`art_r2_governance_control_state: CLOSED / LANDED — protected PR #25; NO-PUBLISH and NOT_CERTIFIED remain active`
`pipe_boot_r1_ci: PASS — ready-for-review runs 32295713512 and 32295713513; six required jobs successful`
`pipe_boot_r1_control_state: CLOSED / LANDED — PR #16 merged after exact-head program-office adjudication; NO-PUBLISH and NOT_CERTIFIED remain active`
`github_workflows_at_dispatch_base: ABSENT`
`verify_mjs_at_dispatch_base: FAIL — three stale 0.29 expectations against existing 0.30 surfaces`
`simulate_mjs_at_dispatch_base: CONTRACT MISMATCH — required random/cheapest/priciest 2,000-run V1/V4/V5 reporting absent; V5 detector coverage not proven comprehensive`
`recovery_required_checks: ACTIVE — ruleset 21051662 requires release-policy, verify, and simulation-gate with the branch up to date`
`recovery_ruleset_or_branch_protection: ACTIVE AT 2026-08-22 GATE-A READBACK — owner-authenticated raw ruleset 21051662 explicitly returned bypass_actors=[]; targets main and recovery/e4f8440-nopub; pull request required; deletion and force-push blocked; refresh is mandatory before any separately authorized merge`
`tag_creation_protection: ACTIVE AT 2026-08-22 GATE-A READBACK — owner-authenticated raw ruleset 21051665 explicitly returned bypass_actors=[]; targets all tags; creation, deletion, and force-push blocked; refresh is mandatory before any separately authorized merge`
`netlify_build_state: STOPPED — project sunsplitter / site 6af8d4bc-df5f-4e41-8042-57a10108a2a9`
`netlify_published_deploy_lock: ACTIVE — deploy 6a85163bab20340008f53e95 at e4f84409759760d31fcf47b8a227802a61421f51`
`netlify_build_hooks: NONE`
`netlify_production_deployment_methods: GIT-ONLY — CLI, MCP, and API production deploys blocked`
`external_audits: SUNSPLITTER_HOSTILE_PREPUBLICATION_AUDIT_E4F8440_2026-08-18.md + SUNSPLITTER_ULTRA_QUALITY_CRUCIBLE_2026-08-18.md (external evidence; not summed; unique findings preserved)`
`playable_file_match_reported: 190/190 (deployment provenance inferred, not certified)`

## Active work

`milestone: TEMP-EXACT-HEAD-RECOVERY-GATE-R2-A — REC-RATCHET-02 exact candidate`
`ticket: REC-RATCHET-02 / issue #24 — Gate A repinned to protected 2395101`
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
`owner: Build / GPT-Codex; independent Grok preliminary review is separate; merge executor Manraj requires separate exact protected-merge authorization`
`state: GATE A CANDIDATE — one direct-child candidate and one draft PR authorized; no protected merge authorized; NO-PUBLISH / NOT CERTIFIED`
`governed_branch: recovery/e4f8440-nopub`
`implementation_branch: ticket/0.30.1-rec-ratchet-02`
`dispatch_base_sha: 23951012655b0037a55e82c755b66dd4d852f20b`
`dispatch_base_tree: 96829ad0e01619f56bed2121a666645b3f9b5259`
`gate_a_scope: exactly .github/workflows/verify.yml; artifacts/PROJECT_STATUS.md; artifacts/REC-RATCHET-02_AUTHORIZED_BASELINE.json; artifacts/REC-RATCHET-02_AUTHORIZED_REC-02.patch.json; artifacts/REC-RATCHET-02_BASELINE_TRANSITION.md; scripts/release-policy.mjs`
`active_simulation_baseline_sha256: 0633469f57971b9c00c877a33f9ccb818e53d5a8de8cc787e4ca2a25fdeda7f2 — unchanged in Gate A`
`functional_projection_state: EVIDENCE ONLY — exact inactive REC-02 baseline + verifier + seven source files; later STATUS is separate and full exact-head verification must rerun`
`rec_02_governed_scenes: cut_out; vent; past_leak; vault_voice; arc_future_1; act3_reckoning_heading; pregnancy_check; custody_possession; custody_thaw`
`art_r2_held_digest: 1441be78e8d0d95f4cf2cfd9ace72b7e6458aa0ec230336748de6a2b96db7baa — 55-image digest preserved by the mechanical compatibility projection`
`pr_26_state: OPEN / DRAFT / UNMERGED / FROZEN — head 7fe31675b678d041c980605ed5c5533d3ea22581; tree 52551891fe55324bc2fcd073bff56b9a8cd2c061`
`pr_27_state: SUPERSEDED FOR RECOVERY / OPEN / DRAFT / UNMERGED / FROZEN — head 34c2a732ccc231118964a006a8e006b60d765807; tree 9698810cd2c48b81e9d856b75d451c0869e99eaa`
`pr_28_state: OUTSIDE SCOPE / OPEN / DRAFT / UNMERGED — head 45937884147950f9bd497e0723701dfe25d37a9d; tree 36623fa9b09adb696ecf174d33183143269cb9da`
`audited_gameplay_runtime_provenance: e4f84409759760d31fcf47b8a227802a61421f51`

## Historical REC-01 evidence

`historical_rec_01_ticket: REC-01 / GitHub issue #13 — quiet_tomas rewind`
`historical_rec_01_state: SUPERSEDED EVIDENCE — closed and unmerged; do not continue or count as recovery evidence`
`historical_rec_01_branch: ticket/0.30.1-01-quiet-tomas-rewind`
`observed_isolated_head: 8e4fe42f376444049105e27ff7005a6220e88b9a`
`original_dispatch_base_sha: 93ccb43e141da544b999ba2c45f664a19428a5e3`

## Blocked

- REC-RATCHET-02 protected merge is not authorized. Reviewer PASS would establish eligibility only.
- REC-02 source implementation remains inactive until REC-RATCHET-02 passes checks, receives independent exact-head PASS, lands through a separately authorized protected merge, and issue #24 is repinned to that exact successor.
- B2 and all V4/V5 decisions and bytes remain unapproved. The inactive baseline records surviving V4/V5 evidence without claiming repair.
- PIPE-BOOT-R1 remains closed at `0b600935aa6e21d4898bcc9c7ad09e78893ec6e7`; later protected successors are REC-RATCHET-01 at `5e93b68a7412bcbed041e7c74a985ae30682a1d2`, REC-01 at `9bb4ccf7efbf856ffed569436787f779ad195698`, and LOCK-RECORD-R1 at `8a840397d80b8fe1027a22ca89603d92f0e562e6`.
- PR #26 remains frozen. ART reconciliation is a future governed action and the 55-image digest must remain exact.
- PR #27 remains frozen and superseded for recovery. No modification, closure, ready transition, or merge is authorized.
- PR #28 remains entirely outside this recovery scope.
- R5–R7 source, images, receipts, builds, evaluator/App work, and cloud resources remain frozen.
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
- ART-INTEGRATION-R2 is the sole owner-approved L-004 art-sequencing exception: exactly 55 approved event plates, presentation-only wiring, protected governance first, draft-only implementation second
- ART-INTEGRATION-R2 governance landed through protected PR #25 at `23951012655b0037a55e82c755b66dd4d852f20b`; PR #26 remains the frozen draft implementation evidence

## Next action

**Manraj:** After the REC-RATCHET-02 draft PR exists, send its exact head/tree and builder receipt to Grok for independent read-only review. Do not mark ready or merge. `NO-PUBLISH / NOT CERTIFIED` remains active.

<!-- STATUS_COMPLETE -->
