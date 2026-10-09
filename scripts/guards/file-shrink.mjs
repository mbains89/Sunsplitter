#!/usr/bin/env node
/** SUN-GUARD-FILE-SHRINK-01. Fail a PR that guts an existing file.
 *  A modified file fails when it loses more than 50 lines AND more than 30%
 *  of its lines, unless the PR has the label big-delete-ok.
 *  Binary/image files fail when the head is under 1024 bytes or more than 50%
 *  smaller, unless big-delete-ok. Text (.js .mjs .css .html .md .json .svg)
 *  is never skipped just because git numstat is -/-.
 *  No new dependencies. Does not change any other guard. */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const LABEL = "big-delete-ok";
const LINE_FLOOR = 50;
const RATIO_FLOOR = 0.3;
const BYTE_FLOOR = 1024;
const BYTE_RATIO = 0.5;
const BINARY_EXT = new Set([
  ".png", ".jpg", ".jpeg", ".webp", ".gif", ".ico", ".avif", ".bmp",
  ".mp3", ".ogg", ".wav", ".woff", ".woff2", ".ttf", ".otf", ".pdf", ".zip",
]);
const TEXT_EXT = new Set([".js", ".mjs", ".css", ".html", ".md", ".json", ".svg"]);

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
  const n = String(text).split("\n").length;
  return String(text).endsWith("\n") ? n - 1 : n;
}

export function extensionOf(path) {
  const name = String(path || "").split("/").pop().toLowerCase();
  const dot = name.lastIndexOf(".");
  return dot < 0 ? "" : name.slice(dot);
}

export function isBinaryExtension(path) {
  return BINARY_EXT.has(extensionOf(path));
}

export function isTextPath(path) {
  return TEXT_EXT.has(extensionOf(path));
}

export function isBinaryNumstat(added, deleted) {
  return added === "-" && deleted === "-";
}

export function binaryPathsFromNumstat(raw) {
  const found = new Set();
  for (const line of String(raw || "").split("\n")) {
    if (!line.trim()) continue;
    const parts = line.split("\t");
    if (parts.length < 3 || !isBinaryNumstat(parts[0], parts[1])) continue;
    const path = parts.slice(2).join("\t");
    if (isTextPath(path)) continue;
    found.add(path);
  }
  return found;
}

export function isExempt(path) {
  const name = String(path || "").split("/").pop();
  if (EXEMPT.includes(name) || EXEMPT.includes(path)) return true;
  if (name.endsWith(".lock")) return true;
  if (name.endsWith(".min.js") || name.endsWith(".min.css")) return true;
  return false;
}

export function shrinkVerdict(path, beforeText, afterText) {
  const before = lineCount(beforeText);
  const after = lineCount(afterText);
  const lost = before - after;
  const ratio = before === 0 ? 0 : lost / before;
  const gut = lost > LINE_FLOOR && ratio > RATIO_FLOOR;
  return { path, before, after, lost, ratio, gut, kind: "lines", bypassed: false };
}

export function byteVerdict(path, beforeBytes, afterBytes, labelOk = false) {
  const before = Number(beforeBytes);
  const after = Number(afterBytes);
  const lost = before - after;
  const ratio = before > 0 ? lost / before : 0;
  const tooSmall = after < BYTE_FLOOR;
  const halved = before > 0 && after < before * BYTE_RATIO;
  const gut = tooSmall || halved;
  return { path, before, after, lost, ratio, gut, kind: "bytes", bypassed: Boolean(labelOk) && gut };
}

export function evaluateChange(change, { labelOk = false } = {}) {
  const path = change?.path || "";
  if (isExempt(path)) return { path, gut: false, bypassed: false, kind: "exempt" };
  if (isTextPath(path)) {
    if (change.beforeText != null || change.afterText != null) {
      const row = shrinkVerdict(path, change.beforeText || "", change.afterText || "");
      if (row.gut) return { ...row, bypassed: Boolean(labelOk) };
    }
    if (change.beforeLines != null && change.afterLines != null) {
      const before = Number(change.beforeLines);
      const after = Number(change.afterLines);
      const lost = before - after;
      const ratio = before > 0 ? lost / before : 0;
      if (lost > LINE_FLOOR && ratio > RATIO_FLOOR) {
        return { path, before, after, lost, ratio, gut: true, kind: "lines", bypassed: Boolean(labelOk) };
      }
    }
    if (change.beforeBytes != null) return byteVerdict(path, change.beforeBytes, change.afterBytes, labelOk);
    return { path, gut: false, bypassed: false, kind: "lines" };
  }
  if (isBinaryExtension(path) || change?.binary || isBinaryNumstat(change?.numstatAdded, change?.numstatDeleted)) {
    return byteVerdict(path, change.beforeBytes, change.afterBytes, labelOk);
  }
  if (change.beforeText != null || change.afterText != null) {
    const row = shrinkVerdict(path, change.beforeText || "", change.afterText || "");
    return { ...row, bypassed: Boolean(labelOk) && row.gut };
  }
  return { path, gut: false, bypassed: false, kind: "lines" };
}

export function formatVerdict(row) {
  const pct = ((row.ratio || 0) * 100).toFixed(1);
  const unit = row.kind === "bytes" ? " bytes" : "";
  const note = row.bypassed ? " BYPASS big-delete-ok" : row.gut ? " FAIL" : " PASS";
  return `${row.path} ${row.before} -> ${row.after}${unit} (-${row.lost}, ${pct}%)${note}`;
}

function git(args, encoding = "utf8") {
  return execFileSync("git", args, { cwd: ROOT, encoding });
}

function bytesAt(ref, path) {
  return Number(git(["cat-file", "-s", `${ref}:${path}`], "utf8").trim());
}

function labelsFromEnv() {
  return String(process.env.GUARD_LABELS || "")
    .split(",")
    .map(label => label.trim())
    .filter(Boolean);
}

export function scanModified(baseSha, headSha, labelOk = false) {
  const names = git(["diff", "--name-only", "--diff-filter=M", baseSha, headSha])
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean);
  const binary = binaryPathsFromNumstat(git(["diff", "--numstat", baseSha, headSha]));
  const rows = [];
  for (const path of names) {
    if (isExempt(path)) continue;
    if (isTextPath(path)) {
      let beforeText = "";
      let afterText = "";
      try {
        beforeText = git(["show", `${baseSha}:${path}`]);
        afterText = git(["show", `${headSha}:${path}`]);
        const row = shrinkVerdict(path, beforeText, afterText);
        if (row.gut) rows.push({ ...row, bypassed: labelOk });
        else rows.push(row);
      } catch {
        rows.push(byteVerdict(path, bytesAt(baseSha, path), bytesAt(headSha, path), labelOk));
      }
      continue;
    }
    if (isBinaryExtension(path) || binary.has(path)) {
      rows.push(byteVerdict(path, bytesAt(baseSha, path), bytesAt(headSha, path), labelOk));
      continue;
    }
    const beforeText = git(["show", `${baseSha}:${path}`]);
    const afterText = git(["show", `${headSha}:${path}`]);
    const row = shrinkVerdict(path, beforeText, afterText);
    rows.push({ ...row, bypassed: labelOk && row.gut });
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
  const labelOk = labelsFromEnv().includes(LABEL);
  const rows = scanModified(baseSha, headSha, labelOk);
  const guts = rows.filter(row => row.gut && !row.bypassed);
  if (!guts.length) {
    console.log(`PASS file-shrink (${rows.length} modified files, none gutted)`);
    return;
  }
  console.error("FAIL file-shrink: existing file lost too many lines or too many bytes");
  for (const row of guts) console.error("GUT " + formatVerdict(row));
  if (labelOk) {
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
      row: evaluateChange({ path: "index.html", beforeText: before, afterText: gutted }),
      expectFail: true,
    },
    {
      name: "normal edit passes",
      row: evaluateChange({ path: "index.html", beforeText: before, afterText: normal }),
      expectFail: false,
    },
    {
      name: "label bypass works",
      row: evaluateChange({ path: "index.html", beforeText: before, afterText: gutted }, { labelOk: true }),
      expectFail: false,
    },
    {
      name: "cut_out.jpg cut to 1 byte fails",
      row: evaluateChange({ path: "images/cut_out.jpg", beforeBytes: 594906, afterBytes: 1 }),
      expectFail: true,
    },
    {
      name: "engine.js null-byte cut fails",
      row: evaluateChange({
        path: "src/engine.js",
        beforeLines: 900,
        afterLines: 2,
        beforeBytes: 24000,
        afterBytes: 2,
        numstatAdded: "-",
        numstatDeleted: "-",
        binary: true,
      }),
      expectFail: true,
    },
    {
      name: "big-delete-ok image passes",
      row: evaluateChange({ path: "images/cut_out.jpg", beforeBytes: 594906, afterBytes: 1 }, { labelOk: true }),
      expectFail: false,
    },
  ];
  let failed = 0;
  for (const c of cases) {
    const wouldFail = Boolean(c.row && c.row.gut && !c.row.bypassed);
    const ok = wouldFail === c.expectFail;
    console.log(`${ok ? "PASS" : "FAIL"} ${c.name}: ${formatVerdict(c.row)}`);
    if (!ok) failed += 1;
  }
  if (isExempt("package-lock.json") !== true || isExempt("src/engine.js") !== false) {
    console.error("FAIL exemption list drifted");
    failed += 1;
  }
  if (isExempt("images/cut_out.jpg") !== false || isTextPath("src/engine.js") !== true) {
    console.error("FAIL image must be checked and engine.js must stay text");
    failed += 1;
  }
  if (isTextPath("src/style.css") !== true || isTextPath("notes.md") !== true || isTextPath("art/mark.svg") !== true) {
    console.error("FAIL text files must stay checked");
    failed += 1;
  }
  if (failed) {
    console.error(`file-shrink self-test: ${failed} failed`);
    process.exit(1);
  }
  console.log("PASS file-shrink self-test (jpg 1-byte FAIL; engine.js null-byte FAIL; big-delete-ok PASS)");
}

if (process.argv.includes("--self-test")) runSelfTest();
else runLive();
