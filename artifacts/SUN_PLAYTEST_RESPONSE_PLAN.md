SOURCE main@8d23109 · RUNTIME 1a8e8a5 · TASK SUN-PLAYTEST-ART-EVENT-AUDIT-01 · MODE implementation

Owner playtest response after Sun Playtest closed 2026-09-03. **Not a version mint. Does not open 0.36.** Lane work only:
`version/0.30.1-main-reconcile-ci.1`. **LANDED ON VERSION LANE ≠ SHIPPED ≠
CERTIFIED.** Last certified remains `0.28.1d`. **NO-PUBLISH.** Live Netlify
pin `a91a26d` — do not remint PIN-02. Do not remint 107–147. Do not touch
PR 45/46. Do not reopen L-025–L-028.

This file is the ordered follow-up list. Full event→image table:
`artifacts/SUN_PLAYTEST_ART_EVENT_AUDIT_01.md`. Grok stubs:
`artifacts/GROK_BRIEFS_PLAYTEST_ART_EVENT_AUDIT_01.md`.

## Ordered follow-ups (post-0.35, pre-0.36)

1. **Art–event match** — this audit + in-tree retargets (`SUN-PLAYTEST-ART-EVENT-AUDIT-01`). Unique plate per beat; never official portrait as stand-in.
2. **SUN-ART-BODY-REFERENCE-01** — full-body living-cast refs, same shared pose, underwear/base layer (not nude). Documented on this audit; **no image bytes and no scene wiring in this PR.** Owner approves body portraits directly before any event-modeling use or later wire. Pack note: `artifacts/SUN_PLAYTEST_ART_EVENT_AUDIT_01.md`.
3. **Grok plate batch** from the brief stubs (official bodysuit portrait as sole face reference + full beat; Canon identity lock; PASS/HOLD/REJECT before wire). Attach owner-approved `body_ref_<id>` only after item 2. Not a broad ART-R2 binary campaign until Grok dispatches a new ticket identity.
4. **Crew count + flex name buttons + full-screen crew character sheet.**
5. **Art double-click minimize restore.**
6. **Title white-space + rotating ship background.**
7. **Intro slides back button + intro art.**
8. **Tutorial covers 5 top fields** (skip kept).
9. **Amara romance trigger repro** (narrow; Amara-route stays PARKED unless repro proves a wiring bug vs the intended scene map).
10. **Crew conflict events** (design later).
11. **Light commander creation** (design later; Grok already advised light hybrid).
12. **Ending cinematic art.**

This audit PR documents item 2 only. Do not generate `body_ref` JPEGs here. Do not start items 4–12 on the audit branch. One merged PR for the audit, then stop. Grok / orchestrator dispatches the next identity.

## SUN-ART-BODY-REFERENCE-01 — living cast IDs

Eight named living companions (`LIVING_CREW_KEYS` in `src/state.js`). **No
commander body plate (L-025). No Rourke** (dies first hour). Locked pose:
front three-quarter, feet-to-head, arms relaxed, plain studio, underwear/base
layer only.

| id | Official CURRENT face | Official bodysuit | Planned output (not in this PR) |
|---|---|---|---|
| `lena` | `images/lena.jpg` | `images/bodysuit_lena.jpg` | `images/body_ref_lena.jpg` |
| `elias` | `images/elias.jpg` | `images/bodysuit_elias.jpg` | `images/body_ref_elias.jpg` |
| `mira` | `images/mira.jpg` (L-030 ice-blue; no Amara freckles) | `images/bodysuit_mira.jpg` | `images/body_ref_mira.jpg` |
| `tomas` | `images/tomas.jpg` | `images/bodysuit_tomas.jpg` | `images/body_ref_tomas.jpg` |
| `amara` | `images/amara.jpg` | `images/bodysuit_amara.jpg` | `images/body_ref_amara.jpg` |
| `jiro` | `images/jiro.jpg` | `images/bodysuit_jiro.jpg` | `images/body_ref_jiro.jpg` |
| `sela` | `images/sela.jpg` | `images/bodysuit_sela.jpg` | `images/body_ref_sela.jpg` |
| `vess` | `images/vess.jpg` only (L-029) | `images/bodysuit_vess.jpg` | `images/body_ref_vess.jpg` |

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
