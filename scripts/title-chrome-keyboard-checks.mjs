import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// SUN-TITLE-KB-CHROME-01 — Enter/Space dismiss notice and activate Begin outside gameplay.
export function titleChromeKeyboardChecks(runtime) {
  const errors = [];
  const validateSource = readFileSync(resolve(ROOT, "src/validate.js"), "utf8");
  if (!validateSource.includes("function handleTitleChromeKeydown(event)")) {
    errors.push("validate.js missing handleTitleChromeKeydown");
  }
  if (!validateSource.includes('document.addEventListener("keydown", handleTitleChromeKeydown);')) {
    errors.push("validate.js missing title chrome keydown wiring");
  }

  try {
    const fixture = runtime.evaluate(`(() => {
      const keyEvent = (key, extra = {}) => Object.assign({
        key,
        target: { tagName: "DIV" },
        defaultPrevented: false,
        repeat: false,
        altKey: false,
        ctrlKey: false,
        metaKey: false,
        prevented: false,
        preventDefault() { this.prevented = true; }
      }, extra);

      localStorage.clear();
      showTitleScreen();
      revisitTone();
      const toneEvent = keyEvent("Enter");
      const toneHandled = handleTitleChromeKeydown(toneEvent);
      const tone = {
        handled: toneHandled,
        prevented: toneEvent.prevented,
        toneHidden: document.getElementById("tone-screen").classList.contains("hidden"),
        titleVisible: !document.getElementById("title-screen").classList.contains("hidden")
      };

      const begin = document.getElementById("btn-begin");
      const originalClick = begin.click;
      let beginClicks = 0;
      begin.click = () => { beginClicks += 1; };
      showTitleScreen();
      const titleEvent = keyEvent("Enter");
      const titleHandled = handleTitleChromeKeydown(titleEvent);
      const title = {
        handled: titleHandled,
        prevented: titleEvent.prevented,
        beginClicks
      };
      begin.click = originalClick;

      showTitleScreen();
      showCommanderCreate();
      const commanderEvent = keyEvent("Enter");
      const commander = {
        handled: handleTitleChromeKeydown(commanderEvent),
        prevented: commanderEvent.prevented
      };
      hideCommanderCreate();

      showTitleScreen();
      showNewRunConfirm();
      const confirmEvent = keyEvent(" ");
      const confirm = {
        handled: handleTitleChromeKeydown(confirmEvent),
        prevented: confirmEvent.prevented
      };
      hideNewRunConfirm();

      const game = document.getElementById("game-screen");
      const titleScreen = document.getElementById("title-screen");
      game.classList.remove("hidden");
      titleScreen.classList.remove("hidden");
      const gameEvent = keyEvent("Enter");
      const gameplay = {
        handled: handleTitleChromeKeydown(gameEvent),
        prevented: gameEvent.prevented
      };
      game.classList.add("hidden");

      showTitleScreen();
      const interactiveEvent = keyEvent("Enter", { target: { tagName: "BUTTON" } });
      const interactive = {
        handled: handleTitleChromeKeydown(interactiveEvent),
        prevented: interactiveEvent.prevented
      };

      return { tone, title, commander, confirm, gameplay, interactive };
    })()`);

    if (!fixture.tone.handled || !fixture.tone.prevented || !fixture.tone.toneHidden || !fixture.tone.titleVisible) {
      errors.push("Enter did not dismiss tone-screen into the title-screen");
    }
    if (!fixture.title.handled || !fixture.title.prevented || fixture.title.beginClicks !== 1) {
      errors.push("Enter did not activate btn-begin on the title-screen");
    }
    if (fixture.commander.handled || fixture.commander.prevented) {
      errors.push("title chrome keydown ignored commander-create guard");
    }
    if (fixture.confirm.handled || fixture.confirm.prevented) {
      errors.push("title chrome keydown ignored new-run-confirm guard");
    }
    if (fixture.gameplay.handled || fixture.gameplay.prevented) {
      errors.push("title chrome keydown ran while game-screen was visible");
    }
    if (fixture.interactive.handled || fixture.interactive.prevented) {
      errors.push("title chrome keydown handled an interactive target");
    }
  } catch (error) {
    errors.push(`title chrome keyboard runtime: ${error.message}`);
  }

  return errors;
}
