# SUN-V035-PLAYTEST-SUPPLIES-01 — finite opening reserve

SOURCE main@8d23109 · RUNTIME baseline 895ca7d · TASK SUN-V035-PLAYTEST-SUPPLIES-01 · MODE implementation

Build / $ Con V9. Authorized by Manraj via `1432CT-V9-SUPPLIES-01.md`.
Baseline: `895ca7daaf9e82854bb203ef4759ad0bcdd76f8a` on
`version/0.30.1-main-reconcile-ci.1`. NO-PUBLISH / NOT_CERTIFIED;
last certified remains 0.28.1d. This evidence does not close a release gate.

## Finding and bounded change

Supplies above 50 were already possible, but often brief or absent. The initial
reserve was 41. Most gains are optional and concentrated early: full hydroponics
adds 9 at a cost of 7 Hull; rendering paste adds 9 at a cost of 5 Hull; the Future
salvage route adds 8 at a cost of 8 Hull. Later repairs, recovery, care, and comfort
continue spending without passive regeneration.

The seed-20260817 Living policy spent 53 and earned 16: 41 + 16 - 53 = 4.
Its maximum was 41. Named drains include repair priority (-7), investigating the
signal (-8), the green margin (-6), warm habitation (-8), and the tether reserve
(-6). The pragmatic policy peaked at exactly 50 and finished at 44.

Change: new runs start with **61**, a finite additional 20-point opening margin.
`freshState` and the defensive reset fallback agree. Every scene, price, reward,
requirement, tradeoff, cap, save schema, and story line remains unchanged.
No recurring credit, resource-management system, or romance change is added.
Existing saves retain their actual Supplies; this improvement requires a new run.

## Reproducible policy measurements

Method: `simulateRun` from `scripts/simulate.mjs`, actual browser-load manifest,
fresh reset, legal affordable choices, seed `20260817`. The transaction ledger
reconciles every observed resource change. These are automated policies, not
claims about human fun or the owner's exact route. Additional reserves can change
which choices a policy selects; this table is not an identical-choice comparison.

| Policy | Baseline income / spend | Baseline min / max / end | Candidate income / spend | Candidate min / max / end |
|---|---|---|---|---|
| Living | 16 / 53 | 4 / 41 / 4 | 13 / 58 | 16 / 61 / 16 |
| Future (conserving witness) | 33 / 29 | 39 / 58 / 45 | 38 / 20 | 56 / 83 / 79 |
| Pragmatic | 35 / 32 | 34 / 50 / 44 | 39 / 34 | 49 / 72 / 66 |

The conserving witness reaches `ending_check` after 99 choices, starts at 61,
earns 38, spends 20, and ends at 79. Every transaction's before/after balance is
strictly above 50 and below 100. It is a legal survival-tradeoff route, not a
full-survival claim. Generous play still consumes the reserve.

Bounded distributions: 64 runs per policy, consecutive seeds `20260817` through
`20260880`, unchanged policy algorithms and affordability rules.

| Policy | Baseline median ending Supplies | Candidate median ending Supplies | Baseline / candidate ending above 50 | Baseline / candidate touching zero |
|---|---|---|---|---|
| Random | 10 | 23 | 2 / 8 | 5 / 1 |
| Cheapest | 33 | 53 | 0 / 42 | 0 / 0 |
| Priciest | 3 | 2 | 0 / 0 | 15 / 19 |

All 192 candidate runs completed with zero V1/V4/V5 violations. Expensive policy
still depletes stores and can spend newly affordable options; this is not a
guarantee of abundance or an attempt to equalize outcomes.

## Regression proof and remaining boundaries

- `scripts/verify.mjs` checks fresh and fallback reserves, repeated load/render of
  saved balances 0/4/41/61/83/100, unchanged save bytes, an unchanged paid cost,
  no render-time refill, and disabled unaffordable choice activation.
- The fresh-run policy witness must remain above 50 after at least 10 points of
  real spending, below the cap, and reach an ending. The generous control must
  still spend down below 50.
- The new checks reject the archived baseline's 41-point reserve and sub-50
  conserving path, and pass the candidate. Existing tests are retained.
- The accessibility announcement now expects the correct new-run balance.
- The private-phone verifier compares resumed Supplies with the exact selected
  package's saved balance, retaining compatibility with both older 41-point
  packages and this candidate. Its old pinned default package is not repinned.
- Required exact-head verification, version simulation smoke, browser proof,
  and GitHub check links are recorded in the PR/outbox receipt at handoff.
- Physical iPhone behavior and whether this feels sufficient remain owner-playtest
  judgments. No claim of certification, full-survival improvement, or release.

Authority inspected: AGENTS, ROADMAP, PROJECT_STATUS, LOCKS, GITHUB_PUSH_RULES,
and the named dispatch. No authority, scene, art, UI panel, or deployed bytes changed.
Amara's unreplicated ticket remains parked; no replacement was minted.

Next action: Manraj reviews the one named-ticket PR; merge-commit in the browser,
not squash. Build does not merge or deploy.
