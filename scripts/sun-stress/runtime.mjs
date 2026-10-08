import { loadGame } from "../simulate.mjs";
import { resourceFailures, paymentFailures, speechFailures, endingFailures, saveFailures, plainText } from "./checks.mjs";

export function createStressRuntime(root) {
  const runtime = loadGame(root);
  // Existing checks manually clear stub children before every showScene. Model
  // the real DOM setter here instead, including redirected renders and resumes.
  const choices = runtime.browser.document.getElementById("choices");
  let html = choices.innerHTML;
  Object.defineProperty(choices, "innerHTML", { get: () => html, set(value) { html = value; this.children = []; }, configurable: true });
  const host = { resourceFailures, paymentFailures, speechFailures, endingFailures, saveFailures, plainText };
  Object.assign(runtime.context, { __stressChecks: host });
  runtime.evaluate(`(${install.toString()})();`);
  return runtime;
}

// Executed inside the existing real-engine VM. Wrappers observe calls and retain
// the real handlers, effects, entry redirects, clamping and persistence code.
function install() {
  const clone = value => JSON.parse(JSON.stringify(value));
  const checks = globalThis.__stressChecks;
  const keys = ["survivors", "integrity", "cohesion", "supplies", "embryos"];
  const stats = () => Object.fromEntries(keys.map(key => [key, state[key]]));
  let current = null;
  let selected = null;
  let receipts = [];
  const originalStats = updateStats;
  updateStats = function(changes = {}) {
    const before = stats();
    const result = originalStats(changes);
    if (selected && changes === selected.effects) receipts.push({ before, after: stats(), changes });
    if (current) current.failures.push(...checks.paymentFailures({ before, after: stats(), changes, choice: selected?.text || null }).map(f => locate(f)));
    return result;
  };
  const originalChoice = makeChoice;
  makeChoice = function(choice) {
    selected = choice;
    receipts = [];
    // Observe the exact closure-captured rendered choice, not a second getter.
    if (current) {
      current.choice = clone(choice);
      const before = stats();
      for (const key of keys) if (Number(choice.effects?.[key]) < 0 && before[key] + choice.effects[key] < 0) current.failures.push(locate({ rule: "enabled_unaffordable_choice", key, before: before[key], cost: -choice.effects[key] }));
    }
    try {
      const result = originalChoice(choice);
      if (current) for (const key of keys) {
        const expected = Number(choice.effects?.[key]);
        const actual = receipts.reduce((sum, receipt) => sum + receipt.after[key] - receipt.before[key], 0);
        if (expected < 0 && actual !== expected) current.failures.push(locate({ rule: "advertised_cost_not_paid", key, cost: -expected, actual, choice: choice.text }));
      }
      return result;
    } finally { selected = null; }
  };
  function locate(failure) { return { seed: current.seed, step: current.step, scene: current.scene, ...failure }; }
  function rng(seed) {
    let value = seed >>> 0;
    return () => { value += 0x6D2B79F5; let next = value; next = Math.imul(next ^ next >>> 15, next | 1); next ^= next + Math.imul(next ^ next >>> 7, next | 61); return ((next ^ next >>> 14) >>> 0) / 4294967296; };
  }
  function reset(seed) {
    current = null;
    cancelCinematic();
    localStorage.clear();
    resetRunState();
    document.getElementById("ending-title").textContent = "";
    document.getElementById("ending-text").textContent = "";
    Math.random = rng(seed ^ 0x53554e);
    showScreen("game");
    showScene("wake");
  }
  function absent() {
    return Object.keys(crew).filter(key => !isAlive(key)).map(key => ({ key, name: crew[key].first || crew[key].name.split(" ")[0] }));
  }
  function inspectView() {
    const stateCopy = clone(state);
    const ending = { title: document.getElementById("ending-title").textContent, text: document.getElementById("ending-text").textContent };
    current.failures.push(...checks.resourceFailures(stateCopy).map(locate));
    const text = ending.title ? ending.text : checks.plainText(document.getElementById("story").innerHTML);
    current.failures.push(...checks.speechFailures(text, absent()).map(locate));
    if (ending.title) {
      finishCinematic();
      if (document.getElementById("ending-screen").classList.contains("hidden")) current.failures.push(locate({ rule: "ending_screen_hidden" }));
      showWhatRemains();
      const rendered = document.getElementById("what-remains-text").textContent.split(/\n\n+/);
      if (document.getElementById("what-remains-screen").classList.contains("hidden")) current.failures.push(locate({ rule: "what_remains_screen_hidden" }));
      current.failures.push(...checks.endingFailures(stateCopy, ending, rendered, clone(crew)).map(locate));
    }
    return ending;
  }
  globalThis.__stressRun = function(options) {
    const { seed, maxSteps, saveEvery } = options;
    const random = rng(seed), visits = new Map(), trace = [], saves = [];
    try { reset(seed); }
    catch (error) { return { seed, steps: 0, completed: false, ending: null, state: clone(state), failures: [{ seed, step: 0, scene: state.scene || "wake", rule: "runtime_exception", message: error.stack || error.message }], trace, saves }; }
    current = { seed, step: 0, scene: state.scene, failures: [], choice: null };
    let ending = null, stopped = false;
    for (let step = 0; step <= maxSteps; step++) {
      current.step = step; current.scene = state.scene;
      try { ending = inspectView(); }
      catch (error) { current.failures.push(locate({ rule: "runtime_exception", message: error.stack || error.message })); stopped = true; break; }
      if (ending.title) { stopped = true; break; }
      if (!scenes[state.scene]) { current.failures.push(locate({ rule: "missing_scene" })); stopped = true; break; }
      if (document.getElementById("game-screen").classList.contains("hidden")) { current.failures.push(locate({ rule: "game_screen_hidden" })); stopped = true; break; }
      const buttons = document.getElementById("choices").children.filter(b => !b.disabled && typeof b.onclick === "function");
      if (!buttons.length) { current.failures.push(locate({ rule: "no_enabled_choice" })); stopped = true; break; }
      const signature = JSON.stringify(state);
      const count = (visits.get(signature) || 0) + 1; visits.set(signature, count);
      if (count >= 12) { current.failures.push(locate({ rule: "repeated_identical_state", visits: count })); stopped = true; break; }
      if (step === maxSteps) break;
      const index = Math.floor(random() * buttons.length), button = buttons[index];
      const at = { step, scene: state.scene, enabledIndex: index, label: checks.plainText(button.innerHTML) };
      try { button.onclick(); }
      catch (error) { current.failures.push(locate({ rule: "runtime_exception", message: error.stack || error.message })); stopped = true; break; }
      trace.push({ ...at, next: state.scene, choice: current.choice });
      if (saveEvery > 0 && ((step + 1) % saveEvery === 0 || state.scene === "ending_check")) saves.push({ seed, step: step + 1, scene: state.scene, before: clone(state), raw: readRawSave() });
    }
    if (!stopped) current.failures.push(locate({ rule: "step_limit", maxSteps }));
    const result = { seed, steps: trace.length, completed: !!ending?.title, ending, state: clone(state), failures: current.failures, trace, saves };
    current = null; cancelCinematic(); return result;
  };
  globalThis.__stressResume = function(probe) {
    const failures = [];
    try {
      reset(probe.seed);
      localStorage.clear();
      localStorage.setItem(SAVE_KEY, probe.raw);
      const restored = resumeGame();
      failures.push(...checks.saveFailures(probe.before, clone(state), restored));
      if (restored && probe.scene === "ending_check") {
        finishCinematic();
        if (document.getElementById("ending-screen").classList.contains("hidden")) failures.push({ rule: "resumed_ending_screen_hidden" });
        const ending = { title: document.getElementById("ending-title").textContent, text: document.getElementById("ending-text").textContent };
        showWhatRemains();
        failures.push(...checks.endingFailures(clone(state), ending, document.getElementById("what-remains-text").textContent.split(/\n\n+/), clone(crew)));
      } else if (restored && document.getElementById("game-screen").classList.contains("hidden")) failures.push({ rule: "resumed_game_screen_hidden" });
    } catch (error) { failures.push({ rule: "save_resume_exception", message: error.stack || error.message }); }
    cancelCinematic();
    return failures.map(f => ({ seed: probe.seed, step: probe.step, scene: probe.scene, ...f }));
  };
  // A separate boundary probe starts from a legally reached autosave, then
  // invokes a visible disabled offer directly. This is not a random UI click.
  // It exposes handler refusal independently of render-time affordability.
  globalThis.__stressUnpaidBoundary = function(probe) {
    reset(probe.seed); localStorage.clear(); localStorage.setItem(SAVE_KEY, probe.raw);
    if (!resumeGame() || state.scene === "ending_check") return null;
    const scene = scenes[state.scene];
    const choices = typeof scene.choices === "function" ? scene.choices() : scene.choices || [];
    const offer = choices.find(c => (!c.alive || isAlive(c.alive)) && (!c.aliveAll || c.aliveAll.every(isAlive)) && (!c.aliveAny || c.aliveAny.some(isAlive)) && keys.some(key => Number(c.effects?.[key]) < 0 && state[key] + c.effects[key] < 0));
    if (!offer) return null;
    const disabled = document.getElementById("choices").children.some(b => b.disabled && checks.plainText(b.innerHTML).startsWith(offer.text));
    if (!disabled) return null;
    const before = JSON.stringify(state), saved = readRawSave();
    makeChoice(offer);
    const refused = before === JSON.stringify(state) && saved === readRawSave();
    cancelCinematic();
    return { seed: probe.seed, step: probe.step, scene: probe.scene, kind: "boundary", choice: clone(offer), refused, ...(refused ? {} : { rule: "unaffordable_handler_not_refused", blockedBy: "BLOCKED_BY_PR#442" }) };
  };
}

export function runSeed(runtime, saveRuntime, options) {
  runtime.context.__stressOptions = options;
  const result = runtime.evaluate("__stressRun(__stressOptions)", 30_000);
  for (const probe of result.saves) {
    saveRuntime.context.__stressProbe = probe;
    result.failures.push(...saveRuntime.evaluate("__stressResume(__stressProbe)", 5_000));
    if (options.boundaryProbe && !result.boundary) result.boundary = saveRuntime.evaluate("__stressUnpaidBoundary(__stressProbe)", 5_000);
  }
  result.saveProbes = result.saves.length;
  delete result.saves;
  return result;
}
