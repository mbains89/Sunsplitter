// Sunsplitter — engine-backlog.js
// Text backlog (L-062, Manraj 2026-11-25): the recorder and the store. No UI; the Backlog view is a
// later ticket. SUN-BACKLOG-RECORD-01, Wave 2 design WS1 sections 1-2, adapted to the three save
// slots of src/engine-save.js. A plain script (L-043) that index.html loads before engine-save.js.
//
// What it keeps: each screen as the player saw it when it first rendered live, and the order given
// on it. One entry per live screen, oldest first:
//   { s: scene id, r: [reply lines as printed] (left out when none), t: the scene's text,
//     m: the wake's remembered-ending line (left out when none), c: order }
// t is the exact string scene.text produced, before the paragraph split; sceneTextHtml(t) in
// engine.js gives the paragraphs #story showed. m is the one paragraph a fresh run's wake adds outside
// its text when the ship remembers an earlier ending (SUN-SHIP-REMEMBERS-01, L-054), as printed;
// rememberedLineHtml(m) gives its markup. r is the reply after the dead-speaker filter
// (L-057), so a line the engine dropped is never here. c is the taken choice's text, or null until
// an order is given. s is for checks and later tickets; it is never shown. Nothing else is kept:
// no plates, choices not taken, costs, status values or timestamps.
//
// What it is not: run state. It is never in `state`, snapshotState(), the save or the export, and
// no scene, rule, ending or save reads it. Entries are never re-rendered from state.
//
// Where it lives: beside its slot's save, one key per slot, bound to that save by savedAt:
//   { v: 1, savedAt: <the save's savedAt from the same persistSave>, gap: <bool>, entries: [...] }
// persistSave removes it before the save transaction, so it never takes the room the save needs, and
// writes it again after the save itself has verified; a failed write removes the key and never
// changes persistSave's result or messages (a save that fails leaves the slot's prior save with no
// backlog: the gap). Continue and Load keep it only when v is 1 and savedAt matches the save just
// loaded; otherwise the run opens with a gap (earlier screens not kept). clearSave removes it with the
// save, and so does an import, which replaces the slot's save.

const BACKLOG_KEYS = Object.freeze({
  1: "sunsplitter_backlog_v1",
  2: "sunsplitter_backlog_v1_slot2",
  3: "sunsplitter_backlog_v1_slot3"
});
const BACKLOG_VERSION = 1;
// Safety caps (design section 1). Real runs are 78-127 screens and about 70 KB, so no real run
// comes near; past either cap the oldest screens are dropped and the gap is set.
const BACKLOG_MAX_ENTRIES = 400;
const BACKLOG_MAX_CHARS = 524_288;

// This run's backlog, in memory. Replaced, never mutated in place, by a reset, a load or a restore.
let runBacklog = { gap: false, entries: [] };

// The slot's backlog key, or null for a value that names no slot.
function backlogKey(slot) {
  const n = parseSaveSlot(slot);
  return n ? BACKLOG_KEYS[n] : null;
}

// A new run (resetRunState): nothing is kept yet and nothing is missing.
function backlogReset() {
  runBacklog = { gap: false, entries: [] };
}

// A run whose earlier screens are not kept (an unbound or missing store). A run still on its first
// screen has none to miss.
function backlogStartGap() {
  runBacklog = { gap: !(state && state.scene === "wake"), entries: [] };
}

function backlogCopyEntry(entry) {
  const copy = { s: entry.s };
  if (entry.r) copy.r = entry.r.slice();
  copy.t = entry.t;
  if (entry.m) copy.m = entry.m;
  copy.c = entry.c;
  return copy;
}

// A copy that a rollback can put back (beginFreshCampaign, the held one-time resume entry).
function backlogSnapshot() {
  return { gap: runBacklog.gap, entries: runBacklog.entries.map(backlogCopyEntry) };
}

function backlogRestore(copy) {
  if (copy && Array.isArray(copy.entries)) {
    runBacklog = { gap: !!copy.gap, entries: copy.entries.map(backlogCopyEntry) };
  } else {
    backlogStartGap();
  }
}

// Record point: showScene, a live render only (never a resume, Continue or the intro's first view).
// An onEnter redirect records only the screen it lands on, because only that one renders.
function backlogRecordScreen(sceneId, text, replyLines, rememberedLine) {
  const entry = { s: String(sceneId) };
  if (Array.isArray(replyLines) && replyLines.length) entry.r = replyLines.map(String);
  entry.t = String(text);
  if (rememberedLine) entry.m = String(rememberedLine);
  entry.c = null;
  runBacklog.entries.push(entry);
  if (runBacklog.entries.length > BACKLOG_MAX_ENTRIES) {
    runBacklog.entries.splice(0, runBacklog.entries.length - BACKLOG_MAX_ENTRIES);
    runBacklog.gap = true;
  }
}

// Choice point: makeChoice, before the next screen renders. The order closes the newest screen if
// that screen is the one on display. If the screen on display is not the newest entry (a Load whose
// store was lost, or a run loaded on its first screen), that screen was seen and is not kept: a gap.
function backlogRecordOrder(sceneId, label) {
  const last = runBacklog.entries[runBacklog.entries.length - 1];
  if (!last || last.s !== sceneId) runBacklog.gap = true;
  else if (last.c === null) last.c = label == null ? "" : String(label);
}

// The stored value for a save written at savedAt. Past the character cap, the oldest screens are
// dropped (in memory too) until it fits.
function backlogSerialize(savedAt) {
  const stored = () => JSON.stringify({ v: BACKLOG_VERSION, savedAt, gap: runBacklog.gap, entries: runBacklog.entries });
  let json = stored();
  while (json.length > BACKLOG_MAX_CHARS && runBacklog.entries.length) {
    let over = json.length - BACKLOG_MAX_CHARS;
    let drop = 0;
    while (over > 0 && drop < runBacklog.entries.length) {
      over -= JSON.stringify(runBacklog.entries[drop]).length + 1;
      drop += 1;
    }
    runBacklog.entries.splice(0, Math.max(1, drop));
    runBacklog.gap = true;
    json = stored();
  }
  return json;
}

// Called only by persistSave, after the save for `slot` has verified. Best effort: a write that
// throws (quota, private mode) removes the slot's key, so no stale backlog outlives its save. It
// never throws and its result is not used.
function backlogWrite(slot, savedAt) {
  const key = backlogKey(slot);
  if (!key) return false;
  try {
    localStorage.setItem(key, backlogSerialize(savedAt));
    return true;
  } catch (e) {
    try { localStorage.removeItem(key); } catch (removeError) { /* nothing more to do */ }
    return false;
  }
}

function backlogValidEntry(entry) {
  return entry !== null && typeof entry === "object" && !Array.isArray(entry) &&
    typeof entry.s === "string" && typeof entry.t === "string" &&
    (entry.c === null || typeof entry.c === "string") &&
    (entry.m === undefined || (typeof entry.m === "string" && entry.m.length > 0)) &&
    (entry.r === undefined || (Array.isArray(entry.r) && entry.r.length > 0 && entry.r.every(line => typeof line === "string")));
}

// Continue / Load, after applySnapshot has succeeded: the slot's stored backlog if it belongs to the
// save just loaded (same savedAt, v 1, well formed, within the caps); otherwise the gap.
function backlogLoad(slot, savedAt) {
  const key = backlogKey(slot);
  let stored = null;
  try {
    const raw = key ? localStorage.getItem(key) : null;
    if (typeof raw === "string" && raw.length <= BACKLOG_MAX_CHARS) stored = JSON.parse(raw);
  } catch (e) {
    stored = null;
  }
  const bound = stored !== null && typeof stored === "object" && stored.v === BACKLOG_VERSION &&
    typeof savedAt === "number" && Number.isFinite(savedAt) && stored.savedAt === savedAt &&
    typeof stored.gap === "boolean" && Array.isArray(stored.entries) &&
    stored.entries.length <= BACKLOG_MAX_ENTRIES && stored.entries.every(backlogValidEntry);
  if (!bound) {
    backlogStartGap();
    return false;
  }
  runBacklog = { gap: stored.gap, entries: stored.entries.map(backlogCopyEntry) };
  return true;
}

// clearSave: the backlog goes with its slot's save.
function backlogClear(slot) {
  const key = backlogKey(slot);
  if (!key) return;
  try { localStorage.removeItem(key); } catch (e) { /* ignore, as clearSave does */ }
}
