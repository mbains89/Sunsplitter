// SUN-SAVED-RUNS-01 (L-052, Wave 2 design S-2) — the title's Saved runs dialog, headless.
// Drives the real scripts through simulate.loadGame. Each case starts from cleared storage in a fresh
// runtime. Covers: the row text for filled, finished, empty, unreadable and current rows (derived
// names, O-2(A)); the title's Continue line, chip and unreadable-slot status; the in-run meta hint;
// Load loads the chosen slot and moves the pointer; every row action acts on the selected row's slot,
// never on activeSaveSlot; Export and Download unreadable give that slot's exact bytes; Import into an
// empty and an occupied slot confirms with the slot named and writes only that slot's keys; the four
// pinned import strings are unchanged; a failed Load or Continue leaves the active slot as it was,
// so a later New run cannot land on the slot the player only tried to open, and its reason stays
// on screen; open, close and Escape; Saved runs over the New run slot picker; the picker names the
// slot it replaces; a load that throws keeps the slot that is on screen.
import assert from "node:assert/strict";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadGame } from "./simulate.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const PRELUDE = `
  localStorage.clear();
  window.confirm = () => true;
  const SLOT1 = [SAVE_KEY, SAVE_KEY_LEGACY, SAVE_STAGING_KEY, SAVE_BACKUP_KEY];
  const keysOf = n => { const k = saveSlotKeys(n); return [k.live, k.staging, k.backup].concat(k.legacy ? [k.legacy] : []); };
  const digest = keys => JSON.stringify(keys.map(key => [key, localStorage.getItem(key)]));
  const snap = (scene, extra) => {
    resetRunState();
    state.scene = scene;
    const s = snapshotState();
    return JSON.stringify(Object.assign(s, extra || {}));
  };
  const when = t => new Date(t).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  const text = id => String(document.getElementById(id).textContent || "");
  const shown = id => !document.getElementById(id).classList.contains("hidden");
  const isOpen = () => { const el = document.getElementById("saved-runs"); return el.classList.contains("visible") && !el.classList.contains("hidden"); };
  const rowText = n => [text("saved-runs-slot-" + n + "-name"), text("saved-runs-slot-" + n + "-detail")];
  const actions = () => ["saved-runs-load", "btn-export-save", "btn-export-unreadable", "btn-import-save"].filter(shown);
  const label = id => document.getElementById(id).getAttribute("aria-label");
  // Capture a download: the exact bytes and filename that would be saved.
  const captureDownload = fn => {
    const saved = { body: document.body, createElement: document.createElement, Blob: globalThis.Blob,
      create: URL.createObjectURL, revoke: URL.revokeObjectURL, setTimeout: globalThis.setTimeout };
    let blob = null, link = null;
    try {
      document.body = { appendChild(l) { l.parentNode = this; link = l; return l; }, removeChild(l) { l.parentNode = null; } };
      document.createElement = tag => ({ tag, hidden: false, href: "", download: "", parentNode: null, click() {} });
      globalThis.Blob = class { constructor(parts, options) { this.parts = parts; this.options = options; blob = this; } };
      URL.createObjectURL = () => "blob:saved-runs";
      URL.revokeObjectURL = () => {};
      globalThis.setTimeout = () => 1;
      const ok = fn();
      return { ok, bytes: blob ? blob.parts.join("") : null, filename: link ? link.download : null };
    } finally {
      document.body = saved.body; document.createElement = saved.createElement; globalThis.Blob = saved.Blob;
      URL.createObjectURL = saved.create; URL.revokeObjectURL = saved.revoke; globalThis.setTimeout = saved.setTimeout;
    }
  };
`;

function run(body) {
  const runtime = loadGame(ROOT);
  return JSON.parse(runtime.evaluate(`JSON.stringify((() => {${PRELUDE}\n${body}\n})())`));
}

async function runAsync(body) {
  const runtime = loadGame(ROOT);
  return JSON.parse(await runtime.evaluate(`(async () => {${PRELUDE}\n${body}\n})().then(JSON.stringify)`));
}

const results = [];
const ok = label => results.push(label);

// 1. Rows: filled (with callsign, current), finished, unreadable; then empty rows. Each row is its own.
{
  const r = run(`
    const t1 = Date.UTC(2026, 10, 13, 21, 58), t3 = Date.UTC(2026, 10, 12, 8, 5);
    resetRunState();
    state.scene = "act2_tether_sighting";
    state.commanderCallsign = "Ash";
    kill("lena", "row fixture");
    const filled = JSON.stringify(Object.assign(snapshotState(), { savedAt: t1 }));
    const living = visibleLivingCrewCountFrom(["lena"], {});
    localStorage.setItem(SAVE_KEY, filled);
    localStorage.setItem(saveSlotKeys(2).live, "{not json");
    localStorage.setItem(saveSlotKeys(3).live, snap("ending_check", { savedAt: t3 }));
    localStorage.setItem(SAVE_POINTER_KEY, "1");
    showScreen("title");
    refreshTitleResumeUI();
    const out = {
      living, w1: when(t1), w3: when(t3), version: String(VERSION),
      rows: [rowText(1), rowText(2), rowText(3)],
      kinds: [1, 2, 3].map(n => document.getElementById("saved-runs-row-" + n).getAttribute("data-kind")),
      detail2Hidden: !shown("saved-runs-slot-2-detail"),
      meta: text("resume-meta"), chip: text("title-save-chip"), status: text("title-save-status"),
      begin: text("btn-begin"), selected: savedRunsSelectedSlot()
    };
    out.actions1 = actions();
    selectSavedRunsSlot(2); out.actions2 = actions(); out.labels2 = ["btn-export-unreadable", "btn-import-save"].map(label);
    selectSavedRunsSlot(3); out.actions3 = actions(); out.labels3 = ["saved-runs-load", "btn-export-save", "btn-import-save"].map(label);
    // Slot 3 is the current one once the pointer names it; its Continue line says the run is finished.
    localStorage.setItem(SAVE_POINTER_KEY, "3");
    refreshTitleResumeUI();
    out.rowsPointer3 = [rowText(1), rowText(3)];
    out.meta3 = text("resume-meta");
    out.selectedPointer3 = savedRunsSelectedSlot();
    // Empty rows.
    localStorage.clear();
    refreshTitleResumeUI();
    out.emptyRows = [rowText(1), rowText(2), rowText(3)];
    out.emptyActions = actions();
    out.emptyChip = text("title-save-chip");
    out.emptyChipHidden = !shown("title-save-chip");
    out.emptyBegin = text("btn-begin");
    return out;
  `);
  const finishedDetail = `Run finished · saved ${r.w3}`;
  assert.deepEqual(r.rows[0], ["Slot 1 · Ash", `${r.living} alive · 1 lost · saved ${r.w1} · Continue loads this`], "filled, current row");
  assert.deepEqual(r.rows[1], ["Slot 2 · Can't be read by this version", "Download it to keep a copy. A new run or an import into this slot replaces it."], "unreadable row");
  assert.deepEqual(r.rows[2], ["Slot 3", finishedDetail], "finished row without a callsign");
  assert.deepEqual(r.kinds, ["filled", "unreadable", "finished"]);
  assert.equal(r.detail2Hidden, false);
  assert.equal(r.meta, `v${r.version} · Slot 1 · Ash · ${r.living} alive · 1 lost · ${r.w1}`, "Continue line names slot and callsign");
  assert.equal(r.chip, "Saved on this device · 3 of 3 slots used");
  assert.equal(r.status, "A saved run in Slot 2 can't be read by this version · open Saved runs to download it");
  assert.equal(r.begin, "New run");
  assert.equal(r.selected, 1, "the dialog starts on the slot Continue resumes");
  assert.deepEqual(r.actions1, ["saved-runs-load", "btn-export-save", "btn-import-save"], "filled row actions");
  assert.deepEqual(r.actions2, ["btn-export-unreadable", "btn-import-save"], "unreadable row actions");
  assert.deepEqual(r.labels2, ["Download unreadable save from Slot 2", "Import save into Slot 2"], "actions name the selected slot");
  assert.deepEqual(r.actions3, ["saved-runs-load", "btn-export-save", "btn-import-save"], "finished row actions");
  assert.deepEqual(r.labels3, ["Load Slot 3", "Export save from Slot 3", "Import save into Slot 3"]);
  assert.deepEqual(r.rowsPointer3, [["Slot 1 · Ash", `${r.living} alive · 1 lost · saved ${r.w1}`], ["Slot 3", `${finishedDetail} · Continue loads this`]],
    "'Continue loads this' follows the slot Continue resumes");
  assert.equal(r.meta3, `v${r.version} · Slot 3 · Run finished · ${r.w3}`);
  assert.equal(r.selectedPointer3, 3, "a closed dialog returns to the slot Continue resumes");
  assert.deepEqual(r.emptyRows, [["Slot 1 · Empty", ""], ["Slot 2 · Empty", ""], ["Slot 3 · Empty", ""]], "empty rows");
  assert.deepEqual(r.emptyActions, ["btn-import-save"], "an empty row offers Import only");
  assert.equal(r.emptyChip, "");
  assert.equal(r.emptyChipHidden, true);
  assert.equal(r.emptyBegin, "Begin");
  ok("row text, Continue line, chip and status");
}

// 2. The status line names the unreadable slots and points to Saved runs; since the New run slot
//    picker (SUN-NEW-RUN-SLOT-01) no line promises that a new run replaces them. The meta hint names
//    the active slot.
{
  const r = run(`
    showScreen("title");
    localStorage.setItem(SAVE_KEY, "{not json");
    refreshTitleResumeUI();
    const only1 = text("title-save-status");
    localStorage.clear();
    localStorage.setItem(saveSlotKeys(3).live, "{not json");
    refreshTitleResumeUI();
    const only3 = text("title-save-status");
    localStorage.setItem(saveSlotKeys(2).live, "{also not json");
    refreshTitleResumeUI();
    const two = text("title-save-status");
    localStorage.clear();
    resetRunState(); state.scene = "wake";
    activeSaveSlot = 2;
    persistSave({ silent: true });
    updateMetaSaveHint();
    const hint = text("save-hint");
    const clock = new Date(JSON.parse(localStorage.getItem(saveSlotKeys(2).live)).savedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return { only1, only3, two, hint, clock, version: String(VERSION) };
  `);
  assert.equal(r.only1, "A saved run in Slot 1 can't be read by this version · open Saved runs to download it",
    "an unreadable slot 1 is named, not promised away: New run starts on an empty slot");
  assert.equal(r.only3, "A saved run in Slot 3 can't be read by this version · open Saved runs to download it",
    "an unreadable slot is named, not promised away");
  assert.equal(r.two, "The runs in Slots 2 and 3 can't be read by this version · open Saved runs to download them");
  assert.equal(r.hint, `v${r.version} · Slot 2 · ${r.clock}`, "meta hint names the slot");
  ok("status line and meta hint");
}

// 3. Load: the chosen row's slot loads, becomes active, moves the pointer, and closes the dialog.
{
  const r = run(`
    localStorage.setItem(SAVE_KEY, snap("act2_tether_sighting", { savedAt: 30 }));
    localStorage.setItem(saveSlotKeys(2).live, snap("priority_repairs", { savedAt: 10 }));
    localStorage.setItem(SAVE_POINTER_KEY, "1");
    showScreen("title");
    showSavedRuns();
    const opened = { open: isOpen(), selected: savedRunsSelectedSlot() };
    const bytes = digest(SLOT1) + digest(keysOf(2)) + digest(keysOf(3));
    selectSavedRunsSlot(2);
    const activeAfterSelect = activeSaveSlot;
    const loaded = loadSelectedSavedRun();
    return { opened, activeAfterSelect, loaded, scene: state.scene, active: activeSaveSlot,
      pointer: localStorage.getItem(SAVE_POINTER_KEY), open: isOpen(),
      game: shown("game-screen"), bytesSame: digest(SLOT1) + digest(keysOf(2)) + digest(keysOf(3)) === bytes };
  `);
  assert.deepEqual(r.opened, { open: true, selected: 1 });
  assert.equal(r.activeAfterSelect, 1, "selecting a row does not change the active slot");
  assert.equal(r.loaded, true);
  assert.equal(r.scene, "priority_repairs", "Load resumed slot 2's run");
  assert.equal(r.active, 2);
  assert.equal(r.pointer, "2", "Load moves the pointer");
  assert.equal(r.open, false, "a successful Load closes the dialog");
  assert.equal(r.game, true);
  assert.equal(r.bytesSame, true, "Load of a marked save writes no slot");
  ok("Load loads the chosen slot");
}

// 4. A failed Load or Continue leaves the active slot as it was (S-1 review): a pre-marker save in
//    slot 2 whose marker write fails. A later New run still lands in slot 1, not slot 2. With an
//    unreadable slot 3 on the device, the failure stays on screen: the title repaint's sticky
//    unreadable-slot line does not replace it, in the dialog (Load) or on the title (Continue).
{
  const r = run(`
    localStorage.setItem(SAVE_KEY, snap("act2_tether_sighting", { savedAt: 1 }));
    const pre = JSON.parse(snap("priority_repairs", { savedAt: 2 }));
    delete pre.sceneEntered;
    const preRaw = JSON.stringify(pre);
    const k2 = saveSlotKeys(2);
    localStorage.setItem(k2.live, preRaw);
    localStorage.setItem(saveSlotKeys(3).live, "{not json");
    localStorage.setItem(SAVE_POINTER_KEY, "2");
    const realSet = localStorage.setItem;
    localStorage.setItem = (key, value) => { if (key === k2.staging) throw new Error("injected"); return realSet(key, value); };
    showScreen("title");
    showSavedRuns();
    selectSavedRunsSlot(2);
    const viaLoad = loadSelectedSavedRun();
    const afterLoad = { active: activeSaveSlot, open: isOpen(), status: text("saved-runs-status"), title: shown("title-screen") };
    closeSavedRuns();
    const viaContinue = resumeGame();
    const afterContinue = activeSaveSlot;
    const continueStatus = text("title-save-status");
    localStorage.setItem = realSet;
    closeSavedRuns();
    const s2 = digest(keysOf(2));
    const started = beginFreshCampaign({ persist: true });
    return { viaLoad, afterLoad, viaContinue, afterContinue, continueStatus, started, active: activeSaveSlot,
      slot2Same: digest(keysOf(2)) === s2, slot2Raw: localStorage.getItem(k2.live) === preRaw,
      slot1Scene: JSON.parse(localStorage.getItem(SAVE_KEY)).scene };
  `);
  assert.equal(r.viaLoad, false, "the injected marker write fails the Load");
  assert.equal(r.afterLoad.active, 1, "a failed Load does not make slot 2 active");
  assert.equal(r.afterLoad.open, true, "a failed Load keeps the dialog open");
  assert.equal(r.afterLoad.status, "Autosave failed · prior slot kept", "the failure is announced inside the dialog, over the unreadable-slot line");
  assert.equal(r.viaContinue, false);
  assert.equal(r.afterContinue, 1, "a failed Continue does not make slot 2 active");
  assert.equal(r.continueStatus, "Autosave failed · prior slot kept", "a failed Continue keeps its reason over the unreadable-slot line");
  assert.equal(r.started, true);
  assert.equal(r.active, 1, "New run after the failed loads starts in slot 1");
  assert.equal(r.slot2Same && r.slot2Raw, true, "slot 2's bytes are untouched by the New run");
  assert.equal(r.slot1Scene, "wake");
  ok("failed Load and Continue keep the active slot");
}

// 5. Export and Download unreadable act on the selected row, not the active slot, byte for byte.
{
  const r = run(`
    const raw1 = snap("act2_tether_sighting", { savedAt: 1 });
    const raw3 = snap("act3_spine_next", { savedAt: 3 });
    localStorage.setItem(SAVE_KEY, raw1);
    localStorage.setItem(saveSlotKeys(2).live, "{slot two bytes");
    localStorage.setItem(saveSlotKeys(3).live, raw3);
    localStorage.setItem(SAVE_POINTER_KEY, "1");
    const before = digest(SLOT1) + digest(keysOf(2)) + digest(keysOf(3));
    showScreen("title");
    showSavedRuns();
    selectSavedRunsSlot(3);
    const export3 = captureDownload(() => exportSaveFile());
    selectSavedRunsSlot(2);
    const unreadable2 = captureDownload(() => exportUnreadableSaveFile());
    const export2 = captureDownload(() => exportSaveFile());
    const export2Status = text("saved-runs-status");
    selectSavedRunsSlot(1);
    const unreadable1 = captureDownload(() => exportUnreadableSaveFile());
    return { raw3, export3, unreadable2, export2, export2Status, unreadable1, active: activeSaveSlot,
      same: digest(SLOT1) + digest(keysOf(2)) + digest(keysOf(3)) === before };
  `);
  assert.equal(r.export3.ok, true);
  assert.equal(r.export3.bytes, r.raw3, "Export gives slot 3's exact bytes while slot 1 is active");
  assert.match(r.export3.filename, /^sunsplitter-save-v[^/]+-\d{4}-\d{2}-\d{2}\.json$/);
  assert.equal(r.unreadable2.ok, true);
  assert.equal(r.unreadable2.bytes, "{slot two bytes", "Download unreadable gives slot 2's exact bytes");
  assert.match(r.unreadable2.filename, /^sunsplitter-unreadable-save-\d{4}-\d{2}-\d{2}\.json$/);
  assert.equal(r.export2.ok, false, "Export stays fail-closed for an unreadable row");
  assert.equal(r.export2Status, "No valid save to export");
  assert.equal(r.unreadable1.ok, false, "a readable row has no unreadable download");
  assert.equal(r.active, 1);
  assert.equal(r.same, true, "exports write nothing");
  ok("Export and Download unreadable follow the selected row");
}

// 6. Import into an empty slot and an occupied slot: the confirm names the slot, only that slot's
//    keys change, the pointer moves there, the selection stays, and the pinned strings hold.
await (async () => {
  const r = await runAsync(`
    const raw1 = snap("act2_tether_sighting", { savedAt: 1 });
    const raw2 = snap("priority_repairs", { savedAt: 2 });
    localStorage.setItem(SAVE_KEY, raw1);
    localStorage.setItem(saveSlotKeys(2).live, raw2);
    localStorage.setItem(SAVE_POINTER_KEY, "1");
    const candidate = snap("act3_spine_next", { savedAt: 9 });
    const prompts = [];
    let answer = true;
    window.confirm = message => { prompts.push(message); return answer; };
    const input = document.getElementById("save-import-file");
    input.click = () => {};
    const pick = async (slot, contents) => {
      selectSavedRunsSlot(slot);
      requestSaveImport();
      const recorded = input.getAttribute("data-slot");
      // The player moves the selection while the picker is open; the file still goes to the slot picked.
      selectSavedRunsSlot(slot === 1 ? 2 : 1);
      input.files = [{ name: "save.json", size: contents.length, text: async () => contents }];
      const okImport = await handleSaveImportSelection(input);
      return { recorded, okImport, status: text("title-save-status"), inDialog: text("saved-runs-status"), left: input.getAttribute("data-slot") };
    };
    showScreen("title");
    showSavedRuns();
    const s1 = digest(SLOT1), s2 = digest(keysOf(2));
    const empty3 = await pick(3, candidate);
    const after3 = { slot3: localStorage.getItem(saveSlotKeys(3).live) === candidate, slot1: digest(SLOT1) === s1, slot2: digest(keysOf(2)) === s2,
      pointer: localStorage.getItem(SAVE_POINTER_KEY), active: activeSaveSlot, open: isOpen() };
    const s3 = digest(keysOf(3));
    const occupied2 = await pick(2, candidate);
    const after2 = { slot2: localStorage.getItem(saveSlotKeys(2).live) === candidate, slot1: digest(SLOT1) === s1, slot3: digest(keysOf(3)) === s3,
      pointer: localStorage.getItem(SAVE_POINTER_KEY), active: activeSaveSlot };
    // Pinned strings: cancel, reject, failure.
    answer = false;
    const s2b = digest(keysOf(2));
    const cancelled = await pick(2, raw1);
    const cancelledSame = digest(keysOf(2)) === s2b;
    answer = true;
    const rejected = await pick(3, "{not json");
    const realSet = localStorage.setItem;
    const k3 = saveSlotKeys(3);
    localStorage.setItem = (key, value) => { if (key === k3.live) throw new Error("injected"); return realSet(key, value); };
    const s3b = digest(keysOf(3));
    const failed = await pick(3, raw1);
    localStorage.setItem = realSet;
    const failedSame = readRawSave(3) === candidate && digest(SLOT1) === s1;
    return { prompts, empty3, after3, occupied2, after2, cancelled, cancelledSame, rejected, failed, failedSame, s3Changed: digest(keysOf(3)) !== s3b };
  `);
  assert.deepEqual(r.prompts.slice(0, 2), ["Import this save into Slot 3?", "Import this save into Slot 2? This will replace the saved run in that slot."],
    "the confirm names the slot, and says when it replaces a run");
  assert.equal(r.empty3.recorded, "3", "Import records the selected row's slot before the picker opens");
  assert.equal(r.empty3.left, null, "the recorded slot is cleared after the file is read");
  assert.equal(r.empty3.okImport, true);
  assert.equal(r.empty3.status, "Imported · Continue to load");
  assert.equal(r.empty3.inDialog, "Imported · Continue to load", "the dialog's own status line carries the result");
  assert.deepEqual(r.after3, { slot3: true, slot1: true, slot2: true, pointer: "3", active: 1, open: true },
    "import into empty slot 3 writes slot 3 only, moves the pointer, keeps the active slot and the dialog");
  assert.equal(r.occupied2.okImport, true);
  assert.equal(r.occupied2.status, "Imported · Continue to load");
  assert.deepEqual(r.after2, { slot2: true, slot1: true, slot3: true, pointer: "2", active: 1 }, "import into occupied slot 2 writes slot 2 only");
  assert.equal(r.cancelled.okImport, false);
  assert.equal(r.cancelled.status, "Import cancelled");
  assert.equal(r.cancelledSame, true);
  assert.equal(r.rejected.okImport, false);
  assert.equal(r.rejected.status, "Import rejected · file is not valid JSON");
  assert.equal(r.failed.okImport, false);
  assert.equal(r.failed.status, "Import failed · original slot kept");
  assert.equal(r.failedSame, true, "a failed import keeps slot 3's run and touches slot 1 not at all");
  ok("Import into empty and occupied slots");
})();

// 7. Open, close and Escape: the dialog opens on the current slot's radio, Escape closes it through
//    Close, focus returns to the Saved runs button, and reopening starts on the current slot again.
{
  const r = run(`
    const proto = Object.getPrototypeOf(document.getElementById("story"));
    proto.focus = function () { document.activeElement = this; };
    localStorage.setItem(saveSlotKeys(2).live, snap("priority_repairs", { savedAt: 2 }));
    showScreen("title");
    refreshTitleResumeUI();
    const opener = document.getElementById("btn-saved-runs");
    opener.focus();
    showSavedRuns();
    const focusOnOpen = document.activeElement && document.activeElement.id;
    const open = isOpen();
    selectSavedRunsSlot(3);
    const esc = { key: "Escape", repeat: false, altKey: false, ctrlKey: false, metaKey: false, target: document.activeElement,
      defaultPrevented: false, preventDefault() { this.defaultPrevented = true; }, stopPropagation() {} };
    const handled = handleModalDialogKeydown(esc);
    const afterEsc = { open: isOpen(), focus: document.activeElement && document.activeElement.id };
    showSavedRuns();
    const reopened = savedRunsSelectedSlot();
    closeSavedRuns();
    return { focusOnOpen, open, handled, prevented: esc.defaultPrevented, afterEsc, reopened, closed: !isOpen(),
      primary: MODAL_DIALOG_PRIMARY["saved-runs"], cancel: typeof MODAL_DIALOG_CANCEL["saved-runs"] };
  `);
  assert.equal(r.open, true);
  assert.equal(r.focusOnOpen, "saved-runs-slot-2", "focus starts on the current slot's radio");
  assert.equal(r.handled && r.prevented, true, "Escape is handled by the dialog");
  assert.deepEqual(r.afterEsc, { open: false, focus: "btn-saved-runs" }, "Escape closes and returns focus to the opener");
  assert.equal(r.reopened, 2, "reopening starts on the current slot");
  assert.equal(r.closed, true);
  assert.equal(r.primary, "saved-runs-close");
  assert.equal(r.cancel, "function");
  ok("open, Escape and focus return");
}

// 8. (Myth) New run names the run it would replace. Since SUN-NEW-RUN-SLOT-01 the confirm is the
//    slot picker: slot 1 holds Harbor and a file imported into slot 2 moves Continue there; New run
//    starts on empty slot 3, and picking slot 1 names Harbor. No crew count in the picker's line.
//    (sun-playerflow-new-run-slot-checks.mjs covers the picker in full.)
{
  const r = run(`
    resetRunState();
    state.scene = "act2_tether_sighting";
    state.commanderCallsign = "Harbor";
    persistSave({ silent: true, slot: 1 });
    const harbor = localStorage.getItem(SAVE_KEY);
    const fileB = snap("priority_repairs", { savedAt: Date.now() + 1000 });
    const imported = importSaveText(fileB, 2);
    showScreen("title");
    refreshTitleResumeUI();
    const cont = continueSlot();
    startGame();
    const out = { imported, cont, active: activeSaveSlot,
      shown: document.getElementById("new-run-confirm").classList.contains("visible"),
      selected: newRunSelectedSlot(), chip: text("new-run-confirm-chip"), ok: text("new-run-ok") };
    selectNewRunSlot(1);
    out.chip1 = text("new-run-confirm-chip");
    out.ok1 = text("new-run-ok");
    out.harborKept = localStorage.getItem(SAVE_KEY) === harbor;
    cancelNewRun();
    // An unreadable slot 1, picked: the line says what is lost and where to download it.
    localStorage.setItem(SAVE_KEY, "{not json");
    showNewRunConfirm();
    selectNewRunSlot(1);
    out.unreadableChip = text("new-run-confirm-chip");
    cancelNewRun();
    return out;
  `);
  assert.equal(r.imported, true);
  assert.equal(r.cont, 2, "Continue now resumes slot 2");
  assert.equal(r.active, 1);
  assert.equal(r.shown, true, "New run asks first");
  assert.equal(r.selected, 3, "the picker starts on the first empty slot, not the active slot");
  assert.equal(r.chip, "Slot 3 is empty. Your other slots stay as they are.");
  assert.equal(r.ok, "Start in Slot 3");
  assert.equal(r.chip1, "New run replaces Slot 1 · Harbor. Your other slots stay as they are.", "picking slot 1 names it and its callsign");
  assert.equal(r.ok1, "Replace Slot 1");
  assert.doesNotMatch(r.chip + r.chip1 + r.ok + r.ok1, /\d+\s+alive/, "no crew count in the picker's line or button");
  assert.equal(r.harborKept, true, "nothing is written before the run starts");
  assert.equal(r.unreadableChip, "New run replaces the unreadable save in Slot 1. To keep a copy, cancel and download it from Saved runs.");
  ok("New run names the slot it replaces");
}

// 9. (Review) Saved runs opened over the inline New run confirm closes it first: the modal lookup
//    finds Saved runs, Tab stays in it, and Escape closes Saved runs (not a hidden confirm), so no
//    key sequence inside Saved runs can start a New run.
{
  const r = run(`
    const proto = Object.getPrototypeOf(document.getElementById("story"));
    proto.focus = function () { document.activeElement = this; };
    localStorage.setItem(SAVE_KEY, snap("act2_tether_sighting", { savedAt: 1 }));
    showScreen("title");
    refreshTitleResumeUI();
    const before = localStorage.getItem(SAVE_KEY);
    startGame();
    const confirmOpen = document.getElementById("new-run-confirm").classList.contains("visible");
    const opener = document.getElementById("btn-saved-runs");
    opener.focus();
    showSavedRuns();
    const dialog = document.getElementById("saved-runs");
    const radio = document.getElementById("saved-runs-slot-1");
    dialog.contains = node => node === dialog || node === radio;
    dialog.querySelectorAll = () => [radio];
    radio.tagName = "INPUT"; radio.type = "radio"; radio.name = "save-slot";
    const key = k => ({ key: k, shiftKey: false, repeat: false, altKey: false, ctrlKey: false, metaKey: false, target: document.activeElement,
      defaultPrevented: false, preventDefault() { this.defaultPrevented = true; }, stopPropagation() {} });
    const modal = openModalDialogElement();
    const out = { confirmOpen, modal: modal && modal.id,
      confirmClosed: !document.getElementById("new-run-confirm").classList.contains("visible") };
    out.tabs = [];
    for (let i = 0; i < 3; i++) { handleModalDialogKeydown(key("Tab")); out.tabs.push(document.activeElement && document.activeElement.id); }
    const enter = key("Enter");
    handleModalDialogKeydown(enter);
    handleTitleChromeKeydown(enter);
    handleModalDialogKeydown(key("Escape"));
    out.savedRunsOpen = isOpen();
    out.focus = document.activeElement && document.activeElement.id;
    out.confirmAfter = document.getElementById("new-run-confirm").classList.contains("visible");
    out.untouched = localStorage.getItem(SAVE_KEY) === before;
    out.screen = shown("game-screen");
    return out;
  `);
  assert.equal(r.confirmOpen, true, "setup: the inline confirm was open");
  assert.equal(r.confirmClosed, true, "opening Saved runs closes the inline confirm");
  assert.equal(r.modal, "saved-runs", "the modal lookup finds Saved runs");
  assert.deepEqual(r.tabs, ["saved-runs-slot-1", "saved-runs-slot-1", "saved-runs-slot-1"], "Tab stays inside Saved runs");
  assert.equal(r.savedRunsOpen, false, "Escape closes Saved runs");
  assert.equal(r.confirmAfter, false, "the confirm stays closed");
  assert.equal(r.focus, "btn-saved-runs", "focus returns to the Saved runs button");
  assert.equal(r.untouched && !r.screen, true, "no New run started");
  ok("Saved runs over the New run confirm");
}

// 10. (Review) A load that throws after the run is on screen keeps that run's slot active and
//     points Continue at it, so its next save goes to its own slot; one that throws while the
//     title still shows puts the previous slot back.
{
  const r = run(`
    localStorage.setItem(SAVE_KEY, snap("act2_tether_sighting", { savedAt: 1 }));
    localStorage.setItem(saveSlotKeys(2).live, snap("priority_repairs", { savedAt: 2 }));
    localStorage.setItem(SAVE_POINTER_KEY, "1");
    const realShowScene = showScene, realApply = applySnapshot;
    const out = {};
    showScreen("title");
    showScene = () => { throw new Error("injected after the game screen"); };
    try { loadSaveSlot(2); } catch (e) { out.threwLate = String(e.message); }
    showScene = realShowScene;
    out.lateActive = activeSaveSlot;
    out.latePointer = localStorage.getItem(SAVE_POINTER_KEY);
    out.lateGame = shown("game-screen");
    activeSaveSlot = 1;
    localStorage.setItem(SAVE_POINTER_KEY, "1");
    showScreen("title");
    applySnapshot = () => { throw new Error("injected on the title"); };
    try { loadSaveSlot(2); } catch (e) { out.threwEarly = String(e.message); }
    applySnapshot = realApply;
    out.earlyActive = activeSaveSlot;
    out.earlyPointer = localStorage.getItem(SAVE_POINTER_KEY);
    return out;
  `);
  assert.equal(r.threwLate, "injected after the game screen");
  assert.equal(r.lateGame, true);
  assert.equal(r.lateActive, 2, "the run on screen keeps its slot");
  assert.equal(r.latePointer, "2", "Continue points at the run on screen");
  assert.equal(r.threwEarly, "injected on the title");
  assert.equal(r.earlyActive, 1, "a throw on the title puts the previous slot back");
  assert.equal(r.earlyPointer, "1");
  ok("a throwing load keeps the slot that is on screen");
}

console.log(`PASS sun-playerflow-saved-runs: ${results.length} groups (${results.join("; ")})`);
