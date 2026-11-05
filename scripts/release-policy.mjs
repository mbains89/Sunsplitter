#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const FIXTURE_PATH = "scripts/fixtures/main-reconcile-ci-pr-baseline.json";
const WORKFLOWS = [".github/workflows/release-policy.yml", ".github/workflows/verify.yml"];
const EXPECTED_REPOSITORY = "mbains89/Sunsplitter";
const ZERO_SHA = "0".repeat(40);

function readText(path, root = ROOT) {
  return readFileSync(resolve(root, path), "utf8");
}

function readFixture(root = ROOT) {
  const fixture = JSON.parse(readText(FIXTURE_PATH, root));
  const errors = [];
  if (fixture.schemaVersion !== 1) errors.push("fixture schemaVersion must be 1");
  if (fixture.repository !== EXPECTED_REPOSITORY) errors.push("fixture repository mismatch");
  if (!/^[0-9a-f]{40}$/.test(fixture.sourceMainSha || "")) errors.push("fixture sourceMainSha malformed");
  if (!/^[0-9a-f]{40}$/.test(fixture.sourceMainTree || "")) errors.push("fixture sourceMainTree malformed");
  if (!/^[0-9a-f]{40}$/.test(fixture.requiredSrcTree || "")) errors.push("fixture requiredSrcTree malformed");
  if (fixture.certification !== "NO-PUBLISH / NOT_CERTIFIED") errors.push("fixture certification posture changed");
  if (!Array.isArray(fixture.allowedPaths) || fixture.allowedPaths.length !== 10) errors.push("fixture must contain the exact ten-path allowlist");
  if (new Set(fixture.allowedPaths || []).size !== fixture.allowedPaths?.length) errors.push("fixture allowedPaths contains duplicates");
  if (!fixture.branches?.version?.startsWith("version/") || !fixture.branches?.ticket?.startsWith("ticket/")) errors.push("fixture branch metadata malformed");
  if (fixture.simulation?.seed !== 20260817 || fixture.simulation?.smokeRunsPerPolicy !== 64 || fixture.simulation?.strictRunsPerPolicy !== 2000 || fixture.simulation?.strictShardSize !== 500) {
    errors.push("fixture simulation contract drifted");
  }
  if (errors.length) throw new Error(errors.join("; "));
  return fixture;
}

function git(args, root = ROOT) {
  const result = spawnSync("git", args, { cwd: root, encoding: "utf8", env: { ...process.env, GIT_OPTIONAL_LOCKS: "0" } });
  if (result.status !== 0) throw new Error(`git ${args.join(" ")} failed: ${(result.stderr || result.stdout).trim()}`);
  return result.stdout.trim();
}

function sameSet(left, right) {
  return left.length === right.length && [...left].sort().every((value, index) => value === [...right].sort()[index]);
}

function versionCore(ref) {
  return String(ref || "").match(/(?:^|\/)(\d+\.\d+\.\d+)(?:[-./]|$)/)?.[1] || null;
}

function workflowErrors(workflows) {
  const errors = [];
  const joined = Object.values(workflows).join("\n");
  for (const [path, text] of Object.entries(workflows)) {
    const onLine = text.match(/^on:[ \t]*(.*)$/m);
    if (!onLine || onLine[1].trim()) errors.push(`${path}: trigger declaration must be a block-form on:`);
    const onBlock = text.match(/^on:[ \t]*\r?\n((?:[ \t]+.*(?:\r?\n|$))*)/m)?.[1] || "";
    const events = [...onBlock.matchAll(/^[ \t]{2}([A-Za-z_][A-Za-z0-9_-]*):/gm)].map(match => match[1]);
    if (events.length !== 1 || events[0] !== "pull_request") errors.push(`${path}: pull_request must be the only top-level trigger`);
    if (/^\s*pull_request_target:/m.test(text)) errors.push(`${path}: pull_request_target is forbidden`);
    if (/^\s*(?:push|workflow_dispatch|repository_dispatch|schedule|release|deployment|page_build):/m.test(text)) errors.push(`${path}: forbidden trigger`);
    if (!/^permissions:\s*\n\s+contents:\s*read\s*$/m.test(text)) errors.push(`${path}: root permissions must be contents: read`);
    if (text.split(/\r?\n/).some(line => /^\s{4,}permissions:\s*$/.test(line))) errors.push(`${path}: job-level permissions are forbidden`);
    if (!/runs-on:\s*ubuntu-24\.04\b/.test(text)) errors.push(`${path}: runner is not pinned to ubuntu-24.04`);
    if (!/NODE_VERSION:\s*["']22\.16\.0["']/.test(text)) errors.push(`${path}: Node 22.16.0 is not pinned`);
    if (!/actions\/checkout@11d5960a326750d5838078e36cf38b85af677262/.test(text)) errors.push(`${path}: checkout action pin mismatch`);
    if (!/actions\/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020/.test(text)) errors.push(`${path}: setup-node action pin mismatch`);
    if (!/persist-credentials:\s*false/.test(text)) errors.push(`${path}: checkout credentials are not disabled`);
    if (/persist-credentials:\s*true/.test(text)) errors.push(`${path}: checkout credential persistence is forbidden`);
    if (!/cancel-in-progress:\s*true/.test(text)) errors.push(`${path}: concurrency cancellation missing`);
    if (/\b(?:permissions:\s*(?:write-all|read-all)|contents:\s*write|id-token:\s*write|packages:\s*write|deployments:\s*write)\b/i.test(text)) errors.push(`${path}: write-capable permission is forbidden`);
    if (/\b(?:pull_request_target|workflow_dispatch|repository_dispatch|git\s+push|git\s+tag|gh\s+(?:api|release)|netlify\s+(?:deploy|build)|npm\s+publish|actions\/upload-artifact|pages|secrets\.)\b/i.test(text)) errors.push(`${path}: mutation, upload, secret, publication, or deployment capability is forbidden`);
    if (/continue-on-error:\s*true|\|\|\s*true/.test(text)) errors.push(`${path}: failure suppression is forbidden`);
    for (const match of text.matchAll(/^[ \t]*(?:-[ \t]*)?uses:[ \t]*([^\s#]+).*$/gm)) {
      if (!new Set([
        "actions/checkout@11d5960a326750d5838078e36cf38b85af677262",
        "actions/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020"
      ]).has(match[1])) errors.push(`${path}: unapproved or unpinned action ${match[1]}`);
    }
  }
  const policy = workflows[".github/workflows/release-policy.yml"] || "";
  const verify = workflows[".github/workflows/verify.yml"] || "";
  for (const name of ["version-release-policy", "main-release-policy"]) {
    if (!new RegExp(`name:\\s*${name}\\b`).test(policy)) errors.push(`release-policy workflow missing ${name}`);
  }
  for (const name of ["version-verify", "version-simulation-smoke", "main-verify", "main-simulation-gate"]) {
    if (!new RegExp(`name:\\s*${name}\\b`).test(verify)) errors.push(`verify workflow missing ${name}`);
  }
  for (const policyName of ["random", "cheapest", "priciest"]) {
    if (!joined.includes(policyName)) errors.push(`workflow contract missing ${policyName} policy`);
  }
  if (/types:\s*\[[^\]]*closed/.test(policy)) errors.push("cheap policy workflow must not handle closed events");
  return errors;
}

function authorityErrors(authority) {
  const errors = [];
  if (!/`release_state:\s*NO-PUBLISH`/.test(authority.status)) errors.push("STATUS release_state is not NO-PUBLISH");
  if (!/`version_integrity:\s*NOT_CERTIFIED`/.test(authority.status)) errors.push("STATUS version_integrity is not NOT_CERTIFIED");
  if (!/`release_artifact:\s*none authorized`/.test(authority.status)) errors.push("STATUS authorizes or omits release artifact state");
  if (!/`deployment:\s*none authorized`/.test(authority.status)) errors.push("STATUS authorizes or omits deployment state");
  if (!authority.status.includes("PRESENT / UNRECONCILED / NO INTEGRATION OR RELEASE CREDIT")) errors.push("STATUS art posture missing");
  for (const token of ["L-025 — LOCKED", "L-026 — LOCKED", "L-027 — LOCKED", "L-028 — DEFERRED"]) {
    if (!authority.status.includes(token)) errors.push(`STATUS missing ${token}`);
  }
  if (!authority.pushRules.includes("NO-PUBLISH / NOT_CERTIFIED")) errors.push("push rules certification posture missing");
  return errors;
}

export function evaluatePolicy(facts, fixture, documents) {
  const errors = [];
  if (!facts.manifestPresent) errors.push("required main-reconcile manifest is missing");
  if (facts.eventName !== "pull_request") errors.push(`event ${facts.eventName || "<missing>"} is forbidden`);
  if (facts.repository !== EXPECTED_REPOSITORY) errors.push(`foreign repository ${facts.repository || "<missing>"}`);
  if (facts.headRepository !== EXPECTED_REPOSITORY) errors.push(`foreign head repository ${facts.headRepository || "<missing>"}`);
  if (!/^(?:opened|reopened|synchronize|ready_for_review|edited)$/.test(facts.action || "")) errors.push(`malformed or forbidden pull-request action ${facts.action || "<missing>"}`);
  for (const [label, sha] of Object.entries({ testedSha: facts.testedSha, headSha: facts.headSha, baseSha: facts.baseSha })) {
    if (!/^[0-9a-f]{40}$/.test(sha || "") || sha === ZERO_SHA) errors.push(`${label} is malformed`);
  }
  if (facts.testedSha !== facts.headSha) errors.push("checked-out SHA does not equal pull-request head SHA");
  const currentTicketRoute = facts.baseRef === fixture.branches.version && facts.headRef === fixture.branches.ticket;
  const currentMainRoute = facts.baseRef === "main" && facts.headRef === fixture.branches.version;
  const versionRoute = /^version\//.test(facts.baseRef || "") && /^ticket\//.test(facts.headRef || "") && versionCore(facts.baseRef) === versionCore(facts.headRef);
  const mainRoute = facts.baseRef === "main" && /^version\//.test(facts.headRef || "") && !!versionCore(facts.headRef);
  if (facts.mode === "version" && !versionRoute) errors.push("version policy requires a matching-version ticket/* -> version/* route");
  if (facts.mode === "main" && !mainRoute) errors.push("main policy requires a version/* -> main route");
  if (!new Set(["version", "main"]).has(facts.mode)) errors.push("policy mode must be version or main");
  if (facts.baseRef === "main" && facts.headRef?.startsWith("ticket/")) errors.push("direct-main ticket heads are forbidden");
  if (!(facts.changedPaths || []).length) errors.push("pull request contains no changed paths");
  if ((currentTicketRoute || currentMainRoute) && facts.baseSha !== fixture.sourceMainSha) errors.push("main-reconcile route base SHA is not the bound main baseline");
  if ((currentTicketRoute || currentMainRoute) && !sameSet(facts.changedPaths || [], fixture.allowedPaths)) errors.push("main-reconcile changed paths do not equal the exact ten-path allowlist");
  errors.push(...workflowErrors(documents.workflows));
  errors.push(...authorityErrors(documents));
  return errors;
}

function repositoryFacts(environment, fixture) {
  const testedSha = git(["rev-parse", "HEAD"]);
  const headSha = environment.POLICY_PR_HEAD_SHA || "";
  const baseSha = environment.POLICY_PR_BASE_SHA || "";
  const changedPaths = baseSha && headSha ? git(["diff", "--name-only", `${baseSha}...${headSha}`]).split(/\r?\n/).filter(Boolean) : [];
  return {
    manifestPresent: true,
    mode: environment.POLICY_MODE || "",
    eventName: environment.POLICY_EVENT_NAME || "",
    action: environment.POLICY_ACTION || "",
    repository: environment.POLICY_REPOSITORY || "",
    headRepository: environment.POLICY_PR_HEAD_REPOSITORY || "",
    baseRef: environment.POLICY_BASE_REF || "",
    headRef: environment.POLICY_HEAD_REF || "",
    baseSha,
    headSha,
    testedSha,
    changedPaths,
    fixture
  };
}

function repositoryErrors(facts, fixture) {
  const errors = [];
  try {
    if (git(["rev-parse", `${fixture.sourceMainSha}^{tree}`]) !== fixture.sourceMainTree) errors.push("bound main tree drifted");
    const currentRoute = facts.headRef === fixture.branches.ticket || facts.headRef === fixture.branches.version;
    if (currentRoute && git(["rev-parse", "HEAD:src"]) !== fixture.requiredSrcTree) errors.push("main-reconcile HEAD:src drifted");
    if (git(["merge-base", "--is-ancestor", fixture.auditedRecoveryBaseSha, facts.testedSha]) !== "") errors.push("unexpected ancestry output");
    if (git(["merge-base", "--is-ancestor", facts.baseSha, facts.headSha]) !== "") errors.push("unexpected pull-request ancestry output");
  } catch (error) {
    errors.push(error.message);
  }
  return errors;
}

function currentDocuments(root = ROOT) {
  return {
    status: readText("artifacts/PROJECT_STATUS.md", root),
    pushRules: readText("artifacts/GITHUB_PUSH_RULES.md", root),
    workflows: Object.fromEntries(WORKFLOWS.map(path => [path, readText(path, root)]))
  };
}

function runSelfTest() {
  const fixture = readFixture();
  const documents = currentDocuments();
  const baseFacts = {
    manifestPresent: true,
    mode: "version",
    eventName: "pull_request",
    action: "opened",
    repository: EXPECTED_REPOSITORY,
    headRepository: EXPECTED_REPOSITORY,
    baseRef: fixture.branches.version,
    headRef: fixture.branches.ticket,
    baseSha: fixture.sourceMainSha,
    headSha: "1".repeat(40),
    testedSha: "1".repeat(40),
    changedPaths: [...fixture.allowedPaths]
  };
  assert.deepEqual(evaluatePolicy(baseFacts, fixture, documents), []);
  const cases = [
    ["direct-main ticket", facts => { facts.baseRef = "main"; }],
    ["wrong version base", facts => { facts.baseRef = "version/wrong"; }],
    ["foreign repository", facts => { facts.repository = "foreign/Sunsplitter"; }],
    ["foreign head", facts => { facts.headRepository = "fork/Sunsplitter"; }],
    ["missing manifest", facts => { facts.manifestPresent = false; }],
    ["unexpected path", facts => { facts.changedPaths.push("src/state.js"); }],
    ["missing path", facts => { facts.changedPaths.pop(); }],
    ["malformed metadata", facts => { facts.headSha = "bad"; }],
    ["inconsistent tested SHA", facts => { facts.testedSha = "2".repeat(40); }],
    ["forbidden event", facts => { facts.eventName = "push"; }]
  ];
  for (const [label, mutate] of cases) {
    const facts = structuredClone(baseFacts);
    mutate(facts);
    assert.ok(evaluatePolicy(facts, fixture, documents).length, `${label} passed`);
  }
  const mainFacts = { ...baseFacts, mode: "main", baseRef: "main", headRef: fixture.branches.version };
  assert.deepEqual(evaluatePolicy(mainFacts, fixture, documents), []);

  const futureVersionFacts = {
    ...baseFacts,
    baseRef: "version/0.31.0",
    headRef: "ticket/0.31.0-feature",
    baseSha: "3".repeat(40),
    changedPaths: ["src/state.js"]
  };
  assert.deepEqual(evaluatePolicy(futureVersionFacts, fixture, documents), []);
  const futureMainFacts = { ...futureVersionFacts, mode: "main", baseRef: "main", headRef: "version/0.31.0" };
  assert.deepEqual(evaluatePolicy(futureMainFacts, fixture, documents), []);

  const documentCases = [
    ["write permission", docs => { docs.workflows[WORKFLOWS[0]] += "\npermissions: write-all\n"; }],
    ["forbidden trigger", docs => { docs.workflows[WORKFLOWS[0]] += "\npull_request_target:\n"; }],
    ["flow trigger", docs => { docs.workflows[WORKFLOWS[0]] = docs.workflows[WORKFLOWS[0]].replace("on:\n  pull_request:", "on: [pull_request, push]"); }],
    ["extra top-level trigger", docs => { docs.workflows[WORKFLOWS[0]] = docs.workflows[WORKFLOWS[0]].replace("on:\n  pull_request:", "on:\n  issues:\n  pull_request:"); }],
    ["unpinned action", docs => { docs.workflows[WORKFLOWS[0]] += "\n      - uses: actions/cache@v4\n"; }],
    ["credential persistence", docs => { docs.workflows[WORKFLOWS[0]] = docs.workflows[WORKFLOWS[0]].replace("persist-credentials: false", "persist-credentials: true"); }],
    ["false release state", docs => { docs.status = docs.status.replace("`release_state: NO-PUBLISH`", "`release_state: RELEASED`"); }],
    ["false certification", docs => { docs.status = docs.status.replace("`version_integrity: NOT_CERTIFIED`", "`version_integrity: CERTIFIED`"); }]
  ];
  for (const [label, mutate] of documentCases) {
    const docs = structuredClone(documents);
    mutate(docs);
    assert.ok(evaluatePolicy(baseFacts, fixture, docs).length, `${label} passed`);
  }
  console.log(`PASS release-policy self-test — ${cases.length + documentCases.length} negative fixtures rejected; generic routes accepted; NO-PUBLISH / NOT_CERTIFIED preserved`);
}

function main() {
  if (process.argv.length === 3 && process.argv[2] === "--self-test") return runSelfTest();
  if (process.argv.length !== 2) throw new Error("Usage: node scripts/release-policy.mjs [--self-test]");
  const fixture = readFixture();
  const facts = repositoryFacts(process.env, fixture);
  const errors = [...evaluatePolicy(facts, fixture, currentDocuments()), ...repositoryErrors(facts, fixture)];
  if (errors.length) {
    errors.forEach(error => console.error(`FAIL ${error}`));
    process.exitCode = 1;
  } else {
    console.log(`PASS ${facts.mode}-release-policy at ${facts.testedSha}; NO-PUBLISH / NOT_CERTIFIED`);
  }
}

try {
  main();
} catch (error) {
  console.error(`FAIL release-policy crash: ${error.stack || error.message}`);
  process.exitCode = 1;
}
