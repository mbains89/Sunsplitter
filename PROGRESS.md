# PROGRESS — SUN-ROADMAP-FEEDS-1007-01

Branch: ticket/0.30.1-roadmap-feeds-1007-01
Base: version/0.30.1-main-reconcile-ci.1 @ 520be6ad
Updated: 2026-10-07

## Done
- artifacts/ROADMAP.md rewritten for 0.36 PC Readiness through 1.0 (6 versions).
- Six paste-ready briefs under artifacts/feeds/.
- No game code. No VERSION.md. No certify. No Netlify.
- F07 not reminted. Button States, Window Resize, and 0.37 review build not re-briefed.

## Next
- Open one PR into version/0.30.1-main-reconcile-ci.1.
- After the PR is open, claim the next READY ticket in TICKETS.md if that file exists. Do not claim ON-HOLD (V158 Recruitment).

## Decisions
- Keyboard brief must use overlay src/pc-choice-keys.js, not src/engine.js. The 94cb392 text still names engine.js; builders follow the overlay rule.
- Damage-cause, ART-R2, Amara route, breast-cover toggle, 0.36 passed, 0.37 open, Netlify pin, and close-out to main are ASK-FIRST.
- Portraits: needs approved art. Do not generate.

## Failing checks
- PR create was deduped on 2026-10-07 and no pull number existed at stop. Recheck before this heartbeat still showed no open PR for this head.

## Next step
- Push this file, then open the single docs PR. Stop line only after the PR number is real or the create fails again with proof.
