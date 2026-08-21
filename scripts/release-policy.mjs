#!/usr/bin/env node

// PIPE-BOOT-R1, REC-RATCHET-01, REC-01, the one-shot lock-record route,
// the exact ART-INTEGRATION-R2 routes, and the one-shot ART-R2 protected-push
// ratchet that repairs their final protected-merge enforcement.
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
  existsSync,
  lstatSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const EXPECTED_REPOSITORY = "mbains89/Sunsplitter";
const RECOVERY_BRANCH = "recovery/e4f8440-nopub";
const PIPE_BOOT_HEAD = "ticket/0.30.1-pipe-boot-r1";
const PIPE_BOOT_CLOSEOUT_HEAD = "ticket/0.30.1-pipe-boot-r1-status-closeout";
const RECOVERY_BASE_SHA = "e4f84409759760d31fcf47b8a227802a61421f51";
const DISPATCH_BASE_SHA = "d7728f7ea6f6ee3f4966d73dc6316c3c26491f6e";
const PIPE_BOOT_MERGE_SHA = "0b600935aa6e21d4898bcc9c7ad09e78893ec6e7";
const REC_RATCHET_HEAD = "ticket/0.30.1-rec-ratchet-01";
const REC_RATCHET_BASE_SHA = "78a64c7a180a34e786da3eefac42a06f50703bab";
const REC_01_HEAD = "ticket/0.30.1-rec-01-r1";
const LOCK_RECORD_HEAD = "ticket/0.30.1-locks-l025-l028-r1";
const LOCK_RECORD_BASE_SHA = "9bb4ccf7efbf856ffed569436787f779ad195698";
const ART_R2_GOVERNANCE_HEAD = "ticket/art-integration-r2-governance-repin";
const ART_R2_GOVERNANCE_BASE_SHA = "8a840397d80b8fe1027a22ca89603d92f0e562e6";
const ART_R2_IMPLEMENTATION_HEAD = "ticket/art-integration-r2-55";
const ART_R2_GOVERNANCE_RECORD_PATH = "artifacts/ART-INTEGRATION-R2_GOVERNANCE_REPIN.md";
const ART_R2_PUSH_RATCHET_HEAD = "ticket/art-r2-push-ratchet-r1";
const ART_R2_PUSH_RATCHET_BASE_SHA = "23951012655b0037a55e82c755b66dd4d852f20b";
const ART_R2_PUSH_RATCHET_BASE_TREE_SHA = "96829ad0e01619f56bed2121a666645b3f9b5259";
const ART_R2_PUSH_RATCHET_RECORD_PATH = "artifacts/ART-INTEGRATION-R2_PROTECTED_PUSH_REPAIR.md";
const ART_R2_PUSH_RATCHET_POLICY_PATH = "scripts/release-policy.mjs";
const ART_R2_PUSH_RATCHET_COMMIT_TITLE = "ART-R2-PUSH-RATCHET-R1-B01: bind exact raw commit object";
const ART_R2_PUSH_RATCHET_AUTHOR_HEADER = "author Codex <codex@openai.com> 1787299200 -0500";
const ART_R2_PUSH_RATCHET_COMMITTER_HEADER = "committer Codex <codex@openai.com> 1787299260 -0500";
const ART_R2_B01_OLD_HEAD_SHA = "b68bc42fc1a3efd72314c90b01f5aaa66ce2df74";
const ART_R2_B01_ALTERNATE_SHA = "653a71903ac810c1065e171dae90060f07279d85";
const ART_R2_B01_OLD_TREE_SHA = "b4f141c82ed89c78e260c01acecd1dc2a6c793d0";
const ART_R2_B01_OLD_PAYLOAD_SHA256 = "33638b74e5dcc296c0b57535eb58ec20cd0bda37ca341f7cba8122c21a4693da";
const ART_R2_B01_OLD_MESSAGE_SHA256 = "3be268eea78476ea13aa0b7c4e71b2bf545bff33a34456cc106cac253c155956";
const ART_R2_B01_ALTERNATE_PAYLOAD_SHA256 = "f16fb6f2ac10d8d70d009545ce9f389a168b96b40a5f53fa20dec0c5e2b92205";
const ART_R2_B01_ALTERNATE_MESSAGE_SHA256 = "70f6274b0f29fb3d581e2e31faa2eae3abd2ca9d8611425ae5e1931003ab7c81";
const ART_R2_PUSH_RATCHET_POLICY_PROJECTION_SHA256 = "4e8bedd98fc1ef72efd3ae220d860d16778045d459530ff08beda19e7f71ae24";
const ART_R2_HELD_IMPLEMENTATION_HEAD_SHA = "7fe31675b678d041c980605ed5c5533d3ea22581";
const ART_R2_HELD_IMPLEMENTATION_TREE_SHA = "52551891fe55324bc2fcd073bff56b9a8cd2c061";
const ART_R2_INTEGRATION_RECORD_PATH = "artifacts/ART-INTEGRATION-R2-55_RECORD.json";
const SIMULATION_BASELINE_PATH = "scripts/fixtures/pipe-boot-r1-simulation-baseline.json";
const REC_RATCHET_ARTIFACT_PATH = "artifacts/REC-RATCHET-01_BASELINE_TRANSITION.md";
const REC_RATCHET_BASELINE_ARTIFACT_PATH = "artifacts/REC-RATCHET-01_AUTHORIZED_BASELINE.json";
const REC_RATCHET_PATCH_ARTIFACT_PATH = "artifacts/REC-RATCHET-01_AUTHORIZED_REC-01.patch.json";

const GOV_01_SHA256 = "067832a3750f9909df7a4d8eff553d96dd450957c9235da8f37012607a7bb14e";
const RECOVERY_DEC_SHA256 = "48721ce3552cf44ff305747545eb908c0668cf04f84167d41eedefeb5f092efa";
const NETLIFY_NO_BUILD_SHA256 = "02779c797969c4af09d5f4fa900ef7464473b6d3e2337b3d47eedbc94ca6187d";
const SIMULATION_BASELINE_SHA256 = "bb1fb02cb7f85f0c0eddb3d9dbb0d3bb6c695d57156c2c051bf69f6f53f3b42b";
const REC_01_SIMULATION_BASELINE_SHA256 = "0633469f57971b9c00c877a33f9ccb818e53d5a8de8cc787e4ca2a25fdeda7f2";
const REC_RATCHET_ARTIFACT_SHA256 = "e1101102c7c79e2f2d7c12504e74f1fe28037ae199703d1b488c57aa2e329db8";
const REC_RATCHET_PATCH_ARTIFACT_SHA256 = "f5c4f2a48f24f0c6c7d6d570d98acc6217156ebcdf3cef5a9224941629f2c438";
const REC_01_SCENES_41_SHA256 = "b67563297cb4b4ae89330fe61523d06b1b11c3703bd7c5ba412492e7860fc106";
const REC_01_VERIFY_SHA256 = "ba413f6b41d4f0278238f69feea59865e0d3e979b177c76db6b380854afec084";
const ART_R2_GOVERNANCE_DOCUMENT_SHA256 = Object.freeze({
  [ART_R2_GOVERNANCE_RECORD_PATH]: "4151879697d7edcc265daab2073a1cbd3aff261e62338397313b8785a17726b5",
  "artifacts/ART_RULES.md": "2e4cb5caf80824b5ee980e3282293f5e6c77271755421d3472458a5103cb207b",
  "artifacts/LOCKS.md": "f8debebc10b4fe69a0e5fee1305a70500e15c8c6fd0beb74c7ab9ba8bffa078e",
  "artifacts/PROJECT_STATUS.md": "5094ca4f6404f9e74b3c20788a2f67a1a20de58e8ecbca3f1063302722b69759",
  "artifacts/ROADMAP.md": "5c79b798065c8b9dcae41cc53ba1118a1e5dd934803c310539be3f350b4cbf90"
});
const ART_R2_IMMUTABLE_GOVERNANCE_SHA256 = Object.freeze({
  [ART_R2_GOVERNANCE_RECORD_PATH]: ART_R2_GOVERNANCE_DOCUMENT_SHA256[ART_R2_GOVERNANCE_RECORD_PATH],
  "artifacts/ART_RULES.md": ART_R2_GOVERNANCE_DOCUMENT_SHA256["artifacts/ART_RULES.md"],
  "artifacts/LOCKS.md": ART_R2_GOVERNANCE_DOCUMENT_SHA256["artifacts/LOCKS.md"],
  "artifacts/ROADMAP.md": ART_R2_GOVERNANCE_DOCUMENT_SHA256["artifacts/ROADMAP.md"]
});
const ART_R2_PUSH_RATCHET_DOCUMENT_SHA256 = "494545fd11ecda0c7083045e37d07a318717dda4f4bc787c627815d21feeba4f";
const ART_R2_PUSH_RATCHET_STATUS_SHA256 = "bc5536b646773c95bc7ad649aac752fa2913d19af4d0cd0dfe95273dc1172b8b";
const ART_R2_IMPLEMENTATION_CONTENT_MANIFEST_SHA256 = "f617b540572839c5915a1ef3bf57ea89c1241dd3eaa0d3fa6cf24a876673ad65";
const ART_R2_IMAGE_CONTENT_MANIFEST_SHA256 = "1441be78e8d0d95f4cf2cfd9ace72b7e6458aa0ec230336748de6a2b96db7baa";
const ART_R2_INTEGRATION_RECORD_SHA256 = "d4512affd47ae29e6e8d9e711fd095b8273767de02f7bec06d1d4c5a9a33f29f";
const ART_R2_VALIDATOR_SHA256 = "bed3a5443255510e8201fa896a4db05fbb466da2e13c4d431fae1fe28fdf5141";
const ART_R2_VERIFY_SHA256 = "654193d383a4fd2e32472c554ba2b85c64d25f2941048a8b4fe936cbc985471f";
const WORKFLOW_SHA256 = Object.freeze({
  "release-policy.yml": "2d0c146aaae977c61cbfa7c96642f99759dfacefb142f053e6d1187c0395dd33",
  "verify.yml": "9a498bbf75ea62b04235fcfffea1c21ec9a768b8cec5416b7a2fb2e593b67ec2"
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

export const REC_RATCHET_01_CHANGED_PATHS = Object.freeze([
  ".github/workflows/verify.yml",
  REC_RATCHET_BASELINE_ARTIFACT_PATH,
  REC_RATCHET_ARTIFACT_PATH,
  REC_RATCHET_PATCH_ARTIFACT_PATH,
  "artifacts/PROJECT_STATUS.md",
  "scripts/release-policy.mjs"
]);

export const REC_01_CHANGED_PATHS = Object.freeze([
  "artifacts/PROJECT_STATUS.md",
  SIMULATION_BASELINE_PATH,
  "scripts/verify.mjs",
  "src/scenes-41.js"
]);

export const LOCK_RECORD_CHANGED_PATHS = Object.freeze([
  "artifacts/LOCKS.md",
  "artifacts/PROJECT_STATUS.md",
  "artifacts/ROADMAP.md",
  "scripts/release-policy.mjs"
]);

export const ART_R2_GOVERNANCE_CHANGED_PATHS = Object.freeze([
  ART_R2_GOVERNANCE_RECORD_PATH,
  "artifacts/ART_RULES.md",
  "artifacts/LOCKS.md",
  "artifacts/PROJECT_STATUS.md",
  "artifacts/ROADMAP.md",
  "scripts/release-policy.mjs"
]);

export const ART_R2_PUSH_RATCHET_CHANGED_PATHS = Object.freeze([
  ART_R2_PUSH_RATCHET_RECORD_PATH,
  "artifacts/PROJECT_STATUS.md",
  ART_R2_PUSH_RATCHET_POLICY_PATH
]);

export const ART_R2_IMPLEMENTATION_CHANGED_PATHS = Object.freeze([
  "artifacts/ART-INTEGRATION-R2-55_RECORD.json",
  "images/act2_tether_dock.jpg",
  "images/act2_tether_hand_elias.jpg",
  "images/act2_tether_hand_mira.jpg",
  "images/act2_tether_hand_sela.jpg",
  "images/act2_tether_lie.jpg",
  "images/act2_tether_manifest.jpg",
  "images/act2_tether_rush.jpg",
  "images/act2_tether_vent.jpg",
  "images/act3_lethal_elias_end.jpg",
  "images/act3_lethal_lena_clock.jpg",
  "images/act3_lethal_lena_power.jpg",
  "images/act3_lethal_lena_sterile.jpg",
  "images/act3_lethal_mira_end.jpg",
  "images/act3_lethal_tomas_end.jpg",
  "images/act3_lethal_tomas_stores.jpg",
  "images/act3_lethal_tomas_structure.jpg",
  "images/act3_reckoning_burn_stale.jpg",
  "images/act3_reckoning_burn_verified.jpg",
  "images/arc_fork.jpg",
  "images/arc_future_1.jpg",
  "images/arc_living_1.jpg",
  "images/coolant_trade.jpg",
  "images/crew_walk.jpg",
  "images/dying.jpg",
  "images/faction_split.jpg",
  "images/history_elias.jpg",
  "images/offshift_elias.jpg",
  "images/offshift_tomas.jpg",
  "images/offshift_tomas_r.jpg",
  "images/pair_shield_cold.jpg",
  "images/past_leak.jpg",
  "images/prom_direct.jpg",
  "images/prom_direct_break.jpg",
  "images/prom_direct_keep.jpg",
  "images/prom_line_keep.jpg",
  "images/prom_make_elias.jpg",
  "images/prom_make_lena.jpg",
  "images/prom_make_tomas.jpg",
  "images/prom_price.jpg",
  "images/prom_price_break.jpg",
  "images/prom_price_keep.jpg",
  "images/prom_r_elias.jpg",
  "images/prom_r_lena.jpg",
  "images/prom_r_tomas.jpg",
  "images/prom_vent.jpg",
  "images/prom_vent_break.jpg",
  "images/prom_vent_keep.jpg",
  "images/reckon_memory.jpg",
  "images/reckon_public.jpg",
  "images/reckon_suppress.jpg",
  "images/reckon_truth.jpg",
  "images/seal_or_food.jpg",
  "images/status.jpg",
  "images/time_pass.jpg",
  "images/wake.jpg",
  "scripts/validate-art-r2.mjs",
  "scripts/verify.mjs",
  "src/engine.js",
  "src/scenes-10.js",
  "src/scenes-11.js",
  "src/scenes-12.js",
  "src/scenes-14.js",
  "src/scenes-19.js",
  "src/scenes-20.js",
  "src/scenes-21.js",
  "src/scenes-22.js",
  "src/scenes-23.js",
  "src/scenes-24.js",
  "src/scenes-35.js",
  "src/scenes-43.js",
  "src/scenes-44.js",
  "src/scenes-45.js",
  "src/scenes-46.js",
  "src/scenes-47.js",
  "src/scenes-48.js",
  "src/scenes-49.js",
  "src/scenes-52.js",
  "src/state.js"
]);

const ART_R2_IMAGE_PATHS = Object.freeze(
  ART_R2_IMPLEMENTATION_CHANGED_PATHS.filter(path => path.startsWith("images/"))
);

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

function gitRaw(args, options = {}) {
  return execFileSync("git", args, {
    cwd: ROOT,
    input: options.input,
    env: options.env ? { ...process.env, ...options.env } : process.env,
    stdio: [options.input === undefined ? "ignore" : "pipe", "pipe", "pipe"]
  });
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

function gitFileSha256(ref, relativePath) {
  if (!FULL_SHA_RE.test(ref || "")) return null;
  try {
    return sha256(execFileSync("git", ["show", `${ref}:${relativePath}`], {
      cwd: ROOT,
      stdio: ["ignore", "pipe", "pipe"]
    }));
  } catch {
    return null;
  }
}

function gitTreeSha(ref) {
  if (!FULL_SHA_RE.test(ref || "")) return null;
  try {
    const tree = git(["rev-parse", `${ref}^{tree}`]);
    return FULL_SHA_RE.test(tree) ? tree : null;
  } catch {
    return null;
  }
}

function gitParents(ref) {
  if (!FULL_SHA_RE.test(ref || "")) return [];
  try {
    return git(["rev-list", "--parents", "-n", "1", ref]).split(/\s+/).slice(1);
  } catch {
    return [];
  }
}

function gitRawCommitObject(ref) {
  if (!FULL_SHA_RE.test(ref || "")) return null;
  try {
    if (git(["rev-parse", "--show-object-format"]) !== "sha1") return null;
    const oid = git(["rev-parse", `${ref}^{commit}`]);
    if (oid !== ref || git(["cat-file", "-t", oid]) !== "commit") return null;
    const payload = gitRaw(["cat-file", "commit", oid]);
    const declaredSize = Number(git(["cat-file", "-s", oid]));
    if (!Number.isSafeInteger(declaredSize) || declaredSize !== payload.length) return null;
    const frame = Buffer.from(`commit ${payload.length}\0`, "ascii");
    const framed = Buffer.concat([frame, payload]);
    const framedSha1 = createHash("sha1").update(framed).digest("hex");
    return {
      oid,
      payload,
      framed,
      framedSha1,
      payloadSha256: sha256(payload),
      framedSha256: sha256(framed)
    };
  } catch {
    return null;
  }
}

function gitFileIdentity(ref, relativePath) {
  if (!FULL_SHA_RE.test(ref || "")) return null;
  try {
    const row = git(["ls-tree", ref, "--", relativePath]);
    const match = row.match(/^(\d{6})\s+(\w+)\s+([0-9a-f]{40})\t(.+)$/);
    if (!match || match[4] !== relativePath) return null;
    const bytes = execFileSync("git", ["show", `${ref}:${relativePath}`], {
      cwd: ROOT,
      stdio: ["ignore", "pipe", "pipe"]
    });
    return { mode: match[1], type: match[2], sha256: sha256(bytes) };
  } catch {
    return null;
  }
}

function gitPathsAreRegularBlobs(ref, paths) {
  return paths.every(path => {
    const identity = gitFileIdentity(ref, path);
    return identity?.mode === "100644" && identity.type === "blob";
  });
}

// Canonical ART commitment: sorted mode + NUL + type + NUL + path + NUL +
// SHA-256(file bytes) + LF. Changing this framing changes the pinned digest.
function gitFilesContentManifestSha256(ref, paths) {
  const unique = [...new Set(paths || [])].sort();
  if (unique.length !== (paths || []).length) return null;
  const digest = createHash("sha256");
  for (const path of unique) {
    const identity = gitFileIdentity(ref, path);
    if (!identity) return null;
    digest.update(identity.mode);
    digest.update("\0");
    digest.update(identity.type);
    digest.update("\0");
    digest.update(path);
    digest.update("\0");
    digest.update(identity.sha256);
    digest.update("\n");
  }
  return digest.digest("hex");
}

function changedPathsBetween(base, head) {
  if (!FULL_SHA_RE.test(base || "") || !FULL_SHA_RE.test(head || "")) return [];
  try {
    const output = git([
      "diff",
      "--name-only",
      "--no-renames",
      "--diff-filter=ACDMRTUXB",
      `${base}..${head}`
    ]);
    return output ? [...new Set(output.split(/\r?\n/).filter(Boolean))].sort() : [];
  } catch {
    return [];
  }
}

function isExactRecRatchetSuccessor(ref) {
  if (!FULL_SHA_RE.test(ref || "")) return false;
  try {
    const parents = git(["rev-list", "--parents", "-n", "1", ref]).split(/\s+/);
    return parents.length === 3
      && parents[1] === REC_RATCHET_BASE_SHA
      && sameStringSet(changedPathsBetween(REC_RATCHET_BASE_SHA, ref), REC_RATCHET_01_CHANGED_PATHS)
      && gitFileSha256(ref, SIMULATION_BASELINE_PATH) === SIMULATION_BASELINE_SHA256
      && gitFileSha256(ref, REC_RATCHET_ARTIFACT_PATH) === REC_RATCHET_ARTIFACT_SHA256
      && gitFileSha256(ref, REC_RATCHET_BASELINE_ARTIFACT_PATH) === REC_01_SIMULATION_BASELINE_SHA256
      && gitFileSha256(ref, REC_RATCHET_PATCH_ARTIFACT_PATH) === REC_RATCHET_PATCH_ARTIFACT_SHA256
      && gitFileSha256(ref, ".github/workflows/verify.yml") === WORKFLOW_SHA256["verify.yml"];
  } catch {
    return false;
  }
}

function gitFilesMatchSha256(ref, expectedByPath) {
  return Object.entries(expectedByPath)
    .every(([path, expected]) => gitFileSha256(ref, path) === expected);
}

function artR2PushRatchetManifestMessageBytes(actualHashes) {
  if (!actualHashes) return null;
  const prefix = "ART-R2-PUSH-RATCHET-R1-File-SHA256: ";
  const entries = ART_R2_PUSH_RATCHET_CHANGED_PATHS.map(path => {
    const digest = actualHashes[path];
    if (!/^[0-9a-f]{64}$/.test(digest || "")) return null;
    return `${prefix}${path}=${digest}`;
  });
  if (entries.some(entry => entry === null)) return null;
  return Buffer.from([
    ART_R2_PUSH_RATCHET_COMMIT_TITLE,
    "",
    "NO-PUBLISH / NOT CERTIFIED",
    "",
    ...entries,
    ""
  ].join("\n"), "utf8");
}

function artR2PushRatchetExpectedRawCommitPayload(ref) {
  const actualHashes = Object.fromEntries(
    ART_R2_PUSH_RATCHET_CHANGED_PATHS.map(path => [path, gitFileSha256(ref, path)])
  );
  const message = artR2PushRatchetManifestMessageBytes(actualHashes);
  const tree = gitTreeSha(ref);
  if (!message || !FULL_SHA_RE.test(tree || "")) return null;
  const headers = Buffer.from([
    `tree ${tree}`,
    `parent ${ART_R2_PUSH_RATCHET_BASE_SHA}`,
    ART_R2_PUSH_RATCHET_AUTHOR_HEADER,
    ART_R2_PUSH_RATCHET_COMMITTER_HEADER,
    "",
    ""
  ].join("\n"), "utf8");
  return Buffer.concat([headers, message]);
}

function hasExactArtR2PushRatchetRawCommit(ref) {
  const actual = gitRawCommitObject(ref);
  const expectedPayload = artR2PushRatchetExpectedRawCommitPayload(ref);
  return Boolean(actual && expectedPayload)
    && actual.framedSha1 === actual.oid
    && actual.payload.equals(expectedPayload);
}

function artR2PushRatchetPolicyProjectionSha256(ref) {
  if (!FULL_SHA_RE.test(ref || "")) return null;
  try {
    const source = gitRaw(["show", `${ref}:${ART_R2_PUSH_RATCHET_POLICY_PATH}`]);
    const prefix = Buffer.from(
      "const ART_R2_PUSH_RATCHET_POLICY_PROJECTION_SHA256 = \"",
      "ascii"
    );
    const valueStart = source.indexOf(prefix);
    if (valueStart < 0 || valueStart !== source.lastIndexOf(prefix)) return null;
    const digestStart = valueStart + prefix.length;
    const digestEnd = digestStart + 64;
    const suffix = Buffer.from("\";", "ascii");
    if (!source.subarray(digestEnd, digestEnd + suffix.length).equals(suffix)) return null;
    const embedded = source.subarray(digestStart, digestEnd).toString("ascii");
    if (embedded !== ART_R2_PUSH_RATCHET_POLICY_PROJECTION_SHA256) return null;
    const projected = Buffer.concat([
      source.subarray(0, digestStart),
      Buffer.from("0".repeat(64), "ascii"),
      source.subarray(digestEnd)
    ]);
    return sha256(projected);
  } catch {
    return null;
  }
}

function postRatchetAuthorityHashesMatch(ref) {
  return gitFilesMatchSha256(ref, ART_R2_IMMUTABLE_GOVERNANCE_SHA256)
    && gitFileSha256(ref, ART_R2_PUSH_RATCHET_RECORD_PATH) === ART_R2_PUSH_RATCHET_DOCUMENT_SHA256
    && gitFileSha256(ref, "artifacts/PROJECT_STATUS.md") === ART_R2_PUSH_RATCHET_STATUS_SHA256
    && artR2PushRatchetPolicyProjectionSha256(ref) === ART_R2_PUSH_RATCHET_POLICY_PROJECTION_SHA256;
}

function preservedRec01AndWorkflowHashesMatch(ref) {
  return gitFileSha256(ref, SIMULATION_BASELINE_PATH) === REC_01_SIMULATION_BASELINE_SHA256
    && gitFileSha256(ref, REC_RATCHET_ARTIFACT_PATH) === REC_RATCHET_ARTIFACT_SHA256
    && gitFileSha256(ref, REC_RATCHET_BASELINE_ARTIFACT_PATH) === REC_01_SIMULATION_BASELINE_SHA256
    && gitFileSha256(ref, REC_RATCHET_PATCH_ARTIFACT_PATH) === REC_RATCHET_PATCH_ARTIFACT_SHA256
    && gitFileSha256(ref, "src/scenes-41.js") === REC_01_SCENES_41_SHA256
    && gitFileSha256(ref, ".github/workflows/release-policy.yml") === WORKFLOW_SHA256["release-policy.yml"]
    && gitFileSha256(ref, ".github/workflows/verify.yml") === WORKFLOW_SHA256["verify.yml"];
}

function isExactArtR2PushRatchetHead(ref) {
  if (!FULL_SHA_RE.test(ref || "")) return false;
  try {
    const parents = gitParents(ref);
    return sameStringSet(
      changedPathsBetween(ART_R2_PUSH_RATCHET_BASE_SHA, ref),
      ART_R2_PUSH_RATCHET_CHANGED_PATHS
    )
      && parents.length === 1
      && parents[0] === ART_R2_PUSH_RATCHET_BASE_SHA
      && gitTreeSha(ART_R2_PUSH_RATCHET_BASE_SHA) === ART_R2_PUSH_RATCHET_BASE_TREE_SHA
      && gitPathsAreRegularBlobs(ref, ART_R2_PUSH_RATCHET_CHANGED_PATHS)
      && hasExactArtR2PushRatchetRawCommit(ref)
      && postRatchetAuthorityHashesMatch(ref)
      && preservedRec01AndWorkflowHashesMatch(ref);
  } catch {
    return false;
  }
}

function isExactArtR2PushRatchetSuccessor(ref) {
  if (!FULL_SHA_RE.test(ref || "")) return false;
  try {
    const parents = gitParents(ref);
    const head = parents[1];
    return parents.length === 2
      && parents[0] === ART_R2_PUSH_RATCHET_BASE_SHA
      && isExactArtR2PushRatchetHead(head)
      && gitTreeSha(ref) === gitTreeSha(head)
      && sameStringSet(
        changedPathsBetween(ART_R2_PUSH_RATCHET_BASE_SHA, ref),
        ART_R2_PUSH_RATCHET_CHANGED_PATHS
      )
      && postRatchetAuthorityHashesMatch(ref)
      && preservedRec01AndWorkflowHashesMatch(ref);
  } catch {
    return false;
  }
}

function artR2TargetHashesMatch(ref) {
  return gitTreeSha(ART_R2_HELD_IMPLEMENTATION_HEAD_SHA) === ART_R2_HELD_IMPLEMENTATION_TREE_SHA
    && gitFilesContentManifestSha256(ref, ART_R2_IMPLEMENTATION_CHANGED_PATHS)
      === ART_R2_IMPLEMENTATION_CONTENT_MANIFEST_SHA256
    && gitFilesContentManifestSha256(ref, ART_R2_IMAGE_PATHS)
      === ART_R2_IMAGE_CONTENT_MANIFEST_SHA256
    && gitFileSha256(ref, ART_R2_INTEGRATION_RECORD_PATH) === ART_R2_INTEGRATION_RECORD_SHA256
    && gitFileSha256(ref, "scripts/validate-art-r2.mjs") === ART_R2_VALIDATOR_SHA256
    && gitFileSha256(ref, "scripts/verify.mjs") === ART_R2_VERIFY_SHA256;
}

function isExactArtR2ReconciledHead(ref, precursorSuccessor) {
  if (!FULL_SHA_RE.test(ref || "") || !isExactArtR2PushRatchetSuccessor(precursorSuccessor)) {
    return false;
  }
  try {
    const parents = gitParents(ref);
    return parents.length === 2
      && parents[0] === ART_R2_HELD_IMPLEMENTATION_HEAD_SHA
      && parents[1] === precursorSuccessor
      && isAncestor(ART_R2_HELD_IMPLEMENTATION_HEAD_SHA, ref)
      && isAncestor(precursorSuccessor, ref)
      && sameStringSet(
        changedPathsBetween(precursorSuccessor, ref),
        ART_R2_IMPLEMENTATION_CHANGED_PATHS
      )
      && sameStringSet(
        changedPathsBetween(ART_R2_HELD_IMPLEMENTATION_HEAD_SHA, ref),
        ART_R2_PUSH_RATCHET_CHANGED_PATHS
      )
      && artR2TargetHashesMatch(ref)
      && postRatchetAuthorityHashesMatch(ref)
      && preservedRec01AndWorkflowHashesMatch(ref);
  } catch {
    return false;
  }
}

function isExactArtR2ImplementationSuccessor(ref, precursorSuccessor) {
  if (!FULL_SHA_RE.test(ref || "") || !isExactArtR2PushRatchetSuccessor(precursorSuccessor)) {
    return false;
  }
  try {
    const parents = gitParents(ref);
    const reconciledHead = parents[1];
    return parents.length === 2
      && parents[0] === precursorSuccessor
      && isExactArtR2ReconciledHead(reconciledHead, precursorSuccessor)
      && gitTreeSha(ref) === gitTreeSha(reconciledHead)
      && sameStringSet(
        changedPathsBetween(precursorSuccessor, ref),
        ART_R2_IMPLEMENTATION_CHANGED_PATHS
      )
      && artR2TargetHashesMatch(ref)
      && postRatchetAuthorityHashesMatch(ref)
      && preservedRec01AndWorkflowHashesMatch(ref);
  } catch {
    return false;
  }
}

function isExactArtR2GovernanceSuccessor(ref) {
  if (!FULL_SHA_RE.test(ref || "")) return false;
  try {
    const parents = git(["rev-list", "--parents", "-n", "1", ref]).split(/\s+/);
    return parents.length === 3
      && parents[1] === ART_R2_GOVERNANCE_BASE_SHA
      && sameStringSet(
        changedPathsBetween(ART_R2_GOVERNANCE_BASE_SHA, ref),
        ART_R2_GOVERNANCE_CHANGED_PATHS
      )
      && gitFilesMatchSha256(ref, ART_R2_GOVERNANCE_DOCUMENT_SHA256)
      && gitFileSha256(ref, SIMULATION_BASELINE_PATH) === REC_01_SIMULATION_BASELINE_SHA256
      && gitFileSha256(ref, REC_RATCHET_ARTIFACT_PATH) === REC_RATCHET_ARTIFACT_SHA256
      && gitFileSha256(ref, REC_RATCHET_BASELINE_ARTIFACT_PATH) === REC_01_SIMULATION_BASELINE_SHA256
      && gitFileSha256(ref, REC_RATCHET_PATCH_ARTIFACT_PATH) === REC_RATCHET_PATCH_ARTIFACT_SHA256
      && gitFileSha256(ref, "src/scenes-41.js") === REC_01_SCENES_41_SHA256
      && gitFileSha256(ref, "scripts/verify.mjs") === REC_01_VERIFY_SHA256
      && gitFileSha256(ref, ".github/workflows/release-policy.yml") === WORKFLOW_SHA256["release-policy.yml"]
      && gitFileSha256(ref, ".github/workflows/verify.yml") === WORKFLOW_SHA256["verify.yml"];
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
  const recRatchetPath = resolve(ROOT, REC_RATCHET_ARTIFACT_PATH);
  const recRatchetBaselinePath = resolve(ROOT, REC_RATCHET_BASELINE_ARTIFACT_PATH);
  const recRatchetPatchPath = resolve(ROOT, REC_RATCHET_PATCH_ARTIFACT_PATH);
  const artR2PushRatchetPath = resolve(ROOT, ART_R2_PUSH_RATCHET_RECORD_PATH);
  const artR2IntegrationRecordPath = resolve(ROOT, ART_R2_INTEGRATION_RECORD_PATH);
  const artR2ValidatorPath = resolve(ROOT, "scripts/validate-art-r2.mjs");
  const checkedOutSha = git(["rev-parse", "HEAD"]);
  const status = read("artifacts/PROJECT_STATUS.md");

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
    statusText: status.toString("utf8"),
    statusHash: sha256(status),
    gov01Hash: sha256(gov01),
    recoveryDecHash: sha256(recoveryDec),
    pipeBootText: read("artifacts/PIPE-BOOT_RECOVERY_PIPELINE.md").toString("utf8"),
    reconciliationText: read("artifacts/PIPE-BOOT-R1_RECOVERY_PIPELINE_RECONCILIATION.md").toString("utf8"),
    netlifyHash: sha256(netlify),
    simulationBaselineHash: sha256(simulationBaseline),
    recRatchetHash: existsSync(recRatchetPath)
      ? sha256(readFileSync(recRatchetPath))
      : null,
    recRatchetBaselineHash: existsSync(recRatchetBaselinePath)
      ? sha256(readFileSync(recRatchetBaselinePath))
      : null,
    recRatchetPatchHash: existsSync(recRatchetPatchPath)
      ? sha256(readFileSync(recRatchetPatchPath))
      : null,
    artR2GovernanceDocumentHashes: Object.fromEntries(
      Object.keys(ART_R2_GOVERNANCE_DOCUMENT_SHA256)
        .map(path => [path, sha256(read(path))])
    ),
    artR2ImmutableGovernanceHashes: Object.fromEntries(
      Object.keys(ART_R2_IMMUTABLE_GOVERNANCE_SHA256)
        .map(path => [path, sha256(read(path))])
    ),
    artR2PushRatchetDocumentHash: existsSync(artR2PushRatchetPath)
      ? sha256(readFileSync(artR2PushRatchetPath))
      : null,
    artR2ImplementationContentManifestHash: gitFilesContentManifestSha256(
      checkedOutSha,
      ART_R2_IMPLEMENTATION_CHANGED_PATHS
    ),
    artR2ImageContentManifestHash: gitFilesContentManifestSha256(
      checkedOutSha,
      ART_R2_IMAGE_PATHS
    ),
    artR2IntegrationRecordHash: existsSync(artR2IntegrationRecordPath)
      ? sha256(readFileSync(artR2IntegrationRecordPath))
      : null,
    artR2ValidatorHash: existsSync(artR2ValidatorPath)
      ? sha256(readFileSync(artR2ValidatorPath))
      : null,
    scenes41Hash: sha256(read("src/scenes-41.js")),
    verifyScriptHash: sha256(read("scripts/verify.mjs")),
    prBaseSimulationBaselineHash: environment.eventName === "pull_request"
      ? gitFileSha256(environment.prBaseSha, SIMULATION_BASELINE_PATH)
      : null,
    pushBeforeSimulationBaselineHash: environment.eventName === "push"
      ? gitFileSha256(environment.beforeSha, SIMULATION_BASELINE_PATH)
      : null,
    prBaseIsRecRatchetSuccessor: environment.eventName === "pull_request"
      && isExactRecRatchetSuccessor(environment.prBaseSha),
    prBaseIsArtR2GovernanceSuccessor: environment.eventName === "pull_request"
      && isExactArtR2GovernanceSuccessor(environment.prBaseSha),
    prHeadIsArtR2PushRatchetHead: environment.eventName === "pull_request"
      && isExactArtR2PushRatchetHead(environment.prHeadSha),
    prCheckoutIsArtR2PushRatchetSuccessor: environment.eventName === "pull_request"
      && isExactArtR2PushRatchetSuccessor(checkedOutSha),
    prBaseIsArtR2PushRatchetSuccessor: environment.eventName === "pull_request"
      && isExactArtR2PushRatchetSuccessor(environment.prBaseSha),
    prHeadIsArtR2ReconciledHead: environment.eventName === "pull_request"
      && isExactArtR2ReconciledHead(environment.prHeadSha, environment.prBaseSha),
    prCheckoutIsArtR2ImplementationSuccessor: environment.eventName === "pull_request"
      && isExactArtR2ImplementationSuccessor(checkedOutSha, environment.prBaseSha),
    pushBeforeIsRecRatchetSuccessor: environment.eventName === "push"
      && isExactRecRatchetSuccessor(environment.beforeSha),
    pushAfterIsArtR2GovernanceSuccessor: environment.eventName === "push"
      && isExactArtR2GovernanceSuccessor(environment.afterSha),
    pushBeforeIsArtR2PushRatchetSuccessor: environment.eventName === "push"
      && isExactArtR2PushRatchetSuccessor(environment.beforeSha),
    pushAfterIsArtR2PushRatchetSuccessor: environment.eventName === "push"
      && isExactArtR2PushRatchetSuccessor(environment.afterSha),
    pushAfterIsArtR2ImplementationSuccessor: environment.eventName === "push"
      && isExactArtR2ImplementationSuccessor(environment.afterSha, environment.beforeSha),
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
    } else if (facts.headRef === REC_RATCHET_HEAD) {
      changeRoute = "rec-ratchet";
      if (facts.prBaseSha !== REC_RATCHET_BASE_SHA) {
        errors.push(`pull-request base SHA ${facts.prBaseSha || "<missing>"} != REC-RATCHET base ${REC_RATCHET_BASE_SHA}`);
      }
    } else if (facts.headRef === REC_01_HEAD) {
      changeRoute = "rec-01";
      if (!facts.prBaseIsRecRatchetSuccessor) {
        errors.push("REC-01 pull-request base is not the exact REC-RATCHET-01 merge-commit successor");
      }
      if (facts.prBaseSimulationBaselineHash !== SIMULATION_BASELINE_SHA256) {
        errors.push("REC-01 pull-request base does not contain the pre-transition simulation baseline");
      }
    } else if (facts.headRef === LOCK_RECORD_HEAD) {
      changeRoute = "lock-record";
      if (facts.prBaseSha !== LOCK_RECORD_BASE_SHA) {
        errors.push(`pull-request base SHA ${facts.prBaseSha || "<missing>"} != lock-record base ${LOCK_RECORD_BASE_SHA}`);
      }
    } else if (facts.headRef === ART_R2_GOVERNANCE_HEAD) {
      changeRoute = "art-r2-governance";
      if (facts.prBaseSha !== ART_R2_GOVERNANCE_BASE_SHA) {
        errors.push(`pull-request base SHA ${facts.prBaseSha || "<missing>"} != ART-R2 governance base ${ART_R2_GOVERNANCE_BASE_SHA}`);
      }
    } else if (facts.headRef === ART_R2_PUSH_RATCHET_HEAD) {
      changeRoute = "art-r2-push-ratchet";
      if (facts.prBaseSha !== ART_R2_PUSH_RATCHET_BASE_SHA) {
        errors.push(`pull-request base SHA ${facts.prBaseSha || "<missing>"} != ART-R2 push-ratchet base ${ART_R2_PUSH_RATCHET_BASE_SHA}`);
      }
      if (!facts.prHeadIsArtR2PushRatchetHead) {
        errors.push("ART-R2 push-ratchet pull-request head is not the exact direct-child three-path candidate with pinned commit manifest");
      }
      if (!facts.prCheckoutIsArtR2PushRatchetSuccessor) {
        errors.push("ART-R2 push-ratchet pull-request checkout is not the exact two-parent synthetic successor");
      }
    } else if (facts.headRef === ART_R2_IMPLEMENTATION_HEAD) {
      changeRoute = "art-r2-implementation";
      if (!facts.prBaseIsArtR2PushRatchetSuccessor) {
        errors.push("ART-R2 implementation base is not the exact protected push-ratchet merge successor");
      }
      if (!facts.prHeadIsArtR2ReconciledHead) {
        errors.push("ART-R2 implementation head is not the exact held-head plus push-ratchet reconciliation merge");
      }
      if (!facts.prCheckoutIsArtR2ImplementationSuccessor) {
        errors.push("ART-R2 implementation pull-request checkout is not the exact two-parent protected-merge candidate");
      }
    } else {
      errors.push(`pull-request head ${facts.headRef || "<missing>"} is not an authorized recovery route`);
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
      } else if (normalizedBefore === REC_RATCHET_BASE_SHA) {
        changeRoute = "rec-ratchet";
      } else if (
        facts.pushBeforeIsRecRatchetSuccessor
        && facts.pushBeforeSimulationBaselineHash === SIMULATION_BASELINE_SHA256
        && facts.simulationBaselineHash === REC_01_SIMULATION_BASELINE_SHA256
      ) {
        changeRoute = "rec-01";
      } else if (normalizedBefore === LOCK_RECORD_BASE_SHA) {
        changeRoute = "lock-record";
      } else if (normalizedBefore === ART_R2_GOVERNANCE_BASE_SHA) {
        changeRoute = "art-r2-governance";
        if (!facts.pushAfterIsArtR2GovernanceSuccessor) {
          errors.push("ART-R2 governance push after SHA is not the exact two-parent protected governance successor");
        }
      } else if (normalizedBefore === ART_R2_PUSH_RATCHET_BASE_SHA) {
        changeRoute = "art-r2-push-ratchet";
        if (!facts.pushAfterIsArtR2PushRatchetSuccessor) {
          errors.push("ART-R2 push-ratchet push after SHA is not the exact two-parent protected precursor successor");
        }
      } else if (facts.pushBeforeIsArtR2PushRatchetSuccessor) {
        changeRoute = "art-r2-implementation";
        if (!facts.pushAfterIsArtR2ImplementationSuccessor) {
          errors.push("ART-R2 implementation push after SHA is not the exact two-parent protected ART successor");
        }
      } else {
        errors.push(`push before SHA ${normalizedBefore || "<missing>"} is not an authorized recovery base`);
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
    } else if (changeRoute === "rec-ratchet" && !sameStringSet(changedPaths, REC_RATCHET_01_CHANGED_PATHS)) {
      errors.push(`changed paths do not exactly match the REC-RATCHET-01 set: ${changedPaths.join(", ") || "<none>"}`);
    } else if (changeRoute === "rec-01" && !sameStringSet(changedPaths, REC_01_CHANGED_PATHS)) {
      errors.push(`changed paths do not exactly match the one-shot REC-01 set: ${changedPaths.join(", ") || "<none>"}`);
    } else if (changeRoute === "lock-record" && !sameStringSet(changedPaths, LOCK_RECORD_CHANGED_PATHS)) {
      errors.push(`changed paths do not exactly match the one-shot lock-record set: ${changedPaths.join(", ") || "<none>"}`);
    } else if (changeRoute === "art-r2-governance" && !sameStringSet(changedPaths, ART_R2_GOVERNANCE_CHANGED_PATHS)) {
      errors.push(`changed paths do not exactly match the ART-R2 governance set: ${changedPaths.join(", ") || "<none>"}`);
    } else if (changeRoute === "art-r2-push-ratchet" && !sameStringSet(changedPaths, ART_R2_PUSH_RATCHET_CHANGED_PATHS)) {
      errors.push(`changed paths do not exactly match the ART-R2 push-ratchet set: ${changedPaths.join(", ") || "<none>"}`);
    } else if (changeRoute === "art-r2-implementation" && !sameStringSet(changedPaths, ART_R2_IMPLEMENTATION_CHANGED_PATHS)) {
      errors.push(`changed paths do not exactly match the ART-R2 implementation set: ${changedPaths.join(", ") || "<none>"}`);
    }
  }

  const expectsRec01Tree = [
    "rec-01",
    "lock-record",
    "art-r2-governance",
    "art-r2-push-ratchet",
    "art-r2-implementation"
  ].includes(changeRoute);
  const expectedSimulationBaselineHash = expectsRec01Tree
    ? REC_01_SIMULATION_BASELINE_SHA256
    : SIMULATION_BASELINE_SHA256;
  if (facts.simulationBaselineHash !== expectedSimulationBaselineHash) {
    errors.push(`${SIMULATION_BASELINE_PATH}: bytes differ from the ${expectsRec01Tree ? "REC-RATCHET-01 authorized replacement" : "issue #15 pinned fixture"}`);
  }
  if (["rec-ratchet", "rec-01", "lock-record", "art-r2-governance", "art-r2-push-ratchet", "art-r2-implementation"].includes(changeRoute)
      && facts.recRatchetHash !== REC_RATCHET_ARTIFACT_SHA256) {
    errors.push(`${REC_RATCHET_ARTIFACT_PATH}: bytes differ from the authorized transition artifact`);
  }
  if (["rec-ratchet", "rec-01", "lock-record", "art-r2-governance", "art-r2-push-ratchet", "art-r2-implementation"].includes(changeRoute)
      && facts.recRatchetBaselineHash !== REC_01_SIMULATION_BASELINE_SHA256) {
    errors.push(`${REC_RATCHET_BASELINE_ARTIFACT_PATH}: bytes differ from the authorized inactive baseline`);
  }
  if (["rec-ratchet", "rec-01", "lock-record", "art-r2-governance", "art-r2-push-ratchet", "art-r2-implementation"].includes(changeRoute)
      && facts.recRatchetPatchHash !== REC_RATCHET_PATCH_ARTIFACT_SHA256) {
    errors.push(`${REC_RATCHET_PATCH_ARTIFACT_PATH}: bytes differ from the authorized implementation patch`);
  }
  if (["rec-01", "lock-record", "art-r2-governance", "art-r2-push-ratchet", "art-r2-implementation"].includes(changeRoute)
      && facts.scenes41Hash !== REC_01_SCENES_41_SHA256) {
    errors.push("src/scenes-41.js: bytes differ from the authorized REC-01 target");
  }
  if (["rec-01", "lock-record", "art-r2-governance", "art-r2-push-ratchet"].includes(changeRoute)
      && facts.verifyScriptHash !== REC_01_VERIFY_SHA256) {
    errors.push("scripts/verify.mjs: bytes differ from the authorized REC-01 target");
  }
  if (changeRoute === "art-r2-governance") {
    for (const [path, expectedHash] of Object.entries(ART_R2_GOVERNANCE_DOCUMENT_SHA256)) {
      if (facts.artR2GovernanceDocumentHashes?.[path] !== expectedHash) {
        errors.push(`${path}: bytes differ from the approved ART-R2 governance record`);
      }
    }
  }
  if (["art-r2-push-ratchet", "art-r2-implementation"].includes(changeRoute)) {
    for (const [path, expectedHash] of Object.entries(ART_R2_IMMUTABLE_GOVERNANCE_SHA256)) {
      if (facts.artR2ImmutableGovernanceHashes?.[path] !== expectedHash) {
        errors.push(`${path}: bytes differ from the immutable ART-R2 governance authority`);
      }
    }
    if (facts.artR2PushRatchetDocumentHash !== ART_R2_PUSH_RATCHET_DOCUMENT_SHA256) {
      errors.push(`${ART_R2_PUSH_RATCHET_RECORD_PATH}: bytes differ from the protected-push repair authority`);
    }
    if (facts.statusHash !== ART_R2_PUSH_RATCHET_STATUS_SHA256) {
      errors.push("artifacts/PROJECT_STATUS.md: bytes differ from the protected-push repair target");
    }
  }
  if (changeRoute === "art-r2-push-ratchet") {
    const predecessorBaselineHash = facts.eventName === "pull_request"
      ? facts.prBaseSimulationBaselineHash
      : facts.pushBeforeSimulationBaselineHash;
    if (predecessorBaselineHash !== REC_01_SIMULATION_BASELINE_SHA256) {
      errors.push("ART-R2 push-ratchet predecessor does not contain the preserved REC-01 simulation fixture");
    }
  }
  if (changeRoute === "art-r2-implementation") {
    const predecessorBaselineHash = facts.eventName === "pull_request"
      ? facts.prBaseSimulationBaselineHash
      : facts.pushBeforeSimulationBaselineHash;
    if (predecessorBaselineHash !== REC_01_SIMULATION_BASELINE_SHA256) {
      errors.push("ART-R2 implementation predecessor does not contain the preserved REC-01 simulation fixture");
    }
    if (facts.artR2ImplementationContentManifestHash !== ART_R2_IMPLEMENTATION_CONTENT_MANIFEST_SHA256) {
      errors.push("ART-R2 implementation 79-path content manifest differs from the held approved head");
    }
    if (facts.artR2ImageContentManifestHash !== ART_R2_IMAGE_CONTENT_MANIFEST_SHA256) {
      errors.push("ART-R2 implementation 55-image content manifest differs from the held approved head");
    }
    if (facts.artR2IntegrationRecordHash !== ART_R2_INTEGRATION_RECORD_SHA256) {
      errors.push(`${ART_R2_INTEGRATION_RECORD_PATH}: bytes differ from the held approved integration record`);
    }
    if (facts.artR2ValidatorHash !== ART_R2_VALIDATOR_SHA256) {
      errors.push("scripts/validate-art-r2.mjs: bytes differ from the held approved ART validator");
    }
    if (facts.verifyScriptHash !== ART_R2_VERIFY_SHA256) {
      errors.push("scripts/verify.mjs: bytes differ from the held approved ART target");
    }
  }

  return { passed: errors.length === 0, errors, notices, route: changeRoute };
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
    statusHash: "0".repeat(64),
    gov01Hash: GOV_01_SHA256,
    recoveryDecHash: RECOVERY_DEC_SHA256,
    pipeBootText: `# PIPE-BOOT — Governed Recovery Pipeline\n${RECOVERY_BRANCH}\nNO-PUBLISH`,
    reconciliationText: `# PIPE-BOOT-R1\n${RECOVERY_BASE_SHA}\nNO-PUBLISH`,
    netlifyHash: NETLIFY_NO_BUILD_SHA256,
    simulationBaselineHash: SIMULATION_BASELINE_SHA256,
    recRatchetHash: null,
    recRatchetBaselineHash: null,
    recRatchetPatchHash: null,
    artR2GovernanceDocumentHashes: { ...ART_R2_GOVERNANCE_DOCUMENT_SHA256 },
    artR2ImmutableGovernanceHashes: { ...ART_R2_IMMUTABLE_GOVERNANCE_SHA256 },
    artR2PushRatchetDocumentHash: null,
    artR2ImplementationContentManifestHash: null,
    artR2ImageContentManifestHash: null,
    artR2IntegrationRecordHash: null,
    artR2ValidatorHash: null,
    scenes41Hash: "0".repeat(64),
    verifyScriptHash: "0".repeat(64),
    prBaseSimulationBaselineHash: SIMULATION_BASELINE_SHA256,
    pushBeforeSimulationBaselineHash: null,
    prBaseIsRecRatchetSuccessor: false,
    prBaseIsArtR2GovernanceSuccessor: false,
    prHeadIsArtR2PushRatchetHead: false,
    prCheckoutIsArtR2PushRatchetSuccessor: false,
    prBaseIsArtR2PushRatchetSuccessor: false,
    prHeadIsArtR2ReconciledHead: false,
    prCheckoutIsArtR2ImplementationSuccessor: false,
    pushBeforeIsRecRatchetSuccessor: false,
    pushAfterIsArtR2GovernanceSuccessor: false,
    pushBeforeIsArtR2PushRatchetSuccessor: false,
    pushAfterIsArtR2PushRatchetSuccessor: false,
    pushAfterIsArtR2ImplementationSuccessor: false,
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

function writeGitObject(type, payload, { literally = false } = {}) {
  assert.ok(Buffer.isBuffer(payload), `${type} fixture payload must be a Buffer`);
  const output = gitRaw([
    "hash-object",
    ...(literally ? ["--literally"] : []),
    "-t",
    type,
    "-w",
    "--stdin"
  ], { input: payload });
  const match = output.toString("ascii").match(/^([0-9a-f]{40})\n$/);
  assert.ok(match, `git hash-object returned an invalid ${type} object id`);
  return match[1];
}

function rawCommitPayload(headerLines, messageBytes) {
  assert.ok(
    Array.isArray(headerLines) && headerLines.every(line => typeof line === "string" && !line.includes("\n")),
    "raw commit fixture headers must be single lines"
  );
  assert.ok(Buffer.isBuffer(messageBytes), "raw commit fixture message must be a Buffer");
  return Buffer.concat([
    Buffer.from(`${headerLines.join("\n")}\n\n`, "utf8"),
    messageBytes
  ]);
}

function writeRawCommitFixture({
  tree,
  parents = [ART_R2_PUSH_RATCHET_BASE_SHA],
  authorHeader = ART_R2_PUSH_RATCHET_AUTHOR_HEADER,
  committerHeader = ART_R2_PUSH_RATCHET_COMMITTER_HEADER,
  message,
  headerLines = null
}) {
  const headers = headerLines || [
    `tree ${tree}`,
    ...parents.map(parent => `parent ${parent}`),
    authorHeader,
    committerHeader
  ];
  return writeGitObject("commit", rawCommitPayload(headers, message), { literally: true });
}

function commitMessageBytes(rawCommit) {
  const boundary = rawCommit.payload.indexOf(Buffer.from("\n\n", "ascii"));
  assert.ok(boundary >= 0, `commit ${rawCommit.oid} has no raw header/message boundary`);
  return rawCommit.payload.subarray(boundary + 2);
}

function mutateTree(ref, { path, bytes = null, mode = "100644", remove = false }) {
  const temporaryDirectory = mkdtempSync(resolve(tmpdir(), "sunsplitter-b01-index-"));
  const environment = { GIT_INDEX_FILE: resolve(temporaryDirectory, "index") };
  try {
    gitRaw(["read-tree", ref], { env: environment });
    if (remove) {
      gitRaw(["update-index", "--force-remove", "--", path], { env: environment });
    } else {
      const blobBytes = bytes || gitRaw(["show", `${ref}:${path}`]);
      const blob = writeGitObject("blob", blobBytes);
      gitRaw(["update-index", "--add", "--cacheinfo", mode, blob, path], { env: environment });
    }
    const output = gitRaw(["write-tree"], { env: environment });
    const match = output.toString("ascii").match(/^([0-9a-f]{40})\n$/);
    assert.ok(match, "git write-tree returned an invalid tree object id");
    return match[1];
  } finally {
    rmSync(temporaryDirectory, { recursive: true, force: true });
  }
}

function findExactArtR2PushRatchetHeadForSelfTest() {
  const reachable = git(["rev-list", "--topo-order", "HEAD"]).split(/\r?\n/).filter(Boolean);
  const candidate = reachable.find(isExactArtR2PushRatchetHead);
  assert.ok(candidate, "exact ART-R2 B01 precursor is not reachable from HEAD");
  return candidate;
}

function assertArtR2B01RealObjectFixtures() {
  const candidate = findExactArtR2PushRatchetHeadForSelfTest();
  const candidateTree = gitTreeSha(candidate);
  const candidateHashes = Object.fromEntries(
    ART_R2_PUSH_RATCHET_CHANGED_PATHS.map(path => [path, gitFileSha256(candidate, path)])
  );
  const canonicalMessage = artR2PushRatchetManifestMessageBytes(candidateHashes);
  const expectedPayload = artR2PushRatchetExpectedRawCommitPayload(candidate);
  const candidateRaw = gitRawCommitObject(candidate);
  assert.ok(candidateRaw && canonicalMessage && expectedPayload, "corrected candidate raw identity is unreadable");
  assert.equal(candidateRaw.oid, candidate);
  assert.equal(candidateRaw.framedSha1, candidate);
  assert.ok(candidateRaw.payload.equals(expectedPayload));
  assert.ok(commitMessageBytes(candidateRaw).equals(canonicalMessage));
  assert.equal(canonicalMessage.at(-1), 0x0a);
  assert.equal(
    artR2PushRatchetPolicyProjectionSha256(candidate),
    ART_R2_PUSH_RATCHET_POLICY_PROJECTION_SHA256
  );
  assert.equal(writeGitObject("commit", expectedPayload), candidate);

  const oldMessage = Buffer.from([
    "ART-R2-PUSH-RATCHET-R1: repair protected push policy",
    "",
    "NO-PUBLISH / NOT CERTIFIED",
    "",
    "ART-R2-PUSH-RATCHET-R1-File-SHA256: artifacts/ART-INTEGRATION-R2_PROTECTED_PUSH_REPAIR.md=d276dc60f4a576ee83838891c564f34a6b1276ded11f302c28087f5c9553b5d1",
    "ART-R2-PUSH-RATCHET-R1-File-SHA256: artifacts/PROJECT_STATUS.md=7f6d07df265910d707a0231115c77a34d33a5d01f677925f7eee884477ee86b4",
    "ART-R2-PUSH-RATCHET-R1-File-SHA256: scripts/release-policy.mjs=0c88592906a016cfd3c5344c008abbee66862e34e452f473ea105382c98f7258"
  ].join("\n"), "utf8");
  const oldPayload = rawCommitPayload([
    `tree ${ART_R2_B01_OLD_TREE_SHA}`,
    `parent ${ART_R2_PUSH_RATCHET_BASE_SHA}`,
    "author Manraj Bains <54219887+mbains89@users.noreply.github.com> 1787276927 -0500",
    "committer Manraj Bains <54219887+mbains89@users.noreply.github.com> 1787276927 -0500"
  ], oldMessage);
  assert.equal(writeGitObject("commit", oldPayload), ART_R2_B01_OLD_HEAD_SHA);
  const oldRaw = gitRawCommitObject(ART_R2_B01_OLD_HEAD_SHA);
  assert.ok(oldRaw, "reconstructed superseded ART-R2 precursor raw object is unreadable");
  assert.ok(commitMessageBytes(oldRaw).equals(oldMessage));
  assert.equal(oldRaw.payload.length, 755);
  assert.equal(oldRaw.payloadSha256, ART_R2_B01_OLD_PAYLOAD_SHA256);
  assert.equal(oldMessage.length, 493);
  assert.equal(sha256(oldMessage), ART_R2_B01_OLD_MESSAGE_SHA256);
  assert.notEqual(oldMessage.at(-1), 0x0a);

  const alternateMessage = Buffer.concat([oldMessage, Buffer.from("\n", "ascii")]);
  const alternate = writeRawCommitFixture({
    tree: ART_R2_B01_OLD_TREE_SHA,
    authorHeader: "author Codex <codex@openai.com> 1787275397 +0900",
    committerHeader: "committer Codex <codex@openai.com> 1787275597 +0900",
    message: alternateMessage
  });
  assert.equal(alternate, ART_R2_B01_ALTERNATE_SHA);
  const alternateRaw = gitRawCommitObject(alternate);
  assert.ok(alternateRaw, "prohibited alternate raw object is unreadable");
  assert.equal(alternateRaw.payload.length, 690);
  assert.equal(alternateRaw.payloadSha256, ART_R2_B01_ALTERNATE_PAYLOAD_SHA256);
  assert.equal(alternateMessage.length, 494);
  assert.equal(sha256(alternateMessage), ART_R2_B01_ALTERNATE_MESSAGE_SHA256);
  assert.equal(alternateMessage.at(-1), 0x0a);
  assert.equal(isExactArtR2PushRatchetHead(alternate), false);

  const canonicalHeaders = [
    `tree ${candidateTree}`,
    `parent ${ART_R2_PUSH_RATCHET_BASE_SHA}`,
    ART_R2_PUSH_RATCHET_AUTHOR_HEADER,
    ART_R2_PUSH_RATCHET_COMMITTER_HEADER
  ];
  const manifestLines = canonicalMessage.toString("utf8").split("\n");
  const writeHeaderOrMessageFixture = ({ headerLines = canonicalHeaders, message = canonicalMessage }) =>
    writeRawCommitFixture({ tree: candidateTree, message, headerLines });
  const headFixtures = new Map();
  headFixtures.set("terminal LF removed", writeHeaderOrMessageFixture({
    message: canonicalMessage.subarray(0, canonicalMessage.length - 1)
  }));
  headFixtures.set("terminal LF duplicated", writeHeaderOrMessageFixture({
    message: Buffer.concat([canonicalMessage, Buffer.from("\n", "ascii")])
  }));
  headFixtures.set("CRLF-normalized equivalent", writeHeaderOrMessageFixture({
    message: Buffer.from(canonicalMessage.toString("utf8").replaceAll("\n", "\r\n"), "utf8")
  }));
  headFixtures.set("missing raw blank-line boundary", writeGitObject("commit", Buffer.concat([
    Buffer.from(`${canonicalHeaders.join("\n")}\n`, "utf8"),
    canonicalMessage
  ]), { literally: true }));
  headFixtures.set("additional raw blank-line boundary", writeHeaderOrMessageFixture({
    message: Buffer.concat([Buffer.from("\n", "ascii"), canonicalMessage])
  }));
  headFixtures.set("altered canonical title", writeHeaderOrMessageFixture({
    message: Buffer.from(
      canonicalMessage.toString("utf8").replace(
        ART_R2_PUSH_RATCHET_COMMIT_TITLE,
        "ART-R2-PUSH-RATCHET-R1-B01: generic bypass"
      ),
      "utf8"
    )
  }));
  headFixtures.set("altered NO-PUBLISH token", writeHeaderOrMessageFixture({
    message: Buffer.from(
      canonicalMessage.toString("utf8").replace("NO-PUBLISH / NOT CERTIFIED", "PUBLISH / CERTIFIED"),
      "utf8"
    )
  }));
  headFixtures.set("author identity", writeRawCommitFixture({
    tree: candidateTree,
    authorHeader: "author Other <other@example.invalid> 1787299200 -0500",
    message: canonicalMessage
  }));
  headFixtures.set("author timestamp", writeRawCommitFixture({
    tree: candidateTree,
    authorHeader: "author Codex <codex@openai.com> 1787299201 -0500",
    message: canonicalMessage
  }));
  headFixtures.set("author timezone", writeRawCommitFixture({
    tree: candidateTree,
    authorHeader: "author Codex <codex@openai.com> 1787299200 +0000",
    message: canonicalMessage
  }));
  headFixtures.set("committer identity", writeRawCommitFixture({
    tree: candidateTree,
    committerHeader: "committer Other <other@example.invalid> 1787299260 -0500",
    message: canonicalMessage
  }));
  headFixtures.set("committer timestamp", writeRawCommitFixture({
    tree: candidateTree,
    committerHeader: "committer Codex <codex@openai.com> 1787299261 -0500",
    message: canonicalMessage
  }));
  headFixtures.set("committer timezone", writeRawCommitFixture({
    tree: candidateTree,
    committerHeader: "committer Codex <codex@openai.com> 1787299260 +0000",
    message: canonicalMessage
  }));
  headFixtures.set("reordered headers", writeHeaderOrMessageFixture({
    headerLines: [canonicalHeaders[0], canonicalHeaders[1], canonicalHeaders[3], canonicalHeaders[2]]
  }));
  headFixtures.set("duplicate header", writeHeaderOrMessageFixture({
    headerLines: [...canonicalHeaders, ART_R2_PUSH_RATCHET_COMMITTER_HEADER]
  }));
  headFixtures.set("missing header", writeHeaderOrMessageFixture({
    headerLines: canonicalHeaders.filter(line => line !== ART_R2_PUSH_RATCHET_AUTHOR_HEADER)
  }));
  headFixtures.set("extra header", writeHeaderOrMessageFixture({
    headerLines: [...canonicalHeaders, "x-b01 unexpected"]
  }));
  headFixtures.set("encoding header", writeHeaderOrMessageFixture({
    headerLines: [...canonicalHeaders, "encoding UTF-8"]
  }));
  headFixtures.set("signature header", writeHeaderOrMessageFixture({
    headerLines: [...canonicalHeaders, "gpgsig prohibited-fixture"]
  }));
  headFixtures.set("multiline signature header", writeHeaderOrMessageFixture({
    headerLines: [
      ...canonicalHeaders,
      "gpgsig -----BEGIN PGP SIGNATURE-----",
      " prohibited-fixture-continuation",
      " -----END PGP SIGNATURE-----"
    ]
  }));
  headFixtures.set("additional parent", writeRawCommitFixture({
    tree: candidateTree,
    parents: [ART_R2_PUSH_RATCHET_BASE_SHA, ART_R2_B01_OLD_HEAD_SHA],
    message: canonicalMessage
  }));
  headFixtures.set("stale predecessor", writeRawCommitFixture({
    tree: candidateTree,
    parents: [ART_R2_B01_OLD_HEAD_SHA],
    message: canonicalMessage
  }));

  const missingManifest = [...manifestLines];
  missingManifest.splice(4, 1);
  headFixtures.set("missing manifest entry", writeHeaderOrMessageFixture({
    message: Buffer.from(missingManifest.join("\n"), "utf8")
  }));
  const duplicateManifest = [...manifestLines];
  duplicateManifest.splice(5, 0, duplicateManifest[4]);
  headFixtures.set("duplicate manifest entry", writeHeaderOrMessageFixture({
    message: Buffer.from(duplicateManifest.join("\n"), "utf8")
  }));
  const additionalManifest = [...manifestLines];
  additionalManifest.splice(
    -1,
    0,
    `ART-R2-PUSH-RATCHET-R1-File-SHA256: README.md=${"a".repeat(64)}`
  );
  headFixtures.set("additional manifest entry", writeHeaderOrMessageFixture({
    message: Buffer.from(additionalManifest.join("\n"), "utf8")
  }));
  const reorderedManifest = [...manifestLines];
  [reorderedManifest[4], reorderedManifest[5]] = [reorderedManifest[5], reorderedManifest[4]];
  headFixtures.set("reordered manifest entries", writeHeaderOrMessageFixture({
    message: Buffer.from(reorderedManifest.join("\n"), "utf8")
  }));
  const mismatchedManifest = [...manifestLines];
  mismatchedManifest[4] = mismatchedManifest[4].replace(/[0-9a-f]{64}$/, "0".repeat(64));
  headFixtures.set("mismatched manifest entry", writeHeaderOrMessageFixture({
    message: Buffer.from(mismatchedManifest.join("\n"), "utf8")
  }));

  for (const [label, fixture] of headFixtures) {
    assert.notEqual(fixture, candidate, `${label} fixture unexpectedly reproduced the candidate`);
    assert.equal(isExactArtR2PushRatchetHead(fixture), false, `${label} raw object was accepted`);
  }

  const fixtureMergeMessage = Buffer.from("ART-R2 B01 real-object topology fixture\n", "utf8");
  const positiveSuccessor = writeRawCommitFixture({
    tree: candidateTree,
    parents: [ART_R2_PUSH_RATCHET_BASE_SHA, candidate],
    authorHeader: "author B01 Fixture <b01@example.invalid> 1787299320 -0500",
    committerHeader: "committer B01 Fixture <b01@example.invalid> 1787299380 -0500",
    message: fixtureMergeMessage
  });
  assert.equal(isExactArtR2PushRatchetSuccessor(positiveSuccessor), true);

  const alternateSuccessor = writeRawCommitFixture({
    tree: ART_R2_B01_OLD_TREE_SHA,
    parents: [ART_R2_PUSH_RATCHET_BASE_SHA, alternate],
    authorHeader: "author B01 Fixture <b01@example.invalid> 1787299440 -0500",
    committerHeader: "committer B01 Fixture <b01@example.invalid> 1787299500 -0500",
    message: fixtureMergeMessage
  });
  assert.deepEqual(gitParents(alternateSuccessor), [ART_R2_PUSH_RATCHET_BASE_SHA, alternate]);
  assert.equal(isExactArtR2PushRatchetSuccessor(alternateSuccessor), false);

  const topologyFixtures = new Map([
    ["one-parent protected merge", writeRawCommitFixture({
      tree: candidateTree,
      parents: [candidate],
      message: fixtureMergeMessage
    })],
    ["squash", writeRawCommitFixture({
      tree: candidateTree,
      parents: [ART_R2_PUSH_RATCHET_BASE_SHA],
      message: Buffer.from("squashed B01 fixture\n", "utf8")
    })],
    ["rebase", writeRawCommitFixture({
      tree: candidateTree,
      parents: [ART_R2_B01_OLD_HEAD_SHA],
      message: Buffer.from("rebased B01 fixture\n", "utf8")
    })],
    ["cherry-pick", writeRawCommitFixture({
      tree: candidateTree,
      parents: [ART_R2_PUSH_RATCHET_BASE_SHA],
      authorHeader: "author Cherry Pick <pick@example.invalid> 1787299560 -0500",
      committerHeader: "committer Cherry Pick <pick@example.invalid> 1787299620 -0500",
      message: canonicalMessage
    })],
    ["swapped parents", writeRawCommitFixture({
      tree: candidateTree,
      parents: [candidate, ART_R2_PUSH_RATCHET_BASE_SHA],
      message: fixtureMergeMessage
    })],
    ["octopus", writeRawCommitFixture({
      tree: candidateTree,
      parents: [ART_R2_PUSH_RATCHET_BASE_SHA, candidate, ART_R2_B01_OLD_HEAD_SHA],
      message: fixtureMergeMessage
    })],
    ["repeated use", writeRawCommitFixture({
      tree: candidateTree,
      parents: [positiveSuccessor, candidate],
      message: fixtureMergeMessage
    })]
  ]);
  assert.equal(isExactArtR2PushRatchetSuccessor(candidate), false);
  for (const [label, fixture] of topologyFixtures) {
    assert.equal(isExactArtR2PushRatchetHead(fixture), false, `${label} object was accepted as the precursor`);
    assert.equal(isExactArtR2PushRatchetSuccessor(fixture), false, `${label} object was accepted as the successor`);
  }

  const changedBytes = (path, marker) => Buffer.concat([
    gitRaw(["show", `${candidate}:${path}`]),
    Buffer.from(marker, "utf8")
  ]);
  const workflowBytes = gitRaw(["show", `${candidate}:.github/workflows/verify.yml`]);
  const weakenedWorkflowBytes = Buffer.from(
    workflowBytes.toString("utf8").replace("contents: read", "contents: write"),
    "utf8"
  );
  assert.notDeepEqual(weakenedWorkflowBytes, workflowBytes, "workflow weakening fixture did not alter bytes");
  const treeFixtures = new Map([
    ["wrong tree", ART_R2_PUSH_RATCHET_BASE_TREE_SHA],
    ["wrong mode", mutateTree(candidate, {
      path: ART_R2_PUSH_RATCHET_RECORD_PATH,
      mode: "100755"
    })],
    ["missing path", mutateTree(candidate, {
      path: ART_R2_PUSH_RATCHET_RECORD_PATH,
      remove: true
    })],
    ["extra path", mutateTree(candidate, {
      path: "artifacts/ART-R2-B01-EXTRA.md",
      bytes: Buffer.from("prohibited extra path\n", "utf8")
    })],
    ["changed path", mutateTree(candidate, {
      path: "artifacts/PROJECT_STATUS.md",
      bytes: changedBytes("artifacts/PROJECT_STATUS.md", "\nprohibited changed-path fixture\n")
    })],
    ["content drift", mutateTree(candidate, {
      path: ART_R2_PUSH_RATCHET_RECORD_PATH,
      bytes: changedBytes(ART_R2_PUSH_RATCHET_RECORD_PATH, "\nprohibited content drift\n")
    })],
    ["governance drift", mutateTree(candidate, {
      path: "artifacts/LOCKS.md",
      bytes: changedBytes("artifacts/LOCKS.md", "\nprohibited governance drift\n")
    })],
    ["artwork drift", mutateTree(candidate, {
      path: "images/corridor.jpg",
      bytes: changedBytes("images/corridor.jpg", "B01-artwork-drift")
    })],
    ["REC-01 fixture drift", mutateTree(candidate, {
      path: SIMULATION_BASELINE_PATH,
      bytes: changedBytes(SIMULATION_BASELINE_PATH, "\nprohibited REC-01 fixture drift\n")
    })],
    ["REC-01 authority drift", mutateTree(candidate, {
      path: REC_RATCHET_ARTIFACT_PATH,
      bytes: changedBytes(REC_RATCHET_ARTIFACT_PATH, "\nprohibited REC-01 authority drift\n")
    })],
    ["workflow weakening", mutateTree(candidate, {
      path: ".github/workflows/verify.yml",
      bytes: weakenedWorkflowBytes
    })],
    ["workflow drift", mutateTree(candidate, {
      path: ".github/workflows/release-policy.yml",
      bytes: changedBytes(".github/workflows/release-policy.yml", "\n# prohibited workflow drift\n")
    })],
    ["unrelated recovery work", mutateTree(candidate, {
      path: "src/scenes-22.js",
      bytes: changedBytes("src/scenes-22.js", "\n// prohibited unrelated recovery work\n")
    })],
    ["version change", mutateTree(candidate, {
      path: "VERSION.md",
      bytes: changedBytes("VERSION.md", "\nprohibited version change\n")
    })],
    ["release change", mutateTree(candidate, {
      path: "artifacts/ART-R2-B01-RELEASE.md",
      bytes: Buffer.from("prohibited release change\n", "utf8")
    })],
    ["deployment change", mutateTree(candidate, {
      path: "netlify.toml",
      bytes: changedBytes("netlify.toml", "\n# prohibited deployment change\n")
    })],
    ["publication change", mutateTree(candidate, {
      path: "scripts/publish-b01.mjs",
      bytes: Buffer.from("throw new Error('prohibited publication change');\n", "utf8")
    })],
    ["secret change", mutateTree(candidate, {
      path: ".env",
      bytes: Buffer.from("PROHIBITED_SECRET=fixture\n", "utf8")
    })],
    ["ruleset change", mutateTree(candidate, {
      path: ".github/rulesets/b01.json",
      bytes: Buffer.from("{}\n", "utf8")
    })],
    ["administration change", mutateTree(candidate, {
      path: ".github/settings.yml",
      bytes: Buffer.from("prohibited: true\n", "utf8")
    })]
  ]);
  for (const [label, tree] of treeFixtures) {
    const fixture = writeRawCommitFixture({ tree, message: canonicalMessage });
    assert.equal(isExactArtR2PushRatchetHead(fixture), false, `${label} tree object was accepted`);
  }

  const unsealedPolicyDrift = changedBytes(
    ART_R2_PUSH_RATCHET_POLICY_PATH,
    "\n// prohibited policy content drift\n"
  );
  const projectionPrefix = Buffer.from(
    "const ART_R2_PUSH_RATCHET_POLICY_PROJECTION_SHA256 = \"",
    "ascii"
  );
  const projectionPrefixStart = unsealedPolicyDrift.indexOf(projectionPrefix);
  assert.ok(
    projectionPrefixStart >= 0 && projectionPrefixStart === unsealedPolicyDrift.lastIndexOf(projectionPrefix),
    "policy-drift fixture projection marker is not unique"
  );
  const projectionDigestStart = projectionPrefixStart + projectionPrefix.length;
  const projectionDigestEnd = projectionDigestStart + 64;
  const zeroProjectedPolicyDrift = Buffer.concat([
    unsealedPolicyDrift.subarray(0, projectionDigestStart),
    Buffer.from("0".repeat(64), "ascii"),
    unsealedPolicyDrift.subarray(projectionDigestEnd)
  ]);
  const policyDriftProjection = sha256(zeroProjectedPolicyDrift);
  const selfConsistentPolicyDrift = Buffer.concat([
    unsealedPolicyDrift.subarray(0, projectionDigestStart),
    Buffer.from(policyDriftProjection, "ascii"),
    unsealedPolicyDrift.subarray(projectionDigestEnd)
  ]);
  assert.equal(
    sha256(Buffer.concat([
      selfConsistentPolicyDrift.subarray(0, projectionDigestStart),
      Buffer.from("0".repeat(64), "ascii"),
      selfConsistentPolicyDrift.subarray(projectionDigestEnd)
    ])),
    policyDriftProjection,
    "policy-drift fixture is not projection-self-consistent"
  );
  const policyDriftTree = mutateTree(candidate, {
    path: ART_R2_PUSH_RATCHET_POLICY_PATH,
    bytes: selfConsistentPolicyDrift
  });
  const policyDriftHashes = Object.fromEntries(
    ART_R2_PUSH_RATCHET_CHANGED_PATHS.map(path => [path, gitFileSha256(policyDriftTree, path)])
  );
  const policyDriftMessage = artR2PushRatchetManifestMessageBytes(policyDriftHashes);
  assert.ok(policyDriftMessage, "policy-drift manifest fixture could not be constructed");
  const policyDrift = writeRawCommitFixture({
    tree: policyDriftTree,
    message: policyDriftMessage
  });
  assert.equal(
    isExactArtR2PushRatchetHead(policyDrift),
    false,
    "self-consistent policy content drift was accepted"
  );

  const tag = writeGitObject("tag", Buffer.from([
    `object ${candidate}`,
    "type commit",
    "tag art-r2-b01-negative-fixture",
    "tagger Codex <codex@openai.com> 1787299680 -0500",
    "",
    "prohibited tag-creation fixture",
    ""
  ].join("\n"), "utf8"));
  assert.equal(isExactArtR2PushRatchetHead(tag), false);
  assert.equal(isExactArtR2PushRatchetSuccessor(tag), false);
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
  assert.deepEqual(
    [...LOCK_RECORD_CHANGED_PATHS].sort(),
    [
      "artifacts/LOCKS.md",
      "artifacts/PROJECT_STATUS.md",
      "artifacts/ROADMAP.md",
      "scripts/release-policy.mjs"
    ].sort()
  );
  assert.deepEqual(
    [...ART_R2_GOVERNANCE_CHANGED_PATHS].sort(),
    [
      "artifacts/ART-INTEGRATION-R2_GOVERNANCE_REPIN.md",
      "artifacts/ART_RULES.md",
      "artifacts/LOCKS.md",
      "artifacts/PROJECT_STATUS.md",
      "artifacts/ROADMAP.md",
      "scripts/release-policy.mjs"
    ].sort()
  );
  assert.deepEqual(
    [...ART_R2_PUSH_RATCHET_CHANGED_PATHS].sort(),
    [
      "artifacts/ART-INTEGRATION-R2_PROTECTED_PUSH_REPAIR.md",
      "artifacts/PROJECT_STATUS.md",
      "scripts/release-policy.mjs"
    ].sort()
  );
  assert.equal(ART_R2_IMPLEMENTATION_CHANGED_PATHS.length, 79);
  assert.equal(new Set(ART_R2_IMPLEMENTATION_CHANGED_PATHS).size, 79);
  assert.equal(ART_R2_IMAGE_PATHS.length, 55);
  assert.equal(new Set(ART_R2_IMAGE_PATHS).size, 55);

  assert.notEqual(ART_R2_PUSH_RATCHET_DOCUMENT_SHA256, "0".repeat(64));
  assert.notEqual(ART_R2_PUSH_RATCHET_STATUS_SHA256, "0".repeat(64));
  assert.equal(
    sha256(readFileSync(resolve(ROOT, ART_R2_PUSH_RATCHET_RECORD_PATH))),
    ART_R2_PUSH_RATCHET_DOCUMENT_SHA256
  );
  assert.equal(
    sha256(readFileSync(resolve(ROOT, "artifacts/PROJECT_STATUS.md"))),
    ART_R2_PUSH_RATCHET_STATUS_SHA256
  );
  assert.equal(gitTreeSha(ART_R2_PUSH_RATCHET_BASE_SHA), ART_R2_PUSH_RATCHET_BASE_TREE_SHA);
  assert.equal(gitTreeSha(ART_R2_HELD_IMPLEMENTATION_HEAD_SHA), ART_R2_HELD_IMPLEMENTATION_TREE_SHA);
  assert.equal(
    gitFilesContentManifestSha256(ART_R2_HELD_IMPLEMENTATION_HEAD_SHA, ART_R2_IMPLEMENTATION_CHANGED_PATHS),
    ART_R2_IMPLEMENTATION_CONTENT_MANIFEST_SHA256
  );
  assert.equal(
    gitFilesContentManifestSha256(ART_R2_HELD_IMPLEMENTATION_HEAD_SHA, ART_R2_IMAGE_PATHS),
    ART_R2_IMAGE_CONTENT_MANIFEST_SHA256
  );
  assert.equal(
    gitFileSha256(ART_R2_HELD_IMPLEMENTATION_HEAD_SHA, ART_R2_INTEGRATION_RECORD_PATH),
    ART_R2_INTEGRATION_RECORD_SHA256
  );
  assert.equal(
    gitFileSha256(ART_R2_HELD_IMPLEMENTATION_HEAD_SHA, "scripts/validate-art-r2.mjs"),
    ART_R2_VALIDATOR_SHA256
  );
  assert.equal(
    gitFileSha256(ART_R2_HELD_IMPLEMENTATION_HEAD_SHA, "scripts/verify.mjs"),
    ART_R2_VERIFY_SHA256
  );

  const manifestHashes = Object.fromEntries(
    ART_R2_PUSH_RATCHET_CHANGED_PATHS.map((path, index) => [path, String(index + 1).repeat(64)])
  );
  const manifestPrefix = "ART-R2-PUSH-RATCHET-R1-File-SHA256: ";
  const expectedManifestMessage = Buffer.from([
    ART_R2_PUSH_RATCHET_COMMIT_TITLE,
    "",
    "NO-PUBLISH / NOT CERTIFIED",
    "",
    ...ART_R2_PUSH_RATCHET_CHANGED_PATHS.map(
      path => `${manifestPrefix}${path}=${manifestHashes[path]}`
    ),
    ""
  ].join("\n"), "utf8");
  const manifestMessage = artR2PushRatchetManifestMessageBytes(manifestHashes);
  assert.ok(manifestMessage?.equals(expectedManifestMessage));
  assert.equal(manifestMessage.at(-1), 0x0a);
  assert.equal(
    artR2PushRatchetManifestMessageBytes({
      ...manifestHashes,
      [ART_R2_PUSH_RATCHET_CHANGED_PATHS[0]]: "not-a-sha256"
    }),
    null
  );
  assertArtR2B01RealObjectFixtures();

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

  const recRatchet = structuredClone(positive);
  Object.assign(recRatchet, {
    headRef: REC_RATCHET_HEAD,
    prBaseSha: REC_RATCHET_BASE_SHA,
    changedPaths: [...REC_RATCHET_01_CHANGED_PATHS],
    recRatchetHash: REC_RATCHET_ARTIFACT_SHA256,
    recRatchetBaselineHash: REC_01_SIMULATION_BASELINE_SHA256,
    recRatchetPatchHash: REC_RATCHET_PATCH_ARTIFACT_SHA256
  });
  assert.deepEqual(evaluatePolicy(recRatchet).errors, []);
  expectFailure(recRatchet, facts => { facts.prBaseSha = PIPE_BOOT_MERGE_SHA; }, "REC-RATCHET base");
  expectFailure(recRatchet, facts => { facts.changedPaths.push("README.md"); }, "REC-RATCHET-01 set");
  expectFailure(recRatchet, facts => { facts.changedPaths.pop(); }, "REC-RATCHET-01 set");
  expectFailure(recRatchet, facts => { facts.recRatchetHash = "c".repeat(64); }, "authorized transition artifact");
  expectFailure(recRatchet, facts => { facts.recRatchetBaselineHash = "c".repeat(64); }, "authorized inactive baseline");
  expectFailure(recRatchet, facts => { facts.recRatchetPatchHash = "c".repeat(64); }, "authorized implementation patch");

  const rec01 = structuredClone(positive);
  Object.assign(rec01, {
    headRef: REC_01_HEAD,
    prBaseSha: "d".repeat(40),
    changedPaths: [...REC_01_CHANGED_PATHS],
    simulationBaselineHash: REC_01_SIMULATION_BASELINE_SHA256,
    recRatchetHash: REC_RATCHET_ARTIFACT_SHA256,
    recRatchetBaselineHash: REC_01_SIMULATION_BASELINE_SHA256,
    recRatchetPatchHash: REC_RATCHET_PATCH_ARTIFACT_SHA256,
    scenes41Hash: REC_01_SCENES_41_SHA256,
    verifyScriptHash: REC_01_VERIFY_SHA256,
    prBaseSimulationBaselineHash: SIMULATION_BASELINE_SHA256,
    prBaseIsRecRatchetSuccessor: true
  });
  assert.deepEqual(evaluatePolicy(rec01).errors, []);
  expectFailure(rec01, facts => { facts.prBaseIsRecRatchetSuccessor = false; }, "exact REC-RATCHET-01 merge-commit successor");
  expectFailure(rec01, facts => { facts.prBaseSimulationBaselineHash = REC_01_SIMULATION_BASELINE_SHA256; }, "pre-transition simulation baseline");
  expectFailure(rec01, facts => { facts.simulationBaselineHash = SIMULATION_BASELINE_SHA256; }, "authorized replacement");
  expectFailure(rec01, facts => { facts.recRatchetHash = "c".repeat(64); }, "authorized transition artifact");
  expectFailure(rec01, facts => { facts.recRatchetBaselineHash = "c".repeat(64); }, "authorized inactive baseline");
  expectFailure(rec01, facts => { facts.recRatchetPatchHash = "c".repeat(64); }, "authorized implementation patch");
  expectFailure(rec01, facts => { facts.scenes41Hash = "c".repeat(64); }, "authorized REC-01 target");
  expectFailure(rec01, facts => { facts.verifyScriptHash = "c".repeat(64); }, "authorized REC-01 target");
  expectFailure(rec01, facts => { facts.changedPaths.push("README.md"); }, "one-shot REC-01 set");
  expectFailure(rec01, facts => { facts.changedPaths.pop(); }, "one-shot REC-01 set");

  const lockRecord = structuredClone(positive);
  Object.assign(lockRecord, {
    headRef: LOCK_RECORD_HEAD,
    prBaseSha: LOCK_RECORD_BASE_SHA,
    changedPaths: [...LOCK_RECORD_CHANGED_PATHS],
    simulationBaselineHash: REC_01_SIMULATION_BASELINE_SHA256,
    recRatchetHash: REC_RATCHET_ARTIFACT_SHA256,
    recRatchetBaselineHash: REC_01_SIMULATION_BASELINE_SHA256,
    recRatchetPatchHash: REC_RATCHET_PATCH_ARTIFACT_SHA256,
    scenes41Hash: REC_01_SCENES_41_SHA256,
    verifyScriptHash: REC_01_VERIFY_SHA256
  });
  assert.deepEqual(evaluatePolicy(lockRecord).errors, []);
  expectFailure(lockRecord, facts => { facts.prBaseSha = "c".repeat(40); }, "lock-record base");
  expectFailure(lockRecord, facts => { facts.changedPaths.push("README.md"); }, "one-shot lock-record set");
  expectFailure(lockRecord, facts => { facts.changedPaths.pop(); }, "one-shot lock-record set");
  expectFailure(lockRecord, facts => { facts.simulationBaselineHash = SIMULATION_BASELINE_SHA256; }, "authorized replacement");
  expectFailure(lockRecord, facts => { facts.recRatchetHash = "c".repeat(64); }, "authorized transition artifact");
  expectFailure(lockRecord, facts => { facts.recRatchetBaselineHash = "c".repeat(64); }, "authorized inactive baseline");
  expectFailure(lockRecord, facts => { facts.recRatchetPatchHash = "c".repeat(64); }, "authorized implementation patch");
  expectFailure(lockRecord, facts => { facts.scenes41Hash = "c".repeat(64); }, "authorized REC-01 target");
  expectFailure(lockRecord, facts => { facts.verifyScriptHash = "c".repeat(64); }, "authorized REC-01 target");
  expectFailure(lockRecord, facts => { facts.statusText = facts.statusText.replace("NO-PUBLISH", "RELEASED"); }, "STATUS NO-PUBLISH");

  const artR2Governance = structuredClone(positive);
  Object.assign(artR2Governance, {
    headRef: ART_R2_GOVERNANCE_HEAD,
    prBaseSha: ART_R2_GOVERNANCE_BASE_SHA,
    changedPaths: [...ART_R2_GOVERNANCE_CHANGED_PATHS],
    simulationBaselineHash: REC_01_SIMULATION_BASELINE_SHA256,
    recRatchetHash: REC_RATCHET_ARTIFACT_SHA256,
    recRatchetBaselineHash: REC_01_SIMULATION_BASELINE_SHA256,
    recRatchetPatchHash: REC_RATCHET_PATCH_ARTIFACT_SHA256,
    scenes41Hash: REC_01_SCENES_41_SHA256,
    verifyScriptHash: REC_01_VERIFY_SHA256,
    artR2GovernanceDocumentHashes: { ...ART_R2_GOVERNANCE_DOCUMENT_SHA256 }
  });
  assert.deepEqual(evaluatePolicy(artR2Governance).errors, []);
  expectFailure(artR2Governance, facts => { facts.prBaseSha = "c".repeat(40); }, "ART-R2 governance base");
  expectFailure(artR2Governance, facts => { facts.changedPaths.push("README.md"); }, "ART-R2 governance set");
  expectFailure(artR2Governance, facts => { facts.changedPaths.pop(); }, "ART-R2 governance set");
  expectFailure(artR2Governance, facts => {
    facts.artR2GovernanceDocumentHashes[ART_R2_GOVERNANCE_RECORD_PATH] = "c".repeat(64);
  }, "approved ART-R2 governance record");

  const artR2PushRatchet = structuredClone(positive);
  Object.assign(artR2PushRatchet, {
    headRef: ART_R2_PUSH_RATCHET_HEAD,
    prBaseSha: ART_R2_PUSH_RATCHET_BASE_SHA,
    changedPaths: [...ART_R2_PUSH_RATCHET_CHANGED_PATHS],
    simulationBaselineHash: REC_01_SIMULATION_BASELINE_SHA256,
    recRatchetHash: REC_RATCHET_ARTIFACT_SHA256,
    recRatchetBaselineHash: REC_01_SIMULATION_BASELINE_SHA256,
    recRatchetPatchHash: REC_RATCHET_PATCH_ARTIFACT_SHA256,
    scenes41Hash: REC_01_SCENES_41_SHA256,
    verifyScriptHash: REC_01_VERIFY_SHA256,
    artR2ImmutableGovernanceHashes: { ...ART_R2_IMMUTABLE_GOVERNANCE_SHA256 },
    artR2PushRatchetDocumentHash: ART_R2_PUSH_RATCHET_DOCUMENT_SHA256,
    statusHash: ART_R2_PUSH_RATCHET_STATUS_SHA256,
    prBaseSimulationBaselineHash: REC_01_SIMULATION_BASELINE_SHA256,
    prHeadIsArtR2PushRatchetHead: true,
    prCheckoutIsArtR2PushRatchetSuccessor: true
  });
  assert.deepEqual(evaluatePolicy(artR2PushRatchet).errors, []);
  expectFailure(artR2PushRatchet, facts => {
    facts.headRef = ART_R2_IMPLEMENTATION_HEAD;
  }, "exact protected push-ratchet merge successor");
  expectFailure(artR2PushRatchet, facts => {
    facts.prBaseSha = "c".repeat(40);
  }, "ART-R2 push-ratchet base");
  expectFailure(artR2PushRatchet, facts => {
    facts.prHeadIsArtR2PushRatchetHead = false;
  }, "exact direct-child three-path candidate");
  expectFailure(artR2PushRatchet, facts => {
    facts.prCheckoutIsArtR2PushRatchetSuccessor = false;
  }, "exact two-parent synthetic successor");
  expectFailure(artR2PushRatchet, facts => {
    facts.changedPaths.push("README.md");
  }, "ART-R2 push-ratchet set");
  expectFailure(artR2PushRatchet, facts => {
    facts.changedPaths.pop();
  }, "ART-R2 push-ratchet set");
  expectFailure(artR2PushRatchet, facts => {
    facts.prBaseSimulationBaselineHash = SIMULATION_BASELINE_SHA256;
  }, "preserved REC-01 simulation fixture");
  expectFailure(artR2PushRatchet, facts => {
    facts.artR2PushRatchetDocumentHash = "c".repeat(64);
  }, "protected-push repair authority");
  expectFailure(artR2PushRatchet, facts => {
    facts.statusHash = "c".repeat(64);
  }, "protected-push repair target");
  expectFailure(artR2PushRatchet, facts => {
    facts.artR2ImmutableGovernanceHashes["artifacts/ART_RULES.md"] = "c".repeat(64);
  }, "immutable ART-R2 governance authority");
  expectFailure(artR2PushRatchet, facts => {
    facts.simulationBaselineHash = SIMULATION_BASELINE_SHA256;
  }, "REC-RATCHET-01 authorized replacement");
  expectFailure(artR2PushRatchet, facts => {
    facts.recRatchetHash = "c".repeat(64);
  }, "authorized transition artifact");
  expectFailure(artR2PushRatchet, facts => {
    facts.scenes41Hash = "c".repeat(64);
  }, "authorized REC-01 target");

  const artR2Implementation = structuredClone(artR2PushRatchet);
  Object.assign(artR2Implementation, {
    headRef: ART_R2_IMPLEMENTATION_HEAD,
    prBaseSha: "e".repeat(40),
    prBaseIsArtR2PushRatchetSuccessor: true,
    prHeadIsArtR2ReconciledHead: true,
    prCheckoutIsArtR2ImplementationSuccessor: true,
    changedPaths: [...ART_R2_IMPLEMENTATION_CHANGED_PATHS],
    verifyScriptHash: ART_R2_VERIFY_SHA256,
    artR2ImplementationContentManifestHash: ART_R2_IMPLEMENTATION_CONTENT_MANIFEST_SHA256,
    artR2ImageContentManifestHash: ART_R2_IMAGE_CONTENT_MANIFEST_SHA256,
    artR2IntegrationRecordHash: ART_R2_INTEGRATION_RECORD_SHA256,
    artR2ValidatorHash: ART_R2_VALIDATOR_SHA256
  });
  assert.deepEqual(evaluatePolicy(artR2Implementation).errors, []);
  expectFailure(artR2Implementation, facts => {
    facts.prBaseIsArtR2PushRatchetSuccessor = false;
  }, "exact protected push-ratchet merge successor");
  expectFailure(artR2Implementation, facts => {
    facts.prHeadIsArtR2ReconciledHead = false;
  }, "exact held-head plus push-ratchet reconciliation merge");
  expectFailure(artR2Implementation, facts => {
    facts.prCheckoutIsArtR2ImplementationSuccessor = false;
  }, "exact two-parent protected-merge candidate");
  expectFailure(artR2Implementation, facts => { facts.changedPaths.push("README.md"); }, "ART-R2 implementation set");
  expectFailure(artR2Implementation, facts => { facts.changedPaths.pop(); }, "ART-R2 implementation set");
  expectFailure(artR2Implementation, facts => {
    facts.artR2ImplementationContentManifestHash = "c".repeat(64);
  }, "79-path content manifest");
  expectFailure(artR2Implementation, facts => {
    facts.artR2ImageContentManifestHash = "c".repeat(64);
  }, "55-image content manifest");
  expectFailure(artR2Implementation, facts => {
    facts.artR2IntegrationRecordHash = "c".repeat(64);
  }, "held approved integration record");
  expectFailure(artR2Implementation, facts => {
    facts.artR2ValidatorHash = "c".repeat(64);
  }, "held approved ART validator");
  expectFailure(artR2Implementation, facts => {
    facts.verifyScriptHash = "c".repeat(64);
  }, "held approved ART target");
  expectFailure(artR2Implementation, facts => {
    facts.artR2ImmutableGovernanceHashes["artifacts/LOCKS.md"] = "c".repeat(64);
  }, "immutable ART-R2 governance authority");
  expectFailure(artR2Implementation, facts => {
    facts.prBaseSimulationBaselineHash = SIMULATION_BASELINE_SHA256;
  }, "preserved REC-01 simulation fixture");

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
    facts.workflowTexts["verify.yml"] += "\n    environment: production\n";
  }, "deployment environment use");
  expectFailure(positive, facts => {
    facts.workflowTexts["verify.yml"] += "\n      - run: netlify deploy --prod\n";
  }, "release/deploy/upload command");
  expectFailure(positive, facts => {
    facts.workflowTexts["verify.yml"] += "\n      - run: npm publish\n";
  }, "release/deploy/upload command");
  expectFailure(positive, facts => {
    facts.workflowTexts["verify.yml"] += "\n      - run: git push origin HEAD:main\n";
  }, "release/deploy/upload command");
  expectFailure(positive, facts => {
    facts.workflowTexts["verify.yml"] += "\n      - run: echo ${{ secrets.DEPLOY_TOKEN }}\n";
  }, "secret access");
  expectFailure(positive, facts => {
    facts.workflowTexts["verify.yml"] += "\n    tags: ['**']\n";
  }, "tag trigger/filter");
  expectFailure(positive, facts => {
    facts.workflowHashes["verify.yml"] = "c".repeat(64);
  }, "bytes differ from the issue #15 reviewed workflow");
  expectFailure(positive, facts => { facts.netlifyHash = "c".repeat(64); }, "netlify.toml");
  const baselineBytes = readFileSync(resolve(ROOT, SIMULATION_BASELINE_PATH));
  assert.ok(
    [SIMULATION_BASELINE_SHA256, REC_01_SIMULATION_BASELINE_SHA256].includes(sha256(baselineBytes)),
    "checked-in simulation baseline does not match an authorized SHA-256"
  );
  const inflatedBaselineBytes = Buffer.concat([baselineBytes, Buffer.from("\n")]);
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

  const recRatchetPush = structuredClone(push);
  Object.assign(recRatchetPush, {
    beforeSha: REC_RATCHET_BASE_SHA,
    changedPaths: [...REC_RATCHET_01_CHANGED_PATHS],
    recRatchetHash: REC_RATCHET_ARTIFACT_SHA256,
    recRatchetBaselineHash: REC_01_SIMULATION_BASELINE_SHA256,
    recRatchetPatchHash: REC_RATCHET_PATCH_ARTIFACT_SHA256
  });
  assert.deepEqual(evaluatePolicy(recRatchetPush).errors, []);
  expectFailure(recRatchetPush, facts => { facts.changedPaths.push("README.md"); }, "REC-RATCHET-01 set");

  const rec01Push = structuredClone(push);
  Object.assign(rec01Push, {
    beforeSha: "d".repeat(40),
    changedPaths: [...REC_01_CHANGED_PATHS],
    simulationBaselineHash: REC_01_SIMULATION_BASELINE_SHA256,
    recRatchetHash: REC_RATCHET_ARTIFACT_SHA256,
    recRatchetBaselineHash: REC_01_SIMULATION_BASELINE_SHA256,
    recRatchetPatchHash: REC_RATCHET_PATCH_ARTIFACT_SHA256,
    scenes41Hash: REC_01_SCENES_41_SHA256,
    verifyScriptHash: REC_01_VERIFY_SHA256,
    pushBeforeSimulationBaselineHash: SIMULATION_BASELINE_SHA256,
    pushBeforeIsRecRatchetSuccessor: true
  });
  assert.deepEqual(evaluatePolicy(rec01Push).errors, []);
  expectFailure(rec01Push, facts => { facts.pushBeforeIsRecRatchetSuccessor = false; }, "push before SHA");
  expectFailure(rec01Push, facts => { facts.pushBeforeSimulationBaselineHash = REC_01_SIMULATION_BASELINE_SHA256; }, "push before SHA");
  expectFailure(rec01Push, facts => { facts.changedPaths.push("README.md"); }, "one-shot REC-01 set");

  const lockRecordPush = structuredClone(push);
  Object.assign(lockRecordPush, {
    beforeSha: LOCK_RECORD_BASE_SHA,
    changedPaths: [...LOCK_RECORD_CHANGED_PATHS],
    simulationBaselineHash: REC_01_SIMULATION_BASELINE_SHA256,
    recRatchetHash: REC_RATCHET_ARTIFACT_SHA256,
    recRatchetBaselineHash: REC_01_SIMULATION_BASELINE_SHA256,
    recRatchetPatchHash: REC_RATCHET_PATCH_ARTIFACT_SHA256,
    scenes41Hash: REC_01_SCENES_41_SHA256,
    verifyScriptHash: REC_01_VERIFY_SHA256
  });
  assert.deepEqual(evaluatePolicy(lockRecordPush).errors, []);
  expectFailure(lockRecordPush, facts => { facts.beforeSha = "c".repeat(40); }, "push before SHA");
  expectFailure(lockRecordPush, facts => { facts.changedPaths.push("README.md"); }, "one-shot lock-record set");
  expectFailure(lockRecordPush, facts => { facts.simulationBaselineHash = SIMULATION_BASELINE_SHA256; }, "authorized replacement");

  const artR2GovernancePush = structuredClone(push);
  Object.assign(artR2GovernancePush, {
    beforeSha: ART_R2_GOVERNANCE_BASE_SHA,
    changedPaths: [...ART_R2_GOVERNANCE_CHANGED_PATHS],
    simulationBaselineHash: REC_01_SIMULATION_BASELINE_SHA256,
    recRatchetHash: REC_RATCHET_ARTIFACT_SHA256,
    recRatchetBaselineHash: REC_01_SIMULATION_BASELINE_SHA256,
    recRatchetPatchHash: REC_RATCHET_PATCH_ARTIFACT_SHA256,
    scenes41Hash: REC_01_SCENES_41_SHA256,
    verifyScriptHash: REC_01_VERIFY_SHA256,
    pushAfterIsArtR2GovernanceSuccessor: true,
    artR2GovernanceDocumentHashes: { ...ART_R2_GOVERNANCE_DOCUMENT_SHA256 }
  });
  assert.deepEqual(evaluatePolicy(artR2GovernancePush).errors, []);
  expectFailure(artR2GovernancePush, facts => {
    facts.pushAfterIsArtR2GovernanceSuccessor = false;
  }, "exact two-parent protected governance successor");
  expectFailure(artR2GovernancePush, facts => { facts.changedPaths.push("README.md"); }, "ART-R2 governance set");
  expectFailure(artR2GovernancePush, facts => {
    facts.artR2GovernanceDocumentHashes["artifacts/LOCKS.md"] = "c".repeat(64);
  }, "approved ART-R2 governance record");

  const artR2PushRatchetPush = structuredClone(push);
  Object.assign(artR2PushRatchetPush, {
    beforeSha: ART_R2_PUSH_RATCHET_BASE_SHA,
    changedPaths: [...ART_R2_PUSH_RATCHET_CHANGED_PATHS],
    simulationBaselineHash: REC_01_SIMULATION_BASELINE_SHA256,
    recRatchetHash: REC_RATCHET_ARTIFACT_SHA256,
    recRatchetBaselineHash: REC_01_SIMULATION_BASELINE_SHA256,
    recRatchetPatchHash: REC_RATCHET_PATCH_ARTIFACT_SHA256,
    scenes41Hash: REC_01_SCENES_41_SHA256,
    verifyScriptHash: REC_01_VERIFY_SHA256,
    artR2ImmutableGovernanceHashes: { ...ART_R2_IMMUTABLE_GOVERNANCE_SHA256 },
    artR2PushRatchetDocumentHash: ART_R2_PUSH_RATCHET_DOCUMENT_SHA256,
    statusHash: ART_R2_PUSH_RATCHET_STATUS_SHA256,
    pushBeforeSimulationBaselineHash: REC_01_SIMULATION_BASELINE_SHA256,
    pushAfterIsArtR2PushRatchetSuccessor: true
  });
  assert.deepEqual(evaluatePolicy(artR2PushRatchetPush).errors, []);
  expectFailure(artR2PushRatchetPush, facts => {
    facts.pushAfterIsArtR2PushRatchetSuccessor = false;
  }, "exact two-parent protected precursor successor");
  expectFailure(artR2PushRatchetPush, facts => {
    facts.beforeSha = "c".repeat(40);
  }, "push before SHA");
  expectFailure(artR2PushRatchetPush, facts => {
    facts.changedPaths.push("README.md");
  }, "ART-R2 push-ratchet set");
  expectFailure(artR2PushRatchetPush, facts => {
    facts.changedPaths.pop();
  }, "ART-R2 push-ratchet set");
  expectFailure(artR2PushRatchetPush, facts => {
    facts.pushBeforeSimulationBaselineHash = SIMULATION_BASELINE_SHA256;
  }, "preserved REC-01 simulation fixture");
  expectFailure(artR2PushRatchetPush, facts => {
    facts.workflowHashes["release-policy.yml"] = "c".repeat(64);
  }, "bytes differ from the issue #15 reviewed workflow");

  const artR2ImplementationPush = structuredClone(artR2PushRatchetPush);
  Object.assign(artR2ImplementationPush, {
    beforeSha: "e".repeat(40),
    changedPaths: [...ART_R2_IMPLEMENTATION_CHANGED_PATHS],
    verifyScriptHash: ART_R2_VERIFY_SHA256,
    pushBeforeIsArtR2PushRatchetSuccessor: true,
    pushAfterIsArtR2PushRatchetSuccessor: false,
    pushAfterIsArtR2ImplementationSuccessor: true,
    artR2ImplementationContentManifestHash: ART_R2_IMPLEMENTATION_CONTENT_MANIFEST_SHA256,
    artR2ImageContentManifestHash: ART_R2_IMAGE_CONTENT_MANIFEST_SHA256,
    artR2IntegrationRecordHash: ART_R2_INTEGRATION_RECORD_SHA256,
    artR2ValidatorHash: ART_R2_VALIDATOR_SHA256
  });
  assert.deepEqual(evaluatePolicy(artR2ImplementationPush).errors, []);
  expectFailure(artR2ImplementationPush, facts => {
    facts.pushAfterIsArtR2ImplementationSuccessor = false;
  }, "exact two-parent protected ART successor");
  expectFailure(artR2ImplementationPush, facts => {
    facts.pushBeforeIsArtR2PushRatchetSuccessor = false;
  }, "push before SHA");
  expectFailure(artR2ImplementationPush, facts => {
    facts.changedPaths.push("README.md");
  }, "ART-R2 implementation set");
  expectFailure(artR2ImplementationPush, facts => {
    facts.changedPaths.pop();
  }, "ART-R2 implementation set");
  expectFailure(artR2ImplementationPush, facts => {
    facts.artR2ImageContentManifestHash = "c".repeat(64);
  }, "55-image content manifest");
  expectFailure(artR2ImplementationPush, facts => {
    facts.simulationBaselineHash = SIMULATION_BASELINE_SHA256;
  }, "REC-RATCHET-01 authorized replacement");
  expectFailure(artR2ImplementationPush, facts => {
    facts.statusText = facts.statusText.replace("NO-PUBLISH", "RELEASED");
  }, "STATUS NO-PUBLISH");

  expectFailure(push, facts => {
    facts.ref = "refs/tags/sun-v0.30.1";
    facts.refName = "sun-v0.30.1";
    facts.refType = "tag";
  }, "tag creation");
  expectFailure(push, facts => { facts.beforeSha = "c".repeat(40); }, "push before SHA");

  console.log("PASS release-policy self-test (issue #15 + REC-RATCHET-01 + REC-01 + lock-record + ART-R2 protected-push ratchet + exact ART implementation route)");
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

function taskForRoute(route) {
  if (route === "rec-01") return "REC-01/#13";
  if (route === "rec-ratchet") return "REC-RATCHET-01";
  if (route === "lock-record") return "LOCK-RECORD-R1/L-025-L-028";
  if (route === "art-r2-governance") return "ART-INTEGRATION-R2/GOVERNANCE";
  if (route === "art-r2-push-ratchet") return "ART-R2-PUSH-RATCHET-R1";
  if (route === "art-r2-implementation") return "ART-INTEGRATION-R2/55-PLATE-DRAFT";
  return "PIPE-BOOT-R1/#15";
}

function writeSummary(facts, result) {
  const source = (facts.sha || "unknown").slice(0, 7);
  const task = taskForRoute(result.route);
  const lines = [
    "## Governed recovery release policy",
    "",
    `- Exact tested SHA: \`${facts.sha || "missing"}\``,
    `- PR head SHA: \`${facts.prHeadSha || "n/a"}\``,
    `- PR base SHA: \`${facts.prBaseSha || facts.beforeSha || "n/a"}\``,
    `- Result: **${result.passed ? "PASS" : "FAIL"}**`,
    `- Source declaration: \`SOURCE ${source} · RUNTIME ${source} · TASK ${task} · MODE verification\``,
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
  console.log(`SOURCE ${shortSha} · RUNTIME ${shortSha} · TASK ${taskForRoute(result.route)} · MODE verification`);
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
    console.log("PASS governed recovery release policy; NO-PUBLISH remains active");
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
