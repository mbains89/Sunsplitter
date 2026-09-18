export function titleChromeKeyboardChecks(runtime) {
  const errors = [];
  const fixture = runtime.evaluate(`(() => {
    const keyEvent = (key) => ({
      key,
      target: { tagName: "BODY" },
      defaultPrevented: false,
      repeat: false,
      altKey: false,
      ctrlKey: false,
      metaKey: false,
      preventDefault() { this.defaultPrevented = true; }
    });
    const tone = document.getElementById("tone-screen");
    const title = document.getElementById("title-screen");
    const create = document.getElementById("commander-create");
    const begin = document.getElementById("btn-begin");
    if (typeof handleTitleChromeKeydown !== "function") {
      return { missing: true };
    }
    try { localStorage.removeItem(TONE_ACK_KEY); } catch (e) {}
    showScreen("tone");
    const afterEnter = handleTitleChromeKeydown(keyEvent("Enter"));
    const afterTone = {
      invoked: afterEnter,
      toneHidden: tone.classList.contains("hidden"),
      titleVisible: !title.classList.contains("hidden"),
      ack: (function () { try { return localStorage.getItem(TONE_ACK_KEY); } catch (e) { return null; } })()
    };
    showScreen("title");
    if (create) { create.classList.add("hidden"); create.classList.remove("visible"); }
    const afterBegin = handleTitleChromeKeydown(keyEvent("Enter"));
    const createOpen = !!(create && !create.classList.contains("hidden"));
    const gameOpen = !document.getElementById("game-screen").classList.contains("hidden");
    const cineOpen = !document.getElementById("cinematic-screen").classList.contains("hidden");
    return { missing: false, afterTone, afterBegin, createOpen, gameOpen, cineOpen, beginPresent: !!begin };
  })()`);
  if (fixture.missing) {
    errors.push("handleTitleChromeKeydown missing");
    return errors;
  }
  if (!fixture.afterTone.invoked || !fixture.afterTone.toneHidden || !fixture.afterTone.titleVisible || fixture.afterTone.ack !== "1") {
    errors.push("Enter on content notice did not acknowledge and land on title");
  }
  if (!fixture.afterBegin || !(fixture.createOpen || fixture.gameOpen || fixture.cineOpen)) {
    errors.push("Enter on title did not open commander-create, intro, or game");
  }
  if (!fixture.beginPresent) errors.push("title Begin control missing");
  return errors;
}
