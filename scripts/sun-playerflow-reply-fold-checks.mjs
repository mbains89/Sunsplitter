// SUN-DIET-REPLY-FOLD-01 (D11 Deep step 1, items C11/C12; L-057) — one-line answer screens and four
// non-lethal lethal-result screens are folded into the previous choice's `reply` and retired.
// Guards, through the real engine:
//   1. each folded choice goes straight to the old answer screen's exit, pays exactly what it paid
//      before (plus breath_word, which the answer screen's entry used to write), and the next screen
//      opens with the old answer as its reply lines, once, in order, before the scene's own text;
//   2. a dead or absent speaker's line is dropped (the reply `who`), and choices stay alive-gated;
//   3. the retired ids are gone: not registered, not a choice target, not in the image map, not in
//      a living-cast contract; each keeps an exit in RETIRED_SCENE_EXITS;
//   4. a save parked on a retired screen (marked or legacy, autosave or Import) still loads and
//      resumes at that screen's exit, entered fresh, and the slot adopts the exit.
// SUN-DIET-VESS-MERGE-01 (item C10) retires vess_cost the same way, but by merging it into vess_signal
// (no reply fold): guards 3 and 4 cover it here; its text, writes and choices are pinned in verify.mjs
// (vessCourseRetirementChecks).
import assert from "node:assert/strict";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadGame } from "./simulate.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const RETIRED = {
  hold_bolts_again: "act3_spine_next", hold_bolts_silent: "act3_spine_next",
  breath_word_given: "breath_hub", breath_word_refused: "breath_hub",
  arc_living_sela_answer: "arc_living_3",
  filters_stencil_luck: "offshift_sela", filters_stencil_silent: "offshift_sela",
  act3_lethal_tomas_stores: "act3_lethal_elias_order", act3_lethal_tomas_structure: "act3_lethal_elias_order",
  act3_lethal_elias_brace: "act3_lethal_mira_board", act3_lethal_mira_collar: "faction_split|mira_root_cause",
  // SUN-DIET-MEMORY-FOLD-01 (C04): the memory pass-through's text is final_choice's first-arrival preamble.
  ship_memory_payoff: "final_choice",
  vess_cost: "vess_signal" // SUN-DIET-VESS-MERGE-01: merged, not folded; the exit is the merged screen itself
};
const ABOARD = "Object.assign(state.recovered, { tomas: true, jiro: true, vess: true });";
// [label, setup, from scene, choice text prefix, expected next scene, reply lines (exact), expected
//  state writes besides the choice's declared effects/lean/affinity/trust/mark]
const FOLDS = [
  ["bolts again", ABOARD, "hold_bolts", "You'd sign it again?", "act3_spine_next",
    [`"Ask me on a day the trays are full," Tomas says. "You will get a cleaner answer, and it will be worth less."`], {}],
  ["bolts silent", ABOARD, "hold_bolts", "Say nothing.", "act3_spine_next",
    [`"Check the torque yourself if you want," Tomas says. "The bolts hold. That was never the question."`], {}],
  ["word given, Tomas aboard", ABOARD + "state.crisisPath = 'breath';", "breath_onset", '"The rescued will not', "breath_hub",
    [`Tomas nods once. The public word is given.`, `"Then we hold the line together. I'll prep the crisis options. None of them are clean."`], { breath_word: "given" }],
  ["word given, Tomas dead", ABOARD + "kill('tomas', 'fold fixture'); state.crisisPath = 'breath';", "breath_onset", '"The rescued will not', "breath_hub",
    [`The public word is given into the rumor. No one stands beside it to make it heavier.`, `The crisis options still have to be prepped. None of them are clean.`], { breath_word: "given" }],
  ["word refused, Tomas aboard", ABOARD + "state.crisisPath = 'breath';", "breath_onset", '"I make no promises', "breath_hub",
    [`The refusal lands.`, `Tomas does not argue. "Understood, Commander. The math is yours."`, `The rumor does not die. It only goes quieter.`], { breath_word: "refused" }],
  ["word refused, Tomas dead", ABOARD + "kill('tomas', 'fold fixture'); state.crisisPath = 'breath';", "breath_onset", '"I make no promises', "breath_hub",
    [`The refusal lands.`, `The rumor does not die. It only goes quieter.`], { breath_word: "refused" }],
  ["Sela's answer", ABOARD, "arc_living_2", "Ask what she would spend", "arc_living_3",
    [`Sela answers.`, `"It was warm. Not a memory to cry over — a fact. If we only keep what the dark allows, we will forget what we were trying to arrive as."`], {}],
  ["stencil luck", ABOARD, "filters_stencil", "Luck, then.", "offshift_sela",
    [`"They will say luck, or they will say selection. I decline both. Something was asked of me, and I have not yet been told what."`], {}],
  ["stencil silent", ABOARD, "filters_stencil", "Say nothing.", "offshift_sela",
    [`She seats the filter and says its count aloud — just the number — the way one says a name at a graveside, when the name is all that is left to say.`], {}],
  ["Tomas stores, annex", ABOARD + "state.supplies = 40;", "act3_lethal_tomas_cost", "Cut the annex loose", "act3_lethal_elias_order",
    [`The collar charges fire. The annex falls away.`, `Eight points leave Supplies before the green strip becomes too small to see.`, `Tomas watches it without touching the suit. "The mouths pay," he says. "Write that. Not me. Not this time."`], {}],
  ["Tomas structure, annex", ABOARD + "state.integrity = 60;", "act3_lethal_tomas_cost", "Torque the hull", "act3_lethal_elias_order",
    [`The Sunsplitter rolls three degrees against the drift.`, `The spine takes the load. Seven Integrity points leave the board. The annex collar reseats with a sound felt through every deck.`, `Tomas reads the new fracture line, then the green strip. "Seven from Integrity," he says. He keeps the annex pressure trace beside the new fracture line.`], {}],
  ["Tomas stores, stranded Sela", ABOARD + "state.supplies = 40; state.flags.vault_sacrifice = 'future'; state.flags.tomas = 'future';", "act3_lethal_tomas_cost", "Spend reserve oxygen", "act3_lethal_elias_order",
    [`Reserve oxygen enters the service throat hard enough to make the bulkhead ring. Patch compound follows in a white sheet.`, `Sela crosses before the temporary pressure fails. Tomas closes the manual release only after the living body is on this side.`, `"Eight from stores," he says. "Put it beside the name."`], {}],
  ["Tomas structure, stranded Jiro", ABOARD + "state.embryos = 60; state.flags.vault_sacrifice = 'future'; state.flags.tomas = 'future'; kill('sela', 'fold fixture');", "act3_lethal_tomas_cost", "Quench the outer embryo rack", "act3_lethal_elias_order",
    [`The rack quench is clean.`, `Nitrogen leaves the vault, holds the service throat, and carries Jiro back through it. Eight viability points vanish without making a sound.`, `Tomas releases the hatch when the crossing is complete. "Eight from the vault," he says. He keeps Jiro's suit tag beside the new count.`], {}],
  ["Elias brace", ABOARD + "state.integrity = 60;", "act3_lethal_elias_order", "Blow the exterior brace", "act3_lethal_mira_board",
    [`The brace charges fire in order. Seven Integrity points leave the board as the exterior frame turns away into the dark.`, `The pressure front follows it out instead of moving toward habitation. B-four seats without anyone crossing the access line.`, `Elias reads the narrower structural envelope once. "Threat contained. That side of the ship is no longer ours to spend."`], {}],
  ["Mira collar, partner", ABOARD + "state.integrity = 60; state.crisisPath = 'breath'; state.romance.mira = true;", "act3_lethal_mira_board", "Cut the transfer collar", "mira_root_cause",
    [`The collar separates on the third charge. A section of transfer hardware turns slowly beyond the observation strip, still glowing at the cut.`, `The cross-feed vanishes because half the system no longer exists. The drive returns inside a smaller envelope.`, `Mira reads the limit twice. "Cross-feed gone. Post the lower ceiling."`], {}],
  // Not a partner: faction_split's entry routes on (here to the open crisis); the reply rides the redirect.
  ["Mira collar, crisis next", ABOARD + "state.integrity = 60; state.ideology.living = 10;", "act3_lethal_mira_board", "Cut the transfer collar", "breath_onset",
    [`The collar separates on the third charge. A section of transfer hardware turns slowly beyond the observation strip, still glowing at the cut.`, `The cross-feed vanishes because half the system no longer exists. The drive returns inside a smaller envelope.`, `Mira reads the limit twice. "Cross-feed gone. Post the lower ceiling."`], {}]
];

const runtime = loadGame(ROOT);
const out = JSON.parse(runtime.evaluate(`JSON.stringify((() => {
  globalThis.__realPersistSave = persistSave;
  persistSave = () => true;
  const story = () => document.getElementById("story").innerHTML;
  const listOf = id => { const s = scenes[id]; const l = typeof s.choices === "function" ? s.choices() : s.choices; return l || []; };
  const RES = ["survivors", "integrity", "cohesion", "supplies", "embryos"];
  const folds = ${JSON.stringify(FOLDS)}.map(([label, setup, from, prefix, next, lines, writes]) => {
    resetRunState(); eval(setup); showScene(from);
    const choice = listOf(from).find(c => c.text.startsWith(prefix));
    if (!choice) return { label, missing: true };
    const before = JSON.parse(JSON.stringify(state));
    makeChoice(choice);
    const after = JSON.parse(JSON.stringify(state));
    const paid = {}; for (const k of RES) if (after[k] !== before[k]) paid[k] = after[k] - before[k];
    const declared = {}; for (const [k, v] of Object.entries(choice.effects || {})) if (RES.includes(k) && v) declared[k] = v;
    const newFlags = {}; for (const [k, v] of Object.entries(after.flags)) if (JSON.stringify(before.flags[k]) !== JSON.stringify(v)) newFlags[k] = v;
    const html = story();
    const shown = html.match(/<p class="choice-reply">[\\s\\S]*?<\\/p>/g) || [];
    const rendered = html.replace(/^<div class="scene-text">/, "");
    const expectedHead = lines.map(t => '<p class="choice-reply">' + t + "</p>").join("");
    const opensWithReply = rendered.startsWith(expectedHead) && !rendered.slice(expectedHead.length).includes("choice-reply");
    showScene(state.scene, { skipOnEnter: true, resume: true });
    const replayed = story().includes("choice-reply");
    return { label, scene: state.scene, shown: shown.length, opensWithReply, paid, declared, newFlags, replayed,
      expectFlags: writes, choiceFlag: choice.flag || {}, inSave: JSON.stringify(snapshotState()).includes(lines[0].slice(0, 24)) };
  });
  // Alive gates: a dead or unrecovered Tomas/Sela/Elias/Mira hides the folded choice (no reply to read).
  const gates = [["hold_bolts", "tomas", "You'd sign it again?"], ["filters_stencil", "sela", "Luck, then."],
    ["arc_living_2", "sela", "Ask what she would spend"], ["act3_lethal_elias_order", "elias", "Blow the exterior brace"],
    ["act3_lethal_mira_board", "mira", "Cut the transfer collar"]].map(([from, who, prefix]) => {
    resetRunState(); ${ABOARD} state.integrity = 60; kill(who, "fold gate fixture");
    const offered = listOf(from).some(c => c.text.startsWith(prefix) && (!c.alive || isAlive(c.alive)));
    return { from, who, offered };
  });
  // A stale button (speaker killed after render): the reply's who drops the line.
  resetRunState(); ${ABOARD} showScene("hold_bolts");
  const stale = listOf("hold_bolts")[0]; kill("tomas", "fold stale fixture"); makeChoice(stale);
  const staleSpeaks = story().includes("Ask me on a day");
  // Retired ids are gone everywhere, and each has its exit.
  const graph = window.validateSunsplitter().graph;
  const targets = new Set(Object.values(graph).flat());
  const retired = Object.keys(${JSON.stringify(RETIRED)}).map(id => ({ id,
    registered: !!scenes[id], targeted: targets.has(id), mapped: Object.prototype.hasOwnProperty.call(sceneImages, id),
    cast: !!livingCastContracts[id] || !!livingCastImageOnly[id],
    exit: (() => { state.romance = {}; const a = retiredSceneExit(id); state.romance = { mira: true }; const b = retiredSceneExit(id); state.romance = {}; return a === b ? a : [a, b].sort().join("|"); })()
  }));
  const tableKeys = Object.keys(RETIRED_SCENE_EXITS).sort();
  return { folds, gates, staleSpeaks, retired, tableKeys };
})())`, 60_000));

const failures = [];
for (const f of out.folds) {
  const want = FOLDS.find(row => row[0] === f.label);
  if (f.missing) { failures.push(`${f.label}: folded choice not offered`); continue; }
  if (f.scene !== want[4]) failures.push(`${f.label}: landed on ${f.scene}, expected ${want[4]}`);
  if (!f.opensWithReply || f.shown !== want[5].length) failures.push(`${f.label}: next screen does not open with exactly the ${want[5].length} answer line(s) (saw ${f.shown})`);
  if (JSON.stringify(f.paid) !== JSON.stringify(f.declared)) failures.push(`${f.label}: paid ${JSON.stringify(f.paid)} but declared ${JSON.stringify(f.declared)}`);
  for (const [k, v] of Object.entries(f.expectFlags)) {
    if (f.newFlags[k] !== v || f.choiceFlag[k] !== v) failures.push(`${f.label}: ${k} must be written by the choice as ${v}`);
  }
  if (f.replayed) failures.push(`${f.label}: reply replayed on a resume render`);
  if (f.inSave) failures.push(`${f.label}: reply text reached the save`);
}
for (const g of out.gates) if (g.offered) failures.push(`${g.from}: folded choice offered with ${g.who} dead`);
if (out.staleSpeaks) failures.push("hold_bolts: a dead Tomas still speaks through the reply");
for (const r of out.retired) {
  if (r.registered) failures.push(`${r.id}: retired scene is registered`);
  if (r.targeted) failures.push(`${r.id}: a choice still routes to the retired scene`);
  if (r.mapped) failures.push(`${r.id}: still in sceneImages`);
  if (r.cast) failures.push(`${r.id}: still in a living-cast table`);
  if (r.exit !== RETIRED[r.id]) failures.push(`${r.id}: retired exit ${r.exit} != ${RETIRED[r.id]}`);
}
if (JSON.stringify(out.tableKeys) !== JSON.stringify(Object.keys(RETIRED).sort())) failures.push(`RETIRED_SCENE_EXITS keys drifted: ${out.tableKeys.join(",")}`);

// Parked saves: every retired id, marked and legacy, through autosave/Continue and through Import.
const saves = JSON.parse(runtime.evaluate(`JSON.stringify((() => {
  persistSave = globalThis.__realPersistSave;
  const results = [];
  const confirm = window.confirm; window.confirm = () => true;
  try {
    for (const id of Object.keys(RETIRED_SCENE_EXITS)) for (const legacy of [false, true]) for (const via of ["slot", "import"]) for (const partner of [false, true]) {
      if (partner && id !== "act3_lethal_mira_collar") continue;
      const setup = () => {
        localStorage.clear(); resetRunState(); ${ABOARD}
        state.integrity = 60; state.ideology.living = 10; state.crisisPath = "breath";
        if (partner) state.romance.mira = true;
        state.promises.tomas = "made"; state.flags.prom_tomas_alluded = true; // a spent one-shot line must not replay on resume
        if (id.startsWith("breath_word")) state.flags.breath_word = id.endsWith("given") ? "given" : "refused";
      };
      // Control: what pressing the retired screen's Continue did — enter its exit fresh.
      setup(); state.scene = id; showScene(retiredSceneExit(id));
      const control = JSON.stringify(state);
      const controlStory = document.getElementById("story").innerHTML;
      setup();
      const snapshot = snapshotState(); snapshot.scene = id; if (legacy) delete snapshot.sceneEntered;
      let imported = true;
      if (via === "slot") localStorage.setItem(SAVE_KEY, JSON.stringify(snapshot));
      else imported = importSaveText(JSON.stringify(snapshot));
      const readable = hasSave();
      resetRunState();
      const resumed = imported && resumeGame();
      const scene = state.scene;
      const slot = (() => { try { return JSON.parse(readRawSave()).scene; } catch (e) { return null; } })();
      const exits = (() => { const s = scenes[scene]; if (!s) return 0; const l = typeof s.choices === "function" ? s.choices() : s.choices; return (l || []).filter(c => (!c.alive || isAlive(c.alive)) && (!c.requires || meetsRequirements(c.requires)) && canAffordEffects(c.effects)).length; })();
      results.push({ id, legacy, via, partner, imported, readable, resumed, scene, slot, exits, sameAsContinue: JSON.stringify(state) === control, sameText: document.getElementById("story").innerHTML === controlStory });
    }
  } finally { window.confirm = confirm; }
  return results;
})())`, 60_000));
for (const s of saves) {
  const tag = `${s.id} (${s.legacy ? "legacy" : "marked"}, ${s.via}${s.partner ? ", partner" : ""})`;
  if (!s.imported || !s.readable || !s.resumed) { failures.push(`${tag}: parked save not readable (import=${s.imported} readable=${s.readable} resumed=${s.resumed})`); continue; }
  if (s.scene === s.id || !s.scene) failures.push(`${tag}: resumed on the retired id`);
  // The exit is entered fresh, so its own entry may route on (act3_spine_next -> vess_signal, faction_split -> aftermath_seal).
  if (!s.sameAsContinue) failures.push(`${tag}: resumed state (${s.scene}) differs from pressing the retired screen's Continue`);
  if (!s.sameText) failures.push(`${tag}: resumed screen (${s.scene}) renders differently from pressing the retired screen's Continue`);
  if (s.slot !== s.scene) failures.push(`${tag}: slot kept ${s.slot}, live scene ${s.scene}`);
  if (s.exits < 1) failures.push(`${tag}: resumed on ${s.scene} with no enabled exit`);
}

assert.deepEqual(failures, [], `reply-fold failures:\n  ${failures.join("\n  ")}`);
const landed = [...new Set(saves.map(s => `${s.id}->${s.scene}`))].join(", ");
console.log(`PASS sun-playerflow-reply-fold: ${FOLDS.length} folded answers open their exit screen as reply lines, pay only what they paid, drop dead speakers, never replay or save; ${Object.keys(RETIRED).length} retired ids gone with exits; ${saves.length} parked saves resume (${landed})`);
