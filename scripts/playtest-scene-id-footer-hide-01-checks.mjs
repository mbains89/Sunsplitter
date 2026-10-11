import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// SUN-SCENE-ID-FOOTER-HIDE-01 — hide raw #scene-id from sighted players
// on viewports >360px. Phone ≤360 already display:none. Keep aria-hidden.
export function playtestSceneIdFooterHide01Checks() {
  const errors = [];
  const html = readFileSync(resolve(ROOT, "index.html"), "utf8");
  const css = readFileSync(resolve(ROOT, "css/style.css"), "utf8");

  if (!html.includes('id="scene-id" aria-hidden="true"')) {
    errors.push('index.html lost id="scene-id" aria-hidden="true"');
  }

  const base = css.match(/#scene-id\s*\{[^}]*\}/);
  if (!base) {
    errors.push("style.css missing base #scene-id rule");
  } else if (!/display:\s*none/.test(base[0])) {
    errors.push("base #scene-id visible to sighted players (missing display: none)");
  }

  if (!css.includes("@media (max-width: 360px)")) {
    errors.push("style.css lost @media (max-width: 360px) compact phone footer");
  } else {
    const idx = css.indexOf("@media (max-width: 360px)");
    const phone = css.slice(idx, idx + 500);
    if (!/#scene-id\s*\{[^}]*display:\s*none/.test(phone)) {
      errors.push("360px footer lost #scene-id { display: none }");
    }
  }

  return errors;
}
