// Sunsplitter — scenes-54.js
// 0.28.1c size hygiene. Pure mechanical. exclusive: breath hub through after
// Strict scene shape only: text | choices | onEnter | image
registerScenes({

  breath_hub: {
    image: "images/power_stress_1.jpg",
    text: () => {
      let t = `The air is turning. Four options remain that do not require naming a living person for the vents.\n\n`;
      t += `One is ungated. The rest demand someone still breathing and still able.`;
      return t;
    },
    choices: [
      {
        text: "Cannibalize sterile filters and outer embryo racks.",
        next: "breath_racks",
        requires: { embryos: { min: 12 }, cohesion: { min: 2 } }
      },
      {
        text: "Send crew into the contaminated scrubber trunks by hand.",
        next: "breath_trunks"
      },
      {
        text: "Convert the hydroponics garden into a disposable biological scrubber.",
        next: "breath_garden",
        alive: "amara",
        requires: { supplies: { min: 6 }, cohesion: { min: 1 } }
      },
      {
        text: "Put the vulnerable into controlled black sleep. Lena stays awake to manage.",
        next: "breath_blacksleep",
        alive: "lena",
        requires: { supplies: { min: 4 } }
      }
    ]
  },

  breath_racks: {
    image: "images/vault_interior_alt.jpg",
    onEnter: () => {
      state.flags.breath_answer = "racks";
    },
    text: () => {
      let t = `Outer racks are stripped. Sterile filters and cryogenic reserves move into the air loop. The biofilm dies back.\n\n`;
      t += `Fourteen thousand and six becomes a smaller number. The uncompromised-vault claim is closed.`;
      return t;
    },
    choices: [
      {
        text: "Accept the count and move on.",
        next: "breath_after",
        effects: { embryos: -12, cohesion: -2 }
      }
    ]
  },

  breath_trunks: {
    image: "images/corridor_pressure_3.jpg",
    onEnter: () => {
      state.flags.breath_answer = "trunks";
    },
    text: () => {
      let t = `Crew in suits crawl the contaminated trunks. Filters are scrubbed by hand. The air clears by degrees.\n\n`;
      t += `Lungs remember the work. Cohesion remembers who was sent.`;
      return t;
    },
    choices: [
      {
        text: "Pull them out. Log the exposure.",
        next: "breath_after",
        effects: { cohesion: -5, integrity: -1 }
      },
      {
        text: "Seal the fouled branch. Spend nothing more here.",
        next: "breath_after"
      }
    ]
  },

  breath_garden: {
    image: "images/hydroponics_amara.jpg",
    onEnter: () => {
      state.flags.breath_answer = "garden";
    },
    text: () => {
      let t = `Amara does not look at you while she opens the mature cultures.\n\n`;
      t += `"This was the first piece of another world," she says. "Now it is a filter that will die with the biofilm."\n\n`;
      t += `The garden becomes disposable biology. The air improves. The later ration boards will not.`;
      return t;
    },
    choices: [
      {
        text: "Let her finish the work.",
        next: "breath_after",
        effects: { supplies: -6, cohesion: -1 },
        lean: { living: 1 }
      }
    ]
  },

  breath_blacksleep: {
    image: "images/medbay_dim_alt.jpg",
    onEnter: () => {
      state.flags.breath_answer = "blacksleep";
    },
    text: () => {
      let t = `Lena sets the doses herself. The vulnerable go under. She stays awake to watch the margins.\n\n`;
      t += `"I will not sleep until the loop is stable," she says. "If the numbers drift, I correct. That is the scar I am accepting."`;
      return t;
    },
    choices: [
      {
        text: "Accept her terms.",
        next: "breath_after",
        effects: { supplies: -4, cohesion: 1 },
        lean: { living: 1 }
      }
    ]
  },

  breath_after: {
    image: "images/corridor_pressure_4.jpg",
    text: () => {
      let t = `The air loop stabilizes. The cost is already on the boards.\n\n`;
      if (state.flags.breath_word === "given" && isAlive("tomas")) t += `Tomas's public word held. The rumor has less room to grow.\n\n`;
      else if (state.flags.breath_word === "given") t += `The public word held. The rumor has less room to grow.\n\n`;
      else if (state.flags.breath_word === "refused") t += `The refused word is still walking the corridors.\n\n`;
      t += `The ship has a path again. The fracture has not closed.`;
      return t;
    },
    choices: [
      { text: "Return to the crew.", next: "prom_vent" }
    ]
  },

  // ═════════════════════════════════════════════════════════════
  // CUSTODY OF TOMORROW (Future path)
  // ═════════════════════════════════════════════════════════════

});
