# SUN-HITL-WIRE-02

Lane: `version/0.30.1-main-reconcile-ci.1`
Base: `637c0d0bc5009f93adc7ac6f84392b96133e5731` (PR **#388**)
Branch: `ticket/0.30.1-hitl-wire-02`
Seat: `$S2` · project `e110e334` only · never `56c33bbc`
Do not use dialog chat `894ff9e3` (DIALOG-KEYS remint-3 / #390).

Lock: `lane 0.30.1 · certified 0.28.1d · NO-PUBLISH · 0.36 PAINT`

## Owner GO

2026-09-27 Game Dev. Full wire + six late as-is.

RETRY_REASON: prior HITL wire remapped names only; approved pixels never landed.

**Cite:** `MEASURE_LIVE_VS_HITL_88.md` — FIX×6 map honesty. That file is a cite only (not on this tip). Do not invent a second FIX×6 list.

Do not remint `SUN-HITL-WIRE-01` (#290) or `SUN-HITL-WIRE-REMAP-01` (#307 / #349).
Do not merge unpaid #372 / #373 / #374 / #375.
Do not merge closed-unmerged #376.
Do not apply `docs/SUN_HITL_WIRE_01.state.js.patch`.

## Six late as-is (Myth filenames win)

FIX×6 from `MEASURE_LIVE_VS_HITL_88.md`. IN even if pack tags say `LIVE_old` or `candidate`.

| event_id | tip map @ 637c0d0 | as-is dest |
|---|---|---|
| `competence_watch` | `competence_watch.jpg` | `images/observation_bridge_alt.jpg` |
| `romance_lena_1` | `observation_bridge_alt_2.jpg` | `images/shower_lena.jpg` |
| `act2_tether_hand_elias` | `tether_ride.jpg` | `images/self_risk.jpg` |
| `vess_signal` | `vess_signal.jpg` | `images/transmission.jpg` |
| `vess_cost` | `vess_signal.jpg` | `images/transmission.jpg` |
| `act3_lethal_elias_order` | `work_elias.jpg` | `images/bond_elias.jpg` |

LANDED `arc_future_2` → `images/arc_future_2.jpg` (D2 slot_15 win; prior vault_interior_alt HOLD lifted).

Full wire = map + `scene.image` + `resolveSceneImage` split + verify invert together.
Living-path only. Dead fallbacks stay. Mira/Sela tether hands keep `tether_ride.jpg`. Sealant keeps `work_elias.jpg`. `lena_shower` may still own `shower_lena.jpg`.

This ticket lifts the #349 SKIP on keys 1–3 because owner GO named those dests as-is.

**Post-land note:** staged pack basename wins over the table dests above when the plate is present in `SUN_HITL_WIRE_STAGE_20260927.zip` (e.g. romance_lena_1→romance_lena_1.jpg, act2_tether_hand_elias→act2_tether_hand_elias.jpg, vess_cost→vess_cost.jpg, act3_lethal_elias_order→act3_lethal_elias_order.jpg). competence_watch kept tip (`competence_watch.jpg`) because `observation_bridge_alt.jpg` was not in stage.


## Pack holds (owner 2026-09-27)

- IGNORE thin `*52_76*` dupes. Do not wire or overwrite from that thin set.
- QUARANTINE `sun_hitl_feed_mac`. Do not copy, merge, or treat #374/`cdb920d` as paid pixels on this branch.
- Late zip cite `SUN_AT_HITL_52_76_PLUS_LATE_REAR.md` md5 `1fc16f97…` is a cite only — file not on this tip.
- No Imagine. No V153 webps. No Bot JPEG regen.

## Pixels on this branch

**LANDED** 2026-09-27 Mac fallback (Codex) after Grok `$S2` attach PASTE_FAIL / attach-reset loop.

- Stage: `SUN_HITL_WIRE_STAGE_20260927.zip` (89 jpgs + MANIFEST + IMAGE_MD5)
- Overwrote/added `images/*.jpg` same basenames from stage (do not delete unrelated)
- `src/state.js` `sceneImages` remapped: lead_together, arc_future_2 (NOT vault_interior_alt), mira_shower→shower_mira, rear trio, priority_ration, berths_manifest, plus staged-basename prefers for romance_lena_1 / act2_tether_hand_elias / vess_cost / act3_lethal_elias_order and every other event_id with `images/<event_id>.jpg` in stage
- Quarantine `sun_hitl_feed_mac` honored (not used)
- No Netlify. No certify. No merge.

## Holds

No Netlify. No certify. No 0.36 mint. No invented OPEN 0.37.
