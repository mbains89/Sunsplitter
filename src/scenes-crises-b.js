// Sunsplitter — scenes-crises-b.js
// Split from scenes-crises.js (0.28.1c size hygiene). Pure mechanical.
// Crises: Jiro Dead Reckoning + vault_face.
// Pure data only. registerScenes merges this map.

const scenesCrisesB = {

  act3_reckoning_pattern: {
    onEnter: () => {},
    text: () => {
      let t;
      if (isAlive("mira")) {
        t = `Mira has been staring at the attitude log for an hour when she finally says it.

"The ring's been micro-correcting for nineteen days. I logged it as sensor drift. It isn't. Four adjustments, a pause, four more — repeating every six hours to within a second. Drift doesn't keep a schedule. Somebody in the severed blister is flying it by hand."`;
        // 0.27.2 allusion carrier — one-shot, anti-gotcha only
        if (state.promises.mira === "made" && !state.flags.prom_mira_alluded) {
          t += `\n\n"Junction eleven quoted the dead at me again. I quoted you back. It complied. Precedent noted."`;
          state.flags.prom_mira_alluded = true;
        }
      } else if (isAlive("elias")) {
        t = `It's Elias who catches it, running the ring-wear audit nobody else had time for. "Four corrections. Pause. Four more. Every six hours, to the second." He sets the tablet down. "Drift doesn't drill. This does."`;
      } else {
        t = `The ring-wear audit flags it: four micro-corrections, a pause, four more, repeating every six hours to the second. Drift does not keep a schedule. Someone in the severed astrogation blister is flying it by hand.`;
      }
      t += `\n\nThe blister sheared off with the spine section in the breach. No comms, its own air loop, written off in the first casualty count. Jiro's station.`;
      if (isAlive("tomas") && state.recovered.tomas) {
        t += `\n\n"Jiro." Tomas says the name like it has a hole burned through it. "If that's him, he's been alive out there the whole time we grieved him at half-rations. I'll keep the rest of what I think until he can hear it. He's earned that much and exactly that much."`;
      }
      if (isAlive("lena")) {
        t += `\n\n"Nineteen days on a closed air loop," Lena says. "He'll be hypercapnic, dehydrated, and right about everything. Bring him in before the first two finish the job the breach started."`;
        // 0.27.2 allusion carrier — one-shot, anti-gotcha only
        if (state.promises.lena === "made" && !state.flags.prom_lena_alluded) {
          t += `\n\n"Inventory: one promise, stable. I check its vitals more often than yours."`;
          state.flags.prom_lena_alluded = true;
        }
      }
      if (isAlive("sela")) {
        t += `\n\n"He kept correcting our course," Sela says. "For nineteen days, with no reason to believe anyone would notice. That is either faith or arithmetic. With Jiro I am not certain there is a difference."`;
        // 0.27.2 allusion carrier — one-shot, anti-gotcha only
        if (state.promises.sela === "made" && !state.flags.prom_sela_alluded) {
          t += `\n\n"I have inventoried what you have given me. One sentence about fear. It is rationed correctly."`;
          state.flags.prom_sela_alluded = true;
        }
      }
      return t;
    },
    choices: [
      { text: "We're going to get him.", next: "act3_reckoning_heading" }
    ]
  },

  act3_reckoning_heading: {
    image: "images/observation_bridge.jpg",
    onEnter: () => {},
    text: () => {
      let t = `The geometry is unforgiving. The blister rides a buckled spine section that can't be flown to twice — reaching it takes a correction burn, and the burn spends most of the propellant margin held back for orbital insertion at the end of everything. Arrival stops being a landing and becomes a threading problem.

Worse: the heading has to be committed now, publicly, logged — before Jiro's hand-run data is in anyone's hands. You are betting the insertion margin on numbers you haven't seen.`;
      if (isAlive("mira")) {
        t += `\n\n"Give me forty minutes," Mira says, "and I turn the blister's last telemetry into a solution with a confidence figure attached. Burn before that and you're steering on eleven-day-old numbers I never checked. I can't put a percentage on that, which is my entire objection."`;
      }
      if (isAlive("elias")) {
        t += `\n\n"His air loop is the clock we can't read," Elias says. "Every hour is his."`;
      }
      if (isAlive("tomas") && state.recovered.tomas) {
        t += `\n\nTomas puts it on the record, by your rank, in front of everyone, the way a man plants a marker he expects to be judged beside later. "Commander, that margin is the difference between setting down in soil and starving in orbit above it, and I want it logged that you're proposing to eat the seed corn to bring home one man who reads stars — and the stars will keep, Commander, and the food will not, and I have counted the mouths at every table on this ship including his."`;
      }
      return t;
    },
    get choices() {
      const opts = [
        { text: "Burn now, on the blister's own telemetry.", next: "act3_reckoning_burn_stale", effects: { supplies: -2, integrity: -1 }, lean: { future: 1 } }
      ];
      if (isAlive("mira")) {
        opts.push({ text: "Forty minutes, Mira. Then we burn.", next: "act3_reckoning_burn_verified", effects: { supplies: -3, cohesion: 1 } });
      }
      if (isAlive("tomas") && state.recovered.tomas) {
        opts.push({ text: "One full cycle. We argue it properly, then we go.", next: "act3_reckoning_delay", effects: { supplies: -4, cohesion: -1 } });
      }
      return opts;
    }
  },

  act3_reckoning_burn_stale: {
    image: "images/power_crisis.jpg",
    onEnter: () => {
      state.flags.burn_unverified = true;
      state.flags.course_option_lost = true;
      state.flags.margin_committed = true;
      remember("Committed the correction burn on unverified blister telemetry.");
    },
    text: () => {
      let t = `The burn goes at the top of the hour, on numbers eleven days old, written by a man breathing his own exhaust. Ninety seconds of thrust. The margin gauge falls and does not come back.

Nothing feels wrong. That is the honest description: nothing feels wrong.`;
      if (isAlive("mira")) {
        t += `\n\nMira finishes her verification anyway, after, because that's who she is. She reads the result once, closes the pane, and says two words to nobody in particular. "Solution archived." She doesn't offer it, and you don't ask.`;
      }
      return t;
    },
    choices: [
      { text: "Take us to the blister.", next: "act3_reckoning_cut" }
    ]
  },

  act3_reckoning_burn_verified: {
    image: "images/power_crisis.jpg",
    onEnter: () => {
      state.flags.margin_committed = true;
      remember("Committed the verified correction burn; spent the insertion margin.");
    },
    text: () => {
      let t = `Mira takes thirty-eight of her forty minutes.

"Ninety-four percent confidence," she says. "The other six belongs to the universe, not to me." The heading goes on the log with her number beside it, and the burn goes at the top of the hour. Ninety seconds of thrust. The margin gauge falls and does not come back.`;
      if (isAlive("tomas") && state.recovered.tomas) {
        t += `\n\nTomas watches the gauge the whole time. "You heard me and you spent it anyway," he says afterward, without heat. "That's your job. Mine is remembering the price every time we sit down to eat, and I'm good at my job too."`;
      }
      return t;
    },
    choices: [
      { text: "Take us to the blister.", next: "act3_reckoning_cut" }
    ]
  },

  act3_reckoning_delay: {
    image: "images/observation_bridge.jpg",
    onEnter: () => {
      state.flags.margin_spent_extra = true;
      state.flags.margin_committed = true;
      remember("Delayed one full cycle to hear objections; spent additional propellant margin.");
    },
    text: () => {
      let t = `You give it the cycle. Tomas takes it — all of it — and he doesn't waste a minute: mouths per day, calories per tray, the arithmetic of the margin laid out in food because food is the only currency he trusts.`;
      if (isAlive("amara")) {
        t += `\n\n"He's not wrong," Amara says at the end of it, "and neither are you, which is why this one's yours and not a vote. Just so we're clear that everyone in this room knows exactly what's being bought and who's owed for it."`;
      }
      t += `\n\nAnd through the whole argument, every six hours to the second, the ring corrects. Four adjustments. A pause. Four more. A man you cannot hear, keeping his appointment.

The burn goes a full cycle late, on ${isAlive("mira") ? "Mira's verified solution" : "the best solution the boards can make"}, and the correction for the wait costs margin the original plot never owed. The gauge falls further than it should have. Everyone watches it do it.`;
      return t;
    },
    choices: [
      { text: "Take us to the blister.", next: "act3_reckoning_cut" }
    ]
  },

  act3_reckoning_cut: {
    image: "images/cut_out.jpg",
    onEnter: () => {
      if (!isRecovered("jiro")) {
        state.recovered.jiro = true;
        state.flags.position_certain = true;
        remember("Cut through the buckled spine; recovered Jiro alive from the astrogation blister.");
      }
    },
    text: () => {
      let t = `The cut is a one-way decision made of six hours of torch work. Buckled spine doesn't reseal; what opens stays open. `;
      if (isAlive("elias")) {
        t += `Elias runs the torch himself and doesn't hand it off once.`;
      } else {
        t += `The torch work goes in shifts, and nobody talks over it.`;
      }
      t += `\n\nThe blister opens on stale air and a man surrounded by paper. Printed starcharts, margins black with handwritten fixes — nineteen days of positions run by hand, every four hours, in a place with no one to report them to. Jiro comes out on his own, logs first, then himself, in that order.`;
      if (state.flags.burn_unverified) {
        t += `\n\nOn the way in he asks for the burn log. He reads it once, top to bottom, at his own pace. "Logged," he says, and nothing else.`;
      }
      if (isAlive("tomas") && state.recovered.tomas && !state.flags.tomas_scapegoated) {
        t += `\n\nTomas is there when the blister opens. The two of them look at each other across nineteen days and one breach. "Rourke," Tomas says — just the name, the whole accusation and the whole grief in two syllables — and walks away before anyone can make it a conversation.`;
      } else if (isAlive("tomas") && state.recovered.tomas && state.flags.tomas_scapegoated) {
        t += `\n\nTomas doesn't come down for it. The absence stands in the corridor like a posted notice.`;
      }
      t += `\n\nJiro straightens as much as nineteen days will let him, logs against his chest.\n\n"I know exactly where we are now. You won't like how far that is."`;
      return t;
    },
    choices: [
      { text: "Briefing. One hour.", next: "act3_reckoning_briefing" }
    ]
  },

  act3_reckoning_briefing: {
    image: "images/cascade_records.jpg",
    onEnter: () => {
      if (isAlive("lena")) state.flags.clock_known = true;
    },
    text: () => {
      let t = `Jiro briefs standing, charts spread, voice steadier than his hands.

"Position: confirmed to inside forty kilometers. Arrival window: opens day one hundred eighty-one, closes day one hundred eighty-four. Insertion: one corridor, one pass. That's what the burn bought, and that's what it cost.`;
      if (state.flags.margin_spent_extra) {
        t += ` The cycle we waited narrowed the corridor further. Still one pass. Thinner.`;
      }
      t += `"`;
      t += `\n\nThe room is quiet in a new way. For months every plan aboard has been built on fog. The fog is gone, and it turns out fog was doing some work: nobody can round anything off anymore.`;
      if (isAlive("lena")) {
        t += `\n\nLena breaks it, because of course she does. "He did my math while he was at it. I asked — don't make faces. Ninety to a hundred twenty cycles, and he refused to give me the kind number. First honest prognosis I've had that I didn't write myself."

"Insufficient data would have been a lie," Jiro says. "You had sufficient data."

Day one hundred eighty-one is on the board behind him. Nobody does the subtraction out loud.`;
      }
      if (isAlive("sela")) {
        t += `\n\n"We have traded a comfortable fog for an exact horizon," Sela says. "I prefer the horizon. I understand if others do not. They should say so to the horizon, not to Jiro."`;
      }
      return t;
    },
    choices: [
      { text: "Dismissed. Get some rest — that's an order that includes you, Jiro.", next: "act3_lethal_lena_clock" }
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // Package C — "Vault needs a face"
  // ═══════════════════════════════════════════════════════════════

  act3_vault_face: {
    image: "images/vault.jpg",
    onEnter: () => { state.flags.vault_face = true; },
    text: () => {
      let t = `Third watch. You take the long way back. Two decks up the annex still smells of soil; down here the vault is odorless, and a light is on that shouldn't be.`;
      if (isAlive("sela")) {
        t += `\n\nSela is sitting with the manifest terminal, reading aloud to a room of frost and steel. She does not stop when you come in. She finishes the entry first.

"E-6103. Female. Donor pair deceased, Jakarta arcology. Name field completed at deposit: Noor."

She looks up. "Most of the name fields are empty. The parents left the naming to whoever will raise them. Some could not bear to choose. This pair could not bear not to." Her finger rests beside the line, not on it. "I read one entry aloud each day. There are fourteen thousand and six. I will not finish. That is not the point. The point is that each one I reach has been said once, out loud, by a living voice, inside the ship that carries her."`;
      } else if (isAlive("elias")) {
        t += `\n\nElias is at the manifest terminal. He doesn't startle, because he heard you thirty meters ago.

"Started at one," he says. "E-0001 through E-0214 so far. One a shift." He turns the tablet so you can see today's line. "This one has a name filled in. E-6103 — I skipped ahead once, to check if any did. Noor. Jakarta. Parents dead."

He sets the tablet down flat. "I count exits. My whole life. These don't have any yet. Somebody should still be counting them."`;
      } else {
        t += `\n\nThe terminal is dark and no one is here to read it, so you read it yourself, for the first time — the manifest, entry by entry, fourteen thousand and six lines of the argument the vault has never once made out loud.

Most of the name fields are empty. At E-6103 one isn't. Female. Donor pair deceased, Jakarta arcology. Name field completed at deposit: Noor. Two people on a dying planet filled in a form for a person who does not exist yet, and could not bear to leave that line blank.

You say it out loud, once, to the frost. It is the first name anyone has spoken in this room.`;
      }
      return t;
    },
    get choices() {
      const opts = [];
      if (isAlive("sela") || isAlive("elias")) {
        opts.push({ text: "Read the next one.", next: "act3_vault_face_read" });
      }
      opts.push({ text: "Stay until the entry's done, then go quietly.", next: "act3_spine_next" });
      opts.push({ text: "Leave the light on behind you.", next: "act3_spine_next" });
      return opts;
    }
  },

  act3_vault_face_read: {
    image: "images/vault.jpg",
    onEnter: () => { state.flags.vault_face_read = true; },
    text: () => {
      let t = `You read the next line. E-6104. Male. Donor pair deceased. The name field is empty, so you read the emptiness too, the way you'd log a silence on a comm check.`;
      if (isAlive("sela")) {
        t += `\n\nSela does not thank you. She moves her finger down to the following entry and waits — the way people wait for a thing they expect to continue. Tomorrow's line is yours now, if you want it. She will not ask. She has already spent the words.`;
      } else {
        t += `\n\nElias slides the tablet the rest of the way over and doesn't watch you read it. He watches the vault. When you finish he takes the tablet back and marks the count forward by one, in his own column, next to yours.`;
      }
      return t;
    },
    choices: [
      { text: "Back to the watch.", next: "act3_spine_next" }
    ]
  },

  // Spine after vault face → Vess window (0.24) then tomas_break / pregnancy / faction
};

registerScenes(scenesCrisesB);
