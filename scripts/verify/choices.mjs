// Choices and their costs: early vault_priority preservation, visible costs and the L-021 floor on
// arc_fork, custody_possession and vault_reveal, pair_shield_cold one-shot reachability, truthful
// resource status and blocker feedback, and same-tap payment with parked-save compatibility.
// Moved out of scripts/verify.mjs unchanged; verify.mjs imports and runs every check here.

export function vaultPriorityChecks(runtime) {
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

export function arcForkCostChecks(runtime) {
  const errors = [];
  const fixture = runtime.evaluate(`(() => {
    const statKeys = ["integrity", "cohesion", "supplies", "embryos"];
    const snapshot = () => statKeys.map(key => state[key]);
    const delta = (before, after) => after.map((value, index) => value - before[index]);
    const inspectRoute = next => {
      resetRunState();
      const choice = scenes.arc_fork.choices.find(item => item.next === next);
      const before = snapshot();
      makeChoice(choice);
      return {
        effects: choice.effects || null,
        delta: delta(before, snapshot()),
        scene: state.scene,
        midArc: state.flags.mid_arc,
        futureLean: state.ideology.future,
        livingLean: state.ideology.living
      };
    };

    resetRunState();
    document.getElementById("choices").children = [];
    // SUN-PRICE-TAGS-01: cost labels now belong to the reader setting; check them with it ON.
    setShowCostsOnChoices(true);
    showScene("arc_fork");
    const defaultButtons = Array.from(document.getElementById("choices").children).map(button => ({
      disabled: button.disabled,
      html: button.innerHTML
    }));
    localStorage.removeItem(SHOW_COSTS_KEY);
    showCostsSessionValue = null;

    resetRunState();
    state.integrity = 0;
    state.cohesion = 0;
    state.embryos = 0;
    document.getElementById("choices").children = [];
    showScene("arc_fork");
    const depletedChoices = scenes.arc_fork.choices;
    const depletedButtons = Array.from(document.getElementById("choices").children).map(button => ({
      disabled: button.disabled,
      html: button.innerHTML
    }));
    const fallback = depletedChoices.find(item => !item.effects);
    const beforeFallback = snapshot();
    makeChoice(fallback);
    const afterFallback = snapshot();
    const fallbackScene = state.scene;

    return {
      future: inspectRoute("arc_future_1"),
      living: inspectRoute("arc_living_1"),
      defaultButtons,
      depleted: {
        choiceCount: depletedChoices.length,
        enabledCount: depletedButtons.filter(button => !button.disabled).length,
        fallbackText: fallback && fallback.text,
        fallbackNext: fallback && fallback.next,
        fallbackDelta: delta(beforeFallback, afterFallback),
        scene: fallbackScene
      }
    };
  })()`);

  const same = (left, right) => JSON.stringify(left) === JSON.stringify(right);
  if (!same(fixture.future.effects, { integrity: -3, cohesion: -3 }) ||
      !same(fixture.future.delta, [-3, -3, 0, 0]) ||
      fixture.future.scene !== "arc_future_1" || fixture.future.midArc !== "future" || fixture.future.futureLean !== 4) {
    errors.push(`arc_fork future route did not charge its visible Hull/Cohesion cost: ${JSON.stringify(fixture.future)}`);
  }
  if (!same(fixture.living.effects, { embryos: -5 }) ||
      !same(fixture.living.delta, [0, 0, 0, -5]) ||
      fixture.living.scene !== "arc_living_1" || fixture.living.midArc !== "living" || fixture.living.livingLean !== 4) {
    errors.push(`arc_fork living route did not charge its visible Embryos cost: ${JSON.stringify(fixture.living)}`);
  }
  if (fixture.defaultButtons.length !== 2 || fixture.defaultButtons.some(button => button.disabled)) {
    errors.push("arc_fork default state no longer renders both paid routes as enabled");
  }
  for (const label of ["-3 Hull", "-3 Cohesion", "-5 Embryos"]) {
    if (!fixture.defaultButtons.some(button => button.html.includes(label))) {
      errors.push(`arc_fork does not render immediate cost label ${label} with Show costs ON`);
    }
  }
  if (fixture.depleted.choiceCount !== 3 || fixture.depleted.enabledCount !== 1 ||
      !/no margin left to spend/i.test(fixture.depleted.fallbackText || "") ||
      fixture.depleted.fallbackNext !== "arc_future_1" ||
      !same(fixture.depleted.fallbackDelta, [0, 0, 0, 0]) || fixture.depleted.scene !== "arc_future_1") {
    errors.push(`arc_fork depleted-state L-021 fallback mismatch: ${JSON.stringify(fixture.depleted)}`);
  }
  return errors;
}

export function custodyPossessionTradeoffChecks(runtime) {
  const errors = [];
  const fixture = runtime.evaluate(`(() => {
    const statKeys = ["integrity", "cohesion", "supplies", "embryos"];
    const snapshot = () => statKeys.map(key => state[key]);
    const delta = (before, after) => after.map((value, index) => value - before[index]);
    const inspectRoute = pattern => {
      resetRunState();
      showScene("custody_possession");
      const choice = scenes.custody_possession.choices.find(item => pattern.test(item.text));
      const before = snapshot();
      makeChoice(choice);
      return {
        effects: choice.effects || null,
        delta: delta(before, snapshot()),
        scene: state.scene,
        answer: state.flags.custody_answer,
        roll: state.flags.custody_roll
      };
    };

    resetRunState();
    document.getElementById("choices").children = [];
    // SUN-PRICE-TAGS-01: cost labels now belong to the reader setting; check them with it ON.
    setShowCostsOnChoices(true);
    showScene("custody_possession");
    const defaultButtons = Array.from(document.getElementById("choices").children).map(button => ({
      disabled: button.disabled,
      html: button.innerHTML
    }));
    localStorage.removeItem(SHOW_COSTS_KEY);
    showCostsSessionValue = null;

    resetRunState();
    state.integrity = 3;
    state.supplies = 3;
    state.cohesion = 0;
    const singlePaidChoiceCount = scenes.custody_possession.choices.length;

    resetRunState();
    state.integrity = 0;
    state.supplies = 0;
    state.cohesion = 0;
    document.getElementById("choices").children = [];
    showScene("custody_possession");
    const depletedChoices = scenes.custody_possession.choices;
    const depletedButtons = Array.from(document.getElementById("choices").children).map(button => ({
      disabled: button.disabled,
      html: button.innerHTML
    }));
    const fallback = depletedChoices.find(item => !item.effects);
    const beforeFallback = snapshot();
    makeChoice(fallback);
    const afterFallback = snapshot();
    const fallbackScene = state.scene;

    return {
      treatment: inspectRoute(/Treat the exposed crew/),
      sealing: inspectRoute(/let cohesion carry/),
      defaultButtons,
      singlePaidChoiceCount,
      depleted: {
        choiceCount: depletedChoices.length,
        enabledCount: depletedButtons.filter(button => !button.disabled).length,
        fallbackText: fallback && fallback.text,
        fallbackNext: fallback && fallback.next,
        fallbackDelta: delta(beforeFallback, afterFallback),
        scene: fallbackScene
      }
    };
  })()`);

  const same = (left, right) => JSON.stringify(left) === JSON.stringify(right);
  if (!same(fixture.treatment.effects, { supplies: -3, integrity: -3 }) ||
      !same(fixture.treatment.delta, [-3, 0, -3, 0]) || fixture.treatment.scene !== "custody_after" ||
      fixture.treatment.answer !== "possession" || fixture.treatment.roll !== true) {
    errors.push(`custody_possession treatment route mismatch: ${JSON.stringify(fixture.treatment)}`);
  }
  if (!same(fixture.sealing.effects, { cohesion: -6 }) ||
      !same(fixture.sealing.delta, [0, -6, 0, 0]) || fixture.sealing.scene !== "custody_after" ||
      fixture.sealing.answer !== "possession" || fixture.sealing.roll !== true) {
    errors.push(`custody_possession sealing route mismatch: ${JSON.stringify(fixture.sealing)}`);
  }
  if (fixture.defaultButtons.length !== 2 || fixture.defaultButtons.some(button => button.disabled)) {
    errors.push("custody_possession default state no longer renders both paid tradeoffs as enabled");
  }
  for (const label of ["-3 Supplies", "-3 Hull", "-6 Cohesion"]) {
    if (!fixture.defaultButtons.some(button => button.html.includes(label))) {
      errors.push(`custody_possession does not render immediate tradeoff label ${label} with Show costs ON`);
    }
  }
  if (fixture.singlePaidChoiceCount !== 2) {
    errors.push("custody_possession exposed the degraded floor while a paid route remained affordable");
  }
  if (fixture.depleted.choiceCount !== 3 || fixture.depleted.enabledCount !== 1 ||
      !/No reserve remains/i.test(fixture.depleted.fallbackText || "") ||
      fixture.depleted.fallbackNext !== "custody_after" ||
      !same(fixture.depleted.fallbackDelta, [0, 0, 0, 0]) || fixture.depleted.scene !== "custody_after") {
    errors.push(`custody_possession depleted-state L-021 fallback mismatch: ${JSON.stringify(fixture.depleted)}`);
  }
  return errors;
}

export function vaultRevealTradeoffChecks(runtime) {
  const errors = [];
  const fixture = runtime.evaluate(`(() => {
    const statKeys = ["integrity", "cohesion", "supplies", "embryos"];
    const snapshot = () => statKeys.map(key => state[key]);
    const delta = (before, after) => after.map((value, index) => value - before[index]);
    const inspectMandate = priority => {
      resetRunState();
      showScene("vault_reveal");
      const choice = scenes.vault_reveal.choices.find(item => item.flag && item.flag.vault_priority === priority);
      const before = snapshot();
      makeChoice(choice);
      return {
        text: choice.text,
        effects: choice.effects || null,
        delta: delta(before, snapshot()),
        scene: state.scene,
        priority: state.flags.vault_priority,
        futureLean: state.ideology.future,
        livingLean: state.ideology.living
      };
    };

    resetRunState();
    document.getElementById("choices").children = [];
    // SUN-PRICE-TAGS-01: cost labels now belong to the reader setting; check them with it ON.
    setShowCostsOnChoices(true);
    showScene("vault_reveal");
    const defaultButtons = Array.from(document.getElementById("choices").children).map(button => ({
      disabled: button.disabled,
      html: button.innerHTML
    }));
    localStorage.removeItem(SHOW_COSTS_KEY);
    showCostsSessionValue = null;
    const sceneText = scenes.vault_reveal.text;

    resetRunState();
    state.integrity = 0;
    state.cohesion = 0;
    state.supplies = 0;
    state.embryos = 0;
    document.getElementById("choices").children = [];
    showScene("vault_reveal");
    const depletedChoices = scenes.vault_reveal.choices;
    const depletedButtons = Array.from(document.getElementById("choices").children).map(button => ({
      disabled: button.disabled,
      html: button.innerHTML
    }));
    const fallback = depletedChoices.find(item => !item.effects);
    const beforeFallback = snapshot();
    makeChoice(fallback);
    const afterFallback = snapshot();
    const fallbackScene = state.scene;
    const fallbackPriority = state.flags.vault_priority;

    return {
      living: inspectMandate("living"),
      future: inspectMandate("future"),
      both: inspectMandate("both"),
      defaultButtons,
      sceneText,
      depleted: {
        choiceCount: depletedChoices.length,
        enabledCount: depletedButtons.filter(button => !button.disabled).length,
        fallbackText: fallback && fallback.text,
        fallbackNext: fallback && fallback.next,
        fallbackDelta: delta(beforeFallback, afterFallback),
        scene: fallbackScene,
        priority: fallbackPriority
      }
    };
  })()`);

  const same = (left, right) => JSON.stringify(left) === JSON.stringify(right);
  const expected = {
    living: { effects: { cohesion: 4, embryos: -5 }, delta: [0, 4, 0, -5], futureLean: 0, livingLean: 6 },
    future: { effects: { cohesion: -3 }, delta: [0, -3, 0, 0], futureLean: 6, livingLean: 0 },
    both: { effects: { cohesion: 1, supplies: -3 }, delta: [0, 1, -3, 0], futureLean: 2, livingLean: 2 }
  };
  for (const priority of Object.keys(expected)) {
    const actual = fixture[priority];
    const want = expected[priority];
    if (!same(actual.effects, want.effects) || !same(actual.delta, want.delta) || actual.scene !== "status" ||
        actual.priority !== priority || actual.futureLean !== want.futureLean || actual.livingLean !== want.livingLean) {
      errors.push(`vault_reveal ${priority} mandate mismatch: ${JSON.stringify(actual)}`);
    }
  }
  if (fixture.defaultButtons.length !== 3 || fixture.defaultButtons.some(button => button.disabled)) {
    errors.push("vault_reveal default state no longer renders all three mandates as enabled");
  }
  for (const label of ["+4 Cohesion", "-5 Embryos", "-3 Cohesion", "+1 Cohesion", "-3 Supplies"]) {
    if (!fixture.defaultButtons.some(button => button.html.includes(label))) {
      errors.push(`vault_reveal does not render immediate tradeoff label ${label} with Show costs ON`);
    }
  }
  for (const phrase of ["Living priority", "Future priority", "Dual mandate", "not a virtue test", "which reserve takes the first loss"]) {
    const source = phrase.includes("priority") || phrase === "Dual mandate"
      ? [fixture.living.text, fixture.future.text, fixture.both.text].join(" ")
      : fixture.sceneText;
    if (!source.includes(phrase)) errors.push(`vault_reveal tradeoff framing missing: ${phrase}`);
  }
  if (fixture.depleted.choiceCount !== 4 || fixture.depleted.enabledCount !== 1 ||
      !/No reserve can move/i.test(fixture.depleted.fallbackText || "") ||
      fixture.depleted.fallbackNext !== "status" || !same(fixture.depleted.fallbackDelta, [0, 0, 0, 0]) ||
      fixture.depleted.scene !== "status" || fixture.depleted.priority !== "both") {
    errors.push(`vault_reveal depleted-state L-021 fallback mismatch: ${JSON.stringify(fixture.depleted)}`);
  }
  return errors;
}

export function pairShieldReachabilityChecks(runtime) {
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
    // SUN-LEGACY-DEATHBEAT-01: a resume may render the death beat itself; L-020 holds if its only exit is the consequence.
    const resumedScene = state.scene === "act3_lethal_mira_end" &&
      scenes.act3_lethal_mira_end.choices.length === 1 &&
      scenes.act3_lethal_mira_end.choices[0].next === "pair_shield_cold"
      ? "pair_shield_cold"
      : state.scene;

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
    if (row.scene !== "pair_shield_cold" || row.next !== "faction_split" || row.image !== "images/corridor_variant_2.jpg" || /\bElias\b|\bMira\b|\"/.test(row.text) || row.memoriesAdded !== 0) {
      errors.push(`pair_shield_cold saved ${label} entry rendered an ineligible speaker, image, write, or exit`);
    }
  }
  if (fixture.savedEligible.scene !== "pair_shield_cold" || fixture.savedEligible.image !== "images/elias.jpg" || !fixture.savedEligible.text.includes("Elias gives the watch report") || fixture.savedEligible.memoriesAdded !== 0) {
    errors.push("eligible completed pair_shield_cold save did not resume without repeating entry writes");
  }
  return errors;
}

export function resourceFeedbackChecks(runtime) {
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
      className: document.getElementById("stat-survivors").className,
      resource: state.survivors
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

    // SUN-PRICE-TAGS-01: cost labels are honest when shown, absent from enabled
    // buttons by default, and disabled reasons are identical either way.
    resetRunState();
    state.embryos = 100;
    const ceilingDirect = formatEffectsHtml({ embryos: 5 });
    const buttonsFor = (sceneId) => {
      document.getElementById("choices").children = [];
      showScene(sceneId, { skipOnEnter: true });
      return document.getElementById("choices").children.map(button => ({
        html: button.innerHTML,
        disabled: !!button.disabled,
        effectsHtml: button.__ssChoiceEffectsHtml || ""
      }));
    };
    const vaultCostState = () => {
      resetRunState();
      state.trust.mira = 40;
      state.cohesion = 10;
      state.integrity = 100;
    };
    localStorage.removeItem(SHOW_COSTS_KEY);
    showCostsSessionValue = null;
    const costsDefault = showCostsOnChoices();
    vaultCostState();
    const costsOff = buttonsFor("vault_voice");
    setShowCostsOnChoices(true);
    const costsToggledOn = document.getElementById("choices").children.map(button => ({ html: button.innerHTML, disabled: !!button.disabled }));
    vaultCostState();
    const costsOn = buttonsFor("vault_voice");
    resetRunState();
    state.cohesion = 98;
    state.trust.mira = 40;
    const clampedRendered = buttonsFor("vault_voice");
    setShowCostsOnChoices(false);
    vaultCostState();
    const costsOffAgain = buttonsFor("vault_voice");
    resetRunState();
    state.trust.mira = 39;
    state.cohesion = 10;
    const trustOff = reasonForChoice("vault_voice", "Restrict access.");
    setShowCostsOnChoices(true);
    resetRunState();
    state.trust.mira = 39;
    state.cohesion = 10;
    const trustOn = reasonForChoice("vault_voice", "Restrict access.");
    localStorage.removeItem(SHOW_COSTS_KEY);
    showCostsSessionValue = null;

    return { statusCases, survivors, vaultUnpaid, vaultExact, vaultTrust, conservation, clampedPositive,
      ceilingDirect, costsDefault, costsOff, costsToggledOn, costsOn, clampedRendered, costsOffAgain, trustOff, trustOn };
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
  if (fixture.survivors.text !== "6" || fixture.survivors.className !== "stat-value" || fixture.survivors.resource !== 2) {
    errors.push(`Crew HUD is not a neutral living-name count: ${JSON.stringify(fixture.survivors)}`);
  }
  if (!fixture.vaultUnpaid.found || !fixture.vaultUnpaid.disabled || fixture.vaultUnpaid.reason !== "Needs 1 Cohesion; 0 available") {
    errors.push(`vault_voice unpaid reason mismatch: ${JSON.stringify(fixture.vaultUnpaid)}`);
  }
  if (!fixture.vaultExact.found || fixture.vaultExact.disabled || fixture.vaultExact.reason) {
    errors.push(`vault_voice exact-cost boundary mismatch: ${JSON.stringify(fixture.vaultExact)}`);
  }
  // SUN-PRICE-TAGS-01 rewords only the trust case, from "Needs more trust from Mira".
  if (!fixture.vaultTrust.disabled || fixture.vaultTrust.reason !== "Mira won't take this from you yet.") {
    errors.push(`vault_voice hidden-trust reason mismatch: ${JSON.stringify(fixture.vaultTrust)}`);
  }
  if (!fixture.conservation.disabled || fixture.conservation.reason !== "Needs 4 Hull; 3 available") {
    errors.push(`arc_future_2 deterministic public-resource reason mismatch: ${JSON.stringify(fixture.conservation)}`);
  }
  if (!fixture.clampedPositive.includes("+2 Cohesion (clamped)")) {
    errors.push(`clamped positive effect display changed: ${JSON.stringify(fixture.clampedPositive)}`);
  }
  if (!fixture.ceilingDirect.includes('<span class="effect-pro">Embryos already at ceiling</span>')) {
    errors.push(`ceiling effect display changed: ${JSON.stringify(fixture.ceilingDirect)}`);
  }

  // SUN-PRICE-TAGS-01 — default OFF: enabled buttons carry no effects markup; disabled keep reasons.
  const effectsMarkup = /choice-effects|effect-pro|effect-con|already at (?:ceiling|floor)|\(clamped\)/;
  const byText = (buttons, text) => buttons.find(button => button.html.includes(text)) || null;
  if (fixture.costsDefault !== false) errors.push("Show costs on choices is not OFF by default");
  const offEnabled = fixture.costsOff.filter(button => !button.disabled);
  const offDisabled = fixture.costsOff.filter(button => button.disabled);
  if (!offEnabled.length || !offEnabled.some(button => button.effectsHtml)) {
    errors.push("vault_voice price-tag fixture rendered no enabled costed choice");
  }
  for (const button of offEnabled) {
    if (effectsMarkup.test(button.html)) errors.push(`setting OFF: enabled button shows cost markup: ${button.html}`);
  }
  if (!offDisabled.length || offDisabled.some(button => !/<span class="choice-reason">[^<]+<\/span>/.test(button.html))) {
    errors.push(`setting OFF: disabled button lost its reason: ${JSON.stringify(offDisabled)}`);
  }
  for (const button of [...fixture.costsOff, ...fixture.costsOn]) {
    if (button.disabled && effectsMarkup.test(button.html)) errors.push(`disabled button shows cost markup: ${button.html}`);
  }
  // Setting ON (fresh render and in-place toggle): every enabled costed button shows the honest label.
  for (const [label, buttons] of [["fresh render", fixture.costsOn], ["in-place toggle", fixture.costsToggledOn]]) {
    const disable = byText(buttons, "Disable the voice.");
    const restrict = byText(buttons, "Restrict access.");
    const untouched = byText(buttons, "Leave the panel untouched.");
    if (!disable || disable.disabled || !disable.html.includes('<span class="choice-effects">[<span class="effect-con">-3 Cohesion</span> <span class="effect-pro">Hull already at ceiling</span>]</span>')) {
      errors.push(`setting ON (${label}): Disable the voice lost its honest cost label: ${JSON.stringify(disable)}`);
    }
    if (!restrict || restrict.disabled || !restrict.html.includes('<span class="effect-con">-1 Cohesion</span> <span class="effect-pro">Hull already at ceiling</span>')) {
      errors.push(`setting ON (${label}): Restrict access lost its honest cost label: ${JSON.stringify(restrict)}`);
    }
    if (!untouched || effectsMarkup.test(untouched.html)) {
      errors.push(`setting ON (${label}): a choice with no effects grew a cost label: ${JSON.stringify(untouched)}`);
    }
    const onDisabled = buttons.filter(button => button.disabled).map(button => button.html);
    if (JSON.stringify(onDisabled) !== JSON.stringify(offDisabled.map(button => button.html))) {
      errors.push(`setting ON (${label}) changed a disabled reason: ${JSON.stringify(onDisabled)}`);
    }
  }
  const leaveClamped = byText(fixture.clampedRendered, "Leave it.");
  if (!leaveClamped || leaveClamped.disabled || !leaveClamped.html.includes('<span class="effect-pro">+2 Cohesion (clamped)</span>')) {
    errors.push(`setting ON: rendered clamped label changed: ${JSON.stringify(leaveClamped)}`);
  }
  if (JSON.stringify(fixture.costsOffAgain.map(button => button.html)) !== JSON.stringify(fixture.costsOff.map(button => button.html))) {
    errors.push("turning Show costs back OFF did not restore the OFF rendering exactly");
  }
  if (JSON.stringify(fixture.trustOff) !== JSON.stringify(fixture.trustOn) || fixture.trustOn.reason !== "Mira won't take this from you yet.") {
    errors.push(`trust reason differs between settings: ${JSON.stringify([fixture.trustOff, fixture.trustOn])}`);
  }
  return errors;
}

export function sameTapPaymentChecks(runtime) {
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
