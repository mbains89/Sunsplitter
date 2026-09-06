import assert from "node:assert/strict";

// SUN-V035-PLAYTEST-SELA-ANSWER-01. The question already pays its advertised
// effects; this regression requires a visible answer before the conflict.
export function selaAnswerChecks(runtime) {
  const errors = [];
  const question = "Ask what she would spend to keep a warm world possible.";
  const answer = '"It was warm. Not a memory to cry over — a fact. If we only keep what the dark allows, we will forget what we were trying to arrive as."';
  const check = (label, source) => {
    try {
      assert.equal(runtime.evaluate(`(() => {
        const question = ${JSON.stringify(question)}, answer = ${JSON.stringify(answer)};
        const expect = (ok, message) => { if (!ok) throw new Error(message); };
        const display = (id, opts) => { document.getElementById("choices").children = []; showScene(id, opts); };
        const story = () => document.getElementById("story").innerHTML;
        const click = label => {
          const button = gameplayChoiceButtons().find(b => b.innerHTML.includes(label));
          expect(button && !button.disabled, "enabled button missing: " + label);
          document.getElementById("choices").children = []; button.onclick();
        };
        ${source}
        return true;
      })()`, 30_000), true);
    } catch (error) { errors.push(`Sela answer ${label}: ${error.message}`); }
  };

  check("fresh New Run reaches the answer before the parts argument", `
    localStorage.clear(); startGame(); finishCinematic();
    const visits = new Map(), path = [];
    const legal = c => (!c.alive || isAlive(c.alive)) &&
      (!c.aliveAll || c.aliveAll.every(isAlive)) && (!c.aliveAny || c.aliveAny.some(isAlive)) &&
      (!c.requires || meetsRequirements(c.requires)) && canAffordEffects(c.effects);
    for (let step = 0; step < 180 && state.scene !== "arc_living_2"; step++) {
      const id = state.scene;
      expect(id !== "ending_check", "route ended before Sela");
      const scene = scenes[id], raw = scene.choices;
      const choices = (typeof raw === "function" ? raw() : raw).filter(legal);
      const choice = choices.find(c => c.next === "arc_living_1") ||
        choices.map((c, i) => ({ c, i, n: visits.get(id + "|" + c.text) || 0 }))
          .sort((a, b) => a.n - b.n || a.i - b.i)[0]?.c;
      expect(choice, "route lost its exit at " + id);
      visits.set(id + "|" + choice.text, (visits.get(id + "|" + choice.text) || 0) + 1);
      path.push(id); makeChoice(choice);
    }
    expect(state.scene === "arc_living_2" && isAlive("sela"), "fresh route did not reach living Sela");
    expect(path.includes("quiet_sela"), "fixture must also exercise the earlier Sela conversation");
    display(state.scene, { skipOnEnter: true }); click(question);
    expect(state.scene === "arc_living_sela_answer", "question skipped its answer");
    expect(story().includes(answer) && !story().includes("parts allocation"), "answer not separately readable");
    expect(JSON.parse(readRawSave()).scene === state.scene, "answer was not autosaved");
    const before = JSON.stringify({ ...state, scene: "arc_living_3" });
    click("Continue.");
    expect(state.scene === "arc_living_3" && story().includes("parts allocation"), "conflict did not follow answer");
    expect(JSON.stringify(state) === before, "acknowledgment repeated a reward or changed state");
  `);

  check("one-time original effects and existing prose, independent of imported context", `
    for (const mid of [null, "future", "living"]) for (const promise of [null, "made", "declined", "broken", "kept"]) {
      resetRunState(); if (mid) state.flags.mid_arc = mid;
      state.flags.sela_attention = "ignored"; state.promises.sela = promise;
      state.cohesion = 40; state.affinity.sela = 20; state.trust.sela = 30;
      display("arc_living_2");
      const originalQuiet = livingCastOriginals.get(scenes.quiet_sela).text.value;
      expect(originalQuiet.includes(answer), "response is no longer exact existing Sela prose");
      const expected = JSON.parse(JSON.stringify(state));
      expected.scene = "arc_living_sela_answer"; expected.cohesion += 2;
      expected.affinity.sela += 8; expected.trust.sela += 8; expected.ideology.living += 2;
      click(question);
      expect(JSON.stringify(state) === JSON.stringify(expected), "Ask changed more than its original effects");
      expect(story().includes(answer), "missing Sela response");
      expect(resolveSceneImage(state.scene, scenes[state.scene]) === "images/sela_ritual.jpg", "wrong living plate");
      expect(JSON.stringify(scenes[state.scene].choices) === JSON.stringify([{ text: "Continue.", next: "arc_living_3" }]), "answer exit adds effects or detours");
      const before = JSON.stringify(state);
      display(state.scene, { skipOnEnter: true });
      expect(JSON.stringify(state) === before && story().includes(answer), "answer rendering mutates state");
      click("Continue."); expected.scene = "arc_living_3";
      expect(JSON.stringify(state) === JSON.stringify(expected), "return to conflict changed effects or promises");
    }
  `);

  check("other choices and absent Sela keep the original onward route", `
    for (const index of [0, 2]) {
      resetRunState(); state.supplies = 30; display("arc_living_2");
      expect(scenes.arc_living_2.choices[index].next === "arc_living_3", "unrelated option retargeted");
      makeChoice(scenes.arc_living_2.choices[index]);
      expect(state.scene === "arc_living_3" && !story().includes(answer), "unselected answer leaked");
    }
    resetRunState(); kill("sela", "Sela answer test");
    state.promises.sela = "made"; display("arc_living_2");
    expect(!gameplayChoiceButtons().some(b => b.innerHTML.includes(question)), "dead Sela can be asked");
    expect(!story().includes(answer), "dead Sela speaks");
    const before = JSON.stringify({ ...state, scene: "arc_living_3" });
    display("arc_living_sela_answer"); // Fresh invalid entry must skip without writes.
    expect(state.scene === "arc_living_3" && JSON.stringify(state) === before, "dead entry rewrote history");
    expect(livingCastContracts.arc_living_sela_answer.cast.join(",") === "sela", "response escaped living-cast admission");
  `);

  check("Import and repeated Continue restore source, answer and successor", `
    const confirm = window.confirm; window.confirm = () => true;
    try {
      for (const id of ["arc_living_2", "arc_living_sela_answer", "arc_living_3"])
      for (const dead of [false, true]) for (const legacy of [false, true])
      for (const mid of [null, "future", "living"]) {
        localStorage.clear(); resetRunState();
        if (mid) state.flags.mid_arc = mid;
        state.promises.sela = state.promises.tomas = "made";
        state.flags.lena_authority = true;
        if (dead) kill("sela", "Sela answer saved fixture");
        display(id, { skipOnEnter: id === "arc_living_sela_answer" && dead });
        const expected = JSON.parse(JSON.stringify(state));
        const snapshot = snapshotState(); if (legacy) delete snapshot.sceneEntered;
        if (legacy && dead && id === "arc_living_sela_answer") expected.scene = "arc_living_3";
        expect(importSaveText(JSON.stringify(snapshot)), "valid import rejected");
        let adopted;
        for (let repeat = 0; repeat < 2; repeat++) {
          resetRunState(); state.supplies = 1; document.getElementById("choices").children = [];
          expect(resumeGame(), "Continue rejected");
          expect(JSON.stringify(state) === JSON.stringify(expected), "Continue changed scene/cast/state");
          if (repeat) expect(readRawSave() === adopted, "repeated Continue rewrote the saved slot");
          adopted = readRawSave();
          if (!legacy) expect(adopted === JSON.stringify(snapshot), "marked Continue changed imported bytes");
          if (id === "arc_living_sela_answer" && state.scene === id) {
            expect(dead ? story().includes(ABSENT_CAST_TEXT) && !story().includes(answer) : story().includes(answer), "saved response has wrong speaker");
            const choices = gameplayChoiceButtons();
            expect(choices.length === 1 && !choices[0].disabled, "saved response has no free exit");
            expect(resolveSceneImage(id, scenes[id]) === (dead ? "images/corridor_variant.jpg" : "images/sela_ritual.jpg"), "saved response image claims wrong cast");
          }
        }
      }
    } finally { window.confirm = confirm; }
  `);
  return errors;
}
