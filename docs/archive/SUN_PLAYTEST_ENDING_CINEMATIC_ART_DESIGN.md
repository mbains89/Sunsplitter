# SUN-PLAYTEST-ENDING-CINEMATIC-ART-DESIGN-01

SOURCE lane@391483c2 · TASK SUN-PLAYTEST-ENDING-CINEMATIC-ART-DESIGN-01 · MODE proposal

Playtest follow-up item 13 (“Ending cinematic art”).
**Paper only.** This file does not generate JPEGs, retarget `sceneImages`,
edit `showCinematic`, or open 0.36. Last certified remains `0.28.1d`.
**NO-PUBLISH / NOT_CERTIFIED.**

Lane: `version/0.30.1-main-reconcile-ci.1`.
Authority: DRAIN sun playtest-P2 · owner · 2026-09-03.
Base: `391483c2a614523857168c6c1f34cf73e9e6d57a` (PR161 tip).

## Scope of this ticket

- Record what the ending *cinematic* already shows versus the ending
  *screen*.
- Bound a later implement ticket so it cannot bake ending titles, hull
  numbers, or Commander faces into a bookend plate.
- Do **not** generate plates here. Generation stays on grok.com after
  owner locks `artifacts/SUN_ART_STYLE_BIBLE.md`.
- Do **not** wire a new ending bookend in this PR.
- Items 11–12 stay paper. P5 content stays PARKED until owner greenlights
  gameplay or an approved plate.

## Non-goals (this PR)

- No gameplay code: no `src/**`, `css/**`, `images/**`, `index.html`.
- No new JPEG, regen, Grok Bot / Cursor generation, or ART-R2 campaign.
- No `sceneImages` / `currentEndingArt` / cinematic source change.
- No ending prose rewrite. No new ending ids.
- No commander-creation implement. No crew-conflict implement.
- No STATUS / ROADMAP / LOCKS edits.
- No 0.36, tag, Netlify, certify, or publish.
- This page is not approval to ship a plate or a wire.

## Observed map (code at BASE)

Two different surfaces. Item 13 is the first one, not the second.

| Surface | Path | What it already does |
|---|---|---|
| Ending cinematic bookend | `src/engine.js` `showCinematic("ending")` | Frames = first two paragraphs of `#ending-text`. Image is hard-set to `images/onboarding_background.jpg` (empty corridor / stars). Alt: empty-ship corridor. |
| Intro cinematic (contrast) | `src/validate.js` `INTRO_SLIDE_ART` | Per-slide in-tree plates: `cascade_records.jpg`, `ship_exterior_2.jpg`, `arc_living_conflict.jpg`. |
| Ending screen | `#ending-image` + `currentEndingArt` | Outcome-selected plate from resolve. Unchanged when the cinematic finishes. |
| What remains | `#what-remains-image` | Same `currentEndingArt` when that screen is active. |
| Cinematic proof | `scripts/cinematic-checks.mjs` | Asserts cinematic image is `onboarding_background.jpg` and that `#ending-image` keeps `currentEndingArt` after Skip/complete. |

Why the bookend is neutral (V035 cinematics ticket): enlarging the
outcome plate on the cinematic surface repeated a baked-in hull number.
The ending *screen* kept its selected art. Item 13 is the request for a
**cinematic-only** plate that is not that outcome plate and not a
second copy of the title corridor unless owner says reuse is enough.

## Constraints for any later implement ticket

1. **Do not generate in Cursor / Grok Bot.** Owner approves each plate in
   grok.com. Style bible is still **DRAFT** until Manraj locks it.
2. **Cinematic ≠ ending screen.** A new bookend must not replace
   `currentEndingArt` on `#ending-image`. Skip/complete must still reveal
   the unchanged resolved ending and save bytes.
3. **No baked text.** ROADMAP art lock: no ending titles, ship names,
   system copy, or HUD numbers in the plate.
4. **L-025.** Commander stays faceless. Hands / back / silhouette only if
   a figure appears. No Commander portrait.
5. **Roster honesty.** Prefer empty architecture or at most two living
   identifiable faces, and only if the ending’s live roster makes that
   honest. Dead / unrecovered names stay off the bookend.
6. **Reuse first.** Prefer an in-tree crew-free plate over a new binary.
   `onboarding_background.jpg` is already the legal default.
7. **One plate vs many.** Do not invent a unique bookend per ending id
   unless owner explicitly asks. Default is one shared cinematic still.
8. **Release.** No 0.36, no tag, no Netlify, no certify. No ART-R2 reopen.

## Proposed later shape (not this PR)

A future `SUN-PLAYTEST-ENDING-CINEMATIC-ART-01` (name reserved; do not
mint here) may, after owner approval **and** a grok.com PASS plate (or an
explicit reuse ruling):

- point `showCinematic("ending")` at one owner-named in-tree JPEG instead
  of `onboarding_background.jpg`, and update `cinematic-checks.mjs` to
  match, or
- keep the corridor bookend and record item 13 as **ALREADY_SATISFIED**
  if owner rules the current still is the ending cinematic art.

It may not:

- put `currentEndingArt` onto `#cinematic-image`;
- bake the ending title into pixels;
- generate the JPEG in this repo session;
- treat this design file as wiring authority.

Owner approves the implement ticket separately. This page is not that
approval.

## Open questions (owner)

These block a wire. Do not answer them by shipping a JPEG on this branch.

1. Is `images/onboarding_background.jpg` enough (item 13 =
   ALREADY_SATISFIED), or is a distinct ending-bookend plate required?
2. If distinct: reuse which in-tree crew-free plate, or wait for a
   grok.com still after the style-bible lock?
3. One shared bookend for every ending, or per-ending stills?
4. May the bookend show living-cast figures at all, or architecture only?
5. When does owner greenlight `SUN-PLAYTEST-ENDING-CINEMATIC-ART-01`?

## Out of scope here

- `src/**`, `css/**`, `images/**`, `index.html`
- Style-bible lock (item 2) and body_ref pack (item 3)
- Event-plate grok.com loop (item 4)
- Crew-conflict implement (item 11)
- Commander-creation implement (item 12)
- STATUS / ROADMAP / LOCKS edits

## Stop

Merge-commit this note into the version lane. Then stop. Do not generate
plates and do not start the implement identity on this branch.
