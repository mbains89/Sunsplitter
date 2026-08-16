# FABLE PACKAGE — CASCADE BACKGROUND: ALLUSIVE CREW EVENTS (light density)
Version bind: Grok assigns. Source of truth: artifacts/FABLE_CASCADE_BACKGROUND.md (LOCKED). Shape follows FABLE_0.23_PACKAGES.md.
Session basis: FABLE_BRIEF.md / VOICE_CARDS.md not attached this session; authored against the reconstructed brief and the locked cascade package in-context. Namespace per this ticket: locked keys live under `flags` (flags.manifest, flags.changeorders).

**Disposition of Proposals A and B (deliverable 4, stated up front):** Standalone `boarding_manifest` and the heavy `cascade_records` expansion are **retired**. Their choice cores are folded into Beats 1 and 2 below as insertions into existing touchpoints. No content is lost; the delivery vehicle changes from lore scene to crew moment. Distributed allusion replaces both.

**Phrase ledger for this package:** Sela `"I am the hand-off."` — SPENT (Beat 5). Elias `"Standing question."` — SPENT (Beat 6, single occurrence, consistent with lock note). Tomas `"People were tier four."` — **deliberately NOT spent**; held in reserve for a late Living-aligned reckon or ending per the locked hook. Any draft that spends it before then should bounce in audit.

---

## BEAT 1 — "Two Hundred Columns" (Amara · insertion into `empty_berths`)
*Folded light version of retired Proposal A.*

```
// ============================================================
// BEAT: berths_manifest (insertion into existing empty_berths visit)
// PRECONDITIONS (live predicates, evaluated at render):
//   !state.flags.manifest                       (one-shot via locked key)
//   Variant L: isAlive("amara")
//   Variant D: !isAlive("amara") && her effects reachable (Build confirms
//              the effects touchpoint; if none exists, Variant D is cut,
//              not stubbed)
// STATE WRITES (destination onEnter only):
//   state.flags.manifest = "read" | "declined"        (LOCKED key)
//   RUN_FACT "read":     "read the boarding manifest — two hundred fourteen names"
//   RUN_FACT "declined": "let the manifest stay closed"
// DEATH EXPOSURE: none
// DEAD-SPEECH: Variant D is silent-object only — tablet among her effects,
//   same two choices, same writes, no interpretation, no codes dialogue
// IMAGE: reuse empty_berths. No ART_REQUEST.
// ============================================================
```

**Variant L text.** Amara is at the far end of the berth rows, tablet face-down against her thigh. She doesn't ask why you're here. Nobody asks that, here. "The manifest was in my hands when the alarm sounded," she says. "That's the whole story of how I boarded. I was holding the list." She turns the tablet face-up. She doesn't offer it. She doesn't withdraw it.

- **Read the names.** → The names scroll. Two hundred fourteen confirmed berths. Beside some of them, codes — untaught, unglossed, appearing exactly once. If the Commander asks about the codes: "Sponsor codes. Triage codes. Somebody's shorthand. I've decided not to decide." *(onEnter: flags.manifest = "read"; RUN_FACT.)*
- **Leave it closed.** → She turns it face-down again. "It keeps," she says. It isn't clear the word is about the tablet. *(onEnter: flags.manifest = "declined"; RUN_FACT.)*

**Variant D text.** The tablet is in her effects, face-down, charged out of habit or design. The same two choices, no voice on either side of them. If read: the codes appear, undefined, and there is no one left to not-interpret them.

---

## BEAT 2 — "The Unsigned Pages" (Mira · insertion into `cascade_records`)
*Folded light version of retired Proposal B.*

```
// ============================================================
// BEAT: records_changeorders (insertion into existing cascade_records)
// PRECONDITIONS (live predicates):
//   isAlive("mira")                (beat absent if dead — the finding dies
//                                   undocumented; canon-consistent; no
//                                   orphan variant, no extra key)
//   !state.flags.changeorders      (one-shot via locked key)
// STATE WRITES (destination onEnter only):
//   state.flags.changeorders = "logged" | "buried"    (LOCKED key)
//   RUN_FACT "logged": "entered the commissioning gap into the record"
//   RUN_FACT "buried": "kept change orders 4417 and 4491 out of the record"
// DEATH EXPOSURE: none
// DEAD-SPEECH: n/a (base scene unchanged when gate fails)
// IMAGE: rides cascade_records' current plate; adds no image dependency,
//   does not block on the flagged regen. No ART_REQUEST.
// ============================================================
```

**Text.** Mira has the commissioning log open — to the unsigned pages, the way she keeps it. "Schedule compressed twice in the last month. Change orders 4417 and 4491. Justification field empty on both. That's not a conclusion. It's a gap where a reason should be." She sets the log where the record terminal can image it, or not. Her hands wait.

- **Enter it into the record.** → "Entered. It proves the schedule moved. Nothing else. I want that on the same line." *(onEnter: flags.changeorders = "logged"; RUN_FACT.)*
- **Leave it out.** → "Understood." She closes the log. She does not close it all the way. *(onEnter: flags.changeorders = "buried"; RUN_FACT.)*

*Projections-lane rule restated for Build: this beat must never gain a reference to Jiro's contingency file, and Beat 4 must never gain one to these change orders.*

---

## BEAT 3 — "The Bolts" (Tomas · quiet insertion, cargo hold / vault space)

```
// ============================================================
// BEAT: hold_bolts (insertion into a Tomas quiet/hold touchpoint;
//   post-Green-Tether slot preferred if recovery gating applies — Build binds)
// PRECONDITIONS (live predicates):
//   isAlive("tomas")   (+ isRecovered("tomas") if the host slot requires it)
//   One-shot: rides the host's own one-shot; no new key
// STATE WRITES: none (pure texture)
// DEATH EXPOSURE: none    DEAD-SPEECH: beat absent if gate fails
// IMAGE: reuse vault.jpg (locked-good plate). No ART_REQUEST.
// ============================================================
```

**Text.** Tomas is torquing the vault's deck bolts. They don't need it. He does it anyway, on a schedule only he keeps. "I bolted this down myself. Mass margin said the vault or the second printer. The vault doesn't eat. We do." He tips his slate: the load-out deviation, his signature at the bottom of it. "Somebody signed that trade, and it was me."

- **"You'd sign it again?"** → "Ask me on a day the trays are full. You'll get a cleaner answer, and it'll be worth less."
- **Say nothing.** → "Check the torque yourself if you want. The bolts hold. That was never the question."

*Reserve note: the tier-four phrase does not appear here and must not be added in revision.*

---

## BEAT 4 — "Night Shift" (Jiro · insertion into an `observation` off-hours slot)

```
// ============================================================
// BEAT: observation_nightshift (insertion into existing observation
//   quiet/off-hours touchpoint — Build binds)
// PRECONDITIONS (live predicates):
//   isAlive("jiro")
//   One-shot: rides host's one-shot; no new key
// STATE WRITES: none (pure texture; the declined invitation is priced
//   for a future private beat, deliberately left cold — see hooks table)
// DEATH EXPOSURE: none    DEAD-SPEECH: beat absent if gate fails
// IMAGE: reuse observation (or corridor_variant if host differs). No ART_REQUEST.
// LANE RULE: no reference to Mira's change orders, ever, in this scene.
// ============================================================
```

**Text.** Jiro has charts spread under the observation glass, working by less light than the work needs. "Alignment sims run at night. Still do. The sky picked the night shift once; I keep the shift out of superstition." He squares a printout without looking up. "The burn we flew was computed nine weeks before the cascade. Contingency file. Somebody asked for it in June. Name's not in the header."

- **"Then ask. Out loud. Now."** → "Not tonight. Position I can give you to the meter. Cause is not my column." A beat. "Not tonight."
- **Let it lie.** → He rolls the chart. The tube of it makes a sound like a door that closes politely.

---

## BEAT 5 — "The Stencil" (Sela · insertion adjacent to the lamp/filter texture)

```
// ============================================================
// BEAT: filters_stencil (insertion into a Sela quiet touchpoint adjacent
//   to the ritual texture — NOT inside the locked ritual prose; Build binds
//   a before/after slot)
// PRECONDITIONS (live predicates):
//   isAlive("sela")
//   One-shot: rides host's one-shot; no new key
// STATE WRITES: none (pure texture)
// DEATH EXPOSURE: none    DEAD-SPEECH: beat absent if gate fails
// IMAGE: reuse existing Sela quiet plate. No ART_REQUEST.
// PHRASE: spends "I am the hand-off." — single-owner, single-use, spent here.
// ============================================================
```

**Text.** Sela is drawing a filter from the crate. The stencil on its side gives a congregation's name and a quantity meant for thousands. She sees you reading it and doesn't cover it. "I carried the congregation's crate through the tube, and the tube closed. I was meant to hand it off and walk back. The hand-off did not occur. I am the hand-off."

- **"Luck, then."** → "They will say luck, or they will say selection. I decline both. Something was asked of me, and I have not yet been told what."
- **Say nothing.** → She seats the filter and says its count aloud — just the number — the way one says a name at a graveside, when the name is all that's left to say.

---

## BEAT 6 — "Eighty Seconds" (Elias · insertion into a post-crisis private aftermath)

```
// ============================================================
// BEAT: aftermath_seal (insertion into an existing post-crisis quiet /
//   private aftermath slot — Build binds; any crisis qualifies)
// PRECONDITIONS (live predicates):
//   isAlive("elias")
//   One-shot: rides host's one-shot; no new key
// STATE WRITES: none by default. CONDITIONAL KEY flagged for Grok (see §GROK):
//   flags.elias_question = true on the first branch — lock ONLY if the
//   future obedience/defiance beat wants a gate; otherwise this beat
//   deliberately writes nothing and the hook stays cold.
// DEATH EXPOSURE: none    DEAD-SPEECH: beat absent if gate fails
// IMAGE: reuse corridor_variant (lone-figure workhorse). No ART_REQUEST.
// PHRASE: "Standing question." appears once, owner's mouth, per lock note.
// ============================================================
```

**Text.** Elias is re-checking a seal that doesn't need checking. He hears you and doesn't stop. "The countdown said ninety. I sealed at eighty." The wheel takes a quarter turn it didn't have to give. "There were faces in the tube glass. I knew four of them. That is the whole report."

- **"Whose order was it?"** → "Flagged station command. Station command had been dead an hour by the debris log. So whose order did I follow." He sets the wheel. "Standing question." *(onEnter: flags.elias_question = true — ONLY if Grok locks the conditional key; else no write.)*
- **"The seal held."** → "The seal held. That is what I am for." He moves to the next seal that doesn't need him.

---

## DEFERRAL — Lena "Disposition" (named, not drafted)
Lena's locked hook specifies a **late** private moment (she finishes exactly one disposition on the forty-one-name list, one word, unshown). This ticket is early/mid texture; drafting her beat now would spend a late payoff early. Deferred to a late-act private-moments ticket with this host proposal: her existing late quiet/medbay touchpoint, gate `isAlive("lena")`, no writes, the word never rendered. Her boarding lines ("mid-sentence," "wrong distance from the hatch") stay unplaced until then.

---

## SURFACING TABLE (deliverable 2)

| Beat | Locked insight / object / phrase surfaced | Later-surface hook status |
|---|---|---|
| 1 Two Hundred Columns | Amara's manifest tablet; 214 berths; annotation codes; "decided not to decide" | ENABLED: political lane gains a witnessed artifact; one conditioned crew-cited line in existing reckon/record scenes on `flags.manifest=="read"` (Build, same ticket); "let the manifest stay closed" is a live What Remains citation |
| 2 Unsigned Pages | Mira's open log; COs 4417/4491; gap-where-a-reason-should-be | ENABLED: one conditioned line downstream on `"logged"`; `"buried"` becomes withheld-speech texture in her later private beats — no key needed, the flag itself carries it |
| 3 The Bolts | Tomas's deviation signature; vault-vs-printer trade; lifters that never left the ground (implied, not stated) | HELD: tier-four phrase reserved for late Living reckon/ending; his signature object logged as What Remains candidate |
| 4 Night Shift | Jiro's contingency file; June request; missing header name; "stopped asking out loud" | PRICED, LEFT COLD: the declined "not tonight" invites a future private beat where the Commander asks again; no state, by design |
| 5 The Stencil | Sela's crate + stencil; hand-off account; lane refusal | SPENT + ENABLED: "I am the hand-off." spent; her accept-a-framing question remains open for late meaning beats |
| 6 Eighty Seconds | Elias's seal at eighty; four faces; dead-command flag; "Standing question." | ENABLED (conditionally keyed): voiced question prices the late obedience/defiance beat; gate key pending Grok |
| — Deferred | Lena's triage list, forty-one names | DELIBERATELY COLD until a late ticket |

Lanes check: official lane untouched (correct — it needs no help); political (1), projections axis A (2), Living/manifest-priority (3), projections axis B (4), luck-refused (5), security (6). No beat confirms or eliminates any lane; Beats 2 and 4 carry the synthesis ban in their headers.

---

## PLACEMENT NOTES (deliverable 3 — proposals only; Grok/Build bind)

- Beat 1: fires inside `empty_berths` on first qualifying visit; if the berths are visited repeatedly, host's own one-shot plus `!flags.manifest` double-gates safely.
- Beat 2: inside `cascade_records`, after the base scene's existing content, before exit.
- Beat 3: any Tomas hold/quiet slot; post-recovery slot preferred where Green Tether gating exists.
- Beat 4: `observation` off-hours or Last Off-Shift-eligible window if one is natural for Jiro — eligibility per existing decision 7 set, not extended here.
- Beat 5: adjacent to (never inside) the locked lamp-ritual prose; a pre-ritual slot reads best.
- Beat 6: first post-crisis private aftermath that has Elias alive and present; content is crisis-agnostic on purpose.
- Total new prose across all six beats is under two pages — density target met; no beat exceeds one screen with choices.

---

## GROK LOCK LIST

- **No new keys required for Beats 1–5.** Beats 1–2 use the locked `flags.manifest` / `flags.changeorders`; Beats 3–5 ride host one-shots and write nothing.
- **One conditional key:** `flags.elias_question = true` (Beat 6, first branch). Lock only if the future obedience/defiance beat will gate on it; if Grok prefers the hook cold, strike the write and the beat stands unchanged.
- **Phrase ledger to record:** Sela's and Elias's minted phrases spent in this package; Tomas's reserved — please carry the reserve forward in PROJECT_STATUS so a future session doesn't spend it casually.
- **Downstream conditioned lines** (one each, on `flags.manifest=="read"` and `flags.changeorders=="logged"`): confirm they ride these tickets or are struck; beats stand alone either way.
- **Retirement of Proposals A/B** as standalone scenes: confirm and mark retired in PROJECT_STATUS to prevent a future Build ticket resurrecting the heavy versions.

## OPEN QUESTIONS (Grok / Build)

1. Does an Amara-effects touchpoint exist for Beat 1 Variant D? If not, Variant D is cut entirely — `flags.manifest` then simply never writes on Amara-dead runs, which is acceptable (the manifest question dies with its keeper).
2. Host confirmation for Beats 3–6 (named slots above). Any beat without a natural host converts to a one-screen micro-scene and would then need a one-shot key — flagged now so it's a known cost, not a surprise.
3. Beat 3 recovery gating: confirm whether the hold slot is reachable pre-recovery in the current spine.
4. Session basis: brief and voice cards were not attached; one line from Grok confirming no lock moved since the cascade package.

Voice audit: separate session, per rule. The writer has not audited these beats.
