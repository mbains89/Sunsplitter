#!/usr/bin/env node
// SUN-037-CODEX-STRESS-01: fresh, seeded, real-button playthroughs.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { createStressRuntime, runSeed } from "./sun-stress/runtime.mjs";
import { selfChecks } from "./sun-stress/self-checks.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const options = { seed: 37001, runs: 3000, maxSteps: 600, saveEvery: 20 };
let output = null, selfTest = false;
const integers = { "--seed": "seed", "--runs": "runs", "--max-steps": "maxSteps", "--save-every": "saveEvery" };
try {
for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === "--help") {
    console.log("node scripts/sun-stress-run.mjs [--seed UINT32] [--runs 3000] [--max-steps 600] [--save-every 20] [--output report.json] [--self-test]\nReplay: use the reported seed with --runs 1 and the same max-steps/save-every. Exit 1 means findings; exit 2 means harness/configuration error.");
    process.exit(0);
  }
  if (arg === "--self-test") { selfTest = true; continue; }
  if (arg === "--output") { output = args[++i]; if (!output) throw new Error("--output needs a path"); continue; }
  if (!integers[arg]) throw new Error(`Unknown option ${arg}`);
  const value = Number(args[++i]);
  if (!Number.isSafeInteger(value) || value < (arg === "--seed" || arg === "--save-every" ? 0 : 1) || value > 0xffffffff) throw new Error(`Invalid ${arg}`);
  options[integers[arg]] = value;
}
} catch (error) {
  console.error(`sun-stress configuration error: ${error.message}`);
  process.exit(2);
}

try {
  if (selfTest) {
    const result = selfChecks(root);
    console.log(`sun-stress self-test: PASS (${result} positive/negative assertions)`);
  } else {
    const started = performance.now();
    const runtime = createStressRuntime(root), saveRuntime = createStressRuntime(root);
    const report = { harness: "SUN-037-CODEX-STRESS-01", options, runs: 0, completed: 0, steps: 0, saveProbes: 0, boundaryProbes: [], failedRuns: 0, findings: 0, endings: {}, scenes: {}, rules: {}, examples: [], replay: [], limitations: ["Headless DOM; no device/browser layout claim.", "Active attribution scanner is conservative, not exhaustive semantic proof (L-048).", "Step-limit/repeated-state findings require route triage; they do not by themselves prove an unavoidable softlock.", "Save probes test the real single-slot resume path; no operating-system storage-loss simulation.", "Boundary probe calls one disabled unaffordable handler from a reached save; it is reported separately from random player clicks."] };
    const signatures = new Set();
    const digest = createHash("sha256");
    for (let run = 0; run < options.runs; run++) {
      const seed = (options.seed + run) >>> 0;
      const result = runSeed(runtime, saveRuntime, { ...options, seed, boundaryProbe: report.boundaryProbes.length === 0 });
      if (result.boundary) {
        report.boundaryProbes.push(result.boundary);
        if (!result.boundary.refused) result.failures.push(result.boundary);
      }
      report.runs++; report.completed += Number(result.completed); report.steps += result.steps; report.saveProbes += result.saveProbes;
      if (result.ending?.title) report.endings[result.ending.title] = (report.endings[result.ending.title] || 0) + 1;
      for (const step of result.trace) report.scenes[step.scene] = (report.scenes[step.scene] || 0) + 1;
      digest.update(JSON.stringify({ seed, trace: result.trace, state: result.state, failures: result.failures }));
      if (result.failures.length) {
        report.failedRuns++; report.findings += result.failures.length;
        report.replay.push({ seed, failures: result.failures, trace: result.trace });
        for (const failure of result.failures) {
          console.error(JSON.stringify({ type: "sun-stress-failure", ...failure, replay: `node scripts/sun-stress-run.mjs --seed ${seed} --runs 1 --max-steps ${options.maxSteps} --save-every ${options.saveEvery}` }));
          report.rules[failure.rule] = (report.rules[failure.rule] || 0) + 1;
          const signature = `${failure.rule}:${failure.scene}:${failure.key || failure.crew || ""}`;
          if (!signatures.has(signature)) {
            signatures.add(signature);
            report.examples.push({ ...failure, command: `node scripts/sun-stress-run.mjs --seed ${seed} --runs 1 --max-steps ${options.maxSteps} --save-every ${options.saveEvery}` });
          }
        }
      }
      // Bound memory in the existing VM's captured console between runs.
      runtime.logs.length = 0; saveRuntime.logs.length = 0;
    }
    report.trajectorySha256 = digest.digest("hex");
    report.seconds = Number(((performance.now() - started) / 1000).toFixed(3));
    if (output) { const path = resolve(output); mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, JSON.stringify(report, null, 2) + "\n"); }
    const { replay, scenes, ...summary } = report;
    console.log(JSON.stringify({ ...summary, scenesCovered: Object.keys(scenes).length, ...(output ? { report: output } : {}) }, null, 2));
    process.exitCode = report.findings ? 1 : 0;
  }
} catch (error) {
  console.error(`sun-stress harness error: ${error.stack || error.message}`);
  process.exitCode = 2;
}
