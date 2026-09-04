import assert from "node:assert/strict";
import { playtestCrewCharacterScreenChecks } from "./playtest-crew-character-screen-checks.mjs";

export function maleCrewChecks(runtime) {
  const errors = [];
  const check = (label, source) => {
    try { assert.equal(runtime.evaluate(source), true); }
    catch (error) { errors.push(`male-crew ${label}: ${error.message}`); }
  };
  check("fresh-run Elias and recovered Jiro follow-through are reachable once", `(() => {
    const legal = c => (!c.alive || isAlive(c.alive)) &&
      (!c.aliveAll || c.aliveAll.every(isAlive)) && (!c.aliveAny || c.aliveAny.some(isAlive)) &&
      (!c.requires || meetsRequirements(c.requires)) && canAffordEffects(c.effects);
    for (const [who, beat] of [["elias", "bond_elias_mending"], ["jiro", "bond_jiro_distance"]]) {
      localStorage.clear(); startGame(); finishCinematic();
      const path = [], visits = new Map();
      for (let step = 0; step < 240 && state.scene !== beat; step++) {
        const id = state.scene, scene = scenes[id];
        const choices = (typeof scene.choices === "function" ? scene.choices() : scene.choices).filter(legal);
        const preferred = choices.find(c => c.next === "bond_" + who);
        const choice = preferred || choices.map((c, i) => ({ c, i, n: visits.get(id + "|" + c.text) || 0 }))
          .sort((a, b) => a.n - b.n || a.i - b.i)[0]?.c;
        if (!choice || id === "ending_check") return false;
        visits.set(id + "|" + choice.text, (visits.get(id + "|" + choice.text) || 0) + 1);
        path.push(id); makeChoice(choice);
      }
      if (state.scene !== beat || !isAlive(who) || !hasMark(who, "bonded")) return false;
      if (who === "jiro" && !state.recovered.jiro) return false;
      if (path.filter(id => id === "bond_" + who).length !== 1) return false;
      const expected = state.flags.vault_sacrifice ? "act3_spine_next" : "lead_prompt";
      makeChoice(scenes[beat].choices[0]);
      if (state.scene !== expected) return false;
      if (expected === "act3_spine_next" && scenes[expected].choices.some(c => c.next === "bond_" + who)) return false;
    }
    return true;
  })()`);
  check("both accepting choices add only the beat; decline and early/late exits retained", `(() => {
    for (const who of ["elias", "jiro"]) for (const late of [false, true]) for (const index of [0, 1, 2]) {
      resetRunState(); state.recovered.jiro = state.recovered.vess = true;
      state.flags.vault_sacrifice = late;
      const choice = scenes["bond_" + who].choices[index];
      makeChoice(choice);
      const expected = late ? "act3_spine_next" : "lead_prompt";
      if (index === 2) { if (state.scene !== expected || !hasMark(who, "bond_skipped")) return false; continue; }
      const beat = who === "elias" ? "bond_elias_mending" : "bond_jiro_distance";
      if (state.scene !== beat || !hasMark(who, "bonded")) return false;
      const before = JSON.stringify({ ...state, scene: expected });
      makeChoice(scenes[beat].choices[0]);
      if (state.scene !== expected || JSON.stringify(state) !== before) return false;
    }
    return true;
  })()`);
  check("live/dead/unrecovered renders are pure and retain a free neutral exit", `(() => {
    for (const who of ["elias", "jiro"]) for (const status of ["live", "dead", "unrecovered"]) {
      resetRunState(); state.recovered.jiro = status !== "unrecovered";
      if (status === "dead") state.dead.push(who);
      const id = who === "elias" ? "bond_elias_mending" : "bond_jiro_distance";
      const scene = scenes[id], before = JSON.stringify(state);
      const text = scene.text(), choices = scene.choices, image = resolveSceneImage(id, scene);
      if (JSON.stringify(state) !== before || choices.length !== 1 || !canAffordEffects(choices[0].effects)) return false;
      if (Object.keys(choices[0]).some(k => !["text", "next"].includes(k))) return false;
      if (isAlive(who)) { if (image !== "images/" + who + ".jpg") return false; }
      else if (/\\b(Elias|Jiro|he|his|him)\\b/i.test(text) || image !== "images/onboarding_background.jpg") return false;
    }
    for (const cause of ["resources diverted to the vault", "vented with the lower ring", "finished the repair", "ordered to stop treatment"]) {
      resetRunState(); state.dead.push("mira"); state.deathCause.mira = cause;
      const before = JSON.stringify(state);
      if (!attributableDeath("mira") || !scenes.bond_elias_mending.text().includes("Not tonight, Commander.")) return false;
      if (JSON.stringify(state) !== before) return false;
    }
    return true;
  })()`);
  check("current and marker-less saves retain each beat without repeat rewards", `(() => {
    for (const who of ["elias", "jiro"]) for (const legacy of [false, true]) for (const status of ["live", "dead", "unrecovered"]) {
      resetRunState(); state.recovered.jiro = status !== "unrecovered"; state.recovered.vess = true;
      state.flags.vault_sacrifice = true; mark(who, "bonded");
      const id = who === "elias" ? "bond_elias_mending" : "bond_jiro_distance";
      if (status === "dead") state.dead.push(who);
      showScene(id); const beforeText = document.getElementById("story").textContent;
      const saved = snapshotState(); if (legacy) delete saved.sceneEntered;
      localStorage.setItem(SAVE_KEY, JSON.stringify(saved));
      const before = JSON.stringify(state);
      if (!resumeGame() || state.scene !== id || JSON.stringify(state) !== before) return false;
      if (document.getElementById("story").textContent !== beforeText) return false;
      const after = JSON.stringify({ ...state, scene: "act3_spine_next" });
      makeChoice(scenes[id].choices[0]);
      if (JSON.stringify(state) !== after) return false;
    }
    return true;
  })()`);
  errors.push(...playtestCrewCharacterScreenChecks(runtime));
  return errors;
}
