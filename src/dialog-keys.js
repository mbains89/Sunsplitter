/* SUN-FIX-DIALOG-KEYS-01d — overlay. Do not edit engine.js / state.js. */
(function () {
  var PRIMARY = {
    "tutorial-overlay": "tutorial-dismiss",
    "commander-create": "commander-create-ok",
    "new-run-confirm": "new-run-ok",
    "crew-sheet": "crew-sheet-close"
  };
  var DIALOG_IDS = ["tutorial-overlay", "commander-create", "new-run-confirm", "crew-sheet"];
  var modalOpener = null;

  function visibleModalDialog() {
    var game = document.getElementById("game-screen");
    if (!game || game.classList.contains("hidden")) return null;
    for (var i = 0; i < DIALOG_IDS.length; i += 1) {
      var el = document.getElementById(DIALOG_IDS[i]);
      if (el && !el.classList.contains("hidden") && el.classList.contains("visible")) return el;
    }
    return null;
  }

  function rememberOpener() {
    modalOpener = document.activeElement || null;
  }

  function focusPrimary(dialogId) {
    var primary = document.getElementById(PRIMARY[dialogId]);
    var dialog = document.getElementById(dialogId);
    if (primary && typeof primary.focus === "function") primary.focus();
    else if (dialog && typeof dialog.focus === "function") dialog.focus();
  }

  function restoreOpener() {
    var opener = modalOpener;
    modalOpener = null;
    if (opener && typeof opener.focus === "function") opener.focus();
  }

  function wrapNamed(name, fn) {
    if (typeof fn !== "function") return;
    if (typeof window !== "undefined") window[name] = fn;
    if (typeof globalThis !== "undefined") globalThis[name] = fn;
  }

  function wrapOpen(name, dialogId) {
    var previous = typeof globalThis[name] === "function" ? globalThis[name] : null;
    if (typeof previous !== "function") return;
    wrapNamed(name, function () {
      rememberOpener();
      var result = previous.apply(this, arguments);
      focusPrimary(dialogId);
      return result;
    });
  }

  function wrapClose(name) {
    var previous = typeof globalThis[name] === "function" ? globalThis[name] : null;
    if (typeof previous !== "function") return;
    wrapNamed(name, function () {
      var result = previous.apply(this, arguments);
      restoreOpener();
      return result;
    });
  }

  function handleModalDialogKeydown(event) {
    if (!event || event.repeat || event.altKey || event.ctrlKey || event.metaKey) return false;
    var key = event.key || "";
    if (!/^[0-9]$/.test(key) && key !== "Enter" && key !== " " && key !== "Spacebar") return false;
    if (!visibleModalDialog()) return false;
    if (typeof event.preventDefault === "function") event.preventDefault();
    if (typeof event.stopPropagation === "function") event.stopPropagation();
    return true;
  }

  wrapNamed("handleModalDialogKeydown", handleModalDialogKeydown);
  wrapOpen("showTutorialOverlay", "tutorial-overlay");
  wrapClose("dismissTutorial");
  wrapOpen("showCommanderCreate", "commander-create");
  wrapClose("hideCommanderCreate");
  wrapOpen("showNewRunConfirm", "new-run-confirm");
  wrapClose("hideNewRunConfirm");
  wrapOpen("openCrewSheet", "crew-sheet");
  wrapClose("closeCrewSheet");

  if (typeof document !== "undefined" && typeof document.addEventListener === "function") {
    document.addEventListener("keydown", handleModalDialogKeydown, true);
  }
})();
