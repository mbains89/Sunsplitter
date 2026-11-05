# SUN-V036-PC-KEYBOARD-01

SOURCE main@8d23109b · RUNTIME 2d3943d5b967a30fe9c68a90168b264129765ce3 · TASK SUN-V036-PC-KEYBOARD-01 · MODE verification

Owner OPEN 2026-09-16 0.36 PC evidence · ROADMAP L-011 / §0.36 workstream 1.
Revalidate PR 84 keyboard controls on the candidate after STYLE-BIBLE-LOCK #248.
Paint **0.36**. Lock: `lane 0.30.1 · certified 0.28.1d · NO-PUBLISH`.
No Electron/Tauri/gamepad/cloud saves. No PC-only story. No Netlify. No certify.
Do not start widescreen/hover matrix or BODY-REFERENCE on this branch.

## Result

**ALREADY_SATISFIED** on tip `2d3943d5`. No engine gap to fix.

## Evidence (tip files)

`src/engine.js` still carries PR 84 wiring:
- `aria-keyshortcuts` 1–9 on rendered `.choice-btn`
- single enabled choice also lists `Enter Space`
- `handleGameplayKeydown` + `wireGameplayKeyboard` document keydown
- number keys activate enabled rendered choices; disabled numbers do not consume
- Enter/Space advance only when exactly one enabled choice
- interactive targets and modifier chords are left to native handling
- shortcuts idle when `#game-screen` is hidden

`scripts/verify.mjs` still runs `keyboardChoiceChecks` as printCheck `"0.32 keyboard choice controls"` (lines ~1972 and ~5289 at this tip).

## Out

Visible-focus polish beyond existing a11y tokens, hover matrix, widescreen plate, and a full human start-to-end keyboard play are later 0.36 workstreams. This ticket does not claim 0.36 PC exit.
