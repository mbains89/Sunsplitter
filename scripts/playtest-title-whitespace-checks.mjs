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
  if (!html.includes("I understand — continue") || !html.includes("Adult sexual content is permanent.") || !html.includes('id="btn-begin"') || !html.includes('onclick="startGame()"') || !html.includes('id="btn-content-notice"') || !html.includes('onclick="revisitTone()"') || !html.includes("Earth failed in a cascade measured in hours.")) {
    errors.push("notice/start copy or continue/begin controls dropped");
  }
  try {
    const fixture = runtime.evaluate(`(() => {
      localStorage.clear();
      acknowledgeTone();
      const tone = document.getElementById("tone-screen");
      const title = document.getElementById("title-screen");
      const begin = document.getElementById("btn-begin");
      const noticeBtn = document.getElementById("btn-content-notice");
      const start = {
        visible: !!(title && !title.classList.contains("hidden")),
        toneHidden: !!(tone && tone.classList.contains("hidden")),
        begin: !!begin,
        notice: !!noticeBtn
      };
      revisitTone();
      const notice = {
        visible: !!(tone && !tone.classList.contains("hidden")),
        titleHidden: !!(title && title.classList.contains("hidden"))
      };
      acknowledgeTone();
      const back = {
        titleVisible: !!(title && !title.classList.contains("hidden")),
        toneHidden: !!(tone && tone.classList.contains("hidden")),
        begin: !!document.getElementById("btn-begin"),
        notice: !!document.getElementById("btn-content-notice")
      };
      return { start, notice, back };
    })()`);
    if (!fixture.start.visible || !fixture.start.toneHidden || !fixture.start.begin || !fixture.start.notice) {
      errors.push("title/start screen lost copy or begin/notice controls");
    }
    if (!fixture.notice.visible || !fixture.notice.titleHidden) {
      errors.push("content-notice screen lost visibility or continue path");
    }
    if (!fixture.back.titleVisible || !fixture.back.toneHidden || !fixture.back.begin || !fixture.back.notice) {
      errors.push("notice continue did not return to a usable title/start screen");
    }
  } catch (error) {
    errors.push(`title whitespace runtime: ${error.message}`);
  }
  return errors;
}
