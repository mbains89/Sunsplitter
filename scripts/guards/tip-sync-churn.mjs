#!/usr/bin/env node
/**
 * TIP_SYNC_CHURN — fail only on new paperwork-only tip-sync diffs.
 * Adding PROGRESS.md fails. Deleting it is required and does not fail.
 * Evidence: #423–#434 only cite the lane tip.
 *
 *   node scripts/guards/tip-sync-churn.mjs
 *   node scripts/guards/tip-sync-churn.mjs --replay-434
 */
import { execFileSync } from "node:child_process";

const PAPER = new Set([
  "artifacts/PROJECT_STATUS.md",
  "docs/TICKET_QUEUE.md",
  "artifacts/ROADMAP.md",
]);

function isPaper(file) {
  const f = file.trim();
  if (!f) return false;
  if (PAPER.has(f)) return true;
  if (/^docs\/SUN_ROADMAP_TIP_SYNC_.*\.md$/.test(f)) return true;
  return false;
}

function nameStatus() {
  if (process.argv.includes("--replay-434")) {
    return [
      ["A", "artifacts/PROJECT_STATUS.md"],
      ["A", "docs/TICKET_QUEUE.md"],
      ["A", "docs/SUN_ROADMAP_TIP_SYNC_E14C.md"],
    ];
  }
  const base = process.env.GUARD_BASE_SHA;
  if (!base) return [];
  let out = "";
  try {
    out = execFileSync("git", ["diff", "--name-status", `${base}...HEAD`], { encoding: "utf8" });
  } catch {
    out = execFileSync("git", ["diff", "--name-status", base, "HEAD"], { encoding: "utf8" });
  }
  return out.split("\n").map((line) => line.trim()).filter(Boolean).map((line) => {
    const [status, file] = line.split(/\s+/, 2);
    return [status, file];
  });
}

let rows;
try {
  rows = nameStatus();
} catch (err) {
  console.error(`TIP_SYNC_CHURN could not diff: ${err.message}`);
  process.exit(1);
}
const replay = process.argv.includes("--replay-434");
const addedProgress = rows.some(([status, file]) => file === "PROGRESS.md" && status.startsWith("A"));
if (addedProgress) {
  console.error("TIP_SYNC_CHURN PROGRESS.md must never land on the lane. Delete it. Do not resolve or keep it.");
  process.exit(1);
}
const files = rows.map(([, file]) => file).filter((file) => file && file !== "PROGRESS.md");
if (!files.length && !replay) {
  console.log("tip-sync-churn: pass (PROGRESS.md delete ignored)");
  process.exit(0);
}
const addedTipSync = files.filter((f) => /^docs\/SUN_ROADMAP_TIP_SYNC_.*\.md$/.test(f));
const onlyPaper = files.length > 0 && files.every(isPaper);
if (addedTipSync.length || onlyPaper) {
  console.error(
    "TIP_SYNC_CHURN paperwork-only diff (" +
      files.join(", ") +
      "). Do not open SUN-ROADMAP-TIP-SYNC. Cite the lane tip in the player PR body. " +
      "Do not add docs/SUN_ROADMAP_TIP_SYNC_*.md."
  );
  process.exit(1);
}
console.log("tip-sync-churn: pass");
