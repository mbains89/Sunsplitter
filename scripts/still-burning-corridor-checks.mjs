// SUN-STILL-BURNING-CORRIDOR-01 — static proof that course_briefed pays corridor days.
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export function stillBurningCorridorChecks() {
  const errors = [];
  const scenes = readFileSync(resolve(ROOT, "src/scenes-26.js"), "utf8");
  const engine = readFileSync(resolve(ROOT, "src/engine.js"), "utf8");
  if (!engine.includes("Fourteen months. No guarantee.")) {
    errors.push("engine.js lost the unbriefed Still Burning months line");
  }
  if (!scenes.includes("state.flags.course_briefed")) {
    errors.push("reckon_truth does not read course_briefed");
  }
  if (!scenes.includes("day 181 through day 184")) {
    errors.push("course_briefed true path missing corridor days 181-184");
  }
  if (!scenes.includes("Fourteen months is a long time")) {
    errors.push("course_briefed false path missing Fourteen months line");
  }
  if (!scenes.includes("Verified corridor: day 181 through day 184. One pass.")) {
    errors.push("buildStillBurningText wrap missing corridor citation");
  }
  if (!scenes.includes("Fourteen months. No guarantee.")) {
    errors.push("wrap does not key off the engine hold line");
  }
  return errors;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const errors = stillBurningCorridorChecks();
  if (errors.length) {
    console.error("FAIL still-burning corridor", errors);
    process.exit(1);
  }
  console.log("PASS still-burning corridor (course_briefed cites day 181-184)");
}
