// SUN-036-PAUSE-PRESSED-01 — Pause looks pressed while aria-pressed is true.
// CI-REPAIR-OVERNIGHT-01 — selector presence is not enough; the rule body must
// keep the real border and underline. simulate.mjs loadGame does not apply CSS,
// so a computed-style assert would be a false fail and is not added.
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { loadGame } from "./simulate.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SELECTOR = "#cinematic-pause[aria-pressed=\"true\"]";
const BORDER_VALUE = "2px solid #f2c14e";
const UNDERLINE_VALUE = "underline";

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

function stripForcedColors(css) {
  const media = "@media (forced-colors: active)";
  let out = "";
  let i = 0;
  while (true) {
    const start = css.indexOf(media, i);
    if (start < 0) return out + css.slice(i);
    out += css.slice(i, start);
    const open = css.indexOf("{", start);
    if (open < 0) return out;
    let depth = 0;
    let j = open;
    for (; j < css.length; j++) {
      if (css[j] === "{") depth++;
      else if (css[j] === "}") {
        depth--;
        if (depth === 0) {
          i = j + 1;
          break;
        }
      }
    }
    if (j >= css.length) return out;
  }
}

export function pressedRuleBodies(css) {
  const source = stripForcedColors(css);
  const found = [];
  let i = 0;
  while (i < source.length) {
    const at = source.indexOf(SELECTOR, i);
    if (at < 0) break;
    const open = source.indexOf("{", at);
    if (open < 0) break;
    const prev = source.lastIndexOf("}", at);
    const selStart = prev < 0 ? 0 : prev + 1;
    let depth = 0;
    let j = open;
    for (; j < source.length; j++) {
      if (source[j] === "{") depth++;
      else if (source[j] === "}") {
        depth--;
        if (depth === 0) {
          const selector = source.slice(selStart, open);
          if (selector.includes(SELECTOR)) {
            found.push({ selector: selector.trim(), body: source.slice(open + 1, j) });
          }
          i = j + 1;
          break;
        }
      }
    }
    if (j >= source.length) break;
  }
  return found;
}

function declValue(body, prop) {
  const re = new RegExp("(?:^|[;{])\\s*" + prop + "\\s*:\\s*([^;]+)", "i");
  const match = body.match(re);
  return match ? match[1].trim() : "";
}

export function pressedLook(css) {
  const blocks = pressedRuleBodies(css).filter(block => !block.selector.includes(":hover"));
  if (!blocks.length) return { ok: false, reason: "pressed selector missing", border: "", underline: "" };
  const body = blocks[0].body;
  const border = declValue(body, "border");
  const underline = declValue(body, "text-decoration");
  if (border !== BORDER_VALUE) {
    return { ok: false, reason: "border missing or changed", border, underline };
  }
  if (!underline.split(/\s+/).includes(UNDERLINE_VALUE)) {
    return { ok: false, reason: "underline missing", border, underline };
  }
  return { ok: true, reason: "", border, underline };
}

export function sunPlayerflowPausePressedChecks() {
  const errors = [];
  const css = readFileSync(resolve(ROOT, "css/intro-nav.css"), "utf8");
  const look = pressedLook(css);
  const hasSelector = css.includes(SELECTOR) || css.includes(".cinematic-actions " + SELECTOR);
  if (!hasSelector || !look.ok) {
    errors.push("case 1/3 failed: pressed selector/declarations " + (look.reason || "missing"));
  } else if (!outsideForcedColors(css, SELECTOR)) {
    errors.push("case 3/3 failed: pressed rule sits in a forced-colors block");
  }

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
  return errors;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const errors = sunPlayerflowPausePressedChecks();
  if (errors.length) {
    console.error("FAIL sun-playerflow-pause-pressed", errors);
    process.exit(1);
  }
  console.log("PASS sun-playerflow-pause-pressed 3/3 (pressed selector in intro-nav.css with border: " + BORDER_VALUE + " and text-decoration: " + UNDERLINE_VALUE + "; toggle sets aria-pressed true and Resume; rule outside forced-colors)");
}
