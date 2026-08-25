// Sunsplitter — scenes-13.js
// 0.28.1c size hygiene. Pure mechanical. crises: reckoning pattern + heading
// Strict scene shape only: text | choices | onEnter | image
registerScenes({

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

  // PRE: reckoning rescue route | WRITES: paid choices affect resources/lean; governed floor writes nothing
  // DEATH: none | DEAD SPEECH/APPEARANCE: Mira/Elias and recovered-Tomas text/options are living-gated
  // IMAGE: REUSE images/observation_bridge.jpg; no new art request
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
      opts.push({ text: "Make the minimum burn. Accept the wider intercept.", next: "act3_reckoning_burn_stale" });
      return opts;
    }
  },

});
