// Sunsplitter — scenes-10.js
// 0.28.1c size hygiene. Pure mechanical. crises: tether sighting + vent + rush
// Strict scene shape only: text | choices | onEnter | image
let act2TetherAllusionsOnEntry = { elias: false, amara: false };

registerScenes({

  // PRE: tether sighting, living speaker, made unalluded promise | WRITES: consumes Elias/Amara allusion flags on entry
  // DEATH: none | DEAD SPEECH/APPEARANCE: Elias/Amara prose is living-gated | IMAGE: existing debris-field plate
  act2_tether_sighting: {
    image: "images/debris_field.jpg",
    onEnter: () => {
      act2TetherAllusionsOnEntry = {
        elias: isAlive("elias") && state.promises.elias === "made" && !state.flags.prom_elias_alluded,
        amara: isAlive("amara") && state.promises.amara === "made" && !state.flags.prom_amara_alluded
      };
      if (act2TetherAllusionsOnEntry.elias) state.flags.prom_elias_alluded = true;
      if (act2TetherAllusionsOnEntry.amara) state.flags.prom_amara_alluded = true;
    },
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
        if (state.promises.elias === "made" && act2TetherAllusionsOnEntry.elias) {
          t += `\n\n"Deck Four pushed back another fragment last night. When it finishes, I hold you to the order of operations."`;
        }
      }
      if (isAlive("lena")) t += `\n\n"If Tomas is alive in there, he's been living on sprouted seed stock and reclaimed water," Lena says. "Malnourished, half-blind from the lamps, and treatable. Dead isn't. Factor that."`;
      if (isAlive("amara")) {
        t += `\n\nAmara doesn't look away from the green light. "That's Tomas and every growing thing we own, on one bad rope. You'll not be offered a cheaper miracle than eleven hundred liters. You'll also never drink a miracle."`;
        // 0.27.2 allusion carrier — one-shot, anti-gotcha only
        if (state.promises.amara === "made" && act2TetherAllusionsOnEntry.amara) {
          t += `\n\n"The beds are holding. So is your line in my book. I reread it when the air runs thin."`;
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

});
