// SUN-036-KEYBOARD-RUN-01 — visible keyboard landing spots.
// Loaded after engine.js and validate.js. Does not change phone layout rules.
(function () {
  const style = document.createElement("style");
  style.textContent = [
    "button:focus, button:focus-visible, input:focus, input:focus-visible,",
    "#story:focus, #story:focus-visible {",
    "  outline: 3px solid var(--focus, #f2c14e);",
    "  outline-offset: 2px;",
    "}"
  ].join("\n");
  document.head.appendChild(style);

  function focusEl(el) {
    if (!el || typeof el.focus !== "function") return;
    try { el.focus({ preventScroll: true, focusVisible: true }); }
    catch (e) {
      try { el.focus({ preventScroll: true }); }
      catch (err) { el.focus(); }
    }
  }

  const screenTarget = {
    tone: "btn-tone-continue",
    title: "btn-begin",
    cinematic: "cinematic-skip",
    ending: "btn-what-remains",
    "what-remains": "btn-play-again"
  };

  if (typeof showScreen === "function") {
    const previous = showScreen;
    showScreen = function (id) {
      const result = previous(id);
      if (screenTarget[id]) focusEl(document.getElementById(screenTarget[id]));
      return result;
    };
  }

  if (typeof showScene === "function") {
    const previous = showScene;
    showScene = function (id, opts) {
      const result = previous(id, opts);
      focusEl(document.getElementById("story"));
      return result;
    };
  }

  if (typeof showCommanderCreate === "function") {
    const previous = showCommanderCreate;
    showCommanderCreate = function () {
      const opened = previous();
      if (opened) focusEl(document.getElementById("commander-create-ok"));
      return opened;
    };
  }

  if (typeof showNewRunConfirm === "function") {
    const previous = showNewRunConfirm;
    showNewRunConfirm = function () {
      const opened = previous();
      if (opened) focusEl(document.getElementById("new-run-ok"));
      return opened;
    };
  }

  if (typeof showTutorialOverlay === "function") {
    const previous = showTutorialOverlay;
    showTutorialOverlay = function () {
      const opened = previous();
      if (opened) focusEl(document.getElementById("tutorial-dismiss"));
      return opened;
    };
  }

  if (typeof dismissTutorial === "function") {
    const previous = dismissTutorial;
    dismissTutorial = function () {
      const result = previous();
      focusEl(document.getElementById("story"));
      return result;
    };
  }

  let choiceAdvanceLock = false;
  if (typeof makeChoice === "function") {
    const previous = makeChoice;
    makeChoice = function (choice) {
      if (choiceAdvanceLock) return;
      choiceAdvanceLock = true;
      try { return previous(choice); }
      finally { choiceAdvanceLock = false; }
    };
  }

  document.addEventListener("keydown", event => {
    if (!event || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
    const tutorial = typeof isTutorialOpen === "function" && isTutorialOpen();
    const commander = document.getElementById("commander-create");
    const confirm = document.getElementById("new-run-confirm");
    const dialog = tutorial
      || (commander && !commander.classList.contains("hidden"))
      || (confirm && !confirm.classList.contains("hidden"));
    if (!dialog) return;
    if (/^[1-9]$/.test(event.key || "") || event.key === "Enter" || event.key === " " || event.key === "Spacebar") {
      if (event.target && event.target.closest && event.target.closest("#tutorial-overlay, #commander-create, #new-run-confirm")) return;
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, true);
})();
