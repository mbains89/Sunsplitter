// SUN-UNREADABLE-SAVE-01 — a save this build cannot read is announced and never overwritten by
// Begin without the new-run confirm. The title still fails closed (no Continue, no Export; 0.32).
// SUN-UNREADABLE-EXPORT-01 (Manraj 2026-11-05): the raw bytes can be downloaded from their own button.
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
    const rawExp = buildUnreadableSaveExport();
    const ui = {
      hasSave: hasSave(),
      resumeHidden: document.getElementById("btn-resume").classList.contains("hidden"),
      exportHidden: document.getElementById("btn-export-save").classList.contains("hidden"),
      status: document.getElementById("title-save-status").textContent,
      exportText: exp ? exp.text : null,
      exportName: exp ? exp.filename : null,
      unreadableShown: !document.getElementById("btn-export-unreadable").classList.contains("hidden"),
      unreadableText: rawExp ? rawExp.text : null,
      unreadableName: rawExp ? rawExp.filename : null
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
assert.equal(unknownScene.unreadableShown, true, "unreadable save must offer its own download");
assert.equal(unknownScene.unreadableText, unknownScene.raw, "unreadable download must be the exact stored bytes");
assert.match(unknownScene.unreadableName, /^sunsplitter-unreadable-save-\d{4}-\d{2}-\d{2}\.json$/);
assert.equal(unknownScene.slotUntouched, true, "Begin must not overwrite before confirm");

const corrupt = probe(`const raw = "{not json";`);
assert.match(corrupt.status, /can't be read/);
assert.equal(corrupt.confirmShown, true);
assert.equal(corrupt.slotUntouched, true);
assert.equal(corrupt.unreadableShown, true, "corrupt bytes must offer their own download");
assert.equal(corrupt.unreadableText, "{not json", "corrupt download must be the exact stored bytes");

const valid = probe(`const raw = JSON.stringify(snap);`);
assert.equal(valid.hasSave, true);
assert.doesNotMatch(valid.status, /can't be read/, "a readable save must not show the warning");
assert.equal(valid.resumeHidden, false);
assert.equal(valid.unreadableShown, false, "a readable save must not offer the unreadable download");
assert.equal(valid.unreadableText, null);

console.log("PASS sun-playerflow-unreadable-save: unreadable slot announced and downloadable byte-for-byte, Continue/Export stay closed, confirm before overwrite");
