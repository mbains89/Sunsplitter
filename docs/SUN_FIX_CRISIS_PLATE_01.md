# SUN-FIX-CRISIS-PLATE-01

Alias: SUN-FIX-PRIORITY-REPAIRS-PRESENCE-01

Base: `version/0.30.1-main-reconcile-ci.1` @ `696676d4dfa31bc561b82f16cc629883b2f7e63e` (#396). Ancestry includes `70689e99`.

## Path cited

`src/engine.js` `resolveSceneImage` — crisis / priority_repairs / aftermath block:

```
if (id === "crisis" || id === "priority_repairs" || id === "aftermath") {
  if (state.flags.crisis === "vent" && map.vent) return map.vent;
  if (state.flags.crisis === "cut" && map.cut_out) return map.cut_out;
  if (!isAlive("amara") || !isAlive("jiro") || !isAlive("sela")) {
    return "images/corridor.jpg";
  }
}
```

Jiro starts unrecovered, so `isAlive("jiro")` is false on early CREW-5 `priority_repairs`. That return painted `images/corridor.jpg` (md5 29c6d96f…, Vess face) before `recovered.vess`.

Vent/cut map early-returns are unchanged.

## After

Wrap in `src/sun-fix-crisis-plate-01.js` (loaded immediately after `src/engine.js` in `index.html`). When those three ids resolve to `images/corridor.jpg`:

- before = `images/corridor.jpg`
- after = `images/mira.jpg` when `!isAlive("vess")`
- after = `images/corridor_variant.jpg` if Vess is already recovered

`mira.jpg` is an existing OWNER_FINAL L-030-safe face. Copy naming Mira is allowed; this is not L-030 Mira-lore. No new JPEG. No Imagine. No GAME_VERSION. No Netlify. No OPEN.

Do not merge Copilot draft #393 (separate / possible engine stub risk).
