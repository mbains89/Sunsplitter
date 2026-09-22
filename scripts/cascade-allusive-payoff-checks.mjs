// SUN-CASCADE-ALLUSIVE-PAYOFF-01 — living vault changes Tomas's reckon_public line.
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PHRASE = "People were tier four.";

export function cascadeAllusivePayoffChecks(runtime) {
  const errors = [];
  const hold = readFileSync(resolve(ROOT, "src/scenes-15.js"), "utf8");
  if (hold.includes(PHRASE)) {
    errors.push("hold_bolts source spent reserved Tomas phrase");
  }
  const faction = readFileSync(resolve(ROOT, "src/scenes-25.js"), "utf8");
  if (!faction.includes("SUN-MIDGAME-DELAYED-CONSEQUENCE-01")) {
    errors.push("faction_split 01 changeorders payoff marker missing — do not remint by deleting it");
  }
  if (!faction.includes("SUN-MIDGAME-DELAYED-CONSEQUENCE-02")) {
    errors.push("faction_split 02 manifest payoff marker missing — do not remint by deleting it");
  }
  const livingAlive = runtime.evaluate(`(() => {
    resetRunState();
    state.recovered.tomas = true;
    state.flags.vault_sacrifice = "living";
    return scenes.reckon_public.text;
  })()`);
  if (!livingAlive.includes(PHRASE)) {
    errors.push("living+alive reckon_public missing Tomas tier-four line");
  }
  if (!livingAlive.includes("Tomas does not nod.")) {
    errors.push("living+alive reckon_public did not replace the default nod");
  }
  const futureAlive = runtime.evaluate(`(() => {
    resetRunState();
    state.recovered.tomas = true;
    state.flags.vault_sacrifice = "future";
    return scenes.reckon_public.text;
  })()`);
  if (futureAlive.includes(PHRASE)) {
    errors.push("future vault + alive Tomas still speaks tier-four");
  }
  if (!futureAlive.includes("Tomas nods through the entire accounting.")) {
    errors.push("future vault lost the default Tomas nod");
  }
  const livingUnrecovered = runtime.evaluate(`(() => {
    resetRunState();
    state.flags.vault_sacrifice = "living";
    return scenes.reckon_public.text;
  })()`);
  if (livingUnrecovered.includes(PHRASE)) {
    errors.push("unrecovered Tomas still speaks tier-four");
  }
  if (livingUnrecovered.includes("Tomas nods") || livingUnrecovered.includes("Tomas does not nod")) {
    errors.push("unrecovered Tomas is still present in reckon_public");
  }
  return errors;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log("cascade-allusive-payoff-checks.mjs is a verify.mjs module; run via scripts/verify.mjs");
  process.exit(0);
}
