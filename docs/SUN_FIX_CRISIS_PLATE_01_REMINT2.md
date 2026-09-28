# SUN-FIX-CRISIS-PLATE-01-REMINT2

Base: `048c7a506e7cfe1e7ff0e8681656fed7c55498ac` (merge #399).
Branch: `ticket/0.30.1-fix-crisis-plate-01-remint2`.

## RETRY_REASON

#399 merged at `048c7a50`, but merge diff vs first parent is only `docs/SUN_FIX_CRISIS_PLATE_01.md`.
Remint commits deleted `src/sun-fix-crisis-plate-01.js` and never folded the wrap into `src/engine.js`.
Live `resolveSceneImage` still returned `images/corridor.jpg` when crisis / priority_repairs / aftermath were missing Amara, Jiro, or Sela. That plate reads as a Vess lookalike before `recovered.vess` (Myth REJECT still open).

## Change

In `src/engine.js` `resolveSceneImage`, crisis / priority_repairs / aftermath missing-cast fallback:

- `isAlive("vess")` → `images/corridor_variant.jpg`
- else → `images/mira.jpg` (L-030-safe official tank-top; already in tree)

Never returns `corridor.jpg` on this path. No new JPEG. No extra indexed script. Overlay file not present at tip; none added.

## Manual

Early `priority_repairs` with Jiro unrecovered and Vess not boarded should show Mira, not Vess.

## Out of scope

No OPEN mint. No GAME_VERSION. No Netlify. No Imagine.
