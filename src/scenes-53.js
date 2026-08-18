// Sunsplitter — scenes-53.js
// 0.28.2 size hygiene. Pure mechanical. exclusive: crisis router + declare + breath onset to word
// Strict scene shape only: text | choices | onEnter | image
registerScenes({

  act3_crisis_router: {
    onEnter: () => {
      const shape = ideologyShape();
      if (shape === "living") {
        state.crisisPath = "breath";
        return "breath_onset";
      }
      if (shape === "future") {
        state.crisisPath = "custody";
        return "custody_onset";
      }
      return "act3_crisis_declare";
    },
    text: () => "",
    choices: []
  },

  act3_crisis_declare: {
    image: "images/corridor_pressure_1.jpg",
    text: () => {
      let t = `The margins are gone.\n\n`;
      t += `Every soft lean, every deferred cost, every time you refused to choose has brought the ship to the same knife. The air loop and the vault thermal spine will not both hold the next cascade.\n\n`;
      t += `You must declare a final priority. The declaration itself costs nothing. The path it opens will.`;
      return t;
    },
    choices: [
      {
        text: "Prioritize the living. The vault will weather the cost.",
        next: "breath_onset"
      },
      {
        text: "Prioritize the vault. The living will bear the burden.",
        next: "custody_onset"
      }
    ]
  },

  // ═════════════════════════════════════════════════════════════
  // THE BREATH THEY COST (Living path)
  // ═════════════════════════════════════════════════════════════

  breath_onset: {
    image: "images/breath_onset.jpg",
    onEnter: () => {
      if (state.crisisPath == null) state.crisisPath = "breath";
    },
    text: () => {
      let t = `A corrosive biofilm has bloomed through the primary air loop. The scrubbers are choking on the load of every body you insisted on keeping alive.\n\n`;
      if (isAlive("tomas")) {
        t += `Tomas meets you at the bulkhead. His voice is steady and public.\n\n`;
        t += `"Captain. Some of the crew are already saying we should vent the newly recovered to buy the rest of us clean air. I need to hear you say the rescued will not be treated as the cause."`;
      } else {
        t += `The rumor is already moving: vent the late arrivals, save the filters. No one stands in front of it.`;
      }
      return t;
    },
    choices: [
      {
        text: '"The rescued will not be treated as the cause. We find another way."',
        next: "breath_word_given"
      },
      {
        text: '"I make no promises. Survival is hard math."',
        next: "breath_word_refused"
      }
    ]
  },

  breath_word_given: {
    image: "images/corridor_pressure_1.jpg",
    onEnter: () => {
      state.flags.breath_word = "given";
    },
    text: () => {
      let t = "";
      if (isAlive("tomas")) {
        t += `Tomas nods once. The public word is given.\n\n`;
        t += `"Then we hold the line together. I'll prep the crisis options. None of them are clean."`;
      } else {
        t += `The public word is given into the rumor. No one stands beside it to make it heavier.\n\n`;
        t += `The crisis options still have to be prepped. None of them are clean.`;
      }
      return t;
    },
    choices: [
      { text: "Proceed to the hub.", next: "breath_hub" }
    ]
  },

  breath_word_refused: {
    image: "images/corridor_pressure_2.jpg",
    onEnter: () => {
      state.flags.breath_word = "refused";
    },
    text: () => {
      let t = `The refusal lands.\n\n`;
      if (isAlive("tomas")) {
        t += `Tomas does not argue.\n\n`;
        t += `"Understood, Captain. The math is yours."\n\n`;
      }
      t += `The rumor does not die. It only goes quieter.`;
      return t;
    },
    choices: [
      { text: "Proceed to the hub.", next: "breath_hub" }
    ]
  },

});
