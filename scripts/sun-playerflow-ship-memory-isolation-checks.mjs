// SUN-MEMORY-STORE-01 (L-054) — the ship memory never changes an outcome (design §2).
//
// Static: the storage key is named only in src/ship-memory.js (and the src/state.js header registry
// comment); shipMemoryRead( is called only inside the five allowlisted surface functions; no scene
// file or state.js code names shipMemory; the save, rule and ending-text functions do not read it;
// resolveEnding only calls the run recorder, after the ending text is set; the engine's hooks are
// the four guarded recorder calls and the three guarded ship-remembers line calls
// (SUN-SHIP-REMEMBERS-01); src/ship-memory.js draws no random numbers.
//
// Dynamic (paired): seeded real-play runs (no-repeat-lap runner pattern: fresh campaign, recovery
// only through its own scenes, seeded Math.imul LCG for the game and the picker, #choices cleared
// between screens) played three times — memory empty, full (all endings, all crew lost, every
// plate, every fork branch, a full trail) and corrupt. Per run: the same scene path, story text,
// plate, rendered choices (text, enabled, reason) at every screen, the same final state, ending
// title and text, and What Remains text. The only difference allowed (design §2): one
// <p class="ship-remembers"> on the fresh wake screen, present with memory full, absent with memory
// empty or corrupt, and on no other screen.
// SHIP_MEMORY_ISOLATION_RUNS overrides the run count (default 200).
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadGame, readScriptManifest } from "./simulate.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const KEY = "sunsplitter_ship_memory_v1";
const RUNS = Number(process.env.SHIP_MEMORY_ISOLATION_RUNS) || 200;
const CHUNK = 20;
const RELOAD_EVERY = 5;
const MAX_STEPS = 700;
const SEED = 54;
const SURFACE_READERS = ["renderGallery", "renderMemoryBoard", "shipRemembersTitleLine", "shipRemembersToneLine", "shipRemembersWakeLine"];
const ENGINE_HOOKS = ["shipMemoryNotePlate", "shipMemoryNoteScene", "shipMemoryClearTrail", "shipMemoryRecordRun"];
// SUN-SHIP-REMEMBERS-01: the engine places the three lines; it calls each reader only behind a typeof guard.
const ENGINE_LINE_HOOKS = ["shipRemembersTitleLine", "shipRemembersToneLine", "shipRemembersWakeLine"];
const REMEMBERS_RE = /<p class="ship-remembers">[^<]*<\/p>/g;
// Functions that decide or print outcomes, or carry the run save: none may name the memory.
const MUST_NOT_READ = ["snapshotState", "applySnapshot", "validImportedSnapshot", "buildSaveExport", "persistSave",
  "whatRemainsFacts", "crewEpilogues", "meetsRequirements", "canAffordEffects", "showWhatRemains"];

// Remove comments, keeping strings, template literals and line breaks. Good enough for this source.
function stripComments(source) {
  let out = "";
  let i = 0;
  let quote = null;
  while (i < source.length) {
    const ch = source[i];
    const next = source[i + 1];
    if (quote) {
      out += ch;
      if (ch === "\\") { out += next || ""; i += 2; continue; }
      if (ch === quote) quote = null;
      i++;
      continue;
    }
    if (ch === "/" && next === "/") { while (i < source.length && source[i] !== "\n") i++; continue; }
    if (ch === "/" && next === "*") {
      const end = source.indexOf("*/", i + 2);
      const block = source.slice(i, end < 0 ? source.length : end + 2);
      out += block.replace(/[^\n]/g, "");
      i = end < 0 ? source.length : end + 2;
      continue;
    }
    if (ch === "\"" || ch === "'" || ch === "`") quote = ch;
    out += ch;
    i++;
  }
  return out;
}

// The body of `function name(` in comment-stripped source, by brace matching outside strings.
function functionBody(code, name) {
  const match = new RegExp(`(?:^|\\n)\\s*(?:async\\s+)?function\\s+${name}\\s*\\(`).exec(code);
  if (!match) return null;
  let i = code.indexOf("{", match.index + match[0].length);
  // Skip a destructured parameter list: the body brace follows the closing parenthesis.
  const close = code.indexOf(")", match.index + match[0].length);
  if (close >= 0 && close > i) i = code.indexOf("{", close);
  let depth = 0;
  let quote = null;
  for (let j = i; j < code.length; j++) {
    const ch = code[j];
    if (quote) {
      if (ch === "\\") { j++; continue; }
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === "\"" || ch === "'" || ch === "`") { quote = ch; continue; }
    if (ch === "{") depth++;
    else if (ch === "}" && --depth === 0) return code.slice(i, j + 1);
  }
  return null;
}

// Name of the function whose body contains offset `at`, or null.
function enclosingFunction(code, at) {
  const re = /(?:^|\n)\s*(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/g;
  let found = null;
  for (let m; (m = re.exec(code)) && m.index < at;) {
    const body = functionBody(code, m[1]);
    if (!body) continue;
    const start = code.indexOf(body, m.index);
    if (start <= at && at < start + body.length) found = m[1];
  }
  return found;
}

export function shipMemoryIsolationStaticChecks(root = ROOT) {
  const errors = [];
  const srcFiles = readdirSync(resolve(root, "src")).filter(name => name.endsWith(".js")).map(name => `src/${name}`);
  const loaded = readScriptManifest(root).scripts;
  if (!loaded.includes("src/ship-memory.js")) errors.push("index.html does not load src/ship-memory.js");
  const raw = Object.fromEntries(srcFiles.map(path => [path, readFileSync(resolve(root, path), "utf8")]));
  const code = Object.fromEntries(srcFiles.map(path => [path, stripComments(raw[path])]));

  for (const path of srcFiles) {
    if (path === "src/ship-memory.js") continue;
    if (code[path].includes("sunsplitter_ship_memory")) errors.push(`${path} names the ship memory key in code`);
    if (raw[path].includes("sunsplitter_ship_memory") && path !== "src/state.js") errors.push(`${path} names the ship memory key`);
  }
  if (!code["src/ship-memory.js"].includes(`"${KEY}"`)) errors.push("src/ship-memory.js does not own the key");
  if (!raw["src/state.js"].includes(KEY)) errors.push("src/state.js header registry does not list the key");
  if (/\bMath\s*\.\s*random\b/.test(raw["src/ship-memory.js"])) errors.push("src/ship-memory.js names Math.random");

  for (const path of srcFiles) {
    const text = code[path];
    for (const m of text.matchAll(/\bshipMemoryRead\s*\(/g)) {
      if (/function\s+$/.test(text.slice(Math.max(0, m.index - 12), m.index))) continue; // the definition
      const owner = enclosingFunction(text, m.index);
      if (!SURFACE_READERS.includes(owner)) errors.push(`${path}: shipMemoryRead( called in ${owner || "top level"}, not an allowlisted surface`);
    }
    if ((/^src\/scenes-\d+\.js$/.test(path) || path === "src/state.js") && /shipMemory|SHIP_MEMORY/.test(text)) {
      errors.push(`${path} references the ship memory in code`);
    }
  }

  const engineFiles = srcFiles.filter(path => /^src\/engine(?:-[a-z0-9]+)*\.js$/.test(path));
  const engineCode = engineFiles.map(path => code[path]).join("\n");
  for (const name of MUST_NOT_READ) {
    const owner = engineFiles.concat("src/state.js").find(path => functionBody(code[path], name));
    if (!owner) { errors.push(`could not find function ${name}`); continue; }
    const body = functionBody(code[owner], name);
    if (/shipMemory|SHIP_MEMORY/.test(body)) errors.push(`${name} (${owner}) references the ship memory`);
  }
  const ending = engineFiles.map(path => functionBody(code[path], "resolveEnding")).find(Boolean);
  if (!ending) errors.push("could not find resolveEnding");
  else {
    const refs = [...ending.matchAll(/\b(shipMemory\w*|SHIP_MEMORY\w*|shipRemembers\w*|SHIP_REMEMBERS\w*)/g)].map(m => m[1]);
    if (refs.some(ref => ref !== "shipMemoryRecordRun")) errors.push(`resolveEnding references ${refs.join(", ")}`);
    const recordAt = ending.lastIndexOf("shipMemoryRecordRun(");
    const textAt = ending.indexOf('getElementById("ending-text").textContent = text');
    if (recordAt < 0) errors.push("resolveEnding does not record the run");
    else if (textAt < 0 || recordAt < textAt) errors.push("resolveEnding records the run before the ending text is set");
  }
  for (const m of engineCode.matchAll(/\b(shipMemory\w*|SHIP_MEMORY\w*|shipRemembers\w*|SHIP_REMEMBERS\w*)/g)) {
    if (!ENGINE_HOOKS.includes(m[1]) && !ENGINE_LINE_HOOKS.includes(m[1])) errors.push(`engine references ${m[1]}, not one of the recorder or line hooks`);
  }
  for (const name of MUST_NOT_READ.concat("resolveEnding", "showWhatRemains", "showCinematic")) {
    const owner = engineFiles.find(path => functionBody(code[path], name));
    const body = owner && functionBody(code[owner], name);
    if (body && /shipRemembers|wakeRemembersArmed/.test(body)) errors.push(`${name} (${owner}) places a ship-remembers line`);
  }
  for (const hook of ENGINE_LINE_HOOKS) {
    const calls = [...engineCode.matchAll(new RegExp(`\\b${hook}\\s*\\(`, "g"))].length;
    const guards = [...engineCode.matchAll(new RegExp(`typeof\\s+${hook}\\s*===\\s*"function"\\s*\\?\\s*${hook}\\s*\\(`, "g"))].length;
    if (calls !== 1) errors.push(`engine calls ${hook} ${calls} times, expected once`);
    else if (guards !== 1) errors.push(`engine calls ${hook} without the typeof guard`);
  }
  for (const hook of ENGINE_HOOKS) {
    const calls = [...engineCode.matchAll(new RegExp(`\\b${hook}\\s*\\(`, "g"))].length;
    const guards = [...engineCode.matchAll(new RegExp(`typeof\\s+${hook}\\s*===\\s*"function"\\s*\\)\\s*${hook}\\s*\\(`, "g"))].length;
    if (!calls) errors.push(`engine never calls ${hook}`);
    else if (calls !== guards) errors.push(`engine calls ${hook} without the typeof guard`);
  }
  return errors;
}

function fullMemory(root) {
  const plates = readdirSync(resolve(root, "images"))
    .filter(name => /^[a-z0-9_]+\.jpg$/.test(name) && !name.startsWith("art_r2_"))
    .map(name => name.replace(/\.jpg$/, ""))
    .slice(0, 256);
  return {
    v: 1,
    runs: 40,
    endings: { long_dark: 9, fracture: 7, quiet_ship: 6, still_burning: 6, living_ship: 5, landfall: 4, yellow_circle: 3 },
    lost: { rourke: 40, lena: 12, elias: 9, mira: 8, tomas: 7, amara: 6, jiro: 5, sela: 4, vess: 3 },
    plates,
    forks: {
      crisis: { breath: 20, custody: 20 },
      vault: { future: 15, living: 15, split: 10 },
      tether: { slow: 20, hard: 20 },
      lethal: { lena: { lived: 5, lost: 5 }, tomas: { lived: 3, lost: 3 }, elias: { lived: 4, lost: 4 }, mira: { lived: 2, lost: 2 } },
      final: { hold: 10, comfort: 10, transmission: 10, endure: 10 }
    },
    last: { ending: "yellow_circle", lost: ["rourke", "lena", "elias", "mira", "tomas", "amara", "jiro", "sela", "vess"],
      forks: { crisis: "custody", vault: "split", tether: "hard", lethal: { lena: "lost", tomas: "lived", elias: "lost", mira: "lived" }, final: "endure" } },
    prints: ["00000001", "00000002", "00000003", "00000004", "00000005", "00000006", "00000007", "00000008"],
    trail: ["act3_lethal_lena_clock", "act3_lethal_lena_end", "act3_lethal_tomas_cost", "act3_lethal_tomas_end",
      "act3_lethal_elias_order", "act3_lethal_elias_end", "act3_lethal_mira_board", "act3_lethal_mira_end"]
  };
}

const MODES = {
  empty: null,
  full: JSON.stringify(fullMemory(ROOT)),
  corrupt: "{\"v\":1,\"runs\":3,\"endings\":{\"long_dark\":"
};

function playChunk(runtime, mode, chunk, runs) {
  const chunkSeed = SEED * 1000 + chunk;
  return JSON.parse(runtime.evaluate(`JSON.stringify((() => {
    persistSave = () => true;
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
    const rnd = () => { seed = (Math.imul(seed, 1103515245) + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
    Math.random = rnd;
    const enabled = c => c && (!c.alive || isAlive(c.alive)) &&
      (!c.aliveAll || c.aliveAll.every(k => isAlive(k))) &&
      (!c.aliveAny || c.aliveAny.some(k => isAlive(k))) &&
      (!c.requires || meetsRequirements(c.requires)) && (!c.effects || canAffordEffects(c.effects));
    const memoryValue = ${JSON.stringify(MODES[mode])};
    const setMemory = () => {
      if (memoryValue === null) localStorage.removeItem(${JSON.stringify(KEY)});
      else localStorage.setItem(${JSON.stringify(KEY)}, memoryValue);
    };
    const remembered = [];
    const screen = () => {
      const img = document.getElementById("scene-image");
      // SUN-SHIP-REMEMBERS-01: the wake line is lifted out and reported per screen, so the rest compares.
      const story = document.getElementById("story").innerHTML;
      remembered.push((story.match(${REMEMBERS_RE}) || []).length);
      return [state.scene, story.replace(${REMEMBERS_RE}, ""),
        img && typeof img.__ssManagedSource === "string" ? img.__ssManagedSource : "",
        Array.from(choicesEl.children).map(b => [b.innerHTML, !!b.disabled])];
    };
    const out = [];
    for (let r = 0; r < ${runs}; r++) {
      setMemory();
      const runSeed = seed;
      beginFreshCampaign({ persist: false });
      const screens = [screen()];
      let outcome = "capped";
      for (let step = 0; step < ${MAX_STEPS}; step++) {
        const id = state.scene;
        if (id === "ending_check") { outcome = "ended"; break; }
        const scene = scenes[id];
        if (!scene) { outcome = "missing"; break; }
        const choices = ((typeof scene.choices === "function" ? scene.choices() : scene.choices) || []).filter(enabled);
        if (!choices.length) { outcome = "stuck"; break; }
        try { makeChoice(choices[Math.floor(rnd() * choices.length)]); }
        catch (error) { outcome = "threw " + String(error && error.message).slice(0, 80); break; }
        screens.push(screen());
      }
      const snap = snapshotState();
      delete snap.savedAt;
      let remains = ["", ""];
      if (outcome === "ended") {
        showWhatRemains();
        remains = [document.getElementById("what-remains-text").textContent, document.getElementById("what-remains-crew").textContent];
      }
      const memory = shipMemoryRead();
      out.push({
        runSeed, outcome, steps: screens.length,
        transcript: JSON.stringify({ screens, snap,
          ending: outcome === "ended" ? [document.getElementById("ending-title").textContent, document.getElementById("ending-text").textContent] : null,
          remains }),
        recorded: { runs: memory.runs, plates: memory.plates.length, trail: memory.trail.length },
        remembered: remembered.splice(0)
      });
    }
    return out;
  })())`, 600_000));
}

export function shipMemoryIsolationDynamicChecks() {
  const errors = [];
  const results = {};
  for (const mode of Object.keys(MODES)) {
    results[mode] = [];
    let runtime = null;
    for (let chunk = 0; chunk * CHUNK < RUNS; chunk++) {
      if (chunk % RELOAD_EVERY === 0) runtime = loadGame(ROOT);
      const runs = Math.min(CHUNK, RUNS - chunk * CHUNK);
      for (const run of playChunk(runtime, mode, chunk, runs)) {
        results[mode].push({
          chunk, runSeed: run.runSeed, outcome: run.outcome, steps: run.steps, recorded: run.recorded, remembered: run.remembered,
          digest: createHash("sha256").update(run.transcript).digest("hex")
        });
      }
    }
  }
  const base = results.empty;
  let ended = 0;
  for (let i = 0; i < base.length; i++) {
    const run = base[i];
    if (run.outcome === "ended") {
      ended++;
      // The hooks really ran: an empty store gained this run, its plates, and a cleared trail.
      if (run.recorded.runs !== 1 || run.recorded.plates < 5 || run.recorded.trail !== 0) {
        errors.push(`empty-store run ${i} (chunk ${run.chunk}, seed ${run.runSeed}) did not record as expected: ${JSON.stringify(run.recorded)}`);
      }
    } else errors.push(`empty-store run ${i} (chunk ${run.chunk}, seed ${run.runSeed}) did not end: ${run.outcome}`);
    for (const mode of ["empty", "full", "corrupt"]) {
      const got = results[mode][i] && results[mode][i].remembered;
      const want = mode === "full" ? 1 : 0;
      // The first screen is the fresh wake; every later screen follows a committed choice.
      if (!got || got[0] !== want || got.slice(1).some(n => n !== 0)) {
        errors.push(`run ${i} (seed ${run.runSeed}) with memory ${mode}: ship-remembers lines per screen ${JSON.stringify((got || []).slice(0, 4))}..., expected ${want} on the fresh wake and none after`);
      }
    }
    for (const mode of ["full", "corrupt"]) {
      const other = results[mode][i];
      if (!other || other.digest !== run.digest || other.outcome !== run.outcome) {
        errors.push(`run ${i} (chunk ${run.chunk}, seed ${run.runSeed}) differs with memory ${mode}: ` +
          `${run.outcome}/${run.steps} screens vs ${other ? `${other.outcome}/${other.steps}` : "missing"}`);
      }
    }
  }
  return { errors, ended, runs: base.length, screens: base.reduce((sum, run) => sum + run.steps, 0) };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const started = Date.now();
  const staticErrors = shipMemoryIsolationStaticChecks();
  const dynamic = shipMemoryIsolationDynamicChecks();
  const errors = [...staticErrors, ...dynamic.errors];
  const seconds = ((Date.now() - started) / 1000).toFixed(1);
  if (errors.length) {
    console.error(`FAIL sun-playerflow-ship-memory-isolation (${seconds}s)`);
    errors.slice(0, 40).forEach(error => console.error(" - " + error));
    if (errors.length > 40) console.error(` - ... ${errors.length - 40} more`);
    process.exit(1);
  }
  console.log(`PASS sun-playerflow-ship-memory-isolation (static allowlist; ${dynamic.runs} seeded runs x memory empty/full/corrupt, ` +
    `${dynamic.ended} ended, ${dynamic.screens} screens each: identical path, text, plates, choices, final state, endings and What Remains; ` +
    `the one difference is the fresh wake's ship-remembers line with memory full; ${seconds}s)`);
}
