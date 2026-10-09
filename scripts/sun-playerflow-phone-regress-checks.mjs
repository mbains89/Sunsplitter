// SUN-036-PHONE-REGRESS-HARNESS-01 — Phone Layout Still Holds.
// Pinned 390×844 checks. Auto-run by scripts/sun-playerflow-*-checks.mjs.
// Does not edit game code, product CSS, or workflows.
// brace match: real opening brace, not a backslash.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadGame } from "./simulate.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const BASE = "ea0f70c9c843c8eea976493e20f9b9e8ce797e9b";
const PHONE = { width: 390, height: 844 };
const DESKTOP_MIN = 600;

function headSha() {
  try {
    return execFileSync("git", ["rev-parse", "HEAD"], { cwd: ROOT, encoding: "utf8" }).trim();
  } catch {
    return BASE;
  }
}

function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, "");
}

function mediaBlocks(css) {
  const src = stripComments(css);
  const blocks = [];
  const re = /@media\s*([^{]+)\{/g;
  let match;
  while ((match = re.exec(src))) {
    const open = match.index + match[0].length - 1;
    let depth = 1;
    let i = open + 1;
    for (; i < src.length && depth; i++) {
      if (src[i] === "{") depth++;
      else if (src[i] === "}") depth--;
    }
    blocks.push({ query: match[1].trim(), body: src.slice(open + 1, i - 1) });
  }
  return blocks;
}

function outsideMedia(css) {
  const src = stripComments(css);
  let out = "";
  let i = 0;
  while (i < src.length) {
    const at = src.indexOf("@media", i);
    if (at < 0) {
      out += src.slice(i);
      break;
    }
    out += src.slice(i, at);
    const open = src.indexOf("{", at);
    if (open < 0) break;
    let depth = 1;
    let j = open + 1;
    for (; j < src.length && depth; j++) {
      if (src[j] === "{") depth++;
      else if (src[j] === "}") depth--;
    }
    i = j;
  }
  return out;
}

function minWidthPx(query) {
  const found = query.match(/min-width:\s*(\d+)px/);
  return found ? Number(found[1]) : null;
}

function queryMatches(query, width, height) {
  const parts = query.split(/\s+and\s+/i);
  let sawSize = false;
  for (const part of parts) {
    const minW = part.match(/min-width:\s*(\d+)px/);
    const maxW = part.match(/max-width:\s*(\d+)px/);
    const minH = part.match(/min-height:\s*(\d+)px/);
    const maxH = part.match(/max-height:\s*(\d+)px/);
    if (!minW && !maxW && !minH && !maxH) continue;
    sawSize = true;
    if (minW && width < Number(minW[1])) return false;
    if (maxW && width > Number(maxW[1])) return false;
    if (minH && height < Number(minH[1])) return false;
    if (maxH && height > Number(maxH[1])) return false;
  }
  return sawSize;
}

function choiceMinHeight(style, width, height) {
  const root = stripComments(style).match(/--touch:\s*(\d+)px/);
  const touch = root ? Number(root[1]) : 0;
  let px = 0;
  const unscoped = outsideMedia(style);
  const choice = unscoped.match(/\.choice-btn\s*\{[^}]*min-height:\s*([^;]+);/);
  if (choice) {
    const value = choice[1].trim();
    if (value === "var(--touch)") px = touch;
    else if (/^\d+px$/.test(value)) px = Number(value.replace("px", ""));
  }
  for (const block of mediaBlocks(style)) {
    if (!queryMatches(block.query, width, height)) continue;
    const override = block.body.match(/\.choice-btn\s*\{[^}]*min-height:\s*([^;]+);/);
    if (!override) continue;
    const value = override[1].trim();
    if (value === "var(--touch)") px = touch;
    else if (/^\d+px$/.test(value)) px = Number(value.replace("px", ""));
  }
  return px;
}

export function sunPlayerflowPhoneRegressChecks() {
  const errors = [];
  const notes = [];
  const style = readFileSync(resolve(ROOT, "css/style.css"), "utf8");
  const viewport = readFileSync(resolve(ROOT, "css/pc-viewport.css"), "utf8");

  const touchPx = choiceMinHeight(style, PHONE.width, PHONE.height);
  if (touchPx < 48) errors.push("choice --touch computed " + touchPx + "px < 48 at 390x844");
  else notes.push("touch " + touchPx + "px");

  if (!/--safe-top:\s*env\(safe-area-inset-top/.test(style)) errors.push("safe-area-inset-top missing");
  if (!/--safe-bottom:\s*env\(safe-area-inset-bottom/.test(style)) errors.push("safe-area-inset-bottom missing");
  if (!/padding-top:\s*var\(--safe-top\)/.test(style)) errors.push("body safe-top padding missing");
  if (!/padding-bottom:\s*var\(--safe-bottom\)/.test(style)) errors.push("body safe-bottom padding missing");
  else notes.push("safe-area padding");

  const desktopBlocks = mediaBlocks(viewport).filter(block => {
    const minW = minWidthPx(block.query);
    return minW !== null && minW >= DESKTOP_MIN;
  });
  if (!desktopBlocks.length) errors.push("pc-viewport.css lost min-width>=600 desktop blocks");
  for (const block of desktopBlocks) {
    if (queryMatches(block.query, PHONE.width, PHONE.height)) {
      errors.push("desktop media winning at 390: " + block.query);
    }
  }
  const unscopedViewport = outsideMedia(viewport);
  if (/max-height:\s*min\(52dvh,\s*360px\)/.test(unscopedViewport)) {
    errors.push("short-desktop art cap leaked outside min-width>=600");
  }
  if (/grid-template-columns:\s*minmax\(320px,\s*0\.85fr\)/.test(outsideMedia(style))) {
    errors.push("desktop grid leaked outside min-width>=600");
  }
  const gridBlock = mediaBlocks(style).find(block => block.body.includes("minmax(320px, 0.85fr)"));
  if (!gridBlock || queryMatches(gridBlock.query, PHONE.width, PHONE.height)) {
    errors.push("desktop composition grid winning under 480px");
  } else notes.push("desktop rules not winning");

  const short = mediaBlocks(style).find(block => /max-width:\s*480px/.test(block.query) && /max-height:\s*700px/.test(block.query));
  if (!short || !/max-height:\s*min\(48dvh,\s*320px\)/.test(short.body)) {
    errors.push("short-phone art/choice split missing");
  } else if (queryMatches(short.query, PHONE.width, PHONE.height)) {
    errors.push("short-phone split unexpectedly matches 390x844");
  } else notes.push("short-phone split held");

  const runtime = loadGame(ROOT);
  const played = runtime.evaluate(`(() => {
    window.innerWidth = 390;
    window.innerHeight = 844;
    localStorage.clear();
    resetRunState();
    showTitleScreen();
    const title = document.getElementById("title-screen");
    const begin = document.getElementById("btn-begin");
    const started = startGame() || (typeof advancePastCommanderCreate === "function" && advancePastCommanderCreate());
    if (!started) return { ok: false, reason: "startGame did not start" };
    if (typeof finishCinematic === "function" && currentCinematic) finishCinematic();
    const buttons = gameplayChoiceButtons().filter(btn => !btn.disabled && String(btn.className || "").includes("choice-btn"));
    return {
      ok: buttons.length >= 1 && !!title && !!begin,
      count: buttons.length,
      scene: state.scene,
      width: window.innerWidth,
      height: window.innerHeight,
      titlePresent: !!title,
      beginPresent: !!begin
    };
  })()`);
  if (!played || played.ok !== true || played.width !== 390 || played.height !== 844) {
    errors.push("no enabled choice after intro at 390x844: " + JSON.stringify(played));
  } else notes.push("choices " + played.count + " on " + played.scene);

  return { errors, notes, played };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const { errors, notes } = sunPlayerflowPhoneRegressChecks();
  const sha = headSha();
  if (errors.length) {
    console.error("FAIL sun-playerflow-phone-regress tip " + BASE + " head " + sha, errors);
    process.exit(1);
  }
  console.log("PASS sun-playerflow-phone-regress 5/5 at 390x844 (head " + sha + "; " + notes.join("; ") + ")");
}
