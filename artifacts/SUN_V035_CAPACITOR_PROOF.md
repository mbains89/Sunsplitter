SOURCE main@8d23109 · RUNTIME cb48039 · TASK SUN-V035-PLAYTEST-CAPACITOR-01 · MODE implementation

Build / $ Con V9, sole writer. Explicit owner authorization in
`2356CT-V9-PLAYTEST-CAPACITOR-01.md`: launch only, one PR into
`version/0.30.1-main-reconcile-ci.1`, then stop for owner review.

## Source and confirmed finding

- Main authority: `8d23109b63b844e0703fb36643f14b91b8800c90`.
- Exact predecessor: `cb480395c5f70dd9eb3c6a7a05afecd95819001f`,
  owner merge of PR 124; its tree equals that reviewed candidate.
- Read: global/repository AGENTS, same-revision main/lane ROADMAP,
  PROJECT_STATUS, LOCKS, SCENE_SKELETON, GITHUB_PUSH_RULES, current inbox
  and V9 instructions. Authority files are unchanged since prior dispatch.
  The explicit newer runtime pin controls; historical STATUS is not live truth.
- Source: `/Users/manra/.codex/loops-play-sun/PLAYTEST_SUN.md`, finding 1.
  The report's visible hosted version did not expose an exact hosted SHA.
- Reproduced on exact predecessor using the rendered choice handler:
  `power_crisis` says the capacitors are needed for drive repair, but the
  burn label claimed to protect that option. The existing `time_pass`
  consequence instead writes off realistic full-drive restoration without a
  miracle. This is a confirmed wording contradiction, not a new balance finding.

## Narrow repair

The burn label now reads:

> Burn the drive-repair capacitors. Keep systems running now.

No prose, choice destination, cost, requirement, effect, flag, trust, ideology,
state/schema, art, engine or other scene changes. The original burn remains
Hull -7, Supplies -9, Cohesion +4, `power: burn`, Future lean +2, with the
existing Supplies >=12 and cost-affordability gates. Neighbor choices and Mira
living guards are unchanged.

The new wording names the consumed drive-repair resource and immediate benefit.
It does not invent a permanent mechanical drive/ending lockout: the existing
`power: burn` consumer is the delayed text in `time_pass`.

## Proof checklist

- [x] New regression failed on predecessor's rendered and restored labels, then
  passed after the label-only change.
- [x] Fresh New Run reaches the scene through real choices; the actual button
  names the drive-repair cost and commits the unchanged burn choice.
- [x] Both existing randomized next-event orders preserve the exact original
  full-state delta and autosave. Two Continues per order do not charge again.
- [x] Twenty-four live/dead Mira and resource-boundary fixtures retain existing
  affordability, an enabled exit, and living/dead delayed narration.
- [x] Twelve real imports cover source, existing successor and delayed consequence,
  live/dead Mira, and current/marker-less saves; two Continues per import restore
  exact state. Current imported bytes stay exact; legacy one-time adoption remains.
- [x] Sela-answer and full-graph living-cast suites are unchanged and pass:
  225 scenes, 122 contracts, 3,136 imports, 6,272 Continues, 115,960 exit checks.
- [x] PR 122 Tomas source is still blob
  `6c23da62b94f4c3b855606c489e7544bab69b7a9`; its regression still passes.
- [x] Independent read-only review found no issues. In-memory old-label,
  changed-cost, redraw-only resume, repeated-charge and missing-Mira-guard
  mutants are rejected. The reviewer wrote no files.
- [x] Existing art tree remains `de4c3687cf4c89309d3422505dba4b45a32adc7e`.
  No authority, workflow, previous ticket or other-game edits.

Four changed files: `src/scenes-42.js`, `scripts/capacitor-checks.mjs`,
`scripts/verify.mjs`, and this proof. No checks removed or weakened.

## Validation and boundaries

Final exact candidate SHA, PR and required GitHub job URLs are in the PR and V9
outbox receipt. Validation commands:

```sh
VERIFY_EXPECTED_SHA=<candidate> VERIFY_HEAD_REF=ticket/0.30.1-v035-playtest-capacitor-01 node scripts/verify.mjs
node scripts/verify.mjs --self-test
node scripts/release-policy.mjs --self-test
node scripts/simulate.mjs --self-test
node scripts/simulate.mjs --profile smoke --policy all --runs 64 --seed 20260817 --shard-size 32 --gate smoke
```

Full verifier: zero errors, 41 existing warnings. Smoke: 192/192 endings,
zero incomplete runs/errors/V1/V4/V5, all economies reconciled. The final
normalized and repeat hashes are recorded in the outbox/PR, not compared to
the predecessor: the report includes the committed source-tree identity.
These bounded smoke results are not certification.

Automated proof exercises the actual engine/rendered-button/import/resume code
with browser stubs, not physical-device or newly deployed acceptance.

NO-PUBLISH / NOT_CERTIFIED; last certified remains 0.28.1d. ART-R2 held,
Amara-route parked, Netlify pin blocked. No other leftover, new story chapter,
0.36, other game, merge, deployment or Orchestrator chat ping.

Next action: Manraj reviews this one PR and, if accepted, merge-commits in the
browser, not squash. Build stops for review and will not merge.
