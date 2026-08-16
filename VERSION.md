# Sunsplitter v0.28.1

**Truth Repair (P0 + core P1)**

## Changes
One-concern causality fix from Monte Carlo FAIL for final lock.

1. **P0 — Dead Tomas speech removed** from Living exclusive crisis.
   - `breath_word_given` / `breath_word_refused` now gate all Tomas body/speech on `isAlive("tomas")`.
   - Public word flag still written; onset choices remain available when Tomas is dead.
2. **P1 — pair_shield_cold reachable**.
   - Added real Mira lethal causes `"finished the repair"` and `"would not leave the board"` to `ATTRIBUTABLE_CAUSES`.
3. **P1 — No dangling "made" promises into ending**.
   - Off-Shift Tomas accept now writes `"kept"` (pure Off-Shift vow) instead of `"made"`.
   - `forceResolvePromises()` runs at start of `resolveEnding()`: any remaining `"made"` → `"broken"`.

## Out of scope
Unreachable scenes (quiet_tomas, romance_amara_tomas*, reckon_truth) and unpaid resource costs deferred to 0.28.1b if needed.

## Validate
0 errors expected; scene count unchanged from 0.28.

## Zip
`artifacts/sun-v0.28.1-net.zip`
