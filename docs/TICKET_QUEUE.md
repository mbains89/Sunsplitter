# Sunsplitter ticket queue — next packs after lane 0.30.1

SOURCE lane@3b12294e · TASK SUN-POST292-TIP-HONESTY-01 · MODE proposal

Docs only. This file does not mint a product version, open 0.36, remint
PRs 107–163, touch Netlify, certify, or start gameplay.

Lane: `version/0.30.1-main-reconcile-ci.1` at `3b12294e0a75d2628d98365e3f85327e1ae02235`
(PR 292 merge tip). Player-facing paint stays `VERSION.md` first line `0.36`
(paint only — not a 0.36 milestone exit).

Lock: `lane 0.30.1 · certified 0.28.1d · NO-PUBLISH · 0.36 PAINT`

Live honesty sidecar: `docs/SUN_POST292_TIP_HONESTY_01.md`.
Historical pack stubs: `docs/SUN_ROADMAP_NEXT_PACKS_01.md` (SHA inside that file is stale; do not copy it as HEAD).

## Live tip after #292

| Item | State |
|---|---|
| Pack 0.30.2 UI leftovers | **ALREADY_SATISFIED** — do not remint |
| Pack 0.30.3 design leftovers | **ALREADY_SATISFIED** (#247 / PRs 210, 213, 214) |
| HITL 87-slot wire | **ALREADY_SATISFIED** (#290) |
| Slot15 `arc_future_2` plate | **ALREADY_SATISFIED** (#291) |
| Title Enter prefers Continue + validator export | **ALREADY_SATISFIED** (#292) |
| Body-ref pack *plan* | **ALREADY_SATISFIED** (#250) — no JPEG bytes |
| #289 truncated validate.js head | **SUPERSEDED** — do not merge |

**Next leftover (not a builder PR from this row):** `SUN-PLAYTEST-ART-PLATE-LOOP-01` — one owner-approved grok.com plate, then Canon, then a later wire ticket if a new file exists. Do not invent OPEN. Do not generate plates in Cursor / Grok Bot.

Pack labels `0.30.2` / `0.30.3` / `0.30.4` are **planning ids** for builders.
They are not `GAME_VERSION`, not a tag, and not an OPEN of 0.36.

## Holds (explicit)

- **0.36 HOLD** on mint/certify until owner **OPEN**. Paint `0.36` is already on the lane.
- **Last certified:** `0.28.1d`. Lane work is LANDED ON VERSION LANE only.
- **NO-PUBLISH / NOT_CERTIFIED.**
- **Netlify pin** `a91a26d` is owner-only. Do not remint PIN-02.
- **Amara-route PARKED.** Narrow repro only if a later /goal names it.
- PR 45 / draft PR 46 untouched. No remint of spent PRs 107–163.

## Current lane (do not reopen as a pack)

| Id | State |
|---|---|
| `version/0.30.1-main-reconcile-ci.1` | Active lane. Tip `3b12294e` after PR 292. |
| 0.30.1–0.35 drain recorded in STATUS | Do not remint 107–147 / 163 as new identities. |

## Pack 0.30.2 — playtest UI leftovers (post-P2) — ALREADY_SATISFIED

Ordered leftovers 5–9 from `artifacts/SUN_PLAYTEST_RESPONSE_PLAN.md`.
Landed. Do not remint.

| Ticket | One-line objective | Suggested touch |
|---|---|---|
| `SUN-PLAYTEST-CREW-SHEET-FLEX-01` | Crew count + flex name buttons + full-screen crew character sheet. | `src/validate.js`, `index.html`, `css/style.css`, `scripts/*crew*` |
| `SUN-PLAYTEST-ART-DOUBLECLICK-01` | Art double-click minimize restore. | `src/engine.js` / `src/validate.js`, `scripts/playtest-art-doubleclick-checks.mjs` |
| `SUN-PLAYTEST-TITLE-WHITESPACE-01` | Title white-space + rotating ship background. | `index.html`, `css/style.css`, title cinematic surfaces |
| `SUN-PLAYTEST-INTRO-BACK-ART-01` | Intro slides back button + intro art. | `src/validate.js` `INTRO_SLIDE_ART`, `index.html`, `scripts/playtest-intro-back-art-checks*` |
| `SUN-PLAYTEST-TUTORIAL-TOPFIELDS-01` | Tutorial covers 5 top fields (skip kept). | tutorial overlay + `scripts/playtest-tutorial-topfields-checks.mjs` |

## Pack 0.30.3 — playtest design leftovers — ALREADY_SATISFIED

Items 11–13. Implement tickets landed (#210 / #213 / #214).

| Ticket | One-line objective | Suggested touch |
|---|---|---|
| `SUN-PLAYTEST-CREW-CONFLICT-01` | One bounded crew-conflict attach on existing offer sites. | `docs/SUN_PLAYTEST_CREW_CONFLICT_DESIGN.md` then (later) `src/scenes-16.js` / `src/scenes-40.js` |
| `SUN-PLAYTEST-COMMANDER-CREATION-01` | Light hybrid only: callsign + seal + oath. No full chargen. | `docs/SUN_PLAYTEST_COMMANDER_CREATION_DESIGN.md` then (later) title panel / save-optional strings |
| `SUN-PLAYTEST-ENDING-CINEMATIC-ART-01` | Ending cinematic bookend vs ending screen; reuse-first. | `docs/SUN_PLAYTEST_ENDING_CINEMATIC_ART_DESIGN.md` then (later) `showCinematic("ending")` + `scripts/cinematic-checks.mjs` |

## Pack 0.30.4 — art follow-through (still pre-0.36)

Items 2–4. No Cursor/Grok-Bot JPEG generation. Owner approves in grok.com.

| Ticket | One-line objective | State |
|---|---|---|
| `SUN-ART-STYLE-BIBLE-LOCK-01` | Owner lock of `artifacts/SUN_ART_STYLE_BIBLE.md` (docs/status only). | **ALREADY_SATISFIED** |
| `SUN-ART-BODY-REFERENCE-01` | Front/back living-cast body_ref pack plan; no bytes in the first ticket. | **ALREADY_SATISFIED** (#250 plan only) |
| `SUN-PLAYTEST-ART-PLATE-LOOP-01` | Dispatch one `NEEDS_GROK_PLATE` beat at a time after style lock. | Next leftover — owner/Muse/Canon; not a code PR until a new plate exists |

## Not in any pack

- 0.36 PC-readiness mint/certify.
- Amara-route expansion (PARKED).
- ART-R2 broad binary regen campaign.
- Main close-out, tag, Release, deploy, PIN-02 remint.
- Dual-write / From the Ashes.

## Dispatch order for orchestrator

1. Do not reopen Pack 0.30.2 / 0.30.3 or #289/#292 as new identities.
2. Next leftover is plate-loop only after an owner-approved plate exists.
3. Stop after each merged ticket. Do not start the next unbidden.

## Post-V036 BOUNDARY (mint-blocking)

- [x] `SUN-V036-VERSION-PAINT-01`
- [x] `SUN-V036-PIN-PACKET-01`
- [x] `SUN-V036-ROADMAP-NEXT-01`

## Post-0.36 PAINT (mint-blocking)

- [x] `SUN-V036-PIN-PACKET-01`
- [x] `SUN-V036-PLAYTEST-GATE-01`
- [x] `SUN-V036-PACK-NEXT-01` — paper in `docs/SUN_V036_PACK_NEXT_01.md` (this row is the queue name, not implement)

## Pack V036-NEXT — two playable tickets (after PR211) — ALREADY_SATISFIED

Paint 0.36. Certified 0.28.1d. NO-PUBLISH. Art PARKED. Do not implement from this file.

| Ticket | One-line objective | Suggested touch |
|---|---|---|
| `SUN-V036-CREW-CONFLICT-01` | One bounded crew-conflict attach on existing offer sites. | existing design doc + named offer scenes |
| `SUN-V036-ENDING-CINEMATIC-01` | Ending cinematic bookend vs ending screen; reuse-first. | existing design doc + `showCinematic("ending")` |
