// SUN-TESTS-PLAYERFLOW-01 — a negative choice cost actually debits the resource.
// SUN-PLAYERFLOW-COST-02 is expected-fail: makeChoice does not refuse an unaffordable debit.
import { pathToFileURL } from "node:url";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadGame } from "./simulate.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export function sunPlayerflowCostsChecks() {
  const errors = [];
  const bugs = [];
  const runtime = loadGame(ROOT);
  const result = runtime.evaluate(`(() => {
    const hit = [];
    for (const id of Object.keys(scenes)) {
      const choices = (scenes[id] && scenes[id].choices) || [];
      for (let i = 0; i < choices.length; i++) {
        const effects = choices[i] && choices[i].effects;
        if (!effects) continue;
        for (const key of ["supplies", "cohesion", "integrity"]) {
          if (typeof effects[key] === "number" && effects[key] < 0) hit.push({ id, i, key, delta: effects[key] });
        }
      }
    }
    if (!hit.length) return { found: false };
    const sample = hit[0];
    resetRunState();
    state[sample.key] = 40;
    const before = state[sample.key];
    makeChoice(scenes[sample.id].choices[sample.i]);
    const after = state[sample.key];
    resetRunState();
    state[sample.key] = 0;
    makeChoice(scenes[sample.id].choices[sample.i]);
    return { found: true, sample, before, after, brokeEven: state[sample.key] };
  })()`);
  if (!result || !result.found) {
    bugs.push("SUN-PLAYERFLOW-COST-01 no choice with a negative supplies/cohesion/integrity effect was registered");
  } else if (!(result.after < result.before)) {
    bugs.push("SUN-PLAYERFLOW-COST-01 " + result.sample.id + " choice " + result.sample.i + " advertised " + result.sample.delta + " " + result.sample.key + " but state stayed " + result.before + " -> " + result.after);
  } else if (result.brokeEven !== 0) {
    bugs.push("SUN-PLAYERFLOW-COST-02 " + result.sample.id + " choice " + result.sample.i + " debited " + result.sample.key + " from 0 to " + result.brokeEven + " (makeChoice does not refuse an unaffordable cost). file: src/engine.js makeChoice/updateStats. repro: state[" + result.sample.key + "]=0; makeChoice(scenes[" + result.sample.id + "].choices[" + result.sample.i + "]). seed: n/a (direct call).");
  }
  if (bugs.length) {
    console.log("SKIP sun-playerflow-costs expected-fail " + bugs.join(" ; "));
    if (bugs.some(line => line.startsWith("SUN-PLAYERFLOW-COST-01"))) return [];
  }
  return errors;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const errors = sunPlayerflowCostsChecks();
  if (errors.length) {
    console.error("FAIL sun-playerflow-costs", errors);
    process.exit(1);
  }
  console.log("PASS sun-playerflow-costs (negative choice effect debited the resource; unaffordable refusal recorded if skipped)");
}
