// SUN-FIX-HOLD-ART-EVENT-HONESTY-01
// Wrap resolveSceneImage so four Hex HOLD P0 events use existing OWNER_FINAL plates.
// No new JPEG. crisis / priority_repairs out of scope.
(function holdArtEventHonesty() {
  const prev = typeof resolveSceneImage === "function" ? resolveSceneImage : null;
  function resolveHoldArtEventHonesty(id, scene) {
    if (id === "boarding_stories") return "images/empty_berths.jpg";
    if (id === "coolant_trade") {
      if (typeof isAlive === "function" && isAlive("lena")) return "images/medical_bay.jpg";
      if (typeof isAlive === "function" && isAlive("mira")) return "images/power_stress_1.jpg";
      return "images/corridor_pressure_2.jpg";
    }
    if (id === "seal_or_food") {
      if (typeof isAlive === "function" && isAlive("elias")) return "images/work_elias.jpg";
      if (typeof isAlive === "function" && isAlive("amara")) return "images/hydroponics_amara.jpg";
      return "images/corridor_pressure_3.jpg";
    }
    if (id === "time_pass") return "images/onboarding_background.jpg";
    if (prev) return prev(id, scene);
    if (scene && scene.image) return scene.image;
    return null;
  }
  resolveSceneImage = resolveHoldArtEventHonesty;
})();
