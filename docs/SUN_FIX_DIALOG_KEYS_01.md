# SUN-FIX-DIALOG-KEYS-01

Lane: version/0.30.1-main-reconcile-ci.1
Base: 04c4a8060993a90b6c512dcef21d0fd485528920
Branch: ticket/0.30.1-fix-dialog-keys-01
Lock: lane 0.30.1 · certified 0.28.1d · NO-PUBLISH · 0.36 PAINT

## Intent
Keyboard users must not make story choices while a modal dialog is open.

## Runtime (`src/validate.js`)
- Capture-phase `keydown` via `handleModalDialogKeydown` swallows `1-9`, Enter, Space while a visible modal is open.
- Visible means `.visible` and not `.hidden` on tutorial, commander-create, new-run-confirm, crew-sheet.
- Open focuses the primary button; close restores the opener.
- Does not touch `state.js` / `engine.js`.
- Does not apply `docs/SUN_HITL_WIRE_01.state.js.patch`.

## Check
`scripts/dialog-keys-checks.mjs` — `dialogKeysChecks`.

No 0.36 mint. No Netlify. No certify. No OPEN invent.
