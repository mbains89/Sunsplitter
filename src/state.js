// Sunsplitter — state.js
// Version 0.36 — Player Experience and Narrative Closure
// Game state, crew definitions, sceneImages map, core helpers
const VERSION = "0.36";

// FLAGS: see validate + scene onEnter/flag writes. state.dying is sole source for slow-death clock (map form from 0.25).
// Edit this file to change starting stats, characters, or image mappings
//
// 0.22+ locked flag keys (written by later tickets; do not invent meters/quest logs):
//   recovered.tomas / recovered.jiro / recovered.vess  (mirrored in state.recovered{})
//   sela_vault_vow  ("accepted" | "refused" — written by pursuit_sela crisis-request)
//   busDowngraded
//   crisisPath  (top-level: "breath" | "custody" | null)
// Prefer state.recovered.vess over a separate vessAboard alias.
// 0.24.1 crisis-request cost flags: pursuit_*_cost, lena_regen, mira_memory_public, amara_vent_delayed
// 0.25: state.dying is a map { [name]: causeString }; legacy scalar "lena" normalized on load.

function freshState() {
  return {
    survivors: 9,
    integrity: 62,
    cohesion: 48,
    supplies: 61,
    embryos: 100,
    flags: {},
    dead: [],
    deathCause: {},
    scene: "wake",
    affinity: { lena: 0, elias: 0, mira: 0, tomas: 0, amara: 0, jiro: 0, sela: 0, vess: 0 },
    trust: { lena: 40, elias: 35, mira: 45, tomas: 50, amara: 40, jiro: 40, sela: 30, vess: 35 },
    romance: {},
    pursuit: {},
    favors: {},
    past_known_by: {},
    dying: {},
    past_known: false,
    marks: {},
    memories: [],
    ideology: { future: 0, living: 0 },
    recovered: { tomas: false, jiro: false, vess: false },
    promises: {},
    crisisPath: null
  };
}
