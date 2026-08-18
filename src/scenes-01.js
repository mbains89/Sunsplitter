// Sunsplitter — scenes-01.js
// 0.28.2 size hygiene. Pure mechanical. mid-a: time_pass + crisis
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
        if (isAlive("amara")) base += ` Amara sleeps less and talks more.`;
      } else if (state.flags.hydro === "minimal") {
        base += `\n\nThe remaining plants are barely surviving. The bay smells of damp failure.`;
        if (isAlive("amara")) base += ` Amara works in silence.`;
      }

      if (state.flags.power === "cut") {
        base += `\n\nLarge sections of the ship remain dark. The observation blister is cold and unused. People stay closer together in the lit areas.`;
      } else if (state.flags.power === "burn") {
        if (isAlive("mira")) base += `\n\nSystems remain online, but Mira has already written off any realistic chance of restoring full drive power without a miracle.`;
        else base += `\n\nSystems remain online, but any realistic chance of restoring full drive power has already been written off.`;
      }

      if (state.flags.planet === "committed") {
        base += `\n\nThe course remains locked on the rogue planet. Fourteen months. No one speaks of turning back, but no one speaks of arrival either.`;
      } else {
        base += `\n\nYou still have no destination. The ship drifts. Purpose is a resource you have not yet spent.`;
      }

      // v0.08 delayed personal echoes
      if (hasMark("sela", "spoken") && isAlive("sela")) {
        base += `\n\nSela has fixed a second yellow circle beside the first — same diameter, cleaner line. No one has taken either down.`;
      }
      if (hasMark("mira", "drive_first") && isAlive("mira")) {
        base += `\n\nMira has begun leaving short technical notes for you on the engineering hatch. They are not requests. They are facts she wants on the record.`;
      }
      if (hasMark("amara", "plants_matter") && isAlive("amara")) {
        base += `\n\nAmara left a second leaf on the common-area table. It is already browning. No one has thrown it away.`;
      }
      if (state.deathCause.rourke) {
        base += `\n\nSomeone has moved Rourke's body bag to a colder section. The corner of medical is empty now. The absence is noticed.`;
      }

      base += `\n\nThen the alarm sounds.`;
      base += `\n\nIn the quiet cycles the ship shows its original scale: corridors that never warm fully, a mess hall with nine places set and a hundred left stacked, a PA system that still has channels labeled for departments that do not exist on this voyage.`;
      if (isAlive("mira") && state.flags.power === "risk") {
        base += ` Mira's risky grid still holds. Competence without applause.`;
      }
      if (state.flags.stores === "seize") {
        if (isAlive("elias")) base += ` The seized private stores sit in a locked cabinet Elias checks twice a cycle.`;
        else base += ` The seized private stores sit in a locked cabinet someone still checks twice a cycle.`;
      } else if (state.flags.stores === "ignore") {
        base += ` Somewhere, small private stores remain. The ship has not forgotten the exception.`;
      }
      if (state.flags.ship_memory === "open_wound") {
        base += ` Deck 4's soft seal still appears on every status walk-through. Someone always notices.`;
      } else if (state.flags.ship_memory === "jury_rig") {
        base += ` The jury-rigged Deck 4 seal holds for now. Mira's notes call it provisional.`;
      }

      return base;
    },
    choices: [
      { text: "Go to the alarm yourself.", next: "crisis", effects: { cohesion: 2 } },
      { text: "Order Mira and Elias ahead. You follow.", next: "crisis", effects: { integrity: 1 } }
    ]
  },
  crisis: {
    get text() {
      // 0.22.0: Jiro/Tomas may still be missing; name only the living trapped
      const trapped = ["Amara Vale"];
      if (isAlive("jiro")) trapped.push("Jiro Okada");
      trapped.push("Sela"); // Sela always present early
      const countWord = trapped.length === 3 ? "Three" : "Two";
      let t = `The alarm is not loud. It does not need to be.

Life support on the lower habitation ring is failing. CO₂ climbing. ${countWord} people are trapped behind a warped bulkhead: ${trapped.join(", ")}.

Mira is already at the panel.`;

      if (state.flags.priority === "repairs") {
        t += `\n\n"The seals we reinforced earlier are buying us minutes. I can try to cut them out. The risk of cascade is lower than it would have been."`;
      } else {
        t += `\n\n"I can vent the section and save the rest of the ship, or I can try to cut them out. Cutting risks a cascade. If I fail, we lose more than ${trapped.length === 3 ? "three" : "two"}."`;
      }

      if (state.flags.priority === "ration") {
        t += `\n\nThe trapped have been on reduced oxygen for two days. They will not last as long as they should.`;
      }

      t += `\n\nElias: "Vent it. Now."

Lena: "Sela is in there."

`;
      if (isAlive("tomas")) t += `Tomas looks only at you.\n\n`;
      t += `You have less than four minutes.`;
      return t;
    },
    choices: [
      { text: "Cut them out. We do not leave people behind a wall.", next: "cut_out", effects: { integrity: -14, cohesion: 12 }, flag: { crisis: "cut" }, lean: { living: 5 }, affinity: { amara: 10, jiro: 8, sela: 10, elias: -6 } },
      { text: "Vent the section. Protect the ship and the majority.", next: "vent", effects: { integrity: 5, cohesion: -18 }, flag: { crisis: "vent" }, lean: { future: 5 }, affinity: { elias: 10, lena: -15, tomas: -12 } },
      { text: "Go yourself. Buy time with your own body.", next: "self_risk", effects: { integrity: -7, cohesion: 8, supplies: -4 }, flag: { crisis: "self" }, lean: { living: 3 }, affinity: { mira: 6, lena: 8 } }
    ]
  },
});
