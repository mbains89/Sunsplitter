# Sunsplitter — Project Status

**Last updated:** 2026-08-18  
**Current version:** **0.28.1d** (Image sync — lingerie redo + portrait drift)  
**GitHub main baseline (verified):** `2bb4517707df90702a9b78fe0fa8fb55c1852dd8` — no later commits implement the audits or economy work below.  
**Next:** **Economy, Systemic Truth, and Release Hardening** (APPROVED / PLANNED / NOT YET IMPLEMENTED) → **Player Experience Baseline & Design Governance** (new locked sequence) → then evidence-backed content (0.29 What Remains / Cascade Allusive and later). Ticket 2 still needs Grok lock.  
**Monte Carlo audit 2026-08-16 (LOCKED):** 50k+ mixed runs; every full run reached an ending; validate 0 errors. **Verdict was FAIL for final lock** — 0.28.1 addresses P0 + core P1; 0.28.1b fixed unreachable + unpaid costs.  
**Latest deploy zip:** `artifacts/sun-v0.28.1d-combined-net.zip` (numbered scenes + CURRENT portraits + CSS 784/1168)

### Official portraits — SOURCE OF TRUTH (LOCKED 2026-08-17)
**Canonical zip:** `artifacts/sunsplitter-official-portraits-CURRENT-2026-08-17.zip`

| File | Character |
|------|-----------|
| `lena.jpg` | Lena — ash-blonde, ice eyes, tank top |
| `mira.jpg` | Mira — dark hair, light blue eyes, tank top |
| `amara.jpg` | Amara — red hair, clean face (no cheek scar), tank top |
| `sela.jpg` | Sela — East Asian, long dark hair, tank top |
| `vess.jpg` | Vess — long white-silver hair, purple eyes, tank top |
| `elias.jpg` | Elias — rugged, tank top |
| `tomas.jpg` | Tomas — curly hair, beard, **no crosses**, tank top |
| `jiro.jpg` | Jiro — intense, late-20s, tank top |
| `rourke.jpg` | Rourke — younger senior, tank top |

- All 9 confirmed live on GitHub `main/images/` matching CURRENT sizes (2026-08-17).
- Commander remains faceless — no official portrait.
- Tank-top set is the primary official portrait set for all Art / Build / Narrative reference.
- Do **not** use earlier `-final` or non-CURRENT portrait zips as authority.
- Art rule unchanged: every new plate must match these faces/bodies exactly.

---
## LOCKED MILESTONE — Economy, Systemic Truth, and Release Hardening
**Status:** APPROVED / PLANNED / NOT YET IMPLEMENTED  
**Baseline:** GitHub `main` @ `2bb4517707df90702a9b78fe0fa8fb55c1852dd8` (verified 2026-08-18). No later commits implement any of the workstreams below.  
**Placement note:** This milestone sits after 0.28.1d image/portrait/CSS work and before evidence-backed content (0.29 What Remains / Cascade Allusive). It is the gate that must close before any further story expansion or final packaging.

### Workstreams (ordered)

#### 1. Resource economy truth & balance
Full-system review of supplies, integrity, cohesion, reaction-mass, and any derived gates.  
Every choice that spends or gains a resource must be honest against current totals; silent clamps and free resources are forbidden.  
Ending requirements (Landfall, Living Ship, Fracture, etc.) must be reachable only when the resource state actually supports them.  
Produce a locked economy table (starting values, typical spends, hard floors, death thresholds) and a short simulation note (Monte-Carlo or hand-checked paths) that the table holds under realistic play.  
No new meters, loops, or visible consequence labels.

#### 2. Unified economy evaluation
All resources, gains, costs, affordability checks, crisis costs, lethal rescues, and ending requirements are evaluated as **one complete economy**.  
Balance changes must not create new systems, meters, loops, or visible consequence labels.  
Record the final locked economy table and simulation evidence in the roadmap acceptance criteria / this file on close-out.

#### 3. Promise-lifecycle truth repair
Explicit decision-and-implementation ticket within the milestone.  
**Current engine behavior:** `forceResolvePromises()` changes every remaining `"made"` promise to `"broken"` during ending resolution without checking whether the promise holder is alive.  
**Verified consequence:** Amara and Sela can make promises on the early spine and die later, allowing the ending resolver to fabricate a `"broken"` promise on a dead holder.  
**Requirement:** Explicit semantic lock **before** implementation. The implementation must ensure that an untested promise belonging to a dead character is never represented as a player-authored betrayal.  
Do **not** silently choose among broader pending-promise policies. Record the final decision explicitly as one of:  
- resolve only promises that received their authored test;  
- leave untested promises `"made"` and omit them from reflection; or  
- another explicitly approved rule that preserves run truth.  
V6 must protect the chosen behavior from regression.

#### 4. Causality-remediation pass
Dedicated remediation ticket based on the completed causality lint audit.  
The audit reported 128 unguarded roster mentions. These are **candidates**, not 128 automatically confirmed defects.  
Require the implementer to classify each candidate as:  
- confirmed reachable violation;  
- legal memorial, historical, dead-state, or conditional reference;  
- unreachable under current topology but requiring regression coverage;  
- false positive.  
Only confirmed defects receive prose, choice, alive/recovered-gate, image, or routing changes. Preserve the locked rule that dead and unrecovered characters never speak, act, appear as present, or receive present-tense credit.  
Add regression coverage for every corrected reachable case.

#### 5. Canon and state-contract findings
Convert actionable findings from the completed canon audit, state-key ledger, promise audit, and follow-up verification into discrete roadmap tickets.  
Requirements:  
- Do not treat audit production as remediation.  
- Preserve citations to the exact audit evidence.  
