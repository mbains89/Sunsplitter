# SCENE_SKELETON.md — Sunsplitter pure-data scene template

**Verified against engine 0.25.4 / 0.26 package form.**  
Copy the declaration header + object shape for every new scene. The declaration header is mandatory; Build rejects drafts without it, unread. The scene object itself contains ONLY `text | choices | onEnter | image` — the four locked fields. Scenes are registered by object key (no `id:` field inside the object — `id:` is a validate error).

### state.dying (0.25 — map, not scalar)

From 0.25 onward `state.dying` is a **map** `{ [name]: causeString }`, not a scalar string.

- `freshState().dying = {}`
- Write: `state.dying.lena = "kept working until the clock ran out"`
- Read / precondition: `state.dying && state.dying.lena` or `!state.dying.lena`
- On successful rescue of a dying character: `delete state.dying[name]`
- Legacy saves with scalar `"lena"` are normalized on load to `{ lena: "kept working until the clock ran out" }`

`kill(name, cause)` is separate: it moves the character into `state.dead` / `state.deathCause` and decrements survivors. Lethal scene `onEnter` typically calls `kill` and may also write the dying map when the clock was already running. Do not write a scalar into `state.dying`.

### Engine choice fields (locked)

| Field | Meaning |
|-------|---------|
| `next` | Destination scene id (required) |
| `alive` | string key — choice hidden if !isAlive |
| `aliveAll` / `aliveAny` | array of keys |
| `requires` | `{ supplies: { min: N }, integrity: { min: N }, ... }` — disabled + reason if unmet |
| `effects` | `{ supplies: -4, embryos: -22, ... }` |
| `lean` | `{ living: 1 }` or `{ future: 1 }` |
| `trust` / `affinity` | `{ tomas: 1 }` etc. |
| `flag` | `{ key: value }` written via Object.assign |
| `mark` | `{ who: "tag" }` |
| `tag` | `"private"` \| `"bond"` (discoverability label) |
| `remember` | string (private memory; rare — prefer public flags for crises) |

**No `goto`, no `if:` function on choices.** Use `alive:` / `requires:` / text-level `isAlive()` guards.

```js
// ═══ SCENE DECLARATION ═══════════════════════════════════════════
// SCENE_ID: act#_short_snake_id
// VERSION:  0.xx.x        TICKET: <one-concern ticket ref>
// PACKAGE:  <optional package name>
// SPINE:    on-spine after <scene_id>  |  off-spine, reached via <scene_id(s)>
//
// PRECONDITIONS (live predicates, evaluated at render — never baked
// at author time; must remain true if later versions add death vectors):
//   requires: isAlive('tomas')
//   requires: state.crisisPath === 'breath'
//   requires: !state.dying.lena                 // map form — key absent or falsy
//
// STATE WRITES (exhaustive — every mutation this scene can cause):
//   onEnter sets: state.flags.<key> = '<value>'   // plain assignment preferred
//   choice N sets: effects / lean / trust / affinity / flag as listed
//   onEnter may call: kill('<name>', '<cause string>')
//   writes NOTHING else. New keys require a Grok lock before use.
//
// DEATH EXPOSURE: none  |  can kill <name> via onEnter / choice
//   (if lethal: confirm the foreknowledge line exists earlier per lock #6)
// DEAD-SPEECH CHECK: every named character quoted or acting in text/choices
//   is guarded by isAlive() — list them: <name>, <name>
// IMAGE: <art_ref>  [EXISTS | REQUESTED → ART_REQUESTS.md | REUSE <ref>]
// ═════════════════════════════════════════════════════════════════

act#_short_snake_id: {
  image: "images/<plate>.jpg",   // single ref; death-aware via resolveSceneImage if needed

  onEnter: () => {
    // ONLY the writes declared above. Prefer plain assignment (idempotent).
    // May return a string scene id to redirect (engine supports it).
    // Does not receive an argument; use global state / helpers.
    state.flags.<key> = "<value>";
  },

  text: () => {
    let t = `Base prose, restrained, grim.`;
    if (isAlive("tomas")) {
      t += `\n\nTomas line or presence.`;
    }
    if (state.flags.<key> === "given") {
      t += `\n\nConsequence line that cites its cause in prose.`;
    }
    return t;
  },

  choices: [
    {
      text: "Choice shown to all runs.",
      next: "next_scene_id"
    },
    {
      text: "Survivor-dependent choice — vanishes on death.",
      next: "branch_scene_id",
      alive: "tomas",
      effects: { supplies: -4 },
      requires: { supplies: { min: 6 } }
    },
    {
      text: "Ungated floor option (always available).",
      next: "collapse_scene_id",
      effects: { cohesion: -10 },
      lean: { future: 1 }
    }
    // Never tag which choice matters. No meter language in choice text.
  ]
}
```

**isAlive guard pattern (the only acceptable form).** Guards are live predicates (`isAlive('name')`), checked at render inside `text` functions and via `alive:` on choices. Never precompute liveness into a local variable at authoring time, never gate on a mark that proxies for liveness, and never rely on scene reachability to imply someone is alive — death vectors will break both. Tomas/Jiro/Vess are alive only after `recovered.*` and not later killed.

**onEnter redirects:** returning a non-empty string that is not the current id causes `showScene(redirect)`. Used by routers and in-flight version skips.

**Mechanical validation contract (what Build checks against this header):** declared preconditions exist in the state schema; every write in the object appears in STATE WRITES and vice versa; every quoted character appears in DEAD-SPEECH CHECK with a live guard in the code; image ref resolves or has an ART_REQUESTS entry; scene registered via `registerScenes`; SPINE assert updated if on-spine (data-driven, deferred until exclusive crises land).

**Registration house form:**
```js
const scenesExclusive = { /* ... */ };
registerScenes(scenesExclusive);
```
Load order for new exclusive file: after `scenes-crises.js`, before `scenes-late.js`.
