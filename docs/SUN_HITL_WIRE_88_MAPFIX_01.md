# SUN-HITL-WIRE-88-MAPFIX-01

SOURCE main@8d23109b · IMAGE_BRANCH cdb920de28c429966096087348ac7b0533b8b61b · TASK SUN-HITL-WIRE-88-MAPFIX-01 · MODE implementation

Lock: `lane 0.30.1 · certified 0.28.1d · NO-PUBLISH · 0.36 PAINT`

Owner GO via Muse DM 2026-09-23 ~5:26pm CT. Cite `MEASURE_LIVE_VS_HITL_88.md` FIX×6 + Muse pack `Desktop/sun_hitl_feed_mac`.

Supersedes unpaid #373 / #372. Do not remint those as paid. Image commits on `ticket/0.30.1-hitl-wire-88-01` @ `cdb920d` are reused — no JPEG regen.

**WAIT_MYTH_PASS_SLOT15** before merge-as-paid. Slot15 owner unlocked+APPROVED → `vault_interior_alt.jpg` (map already; pixels on image branch). Slot02 lead_together pixels forced onto `observation_bridge_alt.jpg` (`820262588ae4`).

No Netlify. No certify. No 0.36 mint. No invent OPEN.

## Map FIX×6

| event_id | Was | Myth/HITL now | Hash prefix |
|---|---|---|---|
| `competence_watch` | `competence_watch.jpg` | `observation_bridge_alt.jpg` | `820262588ae4` |
| `romance_lena_1` | `observation_bridge_alt_2.jpg` | `shower_lena.jpg` | `cd0981c0d0e8` |
| `act2_tether_hand_elias` | `tether_ride.jpg` | `self_risk.jpg` | `427fb4c5a722` |
| `vess_signal` | map `vess_signal.jpg` (scene already transmission) | `transmission.jpg` | `d95465bdb6a6` |
| `vess_cost` | map `vess_signal.jpg` (scene already transmission) | `transmission.jpg` | `d95465bdb6a6` |
| `act3_lethal_elias_order` | `work_elias.jpg` | `bond_elias.jpg` | `084655c278e2` |

Kept: `arc_future_2` → `vault_interior_alt.jpg` (`7833c7859505`).

Death fallbacks unchanged (`corridor_pressure_3.jpg` for dead Elias on tether-hand and lethal-order). `act3_lethal_elias_sealant` stays `work_elias.jpg`. Mira/Sela tether hands stay `tether_ride.jpg` via resolve. `lena_shower` still `shower_lena.jpg`. competence_watch `!jiro` fallback unchanged.

## Files

- `src/state.js` sceneImages
- `src/engine.js` resolveSceneImage (split order vs sealant; split Elias tether vs Mira/Sela)
- `src/scenes-03.js` / `src/scenes-11.js` / `src/scenes-23.js` / `src/scenes-41.js`
- `scripts/verify.mjs` + `art-r2-playtest-close-checks.mjs` + `playtest-art-event-audit-checks.mjs` + `remains-lean-checks.mjs`
- this receipt
