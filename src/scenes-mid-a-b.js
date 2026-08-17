// Sunsplitter — scenes-mid-a-b.js
// Split from scenes-mid-a.js (0.28.1c size hygiene). Pure mechanical.
// Mid-a: arc_fork through vault_sacrifice.
// Strict scene shape only: text | choices | onEnter | image
// Extends global `scenes` object.

registerScenes({

  arc_fork: {
    get text() {
      const shape = ideologyShape();
      let t = `The quiet after the vault voice does not last.\n\n`;
      t += `Two kinds of work are waiting. One lives in the numbers — drive, trajectory, the restart package that still draws power in the cold. The other lives in the warm sections — air, food, the people who still argue in the corridors.\n\n`;
      if (shape === "future") t += `You have already leaned toward the future. The ship has noticed.\n\n`;
      else if (shape === "living") t += `You have already leaned toward the living. The ship has noticed.\n\n`;
      else t += `You have not yet forced the ship to choose a single language.\n\n`;
      t += `Leadership is a separate question from ideology. You can hold hard rules and still protect the living. You can speak softly and still feed the vault. The next stretch of the voyage will not let you pretend those are the same choice.\n\n`;
      t += `Embryo viability, hull, and cohesion will all be asked to pay. The board already knows which meters are soft.\n\n`;
      t += `Where do you put your weight?`;
      return t;
    },
    choices: [
      { text: "The future work. Drive, vault, trajectory — keep the restart package honest.", next: "arc_future_1", flag: { mid_arc: "future" }, lean: { future: 4 }, affinity: { elias: 4, jiro: 4, mira: 3 } },
      { text: "The living work. Habitation, food, the people who still have names.", next: "arc_living_1", flag: { mid_arc: "living" }, lean: { living: 4 }, affinity: { lena: 4, tomas: 4, amara: 3, sela: 3 } }
    ]
  },

  arc_future_1: {
    get text() {
      let t = `Engineering smells of ozone and overheated insulation.\n\n`;
      if (isAlive("mira")) {
        t += `Mira Solis has the drive schematic spread across three cracked screens. She does not look up when you enter.\n\n`;
        t += `"The primary is dead. Auxiliary will not carry a colony burn. I can cannibalize habitation relays for a partial restart — or I can keep those relays where they keep people breathing."\n\n`;
        if (hasMark("mira", "drive_first")) t += `She already knows which answer you gave her once.\n\n`;
        if (state.flags.leadership === "hard") t += `Under hard rules she works faster and talks less.\n\n`;
      } else {
        t += `The drive schematic runs without its engineer. The board does not care who reads it.\n\n`;
      }
      if (isAlive("elias")) t += `Elias stands at the hatch. "Every hour we spend on comfort is an hour the package spends closer to a dead battery."`;
      return t;
    },
    choices: [
      { text: "Cannibalize habitation relays. Get the drive to answer, even partially.", next: "arc_future_2", effects: { integrity: 6, cohesion: -6, supplies: -3 }, lean: { future: 3 }, affinity: { mira: 6, elias: 6, lena: -4 }, trust: { mira: 4, elias: 5, lena: -4 } },
      { text: "Leave habitation alone. Find another path that does not steal breath.", next: "arc_future_2", effects: { cohesion: 4, integrity: -2, supplies: -5 }, lean: { living: 2 }, affinity: { lena: 5, mira: 2 }, requires: { supplies: { min: 10 } } },
      { text: "Order a limited pull — enough for diagnostics, not a full restart.", next: "arc_future_2", effects: { integrity: 2, supplies: -4, cohesion: -1 }, lean: { future: 1 }, affinity: { mira: 4 } }
    ]
  },

  arc_future_2: {
    get text() {
      let t = ``;
      const emb = state.embryos || 100;
      if (isAlive("jiro")) {
        t += `Jiro meets you at the vault hatch with a tablet and a face that has not slept.\n\n`;
        t += `"Embryo viability is ${emb}%. Power draw is not. If we keep the current grid split, we will lose percentage points every cycle we refuse to name."\n\n`;
        t += `He scrolls. Names of genetic lines. A mission profile that still assumes a destination with a sky.\n\n`;
        t += `"I can lock the vault into conservation mode. Habitation takes the brownouts — cold corridors, tighter rations, people noticing who the package ranks above. Or we keep the brownouts off the living and accept a permanent bleed in the cylinders. The ceiling does not recover."\n\n`;
      } else {
        t += `The vault hatch is unmanned. The board still reports: embryo viability ${emb}%, power draw not. Conservation mode or permanent slow bleed. The numbers do not soften without him.\n\n`;
      }
      if (emb < 70) {
        t += `The count is already wounded. Full conservation will only hold what is left; it will not restore what was spent.\n\n`;
      }
      if (isAlive("elias") && state.flags.leadership === "together") {
        t += `Elias: "Soft leadership does not change thermodynamics. It only changes who gets blamed for the brownouts."`;
      } else if (isAlive("elias")) {
        t += `Elias does not bother to argue. He is already counting which brownouts he can enforce and which people will notice.`;
      } else if (isAlive("lena")) {
        t += `Lena, if she is near: "Every brownout is a medical problem I will have to solve with fewer supplies."`;
      }
      return t;
    },
    choices: [
      { text: "Lock conservation mode. Habitation takes the brownouts.", next: "arc_future_3", effects: { embryos: 5, cohesion: -9, integrity: -4, supplies: -3 }, lean: { future: 4 }, affinity: { jiro: 8, elias: 6, tomas: -8, lena: -4 }, trust: { jiro: 6, tomas: -6 }, requires: { embryos: { min: 55 } } },
      { text: "Refuse the brownouts. Accept the permanent vault bleed.", next: "arc_future_3", effects: { embryos: -10, cohesion: 6, supplies: -2 }, lean: { living: 3 }, affinity: { tomas: 7, lena: 5, jiro: -6 }, flag: { embryo_ceiling: "lowered" } },
      { text: "Split the pain on a schedule. Publish the numbers to the crew.", next: "arc_future_3", effects: { embryos: -3, cohesion: 2, supplies: -4 }, lean: { future: 1, living: 1 }, requires: { cohesion: { min: 28 } } }
    ]
  },

  arc_future_3: {
    get text() {
      let t = `The cascade records were not supposed to open without a dual command key.\n\n`;
      if (isAlive("mira")) {
        t += `Mira finds a bypass in a maintenance layer. What comes up is not engineering data.\n\n`;
      } else {
        t += `A maintenance-layer bypass opens them anyway. What comes up is not engineering data.\n\n`;
      }
      t += `Boarding windows. Priority lists. Atmospheric collapse projections dated before the public alerts. The official story — hours, maybe two days — was the story given to the people on the pads. The people who wrote the manifests had longer.\n\n`;
      if (isAlive("jiro")) t += `Jiro reads without blinking. "They knew enough to choose who the ark was for. We were not a rescue. We were a sample."\n\n`;
      if (isAlive("elias")) t += `Elias: "Then stop mourning the empty bunks as an accident. Treat them as a design."\n\n`;
      if (isAlive("lena")) t += `Lena's voice is flat. "Design or not, the people who did board still bleed."\n\n`;
      t += `The vault framing suddenly looks less like hope and more like the reason the ship existed at all.`;
      return t;
    },
    choices: [
      { text: "Seal the records. The crew cannot use this truth yet.", next: "arc_future_4", effects: { cohesion: 2, integrity: 1 }, flag: { cascade_truth: "sealed" }, lean: { future: 2 }, affinity: { elias: 5 } },
      { text: "Tell the senior crew. No more official stories between us.", next: "arc_future_4", effects: { cohesion: -5, supplies: -1 }, flag: { cascade_truth: "senior" }, lean: { living: 1 }, affinity: { lena: 4, tomas: 4, jiro: 3 } },
      { text: "Broadcast it. The empty ship already knows. The living should too.", next: "arc_future_4", effects: { cohesion: -10, integrity: -2 }, flag: { cascade_truth: "open" }, lean: { living: 2 }, affinity: { tomas: 6, elias: -6 }, trust: { elias: -8, tomas: 6 } }
    ]
  },

  arc_future_4: {
    get text() {
      let t = `A pressure fault opens in the sealed cargo spine`;
      if (isAlive("mira")) t += ` — the abandoned section Mira has been warning about`;
      else t += ` — the abandoned section the board has been flagging`;
      t += `.\n\n`;
      t += `Opening it could yield parts, sealed stores, maybe intact embryo transit gear. It could also vent a corridor you still use.\n\n`;
      if (state.flags.cascade_truth === "open" && isAlive("tomas")) {
        t += `Tomas finds you before you reach the hatch. "If you open that door to feed the vault, say so. Do not call it safety."\n\n`;
      }
      if (state.flags.leadership === "hard" && isAlive("mira")) {
        t += `Mira: "Under your rules I should already be cutting. Give the order or someone else will."\n\n`;
      }
      if (hasMark("mira", "people_first") && isAlive("mira")) {
        t += `She waits longer than the schedule allows. People-first is still a mark she carries.\n\n`;
      }
      t += `What is behind the seal is not neutral. Neither is leaving it closed.`;
      return t;
    },
    choices: [
      { text: "Open it. Take what the future can use.", next: "vault_sacrifice", effects: { supplies: 8, integrity: -8, embryos: 3 }, flag: { abandoned: "opened" }, lean: { future: 3 }, requires: { integrity: { min: 28 } } },
      { text: "Leave it sealed. Some risks are not worth the parts.", next: "vault_sacrifice", effects: { cohesion: 3, integrity: 2 }, flag: { abandoned: "sealed" }, lean: { living: 1 } },
      { text: "Remote scan only. Spend power, not hull.", next: "vault_sacrifice", effects: { supplies: -5, integrity: -1, cohesion: 1 }, flag: { abandoned: "scanned" }, requires: { supplies: { min: 8 }, trust: { mira: 35 } }, alive: "mira" }
    ]
  },

  arc_living_1: {
    get text() {
      let t = `The habitation ring is warmer than the rest of the ship — and failing in smaller, meaner ways.\n\n`;
      if (isAlive("amara")) {
        t += `Amara Vale has rerouted a water line with her own hands. The house key from Lagos hangs at her throat while she works.\n\n`;
        t += `"I can keep the trays and the wash cycle if you give me supply margin. Or I can shut the green down to keep the recyclers honest."\n\n`;
        if (hasMark("amara", "plants_matter")) t += `She already heard you say living things matter. She is waiting to see if that was a sentence or a policy.\n\n`;
        if (hasMark("amara", "math_first")) t += `She does not look at you when she speaks. The math-first answer still sits between you.\n\n`;
      } else {
        t += `The trays run without their keeper. The recyclers do not care about grief.\n\n`;
      }
      if (isAlive("lena") && state.flags.leadership === "hard") {
        t += `Lena, from the hatch: "Hard rules do not grow food. They only decide who goes without."`;
      }
      return t;
    },
    choices: [
      { text: "Give Amara the margin. Keep something green alive.", next: "arc_living_2", effects: { supplies: -6, cohesion: 6, integrity: -2 }, lean: { living: 3 }, affinity: { amara: 10, lena: 3 }, trust: { amara: 8 }, flag: { hydro: "full" }, requires: { supplies: { min: 8 } }, alive: "amara" },
      { text: "Shut the green down. Recyclers and paste first.", next: "arc_living_2", effects: { supplies: 4, cohesion: -5, integrity: 3 }, lean: { future: 2 }, affinity: { amara: -6, elias: 4 }, trust: { amara: -6 } },
      { text: "Split the difference — half trays, tighter wash schedule.", next: "arc_living_2", effects: { supplies: -2, cohesion: 2, integrity: 1 }, lean: { living: 1 }, affinity: { amara: 4 } }
    ]
  },

  arc_living_2: {
    get text() {
      let t = ``;
      if (isAlive("sela")) {
        t += `Sela is not at the bulkhead to be observed. She is working.\n\n`;
        t += `The yellow circle is tighter than last time. Cleaner. When she speaks, it is without asking permission.\n\n`;
        t += `"The panels still run an Earth sunrise. That is a lie with a schedule. I am not trying to replace the sky. I am keeping a measurement the ship keeps trying to delete."\n\n`;
        t += `She turns the plate so you can see the latest version.\n\n`;
        t += `"Jiro thinks I am mourning. He is half right. The other half is refusal. If we only optimize for what survives the dark, we will arrive as the dark."\n\n`;
        if (state.flags.sela_attention === "ignored") t += `She does not mention that you walked past her once. She does not need to.\n\n`;
        if (state.flags.sela_attention === "present" || hasMark("sela", "spoken")) t += `She treats your presence as a fact, not a favor.\n\n`;
        if (isAlive("jiro")) t += `Jiro appears in the hatch, hears the last sentence, and does not correct her.`;
      } else {
        t += `The yellow marks remain on the bulkhead. Their author does not. The ship keeps the pigment and loses the argument.`;
      }
      return t;
    },
    choices: [
      { text: "Tell her refusal is a kind of navigation. Keep the ritual protected.", next: "arc_living_3", effects: { cohesion: 4, supplies: -1 }, lean: { living: 3 }, affinity: { sela: 12, jiro: 6 }, trust: { sela: 10 }, mark: { sela: "spoken" }, flag: { sela_attention: "present" }, alive: "sela" },
      { text: "Ask what she would spend to keep a warm world possible.", next: "arc_living_3", effects: { cohesion: 2 }, lean: { living: 2 }, affinity: { sela: 8 }, trust: { sela: 8 }, mark: { sela: "spoken" }, alive: "sela" },
      { text: "Tell her the ship runs on numbers, not pigment.", next: "arc_living_3", effects: { cohesion: -3, integrity: 1 }, lean: { future: 2 }, affinity: { sela: -4, jiro: -2 }, flag: { sela_attention: "ignored" }, alive: "sela" },
      { text: "Leave the marks where they are.", next: "arc_living_3" }
    ],
    onEnter: () => {
      if (isAlive("sela")) {
        remember("Sela said refusal is half of what the yellow is for.");
        mark("sela", "spoken");
      }
    }
  },

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
        t += `Mira and Elias argue in the open about a parts allocation. The crew stops working to listen.\n\n`;
        t += `This is what soft fractures look like before they become factions.`;
      }
      if (state.flags.past === "owned" && isAlive("elias")) {
        t += `\n\nElias's eyes flick to you once. The past you owned in front of him is still on the table between the words.`;
      }
      return t;
    },
    choices: [
      { text: "Back down a step. Adjust the rule that caused this.", next: "arc_living_4", effects: { cohesion: 6, integrity: -2, supplies: -2 }, lean: { living: 2 }, affinity: { tomas: 8, lena: 4 }, trust: { tomas: 10 }, mark: { conflict: "backed" } },
      { text: "Hold the line. Refusal does not rewrite orders.", next: "arc_living_4", effects: { cohesion: -8, integrity: 3 }, lean: { future: 2 }, affinity: { elias: 8, tomas: -8 }, trust: { elias: 8, tomas: -12 }, mark: { conflict: "held" } },
      { text: "Take the argument private. Do not let the corridor become a stage.", next: "arc_living_4", effects: { cohesion: 1, supplies: -1 }, mark: { conflict: "private" }, requires: { trust: { tomas: 40 } } }
    ]
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
    choices: [
      { text: "Burn supplies to keep the ring warm and lit.", next: "vault_sacrifice", effects: { supplies: -8, cohesion: 5, integrity: 3 }, lean: { living: 3 }, affinity: { amara: 4, lena: 4 }, requires: { supplies: { min: 10 } } },
      { text: "Protect the margin. Accept colder habitation.", next: "vault_sacrifice", effects: { supplies: 3, cohesion: -6, integrity: 2 }, lean: { future: 2 }, affinity: { elias: 5, jiro: 3 } },
      { text: "Double cycle the crew for a temporary patch. Borrow time.", next: "vault_sacrifice", effects: { cohesion: -4, integrity: 5, supplies: -2 }, lean: { living: 1 }, affinity: { mira: 4 }, requires: { cohesion: { min: 25 } } }
    ]
  },
  vault_sacrifice: {
    get text() {
      const pri = state.flags.vault_priority || "both";
      let t = `A power fault hits the vault and habitation ring at the same time.\n\nMira can stabilize only one grid fully. The other will take irreversible damage. The embryo count will not recover from a living choice; the living will not recover from a full vault divert.\n\n`;
      if (pri === "future") {
        t += `You already said the future is what matters. Elias watches to see if you meant it.\n\n`;
      } else if (pri === "living") {
        t += `You already said the living come first. The vault panel is still cycling viability percentages in the corner of your vision.\n\n`;
      } else {
        t += `You tried to protect both. The ship is no longer offering that luxury.\n\n`;
      }
      // Personal voices — Future vs Living embodied
      if (isAlive("elias")) t += `Elias: "If the vault dies, this was just a slow funeral with better lighting. Feed the future."\n\n`;
      if (isAlive("jiro")) t += `Jiro: "The trajectory was always for the package. We were the escort."\n\n`;
      if (isAlive("lena")) t += `Lena: "I can treat the people in this room. I cannot treat a percentage on a screen."\n\n`;
      if (isAlive("tomas")) t += `Tomas: "Whatever you choose, someone will carry it. Choose knowing that."\n\n`;
      if (isAlive("amara")) t += `Amara: "The trays are still green. That is not a percentage. That is breath."\n\n`;
      if (isAlive("sela")) t += `Sela says nothing. Her latest yellow circle is taped above the vault hatch.\n\n`;
      t += `Mira waits on the switch. "I need an order."`;
      return t;
    },
    choices: [
      { text: "Divert everything to the vault. Protect the embryos and the restart package.", next: "intimacy_window", effects: { integrity: -10, cohesion: -12, supplies: -6 }, flag: { vault_sacrifice: "future" }, lean: { future: 10 }, affinity: { elias: 12, jiro: 10, lena: -10, tomas: -12, amara: -8 }, trust: { elias: 15, jiro: 12, lena: -12, tomas: -15 }, requires: { integrity: { min: 15 }, supplies: { min: 8 } } },
      { text: "Divert everything to life support and habitation. Protect the living.", next: "intimacy_window", effects: { embryos: -28, integrity: 5, cohesion: 8, supplies: 4 }, flag: { vault_sacrifice: "living" }, lean: { living: 10 }, affinity: { lena: 12, tomas: 12, amara: 10, elias: -12, jiro: -10 }, trust: { lena: 14, tomas: 15, elias: -14, jiro: -12 } },
      { text: "Split the difference. Both systems degrade.", next: "intimacy_window", effects: { embryos: -12, integrity: -5, cohesion: -4 }, flag: { vault_sacrifice: "split" }, lean: { future: 3, living: 3 }, affinity: { mira: 6 } }
    ]
  }
});
