# Sunsplitter v0.28.1b

**Unreachable scenes + unpaid resource costs**

## Changes
One-concern causality hygiene after 0.28.1 Truth Repair.

1. **quiet_tomas reachable** — offered once from `act3_spine_next` after Tomas recovery (early offer was dead while unrecovered). `quiet_tomas_done` flag.
2. **romance_amara_tomas / _sex reachable** — also offered from `act3_spine_next` when both alive + hydro full (intimacy_window can fire before recovery).
3. **reckon_truth reachable** — fourth `faction_split` option sets `reckon: "truth"`.
4. **Unpaid costs gated** — `canAffordEffects`: choices whose negative resource effects cannot be fully paid are disabled ("Cannot pay the full cost"). No silent free lunch. `faction_split` suppress gains `requires: supplies min 2`.

No new story volume. No art. No 0.29.
