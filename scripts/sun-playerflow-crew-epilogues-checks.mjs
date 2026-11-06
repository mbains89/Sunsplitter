// SUN-CREW-EPILOGUES-01 (ROADMAP §14A Wave 1, workstream 4) — one paragraph per crew member in What
// Remains, under the 3–6 reflection lines, in its own element. Every crew member gets exactly one
// paragraph in crew order; "X died" appears for X if and only if X is dead; unrecovered crew were
// never aboard; the dead get no present-tense credit; untested promises are never mentioned (L-024);
// the reflection lines and their element are unchanged; the block is pure.
import assert from "node:assert/strict";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadGame } from "./simulate.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const runtime = loadGame(ROOT);
const ORDER = ["rourke", "lena", "elias", "mira", "tomas", "amara", "jiro", "sela", "vess"];
const FIRST = { rourke: "Rourke", lena: "Lena", elias: "Elias", mira: "Mira", tomas: "Tomas", amara: "Amara", jiro: "Jiro", sela: "Sela", vess: "Vess" };
const DEATHS = [
  ["lena", "resources diverted to the vault"], ["lena", "kept working until the clock ran out"],
  ["elias", "held the line"], ["mira", "would not leave the board"], ["mira", "finished the repair"], ["mira", "lost the shared medical line to Lena"],
  ["tomas", "refused the order and paid for it"], ["tomas", "went back for the living and did not return"],
  ["amara", "vented with the lower ring"], ["jiro", "vented with the lower ring"], ["jiro", "vented breathing in the service pocket"],
  ["sela", "vented at twenty"], ["vess", "lost the shared medical line to Lena"], ["vess", "vented breathing in the service pocket"]
];
const diedRe = (first) => new RegExp(`\\b${first} (?:died\\b|went back for the living and did not return|finished the repair and died)`);
const creditRe = /\b(?:he|she) (?:still|keeps|counts|tends|tastes|eats|covers|is|argues|flies|wins|logs|speaks|waits|watches|looks|says)\b/;

const out = JSON.parse(runtime.evaluate(`JSON.stringify((() => {
  persistSave = () => true;
  const fresh = () => { resetRunState(); state.recovered.tomas = state.recovered.jiro = state.recovered.vess = true; kill("rourke", "died with company"); };
  const row = {};
  // All alive, nothing else: nine paragraphs in order.
  fresh(); row.alive = crewEpilogues();
  // Every authored death, one at a time.
  row.deaths = ${JSON.stringify(DEATHS)}.map(([who, cause]) => { fresh(); kill(who, cause); return { who, cause, paragraphs: crewEpilogues() }; });
  // Unrecovered trio.
  resetRunState(); kill("rourke", "died in silence while orders waited"); row.unrecovered = crewEpilogues();
  // L-024: untested promises never mentioned; tested ones are.
  fresh(); for (const k of ["lena", "elias", "mira", "tomas", "amara", "sela"]) state.promises[k] = "made"; row.untested = crewEpilogues();
  fresh(); state.promises.lena = "declined"; state.promises.sela = "declined"; row.declined = crewEpilogues();
  fresh(); state.promises.lena = "kept"; state.promises.amara = "broken"; state.promises.elias = "broken"; state.flags.prom_deck4_edited = true; state.promises.mira = "kept"; state.promises.sela = "broken"; state.promises.tomas = "kept"; state.crisisPath = "custody"; row.tested = crewEpilogues();
  // A dense living run and the same run with the partner dead.
  const dense = () => { fresh(); state.flags.rourke = "stopped"; state.flags.ship_memory = "proper_seal"; state.flags.vault_sacrifice = "future"; state.flags.changeorders = "logged"; mark("mira","drive_first"); mark("elias","approved_vent"); state.romance.lena = true; mark("lena","dying_held"); state.flags.trays_dead = true; state.flags.tomas = "living"; mark("tomas","held"); state.flags.stores = "seize"; state.flags.hydro = "full"; mark("amara","plants_matter"); state.flags.burn_unverified = true; mark("jiro","bonded"); mark("sela","spoken"); state.flags.sela_vault_vow = "accepted"; state.flags.pursuit_sela_cost = "vow"; state.flags.custody_answer = "shared"; state.flags.busDowngraded = true; state.flags.last_tx_spent = true; state.flags.vess_intimate = true; state.romance.vess = true; state.flags.junctionChoice = "vess"; state.flags.pair_fix = "both"; state.flags.pair_burn = "finding"; state.flags.pair_triage = "count"; state.flags.pair_seal = "names"; state.flags.pair_grudge = true; state.flags.pair_favor = true; };
  dense(); row.dense = crewEpilogues();
  dense(); kill("jiro", "vented with the lower ring"); kill("amara", "vented with the lower ring"); row.denseDead = crewEpilogues();
  // Purity and rendering.
  dense(); const before = JSON.stringify(state); const a = crewEpilogues(), b = crewEpilogues();
  row.pure = JSON.stringify(a) === JSON.stringify(b) && JSON.stringify(state) === before;
  resolveEnding(); if (typeof finishCinematic === "function" && currentCinematic) finishCinematic(); showWhatRemains();
  row.render = { text: document.getElementById("what-remains-text").textContent, facts: whatRemainsFacts().join("\\n\\n"), crew: document.getElementById("what-remains-crew").textContent, joined: crewEpilogues().join("\\n\\n"), headingHidden: document.getElementById("what-remains-crew-heading").classList.contains("hidden"), screen: document.getElementById("what-remains-screen").classList.contains("hidden") };
  return row;
})())`, 180_000));

const expectOrder = (paragraphs, label) => {
  assert.equal(paragraphs.length, ORDER.length, `${label}: expected ${ORDER.length} paragraphs, got ${paragraphs.length}`);
  ORDER.forEach((k, i) => assert.ok(paragraphs[i].startsWith(FIRST[k]), `${label}: paragraph ${i} should start with ${FIRST[k]}: ${paragraphs[i].slice(0, 40)}`));
};
expectOrder(out.alive, "alive");
for (const k of ORDER) {
  const hit = diedRe(FIRST[k]).test(out.alive.join("\n"));
  assert.equal(hit, k === "rourke", `alive: "${FIRST[k]} died" ${hit ? "present for a living" : "missing for a dead"} crew member`);
}
for (const d of out.deaths) {
  expectOrder(d.paragraphs, `${d.who}/${d.cause}`);
  const joined = d.paragraphs.join("\n");
  for (const k of ORDER) assert.equal(diedRe(FIRST[k]).test(joined), k === d.who || k === "rourke", `${d.who}/${d.cause}: death sentence wrong for ${FIRST[k]}`);
  const para = d.paragraphs[ORDER.indexOf(d.who)];
  assert.ok(!creditRe.test(para), `${d.who}/${d.cause}: present-tense credit for the dead: ${para}`);
}
expectOrder(out.unrecovered, "unrecovered");
for (const k of ["tomas", "jiro", "vess"]) {
  const para = out.unrecovered[ORDER.indexOf(k)];
  assert.ok((para.includes("never brought aboard") || para.includes("never cut out of the blister")) && !diedRe(FIRST[k]).test(para) && para.split(" ").length < 9, `unrecovered ${k}: ${para}`);
}
const promiseNear = (paragraphs, first) => new RegExp(`(?:promise.{0,80}${first}|${first}.{0,80}promise|tested|test\\b)`, "i").test(paragraphs[ORDER.indexOf(first.toLowerCase())]);
for (const k of ["lena", "elias", "mira", "tomas", "amara", "sela"]) {
  assert.ok(!promiseNear(out.untested, FIRST[k]), `untested promise read aloud for ${k} (L-024)`);
}
assert.ok(!promiseNear(out.declined, "Lena") && !promiseNear(out.declined, "Sela"), "declined promise read aloud (L-024)");
assert.ok(out.tested[1].includes("was tested, it stayed with the other patient") && out.tested[2].includes("edited Deck Four record") && out.tested[3].includes("directives was refused") && out.tested[4].includes("custody test the living got") && out.tested[5].includes("pocket was vented with the reader still breathing") && out.tested[7].includes("petition named her, you gave the room"), "tested promises not cited");
expectOrder(out.dense, "dense");
const dense = out.dense.join("\n");
for (const needle of ["treatment stopped, by order", "you were the one who stayed", "Rourke went into his count by name", "went into a proper patch", "He approved the vent", "justification field blank", "the ship first", "fault report, root cause under it", "eats the paste in company", "the living come first, and he held", "living things matter", "who you keep close", "error bars", "argues with and wins", "took it as gospel", "spoke once, at yellow", "neither of you secures the other a place", "second physical key", "relay core online", "one directed burst", "power stayed hers", "last private hour of the run was hers", "felt the air change in the habitation ring"]) {
  assert.ok(dense.includes(needle), `dense: missing "${needle}"`);
}
for (const [needle, owner] of [["Rourke went into his count", "tomas"], ["fault report", "mira"], ["took it as gospel", "vess"], ["who you keep close", "amara"]]) {
  assert.equal(out.dense.filter(p => p.includes(needle)).length, 1, `dense: "${needle}" should appear in exactly one paragraph`);
  assert.ok(out.dense[ORDER.indexOf(owner)].includes(needle), `dense: "${needle}" should sit in ${owner}'s paragraph`);
}
for (const [i, p] of out.dense.entries()) assert.ok(p.split(/(?<=[.!?])\s+(?=[A-Z])/).length <= 6, `dense: ${ORDER[i]} runs past six sentences: ${p}`);
assert.ok(out.denseDead[ORDER.indexOf("jiro")].includes("argued with and won") && !creditRe.test(out.denseDead[ORDER.indexOf("jiro")]) && !creditRe.test(out.denseDead[ORDER.indexOf("amara")]), "dense dead: present-tense credit survived");
assert.ok(out.pure, "crewEpilogues wrote state or differed on a second call");
assert.equal(out.render.text, out.render.facts, "the reflection element no longer equals whatRemainsFacts()");
assert.equal(out.render.crew, out.render.joined, "the crew element does not carry the epilogues");
assert.ok(!out.render.headingHidden && !out.render.screen, "the crew heading or the screen is hidden");
console.log(`PASS sun-playerflow-crew-epilogues: ${ORDER.length} paragraphs in crew order; death sentences exact for ${DEATHS.length} authored causes; unrecovered never aboard; no present-tense credit for the dead; untested promises silent; rendered in its own element under the unchanged reflection lines`);
