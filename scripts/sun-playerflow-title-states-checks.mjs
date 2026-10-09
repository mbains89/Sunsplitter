// SUN-036-TITLE-STATES-01 — title buttons answer the mouse.
// Hover, focus-visible, and pressed differ pairwise (non-colour cue + colour)
// at desktop widths. Phone 390px computed bag stays the style.css BASE.
// Node has no CSSOM (simulate.mjs is a vm stub), so this check cascades the
// stylesheets itself. Does not edit the workflow; the playerflow glob runs it.
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const BUTTONS = [
  { id: "btn-begin", primary: true, containers: [".title-actions"] },
  { id: "btn-resume", primary: true, containers: [".title-actions"] },
  { id: "btn-import-save", primary: false, containers: [".title-actions", ".save-transfer-actions"] },
  { id: "btn-export-save", primary: false, containers: [".title-actions", ".save-transfer-actions"] },
  { id: "btn-content-notice", primary: false, containers: [".title-actions", ".content-notice-actions"] },
  { id: "new-run-ok", primary: true, containers: [".title-actions", "#new-run-confirm"] },
  { id: "new-run-cancel", primary: false, containers: [".title-actions", "#new-run-confirm"] },
  { id: "commander-create-ok", primary: true, containers: [".title-actions", "#commander-create"] },
  { id: "commander-create-cancel", primary: false, containers: [".title-actions", "#commander-create"] }
];

const TRACKED = [
  "border-style", "border-color", "border-width", "outline", "outline-offset",
  "box-shadow", "text-decoration", "color", "background-color", "background", "min-height"
];
const NON_COLOUR = ["border-style", "outline", "outline-offset", "box-shadow", "text-decoration", "border-width"];
const COLOUR = ["border-color", "color", "background-color", "background"];

function stripComments(css) { return css.replace(/\/\*[\s\S]*?\*\//g, ""); }

function splitTop(css) {
  const parts = [];
  let i = 0;
  while (i < css.length) {
    while (i < css.length && /\s/.test(css[i])) i++;
    if (i >= css.length) break;
    if (css.startsWith("@media", i)) {
      const open = css.indexOf("{", i);
      const prelude = css.slice(i, open).trim();
      let depth = 0;
      let j = open;
      for (; j < css.length; j++) {
        if (css[j] === "{") depth++;
        else if (css[j] === "}") { depth--; if (depth === 0) { j++; break; } }
      }
      parts.push({ kind: "media", prelude, body: css.slice(open + 1, j - 1) });
      i = j;
      continue;
    }
    if (css[i] === "@") {
      const end = css.indexOf(";", i);
      i = end < 0 ? css.length : end + 1;
      continue;
    }
    const open = css.indexOf("{", i);
    if (open < 0) break;
    const selector = css.slice(i, open).trim();
    let depth = 0;
    let j = open;
    for (; j < css.length; j++) {
      if (css[j] === "{") depth++;
      else if (css[j] === "}") { depth--; if (depth === 0) { j++; break; } }
    }
    parts.push({ kind: "rule", selector, body: css.slice(open + 1, j - 1) });
    i = j;
  }
  return parts;
}

function decls(body) {
  const out = {};
  for (const chunk of body.split(";")) {
    const idx = chunk.indexOf(":");
    if (idx < 0) continue;
    const prop = chunk.slice(0, idx).trim().toLowerCase();
    const value = chunk.slice(idx + 1).trim().replace(/\s+/g, " ");
    if (!prop || !value || prop.startsWith("--")) continue;
    out[prop] = value;
  }
  return out;
}

function mediaMatches(prelude, width) {
  const text = prelude.replace(/@media/g, "");
  const parts = text.split(",").map(part => part.trim()).filter(Boolean);
  return parts.some(part => {
    if (part.includes("forced-colors") || part.includes("prefers-reduced-motion")) return false;
    let min = 0;
    let max = Infinity;
    const minMatch = part.match(/min-width:\s*(\d+)px/);
    const maxMatch = part.match(/max-width:\s*(\d+)px/);
    if (minMatch) min = Number(minMatch[1]);
    if (maxMatch) max = Number(maxMatch[1]);
    if (!minMatch && !maxMatch) return true;
    return width >= min && width <= max;
  });
}

function collect(css, width) {
  const rules = [];
  for (const part of splitTop(stripComments(css))) {
    if (part.kind === "rule") rules.push(part);
    else if (part.kind === "media" && mediaMatches(part.prelude, width)) {
      for (const inner of splitTop(part.body)) if (inner.kind === "rule") rules.push(inner);
    }
  }
  return rules;
}

function selectorApplies(selector, button, pseudo) {
  const one = selector.trim();
  if (!one || one.startsWith("@")) return false;
  const pseudoMatch = one.match(/:(hover|focus-visible|active|focus)\b/);
  const got = pseudoMatch ? pseudoMatch[1] : "";
  if (got !== pseudo) return false;
  if (one.includes(".btn-primary") && !button.primary) return false;
  if (one.includes("#btn-begin") && button.id !== "btn-begin") return false;
  if (one.includes("#btn-resume") && button.id !== "btn-resume") return false;
  const idHit = one.match(/#([a-z0-9-]+)/gi) || [];
  for (const raw of idHit) {
    const id = raw.slice(1);
    if (id === "title-screen") continue;
    if (id === button.id) continue;
    const containerIds = button.containers.filter(item => item.startsWith("#")).map(item => item.slice(1));
    if (!containerIds.includes(id)) return false;
  }
  const classes = one.match(/\.([a-z0-9_-]+)/gi) || [];
  for (const raw of classes) {
    const name = raw.slice(1);
    if (name === "btn" || name === "btn-primary") continue;
    const containerClasses = button.containers.filter(item => item.startsWith(".")).map(item => item.slice(1));
    if (!containerClasses.includes(name)) return false;
  }
  return one.includes(".btn") || one.includes("#" + button.id);
}

function resolveVars(value, vars) {
  return value.replace(/var\(\s*(--[a-z0-9-]+)\s*(?:,\s*([^)]+))?\)/gi, (_, name, fallback) => vars[name] || (fallback || "").trim() || _);
}

function rootVars(css) {
  const vars = {};
  const match = stripComments(css).match(/:root\s*\{([^}]*)\}/);
  if (!match) return vars;
  for (const [prop, value] of Object.entries(decls(match[1]))) if (prop.startsWith("--")) vars[prop] = value;
  return vars;
}

function cascade(stylesheets, button, pseudo, width) {
  const bag = {};
  for (const sheet of stylesheets) {
    for (const rule of collect(sheet.css, width)) {
      if (!rule.selector.split(",").some(selector => selectorApplies(selector, button, pseudo))) continue;
      for (const [prop, value] of Object.entries(decls(rule.body))) {
        if (!TRACKED.includes(prop)) continue;
        bag[prop] = resolveVars(value, sheet.vars);
      }
    }
  }
  if (bag.background && !bag["background-color"]) bag["background-color"] = bag.background.split(" ")[0];
  return bag;
}

function differs(left, right, keys) {
  return keys.some(key => (left[key] || "") !== (right[key] || ""));
}

export function sunPlayerflowTitleStatesChecks() {
  const errors = [];
  const styleCss = readFileSync(resolve(ROOT, "css/style.css"), "utf8");
  const titleCss = readFileSync(resolve(ROOT, "css/title-start.css"), "utf8");
  const vars = { ...rootVars(styleCss), ...rootVars(titleCss) };
  const both = [{ css: styleCss, vars }, { css: titleCss, vars }];
  const baseOnly = [{ css: styleCss, vars }];
  if (!titleCss.includes("SUN-036-TITLE-STATES-01")) errors.push("ticket marker missing from title-start.css");
  if (!/@media\s*\(\s*min-width:\s*481px\s*\)/.test(titleCss)) errors.push("desktop gate missing");
  const ticketSlice = titleCss.slice(titleCss.indexOf("SUN-036-TITLE-STATES-01"));
  if (/@media[^{]*max-width:\s*480px/.test(ticketSlice)) errors.push("ticket block must not add a 480px rule");
  if (/(?:^|[{};])\s*(?:transition|transform)\s*:/.test(ticketSlice)) errors.push("ticket block must not add transition or transform");
  let pairwise = 0;
  for (const button of BUTTONS) {
    const hover = cascade(both, button, "hover", 1280);
    const focus = cascade(both, button, "focus-visible", 1280);
    const active = cascade(both, button, "active", 1280);
    for (const [aName, aBag, bName, bBag] of [["hover", hover, "focus-visible", focus], ["hover", hover, "active", active], ["focus-visible", focus, "active", active]]) {
      const nonColour = differs(aBag, bBag, NON_COLOUR);
      const colour = differs(aBag, bBag, COLOUR);
      if (!nonColour || !colour) errors.push(button.id + " " + aName + " vs " + bName + " not distinct (non-colour=" + nonColour + " colour=" + colour + ")");
      else pairwise++;
    }
    for (const pseudo of ["", "hover", "focus-visible", "active"]) {
      const phone = cascade(both, button, pseudo, 390);
      const base = cascade(baseOnly, button, pseudo, 390);
      for (const key of new Set([...Object.keys(phone), ...Object.keys(base)])) {
        if ((phone[key] || "") !== (base[key] || "")) errors.push(button.id + " " + (pseudo || "rest") + " @390 " + key + " changed from BASE");
      }
    }
  }
  if (BUTTONS.length < 9) errors.push("expected at least 9 title buttons");
  if (pairwise < BUTTONS.length * 3) errors.push("pairwise " + pairwise + " < " + (BUTTONS.length * 3));
  return errors;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const errors = sunPlayerflowTitleStatesChecks();
  if (errors.length) {
    console.error("FAIL sun-playerflow-title-states", errors);
    process.exit(1);
  }
  console.log("PASS sun-playerflow-title-states 9 buttons x 3 pairwise (hover/focus-visible/active differ on a non-colour cue and a colour) + phone 390px unchanged from style.css BASE");
}
