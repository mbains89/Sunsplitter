import assert from "node:assert/strict";
import { createStressRuntime, runSeed } from "./runtime.mjs";
import { resourceFailures, paymentFailures, speechFailures, endingFailures, saveFailures } from "./checks.mjs";

export function selfChecks(root) {
  let count = 0;
  const check = (actual, expected) => { assert.equal(actual, expected); count++; };
  check(resourceFailures({ survivors: 1, integrity: 0, cohesion: -1, supplies: 0, embryos: 0 }).length, 1);
  check(paymentFailures({ before: { supplies: 2 }, after: { supplies: 0 }, changes: { supplies: -5 } }).length, 2);
  check(paymentFailures({ before: { supplies: 5 }, after: { supplies: 0 }, changes: { supplies: -5 } }).length, 0);
  check(speechFailures('Lena says, "Keep moving."', [{ key: "lena", name: "Lena" }]).length, 1);
  check(speechFailures('You remember when Lena says the words.\nThe dead still have names: Lena.', [{ key: "lena", name: "Lena" }]).length, 0);
  check(endingFailures({ flags: { final: "comfort" }, ideology: {} }, { title: "Landfall", text: "The course remains locked." }, ["The recorded orders remained split between Future and Living."]).length, 3);
  check(saveFailures({ supplies: 4 }, { supplies: 3 }, true).length, 1);
  check(saveFailures({}, {}, false).length, 1);

  const fixture = (source, rule, maxSteps = 6) => {
    const runtime = createStressRuntime(root), saved = createStressRuntime(root);
    runtime.evaluate(source);
    const result = runSeed(runtime, saved, { seed: 1, maxSteps, saveEvery: 0 });
    assert.ok(result.failures.some(f => f.rule === rule), `${rule}: ${JSON.stringify(result.failures)}`); count++;
  };
  fixture(`scenes.wake = { text: "Fixture", choices: [] };`, "no_enabled_choice");
  fixture(`scenes.wake = { onEnter() { state.supplies = -1; }, text: "Fixture", choices: [] };`, "negative_or_invalid_resource");
  fixture(`scenes.wake = { onEnter() { kill("lena", "synthetic detector fixture"); }, text: 'Lena says, "Fixture."', choices: [] };`, "absent_crew_active_attribution");
  fixture(`scenes.wake = { text: "Fixture", choices: [{ text: "Loop", next: "wake" }] };`, "step_limit");
  fixture(`scenes.wake = { text: "Fixture", choices: [{ text: "Loop", next: "wake" }] };`, "repeated_identical_state", 20);
  fixture(`scenes.wake = { text: "Fixture", choices: [{ text: "Missing", next: "__missing_fixture" }] };`, "missing_scene");
  fixture(`scenes.wake = { text: "Fixture", choices: [{ text: "Throw", next: "__throw_fixture" }] }; scenes.__throw_fixture = { onEnter() { throw new Error("synthetic failure"); } };`, "runtime_exception");
  fixture(`canAffordEffects = () => true; scenes.wake = { onEnter() { state.supplies = 1; }, text: "Fixture", choices: [{ text: "Unpaid", next: "wake", effects: { supplies: -2 } }] };`, "enabled_unaffordable_choice");
  fixture(`canAffordEffects = () => true; scenes.wake = { onEnter() { state.supplies = 1; }, text: "Fixture", choices: [{ text: "Unpaid", next: "wake", effects: { supplies: -2 } }] };`, "cost_not_fully_debited");
  fixture(`updateStats = () => {}; scenes.wake = { text: "Fixture", choices: [{ text: "Dropped debit", next: "wake", effects: { supplies: -2 } }] };`, "advertised_cost_not_paid");
  fixture(`const pay = updateStats; updateStats = changes => { pay(changes); pay(changes); }; scenes.wake = { text: "Fixture", choices: [{ text: "Duplicate debit", next: "wake", effects: { supplies: -2 } }] };`, "advertised_cost_not_paid");
  const a = createStressRuntime(root), b = createStressRuntime(root);
  const options = { seed: 1, maxSteps: 600, saveEvery: 20 };
  const first = runSeed(a, b, options), second = runSeed(a, b, options);
  assert.deepEqual(first, second); count++;
  check(first.completed, true);
  assert.ok(first.saveProbes > 0); count++;
  return count;
}
