import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// SUN-PLAYTEST-CREW-JOIN-FOLLOW-03 — residual join UX after PR197/PR198.
export function playtestCrewJoinFollow03Checks() {
  const errors = [];
  const note = resolve(ROOT, "docs/SUN_PLAYTEST_CREW_JOIN_FOLLOW_03.md");
  if (!existsSync(note)) errors.push("crew-join follow-03 note missing");
  const tomas = readFileSync(resolve(ROOT, "src/scenes-11.js"), "utf8");
  const jiro = readFileSync(resolve(ROOT, "src/scenes-14.js"), "utf8");
  const vess = readFileSync(resolve(ROOT, "src/scenes-17.js"), "utf8");
  if (!tomas.includes("His name is on the board before anyone finds him a bunk.")) {
    errors.push("Tomas board line reminted or dropped");
  }
  if (!jiro.includes("His name is on the board before the briefing starts.")) {
    errors.push("Jiro board line reminted or dropped");
  }
  if (!vess.includes("Her name is on the board before the first watch turns.")) {
    errors.push("Vess board line reminted or dropped");
  }
  const index = readFileSync(resolve(ROOT, "index.html"), "utf8");
  for (const token of ["id=\"btn-crew\"", "id=\"crew-panel\"", "id=\"crew-sheet\"", "id=\"tutorial-field-crew\""]) {
    if (!index.includes(token)) errors.push("roster UX lost " + token);
  }
  return errors;
}
