# Sunsplitter ticket queue — next packs after lane 0.30.1

SOURCE lane@a5e52b0 · TASK SUN-ROADMAP-NEXT-PACKS-01 · MODE proposal

Docs only. This file does not mint a product version, open 0.36, remint
PRs 107–163, touch Netlify, certify, or start gameplay.

Lane: `version/0.30.1-main-reconcile-ci.1` at `a5e52b077213a9f15a73b2ba3263b963dcc1e2f9`
(PR 163 merge tip). Player-facing paint stays `VERSION.md` = `0.33`.

Lock: `lane 0.30.1 · certified 0.28.1d · NO-PUBLISH · 0.36 HOLD`

Pack labels `0.30.2` / `0.30.3` / `0.30.4` are **planning ids** for builders.
They are not `GAME_VERSION`, not a tag, and not an OPEN of 0.36.

Full /goal stubs: `docs/SUN_ROADMAP_NEXT_PACKS_01.md`.

## Holds (explicit)

- **0.36 HOLD** until owner **OPEN**. Do not mint, open, or paint 0.36.
- **Last certified:** `0.28.1d`. Lane work is LANDED ON VERSION LANE only.
- **NO-PUBLISH / NOT_CERTIFIED.**
- **Netlify pin** `a91a26d` is owner-only. Do not remint PIN-02.
- **Amara-route PARKED.** Narrow repro only if a later /goal names it.
- PR 45 / draft PR 46 untouched. No remint of spent PRs 107–163.

## Current lane (do not reopen as a pack)

| Id | State |
|---|---|
| `version/0.30.1-main-reconcile-ci.1` | Active lane. Tip `a5e52b0` after PR 163 New Run handlers. |
| 0.30.1–0.35 drain recorded in STATUS | Do not remint 107–147 / 163 as new identities. |

## Pack 0.30.2 — playtest UI leftovers (post-P2)

Ordered leftovers 5–9 from `artifacts/SUN_PLAYTEST_RESPONSE_PLAN.md`.

| Ticket | One-line objective | Suggested touch |
|---|---|---|
| `SUN-PLAYTEST-CREW-SHEET-FLEX-01` | Crew count + flex name buttons + full-screen crew character sheet. | `src/validate.js`, `index.html`, `css/style.css`, `scripts/*crew*` |
| `SUN-PLAYTEST-ART-DOUBLECLICK-01` | Art double-click minimize restore. | `src/engine.js` / `src/validate.js`, `scripts/playtest-art-doubleclick-checks.mjs` |
| `SUN-PLAYTEST-TITLE-WHITESPACE-01` | Title white-space + rotating ship background. | `index.html`, `css/style.css`, title cinematic surfaces |
| `SUN-PLAYTEST-INTRO-BACK-ART-01` | Intro slides back button + intro art. | `src/validate.js` `INTRO_SLIDE_ART`, `index.html`, `scripts/playtest-intro-back-art-checks*` |
| `SUN-PLAYTEST-TUTORIAL-TOPFIELDS-01` | Tutorial covers 5 top fields (skip kept). | tutorial overlay + `scripts/playtest-tutorial-topfields-checks.mjs` |

## Pack 0.30.3 — playtest design leftovers (paper already in-tree)

Items 11–13. Design pages exist. Implement tickets stay unopened until a later /goal.

| Ticket | One-line objective | Suggested touch |
|---|---|---|
| `SUN-PLAYTEST-CREW-CONFLICT-01` | One bounded crew-conflict attach on existing offer sites. | `docs/SUN_PLAYTEST_CREW_CONFLICT_DESIGN.md` then (later) `src/scenes-16.js` / `src/scenes-40.js` |
| `SUN-PLAYTEST-COMMANDER-CREATION-01` | Light hybrid only: callsign + seal + oath. No full chargen. | `docs/SUN_PLAYTEST_COMMANDER_CREATION_DESIGN.md` then (later) title panel / save-optional strings |
| `SUN-PLAYTEST-ENDING-CINEMATIC-ART-01` | Ending cinematic bookend vs ending screen; reuse-first. | `docs/SUN_PLAYTEST_ENDING_CINEMATIC_ART_DESIGN.md` then (later) `showCinematic("ending")` + `scripts/cinematic-checks.mjs` |

## Pack 0.30.4 — art follow-through (still pre-0.36)

Items 2–4. No Cursor/Grok-Bot JPEG generation. Owner approves in grok.com.

| Ticket | One-line objective | Suggested touch |
|---|---|---|
| `SUN-ART-STYLE-BIBLE-LOCK-01` | Owner lock of `artifacts/SUN_ART_STYLE_BIBLE.md` (docs/status only). | `artifacts/SUN_ART_STYLE_BIBLE.md`, STATUS if owner records the lock |
| `SUN-ART-BODY-REFERENCE-01` | Front/back living-cast body_ref pack plan; no bytes in the first ticket. | `artifacts/SUN_PLAYTEST_RESPONSE_PLAN.md` living-cast table |
| `SUN-PLAYTEST-ART-PLATE-LOOP-01` | Dispatch one `NEEDS_GROK_PLATE` beat at a time after style lock. | `artifacts/GROK_BRIEFS_PLAYTEST_ART_EVENT_AUDIT_01.md` |

## Not in any pack

- 0.36 PC-readiness.
- Amara-route expansion (PARKED).
- ART-R2 broad binary regen campaign.
- Main close-out, tag, Release, deploy, PIN-02 remint.
- Dual-write / From the Ashes.

## Dispatch order for orchestrator

1. One ticket from Pack 0.30.2 at a time (UI leftovers keep builders busy without opening 0.36).
2. Pack 0.30.3 implement tickets only after owner greenlight (design pages are not that greenlight).
3. Pack 0.30.4 only after Manraj locks the style bible.
4. Stop after each merged ticket. Do not start the next unbidden.
