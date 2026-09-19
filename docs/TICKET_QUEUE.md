# Sunsplitter ticket queue — restock after PR292

SOURCE lane@2c49176c1643 · TASK SUN-PREP-RESTOCK-01 · MODE proposal

Docs only. This file does not mint a product version, open 0.36 product
work, remint PRs 107–292, touch Netlify, certify, or start gameplay.

Lane: `version/0.30.1-main-reconcile-ci.1` at `2c49176c16430258be7cbf9d0a302fed05ae9b88`
(PR **#292** merge tip). `VERSION.md` first line on lane is `0.36`
(existing PAINT). Last certified remains `0.28.1d`.

Lock: `lane 0.30.1 · certified 0.28.1d · NO-PUBLISH · 0.36 / certify / Netlify OPEN-GATED`

Pack labels `0.30.2` / `0.30.3` / `0.30.4` stay **planning ids**.
They are not `GAME_VERSION`, not a tag, and not an OPEN of 0.36.

Tip packet: `docs/SUN_PREP_RESTOCK_01.md`.
Paste-ready /goals: `docs/SUN_ROADMAP_NEXT_PACKS_01.md`.

## Holds (explicit)

- **0.36 product / mint / recertify HOLD** until owner **OPEN** a named
  ticket. Do not treat lane paint `0.36` as that OPEN.
- **Last certified:** `0.28.1d`. Lane work is LANDED ON VERSION LANE only.
- **NO-PUBLISH / NOT_CERTIFIED.**
- **Netlify** is owner-only. Do not remint a pin from this queue.
- **No Bot JPEG gen.** Style bible + body_ref paper already in-tree;
  Imagine stays grok.com / Muse HITL after owner lock.
- **Amara-route PARKED.**
- PR 45 / draft PR 46 untouched. No remint of spent PRs 107–292.
- Ignore Copilot non-ticket branches.

## Current lane (do not reopen as a pack)

| Id | State |
|---|---|
| `version/0.30.1-main-reconcile-ci.1` | Active write lane. Tip `2c49176c1643` after PR **#293** (post-#292 honesty). |
| PR **#293** `SUN-POST292-TIP-HONESTY-01` | Merged. Tip honesty after #292. |
| PR **#292** `SUN-289-VERIFY-FIX-01` | Merged. Full `validateSunsplitter` + title Enter prefers Continue. |
| PR **#291** `SUN-SLOT15-ARC-FUTURE-2-WIRE-01` | Merged. Slot15 vault plate wired. |
| `main@8d23109` | SHIPPED observation only. Do not close the lane onto main. |

---

## $ S2 FEED — fireable now (ordered)

One ticket at a time. Refresh `base:` to live lane HEAD before launch.
Stop after each merge. Do not start the next unbidden.

### 1. BIG — product / playtest

| Ticket | Objective | Touch | Success | Holds |
|---|---|---|---|---|
| `SUN-HITL-WIRE-REMAP-01` | Apply the five already-named remaps in `docs/SUN_HITL_WIRE_01.md` (existing in-tree JPEGs only). | `src/state.js` `sceneImages` (or the live image map), `docs/SUN_HITL_WIRE_01.md` receipt | Five keys match the remap table; no new filenames; version-verify still runs; dead/unrecovered still honest | No JPEG gen; no Slot15 remint; no 0.36 OPEN; no Netlify |
| `SUN-HITL-WIRE-ADD-KEYS-A-01` | First add-keys slice only: aftermath / berths / `prom_*` rows from `docs/SUN_HITL_WIRE_01.md`. | `src/state.js` image map + named scene files those keys already live in | Listed keys resolve to named existing plates; no new spine; no new flags | No breath/custody batch on this PR; no JPEG gen; no 0.36; no Netlify |

### 2. Design / docs

| Ticket | Objective | Touch | Success | Holds |
|---|---|---|---|---|
| `SUN-DAMAGE-CAUSE-PROPOSAL-01` | Paper-only damage-*cause* proposal for `ship_exterior` / `ship_exterior_2` (ROADMAP §6 still open). | `docs/SUN_DAMAGE_CAUSE_PROPOSAL_01.md` only | Cause options listed; no plate regen; no `sceneImages` edit; Grok does not self-lock | No JPEG; no ROADMAP/LOCKS edit unless owner records a lock later; no 0.36 |
| `SUN-ART-PLATE-LOOP-01` | Dispatch **one** named `NEEDS_GROK_PLATE` beat as a docs brief. No bytes in the PR. | `docs/SUN_ART_PLATE_LOOP_01.md` (+ cite `artifacts/GROK_BRIEFS_PLAYTEST_ART_EVENT_AUDIT_01.md` if present) | One event_id + brief# + reuse-or-regen call; needle “Do not generate plates in Cursor / Grok Bot” | No JPEG in Cursor/Bot; Canon PASS before any later wire; no 0.36; no Netlify |

### 3. Honesty / leftover product (still one-concern)

| Ticket | Objective | Touch | Success | Holds |
|---|---|---|---|---|
| `SUN-EMBRYO-COUNT-SWEEP-01` | Spoken vault / cascade prose uses locked **one hundred forty thousand and six** (140,006). HUD meter stays 0–100. | Named vault-face / cascade / trailer-adjacent prose files only; no HUD rewrite | No live player-facing “fourteen thousand and six”; named line E-6103 Noor, Jakarta unchanged; berths stay 214 | No trailer publish; no 0.36; no Netlify; no meter change |
| `SUN-LETHAL-RESUME-DEATHBEAT-01` | Lethal `onEnter` resume must still play the death beat; do not skip straight to the post-death redirect. | `src/scenes-lethals.js` (or current lethals module) + one harness assert | Resume on a lethal scene shows the beat once; second resume does not re-kill; version-verify / living-cast checks still pass | No new lethals; no 0.36; no Netlify |

---

## Pack 0.30.2 — ALREADY_SATISFIED (do not remint)

Playtest UI leftovers 5–9. Lane receipts exist (PRs 150/152/154/155/156/226/228/229 family + later chrome). Queue names below are honesty only.

| Ticket | Verdict |
|---|---|
| `SUN-PLAYTEST-CREW-SHEET-FLEX-01` | ALREADY_SATISFIED (sheet + count/flex landed; later strip ticket `SUN-PLAYTEST-CREW-SHEET-01` is paper-complete) |
| `SUN-PLAYTEST-ART-DOUBLECLICK-01` | ALREADY_SATISFIED |
| `SUN-PLAYTEST-TITLE-WHITESPACE-01` | ALREADY_SATISFIED |
| `SUN-PLAYTEST-INTRO-BACK-ART-01` | ALREADY_SATISFIED |
| `SUN-PLAYTEST-TUTORIAL-TOPFIELDS-01` | ALREADY_SATISFIED |

## Pack 0.30.3 — ALREADY_SATISFIED (do not remint)

Recorded in `docs/SUN_V036_PACK_NEXT_10.md` at an earlier tip; still true at `2c49176c1643`.

| Ticket | Verdict |
|---|---|
| `SUN-PLAYTEST-CREW-CONFLICT-01` / `SUN-V036-CREW-CONFLICT-01` | ALREADY_SATISFIED — PR **#213** |
| `SUN-PLAYTEST-COMMANDER-CREATION-01` / `SUN-V036-COMMANDER-CREATION-01` | ALREADY_SATISFIED — PR **#210** |
| `SUN-PLAYTEST-ENDING-CINEMATIC-ART-01` / `SUN-V036-ENDING-CINEMATIC-01` | ALREADY_SATISFIED — PR **#214** |

## Pack 0.30.4 — paper landed; JPEG not fireable here

| Ticket | Verdict |
|---|---|
| `SUN-ART-STYLE-BIBLE-LOCK-01` | ALREADY_SATISFIED as paper (`artifacts/SUN_ART_STYLE_BIBLE.md` LOCKED; needle keeps Bot JPEG off) |
| `SUN-ART-BODY-REFERENCE-01` | ALREADY_SATISFIED as **plan** (`docs/SUN_ART_BODY_REFERENCE_01.md`). Bytes remain later + owner grok.com approval |
| `SUN-PLAYTEST-ART-PLATE-LOOP-01` | Fireable only as the docs brief `SUN-ART-PLATE-LOOP-01` above. Not a Bot JPEG ticket |

## Honesty minors just landed (do not remint)

| Ticket | Evidence |
|---|---|
| `SUN-289-VERIFY-FIX-01` | PR **#292** @ `2c49176c1643` |
| `SUN-SLOT15-ARC-FUTURE-2-WIRE-01` | PR **#291** @ `bc353227` |

## OPEN-GATED — not fireable

Do not launch these from `$ S2` FEED.

| Ticket / class | Why gated |
|---|---|
| Any new `SUN-V036-VERSION-PAINT-*` remint | Paint already exists; further paint/mint needs owner OPEN |
| `SUN-V036-PC-DESKTOP-MATRIX-01` and all `SUN-V036-PC-*` | 0.36 PC evidence — owner OPEN only |
| `SUN-V036-PIN-PACKET-*` / Netlify remint / PIN-02 | Owner-only host pin |
| Certify / tag / GitHub Release / main close-out | Last certified stays `0.28.1d` |
| Amara-route expansion | PARKED |
| ART-R2 broad binary regen | PARKED |

## Dispatch order for orchestrator

1. `SUN-HITL-WIRE-REMAP-01`
2. `SUN-HITL-WIRE-ADD-KEYS-A-01`
3. `SUN-EMBRYO-COUNT-SWEEP-01`
4. `SUN-LETHAL-RESUME-DEATHBEAT-01`
5. `SUN-DAMAGE-CAUSE-PROPOSAL-01` (docs)
6. `SUN-ART-PLATE-LOOP-01` (docs brief only)

Stop after each merged ticket. Do not start an OPEN-GATED row.
