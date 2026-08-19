#!/usr/bin/env node

// PIPE-BOOT-R1 / GitHub issue #15.
//
// This is deliberately a recovery-only, fail-closed policy. It does not create
// tags, releases, deployments, artifacts, or publication credentials. A later
// governed ticket must replace this bounded policy before any other change may
// target the recovery branch.

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  appendFileSync,
  lstatSync,
  readFileSync,
  readdirSync
} from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const EXPECTED_REPOSITORY = "mbains89/Sunsplitter";
const RECOVERY_BRANCH = "recovery/e4f8440-nopub";
const PIPE_BOOT_HEAD = "ticket/0.30.1-pipe-boot-r1";
const RECOVERY_BASE_SHA = "e4f84409759760d31fcf47b8a227802a61421f51";
const DISPATCH_BASE_SHA = "d7728f7ea6f6ee3f4966d73dc6316c3c26491f6e";
const SIMULATION_BASELINE_PATH = "scripts/fixtures/pipe-boot-r1-simulation-baseline.json";

const GOV_01_SHA256 = "067832a3750f9909df7a4d8eff553d96dd450957c9235da8f37012607a7bb14e";
const RECOVERY_DEC_SHA256 = "48721ce3552cf44ff305747545eb908c0668cf04f84167d41eedefeb5f092efa";
const NETLIFY_NO_BUILD_SHA256 = "02779c797969c4af09d5f4fa900ef7464473b6d3e2337b3d47eedbc94ca6187d";
const SIMULATION_BASELINE_SHA256 = "bb1fb02cb7f85f0c0eddb3d9dbb0d3bb6c695d57156c2c051bf69f6f53f3b42b";
const WORKFLOW_SHA256 = Object.freeze({
  "release-policy.yml": "2d0c146aaae977c61cbfa7c96642f99759dfacefb142f053e6d1187c0395dd33",
  "verify.yml": "ab1a1f7d2783269b8ad76bd52ae13f1f25896ffb4e141defe66965cb491f8db2"
});

// Exact issue #15 boundary. Do not broaden this list to make a check green.
export const PIPE_BOOT_R1_CHANGED_PATHS = Object.freeze([
  ".github/workflows/release-policy.yml",
  ".github/workflows/verify.yml",
  "artifacts/PIPE-BOOT-R1_RECOVERY_PIPELINE_RECONCILIATION.md",
  "artifacts/PIPE-BOOT_RECOVERY_PIPELINE.md",
  "artifacts/PROJECT_STATUS.md",
  SIMULATION_BASELINE_PATH,
  "scripts/release-policy.mjs",
  "scripts/simulate.mjs",
  "scripts/verify.mjs"
]);

const ALLOWED_PATHS = new Set(PIPE_BOOT_R1_CHANGED_PATHS);
const ALLOWED_WORKFLOWS = Object.freeze([
  "release-policy.yml",
  "verify.yml"
]);
const CHECKOUT_ACTION = "actions/checkout@11d5960a326750d5838078e36cf38b85af677262";
const SETUP_NODE_ACTION = "actions/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020";
const ALLOWED_ACTIONS = new Set([CHECKOUT_ACTION, SETUP_NODE_ACTION]);
const FULL_SHA_RE = /^[0-9a-f]{40}$/;

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function git(args) {
  return execFileSync("git", args, {
    cwd: ROOT,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  }).trim();
}

function isAncestor(ancestor, descendant) {
  try {
    execFileSync("git", ["merge-base", "--is-ancestor", ancestor, descendant], {
      cwd: ROOT,
      stdio: "ignore"
    });
    return true;
  } catch {
    return false;
  }
}

function changedPathsForEvent(environment) {
  let range = null;
  if (environment.eventName === "pull_request") {
    if (FULL_SHA_RE.test(environment.prBaseSha) && FULL_SHA_RE.test(environment.prHeadSha)) {
      range = `${environment.prBaseSha}...${environment.prHeadSha}`;
    }
  } else if (environment.eventName === "push" && environment.refType !== "tag") {
    const before = /^0{40}$/.test(environment.beforeSha)
      ? DISPATCH_BASE_SHA
      : environment.beforeSha;
    if (FULL_SHA_RE.test(before) && FULL_SHA_RE.test(environment.afterSha)) {
      range = `${before}..${environment.afterSha}`;
    }
  }

  if (!range) return [];
  const output = git([
    "diff",
    "--name-only",
    "--no-renames",
    "--diff-filter=ACDMRTUXB",
    range
  ]);
  return output ? [...new Set(output.split(/\r?\n/).filter(Boolean))].sort() : [];
}

function readRepositoryFacts(environment) {
  const read = relativePath => readFileSync(resolve(ROOT, relativePath));
  const workflowDir = resolve(ROOT, ".github/workflows");
  const workflowNames = readdirSync(workflowDir).sort();
  const workflowTexts = {};
  for (const name of workflowNames) {
    if (!lstatSync(resolve(workflowDir, name)).isFile()) {
      throw new Error(`workflow entry is not a regular file: ${name}`);
    }
    workflowTexts[name] = readFileSync(resolve(workflowDir, name), "utf8");
  }

  const gov01 = read("artifacts/GOV-01_AUTHORITY_RECONCILIATION.md");
  const recoveryDec = read("artifacts/RECOVERY-DEC_AMENDMENT.md");
  const netlify = read("netlify.toml");
  const simulationBaseline = read(SIMULATION_BASELINE_PATH);
  const checkedOutSha = git(["rev-parse", "HEAD"]);

  return {
    ...environment,
    checkedOutSha,
    changedPaths: changedPathsForEvent(environment),
    recoveryBaseAncestor: isAncestor(RECOVERY_BASE_SHA, checkedOutSha),
    dispatchBaseAncestor: isAncestor(DISPATCH_BASE_SHA, checkedOutSha),
    prBaseAncestor: environment.eventName !== "pull_request"
      || isAncestor(environment.prBaseSha, checkedOutSha),
    prHeadAncestor: environment.eventName !== "pull_request"
      || isAncestor(environment.prHeadSha, checkedOutSha),
    statusText: read("artifacts/PROJECT_STATUS.md").toString("utf8"),
    gov01Hash: sha256(gov01),
    recoveryDecHash: sha256(recoveryDec),
    pipeBootText: read("artifacts/PIPE-BOOT_RECOVERY_PIPELINE.md").toString("utf8"),
    reconciliationText: read("artifacts/PIPE-BOOT-R1_RECOVERY_PIPELINE_RECONCILIATION.md").toString("utf8"),
    netlifyHash: sha256(netlify),
    simulationBaselineHash: sha256(simulationBaseline),
    workflowNames,
    workflowTexts,
    workflowHashes: Object.fromEntries(
      Object.entries(workflowTexts).map(([name, text]) => [name, sha256(text)])
    )
  };
}

function requirePattern(errors, text, pattern, label) {
  if (!pattern.test(text)) errors.push(`${label} is missing or changed`);
}

function requireUniqueStatusField(errors, text, key, predicate, label) {
  const values = [...text.matchAll(new RegExp("`" + key + ":\\s*([^`]+)`", "g"))]
    .map(match => match[1].trim());
  if (values.length !== 1) {
    errors.push(`${label} must appear exactly once; found ${values.length}`);
  } else if (!predicate(values[0])) {
    errors.push(`${label} is missing or changed`);
  }
}

function sameStringSet(left, right) {
  return left.length === right.length
    && [...left].sort().every((value, index) => value === [...right].sort()[index]);
}

function workflowSecurityErrors(workflowTexts) {
  const errors = [];
  const forbiddenTopLevelTriggers = [
    "create",
    "deployment",
    "deployment_status",
    "page_build",
    "public",
    "registry_package",
    "release",
    "repository_dispatch",
    "schedule",
    "workflow_call",
    "workflow_dispatch",
    "workflow_run"
  ];

  for (const [name, text] of Object.entries(workflowTexts || {})) {
    const onBlock = text.match(/^on:\s*\n((?:(?:[ \t]+[^\n]*)?\n)*)/m)?.[1] || "";
    const eventNames = [...onBlock.matchAll(/^  ([a-z_]+):/gm)].map(match => match[1]).sort();
    if (!sameStringSet(eventNames, ["pull_request", "push"])) {
      errors.push(`${name}: trigger set must be exactly pull_request + push; found ${eventNames.join(", ") || "<none>"}`);
    }
    for (const trigger of forbiddenTopLevelTriggers) {
      const pattern = new RegExp(`^  ${trigger}:`, "m");
      if (pattern.test(text)) errors.push(`${name}: publication-capable trigger ${trigger}`);
    }
    if (/^  pull_request_target:/m.test(text)) errors.push(`${name}: unsafe privileged trigger pull_request_target`);
    if (/^\s{4,}(?:tags|tags-ignore):/m.test(text)) errors.push(`${name}: tag trigger/filter is forbidden`);
    if (/^\s{4,}(?:paths|paths-ignore):/m.test(text)) errors.push(`${name}: path filters could suppress a required check`);
    if (/^\s*permissions:\s*(?:write-all|read-all)\s*(?:#.*)?$/m.test(text)) {
      errors.push(`${name}: permissions must be the explicit contents: read map`);
    }

    const permissionBlocks = [...text.matchAll(/^permissions:\s*\n((?:[ \t]+[^\n]*\n?)*)/gm)];
    if (permissionBlocks.length !== 1 || !/^  contents:\s*read\s*(?:#.*)?$/m.test(permissionBlocks[0]?.[1] || "")) {
      errors.push(`${name}: root permissions are not exactly contents: read`);
    }
    for (const match of text.matchAll(/^\s+([a-z-]+):\s*(read|write)\s*(?:#.*)?$/gm)) {
      if (match[1] !== "contents" || match[2] !== "read") {
        errors.push(`${name}: forbidden permission ${match[1]}: ${match[2]}`);
      }
    }

    const actions = [...text.matchAll(/^\s*-?\s*uses:\s*([^\s#]+).*$/gm)].map(match => match[1]);
    if (!actions.includes(CHECKOUT_ACTION)) errors.push(`${name}: immutable checkout action pin is missing`);
    if (!actions.includes(SETUP_NODE_ACTION)) errors.push(`${name}: immutable setup-node action pin is missing`);
    for (const action of actions) {
      if (!ALLOWED_ACTIONS.has(action)) errors.push(`${name}: unapproved action ${action}`);
      const pin = action.split("@")[1] || "";
      if (!FULL_SHA_RE.test(pin)) errors.push(`${name}: action is not pinned by full commit SHA: ${action}`);
    }

    if (!/^\s+persist-credentials:\s*false\s*(?:#.*)?$/m.test(text)) {
      errors.push(`${name}: checkout credentials are not explicitly disabled`);
    }
    if (!/^\s+fetch-depth:\s*0\s*(?:#.*)?$/m.test(text)) {
      errors.push(`${name}: full history is not explicitly fetched for provenance checks`);
    }
    if (/^\s+ref:/m.test(text)) errors.push(`${name}: checkout ref override would replace the exact event revision`);
    if (/^\s+environment:/m.test(text)) errors.push(`${name}: deployment environment use is forbidden`);
    if (/\$\{\{\s*secrets\./.test(text)) errors.push(`${name}: secret access is forbidden`);
    if (/^\s*continue-on-error:\s*true\s*(?:#.*)?$/m.test(text)) errors.push(`${name}: continue-on-error weakens a blocking check`);
    if (/\|\|\s*true\b/.test(text)) errors.push(`${name}: shell failure suppression is forbidden`);

    const publicationCommand = /\b(?:gh\s+release|git\s+(?:push|tag)|netlify\s+(?:build|deploy)|npm\s+publish|itch(?:\.io)?\s+upload|curl\b[^\n]*(?:--upload-file|-X\s*(?:POST|PUT|PATCH))|wget\b[^\n]*--post)\b/i;
    if (publicationCommand.test(text)) errors.push(`${name}: release/deploy/upload command is forbidden`);
  }
  return errors;
}

export function evaluatePolicy(facts) {
  const errors = [];
  const notices = [
    "Recovery required checks/ruleset: NOT CONFIGURED — repository code cannot prevent a direct/force push or require these checks; an admin ruleset must protect the branch with no bypass.",
    "Default-branch/main enforcement: NOT CONFIGURED — recovery-branch workflow files do not by themselves establish a trusted required check on main.",
    "Tag-prevention ruleset: NOT CONFIGURED — repository code cannot preempt tag creation; an admin tag ruleset must block tags while NO-PUBLISH is active.",
    "External publication controls: NOT CONFIGURED — Netlify Build Hooks and production-environment permissions are outside GitHub Actions; production remains NOT AUTHORIZED."
  ];

  if (facts.repository !== EXPECTED_REPOSITORY) {
    errors.push(`repository ${facts.repository || "<missing>"} != ${EXPECTED_REPOSITORY}`);
  }
  if (!FULL_SHA_RE.test(facts.sha || "")) errors.push("GITHUB_SHA is not a full SHA-1");
  if (facts.checkedOutSha !== facts.sha) {
    errors.push(`checked-out SHA ${facts.checkedOutSha || "<missing>"} != event SHA ${facts.sha || "<missing>"}`);
  }
  if (!facts.recoveryBaseAncestor) errors.push(`audited recovery base ${RECOVERY_BASE_SHA} is not an ancestor`);
  if (!facts.dispatchBaseAncestor) errors.push(`dispatch base ${DISPATCH_BASE_SHA} is not an ancestor`);

  if (facts.gov01Hash !== GOV_01_SHA256) errors.push("GOV-01 bytes differ from the dispatch base");
  if (facts.recoveryDecHash !== RECOVERY_DEC_SHA256) errors.push("RECOVERY-DEC bytes differ from the dispatch base");
  if (facts.netlifyHash !== NETLIFY_NO_BUILD_SHA256) errors.push("netlify.toml differs from the frozen no-Git-build baseline");
  if (facts.simulationBaselineHash !== SIMULATION_BASELINE_SHA256) {
    errors.push(`${SIMULATION_BASELINE_PATH}: bytes differ from the issue #15 pinned fixture`);
  }
  if (!sameStringSet(facts.workflowNames || [], ALLOWED_WORKFLOWS)) {
    errors.push(`workflow allowlist mismatch: ${(facts.workflowNames || []).join(", ") || "<none>"}`);
  }
  for (const [name, expectedHash] of Object.entries(WORKFLOW_SHA256)) {
    if (facts.workflowHashes?.[name] !== expectedHash) {
      errors.push(`${name}: bytes differ from the issue #15 reviewed workflow`);
    }
  }
  errors.push(...workflowSecurityErrors(facts.workflowTexts));

  const statusText = facts.statusText || "";
  requireUniqueStatusField(errors, statusText, "runtime_baseline_sha", value => value === RECOVERY_BASE_SHA, "STATUS runtime baseline");
  requireUniqueStatusField(errors, statusText, "release_state", value => value === "NO-PUBLISH", "STATUS NO-PUBLISH state");
  requireUniqueStatusField(errors, statusText, "production_url", value => value === "NOT_AUTHORIZED", "STATUS production block");
  requireUniqueStatusField(errors, statusText, "release_artifact", value => value.toLowerCase() === "none authorized from this base", "STATUS release-artifact block");
  requireUniqueStatusField(errors, statusText, "artifact_digest", value => /^none\s*[—-]\s*no release created$/i.test(value), "STATUS artifact block");
  requireUniqueStatusField(errors, statusText, "version_integrity", value => /^NOT_CERTIFIED\b/i.test(value), "STATUS certification block");

  requirePattern(errors, facts.pipeBootText || "", /# PIPE-BOOT\s*[—-]\s*Governed Recovery Pipeline/, "PIPE-BOOT identity");
  requirePattern(errors, facts.pipeBootText || "", /NO-PUBLISH/i, "PIPE-BOOT NO-PUBLISH guard");
  requirePattern(errors, facts.pipeBootText || "", new RegExp(RECOVERY_BRANCH.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), "PIPE-BOOT recovery branch");
  requirePattern(errors, facts.reconciliationText || "", /PIPE-BOOT-R1/i, "PIPE-BOOT-R1 reconciliation identity");
  requirePattern(errors, facts.reconciliationText || "", /NO-PUBLISH/i, "PIPE-BOOT-R1 NO-PUBLISH guard");
  requirePattern(errors, facts.reconciliationText || "", new RegExp(RECOVERY_BASE_SHA), "PIPE-BOOT-R1 recovery base");

  if (facts.eventName === "pull_request") {
    if (facts.baseRef === "main") errors.push("all pull requests to main are blocked while NO-PUBLISH is active");
    if (facts.baseRef !== RECOVERY_BRANCH) {
      errors.push(`pull-request base ${facts.baseRef || "<missing>"} != ${RECOVERY_BRANCH}`);
    }
    if (facts.headRef !== PIPE_BOOT_HEAD) {
      errors.push(`pull-request head ${facts.headRef || "<missing>"} != ${PIPE_BOOT_HEAD}`);
    }
    if (facts.prHeadRepository !== EXPECTED_REPOSITORY) {
      errors.push(`pull-request head repository ${facts.prHeadRepository || "<missing>"} != ${EXPECTED_REPOSITORY}`);
    }
    if (facts.prBaseSha !== DISPATCH_BASE_SHA) {
      errors.push(`pull-request base SHA ${facts.prBaseSha || "<missing>"} != dispatch base ${DISPATCH_BASE_SHA}`);
    }
    if (!FULL_SHA_RE.test(facts.prHeadSha || "")) errors.push("pull-request head SHA is not a full SHA-1");
    if (!facts.prBaseAncestor) errors.push("pull-request base SHA is not an ancestor of the tested merge SHA");
    if (!facts.prHeadAncestor) errors.push("pull-request head SHA is not an ancestor of the tested merge SHA");
  } else if (facts.eventName === "push") {
    if (facts.refType === "tag" || String(facts.ref || "").startsWith("refs/tags/")) {
      errors.push("tag creation is forbidden while NO-PUBLISH is active");
    } else if (facts.refName === "main") {
      errors.push("all pushes to main are forbidden while NO-PUBLISH is active");
    } else if (facts.refName !== RECOVERY_BRANCH) {
      errors.push(`push ref ${facts.refName || "<missing>"} != ${RECOVERY_BRANCH}`);
    } else {
      const normalizedBefore = /^0{40}$/.test(facts.beforeSha || "")
        ? DISPATCH_BASE_SHA
        : facts.beforeSha;
      if (normalizedBefore !== DISPATCH_BASE_SHA) {
        errors.push(`push before SHA ${normalizedBefore || "<missing>"} != dispatch base ${DISPATCH_BASE_SHA}`);
      }
      if (facts.afterSha !== facts.sha) {
        errors.push(`push after SHA ${facts.afterSha || "<missing>"} != event SHA ${facts.sha || "<missing>"}`);
      }
    }
  } else {
    errors.push(`unsupported event ${facts.eventName || "<missing>"}`);
  }

  if (!(facts.eventName === "push" && (facts.refType === "tag" || facts.refName === "main"))) {
    if (!(facts.changedPaths || []).length) errors.push("changed-path set is empty or unavailable");
    for (const path of facts.changedPaths || []) {
      if (!ALLOWED_PATHS.has(path)) errors.push(`changed path is outside issue #15: ${path}`);
    }
  }

  return { passed: errors.length === 0, errors, notices };
}

function baseSelfTestFacts() {
  const sha = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
  return {
    eventName: "pull_request",
    repository: EXPECTED_REPOSITORY,
    sha,
    checkedOutSha: sha,
    ref: "refs/pull/15/merge",
    refName: "15/merge",
    refType: "branch",
    baseRef: RECOVERY_BRANCH,
    headRef: PIPE_BOOT_HEAD,
    prHeadRepository: EXPECTED_REPOSITORY,
    prBaseSha: DISPATCH_BASE_SHA,
    prHeadSha: "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
    beforeSha: "",
    afterSha: "",
    changedPaths: [...PIPE_BOOT_R1_CHANGED_PATHS],
    recoveryBaseAncestor: true,
    dispatchBaseAncestor: true,
    prBaseAncestor: true,
    prHeadAncestor: true,
    statusText: [
      `\`runtime_baseline_sha: ${RECOVERY_BASE_SHA}\``,
      "`release_state: NO-PUBLISH`",
      "`production_url: NOT_AUTHORIZED`",
      "`release_artifact: none authorized from this base`",
      "`artifact_digest: none — no release created`",
      "`version_integrity: NOT_CERTIFIED — recovery`"
    ].join("\n"),
    gov01Hash: GOV_01_SHA256,
    recoveryDecHash: RECOVERY_DEC_SHA256,
    pipeBootText: `# PIPE-BOOT — Governed Recovery Pipeline\n${RECOVERY_BRANCH}\nNO-PUBLISH`,
    reconciliationText: `# PIPE-BOOT-R1\n${RECOVERY_BASE_SHA}\nNO-PUBLISH`,
    netlifyHash: NETLIFY_NO_BUILD_SHA256,
    simulationBaselineHash: SIMULATION_BASELINE_SHA256,
    workflowNames: [...ALLOWED_WORKFLOWS],
    workflowTexts: Object.fromEntries(ALLOWED_WORKFLOWS.map(name => [name, [
      "name: fixture",
      "",
      "on:",
      "  pull_request:",
      `    branches: [${RECOVERY_BRANCH}]`,
      "  push:",
      `    branches: [${RECOVERY_BRANCH}]`,
      "",
      "permissions:",
      "  contents: read",
      "",
      "jobs:",
      "  fixture:",
      "    runs-on: ubuntu-24.04",
      "    steps:",
      `      - uses: ${CHECKOUT_ACTION}`,
      "        with:",
      "          fetch-depth: 0",
      "          persist-credentials: false",
      `      - uses: ${SETUP_NODE_ACTION}`
    ].join("\n")])),
    workflowHashes: { ...WORKFLOW_SHA256 }
  };
}

function expectFailure(base, mutate, needle) {
  const facts = structuredClone(base);
  mutate(facts);
  const result = evaluatePolicy(facts);
  assert.equal(result.passed, false, `expected failure containing ${needle}`);
  assert.ok(result.errors.some(error => error.includes(needle)), `missing failure ${needle}: ${result.errors.join(" | ")}`);
}

function selfTest() {
  assert.deepEqual(
    [...PIPE_BOOT_R1_CHANGED_PATHS].sort(),
    [
      ".github/workflows/release-policy.yml",
      ".github/workflows/verify.yml",
      "artifacts/PIPE-BOOT-R1_RECOVERY_PIPELINE_RECONCILIATION.md",
      "artifacts/PIPE-BOOT_RECOVERY_PIPELINE.md",
      "artifacts/PROJECT_STATUS.md",
      "scripts/fixtures/pipe-boot-r1-simulation-baseline.json",
      "scripts/release-policy.mjs",
      "scripts/simulate.mjs",
      "scripts/verify.mjs"
    ].sort()
  );

  const positive = baseSelfTestFacts();
  assert.deepEqual(evaluatePolicy(positive).errors, []);

  expectFailure(positive, facts => { facts.repository = "other/repository"; }, "repository other/repository");
  expectFailure(positive, facts => { facts.checkedOutSha = "c".repeat(40); }, "checked-out SHA");
  expectFailure(positive, facts => { facts.recoveryBaseAncestor = false; }, "audited recovery base");
  expectFailure(positive, facts => { facts.baseRef = "main"; }, "pull requests to main");
  expectFailure(positive, facts => { facts.headRef = "ticket/0.30.1-01-quiet-tomas-rewind"; }, "pull-request head");
  expectFailure(positive, facts => { facts.prHeadRepository = "fork/Sunsplitter"; }, "pull-request head repository");
  expectFailure(positive, facts => { facts.prBaseSha = "c".repeat(40); }, "pull-request base SHA");
  expectFailure(positive, facts => { facts.changedPaths.push("src/scenes-41.js"); }, "outside issue #15");
  expectFailure(positive, facts => { facts.statusText = facts.statusText.replace("NO-PUBLISH", "RELEASED"); }, "STATUS NO-PUBLISH");
  expectFailure(positive, facts => {
    facts.statusText += "\n`release_state: PUBLISH`\n`version_integrity: CERTIFIED`";
  }, "STATUS NO-PUBLISH state must appear exactly once");
  expectFailure(positive, facts => { facts.workflowNames.push("deploy.yml"); }, "workflow allowlist");
  expectFailure(positive, facts => {
    facts.workflowTexts["verify.yml"] += "\n  release:\n    types: [published]\n";
  }, "publication-capable trigger release");
  expectFailure(positive, facts => {
    facts.workflowTexts["verify.yml"] = facts.workflowTexts["verify.yml"].replace("contents: read", "contents: write");
  }, "forbidden permission contents: write");
  expectFailure(positive, facts => {
    facts.workflowTexts["verify.yml"] += "\n      - uses: actions/upload-artifact@aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\n";
  }, "unapproved action actions/upload-artifact");
  expectFailure(positive, facts => {
    facts.workflowTexts["verify.yml"] += "\n      - run: gh release create sun-v0.30.1\n";
  }, "release/deploy/upload command");
  expectFailure(positive, facts => {
    facts.workflowTexts["verify.yml"] += "\n    tags: ['**']\n";
  }, "tag trigger/filter");
  expectFailure(positive, facts => {
    facts.workflowHashes["verify.yml"] = "c".repeat(64);
  }, "bytes differ from the issue #15 reviewed workflow");
  expectFailure(positive, facts => { facts.netlifyHash = "c".repeat(64); }, "netlify.toml");
  const baselineBytes = readFileSync(resolve(ROOT, SIMULATION_BASELINE_PATH));
  assert.equal(sha256(baselineBytes), SIMULATION_BASELINE_SHA256, "checked-in simulation baseline does not match its pinned SHA-256");
  const inflatedBaselineBytes = Buffer.from(
    baselineBytes.toString("utf8").replace('"V1": 255', '"V1": 256'),
    "utf8"
  );
  assert.notDeepEqual(inflatedBaselineBytes, baselineBytes, "baseline inflation fixture did not alter bytes");
  expectFailure(positive, facts => {
    facts.simulationBaselineHash = sha256(inflatedBaselineBytes);
  }, "simulation-baseline.json: bytes differ");

  const push = structuredClone(positive);
  Object.assign(push, {
    eventName: "push",
    ref: `refs/heads/${RECOVERY_BRANCH}`,
    refName: RECOVERY_BRANCH,
    baseRef: "",
    headRef: "",
    prBaseSha: "",
    prHeadSha: "",
    beforeSha: DISPATCH_BASE_SHA,
    afterSha: push.sha,
    prBaseAncestor: true,
    prHeadAncestor: true
  });
  assert.deepEqual(evaluatePolicy(push).errors, []);

  expectFailure(push, facts => {
    facts.ref = "refs/tags/sun-v0.30.1";
    facts.refName = "sun-v0.30.1";
    facts.refType = "tag";
  }, "tag creation");
  expectFailure(push, facts => { facts.beforeSha = "c".repeat(40); }, "push before SHA");

  console.log("PASS release-policy self-test (issue #15 allowlist + 23 policy cases)");
}

function environmentFromProcess() {
  return {
    eventName: process.env.POLICY_EVENT_NAME || "",
    repository: process.env.POLICY_REPOSITORY || "",
    sha: process.env.POLICY_SHA || "",
    ref: process.env.POLICY_REF || "",
    refName: process.env.POLICY_REF_NAME || "",
    refType: process.env.POLICY_REF_TYPE || "",
    baseRef: process.env.POLICY_BASE_REF || "",
    headRef: process.env.POLICY_HEAD_REF || "",
    prHeadRepository: process.env.POLICY_PR_HEAD_REPOSITORY || "",
    prBaseSha: process.env.POLICY_PR_BASE_SHA || "",
    prHeadSha: process.env.POLICY_PR_HEAD_SHA || "",
    beforeSha: process.env.POLICY_BEFORE_SHA || "",
    afterSha: process.env.POLICY_AFTER_SHA || ""
  };
}

function writeSummary(facts, result) {
  const source = (facts.sha || "unknown").slice(0, 7);
  const lines = [
    "## PIPE-BOOT-R1 release policy",
    "",
    `- Exact tested SHA: \`${facts.sha || "missing"}\``,
    `- PR head SHA: \`${facts.prHeadSha || "n/a"}\``,
    `- PR base SHA: \`${facts.prBaseSha || facts.beforeSha || "n/a"}\``,
    `- Result: **${result.passed ? "PASS" : "FAIL"}**`,
    `- Source declaration: \`SOURCE ${source} · RUNTIME ${source} · TASK PIPE-BOOT-R1/#15 · MODE verification\``,
    "",
    "### Platform controls still requiring repository administration",
    "",
    ...result.notices.map(notice => `- ${notice}`)
  ];
  if (result.errors.length) lines.push("", "### Failures", "", ...result.errors.map(error => `- ${error}`));
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${lines.join("\n")}\n`);
}

function main() {
  if (process.argv.length === 3 && process.argv[2] === "--self-test") {
    selfTest();
    return;
  }
  if (process.argv.length !== 2) {
    throw new Error("Usage: node scripts/release-policy.mjs [--self-test]");
  }

  const environment = environmentFromProcess();
  const facts = readRepositoryFacts(environment);
  const result = evaluatePolicy(facts);
  const shortSha = facts.sha.slice(0, 7);
  console.log(`SOURCE ${shortSha} · RUNTIME ${shortSha} · TASK PIPE-BOOT-R1/#15 · MODE verification`);
  console.log(`exact tested SHA: ${facts.sha}`);
  if (facts.prHeadSha) console.log(`pull-request head SHA: ${facts.prHeadSha}`);
  if (facts.prBaseSha) console.log(`pull-request base SHA: ${facts.prBaseSha}`);
  console.log(`changed paths (${facts.changedPaths.length}): ${facts.changedPaths.join(", ")}`);
  result.notices.forEach(notice => console.log(`NOTICE ${notice}`));
  writeSummary(facts, result);

  if (!result.passed) {
    result.errors.forEach(error => console.error(`FAIL ${error}`));
    process.exitCode = 1;
  } else {
    console.log("PASS PIPE-BOOT-R1 release policy; NO-PUBLISH remains active");
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    main();
  } catch (error) {
    console.error(`FAIL release-policy crash: ${error.stack || error.message}`);
    process.exitCode = 1;
  }
}
