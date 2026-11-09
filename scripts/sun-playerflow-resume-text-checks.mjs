// SUN-HUB-RESUME-01 — Continue shows the screen the live visit showed.
// A save holds the state after the screen's entry, and Continue renders that screen again from the
// save with onEnter skipped (sceneEntered). A text that reads something its own onEnter changes, or
// memory only the live entry set, prints a different screen on Continue: the browser bot's
// RESUME_DRIFT. The corridor hub act3_spine_next did this with Tomas's one-shot allusion ("Names
// first, then numbers."), which a return visit hid live and a resumed return printed again.
// Checks, through the real engine, each save written by the engine's persistSave and loaded into a
// fresh runtime by its Continue (resumeGame):
//   1. every hub state the allusion reads (first visit or return; Tomas's promise none, made or
//      declined; the line spent or not; Tomas alive or dead), marked and legacy saves: the live
//      visit prints the line only when it is due, and Continue prints exactly the live screen;
//   2. seeded real play (runner pattern from sun-playerflow-no-repeat-lap-checks.mjs: a fresh
//      campaign, recovery only through its own scenes, the Math.imul LCG, #choices cleared), two
//      pickers: a save at every act3_spine_next visit, and at a few other screens per run picked by
//      a second LCG so play itself is unchanged. Scene id, story text and choice labels must match.
// Choice replies (`.choice-reply`, L-057) open a screen once and are never saved, so they are
// stripped from the live story. ending_check is not sampled: the ending renders on its own screen.
import assert from "node:assert/strict";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadGame } from "./simulate.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const HUB = "act3_spine_next";
const ALLUSION = "Names first, then numbers.";
const RUNS_PER_PICKER = 50;
const SAMPLES_PER_RUN = 3;
const MAX_STEPS = 700;
const SEED = 1107;

// The writer keeps the engine's persistSave for the saves it takes and stubs the per-choice autosave.
const PRELUDE = `
  if (!globalThis.__realPersistSave) globalThis.__realPersistSave = persistSave;
  persistSave = () => true;
  const choicesEl = document.getElementById("choices");
  if (!choicesEl.__clearsOnInnerHTML) {
    let html = choicesEl.innerHTML;
    Object.defineProperty(choicesEl, "innerHTML", { configurable: true, get: () => html,
      set: value => { html = String(value); choicesEl.children.length = 0; } });
    choicesEl.__clearsOnInnerHTML = true;
  }
  const screen = () => ({ scene: state.scene, story: document.getElementById("story").innerHTML,
    labels: choicesEl.children.map(b => b.__ssChoiceLabelHtml || b.innerHTML) });
  const save = legacy => {
    localStorage.clear();
    if (globalThis.__realPersistSave({ silent: true }) !== true) throw new Error("persistSave failed at " + state.scene);
    const raw = localStorage.getItem(SAVE_KEY);
    if (!legacy) return raw;
    const data = JSON.parse(raw); delete data.sceneEntered; return JSON.stringify(data);
  };
`;
const stripReplies = html => html.replace(/<p class="choice-reply">[\s\S]*?<\/p>/g, "");

// Reload as a browser does: a new page, the save in storage, Continue.
function resume(raw) {
  const reader = loadGame(ROOT, { includeValidator: false });
  return JSON.parse(reader.evaluate(`JSON.stringify((() => {
    ${PRELUDE}
    localStorage.clear();
    localStorage.setItem(SAVE_KEY, ${JSON.stringify(raw)});
    const ok = resumeGame();
    return Object.assign({ ok }, screen());
  })())`));
}

function compare(live, raw, where, drift) {
  const back = resume(raw);
  const same = back.ok && back.scene === live.scene && back.story === stripReplies(live.story) &&
    JSON.stringify(back.labels) === JSON.stringify(live.labels);
  if (!same) {
    const a = stripReplies(live.story), b = back.story;
    let i = 0;
    while (i < a.length && a[i] === b[i]) i++;
    drift.push(`${where}: ${live.scene} resumed as ${back.scene} (ok ${back.ok}); labels ${back.labels.length}/${live.labels.length}` +
      `\n      live:   …${a.slice(Math.max(0, i - 40), i + 120)}\n      resume: …${b.slice(Math.max(0, i - 40), i + 120)}`);
  }
  return same;
}

// 1. Every hub state the allusion reads.
const matrix = JSON.parse(loadGame(ROOT).evaluate(`JSON.stringify((() => {
  ${PRELUDE}
  const rows = [];
  for (const visit of ["first", "return"]) for (const promise of ["none", "made", "declined"])
  for (const spent of [false, true]) for (const tomas of ["alive", "dead"]) for (const legacy of [false, true]) {
    resetRunState();
    state.recovered.tomas = true; state.recovered.jiro = true; state.recovered.vess = true;
    state.flags.vault_sacrifice = "living";
    if (visit === "return") state.flags.warmth_music = true;
    if (promise !== "none") state.promises.tomas = promise;
    if (spent) state.flags.prom_tomas_alluded = true;
    if (tomas === "dead") kill("tomas", "resume fixture");
    showScene(${JSON.stringify(HUB)});
    const live = screen();
    rows.push({ visit, promise, spent, tomas, legacy, live, raw: save(legacy),
      due: promise === "made" && !spent && tomas === "alive" });
  }
  return rows;
})())`));
const matrixDrift = [];
for (const row of matrix) {
  const where = `hub ${row.visit} visit, promise ${row.promise}, ${row.spent ? "spent" : "unspent"}, Tomas ${row.tomas}${row.legacy ? ", legacy save" : ""}`;
  assert.equal(row.live.scene, HUB, `${where}: did not land on the hub`);
  assert.equal(row.live.story.includes(ALLUSION), row.due, `${where}: live visit ${row.due ? "must" : "must not"} print the allusion`);
  compare(row.live, row.raw, where, matrixDrift);
}
assert.deepEqual(matrixDrift, [], `Continue on the hub must print the live visit:\n  ${matrixDrift.join("\n  ")}`);

// 2. Seeded real play: every hub visit and a few sampled screens per run.
const sweep = { runs: 0, hubSaves: 0, otherSaves: 0, allusionSaves: 0, scenes: new Set(), drift: [] };
for (const picker of ["random", "cheapest"]) {
  const chunkSeed = SEED * 1000 + (picker === "cheapest" ? 100 : 0);
  const rows = JSON.parse(loadGame(ROOT).evaluate(`JSON.stringify((() => {
    ${PRELUDE}
    let seed = ${chunkSeed};
    const rnd = () => { seed = (Math.imul(seed, 1103515245) + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
    Math.random = rnd;
    // Which screens to save comes from its own LCG, so sampling never changes what is played.
    let sampleSeed = ${chunkSeed} + 7;
    const sampleRnd = () => { sampleSeed = (Math.imul(sampleSeed, 1103515245) + 12345) & 0x7fffffff; return sampleSeed / 0x7fffffff; };
    const enabled = c => c && (!c.alive || isAlive(c.alive)) && (!c.aliveAll || c.aliveAll.every(k => isAlive(k))) &&
      (!c.aliveAny || c.aliveAny.some(k => isAlive(k))) && (!c.requires || meetsRequirements(c.requires)) &&
      (!c.effects || canAffordEffects(c.effects));
    const RES = ["integrity", "cohesion", "supplies", "embryos", "survivors"];
    const cost = c => RES.filter(k => c.effects && typeof c.effects[k] === "number" && c.effects[k] < 0).length;
    const pick = list => {
      if (${JSON.stringify(picker)} === "cheapest") { const least = Math.min(...list.map(cost)); list = list.filter(c => cost(c) === least); }
      return list[Math.floor(rnd() * list.length)];
    };
    const out = [];
    for (let r = 0; r < ${RUNS_PER_PICKER}; r++) {
      resetRunState();
      showScene("wake");
      // Sample steps are drawn over the run's first 120 screens; a run is about 100 to 160 long.
      const sampleAt = new Set(Array.from({ length: ${SAMPLES_PER_RUN} }, () => Math.floor(sampleRnd() * 120)));
      const saves = [];
      for (let step = 0; step < ${MAX_STEPS}; step++) {
        const id = state.scene;
        if (id === "ending_check" || !scenes[id]) break;
        if (id === ${JSON.stringify(HUB)} || sampleAt.has(step)) saves.push({ step, hub: id === ${JSON.stringify(HUB)}, live: screen(), raw: save(false) });
        const sc = scenes[id];
        const list = ((typeof sc.choices === "function" ? sc.choices() : sc.choices) || []).filter(enabled);
        if (!list.length) break;
        makeChoice(pick(list));
      }
      out.push(saves);
    }
    return out;
  })())`, 600_000));
  rows.forEach((saves, r) => {
    sweep.runs++;
    for (const s of saves) {
      if (s.hub) sweep.hubSaves++; else sweep.otherSaves++;
      if (s.hub && s.live.story.includes(ALLUSION)) sweep.allusionSaves++;
      if (!s.hub) sweep.scenes.add(s.live.scene);
      compare(s.live, s.raw, `${picker} picker (seed ${chunkSeed}) run ${r} step ${s.step}`, sweep.drift);
    }
  });
}
assert.deepEqual(sweep.drift, [], `Continue must print the live screen:\n  ${sweep.drift.join("\n  ")}`);
assert.ok(sweep.hubSaves > sweep.runs * 3, `seeded play must revisit the hub (${sweep.hubSaves} hub saves in ${sweep.runs} runs)`);
assert.ok(sweep.allusionSaves > 0, "seeded play must save at least one hub visit that prints the Tomas allusion");

console.log(`PASS sun-playerflow-resume-text: ${matrix.length} hub states resume as played; ${sweep.runs} seeded runs, ` +
  `${sweep.hubSaves} hub saves (${sweep.allusionSaves} with the allusion) and ${sweep.otherSaves} saves on ${sweep.scenes.size} other scenes ` +
  `resume with the live scene, story and choices (replies stripped)`);
