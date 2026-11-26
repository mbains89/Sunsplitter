// SUN-READER-FONT-01 — reader setting "Font" (Wave 2 design WS6 §6-8, T3; D3(a), Manraj 2026-11-25,
// project doc claude/decisions/2026-11-25.md): OpenDyslexic, named as such, with no claim that it
// helps anyone read.
//
// One title-screen cycling button with a role=status chip, beside Size and Spacing. The value lives
// in this browser only (localStorage, with a session value that wins when storage throws), is
// applied as data-reading-font on <html>, and swaps the reading surfaces Size scales to the bundled
// OpenDyslexic Regular. It never enters run state, the save or an export.
//
//   A. the files: the bundled font and its licence are the upstream bytes (SHA-256 and git blob id
//      recorded below), the font is at most 200 KB, its naming table is the upstream one, and
//      fonts/ holds nothing else;
//   B. source: the @font-face (font-display: swap) is used only under data-reading-font, on the
//      Size surfaces only, with no added tracking and long words wrapping; nothing preloads or
//      loads it from script; the button sits in the title's "Reader settings" group after Spacing
//      and in the Menu sheet's after Spacing (#598's twin rows), never in the in-run bar; no
//      player-facing string says the typeface helps;
//   C. headless (the real engine): default, toggle, the title controls and their Menu sheet twins,
//      persistence into a fresh load, throwing storage, unknown stored values, and no change to
//      snapshot, save or export;
//   D. the private package built from HEAD carries both files byte for byte, records them as a
//      font and a licence, and its private server serves them as font/woff2 and text/plain;
//   E. Chromium, when Playwright is installed (CI has no browser, so E reports NOT_AVAILABLE
//      there; pass --require-browser to fail instead): with the setting off the browser never
//      requests the font through a whole tour of the reading surfaces, and turning it on from the
//      Menu sheet in a run fetches it once; with it on, the surfaces
//      compute OpenDyslexic, document.fonts.check() is true once it has loaded, chrome keeps its
//      own type, and at 360x640, 390x844, 844x390 and 1440x900, at every text size (spacing
//      standard and open), no scene, choice, cost tag, ending, What Remains or caption overflows
//      sideways, the last choice is reachable, and toggling on the title moves nothing below it.
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { execSync, spawn, spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, extname, join, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { brotliDecompressSync } from "node:zlib";
import { loadGame, readEngineSource } from "./simulate.mjs";
import { buildPrivatePackage, readCanonicalZip } from "./build-private-package.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const KEY = "sunsplitter_reading_font_v1";
const STEPS = ["standard", "opendyslexic"];
const BUTTONS = { standard: "Font: standard", opendyslexic: "Font: OpenDyslexic" };
const CHIPS = {
  standard: "Standard · the usual typeface",
  opendyslexic: "OpenDyslexic · on story and choices"
};

// Provenance. OpenDyslexic by Abbie Gonzalez, SIL Open Font License 1.1, Reserved Font Name
// "OpenDyslexic". Taken unmodified from the author's repository at
// https://github.com/antijingoist/opendyslexic, commit 1824da5c0e41dc3e13ffc7f3a636dcaf695d61b7
// (2025-08-11): compiled/OpenDyslexic-Regular.woff2 and OFL.txt. That repository's README says new
// sources live at forge.hackers.town/antijingoist/opendyslexic; this release is the one on GitHub.
// Shipped byte for byte (no subsetting, no conversion), so it is the Original Version under the
// OFL and keeps its name; the licence travels beside it.
const FONT = {
  path: "fonts/OpenDyslexic-Regular.woff2",
  bytes: 103336,
  sha256: "0441bc21071e42db57c217f93fbc48d3b55a2987c02814c94dc93621c42e8695",
  upstreamBlob: "4ee220be7e9b551ad100468bd08ba35f6f9fe2f8",
  maxBytes: 200 * 1024
};
const LICENSE = {
  path: "fonts/OFL.txt",
  bytes: 4453,
  sha256: "caafcccfb70fc72458fcbda812ec8f0a06cb300cbabb87eabbb30b946124394b",
  upstreamBlob: "bb867823f2408fb8d2b3af5cb118b4bc0cd61972"
};
// The upstream naming table (name IDs 1, 2, 4, 6 and the version string, 5).
const NAMES = { 1: "OpenDyslexic", 2: "Regular", 4: "OpenDyslexic Regular", 5: "Version 0.990;Glyphs 3.3.1 (3343)", 6: "OpenDyslexic-Regular" };
// The surfaces Size scales (css/reader-settings.css), and only those.
const SURFACES = [".scene-text", ".choice-btn", ".choice-reason", ".choice-effects", ".ending-text", ".cinematic-caption"];
const SELECTOR = '[data-reading-font="opendyslexic"]';
const VIEWPORTS = [[360, 640], [390, 844], [844, 390], [1440, 900]];
const SIZES = ["standard", "large", "larger", "largest"];
const SPACINGS = ["standard", "open"];
// The first screen; the screen with the most choices; long cost tags on every choice (Costs on);
// one of the longest scenes, with a plate.
const SCENES = ["wake", "crew_walk", "final_choice", "act2_tether_sighting"];
// No player-facing string may say or suggest that the typeface helps (D3(a)).
const CLAIM_WORDS = /\b(help|helps|helpful|easier|easy|improv\w*|better|aid|aids|assist\w*|clearer|faster|benefit\w*|proven|designed to help|recommended)\b/i;

const sha256 = data => createHash("sha256").update(data).digest("hex");
const gitBlobId = data => createHash("sha1").update(Buffer.concat([Buffer.from(`blob ${data.length}\0`), data])).digest("hex");

// WOFF2: the table directory, then one brotli stream; the name table is never transformed.
const WOFF2_TAGS = ["cmap", "head", "hhea", "hmtx", "maxp", "name", "OS/2", "post", "cvt ", "fpgm", "glyf", "loca", "prep", "CFF ", "VORG", "EBDT", "EBLC", "gasp", "hdmx", "kern", "LTSH", "PCLT", "VDMX", "vhea", "vmtx", "BASE", "GDEF", "GPOS", "GSUB", "EBSC", "JSTF", "MATH", "CBDT", "CBLC", "COLR", "CPAL", "SVG ", "sbix", "acnt", "avar", "bdat", "bloc", "bsln", "cvar", "fdsc", "feat", "fmtx", "fvar", "gvar", "hsty", "just", "lcar", "mort", "morx", "opbd", "prop", "trak", "Zapf", "Silf", "Glat", "Gloc", "Feat", "Sill"];
function woff2Names(data) {
  if (data.subarray(0, 4).toString("latin1") !== "wOF2") throw new Error("not a WOFF2 file");
  const numTables = data.readUInt16BE(12);
  const compressed = data.readUInt32BE(20);
  let p = 48;
  const base128 = () => { let v = 0; for (let i = 0; i < 5; i++) { const b = data[p++]; v = v * 128 + (b & 0x7f); if (!(b & 0x80)) return v; } throw new Error("bad UIntBase128"); };
  const tables = [];
  for (let i = 0; i < numTables; i++) {
    const flags = data[p++];
    const tag = (flags & 0x3f) === 63 ? data.subarray(p, (p += 4)).toString("latin1") : WOFF2_TAGS[flags & 0x3f];
    const original = base128();
    const transformed = tag === "glyf" || tag === "loca" ? (flags >> 6) === 0 : (flags >> 6) !== 0;
    tables.push({ tag, length: transformed ? base128() : original });
  }
  const stream = brotliDecompressSync(data.subarray(p, p + compressed));
  let offset = 0, name = null;
  for (const t of tables) { if (t.tag === "name") name = stream.subarray(offset, offset + t.length); offset += t.length; }
  if (!name) throw new Error("no name table");
  const names = {};
  const count = name.readUInt16BE(2), strings = name.readUInt16BE(4);
  for (let i = 0; i < count; i++) {
    const r = 6 + i * 12;
    if (name.readUInt16BE(r) !== 3 || name.readUInt16BE(r + 4) !== 0x409) continue; // Windows, en-US
    const id = name.readUInt16BE(r + 6), len = name.readUInt16BE(r + 8), at = strings + name.readUInt16BE(r + 10);
    let s = "";
    for (let k = 0; k + 1 < len; k += 2) s += String.fromCharCode(name.readUInt16BE(at + k));
    names[id] = s;
  }
  return names;
}

// ---------- A. the files ----------
function fileChecks(errors, summary) {
  const font = readFileSync(resolve(ROOT, FONT.path));
  const license = readFileSync(resolve(ROOT, LICENSE.path));
  if (font.length !== FONT.bytes || sha256(font) !== FONT.sha256) errors.push(`A: ${FONT.path} is ${font.length} bytes, SHA-256 ${sha256(font)}; recorded ${FONT.bytes} bytes, ${FONT.sha256}`);
  if (font.length > FONT.maxBytes) errors.push(`A: ${FONT.path} is ${font.length} bytes, over the ${FONT.maxBytes}-byte (200 KB) limit`);
  if (gitBlobId(font) !== FONT.upstreamBlob) errors.push(`A: ${FONT.path} is not the upstream file (git blob ${gitBlobId(font)}, upstream ${FONT.upstreamBlob})`);
  try {
    const names = woff2Names(font);
    for (const [id, want] of Object.entries(NAMES)) if (names[id] !== want) errors.push(`A: name ID ${id} reads ${JSON.stringify(names[id])}, upstream ${JSON.stringify(want)}`);
    if (!/Reserved Font Name OpenDyslexic/.test(names[13] || "")) errors.push("A: the font's own licence field (name ID 13) does not carry the OFL notice");
  } catch (error) {
    errors.push(`A: ${FONT.path} could not be read as WOFF2 (${error.message})`);
  }
  if (license.length !== LICENSE.bytes || sha256(license) !== LICENSE.sha256 || gitBlobId(license) !== LICENSE.upstreamBlob) errors.push(`A: ${LICENSE.path} is not the upstream licence (SHA-256 ${sha256(license)}, git blob ${gitBlobId(license)})`);
  const text = license.toString("utf8");
  for (const must of ["SIL OPEN FONT LICENSE Version 1.1", "with Reserved Font Name OpenDyslexic.", "Copyright (c) 2019-07-29, Abbie Gonzalez"]) {
    if (!text.includes(must)) errors.push(`A: ${LICENSE.path} lacks "${must}"`);
  }
  const extra = readdirSync(resolve(ROOT, "fonts")).filter(name => ![FONT.path, LICENSE.path].includes(`fonts/${name}`));
  if (extra.length) errors.push(`A: fonts/ holds only the Regular face and its licence (also found: ${extra.join(", ")})`);
  summary.push(`A: ${FONT.path} ${font.length} bytes (limit ${FONT.maxBytes}), SHA-256 ${sha256(font).slice(0, 16)}…, upstream blob ${FONT.upstreamBlob.slice(0, 10)}, named ${NAMES[4]} ${NAMES[5].split(";")[0]}; ${LICENSE.path} is the upstream OFL 1.1 text`);
}

// ---------- B. source ----------
function sourceChecks(errors) {
  const index = readFileSync(resolve(ROOT, "index.html"), "utf8");
  const reader = readFileSync(resolve(ROOT, "css/reader-settings.css"), "utf8");
  const engine = readEngineSource(ROOT);
  const face = reader.match(/@font-face\s*\{([^}]*)\}/)?.[1] || "";
  for (const want of ['font-family: "OpenDyslexic";', 'src: url("../fonts/OpenDyslexic-Regular.woff2") format("woff2");', "font-weight: 400;", "font-style: normal;", "font-display: swap;"]) {
    if (!face.includes(want)) errors.push(`B: the @font-face must declare ${want}`);
  }
  if ((reader.match(/@font-face/g) || []).length !== 1) errors.push("B: one @font-face, the Regular face only");
  // Every rule that names the family is scoped to the setting, and covers the Size surfaces only.
  const rules = [...reader.replace(/\/\*[\s\S]*?\*\//g, "").matchAll(/([^{}]+)\{([^}]*)\}/g)].map(m => ({ selectors: m[1].trim().split(/\s*,\s*/), body: m[2] }));
  const fontRules = rules.filter(rule => !rule.selectors[0].startsWith("@font-face") && /OpenDyslexic/.test(rule.body));
  if (fontRules.length !== 1) errors.push(`B: one rule applies the typeface (found ${fontRules.length})`);
  for (const rule of fontRules) {
    const scoped = rule.selectors.map(sel => sel.match(/^html\[data-reading-font="opendyslexic"\]\s+(\S+)$/)?.[1]);
    if (scoped.some(s => !s)) errors.push(`B: every selector that uses the typeface starts html${SELECTOR} (got ${rule.selectors.join(", ")})`);
    if (JSON.stringify([...scoped].sort()) !== JSON.stringify([...SURFACES].sort())) errors.push(`B: the typeface goes on the Size surfaces exactly (${SURFACES.join(", ")}); got ${scoped.join(", ")}`);
    if (!/font-family:\s*"OpenDyslexic",\s*var\(--font-ui\);/.test(rule.body)) errors.push("B: the typeface falls back to the game's own stack");
    if (!/letter-spacing:\s*normal;/.test(rule.body)) errors.push("B: no tracking on top of OpenDyslexic's wide letters");
    if (!/overflow-wrap:\s*break-word;/.test(rule.body)) errors.push("B: a word too long for its line wraps inside it");
  }
  for (const file of readdirSync(resolve(ROOT, "css"))) {
    if (file === "reader-settings.css") continue;
    if (/OpenDyslexic|fonts\//.test(readFileSync(resolve(ROOT, "css", file), "utf8"))) errors.push(`B: css/${file} must not name the reading font; it lives in css/reader-settings.css`);
  }
  if (/OpenDyslexic-Regular|fonts\/|rel="preload"/.test(index)) errors.push("B: index.html must not preload or link the font (a reader on standard downloads nothing)");
  if (/document\.fonts\.load\s*\(|new\s+FontFace\s*\(/.test(engine)) errors.push("B: the engine must not load the font from script");
  const group = index.match(/<div class="reader-settings-actions" role="group" aria-label="Reader settings">([\s\S]*?)<\/div>/)?.[1] || "";
  const order = ["btn-line-spacing", "reading-font-chip", "btn-reading-font"].map(id => group.indexOf(`id="${id}"`));
  if (order.some(i => i < 0) || order[1] < order[0] || order[2] < order[1]) errors.push("B: the Reader settings group holds the font chip and button after Spacing, chip first");
  const tag = index.match(/<button id="btn-reading-font"[^>]*>/)?.[0] || "";
  if (!tag.includes('type="button"') || !tag.includes('onclick="cycleReadingFont()"') || !tag.includes('aria-describedby="reading-font-chip"')) errors.push("B: btn-reading-font must be a native button calling cycleReadingFont(), described by #reading-font-chip");
  if (tag.includes("aria-pressed")) errors.push("B: btn-reading-font cycles; it carries no pressed state");
  if (!/id="reading-font-chip"[^>]*role="status"/.test(index)) errors.push("B: #reading-font-chip must be a role=status chip");
  if (!index.includes(`>${CHIPS.standard}</p>`) || !index.includes(`>${BUTTONS.standard}</button>`)) errors.push("B: the markup starts at the standard strings");
  const meta = index.match(/<div class="meta-actions">[\s\S]*?<\/div>/)?.[0] || "";
  if (/reading-font|ReadingFont/.test(meta)) errors.push("B: the in-run bar is full; the font goes in the Menu sheet (T2), not the bar");
  // In a run: the Menu sheet's Reader settings, after Spacing, as a twin of the title control (#598).
  const sheet = index.slice(index.indexOf('<section id="menu-sheet"'), index.indexOf("</section>", index.indexOf('<section id="menu-sheet"')));
  const sheetOrder = ["menu-line-spacing", "menu-reading-font", "menu-reading-font-chip"].map(id => sheet.indexOf(`id="${id}"`));
  if (sheetOrder.some(i => i < 0) || sheetOrder[1] < sheetOrder[0] || sheetOrder[2] < sheetOrder[1]) errors.push("B: the Menu sheet holds the font row after Spacing, button then chip, as its other rows");
  const sheetTag = sheet.match(/<button id="menu-reading-font"[^>]*>/)?.[0] || "";
  if (!sheetTag.includes('type="button"') || !sheetTag.includes(`onclick="menuSheetSetting('font')"`) || !sheetTag.includes('aria-describedby="menu-reading-font-chip"') || sheetTag.includes("aria-pressed")) errors.push("B: #menu-reading-font must be a native button calling menuSheetSetting('font'), described by its chip, with no pressed state");
  if (!/id="menu-reading-font-chip"[^>]*role="status"/.test(sheet) || !sheet.includes(`>${CHIPS.standard}</p>`) || !sheet.includes(`>${BUTTONS.standard}</button>`)) errors.push("B: the sheet's font chip is a role=status chip, and the row starts at the standard strings");
  const menuJs = readFileSync(resolve(ROOT, "src/menu-sheet.js"), "utf8");
  if (!menuJs.includes('["menu-reading-font", "btn-reading-font", "menu-reading-font-chip", "reading-font-chip"]')) errors.push("B: src/menu-sheet.js must mirror the font row from its title twin (MENU_SETTING_TWINS)");
  if (!/font:\s*\(\)\s*=>\s*cycleReadingFont\(\)/.test(menuJs)) errors.push("B: menuSheetSetting('font') must call cycleReadingFont()");
  for (const text of [...Object.values(CHIPS), ...Object.values(BUTTONS)]) {
    if (CLAIM_WORDS.test(text)) errors.push(`B: "${text}" reads as a claim that the typeface helps (D3(a): named, no claim)`);
  }
  // The chips are written out in the engine; the button reads "Font: " + the step's name (C checks it).
  for (const text of Object.values(CHIPS)) if (!engine.includes(`"${text}"`)) errors.push(`B: the engine does not carry the chip "${text}"`);
  const fontBlock = engine.slice(engine.indexOf("const READING_FONT_KEY"), engine.indexOf("let readingFontSession"));
  if (CLAIM_WORDS.test(fontBlock.replace(/\/\/[^\n]*/g, ""))) errors.push("B: a reading-font string in the engine reads as a claim that the typeface helps");
}

// ---------- C. headless ----------
function headlessChecks(errors, summary) {
  const out = JSON.parse(loadGame(ROOT).evaluate(`JSON.stringify((() => {
    const o = {};
    document.documentElement = document.createElement("html");
    const ui = () => [document.getElementById("btn-reading-font").textContent, document.getElementById("reading-font-chip").textContent];
    localStorage.clear();
    o.default = readReadingFont(); syncReaderTypeControls(); o.defaultUi = ui();
    o.cycle = []; o.attrs = []; o.uis = [];
    for (let i = 0; i < 3; i++) { o.cycle.push(cycleReadingFont()); o.attrs.push(document.documentElement.getAttribute("data-reading-font")); o.uis.push(ui()); }
    o.stored = localStorage.getItem(${JSON.stringify(KEY)});
    // The Menu sheet's twin: it toggles through the same setter and mirrors the title's strings.
    const sheetUi = () => [document.getElementById("menu-reading-font").textContent, document.getElementById("menu-reading-font-chip").textContent];
    o.sheet = [];
    for (let i = 0; i < 2; i++) { menuSheetSetting("font"); o.sheet.push([readReadingFont(), document.documentElement.getAttribute("data-reading-font"), ...sheetUi(), ...ui()]); }
    o.bogus = setReadingFont("OpenDyslexic");
    setTextSize("largest"); setLineSpacing("open"); setReadingFont("opendyslexic");
    o.together = ["data-text-size", "data-line-spacing", "data-reading-font"].map(a => document.documentElement.getAttribute(a));
    setTextSize("standard"); setLineSpacing("standard"); setReadingFont("standard");
    const realSet = localStorage.setItem;
    localStorage.setItem = () => { throw new Error("blocked"); };
    let threw = false;
    try { o.blocked = [cycleReadingFont(), readReadingFont(), ui()[0]]; } catch (e) { threw = true; }
    o.blockedThrew = threw;
    localStorage.setItem = realSet;
    return o;
  })())`));
  const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  if (out.default !== "standard" || !eq(out.defaultUi, [BUTTONS.standard, CHIPS.standard])) errors.push(`C: the default is ${out.default} reading ${JSON.stringify(out.defaultUi)}`);
  if (!eq(out.cycle, ["opendyslexic", "standard", "opendyslexic"])) errors.push(`C: the toggle runs ${out.cycle.join(" > ")}`);
  if (!eq(out.attrs, ["opendyslexic", null, "opendyslexic"])) errors.push(`C: <html> data-reading-font ran ${JSON.stringify(out.attrs)}; standard removes it`);
  if (!eq(out.uis, [[BUTTONS.opendyslexic, CHIPS.opendyslexic], [BUTTONS.standard, CHIPS.standard], [BUTTONS.opendyslexic, CHIPS.opendyslexic]])) errors.push(`C: the controls read ${JSON.stringify(out.uis)}`);
  if (out.stored !== "opendyslexic") errors.push(`C: the setting is stored as ${JSON.stringify(out.stored)} in ${KEY}`);
  const sheetWant = [["standard", null, BUTTONS.standard, CHIPS.standard, BUTTONS.standard, CHIPS.standard], ["opendyslexic", "opendyslexic", BUTTONS.opendyslexic, CHIPS.opendyslexic, BUTTONS.opendyslexic, CHIPS.opendyslexic]];
  if (!eq(out.sheet, sheetWant)) errors.push(`C: the Menu sheet's Font must toggle the setting and mirror the title (got ${JSON.stringify(out.sheet)})`);
  if (out.bogus !== "standard") errors.push(`C: setting an unknown value gave ${out.bogus}, want standard`);
  if (!eq(out.together, ["largest", "open", "opendyslexic"])) errors.push(`C: size, spacing and font must sit together on <html> (got ${JSON.stringify(out.together)})`);
  if (out.blockedThrew || !eq(out.blocked, ["opendyslexic", "opendyslexic", BUTTONS.opendyslexic])) errors.push(`C: with storage blocked the toggle still holds for the session (got ${JSON.stringify(out.blocked)})`);

  const cases = [["opendyslexic", "opendyslexic"], ["standard", "standard"], ["OpenDyslexic", "standard"], ["1", "standard"], ["", "standard"], ["__proto__", "standard"], [null, "standard"]];
  for (const [stored, want] of cases) {
    const got = JSON.parse(loadGame(ROOT).evaluate(`(() => {
      localStorage.clear();
      ${stored === null ? "" : `localStorage.setItem(${JSON.stringify(KEY)}, ${JSON.stringify(stored)});`}
      syncReaderTypeControls();
      return JSON.stringify([readReadingFont(), document.getElementById("btn-reading-font").textContent]);
    })()`));
    if (got[0] !== want || got[1] !== BUTTONS[want]) errors.push(`C: stored ${JSON.stringify(stored)} read as ${JSON.stringify(got)}, want ${want}`);
  }
  const throwing = JSON.parse(loadGame(ROOT).evaluate(`(() => {
    localStorage.getItem = () => { throw new Error("blocked"); };
    localStorage.setItem = () => { throw new Error("blocked"); };
    return JSON.stringify([readReadingFont(), cycleReadingFont(), readReadingFont()]);
  })()`));
  if (JSON.stringify(throwing) !== JSON.stringify(["standard", "opendyslexic", "opendyslexic"])) errors.push(`C: storage that throws on read gives standard and still toggles (got ${JSON.stringify(throwing)})`);

  const saved = JSON.parse(loadGame(ROOT).evaluate(`JSON.stringify((() => {
    const strip = text => { const o = JSON.parse(text); delete o.savedAt; return JSON.stringify(o); };
    localStorage.clear();
    resetRunState();
    showScene("wake");
    persistSave({ silent: true });
    const before = { snapshot: strip(JSON.stringify(snapshotState())), save: strip(localStorage.getItem(SAVE_KEY)), exported: strip(buildSaveExport().text), state: Object.keys(state).join(",") };
    setReadingFont("opendyslexic");
    persistSave({ silent: true });
    const after = { snapshot: strip(JSON.stringify(snapshotState())), save: strip(localStorage.getItem(SAVE_KEY)), exported: strip(buildSaveExport().text), state: Object.keys(state).join(",") };
    return { before, after };
  })())`));
  for (const name of ["snapshot", "save", "exported", "state"]) {
    if (saved.before[name] !== saved.after[name]) errors.push(`C: the setting changed the ${name}`);
    if (/reading_?font|readingFont|opendyslexic/i.test(saved.after[name])) errors.push(`C: the setting leaked into the ${name}`);
  }
  if (/reading_font|readingFont|opendyslexic/i.test(readFileSync(resolve(ROOT, "src/state.js"), "utf8"))) errors.push("C: src/state.js must not name the reading font (it is not run state)");
  summary.push(`C: default standard; the button toggles standard > opendyslexic and back, sets and removes data-reading-font and stores ${KEY}; the Menu sheet's twin toggles the same setting and mirrors the title; ${cases.length} stored values read as expected; blocked storage still toggles for the session; snapshot, save and export unchanged`);
}

// ---------- D. the private package ----------
function git(args) {
  const result = spawnSync("git", args, { cwd: ROOT, encoding: "utf8", env: { ...process.env, GIT_OPTIONAL_LOCKS: "0" } });
  if (result.status !== 0) throw new Error(`git ${args.join(" ")}: ${(result.stderr || result.stdout).trim()}`);
  return result.stdout.trim();
}

async function packageChecks(errors, summary) {
  const head = git(["rev-parse", "HEAD"]);
  for (const file of [FONT, LICENSE]) {
    let blob = null;
    try { blob = git(["rev-parse", `${head}:${file.path}`]); } catch { /* not committed */ }
    if (blob !== file.upstreamBlob) { errors.push(`D: HEAD ${head.slice(0, 8)} does not carry ${file.path} as committed upstream bytes (commit it first)`); return; }
  }
  const work = mkdtempSync(join(tmpdir(), "sun-reader-font-"));
  let server = null;
  try {
    const built = buildPrivatePackage({ sourceRef: head, outputPath: join(work, "pkg.zip"), root: ROOT });
    const entries = new Map(readCanonicalZip(readFileSync(built.outputPath)).map(entry => [entry.path, entry.data]));
    const manifest = JSON.parse(entries.get("PRIVATE_PACKAGE_MANIFEST.json").toString("utf8"));
    const payload = new Map(manifest.payloadFiles.map(file => [file.packagePath, file]));
    for (const [file, mime] of [[FONT, "font/woff2"], [LICENSE, "text/plain"], [{ path: "css/reader-settings.css" }, "text/css"]]) {
      const data = entries.get(file.path);
      if (!data) { errors.push(`D: the package lacks ${file.path}`); continue; }
      if (file.sha256 && sha256(data) !== file.sha256) errors.push(`D: the packaged ${file.path} is not the recorded bytes`);
      if (payload.get(file.path)?.mime !== mime) errors.push(`D: the manifest records ${file.path} as ${payload.get(file.path)?.mime}, want ${mime}`);
    }
    if (JSON.stringify(manifest.inventory.trackedFontFiles) !== JSON.stringify([FONT.path])) errors.push(`D: the inventory's font files are ${JSON.stringify(manifest.inventory.trackedFontFiles)}`);
    if (!manifest.inventory.trackedLicenseFiles.includes(LICENSE.path)) errors.push("D: the inventory does not record the font's licence");
    if (manifest.privateDrafts.sourceScan.inspectedTextPaths.includes(LICENSE.path)) errors.push("D: the licence is evidence, not runtime code; the network scan does not read it");
    const inventory = entries.get("PRIVATE_PACKAGE_INVENTORY.md").toString("utf8");
    if (!inventory.includes(`- \`${FONT.path}\``) || !inventory.includes(`- \`${LICENSE.path}\``)) errors.push("D: PRIVATE_PACKAGE_INVENTORY.md does not list the font and its licence");
    // Serve it the way a tester would, and fetch what the reading font needs.
    const dir = join(work, "unzipped");
    for (const [path, data] of entries) { mkdirSync(dirname(join(dir, path)), { recursive: true }); writeFileSync(join(dir, path), data); }
    server = spawn(process.execPath, [join(dir, "PRIVATE_PHONE_SERVER.mjs"), "--host", "127.0.0.1", "--port", "0", "--json"], { stdio: ["ignore", "pipe", "pipe"] });
    const ready = await new Promise((ok, fail) => {
      let out = "", err = "";
      const timer = setTimeout(() => fail(new Error(`server did not start: ${err.slice(0, 200)}`)), 15000);
      server.stdout.on("data", chunk => { out += chunk; const line = out.split("\n").find(l => l.startsWith("{")); if (line) { clearTimeout(timer); ok(JSON.parse(line)); } });
      server.stderr.on("data", chunk => { err += chunk; });
      server.once("exit", code => { clearTimeout(timer); fail(new Error(`server exited ${code}: ${err.slice(0, 200)}`)); });
    });
    const base = `http://127.0.0.1:${ready.port}/`;
    for (const [file, mime] of [[FONT, "font/woff2"], [LICENSE, "text/plain"]]) {
      const response = await fetch(new URL(file.path, base));
      const body = Buffer.from(await response.arrayBuffer());
      if (response.status !== 200 || !(response.headers.get("content-type") || "").startsWith(mime) || sha256(body) !== file.sha256) {
        errors.push(`D: the private server answers ${file.path} with ${response.status} ${response.headers.get("content-type")}, ${body.length} bytes; want 200 ${mime}, the recorded bytes`);
      }
    }
    const csp = (await fetch(base)).headers.get("content-security-policy") || "";
    if (!/font-src 'self'/.test(csp)) errors.push("D: the private server's policy must let the page load its own font");
    summary.push(`D: the private package built from ${head.slice(0, 8)} (${built.runtimeFiles} runtime files) carries ${FONT.path} and ${LICENSE.path} byte for byte, records them as font and licence, and its server answers them as font/woff2 and text/plain`);
  } finally {
    if (server && server.exitCode === null) server.kill("SIGTERM");
    rmSync(work, { recursive: true, force: true });
  }
}

// ---------- E. Chromium ----------
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

const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".jpg": "image/jpeg", ".png": "image/png", ".json": "application/json", ".woff2": "font/woff2", ".txt": "text/plain" };

// In the page: into a run, past the intro, Costs on.
const INTO_RUN = () => { persistSave = () => true; beginFreshCampaign({ persist: false }); showScreen("game"); renderStatus(); setShowCostsOnChoices(true); };

// Every reading surface on screen in turn: scenes (with a locked-choice reason probe), an ending,
// What Remains and the intro caption. Returns per-stop overflow and the computed families.
const TOUR = async ({ scenes, settle }) => {
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const over = el => el ? Math.max(0, el.scrollWidth - el.clientWidth) : 0;
  const page = () => Math.max(over(document.documentElement), over(document.body));
  const family = el => el ? getComputedStyle(el).fontFamily : null;
  const stops = [];
  for (const scene of scenes) {
    const main = document.getElementById("main");
    document.getElementById("scene-image-wrap").classList.remove("minimized");
    showScene(scene);
    if (typeof finishSceneReveal === "function") finishSceneReveal("setting");
    main.scrollTop = 0;
    await wait(settle);
    const buttons = [...document.querySelectorAll("#choices .choice-btn")];
    const probe = document.createElement("span"); probe.className = "choice-reason"; probe.textContent = "Needs 30 Supplies · probe";
    if (buttons[0]) buttons[0].appendChild(probe);
    const tags = [...document.querySelectorAll("#choices .choice-effects")];
    const text = document.querySelector("#story .scene-text");
    const o = { where: scene, page: page(), main: over(main), text: over(text), tags: tags.length,
      choice: Math.max(0, ...buttons.map(over), ...tags.map(t => Math.ceil(t.getBoundingClientRect().right - t.closest(".choice-btn").getBoundingClientRect().right))),
      families: { ".scene-text": family(text), ".choice-btn": family(buttons[0]), ".choice-reason": family(probe), ".choice-effects": family(tags[0]), ".choice-tag": family(document.querySelector("#choices .choice-tag")),
        "#status": family(document.getElementById("status")), "#meta button": family(document.querySelector("#meta button")), "#reveal-next": family(document.getElementById("reveal-next")) },
      spacing: text ? getComputedStyle(text).letterSpacing : null };
    probe.remove();
    const last = buttons[buttons.length - 1];
    if (last) {
      last.scrollIntoView({ block: "end" });
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
      const b = last.getBoundingClientRect();
      const hit = document.elementFromPoint(Math.min(innerWidth - 1, Math.max(0, b.left + b.width / 2)), Math.min(innerHeight - 1, Math.max(0, b.top + Math.min(b.height / 2, 20))));
      o.lastReach = b.top >= -0.5 && b.top + 20 <= innerHeight && b.right <= innerWidth && !!hit && (hit === last || last.contains(hit));
    } else o.lastReach = false;
    main.scrollTop = 0;
    stops.push(o);
  }
  resolveEnding();
  await wait(settle);
  const ending = document.getElementById("ending-text");
  stops.push({ where: "ending", page: page(), text: over(ending), screen: over(document.getElementById("ending-screen")), families: { ".ending-text": family(ending), ".ending-title": family(document.getElementById("ending-title")) } });
  showWhatRemains();
  await wait(settle);
  const remains = [document.getElementById("what-remains-text"), document.getElementById("what-remains-crew")];
  stops.push({ where: "what_remains", page: page(), text: Math.max(...remains.map(over)), screen: over(document.getElementById("what-remains-screen")), families: { ".ending-text": family(remains[0]) } });
  showCinematic("intro");
  await wait(settle);
  const caption = document.querySelector(".cinematic-caption");
  stops.push({ where: "cinematic", page: page(), text: over(caption), screen: over(document.getElementById("cinematic-body")), families: { ".cinematic-caption": family(caption), "#cinematic-heading": family(document.getElementById("cinematic-heading")) } });
  cancelCinematic();
  showScreen("game");
  return stops;
};

async function browserChecks(errors, summary, requireBrowser) {
  const pw = await loadPlaywright();
  if (!pw) {
    const line = "E: NOT_AVAILABLE — Playwright is not installed here (CI has no browser); run this file where it is";
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
    const line = `E: NOT_AVAILABLE — Chromium did not launch (${String(error && error.message).split("\n")[0].slice(0, 120)})`;
    if (requireBrowser) errors.push(line); else summary.push(line);
    return;
  }
  const isFont = family => typeof family === "string" && /^"?OpenDyslexic"?,/.test(family);
  const open = async (viewport, font) => {
    const context = await browser.newContext({ viewport, reducedMotion: "reduce" });
    const page = await context.newPage();
    const requests = [], pageErrors = [];
    page.on("request", r => requests.push(new URL(r.url()).pathname));
    page.on("pageerror", e => pageErrors.push(String(e.message).slice(0, 160)));
    await page.addInitScript(([key, value]) => { try { localStorage.setItem("sunsplitter_tone_ack_v1", "1"); localStorage.setItem("sunsplitter_text_pace_v1", "paced"); if (value) localStorage.setItem(key, value); } catch (e) { /* blocked */ } }, [KEY, font]);
    await page.goto(url);
    await page.waitForFunction(() => typeof beginFreshCampaign === "function");
    return { context, page, requests, pageErrors, fontRequests: () => requests.filter(p => /\/fonts\//.test(p)) };
  };
  let states = 0, stops = 0;
  try {
    // E1. Off: a whole tour of the reading surfaces at the largest size, and no request for the font.
    {
      const s = await open({ width: 390, height: 844 }, null);
      await s.page.evaluate(INTO_RUN);
      await s.page.evaluate(() => { setTextSize("largest"); setLineSpacing("open"); });
      const tour = await s.page.evaluate(TOUR, { scenes: SCENES, settle: 150 });
      const status = await s.page.evaluate(() => [...document.fonts].filter(f => f.family.replace(/"/g, "") === "OpenDyslexic").map(f => f.status));
      if (s.fontRequests().length) errors.push(`E1: with the setting off the browser requested ${s.fontRequests().join(", ")}`);
      if (JSON.stringify(status) !== JSON.stringify(["unloaded"])) errors.push(`E1: with the setting off the face is ${JSON.stringify(status)}, want one face, unloaded`);
      for (const stop of tour) for (const [surface, family] of Object.entries(stop.families)) if (isFont(family)) errors.push(`E1 ${stop.where}: ${surface} uses OpenDyslexic with the setting off`);
      // Turning it on in the run, from the Menu sheet, swaps the scene behind and fetches it once; the
      // sheet itself is chrome and keeps its type.
      await s.page.evaluate(() => { showScene("wake"); finishSceneReveal("setting"); });
      await s.page.click("#btn-menu");
      await s.page.click("#menu-reading-font");
      const sheet = await s.page.evaluate(() => [document.getElementById("menu-reading-font").textContent, document.getElementById("menu-reading-font-chip").textContent,
        document.getElementById("btn-reading-font").textContent, document.getElementById("menu-sheet").classList.contains("visible"), getComputedStyle(document.getElementById("menu-reading-font-chip")).fontFamily]);
      if (JSON.stringify(sheet.slice(0, 4)) !== JSON.stringify([BUTTONS.opendyslexic, CHIPS.opendyslexic, BUTTONS.opendyslexic, true]) || isFont(sheet[4])) errors.push(`E1: the Menu sheet's Font did not toggle, mirror and stay open, or the sheet changed type (${JSON.stringify(sheet)})`);
      await s.page.click("#menu-close");
      await s.page.evaluate(() => document.fonts.ready);
      const on = await s.page.evaluate(() => [getComputedStyle(document.querySelector("#story .scene-text")).fontFamily, document.fonts.check('16px "OpenDyslexic"')]);
      if (!isFont(on[0]) || !on[1] || s.fontRequests().length !== 1) errors.push(`E1: turning it on from the Menu sheet gave ${JSON.stringify(on)} with requests ${JSON.stringify(s.fontRequests())}`);
      for (const e of s.pageErrors) errors.push(`E1: page error ${e}`);
      await s.context.close();
    }

    // E2. On, stored before load: the surfaces compute OpenDyslexic, chrome keeps its type, the
    // font loads once, and document.fonts.check() is true. The title itself has no reading surface.
    {
      const s = await open({ width: 360, height: 640 }, "opendyslexic");
      const title = await s.page.evaluate(() => [document.documentElement.getAttribute("data-reading-font"), document.getElementById("btn-reading-font").textContent, document.getElementById("reading-font-chip").textContent, getComputedStyle(document.getElementById("reading-font-chip")).fontFamily]);
      if (JSON.stringify(title.slice(0, 3)) !== JSON.stringify(["opendyslexic", BUTTONS.opendyslexic, CHIPS.opendyslexic]) || isFont(title[3])) errors.push(`E2: a stored setting is not applied on load, or the title chip changed type (${JSON.stringify(title)})`);
      await s.page.evaluate(INTO_RUN);
      const tour = await s.page.evaluate(TOUR, { scenes: SCENES, settle: 150 });
      await s.page.evaluate(() => document.fonts.ready);
      const loaded = await s.page.evaluate(() => [document.fonts.check('16px "OpenDyslexic"'), [...document.fonts].filter(f => f.family.replace(/"/g, "") === "OpenDyslexic").map(f => f.status)]);
      if (!loaded[0] || JSON.stringify(loaded[1]) !== JSON.stringify(["loaded"])) errors.push(`E2: after load document.fonts.check() is ${loaded[0]} and the face is ${JSON.stringify(loaded[1])}`);
      if (JSON.stringify(s.fontRequests()) !== JSON.stringify([`/${FONT.path}`])) errors.push(`E2: font requests ${JSON.stringify(s.fontRequests())}, want the one file once`);
      const seen = new Set();
      for (const stop of tour) {
        for (const [surface, family] of Object.entries(stop.families)) {
          if (family === null) continue;
          const reading = SURFACES.includes(surface);
          if (reading) seen.add(surface);
          if (reading !== isFont(family)) errors.push(`E2 ${stop.where}: ${surface} computes ${family}; ${reading ? "a reading surface takes OpenDyslexic" : "chrome keeps its own type"}`);
        }
        if (stop.spacing && stop.spacing !== "normal") errors.push(`E2 ${stop.where}: scene text tracking is ${stop.spacing}`);
      }
      for (const surface of SURFACES) if (!seen.has(surface)) errors.push(`E2: the tour never showed ${surface}`);
      for (const e of s.pageErrors) errors.push(`E2: page error ${e}`);
      await s.context.close();
    }

    // E3. On, every viewport x size x spacing: nothing overflows sideways, the last choice is
    // reachable; and on the title, toggling moves nothing below the font button.
    for (const [width, height] of VIEWPORTS) {
      const name = `${width}x${height}`;
      const s = await open({ width, height }, null);
      const titleShift = await s.page.evaluate(() => {
        const below = document.getElementById("btn-cover-nudity"), chip = document.getElementById("reading-font-chip");
        const at = () => [Math.round(below.getBoundingClientRect().top), Math.round(chip.getBoundingClientRect().height)];
        const before = at(); cycleReadingFont(); const after = at();
        return { before, after, overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth };
      });
      if (titleShift.before[0] !== titleShift.after[0] || titleShift.before[1] !== titleShift.after[1] || titleShift.overflow > 0) errors.push(`E3 ${name}: toggling on the title moved what follows (cover-nudity top, chip height ${JSON.stringify(titleShift.before)} -> ${JSON.stringify(titleShift.after)}) or overflowed (${titleShift.overflow}px)`);
      await s.page.evaluate(INTO_RUN);
      await s.page.evaluate(() => document.fonts.load('16px "OpenDyslexic"')); // measure the swapped text, not the fallback
      for (const size of SIZES) {
        for (const spacing of SPACINGS) {
          states++;
          const where = `E3 ${name} ${size}/${spacing}`;
          await s.page.evaluate(([size, spacing]) => { setTextSize(size); setLineSpacing(spacing); }, [size, spacing]);
          const tour = await s.page.evaluate(TOUR, { scenes: SCENES, settle: 120 });
          for (const stop of tour) {
            stops++;
            if (stop.page > 0 || stop.main > 0 || stop.text > 0 || stop.screen > 0) errors.push(`${where} ${stop.where}: text overflows sideways (page ${stop.page}px, #main ${stop.main || 0}px, text ${stop.text}px, screen ${stop.screen || 0}px)`);
            if (stop.choice > 0) errors.push(`${where} ${stop.where}: a choice or its cost tag overflows by ${stop.choice}px`);
            if (stop.lastReach === false) errors.push(`${where} ${stop.where}: the last choice cannot be reached`);
            for (const surface of SURFACES) if (stop.families[surface] && !isFont(stop.families[surface])) errors.push(`${where} ${stop.where}: ${surface} is not in OpenDyslexic`);
          }
        }
      }
      for (const e of s.pageErrors) errors.push(`E3 ${name}: page error ${e}`);
      await s.context.close();
    }
  } finally {
    await browser.close();
    server.close();
  }
  summary.push(`E: Chromium: off, a tour of every reading surface at largest/open requested no font and left the face unloaded, and turning it on from the Menu sheet fetched it once; on, the six surfaces computed OpenDyslexic with no tracking while chrome kept its type, it loaded once and document.fonts.check() was true; at ${VIEWPORTS.map(v => v.join("x")).join(", ")}, ${states} size x spacing states (${stops} screens: scenes, an ending, What Remains, the intro caption) with no sideways overflow and the last choice reachable; toggling on the title moved nothing`);
}

export async function sunPlayerflowReaderFontChecks({ requireBrowser = false } = {}) {
  const errors = [];
  const summary = [];
  fileChecks(errors, summary);
  sourceChecks(errors);
  headlessChecks(errors, summary);
  await packageChecks(errors, summary);
  await browserChecks(errors, summary, requireBrowser);
  return { errors, summary };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const { errors, summary } = await sunPlayerflowReaderFontChecks({ requireBrowser: process.argv.includes("--require-browser") });
  for (const line of summary) console.log(line);
  if (errors.length) {
    console.error("FAIL sun-playerflow-reader-font");
    for (const line of errors.slice(0, 80)) console.error("FAIL " + line);
    if (errors.length > 80) console.error(`FAIL ... ${errors.length - 80} more`);
    process.exit(1);
  }
  console.log("PASS sun-playerflow-reader-font (OpenDyslexic Regular, the upstream bytes with its licence; off by default and never fetched while off; on, the reading surfaces only; per browser, never in the save; packaged and served with the right type)");
}
