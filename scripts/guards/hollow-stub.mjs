#!/usr/bin/env node
/**
 * HOLLOW_STUB — refuse player-facing source that an agent stubbed so the shortest path compiles.
 * Evidence: PR #416 head b6284dce replaced src/engine.js with 27 bytes `// see local /tmp/engine.js`.
 * Tip 520be6ad src/engine.js is 93575 bytes and owns resolveSceneImage.
 *
 * L-043 (confirmed by Manraj 2026-11-14) lets the engine span src/engine.js plus src/engine-<part>.js
 * files. The floor and the resolveSceneImage check apply to the engine files index.html loads,
 * taken together; every file under src/ is still checked on its own for stub markers.
 *
 * Use instead: do not replace engine code with a stub. Move it to a src/engine-<part>.js that
 * index.html loads before engine.js, or add an overlay at src/<ticket>.js and load it the way
 * src/dialog-keys.js is pointed from the existing validate.js data-* hook.
 *
 *   node scripts/guards/hollow-stub.mjs
 *   node scripts/guards/hollow-stub.mjs --replay-416
 */
import fs from "node:fs";
import path from "node:path";

const ENGINE_FLOOR = 90000;
const STUB_RE = /see local \/tmp|SEE_LOCAL_PATCH|SEE_LOCAL_FILE|\bPLACEHOLDER\b/;
const REPLAY_416_PATH = "scripts/guards/fixtures/hollow-416.js";
const ENGINE_FILE_RE = /^src\/engine(?:-[a-z0-9]+)*\.js$/;

// The engine files index.html loads, in load order.
// A tag inside an HTML comment is not loaded, and a file loaded twice counts once.
function loadedEngineFiles() {
  const html = fs.existsSync("index.html") ? fs.readFileSync("index.html", "utf8") : "";
  const live = html.replace(/<!--[\s\S]*?-->/g, "");
  return [...new Set([...live.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["']/gi)]
    .map(match => match[1].replace(/^\.\//, ""))
    .filter(rel => ENGINE_FILE_RE.test(rel)))];
}

function checkEngine(parts) {
  const errors = [];
  const names = parts.map(part => part.rel).join(" + ") || "(none)";
  if (!parts.some(part => part.rel === "src/engine.js")) {
    errors.push(`HOLLOW_STUB index.html does not load src/engine.js (engine files loaded: ${names}).`);
  }
  const text = parts.map(part => part.text).join("\n");
  const bytes = parts.reduce((sum, part) => sum + Buffer.byteLength(part.text), 0);
  if (bytes < ENGINE_FLOOR) {
    errors.push(
      `HOLLOW_STUB the engine (${names}) is ${bytes} bytes (floor ${ENGINE_FLOOR}). ` +
        "Do not replace engine code with a stub. Move it to a src/engine-<part>.js that index.html loads, " +
        "or add an overlay at src/<ticket>.js. Tip eng=93575 owns function resolveSceneImage."
    );
  }
  // Whole name only: resolveSceneImageUngated must not satisfy this.
  if (!/\bfunction resolveSceneImage\s*\(/.test(text)) {
    errors.push(
      `HOLLOW_STUB the engine (${names}) is missing function resolveSceneImage. ` +
        "Do not replace engine code with a stub."
    );
  }
  return errors;
}

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, out);
    else if (ent.name.endsWith(".js")) out.push(p);
  }
  return out;
}

function checkText(rel, text) {
  const errors = [];
  const trimmed = text.trim();
  if (trimmed.length < 80 || (STUB_RE.test(text) && Buffer.byteLength(text) < 1000)) {
    errors.push(
      `HOLLOW_STUB ${rel} looks like a claimed-done stub (${Buffer.byteLength(text)} bytes). ` +
        "Do not commit SEE_LOCAL_PATCH / PLACEHOLDER / 'see local /tmp'. " +
        "Write the real file, or add src/<ticket>.js and point at it from the existing loader."
    );
  }
  return errors;
}

const replay = process.argv.includes("--replay-416");
const replaySplit = process.argv.includes("--replay-split");
const errors = [];
if (replaySplit) {
  // L-043 split: the loaded engine is over the floor and keeps a call site and resolveSceneImageUngated,
  // but function resolveSceneImage itself sits only in a part index.html does not load.
  errors.push(...checkEngine([
    { rel: "src/engine-save.js", text: "function persistSave() { return true; }\n".repeat(1200) },
    { rel: "src/engine.js", text: "function showScene(id) { return resolveSceneImage(id); }\nfunction resolveSceneImageUngated(id) { return id; }\n".repeat(600) }
  ]));
} else if (replay) {
  const text = fs.readFileSync(REPLAY_416_PATH, "utf8");
  errors.push(...checkEngine([{ rel: "src/engine.js", text }]), ...checkText("src/engine.js", text));
} else {
  errors.push(...checkEngine(loadedEngineFiles().map(rel => ({
    rel,
    text: fs.existsSync(rel) ? fs.readFileSync(rel, "utf8") : ""
  }))));
  for (const file of walk("src")) {
    const rel = file.split(path.sep).join("/");
    errors.push(...checkText(rel, fs.readFileSync(file, "utf8")));
  }
}
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(replay || replaySplit ? "unexpected pass on replay" : "hollow-stub: pass");
