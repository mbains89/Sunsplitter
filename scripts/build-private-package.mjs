#!/usr/bin/env node

import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const REPOSITORY = "mbains89/Sunsplitter";
const PACKAGE_POSTURE = "PRIVATE TEST PACKAGE · NO-PUBLISH / NOT_CERTIFIED";
const DOS_DATE_1980_01_01 = 33;
const UTF8_FLAG = 0x0800;
const FILE_MODE = 0o100644;
const ASSET_EXTENSIONS = new Set(["jpg", "jpeg", "png", "gif", "webp", "svg", "avif", "mp3", "ogg", "wav", "mp4", "webm"]);
const FONT_EXTENSIONS = new Set(["woff", "woff2", "ttf", "otf", "eot"]);

function sha256(data) {
  return createHash("sha256").update(data).digest("hex");
}

function git(args, { root = ROOT, binary = false } = {}) {
  const result = spawnSync("git", args, {
    cwd: root,
    encoding: binary ? null : "utf8",
    env: { ...process.env, GIT_OPTIONAL_LOCKS: "0" },
    maxBuffer: 256 * 1024 * 1024
  });
  if (result.status !== 0) {
    const detail = binary ? result.stderr?.toString("utf8") : (result.stderr || result.stdout);
    throw new Error(`git ${args.join(" ")} failed: ${String(detail || "").trim()}`);
  }
  return binary ? Buffer.from(result.stdout) : result.stdout.trim();
}

function exactCommit(sourceRef, root = ROOT) {
  if (!/^[0-9a-f]{40}$/.test(sourceRef || "")) throw new Error("--source must be a full lowercase 40-character commit SHA");
  const commit = git(["rev-parse", "--verify", `${sourceRef}^{commit}`], { root });
  if (!/^[0-9a-f]{40}$/.test(commit)) throw new Error(`source did not resolve to a full commit SHA: ${commit}`);
  if (commit !== sourceRef) throw new Error(`resolved commit ${commit} did not equal requested source ${sourceRef}`);
  return commit;
}

function trackedTree(commit, root = ROOT) {
  const raw = git(["ls-tree", "-r", "-z", commit], { root, binary: true });
  return raw.toString("utf8").split("\0").filter(Boolean).map(record => {
    const tab = record.indexOf("\t");
    if (tab < 0) throw new Error(`malformed git tree record: ${record}`);
    const [mode, type, object] = record.slice(0, tab).split(" ");
    return { mode, type, object, path: record.slice(tab + 1) };
  });
}

function extension(path) {
  const match = String(path).match(/\.([^.\/]+)$/);
  return match ? match[1].toLowerCase() : "";
}

function detectedMime(path, data) {
  const ext = extension(path);
  if (ext === "jpg" || ext === "jpeg") return data.length >= 3 && data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff
    ? "image/jpeg"
    : "application/octet-stream";
  if (ext === "png") return data.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) ? "image/png" : "application/octet-stream";
  if (ext === "gif") return /^GIF8[79]a$/.test(data.subarray(0, 6).toString("ascii")) ? "image/gif" : "application/octet-stream";
  if (ext === "webp") return data.subarray(0, 4).toString("ascii") === "RIFF" && data.subarray(8, 12).toString("ascii") === "WEBP" ? "image/webp" : "application/octet-stream";
  if (ext === "svg") return "image/svg+xml";
  if (ext === "html") return "text/html";
  if (ext === "css") return "text/css";
  if (ext === "js" || ext === "mjs") return "text/javascript";
  if (ext === "json") return "application/json";
  if (ext === "md") return "text/markdown";
  if (path === "VERSION.md") return "text/plain";
  return "application/octet-stream";
}

function blobAt(commit, path, root = ROOT) {
  return git(["cat-file", "blob", `${commit}:${path}`], { root, binary: true });
}

function runtimeClosure(commit, tracked, root = ROOT) {
  const byPath = new Map(tracked.filter(entry => entry.type === "blob").map(entry => [entry.path, entry]));
  const required = new Set(["index.html", "VERSION.md"]);
  const indexEntry = byPath.get("index.html");
  if (!indexEntry) throw new Error("tracked index.html is missing");
  const indexData = blobAt(commit, "index.html", root);
  const indexText = indexData.toString("utf8");
  for (const match of indexText.matchAll(/\b(?:src|href)=["']([^"']+)["']/g)) {
    const value = match[1].replace(/^\.\//, "");
    if (/^(?:https?:)?\/\//i.test(value) || value.startsWith("data:") || value.startsWith("#")) continue;
    if (/\.(?:css|js)$/i.test(value)) required.add(value);
  }
  const codePaths = [...required].filter(path => /\.(?:html|css|js)$/i.test(path));
  for (let index = 0; index < codePaths.length; index += 1) {
    const path = codePaths[index];
    const entry = byPath.get(path);
    if (!entry) throw new Error(`local runtime reference is not tracked: ${path}`);
    const text = blobAt(commit, path, root).toString("utf8");
    for (const match of text.matchAll(/\bimages\/[A-Za-z0-9._/-]+\.(?:jpe?g|png|gif|webp|svg|avif)\b/gi)) {
      required.add(match[0]);
    }
  }
  const paths = [...required].sort(canonicalPathCompare);
  for (const path of paths) {
    if (!/^(?:index\.html|VERSION\.md|css\/[^/]+\.css|src\/[^/]+\.js|images\/[^/]+\.[A-Za-z0-9]+)$/.test(path)) {
      throw new Error(`runtime closure escaped the package allowlist: ${path}`);
    }
    if (!byPath.has(path)) throw new Error(`runtime closure path is missing from exact tree: ${path}`);
  }
  return paths.map(path => byPath.get(path));
}

function jpegDimensions(data) {
  if (detectedMime("image.jpg", data) !== "image/jpeg") return null;
  const sofMarkers = new Set([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf]);
  let offset = 2;
  while (offset + 4 <= data.length) {
    while (offset < data.length && data[offset] !== 0xff) offset += 1;
    while (offset < data.length && data[offset] === 0xff) offset += 1;
    if (offset >= data.length) break;
    const marker = data[offset++];
    if (marker === 0xd8 || marker === 0xd9 || (marker >= 0xd0 && marker <= 0xd7)) continue;
    if (offset + 2 > data.length) break;
    const length = data.readUInt16BE(offset);
    if (length < 2 || offset + length > data.length) break;
    if (sofMarkers.has(marker) && length >= 7) {
      return { height: data.readUInt16BE(offset + 3), width: data.readUInt16BE(offset + 5) };
    }
    offset += length;
  }
  return null;
}

function crcTable() {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let value = n;
    for (let bit = 0; bit < 8; bit += 1) value = (value & 1) ? (0xedb88320 ^ (value >>> 1)) : (value >>> 1);
    table[n] = value >>> 0;
  }
  return table;
}

const CRC_TABLE = crcTable();

function crc32(data) {
  let crc = 0xffffffff;
  for (const byte of data) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function canonicalPathCompare(left, right) {
  return Buffer.compare(Buffer.from(left, "utf8"), Buffer.from(right, "utf8"));
}

export function createCanonicalZip(inputEntries) {
  const entries = inputEntries.map(entry => ({ path: String(entry.path), data: Buffer.from(entry.data) }))
    .sort((left, right) => canonicalPathCompare(left.path, right.path));
  if (!entries.length) throw new Error("archive must contain at least one entry");
  const seen = new Set();
  const localParts = [];
  const centralParts = [];
  let localOffset = 0;
  for (const entry of entries) {
    if (!entry.path || entry.path.startsWith("/") || entry.path.includes("\\") || entry.path.split("/").includes("..")) {
      throw new Error(`unsafe archive path: ${entry.path}`);
    }
    if (seen.has(entry.path)) throw new Error(`duplicate archive path: ${entry.path}`);
    seen.add(entry.path);
    if (entry.data.length > 0xffffffff) throw new Error(`ZIP32 size limit exceeded: ${entry.path}`);
    const name = Buffer.from(entry.path, "utf8");
    const crc = crc32(entry.data);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(UTF8_FLAG, 6);
    local.writeUInt16LE(0, 8);
    local.writeUInt16LE(0, 10);
    local.writeUInt16LE(DOS_DATE_1980_01_01, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(entry.data.length, 18);
    local.writeUInt32LE(entry.data.length, 22);
    local.writeUInt16LE(name.length, 26);
    local.writeUInt16LE(0, 28);
    localParts.push(local, name, entry.data);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE((3 << 8) | 20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(UTF8_FLAG, 8);
    central.writeUInt16LE(0, 10);
    central.writeUInt16LE(0, 12);
    central.writeUInt16LE(DOS_DATE_1980_01_01, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(entry.data.length, 20);
    central.writeUInt32LE(entry.data.length, 24);
    central.writeUInt16LE(name.length, 28);
    central.writeUInt16LE(0, 30);
    central.writeUInt16LE(0, 32);
    central.writeUInt16LE(0, 34);
    central.writeUInt16LE(0, 36);
    central.writeUInt32LE((FILE_MODE << 16) >>> 0, 38);
    central.writeUInt32LE(localOffset, 42);
    centralParts.push(central, name);
    localOffset += local.length + name.length + entry.data.length;
  }
  if (entries.length > 0xffff) throw new Error("ZIP32 entry limit exceeded");
  const centralDirectory = Buffer.concat(centralParts);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(centralDirectory.length, 12);
  end.writeUInt32LE(localOffset, 16);
  end.writeUInt16LE(0, 20);
  return Buffer.concat([...localParts, centralDirectory, end]);
}

export function readCanonicalZip(zip) {
  const data = Buffer.from(zip);
  if (data.length < 22 || data.readUInt32LE(data.length - 22) !== 0x06054b50) throw new Error("canonical EOCD missing");
  const end = data.length - 22;
  if (data.readUInt16LE(end + 4) !== 0 || data.readUInt16LE(end + 6) !== 0) throw new Error("multi-disk ZIP is not canonical");
  if (data.readUInt16LE(end + 8) !== data.readUInt16LE(end + 10)) throw new Error("EOCD entry counts disagree");
  if (data.readUInt16LE(end + 20) !== 0) throw new Error("archive comment is not canonical");
  const count = data.readUInt16LE(end + 10);
  const centralSize = data.readUInt32LE(end + 12);
  const centralOffset = data.readUInt32LE(end + 16);
  if (centralOffset + centralSize !== end) throw new Error("central directory boundary mismatch");
  const entries = [];
  let cursor = centralOffset;
  for (let index = 0; index < count; index += 1) {
    if (data.readUInt32LE(cursor) !== 0x02014b50) throw new Error(`central entry ${index} missing`);
    const flags = data.readUInt16LE(cursor + 8);
    const compression = data.readUInt16LE(cursor + 10);
    const time = data.readUInt16LE(cursor + 12);
    const date = data.readUInt16LE(cursor + 14);
    const crc = data.readUInt32LE(cursor + 16);
    const compressedSize = data.readUInt32LE(cursor + 20);
    const size = data.readUInt32LE(cursor + 24);
    const nameLength = data.readUInt16LE(cursor + 28);
    const extraLength = data.readUInt16LE(cursor + 30);
    const commentLength = data.readUInt16LE(cursor + 32);
    const externalAttributes = data.readUInt32LE(cursor + 38);
    const localHeaderOffset = data.readUInt32LE(cursor + 42);
    const path = data.subarray(cursor + 46, cursor + 46 + nameLength).toString("utf8");
    if (data.readUInt32LE(localHeaderOffset) !== 0x04034b50) throw new Error(`local entry missing: ${path}`);
    const localFlags = data.readUInt16LE(localHeaderOffset + 6);
    const localCompression = data.readUInt16LE(localHeaderOffset + 8);
    const localTime = data.readUInt16LE(localHeaderOffset + 10);
    const localDate = data.readUInt16LE(localHeaderOffset + 12);
    const localCrc = data.readUInt32LE(localHeaderOffset + 14);
    const localCompressedSize = data.readUInt32LE(localHeaderOffset + 18);
    const localSize = data.readUInt32LE(localHeaderOffset + 22);
    const localNameLength = data.readUInt16LE(localHeaderOffset + 26);
    const localExtraLength = data.readUInt16LE(localHeaderOffset + 28);
    const localPath = data.subarray(localHeaderOffset + 30, localHeaderOffset + 30 + localNameLength).toString("utf8");
    if (localPath !== path || localFlags !== flags || localCompression !== compression || localTime !== time || localDate !== date ||
        localCrc !== crc || localCompressedSize !== compressedSize || localSize !== size) {
      throw new Error(`local/central metadata mismatch: ${path}`);
    }
    if (localExtraLength !== 0 || extraLength !== 0 || commentLength !== 0) throw new Error(`entry metadata is not canonical: ${path}`);
    const payloadOffset = localHeaderOffset + 30 + localNameLength + localExtraLength;
    const payload = data.subarray(payloadOffset, payloadOffset + compressedSize);
    if (compression !== 0 || compressedSize !== size) throw new Error(`entry is not stored: ${path}`);
    if (crc32(payload) !== crc) throw new Error(`CRC mismatch: ${path}`);
    entries.push({ path, data: Buffer.from(payload), flags, compression, time, date, mode: externalAttributes >>> 16 });
    cursor += 46 + nameLength + extraLength + commentLength;
  }
  if (cursor !== end) throw new Error("central directory was not consumed exactly");
  return entries;
}

function fontImports(cssText) {
  const urls = [...cssText.matchAll(/@import\s+url\((['"]?)([^)'"\s]+)\1\)/g)].map(match => match[2]);
  return urls.map(url => {
    const parsed = new URL(url);
    const families = parsed.searchParams.getAll("family").map(value => decodeURIComponent(value.replace(/\+/g, " ")));
    return { url, families };
  });
}

function markdownEscape(value) {
  return String(value).replace(/\|/g, "\\|");
}

function buildInventory({ commit, tree, runtimeFiles, allAssetFiles, allTrackedPaths, cssText }) {
  const includedPaths = new Set(runtimeFiles.map(file => file.path));
  const firstAssetByHash = new Map();
  const assetRows = allAssetFiles.map(file => {
    const duplicateOf = firstAssetByHash.get(file.sha256) || null;
    if (!duplicateOf) firstAssetByHash.set(file.sha256, file.path);
    return {
      ...file,
      packageIncluded: includedPaths.has(file.path),
      runtimeReferenceStatus: includedPaths.has(file.path)
        ? "STATIC_LITERAL_REFERENCE_FOUND"
        : "NOT_RUNTIME_REFERENCED_BY_STATIC_LITERAL_METHOD",
      duplicateOf
    };
  });
  const fontFiles = allTrackedPaths.filter(path => FONT_EXTENSIONS.has(extension(path)));
  const licenseFiles = allTrackedPaths.filter(path => /^(?:licen[cs]e|copying|notice)(?:\..*)?$/i.test(basename(path)));
  const imports = fontImports(cssText);
  const lines = [
    "# Sunsplitter Private Package Inventory",
    "",
    `SOURCE \`${REPOSITORY}@${commit}\``,
    "",
    `**Posture:** ${PACKAGE_POSTURE}. This is an evidence inventory, not a rights-clearance or publication claim.`,
    "",
    "## Canonical package method",
    "",
    "- Source bytes: Git blobs from the exact commit above; working-tree and untracked files are ignored.",
    "- Paths: UTF-8 bytewise ascending order at the archive root, preserving tracked runtime paths.",
    "- ZIP entries: stored without compression; timestamp fixed to 1980-01-01 00:00:00; mode normalized to 100644; no directory entries, extras, comments, or platform timestamps.",
    "- Integrity: CRC-32 per ZIP entry, SHA-256 per payload file, and an external SHA-256 sidecar for the completed archive.",
    `- Source tree: \`${tree}\`.`,
    "",
    "## Fonts",
    "",
    `Tracked font files: **${fontFiles.length}**.`,
    ""
  ];
  if (fontFiles.length) lines.push(...fontFiles.map(path => `- \`${path}\``));
  else lines.push("No font binaries are tracked or bundled. CSS falls back to system fonts if the external request is unavailable.");
  lines.push("", "External stylesheet requests observed in tracked CSS:", "");
  if (imports.length) {
    for (const item of imports) lines.push(`- \`${item.url}\` — families: ${item.families.map(markdownEscape).join("; ") || "not declared"}`);
  } else lines.push("- None.");
  lines.push(
    "",
    "## License and notice files",
    "",
    `Tracked license/notice files: **${licenseFiles.length}**.`,
    ""
  );
  if (licenseFiles.length) lines.push(...licenseFiles.map(path => `- \`${path}\``));
  else lines.push("No LICENSE, LICENCE, COPYING, or NOTICE file is tracked at this source commit. External font licensing is therefore not bundled in this private package.");
  lines.push(
    "",
    "## Existing tracked assets",
    "",
    `Tracked assets inventoried: **${assetRows.length}**. Package-included assets: **${assetRows.filter(file => file.packageIncluded).length}**. No asset is generated, downloaded, added, deleted, or deduplicated by packaging.`,
    "",
    "`PROJECT_LOCK_NOT_RIGHTS_EVIDENCE` means repository art approval is not treated as a legal distribution grant. `NOT_EVIDENCED_IN_REPOSITORY` is a recorded gap for later rights work, not a clearance claim.",
    "",
    "| Source path | Package | Runtime-reference status | Bytes | SHA-256 | Detected MIME | Dimensions | Duplicate of | License evidence | Rights status |",
    "|---|:---:|---|---:|---|---|---:|---|---|---|"
  );
  for (const file of assetRows) {
    const dimensions = file.dimensions ? `${file.dimensions.width}×${file.dimensions.height}` : "n/a";
    const duplicate = file.duplicateOf ? `\`${markdownEscape(file.duplicateOf)}\`` : "—";
    lines.push(`| \`${markdownEscape(file.path)}\` | ${file.packageIncluded ? "yes" : "no"} | ${file.runtimeReferenceStatus} | ${file.bytes} | \`${file.sha256}\` | ${file.mime} | ${dimensions} | ${duplicate} | NOT_EVIDENCED_IN_REPOSITORY | PROJECT_LOCK_NOT_RIGHTS_EVIDENCE |`);
  }
  lines.push(
    "",
    "## Runtime payload summary",
    "",
    "| Kind | Files | Bytes |",
    "|---|---:|---:|"
  );
  const kinds = new Map();
  for (const file of runtimeFiles) {
    const kind = file.mime;
    const current = kinds.get(kind) || { files: 0, bytes: 0 };
    current.files += 1;
    current.bytes += file.bytes;
    kinds.set(kind, current);
  }
  for (const [kind, totals] of [...kinds].sort(([left], [right]) => canonicalPathCompare(left, right))) {
    lines.push(`| ${kind} | ${totals.files} | ${totals.bytes} |`);
  }
  lines.push(
    "",
    "## Deliberate exclusions",
    "",
    "The private player package excludes Git metadata, untracked files, `.netlify/`, `netlify.toml`, workflows, repository scripts, source-governance artifacts, store/price material, and tracked images with no static literal runtime reference under the declared extraction method. Exclusion does not call an asset unused, delete it, or rewrite repository bytes.",
    ""
  );
  return { text: lines.join("\n"), fontFiles, licenseFiles, imports, assetRows };
}

export function buildPrivatePackage({ sourceRef, outputPath, root = ROOT } = {}) {
  if (!outputPath) throw new Error("outputPath is required");
  const commit = exactCommit(sourceRef, root);
  const tree = git(["rev-parse", `${commit}^{tree}`], { root });
  const tracked = trackedTree(commit, root);
  const runtimeTree = runtimeClosure(commit, tracked, root);
  if (!runtimeTree.some(entry => entry.path === "index.html") || !runtimeTree.some(entry => entry.path === "css/style.css")) {
    throw new Error("runtime allowlist is missing required entry points");
  }
  const runtimeFiles = runtimeTree.map(entry => {
    const data = blobAt(commit, entry.path, root);
    const mime = detectedMime(entry.path, data);
    const dimensions = mime === "image/jpeg" ? jpegDimensions(data) : null;
    if ((extension(entry.path) === "jpg" || extension(entry.path) === "jpeg") && (!dimensions || mime !== "image/jpeg")) {
      throw new Error(`tracked JPEG failed MIME/dimension validation: ${entry.path}`);
    }
    return { path: entry.path, data, bytes: data.length, sha256: sha256(data), mime, dimensions, object: entry.object };
  }).sort((left, right) => canonicalPathCompare(left.path, right.path));
  const allAssetFiles = tracked.filter(entry => entry.type === "blob" && ASSET_EXTENSIONS.has(extension(entry.path))).map(entry => {
    const existing = runtimeFiles.find(file => file.path === entry.path);
    if (existing) return existing;
    const data = blobAt(commit, entry.path, root);
    const mime = detectedMime(entry.path, data);
    const dimensions = mime === "image/jpeg" ? jpegDimensions(data) : null;
    if ((extension(entry.path) === "jpg" || extension(entry.path) === "jpeg") && (!dimensions || mime !== "image/jpeg")) {
      throw new Error(`tracked JPEG failed MIME/dimension validation: ${entry.path}`);
    }
    return { path: entry.path, data, bytes: data.length, sha256: sha256(data), mime, dimensions, object: entry.object };
  }).sort((left, right) => canonicalPathCompare(left.path, right.path));
  const cssText = runtimeFiles.find(file => file.path === "css/style.css")?.data.toString("utf8") || "";
  const inventory = buildInventory({
    commit,
    tree,
    runtimeFiles,
    allAssetFiles,
    allTrackedPaths: tracked.map(entry => entry.path),
    cssText
  });
  const inventoryData = Buffer.from(inventory.text, "utf8");
  const payloadFiles = runtimeFiles.map(file => ({
    packagePath: file.path,
    sourcePath: file.path,
    gitBlob: file.object,
    bytes: file.bytes,
    sha256: file.sha256,
    mime: file.mime,
    dimensions: file.dimensions
  }));
  const manifest = {
    schemaVersion: 1,
    repository: REPOSITORY,
    sourceCommit: commit,
    sourceTree: tree,
    posture: PACKAGE_POSTURE,
    version: runtimeFiles.find(file => file.path === "VERSION.md")?.data.toString("utf8").trim() || null,
    canonicalZip: {
      compression: "store",
      pathOrder: "UTF-8 bytewise ascending",
      timestamp: "1980-01-01T00:00:00Z",
      fileMode: "100644",
      directoryEntries: false,
      extraFields: false,
      archiveComment: false
    },
    inventory: {
      path: "PRIVATE_PACKAGE_INVENTORY.md",
      bytes: inventoryData.length,
      sha256: sha256(inventoryData),
      trackedFontFiles: inventory.fontFiles,
      trackedLicenseFiles: inventory.licenseFiles,
      externalFontStylesheets: inventory.imports,
      trackedAssets: inventory.assetRows.map(file => ({
        path: file.path,
        gitBlob: file.object,
        bytes: file.bytes,
        sha256: file.sha256,
        mime: file.mime,
        dimensions: file.dimensions,
        packageIncluded: file.packageIncluded,
        runtimeReferenceStatus: file.runtimeReferenceStatus,
        duplicateOf: file.duplicateOf,
        licenseEvidence: "NOT_EVIDENCED_IN_REPOSITORY",
        rightsStatus: "PROJECT_LOCK_NOT_RIGHTS_EVIDENCE"
      }))
    },
    payloadFiles
  };
  const manifestData = Buffer.from(`${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  const zipEntries = [
    ...runtimeFiles.map(file => ({ path: file.path, data: file.data })),
    { path: "PRIVATE_PACKAGE_INVENTORY.md", data: inventoryData },
    { path: "PRIVATE_PACKAGE_MANIFEST.json", data: manifestData }
  ];
  const archive = createCanonicalZip(zipEntries);
  const archiveHash = sha256(archive);
  const absoluteOutput = resolve(outputPath);
  mkdirSync(dirname(absoluteOutput), { recursive: true });
  writeFileSync(absoluteOutput, archive);
  const checksumPath = `${absoluteOutput}.sha256`;
  const inventoryPath = `${absoluteOutput}.inventory.md`;
  const manifestPath = `${absoluteOutput}.manifest.json`;
  writeFileSync(checksumPath, `${archiveHash}  ${basename(absoluteOutput)}\n`, "utf8");
  writeFileSync(inventoryPath, inventoryData);
  writeFileSync(manifestPath, manifestData);
  return {
    repository: REPOSITORY,
    sourceCommit: commit,
    sourceTree: tree,
    outputPath: absoluteOutput,
    checksumPath,
    inventoryPath,
    manifestPath,
    archiveSha256: archiveHash,
    archiveBytes: archive.length,
    archiveEntries: zipEntries.length,
    runtimeFiles: runtimeFiles.length,
    packagedAssets: inventory.assetRows.filter(file => file.packageIncluded).length,
    inventoriedAssets: inventory.assetRows.length,
    fontsBundled: inventory.fontFiles.length,
    licenseFilesBundled: inventory.licenseFiles.length,
    externalFontStylesheets: inventory.imports.length
  };
}

function runSelfTest() {
  const entries = [
    { path: "z/readme.txt", data: Buffer.from("last\n") },
    { path: "a/bytes.bin", data: Buffer.from([0, 1, 2, 255]) }
  ];
  const first = createCanonicalZip(entries);
  const second = createCanonicalZip([...entries].reverse());
  assert.deepEqual(first, second);
  const parsed = readCanonicalZip(first);
  assert.deepEqual(parsed.map(entry => entry.path), ["a/bytes.bin", "z/readme.txt"]);
  assert.deepEqual(parsed.map(entry => entry.date), [DOS_DATE_1980_01_01, DOS_DATE_1980_01_01]);
  assert.deepEqual(parsed.map(entry => entry.time), [0, 0]);
  assert.deepEqual(parsed.map(entry => entry.mode), [FILE_MODE, FILE_MODE]);
  assert.deepEqual(parsed.map(entry => entry.flags), [UTF8_FLAG, UTF8_FLAG]);
  assert.equal(sha256(first), sha256(second));
  console.log(`PASS private-package ZIP self-test — ${parsed.length} canonical stored entries; sha256=${sha256(first)}`);
}

function parseCli(args) {
  const options = { sourceRef: null, outputPath: null, selfTest: false };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--source") options.sourceRef = args[++index];
    else if (arg === "--output") options.outputPath = args[++index];
    else if (arg === "--self-test") options.selfTest = true;
    else if (arg === "--help") options.help = true;
    else throw new Error(`unknown argument: ${arg}`);
  }
  return options;
}

function main() {
  const options = parseCli(process.argv.slice(2));
  if (options.help) {
    console.log("Usage: node scripts/build-private-package.mjs --source <commit> --output <archive.zip>");
    console.log("       node scripts/build-private-package.mjs --self-test");
    return;
  }
  if (options.selfTest) return runSelfTest();
  if (!options.outputPath) throw new Error("--output is required");
  console.log(JSON.stringify(buildPrivatePackage(options), null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try { main(); }
  catch (error) {
    console.error(`PRIVATE PACKAGE FAIL\n${error.stack || error.message}`);
    process.exitCode = 1;
  }
}
