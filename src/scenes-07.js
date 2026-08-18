// Sunsplitter — scenes-07.js
// 0.28.2 size hygiene. Pure mechanical. mid-a: arc_future_3 + future_4
// Strict scene shape only: text | choices | onEnter | image
registerScenes({

  arc_future_3: {
    get text() {
      let t = `The cascade records were not supposed to open without a dual command key.\n\n`;
      if (isAlive("mira")) {
        t += `Mira finds a bypass in a maintenance layer. What comes up is not engineering data.\n\n`;
      } else {
        t += `A maintenance-layer bypass opens them anyway. What comes up is not engineering data.\n\n`;
      }
      t += `Boarding windows. Priority lists. Atmospheric collapse projections dated before the public alerts. The official story — hours, maybe two days — was the story given to the people on the pads. The people who wrote the manifests had longer.\n\n`;
      if (isAlive("jiro")) t += `Jiro reads without blinking. "They knew enough to choose who the ark was for. We were not a rescue. We were a sample."\n\n`;
      if (isAlive("elias")) t += `Elias: "Then stop mourning the empty bunks as an accident. Treat them as a design."\n\n`;
      if (isAlive("lena")) t += `Lena's voice is flat. "Design or not, the people who did board still bleed."\n\n`;
      t += `The vault framing suddenly looks less like hope and more like the reason the ship existed at all.`;
      return t;
    },
    choices: [
      { text: "Seal the records. The crew cannot use this truth yet.", next: "arc_future_4", effects: { cohesion: 2, integrity: 1 }, flag: { cascade_truth: "sealed" }, lean: { future: 2 }, affinity: { elias: 5 } },
      { text: "Tell the senior crew. No more official stories between us.", next: "arc_future_4", effects: { cohesion: -5, supplies: -1 }, flag: { cascade_truth: "senior" }, lean: { living: 1 }, affinity: { lena: 4, tomas: 4, jiro: 3 } },
      { text: "Broadcast it. The empty ship already knows. The living should too.", next: "arc_future_4", effects: { cohesion: -10, integrity: -2 }, flag: { cascade_truth: "open" }, lean: { living: 2 }, affinity: { tomas: 6, elias: -6 }, trust: { elias: -8, tomas: 6 } }
    ]
  },

  arc_future_4: {
    get text() {
      let t = `A pressure fault opens in the sealed cargo spine`;
      if (isAlive("mira")) t += ` — the abandoned section Mira has been warning about`;
      else t += ` — the abandoned section the board has been flagging`;
      t += `.\n\n`;
      t += `Opening it could yield parts, sealed stores, maybe intact embryo transit gear. It could also vent a corridor you still use.\n\n`;
      if (state.flags.cascade_truth === "open" && isAlive("tomas")) {
        t += `Tomas finds you before you reach the hatch. "If you open that door to feed the vault, say so. Do not call it safety."\n\n`;
      }
      if (state.flags.leadership === "hard" && isAlive("mira")) {
        t += `Mira: "Under your rules I should already be cutting. Give the order or someone else will."\n\n`;
      }
      if (hasMark("mira", "people_first") && isAlive("mira")) {
        t += `She waits longer than the schedule allows. People-first is still a mark she carries.\n\n`;
      }
      t += `What is behind the seal is not neutral. Neither is leaving it closed.`;
      return t;
    },
    choices: [
      { text: "Open it. Take what the future can use.", next: "vault_sacrifice", effects: { supplies: 8, integrity: -8, embryos: 3 }, flag: { abandoned: "opened" }, lean: { future: 3 }, requires: { integrity: { min: 28 } } },
      { text: "Leave it sealed. Some risks are not worth the parts.", next: "vault_sacrifice", effects: { cohesion: 3, integrity: 2 }, flag: { abandoned: "sealed" }, lean: { living: 1 } },
      { text: "Remote scan only. Spend power, not hull.", next: "vault_sacrifice", effects: { supplies: -5, integrity: -1, cohesion: 1 }, flag: { abandoned: "scanned" }, requires: { supplies: { min: 8 }, trust: { mira: 35 } }, alive: "mira" }
    ]
  },

});
