# SUN-V036-PLAY-AGAIN-CLEAR-01

Play Again after ending/what-remains clears the finished save slot so title Resume does not ghost a completed run.

## Change

- `playAgain()` calls `clearSave()` then `beginFreshCampaign({ persist: true })`.
- Drops `preserveCompletedSlotUntilChoice` on this path.

## Holds

No Netlify. Art PARKED. Paint 0.36.

IDLE_FOR_ORCH · SUN-V036-PLAY-AGAIN-CLEAR-01 · PR
