import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { playtestTitleWhitespaceChecks } from "./playtest-title-whitespace-checks.mjs";
import { playtestTitleRotatingShipChecks } from "./playtest-title-rotating-ship-checks.mjs";

// SUN-V035-OPENING-BACKSTORY-01. Opening path may read only the already-in-tree
// title prologue and onboarding plate. No new invented cascade backstory.

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const EXISTING_INTRO_LINES = [
  "Earth failed in a cascade measured in hours.",
  "The Sunsplitter was a colonization ark — built for thousands. Nine of you cleared the hatch.",
  "You are the Commander. The ship is damaged. The living are already arguing about what to save."
];
const EXISTING_PLATE = "images/onboarding_background.jpg";
const EXISTING_WAKE_OFFICIAL = "Nine of you cleared the hatch. The official story is that the cascade gave you hours, maybe two days.";
const INVENTED_OPENING = [
  "standoff operation",
  "fragment train",
  "People were tier four",
  "change orders 4417",
  "I am the hand-off",
  "Standing question",
  "sponsor codes"
];

function stripTags(html) {
  return html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

function parseExistingIntroLines(indexSource) {
  return [1, 2, 3].map(n => {
    const match = indexSource.match(new RegExp(`id=["']intro-line-${n}["'][^>]*>([\\s\\S]*?)</p>`));
    if (!match) throw new Error("missing intro-line-" + n);
    return stripTags(match[1]);
  });
}

function sourceErrors() {
  const errors = [];
  const indexSource = readFileSync(resolve(ROOT, "index.html"), "utf8");
  const engineSource = readFileSync(resolve(ROOT, "src/engine.js"), "utf8");
  const wakeSource = readFileSync(resolve(ROOT, "src/scenes-38.js"), "utf8");
  try {
    const parsed = parseExistingIntroLines(indexSource);
    parsed.forEach((line, index) => {
      if (line !== EXISTING_INTRO_LINES[index]) {
        errors.push(`intro-line-${index + 1} is not the in-tree official account: ${JSON.stringify(line)}`);
      }
    });
  } catch (error) {
    errors.push(error.message);
  }
  if (!indexSource.includes(`id="intro-line-1"`) || !indexSource.includes(`id="intro-line-2"`) || !indexSource.includes(`id="intro-line-3"`)) {
    errors.push("title prologue intro-line ids missing");
  }
  if (!engineSource.includes("Reuse the existing prologue or already-resolved ending, never new prose.")) {
    errors.push("engine no longer documents reuse of existing prologue");
  }
  if (!/intro\s*\n\s*\? \[1, 2, 3\]\.map\(n => document\.getElementById\(`intro-line-\$\{n\}`\)\.textContent\.trim\(\)\)/.test(engineSource)
    && !engineSource.includes("document.getElementById(`intro-line-${n}`).textContent.trim()")) {
    errors.push("intro cinematic no longer reads existing intro-line DOM text");
  }
  if (engineSource.includes('showCinematic("intro")') === false) {
    errors.push("start path no longer shows the existing intro cinematic");
  }
  if (!engineSource.includes(`setManagedImageSource(img, "${EXISTING_PLATE}")`)) {
    errors.push("intro cinematic no longer uses the existing onboarding plate");
  }
  if (EXISTING_INTRO_LINES.some(line => engineSource.includes(line))) {
    errors.push("engine hardcodes opening backstory instead of reading in-tree prologue");
  }
  if (!wakeSource.includes(EXISTING_WAKE_OFFICIAL)) {
    errors.push("wake lost the existing official-account sentence");
  }
  const openingSurfaces = [indexSource, engineSource.match(/function showCinematic[\s\S]*?\n\}/)?.[0] || ""];
  for (const phrase of INVENTED_OPENING) {
    if (openingSurfaces.some(source => source.includes(phrase))) {
      errors.push(`opening surface invents later contested backstory: ${phrase}`);
    }
  }
  return errors;
}

function openingPathErrors(runtime, lines) {
  const errors = [];
  const check = (label, source) => {
    try { assert.equal(runtime.evaluate(source), true); }
    catch (e) { errors.push(`opening path ${label}: ${e.message}`); }
  };
  const seeded = JSON.stringify(lines);
  check("Begin reads existing prologue/plate, not invented frames", `(() => {
    const lines = ${seeded};
    const invented = ${JSON.stringify(INVENTED_OPENING)};
    localStorage.clear();
    resetRunState();
    for (let n = 1; n <= 3; n++) document.getElementById("intro-line-" + n).textContent = lines[n - 1];
    if (!startGame() || !currentCinematic || currentCinematic.kind !== "intro") return false;
    if (currentCinematic.frames.length !== 3) return false;
    for (let i = 0; i < 3; i++) {
      if (currentCinematic.frames[i] !== lines[i]) return false;
      if (document.getElementById("cinematic-text").textContent !== lines[0] && i === 0) return false;
    }
    if (document.getElementById("cinematic-text").textContent !== lines[0]) return false;
    if (document.getElementById("cinematic-image").__ssManagedSource !== "${EXISTING_PLATE}") return false;
    if (invented.some(phrase => currentCinematic.frames.some(frame => frame.includes(phrase)))) return false;
    if (state.scene !== "wake") return false;
    const live = JSON.stringify(state);
    finishCinematic();
    if (currentCinematic || state.scene !== "wake" || JSON.stringify(state) !== live) return false;
    const wake = typeof scenes.wake.text === "function" ? scenes.wake.text() : scenes.wake.text;
    if (!String(wake).includes(${JSON.stringify(EXISTING_WAKE_OFFICIAL)})) return false;
    if (invented.some(phrase => String(wake).includes(phrase))) return false;
    return true;
  })()`);
  check("Play Again intro still reads the same existing prologue", `(() => {
    const lines = ${seeded};
    resetRunState();
    state.scene = "ending_check";
    persistSave({ silent: true });
    for (let n = 1; n <= 3; n++) document.getElementById("intro-line-" + n).textContent = lines[n - 1];
    playAgain();
    if (!currentCinematic || currentCinematic.kind !== "intro") return false;
    if (currentCinematic.frames.join("\\n") !== lines.join("\\n")) return false;
    if (document.getElementById("cinematic-image").__ssManagedSource !== "${EXISTING_PLATE}") return false;
    finishCinematic();
    return state.scene === "wake" && !currentCinematic;
  })()`);
  check("Continue does not invent a replacement opening backstory", `(() => {
    resetRunState();
    state.scene = "wake";
    persistSave({ silent: true });
    if (!resumeGame() || currentCinematic) return false;
    return state.scene === "wake";
  })()`);
  return errors;
}

export function openingBackstoryChecks(runtime) {
  const errors = sourceErrors();
  errors.push(...playtestTitleWhitespaceChecks(runtime));
  errors.push(...playtestTitleRotatingShipChecks(runtime));
  if (errors.length) return errors;
  const indexSource = readFileSync(resolve(ROOT, "index.html"), "utf8");
  return openingPathErrors(runtime, parseExistingIntroLines(indexSource));
}
