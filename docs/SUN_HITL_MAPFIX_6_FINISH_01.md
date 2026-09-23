# SUN-HITL-MAPFIX-6-FINISH-01

SOURCE main@8d23109b · RUNTIME 0e7535df45bffa08926c992e0995668246056526 · TASK SUN-HITL-MAPFIX-6-FINISH-01 · MODE implementation

Lock: `lane 0.30.1 · certified 0.28.1d · NO-PUBLISH · 0.36 PAINT`

Owner GO via Chief. Supersedes incomplete unpaid PR #372. Do not merge #372 as paid. Do not remint SUN-HITL-MAPFIX-6-01 as paid.

**This PR is incomplete.** Connector file-size limit blocked landing `src/state.js` + `src/engine.js` + `scripts/verify.mjs` in this seat. Do not merge as paid.

## Live tip truth

| event_id | Tip `0e7535df` | Myth target | This PR |
|---|---|---|---|
| `competence_watch` | map `competence_watch.jpg` | `observation_bridge_alt.jpg` | unpaid |
| `romance_lena_1` | `observation_bridge_alt_2.jpg` | `shower_lena.jpg` | unpaid (verify FORBIDS) |
| `act2_tether_hand_elias` | resolve `tether_ride.jpg` | `self_risk.jpg` | scene.image declared only; engine guard + verify unpaid |
| `vess_signal` | scene.image `transmission.jpg` | `transmission.jpg` | resolved already; map string unpaid |
| `vess_cost` | scene.image `transmission.jpg` | `transmission.jpg` | resolved already; map string unpaid |
| `act3_lethal_elias_order` | resolve `work_elias.jpg` | `bond_elias.jpg` | unpaid (verify FORBIDS) |

## This PR diff (F1)

- `docs/SUN_HITL_MAPFIX_6_FINISH_01.md`
- `src/scenes-11.js` (`act2_tether_hand_elias.image` → `self_risk.jpg`; resolve still `tether_ride` until engine lands)

Not in this diff: `src/state.js`, `src/engine.js`, `src/scenes-03.js`, `src/scenes-23.js`, `src/scenes-41.js`, `scripts/verify.mjs`, `scripts/art-r2-playtest-close-checks.mjs`, `scripts/playtest-art-event-audit-checks.mjs`, `scripts/remains-lean-checks.mjs`.

No JPEG. No Slot15 invent. No 0.36 mint. No Netlify. No certify. Muse pixel pack PARKED.
