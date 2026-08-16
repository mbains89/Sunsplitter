# Sunsplitter — Minted Phrases Ledger

**Last verified against build:** v0.28  
**Purpose:** Track distinctive spoken lines that must appear only where authored (no accidental reuse, no silent drift). Contract-class promises appear exactly twice per run (make + quote-back); source may contain a third afterglow make that is mutually exclusive with the standard make via interstitial bounce.

## SPENT in shipped build

| Phrase | Speaker | Scene | Version | Notes |
|--------|---------|-------|---------|-------|
| the first piece of another world | Amara | breath_garden | 0.26 | Shipped. |
| I will not vent anyone who is still breathing. | Amara | prom_make_amara / prom_make_amara_ag + prom_vent_break quote-back | 0.27 | Contract-class. Max 2 renders/run (std make XOR afterglow make + break). |
| If the vault and the living need the same mercy, the living get it. | Tomas | prom_make_tomas + custody_after quote-back / offshift_tomas (absent-gate alternate) | 0.27 / 0.28 | Contract-class. Max ≤2 renders/run; late make exclusive with standard. |
| If Deck Four comes back, you hear it from me first. | Elias | prom_make_elias + prom_deck4_break quote-back | 0.27 | Contract-class. Two break branches exclusive. |
| I will never kill one of them to keep you. | Lena | prom_make_lena / prom_make_lena_ag + prom_line_break quote-back | 0.27 | Contract-class. Max 2 renders/run. |
| No one will use you as the price of their fear. | Sela | prom_make_sela + prom_price_break quote-back | 0.27 | Contract-class. |
| The living will decide what the future becomes. | Mira | prom_make_mira + prom_direct_break quote-back | 0.27 | Contract-class. |

| The beds are holding. So is your line in my book. I reread it when the air runs thin. | Amara | act2_tether_sighting | 0.27.2 | Allusion carrier. One-shot via prom_amara_alluded. |
| Names first, then numbers. You put the order of mercy on record once. I count easier since. | Tomas | act3_spine_next | 0.27.2 | Allusion carrier. One-shot via prom_tomas_alluded. |
| Deck Four pushed back another fragment last night. When it finishes, I hold you to the order of operations. | Elias | act2_tether_sighting | 0.27.2 | Allusion carrier. One-shot via prom_elias_alluded. |
| Inventory: one promise, stable. I check its vitals more often than yours. | Lena | act3_reckoning_pattern | 0.27.2 | Allusion carrier. One-shot via prom_lena_alluded. |
| I have inventoried what you have given me. One sentence about fear. It is rationed correctly. | Sela | act3_reckoning_pattern | 0.27.2 | Allusion carrier. One-shot via prom_sela_alluded. |
| Junction eleven quoted the dead at me again. I quoted you back. It complied. Precedent noted. | Mira | act3_reckoning_pattern | 0.27.2 | Allusion carrier. One-shot via prom_mira_alluded. |
| You did the math. I'm not arguing the math. Live in it like I have to. | Elias | pair_shield_cold | 0.28 | Card realization. |
| She was what the job was for. | Elias | pair_shield_cold / offshift_elias (dead-branch, exclusive via attributable guard) | 0.28 | Mint + spend; single use. |
| I'll not tell you it wasn't your doing. I'll tell you I'm still here. Mind the difference. | Amara | offshift_amara | 0.28 | Card realization. |

## Process
- On mint: add to this ledger with intended scene.
- On ship: move to SPENT with version.
- Never re-use a spent phrase in new prose without explicit lock.
- Contract-class rule (0.27 lock): each of the six promise sentences appears exactly twice per successful run path (make + owner quote-back). Source may hold a third mutually exclusive make (afterglow). Re-surfacing alludes only; never repeats the full sentence.
