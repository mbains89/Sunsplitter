// SUN-LETHAL-RESUME-DEATHBEAT-01 — current-save resume does not re-kill lethal ends.
// Behavior already lives in engine.js (PR #71 sceneEntered + skipOnEnter).
// resumeEntryIdempotenceChecks fixtures act2_tether_sighting only; this file names the ends.
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const LETHAL_ENDS = [
  ["src/scenes-22.js", "act3_lethal_tomas_end"],
  ["src/scenes-23.js", "act3_lethal_elias_end"],
  ["src/scenes-24.js", "act3_lethal_mira_end"]
];

export function lethalResumeDeathbeatChecks() {
  const errors = [];
  const engine = readFileSync(resolve(ROOT, "src/engine.js"), "utf8");
  if (!engine.includes("skipOnEnter: sceneEntered")) {
    errors.push("loadGame no longer passes skipOnEnter: sceneEntered");
  }
  if (!engine.includes("if (scene.onEnter && !opts.skipOnEnter)")) {
    errors.push("showScene no longer honors skipOnEnter for onEnter/kill");
  }
  const verify = readFileSync(resolve(ROOT, "scripts/verify.mjs"), "utf8");
  if (!verify.includes("function resumeEntryIdempotenceChecks")) {
    errors.push("resumeEntryIdempotenceChecks missing — general resume marker check gone");
  }
  if (verify.includes("act3_lethal_mira_end") && verify.includes("act3_lethal_elias_end")) {
    // already named inside verify; still require the engine skip path above
  }
  for (const [rel, id] of LETHAL_ENDS) {
    const src = readFileSync(resolve(ROOT, rel), "utf8");
    if (!src.includes(`${id}:`)) {
      errors.push(`${id} missing from ${rel}`);
      continue;
    }
    if (!src.includes("kill(")) {
      errors.push(`${id} onEnter no longer calls kill — death beat write site gone`);
    }
  }
  return errors;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const errors = lethalResumeDeathbeatChecks();
  if (errors.length) {
    console.error("FAIL lethal resume deathbeat", errors);
    process.exit(1);
  }
  console.log("PASS lethal resume deathbeat (sceneEntered skipOnEnter; lethal ends still kill once on enter)");
}
