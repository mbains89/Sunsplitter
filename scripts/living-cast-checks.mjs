import assert from "node:assert/strict";

// SUN-V035-LIVING-CAST-01. These are accepted-save safety fixtures, not claims
// that an ordinary fresh run can reach every contradictory historical roster.
export function livingCastChecks(runtime) {
  const errors = [];
  const check = (label, source) => {
    try {
      const result = runtime.evaluate(source, 120_000);
      assert.equal(result.length, 0, JSON.stringify(result.slice(0, 12)));
    } catch (error) { errors.push(`Living cast ${label}: ${error.message}`); }
  };
  assert.equal(runtime.sceneIds.length, 224);

  check("authored living branches and absent entry guards", `(() => {
    const failures = [];
    if (Object.keys(livingCastContracts).length !== 121) failures.push("required 121-site guard inventory changed");
    const read = (scene, desc) => {
      const raw = desc.get ? desc.get.call(scene) : desc.value;
      return typeof raw === "function" ? raw.call(scene) : raw;
    };
    for (const [id, contract] of Object.entries(livingCastContracts)) {
      resetRunState(); Object.assign(state.recovered, { tomas: true, jiro: true, vess: true });
      state.crisisPath = "breath"; state.flags.prom_line_other = "jiro";
      const scene = scenes[id], authored = livingCastOriginals.get(scene);
      if (!scenes[livingCastExit(id)]) failures.push(id + ": missing fallback");
      if (!livingCastPresent(id)) failures.push(id + ": living fixture blocked");
      for (const field of ["text", "choices"]) {
        if (JSON.stringify(read(scene, Object.getOwnPropertyDescriptor(scene, field))) !== JSON.stringify(read(scene, authored[field]))) {
          failures.push(id + ": changed living " + field);
        }
      }
      for (const who of contract.cast) {
        resetRunState(); Object.assign(state.recovered, { tomas: true, jiro: true, vess: true });
        state.flags.prom_line_other = "jiro"; state.crisisPath = "breath";
        state.promises[who] = "made"; state.flags["prom_" + who] = true;
        kill(who, "living-cast regression fixture");
        const before = JSON.stringify(state);
        if (!contract.preserveEntry) {
          const next = scene.onEnter({ resume: true });
          if (next !== livingCastExit(id) || JSON.stringify(state) !== before) failures.push(id + ": absent entry wrote state");
        }
        if (!contract.entryOnly) {
          if (read(scene, Object.getOwnPropertyDescriptor(scene, "text")) !== ABSENT_CAST_TEXT) failures.push(id + ": absent speech");
          const choices = read(scene, Object.getOwnPropertyDescriptor(scene, "choices"));
          if (JSON.stringify(choices) !== JSON.stringify([{ text: "Continue.", next: livingCastExit(id) }])) failures.push(id + ": absent choices");
        }
      }
    }
    return failures;
  })()`);

  check("full graph Import and repeated Continue retain exact cast and scene", `(() => {
    const failures = [], confirm = window.confirm;
    window.confirm = () => true;
    const adults = ["lena", "elias", "mira", "tomas", "amara", "jiro", "sela", "vess"];
    const rosters = [{ dead: [] }, ...["rourke", ...adults].map(who => ({ dead: [who] })),
      { dead: adults }, ...["tomas", "jiro", "vess"].map(who => ({ dead: [], missing: who }))];
    try {
      for (const id of Object.keys(scenes)) for (const roster of rosters) {
        if (id === "ending_check") continue; // Existing completed-save gate owns ending resolution.
        localStorage.clear(); resetRunState();
        Object.assign(state.recovered, { tomas: true, jiro: true, vess: true });
        if (roster.missing) state.recovered[roster.missing] = false;
        state.crisisPath = "breath"; state.flags.prom_line_other = "jiro";
        for (const who of ["amara", "tomas", "elias", "lena", "sela", "mira"]) state.promises[who] = "made";
        for (const who of roster.dead) kill(who, "living-cast saved fixture");
        state.scene = id;
        const before = JSON.stringify(state), snapshot = snapshotState();
        snapshot.sceneEntered = true;
        const raw = JSON.stringify(snapshot);
        if (!validRawSnapshot(raw) || !importSaveText(raw)) {
          failures.push(id + ": import rejected"); continue;
        }
        const stored = localStorage.getItem(SAVE_KEY);
        for (let repeat = 0; repeat < 2; repeat++) {
          // Prove restoration, not merely a stable render of the current state.
          resetRunState(); state.supplies = 1;
          document.getElementById("choices").children = [];
          if (!resumeGame() || JSON.stringify(state) !== before || localStorage.getItem(SAVE_KEY) !== stored) {
            failures.push(id + ": resume changed snapshot " + JSON.stringify(roster)); break;
          }
          const contract = livingCastContracts[id];
          if (contract && !contract.entryOnly && !livingCastPresent(id)) {
            const buttons = gameplayChoiceButtons();
            if (!document.getElementById("story").innerHTML.includes(ABSENT_CAST_TEXT) || buttons.length !== 1 || buttons[0].disabled) {
              failures.push(id + ": restored absent view has speech/no exit");
            }
          }
        }
      }
    } finally { window.confirm = confirm; }
    return failures;
  })()`);

  check("all death subsets and recovery subsets retain an affordable exit", `(() => {
    const failures = [], adults = ["lena", "elias", "mira", "tomas", "amara", "jiro", "sela", "vess"];
    const ids = Object.keys(scenes).filter(id => !["ending_check", "act3_crisis_router"].includes(id));
    // The router is entry-only in the original graph; ending_check is terminal.
    for (let deadMask = 0; deadMask < 512; deadMask++) {
      resetRunState(); state.integrity = state.cohesion = state.supplies = state.embryos = 100;
      Object.assign(state.recovered, { tomas: true, jiro: true, vess: true });
      ["rourke", ...adults].forEach((who, bit) => { if (deadMask & (1 << bit)) kill(who, "graph fixture"); });
      for (const id of ids) {
        const raw = scenes[id].choices, choices = typeof raw === "function" ? raw.call(scenes[id]) : raw;
        const available = choices.filter(c => (!c.alive || isAlive(c.alive)) &&
          (!c.aliveAll || c.aliveAll.every(isAlive)) && (!c.aliveAny || c.aliveAny.some(isAlive)) &&
          (!c.requires || meetsRequirements(c.requires)) && (!c.effects || canAffordEffects(c.effects)));
        if (!available.length || available.some(c => !scenes[c.next])) failures.push(id + ": dead mask " + deadMask);
      }
    }
    for (let recoveryMask = 0; recoveryMask < 8; recoveryMask++) {
      resetRunState(); state.integrity = state.cohesion = state.supplies = state.embryos = 100;
      ["tomas", "jiro", "vess"].forEach((who, bit) => { state.recovered[who] = !!(recoveryMask & (1 << bit)); });
      for (const id of ids) {
        const raw = scenes[id].choices, choices = typeof raw === "function" ? raw.call(scenes[id]) : raw;
        if (!choices.some(c => (!c.alive || isAlive(c.alive)) && (!c.aliveAll || c.aliveAll.every(isAlive)) &&
            (!c.aliveAny || c.aliveAny.some(isAlive)) && (!c.requires || meetsRequirements(c.requires)) &&
            (!c.effects || canAffordEffects(c.effects)))) failures.push(id + ": recovery mask " + recoveryMask);
      }
    }
    return failures;
  })()`);

  check("promise patients, committed deaths, and recovery admission", `(() => {
    const failures = [];
    for (const [test, holder] of [["vent", "amara"], ["line", "lena"]]) {
      for (const patient of (test === "line" ? ["mira", "jiro", "vess"] : ["jiro", "vess"])) for (const outcome of ["keep", "break"]) {
        resetRunState(); state.crisisPath = "breath";
        if (patient === "mira") state.flags.custody_answer = "severed";
        else state.recovered[patient] = true;
        state.promises[holder] = "made"; showScene("prom_" + test);
        if (state.flags.prom_line_other !== patient) failures.push(test + ": patient selection");
        const choice = scenes["prom_" + test].choices.find(c => c.next.endsWith(outcome));
        makeChoice(choice);
        const expected = outcome === "keep" ? "kept" : "broken";
        if (state.promises[holder] !== expected || isAlive(patient) !== (outcome === "keep")) failures.push(test + ": outcome");
        const before = JSON.stringify(state);
        showScene(state.scene, { skipOnEnter: true, resume: true });
        if (JSON.stringify(state) !== before || !document.getElementById("story").innerHTML.includes(crew[patient].first)) failures.push(test + ": committed death was masked/replayed");
      }
      for (const patient of ["jiro", "vess", "lena", "unknown"]) {
        resetRunState(); Object.assign(state.recovered, { jiro: true, vess: true });
        state.flags.prom_line_other = patient; state.promises[holder] = "made";
        if (crew[patient]) kill(patient, "patient absent before test");
        for (const suffix of ["", "_keep"]) {
          const id = "prom_" + test + suffix;
          showScene(id, { skipOnEnter: true, resume: true });
          if (!document.getElementById("story").innerHTML.includes(ABSENT_CAST_TEXT) || scenes[id].choices[0].text !== "Continue.") failures.push(id + ": absent patient offered");
        }
        const before = JSON.stringify(state);
        scenes["prom_" + test + "_break"].onEnter();
        if (JSON.stringify(state) !== before) failures.push(test + ": dead/invalid patient fabricated a broken promise");
      }
      for (const patient of ["jiro", "vess"]) {
        resetRunState(); state.flags.prom_line_other = patient; state.promises[holder] = "made";
        const before = JSON.stringify(state);
        scenes["prom_" + test + "_break"].onEnter();
        if (JSON.stringify(state) !== before) failures.push(test + ": unrecovered patient fabricated a broken promise");
      }
    }
    for (const [who, id] of [["tomas", "act2_tether_dock"], ["jiro", "act3_reckoning_cut"], ["vess", "vess_boarding"]]) {
      resetRunState(); showScene(id);
      if (!isAlive(who) || !state.recovered[who]) failures.push(id + ": recovery blocked");
      resetRunState(); kill(who, "recorded dead before recovery");
      const before = JSON.stringify(state);
      scenes[id].onEnter();
      if (JSON.stringify(state) !== before) failures.push(id + ": resurrected recorded dead");
    }
    return failures;
  })()`);

  // Independent fixtures: do not derive the expected holder or required site
  // from production contracts, or deleting the guard would delete its test too.
  check("named dead-promise witnesses independently remain guarded", `(() => {
    const failures = [];
    const rows = [];
    for (const who of ["amara", "tomas", "elias", "lena", "sela", "mira"]) {
      rows.push(["prom_make_" + who, who], ["prom_r_" + who, who]);
    }
    for (const who of ["amara", "lena"]) rows.push(["prom_make_" + who + "_ag", who], ["prom_r_" + who + "_ag", who]);
    for (const [test, who] of [["vent", "amara"], ["deck4", "elias"], ["line", "lena"], ["direct", "mira"], ["price", "sela"]]) {
      rows.push(["prom_" + test, who], ["prom_" + test + "_keep", who], ["prom_" + test + "_break", who]);
    }
    rows.push(["offshift_tomas_r", "tomas"]);
    for (const [id, who] of rows) for (const promise of [null, "made"]) {
      resetRunState(); Object.assign(state.recovered, { tomas: true, jiro: true, vess: true });
      state.flags.prom_line_other = "jiro"; state.flags["prom_" + who] = true;
      state.crisisPath = "breath";
      if (promise) state.promises[who] = promise;
      kill(who, "independent dead promise witness");
      const before = JSON.stringify(state);
      scenes[id].onEnter({ resume: true });
      if (JSON.stringify(state) !== before) failures.push(id + ": dead holder received an encounter write");
      showScene(id, { skipOnEnter: true, resume: true });
      if (!document.getElementById("story").innerHTML.includes(ABSENT_CAST_TEXT) ||
          scenes[id].choices[0].text !== "Continue.") failures.push(id + ": dead holder still addressable");
    }
    return failures;
  })()`);

  check("secondary speech, interrupted partners, and original guarded images", `(() => {
    const failures = [];
    const cases = [
      ["time_pass", ["mira"], "Order Mira and Elias"],
      ["vault_sacrifice", ["mira", "elias"], "Mira waits"],
      ["coolant_trade", ["mira"], "Mira and Lena are arguing"],
      ["romance_mira_1", ["elias"], "Elias will not notice"],
      ["act3_vault_face_read", ["sela", "elias"], "Elias slides"],
      ["vault_voice", ["mira", "tomas"], "Some of the crew have started"],
      ["custody_after", ["mira", "sela"], "She carries the cold"]
    ];
    for (const [id, absent, forbidden] of cases) {
      resetRunState(); Object.assign(state.recovered, { tomas: true, jiro: true, vess: true });
      state.flags.custody_answer = "severed"; state.flags.vault_priority = "future";
      absent.forEach(who => kill(who, "secondary speaker fixture"));
      document.getElementById("choices").children = [];
      showScene(id, { skipOnEnter: true, resume: true });
      const html = document.getElementById("story").innerHTML + gameplayChoiceButtons().map(b => b.innerHTML).join(" ");
      if (html.includes(forbidden)) failures.push(id + ": secondary speaker");
    }
    for (const who of ["mira", "amara", "sela", "lena"]) {
      resetRunState(); state.flags.ship_memory = "jury_rig"; kill(who, "absent interrupted partner");
      const before = JSON.stringify(state);
      scenes["bond_" + who].onEnter();
      if (JSON.stringify(state) !== before) failures.push(who + ": dead bond wrote interrupt");
      state.flags.interrupt_return = "bond_" + who;
      for (const id of ["ship_interrupt", "ship_interrupt_resolve"]) {
        showScene(id, { skipOnEnter: true, resume: true });
        if (!document.getElementById("story").innerHTML.includes(ABSENT_CAST_TEXT)) failures.push(id + ": absent partner");
      }
    }
    for (const [id, cast] of Object.entries(livingCastImageOnly)) for (const who of cast) {
      resetRunState(); Object.assign(state.recovered, { tomas: true, jiro: true, vess: true });
      kill(who, "absent image fixture");
      if (resolveSceneImage(id, scenes[id]) !== "images/corridor_variant.jpg") failures.push(id + ": absent portrait");
    }
    return failures;
  })()`);

  check("marker-less imports do not create a dead holder's promise outcome", `(() => {
    const failures = [], confirm = window.confirm;
    window.confirm = () => true;
    try {
      for (const who of ["amara", "tomas", "elias", "lena", "sela", "mira"]) {
        localStorage.clear(); resetRunState();
        Object.assign(state.recovered, { tomas: true, jiro: true, vess: true });
        state.crisisPath = "breath"; state.flags.vault_sacrifice = "split";
        state.scene = "prom_r_" + who; state.flags["prom_" + who] = true;
        state.promises[who] = "made";
        kill(who, "legacy holder died before test");
        const cast = JSON.stringify({ dead: state.dead, recovered: state.recovered, deathCause: state.deathCause });
        const snapshot = snapshotState(); delete snapshot.sceneEntered;
        if (!importSaveText(JSON.stringify(snapshot))) { failures.push(who + ": legacy import rejected"); continue; }
        resetRunState();
        if (!resumeGame() || state.promises[who] !== "made" ||
            JSON.stringify({ dead: state.dead, recovered: state.recovered, deathCause: state.deathCause }) !== cast) {
          failures.push(who + ": legacy cast/promise changed");
        }
      }
    } finally { window.confirm = confirm; }
    return failures;
  })()`);
  return errors;
}
