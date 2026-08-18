// Sunsplitter — scenes-18.js
// 0.28.2 size hygiene. Pure mechanical. crises: vess transmission + intimate
// Strict scene shape only: text | choices | onEnter | image
registerScenes({

  vess_transmission: {
    image: "images/vess_signal.jpg",
    onEnter: () => {
      if (!isAlive("vess")) return "act3_spine_next";
      state.romance.vess = true;
    },
    text: () => {
      let t = `She does not celebrate the yes. She opens a second request the same way she opened the first — as procedure.

"There is one long-range window left on this bus before the degradation takes the high-gain permanently. I want it. One directed burst toward the Dawnbreak debris field, or the residual Earth noise if the geometry still favors it. After that the external contact lane is closed. The logs I kept for six years can live in your memory instead of only mine."

The currency is forward-looking and external. It is not Mira's archival lane. It is the last time this ship speaks outward.`;
      if (isAlive("mira")) {
        t += `\n\nMira, if she is listening on the secondary, does not interrupt. The board already shows the window count.`;
      }
      return t;
    },
    choices: [
      { text: "Give her the window. Last outward voice.", next: "vess_intimate", effects: { cohesion: 1 }, flag: { last_tx_spent: true }, affinity: { vess: 4 } },
      { text: "Keep the window for the ship. Her logs can wait.", next: "act3_spine_next", affinity: { vess: 2 }, trust: { vess: -2 } }
    ]
  },

  vess_intimate: {
    image: "images/vess_intimate.jpg",
    onEnter: () => {
      if (!isAlive("vess") || !state.romance.vess) return "act3_spine_next";
      state.flags.vess_intimate = true;
      remember("Shared the last long-range window and a private hour with Vess.");
    },
    text: () => {
      let t = `She does not wait for a second invitation. The door override is hers — she has been reading the ship's access tree since the beacon first resolved your hull. The underlayer comes off on her schedule. She is inexperienced with people and exact with survival; the difference is visible in the way she does not ask whether the light stays on.

Power stays with her. The pace is hers. When the flat voice finally cracks again it is not procedure. It is the first sound she has made in six years that was not logged for a dead crew.

Afterward she sits with her back against the bulkhead and looks at the observation blister the way someone looks at a map they already memorized.

"I will not ask again. The attempt either holds or it does not. I have the window. You have the record. That is the exchange."`;
      return t;
    },
    choices: [
      { text: "Let the hour end on her terms.", next: "act3_spine_next", affinity: { vess: 5 }, trust: { vess: 3 } }
    ]
  }
});
