# SUN-CASCADE-SECOND-FLAG-PAYOFF-01

Lane: `version/0.30.1-main-reconcile-ci.1`
Branch: `ticket/0.30.1-cascade-second-flag-payoff-01`

## What landed

Late spoken payoff of the already-recorded midgame flag
`state.flags.manifest` (`read` | `declined`), written at `empty_berths`.

Host: `reckon_public` text getter in `src/scenes-26.js` (after `faction_split`,
before `sun_payoff`). Tomas if alive; narrator if not. Replace-when-set:
unset flag keeps the existing Tomas-nod sentence.

## Not a remint

- SUN-CASCADE-ALLUSIVE-PAYOFF-01 (PR #351) pays `changeorders` on
  `reckon_summary` in `src/scenes-27.js`. Untouched.
- SUN-MIDGAME-DELAYED-CONSEQUENCE-01 (PR #311) pays `changeorders` on
  `faction_split` in `src/scenes-25.js`. Untouched.
- SUN-MIDGAME-DELAYED-CONSEQUENCE-02 (PR #339) pays `manifest` on
  `faction_split`. Untouched. No Amara speaker here.

## Out of scope

No new cast. No art. No new scene id. No `flags.elias_question` write.
Does not spend Tomas reserved phrase "People were tier four."
No Amara speaker. No embryo digits. No 0.37. No Netlify. No VERSION paint change.
Does not import into `verify.mjs` (same pattern as #351).

## Prove

```
node scripts/cascade-second-flag-payoff-checks.mjs
```

Static source-includes against `src/scenes-26.js`.
