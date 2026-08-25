#!/usr/bin/env node

// ART-INTEGRATION-R2 fail-closed validation.
// Uses Node built-ins plus the repository's existing headless runtime loader.

import { createHash } from "node:crypto";
import {
  existsSync,
  readFileSync,
  readdirSync,
  statSync
} from "node:fs";
import { basename, dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { loadGame } from "./simulate.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const RECORD_PATH = "artifacts/ART-INTEGRATION-R2-55_RECORD.json";
const EXPECTED_BASE = Object.freeze({
  commit: "23951012655b0037a55e82c755b66dd4d852f20b",
  tree: "96829ad0e01619f56bed2121a666645b3f9b5259"
});
const EXPECTED_ARCHIVES = Object.freeze({
  2: {
    sha256: "1d1b23afbaeafda3b4f865302ab9f605e8e38780bf94abafa0c5c68ab52bd485",
    passed: 129,
    total: 129,
    plates: 34
  },
  3: {
    sha256: "6f1f40886a112fe6b2e0e543690cecce36a522b5daf408b784a21f67821e633f",
    passed: 45,
    total: 45,
    plates: 21
  }
});
const EXPECTED_MAPPING_SHA256 = "7858fb79fc559318d12155353f86fbc70915ff9dfc4d80d9b819d7b840de3b05";
const EXPECTED_PLATE_MANIFEST_SHA256 = "269ea586683a89ed163ca558599f7bd776c26dbc3b32e1377787afaba9e68355";
const EIGHT = ["lena", "elias", "mira", "tomas", "amara", "jiro", "sela", "vess"];
const LETHAL_REMAPS = Object.freeze({
  act3_lethal_elias_end: "act3_lethal_elias_order",
  act3_lethal_mira_end: "act3_lethal_mira_board",
  act3_lethal_tomas_end: "act3_lethal_tomas_cost"
});
const GUARDED_PLATES = Object.freeze({
  faction_split: ["all eight named crew available", "images/corridor_variant.jpg"],
  reckon_public: ["all eight named crew available", "images/observation.jpg"],
  reckon_suppress: ["Elias, recovered Tomas, and Amara alive", "images/observation_reckon.jpg"],
  reckon_truth: ["recovered Tomas and Jiro plus Lena and Sela alive", "images/observation.jpg"],
  status: ["survivors > 5 and Elias, Mira, Lena, and Sela alive", "images/corridor.jpg when survivors <= 5; otherwise images/observation.jpg"],
  arc_fork: ["roster-neutral; obsolete Tomas/Jiro guard removed", null],
  prom_vent_keep: ["Amara alive and fail-closed available-roster count >= 7", "images/corridor_variant.jpg"],
  prom_price: ["Sela alive and fail-closed available-roster count = 9", "images/vault_reveal.jpg"],
  prom_price_keep: ["Sela alive and fail-closed available-roster count >= 6", "images/vault_reveal.jpg"],
  crew_walk: ["survivors > 5", "images/corridor.jpg"]
});
const ALLOWED_BINDINGS = new Set(["scene.image", "sceneImages"]);
const SOF_MARKERS = new Set([
  0xc0, 0xc1, 0xc2, 0xc3,
  0xc5, 0xc6, 0xc7,
  0xc9, 0xca, 0xcb,
  0xcd, 0xce, 0xcf
]);

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

export function plateManifestSha256(plates) {
  const tuples = (plates || []).map(plate => [
    plate.wave,
    plate.approvedSceneId,
    [...(plate.wiredSceneIds || [])].sort(),
    plate.runtimePath,
    plate.sha256,
    plate.bytes,
    [...(plate.binding || [])].sort(),
    plate.guard,
    plate.fallback
  ]).sort((left, right) => JSON.stringify(left).localeCompare(JSON.stringify(right)));
  const payload = tuples.map(tuple => JSON.stringify(tuple)).join("\n") + "\n";
  return sha256(payload);
}

function sameSet(left, right) {
  return left.size === right.size && [...left].every(value => right.has(value));
}

function duplicates(values) {
  const seen = new Set();
  const repeated = new Set();
  for (const value of values) {
    if (seen.has(value)) repeated.add(value);
    seen.add(value);
  }
  return [...repeated].sort();
}

function readRecord(rootDir) {
  const path = resolve(rootDir, RECORD_PATH);
  return JSON.parse(readFileSync(path, "utf8"));
}

export function inspectJpeg(bytes) {
  const result = {
    valid: false,
    errors: [],
    width: null,
    height: null,
    precision: null,
    components: null,
    sofMarker: null,
    sofOffset: null,
    iccProfileEmbedded: false
  };
  if (!Buffer.isBuffer(bytes) || bytes.length < 4) {
    result.errors.push("not a non-empty Buffer");
    return result;
  }
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) result.errors.push("missing JPEG SOI marker");
  if (bytes.at(-2) !== 0xff || bytes.at(-1) !== 0xd9) result.errors.push("missing terminal JPEG EOI marker");

  let offset = 2;
  while (offset < bytes.length - 1) {
    if (bytes[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    while (offset < bytes.length && bytes[offset] === 0xff) offset += 1;
    if (offset >= bytes.length) break;
    const marker = bytes[offset];
    offset += 1;
    if (marker === 0xd9 || marker === 0xda) break;
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
    if (offset + 2 > bytes.length) {
      result.errors.push(`truncated JPEG segment length at offset ${offset}`);
      break;
    }
    const length = bytes.readUInt16BE(offset);
    if (length < 2 || offset + length > bytes.length) {
      result.errors.push(`invalid JPEG segment length ${length} at offset ${offset}`);
      break;
    }
    const payload = offset + 2;
    const segmentEnd = offset + length;
    if (marker === 0xe2 && bytes.subarray(payload, Math.min(payload + 12, segmentEnd)).toString("ascii") === "ICC_PROFILE\u0000") {
      result.iccProfileEmbedded = true;
    }
    if (SOF_MARKERS.has(marker)) {
      if (length < 8) {
        result.errors.push(`short JPEG SOF segment at offset ${offset}`);
      } else if (result.sofMarker == null) {
        result.sofMarker = marker;
        result.sofOffset = payload;
        result.precision = bytes[payload];
        result.height = bytes.readUInt16BE(payload + 1);
        result.width = bytes.readUInt16BE(payload + 3);
        result.components = bytes[payload + 5];
      }
    }
    offset = segmentEnd;
  }
  if (result.sofMarker == null) result.errors.push("JPEG has no SOF dimensions");
  result.valid = result.errors.length === 0;
  return result;
}

export function validateRecordStructure(record) {
  const errors = [];
  if (!record || typeof record !== "object" || Array.isArray(record)) return ["record is not an object"];
  if (record.schemaVersion !== 1) errors.push(`schemaVersion=${record.schemaVersion}; expected 1`);
  if (record.taskId !== "ART-INTEGRATION-R2") errors.push(`taskId=${record.taskId}; expected ART-INTEGRATION-R2`);
  if (record.status !== "NO-PUBLISH / NOT CERTIFIED") errors.push(`status=${record.status}; expected NO-PUBLISH / NOT CERTIFIED`);
  if (record.base?.commit !== EXPECTED_BASE.commit) errors.push(`base commit ${record.base?.commit || "missing"} != ${EXPECTED_BASE.commit}`);
  if (record.base?.tree !== EXPECTED_BASE.tree) errors.push(`base tree ${record.base?.tree || "missing"} != ${EXPECTED_BASE.tree}`);
  if (record.mappingAuthority?.auditSha256 !== EXPECTED_MAPPING_SHA256) {
    errors.push(`mapping audit SHA-256 ${record.mappingAuthority?.auditSha256 || "missing"} != ${EXPECTED_MAPPING_SHA256}`);
  }
  for (const [approvedId, wiredId] of Object.entries(LETHAL_REMAPS)) {
    if (record.mappingAuthority?.lethalRemaps?.[approvedId] !== wiredId) {
      errors.push(`mapping authority lethal remap ${approvedId} != ${wiredId}`);
    }
  }
  if (record.plateManifestSha256 !== EXPECTED_PLATE_MANIFEST_SHA256) {
    errors.push(`declared plate manifest SHA-256 ${record.plateManifestSha256 || "missing"} != ${EXPECTED_PLATE_MANIFEST_SHA256}`);
  }

  if (!Array.isArray(record.archives) || record.archives.length !== 2) {
    errors.push(`archive record count ${record.archives?.length ?? "missing"}; expected 2`);
  }
  for (const wave of [2, 3]) {
    const archive = Array.isArray(record.archives) ? record.archives.find(item => item.wave === wave) : null;
    const expected = EXPECTED_ARCHIVES[wave];
    if (!archive) {
      errors.push(`Wave ${wave} archive record missing`);
      continue;
    }
    if (archive.sha256 !== expected.sha256) errors.push(`Wave ${wave} archive SHA-256 drift`);
    if (archive.outerHashValidation !== "PASS") errors.push(`Wave ${wave} outer hash validation is not PASS`);
    if (archive.internalChecksumValidation?.passed !== expected.passed ||
        archive.internalChecksumValidation?.total !== expected.total ||
        archive.internalChecksumValidation?.result !== "PASS") {
      errors.push(`Wave ${wave} internal checksum validation drift`);
    }
    if (archive.runtimePlateCount !== expected.plates) errors.push(`Wave ${wave} runtimePlateCount=${archive.runtimePlateCount}; expected ${expected.plates}`);
  }

  const expectedSummary = {
    wave2RuntimePlates: 34,
    wave3RuntimePlates: 21,
    totalRuntimePlates: 55,
    newPaths: 53,
    approvedByteReplacements: 2
  };
  for (const [key, value] of Object.entries(expectedSummary)) {
    if (record.summary?.[key] !== value) errors.push(`summary.${key}=${record.summary?.[key]}; expected ${value}`);
  }
  for (const key of ["archiveHashes", "internalChecksums", "exactApprovedBytes", "sceneMapping"]) {
    if (record.validation?.[key] !== "PASS") errors.push(`validation.${key} is not PASS`);
  }
  if (record.validation?.orphanedPlates !== 0) errors.push(`validation.orphanedPlates=${record.validation?.orphanedPlates}; expected 0`);

  if (!Array.isArray(record.plates)) return [...errors, "plates is not an array"];
  const manifestDigest = plateManifestSha256(record.plates);
  if (manifestDigest !== EXPECTED_PLATE_MANIFEST_SHA256) {
    errors.push(`computed plate manifest SHA-256 ${manifestDigest} != ${EXPECTED_PLATE_MANIFEST_SHA256}`);
  }
  if (record.plates.length !== 55) errors.push(`plate count ${record.plates.length}; expected 55`);
  const wave2 = record.plates.filter(plate => plate.wave === 2);
  const wave3 = record.plates.filter(plate => plate.wave === 3);
  if (wave2.length !== 34) errors.push(`Wave 2 plate count ${wave2.length}; expected 34`);
  if (wave3.length !== 21) errors.push(`Wave 3 plate count ${wave3.length}; expected 21`);

  const uniqueFields = [
    ["approved scene IDs", record.plates.map(plate => plate.approvedSceneId)],
    ["runtime filenames", record.plates.map(plate => plate.runtimeFilename)],
    ["runtime paths", record.plates.map(plate => plate.runtimePath)],
    ["runtime SHA-256 values", record.plates.map(plate => plate.sha256)]
  ];
  for (const [label, values] of uniqueFields) {
    const repeated = duplicates(values);
    if (repeated.length) errors.push(`duplicate ${label}: ${repeated.join(", ")}`);
  }

  for (const plate of record.plates) {
    const label = plate.approvedSceneId || plate.runtimeFilename || "unknown plate";
    if (plate.wave !== 2 && plate.wave !== 3) errors.push(`${label}: invalid wave ${plate.wave}`);
    if (!/^[a-z0-9_]+\.jpg$/.test(plate.runtimeFilename || "")) errors.push(`${label}: invalid runtime filename ${plate.runtimeFilename}`);
    if (plate.runtimePath !== `images/${plate.runtimeFilename}`) errors.push(`${label}: runtime path/filename mismatch`);
    if (!/^[0-9a-f]{64}$/.test(plate.sha256 || "")) errors.push(`${label}: invalid SHA-256`);
    if (!Number.isSafeInteger(plate.bytes) || plate.bytes <= 0) errors.push(`${label}: invalid byte count ${plate.bytes}`);
    if (!Array.isArray(plate.wiredSceneIds) || plate.wiredSceneIds.length !== 1) errors.push(`${label}: expected exactly one wired scene ID`);
    const expectedWired = LETHAL_REMAPS[label] || label;
    if (plate.wiredSceneIds?.[0] !== expectedWired) errors.push(`${label}: wired scene ${plate.wiredSceneIds?.[0]} != ${expectedWired}`);
    if (!Array.isArray(plate.binding) || !plate.binding.length || plate.binding.some(binding => !ALLOWED_BINDINGS.has(binding))) {
      errors.push(`${label}: invalid binding surface record`);
    }
    if (duplicates(plate.binding || []).length) errors.push(`${label}: duplicate binding surface`);
    if (plate.image?.width !== 784 || plate.image?.height !== 1168 || plate.image?.mode !== "RGB" ||
        plate.image?.colorSpaceInterpretation !== "sRGB" || plate.image?.iccProfileEmbedded !== false) {
      errors.push(`${label}: image profile record drift`);
    }
    const disposition = ["faction_split", "reckon_public"].includes(label) ? "approved-byte-replacement" : "new";
    if (plate.pathDisposition !== disposition) errors.push(`${label}: pathDisposition=${plate.pathDisposition}; expected ${disposition}`);
    const guard = GUARDED_PLATES[label] || [null, null];
    if (plate.guard !== guard[0] || plate.fallback !== guard[1]) errors.push(`${label}: guard/fallback record drift`);
    const expectedRoot = plate.wave === 2
      ? "Sunsplitter-all-art-replacements-for-Grok/07-unique-event-expansion/"
      : "Sunsplitter-Wave3-21-approved-event-art/01-approved-png-sources/";
    const expectedRuntimeRoot = plate.wave === 2
      ? expectedRoot
      : "Sunsplitter-Wave3-21-approved-event-art/02-runtime-jpg/";
    if (!String(plate.approvedSourceMember || "").startsWith(expectedRoot)) errors.push(`${label}: approved source member outside locked folder`);
    if (plate.approvedRuntimeMember !== `${expectedRuntimeRoot}${plate.runtimeFilename}`) errors.push(`${label}: approved runtime member mismatch`);
  }
  return errors;
}

function walkFiles(rootDir) {
  const files = [];
  const visit = directory => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      if (entry.name === ".git" || entry.name === "node_modules") continue;
      const path = resolve(directory, entry.name);
      if (entry.isDirectory()) visit(path);
      else if (entry.isFile()) files.push(path);
    }
  };
  visit(rootDir);
  return files;
}

function validateAssetFiles(rootDir, record) {
  const errors = [];
  const repoBasenames = new Map();
  for (const path of walkFiles(rootDir)) {
    const name = basename(path);
    repoBasenames.set(name, (repoBasenames.get(name) || 0) + 1);
  }
  for (const plate of record.plates || []) {
    const path = resolve(rootDir, plate.runtimePath || "");
    const label = plate.approvedSceneId || plate.runtimeFilename || "unknown plate";
    if (!existsSync(path)) {
      errors.push(`${label}: missing ${plate.runtimePath}`);
      continue;
    }
    const stat = statSync(path);
    if (!stat.isFile()) {
      errors.push(`${label}: runtime path is not a file`);
      continue;
    }
    if (stat.size !== plate.bytes) errors.push(`${label}: bytes ${stat.size} != record ${plate.bytes}`);
    const bytes = readFileSync(path);
    const digest = sha256(bytes);
    if (digest !== plate.sha256) errors.push(`${label}: SHA-256 ${digest} != approved ${plate.sha256}`);
    const jpeg = inspectJpeg(bytes);
    if (!jpeg.valid) errors.push(...jpeg.errors.map(error => `${label}: ${error}`));
    if (jpeg.width !== 784 || jpeg.height !== 1168) errors.push(`${label}: dimensions ${jpeg.width}x${jpeg.height}; expected 784x1168`);
    if (jpeg.precision !== 8) errors.push(`${label}: JPEG precision ${jpeg.precision}; expected 8`);
    if (jpeg.components !== 3) errors.push(`${label}: JPEG components ${jpeg.components}; expected RGB-compatible 3`);
    if (jpeg.iccProfileEmbedded) errors.push(`${label}: unexpected embedded ICC profile changed approved bytes/profile`);
    if (repoBasenames.get(plate.runtimeFilename) !== 1) {
      errors.push(`${label}: runtime filename occurs ${repoBasenames.get(plate.runtimeFilename) || 0} times in repository; expected exactly once`);
    }
  }
  return errors;
}

function runtimeConfiguration(runtime) {
  return JSON.parse(runtime.evaluate(`JSON.stringify((() => ({
    sceneIds: Object.keys(scenes),
    sceneImages: Object.fromEntries(Object.entries(sceneImages).filter(([, value]) => typeof value === "string")),
    sceneOverrides: Object.fromEntries(Object.entries(scenes).flatMap(([id, scene]) =>
      scene && typeof scene.image === "string" ? [[id, scene.image]] : []
    ))
  }))())`));
}

function fullRosterPrelude() {
  return `
    resetRunState();
    state.survivors = 9;
    state.recovered.tomas = true;
    state.recovered.jiro = true;
    state.recovered.vess = true;
  `;
}

function runResolverCases(runtime, cases) {
  const body = cases.map(test => `
    full();
    ${test.setup || ""}
    results.push({
      label: ${JSON.stringify(test.label)},
      expected: ${JSON.stringify(test.expected)},
      actual: resolveSceneImage(${JSON.stringify(test.id)}, scenes[${JSON.stringify(test.id)}] || null)
    });
  `).join("\n");
  return runtime.evaluate(`(() => {
    const results = [];
    const full = () => { ${fullRosterPrelude()} };
    ${body}
    return results;
  })()`);
}

function resolverFixtureCases(record) {
  const platePath = Object.fromEntries((record.plates || []).map(plate => [plate.approvedSceneId, plate.runtimePath]));
  const cases = [];
  const add = (label, id, expected, setup = "") => cases.push({ label, id, expected, setup });

  for (const plate of record.plates || []) {
    const wired = plate.wiredSceneIds?.[0];
    if (wired) add(`effective binding ${plate.approvedSceneId}`, wired, plate.runtimePath);
  }
  for (const [approved, wired] of Object.entries(LETHAL_REMAPS)) {
    add(`${approved} living pre-commitment binding`, wired, platePath[approved]);
    add(`${approved} death scene stays neutral`, approved, "images/corridor_variant.jpg");
  }

  add("faction_split full roster", "faction_split", platePath.faction_split);
  for (const key of EIGHT) add(`faction_split missing ${key}`, "faction_split", "images/corridor_variant.jpg", `kill(${JSON.stringify(key)}, "fixture");`);
  add("reckon_public full roster", "reckon_public", platePath.reckon_public);
  for (const key of EIGHT) add(`reckon_public missing ${key}`, "reckon_public", "images/observation.jpg", `kill(${JSON.stringify(key)}, "fixture");`);

  add("reckon_suppress full cast", "reckon_suppress", platePath.reckon_suppress);
  for (const key of ["elias", "tomas", "amara"]) add(`reckon_suppress missing ${key}`, "reckon_suppress", "images/observation_reckon.jpg", `kill(${JSON.stringify(key)}, "fixture");`);
  add("reckon_truth full cast", "reckon_truth", platePath.reckon_truth);
  for (const key of ["tomas", "jiro", "lena", "sela"]) add(`reckon_truth missing ${key}`, "reckon_truth", "images/observation.jpg", `kill(${JSON.stringify(key)}, "fixture");`);

  add("status full roster", "status", platePath.status);
  add("status survivor boundary 6", "status", platePath.status, "state.survivors = 6;");
  add("status depletion precedence", "status", "images/corridor.jpg", "state.survivors = 5; kill(\"elias\", \"fixture\");");
  for (const key of ["elias", "mira", "lena", "sela"]) add(`status missing ${key}`, "status", "images/observation.jpg", `kill(${JSON.stringify(key)}, "fixture");`);
  add("status ignores unrecovered Tomas", "status", platePath.status, "state.recovered.tomas = false;");
  add("status ignores unrecovered Jiro", "status", platePath.status, "state.recovered.jiro = false;");
  add("arc_fork roster neutral", "arc_fork", platePath.arc_fork, "state.recovered.tomas = false; state.recovered.jiro = false;");

  add("crew_walk survivor boundary 6", "crew_walk", platePath.crew_walk, "state.survivors = 6;");
  add("crew_walk depletion fallback", "crew_walk", "images/corridor.jpg", "state.survivors = 5;");
  add("prom_vent_keep count 7", "prom_vent_keep", platePath.prom_vent_keep, "state.survivors = 7;");
  add("prom_vent_keep count 6", "prom_vent_keep", "images/corridor_variant.jpg", "state.survivors = 6;");
  add("prom_vent_keep Amara unavailable", "prom_vent_keep", "images/corridor_variant.jpg", "kill(\"amara\", \"fixture\");");
  add("prom_vent_keep unavailable crew cannot inflate", "prom_vent_keep", "images/corridor_variant.jpg", "state.recovered.tomas = false; state.recovered.jiro = false; state.recovered.vess = false;");
  add("prom_price count 9", "prom_price", platePath.prom_price);
  add("prom_price count 8", "prom_price", "images/vault_reveal.jpg", "state.survivors = 8;");
  add("prom_price Sela unavailable", "prom_price", "images/vault_reveal.jpg", "kill(\"sela\", \"fixture\");");
  add("prom_price unrecovered Vess cannot inflate", "prom_price", "images/vault_reveal.jpg", "state.recovered.vess = false;");
  add("prom_price_keep count 6", "prom_price_keep", platePath.prom_price_keep, "state.survivors = 6;");
  add("prom_price_keep count 5", "prom_price_keep", "images/vault_reveal.jpg", "state.survivors = 5;");
  add("prom_price_keep Sela unavailable", "prom_price_keep", "images/vault_reveal.jpg", "kill(\"sela\", \"fixture\");");
  add("prom_price_keep unavailable crew cannot inflate", "prom_price_keep", "images/vault_reveal.jpg", "state.recovered.tomas = false; state.recovered.jiro = false; state.recovered.vess = false; kill(\"elias\", \"fixture\");");

  for (const id of ["lead_together", "act2_tether_truth", "observation_crew"]) {
    add(`${id} retains Tomas guard`, id, "images/observation.jpg", "state.recovered.tomas = false;");
    add(`${id} retains Jiro guard`, id, "images/observation.jpg", "state.recovered.jiro = false;");
  }
  return cases;
}

function validateRuntimeWiring(rootDir, record, runtime) {
  const errors = [];
  const config = runtimeConfiguration(runtime);
  const sceneIds = new Set(config.sceneIds);
  const platePaths = new Set((record.plates || []).map(plate => plate.runtimePath));

  for (const [surface, entries] of [["sceneImages", config.sceneImages], ["scene.image", config.sceneOverrides]]) {
    for (const [id, path] of Object.entries(entries)) {
      if (path.startsWith("images/") && !existsSync(resolve(rootDir, path))) errors.push(`${surface} ${id} references missing ${path}`);
    }
  }
  for (const sourceName of readdirSync(resolve(rootDir, "src")).filter(name => name.endsWith(".js"))) {
    const source = readFileSync(resolve(rootDir, "src", sourceName), "utf8");
    for (const match of source.matchAll(/["'](images\/[A-Za-z0-9_.-]+\.jpg)["']/g)) {
      if (!existsSync(resolve(rootDir, match[1]))) errors.push(`src/${sourceName} references missing ${match[1]}`);
    }
  }

  for (const plate of record.plates || []) {
    const intended = new Set(plate.wiredSceneIds || []);
    const actual = new Set();
    for (const [id, path] of Object.entries(config.sceneImages)) if (path === plate.runtimePath) actual.add(id);
    for (const [id, path] of Object.entries(config.sceneOverrides)) if (path === plate.runtimePath) actual.add(id);
    if (!sameSet(intended, actual)) {
      errors.push(`${plate.approvedSceneId}: configured scene set [${[...actual].sort()}] != intended [${[...intended].sort()}]`);
    }
    for (const id of intended) {
      if (!sceneIds.has(id)) errors.push(`${plate.approvedSceneId}: wired scene ${id} is not registered`);
      for (const binding of plate.binding || []) {
        const actualPath = binding === "sceneImages" ? config.sceneImages[id] : config.sceneOverrides[id];
        if (actualPath !== plate.runtimePath) errors.push(`${plate.approvedSceneId}: ${binding} ${id}=${actualPath || "missing"}; expected ${plate.runtimePath}`);
      }
    }
  }
  for (const path of platePaths) {
    const bound = Object.values(config.sceneImages).includes(path) || Object.values(config.sceneOverrides).includes(path);
    if (!bound) errors.push(`orphaned R2 plate: ${path}`);
  }

  const results = runResolverCases(runtime, resolverFixtureCases(record));
  for (const result of results) {
    if (result.actual !== result.expected) errors.push(`${result.label}: resolved ${result.actual || "null"}; expected ${result.expected}`);
    if (result.actual?.startsWith("images/") && !existsSync(resolve(rootDir, result.actual))) errors.push(`${result.label}: fallback/effective path missing ${result.actual}`);
  }
  return errors;
}

export function validateArtR2(rootDir = ROOT, options = {}) {
  const errors = [];
  const warnings = [];
  let record;
  try {
    record = readRecord(rootDir);
  } catch (error) {
    return { errors: [`could not read ${RECORD_PATH}: ${error.message}`], warnings, record: null, plateCount: 0 };
  }
  errors.push(...validateRecordStructure(record));
  errors.push(...validateAssetFiles(rootDir, record));

  let runtime = options.runtime;
  if (!runtime && options.loadRuntime !== false) {
    try {
      runtime = loadGame(rootDir);
    } catch (error) {
      errors.push(`could not load runtime for R2 wiring validation: ${error.message}`);
    }
  }
  if (runtime) errors.push(...validateRuntimeWiring(rootDir, record, runtime));
  else if (options.loadRuntime === false) warnings.push("runtime wiring validation skipped because the caller's runtime was unavailable");

  return {
    errors,
    warnings,
    record,
    plateCount: record.plates?.length || 0,
    wave2Count: record.plates?.filter(plate => plate.wave === 2).length || 0,
    wave3Count: record.plates?.filter(plate => plate.wave === 3).length || 0
  };
}

export function runArtR2SelfTest(rootDir = ROOT) {
  const failures = [];
  const check = (condition, message) => { if (!condition) failures.push(message); };
  let record;
  try {
    record = readRecord(rootDir);
  } catch (error) {
    return { passed: false, failures: [`record fixture unavailable: ${error.message}`] };
  }
  check(validateRecordStructure(record).length === 0, "valid record fixture failed");

  const hashDrift = JSON.parse(JSON.stringify(record));
  hashDrift.plates[0].sha256 = "0".repeat(64);
  check(validateRecordStructure(hashDrift).some(error => error.startsWith("computed plate manifest SHA-256")), "approved-byte hash drift was not rejected");

  const routeDrift = JSON.parse(JSON.stringify(record));
  routeDrift.plates[0].wiredSceneIds = ["wrong_scene"];
  check(validateRecordStructure(routeDrift).some(error => error.includes("wired scene")), "scene mapping drift was not rejected");

  const baseDrift = JSON.parse(JSON.stringify(record));
  baseDrift.base.commit = "f".repeat(40);
  check(validateRecordStructure(baseDrift).some(error => error.startsWith("base commit")), "base commit drift was not rejected");

  const sample = readFileSync(resolve(rootDir, record.plates[0].runtimePath));
  const jpeg = inspectJpeg(sample);
  check(jpeg.valid && jpeg.width === 784 && jpeg.height === 1168 && jpeg.precision === 8 && jpeg.components === 3, "valid JPEG fixture failed");
  const truncated = sample.subarray(0, sample.length - 2);
  check(inspectJpeg(truncated).errors.some(error => error.includes("EOI")), "truncated JPEG fixture was not rejected");
  const iccPayload = Buffer.from("ICC_PROFILE\u0000\u0001\u0001", "binary");
  const app2 = Buffer.alloc(4 + iccPayload.length);
  app2[0] = 0xff;
  app2[1] = 0xe2;
  app2.writeUInt16BE(iccPayload.length + 2, 2);
  iccPayload.copy(app2, 4);
  const withIcc = Buffer.concat([sample.subarray(0, 2), app2, sample.subarray(2)]);
  check(inspectJpeg(withIcc).iccProfileEmbedded, "embedded ICC fixture was not detected");

  return { passed: failures.length === 0, failures };
}

function printResult(result) {
  if (result.errors.length) {
    console.error(`ART-INTEGRATION-R2 VALIDATION FAIL — ${result.errors.length} failure(s)`);
    result.errors.forEach(error => console.error(`  - ${error}`));
  } else {
    console.log(`ART-INTEGRATION-R2 VALIDATION PASS — ${result.wave2Count}+${result.wave3Count}=${result.plateCount} exact approved plates; NO-PUBLISH / NOT CERTIFIED`);
  }
  result.warnings.forEach(warning => console.warn(`  warning: ${warning}`));
}

const invokedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : null;
if (invokedPath === import.meta.url) {
  try {
    const args = process.argv.slice(2);
    if (args.length === 1 && args[0] === "--self-test") {
      const result = runArtR2SelfTest(ROOT);
      console.log(`[validate-art-r2] SELF-TEST ${result.passed ? "PASS" : "FAIL"}${result.failures.length ? ` — ${result.failures.join("; ")}` : " — injected byte, route, base, JPEG, and ICC drift rejected"}`);
      if (!result.passed) process.exitCode = 1;
    } else if (args.length) {
      throw new Error(`Unknown argument(s): ${args.join(" ")}`);
    } else {
      const result = validateArtR2(ROOT);
      printResult(result);
      if (result.errors.length) process.exitCode = 1;
    }
  } catch (error) {
    console.error(`ART-INTEGRATION-R2 VALIDATION CRASH — ${error.stack || error.message}`);
    process.exitCode = 1;
  }
}
