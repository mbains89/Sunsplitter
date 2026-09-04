import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// SUN-PLAYTEST-TITLE-WHITESPACE-01 — notice/title no longer force a leftover bottom band.
export function playtestTitleWhitespaceChecks(runtime) {
  const errors = [];
  const html = readFileSync(resolve(ROOT, "index.html"), "utf8");
  const startCss = readFileSync(resolve(ROOT, "css/title-start.css"), "utf8");
  const styleCss = readFileSync(resolve(ROOT, "css/style.css"), "utf8");
  if (!html.includes('href="css/title-start.css"') || !html.includes('id="tone-screen"') || !html.includes('id="title-screen"')) {
    errors.push("title/notice markup or title-start stylesheet link missing");
  }
  if (!startCss.includes("#tone-screen") || !startCss.includes("#title-screen")) {
    errors.push("title-start CSS does not target notice and title screens");
  }
  if (startCss.includes("100dvh - 100px") || startCss.includes("100vh - 100px")) {
    errors.push("title-start CSS still forces a near-viewport min-height band");
  }
  if (!startCss.includes("min-height: 0") || !startCss.includes("justify-content: flex-start")) {
    errors.push("title-start CSS lost the compact start/notice height contract");
  }
  if (!styleCss.includes("min-height: calc(100dvh - 100px)")) {
    errors.push("base title/ending min-height contract dropped from style.css");
  }
  if (!html.includes("I understand — continue") || !html.includes('id="btn-begin"') || !html.includes('id="btn-content-notice"')) {
    errors.push("notice/start copy or continue/begin controls dropped");
  }
  try {
    const fixture = runtime.evaluate(`(() => {
      localStorage.clear();
      resetRunState();
      showScreen("tone");
      const tone = document.getElementById("tone-screen");
      const title = document.getElementById("title-screen");
      const continueBtn = tone && tone.querySelector(".btn-primary");
      const notice = {
        visible: !!(tone && !tone.classList.contains("hidden")),
        continue: !!(continueBtn && /I understand/.test(continueBtn.textContent)),
        copy: !!(tone && /Adult sexual content is permanent/.test(tone.textContent))
      };
      showScreen("title");
      const begin = document.getElementById("btn-begin");
      const noticeBtn = document.getElementById("btn-content-notice");
      const start = {
        visible: !!(title && !title.classList.contains("hidden")),
        toneHidden: !!(tone && tone.classList.contains("hidden")),
        begin: !!(begin && begin.textContent.trim() === "Begin"),
        notice: !!(noticeBtn && /Content notice/.test(noticeBtn.textContent)),
        prologue: !!(title && /Earth failed in a cascade/.test(title.textContent))
      };
      return { notice, start };
    })()`);
    if (!fixture.notice.visible || !fixture.notice.continue || !fixture.notice.copy) {
      errors.push("content-notice screen lost copy or continue control");
    }
    if (!fixture.start.visible || !fixture.start.toneHidden || !fixture.start.begin || !fixture.start.notice || !fixture.start.prologue) {
      errors.push("title/start screen lost copy or begin/notice controls");
    }
  } catch (error) {
    errors.push(`title whitespace runtime: ${error.message}`);
  }
  return errors;
}
