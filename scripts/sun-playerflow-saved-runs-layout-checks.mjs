// SUN-SAVED-RUNS-01 (L-052, Wave 2 design S-2) — the Saved runs dialog in a real browser.
//
// Chromium through Playwright, at 360x640 (phone), 1280x800 (desktop) and 844x390 (phone sideways,
// where the actions stick to the panel's bottom edge), with slot 1 filled (with
// a callsign), slot 2 unreadable and slot 3 finished. For each size: the title has no horizontal
// scroll and Continue sits above the fold; opening Saved runs does not move Continue; the dialog fits
// the viewport and scrolls inside itself, with no horizontal scroll anywhere; every row and every
// action that shows for each row is at least 44px each way and can be hit once scrolled into view;
// focus starts on the current slot's radio, Tab and Shift+Tab stay inside the dialog, an arrow key
// moves the selection and the actions follow it; Escape closes it and focus returns to the Saved runs
// button; opened over the inline New run confirm it closes that confirm, keeps Tab and takes Escape
// itself; Load opens the chosen run and leaves no dialog open behind it. No page errors.
//
// When Playwright or Chromium is missing (CI has no browser), it prints NOT_AVAILABLE and passes;
// pass --require-browser to fail instead. SUNSPLITTER_PLAYWRIGHT_MODULE and CHROMIUM_PATH point it
// at a specific Playwright module or browser.
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { execSync } from "node:child_process";
import { createRequire } from "node:module";
import { dirname, extname, join, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
// 844x390: a phone held sideways, where the actions stick to the bottom of the panel.
const VIEWPORTS = [[360, 640], [1280, 800], [844, 390]];
const MIN_TARGET = 44;
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".jpg": "image/jpeg", ".png": "image/png",
  ".json": "application/json", ".svg": "image/svg+xml", ".webp": "image/webp" };

async function loadPlaywright() {
  const candidates = [];
  if (process.env.SUNSPLITTER_PLAYWRIGHT_MODULE) candidates.push(pathToFileURL(resolve(process.env.SUNSPLITTER_PLAYWRIGHT_MODULE)).href);
  candidates.push("playwright");
  try {
    const globalRoot = execSync("npm root -g", { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
    candidates.push(pathToFileURL(createRequire(join(globalRoot, "x")).resolve("playwright")).href);
  } catch { /* no global npm */ }
  for (const candidate of candidates) {
    try { const mod = await import(candidate); return mod.default || mod; } catch { /* next */ }
  }
  return null;
}

// Storage the page starts with: tone acknowledged, three slots in three states, pointer on slot 1.
function seedStorage() {
  const base = {
    v: 3, gameVersion: "seed", sceneEntered: true, survivors: 9, integrity: 60, cohesion: 50, supplies: 40, embryos: 30,
    flags: {}, dead: [], deathCause: {}, affinity: {}, trust: {}, romance: {}, pursuit: {}, favors: {}, past_known_by: {},
    dying: {}, past_known: false, marks: {}, memories: [], ideology: { future: 0, living: 0 },
    recovered: { tomas: false, jiro: false, vess: false }, promises: {}, crisisPath: null
  };
  const slot1 = Object.assign({}, base, { scene: "act2_tether_sighting", savedAt: Date.UTC(2026, 10, 13, 21, 58), commanderCallsign: "Harbor",
    dead: ["lena"], deathCause: { lena: "layout fixture" } });
  const slot3 = Object.assign({}, base, { scene: "ending_check", savedAt: Date.UTC(2026, 10, 12, 8, 5) });
  return {
    sunsplitter_tone_ack_v1: "1",
    sunsplitter_save_v3: JSON.stringify(slot1),
    sunsplitter_save_v3_slot2: "{this build cannot read this",
    sunsplitter_save_v3_slot3: JSON.stringify(slot3),
    sunsplitter_save_current_v1: "1"
  };
}

// In the page: rects, overflow and the actions that show.
const MEASURE = `(() => {
  const rect = el => { if (!el || !el.getClientRects().length) return null; const b = el.getBoundingClientRect(); return { x: b.left, y: b.top, w: b.width, h: b.height }; };
  const panel = document.querySelector("#saved-runs .saved-runs-panel");
  const dialog = document.getElementById("saved-runs");
  const visibleActions = ["saved-runs-load", "btn-export-save", "btn-export-unreadable", "btn-import-save", "saved-runs-delete", "saved-runs-close"]
    .filter(id => { const el = document.getElementById(id); return el && el.getClientRects().length > 0; });
  return {
    vw: document.documentElement.clientWidth, vh: window.innerHeight,
    docOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    bodyOverflow: document.body.scrollWidth - document.body.clientWidth,
    open: !!(dialog && dialog.classList.contains("visible") && !dialog.classList.contains("hidden")),
    dialogRect: rect(dialog), panelRect: rect(panel),
    panelOverflowX: panel ? panel.scrollWidth - panel.clientWidth : null,
    panelScrolls: panel ? panel.scrollHeight > panel.clientHeight + 1 : null,
    resume: rect(document.getElementById("btn-resume")),
    // Continue's place in the title column (page scroll taken out: tapping a button below the fold
    // scrolls the page, which is not the column moving).
    resumeInColumn: (() => { const r = rect(document.getElementById("btn-resume")), t = rect(document.getElementById("title-screen")); return r && t ? r.y - t.y : null; })(),
    rows: [1, 2, 3].map(n => rect(document.getElementById("saved-runs-row-" + n))),
    selected: [1, 2, 3].find(n => document.getElementById("saved-runs-slot-" + n).checked) || null,
    actions: visibleActions,
    focus: document.activeElement ? document.activeElement.id : null,
    focusInside: !!(document.activeElement && dialog && dialog.contains(document.activeElement))
  };
})()`;

// In the page: scroll an element into view inside the panel; its size, and whether a tap at its
// centre reaches it. (Serialized by Playwright, so it must not use anything from this module.)
const TARGET = (id) => {
  const el = document.getElementById(id);
  if (!el || !el.getClientRects().length) return { id, missing: true };
  el.scrollIntoView({ block: "nearest", inline: "nearest" });
  const b = el.getBoundingClientRect();
  const x = b.left + b.width / 2, y = b.top + b.height / 2;
  const hit = document.elementFromPoint(x, y);
  return { id, w: b.width, h: b.height, left: b.left, right: b.right, top: b.top, bottom: b.bottom,
    reachable: !!hit && (hit === el || el.contains(hit) || (hit.htmlFor && hit.htmlFor === id) || (hit.closest && hit.closest("label") && hit.closest("label").htmlFor === id)) };
};

async function browserChecks(errors, summary, requireBrowser) {
  const pw = await loadPlaywright();
  if (!pw) {
    const line = "NOT_AVAILABLE — Playwright is not installed here (CI has no browser); run this file where it is";
    if (requireBrowser) errors.push(line); else summary.push(line);
    return false;
  }
  const server = createServer(async (req, res) => {
    const path = resolve(ROOT, "." + decodeURIComponent(new URL(req.url, "http://x").pathname));
    if (!path.startsWith(ROOT + sep)) { res.writeHead(403); return res.end(); }
    try { const body = await readFile(path); res.writeHead(200, { "content-type": TYPES[extname(path)] || "application/octet-stream" }); res.end(body); }
    catch { res.writeHead(404); res.end(); }
  });
  await new Promise(done => server.listen(0, "127.0.0.1", done));
  const url = `http://127.0.0.1:${server.address().port}/index.html`;
  let browser;
  try {
    browser = await pw.chromium.launch({ executablePath: process.env.CHROMIUM_PATH, args: ["--no-sandbox"] });
  } catch (error) {
    server.close();
    const line = `NOT_AVAILABLE — Chromium did not launch (${String(error && error.message).split("\n")[0].slice(0, 120)})`;
    if (requireBrowser) errors.push(line); else summary.push(line);
    return false;
  }
  try {
    for (const [width, height] of VIEWPORTS) {
      const name = `${width}x${height}`;
      const fail = message => errors.push(`${name}: ${message}`);
      const context = await browser.newContext({ viewport: { width, height }, reducedMotion: "reduce", hasTouch: width < 600 });
      const page = await context.newPage();
      const pageErrors = [];
      page.on("pageerror", e => pageErrors.push(String(e.message).slice(0, 160)));
      const seed = seedStorage();
      await page.addInitScript(values => {
        if (sessionStorage.getItem("__seeded")) return;
        try { for (const [k, v] of Object.entries(values)) localStorage.setItem(k, v); sessionStorage.setItem("__seeded", "1"); } catch (e) { /* blocked */ }
      }, seed);
      await page.goto(url);
      await page.waitForFunction(() => typeof showSavedRuns === "function" && !document.getElementById("title-screen").classList.contains("hidden"));

      // Title, dialog closed.
      const title = await page.evaluate(MEASURE);
      if (title.open) fail("Saved runs is open on arrival");
      if (!title.resume) fail("Continue is not shown with a saved run");
      else if (width < 600 && title.resume.y + title.resume.h > height) fail(`Continue (top ${Math.round(title.resume.y)}) is below the phone fold ${height}`);
      if (title.docOverflow > 0 || title.bodyOverflow > 0) fail(`title scrolls sideways (${title.docOverflow}/${title.bodyOverflow}px)`);
      const opener = await page.evaluate(TARGET, "btn-saved-runs");
      if (!opener || opener.missing || opener.h < MIN_TARGET) fail(`Saved runs button ${JSON.stringify(opener)}`);

      // Open by a real tap or click.
      if (width < 600) await page.locator("#btn-saved-runs").tap(); else await page.locator("#btn-saved-runs").click();
      const open = await page.evaluate(MEASURE);
      if (!open.open) { fail("Saved runs did not open"); await context.close(); continue; }
      if (open.focus !== "saved-runs-slot-1") fail(`focus on open is ${open.focus}, not the current slot's radio`);
      if (open.selected !== 1) fail(`dialog opened on slot ${open.selected}, not the current slot 1`);
      if (open.resumeInColumn == null || Math.abs(open.resumeInColumn - title.resumeInColumn) > 0.5) fail(`opening the dialog moved Continue in the title column (${title.resumeInColumn} -> ${open.resumeInColumn})`);
      const p = open.panelRect;
      if (!p || p.x < -0.5 || p.y < -0.5 || p.x + p.w > open.vw + 0.5 || p.y + p.h > open.vh + 0.5) fail(`panel leaves the viewport ${JSON.stringify(p)}`);
      if (open.docOverflow > 0 || open.bodyOverflow > 0) fail(`page scrolls sideways with the dialog open (${open.docOverflow}/${open.bodyOverflow}px)`);
      if (open.panelOverflowX > 0) fail(`panel scrolls sideways (${open.panelOverflowX}px)`);

      // Every row, and every action each row shows: size, inside the panel, reachable.
      const seen = new Set();
      const expectActions = {
        // SUN-DELETE-SLOT-01: Delete on every row that holds a run (its confirm: sun-playerflow-delete-slot-checks).
        1: ["saved-runs-load", "btn-export-save", "btn-import-save", "saved-runs-delete", "saved-runs-close"],
        2: ["btn-export-unreadable", "btn-import-save", "saved-runs-delete", "saved-runs-close"],
        3: ["saved-runs-load", "btn-export-save", "btn-import-save", "saved-runs-delete", "saved-runs-close"]
      };
      for (const slot of [1, 2, 3]) {
        await page.evaluate(n => document.getElementById("saved-runs-row-" + n).scrollIntoView({ block: "nearest" }), slot);
        if (width < 600) await page.locator(`#saved-runs-row-${slot}`).tap(); else await page.locator(`#saved-runs-row-${slot}`).click();
        const m = await page.evaluate(MEASURE);
        if (m.selected !== slot) fail(`tapping row ${slot} selected ${m.selected}`);
        if (JSON.stringify(m.actions) !== JSON.stringify(expectActions[slot])) fail(`row ${slot} shows ${m.actions.join(", ")}`);
        for (const id of [`saved-runs-slot-${slot}`, ...m.actions]) {
          const t = await page.evaluate(TARGET, id.startsWith("saved-runs-slot-") ? `saved-runs-row-${slot}` : id);
          seen.add(t.id);
          if (t.missing) { fail(`${id} is not shown`); continue; }
          if (t.h < MIN_TARGET || t.w < MIN_TARGET) fail(`${t.id} is ${Math.round(t.w)}x${Math.round(t.h)}, under ${MIN_TARGET}px`);
          if (t.left < p.x - 0.5 || t.right > p.x + p.w + 0.5) fail(`${t.id} spills out of the panel sideways`);
          if (!t.reachable) fail(`${t.id} cannot be hit at its centre once scrolled into view`);
        }
        const after = await page.evaluate(MEASURE);
        if (after.docOverflow > 0 || after.panelOverflowX > 0) fail(`row ${slot}: sideways scroll ${after.docOverflow}/${after.panelOverflowX}px`);
      }

      // Keyboard: focus the selected radio, Tab and Shift+Tab stay inside, arrows move the selection.
      await page.locator("#saved-runs-slot-1").focus();
      await page.keyboard.press("ArrowDown");
      const arrowed = await page.evaluate(MEASURE);
      if (arrowed.selected !== 2 || arrowed.focus !== "saved-runs-slot-2") fail(`ArrowDown selected ${arrowed.selected} (focus ${arrowed.focus})`);
      if (!arrowed.actions.includes("btn-export-unreadable") || arrowed.actions.includes("saved-runs-load")) fail(`actions did not follow the arrow key: ${arrowed.actions.join(", ")}`);
      const tabStops = new Set();
      for (const key of ["Tab", "Tab", "Tab", "Tab", "Tab", "Tab", "Tab", "Shift+Tab", "Shift+Tab", "Shift+Tab", "Shift+Tab", "Shift+Tab", "Shift+Tab", "Shift+Tab"]) {
        await page.keyboard.press(key);
        const f = await page.evaluate(MEASURE);
        if (!f.focusInside) { fail(`${key} left the dialog for #${f.focus}`); break; }
        tabStops.add(f.focus);
      }
      for (const id of ["saved-runs-slot-2", "btn-export-unreadable", "btn-import-save", "saved-runs-delete", "saved-runs-close"]) {
        if (!tabStops.has(id)) fail(`Tab never reached ${id} (stops: ${[...tabStops].join(", ")})`);
      }
      for (const id of ["saved-runs-slot-1", "saved-runs-slot-3", "saved-runs-load", "btn-export-save"]) {
        if (tabStops.has(id)) fail(`Tab stopped on ${id}, which is not a stop for the unreadable row`);
      }

      // Escape closes; focus returns to the opener; Continue has not moved.
      await page.keyboard.press("Escape");
      const closed = await page.evaluate(MEASURE);
      if (closed.open) fail("Escape did not close Saved runs");
      if (closed.focus !== "btn-saved-runs") fail(`focus after Escape is ${closed.focus}, not the Saved runs button`);
      if (closed.resumeInColumn == null || Math.abs(closed.resumeInColumn - title.resumeInColumn) > 0.5) fail("closing the dialog moved Continue in the title column");

      // Over the New run confirm: Saved runs closes it, keeps Tab inside, and Escape closes Saved runs,
      // with the confirm still closed and nothing started. SUN-NEW-RUN-SLOT-01: the confirm is now the
      // slot picker, a full layer like Saved runs, so the Saved runs button behind it cannot be hit;
      // the opener is called directly to keep the stacking case covered.
      if (width < 600) await page.locator("#btn-begin").tap(); else await page.locator("#btn-begin").click();
      const confirmOpen = await page.evaluate(() => document.getElementById("new-run-confirm").classList.contains("visible"));
      if (!confirmOpen) fail("New run did not open its confirm (setup)");
      const behind = await page.evaluate(TARGET, "btn-saved-runs");
      if (behind.reachable) fail("the Saved runs button can be hit through the New run slot picker");
      await page.evaluate(() => showSavedRuns());
      for (let i = 0; i < 6; i++) {
        await page.keyboard.press("Tab");
        const f = await page.evaluate(MEASURE);
        if (!f.focusInside) { fail(`over the New run confirm, Tab left Saved runs for #${f.focus}`); break; }
      }
      await page.keyboard.press("Escape");
      const overConfirm = await page.evaluate(() => ({
        savedRuns: document.getElementById("saved-runs").classList.contains("visible"),
        confirm: document.getElementById("new-run-confirm").classList.contains("visible"),
        title: !document.getElementById("title-screen").classList.contains("hidden")
      }));
      if (overConfirm.savedRuns || overConfirm.confirm || !overConfirm.title) fail(`Escape over the New run confirm: ${JSON.stringify(overConfirm)}`);

      // Load the finished run in slot 3 through the dialog: the ending opens, no dialog stays open.
      await page.locator("#btn-saved-runs").click();
      await page.locator("#saved-runs-row-3").click();
      await page.evaluate(() => document.getElementById("saved-runs-load").scrollIntoView({ block: "nearest" }));
      await page.locator("#saved-runs-load").click();
      const loaded = await page.evaluate(() => ({
        title: !document.getElementById("title-screen").classList.contains("hidden"),
        dialog: document.getElementById("saved-runs").classList.contains("visible"),
        modal: typeof openModalDialogElement === "function" && openModalDialogElement() ? openModalDialogElement().id : null,
        active: activeSaveSlot, pointer: localStorage.getItem("sunsplitter_save_current_v1")
      }));
      if (loaded.title || loaded.dialog || loaded.modal) fail(`Load left the title or a dialog open: ${JSON.stringify(loaded)}`);
      if (loaded.active !== 3 || loaded.pointer !== "3") fail(`Load did not make slot 3 active and current: ${JSON.stringify(loaded)}`);

      if (pageErrors.length) fail(`page errors: ${pageErrors.join(" | ")}`);
      summary.push(`${name}: Continue top ${Math.round(title.resume ? title.resume.y : -1)}px; panel ${Math.round(p.w)}x${Math.round(p.h)}${open.panelScrolls ? " (scrolls inside)" : ""}; ${seen.size} targets checked`);
      await context.close();
    }
  } finally {
    await browser.close();
    server.close();
  }
  return true;
}

export async function sunPlayerflowSavedRunsLayoutChecks({ requireBrowser = false } = {}) {
  const errors = [];
  const summary = [];
  const ran = await browserChecks(errors, summary, requireBrowser);
  return { errors, summary, ran };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const { errors, summary, ran } = await sunPlayerflowSavedRunsLayoutChecks({ requireBrowser: process.argv.includes("--require-browser") });
  for (const line of summary) console.log(line);
  if (errors.length) {
    console.error("FAIL sun-playerflow-saved-runs-layout");
    for (const line of errors.slice(0, 60)) console.error("FAIL " + line);
    process.exit(1);
  }
  console.log(ran
    ? "PASS sun-playerflow-saved-runs-layout (360x640, 1280x800 and 844x390: fits with internal scroll, no sideways scroll, targets >= 44px and reachable, Continue unmoved, focus trap, arrow keys, Escape, focus return, over the New run confirm, Load)"
    : "PASS sun-playerflow-saved-runs-layout (browser NOT_AVAILABLE; nothing measured)");
}
