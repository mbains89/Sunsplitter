# Sunsplitter — Stable Lock Ledger

**Owner:** Manraj  
**Lock steward:** Grok / program office  
**Full decision language:** [`ROADMAP.md`](ROADMAP.md)  
**Roadmap source SHA-256:** `2c06e1af91b287f44f7f0fff0adef3a20abd33c144de608949cc897106336e6f`

This ledger gives decisions durable identities. IDs are never reused or renumbered. A row may change disposition only when Manraj approves and Grok records the ruling; prior meaning remains recoverable in Git. This file does not paraphrase detailed scope: the cited roadmap section remains authoritative.

Dispositions use the roadmap vocabulary: `LOCKED`, `DECISION_GATE`, `CANDIDATE`, `HELD`, `DEFERRED`, `OUT`, `REJECTED`, `SUPERSEDED`, and `ACCEPTED_LIMITATION`.

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
| L-010 | SUPERSEDED | Prior 0.31 external-review allocation; review now occurs in 0.37–0.38 under L-049 | ROADMAP §§16–17 |
| L-011 | SUPERSEDED | Prior 0.32 PC-readiness allocation; PC readiness now occurs in 0.36 under L-049 | ROADMAP §15 |
| L-012 | SUPERSEDED | Prior 0.33 commercial allocation; commercial readiness now occurs in 0.39 under L-049 | ROADMAP §18 |
| L-013 | LOCKED | 1.0 public-release gate | ROADMAP §20 |

### Post-recovery roadmap locks approved 2026-08-22

| ID | Disposition | Subject | Authority |
|---|---|---|---|
| L-049 | LOCKED | Exact post-0.30.1 dependency sequence: 0.31 Systemic Truth; 0.32 Save Trust; 0.33 Player Experience and Narrative Closure; 0.34 Mobile UX and Accessibility; 0.35 Private Itch Candidate; 0.36 PC Readiness; 0.37 External Review Pilot; 0.38 Player Validation Cohort; 0.39 Commercial Readiness; 0.40 Launch Rehearsal; then 1.0 | ROADMAP §§4, 10–20 |
| L-050 | LOCKED | Planned milestones use minor versions; patch versions are reserved for evidence-backed remediation after milestone close-out | ROADMAP §4 |

These locks are future-only. They do not change, rename, widen, repin, merge, or invalidate active 0.30.1 recovery work, PR #26, PR #27, REC-RATCHET-02, REC-02, NO-PUBLISH, or NOT_CERTIFIED.

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
| L-025 | LOCKED | Commander identity, Option B | ROADMAP §§2, 7, 21 | 2026-08-19 | Manraj | `009fca7884e360486ddda172c389f480b62323a5` |
| L-026 | LOCKED | Last Off-Shift zero/one defensive save-recovery guards | ROADMAP §§6, 21 | 2026-08-19 | Manraj | `009fca7884e360486ddda172c389f480b62323a5` |
| L-027 | LOCKED | `vess_course_lost` and downstream-course promise retirement | ROADMAP §§6, 21 | 2026-08-19 | Manraj | `009fca7884e360486ddda172c389f480b62323a5` |
| L-028 | DEFERRED | Ticket 2 new-crew indicator, default-retire evidence gate | ROADMAP §21 | 2026-08-19 | Manraj | `009fca7884e360486ddda172c389f480b62323a5` |

## Held, deferred, rejected, and limited

| ID | Disposition | Subject | Authority |
|---|---|---|---|
| L-040 | HELD | Breast-cover / explicit-content toggle | ROADMAP §§2, 21 |
| L-041 | DEFERRED | Pair residual textures, debt, and pregnancy texture to evidence-gated 0.33 scope | ROADMAP §21 |
| L-042 | REJECTED | Unrestricted AI roadmap editing; proposal PR only | ROADMAP §21 |
| L-043 | DEFERRED | Engine/state mechanical split until after 1.0 or separate approval | ROADMAP §21 |
| L-044 | OUT | Native wrapper, gamepad, achievements, and cloud saves before 1.0 | ROADMAP §§20–21 |
| L-045 | DEFERRED | Steam launch to a separate post-1.0 decision | ROADMAP §§18–21 |
| L-046 | ACCEPTED_LIMITATION | Fixed event order unless Manraj explicitly reopens it | ROADMAP §21 |
| L-047 | REJECTED | Conventional HUD, dashboard, meters, and quest log | ROADMAP §§2, 21 |
| L-048 | REJECTED | V2 literal-name lint as a zero gate; spike detector only | ROADMAP §21 |

## Recording rule

For a new decision, allocate the next unused ID in the matching range, cite the exact authority, and preserve the approved wording there. For a ruling, change only the disposition and add `ruled_date`, `ruled_by`, and `landing_sha` columns in the same approved change. `landing_sha` is the first immutable commit in the same approved, non-squashed ruling PR whose tree contains the full approved ROADMAP wording; a later commit in that PR records that SHA in this ledger. Never merge, split, or silently renumber an ID during a ruling pass.
