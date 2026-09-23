# SUN-HITL-MAPFIX-6-FINISH-01

SOURCE main@8d23109b · RUNTIME 0e7535df45bffa08926c992e0995668246056526 · TASK SUN-HITL-MAPFIX-6-FINISH-01 · MODE implementation

Lock: `lane 0.30.1 · certified 0.28.1d · NO-PUBLISH · 0.36 PAINT`

Owner GO via Chief. Supersedes incomplete unpaid PR #372. Do not merge #372 as paid. Do not remint SUN-HITL-MAPFIX-6-01 as paid.

Cite Muse `MEASURE_LIVE_VS_HITL_88.md` mismatches×6. Myth filenames win; verify updated with the map.

No JPEG byte overwrite. No Slot15 `arc_future_2` invent. No 0.36 mint. No Netlify. No certify.
Muse pixel pack remains PARKED — remaps ≠ art fixed.

## Six keys

| event_id | Was (LIVE 0e7535df) | Myth/HITL now |
|---|---|---|
| `competence_watch` | `competence_watch.jpg` | `observation_bridge_alt.jpg` |
| `romance_lena_1` | `observation_bridge_alt_2.jpg` | `shower_lena.jpg` |
| `act2_tether_hand_elias` | `tether_ride.jpg` | `self_risk.jpg` |
| `vess_signal` | scene already `transmission.jpg` | map + scene `transmission.jpg` |
| `vess_cost` | scene already `transmission.jpg` | map + scene `transmission.jpg` |
| `act3_lethal_elias_order` | `work_elias.jpg` | `bond_elias.jpg` |

Death fallbacks unchanged (`corridor_pressure_3.jpg` for dead Elias on tether-hand and lethal-order). `act3_lethal_elias_sealant` stays `work_elias.jpg`. `lena_shower` still `shower_lena.jpg`. Mira/Sela tether hands unchanged.

## Files in this diff

- `src/state.js` sceneImages
- `src/engine.js` resolveSceneImage living guards (split order vs sealant; split Elias tether vs Mira/Sela)
- `src/scenes-03.js` / `src/scenes-11.js` / `src/scenes-23.js` / `src/scenes-41.js` declared `image`
- `scripts/verify.mjs` + `art-r2-playtest-close-checks.mjs` + `playtest-art-event-audit-checks.mjs` + `scripts/remains-lean-checks.mjs`
- this receipt

Index script manifest unchanged. No overlay.
