// SUN-DELETE-SLOT-01 (L-052, Wave 2 design S-4; O-4, Manraj 2026-11-25: "yes, with a confirm") —
// the Saved runs dialog's Delete.
//
// Part 1, headless (runs everywhere, CI included), through simulate.loadGame. Each case starts from a
// fresh runtime on a store holding every recorded key (read from src/, so a key added later is
// covered without editing this file).
//   1. Delete removes exactly the slot's keys: live, staging, backup (and legacy v2 for slot 1), its
//      backlog key (L-062: cleared with the save) and its ship-memory trail entry (L-054); every other
//      key keeps its bytes, and the ship memory keeps its endings, forks, plates and the other trails.
//      For each of slots 1, 2 and 3.
//   2. The confirm names what goes (a run with a callsign, a finished run without one, an unreadable
//      save) and its button names the slot; the row's other actions step aside while it shows.
//   3. Cancel, Escape, choosing another row, closing the dialog and a stray confirm delete nothing.
//   4. The Continue pointer: removed when it named the slot, so Continue resumes the newest run left;
//      kept when it named another slot; deleting the last readable run hides Continue.
//   5. An unreadable slot can be deleted, and the title stops saying it can't be read.
//   6. A removal that fails deletes nothing else (backlog, trail and pointer stay) and says so.
//   7. Another tab changes the slot while the confirm is open: nothing is deleted, and it says so; a
//      save in another slot leaves the confirm open.
//   8. Keyboard: Delete moves focus to Cancel; Tab and Shift+Tab stay inside; Escape closes the
//      confirm and puts focus back on Delete; a second Escape closes the dialog (focus to Saved runs);
//      after a delete focus is on the emptied row.
//   9. Second tab (two realms on one store, as in sun-playerflow-second-tab-checks): a tab still
//      playing a slot another tab deleted writes nothing there (autosave, the hidden-tab save) and
//      says so; the Menu's Return to title asks; the Menu's Save writes the run back; a slot another
//      tab filled again after the delete is that tab's run and is never written over; a slot this
//      tab never played, or deleted itself, stays free; another tab's clear() of the whole store is
//      not a delete (as before).
//
// Part 2, Chromium through Playwright, at 360x640, 390x844, 844x390 and 1440x900: Delete and the
// confirm fit, scroll inside the panel, are at least 44px and can be hit; no sideways scroll; the
// panel does not jump when the confirm opens; focus, Tab, Escape and focus return; deleting each kind
// of row through the real buttons; then two pages in one context: a page playing slot 1 is told when
// the other page deletes it, keeps it empty, and the Menu's Save writes it back. When Playwright or
// Chromium is missing (CI has no browser) part 2 prints NOT_AVAILABLE and part 1 still decides; pass
// --require-browser to fail instead.
import { readFile } from "node:fs/promises";
import { readdirSync, readFileSync } from "node:fs";
import { createServer } from "node:http";
import { execSync } from "node:child_process";
import { createRequire } from "node:module";
import { dirname, extname, join, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { loadGame } from "./simulate.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "src");
// Every storage key the game names (the storage-keys check holds the recorded list).
const ALL_KEYS = [...new Set(readdirSync(SRC).filter(name => name.endsWith(".js"))
  .flatMap(name => [...readFileSync(join(SRC, name), "utf8").matchAll(/["'`](sunsplitter_[a-z0-9_]+)["'`]/g)].map(m => m[1])))].sort();

const QUESTION = (name, unreadable) => unreadable
  ? `Delete the unreadable save in ${name}? This can't be undone. Download it first to keep a copy.`
  : `Delete ${name}? This can't be undone. Export it first to keep a copy.`;
const DELETED = slot => `Slot ${slot} deleted`;
const CHANGED = slot => `Slot ${slot} changed in another tab · nothing deleted`;
const KEPT = slot => `Delete failed · Slot ${slot} kept`;
const NOTICE_DELETED = slot => `Slot ${slot} was deleted in another tab · not saving here · Save in Menu to keep this run there`;
const NOTICE_TAB = slot => `Another tab saved Slot ${slot} · not saving here · Load in Menu`;
const LEAVE_DELETED = slot => `Slot ${slot} was deleted in another tab · this tab's run is not saved · Return to title anyway?`;
const CHIP_DELETED = slot => `Does not save · Save first to keep this run in Slot ${slot}`;

const errors = [];
const notes = [];
const results = [];
const fail = message => errors.push(message);
const expect = (ok, message) => { if (!ok) fail(message); return ok; };
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// ---------- Part 1: headless ----------

// In the realm: a focus model, the full key list, a store holding every key, and helpers.
const PRELUDE = keys => `
  localStorage.clear();
  window.confirm = () => true;
  const proto = Object.getPrototypeOf(document.getElementById("story"));
  proto.focus = function () { document.activeElement = this; };
  const ALL = ${JSON.stringify(keys)};
  // The per-slot backlog keys (L-062, SUN-BACKLOG-RECORD-01), when this build has them.
  const BL = typeof BACKLOG_KEYS !== "undefined" ? BACKLOG_KEYS : null;
  const dump = () => Object.fromEntries(ALL.map(key => [key, localStorage.getItem(key)]));
  const text = id => String(document.getElementById(id).textContent || "");
  const shown = id => !document.getElementById(id).classList.contains("hidden");
  const isOpen = id => { const el = document.getElementById(id); return el.classList.contains("visible") && !el.classList.contains("hidden"); };
  const focusId = () => document.activeElement && document.activeElement.id;
  // The actions that show: the row's own, then the confirm's two buttons while it is open.
  const actions = () => ["saved-runs-load", "btn-export-save", "btn-export-unreadable", "btn-import-save", "saved-runs-delete", "saved-runs-close"]
    .filter(shown).concat(isOpen("saved-runs-delete-confirm") ? ["saved-runs-delete-cancel", "saved-runs-delete-ok"] : []);
  const key = (k, shiftKey) => ({ key: k, shiftKey: !!shiftKey, repeat: false, altKey: false, ctrlKey: false, metaKey: false,
    target: document.activeElement, defaultPrevented: false, preventDefault() { this.defaultPrevented = true; }, stopPropagation() {} });
  const press = (k, shiftKey) => { const e = key(k, shiftKey); handleModalDialogKeydown(e); return e.defaultPrevented; };
  const run = (scene, extra) => {
    resetRunState();
    state.scene = scene;
    return JSON.stringify(Object.assign(snapshotState(), extra || {}));
  };
  const T1 = Date.UTC(2026, 10, 13, 21, 58), T2 = Date.UTC(2026, 10, 14, 9, 10), T3 = Date.UTC(2026, 10, 15, 7, 45);
  const trailIds = SHIP_MEMORY_TRAIL_IDS.slice(0, 6);
  // Every key holds something: three runs (slot 1 with a legacy v2 save and stale transaction keys),
  // three backlogs, the ship memory with a trail for each slot, the pointer and every setting.
  const seed = opts => {
    opts = opts || {};
    for (const k of ALL) localStorage.setItem(k, "1");
    const one = run("act2_tether_sighting", { savedAt: T1, commanderCallsign: "Ash" });
    localStorage.setItem(SAVE_KEY, one);
    localStorage.setItem(SAVE_KEY_LEGACY, JSON.stringify(Object.assign(JSON.parse(run("priority_repairs")), { v: 2, savedAt: T1 - 5000 })));
    localStorage.setItem(SAVE_STAGING_KEY, "stale staging bytes");
    localStorage.setItem(SAVE_BACKUP_KEY, run("wake", { savedAt: T1 - 9000, commanderCallsign: "Ash" }));
    const k2 = saveSlotKeys(2), k3 = saveSlotKeys(3);
    localStorage.setItem(k2.live, opts.unreadable2 ? "{this build cannot read this" : run("priority_repairs", { savedAt: T2, commanderCallsign: "Keel" }));
    localStorage.setItem(k2.staging, "stale staging bytes 2");
    localStorage.setItem(k2.backup, opts.unreadable2 ? "{nor this" : run("wake", { savedAt: T2 - 9000, commanderCallsign: "Keel" }));
    localStorage.setItem(k3.live, run("ending_check", { savedAt: T3 }));
    localStorage.removeItem(k3.staging);
    localStorage.removeItem(k3.backup);
    if (BL) for (const n of [1, 2, 3]) localStorage.setItem(BL[n], JSON.stringify({ v: 1, savedAt: [T1, T2, T3][n - 1], gap: false, entries: [] }));
    localStorage.setItem(SHIP_MEMORY_KEY, JSON.stringify({ v: 1, runs: 3, endings: { fracture: 2 }, lost: { rourke: 3 }, plates: ["vault"],
      forks: { crisis: { breath: 1 }, vault: {}, tether: {}, lethal: {}, final: {} }, last: null, prints: ["0000abcd"],
      trail: { "1": trailIds.slice(0, 2), "2": trailIds.slice(2, 4), "3": opts.noTrail3 ? undefined : trailIds.slice(4, 6) } }));
    localStorage.setItem(SAVE_POINTER_KEY, String(opts.pointer || 2));
    showScreen("title");
    refreshTitleResumeUI();
  };
  const memory = () => shipMemoryRead();
  const openOn = slot => {
    document.getElementById("btn-saved-runs").focus();
    showSavedRuns();
    if (slot) { selectSavedRunsSlot(slot); document.getElementById("saved-runs-slot-" + slot).focus(); }
  };
`;

function realm(body) {
  const runtime = loadGame(ROOT);
  return JSON.parse(runtime.evaluate(`JSON.stringify((() => {${PRELUDE(ALL_KEYS)}\n${body}\n})())`));
}

function headlessChecks() {
  // 1. Exactly the slot's keys, its backlog and its trail entry; for each slot.
  for (const slot of [1, 2, 3]) {
    const label = `delete slot ${slot}`;
    const r = realm(`
      seed();
      const before = dump();
      const memBefore = memory();
      openOn(${slot});
      const asked = requestDeleteSavedRun();
      const question = text("saved-runs-delete-question");
      const okText = text("saved-runs-delete-ok");
      const okLabel = document.getElementById("saved-runs-delete-ok").getAttribute("aria-label");
      const during = actions();
      const deleted = confirmSavedRunsDelete();
      return { before, after: dump(), memBefore, memAfter: memory(), asked, question, okText, okLabel, during, deleted,
        status: text("saved-runs-status"), row: [text("saved-runs-slot-${slot}-name"), text("saved-runs-slot-${slot}-detail")],
        focus: focusId(), open: isOpen("saved-runs"), confirmShown: isOpen("saved-runs-delete-confirm"), after2: actions(),
        slotKeys: saveSlotStorageKeys(${slot}), backlogKey: BL ? BL[${slot}] : null, memKey: SHIP_MEMORY_KEY, pointerKey: SAVE_POINTER_KEY,
        cont: continueSlot(), seen: Object.keys(saveSlotSeen) };
    `);
    expect(r.asked === true && r.deleted === true, `${label}: request ${r.asked}, confirm ${r.deleted}`);
    const gone = [...r.slotKeys, ...(r.backlogKey ? [r.backlogKey] : []), ...(slot === 2 ? [r.pointerKey] : [])];
    for (const k of ALL_KEYS) {
      if (k === r.memKey) continue;
      if (gone.includes(k)) expect(r.after[k] === null, `${label}: ${k} was not removed (${String(r.after[k]).slice(0, 40)})`);
      else expect(r.after[k] === r.before[k], `${label}: ${k} changed (${String(r.before[k]).slice(0, 40)} -> ${String(r.after[k]).slice(0, 40)})`);
    }
    if (slot === 1) expect(r.slotKeys.includes("sunsplitter_save_v2"), `${label}: slot 1's keys do not include legacy v2`);
    const expected = JSON.parse(JSON.stringify(r.memBefore));
    delete expected.trail[String(slot)];
    expect(same(r.memAfter, expected), `${label}: ship memory ${JSON.stringify(r.memAfter)}, expected ${JSON.stringify(expected)}`);
    expect(Object.keys(r.memBefore.trail).length === 3, `${label}: the fixture's ship memory lost a trail (${JSON.stringify(r.memBefore.trail)})`);
    expect(r.status === DELETED(slot), `${label}: status "${r.status}"`);
    expect(same(r.row, [`Slot ${slot} · Empty`, ""]), `${label}: row reads ${JSON.stringify(r.row)}`);
    expect(r.focus === `saved-runs-slot-${slot}`, `${label}: focus after delete on ${r.focus}`);
    expect(r.open && !r.confirmShown, `${label}: dialog open ${r.open}, confirm shown ${r.confirmShown}`);
    expect(same(r.during, ["saved-runs-delete-cancel", "saved-runs-delete-ok"]), `${label}: while confirming the dialog shows ${r.during.join(", ")}`);
    expect(same(r.after2, ["btn-import-save", "saved-runs-close"]), `${label}: after the delete the row shows ${r.after2.join(", ")}`);
    expect(r.okText === `Delete Slot ${slot}` && r.okLabel === `Delete Slot ${slot}`, `${label}: confirm button "${r.okText}" / "${r.okLabel}"`);
    expect(!r.seen.includes(String(slot)), `${label}: this tab still holds the deleted slot in the second-tab guard`);
  }
  results.push("exact keys, backlog and trail for slots 1-3");

  // 2. The confirm names what goes. Slot 1 has a callsign; slot 3 is finished without one; slot 2 unreadable.
  {
    const r = realm(`
      seed({ unreadable2: true });
      const out = {};
      for (const n of [1, 2, 3]) {
        openOn(n);
        out["kind" + n] = document.getElementById("saved-runs-row-" + n).getAttribute("data-kind");
        out["del" + n] = shown("saved-runs-delete");
        out["delLabel" + n] = document.getElementById("saved-runs-delete").getAttribute("aria-label");
        requestDeleteSavedRun();
        out["q" + n] = text("saved-runs-delete-question");
        out["chipHidden" + n] = !shown("export-import-chip");
        cancelSavedRunsDelete();
        closeSavedRuns();
      }
      localStorage.removeItem(saveSlotKeys(3).live);
      refreshTitleResumeUI();
      openOn(3);
      out.emptyDelete = shown("saved-runs-delete");
      out.emptyAsk = requestDeleteSavedRun();
      out.emptyConfirm = isOpen("saved-runs-delete-confirm");
      return out;
    `);
    expect(r.kind1 === "filled" && r.kind2 === "unreadable" && r.kind3 === "finished", `confirm text: fixture kinds ${r.kind1}/${r.kind2}/${r.kind3}`);
    expect(r.del1 && r.del2 && r.del3, `confirm text: Delete shown on filled ${r.del1}, unreadable ${r.del2}, finished ${r.del3}`);
    expect(r.delLabel1 === "Delete Slot 1" && r.delLabel2 === "Delete Slot 2", `confirm text: Delete labels "${r.delLabel1}", "${r.delLabel2}"`);
    expect(r.q1 === QUESTION("Slot 1 · Ash"), `confirm text: filled "${r.q1}"`);
    expect(r.q2 === QUESTION("Slot 2", true), `confirm text: unreadable "${r.q2}"`);
    expect(r.q3 === QUESTION("Slot 3"), `confirm text: finished "${r.q3}"`);
    expect(!/\d+\s+alive/.test(r.q1 + r.q3), "confirm text: a crew count in the confirm");
    expect(r.chipHidden1 && r.chipHidden2, "confirm text: the export chip still shows under the confirm");
    expect(!r.emptyDelete && r.emptyAsk === false && !r.emptyConfirm, `confirm text: an empty row offers Delete (${r.emptyDelete}, ${r.emptyAsk})`);
    results.push("confirm names what goes");
  }

  // 3. Nothing deleted: Cancel, Escape, another row, Close, Escape twice, and a stray confirm.
  {
    const r = realm(`
      seed();
      const before = dump();
      const out = { steps: [] };
      const note = (what, extra) => out.steps.push(Object.assign({ what, same: JSON.stringify(dump()) === JSON.stringify(before),
        confirm: isOpen("saved-runs-delete-confirm"), open: isOpen("saved-runs"), focus: focusId(), acts: actions() }, extra || {}));
      openOn(2);
      requestDeleteSavedRun(); note("asked");
      cancelSavedRunsDelete(); note("cancel");
      requestDeleteSavedRun(); const esc1 = press("Escape"); note("escape", { esc1 });
      requestDeleteSavedRun(); selectSavedRunsSlot(1); note("another row");
      selectSavedRunsSlot(2); requestDeleteSavedRun(); closeSavedRuns(); note("close");
      openOn(2); note("reopened");
      requestDeleteSavedRun(); press("Escape"); press("Escape"); note("escape twice");
      out.stray = confirmSavedRunsDelete(); note("stray confirm");
      return out;
    `);
    for (const step of r.steps) expect(step.same, `nothing deleted: storage changed at "${step.what}"`);
    const at = what => r.steps.find(step => step.what === what);
    expect(at("asked").confirm && at("asked").focus === "saved-runs-delete-cancel", `nothing deleted: on asking, confirm ${at("asked").confirm}, focus ${at("asked").focus}`);
    for (const what of ["cancel", "escape"]) {
      const step = at(what);
      expect(!step.confirm && step.open && step.focus === "saved-runs-delete", `nothing deleted: after ${what} confirm ${step.confirm}, open ${step.open}, focus ${step.focus}`);
      expect(same(step.acts, ["saved-runs-load", "btn-export-save", "btn-import-save", "saved-runs-delete", "saved-runs-close"]), `nothing deleted: after ${what} the row shows ${step.acts.join(", ")}`);
    }
    expect(r.steps[2].esc1 === true, "nothing deleted: Escape was not taken by the dialog");
    expect(!at("another row").confirm && at("another row").open, "nothing deleted: choosing another row left the confirm open");
    expect(!at("close").open && !at("reopened").confirm, "nothing deleted: the confirm came back after Close");
    expect(!at("escape twice").open && at("escape twice").focus === "btn-saved-runs", `nothing deleted: two Escapes leave open ${at("escape twice").open}, focus ${at("escape twice").focus}`);
    expect(r.stray === false, "nothing deleted: a confirm with nothing asked returned true");
    results.push("Cancel, Escape, another row and Close delete nothing");
  }

  // 4. The pointer.
  {
    const r = realm(`
      const out = {};
      seed({ pointer: 2 });
      openOn(2); requestDeleteSavedRun(); confirmSavedRunsDelete();
      out.pointerAfter2 = localStorage.getItem(SAVE_POINTER_KEY);
      out.cont = continueSlot();
      out.meta = text("resume-meta");
      out.resume = shown("btn-resume");
      closeSavedRuns();
      seed({ pointer: 1 });
      openOn(2); requestDeleteSavedRun(); confirmSavedRunsDelete();
      out.pointerKept = localStorage.getItem(SAVE_POINTER_KEY);
      out.contKept = continueSlot();
      // Delete every readable run: Continue hides and Begin reads Begin.
      selectSavedRunsSlot(1); requestDeleteSavedRun(); confirmSavedRunsDelete();
      out.pointerAfter1 = localStorage.getItem(SAVE_POINTER_KEY);
      out.contOne = continueSlot();
      selectSavedRunsSlot(3); requestDeleteSavedRun(); confirmSavedRunsDelete();
      out.contNone = continueSlot();
      out.resumeNone = shown("btn-resume");
      out.metaNone = shown("resume-meta");
      out.begin = text("btn-begin");
      out.chip = shown("title-save-chip");
      out.loadNone = resumeGame();
      return out;
    `);
    expect(r.pointerAfter2 === null && r.cont === 3, `pointer: after deleting the pointer's slot, pointer ${r.pointerAfter2}, Continue ${r.cont} (expected none, 3)`);
    expect(r.resume && /^v[^ ]* · Slot 3 · Run finished · /.test(r.meta), `pointer: Continue line "${r.meta}"`);
    expect(r.pointerKept === "1" && r.contKept === 1, `pointer: deleting another slot moved it to ${r.pointerKept} (Continue ${r.contKept})`);
    expect(r.pointerAfter1 === null && r.contOne === 3, `pointer: after slot 1 too, pointer ${r.pointerAfter1}, Continue ${r.contOne}`);
    expect(r.contNone === null && !r.resumeNone && !r.metaNone && r.begin === "Begin" && !r.chip, `pointer: nothing left: ${JSON.stringify(r)}`);
    expect(r.loadNone === false, "pointer: Continue loaded something after every slot was deleted");
    results.push("pointer moves off the deleted slot");
  }

  // 5. Unreadable slot: deletable, and the title stops saying it can't be read.
  {
    const r = realm(`
      seed({ unreadable2: true });
      const before = text("title-save-status");
      openOn(2);
      requestDeleteSavedRun();
      const ok = confirmSavedRunsDelete();
      const k = saveSlotKeys(2);
      const out = { before, ok, keys: [k.live, k.staging, k.backup].map(key => localStorage.getItem(key)),
        backlog: BL ? localStorage.getItem(BL[2]) : null, status: text("title-save-status"), row: text("saved-runs-slot-2-name"),
        unreadable: unreadableSaveRaw(2) };
      closeSavedRuns();
      refreshTitleResumeUI();
      out.repaint = text("title-save-status");
      return out;
    `);
    expect(/Slot 2 can't be read/.test(r.before), `unreadable: fixture title line "${r.before}"`);
    expect(r.ok === true && same(r.keys, [null, null, null]) && r.backlog === null && r.unreadable === null, `unreadable: ${JSON.stringify(r)}`);
    expect(r.status === DELETED(2) && r.row === "Slot 2 · Empty", `unreadable: status "${r.status}", row "${r.row}"`);
    expect(!/can't be read/.test(r.repaint), `unreadable: the title still says "${r.repaint}"`);
    results.push("an unreadable slot can be deleted");
  }

  // 6. A removal that fails: nothing else is touched, and the status says so.
  {
    const r = realm(`
      seed();
      const before = dump();
      const real = localStorage.removeItem;
      const blocked = saveSlotStorageKeys(2);
      localStorage.removeItem = k => { if (blocked.includes(k)) throw new Error("blocked"); return real(k); };
      openOn(2);
      requestDeleteSavedRun();
      const ok = confirmSavedRunsDelete();
      localStorage.removeItem = real;
      return { ok, same: JSON.stringify(dump()) === JSON.stringify(before), status: text("saved-runs-status"),
        error: document.getElementById("saved-runs-status").classList.contains("error"), row: text("saved-runs-slot-2-name"),
        seen2: Object.prototype.hasOwnProperty.call(saveSlotSeen, 2) };
    `);
    expect(r.ok === false && r.same, `failed removal: ok ${r.ok}, storage unchanged ${r.same}`);
    expect(r.status === KEPT(2) && r.error, `failed removal: status "${r.status}" (error ${r.error})`);
    expect(r.row === "Slot 2 · Keel", `failed removal: row "${r.row}"`);
    results.push("a failed removal deletes nothing");
  }

  // 7. Another tab changes the slot under the confirm.
  {
    const r = realm(`
      const out = {};
      seed();
      const other = run("act3_reckoning_cut", { savedAt: T2 + 60000, commanderCallsign: "Keel" });
      // (a) Changed with no event yet: the confirm re-checks and deletes nothing.
      openOn(2); requestDeleteSavedRun();
      localStorage.setItem(saveSlotKeys(2).live, other);
      out.a = { ok: confirmSavedRunsDelete(), kept: localStorage.getItem(saveSlotKeys(2).live) === other,
        status: text("saved-runs-status"), focus: focusId(), confirm: isOpen("saved-runs-delete-confirm") };
      // (b) Changed, and the storage event arrives: the confirm closes at once and says so.
      selectSavedRunsSlot(2); requestDeleteSavedRun();
      const newer = run("act3_reckoning_cut", { savedAt: T2 + 120000, commanderCallsign: "Keel" });
      localStorage.setItem(saveSlotKeys(2).live, newer);
      window.dispatchEvent({ type: "storage", key: saveSlotKeys(2).live, oldValue: other, newValue: newer, storageArea: localStorage });
      out.b = { confirm: isOpen("saved-runs-delete-confirm"), status: text("saved-runs-status"), focus: focusId(), open: isOpen("saved-runs"),
        kept: localStorage.getItem(saveSlotKeys(2).live) === newer };
      // (c) A save in another slot leaves the confirm open.
      requestDeleteSavedRun();
      const three = run("ending_check", { savedAt: T3 + 1000 });
      localStorage.setItem(saveSlotKeys(3).live, three);
      window.dispatchEvent({ type: "storage", key: saveSlotKeys(3).live, oldValue: null, newValue: three, storageArea: localStorage });
      out.c = { confirm: isOpen("saved-runs-delete-confirm"), q: text("saved-runs-delete-question"), focus: focusId() };
      out.c.ok = confirmSavedRunsDelete();
      out.c.gone = localStorage.getItem(saveSlotKeys(2).live) === null && localStorage.getItem(saveSlotKeys(3).live) === three;
      return out;
    `);
    expect(r.a.ok === false && r.a.kept && r.a.status === CHANGED(2) && !r.a.confirm && r.a.focus === "saved-runs-slot-2", `changed, no event: ${JSON.stringify(r.a)}`);
    expect(!r.b.confirm && r.b.open && r.b.kept && r.b.status === CHANGED(2) && r.b.focus === "saved-runs-slot-2", `changed, event: ${JSON.stringify(r.b)}`);
    expect(r.c.confirm && r.c.q === QUESTION("Slot 2 · Keel") && r.c.focus === "saved-runs-delete-cancel", `another slot's save: ${JSON.stringify(r.c)}`);
    expect(r.c.ok === true && r.c.gone, `another slot's save, then confirm: ${JSON.stringify(r.c)}`);
    results.push("another tab's change under the confirm");
  }

  // 8. Keyboard: the trap with the confirm's own stops, Escape, and keys behind the dialog.
  {
    const r = realm(`
      seed();
      openOn(1);
      requestDeleteSavedRun();
      const dialog = document.getElementById("saved-runs");
      const stops = ["saved-runs-slot-1", "saved-runs-delete-cancel", "saved-runs-delete-ok"].map(id => document.getElementById(id));
      stops[0].tagName = "INPUT"; stops[0].type = "radio"; stops[0].name = "save-slot"; stops[0].checked = true;
      stops[1].tagName = stops[2].tagName = "BUTTON";
      dialog.querySelectorAll = () => stops;
      dialog.contains = node => node === dialog || stops.includes(node);
      const out = { start: focusId(), forward: [], back: [] };
      // A Tab the dialog does not take is the browser's: step to the next stop.
      const tab = shift => { const e = key("Tab", shift); handleModalDialogKeydown(e); if (!e.defaultPrevented) { const i = stops.indexOf(document.activeElement); document.activeElement = stops[i + (shift ? -1 : 1)] || null; } return focusId(); };
      for (let i = 0; i < 6; i++) out.forward.push(tab(false));
      for (let i = 0; i < 6; i++) out.back.push(tab(true));
      const before = dump();
      document.getElementById("saved-runs-delete-ok").focus();
      const digit = key("1"); digit.target = document.body || null; handleModalDialogKeydown(digit);
      out.digit = digit.defaultPrevented;
      out.enterBehind = (() => { const e = key("Enter"); e.target = document.getElementById("btn-begin"); handleModalDialogKeydown(e); handleTitleChromeKeydown(e); return e.defaultPrevented; })();
      out.same = JSON.stringify(dump()) === JSON.stringify(before);
      out.screenTitle = shown("title-screen");
      press("Escape");
      out.afterEsc = { focus: focusId(), open: isOpen("saved-runs"), confirm: isOpen("saved-runs-delete-confirm") };
      return out;
    `);
    const ids = ["saved-runs-slot-1", "saved-runs-delete-cancel", "saved-runs-delete-ok"];
    expect(r.start === "saved-runs-delete-cancel", `keyboard: focus on asking is ${r.start}`);
    expect(r.forward.every(id => ids.includes(id)) && new Set(r.forward).size === 3, `keyboard: Tab visits ${r.forward.join(", ")}`);
    expect(r.back.every(id => ids.includes(id)) && new Set(r.back).size === 3, `keyboard: Shift+Tab visits ${r.back.join(", ")}`);
    expect(r.digit && r.enterBehind && r.same && r.screenTitle, `keyboard: a digit or Enter behind the dialog reached the title (${JSON.stringify(r)})`);
    expect(r.afterEsc.focus === "saved-runs-delete" && r.afterEsc.open && !r.afterEsc.confirm, `keyboard: Escape from the confirm ${JSON.stringify(r.afterEsc)}`);
    results.push("keyboard and focus");
  }
}

// ---------- Part 1, second tab: two realms on one store ----------

// In each realm: a seeded picker over the choices a player could press, one choice step, and the bar.
const TAB_HELPERS = seedValue => `(() => {
  const choicesEl = document.getElementById("choices");
  if (choicesEl && !choicesEl.__clearsOnInnerHTML) {
    let html = choicesEl.innerHTML;
    Object.defineProperty(choicesEl, "innerHTML", { configurable: true, get: () => html, set: value => { html = String(value); choicesEl.children.length = 0; } });
    choicesEl.__clearsOnInnerHTML = true;
  }
  const proto = Object.getPrototypeOf(document.getElementById("story"));
  proto.focus = function () { document.activeElement = this; };
  window.confirm = () => true;
  let seed = ${seedValue};
  const rnd = () => { seed = (Math.imul(seed, 1103515245) + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  const enabled = c => c && (!c.alive || isAlive(c.alive)) && (!c.aliveAll || c.aliveAll.every(k => isAlive(k))) &&
    (!c.aliveAny || c.aliveAny.some(k => isAlive(k))) && (!c.requires || meetsRequirements(c.requires)) &&
    (!c.effects || canAffordEffects(c.effects));
  globalThis.__tabStep = () => {
    if (state.scene === "ending_check" || !scenes[state.scene]) {
      if (!beginFreshCampaign({ persist: false, preserveCompletedSlotUntilChoice: true })) return "replay-failed";
    }
    const scene = scenes[state.scene];
    const list = ((typeof scene.choices === "function" ? scene.choices() : scene.choices) || []).filter(enabled);
    if (!list.length) return "stuck:" + state.scene;
    makeChoice(list[Math.floor(rnd() * list.length)]);
    return state.scene;
  };
  globalThis.__tabBar = () => {
    const el = document.getElementById("save-status");
    return { text: el ? String(el.textContent || "") : "", visible: !!el && el.classList.contains("visible"), error: !!el && el.classList.contains("error") };
  };
  // Delete a slot through the title's Saved runs dialog, as a player would.
  globalThis.__deleteSlot = slot => {
    showTitleScreen();
    showSavedRuns();
    selectSavedRunsSlot(slot);
    if (!requestDeleteSavedRun()) return "not offered";
    const ok = confirmSavedRunsDelete();
    closeSavedRuns();
    return ok;
  };
  return true;
})()`;

function newTab(seedValue) {
  const tab = loadGame(ROOT);
  tab.evaluate(TAB_HELPERS(seedValue));
  return tab;
}

// Two realms on one store. Each write posts a storage event to the other realm; deliver() dispatches
// them later, as the browser does once the writing task ends. (The harness of sun-playerflow-second-tab-checks.)
function shareStorage(tabs) {
  const store = tabs[0].browser.localStorage;
  const base = { getItem: store.getItem, setItem: store.setItem, removeItem: store.removeItem, clear: store.clear };
  const queues = new Map(tabs.map(tab => [tab, []]));
  for (const tab of tabs) {
    const area = tab.browser.localStorage;
    const others = tabs.filter(other => other !== tab);
    const post = (key, oldValue, newValue) => {
      if (oldValue === newValue) return;
      for (const other of others) queues.get(other).push({ type: "storage", key, oldValue, newValue, url: "http://localhost/", storageArea: other.browser.localStorage });
    };
    area.getItem = base.getItem;
    area.setItem = (key, value) => { const old = base.getItem(key); base.setItem(key, value); post(key, old, base.getItem(key)); };
    area.removeItem = key => { const old = base.getItem(key); base.removeItem(key); post(key, old, null); };
    area.clear = () => { base.clear(); for (const other of others) queues.get(other).push({ type: "storage", key: null, oldValue: null, newValue: null, url: "http://localhost/", storageArea: other.browser.localStorage }); };
  }
  return {
    get: key => base.getItem(key),
    deliver(...targets) { for (const tab of targets.length ? targets : tabs) { const queue = queues.get(tab); while (queue.length) tab.browser.window.dispatchEvent(queue.shift()); } },
    drop(tab) { queues.get(tab).length = 0; },
    reset() { base.clear(); for (const queue of queues.values()) queue.length = 0; }
  };
}

function secondTabChecks() {
  const A = newTab(101);
  const B = newTab(202);
  const store = shareStorage([A, B]);
  const bar = tab => tab.evaluate("__tabBar()");
  const step = tab => tab.evaluate("__tabStep()");
  const live = slot => store.get(slot === 1 ? "sunsplitter_save_v3" : `sunsplitter_save_v3_slot${slot}`);
  const seen = (tab, slot) => tab.evaluate(`Object.prototype.hasOwnProperty.call(saveSlotSeen, ${slot}) ? saveSlotSeen[${slot}] : undefined`);
  const slotKeys = slot => A.evaluate(`saveSlotStorageKeys(${slot})`);
  const empty = slot => slotKeys(slot).every(key => store.get(key) === null);
  const told = (tab, text) => { const b = bar(tab); return b.text === text && b.visible && b.error; };
  const backlogKey = A.evaluate(`typeof BACKLOG_KEYS !== "undefined" ? BACKLOG_KEYS[2] : null`);
  let label = "second tab, deleted";

  // A plays slot 2; B, on the title, deletes it.
  store.reset();
  expect(A.evaluate("beginFreshCampaign({ persist: true, slot: 2 })") === true, `${label}: A's new run in slot 2 failed`);
  for (let i = 0; i < 2; i++) step(A);
  store.deliver(B);
  expect(B.evaluate("__deleteSlot(2)") === true, `${label}: B's delete of slot 2 failed`);
  expect(empty(2), `${label}: slot 2 is not empty after B's delete`);
  store.deliver(A);
  expect(told(A, NOTICE_DELETED(2)), `${label}: A shows ${JSON.stringify(bar(A))}, expected the deleted notice at once`);
  expect(A.evaluate("runTrailSaveSlot()") === null, `${label}: A still records a ship-memory trail under slot 2`);
  // Autosave after a choice, the hidden-tab save and the Menu's chip.
  step(A);
  A.browser.window.dispatchEvent({ type: "pagehide" });
  expect(empty(2), `${label}: A's autosave or hidden-tab save wrote slot 2 back`);
  expect(told(A, NOTICE_DELETED(2)), `${label}: after a choice A shows ${JSON.stringify(bar(A))}`);
  A.evaluate("syncMenuReturnTitleChip()");
  const chip = A.evaluate(`document.getElementById("menu-return-title-chip").textContent`);
  expect(chip === CHIP_DELETED(2), `${label}: the Menu's Return to title chip reads "${chip}"`);
  // Return to title asks; Cancel keeps the run.
  A.evaluate(`globalThis.__asked = []; window.confirm = q => { __asked.push(q); return false; }`);
  expect(A.evaluate("menuReturnToTitle()") === false, `${label}: Return to title, cancelled, left the run`);
  const asked = A.evaluate("__asked");
  expect(same(asked, [LEAVE_DELETED(2)]), `${label}: Return to title asked ${JSON.stringify(asked)}`);
  expect(empty(2), `${label}: a cancelled Return to title wrote slot 2`);
  A.evaluate("window.confirm = () => true");
  // The Menu's Save writes the run back; autosave then goes on as before.
  expect(A.evaluate("menuSaveGame()") === true, `${label}: the Menu's Save did not write the run back`);
  expect(live(2) !== null && live(2) === seen(A, 2) && JSON.parse(live(2)).scene === A.evaluate("state.scene"), `${label}: slot 2 does not hold A's run after Save`);
  expect(bar(A).text === "Saved" && !bar(A).error, `${label}: after Save A shows ${JSON.stringify(bar(A))}`);
  expect(A.evaluate("runTrailSaveSlot()") === 2, `${label}: the trail slot did not come back after Save`);
  if (backlogKey) expect(store.get(backlogKey) !== null, `${label}: Save did not write slot 2's backlog back`);
  store.deliver(B);
  const afterSave = live(2);
  step(A);
  expect(live(2) !== afterSave && live(2) === seen(A, 2) && !bar(A).error, `${label}: the next autosave after Save did not write slot 2`);
  store.deliver(B);
  const bRow = B.evaluate(`document.getElementById("saved-runs-slot-2-name").textContent`);
  expect(!bar(B).error && bRow !== "Slot 2 · Empty", `${label}: B's title did not follow A's write-back (row "${bRow}", bar ${JSON.stringify(bar(B))})`);

  // Return to title, accepted, leaves slot 2 empty and Continue off it.
  label = "second tab, leave";
  store.reset();
  A.evaluate("beginFreshCampaign({ persist: true, slot: 2 })");
  step(A);
  store.deliver(B);
  B.evaluate("__deleteSlot(2)");
  store.deliver(A);
  A.evaluate(`globalThis.__asked = []; window.confirm = q => { __asked.push(q); return true; }`);
  expect(A.evaluate("menuReturnToTitle()") === true, `${label}: Return anyway did not leave`);
  expect(same(A.evaluate("__asked"), [LEAVE_DELETED(2)]) && empty(2), `${label}: asked ${JSON.stringify(A.evaluate("__asked"))}, slot 2 empty ${empty(2)}`);
  expect(store.get("sunsplitter_save_current_v1") === null, `${label}: leaving pointed Continue at ${store.get("sunsplitter_save_current_v1")}`);
  expect(A.evaluate(`document.getElementById("btn-resume").classList.contains("hidden")`), `${label}: A's title offers Continue with nothing saved`);
  A.evaluate("window.confirm = () => true");

  // Filled again by another tab after the delete: that tab's run, never written over, with or without the event.
  for (const delivered of [true, false]) {
    label = `second tab, refilled (event ${delivered ? "delivered" : "not yet"})`;
    store.reset();
    A.evaluate("beginFreshCampaign({ persist: true, slot: 2 })");
    step(A);
    store.deliver(B);
    B.evaluate("__deleteSlot(2)");
    store.deliver(A);
    expect(told(A, NOTICE_DELETED(2)), `${label}: A was not told of the delete`);
    expect(B.evaluate("beginFreshCampaign({ persist: true, slot: 2 })") === true, `${label}: B's new run in slot 2 failed`);
    if (delivered) store.deliver(A); else store.drop(A);
    const bRun = live(2);
    expect(A.evaluate("saveGame()") === false, `${label}: A's Save reported a save over B's new run`);
    step(A);
    A.browser.window.dispatchEvent({ type: "pagehide" });
    expect(live(2) === bRun, `${label}: A wrote over B's new run in slot 2`);
    expect(told(A, NOTICE_TAB(2)), `${label}: A shows ${JSON.stringify(bar(A))}, expected another tab's run`);
  }

  // Taken by another tab's run first, then deleted there: A is told of the delete, and Save writes back.
  label = "second tab, taken then deleted";
  store.reset();
  A.evaluate("beginFreshCampaign({ persist: true, slot: 2 })");
  step(A);
  store.deliver(B);
  expect(B.evaluate("loadSaveSlot(2)") === true, `${label}: B's Load of slot 2 failed`);
  step(B);
  store.deliver(A);
  expect(told(A, NOTICE_TAB(2)), `${label}: A was not told of B's save (${JSON.stringify(bar(A))})`);
  expect(B.evaluate("__deleteSlot(2)") === true, `${label}: B's delete of slot 2 failed`);
  store.deliver(A);
  expect(told(A, NOTICE_DELETED(2)), `${label}: after B's delete A shows ${JSON.stringify(bar(A))}`);
  step(A);
  expect(empty(2), `${label}: A's autosave wrote slot 2 back`);
  expect(A.evaluate("saveGame()") === true && live(2) === seen(A, 2), `${label}: A's Save did not write the run back`);

  // A slot this tab never played (slot 3) stays free; so does one it deleted itself.
  label = "second tab, free";
  store.reset();
  expect(B.evaluate("beginFreshCampaign({ persist: true, slot: 3 })") === true, `${label}: B's new run in slot 3 failed`);
  expect(A.evaluate("beginFreshCampaign({ persist: true, slot: 1 })") === true, `${label}: A's new run in slot 1 failed`);
  store.deliver(B);
  B.evaluate("showTitleScreen()");
  expect(B.evaluate("__deleteSlot(3)") === true, `${label}: B's delete of slot 3 failed`);
  store.deliver(A);
  expect(!bar(A).error && A.evaluate("saveSlotTakenElsewhere(3)") === false && A.evaluate("Object.keys(saveSlotSeen)").includes("3") === false,
    `${label}: A never played slot 3 but is told (${JSON.stringify(bar(A))})`);
  const before1 = live(1);
  step(A);
  expect(live(1) !== before1 && live(1) === seen(A, 1), `${label}: A's slot 1 autosave stopped`);
  // A deletes the slot it played itself (from the title), then starts there again.
  expect(A.evaluate("menuReturnToTitle()") === true, `${label}: A's Return to title failed`);
  expect(A.evaluate("__deleteSlot(1)") === true && empty(1), `${label}: A's own delete of slot 1 failed`);
  expect(A.evaluate("saveSlotTakenElsewhere(1)") === false, `${label}: A's own delete marked slot 1 taken`);
  expect(A.evaluate("beginFreshCampaign({ persist: true, slot: 1 })") === true, `${label}: A's new run in slot 1 after its own delete failed`);
  step(A);
  expect(live(1) === seen(A, 1) && !bar(A).error, `${label}: A's run in slot 1 after its own delete did not save`);
  // clearSave by this tab is also its own: the slot stays free.
  A.evaluate("clearSave(1)");
  step(A);
  expect(live(1) === seen(A, 1) && !bar(A).error, `${label}: after this tab's clearSave the slot was not free`);

  // Another tab's clear() of the whole store is not a delete: the emptied slot stays free (as before).
  label = "second tab, store cleared";
  store.reset();
  A.evaluate("beginFreshCampaign({ persist: true, slot: 1 })");
  step(A);
  B.browser.localStorage.clear();
  store.deliver(A);
  step(A);
  expect(live(1) === seen(A, 1) && !bar(A).error, `${label}: A did not save after another tab cleared the store (${JSON.stringify(bar(A))})`);

  // Without the storage event a tab cannot tell another tab's Delete from cleared site data: it
  // writes its run back, as it did before this ticket. (Recorded; see the PR's open question.)
  store.reset();
  A.evaluate("beginFreshCampaign({ persist: true, slot: 2 })");
  step(A);
  B.evaluate("__deleteSlot(2)");
  store.drop(A);
  step(A);
  notes.push(`second tab, delete before its event arrives: A's next autosave ${live(2) === seen(A, 2) ? "writes its run back (cannot be told from cleared site data)" : "writes nothing"}`);
  results.push("second tab");
}

// ---------- Part 2: Chromium ----------
const VIEWPORTS = [[360, 640], [390, 844], [844, 390], [1440, 900]];
const MIN_TARGET = 44;
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".jpg": "image/jpeg", ".png": "image/png",
  ".json": "application/json", ".svg": "image/svg+xml", ".webp": "image/webp", ".woff2": "font/woff2" };

async function loadPlaywright() {
  const candidates = [];
  if (process.env.SUNSPLITTER_PLAYWRIGHT_MODULE) candidates.push(pathToFileURL(resolve(process.env.SUNSPLITTER_PLAYWRIGHT_MODULE)).href);
  candidates.push("playwright");
  try {
    const globalRoot = execSync("npm root -g", { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
    candidates.push(pathToFileURL(createRequire(join(globalRoot, "x")).resolve("playwright")).href);
  } catch { /* no global npm */ }
  for (const candidate of candidates) {
    try { const mod = await import(candidate); return mod.default || mod; } catch { /* next */ }
  }
  return null;
}

// Storage a page starts with: tone acknowledged, tutorial seen, slot 1 filled (Harbor), slot 2
// unreadable, slot 3 finished, pointer on slot 1.
function seedStorage() {
  const base = {
    v: 3, gameVersion: "seed", sceneEntered: true, survivors: 9, integrity: 60, cohesion: 50, supplies: 40, embryos: 30,
    flags: {}, dead: [], deathCause: {}, affinity: {}, trust: {}, romance: {}, pursuit: {}, favors: {}, past_known_by: {},
    dying: {}, past_known: false, marks: {}, memories: [], ideology: { future: 0, living: 0 },
    recovered: { tomas: false, jiro: false, vess: false }, promises: {}, crisisPath: null
  };
  return {
    sunsplitter_tone_ack_v1: "1",
    sunsplitter_tutorial_seen_v1: "1",
    sunsplitter_save_v3: JSON.stringify(Object.assign({}, base, { scene: "act2_tether_sighting", savedAt: Date.UTC(2026, 10, 13, 21, 58), commanderCallsign: "Harbor",
      dead: ["lena"], deathCause: { lena: "layout fixture" } })),
    sunsplitter_save_v3_slot2: "{this build cannot read this",
    sunsplitter_save_v3_slot3: JSON.stringify(Object.assign({}, base, { scene: "ending_check", savedAt: Date.UTC(2026, 10, 12, 8, 5) })),
    sunsplitter_save_current_v1: "1"
  };
}

const MEASURE = `(() => {
  const rect = el => { if (!el || !el.getClientRects().length) return null; const b = el.getBoundingClientRect(); return { x: b.left, y: b.top, w: b.width, h: b.height }; };
  const panel = document.querySelector("#saved-runs .saved-runs-panel");
  const dialog = document.getElementById("saved-runs");
  const ids = ["saved-runs-load", "btn-export-save", "btn-export-unreadable", "btn-import-save", "saved-runs-delete", "saved-runs-close",
    "saved-runs-delete-question", "saved-runs-delete-cancel", "saved-runs-delete-ok"];
  return {
    vw: document.documentElement.clientWidth, vh: window.innerHeight,
    docOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    open: !!(dialog && dialog.classList.contains("visible") && !dialog.classList.contains("hidden")),
    panel: rect(panel), panelOverflowX: panel ? panel.scrollWidth - panel.clientWidth : null,
    panelScrolls: panel ? panel.scrollHeight > panel.clientHeight + 1 : null,
    shown: ids.filter(id => { const el = document.getElementById(id); return el && el.getClientRects().length > 0; }),
    selected: [1, 2, 3].find(n => document.getElementById("saved-runs-slot-" + n).checked) || null,
    focus: document.activeElement ? document.activeElement.id : null,
    focusInside: !!(document.activeElement && dialog && dialog.contains(document.activeElement)),
    question: document.getElementById("saved-runs-delete-question").textContent,
    status: document.getElementById("saved-runs-status").textContent,
    rows: [1, 2, 3].map(n => document.getElementById("saved-runs-slot-" + n + "-name").textContent),
    resumeHidden: document.getElementById("btn-resume").classList.contains("hidden"),
    begin: document.getElementById("btn-begin").textContent,
    keys: Object.fromEntries(["sunsplitter_save_v3", "sunsplitter_save_v3_slot2", "sunsplitter_save_v3_slot3", "sunsplitter_save_current_v1", "sunsplitter_tone_ack_v1"]
      .map(k => [k, localStorage.getItem(k)]))
  };
})()`;

// Scroll an element into view inside the panel; its size and whether a tap at its centre reaches it.
const TARGET = id => {
  const el = document.getElementById(id);
  if (!el || !el.getClientRects().length) return { id, missing: true };
  el.scrollIntoView({ block: "nearest", inline: "nearest" });
  const b = el.getBoundingClientRect();
  const hit = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2);
  return { id, w: b.width, h: b.height, left: b.left, right: b.right, top: b.top, bottom: b.bottom,
    reachable: !!hit && (hit === el || el.contains(hit) || (hit.closest && hit.closest("label") && hit.closest("label").htmlFor === id)) };
};

async function browserChecks(requireBrowser) {
  const pw = await loadPlaywright();
  if (!pw) {
    const line = "NOT_AVAILABLE — Playwright is not installed here (CI has no browser); run this file where it is";
    if (requireBrowser) fail(line);
    return { ran: false, line };
  }
  const server = createServer(async (req, res) => {
    try {
      const path = decodeURIComponent(new URL(req.url, "http://x").pathname);
      const file = resolve(ROOT, "." + (path === "/" ? "/index.html" : path));
      if (file !== ROOT && !file.startsWith(ROOT + sep)) { res.writeHead(403); res.end(); return; }
      const body = await readFile(file);
      res.writeHead(200, { "content-type": TYPES[extname(file)] || "application/octet-stream" });
      res.end(body);
    } catch { res.writeHead(404); res.end(); }
  });
  await new Promise(done => server.listen(0, "127.0.0.1", done));
  const url = `http://127.0.0.1:${server.address().port}/index.html`;
  let browser;
  try {
    browser = await pw.chromium.launch({ executablePath: process.env.CHROMIUM_PATH, args: ["--no-sandbox"] });
  } catch (error) {
    server.close();
    const line = `NOT_AVAILABLE — Chromium did not launch (${String(error && error.message).split("\n")[0].slice(0, 120)})`;
    if (requireBrowser) fail(line);
    return { ran: false, line };
  }
  const pageErrors = [];
  const summary = [];
  try {
    for (const [width, height] of VIEWPORTS) {
      const name = `${width}x${height}`;
      const context = await browser.newContext({ viewport: { width, height }, reducedMotion: "reduce", hasTouch: width < 600 });
      const page = await context.newPage();
      page.on("pageerror", e => pageErrors.push(`${name}: ${String(e.message).slice(0, 160)}`));
      await page.addInitScript(values => {
        if (sessionStorage.getItem("__seeded")) return;
        try { for (const [k, v] of Object.entries(values)) localStorage.setItem(k, v); sessionStorage.setItem("__seeded", "1"); } catch (e) { /* blocked */ }
      }, seedStorage());
      await page.goto(url);
      await page.waitForFunction(() => typeof showSavedRuns === "function" && !document.getElementById("title-screen").classList.contains("hidden"));
      const press = async id => { if (width < 600) await page.locator("#" + id).tap(); else await page.locator("#" + id).click(); };
      const m = () => page.evaluate(MEASURE);
      const sizeCheck = async (ids, panel, what) => {
        for (const id of ids) {
          const t = await page.evaluate(TARGET, id);
          if (t.missing) { fail(`${name}: ${what}: ${id} is not shown`); continue; }
          if (t.h < MIN_TARGET || t.w < MIN_TARGET) fail(`${name}: ${what}: ${id} is ${Math.round(t.w)}x${Math.round(t.h)}, under ${MIN_TARGET}px`);
          if (t.left < panel.x - 0.5 || t.right > panel.x + panel.w + 0.5) fail(`${name}: ${what}: ${id} spills out of the panel sideways`);
          if (!t.reachable) fail(`${name}: ${what}: ${id} cannot be hit at its centre once scrolled into view`);
        }
      };
      const fits = (s, what) => {
        const p = s.panel;
        if (!p || p.x < -0.5 || p.y < -0.5 || p.x + p.w > s.vw + 0.5 || p.y + p.h > s.vh + 0.5) fail(`${name}: ${what}: panel leaves the viewport ${JSON.stringify(p)}`);
        if (s.docOverflow > 0 || s.panelOverflowX > 0) fail(`${name}: ${what}: sideways scroll ${s.docOverflow}/${s.panelOverflowX}px`);
      };

      await press("btn-saved-runs");
      const open = await m();
      if (!open.open) { fail(`${name}: Saved runs did not open`); await context.close(); continue; }
      fits(open, "open");
      // Each row's actions, with Delete, at size.
      const expectShown = {
        1: ["saved-runs-load", "btn-export-save", "btn-import-save", "saved-runs-delete", "saved-runs-close"],
        2: ["btn-export-unreadable", "btn-import-save", "saved-runs-delete", "saved-runs-close"],
        3: ["saved-runs-load", "btn-export-save", "btn-import-save", "saved-runs-delete", "saved-runs-close"]
      };
      const panelBySlot = {};
      for (const slot of [1, 2, 3]) {
        await page.evaluate(n => document.getElementById("saved-runs-row-" + n).scrollIntoView({ block: "nearest" }), slot);
        await press(`saved-runs-row-${slot}`);
        const s = await m();
        panelBySlot[slot] = s.panel;
        if (!same(s.shown, expectShown[slot])) fail(`${name}: row ${slot} shows ${s.shown.join(", ")}`);
        fits(s, `row ${slot}`);
        await sizeCheck(s.shown, s.panel, `row ${slot}`);
      }
      // The panel keeps its place between rows and when the confirm opens.
      await press("saved-runs-row-1");
      const row1 = await m();
      await page.evaluate(() => document.getElementById("saved-runs-delete").scrollIntoView({ block: "nearest" }));
      const beforeAsk = await m();
      await press("saved-runs-delete");
      const asked = await m();
      if (!same(asked.shown, ["saved-runs-delete-question", "saved-runs-delete-cancel", "saved-runs-delete-ok"])) fail(`${name}: the confirm shows ${asked.shown.join(", ")}`);
      if (asked.focus !== "saved-runs-delete-cancel") fail(`${name}: focus on asking is ${asked.focus}`);
      if (asked.question !== QUESTION("Slot 1 · Harbor")) fail(`${name}: question "${asked.question}"`);
      const jump = Math.abs(asked.panel.y - beforeAsk.panel.y) + Math.abs(asked.panel.h - beforeAsk.panel.h);
      if (jump > 1) fail(`${name}: the panel moved ${Math.round(jump)}px when the confirm opened (${JSON.stringify(beforeAsk.panel)} -> ${JSON.stringify(asked.panel)})`);
      // Between rows: on phones "Download unreadable save" wraps to two lines (as before this ticket),
      // which may move a centred panel by a couple of pixels; no more than that.
      const rowJump = Math.max(...[2, 3].map(n => Math.abs(panelBySlot[n].y - panelBySlot[1].y)));
      if (rowJump > 3) fail(`${name}: the panel moved ${Math.round(rowJump)}px between rows`);
      fits(asked, "confirm");
      await sizeCheck(["saved-runs-delete-cancel", "saved-runs-delete-ok"], asked.panel, "confirm");
      if (process.env.DELETE_SLOT_SHOTS) await page.screenshot({ path: join(process.env.DELETE_SLOT_SHOTS, `delete-confirm-${name}.png`) });
      // Tab and Shift+Tab stay inside and reach the confirm's stops.
      const stops = new Set();
      for (const k of ["Tab", "Tab", "Tab", "Tab", "Shift+Tab", "Shift+Tab", "Shift+Tab", "Shift+Tab"]) {
        await page.keyboard.press(k);
        const f = await m();
        if (!f.focusInside) { fail(`${name}: ${k} left the dialog for #${f.focus}`); break; }
        stops.add(f.focus);
      }
      for (const id of ["saved-runs-slot-1", "saved-runs-delete-cancel", "saved-runs-delete-ok"]) if (!stops.has(id)) fail(`${name}: Tab never reached ${id} (${[...stops].join(", ")})`);
      for (const id of stops) if (!["saved-runs-slot-1", "saved-runs-delete-cancel", "saved-runs-delete-ok"].includes(id)) fail(`${name}: Tab stopped on ${id} while confirming`);
      // Escape cancels the confirm only; Cancel deletes nothing.
      await page.keyboard.press("Escape");
      const esc = await m();
      if (!esc.open || esc.shown.includes("saved-runs-delete-ok") || esc.focus !== "saved-runs-delete") fail(`${name}: Escape from the confirm: open ${esc.open}, focus ${esc.focus}, shows ${esc.shown.join(", ")}`);
      await press("saved-runs-delete");
      await press("saved-runs-delete-cancel");
      const cancelled = await m();
      if (!same(cancelled.keys, row1.keys) || cancelled.focus !== "saved-runs-delete") fail(`${name}: Cancel: focus ${cancelled.focus}, storage changed ${!same(cancelled.keys, row1.keys)}`);
      // Delete the unreadable slot from the keyboard: Delete, Tab to the confirm button, Enter.
      await press("saved-runs-row-2");
      await page.locator("#saved-runs-delete").focus();
      await page.keyboard.press("Enter");
      const askedU = await m();
      if (askedU.question !== QUESTION("Slot 2", true)) fail(`${name}: unreadable question "${askedU.question}"`);
      await page.keyboard.press("Tab");
      if ((await m()).focus !== "saved-runs-delete-ok") fail(`${name}: Tab from Cancel did not reach the confirm button`);
      await page.keyboard.press("Enter");
      const delU = await m();
      if (delU.keys.sunsplitter_save_v3_slot2 !== null || delU.rows[1] !== "Slot 2 · Empty" || delU.status !== DELETED(2) || delU.focus !== "saved-runs-slot-2") {
        fail(`${name}: deleting the unreadable slot: ${JSON.stringify({ key: delU.keys.sunsplitter_save_v3_slot2, row: delU.rows[1], status: delU.status, focus: delU.focus })}`);
      }
      // Delete slot 1 (Continue's) by tap or click: Continue moves to slot 3, the finished run.
      await press("saved-runs-row-1");
      await press("saved-runs-delete");
      await press("saved-runs-delete-ok");
      const del1 = await m();
      if (del1.keys.sunsplitter_save_v3 !== null || del1.keys.sunsplitter_save_current_v1 !== null || del1.resumeHidden) fail(`${name}: deleting slot 1: ${JSON.stringify(del1.keys)}, Continue hidden ${del1.resumeHidden}`);
      // Delete slot 3: nothing readable is left, so Continue hides and Begin reads Begin.
      await press("saved-runs-row-3");
      await press("saved-runs-delete");
      await press("saved-runs-delete-ok");
      const del3 = await m();
      if (!del3.resumeHidden || del3.begin !== "Begin" || del3.keys.sunsplitter_tone_ack_v1 !== "1") fail(`${name}: after deleting every slot: Continue hidden ${del3.resumeHidden}, Begin "${del3.begin}", tone ack ${del3.keys.sunsplitter_tone_ack_v1}`);
      if (!same(del3.rows, ["Slot 1 · Empty", "Slot 2 · Empty", "Slot 3 · Empty"])) fail(`${name}: rows after deleting every slot ${JSON.stringify(del3.rows)}`);
      await page.keyboard.press("Escape");
      const closed = await m();
      if (closed.open || closed.focus !== "btn-saved-runs") fail(`${name}: Escape after the deletes: open ${closed.open}, focus ${closed.focus}`);
      summary.push(`${name}: panel ${Math.round(asked.panel.w)}x${Math.round(asked.panel.h)}${asked.panelScrolls ? " (scrolls inside)" : ""}`);
      await context.close();
    }

    // Two pages in one context: A plays slot 1; B deletes it; A is told, writes nothing, and the Menu's Save writes it back.
    {
      const label = "browser, second tab";
      const context = await browser.newContext({ viewport: { width: 360, height: 640 }, reducedMotion: "reduce" });
      await context.addInitScript(() => {
        try {
          if (!localStorage.getItem("sunsplitter_tone_ack_v1")) localStorage.setItem("sunsplitter_tone_ack_v1", "1");
          if (!localStorage.getItem("sunsplitter_tutorial_seen_v1")) localStorage.setItem("sunsplitter_tutorial_seen_v1", "1");
        } catch (e) { /* blocked */ }
      });
      const openPage = async (who, seedValue) => {
        const page = await context.newPage();
        page.on("pageerror", e => pageErrors.push(`${who}: ${String(e.message).slice(0, 160)}`));
        await page.goto(url);
        await page.waitForSelector("#btn-begin", { state: "visible" });
        await page.evaluate(TAB_HELPERS(seedValue));
        return page;
      };
      const A = await openPage("A", 101);
      const B = await openPage("B", 202);
      await A.click("#btn-begin");
      await A.waitForSelector("#commander-create-ok", { state: "visible" });
      await A.click("#commander-create-ok");
      await A.waitForSelector("#cinematic-skip", { state: "visible" });
      await A.click("#cinematic-skip");
      await A.waitForSelector("#game-screen", { state: "visible" });
      for (let i = 0; i < 2; i++) await A.evaluate("__tabStep()");
      await B.locator("#btn-resume").waitFor({ state: "visible", timeout: 5000 }).catch(() => {});
      await B.click("#btn-saved-runs");
      await B.click("#saved-runs-row-1");
      await B.click("#saved-runs-delete");
      await B.click("#saved-runs-delete-ok");
      const bSaw = await B.evaluate(() => document.getElementById("saved-runs-status").textContent);
      expect(bSaw === DELETED(1), `${label}: B's status "${bSaw}"`);
      const toldA = await A.waitForFunction(text => {
        const el = document.getElementById("save-status");
        return !!el && el.textContent === text && el.classList.contains("visible");
      }, NOTICE_DELETED(1), { timeout: 5000 }).then(() => true, () => false);
      expect(toldA, `${label}: A was not told (${await A.evaluate(() => document.getElementById("save-status").textContent)})`);
      // The notice in the bar at the phone sizes.
      for (const [w, h] of [[360, 640], [844, 390], [1440, 900]]) {
        await A.setViewportSize({ width: w, height: h });
        await new Promise(done => setTimeout(done, 200));
        const bar = await A.evaluate(() => {
          const status = document.getElementById("save-status");
          const b = status.getBoundingClientRect();
          return { overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth, clipped: status.scrollWidth > status.clientWidth + 1,
            left: b.left, right: b.right, vw: window.innerWidth };
        });
        expect(bar.overflow <= 0 && !bar.clipped && bar.left >= 0 && bar.right <= bar.vw, `${label} ${w}x${h}: the deleted notice does not fit the bar (${JSON.stringify(bar)})`);
        if (process.env.DELETE_SLOT_SHOTS) await A.screenshot({ path: join(process.env.DELETE_SLOT_SHOTS, `delete-notice-${w}x${h}.png`) });
      }
      await A.setViewportSize({ width: 360, height: 640 });
      await A.evaluate("__tabStep()");
      await A.evaluate(() => window.dispatchEvent(new Event("pagehide")));
      const stillEmpty = await A.evaluate(() => ["sunsplitter_save_v3", "sunsplitter_save_v3_staging", "sunsplitter_save_v3_backup"].every(k => localStorage.getItem(k) === null));
      expect(stillEmpty, `${label}: A's autosave wrote slot 1 back`);
      await A.click("#btn-menu");
      await A.waitForSelector("#menu-sheet", { state: "visible" });
      const chip = await A.evaluate(() => document.getElementById("menu-return-title-chip").textContent);
      expect(chip === CHIP_DELETED(1), `${label}: the Menu's chip reads "${chip}"`);
      await A.click("#menu-save");
      await new Promise(done => setTimeout(done, 200));
      const back = await A.evaluate(() => ({ live: localStorage.getItem("sunsplitter_save_v3"), seen: saveSlotSeen[1], bar: document.getElementById("save-status").textContent }));
      expect(back.live !== null && back.live === back.seen && back.bar === "Saved", `${label}: the Menu's Save did not write the run back (${JSON.stringify({ bar: back.bar, written: back.live !== null })})`);
      const bBack = await B.locator("#btn-resume").waitFor({ state: "visible", timeout: 5000 }).then(() => true, () => false);
      expect(bBack, `${label}: B's title did not offer Continue after A's Save`);
      await context.close();
    }
  } finally {
    await browser.close();
    server.close();
  }
  pageErrors.forEach(message => fail(`page error: ${message}`));
  return { ran: true, summary };
}

const requireBrowser = process.argv.includes("--require-browser");
try { headlessChecks(); } catch (error) { fail(`headless checks threw: ${error && error.stack ? error.stack.split("\n").slice(0, 3).join(" | ") : error}`); }
try { secondTabChecks(); } catch (error) { fail(`second-tab checks threw: ${error && error.stack ? error.stack.split("\n").slice(0, 3).join(" | ") : error}`); }
let browserResult = { ran: false, line: "" };
try { browserResult = await browserChecks(requireBrowser); } catch (error) { fail(`browser checks threw: ${String(error && error.message).split("\n")[0]}`); }

(browserResult.summary || []).forEach(line => console.log(line));
notes.forEach(line => console.log(`NOTE ${line}`));
if (errors.length) {
  errors.slice(0, 80).forEach(message => console.error(`FAIL ${message}`));
  console.error(`FAIL sun-playerflow-delete-slot: ${errors.length} problem(s)`);
  process.exit(1);
}
console.log(`PASS sun-playerflow-delete-slot: ${results.length} groups (${results.join("; ")}); ${browserResult.ran
  ? "Chromium at 360x640, 390x844, 844x390 and 1440x900 plus a two-page delete passed"
  : `browser ${browserResult.line}`}`);
