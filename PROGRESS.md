# PROGRESS — SUN-CREWPLATE-F07-01

Branch: ticket/sun-crewplate-f07-01
Base: version/0.30.1-main-reconcile-ci.1 @ 520be6ad4d8dcfc26df0e6668ee81de458bf17ad
engine.js: not edited (93575 bytes)

## Done
- Defect confirmed at tip. Escape in wireCrewDisclosureKeyboard flips #crew-panel classes and bypasses the #433 toggleCrewPanel wrap, so minimized stays for the rest of the beat.
- Overlay landed in src/hitl-unshadow.js (56530c4e, blob 7e4d91c7). Class observer plus late Escape listener. Does not second-toggle.
- Checks landed in scripts/hitl-unshadow-checks.mjs (1323b0a5, blob 58f14781). Tip fixture fails Esc close. Branch static+behavior pass.
- Plates viewed. corridor.jpg is the silver-hair Vess lookalike. corridor_variant.jpg has three people. Person-free substitute named: images/corridor_pressure_3.jpg.

## Next
- Open PR1 into the lane. Myth portrait check required. No merge from this seat.
- Stack ticket/sun-crewplate-presence-01. Wrap resolveSceneImage so crisis / priority_repairs / aftermath / arc_living_3 / crew_walk / status never return corridor.jpg. Substitute corridor_pressure_3.jpg. No new image bytes.

## Decisions
- Do not edit engine.js, CSS, verify.mjs, index.html, VERSION, or shared docs.
- Do not use corridor_variant.jpg for the presence fallback.
- No Netlify. No tag. No certify.

## Failing checks
- None on the branch probe. Tip overlay still fails Esc close (expected).
- PR create was deduped last session; GitHub compare had no PR. Retrying.

## Next step
Open PR1, then presence branch.
