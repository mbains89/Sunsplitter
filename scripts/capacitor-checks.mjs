import assert from "node:assert/strict";

// SUN-V035-PLAYTEST-CAPACITOR-01: wording repair only; keep mechanics and saves.
export function capacitorChecks(runtime) {
  const errors = [];
  const check = (label, source) => {
    try {
      assert.equal(runtime.evaluate(`(() => {
        const label = "Burn the drive-repair capacitors. Keep systems running now.";
        const expect = (ok, message) => { if (!ok) throw new Error(message); };
        const display = (id, opts) => { document.getElementById("choices").children = []; showScene(id, opts); };
        const story = () => document.getElementById("story").innerHTML;
        const burnButton = () => gameplayChoiceButtons().find(b => b.innerHTML.includes("capacitors."));
        ${source}
        return true;
      })()`, 30_000), true);
    } catch (error) { errors.push(`Capacitor ${label}: ${error.message}`); }
  };

  check("fresh route renders the spent drive resource, not false protection", `
    localStorage.clear(); startGame(); finishCinematic();
    const legal = c => (!c.alive || isAlive(c.alive)) &&
      (!c.aliveAll || c.aliveAll.every(isAlive)) && (!c.aliveAny || c.aliveAny.some(isAlive)) &&
      (!c.requires || meetsRequirements(c.requires)) && canAffordEffects(c.effects);
    for (let step = 0; step < 60 && state.scene !== "power_crisis"; step++) {
      const scene = scenes[state.scene], raw = scene.choices;
      const choice = (typeof raw === "function" ? raw() : raw).find(legal);
      expect(choice && state.scene !== "ending_check", "fresh route missed power crisis");
      makeChoice(choice);
    }
    expect(state.scene === "power_crisis" && isAlive("mira"), "fresh route did not reach Mira");
    display(state.scene, { skipOnEnter: true });
    expect(story().includes("Those capacitors are also what I need if we ever want the drive back."), "setup changed");
    const button = burnButton();
    expect(button && button.innerHTML.includes(label), "drive-repair cost missing from rendered label");
    expect(!button.innerHTML.includes("protect the drive option"), "contradictory protection remains");
    expect(!button.disabled, "fresh route cannot select burn");
    document.getElementById("choices").children = []; button.onclick();
    expect(state.flags.power === "burn", "fresh selection did not commit");
    expect(scenes.time_pass.text.includes("written off any realistic chance of restoring full drive power"), "existing delayed cost missing");
  `);

  check("original choices, one-time payment and both existing event orders", `
    const choices = scenes.power_crisis.choices;
    const { text, ...burn } = choices[1];
    expect(JSON.stringify(burn) === JSON.stringify({
      next: "private_stores", effects: { integrity: -7, supplies: -9, cohesion: 4 },
      flag: { power: "burn" }, requires: { supplies: { min: 12 } }, lean: { future: 2 }
    }), "burn mechanics changed");
    expect(choices[0].text === "Cut non-essentials. Stabilize the ship." &&
      choices[2].text === "Ask Mira to invent a third option, even if it is riskier." &&
      choices[2].alive === "mira", "neighbor or living gate changed");
    const random = Math.random;
    try {
      for (const roll of [0.25, 0.75]) {
        resetRunState(); state.integrity = state.cohesion = 40; state.supplies = 30;
        Math.random = () => roll; display("power_crisis");
        const before = JSON.parse(JSON.stringify(state));
        const expected = JSON.parse(JSON.stringify(state));
        expected.scene = roll < 0.5 ? "coolant_trade" : "private_stores";
        expected.integrity -= 7; expected.supplies -= 9; expected.cohesion += 4;
        expected.flags.power = "burn"; expected.ideology.future += 2;
        const button = burnButton(); expect(button && !button.disabled, "burn not enabled");
        document.getElementById("choices").children = []; button.onclick();
        expect(JSON.stringify(state) === JSON.stringify(expected), "selection changed more than original delta");
        const stored = readRawSave();
        expect(JSON.parse(stored).supplies === before.supplies - 9, "paid amount not autosaved");
        for (let repeat = 0; repeat < 2; repeat++) {
          resetRunState(); state.supplies = 1; document.getElementById("choices").children = [];
          expect(resumeGame() && JSON.stringify(state) === JSON.stringify(expected), "post-choice Continue repeated a cost");
          expect(readRawSave() === stored, "post-choice Continue rewrote bytes");
        }
      }
    } finally { Math.random = random; }
  `);

  check("affordability boundary and dead-Mira narration retained", `
    for (const dead of [false, true]) for (const supplies of [0, 11, 12, 30])
    for (const hull of [6, 7, 40]) {
      resetRunState(); state.supplies = supplies; state.integrity = hull;
      if (dead) kill("mira", "capacitor test");
      display("power_crisis");
      const button = burnButton();
      expect(button && button.disabled === (supplies < 12 || hull < 7), "burn affordability changed");
      expect(gameplayChoiceButtons().some(b => !b.disabled), "no affordable exit");
      if (dead) expect(!story().includes("Mira calls") &&
        !gameplayChoiceButtons().some(b => b.innerHTML.includes("Ask Mira")), "dead-Mira guard changed");
      state.flags.power = "burn";
      const before = JSON.stringify(state), later = scenes.time_pass.text;
      expect(later.includes("Systems remain online") && later.includes("written off"), "delayed cost disappeared");
      if (dead) expect(!later.includes("Mira has already"), "dead Mira speaks in delayed cost");
      else expect(later.includes("Mira has already") && later.includes("without a miracle"), "living consequence changed");
      expect(JSON.stringify(state) === before, "delayed text mutates state");
    }
  `);

  check("source and consequence Import/Continue retain state and saved bytes", `
    const confirm = window.confirm; window.confirm = () => true;
    try {
      for (const id of ["power_crisis", "private_stores", "time_pass"])
      for (const dead of [false, true]) for (const legacy of [false, true]) {
        localStorage.clear(); resetRunState(); state.flags.power = "burn";
        state.promises.sela = state.promises.tomas = "made";
        if (dead) kill("mira", "capacitor saved fixture");
        display(id, { skipOnEnter: true });
        const expected = JSON.stringify(state), snapshot = snapshotState();
        if (legacy) delete snapshot.sceneEntered;
        const raw = JSON.stringify(snapshot);
        expect(importSaveText(raw), "valid import rejected");
        let adopted;
        for (let repeat = 0; repeat < 2; repeat++) {
          resetRunState(); state.supplies = 1; document.getElementById("choices").children = [];
          expect(resumeGame() && JSON.stringify(state) === expected, "Continue changed saved state or cast");
          if (!legacy) expect(readRawSave() === raw, "marked import bytes changed");
          if (repeat) expect(readRawSave() === adopted, "repeated Continue rewrote slot");
          adopted = readRawSave();
          if (id === "power_crisis") expect(burnButton().innerHTML.includes(label), "restored label contradicts setup");
          if (id === "time_pass") expect(story().includes("written off"), "restored burn cost missing");
        }
      }
    } finally { window.confirm = confirm; }
  `);
  return errors;
}
