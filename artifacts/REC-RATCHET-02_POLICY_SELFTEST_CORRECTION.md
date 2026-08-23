# REC-RATCHET-02 — Stage 2 Policy Self-Test Correction

`SOURCE main@792e202 · RUNTIME recovery/e4f8440-nopub@31aca17 · TASK REC-RATCHET-02-POLICY-SELFTEST-CORRECTION-R1 · MODE implementation`

**Acting role:** Build / GPT-Codex

**Authority read:** `AGENTS.md`, `artifacts/ROADMAP.md`, `artifacts/PROJECT_STATUS.md`, `artifacts/LOCKS.md`, `artifacts/REC-RATCHET-02_BASELINE_TRANSITION.md`, both recovery workflows, issue #24’s exact Stage 2 repin, protected PR #29’s merge receipt, and the preserved REC-02 r1 failure.

**Implementation authorization:** Manraj authorized the bounded 0.30.1 completion train and then explicitly authorized Build to perform this repair. Authorization covers local construction and validation of this exact three-path correction only. It grants no push, pull request, ready transition, protected merge, REC-02 activation, certification, or publication authority.

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

C2 passed the policy, projected-r2, verifier, simulator, and governance gates. Final design review placed it on HOLD because its mechanically derived REC-02 r2 STATUS marked the projection activated while retaining `fresh_rec_02_branch` as blocked pending the already-satisfied correction successor. C2 may not be pushed, retried, amended, rebased, reused, or merged. The current C3 candidate is reconstructed directly from `P`, records C1 and C2 as immutable failure evidence, transitions that future field, and adds a regression assertion against the stale blocked state.

## 3. Exact correction scope

Branch: `ticket/0.30.1-rec-ratchet-02-policy-selftest-correction-r1`

Exactly these three regular files may differ from `P`, each at mode `100644`:

1. `artifacts/PROJECT_STATUS.md`
2. `artifacts/REC-RATCHET-02_POLICY_SELFTEST_CORRECTION.md`
3. `scripts/release-policy.mjs`

No workflow, ROADMAP, LOCKS, `AGENTS.md`, active or inactive simulation fixture, verifier, simulator, `src/**`, image, art, CSS, HTML, VERSION, Netlify, deployment, tag, release, publication, or certification byte may change.

## 4. Repair contract

The corrected policy must:

1. Validate historical Gate A from immutable commit `H`, including its exact raw frame, tree, parent, six paths, file identities, historical normalized policy projection, workflow security, inactive projection, ART compatibility, and adversarial negatives. No historical positive fixture may read mutable current-checkout STATUS bytes.
2. Maintain separate historical and active policy projections. Gate A remains bound to `02bd44d5…`; the corrected policy and every later authorized successor are bound to the corrected active projection.
3. Arm one exact self-consuming correction route from `P`: correction candidate `C` is one canonical three-path commit; correction successor `Q` is an exact two-parent merge with ordered parents `[P, C]` and tree equal to `C`.
4. Reject correction squash, rebase, fast-forward substitution, swapped parents, octopus topology, wrong tree, wrong base, wrong branch, fork head, tag event, scope drift, raw-frame drift, content drift, and reuse after `Q`.
5. Arm later REC-02 only on fresh branch `ticket/0.30.1-rec-02-r2`, based on an exact valid `Q`. The old r1 branch, failed r1 head, and every direct `P`-based REC-02 attempt must fail closed.
6. Preserve the original exact ten-path REC-02 activation scope, inactive patch, baseline, scene outputs, verifier output, workflow security, ART compatibility, and `NO-PUBLISH` controls.
7. Mechanically derive the future REC-02 STATUS without reading `ROOT` as historical authority and preserve this correction and failed-r1 disposition in the future STATUS.
8. Consume the REC-02 route after one exact merge and reject repeated-head, repeated-route, and post-consumption events.

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
- verifier self-test, full verifier, simulator self-test, and locked random/cheapest/priciest simulations pass wherever invalidated by the policy correction;
- final worktree and index are clean at the exact candidate identity.

## 7. Stop state

Rulesets, bypass actors, protected refs, and required checks remain external merge-time facts and require fresh owner-authenticated readback before any separately authorized protected merge. No omission may be normalized to an empty bypass list.

PRs #26, #27, and #28 remain frozen at their recorded exact heads. R5–R7, ART, B2, V4/V5 repairs, gameplay beyond the exact future REC-02 projection, cloud resources, Netlify, tags, releases, deployments, publication, and certification remain outside this correction.

`NO-PUBLISH / NOT CERTIFIED` remains active.

## 8. Next action after a completed local candidate

**Manraj:** authorize the newly sealed exact local correction candidate branch to be pushed and exactly one draft pull request to be opened against `recovery/e4f8440-nopub`. This grants no ready transition, merge, REC-02 construction, deployment, release, publication, or certification authority. `NO-PUBLISH / NOT CERTIFIED` remains active.
