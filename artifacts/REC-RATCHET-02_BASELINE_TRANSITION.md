# REC-RATCHET-02 — Exact REC-02 Baseline Transition

`SOURCE main@792e202 · RUNTIME 2395101 · TASK REC-RATCHET-02 · MODE implementation`

`certification: NO-PUBLISH / NOT CERTIFIED`

This record is the inactive, exact-byte bridge authorized by Manraj under `TEMP-EXACT-HEAD-RECOVERY-GATE-R2-A`. It does not activate REC-02 gameplay, approve B2, resolve V4/V5, certify a release, authorize a protected merge, or authorize publication.

## Authority and live anchor readback

- Repository: `mbains89/Sunsplitter`.
- Main: `792e202297111d59050e2ea00da0b959c9d1ca75`, tree `271555a8d5eab706e2a21dcb1b7d8399259a8d12`.
- Protected base: `recovery/e4f8440-nopub@23951012655b0037a55e82c755b66dd4d852f20b`, tree `96829ad0e01619f56bed2121a666645b3f9b5259`.
- Issue #24 was repinned once before construction to that protected commit/tree and the exact Stage-A branch/scope. Readback title: `REC-02 / 0.30.1: Eliminate governed zero-exit states (L-021) [GATE A REPINNED]`.
- PR #26 remains open/draft/unmerged/frozen at head `7fe31675b678d041c980605ed5c5533d3ea22581`, tree `52551891fe55324bc2fcd073bff56b9a8cd2c061`.
- PR #27 remains `SUPERSEDED FOR RECOVERY`, open/draft/unmerged/unmodified/frozen at head `34c2a732ccc231118964a006a8e006b60d765807`, tree `9698810cd2c48b81e9d856b75d451c0869e99eaa`.
- PR #28 remains outside scope at head `45937884147950f9bd497e0723701dfe25d37a9d`, tree `36623fa9b09adb696ecf174d33183143269cb9da`.
- Owner-authenticated raw reads at construction returned active ruleset `21051662` for `main` and `recovery/e4f8440-nopub`, pull-request and strict required-check controls, deletion/force-push blocks, and explicit `bypass_actors: []`; tag ruleset `21051665` returned explicit `bypass_actors: []` and creation/deletion/force-push blocks. This snapshot is not merge authority and must be refreshed immediately before every separately authorized protected merge.

## Gate A exact scope

The precursor candidate changes exactly six regular files, all mode `100644`:

1. `.github/workflows/verify.yml`
2. `artifacts/PROJECT_STATUS.md`
3. `artifacts/REC-RATCHET-02_AUTHORIZED_BASELINE.json`
4. `artifacts/REC-RATCHET-02_AUTHORIZED_REC-02.patch.json`
5. `artifacts/REC-RATCHET-02_BASELINE_TRANSITION.md`
6. `scripts/release-policy.mjs`

The active baseline, `scripts/verify.mjs`, simulator, `src/**`, ROADMAP, LOCKS, art, CSS, HTML, version, Netlify, deployment, release, and publication surfaces are unchanged in Gate A.

Pinned Gate A content:

- updated `verify.yml` SHA-256: `7f0047c7de5dd862083fbbd6c7cc56d018700a536f88e2c0904a7de922184cbd`;
- Gate A STATUS SHA-256: `e84a750b32350c0a6cfecfd60c4b1a9b6e44a22f57ed5fdeb9c5afa941d56d33`;
- inactive baseline SHA-256: `048ee211f4708252b8609d475b47d3b6c05e85bd1d8bd1ae9c44f9229b659c20`;
- patch artifact SHA-256: `b9d97f57ef5ab755db2509789ebee2dda129460f7ce6a7934a71e7ebc5b04eb3`;
- reviewed zero-field release-policy projection SHA-256: `02bd44d53b1160a992071de4add1774cd9062f0a1949b9b9985adb301387e4a5`.

The policy projection normalizes only its own `POLICY_PROJECTION_SHA256` and `TRANSITION_SHA256` values to 64 zeroes before hashing. Every other byte is bound.

## Exact inactive REC-02 functional projection

The patch artifact contains a lossless UTF-8, LF-only, binary-capable, full-index, no-renames unified diff for exactly eight files. Embedded diff SHA-256: `b33fdc96c1a5942e1dcd2fdb9d5606ca4222696133302c0ed3ebdd225e9d38fd`; byte length: `23802`; replacement-manifest SHA-256: `b5694ca533f34f3b16f57589c0e5248ddcb7dee105c705c35914d79580f025f9`.

| Path | Input mode / blob / SHA-256 | Output mode / blob / SHA-256 |
|---|---|---|
| `scripts/verify.mjs` | `100644` / `da1d45408ab3d66fe7aded67bbf23ce3ce3be079` / `ba413f6b41d4f0278238f69feea59865e0d3e979b177c76db6b380854afec084` | `100644` / `a4a828d423addf4717164cfbb7f61eca659ae9d7` / `c1258c11e1ac5ef56637a93bcbedb4c81b3d7b45ea15f332f51389e5eeddbe23` |
| `src/scenes-02.js` | `100644` / `165c0041011a393e6facadb1ad921e8dcf6eb9f3` / `893e33b72b6aacbe33033a7d534a970d5efb21426fc3e87ca800baea35fe4904` | `100644` / `311dcde537c53ab68a55ca1591d11b1de803dbef` / `eaf412b6b163bc14cd58e422d43740ba7bb9517350f1bf6512d161f12704491e` |
| `src/scenes-04.js` | `100644` / `4cc3fc7de772b03178c57a0c62b5ba07d0669a05` / `91c04c0ea76ca44fe8238d3a64eca852396dbd3fa771c19365c73399001e106e` | `100644` / `3decedcb7c4991b2b6b3d80e5b75cf109b33c62e` / `58e591755dfdac3585a3fef7ba45633a407950604d826747ebb6237d03324811` |
| `src/scenes-05.js` | `100644` / `c7c0a7003b11ad582734df8041968f20909031c3` / `a89ed7456abab554341c43d1e0cf66a48743a50d3664b0e4a56b6d2fa2b74ac8` | `100644` / `97b1a8eaa0f881a50d160682a9a72102a8ea18dd` / `00f08acfe64bd3be7e9ec43b1f8261e3aa5935bac5f93b931d72ae63e0fca42e` |
| `src/scenes-06.js` | `100644` / `0f50adda0cab59349774648b4168b3bc7eb40eee` / `4aedcb74a442425f893de4db015a4a381081e012ce3b09d0018c57e74f98bca6` | `100644` / `7a66c848e5d6c6faa0e56b38514f1e97c7cbab0d` / `dee29ccd696d03041270150ccdfb0cbfb6eb85192aa76608efd8d41a3cd4d4fc` |
| `src/scenes-13.js` | `100644` / `3c2eaeded652fd1a0118d22d02673106f4564f13` / `6ea4fd158396e0af0192bf47771ff1a04d10aebd2d7a07283f5b5761d4923e5a` | `100644` / `702d2b8bc74db64125850920080d8154015fb801` / `6e0298d539d2a71ddb12c6a211ecdd1ebbb6dc6dde33533d0a726a592df3ffb8` |
| `src/scenes-36.js` | `100644` / `a8e62e61cba04569a80a52e2f1b62ff879a36562` / `566dbb70c62691e50a39cfb1d9fbb3828dff52b8a32204d702d28a42022c8f51` | `100644` / `1d890741bb4a9a74d2fadc25e5754e3bce06ce74` / `7adf950d5955f0144b411bcf2e29b166f384c957b10fac07ea7333b6c93c92cb` |
| `src/scenes-55.js` | `100644` / `fe297fe774479494a986df599a74ccb8a82b0f84` / `32b1b8a57801ccd993f4070acd6e2acf738079b4183f9165697b68473fb648dc` | `100644` / `da65a34d37de7c79936730cd43ce3537c52694cb` / `17f7ddabfa41bcf26b67cbd2fba42983d066c946ba114503f8812956536f7252` |
| active simulation baseline | `100644` / `b4d5be41628d53f106e52e65c3fb4d7e9737549a` / `0633469f57971b9c00c877a33f9ccb818e53d5a8de8cc787e4ca2a25fdeda7f2` | `100644` / `3945a51f5fe811830e786a5bbcb5221466b8baf9` / `048ee211f4708252b8609d475b47d3b6c05e85bd1d8bd1ae9c44f9229b659c20` |

Strict reconstruction from the exact protected base applied every hunk cleanly with `--cached --whitespace=error-all`, no fuzz, no offset, no three-way fallback, no whitespace repair, and no manual resolution. The reconstructed nine-path functional tree is `57e1439741965bf290cd6daf305c551e2f104182`; its sorted `mode blob SHA-256<TAB>path<LF>` manifest SHA-256 is `3f10dbc636fadc942ee17dd6356ff7be023a34a5347c147d2c7631132b0fe48d`.

This tree is functional evidence only. It starts from protected tree `96829ad0e01619f56bed2121a666645b3f9b5259`, substitutes the eight patch outputs and active-baseline output, and deliberately excludes all six Gate A paths plus the later separately authored STATUS transition.

## Governed L-021 behavior and verifier

The projection covers exactly issue #24’s nine governed scenes: `cut_out`, `vent`, `past_leak`, `vault_voice`, `arc_future_1`, `act3_reckoning_heading`, `pregnancy_check`, `custody_possession`, and `custody_thaw`. `custody_hub` is modified only as the upstream gate carrier and has the same mandatory PRE/WRITES/DEATH-DEAD-SPEECH/IMAGE declaration as every other changed scene object.

The projected verifier proves each exact free floor, destination, allowed field set, zero-resource availability, possession route, thaw `embryos>=14` plus `cohesion>=1` threshold and exact downstream payment, and both pregnancy destinations: fresh state to `act3_lethal_elias_order`, living recovered Tomas to `tomas_break`.

- Final verifier against protected-base scene bytes: expected fail, enumerating every governed floor/gate mismatch.
- Final verifier against projected bytes: PASS; 222 scenes; scene-ID SHA-256 `df38e92826aeb58f7d945c7c0f22c1b41e0bfdfc50a1cdb8232f46d5601350ec`; both pregnancy routes covered.
- Projected verifier source SHA-256: `c1258c11e1ac5ef56637a93bcbedb4c81b3d7b45ea15f332f51389e5eeddbe23`.
- Unchanged simulator source SHA-256: `af9e348d7a4ddf8eaa75b3e160c36e73576893f9b193e8118376260740bcd006`.

## Locked simulation evidence

Configuration for each run: seed `20260817`, start `0`, runs `2000`, shard size `500`, max steps `600`, policies `random`, `cheapest`, and `priciest`, recovery gate, and the inactive authorized baseline. Two isolated complete repetitions under pinned Node `v22.16.0` produced byte-identical JSON, each SHA-256 `f2e67e934b18e9dbc6464d9b7d502404b7c7e34b02307bb8056e3e8e94bfc69d`. Normalized-core SHA-256: `c1969e553a03fd80c9ce220a511e3ed6393c9c7b72ef0ca3ab4edb4dcfc78c08`.

Normalization is executable and self-tested in `scripts/release-policy.mjs`: select the exact locked config plus the eleven named summary fields (`runs` through `invariantFingerprints`), key summaries by locked policy, recursively sort every object key while preserving array order, serialize compact JSON, append exactly one LF, and SHA-256 the exact bytes. Each policy digest uses the same canonicalizer over `{config without policies, policy, summary}`. The policy recomputes the core and all three per-policy digests from the inactive baseline and rejects a one-step mutation.

| Policy | Endings / incomplete / errors / step limits | Total steps | V1 | V4 | V5 | Normalized policy SHA-256 |
|---|---:|---:|---:|---:|---:|---|
| random | `2000 / 0 / 0 / 0` | `191502` | `0` | `191` | `160` | `13c043596cd756badc06844d72e0b4575e4470fe2947e5b46a68018230c1e385` |
| cheapest | `2000 / 0 / 0 / 0` | `191908` | `0` | `489` | `3895` | `0eb8095881dadec2f947bf3ebe05139eb7c2b91be75151273171681bd9a6cdcd` |
| priciest | `2000 / 0 / 0 / 0` | `197168` | `0` | `0` | `0` | `38b752e6b7194da98368ef1e11e9389d710e6915859eed4a53d889efd94ef05a` |

V4 fingerprints survive only as `comfort_fuel_cost_not_declared@final_choice` (`random=191`, `cheapest=489`). V5 fingerprints survive as `landfall_without_final_hold@ending_check` (`random=47`, `cheapest=1895`) and `abandoned_course_reported_locked@ending_check` (`random=113`, `cheapest=2000`). No new V4/V5 rule, scene, or fingerprint class appears. V4/V5 are recorded defects, not repaired gates, approved decisions, certification, or release acceptance.

## Mechanical frozen ART-R2 compatibility proof

The external oracle applies exactly four unique, byte-exact verifier transforms—import, self-test, full validation, and success text—and first reproduces the held PR #26 verifier exactly from the protected verifier. No REC-02 scene output intersects PR #26; only `scripts/verify.mjs` overlaps.

- External oracle source SHA-256: `1c08f17d5eb5d1c7bcb613e161f3788136152d366b2b2816dfc927dc8bdb3656`.
- Transform-function source SHA-256: `aedfce193f9fe9ed3ec975b848cea82d2aac70943dad2ea2d628b63ed40c51e7`.
- Protected verifier: blob `da1d45408ab3d66fe7aded67bbf23ce3ce3be079`, SHA-256 `ba413f6b41d4f0278238f69feea59865e0d3e979b177c76db6b380854afec084`.
- REC-02 verifier: blob `a4a828d423addf4717164cfbb7f61eca659ae9d7`, SHA-256 `c1258c11e1ac5ef56637a93bcbedb4c81b3d7b45ea15f332f51389e5eeddbe23`.
- Held PR #26 verifier: blob `b72530bb37fb07916e89c9d51ff7ee69a4ae4897`, SHA-256 `654193d383a4fd2e32472c554ba2b85c64d25f2941048a8b4fe936cbc985471f`.
- Held PR #26: 79 paths; canonical content-manifest SHA-256 `f617b540572839c5915a1ef3bf57ea89c1241dd3eaa0d3fa6cf24a876673ad65`.
- Combined verifier: blob `b1cbd17b732c7c3b8d72d123dbed7874791f5906`, SHA-256 `7d06703e8af22a1aec080ef8453c22ed9238852e1fc5df31fdc67e600ef79440`.
- Combined projection: tree `558a4d6d1fb491d6bd7cd3c07f0482ad6e35a482`, 87 paths, canonical content-manifest SHA-256 `0973fcfeaab8370fd5e7e36ddef089b6f7eedaa4ed386b5e6f2bf3a83c116609`.
- The 55-image content-manifest SHA-256 remains exactly `1441be78e8d0d95f4cf2cfd9ace72b7e6458aa0ec230336748de6a2b96db7baa`.
- Combined exact verifier: PASS, 222 scenes, 55 ART-R2 plates, zero ART warnings, and `NO-PUBLISH / NOT CERTIFIED` retained.

The exact four anchor/payload transforms, recursive content-manifest framing, held-head/path/image checks, combined-tree construction, and negative anchor fixture are embedded in and executed by `scripts/release-policy.mjs`. Its normalized projection binds those executable bytes; the external oracle is an independent reproduction, not the sole source of the claim.

This is compatibility evidence only. PR #26 remains frozen; no art byte is activated or approved for merge by this record.

## B01 exact-object envelope and self-consuming closure

The Gate A ticket head is constrained to one parent `23951012655b0037a55e82c755b66dd4d852f20b`, the exact six paths/modes/content, a fixed author and committer frame, exact header order and boundary, exact title, exact stop token, an ordered `mode blob SHA-256<TAB>path` manifest, one terminal LF, an independently recomputed Git commit object frame, and its exact OID. A Gate A synthetic or protected successor must have ordered parents `[B,H]` and tree exactly `tree(H)`; merge metadata remains platform-generated and is not treated as proof of merge-time control state.

Real-object adversarial fixtures reject terminal-LF, CRLF, boundary, title, stop-token, author, committer, timestamp, timezone, header, signature, parent, tree, manifest, mode, blob, SHA-256, path, self-consistent STATUS/workflow, tag, repository, fork, branch, base, checkout, and route-reuse drift. The workflow security envelope rejects privileged/manual/release/deployment triggers, mutable or unapproved actions, credentials, write permissions, secrets, deployment environments, path/tag filters, failure suppression, `git push`, `gh release/api`, Netlify build/deploy, `npm publish`, and upload commands.

The later structural route is exactly:

- `H`: the exact Gate A direct-child ticket head;
- `P`: one exact two-parent protected merge `[B,H]` with `tree(P)=tree(H)`;
- `R`: one canonical direct child of `P` on `ticket/0.30.1-rec-02-r1`, changing exactly the nine pinned functional outputs plus one separately derived exact STATUS blob;
- `M`: one exact two-parent merge `[P,R]` with `tree(M)=tree(R)`.

The future STATUS is deterministically derived from exact Gate A STATUS by replacing its update date, tested runtime, governed successor, milestone, ticket, state, branch, dispatch SHA/tree, projection state, active-baseline identity, active scope, two stage-specific blockers, and next action while retaining all NO-PUBLISH controls. `R` must equal the mechanically projected tree, exact output identities, canonical raw frame, and exact ten-path manifest; full verifier and all locked simulations rerun at `R`. After `M`, neither `B` nor exact `P` is the protected before-state, so the route rejects reuse. No generic next route, B2 choice, V4/V5 repair, unknown byte, art activation, or publication route is pre-approved.

## Stop state

- Reviewer PASS can establish eligibility only; it grants no merge.
- A fresh privileged raw ruleset read proving explicit `bypass_actors: []`, exact protected ref/head/tree readback, required-check success, and a separate owner protected-merge authorization remain mandatory immediately before merge.
- REC-02 activation remains blocked until Gate A is independently reviewed, separately authorized, merged, receipted, and issue #24 is repinned once to that exact protected successor.
- PRs #26 and #27 remain frozen. PR #28 and R5–R7 remain outside scope/frozen.
- No deploy, Netlify action, tag, GitHub Release, publication, monetization, certification, rerun, repair push, second candidate push, force push, bypass, PR closure, ready transition, or cleanup is authorized.

`NO-PUBLISH / NOT CERTIFIED` remains active.
