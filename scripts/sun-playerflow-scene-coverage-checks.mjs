// SUN-SCENE-COVERAGE-01 — every live scene stays reachable from a fresh run.
// Seeded random play (at least 300 runs, continuing in chunks up to 900 until every live scene is
// reached, so rare scenes survive seed drift from unrelated choice changes) through the real engine. Fails when a scene
// that is not on the allowlist below is never reached, when a run hits a render with no enabled
// exit, or when a choice throws. A wiring change that orphans a scene shows up here by name.
import assert from "node:assert/strict";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadGame } from "./simulate.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const MIN_RUNS = 300;
const MAX_RUNS = 900;
const CHUNK = 20;
const SEED = 11;
// Scenes a fresh run never renders, with the reason. Anything else unreached is a failure.
const NOT_RENDERED = {
  act3_crisis_router: "redirect-only: onEnter always returns breath_onset, custody_onset or act3_crisis_declare",
  records_changeorders_after: "legacy save compatibility only (scenes-07 header)"
};

let runtime = loadGame(ROOT);
const visits = {};
const stuck = new Set();
const errors = new Set();
let sceneIds = [];
let runs = 0;
const unreachedNow = () => sceneIds.filter(id => !visits[id] && !NOT_RENDERED[id]);
for (let chunk = 0; chunk * CHUNK < MAX_RUNS; chunk++) {
  if (runs >= MIN_RUNS && !unreachedNow().length) break;
  if (chunk && chunk % 5 === 0) runtime = loadGame(ROOT); // fresh realm keeps the run fast
  const out = JSON.parse(runtime.evaluate(`JSON.stringify((() => {
    persistSave = () => true;
    let seed = ${SEED * 1000 + chunk};
    const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
    Math.random = rnd;
    const visits = {}, stuck = [], errors = [];
    const enabled = c => c && (!c.alive || isAlive(c.alive)) &&
      (!c.aliveAll || c.aliveAll.every(k => isAlive(k))) &&
      (!c.aliveAny || c.aliveAny.some(k => isAlive(k))) &&
      (!c.requires || meetsRequirements(c.requires)) && (!c.effects || canAffordEffects(c.effects));
    for (let r = 0; r < ${CHUNK}; r++) {
      resetRunState();
      state.recovered.tomas = rnd() < 0.7; state.recovered.jiro = rnd() < 0.7; state.recovered.vess = rnd() < 0.7;
      showScene("wake");
      for (let step = 0; step < 700; step++) {
        const id = state.scene;
        visits[id] = (visits[id] || 0) + 1;
        if (id === "ending_check" || !scenes[id]) break;
        const scene = scenes[id];
        const choices = ((typeof scene.choices === "function" ? scene.choices() : scene.choices) || []).filter(enabled);
        if (!choices.length) { stuck.push(id); break; }
        try { makeChoice(choices[Math.floor(rnd() * choices.length)]); }
        catch (error) { errors.push(id + ": " + String(error && error.message).slice(0, 100)); break; }
      }
    }
    return { visits, stuck, errors, ids: Object.keys(scenes) };
  })())`, 600_000));
  for (const [id, count] of Object.entries(out.visits)) visits[id] = (visits[id] || 0) + count;
  out.stuck.forEach(id => stuck.add(id));
  out.errors.forEach(message => errors.add(message));
  sceneIds = out.ids;
  runs += CHUNK;
}

assert.deepEqual([...errors], [], `choices threw during seeded play: ${[...errors].join("; ")}`);
assert.deepEqual([...stuck], [], `seeded play reached renders with no enabled exit: ${[...stuck].join(", ")}`);
const unreached = sceneIds.filter(id => !visits[id] && !NOT_RENDERED[id]);
assert.deepEqual(unreached, [], `live scenes never reached in ${runs} seeded runs: ${unreached.join(", ")}`);
const staleAllow = Object.keys(NOT_RENDERED).filter(id => !sceneIds.includes(id) || visits[id]);
assert.deepEqual(staleAllow, [], `allowlist entries are stale (renamed, removed or now rendered): ${staleAllow.join(", ")}`);
console.log(`PASS sun-playerflow-scene-coverage: ${sceneIds.length - Object.keys(NOT_RENDERED).length}/${sceneIds.length - Object.keys(NOT_RENDERED).length} live scenes reached in ${runs} seeded runs; no dead ends, no throws`);
