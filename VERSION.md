# Sunsplitter v0.27.2

**Allusion Carriers (Promise Re-surfacing)** — complete

## Changes
One concern only. Place one mid-run diegetic allusion per made promise so a player who accepted early cannot hit the keep/break test after a long session gap with zero reminder. Anti-gotcha only. Allude; never repeat the full contract sentence.

1. **Hosts (existing pure-data):**
   - Amara → `act2_tether_sighting` (after her green-light line)
   - Elias → `act2_tether_sighting` (after his suit-prep line)
   - Mira → `act3_reckoning_pattern` (after her drift-schedule open)
   - Lena → `act3_reckoning_pattern` (after her hypercapnic line)
   - Sela → `act3_reckoning_pattern` (after her faith/arithmetic line)
   - Tomas → `act3_spine_next` (corridor beat after bond return / make)
2. **Gates:** `promises.<who> === "made" && isAlive(<who>) && !flags.prom_<who>_alluded`
3. **One-shot flags:** `prom_amara_alluded`, `prom_tomas_alluded`, `prom_elias_alluded`, `prom_lena_alluded`, `prom_sela_alluded`, `prom_mira_alluded` — written on render; added to validate.js engineFlags
4. Exact rider lines from MINTED_PHRASES RESERVED block — no rewrite
5. No new scenes, no new prose invention, no art, no make/test cluster placement

VERSION = "0.27.2".

## Validate
191 scenes (unchanged), 0 syntax errors. All six phrases appear once.

## Zip
`artifacts/sun-v0.27.2-net.zip`

## Out of scope
- 0.28 Off-Shift / pairs
- Ticket 2 new-crew indicator
- Cascade Allusive
- Contract sentence rewrites

## Next
0.28 Off-Shift + pairs, or Ticket 2 after Grok lock.
