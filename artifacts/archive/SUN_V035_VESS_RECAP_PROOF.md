SOURCE main@8d23109 · RUNTIME a542db4 · TASK SUN-V035-PLAYTEST-VESS-RECAP-01 · MODE implementation

Build / $ Con V9, sole isolated writer. Owner explicitly authorized this launch
in `0114CT-V9-PLAYTEST-VESS-RECAP-01.md`: reproduce on the exact merged HEAD,
stop if already satisfied, otherwise one PR into
`version/0.30.1-main-reconcile-ci.1` and stop for review.

## Authority and confirmed reproduction

- Main authority: `8d23109b63b844e0703fb36643f14b91b8800c90`.
- Exact predecessor: `a542db43fdfe5614b12b8fa232ded93e7c43860b`, verified
  owner merge of PR 128. Its tree matches the reviewed JOIN-TYPO candidate.
- Read global/repository AGENTS, main/lane ROADMAP, PROJECT_STATUS, LOCKS,
  SCENE_SKELETON and GITHUB_PUSH_RULES in this continuous session; refetched
  main/lane and verified authority/specialist files unchanged. The explicit
  newer runtime pin controls, not historical STATUS. No authority-file edits.
- Read current inbox and PLAYTEST.md, then its linked PLAYTEST_SUN report's
  SUN-PLAY-012 and pass 7 recap evidence. Hosted v0.33 is not this HEAD.
- In a clean worktree at that exact SHA, a controlled completed-Lena/Amara
  context uses actual buttons for Vess boarding, offer acceptance, transmission
  window, private hour, and the later Amara/Tomas shared bay. Dressing and
  leaving reaches `pursuit_window` with `romance.vess`, `vess_intimate` and
  `romance.amara_tomas` set.
- The rendered summary still names only `Amara Vale, Dr. Lena Voss` and says
  `one first-time bond`. Vess is absent. The existing remaining open gates
  are Mira and Sela; the flags are not lost. SUN-PLAY-012 is CONFIRMED,
  not ALREADY_SATISFIED.

## Narrow repair

Only `pursuit_window.text` changes, plus its declaration. A separate
living/recovered Vess acknowledgment reuses exact existing recap prose:

- Accepted offer only: `Vess offered the attempt and you accepted. Power stayed hers.`
- Completed private hour: `Shared the last long-range window and a private hour with Vess.`

These are already in `debt_notice` from PR 126; the completed line is also
the existing encounter memory. Read persistent facts, not the bounded memory
list. Require `romance.vess` and `isAlive("vess")`; additionally distinguish
`flags.vess_intimate`. Declined, dead, unrecovered and intimacy-flag-only
controls do not invent an active accepted/completed encounter.

The existing second-approach list remains exactly Mira/Amara/Sela/Lena with
its original participation, pursuit and living guards. Vess is not added to
that list or to any choice: her one-time asymmetric encounter is not a new
ladder. The existing conditional first-window sentence now says the player
can check who is willing to meet, without claiming a numerical bond limit.
`hasOpenRomanceGates`, `romanceOpen`, all choices and the original four's
second-approach prose remain unchanged. No Amara-route/gate work.

No new story outcome, state field, helper, art, engine change, cost, reward
or routing change. The already-fixed closing epilogue is not reminted.
Destination/SUN-PLAY-013 and Jiro wording are not investigated or changed.

## Targeted proof

- Three actual-button routes: accept and retain the transmission window,
  accept and complete the private hour, and decline. Each reaches the recap
  through the existing shared-bay route with the original resource effects.
  Used Vess offers remain unavailable. Six post-encounter Continues restore
  exact state, view and saved bytes without replaying benefits.
- The existing free close reaches `debt_notice`, which retains its Vess
  acknowledgment, and the free onward choice returns to `act3_spine_next`.
  Whole-state comparisons allow only the existing scene transitions.
- 120 fact/liveness/second-approach/remaining-gate combinations cover no offer,
  decline, acceptance, completion, inconsistent intimacy-only saves, dead or
  missing Vess, used/dead/absent original claims, and closed first gates.
  Rendering writes nothing; the existing affordable exit remains.
- The predecessor's fingerprint of state, all choice descriptors, open gates
  and image stays exact across all 120 fixtures:
  `dbf8183e37e1a4509fabc8e49c46a6b4208eedb66dd67db2e9247275d403e1bc`.
- Three actual remaining-window navigation checks retain the same
  `intimacy_window` destination without new Vess offers or state writes.
- 60 real imports cover five Vess fact states, three life/recovery states,
  two original-pursuit states and current/marker-less saves. Each first
  replaces an unrelated manually saved opening slot, then performs two
  Continues after resetting live state. All 120 restores preserve exact
  history/view/choices; current bytes and stable legacy adoption remain.
  Together with the route checks, this is 126 Continue restorations.
- Eight original ship-interruption entry controls retain their redirects.
- Single-writer review and nine in-memory negative controls detect omitted
  acknowledgment, false completion, absent Vess, false second approach,
  the old bond count, render rewards, changed costs, fake Continue and no-op
  Import. No subagent or second writer is used for this ticket.

Four files: `src/scenes-32.js`, `scripts/vess-recap-checks.mjs`,
`scripts/verify.mjs`, and this proof. Existing tests are not weakened.
Living-cast, join-typo, pregnancy-Lena, epilogue, capacitor, Sela and Tomas
source/tests remain unchanged and required by the full verifier.

## Exact-head validation and limits

Final candidate/tree, exact command results, three required GitHub job URLs
and smoke repeat hash are recorded in the PR and V9 outbox.

```sh
VERIFY_EXPECTED_SHA=<candidate> VERIFY_HEAD_REF=ticket/0.30.1-v035-playtest-vess-recap-01 node scripts/verify.mjs
node scripts/verify.mjs --self-test
node scripts/release-policy.mjs --self-test
node scripts/simulate.mjs --self-test
node scripts/simulate.mjs --profile smoke --policy all --runs 64 --seed 20260817 --shard-size 32 --gate smoke
```

Version release-policy also binds the exact named base/head and same-repository
PR event. These are actual-engine/rendered-button/import/resume checks with
browser stubs and controlled contexts, not a fresh full phone or hosted
playtest. No newly deployed bytes or certification are claimed.

NO-PUBLISH / NOT_CERTIFIED; last certified remains 0.28.1d.
L-002/L-021/L-024/L-025 protections unchanged. ART-R2 held, Amara-route
parked, Netlify pin blocked. No other leftover, opening backstory, 0.36,
other game, merge, tag, deployment or Orchestrator chat ping.

Next action: Manraj reviews this one PR and, if accepted, merge-commits in the
browser, not squash. Build stops for review and will not merge.
