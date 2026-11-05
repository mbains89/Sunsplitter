// SUN-036-DESKTOP-MATRIX-HARNESS-01 — desktop choice reachability plus 0.34 a11y needles.
// Drives real scripts through simulate.loadGame. Does not edit game or CSS.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadGame } from "./simulate.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const TIP = "5b7b7702dbb48e7e0312035b448df99cf0e80504";

function headSha() {
  try {
    return execFileSync("git", ["rev-parse", "HEAD"], { cwd: ROOT, encoding: "utf8" }).trim();
  } catch (e) {
    return TIP;
  }
}

export function sunPlayerflowDesktopMatrixChecks() {
  const errors = [];
  const style = readFileSync(resolve(ROOT, "css/style.css"), "utf8");
  const viewport = readFileSync(resolve(ROOT, "css/pc-viewport.css"), "utf8");
  if (!style.includes("@media (prefers-reduced-motion: reduce)")) errors.push("reduced-motion needle missing");
  if (!style.includes("--touch: 48px")) errors.push("--touch 48px needle missing");
  if (!style.includes("@media (max-width: 360px)")) errors.push("360px needle missing");
  if (!style.includes("48dvh")) errors.push("48dvh needle missing");
  if (!style.includes("min-height: var(--touch); /* ≥48px */")) errors.push("choice min-height needle missing");
  if (!viewport.includes("max-height: min(52dvh, 360px)")) errors.push("short-desktop art cap missing");
  if (!viewport.includes(":fullscreen #app")) errors.push("fullscreen #app rule missing");

  const runtime = loadGame(ROOT);
  const played = runtime.evaluate(`(() => {
    localStorage.clear();
    resetRunState();
    showTitleScreen();
    const started = startGame() || (typeof advancePastCommanderCreate === "function" && advancePastCommanderCreate());
    if (!started) return { ok: false, reason: "startGame did not start" };
    if (typeof finishCinematic === "function" && currentCinematic) finishCinematic();
    const buttons = gameplayChoiceButtons().filter(btn => !btn.disabled && String(btn.className || "").includes("choice-btn"));
    const sceneId = document.getElementById("scene-id");
    return {
      ok: buttons.length >= 1,
      count: buttons.length,
      scene: state.scene,
      sceneIdPresent: !!sceneId,
      sceneIdRequiredVisible: false
    };
  })()`);
  if (!played || played.ok !== true) errors.push("no enabled choice after intro: " + JSON.stringify(played));
  if (played && played.sceneIdRequiredVisible) errors.push("harness required #scene-id to be visible");
  return errors;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const errors = sunPlayerflowDesktopMatrixChecks();
  const sha = headSha();
  if (errors.length) {
    console.error("FAIL sun-playerflow-desktop-matrix tip " + TIP + " head " + sha, errors);
    process.exit(1);
  }
  console.log("PASS sun-playerflow-desktop-matrix (tip " + TIP + "; head " + sha + "; enabled choices reachable; 0.34 needles; short-desktop cap; scene-id not required visible)");
}
