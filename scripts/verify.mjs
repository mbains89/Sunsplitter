#!/usr/bin/env node

// Release-gate ownership:
// - Manifest + syntax: exact browser load order and parseability.
// - Runtime + validator: one-time registration, 225-scene count, and scene-ID digest.
// - Policy simulations: Living, Future, and pragmatic routes reach truthful endings.
// - V6 fixtures: Amara and Sela stay "made" when they die before an authored test,
//   and their untested promises are omitted from ending reflection.
// - What Remains fixtures: 3–6 current-run facts, significance order, exact causes,
//   tested-promise selection, relational tense, and separate-surface rendering.

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import vm from "node:vm";
import { buildPrivatePackage, readCanonicalZip } from "./build-private-package.mjs";
import {
  EXPECTED_SCENE_COUNT,
  POLICY_NAMES,
  assertV6,
  loadGame,
  readEngineSource,
  readScriptManifest,
  runPolicySet,
  sceneIdDigest,
  simulationAssertions
} from "./simulate.mjs";
import { offshiftDefensiveGuardChecks } from "./l026-offshift-guards.mjs";
import { offshiftChoiceChecks } from "./offshift-choice-checks.mjs";
import { midgameVarietyChecks } from "./midgame-variety-checks.mjs";
import { cinematicChecks } from "./cinematic-checks.mjs";
import { maleCrewChecks } from "./male-crew-checks.mjs";
import { artEventChecks } from "./art-event-checks.mjs";
import { livingCastChecks } from "./living-cast-checks.mjs";
import { selaAnswerChecks } from "./sela-answer-checks.mjs";
import { capacitorChecks } from "./capacitor-checks.mjs";
import { epilogueChecks } from "./epilogue-checks.mjs";
import { pregnancyLenaChecks } from "./pregnancy-lena-checks.mjs";
import { joinTypoChecks } from "./join-typo-checks.mjs";
import { vessRecapChecks } from "./vess-recap-checks.mjs";
import { destinationChecks } from "./destination-checks.mjs";
import { jiroVoiceChecks } from "./jiro-voice-checks.mjs";
import { remainsLeanChecks } from "./remains-lean-checks.mjs";
import { openingBackstoryChecks } from "./opening-backstory-checks.mjs";
import { artR2PlaytestCloseChecks } from "./art-r2-playtest-close-checks.mjs";
import { playtestArtEventAuditChecks } from "./playtest-art-event-audit-checks.mjs";
import { newRunChecks } from "./new-run-checks.mjs";
import { stillBurningCorridorChecks } from "./still-burning-corridor-checks.mjs";
import { pcViewportChecks } from "./pc-viewport-checks.mjs";
import { reviewBuildStampChecks } from "./review-build-stamp-checks.mjs";
import { cascadeAllusivePayoffChecks } from "./cascade-allusive-payoff-checks.mjs";
import { cascadeSecondFlagPayoffChecks } from "./cascade-second-flag-payoff-checks.mjs";
import { lethalResumeDeathbeatChecks } from "./lethal-resume-deathbeat-checks.mjs";
import { midgameDelayedConsequenceChecks } from "./midgame-delayed-consequence-checks.mjs";
import { midgameThirdConsequenceChecks } from "./midgame-third-consequence-checks.mjs";
import { ventBunksChecks } from "./vent-bunks-checks.mjs";
import { playtestCrewBoardFollowClarity01Checks } from "./playtest-crew-board-follow-clarity-01-checks.mjs";
import { ROOT, sameArray } from "./verify/shared.mjs";
import {
  warmthLaughterChecks,
  rourkeDyingImageHonestyChecks,
  romanceLena1ImageTruthChecks,
  romanceAmara1ImageTruthChecks,
  tetherHandEliasImageTruthChecks,
  lethalEliasOrderImageTruthChecks,
  lethalEliasSealantImageTruthChecks,
  romanceMira1ImageTruthChecks,
  lenaIntimacyImageTruthChecks,
  tetherRushImageTruthChecks,
  act3SpineImageRepeatChecks,
  offshiftVessImageTruthChecks,
  vessHairCanonChecks,
  arcLivingImageTruthChecks,
  remainingArcLivingTruthChecks,
  warmthMealPresenceChecks,
  cutOutPresenceChecks
} from "./verify/image-truth.mjs";
import {
  crewOverviewChecks,
  accessibilityRuntimeChecks,
  suppliesReserveChecks,
  suppliesBandChecks,
  performanceRuntimeChecks,
  screenTransitionScrollChecks,
  contentNoticeRevisitChecks,
  keyboardChoiceChecks
} from "./verify/interface.mjs";
import {
  whatRemainsChecks,
  tomasDeadHolderPromiseChecks,
  finalOrderEndingChecks
} from "./verify/remains.mjs";
import {
  saveTransferChecks,
  playAgainChecks,
  unknownSaveSceneChecks,
  malformedSnapshotShapeChecks,
  saveWriteFailureChecks,
  resumeEntryIdempotenceChecks,
  saveVersionSemanticChecks
} from "./verify/saves.mjs";
import {
  vaultPriorityChecks,
  arcForkCostChecks,
  custodyPossessionTradeoffChecks,
  vaultRevealTradeoffChecks,
  pairShieldReachabilityChecks,
  resourceFeedbackChecks,
  sameTapPaymentChecks
} from "./verify/choices.mjs";
import {
  renderPurityChecks
} from "./verify/story.mjs";

const SOURCE_MAIN_SHA = "8d23109b63b844e0703fb36643f14b91b8800c90";
const SOURCE_MAIN_TREE = "a6b96e0907de586f6cdd31cf15db09bc1341ddaf";
const REQUIRED_SRC_TREE = "f907a0e455b9ccb562769f3520244ef16099f752";
const AUDITED_RECOVERY_BASE_SHA = "e4f84409759760d31fcf47b8a227802a61421f51";
const PRIVATE_PACKAGE_SOURCE_SHA = "a91a26d47ac76a976ca4406caf9b04511c11ba82";
const PRIVATE_PACKAGE_SOURCE_TREE = "dd9ea40d90ee08d52ff2c11c263a7d7cceb80895";
const PRIVATE_PACKAGE_SHA256 = "47d8d9c9fdea11971e8e62763344ff5308453358d6ada42fb14e88b102408a58";
const PRIVATE_PACKAGE_RUNTIME_PATHS_SHA256 = "5900313bf0dd17700edb159733bb0521a85ff077d596476274a5c6435654ab11";
const EXPECTED_SCRIPTS = [
  "src/state.js",
  ...Array.from({ length: 55 }, (_, index) => `src/scenes-${String(index + 1).padStart(2, "0")}.js`),
  "src/engine.js",
  "src/validate.js",
  "src/hitl-unshadow.js",
  "src/review-build-stamp.js"
];

// Digest of the sorted scene IDs produced by executing the 55 numbered modules.
// Update only when an authorized scene-manifest change intentionally adds/removes/renames a scene.
const EXPECTED_SCENE_IDS_SHA256 = "fb50b8e3349cb4e8c5e0c84bdce9f9fe59759face966a980d19b26a71f3bce72"; // SUN-DIET-MEMORY-FOLD-01: 230 ids, the SUN-DIET-REPLY-FOLD-01 set minus ship_memory_payoff (folded into final_choice)

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
  const expectedVersion = "0.36";
  const versionFile = readFileSync(resolve(ROOT, "VERSION.md"), "utf8").trim().split(/\r?\n/, 1)[0];
  const stateSource = readFileSync(resolve(ROOT, "src/state.js"), "utf8");
  const indexSource = readFileSync(resolve(ROOT, "index.html"), "utf8");
  const stateMatch = stateSource.match(/const\s+VERSION\s*=\s*["']([^"']+)["']/);
  const subtitleMatch = indexSource.match(/id=["']game-subtitle["'][^>]*>v([^<]+)</);
  if (!/^\d+\.\d+(?:\.\d+)?(?:[-.][0-9A-Za-z.-]+)?$/.test(versionFile)) errors.push(`VERSION.md=${versionFile}; malformed version`);
  if (versionFile !== expectedVersion) errors.push(`VERSION.md=${versionFile}; expected painted version ${expectedVersion}`);
  if (stateMatch?.[1] !== versionFile) errors.push(`src/state.js VERSION=${stateMatch?.[1] || "missing"}; expected ${versionFile}`);
  if (subtitleMatch?.[1] !== versionFile) errors.push(`index subtitle=${subtitleMatch?.[1] || "missing"}; expected ${versionFile}`);
  if (/id=["']game-subtitle["'][^>]*>v0\.30</.test(indexSource)) errors.push("title screen still exposes v0.30");
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

function mobileUsabilityContractChecks() {
  const errors = [];
  const cssSource = readFileSync(resolve(ROOT, "css/style.css"), "utf8");
  const indexSource = readFileSync(resolve(ROOT, "index.html"), "utf8");
  const engineSource = readEngineSource(ROOT);
  const requiredRules = [
    ["viewport-fit=cover", "safe-area viewport opt-in"],
    ["--touch: 48px", "48px phone touch contract"],
    ["min-width: var(--touch)", "two-dimensional compact-control touch target"],
    ["#crew-panel", "bounded crew panel"],
    ["max-height: min(36dvh, 260px)", "crew-panel height boundary"],
    ["overflow-y: auto", "independent phone scrolling"],
    ["@media (max-width: 360px)", "compact phone footer"],
    ["@media (max-width: 480px) and (max-height: 700px)", "short-phone layout"],
    ["max-height: min(48dvh, 320px)", "short-phone scene-art cap"]
  ];
  if (!indexSource.includes(requiredRules[0][0])) errors.push(`0.34 mobile contract missing ${requiredRules[0][1]}`);
  for (const [rule, label] of requiredRules.slice(1)) {
    if (!cssSource.includes(rule)) errors.push(`0.34 mobile contract missing ${label}`);
  }
  const controlBlock = selector => {
    const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return cssSource.match(new RegExp(`(?:^|\\n)\\s*${escaped}\\s*\\{([^}]*)\\}`, "m"))?.[1] || "";
  };
  for (const selector of [".choice-btn", ".btn", ".crew-chip", "#meta button"]) {
    if (!/min-height:\s*var\(--touch\)/.test(controlBlock(selector))) {
      errors.push(`0.34 ${selector} lost the 48px minimum touch height`);
    }
  }
  for (const selector of [".crew-chip", "#meta button"]) {
    if (!/min-width:\s*var\(--touch\)/.test(controlBlock(selector))) {
      errors.push(`0.34 ${selector} lost the 48px minimum touch width`);
    }
  }
  const chipFlex = controlBlock(".crew-chip");
  if (!/flex:\s*1 1 /.test(chipFlex) || !/text-align:\s*center/.test(chipFlex)) {
    errors.push("crew name chips must flex-grow when few and flex-shrink when many");
  }
  const chipsRow = controlBlock("#crew-panel .crew-chips");
  if (!/display:\s*flex/.test(chipsRow) || !/flex-wrap:\s*wrap/.test(chipsRow)) {
    errors.push("crew name chips must wrap as a flex row on phone width");
  }
  const appBlock = cssSource.match(/#app\s*\{([\s\S]*?)\}/)?.[1] || "";
  if (!/height:\s*100%/.test(appBlock) || !/max-height:\s*100%/.test(appBlock) || /100dvh/.test(appBlock)) {
    errors.push("0.34 #app no longer sizes inside the body-owned safe-area content box");
  }
  const directSafeAreaConsumers = cssSource.match(/env\(safe-area-inset-(?:top|bottom)[^)]*\)/g) || [];
  if (directSafeAreaConsumers.length !== 2) {
    errors.push(`0.34 safe-area custody expected two root tokens; found ${directSafeAreaConsumers.length} direct env() consumers`);
  }
  if (!engineSource.includes("e.touches.length !== 1") || !engineSource.includes("touchHasMultiplePointers")) {
    errors.push("0.34 scene-image drag does not preserve multi-touch browser gestures");
  }
  const touchEndBlock = engineSource.match(/wrap\.addEventListener\("touchend"[\s\S]*?\}, \{ passive: true \}\);/)?.[0] || "";
  if (!touchEndBlock || touchEndBlock.includes("preventDefault")) {
    errors.push("0.34 scene-image touchend still consumes browser zoom behavior");
  }
  return errors;
}

function cssHexVariable(cssSource, name) {
  const match = cssSource.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{3,6})\\s*;`));
  return match ? match[1] : null;
}

function relativeLuminance(hex) {
  let raw = String(hex || "").replace(/^#/, "");
  if (raw.length === 3) raw = raw.split("").map(char => char + char).join("");
  if (!/^[0-9a-fA-F]{6}$/.test(raw)) return null;
  const channels = raw.match(/.{2}/g).map(pair => parseInt(pair, 16) / 255).map(value =>
    value <= 0.04045 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4)
  );
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrastRatio(foreground, background) {
  const left = relativeLuminance(foreground);
  const right = relativeLuminance(background);
  if (left == null || right == null) return null;
  return (Math.max(left, right) + 0.05) / (Math.min(left, right) + 0.05);
}

function accessibilitySourceChecks() {
  const errors = [];
  const cssSource = readFileSync(resolve(ROOT, "css/style.css"), "utf8");
  const indexSource = readFileSync(resolve(ROOT, "index.html"), "utf8");
  const engineSource = readEngineSource(ROOT);
  const requiredHtml = [
    ['<main id="main">', "main landmark"],
    ['id="scene-heading" class="sr-only"', "scene heading"],
    ['id="story" role="region" aria-labelledby="scene-heading" tabindex="-1"', "focusable labelled story region"],
    ['id="choices" role="group" aria-label="Choices"', "labelled choices group"],
    ['id="status" class="hidden" role="region" aria-label="Ship status"', "labelled ship-status region"],
    ['id="stat-announcer" class="sr-only" role="status" aria-live="polite"', "deduplicated ship-status announcement"],
    ['id="btn-crew" type="button"', "stable Crew disclosure control"],
    ['aria-controls="crew-panel" aria-expanded="false"', "Crew disclosure state"],
    ['id="scene-id" aria-hidden="true"', "technical scene id hidden from assistive technology"]
  ];
  for (const [fragment, label] of requiredHtml) {
    if (!indexSource.includes(fragment)) errors.push(`0.34 accessibility contract missing ${label}`);
  }
  if ((indexSource.match(/class="stat" role="group" aria-label=/g) || []).length !== 5) {
    errors.push("0.34 ship-status values are not grouped with five full accessible labels");
  }
  for (const id of ["tone-heading", "title-heading", "ending-title", "what-remains-heading"]) {
    if (!new RegExp(`<h1[^>]+id=["']${id}["']`).test(indexSource)) {
      errors.push(`0.34 accessibility contract missing h1 ${id}`);
    }
  }
  const readingOrder = ["scene-heading", 'id="story"', 'id="choices"'].map(fragment => indexSource.indexOf(fragment));
  if (readingOrder.some(index => index < 0) || !(readingOrder[0] < readingOrder[1] && readingOrder[1] < readingOrder[2])) {
    errors.push("0.34 story heading, passage, and choices lost semantic reading order");
  }
  if (/img\.alt\s*=\s*id\b/.test(engineSource)) errors.push("0.34 scene image still exposes raw scene id as alt text");
  if (!engineSource.includes("imageAlternative(imgSrc)")) errors.push("0.34 scene image lacks human-readable alternative resolver");
  if (!cssSource.includes("@media (prefers-reduced-motion: reduce)")) errors.push("0.34 reduced-motion preference is not honored");
  if (!cssSource.includes(':where(button, input, [role="button"]):focus-visible')) {
    errors.push("0.34 shared keyboard focus indicator is missing");
  }
  const panel = cssHexVariable(cssSource, "panel-2");
  for (const token of ["dim", "accent", "danger", "ok", "pro", "con"]) {
    const value = cssHexVariable(cssSource, token);
    const ratio = contrastRatio(value, panel);
    if (ratio == null || ratio < 4.5) {
      errors.push(`0.34 ${token} contrast ${ratio == null ? "unavailable" : ratio.toFixed(2)}:1 < 4.5:1 on panel-2`);
    }
  }
  const focusRatio = contrastRatio(cssHexVariable(cssSource, "focus"), panel);
  if (focusRatio == null || focusRatio < 3) {
    errors.push(`0.34 focus contrast ${focusRatio == null ? "unavailable" : focusRatio.toFixed(2)}:1 < 3:1 on panel-2`);
  }
  return errors;
}

function performanceSourceChecks() {
  const errors = [];
  const indexSource = readFileSync(resolve(ROOT, "index.html"), "utf8");
  const engineSource = readEngineSource(ROOT);
  if ((indexSource.match(/<img[^>]+decoding=["']async["']/g) || []).length !== 4) {
    errors.push("all four runtime art surfaces, including cinematic, must request asynchronous decode");
  }
  for (const fragment of [
    "function setManagedImageSource(img, src)",
    "function releaseInactiveArtForScreen(id)",
    "preserveCompletedSlotUntilChoice",
    'window.addEventListener("pagehide", saveIfPlaying)',
    'window.addEventListener("pageshow", resumePresentation)',
    'document.addEventListener("freeze", saveIfPlaying)'
  ]) {
    if (!engineSource.includes(fragment)) errors.push(`0.34 performance contract missing ${fragment}`);
  }
  if (engineSource.includes('window.addEventListener("freeze", saveIfPlaying)')) {
    errors.push("0.34 freeze lifecycle save is wired to window instead of document");
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

    resetRunState();
    for (const who of keys) if (who !== "mira") mark(who, "declined");
    const miraDeclineChoice = scenes.bond_mira.choices.find(choice => choice.mark && choice.mark.mira === "declined");
    const miraDeclineBefore = {
      affinity: state.affinity.mira,
      trust: state.trust.mira
    };
    if (miraDeclineChoice) makeChoice(miraDeclineChoice);
    result.miraDeclined = {
      choicePresent: !!miraDeclineChoice,
      scene: state.scene,
      mark: state.marks.mira,
      open: romanceOpen("mira"),
      routes: scenes.intimacy_window.choices.map(choice => choice.next),
      affinityDelta: state.affinity.mira - miraDeclineBefore.affinity,
      trustDelta: state.trust.mira - miraDeclineBefore.trust
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
  if (!fixtures.miraDeclined.choicePresent || fixtures.miraDeclined.scene !== "intimacy_window" || fixtures.miraDeclined.mark !== "declined") {
    errors.push("Mira explicit rejection no longer records a durable decline and returns to intimacy_window");
  }
  if (fixtures.miraDeclined.open || fixtures.miraDeclined.routes.includes("bond_mira")) {
    errors.push("Mira explicit rejection still leaves bond_mira open in intimacy_window");
  }
  if (fixtures.miraDeclined.affinityDelta !== 0 || fixtures.miraDeclined.trustDelta !== 0) {
    errors.push("Mira explicit rejection applies a mechanical affinity or trust penalty");
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
    state.recovered.vess = true; // The private reply needs its living speaker.
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
  const runtimeSource = EXPECTED_SCRIPTS
    .map(relativePath => readFileSync(resolve(ROOT, relativePath), "utf8"))
    .join("\n");
  // HITL wire (MEASURE_LIVE_VS_HITL_88 + OWNER): romance_lena_1.jpg is the landed living map —
  // allow it. Other romance_*_1.jpg face plates remain forbidden until their own HITL land.
  const forbiddenCommanderFaceImages = [
    "images/romance_mira_1.jpg",
    "images/romance_amara_1.jpg",
    "images/romance_sela_1.jpg",
    "images/romance_vess_1.jpg"
  ];
  const approvedCommanderImageHashes = {
    "images/self_risk.jpg": "427fb4c5a72239451d213dcf7d6e80bef15da646a4b5e6000ddb54ffeb9de8a7",
    "images/lead_prompt.jpg": "63dc3d2eff8c14eae2ea0cd8d68c9a973a55489debdd90d73cfd19813c2a3744",
    "images/final_choice.jpg": "685c3c21c05c660aa43ac252329bbe7c145d9afa5182ae79d76393487954a547",
    "images/shower_lena.jpg": "cd0981c0d0e8b31f589658a77591aa73996547707567016d0f6a2a4f119cd097"
  };

  for (const image of forbiddenCommanderFaceImages) {
    if (runtimeSource.includes(image)) errors.push(`runtime references face-revealing Commander plate ${image}`);
  }
  for (const [image, expected] of Object.entries(approvedCommanderImageHashes)) {
    const actual = createHash("sha256").update(readFileSync(resolve(ROOT, image))).digest("hex");
    if (actual !== expected) errors.push(`audited Commander-safe plate drifted: ${image} sha256=${actual}`);
  }

  const forbiddenLanguage = [
    ["direct gender assignment", /\byou(?: are|'re| were| have been| become| became)\s+(?:a |an |the )?(?:man|woman|boy|girl|male|female)\b/i],
    ["gendered self-description", /\bkind of (?:man|woman)\b/i],
    ["gendered Commander possessive", /\bcommander who\b[^.!?\n]{0,100}\b(?:his|her)\b/i],
    ["sex-specific body assignment", /\byour\s+(?:beard|breasts?|penis|vagina|womb|uterus|ovaries|testicles|sperm)\b/i],
    ["assigned gestational role", /\b(?:you(?: are|'re| were)\s+pregnant|impregnat(?:e|ed|ing)\s+you)\b/i],
    ["legacy Amara gendering", /\bmen make speeches\b/i],
    ["legacy Tomas gendering", /\b(?:man who shares my books|man who won't answer and a man who hasn't yet)\b/i]
  ];
  for (const [label, pattern] of forbiddenLanguage) {
    if (pattern.test(runtimeSource)) errors.push(`${label} remains in runtime source`);
  }

  const fixture = runtime.evaluate(`(() => {
    const renderText = id => typeof scenes[id].text === "function" ? scenes[id].text() : scenes[id].text;
    const profiles = {
      fresh: () => {},
      recovered: () => {
        state.recovered = { tomas: true, jiro: true, vess: true };
      },
      romanced: () => {
        state.recovered = { tomas: true, jiro: true, vess: true };
        for (const key of ["lena", "mira", "amara", "sela", "vess"]) state.romance[key] = true;
        for (const key of Object.keys(state.affinity)) state.affinity[key] = 100;
        for (const key of Object.keys(state.trust)) state.trust[key] = 100;
        state.supplies = 100;
        state.integrity = 100;
        state.embryos = 100;
      },
      depleted: () => {
        state.recovered = { tomas: true, jiro: true, vess: true };
        for (const key of ["lena", "elias", "mira", "tomas", "amara", "jiro", "sela", "vess"]) {
          if (isAlive(key)) kill(key, "Commander identity audit fixture");
        }
      }
    };
    const rendered = [];
    for (const [profile, setup] of Object.entries(profiles)) {
      for (const id of Object.keys(scenes)) {
        resetRunState();
        setup();
        const scene = scenes[id];
        let text = "";
        let choices = [];
        try { text = renderText(id) || ""; } catch (error) { text = "AUDIT_ERROR: " + error.message; }
        try {
          const rawChoices = typeof scene.choices === "function" ? scene.choices() : scene.choices;
          choices = Array.isArray(rawChoices) ? rawChoices.map(choice => choice.text || "") : [];
        } catch (error) { choices = ["AUDIT_ERROR: " + error.message]; }
        rendered.push({ profile, id, text, choices, image: resolveSceneImage(id, scene) });
      }
    }

    resetRunState();
    state.romance.amara = true;
    const amaraAfterglow = renderText("prom_make_amara_ag");

    resetRunState();
    const lenaPromise = renderText("prom_make_lena");

    resetRunState();
    state.flags.manifest_lie = true;
    state.recovered.tomas = true; // The promise follows Tomas's recovery.
    const tomasManifest = renderText("prom_make_tomas");

    resetRunState();
    state.recovered.tomas = true;
    state.promises.tomas = "declined";
    const tomasDeclined = renderText("prom_r_tomas");

    resetRunState();
    state.romance.lena = true;
    state.affinity.lena = 40;
    const debtNotice = renderText("debt_notice");

    resetRunState();
    const pregnancyText = renderText("pregnancy_check");
    const pregnancyChoices = scenes.pregnancy_check.choices.map(choice => choice.text);

    return { rendered, amaraAfterglow, lenaPromise, tomasManifest, tomasDeclined, debtNotice, pregnancyText, pregnancyChoices };
  })()`);

  if (fixture.rendered.length !== EXPECTED_SCENE_COUNT * 4) {
    errors.push(`Commander audit rendered ${fixture.rendered.length} paths; expected ${EXPECTED_SCENE_COUNT * 4}`);
  }
  for (const row of fixture.rendered) {
    if (row.text.startsWith("AUDIT_ERROR:") || row.choices.some(text => text.startsWith("AUDIT_ERROR:"))) {
      errors.push(`Commander audit could not render ${row.profile}/${row.id}`);
    }
    if (forbiddenCommanderFaceImages.includes(row.image)) {
      errors.push(`rendered path ${row.profile}/${row.id} exposes face-revealing Commander plate ${row.image}`);
    }
  }
  const reproductiveSurface = `${fixture.pregnancyText}\n${fixture.pregnancyChoices.join("\n")}`;
  for (const [label, pattern] of forbiddenLanguage.slice(0, 5)) {
    if (pattern.test(reproductiveSurface)) errors.push(`pregnancy_check ${label}`);
  }
  if (!fixture.pregnancyText.includes("If you have been with anyone") ||
      !fixture.pregnancyText.includes("A living pregnancy competes") ||
      fixture.pregnancyChoices.length !== 4) {
    errors.push("pregnancy_check no longer preserves role-neutral reproductive facts and choices");
  }

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
    state.recovered.jiro = true; // Inspect the live post-recovery briefing.
    state.crisisPath = "breath";
    return {
      manifest: scenes.empty_berths.choices.map(choice => choice.next),
      changeorders: scenes.arc_future_3.choices.map(choice => choice.next),
      changeorderOutcomes: scenes.records_changeorders.choices.map(choice => ({
        next: choice.next,
        flag: choice.flag?.changeorders || null
      })),
      hasChangeordersAfter: Object.prototype.hasOwnProperty.call(scenes, "records_changeorders_after"),
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
  const expectedChangeorderOutcomes = [
    { next: "records_changeorders_after", flag: "logged" },
    { next: "records_changeorders_after", flag: "buried" }
  ];
  if (JSON.stringify(bindings.changeorderOutcomes) !== JSON.stringify(expectedChangeorderOutcomes)) {
    errors.push(`records_changeorders outcomes mismatch: ${JSON.stringify(bindings.changeorderOutcomes)}`);
  }
  if (!bindings.hasChangeordersAfter) {
    errors.push("records_changeorders_after legacy save-compatibility node is missing");
  }

  const changeorderFlow = runtime.evaluate(`(() => {
    const current = scenes.records_changeorders.choices.map((choice, index) => {
      resetRunState();
      showScene("records_changeorders");
      makeChoice(scenes.records_changeorders.choices[index]);
      return { scene: state.scene, flag: state.flags.changeorders };
    });
    resetRunState();
    state.flags.changeorders = "logged";
    showScene("records_changeorders_after", { skipOnEnter: true, resume: true });
    const legacyBefore = {
      scene: state.scene,
      flag: state.flags.changeorders,
      choices: scenes.records_changeorders_after.choices.length
    };
    makeChoice(scenes.records_changeorders_after.choices[0]);
    return {
      current,
      legacyBefore,
      legacyAfter: { scene: state.scene, flag: state.flags.changeorders }
    };
  })()`);
  const expectedCurrentFlow = [
    { scene: "arc_future_4", flag: "logged" },
    { scene: "arc_future_4", flag: "buried" }
  ];
  if (JSON.stringify(changeorderFlow.current) !== JSON.stringify(expectedCurrentFlow)) {
    errors.push(`records_changeorders runtime flow mismatch: ${JSON.stringify(changeorderFlow.current)}`);
  }
  if (changeorderFlow.legacyBefore.scene !== "records_changeorders_after" ||
      changeorderFlow.legacyBefore.flag !== "logged" ||
      changeorderFlow.legacyBefore.choices !== 1 ||
      changeorderFlow.legacyAfter.scene !== "arc_future_4" ||
      changeorderFlow.legacyAfter.flag !== "logged") {
    errors.push(`records_changeorders_after legacy resume mismatch: ${JSON.stringify({
      before: changeorderFlow.legacyBefore,
      after: changeorderFlow.legacyAfter
    })}`);
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
    mira: other => `Private interval logged. ${other} remains a known condition, not a fault.`,
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
    resetRunState();
    Object.assign(state.recovered, { tomas: true, jiro: true, vess: true });
    const find = phrase => Object.keys(scenes).filter(id => {
      // Ownership includes live getters now that restored absent cast is masked.
      const raw = scenes[id].text;
      const rendered = typeof raw === "function" ? raw.call(scenes[id]) : raw;
      return typeof rendered === "string" && rendered.includes(phrase);
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

function gitBuffer(args) {
  const result = spawnSync("git", args, {
    cwd: ROOT,
    encoding: null,
    env: { ...process.env, GIT_OPTIONAL_LOCKS: "0" },
    maxBuffer: 256 * 1024 * 1024
  });
  if (result.status !== 0) throw new Error(`git ${args.join(" ")} failed: ${Buffer.from(result.stderr || result.stdout).toString("utf8").trim()}`);
  return Buffer.from(result.stdout);
}

function privatePackageChecks() {
  const errors = [];
  const exactKeys = (value, expected, label) => {
    const actual = Object.keys(value || {}).sort();
    const wanted = [...expected].sort();
    if (!sameArray(actual, wanted)) errors.push(`${label} keys drifted: ${actual.join(",")}`);
  };
  const temporaryRoot = mkdtempSync(resolve(tmpdir(), "sunsplitter-private-package-"));
  try {
    const archiveName = `sunsplitter-private-${PRIVATE_PACKAGE_SOURCE_SHA.slice(0, 8)}.zip`;
    const first = buildPrivatePackage({
      sourceRef: PRIVATE_PACKAGE_SOURCE_SHA,
      outputPath: resolve(temporaryRoot, "first", archiveName),
      root: ROOT
    });
    const second = buildPrivatePackage({
      sourceRef: PRIVATE_PACKAGE_SOURCE_SHA,
      outputPath: resolve(temporaryRoot, "second", archiveName),
      root: ROOT
    });
    const firstArchive = readFileSync(first.outputPath);
    const secondArchive = readFileSync(second.outputPath);
    if (!firstArchive.equals(secondArchive)) errors.push("two exact-source builds produced different ZIP bytes");
    if (first.archiveSha256 !== second.archiveSha256 || first.archiveSha256 !== PRIVATE_PACKAGE_SHA256) {
      errors.push(`archive SHA-256 drifted: first=${first.archiveSha256} second=${second.archiveSha256} expected=${PRIVATE_PACKAGE_SHA256}`);
    }
    if (first.sourceTree !== PRIVATE_PACKAGE_SOURCE_TREE || second.sourceTree !== PRIVATE_PACKAGE_SOURCE_TREE) {
      errors.push(`private-package source tree drifted from ${PRIVATE_PACKAGE_SOURCE_TREE}`);
    }
    if (first.archiveBytes !== 29596520 || first.archiveEntries !== 160 || first.runtimeFiles !== 152 ||
        first.contentNoticeBytes !== 1336 || first.phoneGuideBytes !== 3352 || first.phoneServerBytes !== 7493 ||
        first.storeDraftBytes !== 2380 || first.supportDraftBytes !== 2558 || first.privacyDraftBytes !== 2912 ||
        first.adultClassificationDescriptors !== 8 ||
        first.packagedAssets !== 91 || first.inventoriedAssets !== 169 || first.fontsBundled !== 0 ||
        first.licenseFilesBundled !== 0 || first.externalFontStylesheets !== 1) {
      errors.push(`private-package summary drifted: ${JSON.stringify(first)}`);
    }

    const entries = readCanonicalZip(firstArchive);
    const paths = entries.map(entry => entry.path);
    const sortedPaths = [...paths].sort((left, right) => Buffer.compare(Buffer.from(left, "utf8"), Buffer.from(right, "utf8")));
    if (!sameArray(paths, sortedPaths)) errors.push("ZIP entries are not in UTF-8 bytewise path order");
    for (const entry of entries) {
      if (entry.flags !== 0x0800 || entry.compression !== 0 || entry.time !== 0 || entry.date !== 33 || entry.mode !== 0o100644) {
        errors.push(`non-canonical ZIP metadata: ${entry.path}`);
      }
      if (entry.path.endsWith("/") || entry.path.startsWith("/") || entry.path.includes("\\") || entry.path.split("/").includes("..")) {
        errors.push(`unsafe or non-file ZIP path: ${entry.path}`);
      }
    }
    const byPath = new Map(entries.map(entry => [entry.path, entry]));
    const manifestEntry = byPath.get("PRIVATE_PACKAGE_MANIFEST.json");
    const inventoryEntry = byPath.get("PRIVATE_PACKAGE_INVENTORY.md");
    const contentNoticeEntry = byPath.get("PRIVATE_CONTENT_NOTICE.md");
    const phoneGuideEntry = byPath.get("PRIVATE_PHONE_PLAY.md");
    const phoneServerEntry = byPath.get("PRIVATE_PHONE_SERVER.mjs");
    const storeDraftEntry = byPath.get("PRIVATE_STORE_DRAFT.md");
    const supportDraftEntry = byPath.get("PRIVATE_SUPPORT_DRAFT.md");
    const privacyDraftEntry = byPath.get("PRIVATE_PRIVACY_DRAFT.md");
    if (!manifestEntry || !inventoryEntry || !contentNoticeEntry || !phoneGuideEntry || !phoneServerEntry ||
        !storeDraftEntry || !supportDraftEntry || !privacyDraftEntry ||
        !byPath.has("index.html") || !byPath.has("VERSION.md")) {
      errors.push("private package is missing a runtime entry point, evidence file, phone handoff, or private draft");
      return errors;
    }
    const manifest = JSON.parse(manifestEntry.data.toString("utf8"));
    if (manifest.schemaVersion !== 4 || manifest.repository !== "mbains89/Sunsplitter" || manifest.sourceCommit !== PRIVATE_PACKAGE_SOURCE_SHA ||
        manifest.sourceTree !== PRIVATE_PACKAGE_SOURCE_TREE || manifest.posture !== "PRIVATE TEST PACKAGE · NO-PUBLISH / NOT_CERTIFIED") {
      errors.push("embedded manifest schema, source identity, or release posture drifted");
    }
    const canonicalZip = manifest.canonicalZip || {};
    if (canonicalZip.compression !== "store" || canonicalZip.pathOrder !== "UTF-8 bytewise ascending" ||
        canonicalZip.timestamp !== "1980-01-01T00:00:00Z" || canonicalZip.fileMode !== "100644" ||
        canonicalZip.directoryEntries !== false || canonicalZip.extraFields !== false || canonicalZip.archiveComment !== false) {
      errors.push("embedded canonical-ZIP method drifted");
    }

    const payloadFiles = manifest.payloadFiles || [];
    const payloadPaths = payloadFiles.map(file => file.sourcePath)
      .sort((left, right) => Buffer.compare(Buffer.from(left, "utf8"), Buffer.from(right, "utf8")));
    const payloadPathDigest = sha256(`${payloadPaths.join("\n")}\n`);
    if (payloadFiles.length !== 152 || payloadPathDigest !== PRIVATE_PACKAGE_RUNTIME_PATHS_SHA256) {
      errors.push(`runtime closure drifted: files=${payloadFiles.length} sha256=${payloadPathDigest}`);
    }
    const expectedEntryPaths = new Set([
      ...payloadFiles.map(file => file.packagePath),
      "PRIVATE_CONTENT_NOTICE.md",
      "PRIVATE_PHONE_PLAY.md",
      "PRIVATE_PHONE_SERVER.mjs",
      "PRIVATE_STORE_DRAFT.md",
      "PRIVATE_SUPPORT_DRAFT.md",
      "PRIVATE_PRIVACY_DRAFT.md",
      "PRIVATE_PACKAGE_INVENTORY.md",
      "PRIVATE_PACKAGE_MANIFEST.json"
    ]);
    if (expectedEntryPaths.size !== entries.length || paths.some(path => !expectedEntryPaths.has(path))) {
      errors.push("ZIP contains an entry outside the manifest-bound runtime closure");
    }
    for (const file of payloadFiles) {
      if (file.packagePath !== file.sourcePath) errors.push(`package/source path mismatch: ${file.packagePath}`);
      const entry = byPath.get(file.packagePath);
      if (!entry) {
        errors.push(`manifest payload is absent from ZIP: ${file.packagePath}`);
        continue;
      }
      const sourceBlob = gitBuffer(["cat-file", "blob", `${PRIVATE_PACKAGE_SOURCE_SHA}:${file.sourcePath}`]);
      if (!entry.data.equals(sourceBlob) || entry.data.length !== file.bytes || sha256(entry.data) !== file.sha256) {
        errors.push(`payload differs from exact Git blob: ${file.sourcePath}`);
      }
    }

    const phoneResume = manifest.phoneResume || {};
    exactKeys(phoneResume, [
      "guidePath", "guideBytes", "guideSha256", "serverPath", "serverBytes", "serverSha256",
      "startPath", "requiredOrigin", "serverBoundary", "publicHostRequired", "directFileModeClaimed",
      "browserProfileRequirement", "originContinuityRequirement", "privateBrowsingSupported",
      "saveStorageKey", "saveSchemaVersion", "ownerPhysicalProofRequired"
    ], "phone-resume manifest");
    const expectedPhoneResume = {
      guidePath: "PRIVATE_PHONE_PLAY.md",
      guideBytes: phoneGuideEntry.data.length,
      guideSha256: sha256(phoneGuideEntry.data),
      serverPath: "PRIVATE_PHONE_SERVER.mjs",
      serverBytes: phoneServerEntry.data.length,
      serverSha256: sha256(phoneServerEntry.data),
      startPath: "index.html",
      requiredOrigin: "STABLE_PRIVATE_HTTP_OR_HTTPS",
      serverBoundary: "TRUSTED_LAN_UNAUTHENTICATED",
      publicHostRequired: false,
      directFileModeClaimed: false,
      browserProfileRequirement: "SAME_REGULAR_BROWSER_PROFILE",
      originContinuityRequirement: "SAME_SCHEME_HOST_AND_PORT",
      privateBrowsingSupported: false,
      saveStorageKey: "sunsplitter_save_v3",
      saveSchemaVersion: 3,
      ownerPhysicalProofRequired: true
    };
    for (const [field, expected] of Object.entries(expectedPhoneResume)) {
      if (phoneResume[field] !== expected) errors.push(`phone-resume manifest field ${field}=${JSON.stringify(phoneResume[field])}; expected ${JSON.stringify(expected)}`);
    }
    const phoneGuideText = phoneGuideEntry.data.toString("utf8");
    for (const marker of [
      `SOURCE \`mbains89/Sunsplitter@${PRIVATE_PACKAGE_SOURCE_SHA}\``,
      `TREE \`${PRIVATE_PACKAGE_SOURCE_TREE}\``,
      "node PRIVATE_PHONE_SERVER.mjs",
      "regular Safari on iPhone or regular Chrome on Android",
      "tap **Save**, and confirm **Saved** appears",
      "Confirm **Continue** appears",
      "Record the exact address that opens, including the protocol and port",
      "Use the same recorded protocol, address, and port",
      "Do not use Private or Incognito browsing",
      "Persistent storage is not claimed for that route",
      "same trusted network",
      "does not publish the game to an internet host",
      "Private networks only",
      "Close the tab. Open a new regular tab",
      "Get-FileHash",
      "shasum -a 256"
    ]) {
      if (!phoneGuideText.includes(marker)) errors.push(`private phone guide missing: ${marker}`);
    }
    const phoneServerText = phoneServerEntry.data.toString("utf8");
    for (const marker of [
      `const SOURCE_COMMIT = "${PRIVATE_PACKAGE_SOURCE_SHA}"`,
      `const SOURCE_TREE = "${PRIVATE_PACKAGE_SOURCE_TREE}"`,
      "manifest.schemaVersion !== 4",
      "package payload failed manifest verification",
      "process.versions.node.split",
      "request.method !== \"GET\" && request.method !== \"HEAD\"",
      "!path || !allowed.has(path)",
      "\"Cache-Control\": \"no-store\"",
      "\"X-Content-Type-Options\": \"nosniff\"",
      "\"Cross-Origin-Resource-Policy\": \"same-origin\"",
      "\"Content-Security-Policy\"",
      "\"Referrer-Policy\": \"no-referrer\""
    ]) {
      if (!phoneServerText.includes(marker)) errors.push(`private phone server missing: ${marker}`);
    }
    const serverSyntax = spawnSync(process.execPath, ["--check", first.phoneServerPath], { encoding: "utf8" });
    if (serverSyntax.status !== 0) errors.push(`private phone server syntax failed: ${serverSyntax.stderr || serverSyntax.stdout}`);
    const phoneVerifierPath = resolve(ROOT, "scripts/verify-private-phone.mjs");
    const phoneVerifierSource = readFileSync(phoneVerifierPath, "utf8");
    for (const marker of [
      `const DEFAULT_SOURCE = "${PRIVATE_PACKAGE_SOURCE_SHA}"`,
      "LOOPBACK_HTTP_FROM_EXTRACTED_EXACT_PACKAGE",
      "PHYSICAL_DEVICE_NOT_AVAILABLE",
      "sunsplitter_save_v3",
      "browserEngine: \"chromium\"",
      "emulationOnly: true",
      "tamperedPayloadRejected: true",
      "privateTransferEvidence: \"NOT_EXERCISED\"",
      "changedOriginIsolated: true",
      "assert.equal((await fetch(new URL(\"PRIVATE_STORE_DRAFT.md\", baseUrl))).status, 404);",
      "assert.equal((await fetch(new URL(\"PRIVATE_SUPPORT_DRAFT.md\", baseUrl))).status, 404);",
      "assert.equal((await fetch(new URL(\"PRIVATE_PRIVACY_DRAFT.md\", baseUrl))).status, 404);",
      "Dr\\. Lena Voss does not waste words",
      "reopenedSameOrigin: true",
      "continueResumed: true"
    ]) {
      if (!phoneVerifierSource.includes(marker)) errors.push(`private phone browser verifier missing: ${marker}`);
    }
    const verifierSyntax = spawnSync(process.execPath, ["--check", phoneVerifierPath], { encoding: "utf8" });
    if (verifierSyntax.status !== 0) errors.push(`private phone browser verifier syntax failed: ${verifierSyntax.stderr || verifierSyntax.stdout}`);

    const privateDrafts = manifest.privateDrafts || {};
    exactKeys(privateDrafts, [
      "status", "scope", "sourceCommit", "sourceTree", "store", "support", "privacy",
      "sourceEvidence", "sourceScan", "publicationStatus", "storefrontSubmissionStatus", "price",
      "paymentStatus", "certificationStatus", "rightsClearanceStatus", "platformPolicyStatus",
      "privacyReviewStatus", "legalReviewStatus", "publicUrl", "supportContact", "privacyContact",
      "gapsParkedFor", "claimLimits"
    ], "private drafts");
    const expectedPrivateDraftFields = {
      status: "DRAFT_PRIVATE_METADATA_ONLY",
      scope: "PRIVATE_PACKAGE_ONLY",
      sourceCommit: PRIVATE_PACKAGE_SOURCE_SHA,
      sourceTree: PRIVATE_PACKAGE_SOURCE_TREE,
      publicationStatus: "NOT_AUTHORIZED",
      storefrontSubmissionStatus: "NOT_SUBMITTED",
      price: null,
      paymentStatus: "NOT_OFFERED_IN_THIS_DRAFT",
      certificationStatus: "NOT_CERTIFIED",
      rightsClearanceStatus: "NOT_EVIDENCED_IN_REPOSITORY",
      platformPolicyStatus: "DEFERRED_TO_0_39_SUBMISSION_TIME_RECHECK",
      privacyReviewStatus: "DRAFT_STATIC_BUILD_OBSERVATIONS_ONLY",
      legalReviewStatus: "NOT_RECORDED",
      publicUrl: null,
      supportContact: null,
      privacyContact: null,
      gapsParkedFor: "0.39"
    };
    for (const [field, expected] of Object.entries(expectedPrivateDraftFields)) {
      if (privateDrafts[field] !== expected) errors.push(`private-draft manifest field ${field}=${JSON.stringify(privateDrafts[field])}; expected ${JSON.stringify(expected)}`);
    }
    const draftArtifacts = [
      ["store", "PRIVATE_STORE_DRAFT.md", storeDraftEntry],
      ["support", "PRIVATE_SUPPORT_DRAFT.md", supportDraftEntry],
      ["privacy", "PRIVATE_PRIVACY_DRAFT.md", privacyDraftEntry]
    ];
    for (const [kind, path, entry] of draftArtifacts) {
      const artifact = privateDrafts[kind] || {};
      exactKeys(artifact, ["path", "bytes", "sha256"], `private ${kind} draft`);
      if (artifact.path !== path || artifact.bytes !== entry.data.length || artifact.sha256 !== sha256(entry.data)) {
        errors.push(`private ${kind} draft manifest binding drifted`);
      }
      if (payloadFiles.some(file => file.packagePath === path)) errors.push(`private ${kind} draft entered runtime payload allowlist`);
    }
    const expectedDraftClaimLimits = [
      "NO_PUBLICATION_AUTHORIZED",
      "NO_STOREFRONT_SUBMISSION",
      "NO_PRICE_OR_PAYMENT_TERMS",
      "NO_CERTIFICATION_CLAIM",
      "NO_RIGHTS_CLEARANCE_CLAIM",
      "NO_PLATFORM_POLICY_VERIFICATION",
      "NO_COMPREHENSIVE_PRIVACY_PROMISE"
    ];
    if (!sameArray(privateDrafts.claimLimits || [], expectedDraftClaimLimits)) errors.push("private-draft claim limits drifted");

    const commonDraftMarkers = [
      `SOURCE \`mbains89/Sunsplitter@${PRIVATE_PACKAGE_SOURCE_SHA}\``,
      `TREE \`${PRIVATE_PACKAGE_SOURCE_TREE}\``,
      "PACKAGE VERSION `0.33`",
      "DRAFT · NON-PUBLIC · PRIVATE TEST PACKAGE · NO-PUBLISH / NOT_CERTIFIED",
      "**Use:** NOT FOR PUBLICATION.",
      "Parked for 0.39"
    ];
    const draftTexts = {
      store: storeDraftEntry.data.toString("utf8"),
      support: supportDraftEntry.data.toString("utf8"),
      privacy: privacyDraftEntry.data.toString("utf8")
    };
    for (const [kind, text] of Object.entries(draftTexts)) {
      for (const marker of commonDraftMarkers) {
        if (!text.includes(marker)) errors.push(`private ${kind} draft missing: ${marker}`);
      }
    }
    for (const marker of [
      "**Title:** Sunsplitter",
      "Command a damaged colonization ark after Earth's sudden cascade.",
      "current source-grounded draft descriptors",
      "Local save and Continue in the same browser.",
      "not a live listing, submission, offer for sale, publication authorization, certification, or rights-clearance statement",
      "Commercial terms, payment configuration, business/tax decisions, and public launch timing",
      "the current inventory records gaps and does not grant clearance"
    ]) if (!draftTexts.store.includes(marker)) errors.push(`private store draft missing: ${marker}`);
    for (const marker of [
      "verify the checksum before extracting",
      "PRIVATE_PHONE_PLAY.md",
      "exact same full address in the same regular browser",
      "Do not send a save file or screenshot unless the sender separately asks",
      "Hide private addresses and personal information first",
      "same private handoff channel through which you received the package",
      "No public support address or response time is established here"
    ]) if (!draftTexts.support.includes(marker)) errors.push(`private support draft missing: ${marker}`);
    for (const marker of [
      "No analytics or telemetry integration was observed in the inspected runtime files.",
      "It is not a comprehensive privacy audit.",
      "No upload or sync behavior was observed in the inspected runtime files.",
      "uses HTTP, not HTTPS",
      "has no authentication, accepts no uploads, writes no application request log",
      "external font stylesheet reference",
      "another opening method may let the browser attempt the external request",
      "The method used to send the ZIP is outside this package",
      "This draft does not declare them complete"
    ]) if (!draftTexts.privacy.includes(marker)) errors.push(`private privacy draft missing: ${marker}`);

    const draftEvidence = privateDrafts.sourceEvidence || [];
    const expectedDraftEvidencePaths = ["README.md", "index.html", "src/engine.js", "css/style.css"];
    if (!sameArray(draftEvidence.map(evidence => evidence.path), expectedDraftEvidencePaths)) {
      errors.push(`private-draft evidence paths drifted: ${draftEvidence.map(evidence => evidence.path).join(",")}`);
    }
    for (const evidence of draftEvidence) {
      exactKeys(evidence, ["path", "gitBlob", "bytes", "sha256", "observedStatements"], `private-draft evidence ${evidence.path || "missing"}`);
      const sourceBlob = gitBuffer(["cat-file", "blob", `${PRIVATE_PACKAGE_SOURCE_SHA}:${evidence.path}`]);
      const sourceText = sourceBlob.toString("utf8");
      if (sourceBlob.length !== evidence.bytes || sha256(sourceBlob) !== evidence.sha256 ||
          git(["rev-parse", `${PRIVATE_PACKAGE_SOURCE_SHA}:${evidence.path}`]) !== evidence.gitBlob) {
        errors.push(`private-draft evidence identity drifted: ${evidence.path}`);
      }
      for (const statement of evidence.observedStatements || []) {
        if (!sourceText.includes(statement)) errors.push(`private-draft evidence statement is absent: ${evidence.path} :: ${statement}`);
      }
    }
    const sourceScan = privateDrafts.sourceScan || {};
    exactKeys(sourceScan, ["inspectedTextPaths", "networkApiMatches", "externalReferences"], "private-draft source scan");
    const expectedTextPaths = [
      "VERSION.md", "css/style.css", "index.html", "src/engine.js",
      ...Array.from({ length: 55 }, (_, index) => `src/scenes-${String(index + 1).padStart(2, "0")}.js`),
      "src/state.js", "src/validate.js"
    ];
    if (!sameArray(sourceScan.inspectedTextPaths || [], expectedTextPaths)) errors.push("private-draft inspected runtime path set drifted");
    if ((sourceScan.networkApiMatches || []).length !== 0) errors.push("private-draft source scan found a network API");
    const expectedExternalReferences = [{
      path: "css/style.css",
      url: "https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=IBM+Plex+Sans:wght@300;400;500;600&display=swap"
    }];
    if (JSON.stringify(sourceScan.externalReferences || []) !== JSON.stringify(expectedExternalReferences)) {
      errors.push(`private-draft external reference evidence drifted: ${JSON.stringify(sourceScan.externalReferences || [])}`);
    }
    const allDraftText = Object.values(draftTexts).join("\n");
    for (const [pattern, label] of [
      [/\b(?:itch\.io|steam|esrb|pegi|iarc|gog|epic games)\b/i, "named storefront or ratings authority"],
      [/https?:\/\//i, "public web URL"],
      [/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i, "email address"],
      [/(?:[$€£]\s*\d|\b\d+(?:\.\d{2})?\s*(?:USD|CAD|GBP|EUR)\b)/i, "currency amount"],
      [/\b(?:buy now|purchase now|add to cart|pay what you want|free-to-play|available now|wishlist)\b/i, "commercial call to action"],
      [/\b(?:is published|is released|is certified|is approved|is compliant|rights (?:are )?cleared|licensed for distribution|all rights secured)\b/i, "affirmative publication, certification, compliance, or rights claim"],
      [/\b(?:we collect no data|no data collection|no tracking|no cookies|gdpr|ccpa|coppa|anonymous|guaranteed secure)\b/i, "comprehensive privacy or compliance claim"]
    ]) {
      if (pattern.test(allDraftText)) errors.push(`private draft contains forbidden ${label}`);
    }

    const contentNotice = manifest.contentNotice || {};
    exactKeys(contentNotice, [
      "path", "bytes", "sha256", "playerFacing", "openingNoticeEvidencePath",
      "existingInGameSurface", "generatedFromEvidencePaths"
    ], "content-notice manifest");
    if (contentNotice.path !== "PRIVATE_CONTENT_NOTICE.md" || contentNotice.bytes !== contentNoticeEntry.data.length ||
        contentNotice.sha256 !== sha256(contentNoticeEntry.data) || contentNotice.playerFacing !== true ||
        contentNotice.openingNoticeEvidencePath !== "index.html" || contentNotice.existingInGameSurface !== "index.html#tone-screen") {
      errors.push("private content-notice manifest binding drifted");
    }
    const noticeText = contentNoticeEntry.data.toString("utf8");
    for (const marker of [
      `SOURCE \`mbains89/Sunsplitter@${PRIVATE_PACKAGE_SOURCE_SHA}\``,
      "PRIVATE TEST PACKAGE · NO-PUBLISH / NOT_CERTIFIED",
      "Optional and refusable explicit sexual text, sexualized imagery, and full nudity",
      "Sexual relationships within a commander/crew hierarchy",
      "Intimate recording, disclosure, and loss-of-privacy themes.",
      "Pregnancy risk, post-coital prevention, embryos, and reproductive-resource triage.",
      "Blood, serious injury, medical trauma, suffocation/decompression, and named-character death.",
      "Brief use of an unspecified non-regulation drink.",
      "not a platform age rating, storefront submission, publication authorization, or commercial claim"
    ]) {
      if (!noticeText.includes(marker)) errors.push(`private content notice missing: ${marker}`);
    }

    const classification = manifest.adultClassificationDraft || {};
    const expectedClassificationFields = {
      status: "DRAFT_PRIVATE_METADATA_ONLY",
      scope: "PRIVATE_PACKAGE_ONLY",
      sourceCommit: PRIVATE_PACKAGE_SOURCE_SHA,
      sourceTree: PRIVATE_PACKAGE_SOURCE_TREE,
      platform: null,
      officialRating: null,
      ratingAuthority: null,
      submitted: false,
      adultContent: true,
      sexualContentStatus: "PRESENT_AND_PERMANENT_IN_BUILD",
      explicitSexualText: true,
      fullNudity: true,
      sexualizedImagery: true,
      multiPartnerSexualContent: true,
      commanderCrewSexualPowerDynamics: true,
      intimateRecordingAndDisclosure: true,
      bloodAndMedicalTrauma: true,
      namedCharacterDeath: true,
      decompressionAndSuffocation: true,
      massCasualtyDisasterAndGrief: true,
      pregnancyAndReproductiveThemes: true,
      briefUnspecifiedDrinkUse: true,
      reducedContentModeAvailable: false
    };
    exactKeys(classification, [
      ...Object.keys(expectedClassificationFields),
      "descriptors", "sourceEvidence", "claimLimits"
    ], "adult-classification draft");
    for (const [field, expected] of Object.entries(expectedClassificationFields)) {
      if (classification[field] !== expected) errors.push(`adult-classification draft field ${field}=${JSON.stringify(classification[field])}; expected ${JSON.stringify(expected)}`);
    }
    const descriptors = classification.descriptors || [];
    const descriptorIds = descriptors.map(descriptor => descriptor.id);
    const expectedDescriptorIds = [
      "explicit-sexual-content-nudity-and-sexualized-imagery",
      "command-hierarchy-consent-and-favoritism",
      "intimate-recording-disclosure-and-privacy",
      "pregnancy-and-reproductive-survival",
      "blood-medical-trauma-death-and-decompression",
      "mass-death-grief-isolation-and-moral-distress",
      "resource-scarcity-and-lethal-decisions",
      "brief-unspecified-drink-use"
    ];
    if (!sameArray(descriptorIds, expectedDescriptorIds)) errors.push(`adult-classification descriptor set drifted: ${descriptorIds.join(",")}`);
    for (const descriptor of descriptors) {
      exactKeys(descriptor, ["id", "runExposure", "playerFacingText"], `adult descriptor ${descriptor.id || "missing"}`);
      if (!descriptor.playerFacingText || !noticeText.includes(descriptor.playerFacingText)) {
        errors.push(`adult descriptor is absent from player-facing notice: ${descriptor.id}`);
      }
    }
    const sourceEvidence = classification.sourceEvidence || [];
    const supportedDescriptorIds = new Set();
    const expectedEvidencePaths = [
      "index.html",
      "src/scenes-30.js",
      "src/scenes-31.js",
      "src/scenes-32.js",
      "src/scenes-36.js",
      "src/scenes-38.js",
      "src/scenes-02.js",
      "src/scenes-42.js",
      "artifacts/ART_REQUESTS.md",
      "images/shower_mira.jpg",
      "images/lingerie_mira.jpg",
      "images/afterglow_mira.jpg",
      "images/romance_amara_tomas.jpg"
    ];
    const evidencePaths = sourceEvidence.map(evidence => evidence.path);
    if (!sameArray(evidencePaths, expectedEvidencePaths) || new Set(evidencePaths).size !== evidencePaths.length) {
      errors.push(`adult-classification exact-source evidence paths drifted: ${evidencePaths.join(",")}`);
    }
    if (!sameArray(contentNotice.generatedFromEvidencePaths || [], expectedEvidencePaths)) {
      errors.push("content-notice generated-source provenance drifted");
    }
    for (const evidence of sourceEvidence) {
      exactKeys(evidence, ["path", "gitBlob", "bytes", "sha256", "supports", "observedStatements"], `adult evidence ${evidence.path || "missing"}`);
      const sourceBlob = gitBuffer(["cat-file", "blob", `${PRIVATE_PACKAGE_SOURCE_SHA}:${evidence.path}`]);
      const sourceText = evidence.observedStatements?.length ? sourceBlob.toString("utf8") : "";
      if (sourceBlob.length !== evidence.bytes || sha256(sourceBlob) !== evidence.sha256 ||
          git(["rev-parse", `${PRIVATE_PACKAGE_SOURCE_SHA}:${evidence.path}`]) !== evidence.gitBlob) {
        errors.push(`adult-classification evidence identity drifted: ${evidence.path}`);
      }
      for (const statement of evidence.observedStatements || []) {
        if (!sourceText.includes(statement)) errors.push(`adult-classification evidence statement is absent: ${evidence.path} :: ${statement}`);
      }
      for (const descriptorId of evidence.supports || []) supportedDescriptorIds.add(descriptorId);
    }
    for (const descriptorId of descriptorIds) {
      if (!supportedDescriptorIds.has(descriptorId)) errors.push(`adult descriptor lacks exact-source evidence: ${descriptorId}`);
    }
    const expectedClaimLimits = [
      "NO_PLATFORM_AGE_RATING_ASSIGNED",
      "NO_STOREFRONT_CLASSIFICATION_SUBMITTED",
      "NO_PUBLICATION_AUTHORIZED"
    ];
    if (!sameArray(classification.claimLimits || [], expectedClaimLimits)) errors.push("adult-classification claim limits drifted");
    const claimText = `${noticeText}\n${JSON.stringify(classification)}`;
    for (const [pattern, label] of [
      [/\b(?:itch\.io|steam|esrb|pegi|iarc|gog|epic games)\b/i, "named platform or ratings authority"],
      [/\b(?:price|pricing|paid|free-to-play)\b/i, "price or payment claim"],
      [/\b(?:18\+|adults only|mature 17\+)\b/i, "invented age classification"]
    ]) {
      if (pattern.test(claimText)) errors.push(`private adult metadata contains ${label}`);
    }

    const inventory = manifest.inventory || {};
    const trackedAssets = inventory.trackedAssets || [];
    const duplicateAssets = trackedAssets.filter(asset => asset.duplicateOf);
    if (trackedAssets.length !== 169 || trackedAssets.filter(asset => asset.packageIncluded).length !== 91 || duplicateAssets.length !== 3) {
      errors.push(`asset inventory drifted: assets=${trackedAssets.length} included=${trackedAssets.filter(asset => asset.packageIncluded).length} duplicates=${duplicateAssets.length}`);
    }
    if ((inventory.trackedFontFiles || []).length !== 0 || (inventory.trackedLicenseFiles || []).length !== 0 ||
        (inventory.externalFontStylesheets || []).length !== 1) {
      errors.push("font or repository-license inventory drifted");
    }
    if (trackedAssets.some(asset => asset.licenseEvidence !== "NOT_EVIDENCED_IN_REPOSITORY" ||
        asset.rightsStatus !== "PROJECT_LOCK_NOT_RIGHTS_EVIDENCE" || asset.mime !== "image/jpeg")) {
      errors.push("asset MIME or rights-evidence posture drifted");
    }
    const inventoryText = inventoryEntry.data.toString("utf8");
    for (const marker of ["NOT_EVIDENCED_IN_REPOSITORY", "PROJECT_LOCK_NOT_RIGHTS_EVIDENCE", "No font binaries are tracked or bundled", "No LICENSE, LICENCE, COPYING, or NOTICE file is tracked"]) {
      if (!inventoryText.includes(marker)) errors.push(`inventory disclosure missing: ${marker}`);
    }
    if (!readFileSync(first.manifestPath).equals(manifestEntry.data) || !readFileSync(first.inventoryPath).equals(inventoryEntry.data) ||
        !readFileSync(first.contentNoticePath).equals(contentNoticeEntry.data) ||
        !readFileSync(first.phoneGuidePath).equals(phoneGuideEntry.data) || !readFileSync(first.phoneServerPath).equals(phoneServerEntry.data) ||
        !readFileSync(first.storeDraftPath).equals(storeDraftEntry.data) || !readFileSync(first.supportDraftPath).equals(supportDraftEntry.data) ||
        !readFileSync(first.privacyDraftPath).equals(privacyDraftEntry.data)) {
      errors.push("embedded manifest, inventory, content notice, phone handoff, or private draft differs from its sidecar");
    }
    const checksumText = readFileSync(first.checksumPath, "utf8");
    if (checksumText !== `${PRIVATE_PACKAGE_SHA256}  ${archiveName}\n`) errors.push("archive checksum sidecar drifted");
    for (const forbidden of [".git/", ".github/", ".netlify/", "artifacts/", "scripts/", "netlify.toml", "SUNSPLITTER_STORYLINE_EXTERNAL_REVIEW_792E202_R1.md"]) {
      if (paths.some(path => path === forbidden || path.startsWith(forbidden))) errors.push(`private package contains forbidden repository material: ${forbidden}`);
    }
  } catch (error) {
    errors.push(error.stack || error.message);
  } finally {
    rmSync(temporaryRoot, { recursive: true, force: true });
  }
  return errors;
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
  // requiredSrcTree is the CI-reconcile pin and applies only on that ticket/version route
  // (fixture note). Empty VERIFY_HEAD_REF must not treat unrelated ticket branches as reconcile.
  const testedRef = process.env.VERIFY_HEAD_REF || "";
  const headRef = testedRef || git(["rev-parse", "--abbrev-ref", "HEAD"]);
  const currentReconciliationRoute = headRef === fixture.branches.ticket || headRef === fixture.branches.version;
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

function titleContinueCrewCountChecks(runtime) {
  const errors = [];
  const fixture = runtime.evaluate(`(() => {
    const paint = () => {
      refreshTitleResumeUI();
      const meta = document.getElementById("resume-meta");
      const resume = document.getElementById("btn-resume");
      const chip = document.getElementById("title-save-chip");
      const hint = document.getElementById("save-hint");
      const begin = document.getElementById("btn-begin");
      const extra = ["export-import-chip", "new-run-confirm-copy", "new-run-confirm-chip"]
        .map(id => {
          const el = document.getElementById(id);
          return el ? String(el.textContent || "") : "";
        });
      return {
        meta: meta ? String(meta.textContent || "") : "",
        metaHidden: !!(meta && meta.classList.contains("hidden")),
        metaPaint: meta ? meta.getAttribute("data-paint") : null,
        resumeHidden: !!(resume && resume.classList.contains("hidden")),
        resumeText: resume ? String(resume.textContent || "") : "",
        chip: chip ? String(chip.textContent || "") : "",
        chipHidden: !!(chip && chip.classList.contains("hidden")),
        hint: hint ? String(hint.textContent || "") : "",
        begin: begin ? String(begin.textContent || "") : "",
        extra
      };
    };
    const stored = () => {
      const raw = readRawSave();
      const data = raw ? JSON.parse(raw) : null;
      return {
        raw,
        survivors: data ? data.survivors : null,
        dead: data && Array.isArray(data.dead) ? data.dead.slice() : [],
        recovered: data && data.recovered ? Object.assign({}, data.recovered) : {}
      };
    };
    const diverge = () => {
      state.survivors = 1;
      state.dead = CREW_ORDER.slice();
      state.recovered = { tomas: true, jiro: true, vess: true };
    };
    const loadHud = () => {
      const ok = loadGame();
      return {
        ok,
        hud: String(document.getElementById("stat-survivors").textContent),
        resource: state.survivors
      };
    };
    const drive = (mutate) => {
      localStorage.clear();
      resetRunState();
      if (mutate) mutate();
      const resource = state.survivors;
      persistSave({ silent: true });
      const snap = stored();
      const painted = paint();
      const raw = snap.raw;
      diverge();
      const diverged = paint();
      const rawHeld = readRawSave() === raw;
      const loaded = loadHud();
      return { resource, snap, painted, diverged, rawHeld, loaded };
    };

    localStorage.clear();
    resetRunState();
    const empty = paint();
    const freshResource = state.survivors;
    const rosterLength = CREW_ORDER.length;
    const version = typeof VERSION === "undefined" ? "" : String(VERSION);

    const wake = drive();
    const death = drive(() => { kill("lena", "visible death fixture"); });
    const recovery = drive(() => { scenes.act2_tether_dock.onEnter(); });

    clearSave();
    const cleared = paint();
    localStorage.clear();
    resetRunState();
    return { empty, cleared, freshResource, rosterLength, version, wake, death, recovery };
  })()`);

  const aliveCount = (text) => {
    const matches = String(text ?? "").match(/\d+\s+alive/g) || [];
    if (matches.length !== 1) return null;
    return matches[0].match(/\d+/)[0];
  };
  const hiddenSlot = (label, row) => {
    if (!row.resumeHidden || !row.metaHidden) errors.push(`${label}: Continue control still visible`);
    if (row.meta) errors.push(`${label}: #resume-meta still shows ${JSON.stringify(row.meta)}`);
    if (aliveCount(row.meta) != null || aliveCount(row.chip) != null || aliveCount(row.hint) != null) {
      errors.push(`${label}: crew count is still shown`);
    }
    if (row.begin !== "Begin") errors.push(`${label}: Begin label is ${JSON.stringify(row.begin)}`);
  };
  const adjacentClean = (label, row, resource, roster) => {
    const blobs = [row.chip, row.hint, row.resumeText, row.begin, ...(row.extra || [])];
    for (const blob of blobs) {
      if (/\d+\s+alive/.test(blob) || blob.includes(`${resource} alive`) || blob.includes(`${roster} alive`)) {
        errors.push(`${label}: continue-adjacent status presents a crew count (${JSON.stringify(blob)})`);
      }
    }
  };
  const assertCase = (label, row, { moves, direction, lost }) => {
    const count = aliveCount(row.painted.meta);
    const diverged = aliveCount(row.diverged.meta);
    const hud = String(row.loaded.hud);
    const survivors = row.snap.survivors;
    if (!row.loaded.ok) errors.push(`${label}: load failed`);
    if (count == null) errors.push(`${label}: Continue count missing from ${JSON.stringify(row.painted.meta)}`);
    if (count !== hud) errors.push(`${label}: Continue ${count} != HUD Crew ${hud}`);
    if (count != null && count === String(survivors)) errors.push(`${label}: Continue tracks survivors ${survivors}`);
    if (count != null && count === String(fixture.rosterLength)) errors.push(`${label}: Continue tracks roster length ${fixture.rosterLength}`);
    if (String(survivors) === hud) errors.push(`${label}: HUD Crew collapsed onto survivors ${survivors}`);
    if (row.snap.survivors !== row.resource) errors.push(`${label}: save rewrote survivors from ${row.resource} to ${row.snap.survivors}`);
    if (row.loaded.resource !== row.resource) errors.push(`${label}: load rewrote survivors to ${row.loaded.resource}`);
    if (row.painted.resumeHidden || row.painted.metaHidden) errors.push(`${label}: Continue hidden while a save exists`);
    if (row.painted.metaPaint !== fixture.version || !row.painted.meta.startsWith(`v${fixture.version} · `)) {
      errors.push(`${label}: version paint drifted (${JSON.stringify(row.painted.meta)})`);
    }
    if (!row.painted.meta.includes(lost)) errors.push(`${label}: Continue dropped ${lost}`);
    if (diverged !== count || row.diverged.meta !== row.painted.meta) {
      errors.push(`${label}: Continue followed unsaved live state (${JSON.stringify(row.diverged.meta)})`);
    }
    if (!row.rawHeld) errors.push(`${label}: title repaint wrote the save slot`);
    if (moves != null && count != null && Number(count) === Number(moves)) {
      errors.push(`${label}: Continue did not move from the wake count ${moves}`);
    }
    if (direction && count != null && moves != null) {
      const delta = Number(count) - Number(moves);
      if (direction === "down" && !(delta < 0)) errors.push(`${label}: Continue did not fall after a visible death`);
      if (direction === "up" && !(delta > 0)) errors.push(`${label}: Continue did not rise after a recovery`);
    }
    adjacentClean(label, row.painted, survivors, fixture.rosterLength);
    adjacentClean(`${label} diverged`, row.diverged, survivors, fixture.rosterLength);
    return count;
  };

  if (!fixture || fixture.freshResource == null) {
    errors.push("Continue crew fixture did not run");
    return errors;
  }
  hiddenSlot("empty slot", fixture.empty);
  hiddenSlot("cleared slot", fixture.cleared);
  if (fixture.freshResource === fixture.rosterLength && String(fixture.wake.loaded.hud) === String(fixture.freshResource)) {
    errors.push("wake HUD matches both survivors and the full roster; fixture cannot separate them");
  }

  const wakeCount = assertCase("wake", fixture.wake, { lost: "intact" });
  if (fixture.wake.snap.survivors !== fixture.freshResource) {
    errors.push(`wake survivors ${fixture.wake.snap.survivors} != fresh resource ${fixture.freshResource}`);
  }
  if (wakeCount != null && wakeCount === String(fixture.freshResource)) {
    errors.push("wake Continue still prints the mechanical survivors resource");
  }

  assertCase("visible death", fixture.death, { moves: wakeCount, direction: "down", lost: "1 lost" });
  if (fixture.death.snap.dead.length !== 1 || fixture.death.snap.dead[0] !== "lena") {
    errors.push(`visible death snapshot dead list is ${JSON.stringify(fixture.death.snap.dead)}`);
  }

  assertCase("recovery", fixture.recovery, { moves: wakeCount, direction: "up", lost: "intact" });
  if (!fixture.recovery.snap.recovered || fixture.recovery.snap.recovered.tomas !== true) {
    errors.push("recovery snapshot did not record recovered.tomas");
  }
  if (fixture.recovery.snap.recovered.jiro || fixture.recovery.snap.recovered.vess) {
    errors.push("recovery snapshot recovered someone other than Tomas");
  }
  if (fixture.recovery.resource !== fixture.freshResource) {
    errors.push("Tomas recovery changed the mechanical survivors resource");
  }
  return errors;
}

// SUN-CLEAN-ORPHAN-CHECKS-01: regression checks that were written for this gate and never
// registered, so nothing ran them. The two that need a runtime get one of their own, so they
// cannot disturb the shared runtime or be disturbed by it. The two scripts keep their own
// entry points and run as child processes from the repository root; each must exit 0 and
// print its pass line, so a script that asserts nothing cannot read as a pass.
const ADOPTED_CHECK_SCRIPTS = [
  ["SUN-BUGHUNT-01 board counts, vent memorial, cylinder wording", "scripts/sun-bughunt-01-checks.mjs", "sun-bughunt-01-checks: PASS"],
  ["SUN-V036-WHAT-REMAINS-ENTRY-01 What Remains entry points", "scripts/playtest-what-remains-entry-01-checks.mjs", "WHAT_REMAINS_ENTRY_OK"]
];

function adoptedChecks() {
  const guarded = check => {
    try {
      const out = check();
      return Array.isArray(out) ? out : [`check returned ${typeof out}, expected an array of errors`];
    } catch (error) {
      return [error.stack || error.message];
    }
  };
  const results = [
    ["SUN-CASCADE-ALLUSIVE-PAYOFF-01 change orders paid once, on faction_split", guarded(() => cascadeAllusivePayoffChecks())],
    ["SUN-CASCADE-SECOND-FLAG-PAYOFF-01 manifest paid on reckon_public", guarded(() => cascadeSecondFlagPayoffChecks())],
    ["SUN-MIDGAME-DELAYED-CONSEQUENCE-01/02 change orders + manifest paid on faction_split", guarded(() => midgameDelayedConsequenceChecks())],
    ["SUN-MIDGAME-THIRD-CONSEQUENCE-01 manifest_exposed / manifest_lie paid on faction_split", guarded(() => midgameThirdConsequenceChecks())],
    ["SUN-LETHAL-RESUME-DEATHBEAT-01 resumed lethal scene does not re-enter", guarded(() => lethalResumeDeathbeatChecks())],
    ["SUN-FIX-VENT-BUNKS-01 aftermath bunk and living counts", guarded(() => ventBunksChecks(loadGame(ROOT)))],
    ["SUN-CREW-BOARD-FOLLOW-CLARITY-01 first Crew tap shows the board", guarded(() => playtestCrewBoardFollowClarity01Checks(loadGame(ROOT)))]
  ];
  for (const [label, script, passLine] of ADOPTED_CHECK_SCRIPTS) {
    const run = spawnSync(process.execPath, [resolve(ROOT, script)], { cwd: ROOT, encoding: "utf8", timeout: 60_000 });
    const lines = `${run.stderr || ""}\n${run.stdout || ""}`.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
    const telling = lines.filter(line => /Error|FAIL/.test(line));
    const detail = (telling.length ? telling : lines).slice(0, 4).join(" | ");
    const errors = [];
    if (run.error || run.status !== 0) {
      errors.push(`${script} exited ${run.status ?? run.signal ?? run.error?.code}: ${detail}`);
    } else if (!String(run.stdout || "").includes(passLine)) {
      errors.push(`${script} exited 0 without printing "${passLine}"`);
    }
    results.push([label, errors]);
  }
  return results;
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
  const reviewBuildStampErrors = reviewBuildStampChecks();
  printCheck("SUN-037-REVIEW-BUILD-01 private review build stamp", reviewBuildStampErrors);
  failures.push(...reviewBuildStampErrors);
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
  const pcViewportErrors = pcViewportChecks(ROOT);
  printCheck("0.36 short desktop viewport", pcViewportErrors);
  failures.push(...pcViewportErrors);

  const mobileUsabilityErrors = mobileUsabilityContractChecks();
  printCheck("0.34 real-phone layout + gesture contract", mobileUsabilityErrors);
  failures.push(...mobileUsabilityErrors);

  const accessibilitySourceErrors = accessibilitySourceChecks();
  printCheck("0.34 accessibility source contract", accessibilitySourceErrors);
  failures.push(...accessibilitySourceErrors);

  const performanceSourceErrors = performanceSourceChecks();
  printCheck("0.34 image + lifecycle performance source contract", performanceSourceErrors);
  failures.push(...performanceSourceErrors);

  const privatePackageErrors = privatePackageChecks();
  printCheck("0.35 exact-source private package + non-public draft contract", privatePackageErrors,
    `source=${PRIVATE_PACKAGE_SOURCE_SHA.slice(0, 8)} archive=${PRIVATE_PACKAGE_SHA256.slice(0, 12)}`);
  failures.push(...privatePackageErrors);

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

    const stillBurningCorridorErrors = stillBurningCorridorChecks(runtime);
    printCheck("course_briefed Still Burning corridor citation", stillBurningCorridorErrors);
    failures.push(...stillBurningCorridorErrors);

    const cascadeErrors = cascadeAndMirrorChecks(runtime);
    printCheck("Cascade hosts + mirrors + phrase ownership", cascadeErrors);
    failures.push(...cascadeErrors);

    const newRunErrors = newRunChecks(runtime);
    printCheck("0.32 New Run confirmation + atomic replacement", newRunErrors);
    failures.push(...newRunErrors);

    const contentNoticeRevisitErrors = contentNoticeRevisitChecks(runtime);
    printCheck("L-009 content notice revisitable from title/utilities", contentNoticeRevisitErrors);
    failures.push(...contentNoticeRevisitErrors);

    const suppliesReserveErrors = suppliesReserveChecks(runtime);
    printCheck("0.35 finite Supplies reserve + unchanged saved balances", suppliesReserveErrors);
    failures.push(...suppliesReserveErrors);

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

    const screenTransitionScrollErrors = screenTransitionScrollChecks(runtime);
    printCheck("0.34 phone surface scroll reset", screenTransitionScrollErrors);
    failures.push(...screenTransitionScrollErrors);

    const accessibilityRuntimeErrors = accessibilityRuntimeChecks(runtime);
    printCheck("0.34 accessibility runtime labels + alternatives", accessibilityRuntimeErrors);
    failures.push(...accessibilityRuntimeErrors);

    const midgameVarietyErrors = midgameVarietyChecks(runtime);
    printCheck("0.35 existing mid-game event variety + saved offer stability", midgameVarietyErrors);
    failures.push(...midgameVarietyErrors);

    const cinematicErrors = cinematicChecks(runtime);
    printCheck("0.35 skippable intro/ending + presentation-only save custody", cinematicErrors);
    failures.push(...cinematicErrors);

    const maleCrewErrors = maleCrewChecks(runtime);
    printCheck("0.35 existing male crew personality follow-through + save custody", maleCrewErrors);
    failures.push(...maleCrewErrors);

    const artEventErrors = artEventChecks(runtime);
    printCheck("0.35 confirmed event-art retargets + saved-render guards", artEventErrors);
    failures.push(...artEventErrors);

    const crewOverviewErrors = crewOverviewChecks(runtime);
    printCheck("0.35 HUD Crew disclosure + truthful read-only crew stats", crewOverviewErrors);
    failures.push(...crewOverviewErrors);

    const titleContinueCrewErrors = titleContinueCrewCountChecks(runtime);
    printCheck("title Continue crew count matches snapshot-visible HUD crew", titleContinueCrewErrors);
    failures.push(...titleContinueCrewErrors);

    const performanceRuntimeErrors = performanceRuntimeChecks(runtime);
    printCheck("0.34 image residency + background resume runtime", performanceRuntimeErrors);
    failures.push(...performanceRuntimeErrors);

    const resumeEntryErrors = resumeEntryIdempotenceChecks(runtime);
    printCheck("resume preserves completed scene entry", resumeEntryErrors);
    failures.push(...resumeEntryErrors);

    const saveVersionSemanticErrors = saveVersionSemanticChecks(runtime);
    printCheck("0.32 semantic save-version compatibility", saveVersionSemanticErrors);
    failures.push(...saveVersionSemanticErrors);

    const warmthLaughterErrors = warmthLaughterChecks(runtime);
    printCheck("warmth_laughter living/dead Vess guard", warmthLaughterErrors);
    failures.push(...warmthLaughterErrors);

    const rourkeDyingImageErrors = rourkeDyingImageHonestyChecks(runtime);
    printCheck("dying Rourke image honesty", rourkeDyingImageErrors);
    failures.push(...rourkeDyingImageErrors);

    const romanceLena1ImageTruthErrors = romanceLena1ImageTruthChecks(runtime);
    printCheck("SUN-V035-ART-R2-LENA-01 clothed blister plate", romanceLena1ImageTruthErrors);
    failures.push(...romanceLena1ImageTruthErrors);

    const romanceAmara1ImageTruthErrors = romanceAmara1ImageTruthChecks(runtime);
    printCheck("SUN-V035-ART-R2-AMARA-01 hydroponics tray plate", romanceAmara1ImageTruthErrors);
    failures.push(...romanceAmara1ImageTruthErrors);

    const tetherHandEliasImageTruthErrors = tetherHandEliasImageTruthChecks(runtime);
    printCheck("SUN-V035-ART-R2-ELIAS-TETHER-01 exterior tether plate", tetherHandEliasImageTruthErrors);
    failures.push(...tetherHandEliasImageTruthErrors);

    const lethalEliasOrderImageTruthErrors = lethalEliasOrderImageTruthChecks(runtime);
    printCheck("SUN-V035-ART-R2-ELIAS-LETHAL-01 station work plate", lethalEliasOrderImageTruthErrors);
    failures.push(...lethalEliasOrderImageTruthErrors);

    const romanceMira1ImageTruthErrors = romanceMira1ImageTruthChecks(runtime);
    printCheck("SUN-V035-ART-R2-MIRA-01 engineering console plate", romanceMira1ImageTruthErrors);
    failures.push(...romanceMira1ImageTruthErrors);

    const lethalEliasSealantImageTruthErrors = lethalEliasSealantImageTruthChecks(runtime);
    printCheck("SUN-V035-ART-R2-ELIAS-SEALANT-01 station work plate", lethalEliasSealantImageTruthErrors);
    failures.push(...lethalEliasSealantImageTruthErrors);

    const lenaIntimacyImageTruthErrors = lenaIntimacyImageTruthChecks(runtime);
    printCheck("0.33 Lena intimacy locked-plate truth", lenaIntimacyImageTruthErrors);
    failures.push(...lenaIntimacyImageTruthErrors);

    const tetherRushImageTruthErrors = tetherRushImageTruthChecks(runtime);
    printCheck("0.33 tether rush distinct locked-plate truth", tetherRushImageTruthErrors);
    failures.push(...tetherRushImageTruthErrors);

    const offshiftVessImageTruthErrors = offshiftVessImageTruthChecks(runtime);
    printCheck("0.35 Off-Shift Vess official portrait + saved-scene resume", offshiftVessImageTruthErrors);
    failures.push(...offshiftVessImageTruthErrors);

    const act3SpineImageRepeatErrors = act3SpineImageRepeatChecks(runtime);
    printCheck("0.35 act3 hub distinct image + neighboring routes + saved-scene resume", act3SpineImageRepeatErrors);
    failures.push(...act3SpineImageRepeatErrors);

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

    const arcForkCostErrors = arcForkCostChecks(runtime);
    printCheck("0.33 arc_fork visible costs + L-021 floor", arcForkCostErrors);
    failures.push(...arcForkCostErrors);

    const custodyPossessionTradeoffErrors = custodyPossessionTradeoffChecks(runtime);
    printCheck("0.33 custody_possession visible tradeoff + L-021 floor", custodyPossessionTradeoffErrors);
    failures.push(...custodyPossessionTradeoffErrors);

    const vaultRevealTradeoffErrors = vaultRevealTradeoffChecks(runtime);
    printCheck("0.33 vault_reveal legible mandates + L-021 floor", vaultRevealTradeoffErrors);
    failures.push(...vaultRevealTradeoffErrors);

    const pairShieldErrors = pairShieldReachabilityChecks(runtime);
    printCheck("L-020 pair_shield_cold one-shot reachability", pairShieldErrors);
    failures.push(...pairShieldErrors);

    const offshiftGuardErrors = offshiftDefensiveGuardChecks(runtime);
    printCheck("L-026 Off-Shift defensive save-recovery guards", offshiftGuardErrors);
    failures.push(...offshiftGuardErrors);

    const offshiftChoiceErrors = offshiftChoiceChecks(runtime);
    printCheck("0.35 Off-Shift dead-holder choices + save/resume", offshiftChoiceErrors);
    failures.push(...offshiftChoiceErrors);

    const livingCastErrors = livingCastChecks(runtime);
    printCheck("0.35 full-graph living cast + Import/Continue custody", livingCastErrors);
    failures.push(...livingCastErrors);

    const selaAnswerErrors = selaAnswerChecks(runtime);
    printCheck("0.35 Sela answer before conflict + exact save roundtrip", selaAnswerErrors);
    failures.push(...selaAnswerErrors);

    const capacitorErrors = capacitorChecks(runtime);
    printCheck("0.35 capacitor tradeoff honesty + unchanged mechanics and saves", capacitorErrors);
    failures.push(...capacitorErrors);

    const epilogueErrors = epilogueChecks(runtime);
    printCheck("0.35 current living private-hours recap + unchanged rewards and saves", epilogueErrors);
    failures.push(...epilogueErrors);

    const pregnancyLenaErrors = pregnancyLenaChecks(runtime);
    printCheck("0.35 Lena participant-aware medical opening + unchanged outcomes and saves", pregnancyLenaErrors);
    failures.push(...pregnancyLenaErrors);

    const joinTypoErrors = joinTypoChecks(runtime);
    printCheck("0.35 faction summary paragraph joins + unchanged prose, outcomes and saves", joinTypoErrors);
    failures.push(...joinTypoErrors);

    const vessRecapErrors = vessRecapChecks(runtime);
    printCheck("0.35 accepted Vess recap + unchanged approach gates and save custody", vessRecapErrors);
    failures.push(...vessRecapErrors);

    const destinationErrors = destinationChecks(runtime);
    printCheck("0.35 final-order destination labels + unchanged outcomes and saves", destinationErrors);
    failures.push(...destinationErrors);

    const jiroVoiceErrors = jiroVoiceChecks(runtime);
    printCheck("0.35 recovered Jiro voice clarity + destination and save continuity", jiroVoiceErrors);
    failures.push(...jiroVoiceErrors);

    const remainsLeanErrors = remainsLeanChecks(runtime);
    printCheck("0.35 What Remains lean matches recorded order weights", remainsLeanErrors);
    failures.push(...remainsLeanErrors);

    const openingBackstoryErrors = openingBackstoryChecks(runtime);
    printCheck("0.35 opening path reads existing prologue/plates only", openingBackstoryErrors);
    failures.push(...openingBackstoryErrors);

    const artR2PlaytestCloseErrors = artR2PlaytestCloseChecks(runtime);
    printCheck("SUN-V035-ART-R2-PLAYTEST-CLOSE-01 named-scene cluster already satisfied", artR2PlaytestCloseErrors);
    failures.push(...artR2PlaytestCloseErrors);

    const playtestArtEventAuditErrors = playtestArtEventAuditChecks(runtime);
    printCheck("SUN-PLAYTEST-ART-EVENT-AUDIT-01 mappings + Grok brief standing rule", playtestArtEventAuditErrors);
    failures.push(...playtestArtEventAuditErrors);

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

  const suppliesBandErrors = suppliesBandChecks(simulations);
  printCheck("0.35 Supplies band after real fresh-run costs", suppliesBandErrors);
  failures.push(...suppliesBandErrors);

  for (const holder of ["amara", "sela"]) {
    const v6 = assertV6(ROOT, holder);
    printCheck(`V6 untested dead-holder promise (${holder})`, v6.errors,
      `before=${v6.beforeEnding}; after=${v6.afterEnding}; ending=${v6.endingTitle}`);
    failures.push(...v6.errors.map(error => `V6/${holder}: ${error}`));
  }

  for (const [label, errors] of adoptedChecks()) {
    printCheck(label, errors);
    failures.push(...errors);
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
