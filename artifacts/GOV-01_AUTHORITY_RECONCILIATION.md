# GOV-01 — Exact-SHA Authority Reconciliation

**Commit role:** Governance only. No runtime, scene, art, or publication change.
**Recorded:** 2026-08-19
**Lock steward:** Grok under explicit Manraj authorization

---

## 1. Recovery base (audited, NO-PUBLISH)

| Field | Value |
|-------|-------|
| **Audited recovery base SHA** | `e4f84409759760d31fcf47b8a227802a61421f51` |
| **Status** | **NO-PUBLISH** — authorized solely as the audited recovery base |
| **Certification** | None. This SHA is not certified, not released, and does not close any sequential gate. |
| **Candidate labels observed on tree** | `0.30` (VERSION.md), various 0.29/0.28.2 intermediate labels |
| **Effect of candidate labels** | Labels such as `0.30` do **not** close any sequential gate and do not constitute release approval. |

## 2. Last certified baseline

| Field | Value |
|-------|-------|
| **Last certified label** | `0.28.1d` |
| **Historically verified SHA associated with 0.28.1d governance baseline** | `2bb4517707df90702a9b78fe0fa8fb55c1852dd8` |
| **Note** | The compact STATUS present on `e4f8440` still carries an earlier/alternate `runtime_baseline_sha`. That discrepancy is part of the evidence that formal recovery amendment is required. No retroactive re-certification is performed by this commit. |

## 3. External audits used as evidence

Both audits are cited by exact name. Their full text is **not** present in the repository tree at the time of this commit; they are external evidence packages that informed the recovery decision. Severity totals from the two reports must **not** be added together. Every unique finding remains open until explicitly reconciled.

| Audit | Date | Candidate SHA | Role |
|-------|------|---------------|------|
| `SUNSPLITTER_HOSTILE_PREPUBLICATION_AUDIT_E4F8440_2026-08-18.md` | 2026-08-18 | `e4f84409759760d31fcf47b8a227802a61421f51` | Hostile pre-publication audit |
| `SUNSPLITTER_ULTRA_QUALITY_CRUCIBLE_2026-08-18.md` | 2026-08-18 | `e4f84409759760d31fcf47b8a227802a61421f51` | Ultra-quality crucible / independent stress evidence |

**Deployed-tree observation recorded in authorization:** playable files matched the audited tree 190/190. Deployment provenance remains **inferred**, not certified.

## 4. Sequential gates

- No milestone from `0.28.2` onward is retroactively certified by this commit or by the existence of commits after `2bb4517`.
- `0.28.2`, `0.28.3`, PX gate, `0.29`, `0.30`, and later remain subject to their original acceptance criteria.
- Candidate packaging or content labels on `e4f8440` do not satisfy those criteria.

## 5. L-007 PX shorthand mismatch

LOCKS.md records L-007 as “Player-experience gate sequence PX-0 through PX-6”. ROADMAP §7 defines the fuller PX-1 … PX-9 sequence. **Governing interpretation for recovery:** ROADMAP §7 language controls the intended scope; the LOCKS shorthand does not delete PX-7/PX-8/PX-9. No lock disposition is changed by this note.

## 6. Recovery ticket / SHA manifest (initial)

| Item | Value |
|------|-------|
| Recovery base | `e4f84409759760d31fcf47b8a227802a61421f51` |
| Last certified baseline label | `0.28.1d` |
| Associated certified-era SHA | `2bb4517707df90702a9b78fe0fa8fb55c1852dd8` |
| GOV-01 (this document) | recorded on `main` after `e4f8440` |
| RECOVERY-DEC | next atomic commit |
| PIPE-BOOT | third atomic commit; must land before any correction branch work |

## 7. NO-PUBLISH stop condition (canonical)

**HARD STOP.**  
The tree at `e4f84409759760d31fcf47b8a227802a61421f51` and any direct descendant that has not completed a full governed integrity pass is **NO-PUBLISH**.

Forbidden until explicitly lifted by a later, separate Manraj authorization after PIPE-BOOT and the bounded integrity work:

- Production deploy
- Public visibility change
- Tagging as a release
- GitHub Release
- itch.io upload or monetization
- Any claim that a sequential gate from 0.28.2 onward is closed

This stop is recorded here so STATUS, release surfaces, and agents treat it as binding.

## 8. What this commit does *not* do

- Does not implement any gameplay, narrative, resource, ending, save, accessibility, art, or commercial correction.
- Does not open or close L-025 … L-028.
- Does not certify `e4f8440`.
- Does not waive sequential gates.
- Does not begin the `0.30.1` integrity build.

---

*End of GOV-01.*
