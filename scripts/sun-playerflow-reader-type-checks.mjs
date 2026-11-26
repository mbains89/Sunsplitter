// SUN-READER-TYPE-01 — reader settings "Size" and "Spacing" (Wave 2 design WS6 §6-8, T1).
//
// Two title-screen cycling buttons, each with a role=status chip, like "Text: paced". The value
// lives in this browser only (localStorage, with a session value that wins when storage throws),
// is applied as data-text-size / data-line-spacing on <html>, and scales the reading surfaces
// only (css/reader-settings.css). It never enters run state, the save or an export.
//
//   A. headless (the real engine in scripts/simulate.mjs): defaults, cycle order and wrap, the
//      title controls, persistence into a fresh load, throwing storage, unknown stored values,
//      and no change to snapshotState(), the save or the export;
//   B. source: the stylesheet is linked last and scales only the reading surfaces; the buttons sit
//      in the title's "Reader settings" group and not in the in-run bar (it is full); the dead
//      1.08rem desktop rule is gone (D5a, 2026-11-25); the sticky Read on keeps its 160px floor;
//   C. Chromium, when Playwright is installed (CI has no browser, so C reports NOT_AVAILABLE
//      there; pass --require-browser to fail instead): at 360x640, 390x844, 640x360, 844x390,
//      1280x720 and 1440x900, the standard setting computes exactly what the page computes without
//      css/reader-settings.css; and for every size x spacing combination on three scenes: no
//      horizontal overflow, the status bar, meta bar and plate unchanged from standard, the last
//      choice scrolled to and hit-testable, and a pending Read on either in normal flow or sticky
//      with at least three of the scene's lines above it.
import { readFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { createServer } from "node:http";
import { execSync } from "node:child_process";
import { createRequire } from "node:module";
import { dirname, extname, join, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { loadGame, readEngineSource } from "./simulate.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SIZE_KEY = "sunsplitter_text_size_v1";
const SPACING_KEY = "sunsplitter_line_spacing_v1";
const SIZES = ["standard", "large", "larger", "largest"];
const SPACINGS = ["standard", "relaxed", "open"];
const SIZE_FACTOR = { standard: 1, large: 1.15, larger: 1.3, largest: 1.5 };
const SPACING_FACTOR = { standard: 1, relaxed: 1.13, open: 1.28 };
const SIZE_CHIPS = {
  standard: "Standard · story and choices at your browser's text size",
  large: "Large · story and choices a step up",
  larger: "Larger · two steps up",
  largest: "Largest · three steps up"
};
const SPACING_CHIPS = {
  standard: "Standard · lines as the game sets them",
  relaxed: "Relaxed · more room between lines",
  open: "Open · the most room between lines"
};
// css/style.css at a 16px root: [font-size rem, line-height factor or null].
const SURFACES = {
  ".scene-text": [1.02, 1.72],
  ".choice-btn": [1, 1.4],
  ".choice-reason": [0.72, null],
  ".ending-text": [1, 1.75],
  ".cinematic-caption": [1.1, 1.7]
};
const VIEWPORTS = [[360, 640], [390, 844], [640, 360], [844, 390], [1280, 720], [1440, 900]];
// The first screen; the screen with the most choices; one of the longest scenes, with a plate.
const SCENES = ["wake", "crew_walk", "act2_tether_sighting"];
const REVEAL_STICKY_FLOOR = 160;

// ---------- A. headless ----------
function headlessChecks(errors, summary) {
  const out = JSON.parse(loadGame(ROOT).evaluate(`JSON.stringify((() => {
    const o = {};
    const ui = () => [document.getElementById("btn-text-size").textContent, document.getElementById("text-size-chip").textContent,
      document.getElementById("btn-line-spacing").textContent, document.getElementById("line-spacing-chip").textContent];
    localStorage.clear();
    o.defaults = [readTextSize(), readLineSpacing()];
    syncReaderTypeControls(); o.defaultUi = ui();
    o.sizeCycle = []; for (let i = 0; i < 5; i++) o.sizeCycle.push(cycleTextSize());
    o.spacingCycle = []; for (let i = 0; i < 4; i++) o.spacingCycle.push(cycleLineSpacing());
    o.uis = {};
    for (const size of ${JSON.stringify(SIZES)}) { setTextSize(size); o.uis["size:" + size] = ui(); }
    for (const spacing of ${JSON.stringify(SPACINGS)}) { setLineSpacing(spacing); o.uis["spacing:" + spacing] = ui(); }
    setTextSize("larger"); setLineSpacing("relaxed");
    o.stored = [localStorage.getItem(${JSON.stringify(SIZE_KEY)}), localStorage.getItem(${JSON.stringify(SPACING_KEY)})];
    o.bogusSet = [setTextSize("huge"), setLineSpacing(7)];
    // <html> gets the attributes; standard removes them.
    document.documentElement = document.createElement("html");
    setTextSize("largest"); setLineSpacing("open");
    o.attrsOn = [document.documentElement.getAttribute("data-text-size"), document.documentElement.getAttribute("data-line-spacing")];
    setTextSize("standard"); setLineSpacing("standard");
    o.attrsOff = [document.documentElement.getAttribute("data-text-size"), document.documentElement.getAttribute("data-line-spacing")];
    // storage that throws on write: the cycle still holds for the session
    const realSet = localStorage.setItem, realGet = localStorage.getItem;
    localStorage.setItem = () => { throw new Error("blocked"); };
    let threw = false;
    try { o.blocked = [cycleTextSize(), cycleTextSize(), cycleLineSpacing()]; } catch (e) { threw = true; }
    o.blockedThrew = threw; o.blockedReads = [readTextSize(), readLineSpacing()]; o.blockedUi = ui();
    localStorage.setItem = realSet;
    return o;
  })())`));
  const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  if (!eq(out.defaults, ["standard", "standard"])) errors.push(`A: defaults are ${JSON.stringify(out.defaults)}, want standard/standard`);
  if (!eq(out.defaultUi, ["Size: standard", SIZE_CHIPS.standard, "Spacing: standard", SPACING_CHIPS.standard])) errors.push(`A: default controls read ${JSON.stringify(out.defaultUi)}`);
  if (!eq(out.sizeCycle, ["large", "larger", "largest", "standard", "large"])) errors.push(`A: size cycle is ${out.sizeCycle.join(" > ")}`);
  if (!eq(out.spacingCycle, ["relaxed", "open", "standard", "relaxed"])) errors.push(`A: spacing cycle is ${out.spacingCycle.join(" > ")}`);
  for (const size of SIZES) {
    const got = out.uis["size:" + size];
    if (got[0] !== `Size: ${size}` || got[1] !== SIZE_CHIPS[size]) errors.push(`A: at size ${size} the controls read ${JSON.stringify(got.slice(0, 2))}`);
  }
  for (const spacing of SPACINGS) {
    const got = out.uis["spacing:" + spacing];
    if (got[2] !== `Spacing: ${spacing}` || got[3] !== SPACING_CHIPS[spacing]) errors.push(`A: at spacing ${spacing} the controls read ${JSON.stringify(got.slice(2))}`);
  }
  if (!eq(out.stored, ["larger", "relaxed"])) errors.push(`A: stored values are ${JSON.stringify(out.stored)}`);
  if (!eq(out.bogusSet, ["standard", "standard"])) errors.push(`A: setting an unknown step gave ${JSON.stringify(out.bogusSet)}, want standard`);
  if (!eq(out.attrsOn, ["largest", "open"])) errors.push(`A: <html> attributes are ${JSON.stringify(out.attrsOn)} at largest/open`);
  if (!eq(out.attrsOff, [null, null])) errors.push(`A: standard must remove the <html> attributes (got ${JSON.stringify(out.attrsOff)})`);
  if (out.blockedThrew || !eq(out.blocked, ["large", "larger", "relaxed"]) || !eq(out.blockedReads, ["larger", "relaxed"])
    || out.blockedUi[0] !== "Size: larger" || out.blockedUi[2] !== "Spacing: relaxed") {
    errors.push(`A: with storage blocked the cycle must still hold for the session (got ${JSON.stringify(out)})`);
  }

  // A fresh load reads what was stored; unknown values and a throwing read are standard.
  const cases = [
    [["largest", "open"], ["largest", "open"]], [["large", "relaxed"], ["large", "relaxed"]],
    [["Largest", "OPEN"], ["standard", "standard"]], [["1.5", "2"], ["standard", "standard"]],
    [["", "__proto__"], ["standard", "standard"]], [[null, null], ["standard", "standard"]]
  ];
  for (const [stored, want] of cases) {
    const got = JSON.parse(loadGame(ROOT).evaluate(`(() => {
      localStorage.clear();
      ${stored[0] === null ? "" : `localStorage.setItem(${JSON.stringify(SIZE_KEY)}, ${JSON.stringify(stored[0])});`}
      ${stored[1] === null ? "" : `localStorage.setItem(${JSON.stringify(SPACING_KEY)}, ${JSON.stringify(stored[1])});`}
      syncReaderTypeControls();
      return JSON.stringify([readTextSize(), readLineSpacing(), document.getElementById("btn-text-size").textContent]);
    })()`));
    if (got[0] !== want[0] || got[1] !== want[1] || got[2] !== `Size: ${want[0]}`) errors.push(`A: stored ${JSON.stringify(stored)} read as ${JSON.stringify(got)}, want ${JSON.stringify(want)}`);
  }
  const throwing = JSON.parse(loadGame(ROOT).evaluate(`(() => {
    localStorage.getItem = () => { throw new Error("blocked"); };
    localStorage.setItem = () => { throw new Error("blocked"); };
    const before = [readTextSize(), readLineSpacing()];
    return JSON.stringify([...before, cycleTextSize(), readTextSize()]);
  })()`));
  if (JSON.stringify(throwing) !== JSON.stringify(["standard", "standard", "large", "large"])) errors.push(`A: storage that throws on read must give standard and still cycle (got ${JSON.stringify(throwing)})`);

  // Never in the run state, the save or the export.
  const saved = JSON.parse(loadGame(ROOT).evaluate(`JSON.stringify((() => {
    const strip = text => { const o = JSON.parse(text); delete o.savedAt; return JSON.stringify(o); };
    localStorage.clear();
    resetRunState();
    showScene("wake");
    persistSave({ silent: true });
    const before = { snapshot: JSON.stringify(snapshotState()), save: strip(localStorage.getItem(SAVE_KEY)), exported: strip(buildSaveExport().text), state: Object.keys(state).join(",") };
    setTextSize("largest"); setLineSpacing("open");
    persistSave({ silent: true });
    const after = { snapshot: JSON.stringify(snapshotState()), save: strip(localStorage.getItem(SAVE_KEY)), exported: strip(buildSaveExport().text), state: Object.keys(state).join(",") };
    return { before, after };
  })())`));
  for (const name of ["snapshot", "save", "exported", "state"]) {
    if (saved.before[name] !== saved.after[name]) errors.push(`A: the setting changed the ${name}`);
    if (/text_?size|line_?spacing|largest|readerSize|reader-size/i.test(saved.after[name])) errors.push(`A: the setting leaked into the ${name}`);
  }
  const stateSrc = readFileSync(resolve(ROOT, "src/state.js"), "utf8");
  if (/text_size|line_spacing|textSize|lineSpacing/.test(stateSrc)) errors.push("A: src/state.js must not name the reader settings (they are not run state)");
  summary.push(`A: defaults standard; size cycles ${SIZES.join(" > ")} and wraps, spacing ${SPACINGS.join(" > ")} and wraps; a fresh load reads what was stored; ${cases.length} stored values read as expected; blocked storage still cycles for the session; snapshot, save and export unchanged`);
}

// ---------- B. source ----------
function sourceChecks(errors) {
  const index = readFileSync(resolve(ROOT, "index.html"), "utf8");
  const style = readFileSync(resolve(ROOT, "css/style.css"), "utf8");
  const reader = readFileSync(resolve(ROOT, "css/reader-settings.css"), "utf8");
  const engine = readEngineSource(ROOT);
  const links = [...index.matchAll(/<link rel="stylesheet" href="([^"]+)">/g)].map(m => m[1]);
  if (links[links.length - 1] !== "css/reader-settings.css") errors.push(`B: css/reader-settings.css must be the last stylesheet (last is ${links[links.length - 1]})`);
  const group = index.match(/<div class="reader-settings-actions" role="group" aria-label="Reader settings">([\s\S]*?)<\/div>/)?.[1] || "";
  const order = ["text-pace-chip", "btn-text-pace", "text-size-chip", "btn-text-size", "line-spacing-chip", "btn-line-spacing"].map(id => group.indexOf(`id="${id}"`));
  if (order.some(i => i < 0) || order.some((i, n) => n && i < order[n - 1])) errors.push("B: the Reader settings group must hold text pace, then size, then spacing, each chip before its button");
  for (const [id, fn, chip] of [["btn-text-size", "cycleTextSize()", "text-size-chip"], ["btn-line-spacing", "cycleLineSpacing()", "line-spacing-chip"]]) {
    const tag = index.match(new RegExp(`<button id="${id}"[^>]*>`))?.[0] || "";
    if (!tag.includes('type="button"') || !tag.includes(`onclick="${fn}"`) || !tag.includes(`aria-describedby="${chip}"`)) errors.push(`B: ${id} must be a native button calling ${fn}, described by #${chip}`);
    if (tag.includes("aria-pressed")) errors.push(`B: ${id} cycles; it carries no pressed state`);
    if (!new RegExp(`id="${chip}"[^>]*role="status"`).test(index)) errors.push(`B: #${chip} must be a role=status chip`);
  }
  if (!index.includes(`>${SIZE_CHIPS.standard}</p>`) || !index.includes(`>${SPACING_CHIPS.standard}</p>`)) errors.push("B: the chips' markup must start at the standard strings");
  const meta = index.match(/<div class="meta-actions">[\s\S]*?<\/div>/)?.[0] || "";
  if (/text-size|line-spacing|TextSize|LineSpacing/.test(meta)) errors.push("B: the in-run bar is full; size and spacing go in the Menu sheet (T2), not the bar");
  if (/1\.08rem/.test(style)) errors.push("B: the dead 1.08rem desktop scene-text rule must be gone (D5a, 2026-11-25)");
  for (const [selector, [rem, leading]] of Object.entries(SURFACES)) {
    const body = reader.match(new RegExp(`(?:^|\\n)${selector.replace(".", "\\.")}\\s*\\{([^}]*)\\}`))?.[1] || "";
    if (!body.includes(`font-size: calc(${rem}rem * var(--reader-size))`)) errors.push(`B: ${selector} must scale its ${rem}rem by --reader-size`);
    if (leading && !body.includes(`line-height: calc(${leading} * var(--reader-leading))`)) errors.push(`B: ${selector} must scale its ${leading} leading by --reader-leading`);
  }
  for (const chrome of ["#status", "#meta", "#reveal-controls", ".stat-value", "#crew-panel", ".choice-effects", ".text-pace-chip", ".btn {"]) {
    if (new RegExp(`${chrome.replace(/[.*+?^${}()|[\]\\#]/g, "\\$&")}[^{]*\\{[^}]*var\\(--reader-`).test(reader)) errors.push(`B: ${chrome} is chrome and must not scale`);
  }
  if (!/REVEAL_STICKY_MIN_HEIGHT\s*=\s*160\b/.test(engine)) errors.push("B: the sticky Read on keeps its 160px floor");
  if (!/Math\.max\(REVEAL_STICKY_MIN_HEIGHT,/.test(engine)) errors.push("B: the sticky threshold must never drop below REVEAL_STICKY_MIN_HEIGHT");
}

// ---------- C. Chromium ----------
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

// In the page: the computed size and leading of every reading surface. .choice-reason is only in
// a locked choice, so a probe reason is added to the first choice and removed again.
const MEASURE = `(() => {
  const btn = document.querySelector("#choices .choice-btn");
  const probe = document.createElement("span"); probe.className = "choice-reason"; probe.textContent = "probe";
  if (btn) btn.appendChild(probe);
  const els = { ".scene-text": document.querySelector("#story .scene-text"), ".choice-btn": btn, ".choice-reason": btn ? probe : null,
    ".ending-text": document.getElementById("ending-text"), ".cinematic-caption": document.querySelector(".cinematic-caption") };
  const out = {};
  for (const [name, el] of Object.entries(els)) { if (!el) { out[name] = null; continue; } const cs = getComputedStyle(el); out[name] = [cs.fontSize, cs.lineHeight]; }
  probe.remove();
  return out;
})()`;

async function browserChecks(errors, summary, requireBrowser) {
  const pw = await loadPlaywright();
  if (!pw) {
    const line = "C: NOT_AVAILABLE — Playwright is not installed here (CI has no browser); run this file where it is";
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
    const line = `C: NOT_AVAILABLE — Chromium did not launch (${String(error && error.message).split("\n")[0].slice(0, 120)})`;
    if (requireBrowser) errors.push(line); else summary.push(line);
    return;
  }
  let combos = 0, stickyChecked = 0, inFlow = 0, standardMinMain = Infinity;
  try {
    for (const [width, height] of VIEWPORTS) {
      const name = `${width}x${height}`;
      const context = await browser.newContext({ viewport: { width, height }, reducedMotion: "reduce" });
      const page = await context.newPage();
      const pageErrors = [];
      page.on("pageerror", e => pageErrors.push(String(e.message).slice(0, 160)));
      await page.addInitScript(() => { try { localStorage.setItem("sunsplitter_tone_ack_v1", "1"); } catch (e) { /* blocked */ } });
      await page.goto(url);
      await page.waitForFunction(() => typeof beginFreshCampaign === "function");
      // Into a run, past the intro, with paced text.
      await page.evaluate(() => { localStorage.setItem("sunsplitter_text_pace_v1", "paced"); persistSave = () => true; beginFreshCampaign({ persist: false }); showScreen("game"); renderStatus(); });

      // C1: at standard the page computes exactly what it computes without the stylesheet.
      await page.evaluate(() => showScene("wake"));
      const withSheet = await page.evaluate(MEASURE);
      const without = await page.evaluate(`(() => { const l = document.querySelector('link[href="css/reader-settings.css"]'); l.disabled = true; const m = ${MEASURE}; l.disabled = false; return m; })()`);
      for (const surface of Object.keys(SURFACES)) {
        if (!withSheet[surface]) { errors.push(`C ${name}: no ${surface} to measure`); continue; }
        if (JSON.stringify(withSheet[surface]) !== JSON.stringify(without[surface])) errors.push(`C ${name}: at standard ${surface} computes ${withSheet[surface]} but ${without[surface]} without the reader stylesheet`);
        const [rem, leading] = SURFACES[surface];
        const fs = parseFloat(withSheet[surface][0]);
        if (Math.abs(fs - rem * 16) > 0.01) errors.push(`C ${name}: at standard ${surface} is ${fs}px, today's is ${rem * 16}px`);
        if (leading && Math.abs(parseFloat(withSheet[surface][1]) - rem * 16 * leading) > 0.05) errors.push(`C ${name}: at standard ${surface} leading is ${withSheet[surface][1]}, today's is ${rem * 16 * leading}px`);
      }

      const baseline = {};
      for (const scene of SCENES) {
        for (const size of SIZES) {
          for (const spacing of SPACINGS) {
            combos++;
            const where = `C ${name} ${scene} ${size}/${spacing}`;
            const m = await page.evaluate(async ({ scene, size, spacing }) => {
              setTextSize(size); setLineSpacing(spacing);
              const main = document.getElementById("main");
              main.scrollTop = 0;
              document.getElementById("scene-image-wrap").classList.remove("minimized");
              showScene(scene);
              main.scrollTop = 0;
              await new Promise(r => setTimeout(r, 450)); // the plate's 0.28s grow-back and the ResizeObserver
              const rect = el => { if (!el || !el.getClientRects().length) return null; const b = el.getBoundingClientRect(); return [Math.round(b.left), Math.round(b.top), Math.round(b.width), Math.round(b.height)]; };
              const o = {};
              o.attrs = [document.documentElement.getAttribute("data-text-size"), document.documentElement.getAttribute("data-line-spacing")];
              o.docOverflow = document.documentElement.scrollWidth - document.documentElement.clientWidth;
              o.bodyOverflow = document.body.scrollWidth - document.body.clientWidth;
              o.mainOverflow = main.scrollWidth - main.clientWidth;
              o.status = rect(document.getElementById("status"));
              o.meta = rect(document.getElementById("meta"));
              const wrap = document.getElementById("scene-image-wrap");
              o.plate = wrap.classList.contains("visible") ? rect(wrap) : null;
              const text = document.querySelector("#story .scene-text");
              const cs = getComputedStyle(text);
              o.font = parseFloat(cs.fontSize); o.line = parseFloat(cs.lineHeight);
              const controls = document.getElementById("reveal-controls");
              o.pending = !!sceneReveal && !controls.classList.contains("hidden");
              if (o.pending) {
                o.sticky = getComputedStyle(controls).position === "sticky";
                o.roomy = main.classList.contains("reveal-roomy");
                o.mainH = main.clientHeight;
                // Where a stuck bar sits: above #main's bottom padding, at the bottom of its view. The
                // room above it is what the reader sees of the text while the bar is stuck there.
                o.pad = parseFloat(getComputedStyle(main).paddingBottom) || 0;
                o.bar = Math.round(controls.getBoundingClientRect().height);
                o.above = Math.round(main.clientHeight - o.pad - o.bar);
                main.scrollTop = 0;
                finishSceneReveal("setting");
              }
              // The last choice: scroll it into view and hit-test its centre.
              const buttons = [...document.querySelectorAll("#choices .choice-btn")];
              o.choices = buttons.length;
              const last = buttons[buttons.length - 1];
              if (last) {
                last.scrollIntoView({ block: "end" });
                await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
                const b = last.getBoundingClientRect();
                const x = Math.min(window.innerWidth - 1, Math.max(0, b.left + b.width / 2)), y = Math.min(window.innerHeight - 1, Math.max(0, b.top + Math.min(b.height / 2, 20)));
                const hit = document.elementFromPoint(x, y);
                o.lastReach = { inView: b.top >= -0.5 && b.top + 20 <= window.innerHeight, hit: !!hit && (hit === last || last.contains(hit)), right: Math.round(b.right), vw: window.innerWidth };
                o.lastOverflow = last.scrollWidth - last.clientWidth;
              }
              main.scrollTop = 0;
              return o;
            }, { scene, size, spacing });
            const wantAttrs = [size === "standard" ? null : size, spacing === "standard" ? null : spacing];
            if (JSON.stringify(m.attrs) !== JSON.stringify(wantAttrs)) errors.push(`${where}: <html> attributes ${JSON.stringify(m.attrs)}`);
            const wantFont = 1.02 * 16 * SIZE_FACTOR[size];
            if (Math.abs(m.font - wantFont) > 0.05) errors.push(`${where}: scene text ${m.font}px, want ${wantFont.toFixed(2)}px`);
            if (Math.abs(m.line - wantFont * 1.72 * SPACING_FACTOR[spacing]) > 0.1) errors.push(`${where}: scene leading ${m.line}px, want ${(wantFont * 1.72 * SPACING_FACTOR[spacing]).toFixed(2)}px`);
            if (m.docOverflow > 0 || m.bodyOverflow > 0 || m.mainOverflow > 0) errors.push(`${where}: horizontal overflow (document ${m.docOverflow}px, body ${m.bodyOverflow}px, #main ${m.mainOverflow}px)`);
            if (m.lastOverflow > 0) errors.push(`${where}: the last choice overflows by ${m.lastOverflow}px`);
            const key = scene;
            if (size === "standard" && spacing === "standard") baseline[key] = m;
            else {
              const base = baseline[key];
              for (const part of ["status", "meta", "plate"]) {
                if (JSON.stringify(m[part]) !== JSON.stringify(base[part])) errors.push(`${where}: ${part} rect ${JSON.stringify(m[part])} differs from standard ${JSON.stringify(base[part])}`);
              }
            }
            if (!m.choices) errors.push(`${where}: no choices rendered`);
            else if (!m.lastReach.inView || !m.lastReach.hit || m.lastReach.right > m.lastReach.vw) errors.push(`${where}: the last choice cannot be reached (${JSON.stringify(m.lastReach)})`);
            if (m.pending) {
              if (m.sticky !== m.roomy) errors.push(`${where}: Read on sticky=${m.sticky} but #main roomy=${m.roomy}`);
              if (size === "standard" && spacing === "standard") standardMinMain = Math.min(standardMinMain, m.mainH);
              if (m.sticky) {
                stickyChecked++;
                if (m.mainH < REVEAL_STICKY_FLOOR) errors.push(`${where}: sticky at #main ${m.mainH}px, under the ${REVEAL_STICKY_FLOOR}px floor`);
                if (m.above < 3 * m.line - 0.5) errors.push(`${where}: a stuck Read on leaves ${m.above}px above it (#main ${m.mainH}px, padding ${m.pad}px, bar ${m.bar}px), under three ${m.line.toFixed(1)}px lines`);
              } else inFlow++;
            }
          }
        }
      }
      // A setting changed on screen applies at once, and standard puts everything back.
      const live = await page.evaluate(() => {
        setTextSize("standard"); setLineSpacing("standard"); showScene("wake");
        const a = getComputedStyle(document.querySelector("#story .scene-text")).fontSize;
        cycleTextSize(); cycleTextSize(); cycleTextSize();
        const b = getComputedStyle(document.querySelector("#story .scene-text")).fontSize;
        cycleTextSize();
        const c = getComputedStyle(document.querySelector("#story .scene-text")).fontSize;
        return [a, b, c, document.documentElement.hasAttribute("data-text-size")];
      });
      if (live[0] !== "16.32px" || live[1] !== "24.48px" || live[2] !== "16.32px" || live[3]) errors.push(`C ${name}: cycling on screen gave ${JSON.stringify(live)}`);
      for (const e of pageErrors) errors.push(`C ${name}: page error ${e}`);
      await context.close();
    }

    // Stored before load: applied before the first screen, and the title controls say so.
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    await page.addInitScript(() => { try { localStorage.setItem("sunsplitter_tone_ack_v1", "1"); localStorage.setItem("sunsplitter_text_size_v1", "largest"); localStorage.setItem("sunsplitter_line_spacing_v1", "open"); } catch (e) { /* blocked */ } });
    await page.goto(url);
    const loaded = await page.evaluate(() => [document.documentElement.getAttribute("data-text-size"), document.documentElement.getAttribute("data-line-spacing"),
      document.getElementById("btn-text-size").textContent, document.getElementById("btn-line-spacing").textContent,
      document.documentElement.scrollWidth - document.documentElement.clientWidth, document.getElementById("main").scrollWidth - document.getElementById("main").clientWidth]);
    if (JSON.stringify(loaded) !== JSON.stringify(["largest", "open", "Size: largest", "Spacing: open", 0, 0])) errors.push(`C: a stored largest/open is not applied on load, or the title overflows (${JSON.stringify(loaded)})`);
    await context.close();
  } finally {
    await browser.close();
    server.close();
  }
  summary.push(`C: Chromium at ${VIEWPORTS.map(v => v.join("x")).join(", ")}: standard computes as without the stylesheet; ${combos} size x spacing x scene states with no overflow, bars and plate unchanged, the last choice reachable; ${stickyChecked} sticky Read on bars with three lines above, ${inFlow} in normal flow; at standard #main was never under ${standardMinMain}px`);
}

export async function sunPlayerflowReaderTypeChecks({ requireBrowser = false } = {}) {
  const errors = [];
  const summary = [];
  headlessChecks(errors, summary);
  sourceChecks(errors);
  await browserChecks(errors, summary, requireBrowser);
  return { errors, summary };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const { errors, summary } = await sunPlayerflowReaderTypeChecks({ requireBrowser: process.argv.includes("--require-browser") });
  for (const line of summary) console.log(line);
  if (errors.length) {
    console.error("FAIL sun-playerflow-reader-type");
    for (const line of errors.slice(0, 80)) console.error("FAIL " + line);
    if (errors.length > 80) console.error(`FAIL ... ${errors.length - 80} more`);
    process.exit(1);
  }
  console.log("PASS sun-playerflow-reader-type (size and spacing default to standard, cycle and wrap, persist per browser, survive blocked storage and never enter the save; standard computes as before)");
}
