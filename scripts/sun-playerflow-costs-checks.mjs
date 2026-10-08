// SUN-PLAYERFLOW-COSTCHECK-03 — a costed choice must not be offered while unaffordable.
// Missing cost data fails. Any SKIP on the cost path fails. A failure exits non-zero.
// The broken fixture is test-only and is not loaded unless --broken-fixture is passed.
import { pathToFileURL } from "node:url";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadGame } from "./simulate.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const FIXTURE_URL = new URL("./fixtures/costcheck-broken.mjs", import.meta.url);
const RESOURCE_KEYS = ["supplies", "cohesion", "integrity", "embryos", "survivors"];

function recordSkip(errors, message) {
  errors.push("SKIP on cost path is a failure: " + message);
}

function applyBrokenFixture(errors, fixture) {
  if (!fixture || !Array.isArray(fixture.choices) || !fixture.choices.length) {
    recordSkip(errors, "broken fixture missing choices");
    return;
  }
  if (fixture.skip) recordSkip(errors, fixture.skip);
  for (const choice of fixture.choices) {
    const effects = choice && choice.effects;
    if (!effects || typeof effects !== "object") {
      errors.push("FIXTURE " + (fixture.id || "costcheck") + " cost data missing");
      continue;
    }
    for (const key of RESOURCE_KEYS) {
      if (!Object.prototype.hasOwnProperty.call(effects, key)) continue;
      const delta = effects[key];
      if (typeof delta !== "number" || !Number.isFinite(delta)) {
        errors.push("FIXTURE " + fixture.id + " cost data missing for " + key);
        continue;
      }
      const have = choice.balance && typeof choice.balance[key] === "number" ? choice.balance[key] : 0;
      if (delta < 0 && have + delta < 0 && choice.offered) {
        errors.push("FIXTURE " + fixture.id + " offered while unaffordable (" + key + " " + delta + " at " + have + ")");
      }
    }
  }
}

export async function sunPlayerflowCostsChecks(opts = {}) {
  const errors = [];
  const runtime = loadGame(ROOT);
  const live = runtime.evaluate(`(() => {
    const keys = ${JSON.stringify(RESOURCE_KEYS)};
    const problems = [];
    const hits = [];
    for (const id of Object.keys(scenes)) {
      const list = scenes[id] && scenes[id].choices;
      if (!list || typeof list === "function") continue;
      list.forEach((choice, i) => {
        if (!choice || choice.effects == null) return;
        if (typeof choice.effects !== "object") {
          problems.push(id + " choice " + i + " cost data missing (effects is not an object)");
          return;
        }
        for (const key of keys) {
          if (!Object.prototype.hasOwnProperty.call(choice.effects, key)) continue;
          const delta = choice.effects[key];
          if (typeof delta !== "number" || !Number.isFinite(delta)) {
            problems.push(id + " choice " + i + " cost data missing for " + key);
            continue;
          }
          if (delta < 0) hits.push({ id, i, key, delta });
        }
      });
    }
    if (!hits.length) {
      problems.push("SKIP on cost path is a failure: no costed choice registered");
      return { problems, checked: 0 };
    }
    for (const sample of hits) {
      resetRunState();
      state[sample.key] = 0;
      const choicesEl = document.getElementById("choices");
      if (choicesEl && choicesEl.children) choicesEl.children.length = 0;
      showScene(sample.id, { skipOnEnter: true });
      const choice = scenes[sample.id].choices[sample.i];
      if (canAffordEffects(choice.effects)) {
        problems.push(sample.id + " choice " + sample.i + " still affordable at " + sample.key + "=0");
        continue;
      }
      const needle = String(choice.text || "").slice(0, 48);
      const fresh = choicesEl && choicesEl.children ? choicesEl.children : [];
      const btn = fresh.find(b => (b.innerHTML || "").includes(needle));
      if (btn && !btn.disabled) {
        problems.push(sample.id + " choice " + sample.i + " offered while unaffordable (" + sample.key + " " + sample.delta + " at 0)");
      }
      const before = state[sample.key];
      const sceneBefore = state.scene;
      makeChoice(choice);
      if (state[sample.key] !== before || state.scene !== sceneBefore) {
        problems.push(sample.id + " choice " + sample.i + " applied while unaffordable (" + sample.key + " " + before + " -> " + state[sample.key] + ")");
      }
    }
    const paid = hits[0];
    resetRunState();
    state[paid.key] = 80;
    const beforePaid = state[paid.key];
    makeChoice(scenes[paid.id].choices[paid.i]);
    if (!(state[paid.key] < beforePaid)) {
      problems.push(paid.id + " choice " + paid.i + " did not debit " + paid.key + " when the cost was payable");
    }
    return { problems, checked: hits.length };
  })()`);

  if (!live) recordSkip(errors, "cost check returned no result");
  else for (const line of live.problems || []) errors.push(line);

  if (opts.brokenFixture) {
    const { brokenCostFixture } = await import(FIXTURE_URL);
    applyBrokenFixture(errors, brokenCostFixture);
  }
  return errors;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const errors = await sunPlayerflowCostsChecks({ brokenFixture: process.argv.includes("--broken-fixture") });
  if (errors.length) {
    console.error("FAIL sun-playerflow-costs");
    for (const line of errors) console.error("FAIL " + line);
    process.exit(1);
  }
  console.log("PASS sun-playerflow-costs (costed choices not offered while unaffordable; cost data present; no SKIP)");
}
