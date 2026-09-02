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
const CONTENT_NOTICE_PATH = "PRIVATE_CONTENT_NOTICE.md";
const PHONE_GUIDE_PATH = "PRIVATE_PHONE_PLAY.md";
const PHONE_SERVER_PATH = "PRIVATE_PHONE_SERVER.mjs";
const STORE_DRAFT_PATH = "PRIVATE_STORE_DRAFT.md";
const SUPPORT_DRAFT_PATH = "PRIVATE_SUPPORT_DRAFT.md";
const PRIVACY_DRAFT_PATH = "PRIVATE_PRIVACY_DRAFT.md";
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

function buildContentNotice({ commit, tree, root }) {
  const evidenceSpecs = [
    {
      path: "index.html",
      supports: ["explicit-sexual-content-nudity-and-sexualized-imagery", "resource-scarcity-and-lethal-decisions"],
      requiredStatements: [
        "Adult sexual content is permanent.",
        "Named characters die. Deaths stick.",
        "Resources gate options. Numbers are not decoration."
      ]
    },
    {
      path: "src/scenes-30.js",
      supports: ["explicit-sexual-content-nudity-and-sexualized-imagery", "command-hierarchy-consent-and-favoritism"],
      requiredStatements: ["the chain of command tonight", "The sex is intense", "What follows is unhurried and explicit.", "The sex is quiet, intense, deliberate"]
    },
    {
      path: "src/scenes-31.js",
      supports: ["explicit-sexual-content-nudity-and-sexualized-imagery"],
      requiredStatements: ["What follows is explicit and unhurried."]
    },
    {
      path: "src/scenes-32.js",
      supports: ["explicit-sexual-content-nudity-and-sexualized-imagery", "intimate-recording-disclosure-and-privacy"],
      requiredStatements: ["intimate audio fragments", "Still naked"]
    },
    {
      path: "src/scenes-36.js",
      supports: ["pregnancy-and-reproductive-survival"],
      requiredStatements: ["unplanned pregnancy", "prevention after the fact"]
    },
    {
      path: "src/scenes-38.js",
      supports: ["blood-medical-trauma-death-and-decompression", "mass-death-grief-isolation-and-moral-distress"],
      requiredStatements: ["smells of ozone and blood", "Chest full of shrapnel"]
    },
    {
      path: "src/scenes-02.js",
      supports: ["blood-medical-trauma-death-and-decompression", "mass-death-grief-isolation-and-moral-distress"],
      requiredStatements: ["The screaming on the intercom lasts eleven seconds."]
    },
    {
      path: "src/scenes-42.js",
      supports: ["brief-unspecified-drink-use"],
      requiredStatements: ["He pours two measures"]
    },
    {
      path: "artifacts/ART_REQUESTS.md",
      supports: ["explicit-sexual-content-nudity-and-sexualized-imagery"],
      requiredStatements: [
        "fully nude except prop",
        "`lingerie_mira.jpg` — nude, clipboard held low",
        "breasts exposed, minimal cover"
      ]
    },
    ...[
      "images/shower_mira.jpg",
      "images/lingerie_mira.jpg",
      "images/afterglow_mira.jpg",
      "images/romance_amara_tomas.jpg"
    ].map(path => ({
      path,
      supports: ["explicit-sexual-content-nudity-and-sexualized-imagery"],
      requiredStatements: []
    }))
  ];
  const sourceEvidence = evidenceSpecs.map(spec => {
    const data = blobAt(commit, spec.path, root);
    const text = spec.requiredStatements.length ? data.toString("utf8") : "";
    for (const statement of spec.requiredStatements) {
      if (!text.includes(statement)) throw new Error(`content-classification evidence missing from exact source: ${spec.path} :: ${statement}`);
    }
    return {
      path: spec.path,
      gitBlob: git(["rev-parse", `${commit}:${spec.path}`], { root }),
      bytes: data.length,
      sha256: sha256(data),
      supports: spec.supports,
      observedStatements: spec.requiredStatements
    };
  });
  const adultClassificationDraft = {
    status: "DRAFT_PRIVATE_METADATA_ONLY",
    scope: "PRIVATE_PACKAGE_ONLY",
    sourceCommit: commit,
    sourceTree: tree,
    platform: null,
    officialRating: null,
    ratingAuthority: null,
    submitted: false,
    adultContent: true,
    sexualContentStatus: "PRESENT_AND_PERMANENT_IN_BUILD",
    explicitSexualText: true,
    fullNudity: true,
    sexualizedImagery: true,
    multiPartnerSexualContent: true,
    commanderCrewSexualPowerDynamics: true,
    intimateRecordingAndDisclosure: true,
    bloodAndMedicalTrauma: true,
    namedCharacterDeath: true,
    decompressionAndSuffocation: true,
    massCasualtyDisasterAndGrief: true,
    pregnancyAndReproductiveThemes: true,
    briefUnspecifiedDrinkUse: true,
    reducedContentModeAvailable: false,
    descriptors: [
      {
        id: "explicit-sexual-content-nudity-and-sexualized-imagery",
        runExposure: "OPTIONAL_REFUSABLE_ROUTES",
        playerFacingText: "Optional and refusable explicit sexual text, sexualized imagery, and full nudity, including an optional multi-partner encounter."
      },
      {
        id: "command-hierarchy-consent-and-favoritism",
        runExposure: "OPTIONAL_REFUSABLE_ROUTES",
        playerFacingText: "Sexual relationships within a commander/crew hierarchy; consent, refusal, boundaries, favoritism, and resource consequences are explicit themes."
      },
      {
        id: "intimate-recording-disclosure-and-privacy",
        runExposure: "OPTIONAL_ROUTE",
        playerFacingText: "Intimate recording, disclosure, and loss-of-privacy themes."
      },
      {
        id: "pregnancy-and-reproductive-survival",
        runExposure: "CONDITIONAL_ROUTE",
        playerFacingText: "Pregnancy risk, post-coital prevention, embryos, and reproductive-resource triage."
      },
      {
        id: "blood-medical-trauma-death-and-decompression",
        runExposure: "CORE_AND_BRANCHING",
        playerFacingText: "Blood, serious injury, medical trauma, suffocation/decompression, and named-character death."
      },
      {
        id: "mass-death-grief-isolation-and-moral-distress",
        runExposure: "CORE_AND_RECURRING",
        playerFacingText: "Mass death, grief, isolation, extinction themes, and moral distress."
      },
      {
        id: "resource-scarcity-and-lethal-decisions",
        runExposure: "CORE_AND_BRANCHING",
        playerFacingText: "Resource scarcity and command decisions that can sacrifice or kill named characters."
      },
      {
        id: "brief-unspecified-drink-use",
        runExposure: "OPTIONAL_ROUTE",
        playerFacingText: "Brief use of an unspecified non-regulation drink."
      }
    ],
    sourceEvidence,
    claimLimits: [
      "NO_PLATFORM_AGE_RATING_ASSIGNED",
      "NO_STOREFRONT_CLASSIFICATION_SUBMITTED",
      "NO_PUBLICATION_AUTHORIZED"
    ]
  };
  const lines = [
    "# Sunsplitter — Content Notice",
    "",
    `SOURCE \`${REPOSITORY}@${commit}\``,
    "",
    `**Posture:** ${PACKAGE_POSTURE}.`,
    "",
    "Sunsplitter is a grim narrative-survival game for adults. This private build contains:",
    "",
    ...adultClassificationDraft.descriptors.map(descriptor => `- ${descriptor.playerFacingText}`),
    "",
    "This build does not provide a reduced-content mode. Its in-game opening notice also states that adult sexual content is permanent and that named-character deaths persist.",
    "",
    "This notice describes the exact private-package source commit above. It is not a platform age rating, storefront submission, publication authorization, or commercial claim.",
    ""
  ];
  return { text: lines.join("\n"), adultClassificationDraft };
}

function buildPrivatePhoneServer({ commit, tree }) {
  const lines = [
    "#!/usr/bin/env node",
    "",
    "import { createHash } from \"node:crypto\";",
    "import { createServer } from \"node:http\";",
    "import { readFileSync } from \"node:fs\";",
    "import { networkInterfaces } from \"node:os\";",
    "import { dirname, resolve } from \"node:path\";",
    "import { fileURLToPath } from \"node:url\";",
    "",
    `const SOURCE_COMMIT = ${JSON.stringify(commit)};`,
    `const SOURCE_TREE = ${JSON.stringify(tree)};`,
    `const PACKAGE_POSTURE = ${JSON.stringify(PACKAGE_POSTURE)};`,
    "const ROOT = dirname(fileURLToPath(import.meta.url));",
    "process.on(\"uncaughtException\", error => {",
    "  console.error(\"Could not start the private phone server. Keep every extracted file together and ask the sender for help.\");",
    "  console.error(error.message);",
    "  process.exit(1);",
    "});",
    "const MIME = new Map([",
    "  [\".html\", \"text/html; charset=utf-8\"],",
    "  [\".css\", \"text/css; charset=utf-8\"],",
    "  [\".js\", \"text/javascript; charset=utf-8\"],",
    "  [\".jpg\", \"image/jpeg\"],",
    "  [\".jpeg\", \"image/jpeg\"],",
    "  [\".md\", \"text/plain; charset=utf-8\"]",
    "]);",
    "",
    "const nodeMajor = Number(process.versions.node.split(\".\")[0]);",
    "if (!Number.isInteger(nodeMajor) || nodeMajor < 22) throw new Error(\"Node.js 22 or newer is required\");",
    "",
    "function sha256(data) {",
    "  return createHash(\"sha256\").update(data).digest(\"hex\");",
    "}",
    "",
    "function safePackagePath(path) {",
    "  return typeof path === \"string\" && !!path && !path.startsWith(\"/\") && !path.includes(\"\\\\\") &&",
    "    !path.includes(\"\\0\") && !path.split(\"/\").includes(\"..\");",
    "}",
    "",
    "function options(args) {",
    "  const value = { host: \"0.0.0.0\", port: 8787, json: false };",
    "  for (let index = 0; index < args.length; index += 1) {",
    "    const arg = args[index];",
    "    if (arg === \"--host\") value.host = args[++index];",
    "    else if (arg === \"--port\") value.port = Number(args[++index]);",
    "    else if (arg === \"--json\") value.json = true;",
    "    else if (arg === \"--help\") value.help = true;",
    "    else throw new Error(`unknown argument: ${arg}`);",
    "  }",
    "  if (!value.host || !Number.isInteger(value.port) || value.port < 0 || value.port > 65535) throw new Error(\"invalid host or port\");",
    "  return value;",
    "}",
    "",
    "function extension(path) {",
    "  const match = path.match(/\\.[^.\\/]+$/);",
    "  return match ? match[0].toLowerCase() : \"\";",
    "}",
    "",
    "function requestedPath(rawUrl) {",
    "  let decoded;",
    "  try { decoded = decodeURIComponent(new URL(rawUrl, \"http://private.invalid\").pathname); }",
    "  catch { return null; }",
    "  if (decoded === \"/\") return \"index.html\";",
    "  const path = decoded.replace(/^\\/+/, \"\");",
    "  if (!path || path.includes(\"\\\\\") || path.includes(\"\\0\") || path.split(\"/\").includes(\"..\")) return null;",
    "  return path;",
    "}",
    "",
    "function isPrivateIpv4(address) {",
    "  const octets = address.split(\".\").map(Number);",
    "  return octets.length === 4 && octets.every(octet => Number.isInteger(octet) && octet >= 0 && octet <= 255) &&",
    "    (octets[0] === 10 || (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) || (octets[0] === 192 && octets[1] === 168));",
    "}",
    "",
    "function phoneUrls(host, port) {",
    "  const hosts = host === \"0.0.0.0\"",
    "    ? Object.values(networkInterfaces()).flat().filter(item => item && item.family === \"IPv4\" && !item.internal && isPrivateIpv4(item.address)).map(item => item.address)",
    "    : [host];",
    "  const urls = [...new Set(hosts)].map(address => `http://${address}:${port}/`);",
    "  if (!urls.length) throw new Error(\"no reachable private IPv4 address was found; connect both devices to the same trusted private network\");",
    "  return urls;",
    "}",
    "",
    "const settings = options(process.argv.slice(2));",
    "if (settings.help) {",
    "  process.stdout.write(\"Usage: node PRIVATE_PHONE_SERVER.mjs [--host 0.0.0.0] [--port 8787] [--json]\\n\");",
    "  process.exit(0);",
    "}",
    "const manifest = JSON.parse(readFileSync(resolve(ROOT, \"PRIVATE_PACKAGE_MANIFEST.json\"), \"utf8\"));",
    "if (manifest.schemaVersion !== 4 || manifest.sourceCommit !== SOURCE_COMMIT || manifest.sourceTree !== SOURCE_TREE || manifest.posture !== PACKAGE_POSTURE) {",
    "  throw new Error(\"package manifest identity or posture does not match this server\");",
    "}",
    "const phoneResume = manifest.phoneResume || {};",
    "const serverData = readFileSync(fileURLToPath(import.meta.url));",
    "if (phoneResume.serverPath !== \"PRIVATE_PHONE_SERVER.mjs\" || phoneResume.serverBytes !== serverData.length || phoneResume.serverSha256 !== sha256(serverData)) {",
    "  throw new Error(\"private phone server bytes do not match the manifest\");",
    "}",
    "if (phoneResume.startPath !== \"index.html\" || phoneResume.requiredOrigin !== \"STABLE_PRIVATE_HTTP_OR_HTTPS\" || phoneResume.directFileModeClaimed !== false) {",
    "  throw new Error(\"private phone origin contract does not match this server\");",
    "}",
    "if (!Array.isArray(manifest.payloadFiles) || !manifest.payloadFiles.length) throw new Error(\"manifest payload list is missing\");",
    "const allowed = new Map();",
    "for (const file of manifest.payloadFiles) {",
    "  if (!safePackagePath(file.packagePath) || file.packagePath !== file.sourcePath || allowed.has(file.packagePath)) {",
    "    throw new Error(`unsafe or duplicate manifest payload path: ${file.packagePath}`);",
    "  }",
    "  const data = readFileSync(resolve(ROOT, file.packagePath));",
    "  if (!Number.isInteger(file.bytes) || file.bytes !== data.length || !/^[0-9a-f]{64}$/.test(file.sha256 || \"\") || file.sha256 !== sha256(data)) {",
    "    throw new Error(`package payload failed manifest verification: ${file.packagePath}`);",
    "  }",
    "  allowed.set(file.packagePath, data);",
    "}",
    "if (!allowed.has(\"index.html\")) throw new Error(\"manifest does not allow the game entry point\");",
    "",
    "const server = createServer((request, response) => {",
    "  if (request.method !== \"GET\" && request.method !== \"HEAD\") {",
    "    response.writeHead(405, { Allow: \"GET, HEAD\", \"Cache-Control\": \"no-store\" });",
    "    response.end();",
    "    return;",
    "  }",
    "  const path = requestedPath(request.url || \"/\");",
    "  if (!path || !allowed.has(path)) {",
    "    response.writeHead(404, { \"Cache-Control\": \"no-store\" });",
    "    response.end(\"Not found\\n\");",
    "    return;",
    "  }",
    "  const data = allowed.get(path);",
    "  response.writeHead(200, {",
    "    \"Content-Type\": MIME.get(extension(path)) || \"application/octet-stream\",",
    "    \"Content-Length\": data.length,",
    "    \"Cache-Control\": \"no-store\",",
    "    \"X-Content-Type-Options\": \"nosniff\",",
    "    \"Cross-Origin-Resource-Policy\": \"same-origin\",",
    "    \"Referrer-Policy\": \"no-referrer\",",
    "    \"Content-Security-Policy\": \"default-src 'self'; img-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; font-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'\"",
    "  });",
    "  response.end(request.method === \"HEAD\" ? undefined : data);",
    "});",
    "server.on(\"error\", error => { console.error(`PRIVATE PHONE SERVER FAIL\\n${error.stack || error.message}`); process.exitCode = 1; });",
    "server.listen(settings.port, settings.host, () => {",
    "  const address = server.address();",
    "  const port = typeof address === \"object\" && address ? address.port : settings.port;",
    "  const urls = phoneUrls(settings.host, port);",
    "  const ready = { sourceCommit: SOURCE_COMMIT, sourceTree: SOURCE_TREE, host: settings.host, port, urls };",
    "  if (settings.json) process.stdout.write(`${JSON.stringify(ready)}\\n`);",
    "  else {",
    "    process.stdout.write(`Sunsplitter private phone server\\nSOURCE ${SOURCE_COMMIT}\\n`);",
    "    process.stdout.write(\"Try the addresses below on the phone. Record the one that opens; resume must use that same address.\\n\");",
    "    urls.forEach((url, index) => process.stdout.write(`  [${index + 1}] ${url}\\n`));",
    "    process.stdout.write(\"Keep this window open. Press Control-C to stop.\\n\");",
    "  }",
    "});",
    "for (const signal of [\"SIGINT\", \"SIGTERM\"]) process.on(signal, () => server.close(() => process.exit(0)));",
    ""
  ];
  return lines.join("\n");
}

function buildPrivatePhoneGuide({ commit, tree }) {
  const archiveName = `sunsplitter-private-${commit.slice(0, 8)}.zip`;
  const lines = [
    "# Sunsplitter — Private Phone Play",
    "",
    `SOURCE \`${REPOSITORY}@${commit}\``,
    `TREE \`${tree}\``,
    "",
    `**Posture:** ${PACKAGE_POSTURE}.`,
    "",
    "This path does not publish the game to an internet host. While it runs, the included server temporarily exposes the extracted game without authentication to devices that can reach this computer.",
    "",
    "## Network boundary",
    "",
    "Use only a trusted private network. Do not forward the port or run this on public Wi-Fi. On Windows, allow Node.js on Private networks only. On macOS, allow the Node.js connection only while the computer is on that trusted network. If you cannot keep that boundary, stop and ask the sender for help. The server blocks off-computer page resources, serves only manifest-listed game files, accepts no uploads, and must be stopped afterward.",
    "",
    "## Open on a phone",
    "",
    `1. Download \`${archiveName}\` and its \`.sha256\` sidecar through the private handoff.`,
    "2. Open a terminal in the folder containing both downloaded files: on Mac, select that folder in Finder and choose **Services → New Terminal at Folder**; on Windows, open the folder, right-click its background, and choose **Open in Terminal**.",
    `3. Verify the ZIP before opening it. On Mac, run \`shasum -a 256 ${archiveName}\`. On Windows PowerShell, run \`Get-FileHash .\\${archiveName} -Algorithm SHA256\`. The result must match the 64-character value in the sidecar; otherwise stop and ask the sender for a clean copy.`,
    "4. Extract the complete ZIP into one folder on the Mac or PC. Do not move individual files out of that folder. Open a new terminal in that extracted folder using the same Finder or Windows step above.",
    "5. Run `node --version`. It must report v22 or newer. If Node is missing or older, stop and ask the sender for setup help.",
    `6. Run \`node ${PHONE_SERVER_PATH}\` and keep the computer awake.`,
    "7. Connect the phone to the same trusted network. In regular Safari on iPhone or regular Chrome on Android, try the printed addresses. Record the exact address that opens, including the protocol and port. If none opens, stop and ask the sender for help.",
    "8. Acknowledge the content notice, begin, make at least one choice, tap **Save**, and confirm **Saved** appears.",
    "9. Close the tab. Open a new regular tab at the recorded address in the same browser. Confirm **Continue** appears, tap it, and verify the same scene and ship status return.",
    "10. Stop the server with Control-C when the play session is finished.",
    "",
    "## Resume later",
    "",
    `Return to the same extracted folder and run \`node ${PHONE_SERVER_PATH}\` again. Use the same recorded protocol, address, and port in the same phone browser. If that address is no longer printed or reachable, do not start a new run; stop and ask the sender to restore the same local address.`,
    "",
    "## Save custody",
    "",
    "- The save is stored by that phone browser; it is not uploaded or synced.",
    "- Reuse the exact full web address and the same browser. A different address or browser has a different local save.",
    "- Do not use Private or Incognito browsing. Clearing browser or site data—or automatic browser cleanup—can remove the save.",
    "- Do not open `index.html` directly from Files, Downloads, Quick Look, or a `file://` address. Persistent storage is not claimed for that route.",
    ""
  ];
  return lines.join("\n");
}

function buildPrivateDrafts({ commit, tree, version, root, runtimeFiles, externalFontStylesheets }) {
  const textRuntimeFiles = runtimeFiles.filter(file => file.mime.startsWith("text/"));
  const networkApiPatterns = [
    ["fetch", /\bfetch\s*\(/],
    ["XMLHttpRequest", /\bXMLHttpRequest\b/],
    ["WebSocket", /\bWebSocket\b/],
    ["EventSource", /\bEventSource\b/],
    ["sendBeacon", /\bsendBeacon\s*\(/],
    ["document.cookie", /\bdocument\.cookie\b/],
    ["geolocation", /\bnavigator\.geolocation\b/]
  ];
  const networkApiMatches = [];
  const externalReferences = [];
  for (const file of textRuntimeFiles) {
    const text = file.data.toString("utf8");
    for (const [name, pattern] of networkApiPatterns) {
      if (pattern.test(text)) networkApiMatches.push({ path: file.path, api: name });
    }
    for (const match of text.matchAll(/https?:\/\/[^\s'"`)]+/g)) externalReferences.push({ path: file.path, url: match[0] });
  }
  if (networkApiMatches.length) throw new Error(`private-draft network API scan found: ${JSON.stringify(networkApiMatches)}`);
  const expectedExternalReferences = externalFontStylesheets.map(item => ({ path: "css/style.css", url: item.url }));
  if (JSON.stringify(externalReferences) !== JSON.stringify(expectedExternalReferences)) {
    throw new Error(`private-draft external reference scan drifted: ${JSON.stringify(externalReferences)}`);
  }
  const evidenceSpecs = [
    {
      path: "README.md",
      requiredStatements: [
        "Sunsplitter is a short, grim narrative-survival browser game about commanding a damaged colonization ark after Earth's sudden cascade.",
        "It is a static HTML/CSS/JavaScript project with no build step, backend, account system, framework, or bundler."
      ]
    },
    {
      path: "index.html",
      requiredStatements: [
        "Adult sexual content is permanent.",
        "Named characters die. Deaths stick.",
        "Choices have weight. The Future and the Living will both ask for blood."
      ]
    },
    {
      path: "src/engine.js",
      requiredStatements: [
        "const TONE_ACK_KEY = \"sunsplitter_tone_ack_v1\";",
        "const SAVE_KEY = \"sunsplitter_save_v3\";",
        "function exportSaveFile()",
        "function requestSaveImport()"
      ]
    },
    {
      path: "css/style.css",
      requiredStatements: externalFontStylesheets.map(item => item.url)
    }
  ];
  const sourceEvidence = evidenceSpecs.map(spec => {
    const data = blobAt(commit, spec.path, root);
    const text = data.toString("utf8");
    for (const statement of spec.requiredStatements) {
      if (!text.includes(statement)) throw new Error(`private-draft evidence missing from exact source: ${spec.path} :: ${statement}`);
    }
    return {
      path: spec.path,
      gitBlob: git(["rev-parse", `${commit}:${spec.path}`], { root }),
      bytes: data.length,
      sha256: sha256(data),
      observedStatements: spec.requiredStatements
    };
  });
  const commonHeader = title => [
    `# Sunsplitter — ${title}`,
    "",
    `SOURCE \`${REPOSITORY}@${commit}\``,
    `TREE \`${tree}\``,
    `PACKAGE VERSION \`${version || "UNAVAILABLE"}\``,
    "",
    `**Status:** DRAFT · NON-PUBLIC · ${PACKAGE_POSTURE}.`,
    "**Use:** NOT FOR PUBLICATION.",
    ""
  ];
  const store = [
    ...commonHeader("Non-Public Store Copy Draft"),
    "Internal review copy only. It is not a live listing, submission, offer for sale, publication authorization, certification, or rights-clearance statement.",
    "",
    "## Draft listing copy",
    "",
    "**Title:** Sunsplitter",
    "",
    "**Short description:** Command a damaged colonization ark after Earth's sudden cascade. Decide what—and who—the last ship will carry forward.",
    "",
    "**Long description:**",
    "",
    "Sunsplitter is a short, grim narrative-survival browser game. You are the Commander of a damaged colonization ark built for thousands; nine people cleared the hatch after Earth failed.",
    "",
    "The Future and the Living both make demands. Resources gate choices, early orders return later, named characters can die, and the ending reflects the run you actually played.",
    "",
    "This exact private candidate runs in a browser, includes a private phone-opening path, keeps saves locally, and contains permanent adult sexual content alongside death, medical trauma, grief, reproductive themes, and lethal command decisions. The accompanying content notice gives the current source-grounded draft descriptors.",
    "",
    "## Draft feature bullets",
    "",
    "- Choice-driven narrative survival with persistent consequences.",
    "- Local save and Continue in the same browser.",
    "- Private phone-opening instructions; later PC-readiness claims are not made here.",
    "- Adult content is permanent; there is no reduced-content mode.",
    "",
    "## Required companion material",
    "",
    `- Content details: \`${CONTENT_NOTICE_PATH}\`.`,
    "- Exact package identity and evidence inventory: `PRIVATE_PACKAGE_MANIFEST.json` and `PRIVATE_PACKAGE_INVENTORY.md`.",
    `- Private phone opening instructions: \`${PHONE_GUIDE_PATH}\`.`,
    "",
    "## Parked for 0.39",
    "",
    "- Storefront-specific fields, current platform rules, and submission review.",
    "- Commercial terms, payment configuration, business/tax decisions, and public launch timing.",
    "- Final adult classification, generative-AI disclosure, cover/screenshots, and marketing claims.",
    "- Font, asset, and third-party rights evidence; the current inventory records gaps and does not grant clearance.",
    "- Final support and privacy contacts plus owner/legal review.",
    ""
  ].join("\n");
  const support = [
    ...commonHeader("Non-Public Support Draft"),
    "Internal support-response draft for this exact private package. No support channel, service level, refund policy, or commercial availability is promised.",
    "",
    "## Before play",
    "",
    "1. Keep the ZIP and its `.sha256` sidecar together and verify the checksum before extracting.",
    `2. Follow \`${PHONE_GUIDE_PATH}\` for the private phone path. Do not open \`index.html\` directly from Files, Downloads, Quick Look, or a \`file://\` address.`,
    "3. Use a regular browser window, keep the same full web address, and do not clear browser/site data if you need the local Continue slot.",
    "",
    "## Draft troubleshooting replies",
    "",
    "### The checksum does not match",
    "",
    "Stop. Do not extract or run the ZIP. Ask the sender for a clean copy and checksum.",
    "",
    "### The phone cannot open a printed address",
    "",
    "Confirm the phone and computer are on the same trusted private network, keep the server window open, and try each printed private address. Do not forward the port or use public Wi-Fi. If none works, stop and ask the sender for help.",
    "",
    "### Continue is missing",
    "",
    "Return to the exact same full address in the same regular browser. A different address, browser, Private/Incognito window, cleared site data, or automatic browser cleanup has a different or missing local save.",
    "",
    "### The package reports damaged or mismatched files",
    "",
    "Stop the server. Keep every extracted file together, verify the original ZIP checksum again, and extract a clean copy. Do not replace individual files.",
    "",
    "## Draft issue report fields",
    "",
    "- Copy the `SOURCE` line from this draft and the ZIP SHA-256 checksum.",
    "- Device, operating system, browser, and browser version.",
    "- Exact step that failed and the visible error text.",
    "- Whether this was a new run, Continue, export, or import.",
    "- Do not send a save file or screenshot unless the sender separately asks for it to reproduce the problem. Hide private addresses and personal information first.",
    "",
    "## Draft contact route",
    "",
    "For this private test, use the same private handoff channel through which you received the package. No public support address or response time is established here.",
    "",
    "## Parked for 0.39",
    "",
    "Support contact, hours, response target, refund/payment handling, accessibility escalation, known-bugs publication, and platform-specific procedures remain owner/policy decisions.",
    ""
  ].join("\n");
  const privacy = [
    ...commonHeader("Private Package Data Notes Draft"),
    "Internal review draft only. It is not a published legal policy, legal advice, or a claim about any future storefront, public host, download provider, browser, device, operating system, or network operator.",
    "",
    "## Exact private-package behavior",
    "",
    "- The packaged game is static HTML, CSS, and JavaScript with no account system or backend. No analytics or telemetry integration was observed in the inspected runtime files.",
    "- The manifest's static scan covers every packaged text runtime file, checks named browser networking/data APIs and literal HTTP(S) references, and records the exact matches. It is not a comprehensive privacy audit.",
    "- Normal play stores the content-notice acknowledgement and game save in that browser's local storage. No upload or sync behavior was observed in the inspected runtime files.",
    "- Save export creates a JSON file only when the player requests it. Save import reads the file the player selects and validates it before replacing a valid save.",
    "- The included private server uses HTTP, not HTTPS. It serves only included game files on a trusted local network, has no authentication, accepts no uploads, writes no application request log, and blocks the game page from making off-computer connections.",
    "- The tracked CSS contains an external font stylesheet reference. The included private server blocks that request and uses system fallback fonts; another opening method may let the browser attempt the external request.",
    "",
    "## Player control and retention",
    "",
    "- Browser-stored values remain locally until they are replaced or removed by game actions, player browser controls, or browser/device cleanup. Automatic transmission or receipt of those local values was not observed in the inspected game and server files.",
    "- Exported save files remain wherever the player chooses to store or share them. Automatic receipt of exported saves was not observed in the inspected game and server files.",
    "- Stopping the private server ends the package's local-network availability. The server does not provide an account, cloud save, upload route, or public hosting service.",
    "",
    "## Scope boundary",
    "",
    "The method used to send the ZIP is outside this package and may have its own privacy terms. Browser, operating-system, network, security-software, and future storefront processing must be reviewed separately before any public release.",
    "",
    "## Parked for 0.39",
    "",
    "Final owner/legal review, privacy and support contacts, jurisdiction-specific notices, platform/processor disclosures, public-host behavior, retention/request procedures, and rights evidence are unset. This draft does not declare them complete.",
    ""
  ].join("\n");
  return {
    store,
    support,
    privacy,
    sourceEvidence,
    sourceScan: {
      inspectedTextPaths: textRuntimeFiles.map(file => file.path),
      networkApiMatches,
      externalReferences
    },
    gapsParkedFor: "0.39"
  };
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
    "The private player package excludes Git metadata, untracked files, `.netlify/`, `netlify.toml`, workflows, repository scripts, source-governance artifacts, commercial terms, live-listing configuration, and tracked images with no static literal runtime reference under the declared extraction method. The generated non-public store/support/privacy drafts are the package's only listing-policy material. Exclusion does not call an asset unused, delete it, or rewrite repository bytes.",
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
  const contentNotice = buildContentNotice({ commit, tree, root });
  const contentNoticeData = Buffer.from(contentNotice.text, "utf8");
  const phoneServerData = Buffer.from(buildPrivatePhoneServer({ commit, tree }), "utf8");
  const phoneGuideData = Buffer.from(buildPrivatePhoneGuide({ commit, tree }), "utf8");
  const version = runtimeFiles.find(file => file.path === "VERSION.md")?.data.toString("utf8").trim() || null;
  const versionLabel = version?.split(/\r?\n/).find(line => line.trim())?.trim() || null;
  const privateDrafts = buildPrivateDrafts({
    commit,
    tree,
    version: versionLabel,
    root,
    runtimeFiles,
    externalFontStylesheets: inventory.imports
  });
  const storeDraftData = Buffer.from(privateDrafts.store, "utf8");
  const supportDraftData = Buffer.from(privateDrafts.support, "utf8");
  const privacyDraftData = Buffer.from(privateDrafts.privacy, "utf8");
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
    schemaVersion: 4,
    repository: REPOSITORY,
    sourceCommit: commit,
    sourceTree: tree,
    posture: PACKAGE_POSTURE,
    version,
    canonicalZip: {
      compression: "store",
      pathOrder: "UTF-8 bytewise ascending",
      timestamp: "1980-01-01T00:00:00Z",
      fileMode: "100644",
      directoryEntries: false,
      extraFields: false,
      archiveComment: false
    },
    contentNotice: {
      path: CONTENT_NOTICE_PATH,
      bytes: contentNoticeData.length,
      sha256: sha256(contentNoticeData),
      playerFacing: true,
      openingNoticeEvidencePath: "index.html",
      existingInGameSurface: "index.html#tone-screen",
      generatedFromEvidencePaths: contentNotice.adultClassificationDraft.sourceEvidence.map(evidence => evidence.path)
    },
    phoneResume: {
      guidePath: PHONE_GUIDE_PATH,
      guideBytes: phoneGuideData.length,
      guideSha256: sha256(phoneGuideData),
      serverPath: PHONE_SERVER_PATH,
      serverBytes: phoneServerData.length,
      serverSha256: sha256(phoneServerData),
      startPath: "index.html",
      requiredOrigin: "STABLE_PRIVATE_HTTP_OR_HTTPS",
      serverBoundary: "TRUSTED_LAN_UNAUTHENTICATED",
      publicHostRequired: false,
      directFileModeClaimed: false,
      browserProfileRequirement: "SAME_REGULAR_BROWSER_PROFILE",
      originContinuityRequirement: "SAME_SCHEME_HOST_AND_PORT",
      privateBrowsingSupported: false,
      saveStorageKey: "sunsplitter_save_v3",
      saveSchemaVersion: 3,
      ownerPhysicalProofRequired: true
    },
    privateDrafts: {
      status: "DRAFT_PRIVATE_METADATA_ONLY",
      scope: "PRIVATE_PACKAGE_ONLY",
      sourceCommit: commit,
      sourceTree: tree,
      store: { path: STORE_DRAFT_PATH, bytes: storeDraftData.length, sha256: sha256(storeDraftData) },
      support: { path: SUPPORT_DRAFT_PATH, bytes: supportDraftData.length, sha256: sha256(supportDraftData) },
      privacy: { path: PRIVACY_DRAFT_PATH, bytes: privacyDraftData.length, sha256: sha256(privacyDraftData) },
      sourceEvidence: privateDrafts.sourceEvidence,
      sourceScan: privateDrafts.sourceScan,
      publicationStatus: "NOT_AUTHORIZED",
      storefrontSubmissionStatus: "NOT_SUBMITTED",
      price: null,
      paymentStatus: "NOT_OFFERED_IN_THIS_DRAFT",
      certificationStatus: "NOT_CERTIFIED",
      rightsClearanceStatus: "NOT_EVIDENCED_IN_REPOSITORY",
      platformPolicyStatus: "DEFERRED_TO_0_39_SUBMISSION_TIME_RECHECK",
      privacyReviewStatus: "DRAFT_STATIC_BUILD_OBSERVATIONS_ONLY",
      legalReviewStatus: "NOT_RECORDED",
      publicUrl: null,
      supportContact: null,
      privacyContact: null,
      gapsParkedFor: privateDrafts.gapsParkedFor,
      claimLimits: [
        "NO_PUBLICATION_AUTHORIZED",
        "NO_STOREFRONT_SUBMISSION",
        "NO_PRICE_OR_PAYMENT_TERMS",
        "NO_CERTIFICATION_CLAIM",
        "NO_RIGHTS_CLEARANCE_CLAIM",
        "NO_PLATFORM_POLICY_VERIFICATION",
        "NO_COMPREHENSIVE_PRIVACY_PROMISE"
      ]
    },
    adultClassificationDraft: contentNotice.adultClassificationDraft,
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
    { path: CONTENT_NOTICE_PATH, data: contentNoticeData },
    { path: PHONE_GUIDE_PATH, data: phoneGuideData },
    { path: PHONE_SERVER_PATH, data: phoneServerData },
    { path: STORE_DRAFT_PATH, data: storeDraftData },
    { path: SUPPORT_DRAFT_PATH, data: supportDraftData },
    { path: PRIVACY_DRAFT_PATH, data: privacyDraftData },
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
  const contentNoticePath = `${absoluteOutput}.content-notice.md`;
  const phoneGuidePath = `${absoluteOutput}.phone-play.md`;
  const phoneServerPath = `${absoluteOutput}.phone-server.mjs`;
  const storeDraftPath = `${absoluteOutput}.store-draft.md`;
  const supportDraftPath = `${absoluteOutput}.support-draft.md`;
  const privacyDraftPath = `${absoluteOutput}.privacy-draft.md`;
  const manifestPath = `${absoluteOutput}.manifest.json`;
  writeFileSync(checksumPath, `${archiveHash}  ${basename(absoluteOutput)}\n`, "utf8");
  writeFileSync(inventoryPath, inventoryData);
  writeFileSync(contentNoticePath, contentNoticeData);
  writeFileSync(phoneGuidePath, phoneGuideData);
  writeFileSync(phoneServerPath, phoneServerData);
  writeFileSync(storeDraftPath, storeDraftData);
  writeFileSync(supportDraftPath, supportDraftData);
  writeFileSync(privacyDraftPath, privacyDraftData);
  writeFileSync(manifestPath, manifestData);
  return {
    repository: REPOSITORY,
    sourceCommit: commit,
    sourceTree: tree,
    outputPath: absoluteOutput,
    checksumPath,
    inventoryPath,
    contentNoticePath,
    phoneGuidePath,
    phoneServerPath,
    storeDraftPath,
    supportDraftPath,
    privacyDraftPath,
    manifestPath,
    archiveSha256: archiveHash,
    archiveBytes: archive.length,
    archiveEntries: zipEntries.length,
    runtimeFiles: runtimeFiles.length,
    contentNoticeBytes: contentNoticeData.length,
    phoneGuideBytes: phoneGuideData.length,
    phoneServerBytes: phoneServerData.length,
    storeDraftBytes: storeDraftData.length,
    supportDraftBytes: supportDraftData.length,
    privacyDraftBytes: privacyDraftData.length,
    adultClassificationDescriptors: contentNotice.adultClassificationDraft.descriptors.length,
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
