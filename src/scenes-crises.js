// Sunsplitter — scenes-crises.js
// Version 0.27.2 — Allusion carriers (promise re-surfacing)
// Pure data only. registerScenes merges this map.
// 0.23 packages + 0.24 Vess signal/boarding/offer/transmission/intimate.

const scenesCrises = {

  // ═══════════════════════════════════════════════════════════════
  // Package A — Tomas recovery: "The Green Tether"
  // ═══════════════════════════════════════════════════════════════

  act2_tether_sighting: {
    image: "images/debris_field.jpg",
    onEnter: () => {},
    text: () => {
      let t = `The contact resolves on the third scope pass: the agri-annex, whole, trailing four kilometers back on nothing but its own dying momentum. The observation strip still glows green. Someone is keeping the grow-lamps fed.

Four kilometers. On a living world that was the length of a long walk home. Here it is the distance a green light has been falling while nobody was looking back.`;
      if (isAlive("mira")) {
        t += `\n\nMira reads the drift twice before she says it out loud. "Relative velocity is decaying — eleven meters a second and widening. In nine hours it starts to tumble, and nothing catches a tumble. We can match it by venting reserve water as reaction mass. Eleven hundred liters. That's the number. It doesn't get smaller by waiting."`;
      } else {
        t += `\n\nThe drift solution comes off the boards the same way either way: nine hours until the annex starts to tumble. Matching it means venting eleven hundred liters of reserve water as reaction mass. The number does not get smaller by waiting.`;
      }
      if (isAlive("elias")) {
        t += `\n\n"Nine hours," Elias says. "Suit prep takes one. Decide in eight."`;
        // 0.27.2 allusion carrier — one-shot, anti-gotcha only
        if (state.promises.elias === "made" && !state.flags.prom_elias_alluded) {
          t += `\n\n"Deck Four pushed back another fragment last night. When it finishes, I hold you to the order of operations."`;
          state.flags.prom_elias_alluded = true;
        }
      }
      if (isAlive("lena")) t += `\n\n"If Tomas is alive in there, he's been living on sprouted seed stock and reclaimed water," Lena says. "Malnourished, half-blind from the lamps, and treatable. Dead isn't. Factor that."`;
      if (isAlive("amara")) {
        t += `\n\nAmara doesn't look away from the green light. "That's Tomas and every growing thing we own, on one bad rope. You'll not be offered a cheaper miracle than eleven hundred liters. You'll also never drink a miracle."`;
        // 0.27.2 allusion carrier — one-shot, anti-gotcha only
        if (state.promises.amara === "made" && !state.flags.prom_amara_alluded) {
          t += `\n\n"The beds are holding. So is your line in my book. I reread it when the air runs thin."`;
          state.flags.prom_amara_alluded = true;
        }
      }
      if (isAlive("sela")) t += `\n\n"The annex was built to carry seeds through the death of a world," Sela says. "It may have carried a man instead. I would like to know which."`;
      return t;
    },
    choices: [
      { text: "Vent the reserve. Match the drift.", next: "act2_tether_vent", effects: { supplies: -6 }, lean: { living: 1 } },
      { text: "Hard intercept. Catch it fast and keep the water.", next: "act2_tether_rush", effects: { integrity: -2 }, lean: { future: 1 } }
    ]
  },

  act2_tether_vent: {
    image: "images/power_crisis.jpg",
    onEnter: () => {
      state.flags.water_vented = true;
      remember("Vented 1,100 liters of reserve water to match the agri-annex drift.");
    },
    text: () => {
      let t = `The vent takes eleven minutes. The whole ship feels it — a long shudder through the deck as a year of drinking water leaves as fog and thrust.`;
      if (isAlive("mira")) {
        t += `\n\n"Closing at two meters a second," Mira reports. "Match in forty minutes. Whoever rides the tether launches in twenty."`;
      } else {
        t += `\n\nMatch in forty minutes. Whoever rides the tether launches in twenty.`;
      }
      if (isAlive("amara")) {
        t += `\n\nAmara is already rewriting the ration boards. She does it in front of everyone, which is the point. "New ceiling's posted. No one gets to be surprised at dinner."`;
      }
      t += `\n\nThe catch needs a hand on the line. Someone goes out.`;
      return t;
    },
    get choices() {
      const opts = [];
      if (isAlive("elias")) opts.push({ text: "Elias rides the tether.", next: "act2_tether_hand_elias" });
      if (isAlive("mira")) opts.push({ text: "Mira rides the tether.", next: "act2_tether_hand_mira" });
      if (isAlive("sela")) opts.push({ text: "Sela rides the tether.", next: "act2_tether_hand_sela" });
      if (!isAlive("elias") && !isAlive("mira") && !isAlive("sela")) {
        opts.push({ text: "You ride it yourself.", next: "act2_tether_dock" });
      }
      return opts;
    }
  },

  act2_tether_rush: {
    image: "images/debris_field.jpg",
    onEnter: () => {
      state.flags.tether_rushed = true;
      remember("Ordered a hard intercept of the agri-annex to preserve the water reserve.");
    },
    text: () => {
      let t = `The water stays in the tanks. The closing rate stays at eleven meters a second.`;
      if (isAlive("mira")) {
        t += `\n\n"A hard catch puts fourteen millibars a second across that collar," Mira says. "The seals hold. I cannot give you a number for anything soft inside, and I'm not allowed to dress that up."`;
      }
      if (isAlive("amara")) {
        t += `\n\n"You're saving water by shaking a greenhouse," Amara says, quietly, so it lands. "Say that back to yourself once before you give the order."`;
      }
      if (isAlive("elias")) {
        t += `\n\n"Fast is fast," Elias says. "Line launches in ten."`;
      } else {
        t += `\n\nThe order stands. Line launches in ten.`;
      }
      t += `\n\nThe catch still needs a hand on the line.`;
      return t;
    },
    get choices() {
      const opts = [];
      if (isAlive("elias")) opts.push({ text: "Elias rides the tether.", next: "act2_tether_hand_elias" });
      if (isAlive("mira")) opts.push({ text: "Mira rides the tether.", next: "act2_tether_hand_mira" });
      if (isAlive("sela")) opts.push({ text: "Sela rides the tether.", next: "act2_tether_hand_sela" });
      if (!isAlive("elias") && !isAlive("mira") && !isAlive("sela")) {
        opts.push({ text: "You ride it yourself.", next: "act2_tether_dock" });
      }
      return opts;
    }
  },

  act2_tether_hand_elias: {
    image: "images/self_risk.jpg",
    onEnter: () => { state.flags.tether_hand_elias = true; },
    text: () => {
      const rushed = !!state.flags.tether_rushed;
      let t = `Elias suits up the way he does everything: once, in order, no wasted motion. He checks the tether shackle three times because three is the number, not because he's afraid.`;
      if (isAlive("mira")) {
        t += `\n\nMira stops him at the lock on a private channel. "The collar's failure modes are sequential, not simultaneous. If the primary shear ring binds, you have twelve seconds of secondary before the pressure wave. I told the room forty times the rating. That was for the room. This is for you." She does not wait for acknowledgment.`;
      }
      t += `\n\nOn the line, four kilometers of nothing under his boots, his comm stays flat. "On approach. Annex is bleeding light from the aft seam. ${rushed ? "Closing fast. This will bang." : "Closing slow. This will hold."} Ready."`;
      return t;
    },
    choices: [
      { text: "Bring it home.", next: "act2_tether_dock" }
    ]
  },

  act2_tether_hand_mira: {
    image: "images/self_risk.jpg",
    onEnter: () => { state.flags.tether_hand_mira = true; },
    text: () => {
      const rushed = !!state.flags.tether_rushed;
      return `"For the record," Mira says, sealing her helmet, "I'm the only person aboard who knows where that collar fails, which makes this the correct assignment and a bad one at the same time. Both can be true."

On the line she narrates the whole ride in measurements — range, closure, seam temperature. Somewhere in the middle the range calls drop to single numbers, then stop. "${rushed ? "Fourteen millibars a second is what I said and fourteen is what we'll get. Ready." : "Two meters a second. The collar is rated for forty times that. Ready."}"`;
    },
    choices: [
      { text: "Bring it home.", next: "act2_tether_dock" }
    ]
  },

  act2_tether_hand_sela: {
    image: "images/self_risk.jpg",
    onEnter: () => { state.flags.tether_hand_sela = true; },
    text: () => `Sela puts the suit on without being shown twice. "I will go," she says. "I have caught falling things before. None this large. The principle holds."

On the line she does not fill the silence. Range calls only, exact, unhurried. At two hundred meters she says one thing that is not a number: "There is green light coming through the strip. It is the correct color. I wanted someone else to know that before the catch, in case I am busy afterward."`,
    choices: [
      { text: "Bring it home.", next: "act2_tether_dock" }
    ]
  },

  act2_tether_dock: {
    image: "images/bulkhead.jpg",
    onEnter: () => {
      if (!isRecovered("tomas")) {
        state.recovered.tomas = true;
        if (state.flags.tether_rushed) state.flags.trays_dead = true;
        remember("Recovered Tomas alive from the agri-annex.");
        if (state.flags.tether_rushed) {
          remember("The sprouting trays died of pressure shock during the hard dock.");
        }
      }
    },
    text: () => {
      let t;
      if (state.flags.tether_rushed) {
        t = `The catch bangs. The whole spine rings with it, and through the observation strip the green goes over in one motion — rack after rack of sprouting trays slapping flat, soil and water sheeting off the walls. The collar seals. The seals were never the question.

The hatch opens on wet ruin. Grey-green mash where the trays were.`;
      } else {
        t = `The catch takes eight minutes and sounds like nothing at all — the tether singing once as it loads, the collar meeting the ring, a kiss and a seal. Through the strip the trays stand in their racks, rank on rank of green, untouched.

The hatch opens on the smell of soil. Nobody aboard has smelled soil in a long time.`;
      }
      // Rider-comm payoffs (guarded)
      if (state.flags.tether_hand_sela) {
        t += state.flags.tether_rushed
          ? `\n\nSela's last call was a single word: "Sealed." Then silence until the hatch.`
          : `\n\nSela's last call was clean range and a quiet "Green light holds." She does not celebrate.`;
      } else if (state.flags.tether_hand_mira) {
        t += `\n\nMira's last transmission was the seal pressure, read once, then "Collar holds."`;
      } else if (state.flags.tether_hand_elias) {
        t += `\n\nElias comes off the line the same way he went on it: three checks, then the hatch.`;
      } else {
        t += `\n\nYou rode it yourself. The line sang under your hands the whole way in. Nobody else was available to hear the report.`;
      }
      t += `\n\nTomas comes through it on his own feet, barely. Gaunt to the bone, soil under every nail, eyes lamp-burned to a permanent squint. `;
      if (state.flags.tether_rushed) {
        t += `He is holding one tray against his chest. He braced it with his body through the catch. It is the only green thing left.`;
      } else {
        t += `He puts a hand on the nearest rack on his way out, the way other men touch a doorframe of a house they are leaving.`;
      }
      t += `\n\nHe looks at you before he looks at anyone else.\n\n"Count the trays before you thank me. Then decide whether you still want to."`;
      return t;
    },
    choices: [
      { text: "Get him to medbay.", next: "act2_tether_manifest" }
    ]
  },

  act2_tether_manifest: {
    image: "images/medbay_dim.jpg",
    onEnter: () => {},
    text: () => {
      let t = `Medbay, after. `;
      if (isAlive("lena")) {
        t += `Lena has him on fluids and has already told him he'll live, in the tone she uses for things that are true and therefore boring.`;
      } else {
        t += `He's on fluids, propped half-upright, refusing the bed's angle like it's a personal opinion.`;
      }
      if (state.flags.tether_hand_elias) t += ` Elias is still in decon.`;
      else if (state.flags.tether_hand_mira) t += ` Mira is still in decon.`;
      else if (state.flags.tether_hand_sela) t += ` Sela is still in decon.`;
      t += `\n\nWhen it's just the two of you, Tomas talks to the ceiling.\n\n"I need you to hear this before you read it off a manifest. I ate the vault. Not all of it — a third, near enough. Sprouted it in trays and ate the future one species at a time, because the future doesn't chew itself and I wasn't ready to stop being somebody's present. I kept a list. Every name I ate. One of them was Hokkaidō cold-line rice — the variety that would have grown in the first soil they planned to break. I ate it on day forty-one because the protein was clean and the list had to start somewhere. It tasted like nothing. That was the point. You'll have it, all of it, because they were seeds with names and they deserve better than a number."\n\nHe turns his head and looks at you for the first time since the hatch.\n\n"What you tell the others is command. What I just told you is true. Those don't have to match. I'd rather they did."`;
      return t;
    },
    choices: [
      { text: "The crew hears it. All of it, from me.", next: "act2_tether_truth", effects: { cohesion: -3 } },
      { text: "It logs as breach loss. This stays in this room.", next: "act2_tether_lie", effects: { cohesion: 1 } }
    ]
  },

  act2_tether_truth: {
    image: "images/observation_crew.jpg",
    onEnter: () => {
      state.flags.manifest_exposed = true;
      if (state.flags.trays_dead) state.flags.tomas_scapegoated = true;
      remember("Told the crew Tomas consumed a third of the germplasm vault to survive.");
      if (state.flags.trays_dead) {
        remember("The crew held Tomas responsible for the dead vault.");
      }
    },
    text: () => {
      let t = `You tell them in the mess, plainly, with Tomas standing where everyone can see him. A third of the vault, eaten to stay alive. His list of names goes on the board next to the ration ceiling.`;
      if (state.flags.trays_dead) {
        t += `\n\nThe silence after has teeth in it. A third eaten in the dark, and the rest dead at the dock — the room does the sum its own way.`;
        if (isAlive("elias") && !state.flags.tether_hand_elias) {
          t += `\n\n"Vault's dead," Elias says. "He was inside it." Facts, laid side by side.`;
        }
        if (isAlive("mira") && !state.flags.tether_hand_mira) {
          t += `\n\n"Pressure shock killed the trays," Mira says. "Fourteen millibars a second at the collar — exactly what I called before the order. The eating is a separate line item." She says it to the room. The room hears what it wants.`;
        }
        if (isAlive("sela") && !state.flags.tether_hand_sela) {
          t += `\n\n"The distinction will not survive the retelling," Sela says, quietly, to no one.`;
        }
        t += `\n\nTomas takes it standing. When he finally speaks, it's one word, to you, and it's your rank.`;
      } else {
        if (isAlive("amara")) {
          t += `\n\nAmara breaks the silence first. "A third gone and two-thirds green in the racks. I've balanced worse books than that, and with less honest arithmetic."`;
        }
        if (isAlive("elias") && !state.flags.tether_hand_elias) {
          t += `\n\n"He's alive. The list is short one column." Elias nods once at the board. "Noted."`;
        }
        if (isAlive("sela") && !state.flags.tether_hand_sela) {
          t += `\n\n"He ate the seeds so that a man could carry the rest home," Sela says. "I believe the vault would approve of the trade. It cannot say so. I am saying it for it."`;
        }
        t += `\n\nTomas watches the room not turn on him, and something in his shoulders lets go a centimeter. He uses your name when he thanks you, quietly, once.`;
      }
      return t;
    },
    choices: [
      { text: "Continue.", next: "act2_spine_next" }
    ]
  },

  act2_tether_lie: {
    image: "images/observation_bridge.jpg",
    onEnter: () => {
      state.flags.manifest_lie = true;
      remember("Logged the germplasm shortfall as breach loss.");
    },
    text: () => {
      let t = `You write it yourself: GERMPLASM SHORTFALL — BREACH LOSS, ATTRIB. STRUCTURAL. Four words that cost nothing to type.`;
      if (isAlive("tomas")) {
        t += `\n\nTomas watches you file it. He uses your name — quietly, for the first time since the dock — and says nothing else about it, which is its own kind of weight handed across a table.`;
      }
      if (isAlive("amara")) {
        t += `\n\nAmara finds you two days later, alone, with a tablet she doesn't show you.\n\n"I count every living thing on this ship, and I count what feeds them. The vault manifest and the breach report don't shake hands." She lets that sit exactly as long as it needs to. "I'm not asking you anything. I'm telling you I noticed, so you know precisely what it weighs and who else can lift it. Don't make me your only confessor. I haven't the shelf space."`;
      }
      return t;
    },
    choices: [
      { text: "Continue.", next: "act2_spine_next" }
    ]
  },

  // Spine placeholder after Tomas recovery → Jiro recovery
  act2_spine_next: {
    image: "images/corridor.jpg",
    onEnter: () => {},
    text: () => `The annex is secured. Tomas is aboard. The ship has one more green thing and one more mouth.

The boards keep working. So do you.`,
    choices: [
      { text: "Back to the work.", next: "act3_reckoning_pattern" }
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // Package B — Jiro recovery: "Dead Reckoning"
  // ═══════════════════════════════════════════════════════════════

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
  act3_spine_next: {
    image: "images/corridor.jpg",
    onEnter: () => {
      // 0.24: Vess arrival window opens once after vault face; guaranteed, no refuse-contact
      if (!state.recovered || !state.recovered.vess) return "vess_signal";
    },
    text: () => {
      let t = `The vault light stays on behind you. The ship has two men back who were written off, and a list of names that is no longer only numbers.`;
      if (state.recovered && state.recovered.vess) {
        t += `\n\nA third name is on the board now. The Dawnbreak survivor is still finding which bulkheads answer.`;
      }
      t += `\n\nThere is still work. There is still the fracture the private hours left in the corridor.`;
      // 0.27.2 Tomas allusion carrier — one-shot after make (bond return re-enters here)
      if (state.promises.tomas === "made" && isAlive("tomas") && !state.flags.prom_tomas_alluded) {
        t += `\n\nTomas finds you in the corridor on the way past. "Names first, then numbers. You put the order of mercy on record once. I count easier since."`;
        state.flags.prom_tomas_alluded = true;
      }
      return t;
    },
    get choices() {
      const opts = [];
      // 0.23.3: post-recovery bond reachability (early crew_walk could not offer Tomas/Jiro while missing)
      // One-shot: only if alive and not already bonded/skipped. Reuses existing bond_* scenes.
      if (isAlive("elias") && !hasMark("elias", "bonded") && !hasMark("elias", "bond_skipped")) {
        opts.push({ text: "Share a quiet hour with Elias — no orders.", next: "bond_elias", effects: { cohesion: 1 }, alive: "elias", tag: "bond" });
      }
      if (isAlive("tomas") && !hasMark("tomas", "bonded") && !hasMark("tomas", "bond_skipped")) {
        opts.push({ text: "Sit a low-stakes game with Tomas if he will play.", next: "bond_tomas", effects: { cohesion: 1 }, alive: "tomas", tag: "bond" });
      }
      // 0.28.1b: quiet_tomas was early-only while Tomas starts unrecovered — offer once post-recovery
      if (isAlive("tomas") && !state.flags.quiet_tomas_done) {
        opts.push({ text: "Sit with Tomas without asking for anything.", next: "quiet_tomas", effects: { cohesion: 3 }, affinity: { tomas: 10 }, alive: "tomas", tag: "bond" });
      }
      // 0.28.1b: Amara+Tomas private — intimacy_window can fire before Tomas recovery
      if (isAlive("amara") && isAlive("tomas") && !state.romance.amara_tomas && state.flags.hydro === "full") {
        opts.push({ text: "Walk in on Amara and Tomas — and decide whether to stay.", next: "romance_amara_tomas", aliveAll: ["amara", "tomas"], tag: "private" });
      }
      if (isAlive("jiro") && !hasMark("jiro", "bonded") && !hasMark("jiro", "bond_skipped")) {
        opts.push({ text: "Join Jiro on a competence hang at the star tracker.", next: "bond_jiro", effects: { cohesion: 1 }, alive: "jiro", tag: "bond" });
      }
      // 0.28: pair settle + warmth optional one-shots (gated)
      if (isAlive("elias") && !isAlive("mira") && attributableDeath("mira") && !state.flags.pair_shield) {
        opts.push({ text: "Elias is still at the board after the report.", next: "pair_shield_cold" });
      }
      if (isAlive("tomas") && isAlive("jiro") && !state.flags.tomas_scapegoated && !state.flags.pair_grudge) {
        opts.push({ text: "The sound of two people working carries from the trunk.", next: "pair_grudge_settle" });
      }
      if (isAlive("amara") && isAlive("sela") && stillFavoring("sela") && !state.flags.pair_favor) {
        opts.push({ text: "Hydroponics wants a quiet word.", next: "pair_favor_confront" });
      }
      if (isAlive("tomas") && !state.flags.warmth_meal) {
        opts.push({ text: state.flags.trays_dead ? "Follow the sound of the whole crew in one room." : "Follow the smell of green down-corridor.", next: "warmth_meal" });
      }
      if (["lena","elias","mira","tomas","amara","jiro","sela","vess"].filter(isAlive).length >= 2 && !state.flags.warmth_laughter) {
        opts.push({ text: "There's laughter around the spine bend. Stop before they see you.", next: "warmth_laughter" });
      }
      if (!state.flags.warmth_music) {
        opts.push({ text: "There's music coming from the empty berths.", next: "warmth_music" });
      }
      // Preserve pregnancy check if any romance occurred; then tomas_break is reachable
      // 0.24.2: Vess pregnancy gate keys on physical intimacy (vess_intimate), not offer acceptance
      const anyRomance = !!(state.romance.lena || state.romance.mira || state.romance.amara || state.romance.sela || state.flags.vess_intimate || state.romance.amara_tomas);
      if (anyRomance && state.flags.pregnancy_risk === undefined) {
        opts.push({ text: "Continue.", next: "pregnancy_check" });
      } else if (isAlive("tomas") && state.recovered && state.recovered.tomas) {
        opts.push({ text: "Continue.", next: "tomas_break" });
      } else {
        opts.push({ text: "Continue.", next: "act3_lethal_elias_order" });
      }
      return opts;
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // 0.24 — Vess Arrival + short asymmetric 5th romance
  // Structural asymmetry: informed run-reading offer, transmission currency,
  // power stays hers, fewer beats, one explicit sufficient. Not a fifth ladder.
  // ═══════════════════════════════════════════════════════════════

  vess_signal: {
    image: "images/vess_signal.jpg",
    onEnter: () => {},
    text: () => {
      let t = `The long-range board lights on a carrier that has lived in the noise floor for eleven months. `;
      if (isAlive("mira")) {
        t += `Mira's filters finally pull a clean string.`;
      } else {
        t += `The automatic filters finally pull a clean string.`;
      }
      t += `

Authentication request. Protocol three. Dawnbreak fragment. Sole survivor. Requesting docking authority.

The voice is flat, timestamped, log-trained — a woman who has been her own captain for six years.`;
      if (isAlive("mira")) {
        t += `\n\nMira does not look away from the board. "Relative velocity is matchable. Reaction-mass cost is not optional. The bus will have to run degraded to keep her relay core online. There is no second window on this heading."`;
      } else {
        t += `\n\nThe geometry is clear from the boards: matchable, but the reaction-mass reserve held for a late course option will be spent, and the environmental bus will run degraded to power her relay core. No second window.`;
      }
      if (isAlive("elias")) {
        t += `\n\n"Eleven months of listening," Elias says. "She already knows our hull ID. Decide whether that is a gift or a problem after she is aboard."`;
      }
      return t;
    },
    choices: [
      { text: "Prepare the intercept. Bring her in.", next: "vess_cost" }
    ]
  },

  vess_cost: {
    image: "images/vess_signal.jpg",
    onEnter: () => {
      state.flags.busDowngraded = true;
      state.flags.reaction_mass_spent = true;
      // Distinct from Jiro burn course_option_lost (0.24.2)
      state.flags.vess_course_lost = true;
      remember("Spent the last clean reaction-mass reserve to recover Vess from Dawnbreak.");
      remember("Environmental bus runs degraded for her relay core.");
    },
    text: () => `Matching the fragment costs the last clean reaction-mass reserve that was held back for a late course correction. The environmental bus is already being re-routed; lights will be dimmer on the outer ring and the air will cycle slower.

The window does not stay open by hesitation. There is no refuse-contact option that still leaves a second chance.

She is coming aboard.`,
    choices: [
      { text: "Dock the fragment.", next: "vess_boarding", effects: { supplies: -3, integrity: -1 } }
    ]
  },

  vess_boarding: {
    image: "images/vess_boarding.jpg",
    onEnter: () => {
      if (!isRecovered("vess")) {
        state.recovered.vess = true;
        state.survivors = Math.min((state.survivors || 0) + 1, 20);
        if (state.affinity.vess === undefined) state.affinity.vess = 0;
        if (state.trust.vess === undefined) state.trust.vess = 35;
        remember("Recovered Vess, sole survivor of the Dawnbreak fragment.");
      }
    },
    text: () => {
      let t = `The fragment docks ugly — no working attitude thrusters, only a hard magnetic grab and a pressure equalize that makes the whole ring complain. The hatch opens on a tall, wiry figure in a suit patched by the same hands for six years. Long dark hair cut with a knife at the jawline. She looks at you too long, then not at all.

"Commander. Your hull ID has been in my night log for eleven months. I said the names of the Dawnbreak dead every night so somebody did. Yours I already knew."

The flat voice cracks on the last word. She recovers it immediately, the way a log entry recovers from a dropped packet.`;
      if (isAlive("lena")) {
        t += `\n\nLena is already moving toward the hatch with a med kit. "Six years closed-loop. Hypercapnia baseline, possible calcium loss, treatable. Let me see her before anyone else does."`;
      }
      return t;
    },
    choices: [
      { text: "Get her through the collar. Then talk.", next: "vess_offer" }
    ]
  },

  vess_offer: {
    image: "images/vess_offer.jpg",
    onEnter: () => {
      if (!isAlive("vess")) return "act3_spine_next";
    },
    text: () => {
      let t = `She finds you in the observation blister before the first full watch is over. The suit is off; the underlayer is clean enough to show she cared about the first impression. She stands too close or too far — the distance is wrong in both directions.

"I have read the manuals on pair-bonding under isolation. The success rate is low. The failure mode is worse. I am offering the attempt. You may refuse. The refusal will be logged as a clean decision."`;
      // Informed / run-reading first offer — cites actual run state
      if (state.flags.vault_sacrifice === "future") {
        t += `\n\n"Your vault choice is already in the traffic. You kept the package. I understand the arithmetic. I also understand what it costs the people who are still breathing."`;
      } else if (state.flags.vault_sacrifice === "living") {
        t += `\n\n"Your vault choice is already in the traffic. You kept the living. I have been alone long enough to know what that decision is worth."`;
      }
      const deadNamed = (state.dead || []).filter(k => k !== "rourke" && crew[k]).map(k => crew[k].first || k);
      if (deadNamed.length) {
        let list;
        if (deadNamed.length === 1) list = deadNamed[0];
        else if (deadNamed.length === 2) list = deadNamed[0] + " and " + deadNamed[1];
        else list = deadNamed.slice(0, 2).join(", ") + ", and others";
        t += `\n\n"I heard the casualty list. ${list}. I said their names once when the beacon logged the update. That is all I can offer the dead."`;
      }
      // Minimal cross-route seed: awareness as witnessed fact only
      const activeRoms = ["lena", "mira", "amara", "sela"].filter(k => state.romance[k] && isAlive(k));
      if (activeRoms.length) {
        const firstNames = activeRoms.map(k => crew[k] ? crew[k].first : k);
        if (firstNames.length === 1) {
          t += `\n\n"Your private channels are not as sealed as the manuals assume. One of them is still warm. ${firstNames[0]}. I am not asking you to close it. I am asking whether there is room for a second log."`;
        } else {
          const names = firstNames.length === 2
            ? firstNames[0] + " and " + firstNames[1]
            : firstNames.slice(0, -1).join(", ") + ", and " + firstNames[firstNames.length - 1];
          t += `\n\n"Your private channels are not as sealed as the manuals assume. Some of them are still warm. ${names}. I am not asking you to close it. I am asking whether there is room for a second log."`;
        }
      } else {
        t += `\n\n"I have been talking to this hull longer than you have been answering. The first yes is the only one that matters. After that the procedure is either mutual or it is not."`;
      }
      t += `\n\nShe waits. The flatness is a skill; the waiting is not.`;
      return t;
    },
    get choices() {
      if (!isAlive("vess") || state.romance.vess || hasMark("vess", "declined")) {
        return [{ text: "Return to the watch.", next: "act3_spine_next" }];
      }
      return [
        { text: "Accept the offer. Power stays with her.", next: "vess_transmission", tag: "private", affinity: { vess: 6 }, trust: { vess: 4 } },
        { text: "Decline. Log it clean.", next: "act3_spine_next", mark: { vess: "declined" }, affinity: { vess: 1 } }
      ];
    }
  },

  vess_transmission: {
    image: "images/vess_signal.jpg",
    onEnter: () => {
      if (!isAlive("vess")) return "act3_spine_next";
      state.romance.vess = true;
    },
    text: () => {
      let t = `She does not celebrate the yes. She opens a second request the same way she opened the first — as procedure.

"There is one long-range window left on this bus before the degradation takes the high-gain permanently. I want it. One directed burst toward the Dawnbreak debris field, or the residual Earth noise if the geometry still favors it. After that the external contact lane is closed. The logs I kept for six years can live in your memory instead of only mine."

The currency is forward-looking and external. It is not Mira's archival lane. It is the last time this ship speaks outward.`;
      if (isAlive("mira")) {
        t += `\n\nMira, if she is listening on the secondary, does not interrupt. The board already shows the window count.`;
      }
      return t;
    },
    choices: [
      { text: "Give her the window. Last outward voice.", next: "vess_intimate", effects: { cohesion: 1 }, flag: { last_tx_spent: true }, affinity: { vess: 4 } },
      { text: "Keep the window for the ship. Her logs can wait.", next: "act3_spine_next", affinity: { vess: 2 }, trust: { vess: -2 } }
    ]
  },

  vess_intimate: {
    image: "images/vess_intimate.jpg",
    onEnter: () => {
      if (!isAlive("vess") || !state.romance.vess) return "act3_spine_next";
      state.flags.vess_intimate = true;
      remember("Shared the last long-range window and a private hour with Vess.");
    },
    text: () => {
      let t = `She does not wait for a second invitation. The door override is hers — she has been reading the ship's access tree since the beacon first resolved your hull. The underlayer comes off on her schedule. She is inexperienced with people and exact with survival; the difference is visible in the way she does not ask whether the light stays on.

Power stays with her. The pace is hers. When the flat voice finally cracks again it is not procedure. It is the first sound she has made in six years that was not logged for a dead crew.

Afterward she sits with her back against the bulkhead and looks at the observation blister the way someone looks at a map they already memorized.

"I will not ask again. The attempt either holds or it does not. I have the window. You have the record. That is the exchange."`;
      return t;
    },
    choices: [
      { text: "Let the hour end on her terms.", next: "act3_spine_next", affinity: { vess: 5 }, trust: { vess: 3 } }
    ]
  }
};

registerScenes(scenesCrises);
