// Sunsplitter — scenes-mid-a-a1.js
// Split from scenes-mid-a.js (0.28.1c size hygiene). Pure mechanical.
// Mid-a: time_pass through self_risk.
// Strict scene shape only: text | choices | onEnter | image
registerScenes({

  time_pass: {
    get text() {
      let base = `Days pass. Or what pass for days on a ship with no sun.

The hull produces a recurring metallic knock that people initially mistake for another person moving in the dark sections. The daylight panels still rise and set on a schedule that no longer means anything.`;

      if (state.flags.priority === "repairs") {
        if (isAlive("mira")) base += `\n\nMira's early work on the seals pays off in small ways. The temporary patches hold better than expected. She has begun sleeping in engineering rather than the common area.`;
        else base += `\n\nThe early seal work pays off in small ways. The temporary patches hold better than expected. Engineering stays occupied even without her.`;
      } else if (state.flags.priority === "ration") {
        base += `\n\nThe rationing is working. Supplies fall more slowly. People move more carefully.`;
        if (isAlive("sela")) base += ` Sela has stopped asking for more paste.`;
        if (isAlive("amara")) base += ` Amara has started weighing every tray twice.`;
      } else if (state.flags.priority === "planet") {
        if (isAlive("jiro") && isAlive("sela")) base += `\n\nJiro spends hours with the planetary data. He has begun teaching Sela the orbital mechanics of a world without a star. She listens as if the numbers might become a sky.`;
        else if (isAlive("jiro")) base += `\n\nJiro spends hours with the planetary data. The orbital mechanics of a world without a star fill the quiet cycles.`;
        else base += `\n\nThe planetary data keeps updating. Someone still reads the orbital mechanics of a world without a star.`;
      }

      if (state.flags.hydro === "full") {
        base += `\n\nThe hydroponics trays have begun to green again. People stop by the bay just to look at something living.`;
      }

      return base;
    },
    choices: [
      { text: "Check the status board.", next: "crisis" }
    ]
  },

  crisis: {
    get text() {
      let t = `A pressure alarm cuts the quiet.\n\nDeck 4, section 7 — the same corridor the feedstock argument was about — is reporting a slow leak. The board cannot tell whether the seals are failing or something is chewing through them from the other side.\n\n`;
      if (isAlive("mira")) t += `Mira is already moving. "I need hands and a decision before the differential becomes a problem the patch kits cannot fix."\n\n`;
      if (isAlive("elias")) t += `Elias: "We have three options. All of them cost."\n\n`;
      t += `The ship is asking which resource you are willing to spend.`;
      return t;
    },
    choices: [
      { text: "Cut the section out. Sacrifice the corridor to save the rest.", next: "cut_out", effects: { integrity: -4, cohesion: -3, supplies: -2 }, lean: { future: 1 } },
      { text: "Vent and reseal. Spend air and time.", next: "vent", effects: { supplies: -5, integrity: -1, cohesion: -1 }, lean: { living: 1 }, requires: { supplies: { min: 6 } } },
      { text: "Send someone into the differential. Risk a body for a clean fix.", next: "self_risk", effects: { cohesion: 2 }, lean: { living: 2 } }
    ]
  },

  cut_out: {
    onEnter: () => {
      state.flags.crisis = "cut";
      remember("Cut Deck 4 section 7 out of the pressure map.");
    },
    text: () => {
      let t = `The bulkhead closes. The corridor becomes a sealed tomb of bad air and whatever was trying to get through.\n\n`;
      if (isAlive("mira")) t += `Mira does the cut herself. She does not look at anyone while the torch runs.\n\n`;
      if (isAlive("tomas")) t += `Tomas stands at the new seal for a long time after. "That was someone's berth once."\n\n`;
      t += `The differential stabilizes. The cost is a piece of the ship you will never walk again.`;
      return t;
    },
    choices: [
      { text: "Continue.", next: "aftermath" }
    ]
  },

  vent: {
    onEnter: () => {
      state.flags.crisis = "vent";
      remember("Vent-and-resealed Deck 4 section 7.");
    },
    text: () => {
      let t = `The air leaves in a long, controlled scream. The patch kits go in while the section is still cold.\n\n`;
      if (isAlive("mira")) t += `Mira times the cycle. "We have enough margin for one more of these. After that the boards start lying."\n\n`;
      if (isAlive("amara")) t += `Amara: "That air was tomorrow's air. I will remember the number."\n\n`;
      t += `The seal holds. The ship is a little thinner.`;
      return t;
    },
    choices: [
      { text: "Continue.", next: "aftermath" }
    ]
  },

  self_risk: {
    onEnter: () => {
      state.flags.crisis = "risk";
      remember("Sent a body into the differential to fix Deck 4.");
    },
    get text() {
      let t = `Someone goes in with a suit and a kit. The differential is not dramatic — it is just wrong, and the body inside it is the only sensor that can feel how wrong.\n\n`;
      if (isAlive("mira")) t += `Mira talks them through every step on a private channel. She does not raise her voice.\n\n`;
      if (isAlive("elias")) t += `Elias stands at the lock with a timer. "If the primary shear ring binds, you have twelve seconds."\n\n`;
      t += `The fix holds. The body comes back. The cost is written in the suit telemetry and in the way the crew looks at the next open hatch.`;
      return t;
    },
    choices: [
      { text: "Continue.", next: "aftermath", effects: { cohesion: 4, supplies: -1 } }
    ]
  },
});
