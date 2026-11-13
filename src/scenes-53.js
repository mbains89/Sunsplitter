// Sunsplitter — scenes-53.js
// 0.28.1c size hygiene. Pure mechanical. exclusive: crisis router + declare + breath onset (word folded into its replies)
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
      // SUN-DEATH-REACTIONS-01: the load line and the rumor are true only while their people exist.
      let t = deadSinceTether().length
        ? `A corrosive biofilm has bloomed through the primary air loop. The scrubbers are choking anyway. The empty berths have bought them no slack.\n\n`
        : `A corrosive biofilm has bloomed through the primary air loop. The scrubbers are choking on the load of every body you insisted on keeping alive.\n\n`;
      const accusers = ["lena", "elias", "mira", "amara", "sela"].some(isAlive);
      if (isAlive("tomas")) {
        t += `Tomas meets you at the bulkhead. His voice is steady and public.\n\n`;
        t += accusers
          ? `"Commander. Some of the crew are already saying we should vent the newly recovered to buy the rest of us clean air. I need to hear you say the rescued will not be treated as the cause."`
          : `"Commander. Everyone left aboard but you is one of the rescued, and the air is counting us anyway. I need to hear you say the rescued will not be treated as the cause."`;
        // SUN-CALLBACKS-01: who pays, through a present habit. Text only.
        const first = typeof firstAttributableDeath === "function" ? firstAttributableDeath() : null;
        if (first) t += `\n\n"I still count ${(crew[first.who] && crew[first.who].first) || first.name} when I count the mouths. I have not stopped. The air is about to stop me."`;
      } else {
        t += accusers
          ? `The rumor is already moving: vent the late arrivals, save the filters. No one stands in front of it.`
          : `Everyone left aboard but you is one of the rescued, and the air is already counting them. No one stands in front of it.`;
      }
      return t;
    },
    // SUN-DIET-REPLY-FOLD-01 (L-057): the word writes breath_word on the choice (it was the answer
    // screens' only entry write) and its answer is the reply; breath_word_given/_refused retired.
    get choices() {
      const accusers = ["lena", "elias", "mira", "amara", "sela"].some(isAlive);
      const given = isAlive("tomas")
        ? [{ who: "tomas", text: `Tomas nods once. The public word is given.` },
           { who: "tomas", text: `"Then we hold the line together. I'll prep the crisis options. None of them are clean."` }]
        : [accusers ? `The public word is given into the rumor. No one stands beside it to make it heavier.`
             : `The public word is given into the quiet. No one stands beside it to make it heavier.`,
           `The crisis options still have to be prepped. None of them are clean.`];
      return [
        {
          text: '"The rescued will not be treated as the cause. We find another way."',
          next: "breath_hub",
          flag: { breath_word: "given" },
          reply: given
        },
        {
          text: '"I make no promises. Survival is hard math."',
          next: "breath_hub",
          flag: { breath_word: "refused" },
          reply: [`The refusal lands.`,
            { who: "tomas", text: `Tomas does not argue. "Understood, Commander. The math is yours."` },
            accusers ? `The rumor does not die. It only goes quieter.` : `The count does not stop. It only goes quieter.`]
        }
      ];
    }
  },

});
