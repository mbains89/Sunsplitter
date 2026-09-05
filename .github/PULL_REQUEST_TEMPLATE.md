# Pull request

Fill this template before review. Orchestrator reads the PROOF block as the receipt. Do not omit fields.

## Summary

- Ticket:
- Lane:
- Base SHA:

## PROOF

```
TICKET:
BASE:

GOAL CHECKS:
- [ ] check 1 — evidence:
- [ ] check 2 — evidence:
- [ ] check 3 — evidence:

VERSION PAINT:
VERSION LOCK: lane 0.30.1 · certified 0.28.1d · NO-PUBLISH · 0.36 HOLD

RECEIPT:
- PR:
- HEAD sha:
- CI: (optional; existing version-release-policy / version-verify / version-simulation-smoke)
- merge method required: merge-commit (no squash, no tag, no deploy)

FILES TOUCHED:
-

DIFF STAT:
- files changed:
- insertions:
- deletions:
```

`FILES TOUCHED:` must match the `/goal` `touch:` list. A gap is a fail.

`DIFF STAT:` is required. Use a short `git diff --stat` summary (`N files changed, +X, -Y`). Wholesale regenerations (validate.js-class) must be visible here. A missing line is a fail.

## After merge

Post a PR comment, exactly:

`MERGED_TIP: <sha> · PARENTS: <p1> <p2> · VERSION_PAINT: <string>`

Then stop. Do not start the next ticket.

## Prohibitions

- No 0.36
- No Netlify
- No certify
- No squash / tag / deploy / clone-as-proof
- No remint of a spent ticket
- No touch of PR 45 / draft PR 46 unless the goal names them
