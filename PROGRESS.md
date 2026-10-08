# SUN-TESTS-PLAYERFLOW-01 progress

Updated: 2026-10-07 20:05 CT

## Done
- Inventory: verify.yml runs verify.mjs + simulate.mjs only. Standalone scripts/*-checks.mjs are not in CI unless imported by verify.mjs.
- New files only on ticket/sun-tests-playerflow-01 @ f32f825 (parent 520be6ad, merge #434).
- scripts/sun-playerflow-title-checks.mjs
- scripts/sun-playerflow-save-checks.mjs
- scripts/sun-playerflow-costs-checks.mjs
- scripts/sun-playerflow-crew-checks.mjs
- scripts/sun-playerflow-endings-checks.mjs
- scripts/sun-playerflow-settings-checks.mjs
- .github/workflows/sun-playerflow-tests.yml (verify.yml pins, pull_request into version/** only)
- Local node run of the six files against the 520be6ad tree: PASS. Costs records SUN-PLAYERFLOW-COST-02 as expected-fail and still exits 0.
- No src/, css/, index.html, verify.mjs, or existing *-checks.mjs edits. No Netlify. No VERSION.

## Next
- Open PR into version/0.30.1-main-reconcile-ci.1.
- Policy versionCore requires 0.30.1 in the ticket branch name. Ordered branch ticket/sun-tests-playerflow-01 will fail that route check.
- Policy-legal branch ticket/0.30.1-sun-tests-playerflow-01 was empty at 520be6ad. Copy f32f825 files onto it, then open the PR from that name.
- Do not claim a queue ticket until the PR is open. TICKETS.md was not on the lane tip.

## Decisions
- Third workflow is allowed: release-policy.mjs only reads release-policy.yml and verify.yml. It does not readdir-fail extra yml.
- Unaffordable debit is not fixed here. Recorded for Ori.
- Existing tests are not edited.

## Failing checks
- No PR number yet (create was deduped; list of open PRs for this head was empty).
- Expected version-release-policy fail on ticket/sun-tests-playerflow-01 (no 0.30.1 token).
- BUG SUN-PLAYERFLOW-COST-02: src/engine.js makeChoice (~line 2008) applies choice.effects with no canAffordEffects check. updateStats clamps. Not fixed.

## Next step
- Push this file, copy the suite onto ticket/0.30.1-sun-tests-playerflow-01, open the PR, then stop for Ori merge.
