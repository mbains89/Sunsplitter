import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// SUN-PLAYTEST-TITLE-BODY-FOLLOW-01 — wordmark + leftover title body on dark hull.
export function playtestTitleBodyFollowChecks(runtime) {
  const errors = [];
  const html = readFileSync(resolve(ROOT, "index.html"), "utf8");
  const startCss = readFileSync(resolve(ROOT, "css/title-start.css"), "utf8");
  if (!html.includes('href="css/title-start.css"') || !html.includes('class="game-title"') || !html.includes('id="title-heading"')) {
    errors.push("title-start stylesheet or game-title wordmark missing");
  }
  if (!html.includes('id="title-save-status"') || !html.includes('id="new-run-confirm-copy"')) {
    errors.push("leftover title body markup missing");
  }
  if (!html.includes(">Sunsplitter</h1>") || !html.includes("Earth failed in a cascade measured in hours.")) {
    errors.push("title wordmark or prologue strings changed");
  }
  if (!startCss.includes("#title-screen .game-title") || !startCss.includes("#f2f3f5")) {
    errors.push("title-start CSS lost the wordmark contrast lift");
  }
  if (!startCss.includes("#title-screen .title-save-status") || !startCss.includes("#title-screen #new-run-confirm-copy")) {
    errors.push("title-start CSS does not target leftover title body");
  }
  if (!startCss.includes("color: var(--text)") || !startCss.includes("text-shadow")) {
    errors.push("title-start CSS lost the TITLE-CONTRAST body-copy lift");
  }
  if (!startCss.includes("#title-ship-image") || !startCss.includes("180s") || !startCss.includes("animation: title-ship-rotate")) {
    errors.push("title body-follow CSS dropped the rotating-ship contract");
  }
  if (startCss.includes("100dvh - 100px") || startCss.includes("100vh - 100px")) {
    errors.push("title body-follow CSS reintroduced a near-viewport min-height band");
  }
  if (!startCss.includes("min-height: 0") || !startCss.includes("justify-content: flex-start")) {
    errors.push("title body-follow CSS dropped the compact title/notice height contract");
  }
  if (startCss.includes("0.42") === false) {
    errors.push("title body-follow CSS changed the hull overlay stop");
  }
  try {
    const fixture = runtime.evaluate(`(() => {
      localStorage.clear();
      acknowledgeTone();
      const title = document.getElementById("title-screen");
      const word = document.getElementById("title-heading");
      const begin = document.getElementById("btn-begin");
      const label = word ? String(word.textContent || "").replace(/\\s+/g, " ").trim() : "";
      return {
        titleVisible: !!(title && !title.classList.contains("hidden")),
        word: label.indexOf("Sunsplitter") !== -1,
        begin: !!begin
      };
    })()`);
    if (!fixture.titleVisible) errors.push("title/start screen not visible for body-follow smoke");
    if (!fixture.word) errors.push("title wordmark missing after body-follow lift");
    if (!fixture.begin) errors.push("title begin control missing after body-follow lift");
  } catch (error) {
    errors.push(`title body-follow runtime: ${error.message}`);
  }
  return errors;
}
