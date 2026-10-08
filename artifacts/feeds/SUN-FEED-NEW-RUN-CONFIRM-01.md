# SUN-FEED-NEW-RUN-CONFIRM-01

Base: `version/0.30.1-main-reconcile-ci.1` @ `520be6ad`. Branch from current lane tip, not `main`.

Already done only counts with proof, then start the next queued job in the same run.

## Visible change
If a local save exists, New Run asks once before it wipes that save. Confirm starts a fresh run. Cancel returns to the title with the old save intact. Continue still loads the save.

## Not this job
Do not add cloud saves, accounts, or a new save format. Do not change Continue crew-count (landed). Do not edit `style.css`.

## Files
- title / new-run handler in `index.html` or the title module already used for New Run
- do not edit ending scenes

## Acceptance
- Proof: with a save present, Cancel leaves the save byte-for-byte; Confirm clears it and starts wake.
- No save present: New Run starts without a dead-end dialog.
- No Netlify. Playtest gate is an owner call.

## Dependencies
Sequential before ending-skip and what-remains only if they share title chrome. Otherwise parallel.

## End
Open one pull request into `version/0.30.1-main-reconcile-ci.1`.

IDLE_FOR_ORCH · SUN-FEED-NEW-RUN-CONFIRM-01 · PR|NO_PR · reason
