# SUN-V036-PACK-NEXT-01

SOURCE lane@f2ccc61 · TASK SUN-V036-PACK-NEXT-01 · MODE proposal

Docs only. Does not implement the pack. Does not certify, tag, publish, or remint Netlify.
Paint **0.36**. Lock: `lane 0.30.1 · certified 0.28.1d · NO-PUBLISH · 0.36 PAINT`.
LIVE after PR211: `f2ccc61a1fe6462c09ef2da0f8fbe7eca78075fd`.
Art PARKED. Remint 107–211 banned.

## Why these two

Playable checkpoints with paper already in-tree. Not rename tickets. Not infinite residuals.

| # | Ticket | One-line objective | Why now | Do not |
|---|---|---|---|---|
| 1 | `SUN-V036-CREW-CONFLICT-01` | One bounded crew-conflict attach on existing offer sites. | Design paper landed PR159 (`docs/SUN_PLAYTEST_CREW_CONFLICT_DESIGN.md`). Implement never opened. | No new HUD, meters, second event spine, Amara-route, new flags beyond the design doc |
| 2 | `SUN-V036-ENDING-CINEMATIC-01` | Ending cinematic bookend vs ending screen; reuse-first in-tree plates. | Design paper landed PR162. Intro bookend already wired. Ending still uses `images/onboarding_background.jpg` corridor. | No JPEG generation, no ART-R2, no baked hull-number plate |

Dispatch order: conflict first, cinematic second. One `/goal` per ticket. Stop after each merge.

## Out of this pack (unsatisfied-only leftovers rejected here)

- Crew-sheet / count-flex / commander-creation / title / tutorial / intro-back: already landed on the lane.
- Ammo / UI residual reconfirms: not named. Do not reopen as pack items.
- Art HITL / wire: PARKED.
- Tag, certify, publish, Netlify pin remint.

## Suggested touch (implement tickets later, not this PR)

- `SUN-V036-CREW-CONFLICT-01` — `docs/SUN_PLAYTEST_CREW_CONFLICT_DESIGN.md` then `src/scenes-16.js` / `src/scenes-40.js` as the design names. No new state keys unless a later lock says so.
- `SUN-V036-ENDING-CINEMATIC-01` — `docs/SUN_PLAYTEST_ENDING_CINEMATIC_ART_DESIGN.md` then `showCinematic("ending")` + `scripts/cinematic-checks.mjs`. Reuse only.
