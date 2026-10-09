// SUN-036-PHONE-REGRESS-HARNESS-01 — 390×844 phone layout must not regress.
// Checks/scripts only. Does not edit game code, product CSS, or workflows.
// simulate.loadGame has no layout engine, so "--touch computed" is the cascade
// that wins at 390×844 (root + media queries that match that viewport).
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadGame } from "./simulate.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PHONE = { width: 390, height: 844 };
const BASE = "ea0f70c9c843c8eea976493e20f9b9e8ce797e9b";

function headSha() {
  try {
    return execFileSync("git", ["rev-parse", "HEAD"], { cwd: ROOT, encoding: "utf8" }).trim();
  } catch (e) {
    return BASE;
  }
}

function splitTop(input, sep) {
  const parts = [];
  let depth = 0;
  let buf = "";
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (ch === "(") depth++;
    else if (ch === ")") depth = Math.max(0, depth - 1);
    if (depth === 0 && input.slice(i, i + sep.length) === sep) {
      parts.push(buf);
      buf = "";
      i += sep.length - 1;
      continue;
    }
    buf += ch;
  }
  parts.push(buf);
  return parts;
}

function featureMatches(feature, w, h) {
  const text = feature.trim().replace(/^\(|\)$/g, "").trim();
  if (!text || text === "all" || text === "screen") return true;
  let m = text.match(/^(min|max)-width:\s*(\d+)px$/);
  if (m) return m[1] === "min" ? w >= Number(m[2]) : w <= Number(m[2]);
  m = text.match(/^(min|max)-height:\s*(\d+)px$/);
  if (m) return m[1] === "min" ? h >= Number(m[2]) : h <= Number(m[2]);
  if (/^(min|max)-(width|height):/.test(text)) return false;
  return true;
}

function queryMatches(query, w, h) {
  const q = String(query || "").replace(/^@media\s*/i, "").trim();
  if (!q) return true;
  return splitTop(q, ",").some((orPart) => {
    const ands = splitTop(orPart, "and").map((p) => p.trim()).filter(Boolean);
    return ands.every((feature) => featureMatches(feature, w, h));
  });
}

function mediaBlocks(css) {
  const blocks = [];
  const re = /@media\s*([^{]+)\{/g;
  let m;
  while ((m = re.exec(css))) {
    const start = m.index + m[0].length;
    let depth = 1;
    let i = start;
    while (i < css.length && depth) {
      if (css[i] === "{") depth++;
      else if (css[i] === "}") depth--;
      i++;
    }
    blocks.push({ query: m[1].trim(), body: css.slice(start, i - 1), index: m.index });
  }
  return blocks;
}

function minWidthFloor(query) {
  const floors = [];
  for (const m of String(query).matchAll(/min-width:\s*(\d+)px/g)) floors.push(Number(m[1]));
  return floors.length ? Math.max(...floors) : 0;
}

function declarations(block) {
  const out = [];
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let m;
  while ((m = re.exec(block))) out.push({ selector: m[1].trim(), body: m[2] });
  return out;
}

function touchPx(style, w, h) {
  let value = null;
  const root = style.match(/:root\s*\{([^}]*)\}/);
  if (root) {
    const hit = root[1].match(/--touch:\s*(\d+)px/);
    if (hit) value = Number(hit[1]);
  }
  for (const block of mediaBlocks(style)) {
    if (!queryMatches(block.query, w, h)) continue;
    for (const decl of declarations(block.body)) {
      if (!/:root|html|body/.test(decl.selector)) continue;
      const hit = decl.body.match(/--touch:\s*(\d+)px/);
      if (hit) value = Number(hit[1]);
    }
  }
  return value;
}

function choiceMinHeight(style, w, h) {
  let value = null;
  const base = style.match(/\.choice-btn\s*\{([^}]*)\}/);
  if (base) {
    const hit = base[1].match(/min-height:\s*([^;]+)/);
    if (hit) value = hit[1].trim();
  }
  for (const block of mediaBlocks(style)) {
    if (!queryMatches(block.query, w, h)) continue;
    for (const decl of declarations(block.body)) {
      if (!decl.selector.includes(".choice-btn")) continue;
      const hit = decl.body.match(/min-height:\s*([^;]+)/);
      if (hit) value = hit[1].trim();
    }
  }
  return value;
}

export function sunPlayerflowPhoneRegressChecks() {
  const errors = [];
  const assertions = [];
  const style = readFileSync(resolve(ROOT, "css/style.css"), "utf8");
  const viewport = readFileSync(resolve(ROOT, "css/pc-viewport.css"), "utf8");
  const index = readFileSync(resolve(ROOT, "index.html"), "utf8");

  const runtime = loadGame(ROOT);
  const played = runtime.evaluate(`(() => {
    localStorage.clear();
    resetRunState();
    showTitleScreen();
    const started = startGame() || (typeof advancePastCommanderCreate === "function" && advancePastCommanderCreate());
    if (!started) return { ok: false, reason: "startGame did not start" };
    if (typeof finishCinematic === "function" && currentCinematic) finishCinematic();
    const buttons = gameplayChoiceButtons().filter(btn => !btn.disabled && String(btn.className || "").includes("choice-btn"));
    return { ok: buttons.length >= 1, count: buttons.length, scene: state.scene, width: ${PHONE.width}, height: ${PHONE.height} };
  })()`);
  if (!played || played.ok !== true) errors.push("390x844 no enabled choice after intro: " + JSON.stringify(played));
  else assertions.push("enabled-choice>=" + played.count + "@" + PHONE.width + "x" + PHONE.height);

  const touch = touchPx(style, PHONE.width, PHONE.height);
  const minH = choiceMinHeight(style, PHONE.width, PHONE.height);
  if (touch == null || touch < 48) errors.push("--touch computed " + touch + "px at 390x844 (need >=48)");
  else assertions.push("--touch-computed=" + touch + "px");
  if (!minH || !(/var\(--touch\)/.test(minH) || (parseFloat(minH) >= 48 && /px/.test(minH)))) {
    errors.push("choice min-height at 390x844 is not >=48: " + minH);
  } else assertions.push("choice-min-height=" + minH);

  const safeNeedles = [
    "env(safe-area-inset-bottom",
    "env(safe-area-inset-top",
    "--safe-bottom:",
    "padding-bottom: var(--safe-bottom)",
    "padding-top: var(--safe-top)"
  ];
  for (const needle of safeNeedles) {
    if (!style.includes(needle)) errors.push("safe-area needle missing: " + needle);
  }
  if (!index.includes("viewport-fit=cover")) errors.push("viewport-fit=cover missing");
  if (!errors.some((e) => e.startsWith("safe-area") || e.startsWith("viewport-fit"))) {
    assertions.push("safe-area+viewport-fit");
  }

  const desktopOnly = mediaBlocks(viewport).filter((b) => minWidthFloor(b.query) >= 600);
  if (!desktopOnly.length) errors.push("pc-viewport.css lost its min-width>=600 desktop queries");
  for (const block of desktopOnly) {
    if (queryMatches(block.query, PHONE.width, PHONE.height)) {
      errors.push("desktop-only query wins at 390: " + block.query);
    }
  }
  const unscoped = viewport.split(/@media\s*[^{]+\{/)[0];
  if (/max-height:\s*min\(52dvh/.test(unscoped) || /#scene-image-wrap[^{]*\{[^}]*max-height/.test(unscoped)) {
    errors.push("pc-viewport unscoped art cap would win under 480px");
  }
  if (!errors.some((e) => e.includes("pc-viewport") || e.includes("desktop-only"))) {
    assertions.push("pc-viewport-minwidth>=600-not-at-390 (" + desktopOnly.length + " queries)");
  }

  const short = mediaBlocks(style).find((b) => queryMatches(b.query, 390, 700) && !queryMatches(b.query, 390, 844) && b.body.includes("48dvh"));
  if (!short) errors.push("short-phone art/choice split (480px and max-height 700px, 48dvh) missing");
  else if (queryMatches(short.query, PHONE.width, PHONE.height)) errors.push("short-phone query incorrectly matches 390x844");
  else assertions.push("short-phone-48dvh-split");

  const phoneArt = mediaBlocks(style).find((b) => queryMatches(b.query, PHONE.width, PHONE.height) && b.body.includes("#scene-image-wrap") && /max-height:\s*min\(/.test(b.body));
  if (!phoneArt) errors.push("390x844 phone art cap missing");
  else assertions.push("phone-art-cap@" + PHONE.width + "x" + PHONE.height);

  return { errors, assertions };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const { errors, assertions } = sunPlayerflowPhoneRegressChecks();
  const sha = headSha();
  if (errors.length) {
    console.error("FAIL sun-playerflow-phone-regress base " + BASE + " head " + sha, errors);
    process.exit(1);
  }
  console.log("PASS sun-playerflow-phone-regress (" + assertions.length + " assertions @ " + PHONE.width + "x" + PHONE.height + "; head " + sha + "; " + assertions.join("; ") + ")");
}
