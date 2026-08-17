// Sunsplitter — scenes-crises-a.js
// Split from scenes-crises.js (0.28.1c size hygiene). Pure mechanical.
// Crises: Tomas Green Tether package + act2_spine_next.
// Pure data only. registerScenes merges this map.

const scenesCrisesA = {

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

};

registerScenes(scenesCrisesA);
