# Sunsplitter — Current Status

`schema_version: 1`
`updated_utc: 2026-08-23`
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

`tested_runtime_sha: 31aca17b807c4dc8edef3683e30d5fefdd47ad7a` (exact protected REC-RATCHET-02 successor; recovery evidence, not certification)
`verify_mjs: present on tree`
`simulate_mjs: present on tree`
`pipe_boot_r1_dispatch_base: d7728f7ea6f6ee3f4966d73dc6316c3c26491f6e`
`pipe_boot_r1_approved_head_sha: b4d932527b7899fb9467f341cd83e01901e207b2`
`pipe_boot_r1_approved_tree_sha: 3befa469312fb00e45f2871b349510ff7e0a4042`
`pipe_boot_r1_synthetic_merge_sha: 69bdc0d79f0c5228815f17c47b96e629d75a1a22`
`pipe_boot_r1_merge_sha: 0b600935aa6e21d4898bcc9c7ad09e78893ec6e7`
`governed_recovery_successor_sha: 31aca17b807c4dc8edef3683e30d5fefdd47ad7a`
`rec_ratchet_02_approved_head_sha: f23c4bed1555c7ad6bcb3b42ca5c6ea3a92e37ab`
`rec_ratchet_02_approved_tree_sha: f458b021bc9a9a36cb28c24fd7dee165c2bbaac5`
`rec_ratchet_02_merge_sha: 31aca17b807c4dc8edef3683e30d5fefdd47ad7a`
`rec_ratchet_02_control_state: CLOSED / LANDED — protected PR #29 merged 2026-08-23T00:26:09Z; NO-PUBLISH and NOT_CERTIFIED remain active`
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

`milestone: REC-RATCHET-02-POLICY-SELFTEST-CORRECTION-R4-C6 — C5 retirement and zero-Git failed-identity preservation`
`ticket: direct Manraj follow-on authorization / Stage A — exactly one fresh local three-path C6 candidate; issue #32 remains the consumed C5 dispatch record`
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
`state: POLICY CORRECTION C6 STAGE A — exactly one fresh local three-path candidate authorized; stop after sealed local receipt; NO-PUBLISH / NOT CERTIFIED`
`governed_branch: recovery/e4f8440-nopub`
`implementation_branch: ticket/0.30.1-rec-ratchet-02-policy-selftest-correction-r4 — RESERVED ONLY / NOT CREATED / REMOTE CREATION NOT AUTHORIZED`
`dispatch_base_sha: 31aca17b807c4dc8edef3683e30d5fefdd47ad7a`
`dispatch_base_tree: f458b021bc9a9a36cb28c24fd7dee165c2bbaac5`
`gate_a_scope: LANDED PRECURSOR — exact six-path envelope retained as immutable evidence`
`policy_correction_scope: exactly artifacts/PROJECT_STATUS.md; artifacts/REC-RATCHET-02_POLICY_SELFTEST_CORRECTION.md; scripts/release-policy.mjs`
`failed_rec_02_r1_head: bd293bbe9fa9ed55eb0620bf85ef0a1316b2524e`
`failed_rec_02_r1_tree: 34fa0adbfb027e01448a1a0771c8ff5af3997e26`
`failed_rec_02_r1_parent: 31aca17b807c4dc8edef3683e30d5fefdd47ad7a`
`failed_rec_02_r1_manifest_sha256: de647dda0cf7b36290126489a342732d2022eee0816f220993b3f3d6c6478315`
`failed_rec_02_r1_raw_sha256: ec41001c92a8d96e6913615dcd6fa82d108e0d91cd0c0135ecce9bdfad81d80a`
`failed_rec_02_r1_disposition: FAILED REQUIRED GATE / LOCAL ONLY / UNPUSHED / NON-REUSABLE`
`failed_policy_correction_c1_head: b12ff37ef9153a509827d914b825dd51ec6de0ca`
`failed_policy_correction_c1_tree: 14dcaa3fb6a92349b6bebf06a606d356456859e8`
`failed_policy_correction_c1_parent: 31aca17b807c4dc8edef3683e30d5fefdd47ad7a`
`failed_policy_correction_c1_manifest_sha256: 0d43560c72b994981e0dc5232156abfbbe99884ee0677ea469455a8fa79b34e7`
`failed_policy_correction_c1_raw_sha256: cca58ea7ae7576af6dac9bf081c8a9723ae697a15112facae2734273aba72f78`
`failed_policy_correction_c1_policy_projection_sha256: 986182e1d58019a20f75f0b66211bb2f1746e9066e1fefa8aa619bb0d507619f`
`failed_policy_correction_c1_disposition: FAILED REQUIRED REVIEW / LOCAL ONLY / UNPUSHED / NON-REUSABLE`
`failed_policy_correction_c2_head: 5c3b526d287d888bc3e0765569e6632ec5f6e0e6`
`failed_policy_correction_c2_tree: dc1e677d66c35873ac040c598e33b39c05c78e54`
`failed_policy_correction_c2_parent: 31aca17b807c4dc8edef3683e30d5fefdd47ad7a`
`failed_policy_correction_c2_manifest_sha256: d102608126737abcc8ae739d952b17e656a805373d186aacf53b232e8175b56e`
`failed_policy_correction_c2_raw_sha256: efb805938179bd721cff84bc0b947cb2e2741065dfa194ad6a4ee6d49cf41652`
`failed_policy_correction_c2_policy_projection_sha256: fc7905cc051b12a7ec8410a046d48ae480b1e987504fc15c37e90d5e2a77a5d9`
`failed_policy_correction_c2_disposition: FAILED REQUIRED REVIEW / LOCAL ONLY / UNPUSHED / NON-REUSABLE`
`failed_policy_correction_c3_head: ec18d093a4d4fe7a79cb8996da0c780e182fe9a1`
`failed_policy_correction_c3_tree: a1c00d7ab971efd81d4544577150fa54e618f89d`
`failed_policy_correction_c3_parent: 31aca17b807c4dc8edef3683e30d5fefdd47ad7a`
`failed_policy_correction_c3_manifest_sha256: 555b0340fa1f473dc86eab30a6a2b51a93a20564eba410e889bb7eec390b3e4a`
`failed_policy_correction_c3_raw_sha256: b36e2c87b8f728e57411d8d0c3e3a5ec43ba120ae8efe326f95af25ba29da17f`
`failed_policy_correction_c3_policy_projection_sha256: 123633dcc49d4bf45650a700a2d539af03a4a95f14fa24a5140f92d9caef97da`
`failed_policy_correction_c3_remote_branch: ticket/0.30.1-rec-ratchet-02-policy-selftest-correction-r1 — FROZEN at exact failed head`
`failed_policy_correction_c3_pr: #30 — OPEN / DRAFT / UNMERGED / FROZEN`
`failed_policy_correction_c3_synthetic_merge: 721a94ca10cdde235e558514b29131bd5644ba98`
`failed_policy_correction_c3_policy_run: Recovery Release Policy #48 / run 32613327167 — FAILURE`
`failed_policy_correction_c3_policy_job: release-policy / job 97129767639 — step Run release-policy positive and negative fixtures FAILED; event enforcement SKIPPED`
`failed_policy_correction_c3_verify_run: Recovery Verify #58 / run 32613327212 — SUCCESS; random 97129767728; priciest 97129767832; verify 97129767835; cheapest 97129767840; simulation-gate 97130082900`
`failed_policy_correction_c3_disposition: FAILED REQUIRED CI / REMOTE BRANCH FROZEN / DRAFT PR #30 FROZEN / UNMERGED / NON-REUSABLE`
`failed_policy_correction_c4_head: 6441d5f7ad5df5870dbddcabce6243c3d23d09ca`
`failed_policy_correction_c4_tree: f0f12d10bc406c320a1c9324249ee4f2d17332e5`
`failed_policy_correction_c4_parent: 31aca17b807c4dc8edef3683e30d5fefdd47ad7a`
`failed_policy_correction_c4_manifest_sha256: b418beff175878ed66906f1690d42978725ff2f9c04901dca5d3ae87913ecf4a`
`failed_policy_correction_c4_raw_sha256: 209a98ac29d30138ab684e203ab0c4d60f6b5ca872c969da226dcd8803c3d2fb`
`failed_policy_correction_c4_policy_projection_sha256: c326aef49b156f624fb67b9e6e6fa0eab1cf86f987bffcdad9ec355f811d2206`
`failed_policy_correction_c4_remote_branch: ticket/0.30.1-rec-ratchet-02-policy-selftest-correction-r2 — FROZEN at exact failed head`
`failed_policy_correction_c4_pr: #31 — OPEN / DRAFT / UNMERGED / FROZEN`
`failed_policy_correction_c4_synthetic_merge: bfea3326bcb2b18431c7d10fcb1f59f89b4b8235`
`failed_policy_correction_c4_policy_run: Recovery Release Policy #49 / run 32615874248 — SUCCESS; release-policy job 97136388344`
`failed_policy_correction_c4_verify_run: Recovery Verify #59 / run 32615874238 — SUCCESS; random 97136388297; cheapest 97136388349; verify 97136388352; priciest 97136388419; simulation-gate 97136711468`
`failed_policy_correction_c4_hold: https://github.com/mbains89/Sunsplitter/pull/31#issuecomment-5384470876 — owner-approved independent adjudication HOLD`
`failed_policy_correction_c4_disposition: FAILED REQUIRED INDEPENDENT ADJUDICATION / REMOTE BRANCH FROZEN / DRAFT PR #31 FROZEN / UNMERGED / NON-REUSABLE`
`failed_policy_correction_c5_head: 111f80a5a45ab637504cdd6c09581848b90e09f9`
`failed_policy_correction_c5_tree: 5727b34d002ecc8dc8e36fdef9ff575e3fd10c3d`
`failed_policy_correction_c5_parent: 31aca17b807c4dc8edef3683e30d5fefdd47ad7a`
`failed_policy_correction_c5_manifest_sha256: 2554a2ad4d3dc0764974a460553ebc357e543443102cb0f22bcbda58b1be0cd5`
`failed_policy_correction_c5_raw_sha256: e3eacd91beae3593dcb28d0b6d1eafda4dc151763237d3b746d0562bb4a4ab7d`
`failed_policy_correction_c5_policy_projection_sha256: 251ee05cca779cfc2682692bb2be4d27288f4faf1f6aa37e3948479d0ba84b63`
`failed_policy_correction_c5_synthetic_merge: 123411be88083fa295b1f67cc3e7fbe4bfacd7f3 — local fixture only`
`failed_policy_correction_c5_bundle_sha256: 507c2759ad61e504d8efda0e20600b3ccb0eef2ee73c0dac190d32ccbd3d2527`
`failed_policy_correction_c5_branch_reservation: ticket/0.30.1-rec-ratchet-02-policy-selftest-correction-r3 — CONSUMED / NEVER CREATED / MUST NOT CREATE`
`failed_policy_correction_c5_runtime: Node.js v22.16.0`
`failed_policy_correction_c5_exit: 1`
`failed_policy_correction_c5_terminal_receipt: Error: ART blob count 0`
`failed_policy_correction_c5_object_probes: 0 — helper aborted while parsing source-literal \t before absence evaluation`
`failed_policy_correction_c5_disposition: FAILED REQUIRED CLEAN-ROOM CHECK / LOCAL ONLY / UNPUSHED / NON-REUSABLE`
`fresh_rec_02_branch: ticket/0.30.1-rec-02-r2 — BLOCKED until a fresh correction successor passes, lands under separate authorization, and issue #24 is repinned; Stage A satisfies none of these conditions`
`active_simulation_baseline_sha256: 0633469f57971b9c00c877a33f9ccb818e53d5a8de8cc787e4ca2a25fdeda7f2 — unchanged in Gate A`
`functional_projection_state: EVIDENCE ONLY — exact inactive REC-02 baseline + verifier + seven source files; later STATUS is separate and full exact-head verification must rerun`
`rec_02_governed_scenes: cut_out; vent; past_leak; vault_voice; arc_future_1; act3_reckoning_heading; pregnancy_check; custody_possession; custody_thaw`
`art_r2_held_digest: 1441be78e8d0d95f4cf2cfd9ace72b7e6458aa0ec230336748de6a2b96db7baa — 55-image digest preserved by the mechanical compatibility projection`
`pr_26_state: OPEN / DRAFT / UNMERGED / FROZEN — head 7fe31675b678d041c980605ed5c5533d3ea22581; tree 52551891fe55324bc2fcd073bff56b9a8cd2c061`
`pr_27_state: SUPERSEDED FOR RECOVERY / OPEN / DRAFT / UNMERGED / FROZEN — head 34c2a732ccc231118964a006a8e006b60d765807; tree 9698810cd2c48b81e9d856b75d451c0869e99eaa`
`pr_28_state: OUTSIDE SCOPE / OPEN / DRAFT / UNMERGED — head 45937884147950f9bd497e0723701dfe25d37a9d; tree 36623fa9b09adb696ecf174d33183143269cb9da`
`pr_30_state: OPEN / DRAFT / UNMERGED / FROZEN — branch ticket/0.30.1-rec-ratchet-02-policy-selftest-correction-r1; head ec18d093a4d4fe7a79cb8996da0c780e182fe9a1; synthetic merge 721a94ca10cdde235e558514b29131bd5644ba98; failed run 32613327167; failed job 97129767639`
`pr_31_state: OPEN / DRAFT / UNMERGED / FROZEN — branch ticket/0.30.1-rec-ratchet-02-policy-selftest-correction-r2; head 6441d5f7ad5df5870dbddcabce6243c3d23d09ca; tree f0f12d10bc406c320a1c9324249ee4f2d17332e5; synthetic merge bfea3326bcb2b18431c7d10fcb1f59f89b4b8235; independent HOLD https://github.com/mbains89/Sunsplitter/pull/31#issuecomment-5384470876`
`audited_gameplay_runtime_provenance: e4f84409759760d31fcf47b8a227802a61421f51`

## Historical REC-01 evidence

`historical_rec_01_ticket: REC-01 / GitHub issue #13 — quiet_tomas rewind`
`historical_rec_01_state: SUPERSEDED EVIDENCE — closed and unmerged; do not continue or count as recovery evidence`
`historical_rec_01_branch: ticket/0.30.1-01-quiet-tomas-rewind`
`observed_isolated_head: 8e4fe42f376444049105e27ff7005a6220e88b9a`
`original_dispatch_base_sha: 93ccb43e141da544b999ba2c45f664a19428a5e3`

## Blocked

- REC-RATCHET-02 landed through protected PR #29 at exact successor `31aca17b807c4dc8edef3683e30d5fefdd47ad7a`; that Gate A authorization is consumed.
- The first REC-02 candidate `bd293bbe9fa9ed55eb0620bf85ef0a1316b2524e` failed the mandatory release-policy self-test because the landed policy reconstructed historical Gate A evidence from the current Stage 2 STATUS. Its gameplay verification PASS is diagnostic only. That head, tree, parent, manifest, and raw payload are local-only failed evidence and may not be pushed, retried, rebased, reused, or merged.
- The first locally sealed policy-correction candidate `b12ff37ef9153a509827d914b825dd51ec6de0ca` passed its technical gates but failed final governance review because its recorded next action required attributable CI while the same authority prohibited the branch push and draft PR needed to create that CI. That head, tree, parent, manifest, raw payload, and policy projection are local-only failed evidence and may not be pushed, retried, amended, rebased, reused, or merged.
- The second locally sealed policy-correction candidate `5c3b526d287d888bc3e0765569e6632ec5f6e0e6` passed its technical and governance gates but failed final design review because its mechanically derived REC-02 r2 STATUS simultaneously marked the projection activated and retained `fresh_rec_02_branch` as blocked. That head, tree, parent, manifest, raw payload, and policy projection are local-only failed evidence and may not be pushed, retried, amended, rebased, reused, or merged.
- The third policy-correction candidate `ec18d093a4d4fe7a79cb8996da0c780e182fe9a1` failed required CI on draft PR #30. GitHub's clean runner lacked the never-pushed C1/C2 objects, so the C1 negative fixture received a generic unreadable-commit error before its exact non-reuse disposition. A stricter candidate-only clean-clone audit also found an independent hidden dependency on frozen PR #26's ART objects; GitHub's broad checkout happened to supply that separate branch. The policy remained fail-closed and all verifier plus locked simulation jobs passed, but that success cannot override the mandatory release-policy failure. C3, its remote r1 branch, PR #30, and synthetic merge `721a94ca10cdde235e558514b29131bd5644ba98` are frozen, unmerged, and non-reusable; no push, synchronization, rerun, edit, retarget, ready transition, closure, or merge is authorized.
- The fourth policy-correction candidate `6441d5f7ad5df5870dbddcabce6243c3d23d09ca` and draft PR #31 passed attributable CI but failed required independent adjudication. C4 recognized each pinned failed OID before returning its eventual exact non-reuse error, yet still invoked `rev-parse --verify` and `cat-file -t` on that rejected identity. Green checks cannot override that fail-closed contract breach. C4, its remote r2 branch, PR #31, and synthetic merge `bfea3326bcb2b18431c7d10fcb1f59f89b4b8235` are permanently frozen, unmerged, and non-reusable.
- The fifth policy-correction candidate `111f80a5a45ab637504cdd6c09581848b90e09f9` passed its first policy self-test, including 90 zero-Git rejected-head route checks, but then failed the required clean-room absence check. The external helper exited `1` under Node.js `v22.16.0` with exact receipt `Error: ART blob count 0` because it treated the source-literal `\t` separator as an actual tab and aborted before any object probe. The failure proves neither policy acceptance nor a policy defect, but the fail-closed contract does not distinguish harness failures. C5 was not rerun; its head, tree, manifest, raw payload, projection, bundle, and never-created r3 reservation are permanently frozen and non-reusable. C6 must preserve C5's deterministic non-reuse receipt through both candidate routes with zero Git invocations.
- Fresh REC-02 construction is blocked. A fresh correction successor must first pass, then land under separate authorization; issue #24 must then be repinned to that exact protected successor and all REC-02 STATUS, parent, tree, manifest, raw-payload, and OID identities must be freshly derived on `ticket/0.30.1-rec-02-r2`. Stage A does not authorize or satisfy any of those steps.
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
- REC-RATCHET-02 landed through protected PR #29 at `31aca17b807c4dc8edef3683e30d5fefdd47ad7a`, tree `f458b021bc9a9a36cb28c24fd7dee165c2bbaac5`, with ordered parents `[23951012655b0037a55e82c755b66dd4d852f20b, f23c4bed1555c7ad6bcb3b42ca5c6ea3a92e37ab]`
- REC-02 r1 at `bd293bbe9fa9ed55eb0620bf85ef0a1316b2524e` is preserved as local failed required-gate evidence only; no remote branch or pull request was created
- Policy-correction C1 at `b12ff37ef9153a509827d914b825dd51ec6de0ca` is preserved as local failed required-review evidence only; no remote branch or pull request was created
- Policy-correction C2 at `5c3b526d287d888bc3e0765569e6632ec5f6e0e6` is preserved as local failed required-review evidence only; no remote branch or pull request was created
- Policy-correction C3 at `ec18d093a4d4fe7a79cb8996da0c780e182fe9a1` is preserved as failed required-CI evidence on frozen remote branch `ticket/0.30.1-rec-ratchet-02-policy-selftest-correction-r1` and frozen draft PR #30; it remains unmerged and non-reusable
- Policy-correction C4 at `6441d5f7ad5df5870dbddcabce6243c3d23d09ca` is preserved as failed required-independent-adjudication evidence on frozen remote branch `ticket/0.30.1-rec-ratchet-02-policy-selftest-correction-r2` and frozen draft PR #31; green CI did not cure its pre-dereference lookup defect, and it remains unmerged and non-reusable
- Policy-correction C5 at `111f80a5a45ab637504cdd6c09581848b90e09f9` is preserved as local failed required-clean-room-check evidence only; no branch or pull request was created, its r3 reservation is consumed and retired, no required check was rerun, and it remains non-reusable

## Next action

**Manraj:** after receiving the sealed C6 Stage A receipt, separately decide whether to authorize only the reserved `ticket/0.30.1-rec-ratchet-02-policy-selftest-correction-r4` branch push and one new draft pull request against `recovery/e4f8440-nopub`. The direct C6 authorization grants no external action. PRs #30 and #31 remain frozen. This grants no ready transition, merge, REC-02 construction, deployment, release, publication, or certification authority. `NO-PUBLISH / NOT CERTIFIED` remains active.

<!-- STATUS_COMPLETE -->
