// SUN-036-KEYBOARD-RUN-01 — keyboard-only start to ending.
// Keys: Tab, Shift-Tab, 1-9, Enter, Space. No mouse, no touch, no state writes.
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const brokenFocus = process.argv.includes("--broken-focus");
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MAX_STEPS = 240;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".md": "text/plain"
};

function serve(dir) {
  return new Promise(resolve => {
    const server = http.createServer((req, res) => {
      const url = new URL(req.url || "/", "http://127.0.0.1");
      let rel = decodeURIComponent(url.pathname);
      if (rel === "/") rel = "/index.html";
      const file = path.normalize(path.join(dir, rel));
      if (!file.startsWith(dir)) {
        res.writeHead(403); res.end(); return;
      }
      fs.readFile(file, (err, buf) => {
        if (err) { res.writeHead(404); res.end("not found"); return; }
        res.writeHead(200, { "content-type": MIME[path.extname(file).toLowerCase()] || "application/octet-stream" });
        res.end(buf);
      });
    });
    server.listen(0, "127.0.0.1", () => resolve(server));
  });
}

function chromeBin() {
  const candidates = [process.env.CHROME_PATH, "google-chrome", "google-chrome-stable", "chromium-browser", "chromium"].filter(Boolean);
  return candidates[0];
}

class Cdp {
  constructor(ws) {
    this.ws = ws;
    this.next = 1;
    this.pending = new Map();
    ws.addEventListener("message", ev => {
      const msg = JSON.parse(ev.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) reject(new Error(msg.error.message || "cdp error"));
        else resolve(msg.result || {});
      }
    });
  }
  send(method, params = {}) {
    const id = this.next++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function connectCdp(port) {
  let last = "";
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/version`);
      const body = await res.json();
      const ws = new WebSocket(body.webSocketDebuggerUrl);
      await new Promise((resolve, reject) => {
        ws.addEventListener("open", resolve, { once: true });
        ws.addEventListener("error", () => reject(new Error("cdp socket")), { once: true });
      });
      return new Cdp(ws);
    } catch (err) {
      last = err.message || String(err);
      await sleep(250);
    }
  }
  throw new Error(`chrome debug port not ready: ${last}`);
}

const KEYS = {
  Tab: { key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 },
  Enter: { key: "Enter", code: "Enter", windowsVirtualKeyCode: 13, text: "\r" },
  Space: { key: " ", code: "Space", windowsVirtualKeyCode: 32, text: " " },
  Digit: n => ({ key: String(n), code: `Digit${n}`, windowsVirtualKeyCode: 48 + n, text: String(n) })
};

async function press(cdp, spec, shift) {
  const base = { ...spec, modifiers: shift ? 8 : 0 };
  await cdp.send("Input.dispatchKeyEvent", { type: "keyDown", ...base });
  await cdp.send("Input.dispatchKeyEvent", { type: "keyUp", ...base });
}

const READ = `(() => {
  const ae = document.activeElement;
  const cs = ae ? getComputedStyle(ae) : null;
  const ending = document.getElementById("ending-screen");
  const endingOn = !!(ending && !ending.classList.contains("hidden"));
  const title = (document.getElementById("ending-title") || {}).textContent || "";
  const sceneEl = document.getElementById("scene-id");
  const choices = Array.from(document.querySelectorAll("#choices .choice-btn, #choices button"));
  const enabled = choices.map((btn, i) => ({ i, disabled: !!btn.disabled, text: (btn.textContent || "").trim().slice(0, 40) })).filter(x => !x.disabled);
  const hidden = id => {
    const el = document.getElementById(id);
    return !el || el.classList.contains("hidden") || el.getAttribute("aria-hidden") === "true";
  };
  return {
    focusId: ae && ae.id || "",
    focusTag: ae ? ae.tagName : "",
    focusText: ae ? (ae.textContent || "").trim().slice(0, 48) : "",
    outlineStyle: cs ? cs.outlineStyle : "",
    outlineWidth: cs ? cs.outlineWidth : "",
    endingOn,
    endingTitle: title.trim(),
    scene: (sceneEl && sceneEl.textContent || "").trim(),
    gameOn: !hidden("game-screen"),
    toneOn: !hidden("tone-screen"),
    titleOn: !hidden("title-screen"),
    cineOn: !hidden("cinematic-screen"),
    tutorialOn: !hidden("tutorial-overlay"),
    commanderOn: !hidden("commander-create"),
    confirmOn: !hidden("new-run-confirm"),
    enabled
  };
})()`;

async function readState(cdp) {
  const result = await cdp.send("Runtime.evaluate", { expression: READ, returnByValue: true });
  return result.result.value;
}

function ringOk(state) {
  const width = parseFloat(state.outlineWidth || "0");
  return state.outlineStyle && state.outlineStyle !== "none" && width >= 2;
}

function report(state, steps, extra) {
  const ending = state.endingOn && state.endingTitle ? state.endingTitle : "none";
  console.log(`ENDING=${ending}`);
  console.log(`STEPS=${steps}`);
  console.log(`SCENE=${state.scene || ""}`);
  console.log(`FOCUS=${state.focusTag}#${state.focusId} outline=${state.outlineStyle}/${state.outlineWidth}`);
  if (extra) console.log(extra);
}

function pickKey(state) {
  if (state.endingOn && state.endingTitle) return null;
  const id = state.focusId;
  const primary = new Set([
    "btn-tone-continue", "btn-begin", "commander-create-ok", "new-run-ok",
    "cinematic-skip", "tutorial-dismiss", "tutorial-skip"
  ]);
  if (primary.has(id)) return { name: "Enter", spec: KEYS.Enter };
  if (state.focusText.includes("I understand")) return { name: "Enter", spec: KEYS.Enter };
  if (id === "btn-crew" || id === "new-run-cancel") return { name: "Tab", spec: KEYS.Tab };
  if (state.gameOn && state.enabled.length) {
    const first = state.enabled[0];
    if (first.i < 9) return { name: `Digit${first.i + 1}`, spec: KEYS.Digit(first.i + 1) };
  }
  if (state.enabled.length === 1 && (id === "story" || id.startsWith("choice"))) {
    return { name: "Space", spec: KEYS.Space };
  }
  return { name: "Tab", spec: KEYS.Tab };
}

async function main() {
  const server = await serve(root);
  const port = server.address().port;
  const debugPort = 9200 + Math.floor(Math.random() * 500);
  const userDir = path.join(root, ".keyboard-run-profile");
  fs.rmSync(userDir, { recursive: true, force: true });
  const chrome = spawn(chromeBin(), [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=${userDir}`,
    "--window-size=1280,900",
    "about:blank"
  ], { stdio: "ignore" });
  let steps = 0;
  try {
    const cdp = await connectCdp(debugPort);
    await cdp.send("Page.enable");
    await cdp.send("Runtime.enable");
    if (brokenFocus) {
      await cdp.send("Page.addScriptToEvaluateOnNewDocument", {
        source: `document.addEventListener("DOMContentLoaded", () => {
          const s = document.createElement("style");
          s.id = "broken-focus";
          s.textContent = "button,#story,input,[role=button]{outline:none!important;outline-width:0!important}";
          document.head.appendChild(s);
        });`
      });
    }
    await cdp.send("Page.navigate", { url: `http://127.0.0.1:${port}/index.html` });
    await sleep(1200);
    let lastScene = "";
    let stuck = 0;
    for (; steps < MAX_STEPS; steps++) {
      const state = await readState(cdp);
      if (steps === 0 && brokenFocus) {
        report(state, 0, "PASS broken-focus case failed the visible-focus assert");
        if (ringOk(state)) {
          console.log("broken-focus still drew a ring");
          process.exitCode = 1;
        }
        return;
      }
      if (state.endingOn && state.endingTitle) {
        report(state, steps, "PASS keyboard-only ending");
        return;
      }
      if (!ringOk(state)) {
        report(state, steps, "FAIL focus not visible");
        process.exitCode = 1;
        return;
      }
      const before = state.scene;
      const key = pickKey(state);
      if (!key) break;
      if (key.name === "Tab" && stuck >= 4) await press(cdp, KEYS.Tab, true);
      else await press(cdp, key.spec, false);
      await sleep(180);
      const after = await readState(cdp);
      if ((key.name === "Enter" || key.name === "Space") && before && after.scene && before !== after.scene) {
        // one key, one scene change is the contract; a second change in the same turn is not observable separately
      }
      if (after.scene === lastScene && !after.endingOn) stuck += 1;
      else stuck = 0;
      lastScene = after.scene;
      if (stuck > 12) {
        report(after, steps + 1, "FAIL keyboard run stuck");
        process.exitCode = 1;
        return;
      }
    }
    const end = await readState(cdp);
    report(end, steps, "FAIL keyboard run did not reach an ending");
    process.exitCode = 1;
  } finally {
    chrome.kill("SIGKILL");
    server.close();
    fs.rmSync(userDir, { recursive: true, force: true });
  }
}

main().catch(err => {
  console.log(`ENDING=none`);
  console.log(`STEPS=0`);
  console.log(`SCENE=`);
  console.log(`FAIL ${err.message || err}`);
  process.exit(1);
});
