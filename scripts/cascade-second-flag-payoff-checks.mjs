// SUN-CASCADE-SECOND-FLAG-PAYOFF-01 — static proof that reckon_public pays
// flags.manifest (read|declined) with a late spoken line.
// Not a remint of SUN-CASCADE-ALLUSIVE-PAYOFF-01 / PR #351 (that pays
// changeorders on reckon_summary in src/scenes-27.js).
// Not a remint of SUN-MIDGAME-DELAYED-CONSEQUENCE-01/02 (those pay on
// faction_split in src/scenes-25.js). This host is src/scenes-26.js.
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export function cascadeSecondFlagPayoffChecks() {
  const errors = [];
  const src = readFileSync(resolve(ROOT, "src/scenes-26.js"), "utf8");
  if (!src.includes("reckon_public")) {
    errors.push("scenes-26.js is missing reckon_public");
  }
  if (!src.includes("state.flags.manifest === \"read\"")) {
    errors.push("reckon_public does not read manifest=read");
  }
  if (!src.includes("state.flags.manifest === \"declined\"")) {
    errors.push("reckon_public does not read manifest=declined");
  }
  if (!src.includes("Tomas does not ask for the boarding list. Two hundred fourteen confirmed berths are already in the accounting.")) {
    errors.push("read + Tomas-alive branch missing spoken line");
  }
  if (!src.includes("The boarding list is already in the accounting. Two hundred fourteen confirmed berths. No one has to open the tablet.")) {
    errors.push("read + Tomas-dead branch missing spoken line");
  }
  if (!src.includes("Tomas nods through estimates. You let the manifest stay closed; the accounting has no names to point at.")) {
    errors.push("declined + Tomas-alive branch missing spoken line");
  }
  if (!src.includes("The accounting uses estimates. You let the manifest stay closed.")) {
    errors.push("declined + Tomas-dead branch missing spoken line");
  }
  if (!src.includes("Tomas nods through the entire accounting.")) {
    errors.push("unset-flag default Tomas-nod line missing");
  }
  if (!src.includes("SUN-CASCADE-SECOND-FLAG-PAYOFF-01")) {
    errors.push("scenes-26.js missing ticket marker");
  }
  if (src.includes("People were tier four.")) {
    errors.push("must not spend reserved Tomas phrase");
  }
  if (src.includes("state.flags.changeorders")) {
    errors.push("must not remint changeorders payoff on this host");
  }
  return errors;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const errors = cascadeSecondFlagPayoffChecks();
  if (errors.length) {
    console.error("FAIL cascade second-flag payoff", errors);
    process.exit(1);
  }
  console.log("PASS cascade second-flag payoff (manifest spoken on reckon_public)");
}
