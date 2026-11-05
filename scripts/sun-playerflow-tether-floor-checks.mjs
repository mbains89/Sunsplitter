// SUN-TETHER-FLOOR-01 — act2_tether_sighting always renders an enabled exit.
import assert from "node:assert/strict";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadGame } from "./simulate.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const runtime = loadGame(ROOT);
const probe = balances => JSON.parse(runtime.evaluate(`JSON.stringify((() => {
  resetRunState();
  Object.assign(state, ${JSON.stringify(balances)});
  showScene("act2_tether_sighting");
  const list = scenes.act2_tether_sighting.choices;
  const enabled = list.filter(c => (!c.requires || meetsRequirements(c.requires)) && (!c.effects || canAffordEffects(c.effects)));
  return { total: list.length, enabled: enabled.map(c => c.text), freeFloor: list.some(c => !c.effects) };
})())`));

const normal = probe({ integrity: 40, supplies: 30 });
assert.equal(normal.total, 2, "floor must not show while a paid route is affordable");
assert.equal(normal.freeFloor, false);

for (const balances of [{ integrity: 1, supplies: 5 }, { integrity: 0, supplies: 0 }, { integrity: 1, supplies: 0 }]) {
  const broke = probe(balances);
  assert.ok(broke.enabled.length >= 1, `zero enabled exits at ${JSON.stringify(balances)}`);
  assert.equal(broke.freeFloor, true, `no free floor at ${JSON.stringify(balances)}`);
}

const onePaid = probe({ integrity: 1, supplies: 6 });
assert.equal(onePaid.total, 2, "floor must not show while vent is affordable");

console.log("PASS sun-playerflow-tether-floor: floor appears only when both paid routes are unaffordable");
