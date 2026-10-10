// SUN-036-CREW-SHEET-WIDE-01 -- Crew character sheet shows the portrait beside the bio on desktop
import { readFileSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { loadGame } from "./simulate.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function readCssFiles() {
  const cssDir = resolve(ROOT, "css");
  const files = readdirSync(cssDir).filter(f => f.endsWith(".css")).sort();
  return files.map(f => ({ name: f, content: readFileSync(resolve(cssDir, f), "utf8") }));
}

function resolveProperty(cssContent, selector, prop) {
  const selEsc = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(selEsc + "\\s*\\{([^}]+)\}", "g");
  let last = null;
  let match;
  while ((match = regex.exec(cssContent)) !== null) {
    const block = match[1];
    const propRe = new RegExp("(?:^|;)\\s*" + prop + "\\s*:\\s*([^;]+)", "m");
    const pm = block.match(propRe);
    if (pm) last = pm[1].trim();
  }
  return last;
}

export function sunPlayerflowCrewSheetWideChecks() {
  const errors = [];
  const cssFiles = readCssFiles();
  const allCss = cssFiles.map(f => f.content).join("\n");
  const crewCss = cssFiles.find(f => f.name === "crew-sheet.css")?.content || "";
  const indexHtml = readFileSync(resolve(ROOT, "index.html"), "utf8");

  // GUARDS
  const g1Required = ["position: fixed", "#crew-sheet.visible", "aspect-ratio: 784 / 1168", "flex-direction: column", ".crew-chip.selected"];
  for (const req of g1Required) {
    if (!crewCss.includes(req)) errors.push(`G1 FAIL: missing '${req}'`);
  }

  const closeIdx = indexHtml.indexOf('id="crew-sheet-close"');
  const portraitIdx = indexHtml.indexOf('id="crew-sheet-portrait-wrap"');
  const bodyIdx = indexHtml.indexOf('id="crew-sheet-body"');
  if (!(closeIdx >= 0 && portraitIdx > closeIdx && bodyIdx > portraitIdx)) {
    errors.push("G2 FAIL: ids order");
  }

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
    if (!result || !result.opened || !result.closed) errors.push("G3 FAIL: runtime " + JSON.stringify(result));
  } catch (e) {
    errors.push("G3 FAIL: " + e.message);
  }

  // FEATURES desktop
  const mediaStart = crewCss.indexOf("@media (min-width: 1024px)");
  const mediaBlock = mediaStart >= 0 ? crewCss.slice(mediaStart) : "";
  if (!mediaBlock.includes("display: grid") || !mediaBlock.includes("grid-template-columns")) {
    errors.push("F1 FAIL: missing @media (min-width: 1024px) grid");
  }

  if (!mediaBlock.includes("grid-column: 1 / -1") || !mediaBlock.includes("grid-column: 1") || !mediaBlock.includes("#crew-sheet-portrait-wrap.visible + #crew-sheet-body") || !mediaBlock.includes("grid-column: 2")) {
    errors.push("F2 FAIL: grid column rules incomplete");
  }

  if (mediaBlock.includes("aspect-ratio:") || (mediaBlock.includes("object-fit: cover") && mediaBlock.includes("#crew-sheet-image"))) {
    errors.push("F3 FAIL: media block alters proportions");
  }

  if (crewCss.includes("@media (min-width: 600px)") || crewCss.includes("@media (min-width: 800px)")) {
    errors.push("F4 FAIL: media below 1024px for side-by-side");
  }

  // SHAPE
  const finalFit = resolveProperty(allCss, "#crew-sheet-image", "object-fit");
  const finalHeight = resolveProperty(allCss, "#crew-sheet-image", "height");
  if (finalFit !== "contain" || (finalHeight && finalHeight !== "auto" && !finalHeight.includes("auto"))) {
    errors.push("SHAPE FAIL: final object-fit is " + (finalFit || "none") + " height=" + (finalHeight || "none") + " (must be contain + auto)");
  }

  // PHONE CASE (new): inside max-width 1023px, portrait max-height must be 100% (of frame), frame flex centered
  const phoneMedia = crewCss.match(/@media\s*\(max-width:\s*1023px\)\s*\{([\s\S]*?)\}/);
  const phoneBlock = phoneMedia ? phoneMedia[1] : "";
  const phoneMaxH = resolveProperty(phoneBlock || crewCss, "#crew-sheet-image", "max-height");
  if (!phoneBlock || phoneMaxH !== "100%" || /dvh|vh|svh|lvh/.test(phoneMaxH || "")) {
    errors.push("PHONE FAIL: portrait phone max-height is " + (phoneMaxH || "none") + " (must be 100%, no dvh)");
  }
  if (!phoneBlock.includes("display: flex") || !phoneBlock.includes("justify-content: center") || !phoneBlock.includes("align-items: center")) {
    errors.push("PHONE FAIL: frame not flex centered in phone media");
  }

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
