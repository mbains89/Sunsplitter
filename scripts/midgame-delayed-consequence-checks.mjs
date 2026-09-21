// SUN-MIDGAME-DELAYED-CONSEQUENCE-01/02 — static proof that faction_split pays
// changeorders (PR #311) and manifest (SUN-MIDGAME-DELAYED-CONSEQUENCE-02).
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export function midgameDelayedConsequenceChecks() {
  const errors = [];
  const src = readFileSync(resolve(ROOT, "src/scenes-25.js"), "utf8");
  if (!src.includes("state.flags.changeorders === \"logged\"")) {
    errors.push("faction_split does not read changeorders=logged");
  }
  if (!src.includes("state.flags.changeorders === \"buried\"")) {
    errors.push("faction_split does not read changeorders=buried");
  }
  if (!src.includes("Change orders 4417 and 4491")) {
    errors.push("logged branch missing spoken change-order numbers");
  }
  if (!src.includes("You left it out.")) {
    errors.push("buried branch missing spoken withhold line");
  }
  if (!src.includes("state.flags.manifest === \"read\"")) {
    errors.push("faction_split does not read manifest=read");
  }
  if (!src.includes("state.flags.manifest === \"declined\"")) {
    errors.push("faction_split does not read manifest=declined");
  }
  if (!src.includes("Two hundred fourteen confirmed berths")) {
    errors.push("read branch missing spoken berth count");
  }
  if (!src.includes("You let the manifest stay closed.")) {
    errors.push("declined branch missing spoken withhold line");
  }
  return errors;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const errors = midgameDelayedConsequenceChecks();
  if (errors.length) {
    console.error("FAIL midgame delayed consequence", errors);
    process.exit(1);
  }
  console.log("PASS midgame delayed consequence (changeorders + manifest spoken on faction_split)");
}
