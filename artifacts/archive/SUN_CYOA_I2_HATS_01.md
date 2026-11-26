# SUN-CYOA-I2-HATS-LOCK-01

I2 plan lock. Docs only. Not certification. Not a remint.
`NO-PUBLISH / NOT_CERTIFIED`. Paint `0.33`. Certified remains `0.28.1d`.
Base tip: `43cec532bb11d5087cde1c660a5e6185d3facf34`.

I1 (choice-bucket honesty) is complete at this tip (PR 179–182).
I2 makes three already-written midgame decisions irrevocable by giving each
value an exclusive follow-through pack. Other hats do not render that pack.

No new flag keys. No new `src/` files (58-script lock). No art wiring.
No new romance discovery beats. No playtest-backlog tickets in I2.

## Hats (every run writes all three)

| Hat | Flag | Values | Written at |
|---|---|---|---|
| A Command | `flags.leadership` | `together` \| `hard` \| `watch` | `lead_prompt` (`src/scenes-42.js`) |
| B Doctrine | `flags.mid_arc` | `living` \| `future` | `arc_fork` (`src/scenes-06.js`) |
| C Custody | `flags.vault_sacrifice` | `living` \| `future` \| `split` | `vault_sacrifice` (`src/scenes-09.js`) |

`flags.vault_priority` (`living` \| `future` \| `both` at `vault_reveal`) is the earlier mandate C confirms.
`flags.cascade_truth` is future-path only (`arc_future_3`). It is not a hat.

Engine domains already lock the value sets (`src/engine.js`).

## Irrevocable means

Once the flag is set, later tickets must:

1. Refuse to rewrite the flag.
2. Offer the matching pack only.
3. Skip the other values' exclusive beats (`onEnter` redirect or omit the choice).
4. Keep a legal exit when a pack scene is skipped (existing spine next).

Flavor sentences on shared scenes may still mention the hat.
Exclusive *beats* must not.

## Pack tickets (one PR each, after this lock)

### SUN-CYOA-I2-HAT-A-PACK-01 — Command

Reuse scenes already in `src/scenes-42.js` / pair-warmth files. No new IDs required
if gating existing optional beats is enough; new IDs only inside an existing file.

| Value | Exclusive follow-through (reuse image) |
|---|---|
| `together` | Keep `lead_together` as the only full assembly beat. Image: `images/observation_bridge_alt.jpg` |
| `hard` | Keep `lead_hard` plus `pair_shield_cold` when Elias lives and Mira does not. Image: existing pair/board plates |
| `watch` | Keep `lead_watch` as the only "who is already talking" beat. Image: existing observation plate |

Shared `lead_prompt` stays the chooser. Do not add a fourth leadership value.

### SUN-CYOA-I2-HAT-B-PACK-01 — Doctrine

Reuse ideology spine already split by I1 (`arc_living_*` vs `arc_future_*`).

| Value | Exclusive follow-through (reuse image) |
|---|---|
| `living` | `arc_living_1`…`arc_living_4` + `vault_sacrifice` living pole. Image: `images/arc_living_conflict.jpg` |
| `future` | `arc_future_1`…`arc_future_4` + cascade records. Image: `images/cascade_records.jpg` / `images/vault_interior_alt.jpg` |

A living run must not present `arc_future_*`. A future run must not present `arc_living_*`.
That lock is the pack. Do not invent a third doctrine value.

### SUN-CYOA-I2-HAT-C-PACK-01 — Custody

Reuse `vault_sacrifice` confirmation. `vault_priority` remains the earlier mandate.

| Value | Exclusive follow-through (reuse image) |
|---|---|
| `living` | Habitation-first aftermath on the vault face. Image: `images/vault_reveal.jpg` |
| `future` | Restart-package-first aftermath. Image: `images/vault_sacrifice.jpg` |
| `split` | Dual-degrade aftermath only. Same plates. No third plate. |

Do not invent a fourth vault_sacrifice value.

## Out of scope

- Romance discovery / other-women-find-out beats (OPEN-GATED)
- Art regen, plate wiring, Canon wake
- Event-order mixer (already on tip)
- Playtest UX tickets (IMAGE-DOUBLETAP, TITLE-CONTRAST, CREW-JOIN)
- `0.36` mint

## Done when

All three pack tickets are merged on the version lane and a living-run vs future-run
vs each leadership value cannot see another hat's exclusive beat.
Then `I2_COMPLETE`.
