// SUN-READON-SCROLL-01 — every "Read on" brings the paragraph it revealed into view.
// A phone cold read (Chromium, iPhone 13, 390x664) found 221 of 403 Read on taps revealed a paragraph
// below the fold or under the sticky Read on bar: the engine scrolled the sticky bar "into view",
// which it always already was, so #main never moved and the plate never minimized.
// CI has no browser, so this drives the real engine headless over a small layout model of #main:
//   A. revealScrollTarget, the pure scroll-target rule, on fixed cases (the cold-read layout included);
//   B. every paced scene, read on to the end at three #main sizes (sticky bar and in-flow bar): the new
//      paragraph must sit in the visible part of #main above the bar after every tap, and the last one
//      must be in view when the choices arrive;
//   C. resume, instant mode and Show all do not scroll; keyboard read-on scrolls like a tap;
//   D. source pins: the engine scrolls #main, not the sticky bar;
//   E. a plate that grows back while a Read on lands (a new scene's plate expanding from minimized)
//      shrinks #main; for a short time after the tap a resize brings the paragraph back into view.
// A real-browser hand run covers the same ground: `node scripts/sun-browser-bot.mjs --viewport iphone13
// --input touch` fails with READON_BLIND when a tap reveals text the reader cannot see.
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { loadGame, readEngineSource } from "./simulate.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// A layout model over the harness stubs. Paragraphs stack in #main's content in order; a paragraph's
// height comes from its length at a fixed line width. The Read on bar follows the last shown
// paragraph in normal flow, and while #main is .reveal-roomy it sticks to the bottom of #main, above
// #main's bottom padding (20px on a phone), as Chromium places it.
const INSTALL_LAYOUT = `((cfg) => {
  const story = document.getElementById("story");
  const main = document.getElementById("main");
  const controls = document.getElementById("reveal-controls");
  let cacheHtml = null, nodes = [];
  const lineCount = p => Math.max(1, Math.ceil(p.textContent.trim().length / cfg.chars));
  const heightOf = p => lineCount(p) * cfg.line + cfg.gap;
  const shownNodes = () => nodes.filter(p => !p.classList.contains("reveal-hidden"));
  const contentTop = p => { let y = 0; for (const q of shownNodes()) { if (q === p) return y; y += heightOf(q); } return y; };
  const controlsShown = () => !controls.classList.contains("hidden");
  const textHeight = () => shownNodes().reduce((s, p) => s + heightOf(p), 0);
  story.querySelectorAll = selector => {
    if (selector !== ".scene-text > p") return [];
    if (story.innerHTML !== cacheHtml) {
      cacheHtml = story.innerHTML;
      nodes = (cacheHtml.match(/<p[^>]*>[\\s\\S]*?<\\/p>/g) || []).map(markup => {
        const p = document.createElement("p");
        p.textContent = markup.replace(/<[^>]+>/g, " ");
        p.getBoundingClientRect = () => { const top = cfg.mainTop + contentTop(p) - main.scrollTop; const h = heightOf(p); return { top, bottom: top + h, height: h }; };
        return p;
      });
    }
    return nodes;
  };
  Object.defineProperty(main, "clientHeight", { get: () => cfg.mainH, configurable: true });
  Object.defineProperty(main, "scrollHeight", { get: () => Math.max(cfg.mainH, textHeight() + (controlsShown() ? cfg.bar : 0) + cfg.pad), configurable: true });
  globalThis.getComputedStyle = el => ({ paddingBottom: el === main ? cfg.pad + "px" : "0px" });
  main.clientTop = 0;
  main.getBoundingClientRect = () => ({ top: cfg.mainTop, bottom: cfg.mainTop + cfg.mainH, height: cfg.mainH });
  globalThis.__scrolls = [];
  main.scrollTo = o => { __scrolls.push(o); main.scrollTop = Math.max(0, Math.min(main.scrollHeight - cfg.mainH, o.top)); };
  controls.getBoundingClientRect = () => {
    let top = cfg.mainTop + textHeight() - main.scrollTop;
    // Chromium sticks the bar above #main's bottom padding, not at its border.
    if (main.classList.contains("reveal-roomy")) top = Math.min(top, cfg.mainTop + cfg.mainH - cfg.pad - cfg.bar);
    return { top, bottom: top + cfg.bar, height: cfg.bar };
  };
  globalThis.__cfg = cfg;
  main.contains = node => node === main || nodes.includes(node);
  controls.scrollIntoView = () => {}; // sticky: already "in view", so the browser does not move #main
  main.classList.toggle("reveal-roomy", cfg.mainH >= REVEAL_STICKY_MIN_HEIGHT);
  const proto = Object.getPrototypeOf(story);
  proto.focus = function () { document.activeElement = this; };
  proto.contains = function (node) { return node === this; };
  controls.contains = node => node === controls || node === document.getElementById("reveal-next") || node === document.getElementById("reveal-all");
  // Where the newest shown paragraph sits against the part of #main the reader can see.
  globalThis.__seen = () => {
    const ps = shownNodes();
    const p = ps[ps.length - 1];
    const box = p.getBoundingClientRect();
    const mainTop = cfg.mainTop;
    let bottom = cfg.mainTop + cfg.mainH;
    if (controlsShown() && main.classList.contains("reveal-roomy")) bottom = Math.min(bottom, controls.getBoundingClientRect().top);
    const room = bottom - mainTop;
    const visible = Math.max(0, Math.min(box.bottom, bottom) - Math.max(box.top, mainTop));
    return { shown: ps.length, visible, height: box.height, room, ok: visible >= Math.min(box.height, room) - 0.5, scrollTop: main.scrollTop };
  };
  globalThis.__fresh = () => {
    localStorage.clear();
    textPaceSession = null;
    revealSettledAt = -Infinity;
    persistSave = () => true;
    resetRunState();
    showScreen("game");
    document.getElementById("choices").children = [];
    main.scrollTop = 0;
    __scrolls.length = 0;
  };
})`;

// #main as Chromium measures it with the plate at full size (390x664: top 368, 239px tall, 20px bottom padding, 66px bar).
const LAYOUTS = [
  { name: "390x664 phone (cold read)", mainTop: 368, mainH: 239, chars: 40, line: 28, gap: 14, bar: 66, pad: 20 },
  { name: "360x640 phone", mainTop: 360, mainH: 228, chars: 36, line: 28, gap: 14, bar: 66, pad: 20 },
  { name: "#main squeezed to 140px (bar in flow)", mainTop: 400, mainH: 140, chars: 40, line: 28, gap: 14, bar: 66, pad: 20 }
];

export function sunPlayerflowReadonScrollChecks() {
  const errors = [];
  const check = (ok, message) => { if (!ok) errors.push(message); };

  // A. The pure rule.
  {
    const runtime = loadGame(ROOT);
    const cases = [
      // Cold read: 240px #main, 66px sticky bar, paragraph 3 at 250-306 under the bar. Lift it to end at the bar.
      { name: "under the bar", v: { scrollTop: 0, viewHeight: 240, maxScroll: 140, top: 250, bottom: 306, reserve: 66, follow: 0 }, want: 132 },
      { name: "already in view", v: { scrollTop: 0, viewHeight: 240, maxScroll: 40, top: 60, bottom: 160, reserve: 66, follow: 0 }, want: null },
      { name: "taller than the room starts at its top", v: { scrollTop: 0, viewHeight: 240, maxScroll: 400, top: 120, bottom: 420, reserve: 66, follow: 0 }, want: 120 },
      { name: "above the view after the reader scrolled down", v: { scrollTop: 300, viewHeight: 240, maxScroll: 400, top: 200, bottom: 260, reserve: 66, follow: 0 }, want: 200 },
      { name: "in-flow bar comes along when both fit", v: { scrollTop: 0, viewHeight: 140, maxScroll: 200, top: 100, bottom: 156, reserve: 0, follow: 222 }, want: 82 },
      { name: "in-flow bar left behind when both do not fit", v: { scrollTop: 0, viewHeight: 140, maxScroll: 300, top: 100, bottom: 212, reserve: 0, follow: 278 }, want: 72 },
      { name: "clamped to the scroll range", v: { scrollTop: 0, viewHeight: 240, maxScroll: 50, top: 150, bottom: 250, reserve: 66, follow: 0 }, want: 50 }
    ];
    const got = JSON.parse(runtime.evaluate(`JSON.stringify(typeof revealScrollTarget === "function" ? ${JSON.stringify(cases)}.map(c => revealScrollTarget(c.v)) : "missing")`));
    if (got === "missing") check(false, "A: the engine has no revealScrollTarget");
    else cases.forEach((c, i) => check(got[i] === c.want, `A ${c.name}: revealScrollTarget gave ${got[i]}, expected ${c.want}`));
  }

  // B. Every paced scene, every tap, three #main sizes.
  for (const layout of LAYOUTS) {
    const runtime = loadGame(ROOT);
    runtime.evaluate(`${INSTALL_LAYOUT}(${JSON.stringify(layout)})`);
    const r = JSON.parse(runtime.evaluate(`JSON.stringify((() => {
      const out = { scenes: 0, taps: 0, blind: [], lastBlind: [], scrolled: 0 };
      for (const id of Object.keys(scenes)) {
        __fresh();
        try { showScene(id); } catch (e) { continue; }
        if (!sceneReveal || state.scene !== id) continue;
        out.scenes++;
        for (let i = 0; i < 60 && sceneReveal; i++) {
          readOnFromControl({ detail: 1 });
          out.taps++;
          const s = __seen();
          if (!s.ok) (sceneReveal ? out.blind : out.lastBlind).push(id + " p" + s.shown + " " + Math.round(s.visible) + "/" + Math.round(s.height) + "px seen, room " + Math.round(s.room));
        }
        if (__scrolls.length) out.scrolled++;
      }
      return out;
    })())`));
    check(r.scenes >= 120, `B ${layout.name}: only ${r.scenes} paced scenes`);
    check(r.blind.length === 0, `B ${layout.name}: ${r.blind.length} of ${r.taps} Read on taps left the new paragraph out of view: ${r.blind.slice(0, 6).join("; ")}`);
    check(r.lastBlind.length === 0, `B ${layout.name}: the last paragraph was out of view when the choices arrived: ${r.lastBlind.slice(0, 6).join("; ")}`);
    check(r.scrolled > r.scenes / 2, `B ${layout.name}: #main scrolled in only ${r.scrolled} of ${r.scenes} scenes`);
    console.log(`  B ${layout.name}: ${r.scenes} paced scenes, ${r.taps} taps, ${r.blind.length + r.lastBlind.length} out of view; #main scrolled in ${r.scrolled}`);
  }

  // C. Paths that must not scroll, and keyboard read-on.
  {
    const runtime = loadGame(ROOT);
    runtime.evaluate(`${INSTALL_LAYOUT}(${JSON.stringify(LAYOUTS[0])})`);
    const r = JSON.parse(runtime.evaluate(`JSON.stringify((() => {
      const out = {};
      __fresh(); showScene("vault_reveal", { skipOnEnter: true, resume: true });
      out.resume = { pending: !!sceneReveal, scrolls: __scrolls.length, scrollTop: document.getElementById("main").scrollTop };
      __fresh(); setTextPace("instant"); showScene("vault_reveal");
      out.instant = { pending: !!sceneReveal, scrolls: __scrolls.length };
      __fresh(); showScene("vault_reveal");
      readOnFromControl({ detail: 1 }); readOnFromControl({ detail: 1 });
      const before = __scrolls.length, top = document.getElementById("main").scrollTop;
      showAllFromControl({ detail: 1 });
      out.showAll = { pending: !!sceneReveal, scrolls: __scrolls.length - before, moved: document.getElementById("main").scrollTop !== top };
      __fresh(); showScene("vault_reveal");
      out.keys = [];
      for (let i = 0; i < 20 && sceneReveal; i++) {
        handleGameplayKeydown({ key: i % 2 ? "Enter" : " ", target: document.getElementById("story"), defaultPrevented: false, repeat: false, altKey: false, ctrlKey: false, metaKey: false, preventDefault() {} });
        out.keys.push(__seen().ok);
      }
      __fresh(); showScene("vault_reveal");
      out.controlKey = [];
      for (let i = 0; i < 6 && sceneReveal; i++) { readOnFromControl({ detail: 0 }); if (sceneReveal) out.controlKey.push(__seen().ok); }
      return out;
    })())`));
    check(!r.resume.pending && r.resume.scrolls === 0 && r.resume.scrollTop === 0, `C: a resumed scene scrolled or replayed the reveal: ${JSON.stringify(r.resume)}`);
    check(!r.instant.pending && r.instant.scrolls === 0, `C: instant mode scrolled: ${JSON.stringify(r.instant)}`);
    check(!r.showAll.pending && r.showAll.scrolls === 0 && !r.showAll.moved, `C: Show all moved the reader's place: ${JSON.stringify(r.showAll)}`);
    check(r.keys.length >= 5 && r.keys.every(Boolean), `C: Space/Enter in the passage left a paragraph out of view: ${JSON.stringify(r.keys)}`);
    check(r.controlKey.length >= 5 && r.controlKey.every(Boolean), `C: Enter on Read on left a paragraph out of view: ${JSON.stringify(r.controlKey)}`);
  }

  // D. Source pins.
  {
    const src = readEngineSource(ROOT);
    const at = src.indexOf("function scrollRevealedIntoView(");
    const body = at >= 0 ? src.slice(at, src.indexOf("\n}\n", at)) : "";
    check(body, "D: scrollRevealedIntoView is missing from the engine");
    check(!/controls\.scrollIntoView/.test(body), "D: scrollRevealedIntoView must not scroll the sticky Read on bar into view; it is always in view, so #main never moves");
    check(/main\.scrollTo\(/.test(body) && /revealScrollTarget\(/.test(body), "D: scrollRevealedIntoView must scroll #main to revealScrollTarget's offset");
    check(/reveal-roomy/.test(body), "D: the bar's height is reserved only while it is sticky (#main.reveal-roomy)");
    const room = src.slice(src.indexOf("function watchRevealRoom("), src.indexOf("function watchRevealRoom(") + 900);
    check(/refollowRevealedBlock\(\)/.test(room), "E: watchRevealRoom's resize handler must re-follow the paragraph a Read on just revealed");
  }

  // E. #main shrinks just after a Read on (the plate growing back); the paragraph follows, briefly.
  {
    const runtime = loadGame(ROOT);
    runtime.evaluate(`${INSTALL_LAYOUT}(${JSON.stringify({ ...LAYOUTS[0], mainTop: 228, mainH: 379 })})`);
    const r = JSON.parse(runtime.evaluate(`JSON.stringify((() => {
      const realNow = Date.now;
      let clock = 1e12;
      Date.now = () => clock;
      const out = { cases: [] };
      try {
        if (typeof refollowRevealedBlock !== "function") return { missing: true };
        for (const id of ["vault_reveal", "crisis", "time_pass"]) {
          // The plate is mid-grow: #main is 379px at the tap and settles at 239px.
          __cfg.mainTop = 228; __cfg.mainH = 379;
          __fresh(); showScene(id);
          if (!sceneReveal) continue;
          readOnFromControl({ detail: 1 });
          readOnFromControl({ detail: 1 });
          clock += 100;
          __cfg.mainTop = 368; __cfg.mainH = 239;
          refollowRevealedBlock();
          out.cases.push({ id, ok: __seen().ok, seen: __seen() });
        }
        // After the follow window a resize leaves the reader's place alone.
        __cfg.mainTop = 228; __cfg.mainH = 379;
        __fresh(); showScene("vault_reveal");
        readOnFromControl({ detail: 1 });
        clock += REVEAL_FOLLOW_MS + 50;
        const before = __scrolls.length;
        __cfg.mainTop = 368; __cfg.mainH = 120;
        refollowRevealedBlock();
        out.late = __scrolls.length - before;
      } finally { Date.now = realNow; }
      return out;
    })())`));
    if (r.missing) check(false, "E: the engine has no refollowRevealedBlock");
    else {
      check(r.cases.length >= 2, `E: too few paced scenes reached: ${JSON.stringify(r.cases)}`);
      r.cases.forEach(c => check(c.ok, `E ${c.id}: #main shrank after a Read on and the paragraph stayed out of view: ${JSON.stringify(c.seen)}`));
      check(r.late === 0, `E: a resize ${r.late} scroll(s) after the follow window moved the reader's place`);
    }
  }

  return errors;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const errors = sunPlayerflowReadonScrollChecks();
  if (errors.length) {
    console.error("FAIL sun-playerflow-readon-scroll", errors);
    process.exit(1);
  }
  console.log("PASS sun-playerflow-readon-scroll (scroll-target rule; every paced scene's new paragraph in view above the bar at three #main sizes; resume/instant/Show all do not scroll; keys read on in view; engine scrolls #main; paragraph follows a shrinking #main just after a tap)");
}
