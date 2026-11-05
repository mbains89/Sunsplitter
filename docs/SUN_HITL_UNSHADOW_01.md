# SUN-HITL-UNSHADOW-01

Ticket: `SUN-HITL-UNSHADOW-01`
Lane: `version/0.30.1-main-reconcile-ci.1`
Base tip: `5efeb070951204e196026d1fce9b8f9a044c0a37` (merge PR #432)
Branch: `ticket/0.30.1-hitl-unshadow-01`
Not ALREADY_SATISFIED at that tip.

## Defect

C1 plate gap: Crew close left `#scene-image-wrap` minimized and did not rebind `#scene-image`. Empty tab restore could leave the plate cleared.

## Fix

- Overlay `src/hitl-unshadow.js` wraps `toggleCrewPanel` (rebind on open and close; removes `minimized` on close) and `restorePresentationImages` (rebind only if managed src is empty).
- `index.html` loads the overlay after `src/validate.js`.
- `scripts/verify.mjs` `EXPECTED_SCRIPTS` admits `src/hitl-unshadow.js` after `src/validate.js` (version-verify 59→60). Same overlay-admit pattern as a named script in the browser load order.
- `src/engine.js` not edited. Blob `c5a5c374`, 93575 bytes. No hollow marker. No `state.js` patch. Truthy `scene.image` still wins.

No Netlify. No certify. No invent OPEN. F07 not reminted.

## CI remint

Prior head `ca5809c1` failed version-verify: actual script list included `src/hitl-unshadow.js`, expected list omitted it. This commit adds that path to `EXPECTED_SCRIPTS` only.
