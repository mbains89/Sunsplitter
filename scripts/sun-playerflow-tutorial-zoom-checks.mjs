// SUN-036-TUTORIAL-ZOOM-01 — the zoom card must keep every field scrollable into view.
// Headless Chrome is not in this repo (no puppeteer/playwright). This reads the shipped
// zoom block and fails if the panel max-height is not the real calc, or if the field
// list loses flex: 1 1 auto / min-height: 0. A 120px panel cannot pass.
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const MARKER = "@media (min-width: 600px) and (max-height: 800px)";
const WANT_MAX = "calc(100dvh - 68px - var(--safe-top))";
const VIEWS = [
  { name: "640x400", width: 640, height: 400 },
  { name: "1280x720@150%", width: 1280, height: 720 }
];
const RESERVED = 14 + 12 + 28 + 44 + 48;
const FIELD = 32;

function mediaBlock(css) {
  const start = css.indexOf(MARKER);
  if (start < 0) return "";
  const open = css.indexOf("{", start);
  let depth = 0;
  for (let i = open; i < css.length; i++) {
    if (css[i] === "{") depth++;
    else if (css[i] === "}") {
      depth--;
      if (depth === 0) return css.slice(open + 1, i);
    }
  }
  return "";
}

function rules(block) {
  const out = [];
  let i = 0;
  while (i < block.length) {
    const open = block.indexOf("{", i);
    if (open < 0) break;
    const selector = block.slice(i, open);
    let depth = 1;
    let j = open + 1;
    while (j < block.length && depth) {
      if (block[j] === "{") depth++;
      else if (block[j] === "}") depth--;
      j++;
    }
    out.push({ selector, body: block.slice(open + 1, j - 1) });
    i = j;
  }
  return out;
}

function decl(body, prop) {
  for (const part of body.split(";")) {
    const cut = part.indexOf(":");
    if (cut < 0) continue;
    if (part.slice(0, cut).trim() === prop) return part.slice(cut + 1).trim();
  }
  return "";
}

function ruleBody(parsed, needle) {
  const hit = parsed.find(rule => rule.selector.includes(needle));
  return hit ? hit.body : "";
}

export function sunPlayerflowTutorialZoomChecks() {
  const errors = [];
  const css = readFileSync(resolve(ROOT, "css/tutorial-topfields.css"), "utf8");
  const index = readFileSync(resolve(ROOT, "index.html"), "utf8");
  for (const id of ["tutorial-skip", "tutorial-dismiss", "tutorial-field-crew", "tutorial-field-hull", "tutorial-field-coh", "tutorial-field-sup", "tutorial-field-emb"]) {
    if (!index.includes('id="' + id + '"')) errors.push("missing #" + id);
  }
  const base = css.slice(0, Math.max(0, css.indexOf(MARKER)));
  if (!base.includes("padding: calc(56px + var(--safe-top)) 12px 0;")) errors.push("phone top offset changed");
  if (!base.includes("max-height: min(46dvh, 360px);")) errors.push("phone max-height changed");
  if (!base.includes("pointer-events: none;")) errors.push("scrim pointer-events changed");
  const parsed = rules(mediaBlock(css));
  const panel = ruleBody(parsed, ".tutorial-panel");
  const fields = ruleBody(parsed, "#tutorial-topfields");
  const actions = ruleBody(parsed, ".tutorial-actions");
  const maxH = decl(panel, "max-height");
  const flex = decl(fields, "flex");
  const minH = decl(fields, "min-height");
  if (maxH !== WANT_MAX) errors.push("panel max-height is " + JSON.stringify(maxH) + ", want " + WANT_MAX);
  if (flex !== "1 1 auto") errors.push("field flex is " + JSON.stringify(flex) + ", want 1 1 auto");
  if (minH !== "0") errors.push("field min-height is " + JSON.stringify(minH) + ", want 0");
  if (decl(fields, "overflow") !== "auto") errors.push("field list is not the scroller");
  if (decl(actions, "position") !== "static") errors.push("actions still cover fields");
  for (const view of VIEWS) {
    const panelH = maxH === WANT_MAX ? view.height - 68 : (maxH.endsWith("px") ? Number(maxH.slice(0, -2)) : 0);
    const room = panelH - RESERVED;
    if (!(room >= FIELD)) errors.push(view.name + " field room " + room + "px < one field; not scrollable into view");
    if (flex !== "1 1 auto" || minH !== "0") errors.push(view.name + " fields cannot shrink into the scroller");
  }
  return errors;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const errors = sunPlayerflowTutorialZoomChecks();
  if (errors.length) {
    console.error("FAIL sun-playerflow-tutorial-zoom", errors);
    process.exit(1);
  }
  console.log("PASS sun-playerflow-tutorial-zoom 640x400 + 1280x720 fields scrollable into view; flex 1 1 auto; min-height 0; calc max-height");
}
