import { createHash } from "node:crypto";

// SUN-V035-PLAYTEST-JIRO-VOICE-01. Only the ambiguous voice clause may differ
// from d1e0cde. All destination labels, descriptors, setup and state are pinned.
const BASELINE_FINGERPRINT = "eab2309a3dd52a2e1c793417c3574e20da712433cd481e68b4bc8ecd6812ee6c";
const planets = ["unset", "deferred", "committed"];
export const jiroVoiceFixtures = planets.flatMap(planet =>
  ["alive", "dead", "missing"].flatMap(life =>
    ["low", "threshold", "debt"].flatMap(support =>
      ["able", "low", "dead"].map(mira => ({ planet, life, support, mira })))));

function exerciseJiroVoice(fixtures, mode) {
  const errors = [], rows = [];
  const phrase = " even without Jiro's full voice";
  const expect = (ok, message) => { if (!ok) throw new Error(message); };
  const snapshot = () => JSON.stringify(state);
  const html = () => document.getElementById("story").innerHTML;
  const display = id => { document.getElementById("choices").children = []; showScene(id); };
  const click = label => {
    const button = gameplayChoiceButtons().find(b => b.innerHTML.includes(label));
    expect(button && !button.disabled, "unavailable " + label + " at " + state.scene);
    document.getElementById("choices").children = []; button.onclick();
  };
  const checkVoice = () => {
    const choices = scenes.final_choice.choices;
    expect(!choices.some(c => c.text.includes(phrase)), "ambiguous Jiro voice clause remains");
    const hold = choices.find(c => c.flag.final === "hold");
    if (hold.alive === "mira") {
      const prefix = state.flags.planet === "committed" ? "Hold course" : "Set course for the rogue planet";
      expect(hold.text === prefix + " — Mira can keep the drive honest.", "Mira capability or destination label changed");
    }
    expect(gameplayChoiceButtons().some(b => !b.disabled), "no affordable exit");
  };
  for (const f of fixtures) {
    try {
      localStorage.clear(); resetRunState();
      if (mode === "matrix") {
        if (f.planet !== "unset") state.flags.planet = f.planet;
        state.recovered.jiro = f.life !== "missing";
        if (f.life === "dead") kill("jiro", "voice fixture");
        if (f.mira === "dead") kill("mira", "voice fixture");
        state.trust.jiro = f.support === "low" ? 34 : 35;
        state.trust.mira = f.mira === "low" ? 39 : 40;
        if (f.support === "debt") {
          for (const who of Object.keys(state.affinity)) state.affinity[who] = 65;
          state.affinity.lena = 80; state.romance.lena = true; state.affinity.jiro = 0;
        }
        state.scene = "final_choice"; const before = snapshot(); display("final_choice");
        rows.push([f, before, html(), scenes.final_choice.choices.map(c =>
          ({ ...c, text: c.text.replace(phrase, "") })), gameplayChoiceButtons().map(b => b.disabled),
          resolveSceneImage("final_choice", scenes.final_choice)]);
        expect(snapshot() === before, "render wrote state");
        checkVoice();
      } else {
        // Actual relevant buttons, controlled intervening milestone contexts.
        display("vault_reveal"); click("Living priority");
        if (f.planet === "unset") click("Ration immediately.");
        else {
          click("We need a destination.");
          click(f.planet === "committed" ? "Set course. We go there" : "Not yet. Stabilize");
        }
        display("vault_sacrifice"); click("Divert everything to life support");
        expect(state.trust.jiro === 24 && state.trust.mira === 45, "authored trust changes drifted");
        display("act3_reckoning_cut"); click("Briefing. One hour.");
        expect(isAlive("jiro") && html().includes("Arrival window: opens day one hundred eighty-one"),
          "recovered Jiro did not actually brief");
        display("ship_memory_payoff"); click("Face the final orders.");
        expect(state.recovered.jiro && isAlive("jiro") && !relationshipDebtors().includes("jiro"),
          "reproduction invented absence or debt");
        expect(scenes.final_choice.choices.find(c => c.flag.final === "hold").alive === "mira",
          "actual low-trust route did not select Mira fallback");
        checkVoice();
        for (const legacy of [false, true]) {
          const before = snapshot(), text = html(), save = snapshotState();
          if (legacy) delete save.sceneEntered;
          const raw = JSON.stringify(save), confirm = window.confirm;
          resetRunState(); state.supplies = 1; display("wake");
          expect(saveGame() && JSON.parse(readRawSave()).scene === "wake", "unrelated slot not saved");
          window.confirm = () => true;
          try { expect(importSaveText(raw), "valid Jiro route import rejected"); }
          finally { window.confirm = confirm; }
          let adopted;
          for (let i = 0; i < 2; i++) {
            resetRunState(); state.supplies = 1; document.getElementById("choices").children = [];
            expect(resumeGame() && snapshot() === before && html() === text, "Continue changed real route facts");
            if (!legacy) expect(readRawSave() === raw, "current route bytes changed");
            if (i) expect(readRawSave() === adopted, "repeat Continue rewrote adopted slot");
            adopted = readRawSave(); checkVoice();
          }
        }
      }
    } catch (error) { errors.push(JSON.stringify(f) + ": " + error.message); }
  }
  return { count: fixtures.length, errors, rows };
}

export function jiroVoiceMatrix(runtime) {
  const result = runtime.evaluate("(" + exerciseJiroVoice.toString() + ")(" +
    JSON.stringify(jiroVoiceFixtures) + ',"matrix")', 30_000);
  return { ...result, fingerprint: createHash("sha256").update(JSON.stringify(result.rows)).digest("hex") };
}

export function jiroVoiceChecks(runtime) {
  const matrix = jiroVoiceMatrix(runtime), errors = [...matrix.errors];
  if (matrix.fingerprint !== BASELINE_FINGERPRINT)
    errors.push("Jiro wording repair changed more than the allowed clause");
  const routes = runtime.evaluate("(" + exerciseJiroVoice.toString() + ")(" +
    JSON.stringify(planets.map(planet => ({ planet }))) + ',"routes")', 30_000);
  errors.push(...routes.errors.map(e => "actual route: " + e));
  return errors;
}
