// SUN-MEMORY-STORE-01 (L-054) — the cross-run ship memory store (src/ship-memory.js).
// Drives the real scripts through simulate.loadGame. Covers: empty, corrupt, partial, newer-version,
// blocked and full storage; one record per finished run across a Continue of the completed slot (same
// VM and a new VM); the trail of hard calls (rendered openers only, reset by a fresh run and by an
// import; kept per save slot, so a hard call in one slot never reaches another slot's run record —
// SUN-SAVED-RUNS-01); plates recorded after the face gate, never from prefetch, never from non-plate pictures;
// nothing in snapshotState or the export; clearSave, New run and Play Again leave memory alone.
import { pathToFileURL } from "node:url";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadGame } from "./simulate.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const KEY = "sunsplitter_ship_memory_v1";

// Same LCG as the no-repeat-lap runner; clears the #choices stub the way a browser would.
const RUNNER = `
  globalThis.__smInstallRunner = () => {
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
  };
  globalThis.__smEnabled = c => c && (!c.alive || isAlive(c.alive)) &&
    (!c.aliveAll || c.aliveAll.every(k => isAlive(k))) &&
    (!c.aliveAny || c.aliveAny.some(k => isAlive(k))) &&
    (!c.requires || meetsRequirements(c.requires)) && (!c.effects || canAffordEffects(c.effects));
  // Title "New run" as a player does it: startGame, then the in-page confirm and the commander form.
  // SUN-NEW-RUN-SLOT-01: the confirm is the slot picker; slot names the row to pick (else its default).
  globalThis.__smNewRun = slot => {
    let started = startGame();
    if (!started && slot && typeof selectNewRunSlot === "function" && newRunPickerOpen()) selectNewRunSlot(slot);
    if (!started && typeof confirmNewRun === "function") started = confirmNewRun();
    if (!started && typeof confirmCommanderCreate === "function") started = confirmCommanderCreate();
    if (currentCinematic) finishCinematic();
    return started;
  };
  // Play from the current scene to ending_check with a seeded picker. Returns the scene path.
  globalThis.__smPlayToEnd = seed => {
    __smInstallRunner();
    const rnd = () => { seed = (Math.imul(seed, 1103515245) + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
    const path = [];
    for (let step = 0; step < 700; step++) {
      const id = state.scene;
      path.push(id);
      if (id === "ending_check") return { ended: true, path };
      const scene = scenes[id];
      const choices = ((typeof scene.choices === "function" ? scene.choices() : scene.choices) || []).filter(__smEnabled);
      if (!choices.length) return { ended: false, path };
      makeChoice(choices[Math.floor(rnd() * choices.length)]);
    }
    return { ended: false, path };
  };
`;

function fresh() {
  const runtime = loadGame(ROOT);
  runtime.evaluate(RUNNER);
  return runtime;
}

function memoryRaw(runtime) {
  return runtime.browser.localStorage.getItem(KEY);
}

export function sunPlayerflowShipMemoryStoreChecks() {
  const errors = [];
  const notes = [];
  const check = (label, fn) => {
    try {
      const out = fn();
      if (typeof out === "string") notes.push(`${label}: ${out}`);
    } catch (error) {
      errors.push(`${label}: ${error && error.message ? error.message : error}`);
    }
  };
  const expect = (condition, message) => { if (!condition) throw new Error(message); };

  check("empty storage reads as empty and reading writes nothing", () => {
    const rt = fresh();
    const out = rt.evaluate(`(() => {
      localStorage.clear();
      const memory = shipMemoryRead();
      return { memory, raw: localStorage.getItem(${JSON.stringify(KEY)}) };
    })()`);
    expect(out.raw === null, "a read wrote the key");
    expect(out.memory.v === 1 && out.memory.runs === 0 && out.memory.plates.length === 0 && out.memory.last === null &&
      Object.keys(out.memory.trail).length === 0 && Object.keys(out.memory.endings).length === 0, "empty read was not empty: " + JSON.stringify(out.memory));
  });

  check("unparsable storage reads as empty and is overwritten at the next record", () => {
    const rt = fresh();
    const out = rt.evaluate(`(() => {
      localStorage.clear();
      localStorage.setItem(${JSON.stringify(KEY)}, "{not json");
      const before = shipMemoryRead();
      const wrote = shipMemoryNotePlate(document.getElementById("scene-image"), "images/vault.jpg");
      return { before, wrote, raw: localStorage.getItem(${JSON.stringify(KEY)}) };
    })()`);
    expect(out.before.runs === 0 && out.before.plates.length === 0, "corrupt value did not read as empty");
    expect(out.wrote === true, "record after corrupt value did not write");
    const parsed = JSON.parse(out.raw);
    expect(parsed.v === 1 && parsed.plates.length === 1 && parsed.plates[0] === "vault", "corrupt value not overwritten cleanly: " + out.raw);
  });

  check("partial or wrong-typed JSON is salvaged field by field", () => {
    const rt = fresh();
    const dirty = {
      runs: 3.5,
      endings: { long_dark: 2, landfall: "1", made_up: 4, fracture: -1, still_burning: 1 },
      lost: { lena: 2, rourke: 3, captain: 1, mira: 0 },
      plates: ["vault", "vault", "Bad-Stem", "art_r2_vault_racks", "romance_lena_1", 7, "../x"],
      forks: { crisis: { breath: 2, opening: 1 }, vault: [1], tether: { hard: 3 }, lethal: { lena: { lived: 1, lost: 1, maybe: 1 }, rourke: { lost: 1 } }, final: { hold: 1, run: 2 } },
      last: { ending: "long_dark", lost: ["rourke", "nobody", "rourke"], forks: { crisis: "breath", vault: "nope", lethal: { lena: "lost", jiro: "lived" } } },
      prints: ["9f3a1c2e", "nothex!!", 5],
      trail: ["act3_lethal_lena_clock", "wake", "act3_lethal_lena_clock"],
      extra: { anything: true }
    };
    const out = rt.evaluate(`(() => {
      localStorage.setItem(${JSON.stringify(KEY)}, ${JSON.stringify(JSON.stringify(dirty))});
      return shipMemoryRead();
    })()`);
    const want = {
      v: 1, runs: 0,
      endings: { long_dark: 2, still_burning: 1 },
      lost: { lena: 2, rourke: 3 },
      plates: ["vault", "romance_lena_1"],
      forks: { crisis: { breath: 2 }, vault: {}, tether: { hard: 3 }, lethal: { lena: { lived: 1, lost: 1 } }, final: { hold: 1 } },
      last: { ending: "long_dark", lost: ["rourke"], forks: { crisis: "breath", lethal: { lena: "lost" } } },
      prints: ["9f3a1c2e"],
      // A trail stored as a plain list (before save slots) was slot 1's run: it reads as slot 1's trail.
      trail: { "1": ["act3_lethal_lena_clock"] }
    };
    expect(JSON.stringify(out) === JSON.stringify(want), "salvage mismatch:\n got  " + JSON.stringify(out) + "\n want " + JSON.stringify(want));
    // Non-object JSON reads as empty.
    for (const raw of ["null", "[]", "42", "\"text\""]) {
      const empty = rt.evaluate(`(() => { localStorage.setItem(${JSON.stringify(KEY)}, ${JSON.stringify(raw)}); return shipMemoryRead(); })()`);
      expect(empty.runs === 0 && empty.plates.length === 0, "non-object " + raw + " did not read as empty");
    }
  });

  check("a newer version (v2) is read as nothing and never overwritten", () => {
    const rt = fresh();
    const v2 = JSON.stringify({ v: 2, runs: 9, plates: ["vault"], somethingNew: [1, 2] });
    const out = rt.evaluate(`(() => {
      localStorage.setItem(${JSON.stringify(KEY)}, ${JSON.stringify(v2)});
      const read = shipMemoryRead();
      const plate = shipMemoryNotePlate(document.getElementById("scene-image"), "images/medical_bay.jpg");
      const trail = shipMemoryNoteScene("act3_lethal_lena_clock");
      const run = shipMemoryRecordRun("The Long Dark");
      const cleared = shipMemoryClearTrail();
      return { read, plate, trail, run, cleared, raw: localStorage.getItem(${JSON.stringify(KEY)}) };
    })()`);
    expect(out.raw === v2, "v2 value was rewritten: " + out.raw);
    expect(out.read.runs === 0 && out.read.plates.length === 0, "v2 value was read as v1 data");
    expect(!out.plate && !out.trail && !out.run && !out.cleared, "a recorder reported a write over v2");
  });

  check("blocked storage: recorders never throw, the session copy remembers, the run save is untouched", () => {
    const rt = fresh();
    const out = rt.evaluate(`(() => {
      localStorage.clear();
      resetRunState();
      persistSave({ silent: true });
      const save = localStorage.getItem(SAVE_KEY);
      const real = { get: localStorage.getItem, set: localStorage.setItem, remove: localStorage.removeItem };
      let calls = 0;
      localStorage.getItem = () => { calls++; throw new Error("SecurityError"); };
      localStorage.setItem = () => { calls++; throw new Error("SecurityError"); };
      localStorage.removeItem = () => { calls++; throw new Error("SecurityError"); };
      let threw = null;
      let memory = null;
      let callsPerRecord = 0;
      try {
        shipMemoryNotePlate(document.getElementById("scene-image"), "images/vault.jpg");
        const before = calls;
        shipMemoryNotePlate(document.getElementById("ending-image"), "images/ending_ship.jpg");
        callsPerRecord = calls - before;
        shipMemoryNoteScene("act3_lethal_mira_board");
        memory = shipMemoryRead();
      } catch (e) { threw = String(e && e.message); }
      localStorage.getItem = real.get; localStorage.setItem = real.set; localStorage.removeItem = real.remove;
      return { threw, memory, callsPerRecord, saveAfter: localStorage.getItem(SAVE_KEY), save, raw: localStorage.getItem(${JSON.stringify(KEY)}) };
    })()`);
    expect(out.threw === null, "a recorder threw: " + out.threw);
    expect(out.memory && out.memory.plates.join() === "vault,ending_ship" && (out.memory.trail["1"] || []).join() === "act3_lethal_mira_board",
      "session copy lost records: " + JSON.stringify(out.memory));
    expect(out.callsPerRecord <= 2, "one record touched storage " + out.callsPerRecord + " times (retry loop?)");
    expect(out.saveAfter === out.save, "run save changed");
    expect(out.raw === null, "blocked storage somehow wrote the key");
  });

  check("full storage (quota on this key): session copy keeps the record, no other key is touched", () => {
    const rt = fresh();
    const out = rt.evaluate(`(() => {
      localStorage.clear();
      resetRunState();
      persistSave({ silent: true });
      localStorage.setItem(${JSON.stringify(KEY)}, JSON.stringify({ v: 1, runs: 1, plates: ["vault"] }));
      const keys = [SAVE_KEY, SAVE_KEY_LEGACY, SAVE_STAGING_KEY, SAVE_BACKUP_KEY, "sunsplitter_tone_ack_v1"];
      localStorage.setItem("sunsplitter_tone_ack_v1", "1");
      const before = keys.map(k => localStorage.getItem(k));
      const realSet = localStorage.setItem, realRemove = localStorage.removeItem;
      let memoryWrites = 0, removes = 0;
      localStorage.setItem = (k, v) => {
        if (k === ${JSON.stringify(KEY)}) { memoryWrites++; const e = new Error("QuotaExceededError"); e.name = "QuotaExceededError"; throw e; }
        return realSet(k, v);
      };
      localStorage.removeItem = k => { removes++; return realRemove(k); };
      let threw = null;
      try {
        shipMemoryNotePlate(document.getElementById("scene-image"), "images/medical_bay.jpg");
        shipMemoryNotePlate(document.getElementById("scene-image"), "images/corridor_variant_3.jpg");
      } catch (e) { threw = String(e); }
      const memory = shipMemoryRead();
      localStorage.setItem = realSet; localStorage.removeItem = realRemove;
      // Storage frees up: the next record writes the whole session copy.
      shipMemoryNotePlate(document.getElementById("scene-image"), "images/observation.jpg");
      return { threw, memory, memoryWrites, removes, before, after: keys.map(k => localStorage.getItem(k)),
        raw: JSON.parse(localStorage.getItem(${JSON.stringify(KEY)})) };
    })()`);
    expect(out.threw === null, "a recorder threw: " + out.threw);
    expect(out.memory.plates.join() === "vault,medical_bay,corridor_variant_3" && out.memory.runs === 1,
      "session copy did not keep the records: " + JSON.stringify(out.memory));
    expect(out.memoryWrites === 2, "expected one write attempt per record, saw " + out.memoryWrites);
    expect(out.removes === 0, "memory code removed a key to make room");
    expect(JSON.stringify(out.before) === JSON.stringify(out.after), "another key changed");
    expect(out.raw.plates.join() === "vault,medical_bay,corridor_variant_3,observation", "recovered write lost session records: " + JSON.stringify(out.raw));
  });

  // A real seeded run to an ending with the real autosave, then Continue of the completed slot.
  check("one record per run across Continue of a completed slot (same VM, new VM, after Play Again)", () => {
    const rt = fresh();
    let played = null;
    for (const seed of [11, 12, 13, 14, 15, 16, 17, 18]) {
      played = rt.evaluate(`(() => {
        localStorage.clear();
        beginFreshCampaign({ persist: true });
        const out = __smPlayToEnd(${seed});
        return { ...out, title: document.getElementById("ending-title").textContent, memory: shipMemoryRead(),
          save: localStorage.getItem(SAVE_KEY), deadLen: state.dead.length };
      })()`, 120_000);
      if (played.ended) break;
    }
    expect(played && played.ended, "no seeded run reached an ending");
    const m = played.memory;
    const endingIds = { "The Yellow Circle": "yellow_circle", "Landfall": "landfall", "The Living Ship": "living_ship", "The Quiet Ship": "quiet_ship", "Still Burning": "still_burning", "Fracture": "fracture", "The Long Dark": "long_dark" };
    const id = endingIds[played.title];
    expect(m.runs === 1 && m.endings[id] === 1 && m.last && m.last.ending === id, "run not recorded once: " + JSON.stringify(m));
    expect(m.prints.length === 1 && Object.keys(m.trail).length === 0, "print/trail wrong after the run: " + JSON.stringify(m));
    expect(m.lost.rourke === 1 && m.last.lost.includes("rourke"), "crew lost not recorded");
    expect(m.last.forks.final && m.forks.final[m.last.forks.final] === 1, "final order not recorded");
    expect(m.plates.length > 5, "too few plates recorded: " + m.plates.length);
    // Continue in the same VM.
    const same = rt.evaluate(`(() => {
      showTitleScreen();
      const ok = resumeGame();
      return { ok, title: document.getElementById("ending-title").textContent, memory: shipMemoryRead() };
    })()`);
    expect(same.ok && same.title === played.title, "Continue did not reach the ending: " + JSON.stringify({ ok: same.ok, title: same.title }));
    expect(same.memory.runs === 1 && same.memory.endings[id] === 1 && same.memory.prints.length === 1, "Continue counted the run again: " + JSON.stringify(same.memory));
    // Play Again, then Continue the completed slot from the title.
    const again = rt.evaluate(`(() => {
      playAgain();
      if (currentCinematic) finishCinematic();
      showTitleScreen();
      const ok = resumeGame();
      return { ok, memory: shipMemoryRead() };
    })()`);
    expect(again.ok && again.memory.runs === 1 && again.memory.endings[id] === 1, "Play Again + Continue counted again: " + JSON.stringify(again.memory));
    // A new VM (page reload) with the same storage.
    const raw = memoryRaw(rt);
    const reloaded = fresh();
    const other = reloaded.evaluate(`(() => {
      localStorage.clear();
      localStorage.setItem(SAVE_KEY, ${JSON.stringify(played.save)});
      localStorage.setItem(${JSON.stringify(KEY)}, ${JSON.stringify(raw)});
      const ok = resumeGame();
      return { ok, title: document.getElementById("ending-title").textContent, memory: shipMemoryRead() };
    })()`);
    expect(other.ok && other.title === played.title, "reload Continue did not reach the ending");
    expect(other.memory.runs === 1 && other.memory.endings[id] === 1, "reload Continue counted again: " + JSON.stringify(other.memory));
    // The ending art is a recorded plate.
    const art = { yellow_circle: "sela", landfall: "ending_landfall", living_ship: "ending_ship", quiet_ship: "ending_ship", still_burning: "observation_bridge", fracture: "ending_fracture", long_dark: "ending_ship" }[id];
    expect(m.plates.includes(art), "ending art " + art + " not recorded");
    return `${played.title} after ${played.path.length} screens, ${m.plates.length} plates`;
  });

  check("a second finished run is a second record", () => {
    const rt = fresh();
    const out = rt.evaluate(`(() => {
      localStorage.clear();
      let ended = 0;
      for (const seed of [11, 12, 13, 14, 15, 16, 17, 18, 19, 20]) {
        beginFreshCampaign({ persist: false });
        if (__smPlayToEnd(seed).ended) ended++;
        if (ended === 2) break;
      }
      return { ended, memory: shipMemoryRead() };
    })()`, 240_000);
    expect(out.ended === 2, "could not finish two runs");
    expect(out.memory.runs === 2 && out.memory.prints.length === 2 && out.memory.lost.rourke === 2, "two runs not recorded twice: " + JSON.stringify(out.memory));
    const endingTotal = Object.values(out.memory.endings).reduce((a, b) => a + b, 0);
    expect(endingTotal === 2, "ending counts do not add up to two");
  });

  check("trail: only rendered hard calls; a fresh run and an import reset it; Load keeps it", () => {
    const rt = fresh();
    const out = rt.evaluate(`(() => {
      localStorage.clear();
      resetRunState();
      // Lena is not dying: the opener redirects away, so it is not faced.
      showScene("act3_lethal_lena_clock");
      const afterRedirect = (shipMemoryRead().trail["1"] || []).slice();
      // Lena dying: the opener renders.
      resetRunState();
      state.dying.lena = "radiation";
      showScene("act3_lethal_lena_clock");
      showScene("act3_lethal_lena_clock", { skipOnEnter: true, resume: true }); // a resume does not add twice
      const afterRender = (shipMemoryRead().trail["1"] || []).slice();
      // A save parked mid-run: Load (Continue) keeps the trail.
      persistSave({ silent: true });
      const exported = buildSaveExport();
      resumeGame();
      const afterLoad = (shipMemoryRead().trail["1"] || []).slice();
      // A fresh run clears it.
      beginFreshCampaign({ persist: false });
      const afterFresh = (shipMemoryRead().trail["1"] || []).slice();
      // An import clears it.
      resetRunState();
      state.dying.lena = "radiation";
      showScene("act3_lethal_lena_clock");
      const beforeImport = (shipMemoryRead().trail["1"] || []).slice();
      const imported = importSaveText(exported.text);
      const afterImport = (shipMemoryRead().trail["1"] || []).slice();
      // Fresh run started from the title with persistence, replacing slot 1's run (SUN-NEW-RUN-SLOT-01:
      // the picker would start on empty slot 2, whose run has its own trail).
      showScene("act3_lethal_lena_clock");
      const started = __smNewRun(1);
      const afterStart = (shipMemoryRead().trail["1"] || []).slice();
      return { afterRedirect, afterRender, afterLoad, afterFresh, beforeImport, imported, afterImport, afterStart, started };
    })()`);
    expect(out.afterRedirect.length === 0, "a redirected opener joined the trail: " + out.afterRedirect);
    expect(out.afterRender.join() === "act3_lethal_lena_clock", "rendered opener not recorded once: " + out.afterRender);
    expect(out.afterLoad.join() === "act3_lethal_lena_clock", "Load dropped the trail: " + out.afterLoad);
    expect(out.afterFresh.length === 0, "fresh run kept the trail: " + out.afterFresh);
    expect(out.beforeImport.length === 1 && out.imported === true, "import setup failed: " + JSON.stringify(out));
    expect(out.afterImport.length === 0, "import kept the trail: " + out.afterImport);
    expect(out.started === true, "New run did not start");
    expect(out.afterStart.length === 0, "New run kept the trail: " + out.afterStart);
  });

  check("lethal outcomes: lived, lost at the call, and never 'lived' for someone dead at the end", () => {
    const rt = fresh();
    const out = rt.evaluate(`(() => {
      localStorage.clear();
      resetRunState();
      state.flags.final = "endure";
      localStorage.setItem(${JSON.stringify(KEY)}, JSON.stringify({ v: 1, trail: ["act3_lethal_lena_clock", "act3_lethal_elias_order", "act3_lethal_elias_end", "act3_lethal_mira_board"] }));
      kill("elias", "held the line");
      kill("mira", "later fixture death");
      shipMemoryRecordRun("The Long Dark");
      return shipMemoryRead();
    })()`);
    expect(JSON.stringify(out.last.forks.lethal) === JSON.stringify({ lena: "lived", elias: "lost", mira: "lost" }), "lethal outcomes wrong: " + JSON.stringify(out.last.forks));
    expect(out.forks.lethal.lena.lived === 1 && out.forks.lethal.elias.lost === 1 && !out.forks.lethal.tomas, "lethal counts wrong: " + JSON.stringify(out.forks.lethal));
    expect(Object.keys(out.trail).length === 0, "trail not cleared at run end");
    expect(out.last.forks.final === "endure" && !("crisis" in out.last.forks), "fork read wrong: " + JSON.stringify(out.last.forks));
  });

  // SUN-SAVED-RUNS-01 (L-054, lead's call): runs in different save slots interleave, so the trail is
  // kept per slot. A hard call faced in slot 2 never reaches slot 1's run record, and slot 1's run end
  // leaves slot 2's trail for slot 2's own record.
  check("trail per save slot: a hard call in slot 2 never reaches slot 1's run record", () => {
    const rt = fresh();
    const out = rt.evaluate(`(() => {
      localStorage.clear();
      const trailOf = slot => (shipMemoryRead().trail[slot] || []).slice();
      // Slot 1's run faces Lena's call and saves.
      activeSaveSlot = 1;
      resetRunState();
      state.dying.lena = "radiation";
      showScene("act3_lethal_lena_clock");
      persistSave({ silent: true, slot: 1 });
      // Slot 2's run (started in this tab) faces Elias's call and ends it.
      beginFreshCampaign({ persist: true, slot: 2 });
      const slot1AfterStart2 = trailOf("1");
      kill("lena", "slot 2 fixture");
      showScene("act3_lethal_elias_order");
      showScene("act3_lethal_elias_end");
      const slot2Trail = trailOf("2");
      // Back to slot 1 (Continue loads it) and play it to its ending.
      const loaded1 = loadSaveSlot(1);
      const active = activeSaveSlot;
      const slot1Trail = trailOf("1");
      state.flags.final = "endure";
      shipMemoryRecordRun("The Long Dark", activeSaveSlot);
      const m = shipMemoryRead();
      // A fresh run and an import in slot 2 clear only slot 2.
      const before = trailOf("1").length;
      return {
        slot1AfterStart2, slot2Trail, loaded1, active, slot1Trail,
        lethal: m.last.forks.lethal || {}, counts: m.forks.lethal, after: m.trail, before,
        noSlot: shipMemoryNoteScene("act3_lethal_mira_board", 4), noSlotTrail: shipMemoryRead().trail
      };
    })()`);
    expect(out.slot1AfterStart2.join() === "act3_lethal_lena_clock", "a new run in slot 2 cleared slot 1's trail: " + out.slot1AfterStart2);
    expect(out.slot2Trail.join() === "act3_lethal_elias_order,act3_lethal_elias_end", "slot 2's trail wrong: " + out.slot2Trail);
    expect(out.loaded1 === true && out.active === 1, "slot 1 did not load");
    expect(out.slot1Trail.join() === "act3_lethal_lena_clock", "slot 1's trail picked up slot 2's calls: " + out.slot1Trail);
    expect(JSON.stringify(out.lethal) === JSON.stringify({ lena: "lived" }), "slot 1's record holds another slot's call: " + JSON.stringify(out.lethal));
    expect(!out.counts.elias, "Elias's call in slot 2 was counted in slot 1's run: " + JSON.stringify(out.counts));
    expect(!out.after["1"] && (out.after["2"] || []).join() === "act3_lethal_elias_order,act3_lethal_elias_end",
      "slot 1's run end did not clear only slot 1's trail: " + JSON.stringify(out.after));
    expect(out.noSlot === false && !out.noSlotTrail["4"], "a value that names no slot wrote a trail");

    const cleared = rt.evaluate(`(() => {
      localStorage.clear();
      localStorage.setItem(${JSON.stringify(KEY)}, JSON.stringify({ v: 1, trail: { "1": ["act3_lethal_lena_clock"], "2": ["act3_lethal_mira_board"], "3": ["act3_lethal_tomas_cost"] } }));
      activeSaveSlot = 1;
      resetRunState();
      state.scene = "wake";
      const raw = JSON.stringify(snapshotState());
      window.confirm = () => true;
      const imported = importSaveText(raw, 3);
      const afterImport = shipMemoryRead().trail;
      const started = beginFreshCampaign({ persist: true, slot: 2 });
      const afterStart = shipMemoryRead().trail;
      return { imported, afterImport, started, afterStart };
    })()`);
    expect(cleared.imported === true && JSON.stringify(cleared.afterImport) === JSON.stringify({ "1": ["act3_lethal_lena_clock"], "2": ["act3_lethal_mira_board"] }),
      "an import into slot 3 did not clear only slot 3's trail: " + JSON.stringify(cleared.afterImport));
    expect(cleared.started === true && JSON.stringify(cleared.afterStart) === JSON.stringify({ "1": ["act3_lethal_lena_clock"] }),
      "a new run in slot 2 did not clear only slot 2's trail: " + JSON.stringify(cleared.afterStart));
  });

  check("forks: crisis path, vault, tether catch (hard wins over slow), final", () => {
    const rt = fresh();
    const out = rt.evaluate(`(() => {
      localStorage.clear();
      resetRunState();
      state.crisisPath = "custody";
      state.flags.vault_sacrifice = "split";
      state.flags.water_vented = true;
      state.flags.tether_rushed = true;
      state.flags.final = "transmission";
      shipMemoryRecordRun("Fracture");
      const first = shipMemoryRead();
      resetRunState();
      state.flags.water_vented = true;
      state.flags.final = "hold";
      shipMemoryRecordRun("Landfall");
      return { first, second: shipMemoryRead() };
    })()`);
    expect(JSON.stringify(out.first.last.forks) === JSON.stringify({ crisis: "custody", vault: "split", tether: "hard", final: "transmission" }), "forks wrong: " + JSON.stringify(out.first.last.forks));
    expect(out.second.forks.tether.slow === 1 && out.second.forks.tether.hard === 1 && out.second.endings.landfall === 1 && out.second.endings.fracture === 1, "second run forks wrong: " + JSON.stringify(out.second.forks));
    expect(out.second.last.forks.tether === "slow" && !("vault" in out.second.last.forks), "last not replaced by the second run");
  });

  check("plates: recorded after the face gate; ART-R2 fallbacks excluded; never from prefetch or non-plate pictures", () => {
    const rt = fresh();
    const out = rt.evaluate(`(() => {
      localStorage.clear();
      resetRunState();
      const killable = ["lena", "elias", "mira", "amara", "sela"];
      killable.forEach(k => kill(k, "fixture"));
      state.recovered = { tomas: true, jiro: true, vess: true };
      // Find a scene whose own plate is blocked and falls back to the generic corridor, and one whose
      // fallback is an ART-R2 plate.
      let generic = null, artR2 = null;
      for (const id of Object.keys(scenes)) {
        let ungated = "";
        try { ungated = resolveSceneImageUngated(id, scenes[id]) || ""; } catch (e) { continue; }
        if (!ungated || plateFacesPresent(ungated)) continue;
        const shown = resolveSceneImage(id, scenes[id]);
        if (!generic && shown === "images/corridor_variant_3.jpg" && ungated !== shown) generic = { id, ungated, shown };
        if (!artR2 && /art_r2_/.test(shown)) artR2 = { id, ungated, shown };
        if (generic && artR2) break;
      }
      const stem = src => src.split("/").pop().replace(/\\.jpg$/, "");
      const results = {};
      for (const [name, probe] of Object.entries({ generic, artR2 })) {
        if (!probe) continue;
        localStorage.removeItem(${JSON.stringify(KEY)});
        showScene(probe.id, { skipOnEnter: true, resume: true });
        results[name] = { probe, onScreen: document.getElementById("scene-image").__ssManagedSource, plates: shipMemoryRead().plates.slice(),
          ungatedStem: stem(probe.ungated), shownStem: stem(probe.shown) };
      }
      // Prefetch: install an Image so prefetchChoicePlates really warms plates, then check none of
      // the warmed-but-not-shown plates was recorded.
      const requested = [];
      function StubImage() { this.decode = () => Promise.resolve(); }
      Object.defineProperty(StubImage.prototype, "src", { set(v) { requested.push(String(v)); }, get() { return ""; } });
      globalThis.Image = StubImage;
      resetRunState();
      localStorage.removeItem(${JSON.stringify(KEY)});
      warmedPlates.length = 0; warmedPlateSet.clear();
      showScene("crisis", { skipOnEnter: true });
      const crisisPlates = shipMemoryRead().plates.slice();
      const crisisShown = document.getElementById("scene-image").__ssManagedSource;
      delete globalThis.Image;
      // Non-plate pictures: the intro bookend and a crew-sheet portrait.
      localStorage.removeItem(${JSON.stringify(KEY)});
      showCinematic("intro");
      cancelCinematic();
      const cinematicPlates = shipMemoryRead().plates.slice();
      if (typeof openCrewSheet === "function") { openCrewSheet("jiro"); closeCrewSheet(); }
      const sheetPlates = shipMemoryRead().plates.slice();
      return { results, requested, crisisPlates, crisisShown, cinematicPlates, sheetPlates };
    })()`);
    const g = out.results.generic;
    expect(g, "no scene found whose plate falls back to the generic corridor");
    expect(g.onScreen === g.probe.shown, "probe did not show the gated plate");
    expect(g.plates.includes("corridor_variant_3") && !g.plates.includes(g.ungatedStem), `gate: recorded ${g.plates} for ${g.probe.id} (blocked ${g.ungatedStem})`);
    const a = out.results.artR2;
    expect(a, "no scene found whose plate falls back to an ART-R2 plate");
    expect(a.plates.length === 0, `ART-R2 fallback or blocked plate recorded for ${a.probe.id}: ${a.plates}`);
    const warmedNotShown = out.requested.filter(src => src !== out.crisisShown);
    expect(warmedNotShown.length > 0, "prefetch warmed nothing, so the probe proves nothing");
    const stem = src => src.split("/").pop().replace(/\.jpg$/, "");
    expect(out.crisisPlates.length === 1 && out.crisisPlates[0] === stem(out.crisisShown), "crisis screen recorded " + out.crisisPlates);
    for (const src of warmedNotShown) expect(!out.crisisPlates.includes(stem(src)), "prefetched plate recorded: " + src);
    expect(out.cinematicPlates.length === 0, "intro bookend recorded: " + out.cinematicPlates);
    expect(out.sheetPlates.length === 0, "crew-sheet portrait recorded: " + out.sheetPlates);
    return `gate ${g.probe.id}: ${g.ungatedStem} -> corridor_variant_3; art_r2 ${a.probe.id}; ${warmedNotShown.length} warmed plates not recorded`;
  });

  check("memory is not in snapshotState or the export, and does not change them", () => {
    const rt = fresh();
    const out = rt.evaluate(`(() => {
      localStorage.clear();
      resetRunState();
      showScene("wake");
      persistSave({ silent: true });
      const strip = snap => { const s = Object.assign({}, snap); delete s.savedAt; return JSON.stringify(s); };
      const emptySnap = strip(snapshotState());
      const exportEmpty = buildSaveExport();
      localStorage.setItem(${JSON.stringify(KEY)}, JSON.stringify({ v: 1, runs: 5, endings: { long_dark: 5 }, plates: ["vault"], trail: ["act3_lethal_lena_clock"], prints: ["9f3a1c2e"] }));
      shipMemoryNotePlate(document.getElementById("scene-image"), "images/medical_bay.jpg");
      const fullSnap = strip(snapshotState());
      const exportFull = buildSaveExport();
      const text = v => JSON.stringify(v);
      return { emptySnap, fullSnap, exportEmpty: text(exportEmpty), exportFull: text(exportFull), snapKeys: Object.keys(snapshotState()) };
    })()`);
    expect(out.exportEmpty !== "null" && out.exportFull !== "null", "no export was built");
    expect(out.emptySnap === out.fullSnap, "snapshotState changed with memory");
    for (const field of ["ship_memory", "trail", "prints", "plates", "shipMemory"]) {
      expect(!out.fullSnap.includes(field), "snapshot mentions " + field);
      expect(!out.exportFull.includes(field), "export mentions " + field);
    }
    const stripTime = s => s.replace(/"(savedAt|exportedAt)":\s*\d+/g, "").replace(/"exportedAt":"[^"]*"/g, "");
    expect(stripTime(out.exportEmpty) === stripTime(out.exportFull), "export changed with memory");
  });

  check("clearSave, New run and Play Again leave memory alone", () => {
    const rt = fresh();
    const out = rt.evaluate(`(() => {
      localStorage.clear();
      const value = JSON.stringify({ v: 1, runs: 2, endings: { fracture: 2 }, lost: { rourke: 2 }, plates: ["vault"], forks: { crisis: {}, vault: {}, tether: {}, lethal: {}, final: { endure: 2 } }, last: null, prints: ["0000abcd"], trail: [] });
      localStorage.setItem(${JSON.stringify(KEY)}, value);
      resetRunState();
      persistSave({ silent: true });
      clearSave();
      const afterClear = localStorage.getItem(${JSON.stringify(KEY)});
      const started = __smNewRun();
      const afterStart = shipMemoryRead();
      playAgain();
      if (currentCinematic) finishCinematic();
      const afterAgain = shipMemoryRead();
      return { value, afterClear, afterStart, afterAgain, started };
    })()`);
    expect(out.afterClear === out.value, "clearSave touched memory");
    expect(out.started === true, "New run did not start");
    for (const [label, m] of [["New run", out.afterStart], ["Play Again", out.afterAgain]]) {
      expect(m.runs === 2 && m.endings.fracture === 2 && m.lost.rourke === 2 && m.prints.join() === "0000abcd" && m.plates[0] === "vault",
        label + " changed memory: " + JSON.stringify(m));
    }
  });

  return { errors, notes };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const { errors, notes } = sunPlayerflowShipMemoryStoreChecks();
  notes.forEach(note => console.log("NOTE " + note));
  if (errors.length) {
    console.error("FAIL sun-playerflow-ship-memory-store");
    errors.forEach(error => console.error(" - " + error));
    process.exit(1);
  }
  console.log("PASS sun-playerflow-ship-memory-store (empty/corrupt/partial/v2/blocked/quota, one record per run across Continue, trail, trail per save slot, post-gate plates, no prefetch, not in snapshot/export, clearSave/New run/Play Again)");
}
