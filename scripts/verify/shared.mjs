// Shared by scripts/verify.mjs and the check modules beside this file.

import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");

// The exact browser load order of index.html; manifestChecks in verify.mjs pins it.
export const EXPECTED_SCRIPTS = [
  "src/state.js",
  ...Array.from({ length: 55 }, (_, index) => `src/scenes-${String(index + 1).padStart(2, "0")}.js`),
  "src/engine.js",
  "src/validate.js",
  "src/hitl-unshadow.js",
  "src/review-build-stamp.js"
];

export function sameArray(left, right) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}
