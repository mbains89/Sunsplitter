# SUN-CASCADE-ALLUSIVE-PAYOFF-01

Lane: `version/0.30.1-main-reconcile-ci.1`
Branch: `ticket/0.30.1-cascade-allusive-payoff-01`

## What landed

Late spoken/summary payoff of the already-recorded midgame flag
`state.flags.changeorders` (`logged` | `buried`), written by
`records_changeorders` in `src/scenes-07.js`.

Host: `reckon_summary` text getter in `src/scenes-27.js` (after
`faction_split`, before the final order). Mira if alive; narrator if not.

## Not a remint

- SUN-MIDGAME-DELAYED-CONSEQUENCE-01 (PR #311) pays `changeorders` on
  `faction_split` in `src/scenes-25.js`. Untouched.
- SUN-MIDGAME-DELAYED-CONSEQUENCE-02 (PR #339) pays `manifest` on
  `faction_split`. Untouched. No Amara speaker here.

## Out of scope

No new cast. No art. No new scene id. No `flags.elias_question` write.
Does not spend Tomas reserved phrase "People were tier four."
No 0.37. No Netlify. No VERSION paint change.

## Prove

```
node scripts/cascade-allusive-payoff-checks.mjs
```

Static source-includes against `src/scenes-27.js`.
