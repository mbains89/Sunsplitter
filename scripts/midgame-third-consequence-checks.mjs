// SUN-MIDGAME-THIRD-CONSEQUENCE-01 — static proof that faction_split pays
// Green Tether disclosure flags (manifest_exposed | manifest_lie).
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export function midgameThirdConsequenceChecks() {
  const errors = [];
  const src = readFileSync(resolve(ROOT, "src/scenes-25.js"), "utf8");
  if (!src.includes("SUN-MIDGAME-THIRD-CONSEQUENCE-01")) {
    errors.push("scenes-25.js missing ticket marker SUN-MIDGAME-THIRD-CONSEQUENCE-01");
  }
  if (!src.includes("state.flags.manifest_exposed")) {
    errors.push("faction_split does not read flags.manifest_exposed");
  }
  if (!src.includes("state.flags.manifest_lie")) {
    errors.push("faction_split does not read flags.manifest_lie");
  }
  if (!src.includes("A third of the vault, eaten to stay alive")) {
    errors.push("exposed + Tomas-alive branch missing locked eaten-third line");
  }
  if (!src.includes("a third gone, two-thirds green")) {
    errors.push("exposed + Amara-alive fallback missing locked arithmetic");
  }
  if (!src.includes("You logged the germplasm shortfall as breach loss.")) {
    errors.push("lie branch missing spoken official-line fact");
  }
  if (!src.includes("do not shake hands")) {
    errors.push("lie + Amara-alive branch missing locked books line");
  }
  if (src.includes("People were tier four.")) {
    errors.push("reserved Tomas phrase spent on faction_split");
  }
  if (!src.includes("Two hundred fourteen confirmed berths")) {
    errors.push("boarding manifest 02 block was disturbed");
  }
  if (!src.includes("Change orders 4417 and 4491")) {
    errors.push("changeorders 01 block was disturbed");
  }
  return errors;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const errors = midgameThirdConsequenceChecks();
  if (errors.length) {
    console.error("FAIL midgame third consequence", errors);
    process.exit(1);
  }
  console.log("PASS midgame third consequence (manifest_exposed | manifest_lie spoken on faction_split)");
}
