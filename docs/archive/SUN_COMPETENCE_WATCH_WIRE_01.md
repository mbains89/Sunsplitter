# SUN-COMPETENCE-WATCH-WIRE-01

- event: `competence_watch` → `images/competence_watch.jpg` (NEW plate; remap in `src/state.js`)
- plate: owner APPROVED + Canon PASS (plate + wire path) 2026-09-19 ~12:35 PM CT
- source hex16 (PNG HITL v1): `ac902af751e81d56` · 784×1168 · brief#3
- tip base: `f97520dff1ea` (`version/0.30.1-main-reconcile-ci.1`, includes PR295 lead_together)
- **DO NOT** touch `images/observation_bridge_alt.jpg` — `lead_together` stays mapped there
- no 0.36 mint · no Netlify remint (parent remints separately if needed)

## Images tree lock bump
After replacing `competence_watch.jpg`, `git rev-parse HEAD:images` = `5cc81a2d691164fe1f1aef24ecb036bf61a2fae0` (was `5052d8b58d40126f41551731897c24344236e7ac`).
ART-R2 / playtest-art-event-audit IMAGES_TREE constants updated to match. Locked per-plate sha256s for ART-R2 cluster unchanged.
`observation_bridge_alt.jpg` blob unchanged (`2a3d8b1661d439d642056357893fa8a64adf47fd`).
