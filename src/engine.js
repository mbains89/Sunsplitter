// Sunsplitter — engine.js
// Version 0.28.2 — R2c escapeHtml restore + L-024 Option B
// Core game loop: showScene, choices, stats, save/load, endings
// Keep story content out of this file.

const TONE_ACK_KEY = "sunsplitter_tone_ack_v1";
const SAVE_KEY = "sunsplitter_save_v3";
const SAVE_KEY_LEGACY = "sunsplitter_save_v2";

let loadedGameVersion = (typeof VERSION !== "undefined" ? VERSION : "0.25");

function hasAcknowledgedTone() {
  try {
    return localStorage.getItem(TONE_ACK_KEY) === "1";
  } catch (e) {
    return false;
  }
}

function acknowledgeTone() {
  try {
    localStorage.setItem(TONE_ACK_KEY, "1");
  } catch (e) { /* private mode */ }
  showTitleScreen();
}

function escapeHtml(s) {
  return String(s)
    .replace(/\x26/g, "\u0026amp;")
    .replace(/\x3c/g, "\u0026lt;")
    .replace(/\x3e/g, "\u0026gt;")
    .replace(/\x22/g, "\u0026quot;");
}

// L-024 Option B: ending resolution never invents a result for an untested promise.
function forceResolvePromises() {
  if (!state.promises) return;
}

function lastEndingMemory() {
  const memories = Array.isArray(state.memories) ? state.memories : [];
  const untestedHolders = Object.keys(state.promises || {}).filter(who => state.promises[who] === "made");
  for (let i = memories.length - 1; i >= 0; i--) {
    const memory = String(memories[i]);
    const lower = memory.toLowerCase();
    const isUntestedPromise = untestedHolders.some(who => {
      const holder = crewFirstName(who).toLowerCase();
      return lower.includes("promis") && lower.includes(holder);
    });
    if (!isUntestedPromise) return memory;
  }
  return null;
}
