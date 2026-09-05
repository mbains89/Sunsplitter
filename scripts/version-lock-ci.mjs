#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const LOCK_LINE = "lane 0.30.1 · certified 0.28.1d · NO-PUBLISH · 0.36 HOLD";
const CERTIFIED = "0.28.1d";

function readText(path, root = ROOT) {
  return readFileSync(resolve(root, path), "utf8");
}

function paintLine(versionMd) {
  return String(versionMd || "").split(/\r?\n/).map(line => line.trim()).find(Boolean) || "";
}

export function evaluateVersionLock({ versionMd, lockMd }) {
  const errors = [];
  const paint = paintLine(versionMd);
  if (!paint) errors.push("VERSION.md paint line is missing");
  if (/^0\.36(?:\b|$)/.test(paint) || paint === "0.36") {
    errors.push(`VERSION.md paints 0.36 (${paint}); 0.36 HOLD forbids mint/paint`);
  }
  if (/\bGAME_VERSION\b/.test(versionMd || "")) {
    errors.push("VERSION.md must not invent GAME_VERSION");
  }
  if (/\b0\.36\b/.test(versionMd || "") && !/\b0\.36 HOLD\b/.test(versionMd || "")) {
    errors.push("VERSION.md mentions 0.36 without HOLD; treat as mint/paint");
  }
  if (!/Last certified baseline remains 0\.28\.1d/.test(versionMd || "")) {
    errors.push(`VERSION.md last certified must remain ${CERTIFIED}`);
  }
  if (!/NO-PUBLISH/.test(versionMd || "")) {
    errors.push("VERSION.md must keep NO-PUBLISH");
  }
  if (!/NOT_CERTIFIED/.test(versionMd || "")) {
    errors.push("VERSION.md must keep NOT_CERTIFIED");
  }
  if (!(lockMd || "").includes(LOCK_LINE)) {
    errors.push(`docs/version-lock.md missing lock line: ${LOCK_LINE}`);
  }
  if (/certified 0\.36/.test(lockMd || "") || /lane 0\.36/.test(lockMd || "")) {
    errors.push("docs/version-lock.md must not certify or open 0.36");
  }
  return errors;
}

function runSelfTest() {
  const versionMd = readText("VERSION.md");
  const lockMd = readText("docs/version-lock.md");
  assert.deepEqual(evaluateVersionLock({ versionMd, lockMd }), []);

  const cases = [
    ["0.36 paint", { versionMd: "0.36\n\nNO-PUBLISH / NOT_CERTIFIED. Last certified baseline remains 0.28.1d.\n", lockMd }, "paints 0.36"],
    ["0.36 mention", { versionMd: "0.33\n\nOpening 0.36 now.\nNO-PUBLISH / NOT_CERTIFIED. Last certified baseline remains 0.28.1d.\n", lockMd }, "mentions 0.36"],
    ["GAME_VERSION", { versionMd: "0.33\nGAME_VERSION\nNO-PUBLISH / NOT_CERTIFIED. Last certified baseline remains 0.28.1d.\n", lockMd }, "GAME_VERSION"],
    ["certified drift", { versionMd: "0.33\n\nNO-PUBLISH / NOT_CERTIFIED. Last certified baseline remains 0.31.\n", lockMd }, "last certified"],
    ["missing lock", { versionMd, lockMd: "# lock\n" }, "missing lock line"],
    ["lock opens 0.36", { versionMd, lockMd: lockMd + "\nlane 0.36\n" }, "open 0.36"]
  ];
  for (const [label, docs, needle] of cases) {
    const errors = evaluateVersionLock(docs);
    assert.ok(errors.length, `${label} passed`);
    assert.ok(errors.some(error => error.includes(needle)), `${label} message drifted: ${errors.join("; ")}`);
  }
  console.log(`PASS version-lock-ci self-test — live lock accepted; ${cases.length} negative fixtures rejected`);
}

function main() {
  if (process.argv[2] === "--self-test") return runSelfTest();
  if (process.argv.length !== 2) throw new Error("Usage: node scripts/version-lock-ci.mjs [--self-test]");
  const errors = evaluateVersionLock({
    versionMd: readText("VERSION.md"),
    lockMd: readText("docs/version-lock.md")
  });
  if (errors.length) {
    errors.forEach(error => console.error(`FAIL ${error}`));
    process.exitCode = 1;
    return;
  }
  console.log(`PASS version-lock-ci — paint ${paintLine(readText("VERSION.md"))}; certified ${CERTIFIED}; ${LOCK_LINE}`);
}

try {
  main();
} catch (error) {
  console.error(`FAIL version-lock-ci crash: ${error.stack || error.message}`);
  process.exitCode = 1;
}
