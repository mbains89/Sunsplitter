# SUN-ROADMAP-NEXT-PACKS-01

SOURCE lane@2c49176c1643 · TASK SUN-PREP-RESTOCK-01 · MODE proposal

Docs-only planning so `$ S2` never idles after PR **#292**.
Does **not** mint `GAME_VERSION`, open 0.36 product work, remint
PRs 107–292, touch Netlify, certify, or start gameplay from this file.

- Lane: `version/0.30.1-main-reconcile-ci.1`
- Base recorded here: `2c49176c16430258be7cbf9d0a302fed05ae9b88` (PR **#292** merge)
- Prior useful parent: `bc353227497a0aaefe78241f7238e30eb6a848c9` (PR **#291** Slot15)
- Paint: `VERSION.md` first line on lane = `0.36` (existing PAINT; not a new mint)
- Lock: `lane 0.30.1 · certified 0.28.1d · NO-PUBLISH · 0.36 / certify / Netlify OPEN-GATED`

Queue table: `docs/TICKET_QUEUE.md`.
Tip honesty: `docs/SUN_PREP_RESTOCK_01.md`.

Pack numbers `0.30.2` / `0.30.3` / `0.30.4` are planning ids. They are
**not** an OPEN of 0.36 and must not be repainted into `VERSION.md`.

## Holds (binding)

- **0.36 product HOLD** until owner **OPEN**. Existing lane paint is not that OPEN.
- **Last certified:** `0.28.1d`. Nothing on this lane is CERTIFIED.
- **NO-PUBLISH / NOT_CERTIFIED.**
- **Netlify** owner-only. No pin remint from a /goal below.
- **No Bot JPEG gen.**
- **Amara-route PARKED.**
- PR 45 / draft PR 46 untouched. No remint of spent tickets 107–292.
- No tag, Release, deploy, squash, or clone-as-proof.

## Pack status at tip `2c49176c1643`

| Pack | Status |
|---|---|
| 0.30.2 playtest UI leftovers | **ALREADY_SATISFIED** — do not remint |
| 0.30.3 playtest design leftovers | **ALREADY_SATISFIED** — PR #210 / #213 / #214 |
| 0.30.4 art follow-through | Style bible + body_ref **paper** landed. JPEG / Imagine **not** fireable here. Plate-loop brief is the only 0.30.4 leftover in FEED |

## Paste-ready /goal stubs ($ S2 FEED)

Refresh `base:` to the live `version/0.30.1-main-reconcile-ci.1` tip
before launch. Do not copy a stale SHA as if it were still HEAD.

### /goal — FEED 1 (BIG)

```
/goal
repo: mbains89/Sunsplitter
ticket: SUN-HITL-WIRE-REMAP-01
base: refresh ≥2c49176c1643
authority: DRAIN sun restock · owner · pack leftover HITL wire
touch:
  - src/state.js (sceneImages / live image map only)
  - docs/SUN_HITL_WIRE_01.md (receipt only)
graph: gather → prompt → launch → review → merge
this node: launch
objective: Apply the five remaps already named in docs/SUN_HITL_WIRE_01.md using in-tree JPEGs only. One-concern. No new filenames.
success proof:
  1) romance_lena_1, act2_tether_hand_elias, vess_signal, vess_cost, act3_lethal_elias_order match the remap table.
  2) No images/** added. No Slot15 remint. Dead/unrecovered image honesty preserved.
  3) Existing version-verify self-test still runs; no GAME_VERSION mint.
  4) One ticket/* PR into version/0.30.1-main-reconcile-ci.1; merge-commit only.
prohibitions: no 0.36 OPEN, no Netlify, no certify, no tag, no squash, no remint 107-292, no Bot JPEG, no Amara-route.
stop: open PR; do not start ADD-KEYS-A on this branch.
PR: ticket/0.30.1-hitl-wire-remap-01 into version/0.30.1-main-reconcile-ci.1
```

### /goal — FEED 2 (BIG)

```
/goal
repo: mbains89/Sunsplitter
ticket: SUN-HITL-WIRE-ADD-KEYS-A-01
base: refresh
authority: DRAIN sun restock · owner · pack leftover HITL wire slice A
touch:
  - src/state.js image map
  - only scene files that already own aftermath / berths / prom_* keys
graph: gather → prompt → launch → review → merge
this node: launch
objective: Wire ADD-KEYS slice A only (aftermath_*, berths_manifest, prom_*). Reuse in-tree plates named in docs/SUN_HITL_WIRE_01.md.
success proof:
  1) Named keys resolve to existing JPEGs. No new flags or spine.
  2) Breath / custody add-keys stay off this PR.
  3) version-verify still runs. No GAME_VERSION mint.
  4) One ticket/* PR into the version lane; merge-commit only.
prohibitions: no 0.36 OPEN, no Netlify, no certify, no Bot JPEG, no remint 107-292, no Amara-route.
stop: open PR; do not start embryo-sweep on this branch.
PR: ticket/0.30.1-hitl-wire-add-keys-a-01 into version/0.30.1-main-reconcile-ci.1
```

### /goal — FEED 3 (honesty product)

```
/goal
repo: mbains89/Sunsplitter
ticket: SUN-EMBRYO-COUNT-SWEEP-01
base: refresh
authority: DRAIN sun restock · owner · canon constant
touch:
  - vault-face / cascade spoken prose files only
  - do not change HUD embryos meter
graph: gather → prompt → launch → review → merge
this node: launch
objective: Player-facing spoken count is one hundred forty thousand and six (140,006). HUD stays 0-100. Named line E-6103 Noor, Jakarta. Berths stay 214.
success proof:
  1) No live player-facing "fourteen thousand and six" in vault-face / cascade prose touched by this ticket.
  2) HUD embryos meter unchanged.
  3) version-verify still runs. No GAME_VERSION mint.
  4) One ticket/* PR into the version lane; merge-commit only.
prohibitions: no trailer publish, no 0.36 OPEN, no Netlify, no certify, no art regen.
stop: open PR; do not start lethal-resume on this branch.
PR: ticket/0.30.1-embryo-count-sweep-01 into version/0.30.1-main-reconcile-ci.1
```

### /goal — FEED 4 (honesty product)

```
/goal
repo: mbains89/Sunsplitter
ticket: SUN-LETHAL-RESUME-DEATHBEAT-01
base: refresh
authority: DRAIN sun restock · owner · causality
touch:
  - src/scenes-lethals.js (or current lethals module)
  - one existing harness file if an assert must land
graph: gather → prompt → launch → review → merge
this node: launch
objective: Lethal onEnter resume still plays the death beat. Do not skip to the post-death redirect on first resume.
success proof:
  1) Resume on a lethal scene shows the beat once.
  2) Second resume does not re-apply the kill.
  3) version-verify / living-cast checks still pass. No new lethals.
  4) One ticket/* PR into the version lane; merge-commit only.
prohibitions: no 0.36 OPEN, no Netlify, no certify, no new lethal identities, no remint 107-292.
stop: open PR; do not start damage-cause on this branch.
PR: ticket/0.30.1-lethal-resume-deathbeat-01 into version/0.30.1-main-reconcile-ci.1
```

### /goal — FEED 5 (design / docs)

```
/goal
repo: mbains89/Sunsplitter
ticket: SUN-DAMAGE-CAUSE-PROPOSAL-01
base: refresh
authority: DRAIN sun restock · owner · ROADMAP §6 still open
touch:
  - docs/SUN_DAMAGE_CAUSE_PROPOSAL_01.md
graph: gather → prompt → launch → review → merge
this node: launch
objective: Paper-only damage-cause options for ship_exterior / ship_exterior_2. No plate bytes. Grok does not self-lock.
success proof:
  1) Proposal page lists bounded cause options and what stays non-canon until owner lock.
  2) No images/**, no sceneImages, no ROADMAP/LOCKS edit unless owner records a lock in a later ticket.
  3) Holds remain: 0.36 OPEN-GATED, certified 0.28.1d, NO-PUBLISH, no Netlify.
  4) One ticket/* PR into the version lane; merge-commit only.
prohibitions: no 0.36 OPEN, no Netlify, no certify, no Bot JPEG, no body_ref bytes.
stop: open PR; do not start plate-loop on this branch.
PR: ticket/0.30.1-damage-cause-proposal-01 into version/0.30.1-main-reconcile-ci.1
```

### /goal — FEED 6 (design / docs)

```
/goal
repo: mbains89/Sunsplitter
ticket: SUN-ART-PLATE-LOOP-01
base: refresh
authority: DRAIN sun restock · owner · pack 0.30.4 leftover
touch:
  - docs/SUN_ART_PLATE_LOOP_01.md
graph: gather → prompt → launch → review → merge
this node: launch
objective: Docs brief for exactly one NEEDS_GROK_PLATE beat. No JPEG in Cursor or Grok Bot. Owner approves later on grok.com. Canon PASS before any wire.
success proof:
  1) One event_id + brief# + reuse-or-regen call is explicit.
  2) Needle present: Do not generate plates in Cursor / Grok Bot.
  3) No images/** added. No sceneImages wiring.
  4) One ticket/* PR into the version lane; merge-commit only.
prohibitions: no Bot JPEG, no 0.36 OPEN, no Netlify, no certify, no ART-R2 campaign.
stop: open PR; do not launch a second plate beat unbidden.
PR: ticket/0.30.1-art-plate-loop-01 into version/0.30.1-main-reconcile-ci.1
```

## OPEN-GATED stubs (do not fire)

```
# NOT FIREABLE without owner OPEN
SUN-V036-PC-DESKTOP-MATRIX-01
SUN-V036-PC-KEYBOARD-01
SUN-V036-PC-HOVER-FOCUS-01
SUN-V036-PC-VIEWPORT-01
SUN-V036-PIN-PACKET-REFRESH-01
certify / tag / Release / main close-out / Netlify pin remint
```

## What this ticket does not do

- Edit `artifacts/ROADMAP.md` or `artifacts/LOCKS.md`.
- Start any FEED implement PR (those are later /goals).
- Open 0.36 product work. Certify. Deploy. Tag.
- Generate JPEG.
