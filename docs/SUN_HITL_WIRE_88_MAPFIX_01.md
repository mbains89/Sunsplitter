# SUN-HITL-WIRE-88-MAPFIX-01

SOURCE main@8d23109b · IMAGE_BRANCH cdb920de28c429966096087348ac7b0533b8b61b · TASK SUN-HITL-WIRE-88-MAPFIX-01 · MODE implementation

Lock: `lane 0.30.1 · certified 0.28.1d · NO-PUBLISH · 0.36 PAINT`

Owner merge ask via Muse DM 2026-09-23. Cite `MEASURE_LIVE_VS_HITL_88.md` FIX×6 + Muse pack `Desktop/sun_hitl_feed_mac`.

**Myth PASS Slot15** recorded 2026-09-24. `arc_future_2` → `vault_interior_alt.jpg` (`7833c7859505`) is APPROVED. That wait is spent.

Supersedes unpaid #373 / #372. Do not remint those as paid. Image commits on `ticket/0.30.1-hitl-wire-88-01` @ `cdb920d` are reused — no JPEG regen.

No Netlify. No certify. No 0.36 mint. No invent OPEN. No second unpaid PR.

## MERGE STOP (not paid)

Owner asked merge. Refused this turn.

Reasons:
- GitHub `mergeable_state=blocked` on PR #376
- `src/state.js` remote blob still `4a6fc253` — sceneImages not FIX×6
- `src/engine.js` remote blob still `951b6155` — resolve not split
- `scripts/verify.mjs` not flipped
- version-verify not green

Merging scene.image-only would leave map+resolve lying against MEASURE FIX×6.

## Map FIX×6 (intended)

| event_id | Was | Myth/HITL now | Hash prefix |
|---|---|---|---|
| `competence_watch` | `competence_watch.jpg` | `observation_bridge_alt.jpg` | `820262588ae4` |
| `romance_lena_1` | `observation_bridge_alt_2.jpg` | `shower_lena.jpg` | `cd0981c0d0e8` |
| `act2_tether_hand_elias` | `tether_ride.jpg` | `self_risk.jpg` | `427fb4c5a722` |
| `vess_signal` | map `vess_signal.jpg` | `transmission.jpg` | `d95465bdb6a6` |
| `vess_cost` | map `vess_signal.jpg` | `transmission.jpg` | `d95465bdb6a6` |
| `act3_lethal_elias_order` | `work_elias.jpg` | `bond_elias.jpg` | `084655c278e2` |

Kept + PASS: `arc_future_2` → `vault_interior_alt.jpg` (`7833c7859505`).
