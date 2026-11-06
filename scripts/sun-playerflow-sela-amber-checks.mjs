// SUN-ROMANCE-ARC-05 (L-050, Wave 1) — Sela's arc runs to a named end state.
// offshift_sela offers "Stay past amber." to a partner only, beside the existing exit; sela_past_amber
// reads the vow, the key and the tested promise, writes one flag ("meaning" | "sentence" | "silence")
// and no resources; her reply follows; dead and unpartnered Sela never render the pair; prom_price and
// custody_shared carry the vow as text only; the ending footer and the Yellow Circle text cite the answer.
import assert from "node:assert/strict";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadGame } from "./simulate.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const runtime = loadGame(ROOT);
const out = JSON.parse(runtime.evaluate(`JSON.stringify((() => {
  persistSave = () => true;
  const resources = () => [state.survivors, state.integrity, state.cohesion, state.supplies, state.embryos].join("/");
  const fresh = () => { resetRunState(); state.recovered.tomas = state.recovered.jiro = state.recovered.vess = true; state.crisisPath = "custody"; state.flags.custody_answer = "shared"; state.flags.junctionChoice = "none"; mark("sela", "spoken"); };
  const story = () => document.getElementById("story").innerHTML;
  const row = {};
  for (const [name, setup] of [["partner", () => { state.romance.sela = true; }], ["open", () => {}], ["declined", () => { mark("sela", "declined"); }]]) {
    fresh(); setup(); showScene("offshift_sela");
    row[name] = { exits: scenes.offshift_sela.choices.map(c => c.text + ">" + c.next) };
  }
  row.answers = {};
  for (const [label, answer] of [["Ask what the ritual means", "meaning"], ["Ask her for the sentence", "sentence"], ["Say nothing.", "silence"]]) {
    fresh(); state.romance.sela = true; state.flags.pursuit_sela_cost = "vow"; state.flags.sela_vault_vow = "accepted"; state.promises.sela = "kept";
    showScene("sela_past_amber");
    const before = resources();
    const r = { scene: state.scene, text: story(), entryClean: resources() === before && !state.flags.sela_amber };
    makeChoice(scenes.sela_past_amber.choices.find(c => c.text.startsWith(label)));
    r.flag = state.flags.sela_amber; r.reply = state.scene; r.replyText = story(); r.resourcesUnchanged = resources() === before;
    makeChoice(scenes.sela_past_amber_reply.choices[0]);
    r.after = state.scene;
    row.answers[answer] = r;
  }
  const amber = (setup) => { fresh(); state.romance.sela = true; setup(); showScene("sela_past_amber"); return story(); };
  row.text = {
    vow: amber(() => { state.flags.pursuit_sela_cost = "vow"; state.flags.sela_vault_vow = "accepted"; state.promises.sela = "kept"; }),
    privateVow: amber(() => { state.flags.pursuit_sela_cost = "private_vow"; state.flags.sela_vault_vow = "accepted"; state.promises.sela = "broken"; }),
    refused: amber(() => { state.flags.sela_vault_vow = "refused"; state.flags.custody_answer = "possession"; state.promises.sela = "made"; }),
    measurement: amber(() => { state.flags.custody_answer = "thawed"; state.promises.sela = "declined"; })
  };
  fresh(); state.romance.sela = true; kill("sela", "fixture"); showScene("sela_past_amber");
  row.dead = { scene: state.scene, text: story(), flag: !!state.flags.sela_amber };
  fresh(); showScene("sela_past_amber"); row.notPartner = { scene: state.scene };
  fresh(); state.romance.sela = true; showScene("sela_past_amber_reply"); row.replyWithoutAnswer = { scene: state.scene };
  // The vow lands inside prom_price; the key is named in custody_shared; choices unchanged.
  const price = (partner, cost) => { fresh(); state.promises.sela = "made"; if (partner) state.romance.sela = true; if (cost) state.flags.pursuit_sela_cost = cost; showScene("prom_price"); return { scene: state.scene, text: story(), choices: scenes.prom_price.choices.map(c => c.text + ">" + c.next) }; };
  row.price = { vow: price(true, "vow"), privateVow: price(true, "private_vow"), unpursued: price(true, null), other: price(false, "vow") };
  const key = (partner) => { fresh(); if (partner) state.romance.sela = true; showScene("custody_shared"); return { text: story(), choices: scenes.custody_shared.choices.map(c => c.text + ">" + c.next) }; };
  row.key = { partner: key(true), other: key(false) };
  // Ending footer and the Yellow Circle text.
  const footer = (setup) => { fresh(); state.romance.sela = true; setup(); state.integrity = 70; state.cohesion = 30; state.supplies = 50; resolveEnding(); if (typeof finishCinematic === "function" && currentCinematic) finishCinematic(); return { title: document.getElementById("ending-title").textContent, text: document.getElementById("ending-text").textContent }; };
  row.footer = { meaning: footer(() => { state.flags.sela_amber = "meaning"; }), sentence: footer(() => { state.flags.sela_amber = "sentence"; }), silence: footer(() => { state.flags.sela_amber = "silence"; }), none: footer(() => {}) };
  const yellow = (setup) => { fresh(); state.romance.sela = true; setup(); state.flags.crisis = "cut"; state.flags.vault_sacrifice = "living"; state.flags.final = "endure"; state.cohesion = 60; state.survivors = 7; state.integrity = 70; state.supplies = 50; resolveEnding(); if (typeof finishCinematic === "function" && currentCinematic) finishCinematic(); return { title: document.getElementById("ending-title").textContent, text: document.getElementById("ending-text").textContent }; };
  row.yellow = { amber: yellow(() => { state.flags.sela_amber = "silence"; }), none: yellow(() => {}) };
  return row;
})())`, 120_000));

assert.deepEqual(out.open.exits, ["Stay past the yellow.>faction_split", "Let the lamp go amber and step back.>faction_split"], "offshift_sela: the open question's exits changed");
assert.deepEqual(out.declined.exits, ["Stand with her until amber.>faction_split"], "offshift_sela: a declined Sela was offered the partner choice");
assert.deepEqual(out.partner.exits, ["Stand with her until amber.>faction_split", "Stay past amber.>sela_past_amber"], "offshift_sela: partner choice missing or misrouted");
for (const answer of ["meaning", "sentence", "silence"]) {
  const r = out.answers[answer];
  assert.equal(r.scene, "sela_past_amber", `${answer}: the scene did not render`);
  assert.ok(r.entryClean, `${answer}: entry wrote a flag or a resource`);
  assert.ok(r.text.includes("not a claim on the next watch either"), `${answer}: scene text missing`);
  assert.equal(r.flag, answer, `${answer}: flag not written`);
  assert.equal(r.reply, "sela_past_amber_reply", `${answer}: did not reach her reply`);
  assert.ok(r.resourcesUnchanged, `${answer}: a resource changed`);
  assert.ok(r.replyText.includes("lit for the ship again"), `${answer}: reply text missing`);
  assert.equal(r.after, "faction_split", `${answer}: exit did not reach faction_split`);
}
assert.ok(out.answers.meaning.replyText.includes("counted on purpose") && out.answers.sentence.replyText.includes("one sentence unfinished") && out.answers.silence.replyText.includes("correct amount of speech"), "reply text does not follow the answer");
assert.ok(out.text.vow.includes("where the ship could log it") && out.text.vow.includes("first key") && out.text.vow.includes("one does not thank a kept promise"), "text: logged vow / key / kept entries missing");
assert.ok(out.text.privateVow.includes("not to the ship") && out.text.privateVow.includes("I said the word spent"), "text: private vow / broken entries missing");
assert.ok(out.text.refused.includes("A refusal is also a complete sentence") && !out.text.refused.includes("first key") && !out.text.refused.includes("kept promise") && !out.text.refused.includes("word spent"), "text: refused branch or untested promise wrong (L-024)");
assert.ok(out.text.measurement.includes("one measurement") && !out.text.measurement.includes("vow"), "text: never-pursued branch wrong");
assert.notEqual(out.dead.scene, "sela_past_amber", "dead Sela rendered the scene");
assert.ok(!out.dead.text.includes("not a claim on the next watch"), "dead Sela's text rendered");
assert.equal(out.dead.flag, false, "dead Sela wrote the flag");
assert.notEqual(out.notPartner.scene, "sela_past_amber", "non-partner rendered the scene");
assert.notEqual(out.replyWithoutAnswer.scene, "sela_past_amber_reply", "reply rendered without an answer");
assert.equal(out.price.vow.scene, "prom_price", "prom_price did not render");
assert.ok(out.price.vow.text.includes("The vow is in the log") && out.price.privateVow.text.includes("Not as mine") && !out.price.unpursued.text.includes("vow") && !out.price.other.text.includes("The vow is in the log"), "prom_price vow lines gated wrong");
assert.deepEqual(out.price.vow.choices, out.price.other.choices, "prom_price choices changed");
assert.ok(out.key.partner.text.includes("not a political instrument") && !out.key.other.text.includes("not a political instrument"), "custody_shared key line gated wrong");
assert.deepEqual(out.key.partner.choices, out.key.other.choices, "custody_shared choices changed");
assert.ok(out.footer.meaning.text.includes("whole of it") && out.footer.sentence.text.includes("stand near it") && out.footer.silence.text.includes("correct amount"), "footer: answer not cited");
assert.ok(!out.footer.none.text.includes("stayed past amber"), "footer: cited without a run fact");
assert.equal(out.yellow.amber.title, "The Yellow Circle", "yellow fixture did not reach the Yellow Circle");
assert.ok(out.yellow.amber.text.includes("stayed past amber") && !out.yellow.none.text.includes("stayed past amber"), "Yellow Circle text does not cite the run fact correctly");
console.log("PASS sun-playerflow-sela-amber: partner-only Stay past amber.; three answers, one flag, no resources; entries follow run facts and skip untested promises; dead and unpartnered never render; vow and key lines gated; footer and Yellow Circle cite the answer");
