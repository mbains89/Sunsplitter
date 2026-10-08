#!/usr/bin/env node
/**
 * PORTRAIT_FALLBACK — corridor.jpg is a Vess-lookalike. Agents copy the nearest assignment.
 * Fail only on additions. Live counts at lane tip bca47d13 are grandfathered:
 *   src/engine.js:3  src/state.js:2  src/scenes-12.js:1  src/scenes-29.js:1  src/scenes-52.js:2
 * Live returns stay. Swapping them is FIX FOR OWNER (verify.mjs expects corridor.jpg;
 * engine.js is the 93575 byte-lock trap).
 *
 * Use instead: images/corridor_variant.jpg (person-free) inside resolveSceneImage.
 *
 *   node scripts/guards/portrait-fallback.mjs
 *   node scripts/guards/portrait-fallback.mjs --replay-copy
 */
import fs from "node:fs";
import path from "node:path";

const NEEDLE = "images/corridor.jpg";
const GRANDFATHER = {
  "src/engine.js": 3,
  "src/state.js": 2,
  "src/scenes-12.js": 1,
  "src/scenes-29.js": 1,
  "src/scenes-52.js": 2,
};
const USE_INSTEAD =
  "Do not copy images/corridor.jpg. Use images/corridor_variant.jpg inside resolveSceneImage (src/engine.js).";

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, out);
    else if (ent.name.endsWith(".js")) out.push(p);
  }
  return out;
}

function count(text) {
  return text.split(NEEDLE).length - 1;
}

const replay = process.argv.includes("--replay-copy");
const errors = [];
for (const file of walk("src")) {
  const rel = file.split(path.sep).join("/");
  let n = count(fs.readFileSync(file, "utf8"));
  if (replay && rel === "src/engine.js") n += 1;
  if (!n) continue;
  const allowed = GRANDFATHER[rel] || 0;
  if (n > allowed) {
    errors.push(
      `PORTRAIT_FALLBACK ${rel} has ${n} ${NEEDLE} assignment(s) (grandfather ${allowed}). ${USE_INSTEAD}`
    );
  }
}
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(replay ? "unexpected pass on corridor.jpg copy replay" : "portrait-fallback: pass");
