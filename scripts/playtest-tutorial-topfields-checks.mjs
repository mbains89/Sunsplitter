import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const TOPFIELDS = ["Crew", "Hull", "Coh", "Sup", "Emb"];

// SUN-PLAYTEST-TUTORIAL-TOPFIELDS-01 — overlay names the five HUD cells; Skip still starts.
export function playtestTutorialTopfieldsChecks(runtime) {
  const errors = [];
  const html = readFileSync(resolve(ROOT, "index.html"), "utf8");
  const css = readFileSync(resolve(ROOT, "css/style.css"), "utf8");
  const runtimeSrc = [
    readFileSync(resolve(ROOT, "src/validate.js"), "utf8"),
    readFileSync(resolve(ROOT, "src/engine.js"), "utf8")
  ].join("\n");

  if (!html.includes('id="tutorial-overlay"') || !html.includes('id="tutorial-topfields"')) {
    errors.push("tutorial overlay markup missing");
  }
  if (!html.includes('id="tutorial-skip"') || !html.includes("skipTutorial()")) {
    errors.push("tutorial Skip control markup missing");
  }
  for (const label of TOPFIELDS) {
    if (!html.includes(`>${label}<`) && !html.includes(`>${label} —`) && !html.includes(`>${label}</span>`)) {
      errors.push(`tutorial overlay lost ${label} copy`);
    }
  }
  if (!html.includes('id="stat-survivors"') || !html.includes(">Crew<") || !html.includes(">Hull<") || !html.includes(">Coh<") || !html.includes(">Sup<") || !html.includes(">Emb<")) {
    errors.push("status bar lost Crew/Hull/Coh/Sup/Emb labels");
  }
  if (!css.includes("#tutorial-overlay") || !css.includes("#tutorial-topfields")) {
    errors.push("tutorial overlay CSS missing");
  }
  if (!runtimeSrc.includes("function skipTutorial") || !runtimeSrc.includes("function showTutorialOverlay") || !runtimeSrc.includes("TUTORIAL_TOPFIELDS")) {
    errors.push("runtime lost tutorial overlay or Skip wiring");
  }

  try {
    const fixture = runtime.evaluate(`(() => {
      localStorage.clear();
      resetRunState();
      const started = startGame();
      if (!started || !currentCinematic || currentCinematic.kind !== "intro") {
        return { started, kind: currentCinematic && currentCinematic.kind };
      }
      finishCinematic();
      const overlay = document.getElementById("tutorial-overlay");
      const copy = [
        document.getElementById("tutorial-copy") && document.getElementById("tutorial-copy").textContent,
        document.getElementById("tutorial-topfields") && document.getElementById("tutorial-topfields").textContent
      ].join(" ");
      const labels = ["Crew", "Hull", "Coh", "Sup", "Emb"].map(label => copy.includes(label));
      const afterIntro = {
        game: !document.getElementById("game-screen").classList.contains("hidden"),
        overlayOpen: overlay && !overlay.classList.contains("hidden") && overlay.classList.contains("visible"),
        skip: !!document.getElementById("tutorial-skip"),
        labels,
        scene: state.scene
      };
      const skipped = skipTutorial();
      const afterSkip = {
        skipped,
        overlayHidden: overlay.classList.contains("hidden") && !overlay.classList.contains("visible"),
        game: !document.getElementById("game-screen").classList.contains("hidden"),
        scene: state.scene
      };
      const blocked = afterSkip.scene !== "wake" || !afterSkip.game;
      return { afterIntro, afterSkip, blocked };
    })()`);
    if (!fixture.afterIntro || !fixture.afterIntro.overlayOpen) {
      errors.push("tutorial overlay did not open after intro on a fresh start");
    }
    if (fixture.afterIntro && fixture.afterIntro.labels.some(ok => !ok)) {
      errors.push("tutorial overlay does not surface Crew/Hull/Coh/Sup/Emb");
    }
    if (!fixture.afterIntro || !fixture.afterIntro.skip) {
      errors.push("tutorial Skip control #tutorial-skip missing at runtime");
    }
    if (!fixture.afterSkip || !fixture.afterSkip.skipped || !fixture.afterSkip.overlayHidden) {
      errors.push("Skip did not dismiss the tutorial overlay");
    }
    if (!fixture.afterSkip || fixture.blocked || fixture.afterSkip.scene !== "wake") {
      errors.push("Skip blocked start or left the player off wake");
    }
  } catch (error) {
    errors.push(`tutorial topfields runtime: ${error.message}`);
  }
  return errors;
}
