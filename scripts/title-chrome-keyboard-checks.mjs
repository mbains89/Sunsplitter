// SUN-TITLE-KB-CHROME-01 — Enter/Space dismiss notice and activate Begin outside gameplay.
export function titleChromeKeyboardChecks(runtime) {
  const errors = [];

  try {
    const fixture = runtime.evaluate(`(() => {
      const keyEvent = (key, extra = {}) => Object.assign({
        type: "keydown",
        key,
        target: { tagName: "DIV" },
        defaultPrevented: false,
        repeat: false,
        altKey: false,
        ctrlKey: false,
        metaKey: false,
        prevented: false,
        preventDefault() { this.prevented = true; this.defaultPrevented = true; }
      }, extra);
      const dispatch = event => {
        document.dispatchEvent(event);
        return event;
      };

      localStorage.clear();

      showTitleScreen();
      revisitTone();
      const toneEnter = dispatch(keyEvent("Enter"));
      const tone = {
        prevented: toneEnter.prevented,
        toneHidden: document.getElementById("tone-screen").classList.contains("hidden"),
        titleVisible: !document.getElementById("title-screen").classList.contains("hidden")
      };

      revisitTone();
      const toneSpacebar = dispatch(keyEvent("Spacebar"));
      const spacebarTone = {
        prevented: toneSpacebar.prevented,
        toneHidden: document.getElementById("tone-screen").classList.contains("hidden"),
        titleVisible: !document.getElementById("title-screen").classList.contains("hidden")
      };

      const begin = document.getElementById("btn-begin");
      const originalClick = begin.click;
      let beginClicks = 0;
      begin.click = () => { beginClicks += 1; };

      showTitleScreen();
      const titleEnter = dispatch(keyEvent("Enter"));
      const title = {
        prevented: titleEnter.prevented,
        beginClicks
      };

      beginClicks = 0;
      showTitleScreen();
      const titleSpace = dispatch(keyEvent(" "));
      const space = {
        prevented: titleSpace.prevented,
        beginClicks
      };

      beginClicks = 0;
      showTitleScreen();
      showCommanderCreate();
      const commanderEvent = dispatch(keyEvent("Enter"));
      const commander = {
        prevented: commanderEvent.prevented,
        beginClicks,
        visible: !document.getElementById("commander-create").classList.contains("hidden")
      };
      hideCommanderCreate();

      beginClicks = 0;
      showTitleScreen();
      showNewRunConfirm();
      const confirmEvent = dispatch(keyEvent(" "));
      const confirm = {
        prevented: confirmEvent.prevented,
        beginClicks,
        visible: !document.getElementById("new-run-confirm").classList.contains("hidden")
      };
      hideNewRunConfirm();

      beginClicks = 0;
      const game = document.getElementById("game-screen");
      const titleScreen = document.getElementById("title-screen");
      game.classList.remove("hidden");
      titleScreen.classList.remove("hidden");
      const gameEvent = dispatch(keyEvent("Enter"));
      const gameplay = {
        prevented: gameEvent.prevented,
        beginClicks
      };
      game.classList.add("hidden");

      beginClicks = 0;
      showTitleScreen();
      const interactiveEvent = dispatch(keyEvent("Enter", { target: { tagName: "BUTTON" } }));
      const interactive = {
        prevented: interactiveEvent.prevented,
        beginClicks
      };

      beginClicks = 0;
      showTitleScreen();
      const modifiedEvent = dispatch(keyEvent("Enter", { ctrlKey: true }));
      const modified = {
        prevented: modifiedEvent.prevented,
        beginClicks
      };

      begin.click = originalClick;

      return { tone, spacebarTone, title, space, commander, confirm, gameplay, interactive, modified };
    })()`);

    if (!fixture.tone.prevented || !fixture.tone.toneHidden || !fixture.tone.titleVisible) {
      errors.push("Enter did not dismiss tone-screen into the title-screen");
    }
    if (!fixture.spacebarTone.prevented || !fixture.spacebarTone.toneHidden || !fixture.spacebarTone.titleVisible) {
      errors.push("Spacebar did not dismiss tone-screen into the title-screen");
    }
    if (!fixture.title.prevented || fixture.title.beginClicks !== 1) {
      errors.push("Enter did not activate btn-begin on the title-screen");
    }
    if (!fixture.space.prevented || fixture.space.beginClicks !== 1) {
      errors.push("Space did not activate btn-begin on the title-screen");
    }
    if (fixture.commander.prevented || fixture.commander.beginClicks !== 0 || !fixture.commander.visible) {
      errors.push("title chrome keydown ignored commander-create guard");
    }
    if (fixture.confirm.prevented || fixture.confirm.beginClicks !== 0 || !fixture.confirm.visible) {
      errors.push("title chrome keydown ignored new-run-confirm guard");
    }
    if (fixture.gameplay.prevented || fixture.gameplay.beginClicks !== 0) {
      errors.push("title chrome keydown ran while game-screen was visible");
    }
    if (fixture.interactive.prevented || fixture.interactive.beginClicks !== 0) {
      errors.push("title chrome keydown handled an interactive target");
    }
    if (fixture.modified.prevented || fixture.modified.beginClicks !== 0) {
      errors.push("title chrome keydown handled a modified Enter");
    }
  } catch (error) {
    errors.push(`title chrome keyboard runtime: ${error.message}`);
  }

  return errors;
}
