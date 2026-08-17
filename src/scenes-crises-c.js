// Sunsplitter — scenes-crises-c.js
// Split from scenes-crises.js (0.28.1c size hygiene). Pure mechanical.
// Crises: act3_spine_next + Vess arrival/romance package.
// Pure data only. registerScenes merges this map.

const scenesCrisesC = {

  act3_spine_next: {
    image: "images/corridor.jpg",
    onEnter: () => {
      // 0.24: Vess arrival window opens once after vault face; guaranteed, no refuse-contact
      if (!state.recovered || !state.recovered.vess) return "vess_signal";
    },
    text: () => {
      let t = `The vault light stays on behind you. The ship has two men back who were written off, and a list of names that is no longer only numbers.`;
      if (state.recovered && state.recovered.vess) {
        t += `\n\nVess is already on the crew board. The long-range window is still open.`;
      }
      return t;
    },
    get choices() {
      const opts = [];
      // bonds post-recovery
      if (isAlive("elias") && !state.flags.bond_elias_done) opts.push({ text: "Find Elias. Share a quiet watch.", next: "bond_elias", tag: "bond" });
      if (isAlive("tomas") && state.recovered && state.recovered.tomas && !state.flags.bond_tomas_done) opts.push({ text: "Find Tomas. Work the trays a while.", next: "bond_tomas", tag: "bond" });
      if (isAlive("jiro") && state.recovered && state.recovered.jiro && !state.flags.bond_jiro_done) opts.push({ text: "Find Jiro. Sit the blister with him.", next: "bond_jiro", tag: "bond" });
      // quiet_tomas (0.28.1b)
      if (isAlive("tomas") && state.recovered && state.recovered.tomas && !state.flags.quiet_tomas_done) opts.push({ text: "Sit with Tomas in the quiet after the annex.", next: "quiet_tomas", tag: "private" });
      // amara+tomas (0.28.1b)
      if (isAlive("amara") && isAlive("tomas") && state.recovered && state.recovered.tomas && state.flags.hydro === "full" && !state.flags.romance_amara_tomas_done) {
        opts.push({ text: "Leave Amara and Tomas the grow-deck for an hour.", next: "romance_amara_tomas", tag: "private" });
      }
      opts.push({ text: "Keep the watch moving.", next: "tomas_break" });
      return opts;
    }
  },

  vess_signal: {
    image: "images/debris_field.jpg",
    onEnter: () => {},
    text: () => {
      let t = `A tight-beam resolves on the long-range board — not noise, not a beacon the ship already owns. The signature is small, close, and deliberate.`;
      if (isAlive("mira")) {
        t += `\n\nMira locks the axis before anyone else speaks. "Not debris. Not a probe. Someone is holding a steady burn against relative motion. They know we are here."`;
      }
      return t;
    },
    choices: [
      { text: "Open a channel. Accept the cost of answering.", next: "vess_cost" }
    ]
  },

  vess_cost: {
    image: "images/observation_bridge.jpg",
    onEnter: () => {
      state.flags.vess_course_lost = true;
    },
    text: () => {
      let t = `The relative match burns reaction mass the navigation plan had reserved for insertion margin. The bus that carried the tight-beam also carried a quiet downgrade on the long-range array.`;
      if (isAlive("mira")) {
        t += `\n\nMira does not argue the arithmetic. "We can still reach the destination. The window is narrower. The correction budget is spent."`;
      }
      return t;
    },
    choices: [
      { text: "Dock. Bring them aboard.", next: "vess_boarding", effects: { supplies: -6 }, flag: { reaction_mass_spent: true, busDowngraded: true } }
    ]
  },

  vess_boarding: {
    image: "images/vess_boarding.jpg",
    onEnter: () => {
      if (state.recovered && state.recovered.vess) return;
      state.recovered = state.recovered || {};
      state.recovered.vess = true;
      state.flags.busDowngraded = true;
      state.flags.reaction_mass_spent = true;
    },
    text: () => `Hard dock. Sparks along the collar. The airlock cycles on a schedule that is not ours.

She comes through alone. Long white hair, purple eyes, a form-fitting dark suit with purple accents that has seen more vacuum than people. The voice that answers the challenge is the same flat log-trained cadence that has been talking to empty berths for six years.

"Dawnbreak. Sole survivor. I have the logs. I have the window. I do not have a crew."`,
    choices: [
      { text: "Clear her for the observation blister.", next: "vess_offer" }
    ]
  },

  vess_offer: {
    image: "images/vess_offer.jpg",
    onEnter: () => {},
    text: () => `She stands in the blister the way someone stands on a map they already memorized. The long-range window is still open. She does not ask permission to look.

"I can keep the ears. I can keep the quiet. I will not become a soft place that costs the ship nothing. If there is a private hour later, the power stays mine."

She waits for the answer that is not a speech.`,
    choices: [
      { text: "Accept the terms. She is crew.", next: "vess_transmission", affinity: { vess: 6 }, trust: { vess: 4 } },
      { text: "Keep her at arm's length for now.", next: "act3_spine_next", affinity: { vess: 2 } }
    ]
  },

  vess_transmission: {
    image: "images/observation_bridge.jpg",
    onEnter: () => {
      if (!state.romance) state.romance = {};
      // informed offer; romance flag only if player later accepts intimate
    },
    text: () => `The last long-range window is a finite resource. She offers it as currency, not as a gift.

"One transmission. Outward. Then the array goes quiet for the insertion burn. I can spend it on a message that will not reach anyone living, or I can spend it on the hour that is only ours."

She does not soften the arithmetic.`,
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
};

registerScenes(scenesCrisesC);
