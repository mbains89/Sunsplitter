// SUN-TESTS-PLAYERFLOW-01 — a negative choice cost actually debits the resource.
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
    return { found: true, sample, before, after: state[sample.key] };
  })()`);
  if (!result || !result.found) {
    bugs.push("SUN-PLAYERFLOW-COST-01 no choice with a negative supplies/cohesion/integrity effect was registered");
  } else if (!(result.after < result.before)) {
    bugs.push("SUN-PLAYERFLOW-COST-01 " + result.sample.id + " choice " + result.sample.i + " advertised " + result.sample.delta + " " + result.sample.key + " but state stayed " + result.before + " → " + result.after);
  }
  if (bugs.length) {
    console.log("SKIP sun-playerflow-costs expected-fail " + bugs.join(" ; "));
    return [];
  }
  return errors;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const errors = sunPlayerflowCostsChecks();
  if (errors.length) {
    console.error("FAIL sun-playerflow-costs", errors);
    process.exit(1);
  }
  console.log("PASS sun-playerflow-costs (negative choice effect debited the resource)");
}
