# SUN-036-KEYBOARD-RUN-01

Lane base: `version/0.30.1-main-reconcile-ci.1` @ `5a17d633`.
Not a 0.36 mint. No VERSION bump. No tag. No Netlify. Last certified remains `0.28.1d`.

Prior packet `docs/SUN_V036_PC_KEYBOARD_RUN_01.md` (PR #252) is a manual checklist. It is not this ticket.

## What the job does

`scripts/keyboard-run.mjs` drives headless Chrome from a new run to an ending.
Inputs are only Tab, Shift-Tab, 1-9, Enter, and Space.
No mouse, no touch, no `showScene` / `makeChoice` / state writes.

It asserts:

- the focused element has a visible outline (style not `none`, width at least 2, on screen)
- every advance is a keyboard choice or a tabbed primary button
- Enter/Space changes the scene id at most once

Stop condition: `#ending-screen` visible and an ending title set.

## Player-visible fixes

- The passage keeps a visible outline while it holds keyboard focus, so number keys have a place to land.
- Content notice, Begin, Skip intro, and What remains take keyboard focus when their screen opens.
- Commander creation, new-run confirm, and the top-bar note open with focus on their confirm button.
- Dismissing the top-bar note returns focus to the passage.
- Enter/Space cannot apply the same order twice in one turn.
- Number keys do not advance the scene under the top-bar note or a confirm dialog.

Phone layout queries (`360px`, `480px`) are not edited. `--self-test` pins them.

## Local proof (headless Chrome)

Red, deliberate broken focus (`outline: none !important`), exit 1, no ending:

```
ENDING=none
STEPS=0
SCENE=
FOCUS=BUTTON#btn-tone-continue outline=none/3
PASS broken-focus case failed the visible-focus assert
```

Green, unmodified page, exit 0:

```
ENDING=Still Burning
STEPS=131
SCENE=ending_check
PASS keyboard-only ending
```

CI job `keyboard-run` runs the red case first and fails the job if that case exits 0, then runs the green case and requires `ENDING=` plus `STEPS=`.

Hex test review is required before merge.
