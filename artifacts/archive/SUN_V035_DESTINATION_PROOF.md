SOURCE main@8d23109 · RUNTIME b133aaf · TASK SUN-V035-PLAYTEST-DESTINATION-01 · MODE implementation

Build / $ Con V9, sole isolated writer. Manraj explicitly authorized the
destination ticket through `0136CT-V9-PLAYTEST-DESTINATION-01.md`.
One PR into `version/0.30.1-main-reconcile-ci.1`; stop for owner review.

## Authority and reproduction

- Main authority: `8d23109b63b844e0703fb36643f14b91b8800c90`.
- Exact predecessor: `b133aafc79283efffcd7a10f2ce263c16ae2f0ab`.
  Live GitHub confirms PR 129 owner-merged there. Its tree is the reviewed
  VESS-RECAP candidate tree, `344b7ca2fad53acf8cd09ed2805bcd3832b19ee3`.
- Read global/repository AGENTS, main/lane ROADMAP, PROJECT_STATUS, LOCKS,
  SCENE_SKELETON, GITHUB_PUSH_RULES, current inbox, PLAYTEST.md,
  PLAYTEST_LATEST.md and the source report's SUN-PLAY-013 evidence.
  Current explicit runtime pin controls; historical STATUS is not rewritten.
- The hosted v0.33 report is a hunch until reproduced on these bytes.
  No deployed-SHA claim is made.
- At the exact predecessor, use actual rendered buttons in controlled
  milestone contexts: `status` → strict rationing; `transmission` →
  log/ignore the signal; `act3_reckoning_cut` → briefing;
  `ship_memory_payoff` → final orders.
- The early rationing choice sets only `priority: ration`. Ignoring the
  signal sets `signal: ignore`, not a destination. Recovery/briefing leaves
  `planet` unset while Jiro is recovered with trust 40.
- `final_choice` renders “You still have no destination. You can set one…”
  and an enabled “Hold course for the rogue planet. We finish what we started.”
  **SUN-PLAY-013 CONFIRMED, not ALREADY_SATISFIED.**

This is an actual-engine/rendered-button reproduction with browser stubs and
controlled intervening contexts, not a new full start-to-end or physical-phone
playtest. The recovery scene is used only to reproduce the reported path;
the separate Jiro wording concern is not investigated or repaired.

## Narrow correction

`final_choice` choice labels now read the same existing predicate as its
setup: `state.flags.planet === "committed"`.

- Committed: all original “Hold course” labels remain exact.
- Unset or deferred: all three existing navigation-support variants say
  “Set course for the rogue planet,” without claiming a course already begun.
- The same screen's ordinary comfort action says “Leave the destination unset”
  when there is none; its committed “Abandon” wording remains exact.
- The existing debt-qualified comfort wording and the entire separate
  “even without Jiro's full voice” clause remain exact.

Only labels and the scene declaration change in production. No setup prose,
state writes, state/schema keys, crew/debt guards, available actions,
requirements, costs, lean, destination, patch route, ending, art, engine or
save code changes. `final: hold` keeps its existing action meaning; this
ticket does not manufacture an early `planet: committed` history.

## Proof

The new checks are required by `scripts/verify.mjs`; no old test is weakened.

- 480 combinations: unset/deferred/committed, eight navigation/liveness/debt
  contexts, four structural-memory states, and rich/exact-floor/below-hull/
  below-supplies/zero budgets. Setup and every choice's non-label descriptor,
  disabled states, image and whole run-state retain the predecessor fingerprint:
  `4ab47f2c5bb9d6c11e1ce7e4d463718129a02aad192ac899300f755ead22ae65`.
- 162 actual final-action paths include all four final actions across the
  three navigation variants and four structural states, plus 18 abort/return
  paths. Resulting state, ending title, ending prose and What Remains retain
  the predecessor fingerprint:
  `144c4006befe4006c304c4582bf44c19c014f693cf49b1ca3eb15277752e087f`.
- Before the repair, 320 matrix cases and 12 abort-return cases reproduce
  the label contradiction. Afterward those assertions pass with both complete
  predecessor fingerprints unchanged.
- Four actual-button milestone routes cover strict rationing, repairs,
  explicit deferral and early commitment. Signal/recovery do not invent or
  erase a destination; final setup and labels agree.
- 96 real current/marker-less imports cover all three planet states, all
  eight navigation contexts, fresh final orders and an actual aborted burn.
  Each replaces an unrelated manually saved opening slot and resets live
  state before two Continues. State, text, private history, pregnancy facts,
  promises and current bytes/stable legacy adoption are preserved.
- Together with eight route Continues, 200 Continue restorations pass.
- Sole-writer diff review plus 11 isolated in-memory fault controls detect:
  stale Hold, lost committed Hold, false Abandon, false setup, changed cost,
  bypassed patch, render write, Jiro-clause rewrite, ending rewrite,
  fake Continue and no-op Import. No second writer or independent-review claim.

Living-cast, Vess recap, join-typo, pregnancy-Lena, epilogue, capacitor,
Sela and Tomas sources/tests remain unchanged and run in the full verifier.

## Exact candidate checks and stop

Candidate/tree, final results, smoke repeat hash and required GitHub job URLs
are recorded in the PR verification comment and V9 outbox receipt.

- Exact-head verifier; verifier/release-policy/simulator self-tests.
- Version release-policy bound to this exact predecessor and candidate.
- Smoke: `node scripts/simulate.mjs --profile smoke --policy all --runs 64 --seed 20260817 --shard-size 32 --gate smoke`.
- Diff whitespace and four-file/protected-source scope review.
- Required GitHub: version-release-policy, version-verify, version-simulation-smoke.

NO-PUBLISH / NOT_CERTIFIED; last certified remains 0.28.1d.
L-002/L-021/L-024/L-025 protections unchanged. ART-R2 held, Amara-route
parked, Netlify pin blocked. No remint 107–129, Jiro repair, other leftover,
opening backstory, 0.36, other game, merge, tag, deploy or Orchestrator ping.

Next action: Manraj reviews the one PR and, if accepted, merge-commits in the
browser, not squash. Build stops for review and will not merge.
