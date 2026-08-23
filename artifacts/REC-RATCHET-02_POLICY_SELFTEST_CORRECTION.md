# REC-RATCHET-02 — C8 Working-Directory-Bound Candidate-Only Object Audit

`SOURCE main@792e202 · RUNTIME recovery/e4f8440-nopub@31aca17 · TASK REC-RATCHET-02-POLICY-SELFTEST-CORRECTION-R6-C8 · MODE implementation`

**Acting role:** Build / GPT-Codex

**Authority read:** exact `main@792e202` versions of `AGENTS.md`, `artifacts/ROADMAP.md`, `artifacts/PROJECT_STATUS.md`, and `artifacts/LOCKS.md`; exact protected-base `artifacts/REC-RATCHET-02_BASELINE_TRANSITION.md`; both recovery workflows; issue #32 as the consumed C5 dispatch; PR #31 and its owner-approved HOLD; protected PR #29’s merge receipt; exact frozen PR #33 and its formal independent HOLD; C7's exact terminal clean-clone launcher receipt; Manraj's active continuous-goal authorization; Grok/program office's bounded C8 dispatch; and the preserved REC-02 r1 plus C1–C7 failures.

**Implementation authorization:** after C7's terminal required clean-clone launcher failure, Manraj's active goal explicitly authorized fail-closed retirement and continuation through one properly constructed successor. Grok/program office dispatched exactly one fresh C8 direct child from the unchanged protected base, limited to these three paths. After every local gate passes, that owner authorization permits one r6 branch push and one draft pull request only. It grants no retry, reuse, push, or PR for C7/r5; no rerun or edit of PRs #30, #31, or #33; and no ready transition, protected merge, issue #24 repin, REC-02 activation, deployment, release, tag, publication, certification, or lifting of NO-PUBLISH.

**Certification:** `NO-PUBLISH / NOT CERTIFIED`

## 1. Exact protected base

- Protected branch: `recovery/e4f8440-nopub`
- Correction base `P`: `31aca17b807c4dc8edef3683e30d5fefdd47ad7a`
- Base tree: `f458b021bc9a9a36cb28c24fd7dee165c2bbaac5`
- Gate A head `H`: `f23c4bed1555c7ad6bcb3b42ca5c6ea3a92e37ab`
- Gate A head tree: `f458b021bc9a9a36cb28c24fd7dee165c2bbaac5`
- Gate A raw commit payload SHA-256: `4835344d32a516c8d68df1c8d18f51313297f04c7de2ac5ce4628c356fb36376`
- Gate A merge topology: ordered parents `[23951012655b0037a55e82c755b66dd4d852f20b, f23c4bed1555c7ad6bcb3b42ca5c6ea3a92e37ab]`
- Gate A historical normalized policy projection: `02bd44d53b1160a992071de4add1774cd9062f0a1949b9b9985adb301387e4a5`

PR #29 landed the exact Gate A tree and remains valid. This correction does not rewrite, revoke, or reinterpret that merge. It repairs a later-context defect in Gate A’s landed policy self-test.

## 2. Preserved required-gate failure

The first exact REC-02 activation candidate was:

- head: `bd293bbe9fa9ed55eb0620bf85ef0a1316b2524e`
- tree: `34fa0adbfb027e01448a1a0771c8ff5af3997e26`
- parent: `31aca17b807c4dc8edef3683e30d5fefdd47ad7a`
- canonical ten-path manifest SHA-256: `de647dda0cf7b36290126489a342732d2022eee0816f220993b3f3d6c6478315`
- raw commit payload SHA-256: `ec41001c92a8d96e6913615dcd6fa82d108e0d91cd0c0135ecce9bdfad81d80a`
- disposition: **FAILED REQUIRED GATE / LOCAL ONLY / UNPUSHED / NON-REUSABLE**

Its syntax checks, verifier self-test, full verifier, and simulator self-test passed. The mandatory landed-policy self-test failed once, before any push or pull request, with:

`artifacts/PROJECT_STATUS.md: candidate SHA-256 drifted`

The cause is phase coupling in `currentCandidateFixture()`: it reconstructed the historical Gate A candidate by reading all six Gate A paths from `ROOT`. In a correct Stage 2 checkout, `ROOT/artifacts/PROJECT_STATUS.md` is the separately transitioned REC-02 STATUS, not Gate A STATUS SHA-256 `e84a750b32350c0a6cfecfd60c4b1a9b6e44a22f57ed5fdeb9c5afa941d56d33`. The unchanged workflow runs `node scripts/release-policy.mjs --self-test` under `set -euo pipefail` before event enforcement, so the route could never reach its event evaluator.

The failed candidate may not be pushed, retried, amended, rebased, reused, or merged. Its gameplay PASS remains diagnostic evidence only.

### Correction C1 review failure

The first locally sealed policy-correction candidate was:

- head: `b12ff37ef9153a509827d914b825dd51ec6de0ca`
- tree: `14dcaa3fb6a92349b6bebf06a606d356456859e8`
- parent: `31aca17b807c4dc8edef3683e30d5fefdd47ad7a`
- canonical three-path manifest SHA-256: `0d43560c72b994981e0dc5232156abfbbe99884ee0677ea469455a8fa79b34e7`
- raw commit payload SHA-256: `cca58ea7ae7576af6dac9bf081c8a9723ae697a15112facae2734273aba72f78`
- normalized active policy projection: `986182e1d58019a20f75f0b66211bb2f1746e9066e1fefa8aa619bb0d507619f`
- disposition: **FAILED REQUIRED REVIEW / LOCAL ONLY / UNPUSHED / NON-REUSABLE**

C1 passed the policy, projected-r2, verifier, and simulator technical gates. Final governance review placed it on HOLD because its next action required Grok to review attributable CI while the same record prohibited the branch push and draft pull request needed to create that CI. C1 may not be pushed, retried, amended, rebased, reused, or merged.

### Correction C2 review failure

The second locally sealed policy-correction candidate was:

- head: `5c3b526d287d888bc3e0765569e6632ec5f6e0e6`
- tree: `dc1e677d66c35873ac040c598e33b39c05c78e54`
- parent: `31aca17b807c4dc8edef3683e30d5fefdd47ad7a`
- canonical three-path manifest SHA-256: `d102608126737abcc8ae739d952b17e656a805373d186aacf53b232e8175b56e`
- raw commit payload SHA-256: `efb805938179bd721cff84bc0b947cb2e2741065dfa194ad6a4ee6d49cf41652`
- normalized active policy projection: `fc7905cc051b12a7ec8410a046d48ae480b1e987504fc15c37e90d5e2a77a5d9`
- disposition: **FAILED REQUIRED REVIEW / LOCAL ONLY / UNPUSHED / NON-REUSABLE**

C2 passed the policy, projected-r2, verifier, simulator, and governance gates. Final design review placed it on HOLD because its mechanically derived REC-02 r2 STATUS marked the projection activated while retaining `fresh_rec_02_branch` as blocked pending the already-satisfied correction successor. C2 may not be pushed, retried, amended, rebased, reused, or merged.

### Correction C3 required-CI failure

The third policy-correction candidate was:

- head: `ec18d093a4d4fe7a79cb8996da0c780e182fe9a1`
- tree: `a1c00d7ab971efd81d4544577150fa54e618f89d`
- parent: `31aca17b807c4dc8edef3683e30d5fefdd47ad7a`
- canonical three-path manifest SHA-256: `555b0340fa1f473dc86eab30a6a2b51a93a20564eba410e889bb7eec390b3e4a`
- raw commit payload SHA-256: `b36e2c87b8f728e57411d8d0c3e3a5ec43ba120ae8efe326f95af25ba29da17f`
- normalized active policy projection: `123633dcc49d4bf45650a700a2d539af03a4a95f14fa24a5140f92d9caef97da`
- remote branch: `ticket/0.30.1-rec-ratchet-02-policy-selftest-correction-r1`
- draft PR: `#30` — open, draft, unmerged, and frozen
- PR synthetic merge: `721a94ca10cdde235e558514b29131bd5644ba98`
- failed workflow: Recovery Release Policy #48 / run `32613327167`
- failed job: `release-policy` / job `97129767639`
- failed step: `Run release-policy positive and negative fixtures`; event enforcement was skipped
- successful workflow: Recovery Verify #58 / run `32613327212`; random `97129767728`, priciest `97129767832`, verify `97129767835`, cheapest `97129767840`, and simulation-gate `97130082900` all passed
- disposition: **FAILED REQUIRED CI / REMOTE BRANCH FROZEN / DRAFT PR #30 FROZEN / UNMERGED / NON-REUSABLE**

GitHub checked out exact synthetic merge `721a94ca10cdde235e558514b29131bd5644ba98`, used Node.js `v22.16.0`, and failed the positive/negative-fixture step at `scripts/release-policy.mjs:1770`. The assertion expected the exact C1 non-reusable error, but GitHub's clean repository did not contain the never-pushed C1 object. The C3 policy attempted object dereference before checking C1's pinned failed OID, so it returned the generic unreadable-commit error. The policy remained fail-closed; C1 was not accepted.

A stricter candidate-only object audit found a second independent defect that the broad GitHub checkout masked: ART compatibility dereferenced frozen PR #26 head `7fe31675b678d041c980605ed5c5533d3ea22581`, its tree, and its 79 changed blobs from a separate remote branch. C3 therefore was not self-contained even though those objects happened to exist in the Actions checkout. R2 seals the exact ART head raw frame plus its sorted 79-record mode/blob/SHA-256 manifest inside the policy, re-derives the exact held and combined trees without writing or reading the absent ART blobs, and reconstructs both verifier outputs from branch-reachable source plus the authorized patch.

C3's successful verifier and locked simulation run cannot override its mandatory release-policy failure. C3 may not be retried, amended, rebased, reused, or merged. Its r1 branch and PR #30 may not be pushed, synchronized, rerun, edited, retargeted, marked ready, closed, or merged.

### Correction C4 independent-adjudication failure

The fourth policy-correction candidate was:

- head: `6441d5f7ad5df5870dbddcabce6243c3d23d09ca`
- tree: `f0f12d10bc406c320a1c9324249ee4f2d17332e5`
- parent: `31aca17b807c4dc8edef3683e30d5fefdd47ad7a`
- canonical three-path manifest SHA-256: `b418beff175878ed66906f1690d42978725ff2f9c04901dca5d3ae87913ecf4a`
- raw commit payload SHA-256: `209a98ac29d30138ab684e203ab0c4d60f6b5ca872c969da226dcd8803c3d2fb`
- normalized active policy projection: `c326aef49b156f624fb67b9e6e6fa0eab1cf86f987bffcdad9ec355f811d2206`
- remote branch: `ticket/0.30.1-rec-ratchet-02-policy-selftest-correction-r2`
- draft PR: `#31` — open, draft, unmerged, and frozen
- PR synthetic merge: `bfea3326bcb2b18431c7d10fcb1f59f89b4b8235`
- successful workflow: Recovery Release Policy #49 / run `32615874248`; release-policy job `97136388344`
- successful workflow: Recovery Verify #59 / run `32615874238`; random `97136388297`, cheapest `97136388349`, verify `97136388352`, priciest `97136388419`, and simulation-gate `97136711468`
- locked workload: random, cheapest, and priciest at seed `20260817`, exactly 2,000 runs each; 6,000 total
- owner-approved HOLD: `https://github.com/mbains89/Sunsplitter/pull/31#issuecomment-5384470876`
- disposition: **FAILED REQUIRED INDEPENDENT ADJUDICATION / REMOTE BRANCH FROZEN / DRAFT PR #31 FROZEN / UNMERGED / NON-REUSABLE**

C4 checked each rejected OID before its eventual exact error, but `policyCorrectionEvidence()` and `futureEvidence()` still invoked `rev-parse --verify` and `cat-file -t` on the failed identity. Its self-tests asserted only the returned message, not zero Git invocation. Green CI therefore did not satisfy the pre-dereference contract. C4, its r2 branch, PR #31, and its synthetic merge are permanently frozen and non-reusable.

### Correction C5 required clean-room-check failure

The fifth locally sealed policy-correction candidate was:

- head: `111f80a5a45ab637504cdd6c09581848b90e09f9`
- tree: `5727b34d002ecc8dc8e36fdef9ff575e3fd10c3d`
- parent: `31aca17b807c4dc8edef3683e30d5fefdd47ad7a`
- canonical three-path manifest SHA-256: `2554a2ad4d3dc0764974a460553ebc357e543443102cb0f22bcbda58b1be0cd5`
- raw commit payload SHA-256: `e3eacd91beae3593dcb28d0b6d1eafda4dc151763237d3b746d0562bb4a4ab7d`
- normalized active policy projection: `251ee05cca779cfc2682692bb2be4d27288f4faf1f6aa37e3948479d0ba84b63`
- local synthetic merge fixture: `123411be88083fa295b1f67cc3e7fbe4bfacd7f3`
- HEAD-only bundle SHA-256: `507c2759ad61e504d8efda0e20600b3ccb0eef2ee73c0dac190d32ccbd3d2527`
- reserved r3 branch: **CONSUMED / NEVER CREATED / MUST NOT CREATE**
- runtime: Node.js `v22.16.0`
- required-check exit: `1`
- exact terminal receipt: `Error: ART blob count 0`
- object probes before failure: `0`
- disposition: **FAILED REQUIRED CLEAN-ROOM CHECK / LOCAL ONLY / UNPUSHED / NON-REUSABLE**

C5's first policy self-test passed, including 90 zero-Git rejected-head route checks. The following required clean-room helper then treated the source-literal two-byte `\t` escape as an actual tab and aborted while parsing the sealed manifest, before any object probe. That is a checker failure, not policy acceptance or proof of a policy defect, but the fail-closed contract does not distinguish harness failures. No C5 required check was rerun. C5's head, tree, manifest, raw payload, projection, bundle, and r3 reservation are permanently frozen and non-reusable.

### Correction C6 independent clean-room-verification failure

The sixth policy-correction candidate was:

- head: `fb16fe160a416fc4a638c2ea7dcae83361c88764`
- tree: `7dec1712c000578da6c1ec92b0e7ac8ff8f081bb`
- parent: `31aca17b807c4dc8edef3683e30d5fefdd47ad7a`
- canonical three-path manifest SHA-256: `edc486bac29272ab1c02923d392a96cd14ddb38e3a4552d42e6050a42133e9e9`
- raw commit payload: 811 bytes
- raw commit payload SHA-256: `b82ce035722897c2636ad5035ba28eb35c288b3b1da339d01832bfa7b2627715`
- normalized active policy projection: `631de6f352e5f71d0cc1d86bfa4834642351a6a903f491ce355ebcc5eacbd591`
- remote branch: `ticket/0.30.1-rec-ratchet-02-policy-selftest-correction-r4`
- draft PR: `#33` — open, draft, unmerged, and frozen
- PR synthetic merge: `87093fc887275f3473a88a8ff549fa93c74f34b5`
- successful workflow: Recovery Release Policy #50 / run `32649075334`; release-policy job `97217749298`
- successful workflow: Recovery Verify #60 / run `32649075335`; verify `97217749348`, priciest `97217749404`, random `97217749438`, cheapest `97217749484`, and simulation-gate `97218162899`
- locked workload: random, cheapest, and priciest at seed `20260817`, exactly 2,000 runs each; 6,000 total
- independent runtime: Node.js `v22.16.0`
- required-check exit: `1`
- exact terminal receipt: `Error: sealed manifest source not found`
- object probes before failure: `0`
- disposition: **FAILED REQUIRED INDEPENDENT CLEAN-ROOM VERIFICATION / REMOTE BRANCH FROZEN / DRAFT PR #33 FROZEN / UNMERGED / NON-REUSABLE**

C6 passed the builder's local gates and attributable attempt-1 CI. During formal independent adjudication, the first clean single-branch candidate check attempted to recover the sealed manifest by parsing source text. That external parser did not find its expected source pattern and exited before proving the required 97-object absence claim. No later independent local gate ran. The failure proves neither policy acceptance nor a policy defect, but the fail-closed contract does not distinguish a review-harness failure. The failed command was not repaired or rerun. C6, its r4 branch, PR #33, and its synthetic merge are permanently frozen and non-reusable.

### Correction C7 required clean-clone launcher failure

The seventh policy-correction candidate was:

- head: `37bba2712193a1ce9e7108b8ff9826230c69e680`
- tree: `9332457ef5c6ebeb44eb0aa9d8c0673e10470de2`
- parent: `31aca17b807c4dc8edef3683e30d5fefdd47ad7a`
- canonical three-path manifest SHA-256: `a730c1e1e7367202d0eafd43ddfecf8c11978d2ef99dad8bd493cc9941d08a5b`
- raw commit payload: 818 bytes
- raw commit payload SHA-256: `bfb24d674004cd74ecc763b4ac0c334217adbe6f898502c2c7cad4e6d4a80428`
- normalized active policy projection: `99aff87b463f3727002afe1929ac6b7ba303f366f77a77eaada386e87d06f484`
- local synthetic merge fixture: `80cd3ed0bfc4b024ce03b9b99fa5f5eeac265de8`
- canonical forbidden-object inventory: 4,491 bytes; 99 OIDs; SHA-256 `0b7e1eb2fe20c4e90175f9533f3186a63880bc16f60fafad0ee3a09f65e0be87`
- status: blob `4a1a94f6895448c08db2e748bb827d6acd2c4d77`; SHA-256 `a28195d14261cba103880c52bae6886c70023cb9290979e6e0917fed198d3df7`; 29,683 bytes
- correction record: blob `d158c6eefb3f937cb113cc26bfd9b12c1446df7d`; SHA-256 `2e742d5102a2934211238e2a3cdd8814f046c8fed1b8905b8ea78f96a769e318`; 26,027 bytes
- policy: blob `8584c19e531135730c1f8b18e664ada2a2cb4898`; SHA-256 `969c9e2caeef389f8739ba511f6c352cc705f94ab863c1a8760a855acaa82906`; 159,072 bytes
- reserved r5 branch: **CONSUMED / LOCAL ONLY / NEVER PUSHED / NO PR / MUST NOT PUSH**
- runtime: Node.js `v22.16.0`
- required-check exit: `1`
- exact terminal receipt: `FAIL release-policy crash: Error: candidate-only checkout .git entry is not a direct directory`
- forbidden-object batch probes before failure: `0`
- disposition: **FAILED REQUIRED CLEAN-CLONE A CANDIDATE-STORE CHECK / LOCAL ONLY / UNPUSHED / NO PR / PERMANENTLY FROZEN / NON-REUSABLE**

C7 passed its pre-freeze gates and printed the exact 99-object inventory. Its first required clean-clone-A command then launched Node from the builder worktree and appended clone A's path as an unused positional argument. The policy therefore inspected the builder linked-worktree `.git` file instead of clone A's direct `.git` directory. No forbidden-object batch probe ran and no later required C7 gate ran. This is a terminal launcher failure rather than proof that the policy accepted a forbidden object. C7, its exact bytes and identities, and r5 are permanently frozen and non-reusable.

C8 is reconstructed directly from `P`, never as a child, amendment, rebase, cherry-pick, or reuse of REC-02 r1 or correction C1–C7. It preserves the committed inventory/check modes and adds one pre-identity external-launcher preflight: clone-local absolute script, `cwd` mechanically bound to the clone's real path, unsafe `GIT_*` variables scrubbed, direct non-symlink `.git` asserted, and an unrelated-caller negative that reproduces C7's exact receipt. The frozen 6,878-byte harness has SHA-256 `070724946992ec8f85007b7b59d298abc4fb0cdb0bfb76cb51bd04178adad467`; its positive matrix launches the clone-local inventory, candidate-store checker, and self-test modes. Before C8 identity is frozen, the harness, modes, and unit controls may be repaired freely. After identity freeze, every first required result is terminal.

The pre-identity policy matrix then passed under pinned Node.js `v22.16.0`: 144 rejected-head route checks made zero Git calls; 86 historical raw-frame and 98 structured adversarial fixtures were rejected; immutable Gate A, one self-consuming correction route, and one future REC-02 r2 route were accepted; and `NO-PUBLISH` remained active. That preflight materialized unreferenced correction fixture `0f6c79d066b5e1ae90e55966359d173339cac3a6` with tree `b810cce9a5ab70762a7db47351be4ffdffed45fe`. It was never a branch head or sealed candidate. Recording this receipt changes both governed documents, so those provisional fixture bytes cannot equal final C8 and no C8 identity is yet frozen.

## 3. Exact correction scope

Retired reservation: `ticket/0.30.1-rec-ratchet-02-policy-selftest-correction-r3` — consumed by C5, never created, and must not be created. Frozen remote branch: `ticket/0.30.1-rec-ratchet-02-policy-selftest-correction-r4` — exact C6 only; do not edit, rerun, synchronize, retarget, close, mark ready, or merge. Retired local branch: `ticket/0.30.1-rec-ratchet-02-policy-selftest-correction-r5` — consumed by C7, local only, never pushed, no PR, and must not be pushed. Fresh branch: `ticket/0.30.1-rec-ratchet-02-policy-selftest-correction-r6` — exactly one C8 push and one draft PR are authorized only after all local gates pass.

Exactly these three regular files may differ from `P`, each at mode `100644`:

1. `artifacts/PROJECT_STATUS.md`
2. `artifacts/REC-RATCHET-02_POLICY_SELFTEST_CORRECTION.md`
3. `scripts/release-policy.mjs`

No workflow, ROADMAP, LOCKS, `AGENTS.md`, active or inactive simulation baseline, verifier, simulator, `src/**`, image, art, CSS, HTML, VERSION, Netlify, deployment, tag, release, publication, certification, ruleset, secret, App/evaluator, or cloud byte may change.

## 4. Repair contract

The corrected policy must:

1. Validate historical Gate A from immutable commit `H`, including its exact raw frame, tree, parent, six paths, file identities, historical normalized policy projection, workflow security, inactive projection, ART compatibility, and adversarial negatives. ART compatibility must consume the sealed exact ART raw frame and 79-record identity manifest and must not dereference PR #26 or rely on wildcard-fetched remote objects. No historical positive fixture may read mutable current-checkout STATUS bytes.
2. Maintain separate historical and active policy projections. Gate A remains bound to `02bd44d5…`; the corrected policy and every later authorized successor are bound to the corrected active projection.
3. Arm one exact self-consuming correction route from `P`: correction candidate `C` is one canonical three-path commit; correction successor `Q` is an exact two-parent merge with ordered parents `[P, C]` and tree equal to `C`.
4. Maintain one immutable failed-identity registry containing REC-02 r1 and correction C1, C2, C3, C4, C5, C6, and C7. Both correction and future REC-02 candidate evaluators must consult it as their first semantic operation after input normalization. Every exact failed head must return its pinned non-reuse receipt before any Git command, object resolution, cache, base validation, diff, tree, path, or blob access, including when presented through the other route. Instrumented self-tests must prove zero Git invocations for every failed head through both routes. After a non-rejected commit resolves, reject every registered failed tree before reading any path or blob from that commit.
5. Provide committed `--forbidden-object-inventory` and `--check-candidate-only-object-store` modes. The inventory mode must make zero Git calls and emit canonical JSON from evaluated constants and the sealed manifest, never source parsing. The check mode must fail on refs/tags, remotes, alternates, shallow or common object stores, promisor/partial-clone configuration, missing protected-base controls, or any forbidden object present. The inventory is exactly 101 unique OIDs: 16 failed head/tree objects, 2 ART roots, 79 ART blobs, and 4 derived functional/combined objects. Every external launcher must execute the clone-local absolute policy script with `cwd` bound mechanically to that clone's real path; passing the clone as an unused positional argument is forbidden, and the exact launcher bytes must pass positive and expected-failure controls before identity freeze.
6. Arm later REC-02 only on fresh branch `ticket/0.30.1-rec-02-r2`, based on an exact valid `Q`. The old r1 branch, failed r1 head, and every direct `P`-based REC-02 attempt must fail closed.
7. Preserve the original exact ten-path REC-02 activation scope, inactive patch, baseline, scene outputs, verifier output, workflow security, ART compatibility, and `NO-PUBLISH` controls.
8. Mechanically derive the future REC-02 STATUS without reading `ROOT` as historical authority and preserve this correction plus failed-r1/C1/C2/C3/C4/C5/C6/C7 dispositions in the future STATUS.
9. Reject correction squash, rebase, fast-forward substitution, swapped parents, octopus topology, wrong tree, wrong base, wrong or frozen branch, fork head, tag event, scope drift, raw-frame drift, content drift, and reuse after `Q`.
10. Consume the REC-02 route after one exact merge and reject repeated-head, repeated-route, and post-consumption events.

## 5. Authorized topology

The only correction topology this record permits the policy to recognize is:

`P=31aca17 -> C8=exact three-path candidate -> Q=exact protected merge [P,C8]`

After a separately authorized merge to `Q`, issue #24 must be repinned to exact `Q`. Only then may a separately authorized Build session reconstruct REC-02 on:

`ticket/0.30.1-rec-02-r2: Q -> R2=exact ten-path candidate -> M=exact protected merge [Q,R2]`

C8 records owner authorization for local construction and validation plus, only after complete local PASS, one r6 push and one draft PR. It authorizes neither a ready transition nor `Q`, issue #24 repin, REC-02, `R2`, or `M`. Every protected merge requires separate exact owner authorization after fresh merge-time readback.

## 6. Acceptance evidence

Pinned Node.js: `v22.16.0`.

The candidate itself carries the authoritative inventory and object-store checker. No external source parser or builder-worktree object database may supply required clean-room evidence. The canonical 4,578-byte, 101-object inventory SHA-256 is `9d94fbedabcc29951800d84a47d65d0bd209b30640e2805687f8e956ff2ea9a5`.

The correction candidate must prove all of the following without a same-identity retry after any required-gate failure:

- exact three-path diff and `git diff --check`;
- before identity freeze, the exact 6,878-byte launcher with SHA-256 `070724946992ec8f85007b7b59d298abc4fb0cdb0bfb76cb51bd04178adad467` passes syntax, proves clone-local absolute-script and real-`cwd` binding from an unrelated caller for inventory, candidate-store checker, and self-test modes, scrubs unsafe `GIT_*`, requires direct non-symlink `.git`, and reproduces C7's exact receipt in the expected faulty-launch negative;
- before identity freeze, the committed inventory and object-store modes pass syntax and internal unit controls against an unrelated protected-base fixture;
- `--forbidden-object-inventory` makes zero Git calls, reads evaluated constants plus the sealed manifest rather than source text, emits 4,578-byte canonical JSON with one terminal LF, binds the manifest to exactly 10,863 bytes and SHA-256 `a3bb3dc47bf7302de03d8b057637ecdbcd852b1e2e7d2034b098a3e55358a073`, and enumerates exactly 101 sorted unique OIDs: 16 failed head/tree objects, 2 ART roots, 79 ART blobs, and 4 derived objects;
- `--check-candidate-only-object-store` consumes that same evaluated inventory, uses read-only object probes, and fails closed on refs or tags, remotes, alternates, a shallow or common object store, promisor or partial-clone configuration, missing protected-base controls, unsafe repository shape, inventory drift, or any forbidden object present;
- JavaScript syntax across the repository script manifest;
- canonical per-file mode, blob, SHA-256, and byte identities; sorted three-path manifest and SHA-256; exact raw commit frame and SHA-256; independently recomputed framed-object SHA-1 and commit OID;
- active policy projection equals its embedded corrected digest;
- `node scripts/release-policy.mjs --self-test` passes in the correction checkout;
- the same self-test passes from a mechanically constructed post-`Q` REC-02 r2 checkout whose STATUS differs from correction STATUS;
- exact positive correction PR and protected-push event fixtures;
- exact positive REC-02 r2 PR and protected-push event fixtures;
- historical Gate A, raw-frame, scope, topology, workflow-security, ART, and projection negatives remain rejected;
- new correction-route reuse, old-r1 reuse, wrong correction base, direct `P -> REC-02`, and post-REC-02 route reuse negatives are rejected;
- clean clone A is created from a candidate-head-only bundle, has no tags, refs, remotes, alternates, shallow/common store, promisor/partial-clone configuration, wildcard fetch, failed identity, ART head/tree/blob, or derived functional/combined object, and runs `--forbidden-object-inventory` plus `--check-candidate-only-object-store` through the exact preflighted clone-bound launcher before any policy self-test; all 101 forbidden OIDs, including REC-02 r1 and C1–C7 heads/trees, must be absent and all six protected/base controls must be present;
- every failed OID is presented through both correction and future routes; instrumented assertions prove zero Git/object invocations and the exact pinned non-reuse receipt; exact failed-tree assertions use new placeholder commits, reject after commit framing, and perform no candidate path/blob read;
- separate clean clone B runs the correction and mechanically projected REC-02 r2 self-tests through clone-bound processes without a wildcard fetch; clone A's absence receipt is not replaced by clone B's later fixture objects;
- cold correction PR and protected-push evaluators each pass in a separate fresh process without a self-test warm-up or wildcard fetch;
- cold future REC-02 PR and protected-push evaluators each pass in a separate fresh process without a self-test warm-up or wildcard fetch;
- the sealed ART record reproduces the exact ART raw frame, 10,863-byte sorted 79-record identity manifest, 55 images, sealed-manifest SHA-256 `a3bb3dc47bf7302de03d8b057637ecdbcd852b1e2e7d2034b098a3e55358a073`, distinct 55-image digest `1441be78e8d0d95f4cf2cfd9ace72b7e6458aa0ec230336748de6a2b96db7baa`, transformed verifier, combined tree, and combined manifest;
- verifier self-test, full verifier, and simulator self-test pass;
- locked random, cheapest, and priciest recovery matrices pass at seed `20260817`, exactly 2,000 runs each;
- final worktree and index are clean at the exact candidate identity.

## 7. Stop state

Rulesets, bypass actors, protected refs, and required checks remain external merge-time facts and require fresh owner-authenticated readback before any separately authorized protected merge. No omission may be normalized to an empty bypass list.

PRs #26 and #27 remain frozen at their recorded exact heads; PR #28 remains outside scope and untouched. PR #30 and its r1 correction branch remain frozen at C3 `ec18d093a4d4fe7a79cb8996da0c780e182fe9a1`. PR #31 and its r2 correction branch remain frozen at C4 `6441d5f7ad5df5870dbddcabce6243c3d23d09ca`. PR #33 and its r4 correction branch remain frozen at C6 `fb16fe160a416fc4a638c2ea7dcae83361c88764`. No push, synchronization, workflow run or rerun, edit, retarget, ready transition, closure, or merge of those frozen identities is authorized. R5–R7, ART, B2, V4/V5 repairs, issue #24, REC-02, gameplay beyond the exact future REC-02 projection, repository administration, cloud resources, Netlify, tags, releases, deployments, publication, and certification remain outside Stage A.

C5 and its never-created r3 reservation remain frozen. C6, its r4 branch, and PR #33 remain frozen. C7 and its local-only r5 reservation remain frozen, unpushed, without a PR, and non-reusable. C8 permits pre-identity repair, then one sealed local candidate. After identity freeze, any required mismatch or required-check failure permanently freezes that exact C8 head, tree, manifest, raw payload, projection, and receipt; no same-identity retry, rerun, repair, amendment, rebase, cherry-pick, reuse, push, pull request, or merge is authorized. Only after complete local PASS may Build push the exact r6 branch once and open one draft pull request; no ready transition or protected merge is authorized.

`NO-PUBLISH / NOT CERTIFIED` remains active.

## 8. Next action

**Build / GPT-Codex:** finish the one exact C8 candidate using the preflighted working-directory-bound launcher and its two-clone local gate. Only after complete local PASS, push `ticket/0.30.1-rec-ratchet-02-policy-selftest-correction-r6` once and open one draft PR against `recovery/e4f8440-nopub`; then obtain attributable attempt-1 CI and a fresh independent Grok/program-office adjudication. PRs #30, #31, and #33 remain frozen, and r5 must never be pushed. No ready transition, protected merge, REC-02 construction, deployment, release, publication, certification, or lifting of `NO-PUBLISH / NOT CERTIFIED` is authorized.
