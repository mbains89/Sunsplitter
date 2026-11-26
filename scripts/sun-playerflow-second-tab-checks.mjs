// SUN-SECOND-TAB-GUARD-01 (L-052, Wave 2 design S-5) — the game open in two tabs.
//
// Two tabs share one localStorage. Each autosaves after every choice and when it is hidden, so
// before this guard a tab could silently write over a newer run another tab had saved in the same
// slot. Now a tab that sees another tab's run in its slot stops saving there and says so; a Load, a
// Continue or a new run in that slot gives it back. Nothing is deleted and no storage key is added.
//
// Part 1, two engine realms (runs everywhere, CI included): two copies of the engine share one store,
// and a write in one queues a storage event for the other, delivered after the writing call returns,
// as a browser does. Checks:
//   - same slot: the tab whose save is older never writes over the newer save (autosave after a
//     choice, the hidden-tab save, Save, a cancelled Return to title), shows the notice, keeps playing,
//     and Load gives the slot back; then the other tab is the one told;
//   - Return to title while not saving asks first, then leaves without saving; the other tab's save
//     stays, and Continue loads it;
//   - the same, before the storage event has arrived (the check before each write catches it);
//   - another tab saving the same moment of the same run (only the time differs) is no alarm;
//   - a new run in the slot takes it back on purpose;
//   - different slots never interfere, and neither tab's autosave moves the Continue pointer;
//   - a title screen follows the other tab's saves (Continue appears) and never writes;
//   - a run this tab no longer saves records no ship-memory trail under that slot;
//   - a newer version's save in this tab's slot (a scene this build does not know, or a v:99 save)
//     is never written over, with or without the event, and says so; a slot another tab emptied
//     (its Delete, SUN-DELETE-SLOT-01) is not written back until the Menu's Save; a cleared store stays free;
//   - Play Again in a taken slot clears no ship-memory trail; Return to title from the tab's own run
//     points Continue at its slot, and leaving a taken slot does not;
//   - New run on the title: another slot's save leaves it open; a save in the slot it would replace
//     closes it and says so; Begin run re-checks that slot when no event arrived;
//   - a single tab: 200 seeded choices with real saves (and a hidden-tab save every 20) never
//     raise the notice, and every choice is saved.
// Part 2, Chromium through Playwright: two pages in one browser context (one localStorage, real
// storage events), driven through the title's Begin and Continue, the Menu's Save, Load and Return to
// title, and the engine's
// own makeChoice: the same-slot, different-slot, pointer, newer-version and New run cases, the notice
// in the bar at 360x640, 844x390 and 1280x800, and a single page's 200 seeded choices. When Playwright or Chromium is
// missing (CI has no browser) part 2 prints NOT_AVAILABLE and part 1 still decides; pass
// --require-browser to fail instead.
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { execSync } from "node:child_process";
import { createRequire } from "node:module";
import { dirname, extname, join, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { loadGame } from "./simulate.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SLOT1 = ["sunsplitter_save_v3", "sunsplitter_save_v3_staging", "sunsplitter_save_v3_backup", "sunsplitter_save_v2"];
const SLOT2 = ["sunsplitter_save_v3_slot2", "sunsplitter_save_v3_slot2_staging", "sunsplitter_save_v3_slot2_backup"];
const SLOT3 = ["sunsplitter_save_v3_slot3", "sunsplitter_save_v3_slot3_staging", "sunsplitter_save_v3_slot3_backup"];
const POINTER = "sunsplitter_save_current_v1";
const SAVE_KEYS = [...SLOT1, ...SLOT2, ...SLOT3, POINTER];
const NOTICE = slot => `Another tab saved Slot ${slot} · not saving here · Load in Menu`;
const LEAVE = slot => `Another tab saved Slot ${slot} · this tab's run is not saved · Return to title anyway?`;
const NEWER = slot => `A newer version saved Slot ${slot} · not saving here · reopen the game to play it`;
const CHIP_TAKEN = slot => `Does not save · Slot ${slot} keeps the other tab's run`;
const CHANGED = slot => `Slot ${slot} changed in another tab · this new run did not start`;
// A save from a newer build: valid JSON with a scene this build does not know, so it reads as unreadable.
const newerBuildSave = raw => { const data = JSON.parse(raw); data.scene = "a_scene_from_a_newer_build"; data.savedAt += 1000; return JSON.stringify(data); };
// A save in a newer format (v above this build's SAVE_SCHEMA_VERSION 3) on a scene this build knows.
// Once SUN-SAVE-VERSION-GUARD-01 (#605) lands this build cannot read it; before that it reads as a
// different run. Either way the tab must never write over it.
const newerFormatSave = raw => { const data = JSON.parse(raw); data.v = 99; data.savedAt += 1000; return JSON.stringify(data); };
const SINGLE_TAB_CHOICES = 200;

const errors = [];
const notes = [];
const fail = message => errors.push(message);
const expect = (ok, message) => { if (!ok) fail(message); return ok; };

// In each realm: a seeded picker over the choices a player could press, one choice step (an ending
// starts the next run the way Play Again does, without its cinematic), and a quick read of the bar.
const TAB_HELPERS = seed => `(() => {
  const choicesEl = document.getElementById("choices");
  if (choicesEl && !choicesEl.__clearsOnInnerHTML) {
    let html = choicesEl.innerHTML;
    Object.defineProperty(choicesEl, "innerHTML", { configurable: true, get: () => html, set: value => { html = String(value); choicesEl.children.length = 0; } });
    choicesEl.__clearsOnInnerHTML = true;
  }
  let seed = ${seed};
  const rnd = () => { seed = (Math.imul(seed, 1103515245) + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  const enabled = c => c && (!c.alive || isAlive(c.alive)) && (!c.aliveAll || c.aliveAll.every(k => isAlive(k))) &&
    (!c.aliveAny || c.aliveAny.some(k => isAlive(k))) && (!c.requires || meetsRequirements(c.requires)) &&
    (!c.effects || canAffordEffects(c.effects));
  globalThis.__tabStep = () => {
    if (state.scene === "ending_check" || !scenes[state.scene]) {
      if (!beginFreshCampaign({ persist: false, preserveCompletedSlotUntilChoice: true })) return "replay-failed";
    }
    const scene = scenes[state.scene];
    const list = ((typeof scene.choices === "function" ? scene.choices() : scene.choices) || []).filter(enabled);
    if (!list.length) return "stuck:" + state.scene;
    makeChoice(list[Math.floor(rnd() * list.length)]);
    return state.scene;
  };
  globalThis.__tabBar = () => {
    const el = document.getElementById("save-status");
    return { text: el ? String(el.textContent || "") : "", visible: !!el && el.classList.contains("visible"), error: !!el && el.classList.contains("error") };
  };
  return true;
})()`;

function newTab(seed) {
  const tab = loadGame(ROOT);
  tab.evaluate(TAB_HELPERS(seed));
  return tab;
}

// Two or more realms on one store. Each write posts a storage event to the other realms; deliver()
// dispatches them later, as the browser does once the writing task ends. writes counts each realm's writes.
function shareStorage(tabs) {
  const store = tabs[0].browser.localStorage;
  const base = { getItem: store.getItem, setItem: store.setItem, removeItem: store.removeItem, clear: store.clear };
  const queues = new Map(tabs.map(tab => [tab, []]));
  const writes = new Map(tabs.map(tab => [tab, []]));
  for (const tab of tabs) {
    const area = tab.browser.localStorage;
    const others = tabs.filter(other => other !== tab);
    const post = (key, oldValue, newValue) => {
      if (oldValue === newValue) return;
      writes.get(tab).push(key);
      for (const other of others) queues.get(other).push({ type: "storage", key, oldValue, newValue, url: "http://localhost/", storageArea: other.browser.localStorage });
    };
    area.getItem = base.getItem;
    area.setItem = (key, value) => { const old = base.getItem(key); base.setItem(key, value); post(key, old, base.getItem(key)); };
    area.removeItem = key => { const old = base.getItem(key); base.removeItem(key); post(key, old, null); };
    area.clear = () => { base.clear(); for (const other of others) queues.get(other).push({ type: "storage", key: null, oldValue: null, newValue: null, url: "http://localhost/", storageArea: other.browser.localStorage }); };
  }
  return {
    get: key => base.getItem(key),
    keys: list => Object.fromEntries(list.map(key => [key, base.getItem(key)])),
    deliver(...targets) { for (const tab of targets.length ? targets : tabs) { const queue = queues.get(tab); while (queue.length) tab.browser.window.dispatchEvent(queue.shift()); } },
    drop(tab) { queues.get(tab).length = 0; },
    writes: tab => writes.get(tab).slice(),
    clearWrites() { for (const list of writes.values()) list.length = 0; },
    reset() { base.clear(); for (const queue of queues.values()) queue.length = 0; for (const list of writes.values()) list.length = 0; }
  };
}

const bar = tab => tab.evaluate("__tabBar()");
const step = tab => tab.evaluate("__tabStep()");
const scene = tab => tab.evaluate("state.scene");
const seen = (tab, slot) => tab.evaluate(`Object.prototype.hasOwnProperty.call(saveSlotSeen, ${slot}) ? saveSlotSeen[${slot}] : undefined`);
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const showsNotice = (tab, slot) => { const b = bar(tab); return b.text === NOTICE(slot) && b.visible && b.error; };

function realmChecks() {
  const A = newTab(101);
  const B = newTab(202);
  const store = shareStorage([A, B]);
  store.reset();
  let label = "same slot";

  // B waits on the title with nothing saved; A starts a run in slot 1. B's title follows without a reload.
  B.evaluate("showTitleScreen()");
  expect(B.evaluate(`document.getElementById("btn-resume").classList.contains("hidden")`), `${label}: B's title shows Continue before any save`);
  expect(A.evaluate("beginFreshCampaign({ persist: true, slot: 1 })") === true, `${label}: A's new run in slot 1 failed`);
  for (let i = 0; i < 3; i++) { step(A); store.deliver(B); }
  expect(!B.evaluate(`document.getElementById("btn-resume").classList.contains("hidden")`), `title: B's Continue did not appear after A saved slot 1`);
  expect(B.evaluate(`document.getElementById("btn-begin").textContent`) === "New run", "title: B's Begin did not become New run after A saved slot 1");
  expect(store.writes(B).length === 0, `title: the tab on the title wrote ${store.writes(B).join(", ")}`);
  expect(store.get(POINTER) === "1", `${label}: pointer is ${store.get(POINTER)} after A's new run, expected 1`);

  // B continues slot 1 (A's newest save) and plays on: B now holds the newer save.
  expect(B.evaluate("resumeGame()") === true, `${label}: B's Continue failed`);
  store.deliver(A);
  expect(!showsNotice(A, 1), `${label}: A was told before B saved anything new`);
  for (let i = 0; i < 2; i++) { step(B); store.deliver(A); }
  const newer = store.keys(SLOT1);
  expect(newer.sunsplitter_save_v3 === seen(B, 1), `${label}: slot 1 does not hold B's last save`);
  expect(showsNotice(A, 1), `${label}: A shows ${JSON.stringify(bar(A))}, expected the notice at once`);
  expect(A.evaluate("runTrailSaveSlot()") === null && B.evaluate("runTrailSaveSlot()") === 1, `${label}: ship-memory trail slot is ${A.evaluate("runTrailSaveSlot()")} in A and ${B.evaluate("runTrailSaveSlot()")} in B`);

  // A keeps playing: its choice, its hidden-tab save and its Save button all leave B's save alone.
  store.clearWrites();
  const aBefore = scene(A);
  const stepped = step(A);
  store.deliver(B);
  expect(stepped !== aBefore || stepped === "ending_check", `${label}: A could not keep playing (${aBefore} -> ${stepped})`);
  expect(same(store.keys(SLOT1), newer), `${label}: A's choice changed slot 1`);
  A.browser.window.dispatchEvent({ type: "pagehide" });
  expect(same(store.keys(SLOT1), newer), `${label}: A's hidden-tab save changed slot 1`);
  expect(A.evaluate("saveGame()") === false, `${label}: A's Save button reported a save`);
  expect(same(store.keys(SLOT1), newer), `${label}: A's Save button changed slot 1`);
  // Return to title asks first; Cancel keeps A in the run, and nothing is written.
  A.evaluate(`globalThis.__asked = []; window.confirm = message => { __asked.push(message); return false; }`);
  expect(A.evaluate("menuReturnToTitle()") === false && A.evaluate(`document.getElementById("title-screen").classList.contains("hidden")`),
    `${label}: A's Return to title, cancelled, left the run`);
  expect(same(A.evaluate("__asked"), [LEAVE(1)]), `${label}: Return to title asked ${JSON.stringify(A.evaluate("__asked"))}`);
  expect(same(store.keys(SLOT1), newer), `${label}: A's cancelled Return to title changed slot 1`);
  A.evaluate("window.confirm = () => true");
  A.evaluate("openMenuSheet()");
  const takenChip = A.evaluate(`document.getElementById("menu-return-title-chip").textContent`);
  A.evaluate("closeMenuSheet()");
  expect(takenChip === CHIP_TAKEN(1), `${label}: the Menu's Return to title chip reads "${takenChip}"`);
  expect(showsNotice(A, 1), `${label}: A's notice did not stay after its refused saves`);
  expect(store.get(POINTER) === "1", `${label}: pointer moved to ${store.get(POINTER)}`);
  expect(!showsNotice(B, 1) && !bar(B).error, `${label}: B, the newer tab, shows ${JSON.stringify(bar(B))}`);
  const aSaveWrites = store.writes(A).filter(key => SAVE_KEYS.includes(key));
  expect(!aSaveWrites.length, `${label}: A, told, still wrote ${aSaveWrites.join(", ")}`);

  // Load in A picks up B's save, and A holds the slot again; now B is the one told.
  expect(A.evaluate("loadGame()") === true, `${label}: A's Load failed`);
  expect(scene(A) === scene(B), `${label}: A's Load landed on ${scene(A)}, B is on ${scene(B)}`);
  expect(!showsNotice(A, 1), `${label}: A still shows the notice after Load`);
  store.deliver(B);
  step(A);
  store.deliver(B);
  expect(store.get("sunsplitter_save_v3") === seen(A, 1), `${label}: A's choice after Load was not saved`);
  expect(showsNotice(B, 1), `${label}: B was not told after A's Load and choice`);
  const aNewer = store.keys(SLOT1);
  step(B);
  expect(same(store.keys(SLOT1), aNewer), `${label}: B's choice wrote over A's newer save`);

  // A new run in the slot takes it back on purpose: B starts one, A is told.
  expect(B.evaluate("beginFreshCampaign({ persist: true, slot: 1 })") === true, `${label}: B's new run in slot 1 failed`);
  expect(!showsNotice(B, 1) && !bar(B).error, `${label}: B's notice stayed after its new run (${JSON.stringify(bar(B))})`);
  expect(store.get("sunsplitter_save_v3") === seen(B, 1) && JSON.parse(store.get("sunsplitter_save_v3")).scene === "wake", `${label}: B's new run is not in slot 1`);
  store.deliver(A);
  expect(showsNotice(A, 1), `${label}: A was not told after B's new run in slot 1`);

  // Before the storage event arrives: the check before each write still refuses.
  label = "same slot, no event yet";
  store.reset();
  expect(A.evaluate("beginFreshCampaign({ persist: true, slot: 1 })") === true, `${label}: A's new run failed`);
  step(A);
  store.deliver(B);
  expect(B.evaluate("resumeGame()") === true, `${label}: B's Continue failed`);
  store.deliver(A);
  step(B);
  store.drop(A);
  const bSave = store.keys(SLOT1);
  expect(!showsNotice(A, 1), `${label}: A was told without an event`);
  step(A);
  expect(same(store.keys(SLOT1), bSave), `${label}: A's choice wrote over B's save before the event arrived`);
  expect(showsNotice(A, 1), `${label}: A's refused write did not show the notice`);

  // Return to title while not saving: asked, then leaves without saving; B's save stays and Continue loads it.
  label = "return to title while not saving";
  B.browser.localStorage.setItem(POINTER, "3"); // another tab pointed Continue elsewhere
  store.deliver(A);
  store.clearWrites();
  A.evaluate(`globalThis.__asked = []; window.confirm = message => { __asked.push(message); return true; }`);
  expect(A.evaluate("menuReturnToTitle()") === true, `${label}: A did not leave`);
  expect(same(A.evaluate("__asked"), [LEAVE(1)]), `${label}: asked ${JSON.stringify(A.evaluate("__asked"))}`);
  expect(!A.evaluate(`document.getElementById("title-screen").classList.contains("hidden")`), `${label}: A is not on the title`);
  expect(same(store.keys(SLOT1), bSave), `${label}: leaving changed slot 1`);
  const aLeaveWrites = store.writes(A).filter(key => SAVE_KEYS.includes(key));
  expect(!aLeaveWrites.length, `${label}: A wrote ${aLeaveWrites.join(", ")}`);
  const titleLine = A.evaluate(`document.getElementById("title-save-status").textContent`);
  const barLine = A.evaluate(`document.getElementById("save-status").textContent`);
  expect(titleLine !== NOTICE(1) && barLine !== NOTICE(1), `${label}: the in-run notice stayed after leaving (title "${titleLine}", bar "${barLine}")`);
  expect(store.get(POINTER) === "3", `${label}: leaving without saving moved the pointer to ${store.get(POINTER)}`);
  expect(!A.evaluate(`document.getElementById("btn-resume").classList.contains("hidden")`), `${label}: the title has no Continue`);
  expect(A.evaluate("resumeGame()") === true && scene(A) === scene(B), `${label}: Continue did not load B's save (${scene(A)} vs ${scene(B)})`);
  expect(same(store.keys(SLOT1), bSave) && !bar(A).error, `${label}: Continue changed slot 1 or kept the notice`);
  A.evaluate("window.confirm = () => true");

  // The same moment of the same run, saved again with a new time: no alarm, either way round.
  label = "same run point";
  store.reset();
  expect(A.evaluate("beginFreshCampaign({ persist: true, slot: 1 })") === true, `${label}: A's new run failed`);
  step(A);
  store.deliver(B);
  expect(B.evaluate("resumeGame()") === true, `${label}: B's Continue failed`);
  store.deliver(A);
  B.evaluate("Date.now = (now => () => now() + 90000)(Date.now)");
  B.browser.window.dispatchEvent({ type: "pagehide" });
  const bTime = store.get("sunsplitter_save_v3");
  expect(bTime === seen(B, 1) && JSON.parse(bTime).savedAt !== JSON.parse(seen(A, 1)).savedAt, `${label}: B's hidden-tab save did not write a new time`);
  store.deliver(A);
  expect(!showsNotice(A, 1) && !bar(A).error, `${label}: A was told when only the time changed (${JSON.stringify(bar(A))})`);
  step(A);
  store.deliver(B);
  expect(store.get("sunsplitter_save_v3") === seen(A, 1), `${label}: A's next choice was not saved`);
  expect(showsNotice(B, 1), `${label}: B was not told after A moved the run on`);

  // Different slots: both save, neither is told, and only a new run or a load moves the pointer.
  label = "different slots";
  store.reset();
  expect(A.evaluate("beginFreshCampaign({ persist: true, slot: 1 })") === true, `${label}: A's new run failed`);
  store.deliver(B);
  expect(B.evaluate("beginFreshCampaign({ persist: true, slot: 2 })") === true, `${label}: B's new run in slot 2 failed`);
  store.deliver(A);
  expect(store.get(POINTER) === "2", `${label}: pointer is ${store.get(POINTER)} after B's new run in slot 2`);
  const slot3Before = store.keys(SLOT3);
  store.clearWrites();
  for (let i = 0; i < 6; i++) {
    const slot2Before = store.keys(SLOT2);
    step(A);
    store.deliver(B);
    expect(same(store.keys(SLOT2), slot2Before), `${label}: A's choice ${i + 1} changed slot 2`);
    const slot1Before = store.keys(SLOT1);
    step(B);
    store.deliver(A);
    expect(same(store.keys(SLOT1), slot1Before), `${label}: B's choice ${i + 1} changed slot 1`);
  }
  A.browser.window.dispatchEvent({ type: "pagehide" });
  store.deliver(B);
  expect(store.get("sunsplitter_save_v3") === seen(A, 1), `${label}: slot 1 does not hold A's last save`);
  expect(store.get("sunsplitter_save_v3_slot2") === seen(B, 2), `${label}: slot 2 does not hold B's last save`);
  expect(!bar(A).error && !bar(B).error, `${label}: a tab was told (A ${JSON.stringify(bar(A))}, B ${JSON.stringify(bar(B))})`);
  expect(store.get(POINTER) === "2", `${label}: A's autosaves moved the pointer to ${store.get(POINTER)}`);
  expect(same(store.keys(SLOT3), slot3Before), `${label}: slot 3 changed`);
  const stray = (tab, own) => store.writes(tab).filter(key => SAVE_KEYS.includes(key) && !own.includes(key));
  expect(!stray(A, SLOT1).length, `${label}: A's play wrote ${stray(A, SLOT1).join(", ")}`);
  expect(!stray(B, SLOT2).length, `${label}: B's play wrote ${stray(B, SLOT2).join(", ")}`);
  // Return to title from A's own run saves first and then points Continue at A's slot.
  expect(A.evaluate("menuReturnToTitle()") === true, `${label}: A's Return to title failed`);
  expect(store.get(POINTER) === "1" && store.get("sunsplitter_save_v3") === seen(A, 1), `${label}: after A's Return to title the pointer is ${store.get(POINTER)}, expected 1`);
  store.deliver(B);

  // Ship memory: the trail of a run this tab no longer saves stays out of the slot's record.
  label = "ship memory";
  store.reset();
  expect(A.evaluate("beginFreshCampaign({ persist: true, slot: 1 })") === true, `${label}: A's new run failed`);
  step(A);
  store.deliver(B);
  expect(B.evaluate("resumeGame()") === true, `${label}: B's Continue failed`);
  step(B);
  store.deliver(A);
  expect(showsNotice(A, 1), `${label}: A was not told`);
  const trailBefore = A.evaluate(`JSON.stringify(shipMemoryRead().trail)`);
  A.evaluate(`showScene("act3_lethal_mira_board")`);
  const noted = A.evaluate(`state.scene`) === "act3_lethal_mira_board";
  expect(A.evaluate(`JSON.stringify(shipMemoryRead().trail)`) === trailBefore, `${label}: A's unsaved hard call joined a slot's trail: ${A.evaluate(`JSON.stringify(shipMemoryRead().trail)`)}`);
  B.evaluate(`showScene("act3_lethal_mira_board")`);
  const bTrail = B.evaluate(`JSON.stringify((shipMemoryRead().trail || {})["1"] || [])`);
  if (noted) expect(bTrail.includes("act3_lethal_mira_board"), `${label}: B's own hard call did not join slot 1's trail (${bTrail})`);
  else notes.push(`${label}: act3_lethal_mira_board redirected on entry here; trail compared only`);
  // Play Again in A (the slot is B's now) clears no trail there.
  const trailAfterB = A.evaluate(`JSON.stringify(shipMemoryRead().trail)`);
  expect(A.evaluate("beginFreshCampaign({ persist: false, preserveCompletedSlotUntilChoice: true })") === true, `${label}: A's Play Again failed`);
  expect(A.evaluate(`JSON.stringify(shipMemoryRead().trail)`) === trailAfterB, `${label}: A's Play Again cleared slot 1's trail (${A.evaluate(`JSON.stringify(shipMemoryRead().trail)`)})`);

  // A newer version of the game saves A's slot in another tab: A never writes over bytes it cannot read.
  label = "newer version in another tab";
  store.reset();
  expect(A.evaluate("beginFreshCampaign({ persist: true, slot: 1 })") === true, `${label}: A's new run failed`);
  step(A);
  store.deliver(B);
  B.browser.localStorage.setItem("sunsplitter_save_v3", newerBuildSave(store.get("sunsplitter_save_v3")));
  store.deliver(A);
  const newerBytes = store.keys(SLOT1);
  expect(bar(A).text === NEWER(1) && bar(A).error, `${label}: A shows ${JSON.stringify(bar(A))}`);
  step(A);
  A.browser.window.dispatchEvent({ type: "pagehide" });
  expect(A.evaluate("saveGame()") === false, `${label}: A's Save reported a save`);
  expect(same(store.keys(SLOT1), newerBytes), `${label}: A wrote over the newer version's save`);
  expect(A.evaluate("runTrailSaveSlot()") === null, `${label}: A still records a trail under slot 1`);
  // Before the event arrives, too.
  store.reset();
  expect(A.evaluate("beginFreshCampaign({ persist: true, slot: 1 })") === true, `${label}: A's second new run failed`);
  step(A);
  B.browser.localStorage.setItem("sunsplitter_save_v3", newerBuildSave(store.get("sunsplitter_save_v3")));
  store.drop(A);
  const newerBytes2 = store.keys(SLOT1);
  step(A);
  expect(same(store.keys(SLOT1), newerBytes2) && bar(A).text === NEWER(1), `${label}: before the event, A wrote over it or was not told`);
  // A committed v:99 save from the other tab, with and without the event.
  const formatGuard = A.evaluate(`typeof snapshotFormatIsNewer === "function"`);
  for (const delivered of [true, false]) {
    store.reset();
    expect(A.evaluate("beginFreshCampaign({ persist: true, slot: 1 })") === true, `${label}: A's v:99 new run failed`);
    step(A);
    B.browser.localStorage.setItem("sunsplitter_save_v3", newerFormatSave(store.get("sunsplitter_save_v3")));
    if (delivered) store.deliver(A); else store.drop(A);
    const v99 = store.keys(SLOT1);
    step(A);
    A.browser.window.dispatchEvent({ type: "pagehide" });
    A.evaluate("saveGame()");
    const told = bar(A).text;
    expect(same(store.keys(SLOT1), v99), `${label}: A wrote over another tab's v:99 save (event ${delivered ? "delivered" : "not yet"})`);
    expect(formatGuard ? told === NEWER(1) : (told === NOTICE(1) || told === NEWER(1)), `${label}: after a v:99 save A shows "${told}"`);
  }
  notes.push(`${label}: v:99 save kept; it reads as ${formatGuard ? "a newer version (format guard present)" : "another tab's run (no format guard in this build yet)"}`);
  // SUN-DELETE-SLOT-01: a slot emptied in another tab (its Delete) is not written back by A's next
  // choice; A says so, and the Menu's Save writes the run back. (sun-playerflow-delete-slot-checks
  // covers the rest of the deleted-slot cases.)
  label = "slot emptied in another tab";
  store.reset();
  expect(A.evaluate("beginFreshCampaign({ persist: true, slot: 1 })") === true, `${label}: A's new run failed`);
  step(A);
  for (const key of SLOT1) B.browser.localStorage.removeItem(key);
  store.deliver(A);
  step(A);
  expect(SLOT1.every(key => store.get(key) === null), `${label}: A's next choice wrote the emptied slot back`);
  expect(bar(A).error && bar(A).text === `Slot 1 was deleted in another tab · not saving here · Save in Menu to keep this run there`,
    `${label}: A shows ${JSON.stringify(bar(A))}`);
  expect(A.evaluate("saveGame()") === true && store.get("sunsplitter_save_v3") === seen(A, 1), `${label}: A's Save did not write the run back`);
  // A store cleared in another tab is not a delete: the emptied slot stays free, as before.
  label = "store cleared in another tab";
  store.reset();
  expect(A.evaluate("beginFreshCampaign({ persist: true, slot: 1 })") === true, `${label}: A's new run failed`);
  step(A);
  B.browser.localStorage.clear();
  store.deliver(A);
  step(A);
  expect(!bar(A).error && store.get("sunsplitter_save_v3") === seen(A, 1), `${label}: A did not save the emptied slot (${JSON.stringify(bar(A))})`);

  // New run on the title beside another tab: a save in another slot leaves the New run flow open; a
  // save in the slot it would replace closes it and says so; Begin run re-checks that slot itself.
  // SUN-NEW-RUN-SLOT-01: the slot New run replaces is the one picked in the slot picker, so each case
  // picks slot 1 (the picker would start on empty slot 2), and a save in slot 2 repaints the picker.
  label = "new run beside another tab";
  store.reset();
  const isOpen = id => !A.evaluate(`document.getElementById("${id}").classList.contains("hidden")`);
  expect(B.evaluate("beginFreshCampaign({ persist: true, slot: 1 })") === true, `${label}: B's new run failed`);
  step(B);
  A.evaluate("showTitleScreen()");
  store.deliver(A);
  A.evaluate("startGame(); selectNewRunSlot(1)");
  expect(isOpen("new-run-confirm"), `${label}: New run did not open its confirm`);
  B.browser.localStorage.setItem("sunsplitter_save_v3_slot2", store.get("sunsplitter_save_v3"));
  store.deliver(A);
  expect(isOpen("new-run-confirm"), `${label}: a save in slot 2 closed the New run confirm for slot 1`);
  expect(A.evaluate(`newRunSelectedSlot() === 1 && document.getElementById("new-run-row-2").getAttribute("data-kind") === "filled"`),
    `${label}: the picker did not repaint slot 2 in place with slot 1 still selected`);
  expect(A.evaluate(`document.getElementById("title-save-chip").textContent`).includes("2 of 3"), `${label}: the title behind the confirm did not repaint`);
  step(B);
  store.deliver(A);
  expect(!isOpen("new-run-confirm") && !isOpen("commander-create"), `${label}: a save in slot 1 left the New run flow open`);
  expect(A.evaluate(`document.getElementById("title-save-status").textContent`) === CHANGED(1), `${label}: the title says "${A.evaluate(`document.getElementById("title-save-status").textContent`)}"`);
  A.evaluate("startGame(); selectNewRunSlot(1)");
  A.evaluate("confirmNewRun()");
  expect(isOpen("commander-create"), `${label}: the Commander panel did not open`);
  step(B);
  store.drop(A);
  const bRun = store.keys(SLOT1);
  expect(A.evaluate("confirmCommanderCreate()") === false, `${label}: Begin run started over another tab's change`);
  expect(same(store.keys(SLOT1), bRun), `${label}: Begin run wrote slot 1 after another tab changed it`);
  expect(A.evaluate(`document.getElementById("title-save-status").textContent`) === CHANGED(1), `${label}: Begin run did not say why it stopped`);
  A.evaluate("startGame(); selectNewRunSlot(1)");
  A.evaluate("confirmNewRun()");
  expect(A.evaluate("confirmCommanderCreate()") === true && JSON.parse(store.get("sunsplitter_save_v3")).scene === "wake" &&
    store.get("sunsplitter_save_v3") === seen(A, 1), `${label}: an unchanged slot did not start the new run`);
}

// One tab alone, real saves: 200 seeded choices (across runs: an ending starts the next the way Play
// Again does), a hidden-tab save every 20. Never the notice, and every choice reaches slot 1.
function singleTabChecks() {
  const A = newTab(404);
  A.browser.localStorage.clear();
  expect(A.evaluate("beginFreshCampaign({ persist: true, slot: 1 })") === true, "single tab: new run failed");
  let runs = 1;
  for (let i = 1; i <= SINGLE_TAB_CHOICES; i++) {
    const before = scene(A);
    const after = step(A);
    if (before === "ending_check") runs++;
    if (String(after).startsWith("stuck") || after === "replay-failed") { fail(`single tab: choice ${i} ${after}`); break; }
    if (i % 20 === 0) A.browser.window.dispatchEvent({ type: "pagehide" });
    const b = bar(A);
    if (b.text === NOTICE(1) || A.evaluate("Object.keys(saveSlotTaken).length") !== 0) { fail(`single tab: false alarm after choice ${i} at ${after}`); break; }
    if (b.error) { fail(`single tab: choice ${i} shows ${b.text}`); break; }
    const live = A.browser.localStorage.getItem("sunsplitter_save_v3");
    if (live !== seen(A, 1) || JSON.parse(live).scene !== scene(A)) { fail(`single tab: choice ${i} (${after}) was not saved`); break; }
  }
  notes.push(`single tab: ${SINGLE_TAB_CHOICES} choices over ${runs} run(s), every one saved, no notice`);
}

// ---------- Part 2: Chromium ----------
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

// Every page of the context: content notice and tutorial already seen, so the title is the first screen.
function initPage() {
  try {
    if (!localStorage.getItem("sunsplitter_tone_ack_v1")) localStorage.setItem("sunsplitter_tone_ack_v1", "1");
    if (!localStorage.getItem("sunsplitter_tutorial_seen_v1")) localStorage.setItem("sunsplitter_tutorial_seen_v1", "1");
  } catch (e) { /* storage blocked */ }
}

async function browserChecks(requireBrowser) {
  const pw = await loadPlaywright();
  if (!pw) {
    const line = "NOT_AVAILABLE — Playwright is not installed here (CI has no browser); run this file where it is";
    if (requireBrowser) fail(line);
    return { ran: false, line };
  }
  const server = createServer(async (req, res) => {
    try {
      const path = decodeURIComponent(new URL(req.url, "http://x").pathname);
      const file = resolve(ROOT, "." + (path === "/" ? "/index.html" : path));
      if (file !== ROOT && !file.startsWith(ROOT + sep)) { res.writeHead(403); res.end(); return; }
      const body = await readFile(file);
      res.writeHead(200, { "content-type": TYPES[extname(file)] || "application/octet-stream" });
      res.end(body);
    } catch { res.writeHead(404); res.end(); }
  });
  await new Promise(done => server.listen(0, "127.0.0.1", done));
  const url = `http://127.0.0.1:${server.address().port}/index.html`;
  let browser;
  try {
    browser = await pw.chromium.launch({ executablePath: process.env.CHROMIUM_PATH, args: ["--no-sandbox"] });
  } catch (error) {
    server.close();
    const line = `NOT_AVAILABLE — Chromium did not launch (${String(error && error.message).split("\n")[0].slice(0, 120)})`;
    if (requireBrowser) fail(line);
    return { ran: false, line };
  }
  const pageErrors = [];
  const layout = [];
  try {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: "reduce" });
    await context.addInitScript(initPage);
    const open = async (name, seed) => {
      const page = await context.newPage();
      page.on("pageerror", error => pageErrors.push(`${name}: ${String(error && error.message).slice(0, 160)}`));
      await page.goto(url);
      await page.waitForSelector("#btn-begin", { state: "visible" });
      await page.evaluate(TAB_HELPERS(seed));
      return page;
    };
    const A = await open("A", 101);
    const B = await open("B", 202);
    const raw = (page, keys) => page.evaluate(list => Object.fromEntries(list.map(key => [key, localStorage.getItem(key)])), keys);
    const pbar = page => page.evaluate("__tabBar()");
    const pseen = (page, slot) => page.evaluate(`saveSlotSeen[${slot}]`);
    const told = async (page, slot) => { const b = await pbar(page); return b.text === NOTICE(slot) && b.visible && b.error; };
    const waitTold = (page, slot) => page.waitForFunction(text => {
      const el = document.getElementById("save-status");
      return !!el && el.textContent === text && el.classList.contains("visible");
    }, NOTICE(slot), { timeout: 5000 }).then(() => true, () => false);
    const settle = () => new Promise(done => setTimeout(done, 300));
    let label = "browser, same slot";

    // A starts a run from the title (Begin, commander, Skip); B's title gets Continue without a reload.
    expect(await B.locator("#btn-resume").isHidden(), `${label}: B shows Continue before any save`);
    await A.click("#btn-begin");
    await A.waitForSelector("#commander-create-ok", { state: "visible" });
    await A.click("#commander-create-ok");
    await A.waitForSelector("#cinematic-skip", { state: "visible" });
    await A.click("#cinematic-skip");
    await A.waitForSelector("#game-screen", { state: "visible" });
    for (let i = 0; i < 3; i++) await A.evaluate("__tabStep()");
    const continueShown = await B.locator("#btn-resume").waitFor({ state: "visible", timeout: 5000 }).then(() => true, () => false);
    expect(continueShown, `${label}: B's title did not show Continue after A saved`);

    // B continues (the title's own button) and plays on; A is told at once.
    await B.click("#btn-resume");
    await B.waitForSelector("#game-screen", { state: "visible" });
    await settle();
    expect(!(await told(A, 1)), `${label}: A was told before B saved anything new`);
    for (let i = 0; i < 2; i++) await B.evaluate("__tabStep()");
    expect(await waitTold(A, 1), `${label}: A shows ${JSON.stringify(await pbar(A))}, expected the notice`);
    const newer = await raw(B, SLOT1);
    expect(newer.sunsplitter_save_v3 === await pseen(B, 1), `${label}: slot 1 does not hold B's save`);

    // The notice in the bar: desktop, phone, and phone held sideways.
    for (const [width, height] of [[1280, 800], [360, 640], [844, 390]]) {
      await A.setViewportSize({ width, height });
      await settle();
      const m = await A.evaluate(() => {
        const rect = el => { const b = el.getBoundingClientRect(); return { x: Math.round(b.left), y: Math.round(b.top), w: Math.round(b.width), h: Math.round(b.height), r: Math.round(b.right), b: Math.round(b.bottom) }; };
        const status = document.getElementById("save-status");
        const meta = document.getElementById("meta");
        const buttons = [...meta.querySelectorAll(".meta-actions button")].filter(b => b.getClientRects().length);
        return {
          docOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          meta: rect(meta), status: rect(status), clipped: status.scrollWidth > status.clientWidth + 1,
          buttons: buttons.map(rect), vw: window.innerWidth, vh: window.innerHeight
        };
      });
      layout.push({ width, height, ...m });
      expect(m.docOverflow <= 0, `${label} ${width}x${height}: page scrolls sideways by ${m.docOverflow}px with the notice`);
      expect(!m.clipped && m.status.x >= 0 && m.status.r <= m.vw, `${label} ${width}x${height}: the notice is cut off (${JSON.stringify(m.status)})`);
      const firstButton = m.buttons.reduce((left, b) => Math.min(left, b.x), Infinity);
      expect(m.status.r <= firstButton + 1 || m.status.b <= Math.min(...m.buttons.map(b => b.y)) + 1, `${label} ${width}x${height}: the notice runs under the bar's buttons`);
      expect(m.meta.b <= m.vh + 1, `${label} ${width}x${height}: the bar runs off the screen (${JSON.stringify(m.meta)})`);
      const lastButton = m.buttons.reduce((right, b) => Math.max(right, b.r), 0);
      expect(lastButton <= m.meta.r + 1, `${label} ${width}x${height}: the notice pushes the bar's buttons past its edge (${lastButton} > ${m.meta.r})`);
      if (process.env.SECOND_TAB_SHOTS) await A.screenshot({ path: join(process.env.SECOND_TAB_SHOTS, `second-tab-notice-${width}x${height}.png`) });
    }
    await A.setViewportSize({ width: 1280, height: 800 });

    // A keeps playing: a choice, a hidden-tab save, the Menu's Save and a cancelled Return to title
    // leave B's save alone; Return to title asks first, and Cancel keeps A in the run.
    const menu = async id => {
      await A.click("#btn-menu");
      await A.waitForSelector("#menu-sheet", { state: "visible" });
      await A.click("#" + id);
      await settle();
    };
    await A.evaluate("__tabStep()");
    await A.evaluate(() => window.dispatchEvent(new Event("pagehide")));
    await menu("menu-save");
    const asked = [];
    const answer = accept => dialog => { asked.push(dialog.message()); return accept ? dialog.accept() : dialog.dismiss(); };
    const dismiss = answer(false);
    A.on("dialog", dismiss);
    await menu("menu-return-title");
    A.off("dialog", dismiss);
    const stayed = await A.evaluate(() => ({
      game: !document.getElementById("game-screen").classList.contains("hidden"),
      chip: document.getElementById("menu-return-title-chip").textContent
    }));
    expect(stayed.game && same(asked, [LEAVE(1)]), `${label}: Return to title, cancelled: in run ${stayed.game}, asked ${JSON.stringify(asked)}`);
    expect(stayed.chip === CHIP_TAKEN(1), `${label}: the Menu's Return to title chip reads "${stayed.chip}"`);
    await A.click("#menu-close");
    await settle();
    expect(same(await raw(B, SLOT1), newer), `${label}: A's choice, hidden-tab save, Save or cancelled Return to title changed slot 1`);
    expect(await told(A, 1), `${label}: A's notice did not stay`);
    expect((await raw(A, [POINTER]))[POINTER] === "1", `${label}: the pointer moved`);
    expect(!(await pbar(B)).error, `${label}: B, the newer tab, shows ${JSON.stringify(await pbar(B))}`);

    // The Menu's Load picks up B's save in A; then B is the one told.
    await menu("menu-load");
    expect(await A.evaluate("state.scene") === await B.evaluate("state.scene"), `${label}: A's Load did not land on B's scene`);
    expect(!(await told(A, 1)), `${label}: A still shows the notice after Load`);
    await A.evaluate("__tabStep()");
    expect(await waitTold(B, 1), `${label}: B was not told after A's Load and choice`);
    const aNewer = await raw(A, SLOT1);
    await B.evaluate("__tabStep()");
    await settle();
    expect(same(await raw(A, SLOT1), aNewer), `${label}: B's choice wrote over A's newer save`);
    expect(await pbar(A).then(b => !b.error), `${label}: A was told after its own newer save`);

    // B, told, returns to the title through the Menu: asked, then leaves without saving; A's save
    // stays, and the title's Continue loads it.
    asked.length = 0;
    const accept = answer(true);
    B.on("dialog", accept);
    await B.click("#btn-menu");
    await B.waitForSelector("#menu-sheet", { state: "visible" });
    await B.click("#menu-return-title");
    await B.waitForSelector("#btn-resume", { state: "visible", timeout: 5000 }).catch(() => {});
    B.off("dialog", accept);
    const onTitle = await B.evaluate(() => ({
      title: !document.getElementById("title-screen").classList.contains("hidden"),
      line: document.getElementById("title-save-status").textContent
    }));
    expect(onTitle.title && same(asked, [LEAVE(1)]) && onTitle.line !== NOTICE(1), `${label}: Return anyway: ${JSON.stringify({ onTitle, asked })}`);
    expect(same(await raw(A, SLOT1), aNewer), `${label}: B's Return anyway changed slot 1`);
    await B.click("#btn-resume");
    await B.waitForSelector("#game-screen", { state: "visible" });
    await settle();
    expect(await B.evaluate("state.scene") === await A.evaluate("state.scene") && !(await pbar(B)).error,
      `${label}: B's Continue after Return anyway did not load A's save`);
    expect(same(await raw(A, SLOT1), aNewer), `${label}: B's Continue changed slot 1`);

    // Different slots: B reloads, starts a run in slot 2; both play; neither is told; A never moves the pointer.
    label = "browser, different slots";
    await B.goto(url);
    await B.waitForSelector("#btn-resume", { state: "visible" });
    await B.evaluate(TAB_HELPERS(303));
    expect(await B.evaluate("beginFreshCampaign({ persist: true, slot: 2 })") === true, `${label}: B's new run in slot 2 failed`);
    expect((await raw(B, [POINTER]))[POINTER] === "2", `${label}: pointer is not 2 after B's new run in slot 2`);
    for (let i = 0; i < 5; i++) {
      await A.evaluate("__tabStep()");
      await B.evaluate("__tabStep()");
    }
    await A.evaluate(() => window.dispatchEvent(new Event("pagehide")));
    await settle();
    const all = await raw(A, SAVE_KEYS);
    expect(all.sunsplitter_save_v3 === await pseen(A, 1), `${label}: slot 1 does not hold A's last save`);
    expect(all.sunsplitter_save_v3_slot2 === await pseen(B, 2), `${label}: slot 2 does not hold B's last save`);
    expect(all[POINTER] === "2", `${label}: A's autosaves moved the pointer to ${all[POINTER]}`);
    expect(!(await pbar(A)).error && !(await pbar(B)).error, `${label}: a tab was told`);

    // A newer version of the game writes A's slot from another tab (a scene this build does not know,
    // then a v:99 save): A is told and never writes over it.
    label = "browser, newer version";
    const formatGuard = await A.evaluate(`typeof snapshotFormatIsNewer === "function"`);
    for (const [kind, make] of [["unknown scene", newerBuildSave], ["v:99", newerFormatSave]]) {
      if (kind === "v:99") {
        // A takes its slot back with Load... it cannot load bytes it cannot read, so start over in slot 1.
        await A.evaluate("beginFreshCampaign({ persist: true, slot: 1 })");
        await A.evaluate("__tabStep()");
      }
      const live = (await raw(A, ["sunsplitter_save_v3"])).sunsplitter_save_v3;
      await B.evaluate(([key, value]) => localStorage.setItem(key, value), ["sunsplitter_save_v3", make(live)]);
      const expected = kind === "v:99" && !formatGuard ? NOTICE(1) : NEWER(1);
      const toldNewer = await A.waitForFunction(text => {
        const el = document.getElementById("save-status");
        return !!el && el.textContent === text && el.classList.contains("visible");
      }, expected, { timeout: 5000 }).then(() => true, () => false);
      expect(toldNewer, `${label} (${kind}): A shows ${JSON.stringify(await pbar(A))}, expected "${expected}"`);
      const kept = await raw(A, SLOT1);
      await A.evaluate("__tabStep()");
      await A.evaluate(() => window.dispatchEvent(new Event("pagehide")));
      await settle();
      expect(same(await raw(A, SLOT1), kept), `${label} (${kind}): A wrote over the other tab's save`);
    }

    // New run on a real title beside another tab: B saving slot 2 leaves A's New run confirm open; B
    // saving slot 1, the slot it would replace, closes it and says so.
    label = "browser, new run beside another tab";
    await A.goto(url);
    await A.waitForSelector("#btn-begin", { state: "visible" });
    await A.click("#btn-begin");
    await A.waitForSelector("#new-run-confirm", { state: "visible" });
    // SUN-NEW-RUN-SLOT-01: pick slot 1, the slot B is about to start a new run in.
    await A.click("#new-run-row-1");
    await B.evaluate("__tabStep()");
    await settle();
    expect(await A.locator("#new-run-confirm").isVisible(), `${label}: B's save in slot 2 closed A's New run confirm`);
    await B.evaluate("beginFreshCampaign({ persist: true, slot: 1 })");
    const closed = await A.locator("#new-run-confirm").waitFor({ state: "hidden", timeout: 5000 }).then(() => true, () => false);
    const said = await A.evaluate(() => document.getElementById("title-save-status").textContent);
    expect(closed && said === CHANGED(1), `${label}: after B's new run in slot 1 the confirm ${closed ? "closed" : "stayed open"} and the title says "${said}"`);
    expect(await A.locator("#btn-resume").isVisible(), `${label}: A's title did not offer Continue after B's save`);
    await A.close();
    await B.close();
    await context.close();

    // One page alone: 200 seeded choices, real saves, a hidden-tab save every 20; never the notice.
    label = "browser, single tab";
    const solo = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: "reduce" });
    await solo.addInitScript(initPage);
    const page = await solo.newPage();
    page.on("pageerror", error => pageErrors.push(`solo: ${String(error && error.message).slice(0, 160)}`));
    await page.goto(url);
    await page.waitForSelector("#btn-begin", { state: "visible" });
    await page.evaluate(TAB_HELPERS(404));
    const solo200 = await page.evaluate(count => {
      if (!beginFreshCampaign({ persist: true, slot: 1 })) return { error: "new run failed" };
      let runs = 1;
      for (let i = 1; i <= count; i++) {
        if (state.scene === "ending_check") runs++;
        const after = __tabStep();
        if (String(after).startsWith("stuck") || after === "replay-failed") return { error: `choice ${i} ${after}` };
        if (i % 20 === 0) window.dispatchEvent(new Event("pagehide"));
        const b = __tabBar();
        if (b.error || Object.keys(saveSlotTaken).length) return { error: `choice ${i} at ${after} shows "${b.text}"` };
        const live = localStorage.getItem("sunsplitter_save_v3");
        if (live !== saveSlotSeen[1] || JSON.parse(live).scene !== state.scene) return { error: `choice ${i} at ${after} was not saved` };
      }
      return { runs };
    }, SINGLE_TAB_CHOICES);
    if (solo200.error) fail(`${label}: ${solo200.error}`);
    else notes.push(`${label}: ${SINGLE_TAB_CHOICES} choices over ${solo200.runs} run(s) in Chromium, every one saved, no notice`);
    await solo.close();
  } finally {
    await browser.close();
    server.close();
  }
  pageErrors.forEach(message => fail(`page error: ${message}`));
  return { ran: true, layout };
}

const requireBrowser = process.argv.includes("--require-browser");
try { realmChecks(); } catch (error) { fail(`realm checks threw: ${error && error.stack ? error.stack.split("\n").slice(0, 3).join(" | ") : error}`); }
try { singleTabChecks(); } catch (error) { fail(`single tab threw: ${error && error.message}`); }
let browserResult = { ran: false, line: "" };
try { browserResult = await browserChecks(requireBrowser); } catch (error) { fail(`browser checks threw: ${String(error && error.message).split("\n")[0]}`); }

notes.forEach(line => console.log(`NOTE ${line}`));
if (browserResult.ran && process.argv.includes("--layout")) console.log(JSON.stringify(browserResult.layout, null, 1));
if (errors.length) {
  errors.forEach(message => console.error(`FAIL ${message}`));
  console.error(`FAIL sun-playerflow-second-tab: ${errors.length} problem(s)`);
  process.exit(1);
}
console.log(`PASS sun-playerflow-second-tab: two tabs on one store never save over each other unannounced; different slots stay apart; the pointer moves only on a new run or a load; ${browserResult.ran ? "Chromium two-page run passed" : `browser ${browserResult.line}`}`);
