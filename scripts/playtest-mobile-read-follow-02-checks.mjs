import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// SUN-PLAYTEST-MOBILE-READ-FOLLOW-02 — residual title/body mobile readability
// after TITLE-BODY-FOLLOW PR194 @ f804dcce. Tip already paints every title-screen
// text node that sits on the rotating hull. This file is the ALREADY_SATISFIED
// proof. No css/title-start.css mutation.
export function playtestMobileReadFollow02Checks() {
  const errors = [];
  const html = readFileSync(resolve(ROOT, "index.html"), "utf8");
  const startCss = readFileSync(resolve(ROOT, "css/title-start.css"), "utf8");

  const requiredMarkup = [
    'class="game-title"',
    'class="game-subtitle"',
    'class="prologue"',
    'class="title-contract"',
    'class="resume-meta"',
    'id="title-save-status"',
    'id="new-run-confirm-copy"'
  ];
  for (const token of requiredMarkup) {
    if (!html.includes(token)) errors.push(`title-screen markup missing ${token}`);
  }

  const requiredCss = [
    "#title-screen .game-title",
    "#f2f3f5",
    "#title-screen .game-subtitle",
    "#title-screen .prologue",
    "#title-screen .resume-meta",
    "#title-screen .title-contract",
    "#title-screen .title-save-status",
    "#title-screen #new-run-confirm-copy",
    "color: var(--text)",
    "text-shadow",
    "#title-ship-image",
    "180s",
    "min-height: 0",
    "justify-content: flex-start"
  ];
  for (const token of requiredCss) {
    if (!startCss.includes(token)) errors.push(`title-start.css lost ${token}`);
  }

  if (startCss.includes("100dvh - 100px") || startCss.includes("100vh - 100px")) {
    errors.push("title-start.css reintroduced a near-viewport min-height band");
  }
  if (!startCss.includes("0.42")) {
    errors.push("title-start.css changed the hull overlay stop");
  }

  return errors;
}
