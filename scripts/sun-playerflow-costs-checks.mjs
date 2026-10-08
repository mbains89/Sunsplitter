// SUN-PLAYERFLOW-COSTCHECK-03 — a costed choice must not be offered while unaffordable.
// Missing cost data fails. Any SKIP on the cost path fails. A failure exits non-zero.
// --broken-fixture injects a test-only scene into the live `scenes` object. The same
// walk that guards players is what goes red. The fixture is not a shipped scene.
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

export async function sunPlayerflowCostsChecks(opts = {}) {
  const errors = [];
  const runtime = loadGame(ROOT);
  let fixture = null;
  if (opts.brokenFixture) {
    ({ brokenCostFixture: fixture } = await import(FIXTURE_URL));
  }
  const live = runtime.evaluate(`((fixture) => {
    const keys = ${JSON.stringify(RESOURCE_KEYS)};
    const problems = [];
    if (fixture && fixture.id) {
      if (scenes[fixture.id]) problems.push("fixture id collided with a shipped scene: " + fixture.id);
      scenes[fixture.id] = {
        text: "test-only costcheck fixture",
        costcheckSkip: fixture.skip || "",
        choices: (fixture.choices || []).map(choice => ({
          text: choice.text,
          effects: choice.effects,
          forceOffer: choice.forceOffer === true,
          next: fixture.id
        }))
      };
    }
    const hits = [];
    for (const id of Object.keys(scenes)) {
      const scene = scenes[id];
      const list = scene && scene.choices;
      if (scene && scene.costcheckSkip) {
        problems.push("SKIP on cost path is a failure: " + scene.costcheckSkip);
      }
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
      return { problems, checked: 0, fixtureWalked: false };
    }
    const realAfford = canAffordEffects;
    for (const sample of hits) {
      resetRunState();
      state[sample.key] = 0;
      const choicesEl = document.getElementById("choices");
      if (choicesEl && choicesEl.children) choicesEl.children.length = 0;
      const choice = scenes[sample.id].choices[sample.i];
      if (choice.forceOffer) canAffordEffects = function () { return true; };
      showScene(sample.id, { skipOnEnter: true });
      canAffordEffects = realAfford;
      if (realAfford(choice.effects)) {
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
      if (choice.forceOffer) canAffordEffects = function () { return true; };
      makeChoice(choice);
      canAffordEffects = realAfford;
      if (state[sample.key] !== before || state.scene !== sceneBefore) {
        problems.push(sample.id + " choice " + sample.i + " applied while unaffordable (" + sample.key + " " + before + " -> " + state[sample.key] + ")");
      }
    }
    const paid = hits.find(hit => !String(hit.id).startsWith("costcheck_fixture_")) || hits[0];
    resetRunState();
    state[paid.key] = 80;
    const beforePaid = state[paid.key];
    makeChoice(scenes[paid.id].choices[paid.i]);
    if (!(state[paid.key] < beforePaid)) {
      problems.push(paid.id + " choice " + paid.i + " did not debit " + paid.key + " when the cost was payable");
    }
    return {
      problems,
      checked: hits.length,
      fixtureWalked: !!(fixture && hits.some(hit => hit.id === fixture.id))
    };
  })(${JSON.stringify(fixture)})`);

  if (!live) recordSkip(errors, "cost check returned no result");
  else for (const line of live.problems || []) errors.push(line);
  if (opts.brokenFixture && (!live || !live.fixtureWalked)) {
    recordSkip(errors, "broken fixture was not walked on the live scenes path");
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
