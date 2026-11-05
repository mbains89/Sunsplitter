#!/usr/bin/env node
// SUN-BROWSER-BOT-01 — real-browser random full runs (manual tool; CI has no Playwright).
//
// Plays complete runs in Chromium the way a player does: title → commander → intro → story → ending →
// What Remains. Reports page errors, console errors, failed requests, broken plates, empty story,
// horizontal overflow, renders with no enabled choice, scene loops, and (with --chaos) drift after
// reloading mid-run and pressing Continue. Exits 1 when anything is found.
//
//   node scripts/sun-browser-bot.mjs [--runs 5] [--viewport desktop|phone] [--input mouse|keys|tab]
//                                    [--chaos] [--seed 1]   (--input touch also accepted)
//
//   --input keys  choices by digit keys, dialogs by focus + Enter
//   --input tab   every button reached by Tab only (keyboard-only evidence for ROADMAP §11 / 0.36)
//   --input touch every press is a tap (touch events)
//   --chaos       per choice: ~4% reload + Continue, ~3% open Crew, ~3% resize the viewport (phone/
//                 tablet/desktop/landscape sizes); state must survive each, and choices must stay on screen
//
// Playwright resolves from SUNSPLITTER_PLAYWRIGHT_MODULE (path to index.js), then `playwright`,
// then the global npm root.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { execSync } from "node:child_process";
import { createRequire } from "node:module";
import { dirname, extname, join, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const opt = (name, fallback) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : fallback; };
const RUNS = Number(opt("--runs", "5"));
const VIEWPORT = opt("--viewport", "desktop");
const INPUT = opt("--input", "mouse");
const CHAOS = args.includes("--chaos");
let seed = Number(opt("--seed", "1"));
const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
// Dev-server noise, not game defects: the manifest that only exists inside a built private package.
// Generic "Failed to load resource" console lines carry no URL; the response handler reports every
// failed request by URL instead, so those lines are dropped rather than double-counted.
const NOISE = /PRIVATE_PACKAGE_MANIFEST\.json|^Failed to load resource/;

async function loadPlaywright() {
  const candidates = [];
  if (process.env.SUNSPLITTER_PLAYWRIGHT_MODULE) candidates.push(pathToFileURL(resolve(process.env.SUNSPLITTER_PLAYWRIGHT_MODULE)).href);
  candidates.push("playwright");
  try { candidates.push(pathToFileURL(createRequire(join(execSync("npm root -g", { encoding: "utf8" }).trim(), "x")).resolve("playwright")).href); } catch {}
  for (const candidate of candidates) {
    try { const mod = await import(candidate); return mod.default || mod; } catch {}
  }
  throw new Error("Playwright not found; set SUNSPLITTER_PLAYWRIGHT_MODULE to its index.js");
}

const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".jpg": "image/jpeg", ".png": "image/png", ".json": "application/json", ".svg": "image/svg+xml", ".webp": "image/webp" };
const server = createServer(async (req, res) => {
  const path = resolve(ROOT, "." + decodeURIComponent(new URL(req.url, "http://x").pathname));
  if (!path.startsWith(ROOT + sep)) { res.writeHead(403); return res.end(); }
  try { const body = await readFile(path); res.writeHead(200, { "content-type": TYPES[extname(path)] || "application/octet-stream" }); res.end(body); }
  catch { res.writeHead(404); res.end(); }
});
await new Promise(ok => server.listen(0, "127.0.0.1", ok));
const base = `http://127.0.0.1:${server.address().port}/index.html`;

const { chromium, devices } = await loadPlaywright();
const browser = await chromium.launch();
const contextOptions = { ...(VIEWPORT === "phone" ? devices["Pixel 7"] : { viewport: { width: 1440, height: 900 } }), ...(INPUT === "touch" ? { hasTouch: true } : {}) };
const RESIZES = [{ width: 390, height: 844 }, { width: 844, height: 390 }, { width: 768, height: 1024 }, { width: 1024, height: 768 }, { width: 1280, height: 720 }, { width: 1920, height: 1080 }, { width: 720, height: 450 }];
const findings = new Map();
const note = (kind, detail) => { if (!NOISE.test(detail)) findings.set(`${kind} | ${detail}`, (findings.get(`${kind} | ${detail}`) || 0) + 1); };
const SNAPSHOT = () => JSON.stringify([state.scene, state.survivors, state.supplies, state.integrity, state.cohesion,
  state.dead.slice().sort(), document.getElementById("story").textContent.slice(0, 120)]);
const ORDER = ["new-run-confirm", "commander-create", "tutorial-overlay", "crew-sheet", "what-remains-screen",
  "ending-screen", "cinematic-screen", "game-screen", "title-screen", "tone-screen"];
let incomplete = 0;

for (let run = 0; run < RUNS; run++) {
  const context = await browser.newContext(contextOptions);
  const page = await context.newPage();
  let where = "?";
  page.on("console", m => { if (m.type() === "error") note("console", `${m.text().slice(0, 160)} @${where}`); });
  page.on("pageerror", e => note("pageerror", `${String(e.message).slice(0, 160)} @${where}`));
  page.on("response", r => { if (r.status() >= 400) note(`http${r.status()}`, r.url().replace(/^.*?:\d+\//, "")); });
  page.on("dialog", d => { note("dialog", d.message().slice(0, 80)); d.dismiss(); });
  await page.goto(base);
  const visible = id => page.evaluate(id => { const e = document.getElementById(id); if (!e) return false; const s = getComputedStyle(e); return !e.classList.contains("hidden") && s.display !== "none" && s.visibility !== "hidden" && e.getClientRects().length > 0; }, id);
  const press = async selector => {
    if (INPUT === "tab") {
      let reached = false;
      for (let t = 0; t < 40 && !reached; t++) {
        reached = await page.evaluate(s => document.activeElement === document.querySelector(s), selector);
        if (!reached) await page.keyboard.press("Tab");
      }
      if (!reached) { note("TAB_UNREACHABLE", `${selector} @${where}`); await page.focus(selector).catch(() => {}); }
      await page.keyboard.press("Enter");
    } else if (INPUT === "keys") {
      await page.focus(selector).catch(() => {});
      await page.keyboard.press("Enter");
    } else if (INPUT === "touch") {
      await page.tap(selector, { timeout: 2000 }).catch(e => note("tapfail", `${selector} @${where}: ${e.message.split("\n")[0].slice(0, 100)}`));
    } else {
      await page.click(selector, { timeout: 2000 }).catch(e => note("clickfail", `${selector} @${where}: ${e.message.split("\n")[0].slice(0, 100)}`));
    }
  };
  let steps = 0, ended = false, noExit = 0, same = 0, previous = "", expectResume = null, reloads = 0, resizes = 0;
  while (steps++ < 900 && !ended) {
    await page.waitForTimeout(30);
    const screen = await page.evaluate(order => {
      const vis = id => { const e = document.getElementById(id); if (!e) return false; const s = getComputedStyle(e); return !e.classList.contains("hidden") && s.display !== "none" && s.visibility !== "hidden" && e.getClientRects().length > 0; };
      return { on: order.find(vis) || "none", scene: (typeof state !== "undefined" && state.scene) || "",
        overflowX: document.documentElement.scrollWidth > window.innerWidth + 1 };
    }, ORDER);
    where = screen.scene || screen.on;
    if (screen.overflowX) note("overflowX", `${screen.on}:${screen.scene}`);
    switch (screen.on) {
      case "tone-screen": await page.mouse.click(10, 10); await page.keyboard.press("Enter"); continue;
      case "title-screen":
        if (expectResume) {
          if (!(await visible("btn-resume"))) { note("RESUME_MISSING", JSON.parse(expectResume)[0]); expectResume = null; steps = 900; continue; }
          await press("#btn-resume"); await page.waitForTimeout(150);
          const after = await page.evaluate(`(${SNAPSHOT.toString()})()`);
          if (after !== expectResume) note("RESUME_DRIFT", `${expectResume.slice(0, 200)} -> ${after.slice(0, 200)}`);
          expectResume = null;
        } else await press("#btn-begin");
        continue;
      case "new-run-confirm": await press("#new-run-ok"); continue;
      case "commander-create": await page.fill("#commander-callsign", "Test").catch(() => {}); await press("#commander-create-ok"); continue;
      case "cinematic-screen": await press(rnd() < 0.5 ? "#cinematic-skip" : "#cinematic-next"); continue;
      case "tutorial-overlay": await press("#tutorial-dismiss"); continue;
      case "crew-sheet": await press("#crew-sheet-close"); continue;
      case "ending-screen": if (await visible("btn-what-remains")) await press("#btn-what-remains"); else ended = true; continue;
      case "what-remains-screen": ended = true; continue;
      case "game-screen": {
        const info = await page.evaluate(() => {
          const buttons = [...document.querySelectorAll("#choices .choice-btn")];
          const img = document.getElementById("scene-image");
          return { count: buttons.length,
            enabled: buttons.map((b, i) => (!b.disabled && !b.classList.contains("disabled")) ? i : -1).filter(i => i >= 0),
            story: (document.getElementById("story").textContent || "").length,
            img: img && img.getAttribute("src") ? { src: img.getAttribute("src"), ok: img.complete ? img.naturalWidth > 0 : null } : null };
        });
        if (!info.story) note("emptyStory", screen.scene);
        if (info.img && info.img.ok === false) note("brokenImage", `${info.img.src} @${screen.scene}`);
        if (!info.enabled.length) {
          if (++noExit > 20) { note("NO_EXIT", `${screen.scene} (${info.count} choices, none enabled)`); steps = 900; }
          await page.waitForTimeout(100); continue;
        }
        noExit = 0;
        if (screen.scene === previous) { if (++same > 60) { note("LOOP", screen.scene); steps = 900; continue; } } else { same = 0; previous = screen.scene; }
        if (CHAOS && rnd() < 0.04) { expectResume = await page.evaluate(`(${SNAPSHOT.toString()})()`); await page.reload(); reloads++; continue; }
        if (CHAOS && rnd() < 0.03 && await visible("btn-crew")) { await page.click("#btn-crew").catch(() => {}); continue; }
        if (CHAOS && rnd() < 0.03) {
          // Resize / rotate / zoom-equivalent viewport change mid-scene must not touch state.
          const before = await page.evaluate(`(${SNAPSHOT.toString()})()`);
          const size = RESIZES[Math.floor(rnd() * RESIZES.length)];
          await page.setViewportSize(size); resizes++;
          await page.waitForTimeout(120);
          const after = await page.evaluate(`(${SNAPSHOT.toString()})()`);
          if (after !== before) note("RESIZE_DRIFT", `${size.width}x${size.height} @${screen.scene}`);
          const offscreen = await page.evaluate(() => [...document.querySelectorAll("#choices .choice-btn")].some(b => { const r = b.getBoundingClientRect(); return r.width === 0 || r.right > window.innerWidth + 1; }));
          if (offscreen) note("CHOICE_CLIPPED", `${size.width}x${size.height} @${screen.scene}`);
          continue;
        }
        const pick = info.enabled[Math.floor(rnd() * info.enabled.length)];
        if (INPUT === "tab") {
          await page.evaluate(i => { document.querySelectorAll("[data-bot-target]").forEach(e => e.removeAttribute("data-bot-target")); document.querySelectorAll("#choices .choice-btn")[i].setAttribute("data-bot-target", "1"); }, pick);
          await press("[data-bot-target]");
        } else if (INPUT === "touch") await page.locator("#choices .choice-btn").nth(pick).tap({ timeout: 2000 }).catch(e => note("tapfail", `choice ${pick} @${screen.scene}: ${e.message.split("\n")[0].slice(0, 100)}`));
        else if (INPUT === "keys" && pick < 9) await page.keyboard.press(String(pick + 1));
        else await page.locator("#choices .choice-btn").nth(pick).click({ timeout: 2000 }).catch(e => note("clickfail", `choice ${pick} @${screen.scene}: ${e.message.split("\n")[0].slice(0, 100)}`));
        continue;
      }
      default:
        note("unknownScreen", `${screen.on} @${screen.scene}`); await page.waitForTimeout(200);
        if (steps > 40) steps = 900;
    }
  }
  const end = await page.evaluate(() => ({ scene: typeof state !== "undefined" ? state.scene : "", dead: typeof state !== "undefined" ? state.dead.length : 0, title: ((document.getElementById("ending-title") || {}).textContent || "").trim() }));
  if (!ended) { incomplete++; note("INCOMPLETE", `run ${run} stopped at ${end.scene}`); }
  console.log(`run ${run} ${VIEWPORT}/${INPUT}${CHAOS ? "/chaos" : ""}: steps=${steps} reloads=${reloads} resizes=${resizes} ended=${ended} ending="${end.title.slice(0, 40)}" dead=${end.dead}`);
  await context.close();
}
await browser.close();
server.close();
for (const [finding, count] of findings) console.log(`FINDING ${finding}${count > 1 ? ` (x${count})` : ""}`);
console.log(`${findings.size ? "FAIL" : "PASS"} sun-browser-bot: ${RUNS - incomplete}/${RUNS} runs reached an ending; ${findings.size} finding(s)`);
process.exit(findings.size ? 1 : 0);
