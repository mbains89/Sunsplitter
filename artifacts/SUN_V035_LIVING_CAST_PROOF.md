SOURCE main@8d23109 · RUNTIME 2ca2ae1 · TASK SUN-V035-LIVING-CAST-01 · MODE implementation

Build / $ Con V9, sole writer. Owner-authorized launch only; one PR into
`version/0.30.1-main-reconcile-ci.1`. No merge or deployment authority.

## Provenance and finding

- Source authority: `8d23109b63b844e0703fb36643f14b91b8800c90`.
- Exact predecessor: `2ca2ae1d991e63d6a8be9efa8ee0dd8e4bb9c1ee` (PR 122 merge).
- Read: AGENTS, ROADMAP, PROJECT_STATUS, LOCKS, SCENE_SKELETON,
  GITHUB_PUSH_RULES, V9 instructions and `2253CT-V9-LIVING-CAST-01.md`.
- Confirmed witnesses are accepted saved-state failures, not alleged fresh-run
  encounters: modern `sceneEntered: true` bypasses `onEnter`. Dead Mira still
  answered change orders; dead Jiro/Tomas still spoke at nightshift/hold-bolts,
  with both choices hidden; dead promise holders could receive new responses.
- Three read-only reviewers covered all 224 runtime scenes after complete load.
  Root alone edited the isolated ticket worktree. Original checkout untouched.

## Repair and scene declarations

`src/scenes-55.js` enumerates 121 exact scene contracts after the numbered
modules load. No scene/state schema fields were added. Existing function-valued
properties remain callable; existing getters remain getters. Live text and
choices delegate to the original authored definitions.

Shared declaration for every enumerated contract:

- Entry preconditions: original route eligibility, plus the explicit living
  participant list. Actual remote recovery admits an unrecovered person, never
  a recorded-dead person. Recovery render requires the recovered person.
- State writes: original encounter writes only after valid admission. A marked
  saved view writes nothing and retains its exact scene, roster, promises and
  history. It never silently chooses another patient or replays entry.
- Death exposure: no new death vector. Existing vent/line break results retain
  their intentionally killed victim. A new break requires a living patient;
  an already-committed result remains readable after the victim's death.
- Dead speech/choices: absent conversation uses the existing sentence
  “The boards keep working. So do you.” and one zero-effect Continue to an
  existing successor. Bond getters already safe are retained.
- Images: existing audited aliases first; otherwise existing empty corridor
  for the absent conversation. Thirteen already-safe text sites receive only
  corresponding portrait suppression. No plate, image bytes or art map added.

Special cases retain their original entry ownership: `intro_lena`'s Rourke
death, four committed Breath/Custody answer records, and L-026's fresh
zero/one/multiple invitation behavior. Only a restored zero-invitation selector
gets a neutral onward exit. No invitation to a dead person is invented.

Additional clause/choice declarations (original entry preconditions, state
writes, costs and death ownership remain; only absent speech/actions are cut):

| Existing scene(s) | Conditional participation repaired |
| --- | --- |
| `time_pass`, `crisis`, `cut_out`, `self_risk`, `vent` | Living responders/trapped roster and addressed options; vent memorials retained |
| `vault_voice`, `vault_sacrifice`, `act3_vault_face_read` | Only living speakers; public grid decisions/player reading retained |
| `act2_tether_dock`, `act2_tether_manifest`, `act2_spine_next`, `act3_spine_next` | Rider and recovered presence; recorded-dead Vess cannot loop into recovery |
| `romance_mira_1`, `coolant_trade` | Living secondary Elias; joint Mira/Lena opening |
| `wake`, `dying`, `rourke_end`, `rourke_stop`, `rourke_try`, `silence` | Supporting cast and addressed treatment choices; Rourke death ownership retained |
| `vault_reveal`, `priority_repairs`, `priority_ration`, `priority_planet`, `hydroponics`, `crew_walk` | Living introductions; anonymous operational choices retained |
| `lead_prompt`, `lead_together`, `lead_hard`, `lead_watch`, `power_crisis`, `private_stores` | Living speakers/requests; declarations, resource decisions and ordering flags retained |
| `custody_after` | Mira/Sela current presence; original Tomas L-024 guard retained |

## Reproducible proof

`scripts/living-cast-checks.mjs`, wired into `scripts/verify.mjs`, checks:

- 121 required contracts; living text/choices equal preserved originals.
- 223 non-ending scenes × 14 roster fixtures = 3,122 real imports and 6,244
  Continue calls. Live state is deliberately reset before each Continue;
  scene, full state and stored save bytes must be restored exactly.
- Six marker-less dead-holder imports retain the cast and untested promises.
- 222 nonterminal/non-router scenes × (512 death masks + 8 recovery masks)
  = 115,440 affordable-exit checks. The existing ending and entry-only router
  are excluded only from the choice-exit assertion, not scene inventory.
- Independent named promise fixtures do not derive expected holders from the
  production contract map. Missing/dead patients cannot mint broken outcomes.
- Ten live vent/line patient × keep/break outcomes, including custody-injured
  Mira, plus all three legitimate recoveries and recorded-dead rejection.
- Secondary-speaker witnesses, interrupted dead partners, and 13 image-only
  guards. Existing Rourke/death-result and memorial tests remain in the suite.

Existing verifier fixtures were corrected to supply living, recovered speakers
when testing living text. Affordability and keyboard fixtures now reset between
independent encounters. No existing assertion was removed to conceal a failure.
The validator inspects original descriptors as well as guarded views so the
wrapper cannot hide original choices, flags or graph edges from diagnostics.

PR 122 is untouched: `src/scenes-49.js` blob remains
`6c23da62b94f4c3b855606c489e7544bab69b7a9`, and its actual fresh-run Tomas
regression plus all saved-holder fixtures remain required.

Validation commands (final exact head and outcomes recorded in the V9 outbox):

```sh
VERIFY_EXPECTED_SHA=<candidate> VERIFY_HEAD_REF=ticket/0.30.1-v035-living-cast-01 node scripts/verify.mjs
node scripts/verify.mjs --self-test
node scripts/release-policy.mjs --self-test
node scripts/simulate.mjs --self-test
node scripts/simulate.mjs --profile smoke --policy all --runs 64 --seed 20260817 --shard-size 32 --gate smoke
```

Release posture: NO-PUBLISH / NOT_CERTIFIED; last certified remains 0.28.1d.
ART-R2 held; Amara-route parked. No new plot, new scene IDs, 0.36, Netlify,
recovery retarget, STATUS/ruleset change, or other-game work. These automated
save fixtures are not physical-device or owner-playtest certification.

Next action: Manraj reviews the one ticket PR and, if accepted, merge-commits
in the browser, not squash. Build stops for review and will not merge.
