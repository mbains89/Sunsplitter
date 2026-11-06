#!/usr/bin/env node
// SUN-REACTION-REPORT-01: how often does the player's decision get no visible answer?
//
// This is a measurement tool, not a CI check. It is named outside the sun-playerflow-*-checks.mjs
// glob on purpose. It measures the "orders get answers" work: ROADMAP proposal D13 and lock
// proposal L-057.
//
// Method: seeded runs through the real engine from a fresh campaign. Tomas, Jiro and Vess start
// missing and are recovered only by their own scenes, as in real play. At every screen with two
// or more enabled choices, the tool snapshots the run (the state, the seeded RNG, and every
// top-level `let`/`var` the game scripts declare), plays each enabled option from that snapshot,
// and records the next scene and the next screen's story text. Tags are stripped, whitespace is
// collapsed and every digit run becomes "#", so a changed number alone is not a reaction. It
// restores the snapshot after each option. Then it re-renders the screen and restores once more,
// so play continues from exactly the state the player saw, and it checks that the re-rendered
// screen (story and choice buttons) is identical to the one shown before the trials.
//
// A decision is classified as:
//   no reaction       every option leads to the same next scene AND the same normalised text
//   same next scene   every option leads to the same next scene (no-reaction decisions included)
//   fully different   every option gives a different next-screen text
//
// After each chunk it replays the same seeds without measuring, in a fresh runtime, and exits 1
// if any run's path or final state differs. That proves the trials left nothing behind.
//
// Usage: node scripts/sun-reaction-report.mjs [--runs N] [--seed S] [--json out.json]
//          [--scenes a,b,c] [--max-percent P]
//   --runs N         seeded runs to play (default 40)
//   --seed S         base seed; chunk k of 10 runs uses seed S + k (default 99000)
//   --json FILE      also write the summary, per-scene table and every sampled decision as JSON
//   --scenes a,b,c   sample decisions only at these scene ids (play still goes everywhere)
//   --max-percent P  exit 1 when the overall no-reaction share is above P percent (for later CI)
import { readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadGame, readScriptManifest } from "./simulate.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CHUNK = 10;
const MAX_STEPS = 700;

function usage(message) {
  if (message) console.error(`sun-reaction-report: ${message}`);
  console.error("usage: node scripts/sun-reaction-report.mjs [--runs N] [--seed S] [--json out.json] [--scenes a,b,c] [--max-percent P]");
  process.exit(2);
}

function parseArgs(argv) {
  const options = { runs: 40, seed: 99000, json: null, scenes: null, maxPercent: null };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const value = () => {
      if (i + 1 >= argv.length) usage(`${arg} needs a value`);
      return argv[++i];
    };
    if (arg === "--runs") options.runs = Number(value());
    else if (arg === "--seed") options.seed = Number(value());
    else if (arg === "--json") options.json = value();
    else if (arg === "--scenes") options.scenes = value().split(",").map(id => id.trim()).filter(Boolean);
    else if (arg === "--max-percent") options.maxPercent = Number(value());
    else if (arg === "--help" || arg === "-h") usage();
    else usage(`unknown argument: ${arg}`);
  }
  if (!Number.isInteger(options.runs) || options.runs < 1) usage("--runs must be a positive integer");
  if (!Number.isInteger(options.seed) || options.seed < 0) usage("--seed must be a non-negative integer");
  if (options.maxPercent !== null && !(options.maxPercent >= 0 && options.maxPercent <= 100)) usage("--max-percent must be between 0 and 100");
  if (options.scenes && !options.scenes.length) usage("--scenes needs at least one scene id");
  return options;
}

// Every top-level `let`/`var` in the loaded game scripts. They live in the realm's global lexical
// scope, outside `state` (for example scenes-10's act2TetherAllusionsOnEntry, which a scene's
// text reads), so a trial could change them. They are saved and restored with the state.
function moduleBindings(root) {
  const names = new Set();
  for (const path of readScriptManifest(root).scripts) {
    const source = readFileSync(resolve(root, path), "utf8");
    for (const match of source.matchAll(/^(?:let|var)\s+([A-Za-z_$][\w$]*)/gm)) names.add(match[1]);
  }
  return [...names].sort();
}

function playChunk(runtime, { chunkSeed, runs, measure, scenes, bindings }) {
  const take = bindings.map(name => `${JSON.stringify(name)}: copy(${name})`).join(", ");
  const put = bindings.map(name => `${name} = copy(saved[${JSON.stringify(name)}]);`).join(" ");
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
    const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
    Math.random = rnd;
    const MEASURE = ${measure};
    const ONLY = ${JSON.stringify(scenes)};
    const only = ONLY ? new Set(ONLY) : null;
    const enabled = c => c && (!c.alive || isAlive(c.alive)) &&
      (!c.aliveAll || c.aliveAll.every(k => isAlive(k))) &&
      (!c.aliveAny || c.aliveAny.some(k => isAlive(k))) &&
      (!c.requires || meetsRequirements(c.requires)) && (!c.effects || canAffordEffects(c.effects));
    const enabledAt = id => {
      const scene = scenes[id];
      return ((typeof scene.choices === "function" ? scene.choices() : scene.choices) || []).filter(enabled);
    };
    // A choice's reply (proposed L-057) opens the next screen once and is consumed by that
    // render, so a re-render after restore cannot show it. Compare the screen without it.
    const withoutReply = html => String(html || "").replace(/<p class="choice-reply">[\\s\\S]*?<\\/p>/g, "");
    const screenNow = () => withoutReply(document.getElementById("story").innerHTML) + "\u0000" +
      Array.from(choicesEl.children).map(button => button.innerHTML + (button.disabled ? "[disabled]" : "")).join("\u0000");
    const norm = html => String(html || "").replace(/<[^>]+>/g, " ").replace(/\\d+/g, "#").replace(/\\s+/g, " ").trim();
    const nextScreen = () => state.scene === "ending_check"
      ? "END:" + norm(document.getElementById("ending-title").textContent)
      : norm(document.getElementById("story").innerHTML);
    // Plain data is copied so a trial cannot edit the saved copy; anything else (timers,
    // DOM handles) is kept by reference.
    const copy = value => {
      if (value === null || typeof value !== "object") return value;
      const proto = Object.getPrototypeOf(value);
      if (!Array.isArray(value) && proto !== Object.prototype && proto !== null) return value;
      try { return JSON.parse(JSON.stringify(value)); } catch (error) { return value; }
    };
    const snapshot = () => ({ state: JSON.stringify(state), seed, bindings: { ${take} } });
    const restore = snap => {
      replaceRunState(JSON.parse(snap.state));
      seed = snap.seed;
      const saved = snap.bindings;
      ${put}
    };
    const rows = [], runsOut = [], errors = [];
    for (let r = 0; r < ${runs}; r++) {
      resetRunState();
      showScene("wake");
      const path = [];
      let outcome = "capped";
      for (let step = 0; step < ${MAX_STEPS}; step++) {
        const id = state.scene;
        path.push(id);
        if (id === "ending_check" || !scenes[id]) { outcome = "ended"; break; }
        let choices = enabledAt(id);
        if (!choices.length) { outcome = "stuck"; break; }
        if (MEASURE && choices.length >= 2 && (!only || only.has(id))) {
          const snap = snapshot();
          const before = screenNow();
          const texts = choices.map(c => c.text);
          const nextScenes = [], screens = [];
          for (let i = 0; i < texts.length; i++) {
            restore(snap);
            const fresh = enabledAt(id);
            if (fresh.length !== texts.length || !fresh[i] || fresh[i].text !== texts[i]) {
              errors.push(id + ": enabled choices changed after restore (option " + (i + 1) + ")");
              nextScenes.push("?"); screens.push("?");
              continue;
            }
            makeChoice(fresh[i]);
            nextScenes.push(state.scene);
            screens.push(nextScreen());
            cancelCinematic();
          }
          // Back to the screen the player is on: state, RNG, bindings, then the DOM, then the
          // state again in case rendering the text or choices wrote to it.
          restore(snap);
          showScene(id, { skipOnEnter: true });
          restore(snap);
          if (screenNow() !== before) errors.push(id + ": the screen differs after restore (run " + r + ", step " + step + ")");
          const distinctScene = new Set(nextScenes).size;
          const distinctText = new Set(screens).size;
          rows.push({ run: r, step, id, options: texts.length, nextScenes, distinctScene, distinctText });
          choices = enabledAt(id);
        }
        try { makeChoice(choices[Math.floor(rnd() * choices.length)]); }
        catch (error) { errors.push(id + ": " + String(error && error.message).slice(0, 120)); outcome = "threw"; break; }
      }
      cancelCinematic();
      runsOut.push({ outcome, path, finalState: JSON.stringify(state) });
    }
    return { rows, runs: runsOut, errors };
  })())`, 1_800_000));
}

function gitHead(root) {
  const result = spawnSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" });
  return result.status === 0 ? result.stdout.trim() : null;
}

const options = parseArgs(process.argv.slice(2));
const started = Date.now();
const bindings = moduleBindings(ROOT);
const rows = [];
const errors = [];
const outcomes = { ended: 0, stuck: 0, capped: 0, threw: 0 };
const knownScenes = new Set(loadGame(ROOT).sceneIds);
const unknownScenes = (options.scenes || []).filter(id => !knownScenes.has(id));
if (unknownScenes.length) usage(`unknown scene id(s): ${unknownScenes.join(", ")}`);
for (let chunk = 0; chunk * CHUNK < options.runs; chunk++) {
  const runs = Math.min(CHUNK, options.runs - chunk * CHUNK);
  const chunkSeed = options.seed + chunk;
  const measured = playChunk(loadGame(ROOT), { chunkSeed, runs, measure: true, scenes: options.scenes, bindings });
  const plain = playChunk(loadGame(ROOT), { chunkSeed, runs, measure: false, scenes: null, bindings });
  measured.runs.forEach((run, index) => {
    outcomes[run.outcome]++;
    const other = plain.runs[index];
    if (run.path.join(">") !== other.path.join(">") || run.finalState !== other.finalState) {
      const at = run.path.findIndex((id, step) => id !== other.path[step]);
      errors.push(`measurement changed play: seed ${chunkSeed} run ${index} diverges ${at === -1 ? "in final state" : `at step ${at} (${run.path[at]} vs ${other.path[at]})`}`);
    }
  });
  measured.errors.forEach(message => errors.push(`seed ${chunkSeed}: ${message}`));
  rows.push(...measured.rows.map(row => ({ chunkSeed, ...row })));
}

const pct = (n, d) => (d ? (100 * n) / d : 0);
const fmt = (n, d) => `${pct(n, d).toFixed(1)}% (${n}/${d})`;
const isSame = row => row.distinctScene === 1;
const isNone = row => row.distinctScene === 1 && row.distinctText === 1;
const isFull = row => row.distinctText === row.options;
const totals = {
  decisions: rows.length,
  noReaction: rows.filter(isNone).length,
  sameNextScene: rows.filter(isSame).length,
  fullyDifferent: rows.filter(isFull).length
};
const perSceneMap = new Map();
for (const row of rows) {
  const entry = perSceneMap.get(row.id) || { id: row.id, sampled: 0, noReaction: 0, sameNextScene: 0, fullyDifferent: 0 };
  entry.sampled++;
  if (isNone(row)) entry.noReaction++;
  if (isSame(row)) entry.sameNextScene++;
  if (isFull(row)) entry.fullyDifferent++;
  perSceneMap.set(row.id, entry);
}
const perScene = [...perSceneMap.values()].sort((a, b) =>
  b.noReaction - a.noReaction || pct(b.noReaction, b.sampled) - pct(a.noReaction, a.sampled) ||
  b.sampled - a.sampled || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
const seconds = ((Date.now() - started) / 1000).toFixed(1);
const source = gitHead(ROOT);
const noReactionPercent = Number(pct(totals.noReaction, totals.decisions).toFixed(1));

console.log(`sun-reaction-report: source ${source ? source.slice(0, 8) : "unknown"}, ${options.runs} runs from seed ${options.seed}${options.scenes ? `, scenes ${options.scenes.join(",")}` : ""}, ${seconds}s`);
console.log(`runs: ${outcomes.ended} reached the ending, ${outcomes.stuck} stuck, ${outcomes.capped} hit the ${MAX_STEPS}-step cap, ${outcomes.threw} threw`);
console.log(`decisions sampled (screens with 2+ enabled choices): ${totals.decisions}`);
console.log(`no reaction (same next scene AND same words, numbers ignored): ${fmt(totals.noReaction, totals.decisions)}`);
console.log(`same next scene whatever you pick:                            ${fmt(totals.sameNextScene, totals.decisions)}`);
console.log(`fully different (every option gives different next words):     ${fmt(totals.fullyDifferent, totals.decisions)}`);
console.log("");
const width = Math.max(8, ...perScene.map(entry => entry.id.length));
console.log(`${"scene".padEnd(width)}  sampled  no-reaction  same-scene  fully-different`);
for (const entry of perScene) {
  console.log(`${entry.id.padEnd(width)}  ${String(entry.sampled).padStart(7)}  ${String(entry.noReaction).padStart(11)}  ${String(entry.sameNextScene).padStart(10)}  ${String(entry.fullyDifferent).padStart(15)}`);
}

if (options.json) {
  writeFileSync(resolve(options.json), `${JSON.stringify({
    tool: "sun-reaction-report",
    ticket: "SUN-REACTION-REPORT-01",
    source,
    runs: options.runs,
    seed: options.seed,
    scenes: options.scenes,
    outcomes,
    totals: { ...totals, noReactionPercent },
    perScene,
    decisions: rows,
    errors
  }, null, 2)}\n`);
  console.log(`\nwrote ${resolve(options.json)}`);
}

let exitCode = 0;
if (errors.length) {
  console.error(`\nERROR the measurement is not trustworthy:\n  ${errors.slice(0, 20).join("\n  ")}${errors.length > 20 ? `\n  ... ${errors.length - 20} more` : ""}`);
  exitCode = 1;
}
if (options.maxPercent !== null && noReactionPercent > options.maxPercent) {
  console.error(`\nFAIL no-reaction ${noReactionPercent}% is above --max-percent ${options.maxPercent}%`);
  exitCode = 1;
}
process.exitCode = exitCode;
