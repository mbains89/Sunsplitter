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
 <n> files changed, <ins> insertions(+), <del> deletions(-)
 <path> | <added|deleted|±N>
```

`FILES TOUCHED:` must match the `/goal` `touch:` list. A gap is a fail.

`DIFF STAT:` must be exact `git diff --stat` (or GitHub Files changed totals) against BASE. No `~` estimates when exact numbers exist. Every path line must match `FILES TOUCHED:`. Extra or missing path is a fail. Placeholder `<n>` / `<path>` left unchanged is a fail.

A wholesale single-file regeneration (`validate.js`-class rewrite, full-file replace) must still list that path with its full insertions and deletions. Do not hide it as "1 file changed" without per-path ±. Totals that disagree with GitHub Files changed are a fail.

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
