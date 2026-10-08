# SUN-CORRECT-01 progress

## done
- Branch `ticket/sun-correct-01` from lane tip `520be6ad` (merge #434).
- Mined classes: hollow stubs (#416 head `b6284dce`, engine.js 27 bytes), tip-sync churn (#423–#434), portrait `images/corridor.jpg` copies (3 live returns in `src/engine.js` grandfathered).
- Version paint already owned by `scripts/version-lock-ci.mjs` (PAINT 0.36). Not reminted.
- Guards landed: `scripts/guards/hollow-stub.mjs`, `scripts/guards/tip-sync-churn.mjs`, `scripts/guards/portrait-fallback.mjs`, `scripts/guards/run-all.mjs`.
- New workflow `.github/workflows/repo-guards.yml` job `repo-guards` (existing workflows not edited).

## next
- Prove each guard fails on a past SHA / replay, passes on tip.
- Open PR into `version/0.30.1-main-reconcile-ci.1` with rule→enforcer table and FIX FOR OWNER for live corridor.jpg returns.

## decisions
- Do not edit `src/engine.js`. Exact eng=93575 pin is the byte-lock fight; floor is >=90000 plus `function resolveSceneImage` plus stub-marker reject.
- Fail tip-sync and corridor.jpg only on additions.
- AGENTS.md is not on the lane. Table stays in the PR body for Ori.

## failing checks
- none yet (proof commands next).

## next step
- Run proof commands and open the PR.
