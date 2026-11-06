// SUN-ROMANCE-ARC-04 (L-050, Wave 1) — Amara's arc runs to a named end state.
// offshift_amara offers "Stay past the light." to a solo partner only; amara_page reads the run's
// entries and writes one flag ("open" | "closed" | "hers"), no resources; her reply follows; dead
// and unpartnered Amara never render the pair; prom_vent and breath_garden carry the private debt
// as text only; the ending footer cites the answer. The Amara route gates are untouched.
import assert from "node:assert/strict";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadGame } from "./simulate.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const runtime = loadGame(ROOT);
const out = JSON.parse(runtime.evaluate(`JSON.stringify((() => {
  persistSave = () => true;
  const resources = () => [state.survivors, state.integrity, state.cohesion, state.supplies, state.embryos].join("/");
  // an attributable death makes Amara eligible for the off-shift hour; crisis and junction resolved.
  const fresh = () => { resetRunState(); state.recovered.tomas = state.recovered.jiro = state.recovered.vess = true; state.crisisPath = "breath"; state.flags.junctionChoice = "none"; kill("lena", "resources diverted to the vault"); state.affinity.amara = 30; };
  const story = () => document.getElementById("story").innerHTML;
  const row = {};
  for (const [name, setup] of [["partner", () => { state.romance.amara = true; }], ["shared", () => { state.romance.amara_tomas = true; }], ["other", () => {}]]) {
    fresh(); setup(); showScene("offshift_amara");
    row[name] = { exits: scenes.offshift_amara.choices.map(c => c.text + ">" + c.next) };
  }
  row.answers = {};
  for (const [label, answer] of [["Leave it open.", "open"], ["Ask her to close it.", "closed"], ["Ask to see her own page.", "hers"]]) {
    fresh(); state.romance.amara = true; state.flags.pursuit_amara_cost = "vent_delay"; state.flags.amara_vent_delayed = true; state.flags.hydro = "full"; state.flags.breath_answer = "garden"; state.promises.amara = "kept";
    showScene("amara_page");
    const before = resources();
    const r = { scene: state.scene, text: story(), entryClean: resources() === before && !state.flags.amara_page };
    makeChoice(scenes.amara_page.choices.find(c => c.text === label));
    r.flag = state.flags.amara_page; r.reply = state.scene; r.replyText = story(); r.resourcesUnchanged = resources() === before;
    makeChoice(scenes.amara_page_reply.choices[0]);
    r.after = state.scene;
    row.answers[answer] = r;
  }
  // Entries follow run facts.
  const page = (setup) => { fresh(); state.romance.amara = true; setup(); showScene("amara_page"); return story(); };
  row.page = {
    full: page(() => { state.flags.pursuit_amara_cost = "vent_delay"; state.flags.hydro = "full"; state.flags.breath_answer = "garden"; state.promises.amara = "kept"; }),
    half: page(() => { state.flags.pursuit_amara_cost = "half"; state.promises.amara = "broken"; }),
    blank: page(() => { state.promises.amara = "made"; }),
    declined: page(() => { state.promises.amara = "declined"; })
  };
  // Never rendered: dead, not a partner, shared-bay only, reply without an answer.
  fresh(); state.romance.amara = true; kill("amara", "fixture"); showScene("amara_page");
  row.dead = { scene: state.scene, text: story(), flag: !!state.flags.amara_page };
  fresh(); showScene("amara_page"); row.notPartner = { scene: state.scene };
  fresh(); state.romance.amara_tomas = true; showScene("amara_page"); row.sharedOnly = { scene: state.scene };
  fresh(); state.romance.amara = true; showScene("amara_page_reply"); row.replyWithoutAnswer = { scene: state.scene };
  // Debt lines inside the hard decisions, text only.
  const vent = (partner, delayed) => { fresh(); state.promises.amara = "made"; if (partner) state.romance.amara = true; if (delayed) state.flags.amara_vent_delayed = true; showScene("prom_vent"); return { scene: state.scene, text: story(), choices: scenes.prom_vent.choices.map(c => c.text + ">" + c.next) }; };
  row.vent = { debt: vent(true, true), partnerOnly: vent(true, false), other: vent(false, false) };
  const garden = (partner, delayed) => { fresh(); if (partner) state.romance.amara = true; if (delayed) state.flags.amara_vent_delayed = true; showScene("breath_garden"); return story(); };
  row.garden = { debt: garden(true, true), partnerOnly: garden(true, false), other: garden(false, false) };
  // Ending footer.
  const footer = (setup) => { fresh(); state.romance.amara = true; setup(); state.integrity = 70; state.cohesion = 50; state.supplies = 50; resolveEnding(); if (typeof finishCinematic === "function" && currentCinematic) finishCinematic(); return document.getElementById("ending-text").textContent; };
  row.footer = { open: footer(() => { state.flags.amara_page = "open"; }), closed: footer(() => { state.flags.amara_page = "closed"; }), hers: footer(() => { state.flags.amara_page = "hers"; }), none: footer(() => {}) };
  return row;
})())`, 120_000));

const base = ["Ask her to say it wasn't yours.>faction_split", "Ask what you owe.>faction_split", "Say nothing and drink.>faction_split"];
assert.deepEqual(out.other.exits, base, "offshift_amara: existing exits changed");
assert.deepEqual(out.shared.exits, base, "offshift_amara: shared-bay-only run was offered the page (L-041)");
assert.deepEqual(out.partner.exits, [...base, "Stay past the light.>amara_page"], "offshift_amara: partner choice missing or misrouted");
for (const answer of ["open", "closed", "hers"]) {
  const r = out.answers[answer];
  assert.equal(r.scene, "amara_page", `${answer}: the page did not render`);
  assert.ok(r.entryClean, `${answer}: entry wrote a flag or a resource`);
  assert.ok(r.text.includes("Do I leave it open?"), `${answer}: page text missing`);
  assert.equal(r.flag, answer, `${answer}: flag not written`);
  assert.equal(r.reply, "amara_page_reply", `${answer}: did not reach her reply`);
  assert.ok(r.resourcesUnchanged, `${answer}: a resource changed`);
  assert.ok(r.replyText.includes("the whole invitation"), `${answer}: reply text missing`);
  assert.equal(r.after, "faction_split", `${answer}: exit did not reach faction_split`);
}
assert.ok(out.answers.open.replyText.includes("Interest runs") && out.answers.closed.replyText.includes("stopped counting") && out.answers.hers.replyText.includes("Lagos"), "reply text does not follow the answer");
assert.ok(out.page.full.includes("One cycle of a contaminated vent") && out.page.full.includes("Margin given to the green") && out.page.full.includes("spent on breathing") && out.page.full.includes("Kept."), "page: full run entries missing");
assert.ok(out.page.half.includes("Half a cycle") && out.page.half.includes("Broken.") && !out.page.half.includes("Margin given"), "page: half/broken entries wrong");
assert.ok(out.page.blank.includes("Blank's honest") && !out.page.blank.includes("Kept.") && !out.page.blank.includes("Broken."), "page: untested promise was read aloud (L-024)");
assert.ok(!out.page.declined.includes("Kept.") && !out.page.declined.includes("Broken."), "page: declined promise was read as tested");
assert.notEqual(out.dead.scene, "amara_page", "dead Amara rendered the page");
assert.ok(!out.dead.text.includes("Do I leave it open?"), "dead Amara's page text rendered");
assert.equal(out.dead.flag, false, "dead Amara wrote the flag");
assert.notEqual(out.notPartner.scene, "amara_page", "non-partner rendered the page");
assert.notEqual(out.sharedOnly.scene, "amara_page", "shared-bay-only run rendered the page");
assert.notEqual(out.replyWithoutAnswer.scene, "amara_page_reply", "reply rendered without an answer");
assert.equal(out.vent.debt.scene, "prom_vent", "prom_vent did not render");
assert.ok(out.vent.debt.text.includes("Don't mix the books") && !out.vent.partnerOnly.text.includes("Don't mix the books") && !out.vent.other.text.includes("Don't mix the books"), "prom_vent debt line gated wrong");
assert.deepEqual(out.vent.debt.choices, out.vent.other.choices, "prom_vent choices changed");
assert.ok(out.garden.debt.includes("roots paying it back") && out.garden.partnerOnly.includes("Stand there breathing") && !out.garden.other.includes("love"), "breath_garden partner lines gated wrong");
assert.ok(out.footer.open.includes("left it open") && out.footer.closed.includes("Closed, not forgiven") && out.footer.hers.includes("showed you hers"), "footer: answer not cited");
assert.ok(!out.footer.none.includes("her ledger"), "footer: cited without a run fact");
console.log("PASS sun-playerflow-amara-page: partner-only Stay past the light.; three answers, one flag, no resources; entries follow run facts and skip untested promises; dead, unpartnered and shared-bay-only never render; debt lines and footer gated on run facts");
