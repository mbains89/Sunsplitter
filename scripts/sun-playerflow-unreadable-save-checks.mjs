// SUN-UNREADABLE-SAVE-01 — a save this build cannot read is announced and never overwritten by
// Begin without the new-run confirm. The title still fails closed (no Continue, no Export; 0.32).
import assert from "node:assert/strict";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadGame } from "./simulate.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function probe(mutate) {
  const runtime = loadGame(ROOT);
  return JSON.parse(runtime.evaluate(`JSON.stringify((() => {
    resetRunState();
    showScene("wake");
    const snap = snapshotState();
    ${mutate}
    localStorage.clear();
    localStorage.setItem(SAVE_KEY, raw);
    showScreen("title");
    refreshTitleResumeUI();
    const exp = buildSaveExport();
    const ui = {
      hasSave: hasSave(),
      resumeHidden: document.getElementById("btn-resume").classList.contains("hidden"),
      exportHidden: document.getElementById("btn-export-save").classList.contains("hidden"),
      status: document.getElementById("title-save-status").textContent,
      exportText: exp ? exp.text : null,
      exportName: exp ? exp.filename : null
    };
    const before = localStorage.getItem(SAVE_KEY);
    startGame();
    ui.confirmShown = document.getElementById("new-run-confirm").classList.contains("visible");
    ui.slotUntouched = localStorage.getItem(SAVE_KEY) === before;
    ui.raw = raw;
    return ui;
  })())`));
}

const unknownScene = probe(`snap.scene = "scene_removed_in_future_build"; const raw = JSON.stringify(snap);`);
assert.equal(unknownScene.hasSave, false);
assert.equal(unknownScene.resumeHidden, true, "Continue must stay hidden for an unloadable save");
assert.match(unknownScene.status, /can't be read/, "title must say the save cannot be read");
assert.equal(unknownScene.exportHidden, true, "0.32 fail-closed: no Export for an unloadable save");
assert.equal(unknownScene.confirmShown, true, "Begin must ask before replacing unreadable bytes");
assert.equal(unknownScene.slotUntouched, true, "Begin must not overwrite before confirm");

const corrupt = probe(`const raw = "{not json";`);
assert.match(corrupt.status, /can't be read/);
assert.equal(corrupt.confirmShown, true);
assert.equal(corrupt.slotUntouched, true);

const valid = probe(`const raw = JSON.stringify(snap);`);
assert.equal(valid.hasSave, true);
assert.doesNotMatch(valid.status, /can't be read/, "a readable save must not show the warning");
assert.equal(valid.resumeHidden, false);

console.log("PASS sun-playerflow-unreadable-save: unreadable slot announced, title fails closed, confirm before overwrite");
