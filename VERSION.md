# Sunsplitter v0.28

**Crew Pairs + The Last Off-Shift + Scheduled Warmth**

## Changes
One concern package under Grok locks 1–10 (2026-08-16).

1. **New file** `src/scenes-crewpairs.js` (registerScenes), loaded between scenes-promises.js and scenes-late.js.
2. **faction_split onEnter** second guard: `if (!state.flags.junctionChoice) return "offshift_open"`.
3. **The Last Off-Shift** (10 scenes): offshift_open + 8 character beats + offshift_tomas_r. Population rule, eligibility helpers, partner-unchosen closing lines.
4. **Crew pairs (core):**
   - Pair 1 Elias→Mira: cold micro-scene `pair_shield_cold` (Mira-dead + attributable). Alive-Mira branch + A.3 swap **cut** (LOCK 4 — no markedAgainst substrate).
   - Pair 2 Tomas↔Jiro: `pair_grudge_settle` + entry on act3_spine_next.
   - Pair 3 Amara→Sela: `pair_favor_confront` + entry on act3_spine_next.
   - Pair 4 Jiro→Lena: helpers only this version (pair_turn flag ready).
5. **Scheduled warmth** (3 one-shots): warmth_meal, warmth_laughter, warmth_music — entries on act3_spine_next.
6. **State:** 11 new flags; helpers elig*, attributableDeath*, leansLiving, stillFavoring, neglected, partnerUnchosen, closingPartnerLine. sceneImages REUSE only.
7. **Phrase spends:** Elias card + mint in pair_shield_cold / offshift_elias; Amara card in offshift_amara; Tomas alternate make in offshift_tomas (absent-gate).
8. **LOCK 8:** offshift_vess "Answer it" may spend last_tx_spent.

VERSION = "0.28".

## Out of scope
- Pair 1 alive-Mira branch / swap (no substrate)
- Full cascade of unchosen-debt downstream hosts
- Cascade Allusive (still 0.29)
- Ticket 2 new-crew indicator

## Next
Playtest 0.28 → 0.29 What Remains / cascade allusive, or Ticket 2 after lock.
