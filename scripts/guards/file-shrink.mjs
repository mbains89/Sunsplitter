#!/usr/bin/env node
/** SUN-GUARD-FILE-SHRINK-01. Fail a PR that guts an existing file.
 *  A modified file fails when it loses more than 50 lines AND more than 30%
 *  of its lines, unless the PR has the label big-delete-ok.
 *  Out of scope: deleted files, generated/lock files listed in EXEMPT,
 *  and binary/image files (extension or git numstat -/-).
 *  Text (.svg .css .js .json .md .html) stays checked.
 *  No new dependencies. Does not change any other guard. */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const LABEL = "big-delete-ok";
const LINE_FLOOR = 50;
const RATIO_FLOOR = 0.3;
const BINARY_EXT = new Set([
  ".png", ".jpg", ".jpeg", ".webp", ".gif", ".ico", ".avif", ".bmp",
  ".mp3", ".ogg", ".wav", ".woff", ".woff2", ".ttf", ".otf", ".pdf", ".zip",
]);

/** Deleted files are ignored by the modified-only diff. These generated/lock
 *  paths are also ignored even if modified. */
export const EXEMPT = [
  "package-lock.json",
  "npm-shrinkwrap.json",
  "yarn.lock",
  "pnpm-lock.yaml",
  "Cargo.lock",
  "poetry.lock",
  "composer.lock",
  "Gemfile.lock",
  "go.sum",
];

export function lineCount(text) {
  if (!text) return 0;
  const n = text.split("\n").length;
  return text.endsWith("\n") ? n - 1 : n;
}

export function isBinaryExtension(path) {
  const name = String(path || "").split("/").pop().toLowerCase();
  const dot = name.lastIndexOf(".");
  if (dot < 0) return false;
  return BINARY_EXT.has(name.slice(dot));
}

export function isBinaryNumstat(added, deleted) {
  return added === "-" && deleted === "-";
}

export function binaryPathsFromNumstat(raw) {
  const found = new Set();
  for (const line of String(raw || "").split("\n")) {
    if (!line.trim()) continue;
    const parts = line.split("\t");
    if (parts.length >= 3 && isBinaryNumstat(parts[0], parts[1])) {
      found.add(parts.slice(2).join("\t"));
    }
  }
  return found;
}

export function isExempt(path) {
  const name = path.split("/").pop();
  if (EXEMPT.includes(name) || EXEMPT.includes(path)) return true;
  if (name.endsWith(".lock")) return true;
  if (name.endsWith(".min.js") || name.endsWith(".min.css")) return true;
  if (isBinaryExtension(path)) return true;
  return false;
}

export function shrinkVerdict(path, beforeText, afterText) {
  const before = lineCount(beforeText);
  const after = lineCount(afterText);
  const lost = before - after;
  const ratio = before === 0 ? 0 : lost / before;
  const gut = lost > LINE_FLOOR && ratio > RATIO_FLOOR;
  return { path, before, after, lost, ratio, gut };
}

export function formatVerdict(row) {
  const pct = (row.ratio * 100).toFixed(1);
  return `${row.path} ${row.before} -> ${row.after} (-${row.lost}, ${pct}%)`;
}

function git(args) {
  return execFileSync("git", args, { cwd: ROOT, encoding: "utf8" });
}

function labelsFromEnv() {
  return String(process.env.GUARD_LABELS || "")
    .split(",")
    .map(label => label.trim())
    .filter(Boolean);
}

export function scanModified(baseSha, headSha) {
  const names = git(["diff", "--name-only", "--diff-filter=M", baseSha, headSha])
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean);
  const binary = binaryPathsFromNumstat(git(["diff", "--numstat", baseSha, headSha]));
  const rows = [];
  for (const path of names) {
    if (isExempt(path) || binary.has(path)) continue;
    const beforeText = git(["show", `${baseSha}:${path}`]);
    const afterText = git(["show", `${headSha}:${path}`]);
    rows.push(shrinkVerdict(path, beforeText, afterText));
  }
  return rows;
}

function runLive() {
  const baseSha = process.env.GUARD_BASE_SHA;
  if (!baseSha) {
    console.error("FAIL file-shrink: GUARD_BASE_SHA is missing");
    process.exit(1);
  }
  const headSha = git(["rev-parse", "HEAD"]).trim();
  const rows = scanModified(baseSha, headSha);
  const guts = rows.filter(row => row.gut);
  if (!guts.length) {
    console.log(`PASS file-shrink (${rows.length} modified files, none gutted)`);
    return;
  }
  console.error("FAIL file-shrink: existing file lost more than 50 lines and more than 30%");
  for (const row of guts) console.error("GUT " + formatVerdict(row));
  if (labelsFromEnv().includes(LABEL)) {
    console.log(`BYPASS file-shrink: label ${LABEL}`);
    return;
  }
  process.exit(1);
}

function runSelfTest() {
  const before = readFileSync(resolve(ROOT, "scripts/guards/fixtures/file-shrink-before.txt"), "utf8");
  const gutted = readFileSync(resolve(ROOT, "scripts/guards/fixtures/file-shrink-gutted.txt"), "utf8");
  const normal = readFileSync(resolve(ROOT, "scripts/guards/fixtures/file-shrink-normal.txt"), "utf8");
  const cases = [
    {
      name: "gutted file fails",
      row: shrinkVerdict("index.html", before, gutted),
      label: false,
      expectFail: true,
    },
    {
      name: "normal edit passes",
      row: shrinkVerdict("index.html", before, normal),
      label: false,
      expectFail: false,
    },
    {
      name: "label bypass works",
      row: shrinkVerdict("index.html", before, gutted),
      label: true,
      expectFail: false,
    },
    {
      name: "png and webp shrink pass",
      row: shrinkVerdict("art/plate.png", before, gutted),
      label: false,
      expectFail: false,
      exempt: true,
    },
    {
      name: "gutted js still fails",
      row: shrinkVerdict("src/engine.js", before, gutted),
      label: false,
      expectFail: true,
    },
    {
      name: "gutted md still fails",
      row: shrinkVerdict("docs/ROADMAP.md", before, gutted),
      label: false,
      expectFail: true,
    },
    {
      name: "numstat binary marker passes",
      row: { path: "icons/mark.dat", gut: true },
      label: false,
      expectFail: false,
      binary: true,
    },
  ];
  let failed = 0;
  for (const c of cases) {
    const skipped = c.exempt === true || c.binary === true || isExempt(c.row.path) || (c.binary && isBinaryNumstat("-", "-"));
    const wouldFail = !skipped && c.row.gut && !c.label;
    const ok = wouldFail === c.expectFail;
    console.log(`${ok ? "PASS" : "FAIL"} ${c.name}: ${c.row.before != null ? formatVerdict(c.row) : c.row.path} label=${c.label} skipped=${skipped}`);
    if (!ok) failed += 1;
  }
  if (isExempt("package-lock.json") !== true || isExempt("src/engine.js") !== false) {
    console.error("FAIL exemption list drifted");
    failed += 1;
  }
  if (isExempt("art/plate.png") !== true || isExempt("art/plate.webp") !== true) {
    console.error("FAIL image exemption missing");
    failed += 1;
  }
  if (isExempt("src/style.css") !== false || isExempt("notes.md") !== false || isExempt("art/mark.svg") !== false) {
    console.error("FAIL text files must stay checked");
    failed += 1;
  }
  if (isBinaryNumstat("-", "-") !== true || isBinaryNumstat("1", "2") !== false) {
    console.error("FAIL numstat binary marker");
    failed += 1;
  }
  if (failed) {
    console.error(`file-shrink self-test: ${failed} failed`);
    process.exit(1);
  }
  console.log("PASS file-shrink self-test (gutted fails; normal passes; label bypass works; png/webp pass; gutted js/md fail; numstat binary passes)");
}

if (process.argv.includes("--self-test")) runSelfTest();
else runLive();
