// SUN-SAVE-VERSION-GUARD-01 — a save whose format version (v) is newer than this build's
// SAVE_SCHEMA_VERSION is unreadable here, in every slot: never loaded, never stood in for by older
// bytes (backup, legacy v2), never replaced by New run without the confirm naming the slot, and
// downloadable byte for byte from Saved runs. An import of such a file is refused with today's
// wording and leaves the slot as it was. Current and older formats (v3, v2, no v) load as before.
// (sun-playerflow-save-version-checks.mjs covers the run's gameVersion compatibility, SUN-CODEX-001.)
// Drives the real scripts through simulate.loadGame; each case starts from cleared storage in a
// fresh runtime.
import assert from "node:assert/strict";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadGame } from "./simulate.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const PRELUDE = `
  localStorage.clear();
  let confirmCalls = 0;
  window.confirm = () => { confirmCalls += 1; return true; };
  const SLOT1 = [SAVE_KEY, SAVE_KEY_LEGACY, SAVE_STAGING_KEY, SAVE_BACKUP_KEY];
  const keysOf = n => { const k = saveSlotKeys(n); return [k.live, k.staging, k.backup].concat(k.legacy ? [k.legacy] : []); };
  const ALL = () => SLOT1.concat(keysOf(2), keysOf(3));
  const digest = keys => JSON.stringify(keys.map(key => [key, localStorage.getItem(key)]));
  const snap = (scene, extra) => {
    resetRunState();
    state.scene = scene;
    const s = snapshotState();
    return JSON.stringify(Object.assign(s, extra || {}));
  };
  // A save a newer build wrote: today's fields plus one this build has never heard of.
  const newer = (scene, v, extra) => snap(scene, Object.assign({ v, savedAt: 7, fieldFromTheFuture: { kept: true } }, extra || {}));
  const older = (scene, v) => {
    const s = JSON.parse(snap(scene, { savedAt: 3 }));
    delete s.sceneEntered;
    if (v === undefined) delete s.v; else s.v = v;
    return JSON.stringify(s);
  };
  const text = id => String(document.getElementById(id).textContent || "");
  const shown = id => !document.getElementById(id).classList.contains("hidden");
  const actions = () => ["saved-runs-load", "btn-export-save", "btn-export-unreadable", "btn-import-save"].filter(shown);
  const onGame = () => shown("game-screen");
  const captureDownload = fn => {
    const saved = { body: document.body, createElement: document.createElement, Blob: globalThis.Blob,
      create: URL.createObjectURL, revoke: URL.revokeObjectURL, setTimeout: globalThis.setTimeout };
    let blob = null, link = null;
    try {
      document.body = { appendChild(l) { l.parentNode = this; link = l; return l; }, removeChild(l) { l.parentNode = null; } };
      document.createElement = tag => ({ tag, hidden: false, href: "", download: "", parentNode: null, click() {} });
      globalThis.Blob = class { constructor(parts, options) { this.parts = parts; this.options = options; blob = this; } };
      URL.createObjectURL = () => "blob:save-format-version";
      URL.revokeObjectURL = () => {};
      globalThis.setTimeout = () => 1;
      const ok = fn();
      return { ok, bytes: blob ? blob.parts.join("") : null, filename: link ? link.download : null };
    } finally {
      document.body = saved.body; document.createElement = saved.createElement; globalThis.Blob = saved.Blob;
      URL.createObjectURL = saved.create; URL.revokeObjectURL = saved.revoke; globalThis.setTimeout = saved.setTimeout;
    }
  };
  // The New run confirm's words for slot n. Until the S-3 picker, New run replaces the active slot;
  // with the picker, the row is selected first. Either way the confirm must name Slot n.
  const newRunWords = n => {
    if (typeof selectNewRunSlot === "function") selectNewRunSlot(n);
    return [text("new-run-confirm-copy"), text("new-run-confirm-chip")].join(" ");
  };
`;

function run(body) {
  const runtime = loadGame(ROOT);
  return JSON.parse(runtime.evaluate(`JSON.stringify((() => {${PRELUDE}\n${body}\n})())`));
}

const results = [];
const ok = label => results.push(label);

// 0. The guard itself: only a numeric v above SAVE_SCHEMA_VERSION is newer; missing and older are not.
{
  const r = run(`
    const base = JSON.parse(snap("act2_tether_sighting"));
    const shape = v => { const s = Object.assign({}, base); if (v === undefined) delete s.v; else s.v = v; return validSnapshotShape(s); };
    return {
      current: SAVE_SCHEMA_VERSION,
      shapes: [shape(undefined), shape(2), shape(3), shape(SAVE_SCHEMA_VERSION + 1), shape(99), shape(3.5)],
      apply: applySnapshot(Object.assign({}, base, { v: 99 })),
      sceneAfterApply: state.scene,
      imported: validImportedSnapshot(Object.assign({}, base, { v: 99 }))
    };
  `);
  assert.equal(r.current, 3, "this build writes save format 3");
  assert.deepEqual(r.shapes, [true, true, true, false, false, false], "missing, v2 and v3 pass the shape check; v4, v99 and v3.5 do not");
  assert.equal(r.apply, false, "applySnapshot refuses a newer-format snapshot");
  assert.equal(r.sceneAfterApply, "act2_tether_sighting", "a refused apply leaves the run as it was");
  assert.equal(r.imported, false);
  ok("guard");
}

// 1. A v: 99 save in slot 1, 2 and 3: unreadable, never loaded, kept, downloadable byte for byte,
//    and New run asks (naming the slot) before replacing it.
for (const n of [1, 2, 3]) {
  const r = run(`
    const n = ${n};
    const future = newer("act3_spine_next", 99, { commanderCallsign: "Future" });
    localStorage.setItem(saveSlotKeys(n).live, future);
    const before = digest(ALL());
    activeSaveSlot = n;
    resetRunState(); state.scene = "wake";
    showScreen("title");
    refreshTitleResumeUI();
    const out = {
      read: readRawSave(n), has: hasSave(n), meta: getSaveMeta(n), bytes: slotHasAnyBytes(n),
      unreadable: unreadableSaveRaw(n) === future, cont: continueSlot(),
      resumeShown: shown("btn-resume"), status: text("title-save-status"), begin: text("btn-begin"),
      row: savedRunRow(n, null), exp: buildSaveExport(n)
    };
    showSavedRuns();
    selectSavedRunsSlot(n);
    out.rowName = text("saved-runs-slot-" + n + "-name");
    out.rowKind = document.getElementById("saved-runs-row-" + n).getAttribute("data-kind");
    out.actions = actions();
    out.download = captureDownload(() => exportUnreadableSaveFile());
    out.exportSave = captureDownload(() => exportSaveFile());
    out.exportStatus = text("saved-runs-status");
    // Load from the dialog, then Continue: neither loads it.
    out.load = loadSaveSlot(n);
    out.continue = resumeGame();
    out.sceneAfterLoads = state.scene;
    out.onGameAfterLoads = onGame();
    out.activeAfterLoads = activeSaveSlot;
    hideSavedRuns();
    // New run: the confirm opens and names the slot; nothing is written until it is confirmed.
    activeSaveSlot = n;
    confirmCalls = 0;
    startGame();
    out.confirmShown = shown("new-run-confirm") && document.getElementById("new-run-confirm").classList.contains("visible");
    out.confirmWords = newRunWords(n);
    out.untouchedBeforeConfirm = digest(ALL()) === before;
    cancelNewRun();
    out.untouchedAfterCancel = digest(ALL()) === before;
    out.future = future;
    return out;
  `);
  const at = `slot ${n}`;
  assert.equal(r.read, null, `${at}: readRawSave gives nothing`);
  assert.equal(r.has, false, `${at}: hasSave is false`);
  assert.equal(r.meta, null, `${at}: no save meta`);
  assert.equal(r.bytes, true, `${at}: the slot still counts as holding bytes`);
  assert.equal(r.unreadable, true, `${at}: unreadableSaveRaw gives the stored bytes`);
  assert.equal(r.cont, null, `${at}: Continue has nothing to resume`);
  assert.equal(r.resumeShown, false, `${at}: Continue stays hidden`);
  assert.match(r.status, /can't be read by this version/, `${at}: the title says the run can't be read`);
  assert.equal(r.begin, "Begin", `${at}: unreadable bytes alone keep Begin`);
  assert.equal(r.row.kind, "unreadable", `${at}: Saved runs row state`);
  assert.equal(r.row.name, `Slot ${n} · Can't be read by this version`);
  assert.equal(r.exp, null, `${at}: Export save stays fail-closed`);
  assert.equal(r.rowName, `Slot ${n} · Can't be read by this version`, `${at}: the dialog row says so`);
  assert.equal(r.rowKind, "unreadable");
  assert.deepEqual(r.actions, ["btn-export-unreadable", "btn-import-save"], `${at}: no Load or Export, Download and Import only`);
  assert.equal(r.download.ok, true, `${at}: Download unreadable works`);
  assert.equal(r.download.bytes, r.future, `${at}: the download is byte-identical`);
  assert.match(r.download.filename, /^sunsplitter-unreadable-save-\d{4}-\d{2}-\d{2}\.json$/);
  assert.equal(r.exportSave.ok, false);
  assert.equal(r.exportStatus, "No valid save to export");
  assert.equal(r.load, false, `${at}: Load refuses it`);
  assert.equal(r.continue, false, `${at}: Continue refuses it`);
  assert.equal(r.sceneAfterLoads, "wake", `${at}: no state was read from it`);
  assert.equal(r.onGameAfterLoads, false, `${at}: the title stays up`);
  assert.equal(r.activeAfterLoads, n, `${at}: a refused load leaves the active slot`);
  assert.equal(r.confirmShown, true, `${at}: New run asks first`);
  assert.match(r.confirmWords, new RegExp(`replaces (the unreadable save in )?Slot ${n}\\b`), `${at}: the confirm names the slot`);
  assert.equal(r.untouchedBeforeConfirm, true, `${at}: every slot is byte-identical before the confirm`);
  assert.equal(r.untouchedAfterCancel, true, `${at}: Cancel keeps it`);
  ok(`v99 in slot ${n}`);
}

// 2. Only the confirmed New run replaces it, and with a current-format run.
{
  const r = run(`
    const future = newer("act3_spine_next", 99);
    localStorage.setItem(saveSlotKeys(2).live, future);
    activeSaveSlot = 2;
    showScreen("title");
    refreshTitleResumeUI();
    startGame();
    newRunWords(2);
    confirmNewRun();
    if (shown("commander-create")) commitNewRunWithCommander();
    if (typeof finishCinematic === "function") finishCinematic();
    const live = JSON.parse(localStorage.getItem(saveSlotKeys(2).live));
    return { v: live.v, scene: live.scene, has: hasSave(2), active: activeSaveSlot };
  `);
  assert.equal(r.v, 3, "the confirmed new run writes format 3");
  assert.equal(r.has, true);
  assert.equal(r.active, 2);
  ok("confirmed New run replaces it");
}

// 2b. (Review of #605) A New run into a slot holding a committed newer save and a leftover v3
//     backup, whose live write fails, puts the newer save back: the backup is not restored over
//     it, the status does not claim the prior slot was kept, and the slot stays unreadable.
{
  const r = run(`
    const future = newer("act3_spine_next", 99);
    const k2 = saveSlotKeys(2);
    localStorage.setItem(k2.live, future);
    const leftover = snap("priority_repairs", { savedAt: 2 });
    localStorage.setItem(k2.backup, leftover);
    resetRunState(); state.scene = "wake";
    const realSet = localStorage.setItem;
    // Only the new run's own live write fails; restoring either older value into live succeeds.
    localStorage.setItem = (key, value) => {
      if (key === k2.live && value !== future && value !== leftover) throw new Error("injected live write failure");
      return realSet(key, value);
    };
    const started = beginFreshCampaign({ persist: true, slot: 2 });
    localStorage.setItem = realSet;
    return {
      started, liveIsFuture: localStorage.getItem(k2.live) === future, staging: localStorage.getItem(k2.staging),
      status: text("save-status"), has: hasSave(2), unreadable: unreadableSaveRaw(2) === future,
      kind: savedRunRow(2, null).kind, read: readRawSave(2)
    };
  `);
  assert.equal(r.started, false, "the new run did not start");
  assert.equal(r.liveIsFuture, true, "the newer save is back in live, byte-identical");
  assert.equal(r.staging, null);
  assert.equal(r.status, "Autosave failed · progress not saved", "the status does not claim the prior slot was kept");
  assert.equal(r.has, false, "the slot is not playable");
  assert.equal(r.read, null);
  assert.equal(r.unreadable, true, "the newer bytes are what Download gives");
  assert.equal(r.kind, "unreadable");
  ok("failed New run keeps the newer save");
}

// 3. Older bytes never stand in for a committed newer save: not slot 1's legacy v2, not a backup.
//    An uncommitted newer write (live still equal to staging) reads its backup, as today.
{
  const r = run(`
    const out = {};
    const future = newer("act3_spine_next", 99);
    const v3 = snap("priority_repairs", { savedAt: 2 });
    // Slot 1: newer live beside a readable legacy v2.
    localStorage.setItem(SAVE_KEY, future);
    localStorage.setItem(SAVE_KEY_LEGACY, older("act2_tether_sighting", 2));
    // Slot 2: newer live beside a readable backup left by a cleanup that did not finish.
    localStorage.setItem(saveSlotKeys(2).live, future);
    localStorage.setItem(saveSlotKeys(2).backup, v3);
    // Slot 3: a newer write that never committed (live equals staging) over a readable backup.
    localStorage.setItem(saveSlotKeys(3).live, future);
    localStorage.setItem(saveSlotKeys(3).staging, future);
    localStorage.setItem(saveSlotKeys(3).backup, v3);
    const before1 = digest(SLOT1), before2 = digest(keysOf(2));
    resetRunState(); state.scene = "wake";
    out.has = [hasSave(1), hasSave(2), hasSave(3)];
    out.unreadable1 = unreadableSaveRaw(1) === future;
    out.unreadable2 = unreadableSaveRaw(2) === future;
    out.read3 = readRawSave(3) === v3;
    out.load1 = loadSaveSlot(1);
    out.load2 = loadSaveSlot(2);
    out.sceneAfter = state.scene;
    out.slot1Same = digest(SLOT1) === before1;
    out.slot2Same = digest(keysOf(2)) === before2;
    out.cont = continueSlot();
    return out;
  `);
  assert.deepEqual(r.has, [false, false, true], "a committed newer save makes its slot unreadable; an uncommitted one does not");
  assert.equal(r.unreadable1, true, "slot 1 offers the newer bytes, not the legacy v2");
  assert.equal(r.unreadable2, true, "slot 2 offers the newer bytes, not the backup");
  assert.equal(r.read3, true, "an uncommitted newer write reads its backup, as before");
  assert.equal(r.load1, false, "slot 1's legacy v2 is not loaded in place of the newer save");
  assert.equal(r.load2, false, "slot 2's backup is not loaded in place of the newer save");
  assert.equal(r.sceneAfter, "wake");
  assert.equal(r.slot1Same, true, "slot 1's keys, legacy included, are untouched");
  assert.equal(r.slot2Same, true, "slot 2's keys are untouched");
  assert.equal(r.cont, 3);
  ok("no older bytes stand in");
}

// 4. A pointer at the newer slot falls back to a readable one; playing that run never writes the
//    newer slot.
{
  const r = run(`
    const future = newer("act3_spine_next", 99, { savedAt: 9e12 });
    localStorage.setItem(SAVE_KEY, snap("act2_tether_sighting", { savedAt: 1 }));
    localStorage.setItem(saveSlotKeys(2).live, future);
    localStorage.setItem(saveSlotKeys(3).live, snap("priority_repairs", { savedAt: 5 }));
    localStorage.setItem(SAVE_POINTER_KEY, "2");
    const before2 = digest(keysOf(2));
    showScreen("title");
    refreshTitleResumeUI();
    const out = { cont: continueSlot(), status: text("title-save-status") };
    out.resumed = resumeGame();
    out.active = activeSaveSlot;
    const choice = scenes[state.scene].choices.find(c => !c.effects || canAffordEffects(c.effects));
    makeChoice(choice);
    saveGame();
    out.slot2Same = digest(keysOf(2)) === before2;
    out.slot3Scene = JSON.parse(localStorage.getItem(saveSlotKeys(3).live)).scene === state.scene;
    return out;
  `);
  assert.equal(r.cont, 3, "Continue skips the newer slot 2 for the newest readable slot");
  assert.match(r.status, /Slot 2 can't be read by this version/, "the title names the newer slot");
  assert.equal(r.resumed, true);
  assert.equal(r.active, 3);
  assert.equal(r.slot2Same, true, "autosave and Save in slot 3 leave the newer slot 2 byte-identical");
  assert.equal(r.slot3Scene, true);
  ok("pointer at the newer slot");
}

// 5. Import of a v: 99 file: refused with today's wording, no confirm, the slot untouched (a
//    readable run in it, and the newer bytes in it).
{
  const r = run(`
    const file = newer("act3_spine_next", 99);
    const out = { inspect: inspectSaveImportText(file) };
    out.rows = [];
    for (const n of [1, 2, 3]) {
      localStorage.clear();
      localStorage.setItem(saveSlotKeys(n).live, snap("priority_repairs", { savedAt: 4 }));
      const before = digest(ALL());
      confirmCalls = 0;
      const imported = importSaveText(file, n);
      const row = { n, imported, confirmCalls, status: text("title-save-status"), same: digest(ALL()) === before };
      localStorage.setItem(saveSlotKeys(n).live, file);
      const beforeNewer = digest(ALL());
      row.importedOverNewer = importSaveText(file, n);
      row.sameOverNewer = digest(ALL()) === beforeNewer;
      out.rows.push(row);
    }
    return out;
  `);
  assert.deepEqual(r.inspect, { ok: false, error: "save format is newer than this game" });
  for (const row of r.rows) {
    const at = `import into slot ${row.n}`;
    assert.equal(row.imported, false, `${at}: refused`);
    assert.equal(row.confirmCalls, 0, `${at}: refused before any confirm`);
    assert.equal(row.status, "Import rejected · save format is newer than this game", `${at}: today's wording`);
    assert.equal(row.same, true, `${at}: the readable run in the slot is untouched`);
    assert.equal(row.importedOverNewer, false);
    assert.equal(row.sameOverNewer, true, `${at}: newer bytes already there are untouched`);
  }
  ok("import refused");
}

// 6. Current and every older supported format still load, in each slot and by import, and the
//    next save writes format 3.
{
  const r = run(`
    const cases = [
      ["v3", 1, "live", () => snap("act2_tether_sighting", { savedAt: 6 })],
      ["v2", 1, "live", () => older("act2_tether_sighting", 2)],
      ["v2 legacy key", 1, "legacy", () => older("act2_tether_sighting", 2)],
      ["no v", 1, "live", () => older("act2_tether_sighting", undefined)],
      ["v3", 2, "live", () => snap("priority_repairs", { savedAt: 6 })],
      ["v2", 2, "live", () => older("priority_repairs", 2)],
      ["no v", 3, "live", () => older("act2_tether_sighting", undefined)],
      ["v3", 3, "live", () => snap("act3_spine_next", { savedAt: 6 })]
    ];
    const out = [];
    for (const [label, n, key, make] of cases) {
      localStorage.clear();
      const raw = make();
      const scene = JSON.parse(raw).scene;
      localStorage.setItem(saveSlotKeys(n)[key], raw);
      resetRunState(); state.scene = "wake";
      showScreen("title");
      const row = { label, n, has: hasSave(n), loaded: loadSaveSlot(n), scene: state.scene === scene };
      saveGame();
      row.savedV = JSON.parse(localStorage.getItem(saveSlotKeys(n).live)).v;
      localStorage.clear();
      row.inspect = key === "live" ? inspectSaveImportText(raw).ok : null;
      row.imported = key === "live" ? importSaveText(raw, n) : null;
      out.push(row);
    }
    return out;
  `);
  for (const row of r) {
    const at = `${row.label} in slot ${row.n}`;
    assert.equal(row.has, true, `${at}: readable`);
    assert.equal(row.loaded, true, `${at}: loads`);
    assert.equal(row.scene, true, `${at}: resumes its scene`);
    assert.equal(row.savedV, 3, `${at}: the next save writes format 3`);
    if (row.inspect !== null) {
      assert.equal(row.inspect, true, `${at}: an import file in this format is accepted`);
      assert.equal(row.imported, true, `${at}: and imports`);
    }
  }
  ok("current and older formats load");
}

console.log(`PASS sun-playerflow-save-format-version: ${results.length} groups (${results.join("; ")})`);
