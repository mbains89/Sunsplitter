// SUN-PRIVATE-PACKAGE-STAMP-01 — the private package builds from the current commit, and its
// network scan still bites. The only verify check that builds a package pins an older source
// (from before src/review-build-stamp.js existed), so a scan regression against the current
// runtime went unseen. This builds HEAD, then proves the one same-origin manifest read is the
// only exemption: any other fetch target, an absolute URL, or another network API still fails.
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import {
  ALLOWED_NETWORK_API_CALLS,
  buildPrivatePackage,
  readCanonicalZip,
  scanRuntimeNetworkUse
} from "./build-private-package.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const STAMP_PATH = "src/review-build-stamp.js";
const STAMP_CALL = "fetch(\"PRIVATE_PACKAGE_MANIFEST.json\", { cache: \"no-store\" })";
const started = Date.now();
const work = mkdtempSync(join(tmpdir(), "sun-private-package-"));
let passed = 0;
let failed = 0;

function check(label, action) {
  try {
    action();
    passed++;
    console.log(`ok ${label}`);
  } catch (error) {
    failed++;
    console.error(`not-ok ${label}: ${error.message}`);
  }
}

function gitRaw(args, cwd = root, extraEnv = {}) {
  const result = spawnSync("git", args, {
    cwd,
    encoding: "utf8",
    env: { ...process.env, GIT_OPTIONAL_LOCKS: "0", ...extraEnv },
    maxBuffer: 64 * 1024 * 1024
  });
  if (result.status !== 0) throw new Error(`git ${args.join(" ")} failed: ${(result.stderr || result.stdout).trim()}`);
  return result.stdout;
}

function git(args, cwd = root, extraEnv = {}) {
  return gitRaw(args, cwd, extraEnv).trim();
}

function scan(files) {
  return scanRuntimeNetworkUse(files.map(([path, text]) => ({ path, data: Buffer.from(text, "utf8") })));
}

function forbidden(files) {
  return scan(files).forbiddenNetworkApiMatches.map(match => `${match.path}:${match.api}`);
}

const head = git(["rev-parse", "HEAD"]);
const headStamp = gitRaw(["cat-file", "blob", `${head}:${STAMP_PATH}`]);

try {
  check("allowlist is exactly one call in one file", () => {
    assert.equal(ALLOWED_NETWORK_API_CALLS.length, 1);
    assert.deepEqual({ ...ALLOWED_NETWORK_API_CALLS[0] }, {
      path: STAMP_PATH,
      api: "fetch",
      call: STAMP_CALL,
      allowance: "SAME_ORIGIN_PACKAGE_MANIFEST_READ"
    });
    assert.ok(Object.isFrozen(ALLOWED_NETWORK_API_CALLS) && Object.isFrozen(ALLOWED_NETWORK_API_CALLS[0]));
  });

  check("HEAD review-build stamp makes exactly the allowlisted call and no other", () => {
    assert.equal(headStamp.split(STAMP_CALL).length - 1, 1, "stamp must contain the exact allowlisted call once");
    const result = scan([[STAMP_PATH, headStamp]]);
    assert.deepEqual(result.forbiddenNetworkApiMatches, []);
    assert.deepEqual(result.networkApiMatches, [{ path: STAMP_PATH, api: "fetch", allowance: "SAME_ORIGIN_PACKAGE_MANIFEST_READ" }]);
    assert.deepEqual(result.externalReferences, []);
  });

  check("private package builds from HEAD and records HEAD as its source", () => {
    const output = join(work, "head", `sunsplitter-private-${head.slice(0, 8)}.zip`);
    const built = buildPrivatePackage({ sourceRef: head, outputPath: output, root });
    assert.equal(built.sourceCommit, head);
    const entries = readCanonicalZip(readFileSync(output));
    const byPath = new Map(entries.map(entry => [entry.path, entry]));
    const manifestEntry = byPath.get("PRIVATE_PACKAGE_MANIFEST.json");
    assert.ok(manifestEntry, "package must contain PRIVATE_PACKAGE_MANIFEST.json");
    const manifest = JSON.parse(manifestEntry.data.toString("utf8"));
    assert.equal(manifest.sourceCommit, head);
    assert.match(manifest.sourceCommit, /^[0-9a-f]{40}$/, "stamp requires a 40-hex sourceCommit");
    assert.equal(manifest.privateDrafts.sourceCommit, head);
    assert.deepEqual(JSON.parse(readFileSync(built.manifestPath, "utf8")), manifest, "sidecar manifest must equal packaged manifest");
    assert.equal(byPath.get(STAMP_PATH)?.data.toString("utf8"), headStamp, "package must carry the exact HEAD stamp bytes");
    const matches = manifest.privateDrafts.sourceScan.networkApiMatches;
    assert.deepEqual(matches, [{ path: STAMP_PATH, api: "fetch", allowance: "SAME_ORIGIN_PACKAGE_MANIFEST_READ" }],
      "the allowlisted read must be recorded, and nothing else");
  });

  check("synthetic fetch(\"https://example.com\") still fails the scan in any file", () => {
    assert.deepEqual(forbidden([["src/engine.js", "fetch(\"https://example.com\");"]]), ["src/engine.js:fetch"]);
    assert.deepEqual(forbidden([[STAMP_PATH, "fetch(\"https://example.com\");"]]), [`${STAMP_PATH}:fetch`]);
    assert.deepEqual(scan([["src/engine.js", "fetch(\"https://example.com\");"]]).externalReferences,
      [{ path: "src/engine.js", url: "https://example.com" }]);
  });

  check("the exemption does not widen: other targets, other files, repeats and other APIs fail", () => {
    const cases = [
      [[[STAMP_PATH, `${STAMP_CALL};\nfetch("https://example.com");`]], [`${STAMP_PATH}:fetch`]],
      [[[STAMP_PATH, `${STAMP_CALL};\n${STAMP_CALL};`]], [`${STAMP_PATH}:fetch`]],
      [[[STAMP_PATH, "fetch(\"https://example.com/PRIVATE_PACKAGE_MANIFEST.json\", { cache: \"no-store\" })"]], [`${STAMP_PATH}:fetch`]],
      [[[STAMP_PATH, "fetch(\"//example.com/PRIVATE_PACKAGE_MANIFEST.json\", { cache: \"no-store\" })"]], [`${STAMP_PATH}:fetch`]],
      [[[STAMP_PATH, "fetch(\"PRIVATE_PACKAGE_MANIFEST.json\")"]], [`${STAMP_PATH}:fetch`]],
      [[[STAMP_PATH, "fetch(\"save.json\", { cache: \"no-store\" })"]], [`${STAMP_PATH}:fetch`]],
      [[["src/engine.js", STAMP_CALL]], ["src/engine.js:fetch"]],
      [[["index.html", `<script>${STAMP_CALL}</script>`]], ["index.html:fetch"]],
      [[[STAMP_PATH, `${STAMP_CALL};\nnew XMLHttpRequest();`]], [`${STAMP_PATH}:XMLHttpRequest`]],
      [[[STAMP_PATH, `${STAMP_CALL};\nnavigator.sendBeacon("/x", "y");`]], [`${STAMP_PATH}:sendBeacon`]],
      [[[STAMP_PATH, `${STAMP_CALL};\nnew WebSocket("ws://x");`]], [`${STAMP_PATH}:WebSocket`]],
      [[[STAMP_PATH, `${STAMP_CALL};\nnew EventSource("/x");`]], [`${STAMP_PATH}:EventSource`]],
      [[[STAMP_PATH, `${STAMP_CALL};\ndocument.cookie = "a=b";`]], [`${STAMP_PATH}:document.cookie`]],
      [[[STAMP_PATH, `${STAMP_CALL};\nnavigator.geolocation.getCurrentPosition();`]], [`${STAMP_PATH}:geolocation`]]
    ];
    for (const [files, expected] of cases) {
      assert.deepEqual(forbidden(files), expected, JSON.stringify(files));
    }
  });

  check("a commit whose stamp adds fetch(\"https://example.com\") refuses to package", () => {
    // Throwaway repository that borrows this repository's objects read-only (alternates), so the
    // checkout and this repository's refs, index and object store are never written.
    const objects = resolve(root, git(["rev-parse", "--git-path", "objects"]));
    const scratch = join(work, "repo");
    mkdirSync(scratch, { recursive: true });
    git(["init", "-q"], scratch);
    writeFileSync(join(scratch, ".git", "objects", "info", "alternates"), `${objects}\n`);
    git(["read-tree", head], scratch);
    const tampered = `${headStamp}\nfetch("https://example.com");\n`;
    const blobFile = join(work, "tampered-stamp.js");
    writeFileSync(blobFile, tampered);
    const blob = git(["hash-object", "-w", blobFile], scratch);
    git(["update-index", "--cacheinfo", `100644,${blob},${STAMP_PATH}`], scratch);
    const tree = git(["write-tree"], scratch);
    const identity = {
      GIT_AUTHOR_NAME: "playerflow", GIT_AUTHOR_EMAIL: "playerflow@invalid",
      GIT_COMMITTER_NAME: "playerflow", GIT_COMMITTER_EMAIL: "playerflow@invalid",
      GIT_AUTHOR_DATE: "1980-01-01T00:00:00Z", GIT_COMMITTER_DATE: "1980-01-01T00:00:00Z"
    };
    const commit = git(["commit-tree", tree, "-m", "synthetic tampered stamp"], scratch, identity);
    assert.throws(
      () => buildPrivatePackage({ sourceRef: commit, outputPath: join(work, "tampered", "pkg.zip"), root: scratch }),
      error => {
        assert.match(error.message, /private-draft network API scan found/);
        assert.match(error.message, /"path":"src\/review-build-stamp\.js","api":"fetch"/);
        assert.doesNotMatch(error.message, /allowance/);
        return true;
      }
    );
  });
} finally {
  rmSync(work, { recursive: true, force: true });
}

const seconds = ((Date.now() - started) / 1000).toFixed(1);
console.log(`private-package checks: ${passed} passed, ${failed} failed (source ${head.slice(0, 8)}, ${seconds}s)`);
if (failed) process.exitCode = 1;
