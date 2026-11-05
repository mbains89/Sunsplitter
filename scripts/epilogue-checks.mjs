import assert from "node:assert/strict";

// SUN-V035-PLAYTEST-EPILOGUE-01. Controlled saved contexts, not a full playtest.
export function epilogueChecks(runtime) {
  const errors = [];
  const check = (name, source) => {
    try {
      assert.equal(runtime.evaluate(`(() => {
        const expect = (ok, message) => { if (!ok) throw new Error(message); };
        const display = (id, opts) => { document.getElementById("choices").children = []; showScene(id, opts); };
        const html = () => document.getElementById("story").innerHTML;
        const click = label => {
          const b = gameplayChoiceButtons().find(b => b.innerHTML.includes(label));
          expect(b && !b.disabled, state.scene + ": unavailable " + label);
          document.getElementById("choices").children = []; b.onclick();
        };
        const group = "You shared the hydroponics bay with Amara and Tomas.";
        const intimate = "Shared the last long-range window and a private hour with Vess.";
        const accepted = "Vess offered the attempt and you accepted. Power stayed hers.";
        const snapshot = () => JSON.stringify(state);
        ${source}
        return true;
      })()`, 30_000), true);
    } catch (error) { errors.push(`Epilogue ${name}: ${error.message}`); }
  };

  check("first exit and later return reflect actual completed encounters", `
    localStorage.clear(); resetRunState();
    // Completed early relationships; advance later encounters using real buttons.
    state.romance.lena = state.romance.amara = true;
    state.flags.hydro = "full"; state.flags.ship_interrupt_fired = true;
    state.supplies = 60; state.cohesion = 40;
    display("debt_notice");
    expect(html().includes("Lena's first report") && html().includes("Amara sends"), "early recap lost");
    expect(!html().includes(group) && !html().includes("Vess"), "future encounter invented");
    click("Take the temperature change");
    expect(state.scene === "act2_tether_sighting", "early onward route changed");
    // Admit the recovered-Tomas/Jiro context; exercise Vess's actual boarding.
    state.recovered.tomas = state.recovered.jiro = true;
    display("vess_boarding");
    for (const label of ["Get her through the collar", "Accept the offer",
      "Give her the window", "Let the hour end", "Walk in on Amara and Tomas",
      "Stay. Join", "Dress and leave", "Amara locks the bay", "Negotiate: delay half",
      "Match her honesty"]) click(label);
    for (let i = 0; i < 12 && state.scene !== "debt_notice"; i++) {
      const b = gameplayChoiceButtons().find(b => !b.disabled);
      expect(b, "promise return has no exit");
      document.getElementById("choices").children = []; b.onclick();
    }
    expect(state.scene === "debt_notice", "later return did not close private hours");
    expect(state.romance.vess && state.flags.vess_intimate && state.romance.amara_tomas &&
      state.pursuit.amara, "encounter facts not committed");
    expect(html().includes(group) && html().includes(intimate), "completed partners missing from later recap");
    expect(state.supplies === 58 && state.cohesion === 44, "original encounter payments changed");
    const before = snapshot(), raw = readRawSave(), choices = JSON.stringify(scenes.debt_notice.choices);
    for (let i = 0; i < 2; i++) {
      display("debt_notice", { skipOnEnter: true });
      expect(snapshot() === before && JSON.stringify(scenes.debt_notice.choices) === choices, "recap replayed a reward or rewrote choices");
      resetRunState(); state.supplies = 1; document.getElementById("choices").children = [];
      expect(resumeGame() && snapshot() === before && readRawSave() === raw, "later Continue did not restore exact slot");
    }
    expect(!scenes.pursuit_window.choices.some(c => c.next === "pursuit_amara"), "used second Amara restored");
    expect(!scenes.intimacy_window.choices.some(c => c.next === "romance_amara_tomas"), "used group restored in private window");
    expect(!scenes.act3_spine_next.choices.some(c => c.next === "romance_amara_tomas"), "used group restored on spine");
    expect(!scenes.vess_offer.choices.some(c => c.next === "vess_transmission"), "used Vess offer restored");
    click("Take the temperature change");
    expect(state.scene === "act3_spine_next", "later onward Continue failed");
    const after = JSON.parse(before); after.scene = "act3_spine_next";
    expect(snapshot() === JSON.stringify(after), "free onward choice replayed encounter state");
  `);

  check("accepted, declined, group-only and absent cast are distinct", `
    for (const vessState of ["none", "declined", "accepted", "complete"])
    for (const shared of [false, true])
    for (const absent of [null, "vess", "amara", "tomas", "unrecovered_vess", "unrecovered_tomas"]) {
      resetRunState(); Object.assign(state.recovered, { tomas: true, jiro: true, vess: true });
      state.romance.vess = ["accepted", "complete"].includes(vessState);
      state.flags.vess_intimate = vessState === "complete";
      state.romance.amara_tomas = shared;
      if (vessState === "declined") mark("vess", "declined");
      if (absent?.startsWith("unrecovered_")) state.recovered[absent.slice(12)] = false;
      else if (absent) kill(absent, "epilogue fixture");
      state.memories = []; // Facts must not depend on the bounded memory list.
      display("debt_notice");
      const before = snapshot(), text = scenes.debt_notice.text;
      const v = isAlive("vess") && state.romance.vess;
      expect(text.includes(intimate) === !!(v && state.flags.vess_intimate), "Vess completion distinction lost");
      expect(text.includes(accepted) === !!(v && !state.flags.vess_intimate), "Vess acceptance distinction lost");
      expect(text.includes(group) === !!(shared && isAlive("amara") && isAlive("tomas")), "shared/absent group invented or omitted");
      expect(!text.includes("Amara sends") && !text.includes("Lena's first report"), "group invented solo romance");
      expect(snapshot() === before, "recap mutated empty-memory fixture");
      expect(gameplayChoiceButtons().some(b => !b.disabled), "no enabled exit");
    }
    // The actual decline/privacy handlers must not create participation facts.
    resetRunState(); Object.assign(state.recovered, { tomas: true, jiro: true, vess: true });
    state.flags.hydro = "full"; display("vess_offer"); click("Decline. Log it clean.");
    display("romance_amara_tomas"); click("Leave them the privacy");
    expect(state.scene === "debt_notice" && !html().includes(group) && !html().includes("Vess offered") &&
      !html().includes(intimate), "decline/privacy fabricated a relationship");
    resetRunState(); state.recovered.vess = true;
    display("vess_offer"); click("Accept the offer"); click("Keep the window for the ship");
    display("debt_notice");
    expect(html().includes(accepted) && !html().includes(intimate), "accepted offer fabricated a completed hour");
  `);

  check("exact two exits and current/legacy Import Continue retain all history", `
    const confirm = window.confirm; window.confirm = () => true;
    try {
      for (const stage of ["early", "accepted", "complete", "absent"])
      for (const legacy of [false, true])
      for (const recovered of [0, 1, 2]) {
        localStorage.clear(); resetRunState();
        state.romance.lena = state.romance.amara = true;
        state.recovered.tomas = recovered > 0; state.recovered.jiro = recovered > 1;
        state.recovered.vess = stage !== "early";
        state.romance.vess = stage !== "early";
        state.flags.vess_intimate = ["complete", "absent"].includes(stage);
        state.romance.amara_tomas = ["complete", "absent"].includes(stage);
        state.pursuit.amara = stage !== "early";
        state.flags.last_tx_spent = state.flags.vess_intimate;
        state.memories = ["Preserve this imported history."];
        if (stage === "absent") { kill("vess", "saved death"); kill("tomas", "saved death"); }
        display("debt_notice");
        const before = snapshot(), text = html(), saved = snapshotState();
        const next = recovered === 2 ? "act3_spine_next" : recovered === 1 ? "act3_reckoning_pattern" : "act2_tether_sighting";
        const expectedChoices = [
          { text: "Take the temperature change as data. Move on.", next },
          { text: "Spend one public hour fixing something with your own hands.", next, effects: { cohesion: 3, integrity: 1 } }
        ];
        expect(JSON.stringify(scenes.debt_notice.choices) === JSON.stringify(expectedChoices), "epilogue choices changed");
        if (legacy) delete saved.sceneEntered;
        const raw = JSON.stringify(saved);
        expect(importSaveText(raw), "valid epilogue import rejected");
        let adopted;
        for (let repeat = 0; repeat < 2; repeat++) {
          resetRunState(); state.supplies = 1; document.getElementById("choices").children = [];
          expect(resumeGame() && snapshot() === before && html() === text, "import Continue altered history/view");
          if (!legacy) expect(readRawSave() === raw, "marked imported bytes changed");
          if (repeat) expect(readRawSave() === adopted, "repeat Continue rewrote save");
          adopted = readRawSave();
          expect(JSON.stringify(scenes.debt_notice.choices) === JSON.stringify(expectedChoices), "restore changed exits");
        }
      }
    } finally { window.confirm = confirm; }
  `);
  return errors;
}
