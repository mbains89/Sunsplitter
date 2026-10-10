// SUN-036-TUTORIAL-PHONE-STICKY-01 — phone (390×844 / 360×640) tutorial fields must be reachable.
// Headless Chrome is not in this repo. This asserts the shipped CSS: under max-width <600
// the field list is the scroller and actions cannot sticky-cover. Must FAIL on base tip
// (sticky on phone) and PASS on branch (phone media makes list scroller + actions static).
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PHONE_MEDIA = "@media (max-width: 599px)";
const ZOOM_MEDIA = "@media (min-width: 600px) and (max-height: 800px)";

function mediaBlock(css, marker) {
  const start = css.indexOf(marker);
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

export function sunPlayerflowTutorialPhoneStickyChecks() {
  const errors = [];
  const css = readFileSync(resolve(ROOT, "css/tutorial-topfields.css"), "utf8");
  const pc = readFileSync(resolve(ROOT, "css/pc-viewport.css"), "utf8");
  const index = readFileSync(resolve(ROOT, "index.html"), "utf8");
  for (const id of ["tutorial-field-crew", "tutorial-field-hull", "tutorial-field-coh", "tutorial-field-sup", "tutorial-field-emb"]) {
    if (!index.includes('id="' + id + '"')) errors.push("missing #" + id);
  }
  // Zoom block must remain intact
  if (!css.includes(ZOOM_MEDIA)) errors.push("zoom media block missing or weakened");
  const phoneBlock = mediaBlock(css, PHONE_MEDIA);
  if (!phoneBlock) {
    errors.push("no @media (max-width: 599px) phone scroller block; actions can sticky-cover on 390x844");
    return errors;
  }
  const parsed = rules(phoneBlock);
  const fields = ruleBody(parsed, "#tutorial-topfields");
  const actions = ruleBody(parsed, ".tutorial-actions");
  const panel = ruleBody(parsed, ".tutorial-panel");
  if (decl(fields, "overflow") !== "auto") errors.push("phone field list is not the scroller");
  if (decl(fields, "flex") !== "1 1 auto") errors.push("phone fields lack flex: 1 1 auto");
  if (decl(fields, "min-height") !== "0") errors.push("phone fields lack min-height: 0");
  if (decl(actions, "position") !== "static") errors.push("phone actions still sticky-cover fields");
  if (!panel.includes("overflow: hidden") && decl(panel, "overflow") !== "hidden") {
    errors.push("phone panel does not hide overflow so fields can scroll");
  }
  // pc-viewport must not force sticky on phone
  const pcBase = pc.slice(0, Math.max(0, pc.indexOf("@media (min-width: 600px)")));
  if (pcBase.includes(".tutorial-actions") && pcBase.includes("position: sticky")) {
    errors.push("pc-viewport.css still forces .tutorial-actions sticky under 600px");
  }
  return errors;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const errors = sunPlayerflowTutorialPhoneStickyChecks();
  if (errors.length) {
    console.error("FAIL sun-playerflow-tutorial-phone-sticky", errors);
    process.exit(1);
  }
  console.log("PASS sun-playerflow-tutorial-phone-sticky 390x844/360x640 fields scrollable; actions static; no phone sticky cover");
}
