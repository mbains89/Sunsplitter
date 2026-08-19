#!/usr/bin/env node

// PIPE-BOOT-R1 / GitHub issue #15, amended by RECOVERY-POLICY-R1.
//
// This remains a recovery-only, fail-closed policy. It does not create tags,
// releases, deployments, artifacts, or publication credentials. The amendment
// adds one exact self-update route and one exact ROADMAP-L014 documentation
// route without authorizing runtime, release, deployment, or publication work.

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
const PIPE_BOOT_CLOSEOUT_HEAD = "ticket/0.30.1-pipe-boot-r1-status-closeout";
const RECOVERY_POLICY_HEAD = "ticket/recovery-governance-policy-r1";
const RECOVERY_POLICY_PR_REF = "refs/pull/20/merge";
const ROADMAP_L014_HEAD = "agent/roadmap-0.30.1-ai-hardening-recovery";
const ROADMAP_L014_PR_REF = "refs/pull/17/merge";
const ROADMAP_L014_AUTHORIZED_HEAD = "2f0b9a52059967d29846adf73b8fe48d19b604b8";
const RECOVERY_POLICY_BASE_SHA = "78a64c7a180a34e786da3eefac42a06f50703bab";
const RECOVERY_BASE_SHA = "e4f84409759760d31fcf47b8a227802a61421f51";
const DISPATCH_BASE_SHA = "d7728f7ea6f6ee3f4966d73dc6316c3c26491f6e";
const PIPE_BOOT_MERGE_SHA = "0b600935aa6e21d4898bcc9c7ad09e78893ec6e7";
const SIMULATION_BASELINE_PATH = "scripts/fixtures/pipe-boot-r1-simulation-baseline.json";

const GOV_01_SHA256 = "067832a3750f9909df7a4d8eff553d96dd450957c9235da8f37012607a7bb14e";
const RECOVERY_DEC_SHA256 = "48721ce3552cf44ff305747545eb908c0668cf04f84167d41eedefeb5f092efa";
const NETLIFY_NO_BUILD_SHA256 = "02779c797969c4af09d5f4fa900ef7464473b6d3e2337b3d47eedbc94ca6187d";
const SIMULATION_BASELINE_SHA256 = "bb1fb02cb7f85f0c0eddb3d9dbb0d3bb6c695d57156c2c051bf69f6f53f3b42b";
const ROADMAP_L014_ROADMAP_SHA256 = "63a092a043f1bda60c2294203e25f96ab6d127c346b7d4dae7ed1ab399608a24";
const ROADMAP_L014_LOCKS_SHA256 = "d9f8d9c879395c9c9f20adcb5ed7f4e745704976e95585e0ec89c0c9e7f0851e";
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

export const PIPE_BOOT_R1_CLOSEOUT_CHANGED_PATHS = Object.freeze([
  "artifacts/PROJECT_STATUS.md",
  "scripts/release-policy.mjs"
]);

export const RECOVERY_POLICY_R1_CHANGED_PATHS = Object.freeze([
  "scripts/release-policy.mjs"
]);

export const ROADMAP_L014_CHANGED_PATHS = Object.freeze([
  "artifacts/LOCKS.md",
  "artifacts/ROADMAP.md"
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

function fileHashAt(revision, relativePath) {
  if (!FULL_SHA_RE.test(revision || "")) return null;
  try {
    const bytes = execFileSync("git", ["show", `${revision}:${relativePath}`], {
      cwd: ROOT,
      stdio: ["ignore", "pipe", "pipe"]
    });
    return sha256(bytes);
  } catch {
    return null;
  }
}

function changedPathsBetween(base, head, mergeBase = false) {
  if (!FULL_SHA_RE.test(base || "") || !FULL_SHA_RE.test(head || "")) return null;
  try {
    const output = git([
      "diff",
      "--name-only",
      "--no-renames",
      "--diff-filter=ACDMRTUXB",
      `${base}${mergeBase ? "..." : ".."}${head}`
    ]);
    return output ? [...new Set(output.split(/\r?\n/).filter(Boolean))].sort() : [];
  } catch {
    return null;
  }
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
  if (environment.eventName === "pull_request") {
    return changedPathsBetween(environment.prBaseSha, environment.prHeadSha, true) || [];
  } else if (environment.eventName === "push" && environment.refType !== "tag") {
    const before = /^0{40}$/.test(environment.beforeSha)
      ? DISPATCH_BASE_SHA
      : environment.beforeSha;
    return changedPathsBetween(before, environment.afterSha) || [];
  }
  return [];
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
  const roadmap = read("artifacts/ROADMAP.md");
  const locks = read("artifacts/LOCKS.md");
  const policy = read("scripts/release-policy.mjs");
  const checkedOutSha = git(["rev-parse", "HEAD"]);
  const parentShas = git(["show", "-s", "--format=%P", checkedOutSha])
    .split(/\s+/)
    .filter(Boolean);
  const normalizedBefore = /^0{40}$/.test(environment.beforeSha || "")
    ? DISPATCH_BASE_SHA
    : environment.beforeSha;
  const routeHeadSha = environment.eventName === "pull_request"
    ? environment.prHeadSha
    : parentShas[1];
  const policyBaseSha = environment.eventName === "pull_request"
    ? environment.prBaseSha
    : normalizedBefore;

  return {
    ...environment,
    checkedOutSha,
    parentShas,
    changedPaths: changedPathsForEvent(environment),
    secondParentChangedPaths: parentShas[1]
      ? changedPathsBetween(normalizedBefore, parentShas[1])
      : null,
    recoveryBaseAncestor: isAncestor(RECOVERY_BASE_SHA, checkedOutSha),
    dispatchBaseAncestor: isAncestor(DISPATCH_BASE_SHA, checkedOutSha),
    prBaseAncestor: environment.eventName !== "pull_request"
      || isAncestor(environment.prBaseSha, checkedOutSha),
    prHeadAncestor: environment.eventName !== "pull_request"
      || isAncestor(environment.prHeadSha, checkedOutSha),
    roadmapAuthorizedHeadAncestor: isAncestor(ROADMAP_L014_AUTHORIZED_HEAD, routeHeadSha),
    statusText: read("artifacts/PROJECT_STATUS.md").toString("utf8"),
    gov01Hash: sha256(gov01),
    recoveryDecHash: sha256(recoveryDec),
    pipeBootText: read("artifacts/PIPE-BOOT_RECOVERY_PIPELINE.md").toString("utf8"),
    reconciliationText: read("artifacts/PIPE-BOOT-R1_RECOVERY_PIPELINE_RECONCILIATION.md").toString("utf8"),
    netlifyHash: sha256(netlify),
    simulationBaselineHash: sha256(simulationBaseline),
    roadmapHash: sha256(roadmap),
    locksHash: sha256(locks),
    policyHash: sha256(policy),
    basePolicyHash: fileHashAt(policyBaseSha, "scripts/release-policy.mjs"),
    secondParentPolicyHash: fileHashAt(parentShas[1], "scripts/release-policy.mjs"),
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
    "External administrative state is not verified by this workflow — final adjudication must independently confirm GitHub rulesets 21051662 and 21051665 and the recorded Netlify controls.",
    "Policy-level NO-PUBLISH and NOT_CERTIFIED remain active regardless of external administrative-control state."
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

  let changeRoute = null;
  if (facts.eventName === "pull_request") {
    if (facts.baseRef === "main") errors.push("all pull requests to main are blocked while NO-PUBLISH is active");
    if (facts.baseRef !== RECOVERY_BRANCH) {
      errors.push(`pull-request base ${facts.baseRef || "<missing>"} != ${RECOVERY_BRANCH}`);
    }
    if (facts.headRef === PIPE_BOOT_HEAD) {
      changeRoute = "pipe-boot";
      if (facts.prBaseSha !== DISPATCH_BASE_SHA) {
        errors.push(`pull-request base SHA ${facts.prBaseSha || "<missing>"} != dispatch base ${DISPATCH_BASE_SHA}`);
      }
    } else if (facts.headRef === PIPE_BOOT_CLOSEOUT_HEAD) {
      changeRoute = "closeout";
      if (facts.prBaseSha !== PIPE_BOOT_MERGE_SHA) {
        errors.push(`pull-request base SHA ${facts.prBaseSha || "<missing>"} != PIPE-BOOT merge ${PIPE_BOOT_MERGE_SHA}`);
      }
    } else if (facts.headRef === RECOVERY_POLICY_HEAD) {
      changeRoute = "policy-amendment";
      if (facts.ref !== RECOVERY_POLICY_PR_REF || facts.refName !== "20/merge") {
        errors.push(`recovery-policy amendment must run only as ${RECOVERY_POLICY_PR_REF}`);
      }
      if (facts.prBaseSha !== RECOVERY_POLICY_BASE_SHA) {
        errors.push(`pull-request base SHA ${facts.prBaseSha || "<missing>"} != recovery-policy base ${RECOVERY_POLICY_BASE_SHA}`);
      }
      const parents = facts.parentShas || [];
      if (parents.length !== 2 || parents[0] !== facts.prBaseSha || parents[1] !== facts.prHeadSha) {
        errors.push("recovery-policy amendment PR must test the exact GitHub merge of its recorded base and head");
      }
    } else if (facts.headRef === ROADMAP_L014_HEAD) {
      changeRoute = "roadmap-l014";
      if (facts.ref !== ROADMAP_L014_PR_REF || facts.refName !== "17/merge") {
        errors.push(`ROADMAP-L014 must run only as ${ROADMAP_L014_PR_REF}`);
      }
      if (!facts.roadmapAuthorizedHeadAncestor) {
        errors.push(`ROADMAP-L014 head must descend from authorized proposal ${ROADMAP_L014_AUTHORIZED_HEAD}`);
      }
      if (!facts.basePolicyHash || facts.basePolicyHash !== facts.policyHash) {
        errors.push("ROADMAP-L014 base policy bytes do not match the executing recovery policy");
      }
      if (facts.roadmapHash !== ROADMAP_L014_ROADMAP_SHA256) {
        errors.push("ROADMAP-L014 ROADMAP bytes do not match the approved proposal");
      }
      if (facts.locksHash !== ROADMAP_L014_LOCKS_SHA256) {
        errors.push("ROADMAP-L014 LOCKS bytes do not match the approved proposal");
      }
      const parents = facts.parentShas || [];
      if (parents.length !== 2 || parents[0] !== facts.prBaseSha || parents[1] !== facts.prHeadSha) {
        errors.push("ROADMAP-L014 PR must test the exact GitHub merge of its recorded base and head");
      }
    } else {
      errors.push(`pull-request head ${facts.headRef || "<missing>"} is not an authorized recovery-policy route`);
    }
    if (facts.prHeadRepository !== EXPECTED_REPOSITORY) {
      errors.push(`pull-request head repository ${facts.prHeadRepository || "<missing>"} != ${EXPECTED_REPOSITORY}`);
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
      if (normalizedBefore === DISPATCH_BASE_SHA) {
        changeRoute = "pipe-boot";
      } else if (normalizedBefore === PIPE_BOOT_MERGE_SHA) {
        changeRoute = "closeout";
      } else if (normalizedBefore === RECOVERY_POLICY_BASE_SHA) {
        changeRoute = "policy-amendment";
      } else if (
        sameStringSet(facts.changedPaths || [], ROADMAP_L014_CHANGED_PATHS)
        && facts.roadmapHash === ROADMAP_L014_ROADMAP_SHA256
        && facts.locksHash === ROADMAP_L014_LOCKS_SHA256
        && (facts.parentShas || []).length === 2
        && facts.parentShas[0] === facts.beforeSha
        && facts.roadmapAuthorizedHeadAncestor
        && facts.basePolicyHash
        && facts.basePolicyHash === facts.policyHash
        && sameStringSet(facts.secondParentChangedPaths || [], ROADMAP_L014_CHANGED_PATHS)
      ) {
        changeRoute = "roadmap-l014";
      } else {
        errors.push(`push before SHA ${normalizedBefore || "<missing>"} is not an authorized recovery-policy base`);
      }
      if (facts.afterSha !== facts.sha) {
        errors.push(`push after SHA ${facts.afterSha || "<missing>"} != event SHA ${facts.sha || "<missing>"}`);
      }
    }
  } else {
    errors.push(`unsupported event ${facts.eventName || "<missing>"}`);
  }

  if (!(facts.eventName === "push" && (facts.refType === "tag" || facts.refName === "main"))) {
    const changedPaths = facts.changedPaths || [];
    if (!changedPaths.length) errors.push("changed-path set is empty or unavailable");
    if (changeRoute === "pipe-boot") {
      for (const path of changedPaths) {
        if (!ALLOWED_PATHS.has(path)) errors.push(`changed path is outside issue #15: ${path}`);
      }
    } else if (changeRoute === "closeout" && !sameStringSet(changedPaths, PIPE_BOOT_R1_CLOSEOUT_CHANGED_PATHS)) {
      errors.push(`changed paths do not exactly match the one-shot close-out set: ${changedPaths.join(", ") || "<none>"}`);
    } else if (changeRoute === "policy-amendment" && !sameStringSet(changedPaths, RECOVERY_POLICY_R1_CHANGED_PATHS)) {
      errors.push(`changed paths do not exactly match the recovery-policy amendment set: ${changedPaths.join(", ") || "<none>"}`);
    } else if (changeRoute === "roadmap-l014" && !sameStringSet(changedPaths, ROADMAP_L014_CHANGED_PATHS)) {
      errors.push(`changed paths do not exactly match the ROADMAP-L014 governance set: ${changedPaths.join(", ") || "<none>"}`);
    }
    if (facts.eventName === "push" && changeRoute === "policy-amendment") {
      const parents = facts.parentShas || [];
      if (parents.length !== 2 || parents[0] !== facts.beforeSha) {
        errors.push("policy-amendment push must be a merge commit whose first parent is the recorded before SHA");
      }
      if (!sameStringSet(facts.secondParentChangedPaths || [], RECOVERY_POLICY_R1_CHANGED_PATHS)) {
        errors.push("policy-amendment second parent does not have the exact authorized net diff");
      }
      if (!facts.secondParentPolicyHash || facts.secondParentPolicyHash !== facts.policyHash) {
        errors.push("policy-amendment second-parent policy bytes do not match the checked-out policy");
      }
    } else if (facts.eventName === "push" && changeRoute === "roadmap-l014") {
      const parents = facts.parentShas || [];
      if (parents.length !== 2 || parents[0] !== facts.beforeSha) {
        errors.push("ROADMAP-L014 push must be a merge commit whose first parent is the recorded before SHA");
      }
      if (!facts.roadmapAuthorizedHeadAncestor) {
        errors.push(`ROADMAP-L014 merge parent must descend from authorized proposal ${ROADMAP_L014_AUTHORIZED_HEAD}`);
      }
      if (!facts.basePolicyHash || facts.basePolicyHash !== facts.policyHash) {
        errors.push("ROADMAP-L014 pre-merge policy bytes do not match the checked-out policy");
      }
      if (facts.roadmapHash !== ROADMAP_L014_ROADMAP_SHA256 || facts.locksHash !== ROADMAP_L014_LOCKS_SHA256) {
        errors.push("ROADMAP-L014 merged authority bytes do not match the approved proposal");
      }
      if (!sameStringSet(facts.secondParentChangedPaths || [], ROADMAP_L014_CHANGED_PATHS)) {
        errors.push("ROADMAP-L014 second parent does not have the exact authorized net diff");
      }
    }
  }

  return { passed: errors.length === 0, errors, notices };
}

function baseSelfTestFacts() {
  const sha = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
  const prHeadSha = "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
  const policyHash = "1".repeat(64);
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
    prHeadSha,
    beforeSha: "",
    afterSha: "",
    parentShas: [DISPATCH_BASE_SHA, prHeadSha],
    changedPaths: [...PIPE_BOOT_R1_CHANGED_PATHS],
    secondParentChangedPaths: [...PIPE_BOOT_R1_CHANGED_PATHS],
    recoveryBaseAncestor: true,
    dispatchBaseAncestor: true,
    prBaseAncestor: true,
    prHeadAncestor: true,
    roadmapAuthorizedHeadAncestor: false,
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
    roadmapHash: "2".repeat(64),
    locksHash: "3".repeat(64),
    policyHash,
    basePolicyHash: policyHash,
    secondParentPolicyHash: policyHash,
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

function expectAnyFailure(base, mutate, label) {
  const facts = structuredClone(base);
  mutate(facts);
  const result = evaluatePolicy(facts);
  assert.equal(result.passed, false, `expected fail-closed rejection: ${label}`);
  assert.ok(result.errors.length > 0, `missing failure details: ${label}`);
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

  const closeout = structuredClone(positive);
  Object.assign(closeout, {
    headRef: PIPE_BOOT_CLOSEOUT_HEAD,
    prBaseSha: PIPE_BOOT_MERGE_SHA,
    changedPaths: [...PIPE_BOOT_R1_CLOSEOUT_CHANGED_PATHS]
  });
  assert.deepEqual(evaluatePolicy(closeout).errors, []);
  expectFailure(closeout, facts => { facts.prBaseSha = DISPATCH_BASE_SHA; }, "pull-request base SHA");
  expectFailure(closeout, facts => { facts.changedPaths.push("artifacts/PIPE-BOOT_RECOVERY_PIPELINE.md"); }, "one-shot close-out set");
  expectFailure(closeout, facts => { facts.changedPaths.pop(); }, "one-shot close-out set");

  const policyAmendment = structuredClone(positive);
  Object.assign(policyAmendment, {
    ref: RECOVERY_POLICY_PR_REF,
    refName: "20/merge",
    headRef: RECOVERY_POLICY_HEAD,
    prBaseSha: RECOVERY_POLICY_BASE_SHA,
    parentShas: [RECOVERY_POLICY_BASE_SHA, positive.prHeadSha],
    changedPaths: [...RECOVERY_POLICY_R1_CHANGED_PATHS]
  });
  assert.deepEqual(evaluatePolicy(policyAmendment).errors, []);
  expectFailure(policyAmendment, facts => { facts.ref = "refs/pull/999/merge"; }, "must run only");
  expectFailure(policyAmendment, facts => { facts.prBaseSha = DISPATCH_BASE_SHA; }, "recovery-policy base");
  expectFailure(policyAmendment, facts => { facts.parentShas[1] = "c".repeat(40); }, "exact GitHub merge");
  expectFailure(policyAmendment, facts => { facts.changedPaths.push("artifacts/ROADMAP.md"); }, "recovery-policy amendment set");

  const roadmapL014 = structuredClone(positive);
  Object.assign(roadmapL014, {
    ref: ROADMAP_L014_PR_REF,
    refName: "17/merge",
    headRef: ROADMAP_L014_HEAD,
    prBaseSha: RECOVERY_POLICY_BASE_SHA,
    prHeadSha: "c".repeat(40),
    parentShas: [RECOVERY_POLICY_BASE_SHA, "c".repeat(40)],
    changedPaths: [...ROADMAP_L014_CHANGED_PATHS],
    roadmapAuthorizedHeadAncestor: true,
    roadmapHash: ROADMAP_L014_ROADMAP_SHA256,
    locksHash: ROADMAP_L014_LOCKS_SHA256,
    basePolicyHash: positive.policyHash
  });
  assert.deepEqual(evaluatePolicy(roadmapL014).errors, []);
  expectFailure(roadmapL014, facts => { facts.ref = "refs/pull/999/merge"; }, "must run only");
  expectFailure(roadmapL014, facts => { facts.prHeadRepository = "fork/Sunsplitter"; }, "pull-request head repository");
  expectFailure(roadmapL014, facts => { facts.roadmapAuthorizedHeadAncestor = false; }, "must descend");
  expectFailure(roadmapL014, facts => { facts.basePolicyHash = "4".repeat(64); }, "base policy bytes");
  expectFailure(roadmapL014, facts => { facts.roadmapHash = "4".repeat(64); }, "ROADMAP bytes");
  expectFailure(roadmapL014, facts => { facts.roadmapHash = null; }, "ROADMAP bytes");
  expectFailure(roadmapL014, facts => { facts.locksHash = "4".repeat(64); }, "LOCKS bytes");
  expectFailure(roadmapL014, facts => { facts.locksHash = null; }, "LOCKS bytes");
  expectFailure(roadmapL014, facts => { facts.parentShas[1] = "d".repeat(40); }, "exact GitHub merge");
  expectFailure(roadmapL014, facts => { facts.changedPaths.pop(); }, "ROADMAP-L014 governance set");
  expectFailure(roadmapL014, facts => { facts.changedPaths.push("src/scenes-41.js"); }, "ROADMAP-L014 governance set");
  expectFailure(roadmapL014, facts => { facts.headRef = "agent/roadmap-other"; }, "authorized recovery-policy route");

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

  const closeoutPush = structuredClone(push);
  Object.assign(closeoutPush, {
    beforeSha: PIPE_BOOT_MERGE_SHA,
    changedPaths: [...PIPE_BOOT_R1_CLOSEOUT_CHANGED_PATHS]
  });
  assert.deepEqual(evaluatePolicy(closeoutPush).errors, []);
  expectFailure(closeoutPush, facts => { facts.changedPaths.push("README.md"); }, "one-shot close-out set");

  const policyAmendmentPush = structuredClone(push);
  Object.assign(policyAmendmentPush, {
    beforeSha: RECOVERY_POLICY_BASE_SHA,
    changedPaths: [...RECOVERY_POLICY_R1_CHANGED_PATHS],
    parentShas: [RECOVERY_POLICY_BASE_SHA, "d".repeat(40)],
    secondParentChangedPaths: [...RECOVERY_POLICY_R1_CHANGED_PATHS],
    secondParentPolicyHash: push.policyHash
  });
  assert.deepEqual(evaluatePolicy(policyAmendmentPush).errors, []);
  expectFailure(policyAmendmentPush, facts => { facts.parentShas = [RECOVERY_POLICY_BASE_SHA]; }, "must be a merge commit");
  expectFailure(policyAmendmentPush, facts => { facts.secondParentChangedPaths.push("README.md"); }, "exact authorized net diff");
  expectFailure(policyAmendmentPush, facts => { facts.secondParentPolicyHash = "4".repeat(64); }, "second-parent policy bytes");

  const roadmapL014Push = structuredClone(push);
  Object.assign(roadmapL014Push, {
    beforeSha: "c".repeat(40),
    changedPaths: [...ROADMAP_L014_CHANGED_PATHS],
    parentShas: ["c".repeat(40), "d".repeat(40)],
    secondParentChangedPaths: [...ROADMAP_L014_CHANGED_PATHS],
    roadmapAuthorizedHeadAncestor: true,
    roadmapHash: ROADMAP_L014_ROADMAP_SHA256,
    locksHash: ROADMAP_L014_LOCKS_SHA256,
    basePolicyHash: push.policyHash
  });
  assert.deepEqual(evaluatePolicy(roadmapL014Push).errors, []);
  expectAnyFailure(roadmapL014Push, facts => { facts.basePolicyHash = "4".repeat(64); }, "wrong pre-merge policy bytes");
  expectAnyFailure(roadmapL014Push, facts => { facts.parentShas = [facts.beforeSha]; }, "one-parent ROADMAP push");
  expectAnyFailure(roadmapL014Push, facts => { facts.parentShas[0] = "e".repeat(40); }, "wrong first parent");
  expectAnyFailure(roadmapL014Push, facts => { facts.roadmapAuthorizedHeadAncestor = false; }, "unauthorized second-parent ancestry");
  expectAnyFailure(roadmapL014Push, facts => { facts.roadmapHash = "4".repeat(64); }, "wrong ROADMAP bytes");
  expectAnyFailure(roadmapL014Push, facts => { facts.locksHash = "4".repeat(64); }, "wrong LOCKS bytes");
  expectAnyFailure(roadmapL014Push, facts => { facts.changedPaths.pop(); }, "missing ROADMAP-L014 path");
  expectAnyFailure(roadmapL014Push, facts => { facts.changedPaths.push("README.md"); }, "extra ROADMAP-L014 path");
  expectAnyFailure(roadmapL014Push, facts => { facts.secondParentChangedPaths.push("README.md"); }, "second-parent net diff broadened");

  expectFailure(push, facts => {
    facts.ref = "refs/tags/sun-v0.30.1";
    facts.refName = "sun-v0.30.1";
    facts.refType = "tag";
  }, "tag creation");
  expectFailure(push, facts => { facts.beforeSha = "c".repeat(40); }, "push before SHA");

  console.log("PASS release-policy self-test (PIPE-BOOT routes + one-shot recovery-policy amendment + exact ROADMAP-L014 governance route)");
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
    "## Recovery release policy",
    "",
    `- Exact tested SHA: \`${facts.sha || "missing"}\``,
    `- PR head SHA: \`${facts.prHeadSha || "n/a"}\``,
    `- PR base SHA: \`${facts.prBaseSha || facts.beforeSha || "n/a"}\``,
    `- Result: **${result.passed ? "PASS" : "FAIL"}**`,
    `- Source declaration: \`SOURCE ${source} · RUNTIME ${source} · TASK RECOVERY-POLICY-R1 · MODE verification\``,
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
  console.log(`SOURCE ${shortSha} · RUNTIME ${shortSha} · TASK RECOVERY-POLICY-R1 · MODE verification`);
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
    console.log("PASS recovery release policy; NO-PUBLISH remains active");
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
