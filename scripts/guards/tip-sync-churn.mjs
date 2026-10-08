#!/usr/bin/env node
/**
 * TIP_SYNC_CHURN — fail only on new paperwork-only tip-sync diffs.
 * Evidence: #423–#434 (e.g. #434 head 2e4fdfa1, merge 520be6ad) only cite the lane tip.
 * Existing receipts stay. A new PR that only touches STATUS/QUEUE/tip-sync docs fails.
 *
 * Use instead: cite the lane tip in the player PR body. Do not open SUN-ROADMAP-TIP-SYNC.
 * Do not add docs/SUN_ROADMAP_TIP_SYNC_*.md.
 *
 *   node scripts/guards/tip-sync-churn.mjs
 *   node scripts/guards/tip-sync-churn.mjs --replay-434
 */
import { execSync } from "node:child_process";

const PAPER = new Set([
  "artifacts/PROJECT_STATUS.md",
  "docs/TICKET_QUEUE.md",
  "artifacts/ROADMAP.md",
  "PROGRESS.md",
]);

function isPaper(file) {
  const f = file.trim();
  if (!f) return false;
  if (PAPER.has(f)) return true;
  if (/^docs\/SUN_ROADMAP_TIP_SYNC_.*\.md$/.test(f)) return true;
  return false;
}

function changedFiles() {
  if (process.argv.includes("--replay-434")) {
    return [
      "artifacts/PROJECT_STATUS.md",
      "docs/TICKET_QUEUE.md",
      "docs/SUN_ROADMAP_TIP_SYNC_E14C.md",
    ];
  }
  const extra = process.argv.filter((a) => a.startsWith("--file=")).map((a) => a.slice(7));
  if (extra.length) return extra;
  const base = process.env.GUARD_BASE_SHA;
  if (!base) return [];
  try {
    const out = execSync(`git diff --name-only ${base}...HEAD`, { encoding: "utf8" });
    return out.split("\n").map((s) => s.trim()).filter(Boolean);
  } catch (err) {
    console.error(`TIP_SYNC_CHURN could not diff ${base}...HEAD: ${err.message}`);
    process.exit(1);
  }
}

const files = changedFiles();
const replay = process.argv.includes("--replay-434");
if (!files.length && !replay) {
  console.log("tip-sync-churn: pass (no diff; existing receipts grandfathered)");
  process.exit(0);
}
const addedTipSync = files.filter((f) => /^docs\/SUN_ROADMAP_TIP_SYNC_.*\.md$/.test(f));
const onlyPaper = files.length > 0 && files.every(isPaper);
if (addedTipSync.length || onlyPaper) {
  console.error(
    "TIP_SYNC_CHURN paperwork-only diff (" +
      files.join(", ") +
      "). Do not open SUN-ROADMAP-TIP-SYNC. Cite the lane tip in the player PR body. " +
      "Do not add docs/SUN_ROADMAP_TIP_SYNC_*.md. Owner docs stay artifacts/PROJECT_STATUS.md and docs/TICKET_QUEUE.md."
  );
  process.exit(1);
}
console.log("tip-sync-churn: pass");
