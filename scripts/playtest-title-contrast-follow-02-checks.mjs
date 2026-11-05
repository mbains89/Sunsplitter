import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { playtestMobileReadFollow02Checks } from "./playtest-mobile-read-follow-02-checks.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// SUN-PLAYTEST-TITLE-CONTRAST-FOLLOW-02 — after PR203. Static reconfirm only.
export function playtestTitleContrastFollow02Checks() {
  const errors = [...playtestMobileReadFollow02Checks()];
  const note = resolve(ROOT, "docs/SUN_PLAYTEST_TITLE_CONTRAST_FOLLOW_02.md");
  if (!existsSync(note)) errors.push("title-contrast follow-02 note missing");
  const css = readFileSync(resolve(ROOT, "css/title-start.css"), "utf8");
  for (const token of [
    "#title-screen .prologue",
    "#title-screen .game-subtitle",
    "#title-screen .resume-meta",
    "#title-screen .title-contract",
    "color: var(--text)",
    "text-shadow",
    "#f0a0a0",
    "#f2f3f5"
  ]) {
    if (!css.includes(token)) errors.push("title-start.css lost contrast token " + token);
  }
  return errors;
}
