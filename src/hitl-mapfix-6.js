/* SUN-HITL-MAPFIX-6-01
 * Muse MEASURE_LIVE_VS_HITL_88 mismatches×6. Chief NAMED PASS.
 * Applies after state + scenes + engine. No JPEG bytes. No Slot15 invent.
 */
(function hitlMapfix6() {
  const MAP = {
    competence_watch: "images/observation_bridge_alt.jpg",
    romance_lena_1: "images/shower_lena.jpg",
    act2_tether_hand_elias: "images/self_risk.jpg",
    vess_signal: "images/transmission.jpg",
    vess_cost: "images/transmission.jpg",
    act3_lethal_elias_order: "images/bond_elias.jpg"
  };
  if (typeof sceneImages !== "undefined" && sceneImages) {
    Object.assign(sceneImages, MAP);
  }
  if (typeof scenes !== "undefined" && scenes) {
    Object.keys(MAP).forEach(function (id) {
      if (scenes[id]) scenes[id].image = MAP[id];
    });
  }
  if (typeof resolveSceneImage === "function") {
    const prev = resolveSceneImage;
    resolveSceneImage = function (id, scene) {
      if (id === "act3_lethal_elias_order") {
        return (typeof isAlive === "function" && isAlive("elias"))
          ? MAP.act3_lethal_elias_order
          : "images/corridor_pressure_3.jpg";
      }
      if (id === "act2_tether_hand_elias") {
        return (typeof isAlive === "function" && isAlive("elias"))
          ? MAP.act2_tether_hand_elias
          : "images/corridor_pressure_3.jpg";
      }
      return prev(id, scene);
    };
  }
})();
