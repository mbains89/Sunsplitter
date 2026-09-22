# SUN-MIDGAME-THIRD-CONSEQUENCE-APPLY-01

SOURCE main@8d23109b · RUNTIME 2e603ae40794cebb29f78dba55a6949f7d9d257d · TASK SUN-MIDGAME-THIRD-CONSEQUENCE-APPLY-01 · MODE implementation

Finishes the unpaid spoken payoff from spent ticket SUN-MIDGAME-THIRD-CONSEQUENCE-01 (PR #357 harness-only merge 55ef9c9c).
Not a remint of DELAYED-CONSEQUENCE-01/02 or #339 (boarding `flags.manifest`).
Not a remint of #351 / #353.

- Flag: `state.flags.manifest_exposed` | `state.flags.manifest_lie`
- Host: `faction_split` in `src/scenes-25.js`
- Unset silent. Speakers: Tomas else Amara else narrator.
- Reserved Tomas phrase unspent.
- `flags.elias_question` stays cold.
- VERSION.md untouched. No JPEG. No 0.37. No Netlify.

Prove:

```
node scripts/midgame-third-consequence-checks.mjs
```
