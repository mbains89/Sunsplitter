// SUN-PLATE-FACES-05 — no shared plate shows a named crew member who is dead or not yet aboard.
// For every scene, resolve its plate under each single-death roster and under the opening roster
// (Tomas, Jiro, Vess unrecovered); the resolved plate's listed faces must all be alive.
import assert from "node:assert/strict";
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
  let checked = 0;
  for (const roster of rosters) {
    resetRunState();
    state.dead = roster.dead.slice();
    state.recovered = Object.assign({}, roster.recovered);
    for (const id of Object.keys(scenes)) {
      let src;
      try { src = resolveSceneImage(id, scenes[id]); } catch (e) { continue; }
      checked += 1;
      const faces = PLATE_FACES[src];
      if (faces && !faces.every(isAlive)) bad.push(roster.label + " " + id + " -> " + src);
    }
  }
  return { checked, bad, plates: Object.keys(PLATE_FACES).length };
})())`));
assert.ok(result.plates >= 5, "PLATE_FACES table missing");
assert.ok(result.checked > 1000, `too few scene renders checked (${result.checked})`);
assert.deepEqual(result.bad, [], `plates show absent crew:\n${result.bad.join("\n")}`);
console.log(`PASS sun-playerflow-plate-faces: ${result.checked} scene/roster renders, no absent crew on shared plates`);
