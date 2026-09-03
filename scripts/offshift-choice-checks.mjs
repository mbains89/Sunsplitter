import assert from "node:assert/strict";

export function offshiftChoiceChecks(runtime) {
  const errors = [];
  const check = (label, source) => {
    try { assert.equal(runtime.evaluate(source), true); }
    catch (error) { errors.push(`Off-Shift choices ${label}: ${error.message}`); }
  };
  // Reach the defect by actual choices: Sela's untested promise survives vent.
  // Only event RNG and the choice policy are controlled; no state is injected.
  check("fresh dead-holder route offers the authored meal floor", `(() => {
    const random = Math.random;
    try {
      Math.random = () => 0.75;
      localStorage.clear(); resetRunState(); showScene("wake");
      const visits = new Map();
      const preferred = ["quiet_sela", "vent", "bond_tomas", "offshift_tomas", "arc_living_1"];
      for (let step = 0; step < 180; step++) {
        if (state.scene === "offshift_tomas") {
          return step === 103 && isAlive("tomas") && !isAlive("sela") &&
            state.promises.sela === "made" && state.promises.tomas === "made" &&
            scenes.offshift_tomas.text.includes("He doesn't ask for anything.") &&
            scenes.offshift_tomas.choices.map(c => c.text).join("|") === "Eat with him.|Take yours and go.";
        }
        if (state.scene === "ending_check") return false;
        const scene = scenes[state.scene], raw = scene.choices;
        const choices = (typeof raw === "function" ? raw.call(scene) : raw || []).filter(c =>
          (!c.alive || isAlive(c.alive)) && (!c.aliveAll || c.aliveAll.every(isAlive)) &&
          (!c.aliveAny || c.aliveAny.some(isAlive)) && (!c.requires || meetsRequirements(c.requires)) &&
          (!c.effects || canAffordEffects(c.effects)));
        if (!choices.length) return false;
        const key = c => state.scene + "|" + c.text;
        let choice = state.scene === "vault_sacrifice" && choices.find(c => c.flag?.vault_sacrifice === "living");
        for (const next of preferred) if (!choice) choice = choices.find(c => c.next === next);
        if (!choice) choice = choices.reduce((a, b) => (visits.get(key(b)) || 0) < (visits.get(key(a)) || 0) ? b : a);
        visits.set(key(choice), (visits.get(key(choice)) || 0) + 1);
        makeChoice(choice);
      }
      return false;
    } finally { Math.random = random; }
  })()`);
  check("live, dead, mixed and resolved holders retain matching choices on resume", `(() => {
    const holders = ["lena", "sela", "elias", "mira"];
    const fixtures = [
      { promises: {}, dead: [], ask: false },
      { promises: { lena: "kept", sela: "broken", elias: "declined" }, dead: [], ask: false },
      ...holders.flatMap(who => [
        { promises: { [who]: "made" }, dead: [], ask: true },
        { promises: { [who]: "made" }, dead: [who], ask: false }
      ]),
      { promises: { lena: "made", sela: "made" }, dead: ["lena"], ask: true }
    ];
    for (const tomas of ["made", "kept", "declined"]) for (const fixture of fixtures) {
      localStorage.clear(); resetRunState(); state.recovered.tomas = true;
      state.crisisPath = "breath";
      Object.assign(state.promises, fixture.promises, { tomas });
      for (const who of fixture.dead) kill(who, "dead-holder choice fixture");
      showScene("offshift_tomas");
      const before = JSON.stringify(state), promises = JSON.stringify(state.promises);
      const choices = scenes.offshift_tomas.choices;
      const expected = fixture.ask ? ["Agree to weigh it in daylight.", "Tell him a promise is a promise."] :
        ["Eat with him.", "Take yours and go."];
      if (JSON.stringify(choices) !== JSON.stringify(expected.map(text => ({ text, next: "faction_split" })))) return false;
      if (scenes.offshift_tomas.text.includes("He doesn't ask for anything.") === fixture.ask) return false;
      if (JSON.stringify(state) !== before) return false;
      const saved = snapshotState(); saved.sceneEntered = true;
      for (let index = 0; index < choices.length; index++) {
        localStorage.setItem(SAVE_KEY, JSON.stringify(saved));
        if (!resumeGame() || JSON.stringify(state) !== before) return false;
        if (JSON.stringify(scenes.offshift_tomas.choices) !== JSON.stringify(choices)) return false;
        const choice = scenes.offshift_tomas.choices[index];
        if (!scenes[choice.next]) return false;
        makeChoice(choice);
        if (state.scene !== "faction_split" || JSON.stringify(state.promises) !== promises) return false;
      }
    }
    return true;
  })()`);
  check("first Tomas vow keeps both existing response routes", `(() => {
    for (const accept of [true, false]) {
      localStorage.clear(); resetRunState(); state.recovered.tomas = true; state.crisisPath = "breath";
      state.promises.sela = "made"; kill("sela", "dead-holder choice fixture");
      showScene("offshift_tomas");
      const choices = scenes.offshift_tomas.choices;
      if (choices.length !== 2 || choices.some(c => c.next !== "offshift_tomas_r")) return false;
      makeChoice(choices[accept ? 0 : 1]);
      if (state.scene !== "offshift_tomas_r" || state.promises.tomas !== (accept ? "kept" : "declined")) return false;
      makeChoice(scenes.offshift_tomas_r.choices[0]);
      if (state.scene !== "faction_split" || state.promises.sela !== "made") return false;
    }
    return true;
  })()`);
  return errors;
}
