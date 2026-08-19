#!/usr/bin/env node

// Release-gate ownership:
// - Manifest + syntax: exact browser load order and parseability.
// - Runtime + validator: one-time registration, 222-scene count, and scene-ID digest.
// - Policy simulations: Living, Future, and pragmatic routes reach truthful endings.
// - V6 fixtures: Amara and Sela stay "made" when they die before an authored test,
//   and their untested promises are omitted from ending reflection.
// - What Remains fixtures: 3–6 current-run facts, significance order, exact causes,
//   tested-promise selection, relational tense, and separate-surface rendering.

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

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const EXPECTED_VERSION = "0.29";
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

function versionSurfaceChecks() {
  const errors = [];
  const versionFile = readFileSync(resolve(ROOT, "VERSION.md"), "utf8").trim().split(/\r?\n/, 1)[0];
  const stateSource = readFileSync(resolve(ROOT, "src/state.js"), "utf8");
  const indexSource = readFileSync(resolve(ROOT, "index.html"), "utf8");
  const stateMatch = stateSource.match(/const\s+VERSION\s*=\s*["']([^"']+)["']/);
  const subtitleMatch = indexSource.match(/id=["']game-subtitle["'][^>]*>v([^<]+)</);
  if (versionFile !== EXPECTED_VERSION) errors.push(`VERSION.md=${versionFile}; expected ${EXPECTED_VERSION}`);
  if (stateMatch?.[1] !== EXPECTED_VERSION) errors.push(`src/state.js VERSION=${stateMatch?.[1] || "missing"}; expected ${EXPECTED_VERSION}`);
  if (subtitleMatch?.[1] !== EXPECTED_VERSION) errors.push(`index subtitle=${subtitleMatch?.[1] || "missing"}; expected ${EXPECTED_VERSION}`);
  for (const requiredId of ["what-remains-screen", "what-remains-image", "what-remains-text"]) {
    if (!indexSource.includes(`id="${requiredId}"`)) errors.push(`index missing ${requiredId}`);
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

function quietTomasRewindChecks(runtime) {
  const errors = [];
  const fixtures = runtime.evaluate(`(() => [0, 1].map(index => {
    resetRunState();
    state.recovered.tomas = true;
    state.recovered.vess = true;
    showScene("act3_spine_next");

    const offer = scenes.act3_spine_next.choices.find(choice => choice.next === "quiet_tomas");
    if (!offer) return { index, error: "late quiet_tomas offer missing" };

    makeChoice(offer);
    const enteredScene = state.scene;
    const doneOnEnter = state.flags.quiet_tomas_done === true;
    const quietChoice = scenes.quiet_tomas.choices[index];
    const exitTarget = quietChoice && quietChoice.next;
    if (quietChoice) makeChoice(quietChoice);

    return {
      index,
      enteredScene,
      doneOnEnter,
      exitTarget,
      finalScene: state.scene,
      offeredAgain: scenes.act3_spine_next.choices.some(choice => choice.next === "quiet_tomas"),
      cohesion: state.cohesion,
      affinity: state.affinity.tomas,
      trust: state.trust.tomas,
      living: state.ideology.living
    };
  }))()`);

  const expected = [
    { cohesion: 53, affinity: 20, trust: 58, living: 1 },
    { cohesion: 51, affinity: 15, trust: 53, living: 0 }
  ];

  fixtures.forEach((fixture, index) => {
    if (fixture.error) {
      errors.push(`choice ${index}: ${fixture.error}`);
      return;
    }
    if (fixture.enteredScene !== "quiet_tomas") {
      errors.push(`choice ${index}: late offer entered ${fixture.enteredScene} instead of quiet_tomas`);
    }
    if (!fixture.doneOnEnter) errors.push(`choice ${index}: quiet_tomas_done was not set on entry`);
    if (fixture.exitTarget !== "act3_spine_next") {
      errors.push(`choice ${index}: exit targets ${fixture.exitTarget} instead of act3_spine_next`);
    }
    if (fixture.finalScene !== "act3_spine_next") {
      errors.push(`choice ${index}: ended at ${fixture.finalScene} instead of act3_spine_next`);
    }
    if (fixture.offeredAgain) errors.push(`choice ${index}: quiet_tomas was offered again after completion`);
    for (const [key, value] of Object.entries(expected[index])) {
      if (fixture[key] !== value) {
        errors.push(`choice ${index}: ${key}=${fixture[key]} after one traversal; expected ${value}`);
      }
    }
  });

  return errors;
}

function printCheck(label, errors, detail = "") {
  if (errors.length) {
    console.error(`FAIL ${label}${detail ? ` (${detail})` : ""}`);
    errors.forEach(error => console.error(`  - ${error}`));
  } else {
    console.log(`PASS ${label}${detail ? ` (${detail})` : ""}`);
  }
}

function main() {
  const failures = [];
  const { scripts } = readScriptManifest(ROOT);

  const manifestErrors = manifestChecks(scripts);
  printCheck("script manifest", manifestErrors, `${scripts.length} files`);
  failures.push(...manifestErrors);

  const versionErrors = versionSurfaceChecks();
  printCheck("version + What Remains HTML surfaces", versionErrors, `v${EXPECTED_VERSION}`);
  failures.push(...versionErrors);

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

    const cascadeErrors = cascadeAndMirrorChecks(runtime);
    printCheck("Cascade hosts + mirrors + phrase ownership", cascadeErrors);
    failures.push(...cascadeErrors);

    const quietTomasErrors = quietTomasRewindChecks(runtime);
    printCheck("quiet_tomas late-path rewind regression", quietTomasErrors, "both exits");
    failures.push(...quietTomasErrors);
  }

  const simulations = runPolicySet(ROOT, { policies: POLICY_NAMES, runs: 1, seed: 20260817 });
  for (const result of simulations) {
    const errors = simulationAssertions(result);
    printCheck(`simulation ${result.policy}`, errors, result.completed ? `${result.ending.title}; ${result.steps} steps` : result.failure);
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
  main();
} catch (error) {
  console.error(`RELEASE GATE CRASH\n${error.stack || error.message}`);
  process.exitCode = 1;
}
