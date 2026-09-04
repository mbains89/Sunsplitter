import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// SUN-PLAYTEST-CREW-CHARACTER-SCREEN-01 — open/close sheet + official bodysuit wiring.
export function playtestCrewCharacterScreenChecks(runtime) {
  const errors = [];
  const html = readFileSync(resolve(ROOT, "index.html"), "utf8");
  const css = readFileSync(resolve(ROOT, "css/style.css"), "utf8");
  const engine = readFileSync(resolve(ROOT, "src/engine.js"), "utf8");
  if (!html.includes('id="crew-sheet"') || !html.includes('id="crew-sheet-close"') || !html.includes('id="crew-sheet-image"')) {
    errors.push("index missing full-screen crew sheet markup");
  }
  if (!css.includes("position: fixed") || !css.includes("#crew-sheet.visible") || !css.includes("max-height: min(36dvh, 260px)")) {
    errors.push("sheet overlay CSS missing or crew-panel height contract dropped");
  }
  if (!engine.includes("officialBodysuitSrc") || !engine.includes("images/bodysuit_lena.jpg") || !engine.includes("closeCrewSheet")) {
    errors.push("engine missing official bodysuit wiring or sheet close");
  }
  try {
    const fixture = runtime.evaluate(`(() => {
      localStorage.clear();
      resetRunState();
      showScene("wake");
      const panel = document.getElementById("crew-panel");
      const sheet = document.getElementById("crew-sheet");
      const img = document.getElementById("crew-sheet-image");
      const before = JSON.stringify(state);
      toggleCrewPanel();
      const opened = {
        panel: panel.classList.contains("visible"),
        sheet: sheet.classList.contains("visible") && !sheet.classList.contains("hidden"),
        name: document.getElementById("crew-sheet-name").textContent,
        trust: document.getElementById("crew-sheet-facts").textContent.includes("Trust: 40/100"),
        condition: document.getElementById("crew-sheet-facts").textContent.includes("Condition: Alive"),
        portrait: img && (img.__ssManagedSource === "images/bodysuit_lena.jpg" || img.getAttribute("src") === "images/bodysuit_lena.jpg"),
        alt: img ? img.alt : ""
      };
      closeCrewSheet();
      const afterClose = {
        sheetHidden: !sheet.classList.contains("visible") && sheet.classList.contains("hidden"),
        panelOpen: panel.classList.contains("visible"),
        portraitCleared: !img.__ssManagedSource
      };
      renderCrewPanel("mira");
      const mira = {
        name: document.getElementById("crew-sheet-name").textContent,
        portrait: img && (img.__ssManagedSource === "images/bodysuit_mira.jpg" || img.getAttribute("src") === "images/bodysuit_mira.jpg"),
        role: document.getElementById("crew-sheet-role").textContent.includes("Engineer"),
        affinity: document.getElementById("crew-sheet-facts").textContent.includes("Affinity: 0/100")
      };
      document.dispatchEvent({ type: "keydown", key: "Escape" });
      const afterEsc = !sheet.classList.contains("visible") && panel.classList.contains("visible");
      toggleCrewPanel();
      const closedAll = !panel.classList.contains("visible") && !sheet.classList.contains("visible");
      return { opened, afterClose, mira, afterEsc, closedAll, stable: JSON.stringify(state) === before };
    })()`);
    if (!fixture.opened.panel || !fixture.opened.sheet) errors.push("opening Crew did not show full-screen sheet");
    if (fixture.opened.name !== "Dr. Lena Voss" || !fixture.opened.trust || !fixture.opened.condition) {
      errors.push("Lena sheet facts drifted from existing game data");
    }
    if (!fixture.opened.portrait || !fixture.opened.alt.includes("bodysuit")) {
      errors.push("Lena official bodysuit portrait not wired");
    }
    if (!fixture.afterClose.sheetHidden || !fixture.afterClose.panelOpen) {
      errors.push("Back/close did not return to prior crew UI");
    }
    if (fixture.mira.name !== "Mira Solis" || !fixture.mira.portrait || !fixture.mira.role || !fixture.mira.affinity) {
      errors.push("Mira sheet missing official portrait or existing traits");
    }
    if (!fixture.afterEsc) errors.push("Escape did not close sheet while leaving crew panel");
    if (!fixture.closedAll || !fixture.stable) errors.push("sheet open/close mutated run state or failed to close with Crew");
  } catch (error) {
    errors.push(`crew sheet runtime: ${error.message}`);
  }
  return errors;
}
