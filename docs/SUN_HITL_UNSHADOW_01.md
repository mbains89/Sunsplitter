# SUN-HITL-UNSHADOW-01

Ticket: `SUN-HITL-UNSHADOW-01`
Lane: `version/0.30.1-main-reconcile-ci.1`
Base tip: `5efeb070951204e196026d1fce9b8f9a044c0a37` (merge PR #432; parents `815906c0` + `344c043d`)
Not ALREADY_SATISFIED at that tip.

## Defect

C1 plate gap: `resolveSceneImage` treated any `scene.image` as an override, and the Crew / tab path never put the resolved plate back on `#scene-image`.

## Fix

- Blank `scene.image` no longer shadows `sceneImages[id]`. A real explicit plate still wins.
- `rebindScenePlate()` runs on Crew open, Crew close, and empty tab restore.
- `src/engine.js` stays in the 93KB class (94994). No `state.js` patch. No `src/engine.js` hollow.

No Netlify. No certify. No invent OPEN. F07 not reminted.
