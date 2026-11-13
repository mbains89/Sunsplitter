// Story state: scene text render purity and one-shot entry writes.
// Moved out of scripts/verify.mjs unchanged; verify.mjs imports and runs every check here.

import { sameArray } from "./shared.mjs";

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
