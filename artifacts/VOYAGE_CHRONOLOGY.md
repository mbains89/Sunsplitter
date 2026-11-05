# Sunsplitter — Private Voyage Chronology

`SOURCE main@8d23109 · RUNTIME ec9fa84 · TASK SUN-V033-PX6-VOYAGE-CHRONOLOGY-01 · MODE implementation`

- Acting role: Build / GPT-Codex, continuity-source implementer
- Implementation authorized: yes, bounded to ROADMAP PX-6 and one GitHub PR
- Authority read: `AGENTS.md`, `artifacts/ROADMAP.md`, `artifacts/PROJECT_STATUS.md`, `artifacts/LOCKS.md`, `artifacts/FABLE_BRIEF.md`, `artifacts/FABLE_CASCADE_BACKGROUND.md`, `artifacts/FABLE_CASCADE_ALLUSIVE.md`, `artifacts/CHARACTER_BIBLE.md`, and `artifacts/SCENE_SKELETON.md`
- Runtime inspected: all 222 registered scenes in `src/scenes-01.js` through `src/scenes-55.js`, plus `src/state.js`, `src/engine.js`, `src/validate.js`, and the living, future, and pragmatic simulated paths
- Audience: internal writers, reviewers, and Build only. This is not player-facing lore, a clock, a voyage meter, a new state system, or proof that an ending has occurred.

## 1. How to use this source

Every later prose ticket must cite this file and the exact section or row it relies on. Use this form in the ticket or PR:

`CHRONOLOGY: artifacts/VOYAGE_CHRONOLOGY.md §<section-or-row> @ <runtime-sha7>`

The runtime scene graph controls order. This document controls continuity interpretation at `ec9fa84`. If later runtime bytes change an anchor, the same ticket must update this source or record why the existing row still holds.

Timing statements have five evidence classes:

| Class | Meaning | Writer rule |
|---|---|---|
| **HARD** | Explicit elapsed duration or deadline in rendered runtime prose | Preserve exactly unless a separately dispatched correction changes it. |
| **RELATIVE** | Exact only from a named local event, not from launch | Cite both endpoints; never convert it into an absolute voyage day. |
| **BACKGROUND** | Before the playable voyage or belonging to another ship/person | Never add it to voyage elapsed time. |
| **ORDINAL** | Scene-graph order with no safe numeric gap | Preserve before/after order; do not invent hours or days. |
| **UNRESOLVED** | Current prose lacks a common clock basis | Repeat the literal only when necessary and do no arithmetic until ruled. |

The game has no universal day counter. Optional scenes can add separate hours or cycles, and several explicit intervals overlap. Therefore this source defines a partial order and minimum intervals, not one fabricated timestamp for every scene.

## 2. Master chronology

| Row | Phase and required order | Timing anchors | Continuity boundary |
|---|---|---|---|
| **VC-00** | Pre-cascade and boarding background | Jiro's contingency burn was computed **nine weeks before the cascade**; the public cascade account is **hours to roughly two days**; Tube 3 sealed at **04:19:07**. Vess's six years alone belong to Dawnbreak history. | **BACKGROUND.** None of these durations starts the playable voyage clock. The Commander's boarding remains unspecified. |
| **VC-01** | `wake` → Rourke outcome → `intro_lena` | Rourke will not last the hour. Company route: death **twelve minutes later**. Attempt route: Lena works **forty-three minutes**. Other routes remain inside the opening emergency. | **HARD/ORDINAL.** Treat the opening as one emergency interval. Do not insert sleep, a shift change, or healed injuries between wake and the introductions. |
| **VC-02** | Introductions → first priorities → crew walk/leadership/power work | Status estimates food and water at **maybe five weeks** under hard rationing. Repairs can consume the **next cycle without sleep**. Power cuts can be ordered for the **next week**; coolant can buy **three weeks**; a structural patch is advertised for **months**; food conversion adds **ten days**. Planet search may return **hours later** with a provisional **fourteen-month** route at current thrust if drive is restored. | **RELATIVE/UNRESOLVED.** These are forecasts or purchased margins, not shared timestamps. The five-week figure is an estimate at status. “Current thrust” is not reconciled with the primary drive being offline, and the fourteen-month figure is not yet Jiro's later verified insertion solution. |
| **VC-03** | `time_pass` → lower-ring crisis → `aftermath` | **Days pass** before the alarm. Ration route says the trapped crew had been on reduced oxygen for **two days**. The decision window is **under four minutes**. Cut route can trigger a secondary cascade **twenty minutes later**. Self-risk route puts the Commander in medical for **the next day**. | **HARD/RELATIVE/UNRESOLVED.** “Two days” describes prior reduced oxygen, not two days trapped behind the bulkhead, but the earlier ration choice names food/water rather than oxygen. Any post-self-risk scene must allow the one-day medical recovery before the Commander acts upright. |
| **VC-04** | Aftermath → Lena clock/private offer or promise → transmission → arc/vault decision → first intimacy window | Lena states that exposure from earlier work left her with **months, not years**. Current reachable pre-crisis prose does not establish that exposure. First private offers occur after the crisis and before the tether. The intimacy hub explicitly permits more than one private hour before the next fracture. A Deck 4 alarm may interrupt one such hour. | **ORDINAL/UNRESOLVED.** Preserve Lena's terminal condition but do not invent its cause; see PX6-F01. Each chosen private route occupies its own interval. Never compress every accepted route into one simultaneous night, and never imply an unchosen route occurred. |
| **VC-05** | Tether sighting → Tomas recovery → manifest truth/lie | The annex tumbles in **nine hours**; suit prep takes **one hour** and the decision is due in eight. Water-match route: vent **eleven minutes**, match in **forty minutes**, rider launch in twenty. Hard intercept launches in ten. Soft dock takes **eight minutes**. Tomas ate named seed on **day forty-one**, so his rescue cannot precede that day in his annex survival record. If the breach-loss lie is filed, Amara confronts it **two days later**. | **HARD/RELATIVE.** Day forty-one is Tomas's annex-survival label; current prose does not explicitly name its epoch. Preserve it verbatim and use it only as a lower bound on his isolation. Triage follows docking before later crises. |
| **VC-06** | Jiro pattern discovery → heading decision → burn → six-hour cut → one-hour briefing | Jiro's corrections repeat every **six hours** and have run for **nineteen days**. Available telemetry may be **eleven days old**. Mira asks for **forty minutes**; Tomas can win **one full cycle**; burn occurs at the top of the hour for **ninety seconds**. Opening the blister takes **six hours**. Jiro has hand-run positions every **four hours** for nineteen days. His briefing is requested in **one hour**. | **HARD/RELATIVE.** The nineteen-day isolation/pattern ends at Jiro's recovery. A delayed burn adds one full cycle. Do not portray Jiro as rested or medically restored before the briefing; he emerges hypercapnic and dehydrated and immediately reports. |
| **VC-07** | Jiro briefing/night shift → implied passage → Lena clock package → vault face/third watch | Jiro gives an arrival window labeled **day 181 through day 184** and one pass. Lena's prognosis is **ninety to one hundred twenty cycles**. Her red-limit crisis is graph-adjacent but physically requires an unrendered passage; its exact duration is route-dependent, and regenerative treatment can buy months without curing her. The vault-face scene occurs on **third watch** after the Lena package. | **UNRESOLVED/ORDINAL.** The epoch for “day 181” is not defined. Do not subtract it from launch, Tomas day forty-one, Vess's eleven months, or Lena's cycles. Future connective prose must leave a passage between prognosis and red limit without claiming an exact duration the runtime does not establish. |
| **VC-08** | Vess signal → docking → first full watch → Vess offer/transmission/intimacy | The carrier has been in the noise floor for **eleven months**; Vess says the hull ID has been in her night log for **eleven months**. She has survived alone for **six years**. Her offer arrives **before the first full watch is over**. Offer acceptance writes Vess relationship state before the transmission decision. “Keep the window” returns with no intimacy; only “Give her the window” reaches `vess_intimate` and consumes **one hour**. | **HARD/BACKGROUND/UNRESOLVED.** Six years is Dawnbreak history. Eleven months is a relationship between first detected hull identity and boarding; its start is not explicitly equated to launch. Do not use it to solve VC-07's day-number basis. Later reflection must distinguish offer acceptance from the private hour; see PX6-F03. |
| **VC-09** | Post-Vess `act3_spine_next` optional bonds/warmth/group intimacy → pregnancy check → Tomas/Elias/Mira lethal packages | Each selected bond/private option is a distinct quiet interval. The route may take several before “Continue.” Tomas's suit has **nine minutes** against a **twelve-minute** manual reseat. Coolant previously bought **three weeks**, which are spent by Mira's late cross-feed. Elias has **six minutes** to habitation; Mira has **twelve minutes** to the pressure envelope. | **ORDINAL/HARD.** Do not call all optional scenes the same watch. Late lethal packages occur only after their foreknowledge and recovery beats; lethal outcomes are final, with no later healing or present-tense participation. |
| **VC-10** | Exclusive Breath or Custody crisis → route-specific promise tests → Last Off-Shift | On Breath, the crisis resolves before the eligible Amara test and then the Elias/Lena/Mira ladder. On Custody, Sela is tested before the hub and Tomas after the answer, followed by the Elias/Lena/Mira ladder; Amara's Breath-only test is skipped. Promise consequences may extend this phase: Deck 4 suppression surfaces **eleven days later**; Lena-line survival can surface **two days later** or within **one day**; a direct-authority changeover takes **one hour**; several public results land by **second shift**. After the routed tests, Last Off-Shift gives exactly **one hour** to one living route. | **RELATIVE/ORDINAL.** Add only the intervals belonging to the selected crisis and promise path. Do not flatten the two final-crisis routes into one test order. Off-Shift happens after the routed promise tests, never before them. |
| **VC-11** | `faction_split` → reckoning → sun/ship-memory payoff → final choice → ending | The crew takes stock **before the final order**. `reckon_truth` still describes the destination as **fourteen months** away after Jiro has supplied day 181–184 and one threading pass. A weak Deck 4 patch may have hummed near tolerance for **days** before the final course load. | **ORDINAL/CONFIRMED MISMATCH.** See PX6-F02. The ending choice commits direction; it does not prove immediate landing. Never write same-day landfall, healed late injuries, or a completed fourteen-month passage unless a later scene explicitly advances and proves it. |

## 3. Minimum-duration and overlap rules

The total playable voyage duration is **not numerically solvable** from current prose. The following constraints are safe:

1. Rourke's opening outcome consumes minutes and closes before the introductions.
2. The lower-ring crisis follows an unnamed multi-day passage.
3. Tomas's annex record has reached day forty-one before he is recovered.
4. Jiro's repeating correction record covers nineteen days immediately before his recovery; this may overlap other voyage phases.
5. Vess observed the hull identity for eleven months before boarding; current prose does not identify that observation's epoch with launch.
6. Optional private/bond/warmth scenes are sequential one-shot intervals. Selecting four hour-framed scenes adds four separate hours, not one shared hour.
7. Promise-result delays add only on routes where that promise is made, survives to its test, and takes the relevant branch.
8. “Day 181–184,” “fourteen months,” “ninety to one hundred twenty cycles,” and Vess's eleven months do not share a proven zero point. No writer may reconcile them by assumption.

## 4. Recovery and injury ledger

| Person | Injury/recovery anchor | Earliest safe later portrayal |
|---|---|---|
| Commander | Lower-ring self-risk causes exposure, weakness, and one day in medical. | Upright after that day; residual weakness may remain. Do not place a same-day command scene on this branch. |
| Rourke | Dies in the opening on every route. | Never recovers or participates. Later references are body, record, cause, or memory only. |
| Lena | Her terminal condition is revealed after the lower-ring crisis, but the stated earlier-work exposure has no reachable antecedent. Later prognosis is 90–120 cycles. Regenerative treatment buys months but is not a cure or second dose. Successful sterile/power stabilization clears the active `dying.lena` red-limit state without curing the underlying exposure. | She may keep working while alive; never invent the missing exposure, write recovery/remission, or silently reactivate an acute red-limit clock after successful stabilization. A future correction must establish or replace the cause explicitly. |
| Tomas | At least forty-one annex days, malnourished and lamp-burned; receives fluids immediately after docking. | Jiro and Vess follow ordinally, but their retrospective clocks do not prove substantial healing time for Tomas. Preserve the permanent squint and lived recovery debt unless later prose explicitly advances recovery; do not call him fully restored. |
| Jiro | Nineteen days on a closed air loop, hypercapnic and dehydrated; six-hour cut precedes extraction. | He can brief in one hour because runtime requires it, but prose must show depleted hands/body. Later work may show function, not miraculous healing. |
| Vess | Six years closed-loop alone; Lena flags hypercapnia and possible calcium loss. | Her first offer occurs before the first full watch ends, so physical/social fragility remains. Never imply medical normalization before that offer. |
| Mira | Custody sever route creates cold-radiation injury carried for the rest of the voyage; later Off-Shift shows one hand for heat-reading and the other for holding. | No later prose may restore both hands or erase the injury. If she dies at the phase board, all subsequent presence is record/memory only. |
| Elias | A lethal B-four hold outlasts suit feed and ends before safe opening. | No rescue or later present-tense action on that branch. |
| Amara, Sela, or Jiro in vent/service-pocket routes | Authored death occurs on scene entry. | No subsequent speech, vote, pairing, effect, or recovery. |

## 5. Promise chronology

| Promise family | Made before | Test/payoff timing | Continuity rule |
|---|---|---|---|
| Amara — no living person vented | Early quiet route or later intimate afterglow | During the final Breath service-pocket/vent consequence | If Amara dies in the earlier lower-ring vent, the promise remains untested `made` under L-024 and is omitted from reflection. If she lives to the authored test, keep/break resolves before Off-Shift. |
| Elias — first word on Deck 4 | Deck 4 record returns at 0300 | Kept result is public by second shift; suppressed record surfaces eleven days later | The eleven-day branch creates a real late-phase gap. Do not place immediate final reckoning before that result. |
| Lena — never kill another to keep her | After lower-ring diagnosis, with or without intimacy | Shared medical-line test; kept patient surfaces two days later, while broken Lena is awake within the day | Her terminal condition persists through either branch. The earlier active `dying.lena` red-limit state may already have been cleared by successful stabilization; do not equate that clearance with a cure. |
| Mira — living decide the future | Early quiet/private route | Custody directive test; authority changeover takes one hour if broken | This is governance time, not healing time. |
| Sela — no one makes her the price of fear | Early quiet/private route | Custody/public-pressure test in the final crisis ladder | Her adult boundary and ritual timing remain separate from the promise test. |
| Tomas — living receive mercy first | After Tomas recovery, or at Off-Shift fallback | Early-made promise is tested before the final crisis; Off-Shift-only vow resolves immediately as kept/declined because no later test remains | Never leave an Off-Shift promise in untestable `made` state. |

## 6. Prose rejection checks

A later prose ticket fails PX-6 continuity if it does any of the following:

- invents a universal voyage day, countdown, calendar, clock UI, or state key;
- treats an **UNRESOLVED** number as launch-relative or performs arithmetic across unproven epochs;
- puts two separately chosen one-hour scenes into one simultaneous hour;
- places the Commander back on duty during the self-risk medical day;
- makes Tomas fully healthy immediately after docking, Jiro rested before his one-hour briefing, or Vess medically/socially normalized before her first watch;
- cures Lena's terminal condition, silently reactivates or clears her acute red-limit state, restores Mira's cold-radiation injury, a spent regenerative, a lost drive/hull margin, or a dead character;
- lets a promise consequence land before it is made/tested or skips its explicit two-day, eleven-day, one-day, one-hour, or second-shift interval;
- describes landing as completed at `final_choice`; or
- adds player-facing chronology, a new story volume, ART-R2 wiring, or any mechanic outside the cited prose concern.

## 7. Confirmed defects and unresolved clock bases

These are findings, not dispatched correction-ticket identities:

### Confirmed correction candidates

1. **PX6-F01 — Lena exposure antecedent:** `aftermath` says exposure from earlier work permanently damaged Lena, but no reachable earlier scene exposes her. Preserve her terminal condition; a later one-concern ticket must establish or replace the cause without inventing a new injury system.
2. **PX6-F02 — corrected approach reverts to fourteen months:** Jiro's recovery produces day 181–184 and one threading pass, but `reckon_truth` later returns to “Fourteen months” with no reconciliation. A later one-concern prose ticket must make the late line consistent with the verified approach while preserving uncertainty and no immediate-landfall claim.
3. **PX6-F03 — Vess offer acceptance is reflected as intimacy:** accepting Vess's offer writes `romance.vess = true`, but “Keep the window” can return without setting `flags.vess_intimate`; What Remains nevertheless says the private line was crossed. This is the chronology/history side of PX5-D06, not authority for a duplicate ticket.
4. **PX6-F04 — Amara/Tomas relationship is omitted from reflection:** the relationship can occur and is represented in reckoning, but `whatRemainsRelationalFact()` checks only five solo romance keys. This is the chronology/history side of PX5-D07, not authority for a duplicate ticket.

### Unresolved clock bases

1. **PX6-U01 — Jiro day basis:** `act3_reckoning_briefing` gives day 181–184 but never names day zero.
2. **PX6-U02 — Vess contact basis:** Vess's eleven-month hull log and the carrier's eleven-month noise-floor history do not explicitly identify their start with launch.
3. **PX6-U03 — destination estimates:** the provisional fourteen-month route and Jiro's day 181–184 corridor do not share a calculation basis even after PX6-F02's later relapse is separated out.
4. **PX6-U04 — reduced-oxygen cause:** the ration path says trapped crew had reduced oxygen for two days, while the earlier priority explicitly rations food and water.
5. **PX6-U05 — propulsion language:** the early route says fourteen months at current thrust while status says the primary drive is offline.
6. **PX6-U06 — Lena passage:** the scene graph places her red-limit crisis directly after Jiro's briefing package, while the 90–120-cycle prognosis requires an implied passage whose exact length is not rendered.

Until separately ruled, preserve unresolved literals locally and do not write connective arithmetic. PX6-F01 through PX6-F04 are correction findings only, not authority to edit runtime under this ticket. PX6-F03 and PX6-F04 must be reconciled to their existing PX5 dispositions rather than minted again. This source does not silently choose canon that the runtime has not established.

## 8. Verification boundary

- No gameplay, scene, state, schema, art, version, lock, status, release, or deployment byte is changed by this chronology.
- L-002 and L-007 control permanent canon and the PX sequence. L-004 / ART-R2 remains held and unwired. L-025 remains locked. PR 45 and PR 46 remain held.
- `NO-PUBLISH / NOT_CERTIFIED` remains controlling; last certified baseline remains `0.28.1d`.

Next action: Grok/program office dispatches at most one confirmed PX6-F01 through PX6-F04 correction concern, reconciling PX6-F03/PX6-F04 to PX5-D06/PX5-D07; every later prose implementer cites the relevant VC row at its exact runtime.
