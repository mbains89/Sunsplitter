# SUN-BUGHUNT-01 progress

Branch: ticket/sun-bughunt-01
Tip base: 520be6ad
Branch head at last confirmed push: 5c51549 (cylinder line only)
No PR yet. Do not merge until the check is green on the branch.

## Done

- Hunt on tip 520be6ad. Smoke sim 64/64, no dead ends. Embryo line already 140,006.
- BH-03 landed: src/scenes-17.js whole ring complain changed to whole cylinder complain (5c51549).
- Local tree passes node scripts/sun-bughunt-01-checks.mjs. engine.js 94018 B. resolveSceneImage body untouched.
- BH-01 read sites patched locally to visibleLivingCrewCount(). Stored meter stays 9.
- BH-02 habitation decks, BH-04 two-name vent memorial, BH-05 house key instead of child's shoe, BH-06 Tomas cross prose removed. Local only.

## Next

- Push scenes-27, scenes-26, scenes-40, scenes-03, engine.js onto this branch.
- Re-run the check against the branch.
- Open one PR. Ori registers the check after $S2. Do not edit verify.mjs.

## Decisions

- Do not change freshState.survivors (stays 9). Changing it moves the CREWPLATE plate rule in resolveSceneImage.
- Player-facing survivor reads use visibleLivingCrewCount().
- No css, no index script list, no images, no VERSION, no Netlify, no shared docs.

## Failing checks

- Branch check will fail until the local source patches land. Tip fail: reckon_summary prints Survivors: 8 after Rourke while the board is 5.
- GitHub write tools rate-limited after 5c51549. Heartbeat is this file.

## Next step

Push the remaining source files, then open the PR.
