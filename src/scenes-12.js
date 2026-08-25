// Sunsplitter — scenes-12.js
// 0.28.1c size hygiene. Pure mechanical. crises: tether manifest + truth + lie + spine_next
// Strict scene shape only: text | choices | onEnter | image
registerScenes({

  act2_tether_manifest: {
    image: "images/act2_tether_manifest.jpg",
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
    image: "images/act2_tether_lie.jpg",
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

});
