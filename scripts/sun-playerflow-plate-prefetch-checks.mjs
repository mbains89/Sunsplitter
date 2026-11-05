// SUN-034-PLATE-PREFETCH-01 — next enabled plates are warmed without touching state.
// Drives real scripts through simulate.loadGame. Does not edit game code.
import { pathToFileURL } from "node:url";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadGame } from "./simulate.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function installImage(runtime) {
  runtime.evaluate(`(() => {
    globalThis.__plateRequests = [];
    function StubImage() { this.decode = () => Promise.resolve(); }
    Object.defineProperty(StubImage.prototype, "src", {
      set(value) { globalThis.__plateRequests.push(String(value)); },
      get() { return ""; }
    });
    globalThis.Image = StubImage;
  })()`);
}

export function sunPlayerflowPlatePrefetchChecks() {
  const errors = [];
  const runtime = loadGame(ROOT);
  installImage(runtime);
  const requested = runtime.evaluate(`(() => {
    resetRunState();
    globalThis.__plateRequests = [];
    warmedPlates.length = 0;
    warmedPlateSet.clear();
    showScene("crisis", { skipOnEnter: true });
    const current = document.getElementById("scene-image").__ssManagedSource || "";
    const expected = [];
    const seen = new Set();
    const list = (scenes.crisis.choices || []).filter(c => {
      if (!c || (c.alive && !isAlive(c.alive))) return false;
      if (c.aliveAll && !c.aliveAll.every(k => isAlive(k))) return false;
      if (c.aliveAny && !c.aliveAny.some(k => isAlive(k))) return false;
      if (c.requires && !meetsRequirements(c.requires)) return false;
      if (c.effects && !canAffordEffects(c.effects)) return false;
      return true;
    }).slice(0, 3);
    for (const choice of list) {
      if (!choice.next || !scenes[choice.next]) continue;
      const src = resolveSceneImage(choice.next, scenes[choice.next]) || "";
      if (!src || src === current || seen.has(src)) continue;
      seen.add(src);
      expected.push(src);
    }
    const counts = {};
    for (const src of globalThis.__plateRequests) counts[src] = (counts[src] || 0) + 1;
    return { expected, counts, requests: globalThis.__plateRequests.slice() };
  })()`);
  if (!requested || !requested.expected.length) errors.push("no enabled next plates to warm");
  else {
    for (const src of requested.expected) {
      if (requested.counts[src] !== 1) errors.push("plate " + src + " requested " + (requested.counts[src] || 0) + " times");
    }
  }

  const digest = runtime.evaluate(`(() => {
    resetRunState();
    showScene("crisis", { skipOnEnter: true });
    const before = JSON.stringify(state);
    prefetchChoicePlates((scenes.crisis.choices || []).slice(0, 3));
    return { same: JSON.stringify(state) === before };
  })()`);
  if (!digest || digest.same !== true) errors.push("prefetch changed the state digest");

  const cap = runtime.evaluate(`(() => {
    resetRunState();
    warmedPlates.length = 0;
    warmedPlateSet.clear();
    globalThis.__plateRequests = [];
    let max = 0;
    const ids = Object.keys(scenes).slice(0, 50);
    for (const id of ids) {
      try { showScene(id, { skipOnEnter: true }); }
      catch (e) { return { threw: String(e), max }; }
      if (warmedPlates.length > max) max = warmedPlates.length;
    }
    return { threw: "", max, size: warmedPlates.length };
  })()`);
  if (!cap || cap.threw) errors.push("prefetch threw over 50 renders: " + (cap && cap.threw));
  else if (cap.max > 6) errors.push("warmed cache held " + cap.max + " entries");

  const headless = runtime.evaluate(`(() => {
    delete globalThis.Image;
    resetRunState();
    try {
      showScene("wake", { skipOnEnter: true });
      return { ok: state.scene === "wake", story: document.getElementById("story").innerHTML.length > 0 };
    } catch (e) {
      return { ok: false, error: String(e) };
    }
  })()`);
  if (!headless || headless.ok !== true || headless.story !== true) errors.push("render without Image failed: " + JSON.stringify(headless));
  return errors;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const errors = sunPlayerflowPlatePrefetchChecks();
  if (errors.length) {
    console.error("FAIL sun-playerflow-plate-prefetch", errors);
    process.exit(1);
  }
  console.log("PASS sun-playerflow-plate-prefetch (4/4: requested once, digest unchanged, cache <= 6, no Image still renders)");
}
