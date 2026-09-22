// Sunsplitter — scenes-26.js
// 0.28.1c size hygiene. Pure mechanical. late: reckon public + suppress + memory + truth
// Strict scene shape only: text | choices | onEnter | image
registerScenes({

  reckon_public: {
    get text() {
      let t = `You gather the living in the common area.\n\nYou do not soften what was done. You name the dead if there are dead. You name the living. You state the costs in supplies, hull, and time.\n\nSome cry. Some stare at the floor.`;
      // SUN-CASCADE-SECOND-FLAG-PAYOFF-01: late pay of midgame manifest write.
      if (state.flags.manifest === "read") {
        t += isAlive("tomas")
          ? ` Tomas does not ask for the boarding list. Two hundred fourteen confirmed berths are already in the accounting.`
          : ` The boarding list is already in the accounting. Two hundred fourteen confirmed berths. No one has to open the tablet.`;
      } else if (state.flags.manifest === "declined") {
        t += isAlive("tomas")
          ? ` Tomas nods through estimates. You let the manifest stay closed; the accounting has no names to point at.`
          : ` The accounting uses estimates. You let the manifest stay closed.`;
      } else if (isAlive("tomas")) {
        t += ` Tomas nods through the entire accounting.`;
      }
      t += `\n\n`;
      if (isAlive("mira")) {
        t += `When it is finished, Mira stands.\n\n"We're still here. That's the only order that matters."\n\nThe others rise, unevenly.`;
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
      let t = `You issue the order: no further discussion of the crisis. Work continues. Rations continue. The ship continues.\n\n`;
      if (isAlive("elias")) t += `Elias enforces it without being asked.\n\n`;
      else t += `Compliance is enforced without being asked.\n\n`;
      t += `The silence that follows is different from the earlier silence. It has edges.\n\n`;
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
      return `You give the survivors the right to decide how the near-loss is remembered.\n\nThey do not make a ceremony. They simply refuse to pretend it did not happen. Sela's yellow circle stays where it is — a quiet adult mark no one has asked to take down.\n\nThe ship continues.`;
    },
    choices: [
      { text: "Let the memory stand. Make the final order.", next: "sun_payoff", effects: { cohesion: 2 } },
      { text: "Close it. The mission still needs a decision.", next: "sun_payoff" }
    ]
  },
  reckon_truth: {
    // SUN-STILL-BURNING-CORRIDOR-01 / PX6-F02: pay course_briefed; keep months line otherwise.
    get text() {
      const destination = state.flags.course_briefed
        ? `The rogue planet may have water under the ice. It may have nothing. The verified corridor is day 181 through day 184, one pass. That is still a long time for a damaged ship and a small group of people who have already begun to break.`
        : `The rogue planet may have water under the ice. It may have nothing. Fourteen months is a long time for a damaged ship and a small group of people who have already begun to break.`;
      return `You tell them the truth you have been carrying.\n\n${destination}\n\nYou ask what they still want from the time that remains.\n\nThe answers are not unified. Some want the planet. Some want speed. Some want comfort. Some want a final transmission aimed at nothing in particular.\n\nYou listen. Then you decide.`;
    },
    choices: [
      { text: "You have heard enough. Make the final order.", next: "sun_payoff" },
      { text: "Ask one more person what they still want. Then decide.", next: "sun_payoff", effects: { cohesion: 2, supplies: -1 } }
    ]
  },
});

// SUN-STILL-BURNING-CORRIDOR-01 — wrap buildStillBurningText after engine.js loads.
// engine.js is too large to remint; this file already shares the Fourteen-months lie.
(function wireStillBurningCorridor() {
  function wrap() {
    if (typeof buildStillBurningText !== "function") return;
    if (buildStillBurningText.__ssCorridorWired) return;
    const prior = buildStillBurningText;
    function buildStillBurningTextCorridor(crisis, shape, final, planet) {
      const text = prior(crisis, shape, final, planet);
      if (final === "hold" && state && state.flags && state.flags.course_briefed) {
        return String(text).replace(
          "The course remains locked on the rogue planet. Fourteen months. No guarantee.",
          "The course remains locked on the rogue planet. Verified corridor: day 181 through day 184. One pass."
        );
      }
      return text;
    }
    buildStillBurningTextCorridor.__ssCorridorWired = true;
    buildStillBurningText = buildStillBurningTextCorridor;
  }
  if (typeof document !== "undefined" && document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", wrap);
  } else {
    wrap();
  }
})();
