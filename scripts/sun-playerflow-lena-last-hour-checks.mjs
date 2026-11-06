// SUN-ROMANCE-ARC-01 (L-050, Wave 1) — Lena's arc runs to a named end state.
// The hour she asked for in offshift_lena is offered only to a partner (romance.lena or the
// held_only mark), only while she lives; lena_last_hour writes one flag and no resources; the
// lethal clock carries the private debt as text only; the ending footer cites the end state.
import assert from "node:assert/strict";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadGame } from "./simulate.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const runtime = loadGame(ROOT);
const out = JSON.parse(runtime.evaluate(`JSON.stringify((() => {
  persistSave = () => true;
  const resources = () => [state.survivors, state.integrity, state.cohesion, state.supplies, state.embryos].join("/");
  // crisisPath resolved, so faction_split renders itself instead of routing to the crisis.
  const fresh = () => { resetRunState(); state.recovered.tomas = state.recovered.jiro = state.recovered.vess = true; state.crisisPath = "breath"; };
  const row = {};
  for (const [name, setup] of [
    ["romance", () => { state.romance.lena = true; mark("lena", "dying_held"); }],
    ["held_only", () => { mark("lena", "held_only"); }],
    ["neither", () => {}],
    ["broken", () => { state.romance.lena = true; mark("lena", "dying_held"); state.promises.lena = "broken"; }]
  ]) {
    fresh(); setup();
    showScene("offshift_lena");
    const stay = scenes.offshift_lena.choices.find(c => c.text === "Stay the hour.");
    const r = { offered: !!stay, next: stay && stay.next, junction: state.flags.junctionChoice };
    if (stay) {
      const before = resources();
      makeChoice(stay);
      r.scene = state.scene;
      r.flag = state.flags.lena_last_hour === true;
      r.resourcesUnchanged = resources() === before;
      r.text = document.getElementById("story").innerHTML;
      r.exits = scenes.lena_last_hour.choices.map(c => c.next);
      makeChoice(scenes.lena_last_hour.choices[0]);
      r.after = state.scene;
      // a second entry writes nothing new
      const memories = state.memories.length;
      showScene("lena_last_hour");
      r.idempotent = state.memories.length === memories;
    }
    row[name] = r;
  }
  // Dead Lena never renders the hour.
  fresh(); state.romance.lena = true;
  kill("lena", "fixture");
  showScene("lena_last_hour");
  row.dead = { scene: state.scene, flag: !!state.flags.lena_last_hour, html: document.getElementById("story").innerHTML };
  // The lethal clock carries the private debt for a partner only.
  const clock = (partner, pursued) => { fresh(); state.dying.lena = "kept working until the clock ran out"; if (partner) state.romance.lena = true; if (pursued) state.pursuit.lena = true; showScene("act3_lethal_lena_clock"); return document.getElementById("story").innerHTML; };
  row.clock = { one: clock(true, false).includes("Do not put the night on this chart"), many: clock(true, true).includes("Do not put the nights on this chart"), other: clock(false, false).includes("on this chart") };
  // Ending footer cites the end state from run facts.
  const footer = (setup) => { fresh(); setup(); state.integrity = 70; state.cohesion = 50; state.supplies = 50; resolveEnding(); if (typeof finishCinematic === "function" && currentCinematic) finishCinematic(); return document.getElementById("ending-text").textContent; };
  row.footer = {
    hour: footer(() => { state.romance.lena = true; mark("lena", "dying_held"); state.flags.lena_last_hour = true; }),
    heldHour: footer(() => { mark("lena", "held_only"); state.flags.lena_last_hour = true; }),
    held: footer(() => { mark("lena", "held_only"); }),
    heldDead: footer(() => { mark("lena", "held_only"); kill("lena", "fixture"); }),
    none: footer(() => {})
  };
  return row;
})())`, 120_000));

for (const name of ["romance", "held_only"]) {
  const r = out[name];
  assert.ok(r.offered && r.next === "lena_last_hour", `${name}: Stay the hour not offered`);
  assert.equal(r.junction, "lena", `${name}: junctionChoice not lena`);
  assert.equal(r.scene, "lena_last_hour", `${name}: did not reach lena_last_hour`);
  assert.ok(r.flag, `${name}: lena_last_hour flag not written`);
  assert.ok(r.resourcesUnchanged, `${name}: entry changed a resource`);
  assert.ok(r.text.includes("Variance zero"), `${name}: scene text missing`);
  assert.deepEqual(r.exits, ["faction_split", "faction_split"], `${name}: exits changed`);
  assert.equal(r.after, "faction_split", `${name}: exit did not reach faction_split`);
  assert.ok(r.idempotent, `${name}: re-entry wrote a second memory`);
}
assert.ok(out.romance.text.includes("the private one"), "romance: private-name line missing");
assert.ok(!out.romance.text.includes("Correct dose"), "romance: held-only line leaked");
assert.equal(out.broken.offered, false, "broken: Stay the hour offered after a broken medical line");
assert.ok(out.held_only.text.includes("Correct dose"), "held_only: held-only line missing");
assert.ok(!out.held_only.text.includes("the private one"), "held_only: romance line leaked");
assert.equal(out.neither.offered, false, "neither: Stay the hour offered without a partner");
assert.notEqual(out.dead.scene, "lena_last_hour", "dead Lena rendered the hour");
assert.ok(!out.dead.html.includes("Variance zero"), "dead Lena's hour text rendered");
assert.equal(out.dead.flag, false, "dead Lena wrote the flag");
assert.ok(out.clock.one && out.clock.many && !out.clock.other, "lethal clock debt line gated wrong (night/nights/partner)");
assert.ok(out.footer.hour.includes("someone who stayed") && out.footer.hour.includes("variance zero"), "footer: partner's hour not cited");
assert.ok(out.footer.heldHour.includes("presence without the rest") && out.footer.heldHour.includes("variance zero") && !out.footer.heldHour.includes("someone who stayed"), "footer: held-only hour overclaimed or missing");
assert.ok(out.footer.held.includes("presence without the rest") && !out.footer.held.includes("outlived"), "footer: held-only not cited");
assert.ok(out.footer.heldDead.includes("presence without the rest") && out.footer.heldDead.includes("outlived her"), "footer: dead held-only not cited");
assert.ok(!out.footer.held.includes("variance zero"), "footer: hour cited without the scene");
assert.ok(!out.footer.none.includes("Lena's remaining time") && !out.footer.none.includes("presence without the rest"), "footer: Lena cited without a run fact");
console.log("PASS sun-playerflow-lena-last-hour: partner and held-only reach the hour, dead and unpartnered never; one flag, no resources; clock debt and footer gated on run facts");
