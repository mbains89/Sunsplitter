// SUN-AMARA-WALKIN-GATE-01 — Hex 2026-11-05 §5/§7C. "Ask them to stop" sent the player back to
// intimacy_window, where the Amara–Tomas walk-in was still offered (that offer checked only the
// shared night and hydro), and act3_spine_next re-offered it too (it closed on privacy_left but not
// on interrupted). Random play interrupted the same couple up to three times in a run, at −3 cohesion
// a pass. Both offers now close on the shared night, privacy left, or interrupted; first entry stays.
import assert from "node:assert/strict";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadGame } from "./simulate.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const runtime = loadGame(ROOT);
const rows = JSON.parse(runtime.evaluate(`JSON.stringify((() => {
  persistSave = () => true;
  const WALK = "Walk in on Amara and Tomas";
  const offered = id => {
    const sc = scenes[id];
    const list = (typeof sc.choices === "function" ? sc.choices() : sc.choices) || [];
    return list.some(c => c.text.startsWith(WALK));
  };
  const setup = () => {
    resetRunState();
    state.recovered.tomas = true; state.recovered.jiro = true; state.recovered.vess = true;
    state.flags.hydro = "full"; state.cohesion = 50; state.integrity = 60; state.supplies = 40;
  };
  const out = [];
  for (const answer of ["first", "stop", "privacy", "stay"]) {
    setup();
    const firstWindow = offered("intimacy_window"), firstSpine = offered("act3_spine_next");
    if (answer !== "first") {
      showScene("romance_amara_tomas");
      const sc = scenes.romance_amara_tomas;
      const list = (typeof sc.choices === "function" ? sc.choices() : sc.choices) || [];
      const pick = answer === "stop" ? list.find(c => c.text.startsWith("Ask them to stop"))
        : answer === "privacy" ? list.find(c => c.text.startsWith("Leave them the privacy"))
        : list.find(c => c.next !== "intimacy_window" && !c.text.startsWith("Leave them the privacy") && !c.text.startsWith("Ask them to stop"));
      if (!pick) { out.push({ answer, missing: true }); continue; }
      makeChoice(pick);
    }
    out.push({ answer, firstWindow, firstSpine, window: offered("intimacy_window"), spine: offered("act3_spine_next"),
      romance: !!state.romance.amara_tomas, cohesion: state.cohesion });
  }
  return out;
})())`));

for (const row of rows) assert.ok(!row.missing, `romance_amara_tomas has no "${row.answer}" option to exercise`);
const first = rows.find(r => r.answer === "first");
assert.ok(first.window && first.spine, "first entry: the walk-in must still be offered at intimacy_window and act3_spine_next");
for (const answer of ["stop", "privacy", "stay"]) {
  const row = rows.find(r => r.answer === answer);
  assert.ok(!row.window, `${answer}: walk-in re-offered at intimacy_window`);
  assert.ok(!row.spine, `${answer}: walk-in re-offered at act3_spine_next`);
}
console.log(`PASS sun-playerflow-amara-walkin-gate: offered on first entry; closed at both offers after ${rows.filter(r => r.answer !== "first").map(r => r.answer).join(", ")}`);
