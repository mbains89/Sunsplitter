#!/usr/bin/env node
/** Run the SUN-CORRECT-01 guards. Same command locally and in CI.
 *  Live tree must pass. Each bad fixture must fail. */
import { spawnSync } from "node:child_process";

const live = [
  "scripts/guards/hollow-stub.mjs",
  "scripts/guards/tip-sync-churn.mjs",
  "scripts/guards/portrait-fallback.mjs",
];
const replays = [
  ["scripts/guards/hollow-stub.mjs", "--replay-416"],
  ["scripts/guards/tip-sync-churn.mjs", "--replay-434"],
  ["scripts/guards/tip-sync-churn.mjs", "--replay-tip-sync-doc"],
  ["scripts/guards/portrait-fallback.mjs", "--replay-copy"],
];
const passes = [
  ["scripts/guards/tip-sync-churn.mjs", "--replay-roadmap"],
];

let failed = 0;
for (const guard of live) {
  const res = spawnSync(process.execPath, [guard], { stdio: "inherit" });
  if (res.status !== 0) failed += 1;
}
for (const args of replays) {
  const res = spawnSync(process.execPath, args, { encoding: "utf8" });
  const status = res.status ?? 1;
  const out = `${res.stdout || ""}${res.stderr || ""}`.trim();
  console.log(`\n--- fixture ${args.join(" ")} exit ${status} (expect 1) ---`);
  console.log(out);
  if (status !== 1) {
    console.error(`FIXTURE_DID_NOT_FAIL ${args.join(" ")}`);
    failed += 1;
  }
}
for (const args of passes) {
  const res = spawnSync(process.execPath, args, { encoding: "utf8" });
  const status = res.status ?? 1;
  const out = `${res.stdout || ""}${res.stderr || ""}`.trim();
  console.log(`\n--- fixture ${args.join(" ")} exit ${status} (expect 0) ---`);
  console.log(out);
  if (status !== 0) {
    console.error(`FIXTURE_DID_NOT_PASS ${args.join(" ")}`);
    failed += 1;
  }
}
if (failed) {
  console.error(`repo-guards: ${failed} failed`);
  process.exit(1);
}
console.log("repo-guards: pass (live clean; bad fixtures failed; roadmap-only passed)");
