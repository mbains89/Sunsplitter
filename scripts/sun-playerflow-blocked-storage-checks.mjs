// SUN-BLOCKED-STORAGE-01 (Manraj 2026-11-25, O-7(A)) — play with saving off when the browser keeps
// nothing. Before this, a browser that blocks storage left the player on the title after "Begin run"
// with "Autosave failed · progress not saved": the game could not be started at all.
//
// A. vm harness, storage broken from page load, before any game script runs, six ways:
//    missing (no localStorage at all), null (Firefox with storage turned off), throwing on access
//    (Chrome blocking site data), throwing on getItem, throwing on setItem (older Safari private
//    browsing), and QuotaExceededError on every write. For each: the tone screen and the title load,
//    the title says saving is off in the save chip, Continue is absent, Saved runs is disabled with
//    the chip as its reason, Begin starts a run, 30 seeded choices play with the line up after every
//    one, nothing tries to write a save key, background saves stay quiet, the Menu's Save and Load are
//    disabled with a reason, Return to title asks and leaves without saving (Cancel stays), a second
//    run starts from the title, reader settings read their defaults and still change for the session,
//    ship memory and the gallery start empty, and nothing throws or logs an error.
// B. vm harness: a returning player whose browser starts refusing every write (tone acknowledged, a
//    run in slot 1) gets an unsaved run with the slot's bytes untouched, then a read-only Saved runs
//    (Load and Import disabled with the reason; Export and Download unreadable give the exact bytes)
//    and a New run that asks to replace nothing; reads that throw from page load and then recover
//    mid-run never let the unsaved run write over slot 1; one failed read and a one-off failed write
//    (only the staging key throws) keep today's rule (title, current run, every slot, the ordinary
//    failure line); with storage working nothing about the title, the Menu or saving changes.
// C. Chromium through Playwright, localStorage throwing on access (init script): 30 choices with no
//    page error and the line in the game bar on screen after each; the Menu; Return to title. Then
//    setItem throwing (Storage.prototype), so the refusal is learned from the content notice's write.
//    Then the title and the first game screen at 360x640, 390x844, 844x390 and 1440x900: no sideways
//    scroll, the chip above Begin and the bar line inside the viewport. When Playwright or Chromium
//    is missing (CI has no browser) part C prints NOT_AVAILABLE and the file passes on A and B; pass
//    --require-browser to fail instead. SUNSPLITTER_PLAYWRIGHT_MODULE and CHROMIUM_PATH point it at a
//    specific Playwright module or browser; BLOCKED_STORAGE_SHOTS=<dir> saves a screenshot per size.
import { readFile } from "node:fs/promises";
import { mkdirSync } from "node:fs";
import { createServer } from "node:http";
import { execSync } from "node:child_process";
import { createRequire } from "node:module";
import { dirname, extname, join, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import vm from "node:vm";
import { loadGame } from "./simulate.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const NOTICE = "Can't save in this browser · progress won't be kept";
const MENU_CHIP = "Can't save or load in this browser · leaving loses unsaved progress";
const QUESTION_RE = /^Can't save in this browser · unsaved progress will be lost · Return to title anyway\?$/;
const CHOICES = 30;
const SAVE_KEY_RE = /^sunsplitter_save/;
const TONE_KEY = "sunsplitter_tone_ack_v1";

// ---------- A and B: the vm harness ----------

// loadGame has no hook for the storage a page starts with, so the sandbox is changed as the vm
// context is made, before any game script runs. Counts every call on the stub storage.
function storageError(name) {
  const error = new Error(`${name}: storage blocked (fixture)`);
  error.name = name;
  if (name === "QuotaExceededError") error.code = 22;
  if (name === "SecurityError") error.code = 18;
  return error;
}

function breakStorage(sandbox, mode) {
  const calls = { get: 0, set: [], remove: [], access: 0 };
  sandbox.__storageCalls = calls;
  const store = sandbox.localStorage;
  const real = { get: store.getItem, set: store.setItem, remove: store.removeItem };
  store.getItem = key => { calls.get++; return real.get(key); };
  store.setItem = (key, value) => { calls.set.push(String(key)); return real.set(key, value); };
  store.removeItem = key => { calls.remove.push(String(key)); return real.remove(key); };
  if (mode === "missing") {
    delete sandbox.localStorage;
    delete sandbox.window.localStorage;
  } else if (mode === "null") {
    sandbox.localStorage = null;
    sandbox.window.localStorage = null;
  } else if (mode === "access") {
    const getter = { configurable: true, get() { calls.access++; throw storageError("SecurityError"); } };
    Object.defineProperty(sandbox, "localStorage", getter);
    Object.defineProperty(sandbox.window, "localStorage", getter);
  } else if (mode === "getItemRecovers") {
    calls.broken = true;
    store.getItem = key => { calls.get++; if (calls.broken) throw storageError("SecurityError"); return real.get(key); };
  } else if (mode === "getItem") {
    store.getItem = key => { calls.get++; throw storageError("SecurityError"); };
  } else if (mode === "setItem") {
    store.setItem = key => { calls.set.push(String(key)); throw storageError("SecurityError"); };
  } else if (mode === "quota") {
    store.setItem = key => { calls.set.push(String(key)); throw storageError("QuotaExceededError"); };
  } else if (mode !== "working") {
    throw new Error("unknown storage mode " + mode);
  }
  return calls;
}

function loadWithStorage(mode, seed) {
  const original = vm.createContext;
  vm.createContext = function patchedCreateContext(sandbox, options) {
    if (seed) for (const [key, value] of Object.entries(seed)) sandbox.localStorage.setItem(key, value);
    breakStorage(sandbox, mode);
    return original.call(this, sandbox, options);
  };
  try {
    return loadGame(ROOT);
  } finally {
    vm.createContext = original;
  }
}

// Shared in-page helpers. The DOM stub keeps old buttons when the engine clears #choices, so it is
// cleared as a browser would. Choices are picked with the seeded Math.imul LCG of the coverage runs.
const PRELUDE = `
  const __shown = id => { const el = document.getElementById(id); return !!el && !el.classList.contains("hidden"); };
  const __text = id => { const el = document.getElementById(id); return el ? String(el.textContent || "") : null; };
  const __attr = (id, name) => { const el = document.getElementById(id); return el ? el.getAttribute(name) : null; };
  const __bar = () => { const el = document.getElementById("save-status"); return { text: el.textContent, visible: el.classList.contains("visible"), error: el.classList.contains("error") }; };
  const __title = () => ({
    title: __shown("title-screen"), resume: __shown("btn-resume"), resumeMeta: __shown("resume-meta"),
    begin: __text("btn-begin"), chip: __text("title-save-chip"), chipShown: __shown("title-save-chip"),
    savedRunsDisabled: document.getElementById("btn-saved-runs").disabled === true,
    savedRunsDescribedBy: __attr("btn-saved-runs", "aria-describedby"),
    status: __text("title-save-status"), off: typeof savingIsOff === "function" ? savingIsOff() : null
  });
  const __choicesEl = document.getElementById("choices");
  if (!__choicesEl.__clears) {
    let html = __choicesEl.innerHTML;
    Object.defineProperty(__choicesEl, "innerHTML", { configurable: true, get: () => html, set: value => { html = String(value); __choicesEl.children.length = 0; } });
    __choicesEl.__clears = true;
  }
  const __enabled = c => c && (!c.alive || isAlive(c.alive)) && (!c.aliveAll || c.aliveAll.every(k => isAlive(k))) &&
    (!c.aliveAny || c.aliveAny.some(k => isAlive(k))) && (!c.requires || meetsRequirements(c.requires)) && (!c.effects || canAffordEffects(c.effects));
  let __seed = 20261125;
  const __rnd = () => { __seed = (Math.imul(__seed, 1103515245) + 12345) & 0x7fffffff; return __seed / 0x7fffffff; };
  // Begin on the title, through the picker when one shows (today's confirm or the S-3 slot picker),
  // then the Commander panel, then past the intro and the first-run tutorial.
  const __begin = () => {
    window.confirm = () => true;
    let started = startGame();
    if (!started && __shown("new-run-confirm")) {
      if (typeof selectNewRunSlot === "function" && document.getElementById("new-run-slot-1")) selectNewRunSlot(1);
      started = confirmNewRun();
    }
    if (!started && __shown("commander-create")) started = advancePastCommanderCreate();
    if (typeof currentCinematic !== "undefined" && currentCinematic) finishCinematic();
    if (typeof isTutorialOpen === "function" && isTutorialOpen()) dismissTutorial();
    return started;
  };
  // Up to n seeded choices from the scene on screen; the bar after each one.
  const __play = n => {
    const bars = [];
    let made = 0, threw = null;
    for (let i = 0; i < n; i++) {
      const id = state.scene;
      if (!scenes[id] || id === "ending_check") break;
      const list = ((typeof scenes[id].choices === "function" ? scenes[id].choices() : scenes[id].choices) || []).filter(__enabled);
      if (!list.length) break;
      try { makeChoice(list[Math.floor(__rnd() * list.length)]); } catch (e) { threw = id + ": " + String(e && e.message); break; }
      made++;
      if (typeof isTutorialOpen === "function" && isTutorialOpen()) dismissTutorial();
      bars.push(__bar());
    }
    return { made, threw, bars, scene: state.scene, game: __shown("game-screen") };
  };
`;

function evaluate(runtime, body) {
  return JSON.parse(runtime.evaluate(`JSON.stringify((() => {${PRELUDE}\n${body}\n})())`, 120_000));
}

const BLOCKED_MODES = ["missing", "null", "access", "getItem", "setItem", "quota"];
// Writes refused but reads working: Saved runs stays enabled and opens read-only.
const READABLE_MODES = new Set(["setItem", "quota"]);

function blockedModeCase(mode, errors) {
  const fail = message => errors.push(`A ${mode}: ${message}`);
  let runtime;
  try {
    runtime = loadWithStorage(mode);
  } catch (error) {
    fail(`the page did not load (${String(error && error.message).split("\n")[0]})`);
    return null;
  }
  let r;
  try {
    r = evaluate(runtime, `
      const o = {};
      o.boot = { tone: __shown("tone-screen"), title: __shown("title-screen") };
      acknowledgeTone();
      o.title = __title();
      // Reader settings: the defaults, and a change holds for this session.
      o.settings = { pace: readTextPace(), size: readTextSize(), spacing: readLineSpacing(), costs: showCostsOnChoices(), nudity: coverNudityInPictures() };
      o.changed = { size: cycleTextSize(), spacing: cycleLineSpacing(), costs: toggleShowCosts(), nudity: toggleCoverNudity() };
      o.changedRead = { size: readTextSize(), spacing: readLineSpacing(), costs: showCostsOnChoices(), nudity: coverNudityInPictures() };
      setTextSize("standard"); setLineSpacing("standard"); setShowCostsOnChoices(false); setCoverNudity(false);
      // Ship memory and the gallery start empty.
      const memory = shipMemoryRead();
      o.memory = { runs: memory.runs, plates: memory.plates.length, endings: Object.keys(memory.endings).length,
        gallery: __shown("btn-gallery"), board: __shown("btn-memory-board"), remembers: __shown("title-remembers") };
      // The Saved runs actions, called directly, say no and write nothing; Load and Import are disabled.
      o.exported = exportSaveFile();
      renderSavedRuns(1);
      o.dialog = { load: document.getElementById("saved-runs-load").disabled === true, import: document.getElementById("btn-import-save").disabled === true,
        loadDescribedBy: __attr("saved-runs-load", "aria-describedby"), chip: __text("export-import-chip") };
      o.loadSlot = loadSaveSlot(1);
      o.startCalls = __storageCalls.set.filter(k => /^sunsplitter_save/.test(k)).length;
      // Begin, then 30 choices.
      o.started = __begin();
      o.start = { game: __shown("game-screen"), title: __shown("title-screen"), scene: state.scene, bar: __bar(), hint: __text("save-hint") };
      o.play = __play(${CHOICES});
      // Background and close: the lifecycle save stays quiet.
      document.visibilityState = "hidden";
      document.dispatchEvent({ type: "visibilitychange" });
      window.dispatchEvent({ type: "pagehide" });
      document.visibilityState = "visible";
      document.dispatchEvent({ type: "visibilitychange" });
      o.afterBackground = __bar();
      // The Menu.
      o.menuOpened = openMenuSheet();
      o.menu = { saveDisabled: document.getElementById("menu-save").disabled === true, loadDisabled: document.getElementById("menu-load").disabled === true,
        saveDescribedBy: __attr("menu-save", "aria-describedby"), loadDescribedBy: __attr("menu-load", "aria-describedby"), chip: __text("menu-return-title-chip"),
        returnDisabled: document.getElementById("menu-return-title").disabled === true };
      o.menuSave = menuSaveGame();
      o.menuLoad = menuLoadGame();
      o.menuStillOpen = menuSheetOpen();
      const asked = [];
      window.confirm = message => { asked.push(message); return false; };
      o.stay = menuReturnToTitle();
      o.stayed = { open: menuSheetOpen(), game: __shown("game-screen"), status: __text("menu-status") };
      window.confirm = message => { asked.push(message); return true; };
      o.leave = menuReturnToTitle();
      o.asked = asked;
      o.titleAfter = __title();
      o.toneAfter = __shown("tone-screen");
      // A second run from the title.
      o.second = { started: __begin(), game: __shown("game-screen"), bar: __bar() };
      o.secondPlay = __play(3);
      o.saveWrites = __storageCalls.set.filter(k => /^sunsplitter_save/.test(k));
      o.saveRemoves = __storageCalls.remove.filter(k => /^sunsplitter_save/.test(k));
      o.loadSave = typeof loadGame === "function" ? loadGame() : null;
      o.accessTried = __storageCalls.access > 0;
      return o;
    `);
  } catch (error) {
    fail(`threw: ${String(error && error.message).split("\n")[0]}`);
    return null;
  }
  const logged = runtime.logs.filter(entry => entry.level === "error");
  if (logged.length) fail(`logged ${logged.length} error(s): ${logged[0].args.join(" ").slice(0, 160)}`);
  if (!r.boot.tone || r.boot.title) fail(`boot shows ${JSON.stringify(r.boot)}; want the content notice (it cannot be remembered)`);
  const t = r.title;
  if (!t.title || !t.off) fail(`acknowledging the notice did not give the title with saving off (${JSON.stringify(t)})`);
  if (t.resume || t.resumeMeta) fail("Continue is offered with saving off");
  if (t.begin !== "Begin") fail(`the title's start button reads "${t.begin}", not Begin`);
  if (!t.chipShown || t.chip !== NOTICE) fail(`the save chip reads "${t.chip}" (shown ${t.chipShown}), not the saving-off line`);
  const readable = READABLE_MODES.has(mode);
  if (t.savedRunsDisabled === readable || t.savedRunsDescribedBy !== "title-save-chip") fail(`Saved runs should be ${readable ? "enabled read-only" : "disabled"} with the chip as its reason (disabled ${t.savedRunsDisabled}, ${t.savedRunsDescribedBy})`);
  if (r.dialog.load !== true || r.dialog.import !== true || r.dialog.loadDescribedBy !== "export-import-chip" || r.dialog.chip !== NOTICE) fail(`Saved runs is not read-only: ${JSON.stringify(r.dialog)}`);
  if (t.status) fail(`the title status line repeats or adds "${t.status}"`);
  const defaults = { pace: "paced", size: "standard", spacing: "standard", costs: false, nudity: false };
  if (JSON.stringify(r.settings) !== JSON.stringify(defaults)) fail(`reader settings did not read their defaults: ${JSON.stringify(r.settings)}`);
  const changed = { size: "large", spacing: "relaxed", costs: true, nudity: true };
  if (JSON.stringify(r.changed) !== JSON.stringify(changed) || JSON.stringify(r.changedRead) !== JSON.stringify(changed)) {
    fail(`a reader setting did not change for the session: ${JSON.stringify(r.changed)} / ${JSON.stringify(r.changedRead)}`);
  }
  if (r.memory.runs || r.memory.plates || r.memory.endings || r.memory.gallery || r.memory.board || r.memory.remembers) fail(`ship memory or the gallery is not empty: ${JSON.stringify(r.memory)}`);
  if (r.exported !== false) fail("Export reported a file with nothing saved");
  if (r.loadSlot !== false) fail("loadSaveSlot loaded with saving off");
  if (r.startCalls) fail(`${r.startCalls} save-key write(s) before any run started`);
  if (!r.started || !r.start.game || r.start.title || r.start.scene !== "wake") fail(`Begin did not start a run on wake (${JSON.stringify(r.start)}, started ${r.started})`);
  if (r.start.bar.text !== NOTICE || !r.start.bar.visible) fail(`the game bar reads "${r.start.bar.text}" (visible ${r.start.bar.visible}) at the start of the run`);
  if (r.start.hint) fail(`the bar shows a slot line "${r.start.hint}" with saving off`);
  if (r.play.threw) fail(`a choice threw: ${r.play.threw}`);
  if (r.play.made < CHOICES) fail(`only ${r.play.made} of ${CHOICES} choices played (stopped on ${r.play.scene})`);
  if (mode === "access" && !r.accessTried) fail("the fixture's throwing localStorage getter was never reached");
  const lost = r.play.bars.findIndex(bar => bar.text !== NOTICE || !bar.visible);
  if (lost >= 0) fail(`after choice ${lost + 1} the bar reads "${r.play.bars[lost].text}" (visible ${r.play.bars[lost].visible})`);
  if (r.afterBackground.text !== NOTICE || !r.afterBackground.visible) fail(`after a background save the bar reads "${r.afterBackground.text}"`);
  if (!r.menuOpened) fail("the Menu did not open");
  if (!r.menu.saveDisabled || !r.menu.loadDisabled || r.menu.returnDisabled) fail(`Menu: Save/Load/Return to title disabled = ${r.menu.saveDisabled}/${r.menu.loadDisabled}/${r.menu.returnDisabled}`);
  if (r.menu.saveDescribedBy !== "menu-return-title-chip" || r.menu.loadDescribedBy !== "menu-return-title-chip") fail("Menu: Save and Load are not described by the line under them");
  if (r.menu.chip !== MENU_CHIP) fail(`Menu: the line under the run actions reads "${r.menu.chip}"`);
  if (r.menuSave !== false || r.menuLoad !== false || !r.menuStillOpen) fail(`Menu: Save or Load acted with saving off (${r.menuSave}, ${r.menuLoad}, open ${r.menuStillOpen})`);
  if (r.stay !== false || !r.stayed.open || !r.stayed.game) fail(`Menu: Cancel on Return to title left the run (${JSON.stringify(r.stayed)})`);
  if (r.leave !== true || r.asked.length !== 2 || !QUESTION_RE.test(r.asked[0])) fail(`Menu: Return to title did not ask, then leave (${r.leave}, ${JSON.stringify(r.asked)})`);
  const ta = r.titleAfter;
  if (!ta.title || ta.resume || ta.begin !== "Begin" || ta.chip !== NOTICE || ta.savedRunsDisabled === readable || ta.status) fail(`the title after the run: ${JSON.stringify(ta)}`);
  if (!r.second.started || !r.second.game || r.second.bar.text !== NOTICE || r.secondPlay.threw || r.secondPlay.made < 3) fail(`a second run did not start and play (${JSON.stringify(r.second)}, ${JSON.stringify(r.secondPlay)})`);
  // The latch is learned from one refused write (the content notice's); after that no save key is tried.
  if (r.saveWrites.length || r.saveRemoves.length) fail(`save keys were written or removed with saving off: ${JSON.stringify([r.saveWrites, r.saveRemoves])}`);
  if (r.loadSave !== false) fail("loadGame reported a load with nothing saved");
  return { mode, choices: r.play.made, scene: r.play.scene };
}

// A returning player: tone acknowledged and a run in slot 1, then every write refused.
function returningRefusedCase(errors) {
  const fail = message => errors.push(`B returning: ${message}`);
  const seed = { [TONE_KEY]: "1" };
  const runtime = loadWithStorage("working", seed);
  const r = evaluate(runtime, `
    resetRunState(); state.scene = "act2_tether_sighting"; state.cohesion = 33;
    const raw = JSON.stringify(snapshotState());
    localStorage.setItem(SAVE_KEY, raw);
    localStorage.setItem(SAVE_POINTER_KEY, "1");
    showTitleScreen();
    const o = { before: __title() };
    const realSet = localStorage.setItem;
    const refused = [];
    localStorage.setItem = key => { refused.push(String(key)); const e = new Error("quota"); e.name = "QuotaExceededError"; throw e; };
    o.started = __begin();
    o.start = { game: __shown("game-screen"), scene: state.scene, bar: __bar(), off: savingIsOff() };
    o.play = __play(5);
    o.slot1Same = localStorage.getItem(SAVE_KEY) === raw;
    o.toneSame = localStorage.getItem(${JSON.stringify(TONE_KEY)}) === "1";
    o.writesAfterLatch = refused.slice(refused.indexOf(${JSON.stringify(TONE_KEY)}) + 1).filter(k => /^sunsplitter_save/.test(k));
    o.refused = refused;
    openMenuSheet();
    window.confirm = () => true;
    o.left = menuReturnToTitle();
    o.after = __title();
    // Saved runs opens read-only: Load and Import disabled with the chip's reason, Export and
    // Download unreadable working on the bytes as stored (slot 2 holds bytes this build cannot read).
    realSet(saveSlotKeys(2).live, "{not this build");
    showSavedRuns();
    const action = id => { const el = document.getElementById(id); return { shown: !el.classList.contains("hidden"), disabled: el.disabled === true, describedBy: el.getAttribute("aria-describedby") }; };
    selectSavedRunsSlot(1);
    o.slot1Actions = { load: action("saved-runs-load"), exportSave: action("btn-export-save"), importSave: action("btn-import-save"), chip: __text("export-import-chip") };
    const exported = buildSaveExport(1);
    o.exportExact = !!exported && exported.text === raw;
    o.loaded = loadSelectedSavedRun();
    o.stillTitle = __shown("title-screen");
    selectSavedRunsSlot(2);
    o.slot2Actions = { download: action("btn-export-unreadable"), importSave: action("btn-import-save") };
    const unreadable = buildUnreadableSaveExport(2);
    o.downloadExact = !!unreadable && unreadable.text === "{not this build";
    closeSavedRuns();
    // A new run replaces nothing with saving off, so it asks nothing (no replace confirm).
    startGame();
    o.newRunConfirm = __shown("new-run-confirm");
    o.newRunCommander = __shown("commander-create");
    cancelCommanderCreate();
    o.slot1StillSame = localStorage.getItem(SAVE_KEY) === raw;
    localStorage.setItem = realSet;
    return o;
  `);
  if (!r.before.resume || r.before.off) fail(`before any write the title should offer Continue as usual (${JSON.stringify(r.before)})`);
  if (!r.started || !r.start.game || r.start.scene !== "wake" || !r.start.off) fail(`New run did not start unsaved (${JSON.stringify(r.start)})`);
  if (r.start.bar.text !== NOTICE) fail(`the bar reads "${r.start.bar.text}" after the refused first save`);
  if (r.play.threw || r.play.made < 5) fail(`play did not continue (${JSON.stringify(r.play)})`);
  if (!r.slot1Same || !r.toneSame) fail(`a refused write changed bytes (slot 1 kept ${r.slot1Same}, tone kept ${r.toneSame})`);
  if (r.writesAfterLatch.length) fail(`save keys were still tried after the refusal was learned: ${r.writesAfterLatch.join(", ")}`);
  if (!r.left || r.after.resume || r.after.chip !== NOTICE || r.after.savedRunsDisabled || r.after.savedRunsDescribedBy !== "title-save-chip") fail(`the title after the unsaved run: ${JSON.stringify(r.after)}`);
  const a1 = r.slot1Actions;
  if (!a1.load.shown || !a1.load.disabled || a1.load.describedBy !== "export-import-chip" || !a1.importSave.disabled || a1.chip !== NOTICE) fail(`Saved runs: Load and Import are not disabled with the reason (${JSON.stringify(a1)})`);
  if (!a1.exportSave.shown || a1.exportSave.disabled || !r.exportExact) fail(`Saved runs: Export is not available with the slot's exact bytes (${JSON.stringify(a1.exportSave)}, exact ${r.exportExact})`);
  if (r.loaded !== false || !r.stillTitle) fail("Saved runs: Load loaded a run with saving off");
  if (!r.slot2Actions.download.shown || r.slot2Actions.download.disabled || !r.downloadExact) fail(`Saved runs: Download unreadable is not available (${JSON.stringify(r.slot2Actions)}, exact ${r.downloadExact})`);
  if (r.newRunConfirm || !r.newRunCommander) fail(`New run asked to replace a slot with saving off (confirm ${r.newRunConfirm}, commander ${r.newRunCommander})`);
  if (!r.slot1StillSame) fail("slot 1 changed");
}

// Reads throw from page load (saving off), then storage comes back mid-run: the unsaved run never
// writes over the older run in slot 1 (review M: before the latch, the next autosave did, with no backup).
function recoveredMidRunCase(errors) {
  const fail = message => errors.push(`B recovered: ${message}`);
  const runtime = loadWithStorage("getItemRecovers");
  const r = evaluate(runtime, `
    __storageCalls.broken = false;
    resetRunState(); state.scene = "act2_tether_sighting"; state.cohesion = 33;
    const raw = JSON.stringify(snapshotState());
    localStorage.setItem(SAVE_KEY, raw);
    __storageCalls.broken = true;
    const before = __storageCalls.set.length;
    acknowledgeTone();
    const o = { title: __title() };
    o.started = __begin();
    o.firstPlay = __play(3);
    __storageCalls.broken = false;
    o.offAfterRecovery = savingIsOff();
    o.secondPlay = __play(3);
    document.visibilityState = "hidden"; document.dispatchEvent({ type: "visibilitychange" }); document.visibilityState = "visible";
    o.bar = __bar();
    o.slot1Same = localStorage.getItem(SAVE_KEY) === raw;
    o.saveWrites = __storageCalls.set.slice(before).filter(k => /^sunsplitter_save/.test(k));
    return o;
  `);
  if (!r.title.off || r.title.chip !== NOTICE) fail(`the title did not say it can't save (${JSON.stringify(r.title)})`);
  if (!r.started || r.firstPlay.threw || r.secondPlay.threw || r.secondPlay.made < 3) fail(`the run did not play through the recovery (${JSON.stringify([r.firstPlay.made, r.secondPlay.made, r.firstPlay.threw, r.secondPlay.threw])})`);
  if (!r.offAfterRecovery || r.bar.text !== NOTICE) fail(`saving came back on mid-run (off ${r.offAfterRecovery}, bar "${r.bar.text}")`);
  if (!r.slot1Same || r.saveWrites.length) fail(`the unsaved run wrote save keys after storage came back: ${JSON.stringify(r.saveWrites)} (slot 1 kept ${r.slot1Same})`);
}

// One read fails at the moment of a new run on a device that saves: not saving off. The run keeps
// today's rule, and the title shows the ordinary failure line, not the can't-save line (review L1).
function oneFailedReadCase(errors) {
  const fail = message => errors.push(`B one failed read: ${message}`);
  const runtime = loadWithStorage("working", { [TONE_KEY]: "1" });
  const r = evaluate(runtime, `
    resetRunState(); state.scene = "act2_tether_sighting"; state.cohesion = 33;
    const raw = JSON.stringify(snapshotState());
    localStorage.setItem(SAVE_KEY, raw);
    showTitleScreen();
    window.confirm = () => true;
    startGame();
    if (__shown("new-run-confirm")) {
      if (typeof selectNewRunSlot === "function" && document.getElementById("new-run-slot-1")) selectNewRunSlot(1);
      confirmNewRun();
    }
    const real = saveStorageReadable;
    let once = true;
    saveStorageReadable = () => { if (once) { once = false; return false; } return real(); };
    const started = advancePastCommanderCreate();
    saveStorageReadable = real;
    return { started, title: __shown("title-screen"), off: savingIsOff(), status: __text("title-save-status"), bar: __bar().text,
      slot1Same: localStorage.getItem(SAVE_KEY) === raw, resume: __shown("btn-resume"), scene: state.scene };
  `);
  if (r.started || !r.title || r.off || r.scene !== "act2_tether_sighting" || !r.slot1Same || !r.resume) fail(`the failed read changed the run, the slot or the title (${JSON.stringify(r)})`);
  if (r.status === NOTICE || r.bar === NOTICE || !/^Autosave failed · /.test(r.status)) fail(`the title shows "${r.status}" (bar "${r.bar}"), not the ordinary failure line`);
}

// A one-off failed write (only the staging key throws) is not blocked storage: today's rule holds.
function oneOffFailureCase(errors) {
  const fail = message => errors.push(`B one-off: ${message}`);
  const runtime = loadWithStorage("working", { [TONE_KEY]: "1" });
  const r = evaluate(runtime, `
    resetRunState(); state.scene = "act2_tether_sighting"; state.cohesion = 33;
    const raw = JSON.stringify(snapshotState());
    localStorage.setItem(SAVE_KEY, raw);
    showTitleScreen();
    const realSet = localStorage.setItem;
    localStorage.setItem = (key, value) => { if (key === SAVE_STAGING_KEY) throw new Error("injected one-off failure"); return realSet(key, value); };
    const started = __begin();
    const o = { started, title: __shown("title-screen"), game: __shown("game-screen"), off: savingIsOff(), scene: state.scene, cohesion: state.cohesion,
      slot1Same: localStorage.getItem(SAVE_KEY) === raw, status: __text("title-save-status") };
    localStorage.setItem = realSet;
    o.afterOff = savingIsOff();
    o.retry = __begin();
    o.retryGame = __shown("game-screen");
    o.saved = JSON.parse(localStorage.getItem(SAVE_KEY)).scene;
    return o;
  `);
  if (r.started || !r.title || r.game || r.off) fail(`a one-off failure started a run or turned saving off (${JSON.stringify(r)})`);
  if (r.scene !== "act2_tether_sighting" || r.cohesion !== 33 || !r.slot1Same) fail(`the current run or slot 1 changed (${JSON.stringify(r)})`);
  // Today's message: slot 1 held a run, so the prior slot is kept.
  if (r.status !== "Autosave failed · prior slot kept") fail(`the title says "${r.status}" after the one-off failure`);
  if (r.afterOff || !r.retry || !r.retryGame || r.saved !== "wake") fail(`after the failure cleared a saved run did not start (${JSON.stringify(r)})`);
}

// Storage that works: nothing changes on the title, in the Menu or in saving.
function workingCase(errors) {
  const fail = message => errors.push(`B working: ${message}`);
  const runtime = loadWithStorage("working");
  const r = evaluate(runtime, `
    acknowledgeTone();
    const o = { title: __title() };
    o.started = __begin();
    o.play = __play(3);
    o.saved = !!localStorage.getItem(SAVE_KEY);
    openMenuSheet();
    o.menu = { save: document.getElementById("menu-save").disabled, load: document.getElementById("menu-load").disabled,
      saveDescribedBy: __attr("menu-save", "aria-describedby"), chip: __text("menu-return-title-chip") };
    o.left = menuReturnToTitle();
    o.after = __title();
    return o;
  `);
  if (r.title.off || r.title.savedRunsDisabled || r.title.savedRunsDescribedBy !== null || r.title.chipShown) fail(`the title changed with storage working (${JSON.stringify(r.title)})`);
  if (!r.started || r.play.threw || r.play.made < 3 || !r.saved) fail(`a saved run did not start and save (${JSON.stringify(r.play)})`);
  if (r.play.bars.some(bar => bar.text === NOTICE)) fail("the saving-off line showed with storage working");
  if (r.menu.save || r.menu.load || r.menu.saveDescribedBy !== null || r.menu.chip !== "Saves first · Continue on the title picks up here") fail(`the Menu changed with storage working (${JSON.stringify(r.menu)})`);
  if (!r.left || !r.after.resume || r.after.off || r.after.chip === NOTICE) fail(`Return to title did not save and offer Continue (${JSON.stringify(r.after)})`);
}

function vmChecks(errors, summary) {
  const results = [];
  for (const mode of BLOCKED_MODES) {
    const result = blockedModeCase(mode, errors);
    if (result) results.push(`${mode} ${result.choices}`);
  }
  for (const [label, run] of [["returning", returningRefusedCase], ["recovered", recoveredMidRunCase], ["one failed read", oneFailedReadCase],
    ["one-off", oneOffFailureCase], ["working", workingCase]]) {
    try { run(errors); } catch (error) { errors.push(`B ${label}: threw: ${String(error && error.message).split("\n")[0]}`); }
  }
  summary.push(`A: ${BLOCKED_MODES.length} blocked modes from page load (choices played: ${results.join(", ")}); title, Menu, Return to title, second run, settings, memory, no save-key write`);
  summary.push("B: returning player with writes refused plays unsaved, keeps slot 1, and gets read-only Saved runs (Export and Download work) and a New run that asks nothing; storage back mid-run writes nothing; one failed read and a one-off failed write keep today's rule; working storage unchanged");
}

// ---------- C: Chromium ----------

const VIEWPORTS = [[360, 640], [390, 844], [844, 390], [1440, 900]];
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".jpg": "image/jpeg", ".png": "image/png",
  ".json": "application/json", ".svg": "image/svg+xml", ".webp": "image/webp", ".woff2": "font/woff2" };

async function loadPlaywright() {
  const candidates = [];
  if (process.env.SUNSPLITTER_PLAYWRIGHT_MODULE) candidates.push(pathToFileURL(resolve(process.env.SUNSPLITTER_PLAYWRIGHT_MODULE)).href);
  candidates.push("playwright");
  try {
    const globalRoot = execSync("npm root -g", { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
    candidates.push(pathToFileURL(createRequire(join(globalRoot, "x")).resolve("playwright")).href);
  } catch { /* no global npm */ }
  for (const candidate of candidates) {
    try { const mod = await import(candidate); return mod.default || mod; } catch { /* next */ }
  }
  return null;
}

// Init scripts (serialized by Playwright, so they use nothing from this module).
function blockAccess() {
  Object.defineProperty(window, "localStorage", { configurable: true, get() { throw new DOMException("The operation is insecure.", "SecurityError"); } });
}
function refuseWrites() {
  Storage.prototype.setItem = function () { throw new DOMException("The quota has been exceeded.", "QuotaExceededError"); };
}

// In the page: what the player sees of the save line, the title and the bar.
const VIEW = () => {
  const rect = el => { if (!el || !el.getClientRects().length) return null; const b = el.getBoundingClientRect(); return { x: b.left, y: b.top, w: b.width, h: b.height, r: b.right, b: b.bottom }; };
  const shown = id => { const el = document.getElementById(id); return !!el && !el.classList.contains("hidden") && el.getClientRects().length > 0; };
  const bar = document.getElementById("save-status");
  const actions = document.querySelector("#meta .meta-actions");
  const barRect = rect(bar);
  const hit = barRect ? document.elementFromPoint(barRect.x + barRect.w / 2, barRect.y + barRect.h / 2) : null;
  return {
    vw: document.documentElement.clientWidth, vh: window.innerHeight,
    overflowX: Math.max(document.documentElement.scrollWidth - document.documentElement.clientWidth, document.body.scrollWidth - document.body.clientWidth),
    screen: ["tone-screen", "title-screen", "cinematic-screen", "game-screen", "ending-screen", "what-remains-screen"].find(shown) || "none",
    tutorial: shown("tutorial-overlay"), scene: typeof state !== "undefined" ? state.scene : null,
    revision: typeof choiceRenderRevision !== "undefined" ? choiceRenderRevision : null,
    chip: (document.getElementById("title-save-chip") || {}).textContent || "", chipRect: rect(document.getElementById("title-save-chip")),
    beginRect: rect(document.getElementById("btn-begin")), begin: (document.getElementById("btn-begin") || {}).textContent || "",
    resume: shown("btn-resume"), savedRunsDisabled: !!(document.getElementById("btn-saved-runs") || {}).disabled,
    bar: bar ? bar.textContent : "", barVisible: !!bar && bar.classList.contains("visible"), barRect,
    barClipped: !!bar && bar.scrollWidth > bar.clientWidth + 1,
    // The line takes no pointer events, so a hit test lands on the bar behind it; anything else covers it.
    barCovered: !!barRect && (!hit || !hit.closest("#meta") || !!hit.closest("button")),
    menuRect: rect(document.getElementById("btn-menu")),
    barOverActions: !!(barRect && actions && (() => { const a = actions.getBoundingClientRect(); return barRect.r > a.left + 0.5 && barRect.x < a.right - 0.5 && barRect.b > a.top + 0.5 && barRect.y < a.bottom - 0.5; })()),
    metaOverflow: (() => { const m = document.getElementById("meta"); return m ? m.scrollWidth - m.clientWidth : 0; })(),
    enabled: [...document.querySelectorAll("#choices .choice-btn")].map((b, i) => (!b.disabled ? i : -1)).filter(i => i >= 0),
    menuSave: !!(document.getElementById("menu-save") || {}).disabled, menuLoad: !!(document.getElementById("menu-load") || {}).disabled,
    menuChip: (document.getElementById("menu-return-title-chip") || {}).textContent || ""
  };
};

function insideViewport(r, v) {
  return !!r && r.x >= -0.5 && r.y >= -0.5 && r.r <= v.vw + 0.5 && r.b <= v.vh + 0.5;
}

// Tone, title, Begin, the Commander panel, the intro and the first-run tutorial, to the first scene.
async function startRun(page, fail) {
  await page.waitForFunction(() => { const t = document.getElementById("tone-screen"); return t && !t.classList.contains("hidden"); }, null, { timeout: 15_000 });
  await page.click("#tone-screen .btn-primary");
  await page.waitForFunction(() => !document.getElementById("title-screen").classList.contains("hidden"));
  const title = await page.evaluate(VIEW);
  await page.click("#btn-begin");
  await page.waitForFunction(() => document.getElementById("commander-create").classList.contains("visible"));
  await page.click("#commander-create-ok");
  await page.waitForFunction(() => !document.getElementById("cinematic-screen").classList.contains("hidden") || !document.getElementById("game-screen").classList.contains("hidden"));
  if (await page.evaluate(() => !document.getElementById("cinematic-screen").classList.contains("hidden"))) await page.click("#cinematic-skip");
  await page.waitForFunction(() => !document.getElementById("game-screen").classList.contains("hidden"));
  if (await page.evaluate(() => !document.getElementById("tutorial-overlay").classList.contains("hidden"))) await page.click("#tutorial-dismiss");
  await page.waitForFunction(() => document.querySelectorAll("#choices .choice-btn").length > 0, null, { timeout: 5_000 }).catch(() => fail("no choices on the first scene"));
  return title;
}

// readable: writes refused but saves can still be read, so Saved runs stays enabled (read-only).
function checkTitle(view, fail, readable = false) {
  if (view.chip !== NOTICE) fail(`the title chip reads "${view.chip}"`);
  if (!view.chipRect) fail("the title chip is not shown");
  if (view.resume) fail("Continue is shown");
  if (view.savedRunsDisabled === readable) fail(`Saved runs is ${view.savedRunsDisabled ? "disabled" : "enabled"}; want ${readable ? "enabled read-only" : "disabled"}`);
  if (view.begin !== "Begin") fail(`the start button reads "${view.begin}"`);
  if (view.overflowX > 0) fail(`the title scrolls sideways (${view.overflowX}px)`);
  if (view.chipRect && view.beginRect && view.chipRect.b > view.beginRect.y + 1) fail("the chip is not above Begin");
  if (view.chipRect && (view.chipRect.x < -0.5 || view.chipRect.r > view.vw + 0.5)) fail("the chip spills out sideways");
}

function checkBar(view, fail, where) {
  if (view.bar !== NOTICE || !view.barVisible) fail(`${where}: the bar reads "${view.bar}" (visible ${view.barVisible})`);
  else if (!insideViewport(view.barRect, view)) fail(`${where}: the bar line is outside the viewport ${JSON.stringify(view.barRect)}`);
  else if (view.barClipped || view.barCovered || view.barOverActions) fail(`${where}: the bar line is clipped/covered/over the buttons (${view.barClipped}/${view.barCovered}/${view.barOverActions})`);
  if (view.overflowX > 0 || view.metaOverflow > 0) fail(`${where}: sideways scroll (page ${view.overflowX}px, bar ${view.metaOverflow}px)`);
  if (!insideViewport(view.menuRect, view)) fail(`${where}: the Menu button is not on screen ${JSON.stringify(view.menuRect)}`);
}

async function browserChecks(errors, summary, requireBrowser) {
  const pw = await loadPlaywright();
  if (!pw) {
    const line = "C: NOT_AVAILABLE — Playwright is not installed here (CI has no browser); run this file where it is";
    if (requireBrowser) errors.push(line); else summary.push(line);
    return false;
  }
  const server = createServer(async (req, res) => {
    const path = resolve(ROOT, "." + decodeURIComponent(new URL(req.url, "http://x").pathname));
    if (!path.startsWith(ROOT + sep)) { res.writeHead(403); return res.end(); }
    try { const body = await readFile(path); res.writeHead(200, { "content-type": TYPES[extname(path)] || "application/octet-stream" }); res.end(body); }
    catch { res.writeHead(404); res.end(); }
  });
  await new Promise(done => server.listen(0, "127.0.0.1", done));
  const url = `http://127.0.0.1:${server.address().port}/index.html`;
  let browser;
  try {
    browser = await pw.chromium.launch({ executablePath: process.env.CHROMIUM_PATH, args: ["--no-sandbox"] });
  } catch (error) {
    server.close();
    const line = `C: NOT_AVAILABLE — Chromium did not launch (${String(error && error.message).split("\n")[0].slice(0, 120)})`;
    if (requireBrowser) errors.push(line); else summary.push(line);
    return false;
  }
  const shots = process.env.BLOCKED_STORAGE_SHOTS ? resolve(process.env.BLOCKED_STORAGE_SHOTS) : null;
  if (shots) mkdirSync(shots, { recursive: true });
  const newPage = async (width, height, init) => {
    const context = await browser.newContext({ viewport: { width, height }, reducedMotion: "reduce" });
    const page = await context.newPage();
    const pageErrors = [];
    page.on("pageerror", e => pageErrors.push(String(e.message).slice(0, 160)));
    await page.addInitScript(init);
    await page.goto(url);
    return { context, page, pageErrors };
  };
  let played = 0;
  try {
    // 1. Access throws: 30 choices, the Menu, Return to title.
    {
      const fail = message => errors.push(`C access 390x844: ${message}`);
      const { context, page, pageErrors } = await newPage(390, 844, blockAccess);
      const title = await startRun(page, fail);
      checkTitle(title, fail);
      checkBar(await page.evaluate(VIEW), fail, "first scene");
      let seed = 20261126;
      const rnd = () => { seed = (Math.imul(seed, 1103515245) + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
      for (let step = 0; step < 200 && played < CHOICES; step++) {
        const view = await page.evaluate(VIEW);
        if (view.screen !== "game-screen") { fail(`left the game on ${view.scene} (${view.screen}) after ${played} choices`); break; }
        if (view.tutorial) { await page.click("#tutorial-dismiss"); continue; }
        if (await page.evaluate(() => !document.getElementById("reveal-controls").classList.contains("hidden"))) {
          await page.click("#reveal-all");
          await page.waitForTimeout(420); // the engine's settle guard after a reveal
          continue;
        }
        if (!view.enabled.length) { fail(`no enabled choice on ${view.scene}`); break; }
        const pick = view.enabled[Math.floor(rnd() * view.enabled.length)];
        await page.locator("#choices .choice-btn").nth(pick).click({ timeout: 3000 });
        await page.waitForFunction(rev => typeof choiceRenderRevision !== "undefined" && choiceRenderRevision !== rev, view.revision, { timeout: 5000 })
          .catch(() => fail(`choice ${pick} on ${view.scene} did not render a new screen`));
        played++;
        await page.waitForTimeout(450); // the engine's double-click guard between pointer commits
        const after = await page.evaluate(VIEW);
        if (after.screen === "game-screen") checkBar(after, fail, `after choice ${played} (${after.scene})`);
      }
      if (played < CHOICES) fail(`only ${played} of ${CHOICES} choices played`);
      await page.click("#btn-menu");
      await page.waitForFunction(() => document.getElementById("menu-sheet").classList.contains("visible"));
      const menu = await page.evaluate(VIEW);
      if (!menu.menuSave || !menu.menuLoad) fail(`Menu: Save/Load disabled = ${menu.menuSave}/${menu.menuLoad}`);
      if (menu.menuChip !== MENU_CHIP) fail(`Menu: the line reads "${menu.menuChip}"`);
      let asked = "";
      page.once("dialog", dialog => { asked = dialog.message(); dialog.accept(); });
      await page.click("#menu-return-title");
      await page.waitForFunction(() => !document.getElementById("title-screen").classList.contains("hidden"), null, { timeout: 5000 }).catch(() => fail("Return to title did not reach the title"));
      if (!QUESTION_RE.test(asked)) fail(`Return to title asked "${asked}"`);
      checkTitle(await page.evaluate(VIEW), fail);
      if (pageErrors.length) fail(`page errors: ${pageErrors.join(" | ")}`);
      await context.close();
    }
    // 2. Writes refused (setItem throws): learned from the content notice's write.
    {
      const fail = message => errors.push(`C setItem 390x844: ${message}`);
      const { context, page, pageErrors } = await newPage(390, 844, refuseWrites);
      checkTitle(await startRun(page, fail), fail, true);
      checkBar(await page.evaluate(VIEW), fail, "first scene");
      if (pageErrors.length) fail(`page errors: ${pageErrors.join(" | ")}`);
      await context.close();
    }
    // 3. The four sizes: the title and the first game screen.
    for (const [width, height] of VIEWPORTS) {
      const name = `${width}x${height}`;
      const fail = message => errors.push(`C ${name}: ${message}`);
      const { context, page, pageErrors } = await newPage(width, height, blockAccess);
      await page.waitForFunction(() => { const t = document.getElementById("tone-screen"); return t && !t.classList.contains("hidden"); });
      await page.click("#tone-screen .btn-primary");
      await page.waitForFunction(() => !document.getElementById("title-screen").classList.contains("hidden"));
      if (shots) await page.screenshot({ path: join(shots, `title-${name}.png`) });
      const title = await page.evaluate(VIEW);
      checkTitle(title, fail);
      await page.click("#btn-begin");
      await page.waitForFunction(() => document.getElementById("commander-create").classList.contains("visible"));
      await page.click("#commander-create-ok");
      await page.waitForFunction(() => !document.getElementById("cinematic-screen").classList.contains("hidden") || !document.getElementById("game-screen").classList.contains("hidden"));
      if (await page.evaluate(() => !document.getElementById("cinematic-screen").classList.contains("hidden"))) await page.click("#cinematic-skip");
      await page.waitForFunction(() => !document.getElementById("game-screen").classList.contains("hidden"));
      if (await page.evaluate(() => !document.getElementById("tutorial-overlay").classList.contains("hidden"))) await page.click("#tutorial-dismiss");
      await page.waitForTimeout(200);
      if (shots) await page.screenshot({ path: join(shots, `game-${name}.png`) });
      const game = await page.evaluate(VIEW);
      checkBar(game, fail, "first scene");
      summary.push(`C ${name}: title chip y=${title.chipRect ? Math.round(title.chipRect.y) : "-"} h=${title.chipRect ? Math.round(title.chipRect.h) : "-"}, Begin y=${title.beginRect ? Math.round(title.beginRect.y) : "-"}; bar line ${game.barRect ? `${Math.round(game.barRect.x)},${Math.round(game.barRect.y)} ${Math.round(game.barRect.w)}x${Math.round(game.barRect.h)}` : "-"}`);
      if (pageErrors.length) fail(`page errors: ${pageErrors.join(" | ")}`);
      await context.close();
    }
  } finally {
    await browser.close();
    server.close();
  }
  summary.push(`C: Chromium, localStorage throwing on access: ${played} choices, no page error, the line on screen after each; Menu and Return to title; setItem refused; ${VIEWPORTS.length} sizes`);
  return true;
}

export async function sunPlayerflowBlockedStorageChecks({ requireBrowser = false, browser = true } = {}) {
  const errors = [];
  const summary = [];
  vmChecks(errors, summary);
  const ran = browser ? await browserChecks(errors, summary, requireBrowser) : false;
  return { errors, summary, ran };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { errors, summary, ran } = await sunPlayerflowBlockedStorageChecks({
    requireBrowser: process.argv.includes("--require-browser"),
    browser: !process.argv.includes("--vm-only")
  });
  for (const line of summary) console.log("  " + line);
  if (errors.length) {
    for (const error of errors) console.error("FAIL " + error);
    console.error(`FAIL sun-playerflow-blocked-storage (${errors.length} problem(s))`);
    process.exit(1);
  }
  console.log(ran
    ? "PASS sun-playerflow-blocked-storage (vm: six blocked modes, returning player with read-only Saved runs, recovery mid-run, one failed read, one-off failure, working storage; Chromium: 30 choices with storage blocked, Menu, four sizes)"
    : "PASS sun-playerflow-blocked-storage (vm: six blocked modes, returning player with read-only Saved runs, recovery mid-run, one failed read, one-off failure, working storage; browser NOT_AVAILABLE)");
}
