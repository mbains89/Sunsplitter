# Sunsplitter — Stable Lock Ledger

**Owner:** Manraj  
**Lock steward:** Grok / program office  
**Full decision language:** [`ROADMAP.md`](ROADMAP.md)  
**Roadmap source SHA-256:** `8c1b87addf312580a4ea493e5ac5a0b9f9f1f0ec2892777d4feb69a2ebfa0ae4`

This ledger gives decisions durable identities. IDs are never reused or renumbered. A row may change disposition only when Manraj approves and Grok records the ruling; prior meaning remains recoverable in Git. This file does not paraphrase detailed scope: the cited roadmap section remains authoritative.

Dispositions use the roadmap vocabulary: `LOCKED`, `DECISION_GATE`, `CANDIDATE`, `HELD`, `DEFERRED`, `OUT`, `REJECTED`, and `ACCEPTED_LIMITATION`.

## Standing locks

| ID | Disposition | Subject | Authority |
|---|---|---|---|
| L-001 | LOCKED | Authority and change-control law | ROADMAP §1 |
| L-002 | LOCKED | Permanent product, canon, causality, architecture, state, UI, art, and release locks | ROADMAP §2 |
| L-004 | LOCKED | Dependency spine and milestone order | ROADMAP §4 |
| L-005 | LOCKED | 0.28.2 ten-ticket Truth Hotfix batch boundary | ROADMAP §5 |
| L-006 | LOCKED | 0.28.3 Chain-of-Custody and Systemic Truth scope | ROADMAP §6 |
| L-007 | LOCKED | Player-experience gate sequence PX-0 through PX-9 | ROADMAP §7 |
| L-008 | LOCKED | 0.29 What Remains narrative destination | ROADMAP §8 |
| L-009 | LOCKED | 0.30 onboarding, opening, and wrapper definition | ROADMAP §9 |
| L-010 | LOCKED | 0.32 external review definition and fifteen-player cohort | ROADMAP §11 |
| L-011 | LOCKED | 0.33 PC-readiness definition | ROADMAP §12 |
| L-012 | LOCKED | 0.34 itch commercial-readiness direction | ROADMAP §13 |
| L-013 | LOCKED | 1.0 launch gate | ROADMAP §15 |
| L-015 | LOCKED | 0.31 Player-Love + Itch Readiness amendment; no reopening of 0.29 or widening of 0.30 | ROADMAP §10 |
| L-016 | LOCKED | 0.35 exact-SHA launch rehearsal and release-candidate freeze | ROADMAP §14 |

## Ruled (0.28.2 blockers closed 2026-08-18)

| ID | Disposition | Subject | Ruling | Ruled |
|---|---|---|---|---|
| L-020 | LOCKED | `pair_shield_cold` | Make the Elias→Mira shield consequence reachable exactly once after Mira’s lethal path. Do not retire. | 2026-08-18 Manraj |
| L-021 | LOCKED | Global cost rule | Every rendered scene must always have at least one affordable/enabled exit (zero-cost degraded exit allowed). Never soft-lock. No silent clamps. | 2026-08-18 Manraj |
| L-022 | LOCKED | `vault_priority` | Preserve the player’s early Living/Future ideology choice. Re-key the later Lena choice so it no longer overwrites `vault_priority`. | 2026-08-18 Manraj |
| L-023 | LOCKED | `pair_turn` | Remove the unused `pair_turn` flag from engineFlags / runtime state. | 2026-08-18 Manraj |
| L-024 | LOCKED | Untested promise domain (Option B) | Untested promises remain `"made"` and are omitted from ending reflection / “What remains”. Never invent a player-authored betrayal on a dead holder. | 2026-08-18 Manraj |

## Unresolved decision gates

| ID | Disposition | Subject | Authority |
|---|---|---|---|
| L-025 | DECISION_GATE | Commander identity A/B at PX-4; B is recommended, not ruled | ROADMAP §§7, 16 |
| L-026 | DECISION_GATE | Last Off-Shift zero/one branches: document defensive code or retire | ROADMAP §§6, 16 |
| L-027 | DECISION_GATE | `vess_course_lost`: tested consumer or retirement | ROADMAP §§6, 16 |
| L-028 | DECISION_GATE | Ticket 2 new-crew indicator; no implementation before PX evidence and Grok lock | ROADMAP §16 |
| L-029 | DECISION_GATE | 1.0 itch monetization posture: paid, free/no-payment, or another compliant posture after current policy/payment review | ROADMAP §§13, 16 |
| L-030 | DECISION_GATE | Key-art production method: commissioned human key art or accurately disclosed curated generated art | ROADMAP §§13, 16 |

## Held, deferred, rejected, and limited

| ID | Disposition | Subject | Authority |
|---|---|---|---|
| L-040 | HELD | Breast-cover / explicit-content toggle | ROADMAP §§2, 16 |
| L-041 | DEFERRED | Pair residual textures, debt, and pregnancy texture to evidence-gated 0.29 scope | ROADMAP §16 |
| L-042 | REJECTED | Unrestricted AI roadmap editing; proposal PR only | ROADMAP §16 |
| L-043 | DEFERRED | Engine/state mechanical split until after 1.0 or separate approval | ROADMAP §16 |
| L-044 | OUT | Native wrapper, gamepad, achievements, and cloud saves before 1.0 | ROADMAP §§15, 16 |
| L-045 | DEFERRED | Steam launch to a separate post-1.0 decision | ROADMAP §§13–16 |
| L-046 | ACCEPTED_LIMITATION | Fixed event order unless Manraj explicitly reopens it | ROADMAP §16 |
| L-047 | REJECTED | Conventional HUD, dashboard, meters, and quest log | ROADMAP §§2, 16 |
| L-048 | REJECTED | V2 literal-name lint as a zero gate; spike detector only | ROADMAP §16 |

## Recording rule

For a new decision, allocate the next unused ID in the matching range, cite the exact authority, and preserve the approved wording there. For a ruling, change only the disposition and add `ruled_date`, `ruled_by`, and `landing_sha` columns in the same approved change. Never merge, split, or silently renumber an ID during a ruling pass.
