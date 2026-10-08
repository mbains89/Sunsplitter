/* SUN-CREWPLATE-PRESENCE-01
   resolveSceneImage returns images/corridor.jpg (silver-hair Vess lookalike)
   for crisis / priority_repairs / aftermath when Amara, Jiro or Sela is absent,
   arc_living_3 when Tomas, Mira or Amara is absent, and crew_walk / status
   when survivors <= 5. corridor_variant.jpg has three people and is rejected.
   Substitute the in-tree empty plate the engine already uses as a dead fallback:
   images/corridor_pressure_3.jpg. No new image bytes. engine.js not edited.
*/
(function wrapResolveSceneImagePresence() {
  if (typeof resolveSceneImage !== "function" || resolveSceneImage.__ssPresenceWrapped) return;
  var previous = resolveSceneImage;
  var ids = {
    crisis: true,
    priority_repairs: true,
    aftermath: true,
    arc_living_3: true,
    crew_walk: true,
    status: true
  };
  var empty = "images/corridor_pressure_3.jpg";
  function wrapped(id, scene) {
    var src = previous(id, scene);
    if (src === "images/corridor.jpg" && ids[id]) return empty;
    return src;
  }
  wrapped.__ssPresenceWrapped = true;
  resolveSceneImage = wrapped;
})();
