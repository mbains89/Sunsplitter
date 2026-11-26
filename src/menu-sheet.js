// Sunsplitter — menu-sheet.js
// SUN-MENU-SHEET-01 (Wave 2 T2; Manraj 2026-11-25, D2(a) and O-8). The in-run Menu: one meta-bar
// button, Menu, opens a modal sheet. The game is turn-based, so the sheet pauses nothing and is not
// called Pause. It holds Save and Load (moved out of the bar with their handlers unchanged), Return
// to title (which saves first), and the in-run reader settings. The bar keeps the save line, Text,
// Costs and Menu, plus Cover nudity from 720px wide (#574).
//
// Presentation only: no run state, no save field and no storage key of its own. Settings go through
// the engine's own setters; Save and Load call saveGame() and loadGame() as the bar buttons did.
//
// Dialog rules, as for the crew sheet and the title dialogs (SUN-MODAL-HOTKEYS-01,
// SUN-TUTORIAL-DIALOG-01): the sheet registers itself in validate.js's MODAL_DIALOG_PRIMARY and
// MODAL_DIALOG_CANCEL, so gameplay digits, Enter and Space stand down while it is open, Tab and
// Shift+Tab stay inside it, and Escape closes it. Everything else in #app is inert while it is open.
// Focus goes to "Back to the scene" on open and back to the Menu button on close. It opens only in a
// run, and never over another dialog.
//
// SUN-BACKLOG-VIEW-01 (T5) adds the Backlog: its button in #menu-backlog, and its view as a second
// view inside this same dialog (one dialog, one focus trap). Nothing is built for it here.

const MENU_SHEET_ID = "menu-sheet";
let menuSheetBackground = [];
let menuSheetReturnFocus = null;

// Each reader control in the sheet mirrors its title twin, which the engine's setters keep in sync
// (syncTextPaceControls, syncReaderTypeControls, syncShowCostsControls). Mirroring keeps the strings
// in one place. [sheet button, title button, sheet chip, title chip]
const MENU_SETTING_TWINS = [
  ["menu-text-pace", "btn-text-pace", "menu-text-pace-chip", "text-pace-chip"],
  ["menu-text-size", "btn-text-size", "menu-text-size-chip", "text-size-chip"],
  ["menu-line-spacing", "btn-line-spacing", "menu-line-spacing-chip", "line-spacing-chip"],
  ["menu-show-costs", "btn-show-costs", "menu-show-costs-chip", "show-costs-chip"]
];
const MENU_SETTING_ACTIONS = {
  pace: () => toggleTextPace(),
  size: () => cycleTextSize(),
  spacing: () => cycleLineSpacing(),
  costs: () => toggleShowCosts()
};
const MENU_RETURN_TITLE_CHIP = "Saves first · Continue on the title picks up here";
// After Play Again and before the new run's first order, the slot still holds the finished run, and
// autosave leaves it there (preserveCompletedSlotUntilChoice). Return to title does the same.
const MENU_RETURN_TITLE_CHIP_KEPT = "Not saved until your first order · the slot keeps your finished run";

function menuSheetOpen() {
  const sheet = document.getElementById(MENU_SHEET_ID);
  return !!(sheet && sheet.classList.contains("visible") && !sheet.classList.contains("hidden"));
}

function syncMenuSheetSettings() {
  for (const [id, twinId, chipId, twinChipId] of MENU_SETTING_TWINS) {
    const btn = document.getElementById(id);
    const twin = document.getElementById(twinId);
    if (btn && twin) {
      if (twin.textContent && btn.textContent !== twin.textContent) btn.textContent = twin.textContent;
      const pressed = typeof twin.getAttribute === "function" ? twin.getAttribute("aria-pressed") : null;
      if (pressed === "true" || pressed === "false") btn.setAttribute("aria-pressed", pressed);
    }
    const chip = document.getElementById(chipId);
    const twinChip = document.getElementById(twinChipId);
    if (chip && twinChip && twinChip.textContent && chip.textContent !== twinChip.textContent) chip.textContent = twinChip.textContent;
  }
}

function menuKeepsFinishedRun() {
  return typeof preserveCompletedSlotUntilChoice !== "undefined" && !!preserveCompletedSlotUntilChoice;
}

function setMenuSheetStatus(text, isError) {
  const el = document.getElementById("menu-status");
  if (!el) return;
  el.textContent = text || "";
  el.classList.toggle("error", !!(text && isError));
}

function openMenuSheet() {
  const sheet = document.getElementById(MENU_SHEET_ID);
  if (!sheet || menuSheetOpen()) return false;
  // In a run only: the bar that carries Menu shows on the game screen alone.
  const game = document.getElementById("game-screen");
  if (!game || game.classList.contains("hidden")) return false;
  // Never over another dialog (the first-run tutorial does not make the bar inert).
  const other = typeof openModalDialogElement === "function" ? openModalDialogElement() : null;
  if (other && other !== sheet) return false;
  // Painted while still hidden, so the status chips announce nothing on open.
  syncMenuSheetSettings();
  const chip = document.getElementById("menu-return-title-chip");
  if (chip) chip.textContent = menuKeepsFinishedRun() ? MENU_RETURN_TITLE_CHIP_KEPT : MENU_RETURN_TITLE_CHIP;
  setMenuSheetStatus("");
  menuSheetReturnFocus = document.getElementById("btn-menu");
  const app = document.getElementById("app");
  menuSheetBackground = Array.from((app && app.children) || [])
    .filter(el => el !== sheet).map(el => [el, !!el.inert]);
  menuSheetBackground.forEach(([el]) => { el.inert = true; });
  sheet.classList.remove("hidden");
  sheet.classList.add("visible");
  const panel = sheet.querySelector ? sheet.querySelector(".menu-panel") : null;
  if (panel) panel.scrollTop = 0;
  const close = document.getElementById("menu-close");
  if (close && typeof close.focus === "function") close.focus();
  return true;
}

// opts.returnFocus === false: the screen is changing, so the Menu button is about to hide.
function closeMenuSheet(opts) {
  opts = opts || {};
  const sheet = document.getElementById(MENU_SHEET_ID);
  if (!sheet) return false;
  const wasOpen = menuSheetOpen();
  sheet.classList.add("hidden");
  sheet.classList.remove("visible");
  menuSheetBackground.forEach(([el, inert]) => { el.inert = inert; });
  menuSheetBackground = [];
  const returnFocus = menuSheetReturnFocus;
  menuSheetReturnFocus = null;
  if (!wasOpen || opts.returnFocus === false) return wasOpen;
  const usable = el => (typeof modalFocusUsable === "function" ? modalFocusUsable(el) : !!el);
  if (usable(returnFocus) && typeof returnFocus.focus === "function") {
    returnFocus.focus();
    if (document.activeElement === returnFocus) return true;
  }
  const fallback = typeof firstStoryControl === "function" ? firstStoryControl() : null;
  if (fallback && typeof fallback.focus === "function") fallback.focus();
  return true;
}

function menuSheetSetting(name) {
  const act = Object.prototype.hasOwnProperty.call(MENU_SETTING_ACTIONS, name) ? MENU_SETTING_ACTIONS[name] : null;
  if (act) act();
  syncMenuSheetSettings();
}

// Save and Load: the bar's handlers, unchanged. The sheet closes first, so their notice shows in the
// bar's save line as it always did (on a phone the sheet covers the bar).
function menuSaveGame() {
  closeMenuSheet();
  return saveGame();
}

function menuLoadGame() {
  closeMenuSheet();
  return loadGame();
}

// O-8: back to the title, saving first with the Save button's own save. If the save fails, the sheet
// stays open, says so, and the run goes on; nothing is lost that was not already lost.
function menuReturnToTitle() {
  if (!menuKeepsFinishedRun() && saveGame() !== true) {
    const bar = document.getElementById("save-status");
    const said = bar && bar.textContent ? bar.textContent : "Save failed";
    setMenuSheetStatus(said + " · you are still in the run", true);
    return false;
  }
  closeMenuSheet({ returnFocus: false });
  showTitleScreen();
  return true;
}

(function registerMenuSheetDialog() {
  if (typeof MODAL_DIALOG_PRIMARY !== "undefined") MODAL_DIALOG_PRIMARY[MENU_SHEET_ID] = "menu-close";
  if (typeof MODAL_DIALOG_CANCEL !== "undefined") MODAL_DIALOG_CANCEL[MENU_SHEET_ID] = () => closeMenuSheet();
  // Any screen change closes the sheet first, so it can never sit over the title or an ending.
  if (typeof showScreen === "function") {
    const previousShow = showScreen;
    showScreen = function(id) {
      if (menuSheetOpen()) closeMenuSheet({ returnFocus: false });
      return previousShow.apply(this, arguments);
    };
  }
  if (typeof document === "undefined" || typeof document.addEventListener !== "function") return;
  function bind() {
    syncMenuSheetSettings();
    const sheet = document.getElementById(MENU_SHEET_ID);
    // Desktop: a click on the backdrop around the panel is Back to the scene.
    if (sheet && typeof sheet.addEventListener === "function") {
      sheet.addEventListener("click", event => { if (event && event.target === sheet) closeMenuSheet(); });
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bind);
  else bind();
})();
