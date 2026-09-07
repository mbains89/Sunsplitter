// Sunsplitter — scenes-07.js
// 0.29 Cascade Allusive: arc_future_3 change-order insertion
// Strict scene shape only: text | choices | onEnter | image
registerScenes({

  // ═══ SCENE GROUP DECLARATION ═════════════════════════════
  // SCENE_IDS: records_changeorders; records_changeorders_after (legacy save compatibility only)
  // VERSION: 0.29        TICKET: Cascade Allusive 2/6
  // PACKAGE: The Unsigned Pages
  // SPINE: adjacent after arc_future_3; exits to arc_future_4
  // PRECONDITIONS: isAlive("mira") && !state.flags.changeorders
  // STATE WRITES: choice sets state.flags.changeorders = "logged" | "buried";
  //   writes NOTHING else
  // DEATH EXPOSURE: none
  // DEAD-SPEECH CHECK: both nodes redirect when !isAlive("mira")
  // IMAGE: REUSE images/cascade_records.jpg; NO ART_REQUEST
  // LANE RULE: never reference Jiro's contingency file here
  // LOCK: verify cascadeAndMirrorChecks requires three records_changeorders hosts.
  // ═════════════════════════════════

  arc_future_3: {
    onEnter: () => doctrinePackRedirect("future"),
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
      { text: "Seal the records. The crew cannot use this truth yet.", next: "records_changeorders", effects: { cohesion: 2, integrity: 1 }, flag: { cascade_truth: "sealed" }, lean: { future: 2 }, affinity: { elias: 5 } },
      { text: "Tell the senior crew. No more official stories between us.", next: "records_changeorders", effects: { cohesion: -5, supplies: -1 }, flag: { cascade_truth: "senior" }, lean: { living: 1 }, affinity: { lena: 4, tomas: 4, jiro: 3 } },
      { text: "Broadcast it. The empty ship already knows. The living should too.", next: "records_changeorders", effects: { cohesion: -10, integrity: -2 }, flag: { cascade_truth: "open" }, lean: { living: 2 }, affinity: { tomas: 6, elias: -6 }, trust: { elias: -8, tomas: 6 } }
    ]
  },

  records_changeorders: {
    image: "images/cascade_records.jpg",
    onEnter: () => {
      const bounce = doctrinePackRedirect("future");
      if (bounce) return bounce;
      if (!isAlive("mira") || state.flags.changeorders) return "arc_future_4";
    },
    text: `Mira has the commissioning log open — to the unsigned pages, the way she keeps it.\n\n"Schedule compressed twice in the last month. Change orders 4417 and 4491. Justification field empty on both. That is not a conclusion. It is a gap where a reason should be."\n\nShe sets the log where the record terminal can image it, or not. Her hands wait.`,
    choices: [
      { text: "Enter it into the record.", next: "records_changeorders_after", flag: { changeorders: "logged" } },
      { text: "Leave it out.", next: "records_changeorders_after", flag: { changeorders: "buried" } }
    ]
  },

  // Current play auto-forwards without rendering this former follow-up.
  // A save already paused here skips onEnter and can still resume normally.
  records_changeorders_after: {
    image: "images/cascade_records.jpg",
    onEnter: () => doctrinePackRedirect("future") || "arc_future_4",
    text: () => state.flags.changeorders === "logged"
      ? `"Entered. It proves the schedule moved. Nothing else. I want that on the same line."`
      : `"Understood."\n\nShe closes the log. She does not close it all the way.`,
    choices: [
      { text: "Continue.", next: "arc_future_4" }
    ]
  },

  arc_future_4: {
    onEnter: () => doctrinePackRedirect("future"),
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
      { text: "Leave it sealed. Some risks are not worth the parts.", next: "vault_sacrifice", effects: { cohesion: 3, integrity: 2 }, flag: { abandoned: "sealed" }, lean: { living: 1 } }
    ]
  },

});
