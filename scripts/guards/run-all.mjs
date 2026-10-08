#!/usr/bin/env node
/** Run the SUN-CORRECT-01 guards. Same command locally and in CI. */
import { spawnSync } from "node:child_process";

const guards = [
  "scripts/guards/hollow-stub.mjs",
  "scripts/guards/tip-sync-churn.mjs",
  "scripts/guards/portrait-fallback.mjs",
];
let failed = 0;
for (const guard of guards) {
  const res = spawnSync(process.execPath, [guard], { stdio: "inherit" });
  if (res.status !== 0) failed += 1;
}
if (failed) {
  console.error(`repo-guards: ${failed} failed`);
  process.exit(1);
}
console.log("repo-guards: pass");
