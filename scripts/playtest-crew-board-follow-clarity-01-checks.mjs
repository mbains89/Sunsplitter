import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// SUN-CREW-BOARD-FOLLOW-CLARITY-01 — first Crew tap shows the living board.
export function playtestCrewBoardFollowClarity01Checks(runtime) {
  const errors = [];
  const engine = readFileSync(resolve(ROOT, "src/engine.js"), "utf8");
  const validate = readFileSync(resolve(ROOT, "src/validate.js"), "utf8");
  const overlay = readFileSync(resolve(ROOT, "src/crew-board-follow-clarity.js"), "utf8");
  const html = readFileSync(resolve(ROOT, "index.html"), "utf8");
  if (!html.includes('id="btn-crew"') || !html.includes('id="crew-panel"') || !html.includes('id="crew-sheet"')) {
    errors.push("Crew board markup tokens missing");
  }
  if (!engine.includes('renderCrewPanel("lena")')) {
    errors.push("toggleCrewPanel lost the Lena panel paint required by crewOverviewChecks");
  }
  if (!(html.includes("src/crew-board-follow-clarity.js") || validate.includes("crewBoardOpenPass"))) {
    errors.push("index.html does not load crew-board-follow-clarity.js after validate.js");
  }
  if (!(validate.includes("crewBoardOpenPass") || overlay.includes("crewBoardOpenPass")) ||
      !(validate.includes("closeCrewSheet()") || overlay.includes("closeCrewSheet()"))) {
    errors.push("first-open sheet hold missing crewBoardOpenPass / closeCrewSheet");
  }
  if (typeof runtime === "undefined" || !runtime || typeof runtime.evaluate !== "function") return errors;
  try {
    const fixture = runtime.evaluate(`(() => {
      localStorage.clear();
      resetRunState();
      showScene("wake");
      const panel = document.getElementById("crew-panel");
      const sheet = document.getElementById("crew-sheet");
      toggleCrewPanel();
      const first = {
        panel: panel.classList.contains("visible"),
        sheet: sheet.classList.contains("visible") && !sheet.classList.contains("hidden"),
        chips: (panel.innerHTML.match(/crew-chip/g) || []).length,
        count: /Crew · \\d+ living \\/ \\d+ listed/.test(panel.innerHTML),
        trust: panel.innerHTML.includes("Trust: 40/100")
      };
      const miraBtn = panel.querySelector('[data-crew="mira"]');
      if (miraBtn && typeof miraBtn.click === "function") miraBtn.click();
      const afterChip = {
        sheet: sheet.classList.contains("visible") && !sheet.classList.contains("hidden"),
        name: document.getElementById("crew-sheet-name").textContent
      };
      return { first, afterChip };
    })()`);
    if (!fixture.first.panel || fixture.first.sheet) errors.push("first Crew tap did not show the board with the sheet closed");
    if (!fixture.first.chips || !fixture.first.count) errors.push("first Crew tap missing chips or living/listed count");
    if (!fixture.first.trust) errors.push("first Crew tap lost Lena panel trust paint");
    if (!fixture.afterChip.sheet || fixture.afterChip.name !== "Mira Solis") {
      errors.push("tapping a name did not open that official sheet");
    }
  } catch (error) {
    errors.push(`crew board follow clarity runtime: ${error.message}`);
  }
  return errors;
}
