import assert from "node:assert/strict";

// Pixel-reviewed aliases, not filename-derived expectations. See ART_REQUESTS.
export const FIXED_EVENT_ART = {
  silence: "images/covered_body.jpg",
  offshift_lena: "images/medbay_dim.jpg",
  breath_blacksleep: "images/medbay_dim.jpg",
  ship_memory_payoff: "images/corridor_pressure_4.jpg",
  patch_fails: "images/power_stress_2.jpg",
  custody_possession: "images/corridor_pressure_1.jpg",
  prom_deck4: "images/corridor_pressure_3.jpg",
  vault_voice: "images/vault.jpg"
};
const PORTRAIT_EVENTS = {
  private_stores: "elias",
  prom_deck4_keep: "elias", prom_deck4_break: "elias", pregnancy_check: "lena",
  filters_stencil: "sela", filters_stencil_luck: "sela", filters_stencil_silent: "sela", offshift_sela: "sela"
};

export function artEventChecks(runtime) {
  const errors = [];
  const check = (label, source) => {
    try { assert.equal(runtime.evaluate(source), true); }
    catch (error) { errors.push(`event art ${label}: ${error.message}`); }
  };
  check("fixed location and committed-outcome aliases stay pure", `(() => {
    const expected = ${JSON.stringify(FIXED_EVENT_ART)};
    for (const roster of ["fresh", "recovered", "depleted"]) for (const memory of [null, "proper_seal", "jury_rig", "open_wound"]) {
      resetRunState(); state.flags.ship_memory = memory;
      state.recovered.tomas = state.recovered.jiro = state.recovered.vess = roster !== "fresh";
      if (roster === "depleted") state.dead.push("lena", "elias", "mira", "tomas", "amara", "jiro", "sela", "vess");
      const before = JSON.stringify(state);
      for (const [id, image] of Object.entries(expected)) {
        if (resolveSceneImage(id, scenes[id]) !== image) return false;
      }
      if (JSON.stringify(state) !== before) return false;
    }
    return true;
  })()`);
  check("speaker portraits never survive a dead speaker", `(() => {
    for (const [id, who] of Object.entries(${JSON.stringify(PORTRAIT_EVENTS)})) for (const live of [true, false]) {
      resetRunState(); if (!live) state.dead.push(who);
      const before = JSON.stringify(state);
      const expected = live ? "images/" + who + ".jpg" : "images/corridor_pressure_3.jpg";
      if (resolveSceneImage(id, scenes[id]) !== expected || JSON.stringify(state) !== before) return false;
    }
    return true;
  })()`);
  check("EVA riders retain helmeted exterior context; dead Sela never paints", `(() => {
    for (const who of ["elias", "mira", "sela"]) for (const live of [true, false]) for (const rushed of [true, false]) {
      resetRunState(); state.flags.tether_rushed = rushed; if (!live) state.dead.push(who);
      const id = "act2_tether_hand_" + who, before = JSON.stringify(state);
      const expected = live ? "images/tether_ride.jpg" : "images/corridor_pressure_3.jpg";
      if (resolveSceneImage(id, scenes[id]) !== expected || JSON.stringify(state) !== before) return false;
    }
    resetRunState();
    if (resolveSceneImage("arc_living_2", scenes.arc_living_2) !== "images/sela_ritual.jpg") return false;
    state.dead.push("sela");
    return resolveSceneImage("arc_living_2", scenes.arc_living_2) === "images/corridor_pressure_3.jpg" &&
      scenes.arc_living_2.text.includes("Their author does not.");
  })()`);
  check("real vent and silent-opening outcomes use post-event images", `(() => {
    resetRunState(); showScene("silence");
    if (isAlive("rourke") || resolveSceneImage("silence", scenes.silence) !== "images/covered_body.jpg") return false;
    resetRunState(); state.flags.crisis = "vent"; showScene("vent");
    if (isAlive("sela") || isAlive("amara")) return false;
    for (const id of ["vent", "aftermath", "crisis", "priority_repairs"]) {
      if (resolveSceneImage(id, scenes[id]) !== "images/aftermath.jpg") return false;
    }
    state.flags.crisis = "cut";
    return resolveSceneImage("aftermath", scenes.aftermath) === sceneImages.cut_out;
  })()`);
  check("current saved renders keep exact state and new image without entry replay", `(() => {
    const ids = [...Object.keys(${JSON.stringify(FIXED_EVENT_ART)}), ...Object.keys(${JSON.stringify(PORTRAIT_EVENTS)}),
      "act2_tether_hand_elias", "act2_tether_hand_mira", "act2_tether_hand_sela", "arc_living_2", "vent", "aftermath", "crisis", "priority_repairs"];
    for (const id of ids) for (const dead of [false, true]) {
      resetRunState(); state.recovered.tomas = state.recovered.jiro = state.recovered.vess = true;
      state.flags.crisis = "vent";
      if (dead) state.dead.push("lena", "elias", "mira", "tomas", "amara", "jiro", "sela", "vess");
      state.scene = id;
      const before = JSON.stringify(state);
      const saved = snapshotState(); saved.sceneEntered = true;
      localStorage.setItem(SAVE_KEY, JSON.stringify(saved));
      if (!resumeGame() || state.scene !== id || JSON.stringify(state) !== before) return false;
      const first = document.getElementById("scene-image").src;
      if (first !== resolveSceneImage(id, scenes[id])) return false;
      if (!resumeGame() || JSON.stringify(state) !== before || document.getElementById("scene-image").src !== first) return false;
    }
    return true;
  })()`);
  return errors;
}
