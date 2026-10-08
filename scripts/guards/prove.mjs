#!/usr/bin/env node
/** Same command locally and in CI. Replay must fail. Live tree must pass. */
import { spawnSync } from "node:child_process";

const cases = [
  {
    name: "hollow #416 b6284dce",
    args: ["scripts/guards/hollow-stub.mjs", "--replay-416"],
    expect: 1,
  },
  {
    name: "tip-sync #434 2e4fdfa1 / merge 520be6ad",
    args: ["scripts/guards/tip-sync-churn.mjs", "--replay-434"],
    expect: 1,
  },
  {
    name: "portrait corridor.jpg copy (Vess-lookalike addition)",
    args: ["scripts/guards/portrait-fallback.mjs", "--replay-copy"],
    expect: 1,
  },
  {
    name: "live hollow",
    args: ["scripts/guards/hollow-stub.mjs"],
    expect: 0,
  },
  {
    name: "live portrait",
    args: ["scripts/guards/portrait-fallback.mjs"],
    expect: 0,
  },
];

let failed = 0;
for (const c of cases) {
  const res = spawnSync(process.execPath, c.args, { encoding: "utf8" });
  const out = `${res.stdout || ""}${res.stderr || ""}`.trim();
  const status = res.status ?? 1;
  console.log(`\n--- ${c.name} exit ${status} (expect ${c.expect}) ---`);
  console.log(out);
  if (status !== c.expect) {
    console.error(`PROOF_MISMATCH ${c.name}`);
    failed += 1;
  }
}
if (failed) {
  console.error(`prove: ${failed} mismatched`);
  process.exit(1);
}
console.log("\nprove: replay fails and live scans pass");
