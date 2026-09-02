import assert from "node:assert/strict";

// Existing stores/coolant decisions may trade places, never replay or reroll
// their rendered offer. No new scene, state key, cost, or romance gate.
export function midgameVarietyChecks(runtime) {
  const errors = [];
  const check = (label, source) => {
    try { assert.equal(runtime.evaluate(source), true); }
    catch (error) { errors.push(`mid-game variety ${label}: ${error.message}`); }
  };
  runtime.evaluate("globalThis.__varietyOriginalRandom = Math.random;");
  try {
    check("two fresh runs, same choices, different existing event order", `(() => {
      const run = coin => {
        resetRunState();
        Math.random = () => coin;
        showScene("wake");
        const path = [];
        for (let step = 0; step < 100 && state.scene !== "time_pass"; step++) {
          const scene = scenes[state.scene];
          const choices = typeof scene.choices === "function" ? scene.choices() : scene.choices;
          const choice = choices.find(c => (!c.alive || isAlive(c.alive)) &&
            (!c.aliveAll || c.aliveAll.every(isAlive)) && (!c.aliveAny || c.aliveAny.some(isAlive)) &&
            (!c.requires || meetsRequirements(c.requires)) && canAffordEffects(c.effects));
          if (!choice) throw new Error("no legal exit at " + state.scene);
          path.push(state.scene);
          makeChoice(choice);
        }
        if (state.scene !== "time_pass") throw new Error("early route did not finish");
        return path;
      };
      const a = run(0.99), b = run(0);
      const pair = path => path.filter(id => ["private_stores", "coolant_trade"].includes(id));
      globalThis.__varietyFreshPaths = [a, b];
      return JSON.stringify(pair(a)) === '["private_stores","coolant_trade"]' &&
        JSON.stringify(pair(b)) === '["coolant_trade","private_stores"]' &&
        a.filter(id => id === "seal_or_food").length === 1 && b.filter(id => id === "seal_or_food").length === 1 &&
        JSON.stringify(a.filter(id => !pair(a).includes(id))) === JSON.stringify(b.filter(id => !pair(b).includes(id)));
    })()`);
    check("resume preserves offered event, flags, and resources", `(() => {
      for (const coin of [0, 0.99]) {
        resetRunState();
        Math.random = () => coin;
        showScene("private_stores");
        const before = snapshotState();
        if (!persistSave({ silent: true })) return false;
        Math.random = () => { throw new Error("resume rerolled the offer"); };
        loadGame();
        const after = snapshotState();
        delete before.savedAt; delete after.savedAt;
        if (JSON.stringify(before) !== JSON.stringify(after)) return false;
        // Re-reading choices is pure too: keyboard/render/simulation agree.
        JSON.stringify(scenes[state.scene].choices);
      }
      return true;
    })()`);
    check("all 18 outcome combinations preserve one-shot completion and downstream Deck 4", `(() => {
      for (const first of ["private_stores", "coolant_trade"]) {
        for (let index = 0; index < 3; index++) {
          for (let secondIndex = 0; secondIndex < 3; secondIndex++) {
            resetRunState();
            state.integrity = state.cohesion = state.supplies = 60;
            Math.random = () => first === "private_stores" ? 0.99 : 0;
            showScene("private_stores");
            if (state.scene !== first) return false;
            makeChoice(scenes[state.scene].choices[index]);
            const second = first === "private_stores" ? "coolant_trade" : "private_stores";
            if (state.scene !== second) return false;
            makeChoice(scenes[state.scene].choices[secondIndex]);
            if (state.scene !== "seal_or_food" || !state.flags.stores || !state.flags.coolant) return false;
            makeChoice(scenes.seal_or_food.choices[2]);
            if (state.scene !== "time_pass" || state.flags.feedstock !== "thin") return false;
          }
        }
      }
      return true;
    })()`);
    check("coolant does not jump ahead without an affordable living-gated exit", `(() => {
      for (const supplies of [0, 1, 2]) {
        resetRunState();
        state.supplies = supplies;
        state.trust.mira = state.trust.lena = 0;
        Math.random = () => { throw new Error("unaffordable coolant entered the random pool"); };
        showScene("private_stores");
        if (state.scene !== "private_stores") return false;
      }
      resetRunState();
      state.supplies = 2;
      state.dead = ["mira", "lena"];
      showScene("private_stores");
      if (state.scene !== "private_stores") return false;
      resetRunState();
      state.supplies = 6;
      state.trust.mira = state.trust.lena = 0;
      Math.random = () => 0;
      showScene("private_stores");
      return state.scene === "coolant_trade";
    })()`);
    check("depleted runs retain original order and a payable exit", `(() => {
      resetRunState();
      state.supplies = 2; state.cohesion = 0; state.integrity = 4;
      Math.random = () => 0;
      showScene("private_stores");
      if (state.scene !== "private_stores") return false;
      makeChoice(scenes.private_stores.choices[2]); // vote: +2 supplies
      if (state.scene !== "coolant_trade") return false;
      makeChoice(scenes.coolant_trade.choices[2]); // split, affordable now
      if (state.scene !== "seal_or_food") return false;
      makeChoice(scenes.seal_or_food.choices[2]);
      if (state.scene !== "time_pass") return false;
      resetRunState();
      state.supplies = 6; state.cohesion = 8; state.integrity = 0;
      showScene("private_stores");
      return state.scene === "private_stores";
    })()`);
    check("reversal reserve boundaries keep every legal outcome payable through Deck 4", `(() => {
      const legal = c => (!c.alive || isAlive(c.alive)) && (!c.requires || meetsRequirements(c.requires)) && canAffordEffects(c.effects);
      for (const supplies of [6, 100]) for (const cohesion of [13, 100]) for (const integrity of [0, 3, 4, 100]) {
        for (let coolant = 0; coolant < 3; coolant++) for (let stores = 0; stores < 3; stores++) {
          resetRunState();
          Object.assign(state, { supplies, cohesion, integrity });
          Math.random = () => 0;
          showScene("private_stores");
          if (state.scene !== "coolant_trade") return false;
          const c = scenes.coolant_trade.choices[coolant];
          if (!legal(c)) continue;
          makeChoice(c);
          if (state.scene !== "private_stores" || !scenes.private_stores.choices.some(legal)) return false;
          const s = scenes.private_stores.choices[stores];
          if (!legal(s)) continue;
          makeChoice(s);
          if (state.scene !== "seal_or_food" || !scenes.seal_or_food.choices.some(legal)) return false;
        }
      }
      return true;
    })()`);
    check("legacy save without entry marker keeps its already offered stores scene", `(() => {
      resetRunState();
      state.scene = "private_stores";
      const saved = snapshotState();
      delete saved.sceneEntered;
      localStorage.setItem(SAVE_KEY, JSON.stringify(saved));
      Math.random = () => { throw new Error("legacy resume rerolled its offer"); };
      loadGame();
      return state.scene === "private_stores" && !state.flags.stores && !state.flags.coolant;
    })()`);
    check("old in-flight saves do not replay earlier completed decisions", `(() => {
      for (const id of ["private_stores", "coolant_trade", "seal_or_food"]) {
        resetRunState();
        if (id !== "private_stores") state.flags.stores = "vote";
        if (id === "seal_or_food") state.flags.coolant = "split";
        showScene(id, { skipOnEnter: true });
        if (!persistSave({ silent: true })) return false;
        Math.random = () => { throw new Error("old in-flight save rerolled"); };
        loadGame();
        if (state.scene !== id) return false;
        makeChoice(scenes[id].choices[0]);
        const expected = { private_stores: "coolant_trade", coolant_trade: "seal_or_food", seal_or_food: "time_pass" };
        if (state.scene !== expected[id]) return false;
      }
      return true;
    })()`);
  } finally {
    runtime.evaluate("Math.random = globalThis.__varietyOriginalRandom; delete globalThis.__varietyOriginalRandom; resetRunState();");
  }
  return errors;
}
