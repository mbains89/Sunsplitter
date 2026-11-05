# Sunsplitter — Scene Index

`SOURCE version/0.30.1-main-reconcile-ci.1 @ 6cf8fed318e8ec7a90647be7122b962b0f471dd2 · TICKET SUN-SCENE-INDEX-01 · MODE docs`

**Scene count:** 225 unique IDs across `src/scenes-01.js` … `src/scenes-55.js`.
**File count:** 55. Do not confuse file count with scene count.
**Load order:** `src/state.js` → `src/scenes-01.js` … `src/scenes-55.js` → `src/engine.js` → `src/validate.js`.

This file is a map. It does not change gameplay. Numbered files exist because of the `0.28.1c` GitHub push-size split — **not** because they follow act order. `scenes-01.js` is mid-game. `scenes-38.js` is the opening wake.

Spine anchors (display-only; not file-split points):

| Anchor | File | When |
|---|---|---|
| `act2_spine_next` | `src/scenes-12.js` | after Tomas recovery, before Jiro |
| `act3_spine_next` | `src/scenes-16.js` | after vault + Vess window |
| exclusive entry | `faction_split` → `act3_crisis_router` | `src/scenes-25.js` → `src/scenes-53.js` |

Image authority (read-only note; no rewires in this ticket):

1. `resolveSceneImage` `eventArt` table
2. death / recovery / crisis guards in that same function
3. `scene.image` on the scene object
4. `state.sceneImages[id]` fallback

How to use: look up a scene ID in the alphabetical table, then open that file.

---

## Files in load order

See local artifacts/SCENE_INDEX.md for the full 225-ID by-file and alphabetical tables if this blob is truncated in review UI. The committed file on this branch is the complete map.
