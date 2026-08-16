// Sunsplitter — state.js
// Version 0.28 — restored baseline (full 0.28 helpers pending full push)
const VERSION = "0.28";

function freshState() {
  return {
    survivors: 9,
    integrity: 62,
    cohesion: 48,
    supplies: 41,
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

const state = freshState();

// EMERGENCY: full state.js from sun-v0.28-net.zip must replace this.
// This minimal stub only prevents total break. Playtest from zip, not GitHub main.
console.error("[Sunsplitter] state.js is an emergency stub — deploy sun-v0.28-net.zip for full 0.28");

function registerScenes(map) {
  if (!map || typeof map !== "object") return;
  if (typeof scenes === "undefined" || !scenes) scenes = {};
  for (const id of Object.keys(map)) {
    if (Object.prototype.hasOwnProperty.call(scenes, id)) {
      throw new Error('[Sunsplitter] duplicate scene id: "' + id + '"');
    }
    scenes[id] = map[id];
  }
}
