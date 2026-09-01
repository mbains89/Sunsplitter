#!/usr/bin/env node

// Release-gate ownership:
// - Manifest + syntax: exact browser load order and parseability.
// - Runtime + validator: one-time registration, 222-scene count, and scene-ID digest.
// - Policy simulations: Living, Future, and pragmatic routes reach truthful endings.
// - V6 fixtures: Amara and Sela stay "made" when they die before an authored test,
//   and their untested promises are omitted from ending reflection.
// - What Remains fixtures: 3–6 current-run facts, significance order, exact causes,
//   tested-promise selection, relational tense, and separate-surface rendering.

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import {
  EXPECTED_SCENE_COUNT,
  POLICY_NAMES,
  assertV6,
  loadGame,
  readScriptManifest,
  runPolicySet,
  sceneIdDigest,
  simulationAssertions
} from "./simulate.mjs";
import { offshiftDefensiveGuardChecks } from "./l026-offshift-guards.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE_MAIN_SHA = "8d23109b63b844e0703fb36643f14b91b8800c90";
const SOURCE_MAIN_TREE = "a6b96e0907de586f6cdd31cf15db09bc1341ddaf";
const REQUIRED_SRC_TREE = "992f7c57e18709acc08c8ee3cddcfdea816a6acf";
const AUDITED_RECOVERY_BASE_SHA = "e4f84409759760d31fcf47b8a227802a61421f51";
const EXPECTED_SCRIPTS = [
  "src/state.js",
  ...Array.from({ length: 55 }, (_, index) => `src/scenes-${String(index + 1).padStart(2, "0")}.js`),
  "src/engine.js",
  "src/validate.js"
];

// Digest of the sorted scene IDs produced by executing the 55 numbered modules.
// Update only when an authorized scene-manifest change intentionally adds/removes/renames a scene.
const EXPECTED_SCENE_IDS_SHA256 = "df38e92826aeb58f7d945c7c0f22c1b41e0bfdfc50a1cdb8232f46d5601350ec";

function sameArray(left, right) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function syntaxChecks(scripts) {
  const errors = [];
  for (const relativePath of scripts) {
    const source = readFileSync(resolve(ROOT, relativePath), "utf8");
    try {
      new vm.Script(source, { filename: relativePath });
    } catch (error) {
      errors.push(`${relativePath}: ${error.message}`);
    }
  }
  return errors;
}

function manifestChecks(scripts) {
  const errors = [];
  const duplicates = scripts.filter((script, index) => scripts.indexOf(script) !== index);
  if (duplicates.length) errors.push(`duplicate script entries: ${[...new Set(duplicates)].join(", ")}`);
  if (!sameArray(scripts, EXPECTED_SCRIPTS)) {
    errors.push(`index script manifest mismatch\n  expected: ${EXPECTED_SCRIPTS.join(", ")}\n  actual:   ${scripts.join(", ")}`);
  }
  return errors;
}

function retiredRuntimeFlagChecks(scripts) {
  const errors = [];
  const runtimeSource = scripts
    .map(relativePath => readFileSync(resolve(ROOT, relativePath), "utf8"))
    .join("\n");
  if (/\bpair_turn\b/.test(runtimeSource)) {
    errors.push("L-023 retired pair_turn is still present in runtime source");
  }
  return errors;
}

function versionSurfaceChecks() {
  const errors = [];
  const versionFile = readFileSync(resolve(ROOT, "VERSION.md"), "utf8").trim().split(/\r?\n/, 1)[0];
  const stateSource = readFileSync(resolve(ROOT, "src/state.js"), "utf8");
  const indexSource = readFileSync(resolve(ROOT, "index.html"), "utf8");
  const stateMatch = stateSource.match(/const\s+VERSION\s*=\s*["']([^"']+)["']/);
  const subtitleMatch = indexSource.match(/id=["']game-subtitle["'][^>]*>v([^<]+)</);
  if (!/^\d+\.\d+(?:\.\d+)?(?:[-.][0-9A-Za-z.-]+)?$/.test(versionFile)) errors.push(`VERSION.md=${versionFile}; malformed version`);
  if (stateMatch?.[1] !== versionFile) errors.push(`src/state.js VERSION=${stateMatch?.[1] || "missing"}; expected ${versionFile}`);
  if (subtitleMatch?.[1] !== versionFile) errors.push(`index subtitle=${subtitleMatch?.[1] || "missing"}; expected ${versionFile}`);
  for (const requiredId of ["what-remains-screen", "what-remains-image", "what-remains-text"]) {
    if (!indexSource.includes(`id="${requiredId}"`)) errors.push(`index missing ${requiredId}`);
  }
  return errors;
}

function desktopCompositionChecks() {
  const errors = [];
  const cssSource = readFileSync(resolve(ROOT, "css/style.css"), "utf8");
  const requiredRules = [
    ["@media (min-width: 1024px) and (min-height: 640px)", "widescreen breakpoint"],
    ["grid-template-columns: minmax(320px, 0.85fr) minmax(0, 1.15fr)", "two-column app grid"],
    ["#scene-image-wrap.visible + #main", "image-present prose selector"],
    ["grid-column: 2", "prose placement beside scene art"],
    ["width: min(calc(100% - 32px), 48dvh, 430px)", "portrait plate desktop sizing"],
    ["max-width: 68ch", "desktop prose line-length cap"],
    ["font-size: 1.08rem", "desktop prose type scale"]
  ];
  for (const [rule, label] of requiredRules) {
    if (!cssSource.includes(rule)) errors.push(`0.32 desktop composition missing ${label}`);
  }
  return errors;
}

function registrationChecks(runtime) {
  const errors = [];
  const counts = new Map();
  for (const event of runtime.registrations) counts.set(event.id, (counts.get(event.id) || 0) + 1);
  const nonOnce = [...counts.entries()].filter(([, count]) => count !== 1);
  if (nonOnce.length) errors.push(`scenes not registered exactly once: ${nonOnce.map(([id, count]) => `${id}=${count}`).join(", ")}`);
  if (runtime.registrations.length !== runtime.sceneIds.length) {
    errors.push(`registration event count ${runtime.registrations.length} != registered scene count ${runtime.sceneIds.length}`);
  }
  if (runtime.sceneIds.length !== EXPECTED_SCENE_COUNT) {
    errors.push(`scene count ${runtime.sceneIds.length} != expected ${EXPECTED_SCENE_COUNT}`);
  }
  const digest = sceneIdDigest(runtime.sceneIds);
  if (digest !== EXPECTED_SCENE_IDS_SHA256) {
    errors.push(`executed scene-ID manifest digest ${digest} != expected ${EXPECTED_SCENE_IDS_SHA256}`);
  }
  const sceneFiles = EXPECTED_SCRIPTS.filter(path => /src\/scenes-\d{2}\.js$/.test(path));
  const filesThatRegistered = new Set(runtime.registrations.map(event => event.file));
  const emptyModules = sceneFiles.filter(path => !filesThatRegistered.has(path));
  if (emptyModules.length) errors.push(`scene modules registered no scenes: ${emptyModules.join(", ")}`);
  return { errors, digest };
}

function validatorChecks(runtime) {
  const errors = [];
  const result = runtime.evaluate("window.validateSunsplitter()");
  if (!result || typeof result !== "object") errors.push("validator returned no result");
  else if (result.errors?.length) errors.push(...result.errors.map(error => `validator: ${error}`));
  if (result && result.count !== EXPECTED_SCENE_COUNT) {
    errors.push(`validator count ${result.count} != expected ${EXPECTED_SCENE_COUNT}`);
  }
  const vessGateWarnings = runtime.evaluate(`(() => {
    const original = scenes.intimacy_window;
    scenes.intimacy_window = {
      get text() { return original.text; },
      get choices() {
        if ((state.affinity.vess || 0) >= 99 || (state.trust.vess || 0) >= 99) return original.choices;
        return original.choices;
      }
    };
    const injected = window.validateSunsplitter();
    scenes.intimacy_window = original;
    return injected.warnings.filter(warning => warning.startsWith("romance: intimacy_window"));
  })()`);
  for (const expected of ["numeric affinity gates", "numeric trust gates"]) {
    if (!vessGateWarnings.some(warning => warning.includes(expected))) {
      errors.push(`validator missed injected Vess ${expected}`);
    }
  }
  return { errors, result };
}

function whatRemainsChecks(runtime) {
  const errors = [];
  const fixture = runtime.evaluate(`(() => {
    resetRunState();
    state.ideology.future = 12;
    state.flags.vault_sacrifice = "future";
    state.crisisPath = "custody";
    state.flags.custody_answer = "severed";
    kill("rourke", "died with company");
    state.promises.amara = "made";
    state.promises.mira = "kept";
    state.romance.mira = true;
    const facts = whatRemainsFacts();
    resolveEnding();
    const endingText = document.getElementById("ending-text").textContent;
    showWhatRemains();
    return {
      facts,
      endingText,
      surfaceText: document.getElementById("what-remains-text").textContent,
      surfaceVisible: !document.getElementById("what-remains-screen").classList.contains("hidden"),
      endingHidden: document.getElementById("ending-screen").classList.contains("hidden")
    };
  })()`);
  const facts = [...fixture.facts];
  if (facts.length !== 5) errors.push(`primary fixture returned ${facts.length} facts, expected 5`);
  const expected = [
    "Across the recorded orders, Future carried more weight.",
    "Rourke died with company.",
    "At the vault fault, the restart package was kept and habitation paid the cost; Custody of Tomorrow ended with Mira severing the fused junction and carrying the cold-radiation injury.",
    "The Earth-era directive binding was refused; authority stayed with the living.",
    "A private line was crossed with Mira; she was alive when the run ended."
  ];
  expected.forEach((line, index) => {
    if (facts[index] !== line) errors.push(`primary fixture fact[${index}] mismatch: ${JSON.stringify(facts[index])}`);
  });
  if (facts.some(line => /could have|should have|you failed|completion|%/i.test(line))) {
    errors.push("primary fixture contains prohibited counterfactual/evaluative language");
  }
  if (facts.some(line => /service-pocket test/i.test(line))) {
    errors.push("primary fixture surfaced Amara's untested made promise");
  }
  if (fixture.endingText.includes(expected[0])) errors.push("What Remains fact still injected into ending prose");
  if (fixture.surfaceText !== facts.join("\n\n")) errors.push("separate What Remains surface text does not match selector output");
  if (!fixture.surfaceVisible || !fixture.endingHidden) errors.push("What Remains did not render as a separate screen");

  const deathCases = [
    ["rourke", "died with company", "Rourke died with company"],
    ["rourke", "ordered to stop treatment", "Rourke died after treatment was ordered stopped"],
    ["rourke", "attempted rescue, still died", "Rourke died during the attempted rescue"],
    ["rourke", "died in silence while orders waited", "Rourke died in silence while orders waited"],
    ["rourke", "died while command was taken", "Rourke died while command was taken"],
    ["amara", "vented with the lower ring", "Amara died when the lower ring was vented"],
    ["sela", "vented at twenty", "Sela died when the lower ring vented at twenty"],
    ["lena", "resources diverted to the vault", "Lena died after medical power was diverted to the vault"],
    ["lena", "kept working until the clock ran out", "Lena died after working until her clock ran out"],
    ["tomas", "refused the order and paid for it", "Tomas died after refusing the order"],
    ["tomas", "went back for the living and did not return", "Tomas went back for the living and did not return"],
    ["elias", "held the line", "Elias died holding the line"],
    ["mira", "would not leave the board", "Mira died after refusing to leave the board"],
    ["mira", "finished the repair", "Mira finished the repair and died"],
    ["jiro", "lost the shared medical line to Lena", "Jiro died when the shared medical line moved to Lena"],
    ["jiro", "vented breathing in the service pocket", "Jiro died breathing when the service pocket was vented"]
  ];
  for (const [key, cause, line] of deathCases) {
    const actual = runtime.evaluate(`whatRemainsDeathClause(${JSON.stringify(key)}, ${JSON.stringify(cause)})`);
    if (actual !== line) errors.push(`death copy mismatch for ${key}/${cause}: ${JSON.stringify(actual)}`);
  }

  const six = runtime.evaluate(`(() => {
    resetRunState();
    state.flags.vault_sacrifice = "living";
    state.crisisPath = "breath";
    state.flags.breath_answer = "garden";
    kill("rourke", "died with company");
    kill("lena", "kept working until the clock ran out");
    kill("elias", "held the line");
    kill("mira", "vented breathing in the service pocket");
    state.promises.amara = "broken";
    state.promises.tomas = "kept";
    state.romance.sela = true;
    return whatRemainsFacts();
  })()`);
  if (six.length !== 6) errors.push(`six-line fixture returned ${six.length} facts, expected 6`);
  if (!six[1]?.includes("Rourke died with company") || !six[2]?.includes("Mira died breathing")) {
    errors.push("six-line fixture did not preserve all deaths across two ordered lines");
  }
  if (six[4] !== "At the service-pocket test, the pocket was vented while the reader was still breathing.") {
    errors.push("death-causing promise did not win the promise slot");
  }

  const tomasCrisisGate = runtime.evaluate(`(() => {
    resetRunState();
    state.promises.tomas = "kept";
    state.crisisPath = "breath";
    state.flags.breath_answer = "garden";
    const breathFacts = whatRemainsFacts();
    const afterBreath = state.promises.tomas;

    resetRunState();
    state.promises.tomas = "kept";
    state.crisisPath = "custody";
    state.flags.custody_answer = "shared";
    const custodyFacts = whatRemainsFacts();
    const afterCustody = state.promises.tomas;
    return { breathFacts, custodyFacts, afterBreath, afterCustody };
  })()`);
  if (tomasCrisisGate.breathFacts.some(line => /custody test/i.test(line))) {
    errors.push("Tomas custody-test reflection surfaced on the Breath crisis path");
  }
  if (!tomasCrisisGate.custodyFacts.includes("At the custody test, the living received the shared mercy promised to Tomas.")) {
    errors.push("Tomas kept-promise reflection missing on the Custody crisis path");
  }
  if (tomasCrisisGate.afterBreath !== "kept" || tomasCrisisGate.afterCustody !== "kept") {
    errors.push("What Remains Tomas path gate mutated promise lifecycle state");
  }

  const survival = runtime.evaluate(`(() => {
    resetRunState();
    state.flags.vault_sacrifice = "split";
    state.crisisPath = "breath";
    state.flags.breath_answer = "racks";
    kill("rourke", "died in silence while orders waited");
    return whatRemainsFacts();
  })()`);
  if (survival.length !== 3) errors.push(`full-survival-after-Rourke fixture returned ${survival.length} facts, expected 3`);
  if (survival.filter(line => / died|did not return/.test(line)).length !== 1) {
    errors.push("full-survival-after-Rourke fixture invented an additional death");
  }

  const mixed = runtime.evaluate(`(() => {
    resetRunState();
    state.flags.vault_sacrifice = "split";
    state.crisisPath = "custody";
    state.flags.custody_answer = "thawed";
    kill("rourke", "died with company");
    state.romance.lena = true;
    state.romance.mira = true;
    kill("mira", "finished the repair");
    return whatRemainsFacts();
  })()`);
  const mixedRelational = mixed[mixed.length - 1];
  if (mixedRelational !== "Private lines were crossed with Lena and Mira; Lena was alive at the ending, and Mira had died.") {
    errors.push(`mixed relational tense mismatch: ${JSON.stringify(mixedRelational)}`);
  }

  return errors;
}

function tomasDeadHolderPromiseChecks(runtime) {
  const errors = [];
  const fixture = runtime.evaluate(`(() => {
    const run = (answer, alive) => {
      resetRunState();
      state.recovered.tomas = true;
      state.crisisPath = "custody";
      state.flags.custody_answer = answer;
      state.flags.custody_roll = true;
      state.promises.tomas = "made";
      if (!alive) kill("tomas", "legacy death before the custody test");
      const memoriesBefore = state.memories.length;
      showScene("custody_after");
      return {
        promise: state.promises.tomas,
        addedMemories: state.memories.slice(memoriesBefore),
        text: document.getElementById("story").textContent,
        facts: whatRemainsFacts()
      };
    };
    return {
      deadPossession: run("possession", false),
      deadShared: run("shared", false),
      livingPossession: run("possession", true),
      livingShared: run("shared", true)
    };
  })()`);

  for (const [label, result] of [["possession", fixture.deadPossession], ["shared", fixture.deadShared]]) {
    if (result.promise !== "made") errors.push(`dead Tomas ${label} path invented promise result ${result.promise}`);
    if (result.addedMemories.length) errors.push(`dead Tomas ${label} path invented promise memory`);
    if (/Tomas reads|Tomas counts/i.test(result.text)) errors.push(`dead Tomas ${label} path emitted present-tense speech`);
    if (result.facts.some(line => /custody test|promised to Tomas|promise to Tomas/i.test(line))) {
      errors.push(`dead Tomas ${label} path surfaced an untested promise in What Remains`);
    }
  }
  if (fixture.livingPossession.promise !== "broken" || fixture.livingPossession.addedMemories.length !== 1) {
    errors.push("living Tomas possession test no longer resolves the authored promise as broken");
  }
  if (fixture.livingShared.promise !== "kept" || fixture.livingShared.addedMemories.length !== 1) {
    errors.push("living Tomas shared-custody test no longer resolves the authored promise as kept");
  }
  return errors;
}

function finalOrderEndingChecks(runtime) {
  const errors = [];
  const fixture = runtime.evaluate(`(() => {
    const finals = ["hold", "comfort", "transmission", "endure"];
    return {
      living: Object.fromEntries(finals.map(final => [final, buildLivingShipText([], [], false, 52, final)])),
      quiet: Object.fromEntries(finals.map(final => [final, buildQuietShipText([], "split", final)])),
      fracture: Object.fromEntries(finals.map(final => [final, buildFractureText("split", "watch", "suppress", [], [], [], final)]))
    };
  })()`);

  const needles = {
    hold: "rogue-planet course",
    comfort: "destination for speed and comfort",
    transmission: "final transmission",
    endure: "next day, then the next"
  };
  for (const [ending, variants] of Object.entries(fixture)) {
    if (new Set(Object.values(variants)).size !== 4) {
      errors.push(`${ending} ending does not distinguish all four final orders`);
    }
    for (const [final, needle] of Object.entries(needles)) {
      if (!variants[final].includes(needle)) {
        errors.push(`${ending} ending omits ${final} final-order consequence`);
      }
    }
  }
  return errors;
}

function newRunChecks(runtime) {
  const errors = [];
  const indexSource = readFileSync(resolve(ROOT, "index.html"), "utf8");
  if (!indexSource.includes('id="btn-begin"') || !indexSource.includes('onclick="startGame()"')) {
    errors.push("title New Run control is not wired to startGame");
  }

  const fixture = runtime.evaluate(`(() => {
    const stableDigest = value => JSON.stringify((function sort(input) {
      if (Array.isArray(input)) return input.map(sort);
      if (input && typeof input === "object") {
        return Object.keys(input).sort().reduce((out, key) => {
          out[key] = sort(input[key]);
          return out;
        }, {});
      }
      return input;
    })(value));
    resetRunState();
    const expectedFreshDigest = stableDigest(state);
    const distinctiveRun = () => {
      resetRunState();
      state.scene = "act2_spine_next";
      state.survivors = 7;
      state.cohesion = 17;
      state.supplies = 23;
      state.flags.priority = "repairs";
      state.dead = ["vess"];
      state.deathCause.vess = "test fixture";
      state.affinity.amara = 6;
      state.trust.elias = 11;
      state.romance.amara = true;
      state.pursuit.amara = 2;
      state.favors.tomas = 1;
      state.past_known_by.mira = true;
      state.dying.lena = "test fixture";
      state.past_known = true;
      state.marks.sela = "yellow_sun";
      state.memories.push("test fixture");
      state.ideology.future = 8;
      state.recovered.jiro = true;
      state.promises.amara = "made";
      state.crisisPath = "custody";
      persistSave({ silent: true });
    };
    const liveDigest = () => JSON.stringify(state);

    localStorage.clear();
    distinctiveRun();
    showTitleScreen();
    const priorRaw = localStorage.getItem(SAVE_KEY);
    const priorLive = liveDigest();
    let confirmCalls = 0;
    window.__ssForceNew = true;
    window.confirm = () => { confirmCalls += 1; return false; };
    const cancelResult = startGame();
    const cancel = {
      result: cancelResult,
      confirmCalls,
      rawPreserved: localStorage.getItem(SAVE_KEY) === priorRaw,
      livePreserved: liveDigest() === priorLive,
      titleVisible: !document.getElementById("title-screen").classList.contains("hidden"),
      label: document.getElementById("btn-begin").textContent
    };
    delete window.__ssForceNew;

    confirmCalls = 0;
    window.confirm = () => { confirmCalls += 1; return true; };
    const acceptResult = startGame();
    const acceptedRaw = localStorage.getItem(SAVE_KEY);
    const accepted = JSON.parse(acceptedRaw);
    const acceptedState = Object.assign({}, accepted);
    delete acceptedState.v;
    delete acceptedState.gameVersion;
    delete acceptedState.savedAt;
    delete acceptedState.sceneEntered;
    const accept = {
      result: acceptResult,
      confirmCalls,
      rawChanged: acceptedRaw !== priorRaw,
      liveFresh: stableDigest(state) === expectedFreshDigest,
      savedFresh: stableDigest(acceptedState) === expectedFreshDigest,
      liveScene: state.scene,
      savedScene: accepted.scene,
      liveCohesion: state.cohesion,
      savedCohesion: accepted.cohesion,
      liveSurvivors: state.survivors,
      savedSurvivors: accepted.survivors,
      gameVisible: !document.getElementById("game-screen").classList.contains("hidden")
    };

    localStorage.clear();
    distinctiveRun();
    showTitleScreen();
    const failedPriorRaw = localStorage.getItem(SAVE_KEY);
    const failedPriorLive = liveDigest();
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = (key, value) => {
      if (key === SAVE_STAGING_KEY) throw new Error("injected new-run write failure");
      return originalSetItem(key, value);
    };
    window.confirm = () => true;
    const failedResult = startGame();
    localStorage.setItem = originalSetItem;
    const failed = {
      result: failedResult,
      rawPreserved: localStorage.getItem(SAVE_KEY) === failedPriorRaw,
      livePreserved: liveDigest() === failedPriorLive,
      titleVisible: !document.getElementById("title-screen").classList.contains("hidden")
    };

    localStorage.clear();
    resetRunState();
    state.scene = "act2_spine_next";
    state.cohesion = 29;
    const legacy = snapshotState();
    delete legacy.v;
    delete legacy.sceneEntered;
    const legacyRaw = JSON.stringify(legacy);
    localStorage.setItem(SAVE_KEY_LEGACY, legacyRaw);
    showTitleScreen();
    confirmCalls = 0;
    window.confirm = () => { confirmCalls += 1; return false; };
    const legacyResult = startGame();
    const legacyCancel = {
      result: legacyResult,
      confirmCalls,
      v3Absent: localStorage.getItem(SAVE_KEY) === null,
      legacyPreserved: localStorage.getItem(SAVE_KEY_LEGACY) === legacyRaw,
      label: document.getElementById("btn-begin").textContent
    };

    confirmCalls = 0;
    window.confirm = () => { confirmCalls += 1; return true; };
    const legacyAcceptResult = startGame();
    const legacyAccept = {
      result: legacyAcceptResult,
      confirmCalls,
      legacyRetired: localStorage.getItem(SAVE_KEY_LEGACY) === null,
      currentFresh: stableDigest(state) === expectedFreshDigest
    };
    localStorage.removeItem(SAVE_KEY);
    legacyAccept.staleResurrected = hasSave();

    return { cancel, accept, failed, legacyCancel, legacyAccept };
  })()`);

  if (fixture.cancel.result !== false) errors.push("cancelled New Run did not report a stopped transition");
  if (fixture.cancel.confirmCalls !== 1) errors.push(`New Run confirmation calls ${fixture.cancel.confirmCalls} != 1`);
  if (!fixture.cancel.rawPreserved || !fixture.cancel.livePreserved || !fixture.cancel.titleVisible) {
    errors.push("cancelled New Run changed save, live state, or title-screen state");
  }
  if (fixture.cancel.label !== "New run") errors.push(`saved title action label ${fixture.cancel.label} != New run`);
  if (fixture.accept.result !== true || fixture.accept.confirmCalls !== 1 || !fixture.accept.rawChanged) {
    errors.push("accepted New Run did not confirm and replace the saved slot");
  }
  if (!fixture.accept.liveFresh || !fixture.accept.savedFresh) {
    errors.push("accepted New Run retained non-fresh live or persisted state");
  }
  if (fixture.accept.liveScene !== "wake" || fixture.accept.savedScene !== "wake") {
    errors.push("accepted New Run did not start and persist wake");
  }
  if (fixture.accept.liveCohesion !== 48 || fixture.accept.savedCohesion !== 48 ||
      fixture.accept.liveSurvivors !== 9 || fixture.accept.savedSurvivors !== 9 || !fixture.accept.gameVisible) {
    errors.push("accepted New Run did not produce the canonical fresh campaign");
  }
  if (fixture.failed.result !== false || !fixture.failed.rawPreserved || !fixture.failed.livePreserved || !fixture.failed.titleVisible) {
    errors.push("failed New Run persistence did not preserve the prior slot, live run, and title screen");
  }
  if (fixture.legacyCancel.result !== false || fixture.legacyCancel.confirmCalls !== 1 ||
      !fixture.legacyCancel.v3Absent || !fixture.legacyCancel.legacyPreserved) {
    errors.push("cancelled legacy New Run migrated or replaced storage");
  }
  if (fixture.legacyCancel.label !== "New run") errors.push("legacy save did not expose the New run title action");
  if (fixture.legacyAccept.result !== true || fixture.legacyAccept.confirmCalls !== 1 ||
      !fixture.legacyAccept.legacyRetired || !fixture.legacyAccept.currentFresh || fixture.legacyAccept.staleResurrected) {
    errors.push("accepted legacy New Run did not retire the stale slot and preserve only a fresh campaign");
  }
  return errors;
}

async function saveTransferChecks(runtime) {
  const errors = [];
  const indexSource = readFileSync(resolve(ROOT, "index.html"), "utf8");
  const engineSource = readFileSync(resolve(ROOT, "src/engine.js"), "utf8");
  for (const required of [
    'id="btn-export-save"',
    'onclick="exportSaveFile()"',
    'id="btn-import-save"',
    'onclick="requestSaveImport()"',
    'id="save-import-file"',
    'accept="application/json,.json"',
    'onchange="handleSaveImportSelection(this)"',
    'id="title-save-status"',
    'aria-live="polite"'
  ]) {
    if (!indexSource.includes(required)) errors.push(`save transfer UI missing ${required}`);
  }
  if (/file\.name[^\n]+\\\.json/.test(engineSource)) errors.push("save import incorrectly treats a filename extension as authority");

  const fixture = runtime.evaluate(`(() => {
    const stateDigest = () => JSON.stringify(state);
    const storageDigest = () => JSON.stringify({
      live: localStorage.getItem(SAVE_KEY),
      legacy: localStorage.getItem(SAVE_KEY_LEGACY),
      staging: localStorage.getItem(SAVE_STAGING_KEY),
      backup: localStorage.getItem(SAVE_BACKUP_KEY)
    });
    const titleStatus = () => {
      const el = document.getElementById("title-save-status");
      return { text: el.textContent, error: el.classList.contains("error") };
    };
    const makeSnapshot = (scene, cohesion, marker = true) => {
      resetRunState();
      state.scene = scene;
      state.cohesion = cohesion;
      state.flags.transfer_fixture = cohesion;
      const snap = snapshotState();
      if (!marker) delete snap.sceneEntered;
      return snap;
    };

    localStorage.clear();
    const noSaveExport = buildSaveExport();
    const noSlotCandidate = makeSnapshot("wake", 33);
    const noSlotRaw = JSON.stringify(noSlotCandidate);
    let noSlotConfirmCalls = 0;
    window.confirm = () => { noSlotConfirmCalls += 1; return false; };
    const noSlotImportOk = importSaveText(noSlotRaw);
    const noSlotImport = {
      ok: noSlotImportOk,
      confirmCalls: noSlotConfirmCalls,
      noStorageCreated: storageDigest() === JSON.stringify({ live: null, legacy: null, staging: null, backup: null })
    };

    const priorSnapshot = makeSnapshot("wake", 19);
    const priorRaw = JSON.stringify(priorSnapshot);
    localStorage.setItem(SAVE_KEY, priorRaw);
    resetRunState();
    state.scene = "priority_repairs";
    state.cohesion = 27;
    const priorLive = stateDigest();
    const priorStorage = storageDigest();
    const exported = buildSaveExport();
    const exportCurrent = {
      exact: exported && exported.text === priorRaw,
      filename: exported && exported.filename,
      storagePreserved: storageDigest() === priorStorage,
      livePreserved: stateDigest() === priorLive
    };

    localStorage.setItem(SAVE_BACKUP_KEY, priorRaw);
    localStorage.setItem(SAVE_KEY, '{"scene":"wake","broken":');
    const backupExport = buildSaveExport();
    const exportBackupExact = backupExport && backupExport.text === priorRaw;

    localStorage.clear();
    localStorage.setItem(SAVE_KEY, priorRaw);
    const candidate = makeSnapshot("act2_spine_next", 31);
    candidate.gameVersion = "0.29";
    const candidateRaw = JSON.stringify(candidate);
    resetRunState();
    state.scene = "priority_repairs";
    state.cohesion = 27;
    const cancelStorageBefore = storageDigest();
    const cancelLiveBefore = stateDigest();
    let confirmCalls = 0;
    window.confirm = () => { confirmCalls += 1; return false; };
    const cancelOk = importSaveText(candidateRaw);
    const cancelled = {
      ok: cancelOk,
      confirmCalls,
      storagePreserved: storageDigest() === cancelStorageBefore,
      livePreserved: stateDigest() === cancelLiveBefore,
      status: titleStatus()
    };

    const rejected = {};
    const rejectCase = (name, raw) => {
      const beforeStorage = storageDigest();
      const beforeLive = stateDigest();
      confirmCalls = 0;
      window.confirm = () => { confirmCalls += 1; return true; };
      const ok = importSaveText(raw);
      rejected[name] = {
        ok,
        confirmCalls,
        storagePreserved: storageDigest() === beforeStorage,
        livePreserved: stateDigest() === beforeLive,
        status: titleStatus()
      };
    };
    rejectCase("empty", "");
    rejectCase("malformed", '{"v":3');
    const unknown = Object.assign({}, candidate, { scene: "missing_transfer_scene" });
    rejectCase("unknown", JSON.stringify(unknown));
    const future = Object.assign({}, candidate, { v: SAVE_SCHEMA_VERSION + 1 });
    rejectCase("future", JSON.stringify(future));
    const poison = Object.assign({}, candidate, { constructor: { prototype: "fixture" } });
    rejectCase("poison", JSON.stringify(poison));
    const corruptAffinity = Object.assign({}, candidate, { affinity: Object.assign({}, candidate.affinity, { lena: { score: 12 } }) });
    rejectCase("corruptAffinity", JSON.stringify(corruptAffinity));
    const corruptRecovery = Object.assign({}, candidate, { recovered: Object.assign({}, candidate.recovered, { vess: "yes" }) });
    rejectCase("corruptRecovery", JSON.stringify(corruptRecovery));
    const corruptIdeology = Object.assign({}, candidate, { ideology: { future: { score: 3 }, living: 1 } });
    rejectCase("corruptIdeology", JSON.stringify(corruptIdeology));
    const typeConfusedFlag = Object.assign({}, candidate, {
      flags: Object.assign({}, candidate.flags, { last_tx_spent: "false" })
    });
    rejectCase("typeConfusedFlag", JSON.stringify(typeConfusedFlag));
    rejectCase("oversized", " ".repeat(MAX_IMPORT_BYTES + 1));
    const bomAccepted = inspectSaveImportText("\\uFEFF" + candidateRaw).ok;

    const pairSnapshot = Object.assign({}, candidate, {
      romance: Object.assign({}, candidate.romance, { amara_tomas: true }),
      marks: Object.assign({}, candidate.marks, { conflict: "backed", sela: { spoken: true } })
    });
    const validPairAndNonCrewMark = inspectSaveImportText(JSON.stringify(pairSnapshot)).ok;

    localStorage.setItem(SAVE_KEY_LEGACY, JSON.stringify(makeSnapshot("wake", 44, false)));
    resetRunState();
    state.scene = "priority_repairs";
    state.cohesion = 27;
    const successLiveBefore = stateDigest();
    confirmCalls = 0;
    window.confirm = () => { confirmCalls += 1; return true; };
    const successOk = importSaveText(candidateRaw);
    const successful = {
      ok: successOk,
      confirmCalls,
      exact: localStorage.getItem(SAVE_KEY) === candidateRaw,
      legacyRetired: localStorage.getItem(SAVE_KEY_LEGACY) === null,
      transactionCleared: localStorage.getItem(SAVE_STAGING_KEY) === null && localStorage.getItem(SAVE_BACKUP_KEY) === null,
      livePreserved: stateDigest() === successLiveBefore,
      resumeVisible: !document.getElementById("btn-resume").classList.contains("hidden"),
      exportVisible: !document.getElementById("btn-export-save").classList.contains("hidden"),
      status: titleStatus()
    };
    successful.resumeOk = resumeGame();
    successful.resumedScene = state.scene;
    successful.resumedCohesion = state.cohesion;

    localStorage.clear();
    localStorage.setItem(SAVE_KEY, priorRaw);
    resetRunState();
    state.scene = "priority_repairs";
    state.cohesion = 27;
    const interruptedStorageBefore = storageDigest();
    const interruptedLiveBefore = stateDigest();
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = (key, value) => {
      if (key === SAVE_KEY && value === candidateRaw) throw new Error("injected import commit failure");
      return originalSetItem(key, value);
    };
    window.confirm = () => true;
    const interruptedOk = importSaveText(candidateRaw);
    localStorage.setItem = originalSetItem;
    const interrupted = {
      ok: interruptedOk,
      storagePreserved: storageDigest() === interruptedStorageBefore,
      livePreserved: stateDigest() === interruptedLiveBefore,
      status: titleStatus()
    };

    localStorage.clear();
    localStorage.setItem(SAVE_KEY, priorRaw);
    resetRunState();
    const destructiveOriginalSetItem = localStorage.setItem;
    localStorage.setItem = (key, value) => {
      if (key === SAVE_KEY && value === candidateRaw) {
        destructiveOriginalSetItem(key, value);
        throw new Error("injected failure after destructive candidate write");
      }
      if (key === SAVE_KEY && value === priorRaw) throw new Error("injected live restore failure");
      return destructiveOriginalSetItem(key, value);
    };
    window.confirm = () => true;
    const destructiveInterruptedOk = importSaveText(candidateRaw);
    localStorage.setItem = destructiveOriginalSetItem;
    const destructiveInterrupted = {
      ok: destructiveInterruptedOk,
      liveStillCandidate: localStorage.getItem(SAVE_KEY) === candidateRaw,
      effectiveOriginal: readRawSave() === priorRaw,
      backupOriginal: localStorage.getItem(SAVE_BACKUP_KEY) === priorRaw,
      stagedCandidate: localStorage.getItem(SAVE_STAGING_KEY) === candidateRaw,
      status: titleStatus()
    };

    localStorage.clear();
    const legacy = makeSnapshot("act2_tether_sighting", 36, false);
    delete legacy.v;
    delete legacy.gameVersion;
    const legacyRaw = JSON.stringify(legacy);
    resetRunState();
    window.confirm = () => true;
    const legacyImportOk = importSaveText(legacyRaw);
    const legacyStoredExact = localStorage.getItem(SAVE_KEY) === legacyRaw;
    const legacyResumeOk = resumeGame();
    const upgradedLegacy = JSON.parse(localStorage.getItem(SAVE_KEY));

    localStorage.clear();
    pendingLegacyResume = null;
    globalThis.__legacyEntryCalls = 0;
    scenes.transfer_legacy_probe = {
      text: "Migration probe",
      onEnter: () => { globalThis.__legacyEntryCalls += 1; state.cohesion += 1; },
      choices: []
    };
    const markerless = makeSnapshot("transfer_legacy_probe", 30, false);
    markerless.v = 2;
    const markerlessRaw = JSON.stringify(markerless);
    window.confirm = () => true;
    const markerlessImportOk = importSaveText(markerlessRaw);
    const migrationOriginalSetItem = localStorage.setItem;
    localStorage.setItem = (key, value) => {
      if (key === SAVE_KEY && value.includes('"sceneEntered":true')) throw new Error("injected legacy marker write failure");
      return migrationOriginalSetItem(key, value);
    };
    const firstMigrationResume = resumeGame();
    const firstMigrationCalls = globalThis.__legacyEntryCalls;
    const firstMigrationStatus = titleStatus();
    localStorage.setItem = migrationOriginalSetItem;
    const secondMigrationResume = resumeGame();
    const migrationRetry = {
      importOk: markerlessImportOk,
      firstOk: firstMigrationResume,
      firstCalls: firstMigrationCalls,
      firstStatus: firstMigrationStatus,
      secondOk: secondMigrationResume,
      finalCalls: globalThis.__legacyEntryCalls,
      cohesion: state.cohesion,
      marker: JSON.parse(localStorage.getItem(SAVE_KEY)).sceneEntered
    };
    delete scenes.transfer_legacy_probe;

    localStorage.clear();
    const completed = makeSnapshot("ending_check", 22);
    completed.flags.ending = "The Quiet Ship";
    const completedRaw = JSON.stringify(completed);
    resetRunState();
    window.confirm = () => true;
    const completedImportOk = importSaveText(completedRaw);
    const completedResumeOk = resumeGame();
    const completedScene = state.scene;
    playAgain();
    const completedPreservedAfterPlayAgain = localStorage.getItem(SAVE_KEY) === completedRaw;

    return {
      noSaveExport,
      noSlotImport,
      exportCurrent,
      exportBackupExact,
      cancelled,
      rejected,
      bomAccepted,
      validPairAndNonCrewMark,
      successful,
      interrupted,
      destructiveInterrupted,
      legacy: {
        importOk: legacyImportOk,
        storedExact: legacyStoredExact,
        resumeOk: legacyResumeOk,
        scene: state.scene,
        upgraded: upgradedLegacy.v === SAVE_SCHEMA_VERSION && upgradedLegacy.sceneEntered === true
      },
      migrationRetry,
      completed: {
        importOk: completedImportOk,
        resumeOk: completedResumeOk,
        scene: completedScene,
        preservedAfterPlayAgain: completedPreservedAfterPlayAgain
      }
    };
  })()`);

  if (fixture.noSaveExport !== null) errors.push("export prepared a file without a valid save");
  if (fixture.noSlotImport.ok || fixture.noSlotImport.confirmCalls !== 1 || !fixture.noSlotImport.noStorageCreated) {
    errors.push("import without a current slot did not confirm before writing");
  }
  if (!fixture.exportCurrent.exact || !fixture.exportCurrent.storagePreserved || !fixture.exportCurrent.livePreserved) {
    errors.push("export did not preserve and return the exact effective save bytes");
  }
  if (!/^sunsplitter-save-v[^/]+-\d{4}-\d{2}-\d{2}\.json$/.test(fixture.exportCurrent.filename || "")) {
    errors.push(`export filename is not bounded/versioned: ${JSON.stringify(fixture.exportCurrent.filename)}`);
  }
  if (!fixture.exportBackupExact) errors.push("export did not select the verified backup when the live slot was corrupt");
  if (fixture.cancelled.ok || fixture.cancelled.confirmCalls !== 1 ||
      !fixture.cancelled.storagePreserved || !fixture.cancelled.livePreserved || fixture.cancelled.status.text !== "Import cancelled") {
    errors.push("cancelled import changed state/storage or lacked clear title feedback");
  }
  for (const [name, result] of Object.entries(fixture.rejected)) {
    if (result.ok || result.confirmCalls !== 0 || !result.storagePreserved || !result.livePreserved ||
        !result.status.error || !result.status.text.startsWith("Import rejected ·")) {
      errors.push(`${name} import did not reject before confirmation and mutation`);
    }
  }
  if (!fixture.bomAccepted) errors.push("valid JSON with one UTF-8 BOM was rejected");
  if (!fixture.validPairAndNonCrewMark) errors.push("valid pair romance or authored non-crew mark was rejected");
  if (!fixture.successful.ok || fixture.successful.confirmCalls !== 1 || !fixture.successful.exact ||
      !fixture.successful.legacyRetired || !fixture.successful.transactionCleared || !fixture.successful.livePreserved ||
      !fixture.successful.resumeVisible || !fixture.successful.exportVisible) {
    errors.push("valid import did not commit exactly, retire legacy, preserve live state, and refresh title controls");
  }
  if (fixture.successful.status.text !== "Imported · Continue to load" || fixture.successful.status.error) {
    errors.push(`successful import title feedback mismatch: ${JSON.stringify(fixture.successful.status)}`);
  }
  if (!fixture.successful.resumeOk || fixture.successful.resumedScene !== "act2_spine_next" || fixture.successful.resumedCohesion !== 31) {
    errors.push("Continue did not load the successfully imported run");
  }
  if (fixture.interrupted.ok || !fixture.interrupted.storagePreserved || !fixture.interrupted.livePreserved ||
      fixture.interrupted.status.text !== "Import failed · original slot kept" || !fixture.interrupted.status.error) {
    errors.push("interrupted import did not restore the original slot and live state");
  }
  if (fixture.destructiveInterrupted.ok || !fixture.destructiveInterrupted.liveStillCandidate ||
      !fixture.destructiveInterrupted.effectiveOriginal || !fixture.destructiveInterrupted.backupOriginal ||
      !fixture.destructiveInterrupted.stagedCandidate || fixture.destructiveInterrupted.status.text !== "Import failed · original slot kept") {
    errors.push("destructive import failure did not keep the original slot authoritative through the backup");
  }
  if (!fixture.legacy.importOk || !fixture.legacy.storedExact || !fixture.legacy.resumeOk || !fixture.legacy.upgraded) {
    errors.push("legacy import did not remain exact until Continue and then upgrade once");
  }
  if (!fixture.migrationRetry.importOk || fixture.migrationRetry.firstOk || fixture.migrationRetry.firstCalls !== 1 ||
      !fixture.migrationRetry.firstStatus.error || fixture.migrationRetry.firstStatus.text === "Resumed" ||
      !fixture.migrationRetry.secondOk || fixture.migrationRetry.finalCalls !== 1 ||
      fixture.migrationRetry.cohesion !== 31 || fixture.migrationRetry.marker !== true) {
    errors.push(`interrupted legacy marker upgrade replayed scene entry or reported success: ${JSON.stringify(fixture.migrationRetry)}`);
  }
  if (!fixture.completed.importOk || !fixture.completed.resumeOk || fixture.completed.scene !== "ending_check" ||
      !fixture.completed.preservedAfterPlayAgain) {
    errors.push("completed-run import did not resume and survive Play Again unchanged");
  }

  const browserFixture = await runtime.evaluate(`(async () => {
    localStorage.clear();
    resetRunState();
    state.scene = "wake";
    const raw = JSON.stringify(snapshotState());
    localStorage.setItem(SAVE_KEY, raw);

    const input = document.getElementById("save-import-file");
    let pickerClicks = 0;
    input.value = "stale-selection";
    input.click = () => { pickerClicks += 1; };
    const pickerOk = requestSaveImport();
    const pickerReset = input.value === "";

    const originalBody = document.body;
    const originalCreateElement = document.createElement;
    const originalBlob = globalThis.Blob;
    const originalCreateObjectURL = URL.createObjectURL;
    const originalRevokeObjectURL = URL.revokeObjectURL;
    const originalSetTimeout = globalThis.setTimeout;
    let clicked = 0;
    let removed = 0;
    let revoked = null;
    let revokeDelay = null;
    let createdBlob = null;
    let createdLink = null;
    try {
      document.body = {
        appendChild(link) { link.parentNode = this; createdLink = link; return link; },
        removeChild(link) { if (link === createdLink) removed += 1; link.parentNode = null; }
      };
      document.createElement = tag => ({ tag, hidden: false, href: "", download: "", parentNode: null, click() { clicked += 1; } });
      globalThis.Blob = class BlobProbe {
        constructor(parts, options) { this.parts = parts; this.options = options; createdBlob = this; }
      };
      URL.createObjectURL = blob => blob === createdBlob ? "blob:save-transfer-probe" : "blob:unexpected";
      URL.revokeObjectURL = url => { revoked = url; };
      globalThis.setTimeout = (fn, delay) => {
        if (delay >= 60_000) { revokeDelay = delay; fn(); }
        return 1;
      };
      const exportOk = exportSaveFile();
      var exportResult = {
        ok: exportOk,
        clicked,
        removed,
        exactBytes: createdBlob && createdBlob.parts.length === 1 && createdBlob.parts[0] === raw,
        mime: createdBlob && createdBlob.options && createdBlob.options.type,
        filename: createdLink && createdLink.download,
        revoked,
        revokeDelay,
        status: document.getElementById("title-save-status").textContent
      };
    } finally {
      document.body = originalBody;
      document.createElement = originalCreateElement;
      globalThis.Blob = originalBlob;
      URL.createObjectURL = originalCreateObjectURL;
      URL.revokeObjectURL = originalRevokeObjectURL;
      globalThis.setTimeout = originalSetTimeout;
    }

    const candidate = JSON.parse(raw);
    candidate.cohesion = 37;
    const candidateRaw = JSON.stringify(candidate);
    let confirmCalls = 0;
    window.confirm = () => { confirmCalls += 1; return true; };
    input.files = [{ name: "renamed-save-without-extension", size: candidateRaw.length, text: async () => candidateRaw }];
    input.value = "selected";
    const selectedOk = await handleSaveImportSelection(input);

    globalThis.FileReader = class FileReaderProbe {
      readAsText(file) { this.result = file.contents; this.onload(); }
    };
    const fallbackText = await readSaveImportFile({ contents: candidateRaw });

    return {
      pickerOk,
      pickerClicks,
      pickerReset,
      exportResult,
      selectedOk,
      confirmCalls,
      selectedExact: localStorage.getItem(SAVE_KEY) === candidateRaw,
      inputReset: input.value === "",
      fallbackExact: fallbackText === candidateRaw
    };
  })()`);
  if (!browserFixture.pickerOk || browserFixture.pickerClicks !== 1 || !browserFixture.pickerReset) {
    errors.push("title import control did not reset and open the file picker");
  }
  const exported = browserFixture.exportResult;
  if (!exported.ok || exported.clicked !== 1 || exported.removed !== 1 || !exported.exactBytes ||
      exported.mime !== "application/json" || !exported.filename?.endsWith(".json") ||
      exported.revoked !== "blob:save-transfer-probe" || exported.revokeDelay < 1_000 || exported.status !== "Export prepared") {
    errors.push(`browser export path did not preserve bytes/click/cleanup/feedback: ${JSON.stringify(exported)}`);
  }
  if (!browserFixture.selectedOk || browserFixture.confirmCalls !== 1 || !browserFixture.selectedExact ||
      !browserFixture.inputReset || !browserFixture.fallbackExact) {
    errors.push("browser import path rejected renamed content, skipped fallback read, or failed to reset selection");
  }
  return errors;
}

function playAgainChecks(runtime) {
  const errors = [];
  const indexSource = readFileSync(resolve(ROOT, "index.html"), "utf8");
  if (indexSource.includes('onclick="location.reload()"')) {
    errors.push("Play Again still reloads the page instead of starting a fresh campaign");
  }
  const playAgainWires = (indexSource.match(/onclick="playAgain\(\)"/g) || []).length;
  if (playAgainWires !== 2) errors.push(`Play Again wiring count ${playAgainWires} != 2`);

  const fixture = runtime.evaluate(`(() => {
    resetRunState();
    state.scene = "ending_check";
    state.cohesion = 18;
    state.flags.crisis = "vent";
    state.flags.final = "endure";
    kill("rourke", "died with company");
    state.survivors = 4;
    persistSave({ silent: true });
    const completedRaw = localStorage.getItem("sunsplitter_save_v3");
    const completed = JSON.parse(completedRaw);
    resolveEnding();
    playAgain();
    const afterPlayAgainRaw = localStorage.getItem("sunsplitter_save_v3");
    const afterPlayAgain = JSON.parse(afterPlayAgainRaw);
    const gameVisible = !document.getElementById("game-screen").classList.contains("hidden");
    const endingHidden = document.getElementById("ending-screen").classList.contains("hidden");
    const remainsHidden = document.getElementById("what-remains-screen").classList.contains("hidden");
    const live = {
      scene: state.scene,
      survivors: state.survivors,
      cohesion: state.cohesion,
      dead: (state.dead || []).slice(),
      crisis: state.flags.crisis || null,
      final: state.flags.final || null
    };
    const continueOk = resumeGame();
    const continuedRaw = localStorage.getItem("sunsplitter_save_v3");
    const continued = {
      scene: state.scene,
      survivors: state.survivors,
      cohesion: state.cohesion,
      dead: (state.dead || []).slice(),
      crisis: state.flags.crisis || null,
      final: state.flags.final || null
    };
    resetRunState();
    state.scene = "ending_check";
    persistSave({ silent: true });
    const remainsCompletedRaw = localStorage.getItem("sunsplitter_save_v3");
    resolveEnding();
    showWhatRemains();
    playAgain();
    const remainsAfterRaw = localStorage.getItem("sunsplitter_save_v3");
    const remainsLiveScene = state.scene;
    const remainsContinueOk = resumeGame();
    return {
      completedScene: completed.scene,
      completedSurvivors: completed.survivors,
      completedDead: completed.dead.slice(),
      afterPlayAgainEqualsCompleted: afterPlayAgainRaw === completedRaw,
      afterScene: afterPlayAgain.scene,
      afterSurvivors: afterPlayAgain.survivors,
      gameVisible,
      endingHidden,
      remainsHidden,
      live,
      continueOk,
      continuedRawEqualsCompleted: continuedRaw === completedRaw,
      continued,
      remainsAfterEqualsCompleted: remainsAfterRaw === remainsCompletedRaw,
      remainsLiveScene,
      remainsContinueOk,
      remainsContinuedScene: state.scene
    };
  })()`);

  if (fixture.completedScene !== "ending_check") errors.push(`fixture completed scene ${fixture.completedScene} != ending_check`);
  if (!fixture.afterPlayAgainEqualsCompleted) errors.push("Play Again mutated or replaced the completed save blob");
  if (fixture.afterScene !== "ending_check" || fixture.afterSurvivors !== 4) {
    errors.push("completed save on disk did not keep ending_check / distinctive survivors after Play Again");
  }
  if (!fixture.gameVisible || !fixture.endingHidden || !fixture.remainsHidden) {
    errors.push("Play Again did not boot the game screen as a fresh campaign");
  }
  if (fixture.live.scene !== "wake") errors.push(`Play Again live scene ${fixture.live.scene} != wake`);
  if (fixture.live.survivors !== 9) errors.push(`Play Again live survivors ${fixture.live.survivors} != fresh 9`);
  if (fixture.live.cohesion !== 48) errors.push(`Play Again live cohesion ${fixture.live.cohesion} != fresh 48`);
  if (fixture.live.dead.length) errors.push("Play Again applied completed deaths into the new run");
  if (fixture.live.crisis || fixture.live.final) errors.push("Play Again applied completed ending flags into the new run");
  if (!fixture.continueOk) errors.push("Continue failed after Play Again");
  if (!fixture.continuedRawEqualsCompleted) errors.push("Continue mutated the completed save blob");
  if (fixture.continued.scene !== "ending_check") errors.push(`Continue scene ${fixture.continued.scene} != ending_check`);
  if (fixture.continued.survivors !== 4) errors.push(`Continue survivors ${fixture.continued.survivors} != completed 4`);
  if (!fixture.continued.dead.includes("rourke")) errors.push("Continue did not restore the completed death list");
  if (fixture.continued.crisis !== "vent" || fixture.continued.final !== "endure") {
    errors.push("Continue did not restore the completed ending flags");
  }
  if (!fixture.remainsAfterEqualsCompleted) errors.push("Play Again from What Remains mutated the completed save blob");
  if (fixture.remainsLiveScene !== "wake") errors.push(`What Remains Play Again live scene ${fixture.remainsLiveScene} != wake`);
  if (!fixture.remainsContinueOk || fixture.remainsContinuedScene !== "ending_check") {
    errors.push("Continue after What Remains Play Again did not restore the completed blob");
  }
  return errors;
}

function unknownSaveSceneChecks(runtime) {
  const errors = [];
  const fixture = runtime.evaluate(`(() => {
    resetRunState();
    state.scene = "wake";
    persistSave({ silent: true });
    const malformed = JSON.parse(localStorage.getItem("sunsplitter_save_v3"));
    malformed.scene = "missing_scene";
    malformed.cohesion = 17;
    const raw = JSON.stringify(malformed);
    localStorage.setItem("sunsplitter_save_v3", raw);

    resetRunState();
    const before = { scene: state.scene, cohesion: state.cohesion };
    const ok = loadGame();
    return {
      ok,
      before,
      after: { scene: state.scene, cohesion: state.cohesion },
      story: document.getElementById("story").innerHTML,
      savePreserved: localStorage.getItem("sunsplitter_save_v3") === raw
    };
  })()`);

  if (fixture.ok) errors.push("unknown-scene save reported a successful resume");
  if (fixture.after.scene !== fixture.before.scene || fixture.after.cohesion !== fixture.before.cohesion) {
    errors.push(`unknown-scene save mutated live state: ${JSON.stringify(fixture.after)}`);
  }
  if (fixture.story.includes("Scene missing:")) errors.push("unknown-scene save rendered the zero-choice missing-scene trap");
  if (!fixture.savePreserved) errors.push("failed unknown-scene load replaced or removed the original save blob");
  return errors;
}

function malformedSnapshotShapeChecks(runtime) {
  const errors = [];
  const fixture = runtime.evaluate(`(() => {
    resetRunState();
    state.scene = "wake";
    const valid = snapshotState();
    const malformed = Object.assign({}, valid, { cohesion: 17, flags: "not-an-object" });
    const raw = JSON.stringify(malformed);
    localStorage.setItem("sunsplitter_save_v3", raw);

    resetRunState();
    const before = { scene: state.scene, cohesion: state.cohesion, flags: Object.assign({}, state.flags) };
    const ok = loadGame();
    const after = { scene: state.scene, cohesion: state.cohesion, flags: Object.assign({}, state.flags) };

    const legacy = Object.assign({}, valid, { v: 2, cohesion: 23 });
    delete legacy.recovered;
    delete legacy.promises;
    delete legacy.crisisPath;
    resetRunState();
    const legacyOk = applySnapshot(legacy);
    return {
      ok,
      before,
      after,
      savePreserved: localStorage.getItem("sunsplitter_save_v3") === raw,
      legacyOk,
      legacyCohesion: state.cohesion,
      legacyRecovered: Object.assign({}, state.recovered)
    };
  })()`);

  if (fixture.ok) errors.push("malformed snapshot shape reported a successful resume");
  if (JSON.stringify(fixture.after) !== JSON.stringify(fixture.before)) {
    errors.push(`malformed snapshot shape partially mutated live state: ${JSON.stringify(fixture.after)}`);
  }
  if (!fixture.savePreserved) errors.push("failed malformed snapshot load replaced or removed the original save blob");
  if (!fixture.legacyOk || fixture.legacyCohesion !== 23) errors.push("valid legacy v2 snapshot no longer loads");
  if (fixture.legacyRecovered.tomas || fixture.legacyRecovered.jiro || fixture.legacyRecovered.vess) {
    errors.push("valid legacy v2 snapshot lost missing-recovery defaults");
  }
  return errors;
}

function saveWriteFailureChecks(runtime) {
  const errors = [];
  const fixture = runtime.evaluate(`(() => {
    const statusSnapshot = () => {
      const el = document.getElementById("save-status");
      return {
        text: el.textContent,
        error: el.classList.contains("error"),
        visible: el.classList.contains("visible")
      };
    };
    const originalSetItem = localStorage.setItem;

    localStorage.clear();
    resetRunState();
    state.scene = "wake";
    state.cohesion = 31;
    persistSave({ silent: true });
    const priorRaw = localStorage.getItem(SAVE_KEY);

    state.scene = "breath_hub";
    state.cohesion = 17;
    let commitCalls = 0;
    localStorage.setItem = (key, value) => {
      if (key === SAVE_KEY && commitCalls++ === 0) {
        originalSetItem(key, '{"truncated":');
        throw new Error("injected commit failure");
      }
      return originalSetItem(key, value);
    };
    const failedOk = persistSave({ silent: true });
    localStorage.setItem = originalSetItem;
    const failed = {
      ok: failedOk,
      priorPreserved: localStorage.getItem(SAVE_KEY) === priorRaw,
      stagingCleared: localStorage.getItem(SAVE_STAGING_KEY) === null,
      backupCleared: localStorage.getItem(SAVE_BACKUP_KEY) === null,
      liveScene: state.scene,
      liveCohesion: state.cohesion,
      status: statusSnapshot()
    };

    const retryOk = persistSave({ silent: true });
    const retry = {
      ok: retryOk,
      scene: JSON.parse(localStorage.getItem(SAVE_KEY)).scene,
      cohesion: JSON.parse(localStorage.getItem(SAVE_KEY)).cohesion,
      stagingCleared: localStorage.getItem(SAVE_STAGING_KEY) === null,
      backupCleared: localStorage.getItem(SAVE_BACKUP_KEY) === null,
      status: statusSnapshot()
    };

    localStorage.clear();
    resetRunState();
    state.scene = "wake";
    state.cohesion = 29;
    persistSave({ silent: true });
    const fallbackPriorRaw = localStorage.getItem(SAVE_KEY);
    state.scene = "breath_hub";
    state.cohesion = 11;
    let destructiveCalls = 0;
    localStorage.setItem = (key, value) => {
      if (key === SAVE_KEY) {
        destructiveCalls += 1;
        if (destructiveCalls === 1) originalSetItem(key, '{"truncated":');
        throw new Error("injected destructive commit/restore failure");
      }
      return originalSetItem(key, value);
    };
    const fallbackOk = persistSave({ silent: true });
    const fallback = {
      ok: fallbackOk,
      liveCorrupt: localStorage.getItem(SAVE_KEY) !== fallbackPriorRaw,
      backupPreserved: localStorage.getItem(SAVE_BACKUP_KEY) === fallbackPriorRaw,
      readUsesBackup: readRawSave() === fallbackPriorRaw,
      status: statusSnapshot()
    };
    localStorage.setItem = originalSetItem;
    resetRunState();
    fallback.loadOk = loadGame();
    fallback.loadedScene = state.scene;
    fallback.loadedCohesion = state.cohesion;
    state.scene = "breath_hub";
    state.cohesion = 9;
    fallback.retryOk = persistSave({ silent: true });
    fallback.retryScene = JSON.parse(localStorage.getItem(SAVE_KEY)).scene;
    fallback.retryCohesion = JSON.parse(localStorage.getItem(SAVE_KEY)).cohesion;
    fallback.transactionCleared = localStorage.getItem(SAVE_STAGING_KEY) === null && localStorage.getItem(SAVE_BACKUP_KEY) === null;

    localStorage.clear();
    resetRunState();
    state.scene = "breath_hub";
    localStorage.setItem = (key, value) => {
      if (key === SAVE_STAGING_KEY) throw new Error("injected staging failure");
      return originalSetItem(key, value);
    };
    const firstOk = persistSave({ silent: true });
    localStorage.setItem = originalSetItem;
    const first = {
      ok: firstOk,
      noLiveSlot: localStorage.getItem(SAVE_KEY) === null,
      status: statusSnapshot()
    };

    return { failed, retry, fallback, first };
  })()`);

  if (fixture.failed.ok) errors.push("injected autosave commit failure reported success");
  if (!fixture.failed.priorPreserved) errors.push("failed autosave did not restore the prior live slot bytes");
  if (!fixture.failed.stagingCleared || !fixture.failed.backupCleared) {
    errors.push("restored autosave failure left transaction keys behind");
  }
  if (fixture.failed.liveScene !== "breath_hub" || fixture.failed.liveCohesion !== 17) {
    errors.push("failed autosave mutated the current in-memory run");
  }
  if (fixture.failed.status.text !== "Autosave failed · prior slot kept" || !fixture.failed.status.error || !fixture.failed.status.visible) {
    errors.push(`failed autosave was not exposed persistently: ${JSON.stringify(fixture.failed.status)}`);
  }

  if (!fixture.retry.ok || fixture.retry.scene !== "breath_hub" || fixture.retry.cohesion !== 17) {
    errors.push("successful autosave retry did not commit the current run");
  }
  if (!fixture.retry.stagingCleared || !fixture.retry.backupCleared) {
    errors.push("successful autosave retry left transaction keys behind");
  }
  if (fixture.retry.status.error || fixture.retry.status.visible || fixture.retry.status.text) {
    errors.push(`successful autosave retry did not clear the sticky failure: ${JSON.stringify(fixture.retry.status)}`);
  }

  if (fixture.fallback.ok || !fixture.fallback.liveCorrupt || !fixture.fallback.backupPreserved || !fixture.fallback.readUsesBackup) {
    errors.push("failed commit/restore did not preserve a readable prior backup");
  }
  if (fixture.fallback.status.text !== "Autosave failed · prior slot kept" || !fixture.fallback.status.error || !fixture.fallback.status.visible) {
    errors.push(`backup-recovered autosave failure was not exposed: ${JSON.stringify(fixture.fallback.status)}`);
  }
  if (!fixture.fallback.loadOk || fixture.fallback.loadedScene !== "wake" || fixture.fallback.loadedCohesion !== 29) {
    errors.push("Continue did not recover the prior valid slot from the verified backup");
  }
  if (!fixture.fallback.retryOk || fixture.fallback.retryScene !== "breath_hub" || fixture.fallback.retryCohesion !== 9 || !fixture.fallback.transactionCleared) {
    errors.push("save after backup recovery did not commit and retire transaction keys");
  }

  if (fixture.first.ok || !fixture.first.noLiveSlot) errors.push("first-save staging failure created a live slot");
  if (fixture.first.status.text !== "Autosave failed · progress not saved" || !fixture.first.status.error || !fixture.first.status.visible) {
    errors.push(`first autosave failure was not exposed: ${JSON.stringify(fixture.first.status)}`);
  }
  return errors;
}

function keyboardChoiceChecks(runtime) {
  const errors = [];
  const fixture = runtime.evaluate(`(() => {
    const originalChoices = scenes.wake.choices;
    const choicesEl = document.getElementById("choices");
    const game = document.getElementById("game-screen");
    const renderFixture = choices => {
      scenes.wake.choices = choices;
      choicesEl.children = [];
      state.scene = "wake";
      showScene("wake");
      return choicesEl.children.slice();
    };
    const keyEvent = (key, extra = {}) => Object.assign({
      key,
      target: { tagName: "DIV" },
      defaultPrevented: false,
      repeat: false,
      altKey: false,
      ctrlKey: false,
      metaKey: false,
      prevented: false,
      preventDefault() { this.prevented = true; }
    }, extra);

    resetRunState();
    game.classList.remove("hidden");
    let buttons = renderFixture([
      { text: "First", next: "dying" },
      { text: "Locked", next: "dying", effects: { supplies: -999 } },
      { text: "Third", next: "silence" }
    ]);
    const shortcuts = buttons.map(btn => btn.getAttribute("aria-keyshortcuts"));

    const disabledEvent = keyEvent("2");
    const disabledHandled = handleGameplayKeydown(disabledEvent);
    const disabledScene = state.scene;

    const numberEvent = keyEvent("3");
    const numberHandled = handleGameplayKeydown(numberEvent);
    const numberScene = state.scene;

    buttons = renderFixture([
      { text: "Only", next: "dying" }
    ]);
    const singleShortcut = buttons[0].getAttribute("aria-keyshortcuts");
    const enterEvent = keyEvent("Enter");
    const enterHandled = handleGameplayKeydown(enterEvent);
    const enterScene = state.scene;

    buttons = renderFixture([
      { text: "Only", next: "silence" }
    ]);
    const spaceEvent = keyEvent(" ");
    const spaceHandled = handleGameplayKeydown(spaceEvent);
    const spaceScene = state.scene;

    buttons = renderFixture([
      { text: "First", next: "dying" },
      { text: "Second", next: "silence" }
    ]);
    buttons[0].tagName = "BUTTON";
    const focusedEvent = keyEvent("1", { target: buttons[0] });
    const focusedHandled = handleGameplayKeydown(focusedEvent);
    const focusedScene = state.scene;

    const modifiedEvent = keyEvent("2", { ctrlKey: true });
    const modifiedHandled = handleGameplayKeydown(modifiedEvent);
    const modifiedScene = state.scene;

    game.classList.add("hidden");
    const hiddenEvent = keyEvent("1");
    const hiddenHandled = handleGameplayKeydown(hiddenEvent);
    const hiddenScene = state.scene;
    game.classList.remove("hidden");

    scenes.wake.choices = originalChoices;
    return {
      shortcuts,
      disabledHandled,
      disabledPrevented: disabledEvent.prevented,
      disabledScene,
      numberHandled,
      numberPrevented: numberEvent.prevented,
      numberScene,
      singleShortcut,
      enterHandled,
      enterPrevented: enterEvent.prevented,
      enterScene,
      spaceHandled,
      spacePrevented: spaceEvent.prevented,
      spaceScene,
      focusedHandled,
      focusedPrevented: focusedEvent.prevented,
      focusedScene,
      modifiedHandled,
      modifiedPrevented: modifiedEvent.prevented,
      modifiedScene,
      hiddenHandled,
      hiddenPrevented: hiddenEvent.prevented,
      hiddenScene
    };
  })()`);

  if (JSON.stringify(fixture.shortcuts) !== JSON.stringify(["1", "2", "3"])) {
    errors.push(`rendered choices do not expose stable number shortcuts: ${JSON.stringify(fixture.shortcuts)}`);
  }
  if (fixture.disabledHandled || fixture.disabledPrevented || fixture.disabledScene !== "wake") {
    errors.push("number key activated or consumed a disabled rendered choice");
  }
  if (!fixture.numberHandled || !fixture.numberPrevented || fixture.numberScene !== "silence") {
    errors.push("number key did not activate its rendered enabled choice");
  }
  if (fixture.singleShortcut !== "1 Enter Space") {
    errors.push(`single enabled choice shortcut metadata ${JSON.stringify(fixture.singleShortcut)} is incomplete`);
  }
  if (!fixture.enterHandled || !fixture.enterPrevented || fixture.enterScene !== "dying") {
    errors.push("Enter did not advance the single unambiguous choice");
  }
  if (!fixture.spaceHandled || !fixture.spacePrevented || fixture.spaceScene !== "silence") {
    errors.push("Space did not advance the single unambiguous choice");
  }
  if (fixture.focusedHandled || fixture.focusedPrevented || fixture.focusedScene !== "wake") {
    errors.push("global shortcut intercepted native button focus handling");
  }
  if (fixture.modifiedHandled || fixture.modifiedPrevented || fixture.modifiedScene !== "wake") {
    errors.push("global shortcut intercepted a modified key chord");
  }
  if (fixture.hiddenHandled || fixture.hiddenPrevented || fixture.hiddenScene !== "wake") {
    errors.push("gameplay shortcut remained active outside the game screen");
  }
  return errors;
}

function resumeEntryIdempotenceChecks(runtime) {
  const errors = [];
  const fixture = runtime.evaluate(`(() => {
    resetRunState();
    state.promises.elias = "made";
    const originalOnEnter = scenes.act2_tether_sighting.onEnter;
    let entryCalls = 0;
    scenes.act2_tether_sighting.onEnter = () => {
      entryCalls += 1;
      return originalOnEnter();
    };

    showScene("act2_tether_sighting");
    const firstText = document.getElementById("story").innerHTML;
    persistSave({ silent: true });
    const currentRaw = localStorage.getItem("sunsplitter_save_v3");
    const currentSnapshot = JSON.parse(currentRaw);

    // A browser reload resets module-local presentation state before Continue.
    act2TetherAllusionsOnEntry = { elias: false, amara: false };
    resetRunState();
    entryCalls = 0;
    const currentOk = loadGame();
    const resumedText = document.getElementById("story").innerHTML;
    const currentEntryCalls = entryCalls;

    const legacySnapshot = Object.assign({}, currentSnapshot);
    delete legacySnapshot.sceneEntered;
    localStorage.setItem("sunsplitter_save_v3", JSON.stringify(legacySnapshot));
    act2TetherAllusionsOnEntry = { elias: false, amara: false };
    resetRunState();
    entryCalls = 0;
    const legacyOk = loadGame();
    const upgradedLegacy = JSON.parse(localStorage.getItem("sunsplitter_save_v3"));

    scenes.act2_tether_sighting.onEnter = originalOnEnter;
    return {
      currentOk,
      currentMarker: currentSnapshot.sceneEntered,
      currentEntryCalls,
      firstHasAllusion: firstText.includes("Deck Four pushed back another fragment"),
      resumedHasAllusion: resumedText.includes("Deck Four pushed back another fragment"),
      legacyOk,
      legacyEntryCalls: entryCalls,
      legacyUpgraded: upgradedLegacy.sceneEntered === true
    };
  })()`);

  if (!fixture.currentOk) errors.push("current save failed to resume");
  if (fixture.currentMarker !== true) errors.push("current snapshot does not record completed scene entry");
  if (fixture.currentEntryCalls !== 0) errors.push(`current resume re-ran onEnter ${fixture.currentEntryCalls} time(s)`);
  if (!fixture.firstHasAllusion || !fixture.resumedHasAllusion) {
    errors.push("resume did not preserve the current scene's consumed promise allusion");
  }
  if (!fixture.legacyOk || fixture.legacyEntryCalls !== 1) {
    errors.push(`markerless legacy save did not run one compatibility entry (calls=${fixture.legacyEntryCalls})`);
  }
  if (!fixture.legacyUpgraded) errors.push("markerless legacy save was not upgraded after compatibility entry");
  return errors;
}

function warmthLaughterChecks(runtime) {
  const errors = [];
  const fixture = runtime.evaluate(`(() => {
    resetRunState();
    state.recovered.vess = true;
    const livingVessText = scenes.warmth_laughter.text;
    kill("vess", "fixture");
    const deadVessText = scenes.warmth_laughter.text;
    return { livingVessText, deadVessText };
  })()`);

  if (!fixture.livingVessText.includes("Vess is one — and Vess is telling a joke")) {
    errors.push("living Vess no longer participates in warmth_laughter");
  }
  if (fixture.deadVessText.includes("Vess")) {
    errors.push("dead Vess is still named or speaking in warmth_laughter");
  }
  if (!fixture.deadVessText.includes("one of them is telling a joke")) {
    errors.push("dead-Vess warmth_laughter no longer preserves the crew joke");
  }
  return errors;
}

function rourkeDyingImageHonestyChecks(runtime) {
  const errors = [];
  const fixture = runtime.evaluate(`(() => ({
    dying: resolveSceneImage("dying", scenes.dying),
    outcomes: ["rourke_end", "rourke_stop", "rourke_try"].map(id => resolveSceneImage(id, scenes[id]))
  }))()`);

  if (fixture.dying !== "images/medical_bay.jpg") {
    errors.push(`dying Rourke scene resolves to ${fixture.dying || "no image"} instead of the injury-honest medical plate`);
  }
  if (fixture.outcomes.some(image => image !== "images/covered_body.jpg")) {
    errors.push(`Rourke outcome image wiring changed: ${fixture.outcomes.join(" | ")}`);
  }
  return errors;
}

function vessHairCanonChecks(runtime) {
  const errors = [];
  const boardingText = runtime.evaluate(`String(scenes.vess_boarding.text())`);

  if (!boardingText.includes("Long white-silver hair")) {
    errors.push("Vess boarding prose does not preserve the locked white-silver hair identity");
  }
  if (/long dark hair|knife at the jawline/i.test(boardingText)) {
    errors.push("Vess boarding prose still renders the retired dark knife-cut hair description");
  }
  return errors;
}

function arcLivingImageTruthChecks(runtime) {
  const errors = [];
  const fixture = runtime.evaluate(`(() => {
    resetRunState();
    return {
      mapped: sceneImages.arc_living_2,
      resolved: resolveSceneImage("arc_living_2", scenes.arc_living_2),
      text: String(scenes.arc_living_2.text)
    };
  })()`);

  if (fixture.mapped !== "images/sela_ritual.jpg") {
    errors.push(`arc_living_2 maps to ${fixture.mapped || "no image"} instead of the locked yellow-mark plate`);
  }
  if (fixture.resolved !== "images/sela_ritual.jpg") {
    errors.push(`arc_living_2 resolves to ${fixture.resolved || "no image"} instead of the locked yellow-mark plate`);
  }
  if (!fixture.text.includes("yellow circle") || !fixture.text.includes("plate")) {
    errors.push("arc_living_2 no longer contains the authored yellow-mark action matched by its plate");
  }
  return errors;
}

function remainingArcLivingTruthChecks(runtime) {
  const errors = [];
  const fixture = runtime.evaluate(`(() => {
    const inspect = ({ dead = [], recoverTomas = true, conflictMark = null } = {}) => {
      resetRunState();
      state.recovered.tomas = recoverTomas;
      state.recovered.jiro = true;
      for (const who of dead) kill(who, "fixture");
      if (conflictMark) mark("conflict", conflictMark);
      return {
        arc1Image: resolveSceneImage("arc_living_1", scenes.arc_living_1),
        arc1Text: String(scenes.arc_living_1.text),
        arc3Image: resolveSceneImage("arc_living_3", scenes.arc_living_3),
        arc3Text: String(scenes.arc_living_3.text),
        arc4Image: resolveSceneImage("arc_living_4", scenes.arc_living_4),
        arc4Text: String(scenes.arc_living_4.text)
      };
    };
    return {
      living: inspect(),
      unrecoveredTomas: inspect({ recoverTomas: false }),
      deadTomas: inspect({ dead: ["tomas"] }),
      deadAmara: inspect({ dead: ["amara"] }),
      deadMira: inspect({ dead: ["mira"] }),
      deadElias: inspect({ dead: ["elias"] }),
      deadMiraAndElias: inspect({ dead: ["mira", "elias"] }),
      heldDeadTomas: inspect({ dead: ["tomas"], conflictMark: "held" }),
      backedDeadElias: inspect({ dead: ["elias"], conflictMark: "backed" })
    };
  })()`);

  if (fixture.living.arc1Image !== "images/hydroponics.jpg" || fixture.deadAmara.arc1Image !== "images/hydroponics.jpg") {
    errors.push("arc_living_1 no longer resolves to its roster-ambiguous hydroponics plate");
  }
  if (!fixture.living.arc1Text.includes("Amara Vale") || fixture.deadAmara.arc1Text.includes("Amara Vale")) {
    errors.push("arc_living_1 text does not follow Amara living/dead state");
  }

  if (fixture.living.arc3Image !== "images/arc_living_conflict.jpg") {
    errors.push(`arc_living_3 living roster resolves to ${fixture.living.arc3Image || "no image"} instead of its locked conflict plate`);
  }
  for (const [label, row] of Object.entries({
    unrecoveredTomas: fixture.unrecoveredTomas,
    deadTomas: fixture.deadTomas,
    deadAmara: fixture.deadAmara,
    deadMira: fixture.deadMira
  })) {
    if (row.arc3Image !== "images/corridor.jpg") {
      errors.push(`arc_living_3 ${label} state resolves to ${row.arc3Image || "no image"} instead of the roster-safe corridor plate`);
    }
  }
  if (!fixture.living.arc3Text.includes("Mira and Elias argue")) {
    errors.push("arc_living_3 living default dispute lost Mira/Elias presence");
  }
  if (fixture.deadMira.arc3Text.includes("Mira") || !fixture.deadMira.arc3Text.includes("Elias argues")) {
    errors.push("arc_living_3 dead-Mira dispute text is not roster-truthful");
  }
  if (fixture.deadElias.arc3Text.includes("Elias") || !fixture.deadElias.arc3Text.includes("Mira argues")) {
    errors.push("arc_living_3 dead-Elias dispute text is not roster-truthful");
  }
  if (/\b(?:Mira|Elias)\b/.test(fixture.deadMiraAndElias.arc3Text)) {
    errors.push("arc_living_3 names Mira or Elias when both are dead");
  }

  if (fixture.living.arc4Image !== "images/corridor_pressure_2.jpg" || fixture.heldDeadTomas.arc4Image !== "images/corridor_pressure_2.jpg") {
    errors.push("arc_living_4 no longer resolves to its roster-ambiguous corridor plate");
  }
  if (fixture.heldDeadTomas.arc4Text.includes("Tomas") || fixture.backedDeadElias.arc4Text.includes("Elias")) {
    errors.push("arc_living_4 conflict callbacks do not follow living/dead state");
  }
  return errors;
}

function warmthMealPresenceChecks(runtime) {
  const errors = [];
  const fixture = runtime.evaluate(`(() => {
    const inspect = setup => {
      resetRunState();
      setup();
      const redirect = scenes.warmth_meal.onEnter();
      return {
        redirect: redirect || null,
        consumed: !!state.flags.warmth_meal,
        text: scenes.warmth_meal.text,
        choices: scenes.warmth_meal.choices.map(choice => choice.next)
      };
    };
    return {
      missing: inspect(() => {}),
      dead: inspect(() => {
        state.recovered.tomas = true;
        kill("tomas", "fixture");
      }),
      living: inspect(() => {
        state.recovered.tomas = true;
      })
    };
  })()`);

  for (const [label, result] of [["unrecovered", fixture.missing], ["dead", fixture.dead]]) {
    if (result.redirect !== "act3_spine_next") errors.push(`${label} Tomas does not redirect warmth_meal`);
    if (result.consumed) errors.push(`${label} Tomas consumes the warmth_meal one-shot`);
  }
  if (fixture.living.redirect !== null || !fixture.living.consumed) {
    errors.push("living recovered Tomas no longer enters and consumes warmth_meal");
  }
  if (!fixture.living.text.includes("Tomas serves everyone") || !fixture.living.text.includes("One for the soil")) {
    errors.push("living Tomas warmth_meal prose changed or disappeared");
  }
  if (fixture.living.choices.length !== 2 || fixture.living.choices.some(next => next !== "act3_spine_next")) {
    errors.push("warmth_meal no longer preserves both exits to act3_spine_next");
  }
  return errors;
}

function cutOutPresenceChecks(runtime) {
  const errors = [];
  const fixture = runtime.evaluate(`(() => {
    resetRunState();
    state.affinity.elias = 20;
    const before = {
      recovered: isRecovered("jiro"),
      alive: isAlive("jiro"),
      affinity: state.affinity.jiro,
      text: scenes.cut_out.text
    };
    const choice = scenes.crisis.choices.find(item => item.next === "cut_out");
    makeChoice(choice);
    return {
      before,
      after: {
        scene: state.scene,
        jiroAffinity: state.affinity.jiro,
        amaraAffinity: state.affinity.amara,
        selaAffinity: state.affinity.sela,
        eliasAffinity: state.affinity.elias
      }
    };
  })()`);

  if (fixture.before.recovered || fixture.before.alive) {
    errors.push("early-crisis ET-02 fixture unexpectedly has Jiro present");
  }
  if (/third body|Jiro/i.test(fixture.before.text)) {
    errors.push("cut_out prose implies unrecovered Jiro was present in the lower ring");
  }
  if (fixture.after.jiroAffinity !== fixture.before.affinity) {
    errors.push(`cut_out choice changed unrecovered Jiro affinity ${fixture.before.affinity} -> ${fixture.after.jiroAffinity}`);
  }
  if (fixture.after.scene !== "cut_out" || fixture.after.amaraAffinity !== 10 || fixture.after.selaAffinity !== 10 || fixture.after.eliasAffinity !== 14) {
    errors.push("cut_out presence repair changed the authored route or present-crew affinity effects");
  }
  return errors;
}

function vaultPriorityChecks(runtime) {
  const errors = [];
  const fixtures = runtime.evaluate(`(() => {
    return ["living", "both", "future"].map(priority => {
      resetRunState();
      state.flags.vault_priority = priority;
      const choice = scenes.lena_dying.choices.find(item => /vault should outrank/i.test(item.text));
      makeChoice(choice);
      return {
        priority,
        after: state.flags.vault_priority,
        scene: state.scene,
        cohesion: state.cohesion,
        futureLean: state.ideology.future
      };
    });
  })()`);

  for (const fixture of fixtures) {
    if (fixture.after !== fixture.priority) {
      errors.push(`late Lena choice clobbered vault_priority ${fixture.priority} -> ${fixture.after}`);
    }
    if (fixture.scene !== "prom_make_lena" || fixture.cohesion !== 46 || fixture.futureLean !== 2) {
      errors.push(`L-022 repair changed Lena choice behavior for vault_priority=${fixture.priority}`);
    }
  }
  return errors;
}

function pairShieldReachabilityChecks(runtime) {
  const errors = [];
  const fixture = runtime.evaluate(`(() => {
    const inspectFreshEntry = setup => {
      resetRunState();
      setup();
      const memoriesBefore = state.memories.length;
      showScene("pair_shield_cold");
      return {
        scene: state.scene,
        pairSpent: state.flags.pair_shield === true,
        memoriesAdded: state.memories.length - memoriesBefore
      };
    };
    const inspectSavedEntry = setup => {
      resetRunState();
      setup();
      const memoriesBefore = state.memories.length;
      showScene("pair_shield_cold", { skipOnEnter: true, resume: true });
      return {
        scene: state.scene,
        text: String(scenes.pair_shield_cold.text),
        image: resolveSceneImage("pair_shield_cold", scenes.pair_shield_cold),
        next: scenes.pair_shield_cold.choices[0].next,
        memoriesAdded: state.memories.length - memoriesBefore
      };
    };

    resetRunState();
    state.crisisPath = "breath";
    state.flags.junctionChoice = "lena";
    state.recovered.vess = true;
    showScene("act3_lethal_mira_end");
    const lethalNext = scenes.act3_lethal_mira_end.choices[0].next;
    makeChoice(scenes.act3_lethal_mira_end.choices[0]);
    const pairScene = state.scene;
    const pairSpent = state.flags.pair_shield === true;
    const pairNext = scenes.pair_shield_cold.choices[0].next;
    makeChoice(scenes.pair_shield_cold.choices[0]);
    const finalScene = state.scene;
    const offeredAgain = scenes.act3_spine_next.choices.some(choice => choice.next === "pair_shield_cold");

    resetRunState();
    state.crisisPath = "breath";
    state.flags.junctionChoice = "lena";
    kill("mira", "finished the repair");
    showScene("act3_lethal_mira_end");
    const resumedScene = state.scene;

    resetRunState();
    state.crisisPath = "breath";
    state.flags.junctionChoice = "lena";
    kill("elias", "held the line");
    showScene("act3_lethal_mira_end");
    const noEliasNext = scenes.act3_lethal_mira_end.choices[0].next;

    const freshMiraAlive = inspectFreshEntry(() => {});
    const freshEliasDead = inspectFreshEntry(() => {
      kill("mira", "finished the repair");
      kill("elias", "held the line");
    });
    const freshUnattributable = inspectFreshEntry(() => kill("mira", "illness"));
    const freshSpent = inspectFreshEntry(() => {
      kill("mira", "finished the repair");
      state.flags.pair_shield = true;
    });

    const savedMiraAlive = inspectSavedEntry(() => {});
    const savedEliasDead = inspectSavedEntry(() => {
      kill("mira", "finished the repair");
      kill("elias", "held the line");
    });
    const savedUnattributable = inspectSavedEntry(() => kill("mira", "illness"));
    const savedEligible = inspectSavedEntry(() => {
      kill("mira", "finished the repair");
      state.flags.pair_shield = true;
      remember("Elias said she was what the job was for");
    });

    return {
      lethalNext, pairScene, pairSpent, pairNext, finalScene, offeredAgain, resumedScene, noEliasNext,
      freshMiraAlive, freshEliasDead, freshUnattributable, freshSpent,
      savedMiraAlive, savedEliasDead, savedUnattributable, savedEligible
    };
  })()`);

  if (fixture.lethalNext !== "pair_shield_cold" || fixture.pairScene !== "pair_shield_cold" || !fixture.pairSpent) {
    errors.push("L-020 consequence is not reached immediately after Mira's attributable lethal path");
  }
  if (fixture.pairNext !== "faction_split" || fixture.finalScene !== "faction_split") {
    errors.push("pair_shield_cold does not return to faction_split after the one-shot consequence");
  }
  if (fixture.offeredAgain) errors.push("pair_shield_cold remained eligible after its one-shot flag was spent");
  if (fixture.resumedScene !== "pair_shield_cold") {
    errors.push("resuming the saved Mira-lethal scene skipped the unspent L-020 consequence");
  }
  if (fixture.noEliasNext !== "faction_split") {
    errors.push("Mira's lethal path routes to pair_shield_cold without a living Elias");
  }
  for (const [label, row] of Object.entries({
    miraAlive: fixture.freshMiraAlive,
    eliasDead: fixture.freshEliasDead,
    unattributableMiraDeath: fixture.freshUnattributable,
    alreadySpent: fixture.freshSpent
  })) {
    if (row.scene === "pair_shield_cold" || row.memoriesAdded !== 0) {
      errors.push(`pair_shield_cold fresh ${label} entry did not redirect without consuming the consequence`);
    }
  }
  if (fixture.freshMiraAlive.pairSpent || fixture.freshEliasDead.pairSpent || fixture.freshUnattributable.pairSpent) {
    errors.push("invalid pair_shield_cold fresh entry spent the one-shot flag");
  }
  for (const [label, row] of Object.entries({
    miraAlive: fixture.savedMiraAlive,
    eliasDead: fixture.savedEliasDead,
    unattributableMiraDeath: fixture.savedUnattributable
  })) {
    if (row.scene !== "pair_shield_cold" || row.next !== "faction_split" || row.image !== "images/corridor_variant.jpg" || /\bElias\b|\bMira\b|\"/.test(row.text) || row.memoriesAdded !== 0) {
      errors.push(`pair_shield_cold saved ${label} entry rendered an ineligible speaker, image, write, or exit`);
    }
  }
  if (fixture.savedEligible.scene !== "pair_shield_cold" || fixture.savedEligible.image !== "images/elias.jpg" || !fixture.savedEligible.text.includes("Elias gives the watch report") || fixture.savedEligible.memoriesAdded !== 0) {
    errors.push("eligible completed pair_shield_cold save did not resume without repeating entry writes");
  }
  return errors;
}

function renderPurityChecks(runtime) {
  const errors = [];
  const fixture = runtime.evaluate(`(() => {
    const readText = scene => {
      const descriptor = Object.getOwnPropertyDescriptor(scene, "text");
      if (descriptor && typeof descriptor.get === "function") return descriptor.get.call(scene);
      const value = descriptor ? descriptor.value : scene.text;
      return typeof value === "function" ? value() : value;
    };
    const renderTwice = scene => {
      const before = JSON.stringify(state);
      const first = readText(scene);
      const afterFirst = JSON.stringify(state);
      const second = readText(scene);
      const afterSecond = JSON.stringify(state);
      return {
        first,
        second,
        firstPure: before === afterFirst,
        secondPure: afterFirst === afterSecond
      };
    };

    resetRunState();
    state.promises.elias = "made";
    state.promises.amara = "made";
    scenes.act2_tether_sighting.onEnter();
    const tether = renderTwice(scenes.act2_tether_sighting);
    const tetherFlags = {
      elias: state.flags.prom_elias_alluded,
      amara: state.flags.prom_amara_alluded
    };

    resetRunState();
    state.promises.mira = "made";
    state.promises.lena = "made";
    state.promises.sela = "made";
    scenes.act3_reckoning_pattern.onEnter();
    const reckoning = renderTwice(scenes.act3_reckoning_pattern);
    const reckoningFlags = {
      mira: state.flags.prom_mira_alluded,
      lena: state.flags.prom_lena_alluded,
      sela: state.flags.prom_sela_alluded
    };

    resetRunState();
    state.recovered.tomas = true;
    state.recovered.vess = true;
    state.promises.tomas = "made";
    const spineRedirect = scenes.act3_spine_next.onEnter();
    const spine = renderTwice(scenes.act3_spine_next);
    const tomasFlag = state.flags.prom_tomas_alluded;

    resetRunState();
    state.affinity.amara = 20;
    kill("lena", "resources diverted to the vault");
    scenes.offshift_amara.onEnter();
    const offeredMemoryAfterEntry = state.memories.slice();
    const offered = renderTwice(scenes.offshift_amara);
    const offeredMemoryAfterRender = state.memories.slice();

    resetRunState();
    kill("lena", "resources diverted to the vault");
    scenes.offshift_amara.onEnter();
    scenes.offshift_amara.onEnter();
    const withheldMemoryAfterEntries = state.memories.slice();
    const withheld = renderTwice(scenes.offshift_amara);
    const withheldMemoryAfterRender = state.memories.slice();

    const wholeRuntimeMutations = [];
    for (const id of Object.keys(scenes)) {
      resetRunState();
      const before = JSON.stringify(state);
      readText(scenes[id]);
      if (JSON.stringify(state) !== before) wholeRuntimeMutations.push(id);
    }

    return {
      tether,
      tetherFlags,
      reckoning,
      reckoningFlags,
      spine,
      spineRedirect: spineRedirect || null,
      tomasFlag,
      offered,
      offeredMemoryAfterEntry,
      offeredMemoryAfterRender,
      withheld,
      withheldMemoryAfterEntries,
      withheldMemoryAfterRender,
      wholeRuntimeMutations
    };
  })()`);

  for (const [label, result] of [
    ["act2_tether_sighting", fixture.tether],
    ["act3_reckoning_pattern", fixture.reckoning],
    ["act3_spine_next", fixture.spine],
    ["offshift_amara offered", fixture.offered],
    ["offshift_amara withheld", fixture.withheld]
  ]) {
    if (!result.firstPure || !result.secondPure) errors.push(`${label} text rendering mutates state`);
    if (result.first !== result.second) errors.push(`${label} repeated rendering changes text`);
  }

  if (!fixture.tetherFlags.elias || !fixture.tetherFlags.amara) {
    errors.push("tether promise allusions were not consumed on entry");
  }
  if (!fixture.tether.first.includes("Deck Four pushed back another fragment") ||
      !fixture.tether.first.includes("The beds are holding")) {
    errors.push("tether promise allusion prose did not render on its consumed entry");
  }
  if (!fixture.reckoningFlags.mira || !fixture.reckoningFlags.lena || !fixture.reckoningFlags.sela) {
    errors.push("reckoning promise allusions were not consumed on entry");
  }
  for (const needle of ["Junction eleven quoted the dead", "Inventory: one promise", "I have inventoried what you have given me"]) {
    if (!fixture.reckoning.first.includes(needle)) errors.push(`reckoning promise allusion missing: ${needle}`);
  }
  if (fixture.spineRedirect || !fixture.tomasFlag || !fixture.spine.first.includes("Names first, then numbers")) {
    errors.push("Tomas promise allusion did not consume and render on the non-redirected spine entry");
  }

  const offeredMemory = "Amara offered absolution for Dr. Lena Voss";
  const withheldMemory = "Amara withheld absolution for Dr. Lena Voss";
  if (fixture.offeredMemoryAfterEntry.length !== 1 || fixture.offeredMemoryAfterEntry[0] !== offeredMemory) {
    errors.push(`offshift_amara offered entry memory mismatch: ${fixture.offeredMemoryAfterEntry.join(" | ")}`);
  }
  if (!sameArray(fixture.offeredMemoryAfterEntry, fixture.offeredMemoryAfterRender)) {
    errors.push("offshift_amara offered rendering changed memories");
  }
  if (fixture.withheldMemoryAfterEntries.length !== 1 || fixture.withheldMemoryAfterEntries[0] !== withheldMemory) {
    errors.push(`offshift_amara withheld entry memory mismatch: ${fixture.withheldMemoryAfterEntries.join(" | ")}`);
  }
  if (!sameArray(fixture.withheldMemoryAfterEntries, fixture.withheldMemoryAfterRender)) {
    errors.push("offshift_amara withheld rendering changed memories");
  }
  if (fixture.wholeRuntimeMutations.length) {
    errors.push(`runtime text renderers mutated state: ${fixture.wholeRuntimeMutations.join(", ")}`);
  }
  return errors;
}

function resourceFeedbackChecks(runtime) {
  const errors = [];
  const fixture = runtime.evaluate(`(() => {
    const reasonForChoice = (sceneId, choiceText) => {
      document.getElementById("choices").children = [];
      showScene(sceneId);
      const button = document.getElementById("choices").children.find(child => child.innerHTML.includes(choiceText));
      if (!button) return { found: false, disabled: null, reason: "" };
      const match = button.innerHTML.match(/<span class="choice-reason">([^<]*)<\\/span>/);
      return { found: true, disabled: button.disabled, reason: match ? match[1] : "" };
    };

    const statusCases = [];
    for (const value of [0, 29, 30, 59, 60, 100]) {
      resetRunState();
      state.integrity = value;
      state.cohesion = value;
      state.supplies = value;
      state.embryos = value;
      renderStatus();
      statusCases.push({
        value,
        integrity: { text: document.getElementById("stat-integrity").textContent, className: document.getElementById("stat-integrity").className },
        cohesion: { text: document.getElementById("stat-cohesion").textContent, className: document.getElementById("stat-cohesion").className },
        supplies: { text: document.getElementById("stat-supplies").textContent, className: document.getElementById("stat-supplies").className },
        embryos: { text: document.getElementById("stat-embryos").textContent, className: document.getElementById("stat-embryos").className }
      });
    }

    resetRunState();
    state.survivors = 2;
    renderStatus();
    const survivors = {
      text: String(document.getElementById("stat-survivors").textContent),
      className: document.getElementById("stat-survivors").className
    };

    resetRunState();
    state.trust.mira = 40;
    state.cohesion = 0;
    const vaultUnpaid = reasonForChoice("vault_voice", "Restrict access.");

    resetRunState();
    state.trust.mira = 40;
    state.cohesion = 1;
    const vaultExact = reasonForChoice("vault_voice", "Restrict access.");

    resetRunState();
    state.trust.mira = 39;
    state.cohesion = 10;
    const vaultTrust = reasonForChoice("vault_voice", "Restrict access.");

    resetRunState();
    state.embryos = 55;
    state.integrity = 3;
    state.cohesion = 8;
    state.supplies = 2;
    const conservation = reasonForChoice("arc_future_2", "Lock conservation mode.");

    resetRunState();
    state.cohesion = 98;
    const clampedPositive = formatEffectsHtml({ cohesion: 5 });

    return { statusCases, survivors, vaultUnpaid, vaultExact, vaultTrust, conservation, clampedPositive };
  })()`);

  for (const statusCase of fixture.statusCases) {
    const expectedClass = statusCase.value < 30 ? "low" : statusCase.value < 60 ? "mid" : "high";
    for (const key of ["integrity", "cohesion", "supplies", "embryos"]) {
      const rendered = statusCase[key];
      if (rendered.text !== `${statusCase.value}%`) {
        errors.push(`${key} status text ${JSON.stringify(rendered.text)} != ${statusCase.value}%`);
      }
      if (rendered.className !== `stat-value ${expectedClass}`) {
        errors.push(`${key} status class ${JSON.stringify(rendered.className)} != stat-value ${expectedClass}`);
      }
    }
  }
  if (fixture.survivors.text !== "2" || fixture.survivors.className !== "stat-value") {
    errors.push(`Survivors status is not neutral: text=${JSON.stringify(fixture.survivors.text)} class=${JSON.stringify(fixture.survivors.className)}`);
  }
  if (!fixture.vaultUnpaid.found || !fixture.vaultUnpaid.disabled || fixture.vaultUnpaid.reason !== "Needs 1 Cohesion; 0 available") {
    errors.push(`vault_voice unpaid reason mismatch: ${JSON.stringify(fixture.vaultUnpaid)}`);
  }
  if (!fixture.vaultExact.found || fixture.vaultExact.disabled || fixture.vaultExact.reason) {
    errors.push(`vault_voice exact-cost boundary mismatch: ${JSON.stringify(fixture.vaultExact)}`);
  }
  if (!fixture.vaultTrust.disabled || fixture.vaultTrust.reason !== "Needs more trust from Mira") {
    errors.push(`vault_voice hidden-trust reason mismatch: ${JSON.stringify(fixture.vaultTrust)}`);
  }
  if (!fixture.conservation.disabled || fixture.conservation.reason !== "Needs 4 Hull; 3 available") {
    errors.push(`arc_future_2 deterministic public-resource reason mismatch: ${JSON.stringify(fixture.conservation)}`);
  }
  if (!fixture.clampedPositive.includes("+2 Cohesion (clamped)")) {
    errors.push(`clamped positive effect display changed: ${JSON.stringify(fixture.clampedPositive)}`);
  }
  return errors;
}

function sameTapPaymentChecks(runtime) {
  const errors = [];
  const fixture = runtime.evaluate(`(() => {
    const statKeys = ["integrity", "cohesion", "supplies", "embryos"];
    const ideologyKeys = ["future", "living"];
    const snapshot = () => ({
      stats: statKeys.map(key => state[key]),
      ideology: ideologyKeys.map(key => state.ideology[key] || 0)
    });
    const delta = (before, after) => ({
      stats: after.stats.map((value, index) => value - before.stats[index]),
      ideology: after.ideology.map((value, index) => value - before.ideology[index])
    });
    const choicesFor = sceneId => {
      const raw = scenes[sceneId].choices;
      return typeof raw === "function" ? raw.call(scenes[sceneId]) : raw;
    };
    const routes = [
      { id: "racks", hub: "breath_hub", child: "breath_racks", effects: { embryos: -12, cohesion: -2 }, lean: null, answer: "racks" },
      { id: "garden", hub: "breath_hub", child: "breath_garden", effects: { supplies: -6, cohesion: -1 }, lean: { living: 1 }, answer: "garden" },
      { id: "blacksleep", hub: "breath_hub", child: "breath_blacksleep", effects: { supplies: -4, cohesion: 1 }, lean: { living: 1 }, answer: "blacksleep" },
      { id: "thaw", hub: "custody_hub", child: "custody_thaw", effects: { embryos: -14, cohesion: -1 }, lean: null, answer: "thawed" },
      { id: "severed", hub: "custody_hub", child: "custody_severed", effects: { integrity: -2, cohesion: 1 }, lean: { future: 1 }, answer: "severed" }
    ];

    const fresh = routes.map(route => {
      localStorage.clear();
      resetRunState();
      showScene(route.hub);
      const hubChoice = choicesFor(route.hub).find(choice => choice.next === route.child);
      const childChoice = choicesFor(route.child)[0];
      const before = snapshot();
      makeChoice(hubChoice);
      const afterTap = snapshot();
      const saved = JSON.parse(localStorage.getItem(SAVE_KEY));
      const liveSceneAfterTap = state.scene;
      const answer = route.hub === "breath_hub" ? state.flags.breath_answer : state.flags.custody_answer;
      const roll = route.hub === "custody_hub" ? state.flags.custody_roll : null;
      makeChoice(childChoice);
      const afterAck = snapshot();
      return {
        id: route.id,
        sceneAfterTap: saved.scene,
        liveSceneAfterTap,
        answer,
        roll,
        hubEffects: hubChoice.effects || null,
        hubLean: hubChoice.lean || null,
        childEffects: childChoice.effects || null,
        childLean: childChoice.lean || null,
        tapDelta: delta(before, afterTap),
        ackDelta: delta(afterTap, afterAck),
        savedStats: statKeys.map(key => saved[key]),
        savedIdeology: ideologyKeys.map(key => saved.ideology[key] || 0),
        afterTap
      };
    });

    const legacy = routes.map(route => {
      localStorage.clear();
      resetRunState();
      showScene(route.child);
      const parked = snapshotState();
      localStorage.setItem(SAVE_KEY, JSON.stringify(parked));
      resetRunState();
      const loaded = loadGame();
      const before = snapshot();
      makeChoice(choicesFor(route.child)[0]);
      const after = snapshot();
      return { id: route.id, loaded, delta: delta(before, after), destination: state.scene };
    });

    localStorage.clear();
    resetRunState();
    state.embryos = 14;
    state.cohesion = 1;
    showScene("custody_hub");
    makeChoice(choicesFor("custody_hub").find(choice => choice.next === "custody_thaw"));
    const exactThreshold = {
      scene: state.scene,
      embryos: state.embryos,
      cohesion: state.cohesion,
      answer: state.flags.custody_answer,
      roll: state.flags.custody_roll
    };

    return { fresh, legacy, exactThreshold };
  })()`);

  const expected = {
    racks: { stats: [0, -2, 0, -12], ideology: [0, 0], effects: { embryos: -12, cohesion: -2 }, lean: null, answer: "racks" },
    garden: { stats: [0, -1, -6, 0], ideology: [0, 1], effects: { supplies: -6, cohesion: -1 }, lean: { living: 1 }, answer: "garden" },
    blacksleep: { stats: [0, 1, -4, 0], ideology: [0, 1], effects: { supplies: -4, cohesion: 1 }, lean: { living: 1 }, answer: "blacksleep" },
    thaw: { stats: [0, -1, 0, -14], ideology: [0, 0], effects: { embryos: -14, cohesion: -1 }, lean: null, answer: "thawed", roll: true },
    severed: { stats: [-2, 1, 0, 0], ideology: [1, 0], effects: { integrity: -2, cohesion: 1 }, lean: { future: 1 }, answer: "severed", roll: true }
  };
  const same = (left, right) => JSON.stringify(left) === JSON.stringify(right);
  for (const route of fixture.fresh) {
    const want = expected[route.id];
    if (!same(route.hubEffects, want.effects) || !same(route.hubLean, want.lean)) {
      errors.push(`${route.id} committing choice does not own its exact effects/lean`);
    }
    if (route.childEffects !== null || route.childLean !== null) {
      errors.push(`${route.id} forced acknowledgement still carries delayed effects/lean`);
    }
    if (!same(route.tapDelta, { stats: want.stats, ideology: want.ideology })) {
      errors.push(`${route.id} did not apply the exact consequence on the committing tap`);
    }
    if (!same(route.ackDelta, { stats: [0, 0, 0, 0], ideology: [0, 0] })) {
      errors.push(`${route.id} acknowledgement applied a second consequence`);
    }
    if (route.sceneAfterTap !== route.liveSceneAfterTap || route.answer !== want.answer || route.roll !== (want.roll || null)) {
      errors.push(`${route.id} post-tap scene/answer custody drifted`);
    }
    if (!same(route.savedStats, route.afterTap.stats) || !same(route.savedIdeology, route.afterTap.ideology)) {
      errors.push(`${route.id} autosave did not preserve the paid post-tap state`);
    }
  }
  for (const route of fixture.legacy) {
    if (!route.loaded || route.destination !== (route.id === "racks" || route.id === "garden" || route.id === "blacksleep" ? "breath_after" : "custody_after")) {
      errors.push(`${route.id} parked legacy save did not resume through its acknowledgement`);
    }
    if (!same(route.delta, { stats: [0, 0, 0, 0], ideology: [0, 0] })) {
      errors.push(`${route.id} parked legacy save was retroactively charged`);
    }
  }
  if (!same(fixture.exactThreshold, { scene: "custody_thaw", embryos: 0, cohesion: 0, answer: "thawed", roll: true })) {
    errors.push("custody_thaw exact-threshold payment redirected after a valid committing tap");
  }
  return errors;
}

function romanceOpenGateChecks(runtime) {
  const errors = [];
  const fixtures = runtime.evaluate(`(() => {
    const keys = ["mira", "amara", "sela", "lena"];
    const result = {};
    for (const who of keys) {
      resetRunState();
      for (const other of keys) if (other !== who) mark(other, "declined");
      state.promises[who] = "broken";
      result[who] = {
        brokenOpen: romanceOpen(who),
        brokenText: scenes.intimacy_window.text,
        brokenRoutes: scenes.intimacy_window.choices.map(choice => choice.next)
      };

      resetRunState();
      for (const other of keys) if (other !== who) mark(other, "declined");
      state.promises[who] = "made";
      result[who].madeOpen = romanceOpen(who);
      result[who].madeText = scenes.intimacy_window.text;
      result[who].madeRoutes = scenes.intimacy_window.choices.map(choice => choice.next);
      result[who].firstName = crew[who].first;
    }
    resetRunState();
    state.recovered.tomas = true;
    state.flags.hydro = "full";
    for (const who of keys) if (who !== "amara") mark(who, "declined");
    state.romance.amara_tomas = true;
    result.amaraTomasGroup = {
      amaraOpen: romanceOpen("amara"),
      routes: scenes.intimacy_window.choices.map(choice => choice.next),
      summary: scenes.reckon_summary.text
    };

    resetRunState();
    state.recovered.tomas = true;
    state.flags.hydro = "full";
    const privacyChoice = scenes.romance_amara_tomas.choices.find(choice => choice.text === "Leave them the privacy they have claimed.");
    const cohesionBeforePrivacy = state.cohesion;
    if (privacyChoice) makeChoice(privacyChoice);
    result.amaraTomasPrivacy = {
      choicePresent: !!privacyChoice,
      route: privacyChoice && privacyChoice.next,
      scene: state.scene,
      cohesionDelta: state.cohesion - cohesionBeforePrivacy,
      amaraAffinity: state.affinity.amara,
      tomasAffinity: state.affinity.tomas
    };

    resetRunState();
    for (const who of keys) if (who !== "mira") mark(who, "declined");
    const miraHeldOnlyChoice = scenes.bond_mira.choices.find(choice => choice.mark && choice.mark.mira === "held_only");
    const miraHeldOnlyBefore = {
      cohesion: state.cohesion,
      affinity: state.affinity.mira,
      trust: state.trust.mira
    };
    if (miraHeldOnlyChoice) makeChoice(miraHeldOnlyChoice);
    result.miraHeldOnly = {
      choicePresent: !!miraHeldOnlyChoice,
      scene: state.scene,
      open: romanceOpen("mira"),
      routes: scenes.intimacy_window.choices.map(choice => choice.next),
      cohesionDelta: state.cohesion - miraHeldOnlyBefore.cohesion,
      affinityDelta: state.affinity.mira - miraHeldOnlyBefore.affinity,
      trustDelta: state.trust.mira - miraHeldOnlyBefore.trust
    };
    return result;
  })()`);

  for (const who of ["mira", "amara", "sela", "lena"]) {
    const fixture = fixtures[who];
    const expectedRoute = `bond_${who}`;
    if (fixture.brokenOpen) errors.push(`${who} romanceOpen stayed true after a broken promise`);
    if (fixture.brokenText.includes(fixture.firstName)) errors.push(`${who} remains advertised in intimacy_window after a broken promise`);
    if (fixture.brokenRoutes.includes(expectedRoute)) errors.push(`${who} remains selectable in intimacy_window after a broken promise`);
    if (!fixture.madeOpen) errors.push(`${who} romanceOpen rejected the made-promise control`);
    if (!fixture.madeText.includes(fixture.firstName)) errors.push(`${who} disappeared from intimacy_window made-promise control text`);
    if (!fixture.madeRoutes.includes(expectedRoute)) errors.push(`${who} disappeared from intimacy_window made-promise control choices`);
  }
  if (fixtures.amaraTomasGroup.amaraOpen) {
    errors.push("Amara solo first-offer remains open after the Amara-Tomas group relationship");
  }
  if (fixtures.amaraTomasGroup.routes.includes("bond_amara")) {
    errors.push("intimacy_window still offers bond_amara after the Amara-Tomas group relationship");
  }
  if (!fixtures.amaraTomasGroup.summary.includes("Amara and Tomas claimed something private")) {
    errors.push("reckon_summary omits the current-run Amara-Tomas group relationship fact");
  }
  if (!fixtures.amaraTomasPrivacy.choicePresent || fixtures.amaraTomasPrivacy.route !== "debt_notice" || fixtures.amaraTomasPrivacy.scene !== "debt_notice") {
    errors.push("Amara-Tomas privacy exit does not close the private hours at debt_notice");
  }
  if (fixtures.amaraTomasPrivacy.cohesionDelta !== 3 || fixtures.amaraTomasPrivacy.amaraAffinity !== 4 || fixtures.amaraTomasPrivacy.tomasAffinity !== 4) {
    errors.push("Amara-Tomas privacy exit no longer applies its one-time authored payoff");
  }
  if (!fixtures.miraHeldOnly.choicePresent || fixtures.miraHeldOnly.scene !== "intimacy_window") {
    errors.push("Mira held-only choice no longer returns to the authored intimacy window");
  }
  if (fixtures.miraHeldOnly.open || fixtures.miraHeldOnly.routes.includes("bond_mira")) {
    errors.push("Mira held-only choice still reopens bond_mira in intimacy_window");
  }
  if (fixtures.miraHeldOnly.cohesionDelta !== 2 || fixtures.miraHeldOnly.affinityDelta !== 8 || fixtures.miraHeldOnly.trustDelta !== 8) {
    errors.push("Mira held-only choice no longer applies its one-time authored payoff");
  }
  return errors;
}

function lastTransmissionChecks(runtime) {
  const errors = [];
  const fixture = runtime.evaluate(`(() => {
    const transmissionText = "Turn the ship. Send a final transmission into the dark and then go quiet.";
    const finalTransmission = () => scenes.final_choice.choices.find(choice => choice.text === transmissionText);
    const hasOffshiftAnswer = () => scenes.offshift_vess.choices.some(choice => choice.text === "Answer it.");

    resetRunState();
    state.integrity = 20;
    const unspentChoice = finalTransmission();
    const unspentAllowedAt20 = unspentChoice ? meetsRequirements(unspentChoice.requires) : false;
    state.integrity = 19;
    const unspentAllowedAt19 = unspentChoice ? meetsRequirements(unspentChoice.requires) : true;

    state.integrity = 20;
    state.flags.last_tx_spent = true;
    const spentChoice = finalTransmission();

    state.flags.last_tx_spent = false;
    const offshiftUnspentHasAnswer = hasOffshiftAnswer();
    state.flags.last_tx_spent = true;
    const offshiftSpentHasAnswer = hasOffshiftAnswer();

    return {
      unspentChoice: unspentChoice ? {
        final: unspentChoice.flag && unspentChoice.flag.final,
        integrityMin: unspentChoice.requires && unspentChoice.requires.integrity && unspentChoice.requires.integrity.min
      } : null,
      unspentAllowedAt20,
      unspentAllowedAt19,
      spentChoicePresent: Boolean(spentChoice),
      offshiftUnspentHasAnswer,
      offshiftSpentHasAnswer
    };
  })()`);

  if (!fixture.unspentChoice) errors.push("unspent final_choice lost the final transmission option");
  if (fixture.unspentChoice?.final !== "transmission") errors.push("unspent final transmission no longer writes final=transmission");
  if (fixture.unspentChoice?.integrityMin !== 20) errors.push(`final transmission integrity minimum ${fixture.unspentChoice?.integrityMin} != 20`);
  if (!fixture.unspentAllowedAt20 || fixture.unspentAllowedAt19) {
    errors.push("final transmission integrity threshold is not enforced at 20");
  }
  if (fixture.spentChoicePresent) errors.push("spent last_tx still offers the final transmission option");
  if (!fixture.offshiftUnspentHasAnswer || fixture.offshiftSpentHasAnswer) {
    errors.push("offshift_vess no longer honors the last_tx_spent Answer-it guard");
  }
  return errors;
}

function vessTransmissionReplayChecks(runtime) {
  const errors = [];
  const fixture = runtime.evaluate(`(() => {
    resetRunState();
    state.recovered.vess = true;
    state.flags.last_tx_spent = true;
    showScene("vess_transmission");
    const spent = {
      scene: state.scene,
      romance: !!state.romance.vess,
      cohesion: state.cohesion,
      affinity: state.affinity.vess,
      memories: state.memories.slice()
    };

    resetRunState();
    state.recovered.vess = true;
    showScene("vess_transmission");
    const choice = scenes.vess_transmission.choices.find(item => item.text === "Give her the window. Last outward voice.");
    const unspentEntry = {
      scene: state.scene,
      romance: !!state.romance.vess,
      choicePresent: !!choice
    };
    if (choice) makeChoice(choice);
    const unspentChoice = {
      scene: state.scene,
      spent: !!state.flags.last_tx_spent,
      cohesion: state.cohesion,
      affinity: state.affinity.vess,
      memoryPresent: state.memories.includes("Shared the last long-range window and a private hour with Vess.")
    };
    return { spent, unspentEntry, unspentChoice };
  })()`);

  if (fixture.spent.scene !== "act3_spine_next") errors.push("spent last_tx re-enters vess_transmission");
  if (fixture.spent.romance || fixture.spent.cohesion !== 48 || fixture.spent.affinity !== 0 || fixture.spent.memories.length) {
    errors.push("spent last_tx mutates Vess romance, rewards, or memories on replay");
  }
  if (fixture.unspentEntry.scene !== "vess_transmission" || !fixture.unspentEntry.romance || !fixture.unspentEntry.choicePresent) {
    errors.push("unspent living-Vess transmission route no longer enters normally");
  }
  if (fixture.unspentChoice.scene !== "vess_intimate" || !fixture.unspentChoice.spent || fixture.unspentChoice.cohesion !== 49 || fixture.unspentChoice.affinity !== 4 || !fixture.unspentChoice.memoryPresent) {
    errors.push("unspent Vess transmission choice no longer spends the window and preserves its authored payoff");
  }
  return errors;
}

function vessCourseRetirementChecks(runtime) {
  const errors = [];
  const scenesSource = readFileSync(resolve(ROOT, "src/scenes-16.js"), "utf8");
  const validatorSource = readFileSync(resolve(ROOT, "src/validate.js"), "utf8");
  const fixture = runtime.evaluate(`(() => {
    const renderText = id => typeof scenes[id].text === "function" ? scenes[id].text() : scenes[id].text;

    resetRunState();
    kill("mira", "L-027 fixture");
    const signalWithoutMira = renderText("vess_signal");

    resetRunState();
    const redirect = scenes.vess_cost.onEnter();
    const cost = {
      redirect: redirect || null,
      text: renderText("vess_cost"),
      busDowngraded: state.flags.busDowngraded,
      reactionMassSpent: state.flags.reaction_mass_spent,
      hasRetiredFlag: Object.prototype.hasOwnProperty.call(state.flags, "vess_course_lost"),
      memories: state.memories.slice(),
      choices: scenes.vess_cost.choices.map(choice => ({
        next: choice.next,
        effects: choice.effects || null
      }))
    };

    const legacy = snapshotState();
    legacy.flags.vess_course_lost = true;
    resetRunState();
    const loaded = applySnapshot(legacy);
    const hasLegacyAfterLoad = Object.prototype.hasOwnProperty.call(state.flags, "vess_course_lost");
    const hasLegacyAfterResave = Object.prototype.hasOwnProperty.call(snapshotState().flags, "vess_course_lost");

    return { signalWithoutMira, cost, loaded, hasLegacyAfterLoad, hasLegacyAfterResave };
  })()`);

  if (scenesSource.includes("vess_course_lost")) errors.push("vess scenes still write the retired vess_course_lost flag");
  if (validatorSource.includes('"vess_course_lost"')) errors.push("validator still exempts retired vess_course_lost as an engine flag");
  if (/late course|held back for a late/i.test(`${fixture.signalWithoutMira}\n${fixture.cost.text}`)) {
    errors.push("Vess recovery copy still promises an unavailable downstream course option");
  }
  if (fixture.cost.hasRetiredFlag) errors.push("vess_cost still creates vess_course_lost");
  if (!fixture.cost.busDowngraded || !fixture.cost.reactionMassSpent) {
    errors.push("Vess recovery no longer preserves busDowngraded and reaction_mass_spent");
  }
  if (fixture.cost.redirect !== null) errors.push(`vess_cost unexpectedly redirects to ${fixture.cost.redirect}`);
  if (fixture.cost.choices.length !== 2 || fixture.cost.choices.some(choice => choice.next !== "vess_boarding")) {
    errors.push("vess_cost no longer preserves both boarding routes");
  }
  const paidEffects = fixture.cost.choices[0]?.effects;
  if (paidEffects?.supplies !== -3 || paidEffects?.integrity !== -1 || fixture.cost.choices[1]?.effects !== null) {
    errors.push("vess_cost no longer preserves its paid and rough-seal costs");
  }
  if (!fixture.cost.memories.some(memory => memory.includes("recover Vess from Dawnbreak"))) {
    errors.push("Vess recovery memory was lost");
  }
  if (!fixture.loaded || fixture.hasLegacyAfterLoad || fixture.hasLegacyAfterResave) {
    errors.push("legacy vess_course_lost survives load or resave");
  }
  return errors;
}

function commanderIdentityChecks(runtime) {
  const errors = [];
  const fixture = runtime.evaluate(`(() => {
    const renderText = id => typeof scenes[id].text === "function" ? scenes[id].text() : scenes[id].text;

    resetRunState();
    state.romance.amara = true;
    const amaraAfterglow = renderText("prom_make_amara_ag");

    resetRunState();
    const lenaPromise = renderText("prom_make_lena");

    resetRunState();
    state.flags.manifest_lie = true;
    const tomasManifest = renderText("prom_make_tomas");

    resetRunState();
    state.recovered.tomas = true;
    state.promises.tomas = "declined";
    const tomasDeclined = renderText("prom_r_tomas");

    resetRunState();
    state.romance.lena = true;
    state.affinity.lena = 40;
    const debtNotice = renderText("debt_notice");

    return { amaraAfterglow, lenaPromise, tomasManifest, tomasDeclined, debtNotice };
  })()`);

  const cases = [
    ["Amara afterglow", fixture.amaraAfterglow, "men make speeches", "you're meant to make a speech"],
    ["Lena promise", fixture.lenaPromise, "kind of man who reaches", "you reach for the scalpel that saves what you love"],
    ["Tomas manifest", fixture.tomasManifest, "asking the man who shares my books", "asking the one who shares my books"],
    ["Tomas declined", fixture.tomasDeclined, "difference between a man who won't answer and a man who hasn't yet", "difference between refusing an answer and not having one yet"],
    ["Debt notice", fixture.debtNotice, "commander who has already rationed his attention", "what they give you after you have already rationed your attention"]
  ];
  for (const [label, text, forbidden, required] of cases) {
    if (text.includes(forbidden)) errors.push(`${label} still genders the Commander: ${forbidden}`);
    if (!text.includes(required)) errors.push(`${label} missing player-shaped replacement: ${required}`);
  }
  return errors;
}

function cascadeAndMirrorChecks(runtime) {
  const errors = [];
  const bindings = runtime.evaluate(`(() => {
    resetRunState();
    state.crisisPath = "breath";
    return {
      manifest: scenes.empty_berths.choices.map(choice => choice.next),
      changeorders: scenes.arc_future_3.choices.map(choice => choice.next),
      briefing: scenes.act3_reckoning_briefing.choices.map(choice => choice.next),
      vault: scenes.act3_vault_face.choices.map(choice => choice.next),
      vaultRead: scenes.act3_vault_face_read.choices.map(choice => choice.next),
      factionFirst: scenes.faction_split.onEnter()
    };
  })()`);
  if (!bindings.manifest.length || bindings.manifest.some(next => next !== "berths_manifest")) {
    errors.push(`empty_berths manifest routes mismatch: ${bindings.manifest.join(",")}`);
  }
  if (bindings.changeorders.length !== 3 || bindings.changeorders.some(next => next !== "records_changeorders")) {
    errors.push(`arc_future_3 change-order routes mismatch: ${bindings.changeorders.join(",")}`);
  }
  if (bindings.briefing.length !== 1 || bindings.briefing[0] !== "observation_nightshift") {
    errors.push(`reckoning briefing route mismatch: ${bindings.briefing.join(",")}`);
  }
  const vaultDirect = bindings.vault.filter(next => next !== "act3_vault_face_read");
  if (vaultDirect.length !== 2 || vaultDirect.some(next => next !== "hold_bolts")) {
    errors.push(`vault-face bolt routes mismatch: ${bindings.vault.join(",")}`);
  }
  if (bindings.vaultRead.length !== 1 || bindings.vaultRead[0] !== "hold_bolts") {
    errors.push(`vault-face-read route mismatch: ${bindings.vaultRead.join(",")}`);
  }
  if (bindings.factionFirst !== "aftermath_seal") {
    errors.push(`first post-crisis route bypassed aftermath_seal: ${bindings.factionFirst}`);
  }

  const selaRoutes = runtime.evaluate(`(() => {
    resetRunState();
    const multi = scenes.offshift_open.choices.find(choice => choice.text === "Attend at yellow.")?.next || null;
    kill("lena", "fixture");
    kill("mira", "fixture");
    kill("amara", "fixture");
    kill("elias", "fixture");
    return { multi, sole: scenes.offshift_open.onEnter() };
  })()`);
  if (selaRoutes.multi !== "filters_stencil" || selaRoutes.sole !== "filters_stencil") {
    errors.push(`Sela stencil host routes mismatch: multi=${selaRoutes.multi}; sole=${selaRoutes.sole}`);
  }

  const redirects = runtime.evaluate(`(() => {
    resetRunState();
    state.flags.manifest = "read";
    kill("amara", "fixture");
    const manifest = scenes.berths_manifest.onEnter();
    resetRunState();
    kill("mira", "fixture");
    const changeorders = scenes.records_changeorders.onEnter();
    resetRunState();
    const bolts = scenes.hold_bolts.onEnter();
    const nightshift = scenes.observation_nightshift.onEnter();
    kill("sela", "fixture");
    const stencil = scenes.filters_stencil.onEnter();
    resetRunState();
    kill("elias", "fixture");
    const seal = scenes.aftermath_seal.onEnter();
    return { manifest, changeorders, bolts, nightshift, stencil, seal };
  })()`);
  const expectedRedirects = {
    manifest: "lead_prompt",
    changeorders: "arc_future_4",
    bolts: "act3_spine_next",
    nightshift: "act3_lethal_lena_clock",
    stencil: "faction_split",
    seal: "offshift_open"
  };
  for (const [key, expected] of Object.entries(expectedRedirects)) {
    if (redirects[key] !== expected) errors.push(`${key} dead/unrecovered redirect ${redirects[key]} != ${expected}`);
  }

  const originalFour = ["lena", "mira", "amara", "sela"];
  const mirrorNeedles = {
    lena: other => `I know about ${other}.`,
    mira: other => `Private interval logged. ${other} remain known conditions, not faults.`,
    amara: other => `I know who else gets your quiet hours: ${other}.`,
    sela: other => `I know about ${other}.`
  };
  const speakerPrefixes = {
    lena: "Lena's first report after the private hours",
    mira: "Mira opens the next watch",
    amara: "Amara sends the next yield sheet",
    sela: "Sela returns to the vault count"
  };
  for (const speaker of originalFour) {
    for (const other of originalFour) {
      if (speaker === other) continue;
      const text = runtime.evaluate(`(() => {
        resetRunState();
        state.romance[${JSON.stringify(speaker)}] = true;
        state.romance[${JSON.stringify(other)}] = true;
        return scenes.debt_notice.text;
      })()`);
      const otherName = runtime.evaluate(`crew[${JSON.stringify(other)}].first`);
      if (!text.includes(mirrorNeedles[speaker](otherName))) {
        errors.push(`missing mirror ${speaker} -> ${other}`);
      }
    }
    const deadText = runtime.evaluate(`(() => {
      resetRunState();
      state.romance[${JSON.stringify(speaker)}] = true;
      kill(${JSON.stringify(speaker)}, "fixture");
      return scenes.debt_notice.text;
    })()`);
    if (deadText.includes(speakerPrefixes[speaker])) errors.push(`dead partner still speaks in debt_notice: ${speaker}`);
  }

  const phraseOwners = runtime.evaluate(`(() => {
    const find = phrase => Object.keys(scenes).filter(id => {
      const descriptor = Object.getOwnPropertyDescriptor(scenes[id], "text");
      return descriptor && typeof descriptor.value === "string" && descriptor.value.includes(phrase);
    });
    return {
      handoff: find("I am the hand-off."),
      standing: find("Standing question.")
    };
  })()`);
  if (phraseOwners.handoff.length !== 1 || phraseOwners.handoff[0] !== "filters_stencil") {
    errors.push(`hand-off phrase owners mismatch: ${phraseOwners.handoff.join(",")}`);
  }
  if (phraseOwners.standing.length !== 1 || phraseOwners.standing[0] !== "aftermath_seal_order") {
    errors.push(`Standing question phrase owners mismatch: ${phraseOwners.standing.join(",")}`);
  }
  const sceneSource = EXPECTED_SCRIPTS
    .filter(path => /src\/scenes-\d{2}\.js$/.test(path))
    .map(path => readFileSync(resolve(ROOT, path), "utf8"))
    .join("\n");
  if (sceneSource.includes("People were tier four.")) errors.push("Tomas reserved phrase appears in renderable scene source");
  const minted = readFileSync(resolve(ROOT, "artifacts/MINTED_PHRASES.md"), "utf8");
  if (!minted.includes("| I am the hand-off. | Sela | filters_stencil | 0.29 |")) {
    errors.push("MINTED_PHRASES missing Sela spent disposition");
  }
  if (!minted.includes("| Standing question. | Elias | aftermath_seal_order | 0.29 |")) {
    errors.push("MINTED_PHRASES missing Elias spent disposition");
  }
  if (!minted.includes("| People were tier four. | Tomas | Late Living reckon/ending only | RESERVED")) {
    errors.push("MINTED_PHRASES missing Tomas reserved disposition");
  }

  return errors;
}

function git(args) {
  const result = spawnSync("git", args, { cwd: ROOT, encoding: "utf8", env: { ...process.env, GIT_OPTIONAL_LOCKS: "0" } });
  if (result.status !== 0) throw new Error(`git ${args.join(" ")} failed: ${(result.stderr || result.stdout).trim()}`);
  return result.stdout.trim();
}

function sha256(text) {
  return createHash("sha256").update(text).digest("hex");
}

function identityAndAuthorityChecks() {
  const errors = [];
  const head = git(["rev-parse", "HEAD"]);
  const testedSha = process.env.VERIFY_EXPECTED_SHA || head;
  if (head !== testedSha) errors.push(`HEAD ${head} != expected tested SHA ${testedSha}`);
  if (git(["rev-parse", `${SOURCE_MAIN_SHA}^{tree}`]) !== SOURCE_MAIN_TREE) errors.push("bound source-main tree drifted");
  const ancestry = spawnSync("git", ["merge-base", "--is-ancestor", AUDITED_RECOVERY_BASE_SHA, "HEAD"], { cwd: ROOT, encoding: "utf8", env: { ...process.env, GIT_OPTIONAL_LOCKS: "0" } });
  if (ancestry.status !== 0) errors.push("audited recovery base is not an ancestor of HEAD");

  const status = readFileSync(resolve(ROOT, "artifacts/PROJECT_STATUS.md"), "utf8");
  const roadmap = readFileSync(resolve(ROOT, "artifacts/ROADMAP.md"), "utf8");
  const locks = readFileSync(resolve(ROOT, "artifacts/LOCKS.md"), "utf8");
  const fixture = JSON.parse(readFileSync(resolve(ROOT, "scripts/fixtures/main-reconcile-ci-pr-baseline.json"), "utf8"));
  const testedRef = process.env.VERIFY_HEAD_REF || "";
  const currentReconciliationRoute = !testedRef || testedRef === fixture.branches.ticket || testedRef === fixture.branches.version;
  if (currentReconciliationRoute && git(["rev-parse", "HEAD:src"]) !== REQUIRED_SRC_TREE) errors.push("main-reconcile HEAD:src changed from the authorized runtime tree");
  if (!status.includes("`release_state: NO-PUBLISH`")) errors.push("STATUS release state is not NO-PUBLISH");
  if (!status.includes("`version_integrity: NOT_CERTIFIED`")) errors.push("STATUS integrity state is not NOT_CERTIFIED");
  if (!status.includes("PRESENT / UNRECONCILED / NO INTEGRATION OR RELEASE CREDIT")) errors.push("STATUS art posture missing");
  for (const token of ["L-025 — LOCKED", "L-026 — LOCKED", "L-027 — LOCKED", "L-028 — DEFERRED"]) if (!status.includes(token)) errors.push(`STATUS missing ${token}`);
  const digest = sha256(roadmap);
  if (!locks.includes(`**Roadmap source SHA-256:** \`${digest}\``)) errors.push(`LOCKS roadmap digest does not match ${digest}`);
  if (fixture.sourceMainSha !== SOURCE_MAIN_SHA || fixture.sourceMainTree !== SOURCE_MAIN_TREE || fixture.requiredSrcTree !== REQUIRED_SRC_TREE) errors.push("main-reconcile fixture identity drifted");
  if (fixture.certification !== "NO-PUBLISH / NOT_CERTIFIED") errors.push("fixture certification posture drifted");
  return errors;
}

function negativeFixtureErrors(fixture) {
  const errors = [];
  if (!fixture.manifestPresent) errors.push("missing manifest");
  if (fixture.script.includes("&quot;")) errors.push("historical entity corruption");
  try { new vm.Script(fixture.script); } catch { errors.push("JavaScript truncation or syntax corruption"); }
  if (!Buffer.isBuffer(fixture.image) || fixture.image.length < 1024 || fixture.image[0] !== 0xff || fixture.image[1] !== 0xd8 || fixture.image.at(-2) !== 0xff || fixture.image.at(-1) !== 0xd9) errors.push("bad image magic or size");
  if (fixture.versionFile !== fixture.stateVersion || fixture.versionFile !== fixture.subtitleVersion) errors.push("version drift");
  if (!fixture.registrationPresent) errors.push("missing registration/load-order entry");
  if (fixture.validatorErrors.length) errors.push("validator failure");
  return errors;
}

function runSelfTest() {
  const good = {
    manifestPresent: true,
    script: "const fixture = 'ok';",
    image: Buffer.concat([Buffer.from([0xff, 0xd8]), Buffer.alloc(1020), Buffer.from([0xff, 0xd9])]),
    versionFile: "0.30",
    stateVersion: "0.30",
    subtitleVersion: "0.30",
    registrationPresent: true,
    validatorErrors: []
  };
  assert.deepEqual(negativeFixtureErrors(good), []);
  const cases = [
    value => { value.manifestPresent = false; },
    value => { value.script = "const broken = &quot;fixture&quot;;"; },
    value => { value.script = "function truncated("; },
    value => { value.image = Buffer.from("not-a-jpeg"); },
    value => { value.stateVersion = "0.28.1d"; },
    value => { value.registrationPresent = false; },
    value => { value.validatorErrors = ["injected"]; }
  ];
  for (const mutate of cases) {
    const value = { ...good, image: Buffer.from(good.image), validatorErrors: [...good.validatorErrors] };
    mutate(value);
    assert.ok(negativeFixtureErrors(value).length, "negative fixture passed");
  }
  console.log(`PASS verify self-test — ${cases.length} corruption, manifest, load-order, validator, and version-drift negatives rejected`);
}

function printCheck(label, errors, detail = "") {
  if (errors.length) {
    console.error(`FAIL ${label}${detail ? ` (${detail})` : ""}`);
    errors.forEach(error => console.error(`  - ${error}`));
  } else {
    console.log(`PASS ${label}${detail ? ` (${detail})` : ""}`);
  }
}

async function main() {
  const failures = [];
  const { scripts } = readScriptManifest(ROOT);

  const identityErrors = identityAndAuthorityChecks();
  printCheck("main identity + authority posture", identityErrors, `base=${SOURCE_MAIN_SHA.slice(0, 7)} src=${REQUIRED_SRC_TREE.slice(0, 7)}`);
  failures.push(...identityErrors);

  const manifestErrors = manifestChecks(scripts);
  printCheck("script manifest", manifestErrors, `${scripts.length} files`);
  failures.push(...manifestErrors);

  const retiredFlagErrors = retiredRuntimeFlagChecks(scripts);
  printCheck("L-023 retired pair_turn runtime state", retiredFlagErrors);
  failures.push(...retiredFlagErrors);

  const versionErrors = versionSurfaceChecks();
  const observedVersion = readFileSync(resolve(ROOT, "VERSION.md"), "utf8").trim().split(/\r?\n/, 1)[0];
  printCheck("version + What Remains HTML surfaces", versionErrors, `v${observedVersion}`);
  failures.push(...versionErrors);

  const desktopCompositionErrors = desktopCompositionChecks();
  printCheck("0.32 widescreen scene composition", desktopCompositionErrors);
  failures.push(...desktopCompositionErrors);

  const syntaxErrors = syntaxChecks(scripts);
  printCheck("loaded JavaScript syntax", syntaxErrors, `${scripts.length} files compiled`);
  failures.push(...syntaxErrors);

  let runtime;
  try {
    runtime = loadGame(ROOT);
    printCheck("full runtime execution", []);
  } catch (error) {
    const errors = [error.stack || error.message];
    printCheck("full runtime execution", errors);
    failures.push(...errors);
  }

  if (runtime) {
    const registration = registrationChecks(runtime);
    printCheck("scene registration", registration.errors, `${runtime.sceneIds.length} scenes; sha256=${registration.digest}`);
    failures.push(...registration.errors);

    const validator = validatorChecks(runtime);
    printCheck("runtime validator", validator.errors, `${validator.result?.warnings?.length || 0} warning(s)`);
    failures.push(...validator.errors);

    const whatRemainsErrors = whatRemainsChecks(runtime);
    printCheck("What Remains selector + separate surface", whatRemainsErrors);
    failures.push(...whatRemainsErrors);

    const tomasDeadHolderPromiseErrors = tomasDeadHolderPromiseChecks(runtime);
    printCheck("L-024 dead-holder Tomas promise preservation", tomasDeadHolderPromiseErrors);
    failures.push(...tomasDeadHolderPromiseErrors);

    const finalOrderErrors = finalOrderEndingChecks(runtime);
    printCheck("final-order consequence in all ending families", finalOrderErrors);
    failures.push(...finalOrderErrors);

    const cascadeErrors = cascadeAndMirrorChecks(runtime);
    printCheck("Cascade hosts + mirrors + phrase ownership", cascadeErrors);
    failures.push(...cascadeErrors);

    const newRunErrors = newRunChecks(runtime);
    printCheck("0.32 New Run confirmation + atomic replacement", newRunErrors);
    failures.push(...newRunErrors);

    const saveTransferErrors = await saveTransferChecks(runtime);
    printCheck("0.32 local save export/import custody", saveTransferErrors);
    failures.push(...saveTransferErrors);

    const playAgainErrors = playAgainChecks(runtime);
    printCheck("Play Again fresh campaign without consuming completed save", playAgainErrors);
    failures.push(...playAgainErrors);

    const unknownSaveSceneErrors = unknownSaveSceneChecks(runtime);
    printCheck("unknown save scene fails closed without mutating live state", unknownSaveSceneErrors);
    failures.push(...unknownSaveSceneErrors);

    const malformedSnapshotShapeErrors = malformedSnapshotShapeChecks(runtime);
    printCheck("malformed save snapshot shape fails atomically", malformedSnapshotShapeErrors);
    failures.push(...malformedSnapshotShapeErrors);

    const saveWriteFailureErrors = saveWriteFailureChecks(runtime);
    printCheck("autosave write failure custody + player warning", saveWriteFailureErrors);
    failures.push(...saveWriteFailureErrors);

    const keyboardChoiceErrors = keyboardChoiceChecks(runtime);
    printCheck("0.32 keyboard choice controls", keyboardChoiceErrors);
    failures.push(...keyboardChoiceErrors);

    const resumeEntryErrors = resumeEntryIdempotenceChecks(runtime);
    printCheck("resume preserves completed scene entry", resumeEntryErrors);
    failures.push(...resumeEntryErrors);

    const warmthLaughterErrors = warmthLaughterChecks(runtime);
    printCheck("warmth_laughter living/dead Vess guard", warmthLaughterErrors);
    failures.push(...warmthLaughterErrors);

    const rourkeDyingImageErrors = rourkeDyingImageHonestyChecks(runtime);
    printCheck("dying Rourke image honesty", rourkeDyingImageErrors);
    failures.push(...rourkeDyingImageErrors);

    const vessHairCanonErrors = vessHairCanonChecks(runtime);
    printCheck("Vess boarding hair canon", vessHairCanonErrors);
    failures.push(...vessHairCanonErrors);

    const arcLivingImageTruthErrors = arcLivingImageTruthChecks(runtime);
    printCheck("arc_living_2 yellow-mark image truth", arcLivingImageTruthErrors);
    failures.push(...arcLivingImageTruthErrors);

    const remainingArcLivingTruthErrors = remainingArcLivingTruthChecks(runtime);
    printCheck("remaining arc_living image + living/dead state truth", remainingArcLivingTruthErrors);
    failures.push(...remainingArcLivingTruthErrors);

    const warmthMealPresenceErrors = warmthMealPresenceChecks(runtime);
    printCheck("warmth_meal living Tomas entry guard", warmthMealPresenceErrors);
    failures.push(...warmthMealPresenceErrors);

    const cutOutPresenceErrors = cutOutPresenceChecks(runtime);
    printCheck("cut_out unrecovered-Jiro presence guard", cutOutPresenceErrors);
    failures.push(...cutOutPresenceErrors);

    const vaultPriorityErrors = vaultPriorityChecks(runtime);
    printCheck("L-022 early vault_priority preservation", vaultPriorityErrors);
    failures.push(...vaultPriorityErrors);

    const pairShieldErrors = pairShieldReachabilityChecks(runtime);
    printCheck("L-020 pair_shield_cold one-shot reachability", pairShieldErrors);
    failures.push(...pairShieldErrors);

    const offshiftGuardErrors = offshiftDefensiveGuardChecks(runtime);
    printCheck("L-026 Off-Shift defensive save-recovery guards", offshiftGuardErrors);
    failures.push(...offshiftGuardErrors);

    const renderPurityErrors = renderPurityChecks(runtime);
    printCheck("scene text render purity + one-shot entry writes", renderPurityErrors);
    failures.push(...renderPurityErrors);

    const resourceFeedbackErrors = resourceFeedbackChecks(runtime);
    printCheck("truthful public-resource status + blocker feedback", resourceFeedbackErrors);
    failures.push(...resourceFeedbackErrors);

    const sameTapPaymentErrors = sameTapPaymentChecks(runtime);
    printCheck("FH-01B same-tap payment + parked-save compatibility", sameTapPaymentErrors);
    failures.push(...sameTapPaymentErrors);

    const romanceGateErrors = romanceOpenGateChecks(runtime);
    printCheck("intimacy_window authoritative romance-open gate", romanceGateErrors);
    failures.push(...romanceGateErrors);

    const lastTransmissionErrors = lastTransmissionChecks(runtime);
    printCheck("last_tx final transmission spent/unspent guard", lastTransmissionErrors);
    failures.push(...lastTransmissionErrors);

    const vessTransmissionReplayErrors = vessTransmissionReplayChecks(runtime);
    printCheck("vess_transmission spent-window replay guard", vessTransmissionReplayErrors);
    failures.push(...vessTransmissionReplayErrors);

    const vessCourseRetirementErrors = vessCourseRetirementChecks(runtime);
    printCheck("L-027 retired Vess course promise and legacy flag", vessCourseRetirementErrors);
    failures.push(...vessCourseRetirementErrors);

    const commanderIdentityErrors = commanderIdentityChecks(runtime);
    printCheck("L-025 player-shaped Commander rendered paths", commanderIdentityErrors);
    failures.push(...commanderIdentityErrors);
  }

  const simulations = runPolicySet(ROOT, { policies: POLICY_NAMES, runs: 1, seed: 20260817 });
  for (const result of simulations) {
    const errors = simulationAssertions(result);
    const detail = result.completed
      ? `${result.ending.title}; ${result.steps} steps; economy=${result.economy?.transactions?.length || 0} tx reconciled`
      : result.failure;
    printCheck(`simulation ${result.policy}`, errors, detail);
    failures.push(...errors.map(error => `${result.policy}: ${error}`));
  }

  for (const holder of ["amara", "sela"]) {
    const v6 = assertV6(ROOT, holder);
    printCheck(`V6 untested dead-holder promise (${holder})`, v6.errors,
      `before=${v6.beforeEnding}; after=${v6.afterEnding}; ending=${v6.endingTitle}`);
    failures.push(...v6.errors.map(error => `V6/${holder}: ${error}`));
  }

  if (failures.length) {
    console.error(`\nRELEASE GATE FAIL — ${failures.length} failure(s)`);
    process.exitCode = 1;
  } else {
    console.log("\nRELEASE GATE PASS");
  }
}

try {
  if (process.argv.length === 3 && process.argv[2] === "--self-test") runSelfTest();
  else if (process.argv.length === 2) await main();
  else throw new Error("Usage: node scripts/verify.mjs [--self-test]");
} catch (error) {
  console.error(`RELEASE GATE CRASH\n${error.stack || error.message}`);
  process.exitCode = 1;
}
