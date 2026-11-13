// SUN-EMPTY-PARAGRAPHS-01 — no rendered screen carries an empty paragraph.
// In paced reveal (the default, L-059) every paragraph the renderer emits costs one "Read on" tap,
// so an empty or whitespace-only paragraph is a tap that reveals nothing. Scene text built by
// appending "\n\n" after conditional lines used to leave one at the end of the screen whenever the
// last condition was false (arc_living_1-3, warmth_laughter, offshift_lena, pursuit_window).
// Through the real engine, this check:
//   A. renders a probe scene with leading, trailing, whitespace-only and over-long separators and
//      requires exactly its two real paragraphs, unchanged, in the markup paced and instant share;
//   B. plays seeded real runs (runner pattern from sun-playerflow-no-repeat-lap-checks.mjs: a fresh
//      campaign, recovery only through its own scenes, the Math.imul LCG, #choices cleared), two
//      pickers, and fails on any rendered screen with a paragraph whose text is empty or whitespace
//      (story paragraphs and choice replies alike), naming the scene, picker, seed and run;
//   C. saves the first visit of each scene that used to carry one and requires Continue (a fresh
//      runtime, resumeGame) to print the live screen, replies stripped, as
//      sun-playerflow-resume-text-checks.mjs does.
import assert from "node:assert/strict";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadGame } from "./simulate.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const RUNS_PER_PICKER = 150;
const CHUNK = 25;
const RELOAD_EVERY = 3;
const MAX_STEPS = 700;
const SEED = 1113;
const PICKERS = ["random", "cheapest"];
// The scenes seeded play found with an empty paragraph before this ticket; C resumes each one.
const FORMER = ["warmth_laughter", "arc_living_1", "arc_living_2", "arc_living_3", "offshift_lena", "pursuit_window"];

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
  // Every paragraph the renderer emitted, and the ones a reader would see as nothing.
  const paragraphs = html => html.match(/<p[^>]*>[\\s\\S]*?<\\/p>/g) || [];
  const blank = markup => !markup.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").trim();
`;
const stripReplies = html => html.replace(/<p class="choice-reply">[\s\S]*?<\/p>/g, "");
const failures = [];

// A. The renderer drops blank paragraphs and keeps every real one byte for byte.
{
  const r = JSON.parse(loadGame(ROOT).evaluate(`JSON.stringify((() => {
    ${PRELUDE}
    resetRunState();
    scenes.__empty_paragraph_probe = {
      text: "\\n\\nFirst line.\\nSame paragraph.\\n\\n \\n\\n\\t\\n\\n\\nSecond paragraph.\\n\\n\\n\\n",
      choices: [{ text: "On.", next: "wake" }]
    };
    showScene("__empty_paragraph_probe");
    const html = document.getElementById("story").innerHTML;
    delete scenes.__empty_paragraph_probe;
    return { html };
  })())`));
  const want = `<div class="scene-text"><p>First line.<br>Same paragraph.</p><p>Second paragraph.</p></div>`;
  if (r.html !== want) failures.push(`A probe: rendered ${JSON.stringify(r.html)}\n    expected ${JSON.stringify(want)}`);
}

// B. Seeded real play: no rendered screen has a blank paragraph.
const sweep = { runs: 0, screens: 0, paragraphs: 0, bad: new Map() };
for (const picker of PICKERS) {
  let runtime = null;
  for (let chunk = 0; chunk * CHUNK < RUNS_PER_PICKER; chunk++) {
    if (chunk % RELOAD_EVERY === 0) runtime = loadGame(ROOT);
    const runs = Math.min(CHUNK, RUNS_PER_PICKER - chunk * CHUNK);
    const chunkSeed = SEED * 1000 + PICKERS.indexOf(picker) * 100 + chunk;
    const out = JSON.parse(runtime.evaluate(`JSON.stringify((() => {
      ${PRELUDE}
      let seed = ${chunkSeed};
      const rnd = () => { seed = (Math.imul(seed, 1103515245) + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
      Math.random = rnd;
      const enabled = c => c && (!c.alive || isAlive(c.alive)) && (!c.aliveAll || c.aliveAll.every(k => isAlive(k))) &&
        (!c.aliveAny || c.aliveAny.some(k => isAlive(k))) && (!c.requires || meetsRequirements(c.requires)) &&
        (!c.effects || canAffordEffects(c.effects));
      const RES = ["integrity", "cohesion", "supplies", "embryos", "survivors"];
      const cost = c => RES.filter(k => c.effects && typeof c.effects[k] === "number" && c.effects[k] < 0).length;
      const pick = list => {
        if (${JSON.stringify(picker)} === "cheapest") { const least = Math.min(...list.map(cost)); list = list.filter(c => cost(c) === least); }
        return list[Math.floor(rnd() * list.length)];
      };
      let screens = 0, total = 0;
      const bad = [], errors = [];
      const inspect = (run, step) => {
        if (!scenes[state.scene]) return;
        const ps = paragraphs(document.getElementById("story").innerHTML);
        screens++; total += ps.length;
        const at = ps.map((p, i) => blank(p) ? i + 1 : 0).filter(Boolean);
        if (at.length) bad.push({ scene: state.scene, run, step, at, of: ps.length });
      };
      for (let r = 0; r < ${runs}; r++) {
        resetRunState();
        showScene("wake");
        inspect(r, 0);
        for (let step = 1; step <= ${MAX_STEPS}; step++) {
          const id = state.scene;
          if (id === "ending_check" || !scenes[id]) break;
          const sc = scenes[id];
          const list = ((typeof sc.choices === "function" ? sc.choices() : sc.choices) || []).filter(enabled);
          if (!list.length) break;
          try { makeChoice(pick(list)); } catch (e) { errors.push(id + ": " + String(e && e.message).slice(0, 100)); break; }
          inspect(r, step);
        }
      }
      return { screens, total, bad, errors };
    })())`, 600_000));
    sweep.runs += runs;
    sweep.screens += out.screens;
    sweep.paragraphs += out.total;
    out.errors.forEach(message => failures.push(`B ${picker} chunk seed ${chunkSeed}: a choice threw: ${message}`));
    for (const b of out.bad) {
      const entry = sweep.bad.get(b.scene) || { screens: 0, blanks: 0, first: null };
      entry.screens++;
      entry.blanks += b.at.length;
      entry.first = entry.first || `${picker} picker, chunk seed ${chunkSeed}, run ${b.run}, screen ${b.step}: paragraph ${b.at.join(", ")} of ${b.of}`;
      sweep.bad.set(b.scene, entry);
    }
  }
}
if (sweep.bad.size) {
  const rows = [...sweep.bad].sort((a, b) => b[1].blanks - a[1].blanks)
    .map(([scene, e]) => `    ${scene}: ${e.blanks} blank paragraph(s) on ${e.screens} screen(s); first at ${e.first}`);
  failures.push(`B seeded play rendered blank paragraphs (each one an empty "Read on" tap):\n${rows.join("\n")}`);
}
assert.ok(sweep.screens > sweep.runs * 50, `B: seeded play rendered only ${sweep.screens} screens in ${sweep.runs} runs`);

// C. Continue prints the live screen for the first visit of each former offender.
const firstVisits = JSON.parse(loadGame(ROOT).evaluate(`JSON.stringify((() => {
  ${PRELUDE}
  const want = new Set(${JSON.stringify(FORMER)});
  const saves = {};
  const save = () => {
    localStorage.clear();
    if (globalThis.__realPersistSave({ silent: true }) !== true) throw new Error("persistSave failed at " + state.scene);
    return localStorage.getItem(SAVE_KEY);
  };
  let seed = ${SEED};
  const rnd = () => { seed = (Math.imul(seed, 1103515245) + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  Math.random = rnd;
  const enabled = c => c && (!c.alive || isAlive(c.alive)) && (!c.aliveAll || c.aliveAll.every(k => isAlive(k))) &&
    (!c.aliveAny || c.aliveAny.some(k => isAlive(k))) && (!c.requires || meetsRequirements(c.requires)) &&
    (!c.effects || canAffordEffects(c.effects));
  for (let r = 0; r < 120 && Object.keys(saves).length < want.size; r++) {
    resetRunState();
    showScene("wake");
    for (let step = 0; step < ${MAX_STEPS}; step++) {
      const id = state.scene;
      if (id === "ending_check" || !scenes[id]) break;
      if (want.has(id) && !saves[id]) saves[id] = { run: r, step, live: screen(), raw: save() };
      const sc = scenes[id];
      const list = ((typeof sc.choices === "function" ? sc.choices() : sc.choices) || []).filter(enabled);
      if (!list.length) break;
      makeChoice(list[Math.floor(rnd() * list.length)]);
    }
  }
  return saves;
})())`, 600_000));
for (const id of FORMER) {
  const s = firstVisits[id];
  if (!s) { failures.push(`C: seeded play (seed ${SEED}) never reached ${id}; pick another seed`); continue; }
  const back = JSON.parse(loadGame(ROOT, { includeValidator: false }).evaluate(`JSON.stringify((() => {
    ${PRELUDE}
    localStorage.clear();
    localStorage.setItem(SAVE_KEY, ${JSON.stringify(s.raw)});
    const ok = resumeGame();
    return Object.assign({ ok }, screen());
  })())`));
  const live = stripReplies(s.live.story);
  if (!back.ok || back.scene !== s.live.scene || back.story !== live || JSON.stringify(back.labels) !== JSON.stringify(s.live.labels)) {
    failures.push(`C ${id} (seed ${SEED}, run ${s.run}, screen ${s.step}): Continue printed a different screen\n      live:   ${live}\n      resume: ${back.story}`);
  }
}

const summary = `${sweep.runs} seeded runs (${RUNS_PER_PICKER} random + ${RUNS_PER_PICKER} cheapest), ${sweep.screens} screens, ${sweep.paragraphs} paragraphs`;
if (failures.length) {
  console.error(`FAIL sun-playerflow-empty-paragraphs: ${summary}\n  ${failures.join("\n  ")}`);
  process.exitCode = 1;
} else {
  console.log(`PASS sun-playerflow-empty-paragraphs: probe renders only its real paragraphs; ${summary}, none blank; ` +
    `Continue prints the live screen for ${FORMER.length} former offenders`);
}
