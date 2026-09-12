import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// SUN-PLAYTEST-EVENT-ORDER-MIX-01 — living-cast order honesty after PR196.
// Stores/coolant may mix. Tomas → Jiro → Vess recoveries may not.
export function playtestEventOrderMix01Checks() {
  const errors = [];
  const note = resolve(ROOT, "docs/SUN_PLAYTEST_EVENT_ORDER_MIX_01.md");
  if (!existsSync(note)) errors.push("event-order honesty note missing");
  else {
    const text = readFileSync(note, "utf8");
    for (const token of ["private_stores", "coolant_trade", "act2_tether_dock", "act3_reckoning_cut", "vess_boarding", "ALREADY_SATISFIED"]) {
      if (!text.includes(token)) errors.push("event-order note lost " + token);
    }
  }
  const variety = readFileSync(resolve(ROOT, "scripts/midgame-variety-checks.mjs"), "utf8");
  if (!variety.includes("different existing event order") || !variety.includes("private_stores") || !variety.includes("coolant_trade")) {
    errors.push("midgame variety mix contract missing");
  }
  const tomas = readFileSync(resolve(ROOT, "src/scenes-11.js"), "utf8");
  const jiro = readFileSync(resolve(ROOT, "src/scenes-14.js"), "utf8");
  const vess = readFileSync(resolve(ROOT, "src/scenes-17.js"), "utf8");
  if (!tomas.includes("act2_tether_dock") || !jiro.includes("act3_reckoning_cut") || !vess.includes("vess_boarding")) {
    errors.push("recovery spine ids missing");
  }
  return errors;
}
