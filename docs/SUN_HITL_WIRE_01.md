# SUN-HITL-WIRE-01

Tip base: `9a680fd2`
Myth: 87 named slots · Slot15 `arc_future_2` HOLD (omit; tip keeps `images/vault_interior_alt.jpg`)
No V153 webps. No 0.36 mint. No Netlify.

## Already matched on tip (50)
status, lead_together, competence_watch, empty_berths, pair_grudge_settle, act2_tether_vent, act2_tether_truth, act2_tether_lie, cut_out, arc_future_3, vault_sacrifice, time_pass, records skipped as adds below, arc_living_3, act2_tether_dock, act3_reckoning_*, vess_boarding, vess_offer, vess_transmission, vess_intimate, sun_payoff, ship_interrupt, ship_interrupt_resolve, romance_mira_1, romance_amara_1, romance_sela_1, romance_amara_tomas, pursuit_*, mira_shower, lena/mira/amara/sela_rear, priority_ration, quiet_mira, offshift_mira, offshift_tomas_r, warmth_music.

## Remap vs tip (5)
Historical intent table against `9a680fd2`. Not an apply order at later tips.
- romance_lena_1: observation_bridge_alt_2.jpg → shower_lena.jpg
- act2_tether_hand_elias: tether_ride.jpg → self_risk.jpg
- vess_signal: vess_signal.jpg → transmission.jpg
- vess_cost: vess_signal.jpg → transmission.jpg
- act3_lethal_elias_order: work_elias.jpg → bond_elias.jpg

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

---

## SUN-HITL-WIRE-REMAP-01 receipt (tip `b6b359ab`)

Ticket: `SUN-HITL-WIRE-REMAP-01`
Write lane: `version/0.30.1-main-reconcile-ci.1` @ `b6b359abd694d5b4dc1574f736fae0a1d9cef9a3`
Prior ruling: PR **#307** `docs/SUN_HITL_WIRE_REMAP_CONFIRM_01.md` (2026-09-20). Re-verified independently at this tip. No `src/state.js` change. No JPEG. No 0.36 mint. No Netlify.
Do not reuse HOLD branch `ticket/0.30.1-hitl-wire-remap-01` @ `ca27c8b3` (damaged-state history).

Skip rule used: skip any remap that fights a scene comment, `resolveSceneImage` guard, or playtest / `art-r2-playtest-close-checks` retarget.

| # | Key | Historical remap | Live `sceneImages` | Live `scene.image` / resolver | Verdict |
|---|---|---|---|---|---|
| 1 | `romance_lena_1` | → `shower_lena.jpg` | `observation_bridge_alt_2.jpg` | `scenes-03.js` REUSE `observation_bridge_alt_2.jpg`; rinse stays on `lena_shower`. Verify forbids `shower_lena.jpg` / `romance_lena_1.jpg`. | **SKIP** — scene comment + playtest retarget |
| 2 | `act2_tether_hand_elias` | → `self_risk.jpg` | `tether_ride.jpg` | `scenes-11.js` REUSE `tether_ride.jpg`; not `self_risk.jpg`. Resolver returns `tether_ride.jpg` while rider lives. Verify forbids `self_risk.jpg`. | **SKIP** — scene comment + resolver + playtest |
| 3 | `act3_lethal_elias_order` | → `bond_elias.jpg` | `work_elias.jpg` | `scenes-23.js` REUSE `work_elias.jpg`; not `bond_elias.jpg`. Resolver returns `work_elias.jpg` while Elias lives. Verify forbids `bond_elias.jpg` / `quiet_elias.jpg`. | **SKIP** — scene comment + resolver + playtest |
| 4 | `vess_signal` | → `transmission.jpg` | `vess_signal.jpg` (map string) | `scenes-16.js` `scene.image` already `images/transmission.jpg`. L-029 allows this plate on arrival. | **ALREADY_SATISFIED** — runtime matches table. Map-string hygiene needs a new ticket id. |
| 5 | `vess_cost` | → `transmission.jpg` | `vess_signal.jpg` (map string) | same as `vess_signal` | **ALREADY_SATISFIED** — runtime matches table. Map-string hygiene needs a new ticket id. |

Success for this ticket: named keys match the remap table **or** an explicit skip. Keys 1–3 are explicit skips. Keys 4–5 already resolve to `transmission.jpg` at runtime. version-verify / art-r2-playtest-close-checks remain green because the three forbidden remaps were not applied.
