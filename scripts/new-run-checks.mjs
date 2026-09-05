import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export function newRunChecks(runtime) {
  const errors = [];
  const indexSource = readFileSync(resolve(ROOT, "index.html"), "utf8");
  if (!indexSource.includes('id="btn-begin"') || !indexSource.includes('onclick="startGame()"')) {
    errors.push("title New Run control is not wired to startGame");
  }

  const fixture = runtime.evaluate(`(() => {
    const stableDigest = value => JSON.stringify((function sort(input) {
      if (Array.isArray(input)) return input.map(sort);
      if (input && typeof input === "object") {
        return Object.keys(input).sort().reduce((out, key) => {
          out[key] = sort(input[key]);
          return out;
        }, {});
      }
      return input;
    })(value));
    resetRunState();
    const expectedFreshDigest = stableDigest(state);
    const distinctiveRun = () => {
      resetRunState();
      state.scene = "act2_spine_next";
      state.survivors = 7;
      state.cohesion = 17;
      state.supplies = 23;
      state.flags.priority = "repairs";
      state.dead = ["vess"];
      state.deathCause.vess = "test fixture";
      state.affinity.amara = 6;
      state.trust.elias = 11;
      state.romance.amara = true;
      state.pursuit.amara = 2;
      state.favors.tomas = 1;
      state.past_known_by.mira = true;
      state.dying.lena = "test fixture";
      state.past_known = true;
      state.marks.sela = "yellow_sun";
      state.memories.push("test fixture");
      state.ideology.future = 8;
      state.recovered.jiro = true;
      state.promises.amara = "made";
      state.crisisPath = "custody";
      persistSave({ silent: true });
    };
    const liveDigest = () => JSON.stringify(state);

    localStorage.clear();
    distinctiveRun();
    showTitleScreen();
    const priorRaw = localStorage.getItem(SAVE_KEY);
    const priorLive = liveDigest();
    let confirmCalls = 0;
    window.__ssForceNew = true;
    window.confirm = () => { confirmCalls += 1; return false; };
    const cancelResult = startGame();
    const cancel = {
      result: cancelResult,
      confirmCalls,
      rawPreserved: localStorage.getItem(SAVE_KEY) === priorRaw,
      livePreserved: liveDigest() === priorLive,
      titleVisible: !document.getElementById("title-screen").classList.contains("hidden"),
      label: document.getElementById("btn-begin").textContent
    };
    delete window.__ssForceNew;

    confirmCalls = 0;
    window.confirm = () => { confirmCalls += 1; return true; };
    const acceptOpened = startGame();
    const acceptResult = typeof confirmNewRun === "function" ? confirmNewRun() : acceptOpened;
    finishCinematic();
    const acceptedRaw = localStorage.getItem(SAVE_KEY);
    const accepted = JSON.parse(acceptedRaw);
    const acceptedState = Object.assign({}, accepted);
    delete acceptedState.v;
    delete acceptedState.gameVersion;
    delete acceptedState.savedAt;
    delete acceptedState.sceneEntered;
    const accept = {
      result: acceptResult,
      confirmCalls,
      rawChanged: acceptedRaw !== priorRaw,
      liveFresh: stableDigest(state) === expectedFreshDigest,
      savedFresh: stableDigest(acceptedState) === expectedFreshDigest,
      liveScene: state.scene,
      savedScene: accepted.scene,
      liveCohesion: state.cohesion,
      savedCohesion: accepted.cohesion,
      liveSurvivors: state.survivors,
      savedSurvivors: accepted.survivors,
      gameVisible: !document.getElementById("game-screen").classList.contains("hidden")
    };

    localStorage.clear();
    distinctiveRun();
    showTitleScreen();
    const failedPriorRaw = localStorage.getItem(SAVE_KEY);
    const failedPriorLive = liveDigest();
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = (key, value) => {
      if (key === SAVE_STAGING_KEY) throw new Error("injected new-run write failure");
      return originalSetItem(key, value);
    };
    window.confirm = () => true;
    startGame();
    const failedResult = typeof confirmNewRun === "function" ? confirmNewRun() : false;
    localStorage.setItem = originalSetItem;
    const failed = {
      result: failedResult,
      rawPreserved: localStorage.getItem(SAVE_KEY) === failedPriorRaw,
      livePreserved: liveDigest() === failedPriorLive,
      titleVisible: !document.getElementById("title-screen").classList.contains("hidden")
    };

    localStorage.clear();
    resetRunState();
    state.scene = "act2_spine_next";
    state.cohesion = 29;
    const legacy = snapshotState();
    delete legacy.v;
    delete legacy.sceneEntered;
    const legacyRaw = JSON.stringify(legacy);
    localStorage.setItem(SAVE_KEY_LEGACY, legacyRaw);
    showTitleScreen();
    confirmCalls = 0;
    window.confirm = () => { confirmCalls += 1; return false; };
    const legacyResult = startGame();
    const legacyCancel = {
      result: legacyResult,
      confirmCalls,
      v3Absent: localStorage.getItem(SAVE_KEY) === null,
      legacyPreserved: localStorage.getItem(SAVE_KEY_LEGACY) === legacyRaw,
      label: document.getElementById("btn-begin").textContent
    };

    confirmCalls = 0;
    window.confirm = () => { confirmCalls += 1; return true; };
    const legacyOpened = startGame();
    const legacyAcceptResult = typeof confirmNewRun === "function" ? confirmNewRun() : legacyOpened;
    const legacyAccept = {
      result: legacyAcceptResult,
      confirmCalls,
      legacyRetired: localStorage.getItem(SAVE_KEY_LEGACY) === null,
      currentFresh: stableDigest(state) === expectedFreshDigest
    };
    localStorage.removeItem(SAVE_KEY);
    legacyAccept.staleResurrected = hasSave();

    return { cancel, accept, failed, legacyCancel, legacyAccept };
  })()`);

  if (fixture.cancel.result !== false) errors.push("cancelled New Run did not report a stopped transition");
  if (fixture.cancel.confirmCalls !== 1) errors.push(`New Run confirmation calls ${fixture.cancel.confirmCalls} != 1`);
  if (!fixture.cancel.rawPreserved || !fixture.cancel.livePreserved || !fixture.cancel.titleVisible) {
    errors.push("cancelled New Run changed save, live state, or title-screen state");
  }
  if (fixture.cancel.label !== "New run") errors.push(`saved title action label ${fixture.cancel.label} != New run`);
  if (fixture.accept.result !== true || fixture.accept.confirmCalls !== 1 || !fixture.accept.rawChanged) {
    errors.push("accepted New Run did not confirm and replace the saved slot");
  }
  if (!fixture.accept.liveFresh || !fixture.accept.savedFresh) {
    errors.push("accepted New Run retained non-fresh live or persisted state");
  }
  if (fixture.accept.liveScene !== "wake" || fixture.accept.savedScene !== "wake") {
    errors.push("accepted New Run did not start and persist wake");
  }
  if (fixture.accept.liveCohesion !== 48 || fixture.accept.savedCohesion !== 48 ||
      fixture.accept.liveSurvivors !== 9 || fixture.accept.savedSurvivors !== 9 || !fixture.accept.gameVisible) {
    errors.push("accepted New Run did not produce the canonical fresh campaign");
  }
  if (fixture.failed.result !== false || !fixture.failed.rawPreserved || !fixture.failed.livePreserved || !fixture.failed.titleVisible) {
    errors.push("failed New Run persistence did not preserve the prior slot, live run, and title screen");
  }
  if (fixture.legacyCancel.result !== false || fixture.legacyCancel.confirmCalls !== 1 ||
      !fixture.legacyCancel.v3Absent || !fixture.legacyCancel.legacyPreserved) {
    errors.push("cancelled legacy New Run migrated or replaced storage");
  }
  if (fixture.legacyCancel.label !== "New run") errors.push("legacy save did not expose the New run title action");
  if (fixture.legacyAccept.result !== true || fixture.legacyAccept.confirmCalls !== 1 ||
      !fixture.legacyAccept.legacyRetired || !fixture.legacyAccept.currentFresh || fixture.legacyAccept.staleResurrected) {
    errors.push("accepted legacy New Run did not retire the stale slot and preserve only a fresh campaign");
  }
  return errors;
}
