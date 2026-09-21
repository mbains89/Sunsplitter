// SUN-LETHAL-RESUME-DEATHBEAT-01 — static proof current saves skip lethal onEnter.
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export function lethalResumeDeathbeatChecks() {
  const errors = [];
  const engine = readFileSync(resolve(ROOT, "src/engine.js"), "utf8");
  const verify = readFileSync(resolve(ROOT, "scripts/verify.mjs"), "utf8");
  const lenaEnd = readFileSync(resolve(ROOT, "src/scenes-20.js"), "utf8");
  if (!engine.includes("sceneEntered: true")) {
    errors.push("snapshotState no longer marks sceneEntered on current saves");
  }
  if (!engine.includes("skipOnEnter: sceneEntered")) {
    errors.push("loadGame no longer skips onEnter when sceneEntered is set");
  }
  if (!engine.includes("if (scene.onEnter && !opts.skipOnEnter)")) {
    errors.push("showScene no longer honors skipOnEnter");
  }
  if (!verify.includes("function resumeEntryIdempotenceChecks")) {
    errors.push("resumeEntryIdempotenceChecks missing from verify.mjs");
  }
  if (!verify.includes("resume preserves completed scene entry")) {
    errors.push("resumeEntryIdempotenceChecks is not invoked");
  }
  if (!lenaEnd.includes("act3_lethal_lena_end")) {
    errors.push("act3_lethal_lena_end missing");
  }
  if (!lenaEnd.includes("kill(\"lena\"")) {
    errors.push("lena_end onEnter no longer owns the death beat kill");
  }
  if (!lenaEnd.includes("return \"act3_vault_face\"")) {
    errors.push("lena_end lost the already-dead redirect (re-kill guard)");
  }
  return errors;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const errors = lethalResumeDeathbeatChecks();
  if (errors.length) {
    console.error("FAIL lethal resume deathbeat", errors);
    process.exit(1);
  }
  console.log("PASS lethal resume deathbeat (ALREADY_SATISFIED: sceneEntered + skipOnEnter)");
}
