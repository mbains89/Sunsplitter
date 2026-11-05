// SUN-CODEX-001 — a migrated run keeps its compatibility rules across refreshes.
import assert from "node:assert/strict";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadGame } from "./simulate.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const saveKey = "sunsplitter_save_v3";
const legacyKey = "sunsplitter_save_v2";
const prevention = "It will not become a problem. Handle prevention.";
let passed = 0;
let failed = 0;

function check(label, action) {
  try {
    action();
    passed++;
    console.log(`ok ${label}`);
  } catch (error) {
    failed++;
    console.error(`not-ok ${label}: ${error.message}`);
  }
}

// Schema-compatible fixture, not an asserted historical player save.
const fixtureRuntime = loadGame(root, { includeValidator: false });
const legacyRaw = fixtureRuntime.evaluate(`JSON.stringify({
  ...freshState(), v: 2, gameVersion: "0.24", scene: "pregnancy_check",
  romance: { lena: true }, recovered: { tomas: false, jiro: false, vess: true }
})`);

function resume(raw, key = saveKey) {
  // Independent VM/state/DOM; only durable save bytes cross the refresh.
  const runtime = loadGame(root, { includeValidator: false });
  runtime.context.__saveRaw = raw;
  assert.equal(runtime.evaluate("validImportedSnapshot(JSON.parse(__saveRaw))"), true);
  runtime.browser.localStorage.setItem(key, raw);
  assert.equal(runtime.evaluate("resumeGame()"), true);
  return runtime;
}

function takePrevention(runtime) {
  assert.equal(runtime.evaluate("state.scene"), "pregnancy_check");
  runtime.context.__prevention = prevention;
  return runtime.evaluate(`(() => {
    const choice = scenes[state.scene].choices.find(c => c.text === __prevention);
    if (!choice || !canAffordEffects(choice.effects)) throw new Error("Prevention choice unavailable");
    makeChoice(choice);
    return state.scene;
  })()`);
}

check("v2 prevention route is unchanged after refresh", () => {
  const writer = resume(legacyRaw, legacyKey);
  assert.equal(writer.evaluate("loadedGameVersion"), "0.24");
  const migratedRaw = writer.browser.localStorage.getItem(saveKey);
  const immediate = takePrevention(writer);
  assert.equal(immediate, "act3_crisis_declare");
  const reader = resume(migratedRaw);
  const refreshed = takePrevention(reader);
  console.log(`TRACE immediate=${immediate} refreshed=${refreshed} durableGameVersion=${JSON.parse(migratedRaw).gameVersion}`);
  assert.equal(refreshed, immediate, "Refresh must preserve the pre-0.25 lethal exclusion");
  assert.equal(reader.evaluate("scenes.act3_lethal_mira_board.onEnter()"), "faction_split");
});

check("v2 migration records the entry marker and original compatibility version", () => {
  const writer = resume(legacyRaw, legacyKey);
  const migrated = JSON.parse(writer.browser.localStorage.getItem(saveKey));
  assert.equal(migrated.v, 3);
  assert.equal(migrated.sceneEntered, true);
  assert.equal(migrated.gameVersion, "0.24");
  assert.equal(resume(JSON.stringify(migrated)).evaluate("loadedGameVersion"), "0.24");
});

for (const kind of ["manual", "choice", "pagehide"]) {
  check(`${kind} save retains compatibility on another Continue`, () => {
    // An already-entered v3 save must retain its version on later writes too.
    const current = { ...JSON.parse(legacyRaw), v: 3, sceneEntered: true };
    const writer = resume(JSON.stringify(current));
    if (kind === "manual") assert.equal(writer.evaluate("saveGame()"), true);
    else if (kind === "choice") takePrevention(writer);
    else writer.browser.window.dispatchEvent({ type: "pagehide" });
    const raw = writer.browser.localStorage.getItem(saveKey);
    assert.equal(JSON.parse(raw).gameVersion, "0.24");
    const reader = resume(raw);
    assert.equal(reader.evaluate("loadedGameVersion"), "0.24");
    assert.equal(reader.evaluate("scenes.act3_lethal_elias_order.onEnter()"), "faction_split");
    assert.equal(reader.evaluate("scenes.act3_lethal_mira_board.onEnter()"), "faction_split");
  });
}

check("0.25 runs still enter the Elias encounter after refresh", () => {
  const raw = JSON.stringify({ ...JSON.parse(legacyRaw), gameVersion: "0.25" });
  const writer = resume(raw, legacyKey);
  const reader = resume(writer.browser.localStorage.getItem(saveKey));
  assert.equal(takePrevention(writer), "act3_lethal_elias_order");
  assert.equal(takePrevention(reader), "act3_lethal_elias_order");
  assert.equal(reader.evaluate("scenes.act3_lethal_mira_board.onEnter()"), undefined);
});

check("new run resets the compatibility version to the current runtime", () => {
  const runtime = resume(legacyRaw, legacyKey);
  assert.equal(runtime.evaluate("startGame()"), true);
  runtime.evaluate("finishCinematic()");
  const currentVersion = runtime.evaluate("VERSION");
  assert.equal(runtime.evaluate("loadedGameVersion"), currentVersion);
  assert.equal(JSON.parse(runtime.browser.localStorage.getItem(saveKey)).gameVersion, currentVersion);
  assert.equal(runtime.evaluate("scenes.act3_lethal_elias_order.onEnter()"), undefined);
  assert.equal(runtime.evaluate("scenes.act3_lethal_mira_board.onEnter()"), undefined);
});

console.log(`SUMMARY SUN-CODEX-001 pass=${passed} fail=${failed} total=${passed + failed}`);
process.exitCode = failed ? 1 : 0;
