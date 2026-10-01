/* SUN-HITL-UNSHADOW-01
   C1 plate gap: Crew close left #scene-image minimized and never rebound.
   Does not flip scene.image vs sceneImages. Truthy scene.image still wins.
   Loaded after validate.js. engine.js stays the 93575 class. No state.js patch.
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
(function wireScenePlateUnshadow() {
  if (typeof toggleCrewPanel === "function") {
    var previous = toggleCrewPanel;
    toggleCrewPanel = function () {
      var panel = document.getElementById("crew-panel");
      var wasOpen = !!(panel && panel.classList.contains("visible"));
      previous();
      var nowOpen = !!(panel && panel.classList.contains("visible"));
      if (nowOpen) rebindScenePlate();
      if (wasOpen && !nowOpen) {
        var wrap = document.getElementById("scene-image-wrap");
        if (wrap) wrap.classList.remove("minimized");
        rebindScenePlate();
      }
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
})();
