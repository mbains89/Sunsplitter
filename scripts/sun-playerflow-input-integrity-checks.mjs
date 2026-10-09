// SUN-036-INPUT-INTEGRITY-01: real rendered handlers, with a deterministic clock.
// DOM/event shims model button replacement and hit-testing onto the next scene;
// Chromium evidence separately covers actual layout, touch and fullscreen.
import assert from "node:assert/strict";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadGame } from "./simulate.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const runtime = loadGame(root);
const result = runtime.evaluate(`(${checks.toString()})()`);
for (const failure of result.failures) console.error("FAIL " + failure);
assert.equal(result.failures.length, 0, "input integrity regressions");
console.log("PASS sun-playerflow-input-integrity (" + result.activations + " input rows; " + result.viewports + " viewport rows; stale/disabled/refused callbacks; later pointer control)");

function checks() {
  const failures = [];
  const check = (ok, label) => { if (!ok) failures.push(label); };
  let clock = 10000;
  Date.now = () => clock;
  const choices = document.getElementById("choices");
  Object.defineProperty(choices, "innerHTML", {
    get() { return this.__html || ""; },
    set(value) { this.__html = value; this.children = []; }, configurable: true
  });
  const create = document.createElement;
  document.createElement = function(tag) {
    const element = create(tag), listeners = new Map();
    element.addEventListener = (type, fn) => {
      if (!listeners.has(type)) listeners.set(type, []);
      listeners.get(type).push(fn);
    };
    element.dispatchEvent = event => {
      event.target = element;
      event.preventDefault = () => { event.defaultPrevented = true; };
      for (const fn of listeners.get(event.type) || []) fn.call(element, event);
      if (event.type === "click" && !element.disabled && element.onclick) element.onclick(event);
      return !event.defaultPrevented;
    };
    return element;
  };
  let commits = 0, payments = [], selected = null;
  const choose = makeChoice, stats = updateStats;
  makeChoice = function(choice) {
    commits++;
    selected = choice;
    try { return choose(choice); } finally { selected = null; }
  };
  const keys = ["survivors", "integrity", "cohesion", "supplies", "embryos"];
  updateStats = function(effects) {
    const before = Object.fromEntries(keys.map(k => [k, state[k]]));
    const result = stats(effects);
    if (effects === selected?.effects) payments.push({ effects, delta: Object.fromEntries(keys.map(k => [k, state[k] - before[k]])) });
    return result;
  };
  const emit = (button, type, detail = 0) => button.dispatchEvent({ type, detail });
  const enabled = () => gameplayChoiceButtons().filter(b => !b.disabled);
  const snapshot = () => JSON.stringify({ state,
    enabled: enabled().map(b => b.innerHTML),
    saves: [SAVE_KEY, SAVE_KEY_LEGACY, SAVE_STAGING_KEY, SAVE_BACKUP_KEY].map(k => localStorage.getItem(k)),
    visible: !document.getElementById("game-screen").classList.contains("hidden")
  });
  // Legal early costed start points from sun-stress-run seeds 37001–37003.
  const fixtures = [
    { seed: 37001, scene: "intro_lena", path: [0], index: 0 },
    { seed: 37002, scene: "dying", path: [1], index: 0 },
    { seed: 37003, scene: "rourke_stop", path: [1, 1], index: 0 }
  ];
  const prepare = fixture => {
    clock += 1000;
    cancelCinematic(); localStorage.clear(); resetRunState();
    showScreen("game"); showScene("wake");
    for (const index of fixture.path) { enabled()[index].onclick(); clock += 1000; }
    check(state.scene === fixture.scene, "fixture " + fixture.seed + " reached " + state.scene);
    persistSave({ silent: true });
    commits = 0; payments = [];
    return enabled()[fixture.index];
  };
  let activations = 0, viewports = 0;
  for (const [width, height] of [[390, 844], [1280, 800], [1920, 1080]]) {
    window.innerWidth = width; window.innerHeight = height;
    window.devicePixelRatio = 1;
    window.matchMedia = query => ({ matches: query.includes("max-width") ? window.innerWidth <= 600 : false,
      media: query, addEventListener() {}, removeEventListener() {} });
    for (const fixture of fixtures) {
      for (const sequence of ["click", "tap", "double-tap", "touchstart+touchend+click", "dblclick", "rapid double click"]) {
        const button = prepare(fixture), label = width + "x" + height + " seed=" + fixture.seed + " " + sequence;
        const source = scenes[state.scene];
        const offer = (typeof source.choices === "function" ? source.choices() : source.choices)
          .find(c => button.innerHTML.includes(c.text));
        check(!!offer, label + " rendered offer found");
        if (sequence.includes("tap") || sequence.startsWith("touchstart")) {
          emit(button, "touchstart"); emit(button, "touchend");
        }
        emit(button, "click", 1);
        const once = snapshot();
        // The second physical click can land on a NEW button at the same place.
        const next = enabled()[0];
        clock += 40;
        if (sequence === "double-tap") {
          emit(next, "touchstart"); emit(next, "touchend"); emit(next, "click", 1);
        }
        if (sequence === "dblclick") { emit(next, "click", 2); emit(next, "dblclick", 2); }
        if (sequence === "rapid double click") emit(next, "click", 1);
        check(commits === 1, label + ": expected 1 commit, got " + commits);
        check(snapshot() === once, label + ": repeated input changed state/save/choices");
        for (const key of keys) {
          const cost = offer?.effects?.[key];
          if (cost < 0) check(payments.reduce((n, p) => n + p.delta[key], 0) === cost,
            label + ": exact single debit for " + key);
        }
        check(state.scene === offer?.next, label + ": expected scene " + offer?.next + ", got " + state.scene);
        activations++;
      }
      prepare(fixture);
      for (const action of ["resize", "zoom+dpr", "orientation", "fullscreen"]) {
        const before = snapshot();
        if (action === "resize") for (const [w, h] of [[1920, 1080], [390, 844], [1280, 800]]) {
          window.innerWidth = w; window.innerHeight = h; window.dispatchEvent({ type: "resize" });
        }
        if (action === "zoom+dpr") { window.devicePixelRatio = 2; window.dispatchEvent({ type: "resize" }); }
        if (action === "orientation") for (const [w, h] of [[844, 390], [390, 844]]) {
          window.innerWidth = w; window.innerHeight = h; window.dispatchEvent({ type: "orientationchange" }); window.dispatchEvent({ type: "resize" });
        }
        if (action === "fullscreen") for (const element of [document.getElementById("app"), null]) {
          document.fullscreenElement = element; document.dispatchEvent({ type: "fullscreenchange" }); window.dispatchEvent({ type: "resize" });
        }
        check(snapshot() === before, fixture.seed + " " + action + ": state/save/choices changed");
        viewports++;
      }
    }
  }
  const stale = prepare(fixtures[1]); emit(stale, "click", 1);
  const once = snapshot(); clock += 1000; emit(stale, "click", 1);
  check(snapshot() === once && commits === 1, "detached button cannot commit again after cooldown");
  emit(enabled()[0], "click", 1);
  check(commits === 2, "fresh pointer activation works after cooldown");
  const unpaid = prepare(fixtures[0]); state.supplies = 0;
  const beforeRefusal = snapshot(); emit(unpaid, "click", 1);
  check(snapshot() === beforeRefusal, "stale unaffordable choice refuses atomically");
  emit(enabled()[1], "click", 1);
  check(state.scene !== fixtures[0].scene, "refused choice does not lock a legal alternative");
  const disabled = prepare(fixtures[0]); disabled.disabled = true;
  const beforeDisabled = snapshot(); disabled.onclick({ detail: 1 });
  check(snapshot() === beforeDisabled, "disabled callback cannot commit");
  cancelCinematic();
  return { failures, activations, viewports };
}
