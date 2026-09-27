// SUN-FIX-DIALOG-KEYS-01 — gameplay number/Enter/Space must not fire while a modal dialog is open.
export function dialogKeysChecks(runtime) {
  const errors = [];
  const fixture = runtime.evaluate(`(() => {
    const originalChoices = scenes.wake.choices;
    const choicesEl = document.getElementById("choices");
    const game = document.getElementById("game-screen");
    const keyEvent = (key) => ({
      key,
      target: { tagName: "DIV" },
      defaultPrevented: false,
      repeat: false,
      altKey: false,
      ctrlKey: false,
      metaKey: false,
      prevented: false,
      preventDefault() { this.prevented = true; this.defaultPrevented = true; },
      stopPropagation() {},
      stopImmediatePropagation() {}
    });
    const press = (key) => {
      const event = keyEvent(key);
      const swallowed = typeof handleModalDialogKeydown === "function" && handleModalDialogKeydown(event);
      const handled = typeof handleGameplayKeydown === "function" && handleGameplayKeydown(event);
      return { swallowed, handled, prevented: event.prevented || event.defaultPrevented, scene: state.scene };
    };
    const renderWake = () => {
      resetRunState();
      scenes.wake.choices = [
        { text: "First", next: "dying" },
        { text: "Second", next: "silence" }
      ];
      choicesEl.children = [];
      state.scene = "wake";
      showScene("wake");
      game.classList.remove("hidden");
    };
    const dialogs = [
      { id: "tutorial-overlay", open: () => showTutorialOverlay(), close: () => dismissTutorial(), primary: "tutorial-dismiss" },
      { id: "commander-create", open: () => showCommanderCreate(), close: () => hideCommanderCreate(), primary: "commander-create-ok" },
      { id: "new-run-confirm", open: () => showNewRunConfirm(), close: () => hideNewRunConfirm(), primary: "new-run-ok" },
      { id: "crew-sheet", open: () => { if (typeof crew !== "undefined" && crew.lena) openCrewSheet("lena"); }, close: () => closeCrewSheet(), primary: "crew-sheet-close" }
    ];

    const opener = { id: "btn-crew", focused: false, focus() { this.focused = true; } };
    document.activeElement = opener;

    const perDialog = [];
    for (const spec of dialogs) {
      renderWake();
      document.activeElement = opener;
      opener.focused = false;
      spec.open();
      const dialog = document.getElementById(spec.id);
      const one = press("1");
      const enter = press("Enter");
      const space = press(" ");
      const focusId = document.activeElement && document.activeElement.id;
      spec.close();
      perDialog.push({
        id: spec.id,
        visible: !!(dialog && dialog.classList.contains("visible") && !dialog.classList.contains("hidden")),
        one,
        enter,
        space,
        focusId,
        openerRestored: document.activeElement === opener || opener.focused
      });
    }

    renderWake();
    const clearOne = press("1");

    scenes.wake.choices = originalChoices;
    return { perDialog, clearOne };
  })()`);

  if (!fixture || !Array.isArray(fixture.perDialog) || fixture.perDialog.length !== 4) {
    errors.push("dialog key fixture did not cover the four modal dialogs");
    return errors;
  }
  const primaryById = {
    "tutorial-overlay": "tutorial-dismiss",
    "commander-create": "commander-create-ok",
    "new-run-confirm": "new-run-ok",
    "crew-sheet": "crew-sheet-close"
  };
  for (const row of fixture.perDialog) {
    for (const key of ["one", "enter", "space"]) {
      const hit = row[key];
      if (!hit || hit.scene !== "wake" || hit.handled) {
        errors.push(`${row.id} ${key} advanced gameplay while the modal was open`);
      }
      if (!hit || !hit.swallowed) {
        errors.push(`${row.id} ${key} was not swallowed by the modal capture handler`);
      }
    }
    if (row.focusId !== primaryById[row.id] && row.focusId !== row.id) {
      errors.push(`${row.id} did not move focus to its primary control (focus=${row.focusId})`);
    }
    if (!row.openerRestored) {
      errors.push(`${row.id} did not restore focus to the opener on close`);
    }
  }
  if (!fixture.clearOne || fixture.clearOne.scene !== "dying" || fixture.clearOne.swallowed || !fixture.clearOne.handled) {
    errors.push("gameplay number keys stopped working after dialogs closed");
  }
  return errors;
}
