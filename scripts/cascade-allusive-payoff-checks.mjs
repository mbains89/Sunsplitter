// SUN-CASCADE-ALLUSIVE-PAYOFF-01 — reckon_summary used to pay flags.changeorders a second time,
// one screen after faction_split paid it (SUN-MIDGAME-DELAYED-CONSEQUENCE-01). SUN-RECAP-HONESTY-01
// trimmed that restatement; this check now proves the payoff prints once, on faction_split.
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export function cascadeAllusivePayoffChecks() {
  const errors = [];
  const src = readFileSync(resolve(ROOT, "src/scenes-27.js"), "utf8");
  const faction = readFileSync(resolve(ROOT, "src/scenes-25.js"), "utf8");
  if (!src.includes("reckon_summary")) {
    errors.push("scenes-27.js is missing reckon_summary");
  }
  // SUN-RECAP-HONESTY-01: faction_split, the screen before reckon_summary, already pays the change
  // orders (SUN-MIDGAME-DELAYED-CONSEQUENCE-01), so reckon_summary no longer restates them.
  if (src.includes("Change orders 4417 and 4491") || src.includes("state.flags.changeorders")) {
    errors.push("reckon_summary restates the change orders faction_split already paid");
  }
  if (!faction.includes("state.flags.changeorders === \"logged\"") || !faction.includes("state.flags.changeorders === \"buried\"") ||
      !faction.includes("Change orders 4417 and 4491")) {
    errors.push("faction_split no longer pays the change orders");
  }
  if (!src.includes("SUN-CASCADE-ALLUSIVE-PAYOFF-01")) {
    errors.push("scenes-27.js missing ticket marker");
  }
  if (src.includes("People were tier four.")) {
    errors.push("must not spend reserved Tomas phrase");
  }
  return errors;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const errors = cascadeAllusivePayoffChecks();
  if (errors.length) {
    console.error("FAIL cascade allusive payoff", errors);
    process.exit(1);
  }
  console.log("PASS cascade allusive payoff (changeorders paid once, on faction_split)");
}
