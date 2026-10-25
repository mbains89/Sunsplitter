// SUN-CODEX-004: real browser focus/default button activation, not DOM shims.
// Requires Playwright; use CHROMIUM_PATH for an installed Chromium executable.
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { createRequire } from "node:module";
import { dirname, extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { after, afterEach, before, beforeEach, test } from "node:test";
const { chromium } = createRequire(import.meta.url)("playwright");

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".jpg": "image/jpeg" };
let server, browser, context, page, url;

before(async () => {
  server = createServer(async (req, res) => {
    const pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    const path = resolve(root, "." + (pathname === "/" ? "/index.html" : pathname));
    if (!path.startsWith(root + sep)) { res.writeHead(403).end(); return; }
    try {
      const body = await readFile(path);
      res.writeHead(200, { "Content-Type": types[extname(path)] || "application/octet-stream" }).end(body);
    } catch { res.writeHead(404).end(); }
  });
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  url = `http://127.0.0.1:${server.address().port}`;
  browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH, args: ["--no-sandbox"] });
});
after(async () => {
  await browser?.close();
  if (server) await new Promise(resolve => server.close(resolve));
});
beforeEach(async () => {
  context = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });
  page = await context.newPage();
  await page.goto(url);
  await page.getByRole("button", { name: "I understand — continue", exact: true }).click();
  await page.locator("#btn-begin").click();
  await page.locator("#commander-create-ok").click();
  await page.locator("#cinematic-skip").click();
  await page.locator("#tutorial-dismiss").click();
  assert.equal(await page.evaluate(() => state.scene), "wake");
  await page.locator("#btn-crew").click();
  await page.locator('#crew-panel [data-crew="elias"]').click();
});
afterEach(async () => { await context?.close(); });

const snapshot = () => page.evaluate(() => ({
  scene: state.scene, state: JSON.stringify(state), save: localStorage.getItem(SAVE_KEY)
}));
const focusInside = () => page.evaluate(() => document.getElementById("crew-sheet").contains(document.activeElement));
const sheetOpen = () => page.locator("#crew-sheet").evaluate(el => el.classList.contains("visible"));

test("six Tabs then Enter cannot commit or autosave an unseen wake choice", async () => {
  const before = await snapshot();
  const initialFocus = await focusInside();
  const tabFocus = [];
  for (let i = 0; i < 6; i++) {
    await page.keyboard.press("Tab");
    tabFocus.push(await focusInside());
  }
  await page.keyboard.press("Enter");
  const after = await snapshot();
  assert.equal(after.scene, "wake", "six Tabs + Enter must not commit a hidden gameplay choice");
  assert.deepEqual(after, before, "sheet navigation must preserve run and durable save bytes");
  assert.ok(initialFocus, "opening must move focus inside the sheet");
  assert.ok(tabFocus.every(Boolean), "Tab must stay inside the sheet");
});

test("initial focus and forward/reverse Tab stay inside the character sheet", async () => {
  assert.equal(await page.evaluate(() => document.activeElement.id), "crew-sheet-close");
  for (const key of ["Shift+Tab", "Tab", "Tab", "Shift+Tab"]) {
    await page.keyboard.press(key);
    assert.ok(await focusInside(), `${key} escaped the sheet`);
    assert.ok(await sheetOpen());
  }
});

test("number, Enter and Space shortcuts cannot act from sheet content", async () => {
  // Exercise Enter/Space's single-enabled-choice path as well as number keys.
  await page.evaluate(() => { closeCrewSheet(); showScene("time_pass"); openCrewSheet("elias"); });
  assert.equal(await page.locator("#choices button:enabled").count(), 1);
  const before = await snapshot();
  await page.locator("#crew-sheet-name").evaluate(el => { el.tabIndex = -1; el.focus(); });
  for (const key of ["1", "Enter", "Space"]) {
    await page.keyboard.press(key);
    const after = await snapshot();
    assert.equal(after.scene, before.scene, `${key} committed gameplay under the sheet`);
    assert.deepEqual(after, before, `${key} changed run or save bytes`);
    assert.ok(await sheetOpen());
  }
});

test("background controls cannot take focus; Back and Escape restore the selected crew chip", async () => {
  const before = await snapshot();
  await page.locator("#choices button").first().evaluate(el => el.focus());
  assert.ok(await focusInside(), "a background gameplay button accepted focus");
  await page.locator("#crew-sheet-close").click();
  assert.equal(await sheetOpen(), false);
  assert.equal(await page.evaluate(() => document.activeElement.dataset.crew), "elias");
  await page.locator('#crew-panel [data-crew="mira"]').click();
  await page.keyboard.press("Escape");
  assert.equal(await sheetOpen(), false);
  assert.equal(await page.evaluate(() => document.activeElement.dataset.crew), "mira");
  assert.ok(await page.locator("#crew-panel").evaluate(el => el.classList.contains("visible")));
  assert.deepEqual(await snapshot(), before);
  await page.locator("#btn-crew").click();
  await page.locator("#story").focus();
  await page.keyboard.press("1");
  assert.equal(await page.evaluate(() => state.scene), "intro_lena", "gameplay must resume after close");
});

test("closing restores background inert state without clearing pre-existing inert", async () => {
  await page.locator("#crew-sheet-close").click();
  await page.locator("#scene-image-wrap").evaluate(el => { el.inert = true; });
  await page.locator('#crew-panel [data-crew="amara"]').click();
  assert.ok(await page.locator("#main").evaluate(el => el.inert), "gameplay must be inert while sheet is open");
  await page.keyboard.press("Escape");
  assert.equal(await page.locator("#main").evaluate(el => el.inert), false);
  assert.equal(await page.locator("#crew-panel").evaluate(el => el.inert), false);
  assert.equal(await page.locator("#scene-image-wrap").evaluate(el => el.inert), true);
});
