// SUN-TESTS-PLAYERFLOW-01 — save, new VM, continue lands on the same scene and resources.
import { pathToFileURL } from "node:url";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadGame } from "./simulate.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export function sunPlayerflowSaveChecks() {
  const errors = [];
  const writer = loadGame(ROOT);
  const saved = writer.evaluate(`(() => {
    localStorage.clear();
    resetRunState();
    state.scene = "act3_spine_next";
    state.supplies = 23;
    state.cohesion = 17;
    state.survivors = 7;
    state.flags.priority = "repairs";
    if (!state.dead.includes("vess")) state.dead.push("vess");
    state.deathCause.vess = "playerflow fixture";
    persistSave({ silent: true });
    return {
      raw: localStorage.getItem(SAVE_KEY),
      scene: state.scene,
      supplies: state.supplies,
      cohesion: state.cohesion
    };
  })()`);
  if (!saved || !saved.raw) return ["writer did not persist SAVE_KEY"];
  const reader = loadGame(ROOT);
  const raw = JSON.stringify(saved.raw);
  const resumed = reader.evaluate(`(() => {
    localStorage.clear();
    localStorage.setItem(SAVE_KEY, ${raw});
    const ok = resumeGame();
    if (typeof finishCinematic === "function" && currentCinematic) finishCinematic();
    return {
      ok,
      scene: state.scene,
      supplies: state.supplies,
      cohesion: state.cohesion,
      dead: state.dead.slice(),
      resumeHidden: document.getElementById("btn-resume").classList.contains("hidden")
    };
  })()`);
  if (!resumed || !resumed.ok) errors.push("continue/resumeGame returned false: " + JSON.stringify(resumed));
  if (!resumed || resumed.scene !== "act3_spine_next") errors.push("continue did not land on act3_spine_next: " + JSON.stringify(resumed));
  if (!resumed || resumed.supplies !== 23 || resumed.cohesion !== 17) errors.push("continue did not restore resources: " + JSON.stringify(resumed));
  if (!resumed || !resumed.dead.includes("vess")) errors.push("continue dropped dead vess: " + JSON.stringify(resumed));
  return errors;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const errors = sunPlayerflowSaveChecks();
  if (errors.length) {
    console.error("FAIL sun-playerflow-save", errors);
    process.exit(1);
  }
  console.log("PASS sun-playerflow-save (cross-vm continue restored act3_spine_next, supplies 23, cohesion 17, dead vess)");
}
