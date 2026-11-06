// SUN-PACED-REVEAL-01 — paced paragraph reveal, Text: paced/instant setting, plate drift, desktop flow.
// Drives the real engine through simulate.loadGame. The shared harness has no parsed DOM, so the
// engine finds no paragraph nodes there and every scene renders whole (part A proves that contract,
// which keeps every other playerflow check and verify unchanged). Parts B-F install a small paragraph
// DOM over #story's real innerHTML so the reveal itself runs headless (CI has no browser).
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { loadGame } from "./simulate.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const MULTI = "vault_reveal"; // nine paragraphs, three choices, fixed text

// Paragraph nodes parsed from the renderer's own markup; classList toggles land on these stubs.
const INSTALL_PARAGRAPH_DOM = `(() => {
  const story = document.getElementById("story");
  let cacheHtml = null;
  let nodes = [];
  story.querySelectorAll = selector => {
    if (selector !== ".scene-text > p") return [];
    if (story.innerHTML !== cacheHtml) {
      cacheHtml = story.innerHTML;
      nodes = (cacheHtml.match(/<p>[\\s\\S]*?<\\/p>/g) || []).map(markup => {
        const p = document.createElement("p");
        p.innerHTML = markup.slice(3, -4);
        p.textContent = p.innerHTML.replace(/<[^>]+>/g, " ");
        return p;
      });
    }
    return nodes;
  };
  const proto = Object.getPrototypeOf(story);
  proto.focus = function () { document.activeElement = this; };
  proto.contains = function (node) { return node === this; };
  const controls = document.getElementById("reveal-controls");
  controls.contains = node => node === controls || node === document.getElementById("reveal-next") || node === document.getElementById("reveal-all");
  let seed = 1;
  globalThis.__resetRandom = () => { seed = 1; };
  Math.random = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  globalThis.__key = (key, extra) => {
    const event = Object.assign({ key, target: story, defaultPrevented: false, repeat: false, altKey: false, ctrlKey: false,
      metaKey: false, preventDefault() { this.defaultPrevented = true; } }, extra || {});
    return handleGameplayKeydown(event);
  };
  globalThis.__view = () => {
    const ps = story.querySelectorAll(".scene-text > p");
    return {
      scene: state.scene,
      blocks: ps.length,
      hidden: ps.filter(p => p.classList.contains("reveal-hidden")).length,
      faded: ps.filter(p => p.classList.contains("reveal-fade")).length,
      pending: !!sceneReveal,
      shown: sceneReveal ? sceneReveal.shown : ps.length,
      choicesPending: document.getElementById("choices").classList.contains("reveal-pending"),
      choicesFade: document.getElementById("choices").classList.contains("reveal-fade"),
      controlsHidden: document.getElementById("reveal-controls").classList.contains("hidden"),
      mainActive: document.getElementById("main").classList.contains("reveal-active"),
      buttons: gameplayChoiceButtons().length,
      focusIsChoice: gameplayChoiceButtons().includes(document.activeElement),
      focusIsFirstEnabled: document.activeElement === gameplayChoiceButtons().find(b => !b.disabled),
      readOnLabel: document.getElementById("reveal-next").getAttribute("aria-label")
    };
  };
  globalThis.__fresh = () => {
    localStorage.clear();
    textPaceSession = null;
    revealSettledAt = -Infinity;
    persistSave = () => true;
    resetRunState();
    showScreen("game");
    document.getElementById("choices").children = []; // the stub's innerHTML = "" does not drop children
  };
})()`;

function withParagraphDom(runtime) {
  runtime.evaluate(INSTALL_PARAGRAPH_DOM);
  return runtime;
}

export function sunPlayerflowPacedRevealChecks() {
  const errors = [];
  const check = (ok, message) => { if (!ok) errors.push(message); };

  // A. Harness contract: no parsed DOM → no paragraph nodes → instant. Digits still commit.
  {
    const runtime = loadGame(ROOT);
    const r = runtime.evaluate(`(() => {
      localStorage.clear(); persistSave = () => true; resetRunState(); showScreen("game");
      showScene(${JSON.stringify(MULTI)});
      const before = { pending: !!sceneReveal, choicesPending: document.getElementById("choices").classList.contains("reveal-pending"), buttons: gameplayChoiceButtons().length };
      const handled = handleGameplayKeydown({ key: "1", target: document.getElementById("story"), defaultPrevented: false, repeat: false, altKey: false, ctrlKey: false, metaKey: false, preventDefault() {} });
      return { before, handled, scene: state.scene, pace: readTextPace() };
    })()`);
    check(r.pace === "paced", `A: default text pace is ${r.pace}, expected paced`);
    check(!r.before.pending && !r.before.choicesPending, `A: headless harness render was paced: ${JSON.stringify(r.before)}`);
    check(r.before.buttons === 3, `A: harness lost #choices children: ${JSON.stringify(r.before)}`);
    check(r.handled === true && r.scene !== MULTI, `A: digit 1 no longer commits in the harness: ${JSON.stringify(r)}`);
  }

  // B1. Every scene: blocks are exactly the renderer's paragraphs; pacing never changes the markup.
  {
    const runtime = withParagraphDom(loadGame(ROOT));
    const r = JSON.parse(runtime.evaluate(`JSON.stringify((() => {
      const rows = [];
      for (const id of Object.keys(scenes)) {
        const render = mode => {
          __fresh();
          if (mode === "instant") setTextPace("instant");
          __resetRandom();
          try { showScene(id); } catch (e) { return { error: String(e && e.message || e) }; }
          const html = document.getElementById("story").innerHTML;
          const text = scenes[state.scene] && scenes[state.scene].text;
          return { html, landed: state.scene, view: __view(), rawParas: typeof text === "string" ? text.split(/\\n\\n+/).length : null,
            markupParas: (html.match(/<p>/g) || []).length,
            words: (html.match(/<p>[\\s\\S]*?<\\/p>/g) || []).join(" ").replace(/<[^>]+>/g, " ").trim().split(/\\s+/).filter(Boolean).length };
        };
        const paced = render("paced");
        const instant = render("instant");
        rows.push({ id, paced, instant });
      }
      return rows;
    })())`));
    let checked = 0, pacedScenes = 0, wholeScenes = 0, multiShort = 0;
    for (const { id, paced, instant } of r) {
      if (paced.error || instant.error) continue;
      if (paced.landed !== instant.landed) continue; // nondeterministic entry; nothing to compare
      if (paced.landed === "ending_check") continue; // resolves to the ending screen; no scene text rendered
      checked++;
      const v = paced.view;
      check(paced.html === instant.html, `B1 ${id}: paced markup differs from instant markup`);
      check(v.blocks === paced.markupParas, `B1 ${id}: ${v.blocks} blocks for ${paced.markupParas} rendered paragraphs`);
      if (paced.rawParas != null) check(v.blocks === paced.rawParas, `B1 ${id}: ${v.blocks} blocks for ${paced.rawParas} authored paragraphs`);
      const shouldPace = v.blocks >= 2 && paced.words >= 40;
      if (shouldPace) {
        pacedScenes++;
        check(v.pending && v.shown === 1 && v.hidden === v.blocks - 1, `B1 ${id}: expected first paragraph only: ${JSON.stringify(v)}`);
        check(v.choicesPending && !v.controlsHidden && v.mainActive, `B1 ${id}: choices/controls not held: ${JSON.stringify(v)}`);
      } else {
        wholeScenes++;
        if (v.blocks >= 2) multiShort++;
        check(!v.pending && v.hidden === 0 && !v.choicesPending && v.controlsHidden, `B1 ${id}: short scene did not arrive whole: ${JSON.stringify(v)}`);
      }
      const iv = instant.view;
      check(!iv.pending && iv.hidden === 0 && !iv.choicesPending && iv.controlsHidden, `B1 ${id}: instant mode held text: ${JSON.stringify(iv)}`);
    }
    check(checked >= 200, `B1: only ${checked} scenes compared`);
    console.log(`  B1 ${checked} scenes: ${pacedScenes} paced, ${wholeScenes} whole (${multiShort} multi-paragraph under 40 words)`);
  }

  // B2-B5. Choices stay hidden until the last block; keys; focus; settle guard; programmatic choice.
  {
    const runtime = withParagraphDom(loadGame(ROOT));
    const r = JSON.parse(runtime.evaluate(`JSON.stringify((() => {
      const out = {};
      __fresh(); showScene(${JSON.stringify(MULTI)});
      out.start = __view();
      out.digitHandled = __key("1");
      out.afterDigit = __view();
      out.repeatHandled = __key(" ", { repeat: true });
      out.afterRepeat = __view();
      out.steps = [];
      const keys = ["Enter", " ", "ArrowRight", "Spacebar"];
      for (let i = 0; i < 20 && sceneReveal; i++) {
        const handled = __key(keys[i % keys.length]);
        const v = __view();
        out.steps.push({ handled, shown: v.shown, pending: v.pending, choicesPending: v.choicesPending });
      }
      out.end = __view();
      out.settled = Number.isFinite(revealSettledAt);
      const first = gameplayChoiceButtons().find(b => !b.disabled);
      first.onclick({ detail: 1 });
      out.clickInsideSettle = state.scene;
      revealSettledAt = -Infinity;
      first.onclick({ detail: 0 });
      out.clickAfterSettle = state.scene;

      __fresh(); showScene(${JSON.stringify(MULTI)});
      readOnFromControl({ detail: 0 });
      out.controlStep = __view();
      showAllFromControl({ detail: 0 });
      out.controlKeyAll = __view();

      __fresh(); showScene(${JSON.stringify(MULTI)});
      document.getElementById("reveal-next").focus();
      showAllFromControl({ detail: 1 });
      out.pointerAll = Object.assign(__view(), { storyFocused: document.activeElement === document.getElementById("story") });

      __fresh(); showScene(${JSON.stringify(MULTI)});
      const rendered = (typeof scenes.${MULTI}.choices === "function" ? scenes.${MULTI}.choices() : scenes.${MULTI}.choices)[0];
      makeChoice(rendered);
      out.makeChoiceWhilePending = { scene: state.scene, next: rendered.next };
      return out;
    })())`));
    check(r.start.pending && r.start.blocks === 9 && r.start.shown === 1 && r.start.buttons === 3, `B2: ${MULTI} start ${JSON.stringify(r.start)}`);
    check(r.start.readOnLabel === "Read on: paragraph 2 of 9", `B2: Read on label ${r.start.readOnLabel}`);
    check(r.digitHandled === false && r.afterDigit.scene === MULTI && r.afterDigit.shown === 1, `B2: digit picked or advanced while choices were hidden: ${JSON.stringify(r.afterDigit)}`);
    check(r.repeatHandled === false && r.afterRepeat.shown === 1, "B2: a held (repeat) key advanced the reveal");
    check(r.steps.length === 8 && r.steps.every(s => s.handled), `B2: expected 8 key advances, got ${JSON.stringify(r.steps)}`);
    check(r.steps.slice(0, -1).every((s, i) => s.shown === i + 2 && s.pending && s.choicesPending), `B2: choices showed before the last block: ${JSON.stringify(r.steps)}`);
    check(!r.end.pending && !r.end.choicesPending && r.end.controlsHidden && r.end.hidden === 0 && !r.end.mainActive, `B2: end state ${JSON.stringify(r.end)}`);
    check(!r.end.focusIsChoice, "B2: Space/Enter/→ in the passage moved focus onto a choice (digits would go inert)");
    check(r.settled && r.clickInsideSettle === MULTI, "B3: the burst that revealed the choices also committed one");
    check(r.clickAfterSettle !== MULTI, "B3: choice did not commit after the settle window");
    check(r.controlStep.shown === 2 && r.controlStep.pending, `B4: Read on control did not advance: ${JSON.stringify(r.controlStep)}`);
    check(!r.controlKeyAll.pending && r.controlKeyAll.hidden === 0 && r.controlKeyAll.focusIsFirstEnabled, `B4: keyboard Show all did not reveal all and focus the first enabled choice: ${JSON.stringify(r.controlKeyAll)}`);
    check(!r.pointerAll.pending && r.pointerAll.hidden === 0 && !r.pointerAll.focusIsChoice && r.pointerAll.storyFocused, `B4: tapped Show all: ${JSON.stringify(r.pointerAll)}`);
    check(r.makeChoiceWhilePending.scene !== MULTI, `B5: makeChoice did not work while the reveal was pending: ${JSON.stringify(r.makeChoiceWhilePending)}`);
  }

  // C. Instant setting, persistence, blocked storage, toggle mid-reveal, labels.
  {
    const runtime = withParagraphDom(loadGame(ROOT));
    const r = JSON.parse(runtime.evaluate(`JSON.stringify((() => {
      const out = {};
      const labels = () => [document.getElementById("btn-text-pace").textContent, document.getElementById("meta-text-pace").textContent, document.getElementById("text-pace-chip").textContent];
      __fresh();
      out.defaultLabels = (syncTextPaceControls(), labels());
      setTextPace("instant");
      out.stored = localStorage.getItem(TEXT_PACE_KEY);
      out.instantLabels = labels();
      showScene(${JSON.stringify(MULTI)});
      out.instant = __view();
      toggleTextPace();
      out.toggledBack = readTextPace();
      showScene(${JSON.stringify(MULTI)});
      __key("Enter");
      toggleTextPace();
      out.midToggle = __view();
      out.stateKeys = Object.keys(state).filter(k => /pace|reveal/i.test(k));
      out.snapshotHasPace = JSON.stringify(snapshotState()).includes("pace");
      return out;
    })())`));
    check(r.defaultLabels[0] === "Text: paced" && r.defaultLabels[1] === "Text: paced", `C: default labels ${JSON.stringify(r.defaultLabels)}`);
    check(r.stored === "instant", `C: setting stored as ${r.stored}`);
    check(r.instantLabels[0] === "Text: instant" && r.instantLabels[1] === "Text: instant" && /Instant/.test(r.instantLabels[2]), `C: instant labels ${JSON.stringify(r.instantLabels)}`);
    check(!r.instant.pending && r.instant.hidden === 0 && !r.instant.choicesPending && r.instant.controlsHidden, `C: instant mode held text: ${JSON.stringify(r.instant)}`);
    check(r.toggledBack === "paced", "C: toggle did not return to paced");
    check(!r.midToggle.pending && r.midToggle.hidden === 0 && !r.midToggle.choicesPending && !r.midToggle.focusIsChoice, `C: switching to instant mid-reveal did not show the rest: ${JSON.stringify(r.midToggle)}`);
    check(r.stateKeys.length === 0 && !r.snapshotHasPace, "C: text pace leaked into run state or the save snapshot");

    const reader = withParagraphDom(loadGame(ROOT));
    const persisted = JSON.parse(reader.evaluate(`JSON.stringify((() => {
      __fresh(); localStorage.setItem(TEXT_PACE_KEY, "instant");
      showScene(${JSON.stringify(MULTI)});
      return __view();
    })())`));
    check(!persisted.pending, "C: stored instant setting did not carry into a fresh page");

    const blocked = withParagraphDom(loadGame(ROOT));
    const b = JSON.parse(blocked.evaluate(`JSON.stringify((() => {
      __fresh();
      const realGet = localStorage.getItem, realSet = localStorage.setItem;
      localStorage.getItem = () => { throw new Error("blocked"); };
      localStorage.setItem = () => { throw new Error("blocked"); };
      const out = { pace: readTextPace() };
      showScene(${JSON.stringify(MULTI)});
      out.pacedView = __view();
      out.toggled = toggleTextPace();
      showScene(${JSON.stringify(MULTI)});
      out.instantView = __view();
      localStorage.getItem = realGet; localStorage.setItem = realSet;
      return out;
    })())`));
    check(b.pace === "paced" && b.pacedView.pending, `C: blocked storage did not default to paced: ${JSON.stringify(b)}`);
    check(b.toggled === "instant" && !b.instantView.pending, `C: blocked storage toggle did not hold for the session: ${JSON.stringify(b)}`);
  }

  // D. Resume and re-render arrive whole; the first look after the intro is paced.
  {
    const runtime = withParagraphDom(loadGame(ROOT));
    const r = JSON.parse(runtime.evaluate(`JSON.stringify((() => {
      const out = {};
      __fresh(); showScene(${JSON.stringify(MULTI)}, { skipOnEnter: true });
      out.skipOnEnter = __view();
      __fresh(); showScene(${JSON.stringify(MULTI)}, { skipOnEnter: true, resume: true });
      out.resumeRender = __view();
      __fresh(); showScene(${JSON.stringify(MULTI)});
      out.beforeSave = __view();
      return out;
    })())`));
    check(!r.skipOnEnter.pending && r.skipOnEnter.hidden === 0, `D: skipOnEnter re-render replayed the reveal: ${JSON.stringify(r.skipOnEnter)}`);
    check(!r.resumeRender.pending && r.resumeRender.hidden === 0, `D: resume render replayed the reveal: ${JSON.stringify(r.resumeRender)}`);
    check(r.beforeSave.pending, "D: fixture scene was not paced before saving");

    // Real save → Continue in a fresh page (persistSave left intact here).
    const writer = withParagraphDom(loadGame(ROOT));
    const raw = writer.evaluate(`(() => {
      localStorage.clear(); resetRunState(); showScreen("game");
      showScene(${JSON.stringify(MULTI)});
      if (!sceneReveal) return null;
      persistSave({ silent: true });
      return localStorage.getItem(SAVE_KEY);
    })()`);
    check(typeof raw === "string" && raw.length > 0, "D: could not write a save mid-reveal");
    const reader = withParagraphDom(loadGame(ROOT));
    const resumed = JSON.parse(reader.evaluate(`JSON.stringify((() => {
      localStorage.clear(); localStorage.setItem(SAVE_KEY, ${JSON.stringify(raw || "")});
      const ok = loadGame();
      return Object.assign(__view(), { ok });
    })())`));
    check(resumed.ok && resumed.scene === MULTI && !resumed.pending && resumed.hidden === 0 && !resumed.choicesPending && resumed.controlsHidden,
      `D: Continue replayed the reveal: ${JSON.stringify(resumed)}`);

    const intro = withParagraphDom(loadGame(ROOT));
    const firstLook = JSON.parse(intro.evaluate(`JSON.stringify((() => {
      __fresh();
      persistSave = () => true;
      const started = beginFreshCampaign({ persist: true });
      showCinematic("intro");
      const behind = __view();
      finishCinematic();
      return { started, behind, after: __view() };
    })())`));
    check(firstLook.started && firstLook.after.scene === "wake" && firstLook.after.pending && firstLook.after.shown === 1,
      `D: the first look at wake after the intro was not paced: ${JSON.stringify(firstLook.after)}`);
  }

  // E. Reduced motion: still paced, no fade classes; CSS turns off fade, pulse and drift.
  {
    const runtime = withParagraphDom(loadGame(ROOT));
    const r = JSON.parse(runtime.evaluate(`JSON.stringify((() => {
      const out = {};
      __fresh(); showScene(${JSON.stringify(MULTI)}); __key("Enter");
      out.motion = __view();
      window.matchMedia = query => ({ matches: /prefers-reduced-motion:\\s*reduce/.test(query) });
      __fresh(); showScene(${JSON.stringify(MULTI)});
      out.reducedStart = __view();
      __key("Enter");
      out.reducedStep = __view();
      while (sceneReveal) __key("Enter");
      out.reducedEnd = __view();
      return out;
    })())`));
    check(r.motion.faded === 1, `E: normal motion did not fade the new paragraph: ${JSON.stringify(r.motion)}`);
    check(r.reducedStart.pending && r.reducedStep.shown === 2, `E: reduced motion stopped pacing: ${JSON.stringify(r.reducedStep)}`);
    check(r.reducedStep.faded === 0 && r.reducedEnd.faded === 0 && !r.reducedEnd.choicesFade, `E: reduced motion still faded: ${JSON.stringify(r.reducedEnd)}`);
    const css = readFileSync(resolve(ROOT, "css/paced-reveal.css"), "utf8");
    const reduced = css.slice(css.indexOf("@media (prefers-reduced-motion: reduce)"));
    check(css.includes("@media (prefers-reduced-motion: reduce)"), "E: paced-reveal.css has no reduced-motion block");
    for (const needle of [".scene-text p.reveal-fade", "#choices.reveal-fade", ".reveal-mark", "#scene-image.plate-drift-a", "#scene-image.plate-drift-b", "animation: none !important"]) {
      check(reduced.includes(needle), `E: reduced-motion block does not cover ${needle}`);
    }
    const fade = css.match(/animation:\s*reveal-fade-in\s+(\d+)ms/);
    check(fade && Number(fade[1]) <= 200, `E: reveal fade is ${fade ? fade[1] + "ms" : "missing"}, must be ≤ 200ms`);
  }

  // F. Plate drift restarts on a new plate only; the plate scales inside its clipped frame.
  {
    const runtime = withParagraphDom(loadGame(ROOT));
    const r = JSON.parse(runtime.evaluate(`JSON.stringify((() => {
      const img = document.getElementById("scene-image");
      const cls = () => ["plate-drift-a", "plate-drift-b"].filter(c => img.classList.contains(c));
      const out = {};
      __fresh(); showScene("wake", { skipOnEnter: true });
      out.first = { src: img.__ssManagedSource, cls: cls() };
      showScene("wake", { skipOnEnter: true });
      out.samePlate = { src: img.__ssManagedSource, cls: cls() };
      showScene(${JSON.stringify(MULTI)}, { skipOnEnter: true });
      out.newPlate = { src: img.__ssManagedSource, cls: cls() };
      return out;
    })())`));
    check(r.first.cls.length === 1, `F: no drift class on the first plate: ${JSON.stringify(r.first)}`);
    check(JSON.stringify(r.samePlate.cls) === JSON.stringify(r.first.cls), `F: same plate restarted its drift: ${JSON.stringify(r)}`);
    check(r.newPlate.src !== r.first.src && r.newPlate.cls.length === 1 && r.newPlate.cls[0] !== r.first.cls[0], `F: new plate did not restart its drift: ${JSON.stringify(r)}`);
    const style = readFileSync(resolve(ROOT, "css/style.css"), "utf8");
    const wrap = style.match(/#scene-image-wrap\s*\{([^}]*)\}/);
    check(wrap && /overflow:\s*hidden/.test(wrap[1]), "F: #scene-image-wrap no longer clips the drifting plate");
    const css = readFileSync(resolve(ROOT, "css/paced-reveal.css"), "utf8");
    for (const name of ["scene-plate-drift-a", "scene-plate-drift-b"]) {
      const frames = css.match(new RegExp(`@keyframes ${name}\\s*\\{([\\s\\S]*?)\\n\\}`));
      check(frames && /transform:\s*scale\(1\)/.test(frames[1]) && !/opacity|translate|width|height|margin/.test(frames[1]), `F: ${name} must be a transform-only scale`);
    }
  }

  // G. Markup and composition contract.
  {
    const index = readFileSync(resolve(ROOT, "index.html"), "utf8");
    const css = readFileSync(resolve(ROOT, "css/paced-reveal.css"), "utf8");
    const order = ['href="css/pc-viewport.css"', 'href="css/paced-reveal.css"'].map(s => index.indexOf(s));
    check(order[0] >= 0 && order[1] > order[0], "G: paced-reveal.css must load after pc-viewport.css");
    const flow = ['id="story"', 'id="reveal-controls"', 'id="choices"'].map(s => index.indexOf(s));
    check(flow.every(i => i >= 0) && flow[0] < flow[1] && flow[1] < flow[2], "G: reading order must be story, reveal controls, choices");
    check(/id="reveal-controls" class="hidden"/.test(index), "G: reveal controls must start hidden");
    check(/id="reveal-next"[^>]*aria-label=/.test(index) && /id="reveal-all"[^>]*aria-label=/.test(index), "G: reveal controls need aria-labels");
    check(/<div class="title-actions">[\s\S]*id="btn-text-pace"[\s\S]*<\/div>/.test(index), "G: Text setting missing from the title utilities");
    check(/<div class="meta-actions">\s*<button id="meta-text-pace"/.test(index), "G: Text setting missing from the in-run meta bar");
    check(/#choices\.reveal-pending\s*\{\s*display:\s*none;/.test(css), "G: pending choices are not hidden");
    // The short-desktop rule that puts choices after the text lives in pc-viewport.css since #510.
    const pcv = readFileSync(resolve(ROOT, "css/pc-viewport.css"), "utf8");
    const deskAt = pcv.search(/@media\s*\(min-width:\s*1024px\)\s*and\s*\(max-height:\s*800px\)/);
    const desk = deskAt >= 0 ? pcv.slice(deskAt).match(/#choices\s*\{([^}]*)\}/) : null;
    check(desk && /position:\s*static/.test(desk[1]), "G: short-desktop choices are not back in normal flow after the text");
    const sticky = css.match(/#main\.reveal-active\.reveal-roomy #reveal-controls\s*\{([^}]*)\}/);
    check(sticky && /position:\s*sticky/.test(sticky[1]) && /bottom:\s*0/.test(sticky[1]), "G: Read on must stay in view while text waits (sticky at the bottom of #main when it has room)");
    check(!/#main\.reveal-active #reveal-controls\s*\{[^}]*position:\s*sticky/.test(css), "G: the sticky Read on must depend on #main having room (.reveal-roomy), not apply everywhere");
    const engineSrc = readFileSync(resolve(ROOT, "src/engine.js"), "utf8");
    const roomAt = Number((engineSrc.match(/REVEAL_STICKY_MIN_HEIGHT\s*=\s*(\d+)/) || [])[1]);
    // Above the bar's own 66px, and at most 176px so a portrait phone (#main about 178px at 390x844) keeps the sticky bar.
    check(roomAt > 66 && roomAt <= 176 && /classList\.toggle\("reveal-roomy"/.test(engineSrc), "G: engine must mark #main reveal-roomy by its own height, with a threshold between 67 and 176px");
    // Muse crop check: tether_dock_ruined.jpg's subject already meets the frame edge, so it never drifts.
    check(/#scene-image\.plate-drift-a\[src\$="\/tether_dock_ruined\.jpg"\][\s\S]*?animation:\s*none/.test(css), "G: tether_dock_ruined.jpg must be excluded from the plate drift (Muse crop check)");
  }

  return errors;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const errors = sunPlayerflowPacedRevealChecks();
  if (errors.length) {
    console.error("FAIL sun-playerflow-paced-reveal", errors);
    process.exit(1);
  }
  console.log("PASS sun-playerflow-paced-reveal (harness stays instant; blocks = paragraphs; choices held to the last block; keys/controls/focus/settle; instant + blocked storage; resume/re-render whole; reduced motion; plate drift; desktop flow)");
}
