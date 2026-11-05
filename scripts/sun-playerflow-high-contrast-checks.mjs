// SUN-036-HIGH-CONTRAST-01 — forced-colors keeps selected, open, pressed, disabled, and focus distinct.
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { pcViewportChecks } from "./pc-viewport-checks.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SYSTEM = ["Highlight", "HighlightText", "CanvasText", "GrayText", "ButtonText"];

function forcedBlock(css) {
  const marker = "@media (forced-colors: active)";
  const start = css.indexOf(marker);
  if (start < 0) return null;
  const open = css.indexOf("{", start);
  if (open < 0) return null;
  let depth = 0;
  for (let i = open; i < css.length; i++) {
    if (css[i] === "{") depth++;
    else if (css[i] === "}") {
      depth--;
      if (depth === 0) return css.slice(open + 1, i);
    }
  }
  return null;
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

function ruleFor(parsed, needle) {
  return parsed.find(rule => rule.selector.includes(needle)) || null;
}

export function sunPlayerflowHighContrastChecks() {
  const errors = [];
  const css = readFileSync(resolve(ROOT, "css/pc-viewport.css"), "utf8");
  const block = forcedBlock(css);
  const parsed = block ? rules(block) : [];
  const cases = [
    {
      name: "selected crew chip",
      ok: () => {
        const selected = ruleFor(parsed, ".crew-chip.selected");
        const pressed = ruleFor(parsed, '.crew-chip[aria-pressed="true"]');
        return selected && pressed && selected === pressed && SYSTEM.some(colour => selected.body.includes(colour));
      }
    },
    {
      name: "crew panel open",
      ok: () => {
        const rule = ruleFor(parsed, '#btn-crew[aria-expanded="true"]');
        return rule && SYSTEM.some(colour => rule.body.includes(colour));
      }
    },
    {
      name: "intro pause pressed",
      ok: () => {
        const rule = ruleFor(parsed, '#cinematic-pause[aria-pressed="true"]');
        return rule && rule.body.includes("Highlight") && (rule.body.includes("underline") || rule.body.includes("outline"));
      }
    },
    {
      name: "disabled choice",
      ok: () => {
        const disabled = ruleFor(parsed, ".choice-btn:disabled");
        const classed = ruleFor(parsed, ".choice-btn.disabled");
        return disabled && classed && disabled === classed && disabled.body.includes("GrayText") && disabled.body.includes("dashed");
      }
    },
    {
      name: "focus-visible",
      ok: () => {
        const rule = ruleFor(parsed, ":focus-visible");
        return rule && rule.body.includes("Highlight") && /outline:\s*3px/.test(rule.body);
      }
    }
  ];
  if (!block) {
    errors.push("forced-colors block missing");
    return errors;
  }
  cases.forEach((item, index) => {
    if (!item.ok()) errors.push(`case ${index + 1}/5 failed: ${item.name}`);
  });
  for (const needle of pcViewportChecks(ROOT)) errors.push(`pc-viewport needle: ${needle}`);
  return errors;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const errors = sunPlayerflowHighContrastChecks();
  if (errors.length) {
    console.error("FAIL sun-playerflow-high-contrast", errors);
    process.exit(1);
  }
  console.log("PASS sun-playerflow-high-contrast 5/5 (forced-colors block; selected chip, crew open, pause pressed, disabled choice, focus-visible; pc-viewport needles hold)");
}
