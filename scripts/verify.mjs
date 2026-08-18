#!/usr/bin/env node

// Release-gate ownership:
// - Manifest + syntax: exact browser load order and parseability.
// - Runtime + validator: one-time registration, 207-scene count, and scene-ID digest.
// - Policy simulations: Living, Future, and pragmatic routes reach truthful endings.
// - V6 fixtures: Amara and Sela stay "made" when they die before an authored test,
//   and their untested promises are omitted from ending reflection.

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import {
  EXPECTED_SCENE_COUNT,
  POLICY_NAMES,
  assertV6,
  loadGame,
  readScriptManifest,
  runPolicySet,
  sceneIdDigest,
  simulationAssertions
} from "./simulate.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const EXPECTED_SCRIPTS = [
  "src/state.js",
  ...Array.from({ length: 55 }, (_, index) => `src/scenes-${String(index + 1).padStart(2, "0")}.js`),
  "src/engine.js",
  "src/validate.js"
];

// Digest of the sorted scene IDs produced by executing the 55 numbered modules.
// Update only when an authorized scene-manifest change intentionally adds/removes/renames a scene.
const EXPECTED_SCENE_IDS_SHA256 = "06d96db2928d77837c910e875d3a3c56de8b18f2bd4fb895a2aa68650644cfa2";

function sameArray(left, right) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function syntaxChecks(scripts) {
  const errors = [];
  for (const relativePath of scripts) {
    const source = readFileSync(resolve(ROOT, relativePath), "utf8");
    try {
      new vm.Script(source, { filename: relativePath });
    } catch (error) {
      errors.push(`${relativePath}: ${error.message}`);
    }
  }
  return errors;
}

function manifestChecks(scripts) {
  const errors = [];
  const duplicates = scripts.filter((script, index) => scripts.indexOf(script) !== index);
  if (duplicates.length) errors.push(`duplicate script entries: ${[...new Set(duplicates)].join(", ")}`);
  if (!sameArray(scripts, EXPECTED_SCRIPTS)) {
    errors.push(`index script manifest mismatch\n  expected: ${EXPECTED_SCRIPTS.join(", ")}\n  actual:   ${scripts.join(", ")}`);
  }
  return errors;
}

function registrationChecks(runtime) {
  const errors = [];
  const counts = new Map();
  for (const event of runtime.registrations) counts.set(event.id, (counts.get(event.id) || 0) + 1);
  const nonOnce = [...counts.entries()].filter(([, count]) => count !== 1);
  if (nonOnce.length) errors.push(`scenes not registered exactly once: ${nonOnce.map(([id, count]) => `${id}=${count}`).join(", ")}`);
  if (runtime.registrations.length !== runtime.sceneIds.length) {
    errors.push(`registration event count ${runtime.registrations.length} != registered scene count ${runtime.sceneIds.length}`);
  }
  if (runtime.sceneIds.length !== EXPECTED_SCENE_COUNT) {
    errors.push(`scene count ${runtime.sceneIds.length} != expected ${EXPECTED_SCENE_COUNT}`);
  }
  const digest = sceneIdDigest(runtime.sceneIds);
  if (digest !== EXPECTED_SCENE_IDS_SHA256) {
    errors.push(`executed scene-ID manifest digest ${digest} != expected ${EXPECTED_SCENE_IDS_SHA256}`);
  }
  const sceneFiles = EXPECTED_SCRIPTS.filter(path => /src\/scenes-\d{2}\.js$/.test(path));
  const filesThatRegistered = new Set(runtime.registrations.map(event => event.file));
  const emptyModules = sceneFiles.filter(path => !filesThatRegistered.has(path));
  if (emptyModules.length) errors.push(`scene modules registered no scenes: ${emptyModules.join(", ")}`);
  return { errors, digest };
}

function validatorChecks(runtime) {
  const errors = [];
  const result = runtime.evaluate("window.validateSunsplitter()");
  if (!result || typeof result !== "object") errors.push("validator returned no result");
  else if (result.errors?.length) errors.push(...result.errors.map(error => `validator: ${error}`));
  if (result && result.count !== EXPECTED_SCENE_COUNT) {
    errors.push(`validator count ${result.count} != expected ${EXPECTED_SCENE_COUNT}`);
  }
  return { errors, result };
}

function printCheck(label, errors, detail = "") {
  if (errors.length) {
    console.error(`FAIL ${label}${detail ? ` (${detail})` : ""}`);
    errors.forEach(error => console.error(`  - ${error}`));
  } else {
    console.log(`PASS ${label}${detail ? ` (${detail})` : ""}`);
  }
}

function main() {
  const failures = [];
  const { scripts } = readScriptManifest(ROOT);

  const manifestErrors = manifestChecks(scripts);
  printCheck("script manifest", manifestErrors, `${scripts.length} files`);
  failures.push(...manifestErrors);

  const syntaxErrors = syntaxChecks(scripts);
  printCheck("loaded JavaScript syntax", syntaxErrors, `${scripts.length} files compiled`);
  failures.push(...syntaxErrors);

  let runtime;
  try {
    runtime = loadGame(ROOT);
    printCheck("full runtime execution", []);
  } catch (error) {
    const errors = [error.stack || error.message];
    printCheck("full runtime execution", errors);
    failures.push(...errors);
  }

  if (runtime) {
    const registration = registrationChecks(runtime);
    printCheck("scene registration", registration.errors, `${runtime.sceneIds.length} scenes; sha256=${registration.digest}`);
    failures.push(...registration.errors);

    const validator = validatorChecks(runtime);
    printCheck("runtime validator", validator.errors, `${validator.result?.warnings?.length || 0} warning(s)`);
    failures.push(...validator.errors);
  }

  const simulations = runPolicySet(ROOT, { policies: POLICY_NAMES, runs: 1, seed: 20260817 });
  for (const result of simulations) {
    const errors = simulationAssertions(result);
    printCheck(`simulation ${result.policy}`, errors, result.completed ? `${result.ending.title}; ${result.steps} steps` : result.failure);
    failures.push(...errors.map(error => `${result.policy}: ${error}`));
  }

  for (const holder of ["amara", "sela"]) {
    const v6 = assertV6(ROOT, holder);
    printCheck(`V6 untested dead-holder promise (${holder})`, v6.errors,
      `before=${v6.beforeEnding}; after=${v6.afterEnding}; ending=${v6.endingTitle}`);
    failures.push(...v6.errors.map(error => `V6/${holder}: ${error}`));
  }

  if (failures.length) {
    console.error(`\nRELEASE GATE FAIL — ${failures.length} failure(s)`);
    process.exitCode = 1;
  } else {
    console.log("\nRELEASE GATE PASS");
  }
}

try {
  main();
} catch (error) {
  console.error(`RELEASE GATE CRASH\n${error.stack || error.message}`);
  process.exitCode = 1;
}
