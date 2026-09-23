# Sunsplitter ticket queue — tip honesty after PR #360 + PR #363

SOURCE lane@50ec4895168774dd9341633fb46ee6d364a81707 · TASK SUN-DOCS-TIP-HONESTY-363-01 · MODE docs

Docs only. This file does not mint a product version, open 0.36 product
work, remint PRs 107–363, touch Netlify, certify, or start gameplay.

Lane: `version/0.30.1-main-reconcile-ci.1` at `50ec4895168774dd9341633fb46ee6d364a81707`
(PR **#363** RECEIPT-VERIFY-MODES merge tip, after PR **#360** CREW-BOARD).
`VERSION.md` first line on lane is `0.36` (existing PAINT, not OPEN).
Last certified remains `0.28.1d`.

Lock: `lane 0.30.1 · certified 0.28.1d · NO-PUBLISH · 0.36 PAINT`

Certify / Netlify / 0.36 PC-evidence stay **OPEN-GATED** as product actions.
That is not the lock-suffix word. See `docs/SUN_DOCS_TIP_HONESTY_363.md`.
Prior receipts: `docs/SUN_DOCS_TIP_HONESTY_02.md` (tip `c3626434` / PR #345),
`docs/SUN_DOCS_TIP_HONESTY_01.md` (tip `9788ce10` / PR #333).

Pack labels `0.30.2` / `0.30.3` / `0.30.4` stay **planning ids**.
They are not `GAME_VERSION`, not a tag, and not an OPEN of 0.36.

## Holds (explicit)

- **0.36 product / mint / recertify HOLD** until owner **OPEN** a named
  ticket. Do not treat lane paint `0.36` as that OPEN.
- **Last certified:** `0.28.1d`. Lane work is LANDED ON VERSION LANE only.
- **NO-PUBLISH / NOT_CERTIFIED.**
- **Netlify** is owner-only. Do not remint a pin from this queue.
- **No Bot JPEG gen.** Style bible + body_ref paper already in-tree;
  Imagine stays grok.com / Muse HITL after owner lock.
- **Amara-route PARKED.**
- PR 45 / draft PR 46 untouched. No remint of spent PRs 107–363.
- Ignore Copilot non-ticket branches. **Do not merge PR #297**
  (corrupt `src/engine.js` PLACEHOLDER).

## Current lane (do not reopen as a pack)

| Id | State |
|---|---|
| `version/0.30.1-main-reconcile-ci.1` | Active write lane. Tip `50ec4895168774dd9341633fb46ee6d364a81707` after PR **#363** RECEIPT-VERIFY-MODES (parent of this honesty ticket). |
| PR **#363** `SUN-RECEIPT-VERIFY-MODES-01` | Merged. F1 receipt honesty + F2 verify.mjs modes. Do not remint. |
| PR **#360** `SUN-CREW-BOARD-FOLLOW-CLARITY-01` | Merged. First Crew tap holds `#crew-sheet` closed. Do not remint. |
| PR **#345** `SUN-STILL-BURNING-CORRIDOR-01` | Merged. Historical prior tip `c3626434`. |
| `main@8d23109` | SHIPPED observation only. Do not close the lane onto main. |

---

## $ S2 FEED — spent on this tip (do not remint)

| Ticket | Verdict |
|---|---|
| `SUN-RECEIPT-VERIFY-MODES-01` | MERGED PR **#363** @ `50ec4895` |
| `SUN-CREW-BOARD-FOLLOW-CLARITY-01` | MERGED PR **#360** @ `06010765` |
| `SUN-HITL-WIRE-REMAP-01` | SPENT / ALREADY_SATISFIED on later lane receipts. Do not remint. |
| `SUN-EMBRYO-COUNT-SWEEP-01` | SPENT / ALREADY_SATISFIED. Do not remint. |
| `SUN-LETHAL-RESUME-DEATHBEAT-01` | SPENT / ALREADY_SATISFIED. Do not remint. |
| `SUN-HITL-WIRE-ADD-KEYS-A-01` | ALREADY_SATISFIED on lane map. |
| `SUN-DAMAGE-CAUSE-PROPOSAL-01` | ALREADY_SATISFIED as paper (PR **#298**). Owner lock of a cause remains OPEN. |

## Pack 0.30.2 / 0.30.3 — ALREADY_SATISFIED (do not remint)

Unchanged from `docs/SUN_DOCS_TIP_HONESTY_02.md`. Planning ids only.

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
| PR **#297** `SUN-TITLE-CONTINUE-CREW-COUNT-01` | CORRUPT engine.js. Do not merge. Do not remint. |
| Invent OPEN 0.37 | Not authorized from this queue |

## Dispatch order for orchestrator

No fireable product row is opened by this honesty ticket. Wait for owner OPEN of a named new ticket. Remint HOLD Approve-only.
