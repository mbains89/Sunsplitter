// Shared by scripts/verify.mjs and the check modules beside this file.

import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");

export function sameArray(left, right) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}
