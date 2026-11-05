import assert from "node:assert/strict";

// SUN-V035-PLAYTEST-PREGNANCY-LENA-01: wording only, no reproductive mechanics.
export function pregnancyLenaChecks(runtime) {
  const errors = [];
  const check = (name, code) => {
    try {
      assert.equal(runtime.evaluate(`(() => {
        const expect = (ok, message) => { if (!ok) throw new Error(message); };
        const participant = "We crossed that line together. We need to talk about the medical reality.";
        const generic = "If you have been with anyone, we need to talk about the medical reality.";
        const snapshot = () => JSON.stringify(state);
        const display = (id, opts) => { document.getElementById("choices").children = []; showScene(id, opts); };
        const html = () => document.getElementById("story").innerHTML;
        const click = label => {
          const b = gameplayChoiceButtons().find(b => b.innerHTML.includes(label));
          expect(b && !b.disabled, state.scene + ": unavailable " + label);
          document.getElementById("choices").children = []; b.onclick();
        };
        ${code}
        return true;
      })()`, 30_000), true);
    } catch (error) { errors.push(`Pregnancy Lena ${name}: ${error.message}`); }
  };

  check("actual consent versus held-only/declined medical arrivals", `
    for (const choice of ["Cross the line", "Hold her hand only", "Step back."]) {
      localStorage.clear(); resetRunState(); display("lena_dying");
      click("Take her hand"); click(choice);
      const joined = choice === "Cross the line";
      if (joined) click("Say nothing.");
      expect(!!state.romance.lena === joined, "Lena participation did not follow actual choice");
      // Admit a late recovery context; the other-partner control legitimately
      // offers medical without inventing a Lena encounter.
      Object.assign(state.recovered, { tomas: true, jiro: true, vess: true });
      if (!joined) state.romance.amara = true;
      state.memories = []; display("act3_spine_next"); click("Continue.");
      expect(state.scene === "pregnancy_check", "medical route lost");
      expect(html().includes(joined ? participant : generic), "opening ignores actual participation");
      expect(!html().includes(joined ? generic : participant), "wrong opening also rendered");
      expect(state.flags.pregnancy_risk === undefined, "render invented an outcome");
      expect(gameplayChoiceButtons().length === 4, "medical choices changed");
    }
  `);

  check("participation is not inferred from others, pursuit, marks or a dying clock", `
    resetRunState(); const originalGeneric = scenes.pregnancy_check.text;
    expect(originalGeneric.includes(generic), "generic opening removed");
    for (const joined of [false, true])
    for (const other of ["none", "mira", "amara", "sela", "vess_offer", "vess_hour", "group"])
    for (const life of ["healthy", "dying", "dead"]) {
      resetRunState(); state.romance.lena = joined;
      state.affinity.lena = state.trust.lena = 100; state.pursuit.lena = true;
      state.promises.lena = "made"; mark("lena", "held_only"); mark("lena", "dying_held");
      Object.assign(state.recovered, { tomas: true, jiro: true, vess: true });
      if (["mira", "amara", "sela"].includes(other)) state.romance[other] = true;
      if (other.startsWith("vess")) state.romance.vess = true;
      if (other === "vess_hour") state.flags.vess_intimate = true;
      if (other === "group") state.romance.amara_tomas = true;
      if (life === "dying") state.dying.lena = "kept working until the clock ran out";
      if (life === "dead") kill("lena", "pregnancy fixture");
      state.memories = []; display("pregnancy_check");
      const before = snapshot(), text = scenes.pregnancy_check.text;
      if (life === "dead") {
        expect(text.startsWith("There is no medical officer left") && !text.includes(participant) &&
          !text.includes(generic), "unavailable Lena speaks");
        expect(JSON.stringify(scenes.pregnancy_check.choices) === JSON.stringify([
          { text: "Move on. Medical is empty.", next: "tomas_break" }
        ]), "dead-Lena exit changed");
        expect(resolveSceneImage("pregnancy_check", scenes.pregnancy_check) === "images/corridor_pressure_3.jpg", "dead portrait returned");
      } else {
        expect(text.includes(joined ? participant : generic) && !text.includes(joined ? generic : participant), "participation inferred from wrong facts");
        expect(text.replace(participant, generic) === originalGeneric, "non-opening reproductive prose changed");
        expect(resolveSceneImage("pregnancy_check", scenes.pregnancy_check) === "images/lena.jpg", "existing living image changed");
      }
      expect(snapshot() === before, "render wrote state");
    }
  `);

  check("all four original payments, outcomes, exits and post-choice restores", `
    for (const joined of [false, true]) for (const tomas of ["alive", "missing", "dead"])
    for (let pick = 0; pick < 4; pick++) {
      localStorage.clear(); resetRunState(); state.romance.lena = joined;
      state.integrity = state.cohesion = state.supplies = state.embryos = 40;
      state.trust.lena = 40; state.recovered.tomas = tomas !== "missing";
      if (tomas === "dead") kill("tomas", "medical exit fixture");
      // Already warned context isolates the medical transaction from the
      // unchanged first Tomas-warning entry effect.
      mark("tomas", "warned"); display("pregnancy_check");
      const next = tomas === "alive" ? "tomas_break" : "act3_lethal_elias_order";
      const expectedChoices = [
        { text: "There is a possibility. Prepare for both outcomes.", next, effects: { cohesion: -2, supplies: -6, embryos: -3 }, flag: { pregnancy_risk: true }, requires: { supplies: { min: 12 }, trust: { lena: 40 } }, lean: { living: 3 } },
        { text: "It will not become a problem. Handle prevention.", next, effects: { supplies: -3, cohesion: 1 }, flag: { pregnancy_risk: false } },
        { text: "That is private. Do your job when asked.", next, effects: { cohesion: -5, integrity: -1 }, flag: { pregnancy_risk: "unknown" } },
        { text: "End the discussion. There is nothing left to spend.", next, flag: { pregnancy_risk: "unknown" } }
      ];
      expect(JSON.stringify(scenes.pregnancy_check.choices) === JSON.stringify(expectedChoices), "medical descriptor changed");
      const c = expectedChoices[pick], expected = JSON.parse(snapshot());
      expected.scene = next;
      for (const [k, v] of Object.entries(c.effects || {})) expected[k] += v;
      expected.flags.pregnancy_risk = c.flag.pregnancy_risk;
      if (c.lean) expected.ideology.living += 3;
      click(c.text);
      expect(snapshot() === JSON.stringify(expected), "medical choice changed more than original delta");
      const raw = readRawSave();
      for (let repeat = 0; repeat < 2; repeat++) {
        resetRunState(); state.supplies = 1; document.getElementById("choices").children = [];
        expect(resumeGame() && snapshot() === JSON.stringify(expected) && readRawSave() === raw, "post-choice Continue replayed payment/history");
      }
    }
  `);

  check("dead Lena exits without medical payments or outcomes", `
    for (const joined of [false, true]) for (const tomas of ["alive", "missing", "dead"]) {
      resetRunState(); state.romance.lena = joined; kill("lena", "empty medical fixture");
      state.recovered.tomas = tomas !== "missing";
      if (tomas === "dead") kill("tomas", "empty medical exit fixture");
      mark("tomas", "warned"); display("pregnancy_check");
      const expected = JSON.parse(snapshot());
      expected.scene = tomas === "alive" ? "tomas_break" : "act3_lethal_elias_order";
      expect(gameplayChoiceButtons().length === 1, "dead Lena offers medical decisions");
      click("Move on. Medical is empty.");
      expect(snapshot() === JSON.stringify(expected), "empty medical wrote a payment or outcome");
    }
  `);

  check("affordability and the zero-resource exit do not depend on participation", `
    for (const joined of [false, true]) for (const supplies of [0, 2, 3, 11, 12])
    for (const trust of [39, 40]) {
      resetRunState(); state.romance.lena = joined; state.supplies = supplies; state.trust.lena = trust;
      display("pregnancy_check"); const b = gameplayChoiceButtons();
      expect(b[0].disabled === (supplies < 12 || trust < 40), "preparation gate changed");
      expect(b[1].disabled === (supplies < 3) && !b[3].disabled, "prevention/floor gate changed");
    }
    for (const joined of [false, true]) {
      resetRunState(); state.romance.lena = joined;
      state.integrity = state.cohesion = state.supplies = state.embryos = 0;
      display("pregnancy_check");
      expect(gameplayChoiceButtons().filter(b => !b.disabled).length === 1, "zero-resource exit changed");
      click("End the discussion.");
      expect(state.flags.pregnancy_risk === "unknown" && state.scene === "act3_lethal_elias_order", "floor did not advance unchanged");
    }
  `);

  check("current and marker-less medical imports preserve all recorded history", `
    const confirm = window.confirm; window.confirm = () => true;
    try {
      for (const joined of [false, true]) for (const life of ["healthy", "dying", "dead"])
      for (const risk of [undefined, false, true, "unknown"]) for (const legacy of [false, true]) {
        localStorage.clear(); resetRunState(); state.romance.lena = joined;
        state.romance.amara = state.romance.vess = true; state.flags.vess_intimate = true;
        state.romance.amara_tomas = true; state.pursuit.amara = true;
        Object.assign(state.recovered, { tomas: true, jiro: true, vess: true });
        if (life === "dying") state.dying.lena = "kept working until the clock ran out";
        if (life === "dead") kill("lena", "saved medical absence");
        if (risk !== undefined) state.flags.pregnancy_risk = risk;
        state.memories = ["Keep the imported history."]; display("pregnancy_check");
        const before = snapshot(), text = html(), choices = JSON.stringify(scenes.pregnancy_check.choices);
        const save = snapshotState(); if (legacy) delete save.sceneEntered;
        const raw = JSON.stringify(save); expect(importSaveText(raw), "valid medical import rejected");
        let adopted;
        for (let repeat = 0; repeat < 2; repeat++) {
          resetRunState(); state.supplies = 1; document.getElementById("choices").children = [];
          expect(resumeGame() && snapshot() === before && html() === text &&
            JSON.stringify(scenes.pregnancy_check.choices) === choices, "medical resume altered history/view");
          if (!legacy) expect(readRawSave() === raw, "current imported bytes changed");
          if (repeat) expect(readRawSave() === adopted, "repeat Continue rewrote slot");
          adopted = readRawSave();
        }
      }
    } finally { window.confirm = confirm; }
  `);
  return errors;
}
