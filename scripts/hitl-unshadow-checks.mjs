import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// SUN-HITL-UNSHADOW-01 — static proof that scene.image cannot blank a mapped
// plate and that Crew close / tab restore rebind #scene-image.
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export function hitlUnshadowChecks() {
  const errors = [];
  const engine = readFileSync(resolve(ROOT, "src/engine.js"), "utf8");
  if (engine.length < 90000) errors.push("engine.js below 90KB class");
  if (engine.includes("PLACEHOLDER") || engine.includes("SEE_LOCAL_PATCH")) {
    errors.push("engine.js hollow marker");
  }
  if (!engine.includes("SUN-HITL-UNSHADOW-01")) errors.push("missing unshadow marker");
  if (!engine.includes("function rebindScenePlate(")) errors.push("missing rebindScenePlate");
  const open = engine.indexOf("renderCrewPanel(\"lena\")");
  const openRebind = engine.indexOf("rebindScenePlate()", open);
  if (open < 0 || openRebind < 0 || openRebind - open > 240) {
    errors.push("Crew open does not rebind scene plate");
  }
  if (!engine.includes("closing Crew rebinds #scene-image")) {
    errors.push("Crew close does not rebind scene plate");
  }
  if (!engine.includes("tab return must not leave the scene plate unloaded")) {
    errors.push("tab restore does not rebind empty scene plate");
  }
  const guard = engine.indexOf("SUN-HITL-UNSHADOW-01: after id-keyed guards");
  const explicit = engine.indexOf("if (explicit) return explicit;", guard);
  const mapped = engine.indexOf("return map[id] || null;", explicit);
  if (guard < 0 || explicit < 0 || mapped < 0) {
    errors.push("scene.image still shadows map before guards, or blank explicit still wins");
  }
  return errors;
}
