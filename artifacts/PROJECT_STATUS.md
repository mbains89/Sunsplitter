# Sunsplitter — Current Status

`schema_version: 1`  
`updated_utc: 2026-08-18`  
`authority_migration_base: 3789062f1d0703f63feb8ada66503bb773879550`

This is the compact rolling handoff. It contains current state only. Process lives in `/AGENTS.md`, future scope and gates in `ROADMAP.md`, and decision dispositions in `LOCKS.md`.

## Release

`runtime_baseline_sha: 2bb4517707df90702a9b78fe0fa8fb55c1852dd8`  
`release_label: 0.28.1d`  
`release_state: SHIPPED_LABEL_ONLY`  
`production_url: NOT_VERIFIED_IN_AUTHORITY_MIGRATION`  
`release_artifact: artifacts/sun-v0.28.1d-combined-net.zip`  
`artifact_digest: NOT_VERIFIED_IN_AUTHORITY_MIGRATION`  
`version_integrity: FAIL — VERSION.md=0.28.1d; src/state.js=0.28.1b; index.html UI=0.28.1c`

The commit after the runtime baseline and before this migration (`3789062`) changed only this status document. It did not change runtime bytes.

## Verification — latest attributable evidence

`tested_runtime_sha: 2bb4517707df90702a9b78fe0fa8fb55c1852dd8`  
`verify_mjs: NOT_AVAILABLE — scripts/verify.mjs is absent from main`  
`simulate_mjs: NOT_AVAILABLE — scripts/simulate.mjs is absent from main`  
`validate_js: HISTORICAL_REPORT_ONLY — 207 scenes / 0 errors; not rerun by this documentation-only migration`  
`external_audits: seven completed audit passes pinned to the tested runtime; ROADMAP §§3, 5, and 6 preserve the actionable findings`

No deployment, artifact digest, runtime validation, or simulation pass is newly claimed by the authority migration.

## Active work

`milestone: 0.28.2 Truth Hotfix`  
`ticket: 0.28.2 preflight + ten-ticket batch (L-020–L-023 now ruled)`  
`owner: Grok / program office → Build after dispatch`  
`state: READY_FOR_DISPATCH`  
`pull_request: none`

## Blocked

- Certified verification is blocked until `verify.mjs`, `simulate.mjs`, and the actions manifest exist on the 0.28.2 version branch.
- Version integrity is failing across the three authoritative surfaces.
- `images/lingerie_lena.jpg` is a 21-byte placeholder and remains inside the locked 0.28.2 batch.

## Open locks (remaining)

- L-024 — four-state promise domain
- L-025 — Commander identity A/B
- L-026 — Last Off-Shift zero/one branches
- L-027 — `vess_course_lost` consumer or retirement
- L-028 — Ticket 2 new-crew indicator

L-020 through L-023 were ruled 2026-08-18 and are no longer blockers. Full language in `LOCKS.md`.

## Canon and repository deltas

- No runtime, canon, scene, state, CSS, image, deployment, or release-artifact bytes changed by the L-020–L-023 rulings.
- `artifacts/ROADMAP.md` is the approved forward plan with source SHA-256 `1c60d45f0f05ac8f30400d884873ee35d8ad48692d1b17b0e96f0fdd6c406869`.
- `/AGENTS.md`, `/CLAUDE.md`, `artifacts/LOCKS.md`, this compact status, `README.md`, and the `GITHUB_PUSH_RULES.md` retirement notice form the companion authority reconciliation.
- Detailed pre-migration chronology remains in Git history at `3789062` and earlier; it is not live authority.

## Next action

**Grok:** Dispatch 0.28.2 preflight / first implementation tickets against current `main` (post L-020–L-023 lock commit). Build implements only from the dispatched ticket.

<!-- STATUS_COMPLETE -->
