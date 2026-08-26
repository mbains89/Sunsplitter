# Sunsplitter — Current Status

`schema_version: 1`
`updated_utc: 2026-08-25`
`authority_migration_base: 3789062f1d0703f63feb8ada66503bb773879550`
`authority_source_main_sha: 792e202297111d59050e2ea00da0b959c9d1ca75`

This is the compact rolling handoff. Process: `/AGENTS.md`. Future scope: `ROADMAP.md`. Dispositions: `LOCKS.md`. The detailed correction and terminal-receipt ledger is `REC-RATCHET-02_POLICY_SELFTEST_CORRECTION.md`.

## Release / recovery state

`runtime_baseline_sha: e4f84409759760d31fcf47b8a227802a61421f51`
`release_label: NO-PUBLISH recovery base (candidate labels such as 0.30 do not certify)`
`release_state: NO-PUBLISH`
`last_certified_baseline_label: 0.28.1d`
`last_certified_baseline_sha_associated: 2bb4517707df90702a9b78fe0fa8fb55c1852dd8`
`production_url: NOT_AUTHORIZED`
`release_artifact: none authorized from this base`
`artifact_digest: none — no release created`
`version_integrity: NOT_CERTIFIED — governed recovery remains incomplete`

**HARD STOP:** No deployment, publication, tag, GitHub Release, certification, production activation, or claim that a candidate version shipped is authorized.

## Exact landed recovery chain

`pipe_boot_r1_merge_sha: 0b600935aa6e21d4898bcc9c7ad09e78893ec6e7`
`rec_ratchet_01_merge_sha: 5e93b68a7412bcbed041e7c74a985ae30682a1d2`
`rec_01_merge_sha: 9bb4ccf7efbf856ffed569436787f779ad195698`
`lock_record_r1_merge_sha: 8a840397d80b8fe1027a22ca89603d92f0e562e6`
`art_r2_governance_merge_sha: 23951012655b0037a55e82c755b66dd4d852f20b`
`rec_ratchet_02_gate_a_head_sha: f23c4bed1555c7ad6bcb3b42ca5c6ea3a92e37ab`
`rec_ratchet_02_gate_a_head_tree: f458b021bc9a9a36cb28c24fd7dee165c2bbaac5`
`rec_ratchet_02_gate_a_merge_sha: 31aca17b807c4dc8edef3683e30d5fefdd47ad7a`
`rec_ratchet_02_control_state: GATE A CLOSED at P; C9 CLOSED/CONSUMED at Q; C10/r8 CLOSED/CONSUMED at S; C11/r9, C12/r10, and C13/r11 TERMINAL/NON-REUSABLE; C14/r12 CLOSED/LANDED/CONSUMED at X; REC-02 r2 / PR #39 TERMINAL/NON-REUSABLE; r13 CLOSED/LANDED/CONSUMED at exact protected successor 6339da827220908c6c5b352853932776c6c90133; NO-PUBLISH / NOT CERTIFIED remains active`
`governed_recovery_successor_sha: 6339da827220908c6c5b352853932776c6c90133`
`tested_runtime_sha: 6339da827220908c6c5b352853932776c6c90133 — exact protected r13 policy successor; recovery evidence, not certification`
`verify_mjs: present on tree`
`simulate_mjs: present on tree`
`recovery_required_checks: ACTIVE — ruleset 21051662 requires release-policy, verify, and simulation-gate with the branch up to date`
`recovery_ruleset_or_branch_protection: ACTIVE AT 2026-08-22 GATE-A READBACK — owner-authenticated raw ruleset 21051662 explicitly returned bypass_actors=[]; targets main and recovery/e4f8440-nopub; pull request required; deletion and force-push blocked; refresh is mandatory before any separately authorized merge`
`tag_creation_protection: ACTIVE AT 2026-08-22 GATE-A READBACK — owner-authenticated raw ruleset 21051665 explicitly returned bypass_actors=[]; targets all tags; creation, deletion, and force-push blocked; refresh is mandatory before any separately authorized merge`
`netlify_build_state: STOPPED — project sunsplitter / site 6af8d4bc-df5f-4e41-8042-57a10108a2a9`
`netlify_published_deploy_lock: ACTIVE — deploy 6a85163bab20340008f53e95 at e4f84409759760d31fcf47b8a227802a61421f51`
`netlify_build_hooks: NONE`
`netlify_production_deployment_methods: GIT-ONLY — CLI, MCP, and API production deploys blocked`

## Active work

`milestone: REC-02-R3 — exact active projection from protected r13 successor`
`ticket: REC-02 / issue #24 — governed zero-exit implementation r3`
`owner: Build / GPT-Codex; independent verification is separate; every protected merge requires a fresh exact owner authorization`
`state: REC-02 R3 CANDIDATE — exact protected r13 successor 6339da827220908c6c5b352853932776c6c90133; NO-PUBLISH / NOT CERTIFIED`
`governed_branch: recovery/e4f8440-nopub`
`implementation_branch: ticket/0.30.1-rec-02-r3`
`dispatch_base_sha: 6339da827220908c6c5b352853932776c6c90133`
`dispatch_base_tree: bcd30eb046905463f708a7c82cd0929ba0cb01cf`
`gate_a_scope: LANDED PRECURSOR — exact six-path Gate A envelope retained as immutable evidence`
`policy_correction_scope: exactly artifacts/PROJECT_STATUS.md; artifacts/REC-RATCHET-02_POLICY_SELFTEST_CORRECTION.md; artifacts/REC-RATCHET-02_AUTHORIZED_REC-02.patch.json; scripts/release-policy.mjs`
`policy_correction_record: artifacts/REC-RATCHET-02_POLICY_SELFTEST_CORRECTION.md`
`c9_candidate_identity: LANDED PRECURSOR — protected successor 31642c3644a58e9f5fc007bff648dc6146dabcfb; correction head f6b8e050717a6b9420bd3ec2dae0d65abcc57427; tree 103a4ccf5c1511d225d67870e6fb87e64b992de4; ordered parents [31aca17b807c4dc8edef3683e30d5fefdd47ad7a,f6b8e050717a6b9420bd3ec2dae0d65abcc57427]`
`c9_immutable_receipt: sole parent 31aca17b807c4dc8edef3683e30d5fefdd47ad7a; raw payload 825 bytes / SHA-256 1dea7f018883c68ef1368950ad7ac1ec7ac787ebbe8c53a86d71e5930ca8390b; three-path manifest SHA-256 ae2e4309600269afc3ef9a81ce9eec0e9b0c02e7caed6feebbf76769f98a98fd; active projection 6e44343fc7f892494c4477991b2a11e0f150215ae2a9bf955508a225a3014f27`
`c9_pr_closure_receipt: PR #35 merged 2026-08-24T01:13:24Z; synthetic merge a3fa43fe01910ddbc6d4b6ce6f5d84be1e9e5e57; Recovery Release Policy #52 run 32676047856 SUCCESS; Recovery Verify #62 run 32676047846 SUCCESS`
`c9_protected_push_receipt: Q raw payload 1,262 bytes / SHA-256 41b8269ef543b5177430ac5e9bd1aeba07f1a4b0f40bd83d96435326e67a9322; Recovery Release Policy #54 run 32679102742 / job 97292489797 SUCCESS; Recovery Verify #64 run 32679102689 SUCCESS — priciest 97292489624, verify 97292489681, random 97292489692, cheapest 97292489761, simulation-gate 97292916932; seed 20260817 / 6,000 total simulations`
`issue_24_q_repin_receipt: COMPLETE 2026-08-24T01:43:09Z — title 80 bytes / SHA-256 3b0d8db069be8f45eb44d6a1ad0bf1e443d82f66bfab50fa3bf12752a2afad1c; body 21,564 bytes / SHA-256 ab26a5dec4c630d9a390276b1721ad5129aa41bc68f1c2eb681974e6c7314788; exact post-write equality PASS; zero comments`
`c9_receipt_capture_preflight: COMPLETE / CONSUMED — exact C9 first-result receipts were durably stored before hashing or formatting`
`c9_external_launcher_preflight: COMPLETE / CONSUMED — exact C9 clone-local launcher and negative controls passed before identity freeze`
`c9_expected_forbidden_object_inventory: SHA-256 d6361bf849be1e2721c1871d84c1f8f569348edc401e08650ca6550bcc5d62d8; 4664 bytes; 103 unique OIDs — 18 failed head/tree objects + 2 ART roots + 79 sealed ART blobs + 4 derived objects`
`c9_expected_zero_git_rejected_head_checks: 162 — nine failed identities × three normalized spellings × six correction/future direct/full/CLI routes`
`c9_expected_policy_fixture_counts: 86 historical raw-frame; 101 structured adversarial`
`c9_policy_fixture_delta: 101 = C8 diagnostic 98 + one r6 frozen-branch rejection + one C8-tree correction-route framing-only rejection + one C8-tree future-route framing-only rejection; receipt loss, same-identity replay, unavailable-wrapper survival, and accidental frozen audit execution are separate external-runner controls and are not counted in the 101 policy fixtures`
`c9_policy_prefreeze_validation: PASS — pinned Node.js v22.16.0 syntax; policy self-test exit 0 with 162 zero-Git rejected-head checks, 86 historical raw-frame fixtures, and 101 structured adversarial fixtures; all nine recorded failed identities have sole parent 31aca17b807c4dc8edef3683e30d5fefdd47ad7a; evaluated inventory constants equal the prose tables; clean UTF-8 required across both documents, policy, runner, and test before identity freeze`
`c10_candidate_identity: UNFROZEN — no prospective head, tree, manifest, raw payload, active policy projection, bundle, PR, synthetic merge, or CI identity is embedded here`
`c10_fixture_source_contract: IMMUTABLE — historical C9 resolves only through exact Q/C9 objects; C10 STATUS derives mechanically from exact Q and never from mutable worktree STATUS; current record and policy must match exact stabilized identities`
`c10_expected_policy_fixture_counts: 162 zero-Git rejected-head checks; 86 historical raw-frame fixtures; 104 structured adversarial fixtures`
`c10_policy_fixture_delta: 104 = C9 101 + three-path worktree-poison exclusion + wrong immutable C9/Q source rejection + consumed r7/C9 branch rejection; the Q-direct REC-02 fixture replaces the earlier P-direct fixture and adds no count`
`c10_candidate_store_controls: 9 unique required controls — six historical Gate A controls + C9 head commit + Q commit + shared C9/Q tree; 103 forbidden objects remain absent`
`c10_receipt_capture_preflight: PASS / COMPLETE PRE-IDENTITY — runner /private/tmp/sunsplitter-c10-runner/c10-receipt-runner.mjs; SHA-256 56120267169dbb18fade58d87097608dd1ab1768e4bc72369b1768e083bef7b0; 52,696 bytes; disposable test /private/tmp/sunsplitter-c10-runner/c10-receipt-runner.test.mjs; SHA-256 92135b9e2ecc96f8c067bf427fc2a79e606fd92bfe492dc7878d88a9d341c320; 52,728 bytes; mode 0644; pinned Node.js v22.16.0 syntax and full disposable preflight PASS`
`c10_external_launcher_preflight: PASS / INDEPENDENT AUDIT — exact 13-gate C→S→T→C sequence; Q→C→S→R→T topology; durable raw/status capture; replay and receipt-loss terminality; malformed C/S/R/T and active-collision rejection; role-aware frozen/consumed/prior-r2 pre-spawn denial; physical protected-root and symlink-alias fence; existing canonical out-of-sandbox builder rejection; production C10 session absent; consumed C9 recursive digest a84901d7075ccf85286c63f6aa20fe50a63953a9db445b6ef64f79abfdff1080 unchanged`
`c10_landed_identity: CLOSED / CONSUMED — C10 head 800ccc876d6d784a6851ca8ff74dbff7467bd1ff; protected S 5995e344dbdbc18ce83186359ba9838fcf69c37e; tree ea2c992bbb083eecf32404b21a11afc436a5f3c3`
`c11_terminal_identity: TERMINAL / NON-REUSABLE — head 8a6dcc0fd99e7ace4cd3cea2e6d2030179f681e5; tree 78021c8d4a766bb4928226494dcbaab9c978e32c; A02 failed; no later gate, push, or PR`
`c12_terminal_identity: TERMINAL / NON-REUSABLE — head 9612d4bbbcdbf91344b0852ee512a93c7ea5d1ae; tree 95438204b89cfcf9bc53d899dd40fc34836ce332; 13/13 local PASS; sole push failed before remote contact; no PR`
`c13_terminal_identity: TERMINAL / NON-REUSABLE — head 1dc0f80519db4b42add7010c5b3a6749b059019c; tree f11bd7bf46099f9579af3fb031361f3b4105405f; W abcf29245e387a744a7b3810b956fa7164ac7f39; R aedb8526ab0de685a037fc22c341e8f0b6f041d3; R tree 10bc158a1c8f66cfea0f1937149d20f7a32dfa54; T d5628b1f4e9c5e642c5922070e4e6e10bcbd8b5e; 13/13 local PASS; branch push and draft PR #37 PASS; attempt-1 Release Policy failed; Recovery Verify passed`
`c13_terminal_diagnosis: exact four-variable Git boundary was not declared on the policy run steps; the process rejected the missing-or-non-exact boundary before repository Git; no C13 rerun or repair is authorized`
`c14_candidate_identity: LANDED / CONSUMED — head a42fcf9da045e34f456652dfa13e5a890cd216f4; tree 35388f974a6175a9a8b791879989f3a33a69c1fe; sole parent 5995e344dbdbc18ce83186359ba9838fcf69c37e; protected X d78c453004100894fc523866b8010b40987752f6; ordered parents [5995e344dbdbc18ce83186359ba9838fcf69c37e,a42fcf9da045e34f456652dfa13e5a890cd216f4]`
`c14_landed_receipt: PR #38 merged 2026-08-25; head raw payload 302 bytes / SHA-256 b87ef55e4cfff85892ff78c4d6ed58591454f46579d536e7eb4fbc16375d4b4f; five-path manifest 766 bytes / SHA-256 86e88012deca29100b43dea8b8fc57f6e4f05aaa1d1ac6009ff329aadc809982; X raw payload 1,262 bytes / SHA-256 636c443f63215d29bc9dd09ebfccc8c6b3cbe4987125e8e54c1270d8c67ce1c1`
`c14_commit_contract: sole parent 5995e344dbdbc18ce83186359ba9838fcf69c37e; subject-only message REC-RATCHET-02: bind trusted GitHub Actions Git environment; author and committer Sunsplitter Recovery Build <noreply@openai.com> 1788656400 -0500`
`c14_actions_git_environment_contract: exactly GIT_CONFIG_GLOBAL=/dev/null; GIT_CONFIG_NOSYSTEM=1; GIT_OPTIONAL_LOCKS=0; GIT_TERMINAL_PROMPT=0 on exactly two post-checkout policy run steps; optional ambient GIT_PAGER=cat only; every other ambient GIT_* rejected before Git`
`c14_actions_fixture_contract: first policy run step invokes --github-actions-git-environment-fixture before --self-test; second preserves every POLICY_* mapping; checkout/setup receive no ticket Git environment at workflow or job scope`
`c14_active_patch_identity: 37,735 bytes; SHA-256 9c1158ef758f41c52d749e22c53b736c0aa7fc782765921e5dbb606f84b64551; independently reconstructed from exact S authorized source`
`c14_workflow_identity: 2,402 bytes; blob 830c93e93aac72d555b163931f141839cf452422; SHA-256 2107c374e43e42fb808908d770439fe15803f9ee1dd55c162a41779d764ef7e1`
`c14_policy_projection: b36b21a9be35969ca6b1f06a8b0ff2745b2329cfd444d5b589cd8abc9961772c — normalized only across the seven explicitly self-referential C14/status/record/inventory fields plus preserved historical projection fields`
`c14_forbidden_inventory_contract: candidate route 5,693 bytes / SHA-256 1c76ef4f8ddb6c79b818ac140836d6494620934c620d97e27c2c3374d815cd02 / 125 unique objects; future route 5,653 bytes / SHA-256 96fba426ad3f5a72a4689ae0ab70d76573c9114eaea9544a4f23b796016d295f / 124 unique objects; each records consumedC11Objects=6, consumedC12Objects=6, consumedC13Objects=6`
`c14_environment_fixture_contract: 2 positive cases; 41 negative cases; all 41 rejected before Git; zero sentinel Git calls; bounded canonical receipt only`
`c14_expected_policy_fixture_counts: carried historical suite 162 zero-Git rejected-head checks, 86 historical raw-frame fixtures, and 104 structured adversarial fixtures; active C14 layer 36 zero-Git terminal-route rejections and 54 structured adversarial rejections; focused environment layer 2 positives and 41 zero-Git negatives`
`c14_external_component_manifest: /private/tmp/sunsplitter-c14-r12-runner/COMPONENT-MANIFEST.v1.json; 1,125 canonical bytes; SHA-256 2266eb2f8e1d2fb00f0df1fbc611b50aaddfd77b662c6e7f6da54d3b2cbce8cd; six fresh mode-0644 C14-only components; no production session exists pre-freeze`
`c14_candidate_store_controls: 12 unique protected controls — recovery base; Gate A base/tree/head/merge/tree; C9 head/Q/tree; C10 head/S/tree; all forbidden objects absent`
`r2_prefreeze_hold: PRESERVED / UNFROZEN — tree 0970dc606b63a84dd38ab46541b2a359ef95674f; STATUS blob 742ae69f94bdac92cd4ccce8267508ef0693c62a / SHA-256 9cb1f4b42f9e8393f96f176fd0252682616afca09f8adfa9f9044a7575122aa6 / 18,008 bytes; static fail-closed determination before invocation: the mandatory policy self-test was not invoked, and its expected error was artifacts/PROJECT_STATUS.md: policy correction identity drifted`
`r2_prefreeze_identity_receipt: manifest 1,351 bytes / SHA-256 469f6f5683acdeb8d34a81112c71d2409344032504335bef6e956dd6149680de; raw frame 1,712 bytes / SHA-256 15f8128f63145990f0323622744f54b0c23f994b4bfb2e4aead667351c133bd9; predicted OID f5ab37d4845156d7b80678e4492d5fdece1c4458 absent; local branch remained Q; remote branch absent; no PR`
`r2_prefreeze_diagnostic_receipt: two diagnostic verifier/simulation repetitions passed with stdout SHA-256 f2e67e934b18e9dbc6464d9b7d502404b7c7e34b02307bb8056e3e8e94bfc69d and normalized core c1969e553a03fd80c9ce220a511e3ed6393c9c7b72ef0ca3ab4edb4dcfc78c08; no candidate PASS was claimed and no identity was frozen, committed, pushed, or opened as a PR`
`rec_02_r2_terminal_identity: TERMINAL / NON-REUSABLE — branch ticket/0.30.1-rec-02-r2; head caf42d891cd3e19b9977ffdc40cfa30c992e5042; tree c012e16cc411656036df1adb13fc32a4d6c8a072; sole parent d78c453004100894fc523866b8010b40987752f6; synthetic merge 4d1d56b6b2d32bcfd54c524d3e01c040e4267e33; draft PR #39 remains open/unmerged/frozen`
`rec_02_r2_attempt_1_receipt: Recovery Release Policy run 32889720839 / job 97938526648 FAILURE — artifacts/PROJECT_STATUS.md: C14 exact identity drifted; Recovery Verify run 32889720781 SUCCESS; no rerun, amend, ready transition, or merge is authorized`
`r13_candidate_identity: LANDED PRECURSOR — protected successor 6339da827220908c6c5b352853932776c6c90133; correction head 2219c8c3bbce14a91383413bbfeceab6aa74b5ca; tree bcd30eb046905463f708a7c82cd0929ba0cb01cf; ordered parents [d78c453004100894fc523866b8010b40987752f6,2219c8c3bbce14a91383413bbfeceab6aa74b5ca]`
`r13_commit_contract: sole parent d78c453004100894fc523866b8010b40987752f6; subject-only message REC-RATCHET-02: bind immutable landed-C14 fixtures; author and committer Sunsplitter Recovery Build <noreply@openai.com> 1788742800 -0500`
`r13_fixture_source_contract: historical C14 bytes resolve only from literal exact X d78c453004100894fc523866b8010b40987752f6 and exact head a42fcf9da045e34f456652dfa13e5a890cd216f4; future r3 self-test accepts only an exact direct or two-parent r3 route, requires its worktree/index envelope to equal the checkout, and resolves historical r13 bytes from the exact protected successor rather than transitioned STATUS`
`r13_patch_identity: 37,735 bytes; blob 5d7315495fa220fed362bf7d580c69c1141385c0; SHA-256 74bd104be7fbb46dc15a4242f03b8402e7267bad19c3de430f4e10aa403027b7; semantic delta from X is only authority.targetBranch r2 to r3`
`r13_policy_projection: 0b8a602116b010b96d8299bcf689900aa116e8a96e40a54e1e2a259dd6188957 — mechanically frozen after final four-path bytes stabilize`
`r13_forbidden_inventory_contract: candidate route 128 unique objects / SHA-256 d5782849d72e70ed9ce8b47eab5739764590d4da63e2fec8fc7e9e302654403a; future r3 route 127 unique objects / SHA-256 c0857eccc3b84d44dca02e39a5650bc542c3144b2ac68709766ad74e89d902bc; historical C14 125/124 inventories remain unchanged`
`r13_expected_policy_fixture_counts: historical 162 zero-Git rejected-head checks, 86 historical raw-frame fixtures, and 104 structured adversarial fixtures preserved; active terminal-route set 41 zero-Git rejections plus 12 uppercase/padded r2 spelling rejections; focused environment layer 2 positives and 41 zero-Git negatives; one exact PR #39 mutable-source regression and staged/direct/successor r3 non-poisoning replays`
`r13_candidate_store_controls: 15 unique protected controls — prior 12 plus exact C14 head, X, and their shared tree; all 128 active candidate-forbidden objects absent`
`fresh_rec_02_branch: ticket/0.30.1-rec-02-r3 — CONSTRUCTED FROM exact protected r13 successor 6339da827220908c6c5b352853932776c6c90133`
`issue_24_repin_requirement: REQUIRED EXTERNAL PRECONDITION / NOT VERIFIED BY REPOSITORY POLICY — owner-authenticated readback must show issue #24 freshly repinned to exact 6339da827220908c6c5b352853932776c6c90133; external receipt must accompany candidate`
`active_simulation_baseline_sha256: 048ee211f4708252b8609d475b47d3b6c05e85bd1d8bd1ae9c44f9229b659c20 — exact REC-02 baseline activated from the landed Gate A artifact`
`functional_projection_state: ACTIVATED — exact pinned patch and baseline applied; full exact-head verifier and locked simulations must pass again`
`rec_02_governed_scenes: cut_out; vent; past_leak; vault_voice; arc_future_1; act3_reckoning_heading; pregnancy_check; custody_possession; custody_thaw`
`art_r2_held_digest: 1441be78e8d0d95f4cf2cfd9ace72b7e6458aa0ec230336748de6a2b96db7baa — sealed 55-image compatibility evidence`

## Frozen failed-identity register

Every entry below is terminal, unmerged, and non-reusable. Exact receipts and immutable file/CI identities are preserved in the correction record.

`failed_rec_02_r1_head: bd293bbe9fa9ed55eb0620bf85ef0a1316b2524e`
`failed_rec_02_r1_tree: 34fa0adbfb027e01448a1a0771c8ff5af3997e26`
`failed_rec_02_r1_disposition: FAILED REQUIRED GATE / LOCAL ONLY / UNPUSHED / NON-REUSABLE`

`failed_rec_02_r2_head: caf42d891cd3e19b9977ffdc40cfa30c992e5042`
`failed_rec_02_r2_tree: c012e16cc411656036df1adb13fc32a4d6c8a072`
`failed_rec_02_r2_parent: d78c453004100894fc523866b8010b40987752f6`
`failed_rec_02_r2_branch: ticket/0.30.1-rec-02-r2 — FROZEN`
`failed_rec_02_r2_pr: #39 — OPEN / DRAFT / UNMERGED / FROZEN`
`failed_rec_02_r2_synthetic_merge: 4d1d56b6b2d32bcfd54c524d3e01c040e4267e33`
`failed_rec_02_r2_disposition: FAILED REQUIRED CI / REMOTE BRANCH FROZEN / DRAFT PR #39 FROZEN / UNMERGED / NON-REUSABLE`

`failed_policy_correction_c1_head: b12ff37ef9153a509827d914b825dd51ec6de0ca`
`failed_policy_correction_c1_tree: 14dcaa3fb6a92349b6bebf06a606d356456859e8`
`failed_policy_correction_c1_disposition: FAILED REQUIRED REVIEW / LOCAL ONLY / UNPUSHED / NON-REUSABLE`

`failed_policy_correction_c2_head: 5c3b526d287d888bc3e0765569e6632ec5f6e0e6`
`failed_policy_correction_c2_tree: dc1e677d66c35873ac040c598e33b39c05c78e54`
`failed_policy_correction_c2_disposition: FAILED REQUIRED REVIEW / LOCAL ONLY / UNPUSHED / NON-REUSABLE`

`failed_policy_correction_c3_head: ec18d093a4d4fe7a79cb8996da0c780e182fe9a1`
`failed_policy_correction_c3_tree: a1c00d7ab971efd81d4544577150fa54e618f89d`
`failed_policy_correction_c3_disposition: FAILED REQUIRED CI / REMOTE BRANCH FROZEN / DRAFT PR #30 FROZEN / UNMERGED / NON-REUSABLE`

`failed_policy_correction_c4_head: 6441d5f7ad5df5870dbddcabce6243c3d23d09ca`
`failed_policy_correction_c4_tree: f0f12d10bc406c320a1c9324249ee4f2d17332e5`
`failed_policy_correction_c4_disposition: FAILED REQUIRED INDEPENDENT ADJUDICATION / REMOTE BRANCH FROZEN / DRAFT PR #31 FROZEN / UNMERGED / NON-REUSABLE`

`failed_policy_correction_c5_head: 111f80a5a45ab637504cdd6c09581848b90e09f9`
`failed_policy_correction_c5_tree: 5727b34d002ecc8dc8e36fdef9ff575e3fd10c3d`
`failed_policy_correction_c5_branch_reservation: ticket/0.30.1-rec-ratchet-02-policy-selftest-correction-r3 — CONSUMED / NEVER CREATED / MUST NOT CREATE`
`failed_policy_correction_c5_terminal_receipt: Error: ART blob count 0`
`failed_policy_correction_c5_disposition: FAILED REQUIRED CLEAN-ROOM CHECK / LOCAL ONLY / UNPUSHED / NON-REUSABLE`

`failed_policy_correction_c6_head: fb16fe160a416fc4a638c2ea7dcae83361c88764`
`failed_policy_correction_c6_tree: 7dec1712c000578da6c1ec92b0e7ac8ff8f081bb`
`failed_policy_correction_c6_terminal_receipt: Error: sealed manifest source not found`
`failed_policy_correction_c6_disposition: FAILED REQUIRED INDEPENDENT CLEAN-ROOM VERIFICATION / REMOTE BRANCH FROZEN / DRAFT PR #33 FROZEN / UNMERGED / NON-REUSABLE`

`failed_policy_correction_c7_head: 37bba2712193a1ce9e7108b8ff9826230c69e680`
`failed_policy_correction_c7_tree: 9332457ef5c6ebeb44eb0aa9d8c0673e10470de2`
`failed_policy_correction_c7_branch_reservation: ticket/0.30.1-rec-ratchet-02-policy-selftest-correction-r5 — CONSUMED / LOCAL ONLY / NEVER PUSHED / NO PR / MUST NOT PUSH`
`failed_policy_correction_c7_terminal_receipt: FAIL release-policy crash: Error: candidate-only checkout .git entry is not a direct directory`
`failed_policy_correction_c7_disposition: FAILED REQUIRED CLEAN-CLONE A CANDIDATE-STORE CHECK / LOCAL ONLY / UNPUSHED / NO PR / PERMANENTLY FROZEN / NON-REUSABLE`

`failed_policy_correction_c8_head: c469a1a4220686f62b3934289b0add56bbdcfc5d`
`failed_policy_correction_c8_tree: 973abf4822ed040a4c98ab746efe1f8da875fb16`
`failed_policy_correction_c8_parent: 31aca17b807c4dc8edef3683e30d5fefdd47ad7a`
`failed_policy_correction_c8_branch: ticket/0.30.1-rec-ratchet-02-policy-selftest-correction-r6 — FROZEN`
`failed_policy_correction_c8_pr: #34 — OPEN / DRAFT / UNMERGED / FROZEN`
`failed_policy_correction_c8_synthetic_merge: de667c81df776fc661ea32bb458c516d1eeae641`
`failed_policy_correction_c8_primary_terminal_receipt: ReferenceError: TextEncoder is not defined at exec_main.mjs:5:13 — first required result lost before exit/stdout storage; primary lane did not rerun`
`failed_policy_correction_c8_secondary_terminal_receipt: ReferenceError: TextEncoder is not defined at exec_main.mjs:7:13 — first required result lost before exit/stdout storage; that lane then improperly invoked the same required inventory again`
`failed_policy_correction_c8_later_diagnostic_inventory: 4578 bytes; 101 OIDs; SHA-256 9d94fbedabcc29951800d84a47d65d0bd209b30640e2805687f8e956ff2ea9a5; sealed ART manifest 10863 bytes; SHA-256 a3bb3dc47bf7302de03d8b057637ecdbcd852b1e2e7d2034b098a3e55358a073 — diagnostic / non-curative`
`failed_policy_correction_c8_later_diagnostic_store_receipt: {"absent":101,"controlsPresent":6,"head":"c469a1a4220686f62b3934289b0add56bbdcfc5d","inventorySha256":"9d94fbedabcc29951800d84a47d65d0bd209b30640e2805687f8e956ff2ea9a5","result":"PASS","schemaVersion":1} — diagnostic / non-curative`
`failed_policy_correction_c8_later_diagnostic_selftest: PASS — 144 zero-Git rejected-head checks; 86 historical raw-frame fixtures; 98 structured adversarial fixtures — diagnostic / non-curative`
`failed_policy_correction_c8_later_accidental_invocation: a C9 read-only harness audit mistakenly invoked frozen C8 --forbidden-object-inventory once; no file, ref, branch, PR, workflow, or remote state changed; output discarded; prohibited same-identity invocation / non-curative / no further C8 mode may run`
`failed_policy_correction_c8_disposition: FAILED REQUIRED INDEPENDENT RECEIPT CAPTURE / REMOTE BRANCH FROZEN / DRAFT PR #34 FROZEN / UNMERGED / PERMANENTLY FROZEN / NON-REUSABLE`

## Frozen remote and external state

`pr_26_state: OPEN / DRAFT / UNMERGED / FROZEN — head 7fe31675b678d041c980605ed5c5533d3ea22581; tree 52551891fe55324bc2fcd073bff56b9a8cd2c061`
`pr_27_state: SUPERSEDED FOR RECOVERY / OPEN / DRAFT / UNMERGED / FROZEN — head 34c2a732ccc231118964a006a8e006b60d765807; tree 9698810cd2c48b81e9d856b75d451c0869e99eaa`
`pr_28_state: OUTSIDE SCOPE / OPEN / DRAFT / UNMERGED — head 45937884147950f9bd497e0723701dfe25d37a9d; tree 36623fa9b09adb696ecf174d33183143269cb9da`
`pr_30_state: OPEN / DRAFT / UNMERGED / FROZEN — branch ticket/0.30.1-rec-ratchet-02-policy-selftest-correction-r1; head ec18d093a4d4fe7a79cb8996da0c780e182fe9a1; tree a1c00d7ab971efd81d4544577150fa54e618f89d; synthetic merge 721a94ca10cdde235e558514b29131bd5644ba98; Recovery Release Policy #48 run 32613327167 FAILURE / release-policy job 97129767639; Recovery Verify #58 run 32613327212 SUCCESS / random 97129767728 / priciest 97129767832 / verify 97129767835 / cheapest 97129767840 / simulation-gate 97130082900`
`pr_31_state: OPEN / DRAFT / UNMERGED / FROZEN — branch ticket/0.30.1-rec-ratchet-02-policy-selftest-correction-r2; head 6441d5f7ad5df5870dbddcabce6243c3d23d09ca; tree f0f12d10bc406c320a1c9324249ee4f2d17332e5; synthetic merge bfea3326bcb2b18431c7d10fcb1f59f89b4b8235; Recovery Release Policy #49 run 32615874248 SUCCESS / release-policy job 97136388344; Recovery Verify #59 run 32615874238 SUCCESS / random 97136388297 / cheapest 97136388349 / verify 97136388352 / priciest 97136388419 / simulation-gate 97136711468; owner-approved HOLD https://github.com/mbains89/Sunsplitter/pull/31#issuecomment-5384470876`
`pr_33_state: OPEN / DRAFT / UNMERGED / FROZEN — branch ticket/0.30.1-rec-ratchet-02-policy-selftest-correction-r4; head fb16fe160a416fc4a638c2ea7dcae83361c88764; tree 7dec1712c000578da6c1ec92b0e7ac8ff8f081bb; synthetic merge 87093fc887275f3473a88a8ff549fa93c74f34b5; Recovery Release Policy #50 run 32649075334 SUCCESS / release-policy job 97217749298; Recovery Verify #60 run 32649075335 SUCCESS / verify 97217749348 / priciest 97217749404 / random 97217749438 / cheapest 97217749484 / simulation-gate 97218162899; formal independent HOLD after Error: sealed manifest source not found`
`pr_34_state: OPEN / DRAFT / UNMERGED / FROZEN — head c469a1a4220686f62b3934289b0add56bbdcfc5d; tree 973abf4822ed040a4c98ab746efe1f8da875fb16; synthetic merge de667c81df776fc661ea32bb458c516d1eeae641`
`pr_38_state: MERGED / CLOSED / CONSUMED — head a42fcf9da045e34f456652dfa13e5a890cd216f4; tree 35388f974a6175a9a8b791879989f3a33a69c1fe; protected successor d78c453004100894fc523866b8010b40987752f6`
`pr_39_state: OPEN / DRAFT / UNMERGED / FROZEN — branch ticket/0.30.1-rec-02-r2; head caf42d891cd3e19b9977ffdc40cfa30c992e5042; tree c012e16cc411656036df1adb13fc32a4d6c8a072; synthetic merge 4d1d56b6b2d32bcfd54c524d3e01c040e4267e33; Recovery Release Policy run 32889720839 / job 97938526648 FAILURE; Recovery Verify run 32889720781 SUCCESS; no retry or mutation authorized`

Ruleset, bypass-actor, required-check, PR-state, and protected-ref facts are merge-time external facts. No omitted `bypass_actors` field may be normalized to an empty list. Fresh owner-authenticated readback is mandatory before any separately authorized protected merge.

## Blockers and lock boundary

- C8/PR #34 is terminal and cannot be repaired, rerun, edited, synchronized, retargeted, marked ready, closed, or merged.
- C9 landed at exact protected successor `31642c3644a58e9f5fc007bff648dc6146dabcfb`; its route and protected-merge authorization are consumed.
- C10 landed at exact protected successor `5995e344dbdbc18ce83186359ba9838fcf69c37e`; its r8 route is consumed.
- C11, C12, and C13 are immutable terminal evidence. Their branches, objects, runners, receipts, and PR #37 may not be retried, repaired, resumed, edited, or reused.
- C14 landed at exact protected successor `d78c453004100894fc523866b8010b40987752f6`; its r12 route and protected-merge authorization are consumed.
- REC-02 r2, `caf42d891cd3e19b9977ffdc40cfa30c992e5042`, synthetic merge `4d1d56b6b2d32bcfd54c524d3e01c040e4267e33`, branch, attempt-1 runs, and PR #39 are terminal/non-reusable and may not be retried, repaired, rerun, edited, synchronized, marked ready, or merged.
- r13 landed at exact protected successor `6339da827220908c6c5b352853932776c6c90133`; that route and its protected-merge authorization are consumed.
- REC-02 r3 is a synthetic exact candidate from `6339da827220908c6c5b352853932776c6c90133`; any real construction, push, PR, ready transition, or merge still requires separate authorization and external Issue #24 evidence.
- Protected-base ROADMAP/LOCKS/STATUS record the owner-approved dispositions at ruling commit `009fca7884e360486ddda172c389f480b62323a5`: L-025 — LOCKED: Commander identity Option B; rendered-path audit and synchronization remain pending. L-026 — LOCKED: retain zero/one branches solely as tested defensive save-recovery guards; coverage is not yet dispatched. L-027 — LOCKED: retire `vess_course_lost` and its promised downstream-course consequence; removal is not yet dispatched. L-028 — DEFERRED: default RETIRE unless mobile PX meets a pre-registered, Manraj-approved comprehension threshold; no indicator is authorized.
- `main@792e202` has a documented authority lag: AGENTS agrees at blob `592d7428b83677ab4dfd002b7181fe7c298bc084`, but main ROADMAP/PROJECT_STATUS/LOCKS blobs `788b15255bec3c65ff433a2c299ed709a27d3fb2` / `2e5b3d38c594be429b6f723bdcf695669e943774` / `398afd1f6284b7f9223f89431017425b265a67b2` still show pre-ruling/pre-Gate-A state. At C9 dispatch, exact Gate-A protected base P had ROADMAP/PROJECT_STATUS/LOCKS blobs `4b80ef5d26fab3eda752eeb0902dc255bb127263` / `5684cf777304dcef176f115aa84ad310b28a2431` / `7b79cf7058e5bfa21f8429c405078c2364fcba44`. This lag does not downgrade protected-base dispositions. The already owner-approved post-recovery ROADMAP/LOCKS changes must later be rebuilt from the final recovery successor and land atomically with PROJECT_STATUS; C10 does not rule locks.
- R5–R7 source, images, receipts, builds, evaluator/App work, and cloud resources remain frozen.
- B2, V4/V5 repair decisions, publication, deployment, tagging, release, monetization, certification, and production activation remain outside this correction.

## Next action

**Owner / Manraj:** decide whether to authorize a separately executed REC-02 r3 Build candidate after exact Issue #24 repin evidence. `NO-PUBLISH / NOT CERTIFIED` remains active.

<!-- STATUS_COMPLETE -->
