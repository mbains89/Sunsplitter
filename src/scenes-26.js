// Sunsplitter — scenes-26.js
// 0.28.1c size hygiene. Pure mechanical. late: reckon public + suppress + memory + truth
// Strict scene shape only: text | choices | onEnter | image
registerScenes({

  reckon_public: {
    get text() {
      let t = `You gather the living in the common area.

You do not soften what was done. You name the dead if there are dead. You name the living. You state the costs in supplies, hull, and time.

Some cry. Some stare at the floor.`;
      if (isAlive("tomas")) t += ` Tomas nods through the entire accounting.`;
      t += `\n\n`;
      if (isAlive("mira")) {
        t += `When it is finished, Mira stands.

"We're still here. That's the only order that matters."

The others rise, unevenly.`;
      } else {
        t += `When it is finished, the room does not produce a speech. The others rise, unevenly.`;
      }
      return t;
    },
    choices: [
      { text: "Hold the room a moment longer. Then decide the mission.", next: "sun_payoff", effects: { cohesion: 2 } },
      { text: "End it. Make the final order now.", next: "sun_payoff" }
    ]
  },
  reckon_suppress: {
    get text() {
      let t = `You issue the order: no further discussion of the crisis. Work continues. Rations continue. The ship continues.

`;
      if (isAlive("elias")) t += `Elias enforces it without being asked.\n\n`;
      else t += `Compliance is enforced without being asked.\n\n`;
      t += `The silence that follows is different from the earlier silence. It has edges.

`;
      if (isAlive("tomas")) t += `Tomas stops leading the quiet evening gatherings. `;
      if (isAlive("amara")) t += `Amara no longer meets anyone's eyes.`;
      t += `\n\nOrder holds. Something else does not.`;
      return t;
    },
    choices: [
      { text: "Let the silence stand. Make the final order.", next: "sun_payoff", effects: { cohesion: -2 } },
      { text: "Break it once — name one cost — then decide the mission.", next: "sun_payoff", effects: { cohesion: 1 } }
    ]
  },
  reckon_memory: {
    get text() {
      if (state.flags.crisis === "vent") {
        let t = `You give the remaining survivors the right to decide how the dead are remembered.\n\nThey keep Sela's last circle on the bulkhead. They keep Amara's key on a shelf in the common area.`;
        t += isAlive("tomas")
          ? ` Tomas speaks the three names once, carefully, and then does not speak them again.`
          : ` The three names are read off the manifest once, by whoever is holding it, and then not again.`;
        t += `\n\nAfter that, the ship feels slightly less like a place where people disappear without record.`;
        return t;
      }
      return `You give the survivors the right to decide how the near-loss is remembered.

They do not make a ceremony. They simply refuse to pretend it did not happen. Sela's yellow circle stays where it is — a quiet adult mark no one has asked to take down.

The ship continues.`;
    },
    choices: [
      { text: "Let the memory stand. Make the final order.", next: "sun_payoff", effects: { cohesion: 2 } },
      { text: "Close it. The mission still needs a decision.", next: "sun_payoff" }
    ]
  },
  reckon_truth: {
    text: `You tell them the truth you have been carrying.

The rogue planet may have water under the ice. It may have nothing. Fourteen months is a long time for a damaged ship and a small group of people who have already begun to break.

You ask what they still want from the time that remains.

The answers are not unified. Some want the planet. Some want speed. Some want comfort. Some want a final transmission aimed at nothing in particular.

You listen. Then you decide.`,
    choices: [
      { text: "You have heard enough. Make the final order.", next: "sun_payoff" },
      { text: "Ask one more person what they still want. Then decide.", next: "sun_payoff", effects: { cohesion: 2, supplies: -1 } }
    ]
  },
});
