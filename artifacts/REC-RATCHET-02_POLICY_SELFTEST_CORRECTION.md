# REC-RATCHET-02 — Stage 2 Policy Self-Test Correction

`SOURCE main@792e202 · RUNTIME recovery/e4f8440-nopub@31aca17 · TASK REC-RATCHET-02-POLICY-SELFTEST-CORRECTION-R2 · MODE implementation`

**Acting role:** Build / GPT-Codex

**Authority read:** `AGENTS.md`, `artifacts/ROADMAP.md`, `artifacts/PROJECT_STATUS.md`, `artifacts/LOCKS.md`, `artifacts/REC-RATCHET-02_BASELINE_TRANSITION.md`, both recovery workflows, issue #24’s exact Stage 2 repin, protected PR #29’s merge receipt, and the preserved REC-02 r1 failure.

**Implementation authorization:** Manraj authorized the bounded 0.30.1 completion train and explicitly authorized Build to perform this repair. The later combined external-write authorization was consumed by C3's exact r1 branch push, draft PR #30, and CI monitoring. After C3 failed required CI, R2 authority covers local construction and validation of this fresh exact three-path successor only. It grants no new push, pull request, ready transition, protected merge, REC-02 activation, certification, or publication authority.

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

GitHub checked out exact synthetic merge `721a94ca10cdde235e558514b29131bd5644ba98`, used Node.js `v22.16.0`, and failed the positive/negative-fixture step at `scripts/release-policy.mjs:1770`. The assertion expected the exact C1 non-reusable error, but GitHub's clean repository did not contain the never-pushed C1 object. `policyCorrectionEvidence()` attempted object dereference before checking C1's pinned failed OID, so it returned the generic unreadable-commit error. The policy remained fail-closed; C1 was not accepted.

A stricter candidate-only object audit found a second independent defect that the broad GitHub checkout masked: ART compatibility dereferenced frozen PR #26 head `7fe31675b678d041c980605ed5c5533d3ea22581`, its tree, and its 79 changed blobs from a separate remote branch. C3 therefore was not self-contained even though those objects happened to exist in the Actions checkout. R2 seals the exact ART head raw frame plus its sorted 79-record mode/blob/SHA-256 manifest inside the policy, re-derives the exact held and combined trees without writing or reading the absent ART blobs, and reconstructs both verifier outputs from branch-reachable source plus the authorized patch.

C3's successful verifier and locked simulation run cannot override its mandatory release-policy failure. C3 may not be retried, amended, rebased, reused, or merged. Its r1 branch and PR #30 may not be pushed, synchronized, rerun, edited, retargeted, marked ready, closed, or merged. The current C4 successor is reconstructed directly from `P`, checks every failed OID before dereference, and must pass in an isolated object database that contains none of failed REC-02 r1, C1, C2, C3, or frozen PR #26's ART objects.

## 3. Exact correction scope

Branch: `ticket/0.30.1-rec-ratchet-02-policy-selftest-correction-r2`

Exactly these three regular files may differ from `P`, each at mode `100644`:

1. `artifacts/PROJECT_STATUS.md`
2. `artifacts/REC-RATCHET-02_POLICY_SELFTEST_CORRECTION.md`
3. `scripts/release-policy.mjs`

No workflow, ROADMAP, LOCKS, `AGENTS.md`, active or inactive simulation fixture, verifier, simulator, `src/**`, image, art, CSS, HTML, VERSION, Netlify, deployment, tag, release, publication, or certification byte may change.

## 4. Repair contract

The corrected policy must:

1. Validate historical Gate A from immutable commit `H`, including its exact raw frame, tree, parent, six paths, file identities, historical normalized policy projection, workflow security, inactive projection, ART compatibility, and adversarial negatives. ART compatibility must consume the sealed exact ART raw frame and 79-record identity manifest and must not dereference PR #26 or rely on wildcard-fetched remote objects. No historical positive fixture may read mutable current-checkout STATUS bytes.
2. Maintain separate historical and active policy projections. Gate A remains bound to `02bd44d5…`; the corrected policy and every later authorized successor are bound to the corrected active projection.
3. Arm one exact self-consuming correction route from `P`: correction candidate `C` is one canonical three-path commit; correction successor `Q` is an exact two-parent merge with ordered parents `[P, C]` and tree equal to `C`.
4. Reject failed REC-02 r1 and correction C1, C2, and C3 by exact OID before object dereference. After a supplied commit resolves, reject every failed tree before reading paths from it.
5. Arm later REC-02 only on fresh branch `ticket/0.30.1-rec-02-r2`, based on an exact valid `Q`. The old r1 branch, failed r1 head, and every direct `P`-based REC-02 attempt must fail closed.
6. Preserve the original exact ten-path REC-02 activation scope, inactive patch, baseline, scene outputs, verifier output, workflow security, ART compatibility, and `NO-PUBLISH` controls.
7. Mechanically derive the future REC-02 STATUS without reading `ROOT` as historical authority and preserve this correction plus failed-r1/C1/C2/C3 dispositions in the future STATUS.
8. Reject correction squash, rebase, fast-forward substitution, swapped parents, octopus topology, wrong tree, wrong base, wrong or frozen branch, fork head, tag event, scope drift, raw-frame drift, content drift, and reuse after `Q`.
9. Consume the REC-02 route after one exact merge and reject repeated-head, repeated-route, and post-consumption events.

## 5. Authorized topology

The only correction topology this record permits the policy to recognize is:

`P=31aca17 -> C=exact three-path candidate -> Q=exact protected merge [P,C]`

After a separately authorized merge to `Q`, issue #24 must be repinned to exact `Q`. Only then may a separately authorized Build session reconstruct REC-02 on:

`ticket/0.30.1-rec-02-r2: Q -> R2=exact ten-path candidate -> M=exact protected merge [Q,R2]`

This artifact records owner authorization for local construction and validation of `C`. It does not itself authorize a remote branch push, pull request, ready transition, or merge of `C`, `Q`, `R2`, or `M`. It defines the fail-closed identities and checks that a later separately authorized workflow must satisfy.

## 6. Acceptance evidence

Pinned Node.js: `v22.16.0`.

The correction candidate must prove all of the following without a same-identity retry after any required-gate failure:

- exact three-path diff and `git diff --check`;
- JavaScript syntax across the repository script manifest;
- active policy projection equals its embedded corrected digest;
- `node scripts/release-policy.mjs --self-test` passes in the correction checkout;
- the same self-test passes from a mechanically constructed post-`Q` REC-02 r2 checkout whose STATUS differs from correction STATUS;
- exact positive correction PR and protected-push event fixtures;
- exact positive REC-02 r2 PR and protected-push event fixtures;
- historical Gate A, raw-frame, scope, topology, workflow-security, ART, and projection negatives remain rejected;
- new correction-route reuse, old-r1 reuse, wrong correction base, direct `P -> REC-02`, and post-REC-02 route reuse negatives are rejected;
- a HEAD-only bundle clone with no tags, alternates, or promisor configuration reports C1, C2, C3, failed REC-02 r1, the ART head/tree/blobs, and the derived functional/combined objects as missing before evaluation;
- the correction and projected REC-02 r2 self-tests pass in that isolated object database; exact failed-head assertions still return their non-reusable dispositions without dereference; exact failed-tree assertions use new placeholder commits and never require the failed tree objects;
- cold correction PR and protected-push evaluators each pass in a fresh process without a self-test warm-up or any wildcard fetch, and the sealed ART record reproduces the exact ART head, tree, 79-path digest, 55-image digest, transformed verifier, combined tree, and combined manifest;
- verifier self-test, full verifier, simulator self-test, and locked random/cheapest/priciest simulations pass wherever invalidated by the policy correction;
- final worktree and index are clean at the exact candidate identity.

## 7. Stop state

Rulesets, bypass actors, protected refs, and required checks remain external merge-time facts and require fresh owner-authenticated readback before any separately authorized protected merge. No omission may be normalized to an empty bypass list.

PRs #26, #27, and #28 remain frozen at their recorded exact heads. PR #30 and its r1 correction branch are frozen at C3 `ec18d093a4d4fe7a79cb8996da0c780e182fe9a1`; no push, synchronization, rerun, edit, retarget, ready transition, closure, or merge is authorized. R5–R7, ART, B2, V4/V5 repairs, gameplay beyond the exact future REC-02 projection, cloud resources, Netlify, tags, releases, deployments, publication, and certification remain outside this correction.

`NO-PUBLISH / NOT CERTIFIED` remains active.

## 8. Next action after a completed local candidate

**Manraj:** after Build seals and clean-clone-validates the exact correction R2 successor, authorize only its new `ticket/0.30.1-rec-ratchet-02-policy-selftest-correction-r2` branch push and creation of exactly one new draft pull request against `recovery/e4f8440-nopub`. PR #30 remains frozen. This grants no ready transition, merge, REC-02 construction, deployment, release, publication, or certification authority. `NO-PUBLISH / NOT CERTIFIED` remains active.
