import assert from "node:assert/strict";

// SUN-V035-PLAYTEST-SELA-ANSWER-01. The question already pays its advertised
// effects; this regression requires a visible answer before the conflict.
// SUN-DIET-REPLY-FOLD-01 (L-057): the answer is now the Ask choice's reply, the first paragraph of
// arc_living_3, instead of its own screen (arc_living_sela_answer, retired). The same guards hold
// on the reply: shown before the parts argument, once, never saved, never spoken by a dead Sela;
// a save parked on the retired screen resumes at arc_living_3.
// SUN-VOICE-PASS-B-01: the reply answers the question asked (what she would spend) instead of
// repeating quiet_sela's "It was warm" lines, so the guard now requires it NOT be quiet_sela prose.
export function selaAnswerChecks(runtime) {
  const errors = [];
  const question = "Ask what she would spend to keep a warm world possible.";
  const answer = '"I would spend all that is mine. It is a short list: the pigment, the hours, the word no. I will not spend what belongs to someone else."';
  const check = (label, source) => {
    try {
      assert.equal(runtime.evaluate(`(() => {
        const question = ${JSON.stringify(question)}, answer = ${JSON.stringify(answer)};
        const expect = (ok, message) => { if (!ok) throw new Error(message); };
        const display = (id, opts) => { document.getElementById("choices").children = []; showScene(id, opts); };
        const story = () => document.getElementById("story").innerHTML;
        const reply = '<p class="choice-reply">Sela answers.</p><p class="choice-reply">' + answer + '</p>';
        const opensWithAnswer = () => story().startsWith('<div class="scene-text">' + reply) &&
          story().indexOf(reply) < story().indexOf("parts allocation") && story().split(answer).length === 2;
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
    localStorage.clear(); startGame(); if (typeof advancePastCommanderCreate === "function") advancePastCommanderCreate(); finishCinematic();
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
    expect(state.scene === "arc_living_3", "question did not lead to the conflict");
    expect(opensWithAnswer(), "answer is not the first paragraph, once, above the parts argument");
    expect(JSON.parse(readRawSave()).scene === "arc_living_3", "conflict was not autosaved");
    expect(!readRawSave().includes("I would spend all that is mine."), "reply was written to the save");
    const before = JSON.stringify(state);
    display(state.scene, { skipOnEnter: true, resume: true });
    expect(!story().includes(answer) && story().includes("parts allocation"), "answer replayed on re-render");
    expect(JSON.stringify(state) === before, "re-render changed state");
  `);

  check("one-time original effects and existing prose, independent of imported context", `
    for (const mid of [null, "future", "living"]) for (const promise of [null, "made", "declined", "broken", "kept"]) {
      resetRunState(); if (mid) state.flags.mid_arc = mid;
      state.flags.sela_attention = "ignored"; state.promises.sela = promise;
      state.cohesion = 40; state.affinity.sela = 20; state.trust.sela = 30;
      display("arc_living_2");
      const originalQuiet = livingCastOriginals.get(scenes.quiet_sela).text.value;
      expect(!originalQuiet.includes(answer) && !answer.includes("It was warm."), "answer repeats quiet_sela's spent beat");
      const expected = JSON.parse(JSON.stringify(state));
      expected.scene = "arc_living_3"; expected.cohesion += 2;
      expected.affinity.sela += 8; expected.trust.sela += 8; expected.ideology.living += 2;
      const ask = scenes.arc_living_2.choices.find(c => c.text === question);
      expect(JSON.stringify(ask.reply) === JSON.stringify([{ who: "sela", text: "Sela answers." }, { who: "sela", text: answer }]), "answer is not the Sela tag line plus the exact Sela line");
      click(question);
      expect(JSON.stringify(state) === JSON.stringify(expected), "Ask changed more than its original effects");
      expect(opensWithAnswer(), "missing Sela response above the conflict");
      const before = JSON.stringify(state);
      display(state.scene, { skipOnEnter: true });
      expect(JSON.stringify(state) === before && !story().includes(answer), "answer rendering mutates state or replays");
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
    // A stale Ask (Sela killed after render) still pays only its effects; the reply's who drops her line.
    resetRunState(); display("arc_living_2");
    const ask = scenes.arc_living_2.choices.find(c => c.text === question);
    kill("sela", "Sela answer test"); makeChoice(ask);
    expect(state.scene === "arc_living_3" && !story().includes(answer), "dead Sela speaks in the reply");
    expect(!scenes.arc_living_sela_answer && retiredSceneExit("arc_living_sela_answer") === "arc_living_3", "retired answer screen is back or lost its exit");
  `);

  check("Import and repeated Continue restore source, answer and successor", `
    const confirm = window.confirm; window.confirm = () => true;
    try {
      // "arc_living_sela_answer" is a save parked on the retired screen: it resumes at arc_living_3.
      for (const id of ["arc_living_2", "arc_living_sela_answer", "arc_living_3"])
      for (const dead of [false, true]) for (const legacy of [false, true])
      for (const mid of [null, "future", "living"]) {
        localStorage.clear(); resetRunState();
        if (mid) state.flags.mid_arc = mid;
        state.promises.sela = state.promises.tomas = "made";
        state.flags.lena_authority = true;
        if (dead) kill("sela", "Sela answer saved fixture");
        const retired = id === "arc_living_sela_answer";
        display(retired ? "arc_living_3" : id);
        const expected = JSON.parse(JSON.stringify(state));
        const snapshot = snapshotState(); if (legacy) delete snapshot.sceneEntered;
        if (retired) snapshot.scene = id;
        expect(importSaveText(JSON.stringify(snapshot)), "valid import rejected");
        let adopted;
        for (let repeat = 0; repeat < 2; repeat++) {
          resetRunState(); state.supplies = 1; document.getElementById("choices").children = [];
          expect(resumeGame(), "Continue rejected");
          expect(JSON.stringify(state) === JSON.stringify(expected), "Continue changed scene/cast/state");
          if (repeat) expect(readRawSave() === adopted, "repeated Continue rewrote the saved slot");
          adopted = readRawSave();
          if (!legacy && !retired) expect(adopted === JSON.stringify(snapshot), "marked Continue changed imported bytes");
          if (retired) {
            expect(JSON.parse(adopted).scene === "arc_living_3", "parked retired screen did not adopt its exit");
            expect(story().includes("parts allocation") && !story().includes(answer), "parked retired screen did not resume on the conflict");
            const choices = gameplayChoiceButtons();
            expect(choices.length >= 1 && choices.some(b => !b.disabled), "resumed conflict has no free exit");
          }
        }
      }
    } finally { window.confirm = confirm; }
  `);
  return errors;
}
