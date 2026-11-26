// Sunsplitter — scenes-54.js
// 0.28.1c size hygiene. Pure mechanical. exclusive: breath hub through after
// Strict scene shape only: text | choices | onEnter | image
registerScenes({

  // PRE: Breath crisis route; Amara/Lena options remain living-gated and resource-gated
  // WRITES: the selected choice pays its declared resource effects immediately; garden/blacksleep also write Living lean
  // DEATH: none | DEAD SPEECH/APPEARANCE: Amara/Lena choices are hidden unless alive
  // IMAGE: REUSE images/power_stress_1.jpg; no new art request
  breath_hub: {
    image: "images/power_stress_1.jpg",
    text: () => {
      let t = `The air is turning. There are still ways to hold the loop that do not mean naming a living person for the vents.\n\n`;
      t += `One needs nothing but hands. The others burn stock, or need someone still breathing and still able.`;
      return t;
    },
    choices: [
      {
        text: "Cannibalize sterile filters and outer embryo racks.",
        next: "breath_racks",
        requires: { embryos: { min: 12 }, cohesion: { min: 2 } },
        effects: { embryos: -12, cohesion: -2 }
      },
      {
        text: "Send crew into the contaminated scrubber trunks by hand.",
        next: "breath_trunks"
      },
      {
        text: "Convert the hydroponics garden into a disposable biological scrubber.",
        next: "breath_garden",
        alive: "amara",
        requires: { supplies: { min: 6 }, cohesion: { min: 1 } },
        effects: { supplies: -6, cohesion: -1 },
        lean: { living: 1 }
      },
      {
        text: "Put the vulnerable into controlled black sleep. Lena stays awake to manage.",
        next: "breath_blacksleep",
        alive: "lena",
        requires: { supplies: { min: 4 } },
        effects: { supplies: -4, cohesion: 1 },
        lean: { living: 1 }
      }
    ]
  },

  // PRE: newly committed racks choice, or a pre-FH-01B save already parked here
  // WRITES: entry records breath_answer; acknowledgement writes nothing and never charges a parked legacy save
  // DEATH: none | DEAD SPEECH/APPEARANCE: no named character speaks or appears
  // IMAGE: REUSE images/vault_interior_alt.jpg; no new art request
  breath_racks: {
    image: "images/vault_interior_alt.jpg",
    onEnter: () => {
      state.flags.breath_answer = "racks";
    },
    text: () => {
      let t = `Outer racks are stripped. Sterile filters and cryogenic reserves move into the air loop. The biofilm dies back.\n\n`;
      // SUN-BLEAK-ENDING-HONESTY-01: "came through whole" only while the embryos were at full viability
      // before this choice's -12 (embryos cap at 100, effects are unscaled). This is the embryo vault; the
      // germplasm vault is named apart wherever it is meant (#556).
      t += state.embryos + 12 >= 100
        ? `One hundred forty thousand and six becomes a smaller number. No one can say now that the vault came through whole.`
        : `One hundred forty thousand and six becomes a smaller number. Viability had already fallen; now whole racks are gone.`;
      return t;
    },
    choices: [ { text: "Accept the count and move on.", next: "breath_after" } ]
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
        effects: { cohesion: -5, integrity: -1 },
        reply: [`You call the suits back before the trunks are clean. Every name goes on the exposure log, with every minute, where anyone can read who was sent.`, { who: "lena", text: `Lena opens a chart for each name on it. "Logged exposure I can treat," she says. "Unlogged, it is just people coughing in the dark."` }]
      },
      {
        text: "Seal the fouled branch. Spend nothing more here.",
        next: "breath_after",
        reply: [`You seal the fouled branch where it is. The suits come out, the hatch dogs shut, and the trunk drops off the air schematic as if it had never carried air.`]
      }
    ]
  },

  // PRE: newly committed garden choice with living Amara, or a pre-FH-01B save already parked here
  // WRITES: entry records breath_answer; acknowledgement writes nothing and never charges a parked legacy save
  // DEATH: none | DEAD SPEECH/APPEARANCE: Amara's line is historical to this committed scene
  // IMAGE: REUSE images/hydroponics_amara.jpg; no new art request
  breath_garden: {
    image: "images/hydroponics_amara.jpg",
    onEnter: () => {
      state.flags.breath_answer = "garden";
    },
    text: () => {
      let t = `Amara does not look at you while she opens the mature cultures.\n\n`;
      t += `"This was the first piece of another world," she says. "Now it is a filter that will die with the biofilm."\n\n`;
      // SUN-ROMANCE-ARC-04 (L-050): the private debt lands inside the hard decision. Text only.
      if (state.romance.amara && state.flags.amara_vent_delayed) t += `"I kept roots alive on your name once, love, and the ship paid for it on the board. This is the roots paying it back. Don't you go feeling even."\n\n`;
      else if (state.romance.amara) t += `"Don't stand there owing me, love. Stand there breathing."\n\n`;
      t += `The garden becomes disposable biology. The air improves. The later ration boards will not.`;
      return t;
    },
    choices: [ { text: "Let her finish the work.", next: "breath_after" } ]
  },

  // PRE: newly committed black-sleep choice with living Lena, or a pre-FH-01B save already parked here
  // WRITES: entry records breath_answer; acknowledgement writes nothing and never charges a parked legacy save
  // DEATH: none | DEAD SPEECH/APPEARANCE: Lena's line is historical to this committed scene
  // IMAGE: REUSE images/medbay_dim_alt.jpg; no new art request
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
    choices: [ { text: "Accept her terms.", next: "breath_after" } ]
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
