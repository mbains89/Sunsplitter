// SUN-NEW-RUN-SLOT-01 (L-052, Wave 2 design S-3) — the New run slot picker in a real browser.
//
// Chromium through Playwright, at 360x640 and 390x844 (phones), 844x390 (a phone held sideways, where
// the line and the buttons stick to the panel's bottom edge) and 1440x900 (desktop). Phones are
// driven by touch, the desktop by the mouse.
// Two storage states per size:
//   A. slot 1 filled (callsign Harbor, one crew lost), slot 2 unreadable, slot 3 empty. New run opens
//      the picker on slot 3 with focus on its radio; Continue does not move in the title column; the
//      panel fits the viewport and scrolls inside itself; nothing scrolls sideways; every row and both
//      buttons are at least 44px each way and can be hit; Start is on screen when the picker opens;
//      tapping a row (and the arrow keys) moves the selection and the line and Start follow it; Tab and
//      Shift+Tab stay inside; Escape closes it with focus back on New run and nothing written; Start on
//      slot 3, then Begin run, writes slot 3 only and points Continue at it.
//   C. (storage A) a double tap, or a double click on desktop, on Start opens the Commander panel and
//      does nothing else in it: no Begin run, no seal picked, nothing written.
//   B. all three slots filled. Nothing is selected, focus is on the first row, Start is disabled and
//      tapping it writes nothing; tapping slot 2 enables "Replace Slot 2", and Start then Begin run
//      replaces slot 2 only.
// No page errors.
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
const VIEWPORTS = [[360, 640], [390, 844], [844, 390], [1440, 900]];
const MIN_TARGET = 44;
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".jpg": "image/jpeg", ".png": "image/png",
  ".json": "application/json", ".svg": "image/svg+xml", ".webp": "image/webp" };
const SAVE_KEYS = ["sunsplitter_save_v3", "sunsplitter_save_v3_staging", "sunsplitter_save_v3_backup", "sunsplitter_save_v2",
  "sunsplitter_save_v3_slot2", "sunsplitter_save_v3_slot2_staging", "sunsplitter_save_v3_slot2_backup",
  "sunsplitter_save_v3_slot3", "sunsplitter_save_v3_slot3_staging", "sunsplitter_save_v3_slot3_backup", "sunsplitter_save_current_v1"];
const LIVE = { 1: "sunsplitter_save_v3", 2: "sunsplitter_save_v3_slot2", 3: "sunsplitter_save_v3_slot3" };

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

function snapshot(scene, savedAt, extra) {
  return JSON.stringify(Object.assign({
    v: 3, gameVersion: "seed", sceneEntered: true, survivors: 9, integrity: 60, cohesion: 50, supplies: 40, embryos: 30,
    flags: {}, dead: [], deathCause: {}, affinity: {}, trust: {}, romance: {}, pursuit: {}, favors: {}, past_known_by: {},
    dying: {}, past_known: false, marks: {}, memories: [], ideology: { future: 0, living: 0 },
    recovered: { tomas: false, jiro: false, vess: false }, promises: {}, crisisPath: null, scene, savedAt
  }, extra || {}));
}

// A: filled, unreadable, empty. B: all three filled.
function seedStorage(kind) {
  const harbor = snapshot("act2_tether_sighting", Date.UTC(2026, 10, 13, 21, 58),
    { commanderCallsign: "Harbor", dead: ["lena"], deathCause: { lena: "layout fixture" } });
  const seed = { sunsplitter_tone_ack_v1: "1", sunsplitter_save_v3: harbor, sunsplitter_save_current_v1: "1" };
  if (kind === "A") seed.sunsplitter_save_v3_slot2 = "{this build cannot read this";
  else {
    seed.sunsplitter_save_v3_slot2 = snapshot("priority_repairs", Date.UTC(2026, 10, 12, 8, 5), { commanderCallsign: "Beacon" });
    seed.sunsplitter_save_v3_slot3 = snapshot("ending_check", Date.UTC(2026, 10, 11, 18, 40), { commanderCallsign: "Vigil" });
  }
  return seed;
}

// In the page: rects, overflow, the picker's state. (Serialized by Playwright.)
const MEASURE = `(() => {
  const rect = el => { if (!el || !el.getClientRects().length) return null; const b = el.getBoundingClientRect(); return { x: b.left, y: b.top, w: b.width, h: b.height }; };
  const dialog = document.getElementById("new-run-confirm");
  const panel = dialog ? dialog.querySelector(".new-run-panel") : null;
  const ok = document.getElementById("new-run-ok");
  return {
    vw: document.documentElement.clientWidth, vh: window.innerHeight,
    docOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    bodyOverflow: document.body.scrollWidth - document.body.clientWidth,
    open: !!(dialog && dialog.classList.contains("visible") && !dialog.classList.contains("hidden")),
    commander: (() => { const c = document.getElementById("commander-create"); return !!(c && c.classList.contains("visible")); })(),
    game: !document.getElementById("game-screen").classList.contains("hidden"),
    panelRect: rect(panel), okRect: rect(ok), chipRect: rect(document.getElementById("new-run-confirm-chip")),
    panelOverflowX: panel ? panel.scrollWidth - panel.clientWidth : null,
    panelScrolls: panel ? panel.scrollHeight > panel.clientHeight + 1 : null,
    resumeInColumn: (() => { const r = rect(document.getElementById("btn-resume")), t = rect(document.getElementById("title-screen")); return r && t ? r.y - t.y : null; })(),
    selected: [1, 2, 3].find(n => document.getElementById("new-run-slot-" + n).checked) || null,
    chip: document.getElementById("new-run-confirm-chip").textContent,
    ok: ok ? ok.textContent : null, okDisabled: !!(ok && ok.disabled),
    focus: document.activeElement ? document.activeElement.id : null,
    focusInside: !!(document.activeElement && dialog && dialog.contains(document.activeElement))
  };
})()`;

// In the page, without scrolling: is the selected row's middle showing (not under the sticky buttons)?
const SELECTED_SHOWS = () => {
  const n = [1, 2, 3].find(k => document.getElementById("new-run-slot-" + k).checked);
  if (!n) return null;
  const row = document.getElementById("new-run-row-" + n);
  const b = row.getBoundingClientRect();
  const hit = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2);
  return { slot: n, shows: !!hit && (hit === row || row.contains(hit)) };
};

const TARGET = (id) => {
  const el = document.getElementById(id);
  if (!el || !el.getClientRects().length) return { id, missing: true };
  el.scrollIntoView({ block: "nearest", inline: "nearest" });
  const b = el.getBoundingClientRect();
  const x = b.left + b.width / 2, y = b.top + b.height / 2;
  const hit = document.elementFromPoint(x, y);
  return { id, w: b.width, h: b.height, left: b.left, right: b.right,
    reachable: !!hit && (hit === el || el.contains(hit) || (hit.closest && hit.closest("label") && hit.closest("label").htmlFor === id)) };
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
  const storageOf = page => page.evaluate(keys => Object.fromEntries(keys.map(k => [k, localStorage.getItem(k)])), SAVE_KEYS);
  const sliceOf = (all, slot) => Object.fromEntries(Object.entries(all).filter(([k]) =>
    k !== "sunsplitter_save_current_v1" && (slot === 1 ? !/_slot[23]/.test(k) : k.includes(`_slot${slot}`))));
  try {
    for (const [width, height] of VIEWPORTS) {
      const name = `${width}x${height}`;
      const touch = Math.min(width, height) < 600;
      const fail = message => errors.push(`${name}: ${message}`);
      const open = async (kind) => {
        const context = await browser.newContext({ viewport: { width, height }, reducedMotion: "reduce", hasTouch: touch });
        const page = await context.newPage();
        const pageErrors = [];
        page.on("pageerror", e => pageErrors.push(String(e.message).slice(0, 160)));
        await page.addInitScript(values => {
          if (sessionStorage.getItem("__seeded")) return;
          try { for (const [k, v] of Object.entries(values)) localStorage.setItem(k, v); sessionStorage.setItem("__seeded", "1"); } catch (e) { /* blocked */ }
        }, seedStorage(kind));
        await page.goto(url);
        await page.waitForFunction(() => typeof showNewRunConfirm === "function" && !document.getElementById("title-screen").classList.contains("hidden"));
        const hit = async selector => { if (touch) await page.locator(selector).tap(); else await page.locator(selector).click(); };
        return { context, page, pageErrors, hit };
      };

      // ---------- A: filled, unreadable, empty ----------
      {
        const { context, page, pageErrors, hit } = await open("A");
        const title = await page.evaluate(MEASURE);
        if (title.open) fail("A: the picker is open on arrival");
        if (title.docOverflow > 0 || title.bodyOverflow > 0) fail(`A: title scrolls sideways (${title.docOverflow}/${title.bodyOverflow}px)`);
        const stored = await storageOf(page);
        await page.evaluate(() => document.getElementById("btn-begin").scrollIntoView({ block: "nearest" }));
        await hit("#btn-begin");
        const m = await page.evaluate(MEASURE);
        if (!m.open) { fail("A: New run did not open the picker"); await context.close(); continue; }
        if (m.selected !== 3) fail(`A: the picker opened on slot ${m.selected}, not the first empty slot 3`);
        if (m.focus !== "new-run-slot-3") fail(`A: focus on open is ${m.focus}, not slot 3's radio`);
        if (m.ok !== "Start in Slot 3" || m.okDisabled) fail(`A: Start reads ${JSON.stringify(m.ok)} (disabled ${m.okDisabled})`);
        if (m.resumeInColumn == null || Math.abs(m.resumeInColumn - title.resumeInColumn) > 0.5) fail(`A: opening the picker moved Continue in the title column (${title.resumeInColumn} -> ${m.resumeInColumn})`);
        const p = m.panelRect;
        if (!p || p.x < -0.5 || p.y < -0.5 || p.x + p.w > m.vw + 0.5 || p.y + p.h > m.vh + 0.5) fail(`A: panel leaves the viewport ${JSON.stringify(p)}`);
        if (m.docOverflow > 0 || m.bodyOverflow > 0) fail(`A: page scrolls sideways with the picker open (${m.docOverflow}/${m.bodyOverflow}px)`);
        if (m.panelOverflowX > 0) fail(`A: panel scrolls sideways (${m.panelOverflowX}px)`);
        // Hit-tests wait out the picker's 400ms of ignoring the pointer (.arming).
        await page.waitForFunction(() => !document.getElementById("new-run-confirm").classList.contains("arming"));
        const selectedShows = await page.evaluate(SELECTED_SHOWS);
        if (!selectedShows || !selectedShows.shows) fail(`A: the selected row is hidden on open (under the buttons?) ${JSON.stringify(selectedShows)}`);
        // Start and its line are on screen when the picker opens (sticky at short heights).
        for (const [label, r] of [["Start", m.okRect], ["the line above Start", m.chipRect]]) {
          if (!r || r.y < p.y - 0.5 || r.y + r.h > p.y + p.h + 0.5) fail(`A: ${label} is not inside the panel's visible area on open ${JSON.stringify(r)} in ${JSON.stringify(p)}`);
        }

        // Each row: tap it; the line and Start follow; rows and buttons are big enough and reachable.
        const expect = {
          1: ["New run replaces Slot 1 · Harbor. Your other slots stay as they are.", "Replace Slot 1"],
          2: ["New run replaces the unreadable save in Slot 2. To keep a copy, cancel and download it from Saved runs.", "Replace Slot 2"],
          3: ["Slot 3 is empty. Your other slots stay as they are.", "Start in Slot 3"]
        };
        let seen = 0;
        const chipHeights = [];
        for (const slot of [1, 2, 3]) {
          await page.evaluate(n => document.getElementById("new-run-row-" + n).scrollIntoView({ block: "nearest" }), slot);
          await hit(`#new-run-row-${slot}`);
          const s = await page.evaluate(MEASURE);
          if (s.selected !== slot) fail(`A: tapping row ${slot} selected ${s.selected}`);
          if (s.chip !== expect[slot][0] || s.ok !== expect[slot][1] || s.okDisabled) fail(`A: row ${slot} reads ${JSON.stringify([s.chip, s.ok, s.okDisabled])}`);
          chipHeights.push(s.chipRect ? Math.round(s.chipRect.h) : -1);
          for (const id of [`new-run-row-${slot}`, "new-run-cancel", "new-run-ok"]) {
            const t = await page.evaluate(TARGET, id);
            seen += 1;
            if (t.missing) { fail(`A: ${id} is not shown`); continue; }
            if (t.h < MIN_TARGET || t.w < MIN_TARGET) fail(`A: ${id} is ${Math.round(t.w)}x${Math.round(t.h)}, under ${MIN_TARGET}px`);
            if (t.left < p.x - 0.5 || t.right > p.x + p.w + 0.5) fail(`A: ${id} spills out of the panel sideways`);
            if (!t.reachable) fail(`A: ${id} cannot be hit at its centre once scrolled into view`);
          }
          const after = await page.evaluate(MEASURE);
          if (after.docOverflow > 0 || after.panelOverflowX > 0) fail(`A: row ${slot}: sideways scroll ${after.docOverflow}/${after.panelOverflowX}px`);
        }

        // The line keeps one height whichever row is selected, so the rows and buttons do not jump.
        if (new Set(chipHeights).size !== 1) fail(`A: the line above Start changes height with the selection (${chipHeights.join("/")}px), moving the rows`);

        // Keyboard: arrows move the selection and the line follows; Tab and Shift+Tab stay inside.
        await page.locator("#new-run-slot-3").focus();
        await page.keyboard.press("ArrowUp");
        const arrowed = await page.evaluate(MEASURE);
        if (arrowed.selected !== 2 || arrowed.focus !== "new-run-slot-2" || arrowed.ok !== "Replace Slot 2") fail(`A: ArrowUp gave ${JSON.stringify([arrowed.selected, arrowed.focus, arrowed.ok])}`);
        await page.keyboard.press("ArrowDown");
        const downShows = await page.evaluate(SELECTED_SHOWS);
        if (!downShows || downShows.slot !== 3 || !downShows.shows) fail(`A: ArrowDown to slot 3 left it hidden ${JSON.stringify(downShows)}`);
        await page.keyboard.press("ArrowUp");
        const stops = new Set();
        for (const key of ["Tab", "Tab", "Tab", "Tab", "Shift+Tab", "Shift+Tab", "Shift+Tab", "Shift+Tab"]) {
          await page.keyboard.press(key);
          const f = await page.evaluate(MEASURE);
          if (!f.focusInside) { fail(`A: ${key} left the picker for #${f.focus}`); break; }
          stops.add(f.focus);
        }
        for (const id of ["new-run-slot-2", "new-run-cancel", "new-run-ok"]) if (!stops.has(id)) fail(`A: Tab never reached ${id} (${[...stops].join(", ")})`);
        for (const id of ["new-run-slot-1", "new-run-slot-3"]) if (stops.has(id)) fail(`A: Tab stopped on ${id}; the rows are one stop`);

        // Escape: closed, focus on New run, nothing written.
        await page.keyboard.press("Escape");
        const closed = await page.evaluate(MEASURE);
        if (closed.open) fail("A: Escape did not close the picker");
        if (closed.focus !== "btn-begin") fail(`A: focus after Escape is ${closed.focus}, not New run`);
        if (JSON.stringify(await storageOf(page)) !== JSON.stringify(stored)) fail("A: opening and closing the picker changed storage");

        // Start on slot 3, then Begin run: slot 3 only, and Continue points at it.
        await hit("#btn-begin");
        await hit("#new-run-ok");
        const commander = await page.evaluate(MEASURE);
        if (!commander.commander) fail("A: Start did not open the Commander panel");
        if ((await storageOf(page)).sunsplitter_save_current_v1 !== "1") fail("A: the pointer moved before Begin run");
        await page.evaluate(() => document.getElementById("commander-create-ok").scrollIntoView({ block: "nearest" }));
        await hit("#commander-create-ok");
        await page.waitForFunction(() => typeof state !== "undefined" && state.scene === "wake" && !!localStorage.getItem("sunsplitter_save_v3_slot3"));
        const now = await storageOf(page);
        if (JSON.stringify(sliceOf(now, 1)) !== JSON.stringify(sliceOf(stored, 1))) fail("A: a run started in slot 3 changed slot 1");
        if (JSON.stringify(sliceOf(now, 2)) !== JSON.stringify(sliceOf(stored, 2))) fail("A: a run started in slot 3 changed slot 2's unreadable bytes");
        if (!now[LIVE[3]] || JSON.parse(now[LIVE[3]]).scene !== "wake") fail("A: slot 3 does not hold the new run");
        if (now.sunsplitter_save_current_v1 !== "3") fail(`A: Continue points at ${now.sunsplitter_save_current_v1}, not 3`);
        if (pageErrors.length) fail(`A: page errors: ${pageErrors.join(" | ")}`);
        summary.push(`${name} A: panel ${Math.round(p.w)}x${Math.round(p.h)}${m.panelScrolls ? " (scrolls inside)" : ""}; Start at y ${Math.round(m.okRect ? m.okRect.y : -1)}; ${seen} targets checked`);
        await context.close();
      }

      // ---------- C: a double tap (double click) on Start ----------
      // It opens the Commander panel and nothing more: the second tap must not press Begin run or pick
      // a seal in the panel that appears under it (review M1).
      {
        const { context, page, pageErrors, hit } = await open("A");
        const stored = await storageOf(page);
        await page.evaluate(() => document.getElementById("btn-begin").scrollIntoView({ block: "nearest" }));
        await hit("#btn-begin");
        await page.waitForTimeout(450); // the picker's own 400ms
        const okAt = await page.evaluate(() => { const b = document.getElementById("new-run-ok").getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 }; });
        if (touch) { await page.touchscreen.tap(okAt.x, okAt.y); await page.touchscreen.tap(okAt.x, okAt.y); }
        else await page.mouse.dblclick(okAt.x, okAt.y);
        await page.waitForTimeout(100);
        const dbl = await page.evaluate(() => ({
          commander: document.getElementById("commander-create").classList.contains("visible"),
          picker: document.getElementById("new-run-confirm").classList.contains("visible"),
          savedRuns: document.getElementById("saved-runs").classList.contains("visible"),
          game: !document.getElementById("game-screen").classList.contains("hidden"),
          seal: (document.querySelector('input[name="commander-seal"]:checked') || {}).value
        }));
        if (!dbl.commander || dbl.picker || dbl.savedRuns || dbl.game || dbl.seal !== "") fail(`C: a double ${touch ? "tap" : "click"} on Start did more than open the Commander panel ${JSON.stringify(dbl)}`);
        if (JSON.stringify(await storageOf(page)) !== JSON.stringify(stored)) fail(`C: a double ${touch ? "tap" : "click"} on Start wrote storage`);
        if (pageErrors.length) fail(`C: page errors: ${pageErrors.join(" | ")}`);
        summary.push(`${name} C: double ${touch ? "tap" : "click"} on Start opens the Commander panel only`);
        await context.close();
      }

      // ---------- B: all three filled ----------
      {
        const { context, page, pageErrors, hit } = await open("B");
        const stored = await storageOf(page);
        await page.evaluate(() => document.getElementById("btn-begin").scrollIntoView({ block: "nearest" }));
        await hit("#btn-begin");
        const m = await page.evaluate(MEASURE);
        if (!m.open) { fail("B: New run did not open the picker"); await context.close(); continue; }
        if (m.selected !== null) fail(`B: slot ${m.selected} is preselected with every slot in use`);
        if (!m.okDisabled || m.ok !== "Choose a slot") fail(`B: Start reads ${JSON.stringify(m.ok)} (disabled ${m.okDisabled})`);
        if (m.chip !== "All three slots hold a run. Choose the one to replace.") fail(`B: line reads ${JSON.stringify(m.chip)}`);
        if (m.focus !== "new-run-slot-1") fail(`B: focus on open is ${m.focus}, not the first row`);
        await page.locator("#new-run-ok").click({ force: true, timeout: 2000 }).catch(() => {});
        const still = await page.evaluate(MEASURE);
        if (!still.open || still.commander || JSON.stringify(await storageOf(page)) !== JSON.stringify(stored)) fail("B: the disabled Start did something");
        await page.evaluate(() => document.getElementById("new-run-row-2").scrollIntoView({ block: "nearest" }));
        await hit("#new-run-row-2");
        const picked = await page.evaluate(MEASURE);
        if (picked.selected !== 2 || picked.okDisabled || picked.ok !== "Replace Slot 2") fail(`B: picking slot 2 gave ${JSON.stringify([picked.selected, picked.ok, picked.okDisabled])}`);
        if (picked.chip !== "New run replaces Slot 2 · Beacon. Your other slots stay as they are.") fail(`B: line reads ${JSON.stringify(picked.chip)}`);
        await hit("#new-run-ok");
        await page.evaluate(() => document.getElementById("commander-create-ok").scrollIntoView({ block: "nearest" }));
        await hit("#commander-create-ok");
        await page.waitForFunction(() => typeof state !== "undefined" && state.scene === "wake");
        const now = await storageOf(page);
        if (JSON.stringify(sliceOf(now, 1)) !== JSON.stringify(sliceOf(stored, 1))) fail("B: replacing slot 2 changed slot 1");
        if (JSON.stringify(sliceOf(now, 3)) !== JSON.stringify(sliceOf(stored, 3))) fail("B: replacing slot 2 changed slot 3");
        if (JSON.parse(now[LIVE[2]]).scene !== "wake") fail("B: slot 2 does not hold the new run");
        if (now.sunsplitter_save_current_v1 !== "2") fail(`B: Continue points at ${now.sunsplitter_save_current_v1}, not 2`);
        if (pageErrors.length) fail(`B: page errors: ${pageErrors.join(" | ")}`);
        summary.push(`${name} B: no default, Start disabled until a pick; slot 2 replaced only`);
        await context.close();
      }
    }
  } finally {
    await browser.close();
    server.close();
  }
  return true;
}

export async function sunPlayerflowNewRunSlotLayoutChecks({ requireBrowser = false } = {}) {
  const errors = [];
  const summary = [];
  const ran = await browserChecks(errors, summary, requireBrowser);
  return { errors, summary, ran };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const { errors, summary, ran } = await sunPlayerflowNewRunSlotLayoutChecks({ requireBrowser: process.argv.includes("--require-browser") });
  for (const line of summary) console.log(line);
  if (errors.length) {
    console.error("FAIL sun-playerflow-new-run-slot-layout");
    for (const line of errors.slice(0, 60)) console.error("FAIL " + line);
    process.exit(1);
  }
  console.log(ran
    ? "PASS sun-playerflow-new-run-slot-layout (360x640, 390x844, 844x390 and 1440x900: fits with internal scroll, Start on screen, no sideways scroll, rows hold still, targets >= 44px and reachable, Continue unmoved, default slot, line and Start follow the selection, focus trap, Escape, double tap on Start, slot written only on Begin run; all-full: no default, disabled Start)"
    : "PASS sun-playerflow-new-run-slot-layout (browser NOT_AVAILABLE; nothing measured)");
}
