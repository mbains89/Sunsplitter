#!/usr/bin/env node
/**
 * HOLLOW_STUB — refuse player-facing source that an agent stubbed so the shortest path compiles.
 * Evidence: PR #416 head b6284dce replaced src/engine.js with 27 bytes `// see local /tmp/engine.js`.
 * Tip 520be6ad src/engine.js is 93575 bytes and owns resolveSceneImage.
 *
 * Use instead: do not replace src/engine.js. Add an overlay at src/<ticket>.js and load it
 * the way src/dialog-keys.js is pointed from the existing validate.js data-* hook.
 *
 *   node scripts/guards/hollow-stub.mjs
 *   node scripts/guards/hollow-stub.mjs --replay-416
 */
import fs from "node:fs";
import path from "node:path";

const ENGINE_FLOOR = 90000;
const STUB_RE = /see local \/tmp|SEE_LOCAL_PATCH|SEE_LOCAL_FILE|\bPLACEHOLDER\b/;
const REPLAY_416_PATH = "scripts/guards/fixtures/hollow-416.js";

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
  if (rel.replace(/\\/g, "/") === "src/engine.js") {
    if (Buffer.byteLength(text) < ENGINE_FLOOR) {
      errors.push(
        `HOLLOW_STUB ${rel} is ${Buffer.byteLength(text)} bytes (floor ${ENGINE_FLOOR}). ` +
          "Do not replace src/engine.js. Add an overlay at src/<ticket>.js and load it " +
          "the way src/dialog-keys.js is pointed from the existing validate.js data-* hook. " +
          "Tip eng=93575 owns function resolveSceneImage."
      );
    }
    if (!text.includes("function resolveSceneImage")) {
      errors.push(
        `HOLLOW_STUB ${rel} is missing function resolveSceneImage. ` +
          "Do not replace src/engine.js. Overlay via src/<ticket>.js instead."
      );
    }
  }
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
const errors = [];
if (replay) {
  errors.push(...checkText("src/engine.js", fs.readFileSync(REPLAY_416_PATH, "utf8")));
} else {
  for (const file of walk("src")) {
    const rel = file.split(path.sep).join("/");
    errors.push(...checkText(rel, fs.readFileSync(file, "utf8")));
  }
}
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(replay ? "unexpected pass on #416 replay" : "hollow-stub: pass");
