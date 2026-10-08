# SUN-FEED-KEYBOARD-CHOICE-01

SOURCE lane version/0.30.1-main-reconcile-ci.1@520be6ad4d8dcfc26df0e6668ee81de458bf17ad · TASK SUN-FEED-KEYBOARD-CHOICE-01 · MODE implementation
Owner approved roadmap restock 2026-10-07. Does not certify. Does not mint 0.36. Does not open 0.37. No Netlify.

## Visible change

On a desktop keyboard, the player can move a visible focus among the choices on screen and activate the focused choice with Enter or Space, and can press 1-9 to pick a numbered choice, without using the mouse. Disabled choices do not activate.

## Already done only counts with proof

Already done only counts with proof, then start the next queued job in the same run.
Proof means a merged lane PR whose diff shows the overlay loaded from index.html, plus a harness that fails if number-key or Enter activation is absent. Paper in docs/SUN_V036_PC_KEYBOARD_01.md is not proof. PR 84 is early evidence only, not exit. If proof exists, say so in the PR body and continue to artifacts/feeds/SUN-FEED-NEW-RUN-CONFIRM-01.md in the same run.

## Do not touch

- css/style.css (Button States and Window Resize own it).
- src/engine.js (hollow PRs already fight over it. Do not merge #389 #390 #397 #401 #403 #411).
- Crew plate / F07 / Copilot #414.
- Portraits. No image generation.
- VERSION.md, PROJECT_STATUS.md, TICKET_QUEUE.md, LOCKS.md, Netlify.

## Files

- Add src/pc-choice-keys.js (new overlay, after validate.js).
- index.html: one script tag for that overlay.
- scripts/pc-choice-keys-checks.mjs: static proof the tag exists and the overlay binds keydown on #main choices only.
- docs/SUN_FEED_KEYBOARD_CHOICE_01.md: thin receipt.

## Acceptance

- Focus ring moves with ArrowUp/ArrowDown across enabled choices only.
- Enter and Space activate the focused enabled choice once.
- Keys 1-9 activate that enabled choice if it exists.
- A disabled choice does not fire.
- Modal or crew sheet open: overlay does not also activate a scene choice.
- Phone layout unchanged. No new scene, flag, or ending.

## Dependencies

After Button States only if focus-visible is missing. Parallel with SUN-FEED-SAVE-EXPORT-HONESTY-01 and SUN-FEED-DESKTOP-MATRIX-HARNESS-01. Serialize index.html script-order edits.

## Pull request

Branch ticket/0.30.1-keyboard-choice-01 off the lane. One PR into version/0.30.1-main-reconcile-ci.1. Title: SUN-FEED-KEYBOARD-CHOICE-01: keyboard activates the focused choice.

IDLE_FOR_ORCH · SUN-FEED-KEYBOARD-CHOICE-01 · PR|NO_PR · reason
