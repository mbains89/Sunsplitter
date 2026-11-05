import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { playtestCacheBustFollow02Checks } from "./playtest-cache-bust-follow-02-checks.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// SUN-PLAYTEST-PAINT-HONESTY-FOLLOW-01 — paint is 0.36 after BOUNDARY open.
export function playtestPaintHonestyFollow01Checks() {
  const errors = [...playtestCacheBustFollow02Checks()];
  const note = resolve(ROOT, "docs/SUN_PLAYTEST_PAINT_HONESTY_FOLLOW_01.md");
  if (!existsSync(note)) errors.push("paint-honesty follow note missing");
  const lock = readFileSync(resolve(ROOT, "docs/version-lock.md"), "utf8");
  if (!lock.includes("lane 0.30.1 · certified 0.28.1d · NO-PUBLISH · 0.36 PAINT")) {
    errors.push("version-lock line drifted");
  }
  return errors;
}
