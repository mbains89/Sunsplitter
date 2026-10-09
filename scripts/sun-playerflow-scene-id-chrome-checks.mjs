// SUN-034-SCENE-ID-CHROME-01 — raw scene ids stay in the DOM and are never painted.
// Drives real scripts through simulate.loadGame. Does not edit game code.
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadGame } from "./simulate.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export function sunPlayerflowSceneIdChromeChecks() {
  const errors = [];
  const css = readFileSync(resolve(ROOT, "css/style.css"), "utf8");
  const index = readFileSync(resolve(ROOT, "index.html"), "utf8");
  const base = css.match(/#scene-id\s*\{[^}]*\}/);
  if (!base || !/display:\s*none/.test(base[0])) errors.push("base #scene-id rule missing display:none");
  if (!index.includes('id="scene-id"') || !index.includes('aria-hidden="true"')) errors.push("index.html missing id=scene-id aria-hidden=true");
  const runtime = loadGame(ROOT);
  const rendered = runtime.evaluate(`(() => {
    resetRunState();
    showScene("crisis", { skipOnEnter: true });
    const el = document.getElementById("scene-id");
    return { text: el && el.textContent, scene: state.scene, hidden: el && el.getAttribute("aria-hidden") };
  })()`);
  if (!rendered || rendered.text !== rendered.scene) errors.push("debug textContent lost: " + JSON.stringify(rendered));
  return errors;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const errors = sunPlayerflowSceneIdChromeChecks();
  if (errors.length) {
    console.error("FAIL sun-playerflow-scene-id-chrome", errors);
    process.exit(1);
  }
  console.log("PASS sun-playerflow-scene-id-chrome (3/3: base display none, aria-hidden kept, debug text still equals state.scene)");
}
