# REC-RATCHET-02 — C10 Immutable-Fixture Policy Successor

`SOURCE main@792e202 · RUNTIME 31642c3 · TASK REC-RATCHET-02-POLICY-SELFTEST-CORRECTION-R8-C10 · MODE implementation`

**Acting role:** Build / GPT-Codex

**Files read:** exact `main@792e202` copies of `AGENTS.md`, `artifacts/ROADMAP.md`, `artifacts/PROJECT_STATUS.md`, and `artifacts/LOCKS.md`; exact protected successor `Q=31642c3` copies of `artifacts/PROJECT_STATUS.md`, `artifacts/REC-RATCHET-02_POLICY_SELFTEST_CORRECTION.md`, both recovery workflows, `scripts/release-policy.mjs`, and the REC-02 projection artifacts; exact C9 head and protected-merge objects; the preserved unfrozen REC-02 r2 pre-freeze receipt; frozen PR #30/#31/#33/#34 state; Fable 5 and Grok advisory findings; and the independent C10 policy, evidence, and governance design audits.

**Implementation authorization:** Manraj's active continuous goal authorizes one fresh authority-compliant C10 successor, including isolated local construction, repair before identity freeze, validation, one non-protected branch push, and one draft PR after complete local PASS. It does not authorize reuse or modification of any frozen identity, the consumed C9 route, the preserved unfrozen Q-based r2 candidate, a ready transition, protected merge, issue repin, REC-02 activation, deployment, publication, release, tag, certification, or production activation.

**Certification:** `NO-PUBLISH / NOT CERTIFIED`

## 1. Exact protected base and landed precursor

- Protected branch: `recovery/e4f8440-nopub`
- C10 base and sole candidate parent `Q`: `31642c3644a58e9f5fc007bff648dc6146dabcfb`
- Base tree: `103a4ccf5c1511d225d67870e6fb87e64b992de4`
- Base raw payload SHA-256: `41b8269ef543b5177430ac5e9bd1aeba07f1a4b0f40bd83d96435326e67a9322`
- Base ordered parents: `[31aca17b807c4dc8edef3683e30d5fefdd47ad7a, f6b8e050717a6b9420bd3ec2dae0d65abcc57427]`
- Landed C9 head: `f6b8e050717a6b9420bd3ec2dae0d65abcc57427`
- Landed C9 head tree: `103a4ccf5c1511d225d67870e6fb87e64b992de4`
- Landed C9 sole parent: `31aca17b807c4dc8edef3683e30d5fefdd47ad7a`
- Landed C9 raw payload length: `825` bytes
- Landed C9 raw payload SHA-256: `1dea7f018883c68ef1368950ad7ac1ec7ac787ebbe8c53a86d71e5930ca8390b`
- Landed C9 three-path manifest SHA-256: `ae2e4309600269afc3ef9a81ce9eec0e9b0c02e7caed6feebbf76769f98a98fd`
- Landed C9 normalized policy projection: `6e44343fc7f892494c4477991b2a11e0f150215ae2a9bf955508a225a3014f27`
- Gate A protected successor `P`: `31aca17b807c4dc8edef3683e30d5fefdd47ad7a`
- Gate A successor tree: `f458b021bc9a9a36cb28c24fd7dee165c2bbaac5`
- Gate A head: `f23c4bed1555c7ad6bcb3b42ca5c6ea3a92e37ab`
- Gate A head tree: `f458b021bc9a9a36cb28c24fd7dee165c2bbaac5`
- Gate A raw payload SHA-256: `4835344d32a516c8d68df1c8d18f51313297f04c7de2ac5ce4628c356fb36376`
- Gate A ordered merge parents: `[23951012655b0037a55e82c755b66dd4d852f20b, f23c4bed1555c7ad6bcb3b42ca5c6ea3a92e37ab]`
- Historical Gate A policy projection: `02bd44d53b1160a992071de4add1774cd9062f0a1949b9b9985adb301387e4a5`

PR #29 landed Gate A exactly and PR #35 landed C9 exactly at `Q`. This record does not revoke, rewrite, or reinterpret either protected merge. C9's r7 route and merge authorization are consumed. C10 repairs only the later self-test's historical-fixture source and successor routing while keeping Gate A, C9, and Q immutable.

Exact C9/Q closure receipt:

- PR #35 synthetic merge: `a3fa43fe01910ddbc6d4b6ce6f5d84be1e9e5e57`; merged `2026-08-24T01:13:24Z`.
- PR-attributable CI: Recovery Release Policy #52 run `32676047856` SUCCESS; Recovery Verify #62 run `32676047846` SUCCESS.
- Protected successor `Q` raw payload: `1,262` bytes; SHA-256 `41b8269ef543b5177430ac5e9bd1aeba07f1a4b0f40bd83d96435326e67a9322`.
- Protected-push CI: Recovery Release Policy #54 run `32679102742`, job `97292489797`, SUCCESS; Recovery Verify #64 run `32679102689`, jobs priciest `97292489624`, verify `97292489681`, random `97292489692`, cheapest `97292489761`, and simulation-gate `97292916932`, all SUCCESS. Random, cheapest, and priciest each ran 2,000 simulations at seed `20260817`, 6,000 total.
- Issue #24 exact-Q repin: updated `2026-08-24T01:43:09Z`; title 80 bytes / SHA-256 `3b0d8db069be8f45eb44d6a1ad0bf1e443d82f66bfab50fa3bf12752a2afad1c`; body 21,564 bytes / SHA-256 `ab26a5dec4c630d9a390276b1721ad5129aa41bc68f1c2eb681974e6c7314788`; exact post-write equality PASS; zero comments.

## 2. Frozen failed identities

All nine entries share parent `P` and are permanently unmerged and non-reusable. Equivalent trees, successful gameplay checks, green CI, or later diagnostic reruns do not restore eligibility.

| Label | Head | Tree | Manifest SHA-256 | Raw payload SHA-256 | Active projection | Terminal disposition |
|---|---|---|---|---|---|---|
| REC-02 r1 | `bd293bbe9fa9ed55eb0620bf85ef0a1316b2524e` | `34fa0adbfb027e01448a1a0771c8ff5af3997e26` | `de647dda0cf7b36290126489a342732d2022eee0816f220993b3f3d6c6478315` | `ec41001c92a8d96e6913615dcd6fa82d108e0d91cd0c0135ecce9bdfad81d80a` | n/a | FAILED REQUIRED GATE / LOCAL ONLY / UNPUSHED / NON-REUSABLE |
| C1 | `b12ff37ef9153a509827d914b825dd51ec6de0ca` | `14dcaa3fb6a92349b6bebf06a606d356456859e8` | `0d43560c72b994981e0dc5232156abfbbe99884ee0677ea469455a8fa79b34e7` | `cca58ea7ae7576af6dac9bf081c8a9723ae697a15112facae2734273aba72f78` | `986182e1d58019a20f75f0b66211bb2f1746e9066e1fefa8aa619bb0d507619f` | FAILED REQUIRED REVIEW / LOCAL ONLY / UNPUSHED / NON-REUSABLE |
| C2 | `5c3b526d287d888bc3e0765569e6632ec5f6e0e6` | `dc1e677d66c35873ac040c598e33b39c05c78e54` | `d102608126737abcc8ae739d952b17e656a805373d186aacf53b232e8175b56e` | `efb805938179bd721cff84bc0b947cb2e2741065dfa194ad6a4ee6d49cf41652` | `fc7905cc051b12a7ec8410a046d48ae480b1e987504fc15c37e90d5e2a77a5d9` | FAILED REQUIRED REVIEW / LOCAL ONLY / UNPUSHED / NON-REUSABLE |
| C3 | `ec18d093a4d4fe7a79cb8996da0c780e182fe9a1` | `a1c00d7ab971efd81d4544577150fa54e618f89d` | `555b0340fa1f473dc86eab30a6a2b51a93a20564eba410e889bb7eec390b3e4a` | `b36e2c87b8f728e57411d8d0c3e3a5ec43ba120ae8efe326f95af25ba29da17f` | `123633dcc49d4bf45650a700a2d539af03a4a95f14fa24a5140f92d9caef97da` | FAILED REQUIRED CI / REMOTE BRANCH FROZEN / DRAFT PR #30 FROZEN / UNMERGED / NON-REUSABLE |
| C4 | `6441d5f7ad5df5870dbddcabce6243c3d23d09ca` | `f0f12d10bc406c320a1c9324249ee4f2d17332e5` | `b418beff175878ed66906f1690d42978725ff2f9c04901dca5d3ae87913ecf4a` | `209a98ac29d30138ab684e203ab0c4d60f6b5ca872c969da226dcd8803c3d2fb` | `c326aef49b156f624fb67b9e6e6fa0eab1cf86f987bffcdad9ec355f811d2206` | FAILED REQUIRED INDEPENDENT ADJUDICATION / REMOTE BRANCH FROZEN / DRAFT PR #31 FROZEN / UNMERGED / NON-REUSABLE |
| C5 | `111f80a5a45ab637504cdd6c09581848b90e09f9` | `5727b34d002ecc8dc8e36fdef9ff575e3fd10c3d` | `2554a2ad4d3dc0764974a460553ebc357e543443102cb0f22bcbda58b1be0cd5` | `e3eacd91beae3593dcb28d0b6d1eafda4dc151763237d3b746d0562bb4a4ab7d` | `251ee05cca779cfc2682692bb2be4d27288f4faf1f6aa37e3948479d0ba84b63` | FAILED REQUIRED CLEAN-ROOM CHECK / LOCAL ONLY / UNPUSHED / NON-REUSABLE |
| C6 | `fb16fe160a416fc4a638c2ea7dcae83361c88764` | `7dec1712c000578da6c1ec92b0e7ac8ff8f081bb` | `edc486bac29272ab1c02923d392a96cd14ddb38e3a4552d42e6050a42133e9e9` | `b82ce035722897c2636ad5035ba28eb35c288b3b1da339d01832bfa7b2627715` | `631de6f352e5f71d0cc1d86bfa4834642351a6a903f491ce355ebcc5eacbd591` | FAILED REQUIRED INDEPENDENT CLEAN-ROOM VERIFICATION / REMOTE BRANCH FROZEN / DRAFT PR #33 FROZEN / UNMERGED / NON-REUSABLE |
| C7 | `37bba2712193a1ce9e7108b8ff9826230c69e680` | `9332457ef5c6ebeb44eb0aa9d8c0673e10470de2` | `a730c1e1e7367202d0eafd43ddfecf8c11978d2ef99dad8bd493cc9941d08a5b` | `bfb24d674004cd74ecc763b4ac0c334217adbe6f898502c2c7cad4e6d4a80428` | `99aff87b463f3727002afe1929ac6b7ba303f366f77a77eaada386e87d06f484` | FAILED REQUIRED CLEAN-CLONE A CANDIDATE-STORE CHECK / LOCAL ONLY / UNPUSHED / NO PR / PERMANENTLY FROZEN / NON-REUSABLE |
| C8 | `c469a1a4220686f62b3934289b0add56bbdcfc5d` | `973abf4822ed040a4c98ab746efe1f8da875fb16` | `759c571c130c8511d15f1119112914325ee04d2483cc443178b45c889052be65` | `18bff7da485028b100ce8116c63a1140f48fed38df5dce0098788becf225c95f` | `556eb26e95be2341512cdbc37f6184740384d0a3d93257aed4a12156d5451e60` | FAILED REQUIRED INDEPENDENT RECEIPT CAPTURE / REMOTE BRANCH FROZEN / DRAFT PR #34 FROZEN / UNMERGED / PERMANENTLY FROZEN / NON-REUSABLE |

Independent parent reconciliation used raw commit-object readback for REC-02 r1, C1–C4, and C6–C8. Each object has the recorded tree, recorded raw-payload SHA-256, and exactly one parent: `P=31aca17b807c4dc8edef3683e30d5fefdd47ad7a`. C5 is intentionally absent from the current object store; its contemporaneous 819-byte raw-frame receipt records head `111f80a5a45ab637504cdd6c09581848b90e09f9`, tree `5727b34d002ecc8dc8e36fdef9ff575e3fd10c3d`, sole parent `P`, and raw SHA-256 `e3eacd91beae3593dcb28d0b6d1eafda4dc151763237d3b746d0562bb4a4ab7d`. C5 was not reconstructed or reinserted.

### Historical failure receipts

- REC-02 r1 failed the mandatory policy self-test with `artifacts/PROJECT_STATUS.md: candidate SHA-256 drifted`; the historical Gate A fixture had read mutable current-checkout STATUS bytes.
- C1's next action required attributable CI while its own authority prohibited the branch push and draft PR needed to create CI.
- C2's mechanically projected REC-02 STATUS simultaneously said activated and blocked on the already-satisfied correction predecessor.
- C3's GitHub clean checkout lacked never-pushed C1/C2 objects; the evaluator attempted dereference before the pinned failure check. PR #30 synthetic merge `721a94ca10cdde235e558514b29131bd5644ba98`; Recovery Release Policy #48 run `32613327167`, release-policy job `97129767639` FAILURE; Recovery Verify #58 run `32613327212` SUCCESS: random `97129767728`, priciest `97129767832`, verify `97129767835`, cheapest `97129767840`, simulation-gate `97130082900`.
- C4 still invoked Git on exact failed heads before returning its pinned error. PR #31 synthetic merge `bfea3326bcb2b18431c7d10fcb1f59f89b4b8235`; Recovery Release Policy #49 run `32615874248`, release-policy `97136388344` SUCCESS; Recovery Verify #59 run `32615874238` SUCCESS: random `97136388297`, cheapest `97136388349`, verify `97136388352`, priciest `97136388419`, simulation-gate `97136711468`. Independent adjudication held it at `https://github.com/mbains89/Sunsplitter/pull/31#issuecomment-5384470876`.
- C5's first clean-room helper parsed a source-literal separator incorrectly and exited `1` with `Error: ART blob count 0` before any object probe. Its r3 reservation was consumed but never created.
- C6's independent parser exited `1` with `Error: sealed manifest source not found` before proving absence. PR #33 synthetic merge `87093fc887275f3473a88a8ff549fa93c74f34b5`; Recovery Release Policy #50 run `32649075334`, release-policy `97217749298` SUCCESS; Recovery Verify #60 run `32649075335` SUCCESS: verify `97217749348`, priciest `97217749404`, random `97217749438`, cheapest `97217749484`, simulation-gate `97218162899`. It remained terminal.
- C7's launcher ran the builder-worktree script and supplied clone A only as an ignored positional argument. It exited `1` with `FAIL release-policy crash: Error: candidate-only checkout .git entry is not a direct directory` before any forbidden-object batch probe. Its r5 branch is local-only, never pushed, and must not be pushed.
- C7 supporting identities: local synthetic fixture `80cd3ed0bfc4b024ce03b9b99fa5f5eeac265de8`; canonical inventory 4491 bytes / 99 OIDs / SHA-256 `0b7e1eb2fe20c4e90175f9533f3186a63880bc16f60fafad0ee3a09f65e0be87`; `artifacts/PROJECT_STATUS.md` blob `4a1a94f6895448c08db2e748bb827d6acd2c4d77` / SHA-256 `a28195d14261cba103880c52bae6886c70023cb9290979e6e0917fed198d3df7` / 29683 bytes; correction-record blob `d158c6eefb3f937cb113cc26bfd9b12c1446df7d` / SHA-256 `2e742d5102a2934211238e2a3cdd8814f046c8fed1b8905b8ea78f96a769e318` / 26027 bytes; policy blob `8584c19e531135730c1f8b18e664ada2a2cb4898` / SHA-256 `969c9e2caeef389f8739ba511f6c352cc705f94ab863c1a8760a855acaa82906` / 159072 bytes; Node.js v22.16.0; exit 1; zero forbidden-object batch probes.

## 3. C8 immutable evidence and terminal receipt

C8 was a direct child of `P`, with an 818-byte raw commit payload. Its exact three mode-`100644` files were:

| Path | Blob | SHA-256 | Bytes |
|---|---|---|---:|
| `artifacts/PROJECT_STATUS.md` | `6c04afcc1db75b8a58e0555df59ffffa306bb286` | `34c36fe0e7a0e5173089cf44ae02fba16a5fad6f6d99d86096d67a0f12f12c9a` | 34,024 |
| `artifacts/REC-RATCHET-02_POLICY_SELFTEST_CORRECTION.md` | `5ea5e6341fa4b1549d34b62a6731b255b53ca0a0` | `07084e5f3aec1392ff550e7f562146381b9ceb91c35f447f746b836549b57451` | 30,811 |
| `scripts/release-policy.mjs` | `c30160ad05bda95d26ecc6fdba8f9f5bd88c4460` | `369129e82b7cbdb76d61bc0e77843c75b6eba1534e9d402d58900cadf9e9fcea` | 160,946 |

Remote evidence:

- Branch: `ticket/0.30.1-rec-ratchet-02-policy-selftest-correction-r6`
- Draft PR: #34, open / draft / unmerged / frozen
- Synthetic merge: `de667c81df776fc661ea32bb458c516d1eeae641`
- Policy #51: run `32663955819`, job `97254343270`, success
- Verify #61: run `32663955834`, success; priciest `97254343327`, random `97254343354`, cheapest `97254343381`, verify `97254343421`, simulation-gate `97254762690`
- Locked workload: seed `20260817`; random, cheapest, and priciest at 2,000 runs each; 6,000 total
- Independent candidate bundle: 45,057,671 bytes; SHA-256 `015ef68d5c8ff551e07abcd2572874c32af31f3bf9b808c92a50e149734b6b45`

The primary identity lane ran the first required inventory command. The subprocess returned into `r`; before its exit or stdout was stored, the wrapper attempted to encode `r.output` with a global unavailable in the orchestration runtime and failed exactly:

```text
Script failed
Wall time 0.1 seconds

Script error:
ReferenceError: TextEncoder is not defined
    at exec_main.mjs:5:13
```

The primary lane did not rerun. Because exit and stdout were not preserved, neither success nor failure of that first required command can be proven.

A separate policy lane independently lost its first receipt at `exec_main.mjs:7:13`, then improperly invoked the same required inventory again. The later inventory, same-store check, and self-test passed, but they are diagnostic only. They do not cure the missing first receipt and cannot make C8 reusable.

The exact secondary wrapper error was `ReferenceError: TextEncoder is not defined at exec_main.mjs:7:13`. Its later diagnostic-only receipts were: inventory 4578 bytes / 101 OIDs / SHA-256 `9d94fbedabcc29951800d84a47d65d0bd209b30640e2805687f8e956ff2ea9a5`; sealed ART manifest 10863 bytes / SHA-256 `a3bb3dc47bf7302de03d8b057637ecdbcd852b1e2e7d2034b098a3e55358a073`; store receipt `{"absent":101,"controlsPresent":6,"head":"c469a1a4220686f62b3934289b0add56bbdcfc5d","inventorySha256":"9d94fbedabcc29951800d84a47d65d0bd209b30640e2805687f8e956ff2ea9a5","result":"PASS","schemaVersion":1}`; self-test PASS with 144 zero-Git rejected-head checks, 86 historical raw-frame fixtures, and 98 structured adversarial fixtures. All are non-curative.

After C8 was frozen, a C9 read-only harness-audit subagent mistakenly invoked C8 `--forbidden-object-inventory` once while inspecting. No file, ref, branch, PR, workflow, or remote state changed; the output was discarded. This was another prohibited same-identity invocation, is non-curative, and authorizes no further C8 execution.

C8's branch, PR #34, head, tree, manifest, raw payload, policy projection, synthetic merge, bundle, CI, and later diagnostic results are frozen. Do not rerun, repair, amend, rebase, cherry-pick, copy as a candidate, synchronize, push again, edit the PR, retarget, mark ready, close, merge, or otherwise reuse that identity.

## 4. Landed C9/Q evidence and C10 exact scope

C9 is immutable and independently bound to exact objects rather than reconstructed from the current worktree:

| Path | Blob | SHA-256 | Bytes |
|---|---|---|---:|
| `artifacts/PROJECT_STATUS.md` | `5868e2274a5b50758427b5eaf6ef15a1a06921fa` | `de79c8c97ff7ae05480f2413e0dd31380ec2f320c2e29cb532ffdfbd2b7f7dee` | 18,976 |
| `artifacts/REC-RATCHET-02_POLICY_SELFTEST_CORRECTION.md` | `0e1586df61b2af7de466b8adc8b1f2362adf47d7` | `ff08839196539a7f84a88e2c275c9e82dd9e491d01a25903350bbb5d64daf75f` | 28,306 |
| `scripts/release-policy.mjs` | `339a829105d4b322a37983d94e0ae90974782452` | `a22481cd73bb23ac9a16b82f04b69d716d59f8a92b044cd5bf1e71d1e3ef44ab` | 160,021 |

The historical C9 fixture must resolve the exact head, tree, sole parent `P`, raw payload, three-path manifest, file identities, and normalized projection above. The historical protected successor must resolve exact `Q`, tree, raw payload, and ordered parents `[P,C9]`. Supplying `P`, current `HEAD`, mutable worktree STATUS, an alternate equivalent tree, or any other source must fail closed.

Retired/frozen correction branches are r1 through r6. The landed r7 branch is consumed and non-reusable. The only newly armed branch is:

`ticket/0.30.1-rec-ratchet-02-policy-selftest-correction-r8`

Exactly these three regular mode-`100644` files may differ from `Q`:

1. `artifacts/PROJECT_STATUS.md`
2. `artifacts/REC-RATCHET-02_POLICY_SELFTEST_CORRECTION.md`
3. `scripts/release-policy.mjs`

No workflow, ROADMAP, LOCKS, AGENTS, gameplay, simulator, verifier, baseline, image, art, CSS, HTML, VERSION, Netlify, ruleset, App/evaluator, deployment, tag, release, publication, or certification byte may change.

The only C10 topology eligible for later recognition is:

`Q=31642c3 -> C10=one exact three-path direct child -> S=one exact protected merge with ordered parents [Q,C10] and tree equal to C10`

After a separately authorized exact protected merge `S`, issue #24 must be repinned to exact `S` under separate owner authorization before any REC-02 r2 reconstruction. The preserved Q-based r2 bytes remain unfrozen, uncommitted, unpushed, and non-authoritative; they may not be committed or reused after `S` exists.

No prospective C10 head, tree, three-path manifest, raw payload, bundle, synthetic merge, PR, or CI identity is embedded in C10's own files. The active normalized policy projection and exact document identities are bound only after both documents stabilize; all remaining identities are derived afterward.

### Preserved REC-02 r2 pre-freeze HOLD

The earlier Q-based r2 work never became a candidate identity. Its exact preserved projection receipt is:

- ten-path tree: `0970dc606b63a84dd38ab46541b2a359ef95674f`;
- STATUS blob: `742ae69f94bdac92cd4ccce8267508ef0693c62a`; SHA-256 `9cb1f4b42f9e8393f96f176fd0252682616afca09f8adfa9f9044a7575122aa6`; 18,008 bytes;
- canonical manifest: 1,351 bytes; SHA-256 `469f6f5683acdeb8d34a81112c71d2409344032504335bef6e956dd6149680de`;
- prospective raw frame: 1,712 bytes; SHA-256 `15f8128f63145990f0323622744f54b0c23f994b4bfb2e4aead667351c133bd9`;
- prospective OID: `f5ab37d4845156d7b80678e4492d5fdece1c4458`, proven absent from the object store;
- local `ticket/0.30.1-rec-02-r2` remained at `Q`; its origin ref was absent; no PR existed;
- static fail-closed determination before invocation: the mandatory policy self-test was not invoked because the historical C9 fixture consumed mutable r2 STATUS, and its expected error was `artifacts/PROJECT_STATUS.md: policy correction identity drifted`;
- two diagnostic-only verifier/simulation repetitions passed with exact stdout SHA-256 `f2e67e934b18e9dbc6464d9b7d502404b7c7e34b02307bb8056e3e8e94bfc69d` and normalized core `c1969e553a03fd80c9ce220a511e3ed6393c9c7b72ef0ca3ab4edb4dcfc78c08`.

The static fail-closed determination supplied no candidate PASS and was not used to freeze, commit, push, or create a PR. This is an unfrozen static HOLD, not a terminal frozen identity. Once a later exact C10 successor `S` exists, these Q-based projected bytes and prospective frame are non-authoritative and may not be reused.

### Prospective C10 canonical commit frame

- branch: `ticket/0.30.1-rec-ratchet-02-policy-selftest-correction-r8`;
- title: `REC-RATCHET-02: seal immutable correction fixtures`;
- sole parent: `Q=31642c3644a58e9f5fc007bff648dc6146dabcfb`;
- author and committer: `Sunsplitter Recovery Build <noreply@openai.com> 1787965200 -0500`;
- exactly three sorted mode-`100644` paths: `artifacts/PROJECT_STATUS.md`, `artifacts/REC-RATCHET-02_POLICY_SELFTEST_CORRECTION.md`, and `scripts/release-policy.mjs`;
- one terminal LF in the commit message; no signature, extra headers, extra parents, or embedded prospective OID/tree.

## 5. Repair contract

C10 must:

1. Validate immutable Gate A, landed C9, and protected successor Q from their exact commit objects and exact file identities; never reconstruct historical Gate A or C9 from mutable current-worktree STATUS.
2. Keep the historical Gate A projection `02bd44d5…`, historical C9 projection `6e44343f…`, and active C10 projection distinct.
3. Reject REC-02 r1 and C1–C8 heads as the first semantic operation after input normalization, before any Git command, object lookup, cache, base check, diff, tree, path, or blob access, through correction and future routes. Reject their registered trees immediately after commit framing and before any candidate path/blob access. Reject the consumed r7/C9 branch and any Q-direct REC-02 route.
4. Seal the exact ART raw frame and sorted 79-record identity manifest. Reproduce its 10,863-byte manifest SHA-256 `a3bb3dc47bf7302de03d8b057637ecdbcd852b1e2e7d2034b098a3e55358a073`, 55-image digest `1441be78e8d0d95f4cf2cfd9ace72b7e6458aa0ec230336748de6a2b96db7baa`, verifier transform, combined tree, and combined manifest without dereferencing PR #26 objects.
5. Expose committed `--forbidden-object-inventory` and `--check-candidate-only-object-store` modes. Inventory generation makes zero Git calls and reads evaluated constants, not source parsing. The canonical inventory has exactly 103 sorted unique OIDs: 18 failed head/tree objects, 2 ART roots, 79 sealed ART blobs, and 4 derived objects; 4,664 bytes; SHA-256 `d6361bf849be1e2721c1871d84c1f8f569348edc401e08650ca6550bcc5d62d8`.
6. Emit a schema-version-2 store receipt only after rejecting unsafe repository shape, refs/tags/remotes/pseudorefs, alternates, shallow/common/promisor/partial-clone state, unsafe Git environment and configuration, every `extensions.*` and `fsck.*` override, include directives, and any `config.worktree` file. Enumerate every stored object and every object reachable from `HEAD`, require exact sorted-set equality with no unrelated unreachable or missing reachable object, record canonical type counts and inventory digest, and require strict fsck status `0` with empty stdout and stderr. Missing controls, inventory drift, any forbidden object, or any unrelated unreachable object fails closed.
7. Arm only one self-consuming correction route on r8 from exact `Q` and later only one fresh self-consuming REC-02 route on `ticket/0.30.1-rec-02-r2` from an exact valid `S`. Direct `Q -> REC-02`, old r1, consumed r7, repeated, wrong-base, wrong-tree, wrong-topology, frozen-branch, fork, tag, and post-consumption routes fail closed.
8. Mechanically derive C10 STATUS from exact Q's immutable C9 STATUS, reading only the staged current correction record and policy for the C10 fixture. Mechanically derive future REC-02 STATUS from exact `S`, preserving this record and all nine frozen dispositions while changing active state from correction to REC-02 r2.
9. Preserve workflow security, exact ten-path REC-02 projection, inactive baseline, verifier and seven scene outputs, NO-PUBLISH controls, and locked simulations.

The C8→C9 structured-fixture delta remains immutable at `98→101`: one r6 frozen-branch rejection and two C8-tree framing-only rejections. The C9→C10 delta is exactly `101→104`: one compound three-path worktree-poison exclusion, wrong immutable C9/Q source rejection, and consumed r7/C9 branch rejection. The Q-direct REC-02 fixture replaces the earlier P-direct fixture and adds no count. The final self-test must therefore report 162 zero-Git rejected-head checks, 86 historical raw-frame fixtures, and 104 structured adversarial fixtures. The candidate-only store requires nine unique controls: the six historical Gate A controls plus the C9 head commit, Q commit, and shared C9/Q tree; the forbidden inventory remains 103 objects. Receipt loss, improper same-identity reinvocation, and accidental frozen audit execution remain separate runner-layer controls and are not silently counted as policy fixtures.

## 6. Receipt-capture and launcher preflight

The C9 external session and launcher identities are complete and consumed. They are historical evidence only and must not be copied as a production receipt or invoked for C10. Before any C10 identity freeze, a fresh external pinned-Node runner was validated with disposable stubs and temporary repositories from an unrelated caller directory. The exact C10 bindings are:

- runner: `/private/tmp/sunsplitter-c10-runner/c10-receipt-runner.mjs`;
- disposable preflight test: `/private/tmp/sunsplitter-c10-runner/c10-receipt-runner.test.mjs`;
- canonical post-freeze session manifest: `/private/tmp/sunsplitter-c10-runner/session/manifest.json`;
- pinned runtime: `/Users/manra/From the Ashes/Tools/Node 22.16.0/node-v22.16.0-darwin-arm64/bin/node`, Node.js `v22.16.0`.

For every launched candidate command it must:

- resolve the candidate clone and clone-local absolute `scripts/release-policy.mjs` path;
- set child `cwd` to the clone's physical path and reject a symlinked or indirect `.git` entry;
- construct a minimal environment and remove unsafe `GIT_*` variables;
- bind immutable canonical manifest bytes, fixed absolute paths, exact runner identity, exact C10 topology `Q→C10→S→REC-02 r2`, and the fixed `A01` through `B11` state order before setup or spawn;
- create exclusive stdout, stderr, and status files before spawning;
- write and sync the numeric exit status before parsing, hashing, JSON decoding, or formatting output;
- hash raw stored bytes using built-in Node crypto only after storage succeeds;
- atomically emit one canonical receipt JSON that names the command, cwd, script, exit, byte counts, and SHA-256 digests;
- prevent C7's wrong-working-directory class by deriving and validating the physical clone `cwd` and clone-local script identity; reproduce C8's unavailable-global failure in a negative control without risking a candidate result.

The runner must reject a copied or alternate launcher before canonical-session writes. It must reject any of the nine frozen heads or trees, the consumed C9/r7 identity in an active C10 position, and the preserved unfrozen Q-based r2 projection in any candidate/future identity position before Git access, setup, or child spawn. Its disposable test must prove that no `started.json`, bundle, clone, state, or child output is created for those negatives. Transition checks must require exact clean `C10→S` before B08, exact clean `S→REC-02 r2` before B10, and exact clean restoration to `C10` after B11.

After identity freeze, the orchestration wrapper may only invoke that runner and relay its already-stored output. It must not use `TextEncoder`, orchestration-only globals, ad-hoc hashing, `store`, or JSON parsing as a prerequisite to preserving the child result.

The exact C9 pre-identity external runner receipt remains preserved and consumed:

- runner: 49,497 bytes; SHA-256 `adaf2e02f90a1b1d5ee1ea59472d813191a1904c39c83339682eff04af3382c5`;
- disposable preflight test: 36,049 bytes; SHA-256 `8bdf486ab8c80165037b57d59cebd1ef3c46d8c24a8eb91377c3e2e230f156da`;
- pinned Node.js `v22.16.0` syntax and full disposable preflight: PASS;
- independent runner re-audit: PASS on those exact hashes with no remaining P0/P1;
- durable raw/status capture, post-status-fault preservation, unavailable-wrapper survival, binary-nonzero preservation, replay/order/tamper rejection, runner-drift rejection, pinned-Node failure receipt, canonical-path enforcement, frozen-identity pre-spawn denial, and final C restoration passed;
- production session absent before and after; production runner bytes unchanged; no disposable roots remained;
- no real C9 policy mode, inventory/store gate, verifier, simulation, candidate/frozen gate, repository script, or production session ran during this preflight.

Historical C9 preflight receipt:

```text
PASS C9 session runner preflight — one absolute runner/session, frozen-identity pre-spawn denial, immutable canonical manifest paths, fixed A/B order, exact C→Q→T→C continuity, durable raw/status capture, unavailable-wrapper survival, replay/order rejection, tamper rejection, binary nonzero preservation, runner drift rejection, pinned-Node failure receipt, and production audit fence
```

Those identities bind only the already-consumed C9 session. The independently audited C10 external receipt is:

- runner: mode `0644`; 52,696 bytes; SHA-256 `56120267169dbb18fade58d87097608dd1ab1768e4bc72369b1768e083bef7b0`;
- disposable preflight test: mode `0644`; 52,728 bytes; SHA-256 `92135b9e2ecc96f8c067bf427fc2a79e606fd92bfe492dc7878d88a9d341c320`;
- pinned Node.js `v22.16.0` syntax: PASS for runner and test;
- full disposable preflight: PASS from unrelated caller directories, disposable stubs, and temporary repositories only;
- exact 13-label state vector: nine gates at `C`, two at `S`, two at `T`, then clean restoration to `C`;
- exact topology: `Q→C→S→R→T`, with malformed C/S/R/T parent/order/tree cases and active-commit collisions rejected;
- durable raw stdout/stderr/status capture, post-status-fault preservation, EEXIST same-label retry denial, unavailable-wrapper survival, binary nonzero preservation, replay/order/facts tamper rejection, runner drift rejection, deterministic wrong-Node receipt, and final clean restoration: PASS;
- all 23 role-forbidden OIDs across all six active manifest positions rejected before setup or child spawn;
- physical protected-root, direct production/C9, and symlink-alias launch fences: PASS;
- an existing, canonical, unprotected builder outside the per-case disposable sandbox was rejected by the general containment guard before spawn;
- production C10 session: absent before and after;
- consumed C9 recursive digest: `a84901d7075ccf85286c63f6aa20fe50a63953a9db445b6ef64f79abfdff1080`, unchanged across 1,272 entries; its exact runner/test/manifest/state anchors also remained unchanged;
- independent exact-hash runner/test re-audit: PASS with no remaining runner-specific blocker.

The C10 runner remains external to the exact three-path candidate and proves receipt/launch behavior only; the committed policy self-test separately owns candidate-store semantics. Its successful disposable preflight did not invoke any repository policy mode, candidate gate, frozen identity, verifier, simulator, branch, PR, or remote mutation.

The production runner fence does not make a manual direct invocation of a repository policy mode operating-system-impossible. Such bypass remains prohibited governance. Frozen audits must remain blob-only/static and may not be given a frozen worktree execution target. Fable 5's C9 advisory remains document-only and Grok's C9 advisory remains governance-only; neither reviewed the C10 code or launcher bytes, broadened scope, or authorized frozen-identity execution.

## 7. Required evidence

Pinned Node.js: `v22.16.0`.

Pre-identity store-unit repair receipt: two isolated C10 self-test processes reproducibly blocked while the test copied a reachable blob through `git hash-object --literally -t blob -w --stdin`. Process inspection showed each Node self-test sleeping behind exactly one sleeping `git hash-object` child; neither emitted a PASS or failure line. The current invocation and the older stale invocation were terminated with SIGTERM; the current shell receipt was exit `143`. No C10 commit, tree, manifest, raw frame, bundle, branch push, PR, synthetic merge, or CI identity existed. The blocking in-memory pipe is retired. The replacement writes each already-read raw object to one mode-`0600` file in a separate disposable transfer directory, invokes `git hash-object -t <type> -w --no-filters -- <physical-file>`, deletes the file, and still requires the copied OID to equal the source OID before continuing. This is a repairable pre-freeze harness receipt, not a frozen-identity retry or PASS claim.

Pre-identity three-path poison-proof repair receipt: the first post-audit self-test attempt stopped before policy assertions with sandbox-only Git errors `unable to create temporary file: Operation not permitted` and `unable to create backing store for newly created file scripts/verify.mjs`; exit was `1`, no policy result existed, and the staged/worktree bytes remained equal. The permissioned attempt then blocked while the new poison proof redundantly constructed another candidate fixture: Node PID `52182` slept behind PID `69195` running `git hash-object -w --stdin`; neither emitted PASS or failure. Both exact processes were terminated with SIGTERM and the shell receipt was exit `143`. The interrupted attempt left only its explicit poison marker appended to the correction-record worktree file; that marker was removed to restore exact staged bytes. No C10 identity, branch ref, push, PR, synthetic merge, CI run, or one-shot session existed. The replacement exercises the production immutable/index-bound three-path byte-source acquisition under each physical worktree poison without creating repeated Git objects, restores each path exactly in `finally`, and compares all acquired bytes to the clean source set. This remains repairable pre-freeze harness evidence, not a frozen-identity retry or PASS claim.

Final pre-freeze static-audit repair receipt: the first re-audit of the stabilized bytes found that the historical-fixture and derived-STATUS source parameters were dereferenced before their resolved OID was compared with `Q`, so the alias `HEAD` could be accepted while the candidate branch still pointed at `Q`. No mode or gate was executed by that audit, and no identity was frozen. Both source entry points now require the supplied string to equal the literal lowercase 40-hex `Q` before any Git invocation. The existing compound immutable-source fixture now covers `HEAD`, uppercase Q, whitespace-padded Q, P, and a missing OID against both entry points, requires the exact entry-point error, and proves zero Git calls while preserving the structured-fixture total of 104. The first post-guard pre-identity self-test exited `1` because one older standalone P-source assertion still expected the retired post-dereference `fixture source OID drifted` message; the guard itself emitted the new exact pre-dereference error, no candidate PASS or frozen identity existed, and that stale assertion is now bound to the exact literal-Q error.

Before identity freeze, repair is allowed and the following must pass:

- exact authority/base/scope review;
- syntax for the policy, external receipt runner, and disposable runner test under pinned Node.js `v22.16.0`;
- full disposable external-runner preflight and exact-hash independent runner audit, without invoking a repository policy mode or candidate/frozen gate;
- policy self-test with 162 zero-Git rejected-head checks, 86 historical raw-frame fixtures, exactly 104 structured adversarial fixtures, schema-v2 store-closure negatives, immutable Gate A and C9/Q fixtures, C10/future route self-consumption, sealed ART compatibility, three-path worktree poisoning with exact restoration, and NO-PUBLISH;
- mechanical nine-parent reconciliation, evaluated-constant/prose inventory parity, and clean lossless UTF-8 across both documents, policy, runner, and test;
- exact document SHA-256/blob/byte bindings and active normalized policy projection derivation after both documents stabilize.

The C10 policy and documents remain pre-identity and repairable. The external runner/test are stabilized at the exact identities above. The document identities, 104 structured count, active projection, syntax/self-test results, and independent code/document audits must all agree before freeze. The real policy, inventory/store, verifier, and simulation commands did not run during the disposable preflight.

After identity freeze, every first required result is terminal. Let `C` be the exact frozen C10 candidate direct child of `Q`; `S` the exact synthetic/protected-successor-shaped merge with ordered parents `[Q,C]` and tree equal to `C`; `R` the derived REC-02 r2 candidate direct child of `S`; and `T` the exact synthetic REC-02 successor with ordered parents `[S,R]` and tree equal to `R`. The fixed real sequence is `A01 inventory → A02 schema-v2 store closure → B01 policy self-test → B02 verifier self-test → B03 full verifier → B04 simulator self-test → B05/B06/B07 random/cheapest/priciest 2,000-run gates → B08/B09 cold C10 PR/push evaluator facts at S → B10/B11 cold REC-02 PR/push evaluator facts at T → exact restoration to C`. The bound state vector is nine gates at `C`, two at `S`, and two at `T`; no wording here asserts that a real PR already exists at `S` or `T`. It must prove:

- exact mode/blob/SHA-256/byte identities, sorted three-path manifest, raw commit frame, framed SHA-1, sole parent, tree, and clean index/worktree;
- candidate-only bundle and clean clone A with only candidate-reachable history, no refs/remotes/alternates/shallow/common/promisor state, all 103 forbidden objects absent, and all nine protected controls present;
- inventory and store checker run first in untouched clone A through the preflighted receipt runner;
- separate clean clone B policy self-test, including 162 zero-Git failed-head checks, 86 historical raw-frame fixtures, exactly 104 structured adversarial fixtures, immutable Gate A and C9/Q, C10 correction, future REC-02, sealed ART, and NO-PUBLISH;
- verifier self-test, full verifier, and simulator self-test;
- random, cheapest, and priciest at seed `20260817`, exactly 2,000 runs each;
- cold correction PR/push and future REC-02 PR/push evaluators in separate processes without self-test warm-up;
- final source and disposable clone cleanliness.

After complete local PASS only, one push of the exact r8 identity and one draft PR against `recovery/e4f8440-nopub` are authorized. Attributable attempt-1 CI and independent adjudication must bind to the exact synthetic merge. Any required mismatch freezes that exact identity without retry.

## 8. Stop state

PRs #30, #31, #33, and #34 and their branches remain open/draft/unmerged/frozen at their exact recorded heads. PR #35 is merged at exact Q and its r7 route is consumed. C5 r3 and C7 r5 remain consumed and must not be created or pushed. PRs #26 and #27 remain frozen; PR #28 remains outside scope. The Q-based REC-02 r2 pre-freeze projection remains uncommitted and unpushed and may not become an identity.

- Protected-base ROADMAP/LOCKS/STATUS record the owner-approved dispositions at ruling commit `009fca7884e360486ddda172c389f480b62323a5`: L-025 — LOCKED: Commander identity Option B; rendered-path audit and synchronization remain pending. L-026 — LOCKED: retain zero/one branches solely as tested defensive save-recovery guards; coverage is not yet dispatched. L-027 — LOCKED: retire `vess_course_lost` and its promised downstream-course consequence; removal is not yet dispatched. L-028 — DEFERRED: default RETIRE unless mobile PX meets a pre-registered, Manraj-approved comprehension threshold; no indicator is authorized.
- `main@792e202` has a documented authority lag: AGENTS agrees at blob `592d7428b83677ab4dfd002b7181fe7c298bc084`, but main ROADMAP/PROJECT_STATUS/LOCKS blobs `788b15255bec3c65ff433a2c299ed709a27d3fb2` / `2e5b3d38c594be429b6f723bdcf695669e943774` / `398afd1f6284b7f9223f89431017425b265a67b2` still show pre-ruling/pre-Gate-A state. Exact Q retains ROADMAP/LOCKS blobs `4b80ef5d26fab3eda752eeb0902dc255bb127263` / `7b79cf7058e5bfa21f8429c405078c2364fcba44`. This lag does not downgrade protected-base dispositions. The already owner-approved post-recovery ROADMAP/LOCKS changes must later be rebuilt from the final recovery successor and land atomically with PROJECT_STATUS; C10 does not rule locks.
- R5–R7 source, images, receipts, builds, evaluator/App work, and cloud resources remain frozen.

Rulesets, required checks, bypass actors, protected refs, and PR state remain merge-time external facts. No omitted `bypass_actors` field may be interpreted as empty.

`NO-PUBLISH / NOT CERTIFIED` remains active.

## 9. Next action

**Build / GPT-Codex:** run the repaired pre-identity self-test and remaining pre-freeze static checks; only after PASS may Build freeze and enter the 13-gate one-shot. `NO-PUBLISH / NOT CERTIFIED` remains active.
