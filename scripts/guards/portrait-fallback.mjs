#!/usr/bin/env node
/**
 * PORTRAIT_FALLBACK — corridor.jpg is a Vess-lookalike. Agents copy the nearest return.
 * Existing returns on lane 5a17d633 are grandfathered by exact path and count.
 * A new file, or a higher count on a grandfathered file, fails.
 * This is not a blanket allowlist and not a skip: the string is still forbidden
 * on every other path, and raising a grandfathered count fails.
 *
 * FIX FOR OWNER (do not add another):
 *   src/engine.js 3 — crisis / priority_repairs / low-survivor crew_walk+status
 *   src/state.js 2 — act2_spine_next, boarding_stories
 *   src/scenes-12.js 1 — act2_spine_next
 *   src/scenes-29.js 1 — boarding_stories
 *   src/scenes-52.js 2 — warmth_laughter, warmth_music
 *
 * Use instead: images/corridor_pressure_3.jpg or images/debris_field.jpg inside resolveSceneImage.
 *
 *   node scripts/guards/portrait-fallback.mjs
 *   node scripts/guards/portrait-fallback.mjs --replay-copy
 */
import fs from "node:fs";
import path from "node:path";

const NEEDLE = "images/corridor.jpg";
const FIXTURE = "scripts/guards/fixtures/portrait-copy.js";
const GRANDFATHER = {
  "src/engine.js": 0,
  "src/state.js": 0,
  "src/scenes-12.js": 0,
  "src/scenes-29.js": 0,
  "src/scenes-52.js": 0,
};

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

function offense(rel, n, allowed) {
  return (
    `PORTRAIT_FALLBACK ${rel} assigns ${NEEDLE} (${n}; grandfather ${allowed}). ` +
    "That file is a Vess-lookalike. Do not copy it. Use images/corridor_pressure_3.jpg " +
    "or images/debris_field.jpg inside resolveSceneImage (src/engine.js)."
  );
}

const errors = [];
if (process.argv.includes("--replay-copy")) {
  const n = count(fs.readFileSync(FIXTURE, "utf8"));
  if (n > 0) errors.push(offense("src/ticket-overlay.js", n, 0));
} else {
  for (const file of walk("src")) {
    const rel = file.split(path.sep).join("/");
    const n = count(fs.readFileSync(file, "utf8"));
    if (!n) continue;
    const allowed = GRANDFATHER[rel] || 0;
    if (n > allowed) errors.push(offense(rel, n, allowed));
  }
}
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log("portrait-fallback: pass (existing path counts grandfathered; new corridor.jpg copies fail)");
