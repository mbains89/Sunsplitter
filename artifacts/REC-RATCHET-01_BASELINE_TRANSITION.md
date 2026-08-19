# REC-RATCHET-01 — Governed Recovery-Ratchet Transition

`SOURCE main@792e202 · RUNTIME e4f8440 · TASK REC-RATCHET-01 · MODE implementation`

**Acting role:** Build / GPT-Codex, landing Manraj's explicit program-office authorization.

**Authority files read:** `AGENTS.md`, `artifacts/ROADMAP.md`, `artifacts/PROJECT_STATUS.md`, and `artifacts/LOCKS.md` from `main@792e202`; recovery specialist records from the exact source head.

**Implementation authorization:** Explicitly authorized by Manraj in the adjudication chat.

**Commit role:** Governance and verification policy only. No gameplay, narrative, art, release, or deployment change.

**Authorized by:** Manraj

**Authorized date:** 2026-08-19

**Source recovery head:** `78a64c7a180a34e786da3eefac42a06f50703bab`

**Runtime baseline:** `e4f84409759760d31fcf47b8a227802a61421f51` — audited NO-PUBLISH recovery base, not certified

---

## 1. Decision

REC-RATCHET-01 is authorized to record the expected recovery-ratchet transition caused by the bounded `quiet_tomas` rewind repair and to arm one fresh, fail-closed REC-01 implementation route.

This decision does not implement REC-01. It does not accept any V1, V4, or V5 defect for release, certify the runtime, close a sequential gate, or lift `NO-PUBLISH`.

## 2. Evidence adjudicated

Frozen evidence PR #14 was closed unmerged:

- head: `8e4fe42f376444049105e27ff7005a6220e88b9a`
- tree: `f14ced61ce07bacbcb342ea655551919dc52286b`
- original base: `93ccb43e141da544b999ba2c45f664a19428a5e3`
- changed paths: `src/scenes-41.js`, `scripts/verify.mjs`

The patch correctly routes both `quiet_tomas` exits from the late Act 3 offer back to `act3_spine_next`. The old branch is not consumable: it is eleven commits behind the protected recovery head and carries a pre-PIPE-BOOT verifier.

A fresh, non-cherry-picked temporary port on `78a64c7a…` passed the current 222-scene verifier, including the targeted two-exit regression, while preserving `NO-PUBLISH / NOT CERTIFIED`.

## 3. Locked-matrix transition

Configuration is unchanged: seed `20260817`, 2,000 runs per policy, start run 0, max 600 steps, policies random / cheapest / priciest.

| Policy | PIPE-BOOT endings | Post-repair endings | PIPE-BOOT V1/V4/V5 | Post-repair V1/V4/V5 | Errors |
|---|---:|---:|---:|---:|---:|
| random | 1,745 | 1,869 | 255 / 135 / 105 | 131 / 182 / 150 | 0 |
| cheapest | 2,000 | 2,000 | 0 / 405 / 3,556 | 0 / 499 / 3,896 | 0 |
| priciest | 1,163 | 1,561 | 837 / 0 / 0 | 439 / 0 / 0 | 0 |

Adjudicated interpretation:

- no new invariant rule, scene, or fingerprint class appears;
- simulator errors and step-limit failures remain zero;
- completed progression improves for random and priciest and is unchanged for cheapest;
- the correct rewind repair changes how often already-pinned downstream defects are reached;
- raw-count increases therefore require an explicit baseline transition and may not be hidden as an ordinary green ratchet.

## 4. Authorized future baseline

The future REC-01 PR may replace `scripts/fixtures/pipe-boot-r1-simulation-baseline.json` only in the same exact PR as the fresh rewind repair, its targeted verifier regression, and the corresponding current-state STATUS update.

The authorized replacement bytes are defined by:

- certification: `NO-PUBLISH / NOT CERTIFIED`
- purpose: REC-RATCHET-01 transition baseline after the bounded rewind repair
- source recovery SHA: `78a64c7a180a34e786da3eefac42a06f50703bab`
- exact totals and fingerprints recorded in Section 3 and the adjudication evidence
- compatibility provenance retained: issue `15`, dispatch base `d7728f7ea6f6ee3f4966d73dc6316c3c26491f6e`, runtime base `e4f84409759760d31fcf47b8a227802a61421f51`, 222 scenes
- expected SHA-256: `0633469f57971b9c00c877a33f9ccb818e53d5a8de8cc787e4ca2a25fdeda7f2`

The existing PIPE-BOOT fixture SHA-256 is `bb1fb02cb7f85f0c0eddb3d9dbb0d3bb6c695d57156c2c051bf69f6f53f3b42b`.

These counts are recovery ratchet pins only. They are not release thresholds, defect acceptance, or complete V5 certification.

The complete authorized fixture is stored, inactive, at `artifacts/REC-RATCHET-01_AUTHORIZED_BASELINE.json`. Its SHA-256 is the expected replacement hash above. A fresh implementation must copy those exact bytes; conversation state is not authority.

The exact two-file implementation diff is stored, inactive, as a lossless line-array at `artifacts/REC-RATCHET-01_AUTHORIZED_REC-01.patch.json`. Joining its `lines` with LF and appending one final LF reconstructs a patch with SHA-256 `1b48dc069cc3b23bb89bf524fb229de803bd17c3294cf92f8bae20d90aa0d290`. Applied to the source recovery tree, its authorized target hashes are:

- `src/scenes-41.js`: `b67563297cb4b4ae89330fe61523d06b1b11c3703bd7c5ba412492e7860fc106`
- `scripts/verify.mjs`: `ba413f6b41d4f0278238f69feea59865e0d3e979b177c76db6b380854afec084`

## 5. One-shot REC-01 route

After this transition lands, Grok / program office may freshly redispatch issue #13 with:

- branch: `ticket/0.30.1-rec-01-r1`
- base: the exact merge-commit successor of `78a64c7a180a34e786da3eefac42a06f50703bab` containing this transition's exact path set and pinned artifacts
- exact changed paths:
  - `artifacts/PROJECT_STATUS.md`
  - `scripts/fixtures/pipe-boot-r1-simulation-baseline.json`
  - `scripts/verify.mjs`
  - `src/scenes-41.js`

The release policy must require the old baseline on the PR base, the exact authorized replacement on the tested head, this artifact plus both inactive authorized inputs unchanged, exact target source/verifier hashes, an exact four-path diff, and the exact branch. It must structurally prove that the base is the merge-commit successor of the pinned transition base rather than accept any commit carrying the old fixture. Once the recovery branch contains the replacement baseline, that route is consumed.

PR #14 history remains evidence only. No merge, rebase, or cherry-pick from it is authorized.

## 6. Acceptance and stops

The future REC-01 candidate must pass, on exact Node `22.16.0`:

- release-policy self-tests and event enforcement;
- the current dependency-free verifier plus both `quiet_tomas` exits;
- all three locked 2,000-run strategies against the authorized replacement;
- the aggregate `simulation-gate`;
- exact changed-path and provenance checks.

All other RECOVERY-DEC Section 4 concerns remain out of scope. `NO-PUBLISH`, `NOT CERTIFIED`, Netlify build/deploy locks, tag restrictions, and open locks L-025 through L-028 remain active.

---

**Next actor after protected REC-RATCHET-01 merge:** Grok / program office repins issue #13 to the exact successor and dispatches Build on the one-shot branch.
