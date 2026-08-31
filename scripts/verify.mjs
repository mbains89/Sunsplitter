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

function main() {
  const failures = [];
  const { scripts } = readScriptManifest(ROOT);

  const identityErrors = identityAndAuthorityChecks();
  printCheck("main identity + authority posture", identityErrors, `base=${SOURCE_MAIN_SHA.slice(0, 7)} src=${REQUIRED_SRC_TREE.slice(0, 7)}`);
  failures.push(...identityErrors);

  const manifestErrors = manifestChecks(scripts);
  printCheck("script manifest", manifestErrors, `${scripts.length} files`);
  failures.push(...manifestErrors);

  const versionErrors = versionSurfaceChecks();
  const observedVersion = readFileSync(resolve(ROOT, "VERSION.md"), "utf8").trim().split(/\r?\n/, 1)[0];
  printCheck("version + What Remains HTML surfaces", versionErrors, `v${observedVersion}`);
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
  if (process.argv.length === 3 && process.argv[2] === "--self-test") runSelfTest();
  else if (process.argv.length === 2) main();
  else throw new Error("Usage: node scripts/verify.mjs [--self-test]");
} catch (error) {
  console.error(`RELEASE GATE CRASH\n${error.stack || error.message}`);
  process.exitCode = 1;
}
