// SUN-PROMISE-CUSTODY-AMARA-01 (decision 27, ruled 2026-11-25; Hex design A step 6) — Amara's promise is
// tested on the Custody path too.
// Pins:
//   - custody_after sends a made, living Amara with a living reader (Jiro, else Vess) into prom_vent, which
//     opens on heat trapped in the service run (the Custody form) and never on the biofilm; Breath keeps the
//     biofilm form; with no crisis path, no reader, a dead Amara or an unmade promise the test is skipped
//     (it redirects on into the ladder without picking a reader).
//   - Keep holds the vent and the reader lives (Custody keep text); break vents the reader with the authored
//     cause and Amara's quote-back; both continue to prom_deck4.
//   - Ruling (a): the break kills the reader, never Amara, and Amara is alive to quote the promise back.
//   - What Remains prints the reader's death once: the death line carries it and the promise line is the
//     fatal variant with no death clause; the epilogue does not repeat it.
import assert from "node:assert/strict";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadGame } from "./simulate.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const out = JSON.parse(loadGame(ROOT).evaluate(`JSON.stringify((() => {
  persistSave = () => true;
  const story = () => document.getElementById("story").innerHTML.replace(/<[^>]+>/g, " ");
  const list = id => { const c = scenes[id].choices; return typeof c === "function" ? c.call(scenes[id]) : c; };
  const fresh = path => {
    resetRunState(); Object.assign(state.recovered, { tomas: true, jiro: true, vess: true });
    state.crisisPath = path; if (path === "custody") { state.flags.custody_answer = "thawed"; state.flags.custody_roll = true; }
    if (path === "breath") state.flags.breath_answer = "racks";
  };
  const enter = (path, setup) => {
    fresh(path); state.promises.amara = "made"; setup();
    showScene(path === "custody" ? "custody_after" : "breath_after");
    const exit = list(state.scene)[0].next;
    makeChoice(list(state.scene)[0]);
    return { exit, scene: state.scene, reader: state.flags.prom_line_other || null, text: story() };
  };
  const play = (path, answer, setup) => {
    const r = enter(path, setup);
    if (r.scene !== "prom_vent") return r;
    r.choices = list("prom_vent").map(c => c.text + ">" + c.next);
    makeChoice(list("prom_vent")[answer]);
    r.result = state.scene; r.resultText = story(); r.promise = state.promises.amara;
    r.dead = state.dead.slice(); r.amaraAlive = isAlive("amara"); r.cause = state.deathCause[r.reader] || null;
    r.next = list(state.scene).map(c => c.next);
    r.facts = whatRemainsFacts(); r.epilogues = crewEpilogues().join(" ");
    return r;
  };
  return {
    custodyKeep: play("custody", 0, () => {}),
    custodyBreak: play("custody", 1, () => {}),
    custodyVessKeep: play("custody", 0, () => { state.recovered.jiro = false; }),
    custodyVessBreak: play("custody", 1, () => { kill("jiro", "fixture"); }),
    breathKeep: play("breath", 0, () => {}),
    breathBreak: play("breath", 1, () => {}),
    breathVess: play("breath", 0, () => { state.recovered.jiro = false; }),
    noReader: enter("custody", () => { kill("jiro", "fixture"); kill("vess", "fixture"); }),
    deadAmara: enter("custody", () => { kill("amara", "fixture"); }),
    unmade: enter("custody", () => { state.promises.amara = "declined"; }),
    noPath: (() => { fresh(null); state.promises.amara = "made"; showScene("prom_vent"); return { exit: null, scene: state.scene, reader: state.flags.prom_line_other || null }; })()
  };
})())`, 120_000));

const HEAT = "The heat is not finished.";
const BIOFILM = "The biofilm is not finished.";
const QUOTE = "You said: I will not vent anyone who is still breathing.";

for (const [label, r, reader] of [["Custody keep", out.custodyKeep, "jiro"], ["Custody break", out.custodyBreak, "jiro"],
  ["Custody keep, Vess reading", out.custodyVessKeep, "vess"], ["Custody break, Vess reading", out.custodyVessBreak, "vess"]]) {
  assert.equal(r.exit, "prom_vent", `${label}: custody_after no longer leads to prom_vent`);
  assert.equal(r.scene, "prom_vent", `${label}: the service-pocket test did not render on Custody`);
  assert.equal(r.reader, reader, `${label}: wrong reader`);
  assert.ok(r.text.includes(HEAT) && r.text.includes("too much heat") && !r.text.includes(BIOFILM) && !r.text.includes("bad air"), `${label}: not the Custody form`);
  assert.deepEqual(r.next, ["prom_deck4"], `${label}: the outcome does not continue to prom_deck4`);
  assert.ok(r.amaraAlive, `${label}: ruling (a) - Amara died in her own test`);
}
assert.ok(out.custodyVessKeep.text.includes("Dawnbreak protocol for a hot section was: youngest yields") && !out.custodyVessKeep.text.includes("shared air"), "Vess's Custody read is not the hot-section form");
assert.ok(out.custodyKeep.text.includes("Jiro says") && !out.custodyKeep.text.includes("Vess says"), "Jiro reading: Vess spoke");
for (const r of [out.custodyKeep, out.custodyVessKeep]) {
  assert.equal(r.result, "prom_vent_keep"); assert.equal(r.promise, "kept", "Custody keep did not keep the promise");
  assert.ok(!r.dead.includes(r.reader), "Custody keep killed the reader");
  assert.ok(r.resultText.includes("heat-sick, breathing") && !r.resultText.includes("coughing") && !r.resultText.includes("re-fouls"), "Custody keep text is not the heat form");
  assert.ok(r.facts.includes("At the service-pocket test, the vent stayed shut until the reader came out breathing."), "Custody keep missing from What Remains");
}
for (const r of [out.custodyBreak, out.custodyVessBreak]) {
  assert.equal(r.result, "prom_vent_break"); assert.equal(r.promise, "broken", "Custody break did not break the promise");
  assert.ok(r.dead.includes(r.reader) && !r.dead.includes("amara"), "ruling (a): the Custody break must kill the reader and never Amara");
  assert.equal(r.cause, "vented breathing in the service pocket", "Custody break lost its authored cause");
  assert.ok(r.resultText.includes(QUOTE), "Custody break lost Amara's quote-back");
  const name = r.reader === "jiro" ? "Jiro" : "Vess";
  const deathPrints = r.facts.filter(f => f.includes(name) && /died/.test(f)).length;
  assert.equal(deathPrints, 1, "Custody break: the reader's death does not print exactly once in What Remains");
  assert.ok(r.facts.includes("At the service-pocket test, the vent did not stay shut."), "Custody break: What Remains does not use the fatal promise line");
  assert.ok(!/reader still breathing/.test(r.epilogues), "Custody break: the epilogue repeats the death");
}
assert.ok(out.breathKeep.text.includes(BIOFILM) && !out.breathKeep.text.includes(HEAT), "Breath lost the biofilm form");
assert.ok(out.breathVess.text.includes("Dawnbreak protocol for shared air was: youngest yields"), "Vess's Breath read changed");
assert.ok(out.breathKeep.resultText.includes("coughing, breathing") && !out.breathKeep.resultText.includes("heat-sick"), "Breath keep text changed");
assert.ok(out.breathBreak.dead.includes("jiro") && out.breathBreak.amaraAlive && out.breathBreak.resultText.includes(QUOTE), "Breath break changed");
// A skipped test redirects on into the ladder (prom_deck4 onward) without rendering or picking a reader.
for (const [label, r] of [["no living reader", out.noReader], ["dead Amara", out.deadAmara], ["declined promise", out.unmade], ["no crisis path", out.noPath]]) {
  assert.notEqual(r.scene, "prom_vent", `${label}: the service-pocket test was not skipped`);
  assert.equal(r.reader, null, `${label}: the skipped test picked a reader`);
  if (r.exit) assert.equal(r.exit, "prom_vent", `${label}: custody_after no longer leads to prom_vent`);
}

console.log("PASS sun-playerflow-promise-custody: custody_after runs Amara's service-pocket test in its heat form " +
  "(Jiro or Vess reading), keep and break continue to prom_deck4, the break kills the reader and never Amara, " +
  "the death prints once in What Remains; Breath keeps the biofilm form; no reader, dead Amara or no path skips it");
