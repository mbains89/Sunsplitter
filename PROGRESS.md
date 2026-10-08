# PROGRESS — SUN-INFRA-01 PR1 merge guard

## done
- Lane tip confirmed: 520be6ad4d8dcfc26df0e6668ee81de458bf17ad (PR #434).
- Policy read: scripts/release-policy.mjs WORKFLOWS only scans release-policy.yml + verify.yml. New workflow file is not scanned. versionCore() requires ticket/0.30.1-* against version/0.30.1-*.
- Branch ticket/0.30.1-sun-infra-01-merge-guard. Wrong name ticket/sun-infra-01-merge-guard left un-PR'd.
- scripts/merge-guard.mjs + .github/workflows/sun-merge-guard.yml written.
- Local self-test PASS: protected → fail, label → pass, src-only → pass.

## next
- Open PR into version/0.30.1-main-reconcile-ci.1.
- Paste self-test proof in the PR body.
- PR2 AGENTS.md + FEATURE_CHECKLIST.md on ticket/0.30.1-sun-infra-02-agents.

## decisions
- Allow-list starts at mbains89. Builders also authenticate as mbains89, so labels cannot distinguish owner from builder. Called out for Ori.
- Protected set is the real tree paths: scripts/*-checks.mjs, tests/**, scripts/simulate.mjs, scripts/fixtures/main-reconcile-ci-pr-baseline.json, tests/sim-thresholds/**, VERSION.md, docs/version-lock.md, release-policy.yml, verify.yml, scripts/release-policy.mjs, scripts/version-lock-ci.mjs, tests/visual-baselines/**.
- Did not edit existing workflows or *-checks.mjs.

## failing checks
- none yet (PR not open)

## next step
- Create the PR and wait for version-release-policy, version-verify, version-simulation-smoke, merge-guard.
