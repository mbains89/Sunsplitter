# SUN-LETHAL-RESUME-DEATHBEAT-01 — ALREADY_SATISFIED

SOURCE lane@61ddfd95 · TASK SUN-LETHAL-RESUME-DEATHBEAT-01 · MODE docs/harness

Lock: `lane 0.30.1 · certified 0.28.1d · NO-PUBLISH · 0.36 PAINT`

## Verdict

**ALREADY_SATISFIED.** Do not remint lethal scenes or `scripts/verify.mjs`.

Resume on `act3_lethal_*_end` already shows the death beat once on current saves. A second resume does not re-kill. The mechanism is the PR #71 `sceneEntered` + `skipOnEnter` path, which `resumeEntryIdempotenceChecks` already exercises (fixture is `act2_tether_sighting`; the skip is global).

## Cited lines

1. `src/engine.js` `snapshotState()` writes `sceneEntered: true` on every current persist.
2. `src/engine.js` `loadGame()`:
   `showScene(state.scene, { skipOnEnter: sceneEntered, resume: true })`
   with `sceneEntered = data.sceneEntered === true`.
3. `src/engine.js` `showScene()`:
   `if (scene.onEnter && !opts.skipOnEnter)` — skip means no second `onEnter`.
4. `src/scenes-20.js` `act3_lethal_lena_end.onEnter` is the kill / redirect-if-already-dead site. Skip keeps the beat text and does not call `kill()` again.
5. `scripts/verify.mjs` `resumeEntryIdempotenceChecks` — printCheck `"resume preserves completed scene entry"`. First persist + loadGame must not re-run onEnter; legacy markerless gets one compatibility entry then adopts the marker.

## What a second resume would do if skip were missing

`act3_lethal_lena_end.onEnter` after Lena is dead returns `"act3_vault_face"` (skips the beat) and never re-calls `kill` because `!isAlive("lena")`. Re-kill is already guarded. The honesty risk is **skipping the beat**, not double-death. `skipOnEnter` on current saves prevents that redirect.

## Holds honored

- No new lethals
- No 0.36 OPEN / mint
- No Netlify
- No art wire
- Certified stays `0.28.1d`
- `NO-PUBLISH`
