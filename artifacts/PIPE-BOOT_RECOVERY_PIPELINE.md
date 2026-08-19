# PIPE-BOOT — Governed Recovery Pipeline

**Commit role:** Governance + pipeline controls only. No gameplay correction.
**Depends on:** GOV-01, RECOVERY-DEC
**Branch:** `recovery/e4f8440-nopub`
**Recorded:** 2026-08-19

---

## 1. Governed recovery branch

| Field | Value |
|-------|-------|
| Branch name | `recovery/e4f8440-nopub` |
| Created from | `main` after GOV-01 + RECOVERY-DEC |
| Audited recovery base (NO-PUBLISH) | `e4f84409759760d31fcf47b8a227802a61421f51` |
| Purpose | Integration branch for future bounded integrity work only after explicit dispatch |

## 2. Recovery-base digest / provenance

| Field | Value |
|-------|-------|
| Recovery base SHA | `e4f84409759760d31fcf47b8a227802a61421f51` |
| Certification status | **None** — NO-PUBLISH |
| Artifact digest for a release | **Not created** (no release, no tag) |
| Provenance note | Playable-file match 190/190 was reported in the authorization evidence package; deployment provenance remains inferred, not certified |

## 3. Ticket / SHA manifest (binding for recovery)

| ID | Description | SHA / location |
|----|-------------|----------------|
| Recovery base | Audited NO-PUBLISH tree | `e4f84409759760d31fcf47b8a227802a61421f51` |
| GOV-01 | Authority reconciliation | `2e12db3c2899585816178f9c84a18b172a09847d` (`artifacts/GOV-01_AUTHORITY_RECONCILIATION.md`) |
| RECOVERY-DEC | Formal amendment | `47c2ec486c70f037867267fbdc8de68ed27343dc` (`artifacts/RECOVERY-DEC_AMENDMENT.md`) |
| PIPE-BOOT | This pipeline bootstrap | (this commit on `recovery/e4f8440-nopub`) |
| PIPE-BOOT acceptance | Manraj acceptance recorded | (acceptance commit on `recovery/e4f8440-nopub`) |
| PIPE-BOOT-R1 | Reconcile missing/stale blocking controls; GitHub issue #15 | dispatch base `d7728f7ea6f6ee3f4966d73dc6316c3c26491f6e`; `artifacts/PIPE-BOOT-R1_RECOVERY_PIPELINE_RECONCILIATION.md` |
| Last certified baseline label | `0.28.1d` | associated historical SHA `2bb4517707df90702a9b78fe0fa8fb55c1852dd8` |

## 4. Verification controls

- `scripts/verify.mjs` and `scripts/simulate.mjs` already exist on the tree and remain the starting point.
- Exact-SHA pinning: any integrity claim must name the commit under test; a green local run without a named SHA is not acceptance evidence.
- Known failures may remain red. **Do not** delete, skip, or relabel requirements to force green.
- Reconciliation at exact dispatch base `d7728f7` proved that `.github/` is absent, `verify.mjs` has three stale `0.29` expectations against existing `0.30` surfaces, and `simulate.mjs` lacks the required deterministic random/cheapest/priciest 2,000-runs-per-policy V1/V4/V5 reporting contract. V5 detector coverage is not presumed comprehensive and may not be presented as certification.
- PIPE-BOOT-R1 / GitHub issue #15 is authorized to repair only those bounded pipeline controls and the associated NO-PUBLISH check. Its full authority, allowlist, evidence contract, and stop conditions are recorded in `PIPE-BOOT-R1_RECOVERY_PIPELINE_RECONCILIATION.md`.
- Until PIPE-BOOT-R1 is adjudicated from exact-SHA evidence, the blocking-control prerequisite is **INCOMPLETE** and every correction ticket, including REC-01, remains frozen.

## 5. Release-policy / publication hard block

**ACTIVE NO-PUBLISH CONTROLS (policy level):**

1. No GitHub Release may be created from `e4f8440` or from this recovery branch without a later Manraj authorization that explicitly lifts NO-PUBLISH.
2. No tag that implies a certified release may be cut from this base.
3. No production deploy / Build Hook promotion that makes the tree publicly playable as a “released” build.
4. No itch.io upload or monetization from this base.
5. STATUS and VERSION surfaces must continue to show recovery / NO-PUBLISH state until a later governed close-out changes them.

Branch-protection and required-check enforcement that require repository-admin rights beyond the ordinary push token are reported honestly in the handoff. Policy-level blocks above are active regardless.

`recovery_required_checks: NOT CONFIGURED`
`recovery_ruleset_or_branch_protection: NOT CONFIGURED`

The absence of administrative enforcement must not be described as an active mechanical block. A workflow run and a required-check/ruleset configuration are separate evidence claims.

## 6. What remains blocked until a future dispatch

- All RECOVERY-DEC §4 implementation rulings, including REC-01 / issue #13
- The bounded `0.30.1` integrity build
- Any merge of divergent historical repair branches wholesale
- Any claim that 0.28.2 / 0.28.3 / PX / 0.29 / 0.30 gates are closed

REC-01 is **FROZEN**. Its observed head `8e4fe42f376444049105e27ff7005a6220e88b9a` must remain isolated from PIPE-BOOT-R1 and from the recovery integration branch pending a later program-office adjudication.

## 7. Next authorized actor

After the PIPE-BOOT-R1 discrepancy was verified and Manraj authorized its repair:

- Build may implement GitHub issue #15 only, from exact base `d7728f7`, within its exact allowlist.
- Grok / program office may adjudicate PIPE-BOOT-R1 only after the exact-SHA evidence package is returned.
- No correction ticket may resume before that adjudication; closing PIPE-BOOT-R1 does not itself merge or authorize REC-01.

## 8. Manraj acceptance

`accepted_by: Manraj`  
`accepted_utc_date: 2026-08-19`  
`decision: ACCEPTED`

Manraj explicitly accepted PIPE-BOOT. This closes only the governance prerequisite named in §7. It does not dispatch or implement the correction build, certify the recovery base, close any sequential gate, or lift NO-PUBLISH.

Subsequent exact-base review found that the blocking controls described in §4 were not present or current. Manraj therefore authorized PIPE-BOOT-R1. The original acceptance remains recorded as a governance decision, but it is not evidence that the missing controls are operational.

**Next authorized actor:** Build completes PIPE-BOOT-R1 / issue #15 and returns exact-SHA evidence. REC-01 remains frozen; NO-PUBLISH and NOT_CERTIFIED remain unchanged.

---

*End of PIPE-BOOT.*
