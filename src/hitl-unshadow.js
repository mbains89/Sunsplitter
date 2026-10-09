/* SUN-HITL-UNSHADOW-01
   C1 plate gap: Crew close left #scene-image minimized and never rebound.
   Does not flip scene.image vs sceneImages. Truthy scene.image still wins.
   Loaded after validate.js. engine.js stays the 93575 class. No state.js patch.

   SUN-CREWPLATE-F07-01
   Button close already went through the wrapped toggleCrewPanel.
   Escape (wireCrewDisclosureKeyboard) and any chip/back path flip
   #crew-panel classes directly and never call toggleCrewPanel, so the
   plate stayed minimized and unbound for the rest of the beat.
   Every close path now removes minimized and rebinds #scene-image to
   resolveSceneImage(current scene). engine.js is not edited.
*/
function rebindScenePlate() {
  if (typeof document === "undefined" || typeof state === "undefined" || !state || !state.scene) return false;
  if (typeof scenes === "undefined" || !scenes || !scenes[state.scene]) return false;
  if (typeof resolveSceneImage !== "function" || typeof setManagedImageSource !== "function") return false;
  var img = document.getElementById("scene-image");
  var wrap = document.getElementById("scene-image-wrap");
  if (!img || !wrap) return false;
  var imgSrc = resolveSceneImage(state.scene, scenes[state.scene]);
  if (!imgSrc) return false;
  setManagedImageSource(img, imgSrc);
  img.alt = typeof imageAlternative === "function" ? imageAlternative(imgSrc) : img.alt;
  wrap.classList.add("visible");
  return true;
}
function restoreScenePlateAfterCrewClose() {
  var wrap = document.getElementById("scene-image-wrap");
  if (wrap) wrap.classList.remove("minimized");
  return rebindScenePlate();
}
function crewPanelIsOpen(panel) {
  return !!(panel && panel.classList.contains("visible") && !panel.classList.contains("hidden"));
}
(function wireScenePlateUnshadow() {
  if (typeof toggleCrewPanel === "function") {
    var previous = toggleCrewPanel;
    toggleCrewPanel = function () {
      var panel = document.getElementById("crew-panel");
      var wasOpen = crewPanelIsOpen(panel);
      previous();
      var nowOpen = crewPanelIsOpen(panel);
      if (nowOpen) rebindScenePlate();
      if (wasOpen && !nowOpen) restoreScenePlateAfterCrewClose();
    };
  }
  if (typeof restorePresentationImages === "function") {
    var previousRestore = restorePresentationImages;
    restorePresentationImages = function () {
      previousRestore();
      var img = document.getElementById("scene-image");
      var managed = img && typeof img.__ssManagedSource === "string" ? img.__ssManagedSource : "";
      if (!managed) rebindScenePlate();
    };
  }

  // Escape and chip/back flip classes without calling toggleCrewPanel.
  // Watch the class attribute so every close path restores the plate.
  // Do not call toggleCrewPanel from Escape: engine already closes the panel,
  // and a second toggle would reopen it.
  function watchCrewPanelClose() {
    if (typeof document === "undefined" || typeof MutationObserver !== "function") return;
    var panel = document.getElementById("crew-panel");
    if (!panel) {
      if (document.readyState === "loading" && typeof document.addEventListener === "function") {
        document.addEventListener("DOMContentLoaded", watchCrewPanelClose);
      }
      return;
    }
    if (panel.__ssCrewPlateWatch) return;
    panel.__ssCrewPlateWatch = true;
    var wasOpen = crewPanelIsOpen(panel);
    var observer = new MutationObserver(function () {
      var nowOpen = crewPanelIsOpen(panel);
      if (wasOpen && !nowOpen) restoreScenePlateAfterCrewClose();
      if (!wasOpen && nowOpen) rebindScenePlate();
      wasOpen = nowOpen;
    });
    observer.observe(panel, { attributes: true, attributeFilter: ["class"] });
  }
  watchCrewPanelClose();

  // Late bubble listener: engine's Escape handler runs first (registered
  // earlier) and flips classes. If the observer has not flushed yet, this
  // still returns the plate full-size and loaded. It does not toggle.
  if (typeof document !== "undefined" && typeof document.addEventListener === "function") {
    document.addEventListener("keydown", function (event) {
      if (!event || event.key !== "Escape") return;
      var panel = document.getElementById("crew-panel");
      if (crewPanelIsOpen(panel)) return;
      var wrap = document.getElementById("scene-image-wrap");
      if (wrap && wrap.classList.contains("minimized")) restoreScenePlateAfterCrewClose();
    });
  }
})();
