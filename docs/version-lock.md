# Sunsplitter version lock

This is the lane lock note. It does not invent `GAME_VERSION`. Player-facing paint remains the existing `VERSION.md` string at the named SHA. This file is not a certification, publish, tag, or deploy.

## Lock

lane 0.30.1 · certified 0.28.1d · NO-PUBLISH · 0.36 HOLD

## Meaning

- **Lane:** `version/0.30.1-main-reconcile-ci.1`
- **Certified stays:** `0.28.1d`
- **Release:** `NO-PUBLISH` / `NOT_CERTIFIED`
- **0.36:** HOLD — do not mint, open, or paint 0.36

Existing CI already covers version-route policy via `.github/workflows/release-policy.yml` job `version-release-policy`. This note does not add a new workflow and does not change rulesets.

## After-merge receipt

After a ticket PR merge-commits into the lane, the implementer posts on that PR:

`MERGED_TIP: <sha> · PARENTS: <p1> <p2> · VERSION_PAINT: <string>`

- `<sha>` is the merge-commit SHA on the lane.
- `<p1> <p2>` are that merge commit's two parents.
- `<string>` is the current `VERSION.md` paint plus the lock line above. Do not invent a new product version to fill the field.

PR PROOF must include `FILES TOUCHED:` and `DIFF STAT:` as defined in `.github/PULL_REQUEST_TEMPLATE.md`. Orchestrator treats that comment plus this lock note as the receipt. Do not re-read the full diff or CI logs unless the receipt is missing, `DIFF STAT:` is missing, or the lock line is contradicted.
