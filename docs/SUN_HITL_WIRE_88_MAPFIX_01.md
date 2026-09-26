# SUN-HITL-WIRE-88-MAPFIX-01 / FINISH-03

Lock: `lane 0.30.1 · certified 0.28.1d · NO-PUBLISH · 0.36 PAINT`

Myth PASS Slot15 DONE. **MERGE STOP.** Do not merge #376.
No second unpaid PR. No JPEG regen. No Netlify. No certify. No 0.36 mint.

## Landed on PR #376 this seat

- `scripts/playtest-art-event-audit-checks.mjs` FIX×6 needles @ `2acdcc70` / blob `9913a311`
- scene.image FIX×6 (scenes-03/11/23/41) prior
- remains-lean + art-r2-playtest-close expected plates prior

## STOP — truncated state.js

`src/state.js` @ `0c6a6db` is a **1656-byte stub** (SHA `555576fb`). Worse than placeholder `d9cdf0ac`.
Grok Fast Contents API truncated the 39k restore. Do not treat as paid.

Restore path: drop full lane `0e7535df` `src/state.js` plus FIX×6 map lines onto this same branch via GitHub web UI.

FIX×6 map lines:
- competence_watch → images/observation_bridge_alt.jpg
- romance_lena_1 → images/shower_lena.jpg
- act2_tether_hand_elias → images/self_risk.jpg
- act3_lethal_elias_order → images/bond_elias.jpg
- vess_signal → images/transmission.jpg
- vess_cost → images/transmission.jpg

## Still unpaid

| file | needed |
|---|---|
| `src/state.js` | full ~39k restore + FIX×6 |
| `src/engine.js` | split resolve: elias tether → self_risk; elias order → bond_elias; sealant stays work_elias |
| `scripts/verify.mjs` | flip expected/forbidden for those three truth checks |

Patched copies prepared this turn locally (`/tmp/state-mapfix.js`, `/tmp/engine-mapfix.js`, `/tmp/verify-mapfix.js`). Not on remote except the audit file.
