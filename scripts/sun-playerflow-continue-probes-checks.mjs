#!/usr/bin/env node
import assert from "node:assert/strict";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadGame, simulateRun } from "./simulate.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const guardsOnly = process.argv.includes("--guards-only");
const saveKey = "sunsplitter_save_v3";
function mulberry32(seed) {
  let value = seed >>> 0;
  return () => {
    value += 0x6D2B79F5;
    let next = value;
    next = Math.imul(next ^ (next >>> 15), next | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}
let passed = 0;
let failed = 0;

function check(label, action) {
  try {
    action();
    passed++;
    console.log(`ok ${label}`);
  } catch (error) {
    failed++;
    console.log(`not-ok ${label}: ${error.message}`);
  }
}

function snapshot(runtime) {
  return JSON.parse(runtime.evaluate(`JSON.stringify((() => {
    const saved = snapshotState();
    delete saved.savedAt;
    const scene = scenes[state.scene];
    const list = scene ? (typeof scene.choices === "function" ? scene.choices() : scene.choices || []) : [];
    const choices = list.filter(c =>
      (!c.alive || isAlive(c.alive)) &&
      (!c.aliveAll || c.aliveAll.every(isAlive)) &&
      (!c.aliveAny || c.aliveAny.some(isAlive)) &&
      (!c.requires || meetsRequirements(c.requires)) &&
      (!c.effects || canAffordEffects(c.effects))
    ).map(c => [c.text, c.next]);
    const screens = ["game", "ending", "what-remains"].filter(id =>
      !document.getElementById(id + "-screen").classList.contains("hidden"));
    return { saved, choices, screens };
  })())`));
}

function reload(writer) {
  const reader = loadGame(root, { includeValidator: false });
  // Independent VM/state/DOM; only the single localStorage slot survives.
  reader.context.localStorage = writer.browser.localStorage;
  reader.browser.localStorage = writer.browser.localStorage;
  reader.browser.window.localStorage = writer.browser.localStorage;
  reader.evaluate("showTitleScreen();");
  assert.equal(reader.browser.document.getElementById("btn-resume").classList.contains("hidden"), false);
  assert.equal(reader.evaluate("resumeGame()"), true);
  return reader;
}

const endings = new Set();
for (const [policy, seed] of [["living", 37001], ["future", 37001], ["pragmatic", 37001], ["pragmatic", 37006], ["random", 37001]]) {
  const route = simulateRun(root, { policy, seed });
  assert.equal(route.completed, true, `${policy}/${seed} must complete`);
  const writer = loadGame(root, { includeValidator: false });
  // Lane simulate.mjs seeds the runtime event stream; replay must use the same stream.
  writer.evaluate(`Math.random = (${mulberry32.toString()})(${(seed ^ 0x53554e) >>> 0});`);
  // Lane startGame opens the intro cinematic first; finish it like the player would.
  writer.evaluate("startGame(); if (typeof finishCinematic === \"function\") finishCinematic();");
  let deathBeats = 0;
  for (const [step, choice] of route.choices.entries()) {
    const before = snapshot(writer);
    const deathBeat = /^act3_lethal_(lena|tomas|elias|mira)_end$/.test(before.saved.scene);
    if (deathBeat) {
      deathBeats++;
      if (!guardsOnly) check(`FEATURE ${policy}/${seed} step=${step} ${before.saved.scene}`, () => {
        const restored = snapshot(reload(writer));
        assert.equal(restored.saved.scene, before.saved.scene, "Continue must retain the saved death-aftermath scene");
        assert.deepEqual(restored, before);
      });
    } else if (step % 20 === 1) {
      // Lane keeps the slot empty until the first choice, so start guards after it.
      check(`GUARD ${policy}/${seed} step=${step} playable restore`, () => {
        assert.deepEqual(snapshot(reload(writer)), before);
        assert.deepEqual(before.screens, ["game"]);
        assert.ok(before.choices.length > 0);
      });
    }
    writer.context.__continueChoiceText = choice.text;
    writer.evaluate(`(() => {
      const scene = scenes[state.scene];
      const choices = typeof scene.choices === "function" ? scene.choices() : scene.choices;
      const choice = choices.find(c => c.text === __continueChoiceText);
      if (!choice) throw new Error("Route choice missing at " + state.scene);
      makeChoice(choice);
      // The final choice opens the ending cinematic; wait it out to the ending screen.
      if (typeof currentCinematic !== "undefined" && currentCinematic && currentCinematic.kind === "ending") finishCinematic();
    })()`);
  }
  assert.ok(deathBeats > 0, "Feature route must reach a death aftermath");
  const title = writer.browser.document.getElementById("ending-title").textContent;
  endings.add(title);
  check(`GUARD ${policy}/${seed} completed-run reload and new-run gate`, () => {
    const completed = snapshot(writer);
    assert.deepEqual(completed.screens, ["ending"]);
    assert.equal(completed.choices.length, 0);
    const reader = reload(writer);
    assert.deepEqual(snapshot(reader), completed);
    assert.equal(reader.browser.document.getElementById("ending-title").textContent, title);
    reader.evaluate("showWhatRemains();");
    assert.deepEqual(snapshot(reload(reader)), completed);
    const oldSlot = reader.browser.localStorage.getItem(saveKey);
    reader.browser.window.confirm = () => false;
    reader.evaluate("showTitleScreen(); startGame();");
    assert.equal(reader.browser.localStorage.getItem(saveKey), oldSlot);
    reader.browser.window.confirm = () => true;
    reader.evaluate("startGame(); if (typeof finishCinematic === \"function\") finishCinematic();");
    assert.equal(reader.evaluate("state.scene"), "wake");
    assert.deepEqual(snapshot(reload(reader)), snapshot(reader));
    reader.evaluate("makeChoice(scenes[state.scene].choices[0]);");
    const fresh = snapshot(reader);
    assert.notEqual(fresh.saved.scene, completed.saved.scene);
    assert.deepEqual(snapshot(reload(reader)), fresh);
  });
}
console.log("ENDINGS", JSON.stringify([...endings]));
assert.ok(endings.size >= 3, "Routes must cover at least three distinct endings");
for (const who of ["lena", "tomas", "elias", "mira"]) {
  check(`GUARD ${who} new scene entry still redirects when already dead`, () => {
    const runtime = loadGame(root, { includeValidator: false });
    runtime.context.__deadCrew = who;
    runtime.evaluate("resetRunState(); kill(__deadCrew, 'guard fixture'); showScene('act3_lethal_' + __deadCrew + '_end');");
    assert.notEqual(runtime.evaluate("state.scene"), `act3_lethal_${who}_end`);
  });
}
console.log(`SUMMARY pass=${passed} fail=${failed} endings=${endings.size} mode=${guardsOnly ? "guards" : "all"}`);
process.exitCode = failed ? 1 : 0;
