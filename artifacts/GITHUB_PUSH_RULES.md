# GitHub push rules for Sunsplitter (LOCKED)

**Zero-manual target (2026-08-16):** Grok pushes every version. Manraj never opens the GitHub editor unless Grok explicitly names a failed file after a verified push attempt.

## Never
- Never commit a placeholder / stub that removes runtime functions (state.js, engine.js).
- Never rewrite index.html to load a new script until that script file is already on the branch.
- Never leave main in a non-runnable state between commits.
- Never multi-file push a file that is > ~15–20 KB when the tool has been flaky — use one commit per large file instead.

## Always
1. Source of truth for a version push = the shipped zip (`sun-vX.X.X-net.zip`).
2. Convert `js/` → `src/` for GitHub layout before push.
3. Push order (atomic-safe):
   a. New scene files first (create, no dependents yet)
   b. state.js / validate.js / engine.js (full content only)
   c. scenes-*.js that already exist (full content only)
   d. index.html last (wires new scripts)
   e. VERSION.md + canon docs
4. **Size rule (strengthened):**
   - Files ≤ ~15 KB: may batch in one `push_files` commit.
   - Files > ~15–20 KB: **one file = one commit** via `create_or_update_file` (fetch current SHA first).
   - After every individual commit: verify with `curl` raw.githubusercontent.com before the next file.
5. After the full version push: verify VERSION + `state.js` first lines (must show correct VERSION + `function isAlive`) + full script list in index + at least one large-file marker (e.g. `forceResolvePromises` or package-specific string).
6. If a push fails mid-way: restore the last known-good file from the zip before doing anything else. Tell Manraj only if a restore still cannot be completed through the tool.
7. Do not ask Manraj to edit GitHub unless a specific file has failed tool push after a restore attempt.

## Layout map
- Zip `js/*.js` → GitHub `src/*.js`
- Zip `index.html` script tags: `js/` → `src/`
- Zip has no `artifacts/` canon; PROJECT_STATUS / MINTED live under GitHub `artifacts/` when pushed

## Playtest rule
Until `src/state.js` contains `function isAlive` and `const VERSION = "X.Y.Z"`, do not play from GitHub/Netlify — use the zip only.

## Structural note (push size + code discipline)
- Keep scene files under the ~1100-line act-split cap.
- Complete any pending `scenes-lethals.js` (or similar) splits when touching late content — reduces both line count and push payload.
- Do **not** split `state.js` / `engine.js` solely for push convenience; only if a later architectural ticket requires it.
