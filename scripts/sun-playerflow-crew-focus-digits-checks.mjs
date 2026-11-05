// SUN-CREW-FOCUS-DIGITS-01 — after the player clicks Crew (focus stays on the toggle), digit keys
// still pick story choices. Text fields and a focused choice button keep their native handling.
// Found by scripts/sun-browser-bot.mjs: a phone/keys run pressed "2" sixty times on seal_or_food
// with focus on #btn-crew and never advanced.
import assert from "node:assert/strict";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadGame } from "./simulate.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const runtime = loadGame(ROOT);
const rows = JSON.parse(runtime.evaluate(`JSON.stringify((() => {
  persistSave = () => true;
  const game = document.getElementById("game-screen");
  const press = (key, target) => {
    resetRunState();
    game.classList.remove("hidden");
    scenes.wake.choices = [{ text: "First", next: "dying" }, { text: "Second", next: "silence" }];
    document.getElementById("choices").children = [];
    state.scene = "wake";
    showScene("wake");
    const event = { key, target, defaultPrevented: false, repeat: false, altKey: false, ctrlKey: false, metaKey: false,
      prevented: false, preventDefault() { this.prevented = true; } };
    const handled = handleGameplayKeydown(event);
    return { handled, scene: state.scene, prevented: event.prevented };
  };
  const crewToggle = document.getElementById("btn-crew");
  crewToggle.tagName = "BUTTON";
  const callsign = document.getElementById("commander-callsign");
  callsign.tagName = "INPUT";
  const out = {
    crewToggle: press("2", crewToggle),
    crewToggleEnter: press("Enter", crewToggle),
    textField: press("2", callsign),
    story: press("2", document.getElementById("story"))
  };
  resetRunState(); game.classList.remove("hidden");
  scenes.wake.choices = [{ text: "First", next: "dying" }, { text: "Second", next: "silence" }];
  document.getElementById("choices").children = []; state.scene = "wake"; showScene("wake");
  const focusedChoice = gameplayChoiceButtons()[0];
  focusedChoice.tagName = "BUTTON";
  const event = { key: "2", target: focusedChoice, defaultPrevented: false, repeat: false, altKey: false, ctrlKey: false, metaKey: false, preventDefault() {} };
  out.choiceFocused = { handled: handleGameplayKeydown(event), scene: state.scene };
  return out;
})())`));

assert.deepEqual([rows.crewToggle.handled, rows.crewToggle.scene, rows.crewToggle.prevented], [true, "silence", true],
  "digit 2 with focus on the Crew toggle did not pick the second choice");
assert.deepEqual([rows.story.handled, rows.story.scene], [true, "silence"], "digit 2 from the story no longer picks the second choice");
assert.deepEqual([rows.crewToggleEnter.handled, rows.crewToggleEnter.scene], [false, "wake"],
  "Enter on the focused Crew toggle was hijacked from the native button");
assert.deepEqual([rows.textField.handled, rows.textField.scene], [false, "wake"], "digit typed into a text field picked a choice");
assert.deepEqual([rows.choiceFocused.handled, rows.choiceFocused.scene], [false, "wake"],
  "digit on a focused choice button was intercepted from native focus handling");
console.log("PASS sun-playerflow-crew-focus-digits: digits work with Crew focused; text fields, Enter on chrome, and focused choices keep native handling");
