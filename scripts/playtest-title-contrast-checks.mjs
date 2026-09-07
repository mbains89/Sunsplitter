import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// SUN-PLAYTEST-TITLE-CONTRAST-01 — title splash body-copy contrast on dark hull.
export function playtestTitleContrastChecks(runtime) {
  const errors = [];
  const html = readFileSync(resolve(ROOT, "index.html"), "utf8");
  const startCss = readFileSync(resolve(ROOT, "css/title-start.css"), "utf8");
  if (!html.includes('href="css/title-start.css"') || !html.includes('id="title-screen"')) {
    errors.push("title-start stylesheet or title screen missing");
  }
  if (!html.includes('class="prologue"') || !html.includes('class="title-contract"') || !html.includes('class="game-subtitle"')) {
    errors.push("title splash body-copy markup missing");
  }
  if (!html.includes("Earth failed in a cascade measured in hours.") || !html.includes("The <em>Sunsplitter</em> was a colonization ark") || !html.includes("You are the Commander. The ship is damaged.") || !html.includes("Choices have weight. The Future and the Living will both ask for blood.")) {
    errors.push("title splash body-copy strings changed");
  }
  if (!startCss.includes("#title-screen .prologue") || !startCss.includes("#title-screen .game-subtitle") || !startCss.includes("#title-screen .resume-meta")) {
    errors.push("title-start CSS does not target title splash body-copy");
  }
  if (!startCss.includes("color: var(--text)") || !startCss.includes("text-shadow")) {
    errors.push("title-start CSS lost the body-copy contrast lift");
  }
  if (!startCss.includes("#title-screen .title-contract") || !startCss.includes("#f0a0a0")) {
    errors.push("title-start CSS lost the contract contrast lift");
  }
  if (!startCss.includes("#title-ship-image") || !startCss.includes("180s") || !startCss.includes("animation: title-ship-rotate")) {
    errors.push("title contrast CSS dropped the rotating-ship contract");
  }
  if (startCss.includes("100dvh - 100px") || startCss.includes("100vh - 100px")) {
    errors.push("title contrast CSS reintroduced a near-viewport min-height band");
  }
  if (!startCss.includes("min-height: 0") || !startCss.includes("justify-content: flex-start")) {
    errors.push("title contrast CSS dropped the compact title/notice height contract");
  }
  try {
    const fixture = runtime.evaluate(`(() => {
      localStorage.clear();
      acknowledgeTone();
      const title = document.getElementById("title-screen");
      const subtitle = document.getElementById("game-subtitle");
      const intro1 = document.getElementById("intro-line-1");
      const intro2 = document.getElementById("intro-line-2");
      const intro3 = document.getElementById("intro-line-3");
      const begin = document.getElementById("btn-begin");
      return {
        titleVisible: !!(title && !title.classList.contains("hidden")),
        subtitle: !!subtitle,
        prologue: !!(intro1 && (intro1.textContent || "").includes("Earth failed") && intro2 && intro3),
        begin: !!begin
      };
    })()`);
    if (!fixture.titleVisible) errors.push("title/start screen not visible for contrast smoke");
    if (!fixture.prologue || !fixture.subtitle) errors.push("title splash body-copy nodes missing on title/start");
    if (!fixture.begin) errors.push("title begin control missing after contrast lift");
  } catch (error) {
    errors.push(`title contrast runtime: ${error.message}`);
  }
  return errors;
}
