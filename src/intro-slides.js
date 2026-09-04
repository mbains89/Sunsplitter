// SUN-PLAYTEST-INTRO-BACK-ART-01
// Owns Back on the 3 intro slides and wires in-tree slide art.
// Loaded after src/engine.js. No new Grok plates.

const INTRO_SLIDE_ART = [
  "images/cascade_records.jpg",
  "images/ship_exterior_2.jpg",
  "images/arc_living_conflict.jpg"
];
const INTRO_SLIDE_ALT = [
  "Records of Earth's cascade.",
  "The Sunsplitter colonization ark.",
  "The living already arguing what to save."
];

function introSlideArt(index) {
  return INTRO_SLIDE_ART[index] || INTRO_SLIDE_ART[0];
}

function renderCinematicFrame(resetScroll) {
  if (!currentCinematic) return;
  if (resetScroll) document.getElementById("cinematic-body").scrollTop = 0;
  const c = currentCinematic;
  document.getElementById("cinematic-text").textContent = c.frames[c.index];
  document.getElementById("cinematic-progress").textContent = (c.index + 1) + " / " + c.frames.length;
  document.getElementById("cinematic-next").textContent = c.index + 1 === c.frames.length
    ? (c.kind === "intro" ? "Begin story" : "Read ending") : "Next";
  const pause = document.getElementById("cinematic-pause");
  pause.textContent = c.paused ? "Resume" : "Pause";
  pause.setAttribute("aria-pressed", String(c.paused));
  document.getElementById("cinematic-screen").classList.toggle("cinematic-paused", c.paused);
  const back = document.getElementById("cinematic-back");
  if (back) {
    back.classList.toggle("hidden", c.kind !== "intro");
    back.textContent = c.kind === "intro" && c.index === 0 ? "Back to title" : "Back";
  }
  const img = document.getElementById("cinematic-image");
  if (c.kind === "intro") {
    setManagedImageSource(img, introSlideArt(c.index));
    img.alt = INTRO_SLIDE_ALT[c.index] || "";
  }
  scheduleCinematicFrame();
}

function showCinematic(kind) {
  cancelCinematic();
  const intro = kind === "intro";
  // Reuse the existing prologue or already-resolved ending, never new prose.
  const frames = intro
    ? [1, 2, 3].map(n => document.getElementById("intro-line-" + n).textContent.trim())
    : document.getElementById("ending-text").textContent.split(/\n\n+/).slice(0, 2);
  const reduced = typeof window.matchMedia !== "function" || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  currentCinematic = { kind: kind, frames: frames, index: 0, paused: reduced };
  document.getElementById("cinematic-heading").textContent = intro ? "Sunsplitter" : document.getElementById("ending-title").textContent;
  document.getElementById("cinematic-skip").textContent = intro ? "Skip intro" : "Skip ending";
  showScreen("cinematic");
  const img = document.getElementById("cinematic-image");
  if (intro) {
    setManagedImageSource(img, introSlideArt(0));
    img.alt = INTRO_SLIDE_ALT[0];
  } else {
    setManagedImageSource(img, "images/onboarding_background.jpg");
    img.alt = "The empty ship corridor opens onto the stars.";
  }
  renderCinematicFrame(true);
}

function retreatCinematic() {
  if (!currentCinematic) return false;
  if (currentCinematic.index > 0) {
    currentCinematic.index -= 1;
    renderCinematicFrame(true);
    return true;
  }
  if (currentCinematic.kind === "intro") {
    cancelCinematic();
    showTitleScreen();
    return true;
  }
  return false;
}
