// SUN-NEW-RUN-SLOT-01 (L-052, Wave 2 design S-3; O-3(A), Manraj 2026-11-25) — New run asks which slot.
// Drives the real scripts through simulate.loadGame; each case starts from cleared storage in a fresh
// runtime. Covers: the default slot for every mix of filled, empty and unreadable slots (the first slot
// that holds nothing; none when all three hold a run, with Start disabled and Start doing nothing);
// the picker's rows match Saved runs, and its line and Start name what Start does; a New run writes
// only the slot the player chose (after an import into slot 2 or 3, after a failed load, after
// Continue, after the menu's Return to title, when the radios change behind the Commander panel),
// never activeSaveSlot; Cancel, Escape,
// the Commander panel's Cancel, Saved runs and a title repaint leave every slot, the pointer and the
// active slot untouched; the pointer moves only when the run starts; a failed write into the chosen
// slot keeps the title and every slot; focus opens on the selected row (the first row when none is)
// and returns to New run on Escape.
import assert from "node:assert/strict";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadGame } from "./simulate.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const PRELUDE = `
  localStorage.clear();
  window.confirm = () => true;
  const ALL_KEYS = [1, 2, 3].flatMap(n => { const k = saveSlotKeys(n); return [k.live, k.staging, k.backup].concat(k.legacy ? [k.legacy] : []); });
  const keysOf = n => { const k = saveSlotKeys(n); return [k.live, k.staging, k.backup].concat(k.legacy ? [k.legacy] : []); };
  const digest = keys => JSON.stringify(keys.map(key => [key, localStorage.getItem(key)]));
  // Everything a New run must not touch outside the chosen slot, plus the pointer and the active slot.
  const world = () => JSON.stringify({ keys: digest(ALL_KEYS), pointer: localStorage.getItem(SAVE_POINTER_KEY), active: activeSaveSlot });
  const others = slot => digest([1, 2, 3].filter(n => n !== slot).flatMap(keysOf));
  const snap = (scene, extra) => {
    resetRunState();
    state.scene = scene;
    const s = snapshotState();
    return JSON.stringify(Object.assign(s, extra || {}));
  };
  const text = id => String(document.getElementById(id).textContent || "");
  const shown = id => !document.getElementById(id).classList.contains("hidden");
  const isOpen = id => { const el = document.getElementById(id); return el.classList.contains("visible") && !el.classList.contains("hidden"); };
  const liveScene = n => { try { return JSON.parse(localStorage.getItem(saveSlotKeys(n).live)).scene; } catch (e) { return null; } };
  const callsign = n => { try { return JSON.parse(localStorage.getItem(saveSlotKeys(n).live)).commanderCallsign || null; } catch (e) { return null; } };
  const picker = () => ({
    open: isOpen("new-run-confirm"), selected: newRunSelectedSlot(), chip: text("new-run-confirm-chip"),
    ok: text("new-run-ok"), okDisabled: document.getElementById("new-run-ok").disabled === true
  });
  // The title's New run as a player presses it: New run, (optionally) a row, Start, then Begin run.
  const title = () => { showScreen("title"); refreshTitleResumeUI(); };
  const newRunTo = slot => {
    title();
    const opened = startGame();
    const before = picker();
    if (slot) selectNewRunSlot(slot);
    const started = confirmNewRun() || advancePastCommanderCreate();
    if (typeof currentCinematic !== "undefined" && currentCinematic) finishCinematic();
    return { opened, before, started };
  };
  const esc = () => ({ key: "Escape", repeat: false, altKey: false, ctrlKey: false, metaKey: false, shiftKey: false, target: document.activeElement,
    defaultPrevented: false, preventDefault() { this.defaultPrevented = true; }, stopPropagation() {} });
`;

function run(body) {
  const runtime = loadGame(ROOT);
  return JSON.parse(runtime.evaluate(`JSON.stringify((() => {${PRELUDE}\n${body}\n})())`));
}

const results = [];
const ok = label => results.push(label);

// 1. O-3(A): the default is the first slot that holds nothing, for every mix of filled slots. With
//    nothing saved anywhere Begin goes straight to the Commander panel and the run lands in slot 1.
//    Unreadable bytes and a legacy v2 save count as a run (they are never a default).
{
  const r = run(`
    const fills = [[], [1], [2], [3], [1, 2], [1, 3], [2, 3], [1, 2, 3]];
    const out = { fills: {} };
    for (const fill of fills) {
      localStorage.clear();
      fill.forEach(n => localStorage.setItem(saveSlotKeys(n).live, snap("act2_tether_sighting", { savedAt: n })));
      title();
      const opened = startGame();
      out.fills[fill.join("") || "none"] = {
        opened, picker: isOpen("new-run-confirm"), commander: isOpen("commander-create"),
        selected: newRunSelectedSlot(), def: newRunDefaultSlot(), pending: pendingNewRunSlot, okDisabled: document.getElementById("new-run-ok").disabled === true
      };
      cancelNewRun(); cancelCommanderCreate();
    }
    // Nothing saved: Begin, Begin run, and the run is in slot 1, current and active.
    localStorage.clear();
    const first = newRunTo(null);
    out.first = { started: first.started, scene: liveScene(1), others: [liveScene(2), liveScene(3)], pointer: localStorage.getItem(SAVE_POINTER_KEY), active: activeSaveSlot };
    // Unreadable bytes in slot 1 only: the title still says Begin, but Begin opens the picker on slot 2.
    localStorage.clear();
    localStorage.setItem(SAVE_KEY, "{not json");
    title();
    out.unreadableBegin = text("btn-begin");
    startGame();
    out.unreadable = picker();
    cancelNewRun();
    // A legacy v2 save is slot 1's run: the picker starts on slot 2, and a run there leaves v2 alone.
    localStorage.clear();
    const legacy = JSON.parse(snap("priority_repairs")); delete legacy.v; delete legacy.sceneEntered;
    localStorage.setItem(SAVE_KEY_LEGACY, JSON.stringify(legacy));
    const v2 = localStorage.getItem(SAVE_KEY_LEGACY);
    const viaLegacy = newRunTo(null);
    out.legacy = { selected: viaLegacy.before.selected, scene2: liveScene(2), v2Kept: localStorage.getItem(SAVE_KEY_LEGACY) === v2, v3: localStorage.getItem(SAVE_KEY) };
    return out;
  `);
  const expected = { none: null, 1: 2, 2: 1, 3: 1, 12: 3, 13: 2, 23: 1, 123: null };
  for (const [fill, slot] of Object.entries(expected)) {
    const row = r.fills[fill];
    if (fill === "none") {
      assert.equal(row.picker, false, "nothing saved: no picker");
      assert.equal(row.commander, true, "nothing saved: Begin opens the Commander panel");
      assert.equal(row.pending, 1, "nothing saved: the run goes to slot 1");
      continue;
    }
    assert.equal(row.opened, false);
    assert.equal(row.picker, true, `slots ${fill} filled: New run opens the picker`);
    assert.equal(row.commander, false, `slots ${fill} filled: no Commander panel before a slot is chosen`);
    assert.equal(row.selected, slot, `slots ${fill} filled: default slot`);
    assert.equal(row.def, slot);
    assert.equal(row.pending, null, "nothing is chosen until Start");
    assert.equal(row.okDisabled, slot === null, `slots ${fill} filled: Start ${slot === null ? "disabled" : "enabled"}`);
  }
  assert.deepEqual(r.first, { started: true, scene: "wake", others: [null, null], pointer: "1", active: 1 }, "nothing saved: the run lands in slot 1");
  assert.equal(r.unreadableBegin, "Begin");
  assert.equal(r.unreadable.open, true, "unreadable bytes alone: Begin still asks");
  assert.equal(r.unreadable.selected, 2, "unreadable bytes are never the default");
  assert.deepEqual(r.legacy, { selected: 2, scene2: "wake", v2Kept: true, v3: null }, "a v2 save is slot 1's run; a run in slot 2 leaves it");
  ok("default slot for 0-3 filled slots");
}

// 2. Rows match Saved runs; the line and Start name what Start does, for an empty, a filled (with
//    callsign), a finished and an unreadable row, and for no row. No crew count in the line or Start.
{
  const r = run(`
    resetRunState();
    state.scene = "act2_tether_sighting";
    state.commanderCallsign = "Harbor";
    kill("lena", "picker fixture");
    localStorage.setItem(SAVE_KEY, JSON.stringify(Object.assign(snapshotState(), { savedAt: 5 })));
    localStorage.setItem(saveSlotKeys(2).live, snap("ending_check", { savedAt: 2 }));
    title();
    startGame();
    const rows = n => [text("new-run-slot-" + n + "-name"), text("new-run-slot-" + n + "-detail"), document.getElementById("new-run-row-" + n).getAttribute("data-kind")];
    const savedRows = n => [text("saved-runs-slot-" + n + "-name"), text("saved-runs-slot-" + n + "-detail"), document.getElementById("saved-runs-row-" + n).getAttribute("data-kind")];
    const out = { empty: picker(), rows: [1, 2, 3].map(rows), saved: [1, 2, 3].map(savedRows) };
    selectNewRunSlot(1); out.filled = picker();
    selectNewRunSlot(2); out.finished = picker();
    cancelNewRun();
    localStorage.setItem(saveSlotKeys(3).live, "{not json");
    title();
    startGame();
    out.none = picker();
    out.rows3 = rows(3);
    selectNewRunSlot(3); out.unreadable = picker();
    cancelNewRun();
    return out;
  `);
  assert.deepEqual(r.rows, r.saved, "the picker's rows are the Saved runs rows");
  assert.equal(r.rows[0][0], "Slot 1 · Harbor");
  assert.match(r.rows[0][1], /alive · 1 lost · saved .* · Continue loads this$/, "a filled row shows what it holds");
  assert.deepEqual(r.rows.map(row => row[2]), ["filled", "finished", "empty"]);
  assert.deepEqual(r.empty, { open: true, selected: 3, chip: "Slot 3 is empty. Your other slots stay as they are.", ok: "Start in Slot 3", okDisabled: false });
  assert.deepEqual(r.filled, { open: true, selected: 1, chip: "New run replaces Slot 1 · Harbor. Your other slots stay as they are.", ok: "Replace Slot 1", okDisabled: false });
  assert.deepEqual(r.finished, { open: true, selected: 2, chip: "New run replaces Slot 2. Your other slots stay as they are.", ok: "Replace Slot 2", okDisabled: false });
  assert.deepEqual(r.none, { open: true, selected: null, chip: "All three slots hold a run. Choose the one to replace.", ok: "Choose a slot", okDisabled: true });
  assert.deepEqual(r.rows3, ["Slot 3 · Can't be read by this version", "Download it to keep a copy. A new run or an import here replaces it.", "unreadable"]);
  assert.deepEqual(r.unreadable, { open: true, selected: 3,
    chip: "New run replaces the unreadable save in Slot 3. To keep a copy, download it from Saved runs first.", ok: "Replace Slot 3", okDisabled: false });
  for (const p of [r.empty, r.filled, r.finished, r.none, r.unreadable]) assert.doesNotMatch(p.chip + p.ok, /\d+\s+alive/, "no crew count");
  ok("rows, line and Start per row");
}

// 3. All three full: Start does nothing until a row is picked (no write, no Commander panel, no
//    pending slot); picking slot 2 replaces slot 2 only.
{
  const r = run(`
    [1, 2, 3].forEach(n => localStorage.setItem(saveSlotKeys(n).live, snap("act2_tether_sighting", { savedAt: n })));
    localStorage.setItem(SAVE_POINTER_KEY, "1");
    title();
    startGame();
    const before = world();
    const pressed = confirmNewRun();
    const out = { pressed, after: picker(), commander: isOpen("commander-create"), pending: pendingNewRunSlot, same: world() === before };
    const s2others = others(2);
    selectNewRunSlot(2);
    out.chosen = confirmNewRun();
    out.commanderAfter = isOpen("commander-create");
    out.pointerBefore = localStorage.getItem(SAVE_POINTER_KEY);
    out.begun = advancePastCommanderCreate();
    out.result = { scene2: liveScene(2), othersSame: others(2) === s2others, pointer: localStorage.getItem(SAVE_POINTER_KEY), active: activeSaveSlot };
    return out;
  `);
  assert.equal(r.pressed, false, "Start with no row picked does nothing");
  assert.equal(r.after.open, true, "the picker stays open");
  assert.equal(r.after.okDisabled, true);
  assert.equal(r.commander, false);
  assert.equal(r.pending, null);
  assert.equal(r.same, true, "no slot, pointer or active slot changed");
  assert.equal(r.chosen, false, "Start opens the Commander panel");
  assert.equal(r.commanderAfter, true);
  assert.equal(r.pointerBefore, "1", "the pointer does not move before the run starts");
  assert.equal(r.begun, true);
  assert.deepEqual(r.result, { scene2: "wake", othersSame: true, pointer: "2", active: 2 }, "the run replaced slot 2 only and is current");
  ok("no default when full; Start waits for a pick");
}

// 4. A New run writes only the chosen slot: after an import into slot 2 (and 3), after a failed
//    load, after Continue, after the menu's Return to title, and when the radios change behind the
//    Commander panel.
{
  const r = run(`
    const out = {};
    const harbor = () => { resetRunState(); state.scene = "act2_tether_sighting"; state.commanderCallsign = "Harbor"; persistSave({ silent: true, slot: 1 }); };
    // a. Import into slot 2: Continue moves there, the active slot stays 1, the picker starts on 3.
    localStorage.clear(); activeSaveSlot = 1; harbor();
    importSaveText(snap("priority_repairs", { savedAt: Date.now() + 1000 }), 2);
    let keep = others(3);
    let go = newRunTo(null);
    out.importTo2 = { def: go.before.selected, scene3: liveScene(3), othersSame: others(3) === keep, pointer: localStorage.getItem(SAVE_POINTER_KEY), active: activeSaveSlot };
    // ...and picking slot 1 then writes slot 1 only, not the slot the import pointed Continue at.
    localStorage.clear(); activeSaveSlot = 1; harbor();
    importSaveText(snap("priority_repairs", { savedAt: Date.now() + 1000 }), 2);
    keep = others(1);
    go = newRunTo(1);
    out.importTo2pick1 = { scene1: liveScene(1), callsign1: callsign(1), othersSame: others(1) === keep, scene2: liveScene(2), pointer: localStorage.getItem(SAVE_POINTER_KEY) };
    // b. Import into slot 3: the picker starts on 2; a run there leaves 1 and 3.
    localStorage.clear(); activeSaveSlot = 1; harbor();
    importSaveText(snap("priority_repairs", { savedAt: Date.now() + 1000 }), 3);
    keep = others(2);
    go = newRunTo(null);
    out.importTo3 = { def: go.before.selected, scene2: liveScene(2), othersSame: others(2) === keep, pointer: localStorage.getItem(SAVE_POINTER_KEY) };
    // c. A failed load of slot 2 (pre-marker save, marker write fails): the run goes to the slot picked.
    localStorage.clear(); activeSaveSlot = 1; harbor();
    const pre = JSON.parse(snap("priority_repairs", { savedAt: 2 })); delete pre.sceneEntered;
    const k2 = saveSlotKeys(2);
    localStorage.setItem(k2.live, JSON.stringify(pre));
    const realSet = localStorage.setItem;
    localStorage.setItem = (key, value) => { if (key === k2.staging) throw new Error("injected"); return realSet(key, value); };
    const loaded = loadSaveSlot(2);
    localStorage.setItem = realSet;
    keep = others(3);
    go = newRunTo(null);
    out.afterFailedLoad = { loaded, def: go.before.selected, scene3: liveScene(3), othersSame: others(3) === keep, slot2Pre: localStorage.getItem(k2.live) === JSON.stringify(pre) };
    // d. After Continue into slot 2 (slot 2 active), back on the title: picking slot 1 writes slot 1,
    //    and the run's Commander tokens land there too, never in the slot Continue had opened.
    localStorage.clear(); activeSaveSlot = 1; harbor();
    localStorage.setItem(saveSlotKeys(2).live, snap("priority_repairs", { savedAt: Date.now() + 1000 }));
    localStorage.setItem(SAVE_POINTER_KEY, "2");
    const resumed = resumeGame();
    const activeAfterContinue = activeSaveSlot;
    keep = others(1);
    document.getElementById("commander-callsign").value = "Keel";
    go = newRunTo(1);
    out.afterContinue = { resumed, activeAfterContinue, scene1: liveScene(1), callsign1: callsign(1), othersSame: others(1) === keep, scene2: liveScene(2),
      pointer: localStorage.getItem(SAVE_POINTER_KEY), active: activeSaveSlot };
    // e. The radios change while the Commander panel is open: the run still goes where Start was pressed.
    localStorage.clear(); activeSaveSlot = 1; harbor();
    title();
    startGame();
    selectNewRunSlot(3);
    confirmNewRun();
    renderNewRunPicker(1);
    keep = others(3);
    const begun = advancePastCommanderCreate();
    out.radiosMoved = { begun, scene3: liveScene(3), othersSame: others(3) === keep };
    // f. The menu's Return to title from a run in slot 2 (slot 2 active): the picker starts on empty
    //    slot 3, and the run goes there only.
    localStorage.clear(); activeSaveSlot = 1; harbor();
    localStorage.setItem(saveSlotKeys(2).live, snap("priority_repairs", { savedAt: 2 }));
    const loaded2 = loadSaveSlot(2);
    const returned = typeof menuReturnToTitle === "function" ? menuReturnToTitle() : "missing";
    const activeAfterReturn = activeSaveSlot;
    keep = others(3);
    go = newRunTo(null);
    out.afterReturn = { loaded2, returned, activeAfterReturn, def: go.before.selected, scene3: liveScene(3), othersSame: others(3) === keep, active: activeSaveSlot };
    return out;
  `);
  assert.deepEqual(r.importTo2, { def: 3, scene3: "wake", othersSame: true, pointer: "3", active: 3 }, "after an import into slot 2 the run goes to slot 3 only");
  assert.deepEqual(r.importTo2pick1, { scene1: "wake", callsign1: "Ash", othersSame: true, scene2: "priority_repairs", pointer: "1" },
    "picking slot 1 after an import into slot 2 writes slot 1 only");
  assert.deepEqual(r.importTo3, { def: 2, scene2: "wake", othersSame: true, pointer: "2" }, "after an import into slot 3 the run goes to slot 2 only");
  assert.deepEqual(r.afterFailedLoad, { loaded: false, def: 3, scene3: "wake", othersSame: true, slot2Pre: true }, "a failed load does not steer the run");
  assert.equal(r.afterContinue.resumed, true);
  assert.equal(r.afterContinue.activeAfterContinue, 2, "setup: Continue made slot 2 active");
  assert.deepEqual({ ...r.afterContinue, resumed: undefined, activeAfterContinue: undefined },
    { resumed: undefined, activeAfterContinue: undefined, scene1: "wake", callsign1: "Keel", othersSame: true, scene2: "priority_repairs", pointer: "1", active: 1 },
    "after Continue into slot 2, a run picked for slot 1 (and its Commander) lands in slot 1 only");
  assert.deepEqual(r.radiosMoved, { begun: true, scene3: "wake", othersSame: true }, "the slot is read once, at Start");
  assert.deepEqual(r.afterReturn, { loaded2: true, returned: true, activeAfterReturn: 2, def: 3, scene3: "wake", othersSame: true, active: 3 },
    "after the menu's Return to title from slot 2, the run goes to the slot picked, not the slot just played");
  ok("a New run writes only the chosen slot");
}

// 5. Every way out writes nothing: the picker's Cancel, Escape, the Commander panel's Cancel, Saved
//    runs opened over the Commander panel, a title repaint; and nothing left behind can start a run.
{
  const r = run(`
    const proto = Object.getPrototypeOf(document.getElementById("story"));
    proto.focus = function () { document.activeElement = this; };
    localStorage.setItem(SAVE_KEY, snap("act2_tether_sighting", { savedAt: 1 }));
    localStorage.setItem(saveSlotKeys(3).live, "{not json");
    localStorage.setItem(SAVE_POINTER_KEY, "1");
    title();
    const before = world();
    const out = {};
    const begin = document.getElementById("btn-begin");
    // Picker Cancel.
    begin.focus(); startGame(); cancelNewRun();
    out.cancel = { same: world() === before, open: isOpen("new-run-confirm"), focus: document.activeElement && document.activeElement.id };
    // Escape on the picker.
    begin.focus(); startGame();
    const focusOnOpen = document.activeElement && document.activeElement.id;
    const e = esc();
    const handled = handleModalDialogKeydown(e);
    out.escape = { focusOnOpen, handled, prevented: e.defaultPrevented, same: world() === before, open: isOpen("new-run-confirm"), focus: document.activeElement && document.activeElement.id };
    // The Commander panel's Cancel, after Start.
    startGame(); selectNewRunSlot(1); confirmNewRun();
    const commanderOpen = isOpen("commander-create");
    cancelCommanderCreate();
    out.commanderCancel = { commanderOpen, pending: pendingNewRunSlot, same: world() === before, late: confirmCommanderCreate(), lateSame: world() === before };
    // Saved runs opened over the Commander panel.
    startGame(); confirmNewRun();
    showSavedRuns();
    out.savedRuns = { commander: isOpen("commander-create"), pending: pendingNewRunSlot, same: world() === before, late: advancePastCommanderCreate() };
    closeSavedRuns();
    // A title repaint (an import or another tab) while the Commander panel is open.
    startGame(); confirmNewRun();
    refreshTitleResumeUI();
    out.repaint = { commander: isOpen("commander-create"), pending: pendingNewRunSlot, late: confirmCommanderCreate(), same: world() === before };
    // Start pressed with the picker closed does nothing.
    out.closedStart = { result: confirmNewRun(), same: world() === before, game: shown("game-screen") };
    out.titleShown = shown("title-screen");
    return out;
  `);
  assert.deepEqual(r.cancel, { same: true, open: false, focus: "btn-begin" }, "Cancel writes nothing and returns focus to New run");
  assert.equal(r.escape.focusOnOpen, "new-run-slot-2", "focus opens on the default row's radio");
  assert.equal(r.escape.handled && r.escape.prevented, true, "Escape is the picker's");
  assert.deepEqual({ same: r.escape.same, open: r.escape.open, focus: r.escape.focus }, { same: true, open: false, focus: "btn-begin" }, "Escape cancels");
  assert.deepEqual(r.commanderCancel, { commanderOpen: true, pending: null, same: true, late: false, lateSame: true }, "the Commander panel's Cancel drops the slot");
  assert.deepEqual(r.savedRuns, { commander: false, pending: null, same: true, late: false }, "Saved runs over the Commander panel drops the slot");
  assert.deepEqual(r.repaint, { commander: false, pending: null, late: false, same: true }, "a title repaint drops the slot");
  assert.deepEqual(r.closedStart, { result: false, same: true, game: false });
  assert.equal(r.titleShown, true);
  ok("every way out leaves slots, pointer and active slot untouched");
}

// 6. A failed write into the chosen slot keeps the title, every slot, the pointer and the active slot.
{
  const r = run(`
    localStorage.setItem(SAVE_KEY, snap("act2_tether_sighting", { savedAt: 1 }));
    localStorage.setItem(saveSlotKeys(2).live, snap("priority_repairs", { savedAt: 2 }));
    localStorage.setItem(SAVE_POINTER_KEY, "1");
    title();
    const before = world();
    const k3 = saveSlotKeys(3);
    const realSet = localStorage.setItem;
    localStorage.setItem = (key, value) => { if (key === k3.staging) throw new Error("injected"); return realSet(key, value); };
    const go = newRunTo(null);
    localStorage.setItem = realSet;
    return { def: go.before.selected, started: go.started, same: world() === before, title: shown("title-screen"), game: shown("game-screen"),
      status: text("title-save-status") };
  `);
  assert.equal(r.def, 3);
  assert.equal(r.started, false, "the failed write stops the run");
  assert.equal(r.same, true, "every slot, the pointer and the active slot are as they were");
  assert.equal(r.title, true);
  assert.equal(r.game, false);
  assert.equal(r.status, "Autosave failed · progress not saved");
  ok("a failed write keeps the title and every slot");
}

// 7. All three full: focus opens on the first row (nothing selected), and the picker's Escape still
//    returns focus to New run.
{
  const r = run(`
    const proto = Object.getPrototypeOf(document.getElementById("story"));
    proto.focus = function () { document.activeElement = this; };
    [1, 2, 3].forEach(n => localStorage.setItem(saveSlotKeys(n).live, snap("act2_tether_sighting", { savedAt: n })));
    title();
    document.getElementById("btn-begin").focus();
    startGame();
    const focusOnOpen = document.activeElement && document.activeElement.id;
    const checked = [1, 2, 3].filter(n => document.getElementById("new-run-slot-" + n).checked === true);
    confirmNewRun();
    const focusAfterEmptyStart = document.activeElement && document.activeElement.id;
    handleModalDialogKeydown(esc());
    return { focusOnOpen, checked, focusAfterEmptyStart, focus: document.activeElement && document.activeElement.id,
      primary: MODAL_DIALOG_PRIMARY["new-run-confirm"], cancel: typeof MODAL_DIALOG_CANCEL["new-run-confirm"] };
  `);
  assert.equal(r.focusOnOpen, "new-run-slot-1", "with nothing selected, focus opens on the first row");
  assert.deepEqual(r.checked, [], "focus does not select a row");
  assert.equal(r.focusAfterEmptyStart, "new-run-slot-1", "Start with no row picked sends focus back to the rows");
  assert.equal(r.focus, "btn-begin");
  assert.equal(r.primary, "new-run-ok");
  assert.equal(r.cancel, "function");
  ok("focus with no default");
}

console.log(`PASS sun-playerflow-new-run-slot: ${results.length} groups (${results.join("; ")})`);
