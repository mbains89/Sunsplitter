# ART-R2-PUSH-RATCHET-R1-B01 — Exact Raw-Commit Correction

`SOURCE main@792e202 · RUNTIME 2395101 · TASK ART-R2-PUSH-RATCHET-R1-B01 · MODE implementation`

**Acting role:** Build / GPT-Codex, carrying Manraj's explicit 2026-08-21 authorization for this bounded B01 correction.
**Authority read:** `AGENTS.md`; `artifacts/ROADMAP.md`; `artifacts/PROJECT_STATUS.md`; `artifacts/LOCKS.md`; all incorporated recovery records; `artifacts/ART-INTEGRATION-R2_GOVERNANCE_REPIN.md`; `artifacts/ART_RULES.md`; PRs #25, #26, and #27; issue #24 and its comments (none present at preflight); the complete B01 HOLD; both recovery workflows; and `scripts/release-policy.mjs`.
**Implementation authorization:** Exactly this record, `artifacts/PROJECT_STATUS.md`, and `scripts/release-policy.mjs` may change. One deterministic direct-child commit, an exact lease-protected replacement of the existing PR #27 branch, and an update to that draft PR's description are authorized. No new PR, review, ready transition, protected merge, or later-stage work is authorized.
**Commit role:** Governance and fail-closed release-policy repair only. No artwork, runtime, gameplay, fixture, workflow, release, deployment, or repository-administration change.

## 1. Exact authenticated preflight and B01 reproduction

| Object | Exact identity |
|---|---|
| Protected target | `recovery/e4f8440-nopub` |
| Required protected base | `23951012655b0037a55e82c755b66dd4d852f20b` |
| Required base tree | `96829ad0e01619f56bed2121a666645b3f9b5259` |
| Existing precursor PR | #27, open, draft, unmerged |
| Superseded precursor head | `b68bc42fc1a3efd72314c90b01f5aaa66ce2df74` |
| Superseded precursor tree | `b4f141c82ed89c78e260c01acecd1dc2a6c793d0` |
| Held implementation PR | #26, open, draft, unmerged |
| Held ART head | `7fe31675b678d041c980605ed5c5533d3ea22581` |
| Held ART tree | `52551891fe55324bc2fcd073bff56b9a8cd2c061` |
| Certification | `NO-PUBLISH / NOT CERTIFIED` |

The mandatory 2026-08-21 live preflight re-fetched the repository and confirmed every required identity. The remote precursor branch was exactly the superseded head, with one parent equal to the protected base, exactly the three authorized paths, and successful old-head workflow runs `32438073569` and `32438073598`. Authenticated Git transport passed an exact no-op lease-protected dry run. Ruleset `21051662` has no bypass actor and permits the topic-branch replacement while retaining PR, up-to-date-check, protected-force-push, and protected-deletion controls. PR #26 remained unchanged.

The superseded policy read `%B` as UTF-8, normalized CRLF to LF, and stripped all terminal LF bytes before checking message lines. It did not bind the raw author, committer, header set/order, header-message boundary, terminal-LF state, complete payload, or commit object identifier. Consequently these distinct commits were equivalent to the predicate:

- Superseded `b68bc42fc1a3efd72314c90b01f5aaa66ce2df74`: raw payload 755 bytes, SHA-256 `33638b74e5dcc296c0b57535eb58ec20cd0bda37ca341f7cba8122c21a4693da`; framed commit object 766 bytes, SHA-256 `159d8f14dfe757c1bc4cbe302525323aa86be3982b2939199e7e0e2c702f3253`; raw headers 260 bytes, SHA-256 `0c660e20aa9fea2a073058a1a847e4f0e870ab8f1f6ef01f813d269b9cff2099`; raw message 493 bytes, SHA-256 `3be268eea78476ea13aa0b7c4e71b2bf545bff33a34456cc106cac253c155956`, without terminal LF. Author and committer are `Manraj Bains <54219887+mbains89@users.noreply.github.com> 1787276927 -0500`.
- Prohibited alternate `653a71903ac810c1065e171dae90060f07279d85`: same parent, tree, paths, modes, file bytes, and normalized message; raw payload 690 bytes, SHA-256 `f16fb6f2ac10d8d70d009545ce9f389a168b96b40a5f53fa20dec0c5e2b92205`; framed commit object 701 bytes, SHA-256 `6005b2051f42b85161a6be92b9dca27c02d76cd20c6f900819593d69e00a27ad`; raw headers 194 bytes, SHA-256 `7a7e29a5239a34ae1c80ff453023034a947b3ad47d6ccf7dd8cd5045034b3a5a`; raw message 494 bytes, SHA-256 `70f6274b0f29fb3d581e2e31faa2eae3abd2ca9d8611425ae5e1931003ab7c81`, with terminal LF. Author is `Codex <codex@openai.com> 1787275397 +0900`; committer is `Codex <codex@openai.com> 1787275597 +0900`.

This continuation reconstructed the alternate as a real Git object and obtained exactly `653a71903ac810c1065e171dae90060f07279d85`. Before changing the policy, it also created real two-parent successor `01b3cd1666d39aad32b14a528a4a9b0e2703cc32` with ordered parents `[23951012655b0037a55e82c755b66dd4d852f20b, 653a71903ac810c1065e171dae90060f07279d85]` and the same tree. The superseded policy passed both exact pull-request and protected-push event evaluations for that successor, reproducing the same acceptance class as adjudicated successor `587a6db81cad1410fd5800f21c0ec931e896de63`. The particular `587a6db…` object is not present locally or on GitHub and its raw successor metadata was not supplied; successor acceptance depends only on its ordered parents and equal tree, so the real-object reproduction is predicate-equivalent and conclusive.

The ART implementation, 55 approved JPEGs, ART validator, integration record, active REC-01 fixture, workflows, recovery authority, and protected stop state are not defects and remain immutable under this ticket.

## 2. Corrected exact raw-object precursor route

Let:

- **B** be exact protected base `23951012655b0037a55e82c755b66dd4d852f20b`;
- **H** be the corrected, not-yet-adjudicated head of `ticket/art-r2-push-ratchet-r1`; and
- **P** be the future protected precursor merge successor.

The route is valid only when all of the following hold:

1. H is exactly one commit with one parent, B.
2. B..H changes exactly these three regular files and no other path:
   - `artifacts/ART-INTEGRATION-R2_PROTECTED_PUSH_REPAIR.md`;
   - `artifacts/PROJECT_STATUS.md`;
   - `scripts/release-policy.mjs`.
3. H's complete raw commit payload is read as bytes using `git cat-file commit`, never trimmed, normalized, decoded for comparison, or lossy-parsed. It must equal one canonical buffer with this exact raw header set and order: `tree <H tree>`; `parent 23951012655b0037a55e82c755b66dd4d852f20b`; `author Codex <codex@openai.com> 1787299200 -0500`; `committer Codex <codex@openai.com> 1787299260 -0500`; then exactly one blank-line boundary. No encoding, signature, extra parent, duplicated header, reordered header, continuation, or other header is permitted.
4. The raw message begins `ART-R2-PUSH-RATCHET-R1-B01: bind exact raw commit object`, then one blank line, exact `NO-PUBLISH / NOT CERTIFIED`, one blank line, and exactly one manifest entry for each authorized path in the fixed order above. Every entry is `ART-R2-PUSH-RATCHET-R1-File-SHA256: <path>=<recomputed lowercase SHA-256>`. The message ends with exactly one terminal LF. Missing, duplicate, additional, reordered, normalized, or mismatched bytes fail.
5. The policy rebuilds the full Git frame `commit <raw-payload-byte-length>\0` plus the payload, recomputes SHA-1, and requires it to equal H's resolved object identifier. Payload and framed SHA-256 values are retained as external evidence. This binds the complete tree line, parent, raw headers, exact boundary, unnormalized message, terminal LF, framing, and object identity.
6. Under this reviewed predicate, the policy source is self-sealed by a byte-level projection: its one embedded projection-digest field must appear exactly once with the compiled value, that 64-byte value alone is replaced by 64 ASCII zero bytes, and SHA-256 of every projected source byte must equal the embedded digest. A manifest that is self-consistent for any other policy source still fails this exact evaluator. Exact record and STATUS hashes, paths, regular-file modes, immutable governance hashes, the active REC-01 state, workflow bytes, and protected stop state remain required. These checks plus B and the three final blobs uniquely determine H's tree for the reviewed evaluator without creating an impossible literal self-hash cycle. Like every candidate-modified verifier, the policy is not its own external root of trust; the resulting head, tree, and file hashes remain subject to the separately required independent adjudication.
7. A pull-request checkout is exactly a two-parent synthetic merge `[B, H]` whose tree equals H's tree.
8. A protected push is exactly a two-parent merge P with ordered parents `[B, H]` whose tree equals H's tree.
9. The active fixture remains the exact REC-01 baseline and all workflow, recovery-authority, ART-governance, Netlify stop, and NO-PUBLISH bytes remain unchanged.

The resulting exact H and tree are deliberately recorded externally in draft PR #27 after construction. The committed files record the canonical inputs and superseded identity, not a self-referential final SHA. The pull-request route enforces the exact head name `ticket/art-r2-push-ratchet-r1`; the protected-push route binds the exact raw-validated H as ordered second parent without relying on actor or branch-name inference.

The precursor route self-consumes: only a push whose `before` is B may use it. Once P is the protected head, the route cannot accept a second precursor.

## 3. Exact ART reconciliation and protected route

Let:

- **A** be the held ART head `7fe31675b678d041c980605ed5c5533d3ea22581`;
- **P** be the exact structural precursor successor defined above;
- **R** be the subsequently reconciled and independently adjudicated PR #26 head; and
- **M** be a future protected ART merge.

This precursor does not create R or M. A separately authorized reconciliation ticket must merge P into the existing ART branch at A without changing file content, producing R with ordered parents exactly `[A, P]`. The policy then requires:

1. P is the only valid PR base.
2. R has exactly the ordered parents `[A, P]`; an unreconciled A, rebase, squash, cherry-pick, one-parent head, octopus head, swapped parents, or manual resolution tree fails.
3. P..R changes exactly the governed 79 ART-INTEGRATION-R2 paths, including exactly 55 `images/**` paths.
4. A..R changes exactly the precursor's three paths, proving that reconciliation preserves all 79 held ART target bytes while inheriting the policy repair.
5. The complete 79-path content manifest and 55-image content manifest equal the pinned held-head digests.
6. The integration record, ART validator, approved archive facts, tuple manifest, scene mapping, guard/fallback facts, ART verifier, and all 55 approved image bytes equal their pinned held-head values.
7. The recovery authority, REC-RATCHET-01 artifacts, `src/scenes-41.js`, active simulation fixture, workflows, release/deployment stops, and precursor record remain exact.
8. The PR synthetic merge is exactly `[P, R]` with R's tree.
9. A protected ART merge M is exactly `[P, R]` with R's tree.

P's commit SHA contains protected-merge metadata that does not exist when this precursor tree is authored, so this policy does not invent a future literal SHA. It admits only the structural P above. Once the protected merge creates P, the actual PR base/push `before` SHA becomes the exact successor identity and is required verbatim as R's second parent and M's first parent.

The ART route also self-consumes: it accepts only a protected push whose `before` is P. Once M is protected, neither the precursor nor ART route can run again.

## 4. Preserved ART and recovery commitments

- ART implementation changed paths: exactly 79.
- ART image paths: exactly 55, comprising 34 Wave 2 plus 21 Wave 3 plates.
- Canonical 79-path content-manifest SHA-256: `f617b540572839c5915a1ef3bf57ea89c1241dd3eaa0d3fa6cf24a876673ad65`.
- Canonical 55-image content-manifest SHA-256: `1441be78e8d0d95f4cf2cfd9ace72b7e6458aa0ec230336748de6a2b96db7baa`.
- Wave 2 archive SHA-256: `1d1b23afbaeafda3b4f865302ab9f605e8e38780bf94abafa0c5c68ab52bd485`.
- Wave 3 archive SHA-256: `6f1f40886a112fe6b2e0e543690cecce36a522b5daf408b784a21f67821e633f`.
- 55-plate tuple-manifest SHA-256: `269ea586683a89ed163ca558599f7bd776c26dbc3b32e1377787afaba9e68355`.
- Integration-record SHA-256: `d4512affd47ae29e6e8d9e711fd095b8273767de02f7bec06d1d4c5a9a33f29f`.
- ART validator SHA-256: `bed3a5443255510e8201fa896a4db05fbb466da2e13c4d431fae1fe28fdf5141`.
- ART verifier target SHA-256: `654193d383a4fd2e32472c554ba2b85c64d25f2941048a8b4fe936cbc985471f`.
- ART governance record SHA-256: `4151879697d7edcc265daab2073a1cbd3aff261e62338397313b8785a17726b5`.
- ART_RULES SHA-256: `2e4cb5caf80824b5ee980e3282293f5e6c77271755421d3472458a5103cb207b`.
- LOCKS SHA-256: `f8debebc10b4fe69a0e5fee1305a70500e15c8c6fd0beb74c7ab9ba8bffa078e`.
- ROADMAP SHA-256: `5c79b798065c8b9dcae41cc53ba1118a1e5dd934803c310539be3f350b4cbf90`.
- Active REC-01 fixture SHA-256: `0633469f57971b9c00c877a33f9ccb818e53d5a8de8cc787e4ca2a25fdeda7f2`.
- REC-RATCHET-01 transition SHA-256: `e1101102c7c79e2f2d7c12504e74f1fe28037ae199703d1b488c57aa2e329db8`.
- REC-RATCHET-01 inactive baseline SHA-256: `0633469f57971b9c00c877a33f9ccb818e53d5a8de8cc787e4ca2a25fdeda7f2`.
- REC-RATCHET-01 implementation patch SHA-256: `f5c4f2a48f24f0c6c7d6d570d98acc6217156ebcdf3cef5a9224941629f2c438`.
- REC-01 `src/scenes-41.js` SHA-256: `b67563297cb4b4ae89330fe61523d06b1b11c3703bd7c5ba412492e7860fc106`.
- Release-policy workflow SHA-256: `2d0c146aaae977c61cbfa7c96642f99759dfacefb142f053e6d1187c0395dd33`.
- Verify workflow SHA-256: `9a498bbf75ea62b04235fcfffea1c21ec9a768b8cec5416b7a2fb2e593b67ec2`.

The complete 79-path and 55-image content commitments are encoded in `scripts/release-policy.mjs` using the fixed canonical record `mode + NUL + object type + NUL + path + NUL + SHA-256(file bytes) + LF`, sorted by path. Changing the algorithm, delimiter, canonical field order, sorted-path rule, path set, file mode, object type, or any governed byte fails validation.

## 5. Workflow and enforcement topology

Both unchanged workflows check out the exact GitHub event SHA with full history, disabled checkout credentials, read-only contents permission, immutable action pins, and no ref override.

- Pull requests therefore evaluate the candidate policy from GitHub's exact synthetic merge revision.
- Protected pushes therefore evaluate the same policy from the actual protected merge revision.

No workflow edit, ruleset bypass, administrator bypass, protected-branch force push, direct protected-branch push, tag, release, deployment, publication command, secret, or workflow write permission is needed or permitted. This B01 ticket permits only the exact lease-protected replacement of the unprotected precursor topic branch against superseded head `b68bc42fc1a3efd72314c90b01f5aaa66ce2df74`. Ruleset `21051662` continues to require pull requests and the `release-policy`, `verify`, and `simulation-gate` checks with the branch up to date. Ruleset `21051665` continues to block tag creation. These external controls are evidence for program-office adjudication, not facts manufactured by the workflow.

## 6. Stops and next actor

PR #26 remains draft, unmodified, and unmerged under this ticket. REC-RATCHET-02 and REC-02 remain blocked. No artwork, runtime, gameplay, fixture, workflow, ROADMAP, LOCKS, ART_RULES, version, release, Netlify, deployment, publication, production, or administrative surface may change.

The only next actor after this corrected candidate is pushed and its attributable checks pass is **Grok / program office under a new independent exact-head adjudication ticket**: adjudicate the corrected PR #27 candidate against its exact head, tree, parent, raw commit-object evidence, three-path bytes, and CI. This record does not adjudicate the candidate and authorizes no protected merge, PR #26 reconciliation, REC-RATCHET-02, or REC-02 work.

`NO-PUBLISH / NOT CERTIFIED` remains active.
