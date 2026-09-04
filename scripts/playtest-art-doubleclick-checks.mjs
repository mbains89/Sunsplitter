import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// SUN-PLAYTEST-ART-DOUBLECLICK-01 — restore minimize, not maximize-only.
export function playtestArtDoubleclickChecks(runtime) {
  const errors = [];
  const css = readFileSync(resolve(ROOT, "css/style.css"), "utf8");
  const engine = readFileSync(resolve(ROOT, "src/engine.js"), "utf8");
  const runtimeSrc = readFileSync(resolve(ROOT, "src/validate.js"), "utf8");
  const html = readFileSync(resolve(ROOT, "index.html"), "utf8");
  if (!css.includes("width: min(calc(100% - 32px), 48dvh, 430px)")) {
    errors.push("desktop expanded art sizing contract dropped");
  }
  const desktop = css.split("@media (min-width: 1024px) and (min-height: 640px)")[1] || "";
  const minBlock = desktop.split("#scene-image-wrap.minimized")[1] || "";
  if (!minBlock.includes("max-height: min(26vh, 200px)") || minBlock.slice(0, 280).includes("max-height: none")) {
    errors.push("desktop minimized art still maximize-only");
  }
  if (!engine.includes('wrap.addEventListener("dblclick"') || !engine.includes("toggleImageSize")) {
    errors.push("engine lost desktop double-click art toggle");
  }
  if (!runtimeSrc.includes("function toggleSceneArtSize") || !html.includes('id="crew-sheet"')) {
    errors.push("documented art toggle missing or crew sheet markup dropped");
  }
  try {
    const fixture = runtime.evaluate(`(() => {
      localStorage.clear();
      resetRunState();
      showScene("wake");
      const wrap = document.getElementById("scene-image-wrap");
      const sheet = document.getElementById("crew-sheet");
      const panel = document.getElementById("crew-panel");
      const before = JSON.stringify(state);
      const opened = !!(wrap && wrap.classList.contains("visible") && !wrap.classList.contains("minimized"));
      const minimized = toggleSceneArtSize();
      const collapsed = wrap.classList.contains("minimized") && minimized === true;
      const expanded = toggleSceneArtSize();
      const restored = wrap.classList.contains("visible") && !wrap.classList.contains("minimized") && expanded === false;
      wrap.dispatchEvent({ type: "dblclick" });
      const afterDbl = wrap.classList.contains("minimized");
      const sheetQuiet = !!(sheet && sheet.classList.contains("hidden") && !sheet.classList.contains("visible"));
      const panelQuiet = !!(panel && !panel.classList.contains("visible"));
      return {
        opened, collapsed, restored, afterDbl, sheetQuiet, panelQuiet,
        stable: JSON.stringify(state) === before
      };
    })()`);
    if (!fixture.opened) errors.push("wake art did not start expanded");
    if (!fixture.collapsed) errors.push("art toggle did not minimize expanded art");
    if (!fixture.restored) errors.push("art toggle did not expand after minimize");
    if (!fixture.afterDbl) errors.push("double-click did not minimize restored art");
    if (!fixture.sheetQuiet || !fixture.panelQuiet) errors.push("art toggle disturbed crew sheet / chip panel");
    if (!fixture.stable) errors.push("art toggle mutated run state");
  } catch (error) {
    errors.push(`art doubleclick runtime: ${error.message}`);
  }
  return errors;
}
