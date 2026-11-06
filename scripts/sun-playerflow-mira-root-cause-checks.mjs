// SUN-ROMANCE-ARC-02 (L-050, Wave 1) — Mira's arc runs to a named end state.
// After the Commander overrides local at the cross-feed board (reserve or collar), a partner is
// asked for the root cause; the answer is one flag ("drive" | "you" | "both"), no resources; a
// non-partner goes straight to faction_split; a dead Mira never renders the pair; offshift_mira
// and the ending footer cite the answer from run facts.
import assert from "node:assert/strict";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadGame } from "./simulate.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const runtime = loadGame(ROOT);
const out = JSON.parse(runtime.evaluate(`JSON.stringify((() => {
  persistSave = () => true;
  const resources = () => [state.survivors, state.integrity, state.cohesion, state.supplies, state.embryos].join("/");
  // crisis and junction resolved so faction_split renders itself after the pair; offshift fixtures reset the junction.
  const fresh = () => { resetRunState(); state.recovered.tomas = state.recovered.jiro = state.recovered.vess = true; state.crisisPath = "custody"; state.flags.custody_answer = "severed"; state.flags.junctionChoice = "none"; state.supplies = 60; state.integrity = 60; };
  const story = () => document.getElementById("story").innerHTML;
  const row = {};
  // Board exits route a partner to the question and everyone else to faction_split.
  for (const [name, setup] of [["partner", () => { state.romance.mira = true; }], ["other", () => {}]]) {
    row[name] = {};
    for (const branch of ["reserve", "collar"]) {
      fresh(); setup();
      showScene("act3_lethal_mira_" + branch);
      const exit = scenes["act3_lethal_mira_" + branch].choices[0];
      row[name][branch] = { next: exit.next };
    }
  }
  // Each answer writes one flag, no resources, and reaches the logged scene then faction_split.
  row.answers = {};
  for (const [label, answer] of [["The drive.", "drive"], ["You.", "you"], ["Both.", "both"]]) {
    fresh(); state.romance.mira = true; state.pursuit.mira = true; state.flags.pursuit_mira_cost = "disclosed";
    showScene("mira_root_cause");
    const before = resources();
    const r = { scene: state.scene, text: story(), entryClean: resources() === before && !state.flags.mira_root_cause };
    const choice = scenes.mira_root_cause.choices.find(c => c.text.startsWith(label));
    makeChoice(choice);
    r.flag = state.flags.mira_root_cause; r.logged = state.scene; r.loggedText = story();
    r.resourcesUnchanged = resources() === before;
    makeChoice(scenes.mira_root_cause_logged.choices[0]);
    r.after = state.scene;
    row.answers[answer] = r;
  }
  // Text branches follow run facts: pursuit and the disclosure cost.
  const ask = (pursuit, cost) => { fresh(); state.romance.mira = true; if (pursuit) state.pursuit.mira = true; if (cost) state.flags.pursuit_mira_cost = cost; showScene("mira_root_cause"); return story(); };
  row.text = { key: ask(true, "disclosed"), margin: ask(false, null), partial: ask(true, "partial"), none: ask(false, null) };
  // Dead Mira and non-partners never render the pair.
  fresh(); state.romance.mira = true; kill("mira", "fixture"); showScene("mira_root_cause");
  row.dead = { scene: state.scene, text: story() };
  fresh(); showScene("mira_root_cause"); row.notPartner = { scene: state.scene };
  fresh(); state.romance.mira = true; showScene("mira_root_cause_logged"); row.loggedWithoutAnswer = { scene: state.scene };
  // offshift_mira cites the open fault only for the "you" and "both" answers; its choices are unchanged.
  const offshift = (answer) => { fresh(); state.romance.mira = true; if (answer) state.flags.mira_root_cause = answer; showScene("offshift_mira"); return { text: story(), choices: scenes.offshift_mira.choices.map(c => c.text + ">" + c.next) }; };
  row.offshift = { you: offshift("you"), both: offshift("both"), drive: offshift("drive"), none: offshift(null) };
  // Ending footer.
  const footer = (setup) => { fresh(); state.romance.mira = true; setup(); state.integrity = 70; state.cohesion = 50; state.supplies = 50; resolveEnding(); if (typeof finishCinematic === "function" && currentCinematic) finishCinematic(); return document.getElementById("ending-text").textContent; };
  row.footer = {
    drive: footer(() => { state.flags.mira_root_cause = "drive"; }),
    you: footer(() => { state.flags.mira_root_cause = "you"; }),
    both: footer(() => { state.flags.mira_root_cause = "both"; }),
    youDead: footer(() => { state.flags.mira_root_cause = "you"; kill("mira", "fixture"); }),
    none: footer(() => {})
  };
  return row;
})())`, 120_000));

for (const branch of ["reserve", "collar"]) {
  assert.equal(out.partner[branch].next, "mira_root_cause", `${branch}: partner not routed to the question`);
  assert.equal(out.other[branch].next, "faction_split", `${branch}: non-partner routed off the spine`);
}
for (const answer of ["drive", "you", "both"]) {
  const r = out.answers[answer];
  assert.equal(r.scene, "mira_root_cause", `${answer}: question did not render`);
  assert.ok(r.entryClean, `${answer}: entry wrote a flag or a resource`);
  assert.ok(r.text.includes("Say it anyway"), `${answer}: question text missing`);
  assert.equal(r.flag, answer, `${answer}: flag not written`);
  assert.equal(r.logged, "mira_root_cause_logged", `${answer}: did not reach her answer`);
  assert.ok(r.resourcesUnchanged, `${answer}: a resource changed`);
  assert.equal(r.after, "faction_split", `${answer}: exit did not reach faction_split`);
}
assert.ok(out.answers.drive.loggedText.includes("sixty percent"), "drive: sixty-percent line missing");
assert.ok(out.answers.you.loggedText.includes("Mira. Error."), "you: fault log missing");
assert.ok(out.answers.both.loggedText.includes("Variance unresolved"), "both: variance line missing");
assert.ok(out.text.key.includes("handed you my key") && out.text.key.includes("first night's audio"), "text: pursuit/disclosed branch missing");
assert.ok(out.text.margin.includes("ship's margin") && !out.text.margin.includes("handed you my key"), "text: no-pursuit branch wrong");
assert.ok(out.text.partial.includes("half a record"), "text: partial branch missing");
assert.ok(out.text.none.includes("from outside the bay"), "text: no-cost branch missing");
assert.notEqual(out.dead.scene, "mira_root_cause", "dead Mira rendered the question");
assert.ok(!out.dead.text.includes("Say it anyway"), "dead Mira's question text rendered");
assert.notEqual(out.notPartner.scene, "mira_root_cause", "non-partner rendered the question");
assert.notEqual(out.loggedWithoutAnswer.scene, "mira_root_cause_logged", "logged scene rendered without an answer");
assert.ok(out.offshift.you.text.includes("fault I filed"), "offshift: open fault not cited");
assert.ok(out.offshift.both.text.includes("variance from the phase board"), "offshift: variance not cited");
assert.ok(out.offshift.drive.text.includes("had a root cause"), "offshift: drive callback missing");
assert.ok(!out.offshift.none.text.includes("phase board"), "offshift: callback leaked without an answer");
assert.deepEqual(out.offshift.you.choices, out.offshift.none.choices, "offshift: choices changed");
assert.ok(out.footer.drive.includes("said the drive") && out.footer.you.includes("filed a fault") && out.footer.both.includes("under the variance"), "footer: answer not cited");
assert.ok(out.footer.youDead.includes("filed a fault") && out.footer.youDead.includes("outlived her"), "footer: dead variant missing");
assert.ok(out.footer.drive.includes("out of the sealed bay"), "footer: inverted the choice");
assert.ok(!out.footer.none.includes("out of the sealed bay"), "footer: cited without a run fact");
console.log("PASS sun-playerflow-mira-root-cause: partner routed from reserve and collar, others not; three answers, one flag, no resources; dead and unpartnered never render; offshift and footer cite the answer");
