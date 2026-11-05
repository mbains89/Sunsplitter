SOURCE main@8d23109 · RUNTIME 07973c8 · TASK SUN-V035-PLAYTEST-JOIN-TYPO-01 · MODE implementation

Build / $ Con V9, sole isolated writer. Owner explicitly authorized this launch
in `0055CT-V9-PLAYTEST-JOIN-TYPO-01.md`: one PR into
`version/0.30.1-main-reconcile-ci.1`, then stop for review.

## Authority and reproduction

- Main authority: `8d23109b63b844e0703fb36643f14b91b8800c90`.
- Exact predecessor: `07973c8adf03a855a4892a6c21696f0ba62d31d5`, verified
  owner merge of PR 127. Its tree matches the reviewed pregnancy-Lena candidate.
- Read global/repository AGENTS, main/lane ROADMAP, PROJECT_STATUS, LOCKS,
  SCENE_SKELETON and GITHUB_PUSH_RULES in this continuous session; refetched
  main/lane and verified authority/specialist files unchanged. The explicit
  newer runtime pin controls, not historical STATUS. No authority-file edits.
- Read current inbox, PLAYTEST_SUN finding 5 / SUN-PLAY-008 and NEXT_AFTER_SELA.
  That inventory's historical open-PR statuses are superseded by live merges.
  No deployed SHA is inferred from the playtest's visible version.
- Confirmed scene: `faction_split` in `src/scenes-25.js`.
  Its fixed sentence ends at "everyone." with no separator. The first enabled
  optional paragraph is appended directly. All optional tail fragments already
  end with paragraph newlines.
- On the predecessor, actual rendering reproduces both
  `everyone.The mid-voyage work leaned Living.` and
  `everyone.You sealed the cascade records.`.
  The neighboring backed-down variant shares the same defect.
- The engine splits on paragraph newlines without filtering empty fragments.
  A tail therefore also produces an empty final rendered paragraph. Adding
  only a separator would introduce that empty paragraph in no-tail cases too.

## Formatting-only repair

Add one paragraph separator after the fixed "everyone." sentence, then return
`t.trimEnd()` from this getter only. The no-tail case ends at the sentence;
active tails are separated and do not leave an empty final paragraph.

No renderer/engine change, fragment reordering, prose rewrite or new helper.
All scene-entry redirects, five choices, affordability requirements, resource
deltas, flags, ideology, dead/unrecovered guards and image mapping remain exact.
The declaration records the existing entry/render/choice/death/image contract.
Jiro wording is not changed or adjudicated by this ticket.

## Targeted proof

- **188 actual rendered layouts:** 108 combinations of cascade none/open/sealed,
  conflict none/held/backed, mid-voyage none/Future/Living and Elias/Amara
  presence; 76 first-enabled-tail combinations cover power, bonds, debtors,
  file/past, Mira favor, Lena's clock, resource floors and dense tails; four
  dense-tail missing-recovery/all-dead controls.
- Both reported joins, the backed-down neighbor, no-tail cases and every tested
  first-enabled tail now have a readable paragraph boundary. Actual rendered
  paragraph elements are nonempty, not merely free of the two literal typos.
- A fingerprint captured before the repair covers every layout's non-whitespace
  prose, ordering, choices, image and state. It remains identical afterward:
  `72c07d7a44d89b31274819afd65e1a408d5224d85e37465a1a7162e1425dbd6d`.
  Render purity and an affordable exit are also asserted.
- Three controlled actual-button Mira junction arrivals reach this summary
  through "Stay while she closes it up." The free transition changes only
  the scene; the existing junction/knowledge/memory facts are retained.
- Fifteen actual transactions cover all five original choices across the
  Living/sealed/backed contexts. Whole-state comparison permits only the
  original resource, flag, ideology and destination delta. Thirty post-choice
  Continues reset live state first and restore exact state/save bytes.
- Thirty-two real imports cover those three contexts plus no-tail, living/
  Elias-Amara-absent/missing-recovery/all-dead rosters, and current/marker-less
  saves. Sixty-four Continues reset live state first, then restore identical
  history, text and choices. Current bytes remain exact; legacy one-time
  adoption is stable. Existing pregnancy/private-history facts survive.
- Three direct entry-guard controls preserve the crisis router, Elias
  aftermath and no-Elias Off-Shift redirects without writing state.

Four files: `src/scenes-25.js`, `scripts/join-typo-checks.mjs`,
`scripts/verify.mjs`, and this proof. No existing tests are weakened.
Pregnancy-Lena, epilogue, capacitor, Sela-answer, living-cast and Tomas
source/tests remain unchanged and are still required by the full verifier.

## Exact-head validation and limits

Final candidate/tree, independent read-only review, exact command results,
three required GitHub job URLs and smoke repeat hash are recorded in the
PR and V9 outbox.

```sh
VERIFY_EXPECTED_SHA=<candidate> VERIFY_HEAD_REF=ticket/0.30.1-v035-playtest-join-typo-01 node scripts/verify.mjs
node scripts/verify.mjs --self-test
node scripts/release-policy.mjs --self-test
node scripts/simulate.mjs --self-test
node scripts/simulate.mjs --profile smoke --policy all --runs 64 --seed 20260817 --shard-size 32 --gate smoke
```

Version release-policy also binds the exact named base/head and same-repository
PR event. These are actual-engine/rendered-button/import/resume tests with
browser stubs and controlled contexts, not a fresh full phone or hosted
playtest. No new deployed bytes or certification are claimed.

NO-PUBLISH / NOT_CERTIFIED; last certified remains 0.28.1d.
L-002/L-021/L-024/L-025 protections unchanged. ART-R2 held, Amara-route
parked, Netlify pin blocked. No other leftover, Jiro correction, opening
backstory, 0.36, other game, merge, tag, deployment or Orchestrator chat ping.

Next action: Manraj reviews this one PR and, if accepted, merge-commits in the
browser, not squash. Build stops for review and will not merge.
