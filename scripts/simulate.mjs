#!/usr/bin/env node

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import vm from "node:vm";

export const POLICY_NAMES = ["living", "future", "pragmatic"];
export const LOCKED_POLICY_NAMES = ["random", "cheapest", "priciest"];
export const EXPECTED_SCENE_COUNT = 222;
export const LOCKED_SEED = 20260817;
export const STRICT_RUNS_PER_POLICY = 2_000;
export const STRICT_SHARD_SIZE = 500;
export const WORKER_HEAP_MB = 384;

const SCRIPT_PATH = fileURLToPath(import.meta.url);
const DEFAULT_ROOT = resolve(dirname(SCRIPT_PATH), "..");
const DEFAULT_BASELINE = "scripts/fixtures/main-reconcile-ci-pr-baseline.json";
const SCRIPT_TAG_RE = /<script\b[^>]*\bsrc\s*=\s*(["'])([^"']+)\1[^>]*><\/script>/gi;
const RESOURCE_KEYS = ["survivors", "integrity", "cohesion", "supplies", "embryos"];
const ECONOMY_KEYS = ["integrity", "cohesion", "supplies", "embryos"];
const CREW_KEYS = ["lena", "elias", "mira", "tomas", "amara", "jiro", "sela", "vess", "rourke"];
const PROMISE_STATES = new Set(["made", "declined", "kept", "broken"]);
const POLICY_ALIASES = new Map([
  ["living", "living"], ["living-aligned", "living"],
  ["future", "future"], ["future-aligned", "future"],
  ["mixed", "pragmatic"], ["pragmatic", "pragmatic"], ["mixed/pragmatic", "pragmatic"]
]);

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function economyVector(value = {}) {
  return Object.fromEntries(ECONOMY_KEYS.map(key => [key, Number(value[key] || 0)]));
}

function economyDelta(before, after) {
  return Object.fromEntries(ECONOMY_KEYS.map(key => [key, Number(after[key]) - Number(before[key])]));
}

function addEconomyVector(target, source) {
  for (const key of ECONOMY_KEYS) target[key] += Number(source[key] || 0);
  return target;
}

function sameEconomyVector(left, right) {
  return ECONOMY_KEYS.every(key => Number(left[key]) === Number(right[key]));
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
  constructor() { this.values = new Set(); }
  add(...names) { names.forEach(name => this.values.add(name)); }
  remove(...names) { names.forEach(name => this.values.delete(name)); }
  contains(name) { return this.values.has(name); }
  toggle(name, force) {
    const enabled = force === undefined ? !this.values.has(name) : !!force;
    if (enabled) this.values.add(name); else this.values.delete(name);
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
  appendChild(child) { this.children.push(child); return child; }
  addEventListener() {}
  removeAttribute(name) { this.attributes.delete(name); if (name === "src") this.src = ""; }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
  querySelectorAll() { return []; }
}

function createBrowserStubs() {
  const elements = new Map();
  const storage = new Map();
  const eventTarget = () => {
    const listeners = new Map();
    return {
      addEventListener(type, handler) {
        if (!listeners.has(type)) listeners.set(type, new Set());
        listeners.get(type).add(handler);
      },
      removeEventListener(type, handler) { listeners.get(type)?.delete(handler); },
      dispatchEvent(event) {
        for (const handler of listeners.get(event?.type) || []) handler.call(this, event);
        return true;
      }
    };
  };
  const documentEvents = eventTarget();
  const windowEvents = eventTarget();
  const getElementById = id => {
    if (!elements.has(id)) elements.set(id, new ElementStub(id));
    return elements.get(id);
  };
  const document = {
    ...documentEvents,
    readyState: "complete",
    visibilityState: "visible",
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
  const window = { ...windowEvents, document, localStorage, location: { search: "", href: "http://localhost/" }, confirm: () => true };
  return { document, elements, localStorage, window };
}

function quietConsole(logs) {
  const capture = level => (...args) => logs.push({ level, args: args.map(value => String(value)) });
  return { log: capture("log"), info: capture("info"), warn: capture("warn"), error: capture("error") };
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
  const selected = includeValidator ? scripts : scripts.filter(path => path !== "src/validate.js");
  const logs = [];
  const browser = createBrowserStubs();
  const sandbox = { ...browser, console: quietConsole(logs), location: browser.window.location, URL, URLSearchParams, TextDecoder, TextEncoder, setTimeout, clearTimeout };
  sandbox.globalThis = sandbox;
  const context = vm.createContext(sandbox, { name: "sunsplitter-headless" });
  const executedScripts = [];
  for (const relativePath of selected) {
    const filename = resolve(rootDir, relativePath);
    const source = readFileSync(filename, "utf8");
    let compiled;
    try { compiled = new vm.Script(source, { filename }); }
    catch (error) { error.message = `Syntax error in ${relativePath}: ${error.message}`; throw error; }
    context.__currentScript = relativePath;
    try { compiled.runInContext(context, { timeout: 5_000 }); }
    catch (error) { error.message = `Execution error in ${relativePath}: ${error.message}`; throw error; }
    executedScripts.push(relativePath);
    if (relativePath === "src/state.js") {
      vm.runInContext(`
        globalThis.__sceneRegistrations = [];
        globalThis.__originalRegisterScenes = registerScenes;
        registerScenes = function instrumentedRegisterScenes(map) {
          if (map && typeof map === "object") for (const id of Object.keys(map)) globalThis.__sceneRegistrations.push({ id, file: globalThis.__currentScript });
          return globalThis.__originalRegisterScenes(map);
        };
      `, context, { timeout: 1_000 });
    }
  }
  context.__currentScript = null;
  const evaluate = (source, timeout = 5_000) => vm.runInContext(source, context, { timeout });
  const scenes = evaluate("scenes");
  const registrations = [...(context.__sceneRegistrations || [])];
  return { rootDir, context, browser, logs, scripts, executedScripts, scenes, sceneIds: Object.keys(scenes), registrations, evaluate };
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
      globalThis.__simulationPayments.push({ changes: Object.assign({}, changes), before, after, affordable });
    };
  })()`);
}

function resetRuntime(runtime) {
  runtime.browser.localStorage.clear();
  for (const element of runtime.browser.elements.values()) {
    element.textContent = ""; element.innerHTML = ""; element.className = ""; element.classList.values.clear();
    element.children = []; element.attributes.clear(); element.disabled = false; element.onclick = null;
    element.scrollTop = 0; element.src = ""; element.alt = ""; element.type = "";
  }
  runtime.evaluate("globalThis.__simulationPayments = []; resetRunState(); showScene('wake');");
}

function stateSnapshot(runtime) {
  return clone(runtime.evaluate(`({
    survivors: state.survivors, integrity: state.integrity, cohesion: state.cohesion, supplies: state.supplies, embryos: state.embryos,
    scene: state.scene, flags: Object.assign({}, state.flags || {}), dead: (state.dead || []).slice(),
    deathCause: Object.assign({}, state.deathCause || {}), recovered: Object.assign({}, state.recovered || {}),
    promises: Object.assign({}, state.promises || {}), ideology: Object.assign({}, state.ideology || {}), memories: (state.memories || []).slice()
  })`));
}

function economySnapshot(runtime) {
  return clone(runtime.evaluate(`Object.fromEntries(${JSON.stringify(ECONOMY_KEYS)}.map(key => [key, state[key]]))`));
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
      choice: entry.choice, index: entry.index,
      requirementsMet: !entry.choice.requires || meetsRequirements(entry.choice.requires),
      affordable: !entry.choice.effects || canAffordEffects(entry.choice.effects)
    }));
  })()`);
}

function availableChoices(runtime) {
  return choiceInventory(runtime).filter(entry => entry.requirementsMet && entry.affordable).map(entry => entry.choice);
}

function choiceDescriptor(entry) {
  return clone({ index: entry.index, text: String(entry.choice.text || ""), effects: entry.choice.effects || null, requires: entry.choice.requires || null, next: entry.choice.next || null, requirementsMet: entry.requirementsMet, affordable: entry.affordable });
}

function v1Violation(sceneId, state, inventory) {
  return { rule: "legally_reached_render_has_zero_enabled_exits", scene: sceneId, resources: Object.fromEntries(RESOURCE_KEYS.map(key => [key, state[key]])), choices: inventory.map(choiceDescriptor) };
}

function advertisedCost(choice) {
  return RESOURCE_KEYS.reduce((sum, key) => {
    const value = Number(choice.effects?.[key] || 0);
    return value < 0 ? sum - value : sum;
  }, 0);
}

function textScore(text, positive, negative) {
  const normalized = String(text || "").toLowerCase();
  return positive.reduce((score, word) => score + (normalized.includes(word) ? 2 : 0), 0) - negative.reduce((score, word) => score + (normalized.includes(word) ? 2 : 0), 0);
}

function choiceScore(choice, policy, state, visits) {
  const effects = choice.effects || {};
  const lean = choice.lean || {};
  let score = 0;
  for (const key of RESOURCE_KEYS) {
    const delta = Number(effects[key] || 0);
    const scarcity = key === "survivors" ? 8 : state[key] < 25 ? 4 : state[key] < 45 ? 2 : 1;
    score += delta * scarcity;
  }
  if (policy === "future") {
    score += Number(effects.embryos || 0) * 4 + Number(effects.integrity || 0) * 1.5 + 18 * Number(lean.future || 0) - 12 * Number(lean.living || 0);
    score += textScore(choice.text, ["future", "vault", "embryo", "mission", "course", "hold", "repair", "seal", "verified"], ["comfort", "abandon", "living first", "mercy"]);
  } else if (policy === "living") {
    score += Number(effects.survivors || 0) * 10 + Number(effects.cohesion || 0) * 2 + 18 * Number(lean.living || 0) - 12 * Number(lean.future || 0);
    score += textScore(choice.text, ["living", "breathing", "crew", "rescue", "warm", "mercy", "together", "save", "stay"], ["vault", "embryo", "mission", "cold", "sacrifice"]);
  } else {
    const desired = Number(state.ideology?.future || 0) > Number(state.ideology?.living || 0) ? Number(lean.living || 0) : Number(lean.future || 0);
    score += 8 * desired + textScore(choice.text, ["verify", "together", "repair", "seal", "share", "honest", "public", "wait"], ["gamble", "anyway", "suppress", "vent"]);
  }
  return score - visits * 1_000;
}

function hashTie(seed, sceneId, index) {
  return createHash("sha256").update(`${seed}:${sceneId}:${index}`).digest().readUInt32BE(0);
}

function choose(runtime, candidates, policy, seed, visits, random) {
  if (LOCKED_POLICY_NAMES.includes(policy)) {
    if (policy === "random") return candidates[Math.floor(random() * candidates.length)];
    const target = policy === "cheapest" ? Math.min(...candidates.map(entry => advertisedCost(entry.choice))) : Math.max(...candidates.map(entry => advertisedCost(entry.choice)));
    const tied = candidates.filter(entry => advertisedCost(entry.choice) === target);
    return tied[Math.floor(random() * tied.length)];
  }
  const state = stateSnapshot(runtime);
  const sceneId = state.scene;
  const ranked = candidates.map((entry, policyIndex) => {
    const key = `${sceneId}:${policyIndex}`;
    return { ...entry, key, score: choiceScore(entry.choice, policy, state, visits.get(key) || 0), tie: hashTie(seed, sceneId, policyIndex) };
  }).sort((left, right) => right.score - left.score || left.tie - right.tie || left.index - right.index);
  visits.set(ranked[0].key, (visits.get(ranked[0].key) || 0) + 1);
  return ranked[0];
}

function v4Violations(entry, payments, sceneId) {
  const choice = entry.choice;
  const violations = [];
  if (!entry.affordable) violations.push({ rule: "unaffordable_choice_executed", scene: sceneId, choice: String(choice.text || "") });
  const payment = payments[0] || null;
  for (const key of RESOURCE_KEYS.filter(key => Number(choice.effects?.[key] || 0) < 0)) {
    const expected = Number(choice.effects[key]);
    const actual = payment ? Number(payment.after[key]) - Number(payment.before[key]) : null;
    if (!payment || !payment.affordable || actual !== expected) violations.push({ rule: "declared_negative_cost_not_paid", scene: sceneId, choice: String(choice.text || ""), resource: key, expected, actual });
  }
  if (choice.flag?.final === "comfort") {
    const rule = choice.requires?.supplies;
    const advertised = typeof rule === "number" ? rule : Number(rule?.min);
    const declared = Number(choice.effects?.supplies || 0);
    if (Number.isFinite(advertised) && advertised > 0 && declared !== -advertised) violations.push({ rule: "comfort_fuel_cost_not_declared", scene: sceneId, choice: String(choice.text || ""), resource: "supplies", expected: -advertised, actual: declared });
  }
  return violations;
}

function economyChoiceRecord(entry, payments, before, after, sceneId) {
  const choice = entry.choice;
  const transactions = payments.map((payment, sequence) => {
    const transactionBefore = economyVector(payment.before);
    const transactionAfter = economyVector(payment.after);
    return {
      sequence,
      declared: economyVector(payment.changes),
      actual: economyDelta(transactionBefore, transactionAfter),
      before: transactionBefore,
      after: transactionAfter
    };
  });
  return {
    scene: sceneId,
    choiceIndex: entry.index,
    choiceText: String(choice.text || ""),
    declared: economyVector(choice.effects),
    observed: economyDelta(before, after),
    before: economyVector(before),
    after: economyVector(after),
    transactions
  };
}

function economyChoiceViolations(record) {
  const violations = [];
  const transactionDeclared = economyVector();
  const transactionActual = economyVector();
  let expectedBefore = record.before;
  for (const transaction of record.transactions) {
    if (!sameEconomyVector(transaction.before, expectedBefore)) {
      violations.push({ rule: "economy_transaction_chain_gap", scene: record.scene, choice: record.choiceText, sequence: transaction.sequence });
    }
    addEconomyVector(transactionDeclared, transaction.declared);
    addEconomyVector(transactionActual, transaction.actual);
    expectedBefore = transaction.after;
  }
  if (!sameEconomyVector(expectedBefore, record.after)) {
    violations.push({ rule: "economy_transaction_chain_gap", scene: record.scene, choice: record.choiceText, sequence: record.transactions.length });
  }
  for (const key of ECONOMY_KEYS) {
    if (transactionDeclared[key] !== record.declared[key]) {
      violations.push({
        rule: "economy_transaction_not_declared_by_choice",
        scene: record.scene,
        choice: record.choiceText,
        resource: key,
        expected: record.declared[key],
        actual: transactionDeclared[key]
      });
    }
    const unrecorded = record.observed[key] - transactionActual[key];
    if (unrecorded < 0) {
      violations.push({ rule: "unrecorded_resource_spend", scene: record.scene, choice: record.choiceText, resource: key, amount: unrecorded });
    } else if (unrecorded > 0) {
      violations.push({ rule: "phantom_resource_credit", scene: record.scene, choice: record.choiceText, resource: key, amount: unrecorded });
    }
  }
  return violations;
}

function buildEconomyRecord(initial, final, choices) {
  const declaredTotals = economyVector();
  const actualTotals = economyVector();
  const transactions = [];
  for (const choice of choices) {
    addEconomyVector(declaredTotals, choice.declared);
    for (const transaction of choice.transactions) {
      addEconomyVector(actualTotals, transaction.actual);
      transactions.push({
        scene: choice.scene,
        choiceIndex: choice.choiceIndex,
        choiceText: choice.choiceText,
        ...transaction
      });
    }
  }
  const observedTotals = economyDelta(initial, final);
  return {
    keys: [...ECONOMY_KEYS],
    initial: economyVector(initial),
    final: economyVector(final),
    choicesAudited: choices.length,
    transactions,
    declaredTotals,
    actualTotals,
    observedTotals,
    reconciled: sameEconomyVector(actualTotals, observedTotals)
  };
}

function v5Violations(state, ending, facts) {
  const violations = [];
  const final = state.flags?.final;
  const planet = state.flags?.planet;
  if (ending.title === "Landfall" && final !== "hold") violations.push({ rule: "landfall_without_final_hold", scene: "ending_check", final: final || null, planet: planet || null, ending: ending.title });
  if (final !== "hold" && /The course is a fact on the board|The course remains locked|The commitment made earlier was enough/i.test(ending.text)) violations.push({ rule: "abandoned_course_reported_locked", scene: "ending_check", final: final || null, planet: planet || null, ending: ending.title });
  const future = Number(state.ideology?.future || 0);
  const living = Number(state.ideology?.living || 0);
  const vault = state.flags?.vault_sacrifice;
  const shape = ["future", "living", "split"].includes(vault) ? vault : future - living >= 8 ? "future" : living - future >= 8 ? "living" : "split";
  const expected = { future: "Across the recorded orders, Future carried more weight.", living: "Across the recorded orders, Living carried more weight.", split: "The recorded orders remained split between Future and Living." }[shape];
  if (facts[0] !== expected) violations.push({ rule: "what_remains_ideology_disagrees_with_totals", scene: "what_remains", future, living, expected, actual: facts[0] || null });
  return violations;
}

function summarize(runtime, policy, seed, path, chosen, failure, invariants, economyInitial, economyChoices) {
  const state = stateSnapshot(runtime);
  const economy = buildEconomyRecord(economyInitial, economyVector(state), economyChoices);
  if (!economy.reconciled) {
    invariants.V4.push({
      rule: "economy_record_does_not_reconcile",
      scene: "economy_record",
      expected: economy.observedTotals,
      actual: economy.actualTotals
    });
  }
  const ending = { title: runtime.browser.document.getElementById("ending-title").textContent, text: runtime.browser.document.getElementById("ending-text").textContent };
  const facts = clone(runtime.evaluate(`typeof whatRemainsFacts === "function" ? whatRemainsFacts() : []`));
  if (!failure && ending.title) invariants.V5.push(...v5Violations(state, ending, facts));
  return {
    policy, seed, completed: !failure && !!ending.title, failure, steps: chosen.length, ending,
    resources: Object.fromEntries(RESOURCE_KEYS.map(key => [key, state[key]])),
    alive: CREW_KEYS.filter(key => runtime.evaluate(`isAlive(${JSON.stringify(key)})`)),
    recovered: Object.entries(state.recovered).filter(([, value]) => value).map(([key]) => key),
    dead: state.dead.map(key => ({ key, cause: state.deathCause[key] || null })),
    promises: state.promises, ideology: state.ideology, flags: state.flags, facts, path, choices: chosen, economy, invariants
  };
}

function simulateRuntime(runtime, { policy = "pragmatic", seed = LOCKED_SEED, maxSteps = 600 } = {}) {
  if (![...POLICY_NAMES, ...LOCKED_POLICY_NAMES].includes(policy)) throw new Error(`Unknown policy ${policy}`);
  installPaymentProbe(runtime);
  // Player event dispatch uses Math.random only before rendering a new offer.
  // Seed its own stream for reproducible simulation, separate from policy RNG.
  runtime.evaluate(`Math.random = (${mulberry32.toString()})(${(seed ^ 0x53554e) >>> 0});`);
  resetRuntime(runtime);
  const economyInitial = economySnapshot(runtime);
  const economyChoices = [];
  const path = [];
  const chosen = [];
  const visits = new Map();
  const random = mulberry32(seed);
  const invariants = { V1: [], V4: [], V5: [] };
  for (let step = 0; step < maxSteps; step += 1) {
    const sceneId = runtime.evaluate("state.scene");
    path.push(sceneId);
    if (runtime.browser.document.getElementById("ending-title").textContent) return summarize(runtime, policy, seed, path, chosen, null, invariants, economyInitial, economyChoices);
    if (!runtime.scenes[sceneId]) return summarize(runtime, policy, seed, path, chosen, `missing scene: ${sceneId}`, invariants, economyInitial, economyChoices);
    const inventory = choiceInventory(runtime);
    const candidates = inventory.filter(entry => entry.requirementsMet && entry.affordable);
    if (!candidates.length) {
      invariants.V1.push(v1Violation(sceneId, stateSnapshot(runtime), inventory));
      return summarize(runtime, policy, seed, path, chosen, `no affordable/enabled exit at ${sceneId}`, invariants, economyInitial, economyChoices);
    }
    const selected = choose(runtime, candidates, policy, seed, visits, random);
    chosen.push({ scene: sceneId, index: selected.index, text: String(selected.choice.text || "") });
    runtime.context.__simChoice = selected.choice;
    runtime.evaluate("globalThis.__simulationPayments = [];");
    const economyBefore = economySnapshot(runtime);
    runtime.evaluate("makeChoice(globalThis.__simChoice);");
    const payments = clone(runtime.context.__simulationPayments || []);
    const economyAfter = economySnapshot(runtime);
    const economyChoice = economyChoiceRecord(selected, payments, economyBefore, economyAfter, sceneId);
    economyChoices.push(economyChoice);
    invariants.V4.push(...v4Violations(selected, payments, sceneId), ...economyChoiceViolations(economyChoice));
    delete runtime.context.__simChoice;
  }
  return summarize(runtime, policy, seed, path, chosen, `step limit exceeded (${maxSteps})`, invariants, economyInitial, economyChoices);
}

export function simulateRun(rootDir, options = {}) {
  return simulateRuntime(loadGame(rootDir), options);
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
  for (const [holder, promiseState] of Object.entries(result.promises)) if (!PROMISE_STATES.has(promiseState)) errors.push(`invalid promise state ${holder}=${promiseState}`);
  if (new Set(result.dead.map(item => item.key)).size !== result.dead.length) errors.push("duplicate dead crew entry");
  if (!result.economy || !result.economy.reconciled) errors.push("economy record does not reconcile recorded transactions with observed resources");
  if (result.economy && result.economy.choicesAudited !== result.choices.length) errors.push(`economy record audited ${result.economy.choicesAudited} choices; expected ${result.choices.length}`);
  return errors;
}

export function runPolicySet(rootDir, { policies = POLICY_NAMES, runs = 1, seed = LOCKED_SEED } = {}) {
  const results = [];
  for (const policy of policies) for (let run = 0; run < runs; run += 1) results.push(simulateRun(rootDir, { policy, seed: seed + run }));
  return results;
}

function emptyEconomySummary() {
  return {
    runsReconciled: 0,
    transactions: 0,
    declaredTotals: economyVector(),
    actualTotals: economyVector(),
    observedTotals: economyVector(),
    endingRanges: Object.fromEntries(ECONOMY_KEYS.map(key => [key, { min: null, max: null }]))
  };
}

function addEconomyRun(summary, economy) {
  if (!economy) return;
  if (economy.reconciled) summary.runsReconciled += 1;
  summary.transactions += economy.transactions.length;
  addEconomyVector(summary.declaredTotals, economy.declaredTotals);
  addEconomyVector(summary.actualTotals, economy.actualTotals);
  addEconomyVector(summary.observedTotals, economy.observedTotals);
  for (const key of ECONOMY_KEYS) {
    const value = economy.final[key];
    const range = summary.endingRanges[key];
    range.min = range.min == null ? value : Math.min(range.min, value);
    range.max = range.max == null ? value : Math.max(range.max, value);
  }
}

function emptySummary(policy, startRun, runs) {
  return {
    policy, startRun, endRun: startRun + runs, runs, endings: 0, incomplete: 0, errors: 0, stepLimits: 0, totalSteps: 0,
    endingCounts: {}, economy: emptyEconomySummary(), invariantTotals: { V1: 0, V4: 0, V5: 0 },
    invariantRules: { V1: {}, V4: {}, V5: {} }, invariantScenes: { V1: {}, V4: {}, V5: {} },
    invariantFingerprints: { V1: {}, V4: {}, V5: {} }, witnesses: { V1: {}, V4: {}, V5: {} }, errorWitness: null
  };
}

function increment(map, key, amount = 1) { map[key] = (map[key] || 0) + amount; }

function derivedSeed(baseSeed, policy, runIndex) {
  const policyIndex = LOCKED_POLICY_NAMES.indexOf(policy);
  if (policyIndex < 0) throw new Error(`Unknown locked policy ${policy}`);
  return baseSeed + policyIndex * 100_000 + runIndex;
}

function recordInvariant(summary, invariant, violation, result, runIndex) {
  summary.invariantTotals[invariant] += 1;
  increment(summary.invariantRules[invariant], violation.rule || "unknown");
  increment(summary.invariantScenes[invariant], violation.scene || "unknown");
  const fingerprint = `${violation.rule || "unknown"}@${violation.scene || "unknown"}`;
  increment(summary.invariantFingerprints[invariant], fingerprint);
  if (!summary.witnesses[invariant][fingerprint]) summary.witnesses[invariant][fingerprint] = { runIndex, seed: result.seed, failure: result.failure, violation: clone(violation), pathTail: result.path.slice(-8) };
}

function runWorkerShard(rootDir, { policy, runs, startRun, seed, maxSteps }) {
  const summary = emptySummary(policy, startRun, runs);
  let runtime;
  try { runtime = loadGame(rootDir); installPaymentProbe(runtime); }
  catch (error) {
    summary.errors = runs; summary.incomplete = runs; summary.errorWitness = `runtime load failed: ${error.stack || error.message}`;
    return summary;
  }
  for (let offset = 0; offset < runs; offset += 1) {
    const runIndex = startRun + offset;
    const runSeed = derivedSeed(seed, policy, runIndex);
    try {
      const result = simulateRuntime(runtime, { policy, seed: runSeed, maxSteps });
      summary.totalSteps += result.steps;
      if (result.completed) { summary.endings += 1; increment(summary.endingCounts, result.ending.title || "(empty)"); }
      else { summary.incomplete += 1; if (String(result.failure || "").startsWith("step limit")) summary.stepLimits += 1; }
      addEconomyRun(summary.economy, result.economy);
      for (const invariant of ["V1", "V4", "V5"]) for (const violation of result.invariants[invariant]) recordInvariant(summary, invariant, violation, result, runIndex);
    } catch (error) {
      summary.errors += 1; summary.incomplete += 1; summary.errorWitness ||= `${policy}/${runSeed}: ${error.stack || error.message}`;
    }
  }
  return summary;
}

function mergeMaps(target, source) {
  for (const [key, count] of Object.entries(source || {})) increment(target, key, count);
}

function mergeShards(policy, shards, expectedRuns) {
  const ordered = [...shards].sort((left, right) => left.startRun - right.startRun);
  if (!ordered.length || ordered[0].startRun !== 0 || ordered.at(-1).endRun !== expectedRuns) throw new Error(`${policy}: shard coverage has a gap`);
  for (let index = 1; index < ordered.length; index += 1) if (ordered[index - 1].endRun !== ordered[index].startRun) throw new Error(`${policy}: shard coverage overlaps or has a gap`);
  const merged = emptySummary(policy, 0, expectedRuns);
  for (const shard of ordered) {
    if (shard.policy !== policy || shard.endRun - shard.startRun !== shard.runs) throw new Error(`${policy}: malformed shard metadata`);
    for (const key of ["endings", "incomplete", "errors", "stepLimits", "totalSteps"]) merged[key] += shard[key];
    mergeMaps(merged.endingCounts, shard.endingCounts);
    merged.economy.runsReconciled += shard.economy.runsReconciled;
    merged.economy.transactions += shard.economy.transactions;
    addEconomyVector(merged.economy.declaredTotals, shard.economy.declaredTotals);
    addEconomyVector(merged.economy.actualTotals, shard.economy.actualTotals);
    addEconomyVector(merged.economy.observedTotals, shard.economy.observedTotals);
    for (const key of ECONOMY_KEYS) {
      const source = shard.economy.endingRanges[key];
      const target = merged.economy.endingRanges[key];
      if (source.min != null) target.min = target.min == null ? source.min : Math.min(target.min, source.min);
      if (source.max != null) target.max = target.max == null ? source.max : Math.max(target.max, source.max);
    }
    for (const invariant of ["V1", "V4", "V5"]) {
      merged.invariantTotals[invariant] += shard.invariantTotals[invariant];
      mergeMaps(merged.invariantRules[invariant], shard.invariantRules[invariant]);
      mergeMaps(merged.invariantScenes[invariant], shard.invariantScenes[invariant]);
      mergeMaps(merged.invariantFingerprints[invariant], shard.invariantFingerprints[invariant]);
      for (const [fingerprint, witness] of Object.entries(shard.witnesses[invariant])) {
        const prior = merged.witnesses[invariant][fingerprint];
        if (!prior || witness.runIndex < prior.runIndex) merged.witnesses[invariant][fingerprint] = witness;
      }
    }
    merged.errorWitness ||= shard.errorWitness;
  }
  return merged;
}

function parseWorkerOutput(result, label) {
  if (result.status !== 0) throw new Error(`${label} worker failed: ${(result.stderr || result.stdout).trim()}`);
  try { return JSON.parse(result.stdout); }
  catch { throw new Error(`${label} worker returned malformed JSON`); }
}

function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object") return Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])]));
  return value;
}

function canonicalJson(value) { return JSON.stringify(canonical(value)); }
function normalizedHash(value) { return createHash("sha256").update(canonicalJson(value)).digest("hex"); }

function gitIdentity(rootDir) {
  const result = spawnSync("git", ["rev-parse", "HEAD", "HEAD^{tree}", "HEAD:src"], { cwd: rootDir, encoding: "utf8", env: { ...process.env, GIT_OPTIONAL_LOCKS: "0" } });
  if (result.status !== 0) throw new Error(`could not read exact tested Git identity: ${(result.stderr || result.stdout).trim()}`);
  const [testedSha, testedTree, srcTree] = result.stdout.trim().split(/\r?\n/);
  return { testedSha, testedTree, srcTree };
}

function reportNormalizationInput(report) {
  const value = clone(report);
  delete value.normalizedHash;
  delete value.provenance.testedSha;
  delete value.provenance.testedTree;
  return value;
}

export function runProcessProfile(rootDir, { profile, policies, runs, seed, shardSize, maxSteps, workerHeapMb = WORKER_HEAP_MB }) {
  const summaries = [];
  for (const policy of policies) {
    const shards = [];
    for (let startRun = 0; startRun < runs; startRun += shardSize) {
      const shardRuns = Math.min(shardSize, runs - startRun);
      const args = [
        `--max-old-space-size=${workerHeapMb}`, SCRIPT_PATH, "--worker-json", "--root", rootDir,
        "--policy", policy, "--runs", String(shardRuns), "--start-run", String(startRun), "--seed", String(seed), "--max-steps", String(maxSteps)
      ];
      const result = spawnSync(process.execPath, args, { encoding: "utf8", maxBuffer: 16 * 1024 * 1024, env: { ...process.env, NODE_OPTIONS: "" } });
      shards.push(parseWorkerOutput(result, `${policy}/${startRun}`));
    }
    summaries.push(mergeShards(policy, shards, runs));
  }
  const identity = gitIdentity(rootDir);
  const report = {
    schemaVersion: 1,
    profile,
    certification: "NO-PUBLISH / NOT_CERTIFIED",
    provenance: { ...identity, baselineMainSha: "8d23109b63b844e0703fb36643f14b91b8800c90", expectedSceneCount: EXPECTED_SCENE_COUNT },
    config: { policies: [...policies], runs, seed, shardSize, maxSteps, workerHeapMb },
    coverage: { V1: "legally reached render has no enabled exit", V4: "declared payment plus a reconciled economy record with no unrecorded spend or phantom credit", V5: ["landfall_without_final_hold", "abandoned_course_reported_locked", "what_remains_ideology_disagrees_with_totals"] },
    summaries
  };
  return { ...report, normalizedHash: normalizedHash(reportNormalizationInput(report)) };
}

function strictErrors(report) {
  const errors = [];
  for (const summary of report.summaries) {
    if (summary.errors) errors.push(`${summary.policy}: runtime errors=${summary.errors}`);
    if (summary.incomplete) errors.push(`${summary.policy}: incomplete=${summary.incomplete}`);
    if (summary.endings !== summary.runs) errors.push(`${summary.policy}: endings=${summary.endings}/${summary.runs}`);
    if (summary.economy.runsReconciled !== summary.runs) errors.push(`${summary.policy}: economy records reconciled=${summary.economy.runsReconciled}/${summary.runs}`);
    for (const invariant of ["V1", "V4", "V5"]) if (summary.invariantTotals[invariant]) errors.push(`${summary.policy}/${invariant}: violations=${summary.invariantTotals[invariant]}`);
  }
  return errors;
}

function smokeErrors(report, repeatReport, fixture) {
  const errors = [];
  const baseline = fixture?.simulation?.smokeBaseline;
  if (!baseline) return ["smoke baseline is missing"];
  if (report.profile !== "smoke") errors.push(`smoke gate requires smoke profile, got ${report.profile || "missing"}`);
  if (baseline.certification !== "NO-PUBLISH / NOT_CERTIFIED") errors.push("smoke baseline certification posture drifted");
  if (report.normalizedHash !== repeatReport?.normalizedHash) errors.push(`smoke repeat hash mismatch ${report.normalizedHash} != ${repeatReport?.normalizedHash || "missing"}`);
  if (report.config.seed !== fixture.simulation.seed || report.config.runs !== fixture.simulation.smokeRunsPerPolicy || report.config.policies.join(",") !== fixture.simulation.policies.join(",")) errors.push("smoke configuration drifted from the governed fixture");
  for (const summary of report.summaries) {
    if (summary.errors) errors.push(`${summary.policy}: smoke runtime errors=${summary.errors}`);
    if (summary.incomplete || summary.endings !== summary.runs) errors.push(`${summary.policy}: smoke incomplete=${summary.incomplete}`);
    if (summary.economy.runsReconciled !== summary.runs) errors.push(`${summary.policy}: smoke economy records reconciled=${summary.economy.runsReconciled}/${summary.runs}`);
  }
  return errors;
}

function gatePreflightErrors(options) {
  if (!new Set(["none", "smoke", "strict"]).has(options.gate)) return ["--gate must be none, smoke, or strict"];
  if ((POLICY_ALIASES.has(options.policy) || POLICY_NAMES.includes(options.policy)) && options.gate !== "none") return ["legacy policies are diagnostic-only and require --gate none"];
  if (options.gate === "strict" && (options.profile !== "strict" || options.seed !== LOCKED_SEED || options.runs !== STRICT_RUNS_PER_POLICY || options.shardSize !== STRICT_SHARD_SIZE || options.workerHeapMb !== WORKER_HEAP_MB)) {
    return ["strict gate configuration drifted from strict profile, seed 20260817, 2,000 runs, shard size 500, heap 384 MB"];
  }
  if (options.gate === "smoke" && options.profile !== "smoke") return [`smoke gate requires smoke profile, got ${options.profile}`];
  return [];
}

export function assertV6(rootDir, holder = "amara") {
  if (!new Set(["amara", "sela"]).has(holder)) throw new Error("V6 holder must be amara or sela");
  const runtime = loadGame(rootDir);
  runtime.evaluate("resetRunState();");
  runtime.evaluate(`showScene(${JSON.stringify(`prom_make_${holder}`)});`);
  const promiseChoice = availableChoices(runtime).find(choice => choice.flag && choice.flag[`prom_${holder}`]);
  if (!promiseChoice) throw new Error(`V6 fixture found no promise-making choice for ${holder}`);
  runtime.context.__v6Choice = promiseChoice;
  runtime.evaluate("makeChoice(globalThis.__v6Choice);");
  delete runtime.context.__v6Choice;
  const beforeDeath = stateSnapshot(runtime).promises[holder];
  runtime.evaluate(`kill(${JSON.stringify(holder)}, "V6 fabricated death before authored test");`);
  const beforeEnding = stateSnapshot(runtime).promises[holder];
  runtime.evaluate("resolveEnding();");
  const after = stateSnapshot(runtime);
  const reflection = [runtime.browser.document.getElementById("ending-text").textContent, ...runtime.evaluate(`typeof whatRemainsFacts === "function" ? whatRemainsFacts() : []`)].join("\n");
  const holderName = runtime.evaluate(`crew[${JSON.stringify(holder)}].first`);
  const errors = [];
  if (beforeDeath !== "made" || beforeEnding !== "made" || after.promises[holder] !== "made") errors.push(`untested promise state changed for ${holder}`);
  if (new RegExp(`(?:broken.{0,80}promise.{0,80}${holderName}|${holderName}.{0,80}promise.{0,80}broken)`, "i").test(reflection)) errors.push(`ending describes ${holder}'s untested promise as broken`);
  if (new RegExp(`(?:promise.{0,80}${holderName}|${holderName}.{0,80}promise)`, "i").test(reflection)) errors.push(`ending includes ${holder}'s untested promise`);
  return { id: "V6", holder, passed: !errors.length, errors, beforeDeath, beforeEnding, afterEnding: after.promises[holder], endingTitle: runtime.browser.document.getElementById("ending-title").textContent, reflection };
}

function runSelfTest() {
  const injectedV1 = v1Violation("fixture_v1", { survivors: 1, integrity: 1, cohesion: 1, supplies: 0, embryos: 1 }, [{ choice: { text: "blocked" }, index: 0, requirementsMet: true, affordable: false }]);
  assert.equal(injectedV1.rule, "legally_reached_render_has_zero_enabled_exits");
  const injectedV4 = v4Violations({ choice: { text: "comfort", flag: { final: "comfort" }, requires: { supplies: { min: 15 } } }, index: 0, affordable: true }, [], "fixture_v4");
  assert.ok(injectedV4.some(item => item.rule === "comfort_fuel_cost_not_declared"));
  const economyBefore = { integrity: 50, cohesion: 50, supplies: 10, embryos: 80 };
  const economyAfterSpend = { ...economyBefore, supplies: 7 };
  const recordedSpend = economyChoiceRecord(
    { choice: { text: "Spend", effects: { supplies: -3 } }, index: 0 },
    [{ changes: { supplies: -3 }, before: economyBefore, after: economyAfterSpend, affordable: true }],
    economyBefore,
    economyAfterSpend,
    "fixture_economy"
  );
  assert.deepEqual(economyChoiceViolations(recordedSpend), []);
  assert.equal(buildEconomyRecord(economyBefore, economyAfterSpend, [recordedSpend]).reconciled, true);
  const unrecordedSpend = economyChoiceRecord(
    { choice: { text: "Hidden spend" }, index: 0 },
    [],
    economyBefore,
    economyAfterSpend,
    "fixture_economy"
  );
  assert.ok(economyChoiceViolations(unrecordedSpend).some(item => item.rule === "unrecorded_resource_spend"));
  assert.equal(buildEconomyRecord(economyBefore, economyAfterSpend, [unrecordedSpend]).reconciled, false);
  const phantomCreditAfter = { ...economyBefore, supplies: 12 };
  const phantomCredit = economyChoiceRecord(
    { choice: { text: "Phantom credit" }, index: 0 },
    [],
    economyBefore,
    phantomCreditAfter,
    "fixture_economy"
  );
  assert.ok(economyChoiceViolations(phantomCredit).some(item => item.rule === "phantom_resource_credit"));
  const injectedV5 = v5Violations({ flags: { final: "comfort", planet: "committed", vault_sacrifice: "split" }, ideology: { future: 0, living: 0 } }, { title: "Landfall", text: "The course remains locked." }, ["The recorded orders remained split between Future and Living."]);
  assert.ok(injectedV5.some(item => item.rule === "landfall_without_final_hold"));
  const nonzero = { summaries: [{ policy: "random", runs: 1, endings: 1, incomplete: 0, errors: 0, economy: { runsReconciled: 1 }, invariantTotals: { V1: 0, V4: 1, V5: 0 } }] };
  assert.ok(strictErrors(nonzero).some(error => error.includes("V4")), "strict gate accepted nonzero V4");
  assert.equal(derivedSeed(LOCKED_SEED, "random", 63), derivedSeed(LOCKED_SEED, "random", 63), "seed derivation changed across shard layouts");
  assert.equal(normalizedHash({ b: 2, a: 1 }), normalizedHash({ a: 1, b: 2 }), "canonical hash depends on key order");
  const first = emptySummary("random", 0, 1); first.endRun = 1;
  const second = emptySummary("random", 1, 1); second.endRun = 2;
  assert.equal(mergeShards("random", [second, first], 2).runs, 2, "order-independent merge failed");
  assert.throws(() => mergeShards("random", [first, { ...second, startRun: 2, endRun: 3 }], 3), /gap/);
  assert.throws(() => mergeShards("random", [first, { ...second, startRun: 0, endRun: 1 }], 1), /overlaps|gap/);
  assert.throws(() => parseWorkerOutput({ status: 0, stdout: "not-json", stderr: "" }, "fixture"), /malformed JSON/);
  assert.ok(smokeErrors({ normalizedHash: "a" }, { normalizedHash: "a" }, { simulation: { smokeBaseline: null } }).some(error => error.includes("missing")));
  const smokeFixture = { simulation: { seed: LOCKED_SEED, smokeRunsPerPolicy: 64, policies: LOCKED_POLICY_NAMES, smokeBaseline: { certification: "NO-PUBLISH / NOT_CERTIFIED" } } };
  const smokeReport = { profile: "smoke", normalizedHash: "a", config: { seed: LOCKED_SEED, runs: 64, policies: LOCKED_POLICY_NAMES }, summaries: [] };
  assert.ok(smokeErrors(smokeReport, { normalizedHash: "b" }, smokeFixture).some(error => error.includes("repeat hash mismatch")));
  assert.ok(gatePreflightErrors({ gate: "strict", profile: "strict", seed: LOCKED_SEED, runs: STRICT_RUNS_PER_POLICY, shardSize: STRICT_SHARD_SIZE, workerHeapMb: WORKER_HEAP_MB + 1 }).some(error => error.includes("heap 384 MB")));
  assert.ok(gatePreflightErrors(parseCli(["--profile", "strict", "--policy", "living", "--gate", "strict"])).some(error => error.includes("diagnostic-only")));
  console.log("PASS simulator self-test — injected V1/V4/V5, reconciled economy plus hidden-spend/phantom-credit negatives, strict rejection, process-shard coverage, canonical hashing, and baseline negatives verified");
}

function parseCli(argv) {
  const options = { profile: "smoke", profileExplicit: false, policy: "all", runs: null, seed: LOCKED_SEED, startRun: 0, shardSize: null, maxSteps: 600, workerHeapMb: WORKER_HEAP_MB, gate: null, gateExplicit: false, baseline: DEFAULT_BASELINE, root: DEFAULT_ROOT, json: false, worker: false, selfTest: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--profile") { options.profile = argv[++index]; options.profileExplicit = true; }
    else if (arg === "--policy") options.policy = argv[++index];
    else if (arg === "--runs") options.runs = Number(argv[++index]);
    else if (arg === "--seed") options.seed = Number(argv[++index]);
    else if (arg === "--start-run") options.startRun = Number(argv[++index]);
    else if (arg === "--shard-size") options.shardSize = Number(argv[++index]);
    else if (arg === "--max-steps") options.maxSteps = Number(argv[++index]);
    else if (arg === "--worker-heap-mb") options.workerHeapMb = Number(argv[++index]);
    else if (arg === "--gate") { options.gate = argv[++index]; options.gateExplicit = true; }
    else if (arg === "--baseline") options.baseline = argv[++index];
    else if (arg === "--root") options.root = resolve(argv[++index]);
    else if (arg === "--json") options.json = true;
    else if (arg === "--worker-json") options.worker = true;
    else if (arg === "--self-test") options.selfTest = true;
    else if (arg === "--help") options.help = true;
    else if (arg === "--assert-v6") options.assertV6 = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (!new Set(["smoke", "strict"]).has(options.profile)) throw new Error("--profile must be smoke or strict");
  if (options.runs == null) options.runs = options.profile === "strict" ? STRICT_RUNS_PER_POLICY : 64;
  if (options.shardSize == null) options.shardSize = options.profile === "strict" ? STRICT_SHARD_SIZE : 32;
  if (options.gate == null) options.gate = options.profile === "strict" ? "strict" : "smoke";
  if ((POLICY_ALIASES.has(options.policy) || POLICY_NAMES.includes(options.policy)) && !options.profileExplicit && !options.gateExplicit) options.gate = "none";
  for (const [label, value] of Object.entries({ runs: options.runs, seed: options.seed, startRun: options.startRun, shardSize: options.shardSize, maxSteps: options.maxSteps, workerHeapMb: options.workerHeapMb })) {
    if (!Number.isInteger(value) || (label === "startRun" ? value < 0 : value < 1)) throw new Error(`${label} must be ${label === "startRun" ? "a non-negative" : "a positive"} integer`);
  }
  if (options.worker && !LOCKED_POLICY_NAMES.includes(options.policy)) throw new Error("worker policy must be random, cheapest, or priciest");
  if (!options.worker && options.policy !== "all" && !LOCKED_POLICY_NAMES.includes(options.policy) && !POLICY_ALIASES.has(options.policy)) throw new Error("unknown policy");
  return options;
}

function printReport(report, errors) {
  console.log(`[simulate] ${report.profile.toUpperCase()} — ${report.certification}`);
  console.log(`[simulate] normalized_sha256=${report.normalizedHash}`);
  if (report.repeatNormalizedHash) console.log(`[simulate] repeat_normalized_sha256=${report.repeatNormalizedHash}`);
  for (const summary of report.summaries) {
    console.log(`[simulate] ${summary.policy}: endings=${summary.endings}/${summary.runs} incomplete=${summary.incomplete} errors=${summary.errors} V1=${summary.invariantTotals.V1} V4=${summary.invariantTotals.V4} V5=${summary.invariantTotals.V5}`);
    console.log(`[simulate] ${summary.policy} economy: reconciled=${summary.economy.runsReconciled}/${summary.runs} transactions=${summary.economy.transactions} declared=${JSON.stringify(summary.economy.declaredTotals)} actual=${JSON.stringify(summary.economy.actualTotals)} observed=${JSON.stringify(summary.economy.observedTotals)} ending_ranges=${JSON.stringify(summary.economy.endingRanges)}`);
    for (const invariant of ["V1", "V4", "V5"]) for (const [fingerprint, witness] of Object.entries(summary.witnesses[invariant])) console.log(`[simulate] witness ${summary.policy}/${invariant}/${fingerprint} seed=${witness.seed} scene=${witness.violation.scene}`);
  }
  if (errors.length) errors.forEach(error => console.error(`[simulate] FAIL ${error}`));
  else console.log(`[simulate] ${report.profile === "strict" ? "STRICT GATE PASS" : "VERSION SMOKE PASS — non-certifying"}`);
}

async function main() {
  const options = parseCli(process.argv.slice(2));
  if (options.help) {
    console.log("Self-test: node scripts/simulate.mjs --self-test");
    console.log("Smoke: node scripts/simulate.mjs --profile smoke --policy all --runs 64 --seed 20260817 --shard-size 32 --gate smoke [--json]");
    console.log("Strict: node scripts/simulate.mjs --profile strict --policy random|cheapest|priciest --runs 2000 --seed 20260817 --shard-size 500 --gate strict [--json]");
    return;
  }
  if (options.selfTest) return runSelfTest();
  if (options.worker) {
    const summary = runWorkerShard(options.root, { policy: options.policy, runs: options.runs, startRun: options.startRun, seed: options.seed, maxSteps: options.maxSteps });
    process.stdout.write(JSON.stringify(summary));
    return;
  }
  const preflightErrors = gatePreflightErrors(options);
  if (preflightErrors.length) {
    if (options.json) console.log(JSON.stringify({ profile: options.profile, certification: "NO-PUBLISH / NOT_CERTIFIED", assertions: preflightErrors }));
    else preflightErrors.forEach(error => console.error(`[simulate] FAIL ${error}`));
    process.exitCode = 1;
    return;
  }
  if (POLICY_ALIASES.has(options.policy) || POLICY_NAMES.includes(options.policy)) {
    const policy = POLICY_ALIASES.get(options.policy) || options.policy;
    const results = runPolicySet(options.root, { policies: [policy], runs: options.runs, seed: options.seed });
    const errors = results.flatMap(result => simulationAssertions(result).map(error => `${result.policy}/${result.seed}: ${error}`));
    const v6 = options.assertV6 ? assertV6(options.root) : null;
    if (v6 && !v6.passed) errors.push(...v6.errors);
    console.log(JSON.stringify({ profile: "legacy-smoke", certification: "NO-PUBLISH / NOT_CERTIFIED", results, v6, assertions: errors }, null, options.json ? 0 : 2));
    if (errors.length) process.exitCode = 1;
    return;
  }
  const policies = options.policy === "all" ? LOCKED_POLICY_NAMES : [options.policy];
  const report = runProcessProfile(options.root, { profile: options.profile, policies, runs: options.runs, seed: options.seed, shardSize: options.shardSize, maxSteps: options.maxSteps, workerHeapMb: options.workerHeapMb });
  let errors = [];
  if (options.gate === "strict") {
    errors.push(...strictErrors(report));
  } else if (options.gate === "smoke") {
    const fixture = JSON.parse(readFileSync(resolve(options.root, options.baseline), "utf8"));
    const repeatReport = runProcessProfile(options.root, { profile: options.profile, policies, runs: options.runs, seed: options.seed, shardSize: options.shardSize, maxSteps: options.maxSteps, workerHeapMb: options.workerHeapMb });
    errors.push(...smokeErrors(report, repeatReport, fixture));
    report.repeatNormalizedHash = repeatReport.normalizedHash;
  }
  if (options.json) console.log(JSON.stringify({ ...report, assertions: errors })); else printReport(report, errors);
  if (errors.length) process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch(error => { console.error(error.stack || error.message); process.exitCode = 1; });
}
