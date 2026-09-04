SOURCE main@8d23109 · RUNTIME 1a8e8a5 · TASK SUN-PLAYTEST-ART-EVENT-AUDIT-01 · MODE implementation

Build / launch node, sole isolated writer. Owner Sun Playtest closed 2026-09-03
~9:16 PM CT; GitHub issue
[148](https://github.com/mbains89/Sunsplitter/issues/148). ART-R2 / Grok plate
gate opened by Orchestrator for this follow-up only. **NO-PUBLISH /
NOT_CERTIFIED**. Last certified remains `0.28.1d`. Do not mint 0.36. Do not
remint PIN-02 / Netlify pin `a91a26d`. Do not remint 107–147. Do not touch
PR 45/46. Do not reopen L-025–L-028.

## Authority

- Main authority: `8d23109b63b844e0703fb36643f14b91b8800c90`.
- Write-lane predecessor: `1a8e8a5cd2255350329f3861ef7d881c1a1aa6a6`
  (`version/0.30.1-main-reconcile-ci.1`).
- Files read this session: GitHub `main` AGENTS, ROADMAP, PROJECT_STATUS,
  LOCKS; lane STATUS/LOCKS/ART_RULES/ART_REQUESTS; issue 148; named scene
  modules; `src/state.js` image map; `src/engine.js` resolve + cinematics;
  `src/scenes-55.js` living-cast; in-tree JPEG bytes for candidate plates.
- Implementation authorized by the launch `/goal`. One concern: event→image
  audit, one CONFIRMED in-tree retarget, Grok brief stubs. No crew UI, no
  white-space, no tutorial, no binary generation.

Documentation delta vs stale GitHub-main STATUS (2026-08-19 recovery
bootstrap): lane STATUS is current; named here, not a stop.

## Owner standing brief rule (2026-09-04)

Unique plate per event beat — never official portrait as stand-in.

Each Grok instruction must include:

1. Identity refs: official face + bodysuit (+ body_ref front/back when approved)
2. Style bible paragraph (consistent rendering)
3. Full event prose / beat verb (who, where, action)
4. **Body + facial language** that matches the event (posture, hands, gaze,
   expression — grief/argument/intimacy/work/etc.). Ban neutral portrait pose
   in event scenes.

Canon still **PASS/HOLD/REJECT** before wire. This ticket does not wire
any new plate. Grok briefs live in
`artifacts/GROK_BRIEFS_PLAYTEST_ART_EVENT_AUDIT_01.md`. The STYLE/IDENTITY
template and every `NEEDS_GROK_PLATE` stub repeat this rule.

### Portrait identity-lock (standing)

Every `NEEDS_GROK_PLATE` stub includes this block:

- Attach/cite the official **bodysuit portrait path** as the **sole face
  reference** for that character (`images/bodysuit_<who>.jpg`). Tank-top
  `images/<who>.jpg` may confirm identity; it is not a substitute event plate
  and not the face to copy.
- Exact likeness: same face geometry, age, skin, hairline, eye shape, scars/marks. No beautify, no age shift, no ethnicity swap.
- Bodysuit silhouette matches that reference unless this beat explicitly changes clothes.
- Name who **must appear** / **must not**. Ban portrait-as-stand-in and
  "generic crew."
- Scene verb + full event prose remain required.
- QA: REJECT if the face does not read as the same person as the official
  bodysuit portrait at thumbnail size.

Beats with no named face (intro cascade, landfall) still carry the block and
set sole face reference path to none — do not attach a crew bodysuit as a
stand-in.

`body_ref` front/back: **NOT_APPROVED** in this tree (no `body_ref_*` files).
Identity refs for this ticket are official face + bodysuit only. Do not invent
a body_ref path. Pack note `SUN-ART-BODY-REFERENCE-01` (below) plans later
owner-approved full-body refs; this PR does not generate or wire them.

Post-0.35 / pre-0.36 ordered follow-ups (0.36 not opened):
`artifacts/SUN_PLAYTEST_RESPONSE_PLAN.md`.

## Closed table

Pixel inspection, not filename inference. Portrait stand-ins are
`NEEDS_GROK_PLATE`, not invented retargets. Face-revealing Commander plates
stay unwired (L-025). Discarded Vess identity plates stay on disk; this ticket
does not unwire them as a campaign.

| Scene id | Current living image | Disposition | Why |
|---|---|---|---|
| `romance_lena_1` | `images/observation_bridge_alt_2.jpg` | **NEEDS_GROK_PLATE** | Empty damaged blister. Event is Lena taking the Commander's hand in the observation blister, clinical/raw, line still intact. `romance_lena_1.jpg` remains face-revealing Commander; do not wire. |
| `romance_mira_1` | `images/quiet_mira.jpg` | **NEEDS_GROK_PLATE** | Clothed Mira at a console, arms crossed — not clothes-off against the console. `romance_mira_1.jpg` remains face-revealing Commander; do not wire. Keep current stand-in until Grok plate PASSes. |
| `romance_amara_1` | `images/hydroponics.jpg` | **NEEDS_GROK_PLATE** | Person-free grow trays (owner: empty bay). Searched unwired explicit Amara assets: `romance_amara_1.jpg` is wet-corridor kiss with a male Commander face (L-025 REJECT). `shower_amara.jpg` is shower linger, not tray sex. `hydroponics_amara.jpg` / `quiet_amara.jpg` are clothed leaf/tray work (pair_favor / quiet). No honest in-tree explicit-trays plate. |
| `pursuit_lena` | `images/lingerie_lena.jpg` | **NEEDS_GROK_PLATE** | Nude blonde + stethoscope, not lingerie under an open medical coat at the regenerative drawer. Face/hair also drift from official `lena.jpg`. |
| `pursuit_amara` | `images/lingerie_amara.jpg` | **NEEDS_GROK_PLATE** | Nude Amara with a glow rod, not work-lingerie locking the bay and opening the purge panel. |
| `prom_make_lena_ag` | `images/afterglow_lena.jpg` | **NEEDS_GROK_PLATE** | Solo afterglow portrait looking at camera. Event is her head on the Commander's chest, listening to heartbeat, issuing the kill-line promise. |
| `prom_r_amara` | `images/quiet_amara.jpg` | **ALREADY_OK** | Amara at trays with a leaf; promise response returns her to the trays. Art matches the beat. Romance-gate finding is separate (below). No retarget. |
| `bond_mira` | `images/quiet_mira.jpg` (was `mira.jpg`) | **RETARGET_IN_TREE** | Official portrait stand-in. `quiet_mira.jpg` is living Mira at an engineering console — honest for the drive-schematic hour. Same bytes already used by `romance_mira_1` / `offshift_mira`; sharing is interim, not a unique intimate plate. |
| `bond_tomas` | `images/bond_tomas.jpg` | **NEEDS_GROK_PLATE** | Cards + bottle match the event; identity does not match official `tomas.jpg`. Do not retarget to the portrait (loses the game). Regen the event composition from official face+bodysuit. |
| `hold_bolts_again` | `images/vault.jpg` | **NEEDS_GROK_PLATE** | Empty vault racks / corridor stand-in. Event is Tomas still at the vault bolts answering whether he would sign the trade again. No Tomas-at-bolts plate in tree (`work_elias.jpg` is Elias; `quiet_tomas.jpg` is crate grief; `tomas_break.jpg` is bloodied). |
| `warmth_meal` | `images/hydroponics.jpg` | **NEEDS_GROK_PLATE** | Empty trays, no meal, no people. Beat is Tomas serving a shared first grown meal (or paste at empty racks). Group honesty: ≤2 identifiable faces; Tomas is living-cast required. Do not invent a nine-face table. |
| `vess_boarding` | `images/vess_boarding.jpg` | **NEEDS_GROK_PLATE** | Standing corridor portrait, not climbing through an ugly hard dock. L-029 discarded this file as porcelain Vess identity; this ticket does **not** unwire it as a campaign. Regen from official `vess.jpg` + `bodysuit_vess.jpg`. Keep current wiring until PASS. |
| `past_leak` | `images/elias.jpg` | **NEEDS_GROK_PLATE** | Official portrait stand-in. Event is Elias waiting outside the blister with the ground-decision records, quiet threat. `work_elias.jpg` is panel repair, not this confrontation. |
| `ending` / Landfall | `images/ending_landfall.jpg` | **NEEDS_GROK_PLATE** | In-tree plate is ship-over-cloud-planet, already selected for the Landfall title. Owner asked for cinematic ending art; this is orbital establishing, not landing. Keep current until a unique landfall cinematic PASSes. Commander faceless; no baked ending copy; roster-ambiguous. |
| `cinematic:intro` frame 1 | `images/onboarding_background.jpg` | **NEEDS_GROK_PLATE** | All three intro slides share one empty-corridor bookend. Unique plate required. Prose: Earth failed in a cascade measured in hours. |
| `cinematic:intro` frame 2 | `images/onboarding_background.jpg` | **NEEDS_GROK_PLATE** | Unique plate. Prose: colonization ark built for thousands; nine cleared the hatch. |
| `cinematic:intro` frame 3 | `images/onboarding_background.jpg` | **NEEDS_GROK_PLATE** | Unique plate. Prose: faceless Commander; damaged ship; living already arguing what to save. |

Images tree unchanged: `de4c3687cf4c89309d3422505dba4b45a32adc7e`. No new JPEG bytes.

## In-tree retarget (this PR)

| Scene | From | To | Living-cast / Continue |
|---|---|---|---|
| `bond_mira` | `images/mira.jpg` | `images/quiet_mira.jpg` | `requireLivingCast` entryOnly unchanged. Dead Mira still resolves `corridor_variant.jpg`. Resume does not replay entry. `romance_mira_1` stays on `quiet_mira.jpg`. Face-revealing `romance_mira_1.jpg` stays unwired. |

`mira.jpg` SHA-256 `92eb569e8aec269c43c175d0082c22f27bc0a385f588f28aaa4d515790ac0bf2`
`quiet_mira.jpg` SHA-256 `27518fd30d22c578eca8fb2b3a775ca6a77c6b4da4486fb0b2a5a39d81d0cf3c`

## Amara romance non-trigger (finding only)

Owner note: `prom_r_amara` does not trigger Romance Amara.

Intended scene map (no rewrite this ticket):

- `prom_make_amara` → `prom_r_amara` writes `promises.amara` (`made` / `declined`) only.
- Solo romance writes `romance.amara` in `romance_amara_1.onEnter` after
  `intimacy_window` → `bond_amara` yes-path.
- `romanceOpen("amara")` has no affinity/trust hard gate. It closes on
  declined / held_only / `romance.amara_tomas` / dead / promise `broken`.

Not a proven wiring break vs that map. PARKED as owner note. Do not rewrite
Amara-route gates without repro beyond the note.

## Wire gate (every new plate)

Before any later ticket wires a Grok output:

| Result | Meaning |
|---|---|
| **PASS** | Identity (face+bodysuit match), framing, rectangular interior, Commander-faceless, roster honesty, event body/face language, no baked text, unique to this beat. |
| **HOLD** | Usable candidate; needs a controlled edit or owner look. Do not wire. |
| **REJECT** | Portrait stand-in, wrong identity, Commander face, wrong beat, green-eyed Mira, porcelain Vess, or invented body_ref. Do not wire. Keep the current living stand-in. |

This ticket performs no PASS. Briefs are instructions, not plates.

## Pack note: SUN-ART-BODY-REFERENCE-01

Ticket/pack identity for later dispatch. **This audit PR does not generate
image bytes and does not wire any `body_ref` into scenes.** Owner (Manraj)
approves body portraits **directly** before any use as event-modeling
reference or any later scene wire.

Purpose: **front and back** full-body official reference portraits for the
living cast, **same shared pose**, underwear/undergarments OK (not nude), so
later event plates can copy body volume without inventing a second anatomy.
Match each official CURRENT face portrait + bodysuit as closely as possible.

### Locked pose (whole set)

Front plate: front three-quarter standing. Back plate: the same stance turned
180° (rear three-quarter), same camera height and crop. Full body, feet to
head in frame. Arms relaxed at sides. Weight even. Neutral expression. Same
plain studio backdrop for every id. No scene props. Underwear / base layer
only — not nude, not the official bodysuit, not event clothes.

### Standing brief rules

- Face + identity from each character’s current official bodysuit and CURRENT
  tank-top portrait. Exact likeness vs those refs (geometry, age, skin,
  hairline, eye shape, scars/marks). No beautify, no age shift, no ethnicity
  swap. Match those refs as closely as possible on both front and back plates
  (back plate: hair, nape, scars/marks, body volume still read as the same
  person).
- L-029 Vess: official face is `images/vess.jpg` only. `images/bodysuit_vess.jpg`
  is the clothed twin. Porcelain / discarded boarding set is rejected
  reference.
- L-030 Mira: ice-blue irises, dark messy bun, olive/tan, no Amara freckles.
- L-025: Commander stays faceless. **No commander body plate.**
- Identical pose across the set (locked above). Ban “generic crew.”
- QA: REJECT if the face does not read as the same person as the official
  portrait at thumbnail size, or if pose/crop drifts from the locked set.

### Planned outputs (do not create in this PR)

`images/body_ref_<id>_front.jpg` and `images/body_ref_<id>_back.jpg` after
owner approval. Until approval, candidates may live only in an artifacts
approval gallery and **must not** be assigned to `scene.image` /
`sceneImages`. Rourke is dead (first hour) and is not in this living set.

Living-cast IDs are listed in `artifacts/SUN_PLAYTEST_RESPONSE_PLAN.md`.

## Prior ART-R2 cluster (do not remint)

PLAYTEST_SUN shower-vs-setting mismatches on `romance_lena_1` /
`romance_amara_1` / `romance_mira_1` remain **ALREADY_SATISFIED** as
*wrong-shower* repairs (PRs 133–142). This audit is a different complaint:
those living stand-ins still fail *event match*. Do not remint 133–142.
Do not rewire shower linger plates onto first-offer sex beats.

## Limits

- No 0.36, certify, tag, deploy, Netlify, PIN-02 remint.
- No broad ART-R2 binary regen batch.
- No crew-UI / white-space / tutorial on this branch.
- L-025–L-028 dispositions unchanged.
- Required version-lane checks, then merge-commit. Not squash.
