// SUN-TESTS-PLAYERFLOW-01 — every named ending can be resolved and still has a live What remains exit.
import { pathToFileURL } from "node:url";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadGame } from "./simulate.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const SETUPS = [
  { name: "Quiet Ship", apply: "state.survivors = 3; state.cohesion = 10; state.flags.final = 'endure';" },
  { name: "Landfall", apply: "state.survivors = 8; state.cohesion = 70; state.embryos = 80; state.integrity = 50; state.flags.crisis = 'custody'; state.flags.vault_sacrifice = 'future'; state.flags.final = 'hold'; state.leadership = 'together';" },
  { name: "The Living Ship", apply: "state.survivors = 7; state.cohesion = 40; state.flags.vault_sacrifice = 'living'; state.flags.final = 'endure';" },
  { name: "Still Burning", apply: "state.survivors = 7; state.cohesion = 60; state.integrity = 40; state.leadership = 'together'; state.flags.final = 'hold'; state.flags.vault_sacrifice = 'split';" },
  { name: "Fracture", apply: "state.survivors = 6; state.cohesion = 12; state.leadership = 'watch'; state.flags.final = 'endure';" },
  { name: "The Long Dark", apply: "state.survivors = 6; state.cohesion = 36; state.integrity = 28; state.flags.final = 'endure'; state.flags.vault_sacrifice = 'split'; state.leadership = 'together';" },
  { name: "The Yellow Circle", apply: "state.survivors = 7; state.cohesion = 55; state.flags.final = 'endure'; state.marks.sela = 'spoken'; state.flags.vault_sacrifice = 'living';" }
];

export function sunPlayerflowEndingsChecks() {
  const errors = [];
  const reached = [];
  for (const setup of SETUPS) {
    const runtime = loadGame(ROOT);
    const result = runtime.evaluate(`(() => {
      resetRunState();
      ${setup.apply}
      if (typeof resolveEnding !== "function") return { ok: false, reason: "resolveEnding missing" };
      resolveEnding();
      if (typeof finishCinematic === "function" && currentCinematic) finishCinematic();
      const title = document.getElementById("ending-title").textContent;
      const exit = document.getElementById("btn-what-remains");
      const endingHidden = document.getElementById("ending-screen").classList.contains("hidden");
      if (exit && typeof showWhatRemains === "function") showWhatRemains();
      const remainsHidden = document.getElementById("what-remains-screen").classList.contains("hidden");
      return { ok: !!title && !!exit && !endingHidden, title, endingHidden, remainsHidden, exit: !!exit };
    })()`);
    if (!result || !result.ok) {
      errors.push(setup.name + " did not reach a live ending exit: " + JSON.stringify(result));
      continue;
    }
    if (result.remainsHidden) errors.push(setup.name + " What remains screen stayed hidden");
    reached.push(setup.name + " → " + result.title);
  }
  if (!reached.length) errors.push("no ending produced a title and What remains button");
  return errors;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const errors = sunPlayerflowEndingsChecks();
  if (errors.length) {
    console.error("FAIL sun-playerflow-endings", errors);
    process.exit(1);
  }
  console.log("PASS sun-playerflow-endings (named setups resolved with a live What remains exit)");
}
