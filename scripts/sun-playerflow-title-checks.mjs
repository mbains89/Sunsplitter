// SUN-TESTS-PLAYERFLOW-01 — new run from a clean title reaches wake, then the first choice moves the scene.
// Drives real scripts through simulate.loadGame. Does not edit game code.
import { pathToFileURL } from "node:url";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadGame } from "./simulate.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export function sunPlayerflowTitleChecks() {
  const errors = [];
  const runtime = loadGame(ROOT);
  const result = runtime.evaluate(`(() => {
    localStorage.clear();
    resetRunState();
    showTitleScreen();
    const begin = document.getElementById("btn-begin");
    const resume = document.getElementById("btn-resume");
    if (!begin || !resume) return { ok: false, reason: "title buttons missing" };
    const started = startGame() || (typeof advancePastCommanderCreate === "function" && advancePastCommanderCreate());
    if (!started) return { ok: false, reason: "startGame did not start a fresh run" };
    if (typeof finishCinematic === "function" && currentCinematic) finishCinematic();
    const scene = state.scene;
    const choices = (scenes[scene] && scenes[scene].choices) || [];
    if (!choices.length) return { ok: false, reason: "no choices on " + scene };
    const before = scene;
    makeChoice(choices[0]);
    if (typeof finishCinematic === "function" && currentCinematic) finishCinematic();
    return {
      ok: state.scene !== before,
      scene: state.scene,
      before,
      saved: !!localStorage.getItem(SAVE_KEY),
      titleHidden: document.getElementById("title-screen").classList.contains("hidden")
    };
  })()`);
  if (!result || result.ok !== true) errors.push("title → first choice failed: " + JSON.stringify(result));
  else if (!result.saved) errors.push("first choice did not persist a save");
  else if (!result.titleHidden) errors.push("title screen still visible after first choice");
  return errors;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const errors = sunPlayerflowTitleChecks();
  if (errors.length) {
    console.error("FAIL sun-playerflow-title", errors);
    process.exit(1);
  }
  console.log("PASS sun-playerflow-title (clean title → startGame → wake/first choice moves scene and saves)");
}
