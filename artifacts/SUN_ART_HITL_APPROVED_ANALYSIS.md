> **Repo copy (SUN-PLATE-FACES-06, 2026-11-05).** Owner HITL approval record, copied verbatim from Manraj's `Sunsplitter/sun_hitl_OWNER_FINAL/` folder. It is the provenance for the `PLATE_FACES` entries in `src/engine.js`. Correction found on review: `medbay_dim.jpg` shows Lena in the lab coat as well as Jiro. The zip packs it describes stay out of the repo, per its own rule 6.

# Sunsplitter ART HITL — approved-art analysis + download pack

Generated: 2026-09-27  
Source thread: ART HITL sequential review in this project chat  
Paint: 0.33 (not wired from this zip)  
Lane note: GitHub version lane may still lack some binary commits; Netlify wire deploy 6aa4d848 (2026-09-11) used the plates in `01_event_plates/`.

## What this pack is

Owner asked for a detailed analysis of **every plate they APPROVED in this chat** and a **downloadable zip** of those versions.

This pack contains every **on-disk** approved plate we can recover:

| Folder | Contents |
|---|---|
| `01_event_plates/` | 80 event JPGs from `hitl_wire/SUN_ART_HITL_WIRE_01.tgz` — the approved set packaged for the 2026-09-11 Netlify wire |
| `02_official_refs/` | 48 official portraits / bodysuits / body-front / body-back locks approved one-at-a-time |
| `03_keep_live/` | LIVE files owner explicitly kept (do not replace) |
| `04_later_slot_reapprovals/` | Slot 2 `lead_together` and Slot 15 `arc_future_2` re-approved 2026-09-23 |

It does **not** contain chat-only Imagine frames that were approved in-thread but never written to `artifacts/hitl/*_candidate.jpg`. Those IDs are listed under **Unsaved Imagine approvals**.

---

## Standing locks used for every APPROVE

- Official faces first. If a face drifted, regen from official portrait — do not chain-edit.
- Commander: dark wavy hair, not bald, athletic V-taper; usually bottom-left from behind.
- If commander is in frame, crew looks at **his head**, not the camera.
- Dirty metal setting, **clean skin**.
- Official paneled bodysuits on duty. Tanks / casual in berth, mess, habitation.
- Do not shrink official chest volume (Mira voluptuous, Lena large athletic, Sela fuller chest / narrow hips).
- Women’s rear: projected, hips not widened.
- Portrait ≈784×1168. No baked text / HUD.
- Lena bloody lab coat is **status / Rourke only**.

---

## Official refs approved (all in `02_official_refs/`)

| Lock | Files | Notes |
|---|---|---|
| Commander | `lead_prompt.jpg`, `commander_body_front.jpg`, `commander_body_back.jpg` | Boxer briefs; dark waves; not bald |
| Lena | `lena.jpg`, `lena_body_front.jpg`, `lena_body_back.jpg`, `bodysuit_lena.jpg` | Dirty-blonde, face freckles, blue eyes, large athletic chest, projected rear |
| Mira | `mira.jpg`, `mira_body_front.jpg`, `mira_body_back.jpg`, `bodysuit_mira.jpg` | Ice-blue, bun, voluptuous chest, narrower hips, projected rear |
| Elias | `elias.jpg`, `elias_body_front.jpg`, `elias_body_back.jpg`, `bodysuit_elias.jpg` | Short crop, unsmiling. Ignore `shirtless_elias.jpg` |
| Tomas | `tomas.jpg`, `tomas_body_front.jpg`, `tomas_body_back.jpg`, `bodysuit_tomas.jpg` | Curls + full beard. Ignore `shirtless_tomas.jpg` |
| Amara | `amara.jpg`, `amara_body_front.jpg`, `amara_body_back.jpg`, `bodysuit_amara.jpg` | Copper-red, green eyes, face freckles |
| Jiro | `jiro.jpg`, `jiro_body_front.jpg`, `jiro_body_back.jpg`, `bodysuit_jiro.jpg` | East Asian short black hair. Ignore `shirtless_jiro.jpg` |
| Sela | `sela.jpg`, `sela_body_front.jpg`, `sela_body_back.jpg`, `bodysuit_sela.jpg` | Long black hair, dark brown eyes, faint face freckles, fuller chest, narrow hips |
| Vess | `vess.jpg`, `vess_body_front.jpg`, `vess_body_back.jpg`, `bodysuit_vess.jpg` | Silver-white hair, purple eyes, voluptuous, same hip width |
| Rourke | `rourke.jpg`, `rourke_body_front.jpg`, `rourke_body_back.jpg`, `bodysuit_rourke.jpg` | Short dark hair, stubble |
| Rear refs | `rear_lena.jpg`, `rear_mira.jpg`, `rear_amara.jpg`, `rear_sela.jpg`, `rear_vess.jpg` | Body-back locks used for rear events |

---

## Event plates — owner verdicts

Verdict key: **APPROVE** = replace LIVE with new plate. **KEEP LIVE** = leave existing file. **REUSE** = same file as a prior approved event (owner skipped a second review). **OPEN** = no owner verdict in this thread.

### Batch 01 (severity)

| # | event_id | LIVE target | Verdict | Pack file | Notes |
|---|---|---|---|---|---|
| 1 | `status` | `observation_bridge_alt.jpg` | APPROVE | `01_event_plates/` does not include a unique `status.jpg` (shared observation plate). On-disk preview is the **rejected** first candidate `hitl/status_candidate_preview.png` | Final approved beat: corridor / Rourke body bag, Lena bloody coat, Elias Mira Amara Sela, commander back, no Tomas/Jiro/Vess |
| 2 | `lead_together` | `observation_bridge_alt.jpg` | APPROVE + RE-APPROVE 2026-09-23 | `lead_together.jpg` + `04_later_slot_reapprovals/slot_02_lead_together.jpg` | Observation blister, commander back, Elias cyan nod, Amara far hatch |
| 3 | `competence_watch` | `observation_bridge_alt.jpg` | APPROVE | shared observation family | Mira grid, Lena vials, Amara trays, Sela panel work; no Jiro/Tomas |
| 4 | `empty_berths` | `empty_berths.jpg` | APPROVE | `empty_berths.jpg` | Hollow berth spine, commander casual back, Amara tank + pants + tablet |
| 5 | `pair_grudge_settle` | `observation.jpg` | APPROVE | `pair_grudge_settle.jpg` | Tomas orange-dim + Jiro cyan-dim, crate, commander back |
| 6 | `act2_tether_vent` | `power_crisis.jpg` | APPROVE | `act2_tether_vent.jpg` | Water-vent fog, Mira cyan-dim, Amara orange-dim ration slate |
| 7 | `act2_tether_truth` | `observation_crew.jpg` | APPROVE | `act2_tether_truth.jpg` | Mess casuals, trays, Tomas standing, official Sela |
| 8 | `act2_tether_lie` | `observation_bridge.jpg` | APPROVE | `act2_tether_lie.jpg` | Records desk, commander tablet from behind, Tomas watching |
| 9 | `cut_out` | `cut_out.jpg` | APPROVE | `cut_out.jpg` | Mira cut hole, Amara+Sela through, matching slab |
| 10 | `observation_nightshift` | `observation.jpg` | APPROVE | `observation_nightshift.jpg` | Jiro cyan-dim at blister, full-table chart |
| 11 | `arc_future_3` | `cascade_records.jpg` | APPROVE | `arc_future_3.jpg` | Records vault, Mira bypass + Jiro reading |
| 12 | `vault_sacrifice` | `vault_sacrifice.jpg` | APPROVE | `vault_sacrifice.jpg` | Mira tank+shorts at two-throw switch, embryo door |

### Remaining queue (after Batch 01)

| # | event_id | LIVE target | Verdict | Pack file | Notes |
|---|---|---|---|---|---|
| 1 | `time_pass` | `corridor_pressure_2.jpg` | thinned in I1; plate not a unique late candidate | — | Intro/time beat thinned |
| 2 | `romance_lena_1` | `shower_lena.jpg` | APPROVE | `romance_lena_1.jpg` | Nude observation blister, hand-holding; fallback `hitl/romance_lena_1_fallback_nude.jpg` |
| 3 | `arc_future_2` | `vault_interior_alt.jpg` | APPROVE + RE-APPROVE 2026-09-23 | `arc_future_2.jpg` + `04_later_slot_reapprovals/slot_15_arc_future_2.jpg` | Later slot: no people, sealed racks |
| 4–5 | `records_changeorders` / `_after` | `cascade_records.jpg` | APPROVE | `records_changeorders.jpg`, `records_changeorders_after.jpg` | Mira sleeveless + tablet; after = closing tablet |
| 6 | `arc_living_3` | `arc_living_conflict.jpg` | APPROVE | `arc_living_3.jpg` | Tomas blocks corridor, Elias watches, both look at commander |
| 7 | `act2_tether_hand_elias` | `self_risk.jpg` | APPROVE | `act2_tether_hand_elias.jpg` | Elias checks tether shackle |
| 8 | `act2_tether_dock` | `bulkhead.jpg` | APPROVE | `act2_tether_dock.jpg` | Dock beat; Tomas board line lives here in prose |
| 9–15 | `act3_reckoning_*` | observation / power / cut / records | APPROVE | matching `act3_reckoning_*.jpg` | Pattern, heading, burn_stale, burn_verified, delay, cut, briefing |
| 16–17 | `observation_nightshift_ask` / `_leave` | `observation.jpg` | APPROVE | matching files | Same blister family |
| 18–23 | Vess block | transmission / boarding / offer / intimate | APPROVE | `vess_*.jpg` | Official Vess lock; boarding board line in prose |
| 24–26 | `act3_lethal_*` | bond_elias / quiet_mira | APPROVE | matching files | Elias order; Mira board/reserve share quiet_mira family |
| 27–29 | `aftermath_seal*` | `corridor_variant.jpg` | APPROVE | three aftermath files | Shared corridor family |
| 30 | `sun_payoff` | `sela_ritual.jpg` | APPROVE | `sun_payoff.jpg` | Sela ritual payoff |
| 31–32 | `ship_interrupt` / `_resolve` | power_crisis / unique | APPROVE | matching files | Mira-cut companion + commander athletic back |
| 33–36 | romance_mira/amara/sela + amara_tomas | shower_* / romance_amara_tomas | APPROVE / KEEP variants | `romance_lena_1.jpg` in pack; shower plates mostly stay on LIVE unless replaced | Several shower events share files |
| 37–42 | pursuit_* / *_sex | lingerie / afterglow | mixed | KEEP LIVE afterglows in `03_keep_live/` | Owner kept afterglow_mira/amara/sela |
| 43–44 | `pursuit_lena` / `_sex` | lingerie_lena / pursuit_lena | APPROVE then KEEP LIVE sex | `03_keep_live/pursuit_lena_LIVE.jpg`, `pursuit_lena_sex_LIVE.jpg` | Owner: keep original afterglow/sex file |
| 45 | `mira_shower` | `shower_mira.jpg` | APPROVE | **NOT ON DISK as approved frame** | Imagine `XCckB`: rinse, ice-blue, narrower official hips, no commander |
| 46 | `lena_rear` | `rear_lena.jpg` | **KEEP LIVE** | `03_keep_live/rear_lena_LIVE.jpg` | Owner: leave original as is |
| 47 | `mira_rear` | `rear_mira.jpg` | APPROVE | **NOT ON DISK as approved frame** | Imagine `CzOb5`: standing nude drive bay, look over shoulder, ice-blue, projected rear, narrow hips |
| 48 | `amara_rear` | `rear_amara.jpg` | APPROVE | **NOT ON DISK as approved frame** | Imagine `wT0pe`: hydro trays, official-ish copper-red, three-quarter over-shoulder |
| 49 | `sela_rear` | `rear_sela.jpg` | APPROVE | **NOT ON DISK as approved frame** | Imagine `SJDX2`: corridor, official Sela, juicier projected rear, mischievous look |
| 50 | `priority_ration` | `observation_reckon.jpg` | APPROVE | `priority_ration.jpg` (wire = earlier tank-table version). Later casual-spread Imagine `8flOC` **not saved** | Owner asked spread + unique casuals; that later frame is chat-only |
| 51 | `berths_manifest` | `empty_berths.jpg` | APPROVE | `empty_berths.jpg` (shared with #4). Later Imagine `njQ5P` **not saved** | Amara tablet in berth spine looking at commander |
| 52 | `quiet_mira` | `quiet_mira.jpg` | OPEN in late Sep-8/9 pass; later wire pack includes `quiet_mira.jpg` | `quiet_mira.jpg` | Candidate `Cz9vG` was waiting when owner asked to migrate chats |
| 53–54 | `prom_make_tomas` / `prom_r_tomas` | `quiet_tomas.jpg` | APPROVE + REUSE | `quiet_tomas.jpg`, `prom_make_tomas.jpg`, `prom_r_tomas.jpg` | Tomas official curls+beard, thinning sprouts |
| 55–57 | `prom_vent*` | `corridor_variant.jpg` | APPROVE + REUSE | `prom_vent.jpg` + keep/break copies | Amara orange-seam vent, Jiro cyan-seam |
| 58–59 | `prom_line` / `_keep` | `medbay_dim.jpg` | APPROVE + REUSE | `medbay_dim.jpg`, `prom_line.jpg`, `prom_line_keep.jpg` | Lena coat on floor, Jiro on the line |
| 60 | `prom_line_break` | `covered_body.jpg` | APPROVE | `prom_line_break.jpg`, `covered_body.jpg`, `silence.jpg` | Covered body; also feeds silence |
| 61–63 | `prom_direct*` | `power_crisis.jpg` | APPROVE + REUSE | `power_crisis.jpg` + prom_direct copies | Mira at console looking at commander |
| 64–66 | `prom_price*` | `vault_reveal.jpg` | APPROVE + REUSE | `vault_reveal.jpg` + prom_price copies | Sela gold-seam at embryo door |
| 67–68 | `offshift_mira` / `offshift_tomas_r` | quiet_mira / quiet_tomas | REUSE | `offshift_mira.jpg`, `offshift_tomas_r.jpg` | Same files as #52 / #53 |
| 69 | `warmth_music` | `corridor.jpg` | APPROVE | `warmth_music.jpg`, `warmth_laughter.jpg`, `corridor.jpg` | Vess in empty berth row, speaker on stanchion |
| 70 | `breath_word_given` | `corridor_pressure_1.jpg` | APPROVE | `breath_word_given.jpg`, `corridor_pressure_1.jpg` | Tomas at red pressure bulkhead |
| 71 | `breath_word_refused` | `corridor_pressure_2.jpg` | APPROVE | `breath_word_refused.jpg`, `corridor_pressure_2.jpg` | Tomas not arguing, cold corridor |
| 72 / 74 | `breath_racks` / `custody_thaw` | `vault_interior_alt.jpg` | APPROVE + REUSE | `breath_racks.jpg`, `custody_thaw.jpg`, `vault_interior_alt.jpg` | Stripped outer vault racks, no named faces |
| 73 | `custody_onset` | `custody_onset.jpg` | APPROVE | `custody_onset.jpg` | Hot thermal spine to vault door, no faces |
| 75 | `custody_severed` | `mira_thermal_cut.jpg` | APPROVE | `custody_severed.jpg`, `mira_thermal_cut.jpg` | Mira ice-blue cutting fused junction |
| 76 | `custody_shared` | `observation_bridge_alt.jpg` | APPROVE (wired) | `custody_shared.jpg` | Last needs_regen in the 88; included in wire pack |

Sequential memory count after #75: **87 of 88** approved, **1** left at that moment; wire pack already includes `custody_shared.jpg`.

---

## Keep LIVE (do not replace)

| event_id | File in pack | Owner line |
|---|---|---|
| `lena_rear` | `03_keep_live/rear_lena_LIVE.jpg` | “leave original as is, next” |
| `pursuit_lena` / sex afterglow | `pursuit_lena_LIVE.jpg`, `pursuit_lena_sex_LIVE.jpg` | keep original afterglow / “leave original as is” |
| `pursuit_mira_sex` | `afterglow_mira_LIVE.jpg` | keep original afterglow_mira.jpg |
| `pursuit_amara_sex` | `afterglow_amara_LIVE.jpg` | keep afterglow_amara.jpg |
| `pursuit_sela_sex` | `afterglow_sela_LIVE.jpg` | keep original afterglow_sela |

---

## Unsaved Imagine approvals (approved in chat, no file on disk)

These are the exact late-pass frames owner locked that **cannot be zipped** because they were never written to `artifacts/hitl/`.

| event_id | Imagine id | What was approved |
|---|---|---|
| `mira_shower` | `XCckB` | Official ice-blue Mira, narrower official hips, rinse stall, no commander |
| `mira_rear` | `CzOb5` | Standing nude, look over shoulder, ice-blue, projected rear, narrow hips |
| `amara_rear` | `wT0pe` | Hydro trays, three-quarter back, copper-red, official-narrow hips |
| `sela_rear` | `SJDX2` | Corridor, official Sela, juicier projected rear, mischievous look |
| `priority_ration` (later pass) | `8flOC` | Crew **standing spread** in unique casuals, food+water, commander back |
| `berths_manifest` (later pass) | `njQ5P` | Amara official-ish tank + tablet in berth spine looking at commander |

Closest recoverable substitutes:

- Official body-backs in `02_official_refs/rear_*.jpg` and `*_body_back.jpg`
- Wire `priority_ration.jpg` / `empty_berths.jpg` (earlier approved versions, not the last Imagine pass)
- LIVE old files still in `artifacts/hitl/*_old.jpg`

To recover those six frames you must re-generate from official refs using the notes above, or export the Imagine cards from the original chat UI if they are still in history.

---

## Shared-file map (one JPG, many events)

Replacing one file changes every event that points at it.

| File | Events |
|---|---|
| `observation_bridge_alt.jpg` | status, lead_together, competence_watch, act3_reckoning_pattern, custody_shared |
| `empty_berths.jpg` | empty_berths, berths_manifest |
| `quiet_mira.jpg` | quiet_mira, act3_lethal_mira_board/reserve, offshift_mira |
| `quiet_tomas.jpg` | prom_make_tomas, prom_r_tomas, offshift_tomas_r |
| `corridor_variant.jpg` | aftermath_seal*, prom_vent* |
| `power_crisis.jpg` | several crisis / prom_direct* / some interrupt LIVE |
| `vault_reveal.jpg` | prom_price* |
| `vault_interior_alt.jpg` | arc_future_2, breath_racks, custody_thaw |
| `covered_body.jpg` | prom_line_break, silence |
| `shower_mira.jpg` | romance_mira_1, mira_shower |

---

## What is not in this zip

- Game `src/` remaps from the wire tarball (not requested)
- Denied / moderated / intermediate Imagine retries
- `status_candidate_preview.png` (first failed candidate — false BATCH A text)
- Shirtless ignore-files except they remain inside `02_official_refs/` for completeness; do **not** use shirtless_elias/tomas/jiro as likeness

---

## How to use

1. Unzip.
2. Treat `01_event_plates/` as the 2026-09-11 approved wire set.
3. Treat `03_keep_live/` as owner vetoes against regen.
4. Treat `04_later_slot_reapprovals/` as newer locks that should win over older `lead_together.jpg` / `arc_future_2.jpg` if you re-wire.
5. Re-gen the six unsaved Imagine approvals from official refs before any new Netlify/GitHub wire.
6. Do not upload this zip to the game. Owner still gates wiring.
