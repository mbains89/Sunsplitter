import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// SUN-037-REVIEW-BUILD-01 — stamp stays hidden unless the package manifest has a 40-hex sourceCommit.
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export function reviewBuildStampChecks() {
  const errors = [];
  const index = readFileSync(resolve(ROOT, "index.html"), "utf8");
  const css = readFileSync(resolve(ROOT, "css/title-start.css"), "utf8");
  const stamp = readFileSync(resolve(ROOT, "src/review-build-stamp.js"), "utf8");
  const verify = readFileSync(resolve(ROOT, "scripts/verify.mjs"), "utf8");
  if (!index.includes('id="review-build-stamp"')) errors.push("title utilities missing review-build stamp");
  if (!index.includes("review-build-stamp hidden")) errors.push("stamp must start hidden");
  if (!index.includes('src="src/review-build-stamp.js"')) errors.push("stamp script is not loaded");
  if (!verify.includes('"src/review-build-stamp.js"')) errors.push("EXPECTED_SCRIPTS missing review-build-stamp.js");
  if (!stamp.includes("PRIVATE_PACKAGE_MANIFEST.json")) errors.push("stamp does not read the package manifest");
  if (!stamp.includes("Private review build")) errors.push("stamp label missing");
  if (!stamp.includes("/^[0-9a-f]{40}$/")) errors.push("stamp does not require a 40-hex sourceCommit");
  if (!css.includes("#review-build-stamp.hidden")) errors.push("stamp hidden rule missing");
  return errors;
}
