// SUN-CASCADE-ALLUSIVE-PAYOFF-01 — static proof that reckon_summary pays
// flags.changeorders (logged|buried) with a late spoken/summary line.
// Not a remint of SUN-MIDGAME-DELAYED-CONSEQUENCE-01/02 (those pay on
// faction_split in src/scenes-25.js). This host is src/scenes-27.js.
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export function cascadeAllusivePayoffChecks() {
  const errors = [];
  const src = readFileSync(resolve(ROOT, "src/scenes-27.js"), "utf8");
  if (!src.includes("reckon_summary")) {
    errors.push("scenes-27.js is missing reckon_summary");
  }
  if (!src.includes("state.flags.changeorders === \"logged\"")) {
    errors.push("reckon_summary does not read changeorders=logged");
  }
  if (!src.includes("state.flags.changeorders === \"buried\"")) {
    errors.push("reckon_summary does not read changeorders=buried");
  }
  if (!src.includes("Mira does not reopen the unsigned pages. Change orders 4417 and 4491 are still in the record you let her keep.")) {
    errors.push("logged + Mira-alive branch missing spoken line");
  }
  if (!src.includes(": `Change orders 4417 and 4491 are still in the record.\\n`")) {
    errors.push("logged + Mira-dead branch missing unique ternary arm");
  }
  if (!src.includes("Mira's unsigned pages never entered the record. The reckoning has no page to point at.")) {
    errors.push("buried + Mira-alive branch missing spoken line");
  }
  if (!src.includes("The unsigned pages never entered the record. You left them out.")) {
    errors.push("buried + Mira-dead branch missing spoken line");
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
  console.log("PASS cascade allusive payoff (changeorders spoken on reckon_summary)");
}
