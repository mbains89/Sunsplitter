// SUN-FIX-VENT-BUNKS-01. Aftermath vent bunk line follows vented death causes.
// Jiro unrecovered → Two empty bunks. Jiro recovered → Three.
// Living line uses visibleLivingCrewCount (HUD), not state.survivors.

export function ventBunksChecks(runtime) {
  return runtime.evaluate(`(() => {
    const errors = [];
    const renderAftermath = () => {
      const scene = scenes.aftermath;
      return typeof scene.text === "function" ? scene.text() : scene.text;
    };

    resetRunState();
    state.flags.crisis = "vent";
    state.dead = ["rourke", "amara", "sela"];
    state.deathCause = {
      rourke: "died with company",
      amara: "vented with the lower ring",
      sela: "vented at twenty"
    };
    state.recovered.jiro = false;
    const two = renderAftermath();
    if (!two.includes("Two empty bunks")) {
      errors.push("unrecovered Jiro aftermath missing Two empty bunks");
    }
    if (two.includes("Three empty bunks")) {
      errors.push("unrecovered Jiro aftermath still says Three empty bunks");
    }
    const livingTwo = visibleLivingCrewCount();
    if (two.includes(state.survivors + " still living") && state.survivors !== livingTwo) {
      errors.push("aftermath living line still uses state.survivors against HUD");
    }
    if (!two.includes(livingTwo + " still living")) {
      errors.push("aftermath living line does not match HUD visible living count " + livingTwo);
    }

    resetRunState();
    state.flags.crisis = "vent";
    state.recovered.jiro = true;
    state.dead = ["rourke", "amara", "sela", "jiro"];
    state.deathCause = {
      rourke: "died with company",
      amara: "vented with the lower ring",
      sela: "vented at twenty",
      jiro: "vented with the lower ring"
    };
    const three = renderAftermath();
    if (!three.includes("Three empty bunks")) {
      errors.push("recovered Jiro aftermath missing Three empty bunks");
    }
    if (three.includes("Two empty bunks")) {
      errors.push("recovered Jiro aftermath still says Two empty bunks");
    }
    return errors;
  })()`);
}
