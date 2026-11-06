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
  // SUN-PLATE-FACES-07 (Muse E.1-E.4/E.6): pinned face rosters and fallbacks, and the renders they change.
  const PINNED_FACES = {
    "images/observation.jpg": ["elias", "tomas"],
    "images/vess_boarding.jpg": ["vess", "lena"],
    "images/act3_reckoning_pattern.jpg": ["tomas", "lena", "mira", "sela"],
    "images/arc_future_3.jpg": ["mira", "jiro"],
    "images/power_crisis.jpg": ["mira"],
    "images/arc_living_3.jpg": ["tomas", "elias"],
    "images/lead_together.jpg": ["elias", "amara"],
    "images/vault_sacrifice.jpg": ["mira", "elias"],
    "images/ship_interrupt_resolve.jpg": ["mira"]
  };
  for (const [plate, faces] of Object.entries(PINNED_FACES)) {
    if (JSON.stringify(PLATE_FACES[plate]) !== JSON.stringify(faces)) fallbackErrors.push(plate + " face roster is not " + faces.join(","));
  }
  const PINNED_FALLBACKS = {
    "images/observation.jpg": "images/art_r2_observation_wreck.jpg",
    "images/vess_boarding.jpg": "images/art_r2_empty_berths.jpg"
  };
  for (const [plate, fallback] of Object.entries(PINNED_FALLBACKS)) {
    if (PLATE_FACE_FALLBACK[plate] !== fallback) fallbackErrors.push(plate + " does not fall back to " + fallback);
  }
  resetRunState(); state.recovered.tomas = state.recovered.jiro = state.recovered.vess = true; state.dead.push("lena");
  if (resolveSceneImage("vess_boarding", scenes.vess_boarding) !== "images/art_r2_empty_berths.jpg") fallbackErrors.push("vess_boarding without Lena did not use the berths fallback");
  resetRunState(); state.recovered.jiro = state.recovered.vess = true;
  if (resolveSceneImage("status", scenes.status) !== "images/art_r2_observation_wreck.jpg") fallbackErrors.push("status with Tomas unrecovered did not use the observation wreck");
  resetRunState(); state.recovered.tomas = state.recovered.vess = true;
  if (resolveSceneImage("competence_watch", scenes.competence_watch) !== "images/observation_bridge_alt_2.jpg") fallbackErrors.push("competence_watch with Jiro unrecovered did not use observation_bridge_alt_2");
  resetRunState(); state.recovered.tomas = state.recovered.jiro = state.recovered.vess = true; state.dead.push("sela");
  // sun_payoff renders its HITL event plate (face-gated on Sela); its own dead-Sela image string is pinned too.
  if (scenes.sun_payoff.image !== "images/art_r2_observation_wreck.jpg") fallbackErrors.push("sun_payoff dead-Sela image is not the observation wreck");
  if (resolveSceneImage("sun_payoff", scenes.sun_payoff) === "images/sun_payoff.jpg") fallbackErrors.push("sun_payoff without Sela still shows Sela");
  if (sceneImages.arc_future_4 !== "images/power_stress_1.jpg") fallbackErrors.push("arc_future_4 is not mapped to power_stress_1.jpg");
  // Retired plates (people or baked text) must not render from any scene under any checked roster.
  for (const plate of ["images/observation.jpg", "images/observation_bridge.jpg", "images/abandoned_section.jpg"]) {
    if (rendered.has(plate)) fallbackErrors.push(plate + " still renders");
  }
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
// SUN-HITL-LATE-SIX-01: the six owner-approved Grok Imagine cards recovered from the $ Art chat
// (approved 2026-09-08/09, never saved until 2026-11-05) are pinned to their exact card bytes.
const LATE_SIX = {
  "images/shower_mira.jpg": ["XCckB", "1ddbff58230148475bc2b8e43512e57381e488473e10304eac18ff01f32cccdb"],
  "images/rear_mira.jpg": ["CzOb5", "c4df40109b15ae35e32f7d2f846d9d709ed4a16d52a03756a31c58ba536511b5"],
  "images/rear_amara.jpg": ["wT0pe", "e8167625d3facc2af56bdb16cca6f2eb034cf098bd6928bb05fc890d7742a737"],
  "images/rear_sela.jpg": ["SJDX2", "4ba2d86b4d035f24daeeb5e8499d64d05a54d52ce577734004256f2ae3ff52f0"],
  "images/priority_ration.jpg": ["8flOC", "a28de1fc350cc81d3e97edf8ac5af439db5e9b2e52ae8c3d2be1ccb61827b8aa"],
  "images/berths_manifest.jpg": ["njQ5P", "ffce19f18e485345d23c684be17ef850470f85d4bac57fb4bf7bd619e632a2ba"]
};
for (const [file, [card, sha]] of Object.entries(LATE_SIX)) {
  assert.equal(digest(file), sha, `${file} is not approved Grok card ${card}`);
  assert.ok(result.faced.includes(file), `${file} (card ${card}) is not face-gated`);
}
console.log(`PASS sun-playerflow-plate-faces: ${result.checked} scene/roster renders, no absent crew on shared plates`);
