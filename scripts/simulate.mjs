#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import vm from "node:vm";

export const POLICY_NAMES = ["living", "future", "pragmatic"];
export const EXPECTED_SCENE_COUNT = 207;

const POLICY_ALIASES = new Map([
  ["living", "living"],
  ["living-aligned", "living"],
  ["future", "future"],
  ["future-aligned", "future"],
  ["mixed", "pragmatic"],
  ["pragmatic", "pragmatic"],
  ["mixed/pragmatic", "pragmatic"]
]);

const SCRIPT_TAG_RE = /<script\b[^>]*\bsrc\s*=\s*(["'])([^"']+)\1[^>]*><\/script>/gi;
const RESOURCE_KEYS = ["survivors", "integrity", "cohesion", "supplies", "embryos"];
const CREW_KEYS = ["lena", "elias", "mira", "tomas", "amara", "jiro", "sela", "vess", "rourke"];
const PROMISE_STATES = new Set(["made", "declined", "kept", "broken"]);

class ClassList {
  constructor() {
    this.values = new Set();
  }

  add(...names) {
    names.forEach(name => this.values.add(name));
  }

  remove(...names) {
    names.forEach(name => this.values.delete(name));
  }

  contains(name) {
    return this.values.has(name);
  }

  toggle(name, force) {
    const enabled = force === undefined ? !this.values.has(name) : !!force;
    if (enabled) this.values.add(name);
    else this.values.delete(name);
    return enabled;
  }
}

class ElementStub {
  constructor(id = "") {
    this.id = id;
    this.textContent = "";
    this.innerHTML = "";
    this.className = "";
    this.classList = new ClassList();
    this.children = [];
    this.attributes = new Map();
    this.disabled = false;
    this.onclick = null;
    this.scrollTop = 0;
    this.src = "";
    this.alt = "";
    this.type = "";
  }

  appendChild(child) {
    this.children.push(child);
    return child;
  }

  addEventListener() {}

  removeAttribute(name) {
    this.attributes.delete(name);
    if (name === "src") this.src = "";
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }

  getAttribute(name) {
    return this.attributes.get(name) ?? null;
  }

  querySelectorAll() {
    return [];
  }
}

function createBrowserStubs() {
  const elements = new Map();
  const storage = new Map();
  const getElementById = id => {
    if (!elements.has(id)) elements.set(id, new ElementStub(id));
    return elements.get(id);
  };
  const document = {
    readyState: "complete",
    visibilityState: "visible",
    addEventListener() {},
    createElement: tag => new ElementStub(tag),
    getElementById,
    querySelector() { return null; },
    querySelectorAll() { return []; }
  };
  const localStorage = {
    getItem: key => storage.has(key) ? storage.get(key) : null,
    setItem: (key, value) => storage.set(key, String(value)),
    removeItem: key => storage.delete(key),
    clear: () => storage.clear()
  };
  const window = {
    document,
    localStorage,
    location: { search: "", href: "http://localhost/" },
    confirm: () => true,
    addEventListener() {},
    removeEventListener() {}
  };
  return { document, elements, localStorage, window };
}

function quietConsole(logs) {
  const capture = level => (...args) => logs.push({ level, args: args.map(value => String(value)) });
  return {
    log: capture("log"),
    info: capture("info"),
    warn: capture("warn"),
    error: capture("error")
  };
}

export function readScriptManifest(rootDir) {
  const indexPath = resolve(rootDir, "index.html");
  const html = readFileSync(indexPath, "utf8");
  const scripts = [];
  for (const match of html.matchAll(SCRIPT_TAG_RE)) {
    const src = match[2];
    if (!/^(?:https?:)?\/\//i.test(src)) scripts.push(src.replace(/^\.\//, ""));
  }
  return { indexPath, scripts };
}

export function sceneIdDigest(sceneIds) {
  return createHash("sha256").update([...sceneIds].sort().join("\n") + "\n").digest("hex");
}

export function loadGame(rootDir, { includeValidator = true } = {}) {
  const { scripts } = readScriptManifest(rootDir);
  const selectedScripts = includeValidator ? scripts : scripts.filter(path => path !== "src/validate.js");
  const logs = [];
  const browser = createBrowserStubs();
  const sandbox = {
    ...browser,
    console: quietConsole(logs),
    location: browser.window.location,
    URL,
    URLSearchParams,
    TextDecoder,
    TextEncoder,
    setTimeout,
    clearTimeout
  };
  sandbox.globalThis = sandbox;
  const context = vm.createContext(sandbox, { name: "sunsplitter-headless" });
  const executedScripts = [];

  for (const relativePath of selectedScripts) {
    const filename = resolve(rootDir, relativePath);
    const source = readFileSync(filename, "utf8");
    let compiled;
    try {
      compiled = new vm.Script(source, { filename });
    } catch (error) {
      error.message = `Syntax error in ${relativePath}: ${error.message}`;
      throw error;
    }

    context.__currentScript = relativePath;
    try {
      compiled.runInContext(context, { timeout: 5_000 });
    } catch (error) {
      error.message = `Execution error in ${relativePath}: ${error.message}`;
      throw error;
    }
    executedScripts.push(relativePath);

    if (relativePath === "src/state.js") {
      vm.runInContext(`
        globalThis.__sceneRegistrations = [];
        globalThis.__originalRegisterScenes = registerScenes;
        registerScenes = function instrumentedRegisterScenes(map) {
          if (map && typeof map === "object") {
            for (const id of Object.keys(map)) {
              globalThis.__sceneRegistrations.push({ id, file: globalThis.__currentScript });
            }
          }
          return globalThis.__originalRegisterScenes(map);
        };
      `, context, { timeout: 1_000 });
    }
  }
  context.__currentScript = null;

  const evaluate = (source, timeout = 5_000) => vm.runInContext(source, context, { timeout });
  const scenes = evaluate("scenes");
  const registrations = [...(context.__sceneRegistrations || [])];
  const sceneIds = Object.keys(scenes);

  return {
    rootDir,
    context,
    browser,
    logs,
    scripts,
    executedScripts,
    scenes,
    sceneIds,
    registrations,
    evaluate
  };
}

function stateSnapshot(runtime) {
  return runtime.evaluate(`({
    survivors: state.survivors,
    integrity: state.integrity,
    cohesion: state.cohesion,
    supplies: state.supplies,
    embryos: state.embryos,
    scene: state.scene,
    flags: Object.assign({}, state.flags || {}),
    dead: (state.dead || []).slice(),
    deathCause: Object.assign({}, state.deathCause || {}),
    recovered: Object.assign({}, state.recovered || {}),
    promises: Object.assign({}, state.promises || {}),
    ideology: Object.assign({}, state.ideology || {}),
    memories: (state.memories || []).slice()
  })`);
}

function availableChoices(runtime) {
  return runtime.evaluate(`(() => {
    const scene = scenes[state.scene];
    if (!scene) return [];
    const list = typeof scene.choices === "function" ? scene.choices() : (scene.choices || []);
    return list.filter(choice => {
      if (choice.alive && !isAlive(choice.alive)) return false;
      if (choice.aliveAll && !choice.aliveAll.every(key => isAlive(key))) return false;
      if (choice.aliveAny && !choice.aliveAny.some(key => isAlive(key))) return false;
      if (choice.requires && !meetsRequirements(choice.requires)) return false;
      if (choice.effects && !canAffordEffects(choice.effects)) return false;
      return true;
    });
  })()`);
}

function textScore(text, positiveWords, negativeWords) {
  const normalized = String(text || "").toLowerCase();
  let score = 0;
  positiveWords.forEach(word => { if (normalized.includes(word)) score += 2; });
  negativeWords.forEach(word => { if (normalized.includes(word)) score -= 2; });
  return score;
}

function effectScore(choice, policy, state) {
  const effects = choice.effects || {};
  let score = 0;
  for (const key of RESOURCE_KEYS) {
    const delta = Number(effects[key] || 0);
    if (!delta) continue;
    const scarcity = key === "survivors" ? 8 : (state[key] < 25 ? 4 : state[key] < 45 ? 2 : 1);
    score += delta * scarcity;
  }
  if (policy === "future") score += Number(effects.embryos || 0) * 4 + Number(effects.integrity || 0) * 1.5;
  if (policy === "living") score += Number(effects.survivors || 0) * 10 + Number(effects.cohesion || 0) * 2;
  return score;
}

function choiceScore(choice, policy, state, visitCount) {
  const lean = choice.lean || {};
  const text = String(choice.text || "");
  let score = effectScore(choice, policy, state);
  if (policy === "living") {
    score += 18 * Number(lean.living || 0) - 12 * Number(lean.future || 0);
    score += textScore(text,
      ["living", "breathing", "crew", "rescue", "warm", "mercy", "together", "save", "stay"],
      ["vault", "embryo", "mission", "cold", "sacrifice"]);
  } else if (policy === "future") {
    score += 18 * Number(lean.future || 0) - 12 * Number(lean.living || 0);
    score += textScore(text,
      ["future", "vault", "embryo", "mission", "course", "hold", "repair", "seal", "verified"],
      ["comfort", "abandon", "living first", "mercy"]);
  } else {
    const future = Number(state.ideology?.future || 0);
    const living = Number(state.ideology?.living || 0);
    const desired = future > living ? Number(lean.living || 0) : Number(lean.future || 0);
    score += 8 * desired;
    score += textScore(text,
      ["verify", "together", "repair", "seal", "share", "honest", "public", "wait"],
      ["gamble", "anyway", "suppress", "vent"]);
  }
  score -= visitCount * 1_000;
  return score;
}

function hashTie(seed, sceneId, index) {
  const digest = createHash("sha256").update(`${seed}:${sceneId}:${index}`).digest();
  return digest.readUInt32BE(0);
}

function choose(runtime, choices, policy, seed, visits) {
  const state = stateSnapshot(runtime);
  const sceneId = state.scene;
  const ranked = choices.map((choice, index) => {
    const key = `${sceneId}:${index}`;
    return {
      choice,
      index,
      score: choiceScore(choice, policy, state, visits.get(key) || 0),
      tie: hashTie(seed, sceneId, index),
      key
    };
  }).sort((a, b) => b.score - a.score || a.tie - b.tie || a.index - b.index);
  const selected = ranked[0];
  visits.set(selected.key, (visits.get(selected.key) || 0) + 1);
  return selected;
}

function summarize(runtime, policy, seed, path, chosen, failure = null) {
  const state = stateSnapshot(runtime);
  const title = runtime.browser.document.getElementById("ending-title").textContent;
  const endingText = runtime.browser.document.getElementById("ending-text").textContent;
  const alive = CREW_KEYS.filter(key => runtime.evaluate(`isAlive(${JSON.stringify(key)})`));
  const recovered = Object.entries(state.recovered).filter(([, value]) => value).map(([key]) => key);
  return {
    policy,
    seed,
    completed: !failure && !!title,
    failure,
    steps: chosen.length,
    ending: { title, text: endingText },
    resources: Object.fromEntries(RESOURCE_KEYS.map(key => [key, state[key]])),
    alive,
    recovered,
    dead: state.dead.map(key => ({ key, cause: state.deathCause[key] || null })),
    promises: state.promises,
    ideology: state.ideology,
    flags: state.flags,
    facts: runtime.evaluate(`typeof concreteRunFacts === "function" ? concreteRunFacts() : []`),
    path,
    choices: chosen
  };
}

export function simulateRun(rootDir, { policy = "pragmatic", seed = 20260817, maxSteps = 600 } = {}) {
  if (!POLICY_NAMES.includes(policy)) throw new Error(`Unknown policy ${policy}`);
  const runtime = loadGame(rootDir);
  runtime.evaluate("resetRunState(); showScene('wake');");
  const path = [];
  const chosen = [];
  const visits = new Map();

  for (let step = 0; step < maxSteps; step += 1) {
    const sceneId = runtime.evaluate("state.scene");
    path.push(sceneId);
    const endingTitle = runtime.browser.document.getElementById("ending-title").textContent;
    if (endingTitle) return summarize(runtime, policy, seed, path, chosen);
    if (!runtime.scenes[sceneId]) {
      return summarize(runtime, policy, seed, path, chosen, `missing scene: ${sceneId}`);
    }

    const choices = availableChoices(runtime);
    if (!choices.length) {
      return summarize(runtime, policy, seed, path, chosen, `no affordable/enabled exit at ${sceneId}`);
    }
    const selected = choose(runtime, choices, policy, seed, visits);
    chosen.push({ scene: sceneId, index: selected.index, text: String(selected.choice.text || "") });
    runtime.context.__simChoice = selected.choice;
    runtime.evaluate("makeChoice(globalThis.__simChoice);");
    delete runtime.context.__simChoice;
  }

  return summarize(runtime, policy, seed, path, chosen, `step limit exceeded (${maxSteps})`);
}

export function simulationAssertions(result) {
  const errors = [];
  if (!result.completed) errors.push(result.failure || "run did not reach an ending");
  if (!result.ending.title) errors.push("ending title is empty");
  if (!result.ending.text) errors.push("ending text is empty");
  for (const [key, value] of Object.entries(result.resources)) {
    const max = key === "survivors" ? 20 : 100;
    if (!Number.isFinite(value) || value < 0 || value > max) errors.push(`${key} out of range: ${value}`);
  }
  for (const [holder, promiseState] of Object.entries(result.promises)) {
    if (!PROMISE_STATES.has(promiseState)) errors.push(`invalid promise state ${holder}=${promiseState}`);
  }
  if (new Set(result.dead.map(item => item.key)).size !== result.dead.length) errors.push("duplicate dead crew entry");
  return errors;
}

export function runPolicySet(rootDir, { policies = POLICY_NAMES, runs = 1, seed = 20260817 } = {}) {
  const results = [];
  for (const policy of policies) {
    for (let run = 0; run < runs; run += 1) {
      results.push(simulateRun(rootDir, { policy, seed: seed + run }));
    }
  }
  return results;
}

export function assertV6(rootDir, holder = "amara") {
  if (!new Set(["amara", "sela"]).has(holder)) throw new Error("V6 holder must be amara or sela");
  const runtime = loadGame(rootDir);
  runtime.evaluate("resetRunState();");
  const sceneId = `prom_make_${holder}`;
  runtime.evaluate(`showScene(${JSON.stringify(sceneId)});`);
  const choices = availableChoices(runtime);
  if (!choices.length) throw new Error(`V6 fixture could not enter ${sceneId}`);
  const promiseChoice = choices.find(choice => choice.flag && choice.flag[`prom_${holder}`]);
  if (!promiseChoice) throw new Error(`V6 fixture found no promise-making choice for ${holder}`);
  runtime.context.__v6Choice = promiseChoice;
  runtime.evaluate("makeChoice(globalThis.__v6Choice);");
  delete runtime.context.__v6Choice;

  const beforeDeath = stateSnapshot(runtime).promises[holder];
  runtime.evaluate(`kill(${JSON.stringify(holder)}, "V6 fabricated death before authored test");`);
  const beforeEnding = stateSnapshot(runtime).promises[holder];
  runtime.evaluate("resolveEnding();");
  const after = stateSnapshot(runtime);
  const reflection = runtime.browser.document.getElementById("ending-text").textContent;
  const holderName = runtime.evaluate(`crew[${JSON.stringify(holder)}].first`);
  const brokenPattern = new RegExp(`(?:broken.{0,80}promise.{0,80}${holderName}|${holderName}.{0,80}promise.{0,80}broken)`, "i");
  const promisePattern = new RegExp(`(?:promise.{0,80}${holderName}|${holderName}.{0,80}promise)`, "i");
  const errors = [];
  if (beforeDeath !== "made") errors.push(`fixture did not make promise: ${holder}=${beforeDeath}`);
  if (beforeEnding !== "made") errors.push(`promise changed before ending: ${holder}=${beforeEnding}`);
  if (after.promises[holder] !== "made") errors.push(`ending changed untested dead-holder promise: ${holder}=${after.promises[holder]}`);
  if (after.promises[holder] === "broken") errors.push(`ending invented a broken promise for dead holder ${holder}`);
  if (brokenPattern.test(reflection)) errors.push(`ending reflection describes ${holder}'s untested promise as broken`);
  if (promisePattern.test(reflection)) errors.push(`ending reflection includes ${holder}'s untested promise`);

  return {
    id: "V6",
    holder,
    passed: errors.length === 0,
    errors,
    beforeDeath,
    beforeEnding,
    afterEnding: after.promises[holder],
    endingTitle: runtime.browser.document.getElementById("ending-title").textContent,
    reflection
  };
}

function parseCli(argv) {
  const options = { policy: "all", runs: 1, seed: 20260817, json: false, assertV6: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--policy") options.policy = argv[++index];
    else if (arg === "--runs") options.runs = Number(argv[++index]);
    else if (arg === "--seed") options.seed = Number(argv[++index]);
    else if (arg === "--root") options.root = resolve(argv[++index]);
    else if (arg === "--json") options.json = true;
    else if (arg === "--assert-v6") options.assertV6 = true;
    else if (arg === "--help") options.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (!Number.isInteger(options.runs) || options.runs < 1) throw new Error("--runs must be a positive integer");
  if (!Number.isInteger(options.seed)) throw new Error("--seed must be an integer");
  if (options.policy !== "all" && !POLICY_ALIASES.has(options.policy)) {
    throw new Error("--policy must be all, living[-aligned], future[-aligned], mixed, or pragmatic");
  }
  if (options.policy !== "all") options.policy = POLICY_ALIASES.get(options.policy);
  return options;
}

function printHuman(results, v6) {
  for (const result of results) {
    const resources = Object.entries(result.resources).map(([key, value]) => `${key}=${value}`).join(" ");
    const deaths = result.dead.map(item => item.cause ? `${item.key} (${item.cause})` : item.key).join(",") || "none";
    console.log(`${result.policy} seed=${result.seed}: ${result.completed ? result.ending.title : `FAIL (${result.failure})`}`);
    console.log(`  steps=${result.steps} ${resources}`);
    console.log(`  alive=${result.alive.join(",") || "none"} recovered=${result.recovered.join(",") || "none"}`);
    console.log(`  dead=${deaths} ideology=future:${result.ideology.future || 0},living:${result.ideology.living || 0}`);
    console.log(`  promises=${JSON.stringify(result.promises)}`);
    console.log(`  facts=${result.facts.length ? result.facts.join(" | ") : "none"}`);
  }
  if (v6) console.log(`V6 ${v6.passed ? "PASS" : "FAIL"}: ${v6.errors.join("; ") || "locked Option B preserved"}`);
}

async function main() {
  const options = parseCli(process.argv.slice(2));
  if (options.help) {
    console.log("Usage: node scripts/simulate.mjs [--policy all|living[-aligned]|future[-aligned]|mixed|pragmatic] [--runs N] [--seed N] [--json] [--assert-v6]");
    return;
  }
  const defaultRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  const rootDir = options.root || defaultRoot;
  const policies = options.policy === "all" ? POLICY_NAMES : [options.policy];
  const results = runPolicySet(rootDir, { policies, runs: options.runs, seed: options.seed });
  const assertions = results.flatMap(result => simulationAssertions(result).map(error => `${result.policy}/${result.seed}: ${error}`));
  const v6 = options.assertV6 ? assertV6(rootDir) : null;
  if (v6 && !v6.passed) assertions.push(...v6.errors.map(error => `V6: ${error}`));
  if (options.json) console.log(JSON.stringify({ results, v6, assertions }, null, 2));
  else printHuman(results, v6);
  if (assertions.length) process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch(error => {
    console.error(error.stack || error.message);
    process.exitCode = 1;
  });
}
