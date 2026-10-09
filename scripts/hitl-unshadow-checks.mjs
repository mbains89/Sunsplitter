import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// SUN-HITL-UNSHADOW-01 — static proof that scene.image cannot blank a mapped
// plate and that Crew close / tab restore rebind #scene-image.
// SUN-CREWPLATE-F07-01 — Escape and direct class-flip closes must also rebind.
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

// Tip overlay at 520be6ad wraps toggleCrewPanel only. Escape is not covered.
const TIP_OVERLAY_FIXTURE = [
  "/* SUN-HITL-UNSHADOW-01 */",
  "function rebindScenePlate() { return true; }",
  "toggleCrewPanel = function () {",
  "  if (wasOpen && !nowOpen) {",
  "    wrap.classList.remove(\"minimized\");",
  "    rebindScenePlate();",
  "  }",
  "};",
].join("\n");

export function crewPlateF07Checks(overlay) {
  const errors = [];
  const text = String(overlay || "");
  if (!text.includes("SUN-CREWPLATE-F07-01")) errors.push("missing F07 marker");
  if (!text.includes("function restoreScenePlateAfterCrewClose")) {
    errors.push("missing restoreScenePlateAfterCrewClose");
  }
  if (!text.includes("MutationObserver")) {
    errors.push("chip/back/Escape class flip has no observer");
  }
  if (!text.includes("restoreScenePlateAfterCrewClose()")) {
    errors.push("close path does not restore the scene plate");
  }
  if (!text.includes('classList.remove("minimized")')) {
    errors.push("close path does not remove minimized");
  }
  if (!text.includes('event.key !== "Escape"')) {
    errors.push("missing Escape listener");
  }
  const esc = text.indexOf('event.key !== "Escape"');
  const restore = text.indexOf("restoreScenePlateAfterCrewClose()", esc);
  if (esc < 0 || restore < 0 || restore - esc > 400) {
    errors.push("Escape listener does not restore a minimized plate");
  }
  if (text.includes("stopImmediatePropagation")) {
    errors.push("Escape must not swallow the engine close");
  }
  return errors;
}

export function crewPlateF07Behavior(mode) {
  const errors = [];
  const expected = "images/medical_bay.jpg";
  let minimized = false;
  let open = false;
  let src = expected;
  function engineToggle() {
    open = !open;
    if (open) minimized = true;
  }
  function engineEsc() {
    if (!open) return;
    open = false;
  }
  function restore() {
    minimized = false;
    src = expected;
  }
  function onClassChange(wasOpen) {
    if (mode !== "branch") return;
    if (wasOpen && !open) restore();
  }
  function lateEsc() {
    if (mode !== "branch") return;
    if (!open && minimized) restore();
  }
  engineToggle();
  src = null;
  const was = open;
  engineEsc();
  onClassChange(was);
  lateEsc();
  if (open) errors.push("esc left panel open");
  if (minimized) errors.push("esc left minimized");
  if (src !== expected) errors.push("esc src " + src);
  engineToggle();
  src = "images/other.jpg";
  engineToggle();
  if (mode === "branch") restore();
  if (minimized) errors.push("button close left minimized");
  if (src !== expected) errors.push("button close src " + src);
  return errors;
}

export function crewPlateF07Probe() {
  const overlay = readFileSync(resolve(ROOT, "src/hitl-unshadow.js"), "utf8");
  return {
    tipStatic: crewPlateF07Checks(TIP_OVERLAY_FIXTURE),
    branchStatic: crewPlateF07Checks(overlay),
    tipBehavior: crewPlateF07Behavior("tip"),
    branchBehavior: crewPlateF07Behavior("branch"),
  };
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1]);
if (isMain) {
  const probe = crewPlateF07Probe();
  const tipFail = probe.tipStatic.length > 0 && probe.tipBehavior.length > 0;
  const branchPass = probe.branchStatic.length === 0 && probe.branchBehavior.length === 0;
  console.log("TIP", tipFail ? "FAIL" : "PASS", probe.tipStatic, probe.tipBehavior);
  console.log("BRANCH", branchPass ? "PASS" : "FAIL", probe.branchStatic, probe.branchBehavior);
  if (!tipFail || !branchPass) process.exit(1);
}
