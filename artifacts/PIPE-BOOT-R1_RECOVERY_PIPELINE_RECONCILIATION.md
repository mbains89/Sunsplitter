# PIPE-BOOT-R1 — Recovery Pipeline Reconciliation

`SOURCE main@792e202 · RUNTIME d7728f7 · TASK PIPE-BOOT-R1 · MODE implementation`

**Acting role:** Grok / program office
**Repository:** `mbains89/Sunsplitter`
**Authority read:** `/AGENTS.md`; `ROADMAP.md` §§1, 4–6; `PROJECT_STATUS.md`; `LOCKS.md`; `GOV-01_AUTHORITY_RECONCILIATION.md`; `RECOVERY-DEC_AMENDMENT.md`; `PIPE-BOOT_RECOVERY_PIPELINE.md`; `GITHUB_PUSH_RULES.md`
**Implementation authorization:** Explicitly authorized by Manraj on 2026-08-19 for PIPE-BOOT-R1 only
**Dispatch record:** GitHub issue #15
**Dispatch base:** `d7728f7ea6f6ee3f4966d73dc6316c3c26491f6e`
**Audited gameplay/runtime provenance:** `e4f84409759760d31fcf47b8a227802a61421f51`
**Implementation branch:** `ticket/0.30.1-pipe-boot-r1`
**Target branch:** `recovery/e4f8440-nopub`

---

## 1. Purpose

PIPE-BOOT-R1 reconciles the difference between the controls described by PIPE-BOOT and the controls actually present at the exact dispatch base. It is a governance and recovery-pipeline ticket only. It does not correct gameplay, certify the recovery base, close any sequential gate, or authorize publication.

## 2. Exact-base findings

The following facts were verified at `d7728f7`:

1. `.github/` is absent. The prior PIPE-BOOT statement that a minimal workflow was already present is incorrect for this recovery line.
2. `node scripts/verify.mjs` exits nonzero with exactly three stale version expectations: `VERSION.md`, `src/state.js`, and the visible subtitle are `0.30`, while the verifier expects `0.29`.
3. `scripts/simulate.mjs` does not provide the required deterministic random/cheapest/priciest V1/V4/V5 reporting contract of seed `20260817` and 2,000 runs per policy. V5 automation on this recovery line is not proven comprehensive and must report its detector coverage honestly.
4. Recovery-branch required checks and an administrative ruleset/branch-protection rule are **NOT CONFIGURED**. Policy-level NO-PUBLISH remains binding, but no mechanical enforcement may be claimed from branch protection.

These findings mean the original PIPE-BOOT governance acceptance remains recorded, but its blocking-control prerequisite is not operationally complete. PIPE-BOOT-R1 must close with exact-SHA evidence before any correction ticket resumes.

## 3. Binding dispatch

Manraj authorized:

> Go ahead with PIPE-BOOT-R1. Keep REC-01 frozen, preserve NO-PUBLISH, and do not touch gameplay or publication.

Issue #15 is the bounded implementation record. Work is limited to its exact base, allowlist, acceptance commands, evidence requirements, and stop conditions. Known failures may be pinned and ratcheted honestly; no requirement may be deleted, skipped, relabeled, or forced green.

## 4. Exact implementation allowlist

Only these paths may change under issue #15:

- `.github/workflows/verify.yml`
- `.github/workflows/release-policy.yml`
- `scripts/verify.mjs`
- `scripts/simulate.mjs`
- `scripts/release-policy.mjs`
- `scripts/fixtures/pipe-boot-r1-simulation-baseline.json`
- `artifacts/PIPE-BOOT-R1_RECOVERY_PIPELINE_RECONCILIATION.md`
- `artifacts/PIPE-BOOT_RECOVERY_PIPELINE.md`
- `artifacts/PROJECT_STATUS.md`

Every `src/**`, `images/**`, `css/**`, `index.html`, `VERSION.md`, `netlify.toml`, gameplay, narrative, art, save, accessibility, commercial, deployment, tag, and release surface is out of scope.

## 5. REC-01 isolation

REC-01 / issue #13 is **FROZEN**. Its observed implementation head, `8e4fe42f376444049105e27ff7005a6220e88b9a`, is on `ticket/0.30.1-01-quiet-tomas-rewind`, diverges from the PIPE-BOOT-R1 base, and must not be merged, cherry-picked, rebased into, or otherwise consumed by this ticket. No REC-01 evidence can count toward PIPE-BOOT-R1 closure.

After PIPE-BOOT-R1 closes, resuming or reconciling REC-01 requires a separate Grok/program-office adjudication. Closure of issue #15 does not itself authorize that branch to merge.

## 6. Required control outcome

PIPE-BOOT-R1 must produce exact-SHA evidence for all of the following:

- the verifier validates the existing candidate/runtime identity without certifying it and fails closed under a version-drift negative fixture;
- the simulator preserves its current route and V6 interfaces while restoring deterministic random/cheapest/priciest V1/V4/V5 reporting at the locked seed and run count;
- V5 output names the automated detectors and their coverage limits; a zero from partial detectors is only a detector result and is not full ending-truth certification;
- two normalized audit runs are byte-identical and use `scripts/fixtures/pipe-boot-r1-simulation-baseline.json`, a machine-readable, ratchet-only V1/V4/V5 baseline tied to the audited recovery runtime;
- deliberate V1 and V4 negative fixtures fail with attributable witnesses;
- `.github/workflows/verify.yml` and `.github/workflows/release-policy.yml` are read-only and run their implemented verification, simulation-ratchet, and release-policy jobs for PRs targeting the recovery branch; the close-out reports the exact job identifiers actually implemented rather than assuming names;
- the release-policy check rejects publication-capable triggers, write permissions, release/deploy/upload operations, and an unexpected target branch;
- no runtime, gameplay, art, version-surface, Netlify, release, or publication byte changes.

## 7. Enforcement truth

| Control | State at dispatch |
|---|---|
| Policy-level NO-PUBLISH | **ACTIVE** |
| Release certification | **NOT CERTIFIED** |
| Minimal recovery workflow | **ABSENT** |
| Required checks on recovery branch | **NOT CONFIGURED** |
| Administrative ruleset / branch protection | **NOT CONFIGURED** |
| Production deploy authorization | **NOT AUTHORIZED** |
| Tag / GitHub Release / itch.io authorization | **NOT AUTHORIZED** |

Adding a workflow does not by itself prove that GitHub administratively requires it. The close-out must report enforcement as configured with evidence or retain `NOT CONFIGURED`; it may never infer protection from a green voluntary run.

### Current independently verified administrative state

The dispatch-state table above is historical. Independent live-configuration review after code approval verified:

| Control | Current state |
|---|---|
| Recovery and default-branch protection | **ACTIVE** — GitHub ruleset `21051662` targets `main` and `recovery/e4f8440-nopub`; empty bypass list; pull request required; deletion and force-push blocked |
| Required recovery checks | **ACTIVE** — `release-policy`, `verify`, and `simulation-gate`; branch must be up to date |
| Tag prevention | **ACTIVE** — GitHub ruleset `21051665` targets all tags; empty bypass list; creation and deletion restricted; force-push blocked |
| Netlify automatic builds | **STOPPED** — project `sunsplitter`, site `6af8d4bc-df5f-4e41-8042-57a10108a2a9` |
| Netlify published deploy | **LOCKED** — deploy `6a85163bab20340008f53e95`, commit `e4f84409759760d31fcf47b8a227802a61421f51` |
| Netlify Build Hooks | **NONE** |
| Netlify production deployment methods | **GIT-ONLY** — CLI, MCP, and API cannot deploy to production |

Applying these controls triggered no build or deploy. They do not certify or publish the recovery base, authorize a merge, or lift NO-PUBLISH. The configuration evidence and renewed exact-head Actions are separate inputs to final program-office adjudication.

## 8. Locks and gates preserved

- L-025 — Commander identity A/B remains `DECISION_GATE`.
- L-026 — Last Off-Shift zero/one branches remains `DECISION_GATE`.
- L-027 — `vess_course_lost` consumer or retirement remains `DECISION_GATE`.
- L-028 — Ticket 2 new-crew indicator remains `DECISION_GATE`.
- No gate from 0.28.2 onward is certified or closed.
- `0.28.1d` remains the last certified baseline.
- `d7728f7` and audited runtime provenance `e4f8440` remain NO-PUBLISH.

## 9. Stop conditions

Stop and report without widening scope if implementation needs a non-allowlisted path, a gameplay or publication change, a weakened or silently regenerated baseline, a changed seed/policy/run count, secrets or write permissions, nondeterministic audit results, a negative fixture that passes, or any incorporation of REC-01 head `8e4fe42`.

## 10. Closure authority and next action

Only Grok / program office may adjudicate PIPE-BOOT-R1 closure from the issue #15 PR/head SHA, complete local transcripts, normalized audit evidence, negative-fixture evidence, Actions run URLs, changed-file list, and honest administrative-enforcement state.

**Next authorized actor:** Grok / program office adjudicates the reconciled exact head only after renewed Actions are green; REC-01 remains frozen.

---

*End of PIPE-BOOT-R1 reconciliation.*
