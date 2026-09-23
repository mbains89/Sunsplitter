# Sunsplitter ticket queue — playtest-response drain honesty after tip 5ff43841

SOURCE lane@e65f252f599cd29c6b21211ae9d2f42c9e271fdc · TASK SUN-PLAYTEST-RESPONSE-DRAIN-HONESTY-01 · MODE docs

Docs only. This file does not mint a product version, open 0.36 product
work, remint spent playable PRs, touch Netlify, certify, or start gameplay.

Lane: `version/0.30.1-main-reconcile-ci.1` at `e65f252f599cd29c6b21211ae9d2f42c9e271fdc`
(this ticket's pre-PR HEAD; ≥ named floor `5ff43841`).
`VERSION.md` first line on lane is `0.36` (existing PAINT, not OPEN).
Last certified remains `0.28.1d`.

Lock: `lane 0.30.1 · certified 0.28.1d · NO-PUBLISH · 0.36 PAINT`

Certify / Netlify / 0.36 PC-evidence stay **OPEN-GATED** as product actions.
That is not the lock-suffix word. Prior receipts:
`docs/SUN_DOCS_TIP_HONESTY_363.md`,
`docs/SUN_DOCS_TIP_HONESTY_02.md`,
`docs/SUN_DOCS_TIP_HONESTY_01.md`.
This pass receipt: `docs/SUN_PLAYTEST_RESPONSE_DRAIN_HONESTY_01.md`.

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
- PR 45 / draft PR 46 untouched. No remint of spent playable leftovers 5–9.
- Ignore Copilot non-ticket branches. **Do not merge PR #297**
  (corrupt `src/engine.js` PLACEHOLDER). Ignore **#304** unless owner names it.
- Do not invent OPEN 0.37.

## Current lane (do not reopen as a pack)

| Id | State |
|---|---|
| `version/0.30.1-main-reconcile-ci.1` | Active write lane. Tip `e65f252f599cd29c6b21211ae9d2f42c9e271fdc` (pre-PR HEAD for this honesty ticket). |
| `SUN-PLAYTEST-RESPONSE-DRAIN-HONESTY-01` | This docs ticket. Plan leftovers 5–9 ALREADY_SATISFIED; 10–13 named holds. |
| PR **#363** `SUN-RECEIPT-VERIFY-MODES-01` | Merged earlier. Do not remint. |
| PR **#360** `SUN-CREW-BOARD-FOLLOW-CLARITY-01` | Merged. First Crew tap holds `#crew-sheet` closed. Do not remint. |
| PR **#348** `SUN-TITLE-CONTINUE-CREW-02` | Merged. Title Continue = saved visible living crew. Do not remint. |
| `main@8d23109` | SHIPPED observation only. Do not close the lane onto main. |

---

## $ S2 FEED — playtest leftovers 5–9 spent (do not remint)

| Plan # | Ticket / playable | Verdict |
|---|---|---|
| 5 | `SUN-PLAYTEST-CREW-COUNT-FLEX-01` + sheet | ALREADY_SATISFIED. PRs **#150**, **#152**, **#251**; later **#225**, **#348**, **#360**. |
| 6 | `SUN-PLAYTEST-ART-DOUBLECLICK-01` | ALREADY_SATISFIED. PR **#153**. |
| 7 | title whitespace + rotating ship | ALREADY_SATISFIED. PRs **#154**, **#155**; docs **#253**. |
| 8 | intro Back + intro art | ALREADY_SATISFIED. PR **#156**; docs **#254** / **#226**; bookend **#302**. |
| 9 | tutorial topfields | ALREADY_SATISFIED. PR **#157**; docs **#229**. |

Also spent (unchanged): `SUN-RECEIPT-VERIFY-MODES-01` PR **#363**;
`SUN-HITL-WIRE-REMAP-01`; `SUN-EMBRYO-COUNT-SWEEP-01`;
`SUN-LETHAL-RESUME-DEATHBEAT-01`; `SUN-HITL-WIRE-ADD-KEYS-A-01`;
`SUN-DAMAGE-CAUSE-PROPOSAL-01` paper PR **#298**.

## Named holds — leftovers 10–13 (not fireable)

| Plan # | Name | Why gated |
|---|---|---|
| 10 | Amara romance trigger repro (narrow) | PARKED. Owner-named repro only. |
| 11 | Crew conflict events | Design later. Not OPEN. |
| 12 | Light commander creation | Design later. Not OPEN. Do not remint **#238**. L-025 LOCKED. |
| 13 | Ending cinematic art | Muse / HITL after style lock. Not Bot JPEG. Not ART-R2. |

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
