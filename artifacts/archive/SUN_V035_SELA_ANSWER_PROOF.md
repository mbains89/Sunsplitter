SOURCE main@8d23109 · RUNTIME 004e833 · TASK SUN-V035-PLAYTEST-SELA-ANSWER-01 · MODE implementation

Build / $ Con V9, sole writer. Explicit owner authorization in
`2341CT-V9-PLAYTEST-SELA-ANSWER-01.md`; launch only, one PR to
`version/0.30.1-main-reconcile-ci.1`, no merge or publication.

## Source and confirmed finding

- Main authority: `8d23109b63b844e0703fb36643f14b91b8800c90`.
- Exact predecessor: `004e8339726c3c4b80e9a3b32169cb4694260827`,
  owner merge commit of PR 123. Its tree equals the reviewed PR 123 head.
- Read: global/repository AGENTS, main/lane ROADMAP, PROJECT_STATUS, LOCKS,
  SCENE_SKELETON, GITHUB_PUSH_RULES, current inbox and V9 instructions.
  Authority files are unchanged since the preceding ticket; current dispatch
  explicitly pins the newer runtime. Historical STATUS is not live candidate truth.
- Source finding: `/Users/manra/.codex/loops-play-sun/PLAYTEST_SUN.md`, finding 2.
  That report identifies a visible hosted version, not an exact hosted SHA.
- Reproduced on this exact predecessor through the rendered button:
  `arc_living_2` -> `arc_living_3`, immediately showing the Mira/Elias parts
  argument. Cohesion +2, Sela affinity +8 and trust +8 already applied. The
  defect was missing visible response, not missing mechanical effects.

## Narrow repair

Only the selected question now enters `arc_living_sela_answer`, a small
response node containing the exact existing warm-world sentence from
`quiet_sela` in `src/scenes-41.js`. Its sole zero-effect Continue returns to
the unchanged `arc_living_3`. It answers with her existing position, without
inventing a numerical price, new plot, chapter, promise or romance condition.

The original question's effects, lean, affinity, trust, mark and alive gate
are unchanged. The other three choices keep their original destinations.
The new node adds no state writes, flags, marks, schema fields or death vector.
It uses existing `sela_ritual.jpg`; no image bytes changed.

A new Sela entry in the existing PR 123 living-cast contract protects entry,
saved-scene speech/choices and the image. A fresh dead-Sela entry skips to the
original conflict with no writes. A marked dead-Sela save retains its scene,
roster and promises while showing existing neutral prose and a free Continue.

Earlier `quiet_sela` is untouched: reusing its whole route would reopen early
promise/leadership scenes. Inferring context from `mid_arc` alone would fail
accepted imports where that flag is absent or still Future.

## Proof checklist

- [x] Fresh New Run reaches Sela through actual choices, including her earlier
  conversation, then Ask -> separate answer -> original parts conflict.
- [x] Exact existing prose appears before the argument and autosaves at the answer.
- [x] Fifteen context/promise combinations retain exactly the original Ask
  effects once; answer render/Continue add nothing.
- [x] Other choices unchanged; dead Sela cannot be asked or shown speaking.
- [x] Thirty-six Import fixtures x two Continue restores cover source, answer
  and successor, live/dead Sela, current/marker-less saves, and absent/Future/
  Living arc flags. Current saves retain exact imported bytes; legacy saves
  retain the existing one-time adoption behavior.
- [x] Expanded full-graph suite retains every PR 123 assertion: 225 scenes,
  122 contracts, 3,136 imports, 6,272 Continues and 115,960 affordable-exit checks.
- [x] PR 122 Tomas source remains blob
  `6c23da62b94f4c3b855606c489e7544bab69b7a9`; existing regression remains required.
- [x] Independent read-only review: missing answer, missing Sela guard, repeated
  Continue reward and non-restoring Continue mutants are all caught.
- [x] No engine, state/save schema, art bytes, authority, workflow or other-game edits.

Seven changed files: `src/scenes-08.js`, `src/scenes-55.js`,
`scripts/sela-answer-checks.mjs`, `scripts/living-cast-checks.mjs`,
`scripts/simulate.mjs`, `scripts/verify.mjs`, and this proof.
Scene count/digest changes record the one new response node; no check was removed.
New sorted scene-ID digest:
`697828a09d2985b8a4c014fa3b782cc28ddc9451956493643dd92a2cd34d46b3`.

## Validation and boundaries

Final exact head, required GitHub job URLs and results are recorded in the V9
outbox and PR. Commands:

```sh
VERIFY_EXPECTED_SHA=<candidate> VERIFY_HEAD_REF=ticket/0.30.1-v035-playtest-sela-answer-01 node scripts/verify.mjs
node scripts/verify.mjs --self-test
node scripts/release-policy.mjs --self-test
node scripts/simulate.mjs --self-test
node scripts/simulate.mjs --profile smoke --policy all --runs 64 --seed 20260817 --shard-size 32 --gate smoke
```

Automated proof uses the actual engine, rendered-button handlers and import/
resume code with browser stubs; it is not a physical-device playtest claim.
Existing 41 validator warnings remain, with zero errors.

NO-PUBLISH / NOT_CERTIFIED; last certified remains 0.28.1d. ART-R2 held,
Amara-route parked, Netlify pin blocked. No 0.36, new story, other leftovers,
other games, merge, deployment or Orchestrator chat ping.

Next action: Manraj reviews the one PR and, if accepted, merge-commits in the
browser, not squash. Build stops for review and will not merge.
