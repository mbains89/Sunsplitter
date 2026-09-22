# SUN-CREW-BOARD-FOLLOW-CLARITY-01

SOURCE main@8d23109b · RUNTIME daf19f8b3e0558b915addc5ba3aff4bb09af1c18 · TASK SUN-CREW-BOARD-FOLLOW-CLARITY-01 · MODE implementation

Lock: `lane 0.30.1 · certified 0.28.1d · NO-PUBLISH · 0.36 PAINT`

One concern: opening Crew must show the living chip board. The full-screen sheet must not cover that board on the first tap.

## Defect

`#btn-crew` → `toggleCrewPanel()` → `renderCrewPanel("lena")` → `wireCrewCharacterSheet` wrap → `openCrewSheet("lena")`.

The player who just read “His name is on the board” never sees the board.

## Change

- Keep `renderCrewPanel("lena")` on open so `crewOverviewChecks` still sees panel `Trust: 40/100` / Romance / Condition.
- Hold `#crew-sheet` closed for that open pass (`crewBoardOpenPass`).
- A later `renderCrewPanel(selectedKey)` or chip tap still opens the official bodysuit sheet.
- Do not remint Tomas / Jiro / Vess board sentences. Do not mint 0.36. No Netlify.

## Files

- `src/validate.js`
- `scripts/playtest-crew-character-screen-checks.mjs`
- `scripts/playtest-crew-board-follow-clarity-01-checks.mjs`
- `docs/SUN_CREW_BOARD_FOLLOW_CLARITY_01.md`

## Holds

No scenes-11/14/17. No VERSION.md. No JPEG. No #297 / #304. No main close-out.
