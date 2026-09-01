// Sunsplitter — scenes-55.js
// 0.28.1c size hygiene. Pure mechanical. exclusive: custody
// Strict scene shape only: text | choices | onEnter | image
registerScenes({

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

  // PRE: custody question route; supports only the two governed custody repairs
  // WRITES: thaw/sever choices pay their declared effects immediately; sever also writes Future lean
  // DEATH: none | DEAD SPEECH/APPEARANCE: Mira/Sela options are living-gated
  // IMAGE: REUSE images/vault.jpg; no new art request
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
          next: "custody_possession"
        },
        {
          text: "Thaw outer embryo racks to absorb the heat.",
          next: "custody_thaw",
          requires: { embryos: { min: 14 }, cohesion: { min: 1 } },
          effects: { embryos: -14, cohesion: -1 }
        },
        {
          text: "Mira severs the fused thermal junction in the unpressurized skin.",
          next: "custody_severed",
          alive: "mira",
          requires: { integrity: { min: 3 } },
          effects: { integrity: -2, cohesion: 1 },
          lean: { future: 1 }
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

  // PRE: custody_hub ungated possession route | WRITES: onEnter custody_answer/custody_roll; paid choice affects resources; governed floor writes nothing
  // DEATH: none | DEAD SPEECH/APPEARANCE: no named character speaks or appears
  // IMAGE: REUSE images/bulkhead.jpg; no new art request
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
      },
      {
        text: "Seal the scorched ring. Spend nothing more here.",
        next: "custody_after"
      }
    ]
  },

  // PRE: newly committed thaw choice, or a pre-FH-01B save already parked here
  // WRITES: entry records custody_answer/custody_roll; acknowledgement writes nothing and never charges a parked legacy save
  // DEATH: none | DEAD SPEECH/APPEARANCE: no named character speaks or appears
  // IMAGE: REUSE images/vault_interior_alt.jpg; no new art request
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
    choices: [ { text: "Accept the reduced count.", next: "custody_after" } ]
  },

  // PRE: newly committed sever choice with living Mira, or a pre-FH-01B save already parked here
  // WRITES: entry records custody_answer/custody_roll; acknowledgement writes nothing and never charges a parked legacy save
  // DEATH: none | DEAD SPEECH/APPEARANCE: Mira's line is historical to this committed scene
  // IMAGE: REUSE images/mira_thermal_cut.jpg; no new art request
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
    choices: [ { text: "Get her to medical. Log the cut.", next: "custody_after" } ]
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

  // PRE: a custody answer is committed; legacy recovery may resume with a dead Tomas and an untested made promise
  // WRITES: resolves Tomas's made promise only while he is alive to witness the authored custody test
  // DEATH: none | DEAD SPEECH/APPEARANCE: dead Tomas neither speaks nor receives a kept/broken result
  // IMAGE: REUSE images/corridor_pressure_1.jpg; no new art request
  custody_after: {
    image: "images/corridor_pressure_1.jpg",
    onEnter: () => {
      if (state.promises.tomas === "made" && isAlive("tomas")) {
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
});
