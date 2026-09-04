// SUN-PLAYTEST-TUTORIAL-TOPFIELDS-01 — first-run overlay for Crew/Hull/Coh/Sup/Emb.
// Loaded after engine.js. Does not invent meters or opening prose.
const TUTORIAL_SEEN_KEY = "sunsplitter_tutorial_seen_v1";
const TUTORIAL_TOPFIELDS = ["Crew", "Hull", "Coh", "Sup", "Emb"];

function tutorialSeen() {
  try { return localStorage.getItem(TUTORIAL_SEEN_KEY) === "1"; }
  catch (_) { return false; }
}

function markTutorialSeen() {
  try { localStorage.setItem(TUTORIAL_SEEN_KEY, "1"); }
  catch (_) {}
}

function isTutorialOpen() {
  const overlay = document.getElementById("tutorial-overlay");
  return !!(overlay && !overlay.classList.contains("hidden"));
}

function dismissTutorial() {
  const overlay = document.getElementById("tutorial-overlay");
  if (overlay) {
    overlay.classList.add("hidden");
    overlay.classList.remove("visible");
  }
  markTutorialSeen();
  return true;
}

function skipTutorial() {
  return dismissTutorial();
}

function showTutorialOverlay() {
  const overlay = document.getElementById("tutorial-overlay");
  if (!overlay) return false;
  const copy = document.getElementById("tutorial-copy");
  if (copy && !copy.textContent) {
    copy.textContent = "The status bar is live. Crew, Hull, Coh, Sup, and Emb are the only numbers that gate what you can order.";
  }
  const list = document.getElementById("tutorial-topfields");
  if (list && !list.textContent) {
    list.textContent = TUTORIAL_TOPFIELDS.join(" ");
  }
  overlay.classList.remove("hidden");
  overlay.classList.add("visible");
  return true;
}

(function overlayTutorialTopfields() {
  if (typeof finishCinematic === "function") {
    const previousFinish = finishCinematic;
    finishCinematic = function() {
      const kind = currentCinematic && currentCinematic.kind;
      const ok = previousFinish();
      if (ok && kind === "intro" && !tutorialSeen()) showTutorialOverlay();
      return ok;
    };
  }
  if (typeof showScreen === "function") {
    const previousShow = showScreen;
    showScreen = function(id) {
      previousShow(id);
      if (id !== "game" && isTutorialOpen()) {
        const overlay = document.getElementById("tutorial-overlay");
        if (overlay) {
          overlay.classList.add("hidden");
          overlay.classList.remove("visible");
        }
      }
    };
  }
})();
