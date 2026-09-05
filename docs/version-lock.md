# Sunsplitter version lock

This is the lane lock note. It does not invent `GAME_VERSION`. Player-facing paint remains the existing `VERSION.md` string at the named SHA. This file is not a certification, publish, tag, or deploy.

## Lock

lane 0.30.1 · certified 0.28.1d · NO-PUBLISH · 0.36 HOLD

## Meaning

- **Lane:** `version/0.30.1-main-reconcile-ci.1`
- **Certified stays:** `0.28.1d`
- **Release:** `NO-PUBLISH` / `NOT_CERTIFIED`
- **0.36:** HOLD — do not mint, open, or paint 0.36

Existing CI covers version-route policy via `.github/workflows/release-policy.yml` job `version-release-policy`. The same workflow file also runs job `version-lock-ci` (`scripts/version-lock-ci.mjs`), which refuses 0.36 mint/paint and requires the lock line above. This note does not add a third workflow file and does not change rulesets.

PR / PROOF receipts must include `DIFF STAT:` (see `.github/PULL_REQUEST_TEMPLATE.md` and `AGENTS.md` § Receipts).

## After-merge receipt

After a ticket PR merge-commits into the lane, the implementer posts on that PR:

`MERGED_TIP: <sha> · PARENTS: <p1> <p2> · VERSION_PAINT: <string>`

- `<sha>` is the merge-commit SHA on the lane.
- `<p1> <p2>` are that merge commit's two parents.
- `<string>` is the current `VERSION.md` paint plus the lock line above. Do not invent a new product version to fill the field.

Post-merge floor wakes echo that same `MERGED_TIP` line (sha + parents + paint) and keep the `DIFF STAT:` / `version-lock-ci` pointers above. Do not invent a second orchestrator.

Orchestrator treats that comment plus this lock note as the receipt. Do not re-read the full diff or CI logs unless the receipt is missing or the lock line is contradicted.
