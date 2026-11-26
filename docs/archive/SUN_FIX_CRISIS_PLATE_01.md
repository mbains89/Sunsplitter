# SUN-FIX-CRISIS-PLATE-01

Alias: SUN-FIX-PRIORITY-REPAIRS-PRESENCE-01

REMINT: fold into `src/engine.js`. Do not add `src/sun-fix-crisis-plate-01.js` or an extra index `<script>` (version-verify script manifest is engine.js, validate.js only).

## Path cited

`src/engine.js` `resolveSceneImage` — crisis / priority_repairs / aftermath block.

Jiro starts unrecovered, so `isAlive("jiro")` is false on early CREW-5 `priority_repairs`. The old return painted `images/corridor.jpg` (Vess face) before `recovered.vess`.

Vent/cut map early-returns are unchanged. pregnancy_check Lena hygiene unchanged.

## After (in engine.js, no extra script)

```
if (!isAlive("amara") || !isAlive("jiro") || !isAlive("sela")) {
  return isAlive("vess") ? "images/corridor_variant.jpg" : "images/mira.jpg";
}
```

- before = `images/corridor.jpg`
- after = `images/mira.jpg` when `!isAlive("vess")`
- after = `images/corridor_variant.jpg` if Vess is already recovered

`mira.jpg` is an existing OWNER_FINAL L-030-safe face. Copy naming Mira is allowed; this is not L-030 Mira-lore. No new JPEG. No Imagine. No GAME_VERSION. No Netlify. No OPEN.

Do not merge Copilot draft #393.
