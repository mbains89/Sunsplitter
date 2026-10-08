# PROGRESS — SUN-036-PC-STATES-01

Seat $S2. Lane `version/0.30.1-main-reconcile-ci.1`. Branch `ticket/0.30.1-sun-036-pc-states-01`.

## Done
- Tip at launch: `520be6ad` after #434. Keyboard ticket had not landed.
- Plan: choice / .btn / tutorial / title / reduced-motion already distinct. Intro bar and crew open-state were the gaps.
- `css/intro-nav.css` hover split from focus-visible and active. 48px kept. Commit `0bd46a0b`.
- `css/crew-sheet.css` open crew and selected chip split from hover. Commit `6fc6000c`.
- No `src/engine.js`. No VERSION.md. No Netlify. No certify. #257 not reminted.

## Next
- PR into the lane is not open. The create card was shown and not submitted.
- Do not claim a next ticket until this PR is open.
- `TICKETS.md` is not on the lane. Do not invent one. Do not claim ON-HOLD rows.

## Decisions
- Crew overrides live in `css/crew-sheet.css` because it loads after `css/style.css`. The 26KB style sheet was not rewritten.
- Banlist #401–#411 / #414 / #416 not touched.

## Failing checks
- None yet. CI has not run because the PR is not open.

## Next step
- Submit the pull-request card. After it is open, wait for checks. Then claim the next READY row only if `TICKETS.md` exists.
