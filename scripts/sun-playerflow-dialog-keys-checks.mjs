// SUN-MODAL-HOTKEYS-01 — gameplay hotkeys never fire behind an open modal dialog.
// Runs the dialog-keys spec (tutorial, commander create, new-run confirm, crew sheet) against the
// real engine, plus the review repro: first-run tutorial over wake must not commit a choice.
import assert from "node:assert/strict";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadGame } from "./simulate.mjs";
import { dialogKeysChecks } from "./dialog-keys-checks.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// The shared harness ElementStub has no focus(); browsers move document.activeElement on focus.
// Installed per runtime: the prototype is shared, and each stub must write its own document.
function withFocus(runtime) {
  runtime.evaluate(`(() => {
    const proto = Object.getPrototypeOf(document.getElementById("story"));
    proto.focus = function () { document.activeElement = this; };
    proto.contains = function (node) { return node === this; };
  })()`);
  return runtime;
}

const specErrors = dialogKeysChecks(withFocus(loadGame(ROOT)));
assert.deepEqual(specErrors, [], `dialog-keys spec failed:\n${specErrors.join("\n")}`);

const runtime = withFocus(loadGame(ROOT));
const repro = runtime.evaluate(`(() => {
  resetRunState();
  showScreen("game");
  showScene("wake");
  showTutorialOverlay();
  const press = key => {
    const event = { key, target: document.getElementById("story"), defaultPrevented: false, repeat: false,
      altKey: false, ctrlKey: false, metaKey: false,
      preventDefault() { this.defaultPrevented = true; }, stopPropagation() {} };
    handleModalDialogKeydown(event);
    handleGameplayKeydown(event);
  };
  press("1"); press("Enter"); press(" ");
  const behind = state.scene;
  const focusAfterOpen = document.activeElement && document.activeElement.id;
  dismissTutorial();
  press("1");
  return { behind, focusAfterOpen, after: state.scene };
})()`);
assert.equal(repro.behind, "wake", "hotkey behind the first-run tutorial committed a choice");
assert.equal(repro.focusAfterOpen, "tutorial-dismiss", "tutorial did not take focus on open");
assert.notEqual(repro.after, "wake", "hotkeys stopped working after the tutorial closed");

console.log("PASS sun-playerflow-dialog-keys: 4 dialogs swallow 1-9/Enter/Space, focus primary, restore opener; tutorial-over-wake repro closed");
