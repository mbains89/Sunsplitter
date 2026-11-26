// Sunsplitter — engine-save.js
// Save / resume: the save keys and schema limits, snapshot and apply, save export and import,
// autosave (persistSave), load and resume, the title screen's resume line, and the title's Saved runs
// dialog (rows and actions; SUN-SAVED-RUNS-01).
// Moved out of src/engine.js unchanged (SUN-CLEAN-ENGINE-SAVE-01, L-043). A plain script that
// index.html loads just before engine.js, so everything here exists before engine.js runs.
// Three run variables it uses are declared in engine.js: loadedGameVersion, pendingLegacyResume
// and preserveCompletedSlotUntilChoice.

// ---------- Storage keys (the full inventory) ----------
// Every localStorage key in src/. scripts/sun-playerflow-storage-keys-checks.mjs holds the same
// list and fails if a sunsplitter_ string literal in src/ is missing from it or extra to it.
//
// Save slots. L-052 covers exactly these keys (Manraj 2026-11-25, O-5; SUN-SAVE-SLOTS-CORE-01):
//   slot 1   sunsplitter_save_v3            live snapshot (today's save, unchanged)
//            sunsplitter_save_v3_staging    slot 1 write transaction
//            sunsplitter_save_v3_backup     slot 1 write transaction
//            sunsplitter_save_v2            legacy, read for slot 1 only, retired by a slot 1 new run or import
//   slot 2   sunsplitter_save_v3_slot2, sunsplitter_save_v3_slot2_staging, sunsplitter_save_v3_slot2_backup
//   slot 3   sunsplitter_save_v3_slot3, sunsplitter_save_v3_slot3_staging, sunsplitter_save_v3_slot3_backup
//   pointer  sunsplitter_save_current_v1    1, 2 or 3: the slot Continue resumes. Written by a new run,
//                                           a load and an import; never by autosave. Best effort.
// Every slot holds the same v3 snapshot. No slot number, name or pointer goes inside a snapshot or
// an export, so a file is a run, not a slot.
//
// Reader settings and title keys. Not saves: never in a snapshot or an export, never touched by a
// save, a new run, an import or clearSave.
//   sunsplitter_tone_ack_v1        content notice acknowledged (engine.js)
//   sunsplitter_show_costs_v1      Show costs on choices (engine.js)
//   sunsplitter_cover_nudity_v1    Cover nudity in pictures (engine.js)
//   sunsplitter_text_pace_v1       text pace (engine.js)
//   sunsplitter_text_size_v1       text size (engine.js)
//   sunsplitter_line_spacing_v1    line spacing (engine.js)
//   sunsplitter_tutorial_seen_v1   first-run tutorial seen (validate.js)
//   sunsplitter_validate           developer scene validation switch (validate.js)
//
// Ship memory (L-054). One key per browser, outside the save slots and never in a snapshot or an
// export. Its name is written only in src/ship-memory.js and src/state.js (the ship memory
// isolation check keeps it out of every other file); the storage-keys check records it too.
// clearSave never removes it; a new run and an import clear only its in-progress trail.
const SAVE_KEY = "sunsplitter_save_v3";
const SAVE_KEY_LEGACY = "sunsplitter_save_v2";
const SAVE_STAGING_KEY = "sunsplitter_save_v3_staging";
const SAVE_BACKUP_KEY = "sunsplitter_save_v3_backup";
const SAVE_SCHEMA_VERSION = 3;
const MIN_IMPORT_SCHEMA_VERSION = 2;
const MAX_IMPORT_BYTES = 1_048_576;

// SUN-SAVE-SLOTS-CORE-01 (L-052, design S-1): three slots. Slot 1 is today's save on today's keys,
// byte for byte, so an older build still sees it and nothing moves on upgrade. Slots 2 and 3 use
// their own keys and have no legacy fallback, so a write to one slot never touches another.
const SAVE_SLOT_COUNT = 3;
const SAVE_POINTER_KEY = "sunsplitter_save_current_v1";
const SAVE_SLOT_KEYS = Object.freeze({
  1: Object.freeze({ live: SAVE_KEY, staging: SAVE_STAGING_KEY, backup: SAVE_BACKUP_KEY, legacy: SAVE_KEY_LEGACY }),
  2: Object.freeze({
    live: "sunsplitter_save_v3_slot2",
    staging: "sunsplitter_save_v3_slot2_staging",
    backup: "sunsplitter_save_v3_slot2_backup",
    legacy: null
  }),
  3: Object.freeze({
    live: "sunsplitter_save_v3_slot3",
    staging: "sunsplitter_save_v3_slot3_staging",
    backup: "sunsplitter_save_v3_slot3_backup",
    legacy: null
  })
});
// The slot this tab plays and saves. Set by a new run (its target slot) and by a Continue or Load
// that succeeds (the slot loaded; a failed one leaves it as it was); an import does not change it.
// Never stored except through the pointer.
let activeSaveSlot = 1;

function isSaveSlot(n) {
  return Number.isInteger(n) && n >= 1 && n <= SAVE_SLOT_COUNT;
}
// 1-3 or "1"-"3" name that slot; any other value names no slot (null).
function parseSaveSlot(n) {
  const slot = typeof n === "string" && /^[0-9]$/.test(n) ? Number(n) : n;
  return isSaveSlot(slot) ? slot : null;
}
// An optional slot argument. Left out, or an event object from a handler: the active slot.
// Anything else must name a slot; a value that names none (4, "x", 0, null) gives null, and every
// save function then fails closed without touching any slot.
function saveSlotArg(slot) {
  const isEvent = slot !== null && typeof slot === "object" && typeof slot.type === "string";
  return parseSaveSlot(slot === undefined || isEvent ? activeSaveSlot : slot);
}
// The slot's keys, or null for a value that names no slot.
function saveSlotKeys(n) {
  const slot = parseSaveSlot(n);
  return slot ? SAVE_SLOT_KEYS[slot] : null;
}
// Every key one slot owns, in the import transaction's order (slot 1 includes legacy v2).
function saveSlotStorageKeys(slot) {
  const keys = saveSlotKeys(slot);
  return keys ? [keys.live, keys.legacy, keys.staging, keys.backup].filter(Boolean) : [];
}

function readCurrentSlotPointer() {
  let raw = null;
  try { raw = localStorage.getItem(SAVE_POINTER_KEY); } catch (e) { return null; }
  return raw === "1" || raw === "2" || raw === "3" ? Number(raw) : null;
}
// Best effort: a failed pointer write never fails a save; continueSlot() then picks by savedAt.
function writeCurrentSlotPointer(n) {
  if (!isSaveSlot(n)) return false;
  try {
    const value = String(n);
    if (localStorage.getItem(SAVE_POINTER_KEY) !== value) localStorage.setItem(SAVE_POINTER_KEY, value);
    return localStorage.getItem(SAVE_POINTER_KEY) === value;
  } catch (e) {
    return false;
  }
}

function savedAtOfSlot(slot) {
  try {
    const data = JSON.parse(readRawSave(slot));
    return data && typeof data.savedAt === "number" && Number.isFinite(data.savedAt) ? data.savedAt : 0;
  } catch (e) {
    return 0;
  }
}

// The slot Continue resumes: the pointer's slot if it is readable; else the readable slot saved
// most recently (ties go to the lowest number); else null, and there is no Continue. With no
// pointer and only slot 1 readable this is slot 1, so "slot 1 is the current save" holds on
// upgrade without writing anything.
function continueSlot() {
  const pointer = readCurrentSlotPointer();
  if (pointer && hasSave(pointer)) return pointer;
  let best = null;
  let bestSavedAt = -Infinity;
  for (let slot = 1; slot <= SAVE_SLOT_COUNT; slot += 1) {
    if (!hasSave(slot)) continue;
    const savedAt = savedAtOfSlot(slot);
    if (savedAt > bestSavedAt) {
      best = slot;
      bestSavedAt = savedAt;
    }
  }
  return best;
}

// ---------- Save / Resume (v0.19) ----------
// One run per slot (L-052). Survives refresh, background, tab close on iOS Safari via localStorage.
// Schema versioned. Never wipe an existing save on failed write/parse.

function snapshotState() {
  // Explicit allowlist — full run state 0.17.1+ relies on
  const snap = {
    v: SAVE_SCHEMA_VERSION,
    gameVersion: loadedGameVersion,
    savedAt: Date.now(),
    sceneEntered: true,
    survivors: state.survivors,
    integrity: state.integrity,
    cohesion: state.cohesion,
    supplies: state.supplies,
    embryos: state.embryos,
    flags: Object.assign({}, state.flags),
    dead: (state.dead || []).slice(),
    deathCause: Object.assign({}, state.deathCause || {}),
    scene: state.scene,
    affinity: Object.assign({}, state.affinity),
    trust: Object.assign({}, state.trust),
    romance: Object.assign({}, state.romance || {}),
    pursuit: Object.assign({}, state.pursuit || {}),
    favors: Object.assign({}, state.favors || {}),
    past_known_by: Object.assign({}, state.past_known_by || {}),
    dying: (state.dying && typeof state.dying === "object") ? Object.assign({}, state.dying) : {},
    past_known: !!state.past_known,
    marks: Object.assign({}, state.marks || {}),
    memories: (state.memories || []).slice(),
    ideology: Object.assign({ future: 0, living: 0 }, state.ideology || {}),
    // 0.22.0 groundwork
    recovered: Object.assign({ tomas: false, jiro: false, vess: false }, state.recovered || {}),
    promises: Object.assign({}, state.promises || {}),
    crisisPath: state.crisisPath != null ? state.crisisPath : null
  };
  if (typeof state.commanderCallsign === "string" && state.commanderCallsign) snap.commanderCallsign = state.commanderCallsign;
  if (typeof state.commanderSeal === "string" && state.commanderSeal) snap.commanderSeal = state.commanderSeal;
  if (typeof state.commanderOath === "string" && state.commanderOath) snap.commanderOath = state.commanderOath;
  return snap;
}

// SUN-DIET-REPLY-FOLD-01 (L-057): one-line answer screens folded into the previous choice's reply
// and retired from the registry. Autosave lands on every screen, so a save can be parked on one;
// it resumes at that screen's only exit, entered fresh, exactly as if its Continue had been
// pressed. None of them wrote anything on entry that a save parked there does not already hold.
const RETIRED_SCENE_EXITS = {
  hold_bolts_again: "act3_spine_next",
  hold_bolts_silent: "act3_spine_next",
  breath_word_given: "breath_hub",
  breath_word_refused: "breath_hub",
  arc_living_sela_answer: "arc_living_3",
  filters_stencil_luck: "offshift_sela",
  filters_stencil_silent: "offshift_sela",
  act3_lethal_tomas_stores: "act3_lethal_elias_order",
  act3_lethal_tomas_structure: "act3_lethal_elias_order",
  act3_lethal_elias_brace: "act3_lethal_mira_board",
  act3_lethal_mira_collar: () => state.romance && state.romance.mira ? "mira_root_cause" : "faction_split",
  // SUN-DIET-MEMORY-FOLD-01 (D11 Deep step 1, C04): the memory pass-through's text now opens
  // final_choice on first arrival; a save parked on it has no patch flag yet, so the resumed
  // final_choice prints the same debts the parked screen showed, then the final orders.
  ship_memory_payoff: "final_choice",
  // SUN-DIET-VESS-MERGE-01: the cost screen is merged into the signal screen, which now carries its
  // docking choices and its entry writes (idempotent: flags re-set, memories deduped by remember()).
  // A save parked on vess_cost resumes on the merged screen with the same two choices it had.
  vess_cost: "vess_signal"
};
function retiredSceneExit(id) {
  if (!Object.prototype.hasOwnProperty.call(RETIRED_SCENE_EXITS, id)) return null;
  const exit = RETIRED_SCENE_EXITS[id];
  return typeof exit === "function" ? exit() : exit;
}

// SUN-SAVE-VERSION-GUARD-01: a snapshot whose format version (v) is newer than SAVE_SCHEMA_VERSION
// was written by a newer build and may carry fields this build misreads. This build cannot read it:
// it is never loaded and never stood in for by older bytes, so it is kept as it is, shown as
// unreadable and offered for download, like any unreadable slot. A missing or older v reads as before.
function snapshotFormatIsNewer(data) {
  return data !== null && typeof data === "object" && typeof data.v === "number" && data.v > SAVE_SCHEMA_VERSION;
}
function rawSnapshotFormatIsNewer(raw) {
  if (typeof raw !== "string") return false;
  try {
    return snapshotFormatIsNewer(JSON.parse(raw));
  } catch (e) {
    return false;
  }
}

function validSnapshotShape(data) {
  const isRecord = value => value !== null && typeof value === "object" && !Array.isArray(value);
  if (!isRecord(data)) return false;
  if (snapshotFormatIsNewer(data)) return false;

  const sceneId = typeof data.scene === "string" && data.scene ? data.scene : "";
  if (!sceneId || !(Object.prototype.hasOwnProperty.call(scenes, sceneId) ||
      Object.prototype.hasOwnProperty.call(RETIRED_SCENE_EXITS, sceneId))) return false;

  for (const key of ["survivors", "integrity", "cohesion", "supplies", "embryos"]) {
    const value = data[key];
    const cap = STAT_CAPS[key];
    if (typeof value !== "number" || !Number.isFinite(value) || value < cap.min || value > cap.max) return false;
  }

  for (const key of ["flags", "deathCause", "affinity", "trust", "romance", "pursuit", "favors", "past_known_by", "marks", "ideology", "recovered", "promises"]) {
    if (data[key] != null && !isRecord(data[key])) return false;
  }
  for (const key of ["dead", "memories"]) {
    if (data[key] != null && !Array.isArray(data[key])) return false;
  }
  if (data.dying != null && typeof data.dying !== "string" && !isRecord(data.dying)) return false;
  if (data.past_known != null && typeof data.past_known !== "boolean") return false;
  if (data.crisisPath != null && typeof data.crisisPath !== "string") return false;
  for (const key of ["commanderCallsign", "commanderSeal", "commanderOath"]) {
    if (data[key] != null && (typeof data[key] !== "string" || data[key].length > 128)) return false;
  }
  if (data.gameVersion != null && typeof data.gameVersion !== "string") return false;
  if (data.savedAt != null && (typeof data.savedAt !== "number" || !Number.isFinite(data.savedAt))) return false;
  if (data.sceneEntered != null && typeof data.sceneEntered !== "boolean") return false;
  return true;
}

function applySnapshot(data) {
  if (!validSnapshotShape(data)) return false;
  const sceneId = data.scene;
  if (typeof data.gameVersion === "string") loadedGameVersion = data.gameVersion;
  else loadedGameVersion = (typeof VERSION !== "undefined" ? VERSION : "0.25");
  // Resources
  state.survivors = typeof data.survivors === "number" ? data.survivors : state.survivors;
  state.integrity = typeof data.integrity === "number" ? data.integrity : state.integrity;
  state.cohesion = typeof data.cohesion === "number" ? data.cohesion : state.cohesion;
  state.supplies = typeof data.supplies === "number" ? data.supplies : state.supplies;
  state.embryos = typeof data.embryos === "number" ? data.embryos : state.embryos;
  // Causality-critical
  state.flags = Object.assign({}, data.flags || {});
  // L-027: retire the unused Vess course consequence from legacy saves.
  delete state.flags.vess_course_lost;
  state.dead = Array.isArray(data.dead) ? data.dead.slice() : [];
  state.deathCause = Object.assign({}, data.deathCause || {});
  state.scene = sceneId;
  state.affinity = Object.assign({ lena: 0, elias: 0, mira: 0, tomas: 0, amara: 0, jiro: 0, sela: 0, vess: 0 }, data.affinity || {});
  state.trust = Object.assign({ lena: 40, elias: 35, mira: 45, tomas: 50, amara: 40, jiro: 40, sela: 30, vess: 35 }, data.trust || {});
  state.romance = Object.assign({}, data.romance || {});
  state.pursuit = Object.assign({}, data.pursuit || {});
  state.favors = Object.assign({}, data.favors || {});
  state.past_known_by = Object.assign({}, data.past_known_by || {});
  // 0.25: dying is a map { name: cause }. Normalize legacy scalar "lena".
  if (data.dying != null && typeof data.dying === "object" && !Array.isArray(data.dying)) {
    state.dying = Object.assign({}, data.dying);
  } else if (typeof data.dying === "string" && data.dying) {
    state.dying = { [data.dying]: data.dying === "lena" ? "kept working until the clock ran out" : data.dying };
  } else {
    state.dying = {};
  }
  state.past_known = !!data.past_known;
  state.marks = Object.assign({}, data.marks || {});
  state.memories = Array.isArray(data.memories) ? data.memories.slice() : [];
  state.ideology = Object.assign({ future: 0, living: 0 }, data.ideology || {});
  // 0.22.0 groundwork (default missing for older saves)
  state.recovered = Object.assign({ tomas: false, jiro: false, vess: false }, data.recovered || {});
  state.promises = Object.assign({}, data.promises || {});
  state.crisisPath = data.crisisPath != null ? data.crisisPath : null;
  if (typeof data.commanderCallsign === "string" && data.commanderCallsign) state.commanderCallsign = data.commanderCallsign;
  if (typeof data.commanderSeal === "string" && data.commanderSeal) state.commanderSeal = data.commanderSeal;
  if (typeof data.commanderOath === "string" && data.commanderOath) state.commanderOath = data.commanderOath;
  // SUN-DIET-REPLY-FOLD-01: a retired answer screen resumes at its exit (loadGame enters it fresh).
  const retiredExit = retiredSceneExit(sceneId);
  if (retiredExit) state.scene = retiredExit;
  return true;
}

function validRawSnapshot(raw) {
  if (!raw) return false;
  try {
    return validSnapshotShape(JSON.parse(raw));
  } catch (e) {
    return false;
  }
}

function safeImportTree(value, depth, budget) {
  if (depth > 8 || budget.count > 2_000) return false;
  if (value === null || typeof value === "boolean") return true;
  if (typeof value === "number") return Number.isFinite(value);
  if (typeof value === "string") return value.length <= 4_096;
  if (Array.isArray(value)) {
    if (value.length > 512) return false;
    budget.count += value.length;
    return value.every(item => safeImportTree(item, depth + 1, budget));
  }
  if (typeof value !== "object") return false;
  const keys = Object.keys(value);
  if (keys.length > 512) return false;
  budget.count += keys.length;
  for (const key of keys) {
    if (key === "__proto__" || key === "prototype" || key === "constructor" || key.length > 128) return false;
    if (!safeImportTree(value[key], depth + 1, budget)) return false;
  }
  return true;
}

function validImportedSnapshot(data) {
  if (!safeImportTree(data, 0, { count: 0 }) || !validSnapshotShape(data)) return false;
  const schema = data.v == null ? MIN_IMPORT_SCHEMA_VERSION : data.v;
  if (!Number.isInteger(schema) || schema < MIN_IMPORT_SCHEMA_VERSION || schema > SAVE_SCHEMA_VERSION) return false;
  const allowedTopLevel = new Set([
    "v", "gameVersion", "savedAt", "sceneEntered", "survivors", "integrity", "cohesion", "supplies", "embryos",
    "flags", "dead", "deathCause", "scene", "affinity", "trust", "romance", "pursuit", "favors",
    "past_known_by", "dying", "past_known", "marks", "memories", "ideology", "recovered", "promises", "crisisPath", "commanderCallsign", "commanderSeal", "commanderOath"
  ]);
  if (Object.keys(data).some(key => !allowedTopLevel.has(key))) return false;
  if (data.gameVersion != null && (!data.gameVersion.trim() || data.gameVersion.length > 32)) return false;
  const isRecord = value => value !== null && typeof value === "object" && !Array.isArray(value);
  const isCrewKey = key => Object.prototype.hasOwnProperty.call(crew, key);
  const validMap = (map, validKey, validValue) => map == null ||
    Object.entries(map).every(([key, value]) => validKey(key) && validValue(value, key));
  const isBoolean = value => typeof value === "boolean";
  const isCause = value => typeof value === "string" && value.length > 0;
  const isBoundedScore = value => typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 100;
  const booleanFlags = new Set([
    "amara_rear_done", "amara_vent_delayed", "burn_unverified", "busDowngraded", "clock_known", "course_briefed",
    "course_option_lost", "custody_roll", "last_tx_spent", "lena_authority", "lena_last_hour", "lena_notes", "lena_rear_done",
    "lena_regen", "lena_shower_done", "manifest_exposed", "manifest_lie", "margin_committed", "margin_spent_extra",
    "mira_fault_known", "mira_favor", "mira_memory_public", "mira_rear_done", "mira_shower_done", "pair_favor",
    "pair_grudge", "pair_shield", "position_certain", "prom_amara", "prom_amara_alluded", "prom_deck4_buried",
    "prom_deck4_edited", "prom_elias", "prom_elias_alluded", "prom_lena", "prom_lena_alluded", "prom_line_held",
    "prom_mira", "prom_mira_alluded", "prom_sela", "prom_sela_alluded", "prom_tomas", "prom_tomas_alluded",
    "quiet_tomas_done", "reaction_mass_spent", "sela_rear_done", "ship_interrupt_fired", "tether_hand_elias",
    "tether_hand_mira", "tether_hand_sela", "tether_rushed", "tomas_scapegoated", "trays_dead", "vault_face",
    "vault_face_read", "vess_intimate", "warmth_laughter", "warmth_meal", "warmth_music", "water_vented"
  ]);
  const flagDomains = Object.fromEntries(Object.entries({
    abandoned: ["opened", "sealed", "scanned"], breath_answer: ["racks", "trunks", "garden", "blacksleep"],
    mira_root_cause: ["drive", "you", "both"], vess_item_two: ["floor", "chair"], amara_page: ["open", "closed", "hers"], sela_amber: ["meaning", "sentence", "silence"],
    // SUN-CREW-FRICTION-01: one flag per pair scene, written by the Commander's answer.
    pair_triage: ["chart", "count", "open"], pair_seal: ["bulkhead", "names", "both"], pair_burn: ["finding", "width", "both"], pair_fix: ["fix", "track", "both"],
    breath_word: ["given", "refused"], cascade_truth: ["open", "sealed", "senior"], changeorders: ["logged", "buried"],
    coolant: ["loop", "medical", "split"], crisis: ["vent", "cut", "self"],
    custody_answer: ["severed", "possession", "thawed", "shared"],
    departure_truth: ["plural", "records", "living_only"], elias_power: ["high", "limited", "low"],
    embryo_ceiling: ["lowered"], feedstock: ["seal", "food", "thin"],
    final: ["endure", "hold", "comfort", "transmission"], hydro: ["full", "minimal", "rebuild"],
    interrupt_return: ["bond_mira", "bond_amara", "bond_sela", "bond_lena", null],
    junctionChoice: ["none", "lena", "elias", "mira", "tomas", "amara", "jiro", "sela", "vess"],
    leadership: ["together", "hard", "watch"], leadership_style: ["hard", "balanced", "soft"],
    manifest: ["read", "declined"], mid_arc: ["living", "future"],
    past: ["owned", "denied", "deal", "lena_only", "threatened", "deflected"], patch: ["failed", "aborted"],
    planet: ["committed", "deferred"], power: ["cut", "burn", "risk"], priority: ["repairs", "ration", "planet"],
    prom_line_other: ["mira", "jiro", "vess"], pursuit_amara_cost: ["vent_delay", "half"],
    pursuit_lena_cost: ["regen", "honest_regen"], pursuit_mira_cost: ["disclosed", "partial"],
    pursuit_sela_cost: ["vow", "private_vow"], reckon: ["public", "suppress", "memory", "truth"],
    rourke: ["stopped", "stayed", "tried", "ignored"], sela_attention: ["ignored", "present"],
    sela_vault_vow: ["accepted", "refused"], ship_interrupt: ["answered", "deferred", "remote"],
    ship_memory: ["open_wound", "jury_rig", "proper_seal"], signal: ["chase", "ignore", "study"],
    stores: ["seize", "ignore", "vote"], sun_doctrine: ["scrubbed", "doctrine", "silent"],
    tomas: ["future", "living", "hold"], vault_priority: ["future", "living", "both"],
    vault_sacrifice: ["future", "living", "split"], vault_voice: ["off", "on", "restricted"]
  }).map(([key, values]) => [key, new Set(values)]));
  const isFlagValue = (value, key) => {
    if (booleanFlags.has(key)) return typeof value === "boolean";
    if (key === "pregnancy_risk") return typeof value === "boolean" || value === "unknown";
    if (flagDomains[key]) return flagDomains[key].has(value);
    return value === null || typeof value === "boolean" || typeof value === "string" ||
      (typeof value === "number" && Number.isFinite(value));
  };
  const isMarkValue = value => typeof value === "string" ||
    (isRecord(value) && Object.values(value).every(isBoolean));
  const promiseStates = new Set(["made", "declined", "kept", "broken"]);

  const dead = data.dead || [];
  if (dead.some(key => typeof key !== "string" || !isCrewKey(key)) || new Set(dead).size !== dead.length) return false;
  if ((data.memories || []).length > 12 || (data.memories || []).some(memory => typeof memory !== "string")) return false;
  if (!validMap(data.flags, () => true, isFlagValue)) return false;
  if (!validMap(data.deathCause, isCrewKey, isCause)) return false;
  if (!validMap(data.affinity, isCrewKey, isBoundedScore) || !validMap(data.trust, isCrewKey, isBoundedScore)) return false;
  if (!validMap(data.romance, key => isCrewKey(key) || key === "amara_tomas", isBoolean)) return false;
  for (const map of [data.pursuit, data.favors, data.past_known_by, data.recovered]) {
    if (!validMap(map, isCrewKey, isBoolean)) return false;
  }
  if (typeof data.dying === "string") {
    if (!isCrewKey(data.dying)) return false;
  } else if (!validMap(data.dying, isCrewKey, isCause)) return false;
  if (!validMap(data.marks, () => true, isMarkValue)) return false;
  if (!validMap(data.promises, isCrewKey, value => promiseStates.has(value))) return false;
  if (!validMap(data.ideology, key => key === "future" || key === "living",
    value => typeof value === "number" && Number.isFinite(value))) return false;
  return true;
}

function inspectSaveImportText(text) {
  if (typeof text !== "string" || !text.trim()) return { ok: false, error: "empty file" };
  const normalizedText = text.charCodeAt(0) === 0xFEFF ? text.slice(1) : text;
  const byteLength = typeof TextEncoder === "function"
    ? new TextEncoder().encode(normalizedText).length
    : normalizedText.length;
  if (byteLength > MAX_IMPORT_BYTES) return { ok: false, error: "file is too large" };
  let parsed;
  try {
    parsed = JSON.parse(normalizedText);
  } catch (e) {
    return { ok: false, error: "file is not valid JSON" };
  }
  const schema = parsed && parsed.v == null ? MIN_IMPORT_SCHEMA_VERSION : parsed && parsed.v;
  if (!Number.isInteger(schema) || schema < MIN_IMPORT_SCHEMA_VERSION) {
    return { ok: false, error: "unsupported save format" };
  }
  if (schema > SAVE_SCHEMA_VERSION) return { ok: false, error: "save format is newer than this game" };
  if (!validImportedSnapshot(parsed)) return { ok: false, error: "save data is unsupported or unsafe" };
  const legacyFile = parsed.v == null || parsed.v === 2;
  // Some later v2 saves already carry the one-time scene-entry marker.
  if (legacyFile && parsed.sceneEntered !== true) delete parsed.sceneEntered;
  return { ok: true, raw: JSON.stringify(parsed), snapshot: parsed, legacyFile };
}

function buildSaveExport(slot) {
  slot = saveSlotArg(slot);
  if (!slot) return null;
  const raw = readRawSave(slot);
  if (!validRawSnapshot(raw)) return null;
  const save = JSON.parse(raw);
  const exportedAt = Date.now();
  const version = String(save.gameVersion || "legacy").replace(/[^0-9A-Za-z.-]+/g, "-").slice(0, 32) || "legacy";
  const stamp = new Date(exportedAt).toISOString().slice(0, 10);
  return {
    filename: `sunsplitter-save-v${version}-${stamp}.json`,
    text: raw
  };
}

// The Saved runs dialog's Export save button (SUN-SAVED-RUNS-01). It exports the slot of the row the
// player selected, read once here and passed on explicitly; it never falls back to activeSaveSlot.
function exportSaveFile() {
  const prepared = buildSaveExport(savedRunsActionSlot());
  if (!prepared) {
    flashSaveStatus("No valid save to export", true, true);
    return false;
  }
  return downloadPreparedSave(prepared, "Export prepared");
}

// SUN-UNREADABLE-EXPORT-01 (Manraj 2026-11-05, ruling 2): a slot this build cannot read can be
// downloaded byte-for-byte before a new run replaces it. It is never loaded, validated or
// re-exported as a playable save; Export save above stays fail-closed (0.32) for these bytes.
function buildUnreadableSaveExport(slot) {
  slot = saveSlotArg(slot);
  if (!slot) return null;
  const raw = unreadableSaveRaw(slot);
  if (!raw) return null;
  const stamp = new Date(Date.now()).toISOString().slice(0, 10);
  return { filename: `sunsplitter-unreadable-save-${stamp}.json`, text: raw };
}

function exportUnreadableSaveFile() {
  const prepared = buildUnreadableSaveExport(savedRunsActionSlot());
  if (!prepared) {
    flashSaveStatus("No unreadable save to download", true, true);
    return false;
  }
  return downloadPreparedSave(prepared, "Unreadable save downloaded");
}

function downloadPreparedSave(prepared, doneMessage) {
  let url = null;
  let link = null;
  try {
    const blob = new Blob([prepared.text], { type: "application/json" });
    url = URL.createObjectURL(blob);
    link = document.createElement("a");
    link.href = url;
    link.download = prepared.filename;
    link.hidden = true;
    document.body.appendChild(link);
    link.click();
    flashSaveStatus(doneMessage);
    return true;
  } catch (e) {
    flashSaveStatus("Export failed", true, true);
    return false;
  } finally {
    if (link && link.parentNode) link.parentNode.removeChild(link);
    // Give mobile Safari time to consume the blob after the synthetic click.
    if (url) setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }
}

function restoreStorageValue(key, value) {
  if (value === null) localStorage.removeItem(key);
  else localStorage.setItem(key, value);
  return localStorage.getItem(key) === value;
}

function commitImportedSave(raw, slot) {
  slot = saveSlotArg(slot);
  if (!slot) {
    flashSaveStatus("Import failed · original slot kept", true, true);
    return false;
  }
  const slotKeys = saveSlotKeys(slot);
  const keys = saveSlotStorageKeys(slot);
  let originals;
  try {
    originals = Object.fromEntries(keys.map(key => [key, localStorage.getItem(key)]));
  } catch (e) {
    flashSaveStatus("Import failed · storage unavailable", true, true);
    return false;
  }
  const hadOriginal = keys.some(key => originals[key] !== null);
  let priorRaw = null;
  try {
    priorRaw = readRawSave(slot);
    localStorage.setItem(slotKeys.staging, raw);
    if (localStorage.getItem(slotKeys.staging) !== raw || !validRawSnapshot(raw)) throw new Error("staging verification failed");
    if (validRawSnapshot(priorRaw)) {
      localStorage.setItem(slotKeys.backup, priorRaw);
      if (localStorage.getItem(slotKeys.backup) !== priorRaw) throw new Error("backup verification failed");
    } else {
      localStorage.removeItem(slotKeys.backup);
    }
    localStorage.setItem(slotKeys.live, raw);
    if (localStorage.getItem(slotKeys.live) !== raw || !validRawSnapshot(localStorage.getItem(slotKeys.live))) {
      throw new Error("import verification failed");
    }
    if (slotKeys.legacy) {
      localStorage.removeItem(slotKeys.legacy);
      if (localStorage.getItem(slotKeys.legacy) !== null) throw new Error("legacy retirement failed");
    }
    localStorage.removeItem(slotKeys.backup);
    localStorage.removeItem(slotKeys.staging);
    if (localStorage.getItem(slotKeys.backup) !== null || localStorage.getItem(slotKeys.staging) !== null) {
      throw new Error("transaction cleanup failed");
    }
  } catch (e) {
    let liveRestored = false;
    try { liveRestored = restoreStorageValue(slotKeys.live, originals[slotKeys.live]); } catch (restoreError) { /* recover below */ }
    if (slotKeys.legacy) {
      try { restoreStorageValue(slotKeys.legacy, originals[slotKeys.legacy]); } catch (restoreError) { /* recover below */ }
    }
    if (liveRestored) {
      try { restoreStorageValue(slotKeys.staging, originals[slotKeys.staging]); } catch (restoreError) { /* checked below */ }
      try { restoreStorageValue(slotKeys.backup, originals[slotKeys.backup]); } catch (restoreError) { /* checked below */ }
    } else {
      // Keep a durable interrupted-transaction marker. readRawSave() treats
      // the matching live candidate as uncommitted and selects this backup.
      try { restoreStorageValue(slotKeys.staging, raw); } catch (restoreError) { /* checked below */ }
      if (validRawSnapshot(priorRaw)) {
        try { restoreStorageValue(slotKeys.backup, priorRaw); } catch (restoreError) { /* checked below */ }
      } else {
        try { restoreStorageValue(slotKeys.backup, originals[slotKeys.backup]); } catch (restoreError) { /* checked below */ }
      }
    }
    let priorRecoverable = false;
    try {
      const effective = readRawSave(slot);
      priorRecoverable = priorRaw === null ? effective === null : effective === priorRaw;
    } catch (readError) { /* fail closed below */ }
    const message = priorRecoverable
      ? "Import failed · original slot kept"
      : (hadOriginal ? "Import failed · storage recovery required" : "Import failed · no replacement written");
    updateMetaSaveHint();
    // Repaint first, so the title's unreadable-slot line cannot replace the failure (SUN-SAVED-RUNS-01).
    refreshTitleResumeUI();
    flashSaveStatus(message, true, true);
    return false;
  }
  if (!pendingLegacyResume || pendingLegacyResume.slot === slot) pendingLegacyResume = null;
  if (slot === activeSaveSlot) preserveCompletedSlotUntilChoice = false;
  writeCurrentSlotPointer(slot);
  // SUN-MEMORY-STORE-01 (L-054): the imported run has faced no hard calls in this slot yet.
  if (typeof shipMemoryClearTrail === "function") shipMemoryClearTrail(slot);
  updateMetaSaveHint();
  refreshTitleResumeUI();
  flashSaveStatus("Imported · Continue to load");
  return true;
}

function importSaveText(text, slot) {
  slot = saveSlotArg(slot);
  if (!slot) {
    flashSaveStatus("Import failed · original slot kept", true, true);
    return false;
  }
  const inspected = inspectSaveImportText(text);
  if (!inspected.ok) {
    flashSaveStatus(`Import rejected · ${inspected.error}`, true, true);
    return false;
  }
  let hasStoredBytes = false;
  try {
    hasStoredBytes = saveSlotStorageKeys(slot)
      .some(key => localStorage.getItem(key) !== null);
  } catch (e) {
    flashSaveStatus("Import failed · storage unavailable", true, true);
    return false;
  }
  // SUN-SAVED-RUNS-01: the prompt names the slot the file goes into.
  const prompt = hasStoredBytes
    ? `Import this save into Slot ${slot}? This will replace the saved run in that slot.`
    : `Import this save into Slot ${slot}?`;
  if (!window.confirm(prompt)) {
    flashSaveStatus("Import cancelled");
    return false;
  }
  return commitImportedSave(inspected.raw, slot);
}

// The Saved runs dialog's Import save button. The selected row's slot is read here, before the file
// picker opens, and kept on the input until the file arrives, so the file goes into that slot.
function requestSaveImport() {
  const input = document.getElementById("save-import-file");
  if (!input) return false;
  if (typeof input.setAttribute === "function") input.setAttribute("data-slot", String(savedRunsActionSlot()));
  input.value = "";
  input.click();
  return true;
}

function readSaveImportFile(file) {
  if (file && typeof file.text === "function") return file.text();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error || new Error("read failed"));
    reader.readAsText(file);
  });
}

async function handleSaveImportSelection(input) {
  const file = input && input.files ? input.files[0] : null;
  if (!file) return false;
  // The slot requestSaveImport recorded; with none recorded, the selected row. A recorded value
  // that names no slot fails closed in importSaveText.
  const recorded = typeof input.getAttribute === "function" ? input.getAttribute("data-slot") : null;
  const slot = recorded === null ? savedRunsActionSlot() : parseSaveSlot(recorded);
  try {
    if (typeof file.size === "number" && file.size > MAX_IMPORT_BYTES) {
      flashSaveStatus("Import rejected · file is too large", true, true);
      return false;
    }
    return importSaveText(await readSaveImportFile(file), slot);
  } catch (e) {
    flashSaveStatus("Import failed · file could not be read", true, true);
    return false;
  } finally {
    input.value = "";
    if (typeof input.removeAttribute === "function") input.removeAttribute("data-slot");
  }
}

function readRawSave(slot) {
  const keys = saveSlotKeys(saveSlotArg(slot));
  if (!keys) return null;
  try {
    let raw = localStorage.getItem(keys.live);
    const staging = localStorage.getItem(keys.staging);
    const backup = localStorage.getItem(keys.backup);
    // SUN-SAVE-VERSION-GUARD-01: a committed save from a newer build holds this slot. Neither the
    // backup nor legacy v2 stands in for it, so nothing older is loaded here and then autosaved
    // over it. (A live value that still matches staging never committed: it reads on as below.)
    if (raw !== staging && rawSnapshotFormatIsNewer(raw)) return null;
    if (validRawSnapshot(staging) && raw === staging) {
      // A live value that still matches staging never completed its
      // transaction. Prefer the preserved prior slot, or fail closed.
      raw = validRawSnapshot(backup) ? backup : null;
    } else if (!validRawSnapshot(raw)) {
      raw = validRawSnapshot(backup) ? backup : null;
    }
    if (!validRawSnapshot(raw) && keys.legacy) {
      // Read legacy v2 (slot 1 only) without mutating storage. A successful explicit
      // load adopts it through the ordinary verified v3 save transaction.
      const legacy = localStorage.getItem(keys.legacy);
      raw = validRawSnapshot(legacy) ? legacy : null;
    }
    return raw;
  } catch (e) {
    return null;
  }
}

// SUN-UNREADABLE-SAVE-01: bytes in a slot that this build cannot load (a scene id it does not
// know, a corrupt write). The title still fails closed (no Continue/Export, per 0.32), but it
// says the slot exists and Begin confirms before replacing it; before this Begin replaced it unasked.
// SUN-UNREADABLE-EXPORT-01: the raw bytes can be downloaded (buildUnreadableSaveExport).
function unreadableSaveRaw(slot) {
  slot = saveSlotArg(slot);
  if (!slot || hasSave(slot)) return null;
  const keys = saveSlotKeys(slot);
  for (const key of [keys.live, keys.backup, keys.legacy, keys.staging].filter(Boolean)) {
    let raw = null;
    try { raw = localStorage.getItem(key); } catch (e) { raw = null; }
    if (typeof raw === "string" && raw.trim()) return raw;
  }
  return null;
}
function slotHasAnyBytes(slot) {
  slot = saveSlotArg(slot);
  if (!slot) return false;
  return hasSave(slot) || !!unreadableSaveRaw(slot);
}

function hasSave(slot) {
  slot = saveSlotArg(slot);
  return !!slot && validRawSnapshot(readRawSave(slot));
}

function getSaveMeta(slot) {
  slot = saveSlotArg(slot);
  if (!slot) return null;
  const raw = readRawSave(slot);
  if (!raw) return null;
  try {
    const data = JSON.parse(raw);
    if (!data || !data.scene) return null;
    return {
      slot,
      callsign: typeof data.commanderCallsign === "string" && data.commanderCallsign ? data.commanderCallsign : "",
      finished: data.scene === "ending_check",
      scene: data.scene,
      savedAt: data.savedAt || 0,
      survivors: data.survivors,
      deadCount: Array.isArray(data.dead) ? data.dead.length : 0,
      livingCrew: visibleLivingCrewCountFrom(data.dead, data.recovered)
    };
  } catch (e) {
    return null;
  }
}

function persistSave(opts) {
  opts = opts || {};
  const silent = !!opts.silent;
  const slot = saveSlotArg(opts.slot);
  if (!slot) {
    // A slot value that names no slot: nothing is written anywhere.
    reportSaveWriteFailure(silent, true);
    return false;
  }
  const slotKeys = saveSlotKeys(slot);
  // Only slot 1 has a legacy v2 key to retire.
  const retireLegacy = !!opts.retireLegacy && !!slotKeys.legacy;
  const snap = snapshotState();
  let previousRaw = null;
  let previousValid = false;
  let previousLegacyRaw = null;
  let previousLegacyValid = false;
  let json;
  if (retireLegacy) {
    try {
      previousLegacyRaw = localStorage.getItem(slotKeys.legacy);
      previousLegacyValid = validRawSnapshot(previousLegacyRaw);
    } catch (e) {
      reportSaveWriteFailure(silent, false);
      return false;
    }
  }
  try {
    const liveRaw = localStorage.getItem(slotKeys.live);
    const recoveryRaw = localStorage.getItem(slotKeys.backup);
    // SUN-SAVE-VERSION-GUARD-01: a committed newer-format live save is the slot's prior bytes, as
    // readRawSave reads it, not a backup beside it, so a failed write puts the newer save back.
    const newerLive = rawSnapshotFormatIsNewer(liveRaw) && liveRaw !== localStorage.getItem(slotKeys.staging);
    previousRaw = validRawSnapshot(liveRaw) || newerLive
      ? liveRaw
      : (validRawSnapshot(recoveryRaw) ? recoveryRaw : liveRaw);
    previousValid = validRawSnapshot(previousRaw);
  } catch (e) { /* storage access or malformed prior slot */ }
  try {
    json = JSON.stringify(snap);
  } catch (e) {
    reportSaveWriteFailure(silent, previousValid);
    return false;
  }
  try {
    // Stage and verify before touching the live slot. If a prior slot exists,
    // preserve its exact bytes until the replacement has also verified.
    localStorage.setItem(slotKeys.staging, json);
    if (localStorage.getItem(slotKeys.staging) !== json) throw new Error("staging verification failed");
    if (previousRaw !== null) {
      localStorage.setItem(slotKeys.backup, previousRaw);
      if (localStorage.getItem(slotKeys.backup) !== previousRaw) throw new Error("backup verification failed");
    } else {
      localStorage.removeItem(slotKeys.backup);
    }
    localStorage.setItem(slotKeys.live, json);
    if (localStorage.getItem(slotKeys.live) !== json) throw new Error("save verification failed");
    if (retireLegacy && previousLegacyRaw !== null) {
      localStorage.removeItem(slotKeys.legacy);
      if (localStorage.getItem(slotKeys.legacy) !== null) throw new Error("legacy retirement failed");
    }
  } catch (e) {
    let priorRecoverable = false;
    try {
      if (previousRaw !== null && localStorage.getItem(slotKeys.live) !== previousRaw) {
        localStorage.setItem(slotKeys.live, previousRaw);
      } else if (previousRaw === null) {
        localStorage.removeItem(slotKeys.live);
      }
      if (retireLegacy && previousLegacyRaw !== null && localStorage.getItem(slotKeys.legacy) !== previousLegacyRaw) {
        localStorage.setItem(slotKeys.legacy, previousLegacyRaw);
      }
    } catch (restoreError) { /* verified backup remains recovery authority */ }
    try {
      priorRecoverable = (previousValid && (
          localStorage.getItem(slotKeys.live) === previousRaw ||
          localStorage.getItem(slotKeys.backup) === previousRaw
        )) || (previousLegacyValid && localStorage.getItem(slotKeys.legacy) === previousLegacyRaw);
    } catch (readError) { /* status fails closed when custody cannot be read */ }
    try {
      localStorage.removeItem(slotKeys.staging);
      if (localStorage.getItem(slotKeys.live) === previousRaw) localStorage.removeItem(slotKeys.backup);
    } catch (cleanupError) { /* keep any verified backup for readRawSave recovery */ }
    reportSaveWriteFailure(silent, priorRecoverable);
    updateMetaSaveHint();
    return false;
  }
  try {
    localStorage.removeItem(slotKeys.staging);
    localStorage.removeItem(slotKeys.backup);
  } catch (e) { /* committed live slot already verified */ }
  if (!silent) flashSaveStatus("Saved");
  else clearSaveWriteFailure();
  updateMetaSaveHint();
  return true;
}

function reportSaveWriteFailure(silent, priorRecoverable) {
  const action = silent ? "Autosave failed" : "Save failed";
  const custody = priorRecoverable ? "prior slot kept" : "progress not saved";
  flashSaveStatus(`${action} · ${custody}`, true, true);
}

function saveGame() {
  // Manual save — always visible feedback
  const saved = persistSave({ silent: false });
  if (saved) preserveCompletedSlotUntilChoice = false;
  return saved;
}

// Back to the title after a failed load, keeping the failure the player needs to read: the title
// repaint can post the sticky unreadable-slot line, so the failure is posted again after it
// (SUN-SAVED-RUNS-01; the same order commitImportedSave uses).
function showTitleKeepingSaveStatus() {
  const el = document.getElementById("title-save-status");
  const text = el ? String(el.textContent || "") : "";
  const isError = !!(el && el.classList.contains("error"));
  showTitleScreen();
  if (text) flashSaveStatus(text, isError, true);
}

// Loads the active slot (resumeGame() first points it at continueSlot()).
function loadGame() {
  wakeRemembersArmed = false; // SUN-SHIP-REMEMBERS-01: Continue, Load and an imported save are not fresh runs
  const slot = saveSlotArg(activeSaveSlot);
  if (!slot || !hasSave(slot)) {
    flashSaveStatus("No save", true);
    return false;
  }
  const raw = readRawSave(slot);
  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    flashSaveStatus("Save corrupt", true);
    return false;
  }
  if (pendingLegacyResume && pendingLegacyResume.slot === slot && pendingLegacyResume.raw === raw) {
    if (!applySnapshot(pendingLegacyResume.snapshot)) {
      pendingLegacyResume = null;
      flashSaveStatus("Load failed", true, true);
      return false;
    }
    loadedGameVersion = pendingLegacyResume.loadedGameVersion;
    if (!persistSave({ silent: true, slot })) {
      showTitleKeepingSaveStatus();
      return false;
    }
    pendingLegacyResume = null;
    preserveCompletedSlotUntilChoice = false;
    writeCurrentSlotPointer(slot);
    showScreen("game");
    renderStatus();
    showScene(state.scene, { skipOnEnter: true, resume: true });
    updateMetaSaveHint();
    flashSaveStatus("Resumed");
    return true;
  }
  // A held one-time entry belongs to one slot; loading another slot leaves it for that slot.
  if (!pendingLegacyResume || pendingLegacyResume.slot === slot) pendingLegacyResume = null;
  // Do not wipe existing storage if apply fails
  const ok = applySnapshot(data);
  if (!ok) {
    flashSaveStatus("Load failed", true);
    return false;
  }
  showScreen("game");
  renderStatus();
  // A save parked on a retired answer screen has not entered its exit yet (SUN-DIET-REPLY-FOLD-01):
  // enter the exit and render it as a live entry, exactly as that screen's Continue did.
  const retiredResume = state.scene !== data.scene;
  const sceneEntered = data.sceneEntered === true && !retiredResume;
  showScene(state.scene, { skipOnEnter: sceneEntered, resume: !retiredResume });
  // Older snapshots predate the scene-entry marker. Preserve their one-time
  // compatibility entry, then adopt the marker so later resumes stay pure.
  if (!sceneEntered && !persistSave({ silent: true, slot })) {
    pendingLegacyResume = {
      raw,
      snapshot: snapshotState(),
      loadedGameVersion,
      slot
    };
    showTitleKeepingSaveStatus();
    return false;
  }
  preserveCompletedSlotUntilChoice = false;
  writeCurrentSlotPointer(slot);
  updateMetaSaveHint();
  flashSaveStatus("Resumed");
  return true;
}

// Load one named slot (Continue, and the Saved runs dialog's Load). The slot becomes active only
// if the load succeeds: a failed load puts the previous active slot back, so no later title action
// (New run, the in-run Save) can land on a slot the player only tried to open (SUN-SAVED-RUNS-01).
function loadSaveSlot(slot) {
  slot = parseSaveSlot(slot);
  if (!slot || !hasSave(slot)) {
    flashSaveStatus("No save", true);
    return false;
  }
  const previous = activeSaveSlot;
  activeSaveSlot = slot;
  let ok = false;
  let threw = true;
  try {
    ok = loadGame();
    threw = false;
  } finally {
    if (!ok) {
      // Put the previous slot back when the load did not take: it returned false, or it threw
      // before leaving the title. A throw after the run is on screen keeps the slot it shows (and
      // points Continue at it), so the run's next save goes to its own slot.
      const title = document.getElementById("title-screen");
      const onTitle = !title || !title.classList.contains("hidden");
      if (!threw || onTitle) activeSaveSlot = previous;
      else writeCurrentSlotPointer(slot);
    }
  }
  return ok;
}

// Continue: resume the slot continueSlot() picks (the pointer's, else the newest readable).
function resumeGame() {
  const slot = continueSlot();
  if (!slot) {
    flashSaveStatus("No save", true);
    return false;
  }
  return loadSaveSlot(slot);
}

// Removes one slot's keys (the active slot by default; slot 1 includes legacy v2). Other slots,
// the pointer and the settings keys are never touched.
function clearSave(slot) {
  try {
    // A value that names no slot has no keys, so nothing is removed.
    for (const key of saveSlotStorageKeys(saveSlotArg(slot))) localStorage.removeItem(key);
  } catch (e) { /* ignore */ }
  updateMetaSaveHint();
  refreshTitleResumeUI();
}

// #saved-runs-status repeats the title line inside the Saved runs dialog: a live region outside an
// aria-modal dialog may not be announced while the dialog is open.
const SAVE_STATUS_TARGETS = ["save-status", "title-save-status", "saved-runs-status"];
function flashSaveStatus(msg, isError, sticky) {
  const targets = SAVE_STATUS_TARGETS.map(id => document.getElementById(id)).filter(Boolean);
  if (!targets.length) {
    // Fallback if meta not in DOM yet
    if (isError) try { window.alert(msg); } catch (e) {}
    return;
  }
  targets.forEach(el => {
    el.textContent = msg;
    el.classList.toggle("error", !!isError);
    el.classList.add("visible");
  });
  clearTimeout(window.__ssSaveFlash);
  if (sticky) return;
  // SUN-PHONE-UI-POLISH-01: a passing notice clears in the game bar too, so a stale
  // "Resumed" does not linger there for the rest of the run.
  window.__ssSaveFlash = setTimeout(() => {
    targets.forEach(el => {
      el.classList.remove("visible");
      el.textContent = "";
    });
  }, 1800);
}

function clearSaveWriteFailure() {
  const targets = SAVE_STATUS_TARGETS.map(id => document.getElementById(id))
    .filter(el => el && el.classList.contains("error"));
  if (!targets.length) return;
  clearTimeout(window.__ssSaveFlash);
  targets.forEach(el => {
    el.textContent = "";
    el.classList.remove("error");
    el.classList.remove("visible");
  });
}

function updateMetaSaveHint() {
  const el = document.getElementById("save-hint");
  if (!el) return;
  const meta = getSaveMeta();
  if (!meta || !meta.savedAt) {
    el.textContent = "";
    el.removeAttribute("data-paint");
    return;
  }
  const d = new Date(meta.savedAt);
  const clock = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const paint = (typeof VERSION !== "undefined" ? String(VERSION) : "");
  el.textContent = (paint ? "v" + paint + " · " : "") + "Slot " + meta.slot + " · " + clock;
  if (paint) el.setAttribute("data-paint", paint);
  else el.removeAttribute("data-paint");
}

// ---------- Saved runs (SUN-SAVED-RUNS-01, L-052 design S-2) ----------
// The title's Saved runs dialog: one row per slot, a radio each, and the actions that apply to the
// selected row (Load, Export save, Download unreadable save, Import save). Each row's state is read
// from its own slot. Every action reads the selected row's number once and passes it on explicitly;
// none of them reads or changes activeSaveSlot except a successful Load (loadSaveSlot).
// Slot names are derived, never typed (O-2(A)): "Slot N", plus " · callsign" when the run has one.

function formatSaveWhen(savedAt) {
  if (!savedAt) return "";
  try {
    return new Date(savedAt).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch (e) {
    return "";
  }
}

function saveSlotName(slot, meta) {
  return "Slot " + slot + (meta && meta.callsign ? " · " + meta.callsign : "");
}

// "5 alive · 1 lost" (or "intact"), or "Run finished" for a completed run.
function saveRunStanding(meta) {
  if (!meta) return "";
  if (meta.finished) return "Run finished";
  const lost = meta.deadCount ? meta.deadCount + " lost" : "intact";
  return (meta.livingCrew != null ? meta.livingCrew + " alive · " : "") + lost;
}

// One slot's row, computed from that slot alone. kind: filled, finished, empty or unreadable.
// current: this is the slot Continue resumes (passed in, so every row compares against one answer).
function savedRunRow(slot, currentSlot) {
  slot = parseSaveSlot(slot);
  if (!slot) return null;
  let readable = false;
  let unreadable = false;
  let meta = null;
  try { readable = hasSave(slot); } catch (e) { readable = false; }
  if (readable) {
    try { meta = getSaveMeta(slot); } catch (e) { meta = null; }
  } else {
    try { unreadable = !!unreadableSaveRaw(slot); } catch (e) { unreadable = false; }
  }
  const row = {
    slot,
    kind: readable ? (meta && meta.finished ? "finished" : "filled") : (unreadable ? "unreadable" : "empty"),
    current: readable && slot === currentSlot,
    name: "",
    detail: ""
  };
  if (readable) {
    const when = formatSaveWhen(meta && meta.savedAt);
    row.name = saveSlotName(slot, meta);
    row.detail = [saveRunStanding(meta), when ? "saved " + when : ""].filter(Boolean).join(" · ") +
      (row.current ? " · Continue loads this" : "");
  } else if (unreadable) {
    row.name = "Slot " + slot + " · Can't be read by this version";
    row.detail = "Download it to keep a copy. Importing into this slot replaces it.";
  } else {
    row.name = "Slot " + slot + " · Empty";
  }
  return row;
}

function savedRunsDialogOpen() {
  const dialog = document.getElementById("saved-runs");
  return !!(dialog && dialog.classList.contains("visible") && !dialog.classList.contains("hidden"));
}

// The checked row's slot, or null when no row is checked.
function savedRunsSelectedSlot() {
  for (let slot = 1; slot <= SAVE_SLOT_COUNT; slot += 1) {
    const radio = document.getElementById("saved-runs-slot-" + slot);
    if (radio && radio.checked === true) return slot;
  }
  return null;
}

// The row the dialog starts on: the slot Continue resumes, else slot 1.
function savedRunsDefaultSlot() {
  let slot = null;
  try { slot = continueSlot(); } catch (e) { slot = null; }
  return slot || 1;
}

// The slot a dialog action acts on: the checked row. Before the dialog has ever been painted (a
// harness with no markup) that is the row it would start on, never activeSaveSlot.
function savedRunsActionSlot() {
  return savedRunsSelectedSlot() || savedRunsDefaultSlot();
}

const SAVED_RUNS_ACTIONS = [
  // [button id, visible when, accessible name]
  ["saved-runs-load", row => row.kind === "filled" || row.kind === "finished", slot => `Load Slot ${slot}`],
  ["btn-export-save", row => row.kind === "filled" || row.kind === "finished", slot => `Export save from Slot ${slot}`],
  ["btn-export-unreadable", row => row.kind === "unreadable", slot => `Download unreadable save from Slot ${slot}`],
  ["btn-import-save", () => true, slot => `Import save into Slot ${slot}`]
];

// Paint the rows and the selected row's actions. selectSlot picks a row; without one, an open
// dialog keeps its selection and a closed one returns to its starting row.
function renderSavedRuns(selectSlot) {
  let currentSlot = null;
  try { currentSlot = continueSlot(); } catch (e) { currentSlot = null; }
  const rows = [];
  for (let slot = 1; slot <= SAVE_SLOT_COUNT; slot += 1) rows.push(savedRunRow(slot, currentSlot));
  const selected = parseSaveSlot(selectSlot) ||
    (savedRunsDialogOpen() ? savedRunsSelectedSlot() : null) ||
    currentSlot || 1;
  for (const row of rows) {
    const radio = document.getElementById("saved-runs-slot-" + row.slot);
    if (radio) radio.checked = row.slot === selected;
    const name = document.getElementById("saved-runs-slot-" + row.slot + "-name");
    if (name) name.textContent = row.name;
    const detail = document.getElementById("saved-runs-slot-" + row.slot + "-detail");
    if (detail) {
      detail.textContent = row.detail;
      detail.classList.toggle("hidden", !row.detail);
    }
    const label = document.getElementById("saved-runs-row-" + row.slot);
    if (label && typeof label.setAttribute === "function") label.setAttribute("data-kind", row.kind);
  }
  const chosen = rows[selected - 1];
  for (const [id, visible, name] of SAVED_RUNS_ACTIONS) {
    const button = document.getElementById(id);
    if (!button) continue;
    button.classList.toggle("hidden", !visible(chosen));
    if (typeof button.setAttribute === "function") button.setAttribute("aria-label", name(selected));
  }
  return { rows, selected, currentSlot };
}

// A radio's change handler: the row it belongs to becomes the selection.
function selectSavedRunsSlot(slot) {
  slot = parseSaveSlot(slot);
  if (!slot) return false;
  renderSavedRuns(slot);
  return true;
}

// "Slot 1", "Slots 1 and 3", "Slots 1, 2 and 3".
function saveSlotList(slots) {
  if (slots.length === 1) return "Slot " + slots[0];
  return "Slots " + slots.slice(0, -1).join(", ") + " and " + slots[slots.length - 1];
}

function refreshTitleResumeUI() {
  const resumeBtn = document.getElementById("btn-resume");
  const resumeMeta = document.getElementById("resume-meta");
  const beginBtn = document.getElementById("btn-begin");
  // SUN-SAVED-RUNS-01: Continue and its line describe the slot Continue resumes. Export, Download
  // unreadable and Import moved into the Saved runs dialog and act on its selected row. New run
  // still starts in the active slot until the new-run slot picker (design S-3).
  const resumeSlot = continueSlot();
  const has = resumeSlot !== null;
  const readable = [];
  const unreadable = [];
  for (let slot = 1; slot <= SAVE_SLOT_COUNT; slot += 1) {
    let isReadable = false;
    let isUnreadable = false;
    try { isReadable = hasSave(slot); } catch (e) { isReadable = false; }
    if (!isReadable) {
      try { isUnreadable = !!unreadableSaveRaw(slot); } catch (e) { isUnreadable = false; }
    }
    if (isReadable) readable.push(slot);
    if (isUnreadable) unreadable.push(slot);
  }
  if (resumeBtn) {
    if (has) resumeBtn.classList.remove("hidden");
    else resumeBtn.classList.add("hidden");
  }
  if (resumeMeta) {
    if (has) {
      const m = getSaveMeta(resumeSlot);
      const when = formatSaveWhen(m && m.savedAt);
      const paint = (typeof VERSION !== "undefined" ? String(VERSION) : "");
      // v0.36 · Slot 2 · Ash · 5 alive · 1 lost · Nov 13, 09:58 PM
      resumeMeta.textContent =
        (paint ? "v" + paint + " · " : "") +
        saveSlotName(resumeSlot, m) + " · " +
        (m ? saveRunStanding(m) : "intact") +
        (when ? " · " + when : "");
      resumeMeta.classList.remove("hidden");
      resumeMeta.setAttribute("data-paint", paint);
    } else {
      resumeMeta.classList.add("hidden");
      resumeMeta.textContent = "";
    }
  }
  const used = readable.length + unreadable.length;
  if (beginBtn) {
    // "New run" when any slot holds a run Continue could load; unreadable bytes alone keep "Begin"
    // (verify's unknown-scene check pins this; New run still asks before replacing them).
    beginBtn.textContent = has ? "New run" : "Begin";
  }
  if (unreadable.length) {
    // Today's sentence when the only saved bytes are an unreadable run in the slot New run starts
    // in (its Download is in Saved runs); otherwise name the slots and point to Saved runs.
    const onlyActive = !readable.length && unreadable.length === 1 && unreadable[0] === activeSaveSlot;
    const message = onlyActive
      ? "A saved run here can't be read by this version. Open Saved runs to download a copy; starting a new run will replace it."
      : unreadable.length === 1
        ? `A saved run in ${saveSlotList(unreadable)} can't be read by this version · open Saved runs to download it`
        : `The runs in ${saveSlotList(unreadable)} can't be read by this version · open Saved runs to download them`;
    flashSaveStatus(message, true, true);
  }
  const saveChip = document.getElementById("title-save-chip");
  if (saveChip) {
    if (used) {
      saveChip.textContent = `Saved on this device · ${used} of ${SAVE_SLOT_COUNT} slots used`;
      saveChip.classList.remove("hidden");
    } else {
      saveChip.textContent = "";
      saveChip.classList.add("hidden");
    }
  }
  renderSavedRuns();
}
