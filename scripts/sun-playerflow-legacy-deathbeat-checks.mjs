// SUN-LEGACY-DEATHBEAT-01 — a resume that re-runs onEnter (v2 save, or a v3 snapshot without
// sceneEntered) lands on the death beat it was saved on, with state unchanged.
import assert from "node:assert/strict";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadGame } from "./simulate.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const runtime = loadGame(ROOT);
const CASES = {
  act3_lethal_lena_end: `state.dying.lena = "kept working until the clock ran out";`,
  act3_lethal_tomas_end: `state.recovered.tomas = true;`,
  act3_lethal_elias_end: ``,
  act3_lethal_mira_end: ``
};
for (const [id, setup] of Object.entries(CASES)) {
  const row = JSON.parse(runtime.evaluate(`JSON.stringify((() => {
    resetRunState();
    state.recovered.tomas = state.recovered.jiro = state.recovered.vess = true;
    ${setup}
    showScene(${JSON.stringify(id)});
    const firstScene = state.scene;
    const saved = snapshotState();
    saved.sceneEntered = false;
    const before = JSON.stringify(saved);
    applySnapshot(JSON.parse(before));
    showScene(state.scene, { skipOnEnter: false, resume: true });
    const after = snapshotState();
    const a = JSON.parse(before); delete a.savedAt; delete a.sceneEntered;
    const b = JSON.parse(JSON.stringify(after)); delete b.savedAt; delete b.sceneEntered;
    return { firstScene, resumedScene: state.scene, same: JSON.stringify(a) === JSON.stringify(b),
      dead: state.dead.slice(), story: document.getElementById("story").innerHTML.slice(0, 60) };
  })())`));
  assert.equal(row.firstScene, id, `${id}: fixture did not enter the death beat (went to ${row.firstScene})`);
  assert.equal(row.resumedScene, id, `${id}: legacy resume redirected past the death beat to ${row.resumedScene}`);
  assert.ok(row.same, `${id}: legacy resume changed saved state`);
}
console.log(`PASS sun-playerflow-legacy-deathbeat: ${Object.keys(CASES).length} death beats survive a legacy resume unchanged`);
