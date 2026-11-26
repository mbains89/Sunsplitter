// Saves and resume: export/import custody, Play Again without consuming a completed save, an
// unknown scene or malformed snapshot failing closed, autosave write failure, resume not re-running
// a completed scene entry, and save-version compatibility.
// Moved out of scripts/verify.mjs unchanged; verify.mjs imports and runs every check here.

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { readEngineSource } from "../simulate.mjs";
import { ROOT } from "./shared.mjs";

export async function saveTransferChecks(runtime) {
  const errors = [];
  const indexSource = readFileSync(resolve(ROOT, "index.html"), "utf8");
  const engineSource = readEngineSource(ROOT);
  for (const required of [
    'id="btn-export-save"',
    'onclick="exportSaveFile()"',
    'id="btn-import-save"',
    'onclick="requestSaveImport()"',
    'id="save-import-file"',
    'accept="application/json,.json"',
    'onchange="handleSaveImportSelection(this)"',
    'id="title-save-status"',
    'aria-live="polite"'
  ]) {
    if (!indexSource.includes(required)) errors.push(`save transfer UI missing ${required}`);
  }
  if (/file\.name[^\n]+\\\.json/.test(engineSource)) errors.push("save import incorrectly treats a filename extension as authority");

  const fixture = runtime.evaluate(`(() => {
    const stateDigest = () => JSON.stringify(state);
    const storageDigest = () => JSON.stringify({
      live: localStorage.getItem(SAVE_KEY),
      legacy: localStorage.getItem(SAVE_KEY_LEGACY),
      staging: localStorage.getItem(SAVE_STAGING_KEY),
      backup: localStorage.getItem(SAVE_BACKUP_KEY)
    });
    const titleStatus = () => {
      const el = document.getElementById("title-save-status");
      return { text: el.textContent, error: el.classList.contains("error") };
    };
    const makeSnapshot = (scene, cohesion, marker = true) => {
      resetRunState();
      state.scene = scene;
      state.cohesion = cohesion;
      state.flags.transfer_fixture = cohesion;
      const snap = snapshotState();
      if (!marker) delete snap.sceneEntered;
      return snap;
    };

    localStorage.clear();
    const noSaveExport = buildSaveExport();
    const noSlotCandidate = makeSnapshot("wake", 33);
    const noSlotRaw = JSON.stringify(noSlotCandidate);
    let noSlotConfirmCalls = 0;
    window.confirm = () => { noSlotConfirmCalls += 1; return false; };
    const noSlotImportOk = importSaveText(noSlotRaw);
    const noSlotImport = {
      ok: noSlotImportOk,
      confirmCalls: noSlotConfirmCalls,
      noStorageCreated: storageDigest() === JSON.stringify({ live: null, legacy: null, staging: null, backup: null })
    };

    const priorSnapshot = makeSnapshot("wake", 19);
    const priorRaw = JSON.stringify(priorSnapshot);
    localStorage.setItem(SAVE_KEY, priorRaw);
    resetRunState();
    state.scene = "priority_repairs";
    state.cohesion = 27;
    const priorLive = stateDigest();
    const priorStorage = storageDigest();
    const exported = buildSaveExport();
    const exportCurrent = {
      exact: exported && exported.text === priorRaw,
      filename: exported && exported.filename,
      gameVersion: exported && JSON.parse(exported.text).gameVersion,
      storagePreserved: storageDigest() === priorStorage,
      livePreserved: stateDigest() === priorLive
    };

    localStorage.setItem(SAVE_BACKUP_KEY, priorRaw);
    localStorage.setItem(SAVE_KEY, '{"scene":"wake","broken":');
    const backupExport = buildSaveExport();
    const exportBackupExact = backupExport && backupExport.text === priorRaw;

    localStorage.clear();
    localStorage.setItem(SAVE_KEY, priorRaw);
    const candidate = makeSnapshot("act2_spine_next", 31);
    candidate.gameVersion = "0.29";
    const candidateRaw = JSON.stringify(candidate);
    resetRunState();
    state.scene = "priority_repairs";
    state.cohesion = 27;
    const cancelStorageBefore = storageDigest();
    const cancelLiveBefore = stateDigest();
    let confirmCalls = 0;
    window.confirm = () => { confirmCalls += 1; return false; };
    const cancelOk = importSaveText(candidateRaw);
    const cancelled = {
      ok: cancelOk,
      confirmCalls,
      storagePreserved: storageDigest() === cancelStorageBefore,
      livePreserved: stateDigest() === cancelLiveBefore,
      status: titleStatus()
    };

    const rejected = {};
    const rejectCase = (name, raw) => {
      const beforeStorage = storageDigest();
      const beforeLive = stateDigest();
      confirmCalls = 0;
      window.confirm = () => { confirmCalls += 1; return true; };
      const ok = importSaveText(raw);
      rejected[name] = {
        ok,
        confirmCalls,
        storagePreserved: storageDigest() === beforeStorage,
        livePreserved: stateDigest() === beforeLive,
        status: titleStatus()
      };
    };
    rejectCase("empty", "");
    rejectCase("malformed", '{"v":3');
    const unknown = Object.assign({}, candidate, { scene: "missing_transfer_scene" });
    rejectCase("unknown", JSON.stringify(unknown));
    const future = Object.assign({}, candidate, { v: SAVE_SCHEMA_VERSION + 1 });
    rejectCase("future", JSON.stringify(future));
    const poison = Object.assign({}, candidate, { constructor: { prototype: "fixture" } });
    rejectCase("poison", JSON.stringify(poison));
    const corruptAffinity = Object.assign({}, candidate, { affinity: Object.assign({}, candidate.affinity, { lena: { score: 12 } }) });
    rejectCase("corruptAffinity", JSON.stringify(corruptAffinity));
    const corruptRecovery = Object.assign({}, candidate, { recovered: Object.assign({}, candidate.recovered, { vess: "yes" }) });
    rejectCase("corruptRecovery", JSON.stringify(corruptRecovery));
    const corruptIdeology = Object.assign({}, candidate, { ideology: { future: { score: 3 }, living: 1 } });
    rejectCase("corruptIdeology", JSON.stringify(corruptIdeology));
    const typeConfusedFlag = Object.assign({}, candidate, {
      flags: Object.assign({}, candidate.flags, { last_tx_spent: "false" })
    });
    rejectCase("typeConfusedFlag", JSON.stringify(typeConfusedFlag));
    rejectCase("oversized", " ".repeat(MAX_IMPORT_BYTES + 1));
    const bomAccepted = inspectSaveImportText("\\uFEFF" + candidateRaw).ok;

    const pairSnapshot = Object.assign({}, candidate, {
      romance: Object.assign({}, candidate.romance, { amara_tomas: true }),
      marks: Object.assign({}, candidate.marks, { conflict: "backed", sela: { spoken: true } })
    });
    const validPairAndNonCrewMark = inspectSaveImportText(JSON.stringify(pairSnapshot)).ok;

    localStorage.setItem(SAVE_KEY_LEGACY, JSON.stringify(makeSnapshot("wake", 44, false)));
    resetRunState();
    state.scene = "priority_repairs";
    state.cohesion = 27;
    const successLiveBefore = stateDigest();
    confirmCalls = 0;
    window.confirm = () => { confirmCalls += 1; return true; };
    const successOk = importSaveText(candidateRaw);
    const successful = {
      ok: successOk,
      confirmCalls,
      exact: localStorage.getItem(SAVE_KEY) === candidateRaw,
      legacyRetired: localStorage.getItem(SAVE_KEY_LEGACY) === null,
      transactionCleared: localStorage.getItem(SAVE_STAGING_KEY) === null && localStorage.getItem(SAVE_BACKUP_KEY) === null,
      livePreserved: stateDigest() === successLiveBefore,
      resumeVisible: !document.getElementById("btn-resume").classList.contains("hidden"),
      exportVisible: !document.getElementById("btn-export-save").classList.contains("hidden"),
      status: titleStatus()
    };
    successful.resumeOk = resumeGame();
    successful.resumedScene = state.scene;
    successful.resumedCohesion = state.cohesion;

    localStorage.clear();
    localStorage.setItem(SAVE_KEY, priorRaw);
    resetRunState();
    state.scene = "priority_repairs";
    state.cohesion = 27;
    const interruptedStorageBefore = storageDigest();
    const interruptedLiveBefore = stateDigest();
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = (key, value) => {
      if (key === SAVE_KEY && value === candidateRaw) throw new Error("injected import commit failure");
      return originalSetItem(key, value);
    };
    window.confirm = () => true;
    const interruptedOk = importSaveText(candidateRaw);
    localStorage.setItem = originalSetItem;
    const interrupted = {
      ok: interruptedOk,
      storagePreserved: storageDigest() === interruptedStorageBefore,
      livePreserved: stateDigest() === interruptedLiveBefore,
      status: titleStatus()
    };

    localStorage.clear();
    localStorage.setItem(SAVE_KEY, priorRaw);
    resetRunState();
    const destructiveOriginalSetItem = localStorage.setItem;
    localStorage.setItem = (key, value) => {
      if (key === SAVE_KEY && value === candidateRaw) {
        destructiveOriginalSetItem(key, value);
        throw new Error("injected failure after destructive candidate write");
      }
      if (key === SAVE_KEY && value === priorRaw) throw new Error("injected live restore failure");
      return destructiveOriginalSetItem(key, value);
    };
    window.confirm = () => true;
    const destructiveInterruptedOk = importSaveText(candidateRaw);
    localStorage.setItem = destructiveOriginalSetItem;
    const destructiveInterrupted = {
      ok: destructiveInterruptedOk,
      liveStillCandidate: localStorage.getItem(SAVE_KEY) === candidateRaw,
      effectiveOriginal: readRawSave() === priorRaw,
      backupOriginal: localStorage.getItem(SAVE_BACKUP_KEY) === priorRaw,
      stagedCandidate: localStorage.getItem(SAVE_STAGING_KEY) === candidateRaw,
      status: titleStatus()
    };

    localStorage.clear();
    const legacy = makeSnapshot("act2_tether_sighting", 36, false);
    delete legacy.v;
    delete legacy.gameVersion;
    const legacyRaw = JSON.stringify(legacy);
    resetRunState();
    window.confirm = () => true;
    const legacyImportOk = importSaveText(legacyRaw);
    const legacyStoredExact = localStorage.getItem(SAVE_KEY) === legacyRaw;
    const legacyResumeOk = resumeGame();
    const upgradedLegacy = JSON.parse(localStorage.getItem(SAVE_KEY));

    localStorage.clear();
    pendingLegacyResume = null;
    globalThis.__legacyEntryCalls = 0;
    scenes.transfer_legacy_probe = {
      text: "Migration probe",
      onEnter: () => { globalThis.__legacyEntryCalls += 1; state.cohesion += 1; },
      choices: []
    };
    const markerless = makeSnapshot("transfer_legacy_probe", 30, false);
    markerless.v = 2;
    const markerlessRaw = JSON.stringify(markerless);
    window.confirm = () => true;
    const markerlessImportOk = importSaveText(markerlessRaw);
    const migrationOriginalSetItem = localStorage.setItem;
    localStorage.setItem = (key, value) => {
      if (key === SAVE_KEY && value.includes('"sceneEntered":true')) throw new Error("injected legacy marker write failure");
      return migrationOriginalSetItem(key, value);
    };
    const firstMigrationResume = resumeGame();
    const firstMigrationCalls = globalThis.__legacyEntryCalls;
    const firstMigrationStatus = titleStatus();
    localStorage.setItem = migrationOriginalSetItem;
    const secondMigrationResume = resumeGame();
    const migrationRetry = {
      importOk: markerlessImportOk,
      firstOk: firstMigrationResume,
      firstCalls: firstMigrationCalls,
      firstStatus: firstMigrationStatus,
      secondOk: secondMigrationResume,
      finalCalls: globalThis.__legacyEntryCalls,
      cohesion: state.cohesion,
      marker: JSON.parse(localStorage.getItem(SAVE_KEY)).sceneEntered
    };
    delete scenes.transfer_legacy_probe;

    localStorage.clear();
    const completed = makeSnapshot("ending_check", 22);
    completed.flags.ending = "The Quiet Ship";
    const completedRaw = JSON.stringify(completed);
    resetRunState();
    window.confirm = () => true;
    const completedImportOk = importSaveText(completedRaw);
    const completedResumeOk = resumeGame();
    const completedScene = state.scene;
    playAgain();
    const completedPreservedAfterPlayAgain = localStorage.getItem(SAVE_KEY) === completedRaw;

    return {
      noSaveExport,
      noSlotImport,
      exportCurrent,
      exportBackupExact,
      cancelled,
      rejected,
      bomAccepted,
      validPairAndNonCrewMark,
      successful,
      interrupted,
      destructiveInterrupted,
      legacy: {
        importOk: legacyImportOk,
        storedExact: legacyStoredExact,
        resumeOk: legacyResumeOk,
        scene: state.scene,
        upgraded: upgradedLegacy.v === SAVE_SCHEMA_VERSION && upgradedLegacy.sceneEntered === true
      },
      migrationRetry,
      completed: {
        importOk: completedImportOk,
        resumeOk: completedResumeOk,
        scene: completedScene,
        preservedAfterPlayAgain: completedPreservedAfterPlayAgain
      }
    };
  })()`);

  if (fixture.noSaveExport !== null) errors.push("export prepared a file without a valid save");
  if (fixture.noSlotImport.ok || fixture.noSlotImport.confirmCalls !== 1 || !fixture.noSlotImport.noStorageCreated) {
    errors.push("import without a current slot did not confirm before writing");
  }
  if (!fixture.exportCurrent.exact || !fixture.exportCurrent.storagePreserved || !fixture.exportCurrent.livePreserved) {
    errors.push("export did not preserve and return the exact effective save bytes");
  }
  if (!/^sunsplitter-save-v[^/]+-\d{4}-\d{2}-\d{2}\.json$/.test(fixture.exportCurrent.filename || "")) {
    errors.push(`export filename is not bounded/versioned: ${JSON.stringify(fixture.exportCurrent.filename)}`);
  }
  if (fixture.exportCurrent.gameVersion !== "0.36" || !fixture.exportCurrent.filename?.includes("sunsplitter-save-v0.36-")) {
    errors.push(`save/export identity is not painted to 0.36: ${JSON.stringify(fixture.exportCurrent)}`);
  }
  if (!fixture.exportBackupExact) errors.push("export did not select the verified backup when the live slot was corrupt");
  if (fixture.cancelled.ok || fixture.cancelled.confirmCalls !== 1 ||
      !fixture.cancelled.storagePreserved || !fixture.cancelled.livePreserved || fixture.cancelled.status.text !== "Import cancelled") {
    errors.push("cancelled import changed state/storage or lacked clear title feedback");
  }
  for (const [name, result] of Object.entries(fixture.rejected)) {
    if (result.ok || result.confirmCalls !== 0 || !result.storagePreserved || !result.livePreserved ||
        !result.status.error || !result.status.text.startsWith("Import rejected ·")) {
      errors.push(`${name} import did not reject before confirmation and mutation`);
    }
  }
  if (!fixture.bomAccepted) errors.push("valid JSON with one UTF-8 BOM was rejected");
  if (!fixture.validPairAndNonCrewMark) errors.push("valid pair romance or authored non-crew mark was rejected");
  if (!fixture.successful.ok || fixture.successful.confirmCalls !== 1 || !fixture.successful.exact ||
      !fixture.successful.legacyRetired || !fixture.successful.transactionCleared || !fixture.successful.livePreserved ||
      !fixture.successful.resumeVisible || !fixture.successful.exportVisible) {
    errors.push("valid import did not commit exactly, retire legacy, preserve live state, and refresh title controls");
  }
  if (fixture.successful.status.text !== "Imported · Continue to load" || fixture.successful.status.error) {
    errors.push(`successful import title feedback mismatch: ${JSON.stringify(fixture.successful.status)}`);
  }
  if (!fixture.successful.resumeOk || fixture.successful.resumedScene !== "act2_spine_next" || fixture.successful.resumedCohesion !== 31) {
    errors.push("Continue did not load the successfully imported run");
  }
  if (fixture.interrupted.ok || !fixture.interrupted.storagePreserved || !fixture.interrupted.livePreserved ||
      fixture.interrupted.status.text !== "Import failed · original slot kept" || !fixture.interrupted.status.error) {
    errors.push("interrupted import did not restore the original slot and live state");
  }
  if (fixture.destructiveInterrupted.ok || !fixture.destructiveInterrupted.liveStillCandidate ||
      !fixture.destructiveInterrupted.effectiveOriginal || !fixture.destructiveInterrupted.backupOriginal ||
      !fixture.destructiveInterrupted.stagedCandidate || fixture.destructiveInterrupted.status.text !== "Import failed · original slot kept") {
    errors.push("destructive import failure did not keep the original slot authoritative through the backup");
  }
  if (!fixture.legacy.importOk || !fixture.legacy.storedExact || !fixture.legacy.resumeOk || !fixture.legacy.upgraded) {
    errors.push("legacy import did not remain exact until Continue and then upgrade once");
  }
  if (!fixture.migrationRetry.importOk || fixture.migrationRetry.firstOk || fixture.migrationRetry.firstCalls !== 1 ||
      !fixture.migrationRetry.firstStatus.error || fixture.migrationRetry.firstStatus.text === "Resumed" ||
      !fixture.migrationRetry.secondOk || fixture.migrationRetry.finalCalls !== 1 ||
      fixture.migrationRetry.cohesion !== 31 || fixture.migrationRetry.marker !== true) {
    errors.push(`interrupted legacy marker upgrade replayed scene entry or reported success: ${JSON.stringify(fixture.migrationRetry)}`);
  }
  if (!fixture.completed.importOk || !fixture.completed.resumeOk || fixture.completed.scene !== "ending_check" ||
      !fixture.completed.preservedAfterPlayAgain) {
    errors.push("completed-run import did not resume and survive Play Again unchanged");
  }

  const browserFixture = await runtime.evaluate(`(async () => {
    localStorage.clear();
    resetRunState();
    state.scene = "wake";
    const raw = JSON.stringify(snapshotState());
    localStorage.setItem(SAVE_KEY, raw);

    const input = document.getElementById("save-import-file");
    let pickerClicks = 0;
    input.value = "stale-selection";
    input.click = () => { pickerClicks += 1; };
    const pickerOk = requestSaveImport();
    const pickerReset = input.value === "";

    const originalBody = document.body;
    const originalCreateElement = document.createElement;
    const originalBlob = globalThis.Blob;
    const originalCreateObjectURL = URL.createObjectURL;
    const originalRevokeObjectURL = URL.revokeObjectURL;
    const originalSetTimeout = globalThis.setTimeout;
    let clicked = 0;
    let removed = 0;
    let revoked = null;
    let revokeDelay = null;
    let createdBlob = null;
    let createdLink = null;
    try {
      document.body = {
        appendChild(link) { link.parentNode = this; createdLink = link; return link; },
        removeChild(link) { if (link === createdLink) removed += 1; link.parentNode = null; }
      };
      document.createElement = tag => ({ tag, hidden: false, href: "", download: "", parentNode: null, click() { clicked += 1; } });
      globalThis.Blob = class BlobProbe {
        constructor(parts, options) { this.parts = parts; this.options = options; createdBlob = this; }
      };
      URL.createObjectURL = blob => blob === createdBlob ? "blob:save-transfer-probe" : "blob:unexpected";
      URL.revokeObjectURL = url => { revoked = url; };
      globalThis.setTimeout = (fn, delay) => {
        if (delay >= 60_000) { revokeDelay = delay; fn(); }
        return 1;
      };
      const exportOk = exportSaveFile();
      var exportResult = {
        ok: exportOk,
        clicked,
        removed,
        exactBytes: createdBlob && createdBlob.parts.length === 1 && createdBlob.parts[0] === raw,
        mime: createdBlob && createdBlob.options && createdBlob.options.type,
        filename: createdLink && createdLink.download,
        revoked,
        revokeDelay,
        status: document.getElementById("title-save-status").textContent
      };
    } finally {
      document.body = originalBody;
      document.createElement = originalCreateElement;
      globalThis.Blob = originalBlob;
      URL.createObjectURL = originalCreateObjectURL;
      URL.revokeObjectURL = originalRevokeObjectURL;
      globalThis.setTimeout = originalSetTimeout;
    }

    const candidate = JSON.parse(raw);
    candidate.cohesion = 37;
    const candidateRaw = JSON.stringify(candidate);
    let confirmCalls = 0;
    window.confirm = () => { confirmCalls += 1; return true; };
    input.files = [{ name: "renamed-save-without-extension", size: candidateRaw.length, text: async () => candidateRaw }];
    input.value = "selected";
    const selectedOk = await handleSaveImportSelection(input);

    globalThis.FileReader = class FileReaderProbe {
      readAsText(file) { this.result = file.contents; this.onload(); }
    };
    const fallbackText = await readSaveImportFile({ contents: candidateRaw });

    return {
      pickerOk,
      pickerClicks,
      pickerReset,
      exportResult,
      selectedOk,
      confirmCalls,
      selectedExact: localStorage.getItem(SAVE_KEY) === candidateRaw,
      inputReset: input.value === "",
      fallbackExact: fallbackText === candidateRaw
    };
  })()`);
  if (!browserFixture.pickerOk || browserFixture.pickerClicks !== 1 || !browserFixture.pickerReset) {
    errors.push("title import control did not reset and open the file picker");
  }
  const exported = browserFixture.exportResult;
  if (!exported.ok || exported.clicked !== 1 || exported.removed !== 1 || !exported.exactBytes ||
      exported.mime !== "application/json" || !exported.filename?.endsWith(".json") ||
      exported.revoked !== "blob:save-transfer-probe" || exported.revokeDelay < 1_000 || exported.status !== "Export prepared") {
    errors.push(`browser export path did not preserve bytes/click/cleanup/feedback: ${JSON.stringify(exported)}`);
  }
  if (!browserFixture.selectedOk || browserFixture.confirmCalls !== 1 || !browserFixture.selectedExact ||
      !browserFixture.inputReset || !browserFixture.fallbackExact) {
    errors.push("browser import path rejected renamed content, skipped fallback read, or failed to reset selection");
  }
  return errors;
}

export function playAgainChecks(runtime) {
  const errors = [];
  const indexSource = readFileSync(resolve(ROOT, "index.html"), "utf8");
  if (indexSource.includes('onclick="location.reload()"')) {
    errors.push("Play Again still reloads the page instead of starting a fresh campaign");
  }
  const playAgainWires = (indexSource.match(/onclick="playAgain\(\)"/g) || []).length;
  if (playAgainWires !== 2) errors.push(`Play Again wiring count ${playAgainWires} != 2`);

  const fixture = runtime.evaluate(`(() => {
    resetRunState();
    state.scene = "ending_check";
    state.cohesion = 18;
    state.flags.crisis = "vent";
    state.flags.final = "endure";
    kill("rourke", "died with company");
    state.survivors = 4;
    persistSave({ silent: true });
    const completedRaw = localStorage.getItem("sunsplitter_save_v3");
    const completed = JSON.parse(completedRaw);
    resolveEnding();
    playAgain();
    const afterPlayAgainRaw = localStorage.getItem("sunsplitter_save_v3");
    const afterPlayAgain = JSON.parse(afterPlayAgainRaw);
    finishCinematic(); // Preserve the same fresh-game assertion after explicit Skip.
    const gameVisible = !document.getElementById("game-screen").classList.contains("hidden");
    const endingHidden = document.getElementById("ending-screen").classList.contains("hidden");
    const remainsHidden = document.getElementById("what-remains-screen").classList.contains("hidden");
    const live = {
      scene: state.scene,
      survivors: state.survivors,
      cohesion: state.cohesion,
      dead: (state.dead || []).slice(),
      crisis: state.flags.crisis || null,
      final: state.flags.final || null
    };
    const continueOk = resumeGame();
    const continuedRaw = localStorage.getItem("sunsplitter_save_v3");
    const continued = {
      scene: state.scene,
      survivors: state.survivors,
      cohesion: state.cohesion,
      dead: (state.dead || []).slice(),
      crisis: state.flags.crisis || null,
      final: state.flags.final || null
    };
    resetRunState();
    state.scene = "ending_check";
    persistSave({ silent: true });
    const remainsCompletedRaw = localStorage.getItem("sunsplitter_save_v3");
    resolveEnding();
    showWhatRemains();
    playAgain();
    const remainsAfterRaw = localStorage.getItem("sunsplitter_save_v3");
    const remainsLiveScene = state.scene;
    const remainsContinueOk = resumeGame();
    return {
      completedScene: completed.scene,
      completedSurvivors: completed.survivors,
      completedDead: completed.dead.slice(),
      afterPlayAgainEqualsCompleted: afterPlayAgainRaw === completedRaw,
      afterScene: afterPlayAgain.scene,
      afterSurvivors: afterPlayAgain.survivors,
      gameVisible,
      endingHidden,
      remainsHidden,
      live,
      continueOk,
      continuedRawEqualsCompleted: continuedRaw === completedRaw,
      continued,
      remainsAfterEqualsCompleted: remainsAfterRaw === remainsCompletedRaw,
      remainsLiveScene,
      remainsContinueOk,
      remainsContinuedScene: state.scene
    };
  })()`);

  if (fixture.completedScene !== "ending_check") errors.push(`fixture completed scene ${fixture.completedScene} != ending_check`);
  if (!fixture.afterPlayAgainEqualsCompleted) errors.push("Play Again mutated or replaced the completed save blob");
  if (fixture.afterScene !== "ending_check" || fixture.afterSurvivors !== 4) {
    errors.push("completed save on disk did not keep ending_check / distinctive survivors after Play Again");
  }
  if (!fixture.gameVisible || !fixture.endingHidden || !fixture.remainsHidden) {
    errors.push("Play Again did not boot the game screen as a fresh campaign");
  }
  if (fixture.live.scene !== "wake") errors.push(`Play Again live scene ${fixture.live.scene} != wake`);
  if (fixture.live.survivors !== 9) errors.push(`Play Again live survivors ${fixture.live.survivors} != fresh 9`);
  if (fixture.live.cohesion !== 48) errors.push(`Play Again live cohesion ${fixture.live.cohesion} != fresh 48`);
  if (fixture.live.dead.length) errors.push("Play Again applied completed deaths into the new run");
  if (fixture.live.crisis || fixture.live.final) errors.push("Play Again applied completed ending flags into the new run");
  if (!fixture.continueOk) errors.push("Continue failed after Play Again");
  if (!fixture.continuedRawEqualsCompleted) errors.push("Continue mutated the completed save blob");
  if (fixture.continued.scene !== "ending_check") errors.push(`Continue scene ${fixture.continued.scene} != ending_check`);
  if (fixture.continued.survivors !== 4) errors.push(`Continue survivors ${fixture.continued.survivors} != completed 4`);
  if (!fixture.continued.dead.includes("rourke")) errors.push("Continue did not restore the completed death list");
  if (fixture.continued.crisis !== "vent" || fixture.continued.final !== "endure") {
    errors.push("Continue did not restore the completed ending flags");
  }
  if (!fixture.remainsAfterEqualsCompleted) errors.push("Play Again from What Remains mutated the completed save blob");
  if (fixture.remainsLiveScene !== "wake") errors.push(`What Remains Play Again live scene ${fixture.remainsLiveScene} != wake`);
  if (!fixture.remainsContinueOk || fixture.remainsContinuedScene !== "ending_check") {
    errors.push("Continue after What Remains Play Again did not restore the completed blob");
  }
  return errors;
}

export function unknownSaveSceneChecks(runtime) {
  const errors = [];
  const fixture = runtime.evaluate(`(() => {
    resetRunState();
    state.scene = "wake";
    persistSave({ silent: true });
    const malformed = JSON.parse(localStorage.getItem("sunsplitter_save_v3"));
    malformed.scene = "missing_scene";
    malformed.cohesion = 17;
    const raw = JSON.stringify(malformed);
    localStorage.setItem("sunsplitter_save_v3", raw);
    localStorage.removeItem("sunsplitter_save_v2");
    localStorage.removeItem("sunsplitter_save_v3_staging");
    localStorage.removeItem("sunsplitter_save_v3_backup");

    resetRunState();
    refreshTitleResumeUI();
    const before = { scene: state.scene, cohesion: state.cohesion };
    const hasBeforeLoad = hasSave();
    const effectiveBeforeLoad = readRawSave();
    const resumeVisible = !document.getElementById("btn-resume").classList.contains("hidden");
    const beginText = document.getElementById("btn-begin").textContent;
    const exportVisible = !document.getElementById("btn-export-save").classList.contains("hidden");
    const ok = loadGame();
    const after = { scene: state.scene, cohesion: state.cohesion };

    const legacy = snapshotState();
    legacy.cohesion = 23;
    legacy.sceneEntered = true;
    const legacyRaw = JSON.stringify(legacy);
    localStorage.setItem("sunsplitter_save_v3", raw);
    localStorage.setItem("sunsplitter_save_v2", legacyRaw);
    resetRunState();
    const fallbackEffective = readRawSave();
    const fallbackHasSave = hasSave();
    const fallbackOk = loadGame();
    return {
      ok,
      before,
      after,
      hasBeforeLoad,
      effectiveBeforeLoad,
      resumeVisible,
      beginText,
      exportVisible,
      story: document.getElementById("story").innerHTML,
      savePreserved: localStorage.getItem("sunsplitter_save_v3") === raw,
      fallbackEffectiveIsLegacy: fallbackEffective === legacyRaw,
      fallbackHasSave,
      fallbackOk,
      fallbackScene: state.scene,
      fallbackCohesion: state.cohesion,
      corruptV3Preserved: localStorage.getItem("sunsplitter_save_v3") === raw,
      legacyPreserved: localStorage.getItem("sunsplitter_save_v2") === legacyRaw
    };
  })()`);

  if (fixture.ok) errors.push("unknown-scene save reported a successful resume");
  if (fixture.after.scene !== fixture.before.scene || fixture.after.cohesion !== fixture.before.cohesion) {
    errors.push(`unknown-scene save mutated live state: ${JSON.stringify(fixture.after)}`);
  }
  if (fixture.story.includes("Scene missing:")) errors.push("unknown-scene save rendered the zero-choice missing-scene trap");
  if (!fixture.savePreserved) errors.push("failed unknown-scene load replaced or removed the original save blob");
  if (fixture.hasBeforeLoad || fixture.effectiveBeforeLoad !== null) {
    errors.push("unknown-scene save still counts as a resumable slot");
  }
  if (fixture.resumeVisible || fixture.beginText !== "Begin" || fixture.exportVisible) {
    errors.push("unknown-scene save still traps the title UI behind Continue/New run controls");
  }
  if (!fixture.fallbackEffectiveIsLegacy || !fixture.fallbackHasSave || !fixture.fallbackOk || fixture.fallbackScene !== "wake" || fixture.fallbackCohesion !== 23) {
    errors.push("corrupt v3 slot masks the valid legacy fallback");
  }
  if (!fixture.corruptV3Preserved || !fixture.legacyPreserved) {
    errors.push("legacy fallback mutated stored save bytes");
  }
  return errors;
}

export function malformedSnapshotShapeChecks(runtime) {
  const errors = [];
  const fixture = runtime.evaluate(`(() => {
    resetRunState();
    state.scene = "wake";
    const valid = snapshotState();
    const malformed = Object.assign({}, valid, { cohesion: 17, flags: "not-an-object" });
    const raw = JSON.stringify(malformed);
    localStorage.setItem("sunsplitter_save_v3", raw);
    localStorage.removeItem("sunsplitter_save_v2");
    localStorage.removeItem("sunsplitter_save_v3_staging");
    localStorage.removeItem("sunsplitter_save_v3_backup");

    resetRunState();
    const before = { scene: state.scene, cohesion: state.cohesion, flags: Object.assign({}, state.flags) };
    const ok = loadGame();
    const after = { scene: state.scene, cohesion: state.cohesion, flags: Object.assign({}, state.flags) };

    const legacy = Object.assign({}, valid, { v: 2, cohesion: 23 });
    delete legacy.recovered;
    delete legacy.promises;
    delete legacy.crisisPath;
    resetRunState();
    const legacyOk = applySnapshot(legacy);
    return {
      ok,
      before,
      after,
      savePreserved: localStorage.getItem("sunsplitter_save_v3") === raw,
      legacyOk,
      legacyCohesion: state.cohesion,
      legacyRecovered: Object.assign({}, state.recovered)
    };
  })()`);

  if (fixture.ok) errors.push("malformed snapshot shape reported a successful resume");
  if (JSON.stringify(fixture.after) !== JSON.stringify(fixture.before)) {
    errors.push(`malformed snapshot shape partially mutated live state: ${JSON.stringify(fixture.after)}`);
  }
  if (!fixture.savePreserved) errors.push("failed malformed snapshot load replaced or removed the original save blob");
  if (!fixture.legacyOk || fixture.legacyCohesion !== 23) errors.push("valid legacy v2 snapshot no longer loads");
  if (fixture.legacyRecovered.tomas || fixture.legacyRecovered.jiro || fixture.legacyRecovered.vess) {
    errors.push("valid legacy v2 snapshot lost missing-recovery defaults");
  }
  return errors;
}

export function saveWriteFailureChecks(runtime) {
  const errors = [];
  const fixture = runtime.evaluate(`(() => {
    const statusSnapshot = () => {
      const el = document.getElementById("save-status");
      return {
        text: el.textContent,
        error: el.classList.contains("error"),
        visible: el.classList.contains("visible")
      };
    };
    const originalSetItem = localStorage.setItem;

    localStorage.clear();
    resetRunState();
    state.scene = "wake";
    state.cohesion = 31;
    persistSave({ silent: true });
    const priorRaw = localStorage.getItem(SAVE_KEY);

    state.scene = "breath_hub";
    state.cohesion = 17;
    let commitCalls = 0;
    localStorage.setItem = (key, value) => {
      if (key === SAVE_KEY && commitCalls++ === 0) {
        originalSetItem(key, '{"truncated":');
        throw new Error("injected commit failure");
      }
      return originalSetItem(key, value);
    };
    const failedOk = persistSave({ silent: true });
    localStorage.setItem = originalSetItem;
    const failed = {
      ok: failedOk,
      priorPreserved: localStorage.getItem(SAVE_KEY) === priorRaw,
      stagingCleared: localStorage.getItem(SAVE_STAGING_KEY) === null,
      backupCleared: localStorage.getItem(SAVE_BACKUP_KEY) === null,
      liveScene: state.scene,
      liveCohesion: state.cohesion,
      status: statusSnapshot()
    };

    const retryOk = persistSave({ silent: true });
    const retry = {
      ok: retryOk,
      scene: JSON.parse(localStorage.getItem(SAVE_KEY)).scene,
      cohesion: JSON.parse(localStorage.getItem(SAVE_KEY)).cohesion,
      stagingCleared: localStorage.getItem(SAVE_STAGING_KEY) === null,
      backupCleared: localStorage.getItem(SAVE_BACKUP_KEY) === null,
      status: statusSnapshot()
    };

    localStorage.clear();
    resetRunState();
    state.scene = "wake";
    state.cohesion = 29;
    persistSave({ silent: true });
    const fallbackPriorRaw = localStorage.getItem(SAVE_KEY);
    state.scene = "breath_hub";
    state.cohesion = 11;
    let destructiveCalls = 0;
    localStorage.setItem = (key, value) => {
      if (key === SAVE_KEY) {
        destructiveCalls += 1;
        if (destructiveCalls === 1) originalSetItem(key, '{"truncated":');
        throw new Error("injected destructive commit/restore failure");
      }
      return originalSetItem(key, value);
    };
    const fallbackOk = persistSave({ silent: true });
    const fallback = {
      ok: fallbackOk,
      liveCorrupt: localStorage.getItem(SAVE_KEY) !== fallbackPriorRaw,
      backupPreserved: localStorage.getItem(SAVE_BACKUP_KEY) === fallbackPriorRaw,
      readUsesBackup: readRawSave() === fallbackPriorRaw,
      status: statusSnapshot()
    };
    localStorage.setItem = originalSetItem;
    resetRunState();
    fallback.loadOk = loadGame();
    fallback.loadedScene = state.scene;
    fallback.loadedCohesion = state.cohesion;
    state.scene = "breath_hub";
    state.cohesion = 9;
    fallback.retryOk = persistSave({ silent: true });
    fallback.retryScene = JSON.parse(localStorage.getItem(SAVE_KEY)).scene;
    fallback.retryCohesion = JSON.parse(localStorage.getItem(SAVE_KEY)).cohesion;
    fallback.transactionCleared = localStorage.getItem(SAVE_STAGING_KEY) === null && localStorage.getItem(SAVE_BACKUP_KEY) === null;

    localStorage.clear();
    resetRunState();
    state.scene = "breath_hub";
    localStorage.setItem = (key, value) => {
      if (key === SAVE_STAGING_KEY) throw new Error("injected staging failure");
      return originalSetItem(key, value);
    };
    const firstOk = persistSave({ silent: true });
    localStorage.setItem = originalSetItem;
    const first = {
      ok: firstOk,
      noLiveSlot: localStorage.getItem(SAVE_KEY) === null,
      status: statusSnapshot()
    };

    return { failed, retry, fallback, first };
  })()`);

  if (fixture.failed.ok) errors.push("injected autosave commit failure reported success");
  if (!fixture.failed.priorPreserved) errors.push("failed autosave did not restore the prior live slot bytes");
  if (!fixture.failed.stagingCleared || !fixture.failed.backupCleared) {
    errors.push("restored autosave failure left transaction keys behind");
  }
  if (fixture.failed.liveScene !== "breath_hub" || fixture.failed.liveCohesion !== 17) {
    errors.push("failed autosave mutated the current in-memory run");
  }
  if (fixture.failed.status.text !== "Autosave failed · prior slot kept" || !fixture.failed.status.error || !fixture.failed.status.visible) {
    errors.push(`failed autosave was not exposed persistently: ${JSON.stringify(fixture.failed.status)}`);
  }

  if (!fixture.retry.ok || fixture.retry.scene !== "breath_hub" || fixture.retry.cohesion !== 17) {
    errors.push("successful autosave retry did not commit the current run");
  }
  if (!fixture.retry.stagingCleared || !fixture.retry.backupCleared) {
    errors.push("successful autosave retry left transaction keys behind");
  }
  if (fixture.retry.status.error || fixture.retry.status.visible || fixture.retry.status.text) {
    errors.push(`successful autosave retry did not clear the sticky failure: ${JSON.stringify(fixture.retry.status)}`);
  }

  if (fixture.fallback.ok || !fixture.fallback.liveCorrupt || !fixture.fallback.backupPreserved || !fixture.fallback.readUsesBackup) {
    errors.push("failed commit/restore did not preserve a readable prior backup");
  }
  if (fixture.fallback.status.text !== "Autosave failed · prior slot kept" || !fixture.fallback.status.error || !fixture.fallback.status.visible) {
    errors.push(`backup-recovered autosave failure was not exposed: ${JSON.stringify(fixture.fallback.status)}`);
  }
  if (!fixture.fallback.loadOk || fixture.fallback.loadedScene !== "wake" || fixture.fallback.loadedCohesion !== 29) {
    errors.push("Continue did not recover the prior valid slot from the verified backup");
  }
  if (!fixture.fallback.retryOk || fixture.fallback.retryScene !== "breath_hub" || fixture.fallback.retryCohesion !== 9 || !fixture.fallback.transactionCleared) {
    errors.push("save after backup recovery did not commit and retire transaction keys");
  }

  if (fixture.first.ok || !fixture.first.noLiveSlot) errors.push("first-save staging failure created a live slot");
  if (fixture.first.status.text !== "Autosave failed · progress not saved" || !fixture.first.status.error || !fixture.first.status.visible) {
    errors.push(`first autosave failure was not exposed: ${JSON.stringify(fixture.first.status)}`);
  }
  return errors;
}

export function resumeEntryIdempotenceChecks(runtime) {
  const errors = [];
  const fixture = runtime.evaluate(`(() => {
    resetRunState();
    state.promises.elias = "made";
    const originalOnEnter = scenes.act2_tether_sighting.onEnter;
    let entryCalls = 0;
    scenes.act2_tether_sighting.onEnter = () => {
      entryCalls += 1;
      return originalOnEnter();
    };

    showScene("act2_tether_sighting");
    const firstText = document.getElementById("story").innerHTML;
    persistSave({ silent: true });
    const currentRaw = localStorage.getItem("sunsplitter_save_v3");
    const currentSnapshot = JSON.parse(currentRaw);

    // A browser reload resets module-local presentation state before Continue.
    act2TetherAllusionsOnEntry = { elias: false, amara: false };
    resetRunState();
    entryCalls = 0;
    const currentOk = loadGame();
    const resumedText = document.getElementById("story").innerHTML;
    const currentEntryCalls = entryCalls;

    const legacySnapshot = Object.assign({}, currentSnapshot);
    delete legacySnapshot.sceneEntered;
    localStorage.setItem("sunsplitter_save_v3", JSON.stringify(legacySnapshot));
    act2TetherAllusionsOnEntry = { elias: false, amara: false };
    resetRunState();
    entryCalls = 0;
    const legacyOk = loadGame();
    const upgradedLegacy = JSON.parse(localStorage.getItem("sunsplitter_save_v3"));

    scenes.act2_tether_sighting.onEnter = originalOnEnter;
    return {
      currentOk,
      currentMarker: currentSnapshot.sceneEntered,
      currentEntryCalls,
      firstHasAllusion: firstText.includes("Deck Four pushed back another fragment"),
      resumedHasAllusion: resumedText.includes("Deck Four pushed back another fragment"),
      legacyOk,
      legacyEntryCalls: entryCalls,
      legacyUpgraded: upgradedLegacy.sceneEntered === true
    };
  })()`);

  if (!fixture.currentOk) errors.push("current save failed to resume");
  if (fixture.currentMarker !== true) errors.push("current snapshot does not record completed scene entry");
  if (fixture.currentEntryCalls !== 0) errors.push(`current resume re-ran onEnter ${fixture.currentEntryCalls} time(s)`);
  if (!fixture.firstHasAllusion || !fixture.resumedHasAllusion) {
    errors.push("resume did not preserve the current scene's consumed promise allusion");
  }
  if (!fixture.legacyOk || fixture.legacyEntryCalls !== 1) {
    errors.push(`markerless legacy save did not run one compatibility entry (calls=${fixture.legacyEntryCalls})`);
  }
  if (!fixture.legacyUpgraded) errors.push("markerless legacy save was not upgraded after compatibility entry");
  return errors;
}

export function saveVersionSemanticChecks(runtime) {
  const errors = [];
  const fixture = runtime.evaluate(`(() => {
    const check = (version, sceneId) => {
      resetRunState();
      loadedGameVersion = version;
      return scenes[sceneId].onEnter() || null;
    };
    const versions = ["0.9", "0.10", "0.24.9", "0.24.9d", "0.25.0-rc.1", "0.25", "0.25.0", "0.28.1c", "0.28.1d", "0.100", "1.0", "not-a-version"];
    const rows = Object.fromEntries(versions.map(version => [version, {
      elias: check(version, "act3_lethal_elias_order"),
      mira: check(version, "act3_lethal_mira_board")
    }]));
    // SUN-REVIEW T1-1: a save stamped with a letter hotfix suffix must survive a
    // snapshot roundtrip and reach both lethals exactly like a fresh-save run.
    const roundtrip = stamp => {
      resetRunState();
      const snap = snapshotState();
      if (stamp != null) snap.gameVersion = stamp;
      snap.scene = "act3_lethal_elias_order";
      resetRunState();
      const applied = applySnapshot(JSON.parse(JSON.stringify(snap)));
      const version = loadedGameVersion;
      const elias = scenes.act3_lethal_elias_order.onEnter() || null;
      const mira = scenes.act3_lethal_mira_board.onEnter() || null;
      return { applied, version, elias, mira };
    };
    rows.__fresh = roundtrip(null);
    rows.__suffixed = roundtrip("0.28.1d");
    return rows;
  })()`);

  const fresh = fixture.__fresh;
  const suffixed = fixture.__suffixed;
  if (!fresh.applied || !suffixed.applied) errors.push("fresh or 0.28.1d snapshot did not apply");
  if (suffixed.version !== "0.28.1d") errors.push(`0.28.1d save stamp not preserved on load (got ${suffixed.version})`);
  if (fresh.elias !== null || fresh.mira !== null) errors.push("fresh save no longer reaches the Elias and Mira lethal encounters");
  if (suffixed.elias !== fresh.elias || suffixed.mira !== fresh.mira) {
    errors.push(`0.28.1d save does not reach Elias/Mira lethals like a fresh save (elias=${suffixed.elias} mira=${suffixed.mira})`);
  }
  for (const version of ["0.9", "0.10", "0.24.9", "0.24.9d", "0.25.0-rc.1", "not-a-version"]) {
    if (fixture[version].elias !== "faction_split" || fixture[version].mira !== "faction_split") {
      errors.push(`save version ${version} did not fail closed before the 0.25 lethal-scene threshold`);
    }
  }
  for (const version of ["0.25", "0.25.0", "0.28.1c", "0.28.1d", "0.100", "1.0"]) {
    if (fixture[version].elias !== null || fixture[version].mira !== null) {
      errors.push(`save version ${version} was incorrectly treated as older than 0.25`);
    }
  }
  return errors;
}
