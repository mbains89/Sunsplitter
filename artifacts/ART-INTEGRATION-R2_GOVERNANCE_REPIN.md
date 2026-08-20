# ART-INTEGRATION-R2 — Governance Repin and 55-Plate Authority

`SOURCE main@792e202 · RUNTIME 8a84039 · TASK ART-INTEGRATION-R2 · MODE implementation`

**Acting role:** Build / GPT-Codex, carrying Manraj's explicit 2026-08-20 approval for the bounded governance-and-policy repin and the exact scene-honesty dispositions below.
**Authority read:** `AGENTS.md`, `artifacts/ROADMAP.md`, `artifacts/PROJECT_STATUS.md`, `artifacts/LOCKS.md`, `artifacts/ART_RULES.md`, `artifacts/GITHUB_PUSH_RULES.md`, issue #19 and its comments, the live recovery head, open pull requests, required workflows, and `scripts/release-policy.mjs`.
**Implementation authority:** Stage 1 governance/policy implementation is authorized. Stage 2 becomes authorized only after this record lands through the protected recovery branch. The Stage 2 pull request must remain draft and unmerged.

## Exact repin

- Protected target: `recovery/e4f8440-nopub`
- Superseded ART-INTEGRATION-R1 dispatch target: `9bb4ccf7efbf856ffed569436787f779ad195698`
- Verified ART-INTEGRATION-R2 governance base commit: `8a840397d80b8fe1027a22ca89603d92f0e562e6`
- Verified governance base tree: `0af206bdc531b355598840402e94be297e297fc8`
- Governance branch: `ticket/art-integration-r2-governance-repin`
- Stage 2 branch after protected governance merge: `ticket/art-integration-r2-55`
- Tracking authority: issue #19 plus this landed record

PR #23 moved the recovery branch after the R1 dispatch. R2 supersedes the stale R1 target and narrows implementation to exactly 55 approved event plates. It does not revive the broader R1 replacement-folder scope.

## Locked archive scope

| Wave | Library path | Approved runtime source | Archive SHA-256 | Internal authority | Result | Runtime plates |
|---|---|---|---|---|---|---:|
| 2 | `/Sunsplitter/Sunsplitter-all-art-replacements-for-Grok.zip` version 26 | `07-unique-event-expansion/` only | `1d1b23afbaeafda3b4f865302ab9f605e8e38780bf94abafa0c5c68ab52bd485` | `PACKET_FILE_SHA256.txt` | 129/129 records PASS | 34 |
| 3 | `/Sunsplitter/Sunsplitter-Wave3-21-approved-event-art.zip` | `02-runtime-jpg/` | `6f1f40886a112fe6b2e0e543690cecce36a522b5daf408b784a21f67821e633f` | `MANIFEST.sha256`, `INTEGRATION_MAP.tsv`, `APPROVAL_RECORD.md` | 45/45 manifest entries PASS | 21 |

All 55 runtime sources are exact approved JPEG bytes, 784 × 1168, three-channel RGB interpreted as sRGB. None contains an embedded ICC profile; the bytes must not be changed to add one. Runtime integration is exactly 53 new image paths plus approved-byte replacement of `images/faction_split.jpg` and `images/reckon_public.jpg`.

## Owner-approved mapping and guard dispositions

The approval preserves every plate while preventing dead-character, unsupported-roster, and effective-orphan rendering. It changes image binding and resolver guards only. It authorizes no prose, dialogue, choice, consequence, state, cost, death timing, route, or save change.

| Approved filename | Effective scene binding / resolver disposition |
|---|---|
| `act3_lethal_elias_end.jpg` | Bind to the living pre-commitment scene `act3_lethal_elias_order`; leave `act3_lethal_elias_end` on its existing death-neutral image. |
| `act3_lethal_mira_end.jpg` | Bind to `act3_lethal_mira_board`; leave `act3_lethal_mira_end` on its existing death-neutral image. |
| `act3_lethal_tomas_end.jpg` | Bind to `act3_lethal_tomas_cost`; leave `act3_lethal_tomas_end` on its existing death-neutral image. |
| `reckon_suppress.jpg` | Render only while Elias, recovered Tomas, and Amara are alive; otherwise retain its current `images/observation_reckon.jpg`. |
| `reckon_truth.jpg` | Preserve the existing Tomas/Jiro availability requirement and strengthen it to require Lena and Sela; otherwise use `images/observation.jpg`. |
| `arc_fork.jpg` | Remove only `arc_fork` from the obsolete early Tomas/Jiro group guard. The approved plate is roster-neutral. |
| `status.jpg` | Remove only `status` from the obsolete early Tomas/Jiro group guard. Resolver precedence is exact: at five or fewer survivors use `images/corridor.jpg`; otherwise, if any of Elias, Mira, Lena, or Sela is unavailable, use `images/observation.jpg`; otherwise render the approved plate. |
| `prom_vent_keep.jpg` | Render only if Amara is alive and the fail-closed available-roster count is at least seven; otherwise retain `images/corridor_variant.jpg`. |
| `prom_price.jpg` | Render only if Sela is alive and the fail-closed available-roster count is nine; otherwise retain `images/vault_reveal.jpg`. |
| `prom_price_keep.jpg` | Render only if Sela is alive and the fail-closed available-roster count is at least six; otherwise retain `images/vault_reveal.jpg`. |
| `faction_split.jpg` | Approved member SHA-256 `36731fb7abd2ba237fa554510d5f50421f99264e58339663e475b3bbf8f4d485`. Preserve the existing eight-person death/unrecovered guard exactly. Render these bytes only with the complete named roster; otherwise continue using `images/corridor_variant.jpg`. This is the exact R2 full-roster guarded exception; its fallback may not be weakened or generalized. |

For these count-aware guards, the eight named current crew are Lena, Elias, Mira, Tomas, Amara, Jiro, Sela, and Vess. The fail-closed available-roster count is the lesser of recorded `state.survivors` and the faceless Commander plus those eight crew members who pass existing `isAlive` behavior. Unrecovered Tomas, Jiro, or Vess therefore cannot inflate the count, and stale `state.survivors` cannot weaken a guard.

## Stage 1 protected route

The governance branch may change exactly:

- `artifacts/ART-INTEGRATION-R2_GOVERNANCE_REPIN.md`
- `artifacts/ROADMAP.md`
- `artifacts/LOCKS.md`
- `artifacts/PROJECT_STATUS.md`
- `artifacts/ART_RULES.md`
- `scripts/release-policy.mjs`

The policy-file exception exists only to add fail-closed routes for this exact governance repin and the exact Stage 2 file set. The governance pull request may merge only by merge commit after required checks pass and an independent exact-head program-office adjudication returns PASS.

## Stage 2 boundary

After the protected governance merge, Stage 2 must start from that exact merge commit and tree. It may:

- add the exact 55 runtime plates to `images/`;
- update only the scene image fields, `sceneImages` entries, and resolver guards required by the approved mapping record;
- add one dependency-free R2 asset validator and one machine-readable integration record;
- extend the existing verifier only to invoke that validator;
- open a draft pull request into `recovery/e4f8440-nopub`.

Stage 2 may not alter any approved artwork bytes, gameplay, narrative, state, route topology, release identity, workflow, deployment configuration, or production state. It may not merge.

## Preserved stop state

`NO-PUBLISH / NOT CERTIFIED` remains active. No merge of the Stage 2 pull request, tag, release, deployment, Netlify action, production mutation, branch-protection change, force-push, or protected-branch deletion is authorized.
