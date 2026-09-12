# SUN-V036-PLAY-AGAIN-CLEAR-01

## Verdict

**ALREADY_SATISFIED** at lock.

`playAgain()` must keep the completed slot on disk via `preserveCompletedSlotUntilChoice: true` until the player commits a real choice. Clearing on Play Again fails `version-verify` (completed-slot custody / Continue restore).

Resume showing a finished run is Continue custody, not a ghost bug.

IDLE_FOR_ORCH · SUN-V036-PLAY-AGAIN-CLEAR-01 · ALREADY_SATISFIED
