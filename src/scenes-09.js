// Sunsplitter — scenes-09.js
// 0.28.1c size hygiene. Pure mechanical. mid-a: arc_living_3 + living_4 + vault_sacrifice
// Strict scene shape only: text | choices | onEnter | image
registerScenes({

  arc_living_3: {
    get text() {
      // Reactive crew conflict — branches on prior behavior
      let t = `The conflict does not wait for a meeting.\n\n`;
      const hard = state.flags.leadership === "hard";
      const seized = state.flags.stores === "seize";
      const vented = state.flags.crisis === "vent";
      const futurePri = state.flags.vault_priority === "future";

      if (isAlive("tomas") && (hard || seized || futurePri)) {
        t += `Tomas blocks the corridor outside the common area. Not with a weapon. With a refusal.\n\n`;
        if (hard) t += `"Your hard rules are turning the living into inventory. I will not help enforce the next cut."\n\n`;
        else if (seized) t += `"You seized food to teach a lesson. The lesson landed. So did the line between us."\n\n`;
        else t += `"You said the future justifies the cost. I am done pretending that sentence is neutral."\n\n`;
        if (vented) t += `He does not mention the bulkhead. He does not have to. Everyone still feels the missing air.\n\n`;
        t += `Elias, if he is present, waits to see whether you treat this as mutiny or information.`;
      } else if (isAlive("amara") && hasMark("amara", "plants_matter") && state.flags.hydro === "minimal") {
        t += `Amara has shut down a recycler branch without authorization to keep one tray alive.\n\n`;
        t += `"You told me living things matter. Then you starved them. I chose the tray. Write me up or live with it."\n\n`;
        t += `The ship remembers what you promised when it was still cheap.`;
      } else if (isAlive("lena") && state.flags.lena_authority === false) {
        t += `Lena has treated a wound with stock you did not approve. She does not apologize.\n\n`;
        t += `"I will not wait for signatures while someone bleeds. You wanted control. This is what control costs in trust."\n\n`;
      } else {
        const miraPresent = isAlive("mira");
        const eliasPresent = isAlive("elias");
        if (miraPresent && eliasPresent) {
          t += `Mira and Elias argue in the open about a parts allocation. The crew stops working to listen.\n\n`;
        } else if (miraPresent) {
          t += `Mira argues in the open about a parts allocation. The crew stops working to listen.\n\n`;
        } else if (eliasPresent) {
          t += `Elias argues in the open about a parts allocation. The crew stops working to listen.\n\n`;
        } else {
          t += `A parts allocation dispute breaks into the open. The crew stops working to listen.\n\n`;
        }
        t += `This is what soft fractures look like before they become factions.`;
      }
      if (state.flags.past === "owned" && isAlive("elias")) {
        t += `\n\nElias's eyes flick to you once. The past you owned in front of him is still on the table between the words.`;
      }
      return t;
    },
    get choices() {
      const routes = [
        { text: "Back down a step. Adjust the rule that caused this.", next: "arc_living_4", effects: { cohesion: 6, integrity: -2, supplies: -2 }, lean: { living: 2 }, affinity: { tomas: 8, lena: 4 }, trust: { tomas: 10 }, mark: { conflict: "backed" } },
        { text: "Hold the line. Refusal does not rewrite orders.", next: "arc_living_4", effects: { cohesion: -8, integrity: 3 }, lean: { future: 2 }, affinity: { elias: 8, tomas: -8 }, trust: { elias: 8, tomas: -12 }, mark: { conflict: "held" } }
      ];
      const enabled = routes.some(choice =>
        (!choice.requires || meetsRequirements(choice.requires)) &&
        (!choice.effects || canAffordEffects(choice.effects))
      );
      if (!enabled) {
        routes.push({ text: "Walk past. Do not answer the corridor.", next: "arc_living_4" });
      }
      return routes;
    }
  },

  arc_living_4: {
    get text() {
      let t = `Power, food, and hull come due on the same board.\n\n`;
      t += `You can stabilize the ring for another stretch by burning supply margin. You can protect the margin and accept colder corridors. You can ask the crew to work a double cycle for a temporary patch that will fail later.\n\n`;
      if (hasMark("conflict", "held") && isAlive("tomas")) {
        t += `Tomas is present and silent. Holding the line earlier has a cost in how he looks at the options.\n\n`;
      }
      if (hasMark("conflict", "backed") && isAlive("elias")) {
        t += `Elias: "Every time you bend, the next refusal gets cheaper."\n\n`;
      }
      if (state.flags.cascade_truth === "open") {
        t += `Someone has written a yellow circle on the status board. It is not Sela's hand.\n\n`;
      }
      t += `There is no clean package. Only which shortage you schedule first.`;
      return t;
    },
    get choices() {
      const routes = [
        { text: "Burn supplies to keep the ring warm and lit.", next: "vault_sacrifice", effects: { supplies: -8, cohesion: 5, integrity: 3 }, lean: { living: 3 }, affinity: { amara: 4, lena: 4 }, requires: { supplies: { min: 10 } } },
        { text: "Protect the margin. Accept colder habitation.", next: "vault_sacrifice", effects: { supplies: 3, cohesion: -6, integrity: 2 }, lean: { future: 2 }, affinity: { elias: 5, jiro: 3 } }
      ];
      const enabled = routes.some(choice =>
        (!choice.requires || meetsRequirements(choice.requires)) &&
        (!choice.effects || canAffordEffects(choice.effects))
      );
      if (!enabled) {
        routes.push({ text: "Leave the board as it stands.", next: "vault_sacrifice" });
      }
      return routes;
    }
  },
  vault_sacrifice: {
    get text() {
      const pri = state.flags.vault_priority || "both";
      let t = `A power fault hits the vault and habitation ring at the same time.\n\n${isAlive("mira") ? `Mira can stabilize only one grid fully.` : ""} The other will take irreversible damage. The embryo count will not recover from a living choice; the living will not recover from a full vault divert.\n\n`;
      if (pri === "future") {
        t += `You already said the future is what matters. ${isAlive("elias") ? `Elias watches to see if you meant it.` : ""}\n\n`;
      } else if (pri === "living") {
        t += `You already said the living come first. The vault panel is still cycling viability percentages in the corner of your vision.\n\n`;
      } else {
        t += `You tried to protect both. The ship is no longer offering that luxury.\n\n`;
      }
      if (isAlive("elias")) t += `Elias: "If the vault dies, this was just a slow funeral with better lighting. Feed the future."\n\n`;
      if (isAlive("jiro")) t += `Jiro: "The trajectory was always for the package. We were the escort."\n\n`;
      if (isAlive("lena")) t += `Lena: "I can treat the people in this room. I cannot treat a percentage on a screen."\n\n`;
      if (isAlive("tomas")) t += `Tomas: "Whatever you choose, someone will carry it. Choose knowing that."\n\n`;
      if (isAlive("amara")) t += `Amara: "The trays are still green. That is not a percentage. That is breath."\n\n`;
      if (isAlive("sela")) t += `Sela says nothing. Her latest yellow circle is taped above the vault hatch.\n\n`;
      if (isAlive("mira")) t += `Mira waits on the switch. "I need an order."`;
      return t;
    },
    get choices() {
      const routes = [
        { text: "Divert everything to the vault. Protect the embryos and the restart package.", next: "intimacy_window", effects: { integrity: -10, cohesion: -12, supplies: -6 }, flag: { vault_sacrifice: "future" }, lean: { future: 10 }, affinity: { elias: 12, jiro: 10, lena: -10, tomas: -12, amara: -8 }, trust: { elias: 15, jiro: 12, lena: -12, tomas: -15 }, requires: { integrity: { min: 15 }, supplies: { min: 8 } } },
        { text: "Divert everything to life support and habitation. Protect the living.", next: "intimacy_window", effects: { embryos: -28, integrity: 5, cohesion: 8, supplies: 4 }, flag: { vault_sacrifice: "living" }, lean: { living: 10 }, affinity: { lena: 12, tomas: 12, amara: 10, elias: -12, jiro: -10 }, trust: { lena: 14, tomas: 15, elias: -14, jiro: -12 } }
      ];
      const enabled = routes.some(choice =>
        (!choice.requires || meetsRequirements(choice.requires)) &&
        (!choice.effects || canAffordEffects(choice.effects))
      );
      if (!enabled) {
        routes.push({ text: "No grid can take a full divert. Let both degrade.", next: "intimacy_window", effects: { embryos: -12, integrity: -5, cohesion: -4 }, flag: { vault_sacrifice: "split" }, lean: { future: 3, living: 3 }, affinity: { mira: 6 } });
      }
      return routes;
    }
  }
});
