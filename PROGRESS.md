# PROGRESS — SUN-TESTS-PLAYERFLOW-01

## done
- Live lane tip confirmed `520be6ad4d8dcfc26df0e6668ee81de458bf17ad` (merge #434).
- New tests only (no src/css/index/verify.mjs/existing checks edits).
- Source commit on `ticket/sun-tests-playerflow-01` @ `f32f82525086c60a997fcbb6cf9c8a5e3467836f` (parent `07f4f977`).
- Local node PASS on all six `scripts/sun-playerflow-*-checks.mjs` against the 520be6ad tree.
- New workflow `.github/workflows/sun-playerflow-tests.yml` (pull_request into version/**, Node 22.16.0, checkout pin 11d5960, setup-node pin 49933ea, contents: read).
- release-policy.mjs does not readdir-fail a third workflow.

## next
- Open PR from policy-legal head `ticket/0.30.1-sun-tests-playerflow-01` into `version/0.30.1-main-reconcile-ci.1`.
- Ordered name `ticket/sun-tests-playerflow-01` fails versionCore (no 0.30.1). This heartbeat copies the f32f825 files onto the policy-legal branch.
- After PR is open and green, claim next READY ticket in TICKETS.md (never ON-HOLD / V158 Recruitment).

## decisions
- Tests import `loadGame` from simulate.mjs. No edit to simulate.mjs.
- Unaffordable debit is expected-fail, not a game fix. Bug id SUN-PLAYERFLOW-COST-02. src/engine.js makeChoice ~2008 applies effects with no canAffordEffects gate; updateStats clamps.
- No Netlify, no VERSION paint, no tag, no certify.

## failing checks
- None local. CI not yet run (no PR).
- version-release-policy will fail the unordered head name. Use `ticket/0.30.1-sun-tests-playerflow-01`.

## next step
- Push the six checks + workflow onto this branch, open the PR, paste the number.

## coverage
| flow | test | status |
| title → first choice | scripts/sun-playerflow-title-checks.mjs | PASS local |
| save → reload → continue | scripts/sun-playerflow-save-checks.mjs | PASS local |
| endings + What remains | scripts/sun-playerflow-endings-checks.mjs | PASS local |
| crew open/close + dead/unrecovered | scripts/sun-playerflow-crew-checks.mjs | PASS local |
| choice cost debit | scripts/sun-playerflow-costs-checks.mjs | PASS debit; EXPECTED_FAIL unpaid refusal |
| tone ack persist / restart clears run | scripts/sun-playerflow-settings-checks.mjs | PASS local |
