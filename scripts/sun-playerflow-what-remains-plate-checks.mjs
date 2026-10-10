// SUN-036-WHAT-REMAINS-PLATE-01 — What Remains picture fits the screen and sits beside the words on desktop.
// Shape check is pure CSS (no render): fails on object-fit:cover/fill, fixed width AND height, or aspect-ratio that changes proportions.
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { loadGame } from "./simulate.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function outsideForcedColors(css, needle) {
  const at = css.indexOf(needle);
  if (at < 0) return false;
  const media = "@media (forced-colors: active)";
  let search = 0;
  while (true) {
    const start = css.indexOf(media, search);
    if (start < 0 || start > at) return true;
    const open = css.indexOf("{", start);
    if (open < 0 || open > at) return true;
    let depth = 0;
    for (let i = open; i < css.length; i++) {
      if (css[i] === "{") depth++;
      else if (css[i] === "}") {
        depth--;
        if (depth === 0) {
          if (at > open && at < i) return false;
          search = i + 1;
          break;
        }
      }
    }
    if (search <= start) return true;
  }
}

function collectCss() {
  // Load order from index.html: style.css then art-panel.css (and any others that might affect)
  const files = ["css/style.css", "css/art-panel.css"];
  return files.map(f => readFileSync(resolve(ROOT, f), "utf8")).join("\n");
}

function shapeBad(css, selector) {
  // Fail if any rule that can reach the picture has cover/fill, fixed w+h, or aspect-ratio that forces change
  const re = new RegExp(selector.replace(/[#.]/g, "\\$&") + "[^{]*\\{([^}]*)\\}", "g");
  let m;
  while ((m = re.exec(css)) !== null) {
    const body = m[1];
    if (/object-fit:\s*(cover|fill)/.test(body)) return true;
    if (/width:\s*[0-9]+px/.test(body) && /height:\s*[0-9]+px/.test(body)) return true;
    if (/aspect-ratio:\s*[^;]+/.test(body) && !/aspect-ratio:\s*auto/.test(body)) return true;
  }
  return false;
}

export function sunPlayerflowWhatRemainsPlateChecks() {
  const errors = [];
  const styleCss = readFileSync(resolve(ROOT, "css/style.css"), "utf8");
  const artCss = readFileSync(resolve(ROOT, "css/art-panel.css"), "utf8");
  const indexHtml = readFileSync(resolve(ROOT, "index.html"), "utf8");
  const allCss = collectCss();

  // G1 Ending plate contract
  if (!styleCss.includes("#ending-image-wrap {") ||
      !styleCss.includes("max-height: 320px") ||
      !styleCss.includes("object-fit: contain") ||
      !styleCss.includes("max-height: 240px")) {
    errors.push("FAIL: case G1 Ending plate contract missing in style.css");
  }

  // G2 original minimized block
  if (!artCss.includes("#scene-image-wrap.minimized") ||
      !artCss.includes("max-height: min(26vh, 200px)")) {
    errors.push("FAIL: case G2 original minimized block missing in art-panel.css");
  }

  // G3 index.html ids in order
  const wrWrap = indexHtml.indexOf('id="what-remains-image-wrap"');
  const wrImg = indexHtml.indexOf('id="what-remains-image"');
  const wrHead = indexHtml.indexOf('id="what-remains-heading"');
  const endWrap = indexHtml.indexOf('id="ending-image-wrap"');
  if (wrWrap < 0 || wrImg < 0 || wrHead < 0 || endWrap < 0 || !(wrWrap < wrImg && wrImg < wrHead)) {
    errors.push("FAIL: case G3 What Remains ids missing or out of order in index.html");
  }

  // G4 runtime
  try {
    const game = loadGame(ROOT);
    const result = game.evaluate(`(() => {
      localStorage.clear();
      resetRunState();
      setEndingArt("images/ending_ship.jpg");
      showWhatRemains();
      const wrWrap = document.getElementById("what-remains-image-wrap");
      const wrImg = document.getElementById("what-remains-image");
      const endWrap = document.getElementById("ending-image-wrap");
      return {
        wrVisible: wrWrap && wrWrap.classList.contains("visible"),
        wrSrc: wrImg && (wrImg.__ssManagedSource || wrImg.src || "").includes("ending_ship.jpg"),
        endingVisible: endWrap && endWrap.classList.contains("visible")
      };
    })()`);
    if (!result || !result.wrVisible || !result.wrSrc || result.endingVisible) {
      errors.push("FAIL: case G4 runtime What Remains art not correctly shown: " + JSON.stringify(result));
    }
  } catch (e) {
    errors.push("FAIL: case G4 runtime loadGame error: " + e.message);
  }

  // Shape: pure CSS, both pictures
  if (shapeBad(allCss, "#what-remains-image") || shapeBad(allCss, "#ending-image")) {
    errors.push("FAIL: case SHAPE picture rule uses cover/fill, fixed width+height, or non-auto aspect-ratio");
  }

  // F1 What Remains frame
  if (!artCss.includes("#what-remains-image-wrap {") ||
      !artCss.includes("#what-remains-image-wrap.visible") ||
      !artCss.match(/#what-remains-image-wrap[^}]*max-width:\s*520px/)) {
    errors.push("FAIL: case F1 What Remains frame rules missing or max-width >520 in art-panel.css");
  }

  // F2 image rules + phone cap
  if (!artCss.includes("#what-remains-image {") ||
      !artCss.match(/#what-remains-image[^}]*max-height:\s*320px/) ||
      !artCss.includes("object-fit: contain") ||
      !artCss.match(/@media \(max-width:\s*480px\)[^}]*#what-remains-image[^}]*max-height:\s*240px/s)) {
    errors.push("FAIL: case F2 What Remains image max-height/object-fit or 480px cap missing");
  }

  // F3 desktop composition
  if (!artCss.includes("@media (min-width: 1024px)") ||
      !artCss.includes("#ending-screen") ||
      !artCss.includes("#what-remains-screen") ||
      !artCss.includes("grid-template-columns") ||
      !artCss.includes("grid-column: 1") ||
      !artCss.includes("grid-column: 2")) {
    errors.push("FAIL: case F3 desktop ≥1024px plate-beside-words grid missing");
  }

  // F4 no forced-colors, no low min-width for side-by-side
  if (!outsideForcedColors(artCss, "#what-remains-image-wrap") ||
      artCss.match(/@media \(min-width:\s*(?!1024)[0-9]+px\)[^}]*grid-template-columns/)) {
    errors.push("FAIL: case F4 rules inside forced-colors or side-by-side below 1024px");
  }

  return errors;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const errors = sunPlayerflowWhatRemainsPlateChecks();
  if (errors.length) {
    console.error("FAIL sun-playerflow-what-remains-plate");
    errors.forEach(e => console.error(e));
    process.exit(1);
  }
  console.log("PASS sun-playerflow-what-remains-plate G1-G4 F1-F4 SHAPE");
}
