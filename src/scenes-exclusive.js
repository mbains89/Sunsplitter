// Sunsplitter — scenes-exclusive.js
// Version 0.26.4 — Ideology Router + Exclusive Crises (art batch wire)
// Pure data only. registerScenes merges this map.
// Living → The Breath They Cost; Future → Custody of Tomorrow.
// Death-free. Four flags only. Two ungated floors.

const scenesExclusive = {

  // ═══════════════════════════════════════════════════════════════
  // Ideology Router
  // ═══════════════════════════════════════════════════════════════

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

  // ═══════════════════════════════════════════════════════════════
  // THE BREATH THEY COST (Living path)
  // ═══════════════════════════════════════════════════════════════

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
      let t = `Tomas nods once. The public word is given.\n\n`;
      t += `"Then we hold the line together. I'll prep the crisis options. None of them are clean."`;
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
      let t = `The refusal lands. Tomas does not argue.\n\n`;
      if (isAlive("tomas")) t += `"Understood, Captain. The math is yours."\n\n`;
      t += `The rumor does not die. It only goes quieter.`;
      return t;
    },
    choices: [
      { text: "Proceed to the hub.", next: "breath_hub" }
    ]
  },

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
        requires: { embryos: { min: 8 } }
      },
      {
        text: "Send crew into the contaminated scrubber trunks by hand.",
        next: "breath_trunks"
        // ungated floor
      },
      {
        text: "Convert the hydroponics garden into a disposable biological scrubber.",
        next: "breath_garden",
        alive: "amara",
        requires: { supplies: { min: 4 } }
      },
      {
        text: "Put the vulnerable into controlled black sleep. Lena stays awake to manage.",
        next: "breath_blacksleep",
        alive: "lena",
        requires: { supplies: { min: 3 } }
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
      if (state.flags.breath_word === "given") t += `Tomas's public word held. The rumor has less room to grow.\n\n`;
      else if (state.flags.breath_word === "refused") t += `The refused word is still walking the corridors.\n\n`;
      t += `The ship has a path again. The fracture has not closed.`;
      return t;
    },
    choices: [
      { text: "Return to the crew.", next: "prom_vent" }
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // CUSTODY OF TOMORROW (Future path)
  // ═══════════════════════════════════════════════════════════════

  custody_onset: {
    image: "images/custody_onset.jpg",
    onEnter: () => {
      if (state.crisisPath == null) state.crisisPath = "custody";
    },
    text: () => {
      let t = `The vault thermal spine is saturated. Heat must leave or the embryos cook.\n\n`;
      t += `There is no clean radiator left that does not touch an occupied section or the vault itself. The question is no longer technical. It is custody: who decides what the future is allowed to cost.`;
      return t;
    },
    choices: [
      { text: "Open the custody hub.", next: "prom_price" }
    ]
  },

  custody_hub: {
    image: "images/vault.jpg",
    text: () => {
      let t = `Four answers. One is ungated. The rest require a living specialist who still has the authority or the body to spend.\n\n`;
      t += `Whatever you choose becomes the permanent answer to who owns the future on this ship.`;
      return t;
    },
    get choices() {
      const opts = [
        {
          text: "Dump the heat through the inhabited ring. Vault remains possession.",
          next: "custody_possession",
          requires: { integrity: { min: 4 } }
        },
        {
          text: "Thaw outer embryo racks to absorb the heat.",
          next: "custody_thaw"
          // ungated floor
        },
        {
          text: "Mira severs the fused thermal junction in the unpressurized skin.",
          next: "custody_severed",
          alive: "mira",
          requires: { integrity: { min: 3 } }
        }
      ];
      if (state.promises.sela !== "broken") {
        opts.push({
          text: "Open the vault manifest and grant Sela second physical authorization.",
          next: "custody_shared",
          alive: "sela"
        });
      }
      return opts;
    }
  },

  custody_possession: {
    image: "images/bulkhead.jpg",
    onEnter: () => {
      state.flags.custody_answer = "possession";
      state.flags.custody_roll = true;
    },
    text: () => {
      let t = `Heat dumps into the inhabited ring. The vault stays sealed and whole.\n\n`;
      t += `Crew take the thermal exposure. Cohesion takes the lesson: the future was treated as the Commander's possession.`;
      return t;
    },
    choices: [
      {
        text: "Log the exposure. Keep moving.",
        next: "custody_after",
        effects: { supplies: -3, integrity: -3, cohesion: -6 }
      }
    ]
  },

  custody_thaw: {
    image: "images/vault_interior_alt.jpg",
    onEnter: () => {
      state.flags.custody_answer = "thawed";
      state.flags.custody_roll = true;
    },
    text: () => {
      let t = `Outer racks are thawed to drink the heat. The numbers drop. The living sections stay cool.\n\n`;
      t += `The thawed embryos become an explicit fact the endings will have to name.`;
      return t;
    },
    choices: [
      {
        text: "Accept the reduced count.",
        next: "custody_after",
        effects: { embryos: -14, cohesion: -1 }
      }
    ]
  },

  custody_severed: {
    image: "images/mira_thermal_cut.jpg",
    onEnter: () => {
      state.flags.custody_answer = "severed";
      state.flags.custody_roll = true;
    },
    text: () => {
      let t = `Mira goes into the unpressurized maintenance throat alone. The cut is exact. Redundancy dies with the junction.\n\n`;
      t += `She comes back with cold-radiation injury she will carry for the rest of the voyage. She does not ask for thanks.`;
      return t;
    },
    choices: [
      {
        text: "Get her to medical. Log the cut.",
        next: "custody_after",
        effects: { integrity: -2, cohesion: 1 },
        lean: { future: 1 }
      }
    ]
  },

  custody_shared: {
    image: "images/observation_bridge_alt.jpg",
    onEnter: () => {
      state.flags.custody_answer = "shared";
      state.flags.custody_roll = true;
    },
    text: () => {
      let t = `The vault manifest is opened in front of the crew. Sela receives the second physical key.\n\n`;
      t += `"No unilateral triage after this," she says. "If the future is to be spent, it is spent with both names on the order."\n\n`;
      t += `Command retains power. It no longer owns the vault alone.`;
      return t;
    },
    choices: [
      {
        text: "Accept the compact.",
        next: "custody_after",
        effects: { cohesion: 2 },
        lean: { living: 1 }
      }
    ]
  },

  custody_after: {
    image: "images/corridor_pressure_1.jpg",
    onEnter: () => {
      if (state.promises.tomas === "made") {
        if (state.flags.custody_answer === "possession") {
          state.promises.tomas = "broken";
          remember("You broke the promise to Tomas. The living paid for the vault.");
        } else {
          state.promises.tomas = "kept";
          remember("You kept the promise to Tomas. The living got the mercy.");
        }
      }
    },
    text: () => {
      let t = `The thermal spine cools. The answer is on the record.\n\n`;
      if (state.flags.custody_answer === "possession") t += `The vault was kept as possession. The living paid in heat and trust.\n\n`;
      else if (state.flags.custody_answer === "thawed") t += `Outer racks were thawed. The count is lower and permanent.\n\n`;
      else if (state.flags.custody_answer === "severed") t += `Mira's cut holds. She carries the cold.\n\n`;
      else if (state.flags.custody_answer === "shared") t += `Sela holds the second key. Unilateral control is over.\n\n`;
      if (state.promises.tomas === "broken" && isAlive("tomas"))
        t += `Tomas reads the exposure log once. "You said: if the vault and the living need the same mercy, the living get it. The ring paid. Noted, Commander."\n\n`;
      else if (state.promises.tomas === "kept" && isAlive("tomas"))
        t += `Tomas counts the cost without flinching from it. "Whatever the next order is, you won't have to give it twice."\n\n`;
      t += `The ship has a path again. The fracture has not closed.`;
      return t;
    },
    choices: [
      { text: "Return to the crew.", next: "prom_vent" }
    ]
  }

};

registerScenes(scenesExclusive);
