// Sunsplitter — scenes-49.js
// 0.28.1c size hygiene. Pure mechanical. crewpairs: mira + tomas + tomas_r
// Strict scene shape only: text | choices | onEnter | image
registerScenes({

  offshift_mira: {
    image: "images/quiet_mira.jpg",
    onEnter: () => {
      state.flags.junctionChoice = "mira";
      state.flags.mira_fault_known = true;
      remember("was told about the weld behind junction seventeen");
    },
    get text() {
      let t = `Junction seventeen, deck two. The access panel is already off, her worklight clipped to her collar, and the hour smells of hot flux and cold metal — solder smoke curling up through the lamp beam, unhurried, the first smoke on this ship in weeks that doesn't mean anything. She works the iron with the hand that still reads temperature. The other one she uses for holding things now. She doesn't mention it, so neither do you.\n\n`;
      t += `"The weld behind this panel. I rebuilt it in the dark during the crisis with forty percent of the correct filler and one hundred percent of the available time. Sixty percent it holds to landfall, error of ten either side. Sixty is not a number I log. A number without a root cause is a rumor in a uniform."\n\n`;
      t += `She hands you the worklight so you'll look where she's looking. "Nobody else knows the panel comes off in one move. Now two people do. You're the only redundancy I've got that isn't made of the same alloy as me. If it lets go, you'll know what's behind the alarm before the alarm does."`;
      if (state.romance.mira) {
        t += `\n\n"Your pulse is down eight from the hatch. Mine isn't. Noted for the record. Stay while I close this up, or don't — but decide before I re-solder, I only heat this once."`;
      }
      const close = closingPartnerLine();
      if (close) t += `\n\n` + close;
      return t;
    },
    get choices() {
      const c = [
        { text: "Keep it between the two of you.", next: "faction_split" },
        { text: "Order it into the log anyway.", next: "faction_split", effects: { cohesion: -1 } }
      ];
      if (state.romance.mira) {
        c.push({ text: "Stay while she closes it up.", next: "faction_split" });
      }
      return c;
    }
  },

  offshift_tomas: {
    image: "images/quiet_tomas.jpg",
    onEnter: () => {
      state.flags.junctionChoice = "tomas";
    },
    get text() {
      let t = "";
      if (!state.flags.trays_dead) {
        t += `The grow deck at night is the warmest room on the ship and the only one that smells alive — wet soil under the lamps, the green breathing out what everyone else breathed in all day. He's eating standing up, unhurried, and hands you a bowl without asking. The chard in it came up crooked. "Grows away from the lamp like it knows something," he says.\n\n`;
      } else {
        t += `The grow deck is clean and dead and he eats paste in it anyway, at the empty racks, on purpose. He hands you a ration without asking. "We eat it here so the room stays a room," he says. "Rooms die when you stop eating in them."\n\n`;
      }
      // MAKE iff promises.tomas absent
      if (!state.promises.tomas) {
        t += `He tastes the soil first, bare-handed, the way he does, and then looks at you the way he doesn't. "I want six words, said where I can hear them. If the vault and the living need the same mercy, the living get it. That's the whole ask. Words are cheap tonight. That's exactly when they're worth taking."`;
      } else {
        // BREAK-ASK or FLOOR
        const made = [];
        if (state.promises.lena === "made") made.push("lena");
        if (state.promises.sela === "made") made.push("sela");
        if (state.promises.elias === "made") made.push("elias");
        if (state.promises.mira === "made") made.push("mira");
        // priority lena > sela > elias > mira
        const priority = ["lena", "sela", "elias", "mira"];
        const named = priority.find(p => made.includes(p));
        if (named) {
          const names = { lena: "Lena", sela: "Sela", elias: "Elias", mira: "Mira" };
          t += `He sets his bowl down. "You made a promise once, with witnesses. I've been running the cost of keeping it, and the cost lands on somebody breathing. ${names[named]}. A promise kept at the wrong price is pride with a receipt. If it comes to that, break it in daylight, with me standing there, and I'll carry my share of the breaking. That's the ask. Nobody makes it twice."`;
        } else {
          t += `He doesn't ask for anything. He counts the room the way he counts trays, names not numbers, and puts yours last so the count ends on someone still deciding things. "That's the whole meal," he says. "Eat."`;
        }
      }
      return t;
    },
    get choices() {
      if (!state.promises.tomas) {
        return [
          { text: "Say the six words.", next: "offshift_tomas_r", flag: { prom_tomas: true } },
          { text: "Refuse the words.", next: "offshift_tomas_r" }
        ];
      }
      const made = ["lena", "sela", "elias", "mira"].some(p => state.promises[p] === "made");
      if (made) {
        return [
          { text: "Agree to weigh it in daylight.", next: "faction_split" },
          { text: "Tell him a promise is a promise.", next: "faction_split" }
        ];
      }
      return [
        { text: "Eat with him.", next: "faction_split" },
        { text: "Take yours and go.", next: "faction_split" }
      ];
    }
  },

  offshift_tomas_r: {
    image: "images/quiet_tomas.jpg",
    onEnter: () => {
      // 0.28.1: never leave an untestable "made" from Off-Shift.
      // Accept = pure Off-Shift vow → "kept" immediately; refuse → "declined".
      if (!state.promises.tomas) {
        state.promises.tomas = state.flags.prom_tomas ? "kept" : "declined";
        if (state.promises.tomas === "kept") {
          remember("If the vault and the living need the same mercy, the living get it.");
        }
      }
    },
    get text() {
      let t = "";
      if (state.flags.prom_tomas) {
        t = `He nods once, the way he does at a tray that's finally rooted. "Heard. Witnessed by me and the chard." Your name, not your rank, the whole rest of the hour.`;
      } else {
        t = `He goes back to his bowl. "Then I'll guard what I guard and count what I count, Commander." Rank, not name. The room stays warm. He doesn't.`;
      }
      const close = closingPartnerLine();
      if (close) t += `\n\n` + close;
      return t;
    },
    choices: [ { text: "Finish the meal.", next: "faction_split" } ]
  },

});
