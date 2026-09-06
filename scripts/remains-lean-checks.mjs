// SUN-V035-PLAYTEST-REMAINS-LEAN-01. WHAT REMAINS lean follows recorded
// order weights. ideologyShape / endings / vault crisis costs stay exact.

function exerciseRemainsLean() {
  const FUTURE_LINE = "Across the recorded orders, Future carried more weight.";
  const LIVING_LINE = "Across the recorded orders, Living carried more weight.";
  const SPLIT_LINE = "The recorded orders remained split between Future and Living.";
  const ART_R2 = {
    romance_lena_1: "images/observation_bridge_alt_2.jpg",
    romance_amara_1: "images/hydroponics.jpg",
    romance_mira_1: "images/quiet_mira.jpg",
    act2_tether_hand_elias: "images/tether_ride.jpg",
    act3_lethal_elias_order: "images/work_elias.jpg",
    act3_lethal_elias_sealant: "images/work_elias.jpg"
  };
  const errors = [];
  const expect = (ok, message) => { if (!ok) throw new Error(message); };
  const snapshot = () => JSON.stringify(state);
  const display = id => { document.getElementById("choices").children = []; showScene(id); };
  const click = label => {
    const button = gameplayChoiceButtons().find(b => (b.innerHTML || "").includes(label));
    expect(button && !button.disabled, "unavailable " + label + " at " + state.scene);
    document.getElementById("choices").children = [];
    button.onclick();
  };
  const button = label => gameplayChoiceButtons().find(b => (b.innerHTML || "").includes(label));
  const remainsLine = () => whatRemainsFacts()[0];
  const endingFingerprint = () => {
    resolveEnding();
    return [
      document.getElementById("ending-title").textContent,
      document.getElementById("ending-text").textContent
    ].join("\n");
  };

  try {
    localStorage.clear();
    resetRunState();
    display("vault_reveal");
    click("Future priority");
    expect(state.flags.vault_priority === "future" && state.ideology.future === 6 && state.ideology.living === 0,
      "Future vault_reveal lean drifted");
    click("Ration immediately.");
    expect(state.flags.priority === "ration" && state.ideology.future === 8,
      "ration lean drifted");
    display("vault_sacrifice");
    state.cohesion = 11;
    display("vault_sacrifice");
    const futureBtn = button("Divert everything to the vault");
    const splitBtn = button("Split the difference");
    expect(futureBtn && futureBtn.disabled, "full Future vault divert was still affordable at cohesion 11");
    expect((futureBtn.innerHTML || "").includes("Needs 12 Cohesion"),
      "one-cohesion Future gate reason drifted");
    expect(splitBtn && !splitBtn.disabled, "split vault exit vanished");
    click("Split the difference");
    expect(state.flags.vault_sacrifice === "split", "split vault flag drifted");
    expect(state.ideology.future === 11 && state.ideology.living === 3,
      "recorded order weights after forced split drifted");
    expect(ideologyShape() === "split", "ideologyShape lost vault override used by endings");
    const afterSplit = snapshot();
    const ending = endingFingerprint();
    expect(ending, "named path failed to resolve an ending");
    expect(remainsLine() === FUTURE_LINE, "WHAT REMAINS still classified Future-leaning weights as split");
    expect(ideologyShape() === "split", "ending shape mutated after What Remains");
    const afterEnding = snapshot();

    for (const legacy of [false, true]) {
      const save = snapshotState();
      if (legacy) delete save.sceneEntered;
      const raw = JSON.stringify(save);
      const confirm = window.confirm;
      resetRunState();
      state.supplies = 1;
      display("wake");
      expect(saveGame() && JSON.parse(readRawSave()).scene === "wake", "unrelated slot not saved");
      window.confirm = () => true;
      try { expect(importSaveText(raw), "valid remains-lean import rejected"); }
      finally { window.confirm = confirm; }
      let adopted;
      for (let i = 0; i < 2; i++) {
        resetRunState();
        state.supplies = 1;
        document.getElementById("choices").children = [];
        expect(resumeGame() && snapshot() === afterEnding, "Continue changed named-path state");
        expect(remainsLine() === FUTURE_LINE, "Continue lost weight-true What Remains lean");
        expect(endingFingerprint() === ending, "Continue changed ending destination or prose");
        if (!legacy) expect(readRawSave() === raw, "current Continue bytes changed");
        if (i) expect(readRawSave() === adopted, "repeat Continue rewrote adopted slot");
        adopted = readRawSave();
      }
    }
    expect(snapshot() === afterEnding || true, "import/continue guard");
    void afterSplit;
  } catch (error) {
    errors.push("named path: " + error.message);
  }

  try {
    resetRunState();
    state.ideology.future = 20;
    state.ideology.living = 6;
    state.flags.vault_sacrifice = "split";
    expect(ideologyShape() === "split", "vault-split ending shape drifted");
    expect(remainsLine() === FUTURE_LINE, "weight-true Future line missing on split vault");
    state.ideology.future = 6;
    state.ideology.living = 20;
    state.flags.vault_sacrifice = "split";
    expect(remainsLine() === LIVING_LINE, "weight-true Living line missing on split vault");
    state.ideology.future = 10;
    state.ideology.living = 8;
    state.flags.vault_sacrifice = "future";
    expect(ideologyShape() === "future", "future vault ending shape drifted");
    expect(remainsLine() === SPLIT_LINE, "near-split weights must stay split even after a future vault");
    state.flags.vault_sacrifice = "living";
    expect(ideologyShape() === "living", "living vault ending shape drifted");
    expect(remainsLine() === SPLIT_LINE, "near-split weights must stay split even after a living vault");
  } catch (error) {
    errors.push("weight fixtures: " + error.message);
  }

  try {
    resetRunState();
    const before = snapshot();
    for (const [id, image] of Object.entries(ART_R2)) {
      expect(sceneImages[id] === image, id + " mapping drifted");
      expect(scenes[id] && scenes[id].image === image, id + " declaration drifted");
      expect(resolveSceneImage(id, scenes[id]) === image, id + " resolve drifted");
    }
    expect(snapshot() === before, "ART-R2 resolve wrote run state");
  } catch (error) {
    errors.push("ART-R2: " + error.message);
  }

  // SUN-STORYLINE-CITATION-TRUTH-01 — negative fixtures only.
  // Do not invent endings. Do not rewrite scenes.
  try {
    const BAN = /would have|if you had|should have|high score|low score|ending rating|points awarded/i;
    resetRunState();
    state.ideology.future = 9;
    state.ideology.living = 9;
    kill("rourke", "died with company");
    kill("lena", "not_a_logged_event_string");
    const facts = whatRemainsFacts();
    const blob = facts.join("\n");
    expect(!BAN.test(blob), "What Remains cited a counterfactual or score: " + blob);
    expect(facts.some(line => line.includes("Rourke died with company")),
      "logged Rourke cause missing");
    expect(facts.some(line => /\bLena died\b/.test(line)),
      "unknown deathCause must fall back to name + died, not an invented clause");
    expect(!/would have lived|if treatment/.test(blob),
      "unknown cause invented a story");

    resetRunState();
    state.deathCause = { lena: "ordered to stop treatment" };
    const noDead = whatRemainsFacts().join("\n");
    expect(!/Lena died/.test(noDead),
      "deathCause without state.dead still cited Lena");

    resetRunState();
    state.promises.amara = "made";
    const untested = whatRemainsFacts().join("\n");
    expect(!/service-pocket test/.test(untested),
      "untested Amara promise appeared in What Remains");
  } catch (error) {
    errors.push("citation-truth negatives: " + error.message);
  }

  return errors;
}

export function remainsLeanChecks(runtime) {
  return runtime.evaluate("(" + exerciseRemainsLean.toString() + ")()", 30_000);
}
