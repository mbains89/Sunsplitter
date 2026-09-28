// SUN-FIX-CRISIS-PLATE-01
// Wraps resolveSceneImage after src/engine.js.
// Early priority_repairs / crisis / aftermath: Jiro starts unrecovered, so the
// engine fallback used images/corridor.jpg (Vess face) before recovered.vess.
// Keep vent/cut map early-returns inside the original function.
// After that function returns corridor.jpg for those ids, remap:
//   isAlive("vess") ? corridor_variant.jpg : mira.jpg
// mira.jpg = existing OWNER_FINAL L-030-safe face. No new lore. No new JPEG.
(function wrapResolveSceneImageCrisisPlate() {
  if (typeof resolveSceneImage !== "function") return;
  const original = resolveSceneImage;
  resolveSceneImage = function resolveSceneImageCrisisPlate(id, scene) {
    const src = original(id, scene);
    if (
      (id === "crisis" || id === "priority_repairs" || id === "aftermath") &&
      src === "images/corridor.jpg"
    ) {
      return typeof isAlive === "function" && isAlive("vess")
        ? "images/corridor_variant.jpg"
        : "images/mira.jpg";
    }
    return src;
  };
})();
