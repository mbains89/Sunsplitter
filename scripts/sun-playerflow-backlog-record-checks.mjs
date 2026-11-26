// SUN-BACKLOG-RECORD-01 (L-062; Wave 2 design WS1, ticket T4) — the text backlog's recorder and
// store, no UI. Drives the real scripts through simulate.loadGame.
//
// Real play: BACKLOG_RECORD_RUNS seeded runs (default 40; the no-repeat-lap runner pattern: a fresh
// campaign, recovery only through its own scenes, a seeded Math.imul LCG, #choices cleared as a
// browser would), each a real new run in slot 1, 2 or 3 played by clicking a rendered button, with
// the real autosave, and one Continue at a seeded point. At every screen: one new entry; its text
// and replies rendered with the engine's own helpers equal #story exactly; its replies equal the
// reply paragraphs printed; the order recorded on the screen left equals the label of the button
// that was clicked; a reply line whose speaker is dead or unrecovered is absent; the slot's stored
// backlog equals memory and is bound to the save just written; no other slot's key is written.
//
// Cases: Continue, a reload into a fresh runtime and the intro's first view add nothing; a fresh
// wake's remembered-ending line (#584) is kept with its entry, as printed; a resume
// re-render adds nothing; a retired-scene resume appends its exit (also through the held one-time
// entry); binding (savedAt, v, shape, caps); per-slot keys; a throwing setItem on the backlog key;
// new run, a refused new run, Play Again, clearSave and import; a staged dead and an unrecovered
// speaker; snapshotState(), the export and run state unchanged; the entry and character caps.
// Prints the measured write cost per choice.
import assert from "node:assert/strict";
import { performance } from "node:perf_hooks";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadGame } from "./simulate.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const RUNS = Number(process.env.BACKLOG_RECORD_RUNS) || 40;
const CHUNK = 20;
const MAX_STEPS = 700;
const SEED = 62;
const KEYS = { 1: "sunsplitter_backlog_v1", 2: "sunsplitter_backlog_v1_slot2", 3: "sunsplitter_backlog_v1_slot3" };

// ---------- Inside the VM ----------

// Shared helpers, installed once per runtime as globalThis.__bl.
function vmSetup(keys) {
  const choicesEl = document.getElementById("choices");
  if (!choicesEl.__clearsOnInnerHTML) {
    let html = choicesEl.innerHTML;
    Object.defineProperty(choicesEl, "innerHTML", {
      configurable: true,
      get: () => html,
      set: value => { html = String(value); choicesEl.children.length = 0; }
    });
    choicesEl.__clearsOnInnerHTML = true;
  }
  window.confirm = () => true;
  const unescape = s => s.replace(/&quot;/g, "\"").replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&amp;/g, "&");
  globalThis.__bl = {
    keys,
    raw: n => localStorage.getItem(keys[n]),
    stored: n => { const raw = localStorage.getItem(keys[n]); return raw === null ? null : JSON.parse(raw); },
    story: () => document.getElementById("story").innerHTML,
    // An entry rendered with the engine's own helpers, as showScene writes #story.
    view: entry => `<div class="scene-text">${choiceReplyHtml(entry.r || [])}${sceneTextHtml(entry.t)}${entry.m ? rememberedLineHtml(entry.m) : ""}</div>`,
    // The reply paragraphs #story printed, back to text.
    printedReplies: () => [...document.getElementById("story").innerHTML.matchAll(/<p class="choice-reply">([\s\S]*?)<\/p>/g)]
      .map(m => m[1].replace(/<br>/g, "\n")),
    mem: () => JSON.parse(JSON.stringify(runBacklog)),
    buttons: () => gameplayChoiceButtons().filter(btn => !btn.disabled && typeof btn.onclick === "function"),
    // The order text a rendered button shows (its label, without the [private]/[bond] tag).
    label: btn => {
      const m = /^<span class="choice-label">([\s\S]*?)(?: <span class="choice-tag">\[[a-z]+\]<\/span>)?<\/span>$/.exec(btn.__ssChoiceLabelHtml || "");
      return m ? unescape(m[1]) : null;
    },
    click: btn => btn.onclick({ detail: 0 }),
    snap: (scene, extra) => { resetRunState(); state.scene = scene; return JSON.stringify(Object.assign(snapshotState(), extra || {})); },
    savedAt: n => JSON.parse(readRawSave(n)).savedAt
  };
  return true;
}

// One chunk of real-play runs.
function vmPlayChunk({ chunkSeed, runs, firstRun, maxSteps }) {
  const B = globalThis.__bl;
  const now = globalThis.__perfNow;
  let seed = chunkSeed;
  // Same LCG constants as the coverage harness, multiplied with Math.imul so the arithmetic stays exact.
  const rnd = () => { seed = (Math.imul(seed, 1103515245) + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  Math.random = rnd;
  const timing = { write: [], save: [] };
  const realWrite = backlogWrite;
  backlogWrite = function timedBacklogWrite(slot, savedAt) {
    const t0 = now();
    try { return realWrite(slot, savedAt); } finally { timing.write.push(now() - t0); }
  };
  const realPersist = persistSave;
  persistSave = function timedPersistSave(opts) {
    const t0 = now();
    try { return realPersist(opts); } finally { timing.save.push(now() - t0); }
  };
  const failures = [];
  const runsOut = [];
  let droppedReplyLines = 0;
  let printedReplyLines = 0;
  let continues = 0;
  try {
    for (let r = 0; r < runs; r++) {
      const run = firstRun + r;
      const slot = (run % 3) + 1;
      const others = [1, 2, 3].filter(n => n !== slot);
      const runSeed = seed;
      const fail = (step, scene, message) => { if (failures.length < 40) failures.push({ run, slot, runSeed, step, scene, message }); };
      localStorage.clear();
      if (!beginFreshCampaign({ persist: true, slot })) { fail(0, "wake", "new run failed"); continue; }
      const fresh = B.stored(slot);
      if (!fresh || fresh.v !== 1 || fresh.gap !== false || fresh.entries.length !== 0 || fresh.savedAt !== B.savedAt(slot)) {
        fail(0, "wake", "a new run's stored backlog is not empty and bound: " + B.raw(slot));
      }
      const resumeAt = 5 + Math.floor(rnd() * 40);
      let screens = 1;
      let outcome = "capped";
      let step = 0;
      for (; step < maxSteps; step++) {
        const id = state.scene;
        if (id === "ending_check") { outcome = "ended"; break; }
        const entries = runBacklog.entries;
        const last = entries[entries.length - 1];
        if (entries.length !== screens) fail(step, id, `${entries.length} entries for ${screens} screens`);
        if (runBacklog.gap) fail(step, id, "gap set in an uninterrupted run");
        if (!last || last.s !== id) fail(step, id, "the newest entry is not the screen on display: " + (last && last.s));
        else {
          if (last.c !== null) fail(step, id, "the screen on display already has an order");
          if (B.view(last) !== B.story()) fail(step, id, "recorded text does not render to what #story showed");
          const printed = B.printedReplies();
          if (JSON.stringify(printed) !== JSON.stringify(last.r || [])) fail(step, id, "recorded replies differ from the printed reply lines");
        }
        if (step === resumeAt) {
          // Continue mid-run: the in-memory run is dropped and the slot is loaded back.
          const before = JSON.stringify(runBacklog);
          resetRunState();
          const resumed = resumeGame();
          continues += 1;
          if (!resumed || state.scene !== id) fail(step, id, "Continue did not resume the screen");
          if (JSON.stringify(runBacklog) !== before) fail(step, id, "Continue changed the backlog");
        }
        const buttons = B.buttons();
        if (!buttons.length) { outcome = "stuck"; break; }
        const btn = buttons[Math.floor(rnd() * buttons.length)];
        const label = B.label(btn);
        const scene = scenes[id];
        const list = (typeof scene.choices === "function" ? scene.choices() : scene.choices) || [];
        const taken = list.find(c => c && String(c.text) === label);
        const replyAll = choiceReplyLines(taken && taken.reply);
        const before = runBacklog.entries.length;
        B.click(btn);
        const closed = runBacklog.entries[before - 1];
        if (state.scene === id && runBacklog.entries.length === before && (!closed || closed.c === null)) {
          fail(step, id, "the click did not commit"); outcome = "threw"; break;
        }
        if (!closed || closed.c !== label) fail(step, id, `order recorded as ${JSON.stringify(closed && closed.c)}, button said ${JSON.stringify(label)}`);
        if (state.scene === "ending_check") {
          if (runBacklog.entries.length !== before) fail(step, id, "the ending was recorded as a screen");
        } else {
          screens += 1;
          const fresh = runBacklog.entries[runBacklog.entries.length - 1];
          const expected = replyAll.filter(line => !line.who || isAlive(line.who)).map(line => line.text);
          const dropped = replyAll.filter(line => line.who && !isAlive(line.who)).map(line => line.text);
          printedReplyLines += expected.length;
          droppedReplyLines += dropped.length;
          if (runBacklog.entries.length !== before + 1) fail(step, state.scene, `${runBacklog.entries.length - before} entries for one screen`);
          if (fresh && JSON.stringify(fresh.r || []) !== JSON.stringify(expected)) fail(step, state.scene, "recorded replies differ from the choice's printed lines");
          for (const text of dropped) {
            if (fresh && (fresh.r || []).includes(text)) fail(step, state.scene, "a dead or unrecovered speaker's reply line was recorded");
            if ((B.raw(slot) || "").includes(JSON.stringify(text).slice(1, -1))) fail(step, state.scene, "a dropped reply line reached the store");
          }
        }
        // The autosave wrote the slot's backlog, bound to the save it wrote, equal to memory.
        const stored = B.stored(slot);
        if (!stored || stored.savedAt !== B.savedAt(slot) || stored.gap !== runBacklog.gap ||
            JSON.stringify(stored.entries) !== JSON.stringify(runBacklog.entries)) fail(step, state.scene, "stored backlog is not memory bound to the save");
        for (const n of others) if (B.raw(n) !== null) fail(step, state.scene, `slot ${n}'s backlog key was written`);
      }
      const final = B.raw(slot) || "";
      runsOut.push({ run, slot, outcome, screens, entries: runBacklog.entries.length, chars: final.length });
    }
  } finally {
    backlogWrite = realWrite;
    persistSave = realPersist;
  }
  return { failures, runs: runsOut, timing, droppedReplyLines, printedReplyLines, continues };
}

// ---------- Harness ----------

function freshRuntime() {
  const runtime = loadGame(ROOT);
  runtime.context.__perfNow = () => performance.now();
  runtime.evaluate(`(${vmSetup.toString()})(${JSON.stringify(KEYS)})`);
  return runtime;
}

function inVm(runtime, fn, arg, timeout = 120_000) {
  return JSON.parse(runtime.evaluate(`JSON.stringify((${fn.toString()})(${JSON.stringify(arg === undefined ? null : arg)}))`, timeout));
}

function run(fn, arg) {
  return inVm(freshRuntime(), fn, arg);
}

const results = [];
const ok = label => results.push(label);
const pct = (list, p) => {
  if (!list.length) return 0;
  const sorted = [...list].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.floor(p * sorted.length))];
};

// 1. Real play.
const real = { failures: [], runs: [], write: [], save: [], dropped: 0, printed: 0, continues: 0 };
for (let chunk = 0; chunk * CHUNK < RUNS; chunk++) {
  const runs = Math.min(CHUNK, RUNS - chunk * CHUNK);
  const out = inVm(freshRuntime(), vmPlayChunk, { chunkSeed: SEED * 1000 + chunk, runs, firstRun: chunk * CHUNK, maxSteps: MAX_STEPS }, 600_000);
  real.failures.push(...out.failures);
  real.runs.push(...out.runs);
  real.write.push(...out.timing.write);
  real.save.push(...out.timing.save);
  real.dropped += out.droppedReplyLines;
  real.printed += out.printedReplyLines;
  real.continues += out.continues;
}
assert.deepEqual(real.failures, [], "real play:\n" + real.failures.map(f => JSON.stringify(f)).join("\n"));
assert.equal(real.runs.length, RUNS);
for (const r of real.runs) {
  assert.equal(r.outcome, "ended", `run ${r.run} (slot ${r.slot}) did not reach an ending: ${r.outcome}`);
  assert.equal(r.entries, r.screens, `run ${r.run}: one entry per live screen`);
}
assert.ok(real.printed > 0, "real play printed reply lines");
assert.equal(real.continues, RUNS, "every run continued once");
assert.deepEqual([...new Set(real.runs.map(r => r.slot))].sort(), [1, 2, 3], "real play used all three slots");
const maxEntries = Math.max(...real.runs.map(r => r.entries));
const maxChars = Math.max(...real.runs.map(r => r.chars));
assert.ok(maxEntries < 400 && maxChars < 524_288, `real runs stay under the caps (max ${maxEntries} entries, ${maxChars} chars)`);
ok(`real play (${RUNS} runs)`);

// 2. Continue into a fresh runtime (a reload), and the intro's first view, add nothing.
{
  const first = freshRuntime();
  const played = inVm(first, () => {
    const B = globalThis.__bl;
    localStorage.clear();
    // The real new-run path: Begin -> commander -> intro -> first view.
    commitNewRunWithCommander();
    const afterCommit = B.mem();
    const storedAfterCommit = B.stored(1);
    finishCinematic();
    const afterFirstView = B.mem();
    const firstViewMatches = B.view(afterFirstView.entries[0]) === B.story();
    for (let i = 0; i < 12; i++) B.click(B.buttons()[0]);
    return { afterCommit, storedAfterCommit, afterFirstView, firstViewMatches, mem: B.mem(), scene: state.scene, savedAt: B.savedAt(1) };
  });
  assert.equal(played.afterCommit.entries.length, 1, "a new run records its first screen once");
  assert.equal(played.afterCommit.entries[0].s, "wake");
  assert.equal(played.storedAfterCommit.entries.length, 1, "the commander's save carries the first screen");
  assert.deepEqual(played.afterFirstView, played.afterCommit, "the intro's first view adds nothing");
  assert.equal(played.firstViewMatches, true, "the first view shows the recorded first screen");
  assert.equal(played.mem.entries.length, 13);
  // Copy the device's storage into a new runtime, as a reload would find it.
  const second = freshRuntime();
  for (const key of ["sunsplitter_save_v3", "sunsplitter_save_current_v1", KEYS[1]]) {
    const value = first.browser.localStorage.getItem(key);
    if (value !== null) second.browser.localStorage.setItem(key, value);
  }
  const reloaded = inVm(second, () => {
    const B = globalThis.__bl;
    const resumed = resumeGame();
    const mem = B.mem();
    const label = B.label(B.buttons()[0]);
    B.click(B.buttons()[0]);
    const after = B.mem();
    // A resume re-render of the screen on display adds nothing either.
    showScene(state.scene, { skipOnEnter: true, resume: true });
    return { resumed, scene: mem.entries[mem.entries.length - 1].s, mem, label, after, afterResume: B.mem() };
  });
  assert.equal(reloaded.resumed, true);
  assert.deepEqual(reloaded.mem, played.mem, "a reload's Continue restores the backlog exactly");
  assert.equal(reloaded.scene, played.scene, "the newest entry is the screen Continue shows");
  assert.equal(reloaded.after.entries[12].c, reloaded.label, "the order after a reload closes the restored screen");
  assert.equal(reloaded.after.entries.length, 14);
  assert.deepEqual(reloaded.afterResume, reloaded.after, "a resume re-render adds nothing");
  ok("reload, first view and resume add nothing");
}

// 2b. A fresh run's wake that prints the ship's remembered-ending line (SUN-SHIP-REMEMBERS-01, #584)
//     keeps that line in its entry, as printed; no other screen has one.
{
  const r = run(memory => {
    const B = globalThis.__bl;
    localStorage.clear();
    localStorage.setItem("sunsplitter_ship_memory_v1", JSON.stringify(memory));
    beginFreshCampaign({ persist: true, slot: 2 });
    const wake = B.mem().entries[0];
    const wakeStory = B.story();
    const printed = (wakeStory.match(/<p class="ship-remembers">([^<]*)<\/p>/) || [])[1] || "";
    for (let i = 0; i < 3; i++) B.click(B.buttons()[0]);
    const mem = B.mem();
    const stored = B.stored(2);
    resetRunState();
    resumeGame();
    const resumed = B.mem();
    // Without a memory there is no line, and no field.
    localStorage.clear();
    beginFreshCampaign({ persist: true, slot: 1 });
    const plain = B.mem().entries[0];
    return { wake, matches: B.view(wake) === wakeStory, printed, mem, stored, resumed, plain };
  }, {
    v: 1, runs: 1, endings: { landfall: 1 }, lost: { rourke: 1 }, plates: ["vault"],
    forks: { crisis: { breath: 1 }, vault: {}, tether: {}, lethal: {}, final: { endure: 1 } },
    last: { ending: "landfall", lost: ["rourke"], forks: { crisis: "breath", final: "endure" } },
    prints: ["0000000a"], trail: []
  });
  assert.ok(r.printed.length > 0, "the seeded memory makes the wake print its remembered line");
  assert.equal(r.wake.s, "wake");
  assert.ok(typeof r.wake.m === "string" && r.wake.m.length > 0, "the wake's entry keeps the line");
  assert.equal(r.matches, true, "the wake's entry, line included, renders to what #story showed");
  assert.deepEqual(r.mem.entries.slice(1).filter(e => "m" in e), [], "no later screen has the line");
  assert.deepEqual(r.stored.entries, r.mem.entries, "the line is stored with its entry");
  assert.deepEqual(r.resumed, r.mem, "and restored by Continue");
  assert.equal("m" in r.plain, false, "a wake without the line has no m");
  ok("the wake's remembered line");
}

// 3. A retired-scene resume appends its exit, bound or not, and through the held one-time entry.
{
  const r = run(() => {
    const B = globalThis.__bl;
    const out = {};
    const prior = [{ s: "wake", t: "Prior screen.", c: "An order." }, { s: "hold_bolts_again", t: "A retired screen.", c: null }];
    // Bound: the stored entries are kept and the exit is appended once, live.
    localStorage.clear();
    const parked = B.snap("hold_bolts_again", { savedAt: 7000 });
    localStorage.setItem(saveSlotKeys(2).live, parked);
    localStorage.setItem(SAVE_POINTER_KEY, "2");
    localStorage.setItem(B.keys[2], JSON.stringify({ v: 1, savedAt: 7000, gap: false, entries: prior }));
    resetRunState();
    out.resumed = resumeGame();
    out.mem = B.mem();
    out.scene = state.scene;
    out.matches = B.view(out.mem.entries[out.mem.entries.length - 1]) === B.story();
    out.stored = B.stored(2);
    out.savedAt = B.savedAt(2);
    // Unbound: the gap, then the exit.
    localStorage.clear();
    localStorage.setItem(saveSlotKeys(3).live, B.snap("hold_bolts_again", { savedAt: 7001 }));
    localStorage.setItem(SAVE_POINTER_KEY, "3");
    resetRunState();
    resumeGame();
    out.unbound = B.mem();
    // Held one-time entry: the marker write fails once; the retry keeps the exit already shown.
    localStorage.clear();
    const k1 = saveSlotKeys(1);
    localStorage.setItem(k1.live, parked);
    localStorage.setItem(B.keys[1], JSON.stringify({ v: 1, savedAt: 7000, gap: false, entries: prior }));
    const realSet = localStorage.setItem;
    localStorage.setItem = (key, value) => {
      if (key === k1.live && value.includes('"sceneEntered":true')) throw new Error("injected marker failure");
      return realSet(key, value);
    };
    resetRunState();
    out.heldFirst = resumeGame();
    out.heldMemAfterFirst = B.mem();
    localStorage.setItem = realSet;
    resetRunState();
    out.heldSecond = resumeGame();
    out.heldMem = B.mem();
    out.heldStored = B.stored(1);
    out.heldSavedAt = B.savedAt(1);
    return out;
  });
  assert.equal(r.resumed, true);
  assert.notEqual(r.scene, "hold_bolts_again");
  assert.equal(r.mem.entries.length, 3, "the stored two plus the exit");
  assert.deepEqual(r.mem.entries.slice(0, 2), [{ s: "wake", t: "Prior screen.", c: "An order." }, { s: "hold_bolts_again", t: "A retired screen.", c: null }]);
  assert.equal(r.mem.entries[2].s, r.scene, "the exit is appended");
  assert.equal(r.mem.gap, false);
  assert.equal(r.matches, true, "the appended exit is what #story shows");
  assert.equal(r.stored.savedAt, r.savedAt, "the resumed save and its backlog are written together");
  assert.deepEqual(r.stored.entries, r.mem.entries);
  assert.equal(r.unbound.gap, true, "no bound backlog: the gap");
  assert.deepEqual(r.unbound.entries.map(e => e.s), [r.scene], "then the exit alone");
  assert.equal(r.heldFirst, false, "the failed marker write returns to the title");
  assert.equal(r.heldMemAfterFirst.entries.length, 3);
  assert.equal(r.heldSecond, true);
  assert.deepEqual(r.heldMem, r.heldMemAfterFirst, "the retry keeps the exit shown on the first try, once");
  assert.equal(r.heldStored.savedAt, r.heldSavedAt);
  assert.deepEqual(r.heldStored.entries, r.heldMem.entries);
  ok("retired-scene resume appends its exit");
}

// 4. Binding: only v 1, a matching savedAt and a well-formed value within the caps is kept.
{
  const r = run(() => {
    const B = globalThis.__bl;
    const entry = { s: "wake", t: "Kept screen.", c: "Kept order." };
    const good = { v: 1, savedAt: 5000, gap: false, entries: [entry] };
    const cases = {
      match: good,
      matchGap: Object.assign({}, good, { gap: true }),
      otherSavedAt: Object.assign({}, good, { savedAt: 5001 }),
      v2: Object.assign({}, good, { v: 2 }),
      noV: { savedAt: 5000, gap: false, entries: [entry] },
      stringSavedAt: Object.assign({}, good, { savedAt: "5000" }),
      gapNotBool: Object.assign({}, good, { gap: "no" }),
      entriesNotArray: Object.assign({}, good, { entries: {} }),
      badEntry: Object.assign({}, good, { entries: [{ s: "wake", t: 5, c: null }] }),
      emptyReply: Object.assign({}, good, { entries: [{ s: "wake", r: [], t: "x", c: null }] }),
      badRemembered: Object.assign({}, good, { entries: [{ s: "wake", t: "x", m: 5, c: null }] }),
      overEntryCap: Object.assign({}, good, { entries: Array.from({ length: 401 }, () => entry) }),
      notJson: "{not json",
      missing: null
    };
    const out = {};
    for (const [name, value] of Object.entries(cases)) {
      localStorage.clear();
      localStorage.setItem(SAVE_KEY, B.snap("act2_tether_sighting", { savedAt: 5000 }));
      if (value !== null) localStorage.setItem(B.keys[1], typeof value === "string" ? value : JSON.stringify(value));
      resetRunState();
      resumeGame();
      out[name] = B.mem();
    }
    // Extra fields are not carried into memory.
    localStorage.clear();
    localStorage.setItem(SAVE_KEY, B.snap("act2_tether_sighting", { savedAt: 5000 }));
    localStorage.setItem(B.keys[1], JSON.stringify({ v: 1, savedAt: 5000, gap: false, extra: 1, entries: [Object.assign({ x: 1 }, entry)] }));
    resetRunState();
    resumeGame();
    out.extra = B.mem();
    // A save on the first screen with no backlog has nothing to miss; a save with no savedAt is unbound.
    localStorage.clear();
    localStorage.setItem(SAVE_KEY, B.snap("wake", { savedAt: 6000 }));
    resetRunState();
    resumeGame();
    out.wakeMissing = B.mem();
    localStorage.clear();
    const noStamp = JSON.parse(B.snap("act2_tether_sighting")); delete noStamp.savedAt;
    localStorage.setItem(SAVE_KEY, JSON.stringify(noStamp));
    localStorage.setItem(B.keys[1], JSON.stringify({ v: 1, gap: false, entries: [entry] }));
    resetRunState();
    resumeGame();
    out.noSavedAt = B.mem();
    return out;
  });
  const kept = { gap: false, entries: [{ s: "wake", t: "Kept screen.", c: "Kept order." }] };
  const gap = { gap: true, entries: [] };
  assert.deepEqual(r.match, kept, "matching savedAt and v 1: kept");
  assert.deepEqual(r.matchGap, { gap: true, entries: kept.entries }, "a stored gap stays a gap");
  for (const name of ["otherSavedAt", "v2", "noV", "stringSavedAt", "gapNotBool", "entriesNotArray", "badEntry", "emptyReply", "badRemembered", "overEntryCap", "notJson", "missing", "noSavedAt"]) {
    assert.deepEqual(r[name], gap, `${name}: the gap`);
  }
  assert.deepEqual(r.extra, kept, "unknown fields are dropped on load");
  assert.deepEqual(r.wakeMissing, { gap: false, entries: [] }, "a run on its first screen has no gap");
  ok("binding");
}

// 5. Per-slot keys: each slot writes, reads and clears its own key only; bad slot values touch none.
{
  const r = run(() => {
    const B = globalThis.__bl;
    const out = { table: [backlogKey(1), backlogKey(2), backlogKey(3), backlogKey("2")],
      bad: [0, 4, "x", null, "", 2.5, true, [2], { slot: 2 }].map(v => backlogKey(v)) };
    const all = () => JSON.stringify([1, 2, 3].map(n => B.raw(n)));
    localStorage.clear();
    beginFreshCampaign({ persist: true, slot: 3 });
    B.click(B.buttons()[0]);
    out.after3 = [B.raw(1), B.raw(2), B.stored(3) && B.stored(3).entries.length];
    // persistSave for a named slot writes that slot's key with this run.
    persistSave({ silent: true, slot: 2 });
    out.slot2 = B.stored(2) && B.stored(2).savedAt === B.savedAt(2) && JSON.stringify(B.stored(2).entries) === JSON.stringify(runBacklog.entries);
    // Slot 1 holds a backlog whose savedAt equals slot 3's save: loading slot 3 never reads it.
    const s3 = B.savedAt(3);
    localStorage.setItem(B.keys[1], JSON.stringify({ v: 1, savedAt: s3, gap: false, entries: [{ s: "wake", t: "Slot 1 text.", c: null }] }));
    localStorage.setItem(B.keys[3], JSON.stringify({ v: 1, savedAt: s3, gap: false, entries: [{ s: "wake", t: "Slot 3 text.", c: "x" }] }));
    localStorage.setItem(SAVE_POINTER_KEY, "3");
    resetRunState();
    resumeGame();
    out.loaded3 = B.mem().entries.map(e => e.t);
    // Bad slot values write and clear nothing.
    const before = all();
    for (const v of [4, "x", 0, null, "4", 2.5, -1, true]) {
      persistSave({ silent: true, slot: v });
      clearSave(v);
    }
    out.badUntouched = all() === before;
    // clearSave(n) removes slot n's backlog only; clearSave() the active slot's.
    clearSave(2);
    out.afterClear2 = [B.raw(1) !== null, B.raw(2), B.raw(3) !== null];
    activeSaveSlot = 1;
    clearSave();
    out.afterClearActive = [B.raw(1), B.raw(3) !== null];
    return out;
  });
  assert.deepEqual(r.table, [KEYS[1], KEYS[2], KEYS[3], KEYS[2]]);
  assert.deepEqual(r.bad, [null, null, null, null, null, null, null, null, null], "a value that names no slot has no backlog key");
  assert.deepEqual(r.after3, [null, null, 2], "a slot 3 run writes slot 3's key only");
  assert.equal(r.slot2, true, "persistSave({ slot: 2 }) writes slot 2's key, bound to slot 2's save");
  assert.deepEqual(r.loaded3, ["Slot 3 text."], "loading slot 3 reads slot 3's key");
  assert.equal(r.badUntouched, true, "persistSave and clearSave with a bad slot value touch no backlog key");
  assert.deepEqual(r.afterClear2, [true, null, true], "clearSave(2) removes slot 2's backlog only");
  assert.deepEqual(r.afterClearActive, [null, true], "clearSave() removes the active slot's backlog");
  ok("per-slot keys");
}

// 6. A throwing setItem for the backlog key leaves persistSave's result and messages unchanged.
{
  const r = run(() => {
    const B = globalThis.__bl;
    const status = () => [document.getElementById("save-status").textContent, document.getElementById("title-save-status").textContent];
    const out = { cases: [] };
    for (const mode of ["normal", "throwSet", "throwSetAndRemove"]) {
      for (const silent of [true, false]) {
        localStorage.clear();
        beginFreshCampaign({ persist: true, slot: 2 });
        B.click(B.buttons()[0]);
        flashSaveStatus("", false, true);
        const prior = B.raw(2);
        const realSet = localStorage.setItem, realRemove = localStorage.removeItem;
        if (mode !== "normal") localStorage.setItem = (key, value) => { if (key === B.keys[2]) throw new Error("QuotaExceededError"); return realSet(key, value); };
        if (mode === "throwSetAndRemove") localStorage.removeItem = key => { if (key === B.keys[2]) throw new Error("SecurityError"); return realRemove(key); };
        let threw = false, result;
        try { result = persistSave({ silent, slot: 2 }); } catch (e) { threw = true; }
        localStorage.setItem = realSet; localStorage.removeItem = realRemove;
        out.cases.push({ mode, silent, result, threw, status: status(), saveWritten: JSON.parse(readRawSave(2)).scene === state.scene,
          backlog: mode === "throwSetAndRemove" ? (B.raw(2) === prior ? "prior kept" : "changed") : (B.raw(2) === null ? "removed" : "written"),
          staging: localStorage.getItem(saveSlotKeys(2).staging), backup: localStorage.getItem(saveSlotKeys(2).backup) });
      }
    }
    // A failed save writes no backlog: the slot keeps the pair it had.
    localStorage.clear();
    beginFreshCampaign({ persist: true, slot: 1 });
    B.click(B.buttons()[0]);
    const pair = [readRawSave(1), B.raw(1)];
    state.cohesion += 1; // a different snapshot, even within the same millisecond
    const realSet = localStorage.setItem;
    localStorage.setItem = (key, value) => { if (key === SAVE_KEY && value !== pair[0]) throw new Error("QuotaExceededError"); return realSet(key, value); };
    out.failedSave = persistSave({ silent: true });
    localStorage.setItem = realSet;
    out.failedStatus = status()[0];
    out.pairKept = readRawSave(1) === pair[0] && B.raw(1) === pair[1];
    resetRunState();
    resumeGame();
    out.pairLoads = B.mem().entries.length === JSON.parse(pair[1]).entries.length && !B.mem().gap;
    return out;
  });
  const byMode = mode => r.cases.filter(c => c.mode === mode);
  for (const c of r.cases) {
    assert.equal(c.threw, false, `${c.mode}/${c.silent}: persistSave never throws`);
    assert.equal(c.result, true, `${c.mode}/${c.silent}: the save still succeeds`);
    assert.equal(c.saveWritten, true);
    assert.equal(c.staging, null);
    assert.equal(c.backup, null);
  }
  for (const silent of [true, false]) {
    const normal = byMode("normal").find(c => c.silent === silent);
    for (const mode of ["throwSet", "throwSetAndRemove"]) {
      const c = byMode(mode).find(x => x.silent === silent);
      assert.deepEqual(c.status, normal.status, `${mode}/${silent}: the same messages as a normal save`);
    }
  }
  assert.deepEqual(byMode("normal").map(c => c.status[0]), ["", "Saved"]);
  assert.deepEqual(byMode("normal").map(c => c.backlog), ["written", "written"]);
  assert.deepEqual(byMode("throwSet").map(c => c.backlog), ["removed", "removed"], "a failed backlog write removes the key");
  assert.deepEqual(byMode("throwSetAndRemove").map(c => c.backlog), ["prior kept", "prior kept"], "a key that cannot be removed is left as it was");
  assert.equal(r.failedSave, false);
  assert.equal(r.failedStatus, "Autosave failed · prior slot kept");
  assert.equal(r.pairKept, true, "a failed save leaves the prior save and its backlog as they were");
  assert.equal(r.pairLoads, true, "and they still load together");
  ok("throwing setItem");
}

// 7. New run, a refused new run, Play Again, clearSave and import.
{
  const r = run(() => {
    const B = globalThis.__bl;
    const out = {};
    localStorage.clear();
    beginFreshCampaign({ persist: true, slot: 1 });
    for (let i = 0; i < 5; i++) B.click(B.buttons()[0]);
    const slot1Pair = [readRawSave(1), B.raw(1)];
    // New run in slot 2: an empty bound store there, the first screen in memory, slot 1 untouched.
    beginFreshCampaign({ persist: true, slot: 2 });
    out.newRun = { stored: B.stored(2), savedAt: B.savedAt(2), mem: B.mem(), slot1Same: readRawSave(1) === slot1Pair[0] && B.raw(1) === slot1Pair[1] };
    B.click(B.buttons()[0]);
    B.click(B.buttons()[0]);
    // A refused new run (its save fails) keeps the current run's backlog and slot 2's pair.
    const memBefore = JSON.stringify(runBacklog);
    const pair2 = [readRawSave(2), B.raw(2)];
    const realSet = localStorage.setItem;
    localStorage.setItem = (key, value) => { if (key === saveSlotKeys(2).staging) throw new Error("QuotaExceededError"); return realSet(key, value); };
    out.refused = beginFreshCampaign({ persist: true, slot: 2 });
    localStorage.setItem = realSet;
    out.refusedMemKept = JSON.stringify(runBacklog) === memBefore;
    out.refusedPairKept = readRawSave(2) === pair2[0] && B.raw(2) === pair2[1];
    // Play Again after an ending: the finished slot keeps its backlog until the first choice.
    state.scene = "ending_check";
    persistSave({ silent: true });
    const finished = [readRawSave(2), B.raw(2)];
    playAgain();
    finishCinematic();
    out.playAgainMem = B.mem();
    document.getElementById("game-screen").classList.remove("hidden");
    window.dispatchEvent({ type: "pagehide" });
    out.keptThroughPagehide = readRawSave(2) === finished[0] && B.raw(2) === finished[1];
    const label = B.label(B.buttons()[0]);
    B.click(B.buttons()[0]);
    const after = B.stored(2);
    out.afterFirstChoice = { savedAtBound: after.savedAt === B.savedAt(2), entries: after.entries.map(e => [e.s, e.c]), label, gap: after.gap };
    // clearSave removes the slot's backlog with its save.
    clearSave(2);
    out.cleared = [readRawSave(2), B.raw(2), B.raw(1) === slot1Pair[1]];
    // Import: the stored backlog stays on disk and the binding decides on Continue.
    const exported = buildSaveExport(1).text;
    out.importOther = importSaveText(B.snap("act3_spine_next", { savedAt: 1234 }), 1);
    out.importOtherKeyKept = B.raw(1) === slot1Pair[1];
    resetRunState(); activeSaveSlot = 1; loadGame();
    out.importOtherMem = B.mem();
    out.importOwn = importSaveText(exported, 1);
    resetRunState(); activeSaveSlot = 1; loadGame();
    out.importOwnMem = B.mem();
    out.slot1Entries = JSON.parse(slot1Pair[1]).entries.length;
    return out;
  });
  assert.equal(r.newRun.stored.v, 1);
  assert.equal(r.newRun.stored.savedAt, r.newRun.savedAt, "a new run's store is bound to its first save");
  assert.deepEqual([r.newRun.stored.gap, r.newRun.stored.entries], [false, []]);
  assert.deepEqual(r.newRun.mem.entries.map(e => e.s), ["wake"], "a new run starts its backlog at its first screen");
  assert.equal(r.newRun.slot1Same, true, "a new run in slot 2 leaves slot 1's save and backlog alone");
  assert.equal(r.refused, false);
  assert.equal(r.refusedMemKept, true, "a refused new run keeps the current run's backlog");
  assert.equal(r.refusedPairKept, true);
  assert.deepEqual(r.playAgainMem.entries.map(e => e.s), ["wake"], "Play Again starts a new backlog");
  assert.equal(r.keptThroughPagehide, true, "Play Again keeps the finished slot's backlog through a lifecycle save");
  assert.equal(r.afterFirstChoice.savedAtBound, true, "the first choice replaces the pair together");
  assert.deepEqual(r.afterFirstChoice.entries.map(e => e[0]).slice(0, 1), ["wake"]);
  assert.equal(r.afterFirstChoice.entries[0][1], r.afterFirstChoice.label);
  assert.equal(r.afterFirstChoice.entries.length, 2);
  assert.equal(r.afterFirstChoice.gap, false);
  assert.deepEqual(r.cleared, [null, null, true], "clearSave(2) removes slot 2's save and backlog, not slot 1's");
  assert.equal(r.importOther, true);
  assert.equal(r.importOtherKeyKept, true, "an import does not write the backlog key");
  assert.deepEqual(r.importOtherMem, { gap: true, entries: [] }, "a different imported save opens with the gap");
  assert.equal(r.importOwn, true);
  assert.equal(r.importOwnMem.gap, false, "re-importing this slot's own export keeps its backlog");
  assert.equal(r.importOwnMem.entries.length, r.slot1Entries);
  ok("new run, Play Again, clearSave and import");
}

// 8. A staged dead speaker's and an unrecovered speaker's reply lines are absent from the record.
{
  const r = run(() => {
    const B = globalThis.__bl;
    scenes.__bl_from = { text: "From.", choices: [] };
    scenes.__bl_to = { text: "To.", choices: [{ text: "On.", next: "__bl_to" }] };
    scenes.__bl_kill = { onEnter: () => { kill("lena", "backlog fixture"); return "__bl_to"; }, text: "Never shown.", choices: [] };
    localStorage.clear();
    beginFreshCampaign({ persist: true, slot: 1 });
    kill("mira", "backlog fixture");
    showScene("__bl_from");
    makeChoice({ text: "Go.", next: "__bl_to", reply: [{ who: "mira", text: "DEAD-MIRA-LINE" }, { who: "jiro", text: "ABSENT-JIRO-LINE" }, { who: "elias", text: "Elias logs it." }, "The board takes it."] });
    const first = B.mem().entries.slice(-2);
    const firstStory = B.story();
    // The next scene's onEnter kills the speaker: the line is dropped at render and in the record.
    showScene("__bl_from");
    makeChoice({ text: "Again.", next: "__bl_kill", reply: { who: "lena", text: "DEAD-LENA-LINE" } });
    const second = B.mem().entries.slice(-2);
    const stored = B.raw(1);
    delete scenes.__bl_from; delete scenes.__bl_to; delete scenes.__bl_kill;
    return { first, firstStory, second, stored };
  });
  assert.equal(r.first[0].c, "Go.");
  assert.deepEqual(r.first[1].r, ["Elias logs it.", "The board takes it."], "only the printed reply lines are recorded");
  assert.ok(!r.firstStory.includes("DEAD-MIRA-LINE") && !r.firstStory.includes("ABSENT-JIRO-LINE"));
  assert.equal(r.second[1].s, "__bl_to", "a redirect records only the screen it lands on");
  assert.equal(r.second[1].r, undefined, "a speaker killed on entry: no reply recorded");
  for (const text of ["DEAD-MIRA-LINE", "ABSENT-JIRO-LINE", "DEAD-LENA-LINE"]) {
    assert.ok(!r.stored.includes(text), `${text} never reaches the store`);
  }
  ok("dead and unrecovered speakers");
}

// 9. Isolation: snapshotState(), the export and run state do not change with the backlog.
{
  const r = run(() => {
    const B = globalThis.__bl;
    localStorage.clear();
    beginFreshCampaign({ persist: true, slot: 1 });
    for (let i = 0; i < 10; i++) B.click(B.buttons()[0]);
    const withBacklog = snapshotState();
    const stateWith = JSON.stringify(state);
    const exported = buildSaveExport(1).text;
    const raw = readRawSave(1);
    const memLen = runBacklog.entries.length;
    backlogReset();
    const without = snapshotState();
    const stateWithout = JSON.stringify(state);
    delete withBacklog.savedAt; delete without.savedAt;
    const markers = ["\"entries\"", "\"gap\"", "sunsplitter_backlog"];
    return {
      snapSame: JSON.stringify(withBacklog) === JSON.stringify(without),
      stateSame: stateWith === stateWithout,
      exportIsSave: exported === raw,
      markersInExport: markers.filter(m => exported.includes(m)),
      markersInState: markers.filter(m => stateWith.includes(m)),
      backlogStateKeys: Object.keys(state).filter(k => /backlog|entries/i.test(k)),
      snapKeys: Object.keys(withBacklog).sort(),
      memLen
    };
  });
  assert.equal(r.memLen, 11);
  assert.equal(r.snapSame, true, "snapshotState() is the same with or without a backlog");
  assert.equal(r.stateSame, true, "run state is the same with or without a backlog");
  assert.equal(r.exportIsSave, true, "the export is the save's bytes");
  assert.deepEqual(r.markersInExport, [], "the export carries no backlog");
  assert.deepEqual(r.markersInState, [], "run state carries no backlog");
  assert.ok(!r.snapKeys.some(k => /backlog|entries/i.test(k)), "no snapshot key for the backlog");
  assert.deepEqual(r.backlogStateKeys, [], "no run-state key for the backlog");
  ok("isolation");
}

// 10. Caps: past 400 entries or 524,288 stored characters the oldest go and the gap is set.
{
  const r = run(() => {
    const B = globalThis.__bl;
    localStorage.clear();
    beginFreshCampaign({ persist: true, slot: 1 });
    B.click(B.buttons()[0]); // off the first screen, so a lost store reads as a gap
    backlogReset();
    for (let i = 0; i < 450; i++) backlogRecordScreen("s" + i, "Screen " + i + ".", []);
    const byCount = { len: runBacklog.entries.length, first: runBacklog.entries[0].s, last: runBacklog.entries[399].s, gap: runBacklog.gap };
    backlogReset();
    const big = "x".repeat(10_000);
    for (let i = 0; i < 60; i++) backlogRecordScreen("b" + i, big + i, ["Reply " + i + "."]);
    persistSave({ silent: true });
    const raw = B.raw(1);
    const stored = JSON.parse(raw);
    const byChars = { chars: raw.length, len: stored.entries.length, memLen: runBacklog.entries.length, first: stored.entries[0].s, last: stored.entries[stored.entries.length - 1].s, gap: stored.gap };
    // A stored value over the character cap is not read back.
    const oversized = JSON.stringify({ v: 1, savedAt: B.savedAt(1), gap: false, entries: Array.from({ length: 60 }, (_, i) => ({ s: "b" + i, t: big, c: null })) });
    localStorage.setItem(B.keys[1], oversized);
    resetRunState();
    resumeGame();
    return { byCount, byChars, oversizedChars: oversized.length, oversizedRead: B.mem() };
  });
  assert.deepEqual(r.byCount, { len: 400, first: "s50", last: "s449", gap: true }, "the entry cap drops the oldest and sets the gap");
  assert.ok(r.byChars.chars <= 524_288, `stored value within the character cap (${r.byChars.chars})`);
  assert.ok(r.byChars.chars > 500_000, "and trimmed no further than needed");
  assert.equal(r.byChars.len, r.byChars.memLen, "memory is trimmed with the store");
  assert.equal(r.byChars.last, "b59", "the newest screens are kept");
  assert.notEqual(r.byChars.first, "b0");
  assert.equal(r.byChars.gap, true);
  assert.ok(r.oversizedChars > 524_288);
  assert.deepEqual(r.oversizedRead, { gap: true, entries: [] }, "an over-cap stored value is the gap");
  ok("caps");
}

const mean = list => list.reduce((a, b) => a + b, 0) / (list.length || 1);
const fmt = n => n.toFixed(3);
console.log(`PASS sun-playerflow-backlog-record: ${results.length} groups (${results.join("; ")}). ` +
  `Real play: ${RUNS} runs over slots 1-3, ${real.runs.reduce((a, r) => a + r.screens, 0)} screens ` +
  `(${Math.min(...real.runs.map(r => r.screens))}-${maxEntries} a run), ${real.printed} reply lines recorded, ${real.dropped} dropped lines absent, ` +
  `${real.continues} mid-run Continues; largest store ${maxChars} chars. Write cost per choice (node, this machine): ` +
  `backlog mean ${fmt(mean(real.write))} ms, p95 ${fmt(pct(real.write, 0.95))} ms, max ${fmt(Math.max(...real.write))} ms; ` +
  `whole autosave mean ${fmt(mean(real.save))} ms, p95 ${fmt(pct(real.save, 0.95))} ms.`);
