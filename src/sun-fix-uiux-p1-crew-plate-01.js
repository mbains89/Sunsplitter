/* SUN-FIX-UIUX-P1-CREW-PLATE-01
 * Opening CREW may minimize #scene-image-wrap but must not drop #scene-image src.
 */
(function () {
  if (typeof setManagedImageSource === "function") {
    var previousSet = setManagedImageSource;
    setManagedImageSource = function (img, src, opts) {
      var next = typeof src === "string" ? src : "";
      var game = typeof document !== "undefined" ? document.getElementById("game-screen") : null;
      var crew = typeof document !== "undefined" ? document.getElementById("crew-panel") : null;
      if (!next && img && img.id === "scene-image" &&
          game && !game.classList.contains("hidden") &&
          crew && crew.classList.contains("visible")) {
        return false;
      }
      return previousSet(img, src, opts);
    };
  }
  if (typeof toggleCrewPanel === "function") {
    var previousToggle = toggleCrewPanel;
    toggleCrewPanel = function () {
      previousToggle();
      var img = document.getElementById("scene-image");
      var kept = img && typeof img.__ssManagedSource === "string" ? img.__ssManagedSource : "";
      if (img && kept && img.getAttribute("src") !== kept) img.src = kept;
    };
  }
})();
