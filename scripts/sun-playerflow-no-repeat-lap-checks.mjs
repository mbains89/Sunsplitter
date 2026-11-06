// SUN-NO-REPEAT-LAP-01 — a run never walks the same loop twice.
// Seeded play through the real engine with the scene-coverage harness (its LCG constants, chunks
// of 20 runs, a fresh runtime every 5 chunks), using two pickers: uniform random, and "cheapest"
// (the enabled choice with the fewest declared resource costs, ties broken at random). Runs start
// from a fresh campaign with Tomas, Jiro and Vess still missing, as real play does; they are
// recovered only by their own scenes, so the loops seen here are loops a player can walk.
//
// A lap is the scene sequence from one visit of a scene to the next visit of that same scene.
// The check FAILS when the same lap (as a cycle, so any rotation counts as the same lap)
// repeats inside one run and is not allowlisted below with a reason, or when a choice throws.
// For every repeating lap it prints the picker, chunk seed and run index, the sequence, and the
// resource/lean change of one lap. Sampling is finite, so an allowlisted lap that does not show
// up is printed as a NOTE, not failed: delete its entry when the fix lands.
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadGame } from "./simulate.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CHUNK = 20;
const RUNS_PER_PICKER = 1000;
const RELOAD_EVERY = 5;
const MAX_STEPS = 700;
const SEED = 23;
const PICKERS = ["random", "cheapest"];
// Laps known to repeat, keyed by the lap as printed. Matching is by cycle, so a rotation of the
// same loop is covered by one entry. Anything not listed here that repeats is a failure.
// The two Amara walk-in laps were listed here until SUN-AMARA-WALKIN-GATE-01 (#512) closed them.
const ALLOWED_REPEATS = {};

// One lap's identity as a cycle: drop the closing scene and rotate to the smallest rotation.
function cycleKey(lap) {
  const body = lap.split(" > ").slice(0, -1);
  let best = null;
  for (let i = 0; i < body.length; i++) {
    const rotated = [...body.slice(i), ...body.slice(0, i)].join(" > ");
    if (best === null || rotated < best) best = rotated;
  }
  return best;
}

const allowedByCycle = new Map(Object.entries(ALLOWED_REPEATS).map(([lap, reason]) => [cycleKey(lap), { lap, reason }]));

function playChunk(runtime, picker, chunk, runs) {
  const chunkSeed = SEED * 1000 + PICKERS.indexOf(picker) * 100 + chunk;
  return JSON.parse(runtime.evaluate(`JSON.stringify((() => {
    persistSave = () => true;
    // The headless DOM stub keeps old buttons when the engine clears #choices with
    // innerHTML = "", so a long realm slows down quadratically. Clear them as a browser would.
    const choicesEl = document.getElementById("choices");
    if (!choicesEl.__clearsOnInnerHTML) {
      let html = choicesEl.innerHTML;
      Object.defineProperty(choicesEl, "innerHTML", {
        configurable: true,
        get: () => html,
        set: value => { html = String(value); choicesEl.children.length = 0; }
      });
      choicesEl.__clearsOnInnerHTML = true;
    }
    let seed = ${chunkSeed};
    // Same LCG constants as the coverage harness, multiplied with Math.imul so the arithmetic
    // stays exact; a plain double product loses the low bits and falls into a ~10k-draw cycle.
    const rnd = () => { seed = (Math.imul(seed, 1103515245) + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
    Math.random = rnd;
    const enabled = c => c && (!c.alive || isAlive(c.alive)) &&
      (!c.aliveAll || c.aliveAll.every(k => isAlive(k))) &&
      (!c.aliveAny || c.aliveAny.some(k => isAlive(k))) &&
      (!c.requires || meetsRequirements(c.requires)) && (!c.effects || canAffordEffects(c.effects));
    const RESOURCES = ["integrity", "cohesion", "supplies", "embryos", "survivors"];
    const costCount = c => RESOURCES.filter(k => c.effects && typeof c.effects[k] === "number" && c.effects[k] < 0).length;
    const pick = list => {
      if (${JSON.stringify(picker)} === "cheapest") {
        const least = Math.min(...list.map(costCount));
        list = list.filter(c => costCount(c) === least);
      }
      return list[Math.floor(rnd() * list.length)];
    };
    const snapshot = () => ({
      integrity: state.integrity, cohesion: state.cohesion, supplies: state.supplies,
      embryos: state.embryos, survivors: state.survivors,
      future: (state.ideology && state.ideology.future) || 0, living: (state.ideology && state.ideology.living) || 0
    });
    const repeats = [], errors = [];
    let ended = 0, stuck = 0, capped = 0;
    for (let r = 0; r < ${runs}; r++) {
      const runSeed = seed;
      resetRunState();
      showScene("wake");
      const path = [], stats = [], lastAt = {}, laps = {};
      let outcome = "capped";
      for (let step = 0; step < ${MAX_STEPS}; step++) {
        const id = state.scene;
        path.push(id);
        stats.push(snapshot());
        const i = path.length - 1;
        if (lastAt[id] !== undefined) {
          const from = lastAt[id];
          const lap = path.slice(from, i + 1).join(" > ");
          const delta = {};
          for (const [k, v] of Object.entries(stats[i])) if (v !== stats[from][k]) delta[k] = v - stats[from][k];
          (laps[lap] = laps[lap] || []).push({ step: from, delta });
        }
        lastAt[id] = i;
        if (id === "ending_check" || !scenes[id]) { outcome = "ended"; break; }
        const scene = scenes[id];
        const choices = ((typeof scene.choices === "function" ? scene.choices() : scene.choices) || []).filter(enabled);
        if (!choices.length) { outcome = "stuck"; break; }
        try { makeChoice(pick(choices)); }
        catch (error) { errors.push(id + ": " + String(error && error.message).slice(0, 100)); outcome = "threw"; break; }
      }
      if (outcome === "ended") ended++; else if (outcome === "stuck") stuck++; else if (outcome === "capped") capped++;
      for (const [lap, seen] of Object.entries(laps)) {
        if (seen.length > 1) repeats.push({ lap, times: seen.length, run: r, runSeed, steps: seen.map(s => s.step), delta: seen[0].delta });
      }
    }
    return { chunkSeed: ${chunkSeed}, repeats, errors, ended, stuck, capped };
  })())`, 600_000));
}

const started = Date.now();
const found = new Map(); // cycle -> { lap, runs: [...] }
const errors = [];
const totals = { runs: 0, ended: 0, stuck: 0, capped: 0 };
for (const picker of PICKERS) {
  let runtime = null;
  for (let chunk = 0; chunk * CHUNK < RUNS_PER_PICKER; chunk++) {
    if (chunk % RELOAD_EVERY === 0) runtime = loadGame(ROOT); // fresh realm keeps the run fast
    const runs = Math.min(CHUNK, RUNS_PER_PICKER - chunk * CHUNK);
    const out = playChunk(runtime, picker, chunk, runs);
    totals.runs += runs;
    totals.ended += out.ended;
    totals.stuck += out.stuck;
    totals.capped += out.capped;
    out.errors.forEach(message => errors.push(`${picker} chunk ${chunk} (seed ${out.chunkSeed}): ${message}`));
    for (const repeat of out.repeats) {
      const cycle = cycleKey(repeat.lap);
      if (!found.has(cycle)) found.set(cycle, { lap: allowedByCycle.get(cycle)?.lap || repeat.lap, runs: [] });
      const entry = found.get(cycle);
      const already = entry.runs.find(run => run.picker === picker && run.chunk === chunk && run.run === repeat.run);
      if (already) already.times = Math.max(already.times, repeat.times); // same loop seen from another scene on it
      else entry.runs.push({ picker, chunk, chunkSeed: out.chunkSeed, ...repeat });
    }
  }
}

const formatDelta = delta => {
  const parts = Object.entries(delta).map(([k, v]) => `${k} ${v > 0 ? "+" : ""}${v}`);
  return parts.length ? parts.join(", ") : "no resource or lean change";
};
const failures = [];
const allowedSeen = [];
for (const [cycle, entry] of found) {
  const allowed = allowedByCycle.get(cycle);
  const pickers = [...new Set(entry.runs.map(run => run.picker))].join("+");
  const lines = [
    `  ${entry.lap}`,
    `    repeats in ${entry.runs.length} run(s) [${pickers}]; worst ${Math.max(...entry.runs.map(run => run.times))}x in one run`
  ];
  for (const run of entry.runs.slice(0, 5)) {
    lines.push(`    ${run.picker} picker, chunk seed ${run.chunkSeed}, run ${run.run} (run-start LCG seed ${run.runSeed}): ${run.times}x as "${run.lap}" from steps ${run.steps.join(", ")}; one lap: ${formatDelta(run.delta)}`);
  }
  if (entry.runs.length > 5) lines.push(`    ... ${entry.runs.length - 5} more run(s)`);
  if (allowed) allowedSeen.push(`${lines.join("\n")}\n    allowlisted: ${allowed.reason}`);
  else failures.push(lines.join("\n"));
}
// Sampling is seeded but finite: an allowlisted lap that did not show up this time may still
// exist, so a missing one is reported for the next editor, not failed.
const unseen = [...allowedByCycle].filter(([cycle]) => !found.has(cycle)).map(([, { lap, reason }]) => `  ${lap} (${reason})`);
const seconds = ((Date.now() - started) / 1000).toFixed(1);
const summary = `${totals.runs} seeded runs (${RUNS_PER_PICKER} random + ${RUNS_PER_PICKER} cheapest): ${totals.ended} reached the ending, ${totals.stuck} stuck, ${totals.capped} hit the ${MAX_STEPS}-step cap, ${errors.length} threw; ${seconds}s`;

if (allowedSeen.length) console.log(`allowlisted repeating laps (still repeating):\n${allowedSeen.join("\n")}`);
if (unseen.length) console.log(`NOTE allowlisted laps not seen in this sample (delete the entry once its fix lands):\n${unseen.join("\n")}`);
const problems = [];
if (errors.length) problems.push(`choices threw during seeded play:\n  ${errors.join("\n  ")}`);
if (failures.length) problems.push(`the same lap repeated inside one run:\n${failures.join("\n")}`);
if (problems.length) {
  console.error(`FAIL sun-playerflow-no-repeat-lap: ${summary}\n${problems.join("\n")}`);
  process.exitCode = 1;
} else {
  console.log(`PASS sun-playerflow-no-repeat-lap: ${summary}; no unlisted lap repeats (${allowedSeen.length} allowlisted seen)`);
}
