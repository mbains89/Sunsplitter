# Sunsplitter — Current Status

`schema_version: 1`  
`updated_utc: 2026-08-18`  
`authority_migration_base: 3789062f1d0703f63feb8ada66503bb773879550`

This is the compact rolling handoff. It contains current state only. Process lives in `/AGENTS.md`, future scope and gates in `ROADMAP.md`, and decision dispositions in `LOCKS.md`.

## Release

`runtime_baseline_sha: 8beee172de5ac7bd1e7148ee71716e4b4066d33d`  
`release_label: 0.28.1d`  
`release_state: SHIPPED_LABEL_ONLY`  
`production_url: NOT_VERIFIED`  
`release_artifact: artifacts/sun-v0.28.1d-combined-net.zip`  
`version_integrity: FAIL — VERSION.md=0.28.1d; src/state.js=0.28.1b; index.html UI=0.28.1c` (deferred to milestone close)

## Verification — latest attributable evidence

`tested_runtime_sha: 8beee172de5ac7bd1e7148ee71716e4b4066d33d`  
`verify_mjs: ON_MAIN` (scripts/verify.mjs)  
`simulate_mjs: ON_MAIN` (scripts/simulate.mjs)  
`V6: PASSES` for both Amara and Sela after R2  
`remaining_gate_failure: L-021 Living-policy softlock at vess_cost`

## Active work

`milestone: Economy / Systemic Truth / Release Hardening (IN PROGRESS)`  
`completed_tickets:`  
- L-024 LOCKED Option B (commit aae0901)  
- 0.28.2-R1 Release Gate + Simulation Harness (scripts on main)  
- 0.28.2-R2 Promise-lifecycle truth repair (engine.js on main; V6 passes)  
`next_ticket: L-021 Living softlock at vess_cost`  
`owner: Grok / program office → Build after dispatch`  
`state: READY_FOR_NEXT_TICKET`  
`pull_request: none`

## Blocked

- Full release gate still fails solely on L-021 (vess_cost softlock under Living policy).
- Version integrity across VERSION.md / state.js / index.html deferred to milestone close.

## Open locks (remaining)

- L-025 — Commander identity A/B
- L-026 — Last Off-Shift zero/one branches
- L-027 — `vess_course_lost` consumer or retirement
- L-028 — Ticket 2 new-crew indicator

L-020 through L-024 are LOCKED. Full language in `LOCKS.md`.

## Canon and repository deltas

- `scripts/simulate.mjs` + `scripts/verify.mjs` now on main.
- `src/engine.js` implements L-024 Option B: untested promises remain `"made"` and are omitted from ending reflection. Never invents player betrayal on a dead holder.
- Detailed local chronology also in the long-form PROJECT_STATUS kept in the working tree.

## Next action

**Grok:** Dispatch L-021 / vess_cost softlock ticket. Build implements only from the dispatched ticket.

<!-- STATUS_COMPLETE -->
