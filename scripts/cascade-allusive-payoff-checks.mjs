// SUN-CASCADE-ALLUSIVE-PAYOFF-01 — static proof that reckon_summary pays
// changeorders on the late-host summary instead of faction_split.
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export function cascadeAllusivePayoffChecks() {
  const errors = [];
  const src = readFileSync(resolve(ROOT, "src/scenes-27.js"), "utf8");
  if (!src.includes("state.flags.changeorders === \"logged\"")) {
    errors.push("reckon_summary does not read changeorders=logged");
  }
  if (!src.includes("state.flags.changeorders === \"buried\"")) {
    errors.push("reckon_summary does not read changeorders=buried");
  }
  if (!src.includes("Mira does not reopen the unsigned pages. Change orders 4417 and 4491 are still in the record you let her keep.")) {
    errors.push("logged alive branch missing Mira unsigned-pages payoff");
  }
  if (!src.includes("Change orders 4417 and 4491 are still in the record.")) {
    errors.push("logged narrator payoff missing spoken record line");
  }
  if (!src.includes("Mira's unsigned pages never entered the record. The reckoning has no page to point at.")) {
    errors.push("buried alive branch missing no-page payoff");
  }
  if (!src.includes("The unsigned pages never entered the record. You left them out.")) {
    errors.push("buried narrator payoff missing withhold line");
  }
  if (/registerScenes\(\{[\s\S]*\breckon_summary\b[\s\S]*\breckon_summary_after\b/.test(src)) {
    errors.push("src/scenes-27.js appears to add a new reckon_summary scene id");
  }
  if (!src.includes("reckon_summary: {")) {
    errors.push("reckon_summary host is missing from src/scenes-27.js");
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
