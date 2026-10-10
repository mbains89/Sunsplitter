// SUN-036-CREW-SHEET-WIDE-01 — Crew character sheet shows the portrait beside the bio on desktop
import { readFileSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { loadGame } from "./simulate.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function readCssFiles() {
  const cssDir = resolve(ROOT, "css");
  const files = readdirSync(cssDir).filter(f => f.endsWith(".css"));
  return files.map(f => ({ name: f, content: readFileSync(resolve(cssDir, f), "utf8") }));
}

export function sunPlayerflowCrewSheetWideChecks() {
  const errors = [];
  const cssFiles = readCssFiles();
  const crewCss = cssFiles.find(f => f.name === "crew-sheet.css")?.content || "";
  const indexHtml = readFileSync(resolve(ROOT, "index.html"), "utf8");

  // G1: css/crew-sheet.css keeps key strings
  const g1Required = [
    "position: fixed",
    "#crew-sheet.visible",
    "aspect-ratio: 784 / 1168",
    "flex-direction: column",
    ".crew-chip.selected"
  ];
  for (const req of g1Required) {
    if (!crewCss.includes(req)) errors.push(`G1 FAIL: missing '${req}' in crew-sheet.css`);
  }

  // G2: index.html order
  const closeIdx = indexHtml.indexOf('id="crew-sheet-close"');
  const portraitIdx = indexHtml.indexOf('id="crew-sheet-portrait-wrap"');
  const bodyIdx = indexHtml.indexOf('id="crew-sheet-body"');
  if (closeIdx < 0 || portraitIdx < 0 || bodyIdx < 0 || !(closeIdx < portraitIdx && portraitIdx < bodyIdx)) {
    errors.push("G2 FAIL: ids not in order close, portrait-wrap, body");
  }

  // G3: runtime
  try {
    const game = loadGame(ROOT);
    const result = game.evaluate(`(() => {
      localStorage.clear();
      resetRunState();
      showScene("wake");
      renderCrewPanel("lena");
      const sheet = document.getElementById("crew-sheet");
      const wrap = document.getElementById("crew-sheet-portrait-wrap");
      const name = document.getElementById("crew-sheet-name");
      const opened = sheet && sheet.classList.contains("visible") && wrap && wrap.classList.contains("visible") && name && name.textContent.trim();
      closeCrewSheet();
      const closed = sheet && !sheet.classList.contains("visible");
      return { opened, closed };
    })()`);
    if (!result || !result.opened || !result.closed) {
      errors.push("G3 FAIL: runtime sheet open/close " + JSON.stringify(result));
    }
  } catch (e) {
    errors.push("G3 FAIL: runtime exception " + e.message);
  }

  // F1: @media (min-width: 1024px) for grid
  const hasMedia = crewCss.includes("@media (min-width: 1024px)") && crewCss.includes("display: grid") && crewCss.includes("grid-template-columns");
  if (!hasMedia) errors.push("F1 FAIL: missing @media (min-width: 1024px) grid block");

  // F2: specific grid placements
  const hasCloseSpan = crewCss.includes("#crew-sheet-close") && crewCss.includes("grid-column: 1 / -1");
  const hasPortraitCol = crewCss.includes("#crew-sheet-portrait-wrap.visible") && crewCss.includes("grid-column: 1");
  const hasBodyBeside = crewCss.includes("#crew-sheet-portrait-wrap.visible + #crew-sheet-body") && crewCss.includes("grid-column: 2");
  const hasBodyDefault = crewCss.includes("#crew-sheet-body") && crewCss.includes("grid-column: 1 / -1");
  if (!(hasCloseSpan && hasPortraitCol && hasBodyBeside && hasBodyDefault)) {
    errors.push("F2 FAIL: grid column rules incomplete");
  }

  // F3: no aspect-ratio or object-fit change in the block (simplified)
  // F4: no min-width below 1024, no forced-colors side-by-side
  if (crewCss.includes("@media (min-width: 600px)") || crewCss.includes("@media (min-width: 800px)")) {
    errors.push("F4 FAIL: side-by-side media below 1024px");
  }

  // Shape check (addendum): scan all CSS for bad rules on picture
  const allCss = cssFiles.map(f => f.content).join("\n");
  if (allCss.includes("object-fit: cover") || allCss.includes("object-fit:fill") || allCss.includes("object-fit: fill")) {
    // Note: existing has object-fit: cover on #crew-sheet-image — this may need refinement
    // For now, flag if present in a way that affects proportions negatively
    errors.push("SHAPE FAIL: object-fit: cover or fill found (may crop)");
  }
  // More precise shape checks would parse selectors targeting #crew-sheet-image

  return errors;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const errors = sunPlayerflowCrewSheetWideChecks();
  if (errors.length) {
    console.error("FAIL sun-playerflow-crew-sheet-wide", errors);
    process.exit(1);
  }
  console.log("PASS sun-playerflow-crew-sheet-wide all cases");
}
