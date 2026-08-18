#!/usr/bin/env node

import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SEED = 20260817;
const RUNS_PER_POLICY = 25;
const MAX_STEPS = 500;
const POLICIES = ["random", "cheapest", "priciest"];
const RESOURCE_KEYS = ["survivors", "integrity", "cohesion", "supplies", "embryos"];
const CAPS = {
  survivors: [0, 20],
  integrity: [0, 100],
  cohesion: [0, 100],
  supplies: [0, 100],
  embryos: [0, 100]
};

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

async function createWorld() {
  const context = vm.createContext({
    console,
    setTimeout,
    clearTimeout
  });
  const sceneFiles = (await readdir(path.join(ROOT, "src")))
    .filter(name => /^scenes-\d{2}\.js$/.test(name))
    .sort();

  async function run(file) {
    const source = await readFile(path.join(ROOT, file), "utf8");
    new vm.Script(source, { filename: file }).runInContext(context);
  }

  await run("src/state.js");
  for (const file of sceneFiles) await run(`src/${file}`);

  return {
    context,
    scenes: vm.runInContext("scenes", context),
    state: vm.runInContext("state", context),
    isAlive: vm.runInContext("isAlive", context),
    mark: vm.runInContext("mark", context),
    remember: vm.runInContext("remember", context),
    lean: vm.runInContext("lean", context)
  };
}

function resetWorld(world) {
  vm.runInContext(`(() => {
    const next = freshState();
    for (const key of Object.keys(state)) delete state[key];
    Object.assign(state, next);
  })()`, world.context);
}

function canAfford(state, effects) {
  if (!effects || typeof effects !== "object") return true;
  for (const [key, value] of Object.entries(effects)) {
    if (typeof value !== "number" || value >= 0) continue;
    const current = typeof state[key] === "number" ? state[key] : 0;
    if (current + value < 0) return false;
  }
  return true;
}

function meetsRequirements(state, requirements) {
  if (!requirements || typeof requirements !== "object") return true;
  for (const [key, rule] of Object.entries(requirements)) {
    if (key === "trust") {
      if (!rule || typeof rule !== "object") continue;
      for (const [who, trustRule] of Object.entries(rule)) {
        const value = (state.trust && state.trust[who]) || 0;
        if (typeof trustRule === "number" && value < trustRule) return false;
        if (trustRule && typeof trustRule === "object") {
          if (trustRule.min !== undefined && value < trustRule.min) return false;
          if (trustRule.max !== undefined && value > trustRule.max) return false;
        }
      }
      continue;
    }

    const value = state[key];
    if (value === undefined) continue;
    if (typeof rule === "number" && value < rule) return false;
    if (rule && typeof rule === "object") {
      if (rule.min !== undefined && value < rule.min) return false;
      if (rule.max !== undefined && value > rule.max) return false;
    }
  }
  return true;
}

function enabledChoices(world, scene) {
  const raw = scene.choices;
  const choices = typeof raw === "function" ? (raw.call(scene) || []) : (raw || []);
  if (!Array.isArray(choices)) throw new Error("scene choices did not resolve to an array");
  return choices.filter(choice => {
    if (choice.alive && !world.isAlive(choice.alive)) return false;
    if (choice.aliveAll && !choice.aliveAll.every(key => world.isAlive(key))) return false;
    if (choice.aliveAny && !choice.aliveAny.some(key => world.isAlive(key))) return false;
    return canAfford(world.state, choice.effects) && meetsRequirements(world.state, choice.requires);
  });
}

function cost(choice) {
  if (!choice.effects || typeof choice.effects !== "object") return 0;
  return Object.values(choice.effects)
    .filter(value => typeof value === "number" && value < 0)
    .reduce((total, value) => total - value, 0);
}

function choose(policy, choices, random) {
  if (policy === "random") return choices[Math.floor(random() * choices.length)];
  const target = policy === "cheapest"
    ? Math.min(...choices.map(cost))
    : Math.max(...choices.map(cost));
  const tied = choices.filter(choice => cost(choice) === target);
  return tied[Math.floor(random() * tied.length)];
}

function applyChoice(world, choice) {
  const { state } = world;
  if (choice.effects && typeof choice.effects === "object") {
    for (const key of RESOURCE_KEYS) {
      if (choice.effects[key] === undefined) continue;
      const [minimum, maximum] = CAPS[key];
      state[key] = Math.max(minimum, Math.min(maximum, state[key] + choice.effects[key]));
    }
  }
  if (choice.flag && typeof choice.flag === "object") Object.assign(state.flags, choice.flag);
  if (choice.affinity && typeof choice.affinity === "object") {
    for (const [who, amount] of Object.entries(choice.affinity)) {
      if (state.affinity[who] !== undefined) {
        state.affinity[who] = Math.max(0, Math.min(100, state.affinity[who] + amount));
      }
    }
  }
  if (choice.trust && typeof choice.trust === "object") {
    for (const [who, amount] of Object.entries(choice.trust)) {
      if (state.trust[who] !== undefined) {
        state.trust[who] = Math.max(0, Math.min(100, state.trust[who] + amount));
      }
    }
  }
  if (choice.mark && typeof choice.mark === "object") {
    for (const [who, tag] of Object.entries(choice.mark)) world.mark(who, tag);
  }
  if (choice.remember) world.remember(choice.remember);
  if (choice.lean && typeof choice.lean === "object") {
    for (const [side, amount] of Object.entries(choice.lean)) world.lean(side, amount);
  }
}

function runOnce(world, policy, random) {
  resetWorld(world);
  let sceneId = "wake";

  for (let steps = 0; steps < MAX_STEPS; steps += 1) {
    world.state.scene = sceneId;
    if (sceneId === "ending_check") {
      return { outcome: "ending", steps, survivors: world.state.survivors };
    }

    const scene = world.scenes[sceneId];
    if (!scene) throw new Error(`missing scene: ${sceneId}`);
    if (typeof scene.onEnter === "function") {
      const redirect = scene.onEnter();
      if (typeof redirect === "string" && redirect && redirect !== sceneId) {
        sceneId = redirect;
        continue;
      }
    }

    const choices = enabledChoices(world, scene);
    if (choices.length === 0) {
      return { outcome: "softlock", steps, survivors: world.state.survivors, sceneId };
    }
    const choice = choose(policy, choices, random);
    applyChoice(world, choice);
    sceneId = choice.next;
  }

  return { outcome: "step-limit", steps: MAX_STEPS, survivors: world.state.survivors, sceneId };
}

async function main() {
  const world = await createWorld();
  const summaries = [];

  for (const [policyIndex, policy] of POLICIES.entries()) {
    const summary = {
      policy,
      runs: RUNS_PER_POLICY,
      endings: 0,
      softlocks: 0,
      stepLimits: 0,
      errors: 0,
      totalSteps: 0,
      totalSurvivors: 0
    };

    for (let run = 0; run < RUNS_PER_POLICY; run += 1) {
      const random = mulberry32(SEED + policyIndex * 100000 + run);
      try {
        const result = runOnce(world, policy, random);
        summary.totalSteps += result.steps;
        summary.totalSurvivors += result.survivors;
        if (result.outcome === "ending") summary.endings += 1;
        else if (result.outcome === "softlock") summary.softlocks += 1;
        else summary.stepLimits += 1;
      } catch (error) {
        summary.errors += 1;
        console.error(`[simulate] ${policy} run ${run + 1}: ${error.stack || error.message}`);
      }
    }
    summaries.push(summary);
  }

  console.log("[simulate] Minimal deterministic skeleton");
  console.log(`[simulate] seed=${SEED} runs=${RUNS_PER_POLICY}/policy maxSteps=${MAX_STEPS}`);
  for (const summary of summaries) {
    const avgSteps = (summary.totalSteps / summary.runs).toFixed(1);
    const avgSurvivors = (summary.totalSurvivors / summary.runs).toFixed(1);
    console.log(`[simulate] ${summary.policy}: endings=${summary.endings} softlocks=${summary.softlocks} stepLimits=${summary.stepLimits} errors=${summary.errors} avgSteps=${avgSteps} avgSurvivors=${avgSurvivors}`);
  }
  console.log("[simulate] complete; V1-V6 assertions are intentionally deferred");

  if (summaries.some(summary => summary.errors > 0)) process.exitCode = 1;
}

main().catch(error => {
  console.error(`[simulate] CRASH: ${error.stack || error.message}`);
  process.exitCode = 1;
});
