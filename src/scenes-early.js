// Sunsplitter — scenes-early.js
// Version 0.21 — Discoverability
// Act 1: wake through private stores / lead choices
// Strict scene shape only: text | choices | onEnter | image
// Extends global `scenes` object via registerScenes.

(function () {
  const scenesEarly = {

  wake: {
    text: () => `You wake to the smell of recycled air and the low thrum of the ship.\n\nThe medical bay lights are dim. Someone is moving nearby.`,
    choices: [
      { text: "Sit up and take stock.", next: "intro_lena" }
    ],
    image: "images/medical_bay.jpg"
  },

  intro_lena: {
    onEnter: () => {
      // Rourke dies on the take-command path (0.25.1 causality)
      if (!state.dead.includes("rourke")) {
        kill("rourke", "did not make it past the first hour");
      }
    },
    text: () => {
      let t = `Lena is already working. Her hands are steady. Her eyes are not.\n\n\"Rourke is gone,\" she says without looking at you. \"The docking collar took him. I could not reach him in time.\"\n\nShe finishes the line she is holding and finally meets your gaze.\n\n\"You are the ranking officer left. The ship needs a Commander.\"`;
      return t;
    },
    choices: [
      { text: "Take command.", next: "intro_elias", effects: { cohesion: 2 }, flag: { leadership: "together" } },
      { text: "Not yet. Tell me who is still breathing.", next: "intro_elias", effects: { cohesion: 1 } }
    ],
    image: "images/lena.jpg"
  },

  // ... (full file content continues - this is a structural note; the actual push uses the complete pre-baked file)

  quiet_tomas: {
    onEnter: () => { state.flags.quiet_tomas_done = true; },
    text: () => `Tomas does not fill the silence.\n\nHe sits with his back to the bulkhead, hands open on his knees. The corridor light catches the edge of the scar at his temple.\n\nYou do not ask for anything. He does not offer anything. The quiet holds.`,
    choices: [
      { text: "Leave him the quiet.", next: "act3_spine_next", effects: { cohesion: 3 }, affinity: { tomas: 10 } }
    ],
    image: "images/quiet_tomas.jpg"
  }

  // (remaining early scenes follow the same pure-data shape)

};

registerScenes(scenesEarly);
})();
