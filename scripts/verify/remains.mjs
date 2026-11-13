// What Remains and final orders: the What Remains selector and surface, the dead-holder Tomas
// promise, and the final-order consequence in every ending family.
// Moved out of scripts/verify.mjs unchanged; verify.mjs imports and runs every check here.

export function whatRemainsChecks(runtime) {
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
    "At the vault fault, the restart package was kept and habitation paid the cost; the thermal-spine overload ended with Mira severing the fused junction and carrying the cold-radiation injury.",
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
    ["sela", "vented at twenty", "Sela died when the lower ring was vented; she was twenty"],
    ["lena", "resources diverted to the vault", "Lena died after medical power was diverted to the vault"],
    ["lena", "kept working until the clock ran out", "Lena died finishing the watch, with the packs and power kept elsewhere"],
    ["tomas", "refused the order and paid for it", "Tomas died after refusing the order"],
    ["tomas", "went back for the living and did not return", "Tomas went back for the living and did not return"],
    ["elias", "held the line", "Elias died sealed into Station B-four"],
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
  // SUN-PROMISE-DEATH-ONCE-01: the death line above carries the death, so the promise line drops it.
  if (six[4] !== "At the service-pocket test, the vent did not stay shut.") {
    errors.push("death-causing promise did not win the promise slot, or restated the death");
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

  const weightTrue = runtime.evaluate(`(() => {
    resetRunState();
    state.ideology.future = 11;
    state.ideology.living = 3;
    state.flags.vault_sacrifice = "split";
    const facts = whatRemainsFacts();
    const endingShape = ideologyShape();
    return { facts, endingShape };
  })()`);
  if (weightTrue.endingShape !== "split") {
    errors.push(`split vault must still shape endings; got ${JSON.stringify(weightTrue.endingShape)}`);
  }
  if (weightTrue.facts[0] !== "Across the recorded orders, Future carried more weight.") {
    errors.push(`Future-leaning recorded orders still classified as split: ${JSON.stringify(weightTrue.facts[0])}`);
  }

  return errors;
}

export function tomasDeadHolderPromiseChecks(runtime) {
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

export function finalOrderEndingChecks(runtime) {
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
