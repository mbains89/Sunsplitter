SOURCE main@8d23109 · RUNTIME 1a8e8a5 · TASK SUN-PLAYTEST-ART-EVENT-AUDIT-01 · MODE implementation

Owner playtest response after Sun Playtest closed 2026-09-03. **Not a version mint. Does not open 0.36.** Lane work only:
`version/0.30.1-main-reconcile-ci.1`. **LANDED ON VERSION LANE ≠ SHIPPED ≠
CERTIFIED.** Last certified remains `0.28.1d`. **NO-PUBLISH.** Live Netlify
pin `a91a26d` — do not remint PIN-02. Do not remint 107–147. Do not touch
PR 45/46. Do not reopen L-025–L-028.

This file is the ordered follow-up list. Full event→image table:
`artifacts/SUN_PLAYTEST_ART_EVENT_AUDIT_01.md`. Grok stubs:
`artifacts/GROK_BRIEFS_PLAYTEST_ART_EVENT_AUDIT_01.md`. Style bible draft:
`artifacts/SUN_ART_STYLE_BIBLE.md`.

## Owner generation workflow (locked for this workstream)

Do **not** generate event-plate or body_ref binaries in Cursor or Grok Bot.

1. **Orchestrator / `$ S1`:** keep the style bible, the ordered `NEEDS_GROK_PLATE` list, and paste-ready briefs (identity lock, style bible, beat verb, body/face language). Wire only owner-approved assets.
2. **Manraj** approves each image personally in **grok.com chats**, one event (or one body_ref plate) at a time. Generation is offloaded off Grok Bot.
3. **Canon PASS/HOLD/REJECT** likeness before any wire.
4. **Prerequisite:** lock art direction / `artifacts/SUN_ART_STYLE_BIBLE.md` before event-by-event grok.com chats. The body_ref front/back pack comes **after** that style lock.

## Ordered follow-ups (post-0.35, pre-0.36)

1. **Art–event match** — this audit + in-tree retargets (`SUN-PLAYTEST-ART-EVENT-AUDIT-01`). Unique plate per beat; never official portrait as stand-in.
2. **Style bible lock** — owner approves `artifacts/SUN_ART_STYLE_BIBLE.md` (drafted from CURRENT bodysuit / CURRENT Batch A). Prerequisite for items 3–4.
3. **SUN-ART-BODY-REFERENCE-01** — **front and back** full-body living-cast refs, same shared pose, underwear/base layer (not nude). Match official CURRENT face portrait + bodysuit as closely as possible. **After style lock.** **No image bytes and no scene wiring in this PR.** Owner approves each plate in grok.com before any event-modeling use or later wire.
4. **Grok plate batch** from the brief stubs, in grok.com, one beat at a time (official bodysuit portrait as sole face reference + full beat; Canon identity lock; PASS/HOLD/REJECT before wire). Attach owner-approved `body_ref_<id>_front.jpg` / `body_ref_<id>_back.jpg` only after item 3. Not a broad ART-R2 binary campaign. Not a Cursor generation job.
5. **Crew count + flex name buttons + full-screen crew character sheet.**
6. **Art double-click minimize restore.**
7. **Title white-space + rotating ship background.**
8. **Intro slides back button + intro art.**
9. **Tutorial covers 5 top fields** (skip kept).
10. **Amara romance trigger repro** (narrow; Amara-route stays PARKED unless repro proves a wiring bug vs the intended scene map).
11. **Crew conflict events** (design later).
12. **Light commander creation** (design later; Grok already advised light hybrid).
13. **Ending cinematic art.**

This audit PR documents items 1–4 as paper only (plus the one in-tree `bond_mira` retarget). Do not generate `body_ref` or event JPEGs here. Do not start items 5–13 on the audit branch. One merged PR for the audit, then stop. Grok / orchestrator dispatches the next identity.

## SUN-ART-BODY-REFERENCE-01 — living cast IDs

Eight named living companions (`LIVING_CREW_KEYS` in `src/state.js`). **No
commander body plate (L-025). No Rourke** (dies first hour). Generate/plan
**front and back** per id. Match official CURRENT face portrait + bodysuit as
closely as possible. Locked pose: same shared stance for the whole set
(front three-quarter standing; back plate is the 180° turn of that stance).
Feet-to-head, arms relaxed, plain studio, underwear/base layer only (not
nude). Owner approves before any wire.

Planned names: `images/body_ref_<id>_front.jpg` and
`images/body_ref_<id>_back.jpg`.

| id | Official CURRENT face | Official bodysuit | Planned front (not in this PR) | Planned back (not in this PR) |
|---|---|---|---|---|
| `lena` | `images/lena.jpg` | `images/bodysuit_lena.jpg` | `images/body_ref_lena_front.jpg` | `images/body_ref_lena_back.jpg` |
| `elias` | `images/elias.jpg` | `images/bodysuit_elias.jpg` | `images/body_ref_elias_front.jpg` | `images/body_ref_elias_back.jpg` |
| `mira` | `images/mira.jpg` (L-030 ice-blue; no Amara freckles) | `images/bodysuit_mira.jpg` | `images/body_ref_mira_front.jpg` | `images/body_ref_mira_back.jpg` |
| `tomas` | `images/tomas.jpg` | `images/bodysuit_tomas.jpg` | `images/body_ref_tomas_front.jpg` | `images/body_ref_tomas_back.jpg` |
| `amara` | `images/amara.jpg` | `images/bodysuit_amara.jpg` | `images/body_ref_amara_front.jpg` | `images/body_ref_amara_back.jpg` |
| `jiro` | `images/jiro.jpg` | `images/bodysuit_jiro.jpg` | `images/body_ref_jiro_front.jpg` | `images/body_ref_jiro_back.jpg` |
| `sela` | `images/sela.jpg` | `images/bodysuit_sela.jpg` | `images/body_ref_sela_front.jpg` | `images/body_ref_sela_back.jpg` |
| `vess` | `images/vess.jpg` only (L-029) | `images/bodysuit_vess.jpg` | `images/body_ref_vess_front.jpg` | `images/body_ref_vess_back.jpg` |

Until Manraj approves a plate, it is not a body_ref. Do not wire into
`scene.image` / `sceneImages`. Candidates may sit in an artifacts approval
gallery only.

## Vocabulary

| Label | Meaning |
|---|---|
| LANDED ON VERSION LANE | Merge-committed into `version/0.30.1-main-reconcile-ci.1`. Not on `main`. Not certified. |
| SHIPPED | Present on `main` and recorded in STATUS. Not a Release or deploy. |
| CERTIFIED | Only the last certified baseline `0.28.1d`. |

## Holds

- 0.36 PC-readiness not opened.
- ART-R2 broad binary regen batch remains held.
- Amara-route parked except a later narrow repro ticket.
- PR 45 / draft PR 46 untouched.
- No main close-out, tag, Release, deploy, or PIN-02 remint.
