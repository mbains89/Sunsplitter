#!/usr/bin/env node
// SUN-BUGHUNT-01 regression checks. Not registered in verify.mjs (Ori registers after $S2).
// Run: node scripts/sun-bughunt-01-checks.mjs
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadGame } from "./simulate.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const runtime = loadGame(ROOT, { includeValidator: false });
const evalGame = source => runtime.evaluate(source);

const wake = evalGame(`(() => {
  resetRunState();
  return { meter: state.survivors, board: visibleLivingCrewCount() };
})()`);
assert.equal(wake.board, 6, "wake board is the six people actually aboard");
assert.equal(wake.meter, 9, "stored meter stays untouched so resolveSceneImage plate threshold does not move");

const stock = evalGame(`(() => {
  resetRunState();
  kill("rourke", "shrapnel");
  return String(scenes.reckon_summary.text);
})()`);
assert.match(stock, /Survivors: 5\./, "BH-01 reckon_summary must print the board count");
assert.doesNotMatch(stock, /Survivors: 8\./, "BH-01 reckon_summary must not print the phantom meter");

const gates = evalGame(`(() => {
  resetRunState();
  kill("rourke", "shrapnel");
  kill("amara", "vented");
  kill("sela", "vented");
  const board = visibleLivingCrewCount();
  state.survivors = 9;
  const endingCount = typeof visibleLivingCrewCount === "function" ? visibleLivingCrewCount() : state.survivors;
  return {
    board,
    endingCount,
    gate: meetsRequirements({ survivors: { min: 6 } }),
    reason: formatRequiresReason({ survivors: { min: 6 } })
  };
})()`);
assert.equal(gates.board, 3);
assert.equal(gates.endingCount, 3, "BH-01 ending count must follow the board when the stored meter is stale");
assert.equal(gates.gate, false, "BH-01 survivors:min must use the board, not a stale meter of 9");
assert.match(gates.reason, /Needs 6 Survivors; 3 available/);

const memory = evalGame(`(() => {
  resetRunState();
  state.flags.crisis = "vent";
  kill("amara", "vented with the lower ring");
  kill("sela", "vented at twenty");
  return String(scenes.reckon_memory.text);
})()`);
assert.match(memory, /two names/, "BH-04 vent memorial must not invent a third name when Jiro was never aboard");
assert.doesNotMatch(memory, /three names/);

const walk = evalGame(`(() => { resetRunState(); return String(scenes.crew_walk.text); })()`);
assert.doesNotMatch(walk, /child's shoe/, "BH-05 crew walk must not put a child on the ship");
assert.match(walk, /house key/);

const prose = readFileSync(resolve(ROOT, "src/engine.js"), "utf8");
assert.equal(prose.includes("But the habitation ring is warmer."), false, "BH-02 Living Ship ending must not call the cylinder a habitation ring");
assert.match(prose, /But the habitation decks are warmer\./);
assert.match(prose, /visibleLivingCrewCount\(\)/);
const boarding = readFileSync(resolve(ROOT, "src/scenes-17.js"), "utf8");
assert.equal(boarding.includes("whole ring complain"), false, "BH-03 Vess boarding must not call the cylinder a ring");
assert.match(boarding, /whole cylinder complain/);
assert.match(boarding, /Long white-silver hair/);
const engineBytes = readFileSync(resolve(ROOT, "src/engine.js")).length;
assert.ok(engineBytes >= 90000, `engine.js must stay >= 90000 bytes, got ${engineBytes}`);
console.log("sun-bughunt-01-checks: PASS");
console.log(JSON.stringify({ wake, gates, engineBytes }));
