// SUN-CREW-FRICTION-01 (ROADMAP §14A Wave 1, workstream 3) — four one-shot pair scenes where crew
// disagree with each other. Each is offered only while both speakers are alive (and the run fact it
// argues about exists), renders its branch from run facts, writes one flag and an affinity nudge
// per answer, moves no resource, shows the reply, exits to its host, and is never offered again.
// Dead or unrecovered crew never render the pair. The hub and act2_spine_next keep their other exits.
import assert from "node:assert/strict";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadGame } from "./simulate.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const runtime = loadGame(ROOT);
const PAIRS = [
  { id: "triage", scene: "pair_triage_chart", reply: "pair_triage_after", flag: "pair_triage", cast: ["lena", "tomas"], host: "act2_spine_next", exit: "act3_reckoning_pattern",
    offer: "Stop at the medbay hatch.", answers: ["chart", "count", "open"], needle: "The count is open.", fact: "" },
  { id: "seal", scene: "pair_seal_ledger", reply: "pair_seal_after", flag: "pair_seal", cast: ["elias", "tomas"], host: "act3_spine_next", exit: "act3_spine_next",
    offer: "Elias and Tomas are at the Deck 4 dog.", answers: ["bulkhead", "names", "both"], needle: "The slate is full.", fact: "state.flags.ship_memory = 'proper_seal'; state.flags.feedstock = 'seal';" },
  { id: "burn", scene: "pair_burn_archive", reply: "pair_burn_after", flag: "pair_burn", cast: ["mira", "jiro"], host: "act3_spine_next", exit: "act3_spine_next",
    offer: "Jiro has asked Mira for the burn record.", answers: ["finding", "width", "both"], needle: "which log it goes in", fact: "state.flags.margin_committed = true; state.flags.burn_unverified = true;" },
  { id: "fix", scene: "pair_fix_track", reply: "pair_fix_after", flag: "pair_fix", cast: ["jiro", "vess"], host: "act3_spine_next", exit: "act3_spine_next",
    offer: "Two columns on the tracker board.", answers: ["fix", "track", "both"], needle: "Which one does the ship fly?", fact: "state.flags.position_certain = true;" }
];

const out = JSON.parse(runtime.evaluate(`JSON.stringify((() => {
  persistSave = () => true;
  const resources = () => [state.survivors, state.integrity, state.cohesion, state.supplies, state.embryos].join("/");
  const fresh = () => { resetRunState(); state.recovered.tomas = state.recovered.jiro = state.recovered.vess = true; state.crisisPath = "breath"; state.flags.junctionChoice = "none"; state.supplies = 60; state.integrity = 60; state.cohesion = 50; };
  const story = () => document.getElementById("story").innerHTML;
  const choicesOf = (scene) => { const sc = scenes[scene]; const c = typeof sc.choices === "function" ? sc.choices.call(sc) : sc.choices; return (c || []).map(x => x.text + ">" + x.next); };
  const rows = {};
  for (const p of ${JSON.stringify(PAIRS)}) {
    const row = {};
    // Offer: present with both alive and the fact set; absent without the fact, with either dead, or once answered.
    fresh(); new Function(p.fact)(); showScene(p.host);
    row.offered = choicesOf(p.host).some(c => c.startsWith(p.offer) && c.endsWith(">" + p.scene));
    row.hostExits = choicesOf(p.host).filter(c => !c.startsWith(p.offer));
    fresh(); showScene(p.host); row.offeredWithoutFact = choicesOf(p.host).some(c => c.startsWith(p.offer));
    row.baseExits = choicesOf(p.host);
    row.offeredDead = {};
    for (const who of p.cast) { fresh(); new Function(p.fact)(); if (who === "tomas" || who === "jiro" || who === "vess") state.recovered[who] = false; else kill(who, "friction fixture"); showScene(p.host); row.offeredDead[who] = choicesOf(p.host).some(c => c.startsWith(p.offer)); }
    fresh(); new Function(p.fact)(); state.flags[p.flag] = p.answers[0]; showScene(p.host); row.offeredAfter = choicesOf(p.host).some(c => c.startsWith(p.offer));
    // Each answer: entry clean, one flag, no resources, reply renders, exit reaches the host.
    row.answers = {};
    for (const [i, answer] of p.answers.entries()) {
      fresh(); new Function(p.fact)(); showScene(p.scene);
      const before = resources(), text = story();
      const r = { scene: state.scene, entryClean: resources() === before && !state.flags[p.flag], text: text.includes(p.needle), pure: text === story() };
      makeChoice(scenes[p.scene].choices[i]);
      r.flag = state.flags[p.flag]; r.reply = state.scene; r.replyLen = story().length; r.resourcesUnchanged = resources() === before;
      makeChoice(scenes[p.reply].choices[0]);
      r.after = state.scene;
      row.answers[answer] = r;
    }
    // Never rendered: each speaker dead or unrecovered; reply without an answer.
    row.dead = {};
    for (const who of p.cast) {
      fresh(); new Function(p.fact)(); if (who === "tomas" || who === "jiro" || who === "vess") state.recovered[who] = false; else kill(who, "friction fixture");
      showScene(p.scene); row.dead[who] = { scene: state.scene, text: story().includes(p.needle), flag: !!state.flags[p.flag] };
    }
    fresh(); new Function(p.fact)(); showScene(p.reply); row.replyWithoutAnswer = state.scene;
    rows[p.id] = row;
  }
  // Branch text follows run facts.
  const branch = (scene, setup) => { fresh(); new Function(setup)(); showScene(scene); return story(); };
  rows.text = {
    rourkeStopped: branch("pair_triage_chart", "state.flags.rourke = 'stopped';"),
    rourkeTried: branch("pair_triage_chart", "state.flags.rourke = 'tried';"),
    rourkeStayed: branch("pair_triage_chart", "state.flags.rourke = 'stayed';"),
    rourkeNone: branch("pair_triage_chart", ""),
    sealProper: branch("pair_seal_ledger", "state.flags.ship_memory = 'proper_seal';"),
    sealWound: branch("pair_seal_ledger", "state.flags.ship_memory = 'open_wound';"),
    sealThin: branch("pair_seal_ledger", "state.flags.ship_memory = 'jury_rig';"),
    sealDeferred: branch("pair_seal_ledger", "state.flags.ship_memory = 'proper_seal'; state.flags.ship_interrupt = 'deferred';"),
    burnStale: branch("pair_burn_archive", "state.flags.margin_committed = true; state.flags.burn_unverified = true;"),
    burnVerified: branch("pair_burn_archive", "state.flags.margin_committed = true;"),
    burnDelay: branch("pair_burn_archive", "state.flags.margin_committed = true; state.flags.margin_spent_extra = true;")
  };
  // Scapegoated Tomas is not offered the seal argument (same rule as the trunk grudge).
  fresh(); state.flags.ship_memory = "proper_seal"; state.flags.tomas_scapegoated = true; showScene("act3_spine_next");
  rows.sealScapegoated = choicesOf("act3_spine_next").some(c => c.endsWith(">pair_seal_ledger"));
  return rows;
})())`, 180_000));

for (const p of PAIRS) {
  const row = out[p.id];
  assert.ok(row.offered, `${p.id}: not offered on ${p.host} with both alive`);
  assert.ok(!row.offeredWithoutFact || p.fact === "", `${p.id}: offered without its run fact`);
  assert.deepEqual(row.hostExits, row.baseExits.filter(c => !c.startsWith(p.offer)), `${p.id}: ${p.host} lost or changed an existing exit`);
  for (const who of p.cast) assert.ok(!row.offeredDead[who], `${p.id}: offered with ${who} dead or unrecovered`);
  assert.ok(!row.offeredAfter, `${p.id}: offered again after an answer`);
  for (const answer of p.answers) {
    const r = row.answers[answer];
    assert.equal(r.scene, p.scene, `${p.id}/${answer}: the pair did not render`);
    assert.ok(r.entryClean, `${p.id}/${answer}: entry wrote the flag or a resource`);
    assert.ok(r.text && r.pure, `${p.id}/${answer}: text missing or impure`);
    assert.equal(r.flag, answer, `${p.id}/${answer}: flag not written`);
    assert.equal(r.reply, p.reply, `${p.id}/${answer}: did not reach the reply`);
    assert.ok(r.replyLen > 120, `${p.id}/${answer}: reply text missing`);
    assert.ok(r.resourcesUnchanged, `${p.id}/${answer}: a resource changed`);
    assert.equal(r.after, p.exit, `${p.id}/${answer}: exit did not reach ${p.exit}`);
  }
  for (const who of p.cast) {
    assert.notEqual(row.dead[who].scene, p.scene, `${p.id}: rendered with ${who} dead or unrecovered`);
    assert.ok(!row.dead[who].text, `${p.id}: text rendered with ${who} dead or unrecovered`);
    assert.ok(!row.dead[who].flag, `${p.id}: flag written with ${who} dead or unrecovered`);
  }
  assert.notEqual(row.replyWithoutAnswer, p.reply, `${p.id}: reply rendered without an answer`);
}
const t = out.text;
assert.ok(t.rourkeStopped.includes("Treatment stopped. By order.") && t.rourkeStopped.includes("The order moved the time of death"), "triage: stopped branch missing");
assert.ok(t.rourkeTried.includes("Forty-three minutes") && t.rourkeTried.includes("minute one"), "triage: tried branch missing");
assert.ok(t.rourkeStayed.includes("Died with company") && t.rourkeStayed.includes("I don't chart the room"), "triage: stayed branch missing");
assert.ok(t.rourkeNone.includes("deciding who was in charge") && !t.rourkeNone.includes("By order"), "triage: no-order branch wrong");
assert.ok(t.sealProper.includes("went into that patch") && t.sealProper.includes("The seal holds. That's the account."), "seal: proper branch missing");
assert.ok(t.sealWound.includes("Eaten.") && t.sealWound.includes("I don't hold it twice"), "seal: open-wound branch missing");
assert.ok(t.sealThin.includes("paid in halves") && t.sealThin.includes("Somebody eats the halves"), "seal: jury-rig branch missing");
assert.ok(t.sealDeferred.includes("Somebody answered late") && !t.sealProper.includes("Somebody answered late"), "seal: deferred interrupt line gated wrong");
assert.ok(t.burnStale.includes("The solution is archived") && t.burnStale.includes("I log where"), "burn: stale branch missing");
assert.ok(t.burnVerified.includes("Six is a width") && !t.burnVerified.includes("archived"), "burn: verified branch wrong");
assert.ok(t.burnDelay.includes("Eight corrections by hand") && t.burnDelay.includes("Two line items"), "burn: delay branch missing");
assert.ok(!out.sealScapegoated, "seal: offered to a scapegoated Tomas");
console.log("PASS sun-playerflow-crew-friction: four pair scenes offered only with both alive and the run fact; three answers each, one flag, no resources; replies render; hosts keep their exits; dead or unrecovered never render; branches follow run facts");
