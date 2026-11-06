// SUN-CALLBACKS-01 (ROADMAP §14A Wave 1, workstream 2) — thirteen diegetic callbacks, text only.
// Each one renders only when its run fact is set and its speaker is alive, renders identically
// twice without writing state, and leaves the host scene's choices unchanged.
import assert from "node:assert/strict";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadGame } from "./simulate.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const runtime = loadGame(ROOT);
// [name, scene, speaker, needle, setup that makes the fact true]
const CASES = [
  ["tether vent / Elias / vented ring", "act2_tether_vent", "elias", "The last thing this ship vented had people in it", "state.flags.crisis = 'vent';"],
  ["nightshift / Jiro / final position", "observation_nightshift", "jiro", "final position logged", "kill('lena', 'resources diverted to the vault');"],
  ["briefing / Lena / Rourke's chart", "act3_reckoning_briefing", "lena", "I have not amended it", "state.flags.rourke = 'stopped';"],
  ["tomas break / Tomas / plates for the ring", "tomas_break", "tomas", "a plate for Amara and one for Sela", "state.flags.crisis = 'vent'; mark('tomas', 'warned');"],
  ["tomas cost / Tomas / stores seized", "act3_lethal_tomas_cost", "tomas", "before I came aboard", "state.flags.stores = 'seize';"],
  ["tomas cost / Tomas / stores voted", "act3_lethal_tomas_cost", "tomas", "did not get a vote", "state.flags.stores = 'vote';"],
  ["mira board / Mira / drive first", "act3_lethal_mira_board", "mira", "Still on the board. Apply it", "mark('mira', 'drive_first');"],
  ["mira board / Mira / people first", "act3_lethal_mira_board", "mira", "I am a person. I am also the repair", "mark('mira', 'people_first');"],
  ["breath onset / Tomas / share in the count", "breath_onset", "tomas", "when I count the mouths", "kill('lena', 'resources diverted to the vault');"],
  ["custody onset / Elias / vault kept cold", "custody_onset", "elias", "This is the receipt", "state.flags.vault_sacrifice = 'future';"],
  ["reckon public / Mira / binding refused", "reckon_public", "mira", "The living kept the vote", "state.promises.mira = 'kept';"],
  ["reckon public / Mira / binding accepted", "reckon_public", "mira", "One of them is bearing more", "state.promises.mira = 'broken';"],
  ["reckon public / Amara's plate / vented pocket", "reckon_public", "tomas", "has not set a plate for you", "state.promises.amara = 'broken';"],
  ["reckon suppress / Elias / Deck Four kept", "reckon_suppress", "elias", "I had it from you first", "state.promises.elias = 'kept';"],
  ["reckon suppress / Elias / Deck Four edited", "reckon_suppress", "elias", "I enforce orders", "state.promises.elias = 'broken';"],
  ["sun payoff / Sela / petition kept", "sun_payoff", "sela", "stood between me and the room", "state.promises.sela = 'kept';"],
  ["sun payoff / Sela / petition broken", "sun_payoff", "sela", "They were never the room's to take", "state.promises.sela = 'broken';"],
  ["prom direct / Mira / Lena's diversion", "prom_direct", "mira", "Lena died on that diversion", "state.promises.mira = 'made'; kill('lena', 'resources diverted to the vault');"]
];

const out = JSON.parse(runtime.evaluate(`JSON.stringify((() => {
  persistSave = () => true;
  const fresh = () => { resetRunState(); state.recovered.tomas = state.recovered.jiro = state.recovered.vess = true; state.crisisPath = "breath"; state.flags.junctionChoice = "none"; state.supplies = 60; state.integrity = 60; state.cohesion = 50; };
  const render = (scene) => { const sc = scenes[scene]; const text = typeof sc.text === "function" ? sc.text() : sc.text; return text; };
  const choicesOf = (scene) => { const sc = scenes[scene]; const c = typeof sc.choices === "function" ? sc.choices.call(sc) : sc.choices; return (c || []).map(x => x.text + ">" + x.next); };
  const rows = [];
  for (const [name, scene, speaker, needle, setup] of ${JSON.stringify(CASES)}) {
    const row = { name };
    // fact set, speaker alive
    fresh(); new Function(setup)(); showScene(scene);
    const before = JSON.stringify(state);
    const first = render(scene), second = render(scene);
    row.withFact = first.includes(needle); row.pure = first === second && JSON.stringify(state) === before; row.choicesWith = choicesOf(scene);
    // fact unset
    fresh(); showScene(scene);
    row.withoutFact = render(scene).includes(needle); row.choicesWithout = choicesOf(scene);
    // fact set, speaker dead (or unrecovered)
    fresh(); new Function(setup)(); if (speaker === "tomas" || speaker === "jiro") state.recovered[speaker] = false; else kill(speaker, "callback fixture");
    const dead = scenes[scene].onEnter ? scenes[scene].onEnter() : null;
    row.deadRedirect = dead || null; row.withDead = render(scene).includes(needle);
    rows.push(row);
  }
  return rows;
})())`, 120_000));

for (const row of out) {
  assert.ok(row.withFact, `${row.name}: callback missing when the fact is set`);
  assert.ok(row.pure, `${row.name}: render wrote state or differed on a second render`);
  assert.ok(!row.withoutFact, `${row.name}: callback rendered without its fact`);
  assert.ok(!row.withDead, `${row.name}: callback rendered with the speaker dead or unrecovered`);
  assert.deepEqual(row.choicesWith, row.choicesWithout, `${row.name}: choices changed with the fact`);
}
console.log(`PASS sun-playerflow-callbacks: ${out.length} callback renders gated on run fact and living speaker, pure, choices unchanged`);
