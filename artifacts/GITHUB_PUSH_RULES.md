# GitHub Branch, Pull-Request, and Check Contract

**Status:** ACTIVE repository workflow contract, subordinate to `/AGENTS.md`, `ROADMAP.md`, `LOCKS.md`, and `PROJECT_STATUS.md`.
**Approved:** Manraj, 2026-08-30, `MAIN-RECONCILE-CI-SUCCESSOR-01`.
**Release posture:** `NO-PUBLISH / NOT_CERTIFIED`.

Green CI is exact-revision verification evidence. It is never, by itself, certification, release, publication, deployment, sequential-gate closure, or merge authority.

## Authorized branch flow

1. Create `version/<semver-or-approved-version-id>` from the exact approved predecessor.
2. Create one-concern `ticket/*` branches from that version lane.
3. Open ticket PRs from `ticket/*` to the exact intended `version/*` base in the same repository.
4. Merge ticket PRs only with merge commits and only under separately recorded merge authority. No direct, force, squash, or rebase merge into a protected version lane.
5. Open exactly one consolidated close-out PR from the version lane to `main`.
6. Merge the close-out only with a merge commit after the strict exact-head gate and the required owner approval point.
7. Rerun the strict suite against the exact resulting `main` SHA before any later release action. Release, tag, GitHub Release, publication, deployment, Pages, Netlify, or production action always requires separate explicit authority.

Direct pushes to `main` and `version/*`, per-file API commits, ZIP-as-source reconstruction, marker checks, and branch labels as byte evidence are forbidden.

## Canonical required contexts

Ticket PRs from `ticket/*` to `version/*`:

- `version-release-policy`
- `version-verify`
- `version-simulation-smoke`

Consolidated close-out PRs from `version/*` to `main`:

- `main-release-policy`
- `main-verify`
- `main-simulation-gate`

The non-required strict matrix jobs may be named `main-simulation (random)`, `main-simulation (cheapest)`, and `main-simulation (priciest)`. The aggregator alone is the required main simulation context.

Version smoke is deliberately bounded and non-certifying. The strict main gate runs random, cheapest, and priciest at seed `20260817`, 2,000 runs per policy, process-sharded in 500-run children with bounded heap, and reports attributable V1/V4/V5 witnesses. A high-risk ticket may run the strict gate earlier only when its dispatch explicitly requires it; doing so does not create certification or release credit.

Evidence may be reused only for the same tested commit and unchanged invalidation class. Any relevant source, workflow, toolchain, manifest, fixture, seed, policy, threshold, or authority change invalidates the affected evidence. A PR merge result does not substitute for the exact post-merge `main` SHA.

## Close-out approval mechanics

- If a distinct Build identity opens the close-out PR, one Manraj approval is required.
- If GitHub identity makes Build and Manraj the same reviewer identity, formal self-review is neither required nor valid; Manraj's manual merge is the approval point.
- New commits invalidate any earlier approval and affected checks.
- A check run, PR creation, or copyable approval text never grants merge authority.

## Workflow safety

- Workflows use `pull_request`, never `pull_request_target`.
- PR-description `edited` events may run only cheap policy metadata; heavy verification and simulation do not run on `edited`.
- Pin Node `22.16.0`, the runner image, and action commit SHAs.
- Root permissions are exactly `contents: read`; job-level write permissions are forbidden.
- Checkout disables credential persistence.
- Concurrency cancels superseded runs.
- Secrets, write-capable tokens, deploys, uploads, releases, tags, Pages, Netlify, publication, and production commands are forbidden.

## Later ruleset design — specification only; not applied by this change

1. Keep recovery protection separate. Narrow ruleset `21051662` later to `recovery/e4f8440-nopub` only, preserving its recovery contexts.
2. Create separate active strict rulesets for `main` and `version/*`. Both are merge-only, block deletion and non-fast-forward updates, include administrators, and use literal owner-authenticated `bypass_actors=[]`.
3. Bind `main` to `main-release-policy`, `main-verify`, and `main-simulation-gate` with GitHub Actions integration `15368`.
4. Bind `version/*` to `version-release-policy`, `version-verify`, and `version-simulation-smoke` with GitHub Actions integration `15368`.
5. Leave tag ruleset `21051665` unchanged.

At the 2026-08-30 readback, ruleset `21051662` still actively covered `main`, `recovery/e4f8440-nopub`, and `version/*`; allowed merge, squash, and rebase; and required legacy contexts `release-policy`, `verify`, and `simulation-gate`. That truthful mismatch blocks protected-lane merge after this PR unless a separately authorized ruleset update resolves it. It does not authorize mutation or bypass here.
