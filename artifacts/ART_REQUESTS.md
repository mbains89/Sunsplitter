# Sunsplitter — Art Requests

## SUN-PLAYTEST-ART-EVENT-AUDIT-01 — Grok briefs + one retarget (2026-09-04)

Owner standing brief rule, closed event→image table, and Grok stubs:
`artifacts/SUN_PLAYTEST_ART_EVENT_AUDIT_01.md`,
`artifacts/GROK_BRIEFS_PLAYTEST_ART_EVENT_AUDIT_01.md`.
Unique plate per beat; never official portrait as stand-in. Every
NEEDS_GROK_PLATE stub carries a standing **portrait identity-lock**: official
bodysuit portrait path as sole face reference; exact likeness (geometry, age,
skin, hairline, eye shape, scars/marks; no beautify/age/ethnicity swap);
bodysuit silhouette unless the beat changes clothes; named must-appear /
must-not; scene verb + full event prose; REJECT if the face fails vs official
at thumbnail size. Ban "generic crew." `body_ref` front/back NOT_APPROVED
in-tree. Pack note `SUN-ART-BODY-REFERENCE-01` (living-cast full-body refs,
shared pose, underwear/base layer) is documented in the audit/plan only —
no `body_ref` bytes and no scene wiring in that ticket. Owner approves body
portraits directly before any later wire. PASS/HOLD/REJECT before wire.
No new JPEG bytes in that ticket.
Post-0.35 / pre-0.36 follow-ups: `artifacts/SUN_PLAYTEST_RESPONSE_PLAN.md`.

## SUN-V035-PLAYTEST-ART-AUDIT-01 — confirmed event-fit retargets

`SOURCE main@8d23109 · RUNTIME base@163d333 · TASK SUN-V035-PLAYTEST-ART-AUDIT-01 · MODE implementation`

Build / $ Con V9; owner-authorized 2035CT dispatch. Existing in-tree bytes only.
These aliases are resolved centrally by `resolveSceneImage`, ahead of historical
scene/map defaults. No scene text, choices, entry hooks, gates, costs, memories,
state keys, RNG, save schema, image files or prior source mappings are rewritten.
All image reads are pure. Entry and death exposure remain exactly those in the
existing scene declarations; this change creates no death or relationship effect.

Pixel inspection, not filename inference, established each mismatch below.
Portraits are character-focus illustrations, not claims to show a literal procedure.

| Event / existing render point | Confirmed old image contradiction | Existing alias / appearance condition |
|---|---|---|
| `silence`, after its existing Rourke death entry | `medical_bay.jpg` still shows the exposed man being treated after Lena covers his face | `covered_body.jpg`; concealed corpse, two indistinct observers; same existing outcome-art class as the other Rourke exits |
| `offshift_lena`, quiet late medbay hour | Opening emergency/bloody Rourke instead of a quiet medbay | `medbay_dim.jpg`; empty exam chairs, one indistinct distant silhouette; no named face |
| `breath_blacksleep`, committed medical crisis response | `medbay_dim_alt.jpg` is a control hall overlooking an industrial skyline, not treatment space | `medbay_dim.jpg`; actual medical setting, no particular patient's condition asserted |
| `pregnancy_check`, corridor conversation / dead-Lena fallback | Same unrelated skyline/control hall | Official `lena.jpg` only while alive; otherwise `corridor_pressure_3.jpg` |
| `act3_lethal_elias_order`, `act3_lethal_elias_sealant`, pressure-control decision and contained breach | `bond_elias.jpg` shows seated mug/table companionship during emergency work | Official `elias.jpg` only while alive; otherwise `corridor_pressure_3.jpg` |
| `private_stores`, early Elias report before crew recoveries | `private_stores.jpg` is three people at a navigation viewport, including unrecovered Jiro, not Elias's private-food report | Official `elias.jpg` only while alive; otherwise `corridor_pressure_3.jpg` |
| `prom_deck4`, reconstructed door record | `bulkhead.jpg` depicts a face-visible armed man crawling through a vent; no such intervention is in this scene | `corridor_pressure_3.jpg`; empty structural passage, no invented participant |
| `prom_deck4_keep`, `prom_deck4_break`, Elias hears the whole / edited / buried record | Star-window two-man tableau / armed vent crawl instead of Elias's record response | Official `elias.jpg` only while alive; otherwise `corridor_pressure_3.jpg` |
| `ship_memory_payoff`, all seal/memory branches before final orders | Armed vent crawl despite passive structural-debt accounting | `corridor_pressure_4.jpg`; empty structural passage, no new damage or repair assertion |
| `patch_fails`, loaded seal / remote-valve failure | `vent.jpg` is an armed man entering a shaft, not the described remote structural failure | `power_stress_2.jpg`; crew-free red emergency passage with sparking conduits |
| `custody_possession`, committed thermal exposure | Armed vent crawl, no matching authored intervention | `corridor_pressure_1.jpg`; empty red-pressure passage, no individual outcome asserted |
| `vent`; `aftermath`, `crisis`, `priority_repairs` only when their existing crisis flag is `vent` | Armed crawling man instead of the sealed section and lost crew | `aftermath.jpg`; sealed bulkhead, geometric yellow sun, empty bunks and abandoned key; no people. Non-vent crisis handling unchanged |
| `arc_living_2`, dead-Sela branch only | Living Sela actively painting while text says “Their author does not.” | `corridor_pressure_3.jpg`; no artist asserted. The previously repaired live `sela_ritual.jpg` binding stays intact |
| `act2_tether_hand_elias`, `act2_tether_hand_mira`, `act2_tether_hand_sela`, before the catch, both approach speeds | `self_risk.jpg` is an unhelmeted male back inside a corridor, not an EVA tether rider | `tether_ride.jpg`; one anonymous helmeted rider outside the ship, green annex still ahead. If the selected rider is dead in a saved render, empty `corridor_pressure_3.jpg` instead |
| `vault_voice`, speaking-vault interface | `vault_voice.jpg` is a navigation/planet-window tableau | `vault.jpg`; cold, crew-free vault racks; location-level illustration |
| `filters_stencil`, `filters_stencil_luck`, `filters_stencil_silent`, crate/filter discussion; `offshift_sela`, lamp ritual | `sela_ritual.jpg` shows actively painting a door, not handling filters or attending a lamp | Official `sela.jpg` only while alive; otherwise `corridor_pressure_3.jpg`; no new ritual action invented |

### Alias properties and preservation

- All reused files are existing portrait-aspect plates. No crop, recolor, generation,
  duplication, new identity ruling, or new ART-R2 approval.
- Official Elias/Lena/Sela portraits: one face, neutral/cold existing interior.
- Pressure passages and vault: no figures, rectangular interiors; crimson emergency
  for `_1` / `power_stress_2`, mixed cyan/red for `_3` / `_4`, cold cyan for vault.
- Medbay: cold cyan medical chairs, one unidentifiable silhouette; not a crew count.
- Covered body: identity concealed, cold/crimson medical aftermath; opening death only.
- Tether: one anonymous helmeted exterior rider; no rider gender/face or rescued crew asserted.
- Sealed vent aftermath: crew-free, crimson/cyan structural interior.
- Existing repair controls remain: Rourke siblings / covered-body Lena outcome,
  faction-split retirement, offshift Vess official portrait and guard, act3 hub
  variant, live yellow-mark action, tether sighting/rush, Lena intimacy, and male-crew
  portraits. No cinematic or ending-screen binding changes.

### Coverage and limits

Source/event-fit review covered the 55 scene modules with two independent read-only
review tracks plus root reconciliation. This is not full ART-R2 identity/crop/signage
certification. Runtime retargets are limited to the 26 named IDs above (some conditional).
No catalog-only change is proposed: the resolver changes the rendered game.

Unchanged candidates without a proven safe replacement or outside this bounded repair:
the tether docking plate across intact versus ruined-tray outcomes; early records
imagery; berth imagery with visible invented name tape; variable numerical overlays;
legacy observation fallbacks; intimate-setting
and full character-identity issues. These are not represented as fixed or approved.
No further ticket is minted. ART-R2 remains held; NO-PUBLISH / NOT_CERTIFIED; last
certified remains 0.28.1d.

## SUN-V035-PLAYTEST-MALE-CREW-01 — existing-portrait aliases only

- `bond_elias_mending` → byte-identical `images/elias.jpg`, the existing official Elias portrait. One identifiable man, rectangular interior, neutral/cold character focus; early or post-vault accepted Elias bond only while alive.
- `bond_jiro_distance` → byte-identical `images/jiro.jpg`, the existing official Jiro portrait. One identifiable man, rectangular interior, neutral/cold character focus; accepted Jiro bond after recovery only while alive.
- Both saved absent/dead renders → existing crew-free `images/onboarding_background.jpg`. The portrait is a character focus, not an illustration claiming to show stitching or a navigation procedure.
- No new or edited images, generation, new identity ruling, or ART-R2 gate credit. Existing bond-entry art is unchanged.

## SUN-V035-PLAYTEST-CINEMATICS-01 — existing-screen aliases only

- Intro beat: byte-identical `images/onboarding_background.jpg`, already used by the content-notice screen. Empty rectangular corridor and stars, no identifiable crew. Reused before fresh `wake`; no new plate.
- Ending beat: the same byte-identical `images/onboarding_background.jpg` as a neutral visual bookend, with the actual resolved ending title/text. No crew, outcome or numerical HUD assertion in the cinematic art. The existing ending screen and its selected art are unchanged.
- Presentation-only aliases, skippable; no asset edits, generation, new identity approval, or ART-R2 gate credit.

**Last updated:** 2026-08-16  
**Hard goal:** 100% of scenes have unique (or clearly distinct + fitting) art  
**Style lock:** grimdark × cyberpunk — decaying high-tech, crimson/cyan neon, atmospheric haze, attractive but grounded characters  
**Current game version:** 0.26.4 (Wire new art batch — exclusive/Mira/Vess + ≤5 reuse plates. See close-out in PROJECT_STATUS.)  
**Clothing note (locked):** Sprinkle sexy form-fitting cyberpunk bodysuits alongside existing tank tops / layered work clothes. Mix is intentional — not a full uniform swap.  
**Art honesty rules:** See permanent section below (manifest + roster-ambiguous groups + cost-over-rescue).

Art chat pulls from this file. When an image is generated and integrated, move the entry to Completed.

Main / building chats **automatically add** any new scene ID here as soon as it is created or planned.

### Art process rules (permanent)
- **Always show Imagine cards in chat for approval** before treating any plate as locked.
- **Lock = save** to `artifacts/sunsplitter_images/` AND mirror to `sunsplitter/images/` with clear descriptive filenames.
- **Portrait reference:** finalized attractive Batch A only (`lena.jpg`, `mira.jpg`, `amara.jpg`, `sela.jpg`, `elias.jpg`, `tomas.jpg`, `jiro.jpg`, `rourke.jpg` in `sunsplitter/images/`). Never the early unattractive/aged versions.
- Rectangular interiors only. Batch A faces in all group shots.
- Lena is blonde (dirty/ash-blonde redesign LOCKED). Mira stays dark-haired.

### Art honesty rules (LOCKED 2026-08-14 — Fable review + pixel pass)
Art must not contradict run state the way prose is forbidden to. Group/character plates that show identifiable living people are state assertions.

- **Manifest requirement (every new plate):** Declare in this file: characters depicted, location, palette pole (Living-warm / Future-cold / neutral), tier, earliest + latest reachable render point.
- **Group plates default to roster-ambiguous.** Use backs, partial frames, silhouettes against consoles unless the scene preconditions pin the exact living roster. Death-aware variants only when a plate must show specific faces after possible deaths.
- **Crowd cap:** No more figures than the minimum possible roster at the plate’s earliest render point. Default ≤2 identifiable faces + backs/silhouettes. Non-cast adults never appear aboard.
- **No invented legible text.** No ship names, character name tapes, status strings, evaluative or system text, production vocabulary (“BATCH A”, “LOCKED”). Signage is illegible-by-design or a Grok-locked string only.
- **Ending and Hero plates carry zero baked text.** All ending copy is engine-rendered over the image.
- **Commander depiction:** back view, silhouette, or hands only. Never a face. `final_choice` is the reference.
- **Lethal-moment plates** show the *choice* (pre-commitment instant), not the outcome.
- **Recovery plates** carry the *cost*, not rescue warmth.
- **Exclusive crises** use mirrored composition + inverted palette poles (crimson vs cyan).
- **Last Off-Shift** = one base plate + per-character portrait variants.
- **What Remains** = one abstract, character-free plate.
- **Composite lighting rule:** Backgrounds declare key-light direction/color; portraits composited onto them must match.
- **Hair-slot registry (romance pool):** One dominant hair read per woman — blonde (Lena), red (Amara), long dark (Mira + Sela currently double-booked, grandfathered), long white/silver (Vess — LOCKED 2026-08-16, confirmed against full approved art set, no collision with existing slots).
- **Major-state plates** (pregnancy, grave injury) hide identity or come per-character.
- **Dying-state imagery** renders only at/after the event it depicts.
- **Portrait orientation only** (≈784×1168). Landscape plates will be regenerated when their scene ships.
- **Byte-identical reuse** must be a declared manifest alias, never two independent files that can drift.
- **Brightness floor:** every plate verified legible at ~50% screen brightness before lock.
- **Vess grammar (before any generation):** Dawnbreak-origin wear distinct from ark crew, console-light as signature key light, hair/build thumbnail-distinct from the four. Lock portrait first; every downstream plate inherits it.

Protect: existing tier system, ~25–35 distinct budget, Batch A discipline, rectangular lock (ring curvature forbidden; arched/hex cross-sections OK). Resist Hero-tier creep.

---

## Pixel Review Punch-List (Fable 2026-08-14 — action required)

### Priority 1 — Retire / regenerate immediately
| Plate | Problem | Action |
|-------|---------|--------|
| `faction_split` / `faction_split_alt` | **VERIFIED 0.25 Fable pixel pass:** baked “BATCH A / LOCKED CREW – NINE ONLY / COLONY SHIP EIDOLON” + system signage + eight identifiable figures including non-cast cybernetic man. Violates ART_RULES 1/2 + crowd/roster on every run. | **Immediate rewire (0.25 Build):** sceneImages.faction_split → corridor_variant.jpg (permanent). Extend grouped-plate guard to ANY missing alive crew. **Regen** roster-ambiguous / backs-only version (≤2 faces or silhouettes, zero text, rectangular) for post-0.25. |
| `covered_body` | Earlier note claimed mislabel; **0.25 Fable pixel verification:** current file is genuine identity-hidden covered body, no baked text. Approved for act3_lethal_lena_end (and rourke_end alias). Keep. | **Protect.** Use as declared reuse for lethal ends. |
| `self_risk` | Dark-haired man, ¾ back view (not bald/scarred as earlier listed). Still in active legitimate use 4× as Commander self-risk beats. | **Review** only — keep; do not misidentify as player-face assert elsewhere. |
| `pregnancy_check_alt` | Pregnant woman matches nobody in romance pool. | **Retire.** |

### Hold / resolved design decisions (Grok 2026-08-14)
- **Ship name:** *Sunsplitter* (locked). All other ship names in existing plates (EIDOLON, AURORA-7, TANAIS, EURYALE) are errors; no-text rule prevents recurrence.
- `romance_amara_tomas` — **KEEP**. Allowed as optional crew-to-crew texture. Do not treat as a Commander romance route.
- `pregnancy_check` — **HOLD** for identity-hidden / per-character plate (Vess visual design now locked long white/silver; still avoid name-tape collision).
- `sun_drawing` — **RETIRE**. Child-crayon version removed. Use `sun_drawing_adult` / `sela_ritual` only.

### Gate by precondition (cast-drip / death-aware)
- `crisis` / `priority_repairs` (identical) — Mira + Amara + Jiro. Gate pre-Dead Reckoning or make roster-ambiguous.
- `cascade_records`, `competence_watch` — Mira + Jiro; also contain “BATCH A / LOCKED” text.
- `observation_crew`, `faction_split`, `faction_split_alt`, `reckon_public` — crowd-fill + non-cast faces + headcount lies.
- `quiet_tomas`, `bond_tomas`, `arc_living_conflict` — Tomas-bearing; gate pre/post Green Tether.
- `rourke.jpg` — dying-state only; never use as alive portrait.

### Next-batch / fix-by-note
- **`vess.jpg` — OFFICIAL PORTRAIT LOCKED (2026-08-15).** Long white hair, purple eyes, form-fitting dark cyberpunk bodysuit with purple accents. File: `vess.jpg` in both image folders. Supersedes dark knife-cut sheet note. All downstream Vess plates inherit this. Safe to wire to `vess_boarding` and intro beats.
- `tomas_break` — face match locked (2026-08-15).
- `rear_mira` — locked (2026-08-15).
- `sela.jpg` — adult base kept (2026-08-15).
- `debris_field`, `ending_fracture` — brightness lift locked (2026-08-15).
- `rogue_planet` — portrait locked (2026-08-15).
- Redundancy: hydroponics / hydroponics_amara / quiet_amara are intentional role variants (keep). Sealed-door pair (`abandoned_sealed` / `abandoned_section`) — keep distinct.
- **Declared aliases (2026-08-15):** `sela_ritual` = `sun_drawing_adult`; `crisis` = `priority_repairs` (byte-identical OK); `vault_sacrifice` may alias `vault_voice` until a distinct Hero is required.

### Confirmed clean (protect as reference)
Lena blonde set, core portraits (lena/mira/amara/elias/tomas/jiro), Mira + Amara intimacy sets, `vault_reveal`, `final_choice`, `aftermath`, `empty_berths`, `observation`, hydroponics, corridor, onboarding_background, power_crisis. No ring curvature. Composite lighting coherent.

**Note (2026-08-16 pixel pass):** `abandoned_sealed` removed from clean list — baked legible text (“SECTION 7-4 SEALED” + biohazard glyph). Currently unwired (0.26.1 hygiene removed its only use). Flag for text-removal before any future reuse.

---

## Efficiency Rules (locked)

### Quality tiers
| Tier | Use for | Effort |
|------|---------|--------|
| **Hero** | Romance peaks, major deaths, endings, abandoned section, vault voice, landfall | Highest — fully distinct |
| **Strong** | Most mid-game exclusive path scenes, reckonings, key crises | Medium |
| **Solid** | Intros, status, walking, minor transitions, many dialogue beats | Lower — strong portrait + fitting background is enough |

### Variant & reuse strategy
- Create **base plates** once (medical bay, engineering, corridor, hydroponics, observation, vault, bulkhead).
- Generate **light variants** from bases (lighting change, extra character, blood, sparks, mood shift).
- Crisis scenes share a small family of variants instead of fully unique images each time.
- Portraits may be reused for pure character-focus beats.
- Batch generation by **location + mood**, not by individual scene ID.

### Pipeline
- Art chat generates → drops into `artifacts/sunsplitter_images/` (or staging)
- Build chat integrates into `sceneImages` map when ready
- Never block narrative work on a single missing image
- Once Batch A portraits are approved, they become the permanent character reference sheet

### Target volume
- ~25–35 truly distinct images
- ~15–25 smart variants
- Heavy reuse of best portraits + base plates

---

## HIGH PRIORITY (2026-08-15)

### A. Existing plates wired (2026-08-15 — DONE)
Quick mapping pass in `state.js`:
- `quiet_mira` → `quiet_mira.jpg`
- `quiet_amara` → `quiet_amara.jpg`
- `quiet_tomas` → `quiet_tomas.jpg`
- `private_stores` → `private_stores.jpg`
- `status`, `lead_together`, `arc_fork`, `reckon_truth` → `observation_crew.jpg`

### B. Tier A — generate next (unique plates still needed)
1. **`lead_prompt`** — on disk, clean. Elias + Commander back, observation blister. Ready to mark locked.
2. **`ship_interrupt_resolve`** — on disk, clean. Aftermath corridor mood. Ready to mark locked.
3. Corridor family pressure — `corridor_walk.jpg` locked prior session.
4. **Sela ritual** — LOCKED 2026-08-15 (this session): cabin couch + bonsai tree + draped open robe (bare underneath). File: `sela_ritual.jpg`. Replaces old door-painting version. Promote for `arc_living_2` + `reckon_memory` / quiet_sela.

### Locked this session (2026-08-15 Art)
- `sela_ritual.jpg` — new bonsai cabin version (sensual, face matched as close as possible to locked portrait).
- `faction_split.jpg` — new star-map version with actual Batch A faces (Elias, Mira, Amara, Jiro + backs). Zero text. (Live wiring still corridor_variant for honesty; this is the post-0.25 clean plate.)
- **Vess full intimate set (parity with the four)** — LOCKED 2026-08-15 + FILES ON DISK in both folders:
  - `shower_vess.jpg` — industrial shower room, three-quarter / side angle, soft purple+cyan lighting
  - `rear_vess.jpg` — nude rear view in cabin, looking back
  - `lingerie_vess.jpg` — robe + bra tease, mischievous smile
  - `afterglow_vess.jpg` — nude on side, breasts visible, top leg covering crotch
  All inherit locked Vess portrait (long white hair, purple eyes).

### C. Still open from earlier punch-list (do not forget)
- `tomas_break` face match to locked `tomas.jpg`
- `rear_mira` text removal + distinction from `rear_sela`
- `sela.jpg` adult-read strengthening
- `debris_field` + `ending_fracture` brightness lift
- Explicit utilization (rear_* + remaining shower_*) still needs Narrative/Build events

### D. New queue item (2026-08-16) — CLOSED
- **`mira_thermal_cut.jpg`** — Strong tier. Manifest: Mira only, unpressurized maintenance throat, Future-cold/cyan pole, custody_severed scene, cost-not-rescue-warmth. **LOCKED + WIRED in 0.26.4** → custody_severed.

### E. Art batch locked + wired 0.26.4 (2026-08-16 Art → Build)
All on disk in both image folders and wired:
- Tomas refresh (younger, no cross): `tomas.jpg`, `bond_tomas.jpg`, `quiet_tomas.jpg`, `tomas_break.jpg`
- Exclusive: `mira_thermal_cut.jpg`, `breath_onset.jpg`, `custody_onset.jpg`
- Vess/observation: `vess_signal.jpg`, `observation_reckon.jpg`
- ≤5 enforcement: `corridor_pressure_1..4.jpg`, `power_stress_1/2.jpg`, `vault_interior_alt.jpg`, `observation_bridge_alt.jpg`, `medbay_dim_alt.jpg`

**Remaining heavies after 0.26.4 (outside ticket scope — late/mid/engine):** corridor_variant ×10, observation_bridge_alt ×8, debris_field ×8, medbay_dim ×7, vess_signal ×6, observation_reckon ×6, observation_bridge ×6, corridor ×6. Further reduction requires a second pass touching mid/late scenes.

**Reserved / do not wire yet:** Vess intimate set, romance_*_1 peaks, ending_*, faction_split*, competence_watch, pregnancy_check*, sun_drawing*, onboarding_background, corridor_walk.

---

## 0.12 Romance — do NOT generate yet except as noted

### Already locked and on disk (wire when routes are written)
| Character | Front | Shower | Rear |
|-----------|-------|--------|------|
| Lena | lena.jpg | shower_lena.jpg | rear_lena.jpg |
| Mira | mira.jpg | shower_mira.jpg | rear_mira.jpg |
| Amara | amara.jpg | shower_amara.jpg | rear_amara.jpg |
| Sela | sela.jpg | shower_sela.jpg | rear_sela.jpg |

Also locked: `romance_lena_1.jpg`, `romance_mira_1.jpg`, `romance_amara_tomas.jpg`

**Commander kissing plates (all five) — LOCKED 2026-08-15 + FILES ON DISK in both folders:**
- `romance_lena_1.jpg` (existing)
- `romance_mira_1.jpg` (existing)
- `romance_amara_1.jpg` — naked above-waist sensual kiss, consistent Commander
- `romance_sela_1.jpg` — naked above-waist sensual kiss, consistent Commander
- `romance_vess_1.jpg` — naked above-waist sensual kiss, consistent Commander

### Generate only when the matching beats are written (do not generate early)

**Already needed for existing 0.12 routes (if not already using shower/romance plates):**
- Amara Commander peak / Sela peak may already use shower_* — fine until dedicated plates exist

**Second-pass / post-intimacy — ART LOCKED, ready for Build to wire:**
- **Lingerie / seduction set (Hero) — REDONE & RELOCKED 2026-08-16** (role-prop covers, fully nude except prop):
  - `lingerie_lena.jpg` — nude, stethoscope (tubing between breasts, chest piece low)
  - `lingerie_mira.jpg` — nude, clipboard held low
  - `lingerie_amara.jpg` — nude, grow-light wand
  - `lingerie_sela.jpg` — nude on bunk, small pillow covering crotch, athletic, seductive
  - `lingerie_vess.jpg` — nude, headset covering crotch
  All five in both `sunsplitter/images/` and `sunsplitter_images/`.
- **Post-sex afterglow set (Hero)** — LOCKED on disk (Commander POV, breasts exposed, minimal cover, sweaty/messy hair, looking at viewer):
  - `afterglow_lena.jpg`
  - `afterglow_mira.jpg` (side angle)
  - `afterglow_amara.jpg` (thin thong)
  - `afterglow_sela.jpg`
  - `afterglow_vess.jpg` (exists)

Wire only into earned aftermath / pursuit beats. Continuity > volume. Adult — match locked Batch A faces.

---

## HIGH PRIORITY — While external review is pending (2026-08-14) — RESOLVED

1. **Quiet plates continuity** — DONE
   - `quiet_mira.jpg` refreshed (Batch A match)
   - `quiet_tomas.jpg` regenerated (was wrong face; now locked Batch A)
   - `quiet_amara.jpg` kept (already good)
   - quiet_sela covered by sela_ritual

2. **Observation / group continuity** — DONE
   - `observation_crew.jpg` fully refreshed: Batch A faces (Mira, Amara, Elias, Tomas, Jiro), layered clothing, intact viewport, rectangular bay, empty seats visible

3. **0.18 onboarding / tone-contract background** — DONE
   - `onboarding_background.jpg` (rectangular corridor → intact observation blister, no text, grimdark)

4. **Optional environmental pressure** — DONE (1 plate)
   - `debris_field.jpg` (hull scar + distant wreck silhouette)

All saved to both `sunsplitter_images/` and `sunsplitter/images/`. Ready for Build to wire.

---

## Still Needed (Lower Priority / Polish)

- Stronger Rourke death / covered_body variants
- Unique ending art per title if desired (Landfall + ship plates already exist)
- Any remaining curved-interior plates after crisis family is fixed

---

## Completed (Integrated or on disk)

### Portraits — Batch A (LOCKED)
Lena (blonde redesign LOCKED 2026-08-14), Elias, Mira (stays dark), Tomas, Amara, Jiro, Sela (adult 20), Rourke

Lena plates updated to blonde: lena.jpg, medical_bay.jpg, romance_lena_1.jpg, shower_lena.jpg, rear_lena.jpg, lingerie_lena.jpg, afterglow_lena.jpg

### Romance Wave 2 (LOCKED)
romance_mira_1, romance_lena_1, romance_amara_tomas

### Crisis + Locations
crisis, cut_out, vent, self_risk, hydroponics, power_crisis, vault_reveal, tomas_break, observation_bridge, corridor, ending_landfall, ending_ship

### Base / supporting plates on disk
medical_bay, bulkhead, observation, aftermath, vault, rogue_planet, covered_body, abandoned_section, abandoned_sealed, transmission, faction_split, final_choice, pregnancy_check, reckon_public, priority_repairs, private_stores, sela_ritual, sun_drawing_adult, observation_crew, hydroponics_amara, quiet_*, shower_*, rear_*

### Quiet Private Moments (LOCKED)
quiet_sela (via sela_ritual), quiet_mira (refreshed 2026-08-14), quiet_amara, quiet_tomas (regenerated 2026-08-14)

### Observation / Onboarding / Env (LOCKED 2026-08-14)
- observation_crew.jpg (Batch A group, layered clothing, intact viewport)
- onboarding_background.jpg (0.18 tone-contract / content-warning plate)
- debris_field.jpg (environmental pressure — alone in space)

### Shower + Rear (LOCKED for intimate beats)
shower_lena/mira/amara/sela, rear_lena/mira/amara/sela

**0.22.1 Explicit Art Utilization (WIRED 2026-08-15):**  
`shower_lena`, `shower_mira`, `rear_lena`, `rear_mira`, `rear_amara`, `rear_sela` are now reachable pure-data one-shot aftermath scenes (optional choice from first-sex / pursuit_*_sex → short visual variant → original next). Done flags + death/romance gates. `shower_amara` / `shower_sela` remain the primary images on their first-sex scenes (untouched). Lingerie / afterglow mappings unchanged.

### Male bonds — non-sexual (LOCKED 2026-08-14)
- `bond_elias.jpg` — shared drink, finalized attractive Elias
- `bond_tomas.jpg` — cards + beer, finalized attractive Tomas
- `bond_jiro.jpg` — quiet work hang, finalized attractive Jiro

### Lingerie set (LOCKED 2026-08-14)
lingerie_lena, lingerie_mira, lingerie_amara, lingerie_sela

### Afterglow set (LOCKED 2026-08-14)
afterglow_lena, afterglow_mira, afterglow_amara, afterglow_sela

### Continuity + optional Strong (LOCKED 2026-08-14)
- aftermath.jpg — adult yellow sun motif + house key (no child drawing)
- faction_split.jpg / faction_split_alt.jpg — Batch A only, natural poses
- hydroponics_amara.jpg — Amara skin-tight body suit
- cascade_records.jpg — arc_future_3, Mira + Jiro in bodysuits, data focus
- arc_living_conflict.jpg — Tomas / Mira / Amara reactive conflict, bodysuits
- ending_fracture.jpg — dark Fracture mood plate

**Clothing direction (going forward):** mix sexy form-fitting cyberpunk bodysuits with tank tops / layered work clothes across plates. Not all one style.

---

## Process
1. New scene created → automatically listed here with suggested tier
2. Art chat works High → Medium, using tiers + variant rules
3. **Always show Imagine cards for approval first** — never treat as locked until user says lock
4. On lock: save to `artifacts/sunsplitter_images/` AND mirror to `sunsplitter/images/`
5. Update `sceneImages` in `state.js`, then mark complete here
6. Never block narrative on missing art — portraits + shower/rear + lingerie/afterglow cover intimate beats

## Art chat priority order right now
1. Crisis fix — DONE
2. Wire existing plates — DONE
3. Male bonds + lingerie + afterglow — DONE (locked on disk)
4. While-review-pending batch (quiet continuity, observation_crew, onboarding_background, debris_field) — DONE / LOCKED
5. Optional polish only if requested (Strong arc peak plates, Rourke variants)
6. Otherwise stop — wait for new scene IDs from Narrative/Build before generating more


## v0.12 Romance structure (wired existing assets)

| Scene ID | Art status | Notes |
|----------|------------|-------|
| intimacy_window | uses observation_bridge | OK |
| bond_mira / romance_mira_1 | romance_mira_1.jpg | OK |
| bond_amara / romance_amara_1 | shower_amara.jpg | OK for intimate; optional dedicated Commander plate later |
| bond_sela / romance_sela_1 | shower_sela.jpg | OK; rear_sela available for later variant |
| bond_lena / romance_lena_sex | romance_lena_1.jpg | OK |
| romance_amara_tomas_sex | romance_amara_tomas.jpg | OK |
| rear_* | deferred | wire only if new intimate variants written |

No new erotic backlog required for 0.12 ship.


## v0.14 Density
| Scene ID | Art | Notes |
|----------|-----|-------|
| empty_berths | corridor.jpg (wired) | Optional dedicated empty-berth plate later |
| competence_watch | observation_bridge.jpg (wired) | Optional competence group plate later |


## v0.15 Relationship Debt
| Scene ID | Art | Notes |
|----------|-----|-------|
| pursuit_*_sex | rear_*.jpg wired | Optional lingerie/afterglow Hero later |
| debt_notice | faction_split_alt | OK |
| coolant_trade / seal_or_food | power_crisis / priority_repairs | OK |
| history_elias | elias.jpg | OK |
| favor_mira | mira.jpg | OK |


## v0.16 Persistent
| Scene ID | Art | Notes |
|----------|-----|-------|
| ship_interrupt | power_crisis.jpg | OK |
| boarding_stories | corridor.jpg | OK |
| sun_payoff | sela_ritual.jpg | OK |
| ship_memory_payoff | bulkhead.jpg | OK |
| patch_fails | vent.jpg | Optional dedicated fail plate later |

## v0.23 Recoveries + Vault needs a face (Fable packages locked 2026-08-15)

New plates requested by the locked pure-data packages. Do not block Build — use existing close plates or placeholders until Art batch. Recovery plates must carry cost texture, not rescue warmth. Portrait orientation only. Batch A faces only.

| Art key | Priority | Notes / characters |
|---------|----------|--------------------|
| annex_drift_far | Strong | Distant agri-annex on drift, green strip visible. No people required. |
| annex_water_vent | Strong | Vent / reaction-mass feel; ship shudder implied. Cost texture. |
| tether_ride | Strong | EVA on tether line; rider can be silhouette or back. Elias/Mira/Sela variants optional later. |
| tether_dock_catch | Strong / Hero | Dock moment; trays green vs ruined (two variants or one with state). Tomas emerging. Cost visible. |
| attitude_ring_telemetry | Solid | Bridge / ring log screen. Pattern detection beat. |
| bridge_burn_plot | Solid | Bridge, burn geometry, margin gauge. |
| correction_burn | Strong | Actual burn / thrust moment. Cost of margin. |
| spine_cut_torch | Strong | Torch work on buckled spine; one-way structural decision. Elias or crew back. |
| bridge_briefing_charts | Solid | Jiro briefing with paper charts / hand logs. |
| vault_manifest_lamp | Strong / Hero | Quiet vault interior, single lamp, manifest terminal. Sela or Elias reading. Future-concrete mood. No text legible. |

Reuse candidates if close enough: existing vault_reveal family, observation / bridge plates, medbay_dim, mess_assembly, commander_console.

## v0.24 Vess Arrival + 5th Romance (shipped 2026-08-15)

New scene IDs (wired to closest existing plates; dedicated art later). No new art generated in 0.24 ticket.

| Scene ID | Current plate | Priority for dedicated | Notes |
|----------|---------------|------------------------|-------|
| vess_signal | transmission.jpg | Strong | Long-range board / carrier resolution. No face required. |
| vess_cost | transmission.jpg | Solid | Cost texture — reaction-mass / bus degradation. |
| vess_boarding | vess_boarding.jpg | Hero | Tall wiry Vess (long white-silver hair, 22, attractive Batch A style), patched suit, hard dock. First look. Dedicated plate locked. |
| vess_offer | vess_offer.jpg | Strong | Observation blister, informed offer. Vess + Commander silhouette/back. |
| vess_transmission | transmission.jpg | Solid | Last long-range window request. |
| vess_intimate | vess_intimate.jpg | Hero | Power-stays-hers explicit; shorter route. |

**Vess portrait set CLOSED 2026-08-16:** full approved set on disk in both folders (vess.jpg + boarding/offer/intimate + romance_vess_1 + afterglow/lingerie/rear/shower). Long white/silver hair, purple eyes locked. No further generation required.

## SUN-V035-PLAYTEST-OFFSHIFT-VESS-01 — declared portrait reuse (2026-09-02)

SOURCE main@8d23109 · RUNTIME baseline 1f68553 · TASK SUN-V035-PLAYTEST-OFFSHIFT-VESS-01 · MODE implementation

Build / $ Con V9; owner-authorized by `1506CT-V9-OFFSHIFT-VESS-01.md`.
Read AGENTS, ROADMAP, PROJECT_STATUS, LOCKS, ART_RULES, this manifest,
SCENE_SKELETON, and GITHUB_PUSH_RULES. This entry is one scene alias, not ART-R2
or a new portrait lock. L-029 supersedes the older Vess-set approval above.

- **Alias:** `offshift_vess` → existing `images/vess.jpg` in both the map and
  scene declaration. No duplicate image file; official portrait bytes untouched.
- **Finding:** both old bindings selected `transmission.jpg`, whose visible
  dark-haired male figure does not depict Vess. The rejected `offshift_vess.jpg`
  remains unwired; no discarded Vess plate is reinstated.
- **Depicted:** Vess alone, adult woman, long white-silver hair, purple irises,
  dark tank top; no Commander face, extra crew, baked text, or sexual act.
- **Location/composition:** close character portrait against a rectangular
  ship interior with cyan/purple light. A portrait substitute for the relay-bay
  conversation, not a claim to illustrate its chair or beacon action exactly.
- **Palette/tier:** Future-cold / Solid reused portrait. Existing 784×1168 JPEG.
- **Render range:** entry and saved-scene resume of `offshift_vess`, after the
  living/recovered Vess offer in `offshift_open`, until `faction_split`; both
  romantic and non-romantic states. No romance eligibility change.
- **Roster safety:** resolver uses existing `corridor_variant.jpg` only for this
  scene if Vess is absent/dead, including malformed saved-scene fixtures. This
  is image safety only, not a repair or correctness claim for invalid-save prose.
- **Portrait SHA-256:** `a25799e8ae9663cbb91c4fe950fa937abc589d95d9f9015ab89d3c187fc5bcdf`.
- **Proof:** verifier checks map/declaration/resolver/render, exact locked bytes,
  live admission, both relationship states, unchanged saves/rerenders/exits,
  and absent/dead saved-image fallback. Mobile composition evidence and exact
  head/CI results accompany the PR and V9 outbox receipt.

No other scene binding, image bytes, story, cost, or romance gate changes.
NO-PUBLISH / NOT_CERTIFIED; last certified remains 0.28.1d. ART-R2/L-004 stays held.
Next action: Manraj reviews the named PR; merge-commit in the browser, not squash.

## SUN-V035-PLAYTEST-ART-REPEAT-01 — one hub alias (2026-09-02)

SOURCE main@8d23109 · RUNTIME baseline d18b34d · TASK SUN-V035-PLAYTEST-ART-REPEAT-01 · MODE implementation

Build / $ Con V9; owner-authorized by `1618CT-V9-ART-REPEAT-01.md`.
Read AGENTS, ROADMAP, PROJECT_STATUS, LOCKS, ART_RULES, this manifest,
SCENE_SKELETON, and GITHUB_PUSH_RULES. This is one existing-plate alias,
not a new art lock or a deep art-to-event audit.

- **Confirmed repeat:** legal policy replay renders `act3_spine_next` →
  `warmth_music` → hub → `warmth_laughter` → hub with `corridor.jpg` on all
  five frames. Both the explicit scene image and map bind the same old plate.
- **Alias:** only `act3_spine_next` → existing `images/corridor_variant_2.jpg`
  in both bindings. Music/laughter and all other scene images remain untouched.
- **Visual review:** empty rectangular ship corridor, cyan side lights and
  sparse red lamps, exposed dark service runs; no visible person or identifiable
  crew, no Commander face, no legible text observed. Location/mood substitute,
  not a literal depiction of the vault board or Tomas's optional conversation.
- **Palette/tier:** Future-cold / Solid reused location; existing 784×1168 JPEG.
- **Render range:** post-vault hub entry, optional-event returns, and saved hub
  resume. Existing unrecovered-Vess redirect runs before the hub paints.
  The empty plate makes no living/dead/recovery assertion and needs no new guard.
- **Immediate-neighbor safety:** distinct from music/laughter's `corridor.jpg`
  and debt return's `corridor_pressure_4.jpg` / `corridor_variant.jpg` fallback.
- **Image SHA-256:** `b1320c8eb2445272fa49599169f18a506a69e7b755dcdd88ba33c8db106d401e`.
- **Proof:** regression covers both warmth-event orders and returns, living/dead
  roster, map/declaration/render, nine saved-scene fixtures, unchanged saved state,
  debt return and unrecovered-Vess entry redirect. The new check rejects baseline
  bindings. Exact-head browser/CI evidence accompanies the PR and V9 receipt.

No image bytes, story, choices, state writes, costs, romance gates, or resolver
changes. No offshift_vess remint; vess.jpg untouched. ART-R2/L-004 stays held.
NO-PUBLISH / NOT_CERTIFIED; last certified remains 0.28.1d.
Next action: Manraj reviews the named PR; merge-commit in the browser, not squash.
