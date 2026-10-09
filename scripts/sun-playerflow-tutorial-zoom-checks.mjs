// SUN-036-TUTORIAL-ZOOM-01 — tutorial card fits zoomed and short desktop windows.
// Fields scroll in their own region. Skip / Got it stay a static footer on desktop.
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const VIEWPORTS = [
  { name: "640x400", width: 640, height: 400 },
  { name: "853x533", width: 853, height: 533 },
  { name: "960x540", width: 960, height: 540 },
  { name: "1024x600", width: 1024, height: 600 },
  { name: "1280x800", width: 1280, height: 800 }
];
const PHONE = { name: "390x844", width: 390, height: 844 };
const BUTTONS = ["#tutorial-skip", "#tutorial-dismiss"];
const STATUS = 56;
const ACTION_H = 56;
const CHROME = 85;
const MARKER = "@media (min-width: 600px) and (max-height: 800px)";

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

function layout(width, height, zoomed) {
  const top = STATUS;
  const maxH = zoomed ? Math.max(120, height - 68) : Math.min(0.46 * height, 360);
  const panelH = Math.min(maxH, height - top - 8);
  const actionTop = top + panelH - ACTION_H;
  return { top, panelH, actionTop, actionBottom: top + panelH, fieldTop: top + CHROME };
}

function inside(box, width, height) {
  return box.x >= 0 && box.y >= 0 && box.x + box.w <= width && box.y + box.h <= height;
}

function elementFromPoint(x, y, width, height, zoomed) {
  if (y < STATUS) return "#status";
  const box = layout(width, height, zoomed);
  if (y >= box.actionTop && y <= box.actionBottom) return "#tutorial-skip";
  if (y >= box.fieldTop && y < box.actionTop) return "#tutorial-field-crew";
  return "#tutorial-panel";
}

export function sunPlayerflowTutorialZoomChecks() {
  const errors = [];
  const css = readFileSync(resolve(ROOT, "css/tutorial-topfields.css"), "utf8");
  const zoom = mediaBlock(css);
  const base = css.slice(0, css.indexOf(MARKER));
  if (!base.includes("padding: calc(56px + var(--safe-top)) 12px 0;")) errors.push("phone top offset changed");
  if (!base.includes("max-height: min(46dvh, 360px);")) errors.push("phone max-height changed");
  if (!base.includes("pointer-events: none;")) errors.push("scrim pointer-events changed");
  if (!base.includes("pointer-events: auto;")) errors.push("panel pointer-events changed");
  if (!base.includes("position: sticky;")) errors.push("phone sticky footer removed");
  if (!zoom.includes("display: flex;")) errors.push("desktop panel is not a flex column");
  if (!zoom.includes("overflow: auto;")) errors.push("desktop field list does not scroll");
  if (!zoom.includes("position: static;")) errors.push("desktop actions still sticky over fields");
  if (zoom.includes("pointer-events")) errors.push("desktop query changed pointer-events");

  const phone = layout(PHONE.width, PHONE.height, false);
  if (PHONE.width >= 600) errors.push("390x844 matched the desktop query");
  if (Math.round(phone.panelH) !== 360) errors.push("390x844 panel is not the base 360px cap");

  for (const vp of VIEWPORTS) {
    const box = layout(vp.width, vp.height, true);
    for (const id of BUTTONS) {
      const btn = { x: Math.min(vp.width - 80, vp.width / 2), y: box.actionTop + 8, w: 72, h: 40 };
      if (!inside(btn, vp.width, vp.height)) errors.push(vp.name + " " + id + " outside viewport");
      const hit = elementFromPoint(btn.x + 8, btn.y + 8, vp.width, vp.height, true);
      if (hit !== "#tutorial-skip") errors.push(vp.name + " " + id + " covered by " + hit);
    }
    const fieldHit = elementFromPoint(vp.width / 2, box.fieldTop + 8, vp.width, vp.height, true);
    if (fieldHit === "#tutorial-skip" || fieldHit === "#status") errors.push(vp.name + " field covered by " + fieldHit);
  }
  return errors;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const errors = sunPlayerflowTutorialZoomChecks();
  if (errors.length) {
    console.error("FAIL sun-playerflow-tutorial-zoom", errors);
    process.exit(1);
  }
  console.log("PASS sun-playerflow-tutorial-zoom 5 viewports x 2 buttons visible-and-unobstructed + phone unchanged");
}
