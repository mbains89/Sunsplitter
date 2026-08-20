# Sunsplitter — Stable Lock Ledger

**Owner:** Manraj  
**Lock steward:** Grok / program office  
**Full decision language:** [`ROADMAP.md`](ROADMAP.md)  
**Roadmap source SHA-256:** `5c79b798065c8b9dcae41cc53ba1118a1e5dd934803c310539be3f350b4cbf90`

This ledger gives decisions durable identities. IDs are never reused or renumbered. A row may change disposition only when Manraj approves and Grok records the ruling; prior meaning remains recoverable in Git. This file does not paraphrase detailed scope: the cited roadmap section remains authoritative.

Dispositions use the roadmap vocabulary: `LOCKED`, `DECISION_GATE`, `CANDIDATE`, `HELD`, `DEFERRED`, `OUT`, `REJECTED`, and `ACCEPTED_LIMITATION`.

## Standing locks

| ID | Disposition | Subject | Authority |
|---|---|---|---|
| L-001 | LOCKED | Authority and change-control law | ROADMAP §1 |
| L-002 | LOCKED | Permanent product, canon, causality, architecture, state, UI, art, and release locks | ROADMAP §2 |
| L-004 | LOCKED | Dependency spine and milestone order, with the sole exact ART-INTEGRATION-R2 55-plate exception | ROADMAP §4 |
| L-005 | LOCKED | 0.28.2 ten-ticket Truth Hotfix batch boundary | ROADMAP §5 |
| L-006 | LOCKED | 0.28.3 Chain-of-Custody and Systemic Truth scope | ROADMAP §6 |
| L-007 | LOCKED | Player-experience gate sequence PX-0 through PX-6 | ROADMAP §7 |
| L-008 | LOCKED | 0.29 What Remains narrative destination | ROADMAP §8 |
| L-009 | LOCKED | 0.30 onboarding, opening, and wrapper definition | ROADMAP §9 |
| L-010 | LOCKED | 0.31 external review definition | ROADMAP §10 |
| L-011 | LOCKED | 0.32 PC-readiness definition | ROADMAP §11 |
| L-012 | LOCKED | 0.33 commercial direction | ROADMAP §12 |
| L-013 | LOCKED | 1.0 release-candidate and launch gate | ROADMAP §13 |

### L-004 owner-approved sequencing exception (2026-08-20)

ART-INTEGRATION-R2 is the sole exception to the pre-Milestone-A art-volume prohibition: exactly 34 Wave 2 plus 21 Wave 3 approved event plates, governed from recovery commit `8a840397d80b8fe1027a22ca89603d92f0e562e6`. It requires a protected governance merge before draft-only implementation, preserves the exact scene-honesty guards in ROADMAP §4 and `ART-INTEGRATION-R2_GOVERNANCE_REPIN.md`, and authorizes no gameplay, narrative, release, deployment, publication, certification, or further art batch. Approved by Manraj on 2026-08-20; independent exact-head adjudication remains mandatory for the governance pull request.

## Ruled (0.28.2 blockers closed 2026-08-18)

| ID | Disposition | Subject | Ruling | Ruled |
|---|---|---|---|---|
| L-020 | LOCKED | `pair_shield_cold` | Make the Elias→Mira shield consequence reachable exactly once after Mira’s lethal path. Do not retire. | 2026-08-18 Manraj |
| L-021 | LOCKED | Global cost rule | Every rendered scene must always have at least one affordable/enabled exit (zero-cost degraded exit allowed). Never soft-lock. No silent clamps. | 2026-08-18 Manraj |
| L-022 | LOCKED | `vault_priority` | Preserve the player’s early Living/Future ideology choice. Re-key the later Lena choice so it no longer overwrites `vault_priority`. | 2026-08-18 Manraj |
| L-023 | LOCKED | `pair_turn` | Remove the unused `pair_turn` flag from engineFlags / runtime state. | 2026-08-18 Manraj |
| L-024 | LOCKED | Untested promise domain (Option B) | Untested promises remain `"made"` and are omitted from ending reflection / “What remains”. Never invent a player-authored betrayal on a dead holder. | 2026-08-18 Manraj |

## Ruled and deferred (L-025–L-028; 2026-08-19)

| ID | Disposition | Subject | Authority | ruled_date | ruled_by | landing_sha |
|---|---|---|---|---|---|---|
| L-025 | LOCKED | Commander identity, Option B | ROADMAP §§2, 7, 14 | 2026-08-19 | Manraj | `009fca7884e360486ddda172c389f480b62323a5` |
| L-026 | LOCKED | Last Off-Shift zero/one defensive save-recovery guards | ROADMAP §§6, 14 | 2026-08-19 | Manraj | `009fca7884e360486ddda172c389f480b62323a5` |
| L-027 | LOCKED | `vess_course_lost` and downstream-course promise retirement | ROADMAP §§6, 14 | 2026-08-19 | Manraj | `009fca7884e360486ddda172c389f480b62323a5` |
| L-028 | DEFERRED | Ticket 2 new-crew indicator, default-retire evidence gate | ROADMAP §14 | 2026-08-19 | Manraj | `009fca7884e360486ddda172c389f480b62323a5` |

## Held, deferred, rejected, and limited

| ID | Disposition | Subject | Authority |
|---|---|---|---|
| L-040 | HELD | Breast-cover / explicit-content toggle | ROADMAP §§2, 14 |
| L-041 | DEFERRED | Pair residual textures, debt, and pregnancy texture to evidence-gated 0.29 scope | ROADMAP §14 |
| L-042 | REJECTED | Unrestricted AI roadmap editing; proposal PR only | ROADMAP §14 |
| L-043 | DEFERRED | Engine/state mechanical split until after 1.0 or separate approval | ROADMAP §14 |
| L-044 | OUT | Native wrapper, gamepad, achievements, and cloud saves before 1.0 | ROADMAP §§13, 14 |
| L-045 | DEFERRED | Steam launch to a separate post-1.0 decision | ROADMAP §§12–14 |
| L-046 | ACCEPTED_LIMITATION | Fixed event order unless Manraj explicitly reopens it | ROADMAP §14 |
| L-047 | REJECTED | Conventional HUD, dashboard, meters, and quest log | ROADMAP §§2, 14 |
| L-048 | REJECTED | V2 literal-name lint as a zero gate; spike detector only | ROADMAP §14 |

## Recording rule

For a new decision, allocate the next unused ID in the matching range, cite the exact authority, and preserve the approved wording there. For a ruling, change only the disposition and add `ruled_date`, `ruled_by`, and `landing_sha` columns in the same approved change. `landing_sha` is the first immutable commit in the same approved, non-squashed ruling PR whose tree contains the full approved ROADMAP wording; a later commit in that PR records that SHA in this ledger. Never merge, split, or silently renumber an ID during a ruling pass.
