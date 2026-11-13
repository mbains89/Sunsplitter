// Story state: scene text render purity and one-shot entry writes, the intimacy_window romance
// gate, spent final and Vess transmissions, Vess's retired course promise, the player-shaped
// Commander on rendered paths, and Cascade hosts, mirrors and phrase ownership.
// Moved out of scripts/verify.mjs unchanged; verify.mjs imports and runs every check here.

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { EXPECTED_SCENE_COUNT } from "../simulate.mjs";
import { EXPECTED_SCRIPTS, ROOT, sameArray } from "./shared.mjs";

export function renderPurityChecks(runtime) {
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
    // SUN-HUB-RESUME-01: entry writes nothing; every exit of the visit that shows the line spends it.
    const tomasFlag = state.flags.prom_tomas_alluded;
    const spineExitsSpend = scenes.act3_spine_next.choices.every(c => c.flag && c.flag.prom_tomas_alluded === true);
    state.flags.prom_tomas_alluded = true;
    const spineSpent = readText(scenes.act3_spine_next);

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
      spineExitsSpend,
      spineSpent,
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
  if (fixture.spineRedirect || fixture.tomasFlag || !fixture.spineExitsSpend ||
      !fixture.spine.first.includes("Names first, then numbers") || fixture.spineSpent.includes("Names first, then numbers")) {
    errors.push("Tomas promise allusion did not render on the non-redirected spine entry, or its exits do not spend it once");
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

export function romanceOpenGateChecks(runtime) {
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

export function lastTransmissionChecks(runtime) {
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

export function vessTransmissionReplayChecks(runtime) {
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

export function vessCourseRetirementChecks(runtime) {
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

export function commanderIdentityChecks(runtime) {
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

export function cascadeAndMirrorChecks(runtime) {
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
