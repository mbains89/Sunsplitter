import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { readEngineSource } from "./simulate.mjs";

export function pcViewportChecks(root) {
  const errors = [];
  const css = readFileSync(resolve(root, "css/pc-viewport.css"), "utf8");
  const index = readFileSync(resolve(root, "index.html"), "utf8");
  const style = readFileSync(resolve(root, "css/style.css"), "utf8");
  const engine = readEngineSource(root);
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
  errors.push(...tabletPlateNoCropErrors(css, style));
  return errors;
}

// Evaluates a CSS length expression at a viewport height. % terms resolve against the column;
// they are treated as non-binding (largest width), which is the conservative case for cropping.
function evaluateLength(expr, vh) {
  return Function(`return ${expr
    .replace(/min\(/g, "Math.min(")
    .replace(/calc\(/g, "(")
    .replace(/(\d+(?:\.\d+)?)d?vh/g, `($1*${vh}/100)`)
    .replace(/(\d+(?:\.\d+)?)px/g, "$1")
    .replace(/(\d+(?:\.\d+)?)%/g, "Infinity")};`)();
}

function mediaMatches(query, w, h) {
  for (const [, side, axis, px] of query.matchAll(/\((min|max)-(width|height):\s*(\d+)px\)/g)) {
    const v = axis === "width" ? w : h;
    if (side === "min" ? v < Number(px) : v > Number(px)) return false;
  }
  return true;
}

// SUN-TABLET-PLATE-CROP-01: under the 1024 grid and taller than 700px (tablet portrait) the plate
// box took the full 702px column under style.css's height cap, and cover cut ~39% of the 784×1168
// frame. The box must take the width the cap allows at the plate ratio, so its height is the cap
// (no crop, and #main does not move), and the image must letterbox, never cover-crop.
function tabletPlateNoCropErrors(css, style) {
  const errors = [];
  const tabletQuery = "@media (min-width: 481px) and (max-width: 1023px) and (min-height: 701px)";
  const shortQuery = "@media (min-width: 800px) and (max-width: 1023px) and (min-height: 701px) and (max-height: 760px)";
  const capQuery = "@media (min-width: 800px) and (max-width: 1023px) and (max-height: 760px)";
  const blockAt = query => {
    const start = css.indexOf(query);
    return start < 0 ? null : { start, text: css.slice(start, css.indexOf("\n}\n", start)) };
  };
  const tablet = blockAt(tabletQuery);
  const short = blockAt(shortQuery);
  const cap = blockAt(capQuery);
  if (!tablet) return ["tablet plate block missing: " + tabletQuery];
  if (!short) return ["900×720 plate block missing: " + shortQuery];
  if (!cap) return ["900×700 art cap block missing: " + capQuery];
  if (!(short.start > tablet.start)) errors.push("900×720 plate block must come after the tablet plate block so its width wins");
  // Value of prop in the rule (inside one @media block) whose selector list names selector.
  const decl = (text, selector, prop) => {
    const body = text.slice(text.indexOf("{") + 1).replace(/\/\*[\s\S]*?\*\//g, "");
    for (const [, selectors, declarations] of body.matchAll(/([^{}]+)\{([^}]*)\}/g)) {
      if (!selectors.split(",").map(s => s.trim()).includes(selector)) continue;
      const value = declarations.match(new RegExp(`(?:^|[;\\s])${prop}:\\s*([^;]+);`));
      if (value) return value[1].trim();
    }
    return null;
  };
  // Height caps the box lives under, read from where they are set.
  const baseCap = (style.match(/\n#scene-image-wrap\s*\{([^}]*)\}/) || [])[1]?.match(/max-height:\s*([^;]+);/)?.[1];
  const intimateCap = (style.match(/\n#scene-image-wrap\.intimate\s*\{([^}]*)\}/) || [])[1]?.match(/max-height:\s*([^;]+);/)?.[1];
  const shortCap = decl(cap.text, "#scene-image-wrap", "max-height");
  const widths = {
    base: decl(tablet.text, "#scene-image-wrap", "width"),
    intimate: decl(tablet.text, "#scene-image-wrap.intimate", "width"),
    short: decl(short.text, "#scene-image-wrap", "width"),
    shortIntimate: decl(short.text, "#scene-image-wrap.intimate", "width"),
  };
  if (!baseCap || !intimateCap || !shortCap) return ["tablet plate: style.css or 900×700 max-height cap not found"];
  for (const [k, v] of Object.entries(widths)) if (!v) errors.push(`tablet plate: no width for ${k}`);
  if (errors.length) return errors;
  const portrait = [[768, 1024], [820, 1180], [834, 1194], [768, 954], [744, 1133], [600, 960], [912, 1368], [1023, 1366], [481, 1000], [540, 720]];
  const shortSizes = [[900, 720], [1000, 750], [1023, 701], [800, 760]];
  for (const [w, h] of [...portrait, ...shortSizes]) {
    if (!mediaMatches(tabletQuery, w, h)) errors.push(`tablet plate: ${w}x${h} does not match ${tabletQuery}`);
    const inShort = mediaMatches(shortQuery, w, h);
    if (inShort !== shortSizes.some(([a, b]) => a === w && b === h)) errors.push(`tablet plate: ${w}x${h} ${inShort ? "should not" : "should"} match ${shortQuery}`);
    for (const intimate of [false, true]) {
      const width = evaluateLength(inShort ? (intimate ? widths.shortIntimate : widths.short) : (intimate ? widths.intimate : widths.base), h);
      const limit = evaluateLength(inShort ? shortCap : (intimate ? intimateCap : baseCap), h);
      const height = width * 1168 / 784;
      if (Math.abs(height - limit) > 0.5) errors.push(`tablet plate ${intimate ? "intimate " : ""}${w}x${h}: width ${width.toFixed(1)} gives height ${height.toFixed(1)}, cap is ${limit.toFixed(1)} (${height > limit ? "cropped" : "shorter than before, #main moves"})`);
    }
  }
  for (const [w, h] of [[360, 640], [390, 844], [480, 900], [844, 390], [900, 700], [1023, 700], [1024, 768], [1024, 1366], [1180, 820], [1280, 720], [1440, 900], [1920, 1080]]) {
    if (mediaMatches(tabletQuery, w, h)) errors.push(`tablet plate: ${w}x${h} must keep its layout but matches ${tabletQuery}`);
  }
  if (decl(tablet.text, "#scene-image-wrap.intimate #scene-image", "object-fit") !== "contain" || decl(tablet.text, "#scene-image", "object-fit") !== "contain") errors.push("tablet #scene-image is not object-fit: contain");
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
