// Sunsplitter — engine-save.js
// Save / resume: the save keys and schema limits, snapshot and apply, save export and import,
// autosave (persistSave), load and resume, and the title screen's resume line.
// Moved out of src/engine.js unchanged (SUN-CLEAN-ENGINE-SAVE-01, L-043). A plain script that
// index.html loads just before engine.js, so everything here exists before engine.js runs.
// Three run variables it uses are declared in engine.js: loadedGameVersion, pendingLegacyResume
// and preserveCompletedSlotUntilChoice.

const SAVE_KEY = "sunsplitter_save_v3";
const SAVE_KEY_LEGACY = "sunsplitter_save_v2";
const SAVE_STAGING_KEY = "sunsplitter_save_v3_staging";
const SAVE_BACKUP_KEY = "sunsplitter_save_v3_backup";
const SAVE_SCHEMA_VERSION = 3;
const MIN_IMPORT_SCHEMA_VERSION = 2;
const MAX_IMPORT_BYTES = 1_048_576;

// ---------- Save / Resume (v0.19) ----------
// Single slot. Survives refresh, background, tab close on iOS Safari via localStorage.
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
  ship_memory_payoff: "final_choice"
};
function retiredSceneExit(id) {
  if (!Object.prototype.hasOwnProperty.call(RETIRED_SCENE_EXITS, id)) return null;
  const exit = RETIRED_SCENE_EXITS[id];
  return typeof exit === "function" ? exit() : exit;
}

function validSnapshotShape(data) {
  const isRecord = value => value !== null && typeof value === "object" && !Array.isArray(value);
  if (!isRecord(data)) return false;

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

function buildSaveExport() {
  const raw = readRawSave();
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

function exportSaveFile() {
  const prepared = buildSaveExport();
  if (!prepared) {
    flashSaveStatus("No valid save to export", true, true);
    return false;
  }
  return downloadPreparedSave(prepared, "Export prepared");
}

// SUN-UNREADABLE-EXPORT-01 (Manraj 2026-11-05, ruling 2): a slot this build cannot read can be
// downloaded byte-for-byte before a new run replaces it. It is never loaded, validated or
// re-exported as a playable save; Export save above stays fail-closed (0.32) for these bytes.
function buildUnreadableSaveExport() {
  const raw = unreadableSaveRaw();
  if (!raw) return null;
  const stamp = new Date(Date.now()).toISOString().slice(0, 10);
  return { filename: `sunsplitter-unreadable-save-${stamp}.json`, text: raw };
}

function exportUnreadableSaveFile() {
  const prepared = buildUnreadableSaveExport();
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

function commitImportedSave(raw) {
  const keys = [SAVE_KEY, SAVE_KEY_LEGACY, SAVE_STAGING_KEY, SAVE_BACKUP_KEY];
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
    priorRaw = readRawSave();
    localStorage.setItem(SAVE_STAGING_KEY, raw);
    if (localStorage.getItem(SAVE_STAGING_KEY) !== raw || !validRawSnapshot(raw)) throw new Error("staging verification failed");
    if (validRawSnapshot(priorRaw)) {
      localStorage.setItem(SAVE_BACKUP_KEY, priorRaw);
      if (localStorage.getItem(SAVE_BACKUP_KEY) !== priorRaw) throw new Error("backup verification failed");
    } else {
      localStorage.removeItem(SAVE_BACKUP_KEY);
    }
    localStorage.setItem(SAVE_KEY, raw);
    if (localStorage.getItem(SAVE_KEY) !== raw || !validRawSnapshot(localStorage.getItem(SAVE_KEY))) {
      throw new Error("import verification failed");
    }
    localStorage.removeItem(SAVE_KEY_LEGACY);
    if (localStorage.getItem(SAVE_KEY_LEGACY) !== null) throw new Error("legacy retirement failed");
    localStorage.removeItem(SAVE_BACKUP_KEY);
    localStorage.removeItem(SAVE_STAGING_KEY);
    if (localStorage.getItem(SAVE_BACKUP_KEY) !== null || localStorage.getItem(SAVE_STAGING_KEY) !== null) {
      throw new Error("transaction cleanup failed");
    }
  } catch (e) {
    let liveRestored = false;
    try { liveRestored = restoreStorageValue(SAVE_KEY, originals[SAVE_KEY]); } catch (restoreError) { /* recover below */ }
    try { restoreStorageValue(SAVE_KEY_LEGACY, originals[SAVE_KEY_LEGACY]); } catch (restoreError) { /* recover below */ }
    if (liveRestored) {
      try { restoreStorageValue(SAVE_STAGING_KEY, originals[SAVE_STAGING_KEY]); } catch (restoreError) { /* checked below */ }
      try { restoreStorageValue(SAVE_BACKUP_KEY, originals[SAVE_BACKUP_KEY]); } catch (restoreError) { /* checked below */ }
    } else {
      // Keep a durable interrupted-transaction marker. readRawSave() treats
      // the matching live candidate as uncommitted and selects this backup.
      try { restoreStorageValue(SAVE_STAGING_KEY, raw); } catch (restoreError) { /* checked below */ }
      if (validRawSnapshot(priorRaw)) {
        try { restoreStorageValue(SAVE_BACKUP_KEY, priorRaw); } catch (restoreError) { /* checked below */ }
      } else {
        try { restoreStorageValue(SAVE_BACKUP_KEY, originals[SAVE_BACKUP_KEY]); } catch (restoreError) { /* checked below */ }
      }
    }
    let priorRecoverable = false;
    try {
      const effective = readRawSave();
      priorRecoverable = priorRaw === null ? effective === null : effective === priorRaw;
    } catch (readError) { /* fail closed below */ }
    const message = priorRecoverable
      ? "Import failed · original slot kept"
      : (hadOriginal ? "Import failed · storage recovery required" : "Import failed · no replacement written");
    flashSaveStatus(message, true, true);
    updateMetaSaveHint();
    refreshTitleResumeUI();
    return false;
  }
  pendingLegacyResume = null;
  preserveCompletedSlotUntilChoice = false;
  updateMetaSaveHint();
  refreshTitleResumeUI();
  flashSaveStatus("Imported · Continue to load");
  return true;
}

function importSaveText(text) {
  const inspected = inspectSaveImportText(text);
  if (!inspected.ok) {
    flashSaveStatus(`Import rejected · ${inspected.error}`, true, true);
    return false;
  }
  let hasStoredBytes = false;
  try {
    hasStoredBytes = [SAVE_KEY, SAVE_KEY_LEGACY, SAVE_STAGING_KEY, SAVE_BACKUP_KEY]
      .some(key => localStorage.getItem(key) !== null);
  } catch (e) {
    flashSaveStatus("Import failed · storage unavailable", true, true);
    return false;
  }
  const prompt = hasStoredBytes
    ? "Import this save? This will replace the saved run on this device."
    : "Import this save onto this device?";
  if (!window.confirm(prompt)) {
    flashSaveStatus("Import cancelled");
    return false;
  }
  return commitImportedSave(inspected.raw);
}

function requestSaveImport() {
  const input = document.getElementById("save-import-file");
  if (!input) return false;
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
  try {
    if (typeof file.size === "number" && file.size > MAX_IMPORT_BYTES) {
      flashSaveStatus("Import rejected · file is too large", true, true);
      return false;
    }
    return importSaveText(await readSaveImportFile(file));
  } catch (e) {
    flashSaveStatus("Import failed · file could not be read", true, true);
    return false;
  } finally {
    input.value = "";
  }
}

function readRawSave() {
  try {
    let raw = localStorage.getItem(SAVE_KEY);
    const staging = localStorage.getItem(SAVE_STAGING_KEY);
    const backup = localStorage.getItem(SAVE_BACKUP_KEY);
    if (validRawSnapshot(staging) && raw === staging) {
      // A live value that still matches staging never completed its
      // transaction. Prefer the preserved prior slot, or fail closed.
      raw = validRawSnapshot(backup) ? backup : null;
    } else if (!validRawSnapshot(raw)) {
      raw = validRawSnapshot(backup) ? backup : null;
    }
    if (!validRawSnapshot(raw)) {
      // Read legacy v2 without mutating storage. A successful explicit load
      // adopts it through the ordinary verified v3 save transaction.
      const legacy = localStorage.getItem(SAVE_KEY_LEGACY);
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
function unreadableSaveRaw() {
  if (hasSave()) return null;
  for (const key of [SAVE_KEY, SAVE_BACKUP_KEY, SAVE_KEY_LEGACY, SAVE_STAGING_KEY]) {
    let raw = null;
    try { raw = localStorage.getItem(key); } catch (e) { raw = null; }
    if (typeof raw === "string" && raw.trim()) return raw;
  }
  return null;
}
function slotHasAnyBytes() {
  return hasSave() || !!unreadableSaveRaw();
}

function hasSave() {
  return validRawSnapshot(readRawSave());
}

function getSaveMeta() {
  const raw = readRawSave();
  if (!raw) return null;
  try {
    const data = JSON.parse(raw);
    if (!data || !data.scene) return null;
    return {
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
  const retireLegacy = !!opts.retireLegacy;
  const snap = snapshotState();
  let previousRaw = null;
  let previousValid = false;
  let previousLegacyRaw = null;
  let previousLegacyValid = false;
  let json;
  if (retireLegacy) {
    try {
      previousLegacyRaw = localStorage.getItem(SAVE_KEY_LEGACY);
      previousLegacyValid = validRawSnapshot(previousLegacyRaw);
    } catch (e) {
      reportSaveWriteFailure(silent, false);
      return false;
    }
  }
  try {
    const liveRaw = localStorage.getItem(SAVE_KEY);
    const recoveryRaw = localStorage.getItem(SAVE_BACKUP_KEY);
    previousRaw = validRawSnapshot(liveRaw)
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
    localStorage.setItem(SAVE_STAGING_KEY, json);
    if (localStorage.getItem(SAVE_STAGING_KEY) !== json) throw new Error("staging verification failed");
    if (previousRaw !== null) {
      localStorage.setItem(SAVE_BACKUP_KEY, previousRaw);
      if (localStorage.getItem(SAVE_BACKUP_KEY) !== previousRaw) throw new Error("backup verification failed");
    } else {
      localStorage.removeItem(SAVE_BACKUP_KEY);
    }
    localStorage.setItem(SAVE_KEY, json);
    if (localStorage.getItem(SAVE_KEY) !== json) throw new Error("save verification failed");
    if (retireLegacy && previousLegacyRaw !== null) {
      localStorage.removeItem(SAVE_KEY_LEGACY);
      if (localStorage.getItem(SAVE_KEY_LEGACY) !== null) throw new Error("legacy retirement failed");
    }
  } catch (e) {
    let priorRecoverable = false;
    try {
      if (previousRaw !== null && localStorage.getItem(SAVE_KEY) !== previousRaw) {
        localStorage.setItem(SAVE_KEY, previousRaw);
      } else if (previousRaw === null) {
        localStorage.removeItem(SAVE_KEY);
      }
      if (retireLegacy && previousLegacyRaw !== null && localStorage.getItem(SAVE_KEY_LEGACY) !== previousLegacyRaw) {
        localStorage.setItem(SAVE_KEY_LEGACY, previousLegacyRaw);
      }
    } catch (restoreError) { /* verified backup remains recovery authority */ }
    try {
      priorRecoverable = (previousValid && (
          localStorage.getItem(SAVE_KEY) === previousRaw ||
          localStorage.getItem(SAVE_BACKUP_KEY) === previousRaw
        )) || (previousLegacyValid && localStorage.getItem(SAVE_KEY_LEGACY) === previousLegacyRaw);
    } catch (readError) { /* status fails closed when custody cannot be read */ }
    try {
      localStorage.removeItem(SAVE_STAGING_KEY);
      if (localStorage.getItem(SAVE_KEY) === previousRaw) localStorage.removeItem(SAVE_BACKUP_KEY);
    } catch (cleanupError) { /* keep any verified backup for readRawSave recovery */ }
    reportSaveWriteFailure(silent, priorRecoverable);
    updateMetaSaveHint();
    return false;
  }
  try {
    localStorage.removeItem(SAVE_STAGING_KEY);
    localStorage.removeItem(SAVE_BACKUP_KEY);
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

function loadGame() {
  if (!hasSave()) {
    flashSaveStatus("No save", true);
    return false;
  }
  const raw = readRawSave();
  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    flashSaveStatus("Save corrupt", true);
    return false;
  }
  if (pendingLegacyResume && pendingLegacyResume.raw === raw) {
    if (!applySnapshot(pendingLegacyResume.snapshot)) {
      pendingLegacyResume = null;
      flashSaveStatus("Load failed", true, true);
      return false;
    }
    loadedGameVersion = pendingLegacyResume.loadedGameVersion;
    if (!persistSave({ silent: true })) {
      showTitleScreen();
      return false;
    }
    pendingLegacyResume = null;
    preserveCompletedSlotUntilChoice = false;
    showScreen("game");
    renderStatus();
    showScene(state.scene, { skipOnEnter: true, resume: true });
    updateMetaSaveHint();
    flashSaveStatus("Resumed");
    return true;
  }
  pendingLegacyResume = null;
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
  if (!sceneEntered && !persistSave({ silent: true })) {
    pendingLegacyResume = {
      raw,
      snapshot: snapshotState(),
      loadedGameVersion
    };
    showTitleScreen();
    return false;
  }
  preserveCompletedSlotUntilChoice = false;
  updateMetaSaveHint();
  flashSaveStatus("Resumed");
  return true;
}

function resumeGame() {
  return loadGame();
}

function clearSave() {
  try {
    localStorage.removeItem(SAVE_KEY);
    localStorage.removeItem(SAVE_KEY_LEGACY);
    localStorage.removeItem(SAVE_STAGING_KEY);
    localStorage.removeItem(SAVE_BACKUP_KEY);
  } catch (e) { /* ignore */ }
  updateMetaSaveHint();
  refreshTitleResumeUI();
}

function flashSaveStatus(msg, isError, sticky) {
  const targets = [document.getElementById("save-status"), document.getElementById("title-save-status")].filter(Boolean);
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
  const targets = [document.getElementById("save-status"), document.getElementById("title-save-status")]
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
  el.textContent = (paint ? "v" + paint + " · " : "") + "Slot · " + clock;
  if (paint) el.setAttribute("data-paint", paint);
  else el.removeAttribute("data-paint");
}

function refreshTitleResumeUI() {
  const resumeBtn = document.getElementById("btn-resume");
  const resumeMeta = document.getElementById("resume-meta");
  const beginBtn = document.getElementById("btn-begin");
  const exportBtn = document.getElementById("btn-export-save");
  const has = hasSave();
  if (resumeBtn) {
    if (has) resumeBtn.classList.remove("hidden");
    else resumeBtn.classList.add("hidden");
  }
  if (resumeMeta) {
    if (has) {
      const m = getSaveMeta();
      const scene = m && m.scene ? m.scene : "run";
      const dead = m && m.deadCount ? m.deadCount + " lost" : "intact";
      const when = m && m.savedAt ? new Date(m.savedAt).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "";
      const paint = (typeof VERSION !== "undefined" ? String(VERSION) : "");
      resumeMeta.textContent =
        (paint ? "v" + paint + " · " : "") +
        (m && m.livingCrew != null ? m.livingCrew + " alive · " : "") +
        dead +
        (when ? " · " + when : "");
      resumeMeta.classList.remove("hidden");
      resumeMeta.setAttribute("data-paint", paint);
    } else {
      resumeMeta.classList.add("hidden");
      resumeMeta.textContent = "";
    }
  }
  if (beginBtn) {
    beginBtn.textContent = has ? "New run" : "Begin";
  }
  let unreadable = null;
  if (!has) { try { unreadable = unreadableSaveRaw(); } catch (e) { unreadable = null; } }
  if (unreadable) flashSaveStatus("A saved run here can't be read by this version. Download it to keep a copy; starting a new run will replace it.", true, true);
  const unreadableBtn = document.getElementById("btn-export-unreadable");
  if (unreadableBtn) unreadableBtn.classList.toggle("hidden", !unreadable);
  if (exportBtn) {
    let exportable = false;
    try { exportable = validRawSnapshot(readRawSave()); } catch (e) { /* keep hidden */ }
    exportBtn.classList.toggle("hidden", !exportable);
    const xchip = document.getElementById("export-import-chip");
    if (xchip) {
      xchip.textContent = exportable
        ? "Export ready · Import anytime (durable local slot)"
        : "Import anytime · Export appears when a durable slot exists";
    }
  }
  const saveChip = document.getElementById("title-save-chip");
  if (saveChip) {
    if (has) {
      saveChip.textContent = "Your run is saved on this device";
      saveChip.classList.remove("hidden");
    } else {
      saveChip.textContent = "";
      saveChip.classList.add("hidden");
    }
  }
}
