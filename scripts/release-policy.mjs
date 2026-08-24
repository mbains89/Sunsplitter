#!/usr/bin/env node

// TEMP-EXACT-HEAD-RECOVERY-GATE-R2-A
//
// One exact REC-RATCHET-02 candidate route, one structurally exact protected
// merge, one exact REC-02 activation route, and one structurally exact closure
// merge. The envelope then consumes itself. It never publishes, deploys, tags,
// releases, certifies, changes rulesets, or supplies credentials.

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  appendFileSync,
  mkdtempSync,
  readFileSync
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const EXPECTED_REPOSITORY = "mbains89/Sunsplitter";
const RECOVERY_BRANCH = "recovery/e4f8440-nopub";
const GATE_A_BRANCH = "ticket/0.30.1-rec-ratchet-02";
const POLICY_CORRECTION_BRANCH = "ticket/0.30.1-rec-ratchet-02-policy-selftest-correction-r1";
const FUTURE_BRANCH = "ticket/0.30.1-rec-02-r2";
const AUTHORIZED_PATCH_TARGET_BRANCH = "ticket/0.30.1-rec-02-r1";
const RECOVERY_BASE_SHA = "e4f84409759760d31fcf47b8a227802a61421f51";
const GATE_A_BASE_SHA = "23951012655b0037a55e82c755b66dd4d852f20b";
const GATE_A_BASE_TREE = "96829ad0e01619f56bed2121a666645b3f9b5259";
const GATE_A_HEAD_SHA = "f23c4bed1555c7ad6bcb3b42ca5c6ea3a92e37ab";
const GATE_A_HEAD_TREE = "f458b021bc9a9a36cb28c24fd7dee165c2bbaac5";
const GATE_A_HEAD_RAW_SHA256 = "4835344d32a516c8d68df1c8d18f51313297f04c7de2ac5ce4628c356fb36376";
const GATE_A_MERGE_SHA = "31aca17b807c4dc8edef3683e30d5fefdd47ad7a";
const GATE_A_MERGE_TREE = "f458b021bc9a9a36cb28c24fd7dee165c2bbaac5";
const ACTIVE_BASELINE_PATH = "scripts/fixtures/pipe-boot-r1-simulation-baseline.json";
const INACTIVE_BASELINE_PATH = "artifacts/REC-RATCHET-02_AUTHORIZED_BASELINE.json";
const PATCH_ARTIFACT_PATH = "artifacts/REC-RATCHET-02_AUTHORIZED_REC-02.patch.json";
const TRANSITION_PATH = "artifacts/REC-RATCHET-02_BASELINE_TRANSITION.md";
const POLICY_CORRECTION_RECORD_PATH = "artifacts/REC-RATCHET-02_POLICY_SELFTEST_CORRECTION.md";
const STATUS_PATH = "artifacts/PROJECT_STATUS.md";
const POLICY_PATH = "scripts/release-policy.mjs";
const VERIFY_WORKFLOW_PATH = ".github/workflows/verify.yml";
const RELEASE_WORKFLOW_PATH = ".github/workflows/release-policy.yml";

const NO_PUBLISH_TOKEN = "NO-PUBLISH / NOT CERTIFIED";
const GATE_A_COMMIT_TITLE = "REC-RATCHET-02: pin exact REC-02 recovery projection";
const POLICY_CORRECTION_COMMIT_TITLE = "REC-RATCHET-02: correct Stage 2 policy self-test";
const FUTURE_COMMIT_TITLE = "REC-02: apply authorized zero-exit projection";
const GATE_A_AUTHOR = "Sunsplitter Recovery Build <noreply@openai.com> 1787443200 -0500";
const POLICY_CORRECTION_AUTHOR = "Sunsplitter Recovery Build <noreply@openai.com> 1787529600 -0500";
const FUTURE_AUTHOR = "Sunsplitter Recovery Build <noreply@openai.com> 1787616000 -0500";

const GATE_A_POLICY_PROJECTION_SHA256 = "02bd44d53b1160a992071de4add1774cd9062f0a1949b9b9985adb301387e4a5";
const POLICY_PROJECTION_SHA256 = "123633dcc49d4bf45650a700a2d539af03a4a95f14fa24a5140f92d9caef97da";
const TRANSITION_SHA256 = "a01180e9d5f917e47eafb9b65eea3c1c045e325b7b97690cfd8bfbef0110ba2a";

const VERIFY_WORKFLOW_SHA256 = "7f0047c7de5dd862083fbbd6c7cc56d018700a536f88e2c0904a7de922184cbd";
const RELEASE_WORKFLOW_SHA256 = "2d0c146aaae977c61cbfa7c96642f99759dfacefb142f053e6d1187c0395dd33";
const GATE_A_STATUS_SHA256 = "e84a750b32350c0a6cfecfd60c4b1a9b6e44a22f57ed5fdeb9c5afa941d56d33";
const INACTIVE_BASELINE_SHA256 = "048ee211f4708252b8609d475b47d3b6c05e85bd1d8bd1ae9c44f9229b659c20";
const PATCH_ARTIFACT_SHA256 = "b9d97f57ef5ab755db2509789ebee2dda129460f7ce6a7934a71e7ebc5b04eb3";
const POLICY_CORRECTION_STATUS_SHA256 = "88cddefa8e713e816b2505cdb769dc16bd67724db4819f3510530d4f87f58c22";
const POLICY_CORRECTION_STATUS_BLOB = "332de45148b6217119e2ca0d298ee54cbc6bb387";
const POLICY_CORRECTION_STATUS_BYTES = 17258;
const POLICY_CORRECTION_RECORD_SHA256 = "db434f6889dc1760c2620381fd13af42b4b9ce38c2c2c75700f43ec3d493f0f5";
const POLICY_CORRECTION_RECORD_BLOB = "501c49536176b523450a799d17c83f58b08ef607";
const POLICY_CORRECTION_RECORD_BYTES = 10633;
const ACTIVE_BASELINE_INPUT_SHA256 = "0633469f57971b9c00c877a33f9ccb818e53d5a8de8cc787e4ca2a25fdeda7f2";
const FUNCTIONAL_TREE = "57e1439741965bf290cd6daf305c551e2f104182";
const FUNCTIONAL_MANIFEST_SHA256 = "3f10dbc636fadc942ee17dd6356ff7be023a34a5347c147d2c7631132b0fe48d";
const EMBEDDED_PATCH_SHA256 = "b33fdc96c1a5942e1dcd2fdb9d5606ca4222696133302c0ed3ebdd225e9d38fd";
const NORMALIZED_SIMULATION_SHA256 = "c1969e553a03fd80c9ce220a511e3ed6393c9c7b72ef0ca3ab4edb4dcfc78c08";
const EXACT_SIMULATION_OUTPUT_SHA256 = "f2e67e934b18e9dbc6464d9b7d502404b7c7e34b02307bb8056e3e8e94bfc69d";
const ART_R2_IMAGE_MANIFEST_SHA256 = "1441be78e8d0d95f4cf2cfd9ace72b7e6458aa0ec230336748de6a2b96db7baa";

const NORMALIZED_POLICY_SHA256 = Object.freeze({
  random: "13c043596cd756badc06844d72e0b4575e4470fe2947e5b46a68018230c1e385",
  cheapest: "0eb8095881dadec2f947bf3ebe05139eb7c2b91be75151273171681bd9a6cdcd",
  priciest: "38b752e6b7194da98368ef1e11e9389d710e6915859eed4a53d889efd94ef05a"
});

const ART_R2_HEAD = "7fe31675b678d041c980605ed5c5533d3ea22581";
const ART_R2_TREE = "52551891fe55324bc2fcd073bff56b9a8cd2c061";
const ART_R2_VERIFY_SHA256 = "654193d383a4fd2e32472c554ba2b85c64d25f2941048a8b4fe936cbc985471f";
const ART_R2_VERIFY_BLOB = "b72530bb37fb07916e89c9d51ff7ee69a4ae4897";
const ART_R2_CHANGED_MANIFEST_SHA256 = "f617b540572839c5915a1ef3bf57ea89c1241dd3eaa0d3fa6cf24a876673ad65";
const ART_R2_RECORD_SHA256 = "d4512affd47ae29e6e8d9e711fd095b8273767de02f7bec06d1d4c5a9a33f29f";
const ART_R2_VALIDATOR_SHA256 = "bed3a5443255510e8201fa896a4db05fbb466da2e13c4d431fae1fe28fdf5141";
const REC_02_VERIFY_SHA256 = "c1258c11e1ac5ef56637a93bcbedb4c81b3d7b45ea15f332f51389e5eeddbe23";
const REC_02_VERIFY_BLOB = "a4a828d423addf4717164cfbb7f61eca659ae9d7";
const ART_R2_COMBINED_VERIFY_SHA256 = "7d06703e8af22a1aec080ef8453c22ed9238852e1fc5df31fdc67e600ef79440";
const ART_R2_COMBINED_VERIFY_BLOB = "b1cbd17b732c7c3b8d72d123dbed7874791f5906";
const ART_R2_COMBINED_TREE = "558a4d6d1fb491d6bd7cd3c07f0482ad6e35a482";
const ART_R2_COMBINED_MANIFEST_SHA256 = "0973fcfeaab8370fd5e7e36ddef089b6f7eedaa4ed386b5e6f2bf3a83c116609";
const ART_R2_TRANSFORM_FUNCTION_SHA256 = "aedfce193f9fe9ed3ec975b848cea82d2aac70943dad2ea2d628b63ed40c51e7";
const FAILED_REC_02_R1_HEAD = "bd293bbe9fa9ed55eb0620bf85ef0a1316b2524e";
const FAILED_REC_02_R1_TREE = "34fa0adbfb027e01448a1a0771c8ff5af3997e26";
const FAILED_POLICY_CORRECTION_C1_HEAD = "b12ff37ef9153a509827d914b825dd51ec6de0ca";
const FAILED_POLICY_CORRECTION_C1_TREE = "14dcaa3fb6a92349b6bebf06a606d356456859e8";
const FAILED_POLICY_CORRECTION_C2_HEAD = "5c3b526d287d888bc3e0765569e6632ec5f6e0e6";
const FAILED_POLICY_CORRECTION_C2_TREE = "dc1e677d66c35873ac040c598e33b39c05c78e54";

const CHECKOUT_ACTION = "actions/checkout@11d5960a326750d5838078e36cf38b85af677262";
const SETUP_NODE_ACTION = "actions/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020";
const ALLOWED_ACTIONS = new Set([CHECKOUT_ACTION, SETUP_NODE_ACTION]);
const FULL_SHA_RE = /^[0-9a-f]{40}$/;
const FULL_SHA256_RE = /^[0-9a-f]{64}$/;

export const GATE_A_CHANGED_PATHS = Object.freeze([
  VERIFY_WORKFLOW_PATH,
  STATUS_PATH,
  INACTIVE_BASELINE_PATH,
  PATCH_ARTIFACT_PATH,
  TRANSITION_PATH,
  POLICY_PATH
].sort());

export const POLICY_CORRECTION_CHANGED_PATHS = Object.freeze([
  STATUS_PATH,
  POLICY_CORRECTION_RECORD_PATH,
  POLICY_PATH
].sort());

export const FUTURE_CHANGED_PATHS = Object.freeze([
  STATUS_PATH,
  ACTIVE_BASELINE_PATH,
  "scripts/verify.mjs",
  "src/scenes-02.js",
  "src/scenes-04.js",
  "src/scenes-05.js",
  "src/scenes-06.js",
  "src/scenes-13.js",
  "src/scenes-36.js",
  "src/scenes-55.js"
].sort());

const GATE_A_FIXED_SHA256 = Object.freeze({
  [VERIFY_WORKFLOW_PATH]: VERIFY_WORKFLOW_SHA256,
  [STATUS_PATH]: GATE_A_STATUS_SHA256,
  [INACTIVE_BASELINE_PATH]: INACTIVE_BASELINE_SHA256,
  [PATCH_ARTIFACT_PATH]: PATCH_ARTIFACT_SHA256,
  [TRANSITION_PATH]: TRANSITION_SHA256
});

const PROJECTION_CONSTANT_NAMES = Object.freeze([
  "POLICY_PROJECTION_SHA256",
  "TRANSITION_SHA256"
]);

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function recursivelySorted(value) {
  if (Array.isArray(value)) return value.map(recursivelySorted);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value).sort().map(key => [key, recursivelySorted(value[key])])
    );
  }
  return value;
}

function canonicalJsonBytes(value) {
  return Buffer.from(`${JSON.stringify(recursivelySorted(value))}\n`, "utf8");
}

const NORMALIZED_POLICY_FIELDS = Object.freeze([
  "runs",
  "endings",
  "incomplete",
  "errors",
  "stepLimits",
  "totalSteps",
  "endingCounts",
  "invariantTotals",
  "invariantRules",
  "invariantScenes",
  "invariantFingerprints"
]);

function normalizedSimulationEvidence(baseline) {
  const policies = {};
  for (const policy of baseline.config?.policies || []) {
    const source = baseline.policies?.[policy] || {};
    policies[policy] = Object.fromEntries(NORMALIZED_POLICY_FIELDS.map(field => [field, source[field]]));
  }
  const config = {
    seed: baseline.config?.seed,
    runs: baseline.config?.runs,
    startRun: baseline.config?.startRun,
    shardSize: baseline.config?.shardSize,
    maxSteps: baseline.config?.maxSteps,
    policies: baseline.config?.policies
  };
  const perPolicyConfig = {
    seed: config.seed,
    runs: config.runs,
    startRun: config.startRun,
    shardSize: config.shardSize,
    maxSteps: config.maxSteps
  };
  return {
    core: sha256(canonicalJsonBytes({ config, policies })),
    policies: Object.fromEntries((config.policies || []).map(policy => [
      policy,
      sha256(canonicalJsonBytes({ config: perPolicyConfig, policy, summary: policies[policy] }))
    ]))
  };
}

function gitObjectOid(type, bytes) {
  return createHash("sha1")
    .update(Buffer.from(`${type} ${bytes.length}\0`))
    .update(bytes)
    .digest("hex");
}

function runGit(args, { input, env, allowFailure = false } = {}) {
  const result = spawnSync("git", args, {
    cwd: ROOT,
    env: env ? { ...process.env, ...env } : process.env,
    input,
    encoding: null,
    maxBuffer: 32 * 1024 * 1024
  });
  if (!allowFailure && result.status !== 0) {
    const detail = Buffer.concat([
      Buffer.from(result.stdout || ""),
      Buffer.from(result.stderr || "")
    ]).toString("utf8").trim();
    throw new Error(`git ${args.join(" ")} failed (${result.status}): ${detail}`);
  }
  return result;
}

function gitBytes(args, options) {
  return Buffer.from(runGit(args, options).stdout || "");
}

function gitText(args, options) {
  return gitBytes(args, options).toString("utf8").trim();
}

function resolveCommit(ref) {
  if (!ref) return null;
  const result = runGit(["rev-parse", "--verify", ref], { allowFailure: true });
  if (result.status !== 0) return null;
  const oid = Buffer.from(result.stdout).toString("utf8").trim();
  if (!FULL_SHA_RE.test(oid)) return null;
  const type = runGit(["cat-file", "-t", oid], { allowFailure: true });
  if (type.status !== 0 || Buffer.from(type.stdout).toString("utf8").trim() !== "commit") return null;
  return oid;
}

function rawCommit(ref) {
  const oid = resolveCommit(ref);
  if (!oid) return null;
  if (gitText(["rev-parse", "--show-object-format"]) !== "sha1") return null;
  const result = runGit(["cat-file", "commit", oid], { allowFailure: true });
  if (result.status !== 0) return null;
  const bytes = Buffer.from(result.stdout);
  const declaredSize = Number(gitText(["cat-file", "-s", oid]));
  return declaredSize === bytes.length && gitObjectOid("commit", bytes) === oid
    ? { oid, bytes, declaredSize }
    : null;
}

function commitHeaders(ref) {
  const raw = rawCommit(ref);
  if (!raw) return null;
  const text = raw.bytes.toString("utf8");
  if (!Buffer.from(text, "utf8").equals(raw.bytes)) return null;
  const split = text.indexOf("\n\n");
  if (split < 0) return null;
  const headerLines = text.slice(0, split).split("\n");
  const treeLines = headerLines.filter(line => line.startsWith("tree "));
  const parentLines = headerLines.filter(line => line.startsWith("parent "));
  if (treeLines.length !== 1) return null;
  const tree = treeLines[0].slice(5);
  const parents = parentLines.map(line => line.slice(7));
  if (!FULL_SHA_RE.test(tree) || parents.some(parent => !FULL_SHA_RE.test(parent))) return null;
  return { ...raw, tree, parents, headerLines, message: text.slice(split + 2) };
}

function fileIdentity(ref, path) {
  const result = runGit(["ls-tree", "-z", ref, "--", path], { allowFailure: true });
  if (result.status !== 0) return null;
  const raw = Buffer.from(result.stdout);
  const match = raw.toString("utf8").match(/^(\d{6}) blob ([0-9a-f]{40})\t([^\0]+)\0$/);
  if (!match || match[3] !== path) return null;
  const bytesResult = runGit(["cat-file", "blob", match[2]], { allowFailure: true });
  if (bytesResult.status !== 0) return null;
  const bytes = Buffer.from(bytesResult.stdout);
  if (gitObjectOid("blob", bytes) !== match[2]) return null;
  return {
    path,
    mode: match[1],
    blob: match[2],
    sha256: sha256(bytes),
    byteLength: bytes.length,
    bytes
  };
}

function changedPaths(base, head) {
  if (!FULL_SHA_RE.test(base || "") || !FULL_SHA_RE.test(head || "")) return [];
  const result = runGit([
    "diff", "--name-only", "--no-renames", "--diff-filter=ACDMRTUXB", `${base}..${head}`
  ], { allowFailure: true });
  if (result.status !== 0) return [];
  return [...new Set(Buffer.from(result.stdout).toString("utf8").trim().split(/\r?\n/).filter(Boolean))].sort();
}

function sameList(left, right) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function canonicalRecords(ref, paths) {
  return paths.map(path => fileIdentity(ref, path));
}

function canonicalManifest(records) {
  return records.map(record => `${record.mode} ${record.blob} ${record.sha256}\t${record.path}\n`).join("");
}

function canonicalMessage(title, records) {
  return [
    title,
    "",
    NO_PUBLISH_TOKEN,
    "",
    "Canonical manifest (mode blob sha256 path):",
    canonicalManifest(records)
  ].join("\n");
}

function canonicalRawCommit(tree, parent, author, title, records) {
  return Buffer.from([
    `tree ${tree}`,
    `parent ${parent}`,
    `author ${author}`,
    `committer ${author}`,
    "",
    canonicalMessage(title, records)
  ].join("\n"), "utf8");
}

function normalizedPolicyBytes(bytes) {
  let text = bytes.toString("utf8");
  if (!Buffer.from(text, "utf8").equals(bytes)) throw new Error("policy source is not lossless UTF-8");
  for (const name of PROJECTION_CONSTANT_NAMES) {
    const pattern = new RegExp(`(const ${name} = \")[0-9a-f]{64}(\";)`, "g");
    const matches = [...text.matchAll(pattern)];
    if (matches.length !== 1) throw new Error(`${name} must occur exactly once`);
    text = text.replace(pattern, `$1${"0".repeat(64)}$2`);
  }
  return Buffer.from(text, "utf8");
}

function policyProjection(ref) {
  const policy = fileIdentity(ref, POLICY_PATH);
  if (!policy) return null;
  try {
    return sha256(normalizedPolicyBytes(policy.bytes));
  } catch {
    return null;
  }
}

function parseJson(bytes, label, errors) {
  try {
    return JSON.parse(bytes.toString("utf8"));
  } catch (error) {
    errors.push(`${label} is not valid JSON: ${error.message}`);
    return null;
  }
}

function stagedIdentity(indexPath, path) {
  const env = { GIT_INDEX_FILE: indexPath };
  const row = gitText(["ls-files", "-s", "--", path], { env });
  const match = row.match(/^(\d{6}) ([0-9a-f]{40}) 0\t(.+)$/);
  if (!match || match[3] !== path) return null;
  const bytes = gitBytes(["cat-file", "blob", match[2]]);
  return { mode: match[1], blob: match[2], sha256: sha256(bytes), byteLength: bytes.length };
}

function updateIndexBytes(indexPath, path, bytes, mode = "100644") {
  const blob = gitText(["hash-object", "-w", "--stdin"], { input: bytes });
  runGit(["update-index", "--add", "--cacheinfo", `${mode},${blob},${path}`], {
    env: { GIT_INDEX_FILE: indexPath }
  });
  return blob;
}

const projectionCache = new Map();

function validateProjectionArtifacts(ref) {
  const errors = [];
  const baselineIdentity = fileIdentity(ref, INACTIVE_BASELINE_PATH);
  const patchIdentity = fileIdentity(ref, PATCH_ARTIFACT_PATH);
  if (!baselineIdentity || !patchIdentity) {
    if (!baselineIdentity) errors.push("inactive REC-02 baseline is missing");
    if (!patchIdentity) errors.push("authorized REC-02 patch artifact is missing");
    return { errors };
  }
  const cacheKey = `${baselineIdentity.blob}:${patchIdentity.blob}`;
  if (projectionCache.has(cacheKey)) return structuredClone(projectionCache.get(cacheKey));

  if (baselineIdentity.sha256 !== INACTIVE_BASELINE_SHA256) errors.push("inactive REC-02 baseline bytes drifted");
  if (patchIdentity.sha256 !== PATCH_ARTIFACT_SHA256) errors.push("authorized REC-02 patch artifact bytes drifted");
  const baseline = parseJson(baselineIdentity.bytes, "inactive baseline", errors);
  const artifact = parseJson(patchIdentity.bytes, "patch artifact", errors);

  if (baseline) {
    if (baseline.certification !== NO_PUBLISH_TOKEN) errors.push("inactive baseline certification token drifted");
    if (baseline.provenance?.authorizationIssue !== 24) errors.push("inactive baseline authorization issue is not #24");
    if (baseline.provenance?.gateABaseSha !== GATE_A_BASE_SHA) errors.push("inactive baseline Gate A base drifted");
    if (baseline.provenance?.gateABaseTree !== GATE_A_BASE_TREE) errors.push("inactive baseline Gate A tree drifted");
    if (baseline.evidence?.repetitions !== 2) errors.push("inactive baseline does not record two repetitions");
    if (!sameList(baseline.evidence?.exactJsonOutputSha256 || [], [EXACT_SIMULATION_OUTPUT_SHA256, EXACT_SIMULATION_OUTPUT_SHA256])) {
      errors.push("inactive baseline exact simulation output digests drifted");
    }
    const expectedConfig = {
      seed: 20260817,
      runs: 2000,
      startRun: 0,
      shardSize: 500,
      maxSteps: 600,
      policies: ["random", "cheapest", "priciest"]
    };
    if (JSON.stringify(baseline.config) !== JSON.stringify(expectedConfig)) {
      errors.push("inactive baseline locked simulation configuration drifted");
    }
    for (const policy of ["random", "cheapest", "priciest"]) {
      const row = baseline.policies?.[policy];
      if (row && !sameList(Object.keys(row), NORMALIZED_POLICY_FIELDS)) {
        errors.push(`inactive baseline ${policy} field inventory drifted`);
      }
      if (!row || row.runs !== 2000 || row.endings !== 2000 || row.incomplete !== 0
        || row.errors !== 0 || row.stepLimits !== 0 || row.invariantTotals?.V1 !== 0) {
        errors.push(`inactive baseline ${policy} does not prove 2,000 complete V1-clean endings`);
      }
    }
    if ((baseline.policies?.random?.invariantTotals?.V4 ?? -1) !== 191
      || (baseline.policies?.random?.invariantTotals?.V5 ?? -1) !== 160
      || (baseline.policies?.cheapest?.invariantTotals?.V4 ?? -1) !== 489
      || (baseline.policies?.cheapest?.invariantTotals?.V5 ?? -1) !== 3895
      || (baseline.policies?.priciest?.invariantTotals?.V4 ?? -1) !== 0
      || (baseline.policies?.priciest?.invariantTotals?.V5 ?? -1) !== 0) {
      errors.push("inactive baseline V4/V5 evidence counts drifted");
    }
    const normalized = normalizedSimulationEvidence(baseline);
    if (normalized.core !== NORMALIZED_SIMULATION_SHA256
      || baseline.evidence?.normalizedCoreSha256 !== NORMALIZED_SIMULATION_SHA256) {
      errors.push("inactive baseline normalized simulation digest drifted");
    }
    for (const [policy, expected] of Object.entries(NORMALIZED_POLICY_SHA256)) {
      if (normalized.policies[policy] !== expected
        || baseline.evidence?.normalizedPolicySha256?.[policy] !== expected) {
        errors.push(`inactive baseline normalized ${policy} digest drifted`);
      }
    }
  }

  let functional = null;
  if (artifact) {
    if (artifact.certification !== NO_PUBLISH_TOKEN) errors.push("patch artifact certification token drifted");
    if (artifact.authority?.issue !== 24 || artifact.authority?.lock !== "L-021") {
      errors.push("patch artifact authority drifted");
    }
    if (artifact.authority?.baseCommit !== GATE_A_BASE_SHA || artifact.authority?.baseTree !== GATE_A_BASE_TREE) {
      errors.push("patch artifact base identity drifted");
    }
    if (artifact.authority?.targetBranch !== AUTHORIZED_PATCH_TARGET_BRANCH) {
      errors.push("historical patch artifact target branch drifted");
    }
    const governed = [
      "cut_out", "vent", "past_leak", "vault_voice", "arc_future_1",
      "act3_reckoning_heading", "pregnancy_check", "custody_possession", "custody_thaw"
    ];
    if (!sameList(artifact.authority?.governedScenes || [], governed)) errors.push("patch artifact governed-scene inventory drifted");
    const patchBytes = Buffer.from(artifact.patch?.unifiedDiff || "", "utf8");
    if (patchBytes.length !== artifact.patch?.byteLength || sha256(patchBytes) !== EMBEDDED_PATCH_SHA256
      || artifact.patch?.sha256 !== EMBEDDED_PATCH_SHA256) {
      errors.push("embedded full-index patch bytes drifted");
    }
    const filePaths = (artifact.files || []).map(row => row.path);
    if (!sameList([...filePaths].sort(), FUTURE_CHANGED_PATHS.filter(path => path !== STATUS_PATH && path !== ACTIVE_BASELINE_PATH))) {
      errors.push("patch artifact output path inventory drifted");
    }

    const replacementManifest = [];
    for (const row of artifact.files || []) {
      const input = fileIdentity(GATE_A_BASE_SHA, row.path);
      const expectedInput = row.input || {};
      if (!input || input.mode !== expectedInput.mode || input.blob !== expectedInput.blob
        || input.sha256 !== expectedInput.sha256 || input.byteLength !== expectedInput.byteLength) {
        errors.push(`${row.path}: recorded patch input identity drifted`);
      }
      replacementManifest.push(`${row.path}\0${expectedInput.mode}\0${expectedInput.blob}\0${expectedInput.sha256}\0${row.output?.mode}\0${row.output?.blob}\0${row.output?.sha256}\n`);
    }
    if (sha256(Buffer.from(replacementManifest.join(""))) !== artifact.patch?.replacementManifestSha256) {
      errors.push("patch replacement manifest digest drifted");
    }

    const activeInput = fileIdentity(GATE_A_BASE_SHA, ACTIVE_BASELINE_PATH);
    const baselineCopy = artifact.baselineCopy || {};
    if (baselineCopy.sourcePath !== INACTIVE_BASELINE_PATH || baselineCopy.targetPath !== ACTIVE_BASELINE_PATH) {
      errors.push("baseline-copy path contract drifted");
    }
    if (!activeInput || activeInput.sha256 !== ACTIVE_BASELINE_INPUT_SHA256
      || activeInput.mode !== baselineCopy.input?.mode || activeInput.blob !== baselineCopy.input?.blob
      || activeInput.sha256 !== baselineCopy.input?.sha256 || activeInput.byteLength !== baselineCopy.input?.byteLength) {
      errors.push("active baseline input identity drifted");
    }
    if (baselineCopy.output?.sha256 !== baselineIdentity.sha256
      || baselineCopy.output?.blob !== baselineIdentity.blob
      || baselineCopy.output?.mode !== baselineIdentity.mode
      || baselineCopy.output?.byteLength !== baselineIdentity.byteLength) {
      errors.push("inactive-to-active baseline output identity drifted");
    }

    if (errors.length === 0) {
      const parent = mkdtempSync(join(tmpdir(), "sunsplitter-policy-projection-"));
      const indexPath = join(parent, "index");
      const env = { GIT_INDEX_FILE: indexPath };
      runGit(["read-tree", GATE_A_BASE_SHA], { env });
      const applied = runGit(["apply", "--cached", "--whitespace=error-all", "--verbose", "-"], {
        env,
        input: patchBytes,
        allowFailure: true
      });
      const transcript = Buffer.concat([
        Buffer.from(applied.stdout || ""), Buffer.from(applied.stderr || "")
      ]).toString("utf8");
      if (applied.status !== 0) errors.push(`strict patch reconstruction failed: ${transcript.trim()}`);
      if (/\b(?:offset|fuzz)\b/i.test(transcript)) errors.push("strict patch reconstruction reported offset or fuzz");
      if (applied.status === 0) {
        for (const row of artifact.files || []) {
          const staged = stagedIdentity(indexPath, row.path);
          if (!staged || staged.mode !== row.output?.mode || staged.blob !== row.output?.blob
            || staged.sha256 !== row.output?.sha256 || staged.byteLength !== row.output?.byteLength) {
            errors.push(`${row.path}: reconstructed output identity drifted`);
          }
        }
        updateIndexBytes(indexPath, ACTIVE_BASELINE_PATH, baselineIdentity.bytes, baselineIdentity.mode);
        const tree = gitText(["write-tree"], { env });
        if (tree !== FUNCTIONAL_TREE || tree !== artifact.functionalProjection?.tree) {
          errors.push(`functional projection tree ${tree || "missing"} != ${FUNCTIONAL_TREE}`);
        }
        const manifestRows = [
          { path: ACTIVE_BASELINE_PATH, ...stagedIdentity(indexPath, ACTIVE_BASELINE_PATH) },
          ...(artifact.files || []).map(row => ({ path: row.path, ...stagedIdentity(indexPath, row.path) }))
        ].sort((left, right) => left.path.localeCompare(right.path));
        const manifest = manifestRows.map(row => `${row.mode} ${row.blob} ${row.sha256}\t${row.path}\n`).join("");
        if (sha256(Buffer.from(manifest)) !== FUNCTIONAL_MANIFEST_SHA256
          || artifact.functionalProjection?.canonicalManifestSha256 !== FUNCTIONAL_MANIFEST_SHA256
          || artifact.functionalProjection?.canonicalManifest !== manifest) {
          errors.push("functional projection canonical manifest drifted");
        }
        functional = { tree, transcript, manifest, records: manifestRows };
      }
    }
  }

  const result = { errors, baseline, artifact, functional };
  projectionCache.set(cacheKey, structuredClone(result));
  return result;
}

function requireUniqueStatus(errors, text, key, predicate, label) {
  const values = [...text.matchAll(new RegExp("`" + key + ":\\s*([^`]+)`", "g"))]
    .map(match => match[1].trim());
  if (values.length !== 1) errors.push(`${label} must appear exactly once; found ${values.length}`);
  else if (!predicate(values[0])) errors.push(`${label} is missing or changed`);
}

function noPublishStatusErrors(bytes) {
  const errors = [];
  const text = bytes?.toString("utf8") || "";
  requireUniqueStatus(errors, text, "runtime_baseline_sha", value => value === RECOVERY_BASE_SHA, "STATUS runtime baseline");
  requireUniqueStatus(errors, text, "release_state", value => value === "NO-PUBLISH", "STATUS NO-PUBLISH state");
  requireUniqueStatus(errors, text, "production_url", value => value === "NOT_AUTHORIZED", "STATUS production block");
  requireUniqueStatus(errors, text, "release_artifact", value => value === "none authorized from this base", "STATUS release-artifact block");
  requireUniqueStatus(errors, text, "artifact_digest", value => /^none\s*[—-]\s*no release created$/i.test(value), "STATUS artifact block");
  requireUniqueStatus(errors, text, "version_integrity", value => /^NOT_CERTIFIED\b/.test(value), "STATUS certification block");
  return errors;
}

function replaceOnce(source, needle, replacement, label) {
  const first = source.indexOf(needle);
  if (first < 0 || first !== source.lastIndexOf(needle)) throw new Error(`${label} anchor count is not exactly one`);
  return source.slice(0, first) + replacement + source.slice(first + needle.length);
}

function applyArtVerifierTransform(source) {
  let output = source;
  const importAnchor = "} from \"./simulate.mjs\";\n";
  output = replaceOnce(output, importAnchor,
    `${importAnchor}import { runArtR2SelfTest, validateArtR2 } from \"./validate-art-r2.mjs\";\n`,
    "ART import");

  const selfTestAnchor = "  check(duplicateStatus.errors.some(error => error.includes(\"expected exactly 1\")), \"duplicate contradictory STATUS field did not fail closed\");\n\n";
  const selfTestAddition = [
    selfTestAnchor,
    "  const artR2 = runArtR2SelfTest(ROOT);\n",
    "  artR2.failures.forEach(failure => failures.push(`ART-INTEGRATION-R2: ${failure}`));\n\n"
  ].join("");
  output = replaceOnce(output, selfTestAnchor, selfTestAddition, "ART self-test");

  const mainAnchor = "  const simulations = runPolicySet(ROOT, { policies: POLICY_NAMES, runs: 1, seed: 20260817 });\n";
  const mainAddition = [
    "  const artR2 = validateArtR2(ROOT, { runtime, loadRuntime: false });\n",
    "  printCheck(\"ART-INTEGRATION-R2 exact assets + scene wiring\", artR2.errors,\n",
    "    `${artR2.wave2Count}+${artR2.wave3Count}=${artR2.plateCount} plates; ${artR2.warnings.length} warning(s)`);\n",
    "  failures.push(...artR2.errors.map(error => `ART-INTEGRATION-R2: ${error}`));\n\n",
    mainAnchor
  ].join("");
  output = replaceOnce(output, mainAnchor, mainAddition, "ART full validation");

  output = replaceOnce(
    output,
    "\" — injected version drift rejected\"",
    "\" — injected version and ART-R2 drift rejected\"",
    "ART success message"
  );
  return output;
}

function contentManifest(ref, paths) {
  const unique = [...new Set(paths)].sort();
  if (unique.length !== paths.length) throw new Error("duplicate content-manifest path");
  const digest = createHash("sha256");
  for (const path of unique) {
    const item = fileIdentity(ref, path);
    if (!item) throw new Error(`content-manifest path is missing: ${path}`);
    digest.update(item.mode);
    digest.update("\0");
    digest.update("blob");
    digest.update("\0");
    digest.update(path);
    digest.update("\0");
    digest.update(item.sha256);
    digest.update("\n");
  }
  return digest.digest("hex");
}

const artCompatibilityCache = new Map();

function validateArtCompatibility(ref) {
  const patchIdentity = fileIdentity(ref, PATCH_ARTIFACT_PATH);
  const cacheKey = patchIdentity?.blob || "missing";
  if (artCompatibilityCache.has(cacheKey)) return structuredClone(artCompatibilityCache.get(cacheKey));
  const errors = [];
  const held = commitHeaders(ART_R2_HEAD);
  if (!held || held.tree !== ART_R2_TREE) errors.push("held ART-R2 head/tree is unavailable or drifted");
  const paths = changedPaths(GATE_A_BASE_SHA, ART_R2_HEAD);
  const imagePaths = paths.filter(path => path.startsWith("images/"));
  if (paths.length !== 79 || new Set(paths).size !== 79) errors.push(`held ART-R2 path count ${paths.length} != 79`);
  if (imagePaths.length !== 55) errors.push(`held ART-R2 image count ${imagePaths.length} != 55`);
  try {
    if (contentManifest(ART_R2_HEAD, paths) !== ART_R2_CHANGED_MANIFEST_SHA256) errors.push("held ART-R2 content manifest drifted");
    if (contentManifest(ART_R2_HEAD, imagePaths) !== ART_R2_IMAGE_MANIFEST_SHA256) errors.push("held ART-R2 55-image manifest drifted");
  } catch (error) {
    errors.push(error.message);
  }
  const baseVerify = fileIdentity(GATE_A_BASE_SHA, "scripts/verify.mjs");
  const heldVerify = fileIdentity(ART_R2_HEAD, "scripts/verify.mjs");
  if (!baseVerify || baseVerify.sha256 !== "ba413f6b41d4f0278238f69feea59865e0d3e979b177c76db6b380854afec084") {
    errors.push("protected verifier identity drifted before ART transform");
  }
  if (!heldVerify || heldVerify.blob !== ART_R2_VERIFY_BLOB || heldVerify.sha256 !== ART_R2_VERIFY_SHA256) {
    errors.push("held ART-R2 verifier identity drifted");
  }
  if (fileIdentity(ART_R2_HEAD, "artifacts/ART-INTEGRATION-R2-55_RECORD.json")?.sha256 !== ART_R2_RECORD_SHA256) {
    errors.push("held ART-R2 record identity drifted");
  }
  if (fileIdentity(ART_R2_HEAD, "scripts/validate-art-r2.mjs")?.sha256 !== ART_R2_VALIDATOR_SHA256) {
    errors.push("held ART-R2 validator identity drifted");
  }

  let artifact = null;
  try {
    artifact = patchIdentity ? JSON.parse(patchIdentity.bytes.toString("utf8")) : null;
  } catch {
    errors.push("ART compatibility cannot parse patch artifact");
  }
  const verifyOutput = artifact?.files?.find(row => row.path === "scripts/verify.mjs")?.output;
  const recResult = runGit(["cat-file", "blob", REC_02_VERIFY_BLOB], { allowFailure: true });
  const recVerify = recResult.status === 0 ? Buffer.from(recResult.stdout) : null;
  if (!recVerify || gitObjectOid("blob", recVerify) !== REC_02_VERIFY_BLOB || sha256(recVerify) !== REC_02_VERIFY_SHA256
    || verifyOutput?.blob !== REC_02_VERIFY_BLOB || verifyOutput?.sha256 !== REC_02_VERIFY_SHA256) {
    errors.push("REC-02 verifier output identity drifted before ART transform");
  }
  if (sha256(Buffer.from(applyArtVerifierTransform.toString())) !== ART_R2_TRANSFORM_FUNCTION_SHA256) {
    errors.push("embedded ART transform source drifted");
  }
  let combinedVerify = null;
  try {
    if (baseVerify && heldVerify) {
      const reproduced = Buffer.from(applyArtVerifierTransform(baseVerify.bytes.toString("utf8")), "utf8");
      if (!reproduced.equals(heldVerify.bytes)) errors.push("embedded ART transform does not reproduce held verifier bytes");
    }
    if (recVerify) combinedVerify = Buffer.from(applyArtVerifierTransform(recVerify.toString("utf8")), "utf8");
  } catch (error) {
    errors.push(`embedded ART transform failed closed: ${error.message}`);
  }
  if (!combinedVerify || gitObjectOid("blob", combinedVerify) !== ART_R2_COMBINED_VERIFY_BLOB
    || sha256(combinedVerify) !== ART_R2_COMBINED_VERIFY_SHA256) {
    errors.push("combined REC-02 + ART-R2 verifier identity drifted");
  }

  let combinedTree = null;
  let combinedManifest = null;
  if (errors.length === 0) {
    const parent = mkdtempSync(join(tmpdir(), "sunsplitter-policy-art-"));
    const indexPath = join(parent, "index");
    const env = { GIT_INDEX_FILE: indexPath };
    runGit(["read-tree", FUNCTIONAL_TREE], { env });
    for (const path of paths) {
      const item = fileIdentity(ART_R2_HEAD, path);
      runGit(["update-index", "--add", "--cacheinfo", `${item.mode},${item.blob},${path}`], { env });
    }
    updateIndexBytes(indexPath, "scripts/verify.mjs", combinedVerify);
    combinedTree = gitText(["write-tree"], { env });
    const combinedPaths = changedPaths(GATE_A_BASE_SHA, combinedTree);
    if (combinedPaths.length !== 87 || new Set(combinedPaths).size !== 87) errors.push(`combined ART projection path count ${combinedPaths.length} != 87`);
    combinedManifest = contentManifest(combinedTree, combinedPaths);
    if (combinedTree !== ART_R2_COMBINED_TREE) errors.push(`combined ART projection tree ${combinedTree} != ${ART_R2_COMBINED_TREE}`);
    if (combinedManifest !== ART_R2_COMBINED_MANIFEST_SHA256) errors.push("combined ART projection manifest drifted");
  }
  const result = { errors, combinedTree, combinedManifest, transformSha256: sha256(Buffer.from(applyArtVerifierTransform.toString())) };
  artCompatibilityCache.set(cacheKey, structuredClone(result));
  return result;
}

function workflowSecurityErrors(ref) {
  const errors = [];
  const listing = gitText(["ls-tree", "-r", "--name-only", ref, "--", ".github/workflows"]);
  const names = listing ? listing.split(/\r?\n/).filter(Boolean).sort() : [];
  const expectedNames = [RELEASE_WORKFLOW_PATH, VERIFY_WORKFLOW_PATH].sort();
  if (!sameList(names, expectedNames)) errors.push(`workflow allowlist mismatch: ${names.join(", ") || "<none>"}`);
  const expectedHashes = {
    [RELEASE_WORKFLOW_PATH]: RELEASE_WORKFLOW_SHA256,
    [VERIFY_WORKFLOW_PATH]: VERIFY_WORKFLOW_SHA256
  };
  for (const path of names) {
    const identity = fileIdentity(ref, path);
    if (!identity) {
      errors.push(`${path}: workflow is unreadable`);
      continue;
    }
    if (identity.sha256 !== expectedHashes[path]) errors.push(`${path}: bytes differ from the authorized workflow`);
    const text = identity.bytes.toString("utf8");
    const onBlock = text.match(/^on:\s*\n((?:(?:[ \t]+[^\n]*)?\n)*)/m)?.[1] || "";
    const events = [...onBlock.matchAll(/^  ([a-z_]+):/gm)].map(match => match[1]).sort();
    if (!sameList(events, ["pull_request", "push"])) errors.push(`${path}: trigger set is not exactly pull_request + push`);
    if (/^[ \t]*pull_request_target:/m.test(text) || /^[ \t]*(?:workflow_dispatch|repository_dispatch|release|schedule|deployment):/m.test(text)) {
      errors.push(`${path}: privileged, manual, scheduled, release, or deployment trigger is forbidden`);
    }
    if (/^\s{4,}(?:tags|tags-ignore|paths|paths-ignore):/m.test(text)) errors.push(`${path}: tag or path filters are forbidden`);
    if (/^[ \t]*permissions:[ \t]*(?:write-all|read-all)[ \t]*(?:#.*)?$/m.test(text)) {
      errors.push(`${path}: aggregate write-all/read-all permissions are forbidden`);
    }
    const permissionHeaders = [...text.matchAll(/^([ \t]+)permissions:[^\n]*$/gm)];
    if (permissionHeaders.length !== 0) {
      errors.push(`${path}: job-level permissions are forbidden`);
    }
    const permissionBlocks = [...text.matchAll(/^permissions:\s*\n((?:[ \t]+[^\n]*\n?)*)/gm)];
    if (permissionBlocks.length !== 1 || !/^  contents:\s*read\s*(?:#.*)?$/m.test(permissionBlocks[0]?.[1] || "")) {
      errors.push(`${path}: root permissions are not exactly contents: read`);
    }
    for (const permission of text.matchAll(/^([ \t]+)([a-z-]+):[ \t]*(read|write)[ \t]*(?:#.*)?$/gm)) {
      if (permission[1] !== "  " || permission[2] !== "contents" || permission[3] !== "read") {
        errors.push(`${path}: forbidden permission ${permission[2]}: ${permission[3]}`);
      }
    }
    const actions = [...text.matchAll(/^[ \t]*-?[ \t]*uses:[ \t]*([^\s#]+).*$/gm)].map(match => match[1]);
    for (const action of actions) {
      if (!ALLOWED_ACTIONS.has(action) || !FULL_SHA_RE.test(action.split("@")[1] || "")) {
        errors.push(`${path}: unapproved or mutable action ${action}`);
      }
    }
    const lines = text.split(/\r?\n/);
    const jobsLine = lines.findIndex(line => /^jobs:[ \t]*(?:#.*)?$/.test(line));
    const jobStarts = jobsLine < 0 ? [] : lines.flatMap((line, index) => (
      index > jobsLine && /^  [a-zA-Z0-9_-]+:[ \t]*(?:#.*)?$/.test(line) ? [index] : []
    ));
    if (jobStarts.length === 0) errors.push(`${path}: no explicit jobs were found`);
    const jobNames = jobStarts.map(index => lines[index].trim().split(":", 1)[0]);
    const expectedJobNames = path === RELEASE_WORKFLOW_PATH
      ? ["release-policy"]
      : ["simulation_gate", "simulation_ratchet", "verify"];
    if (!sameList([...jobNames].sort(), [...expectedJobNames].sort())) {
      errors.push(`${path}: workflow job allowlist mismatch`);
    }
    for (let jobIndex = 0; jobIndex < jobStarts.length; jobIndex += 1) {
      const start = jobStarts[jobIndex];
      const end = jobStarts[jobIndex + 1] ?? lines.length;
      const jobName = jobNames[jobIndex];
      const jobText = lines.slice(start, end).join("\n");
      const jobActions = [...jobText.matchAll(/^[ \t]*-?[ \t]*uses:[ \t]*([^\s#]+).*$/gm)].map(match => match[1]);
      const requiresCheckout = path === RELEASE_WORKFLOW_PATH || jobName !== "simulation_gate";
      if (requiresCheckout && (jobActions.filter(action => action === CHECKOUT_ACTION).length !== 1
        || jobActions.filter(action => action === SETUP_NODE_ACTION).length !== 1)) {
        errors.push(`${path}: job ${jobName} must contain each required immutable action exactly once`);
      } else if (!requiresCheckout && jobActions.length !== 0) {
        errors.push(`${path}: actionless gate job ${jobName} contains an action`);
      }
    }
    const checkoutRows = lines.flatMap((line, index) => line.includes(`uses: ${CHECKOUT_ACTION}`) ? [index] : []);
    for (const row of checkoutRows) {
      let end = row + 1;
      while (end < lines.length && !/^      -[ \t]/.test(lines[end])) end += 1;
      const stanza = lines.slice(row, end).join("\n");
      const credentialValues = [...stanza.matchAll(/^[ \t]+persist-credentials:[ \t]*([^\s#]+).*$/gm)].map(match => match[1]);
      const depthValues = [...stanza.matchAll(/^[ \t]+fetch-depth:[ \t]*([^\s#]+).*$/gm)].map(match => match[1]);
      if (!sameList(credentialValues, ["false"]) || !sameList(depthValues, ["0"]) || /^[ \t]+ref:/m.test(stanza)) {
        errors.push(`${path}: checkout stanza is not exactly non-credentialed full-history event checkout`);
      }
    }
    if (!/^\s+persist-credentials:\s*false\s*(?:#.*)?$/m.test(text)) errors.push(`${path}: checkout credentials are not disabled`);
    if (!/^\s+fetch-depth:\s*0\s*(?:#.*)?$/m.test(text)) errors.push(`${path}: full history is not fetched`);
    if (/^\s+ref:/m.test(text)) errors.push(`${path}: checkout ref override is forbidden`);
    if (/^\s+environment:/m.test(text)) errors.push(`${path}: deployment environment is forbidden`);
    if (/\$\{\{\s*secrets\./.test(text)) errors.push(`${path}: secret access is forbidden`);
    if (/^\s*continue-on-error:\s*true/m.test(text) || /\|\|\s*true\b/.test(text)) errors.push(`${path}: failure suppression is forbidden`);
    if (/\b(?:git\s+(?:push|tag)|gh\s+(?:release|api)|netlify\s+(?:build|deploy)|npm\s+publish|itch(?:\.io)?\s+upload|butler\s+push|curl\b[^\n]*(?:--upload-file|-X\s*(?:POST|PUT|PATCH))|wget\b[^\n]*--post)\b/i.test(text)) {
      errors.push(`${path}: mutation, release, deploy, or upload command is forbidden`);
    }
  }
  return errors;
}

function candidateEvidence(ref) {
  const errors = [];
  const commit = commitHeaders(ref);
  if (!commit) return { errors: ["candidate is not an independently framed commit object"] };
  if (!sameList(commit.parents, [GATE_A_BASE_SHA])) errors.push("candidate is not one direct child of the exact Gate A base");
  if (!sameList(changedPaths(GATE_A_BASE_SHA, commit.oid), GATE_A_CHANGED_PATHS)) errors.push("candidate changed paths differ from the exact six-path Gate A scope");
  for (const path of GATE_A_CHANGED_PATHS) {
    const identity = fileIdentity(commit.oid, path);
    if (!identity) errors.push(`${path}: candidate path is missing`);
    else if (identity.mode !== "100644") errors.push(`${path}: candidate mode ${identity.mode} != 100644`);
  }
  for (const [path, expected] of Object.entries(GATE_A_FIXED_SHA256)) {
    const identity = fileIdentity(commit.oid, path);
    if (!identity || identity.sha256 !== expected) errors.push(`${path}: candidate SHA-256 drifted`);
  }
  const projection = policyProjection(commit.oid);
  if (projection !== GATE_A_POLICY_PROJECTION_SHA256) errors.push(`historical Gate A policy projection ${projection || "missing"} != ${GATE_A_POLICY_PROJECTION_SHA256}`);
  const status = fileIdentity(commit.oid, STATUS_PATH);
  if (status) errors.push(...noPublishStatusErrors(status.bytes));
  errors.push(...workflowSecurityErrors(commit.oid));
  const projectionEvidence = validateProjectionArtifacts(commit.oid);
  errors.push(...projectionEvidence.errors);
  const artEvidence = validateArtCompatibility(commit.oid);
  errors.push(...artEvidence.errors);

  const records = canonicalRecords(commit.tree, GATE_A_CHANGED_PATHS);
  if (records.some(record => !record)) errors.push("candidate canonical manifest contains an unreadable path");
  let expectedRaw = null;
  let expectedOid = null;
  let manifest = null;
  if (records.every(Boolean)) {
    manifest = canonicalManifest(records);
    expectedRaw = canonicalRawCommit(commit.tree, GATE_A_BASE_SHA, GATE_A_AUTHOR, GATE_A_COMMIT_TITLE, records);
    expectedOid = gitObjectOid("commit", expectedRaw);
    if (!commit.bytes.equals(expectedRaw)) errors.push("candidate raw commit payload differs from the exact canonical frame");
    if (commit.oid !== expectedOid) errors.push(`candidate OID ${commit.oid} != independently framed ${expectedOid}`);
  }
  return {
    errors,
    oid: commit.oid,
    tree: commit.tree,
    parent: commit.parents[0],
    rawSha256: sha256(commit.bytes),
    expectedOid,
    manifest,
    manifestSha256: manifest ? sha256(Buffer.from(manifest)) : null,
    projectionEvidence,
    artEvidence
  };
}

function mergeEvidence(ref, firstParent, secondEvidence) {
  const errors = [];
  const merge = commitHeaders(ref);
  if (!merge) return { errors: ["merge is not an independently framed commit object"] };
  if (!sameList(merge.parents, [firstParent, secondEvidence.oid])) errors.push("merge parents differ from the exact ordered base/head pair");
  if (merge.tree !== secondEvidence.tree) errors.push("merge tree differs from the exact candidate tree");
  if (secondEvidence.errors.length) errors.push(...secondEvidence.errors.map(error => `candidate: ${error}`));
  return { errors, oid: merge.oid, tree: merge.tree, parents: merge.parents, rawSha256: sha256(merge.bytes) };
}

function gateAMergeEvidence(ref) {
  const merge = commitHeaders(ref);
  if (!merge || merge.parents.length !== 2 || merge.parents[0] !== GATE_A_BASE_SHA) {
    return { errors: ["protected Gate A successor is not an exact two-parent merge from the pinned base"] };
  }
  const exactErrors = [];
  if (merge.oid !== GATE_A_MERGE_SHA) exactErrors.push(`protected Gate A successor ${merge.oid} != ${GATE_A_MERGE_SHA}`);
  if (merge.tree !== GATE_A_MERGE_TREE) exactErrors.push(`protected Gate A successor tree ${merge.tree} != ${GATE_A_MERGE_TREE}`);
  if (!sameList(merge.parents, [GATE_A_BASE_SHA, GATE_A_HEAD_SHA])) exactErrors.push("protected Gate A successor parents differ from the exact landed pair");
  const candidate = candidateEvidence(merge.parents[1]);
  const evidence = mergeEvidence(merge.oid, GATE_A_BASE_SHA, candidate);
  return { ...evidence, errors: [...exactErrors, ...evidence.errors] };
}

function policyCorrectionEvidence(ref) {
  const errors = [];
  const base = gateAMergeEvidence(GATE_A_MERGE_SHA);
  if (base.errors.length) errors.push(...base.errors.map(error => `correction base: ${error}`));
  const commit = commitHeaders(ref);
  if (!commit) return { errors: [...errors, "policy correction candidate is not an independently framed commit object"] };
  if (commit.oid === FAILED_POLICY_CORRECTION_C1_HEAD || commit.tree === FAILED_POLICY_CORRECTION_C1_TREE) {
    errors.push("failed policy correction C1 identity is non-reusable");
  }
  if (commit.oid === FAILED_POLICY_CORRECTION_C2_HEAD || commit.tree === FAILED_POLICY_CORRECTION_C2_TREE) {
    errors.push("failed policy correction C2 identity is non-reusable");
  }
  if (!sameList(commit.parents, [GATE_A_MERGE_SHA])) errors.push("policy correction candidate is not one direct child of the exact protected Gate A successor");
  if (!sameList(changedPaths(GATE_A_MERGE_SHA, commit.oid), POLICY_CORRECTION_CHANGED_PATHS)) {
    errors.push("policy correction changed paths differ from the exact three-path scope");
  }
  for (const path of POLICY_CORRECTION_CHANGED_PATHS) {
    const identity = fileIdentity(commit.oid, path);
    if (!identity) errors.push(`${path}: policy correction path is missing`);
    else if (identity.mode !== "100644") errors.push(`${path}: policy correction mode ${identity.mode} != 100644`);
  }
  const status = fileIdentity(commit.oid, STATUS_PATH);
  if (!status || status.blob !== POLICY_CORRECTION_STATUS_BLOB || status.sha256 !== POLICY_CORRECTION_STATUS_SHA256
    || status.byteLength !== POLICY_CORRECTION_STATUS_BYTES) {
    errors.push(`${STATUS_PATH}: policy correction identity drifted`);
  }
  const record = fileIdentity(commit.oid, POLICY_CORRECTION_RECORD_PATH);
  if (!record || record.blob !== POLICY_CORRECTION_RECORD_BLOB || record.sha256 !== POLICY_CORRECTION_RECORD_SHA256
    || record.byteLength !== POLICY_CORRECTION_RECORD_BYTES) {
    errors.push(`${POLICY_CORRECTION_RECORD_PATH}: policy correction identity drifted`);
  }
  const projection = policyProjection(commit.oid);
  if (projection !== POLICY_PROJECTION_SHA256) {
    errors.push(`corrected policy projection ${projection || "missing"} != ${POLICY_PROJECTION_SHA256}`);
  }
  if (status) errors.push(...noPublishStatusErrors(status.bytes));
  errors.push(...workflowSecurityErrors(commit.oid));
  errors.push(...validateProjectionArtifacts(commit.oid).errors);
  errors.push(...validateArtCompatibility(commit.oid).errors);

  const records = canonicalRecords(commit.tree, POLICY_CORRECTION_CHANGED_PATHS);
  if (records.some(record => !record)) errors.push("policy correction canonical manifest contains an unreadable path");
  let expectedRaw = null;
  let expectedOid = null;
  let manifest = null;
  if (records.every(Boolean)) {
    manifest = canonicalManifest(records);
    expectedRaw = canonicalRawCommit(
      commit.tree,
      GATE_A_MERGE_SHA,
      POLICY_CORRECTION_AUTHOR,
      POLICY_CORRECTION_COMMIT_TITLE,
      records
    );
    expectedOid = gitObjectOid("commit", expectedRaw);
    if (!commit.bytes.equals(expectedRaw)) errors.push("policy correction raw commit payload differs from the exact canonical frame");
    if (commit.oid !== expectedOid) errors.push(`policy correction OID ${commit.oid} != independently framed ${expectedOid}`);
  }
  return {
    errors,
    oid: commit.oid,
    tree: commit.tree,
    parent: commit.parents[0],
    rawSha256: sha256(commit.bytes),
    expectedOid,
    manifest,
    manifestSha256: manifest ? sha256(Buffer.from(manifest)) : null
  };
}

function policyCorrectionMergeEvidence(ref) {
  const merge = commitHeaders(ref);
  if (!merge || merge.parents.length !== 2 || merge.parents[0] !== GATE_A_MERGE_SHA) {
    return { errors: ["protected policy correction successor is not an exact two-parent merge from the pinned Gate A successor"] };
  }
  const candidate = policyCorrectionEvidence(merge.parents[1]);
  return mergeEvidence(merge.oid, GATE_A_MERGE_SHA, candidate);
}

function replaceUniqueStatusField(text, key, value) {
  const pattern = new RegExp("`" + key + ":\\s*([^`]+)`", "g");
  const matches = [...text.matchAll(pattern)];
  if (matches.length !== 1) throw new Error(`future STATUS source field ${key} occurs ${matches.length} time(s)`);
  return text.replace(pattern, `\`${key}: ${value}\``);
}

function expectedFutureStatus(protectedMerge) {
  const merge = commitHeaders(protectedMerge);
  if (!merge) throw new Error("future STATUS base is not a commit");
  const correction = policyCorrectionMergeEvidence(protectedMerge);
  if (correction.errors.length) throw new Error(`future STATUS base is not an exact policy correction successor: ${correction.errors.join(" | ")}`);
  const status = fileIdentity(protectedMerge, STATUS_PATH);
  if (!status || status.blob !== POLICY_CORRECTION_STATUS_BLOB || status.sha256 !== POLICY_CORRECTION_STATUS_SHA256
    || status.byteLength !== POLICY_CORRECTION_STATUS_BYTES) {
    throw new Error("future STATUS source is not exact policy correction STATUS");
  }
  let text = status.bytes.toString("utf8");
  text = replaceUniqueStatusField(text, "updated_utc", "2026-08-25");
  text = replaceOnce(
    text,
    `\`tested_runtime_sha: ${GATE_A_MERGE_SHA}\` (exact protected REC-RATCHET-02 successor; recovery evidence, not certification)`,
    `\`tested_runtime_sha: ${protectedMerge}\` (exact protected policy-correction successor; recovery evidence, not certification)`,
    "future STATUS tested runtime"
  );
  text = replaceUniqueStatusField(text, "governed_recovery_successor_sha", protectedMerge);
  text = replaceUniqueStatusField(text, "milestone", "REC-02 / L-021 — exact inactive projection activation");
  text = replaceUniqueStatusField(text, "ticket", "REC-02 / issue #24 — governed zero-exit implementation");
  text = replaceUniqueStatusField(text, "state", `REC-02 R2 CANDIDATE — exact policy-correction successor ${protectedMerge}; NO-PUBLISH / NOT CERTIFIED`);
  text = replaceUniqueStatusField(text, "implementation_branch", FUTURE_BRANCH);
  text = replaceUniqueStatusField(text, "fresh_rec_02_branch", `${FUTURE_BRANCH} — CONSTRUCTED FROM exact protected policy-correction successor ${protectedMerge}; draft-only and unmerged`);
  text = replaceUniqueStatusField(text, "dispatch_base_sha", protectedMerge);
  text = replaceUniqueStatusField(text, "dispatch_base_tree", merge.tree);
  text = replaceUniqueStatusField(text, "functional_projection_state", "ACTIVATED — exact pinned patch and baseline applied; full exact-head verifier and locked simulations must pass again");
  text = replaceUniqueStatusField(text, "active_simulation_baseline_sha256", `${INACTIVE_BASELINE_SHA256} — exact REC-02 baseline activated from the Gate A artifact`);
  text = replaceOnce(
    text,
    "`policy_correction_scope: exactly artifacts/PROJECT_STATUS.md; artifacts/REC-RATCHET-02_POLICY_SELFTEST_CORRECTION.md; scripts/release-policy.mjs`",
    "`policy_correction_scope: LANDED PRECURSOR — exact three-path correction retained as evidence`\n`policy_correction_record: artifacts/REC-RATCHET-02_POLICY_SELFTEST_CORRECTION.md — inherited immutable failure and supersession evidence`\n`rec_02_scope: exactly artifacts/PROJECT_STATUS.md; scripts/fixtures/pipe-boot-r1-simulation-baseline.json; scripts/verify.mjs; src/scenes-02.js; src/scenes-04.js; src/scenes-05.js; src/scenes-06.js; src/scenes-13.js; src/scenes-36.js; src/scenes-55.js`",
    "future STATUS active scope"
  );
  text = replaceOnce(
    text,
    `- REC-RATCHET-02 landed through protected PR #29 at exact successor \`${GATE_A_MERGE_SHA}\`; that Gate A authorization is consumed.`,
    `- REC-RATCHET-02 landed through protected PR #29 at exact successor \`${GATE_A_MERGE_SHA}\`; that Gate A authorization is consumed.\n- The policy self-test correction landed at exact protected successor \`${protectedMerge}\`; that correction authorization is consumed.`,
    "future STATUS correction blocker"
  );
  text = replaceOnce(
    text,
    "- Fresh REC-02 construction is blocked. After a separately authorized correction merge, issue #24 must be repinned to that exact protected successor and all REC-02 STATUS, parent, tree, manifest, raw-payload, and OID identities must be freshly derived on `ticket/0.30.1-rec-02-r2`.",
    `- REC-02 r2 is an exact candidate only. Construction requires separate readback that issue #24 was repinned to \`${protectedMerge}\`; its protected merge remains unauthorized pending exact-head checks, independent read-only PASS, fresh privileged ruleset/ref readback, and separate owner authorization.`,
    "future STATUS REC-02 blocker"
  );
  text = replaceOnce(
    text,
    "**Manraj:** Authorize the newly sealed exact local correction candidate branch to be pushed and exactly one draft pull request to be opened against `recovery/e4f8440-nopub`. This grants no ready transition, merge, REC-02 construction, deployment, release, publication, or certification authority. `NO-PUBLISH / NOT CERTIFIED` remains active.",
    "**Manraj:** After the REC-02 r2 draft PR exists, send its exact head/tree and builder receipt to Grok for independent read-only review. Do not mark ready or merge. `NO-PUBLISH / NOT CERTIFIED` remains active.",
    "future STATUS next action"
  );
  return Buffer.from(text, "utf8");
}

const futureTreeCache = new Map();

function buildFutureTree(protectedMerge) {
  if (futureTreeCache.has(protectedMerge)) return futureTreeCache.get(protectedMerge);
  const patchIdentity = fileIdentity(protectedMerge, PATCH_ARTIFACT_PATH);
  const baselineIdentity = fileIdentity(protectedMerge, INACTIVE_BASELINE_PATH);
  if (!patchIdentity || !baselineIdentity) throw new Error("future projection artifacts are missing");
  const artifact = JSON.parse(patchIdentity.bytes.toString("utf8"));
  const parent = mkdtempSync(join(tmpdir(), "sunsplitter-policy-future-"));
  const indexPath = join(parent, "index");
  const env = { GIT_INDEX_FILE: indexPath };
  runGit(["read-tree", protectedMerge], { env });
  const applied = runGit(["apply", "--cached", "--whitespace=error-all", "--verbose", "-"], {
    env,
    input: Buffer.from(artifact.patch.unifiedDiff, "utf8"),
    allowFailure: true
  });
  const transcript = Buffer.concat([Buffer.from(applied.stdout || ""), Buffer.from(applied.stderr || "")]).toString("utf8");
  if (applied.status !== 0 || /\b(?:offset|fuzz)\b/i.test(transcript)) throw new Error(`future strict patch application failed: ${transcript.trim()}`);
  updateIndexBytes(indexPath, ACTIVE_BASELINE_PATH, baselineIdentity.bytes);
  updateIndexBytes(indexPath, STATUS_PATH, expectedFutureStatus(protectedMerge));
  const tree = gitText(["write-tree"], { env });
  const result = { tree, transcript, status: expectedFutureStatus(protectedMerge) };
  futureTreeCache.set(protectedMerge, result);
  return result;
}

function futureEvidence(ref, protectedMerge) {
  const errors = [];
  const baseEvidence = policyCorrectionMergeEvidence(protectedMerge);
  if (baseEvidence.errors.length) errors.push(...baseEvidence.errors.map(error => `future base: ${error}`));
  const commit = commitHeaders(ref);
  if (!commit) return { errors: [...errors, "future REC-02 candidate is not an independently framed commit object"] };
  if (commit.oid === FAILED_REC_02_R1_HEAD || commit.tree === FAILED_REC_02_R1_TREE) errors.push("failed REC-02 r1 identity is non-reusable");
  if (!sameList(commit.parents, [protectedMerge])) errors.push("future REC-02 candidate is not one direct child of the exact protected policy correction successor");
  if (!sameList(changedPaths(protectedMerge, commit.oid), FUTURE_CHANGED_PATHS)) errors.push("future REC-02 changed paths differ from the exact ten-path activation scope");
  let expectedTree;
  try {
    expectedTree = buildFutureTree(protectedMerge);
    if (commit.tree !== expectedTree.tree) errors.push(`future REC-02 tree ${commit.tree} != mechanically projected ${expectedTree.tree}`);
  } catch (error) {
    errors.push(error.message);
  }

  const patchIdentity = fileIdentity(protectedMerge, PATCH_ARTIFACT_PATH);
  const baselineIdentity = fileIdentity(protectedMerge, INACTIVE_BASELINE_PATH);
  let artifact = null;
  try {
    artifact = patchIdentity ? JSON.parse(patchIdentity.bytes.toString("utf8")) : null;
  } catch {
    errors.push("future patch artifact is not valid JSON");
  }
  if (artifact) {
    for (const row of artifact.files || []) {
      const output = fileIdentity(commit.oid, row.path);
      if (!output || output.mode !== row.output?.mode || output.blob !== row.output?.blob
        || output.sha256 !== row.output?.sha256 || output.byteLength !== row.output?.byteLength) {
        errors.push(`${row.path}: future exact output identity drifted`);
      }
    }
  }
  const active = fileIdentity(commit.oid, ACTIVE_BASELINE_PATH);
  if (!active || !baselineIdentity || active.mode !== baselineIdentity.mode || active.blob !== baselineIdentity.blob
    || active.sha256 !== baselineIdentity.sha256 || active.byteLength !== baselineIdentity.byteLength) {
    errors.push("future active baseline is not the exact authorized inactive baseline bytes");
  }
  const status = fileIdentity(commit.oid, STATUS_PATH);
  if (!status || !expectedTree || !status.bytes.equals(expectedTree.status)) errors.push("future STATUS is not the exact separately authored structural transition");
  if (status) errors.push(...noPublishStatusErrors(status.bytes));
  if (policyProjection(commit.oid) !== POLICY_PROJECTION_SHA256) errors.push("future REC-02 policy projection drifted");
  errors.push(...workflowSecurityErrors(commit.oid));
  errors.push(...validateProjectionArtifacts(commit.oid).errors);

  const records = canonicalRecords(commit.tree, FUTURE_CHANGED_PATHS);
  let manifest = null;
  let expectedRaw = null;
  let expectedOid = null;
  if (records.some(record => !record)) errors.push("future REC-02 canonical manifest contains an unreadable path");
  else {
    manifest = canonicalManifest(records);
    expectedRaw = canonicalRawCommit(commit.tree, protectedMerge, FUTURE_AUTHOR, FUTURE_COMMIT_TITLE, records);
    expectedOid = gitObjectOid("commit", expectedRaw);
    if (!commit.bytes.equals(expectedRaw)) errors.push("future REC-02 raw commit payload differs from the exact canonical frame");
    if (commit.oid !== expectedOid) errors.push(`future REC-02 OID ${commit.oid} != independently framed ${expectedOid}`);
  }
  return {
    errors,
    oid: commit.oid,
    tree: commit.tree,
    parent: protectedMerge,
    rawSha256: sha256(commit.bytes),
    expectedOid,
    manifest,
    manifestSha256: manifest ? sha256(Buffer.from(manifest)) : null
  };
}

function futureMergeEvidence(ref, protectedMerge) {
  const merge = commitHeaders(ref);
  if (!merge || merge.parents.length !== 2 || merge.parents[0] !== protectedMerge) {
    return { errors: ["protected REC-02 successor is not an exact two-parent merge from the policy correction successor"] };
  }
  const candidate = futureEvidence(merge.parents[1], protectedMerge);
  return mergeEvidence(merge.oid, protectedMerge, candidate);
}

function evaluatePolicy(facts) {
  const errors = [];
  const notices = [
    "NO-PUBLISH / NOT CERTIFIED remains active.",
    "Rulesets 21051662 and 21051665, explicit bypass_actors: [], Netlify controls, and merge-time ref identity require a fresh owner-authenticated read before any separately authorized protected merge.",
    "This workflow grants no merge, ready-for-review, rerun, deployment, release, tag, publication, certification, or external-write authority."
  ];
  let route = null;
  let evidence = null;

  if (facts.repository !== EXPECTED_REPOSITORY) errors.push(`repository ${facts.repository || "<missing>"} != ${EXPECTED_REPOSITORY}`);
  if (!FULL_SHA_RE.test(facts.sha || "")) errors.push("event SHA is not a full SHA-1");
  if (facts.checkedOutSha !== facts.sha) errors.push(`checked-out SHA ${facts.checkedOutSha || "<missing>"} != event SHA ${facts.sha || "<missing>"}`);
  if (facts.refType === "tag" || (facts.ref || "").startsWith("refs/tags/")) errors.push("tag creation or evaluation is forbidden");

  if (facts.eventName === "pull_request") {
    if (facts.baseRef === "main") errors.push("all pull requests to main are blocked while NO-PUBLISH is active");
    if (facts.baseRef !== RECOVERY_BRANCH) errors.push(`pull-request base ${facts.baseRef || "<missing>"} != ${RECOVERY_BRANCH}`);
    if (facts.prHeadRepository !== EXPECTED_REPOSITORY) errors.push(`pull-request head repository ${facts.prHeadRepository || "<missing>"} != ${EXPECTED_REPOSITORY}`);
    if (!FULL_SHA_RE.test(facts.prBaseSha || "") || !FULL_SHA_RE.test(facts.prHeadSha || "")) errors.push("pull-request base/head SHA is not a full SHA-1 pair");
    if (facts.headRef === POLICY_CORRECTION_BRANCH) {
      route = "rec-ratchet-02-policy-correction";
      if (facts.prBaseSha !== GATE_A_MERGE_SHA) {
        errors.push(`policy correction pull-request base ${facts.prBaseSha || "<missing>"} != ${GATE_A_MERGE_SHA}`);
      }
      evidence = policyCorrectionEvidence(facts.prHeadSha);
      const merge = mergeEvidence(facts.sha, GATE_A_MERGE_SHA, evidence);
      errors.push(...merge.errors);
    } else if (facts.headRef === FUTURE_BRANCH) {
      route = "rec-02";
      evidence = futureEvidence(facts.prHeadSha, facts.prBaseSha);
      const merge = mergeEvidence(facts.sha, facts.prBaseSha, evidence);
      errors.push(...merge.errors);
    } else if (facts.headRef === GATE_A_BRANCH) {
      errors.push("REC-RATCHET-02 Gate A route is consumed");
    } else if (facts.headRef === "ticket/0.30.1-rec-02-r1") {
      errors.push("REC-02 r1 route is failed and non-reusable");
    } else {
      errors.push(`pull-request head ${facts.headRef || "<missing>"} is not an armed recovery route`);
    }
  } else if (facts.eventName === "push") {
    if (facts.ref !== `refs/heads/${RECOVERY_BRANCH}` || facts.refName !== RECOVERY_BRANCH || facts.refType !== "branch") {
      errors.push("push is not an exact protected recovery-branch event");
    }
    if (facts.sha !== facts.afterSha) errors.push("push event SHA differs from after SHA");
    if (facts.beforeSha === GATE_A_MERGE_SHA) {
      route = "rec-ratchet-02-policy-correction-merge";
      evidence = policyCorrectionMergeEvidence(facts.afterSha);
      errors.push(...evidence.errors);
    } else {
      const base = policyCorrectionMergeEvidence(facts.beforeSha);
      if (base.errors.length === 0) {
        route = "rec-02-merge";
        evidence = futureMergeEvidence(facts.afterSha, facts.beforeSha);
        errors.push(...evidence.errors);
      } else {
        errors.push("push before SHA is not the one unconsumed exact recovery anchor");
      }
    }
  } else {
    errors.push(`event ${facts.eventName || "<missing>"} is not authorized`);
  }

  return { passed: errors.length === 0, errors, notices, route, evidence };
}

function environmentFromProcess() {
  return {
    eventName: process.env.POLICY_EVENT_NAME || "",
    repository: process.env.POLICY_REPOSITORY || "",
    sha: process.env.POLICY_SHA || "",
    checkedOutSha: gitText(["rev-parse", "HEAD"]),
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

function writeBlob(bytes) {
  return gitText(["hash-object", "-w", "--stdin"], { input: bytes });
}

function writeRawCommit(bytes) {
  const result = runGit(["hash-object", "--literally", "-t", "commit", "-w", "--stdin"], { input: bytes });
  const oid = Buffer.from(result.stdout).toString("utf8").trim();
  assert.equal(oid, gitObjectOid("commit", bytes));
  return oid;
}

function writeRawTag(bytes) {
  const result = runGit(["hash-object", "--literally", "-t", "tag", "-w", "--stdin"], { input: bytes });
  const oid = Buffer.from(result.stdout).toString("utf8").trim();
  assert.equal(oid, gitObjectOid("tag", bytes));
  return oid;
}

function treeWithOverrides(baseRef, overrides) {
  const parent = mkdtempSync(join(tmpdir(), "sunsplitter-policy-tree-"));
  const indexPath = join(parent, "index");
  const env = { GIT_INDEX_FILE: indexPath };
  runGit(["read-tree", baseRef], { env });
  for (const [path, value] of Object.entries(overrides)) {
    if (value === null) {
      runGit(["update-index", "--force-remove", "--", path], { env });
      continue;
    }
    const bytes = Buffer.isBuffer(value) ? value : Buffer.from(value.bytes);
    updateIndexBytes(indexPath, path, bytes, value.mode || "100644");
  }
  return gitText(["write-tree"], { env });
}

function historicalGateAFixture() {
  const commit = commitHeaders(GATE_A_HEAD_SHA);
  assert.ok(commit);
  assert.equal(commit.oid, GATE_A_HEAD_SHA);
  assert.equal(commit.tree, GATE_A_HEAD_TREE);
  assert.deepEqual(commit.parents, [GATE_A_BASE_SHA]);
  assert.equal(sha256(commit.bytes), GATE_A_HEAD_RAW_SHA256);
  const records = canonicalRecords(commit.tree, GATE_A_CHANGED_PATHS);
  assert.ok(records.every(Boolean));
  const raw = canonicalRawCommit(commit.tree, GATE_A_BASE_SHA, GATE_A_AUTHOR, GATE_A_COMMIT_TITLE, records);
  assert.ok(commit.bytes.equals(raw));
  return { oid: commit.oid, tree: commit.tree, raw: commit.bytes, records };
}

function policyCorrectionFixture() {
  const status = gitBytes(["cat-file", "blob", POLICY_CORRECTION_STATUS_BLOB]);
  const record = gitBytes(["cat-file", "blob", POLICY_CORRECTION_RECORD_BLOB]);
  assert.equal(gitObjectOid("blob", status), POLICY_CORRECTION_STATUS_BLOB);
  assert.equal(sha256(status), POLICY_CORRECTION_STATUS_SHA256);
  assert.equal(status.length, POLICY_CORRECTION_STATUS_BYTES);
  assert.equal(gitObjectOid("blob", record), POLICY_CORRECTION_RECORD_BLOB);
  assert.equal(sha256(record), POLICY_CORRECTION_RECORD_SHA256);
  assert.equal(record.length, POLICY_CORRECTION_RECORD_BYTES);
  const tree = treeWithOverrides(GATE_A_MERGE_SHA, {
    [STATUS_PATH]: status,
    [POLICY_CORRECTION_RECORD_PATH]: record,
    [POLICY_PATH]: readFileSync(resolve(ROOT, POLICY_PATH))
  });
  const records = canonicalRecords(tree, POLICY_CORRECTION_CHANGED_PATHS);
  assert.ok(records.every(Boolean));
  const raw = canonicalRawCommit(
    tree,
    GATE_A_MERGE_SHA,
    POLICY_CORRECTION_AUTHOR,
    POLICY_CORRECTION_COMMIT_TITLE,
    records
  );
  const oid = writeRawCommit(raw);
  return { oid, tree, raw, records };
}

function genericMerge(tree, parents, label) {
  const raw = Buffer.from([
    `tree ${tree}`,
    ...parents.map(parent => `parent ${parent}`),
    `author Sunsplitter Merge Fixture <noreply@openai.com> 1787616000 -0500`,
    `committer Sunsplitter Merge Fixture <noreply@openai.com> 1787616000 -0500`,
    "",
    `${label}\n`
  ].join("\n"), "utf8");
  return { oid: writeRawCommit(raw), raw, tree, parents };
}

function futureFixture(protectedMerge) {
  const projected = buildFutureTree(protectedMerge);
  const records = canonicalRecords(projected.tree, FUTURE_CHANGED_PATHS);
  assert.ok(records.every(Boolean));
  const raw = canonicalRawCommit(projected.tree, protectedMerge, FUTURE_AUTHOR, FUTURE_COMMIT_TITLE, records);
  return { oid: writeRawCommit(raw), raw, tree: projected.tree, records };
}

function prFacts({ sha, base, head, headRef }) {
  return {
    eventName: "pull_request",
    repository: EXPECTED_REPOSITORY,
    sha,
    checkedOutSha: sha,
    ref: "refs/pull/999/merge",
    refName: "999/merge",
    refType: "branch",
    baseRef: RECOVERY_BRANCH,
    headRef,
    prHeadRepository: EXPECTED_REPOSITORY,
    prBaseSha: base,
    prHeadSha: head,
    beforeSha: "",
    afterSha: ""
  };
}

function pushFacts({ before, after }) {
  return {
    eventName: "push",
    repository: EXPECTED_REPOSITORY,
    sha: after,
    checkedOutSha: after,
    ref: `refs/heads/${RECOVERY_BRANCH}`,
    refName: RECOVERY_BRANCH,
    refType: "branch",
    baseRef: "",
    headRef: "",
    prHeadRepository: "",
    prBaseSha: "",
    prHeadSha: "",
    beforeSha: before,
    afterSha: after
  };
}

function expectPolicyFailure(facts, mutate, needle) {
  const altered = structuredClone(facts);
  mutate(altered);
  const result = evaluatePolicy(altered);
  assert.equal(result.passed, false, `policy unexpectedly accepted ${needle}`);
  assert.ok(result.errors.some(error => error.includes(needle)), `missing ${needle}: ${result.errors.join(" | ")}`);
}

function selfTest() {
  assert.ok(FULL_SHA256_RE.test(POLICY_PROJECTION_SHA256) && !/^0+$/.test(POLICY_PROJECTION_SHA256));
  assert.ok(FULL_SHA256_RE.test(GATE_A_POLICY_PROJECTION_SHA256) && !/^0+$/.test(GATE_A_POLICY_PROJECTION_SHA256));
  assert.ok(FULL_SHA256_RE.test(TRANSITION_SHA256) && !/^0+$/.test(TRANSITION_SHA256));
  assert.equal(sha256(normalizedPolicyBytes(readFileSync(resolve(ROOT, POLICY_PATH)))), POLICY_PROJECTION_SHA256);
  assert.deepEqual(GATE_A_CHANGED_PATHS, [
    VERIFY_WORKFLOW_PATH, STATUS_PATH, INACTIVE_BASELINE_PATH, PATCH_ARTIFACT_PATH, TRANSITION_PATH, POLICY_PATH
  ].sort());
  assert.deepEqual(POLICY_CORRECTION_CHANGED_PATHS, [STATUS_PATH, POLICY_CORRECTION_RECORD_PATH, POLICY_PATH].sort());
  assert.equal(FUTURE_CHANGED_PATHS.length, 10);

  const candidate = historicalGateAFixture();
  const candidateEvidenceResult = candidateEvidence(candidate.oid);
  assert.deepEqual(candidateEvidenceResult.errors, []);
  assert.equal(candidateEvidenceResult.rawSha256, GATE_A_HEAD_RAW_SHA256);
  assert.equal(policyProjection(candidate.oid), GATE_A_POLICY_PROJECTION_SHA256);
  assert.deepEqual(gateAMergeEvidence(GATE_A_MERGE_SHA).errors, []);
  const normalized = normalizedSimulationEvidence(candidateEvidenceResult.projectionEvidence.baseline);
  assert.equal(normalized.core, NORMALIZED_SIMULATION_SHA256);
  assert.deepEqual(normalized.policies, NORMALIZED_POLICY_SHA256);
  const normalizedDrift = structuredClone(candidateEvidenceResult.projectionEvidence.baseline);
  normalizedDrift.policies.random.totalSteps += 1;
  assert.notEqual(normalizedSimulationEvidence(normalizedDrift).core, NORMALIZED_SIMULATION_SHA256);
  assert.deepEqual(candidateEvidenceResult.artEvidence.errors, []);
  assert.equal(candidateEvidenceResult.artEvidence.combinedTree, ART_R2_COMBINED_TREE);
  assert.throws(
    () => applyArtVerifierTransform(fileIdentity(GATE_A_BASE_SHA, "scripts/verify.mjs").bytes.toString("utf8").replace("./simulate.mjs", "./simulate-drift.mjs")),
    /ART import anchor count is not exactly one/
  );
  const synthetic = genericMerge(candidate.tree, [GATE_A_BASE_SHA, candidate.oid], "Synthetic Gate A merge fixture");
  const candidatePr = prFacts({ sha: synthetic.oid, base: GATE_A_BASE_SHA, head: candidate.oid, headRef: GATE_A_BRANCH });
  assert.ok(evaluatePolicy(candidatePr).errors.some(error => error.includes("Gate A route is consumed")));
  const candidatePush = pushFacts({ before: GATE_A_BASE_SHA, after: synthetic.oid });
  assert.equal(evaluatePolicy(candidatePush).passed, false);

  const correction = policyCorrectionFixture();
  const correctionEvidenceResult = policyCorrectionEvidence(correction.oid);
  assert.deepEqual(correctionEvidenceResult.errors, []);
  assert.notEqual(correction.oid, FAILED_POLICY_CORRECTION_C1_HEAD);
  assert.notEqual(correction.tree, FAILED_POLICY_CORRECTION_C1_TREE);
  assert.notEqual(correction.oid, FAILED_POLICY_CORRECTION_C2_HEAD);
  assert.notEqual(correction.tree, FAILED_POLICY_CORRECTION_C2_TREE);
  const correctionSynthetic = genericMerge(
    correction.tree,
    [GATE_A_MERGE_SHA, correction.oid],
    "Synthetic policy correction merge fixture"
  );
  const correctionPr = prFacts({
    sha: correctionSynthetic.oid,
    base: GATE_A_MERGE_SHA,
    head: correction.oid,
    headRef: POLICY_CORRECTION_BRANCH
  });
  assert.deepEqual(evaluatePolicy(correctionPr).errors, []);
  assert.deepEqual(evaluatePolicy(pushFacts({ before: GATE_A_MERGE_SHA, after: correctionSynthetic.oid })).errors, []);

  let rejected = 0;
  let structuredRejected = 0;
  const historicalMergeVariants = [
    genericMerge(candidate.tree, [GATE_A_BASE_SHA], "historical Gate A one-parent fixture"),
    genericMerge(candidate.tree, [candidate.oid, GATE_A_BASE_SHA], "historical Gate A swapped parents fixture"),
    genericMerge(candidate.tree, [GATE_A_BASE_SHA, candidate.oid, RECOVERY_BASE_SHA], "historical Gate A octopus fixture"),
    genericMerge(GATE_A_BASE_TREE, [GATE_A_BASE_SHA, candidate.oid], "historical Gate A wrong tree fixture"),
    genericMerge(candidate.tree, [GATE_A_BASE_SHA, candidate.oid], "historical Gate A alternate merge identity fixture")
  ];
  for (const fixture of historicalMergeVariants) {
    assert.ok(gateAMergeEvidence(fixture.oid).errors.length > 0, "invalid historical Gate A merge evidence was accepted");
    structuredRejected += 1;
  }
  const rejectRaw = (bytes, label) => {
    const oid = writeRawCommit(bytes);
    const result = candidateEvidence(oid);
    assert.ok(result.errors.length > 0, `altered raw commit accepted: ${label}`);
    rejected += 1;
  };
  const validText = candidate.raw.toString("utf8");
  const manifestLines = canonicalManifest(candidate.records).trimEnd().split("\n");
  const swappedManifest = [manifestLines[1], manifestLines[0], ...manifestLines.slice(2)].join("\n") + "\n";
  const canonicalManifestText = canonicalManifest(candidate.records);
  const namedRawMutations = [
    [candidate.raw.subarray(0, candidate.raw.length - 1), "missing terminal LF"],
    [Buffer.concat([candidate.raw, Buffer.from("\n")]), "extra terminal LF"],
    [Buffer.from(validText.replaceAll("\n", "\r\n")), "CRLF frame"],
    [Buffer.from(validText.replace(GATE_A_COMMIT_TITLE, `${GATE_A_COMMIT_TITLE}.`)), "title"],
    [Buffer.from(validText.replace(NO_PUBLISH_TOKEN, "NO-PUBLISH / CERTIFIED")), "certification token"],
    [Buffer.from(validText.replace("Canonical manifest", "canonical manifest")), "manifest header"],
    [Buffer.from(validText.replace("author Sunsplitter", "author Altered")), "author identity"],
    [Buffer.from(validText.replace("committer Sunsplitter", "committer Altered")), "committer identity"],
    [Buffer.from(validText.replace("1787443200", "1787443201")), "author timestamp"],
    [Buffer.from(validText.replace(`author ${GATE_A_AUTHOR}`, `author ${GATE_A_AUTHOR.replace("-0500", "+0000")}`)), "author timezone"],
    [Buffer.from(validText.replace(`committer ${GATE_A_AUTHOR}`, `committer ${GATE_A_AUTHOR.replace("1787443200", "1787443201")}`)), "committer timestamp"],
    [Buffer.from(validText.replace(`committer ${GATE_A_AUTHOR}`, `committer ${GATE_A_AUTHOR.replace("-0500", "+0000")}`)), "committer timezone"],
    [Buffer.from(validText.replaceAll("-0500", "+0000")), "timezone"],
    [Buffer.from(validText.replace(`parent ${GATE_A_BASE_SHA}`, `parent ${RECOVERY_BASE_SHA}`)), "parent"],
    [Buffer.from(validText.replace(`parent ${GATE_A_BASE_SHA}`, `parent ${GATE_A_BASE_SHA}\nparent ${RECOVERY_BASE_SHA}`)), "second parent"],
    [Buffer.from(validText.replace(`tree ${candidate.tree}`, `tree ${GATE_A_BASE_TREE}`)), "tree"],
    [Buffer.from(validText.replace("author ", "encoding UTF-8\nauthor ")), "extra header"],
    [Buffer.from(validText.replace("author ", "x-recovery counterfeit\nauthor ")), "extra generic header"],
    [Buffer.from(validText.replace("author ", "gpgsig counterfeit\nauthor ")), "signature header"],
    [Buffer.from(validText.replace("author ", "gpgsig counterfeit\n continuation\nauthor ")), "multiline signature header"],
    [Buffer.from(validText.replace(`author ${GATE_A_AUTHOR}\ncommitter ${GATE_A_AUTHOR}`, `committer ${GATE_A_AUTHOR}\nauthor ${GATE_A_AUTHOR}`)), "header order"],
    [Buffer.from(validText.replace(`author ${GATE_A_AUTHOR}\n`, "")), "missing author header"],
    [Buffer.from(validText.replace(`author ${GATE_A_AUTHOR}\n`, `author ${GATE_A_AUTHOR}\nauthor ${GATE_A_AUTHOR}\n`)), "duplicate author header"],
    [Buffer.from(validText.replace("100644", "100755")), "manifest mode"],
    [Buffer.from(validText.replace(candidate.records[0].blob, "f".repeat(40))), "manifest blob"],
    [Buffer.from(validText.replace(candidate.records[0].sha256, "f".repeat(64))), "manifest SHA-256"],
    [Buffer.from(validText.replace(candidate.records[0].path, `${candidate.records[0].path}.bak`)), "manifest path"],
    [Buffer.from(validText.replace(canonicalManifestText, canonicalManifestText.replace(`${manifestLines[0]}\n`, ""))), "missing manifest entry"],
    [Buffer.from(validText.replace(canonicalManifestText, `${manifestLines[0]}\n${canonicalManifestText}`)), "duplicate manifest entry"],
    [Buffer.from(validText.replace(canonicalManifestText, `${canonicalManifestText}100644 ${"f".repeat(40)} ${"e".repeat(64)}\tartifacts/EXTRA\n`)), "extra manifest entry"],
    [Buffer.from(validText.replace(canonicalManifestText, swappedManifest)), "reordered manifest"],
    [Buffer.from(validText.replace(`committer ${GATE_A_AUTHOR}\n\n${GATE_A_COMMIT_TITLE}`, `committer ${GATE_A_AUTHOR}\n${GATE_A_COMMIT_TITLE}`)), "missing header-message separator"],
    [Buffer.from(validText.replace(`committer ${GATE_A_AUTHOR}\n\n${GATE_A_COMMIT_TITLE}`, `committer ${GATE_A_AUTHOR}\n\n\n${GATE_A_COMMIT_TITLE}`)), "additional header-message separator"],
    [Buffer.from(validText.replace("\n\n" + NO_PUBLISH_TOKEN, "\n" + NO_PUBLISH_TOKEN)), "message boundary"]
  ];
  for (const [bytes, label] of namedRawMutations) rejectRaw(bytes, label);
  const stride = Math.max(1, Math.floor(candidate.raw.length / 64));
  for (let index = 0; index < candidate.raw.length && rejected < 84; index += stride) {
    const altered = Buffer.from(candidate.raw);
    altered[index] = altered[index] === 0x78 ? 0x79 : 0x78;
    rejectRaw(altered, `byte ${index}`);
  }

  const rejectCorrectionRaw = (bytes, label) => {
    const oid = writeRawCommit(bytes);
    const result = policyCorrectionEvidence(oid);
    assert.ok(result.errors.length > 0, `altered policy correction raw commit accepted: ${label}`);
    structuredRejected += 1;
  };
  const correctionText = correction.raw.toString("utf8");
  const correctionManifest = canonicalManifest(correction.records);
  const correctionManifestLines = correctionManifest.trimEnd().split("\n");
  const correctionRawMutations = [
    [correction.raw.subarray(0, correction.raw.length - 1), "correction missing terminal LF"],
    [Buffer.concat([correction.raw, Buffer.from("\n")]), "correction extra terminal LF"],
    [Buffer.from(correctionText.replaceAll("\n", "\r\n")), "correction CRLF frame"],
    [Buffer.from(correctionText.replace(POLICY_CORRECTION_COMMIT_TITLE, `${POLICY_CORRECTION_COMMIT_TITLE}.`)), "correction title"],
    [Buffer.from(correctionText.replace(NO_PUBLISH_TOKEN, "NO-PUBLISH / CERTIFIED")), "correction certification token"],
    [Buffer.from(correctionText.replace(`parent ${GATE_A_MERGE_SHA}`, `parent ${GATE_A_BASE_SHA}`)), "correction parent"],
    [Buffer.from(correctionText.replace(`parent ${GATE_A_MERGE_SHA}`, `parent ${GATE_A_MERGE_SHA}\nparent ${GATE_A_BASE_SHA}`)), "correction second parent"],
    [Buffer.from(correctionText.replace(`author ${POLICY_CORRECTION_AUTHOR}`, `author Altered Build <noreply@openai.com> 1787529600 -0500`)), "correction author"],
    [Buffer.from(correctionText.replace(`committer ${POLICY_CORRECTION_AUTHOR}`, `committer ${POLICY_CORRECTION_AUTHOR.replace("1787529600", "1787529601")}`)), "correction timestamp"],
    [Buffer.from(correctionText.replace("author ", "gpgsig counterfeit\nauthor ")), "correction signature header"],
    [Buffer.from(correctionText.replace(correctionManifest, correctionManifest.replace(`${correctionManifestLines[0]}\n`, ""))), "correction missing manifest entry"],
    [Buffer.from(correctionText.replace(correctionManifest, `${correctionManifestLines[0]}\n${correctionManifest}`)), "correction duplicate manifest entry"],
    [Buffer.from(correctionText.replace(correctionManifest, [correctionManifestLines[1], correctionManifestLines[0], ...correctionManifestLines.slice(2)].join("\n") + "\n")), "correction reordered manifest"]
  ];
  for (const [bytes, label] of correctionRawMutations) rejectCorrectionRaw(bytes, label);

  const alteredStatusBytes = Buffer.concat([fileIdentity(candidate.tree, STATUS_PATH).bytes, Buffer.from("\n`release_state: PUBLISH`\n")]);
  const alteredStatusTree = treeWithOverrides(candidate.tree, { [STATUS_PATH]: alteredStatusBytes });
  const alteredStatusRecords = canonicalRecords(alteredStatusTree, GATE_A_CHANGED_PATHS);
  rejectRaw(canonicalRawCommit(alteredStatusTree, GATE_A_BASE_SHA, GATE_A_AUTHOR, GATE_A_COMMIT_TITLE, alteredStatusRecords), "self-consistent altered STATUS");
  const alteredWorkflow = Buffer.concat([fileIdentity(candidate.tree, VERIFY_WORKFLOW_PATH).bytes, Buffer.from("\n  workflow_dispatch:\n")]);
  const alteredWorkflowTree = treeWithOverrides(candidate.tree, { [VERIFY_WORKFLOW_PATH]: alteredWorkflow });
  const alteredWorkflowRecords = canonicalRecords(alteredWorkflowTree, GATE_A_CHANGED_PATHS);
  rejectRaw(canonicalRawCommit(alteredWorkflowTree, GATE_A_BASE_SHA, GATE_A_AUTHOR, GATE_A_COMMIT_TITLE, alteredWorkflowRecords), "self-consistent altered workflow");

  const rejectCandidateTree = (tree, label, needle) => {
    const records = canonicalRecords(tree, GATE_A_CHANGED_PATHS);
    const raw = canonicalRawCommit(
      tree,
      GATE_A_BASE_SHA,
      GATE_A_AUTHOR,
      GATE_A_COMMIT_TITLE,
      records.every(Boolean) ? records : candidate.records
    );
    const result = candidateEvidence(writeRawCommit(raw));
    assert.ok(result.errors.length > 0, `self-consistent altered candidate accepted: ${label}`);
    if (needle) assert.ok(result.errors.some(error => error.includes(needle)), `missing ${needle} for ${label}: ${result.errors.join(" | ")}`);
    structuredRejected += 1;
  };

  rejectCandidateTree(
    treeWithOverrides(candidate.tree, {
      [GATE_A_CHANGED_PATHS[0]]: { bytes: fileIdentity(candidate.tree, GATE_A_CHANGED_PATHS[0]).bytes, mode: "100755" }
    }),
    "executable authorized path",
    "candidate mode"
  );
  rejectCandidateTree(treeWithOverrides(candidate.tree, { [GATE_A_CHANGED_PATHS[0]]: null }), "missing authorized path", "candidate path is missing");
  rejectCandidateTree(treeWithOverrides(candidate.tree, { "artifacts/UNAUTHORIZED.md": Buffer.from("unauthorized\n") }), "extra path", "six-path Gate A scope");

  const preservedPaths = [
    "AGENTS.md",
    RELEASE_WORKFLOW_PATH,
    "artifacts/LOCKS.md",
    "artifacts/ROADMAP.md",
    "artifacts/REC-RATCHET-01_BASELINE_TRANSITION.md",
    ACTIVE_BASELINE_PATH,
    "scripts/simulate.mjs",
    "scripts/verify.mjs",
    "src/scenes-01.js",
    "images/abandoned_sealed.jpg",
    "VERSION.md",
    "index.html",
    "netlify.toml"
  ];
  for (const path of preservedPaths) {
    const original = fileIdentity(candidate.tree, path);
    assert.ok(original, `missing preserved fixture path ${path}`);
    rejectCandidateTree(
      treeWithOverrides(candidate.tree, { [path]: Buffer.concat([original.bytes, Buffer.from("\n")]) }),
      `preserved surface ${path}`,
      "six-path Gate A scope"
    );
  }
  const alteredPolicyTree = treeWithOverrides(candidate.tree, {
    [POLICY_PATH]: Buffer.concat([fileIdentity(candidate.tree, POLICY_PATH).bytes, Buffer.from("\n")])
  });
  rejectCandidateTree(alteredPolicyTree, "self-consistent altered policy source", "policy projection");

  const rejectCorrectionTree = (tree, label, needle) => {
    const records = canonicalRecords(tree, POLICY_CORRECTION_CHANGED_PATHS);
    const raw = canonicalRawCommit(
      tree,
      GATE_A_MERGE_SHA,
      POLICY_CORRECTION_AUTHOR,
      POLICY_CORRECTION_COMMIT_TITLE,
      records.every(Boolean) ? records : correction.records
    );
    const result = policyCorrectionEvidence(writeRawCommit(raw));
    assert.ok(result.errors.length > 0, `self-consistent altered policy correction accepted: ${label}`);
    if (needle) {
      assert.ok(result.errors.some(error => error.includes(needle)), `missing ${needle} for ${label}: ${result.errors.join(" | ")}`);
    }
    structuredRejected += 1;
  };
  rejectCorrectionTree(
    treeWithOverrides(correction.tree, {
      [STATUS_PATH]: { bytes: fileIdentity(correction.tree, STATUS_PATH).bytes, mode: "100755" }
    }),
    "executable correction STATUS",
    "policy correction mode"
  );
  rejectCorrectionTree(
    treeWithOverrides(correction.tree, { [POLICY_CORRECTION_RECORD_PATH]: null }),
    "missing correction record",
    "policy correction path is missing"
  );
  rejectCorrectionTree(
    treeWithOverrides(correction.tree, { "artifacts/UNAUTHORIZED-CORRECTION.md": Buffer.from("unauthorized\n") }),
    "extra correction path",
    "three-path scope"
  );
  rejectCorrectionTree(
    treeWithOverrides(correction.tree, {
      [STATUS_PATH]: Buffer.concat([fileIdentity(correction.tree, STATUS_PATH).bytes, Buffer.from("\n")])
    }),
    "altered correction STATUS",
    "policy correction identity"
  );
  rejectCorrectionTree(
    treeWithOverrides(correction.tree, {
      [POLICY_CORRECTION_RECORD_PATH]: Buffer.concat([fileIdentity(correction.tree, POLICY_CORRECTION_RECORD_PATH).bytes, Buffer.from("\n")])
    }),
    "altered correction record",
    "policy correction identity"
  );
  rejectCorrectionTree(
    treeWithOverrides(correction.tree, {
      [POLICY_PATH]: Buffer.concat([fileIdentity(correction.tree, POLICY_PATH).bytes, Buffer.from("\n")])
    }),
    "altered corrected policy",
    "corrected policy projection"
  );

  const rejectWorkflowMutation = (mutate, needle) => {
    const source = fileIdentity(candidate.tree, VERIFY_WORKFLOW_PATH).bytes.toString("utf8");
    const bytes = Buffer.from(mutate(source), "utf8");
    const tree = treeWithOverrides(candidate.tree, { [VERIFY_WORKFLOW_PATH]: bytes });
    const records = canonicalRecords(tree, GATE_A_CHANGED_PATHS);
    const oid = writeRawCommit(canonicalRawCommit(tree, GATE_A_BASE_SHA, GATE_A_AUTHOR, GATE_A_COMMIT_TITLE, records));
    const result = candidateEvidence(oid);
    assert.ok(result.errors.some(error => error.includes(needle)), `workflow fixture missing ${needle}: ${result.errors.join(" | ")}`);
    structuredRejected += 1;
  };
  rejectWorkflowMutation(text => text.replace("contents: read", "contents: read\n  actions: write"), "forbidden permission actions: write");
  rejectWorkflowMutation(text => text.replace("contents: read", "contents: write"), "forbidden permission contents: write");
  rejectWorkflowMutation(text => `${text}\n    permissions: write-all\n`, "aggregate write-all/read-all");
  rejectWorkflowMutation(text => text.replace("  verify:\n", "  verify:\n    permissions: { contents: write }\n"), "job-level permissions are forbidden");
  rejectWorkflowMutation(text => text.replace("  pull_request:\n", "  release:\n    types: [published]\n  pull_request:\n"), "privileged, manual, scheduled, release, or deployment trigger");
  rejectWorkflowMutation(text => text.replace("  push:\n    branches:\n", "  push:\n    tags:\n      - '*'\n    branches:\n"), "tag or path filters");
  rejectWorkflowMutation(text => `${text}\n    environment: production\n`, "deployment environment");
  rejectWorkflowMutation(text => `${text}\n      - run: netlify deploy --prod\n`, "mutation, release, deploy, or upload command");
  rejectWorkflowMutation(text => `${text}\n      - run: npm publish\n`, "mutation, release, deploy, or upload command");
  rejectWorkflowMutation(text => `${text}\n      - run: git push origin main\n`, "mutation, release, deploy, or upload command");
  rejectWorkflowMutation(text => `${text}\n      - run: gh release create sun-v0.30.1\n`, "mutation, release, deploy, or upload command");
  rejectWorkflowMutation(text => `${text}\n      - run: itch.io upload build.zip\n`, "mutation, release, deploy, or upload command");
  rejectWorkflowMutation(text => `${text}\n      - run: echo \"${"${{ secrets.TOKEN }}"}\"\n`, "secret access");
  rejectWorkflowMutation(text => `${text}\n      - uses: actions/upload-artifact@${"a".repeat(40)}\n`, "unapproved or mutable action");
  rejectWorkflowMutation(
    text => text.replace(
      "      - name: Use exact Node.js version\n",
      `      - name: Duplicate checkout without safe options\n        uses: ${CHECKOUT_ACTION}\n\n      - name: Use exact Node.js version\n`
    ),
    "must contain each required immutable action exactly once"
  );

  const extraWorkflowTree = treeWithOverrides(candidate.tree, {
    ".github/workflows/unauthorized.yml": Buffer.from("name: Unauthorized workflow\n", "utf8")
  });
  const extraWorkflowRecords = canonicalRecords(extraWorkflowTree, GATE_A_CHANGED_PATHS);
  const extraWorkflowOid = writeRawCommit(canonicalRawCommit(
    extraWorkflowTree,
    GATE_A_BASE_SHA,
    GATE_A_AUTHOR,
    GATE_A_COMMIT_TITLE,
    extraWorkflowRecords
  ));
  assert.ok(candidateEvidence(extraWorkflowOid).errors.some(error => error.includes("workflow allowlist mismatch")));
  structuredRejected += 1;

  const tagBytes = Buffer.from([
    `object ${candidate.oid}`,
    "type commit",
    "tag rec-ratchet-02-counterfeit",
    "tagger Sunsplitter Tag Fixture <noreply@openai.com> 1787616000 -0500",
    "",
    "Annotated tag must not peel into an accepted candidate.\n"
  ].join("\n"), "utf8");
  const annotatedTag = writeRawTag(tagBytes);
  assert.ok(candidateEvidence(annotatedTag).errors.some(error => error.includes("not an independently framed commit object")));
  structuredRejected += 1;

  expectPolicyFailure(correctionPr, facts => { facts.repository = "attacker/Sunsplitter"; }, "repository attacker/Sunsplitter");
  expectPolicyFailure(correctionPr, facts => { facts.baseRef = "main"; }, "pull requests to main");
  expectPolicyFailure(correctionPr, facts => { facts.headRef = "ticket/unarmed"; }, "not an armed recovery route");
  expectPolicyFailure(correctionPr, facts => { facts.prHeadRepository = "fork/Sunsplitter"; }, "pull-request head repository");
  expectPolicyFailure(correctionPr, facts => { facts.checkedOutSha = correction.oid; }, "checked-out SHA");
  expectPolicyFailure(correctionPr, facts => { facts.ref = "refs/tags/sun-v0.30.1"; facts.refType = "tag"; }, "tag creation");
  expectPolicyFailure(correctionPr, facts => { facts.prBaseSha = GATE_A_BASE_SHA; }, "policy correction pull-request base");

  const rejectCorrectionTopology = (fixture, label) => {
    const facts = structuredClone(correctionPr);
    facts.sha = fixture.oid;
    facts.checkedOutSha = fixture.oid;
    const result = evaluatePolicy(facts);
    assert.equal(result.passed, false, `policy correction topology accepted: ${label}`);
    structuredRejected += 1;
  };
  rejectCorrectionTopology(genericMerge(correction.tree, [GATE_A_MERGE_SHA], "correction one-parent squash fixture"), "one-parent squash");
  rejectCorrectionTopology(genericMerge(correction.tree, [correction.oid, GATE_A_MERGE_SHA], "correction swapped parents fixture"), "swapped parents");
  rejectCorrectionTopology(genericMerge(correction.tree, [GATE_A_MERGE_SHA, correction.oid, GATE_A_BASE_SHA], "correction octopus fixture"), "octopus merge");
  rejectCorrectionTopology(genericMerge(GATE_A_MERGE_TREE, [GATE_A_MERGE_SHA, correction.oid], "correction wrong tree fixture"), "wrong merge tree");
  rejectCorrectionTopology({ oid: correction.oid }, "ticket head presented as squash checkout");

  const rebasedRaw = canonicalRawCommit(
    correction.tree,
    GATE_A_BASE_SHA,
    POLICY_CORRECTION_AUTHOR,
    POLICY_CORRECTION_COMMIT_TITLE,
    correction.records
  );
  const rebasedHead = writeRawCommit(rebasedRaw);
  rejectCorrectionTopology(genericMerge(correction.tree, [GATE_A_MERGE_SHA, rebasedHead], "correction rebased head fixture"), "rebased equivalent head");
  const alternateRaw = Buffer.from(correctionText.replace(`author ${POLICY_CORRECTION_AUTHOR}`, `author Alternate Build <noreply@openai.com> 1787529600 -0500`));
  const alternateHead = writeRawCommit(alternateRaw);
  rejectCorrectionTopology(genericMerge(correction.tree, [GATE_A_MERGE_SHA, alternateHead], "correction alternate head fixture"), "semantically equivalent alternate head");
  const repeatedCorrectionSuccessor = genericMerge(correction.tree, [correctionSynthetic.oid, correction.oid], "repeated correction head fixture");
  assert.equal(evaluatePolicy(pushFacts({ before: correctionSynthetic.oid, after: repeatedCorrectionSuccessor.oid })).passed, false);
  structuredRejected += 1;
  assert.equal(evaluatePolicy(candidatePr).passed, false, "consumed Gate A route was accepted");
  const oldR1Pr = prFacts({
    sha: genericMerge(FAILED_REC_02_R1_TREE, [GATE_A_MERGE_SHA, FAILED_REC_02_R1_HEAD], "Failed REC-02 r1 merge fixture").oid,
    base: GATE_A_MERGE_SHA,
    head: FAILED_REC_02_R1_HEAD,
    headRef: "ticket/0.30.1-rec-02-r1"
  });
  assert.ok(evaluatePolicy(oldR1Pr).errors.some(error => error.includes("r1 route is failed and non-reusable")));
  structuredRejected += 1;
  const failedCorrectionC1Pr = prFacts({
    sha: genericMerge(
      FAILED_POLICY_CORRECTION_C1_TREE,
      [GATE_A_MERGE_SHA, FAILED_POLICY_CORRECTION_C1_HEAD],
      "Failed policy correction C1 merge fixture"
    ).oid,
    base: GATE_A_MERGE_SHA,
    head: FAILED_POLICY_CORRECTION_C1_HEAD,
    headRef: POLICY_CORRECTION_BRANCH
  });
  assert.ok(evaluatePolicy(failedCorrectionC1Pr).errors.some(error => error.includes("failed policy correction C1 identity is non-reusable")));
  structuredRejected += 1;
  const failedCorrectionC2Pr = prFacts({
    sha: genericMerge(
      FAILED_POLICY_CORRECTION_C2_TREE,
      [GATE_A_MERGE_SHA, FAILED_POLICY_CORRECTION_C2_HEAD],
      "Failed policy correction C2 merge fixture"
    ).oid,
    base: GATE_A_MERGE_SHA,
    head: FAILED_POLICY_CORRECTION_C2_HEAD,
    headRef: POLICY_CORRECTION_BRANCH
  });
  assert.ok(evaluatePolicy(failedCorrectionC2Pr).errors.some(error => error.includes("failed policy correction C2 identity is non-reusable")));
  structuredRejected += 1;
  const directPFuturePr = prFacts({
    sha: genericMerge(FAILED_REC_02_R1_TREE, [GATE_A_MERGE_SHA, FAILED_REC_02_R1_HEAD], "Direct P to REC-02 r2 fixture").oid,
    base: GATE_A_MERGE_SHA,
    head: FAILED_REC_02_R1_HEAD,
    headRef: FUTURE_BRANCH
  });
  const directPFutureResult = evaluatePolicy(directPFuturePr);
  assert.equal(directPFutureResult.passed, false);
  assert.ok(directPFutureResult.errors.some(error => error.includes("future base") || error.includes("non-reusable")));
  structuredRejected += 1;

  const protectedMerge = correctionSynthetic.oid;
  const future = futureFixture(protectedMerge);
  assert.notEqual(future.oid, FAILED_REC_02_R1_HEAD);
  assert.notEqual(future.tree, FAILED_REC_02_R1_TREE);
  const futureSynthetic = genericMerge(future.tree, [protectedMerge, future.oid], "Synthetic REC-02 merge fixture");
  const futurePr = prFacts({ sha: futureSynthetic.oid, base: protectedMerge, head: future.oid, headRef: FUTURE_BRANCH });
  assert.deepEqual(evaluatePolicy(futurePr).errors, []);
  assert.deepEqual(evaluatePolicy(pushFacts({ before: protectedMerge, after: futureSynthetic.oid })).errors, []);

  const futureStatus = fileIdentity(future.tree, STATUS_PATH).bytes;
  const futureStatusText = futureStatus.toString("utf8");
  assert.match(futureStatusText, /`updated_utc: 2026-08-25`/);
  assert.match(futureStatusText, new RegExp(`governed_recovery_successor_sha: ${protectedMerge}`));
  assert.match(futureStatusText, new RegExp(`active_simulation_baseline_sha256: ${INACTIVE_BASELINE_SHA256}`));
  assert.match(futureStatusText, /policy self-test correction landed at exact protected successor/);
  assert.match(futureStatusText, /After the REC-02 r2 draft PR exists/);
  assert.match(futureStatusText, new RegExp(`fresh_rec_02_branch: ${FUTURE_BRANCH} — CONSTRUCTED FROM exact protected policy-correction successor ${protectedMerge}`));
  assert.doesNotMatch(futureStatusText, /fresh_rec_02_branch:[^`]*BLOCKED until an exact correction successor lands/);
  assert.match(futureStatusText, new RegExp(`failed_rec_02_r1_head: ${FAILED_REC_02_R1_HEAD}`));
  assert.match(futureStatusText, new RegExp(`failed_policy_correction_c1_head: ${FAILED_POLICY_CORRECTION_C1_HEAD}`));
  assert.match(futureStatusText, new RegExp(`failed_policy_correction_c2_head: ${FAILED_POLICY_CORRECTION_C2_HEAD}`));
  assert.match(futureStatusText, /FAILED REQUIRED REVIEW \/ LOCAL ONLY \/ UNPUSHED \/ NON-REUSABLE/);
  assert.match(futureStatusText, /FAILED REQUIRED GATE \/ LOCAL ONLY \/ UNPUSHED \/ NON-REUSABLE/);
  assert.match(futureStatusText, new RegExp(POLICY_CORRECTION_RECORD_PATH.replaceAll("/", "\\/")));
  const driftFutureTree = treeWithOverrides(future.tree, { [STATUS_PATH]: Buffer.concat([futureStatus, Buffer.from("\n")]) });
  const driftFutureRecords = canonicalRecords(driftFutureTree, FUTURE_CHANGED_PATHS);
  const driftFutureOid = writeRawCommit(canonicalRawCommit(driftFutureTree, protectedMerge, FUTURE_AUTHOR, FUTURE_COMMIT_TITLE, driftFutureRecords));
  const driftEvidence = futureEvidence(driftFutureOid, protectedMerge);
  assert.ok(driftEvidence.errors.some(error => error.includes("tree") || error.includes("STATUS")));
  structuredRejected += 1;
  const extraParentRaw = Buffer.from(future.raw.toString("utf8").replace(`parent ${protectedMerge}`, `parent ${protectedMerge}\nparent ${GATE_A_BASE_SHA}`));
  assert.ok(futureEvidence(writeRawCommit(extraParentRaw), protectedMerge).errors.length > 0);
  structuredRejected += 1;
  const futureMergeVariants = [
    genericMerge(future.tree, [protectedMerge], "future one-parent squash fixture"),
    genericMerge(future.tree, [future.oid, protectedMerge], "future swapped parents fixture"),
    genericMerge(future.tree, [protectedMerge, future.oid, GATE_A_BASE_SHA], "future octopus fixture"),
    genericMerge(candidate.tree, [protectedMerge, future.oid], "future wrong tree fixture")
  ];
  for (const fixture of futureMergeVariants) {
    const result = evaluatePolicy(pushFacts({ before: protectedMerge, after: fixture.oid }));
    assert.equal(result.passed, false, "invalid future merge topology was accepted");
    structuredRejected += 1;
  }
  const consumedPr = prFacts({ sha: futureSynthetic.oid, base: futureSynthetic.oid, head: future.oid, headRef: FUTURE_BRANCH });
  assert.equal(evaluatePolicy(consumedPr).passed, false);
  structuredRejected += 1;
  const consumedPush = pushFacts({ before: futureSynthetic.oid, after: futureSynthetic.oid });
  assert.equal(evaluatePolicy(consumedPush).passed, false);
  structuredRejected += 1;
  const repeatedFutureSuccessor = genericMerge(future.tree, [futureSynthetic.oid, future.oid], "repeated REC-02 head fixture");
  assert.equal(evaluatePolicy(pushFacts({ before: futureSynthetic.oid, after: repeatedFutureSuccessor.oid })).passed, false);
  structuredRejected += 1;

  assert.ok(rejected >= 84, `only ${rejected} raw adversarial commits were rejected`);
  assert.ok(structuredRejected >= 40, `only ${structuredRejected} structured adversarial fixtures were rejected`);
  console.log(`PASS release-policy self-test — ${rejected} historical raw-frame and ${structuredRejected} structured adversarial fixtures rejected; immutable Gate A, one self-consuming policy correction, and one fresh self-consuming REC-02 r2 route accepted; NO-PUBLISH remains active`);
  console.log(`FIXTURE gate-a-head=${candidate.oid} tree=${candidate.tree} synthetic=${synthetic.oid}`);
  console.log(`FIXTURE correction-head=${correction.oid} tree=${correction.tree} synthetic=${correctionSynthetic.oid}`);
  console.log(`FIXTURE future-head=${future.oid} tree=${future.tree} synthetic=${futureSynthetic.oid}`);
}

function taskForRoute(route) {
  if (route?.startsWith("rec-ratchet-02-policy-correction")) return "REC-RATCHET-02-POLICY-SELFTEST-CORRECTION-R1";
  if (route?.startsWith("rec-ratchet-02")) return "REC-RATCHET-02/#24";
  if (route?.startsWith("rec-02")) return "REC-02/#24";
  return "GOVERNED-RECOVERY";
}

function writeSummary(facts, result) {
  if (!process.env.GITHUB_STEP_SUMMARY) return;
  const source = (facts.sha || "unknown").slice(0, 7);
  const lines = [
    "## Governed recovery release policy",
    "",
    `- Exact tested SHA: \`${facts.sha || "missing"}\``,
    `- PR head SHA: \`${facts.prHeadSha || "n/a"}\``,
    `- PR base SHA: \`${facts.prBaseSha || facts.beforeSha || "n/a"}\``,
    `- Result: **${result.passed ? "PASS" : "FAIL"}**`,
    `- Source declaration: \`SOURCE ${source} · RUNTIME ${source} · TASK ${taskForRoute(result.route)} · MODE verification\``,
    "",
    ...result.notices.map(notice => `- ${notice}`)
  ];
  if (result.errors.length) lines.push("", "### Failures", "", ...result.errors.map(error => `- ${error}`));
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${lines.join("\n")}\n`);
}

function main() {
  if (process.argv.length === 3 && process.argv[2] === "--self-test") {
    selfTest();
    return;
  }
  if (process.argv.length === 3 && process.argv[2] === "--projection") {
    console.log(sha256(normalizedPolicyBytes(readFileSync(resolve(ROOT, POLICY_PATH)))));
    return;
  }
  if (process.argv.length !== 2) throw new Error("Usage: node scripts/release-policy.mjs [--self-test|--projection]");
  const facts = environmentFromProcess();
  const result = evaluatePolicy(facts);
  const shortSha = (facts.sha || "unknown").slice(0, 7);
  console.log(`SOURCE ${shortSha} · RUNTIME ${shortSha} · TASK ${taskForRoute(result.route)} · MODE verification`);
  console.log(`exact tested SHA: ${facts.sha || "missing"}`);
  if (facts.prHeadSha) console.log(`pull-request head SHA: ${facts.prHeadSha}`);
  if (facts.prBaseSha) console.log(`pull-request base SHA: ${facts.prBaseSha}`);
  result.notices.forEach(notice => console.log(`NOTICE ${notice}`));
  writeSummary(facts, result);
  if (!result.passed) {
    result.errors.forEach(error => console.error(`FAIL ${error}`));
    process.exitCode = 1;
  } else {
    console.log("PASS governed recovery release policy; NO-PUBLISH / NOT CERTIFIED remains active");
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
