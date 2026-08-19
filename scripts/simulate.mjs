#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import vm from "node:vm";

export const SMOKE_POLICY_NAMES = ["living", "future", "pragmatic"];
// Compatibility export for the existing verifier and any documented smoke invocations.
export const POLICY_NAMES = SMOKE_POLICY_NAMES;
export const LOCKED_POLICY_NAMES = ["random", "cheapest", "priciest"];
export const EXPECTED_SCENE_COUNT = 222;
export const LOCKED_SEED = 20260817;
export const LOCKED_RUNS_PER_POLICY = 2_000;
export const DEFAULT_LOCKED_SHARD_SIZE = 500;
export const RECOVERY_RUNTIME_BASE_SHA = "e4f84409759760d31fcf47b8a227802a61421f51";
export const PIPE_BOOT_R1_DISPATCH_BASE_SHA = "d7728f7ea6f6ee3f4966d73dc6316c3c26491f6e";

const DEFAULT_BASELINE_PATH = "scripts/fixtures/pipe-boot-r1-simulation-baseline.json";

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

function plainClone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function mulberry32(seed) {
  let value = seed >>> 0;
  return () => {
    value += 0x6D2B79F5;
    let next = value;
    next = Math.imul(next ^ (next >>> 15), next | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}

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

function installPaymentProbe(runtime) {
  runtime.evaluate(`(() => {
    if (globalThis.__simulationPaymentProbeInstalled) return;
    globalThis.__simulationPaymentProbeInstalled = true;
    globalThis.__simulationPayments = [];
    const originalUpdateStats = updateStats;
    updateStats = function simulationPaymentProbe(changes = {}) {
      const keys = ["survivors", "integrity", "cohesion", "supplies", "embryos"];
      const before = Object.fromEntries(keys.map(key => [key, state[key]]));
      const affordable = canAffordEffects(changes);
      originalUpdateStats(changes);
      const after = Object.fromEntries(keys.map(key => [key, state[key]]));
      globalThis.__simulationPayments.push({
        changes: Object.assign({}, changes),
        before,
        after,
        affordable
      });
    };
  })()`);
}

function resetRuntime(runtime) {
  runtime.browser.localStorage.clear();
  for (const element of runtime.browser.elements.values()) {
    element.textContent = "";
    element.innerHTML = "";
    element.className = "";
    element.classList.values.clear();
    element.children = [];
    element.attributes.clear();
    element.disabled = false;
    element.onclick = null;
    element.scrollTop = 0;
    element.src = "";
    element.alt = "";
    element.type = "";
  }
  runtime.evaluate("globalThis.__simulationPayments = []; resetRunState(); showScene('wake');");
}

function stateSnapshot(runtime) {
  return plainClone(runtime.evaluate(`({
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
  })`));
}

function choiceInventory(runtime) {
  return runtime.evaluate(`(() => {
    const scene = scenes[state.scene];
    if (!scene) return [];
    const list = typeof scene.choices === "function" ? scene.choices() : (scene.choices || []);
    return list.map((choice, index) => ({ choice, index })).filter(entry => {
      const choice = entry.choice;
      if (choice.alive && !isAlive(choice.alive)) return false;
      if (choice.aliveAll && !choice.aliveAll.every(key => isAlive(key))) return false;
      if (choice.aliveAny && !choice.aliveAny.some(key => isAlive(key))) return false;
      return true;
    }).map(entry => ({
      choice: entry.choice,
      index: entry.index,
      requirementsMet: !entry.choice.requires || meetsRequirements(entry.choice.requires),
      affordable: !entry.choice.effects || canAffordEffects(entry.choice.effects)
    }));
  })()`);
}

function choiceDescriptor(entry) {
  return plainClone({
    index: entry.index,
    text: String(entry.choice.text || ""),
    effects: entry.choice.effects || null,
    requires: entry.choice.requires || null,
    next: entry.choice.next || null,
    requirementsMet: entry.requirementsMet,
    affordable: entry.affordable
  });
}

function v1ViolationForRender(sceneId, state, inventory) {
  return {
    rule: "legally_reached_render_has_zero_enabled_exits",
    scene: sceneId,
    resources: Object.fromEntries(RESOURCE_KEYS.map(key => [key, state[key]])),
    choices: inventory.map(choiceDescriptor)
  };
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

function advertisedCost(choice) {
  if (!choice.effects || typeof choice.effects !== "object") return 0;
  return RESOURCE_KEYS.reduce((total, key) => {
    const value = Number(choice.effects[key] || 0);
    return value < 0 ? total - value : total;
  }, 0);
}

function choose(runtime, candidates, policy, seed, visits, random) {
  if (LOCKED_POLICY_NAMES.includes(policy)) {
    if (policy === "random") {
      return candidates[Math.floor(random() * candidates.length)];
    }
    const costs = candidates.map(entry => advertisedCost(entry.choice));
    const target = policy === "cheapest" ? Math.min(...costs) : Math.max(...costs);
    const tied = candidates.filter((entry, index) => costs[index] === target);
    return tied[Math.floor(random() * tied.length)];
  }

  const state = stateSnapshot(runtime);
  const sceneId = state.scene;
  const ranked = candidates.map(entry => {
    const { choice, index } = entry;
    // Preserve the original smoke runner's tie/index contract: it indexed the
    // enabled list after gates were filtered, not the raw authored list.
    const policyIndex = entry.policyIndex ?? index;
    const key = `${sceneId}:${policyIndex}`;
    return {
      ...entry,
      score: choiceScore(choice, policy, state, visits.get(key) || 0),
      tie: hashTie(seed, sceneId, policyIndex),
      key
    };
  }).sort((a, b) => b.score - a.score || a.tie - b.tie || a.index - b.index);
  const selected = ranked[0];
  visits.set(selected.key, (visits.get(selected.key) || 0) + 1);
  return selected;
}

function v4ViolationsForChoice(entry, payments, sceneId) {
  const choice = entry.choice;
  const violations = [];
  const negativeEffects = RESOURCE_KEYS.filter(key => Number(choice.effects?.[key] || 0) < 0);
  const payment = payments[0] || null;

  if (!entry.affordable) {
    violations.push({
      rule: "unaffordable_choice_executed",
      scene: sceneId,
      choice: String(choice.text || "")
    });
  }

  for (const key of negativeEffects) {
    const expected = Number(choice.effects[key]);
    const actual = payment ? Number(payment.after[key]) - Number(payment.before[key]) : null;
    if (!payment || !payment.affordable || actual !== expected) {
      violations.push({
        rule: "declared_negative_cost_not_paid",
        scene: sceneId,
        choice: String(choice.text || ""),
        resource: key,
        expected,
        actual
      });
    }
  }

  // Audit-backed immediate-cost contract: both final=comfort choices advertise a
  // fixed fuel reserve via their Supplies minimum. The current recovery base has
  // no matching negative Supplies effect; keep this visible until a gameplay ticket fixes it.
  if (choice.flag?.final === "comfort") {
    const rule = choice.requires?.supplies;
    const advertised = typeof rule === "number" ? rule : Number(rule?.min);
    const declared = Number(choice.effects?.supplies || 0);
    if (Number.isFinite(advertised) && advertised > 0 && declared !== -advertised) {
      violations.push({
        rule: "comfort_fuel_cost_not_declared",
        scene: sceneId,
        choice: String(choice.text || ""),
        resource: "supplies",
        expected: -advertised,
        actual: declared
      });
    }
  }

  return violations;
}

function v5ViolationsForEnding(state, ending, facts) {
  const violations = [];
  const final = state.flags?.final;
  const planet = state.flags?.planet;

  if (ending.title === "Landfall" && final !== "hold") {
    violations.push({
      rule: "landfall_without_final_hold",
      scene: "ending_check",
      final: final || null,
      planet: planet || null,
      ending: ending.title
    });
  }

  if (final !== "hold" && /The course is a fact on the board|The course remains locked|The commitment made earlier was enough/i.test(ending.text)) {
    violations.push({
      rule: "abandoned_course_reported_locked",
      scene: "ending_check",
      final: final || null,
      planet: planet || null,
      ending: ending.title
    });
  }

  const future = Number(state.ideology?.future || 0);
  const living = Number(state.ideology?.living || 0);
  const vaultSacrifice = state.flags?.vault_sacrifice;
  // Mirror ideologyShape() exactly: the hard vault choice has precedence over
  // accumulated soft leans. Omitting this precedence fabricates V5 failures.
  const aggregate = ["future", "living", "split"].includes(vaultSacrifice)
    ? vaultSacrifice
    : (future - living >= 8 ? "future" : living - future >= 8 ? "living" : "split");
  const ideologyLines = {
    future: "Across the recorded orders, Future carried more weight.",
    living: "Across the recorded orders, Living carried more weight.",
    split: "The recorded orders remained split between Future and Living."
  };
  if (facts[0] !== ideologyLines[aggregate]) {
    violations.push({
      rule: "what_remains_ideology_disagrees_with_totals",
      scene: "what_remains",
      future,
      living,
      expected: ideologyLines[aggregate],
      actual: facts[0] || null
    });
  }

  return violations;
}

function summarize(runtime, policy, seed, path, chosen, failure = null, invariants = { V1: [], V4: [], V5: [] }) {
  const state = stateSnapshot(runtime);
  const title = runtime.browser.document.getElementById("ending-title").textContent;
  const endingText = runtime.browser.document.getElementById("ending-text").textContent;
  const alive = CREW_KEYS.filter(key => runtime.evaluate(`isAlive(${JSON.stringify(key)})`));
  const recovered = Object.entries(state.recovered).filter(([, value]) => value).map(([key]) => key);
  const facts = plainClone(runtime.evaluate(`typeof whatRemainsFacts === "function" ? whatRemainsFacts() : []`));
  const ending = { title, text: endingText };
  if (!failure && title) invariants.V5.push(...v5ViolationsForEnding(state, ending, facts));
  return {
    policy,
    seed,
    completed: !failure && !!title,
    failure,
    steps: chosen.length,
    ending,
    resources: Object.fromEntries(RESOURCE_KEYS.map(key => [key, state[key]])),
    alive,
    recovered,
    dead: state.dead.map(key => ({ key, cause: state.deathCause[key] || null })),
    promises: state.promises,
    ideology: state.ideology,
    flags: state.flags,
    facts,
    path,
    choices: chosen,
    invariants
  };
}

function simulateRuntime(runtime, { policy = "pragmatic", seed = LOCKED_SEED, maxSteps = 600 } = {}) {
  if (![...SMOKE_POLICY_NAMES, ...LOCKED_POLICY_NAMES].includes(policy)) throw new Error(`Unknown policy ${policy}`);
  installPaymentProbe(runtime);
  resetRuntime(runtime);
  const path = [];
  const chosen = [];
  const visits = new Map();
  const random = mulberry32(seed);
  const invariants = { V1: [], V4: [], V5: [] };

  for (let step = 0; step < maxSteps; step += 1) {
    const sceneId = runtime.evaluate("state.scene");
    path.push(sceneId);
    const endingTitle = runtime.browser.document.getElementById("ending-title").textContent;
    if (endingTitle) return summarize(runtime, policy, seed, path, chosen, null, invariants);
    if (!runtime.scenes[sceneId]) {
      return summarize(runtime, policy, seed, path, chosen, `missing scene: ${sceneId}`, invariants);
    }

    const inventory = choiceInventory(runtime);
    const choices = inventory
      .filter(entry => entry.requirementsMet && entry.affordable)
      .map((entry, policyIndex) => ({ ...entry, policyIndex }));
    if (!choices.length) {
      invariants.V1.push(v1ViolationForRender(sceneId, stateSnapshot(runtime), inventory));
      return summarize(runtime, policy, seed, path, chosen, `no affordable/enabled exit at ${sceneId}`, invariants);
    }
    const selected = choose(runtime, choices, policy, seed, visits, random);
    chosen.push({ scene: sceneId, index: selected.index, text: String(selected.choice.text || "") });
    runtime.context.__simChoice = selected.choice;
    runtime.evaluate("globalThis.__simulationPayments = [];");
    runtime.evaluate("makeChoice(globalThis.__simChoice);");
    const payments = plainClone(runtime.context.__simulationPayments || []);
    invariants.V4.push(...v4ViolationsForChoice(selected, payments, sceneId));
    delete runtime.context.__simChoice;
  }

  return summarize(runtime, policy, seed, path, chosen, `step limit exceeded (${maxSteps})`, invariants);
}

export function simulateRun(rootDir, options = {}) {
  const runtime = loadGame(rootDir);
  return simulateRuntime(runtime, options);
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

function emptyLockedSummary(policy, runs) {
  return {
    policy,
    runs,
    endings: 0,
    incomplete: 0,
    errors: 0,
    stepLimits: 0,
    totalSteps: 0,
    endingCounts: {},
    invariantTotals: { V1: 0, V4: 0, V5: 0 },
    invariantRules: { V1: {}, V4: {}, V5: {} },
    invariantScenes: { V1: {}, V4: {}, V5: {} },
    invariantFingerprints: { V1: {}, V4: {}, V5: {} },
    witnesses: { V1: {}, V4: {}, V5: {} },
    errorWitness: null
  };
}

function increment(map, key, amount = 1) {
  map[key] = (map[key] || 0) + amount;
}

function recordInvariant(summary, invariant, violation, result) {
  summary.invariantTotals[invariant] += 1;
  increment(summary.invariantRules[invariant], violation.rule || "unknown");
  increment(summary.invariantScenes[invariant], violation.scene || "unknown");
  const witnessKey = `${violation.rule || "unknown"}@${violation.scene || "unknown"}`;
  increment(summary.invariantFingerprints[invariant], witnessKey);
  if (!summary.witnesses[invariant][witnessKey]) {
    summary.witnesses[invariant][witnessKey] = {
      seed: result.seed,
      failure: result.failure,
      violation: plainClone(violation),
      pathTail: result.path.slice(-8)
    };
  }
}

function derivedLockedSeed(baseSeed, policy, runIndex) {
  const policyIndex = LOCKED_POLICY_NAMES.indexOf(policy);
  if (policyIndex < 0) throw new Error(`Unknown locked policy ${policy}`);
  return baseSeed + policyIndex * 100_000 + runIndex;
}

export function runLockedProfile(rootDir, {
  policies = LOCKED_POLICY_NAMES,
  runs = LOCKED_RUNS_PER_POLICY,
  seed = LOCKED_SEED,
  startRun = 0,
  shardSize = DEFAULT_LOCKED_SHARD_SIZE,
  maxSteps = 600
} = {}) {
  if (!Array.isArray(policies) || !policies.length || policies.some(policy => !LOCKED_POLICY_NAMES.includes(policy))) {
    throw new Error(`Locked policies must be drawn from ${LOCKED_POLICY_NAMES.join(", ")}`);
  }
  for (const [label, value] of Object.entries({ runs, seed, startRun, shardSize, maxSteps })) {
    if (!Number.isInteger(value) || (label !== "startRun" && label !== "seed" && value < 1) || (label === "startRun" && value < 0)) {
      throw new Error(`${label} must be ${label === "startRun" ? "a non-negative" : "a positive"} integer`);
    }
  }

  const summaries = [];
  for (const policy of policies) {
    const summary = emptyLockedSummary(policy, runs);
    for (let shardStart = 0; shardStart < runs; shardStart += shardSize) {
      const shardEnd = Math.min(runs, shardStart + shardSize);
      let runtime;
      try {
        runtime = loadGame(rootDir);
        installPaymentProbe(runtime);
      } catch (error) {
        summary.errors += shardEnd - shardStart;
        summary.incomplete += shardEnd - shardStart;
        summary.errorWitness ||= `runtime load failed: ${error.stack || error.message}`;
        continue;
      }

      for (let offset = shardStart; offset < shardEnd; offset += 1) {
        const runIndex = startRun + offset;
        const runSeed = derivedLockedSeed(seed, policy, runIndex);
        try {
          const result = simulateRuntime(runtime, { policy, seed: runSeed, maxSteps });
          summary.totalSteps += result.steps;
          if (result.completed) {
            summary.endings += 1;
            increment(summary.endingCounts, result.ending.title || "(empty)");
          } else {
            summary.incomplete += 1;
            if (String(result.failure || "").startsWith("step limit")) summary.stepLimits += 1;
          }
          for (const invariant of ["V1", "V4", "V5"]) {
            for (const violation of result.invariants[invariant]) {
              recordInvariant(summary, invariant, violation, result);
            }
          }
        } catch (error) {
          summary.errors += 1;
          summary.incomplete += 1;
          summary.errorWitness ||= `${policy}/${runSeed}: ${error.stack || error.message}`;
        }
      }
      runtime = null;
    }
    summaries.push(summary);
  }

  return {
    profile: "locked",
    certification: "NO-PUBLISH / NOT CERTIFIED",
    provenance: {
      dispatchIssue: 15,
      dispatchBaseSha: PIPE_BOOT_R1_DISPATCH_BASE_SHA,
      runtimeBaselineSha: RECOVERY_RUNTIME_BASE_SHA,
      expectedSceneCount: EXPECTED_SCENE_COUNT
    },
    coverage: {
      V1: "all legally reached rendered choices under the locked policies",
      V4: "declared negative payment plus audit-backed final-comfort advertised cost",
      V5: [
        "landfall_without_final_hold",
        "abandoned_course_reported_locked",
        "what_remains_ideology_disagrees_with_totals"
      ]
    },
    config: { policies: [...policies], runs, seed, startRun, shardSize, maxSteps },
    summaries
  };
}

function sortedKeys(value) {
  return Object.keys(value || {}).sort();
}

const RECOVERY_INVARIANTS = Object.freeze(["V1", "V4", "V5"]);
const RECOVERY_COUNT_DIMENSIONS = Object.freeze([
  "invariantRules",
  "invariantScenes",
  "invariantFingerprints"
]);

function invariantCrossTotalErrors(label, summary) {
  const errors = [];
  for (const invariant of RECOVERY_INVARIANTS) {
    const total = summary?.invariantTotals?.[invariant];
    const validTotal = Number.isInteger(total) && total >= 0;
    if (!validTotal) errors.push(`${label}/${invariant}: total must be a non-negative integer`);

    for (const dimension of RECOVERY_COUNT_DIMENSIONS) {
      const counts = summary?.[dimension]?.[invariant];
      if (!counts || typeof counts !== "object" || Array.isArray(counts)) {
        errors.push(`${label}/${invariant}: ${dimension} must be an object`);
        continue;
      }

      let sum = 0;
      let validCounts = true;
      for (const [key, count] of Object.entries(counts)) {
        if (!Number.isInteger(count) || count < 0) {
          errors.push(`${label}/${invariant}/${dimension}/${key}: count must be a non-negative integer`);
          validCounts = false;
        } else {
          sum += count;
        }
      }
      if (validTotal && validCounts && sum !== total) {
        errors.push(`${label}/${invariant}: total ${total} != ${dimension} sum ${sum}`);
      }
    }
  }
  return errors;
}

export function compareRecoveryBaseline(profile, baseline) {
  const errors = [];
  if (!baseline || baseline.schemaVersion !== 1) errors.push("baseline schemaVersion must be 1");
  if (baseline?.certification !== "NO-PUBLISH / NOT CERTIFIED") {
    errors.push("baseline must explicitly remain NO-PUBLISH / NOT CERTIFIED");
  }
  const requiredProvenance = {
    dispatchIssue: 15,
    dispatchBaseSha: PIPE_BOOT_R1_DISPATCH_BASE_SHA,
    runtimeBaselineSha: RECOVERY_RUNTIME_BASE_SHA,
    expectedSceneCount: EXPECTED_SCENE_COUNT
  };
  for (const [key, expected] of Object.entries(requiredProvenance)) {
    if (baseline?.provenance?.[key] !== expected) {
      errors.push(`baseline provenance ${key}=${baseline?.provenance?.[key] ?? "missing"}; expected ${expected}`);
    }
    if (profile?.provenance?.[key] !== expected) {
      errors.push(`profile provenance ${key}=${profile?.provenance?.[key] ?? "missing"}; expected ${expected}`);
    }
  }
  for (const key of ["seed", "runs", "startRun", "maxSteps"]) {
    if (profile.config[key] !== baseline?.config?.[key]) {
      errors.push(`profile ${key}=${profile.config[key]} does not match baseline ${baseline?.config?.[key]}`);
    }
  }

  for (const summary of profile.summaries) {
    const expected = baseline?.policies?.[summary.policy];
    if (!expected) {
      errors.push(`baseline has no policy ${summary.policy}`);
      continue;
    }
    errors.push(...invariantCrossTotalErrors(`profile/${summary.policy}`, summary));
    errors.push(...invariantCrossTotalErrors(`baseline/${summary.policy}`, expected));
    if (summary.runs !== expected.runs) errors.push(`${summary.policy}: runs ${summary.runs} != baseline ${expected.runs}`);
    if (summary.errors > 0) errors.push(`${summary.policy}: runtime errors=${summary.errors}`);
    if (summary.stepLimits > 0) errors.push(`${summary.policy}: step limits=${summary.stepLimits}`);
    const expectedIncomplete = expected.runs - expected.endings;
    if (summary.incomplete > expectedIncomplete) {
      errors.push(`${summary.policy}: incomplete runs worsened ${summary.incomplete} > ${expectedIncomplete}`);
    }
    if (summary.incomplete !== summary.invariantTotals.V1) {
      errors.push(`${summary.policy}: unclassified incomplete runs=${summary.incomplete - summary.invariantTotals.V1}; every incomplete recovery run must be attributable to V1`);
    }
    if (summary.endings < expected.endings) {
      errors.push(`${summary.policy}: endings regressed ${summary.endings} < baseline ${expected.endings}`);
    }

    for (const invariant of RECOVERY_INVARIANTS) {
      const actualTotal = summary.invariantTotals[invariant];
      const expectedTotal = expected.invariantTotals?.[invariant];
      if (!Number.isInteger(expectedTotal)) {
        errors.push(`${summary.policy}/${invariant}: baseline total missing`);
        continue;
      }
      if (actualTotal > expectedTotal) {
        errors.push(`${summary.policy}/${invariant}: violations worsened ${actualTotal} > ${expectedTotal}`);
      }
      for (const dimension of ["invariantRules", "invariantScenes"]) {
        const actual = summary[dimension][invariant] || {};
        const pinned = expected[dimension]?.[invariant] || {};
        for (const key of sortedKeys(actual)) {
          if (!(key in pinned)) {
            errors.push(`${summary.policy}/${invariant}: new ${dimension === "invariantRules" ? "rule" : "scene"} ${key}`);
          } else if (actual[key] > pinned[key]) {
            errors.push(`${summary.policy}/${invariant}/${key}: count worsened ${actual[key]} > ${pinned[key]}`);
          }
        }
      }
      const actualFingerprints = summary.invariantFingerprints[invariant] || {};
      const pinnedFingerprints = expected.invariantFingerprints?.[invariant] || {};
      for (const fingerprint of sortedKeys(actualFingerprints)) {
        if (!(fingerprint in pinnedFingerprints)) {
          errors.push(`${summary.policy}/${invariant}: new rule@scene fingerprint ${fingerprint}`);
        } else if (actualFingerprints[fingerprint] > pinnedFingerprints[fingerprint]) {
          errors.push(`${summary.policy}/${invariant}/${fingerprint}: fingerprint count worsened ${actualFingerprints[fingerprint]} > ${pinnedFingerprints[fingerprint]}`);
        }
      }
      for (const witnessKey of sortedKeys(summary.witnesses[invariant])) {
        if (!(witnessKey in pinnedFingerprints)) {
          errors.push(`${summary.policy}/${invariant}: new witness fingerprint ${witnessKey}`);
        }
      }
    }
  }
  return errors;
}

export function lockedReleaseAssertions(profile) {
  const errors = [];
  if (profile.config.seed !== LOCKED_SEED || profile.config.runs !== LOCKED_RUNS_PER_POLICY || profile.config.startRun !== 0) {
    errors.push(`release profile must use seed=${LOCKED_SEED}, runs=${LOCKED_RUNS_PER_POLICY}/policy, startRun=0`);
  }
  for (const summary of profile.summaries) {
    if (summary.errors) errors.push(`${summary.policy}: runtime errors=${summary.errors}`);
    if (summary.stepLimits) errors.push(`${summary.policy}: step limits=${summary.stepLimits}`);
    if (summary.incomplete) errors.push(`${summary.policy}: incomplete runs=${summary.incomplete}`);
    for (const invariant of ["V1", "V4", "V5"]) {
      if (summary.invariantTotals[invariant]) {
        errors.push(`${summary.policy}/${invariant}: violations=${summary.invariantTotals[invariant]}`);
      }
    }
  }
  return errors;
}

function syntheticProfile(summary) {
  return {
    profile: "locked",
    certification: "NO-PUBLISH / NOT CERTIFIED",
    provenance: {
      dispatchIssue: 15,
      dispatchBaseSha: PIPE_BOOT_R1_DISPATCH_BASE_SHA,
      runtimeBaselineSha: RECOVERY_RUNTIME_BASE_SHA,
      expectedSceneCount: EXPECTED_SCENE_COUNT
    },
    config: {
      policies: [summary.policy],
      runs: LOCKED_RUNS_PER_POLICY,
      seed: LOCKED_SEED,
      startRun: 0,
      shardSize: DEFAULT_LOCKED_SHARD_SIZE,
      maxSteps: 600
    },
    summaries: [summary]
  };
}

function baselineFromSyntheticProfile(profile) {
  return {
    schemaVersion: 1,
    certification: "NO-PUBLISH / NOT CERTIFIED",
    provenance: plainClone(profile.provenance),
    config: {
      seed: profile.config.seed,
      runs: profile.config.runs,
      startRun: profile.config.startRun,
      maxSteps: profile.config.maxSteps
    },
    policies: Object.fromEntries(profile.summaries.map(summary => [summary.policy, plainClone(summary)]))
  };
}

export function runSelfTest() {
  const failures = [];
  const check = (condition, message) => { if (!condition) failures.push(message); };

  const disabledInventory = [{
    choice: { text: "Injected unaffordable exit", effects: { supplies: -2 }, next: "fixture_end" },
    index: 0,
    requirementsMet: true,
    affordable: false
  }];
  const v1 = v1ViolationForRender("fixture_v1", { survivors: 8, integrity: 50, cohesion: 50, supplies: 0, embryos: 80 }, disabledInventory);
  check(v1.rule === "legally_reached_render_has_zero_enabled_exits" && v1.scene === "fixture_v1", "injected V1 was not classified");

  const v4 = v4ViolationsForChoice({
    choice: {
      text: "Injected comfort cost",
      flag: { final: "comfort" },
      requires: { supplies: { min: 15 } }
    },
    index: 0,
    requirementsMet: true,
    affordable: true
  }, [], "fixture_v4");
  check(v4.some(item => item.rule === "comfort_fuel_cost_not_declared"), "injected V4 was not classified");

  const vaultPrecedence = v5ViolationsForEnding({
    flags: { vault_sacrifice: "living" },
    ideology: { future: 100, living: 0 }
  }, { title: "Fixture", text: "" }, ["Across the recorded orders, Living carried more weight."]);
  check(!vaultPrecedence.some(item => item.rule === "what_remains_ideology_disagrees_with_totals"), "V5 ignored ideologyShape vault precedence");

  const v5 = v5ViolationsForEnding({
    flags: { final: "comfort", planet: "committed", vault_sacrifice: "split" },
    ideology: { future: 0, living: 0 }
  }, {
    title: "Landfall",
    text: "The course remains locked."
  }, ["The recorded orders remained split between Future and Living."]);
  check(v5.some(item => item.rule === "landfall_without_final_hold"), "injected Landfall V5 was not classified");
  check(v5.some(item => item.rule === "abandoned_course_reported_locked"), "injected locked-course V5 was not classified");

  const summary = emptyLockedSummary("random", LOCKED_RUNS_PER_POLICY);
  summary.endings = LOCKED_RUNS_PER_POLICY - 2;
  summary.incomplete = 2;
  summary.invariantTotals.V1 = 2;
  summary.invariantRules.V1 = { rule_a: 1, rule_b: 1 };
  summary.invariantScenes.V1 = { scene_a: 1, scene_b: 1 };
  summary.invariantFingerprints.V1 = { "rule_a@scene_a": 1, "rule_b@scene_b": 1 };
  summary.witnesses.V1 = { "rule_a@scene_a": {}, "rule_b@scene_b": {} };
  summary.invariantTotals.V4 = 1;
  summary.invariantRules.V4 = { comfort_fuel_cost_not_declared: 1 };
  summary.invariantScenes.V4 = { fixture_v4: 1 };
  summary.invariantFingerprints.V4 = { "comfort_fuel_cost_not_declared@fixture_v4": 1 };
  summary.witnesses.V4 = { "comfort_fuel_cost_not_declared@fixture_v4": {} };
  const profile = syntheticProfile(summary);
  const baseline = baselineFromSyntheticProfile(profile);
  check(compareRecoveryBaseline(profile, baseline).length === 0, "unchanged recovery baseline did not pass");

  const inconsistentProfile = plainClone(profile);
  inconsistentProfile.summaries[0].invariantTotals.V4 = 2;
  const inconsistentProfileErrors = compareRecoveryBaseline(inconsistentProfile, baseline);
  check(
    RECOVERY_COUNT_DIMENSIONS.every(dimension => inconsistentProfileErrors.some(error => error.includes(`profile/random/V4: total 2 != ${dimension} sum 1`))),
    "ratchet accepted profile totals that disagreed with rule, scene, or fingerprint sums"
  );

  const inflatedBaseline = plainClone(baseline);
  inflatedBaseline.policies.random.invariantTotals.V4 = 2;
  const inflatedBaselineErrors = compareRecoveryBaseline(profile, inflatedBaseline);
  check(
    RECOVERY_COUNT_DIMENSIONS.every(dimension => inflatedBaselineErrors.some(error => error.includes(`baseline/random/V4: total 2 != ${dimension} sum 1`))),
    "ratchet accepted baseline totals that disagreed with rule, scene, or fingerprint sums"
  );

  const crossed = plainClone(profile);
  crossed.summaries[0].invariantFingerprints.V1 = { "rule_a@scene_b": 1, "rule_b@scene_a": 1 };
  crossed.summaries[0].witnesses.V1 = { "rule_a@scene_b": {}, "rule_b@scene_a": {} };
  const crossedErrors = compareRecoveryBaseline(crossed, baseline);
  check(crossedErrors.some(error => error.includes("new rule@scene fingerprint")), "ratchet accepted a new rule@scene fingerprint");

  const worsened = plainClone(profile);
  worsened.summaries[0].invariantTotals.V4 = 2;
  worsened.summaries[0].invariantRules.V4.comfort_fuel_cost_not_declared = 2;
  worsened.summaries[0].invariantScenes.V4.fixture_v4 = 2;
  worsened.summaries[0].invariantFingerprints.V4["comfort_fuel_cost_not_declared@fixture_v4"] = 2;
  check(compareRecoveryBaseline(worsened, baseline).some(error => error.includes("violations worsened")), "ratchet accepted a worsened V4 count");

  const unclassified = plainClone(profile);
  unclassified.summaries[0].invariantTotals.V1 = 1;
  check(
    compareRecoveryBaseline(unclassified, baseline).some(error => error.includes("unclassified incomplete runs")),
    "ratchet accepted an incomplete run that was no longer attributable to V1"
  );

  const badProvenance = plainClone(baseline);
  badProvenance.provenance.runtimeBaselineSha = "0".repeat(40);
  check(compareRecoveryBaseline(profile, badProvenance).some(error => error.includes("baseline provenance runtimeBaselineSha")), "ratchet accepted false baseline provenance");

  const releaseErrors = lockedReleaseAssertions(profile);
  check(releaseErrors.some(error => error.includes("/V1")) && releaseErrors.some(error => error.includes("/V4")), "strict release gate did not reject injected V1/V4");

  return { passed: failures.length === 0, failures };
}

export function assertV6(rootDir, holder = "amara") {
  if (!new Set(["amara", "sela"]).has(holder)) throw new Error("V6 holder must be amara or sela");
  const runtime = loadGame(rootDir);
  runtime.evaluate("resetRunState();");
  const sceneId = `prom_make_${holder}`;
  runtime.evaluate(`showScene(${JSON.stringify(sceneId)});`);
  const choices = choiceInventory(runtime)
    .filter(entry => entry.requirementsMet && entry.affordable)
    .map(entry => entry.choice);
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
  const endingReflection = runtime.browser.document.getElementById("ending-text").textContent;
  const whatRemains = runtime.evaluate(`typeof whatRemainsFacts === "function" ? whatRemainsFacts() : []`);
  const reflection = [endingReflection, ...whatRemains].join("\n");
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
  const options = {
    profile: "smoke",
    policy: "all",
    runs: null,
    seed: LOCKED_SEED,
    startRun: 0,
    shardSize: DEFAULT_LOCKED_SHARD_SIZE,
    maxSteps: 600,
    gate: null,
    baseline: DEFAULT_BASELINE_PATH,
    json: false,
    assertV6: false,
    selfTest: false
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--profile") options.profile = argv[++index];
    else if (arg === "--policy") options.policy = argv[++index];
    else if (arg === "--runs") options.runs = Number(argv[++index]);
    else if (arg === "--seed") options.seed = Number(argv[++index]);
    else if (arg === "--start-run") options.startRun = Number(argv[++index]);
    else if (arg === "--shard-size") options.shardSize = Number(argv[++index]);
    else if (arg === "--max-steps") options.maxSteps = Number(argv[++index]);
    else if (arg === "--gate") options.gate = argv[++index];
    else if (arg === "--baseline") options.baseline = argv[++index];
    else if (arg === "--root") options.root = resolve(argv[++index]);
    else if (arg === "--json") options.json = true;
    else if (arg === "--assert-v6") options.assertV6 = true;
    else if (arg === "--self-test") options.selfTest = true;
    else if (arg === "--help") options.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (!new Set(["smoke", "locked"]).has(options.profile)) throw new Error("--profile must be smoke or locked");
  if (options.runs == null) options.runs = options.profile === "locked" ? LOCKED_RUNS_PER_POLICY : 1;
  if (options.gate == null) options.gate = options.profile === "locked" ? "release" : "smoke";
  if (!Number.isInteger(options.runs) || options.runs < 1) throw new Error("--runs must be a positive integer");
  if (!Number.isInteger(options.seed)) throw new Error("--seed must be an integer");
  if (!Number.isInteger(options.startRun) || options.startRun < 0) throw new Error("--start-run must be a non-negative integer");
  if (!Number.isInteger(options.shardSize) || options.shardSize < 1) throw new Error("--shard-size must be a positive integer");
  if (!Number.isInteger(options.maxSteps) || options.maxSteps < 1) throw new Error("--max-steps must be a positive integer");
  if (!new Set(["smoke", "release", "recovery", "none"]).has(options.gate)) {
    throw new Error("--gate must be smoke, release, recovery, or none");
  }

  if (options.profile === "smoke") {
    if (options.policy !== "all" && !POLICY_ALIASES.has(options.policy)) {
      throw new Error("smoke --policy must be all, living[-aligned], future[-aligned], mixed, or pragmatic");
    }
    if (options.policy !== "all") options.policy = POLICY_ALIASES.get(options.policy);
    if (!new Set(["smoke", "none"]).has(options.gate)) throw new Error("smoke profile supports --gate smoke|none");
  } else {
    if (options.policy !== "all" && !LOCKED_POLICY_NAMES.includes(options.policy)) {
      throw new Error("locked --policy must be all, random, cheapest, or priciest");
    }
    if (!new Set(["release", "recovery", "none"]).has(options.gate)) {
      throw new Error("locked profile supports --gate release|recovery|none");
    }
    if (options.gate !== "none" && (options.seed !== LOCKED_SEED || options.runs !== LOCKED_RUNS_PER_POLICY || options.startRun !== 0)) {
      throw new Error(`locked ${options.gate} gate requires --seed ${LOCKED_SEED} --runs ${LOCKED_RUNS_PER_POLICY} --start-run 0`);
    }
  }
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
    console.log(`  invariants=V1:${result.invariants.V1.length} V4:${result.invariants.V4.length} V5:${result.invariants.V5.length}`);
  }
  if (v6) console.log(`V6 ${v6.passed ? "PASS" : "FAIL"}: ${v6.errors.join("; ") || "locked Option B preserved"}`);
}

function printLockedHuman(profile, gate, assertions) {
  console.log(`[simulate] LOCKED PROFILE — ${profile.certification}`);
  console.log(`[simulate] seed=${profile.config.seed} runs=${profile.config.runs}/policy start=${profile.config.startRun} shardSize=${profile.config.shardSize} maxSteps=${profile.config.maxSteps}`);
  for (const summary of profile.summaries) {
    const average = summary.runs ? (summary.totalSteps / summary.runs).toFixed(1) : "0.0";
    console.log(`[simulate] ${summary.policy}: endings=${summary.endings} incomplete=${summary.incomplete} errors=${summary.errors} avgSteps=${average}`);
    console.log(`[simulate] ${summary.policy}: V1=${summary.invariantTotals.V1} V4=${summary.invariantTotals.V4} V5=${summary.invariantTotals.V5}`);
    for (const invariant of ["V1", "V4", "V5"]) {
      const rules = Object.entries(summary.invariantRules[invariant]).sort(([a], [b]) => a.localeCompare(b));
      const scenes = Object.entries(summary.invariantScenes[invariant]).sort(([a], [b]) => a.localeCompare(b));
      console.log(`[simulate] ${summary.policy}/${invariant} rules=${rules.length ? rules.map(([key, count]) => `${key}:${count}`).join(",") : "none"}`);
      console.log(`[simulate] ${summary.policy}/${invariant} scenes=${scenes.length ? scenes.map(([key, count]) => `${key}:${count}`).join(",") : "none"}`);
    }
  }
  if (assertions.length) {
    console.error(`[simulate] ${gate.toUpperCase()} GATE FAIL (${assertions.length})`);
    assertions.forEach(error => console.error(`  - ${error}`));
  } else if (gate === "recovery") {
    console.log("[simulate] RECOVERY RATCHET PASS — known failures did not worsen; release remains NO-PUBLISH / NOT CERTIFIED");
  } else {
    console.log(`[simulate] ${gate.toUpperCase()} GATE PASS`);
  }
}

async function main() {
  const options = parseCli(process.argv.slice(2));
  if (options.help) {
    console.log("Self-test: node scripts/simulate.mjs --self-test [--json]");
    console.log("Smoke:  node scripts/simulate.mjs --profile smoke [--policy all|living|future|pragmatic] [--runs N] [--seed N] [--assert-v6] [--json]");
    console.log(`Locked: node scripts/simulate.mjs --profile locked [--policy all|random|cheapest|priciest] [--runs ${LOCKED_RUNS_PER_POLICY}] [--seed ${LOCKED_SEED}] [--shard-size ${DEFAULT_LOCKED_SHARD_SIZE}] [--gate release|recovery|none] [--baseline PATH] [--json]`);
    return;
  }
  if (options.selfTest) {
    const result = runSelfTest();
    if (options.json) console.log(JSON.stringify(result, null, 2));
    else console.log(`[simulate] SELF-TEST ${result.passed ? "PASS" : "FAIL"}${result.failures.length ? ` — ${result.failures.join("; ")}` : " — injected V1/V4/V5 and ratchet negatives rejected"}`);
    if (!result.passed) process.exitCode = 1;
    return;
  }
  const defaultRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  const rootDir = options.root || defaultRoot;
  if (options.profile === "smoke") {
    const policies = options.policy === "all" ? POLICY_NAMES : [options.policy];
    const results = runPolicySet(rootDir, { policies, runs: options.runs, seed: options.seed });
    const assertions = options.gate === "none" ? [] : results.flatMap(result => simulationAssertions(result).map(error => `${result.policy}/${result.seed}: ${error}`));
    const v6 = options.assertV6 ? assertV6(rootDir) : null;
    if (v6 && !v6.passed) assertions.push(...v6.errors.map(error => `V6: ${error}`));
    if (options.json) console.log(JSON.stringify({ profile: "smoke", certification: "NO-PUBLISH / NOT CERTIFIED", results, v6, assertions }, null, 2));
    else printHuman(results, v6);
    if (assertions.length) process.exitCode = 1;
    return;
  }

  const policies = options.policy === "all" ? LOCKED_POLICY_NAMES : [options.policy];
  const profile = runLockedProfile(rootDir, {
    policies,
    runs: options.runs,
    seed: options.seed,
    startRun: options.startRun,
    shardSize: options.shardSize,
    maxSteps: options.maxSteps
  });
  let baseline = null;
  let assertions = [];
  if (options.gate === "release") {
    assertions = lockedReleaseAssertions(profile);
  } else if (options.gate === "recovery") {
    const baselinePath = resolve(rootDir, options.baseline);
    baseline = JSON.parse(readFileSync(baselinePath, "utf8"));
    assertions = compareRecoveryBaseline(profile, baseline);
  } else {
    assertions = profile.summaries.flatMap(summary => [
      ...(summary.errors ? [`${summary.policy}: runtime errors=${summary.errors}`] : []),
      ...(summary.stepLimits ? [`${summary.policy}: step limits=${summary.stepLimits}`] : [])
    ]);
  }
  if (options.json) console.log(JSON.stringify({ ...profile, gate: options.gate, baseline: baseline ? options.baseline : null, assertions }, null, 2));
  else printLockedHuman(profile, options.gate, assertions);
  if (assertions.length) process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch(error => {
    console.error(error.stack || error.message);
    process.exitCode = 1;
  });
}
