#!/usr/bin/env node
/**
 * PORTRAIT_FALLBACK — corridor.jpg is a Vess-lookalike. Agents copy the nearest return.
 * Tip 520be6ad src/engine.js has 3 grandfathered `images/corridor.jpg` returns
 * (crisis/priority_repairs/aftermath when amara|jiro|sela dead; crew_walk/status when survivors<=5).
 * New assignments fail. Live returns are FIX FOR OWNER (editing engine.js is the byte-lock trap).
 *
 * Use instead: images/corridor_variant.jpg or images/debris_field.jpg inside resolveSceneImage.
 *
 *   node scripts/guards/portrait-fallback.mjs
 *   node scripts/guards/portrait-fallback.mjs --replay-copy
 */
import fs from "node:fs";
import path from "node:path";

const NEEDLE = "images/corridor.jpg";
const GRANDFATHER = 3;
const COPY = `function resolveSceneImage() {\n  return "${NEEDLE}";\n}\n`;

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

const errors = [];
if (process.argv.includes("--replay-copy")) {
  errors.push(
    `PORTRAIT_FALLBACK replay added ${NEEDLE}. That file is a Vess-lookalike. ` +
      "Do not copy it. Use images/corridor_variant.jpg or images/debris_field.jpg inside resolveSceneImage (src/engine.js)."
  );
} else {
  for (const file of walk("src")) {
    const rel = file.split(path.sep).join("/");
    const n = count(fs.readFileSync(file, "utf8"));
    if (!n) continue;
    if (rel !== "src/engine.js") {
      errors.push(
        `PORTRAIT_FALLBACK ${rel} assigns ${NEEDLE} (${n}). That file is a Vess-lookalike. ` +
          "Do not copy it. Use images/corridor_variant.jpg or images/debris_field.jpg inside resolveSceneImage (src/engine.js)."
      );
    } else if (n > GRANDFATHER) {
      errors.push(
        `PORTRAIT_FALLBACK src/engine.js has ${n} ${NEEDLE} returns (grandfather ${GRANDFATHER}). ` +
          "Do not add another. Use images/corridor_variant.jpg or images/debris_field.jpg inside resolveSceneImage."
      );
    }
  }
}
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log("portrait-fallback: pass (grandfather 3; new corridor.jpg copies fail)");
