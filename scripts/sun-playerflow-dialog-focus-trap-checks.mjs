// SUN-TUTORIAL-DIALOG-01 — an open aria-modal dialog keeps keyboard focus and closes on Escape.
// Muse (PR #565 review): Tab from the first-run tutorial's "Got it" landed on #reveal-next behind
// the card, and Escape did nothing. The same gap was on the title's new-run confirm and Commander
// create dialogs (and SUN-SAVED-RUNS-01's Saved runs dialog is held to the same). The crew sheet already traps Tab and closes on Escape in its own listener.
// Headless: each dialog's tab stops are read from index.html, so a new control in the markup is
// covered without editing this file. A real-browser pass is in the PR body.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadGame } from "./simulate.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const HTML = readFileSync(resolve(ROOT, "index.html"), "utf8");
const SEEN_KEY = "sunsplitter_tutorial_seen_v1";

// Inner markup of the element carrying id="<id>", matched to its own closing tag.
function elementMarkup(id) {
  const open = new RegExp(`<(\\w+)\\b[^>]*\\bid="${id}"[^>]*>`).exec(HTML);
  assert.ok(open, `index.html has no #${id}`);
  const tag = open[1];
  const re = new RegExp(`<(/?)${tag}\\b[^>]*>`, "g");
  re.lastIndex = open.index + open[0].length;
  let depth = 1;
  for (let m; (m = re.exec(HTML));) {
    depth += m[1] ? -1 : 1;
    if (!depth) return HTML.slice(open.index + open[0].length, m.index);
  }
  throw new Error(`#${id} never closes in index.html`);
}

// Tab stops in DOM order: controls, minus unchecked radios in a group that has a checked one.
function markupStops(id) {
  const controls = [...elementMarkup(id).matchAll(/<(button|select|input|textarea)\b([^>]*)>/g)].map(([, tag, attrs]) => {
    const attr = name => (new RegExp(`\\b${name}="([^"]*)"`).exec(attrs) || [])[1];
    return { tag, id: attr("id") || "", type: attr("type") || "", name: attr("name") || "", checked: /\bchecked\b/.test(attrs) };
  });
  return controls.filter(c => c.type !== "radio" || c.checked || !controls.some(o => o.type === "radio" && o.name === c.name && o.checked));
}

const DIALOGS = [
  { id: "tutorial-overlay", primary: "tutorial-dismiss", open: "showTutorialOverlay()" },
  { id: "new-run-confirm", primary: "new-run-ok", open: "showNewRunConfirm()" },
  { id: "commander-create", primary: "commander-create-ok", open: "showCommanderCreate()" },
  // SUN-SAVED-RUNS-01: opens on the checked row's radio (slot 1 with nothing saved).
  { id: "saved-runs", primary: "saved-runs-slot-1", open: "showSavedRuns()" }
];

// Fresh engine with a focus model and the dialog's real controls behind querySelectorAll.
function bootDialog(spec) {
  const runtime = loadGame(ROOT);
  const stops = markupStops(spec.id);
  assert.ok(stops.length >= 2, `${spec.id}: expected at least two tab stops in index.html`);
  runtime.evaluate(`(() => {
    const proto = Object.getPrototypeOf(document.getElementById("story"));
    proto.focus = function () { document.activeElement = this; };
    proto.contains = function (node) { return node === this; };
    resetRunState();
    showScreen("game");
    showScene("wake");
    const dialog = document.getElementById(${JSON.stringify(spec.id)});
    const controls = ${JSON.stringify(stops)}.map((c, i) => {
      const el = c.id ? document.getElementById(c.id) : document.createElement(c.tag);
      el.tagName = c.tag.toUpperCase(); el.type = c.type; el.name = c.name; el.checked = c.checked;
      el.__stopLabel = c.id || (c.tag + "[" + c.name + "]");
      return el;
    });
    dialog.querySelectorAll = () => controls;
    dialog.contains = node => node === dialog || controls.includes(node);
    globalThis.__stops = controls;
    globalThis.__label = el => (el && (el.__stopLabel || el.id)) || null;
    globalThis.__press = (key, shiftKey = false) => {
      const event = { key, shiftKey, target: document.activeElement, defaultPrevented: false, repeat: false,
        altKey: false, ctrlKey: false, metaKey: false,
        preventDefault() { this.defaultPrevented = true; }, stopPropagation() {}, stopImmediatePropagation() {} };
      const swallowed = handleModalDialogKeydown(event);
      // A Tab the dialog does not take is the browser's: step to the neighbouring control in DOM order.
      if (key === "Tab" && !event.defaultPrevented) {
        const i = controls.indexOf(document.activeElement);
        const next = i < 0 ? null : controls[i + (shiftKey ? -1 : 1)];
        document.activeElement = next || document.getElementById(shiftKey ? "btn-crew" : "reveal-next");
      }
      if (!event.defaultPrevented && typeof handleGameplayKeydown === "function") handleGameplayKeydown(event);
      return { swallowed: !!swallowed, prevented: event.defaultPrevented };
    };
  })()`);
  return { runtime, stops: stops.map(c => c.id || `${c.tag}[${c.name}]`) };
}

// vm-realm values: compare as plain JSON.
const plain = value => JSON.parse(JSON.stringify(value));
const isOpen = id => `(() => { const el = document.getElementById(${JSON.stringify(id)}); return el.classList.contains("visible") && !el.classList.contains("hidden"); })()`;
const results = [];

for (const spec of DIALOGS) {
  // 1. Tab and Shift+Tab never leave the dialog, and both directions visit every stop.
  {
    const { runtime, stops } = bootDialog(spec);
    const run = plain(runtime.evaluate(`(() => {
      document.activeElement = document.getElementById("story");
      ${spec.open};
      const opened = __label(document.activeElement);
      const forward = [], back = [];
      for (let i = 0; i < __stops.length * 2; i++) { __press("Tab"); forward.push(__label(document.activeElement)); }
      for (let i = 0; i < __stops.length * 2; i++) { __press("Tab", true); back.push(__label(document.activeElement)); }
      document.activeElement = document.getElementById("reveal-next");
      const fromOutside = __press("Tab");
      const outsideLanding = __label(document.activeElement);
      return { opened, forward, back, fromOutside, outsideLanding, stillOpen: ${isOpen(spec.id)} };
    })()`));
    assert.equal(run.opened, spec.primary, `${spec.id}: focus did not move to its primary control on open`);
    for (const [dir, seen] of [["Tab", run.forward], ["Shift+Tab", run.back]]) {
      const strays = seen.filter(label => !stops.includes(label));
      assert.deepEqual(strays, [], `${spec.id}: ${dir} left the dialog for ${strays.join(", ")}`);
      assert.deepEqual([...new Set(seen)].sort(), [...stops].sort(), `${spec.id}: ${dir} did not cycle through every control`);
    }
    assert.ok(run.fromOutside.prevented, `${spec.id}: Tab from behind the dialog was not pulled back in`);
    assert.equal(run.outsideLanding, stops[0], `${spec.id}: Tab from behind the dialog did not land on its first control`);
    assert.ok(run.stillOpen, `${spec.id}: Tab closed the dialog`);
  }
  // 2. Escape closes it through its own cancel path and gives focus back to the opener.
  {
    const { runtime } = bootDialog(spec);
    const run = plain(runtime.evaluate(`(() => {
      const opener = document.getElementById("story");
      document.activeElement = opener;
      ${spec.open};
      const scene = state.scene;
      const esc = __press("Escape");
      return { esc, open: ${isOpen(spec.id)}, focus: __label(document.activeElement), sceneKept: state.scene === scene,
        seen: localStorage.getItem(${JSON.stringify(SEEN_KEY)}) };
    })()`));
    assert.ok(run.esc.swallowed && run.esc.prevented, `${spec.id}: Escape was not handled by the dialog`);
    assert.equal(run.open, false, `${spec.id}: Escape did not close the dialog`);
    assert.equal(run.focus, "story", `${spec.id}: Escape did not return focus to the opener`);
    assert.ok(run.sceneKept, `${spec.id}: Escape changed the scene behind the dialog`);
    if (spec.id === "tutorial-overlay") assert.equal(run.seen, "1", "tutorial: Escape did not mark the tutorial seen");
    else assert.equal(run.seen, null, `${spec.id}: Escape marked the tutorial seen`);
  }
  results.push(spec.id);
}

// 3. Tutorial: Escape writes exactly what Skip writes (same storage writes, nothing else).
const storageWrites = how => {
  const { runtime } = bootDialog(DIALOGS[0]);
  return plain(runtime.evaluate(`(() => {
    showTutorialOverlay();
    const writes = [];
    const setItem = localStorage.setItem;
    localStorage.setItem = (k, v) => { writes.push([k, String(v)]); return setItem(k, v); };
    ${how};
    localStorage.setItem = setItem;
    return { writes, open: ${isOpen("tutorial-overlay")} };
  })()`));
};
{
  const viaSkip = storageWrites(`skipTutorial()`);
  const viaEscape = storageWrites(`__press("Escape")`);
  assert.equal(viaSkip.open, false, "tutorial: Skip did not close the card");
  assert.deepEqual(viaEscape, viaSkip, "tutorial: Escape and Skip wrote different storage");
  assert.deepEqual(viaEscape.writes, [[SEEN_KEY, "1"]], "tutorial: Escape wrote something other than the seen key");
}

// 4. Opener hidden behind the card (the intro's controls after it finishes): focus goes to the
//    first story control, Read on while paragraphs wait, else the story region.
{
  const { runtime } = bootDialog(DIALOGS[0]);
  const run = plain(runtime.evaluate(`(() => {
    const gone = document.getElementById("cinematic-next");
    gone.getClientRects = () => [];
    const reveal = document.getElementById("reveal-controls");
    document.activeElement = gone;
    reveal.classList.remove("hidden");
    showTutorialOverlay();
    __press("Escape");
    const withReveal = __label(document.activeElement);
    document.activeElement = gone;
    reveal.classList.add("hidden");
    showTutorialOverlay();
    __press("Escape");
    const withoutReveal = __label(document.activeElement);
    return { withReveal, withoutReveal };
  })()`));
  assert.equal(run.withReveal, "reveal-next", "tutorial: hidden opener did not fall back to Read on");
  assert.equal(run.withoutReveal, "story", "tutorial: hidden opener did not fall back to the story region");
}

console.log(`PASS sun-playerflow-dialog-focus-trap: ${results.join(", ")} trap Tab/Shift+Tab and close on Escape with focus returned; tutorial Escape = Skip; hidden opener falls back to the story`);
