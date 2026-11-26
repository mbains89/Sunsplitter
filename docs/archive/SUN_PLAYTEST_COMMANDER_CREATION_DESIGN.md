# SUN-PLAYTEST-COMMANDER-CREATION-DESIGN-01

SOURCE lane@636479e8 · TASK SUN-PLAYTEST-COMMANDER-CREATION-DESIGN-01 · MODE proposal

Playtest follow-up item 12 (“Commander creation — light hybrid”).
**Paper only.** This file does not wire screens, mint save fields, generate
art, or open 0.36. Last certified remains `0.28.1d`.
**NO-PUBLISH / NOT_CERTIFIED.**

Lane: `version/0.30.1-main-reconcile-ci.1`.
Authority: DRAIN sun playtest-P2 · owner · 2026-09-03.
Base: `636479e8e7a01f26732fb0aeb4724d68e3477799` (PR160 tip).

## Scope of this ticket

- Record that the player is already **the Commander** in title / tone /
  wake prose, with no player-authored identity.
- Bound a later implement ticket to a **light hybrid** only:
  **callsign**, **seal**, **oath**. Nothing else.
- Do **not** implement a creation screen here.
- Do **not** invent full chargen (stats, look, background tree, pronouns
  as a system, skill picks, starting loadout).
- Crew-conflict design (item 11) is already papered separately.
- P5 content stays PARKED until owner greenlights gameplay.

## Non-goals (this PR)

- No gameplay code: no `src/**`, `css/**`, `images/**`, `index.html`.
- No new scenes, flags, save-schema keys, HUD, or creation screen.
- No full chargen. No appearance sliders. No origin / class / skill tree.
- No portrait of the Commander. No new art.
- No Amara-route, no crew-conflict implement, no ending-cinematic art.
- No STATUS / ROADMAP / LOCKS edits.
- No 0.36, tag, Netlify, certify, or publish.
- This page is not approval to ship creation content.

## Observed map (code at BASE)

The run already treats the player as Commander. There is no player name
field and no creation beat between title and wake.

| Surface | Path | What it already does |
|---|---|---|
| Tone / title copy | `index.html` | “You are the Commander of the last ship out.” |
| Intro line 3 | `index.html` `#intro-line-3` | Commander named as role, not as a person with a callsign. |
| Fresh run | `src/engine.js` `beginFreshCampaign` / `startGame` | Title → confirm → intro cinematic → `wake`. No identity prompt. |
| Save v3 | `src/engine.js` `SAVE_KEY` / schema 3 | Scene, resources, flags, affinity, trust, romance. No callsign / seal / oath keys. |
| Crew roster | `src/state.js` `crew` | Named living cast. The Commander is not a `crew` entry. |
| Crew sheet | `src/validate.js` + `#crew-sheet` | Official bodysuit plates for the nine + Rourke. No Commander plate. |

Do not invent a tenth crew row or a Commander portrait to stand in for a seal.

## Light hybrid (definition)

A later implement ticket, if owner approves, may add **at most three**
player-authored tokens:

1. **Callsign** — short spoken handle. Display and address only.
2. **Seal** — a **named choice from an in-tree plate or existing glyph**,
   not a new drawing tool and not a generated portrait.
3. **Oath** — one short sworn line from a **closed list** (not free-text
   essay). Living / Future lean may color which oaths are offered; the
   oath itself is flavor plus at most one existing lean nudge, not a new
   meter.

Hybrid means: the role stays “Commander” (fixed); only those three tokens
are player-picked. The rest of chargen stays closed.

## Constraints for any later implement ticket

1. **Attach point** — only after owner-chosen title / new-run success,
   before or instead of the existing intro cinematic. Do not insert a
   second spine after `wake`. Do not block Continue on a mid-run save
   that has no tokens.
2. **Schema** — if tokens persist, they are optional string / enum fields
   on the existing save object. No new save key family. Missing tokens
   on old slots stay valid; Continue must not crash.
3. **Scene shape** — any later screen stays existing UI patterns
   (title-actions / hidden panel / cinematic). Scenes remain
   `text | choices | onEnter | image`. No chargen widget kit.
4. **No stats** — callsign / seal / oath must not gate hull, supplies,
   embryos, cohesion, or starting crew counts.
5. **Art** — seal options reuse in-tree images only. No regen, no Grok
   plates, no official-portrait-as-Commander-stand-in.
6. **Amara-route / crew conflict** — PARKED or already-papered. Creation
   must not open those identities.
7. **Release** — no 0.36, no tag, no Netlify, no certify.

## Proposed later shape (not this PR)

A future `SUN-PLAYTEST-COMMANDER-CREATION-01` (name reserved; do not mint
here) may, after owner approval:

- add one title-adjacent panel that collects callsign + seal + oath, then
  proceeds into the existing intro / `wake` path, or
- persist those three tokens on new runs only, with Continue reading them
  when present and ignoring them when absent.

It may not:

- add a full chargen (look, background, skills, loadout, pronouns system);
- add a Commander crew-sheet row or new portrait;
- require tokens on imported / pre-change saves;
- treat this design file as authorization to ship UI.

Owner approves the implement ticket separately. This page is not that
approval.

## Open questions (owner)

These block P5 content. Do not answer them by shipping screens on this branch.

1. Attach point: after New run confirm, after intro Skip, or a replace of
   the intro cinematic?
2. Callsign: typed (length-capped) or picked from a closed list?
3. Seal: which in-tree plates are legal options? Is a seal required or
   skippable?
4. Oath: Living / Future closed list only, or a third pragmatic line?
   Does picking an oath nudge `ideology` or stay display-only?
5. Do old saves without tokens stay silent (no backfill prompt)?
6. When does owner greenlight `SUN-PLAYTEST-COMMANDER-CREATION-01`?

## Out of scope here

- `src/**`, `css/**`, `images/**`, `index.html`
- Full chargen
- Amara-route content
- Crew-conflict implement (item 11)
- Ending cinematic art (item 13)
- STATUS / ROADMAP / LOCKS edits

## Stop

Merge-commit this note into the version lane. Then stop. Do not start the
implement identity on this branch.
