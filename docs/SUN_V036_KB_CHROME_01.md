# SUN-V036-KB-CHROME-01

SOURCE main@8d23109b · RUNTIME 9a680fd2 · TASK SUN-V036-KB-CHROME-01 · MODE playable

Hex hour HARD+MC: Enter on first-seen content notice and title Begin was click-only. Gameplay Digit1–9 unchanged (PR84).

## Wire

`handleTitleChromeKeydown` on document:
- `#tone-screen` visible → `acknowledgeTone()` (same as I understand click)
- `#title-screen` visible, create/confirm hidden → click `#btn-begin` (opens commander-create when no save)
- Does not run while `#game-screen` is visible. Does not steal focused button Enter.

## Verify

1. Hard-refresh. Focus the window, do not click.
2. Enter on content notice → title. `PIN_RECEIPT` still 9a680fd2+.
3. Enter on title → commander-create (or intro if create panel absent).
4. `scripts/verify.mjs` check `0.36 title + tone chrome keyboard`.

No mint. No Netlify. Last certified `0.28.1d`.
