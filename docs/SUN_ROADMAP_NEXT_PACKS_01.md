# SUN-ROADMAP-NEXT-PACKS-01

SOURCE lane@a5e52b0 · TASK SUN-ROADMAP-NEXT-PACKS-01 · MODE proposal

Docs-only planning so builders never idle after playtest-P2 / PR 163.
Does **not** mint `GAME_VERSION`, open 0.36, remint PRs 107–163, touch
Netlify, certify, or start gameplay from this file.

- Lane: `version/0.30.1-main-reconcile-ci.1`
- Base recorded here: `a5e52b077213a9f15a73b2ba3263b963dcc1e2f9` (PR 163 merge)
- Paint: `VERSION.md` = `0.33` (do not invent a second product version)
- Lock: `lane 0.30.1 · certified 0.28.1d · NO-PUBLISH · 0.36 HOLD`

Queue table: `docs/TICKET_QUEUE.md`.
Ordered leftovers: `artifacts/SUN_PLAYTEST_RESPONSE_PLAN.md` items 5–13.

Pack numbers `0.30.2` / `0.30.3` / `0.30.4` are planning ids. They are
**not** an OPEN of 0.36 and must not be painted into `VERSION.md`.

## Holds (binding)

- **0.36 HOLD** until owner **OPEN**. No mint, no open, no paint of 0.36.
- **Last certified:** `0.28.1d`. Nothing on this lane is CERTIFIED.
- **NO-PUBLISH / NOT_CERTIFIED.**
- **Netlify pin** `a91a26d` is owner-only. No PIN-02 remint.
- **Amara-route PARKED.**
- PR 45 / draft PR 46 untouched. No remint of spent tickets 107–163.
- No tag, Release, deploy, squash, or clone-as-proof.

## Three packs beyond the current 0.30.1 lane

### Pack 0.30.2 — playtest UI leftovers

Objective: drain response-plan items 5–9 as one-concern ticket/* PRs into
the current version lane. No 0.36 language.

| Ticket | Objective | Touch hint |
|---|---|---|
| `SUN-PLAYTEST-CREW-SHEET-FLEX-01` | Crew count + flex name buttons + full-screen crew sheet. | `src/validate.js`, `index.html`, `css/style.css` |
| `SUN-PLAYTEST-ART-DOUBLECLICK-01` | Art double-click minimize restore. | engine/validate + `scripts/playtest-art-doubleclick-checks.mjs` |
| `SUN-PLAYTEST-TITLE-WHITESPACE-01` | Title white-space + rotating ship background. | `index.html`, `css/style.css` |
| `SUN-PLAYTEST-INTRO-BACK-ART-01` | Intro back button + intro art. | `INTRO_SLIDE_ART`, intro overlay |
| `SUN-PLAYTEST-TUTORIAL-TOPFIELDS-01` | Tutorial covers 5 top fields; skip kept. | tutorial overlay + existing tutorial checks |

### Pack 0.30.3 — playtest design leftovers

Objective: keep paper-ready implement identities queued. Design files
already in `docs/`. Do not treat those pages as implement authority.

| Ticket | Objective | Touch hint |
|---|---|---|
| `SUN-PLAYTEST-CREW-CONFLICT-01` | One bounded attach on existing conflict offer sites. | `docs/SUN_PLAYTEST_CREW_CONFLICT_DESIGN.md` |
| `SUN-PLAYTEST-COMMANDER-CREATION-01` | Light hybrid: callsign + seal + oath only. | `docs/SUN_PLAYTEST_COMMANDER_CREATION_DESIGN.md` |
| `SUN-PLAYTEST-ENDING-CINEMATIC-ART-01` | Ending cinematic bookend; reuse-first; no baked titles. | `docs/SUN_PLAYTEST_ENDING_CINEMATIC_ART_DESIGN.md` |

### Pack 0.30.4 — art follow-through (pre-0.36)

Objective: style-bible lock then body_ref then one-beat grok.com plates.
No Cursor / Grok-Bot JPEG generation.

| Ticket | Objective | Touch hint |
|---|---|---|
| `SUN-ART-STYLE-BIBLE-LOCK-01` | Record owner lock of the draft style bible. | `artifacts/SUN_ART_STYLE_BIBLE.md` |
| `SUN-ART-BODY-REFERENCE-01` | Front/back living-cast refs; no bytes in the first ticket. | response-plan living-cast table |
| `SUN-PLAYTEST-ART-PLATE-LOOP-01` | One `NEEDS_GROK_PLATE` beat after style lock. | `artifacts/GROK_BRIEFS_PLAYTEST_ART_EVENT_AUDIT_01.md` |

## Paste-ready /goal stubs

Refresh `base:` to the live `version/0.30.1-main-reconcile-ci.1` tip
before launch. Do not copy a stale SHA as if it were still HEAD.

### /goal — Pack 0.30.2 first ticket

```
/goal
repo: mbains89/Sunsplitter
ticket: SUN-PLAYTEST-CREW-SHEET-FLEX-01
base: refresh
authority: DRAIN sun playtest-P2 · owner · pack 0.30.2
touch:
  - src/validate.js
  - index.html
  - css/style.css
  - scripts/ (existing crew-sheet / playtest harness only if required by the sheet)
graph: gather → prompt → launch → review → merge
this node: launch
objective: Crew count + flex name buttons + full-screen crew character sheet. One-concern. No 0.36. No Amara-route. No Netlify.
success proof:
  1) Named living crew remain reachable from the sheet; dead/unrecovered names stay off it.
  2) Name buttons flex without a new HUD dashboard or quest log.
  3) Existing version-verify self-test still runs; no GAME_VERSION mint.
  4) One ticket/* PR into version/0.30.1-main-reconcile-ci.1; merge-commit only.
prohibitions: no 0.36, no Netlify, no certify, no tag, no squash, no remint 107-163, no Amara-route, no art regen.
stop: open PR; do not start the next ticket unbidden.
PR: ticket/0.30.1-playtest-crew-sheet-flex-01 into version/0.30.1-main-reconcile-ci.1
```

### /goal — Pack 0.30.3 first ticket (owner greenlight required)

```
/goal
repo: mbains89/Sunsplitter
ticket: SUN-PLAYTEST-CREW-CONFLICT-01
base: refresh
authority: DRAIN sun playtest-P2 · owner greenlight required · pack 0.30.3
touch:
  - docs/SUN_PLAYTEST_CREW_CONFLICT_DESIGN.md
  - src/scenes-16.js and/or src/scenes-40.js only if owner greenlight is recorded in the /goal
graph: gather → prompt → launch → review → merge
this node: launch
objective: Bounded crew-conflict attach on existing offer sites only (crew_walk / pair_* / faction_split). No new spine, meter, or HUD. Amara-route stays PARKED.
success proof:
  1) Design constraints in docs/SUN_PLAYTEST_CREW_CONFLICT_DESIGN.md are honored.
  2) pair_turn stays retired. No new state namespace.
  3) No 0.36 mint language. Last certified remains 0.28.1d. NO-PUBLISH.
  4) One ticket/* PR into version/0.30.1-main-reconcile-ci.1; merge-commit only.
prohibitions: no 0.36, no Netlify, no certify, no Amara-route expansion, no art regen, no remint 107-163.
stop: open PR; do not start commander-creation or ending-cinematic-art on this branch.
PR: ticket/0.30.1-playtest-crew-conflict-01 into version/0.30.1-main-reconcile-ci.1
```

### /goal — Pack 0.30.4 first ticket

```
/goal
repo: mbains89/Sunsplitter
ticket: SUN-ART-STYLE-BIBLE-LOCK-01
base: refresh
authority: DRAIN sun playtest-P2 · owner lock · pack 0.30.4
touch:
  - artifacts/SUN_ART_STYLE_BIBLE.md
  - artifacts/PROJECT_STATUS.md (only if owner lock must be recorded)
graph: gather → prompt → launch → review → merge
this node: launch
objective: Record Manraj lock of the draft style bible. Docs only. No JPEG generation in Cursor or Grok Bot. Does not open 0.36. Does not start body_ref bytes.
success proof:
  1) Style bible lock state is explicit (LOCKED by owner vs still DRAFT).
  2) No images/** added. No sceneImages wiring.
  3) Holds remain: 0.36 HOLD, certified 0.28.1d, NO-PUBLISH, Netlify pin owner-only.
  4) One ticket/* PR into version/0.30.1-main-reconcile-ci.1; merge-commit only.
prohibitions: no 0.36, no Netlify, no certify, no art regen, no body_ref bytes, no remint 107-163.
stop: open PR; do not launch SUN-ART-BODY-REFERENCE-01 unbidden.
PR: ticket/0.30.1-art-style-bible-lock-01 into version/0.30.1-main-reconcile-ci.1
```

## What this ticket does not do

- Edit `artifacts/ROADMAP.md` or `artifacts/LOCKS.md` (ROADMAP changes need a separate owner-recorded ruling).
- Start any Pack 0.30.2 / 0.30.3 / 0.30.4 implement PR.
- Open 0.36. Paint 0.36. Certify. Deploy. Tag.
