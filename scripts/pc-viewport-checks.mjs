import { readFileSync } from "node:fs";
import { resolve } from "node:path";

export function pcViewportChecks(root) {
  const errors = [];
  const css = readFileSync(resolve(root, "css/pc-viewport.css"), "utf8");
  const index = readFileSync(resolve(root, "index.html"), "utf8");
  const style = readFileSync(resolve(root, "css/style.css"), "utf8");
  const engine = readFileSync(resolve(root, "src/engine.js"), "utf8");
  if (!index.includes('href="css/pc-viewport.css"')) errors.push("index missing viewport sheet");
  if (!css.includes("@media (min-width: 1024px) and (max-height: 800px)")) errors.push("short desktop query missing");
  if (!css.includes("max-height: min(52dvh, 360px)")) errors.push("art cap missing");
  if (!css.includes("#choices")) errors.push("choices sticky target missing");
  if (!css.includes("overflow-x: clip")) errors.push("zoom clip missing");
  if (!css.includes(":fullscreen #app")) errors.push("fullscreen rule missing");
  if (!style.includes("--touch: 48px")) errors.push("phone touch needle missing");
  if (!style.includes("@media (max-width: 360px)")) errors.push("360px needle missing");
  if (!style.includes("48dvh")) errors.push("48dvh needle missing");
  if (!style.includes("grid-template-columns: minmax(320px, 0.85fr) minmax(0, 1.15fr)")) errors.push("desktop composition needle missing");
  if (/addEventListener\(\s*["']resize["']/.test(engine)) errors.push("engine resize listener would re-render");
  errors.push(...shortDesktopPlateNoCropErrors(css));
  return errors;
}

// SUN-REVIEW T3-1: plates may shrink, never crop. Under the short-desktop cap the
// 784×1168 plate's width-driven height must fit max-height, and the image must not cover-crop.
function shortDesktopPlateNoCropErrors(css) {
  const errors = [];
  const query = "@media (min-width: 1024px) and (max-height: 800px)";
  const start = css.indexOf(query);
  if (start < 0) return errors;
  const block = css.slice(start, css.indexOf("\n}\n", start));
  const wrapRule = block.match(/#scene-image-wrap\.intimate\.minimized\s*\{([^}]*)\}/);
  const width = wrapRule && wrapRule[1].match(/\bwidth:\s*([^;]+);/);
  const maxHeight = wrapRule && wrapRule[1].match(/max-height:\s*([^;]+);/);
  if (!width || !maxHeight) return ["short-desktop plate width/max-height not found"];
  // % terms resolve against the grid column; treat as non-binding (largest width) to stay conservative.
  const evaluate = (expr, vh) => Function(`return ${expr
    .replace(/min\(/g, "Math.min(")
    .replace(/calc\(/g, "(")
    .replace(/(\d+(?:\.\d+)?)dvh/g, `($1*${vh}/100)`)
    .replace(/(\d+(?:\.\d+)?)px/g, "$1")
    .replace(/(\d+(?:\.\d+)?)%/g, "Infinity")};`)();
  for (const [vw, vh] of [[1024, 640], [1280, 720], [1366, 768], [1440, 800], [1920, 800]]) {
    const w = evaluate(width[1], vh);
    const h = evaluate(maxHeight[1], vh);
    const needed = w * 1168 / 784;
    if (needed > h + 0.5) errors.push(`plate cropped ${(needed - h).toFixed(1)}px at ${vw}×${vh} (width ${w.toFixed(1)} needs ${needed.toFixed(1)} > max-height ${h.toFixed(1)})`);
  }
  const imageRule = block.match(/#scene-image(?:,[^{]*)?\s*\{([^}]*)\}/);
  if (!imageRule || !/object-fit:\s*contain/.test(imageRule[1])) errors.push("short-desktop #scene-image is not object-fit: contain");
  return errors;
}
