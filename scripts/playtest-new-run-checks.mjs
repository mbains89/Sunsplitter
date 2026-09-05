import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// SUN-PLAYTEST-NEW-RUN-01 — title NEW RUN with a save must confirm then start wake/intro.
export function playtestNewRunChecks(runtime) {
  const errors = [];
  const html = readFileSync(resolve(ROOT, "index.html"), "utf8");
  const engine = readFileSync(resolve(ROOT, "src/engine.js"), "utf8");
  const validate = readFileSync(resolve(ROOT, "src/validate.js"), "utf8");
  const runtimeSrc = engine + "\n" + validate;

  if (!html.includes('id="btn-begin"') || !html.includes('onclick="startGame()"')) {
    errors.push("title Begin/New run lost startGame wiring");
  }
  if (!html.includes('id="new-run-confirm"') || !html.includes("confirmNewRun()") || !html.includes("cancelNewRun()")) {
    errors.push("in-page new-run confirm markup missing");
  }
  if (!engine.includes("function startGame") || !engine.includes("beginFreshCampaign({ persist: true })")) {
    errors.push("engine lost persist-true new run");
  }
  if (!runtimeSrc.includes("function confirmNewRun") || !runtimeSrc.includes("function cancelNewRun") || !runtimeSrc.includes("function commitNewRun")) {
    errors.push("confirmNewRun/cancelNewRun/commitNewRun handlers missing");
  }
  if (!runtimeSrc.includes('showCinematic("intro")')) {
    errors.push("new run no longer reaches intro cinematic");
  }

  try {
    const fixture = runtime.evaluate(`(() => {
      const rawSave = () => {
        try { return localStorage.getItem("sunsplitter_save_v3"); } catch (e) { return null; }
      };
      const begin = document.getElementById("btn-begin");
      const panel = document.getElementById("new-run-confirm");
      const results = {};
      localStorage.clear();
      resetRunState();
      const noSaveStart = startGame();
      results.noSave = {
        started: noSaveStart,
        intro: !!(currentCinematic && currentCinematic.kind === "intro"),
        scene: state.scene
      };
      if (typeof finishCinematic === "function" && currentCinematic) finishCinematic();

      resetRunState();
      state.scene = "hydroponics";
      state.survivors = 6;
      persistSave({ silent: true });
      const savedRaw = rawSave();
      showTitleScreen();
      results.labeled = begin && begin.textContent === "New run";

      const opened = startGame();
      results.panelOpen = {
        opened,
        visible: !!(panel && !panel.classList.contains("hidden"))
      };

      const cancelled = cancelNewRun();
      results.afterCancel = {
        cancelled,
        scene: state.scene,
        saveKept: rawSave() === savedRaw,
        hidden: !!(panel && panel.classList.contains("hidden"))
      };

      const resumed = resumeGame();
      results.afterResume = {
        resumed,
        scene: state.scene,
        cinematic: !!(currentCinematic && currentCinematic.kind)
      };

      showTitleScreen();
      startGame();
      const confirmed = confirmNewRun();
      let saveIsWake = false;
      try {
        const live = JSON.parse(rawSave() || "null");
        saveIsWake = !!(live && live.scene === "wake");
      } catch (e) { saveIsWake = false; }
      results.afterConfirm = {
        confirmed,
        intro: !!(currentCinematic && currentCinematic.kind === "intro"),
        scene: state.scene,
        saveIsWake
      };
      return results;
    })()`);

    if (!fixture.noSave || !fixture.noSave.started || !fixture.noSave.intro || fixture.noSave.scene !== "wake") {
      errors.push("Begin with no save did not start a fresh intro/wake run");
    }
    if (!fixture.labeled) {
      errors.push("btn-begin did not relabel to New run when a save exists");
    }
    if (!fixture.panelOpen || fixture.panelOpen.opened || !fixture.panelOpen.visible) {
      errors.push("NEW RUN with a save did not open the in-page confirm panel");
    }
    if (!fixture.afterCancel || fixture.afterCancel.cancelled || fixture.afterCancel.scene !== "hydroponics" || !fixture.afterCancel.saveKept || !fixture.afterCancel.hidden) {
      errors.push("Cancel confirm did not leave the existing save intact");
    }
    if (!fixture.afterResume || !fixture.afterResume.resumed || fixture.afterResume.scene !== "hydroponics" || fixture.afterResume.cinematic) {
      errors.push("Continue no longer loads the existing save");
    }
    if (!fixture.afterConfirm || !fixture.afterConfirm.confirmed || !fixture.afterConfirm.intro || fixture.afterConfirm.scene !== "wake" || !fixture.afterConfirm.saveIsWake) {
      errors.push("Confirm NEW RUN did not call persist-true fresh campaign to intro/wake");
    }
  } catch (error) {
    errors.push(`new-run runtime: ${error.message}`);
  }
  return errors;
}
