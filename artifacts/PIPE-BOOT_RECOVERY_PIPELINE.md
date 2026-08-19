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
| Last certified baseline label | `0.28.1d` | associated historical SHA `2bb4517707df90702a9b78fe0fa8fb55c1852dd8` |

## 4. Verification controls

- `scripts/verify.mjs` and `scripts/simulate.mjs` already exist on the tree and remain the starting point.
- Exact-SHA pinning: any integrity claim must name the commit under test; a green local run without a named SHA is not acceptance evidence.
- Known failures may remain red. **Do not** delete, skip, or relabel requirements to force green.
- Minimal workflow already present under `.github/workflows/` for the earlier 0.28.2 path; recovery work must target this recovery branch or a later explicitly authorized version branch.

## 5. Release-policy / publication hard block

**ACTIVE NO-PUBLISH CONTROLS (policy level):**

1. No GitHub Release may be created from `e4f8440` or from this recovery branch without a later Manraj authorization that explicitly lifts NO-PUBLISH.
2. No tag that implies a certified release may be cut from this base.
3. No production deploy / Build Hook promotion that makes the tree publicly playable as a “released” build.
4. No itch.io upload or monetization from this base.
5. STATUS and VERSION surfaces must continue to show recovery / NO-PUBLISH state until a later governed close-out changes them.

Branch-protection and required-check enforcement that require repository-admin rights beyond the ordinary push token are reported honestly in the handoff. Policy-level blocks above are active regardless.

## 6. What remains blocked until a future dispatch

- All RECOVERY-DEC §4 implementation rulings
- The bounded `0.30.1` integrity build
- Any merge of divergent historical repair branches wholesale
- Any claim that 0.28.2 / 0.28.3 / PX / 0.29 / 0.30 gates are closed

## 7. Next authorized actor

After this commit is present and the handoff evidence package is returned:

- Grok may dispatch a **bounded** integrity ticket only if Manraj confirms PIPE-BOOT acceptance.
- Build may implement only from that future ticket, on a branch descended from this recovery line, with exact-SHA evidence.

## 8. Manraj acceptance

`accepted_by: Manraj`  
`accepted_utc_date: 2026-08-19`  
`decision: ACCEPTED`

Manraj explicitly accepted PIPE-BOOT. This closes only the governance prerequisite named in §7. It does not dispatch or implement the correction build, certify the recovery base, close any sequential gate, or lift NO-PUBLISH.

**Next authorized actor:** Grok / program office may dispatch one bounded integrity ticket limited to RECOVERY-DEC §4 and the authorized `0.30.1` integrity boundary. Build remains blocked until that dispatch names an exact base SHA, bounded scope, acceptance criteria, and required evidence.

---

*End of PIPE-BOOT.*
