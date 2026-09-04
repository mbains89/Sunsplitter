# SUN-PLAYTEST-CREW-CONFLICT-DESIGN-01

SOURCE lane@0a1d2e23 · TASK SUN-PLAYTEST-CREW-CONFLICT-DESIGN-01 · MODE proposal

Playtest follow-up item 11 (“Crew conflict events — design later”).
**Paper only.** This file does not wire scenes, mint flags, generate art, or
open 0.36. Last certified remains `0.28.1d`. **NO-PUBLISH / NOT_CERTIFIED.**

Lane: `version/0.30.1-main-reconcile-ci.1`.
Authority: DRAIN sun playtest-P2 · owner · 2026-09-03.

## Scope of this ticket

- Record what already exists as crew-conflict texture.
- Bound a later implement ticket so it cannot invent HUD, meters, or a
  second event spine.
- Do **not** implement beats here. Do **not** expand Amara-route.
- Commander creation (item 12) stays a later ticket.

## Observed map (code at BASE)

These surfaces already carry living-vs-living pressure. A later ticket
reuses them. It does not add a quest log or conflict dashboard (L-047).

| Surface | Path | What it already does |
|---|---|---|
| `crew_walk` | `src/scenes-40.js` | After hydro / priority, walk the ship; living-gated quiet visits. |
| `quiet_sela` / `quiet_mira` / `quiet_tomas` / `quiet_amara` | `src/scenes-41.js` | One-at-a-time private pressure. Amara visit is trays / promise only. |
| `faction_split` | `src/scenes-25.js` | Post-crisis side-taking. Plate `images/corridor_variant.jpg`. |
| `arc_living_3` | `src/scenes-08.js` → living arc | Ritual vs numbers; plate `images/arc_living_conflict.jpg`. |
| `pair_shield_cold` | offered from `src/scenes-16.js` | L-020: Elias after Mira lethal, once. Flag `pair_shield`. |
| `pair_grudge_settle` | offered from `src/scenes-16.js` | Tomas / Jiro work-noise beat. Flag `pair_grudge`. |
| `pair_favor_confront` | offered from `src/scenes-16.js` | Amara / Sela when Sela is still favored. Flag `pair_favor`. |
| Off-shift visits | `offshift_*` in `src/state.js` sceneImages | Existing private hours, not a new conflict spine. |

Flags already in the engine inventory: `pair_shield`, `pair_grudge`,
`pair_favor`. `pair_turn` stays retired (L-023). Do not resurrect it.

## Constraints for any later implement ticket

1. **L-046** — fixed event order unless Manraj reopens it. New conflict
   beats may only attach to existing offer sites (`crew_walk`, the
   `scenes-16.js` pair offers, `faction_split`). No parallel spine.
2. **Schema** — scenes stay `text | choices | onEnter | image`. No new
   state namespaces. No new meters. Lean remains `living` / `future`.
3. **Living cast** — dead or unrecovered names never speak or appear.
   Entry gates use `alive` / `aliveAll` / `isAlive` already in tree.
4. **Amara-route** — PARKED. Reuse `pair_favor_confront` / `quiet_amara`
   as-is. Do not add romance or tray scenes under a conflict identity.
5. **Art** — reuse in-tree plates named above. No regen, no Grok plates,
   no official-portrait-as-conflict-stand-in.
6. **Release** — no 0.36, no tag, no Netlify, no certify.

## Proposed later shape (not this PR)

A future `SUN-PLAYTEST-CREW-CONFLICT-01` (name reserved; do not mint here)
may, after owner approval:

- Add at most **one** additional living-gated choice on `crew_walk` that
  routes into an **existing** quiet or pair scene, or
- Tighten copy on `faction_split` / `pair_*` so the already-written
  disagreement is readable as crew conflict, without new flags.

It may not:

- add a conflict meter, relationship grid, or “resolve tension” HUD;
- invent named permanent crew;
- reorder the mid-game variety / stores-coolant spine;
- treat this design file as authorization to ship prose.

Owner approves the implement ticket separately. This page is not that
approval.

## Out of scope here

- `src/**`, `css/**`, `images/**`, `index.html`
- Amara-route content
- Commander creation (item 12)
- Ending cinematic art (item 13)
- STATUS / ROADMAP / LOCKS edits

## Stop

Merge-commit this note into the version lane. Then stop. Do not start the
implement identity on this branch.
