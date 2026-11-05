SOURCE main@8d23109 · RUNTIME 853c47fe · TASK SUN-V035-OPENING-BACKSTORY-01 · MODE implementation

Build / launch node, sole isolated writer. Owner-authorized write of the
queued opening-backstory leftover into `version/0.30.1-main-reconcile-ci.1`.
**NO-PUBLISH / NOT_CERTIFIED**; last certified remains 0.28.1d. Do not mint 0.36.

## Authority and reproduction

- Main authority: `8d23109b63b844e0703fb36643f14b91b8800c90`.
- Exact predecessor / write-lane HEAD: `853c47fe07a71f7ccf76e2243e066c4472198bea`
  (owner merge of PR 139). Hosted v0.33 is not this HEAD.
- AGENTS, ROADMAP, PROJECT_STATUS, LOCKS read from main@8d23109 in this
  session. Lane STATUS is newer than the stale main copy; no authority
  file was rewritten.
- Hunch verified: this ticket identity has no prior merge. PR 119 already
  wired the existing title prologue into the skippable intro cinematic.
  The missing work was the named proof that those frames stay the in-tree
  official account and do not become new invented cascade backstory.

## Existing opening, not new canon

Player-facing opening backstory already in tree, unchanged by this ticket:

1. `Earth failed in a cascade measured in hours.`
2. `The Sunsplitter was a colonization ark — built for thousands. Nine of you cleared the hatch.`
3. `You are the Commander. The ship is damaged. The living are already arguing about what to save.`

Plate: byte-identical `images/onboarding_background.jpg`.
Wake official-account sentence remains the existing
`Nine of you cleared the hatch. The official story is that the cascade gave you hours, maybe two days.`

`showCinematic("intro")` still reads `intro-line-1..3` from the title
prologue. No new scene, state key, plate, or contested-lane dump.

## Targeted proof

- Source: `index.html` intro lines match the in-tree official account.
- Source: `src/engine.js` reads those DOM lines and the existing plate;
  it does not hardcode opening prose.
- Source: `src/scenes-38.js` wake still carries the existing official
  hours-to-two-days sentence.
- Runtime: Begin and Play Again intro frames equal the parsed existing
  prologue, use the existing plate, then return to `wake`.
- Runtime: Continue does not invent a replacement opening.
- Runtime/source: later contested phrases (standoff operation, fragment
  train, minted boarding lines) are absent from opening surfaces.

## Files

- `scripts/opening-backstory-checks.mjs` — source + runtime opening proof.
- `scripts/verify.mjs` — wire the named check.
- this proof.

No `src/**`, art, STATUS, ROADMAP, or LOCKS edits.

## Limits and stop

Headless actual-engine / browser-stub evidence. Not a fresh phone or
hosted playtest. No deployed-byte or certification claim.

L-002 / L-009 / L-021 unchanged. Earth-calamity video remains CANDIDATE.
ART-R2 held as already landed plates. No remint 107–139, Ashes, 0.36,
Netlify, tag, or deploy.

Next action: required version-lane checks, then merge-commit this one PR.
Not squash.
