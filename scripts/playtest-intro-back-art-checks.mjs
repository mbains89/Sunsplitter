import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const INTRO_SLIDE_ART = [
  "images/cascade_records.jpg",
  "images/ship_exterior_2.jpg",
  "images/arc_living_conflict.jpg"
];

// SUN-PLAYTEST-INTRO-BACK-ART-01 — Back on all 3 intro slides + in-tree slide art.
export function playtestIntroBackArtChecks(runtime) {
  const errors = [];
  const html = readFileSync(resolve(ROOT, "index.html"), "utf8");
  const engine = readFileSync(resolve(ROOT, "src/engine.js"), "utf8");
  const introJs = (() => {
    try { return readFileSync(resolve(ROOT, "src/intro-slides.js"), "utf8"); }
    catch { return ""; }
  })();
  const runtimeSource = engine + "\n" + introJs;
  if (!html.includes('id="cinematic-screen"') || !html.includes('id="cinematic-image"')) {
    errors.push("intro cinematic screen markup missing");
  }
  if (!html.includes('id="cinematic-back"') || !html.includes("retreatCinematic()")) {
    errors.push("intro Back control markup missing");
  }
  if (!html.includes('id="intro-line-1"') || !html.includes('id="intro-line-2"') || !html.includes('id="intro-line-3"')) {
    errors.push("three intro slide text ids missing");
  }
  if (!runtimeSource.includes("function retreatCinematic") || !runtimeSource.includes("INTRO_SLIDE_ART")) {
    errors.push("runtime lost intro Back or slide-art wiring");
  }
  for (const plate of INTRO_SLIDE_ART) {
    if (!runtimeSource.includes(`"${plate}"`)) errors.push(`runtime missing in-tree intro plate ${plate}`);
    if (!existsSync(resolve(ROOT, plate))) errors.push(`intro plate missing from tree: ${plate}`);
  }
  if (new Set(INTRO_SLIDE_ART).size !== 3) errors.push("intro slides do not have unique in-tree plates");
  try {
    const fixture = runtime.evaluate(`(() => {
      localStorage.clear();
      resetRunState();
      const started = startGame();
      const back = document.getElementById("cinematic-back");
      const title = document.getElementById("title-screen");
      const plates = ${JSON.stringify(INTRO_SLIDE_ART)};
      const seen = [];
      if (!started || !currentCinematic || currentCinematic.kind !== "intro") {
        return { started, kind: currentCinematic && currentCinematic.kind, back: !!back };
      }
      const hiddenOnIntro = !!(back && back.classList.contains("hidden"));
      for (let i = 0; i < 3; i++) {
        seen.push({
          index: currentCinematic.index,
          art: document.getElementById("cinematic-image").__ssManagedSource,
          backPresent: !!document.getElementById("cinematic-back"),
          backHidden: document.getElementById("cinematic-back").classList.contains("hidden"),
          text: document.getElementById("cinematic-text").textContent
        });
        if (i < 2) advanceCinematic();
      }
      retreatCinematic();
      const afterBack3to2 = {
        index: currentCinematic && currentCinematic.index,
        art: document.getElementById("cinematic-image").__ssManagedSource,
        cinematic: !!(currentCinematic && currentCinematic.kind === "intro")
      };
      retreatCinematic();
      const afterBack2to1 = {
        index: currentCinematic && currentCinematic.index,
        art: document.getElementById("cinematic-image").__ssManagedSource
      };
      retreatCinematic();
      return {
        started,
        hiddenOnIntro,
        seen,
        afterBack3to2,
        afterBack2to1,
        backToTitle: !currentCinematic && title && !title.classList.contains("hidden"),
        plates
      };
    })()`);
    if (!fixture.started) errors.push("Begin did not open the intro cinematic");
    if (fixture.hiddenOnIntro) errors.push("cinematic-back is hidden on intro slides");
    if (!Array.isArray(fixture.seen) || fixture.seen.length !== 3) {
      errors.push("intro Back/art smoke did not walk all 3 slides");
    } else {
      fixture.seen.forEach((slide, i) => {
        if (slide.index !== i) errors.push(`intro slide ${i + 1} index is ${slide.index}`);
        if (slide.art !== INTRO_SLIDE_ART[i]) {
          errors.push(`intro slide ${i + 1} art is ${slide.art || "missing"}; expected ${INTRO_SLIDE_ART[i]}`);
        }
        if (!slide.backPresent || slide.backHidden) {
          errors.push(`intro slide ${i + 1} missing visible Back control #cinematic-back`);
        }
      });
    }
    if (!fixture.afterBack3to2 || fixture.afterBack3to2.index !== 1 || fixture.afterBack3to2.art !== INTRO_SLIDE_ART[1]) {
      errors.push("Back on slide 3 did not return to slide 2 art");
    }
    if (!fixture.afterBack2to1 || fixture.afterBack2to1.index !== 0 || fixture.afterBack2to1.art !== INTRO_SLIDE_ART[0]) {
      errors.push("Back on slide 2 did not return to slide 1 art");
    }
    if (!fixture.backToTitle) errors.push("Back on slide 1 did not return to title");
  } catch (error) {
    errors.push(`intro Back/art runtime: ${error.message}`);
  }
  return errors;
}
