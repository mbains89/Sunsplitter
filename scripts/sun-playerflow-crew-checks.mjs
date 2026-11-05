// SUN-TESTS-PLAYERFLOW-01 — crew panel open/close keeps run state; dead/unrecovered do not get choice buttons.
import { pathToFileURL } from "node:url";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadGame } from "./simulate.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CREW = ["lena", "elias", "mira", "tomas", "amara", "jiro", "sela", "rourke", "vess"];

export function sunPlayerflowCrewChecks() {
  const errors = [];
  const runtime = loadGame(ROOT);
  const panel = runtime.evaluate(`(() => {
    localStorage.clear();
    resetRunState();
    showScreen("game");
    state.scene = "wake";
    state.supplies = 31;
    const before = JSON.stringify({ scene: state.scene, supplies: state.supplies, dead: state.dead });
    toggleCrewPanel();
    const open = document.getElementById("crew-panel").classList.contains("visible");
    const expanded = document.getElementById("btn-crew").getAttribute("aria-expanded");
    toggleCrewPanel();
    const closed = document.getElementById("crew-panel").classList.contains("hidden");
    const after = JSON.stringify({ scene: state.scene, supplies: state.supplies, dead: state.dead });
    return { open, expanded, closed, same: before === after };
  })()`);
  if (!panel || !panel.open || panel.expanded !== "true") errors.push("crew panel did not open: " + JSON.stringify(panel));
  if (!panel || !panel.closed) errors.push("crew panel did not close: " + JSON.stringify(panel));
  if (!panel || !panel.same) errors.push("crew panel open/close mutated run state: " + JSON.stringify(panel));

  const speech = runtime.evaluate(`(() => {
    resetRunState();
    for (const name of ${JSON.stringify(CREW)}) {
      if (typeof isAlive === "function" && isAlive(name) && typeof kill === "function") kill(name, "playerflow seed");
      if (state.recovered) state.recovered[name] = false;
    }
    const leaks = [];
    const ids = Object.keys(scenes);
    for (const id of ids) {
      const scene = scenes[id];
      const choices = scene.choices || [];
      for (const choice of choices) {
        if (!choice || !choice.alive) continue;
        if (typeof isAlive === "function" && isAlive(choice.alive)) continue;
        showScene(id);
        if (state.scene !== id) continue;
        const buttons = Array.from(document.querySelectorAll("#choices button")).map(btn => btn.textContent || "");
        const label = typeof choice.text === "function" ? "" : String(choice.text || "");
        if (label && buttons.some(text => text.indexOf(label) !== -1)) leaks.push(id + " offered dead/unrecovered " + choice.alive + ": " + label);
      }
    }
    return leaks.slice(0, 12);
  })()`);
  if (speech && speech.length) errors.push("dead/unrecovered speaking choice leaked: " + speech.join(" | "));
  return errors;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const errors = sunPlayerflowCrewChecks();
  if (errors.length) {
    console.error("FAIL sun-playerflow-crew", errors);
    process.exit(1);
  }
  console.log("PASS sun-playerflow-crew (panel open/close kept state; dead/unrecovered alive-gated choices not offered)");
}
