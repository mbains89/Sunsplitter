# PROGRESS — SUN-ROADMAP-FEEDS-1007-01

Branch: ticket/0.30.1-roadmap-feeds-1007-01
Base: version/0.30.1-main-reconcile-ci.1 @ 520be6ad
Mode: docs only. No game code. No Netlify. No VERSION/tag/certify.

## Done
- artifacts/ROADMAP.md rewritten on this branch: 0.36 PC Readiness through 1.0 (6 versions).
- Six paste-ready briefs under artifacts/feeds/:
  - SUN-FEED-KEYBOARD-CHOICE-01
  - SUN-FEED-NEW-RUN-CONFIRM-01
  - SUN-FEED-ENDING-SKIP-LABEL-01
  - SUN-FEED-WHAT-REMAINS-LABEL-01
  - SUN-FEED-SAVE-EXPORT-HONESTY-01
  - SUN-FEED-DESKTOP-MATRIX-HARNESS-01
- Branch tip before this file: 94cb392.

## Next
- Open one PR into version/0.30.1-main-reconcile-ci.1.
- Do not claim a queue ticket until that PR is open.
- Keyboard brief must stay overlay-only (src/pc-choice-keys.js). Do not edit src/engine.js.

## Decisions
- Left running and not re-briefed: Button States, Window Resize, 0.37 review build, crew-plate F07 (#433 already satisfies F07; do not merge Copilot #414).
- Paint stays 0.36. Last certified stays 0.28.1d. 0.37 is not OPEN.
- ASK-FIRST: damage-cause canon, ART-R2, Amara route, breast-cover toggle, calling 0.36 passed, opening 0.37, Netlify pin, close-out to main.
- Recruitment / V158 stays ON-HOLD. No Fast.

## Failing checks
- PR create was deduped and GitHub still showed no pull for this head as of the last public check. Compare URL was ready. Retrying.

## Next step
- Confirm PR number, then stop this roadmap job. Do not start the next product ticket until the PR is open and TICKETS.md has a READY row that is not ON-HOLD.
