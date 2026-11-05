// SUN-PLAYERFLOW-COST-02 — refuse unpaid choices atomically, including stale clicks.
import assert from "node:assert/strict";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { loadGame } from "./simulate.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function crisisRuntime(balances = {}) {
  const runtime = loadGame(ROOT);
  assert.equal(runtime.evaluate(`(() => {
    resetRunState();
    Object.assign(state, ${JSON.stringify(balances)});
    showScene("crisis");
    preserveCompletedSlotUntilChoice = true;
    return persistSave({ silent: true });
  })()`), true, "fixture must start with a durable save");
  return runtime;
}

function snapshot(runtime) {
  return runtime.evaluate(`JSON.stringify({
    state,
    saves: [SAVE_KEY, SAVE_KEY_LEGACY, SAVE_STAGING_KEY, SAVE_BACKUP_KEY]
      .map(key => [key, localStorage.getItem(key)]),
    preserveCompletedSlotUntilChoice,
    story: document.getElementById("story").innerHTML,
    choices: gameplayChoiceButtons().map(btn => ({ html: btn.innerHTML, disabled: btn.disabled }))
  })`);
}

export function sunPlayerflowAffordabilityChecks() {
  const cases = [
    { next: "cut_out", balances: { integrity: 0 } },
    { next: "cut_out", balances: { integrity: 13 } },
    { next: "vent", balances: { cohesion: 0 } },
    { next: "vent", balances: { cohesion: 17 } },
    { next: "self_risk", balances: { integrity: 0, supplies: 4 } },
    { next: "self_risk", balances: { integrity: 6, supplies: 4 } },
    { next: "self_risk", balances: { integrity: 7, supplies: 0 } },
    { next: "self_risk", balances: { integrity: 7, supplies: 3 } }
  ];
  for (const { next, balances } of cases) {
    const runtime = crisisRuntime(balances);
    const label = `${next} with ${JSON.stringify(balances)}`;
    assert.equal(runtime.evaluate(`(() => {
      const index = scenes.crisis.choices.findIndex(choice => choice.next === ${JSON.stringify(next)});
      const button = gameplayChoiceButtons()[index];
      return !!button && button.disabled && button.innerHTML.includes("Needs ");
    })()`), true, `${label}: show the unavailable choice with a reason`);
    const before = snapshot(runtime);
    runtime.evaluate(`makeChoice(scenes.crisis.choices.find(choice => choice.next === ${JSON.stringify(next)}))`);
    assert.equal(snapshot(runtime), before, `${label}: refusal must preserve all state, saves and rendered choices`);
  }

  // Keep the real enabled callback, then make one of its two costs unaffordable.
  const stale = crisisRuntime({ integrity: 7, supplies: 4 });
  const staleButton = stale.browser.elements.get("choices").children[2];
  assert.equal(staleButton.disabled, false);
  assert.equal(typeof staleButton.onclick, "function");
  stale.evaluate("state.supplies = 3");
  const beforeClick = snapshot(stale);
  staleButton.onclick();
  assert.equal(snapshot(stale), beforeClick, "stale enabled callback must refuse the whole choice");

  // Positive controls prevent a blanket refusal from satisfying the regression.
  for (const balances of [{ integrity: 7, supplies: 4 }, { integrity: 20, supplies: 12 }]) {
    const runtime = crisisRuntime(balances);
    const result = JSON.parse(runtime.evaluate(`JSON.stringify((() => {
      const choice = scenes.crisis.choices.find(choice => choice.next === "self_risk");
      const before = { integrity: state.integrity, supplies: state.supplies, cohesion: state.cohesion };
      makeChoice(choice);
      return { before, after: state, saved: JSON.parse(localStorage.getItem(SAVE_KEY)), preserveCompletedSlotUntilChoice };
    })())`));
    assert.equal(result.after.integrity, result.before.integrity - 7, "debit hull exactly once");
    assert.equal(result.after.supplies, result.before.supplies - 4, "debit supplies exactly once");
    assert.equal(result.after.cohesion, result.before.cohesion + 8, "apply the paid reward");
    assert.equal(result.after.flags.crisis, "self");
    assert.equal(result.after.scene, "self_risk");
    assert.equal(result.preserveCompletedSlotUntilChoice, false);
    const savedState = Object.fromEntries(Object.keys(result.after).map(key => [key, result.saved[key]]));
    assert.deepEqual(savedState, result.after, "autosave the paid destination");
    runtime.evaluate("makeChoice(scenes.self_risk.choices[0])");
    assert.equal(runtime.evaluate("state.scene"), "aftermath", "free exit must still work");
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  sunPlayerflowAffordabilityChecks();
  console.log("PASS sun-playerflow-affordability (atomic refusals, stale callback, exact/ample payments and free exits)");
}
