import { readFileSync } from "node:fs";
import { resolve } from "node:path";

export function pcViewportChecks(root) {
  const errors = [];
  const css = readFileSync(resolve(root, "css/pc-viewport.css"), "utf8");
  const index = readFileSync(resolve(root, "index.html"), "utf8");
  const style = readFileSync(resolve(root, "css/style.css"), "utf8");
  const engine = readFileSync(resolve(root, "src/engine.js"), "utf8");
  if (!index.includes('href="css/pc-viewport.css"')) errors.push("index missing viewport sheet");
  if (!css.includes("@media (min-width: 1024px) and (max-height: 800px)")) errors.push("short desktop query missing");
  if (!css.includes("max-height: min(52dvh, 360px)")) errors.push("art cap missing");
  if (!css.includes("#choices")) errors.push("choices sticky target missing");
  if (!css.includes("overflow-x: clip")) errors.push("zoom clip missing");
  if (!css.includes(":fullscreen #app")) errors.push("fullscreen rule missing");
  if (!style.includes("--touch: 48px")) errors.push("phone touch needle missing");
  if (!style.includes("@media (max-width: 360px)")) errors.push("360px needle missing");
  if (!style.includes("48dvh")) errors.push("48dvh needle missing");
  if (!style.includes("grid-template-columns: minmax(320px, 0.85fr) minmax(0, 1.15fr)")) errors.push("desktop composition needle missing");
  if (/addEventListener\(\s*["']resize["']/.test(engine)) errors.push("engine resize listener would re-render");
  return errors;
}
