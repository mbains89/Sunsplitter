# GitHub push rules for Sunsplitter (LOCKED)

## Never
- Never commit a placeholder / stub that removes runtime functions (state.js, engine.js).
- Never rewrite index.html to load a new script until that script file is already on the branch.
- Never leave main in a non-runnable state between commits.

## Always
1. Source of truth for a version push = the shipped zip (`sun-vX.X.X-net.zip`).
2. Convert `js/` → `src/` for GitHub layout before push.
3. Push order (atomic-safe):
   a. New scene files first (create, no dependents yet)
   b. state.js / validate.js / engine.js (full content only)
   c. scenes-*.js that already exist (full content only)
   d. index.html last (wires new scripts)
   e. VERSION.md + canon docs
4. One commit per file for files > ~20KB if multi-file push is flaky; otherwise one commit for the whole version.
5. After every push: `curl` raw.githubusercontent.com for VERSION + state.js first 5 lines + script list in index.
6. If a push fails mid-way: restore the last known-good file from the zip before doing anything else.

## Layout map
- Zip `js/*.js` → GitHub `src/*.js`
- Zip `index.html` script tags: `js/` → `src/`
- Zip has no `artifacts/` canon; PROJECT_STATUS / MINTED live under GitHub `artifacts/`

## Playtest rule
Until `src/state.js` contains `function isAlive` and `const VERSION = "X.Y.Z"`, do not play from GitHub/Netlify — use the zip only.
