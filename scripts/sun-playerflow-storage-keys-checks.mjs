// SUN-SAVE-SLOTS-CORE-01 (L-052; Manraj 2026-11-25, O-5) — the storage-key inventory.
// Every "sunsplitter_*" string literal in src/ must be on the recorded list below, and every key
// on the list must be used in src/, so no storage key arrives unrecorded. The save-slot keys are
// the ones L-052 covers; the backlog keys are L-062's; the ship memory key is L-054's; the rest are
// reader settings and title keys.
// The save-slot, backlog and settings keys are also written out in the comment block above the save
// constants in src/engine-save.js; this check also fails if that block drops one.
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "src");

const SAVE_SLOT_KEYS = [
  // slot 1: today's save, unchanged
  "sunsplitter_save_v3",
  "sunsplitter_save_v3_staging",
  "sunsplitter_save_v3_backup",
  "sunsplitter_save_v2",
  // slot 2
  "sunsplitter_save_v3_slot2",
  "sunsplitter_save_v3_slot2_staging",
  "sunsplitter_save_v3_slot2_backup",
  // slot 3
  "sunsplitter_save_v3_slot3",
  "sunsplitter_save_v3_slot3_staging",
  "sunsplitter_save_v3_slot3_backup",
  // the slot Continue resumes
  "sunsplitter_save_current_v1"
];
const SETTINGS_KEYS = [
  "sunsplitter_tone_ack_v1",
  "sunsplitter_show_costs_v1",
  "sunsplitter_cover_nudity_v1",
  "sunsplitter_text_pace_v1",
  "sunsplitter_text_size_v1", // SUN-READER-TYPE-01
  "sunsplitter_line_spacing_v1", // SUN-READER-TYPE-01
  "sunsplitter_tutorial_seen_v1",
  "sunsplitter_validate"
];
// SUN-MEMORY-STORE-01 (#578): the cross-run ship memory store, one key per browser.
const SHIP_MEMORY_KEYS = [
  "sunsplitter_ship_memory_v1"
];
// SUN-BACKLOG-RECORD-01 (L-062): the text backlog, one key per save slot, bound to that slot's save.
const BACKLOG_KEYS = [
  "sunsplitter_backlog_v1",
  "sunsplitter_backlog_v1_slot2",
  "sunsplitter_backlog_v1_slot3"
];
const RECORDED = new Set([...SAVE_SLOT_KEYS, ...SETTINGS_KEYS, ...SHIP_MEMORY_KEYS, ...BACKLOG_KEYS]);

function sourceFiles(dir) {
  return readdirSync(dir).sort().flatMap(name => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.(?:js|mjs|cjs|html|json)$/.test(name) ? [path] : [];
  });
}

// A quoted literal that starts with sunsplitter_, in double, single or back quotes. A template
// literal that builds a key (`sunsplitter_${...}`) is captured up to the ${ and fails the list.
const LITERAL = /(["'`])(sunsplitter_[^"'`$\s]*)(\$\{)?/g;

const found = new Map();
const problems = [];
for (const file of sourceFiles(SRC)) {
  const text = readFileSync(file, "utf8");
  for (const match of text.matchAll(LITERAL)) {
    const [, , key, interpolation] = match;
    const line = text.slice(0, match.index).split("\n").length;
    const where = `${relative(ROOT, file)}:${line}`;
    if (interpolation) problems.push(`${where} builds a storage key at runtime: ${key}\${...}`);
    if (!found.has(key)) found.set(key, []);
    found.get(key).push(where);
  }
}

const unrecorded = [...found.keys()].filter(key => !RECORDED.has(key)).sort();
const unused = [...RECORDED].filter(key => !found.has(key)).sort();
for (const key of unrecorded) problems.push(`unrecorded storage key ${key} at ${found.get(key).join(", ")}`);
for (const key of unused) problems.push(`recorded storage key ${key} is not used in src/ (remove it from the list, or restore it)`);

// The comment block above the save constants names every save-slot, backlog and settings key. The ship
// memory key is left out of it on purpose: sun-playerflow-ship-memory-isolation-checks allows its
// name only in src/ship-memory.js and src/state.js.
const engineSave = readFileSync(join(SRC, "engine-save.js"), "utf8");
const blockEnd = engineSave.indexOf("const SAVE_KEY =");
assert.ok(blockEnd > 0, "src/engine-save.js lost const SAVE_KEY");
const block = engineSave.slice(0, blockEnd);
for (const key of [...SAVE_SLOT_KEYS, ...BACKLOG_KEYS, ...SETTINGS_KEYS]) {
  if (!new RegExp(`\\b${key}\\b`).test(block)) problems.push(`the key-list comment above SAVE_KEY in src/engine-save.js does not name ${key}`);
}

assert.deepEqual(problems, [], problems.join("\n"));
console.log(`PASS sun-playerflow-storage-keys: ${found.size} storage keys in src/, all recorded (${SAVE_SLOT_KEYS.length} save-slot keys under L-052, ${BACKLOG_KEYS.length} backlog keys under L-062, ${SETTINGS_KEYS.length} settings and title keys, ${SHIP_MEMORY_KEYS.length} ship memory key under L-054)`);
