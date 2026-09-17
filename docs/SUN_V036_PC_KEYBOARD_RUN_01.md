# SUN-V036-PC-KEYBOARD-RUN-01

SOURCE main@8d23109b · RUNTIME 6126f75e070d3a5478d39304fa71958a73996d51 · TASK SUN-V036-PC-KEYBOARD-RUN-01 · MODE verification

0.36 PC Readiness workstream 1 follow-on after SUN-V036-PC-KEYBOARD-01 (#249) and CREW-SHEET (#251).
Docs + checklist only. Does not mint or certify 0.36. Netlify HOLD. Last certified remains `0.28.1d`.
Machine evidence already on tip: `keyboardChoiceChecks` in `scripts/verify.mjs` (`"0.32 keyboard choice controls"`).
This packet is the human start-to-end keyboard-only run. Mouse may not be used except to focus the window.

## Controls on tip

- Number keys `1`–`9` activate the matching rendered `.choice-btn` when enabled.
- `Enter` / `Space` advance only when exactly one enabled choice is on screen.
- `Escape` closes the crew sheet (leaves the crew name list).
- Tab moves native focus; focused buttons keep native click and must not be stolen by the global shortcut.

## Checklist (one sitting, one pass)

Record PASS / FAIL / BLOCKED. A FAIL is a later one-concern ticket, not a 0.36 mint.

1. [ ] Tone / title: Tab to **New run** (or Continue), activate with Enter/Space. No mouse.
2. [ ] Intro cinematic: advance frames with the on-screen Next control via Tab+Enter, or skip via Tab+Enter on Skip. Escape must not dump out of a required gate without a visible control.
3. [ ] First playable scene (`wake` or resume scene): visible focus lands on a choice or a chrome control. Number key `1` takes the first enabled choice.
4. [ ] Disabled / gated choice: its number key does not consume and does not change scene.
5. [ ] Single-choice beat: Enter and Space each advance once across two such beats.
6. [ ] Crew chrome: Tab to Crew, Enter opens the name list; Tab/number to a name opens the full-screen sheet; Escape returns to the list; Crew toggle closes both.
7. [ ] Sheet content: portrait + role + bio + Condition only. No Trust/Affinity numbers (CREW-SHEET #251).
8. [ ] Mid-run: at least ten choice advances using only number keys plus one Enter/Space single-choice advance.
9. [ ] Save/resume: reach title via existing keyboard path if one exists; otherwise mark BLOCKED (do not invent a title hotkey here).
10. [ ] Ending or What Remains bookend: if reached this sitting, Tab to Play again / title control and activate without mouse. If not reached, mark SKIP — packet still stands as mid-run evidence.

## Result line (fill on the run)

`OPERATOR:`  
`DATE:`  
`TIP:` 6126f75e070d3a5478d39304fa71958a73996d51  
`OUTCOME:` OPEN — not certified

This file is not 0.36 PC exit.
