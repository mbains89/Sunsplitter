/* SUN-FIX-INTRO-NEXT-SKIP-01-REMINT3
 * Loaded after src/engine.js. Does not replace engine.js bytes.
 * UI Next (event-backed) coalesces double-fire; bare harness calls still step.
 */
(function replaceAdvanceCinematic() {
  function advanceCinematic(ev) {
    if (!currentCinematic) return;
    if (ev && typeof ev === "object" && ev.type) {
      if (typeof ev.preventDefault === "function") ev.preventDefault();
      if (typeof ev.stopPropagation === "function") ev.stopPropagation();
      const now = Date.now();
      if (currentCinematic.lastUiAdvanceAt && now - currentCinematic.lastUiAdvanceAt < 450) return;
      currentCinematic.lastUiAdvanceAt = now;
    }
    if (typeof cinematicTimer !== "undefined" && cinematicTimer !== null) {
      clearTimeout(cinematicTimer);
      cinematicTimer = null;
    }
    const nextIndex = currentCinematic.index + 1;
    if (nextIndex >= currentCinematic.frames.length) {
      finishCinematic();
      return;
    }
    currentCinematic.index = nextIndex;
    renderCinematicFrame(true);
  }
  window.advanceCinematic = advanceCinematic;
})();
