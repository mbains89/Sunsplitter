# SUN-FEED-KEYBOARD-CHOICE-01

Base: `version/0.30.1-main-reconcile-ci.1` @ `520be6ad`. Branch from current lane tip, not `main`.

Already done only counts with proof, then start the next queued job in the same run.

## Visible change
On a desktop browser, number keys 1–9 select the matching enabled choice, and Enter or Space activates the focused choice. Focus ring is visible. Disabled choices are not activated. Phone touch still works.

## Not this job
Do not restyle hover, pressed, disabled, or selected. Button States owns those. Do not change plate layout. Window Resize owns `style.css`. Do not touch crew-plate F07. Do not generate portraits.

## Files
- `src/engine.js` keydown / choice focus only
- a small harness under `scripts/` if one already exists for keys
- do not edit `style.css`

## Acceptance
- Proof: a keyboard-only path from title into the first scene and through one choice, with a note of the SHA.
- Disabled choice is skipped, not fired.
- No new story, no new flags, no Netlify.

## Dependencies
Parallel with save-export and desktop-matrix if this job does not edit `index.html`. Sequential with any job that also edits `src/engine.js`.

## End
Open one pull request into `version/0.30.1-main-reconcile-ci.1`. Docs-only counts as not done.

IDLE_FOR_ORCH · SUN-FEED-KEYBOARD-CHOICE-01 · PR|NO_PR · reason
