# SUN-FEED-DESKTOP-MATRIX-HARNESS-01

Base: `version/0.30.1-main-reconcile-ci.1` @ `520be6ad`. Branch from current lane tip, not `main`.

Already done only counts with proof, then start the next queued job in the same run.

## Visible change
No new story. A builder can run one harness that records desktop viewport, keyboard reachability of choices, and that phone layout rules are still present. The player-facing game bytes do not fork.

## Not this job
Do not edit `style.css`. Window Resize owns layout. Do not call this an exit of 0.36. Do not add Electron, Tauri, or gamepad. Do not Netlify.

## Files
- `scripts/` harness only
- a short note in the PR body of viewports checked

## Acceptance
- Proof: harness exits 0 on the lane tip and names the SHA.
- It fails if choice buttons are absent or if a PC-only scene id appears.
- Shared scene data, saves, and endings are asserted, not redesigned.

## Dependencies
Parallel with keyboard choice and save-export. After Window Resize before anyone treats the matrix as 0.36 passed. 0.36 passed is ASK-FIRST.

## End
Open one pull request into `version/0.30.1-main-reconcile-ci.1`.

IDLE_FOR_ORCH · SUN-FEED-DESKTOP-MATRIX-HARNESS-01 · PR|NO_PR · reason
