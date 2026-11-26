// SUN-SAVE-SLOTS-CORE-01 (L-052, Wave 2 design S-1) — the slot-keyed storage core, no visible change.
// Slot 1 is today's save on today's keys; slots 2 and 3 have their own keys; the pointer
// sunsplitter_save_current_v1 names the slot Continue resumes. Drives the real scripts through
// simulate.loadGame. Each case starts from cleared storage in a fresh runtime.
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
  const SETTINGS = ["sunsplitter_tone_ack_v1", "sunsplitter_show_costs_v1", "sunsplitter_cover_nudity_v1",
    "sunsplitter_text_pace_v1", "sunsplitter_tutorial_seen_v1"];
  const snap = (scene, extra) => {
    resetRunState();
    state.scene = scene;
    const s = snapshotState();
    return JSON.stringify(Object.assign(s, extra || {}));
  };
  const status = () => document.getElementById("title-save-status").textContent;
  const gameStatus = () => (document.getElementById("save-status") || { textContent: "" }).textContent;
`;

function run(body) {
  const runtime = loadGame(ROOT);
  return JSON.parse(runtime.evaluate(`JSON.stringify((() => {${PRELUDE}\n${body}\n})())`));
}

const results = [];
const ok = label => results.push(label);

// 0. Key table: slot 1 is today's four keys; slots 2 and 3 are disjoint and have no legacy key.
{
  const r = run(`
    return {
      count: SAVE_SLOT_COUNT,
      pointer: SAVE_POINTER_KEY,
      k1: saveSlotKeys(1), k2: saveSlotKeys(2), k3: saveSlotKeys(3),
      bad: [saveSlotKeys(0).live, saveSlotKeys(4).live, saveSlotKeys("x").live, normalizeSaveSlot("2")],
      active: activeSaveSlot
    };
  `);
  assert.equal(r.count, 3);
  assert.equal(r.pointer, "sunsplitter_save_current_v1");
  assert.deepEqual(r.k1, { live: "sunsplitter_save_v3", staging: "sunsplitter_save_v3_staging", backup: "sunsplitter_save_v3_backup", legacy: "sunsplitter_save_v2" });
  assert.deepEqual(r.k2, { live: "sunsplitter_save_v3_slot2", staging: "sunsplitter_save_v3_slot2_staging", backup: "sunsplitter_save_v3_slot2_backup", legacy: null });
  assert.deepEqual(r.k3, { live: "sunsplitter_save_v3_slot3", staging: "sunsplitter_save_v3_slot3_staging", backup: "sunsplitter_save_v3_slot3_backup", legacy: null });
  assert.deepEqual(r.bad, ["sunsplitter_save_v3", "sunsplitter_save_v3", "sunsplitter_save_v3", 2], "an invalid slot normalizes to slot 1");
  assert.equal(r.active, 1, "the active slot starts at 1");
  ok("key table");
}

// 1. Writes to slots 2 and 3 (save, new run, import, clear) leave the four slot 1 keys and the
//    settings keys byte-identical, and a slot 1 write leaves slots 2 and 3 byte-identical.
{
  const r = run(`
    const live1 = snap("act2_tether_sighting", { savedAt: 1000 });
    const legacy = JSON.parse(snap("priority_repairs")); delete legacy.v; legacy.v = 2;
    localStorage.setItem(SAVE_KEY, live1);
    localStorage.setItem(SAVE_KEY_LEGACY, JSON.stringify(legacy));
    localStorage.setItem(SAVE_STAGING_KEY, "stale-staging-bytes");
    localStorage.setItem(SAVE_BACKUP_KEY, "stale-backup-bytes");
    SETTINGS.forEach((key, i) => localStorage.setItem(key, "setting-" + i));
    const slot1Before = digest(SLOT1);
    const settingsBefore = digest(SETTINGS);
    const steps = {};
    resetRunState(); state.scene = "wake";
    steps.persist2 = persistSave({ silent: true, slot: 2 });
    steps.persist3 = persistSave({ silent: true, slot: 3, retireLegacy: true });
    steps.fresh2 = beginFreshCampaign({ persist: true, slot: 2 });
    steps.activeAfterFresh = activeSaveSlot;
    steps.pointerAfterFresh = localStorage.getItem(SAVE_POINTER_KEY);
    steps.save2 = saveGame();
    steps.import3 = importSaveText(snap("act3_spine_next"), 3);
    steps.pointerAfterImport = localStorage.getItem(SAVE_POINTER_KEY);
    steps.activeAfterImport = activeSaveSlot;
    steps.slot2HasLive = localStorage.getItem(saveSlotKeys(2).live) !== null;
    steps.slot3HasLive = localStorage.getItem(saveSlotKeys(3).live) !== null;
    clearSave(2);
    steps.slot2Cleared = keysOf(2).every(key => localStorage.getItem(key) === null);
    steps.slot1Same = digest(SLOT1) === slot1Before;
    steps.settingsSame = digest(SETTINGS) === settingsBefore;
    // Reverse direction: slot 1 transactions leave slots 2 and 3 alone.
    persistSave({ silent: true, slot: 2 });
    const others = digest(keysOf(2).concat(keysOf(3)));
    activeSaveSlot = 1;
    resetRunState(); state.scene = "wake";
    steps.persist1 = persistSave({ silent: true });
    steps.fresh1 = beginFreshCampaign({ persist: true });
    steps.import1 = importSaveText(snap("priority_repairs"), 1);
    clearSave();
    steps.slot1Gone = SLOT1.every(key => localStorage.getItem(key) === null);
    steps.othersSame = digest(keysOf(2).concat(keysOf(3))) === others;
    steps.settingsSameAfter = digest(SETTINGS) === settingsBefore;
    return steps;
  `);
  assert.deepEqual(
    [r.persist2, r.persist3, r.fresh2, r.save2, r.import3, r.persist1, r.fresh1, r.import1],
    [true, true, true, true, true, true, true, true], "every slot write succeeded");
  assert.equal(r.activeAfterFresh, 2, "a new run in slot 2 makes slot 2 active");
  assert.equal(r.pointerAfterFresh, "2", "a new run in slot 2 writes the pointer");
  assert.equal(r.pointerAfterImport, "3", "an import into slot 3 moves the pointer to slot 3");
  assert.equal(r.activeAfterImport, 2, "an import does not change the active slot");
  assert.ok(r.slot2HasLive && r.slot3HasLive);
  assert.equal(r.slot2Cleared, true, "clearSave(2) removes slot 2's keys");
  assert.equal(r.slot1Same, true, "writes to slots 2 and 3 left slot 1's four keys byte-identical (v2 included)");
  assert.equal(r.settingsSame, true, "slot writes never touch the settings keys");
  assert.equal(r.slot1Gone, true, "clearSave() on slot 1 still clears today's four keys");
  assert.equal(r.othersSame, true, "slot 1 save, new run, import and clear left slots 2 and 3 byte-identical");
  assert.equal(r.settingsSameAfter, true);
  ok("disjoint slot writes");
}

// 2. Injected staging, backup and live failures on slot 2 roll back slot 2 only.
{
  for (const fail of ["staging", "backup", "live"]) {
    const r = run(`
      localStorage.setItem(SAVE_KEY, snap("act2_tether_sighting"));
      localStorage.setItem(saveSlotKeys(3).live, snap("act3_spine_next"));
      const prior2 = snap("priority_repairs", { savedAt: 5 });
      localStorage.setItem(saveSlotKeys(2).live, prior2);
      const s1 = digest(SLOT1), s3 = digest(keysOf(3));
      const target = saveSlotKeys(2)[${JSON.stringify(fail)}];
      const realSet = localStorage.setItem;
      localStorage.setItem = (key, value) => {
        // The backup write carries the prior bytes, so it always fails; the live and staging
        // writes fail only for the new snapshot, so the live restore can still succeed.
        if (key === target && (${JSON.stringify(fail)} === "backup" || value !== prior2)) throw new Error("injected " + key);
        return realSet(key, value);
      };
      activeSaveSlot = 2;
      resetRunState(); state.scene = "wake";
      const saved = persistSave({ silent: true });
      localStorage.setItem = realSet;
      return {
        saved,
        slot1: digest(SLOT1) === s1,
        slot3: digest(keysOf(3)) === s3,
        slot2Effective: readRawSave(2) === prior2,
        slot2Live: localStorage.getItem(saveSlotKeys(2).live) === prior2,
        slot2Staging: localStorage.getItem(saveSlotKeys(2).staging),
        status: gameStatus() || status()
      };
    `);
    assert.equal(r.saved, false, `${fail} failure must fail the save`);
    assert.equal(r.slot1, true, `${fail} failure on slot 2 left slot 1 intact`);
    assert.equal(r.slot3, true, `${fail} failure on slot 2 left slot 3 intact`);
    assert.equal(r.slot2Effective, true, `${fail} failure on slot 2 rolled back to its prior save`);
    assert.equal(r.slot2Live, true, `${fail} failure restored slot 2's live key`);
    assert.equal(r.slot2Staging, null, `${fail} failure cleared slot 2 staging`);
    assert.equal(r.status, "Autosave failed · prior slot kept");
  }
  // An interrupted slot 2 transaction (live == staging) resolves to slot 2's backup, as slot 1 does.
  const r = run(`
    const prior = snap("priority_repairs");
    const torn = snap("act3_spine_next");
    const k = saveSlotKeys(2);
    localStorage.setItem(k.live, torn);
    localStorage.setItem(k.staging, torn);
    localStorage.setItem(k.backup, prior);
    return { effective: readRawSave(2) === prior, slot1: readRawSave(1) };
  `);
  assert.equal(r.effective, true, "slot 2 reads its backup after an interrupted transaction");
  assert.equal(r.slot1, null);
  ok("slot 2 write failures roll back slot 2 only");
}

// 3. continueSlot(): pointer if readable; else newest readable (ties to the lowest); else null.
{
  const r = run(`
    const out = {};
    out.empty = continueSlot();
    localStorage.setItem(SAVE_KEY, snap("act2_tether_sighting", { savedAt: 100 }));
    out.onlySlot1NoPointer = continueSlot();
    out.pointerUntouched = localStorage.getItem(SAVE_POINTER_KEY);
    localStorage.setItem(saveSlotKeys(2).live, snap("priority_repairs", { savedAt: 300 }));
    localStorage.setItem(saveSlotKeys(3).live, snap("act3_spine_next", { savedAt: 200 }));
    out.newestNoPointer = continueSlot();
    localStorage.setItem(SAVE_POINTER_KEY, "3");
    out.pointer3 = continueSlot();
    localStorage.setItem(SAVE_POINTER_KEY, "1");
    out.pointer1 = continueSlot();
    localStorage.setItem(saveSlotKeys(3).live, "{not json");
    localStorage.setItem(SAVE_POINTER_KEY, "3");
    out.pointerUnreadable = continueSlot();
    for (const bad of ["7", "0", "x", "", " 2", "2.0"]) {
      localStorage.setItem(SAVE_POINTER_KEY, bad);
      out["garbage_" + bad] = continueSlot();
    }
    localStorage.removeItem(saveSlotKeys(2).live);
    localStorage.setItem(SAVE_POINTER_KEY, "2");
    out.pointerEmptySlot = continueSlot();
    localStorage.setItem(saveSlotKeys(2).live, snap("priority_repairs", { savedAt: 100 }));
    localStorage.setItem(saveSlotKeys(3).live, snap("act3_spine_next", { savedAt: 100 }));
    localStorage.removeItem(SAVE_POINTER_KEY);
    out.tieLowest = continueSlot();
    localStorage.removeItem(SAVE_KEY);
    out.tieLowest23 = continueSlot();
    const noStamp2 = JSON.parse(snap("priority_repairs")); delete noStamp2.savedAt;
    localStorage.setItem(saveSlotKeys(2).live, JSON.stringify(noStamp2));
    out.missingSavedAtLoses = continueSlot();
    const realGet = localStorage.getItem;
    localStorage.getItem = key => { if (key === SAVE_POINTER_KEY) throw new Error("blocked"); return realGet(key); };
    out.pointerReadThrows = continueSlot();
    localStorage.getItem = () => { throw new Error("blocked"); };
    out.storageBlocked = continueSlot();
    localStorage.getItem = realGet;
    return out;
  `);
  assert.equal(r.empty, null, "nothing stored: no Continue");
  assert.equal(r.onlySlot1NoPointer, 1, "upgrade: no pointer and only slot 1 resolves to slot 1");
  assert.equal(r.pointerUntouched, null, "resolving the slot writes nothing");
  assert.equal(r.newestNoPointer, 2, "no pointer: the newest readable slot");
  assert.equal(r.pointer3, 3, "a readable pointer slot wins over a newer slot");
  assert.equal(r.pointer1, 1);
  assert.equal(r.pointerUnreadable, 2, "an unreadable pointer slot falls back to the newest readable");
  for (const bad of ["7", "0", "x", "", " 2", "2.0"]) assert.equal(r["garbage_" + bad], 2, `pointer ${JSON.stringify(bad)} is ignored`);
  assert.equal(r.pointerEmptySlot, 1, "a pointer to an empty slot falls back to the newest readable (slot 3 is unreadable here)");
  assert.equal(r.tieLowest, 1, "ties go to the lowest slot number");
  assert.equal(r.tieLowest23, 2);
  assert.equal(r.missingSavedAtLoses, 3, "a save without savedAt counts as oldest");
  assert.equal(r.pointerReadThrows, 3, "a pointer read that throws falls back to the newest readable");
  assert.equal(r.storageBlocked, null, "storage that throws: no Continue");
  ok("continueSlot rules");
}

// 4. v2 is read for slot 1 only.
{
  const r = run(`
    const legacy = JSON.parse(snap("act2_tether_sighting")); legacy.v = 2; delete legacy.sceneEntered;
    const legacyRaw = JSON.stringify(legacy);
    localStorage.setItem(SAVE_KEY_LEGACY, legacyRaw);
    const out = {
      slot1: readRawSave(1) === legacyRaw,
      has: [hasSave(1), hasSave(2), hasSave(3)],
      raw23: [readRawSave(2), readRawSave(3)],
      unreadable23: [unreadableSaveRaw(2), unreadableSaveRaw(3)],
      bytes: [slotHasAnyBytes(1), slotHasAnyBytes(2), slotHasAnyBytes(3)],
      cont: continueSlot(),
      export2: buildSaveExport(2)
    };
    // A slot 2 new run with retireLegacy, a slot 2 import and clearSave(2) keep v2.
    beginFreshCampaign({ persist: true, slot: 2 });
    importSaveText(snap("priority_repairs"), 2);
    clearSave(2);
    out.legacyKept = localStorage.getItem(SAVE_KEY_LEGACY) === legacyRaw;
    // A slot 1 new run retires it, as today.
    beginFreshCampaign({ persist: true, slot: 1 });
    out.legacyRetiredBySlot1 = localStorage.getItem(SAVE_KEY_LEGACY);
    return out;
  `);
  assert.equal(r.slot1, true, "slot 1 reads v2");
  assert.deepEqual(r.has, [true, false, false]);
  assert.deepEqual(r.raw23, [null, null], "slots 2 and 3 never read v2");
  assert.deepEqual(r.unreadable23, [null, null], "v2 is not reported as an unreadable slot 2 or 3");
  assert.deepEqual(r.bytes, [true, false, false]);
  assert.equal(r.cont, 1);
  assert.equal(r.export2, null);
  assert.equal(r.legacyKept, true, "slot 2 transactions never retire or clear v2");
  assert.equal(r.legacyRetiredBySlot1, null, "a slot 1 new run still retires v2");
  ok("v2 for slot 1 only");
}

// 5. An unreadable slot 2 leaves slot 1's Continue working, and its bytes untouched.
{
  const r = run(`
    const good = snap("act2_tether_sighting", { savedAt: 10 });
    localStorage.setItem(SAVE_KEY, good);
    localStorage.setItem(saveSlotKeys(2).live, "{not json");
    localStorage.setItem(SAVE_POINTER_KEY, "2");
    showScreen("title");
    refreshTitleResumeUI();
    const out = {
      cont: continueSlot(),
      resumeShown: !document.getElementById("btn-resume").classList.contains("hidden"),
      status: status(),
      unreadable2: unreadableSaveRaw(2),
      unreadableExport2: (buildUnreadableSaveExport(2) || {}).text,
      bytes2: slotHasAnyBytes(2),
      has2: hasSave(2)
    };
    out.resumed = resumeGame();
    out.scene = state.scene;
    out.active = activeSaveSlot;
    out.pointer = localStorage.getItem(SAVE_POINTER_KEY);
    out.slot2Bytes = localStorage.getItem(saveSlotKeys(2).live);
    return out;
  `);
  assert.equal(r.cont, 1);
  assert.equal(r.resumeShown, true, "Continue shows for slot 1 beside an unreadable slot 2");
  assert.doesNotMatch(r.status, /can't be read/, "S-1 adds no new unreadable-slot line");
  assert.equal(r.unreadable2, "{not json");
  assert.equal(r.unreadableExport2, "{not json", "slot 2's unreadable bytes download exactly");
  assert.equal(r.bytes2, true);
  assert.equal(r.has2, false);
  assert.equal(r.resumed, true);
  assert.equal(r.scene, "act2_tether_sighting");
  assert.equal(r.active, 1);
  assert.equal(r.pointer, "1", "a successful load moves the pointer to the loaded slot");
  assert.equal(r.slot2Bytes, "{not json", "the unreadable slot 2 bytes are untouched");
  ok("unreadable slot 2 beside slot 1");
}

// 6. A save parked on a retired scene in slot 3 resumes at its exit, saved back to slot 3, exactly
//    as the same save resumes from slot 1 (the exit's own entry may move on from a bare state).
{
  const resumeFrom = slot => run(`
    const parked = snap("hold_bolts_again", { savedAt: 2 });
    const other = snap("priority_repairs", { savedAt: 1 });
    const parkedSlot = ${slot};
    const otherSlot = parkedSlot === 1 ? 2 : 1;
    localStorage.setItem(saveSlotKeys(parkedSlot).live, parked);
    localStorage.setItem(saveSlotKeys(otherSlot).live, other);
    localStorage.setItem(SAVE_POINTER_KEY, String(parkedSlot));
    const otherBefore = digest(keysOf(otherSlot));
    const resumed = resumeGame();
    const saved = JSON.parse(localStorage.getItem(saveSlotKeys(parkedSlot).live));
    return {
      resumed, scene: state.scene, active: activeSaveSlot, saved: saved.scene, entered: saved.sceneEntered,
      otherSame: digest(keysOf(otherSlot)) === otherBefore, exit: retiredSceneExit("hold_bolts_again")
    };
  `);
  const one = resumeFrom(1);
  const three = resumeFrom(3);
  assert.equal(three.resumed, true);
  assert.equal(three.exit, "act3_spine_next");
  assert.notEqual(three.scene, "hold_bolts_again", "a retired scene never resumes as itself");
  assert.equal(three.scene, one.scene, "slot 3 resumes the retired save exactly as slot 1 does");
  assert.equal(three.active, 3);
  assert.equal(three.saved, three.scene, "the resumed exit is saved to slot 3");
  assert.equal(three.entered, true);
  assert.equal(three.otherSame, true, "slot 1 untouched by a slot 3 resume");
  assert.equal(one.otherSame, true, "slot 2 untouched by a slot 1 resume");
  ok("retired-scene save in slot 3");
}

// 7. A pre-marker save in slot 2 enters its scene once, including when the marker write fails.
{
  const r = run(`
    globalThis.__slotEntries = 0;
    scenes.slot_marker_probe = { text: "Probe", onEnter: () => { globalThis.__slotEntries += 1; state.cohesion += 1; }, choices: [] };
    const premarker = JSON.parse(snap("slot_marker_probe", { savedAt: 9 }));
    delete premarker.sceneEntered;
    const premarkerRaw = JSON.stringify(premarker);
    const k2 = saveSlotKeys(2);
    localStorage.setItem(SAVE_KEY, snap("act2_tether_sighting", { savedAt: 1 }));
    localStorage.setItem(k2.live, premarkerRaw);
    localStorage.setItem(SAVE_POINTER_KEY, "2");
    const s1 = digest(SLOT1);
    const realSet = localStorage.setItem;
    localStorage.setItem = (key, value) => {
      if (key === k2.live && value.includes('"sceneEntered":true')) throw new Error("injected marker write failure");
      return realSet(key, value);
    };
    const first = resumeGame();
    const afterFirst = globalThis.__slotEntries;
    const pendingSlot = pendingLegacyResume && pendingLegacyResume.slot;
    const slot2AfterFail = localStorage.getItem(k2.live) === premarkerRaw;
    localStorage.setItem = realSet;
    const second = resumeGame();
    const afterSecond = globalThis.__slotEntries;
    const stored = JSON.parse(localStorage.getItem(k2.live));
    const third = resumeGame();
    return {
      first, afterFirst, pendingSlot, slot2AfterFail, second, afterSecond,
      storedEntered: stored.sceneEntered, storedCohesion: stored.cohesion, baseCohesion: premarker.cohesion,
      third, afterThird: globalThis.__slotEntries, pendingAfter: pendingLegacyResume,
      slot1: digest(SLOT1) === s1, active: activeSaveSlot
    };
  `);
  assert.equal(r.first, false, "a failed marker write returns to the title");
  assert.equal(r.afterFirst, 1);
  assert.equal(r.pendingSlot, 2, "the held one-time entry is tagged with its slot");
  assert.equal(r.slot2AfterFail, true, "slot 2 keeps its pre-marker bytes after the failure");
  assert.equal(r.second, true);
  assert.equal(r.afterSecond, 1, "the retry does not enter the scene a second time");
  assert.equal(r.storedEntered, true, "slot 2 now carries the marker");
  assert.equal(r.storedCohesion, r.baseCohesion + 1, "the one entry's effect is saved once");
  assert.equal(r.third, true);
  assert.equal(r.afterThird, 1, "later resumes stay pure");
  assert.equal(r.pendingAfter, null);
  assert.equal(r.slot1, true);
  assert.equal(r.active, 2);
  ok("pre-marker save in slot 2 enters once");
}

// 8. Play Again keeps a finished slot 2 on disk until the new run's first choice.
{
  const r = run(`
    localStorage.setItem(SAVE_KEY, snap("act2_tether_sighting", { savedAt: 1 }));
    const s1 = digest(SLOT1);
    const k2 = saveSlotKeys(2);
    beginFreshCampaign({ persist: true, slot: 2 });
    state.scene = "ending_check";
    persistSave({ silent: true });
    const finished = localStorage.getItem(k2.live);
    const meta = getSaveMeta(2);
    playAgain();
    if (typeof finishCinematic === "function" && currentCinematic) finishCinematic();
    const keptAfterPlayAgain = localStorage.getItem(k2.live) === finished;
    document.getElementById("game-screen").classList.remove("hidden");
    window.dispatchEvent({ type: "pagehide" });
    const keptAfterPagehide = localStorage.getItem(k2.live) === finished;
    const choices = scenes[state.scene].choices;
    makeChoice(choices[0]);
    const after = JSON.parse(localStorage.getItem(k2.live));
    return {
      metaFinished: meta.finished, metaSlot: meta.slot,
      keptAfterPlayAgain, keptAfterPagehide,
      replacedAfterChoice: localStorage.getItem(k2.live) !== finished && after.scene !== "ending_check",
      slot1: digest(SLOT1) === s1, active: activeSaveSlot
    };
  `);
  assert.equal(r.metaFinished, true);
  assert.equal(r.metaSlot, 2);
  assert.equal(r.keptAfterPlayAgain, true, "Play Again leaves the finished slot 2 run on disk");
  assert.equal(r.keptAfterPagehide, true, "a lifecycle save before the first choice keeps it");
  assert.equal(r.replacedAfterChoice, true, "the first choice saves the new run into slot 2");
  assert.equal(r.slot1, true, "slot 1 untouched throughout");
  assert.equal(r.active, 2, "Play Again stays in the same slot");
  ok("Play Again in slot 2");
}

// 9. Export from slot 2 gives slot 2's exact bytes, whether named or active.
{
  const r = run(`
    localStorage.setItem(SAVE_KEY, snap("act2_tether_sighting"));
    const raw2 = snap("priority_repairs", { gameVersion: "0.30.1", commanderCallsign: "Ash" });
    localStorage.setItem(saveSlotKeys(2).live, raw2);
    const named = buildSaveExport(2);
    activeSaveSlot = 2;
    const active = buildSaveExport();
    const meta = getSaveMeta(2);
    return { raw2, named, active, slot1Export: buildSaveExport(1).text === localStorage.getItem(SAVE_KEY), empty3: buildSaveExport(3), meta };
  `);
  assert.equal(r.named.text, r.raw2, "slot 2 export is its exact bytes");
  assert.equal(r.active.text, r.raw2, "export with no slot acts on the active slot");
  assert.match(r.named.filename, /^sunsplitter-save-v[^/]+-\d{4}-\d{2}-\d{2}\.json$/, "export filename unchanged");
  assert.equal(r.named.filename, r.active.filename);
  assert.equal(r.slot1Export, true);
  assert.equal(r.empty3, null);
  assert.equal(r.meta.callsign, "Ash");
  assert.equal(r.meta.finished, false);
  ok("slot 2 export exact");
}

// 10. Title, Continue and pointer behaviour around the default slot.
{
  const r = run(`
    const out = {};
    // A fresh device: Begin, no pointer until a run starts.
    showScreen("title"); refreshTitleResumeUI();
    out.beginLabel = document.getElementById("btn-begin").textContent;
    beginFreshCampaign({ persist: true });
    out.pointerAfterBegin = localStorage.getItem(SAVE_POINTER_KEY);
    out.liveAfterBegin = localStorage.getItem(SAVE_KEY) !== null;
    // A pointer write that fails never fails the run's save.
    localStorage.clear();
    const realSet = localStorage.setItem;
    localStorage.setItem = (key, value) => { if (key === SAVE_POINTER_KEY) throw new Error("blocked"); return realSet(key, value); };
    out.startedWithoutPointer = beginFreshCampaign({ persist: true });
    out.savedWithoutPointer = localStorage.getItem(SAVE_KEY) !== null;
    out.pointerMissing = localStorage.getItem(SAVE_POINTER_KEY);
    localStorage.setItem = realSet;
    // Continue's line describes the slot Continue resumes; Export follows the active slot.
    localStorage.clear();
    activeSaveSlot = 1;
    localStorage.setItem(saveSlotKeys(3).live, snap("act3_spine_next", { savedAt: Date.now() }));
    showScreen("title"); refreshTitleResumeUI();
    out.resumeShownForSlot3 = !document.getElementById("btn-resume").classList.contains("hidden");
    out.exportHiddenSlot1Empty = document.getElementById("btn-export-save").classList.contains("hidden");
    out.resumed3 = resumeGame();
    out.active3 = activeSaveSlot;
    out.pointer3 = localStorage.getItem(SAVE_POINTER_KEY);
    out.slot1Empty = SLOT1.every(key => localStorage.getItem(key) === null);
    // The in-run Save button and autosave act on the active slot.
    saveGame();
    out.slot1StillEmpty = SLOT1.every(key => localStorage.getItem(key) === null);
    // An event object passed by a handler means the active slot.
    out.eventArg = hasSave({ type: "click" });
    return out;
  `);
  assert.equal(r.beginLabel, "Begin");
  assert.equal(r.pointerAfterBegin, "1", "a new run in the default slot writes pointer 1");
  assert.equal(r.liveAfterBegin, true);
  assert.equal(r.startedWithoutPointer, true, "a failed pointer write does not fail a new run");
  assert.equal(r.savedWithoutPointer, true);
  assert.equal(r.pointerMissing, null);
  assert.equal(r.resumeShownForSlot3, true);
  assert.equal(r.exportHiddenSlot1Empty, true, "Export reads the active slot, which is empty");
  assert.equal(r.resumed3, true);
  assert.equal(r.active3, 3);
  assert.equal(r.pointer3, "3");
  assert.equal(r.slot1Empty, true);
  assert.equal(r.slot1StillEmpty, true, "Save in a slot 3 run writes slot 3 only");
  assert.equal(r.eventArg, true, "a non-slot argument falls back to the active slot");
  ok("title, Continue and pointer");
}

console.log(`PASS sun-playerflow-save-slots: ${results.length} groups (${results.join("; ")})`);
