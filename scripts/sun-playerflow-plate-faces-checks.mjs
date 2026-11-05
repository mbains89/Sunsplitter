// SUN-PLATE-FACES-05/06 — no shared plate shows a named crew member who is dead or not yet aboard,
// on any resolver path (event-art aliases included).
// For every scene, resolve its plate under each single-death roster and under the opening roster
// (Tomas, Jiro, Vess unrecovered); the resolved plate's listed faces must all be alive.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadGame } from "./simulate.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const runtime = loadGame(ROOT);
const result = JSON.parse(runtime.evaluate(`JSON.stringify((() => {
  const crewKeys = ["lena", "elias", "mira", "tomas", "amara", "jiro", "sela", "vess"];
  const rosters = [{ label: "opening", dead: ["rourke"], recovered: {} }];
  for (const k of crewKeys) rosters.push({ label: "dead:" + k, dead: ["rourke", k], recovered: { tomas: true, jiro: true, vess: true } });
  const bad = [];
  const rendered = new Set();
  let checked = 0;
  for (const roster of rosters) {
    resetRunState();
    state.dead = roster.dead.slice();
    state.recovered = Object.assign({}, roster.recovered);
    for (const id of Object.keys(scenes)) {
      let src;
      try { src = resolveSceneImage(id, scenes[id]); } catch (e) { continue; }
      checked += 1;
      if (src) rendered.add(src);
      const faces = PLATE_FACES[src];
      if (faces && !faces.every(isAlive)) bad.push(roster.label + " " + id + " -> " + src);
    }
  }
  // SUN-ART-R2-FALLBACKS-01: per-setting fallbacks are people-free plates and are actually reached.
  const fallbackErrors = [];
  for (const [plate, fallback] of Object.entries(PLATE_FACE_FALLBACK)) {
    if (!PLATE_FACES[plate]) fallbackErrors.push(plate + " has a fallback but no face entry");
    if (PLATE_FACES[fallback]) fallbackErrors.push(fallback + " is not people-free");
  }
  resetRunState(); state.recovered.tomas = state.recovered.jiro = state.recovered.vess = true; state.dead.push("sela");
  if (resolveSceneImage("vault_reveal", scenes.vault_reveal) !== "images/art_r2_vault_racks.jpg") fallbackErrors.push("vault_reveal without Sela did not use the vault fallback");
  resetRunState(); state.recovered.tomas = state.recovered.jiro = state.recovered.vess = true; state.dead.push("elias");
  if (resolveSceneImage("status", scenes.status) !== "images/art_r2_observation_wreck.jpg") fallbackErrors.push("status without Elias did not use the observation fallback");
  resetRunState(); state.recovered.tomas = state.recovered.jiro = state.recovered.vess = true; state.dead.push("amara");
  if (resolveSceneImage("empty_berths", scenes.empty_berths) !== "images/art_r2_empty_berths.jpg") fallbackErrors.push("empty_berths without Amara did not use the berths fallback");
  return { checked, bad, plates: Object.keys(PLATE_FACES).length, fallbackErrors, fallbacks: [...new Set(Object.values(PLATE_FACE_FALLBACK))],
    rendered: [...rendered], faced: Object.keys(PLATE_FACES) };
})())`));
assert.ok(result.plates >= 10, "PLATE_FACES table missing entries (SUN-PLATE-FACES-06 lists 10 plates)");
assert.ok(result.checked > 1000, `too few scene renders checked (${result.checked})`);
assert.deepEqual(result.bad, [], `plates show absent crew:\n${result.bad.join("\n")}`);
assert.deepEqual(result.fallbackErrors, [], result.fallbackErrors.join("\n"));
for (const file of result.fallbacks) {
  const bytes = readFileSync(resolve(ROOT, file));
  let i = 2, size = null;
  while (i < bytes.length && !size) { if (bytes[i] !== 0xff) { i++; continue; } const m = bytes[i + 1];
    if (m >= 0xc0 && m <= 0xc2) size = [bytes.readUInt16BE(i + 7), bytes.readUInt16BE(i + 5)]; else i += 2 + bytes.readUInt16BE(i + 2); }
  assert.deepEqual(size, [784, 1168], `${file} is not the 784x1168 portrait plate`);
}
// SUN-HITL-SHADOW-02: a byte-identical copy of a face-mapped plate rendered under another name would
// bypass the gate (the gate keys on filename). Every rendered plate whose bytes match a faced plate
// must itself be face-mapped.
const digest = file => { try { return createHash("sha256").update(readFileSync(resolve(ROOT, file))).digest("hex"); } catch { return null; } };
const facedByHash = new Map(result.faced.map(file => [digest(file), file]));
const copies = result.rendered.filter(file => !result.faced.includes(file) && facedByHash.has(digest(file)))
  .map(file => file + " = " + facedByHash.get(digest(file)));
assert.deepEqual(copies, [], `unmapped copies of face plates render and bypass the gate:\n${copies.join("\n")}`);
console.log(`PASS sun-playerflow-plate-faces: ${result.checked} scene/roster renders, no absent crew on shared plates`);
