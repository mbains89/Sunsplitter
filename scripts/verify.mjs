#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const EXPECTED_SCENE_COUNT = 207;

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name === ".git" || entry.name === "node_modules") continue;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(absolute));
    else files.push(absolute);
  }
  return files;
}

function relative(file) {
  return path.relative(ROOT, file).split(path.sep).join("/");
}

function countBy(values) {
  const counts = new Map();
  for (const value of values) counts.set(value, (counts.get(value) || 0) + 1);
  return counts;
}

function makeConsoleSink() {
  const entries = [];
  return {
    entries,
    console: {
      log: (...args) => entries.push(["log", args]),
      warn: (...args) => entries.push(["warn", args]),
      error: (...args) => entries.push(["error", args])
    }
  };
}

async function main() {
  const failures = [];
  const allFiles = await walk(ROOT);
  const javascriptFiles = allFiles
    .filter(file => /\.(?:js|mjs)$/.test(file))
    .sort((a, b) => relative(a).localeCompare(relative(b)));

  for (const file of javascriptFiles) {
    const result = spawnSync(process.execPath, ["--check", file], {
      cwd: ROOT,
      encoding: "utf8"
    });
    if (result.status !== 0) {
      failures.push(`${relative(file)} failed to parse\n${(result.stderr || result.stdout).trim()}`);
    }
  }

  const indexHtml = await readFile(path.join(ROOT, "index.html"), "utf8");
  const indexedScripts = [...indexHtml.matchAll(/<script\b[^>]*\bsrc=["']([^"']+\.js)["'][^>]*>/gi)]
    .map(match => match[1].replace(/^\.\//, ""));
  const indexedCounts = countBy(indexedScripts);

  for (const required of ["src/state.js", "src/engine.js", "src/validate.js"]) {
    if (indexedCounts.get(required) !== 1) {
      failures.push(`${required} must appear exactly once in index.html (found ${indexedCounts.get(required) || 0})`);
    }
  }

  const sceneFiles = (await readdir(path.join(ROOT, "src")))
    .filter(name => /^scenes-\d{2}\.js$/.test(name))
    .sort()
    .map(name => `src/${name}`);
  const indexedSceneFiles = indexedScripts.filter(file => /^src\/scenes-\d{2}\.js$/.test(file));

  if (JSON.stringify(indexedSceneFiles) !== JSON.stringify(sceneFiles)) {
    failures.push("index.html scene-module list must match the numbered scene files in lexical order");
  }
  for (const file of sceneFiles) {
    if (indexedCounts.get(file) !== 1) {
      failures.push(`${file} must load exactly once from index.html (found ${indexedCounts.get(file) || 0})`);
    }
  }

  const sink = makeConsoleSink();
  const context = vm.createContext({
    console: sink.console,
    window: {},
    location: { search: "" },
    localStorage: { getItem: () => null },
    setTimeout,
    clearTimeout
  });

  async function run(file) {
    const source = await readFile(path.join(ROOT, file), "utf8");
    new vm.Script(source, { filename: file }).runInContext(context);
  }

  try {
    await run("src/state.js");
    for (const file of indexedSceneFiles) await run(file);
  } catch (error) {
    failures.push(`scene load failed: ${error.stack || error.message}`);
  }

  let sceneCount = 0;
  try {
    sceneCount = vm.runInContext("Object.keys(scenes).length", context);
    if (sceneCount !== EXPECTED_SCENE_COUNT) {
      failures.push(`scene count mismatch: expected ${EXPECTED_SCENE_COUNT}, found ${sceneCount}`);
    }
  } catch (error) {
    failures.push(`scene registry unavailable: ${error.message}`);
  }

  let validation = { errors: ["validator did not run"], warnings: [] };
  if (!failures.some(failure => failure.startsWith("scene load failed"))) {
    try {
      await run("src/validate.js");
      if (typeof context.window.validateSunsplitter !== "function") {
        throw new Error("window.validateSunsplitter was not installed");
      }
      validation = context.window.validateSunsplitter();
      if (!validation || !Array.isArray(validation.errors)) {
        throw new Error("validator returned an invalid result");
      }
      failures.push(...validation.errors.map(error => `validator: ${error}`));
    } catch (error) {
      failures.push(`validator crashed: ${error.stack || error.message}`);
    }
  }

  console.log("[verify] Mode A");
  console.log(`[verify] JavaScript parsed: ${javascriptFiles.length} file(s)`);
  console.log(`[verify] Scene modules: ${sceneFiles.length} loaded exactly once`);
  console.log(`[verify] Validator: ${sceneCount}/${EXPECTED_SCENE_COUNT} scenes, ${validation.errors.length} error(s), ${(validation.warnings || []).length} warning(s)`);

  if (failures.length) {
    console.error(`[verify] FAIL (${failures.length})`);
    for (const failure of failures) console.error(`- ${failure}`);
    process.exitCode = 1;
    return;
  }

  console.log("[verify] PASS");
}

main().catch(error => {
  console.error(`[verify] CRASH: ${error.stack || error.message}`);
  process.exitCode = 1;
});
