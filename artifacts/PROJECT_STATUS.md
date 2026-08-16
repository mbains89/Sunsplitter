# Sunsplitter — Project Status

**Last updated:** 2026-08-16  
**Current version:** **0.27.2** (Allusion carriers — complete)  
**Next:** **0.28** Off-Shift + pairs. Ticket 2 still needs Grok lock.  
**Art 2026-08-16:** Lingerie/seduction set REDONE & RELOCKED for all five (Lena stethoscope, Mira clipboard, Amara grow-light wand, Sela pillow-on-bunk, Vess headset). Files in both image folders. ART_REQUESTS.md updated. Art chat bloated — start fresh Art from PROJECT_STATUS + ART_REQUESTS + ART_RULES only.  
**0.25 playtest notes (CLOSED):**  
1. quiet_sela residual yellow-flower — **resolved**. Image rewired to sela_ritual in 0.25.1; prose verified clean of flower language against sun-v0.25.3-net.zip.  
2. Fixed event order / replayability — **no fix**. Carried forward as accepted design limitation per prior session disposition.  
3. arc_fork — **resolved**. Current prose already reads as a major visible fork ("will not let you pretend those are the same choice," ends on "Where do you put your weight?"), verified against sun-v0.25.3-net.zip.  
**Latest deploy zip:** `artifacts/sun-v0.27.2-net.zip`  
**Process note:** Version close-out ritual LOCKED 2026-08-15 (see Process section). Applies from 0.24.2 onward. **Automatic on every version ship:** updated PROJECT_STATUS.md + zip + any other changed canon docs (ART_REQUESTS, CHARACTER_BIBLE, VOICE_CARDS, FABLE_BRIEF, SCENE_SKELETON, cascade docs, MINTED_PHRASES, ART_RULES) — no request required.  
**Naming (from 0.26 onward; also used for 0.25.3+):** Future versioned zips use short form `sun-vX.X.X-net.zip` (e.g. `sun-v0.26-net.zip`) so names fit better on iPhone. Past files unchanged.  
**Character bible:** `artifacts/CHARACTER_BIBLE.md` (v1 locked 2026-08-14)  
**Fable 0.23 source:** `artifacts/FABLE_0.23_PACKAGES.md` (**historical** — shipped truth is `scenes-crises.js` + this file; header pointer only)  
**Fable Cascade Background:** `artifacts/FABLE_CASCADE_BACKGROUND.md` (LOCKED 2026-08-15 — canon spine + insights)  
**Fable Cascade Allusive:** `artifacts/FABLE_CASCADE_ALLUSIVE.md` (LOCKED 2026-08-15 — 6 light crew beats; A/B retired; **formally deferred to 0.29**)  
**Fable 0.27 Promises package:** SHIPPED as v0.27; Fable verification 2026-08-16 SHIP CONFIRMED (31 scenes, 18 host splices, contract-class runtime-compliant). Allusion Rider deferred → 0.27.2.  
**Fable 0.25 Lethals:** LOCKED 2026-08-15 — see full lock block below. Source package in `fable_handoff_0.25_0.26.zip` + this revision.  
**Fable 0.26 Exclusive Crises:** SHIPPED 2026-08-15 as v0.26. Source: lock block + scenes-exclusive.js.  

---


---

## 2026-08-16 0.27.2 SHIPPED — Allusion Carriers (Promise Re-surfacing)

One concern only. No new prose invention. No new scenes. No flags beyond one-shot allude markers. No art.

1. **Six exact rider lines** from MINTED_PHRASES RESERVED block placed as one-shot mid-run diegetic allusions:
   - Amara → `act2_tether_sighting` (after green-light line)
   - Elias → `act2_tether_sighting` (after suit-prep line)
   - Mira → `act3_reckoning_pattern` (after drift-schedule open)
   - Lena → `act3_reckoning_pattern` (after hypercapnic line)
   - Sela → `act3_reckoning_pattern` (after faith/arithmetic line)
   - Tomas → `act3_spine_next` (corridor; fires on re-entry after bond/make)
2. **Gates:** `promises.<who> === "made" && isAlive(<who>) && !flags.prom_<who>_alluded`
3. **One-shot flags** written on render; added to validate.js engineFlags: prom_amara_alluded, prom_tomas_alluded, prom_elias_alluded, prom_lena_alluded, prom_sela_alluded, prom_mira_alluded
4. Not placed in make-points or test clusters. Dead speakers never allude.
5. VERSION = "0.27.2". MINTED_PHRASES rider lines moved RESERVED → SPENT.

Validate: **191 scenes, 0 errors** (no new scenes). Zip: `sun-v0.27.2-net.zip`.

**Next action:** 0.28 Off-Shift + pairs, or Ticket 2 after Grok lock.

## 2026-08-16 Fable 0.27 Implementation Verification — SHIP CONFIRMED

Source: Fable audit against `sun-v0.27-net.zip`.

**Verified clean**
- 31/31 scenes present (16 make/response, 12 test/outcome, 3 Sela cluster).
- All 18 host splices present and correct.
- Registry writes idempotent; Tomas derivation + quote-back in custody_after.
- Contract-class rule holds at runtime (max 2 renders/run per sentence).
- Ladders, gates, kill causes, effects, romanceOpen closure, validate allowlist all match.
- Validate close-out (Build): **191 scenes, 0 errors**.

**Deviations (ranked)**
- **P1 (closed 0.27.2):** Allusion Rider shipped. Six one-shot mid-run carriers in act2_tether_sighting / act3_reckoning_pattern / act3_spine_next.
- **P2 (closed this pass):** VERSION.md manifest said "26 scenes"; actual 31. Corrected in STATUS + MINTED_PHRASES; Build publishes 191/0.
- **P3 (cosmetic, optional):** amara_rear/lena_rear dead-entry guards double-hop via _ag interstitial; pre-render bounce, no player-visible effect.

**GROK LOCKS (accepted 2026-08-16)**
1. **Dispatch 0.27.2 Allusion carriers ahead of 0.28.** Six lines + gates from the 0.27 package rider block. Carrier-placement only; no new prose invention.
2. **Contract-class addendum recorded** in `MINTED_PHRASES.md` (six spent + six reserved rider lines). PROJECT_STATUS brought current through 0.27.1.

**Build question answered:** 0.27 validate close-out = **191 scenes / 0 errors**. Scene count in package was 31 (not 26).

**Next dispatch:** 0.28 Off-Shift + pairs (Allusion carriers shipped as 0.27.2).

---
## 2026-08-16 0.27.1 SHIPPED — sceneImages map honesty sync

One concern only. No prose, no flags, no new scenes, no engine logic.

1. **state.js sceneImages** — 19 map entries synced to live inline `image:` fields (coolant_trade, seal_or_food, act2_tether_*, act2_spine_next, act3_reckoning_heading/burn_*/delay, act3_vault_face, act3_spine_next, ship_interrupt, boarding_stories).
2. Guarded IDs and resolveSceneImage precedence untouched.
3. VERSION = "0.27.1".

Validate: same scene count as 0.27, 0 new errors. Zip: `sun-v0.27.1-net.zip`.

**Next action:** 0.28 Off-Shift + pairs, or Ticket 2 after Grok lock.

---

## 2026-08-16 0.27 SHIPPED — Spoken Promises

One concern only. Full pure-data package from Fable + Binding Pass Appendix.

1. **New file** `js/scenes-promises.js` (registerScenes). 31 scenes: 8 make-points + 8 response beats + prom_vent cluster (3) + prom_deck4 (3) + prom_line (3) + prom_direct (3) + prom_price (3).
2. **Host splices (next rewires only):** quiet_amara, quiet_sela, bond_tomas → prom_make_*; history_elias → prom_make_elias; favor_mira → prom_make_mira; lena_dying (non-romance exits) → prom_make_lena; pursuit_amara_sex / amara_rear → prom_make_amara_ag; pursuit_lena_sex / lena_rear → prom_make_lena_ag.
3. **Test chain:** breath_after + custody_after next → prom_vent; chain self-guards; prom_vent → prom_deck4 → prom_line → prom_direct → faction_split. custody_onset → prom_price; custody_hub `get choices()` hides custody_shared when promises.sela === "broken".
4. **Resolution:** custody_after onEnter derives Tomas kept/broken from custody_answer; Amara resolution lives in prom_vent_*; Lena/Elias/Mira/Sela keep/break in their test clusters. kill() only in prom_vent_break / prom_line_break onEnter.
5. **state.js:** promises comment updated; romanceOpen closes when promises[who] === "broken".
6. **validate.js:** ten prom_* keys added to engineFlags.
7. **index.html:** scenes-promises.js after scenes-exclusive.js, before scenes-late.js.
8. Images: REUSE only (quiet_*/afterglow_*/medbay_dim/elias/mira/corridor_variant/bulkhead/observation/covered_body/vault_reveal/power_crisis).

VERSION = "0.27". Validate: 191 scenes, 0 syntax errors (load harness). Zip: `sun-v0.27-net.zip`.

**Deferred (still open):** Ticket 2 new-crew indicator. scenes-late.js split. (Allusion Rider closed in 0.27.2.)

**Next action:** 0.28 Off-Shift + pairs, or Ticket 2 after Grok lock.

---

## 2026-08-16 0.26.4 SHIPPED — Wire new art batch (≤5 reuse + exclusive/Mira/Vess)

One concern only. Image path swaps only. No prose, no flags, no new scenes. Touched: `js/state.js` (sceneImages + VERSION), `js/scenes-exclusive.js` (inline `image:`).

**Path changes made:**

1. `custody_severed` → `images/mira_thermal_cut.jpg` (already present; confirmed)
2. `breath_onset` → `images/breath_onset.jpg` (already present; confirmed)
3. `custody_onset` → `images/custody_onset.jpg` (already present; confirmed)
4. `vess_signal` / `vess_cost` / `vess_transmission` → `images/vess_signal.jpg` (already present; confirmed)
5. `reckon_truth` / `reckon_summary` / `reckon_suppress` → `images/observation_reckon.jpg` (already present); **arc_fork** also → `images/observation_reckon.jpg`
6. Exclusive remaining heavies distributed:
   - `act3_crisis_declare`: `observation.jpg` → `corridor_pressure_1.jpg`
   - `custody_shared`: `observation.jpg` → `observation_bridge_alt.jpg`
   - `custody_thaw`: `vault.jpg` → `vault_interior_alt.jpg`
7. Map power + status/lead distribution:
   - `power_crisis` → `power_stress_2.jpg`
   - `status` → `observation_bridge_alt.jpg`
   - `priority_ration` → `observation_reckon.jpg`
   - `lead_together` → `observation_bridge_alt.jpg`
   - `lead_hard` → `corridor_pressure_1.jpg`
   - `lead_watch` → `corridor_pressure_2.jpg`
8. `vault_interior_alt` now multi-used (arc_future_2, act3_vault_face, custody_thaw)
9. `observation_bridge_alt` / `medbay_dim_alt` already multi-used; confirmed
10. tomas.jpg / bond_tomas / quiet_tomas / tomas_break remain on correct same-name refreshed files

**Do-not-wire list respected** (no afterglow/lingerie/rear/shower Vess, romance peaks, ending_*, faction_split*, competence_watch, pregnancy_check*, sun_drawing*, onboarding_background, corridor_walk).

**Final reuse counts (former heavies + new):**  
corridor_variant.jpg ×10 (untouched outside ticket scope), observation_bridge_alt.jpg ×8, debris_field.jpg ×8, medbay_dim.jpg ×7, vess_signal.jpg ×6, observation_reckon.jpg ×6, observation_bridge.jpg ×6, corridor.jpg ×6, power_crisis.jpg ×5, corridor_pressure_1.jpg ×5. observation.jpg reduced to engine fallbacks only (×2). Goal of ≤5 not fully achievable without touching late/mid/engine; distribution maximized within ticket touch list.

VERSION = "0.26.4". Validate expected 160 scenes / 0 errors (image-only, pure-data). Zip: `sun-v0.26.4-net.zip`.

**Next action:** 0.27 Promises when full package arrives, or Ticket 2 after Grok lock.

---

## 2026-08-16 0.26.3 SHIPPED — Vess scene-image wiring

One concern only. Restores already-approved art (ART_REQUESTS 0.24 table) to its intended scenes. No new decision.

1. **scenes-crises.js** — three scene-level `image:` fields that shadowed the sceneImages map:
   - `vess_boarding`: debris_field.jpg → vess_boarding.jpg
   - `vess_offer`: observation.jpg → vess_offer.jpg
   - `vess_intimate`: observation_bridge.jpg → vess_intimate.jpg
2. `vess_signal` / `vess_cost` / `vess_transmission` stay on transmission.jpg (correct as designed).
3. No other fields, no engine.js change, no new flags.

VERSION = "0.26.3". Validate: 160 scenes, 0 errors. Zip: `sun-v0.26.3-net.zip`.

**Fable playtest findings still open:**
- Ticket 2 (presentational new-crew highlight on Crew button when recovered.tomas/jiro/vess flips) — **needs Grok lock** before Build dispatch.
- Vess intimate-parity aftermath scenes (romance_vess_1 / afterglow / lingerie / rear / shower plates on disk but unwired) — missing content; needs Fable writing sprint, not a bugfix.
- Housekeeping: crew.bio never rendered anywhere — not urgent.

**Next action:** 0.27 Promises when full package arrives, or Ticket 2 after lock.

---

## 2026-08-16 0.26.2 SHIPPED — Vess bio hair alignment

One concern only. Residual from Fable doc-maintenance pass.

1. **state.js crew.vess.bio:** dropped residual "self-cut" so the live bio matches the locked approved art set (long white-silver flowing hair, purple eyes). Text now: "Tall, wiry-athletic, long white-silver hair."
2. No scene, flag, gate, image, or validate changes. Pure string alignment.

VERSION = "0.26.2". Zip: `sun-v0.26.2-net.zip`.

**Note:** ART_REQUESTS vess_boarding table row cleaned of the same residual "self-cut". mira_thermal_cut remains ON HOLD (tool-side stall); corridor_variant.jpg stays live for custody_severed.

**Shipped follow-up:** 0.26.3 Vess scene-image wiring (complete).

---

## 2026-08-15 0.26.1 SHIPPED — Causality Hygiene + Provisional Art Reassignment

One concern only. Direct fallout of the 0.26 Fable audit. No new locks required.

1. **scenes-exclusive.js — act3_crisis_declare:** deleted both dead `onChoose` fields (engine `makeChoice()` has no handler). breath_onset / custody_onset already guarantee the crisisPath write via onEnter. Net −2 lines, zero functional delta.
2. **validate.js — engineFlags:** added `breath_word`, `breath_answer`, `custody_roll`, `custody_answer` (Build Question 5 from original 0.26 lock, never applied).
3. **validate.js — choice-level shape:** new `ALLOWED_CHOICE_KEYS` set (text/next/effects/affinity/flag/lean/requires/trust/alive/aliveAll/aliveAny/mark/remember/tag). Error on any choice key outside the set. Catches silent `onChoose` ships. Extended list with `tag` (bond/private labels in use).
4. **Provisional image reassignment (hygiene only):**
   - `breath_trunks`: abandoned_sealed.jpg → corridor_variant.jpg (baked legible text "SECTION 7-4 SEALED" + biohazard glyph).
   - `custody_severed`: self_risk.jpg → corridor_variant.jpg (identifiable male figure; scene is Mira). corridor_variant is roster-ambiguous; fifth use in this file is normal reuse.

VERSION = "0.26.1". Validate: 160 scenes, 0 errors. Zip: `sun-v0.26.1-net.zip`.

**Build questions answered:** (1) `tag` was a legitimate missing key — extended set. No computed/spread patterns hiding others. (2) corridor_variant ×5 in exclusive flagged for Art awareness.

**GROK LOCKS closed 2026-08-16 (Fable doc-maintenance pass):** (1) Vess hair LOCKED long white/silver (state.js bio + ART_REQUESTS + full art set consistent; dark knife-cut superseded). (2) custody_severed permanent art disposition LOCKED — dedicated Mira cold-radiation-injury plate approved (`mira_thermal_cut.jpg`). Replaces corridor_variant.jpg hygiene swap once art lands. **Art generation ON HOLD (2026-08-16):** stalling on the tool side, not a design/prompt issue. Revisit later. corridor_variant.jpg remains the live plate for custody_severed in the meantime, no regression.

**Next action (at time of ship):** 0.26.2 bio alignment or 0.27 Promises. (0.26.2 shipped 2026-08-16.)

---

## 2026-08-15 0.26 SHIPPED — Ideology Router + Exclusive Crises

One concern only. Locked package (rev 2).

1. New `js/scenes-exclusive.js` (registerScenes form). 18 pure-data scenes: act3_crisis_router, act3_crisis_declare, breath_* (onset/word/hub/racks/trunks/garden/blacksleep/after), custody_* (onset/hub/possession/thaw/severed/shared/after).
2. `index.html`: insert script between scenes-crises.js and scenes-late.js.
3. `faction_split` (scenes-late.js): onEnter only — `if (state.crisisPath == null) return "act3_crisis_router";`. No loadedGameVersion guard. Existing text/choices/next untouched.
4. VERSION = "0.26". Four flags (breath_word, breath_answer, custody_roll, custody_answer) written only in onEnter. Death-free. Ungated floors: breath_trunks, custody_thaw. Alive + requires gates. Both afters → faction_split. Phrase "the first piece of another world" spent in breath_garden.
5. No other files, no art, no remember(), no state.promises, no SPINE assert, no concreteRunFacts.

Validate: 160 scenes, 0 errors (pre-existing reachability warnings only). Zip: `sun-v0.26-net.zip`.

**Shipped follow-up:** 0.26.1 causality hygiene + provisional art reassignment (complete).

---

## 2026-08-15 0.25.4 SHIPPED — onEnter idempotency (resume-safe)

One concern only. `showScene()` calls `scene.onEnter()` unconditionally; resume re-enters the same scene. Guard cumulative mutations with the completion state each scene already tracks. No restructure.

1. **vess_boarding** (scenes-crises.js): guard under `!isRecovered("vess")` (survivors + affinity/trust init + remember).
2. **romance_mira_1 / romance_amara_1 / romance_sela_1** (scenes-mid-b.js): wrap mutations under `!state.romance.<who>`.
3. **romance_amara_tomas_sex**: wrap under `!state.romance.amara_tomas`.
4. **pursuit_mira_sex / pursuit_amara_sex / pursuit_sela_sex / pursuit_lena_sex**: wrap under `!state.pursuit.<who>`; cross-penalties (tomas −8, jiro −5) inside the same one-time guard.
5. **romance_lena_sex** (scenes-mid-a.js): already guarded under `!state.romance.lena` — excluded.
6. **rourke_try** (scenes-early.js): gate `addAffinity("mira", 8)` + remember on pre-call dead state; `kill()` stays unconditional (idempotent).
7. **remember(text)** (state.js): ignore exact duplicate strings.

Validate: 142 scenes, 0 errors (20 pre-existing warnings). Zip: `sun-v0.25.4-net.zip`.

**Playtest notes closed** (see header). 0.25.5 (validator lint) remains a distinct ticket.

**Next action:** 0.26 Exclusive crises (package locked below).

---

## 2026-08-15 Fable 0.26 Ideology Router + Exclusive Crises — LOCKED (rev 2)

**Verdict:** APPROVED. Rev 1 discarded (written blind). Rev 2 verified against `sun-v0.25.4-net.zip`. All GROK LOCKS 1–9 accepted. Build questions answered below.

**Structure (locked):**
- New pure-data file `js/scenes-exclusive.js` (registerScenes; load order: after scenes-crises.js, before scenes-late.js).
- Single existing-file exception: five-line `onEnter` on `faction_split` (scenes-late.js) that redirects to `act3_crisis_router` when `state.crisisPath == null` and `loadedGameVersion >= "0.26"`. Idempotent / resume-safe. All eight existing `next: "faction_split"` edges stay untouched.
- Router: `act3_crisis_router` uses existing `ideologyShape()` (vault_sacrifice dominant). Living → breath path; Future → custody path; split → short forced-declaration scene then choice.
- Exit: both `breath_after` and `custody_after` return to `faction_split`.
- **0.26 is death-free.** No new kill vectors. Tomas trunk death from rev 1 stricken — `act3_lethal_tomas_end` already owns his single authored vector upstream on the same spine. Elias sealed-orders stays out permanently (`act3_lethal_elias_order` shipped 0.25).
- Survivor-dependent options use engine `alive:` (hide) + `requires:` (disable + honest reason). One ungated floor per hub (breath_trunks, custody_thaw) so neither can dead-end.
- Flag economy (four new keys, package-prefixed; all plain assignment, idempotent):
  - `flags.breath_word` = `"given"` | `"refused"`
  - `flags.breath_answer` = `"racks"` | `"trunks"` | `"garden"` | `"blacksleep"`
  - `flags.custody_roll` = `true`
  - `flags.custody_answer` = `"possession"` | `"thawed"` | `"severed"` | `"shared"`
- Top-level `state.crisisPath` already prepared in 0.25.4 (`"breath"` | `"custody"` | `null`).
- Resource table and gates as drafted in package (repriced against real act-3 balances). Silent clamps forbidden; large costs gated.
- Image: REUSE only + two RESCUE (`abandoned_sealed.jpg` → breath_trunks; `hydroponics_amara.jpg` → breath_garden). No new art requested.
- Phrase mint: **"the first piece of another world"** — Amara — spent in `breath_garden`.
- Promise touchpoints cold for 0.27 (Amara vent, Tomas living-before-vault, Sela scapegoat soil in custody_onset). Zero reads/writes of `state.promises`.
- Derived scars (no extra keys): broke public word, Sela second-key, Mira cold scar, Lena black-sleep scar — all render-time from the four flags + isAlive.

**GROK LOCKS (all accepted):**
1. `flags.breath_word` = given|refused
2. `flags.breath_answer` = racks|trunks|garden|blacksleep
3. `flags.custody_roll` = true
4. `flags.custody_answer` = possession|thawed|severed|shared
5. 0.26 death-free (Tomas trunk vector struck)
6. Single five-line onEnter splice on faction_split approved (vs eight next rewires)
7. Resource table + two ungated floors approved
8. Phrase mint approved
9. Elias sealed-orders remains out of 0.26 permanently

**Build questions — answers:**
1. SPINE assert (data-driven chain through the new router) → **separate 0.26.1** after content lands. Keep this ticket one-concern.
2. `concreteRunFacts()` read of the two outcome flags + fact-budget → **separate one-concern ticket**. Do not fold.
3. Defensive id-keyed image fallbacks for breath_garden / custody_roll → **skip** (unreachable by construction via alive:). Add only in a later honesty pass if needed.
4. Load order: `scenes-exclusive.js` between `scenes-crises.js` and `scenes-late.js` — **confirm**.
5. New flags written only in onEnter → add `breath_word`, `breath_answer`, `custody_roll`, `custody_answer` to `engineFlags` allowlist in validate.js (existing pattern for onEnter-only keys).

**Assumptions accepted:**
- `ideologyShape()` (vault-dominant) is the correct router read.
- Mira injury = cold-radiation (unpressurized skin, both poles) per prior locked design language.
- Split declaration carries no resource cost.

**scenes-late.js line count note:** already 1394; exclusive goes in its own file so the cap pressure stays on the late file only. Split plan for late remains open for a later ticket if needed.

**Next action after lock:** one-concern Build ticket for 0.26 (pasteable block below or in chat).

---

## 2026-08-15 0.25.3 SHIPPED — Causality lies (dead speech / unread state)

One concern only. Prose-and-guard. No new flags, no new state keys, no balance changes.

1. `arc_living_1`: `alive: "amara"` on choice 1 only; choices 2–3 stay ungated.
2. `arc_living_2`: `alive: "sela"` on all three existing choices; fourth ungated zero-effect exit "Leave the marks where they are." Dead-Sela fallback text kept.
3. `faction_split` five guards: conflict:backed (Elias clause), elias_power high (live/dead), elias_power limited (detached + alive), past owned (live/dead), past deflected/denied (live/dead).
4. `reckon_memory` vent branch: Tomas sentence gated + procedural no-speaker fallback.
5. `highestAffinity()` / `favoritism()`: filter with `isAlive(k)` (unrecovered Tomas can no longer be favored living).
6. `history_elias.onEnter`: removed premature `past === "lena_only"` write; `vault_voice.onEnter` now performs it (guaranteed destination).

Validate: 142 scenes, 0 errors. Zip: `sun-v0.25.3-net.zip`.

**Next action:** Continue 0.25 playtest; 0.25.4 resume/idempotency if needed, else 0.26 Exclusive crises when playtest closes.

---

## 2026-08-15 Fable 0.25 Lethal Opportunities — LOCKED

**Verdict:** APPROVED WITH REQUIRED EDITS A–H (applied). Structure, chain order, dying-map contract, dead-speech discipline, foreknowledge plants, cause strings, image reuse all hold. Everything not named in an edit locks exactly as drafted in the Fable revision of `01_PACKAGE_0.25_LETHALS.md`.

**Verified against v0.24.92** (0.24.93 = UI only; assumption holds). Engine `requires` / `kill()` / namespaces / existing flags / spine anchors / Lena+Tomas plants all confirmed. Covered_body.jpg approved for Lena end. faction_split.jpg Critical violation confirmed by pixel.

### Required Edits (Build must apply verbatim)
- **A (P0):** Strip retro-added full resource gates from the three shipped retrofit scenes (tomas_break, coolant_trade, seal_or_food). Keep only the original/shipped requires so each always has an ungated exit. New lethal deciders keep full gates on rescues + one ungated lethal option.
- **B (P0):** Restore “three weeks” in Mira coolant plant text.
- **C:** Restore full shipped dead-fallback sentence in tomas_break.
- **D:** Mira afterglow plant second sentence → “What happened in this bay is data. It is not a veto.” Drop the cohesion gate on afterglow choice 2.
- **E:** Elias “Remote has lied twice.” → “Remote is lying.”
- **F:** seal_or_food neutral → “Every claim on the table is correct.”
- **G:** Tomas stranded-name selection order fixed to `["sela", "jiro", "vess", "amara", "mira", "elias", "lena"]` (deterministic .find, no RNG).
- **H (art honesty):** sceneImages.faction_split → corridor_variant.jpg (permanent). Extend grouped-plate resolver to substitute on ANY of the eight crew not alive. Queue regen of faction_split in ART_REQUESTS. Cosmetic: lena_end IMAGE header = [REUSE covered_body].

### GROK LOCKS (all accepted)
1. **state.dying** scalar → map migration exactly as drafted (freshState {}, reset {}, snapshot/apply clone+normalize; legacy "lena" → {lena: "kept working until the clock ran out"}). Sites verified.
2. Romance-created lethal volunteer = second-pass Mira only (via existing romance.mira && pursuit.mira + afterglow plant). Locked.
3. Balance numbers as drafted + Edit A (retro gates removed, costs unchanged). Full gates on rescues; one all-survival route preserved.
4. No new flags, marks, or RUN_FACTs in 0.25. All keys already exist in 0.24.92.
5. In-flight saves: VERSION < 0.25 skip only Elias + Mira lethals (new plants); Lena + Tomas fire (plants already shipped). Save-version check at load; no new flag.
6. New chain (13 scenes) lands in scenes-late.js (was ~910 projected; **actual post-0.25 = 1378 lines** — exceeds ~1100 cap; split plan locked for 0.26). Modified stay in place. No new file / load-order change in 0.25.
7. faction_split.jpg retired from live wiring + grouped-plate any-death extension. Regen queued.
8. **Sela/Jiro sibling link STRICKEN.** state.js bios claimed “Sela Okada, Jiro’s younger sister” + shared surname. **Correction (2026-08-15):** the claim “exists in no scene” was false — crisis + cut_out carried live sibling language. Fixed in 0.25.1 (bio + scene cleanup). Sela remains Sela; Jiro remains Jiro Okada. No backfill required. Canonical: no sibling link.

### Confirmed as drafted (no change)
- Chain order, every rewire-table row, redirects, forward-only exits.
- All four cause strings; kill() only in onEnter; no post-kill speech/action.
- Lena / Tomas / Elias / Mira each open their lethal on their own reflex question.
- Full-survival arithmetic: pure-Future worst-case Embryos −18 / Supplies −17 behind full gates.
- Downstream honesty pass required (unguarded Tomas/Elias lines, scalar dying reads).

### Placement & Build Questions (answered)
- Chain once-only under reachability: yes — assert no path re-enters act3_lethal_* after faction_split (bond loops return to act3_spine_next; pregnancy/tomas_break converge on chain).
- When extending resolver, enumerate every grouped id against sceneImages at implementation time (do not trust any prior list).

### Assumptions accepted
- 0.24.93 touched UI only → v0.24.92 authoritative for state/scenes/engine.
- faction_split.jpg in the current tree is the production plate.

**2026-08-15 0.25 SHIPPED — Lethal Opportunities:**  
One concern only. Locked package + Edits A–H.  
- `state.dying` map migration (freshState/reset/snapshot/apply + aftermath write).  
- New chain in scenes-late.js: Lena → Tomas → Elias → Mira → faction_split. kill() only in onEnter.  
- Edits A–G applied (ungated retrofit exits, three-weeks, dead-fallback, Mira plant, Remote is lying, neutral line, stranded order).  
- Art honesty H: faction_split → corridor_variant; any-of-eight grouped-plate guard.  
- Bio strike: Sela no sibling/Okada.  
- In-flight: VERSION < 0.25 skips Elias+Mira only.  
- Validate: 142 scenes, 0 errors. Zip: sunsplitter-v0.25-netlify.zip.  

**2026-08-15 0.25.1 SHIPPED — Causality Hotfix (complete):**  
One concern only. Engine stops lying.  
- `intro_lena.onEnter`: kill Rourke if still alive (`"died while command was taken"`) — 0% immortal across 700 sim runs (was 37.6%).  
- `renderCrewPanel`: tomas/jiro/vess filter → `isRecovered(k)` so recovered-then-killed still show as dead chips.  
- Sibling strike live prose: crisis `trapped.push("Sela")`; cut_out `"Jiro will not release Sela."`  
- sceneImages art honesty (zero gen): act2_tether_manifest → medbay_dim; romance_mira_1 → shower_mira; pregnancy_check → medbay_dim; quiet_sela → sela_ritual; act3_reckoning_heading → bridge_briefing_charts. scenes-crises scene-level image for manifest also updated.  
- **Verification fix:** scenes-mid-b.js `romance_mira_1` scene-level image → shower_mira.jpg (map was overridden by scene.image; Critical Commander-face plate retired from this beat).  
- VERSION = "0.25.1". No new scenes/flags. Expected validate: 142 scenes, 0 errors. Zip: sunsplitter-v0.25.1-netlify.zip.  

**Next action:** Continue 0.25 playtest; then 0.25.2 (window routing / pursuit tags / interrupt resume) or 0.26 Exclusive crises when playtest closes.

---

**2026-08-15 0.24.93 SHIPPED — Scroll on image forwards to text (hygiene / UI only):**  
One concern only. Wheel + touch-drag on `#scene-image-wrap` scrolls `#main`. Drag slop preserves double-tap toggle.  
- `VERSION = "0.24.93"`. Zip: sunsplitter-v0.24.93-netlify.zip.  

**2026-08-15 0.24.92 SHIPPED — Image toggle double-fire fix (hygiene / UI only):**  
One concern only. 400ms toggle cooldown + touchMode so iOS touchend+dblclick cannot toggle twice. Pin from 0.24.91 kept.  
- `VERSION = "0.24.92"`. Zip: sunsplitter-v0.24.92-netlify.zip.  

**2026-08-15 0.24.91 SHIPPED — Image expand pin fix (hygiene / UI only):**  
One concern only. Manual expand is pinned so scroll cannot immediately re-minimize (fixes glitch). Pin clears on toggle-minimize or new scene. Numbered 0.24.91 (not 0.24.10) to keep 0.25 free for Lethal opportunities.  
- `VERSION = "0.24.91"`. Zip: sunsplitter-v0.24.91-netlify.zip.  

**2026-08-15 0.24.10 SHIPPED — Image expand pin fix (hygiene / UI only):**  
One concern only. Manual expand is pinned so scroll cannot immediately re-minimize (fixes glitch). Pin clears on toggle-minimize or new scene.  
- `VERSION = "0.24.10"`. Zip: sunsplitter-v0.24.10-netlify.zip.  

**2026-08-15 0.24.9 SHIPPED — Double-click toggles image size (hygiene / UI only):**  
One concern only. Double-click/double-tap toggles maximized ↔ minimized. Scene entry still maximized; scroll still minimizes.  
- `VERSION = "0.24.9"`. Zip: sunsplitter-v0.24.9-netlify.zip.  

**2026-08-15 0.24.8 SHIPPED — Minimize sticks until double-click (hygiene / UI only):**  
One concern only. Scroll minimizes; stays minimized until double-click/double-tap on image. New scene still opens expanded.  
- `VERSION = "0.24.8"`. Zip: sunsplitter-v0.24.8-netlify.zip.  

**2026-08-15 0.24.7 SHIPPED — Compact minimize size fix (hygiene / UI only):**  
One concern only. Minimized target restored to 0.24.5 compact sizes (`26vh/200px`, intimate `30vh/230px`; mobile `24/180`, `28/210`). Expanded full-width from 0.24.6 unchanged.  
- `VERSION = "0.24.7"`. Zip: sunsplitter-v0.24.7-netlify.zip.  

**2026-08-15 0.24.6 SHIPPED — Full-width expand → minimize on scroll (hygiene / UI only):**  
One concern only. Refines 0.24.5 to match playtest intent. No scene / flag / prose / art changes.  
- Expanded (scene entry): full horizontal width, 3/4, high max-height (full-bleed read).  
- Minimized (scroll ~36px): prior portrait size with side margins (more text room).  
- Intimate proportional. Same hysteresis + showScene reset. Ratio stays 3/4.  
- `VERSION = "0.24.6"`. Zip: sunsplitter-v0.24.6-netlify.zip.  

**2026-08-15 0.24.5 SHIPPED — Scene image collapse-on-scroll (hygiene / UI only):**  
One concern only. No scene / flag / prose / art changes.  
- Full size on scene entry; `.minimized` after `#main` scroll past ~36px; expand near top (~10px hysteresis).  
- `showScene` resets scrollTop + clears minimized. CSS transition on max-height. Ratio stays 3/4.  
- `VERSION = "0.24.5"`. Zip: sunsplitter-v0.24.5-netlify.zip.  

**2026-08-15 0.24.4 SHIPPED — Title-screen version display fix (hygiene only):**  
One concern only. No scene / flag / prose changes.  
- Title-screen subtitle was hard-coded `v0.23 — Recoveries` in `index.html`. Replaced with `#game-subtitle`; `showScreen("title")` now sets text from live `VERSION` constant.  
- `VERSION = "0.24.4"`. Zip: sunsplitter-v0.24.4-netlify.zip.  

**2026-08-15 0.24.3 SHIPPED — Private-hours loop kill (hygiene only):**  
One concern only. No new scenes, no new flags, no prose changes beyond the single next target.  
- In `intimacy_window` (scenes-mid-b.js): choice text `"Keep the private hours for work. Move on."` — changed `next` from `"pursuit_window"` to `"debt_notice"`. Effects unchanged: `{ integrity: 1 }`.  
- Does not touch pursuit_window, the "Use the last private window on someone new." choice, debt_notice, or any other private-time / romance / bond choices.  
- Validate: 126 scenes, 0 errors. Zip: sunsplitter-v0.24.3-netlify.zip.  

**2026-08-15 0.24.2 SHIPPED — Art honesty + Vess seam (lint remediation):**  
One concern only. No new scenes/systems/content.  
- C1: `resolveSceneImage` evaluates id-keyed death/unrecovered guards BEFORE `scene.image` (fixes act3_reckoning_pattern, act2_tether_truth, act3_reckoning_briefing).  
- C2: `competence_watch.jpg` zero live references (map + scene declaration retired; file on disk).  
- P1: vess_transmission romance flag after alive check; pregnancy gate on `flags.vess_intimate`; vess_signal isAlive(mira) branch; `vess_course_lost` mint (Jiro write untouched); validate engineFlags.  
- P2: vess_cost Mira-phrase reword; act2_spine_next forward-promise cut; vess_offer join + singular/plural cross-route; E-4471→E-6103, E-4472→E-6104.  
- Validate: 126 scenes, 0 errors. Zip: sunsplitter-v0.24.2-netlify.zip.  

**2026-08-15 Fable semantic lint of v0.24.1 — LOCKS applied (all shipped in 0.24.2):**  
1. 0.24.2 ticket executed.  
2. Phrase ownership: “The other six…” is Mira’s.  
3. Flag: distinct `state.flags.vess_course_lost`.  
4. Embryo constant “fourteen thousand and six”; E-6103 / E-6104.  
5. Cascade Allusive remains deferred to 0.29.  

**Immediate next:** 0.25 Lethal opportunities — PACKAGE LOCKED; ready for Build ticket.

**2026-08-15 Fable 0.27 Spoken Promises package — PARTIAL LOCK (state + Amara):**  
Received package truncated mid Amara response beat. Locked from received portion + 01_LOCKED_DESIGN:  
- **Registry LOCKED:** `state.promises.amara|tomas|elias|lena|sela|mira` values: absent | "made" | "declined" | "kept" | "broken". (Supersedes any "never".)  
- **Death dissolve LOCKED:** tests / re-surface / scar lines gate on `isAlive(who)`. Resolved persist as run facts; unresolved stop.  
- **Write plumbing LOCKED:** no engine change. SPEAK choice sets `flags.prom_<who>`; response-beat `onEnter` derives registry value.  
- **New FLAGS LOCKED:** `prom_amara, prom_tomas, prom_elias, prom_lena, prom_sela, prom_mira`; `prom_deck4_edited, prom_deck4_buried`; `prom_line_other` (string); `prom_line_held`.  
- **Lena killCause LOCKED:** `"lost the shared medical line to Lena"`.  
- **RUN_FACTS strings LOCKED** (as listed in package; wire at test time).  
- **What Remains weight proposal** deferred to 0.29 lock.  
- **Amara make-points LOCKED in principle:** prom_make_amara (standard, REUSE quiet_amara), prom_make_amara_ag (afterglow, REUSE afterglow_amara, high-trust dual-host), shared prom_r_amara. Exact locked sentence; honest decline; BUILD-BINDS for host splice + romance-active predicate.  
- **Sela test disposition LOCKED:** pure-data insertion (prom_price_*) authored for placement into 0.26 Custody; if 0.26 already contains the beat, cut insertion and retain only choice-4 gate.  
- **Contract-class rule LOCKED:** each of the six sentences appears exactly twice (make-point + owner quote-back). Re-surfacing alludes only. Add to MINTED_PHRASES when full package lands.  
- **Open:** full text of remaining make-points (Tomas/Elias/Lena/Sela/Mira + responses), four test moments (Elias Deck Four, Lena shared line, Sela scapegoat, Mira Earth-era), light re-surfacing, any residual BUILD-BINDS / open questions. Full package required before 0.27 Build ticket. 0.25 → 0.26 still precede.

**2026-08-15 Fable 0.24.1 verification corrections applied:**  
- Open/Next cleaned (0.23 packages, 0.23 Build, 0.21.1 polish all closed).  
- Cascade Allusive insertions formally deferred to 0.29 (were silently absent).  
- vess.jpg wiring decision (sceneImages → vess_boarding) **SUPERSEDED 2026-08-15** — plate contradicts locked sheet; see Open/Next #8.  
- Cross-route mirror for original four deferred to 0.29; Vess seed remains the only awareness.

**2026-08-15 0.24.1 SHIPPED — Romance Consistency & Crisis-Request Touch-ups:**  
One concern only. Pure-data / light prose surgery on existing pursuit_* scenes in scenes-mid-b.js.  
- **Lena:** last uncontaminated regenerative treatment actually spent (or refused). Flag `lena_regen`; supplies+cohesion cost; remember fact.  
- **Mira:** ship-retained intimate + command/vault memory full disclosure. Flag `mira_memory_public`; durable scar via remember + concreteRunFacts.  
- **Amara:** contaminated grow vent delay + public claim. Flag `amara_vent_delayed`; supplies/integrity/cohesion cost visible to crew.  
- **Sela:** retargeted to dedicated `flags.sela_vault_vow` ("accepted"|"refused"). No marks collision. Logged vow (or private/refused). Removed sun_doctrine write from pursuit path (yellow-marks doctrine stays with late ship_memory).  
- All four + Vess continue to use shared `romanceOpen` / `hasMark`. No new meters. Rear linger lines updated for currency consistency.  
- concreteRunFacts cites the four durable scars. Validate engineFlags updated.  
- Validate: 126 scenes, 0 errors. Zip: sunsplitter-v0.24.1-netlify.zip.  
- Scene IDs touched: pursuit_mira, pursuit_mira_sex, pursuit_amara, pursuit_amara_sex, pursuit_sela, pursuit_sela_sex, pursuit_lena, pursuit_lena_sex (+ mira_rear / amara_rear currency lines). No new scenes.

**2026-08-15 0.24 SHIPPED — Vess Arrival + 5th Romance:**  
One concern only. Pure-data scenes in scenes-crises.js.  
- Arrival sequence: vess_signal → vess_cost (busDowngraded + reaction_mass_spent + **vess_course_lost** after 0.24.2) → vess_boarding (recovered.vess=true, survivors+1). Guaranteed once act3_spine_next window opens (onEnter redirect).  
- Short asymmetric romance: vess_offer (informed/run-reading first offer cites vault stance + deaths + cross-route seed if any romance active) → vess_transmission (last long-range window currency) → vess_intimate (one explicit; power stays hers). Decline path uses hasMark("vess","declined").  
- Extended: ROMANCEABLE, crew.vess, isAlive (recovered gate), affinity/trust, crew panel, concreteRunFacts, ending citation, sceneImages to existing plates (transmission/debris/observation). No new art.  
- Validate: 126 scenes, 0 errors. Zip: sunsplitter-v0.24-netlify.zip.  
- New scene IDs: vess_signal, vess_cost, vess_boarding, vess_offer, vess_transmission, vess_intimate. New flags: busDowngraded, reaction_mass_spent, last_tx_spent, vess_intimate.  

**2026-08-15 Fable Romance Deep Dive (pre-0.24) — LOCKED decisions:**  
Source: full Fable audit received and reviewed. Architecture map, strengths, thin spots, and ranked suggestions accepted as analysis. Durable locks only below.

**Verified current state (no longer open questions):**
- Marks namespacing (P1.5) **shipped** in 0.21.2: multi-tag accumulation + `hasMark(who, tag)`. `romanceOpen(who)` correctly uses `!hasMark(who, "declined")`. No clobber. Clear for 0.24+.
- `declined` handling uses the marks multi-tag system. Vess uses the same (`hasMark("vess", "declined")`). No separate `declined.<char>` map required.
- Crisis-request touch-ups (full canonical currencies) + dedicated `flags.sela_vault_vow` **shipped in 0.24.1**.
- Pregnancy: `flags.pregnancy_risk` (true | false | "unknown") **is tracked**, writes costs, and is cited in endings/engine. Scene is functional and not an engine lie. Full character-specific living-pregnancy simulation with delayed medical events remains optional depth, not required for honesty.

**New locks from the deep dive:**
1. **Vess structural asymmetry (required for 0.24):** Vess route is **not** required to match the four-route skeleton (lingerie → crisis-request → sex → afterglow). She gets a shorter, differently shaped route: informed/run-reading first offer (text function of state), distinct currency (last long-range transmission window — forward-looking, not Mira’s archival lane), power stays hers, fewer beats, one explicit beat sufficient. Scaling by addition is the failure mode; deliberate asymmetry is preferred.
2. **Cross-route awareness:** “Commander can pursue all” **permits** concurrency; it does **not** require mutual unawareness. Awareness is allowed as witnessed fact only (never a jealousy meter or exclusivity system). Minimal seed required in 0.24: if any romance is active at Vess arrival, one conditional acknowledgment line (from active partner or from Vess reading traffic) — **shipped**. Mirror conditional lines for Lena/Mira/Amara/Sela (existing scenes only, no new keys) **deferred to 0.29** full cross-route physics. Awareness remains Vess-only until then. Asymmetry is intentional.
3. **Pregnancy resolution:** Keep current `flags.pregnancy_risk` as authoritative. No new keys now. 0.29 (or light polish) may add one delayed operational/medical texture line when true; What remains may cite it. Art remains temporary honest placeholder until identity-hidden plate is generated.
4. **Protect list confirmed by audit:** default-offer + explicit rejection; crisis-request middles as anti-silo; Sela’s route weight (vow touches Future/Living); honest death-closure of routes; optional explicit one-shots (0.22.1 grammar).

**Deferred (do not start before owning version):**
- Partner-on-losing-side scars in exclusive crises → 0.26.
- Romance-created lethal volunteer + afterglow foreknowledge plant → 0.25.
- Two promises made in afterglow → 0.27.
- Partner-specific Off-Shift debt texture → 0.28.
- Post-intimacy conditionals in *operational* scenes + death residue objects → 0.29.
- Full cross-route physics → 0.29.

**Immediate action (historical):** Proceed to 0.25 Lethal opportunities. (Cascade Allusive → 0.29; vess.jpg wire **SUPERSEDED** — do not wire until regen to locked dark knife-cut sheet; cross-route mirror stays 0.29.)

**2026-08-15 Fable Earth Cascade Background Expansion LOCKED:**  
Source: `artifacts/FABLE_CASCADE_BACKGROUND.md`.  
- **Canon spine (¶1–4 + Contested Layer Index)** locked as load-bearing background. Official story = choice of start time; both clocks accurate; no clean truth. Nine = Commander + 7 living core + Rourke. Damage/scarcity = incomplete launch + commissioning debt + strike trauma + tier-4 living stores never loaded.  
- **Crew boarding insights** locked as durable voice material.  
- **Keys (flags):** `flags.manifest` = "read"|"declined"; `flags.changeorders` = "logged"|"buried".  
- **RUN_FACTS + constants** locked as previously listed.  
- **Minted phrases:** Tomas "People were tier four." **RESERVED** (late Living reckon/ending only); Sela "I am the hand-off." **SPENT**; Elias "Standing question." **SPENT**.

**2026-08-15 Fable Cascade Allusive Crew Events LOCKED:**  
Source: `artifacts/FABLE_CASCADE_ALLUSIVE.md`.  
- Standalone Proposals A/B **retired**; choice cores folded into light insertions.  
- **Six pure-data beats** (insertions / adjacent to existing touchpoints):  
  1. berths_manifest (Amara → empty_berths) — writes flags.manifest  
  2. records_changeorders (Mira → cascade_records / arc_future_3) — writes flags.changeorders  
  3. hold_bolts (Tomas → vault quiet, post-recovery preferred) — pure texture  
  4. observation_nightshift (Jiro → observation) — pure texture; projections synthesis ban  
  5. filters_stencil (Sela → adjacent to ritual, never inside locked prose) — spends hand-off phrase  
  6. aftermath_seal (Elias → post-crisis private) — spends Standing question; **no new key** (elias_question left cold)  
- Lena “Disposition” deferred to late private ticket (correct).  
- Amara-dead Variant D cut (no clean effects touchpoint).  
- **Formally deferred to 0.29** (light polish / density pass). Not present in 0.24.1 source (no Tube 3 / 214 berths / 4417-4491 / hand-off / Standing question text). Does not block 0.25. Ticket as pure-data insertions when 0.29 opens; no silent drop.  
- Downstream conditioned lines optional; beats stand alone.  


**2026-08-15 0.23.5 SHIPPED — Art Honesty (death-aware unrecovered + Critical rewires):**  
One concern only. No new scenes/prose/systems.  
- **resolveSceneImage** extended: `isAlive` already treats `!recovered.tomas/jiro` as not alive; new branches force honest fallbacks for competence_watch / act3_reckoning_pattern (→ observation_bridge), arc_future_3 / act3_reckoning_briefing (→ power_crisis / observation_bridge), arc_living_3 (→ corridor), crisis / priority_repairs / aftermath (Jiro/Amara/Sela), observation_crew family, faction/debt/reckon group plates.  
- **sceneImages permanent rewires (honest placeholders):** status, lead_together, arc_fork, act2_tether_truth, reckon_truth → observation.jpg; debt_notice → corridor_variant.jpg; pregnancy_check → observation.jpg (temp); act2_tether_dock + act2_tether_hand_* → debris_field.jpg; reckon_public / reckon_summary → observation.jpg; reckon_memory → aftermath.jpg.  
- Recovery-dependent plates (competence_watch, cascade_records, arc_living_conflict, act3_reckoning_*) kept in map; runtime guard swaps while unrecovered so recovered runs regain original art.  
Validate: 120 scenes, 0 errors. Zip: sunsplitter-v0.23.5-netlify.zip.  
Art batch still required for pregnancy_check (identity-hidden) + tether plates.  

**2026-08-15 Fable Art ↔ Event Match Review LOCKED (full pass against 0.23.2 wiring):**  
Two systemic findings accepted:  
1. Cast drip (unrecovered Tomas/Jiro) broke the art layer — plates still show their faces on the mandatory spine because death-aware fallbacks only test `isAlive` / dead, not `!recovered`.  
2. Four contradictory ship names remain wired (EURYALE, TANAIS, EIDOLON, AURORA-7). Ship name locked *Sunsplitter*.  

Critical lies live in shipped build (pregnancy_check, competence_watch, cascade_records, observation_crew, crisis/priority_repairs, reckon_public, arc_living_conflict).  
Zero-cost path accepted: extend `resolveSceneImage` so `!isRecovered('tomas'|'jiro')` is treated like dead for image selection + six rewires of sceneImages keys to existing honest plates. Clears every Critical except pregnancy_check without new art.  
Art batch priorities (for Art chat after 0.23.5 data pass): pregnancy_check regen (identity-hidden), tether_dock_catch, tether_ride silhouette, reckon_public crowd-cap, vault_voice distinct Hero, bridge_briefing_charts, medbay_dim, tomas_break face-match.  
Protect list confirmed: vault.jpg, covered_body, ending_landfall, lead_prompt, corridor_variant, final_choice, aftermath, empty_berths, observation, corridor, hydroponics, abandoned_sealed, Batch A portraits, full explicit 0.22.1 set + wiring.  
Full review text retained in conversation; next ticket is 0.23.5.  

**2026-08-15 0.23.4 SHIPPED — Text Polish (Fable audit — Character Depth & Memorability):**  
Pure prose surgery inside existing pure-data scenes in scenes-crises.js only. No new keys, structure, effects, onEnter, images, or spine.  
- Package A: scale paragraph + Mira-dead fallback; Elias private Mira collar beat; Mira range-call/literal rating; dock rider-comm payoffs + self-ride; Hokkaidō rice paragraph; truth glosses cut; lie “cheap/ever” cut.  
- Package B: Elias “Drift doesn’t drill”; Tomas “eat the seed corn”; choice text neutralized; Amara “who’s owed”; burn-log ends at “Logged,”; briefing day-181 subtraction silence.  
- Package C: soil-smell vs odorless vault opening; Elias ends on counting line.  
Validate: 120 scenes, 0 errors. Zip: sunsplitter-v0.23.4-netlify.zip.  

**2026-08-15 0.23.3 SHIPPED — Private-time density / bond reachability (light):**  
Reachability only; no new systems, no prose/gate/debt/romanceOpen changes.  
- pursuit_window close → `debt_notice` (was faction_split) so recovery spine is not soft-skipped after private hours.  
- act3_spine_next: optional one-shot bond choices for Elias / recovered Tomas / recovered Jiro if not already bonded/skipped (reuses existing bond_* scenes + tags).  
- bond_elias / bond_tomas / bond_jiro: exit next context-aware (lead_prompt early; act3_spine_next after vault_sacrifice).  
Validate: 120 scenes, 0 errors. Zip: sunsplitter-v0.23.3-netlify.zip.  

**2026-08-15 0.23.2 SHIPPED — Romance / bond offer labels (discoverability cues):**  
Optional choice field `tag: "private"` | `"bond"` on first-offer choices only. Engine renders muted `[private]` / `[bond]` after choice text (formatTagHtml, same quiet mono pattern as effects). No prose, gates, nexts, debt, or romanceOpen changes.  
- intimacy_window: Find Mira / Amara / Sela / Lena + Amara+Tomas walk-in → tag private  
- crew_walk: Share quiet hour Elias / game Tomas / competence hang Jiro → tag bond  
- CSS: .choice-tag (dim, mono, small)  
Validate: 120 scenes, 0 errors. Zip: sunsplitter-v0.23.2-netlify.zip.  

**2026-08-15 0.23.1 SHIPPED — Pros/cons on recovery + vault branch choices:**  
Added honest choice-level `effects` (and light lean) only where fiction already costs something. Existing formatEffectsHtml. No prose/ID/onEnter/scar changes.  
- act2_tether_sighting: Vent → supplies -6 + lean living 1; Hard intercept → integrity -2 + lean future 1.  
- act2_tether_manifest: Truth → cohesion -3; Lie → cohesion +1.  
- act3_reckoning_heading: Burn now → supplies -2, integrity -1 + lean future 1; Forty min Mira → supplies -3, cohesion +1; Full cycle → supplies -4, cohesion -1.  
- Hand / continue / vault face choices: no resource effects.  
Validate: 120 scenes, 0 errors. Zip: sunsplitter-v0.23.1-netlify.zip.  

**2026-08-15 0.23 SHIPPED — Tomas/Jiro recoveries + Vault needs a face:**  
Implemented locked Fable packages into `scenes-crises.js` (pure data only).  
- Package A “The Green Tether”: sighting → vent/rush → hand (Elias/Mira/Sela + Commander fallback) → dock → manifest truth/lie. Sets `state.recovered.tomas = true`. Scars: water_vented, tether_rushed, tether_hand_*, trays_dead, manifest_exposed, manifest_lie, tomas_scapegoated. RUN_FACTS via `remember()`.  
- Package B “Dead Reckoning”: pattern (Mira or Elias/audit fallback) → heading → burn_stale / burn_verified / delay → cut → briefing. Sets `state.recovered.jiro = true`. Scars: burn_unverified, course_option_lost, margin_committed, margin_spent_extra, position_certain, clock_known. burn_unverified stays silent this package.  
- Package C “Vault needs a face”: quiet beat after briefing (Sela → Elias → Commander-alone). Sets vault_face / vault_face_read.  
- Spine: debt_notice → act2_tether_sighting (if !recovered.tomas) → … → act2_spine_next → act3_reckoning_pattern → … → act3_vault_face → act3_spine_next → pregnancy_check (if romance) / tomas_break / faction_split. tomas_break reachable only after recovered.tomas.  
- Resource effects engine-side only (no numbers in prose). Images reuse closest existing plates. Validate: 120 scenes, 0 errors. Zip: sunsplitter-v0.23-netlify.zip.  

**2026-08-15 Explicit Art Utilization SHIPPED (0.22.1):**  
Six remaining locked explicit plates wired into reachable pure-data one-shot aftermath scenes.  
Plates consumed: shower_lena, shower_mira, rear_lena, rear_mira, rear_amara, rear_sela.  
Optional choice at end of first-sex (lena/mira → shower; amara/sela → rear) and all four pursuit_*_sex → matching rear. Done flags + death/romance gates. Declining leaves original spine identical. No new systems. Validate: 99 scenes, 0 errors. Zip: sunsplitter-v0.22.1-netlify.zip.  

**Canonical recovery keys (0.23):**  
- `state.recovered.tomas` / `state.recovered.jiro` (existing 0.22 API; isAlive gates on recovered).  
- Scar flags under `state.flags`: water_vented, tether_rushed, tether_hand_elias/_mira/_sela, trays_dead, manifest_exposed, manifest_lie, tomas_scapegoated, burn_unverified, course_option_lost (Jiro), vess_course_lost (Vess), margin_committed, margin_spent_extra, position_certain, clock_known, vault_face, vault_face_read.  
- RUN_FACT strings bound via `remember()`.  
- EVA hand pool: Elias / Mira / Sela (isAlive); Commander self-ride only if all three dead.  

---

## HANDOFF SNAPSHOT (fresh Build / Fable chat — start here)

### What is true right now
- Playable browser game; authoritative source is the latest zip + this file.
- **VERSION = 0.25.4** in `js/state.js`
- **142 scenes**, validate clean (0 errors, ~20 pre-existing warnings)
- Latest deploy zip: `artifacts/sun-v0.25.4-net.zip`
- **Next ticket:** **0.26** Ideology Router + Exclusive Crises (PACKAGE LOCKED — see lock block near top of this file)
- **0.25.4** onEnter idempotency (resume-safe guards on romance/pursuit/vess_boarding/rourke_try + remember de-dupe)
- **0.25.3** Causality lies pass (dead-speech guards, highestAffinity/favoritism isAlive filter, vault_voice owns past write)
- **0.25.1** Causality Hotfix (Rourke kill on take-command, crew panel isRecovered, sibling strike, art honesty rewires)
- **0.25** Lethal Opportunities (Lena clock / Tomas cost / Elias order / Mira board → faction_split; state.dying map; full-survival preserved)
- **0.24.x** Vess arrival + 5th romance + romance consistency + art honesty + UI image expand/pin/scroll suite
- **0.23.x** Tomas Green Tether + Jiro Dead Reckoning + Vault face + art honesty for unrecovered + text polish + private-time density
- **0.22.1** Explicit art utilization (shower/rear one-shots)
- Load order (locked): state → early → mid-a → mid-b → crises → **exclusive (new in 0.26)** → late → engine → validate
- `state.crisisPath` already exists (top-level, null | "breath" | "custody") ready for 0.26
- `ideologyShape()` already exists and is vault-sacrifice dominant
- Adult content permanent; romance default-offer locked; core cast 9 + Vess; no combat/inventory/meters
- SCENE_SKELETON.md updated 2026-08-15 to current form (next/alive/requires; no id:/goto/if)

### Load order (locked)
```
js/state.js
js/scenes-early.js
js/scenes-mid-a.js
js/scenes-mid-b.js
js/scenes-crises.js      // recoveries + vault face + Vess (0.23–0.24)
js/scenes-exclusive.js   // 0.26 Ideology router + exclusive crises (NEW)
js/scenes-late.js
js/engine.js
js/validate.js
```
(index.html must add the exclusive script tag between crises and late)

### File layout
| Path | Role |
|------|------|
| `sunsplitter/index.html` | Shell + script tags |
| `sunsplitter/css/style.css` | Grimdark mobile UI |
| `sunsplitter/js/state.js` | VERSION, crew, sceneImages, helpers (debt, favoritism, concrete facts, ideologyShape) |
| `sunsplitter/js/scenes-early.js` | Wake → crew_walk, bonds, lead |
| `sunsplitter/js/scenes-mid-a.js` | time_pass → vault_sacrifice |
| `sunsplitter/js/scenes-mid-b.js` | ship_interrupt → intimacy / pursuit |
| `sunsplitter/js/scenes-crises.js` | Recoveries + vault face + Vess arrival/romance |
| `sunsplitter/js/scenes-exclusive.js` | 0.26 router + Breath / Custody (NEW) |
| `sunsplitter/js/scenes-late.js` | lethals → faction_split → endings |
| `sunsplitter/js/engine.js` | showScene, choices, endings |
| `sunsplitter/js/validate.js` | shape, graph, flags, romance gates |
| `sunsplitter/images/` | All art |

### Shipped through 0.18 (do not re-implement)
- **0.15** Relationship debt, scarce-then-default romance, pursuit, concrete endings, gray trades
- **0.15.1** Romance **default offer**: all four if alive && !romanced && marks !== declined; no affinity/trust hide; Sela spoken flavor only
- **0.16** `ship_memory` (Deck 4), `patch_fails`, `sun_payoff`, `boarding_stories`, `ship_interrupt`
- **0.16.1** Non-sexual `bond_elias` / `bond_tomas` / `bond_jiro` from crew_walk; soft faction payoff
- **0.17** Mid split (a/b), expanded validate, stale sceneImages pruned, strict shape audit
- **Post-0.17** Bond art wired: `bond_*.jpg` on the three bond scenes
- **0.17.1** Systemic Truth Pass: dead speakers gated; effects always show attempted deltas; key costs require full amount; zero-stat pressure; reckon truth
- **0.18** Tone-contract screen (adult + deaths stick + early choices return; ack once via localStorage); title premise (Commander, ark, cascade, nine of thousands); wake/vault copy clarifies delayed consequences + Future/Living axis. No new story scenes.
- **0.19** Save/resume harden: `sunsplitter_save_v3` explicit snapshot (flags/deaths/marks/romance/ideology/ship_memory/scene); autosave after choice + iOS pagehide/visibility/freeze; title **Continue** + slot meta; New run confirms overwrite; write-verify; legacy v2 migrate; tone key untouched
- **0.20** UI strength (mobile): `#app` 100dvh + `#main` min-height 0 scroll; content-sized `#game-screen`; art aspect-ratio + cover; Surv/Hull/Coh/Sup/Emb labels ≥0.65rem; crew chips tappable with role/dead/cause; gated choices disabled + reason; touch/select hygiene

### Locked design (permanent)
- Adult/explicit romance permanent; Commander × Lena/Mira/Amara/Sela
- Romance default offer (not perfect-play gated)
- Batch A portraits only; rectangular interiors only
- Sela adult 20; yellow-sun ritual; no children on ship
- Seeds removed; resources: Survivors / Integrity / Cohesion / Supplies / Embryos
- Code discipline: pure-data scenes (`text|choices|onEnter|image` only), thin engine, one-concern tickets, validate after scene changes
- Three-chat model: Narrative / Build / Art; `pm` = project memory
- Art: lock = save to sunsplitter_images/ + sunsplitter/images/; Imagine cards before lock

### Stranger-ready track (next) — expanded numbering locked 2026-08-14
| Ver | Focus |
|-----|--------|
| **0.18** | Onboarding / first-run clarity — DONE |
| **0.19** | Save / resume harden — DONE |
| **0.20–0.20.2** | UI strength + polish + truth/display — DONE |
| **0.21** | Discoverability — DONE |
| **0.21.1** | Second-pass pursuit (all four) — DONE |
| **0.21.2** | Causality & Hygiene (P0 + lean-ups) — **DONE** |
| **0.21.3** | Pin Art / Independent Scroll — **DONE** |
| **0.21.4** | Scene Image Fit (portrait 3/4 aspect for all locked plates) — **DONE** |
| **0.21.5** | Scene Image Width Fix (full-width under 3/4) — **DONE** |
| **0.22** | Groundwork + early-act retrofit (Rourke dead, Tomas/Jiro missing, relocate tomas_break; FLAGS/RUN_FACTS) |
| **0.23** | Tomas recovery (“The Green Tether”) + Jiro recovery (“Dead Reckoning”) + **Vault needs a face** (required quiet Future beat) + start scheduled warmth |
| **0.24** | Vess arrival + 5th romance + death-aware art fallbacks |
| **0.25** | Lethal opportunities (Lena / Tomas / Elias / Mira) — all avoidable; **anticipated-risk lines** required |
| **0.26** | Ideology router + exclusive crises (“The Breath They Cost” + “Custody of Tomorrow”) + survivor-dependent actions; biased counsel + competence seeding |
| **0.27** | Six spoken promises (make-points + keep/break) + **promise re-surfacing** (diegetic mid-run allusions) |
| **0.28** | Crew pairs + “The Last Off-Shift” junction (sensory opportunity-cost line required) + remaining scheduled warmth |
| **0.29** | “What remains” + light polish + post-intimacy conditional lines pass |
| **0.30** | Packaging — image weight, load order, itch/Netlify zip, version string, optional home-screen meta |
| **0.31** | External review #2 — fresh strangers; fix only structural lies / UI trust |
| **1.0** | RC — authored arc complete; known bugs listed; adult-tagged; start-to-end on phone without dev habits |

**Locked sensual intent:** Four second-pass routes approved (0.21.1). **Fifth romance route approved** with permanent 10th (0.22+).

**0.21.1 Crisis-request middles (canonical design — ChatGPT package locked 2026-08-14):**
- **Lena** — Asks to reserve the last uncontaminated regenerative treatment for herself (buys months, cannot cure). Conflicts as triage privilege after intimacy. Accept: she lives longer; missing dose hurts another; public accusation of private love over survival. Refuse: she accepts medical logic but withdraws the unguarded self. Sci-fi beat: failing sterilization hood, shared body heat, treatment sealed between them.
- **Mira** — Ship retained fragments of their first intimacy + private command/vault talk. Asks for immediate full disclosure to the crew. Conflicts as order vs transparency / panic risk. Accept: truth public; Commander loses closed-door vault judgments; Mira trusts more. Refuse: she keeps a copy beyond control; stops sharing uncertainties privately. Sci-fi beat: single oxygen feed in pressure cradle; ship asks whether to retain the memory.
- **Amara** — Contaminated grow compartment scheduled to vent. Asks to delay one watch to save viable roots/cultures and insists the Commander publicly claim the decision. Conflicts as filtration risk + visible favoritism. Accept: some living stock saved; clean-air reserve lost elsewhere; cost not romanticized. Refuse: compartment vented with plants inside; she refuses to remain the private refuge for absolution. Sci-fi beat: humid grow deck, spores on skin, shared decontamination stream, purge alarm.
- **Sela** — Irrevocable promise: neither may use command authority to secure the other a vault place; survival value alone. Conflicts as surrender of discretion + public exposure of intimacy. Accept: vow enters ship memory and is witnessed; no private rescue later. Refuse: she stays but stops sharing the yellow-sun ritual after deaths. Sci-fi beat: failing yellow-sun lamp, ship-memory control between them, vault-triage alert arrives bearing her eligibility.

**Memorability levers (approved):** sequence divergence, delayed physical memory, concrete debt refusals, scarce-but-real private hours, accurate run-citing endings, light environmental shocks, survivor-dependent crisis actions, exclusive route crises, promise obligations as scars, state-driven substitution, light crew-to-crew relationships.

**Cast unlock (0.22) LOCKED shape:**
1. Early: Rourke dead; Tomas missing; Jiro missing
2. Mid: Tomas recovered (cost + Living texture)
3. Mid/late: permanent 10th found or answers a signal (separate cost; permanent; romance-eligible; **not** Tomas’s cargo)
4. Mid/late: Jiro recovered (nav / Future texture)
Three separate arrivals, three flavors. Private attention extends across five routes.

**Permanent 10th — Vess (LOCKED 2026-08-14):**
- **Name / look / voice:** Vess, 22. Tall, wiry-athletic (low-grav trained), long dark hair she cuts herself (uneven, hacked jawline streak). Genuinely beautiful and visibly unused to being looked at — holds eye contact too long or not at all. Voice: flat, timestamped, log-trained; the flatness is a skill from procedure manuals and cracks when something surprises her.
- **Origin:** Sole survivor of the *Dawnbreak* fragment. Stranded at 16 when the sister ark broke up; adult crew died; she kept the beacon alive alone for six years, raised herself on the ship’s library and her own log entries, read the manifest (including her parents’ names) into the dark every night. First transmission requests authentication protocols — she half-believes she is hallucinating.
- **Arrival cost:** Fixed reaction-mass spend that deletes a future course option + environmental-bus downgrade to power her relay core.
- **Unique texture:** Long-range ears / relay competence; keeper of the *Dawnbreak* manifest and the dead; only crew member who never knew old Earth as an adult — she mourns a ship, not a planet.
- **Romance (5th route):** Default-offer compatible. Initiates bluntly and slightly wrong (procedure she’s only read about). Route texture: Commander deciding whether to slow someone rushing to prove she is not broken. **Power stays with her** in key beats (door-override crisis is hers; forgiveness never guaranteed). She is inexperienced with people, not with survival, command, or judgment — she has been her own captain for six years. Avoid any read of “Commander shapes the naïve.”
- **Scar / debt:** Neglect branch lands hard (“nobody asked” from a 22-year-old who taught herself not to volunteer is an indictment of the crew). Favoritism creates visible isolation risk.
- **Sample line:** “I said their names every night so somebody did. Yours I already know — the beacon logged your hull ID eleven months ago. I’ve been talking to you longer than you think, Commander. You just started answering.”
- **Art:** Full Batch A set required later (portrait, arrival, romance, possible shower/rear if route is written). Do not generate until route structure exists.

**Tomas recovery — “The Green Tether” (LOCKED 2026-08-14):**
- **Premise:** Agri-annex (self-sealing greenhouse + germplasm vault) trailing on decaying drift. Tomas sealed himself inside during the breach and survived by sprouting/eating seed stock. Recovery = slow-approach tether dock (module can’t be flown, only caught).
- **Cost:** Match drift by venting reserve water mass as propellant → permanent hit to ration ceiling. Someone rides the tether (player picks EVA hand; that character unavailable next scene). Commander chooses whether crew learns Tomas ate ~1/3 of germplasm or logs it as breach loss (carries the lie).
- **Texture enabled:** Surviving vault comes aboard → Living becomes physical (live plants, real food, green in rites). Tomas only one who can keep trays alive.
- **Careless scar:** Rush dock to save water → pressure shock kills sprouting trays; vault arrives dead. If manifest also exposed, Tomas scapegoated → poisons Tomas↔Jiro reconciliation gate.
- **Return line:** “Count the trays before you thank me. Then decide whether you still want to.”
- Fully survivable on careful run.

**Jiro recovery — “Dead Reckoning” (LOCKED 2026-08-14):**
- **Premise:** Jiro sealed in severed astrogation blister (no comms, own air loop), running stars by hand. Assumed cold; found because he micro-adjusted the attitude ring in a repeating pattern Mira finally reads as intentional. Recovery = cut through buckled spine (one-way structural decision).
- **Cost:** Cut requires unplanned correction burn that spends most propellant margin reserved for orbital insertion → arrival becomes a threading problem. Burn requires committing to a heading publicly before Jiro’s data is in hand. Tomas (if aboard) objects on record; Commander overrules or delays and spends more margin.
- **Texture enabled:** Hand-run logs = ship’s true position and clock. Guesswork becomes briefing; course-choice scenes unlock; endgame gets exact dates; private-junction “real course numbers” becomes possible. Certainty cuts (crew knows Lena’s clock to the cycle).
- **Careless scar:** Order burn on blister’s stale telemetry without Mira verify → burn slightly wrong; one late course option permanently lost. Jiro knows; surfaces only in private-junction as arithmetic, not accusation.
- **Return line:** “I know exactly where we are now. You won’t like how far that is.”
- Fully survivable on careful run.

**Lethal opportunities (0.22) LOCKED — all avoidable, full-survival run remains possible:**
- **Rourke** — already dies early (multiple paths).
- **Amara / Jiro / Sela** — lower-ring vent crisis (existing).
- **Lena** — resolve existing slow-death clock. Later medical crisis: last stabilizers / sterile supplies / life-support power can keep her functional or be spent on vault / majority. Refuse or arrive too late → she dies working. Cause examples: “kept working until the clock ran out”, “resources diverted to the vault”.
- **Tomas** — after vault_sacrifice (esp. pure Future) or during 0.22 recovery. Loyalty break turns lethal: refuses a further Living sacrifice order, or takes a fatal risk to save someone the Commander wrote off, or recovery cost is paid in full. Cause examples: “refused the order and paid for it”, “went back for the living and did not return”.
- **Elias** — later security / order / cascade moment. Volunteers or is ordered into the ugly decisive action (seal while people still inside, enforce lethal ration, hold failing bulkhead). Succeeds; does not return. Cause: “held the line”, “enforced the order”, “paid the cost the rest of us would not”.
- **Mira** — systems / cascade / engineering crisis. Only clean technical solution requires someone to stay in a lethal environment. She refuses to abandon the repair or is ordered to finish it. Completes the work; ship is safer; she is gone. Cause: “finished the repair”, “would not leave the board”, “competence cost”.

Rules (locked): fully avoidable; permanent; named cause in deathCause; dead never speak; unique crisis action disappears; romance route closed; later prose/debt/endings may cite the death as fact. No random deaths.

**0.22 Exclusive route crises (ChatGPT package locked 2026-08-14):**

**Living-only: “The Breath They Cost”**
- Premise: Earlier Living decisions kept injured/vulnerable crew in functioning sections, consuming filters, medical O₂, seals. Overworked air loop blooms with corrosive biofilm. The ark can no longer support everyone the Commander insisted on saving.
- Choices (summary):
  1. Cannibalize sterile filters + cryogenic reserves from outer embryo racks → all survivors safe; major Embryo loss; closes uncompromised-vault ending claim.
  2. Send previously protected crew into contaminated scrubber trunks by hand → preserves Embryos; risks the favored; possible permanent lung damage or named death at low Integrity; severe Cohesion/relationship damage (protection revealed as conditional debt).
  3. (Requires living Amara) Destroy mature seed cultures, rebuild hydroponics as disposable biological scrubber → saves survivors + embryos; heavy later Supplies pressure; Amara’s “first piece of another world” destroyed; ending ecology altered.
  4. (Requires living Lena) Controlled hypometabolism / black sleep; Lena stays awake to manage → preserves embryos + survivors possible; Lena takes permanent neurological/respiratory scar; mixed ideology.
- Permanent “breath debt” scars cited in later prose/endings. Amara/Lena solutions vanish if dead. Without them the scene collapses to harsher binary (future vs conscript the rescued).

**Future-only: “Custody of Tomorrow”**
- Premise: Earlier Future decisions isolated the vault, filling its sacrificial thermal spine. Heat must be discharged into an occupied section, absorbed by thawing part of the vault, or released via dangerous internal repair. Crew questions whether the Commander should retain sole control over what they may die for.
- Choices (summary):
  1. Dump stored heat through inhabited ring → preserves every Embryo; Supplies/Integrity cost + thermal exposure; severe Cohesion loss; vault treated as Commander’s possession.
  2. Thaw outer embryo racks to absorb heat → major Embryo loss; protects survivors; weaker Future commitment; thawed embryos become explicit ending fact.
  3. (Requires living Mira) Mira severs fused thermal junction in unpressurized maintenance skin → preserves most embryos + survivors; Mira takes permanent cold-radiation injury; she owns the cost.
  4. (Requires living Sela) Open vault manifest + grant Sela second physical authorization → delayed limited purge; ends unilateral control; later embryo choices must include Sela if alive.
- Permanent answer to “who owns the future.” Mira/Sela solutions vanish if dead. Without them the crisis collapses toward coercion or embryo destruction.

These two replace the same middle-game slot; one is burden-allocation, the other is custody. They produce different choices, scars, and ending facts.

**0.22 Survivor-dependent crisis actions (ChatGPT package locked 2026-08-14):**
- **Lena** — Black sleep: staggered medical coma so heat/respiration stop feeding biofilm. Living crisis. Cost: most remaining sedatives; dosage error risk. If dead: option gone; must sacrifice garden, vent, or let corrosion advance while people stay awake.
- **Elias** — Sealed-order protocol: destroy secondary command credentials; only individually authenticated orders. Later security moment. Cost: no command redundancy if Commander incapacitated. If dead: rival instructions can divide crew.
- **Mira** — Exact cut through vault thermal bridge in overheated maintenance throat. Future crisis. Cost: removes thermal redundancy; heat injury risk. If dead: must sever entire junction (vault or hull sacrifice).
- **Tomas** — Secures voluntary cooperation with quarantine/black sleep/garden conversion only after public promise that rescued will not be treated as the cause. Living crisis. Cost: time + restricts harsher later containment. If dead: same orders feel coercive; delays force personal imposition or further spread.
- **Amara** — Convert garden into living scrubber (roots/microbial beds consume biofilm). Living crisis. Cost: destroys food crop; contaminates garden; she must stay inside. If dead: no one understands garden well enough; only medical suppression or destructive purge left.
- **Jiro** — Roll ark onto blind axis; spend last clean course correction to turn least-damaged hull face into temporary radiator. Future crisis (before thermal discharge). Cost: abandons planned approach corridor; longer/less certain route. If dead: ship badly oriented; less time for Mira/Sela; excess heat accepted by vault or decks.
- **Sela** — Witnessed shared-custody compact: every vault triage order stated before both custodians. Future crisis. Cost: permanent surrender of unilateral vault authority. If dead: shared custody does not exist; sole control or grant to aligned survivor becomes enduring claim of seizure/favoritism.

Death removes the action cleanly. No anonymous substitutes.

**0.22 Promise obligations (ChatGPT package locked 2026-08-14) — only spoken promises return later:**
1. **“I will not vent anyone who is still breathing.”** (Amara) — Tested in The Breath They Cost. Keep: heavier cost (garden/black-sleep) but Amara continues helping. Break: trapped survivor dies; Amara refuses further intimacy and treats later “protect the living” claims as rhetoric.
2. **“If the vault and the living need the same mercy, the living get it.”** (Tomas) — Tested in Custody of Tomorrow. Keep: Tomas gives voluntary cooperation. Break: his break becomes personal; voluntary cooperation unavailable.
3. **“If Deck Four comes back, you hear it from me first.”** (Elias) — Tested when ship reconstructs Deck Four record. Keep: cohesion damage but Elias accepts sealed orders later. Break: Elias refuses sealed orders; endings identify Commander as editor of the dead.
4. **“I will never kill one of them to keep you.”** (Lena) — Tested when Lena’s condition collapses vs another patient on same medical line. Keep: full-survival possible; Lena may be unavailable. Break: another named survivor dies for her; she never again accepts private comfort.
5. **“No one will use you as the price of their fear.”** (Sela) — Tested in Custody of Tomorrow when crew demands she be scapegoated. Keep: Sela offers shared custody and stands publicly. Break: she withdraws shared-custody solution; becomes exact/obedient rather than trusting.
6. **“The living will decide what the future becomes.”** (Mira) — Tested in later cascade when ship offers to bind Earth-era directives. Keep: survivors retain authority; more of the old world lost. Break: ark safer under rules written by the dead; Mira refuses to call the destination a human future.

No quest log. Character simply remembers and acts.

**0.22 Crew-to-crew pairs (Fable package locked 2026-08-14) — relationships that do not pass through the Commander:**
1. **Elias → Mira (the shield):** Elias quietly covers for Mira (takes blame, stands beside her when marked). Surfaces early as background, sharpens mid if Commander marks/cuts her. If Mira dies of a Commander-attributable cause, Elias goes cold permanently and gets one scene naming what she was to him. Late triage/airlock crisis: if both alive and Mira is marked, Elias volunteers in her place (choice list swaps her name for his); refusing him costs standing.
2. **Tomas ↔ Jiro (the breach grudge):** Tomas blames Jiro for an early hull/system breach; Jiro thinks Tomas froze. Seeded early, dormant mid, resolves late only if both alive AND Commander did not scapegoat either. If reconciled: late repair crisis gains a cheaper joint option. If unreconciled and one is dead: survivor refuses one Commander order, naming the dead man.
3. **Amara → Sela (stop favoring her):** Close friends (or lovers if neither is in a Commander romance). Triggers mid when favors/affinity toward Sela exceeds crew baseline. Amara confronts Commander privately: stop isolating her. Comply → Amara trust rises, Sela never learns (but if romancing Sela, compliance reads as withdrawal). Continue favoritism → late Living/Future split: Amara publicly names the favoritism as her reason for siding against the Commander.
4. **Jiro → Lena (neglected turns elsewhere):** Only on runs where Commander has ignored Jiro (lowest affinity, never chosen). Jiro attaches to Lena (fixes equipment, saves portions, reports to her). If Lena dies, Jiro goes solitary. Late crisis: one option that normally needs Jiro is gated behind “Have Lena ask him.” If neglect never fired or Lena is dead, the option does not appear.

At most one boolean flag per pair. Dead characters never act. No meters.

**0.22 Post-ending reflection — “What remains” (Fable package locked 2026-08-14):**
- Appears after final ending text, one advance later, black screen, line-by-line fade. Single input skips to title. Shown once per run; no menu entry; never blocks credits.
- 3–6 standalone past-tense second-person declarative sentences. Fixed order: (1) Ideology line, (2) Death line(s) — up to 2, aggregate if more, (3) Choice line (exclusive crisis / vault decision as what was done), (4) Promise line (one kept or broken, most weighted), (5) Relational line optional (favored person or romance outcome only if significant).
- Omit lines the run has no data for. Minimum 3 lines or skip the screen entirely.
- Cite only logged facts: deathCause strings, ideology, vault/exclusive-crisis branch, tracked promises (kept/broken), significant favor gap, romance state at ending. Prefer linked facts when they exist (same event in death + broken promise).
- **Hard prohibition:** Only what happened, never what didn’t. No counterfactuals, no unseen-content hints, no completion %, no evaluative language (“you failed”). If a fact cannot be phrased without implying the road not taken, it is not cited.

**0.22 Scarce private-attention junction — “The Last Off-Shift” (locked 2026-08-14):**
- **Timing:** First quiet cycle after the exclusive crisis resolves (Breath They Cost or Custody of Tomorrow), before endgame commitment. One uninterrupted off-shift; requests arrive as door knocks / channel pings; player picks one; shift ends; junction never reopens. Flag: `junctionChoice = characterId`.
- **Who asks (eligibility from existing state only):**
  - Lena — always if alive (clock makes it unconditional)
  - Elias — if Mira dead, or Mira alive and marked
  - Mira — if she carried technical load in the exclusive crisis
  - Tomas — if ideology leans Living or crisis was Breath They Cost
  - Amara — if any death this run is Commander-attributable
  - Jiro — if recovered and alive
  - Sela — always if alive
  - Vess — always if aboard
  Typical run: 3–5 asks. Conditions self-limit.
- **What the chosen scene yields:**
  - Lena: how she wants the clock to end + medical succession notes on every living survivor (late advantage + only private answer to her death)
  - Elias: confession of what Mira is to him; if she’s alive/marked he asks to unmark her; surrenders an off-log security contingency
  - Mira: warning of an unlogged fault → unlocks one later crisis option that otherwise doesn’t exist
  - Tomas: asks for one of the six spoken promises (if a slot remains) or asks the Commander to break one (his framing)
  - Amara: offers or withholds absolution for the attributable death (ending reflection can cite it)
  - Jiro: real course numbers privately → destination problem becomes a briefing instead of a future crisis
  - Sela: yellow-sun ritual performed for one person for the first time; if romance open, this is commit-or-end
  - Vess: plays a transmission she hasn’t relayed and asks what to do with it; choosing her preempts her neglect scar
- **Romance rule:** If chosen character has an open route, the scene carries the romance decision; otherwise it does not inject one.
- **Unchosen (deferred debt only):**
  - Lena: death scene plays clinical; notes pass incomplete
  - Elias: late shield-swap fires unilaterally
  - Mira: unlogged fault surfaces as later complication
  - Tomas: stops asking; one late Living option removed or cold
  - Amara: absolution never offered again; grief redirects via crew-pair layer
  - Jiro: course problem arrives publicly as a crisis at the worst time
  - Sela: performs ritual alone; if romance was open, default-offer closes permanently
  - Vess: neglect scar activates — relays only what’s explicitly asked; transmission expires
- **2–3 survivors:** Fires if ≥2 eligible ask. Exactly one → scene plays with no choice UI. Zero → skip silently. Low population makes the junction heavier, not lighter.

**0.22 Structural Plan + Ticket Sequence (Fable map locked 2026-08-14, action split corrected):**

**Core structural moves:**
- Add `scenes-crises.js` (5th pure-data file, same shape, registered in index.html). Arrivals and crises live here if mid-a/mid-b near ceiling.
- Ideology router after `vault_sacrifice` resolution: Living → “The Breath They Cost”; Future → “Custody of Tomorrow”; split → short forced-declaration (~20 lines) into one of the two. **Replace shared late-crisis spine; do not lengthen.**
- Arrivals (Tomas → Vess → Jiro) land **before** the crises so survivor-actions can depend on recoveries.
- Early-act retrofit required: Rourke dead, Tomas/Jiro missing early; `tomas_break` moves post-recovery.
- Tomas↔Jiro breach-grudge seed moves to first scene both recovered men share; re-key grudge to recovery events.
- Survivor-action split (corrected): Breath = Lena black sleep, Amara garden scrubber, Tomas voluntary cooperation; Custody = Mira thermal cut, Sela shared custody, Jiro radiator; Elias sealed orders = later security moment. Vess has no survivor-action.
- What remains is last (depends on all logging).

**Ticket sequence (one concern each) — expanded numbering locked 2026-08-14 (content order + dependencies unchanged):**
| Ver | Concern |
|-----|---------|
| **0.21.2** | Causality & Hygiene (P0/P1) + lean-ups (freshState, crew-derived lists, registerScenes, romanceOpen, STAT_CAPS, delete dead fields/eventPools). **DONE** |
| **0.21.3** | Pin Art / Independent Scroll — scene art pinned above `#main` scroller. **DONE** |
| **0.21.4** | Scene Image Fit — default aspect-ratio 3/4 to match locked 784×1168 plates. **DONE** |
| **0.22** | Groundwork + early-act retrofit: `promises{}`, `recovered{}`, `crisisPath`, `vessAboard`, `sela_vault_vow`; FLAGS + RUN_FACTS registries; `scenes-crises.js` scaffold + index.html; Rourke dead / Tomas+Jiro missing; **relocate `tomas_break`** |
| **0.23** | Tomas recovery “The Green Tether” + Jiro recovery “Dead Reckoning” + **Vault needs a face** (required quiet Future beat) + start scheduled warmth |
| **0.24** | Vess arrival + 5th romance + extend death-aware art fallbacks |
| **0.25** | Lethal opportunities (Lena / Tomas / Elias / Mira) — all avoidable; `state.dying` only; **anticipated-risk lines** required |
| **0.26** | Ideology router + exclusive crises (“The Breath They Cost” + “Custody of Tomorrow”) + survivor-dependent actions; biased counsel + competence seeding |
| **0.27** | Six spoken promises (make-points + keep/break) + **promise re-surfacing**; highest-regression; full validate after |
| **0.28** | Crew pairs + “The Last Off-Shift” junction (sensory opportunity-cost line) + remaining scheduled warmth |
| **0.29** | “What remains” + light polish + post-intimacy conditional lines pass |
| **0.30** | Packaging |
| **0.31** | External review #2 |
| **1.0** | RC |

**Sequence rules (locked):** Lethal opportunities before exclusive crises. Arrivals before crises. SPINE assert data-driven or deferred until after exclusive crises land. isAlive guards as live predicates. Art-fallback table extended when Vess or new deaths land. Content order and dependencies identical to prior 0.22.0–0.22.10 map.

**Fable codebase review (verified 2026-08-14) — P0 must clear before 0.22 content:**

**P0 — Causality breaks**
1. **Spine replay loop:** `bond_lena` → `romance_lena_sex` both exits → `past_leak` replays entire Act 2a (embryos re-deducted, ideology double-counts, tomas_break re-fires). Fix: context-aware exit to `pursuit_window` when mid (~6 lines).
2. **Four reckon scenes unreachable:** `reckon_public/suppress/memory/truth` orphans; all `faction_split` choices go to `reckon_summary`. Endings cite `reckon === "memory"` which can never be set. Fix: route `reckon_summary` → matching `reckon_*` by flag → `sun_payoff`; add memory option to `faction_split`.
3. **`pregnancy_check` + mid-b `abandoned_section` unreachable:** `eventPools`/`pickEvent` never called. Pregnancy ending paragraphs dead. Fix: wire `pregnancy_check` (e.g. between debt_notice and tomas_break, gated on any romance); delete duplicate `abandoned_section`; delete dead `eventPools`.
4. **Death-aware art substitution broken:** `resolveSceneImage` fallbacks use non-existent keys (`map.corridor` etc.) → full-crew art after deaths. Fix: literal paths (`"images/corridor.jpg"`) — 3 lines.

**P1 — Compounds into 0.22**
5. **Single-slot `marks` strings collide** (spoken vs declined erases Yellow Circle etc.). Refactor to boolean keys or Set before 0.22 multiplies writes.
6. **`dying` dual source of truth** (`state.dying` vs `flags.dying`). Pick `state.dying`, delete flag write.
7. **Elias/Lena unguarded `isAlive`** in ~15 scenes. Safe only while they can’t die; breaks when lethal opportunities land. Add guards with 0.22 lethal work or now.
8. **Validator gaps:** whitelist dynamic next prefixes; optional SPINE forward-only assert; read-without-write audit. ~40 lines total.

**P2 (defer):** version drift across files; `bond_` mis-cropped as intimate; image weight / unreferenced plates.

**Strong (do not touch):** honest effects preview, death-hides / resource-disables gate split, save system, CSS fundamentals, guarded dynamic-text discipline in aftermath/vault_sacrifice/faction_split.

**0.21.2 scope (locked):**
**P0 first:** P0.1 spine loop (~6 lines) → P0.4 art fallbacks (3 lines) → P0.2 reckon routing + memory option → P0.3 pregnancy_check wire or delete + delete abandoned_section dupe + delete eventPools/pickEvent.
**Hygiene / lean (same ticket or immediate follow-on):**
- Delete dead fields (`midPath`, `pregnancy`, `intimacy_visits`) and stale flag comment block
- S3 `registerScenes` + duplicate-id throw
- S1 `freshState()` single factory (reset/snapshot/apply use it)
- S2 derive crew lists from `crew` + `ROMANCEABLE` + `crew.first` seeds
- S4 `romanceOpen(who)` helper
- S5 shared `STAT_CAPS`
- isIntimateScene fix (no longer treats bond_* as intimate)
- P1.5 marks → boolean keys or Set
- P1.6 dying single source (`state.dying` only)
- P1.7 isAlive guards as live predicates on Elias/Lena
- P1.8 validator: dynamic-next whitelist, read-without-write, reachability BFS; SPINE assert data-driven or deferred

**0.22 groundwork adds:** FLAGS registry + RUN_FACTS registry start + validator batch (unknown flag writes, kill-without-cause, dead-speaker warn in validate mode).

**Later lean:** S6 imageRules table (with Vess/lethals art work); S7 endings-as-data (just before What remains).

**Scene convention (all new work):** package-prefixed flags/ids; kill() only in onEnter with cause; dialogue inside isAlive branches; every new flag in registry same commit; 6-line file header (package / entry / exit / flags written).

**Fun & attachment principles (Fable review locked 2026-08-14; ownership assigned 2026-08-15):**

**Already strong (protect):** exclusive-crisis router (honest FOMO); survivor-dependent actions with absence lines; six spoken promises as diegetic contracts; Last Off-Shift scarcity; cast drip (Tomas/Jiro/Vess); crisis-request romance middles; What remains (facts only, from event strings); lethal opportunities that make agency dangerous.

**Must address — now ticket-owned:**
1. **Vault needs a face** (0.23 required) — one mid-act quiet beat making Future concrete (manifest name, imagined first child, Elias or Sela reading aloud, or equivalent). Without it Living wins every emotional argument by default. Highest-priority single addition. Lands with recoveries so it has time to breathe before crises.
2. **Scheduled warmth** (0.23 start + 0.28 finish) — ~3 quiet death-reactive moments across the run (garden meal, overheard laughter, corridor music). Unrelieved dread flattens; warmth recalibrates the next blow.
3. **Anticipated-risk lines** (0.25 required) — one early/mid line per lethal-opportunity character that retroactively reads as them knowing their risk shape (Lena, Mira, Elias, Tomas). Characterful first, foreshadowing second.
4. **Promise re-surfacing** (0.27 required) — diegetic allusion mid-run (character mouths) before keep/break test. Prevents gotcha on mobile/session gaps. No journal.

**Fold into owned tickets:**
5. Post-intimacy conditional lines → 0.29 polish pass (partner’s next-scene first line shifts — steadier / more scared / briefly formal).
6. One sensory opportunity-cost line at close of Last Off-Shift → 0.28 (“Sela’s light is still on” — observe, don’t editorialize).
7. Biased counsel at ideology router / crisis junctions → 0.26 (Sela→vault, Lena→living, Vess interesting/unpriced).
8. Competence seeding lines before survivor-actions are tested → 0.26 (Amara in garden early so “garden sits dark” lands).

**Permanent anti-patterns:**
- No consequence tags / “will remember that” / promise tracker UI
- No numeric affinity or romance completionism / galleries / route achievements
- No narrator comedy; humor only from characters coping
- No fake danger or gotcha deaths (fair in hindsight, unpredictable in foresight)
- No meta-progression between runs
- No choice-count inflation; one real choice + strong prose beats three weak binaries
- Endings cite run facts only; dead never speak; absence can be an object (unwatered garden, unreleased promise)

**Tone rule:** Gallows humor from crew, never the frame. Dread from specificity (“eleven days at current draw”) not UI meters. Every good ending still names what it spent.

### Lingerie / afterglow art
Files exist for Lena/Mira/Amara/Sela (`lingerie_*.jpg`, `afterglow_*.jpg`) — wire in 0.21.1. New woman needs full art set when designed. Do not wire cold.

### How to start a Build ticket
```
pm Starting v0.XX … from PROJECT_STATUS.md
Scope: …
Out of scope: …
Follow locked Code discipline. Validate after scene changes.
```

### Validate
`?validate=1` or `localStorage.sunsplitter_validate=1` → expect 0 errors

---

## Core Concept
Grim narrative survival. Last human survivors on the damaged ship *Sunsplitter* after an Earth disaster. Player is the Commander. Story-focused, delayed consequences, permanent character attachment, moral weight. Mostly played on mobile browser. Length flexible — prioritize weight and replay depth.

## Architecture
- `artifacts/sunsplitter/`: index.html, css/style.css, js/engine.js, js/state.js, js/scenes*.js
- Images: `artifacts/sunsplitter/images/`
- Versioned zips: `sunsplitter-v0.XX.zip`
- Trackers: this file + `ART_REQUESTS.md`
- After 0.10.1: scenes split by act (`scenes-early.js`, `scenes-mid.js`, `scenes-late.js` or equivalent)

## Locked Decisions
- Style: grimdark × cyberpunk (crimson/cyan neon, atmospheric haze)
- Rogue planet = story spine; Future vs Living ideological axis
- Core cast of 9 (Commander + named survivors). Sela is adult (20). Do not dilute with permanent new cast.
- Ship meant for hundreds; sudden catastrophe; nine cleared the hatch. Make absence felt.
- Soft intro: Rourke + Lena + Elias first; others through action over first third
- **Adult/explicit content is permanent.** External reviews may critique structure; they do not remove adult content.
- Commander can romance Lena, Mira, Amara, Sela (each distinct; Sela fully adult)
- **Romance default (locked):** All four are interested and initiate. First intimate routes are **offered by default** if she is alive and not already romanced/declined. Player must **explicitly reject** to skip. Held-only is a soft middle. No high affinity/trust walls that silently hide options. Scarce `intimacy_visits` cap removed or raised so all four can complete in one run. Decline paths mandatory. Favoritism/debt still apply after acceptance. Aftermath sticks.
- Causality-first applies to *consequences* of romance, not to locking routes behind perfect play
- Resources: Survivors, Integrity, Cohesion, Supplies, Embryos. Seeds removed. Numbers must gate or kill — no decorative meters
- UI: pinned art, scrolling text; mobile-first (44–48px targets, ≥16px body, dvh/safe-area)

- Art goal: fitting art per scene; continuity > volume. Tracked in ART_REQUESTS.md
- Code discipline: pure-data scenes, thin engine, consistent shape, act-split scenes, token-conscious edits, light validation (see below)
- **Sela personality:** Not locked to silence. Yellow-sun ritual and “wants a world that is still warm” stay. Distinct spoken voice. Adult. Under romance-default rule: her bond/pursuit is offered if alive and not declined; spoken-mark preferred for flavor but must not hard-block the route if the player never visited the ritual.


## Priority principle
**Consequence engine must tell the truth before content volume expands.**  
**Codebase must stay clean and easy to edit as the game grows.**  
**Structure and divergence before romance volume.**

---

## Version Plan

### ✅ Done
| Ver | Focus |
|-----|--------|
| 0.07 | Structure & exclusive mid-paths, affinity/trust, reckon, endings |
| 0.08 | Weight & attachment, named deaths, quiet moments, marks |
| 0.09 | Ideology, moral-shape endings, Yellow Circle (logic broken in practice) |
| 0.09.1 | Polish (green/red effects, type, Sela adult language, some gating) |
| 0.10 | Causality A–C (death-aware, systems mean something, truthful endings) — DONE |
| 0.10.1 | Hygiene (act-split scenes, validate.js, UI scroll/focus) — DONE |

---

### v0.10.1 — Hygiene & Dev Environment ✅
**Goal:** Make every future version cheap to build, easy to audit, and safe to expand. No new story content.

**Shipped:**
- Act-split: `scenes-early.js` (531) / `scenes-mid.js` (519) / `scenes-late.js` (215) — all ≤1100
- Strict scene shape: only `text` | `choices` | `onEnter` | `image` (documented; validate enforces)
- `validate.js` — next targets, illegal keys, required scenes; `?validate=1` → console; runs clean (58 scenes, 0 errors)
- Version headers + VERSION.md → 0.10.1
- UI: story no longer flex-grows into blank space; choice focus uses `:focus-visible` (no sticky red after tap)
- Engine supports per-scene `image` override

**Out of 0.10.1:** any new scenes, mid-arcs, romance, balance changes, art volume

---

### v0.11 — Structure & Real Divergence ✅
**Goal:** Two runs feel different in the *middle*, not only the ending. Choices have real gray weight.

**Shipped:**
- Soft intro: Lena + Elias only in opening; Mira/Amara/Tomas/Sela through action (hydroponics, quiet_*, crisis)
- Earth departure Option A in wake/status: colonization ark, cascade, thousands → nine; official story first
- Cascade records reveal on Future arc (`arc_future_3`, `cascade_truth` flag)
- Exclusive mid-arcs: `arc_fork` → Future ×4 (`arc_future_1..4`) or Living ×4 (`arc_living_1..4`) → `vault_sacrifice`
- Leadership (`lead_*`) separable from ideology leans and arc choice
- Ship remembers: marks/flags change options and prose (Mira, Amara, Tomas, conflict, cascade)
- Reactive crew conflict: `arc_living_3` branches on hard/stores/vault_priority/marks
- Gray trade-offs throughout both arcs (no clean packages)
- Sela voice: precise spoken lines in quiet_sela + arc_living_2; yellow ritual kept; Yellow Circle path intact
- validate.js: 60 scenes, 0 errors

**Out of 0.11:** full romance rewrite, new erotic art, stowaway, mining loop

---

### v0.12 — Attachment & Romance Structure ✅
**Goal:** Relationships have weight; explicit content is earned; all four women are fully romancable.

**Shipped:**
- White-space-under-choices fixed (`#main` block layout; `#game-screen` content-sized)
- Four Commander routes via `intimacy_window` after vault sacrifice:
  - Lena: `lena_dying` / `bond_lena` → consent → `romance_lena_sex`
  - Mira: `bond_mira` → `romance_mira_1`
  - Amara: `bond_amara` → `romance_amara_1` (distinct from Tomas path)
  - Sela: `bond_sela` → `romance_sela_1` (affinity ≥18, trust ≥42 + spoken) — gates relaxed post-0.13 playtest
- Consent/decline on every bond (sex / hold-only / step back)
- Public cost + favoritism named in intimacy_window and reckon
- Aftermath in reckon_summary for all four + amara_tomas
- Existing shower/romance art wired to earned beats only
- validate: 69 scenes, 0 errors

**Deferred:** multi-seduction beat + lingerie art set (optional later)

**Out of 0.12:** checklist completionism, forced multi-romance, full mobile deep-polish

---

### v0.13 — Mobile UI, Art Continuity & Ending Viability ✅
**Goal:** Best experience on phone; art matches state; endings feel reachable from different playstyles.

**Shipped:**
- Touch ≥48px, body ≥16px, dvh + safe-area, pressed states, compact status
- Optional crew panel (meta → Crew): alive/dead chips, favored highlight
- Death-aware `resolveSceneImage` for crisis/aftermath/faction/crew_walk
- Intimate image class for romance/bond plates
- Ending art wired (landfall/ship/sela)
- Landfall & Still Burning thresholds slightly softened
- White-space fix retained from 0.12

---

### v0.14 — Density & Ship as Character ✅
**Goal:** World feels inhabited by absence and detail.

**Shipped:**
- `empty_berths` + denser `crew_walk` / `time_pass` / `aftermath` (manifests, locker lists, missing IDs)
- `competence_watch` quiet non-crisis competence
- Flag payoffs: elias_power, past, stores/power in faction
- White-space reinforcement
- Skipped: found-person crisis, scavenging loop (cast depth sufficient without dilution)


- Environmental storytelling: empty capacity, traces of hundreds who didn’t board
- Quiet competence moments (non-crisis attachment)
- Optional **temporary** found-person crisis (not permanent 10th crew) — only if cast already feels deep
- Final rare-path polish; flag payoff audit
- Voice consistency pass across surviving characters (including expanded Sela)
- Optional single high-stakes scavenging *story* beat (not a loop) if it changes a relationship or destination permanently

---

### v0.15 — Relationship Debt & Personal Cost
**Goal:** Attachment has teeth; endings and mid-game reactions cite what you actually did.

- Relationship debt: heavy favoritism / romance causes specific other crew to refuse help, offer worse options, or go quiet in reckonings (not a jealousy minigame — people noticing)
- Endings name 2–3 concrete decisions from this run (who died, which arc, who was favored, vault choice)
- Commander’s past as mid-game pressure (not one-shot leak): different crew learn different pieces; who knows what changes backing in conflict / final choice
- Small resource tension pack (2–3 more Supply ↔ Integrity/Cohesion gray trades)
- **Post-intimacy pursuit:** after a woman has completed her Commander route, she may initiate a second, distinct approach (lingerie seduction / “behind partners” risk where relevant). Decline paths + debt consequences. Wire **lingerie** and **post-sex afterglow** Hero art (naked, sweaty, in bed, adoring) only into these earned beats.
- **Scarce private attention:** private windows force trade-offs (can’t deepen every bond in one pass)
- **Structural crew dependence:** more mid/late options require specific living + trusting crew (option gone or worse if dead/hostile) — deepen what 0.10 started
- **Crew history talks + one-shot favors:** optional, scarce, consequential. Completing one changes a later scene or option. Skipping is valid. No quest log, no loops. History that reframes prior orders, not biography dumps.

**Design rule:** Crew history and favors are optional, scarce, and consequential. No completionism.

**Out of 0.15:** new cast, new systems meters, generating lingerie/afterglow art before the beats exist, quest tracker UI

---

### v0.16 — Persistent Consequence & Symbol Payoff ✅
**Goal:** One thing the ship never forgets; Sela’s motif earns its weight; truth stays incomplete.

**Shipped:**
- `ship_memory` from Deck 4 feedstock choice → `patch_fails` on hard hold if jury/open
- `sun_payoff` doctrine/scrub/silent; Yellow Circle respects scrub/doctrine
- `boarding_stories` conflicting accounts; `departure_truth` never singular
- `ship_interrupt` once during personal beats when Deck 4 is soft
- mid ~1255 lines → **0.17 split next**


- One irreversible “ship remembers” object or systems consequence that persists the whole run (jury-rigged seal that later fails, ration decision that closes a later option, private promise that blocks a public order)
- Sela yellow-sun payoff as a real branch (not only Yellow Circle): motif changes something concrete mid/late (navigation, morale, or Living-path requirement)
- **Conflicting accounts** of Earth departure / boarding / selection — player never gets one clean official truth
- **One ship-forced interrupt** while the player is in a personal beat (ship as antagonist, not a management clock)
- Light polish pass on any remaining thin aftermath / favoritism edges from 0.12–0.15
- Candidate point for **external review** (see below)

**Out of 0.16:** permanent 10th crew, combat, management loops, lore codex collectibles

---

### v0.17 — Code Review & Refactor ✅
**Goal:** Keep the game cheap to update, audit, and extend after content plateau.

**When:** After 0.16 (preferred). Optionally earlier after 0.14 if `scenes-mid.js` exceeds ~1100 lines.

**Shipped:**
- Strict shape clean across early / mid-a / mid-b / late
- Split: `scenes-mid-a.js` + `scenes-mid-b.js` (≤~650 each); index updated
- validate.js expanded (graph, flags, romance gates, image orphans)
- Stale sceneImages pruned
- No story/balance/art changes


**Scope (no story content):**
1. Re-audit strict scene shape (`text | choices | onEnter | image` only)
2. Split any act file over ~1100 lines (likely mid)
3. Expand `validate.js`: dead flags, unused image paths, romance gate consistency, next-target graph
4. Refresh flag READ vs WRITE audit
5. Thin engine helpers that grew fat (ending builders, image resolver, favoritism)
6. Naming consistency pass (stable snake_case IDs)
7. Confirm one-concern Build workflow still works on the new layout
8. Update VERSION.md + PROJECT_STATUS.md

**Out of 0.17:** new features, balance changes, art, story

---

### Stranger-ready track (0.18 → 1.0) — LOCKED
**Goal:** Other players can start, finish, and recommend the game without developer habits. Still one-concern versions. No second engine, no combat, no live-service. **UI is a product strength**, not an afterthought.

| Ver | Focus |
|-----|--------|
| **0.18** | **Onboarding & tone contract** — premise in 60s on a short phone screen; content warning as a designed screen (adult permanent); what the game is/isn’t; no tutorial dump |
| **0.19** | **Save/resume hardened** — solid on iOS Safari; survive refresh/background; clear visible slot/resume affordance; never silent-lose a run |
| **0.20** | **UI strength pass (mobile)** — kill white-space under choices for good; status glanceable (raise label floor on narrow phones); crew chips tappable *or* clearly non-interactive; choice stack polish (48px+, gaps, pressed/disabled hierarchy); gated choices look disabled + optional reason; intimate art layout stable (no shift); diegetic chrome consistency; `touch-action` / select hygiene. Real iPhone Safari test required. |
| **0.21** | **Discoverability without UI bloat** — prose telegraphs gates; crew panel useful if cheap; no relationship % bars; systems readable without a manual |
| **0.22** | **Replay tools** — post-ending “what you locked out” summary and/or light NG+ flags; encourage second ideology/romance path |
| **0.23** | **Performance & packaging** — image weight, load order; itch/Netlify-ready zip; version string visible in-game; optional home-screen meta |
| **0.24** | **External review #2** — fresh players; structured feedback; fix only structural lies/confusion / UI trust issues |
| **1.0** | **Release candidate** — authored arc complete; known bugs listed; adult-tagged; start-to-end on phone without dev habits |

**Optional after 1.0:** 1.1 accessibility (font scale, reduce motion, contrast); localization only if funded.

**UI north star (permanent)**
- Diegetic, readable, thumb-native, calm under stress
- Body ≥16px, targets ≥48px, safe-area + `dvh`, choices in thumb zone
- Reading surface = gameplay surface; chrome feels like the ship, not a template
- Checklist: readable paragraph; no mis-taps; no dead white void; status in <1s; intimate art composed; resume trusted

**Product tests for “other players recommend it”**
- Second run feels like a different ship
- Someone they cared about died because of an early forgotten choice
- Romance felt earned, not a menu
- They still don’t know the full truth about Earth
- It respected their time and didn’t fake systems
- **UI never fought them on a phone**

**Dev rules (permanent)**
- Pure data scenes + thin engine; act-split ≤~1100 lines; one-concern versions
- validate.js after scene touches; PROJECT_STATUS is source of truth
- Batch playtests after meaningful surface change — not every patch
- Art never blocks; wire fallbacks always
- No React/TS rewrite unless 0.17 proves current model broken
- Feature gate by flag/requires, not branch explosion
- New system test: does this make two runs different, or only add text?
- UI changes: test on real iPhone Safari, one-handed

---

### External review — when
- **Not during active content builds**
- **Best windows:** after 0.16 (content surface); code-focused after 0.17; **formal stranger review at 0.23**
- Purpose: fresh eye on coherence, obvious paths, onboarding
- Same rule: external critique can challenge structure; it does not remove adult content or locked design

---

### Explicitly deferred / avoid
- Tactical combat, RPG stat sheets, inventory/loot
- Permanent cast expansion
- Repeatable mining/management loops
- Fuel as decorative meter
- Intro video as a blocker
- Content volume on top of a lying consequence engine
- Romance volume before structure is solid

---

## Code discipline (locked)

**Core**
- Narrative = pure data in scene files
- Thin engine, fat data
- No TS / classes / HTML-in-data unless deliberate

**Scene files**
- Split by act once size warrants it (do it in 0.10.1, before 0.11 content)
- Target ≤1100 lines per scene file
- Stable snake_case IDs; short searchable flags

**Strict scene shape** (only these keys allowed)
- `text` (string or function)
- `choices` (array or function)
- `onEnter` (optional function)
- `image` (optional override string)
- Nothing else

**Build process**
- One concern per Build session
- Narrative supplies a short pasteable ticket
- Build ends by updating this file + VERSION.md
- Prefer diffing one act file + engine/state only
- **Return requirement (mandatory from 0.24.2 onward):** Every Build ticket carries this verbatim: "Return: lines touched + validate result + sunsplitter-vX.X.X-netlify.zip attached to the reply." No ticket closes without the zip in hand.

**Validation**
- Light `validate.js` (or equivalent) that checks:
  - Every `next` target exists
  - No duplicate scene IDs
  - Referenced image paths exist
  - Required keys present
- Run after any scene-touching Build

**Review**
- Keep each change auditable without loading the entire story
- Token-conscious edits; no drive-by refactors

---

## Art parallel (non-blocking)
- Rectangular crisis + Batch A groups locked
- Shower/rear + lingerie + afterglow locked on disk — wire into earned intimate/pursuit/aftermath beats only
- Male bonds locked: bond_elias/tomas/jiro.jpg
- Art process: always Imagine cards for approval; lock = save both image folders; finalized attractive Batch A faces only
- Fresh Art chat recommended when current Art thread bloats (pull from this file + ART_REQUESTS.md)

## Project chats / Operating Model (LOCKED 2026-08-14 — upgraded)

**Four roles**
1. **Fable** — Design studio + writing + deep review. All scene drafting, ideology crises, recoveries, Vess route, What remains, causality audits, voice passes. Works one version ahead of Build. Specialized typed sessions (writing sprints of 3–5 related scenes, separate causality audits, separate voice audits).
2. **Grok** — Thin program office only. Sole lock authority, PROJECT_STATUS.md owner, converts Fable output into one-concern tickets, Build coordination, light sanity check on drafts. **Never drafts prose.**
3. **Build / Engine** — Implements tickets, validates, systemic work (state, registration, promises model, etc.).
4. **Art** — Per-version batches triggered at version lock boundaries.

**0.21.2 (immediate)**
- Grok pre-batches every hygiene ticket in one pass → Build executes sequentially.
- Fable runs in parallel producing: `FABLE_BRIEF.md`, per-character voice cards, pure-data scene skeleton, and early Vess / 0.22 groundwork.

**Ongoing (0.22–0.29)**
- Fable writing sprint → Grok locks + tickets → Build implements + validates → Fable causality/voice audit at version boundary → Art batch.
- Fable always works one version ahead of Build.
- Every Fable session starts with current `FABLE_BRIEF.md` pasted at top.
- Every scene draft must declare preconditions and state writes at the top (Build validates mechanically; dead-speaker checks via isAlive).

**Required artifacts**
- `FABLE_BRIEF.md` (~500 words, living) — pillars, locked design list, pure-data scene format, voice-rule digest.
- Per-character voice cards (10 lines each: diction, taboos, three sample lines).
- Pre-baked pure-data scene skeleton (required fields + art refs + isAlive guards).

**Drift protection**
- Locks travel verbatim in the brief; Grok is sole lock authority; Fable output is always draft-until-locked.
- Separate audit sessions from writing sessions.
- Format and precondition rules live in the brief, not in session memory.

Signal `pm` / `pm:` still = save to project memory.

## Version close-out ritual (LOCKED 2026-08-15 — standing protocol for 0.24.2 and every version after)

**Automatic deliverables (non-negotiable).** At the end of every completed version, Grok always attaches the following in the close-out reply — no request required:

1. **Updated `PROJECT_STATUS.md`** (this file, rewritten with the new version as current, HANDOFF snapshot advanced, Open/Next cleaned, Fable workstreams section updated).
2. **Netlify zip** named `sunsplitter-vX.X.X-netlify.zip` (renderable / downloadable in the same reply).
3. **Any other canon docs that changed this version** (from the sync set below). Only files that actually changed are attached — never a full dump.

**Canon sync set** (Claude / Fable project files that may update):
- `PROJECT_STATUS.md` — always
- `ART_REQUESTS.md` — when art list changes
- `CHARACTER_BIBLE.md` — when voice/cast canon changes
- `VOICE_CARDS.md` — when voice cards change
- `FABLE_BRIEF.md` — when brief changes
- `SCENE_SKELETON.md` — when skeleton rules change
- `FABLE_CASCADE_BACKGROUND.md` — when cascade background changes
- `FABLE_CASCADE_ALLUSIVE.md` — when allusive beats change
- `FABLE_0.23_PACKAGES.md` — historical; only if corrected
- `MINTED_PHRASES.md` — only if the ledger changes this version (create/update when needed)
- `ART_RULES.md` — only if art rules change this version (create/update when needed)

These are produced automatically on every version ship; the user never has to ask for them.

Applies to every version close-out from Grok. Logged here as permanent process.

1. **Fable workstreams absorption:** `FABLE_WORKSTREAMS.md` (if present) is absorbed into this file as the permanent section "Fable workstreams" below. Standalone file is then retired. Grok maintains the section every version.

2. **Build Return requirement:** EVERY BUILD TICKET from now on carries this Return requirement verbatim:  
   `Return: lines touched + validate result + sunsplitter-vX.X.X-netlify.zip attached to the reply.`  
   No ticket closes without the zip in hand.

3. **SYNC block at every Grok version close-out:** Ends with an exact list of files Manraj must update in the Fable/Claude project before the next Fable session, in this format:  
   ```
   SYNC TO FABLE PROJECT:
   - PROJECT_STATUS.md (replaces existing)
   - [any other changed canon docs from the sync set]
   - Attach to next Fable session: sunsplitter-vX.X.X-netlify.zip
   ```  
   Nothing else lands in the sync block unless a canon doc actually changed.

4. **Fable workstreams update:** As part of every close-out, update the "Fable workstreams" section: mark items done, advance the "next" pointer, note if a version-map change resequences anything.

**Effect:** Manraj's per-version upkeep is fixed at: replace the listed files + attach the named zip. All arrive automatically in the version close-out reply.

## Fable workstreams (permanent section — absorbed 2026-08-15; standalone FABLE_WORKSTREAMS.md retired)

Seven non-scene workstreams tracked by Fable / Grok. Grok owns maintenance of this section on every version close-out.

**Running order (current):**  
3 (done) → **2 (next)** → 0.25 sprint → 1 → 0.26 → 4 → 0.27 w/6 → 5 → 0.29 w/6 → 7 at 0.30

**Open locks (do not resolve without explicit decision):**  
- Session-type registration  
- Dev-tool repo vs ephemeral  

**Maintenance rule:** On every version close-out, mark completed items, advance the next pointer, and note any resequencing caused by version-map changes. Each workstream entry (when detailed) records its trigger condition and any zip dependency. Details of individual workstream content remain under Fable ownership until locked into this section or tickets.

## Handoff snapshot (Narrative archive 2026-08-14)
Durable decisions from long Narrative thread — do not re-litigate without cause:

**Process**
- 3 chats only (Narrative / Build / Art) until workstreams block each other
- Refresh Narrative when it mostly re-explains this file
- External review accepted on core diagnosis: consequence engine lied; fix before content volume
- Clean codebase is equal priority with causality when expanding

**Design**
- Soft intro; why-only-nine felt early; ship meant for hundreds
- Leadership separable from ideology
- Trust must be read; resources must gate; death-aware prose mandatory
- Yellow Circle must stay reachable
- Romance all four women; Sela adult/earned with expanded personality; shower + rear art for intimate beats only
- Adult content permanent
- Stowaway only as temporary crisis later (0.14), not permanent 10th
- No mining loop; no decorative fuel meter

**Art inventory locked**
- Batch A portraits (finalized attractive — permanent face reference)
- shower_lena/mira/amara/sela.jpg + rear_lena/mira/amara/sela.jpg
- bond_elias.jpg, bond_tomas.jpg, bond_jiro.jpg
- lingerie_lena/mira/amara/sela.jpg (skimpy seductive)
- afterglow_lena/mira/amara/sela.jpg (POV, breasts out, minimal cover)
- Continuity > volume; rectangular interiors; Batch A only in group shots; death-accurate when possible
- All under `sunsplitter_images/` and `sunsplitter/images/`

**Version map (expanded numbering locked 2026-08-14)**
| Ver | Focus |
|-----|--------|
| 0.10–0.14 | Causality → density — DONE |
| 0.15 | Relationship debt & personal cost — DONE |
| 0.16 | Persistent ship consequence + Sela sun + conflicting truths — DONE |
| 0.17 | Code review & refactor (no story) — DONE |
| 0.18–0.21.1 | Onboarding → UI → Discoverability → Second-pass pursuit — DONE |
| **0.21.2** | Causality & Hygiene (P0 + lean-ups) — **DONE** |
| **0.22** | Groundwork + early-act retrofit |
| **0.23** | Tomas + Jiro recoveries + **Vault needs a face** + start warmth |
| **0.24** | Vess + 5th romance |
| **0.25** | Lethal opportunities + anticipated-risk lines |
| **0.26** | Exclusive crises (Breath / Custody) + survivor actions |
| **0.27** | Six spoken promises + promise re-surfacing |
| **0.28** | Crew pairs + Last Off-Shift + remaining warmth |
| **0.29** | What remains + light polish + post-intimacy conditionals |
| **0.30** | Packaging |
| **0.31** | External review #2 |
| **1.0** | RC |

## Open / Next
1. **Process model LOCKED 2026-08-14 (upgraded)** — Four roles (Fable design/writing, Grok program office only, Build/Engine, Art). Grok never drafts prose. Fable works one version ahead.
2. **Fable artifacts LOCKED** — `artifacts/FABLE_BRIEF.md`, `artifacts/VOICE_CARDS.md`, `artifacts/SCENE_SKELETON.md` (skeleton updated 2026-08-15 to current engine form: next/alive/requires, no id:/goto/if). Paste FABLE_BRIEF at top of every Fable session. **Never ship drifted copies of these files inside handoff templates** — reference project canon only.
3. **0.25.x SHIPPED** — Lethals + causality hotfixes + onEnter idempotency complete. Current VERSION 0.25.4. Zip: sun-v0.25.4-net.zip. 142 scenes.
4. **0.26 Exclusive Crises PACKAGE LOCKED 2026-08-15 (rev 2)** — Ideology router + The Breath They Cost + Custody of Tomorrow. New `scenes-exclusive.js`; single onEnter splice on faction_split; four new flags; death-free; resource-gated with two ungated floors. Ready for one-concern Build ticket. See full lock block near top of this file.
5. **Cascade Allusive insertions** — formally deferred to **0.29**. Do not silently drop.
6. **Vess hair LOCKED 2026-08-16** — long white/silver hair, purple eyes. Confirmed consistent across full approved art set (vess, vess_boarding, vess_offer, vess_intimate, romance_vess_1, afterglow_vess, lingerie_vess, rear_vess, shower_vess). Prior 'dark knife-cut' spec superseded — no regen needed.
7. **amara_tomas re-home** at act3_spine_next (hydro=="full" && both alive) — still open for a light Build ticket if not already present.
8. **reckon_truth** as fourth faction_split option — still open for a light Build ticket if not already present.
9. **Bond exit contract** keyed on recovered.jiro — confirm/apply if still needed for 0.26 spine.
10. **scenes-late.js line count** — 1394; exclusive crises go in their own file. Late-file split remains a future one-concern if needed.
11. **Cross-route awareness** — Vess seed only; mirror for original four deferred to **0.29**.
12. **0.27 Spoken Promises — PARTIAL LOCK** — full package still required before any 0.27 Build. 0.26 precedes.
13. **Post-0.26 follow-ons (distinct tickets):** optional data-driven SPINE assert; concreteRunFacts expansion for breath_answer / custody_answer; optional defensive image fallbacks.
14. Art queue (ART_REQUESTS): pregnancy_check identity-hidden, faction_split regen, recovery/vault plates, **mira_thermal_cut.jpg** (Strong, custody_severed permanent — **ON HOLD** tool-side stall; corridor_variant.jpg live, no regression). Vess portrait set closed. Do not block Build.
15. **Next full Fable codebase review:** after 0.27/0.28 if volume high.
16. **custody_severed permanent art disposition LOCKED 2026-08-16** — dedicated Mira cold-radiation-injury plate approved (`mira_thermal_cut.jpg`). Replaces corridor_variant.jpg hygiene swap once art lands. **Art generation ON HOLD (tool-side stall, not design).** Both 0.26.1 Grok locks closed. Vess bio residual cleaned in 0.26.2.


**Build handoff for 0.16.1:**
```
pm Starting v0.16.1 Crew Bonds (Men) from PROJECT_STATUS.md

Scope:
1. Optional non-sexual bonding beats for Elias, Tomas, Jiro (1–2 each): shared drink, low-stakes game/cards, or quiet competence hang
2. Payoff: trust/affinity + a personal backstory detail; optional soft later option change if cheap
3. Skip is valid; no bonding meter; no loops; no quest log; no sexual content
4. Wire art if present: bond_elias.jpg, bond_tomas.jpg, bond_jiro.jpg (else portraits)
5. Rourke only as memory if used
6. Update VERSION.md + PROJECT_STATUS.md + ART_REQUESTS (scene IDs only) when done

Out of scope: male romance, UI pin-art/white-space (0.20), save (0.19), file split (0.17).
Follow locked Code discipline. Validate after scene changes.
```


**Build handoff for 0.16:**
```
pm Starting v0.16 Persistent Consequence & Symbol Payoff from PROJECT_STATUS.md

Scope:
1. One irreversible “ship remembers” object or systems consequence that persists the whole run (jury-rigged seal that later fails, ration decision that closes a later option, private promise that blocks a public order)
2. Sela yellow-sun payoff as a real branch (not only flavor): motif changes something concrete mid/late
3. Conflicting accounts of Earth departure / boarding / selection — no single clean official truth
4. One ship-forced interrupt while the player is in a personal beat
5. Light polish on thin aftermath / favoritism edges from 0.12–0.15 if cheap
6. Update VERSION.md + PROJECT_STATUS.md + ART_REQUESTS.md (new scene IDs only) when done

Out of scope: permanent 10th crew, combat, management loops, lore codex, UI redesign (0.20), onboarding (0.18), save harden (0.19).
Follow locked Code discipline. One concern per session where possible. Validate after scene changes.
Think Harder recommended for the persistent object and Sela sun branch design.
```

**Also note for playtest of 0.14+0.15:** log white-space-under-choices, status legibility on narrow phones, crew-chip false affordance — feed into **0.20 UI strength**.
