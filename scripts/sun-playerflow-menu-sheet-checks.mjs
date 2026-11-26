// SUN-MENU-SHEET-01 — the in-run Menu sheet (Wave 2 T2; Manraj 2026-11-25, D2(a) and O-8).
// The meta bar keeps the save line, Text, Costs and Menu (plus Cover nudity from 720px wide); Save and
// Load move into the sheet with their handlers unchanged; the sheet holds the in-run reader settings
// and Return to title, which saves first and, if the save fails, says so and stays in the run.
//
//   A. headless (the real engine in the vm harness; runs in CI):
//      markup and registration; opens only in a run and never over another dialog; #app inert while
//      open; digits, Enter and Space never commit a choice behind it (the SUN-MODAL-HOTKEYS cases);
//      Tab and Shift+Tab stay inside; Escape and Back close it and focus returns to Menu; a screen
//      change closes it; Save and Load inside act as the bar's did; Return to title saves first and
//      Continue resumes; a failed save keeps the run and says so; after Play Again and before the
//      first order the finished run is kept; settings inside apply and mirror the title; no new run
//      state or save keys.
//   B. Chromium at 360x640, 390x844, 844x390 (touch) and 1440x900 (mouse): the bar holds its items
//      on one row with no overflow; Menu opens and closes by mouse, keys and touch; focus is trapped
//      and returned; the sheet has no horizontal overflow, a 48px Back, and every control reachable;
//      Save, Load, a setting and Return to title work in the real page. Without Playwright or
//      Chromium (CI) B prints NOT_AVAILABLE; --require-browser makes that a failure.
import { readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { createRequire } from "node:module";
import { execSync } from "node:child_process";
import { dirname, extname, join, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { loadGame } from "./simulate.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const HTML = readFileSync(resolve(ROOT, "index.html"), "utf8");
const plain = value => JSON.parse(JSON.stringify(value));

// Inner markup of the element carrying id="<id>", matched to its own closing tag.
function elementMarkup(id) {
  const open = new RegExp(`<(\\w+)\\b[^>]*\\bid="${id}"[^>]*>`).exec(HTML);
  if (!open) return null;
  const tag = open[1];
  const re = new RegExp(`<(/?)${tag}\\b[^>]*>`, "g");
  re.lastIndex = open.index + open[0].length;
  let depth = 1;
  for (let m; (m = re.exec(HTML));) {
    depth += m[1] ? -1 : 1;
    if (!depth) return HTML.slice(open.index + open[0].length, m.index);
  }
  return null;
}

const SHEET_STOPS = ["menu-close", "menu-save", "menu-load", "menu-return-title", "menu-text-pace", "menu-text-size", "menu-line-spacing", "menu-reading-font", "menu-show-costs"];

// ---------- A. markup ----------
function markupChecks(errors) {
  const meta = elementMarkup("meta") || "";
  const barButtons = [...meta.matchAll(/<button\b([^>]*)>([^<]*)<\/button>/g)].map(([, attrs, text]) => ({ id: (/\bid="([^"]*)"/.exec(attrs) || [])[1] || "", attrs, text }));
  const ids = barButtons.map(b => b.id).join(",");
  if (ids !== "meta-text-pace,btn-show-costs-meta,meta-cover-nudity,btn-menu") errors.push(`A: the bar's buttons are ${ids}; D2(a) keeps Text, Costs (and Cover nudity from 720px) and Menu`);
  if (barButtons.some(b => /saveGame\(\)|loadGame\(\)/.test(b.attrs))) errors.push("A: Save or Load is still in the bar (D2(a) moves both into the Menu)");
  if (!meta.includes('id="save-hint"')) errors.push("A: the bar lost its save line");
  const menuBtn = barButtons.find(b => b.id === "btn-menu");
  if (!menuBtn || menuBtn.text !== "Menu" || !/onclick="openMenuSheet\(\)"/.test(menuBtn.attrs) || !/type="button"/.test(menuBtn.attrs) || !/aria-haspopup="dialog"/.test(menuBtn.attrs)) errors.push("A: #btn-menu must be a native button reading Menu that calls openMenuSheet() and says it opens a dialog");
  const sheetTag = /<section id="menu-sheet"[^>]*>/.exec(HTML)?.[0] || "";
  for (const attr of ['class="hidden"', 'role="dialog"', 'aria-modal="true"', 'aria-labelledby="menu-heading"']) {
    if (!sheetTag.includes(attr)) errors.push(`A: #menu-sheet needs ${attr}`);
  }
  if (!/<h2 id="menu-heading">Menu<\/h2>/.test(HTML)) errors.push("A: the sheet's heading must be <h2 id=menu-heading>Menu</h2>");
  if (HTML.indexOf('id="menu-sheet"') < HTML.indexOf('id="crew-sheet"')) errors.push("A: #menu-sheet goes after #crew-sheet (design §4)");
  const sheet = elementMarkup("menu-sheet") || "";
  const stops = [...sheet.matchAll(/<button\b[^>]*\bid="([^"]+)"/g)].map(m => m[1]);
  if (stops.join(",") !== SHEET_STOPS.join(",")) errors.push(`A: the sheet's controls are ${stops.join(",")}; expected ${SHEET_STOPS.join(",")}`);
  const handlers = { "menu-close": "closeMenuSheet()", "menu-save": "menuSaveGame()", "menu-load": "menuLoadGame()", "menu-return-title": "menuReturnToTitle()",
    "menu-text-pace": "menuSheetSetting('pace')", "menu-text-size": "menuSheetSetting('size')", "menu-line-spacing": "menuSheetSetting('spacing')", "menu-reading-font": "menuSheetSetting('font')", "menu-show-costs": "menuSheetSetting('costs')" };
  for (const [id, fn] of Object.entries(handlers)) {
    const tag = new RegExp(`<button id="${id}"[^>]*>`).exec(sheet)?.[0] || "";
    if (!tag.includes('type="button"') || !tag.includes(`onclick="${fn}"`)) errors.push(`A: #${id} must be a native button calling ${fn}`);
  }
  if (!/<button id="menu-close"[^>]*>Back to the scene<\/button>/.test(sheet)) errors.push("A: the sheet's Back reads \"Back to the scene\"");
  if (!/<div id="menu-backlog" class="menu-group hidden"><\/div>/.test(sheet)) errors.push("A: the empty, marked place for the Backlog (T5) is missing or not empty");
  if (!/SUN-BACKLOG-VIEW-01/.test(sheet)) errors.push("A: the Backlog's place must name SUN-BACKLOG-VIEW-01");
  if (/backlog-list|backlog-entry/.test(sheet)) errors.push("A: T2 builds no backlog");
  const links = [...HTML.matchAll(/<link rel="stylesheet" href="([^"]+)">/g)].map(m => m[1]);
  if (links.indexOf("css/menu-sheet.css") < 0 || links.indexOf("css/menu-sheet.css") > links.indexOf("css/reader-settings.css")) errors.push("A: css/menu-sheet.css must be linked, before css/reader-settings.css (which stays last)");
  const scripts = [...HTML.matchAll(/<script src="([^"]+)"/g)].map(m => m[1]);
  if (scripts.indexOf("src/menu-sheet.js") !== scripts.indexOf("src/validate.js") + 1) errors.push("A: src/menu-sheet.js loads right after src/validate.js (it registers in validate.js's dialog maps)");
  const css = readFileSync(resolve(ROOT, "css/menu-sheet.css"), "utf8");
  if (/var\(--reader-/.test(css)) errors.push("A: the sheet is chrome; the reader's Size and Spacing must not scale it");
  const forced = readFileSync(resolve(ROOT, "css/pc-viewport.css"), "utf8");
  if (!/#menu-show-costs\[aria-pressed="true"\]/.test(forced.slice(forced.indexOf("@media (forced-colors: active)")))) errors.push("A: the sheet's pressed Costs toggle needs its forced-colors rule in css/pc-viewport.css");
}

// ---------- A. headless engine ----------
function boot() {
  const runtime = loadGame(ROOT);
  runtime.evaluate(`(() => {
    const proto = Object.getPrototypeOf(document.getElementById("story"));
    proto.focus = function () { document.activeElement = this; };
    proto.contains = function (node) { return node === this; };
    document.documentElement = document.getElementById("__html");
    const app = document.getElementById("app");
    app.children = ["status", "crew-panel", "crew-sheet", "menu-sheet", "tutorial-overlay", "scene-image-wrap", "main", "meta"].map(id => document.getElementById(id));
    const sheet = document.getElementById("menu-sheet");
    sheet.classList.add("hidden");
    const stops = ${JSON.stringify(SHEET_STOPS)}.map(id => { const el = document.getElementById(id); el.tagName = "BUTTON"; return el; });
    sheet.querySelectorAll = () => stops;
    sheet.contains = node => node === sheet || stops.includes(node);
    for (const id of ["btn-menu", "btn-crew", "reveal-next"]) document.getElementById(id).tagName = "BUTTON";
    globalThis.__stops = stops;
    globalThis.__press = (key, shiftKey = false, target = null) => {
      const event = { key, shiftKey, target: target || document.activeElement || document.getElementById("story"), defaultPrevented: false, repeat: false,
        altKey: false, ctrlKey: false, metaKey: false,
        preventDefault() { this.defaultPrevented = true; }, stopPropagation() {}, stopImmediatePropagation() {} };
      const swallowed = handleModalDialogKeydown(event);
      // A Tab the dialog does not take is the browser's: the next control in DOM order, else what is behind.
      if (key === "Tab" && !event.defaultPrevented) {
        const i = stops.indexOf(document.activeElement);
        const next = i < 0 ? null : stops[i + (shiftKey ? -1 : 1)];
        document.activeElement = next || document.getElementById(shiftKey ? "btn-crew" : "reveal-next");
      }
      const handled = !event.defaultPrevented && handleGameplayKeydown(event);
      return { swallowed: !!swallowed, handled: !!handled, scene: state.scene };
    };
    globalThis.__open = () => { const el = document.getElementById("menu-sheet"); return el.classList.contains("visible") && !el.classList.contains("hidden"); };
    globalThis.__shown = id => !document.getElementById(id).classList.contains("hidden");
    globalThis.__firstChoice = id => { const list = typeof scenes[id].choices === "function" ? scenes[id].choices() : scenes[id].choices; return list.find(c => canAffordEffects(c.effects) && (!c.requires || meetsRequirements(c.requires))); };
    globalThis.__startRun = () => {
      localStorage.setItem("sunsplitter_text_pace_v1", "instant");
      localStorage.setItem("sunsplitter_tutorial_seen_v1", "1");
      beginFreshCampaign({ persist: true });
      document.getElementById("choices").children = [];
      document.activeElement = document.getElementById("story");
    };
  })()`);
  return runtime;
}

function headlessChecks(errors, summary) {
  // 1. Registration, opening rules, inert background, focus.
  {
    const rt = boot();
    const r = plain(rt.evaluate(`(() => {
      const o = {};
      o.primary = MODAL_DIALOG_PRIMARY["menu-sheet"];
      o.cancel = typeof MODAL_DIALOG_CANCEL["menu-sheet"] === "function";
      showTitleScreen();
      o.onTitle = openMenuSheet();
      __startRun();
      showTutorialOverlay();
      o.overTutorial = openMenuSheet();
      dismissTutorial();
      if (typeof crew !== "undefined" && crew.lena) { openCrewSheet("lena"); o.overCrewSheet = openMenuSheet(); closeCrewSheet(); }
      document.getElementById("meta").inert = false;
      document.activeElement = document.getElementById("btn-menu");
      o.opened = openMenuSheet();
      o.again = openMenuSheet();
      o.focus = document.activeElement && document.activeElement.id;
      o.dialog = openModalDialogElement() && openModalDialogElement().id;
      o.inertWhileOpen = ["status", "crew-panel", "main", "meta", "scene-image-wrap"].filter(id => document.getElementById(id).inert !== true);
      o.sheetInert = !!document.getElementById("menu-sheet").inert;
      o.closeOk = closeMenuSheet();
      o.inertAfter = ["status", "main", "meta"].filter(id => document.getElementById(id).inert !== false);
      o.focusAfter = document.activeElement && document.activeElement.id;
      o.openAfter = __open();
      return o;
    })()`));
    if (r.primary !== "menu-close" || !r.cancel) errors.push("A1: the sheet is not registered in MODAL_DIALOG_PRIMARY / MODAL_DIALOG_CANCEL");
    if (r.onTitle !== false) errors.push("A1: Menu opened outside a run");
    if (r.overTutorial !== false) errors.push("A1: Menu opened over the first-run tutorial");
    if (r.overCrewSheet !== undefined && r.overCrewSheet !== false) errors.push("A1: Menu opened over the crew sheet");
    if (r.opened !== true || r.again !== false) errors.push("A1: Menu did not open once in a run");
    if (r.focus !== "menu-close") errors.push(`A1: focus went to ${r.focus} on open, not Back to the scene`);
    if (r.dialog !== "menu-sheet") errors.push("A1: the open sheet is not the open modal dialog");
    if (r.inertWhileOpen.length) errors.push(`A1: not inert behind the sheet: ${r.inertWhileOpen.join(", ")}`);
    if (r.sheetInert) errors.push("A1: the sheet made itself inert");
    if (!r.closeOk || r.openAfter || r.inertAfter.length) errors.push(`A1: closing did not restore the background (${r.inertAfter.join(", ")})`);
    if (r.focusAfter !== "btn-menu") errors.push(`A1: focus returned to ${r.focusAfter}, not Menu`);
  }
  // 2. Keys: 1-9, Enter and Space never commit a choice behind it; Tab is trapped; Escape closes.
  {
    const rt = boot();
    const r = plain(rt.evaluate(`(() => {
      __startRun();
      scenes.wake.choices = [{ text: "First", next: "dying" }, { text: "Second", next: "silence" }];
      document.getElementById("choices").children = [];
      showScene("wake");
      document.activeElement = document.getElementById("btn-menu");
      openMenuSheet();
      // As in dialog-keys-checks: a key aimed at nothing interactive is the dialog's to swallow.
      const keys = ["1", "2", "Enter", " "].map(k => __press(k, false, { tagName: "DIV" }));
      // On a focused control in the sheet, digits are swallowed and Enter/Space keep their native
      // activation (that control's own click); neither reaches the story.
      const onButton = ["1", "Enter", " "].map(k => __press(k));
      const forward = [], back = [];
      for (let i = 0; i < __stops.length * 2; i++) { __press("Tab"); forward.push(document.activeElement.id); }
      for (let i = 0; i < __stops.length * 2; i++) { __press("Tab", true); back.push(document.activeElement.id); }
      document.activeElement = document.getElementById("reveal-next");
      const fromOutside = __press("Tab");
      const outsideLanding = document.activeElement.id;
      const esc = __press("Escape");
      const afterEsc = { open: __open(), focus: document.activeElement.id, scene: state.scene };
      const one = __press("1");
      return { keys, onButton, forward, back, fromOutside, outsideLanding, esc, afterEsc, one };
    })()`));
    for (const hit of r.keys) if (!hit.swallowed || hit.handled || hit.scene !== "wake") errors.push(`A2: a key reached the story behind the open Menu (${JSON.stringify(hit)})`);
    for (const hit of r.onButton) if (hit.handled || hit.scene !== "wake") errors.push(`A2: a key on a control in the sheet reached the story (${JSON.stringify(hit)})`);
    if (!r.onButton[0].swallowed) errors.push("A2: a digit on a control in the sheet was not swallowed");
    for (const [dir, seen] of [["Tab", r.forward], ["Shift+Tab", r.back]]) {
      const strays = seen.filter(id => !SHEET_STOPS.includes(id));
      if (strays.length) errors.push(`A2: ${dir} left the sheet for ${[...new Set(strays)].join(", ")}`);
      if ([...new Set(seen)].sort().join() !== [...SHEET_STOPS].sort().join()) errors.push(`A2: ${dir} did not visit every control in the sheet`);
    }
    if (r.outsideLanding !== SHEET_STOPS[0]) errors.push("A2: Tab from behind the sheet was not pulled back to its first control");
    if (!r.esc.swallowed || r.afterEsc.open || r.afterEsc.focus !== "btn-menu" || r.afterEsc.scene !== "wake") errors.push(`A2: Escape did not close the sheet back to Menu (${JSON.stringify(r.afterEsc)})`);
    if (!r.one.handled || r.one.scene !== "dying") errors.push("A2: number keys did not work again after the sheet closed");
  }
  // 3. A screen change closes it; Save and Load inside act as the bar's buttons did.
  {
    const rt = boot();
    const r = plain(rt.evaluate(`(() => {
      const o = {};
      __startRun();
      openMenuSheet();
      showScreen("ending");
      o.closedByScreen = !__open() && !document.getElementById("main").inert && !document.getElementById("meta").inert;
      showScreen("game");
      makeChoice(__firstChoice("wake"));
      o.scene = state.scene;
      // Empty the slot so the Save below has to write it. (SUN-SECOND-TAB-GUARD-01: bytes this tab
      // cannot read and did not write, such as "{}", now read as another tab's save and are never
      // written over; an empty slot is still free.)
      localStorage.removeItem("sunsplitter_save_v3");
      openMenuSheet();
      o.saved = menuSaveGame();
      o.saveClosed = !__open();
      o.savedScene = JSON.parse(localStorage.getItem("sunsplitter_save_v3")).scene;
      o.saveStatus = document.getElementById("save-status").textContent;
      const raw = localStorage.getItem("sunsplitter_save_v3");
      state.cohesion = 1; state.scene = "wake";
      openMenuSheet();
      o.loaded = menuLoadGame();
      o.loadClosed = !__open();
      o.loadedScene = state.scene;
      o.loadedExact = localStorage.getItem("sunsplitter_save_v3") === raw && state.cohesion === JSON.parse(raw).cohesion;
      o.loadStatus = document.getElementById("save-status").textContent;
      o.game = __shown("game-screen");
      return o;
    })()`));
    if (!r.closedByScreen) errors.push("A3: a screen change left the sheet open or the background inert");
    if (r.saved !== true || !r.saveClosed || r.savedScene !== r.scene || r.saveStatus !== "Saved") errors.push(`A3: Save in the Menu did not save as the bar did (${JSON.stringify(r)})`);
    if (r.loaded !== true || !r.loadClosed || r.loadedScene !== r.scene || !r.loadedExact || r.loadStatus !== "Resumed" || !r.game) errors.push(`A3: Load in the Menu did not load as the bar did (${JSON.stringify(r)})`);
  }
  // 4. Return to title saves first, and Continue resumes.
  {
    const rt = boot();
    const r = plain(rt.evaluate(`(() => {
      const o = {};
      __startRun();
      makeChoice(__firstChoice("wake"));
      o.scene = state.scene;
      o.cohesion = state.cohesion;
      // Something the last autosave does not hold yet, so the test can see Return to title save it.
      state.cohesion = o.cohesion - 3;
      openMenuSheet();
      o.chip = document.getElementById("menu-return-title-chip").textContent;
      o.ok = menuReturnToTitle();
      o.closed = !__open();
      o.title = __shown("title-screen");
      o.gameHidden = !__shown("game-screen") && !__shown("meta");
      o.savedCohesion = JSON.parse(localStorage.getItem("sunsplitter_save_v3")).cohesion;
      o.continueShown = __shown("btn-resume");
      o.titleStatus = document.getElementById("title-save-status").textContent;
      o.resumed = resumeGame();
      o.after = { scene: state.scene, cohesion: state.cohesion, game: __shown("game-screen") };
      return o;
    })()`));
    if (r.chip !== "Saves first · Continue on the title picks up here") errors.push(`A4: Return to title's chip reads "${r.chip}"`);
    if (r.ok !== true || !r.closed || !r.title || !r.gameHidden) errors.push(`A4: Return to title did not land on the title (${JSON.stringify(r)})`);
    if (r.savedCohesion !== r.cohesion - 3) errors.push("A4: Return to title did not save first");
    if (!r.continueShown || r.titleStatus !== "Saved") errors.push("A4: the title does not offer Continue with the save confirmed");
    if (r.resumed !== true || r.after.scene !== r.scene || r.after.cohesion !== r.cohesion - 3 || !r.after.game) errors.push(`A4: Continue did not resume the run where Return to title left it (${JSON.stringify(r.after)})`);
  }
  // 5. A failed save: say so, stay in the run.
  {
    const rt = boot();
    const r = plain(rt.evaluate(`(() => {
      const o = {};
      __startRun();
      makeChoice(__firstChoice("wake"));
      const raw = localStorage.getItem("sunsplitter_save_v3");
      const setItem = localStorage.setItem;
      localStorage.setItem = (key, value) => { if (/^sunsplitter_save/.test(key)) throw new Error("quota"); return setItem(key, value); };
      openMenuSheet();
      o.ok = menuReturnToTitle();
      localStorage.setItem = setItem;
      o.open = __open();
      o.game = __shown("game-screen");
      o.title = __shown("title-screen");
      o.status = document.getElementById("menu-status").textContent;
      o.error = document.getElementById("menu-status").classList.contains("error");
      o.kept = localStorage.getItem("sunsplitter_save_v3") === raw;
      closeMenuSheet();
      openMenuSheet();
      o.clearedOnReopen = document.getElementById("menu-status").textContent === "";
      return o;
    })()`));
    if (r.ok !== false || !r.open || !r.game || r.title) errors.push(`A5: a failed save left the run (${JSON.stringify(r)})`);
    if (!/^Save failed · .+ · you are still in the run$/.test(r.status) || !r.error) errors.push(`A5: a failed save did not say so in the sheet ("${r.status}")`);
    if (!r.kept) errors.push("A5: a failed save changed the saved run");
    if (!r.clearedOnReopen) errors.push("A5: the failure line outlived the sheet");
  }
  // 6. After Play Again and before the first order, the finished run stays in its slot (as autosave).
  {
    const rt = boot();
    const r = plain(rt.evaluate(`(() => {
      const o = {};
      __startRun();
      makeChoice(__firstChoice("wake"));
      const raw = localStorage.getItem("sunsplitter_save_v3");
      beginFreshCampaign({ persist: false, preserveCompletedSlotUntilChoice: true });
      openMenuSheet();
      o.chip = document.getElementById("menu-return-title-chip").textContent;
      o.ok = menuReturnToTitle();
      o.kept = localStorage.getItem("sunsplitter_save_v3") === raw;
      o.title = __shown("title-screen");
      o.continueShown = __shown("btn-resume");
      return o;
    })()`));
    if (r.chip !== "Not saved until your first order · the slot keeps your finished run") errors.push(`A6: the kept-run chip reads "${r.chip}"`);
    if (r.ok !== true || !r.kept || !r.title || !r.continueShown) errors.push(`A6: Return to title before the first order did not keep the finished run (${JSON.stringify(r)})`);
  }
  // 7. Settings inside apply, mirror the title and the bar, and add nothing to run state or saves.
  {
    const rt = boot();
    const r = plain(rt.evaluate(`(() => {
      const o = {};
      __startRun();
      const keysBefore = Object.keys(snapshotState()).sort().join();
      const exportBefore = Object.keys(JSON.parse(buildSaveExport().text)).sort().join();
      openMenuSheet();
      menuSheetSetting("size");
      menuSheetSetting("spacing");
      menuSheetSetting("font"); // SUN-READER-FONT-01
      menuSheetSetting("pace");
      menuSheetSetting("costs");
      o.values = [readTextSize(), readLineSpacing(), readReadingFont(), readTextPace(), showCostsOnChoices()];
      o.html = [document.documentElement.getAttribute("data-text-size"), document.documentElement.getAttribute("data-line-spacing"), document.documentElement.getAttribute("data-reading-font")];
      o.sheet = ["menu-text-size", "menu-line-spacing", "menu-reading-font", "menu-text-pace"].map(id => document.getElementById(id).textContent);
      o.chips = ["menu-text-size-chip", "menu-line-spacing-chip", "menu-reading-font-chip", "menu-text-pace-chip", "menu-show-costs-chip"].map(id => document.getElementById(id).textContent);
      o.titleChips = ["text-size-chip", "line-spacing-chip", "reading-font-chip", "text-pace-chip", "show-costs-chip"].map(id => document.getElementById(id).textContent);
      o.pressed = [document.getElementById("menu-show-costs").getAttribute("aria-pressed"), document.getElementById("btn-show-costs-meta").getAttribute("aria-pressed")];
      o.bar = document.getElementById("meta-text-pace").textContent;
      o.stillOpen = __open();
      o.keysSame = Object.keys(snapshotState()).sort().join() === keysBefore;
      persistSave({ silent: true });
      o.exportSame = Object.keys(JSON.parse(buildSaveExport().text)).sort().join() === exportBefore;
      // A change made from the bar shows in the sheet the next time it opens.
      closeMenuSheet();
      toggleTextPace();
      openMenuSheet();
      o.reopened = document.getElementById("menu-text-pace").textContent;
      return o;
    })()`));
    if (JSON.stringify(r.values) !== JSON.stringify(["large", "relaxed", "opendyslexic", "paced", true])) errors.push(`A7: the sheet's settings did not apply (${JSON.stringify(r.values)})`);
    if (JSON.stringify(r.html) !== JSON.stringify(["large", "relaxed", "opendyslexic"])) errors.push("A7: Size, Spacing and Font from the sheet did not reach the page");
    if (JSON.stringify(r.sheet) !== JSON.stringify(["Size: large", "Spacing: relaxed", "Font: OpenDyslexic", "Text: paced"])) errors.push(`A7: the sheet's buttons read ${JSON.stringify(r.sheet)}`);
    if (JSON.stringify(r.chips) !== JSON.stringify(r.titleChips)) errors.push("A7: the sheet's chips do not match the title's");
    if (JSON.stringify(r.pressed) !== JSON.stringify(["true", "true"])) errors.push("A7: the sheet's Costs toggle and the bar's disagree");
    if (r.bar !== "Text: paced" || !r.stillOpen) errors.push("A7: a setting closed the sheet or left the bar behind");
    if (!r.keysSame || !r.exportSame) errors.push("A7: a reader setting reached run state or the save export");
    if (r.reopened !== "Text: instant") errors.push("A7: a change from the bar did not show in the sheet on reopen");
  }
  summary.push(`A: headless: registered as a modal dialog; opens only in a run and never over the tutorial or crew sheet; background inert; 1/2/Enter/Space swallowed; Tab and Shift+Tab trapped over ${SHEET_STOPS.length} controls; Escape and Back return focus to Menu; a screen change closes it; Save and Load inside behave as the bar's; Return to title saves first and Continue resumes; a failed save stays in the run and says so; the finished run is kept before the first order; settings apply and mirror; no run-state or export keys added`);
}

// ---------- B. Chromium ----------
async function loadPlaywright() {
  const candidates = [];
  if (process.env.SUNSPLITTER_PLAYWRIGHT_MODULE) candidates.push(pathToFileURL(resolve(process.env.SUNSPLITTER_PLAYWRIGHT_MODULE)).href);
  candidates.push("playwright");
  try { candidates.push(pathToFileURL(createRequire(join(execSync("npm root -g", { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim(), "x")).resolve("playwright")).href); } catch {}
  for (const candidate of candidates) {
    try { const mod = await import(candidate); return mod.default || mod; } catch {}
  }
  return null;
}

const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".jpg": "image/jpeg", ".png": "image/png", ".json": "application/json", ".svg": "image/svg+xml", ".webp": "image/webp" };
const VIEWPORTS = [[360, 640, true], [390, 844, true], [844, 390, true], [1440, 900, false]];

// In the page: the bar's visible buttons and the sheet's layout.
const BAR = `(() => {
  const meta = document.getElementById("meta"), m = meta.getBoundingClientRect();
  const hint = document.getElementById("save-hint").getBoundingClientRect();
  const buttons = [...meta.querySelectorAll("button")].filter(b => b.getClientRects().length).map(b => {
    const r = b.getBoundingClientRect();
    return { text: b.textContent.trim(), top: Math.round(r.top), left: r.left, right: r.right, w: r.width, h: r.height };
  });
  return { overflow: meta.scrollWidth > meta.clientWidth, docOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    left: m.left, right: m.right, height: m.height, hint: { w: hint.width, right: hint.right }, buttons };
})()`;
const SHEET = `(() => {
  const sheet = document.getElementById("menu-sheet"), panel = sheet.querySelector(".menu-panel");
  const close = document.getElementById("menu-close").getBoundingClientRect(), p = panel.getBoundingClientRect();
  const unreachable = [];
  for (const id of ${JSON.stringify(SHEET_STOPS)}) {
    const el = document.getElementById(id);
    el.scrollIntoView({ block: "nearest" });
    const r = el.getBoundingClientRect();
    const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    if (!(hit === el || el.contains(hit)) || r.width < 48 || r.height < 48) unreachable.push(id);
  }
  panel.scrollTop = 0;
  return { overflow: panel.scrollWidth > panel.clientWidth || document.documentElement.scrollWidth > document.documentElement.clientWidth,
    close: { w: close.width, h: close.height, top: close.top }, panel: { w: p.width, h: p.height, left: p.left, right: p.right, top: p.top, bottom: p.bottom },
    vw: innerWidth, vh: innerHeight, ch: parseFloat(getComputedStyle(panel).fontSize), unreachable };
})()`;

async function browserChecks(errors, summary, requireBrowser) {
  const pw = await loadPlaywright();
  if (!pw) {
    const line = "B: NOT_AVAILABLE — Playwright is not installed here (CI has no browser); run this file where it is";
    if (requireBrowser) errors.push(line); else summary.push(line);
    return;
  }
  const server = createServer(async (req, res) => {
    const path = resolve(ROOT, "." + decodeURIComponent(new URL(req.url, "http://x").pathname));
    if (!path.startsWith(ROOT + sep)) { res.writeHead(403); return res.end(); }
    try { const body = await readFile(path); res.writeHead(200, { "content-type": TYPES[extname(path)] || "application/octet-stream" }); res.end(body); }
    catch { res.writeHead(404); res.end(); }
  });
  await new Promise(ok => server.listen(0, "127.0.0.1", ok));
  const url = `http://127.0.0.1:${server.address().port}/index.html`;
  let browser;
  try {
    browser = await pw.chromium.launch({ executablePath: process.env.CHROMIUM_PATH, args: ["--no-sandbox"] });
  } catch (error) {
    server.close();
    const line = `B: NOT_AVAILABLE — Chromium did not launch (${String(error && error.message).split("\n")[0].slice(0, 120)})`;
    if (requireBrowser) errors.push(line); else summary.push(line);
    return;
  }
  const done = [];
  try {
    for (const [width, height, touch] of VIEWPORTS) {
      const name = `${width}x${height}`;
      const context = await browser.newContext({ viewport: { width, height }, hasTouch: touch, reducedMotion: "reduce" });
      const page = await context.newPage();
      const pageErrors = [];
      page.on("pageerror", e => pageErrors.push(String(e.message).slice(0, 160)));
      await page.addInitScript(() => {
        try {
          localStorage.setItem("sunsplitter_tone_ack_v1", "1");
          localStorage.setItem("sunsplitter_tutorial_seen_v1", "1");
          localStorage.setItem("sunsplitter_text_pace_v1", "instant");
        } catch (e) { /* blocked */ }
      });
      await page.goto(url);
      await page.waitForFunction(() => typeof openMenuSheet === "function" && typeof beginFreshCampaign === "function");
      await page.evaluate(() => { beginFreshCampaign({ persist: true }); });
      const isOpen = () => page.evaluate(() => document.getElementById("menu-sheet").classList.contains("visible"));
      const focusId = () => page.evaluate(() => document.activeElement && document.activeElement.id);

      // The bar: one row, no overflow, the right items, 48px targets, the save line beside them.
      const bar = await page.evaluate(BAR);
      const want = width >= 720 ? ["Text", "Costs", "Cover nudity", "Menu"] : ["Text", "Costs", "Menu"];
      if (JSON.stringify(bar.buttons.map(b => b.text.replace(/:.*/, ""))) !== JSON.stringify(want)) errors.push(`B ${name}: the bar shows ${bar.buttons.map(b => b.text).join(", ")}`);
      if (bar.overflow || bar.docOverflow) errors.push(`B ${name}: the bar overflows`);
      if (new Set(bar.buttons.map(b => b.top)).size !== 1) errors.push(`B ${name}: the bar's buttons wrap to a second row`);
      if (bar.buttons.some(b => b.left < bar.left - 0.5 || b.right > bar.right + 0.5 || b.w < 48 || b.h < 48)) errors.push(`B ${name}: a bar button is off the bar or under 48px`);
      if (!(bar.hint.w > 40) || bar.hint.right > Math.min(...bar.buttons.map(b => b.left)) + 0.5) errors.push(`B ${name}: the save line has no room beside the buttons (${Math.round(bar.hint.w)}px)`);

      // Mouse: open, the layout, Back.
      await page.click("#btn-menu");
      if (!(await isOpen()) || (await focusId()) !== "menu-close") errors.push(`B ${name}: a click on Menu did not open the sheet on Back to the scene`);
      const sheet = await page.evaluate(SHEET);
      if (sheet.overflow) errors.push(`B ${name}: the sheet overflows sideways`);
      if (sheet.close.h < 48 || sheet.close.w < 48) errors.push(`B ${name}: Back to the scene is under 48px`);
      if (sheet.unreachable.length) errors.push(`B ${name}: not reachable or under 48px in the sheet: ${sheet.unreachable.join(", ")}`);
      if (width >= 1024) {
        if (sheet.panel.w > 68 * sheet.ch * 0.75 + 1 && sheet.panel.w > 0.9 * sheet.vw) errors.push(`B ${name}: the desktop panel is not a centred panel`);
        if (Math.abs((sheet.panel.left + sheet.panel.right) / 2 - sheet.vw / 2) > 2 || sheet.panel.h > 0.9 * sheet.vh + 1) errors.push(`B ${name}: the desktop panel is off centre or over 90dvh`);
        await page.mouse.click(8, 8); // the backdrop
        if (await isOpen()) errors.push(`B ${name}: a click on the backdrop did not close the sheet`);
        await page.click("#btn-menu");
      } else if (sheet.panel.w < sheet.vw - 1 || sheet.panel.h < sheet.vh - 1 || sheet.close.top < 0) {
        errors.push(`B ${name}: the phone sheet is not full screen with Back at the top`);
      }
      await page.click("#menu-close");
      if ((await isOpen()) || (await focusId()) !== "btn-menu") errors.push(`B ${name}: Back to the scene did not close the sheet back to Menu`);

      // Keys: Enter opens, Tab and Shift+Tab stay inside, a digit commits nothing, Escape closes.
      await page.focus("#btn-menu");
      await page.keyboard.press("Enter");
      if (!(await isOpen())) errors.push(`B ${name}: Enter on Menu did not open the sheet`);
      const strays = new Set();
      for (const shift of [false, true]) {
        for (let i = 0; i < SHEET_STOPS.length + 2; i++) {
          await page.keyboard.press(shift ? "Shift+Tab" : "Tab");
          const id = await focusId();
          if (!SHEET_STOPS.includes(id)) strays.add(id || "body");
        }
      }
      if (strays.size) errors.push(`B ${name}: Tab left the sheet for ${[...strays].join(", ")}`);
      const sceneBefore = await page.evaluate(() => state.scene);
      await page.keyboard.press("1");
      if ((await page.evaluate(() => state.scene)) !== sceneBefore || !(await isOpen())) errors.push(`B ${name}: a digit reached the story behind the sheet`);
      await page.keyboard.press("Escape");
      if ((await isOpen()) || (await focusId()) !== "btn-menu") errors.push(`B ${name}: Escape did not close the sheet back to Menu`);

      // Touch.
      if (touch) {
        await page.tap("#btn-menu");
        if (!(await isOpen())) errors.push(`B ${name}: a tap on Menu did not open the sheet`);
        await page.tap("#menu-close");
        if (await isOpen()) errors.push(`B ${name}: a tap on Back did not close the sheet`);
      }

      // A setting inside applies to the scene behind.
      const sizeBefore = await page.evaluate(() => parseFloat(getComputedStyle(document.querySelector("#story .scene-text")).fontSize));
      await page.click("#btn-menu");
      await page.click("#menu-text-size");
      const after = await page.evaluate(() => ({ size: parseFloat(getComputedStyle(document.querySelector("#story .scene-text")).fontSize), label: document.getElementById("menu-text-size").textContent, open: document.getElementById("menu-sheet").classList.contains("visible") }));
      if (!(after.size > sizeBefore) || after.label !== "Size: large" || !after.open) errors.push(`B ${name}: Size in the sheet did not reach the scene (${sizeBefore} -> ${after.size}, "${after.label}")`);
      await page.click("#menu-text-size"); await page.click("#menu-text-size"); await page.click("#menu-text-size"); // back to standard
      // SUN-READER-FONT-01: Font in the sheet reaches the scene behind; the sheet keeps its own type.
      await page.click("#menu-reading-font");
      const font = await page.evaluate(() => ({ family: getComputedStyle(document.querySelector("#story .scene-text")).fontFamily, label: document.getElementById("menu-reading-font").textContent,
        sheetFamily: getComputedStyle(document.getElementById("menu-reading-font")).fontFamily, open: document.getElementById("menu-sheet").classList.contains("visible") }));
      if (!/^"?OpenDyslexic"?,/.test(font.family) || font.label !== "Font: OpenDyslexic" || /OpenDyslexic/.test(font.sheetFamily) || !font.open) errors.push(`B ${name}: Font in the sheet did not reach the scene, or changed the sheet's type (${JSON.stringify(font)})`);
      await page.click("#menu-reading-font"); // back to standard
      await page.click("#menu-close");

      // A choice, then Save and Load from the sheet.
      await page.click("#choices .choice-btn:not(:disabled)");
      const scene = await page.evaluate(() => state.scene);
      await page.click("#btn-menu");
      await page.click("#menu-save");
      const saved = await page.evaluate(() => ({ open: document.getElementById("menu-sheet").classList.contains("visible"), status: document.getElementById("save-status").textContent, scene: JSON.parse(localStorage.getItem("sunsplitter_save_v3")).scene }));
      if (saved.open || saved.status !== "Saved" || saved.scene !== scene) errors.push(`B ${name}: Save in the sheet did not save and say so (${JSON.stringify(saved)})`);
      await page.click("#btn-menu");
      await page.click("#menu-load");
      const loaded = await page.evaluate(() => ({ open: document.getElementById("menu-sheet").classList.contains("visible"), status: document.getElementById("save-status").textContent, scene: state.scene }));
      if (loaded.open || loaded.status !== "Resumed" || loaded.scene !== scene) errors.push(`B ${name}: Load in the sheet did not resume (${JSON.stringify(loaded)})`);

      // Return to title saves first; Continue resumes.
      await page.evaluate(() => { state.cohesion -= 2; });
      const cohesion = await page.evaluate(() => state.cohesion);
      await page.click("#btn-menu");
      await page.click("#menu-return-title");
      const title = await page.evaluate(() => ({ title: !document.getElementById("title-screen").classList.contains("hidden"), cont: !document.getElementById("btn-resume").classList.contains("hidden"),
        sheet: document.getElementById("menu-sheet").classList.contains("visible"), inert: [...document.getElementById("app").children].some(el => el.inert), saved: JSON.parse(localStorage.getItem("sunsplitter_save_v3")).cohesion }));
      if (!title.title || !title.cont || title.sheet || title.inert || title.saved !== cohesion) errors.push(`B ${name}: Return to title did not save and land on the title (${JSON.stringify(title)})`);
      await page.click("#btn-resume");
      const back = await page.evaluate(() => ({ scene: state.scene, cohesion: state.cohesion, game: !document.getElementById("game-screen").classList.contains("hidden") }));
      if (!back.game || back.scene !== scene || back.cohesion !== cohesion) errors.push(`B ${name}: Continue did not resume the run (${JSON.stringify(back)})`);

      if (pageErrors.length) errors.push(`B ${name}: page errors: ${pageErrors.join(" | ")}`);
      done.push(name + (touch ? " (mouse, keys, touch)" : " (mouse, keys)"));
      await context.close();
    }
  } finally {
    await browser.close();
    server.close();
  }
  summary.push(`B: Chromium at ${done.join(", ")}: the bar holds its items on one row with the save line beside them; Menu opens and closes; focus trapped and returned; no sideways overflow, 48px controls all reachable; Size applies behind; Save, Load and Return to title then Continue work`);
}

export async function sunPlayerflowMenuSheetChecks({ requireBrowser = false } = {}) {
  const errors = [];
  const summary = [];
  markupChecks(errors);
  headlessChecks(errors, summary);
  await browserChecks(errors, summary, requireBrowser);
  return { errors, summary };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const { errors, summary } = await sunPlayerflowMenuSheetChecks({ requireBrowser: process.argv.includes("--require-browser") });
  for (const line of summary) console.log(line);
  if (errors.length) {
    console.error("FAIL sun-playerflow-menu-sheet");
    for (const line of errors.slice(0, 80)) console.error("FAIL " + line);
    process.exit(1);
  }
  console.log("PASS sun-playerflow-menu-sheet");
}
