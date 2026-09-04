import assert from "node:assert/strict";
import { playtestArtDoubleclickChecks } from "./playtest-art-doubleclick-checks.mjs";

export function cinematicChecks(runtime) {
  const errors = [];
  const check = (label, source) => {
    try { assert.equal(runtime.evaluate(source), true); }
    catch (e) { errors.push(`cinematic ${label}: ${e.message}`); }
  };
  check("Begin skip/completion preserve the committed fresh run and hide gameplay keys", `(() => {
    for (const skip of [true, false]) {
      localStorage.clear(); resetRunState();
      if (!startGame() || currentCinematic.kind !== "intro") return false;
      const live = JSON.stringify(state), saved = localStorage.getItem(SAVE_KEY);
      if (!document.getElementById("game-screen").classList.contains("hidden")) return false;
      if (handleGameplayKeydown({ key: "1" })) return false;
      if (skip) finishCinematic();
      else { advanceCinematic(); advanceCinematic(); advanceCinematic(); }
      if (currentCinematic || cinematicTimer !== null || state.scene !== "wake") return false;
      if (document.getElementById("game-screen").classList.contains("hidden")) return false;
      if (finishCinematic() !== false || JSON.stringify(state) !== live || localStorage.getItem(SAVE_KEY) !== saved) return false;
      if (document.getElementById("cinematic-image").__ssManagedSource) return false;
    }
    return true;
  })()`);
  check("ending skip/completion preserve final result, state and saved bytes", `(() => {
    for (const skip of [true, false]) {
      resetRunState(); state.flags.final = "endure";
      makeChoice({ next: "ending_check" });
      if (currentCinematic.kind !== "ending" || state.scene !== "ending_check") return false;
      const live = JSON.stringify(state), saved = localStorage.getItem(SAVE_KEY);
      const title = document.getElementById("ending-title").textContent;
      const text = document.getElementById("ending-text").textContent;
      const art = currentEndingArt;
      if (document.getElementById("cinematic-image").__ssManagedSource !== "images/onboarding_background.jpg") return false;
      if (document.getElementById("cinematic-text").textContent !== text.split(/\\n\\n+/)[0]) return false;
      if (skip) finishCinematic(); else while (currentCinematic) advanceCinematic();
      if (document.getElementById("ending-screen").classList.contains("hidden")) return false;
      if (JSON.stringify(state) !== live || localStorage.getItem(SAVE_KEY) !== saved) return false;
      if (document.getElementById("ending-title").textContent !== title || document.getElementById("ending-text").textContent !== text || currentEndingArt !== art) return false;
      if (document.getElementById("ending-image").__ssManagedSource !== art) return false;
      showWhatRemains(); showScreen("ending");
      if (currentCinematic) return false;
    }
    return true;
  })()`);
  check("Continue bypasses beats for fresh, midgame and modern/legacy completed saves", `(() => {
    for (const scene of ["wake", "act3_spine_next", "ending_check"]) for (const legacy of [false, true]) {
      resetRunState(); state.scene = scene;
      const snapshot = snapshotState();
      if (legacy) delete snapshot.sceneEntered;
      localStorage.setItem(SAVE_KEY, JSON.stringify(snapshot));
      if (!resumeGame() || currentCinematic) return false;
      if (!legacy && state.scene !== scene) return false;
      if (scene === "ending_check" && document.getElementById("ending-screen").classList.contains("hidden")) return false;
    }
    return true;
  })()`);
  check("Play Again intro/background/Skip keep completed slot until actual choice", `(() => {
    resetRunState(); state.scene = "ending_check"; persistSave({ silent: true });
    const completed = localStorage.getItem(SAVE_KEY);
    playAgain();
    if (!preserveCompletedSlotUntilChoice || currentCinematic.kind !== "intro") return false;
    window.dispatchEvent({ type: "pagehide" });
    if (!currentCinematic.paused || cinematicTimer !== null || document.getElementById("cinematic-image").__ssManagedSource) return false;
    window.dispatchEvent({ type: "pageshow" });
    if (!currentCinematic.paused || document.getElementById("cinematic-image").__ssManagedSource !== "images/cascade_records.jpg") return false;
    finishCinematic();
    if (localStorage.getItem(SAVE_KEY) !== completed || !preserveCompletedSlotUntilChoice) return false;
    makeChoice(scenes.wake.choices[0]);
    return localStorage.getItem(SAVE_KEY) !== completed && !preserveCompletedSlotUntilChoice;
  })()`);
  check("timer, pause, reduced motion, stale callbacks, and Escape", `(() => {
    const oldTimeout = setTimeout, oldClear = clearTimeout, oldMedia = window.matchMedia;
    let seq = 0;
    const timers = new Map();
    try {
      setTimeout = callback => { timers.set(++seq, callback); return seq; };
      clearTimeout = id => timers.delete(id);
      window.matchMedia = () => ({ matches: false });
      resetRunState(); showCinematic("intro");
      const stale = timers.get(cinematicTimer);
      document.getElementById("cinematic-body").scrollTop = 150;
      toggleCinematicPause();
      if (cinematicTimer !== null || !currentCinematic.paused) return false;
      if (document.getElementById("cinematic-body").scrollTop !== 150) return false;
      stale(); if (currentCinematic.index !== 0) return false;
      toggleCinematicPause();
      for (let frame = 0; frame < 3; frame++) {
        timers.get(cinematicTimer)();
        if (currentCinematic && document.getElementById("cinematic-body").scrollTop !== 0) return false;
      }
      if (currentCinematic || state.scene !== "wake") return false;
      showCinematic("intro"); stale();
      if (currentCinematic.index !== 0) return false;
      let prevented = false;
      document.dispatchEvent({ type: "keydown", key: "Escape", preventDefault() { prevented = true; this.defaultPrevented = true; } });
      if (!prevented || currentCinematic) return false;
      window.matchMedia = () => ({ matches: true });
      showCinematic("intro");
      return currentCinematic.paused && cinematicTimer === null;
    } finally {
      cancelCinematic(); setTimeout = oldTimeout; clearTimeout = oldClear; window.matchMedia = oldMedia;
      showTitleScreen();
    }
  })()`);
  errors.push(...playtestArtDoubleclickChecks(runtime));
  return errors;
}
