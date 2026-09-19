# SUN-HITL-WIRE-01

Tip base: `f97520dff1ea6cce0ace5b96b965e0c56ed74d8e` (lane `version/0.30.1-main-reconcile-ci.1`)
Myth: 87 named slots · Slot15 `arc_future_2` HOLD (omit; tip keeps `images/vault_interior_alt.jpg`)
No V153 webps. No 0.36 mint. No Netlify. No JPEG gen. No Slot15 remint.

## HOLD — do not merge this branch
`src/state.js` on this branch was damaged during the remap push (placeholder, then truncated restore).
Restore from tip blob `c6faf615efe76732a4f67cce57fe0175ca5fb722` (commit `f97520df`) BEFORE any remap or PR.
Intended remaps (existing JPEGs only) after restore:

| key | was | now |
|---|---|---|
| romance_lena_1 | observation_bridge_alt_2.jpg | shower_lena.jpg |
| act2_tether_hand_elias | tether_ride.jpg | self_risk.jpg |
| vess_signal | vess_signal.jpg | transmission.jpg |
| vess_cost | vess_signal.jpg | transmission.jpg |
| act3_lethal_elias_order | work_elias.jpg | bond_elias.jpg |

Live-map note: `resolveSceneImage` currently hardcodes live paths for `act2_tether_hand_elias` (`tether_ride.jpg`) and `act3_lethal_elias_order` (`work_elias.jpg`). Those two remaps are shadowed until the honesty guards use the new files while keeping `corridor_pressure_3.jpg` when Elias is not alive.

## Already matched on tip (50)
status, lead_together, competence_watch, empty_berths, pair_grudge_settle, act2_tether_vent, act2_tether_truth, act2_tether_lie, cut_out, arc_future_3, vault_sacrifice, time_pass, records skipped as adds below, arc_living_3, act2_tether_dock, act3_reckoning_*, vess_boarding, vess_offer, vess_transmission, vess_intimate, sun_payoff, ship_interrupt, ship_interrupt_resolve, romance_mira_1, romance_amara_1, romance_sela_1, romance_amara_tomas, pursuit_*, mira_shower, lena/mira/amara/sela_rear, priority_ration, quiet_mira, offshift_mira, offshift_tomas_r, warmth_music.

## Add keys (32)
observation_nightshift(+ask/leave)=observation.jpg
records_changeorders(+after)=cascade_records.jpg
act3_lethal_mira_board/reserve=quiet_mira.jpg
aftermath_seal(+order/holds)=corridor_variant.jpg
berths_manifest=empty_berths.jpg
prom_make_tomas / prom_r_tomas=quiet_tomas.jpg
prom_vent(+keep/break)=corridor_variant.jpg
prom_line(+keep)=medbay_dim.jpg ; prom_line_break=covered_body.jpg
prom_direct(+keep/break)=power_crisis.jpg
prom_price(+keep/break)=vault_reveal.jpg
breath_word_given=corridor_pressure_1.jpg
breath_word_refused=corridor_pressure_2.jpg
breath_racks=vault_interior_alt.jpg
custody_onset=custody_onset.jpg
custody_thaw=vault_interior_alt.jpg
custody_severed=mira_thermal_cut.jpg
custody_shared=observation_bridge_alt.jpg

## Skip
- Slot15 arc_future_2 — HOLD, no invent filename
- All map jpgs exist under images/ on tip (0 missing)
