// SUN-036-PAUSE-PRESSED-01 — Pause looks pressed while aria-pressed is true.
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { loadGame } from "./simulate.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SELECTOR = "#cinematic-pause[aria-pressed=\"true\"]";

function outsideForcedColors(css, needle) {
  const at = css.indexOf(needle);
  if (at < 0) return false;
  const media = "@media (forced-colors: active)";
  let search = 0;
  while (true) {
    const start = css.indexOf(media, search);
    if (start < 0 || start > at) return true;
    const open = css.indexOf("{", start);
    if (open < 0 || open > at) return true;
    let depth = 0;
    for (let i = open; i < css.length; i++) {
      if (css[i] === "{") depth++;
      else if (css[i] === "}") {
        depth--;
        if (depth === 0) {
          if (at > open && at < i) return false;
          search = i + 1;
          break;
        }
      }
    }
    if (search <= start) return true;
  }
}

export function sunPlayerflowPausePressedChecks() {
  const errors = [];
  const css = readFileSync(resolve(ROOT, "css/intro-nav.css"), "utf8");
  const hasSelector = css.includes(SELECTOR) || css.includes(".cinematic-actions " + SELECTOR);
  if (!hasSelector) errors.push("case 1/3 failed: pressed selector missing");
  else if (!outsideForcedColors(css, SELECTOR)) errors.push("case 3/3 failed: pressed rule sits in a forced-colors block");

  const game = loadGame(ROOT);
  const result = game.evaluate(`(() => {
    window.matchMedia = () => ({ matches: false });
    resetRunState();
    showCinematic("intro");
    toggleCinematicPause();
    const pause = document.getElementById("cinematic-pause");
    return { pressed: pause && pause.getAttribute("aria-pressed"), label: pause && pause.textContent };
  })()`);
  if (!result || result.pressed !== "true" || result.label !== "Resume") {
    errors.push("case 2/3 failed: pause toggle " + JSON.stringify(result));
  }
  if (hasSelector && outsideForcedColors(css, SELECTOR) && errors.some(item => item.startsWith("case 3"))) {
    // already recorded
  }
  return errors;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const errors = sunPlayerflowPausePressedChecks();
  if (errors.length) {
    console.error("FAIL sun-playerflow-pause-pressed", errors);
    process.exit(1);
  }
  console.log("PASS sun-playerflow-pause-pressed 3/3 (pressed selector in intro-nav.css; toggle sets aria-pressed true and Resume; rule outside forced-colors)");
}
