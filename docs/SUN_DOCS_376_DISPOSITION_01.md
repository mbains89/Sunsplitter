# SUN-DOCS-376-DISPOSITION-01

SOURCE main@8d23109b · RUNTIME 04c4a8060993a90b6c512dcef21d0fd485528920 · TASK SUN-DOCS-376-DISPOSITION-01 · MODE docs

Owner Game Dev widget 2026-09-26 + Fable `SUN_FABLE_REVIEW_d47c5e0c`.
Docs only. Does not mint 0.36. Does not certify. Does not invent OPEN 0.37 or OPEN 0.38.
Does not deploy or remint Netlify. Last certified remains `0.28.1d`.
Does not remint PR **#376**. Does not touch `src/`.

Lane: `version/0.30.1-main-reconcile-ci.1`
Live tip recorded here: `04c4a8060993a90b6c512dcef21d0fd485528920`
That cite is the pre-PR lane HEAD (merge of #385 TIP-HONESTY-5800), not this docs PR's own merge SHA.
`main` stays `8d23109b63b844e0703fb36643f14b91b8800c90`.

## #376 disposition (CLOSED UNMERGED — never merge)

PR **#376** MAPFIX / restore is **CLOSED UNMERGED** (closed 2026-09-26T20:23:42Z, `merged: false`). Do not reopen to merge. Do not remint.
Head `4ad0f24a` / stub `state.js` must never land.

Recorded facts:
- Tip `state.js` on the live lane is intact (complete file; map already right).
- Visible plate gap is **not** a `state.js` restore. C1: `resolveSceneImage` prefers `scene.image` over `sceneImages`. Fix is scene.image unshadow — `SUN-HITL-UNSHADOW-01` **PARKED** (no owner GO).
- `state.js` / `engine.js` hold is **lifted for NAMED tickets only** (not free-for-all).
- Do **not** apply `docs/SUN_HITL_WIRE_01.state.js.patch`.
- Trust / Commander creation / plate unshadow / Vess remain PARKED until owner GO.

## Ancestry (tip-honesty through #385)

- PR **#371** @ `0e7535df` … through **#384** @ `5800b42c` (prior honesty chain)
- PR **#385** @ `04c4a8060993a90b6c512dcef21d0fd485528920` — tip-honesty 5800 (live floor)

## Named tip cites (were stale → now this pre-PR HEAD)

| Surface | Stale before this pass | Live truth |
|---|---|---|
| STATUS / QUEUE lane head | `5800b42c` / PR #384; #376 called in-flight unpaid | `04c4a806` after PR #385; #376 CLOSED UNMERGED |

Identity strings kept: `` `release_state: NO-PUBLISH` ``, `` `version_integrity: NOT_CERTIFIED` ``, `PRESENT / UNRECONCILED / NO INTEGRATION OR RELEASE CREDIT`, `L-025 — LOCKED`, `L-026 — LOCKED`, `L-027 — LOCKED`, `L-028 — DEFERRED`.

Pointer files: this receipt, `docs/TICKET_QUEUE.md`, `artifacts/PROJECT_STATUS.md`.
