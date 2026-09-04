import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// SUN-PLAYTEST-TITLE-ROTATING-SHIP-01 — title/start has a slow in-tree ship rotation.
export function playtestTitleRotatingShipChecks(runtime) {
  const errors = [];
  const html = readFileSync(resolve(ROOT, "index.html"), "utf8");
  const startCss = readFileSync(resolve(ROOT, "css/title-start.css"), "utf8");
  if (!html.includes('href="css/title-start.css"') || !html.includes('id="title-screen"')) {
    errors.push("title-start stylesheet or title screen missing");
  }
  if (!html.includes('id="title-ship-bg"') || !html.includes('id="title-ship-image"')) {
    errors.push("title rotating-ship background markup missing");
  }
  if (!html.includes('src="images/ship_exterior_2.jpg"')) {
    errors.push("title ship background is not the in-tree exterior plate");
  }
  if (!startCss.includes("#title-ship-image") || !startCss.includes("@keyframes title-ship-rotate")) {
    errors.push("title-start CSS lost the rotating-ship animation");
  }
  if (!startCss.includes("180s") || !startCss.includes("animation: title-ship-rotate")) {
    errors.push("title ship animation is not a slow continuous rotate");
  }
  if (startCss.includes("100dvh - 100px") || startCss.includes("100vh - 100px")) {
    errors.push("rotating-ship CSS reintroduced a near-viewport min-height band");
  }
  if (!startCss.includes("min-height: 0") || !startCss.includes("justify-content: flex-start")) {
    errors.push("rotating-ship CSS dropped the compact title/notice height contract");
  }
  try {
    const fixture = runtime.evaluate(`(() => {
      localStorage.clear();
      acknowledgeTone();
      const title = document.getElementById("title-screen");
      const shipBg = document.getElementById("title-ship-bg");
      const shipImg = document.getElementById("title-ship-image");
      const begin = document.getElementById("btn-begin");
      return {
        titleVisible: !!(title && !title.classList.contains("hidden")),
        shipBg: !!shipBg,
        shipImg: !!(shipImg && /ship_exterior_2\\.jpg/.test(shipImg.getAttribute("src") || shipImg.src || "")),
        begin: !!begin
      };
    })()`);
    if (!fixture.titleVisible) errors.push("title/start screen not visible for rotating-ship smoke");
    if (!fixture.shipBg || !fixture.shipImg) errors.push("rotating-ship background missing on title/start");
    if (!fixture.begin) errors.push("title begin control missing after rotating-ship restore");
  } catch (error) {
    errors.push(`title rotating-ship runtime: ${error.message}`);
  }
  return errors;
}
