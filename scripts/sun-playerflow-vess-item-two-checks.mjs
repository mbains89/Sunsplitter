// SUN-ROMANCE-ARC-03 (L-050, Wave 1) — Vess's arc runs to a named end state.
// offshift_vess offers "Solve it." to a partner only; vess_item_two writes one flag ("floor" |
// "chair") and no resources; her ruling follows; unrecovered, dead and unpartnered Vess never
// render the pair; final_choice names the spent window; the ending footer cites the answer.
import assert from "node:assert/strict";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadGame } from "./simulate.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const runtime = loadGame(ROOT);
const out = JSON.parse(runtime.evaluate(`JSON.stringify((() => {
  persistSave = () => true;
  const resources = () => [state.survivors, state.integrity, state.cohesion, state.supplies, state.embryos].join("/");
  // crisis and junction resolved so faction_split renders itself after the pair.
  const fresh = () => { resetRunState(); state.recovered.tomas = state.recovered.jiro = state.recovered.vess = true; state.crisisPath = "breath"; state.flags.junctionChoice = "none"; };
  const story = () => document.getElementById("story").innerHTML;
  const row = {};
  // offshift_vess: the existing exits stay; "Solve it." appears for a partner only.
  for (const [name, setup] of [["partner", () => { state.romance.vess = true; }], ["other", () => {}]]) {
    fresh(); setup(); showScene("offshift_vess");
    row[name] = { exits: scenes.offshift_vess.choices.map(c => c.text + ">" + c.next) };
  }
  // Each answer writes one flag, no resources, and reaches her ruling then faction_split.
  row.answers = {};
  for (const [label, answer] of [["Take the deck", "floor"], ["Share the chair", "chair"]]) {
    fresh(); state.romance.vess = true; state.flags.vess_intimate = true; state.flags.last_tx_spent = true;
    showScene("vess_item_two");
    const before = resources();
    const r = { scene: state.scene, text: story(), entryClean: resources() === before && !state.flags.vess_item_two };
    makeChoice(scenes.vess_item_two.choices.find(c => c.text.startsWith(label)));
    r.flag = state.flags.vess_item_two; r.logged = state.scene; r.loggedText = story(); r.resourcesUnchanged = resources() === before;
    makeChoice(scenes.vess_item_two_logged.choices[0]);
    r.after = state.scene;
    row.answers[answer] = r;
  }
  // Text follows the hour: intimate vs window kept.
  const ask = (intimate) => { fresh(); state.romance.vess = true; if (intimate) state.flags.vess_intimate = true; showScene("vess_item_two"); return story(); };
  row.text = { intimate: ask(true), pending: ask(false) };
  // Never rendered: unrecovered, dead, not a partner, ruling without an answer.
  resetRunState(); state.recovered.tomas = state.recovered.jiro = true; state.crisisPath = "breath"; state.flags.junctionChoice = "none"; state.romance.vess = true; showScene("vess_item_two");
  row.unrecovered = { scene: state.scene, text: story(), flag: !!state.flags.vess_item_two };
  fresh(); state.romance.vess = true; kill("vess", "fixture"); showScene("vess_item_two");
  row.dead = { scene: state.scene, text: story(), flag: !!state.flags.vess_item_two };
  fresh(); showScene("vess_item_two"); row.notPartner = { scene: state.scene };
  fresh(); state.romance.vess = true; showScene("vess_item_two_logged"); row.rulingWithoutAnswer = { scene: state.scene };
  // final_choice names the spent window by run fact; unspent runs keep the transmission order.
  const finalText = (setup) => { fresh(); setup(); state.integrity = 60; state.supplies = 40; state.cohesion = 40; state.trust.jiro = 40; showScene("final_choice"); return { text: story(), tx: scenes.final_choice.choices.some(c => c.flag && c.flag.final === "transmission") }; };
  row.final = {
    logs: finalText(() => { state.romance.vess = true; state.flags.vess_intimate = true; state.flags.last_tx_spent = true; }),
    logsDead: finalText(() => { state.romance.vess = true; state.flags.vess_intimate = true; state.flags.last_tx_spent = true; kill("vess", "fixture"); }),
    beacon: finalText(() => { state.flags.last_tx_spent = true; }),
    unspent: finalText(() => { state.romance.vess = true; })
  };
  // Ending footer.
  const footer = (setup) => { fresh(); state.romance.vess = true; setup(); state.integrity = 70; state.cohesion = 50; state.supplies = 50; resolveEnding(); if (typeof finishCinematic === "function" && currentCinematic) finishCinematic(); return document.getElementById("ending-text").textContent; };
  row.footer = { floor: footer(() => { state.flags.vess_item_two = "floor"; }), chair: footer(() => { state.flags.vess_item_two = "chair"; }), none: footer(() => {}) };
  return row;
})())`, 120_000));

assert.deepEqual(out.other.exits, ["Tell the crew.>faction_split", "Hold it between you.>faction_split", "Answer it.>faction_split"], "offshift_vess: existing exits changed");
assert.deepEqual(out.partner.exits, [...out.other.exits, "Solve it.>vess_item_two"], "offshift_vess: partner choice missing or misrouted");
for (const answer of ["floor", "chair"]) {
  const r = out.answers[answer];
  assert.equal(r.scene, "vess_item_two", `${answer}: item two did not render`);
  assert.ok(r.entryClean, `${answer}: entry wrote a flag or a resource`);
  assert.ok(r.text.includes("Solve it.") && r.text.includes("Commander."), `${answer}: problem text missing`);
  assert.equal(r.flag, answer, `${answer}: flag not written`);
  assert.equal(r.logged, "vess_item_two_logged", `${answer}: did not reach her ruling`);
  assert.ok(r.resourcesUnchanged, `${answer}: a resource changed`);
  assert.ok(r.loggedText.includes("She does not correct it."), `${answer}: the Captain beat missing`);
  assert.equal(r.after, "faction_split", `${answer}: exit did not reach faction_split`);
}
assert.ok(out.answers.floor.loggedText.includes("Chair held") && out.answers.chair.loggedText.includes("Rating exceeded"), "ruling text does not follow the answer");
assert.ok(out.text.intimate.includes("would not ask again") && !out.text.intimate.includes("pending"), "text: intimate branch wrong");
assert.ok(out.text.pending.includes("Logged as: pending") && !out.text.pending.includes("would not ask again"), "text: window-kept branch wrong");
for (const name of ["unrecovered", "dead"]) {
  assert.notEqual(out[name].scene, "vess_item_two", `${name} Vess rendered item two`);
  assert.ok(!out[name].text.includes("Solve it."), `${name} Vess's text rendered`);
  assert.equal(out[name].flag, false, `${name} Vess wrote the flag`);
}
assert.notEqual(out.notPartner.scene, "vess_item_two", "non-partner rendered item two");
assert.notEqual(out.rulingWithoutAnswer.scene, "vess_item_two_logged", "ruling rendered without an answer");
assert.ok(out.final.logs.text.includes("six years of logs") && !out.final.logs.text.includes("before she died") && !out.final.logs.tx, "final: spent-on-logs line wrong");
assert.ok(out.final.logsDead.text.includes("before she died") && !out.final.logsDead.tx, "final: dead-partner line wrong");
assert.ok(out.final.beacon.text.includes("dead ship's beacon") && !out.final.beacon.tx, "final: beacon line wrong");
assert.ok(!out.final.unspent.text.includes("no final transmission left") && out.final.unspent.tx, "final: unspent window lost its order");
assert.ok(out.footer.floor.includes("took the deck") && out.footer.chair.includes("occupancy two") && out.footer.floor.includes("stopped correcting"), "footer: answer not cited");
assert.ok(!out.footer.none.includes("kept her chair"), "footer: cited without a run fact");
console.log("PASS sun-playerflow-vess-item-two: partner-only Solve it.; two answers, one flag, no resources; unrecovered, dead and unpartnered never render; final_choice names the spent window; footer cites the answer");
