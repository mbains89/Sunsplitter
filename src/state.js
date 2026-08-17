// Sunsplitter — state.js
// Version 0.28.1b — Unreachable scenes + unpaid cost gate
// Game state, crew definitions, sceneImages map, core helpers
const VERSION = "0.28.1b";

// FLAGS: see validate + scene onEnter/flag writes. state.dying is sole source for slow-death clock (map form from 0.25).
// Edit this file to change starting stats, characters, or image mappings
//
// 0.22+ locked flag keys (written by later tickets; do not invent meters/quest logs):
//   recovered.tomas / recovered.jiro / recovered.vess  (mirrored in state.recovered{})
