// SUN-FINAL-HOLD-ONCE-01 — Manraj 2026-11-05, option A. After the hard burn is aborted at
// patch_fails, final_choice no longer offers Hold, so hold -> abort cannot be repeated for cohesion
// and lean. Every navigator branch and both destination states; a softer exit always remains.
import assert from "node:assert/strict";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadGame } from "./simulate.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const runtime = loadGame(ROOT);
const rows = JSON.parse(runtime.evaluate(`JSON.stringify((() => {
  persistSave = () => true;
  const out = [];
  for (const nav of ["jiro", "mira", "rough"]) for (const planet of ["committed", "unset"]) for (const memory of ["jury_rig", "open_wound"]) {
    resetRunState(); state.recovered.jiro = state.recovered.tomas = state.recovered.vess = true;
    state.flags.ship_memory = memory; state.integrity = 70; state.cohesion = 30; state.supplies = 40;
    if (planet === "committed") state.flags.planet = "committed";
    state.trust.jiro = nav === "jiro" ? 40 : 0; state.trust.mira = nav === "mira" ? 45 : 0;
    showScene("final_choice");
    const hold = scenes.final_choice.choices.find(c => c.flag && c.flag.final === "hold");
    makeChoice(hold);
    const reachedPatch = state.scene === "patch_fails";
    makeChoice(scenes.patch_fails.choices.find(c => c.flag && c.flag.patch === "aborted"));
    const after = scenes.final_choice.choices;
    out.push({ nav, planet, memory, reachedPatch, back: state.scene,
      holdAgain: after.some(c => c.flag && c.flag.final === "hold"),
      exits: after.filter(c => (!c.requires || meetsRequirements(c.requires)) && (!c.effects || canAffordEffects(c.effects))).map(c => c.flag.final),
      text: document.getElementById("story").innerHTML });
  }
  return out;
})())`));

assert.equal(rows.length, 12);
for (const row of rows) {
  const id = `${row.nav}/${row.planet}/${row.memory}`;
  assert.ok(row.reachedPatch, `${id}: hold did not reach patch_fails`);
  assert.equal(row.back, "final_choice", `${id}: abort did not return to final_choice`);
  assert.equal(row.holdAgain, false, `${id}: Hold re-offered after an aborted burn (repeatable lap)`);
  assert.ok(row.exits.includes("endure"), `${id}: no softer exit after abort`);
  assert.ok(row.text.includes("Deck 4 will not carry it again"), `${id}: setup does not name the failed burn`);
  assert.ok(row.text.includes(row.planet === "committed" ? "The course is still locked on the rogue planet." : "You still have no destination."),
    `${id}: setup lost destination truth`);
}
console.log(`PASS sun-playerflow-final-hold-once: ${rows.length} navigator/destination/memory cases close Hold after an aborted burn`);
