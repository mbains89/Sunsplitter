# Sunsplitter — Current Status

`schema_version: 1`
`updated_utc: 2026-08-24`
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
`rec_ratchet_02_control_state: GATE A CLOSED at P; C9 CLOSED through protected PR #35 at Q; r7 route consumed; C10/r8 is PRE-IDENTITY; NO-PUBLISH / NOT CERTIFIED remains active`
`governed_recovery_successor_sha: 31642c3644a58e9f5fc007bff648dc6146dabcfb`
`tested_runtime_sha: 31642c3644a58e9f5fc007bff648dc6146dabcfb — exact protected C9 policy-correction successor; recovery evidence, not certification`
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

`milestone: REC-RATCHET-02-POLICY-SELFTEST-CORRECTION-R8-C10 — immutable fixture-source successor`
`ticket: Manraj continuous-goal authorization + REC-02 r2 pre-freeze self-test HOLD + independent C10 design and governance audits`
`owner: Build / GPT-Codex; independent verification is separate; every protected merge requires a fresh exact owner authorization`
`state: POLICY CORRECTION C10 PRE-IDENTITY — historical C9/Q fixture sealing and r2-safe successor route under construction; no candidate identity, push, pull request, ready transition, or protected merge exists`
`governed_branch: recovery/e4f8440-nopub`
`implementation_branch: ticket/0.30.1-rec-ratchet-02-policy-selftest-correction-r8`
`dispatch_base_sha: 31642c3644a58e9f5fc007bff648dc6146dabcfb`
`dispatch_base_tree: 103a4ccf5c1511d225d67870e6fb87e64b992de4`
`gate_a_scope: LANDED PRECURSOR — exact six-path Gate A envelope retained as immutable evidence`
`policy_correction_scope: exactly artifacts/PROJECT_STATUS.md; artifacts/REC-RATCHET-02_POLICY_SELFTEST_CORRECTION.md; scripts/release-policy.mjs`
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
`r2_prefreeze_hold: PRESERVED / UNFROZEN — tree 0970dc606b63a84dd38ab46541b2a359ef95674f; STATUS blob 742ae69f94bdac92cd4ccce8267508ef0693c62a / SHA-256 9cb1f4b42f9e8393f96f176fd0252682616afca09f8adfa9f9044a7575122aa6 / 18,008 bytes; static fail-closed determination before invocation: the mandatory policy self-test was not invoked, and its expected error was artifacts/PROJECT_STATUS.md: policy correction identity drifted`
`r2_prefreeze_identity_receipt: manifest 1,351 bytes / SHA-256 469f6f5683acdeb8d34a81112c71d2409344032504335bef6e956dd6149680de; raw frame 1,712 bytes / SHA-256 15f8128f63145990f0323622744f54b0c23f994b4bfb2e4aead667351c133bd9; predicted OID f5ab37d4845156d7b80678e4492d5fdece1c4458 absent; local branch remained Q; remote branch absent; no PR`
`r2_prefreeze_diagnostic_receipt: two diagnostic verifier/simulation repetitions passed with stdout SHA-256 f2e67e934b18e9dbc6464d9b7d502404b7c7e34b02307bb8056e3e8e94bfc69d and normalized core c1969e553a03fd80c9ce220a511e3ed6393c9c7b72ef0ca3ab4edb4dcfc78c08; no candidate PASS was claimed and no identity was frozen, committed, pushed, or opened as a PR`
`fresh_rec_02_branch: ticket/0.30.1-rec-02-r2 — BLOCKED until exact C10 lands through a separately authorized protected merge and issue #24 is freshly repinned to that successor`
`issue_24_repin_requirement: REQUIRED EXTERNAL PRECONDITION — after exact C10 protected merge S and before reconstructing REC-02 r2, issue #24 must be repinned to exact S under separate owner authorization`
`active_simulation_baseline_sha256: 0633469f57971b9c00c877a33f9ccb818e53d5a8de8cc787e4ca2a25fdeda7f2 — unchanged Gate A input`
`functional_projection_state: EVIDENCE ONLY — exact inactive REC-02 baseline, verifier, and seven source outputs; later exact-head verification must rerun`
`rec_02_governed_scenes: cut_out; vent; past_leak; vault_voice; arc_future_1; act3_reckoning_heading; pregnancy_check; custody_possession; custody_thaw`
`art_r2_held_digest: 1441be78e8d0d95f4cf2cfd9ace72b7e6458aa0ec230336748de6a2b96db7baa — sealed 55-image compatibility evidence`

## Frozen failed-identity register

Every entry below is terminal, unmerged, and non-reusable. Exact receipts and immutable file/CI identities are preserved in the correction record.

`failed_rec_02_r1_head: bd293bbe9fa9ed55eb0620bf85ef0a1316b2524e`
`failed_rec_02_r1_tree: 34fa0adbfb027e01448a1a0771c8ff5af3997e26`
`failed_rec_02_r1_disposition: FAILED REQUIRED GATE / LOCAL ONLY / UNPUSHED / NON-REUSABLE`

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

Ruleset, bypass-actor, required-check, PR-state, and protected-ref facts are merge-time external facts. No omitted `bypass_actors` field may be normalized to an empty list. Fresh owner-authenticated readback is mandatory before any separately authorized protected merge.

## Blockers and lock boundary

- C8/PR #34 is terminal and cannot be repaired, rerun, edited, synchronized, retargeted, marked ready, closed, or merged.
- C9 landed at exact protected successor `31642c3644a58e9f5fc007bff648dc6146dabcfb`; its route and protected-merge authorization are consumed.
- C10 has no known design blocker before identity freeze. Any required failure after freeze permanently retires that exact identity and requires a fresh successor.
- REC-02 r2 is held pre-freeze because the landed C9 self-test reconstructed historical C9 from mutable r2 STATUS. It remains uncommitted and unpushed until C10 lands and issue #24 is freshly repinned.
- Protected-base ROADMAP/LOCKS/STATUS record the owner-approved dispositions at ruling commit `009fca7884e360486ddda172c389f480b62323a5`: L-025 — LOCKED: Commander identity Option B; rendered-path audit and synchronization remain pending. L-026 — LOCKED: retain zero/one branches solely as tested defensive save-recovery guards; coverage is not yet dispatched. L-027 — LOCKED: retire `vess_course_lost` and its promised downstream-course consequence; removal is not yet dispatched. L-028 — DEFERRED: default RETIRE unless mobile PX meets a pre-registered, Manraj-approved comprehension threshold; no indicator is authorized.
- `main@792e202` has a documented authority lag: AGENTS agrees at blob `592d7428b83677ab4dfd002b7181fe7c298bc084`, but main ROADMAP/PROJECT_STATUS/LOCKS blobs `788b15255bec3c65ff433a2c299ed709a27d3fb2` / `2e5b3d38c594be429b6f723bdcf695669e943774` / `398afd1f6284b7f9223f89431017425b265a67b2` still show pre-ruling/pre-Gate-A state. At C9 dispatch, exact Gate-A protected base P had ROADMAP/PROJECT_STATUS/LOCKS blobs `4b80ef5d26fab3eda752eeb0902dc255bb127263` / `5684cf777304dcef176f115aa84ad310b28a2431` / `7b79cf7058e5bfa21f8429c405078c2364fcba44`. This lag does not downgrade protected-base dispositions. The already owner-approved post-recovery ROADMAP/LOCKS changes must later be rebuilt from the final recovery successor and land atomically with PROJECT_STATUS; C10 does not rule locks.
- R5–R7 source, images, receipts, builds, evaluator/App work, and cloud resources remain frozen.
- B2, V4/V5 repair decisions, publication, deployment, tagging, release, monetization, certification, and production activation remain outside this correction.

## Next action

**Build / GPT-Codex:** run the repaired pre-identity self-test and remaining pre-freeze static checks; only after PASS may Build freeze and enter the 13-gate one-shot. `NO-PUBLISH / NOT CERTIFIED` remains active.

<!-- STATUS_COMPLETE -->
