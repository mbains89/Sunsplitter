import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { playtestMobileReadFollow02Checks } from "./playtest-mobile-read-follow-02-checks.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// SUN-PLAYTEST-MOBILE-READ-RECONFIRM-01 — after PR201. Reconfirm follow-02 +
// resume-meta token + official opening lines. No CSS remint.
export function playtestMobileReadReconfirm01Checks() {
  const errors = [...playtestMobileReadFollow02Checks()];
  const note = resolve(ROOT, "docs/SUN_PLAYTEST_MOBILE_READ_RECONFIRM_01.md");
  if (!existsSync(note)) errors.push("mobile-read reconfirm note missing");
  const version = readFileSync(resolve(ROOT, "VERSION.md"), "utf8");
  if (!version.startsWith("0.33\n")) errors.push("VERSION.md first line is not 0.33");
  const html = readFileSync(resolve(ROOT, "index.html"), "utf8");
  if (!html.includes('class="resume-meta')) errors.push("resume-meta class token missing");
  if (!html.includes(">v0.33</div>")) errors.push("title subtitle lost v0.33");
  if (!html.includes("Earth failed in a cascade measured in hours.")) {
    errors.push("opening intro-line-1 is not the official account");
  }
  const css = readFileSync(resolve(ROOT, "css/title-start.css"), "utf8");
  if (!css.includes("#title-screen .resume-meta")) errors.push("resume-meta hull color rule missing");
  return errors;
}
