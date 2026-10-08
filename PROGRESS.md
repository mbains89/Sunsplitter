# PROGRESS — SUN-CREWPLATE-F07-01

Branch: ticket/sun-crewplate-f07-01
Lane: version/0.30.1-main-reconcile-ci.1
Tip base: 520be6ad4d8dcfc26df0e6668ee81de458bf17ad (#434)
engine.js: untouched, 93575 bytes

## Done
- Defect confirmed at tip. toggleCrewPanel adds minimized on open. wireCrewDisclosureKeyboard closes on Escape by flipping classes and never calls toggleCrewPanel. #433 wrap only covers the button path.
- Overlay on src/hitl-unshadow.js (56530c4e): class observer on #crew-panel plus a late Escape listener. Removes minimized and rebinds #scene-image. Does not second-toggle.
- Checks in scripts/hitl-unshadow-checks.mjs (1323b0a5). Tip fixture FAIL (Esc leaves minimized, src null). Branch overlay PASS (button close, Esc close, open → showScene → close).

## Next
- Open PR1 into the lane. Myth portrait check required. Ori merges only after Myth OK and CI green.
- Stack ticket/sun-crewplate-presence-01. Do not return images/corridor.jpg for crisis / priority_repairs / aftermath / arc_living_3 / crew_walk / status when the pictured people are absent.

## Decisions
- engine.js not edited.
- corridor.jpg is the silver-hair Vess lookalike. Not a fallback.
- corridor_variant.jpg has three people (red-hair woman, dark-hair man with tablet, curly back). Rejected as the presence plate.
- Person-free plate already in tree: images/corridor_pressure_3.jpg (empty corridor; engine already uses it as a dead fallback). observation_bridge_alt_2.jpg is also empty.
- No new image bytes. No CSS, verify.mjs, index.html, VERSION, Netlify.

## Failing checks
- None on the branch overlay. Tip overlay fails the F07 probe, which is the required red run.

## Next step
- Open PR1. Then presence branch + PR2 stacked on this branch.
