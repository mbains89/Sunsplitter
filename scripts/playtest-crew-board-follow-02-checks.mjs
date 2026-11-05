import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// SUN-PLAYTEST-CREW-BOARD-FOLLOW-02 — residual living-board after Jiro/CREW line.
// Shipped already as PR #193 @ 167aee17 (Vess) and PR #192 @ 97eda1a3 (Jiro),
// Tomas line from CREW-JOIN-CLARITY. Tip 520ba48f still has all three.
// ALREADY_SATISFIED. Do not remint scenes-11/14/17.
export function playtestCrewBoardFollow02Checks() {
  const errors = [];
  const tomas = readFileSync(resolve(ROOT, "src/scenes-11.js"), "utf8");
  const jiro = readFileSync(resolve(ROOT, "src/scenes-14.js"), "utf8");
  const vess = readFileSync(resolve(ROOT, "src/scenes-17.js"), "utf8");

  if (!tomas.includes("His name is on the board before anyone finds him a bunk.")) {
    errors.push("Tomas dock lost the living-board sentence");
  }
  if (!jiro.includes("His name is on the board before the briefing starts.")) {
    errors.push("Jiro cut lost the living-board sentence");
  }
  if (!vess.includes("Her name is on the board before the first watch turns.")) {
    errors.push("Vess boarding lost the living-board sentence");
  }
  if (!tomas.includes("act2_tether_dock") || !jiro.includes("act3_reckoning_cut") || !vess.includes("vess_boarding")) {
    errors.push("join scene ids missing from recovery files");
  }
  return errors;
}
