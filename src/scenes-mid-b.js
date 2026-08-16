// Sunsplitter — scenes-mid-b.js
// Version 0.23 — Tomas/Jiro recoveries + Vault needs a face
// Act 2b: ship_interrupt through tomas_break + one-shot explicit aftermath variants
// Strict scene shape only: text | choices | onEnter | image
// Extends global `scenes` object.

registerScenes({

  ship_interrupt: {
    get text() {
      let t = `The personal moment does not get to finish.\n\n`;
      t += `A hull alarm cuts the corridor lights to emergency red. Deck 4 pressure differential — the same section the feedstock argument was about — has started to talk back.\n\n`;
      if (state.flags.ship_memory === "jury_rig") t += `The jury-rig is complaining in the only language bulkheads have.\n\n`;
      else if (state.flags.ship_memory === "open_wound") t += `The seal you under-funded is making its case.\n\n`;
      else if (state.flags.ship_memory === "proper_seal") t += `Even a proper patch can need hands when the ship flexes.\n\n`;
      else t += `Something in the pressure envelope wants a living decision, not a private one.\n\n`;
      t += `Whoever you were with is still there. The ship does not care.`;
      return t;
    },
    choices: [
      { text: "Break the moment. Get to the section with tools.", next: "ship_interrupt_resolve", effects: { integrity: 4, cohesion: -2 }, flag: { ship_interrupt: "answered" } },
      { text: "Send the nearest crew and stay. The private line matters too.", next: "ship_interrupt_resolve", effects: { integrity: -5, cohesion: 3 }, flag: { ship_interrupt: "deferred" }, lean: { living: 1 } },
      { text: "Order a remote lockout from here. Cold, fast, imperfect.", next: "ship_interrupt_resolve", effects: { integrity: 1, supplies: -2 }, flag: { ship_interrupt: "remote" }, lean: { future: 1 } }
    ],
    onEnter: () => {
      state.flags.ship_interrupt_fired = true;
      remember("The ship interrupted a private hour. Deck 4 does not wait for consent.");
    },
    image: "images/power_crisis.jpg"
  },

  ship_interrupt_resolve: {
    get text() {
      const how = state.flags.ship_interrupt;
      let t = `The red fades to amber.\n\n`;
      if (how === "answered") t += `You arrive with tools and the section stabilizes. Whoever you left behind understands the math and does not pretend it did not cost something.\n\n`;
      else if (how === "deferred") t += `Someone else bleeds time on the patch. The private hour holds. Later, the schematic will show a messier seal than if you had gone yourself.\n\n`;
      else t += `Remote lockout holds for now. A proper inspection is still owed.\n\n`;
      t += `The ship has made its point: personal beats are not outside the pressure envelope.`;
      return t;
    },
    get choices() {
      // Return to the interrupted bond when possible (default-offer routes must remain reachable)
      const ret = state.flags.interrupt_return;
      const canReturn = ret && scenes[ret] && (!scenes[ret].onEnter || true);
      return [
        { text: "Return to what was interrupted — if it can still be returned to.", next: canReturn ? ret : (typeof hasOpenRomanceGates === "function" && hasOpenRomanceGates() ? "intimacy_window" : "pursuit_window") },
        { text: "Let the private hour stay broken. Move on.", next: "debt_notice" }
      ];
    }
  },

  boarding_stories: {
    get text() {
      let t = `Three accounts of the same hours refuse to match.\n\n`;
      t += `Official briefing language still in the pads: sudden cascade, hours to two days, colonization ark, nine cleared the hatch by logistics and luck.\n\n`;
      if (isAlive("elias") || state.past_known) {
        t += `Elias's version: selection was already political before the sky failed. Names struck so other names could clear. "Luck" is what you call a list you did not see.\n\n`;
      }
      if (state.flags.cascade_truth) {
        t += `The maintenance-layer records: atmospheric projections dated before public alerts. The people who wrote the manifests had longer than the people on the pads were told.\n\n`;
      }
      if (isAlive("amara")) {
        t += `Amara: "I was on a secondary ring. Security closed our tube while the primary still had motion. That was not physics. That was a decision with a badge."\n\n`;
      }
      if (isAlive("tomas")) {
        t += `Tomas will not call anyone evil. He will say: "More than one true thing can be true at once. That does not make them the same story."\n\n`;
      }
      t += `No one can give you a single clean official truth. The ship launched incomplete. Why, exactly, depends on who is allowed to finish the sentence.`;
      return t;
    },
    choices: [
      { text: "Hold all accounts without forcing a winner.", next: "arc_fork", effects: { cohesion: 2 }, flag: { departure_truth: "plural" }, lean: { living: 1 } },
      { text: "Treat the records as the only adult version.", next: "arc_fork", effects: { cohesion: -2, integrity: 1 }, flag: { departure_truth: "records" }, lean: { future: 2 } },
      { text: "Refuse to litigate the dead. The living are the only ledger left.", next: "arc_fork", effects: { cohesion: 1 }, flag: { departure_truth: "living_only" }, lean: { living: 2 } }
    ],
    image: "images/corridor.jpg"
  },

  intimacy_window: {
    get text() {
      const avail = [];
      if (isAlive("mira") && !state.romance.mira && !hasMark("mira", "declined")) avail.push("Mira");
      if (isAlive("amara") && !state.romance.amara && !hasMark("amara", "declined")) avail.push("Amara");
      if (isAlive("sela") && !state.romance.sela && !hasMark("sela", "declined")) avail.push("Sela");
      if (isAlive("lena") && !state.romance.lena && !hasMark("lena", "declined")) avail.push("Lena");
      let t = `Between the vault decision and the next fracture, there is a narrow stretch of private time.\n\n`;
      t += `People notice who you seek out. Favoritism is not invisible on a ship this empty.\n\n`;
      if (avail.length) {
        t += `Someone is still willing to meet you without an audience: ${avail.join(", ")}.\n\n`;
        t += `You can take more than one private hour before the next fracture — but each acceptance is public in its own way.\n\n`;
      } else {
        t += `No open private claims remain — either the lines are already crossed, or you declined them.\n\n`;
      }
      t += `What you accept here still changes how the crew looks at you afterward.`;
      return t;
    },
    get choices() {
      const opts = [];
      if (isAlive("mira") && !state.romance.mira && !hasMark("mira", "declined")) {
        opts.push({ text: "Find Mira in engineering.", next: "bond_mira", alive: "mira", tag: "private" });
      }
      if (isAlive("amara") && !state.romance.amara && !hasMark("amara", "declined")) {
        opts.push({ text: "Find Amara alone among the trays.", next: "bond_amara", alive: "amara", tag: "private" });
      }
      if (isAlive("sela") && !state.romance.sela && !hasMark("sela", "declined")) {
        opts.push({ text: "Sit with Sela at the bulkhead without an agenda.", next: "bond_sela", alive: "sela", tag: "private" });
      }
      if (isAlive("lena") && !state.romance.lena && !hasMark("lena", "declined")) {
        opts.push({ text: "Return to Lena while there is still time.", next: "bond_lena", alive: "lena", tag: "private" });
      }
      if (isAlive("amara") && isAlive("tomas") && !state.romance.amara_tomas && state.flags.hydro === "full") {
        opts.push({ text: "Walk in on Amara and Tomas — and decide whether to stay.", next: "romance_amara_tomas", aliveAll: ["amara", "tomas"], tag: "private" });
      }
      opts.push({ text: "Keep the private hours for work. Move on.", next: "debt_notice", effects: { integrity: 1 } });
      return opts;
    }
  },


  bond_mira: {
    onEnter: () => {
      if (!state.flags.ship_interrupt_fired && (state.flags.ship_memory === "jury_rig" || state.flags.ship_memory === "open_wound" || (state.integrity || 0) < 40)) {
        state.flags.interrupt_return = "bond_mira";
        return "ship_interrupt";
      }
      state.flags.interrupt_return = null;
    },
    get text() {
      if (!isAlive("mira")) return `Engineering is empty.`;
      return `Mira is alone with the drive schematic and a cooling mug she has not touched.

"I keep fixing things that will break again," she says without looking up. "I need something that is not a system. If that is not you, say so before I make a fool of both of us."

She finally turns. Grease on her wrist. Tired eyes. No performance.

"I am not asking for a future. I am asking for one honest hour that is not the ship."`;
    },
    get choices() {
      if (!isAlive("mira")) return [{ text: "Leave.", next: "intimacy_window" }];
      return [
        { text: "Stay. Give her the honest hour.", next: "romance_mira_1", affinity: { mira: 10 }, trust: { mira: 6 } },
        { text: "Tell her you care — and that sex would complicate the chain of command tonight.", next: "intimacy_window", affinity: { mira: 8 }, trust: { mira: 8 }, mark: { mira: "held_only" }, effects: { cohesion: 2 } },
        { text: "Step back. Not her. Not like this.", next: "intimacy_window", affinity: { mira: -2 }, trust: { mira: -4 }, mark: { mira: "declined" } }
      ];
    }
  },

  romance_mira_1: {
    text: `She does not wait for a speech. She steps into your space, pulls your mouth to hers, and the kiss is immediate and hungry.

Clothes come off against the console. She is explicit about what she wants — your hands, your mouth, the weight of you. The sex is intense, almost angry with need, her legs locked around you as the ship vibrates under both of you. When she comes she bites down on a sound so the rest of the crew will not hear. Afterward she stays against you longer than the work schedule allows.

"That was not a mistake," she says quietly. "Do not treat it like one. And do not pretend Elias will not notice who you left engineering smelling like."`,
    get choices() {
      const opts = [
        { text: "Tell her you want more of this, whatever the public cost.", next: "pursuit_window", effects: { cohesion: 3 }, affinity: { mira: 8 }, lean: { living: 1 } },
        { text: "Hold her. Make no promise the crew can overhear.", next: "pursuit_window", effects: { cohesion: 2 }, affinity: { mira: 5 } }
      ];
      // 0.22.1 optional one-shot shower linger
      if (isAlive("mira") && !state.flags.mira_shower_done) {
        opts.push({ text: "Linger. Share the rinse station before the corridor takes the rest of the hour.", next: "mira_shower" });
      }
      return opts;
    },
    onEnter: () => {
      if (!isAlive("mira")) return "intimacy_window";
      if (!state.romance.mira) {
        state.romance.mira = true;
        addAffinity("mira", 40);
        addTrust("mira", 12);
        remember("You and Mira crossed a line in engineering. The ship is too small to hide it.");
      }
    },
    image: "images/shower_mira.jpg"
  },

  bond_amara: {
    onEnter: () => {
      if (!state.flags.ship_interrupt_fired && (state.flags.ship_memory === "jury_rig" || state.flags.ship_memory === "open_wound" || (state.integrity || 0) < 40)) {
        state.flags.interrupt_return = "bond_amara";
        return "ship_interrupt";
      }
      state.flags.interrupt_return = null;
    },
    get text() {
      if (!isAlive("amara")) return `The trays are unattended.`;
      return `Amara is alone in the hydroponics bay. The house key from Lagos turns once between her fingers, then stills.

"Tomas listens. You decide. Those are not the same job."

She looks at you directly — grounded, not coy.

"I am not offering a three-person negotiation. I am asking if you want me. If the answer is no, I will keep growing food and we will still work. If the answer is yes, I need you to mean it when the crew starts counting who gets your private time."`;
    },
    get choices() {
      if (!isAlive("amara")) return [{ text: "Leave.", next: "intimacy_window" }];
      return [
        { text: "Tell her yes. Mean it.", next: "romance_amara_1", affinity: { amara: 10 }, trust: { amara: 8 } },
        { text: "Tell her you want her company without sex tonight.", next: "intimacy_window", affinity: { amara: 8 }, trust: { amara: 6 }, mark: { amara: "held_only" }, effects: { cohesion: 2 } },
        { text: "Tell her no. Keep the line clean.", next: "intimacy_window", affinity: { amara: 2 }, trust: { amara: 2 }, mark: { amara: "declined" } }
      ];
    }
  },

  romance_amara_1: {
    text: `She locks the bay hatch. Not dramatic — practical.

What follows is unhurried and explicit. Amara is vocal about what she likes and what she does not. She pulls you down among the warm trays, skin against skin, the smell of wet earth and her mouth at your ear. She does not perform vulnerability; she chooses it. When she finishes she laughs once, quiet, then goes still with her forehead against your shoulder.

"The crew will smell the bay," she says. "Let them. I am done pretending only the vault gets a future."`,
    get choices() {
      const opts = [
        { text: "Stay until the next duty cycle forces you out.", next: "pursuit_window", effects: { cohesion: 3 }, affinity: { amara: 8 }, lean: { living: 2 } },
        { text: "Dress. Kiss her once. Return to the corridor before you are missed.", next: "pursuit_window", effects: { cohesion: 1 }, affinity: { amara: 5 } }
      ];
      // 0.22.1 optional one-shot rear linger
      if (isAlive("amara") && !state.flags.amara_rear_done) {
        opts.push({ text: "Stay a moment longer. Watch her before either of you reaches for clothes.", next: "amara_rear" });
      }
      return opts;
    },
    onEnter: () => {
      if (!isAlive("amara")) return "intimacy_window";
      if (!state.romance.amara) {
        state.romance.amara = true;
        addAffinity("amara", 40);
        addTrust("amara", 12);
        remember("You and Amara claimed the hydroponics bay. Favoritism is no longer theoretical.");
      }
    },
    image: "images/shower_amara.jpg"
  },

  bond_sela: {
    onEnter: () => {
      if (!state.flags.ship_interrupt_fired && (state.flags.ship_memory === "jury_rig" || state.flags.ship_memory === "open_wound" || (state.integrity || 0) < 40)) {
        state.flags.interrupt_return = "bond_sela";
        return "ship_interrupt";
      }
      state.flags.interrupt_return = null;
    },
    get text() {
      if (!isAlive("sela")) return `The bulkhead is unmarked tonight.`;
      return `Sela sits with a fresh plate of yellow pigment. She does not look surprised to see you.

"You keep returning. That is data."

A pause. She chooses the next sentence carefully.

"I am not a project and I am not a child. If you are here for warmth, say the true version. If you are here because the yellow bothers you, leave it alone."

Her voice stays precise. Adult. The ritual plate rests between you like a third party that will not be ignored.`;
    },
    get choices() {
      if (!isAlive("sela")) return [{ text: "Leave.", next: "intimacy_window" }];
      return [
        { text: "Tell her the true version: you want her, not the symbol.", next: "romance_sela_1", affinity: { sela: 12 }, trust: { sela: 8 } },
        { text: "Sit with the ritual only. No further claim.", next: "intimacy_window", affinity: { sela: 8 }, trust: { sela: 6 }, mark: { sela: "held_only" }, effects: { cohesion: 2 }, lean: { living: 1 } },
        { text: "Leave the plate alone. You will not take this further.", next: "intimacy_window", affinity: { sela: 2 }, mark: { sela: "declined" } }
      ];
    }
  },

  romance_sela_1: {
    text: `She sets the pigment down.

What happens is slower than the ship usually allows. Sela is exact about boundaries and exact about desire — she tells you where to touch and when to stop and when not to stop. The sex is quiet, intense, deliberate; she does not perform for an audience that is not there. Afterward she draws one small yellow mark on the inside of your wrist with a fingertip, then rubs it away before it can dry.

"That was not a claim on the crew's time," she says. "It was mine. If they notice, that is their measurement, not ours."`,
    get choices() {
      const opts = [
        { text: "Tell her you will protect what this was.", next: "pursuit_window", effects: { cohesion: 2 }, affinity: { sela: 10 }, lean: { living: 2 } },
        { text: "Match her silence. Let the mark be enough.", next: "pursuit_window", affinity: { sela: 8 } }
      ];
      // 0.22.1 optional one-shot rear linger
      if (isAlive("sela") && !state.flags.sela_rear_done) {
        opts.push({ text: "Stay. Let the moment hold a little longer before either of you moves.", next: "sela_rear" });
      }
      return opts;
    },
    onEnter: () => {
      if (!isAlive("sela")) return "intimacy_window";
      if (!state.romance.sela) {
        state.romance.sela = true;
        addAffinity("sela", 45);
        addTrust("sela", 15);
        mark("sela", "spoken");
        remember("Sela chose you without an audience. The yellow is still a fact.");
      }
    },
    image: "images/shower_sela.jpg"
  },

  bond_lena: {
    onEnter: () => {
      if (!state.flags.ship_interrupt_fired && (state.flags.ship_memory === "jury_rig" || state.flags.ship_memory === "open_wound" || (state.integrity || 0) < 40)) {
        state.flags.interrupt_return = "bond_lena";
        return "ship_interrupt";
      }
      state.flags.interrupt_return = null;
    },
    get text() {
      if (!isAlive("lena")) return `Medical is quiet in the wrong way.`;
      return `Lena is restocking a nearly empty cabinet when you return.

"If this is about guilt, I will throw you out. If this is about not wanting to be alone with the math, sit down."

She does not soften the prognosis. She softens nothing. The offer is presence — and, if you both decide, more.`;
    },
    get choices() {
      if (!isAlive("lena")) return [{ text: "Leave.", next: "intimacy_window" }];
      return [
        { text: "Sit down. Cross the line without pity.", next: "romance_lena_sex", affinity: { lena: 10 }, trust: { lena: 6 } },
        { text: "Sit with her. No further.", next: "intimacy_window", affinity: { lena: 8 }, trust: { lena: 6 }, mark: { lena: "held_only" } },
        { text: "Leave before this becomes something you cannot schedule.", next: "intimacy_window", mark: { lena: "declined" } }
      ];
    }
  },

  romance_amara_tomas: {
    get text() {
      if (!isAlive("amara") || !isAlive("tomas")) return `The bay is empty. Whatever might have been shared here is gone.`;
      return `You find them together among the trays.

Amara looks over Tomas's shoulder and does not look away. There is an invitation in it, or at least no refusal. Tomas's hand rests at her waist. Neither of them pretends this is accidental.

"You can leave," Amara says. "Or you can stay. Those are the only clean options."`;
    },
    get choices() {
      if (!isAlive("amara") || !isAlive("tomas")) return [{ text: "Move on.", next: "intimacy_window" }];
      return [
        { text: "Leave them the privacy they have claimed.", next: "intimacy_window", effects: { cohesion: 3 }, affinity: { amara: 4, tomas: 4 } },
        { text: "Stay. Join what they are offering.", next: "romance_amara_tomas_sex", effects: { cohesion: 4 } },
        { text: "Ask them to stop. This is a complication the ship cannot afford.", next: "intimacy_window", effects: { cohesion: -3 }, affinity: { amara: -4, tomas: -4 }, mark: { amara: "interrupted" } }
      ];
    }
  },

  romance_amara_tomas_sex: {
    text: `What follows is explicit and unhurried. Amara is vocal. Tomas is focused, almost worshipful. They include you fully — hands, mouths, the warm air of the bay. When it is finished Amara rests her forehead against Tomas's and then against yours.

"We are still allowed this," she says. "Even if the corridor disagrees later."`,
    choices: [
      { text: "Stay until the bay cools.", next: "pursuit_window", effects: { cohesion: 3 }, affinity: { amara: 10, tomas: 10 } },
      { text: "Dress and leave before the next watch.", next: "pursuit_window", affinity: { amara: 6, tomas: 6 } }
    ],
    onEnter: () => {
      if (!isAlive("amara") || !isAlive("tomas")) return "intimacy_window";
      if (!state.romance.amara_tomas) {
        state.romance.amara_tomas = true;
        addAffinity("amara", 25);
        addAffinity("tomas", 25);
        remember("You shared the hydroponics bay with Amara and Tomas. The crew will invent a version if you do not own one.");
      }
    },
    image: "images/romance_amara_tomas.jpg"
  },


  pursuit_window: {
    onEnter: () => {
      if (!state.flags.ship_interrupt_fired && (state.flags.ship_memory === "jury_rig" || state.flags.ship_memory === "open_wound")) {
        return "ship_interrupt";
      }
    },
    get text() {
      const open = [];
      for (const who of ["mira", "amara", "sela", "lena"]) {
        if (state.romance[who] && !state.pursuit[who] && isAlive(who)) open.push(crew[who].name);
      }
      let t = `Private time is almost spent.\n\n`;
      if (open.length) {
        t += `Someone you already crossed a line with may still come looking: ${open.join(", ")}. A second approach is not free — the crew will read it as a pattern.\n\n`;
      } else {
        t += `No one is initiating a second private claim right now.\n\n`;
      }
      if (typeof hasOpenRomanceGates === "function" && hasOpenRomanceGates()) {
        t += `There is still room for one first-time bond if you insist — but every hour here is an hour not spent on the ship.\n\n`;
      }
      const debt = typeof relationshipDebtors === "function" ? relationshipDebtors() : [];
      if (debt.length) {
        t += `Already, ${debt.map(k => crew[k].name).join(", ")} have gone quieter when you pass.`;
      }
      return t;
    },
    get choices() {
      const opts = [];
      if (typeof hasOpenRomanceGates === "function" && hasOpenRomanceGates()) {
        opts.push({ text: "Use the last private window on someone new.", next: "intimacy_window" });
      }
      for (const who of ["mira", "amara", "sela", "lena"]) {
        if (state.romance[who] && !state.pursuit[who] && isAlive(who)) {
          const label = {
            mira: "Mira finds you again in the drive bay.",
            amara: "Amara locks the bay hatch a second time.",
            sela: "Sela is waiting at the bulkhead with the pigment still wet.",
            lena: "Lena stops you outside medical — not for a report."
          }[who];
          opts.push({ text: label, next: "pursuit_" + who, alive: who });
        }
      }
      if (isAlive("mira") && !state.favors.mira && (state.trust.mira || 0) >= 45) {
        opts.push({ text: "Ask Mira for one quiet favor — parts only she can free.", next: "favor_mira", alive: "mira" });
      }
      // 0.23.3: close private hours into debt_notice so recovery spine (Tomas/Jiro + vault face) is reachable
      opts.push({ text: "Close the private hours. Return to the fracture.", next: "debt_notice" });
      return opts;
    }
  },

  pursuit_mira: {
    get text() {
      let t = `Mira has washed the grease off. The lingerie is deliberate — not soft, not accidental. She stands between you and the only exit of the drive bay and does not pretend this is spontaneous.\n\n`;
      t += `"I will stay. But the price is not private."\n\n`;
      t += `She taps the console. The ship retained the first night: intimate audio fragments and the private command language you used about the vault.\n\n`;
      t += `"Disclose the full retention to the status board. Not a summary. The intimate record and the vault talk together. If you want me again, the closed door ends. People will know what we said when we thought the ship was only listening for systems. That is the cost."\n\n`;
      t += `The bay is dim. She is already half out of the suit. The request is the same shape as an order she is forcing you to own.`;
      return t;
    },
    choices: [
      { text: "Authorize full disclosure. Stay. Let the record go public.", next: "pursuit_mira_sex", effects: { cohesion: -5, integrity: -1 }, lean: { future: 2 }, affinity: { mira: 12, tomas: -3, elias: -3 }, trust: { mira: 7 }, flag: { pursuit_mira_cost: "disclosed", mira_memory_public: true } },
      { text: "Negotiate: disclose the vault talk, keep the intimate retention sealed.", next: "pursuit_mira_sex", effects: { cohesion: -2 }, lean: { future: 1 }, affinity: { mira: 8 }, trust: { mira: 3 }, flag: { pursuit_mira_cost: "partial" } },
      { text: "Refuse the price. One crossing was enough.", next: "debt_notice", affinity: { mira: 2 }, trust: { mira: 1 }, mark: { mira: "pursuit_declined" } }
    ],
    onEnter: () => { if (!isAlive("mira")) return "pursuit_window"; },
    image: "images/lingerie_mira.jpg"
  },

  pursuit_mira_sex: {
    get text() {
      let t = `What follows is quieter than the first time and more exposing. She is specific about what she wants and does not look away. The bay smells of ozone and skin. Afterward she does not dress immediately. She sits on the deck plating with her back against the console, lingerie discarded, and breathes like someone who has decided the public cost is acceptable.\n\n`;
      if (state.flags.pursuit_mira_cost === "disclosed") {
        t += `"The board has the file," she says. "Intimate and vault language both. That is the accurate version of what we just did. You lost the closed door because I asked and you said yes."\n\n`;
      } else {
        t += `"They have the vault talk," she says. "The intimate retention stays sealed for now. Less than full honesty, but enough that the knowing is no longer only ours."\n\n`;
      }
      t += `Still naked, she puts your palm flat to the drive vibration.\n\n"If a clean repair ever needs one body behind a sealed hatch, I will tell you if I choose it. What happened in this bay is data. It is not a veto."\n\n`;
      t += `Outside the hatch the ship is already adjusting who can open which logs. The intimacy and the disclosure share the same hour.`;
      return t;
    },
    get choices() {
      const opts = [
        { text: "Accept the accuracy. Leave with her before the corridor fills.", next: "debt_notice", affinity: { mira: 8 } },
        // Edit D: drop cohesion gate on afterglow choice 2
        { text: "Ask her to keep the remaining details private even if the fact is not.", next: "debt_notice", effects: { cohesion: -2 }, affinity: { mira: 4 } }
      ];
      // 0.22.1 optional one-shot rear linger
      if (isAlive("mira") && !state.flags.mira_rear_done) {
        opts.push({ text: "Stay a breath longer. Watch her before either of you reaches for clothes.", next: "mira_rear" });
      }
      return opts;
    },
    onEnter: () => {
      if (!isAlive("mira")) return "debt_notice";
      if (!state.pursuit.mira) {
        state.pursuit.mira = true;
        addAffinity("mira", 22);
        if (state.flags.mira_memory_public) {
          remember("Mira came back. The second crossing forced full disclosure of the retained intimate and vault record. The closed door is gone.");
        } else {
          remember("Mira came back. Partial disclosure of the vault talk. The pattern is public enough.");
        }
      }
    },
    image: "images/afterglow_mira.jpg"
  },

  pursuit_amara: {
    get text() {
      let t = `Amara does not pretend this is accidental. The lingerie is practical and deliberate — straps she can work in, fabric that will not snag on a tray rail. She locks the bay hatch a second time.\n\n`;
      t += `"Tomas knows what the first night was. He does not get a vote on the second. You do. But I am not offering a free private hour."\n\n`;
      t += `She opens the purge schedule on the grow-deck panel. The contaminated compartment is flagged for vent this watch.\n\n`;
      t += `"I can delay one cycle and keep the viable roots. You claim the delay on the board. Publicly. No soft private order. The clean-air margin moves. Elias and Jiro will see who asked for the living things. If you stay, the cost is visible and I will not hide it. I will not become the Commander's soft place that costs the ship nothing."\n\n`;
      t += `The trays hum. The house key sits on the shelf. She is already undoing the collar.`;
      return t;
    },
    choices: [
      { text: "Delay the vent and claim it publicly. Stay.", next: "pursuit_amara_sex", effects: { supplies: -4, integrity: -2, cohesion: -3 }, lean: { living: 3 }, affinity: { amara: 12, elias: -4, jiro: -3 }, trust: { amara: 6 }, flag: { pursuit_amara_cost: "vent_delay", amara_vent_delayed: true } },
      { text: "Negotiate: delay half a cycle, still claim it, still stay.", next: "pursuit_amara_sex", effects: { supplies: -2, cohesion: -1 }, lean: { living: 1 }, affinity: { amara: 8 }, flag: { pursuit_amara_cost: "half" } },
      { text: "Refuse. Let the compartment vent. You will not stack a public Living cost and a second claim the same night.", next: "debt_notice", affinity: { amara: 2 }, mark: { amara: "pursuit_declined" } }
    ],
    onEnter: () => { if (!isAlive("amara")) return "pursuit_window"; },
    image: "images/lingerie_amara.jpg"
  },

  pursuit_amara_sex: {
    get text() {
      let t = `She is vocal again — less performance, more insistence. The bay smells of damp green and skin. Afterward she puts the key back around her neck and looks at you without soft focus. The lingerie is on the deck. The purge timer has been pushed.\n\n`;
      if (state.flags.pursuit_amara_cost === "vent_delay") {
        t += `"If they ask, tell the truth," she says. "I delayed a contaminated vent to keep roots alive. You claimed it while you were inside me. That is the version I will not edit."\n\n`;
      } else {
        t += `"Half a cycle is still a choice," she says. "The board will see the claim. I am done managing other people's feelings about who you choose and what it costs."\n\n`;
      }
      t += `The intimacy and the filtration decision share the same lock cycle.`;
      return t;
    },
    get choices() {
      const opts = [
        { text: "Match her honesty. Leave the bay together.", next: "prom_make_amara_ag", affinity: { amara: 8 }, lean: { living: 1 } },
        { text: "Say less than she did. Leave before the next status walk.", next: "prom_make_amara_ag", affinity: { amara: 4 } }
      ];
      // 0.22.1 optional one-shot rear linger
      if (isAlive("amara") && !state.flags.amara_rear_done) {
        opts.push({ text: "Stay a moment longer. Watch her before either of you reaches for the key.", next: "amara_rear" });
      }
      return opts;
    },
    onEnter: () => {
      if (!isAlive("amara")) return "debt_notice";
      if (!state.pursuit.amara) {
        state.pursuit.amara = true;
        addAffinity("amara", 22);
        if (isAlive("tomas")) addAffinity("tomas", -8);
        if (state.flags.amara_vent_delayed) {
          remember("Amara claimed a second night and a public delay of a contaminated grow vent. The clean-air margin moved for living stock.");
        } else {
          remember("Amara claimed a second night and a partial vent delay. Tomas and the ledger both have a version.");
        }
      }
    },
    image: "images/afterglow_amara.jpg"
  },

  pursuit_sela: {
    get text() {
      let t = `Sela does not raise her voice. She never needs to. The lingerie is simple, exact, adult. The pigment plate is between you again.\n\n`;
      t += `"You already know the true version. I am asking whether it was a single measurement or a series."\n\n`;
      t += `She does not move closer until the next sentence is finished.\n\n`;
      t += `"Neither of us may use command authority to secure the other a place in the vault. Survival value alone. If you stay, you speak that vow where the ship can log it. I will not be the private exception. The relationship has to cost the discretion, or it is only a soft place for you. I refuse that."\n\n`;
      t += `She is exact. She is not offering a symbol as a substitute for her body. The bulkhead is cold behind her.`;
      return t;
    },
    choices: [
      { text: "Speak the vow. Let the ship log it. Stay.", next: "pursuit_sela_sex", effects: { cohesion: 1 }, lean: { living: 2 }, affinity: { sela: 14, jiro: -2, elias: -2 }, trust: { sela: 9 }, flag: { pursuit_sela_cost: "vow", sela_vault_vow: "accepted" } },
      { text: "Negotiate: private vow between the two of you only, still stay.", next: "pursuit_sela_sex", lean: { living: 1 }, affinity: { sela: 10 }, trust: { sela: 5 }, flag: { pursuit_sela_cost: "private_vow", sela_vault_vow: "accepted" } },
      { text: "Refuse the vow. One measurement was the honest limit. Leave the plate.", next: "debt_notice", affinity: { sela: 3 }, mark: { sela: "pursuit_declined" }, flag: { sela_vault_vow: "refused" } }
    ],
    onEnter: () => { if (!isAlive("sela")) return "pursuit_window"; },
    image: "images/lingerie_sela.jpg"
  },

  pursuit_sela_sex: {
    get text() {
      let t = `She is as precise as before. The intimacy is quiet, exact, adult. Afterward she draws nothing on your skin. The lingerie is folded once. She only says:\n\n`;
      if (state.flags.pursuit_sela_cost === "vow") {
        t += `"The log has the entry. Jiro will see it if he looks. That is his measurement. I will not solve it for you. Neither of us gets a private vault privilege because of this."\n\n`;
      } else {
        t += `"The private word is not nothing, but it is less than a logged cost. I accepted it. Do not make me soft in the story. The vow still holds between us."\n\n`;
      }
      t += `The bulkhead still holds the earlier yellow circle. The ship has a new private mark and a new irreversible one.`;
      return t;
    },
    get choices() {
      const opts = [
        { text: "Accept that cost. Leave before the corridor invents the rest.", next: "debt_notice", affinity: { sela: 9 }, lean: { living: 1 } },
        { text: "Match her silence a minute longer. Then go.", next: "debt_notice", affinity: { sela: 6 } }
      ];
      // 0.22.1 optional one-shot rear linger
      if (isAlive("sela") && !state.flags.sela_rear_done) {
        opts.push({ text: "Stay. Let the silence hold a little longer before either of you moves.", next: "sela_rear" });
      }
      return opts;
    },
    onEnter: () => {
      if (!isAlive("sela")) return "debt_notice";
      if (!state.pursuit.sela) {
        state.pursuit.sela = true;
        addAffinity("sela", 24);
        if (isAlive("jiro")) addAffinity("jiro", -5);
        if (state.flags.sela_vault_vow === "accepted") {
          remember("Sela chose a second series and logged an irrevocable vow: no command privilege for vault places between you.");
        } else {
          remember("Sela chose a second series under a private vow only.");
        }
      }
    },
    image: "images/afterglow_sela.jpg"
  },

  pursuit_lena: {
    get text() {
      let t = `Lena's second approach is clinical until it is not. The lingerie is under the open medical coat — practical, deliberate, not soft. She stops you outside the treatment bay, not for a report.\n\n`;
      t += `"I am not improved. The math is the same. If you are here out of pity, walk."\n\n`;
      t += `She does not look away. She opens the cold drawer just far enough for you to see the sealed regenerative.\n\n`;
      t += `"This is the last uncontaminated dose. It buys months. It does not cure. If you stay, you authorize it for me. The board will see a private name on a medical expenditure that was meant for the next triage. I will not take it as an invisible favor. The living will notice who the last treatment went to."\n\n`;
      t += `The bay smells of antiseptic and her skin. The body clock and the medical clock are the same instrument.`;
      return t;
    },
    choices: [
      { text: "Authorize the last regenerative for her. Stay. Accept the public cost.", next: "pursuit_lena_sex", effects: { supplies: -4, cohesion: -4 }, affinity: { lena: 12, elias: -3, mira: -2 }, trust: { lena: 8 }, flag: { pursuit_lena_cost: "regen", lena_regen: true }, lean: { living: 2 } },
      { text: "Negotiate: authorize it, but record that the private history is not invisible.", next: "pursuit_lena_sex", effects: { supplies: -3, cohesion: -2 }, affinity: { lena: 9 }, trust: { lena: 5 }, flag: { pursuit_lena_cost: "honest_regen", lena_regen: true } },
      { text: "Walk. You will not take comfort that spends the last dose on private history.", next: "debt_notice", affinity: { lena: 3 }, mark: { lena: "pursuit_declined" } }
    ],
    onEnter: () => { if (!isAlive("lena")) return "pursuit_window"; },
    image: "images/lingerie_lena.jpg"
  },

  pursuit_lena_sex: {
    get text() {
      let t = `It is slower this time. She still does not ask you to be careful. The intimacy is frank, close, unsentimental. Afterward she buttons the coat over the lingerie like a uniform and checks the time. The cold drawer is open.\n\n`;
      if (state.flags.pursuit_lena_cost === "regen") {
        t += `"The dose is spent," she says. "If the next triage list is written while I am still breathing, the board already knows where the last regenerative went. Do not make me a soft story in the crew's theory."\n\n`;
      } else {
        t += `"The dose is spent and the history is on the record," she says. "Do not let either one become a story you use to feel less brutal."\n\n`;
      }
      t += `The medical clock is still running. The private hour and the last treatment share the same expenditure.`;
      return t;
    },
    get choices() {
      const opts = [
        { text: "Refuse the soft story. Leave on her terms.", next: "prom_make_lena_ag", affinity: { lena: 8 } },
        { text: "Hold the silence with her a minute longer. Then go.", next: "prom_make_lena_ag", affinity: { lena: 6 } }
      ];
      // 0.22.1 optional one-shot rear linger
      if (isAlive("lena") && !state.flags.lena_rear_done) {
        opts.push({ text: "Stay a breath longer. Watch her before the coat is fully buttoned.", next: "lena_rear" });
      }
      return opts;
    },
    onEnter: () => {
      if (!isAlive("lena")) return "debt_notice";
      if (!state.pursuit.lena) {
        state.pursuit.lena = true;
        addAffinity("lena", 22);
        if (state.flags.lena_regen) {
          remember("Lena came back while her clock was still running and made the second night cost the last regenerative treatment.");
        } else {
          remember("Lena came back while her clock was still running.");
        }
      }
    },
    image: "images/afterglow_lena.jpg"
  },

  debt_notice: {
    get text() {
      const debt = typeof relationshipDebtors === "function" ? relationshipDebtors() : [];
      let t = `The private hours end. The ship does not.\n\n`;
      if (debt.length) {
        t += `When you return to the common corridor, the temperature has changed.\n\n`;
        if (debt.includes("elias")) t += `Elias's reports get shorter. He does not argue. He also does not offer.\n`;
        if (debt.includes("tomas")) t += `Tomas stops looking for you when he prays. That is not nothing.\n`;
        if (debt.includes("jiro")) t += `Jiro answers navigation questions and nothing else.\n`;
        if (debt.includes("mira") && !state.romance.mira) t += `Mira is in engineering with the door more closed than usual.\n`;
        if (debt.includes("amara") && !state.romance.amara) t += `Amara works the trays with her back to the hatch.\n`;
        if (debt.includes("lena") && !state.romance.lena) t += `Lena's medical updates arrive as text only.\n`;
        if (debt.includes("sela") && !state.romance.sela) t += `Sela's yellow circles continue. She does not look up when you pass.\n`;
        t += `\nThis is not a mutiny. It is people rationing what they give a commander who has already rationed his attention.`;
      } else {
        t += `No one makes a speech about who you kept close. That does not mean no one measured it.`;
      }
      return t;
    },
    get choices() {
      // 0.23: after private hours close → Tomas recovery (Green Tether) if not yet recovered
      const next = state.recovered && state.recovered.tomas ? (state.recovered.jiro ? "act3_spine_next" : "act3_reckoning_pattern") : "act2_tether_sighting";
      return [
        { text: "Take the temperature change as data. Move on.", next },
        { text: "Spend one public hour fixing something with your own hands.", next, effects: { cohesion: 3, integrity: 1 } }
      ];
    }
  },

  favor_mira: {
    text: `Mira listens to the request without looking up from the board.

"You want me to free sealed maintenance stock that is inventory-locked to a department that does not exist on this voyage. That is a favor, not a work order."

She finally meets your eyes.

"I will do it once. After that, the next time you need a miracle, the answer is the board."`,
    choices: [
      { text: "Take the favor. Accept that she will remember the debt the other way.", next: "prom_make_mira", effects: { supplies: 8, integrity: 3 }, flag: { mira_favor: true }, trust: { mira: 4 }, affinity: { mira: 6 } },
      { text: "Withdraw the ask. You will not spend her goodwill on parts.", next: "prom_make_mira", trust: { mira: 2 } }
    ],
    onEnter: () => {
      if (!isAlive("mira")) return "pursuit_window";
      state.favors.mira = true;
    }
  },

  coolant_trade: {
    get text() {
      let t = `Mira and Lena are arguing over the same tank of coolant-grade fluid.`;

      if (isAlive("mira")) {
        t += `\n\n"I can stabilize the secondary loop for three weeks if I take it," Mira says. She keeps one hand on the secondary-loop trace.

"What's broken is remote authority. The tank buys time; it does not restore the contactor. If the cross-feed welds, control goes local. Whoever takes the phase board stays until both traces are flat."`;
      }
      if (isAlive("lena")) {
        t += `\n\nLena does not raise her voice. "Or I can keep the last sterile field cold enough that surgery remains possible. Choose which future injury you prefer."`;
      }

      t += `\n\nThe tank is not big enough for both uses.`;
      return t;
    },
    choices: [
      // Edit A: keep only original/shipped requires (trust) so split remains ungated
      {
        text: "Give it to the loop. Keep the ship from shaking apart.",
        next: "seal_or_food",
        effects: { integrity: 8, supplies: -2, cohesion: -3 },
        flag: { coolant: "loop" },
        lean: { future: 1 },
        requires: { trust: { mira: 30 } },
        alive: "mira"
      },
      {
        text: "Give it to medical. Keep the option to cut and sew.",
        next: "seal_or_food",
        effects: { cohesion: 4, integrity: -4, supplies: -2 },
        flag: { coolant: "medical" },
        lean: { living: 1 },
        requires: { trust: { lena: 30 } },
        alive: "lena"
      },
      {
        text: "Split it. Both systems degrade slower — neither is saved.",
        next: "seal_or_food",
        effects: { integrity: 2, cohesion: 1, supplies: -3 },
        flag: { coolant: "split" }
      }
    ],
    image: "images/corridor_variant.jpg"
  },

  seal_or_food: {
    get text() {
      let t = `A pressure seal on Deck 4 is failing in slow motion. The same fabrication feedstock can patch it for months — or be rendered into calorie paste that extends ration estimates by ten days.`;

      if (isAlive("elias")) {
        t += `\n\nElias wants the seal. He tests the manual dog.

"What's the threat? The status light that says a bad seal held. Remote is lying. Close upstream once. No retrieval team until pressure is flat."`;
      }
      if (isAlive("amara")) {
        t += `\n\nAmara wants the paste.`;
      }

      t += `\n\nEvery claim on the table is correct. Whatever you choose will stay in the bulkhead. The ship does not forget structural decisions the way people forget arguments.`;
      return t;
    },
    choices: [
      // Edit A: retain original/shipped requires only (first has integrity gate; third ungated)
      {
        text: "Patch the seal properly. A dead crew does not need calories.",
        next: "time_pass",
        effects: { integrity: 7, supplies: -6, cohesion: -2 },
        flag: { feedstock: "seal", ship_memory: "proper_seal" },
        lean: { future: 1 },
        requires: { integrity: { min: 20 } },
        remember: "You spent the feedstock on a proper Deck 4 seal. The ship will hold that line — or fail louder if something else gives."
      },
      {
        text: "Render the paste. People eat every day; the seal might hold.",
        next: "time_pass",
        effects: { supplies: 9, integrity: -5, cohesion: 3 },
        flag: { feedstock: "food", ship_memory: "open_wound" },
        lean: { living: 1 },
        alive: "amara",
        remember: "You left Deck 4's seal to chance for food. The open wound stays on the schematic."
      },
      {
        text: "Jury-rig a thin patch and stretch half-rations. Both problems deferred.",
        next: "time_pass",
        effects: { integrity: 2, supplies: 2, cohesion: -1 },
        flag: { feedstock: "thin", ship_memory: "jury_rig" },
        remember: "Deck 4 is a jury-rig. It will ask to be paid later."
      }
    ],
    image: "images/corridor_variant.jpg"
  },

  history_elias: {
    text: `Elias finds you alone near the docking ring — the place Rourke died.

"You already know I have the ground-side file. What you do not know is which names on the original boarding list were struck so yours could clear."

He does not open a tablet. He does not need to.

"I am not offering absolution. I am offering a fact: two specialists who should have been in hydroponics never made the ring because a commander-shaped slot was protected. If the crew ever needs a reason to stop following you, that is one. I am still choosing not to spend it. For now."`,
    choices: [
      { text: "Thank him for the silence without pretending it is free.", next: "prom_make_elias", flag: { past: "owned" }, affinity: { elias: 4 }, trust: { elias: 6 } },
      { text: "Tell him if he spends it, he had better be ready for what comes after.", next: "prom_make_elias", effects: { cohesion: -3 }, affinity: { elias: -2 }, flag: { past: "threatened" } },
      { text: "Ask him to tell Lena only — medical may need the truth more than security.", next: "prom_make_elias", flag: { past: "lena_only" }, affinity: { lena: 4 }, trust: { lena: 4 }, alive: "lena" }
    ],
    onEnter: () => {
      state.past_known = true;
      state.past_known_by.elias = true;
      remember("Elias named the cost of your seat. The file is still his.");
    }
  },

  pregnancy_check: {
    get text() {
      if (!isAlive("lena")) {
        return `There is no medical officer left to translate private risk into protocol. Whatever has happened between people on this ship will have to surface some other way — or not at all.`;
      }
      return `Lena stops you in the corridor. Her expression is clinical and something else underneath.

"If you have been with anyone, we need to talk about the medical reality. This ship does not have the margin for an unplanned pregnancy. The vault already carries the future. A living pregnancy competes for the same resources and the same oxygen."

She waits.

"I can offer prevention after the fact if we are early. Or we can prepare for the harder path. Tell me what is true."`;
    },
    get choices() {
      // 0.25: after pregnancy resolve → tomas_break if recovered, else Elias lethal entry
      const after = (isAlive("tomas") && state.recovered && state.recovered.tomas) ? "tomas_break" : "act3_lethal_elias_order";
      if (!isAlive("lena")) {
        return [{ text: "Move on. Medical is empty.", next: after }];
      }
      return [
        { text: "There is a possibility. Prepare for both outcomes.", next: after, effects: { cohesion: -2, supplies: -6, embryos: -3 }, flag: { pregnancy_risk: true }, requires: { supplies: { min: 12 }, trust: { lena: 40 } }, lean: { living: 3 } },
        { text: "It will not become a problem. Handle prevention.", next: after, effects: { supplies: -3, cohesion: 1 }, flag: { pregnancy_risk: false } },
        { text: "That is private. Do your job when asked.", next: after, effects: { cohesion: -5, integrity: -1 }, flag: { pregnancy_risk: "unknown" } }
      ];
    }
  },
  // 0.22: reachable only after recovered.tomas (wired in 0.23)
  tomas_break: {
    onEnter: () => {
      if (!isAlive("tomas") || !state.recovered || !state.recovered.tomas) {
        return "act3_lethal_elias_order";
      }
      if (!hasMark("tomas", "warned")) {
        addAffinity("tomas", state.flags.vault_sacrifice === "living" ? 8 : -5);
        addTrust("tomas", state.flags.vault_sacrifice === "living" ? 10 : -8);
        mark("tomas", "warned");
        remember("Tomas told you he was running out of something quieter than faith.");
      }
    },
    get text() {
      if (!isAlive("tomas") || !state.recovered || !state.recovered.tomas) {
        return `The space where Tomas would have found you stays empty. Someone else has already taken his quiet shifts. The ship does not offer his warning.`;
      }

      let t = `Tomas finds you alone.\n\nFor the first time since the launch his calm is gone. His voice is low and raw.\n\n`;
      if (state.flags.vault_sacrifice === "future") {
        t += `"You chose the vault. I felt the air change in the habitation ring. People noticed. I noticed."\n\n`;
      } else if (state.flags.vault_sacrifice === "living") {
        t += `"You chose the living. The vault numbers dropped. Some of them will not forgive that. I am not sure I will either — or that I should."\n\n`;
      } else {
        t += `"I have held every confession this crew has offered. I have sat with the dying and the guilty and the ones who want permission to stop caring. I am running out of something. Not faith. Something quieter."\n\n`;
      }
      t += `He looks at the deck.\n\n"If you order me to keep pretending compassion is free, I will break. I am telling you now so you are not surprised when it happens."\n\n"If the next hatch closes on something living, ask who pays before you call it settled."`;
      return t;
    },
    get choices() {
      if (!isAlive("tomas") || !state.recovered || !state.recovered.tomas) {
        return [{ text: "Continue without him.", next: "act3_lethal_elias_order" }];
      }
      // Edit A: original/shipped requires only — third choice keeps trust gate; no full resource gates
      return [
        {
          text: "Tell him the living come first. Always.",
          next: "act3_lethal_tomas_cost",
          effects: { cohesion: 5, embryos: -2 },
          flag: { tomas: "living" },
          lean: { living: 4 },
          mark: { tomas: "held" },
          alive: "tomas"
        },
        {
          text: "Tell him the future is the only thing that justifies any of this.",
          next: "act3_lethal_tomas_cost",
          effects: { cohesion: -4, integrity: 2 },
          flag: { tomas: "future" },
          lean: { future: 4 },
          mark: { tomas: "broke" },
          alive: "tomas"
        },
        {
          text: "Ask him to hold on a little longer. You need him intact.",
          next: "act3_lethal_tomas_cost",
          effects: { cohesion: 2, supplies: -1 },
          flag: { tomas: "hold" },
          requires: { trust: { tomas: 45 } },
          mark: { tomas: "held" },
          alive: "tomas"
        }
      ];
    },
    image: "images/tomas_break.jpg"
  },

  // --- 0.22.1 Explicit Art Utilization (one-shot pure-data aftermath variants) ---
  // Gates: romance + isAlive + !done flag. Declining original choices leaves spine identical.
  // Dead characters never speak or appear.

  lena_shower: {
    get text() {
      if (!isAlive("lena") || !state.romance.lena) {
        return `The rinse station is empty. The moment has already closed.`;
      }
      return `The observation blister has a rinse station that still works. She does not wait for invitation. Water is cold, then warmer. Skin under the spray, the marks still visible, her back to you for a long moment before she turns and rinses the last of the sweat from her collarbones.

"This is the part that is not for the crew," she says. "The rest of it they will invent whether you give them details or not."

She shuts the water off herself. The clock is still running.`;
    },
    get choices() {
      const next = state.past_known ? "pursuit_window" : "past_leak";
      if (!isAlive("lena") || !state.romance.lena) {
        return [{ text: "Leave.", next }];
      }
      return [
        { text: "Tell her you will find a way to buy her more time.", next, effects: { cohesion: 2 }, affinity: { lena: 4 } },
        { text: "Say nothing. The body already said enough.", next }
      ];
    },
    onEnter: () => {
      const next = state.past_known ? "pursuit_window" : "past_leak";
      if (!isAlive("lena") || !state.romance.lena) return next;
      state.flags.lena_shower_done = true;
    },
    image: "images/shower_lena.jpg"
  },

  mira_shower: {
    get text() {
      if (!isAlive("mira") || !state.romance.mira) {
        return `The engineering rinse is empty. The moment has already closed.`;
      }
      return `There is a rinse station off the engineering console that still holds pressure. She pulls you into it without ceremony. Water over skin, ozone and heat, her hands still exact even when they are not working the board.

"They will still invent the rest," she says. "This part is just for the two of us and the ship that is already adjusting power."

She turns the water off. The bay is waiting.`;
    },
    get choices() {
      if (!isAlive("mira") || !state.romance.mira) {
        return [{ text: "Leave.", next: "pursuit_window" }];
      }
      return [
        { text: "Tell her you want more of this, whatever the public cost.", next: "pursuit_window", effects: { cohesion: 2 }, affinity: { mira: 5 } },
        { text: "Hold the silence a moment longer. Then leave together.", next: "pursuit_window" }
      ];
    },
    onEnter: () => {
      if (!isAlive("mira") || !state.romance.mira) return "pursuit_window";
      state.flags.mira_shower_done = true;
    },
    image: "images/shower_mira.jpg"
  },

  lena_rear: {
    get text() {
      if (!isAlive("lena") || !state.romance.lena) {
        return `The bay is empty. The moment has already closed.`;
      }
      return `She does not dress yet. She stays on the edge of the treatment couch, back to you, the curve of her spine and the marks still visible under the low medical light. The ship hums. Neither of you speaks for a full minute.

Then she reaches for the coat without turning around.

"That is the version they do not get," she says. "The rest is already on the board."`;
    },
    get choices() {
      if (!isAlive("lena") || !state.romance.lena) {
        return [{ text: "Leave.", next: "prom_make_lena_ag" }];
      }
      return [
        { text: "Accept the accuracy. Leave on her terms.", next: "prom_make_lena_ag", affinity: { lena: 5 } },
        { text: "Hold the silence a minute longer. Then go.", next: "prom_make_lena_ag" }
      ];
    },
    onEnter: () => {
      if (!isAlive("lena") || !state.romance.lena) return "prom_make_lena_ag";
      state.flags.lena_rear_done = true;
    },
    image: "images/rear_lena.jpg"
  },

  mira_rear: {
    get text() {
      if (!isAlive("mira") || !state.romance.mira) {
        return `The bay is empty. The moment has already closed.`;
      }
      return `She does not dress immediately. She stays on the deck plating, back against the console, the line of her shoulders and the marks still clear under the low work lights. The ship is already adjusting who can open which logs.

"They get the record," she says without turning. "This part is not for the ledger."

She reaches for the discarded lingerie only after the minute has been spent.`;
    },
    get choices() {
      if (!isAlive("mira") || !state.romance.mira) {
        return [{ text: "Leave.", next: "debt_notice" }];
      }
      return [
        { text: "Accept the accuracy. Leave with her before the corridor fills.", next: "debt_notice", affinity: { mira: 5 } },
        { text: "Match her silence a moment longer. Then go.", next: "debt_notice" }
      ];
    },
    onEnter: () => {
      if (!isAlive("mira") || !state.romance.mira) return "debt_notice";
      state.flags.mira_rear_done = true;
    },
    image: "images/rear_mira.jpg"
  },

  amara_rear: {
    get text() {
      if (!isAlive("amara") || !state.romance.amara) {
        return `The bay is empty. The trays keep their own time.`;
      }
      return `She does not reach for the key yet. She stays among the warm trays, back to you, the curve of her body still open to the humid air and the low grow lights. The house key rests on the shelf. The purge timer has been pushed.

"They will see the claim on the board," she says. "This is the part that is only for us."

She turns only when the minute has been allowed to finish.`;
    },
    get choices() {
      if (!isAlive("amara") || !state.romance.amara) {
        return [{ text: "Leave.", next: "prom_make_amara_ag" }];
      }
      return [
        { text: "Match her honesty. Leave the bay together.", next: "prom_make_amara_ag", affinity: { amara: 5 }, lean: { living: 1 } },
        { text: "Say less. Leave before the next status walk.", next: "prom_make_amara_ag" }
      ];
    },
    onEnter: () => {
      if (!isAlive("amara") || !state.romance.amara) return "prom_make_amara_ag";
      state.flags.amara_rear_done = true;
    },
    image: "images/rear_amara.jpg"
  },

  sela_rear: {
    get text() {
      if (!isAlive("sela") || !state.romance.sela) {
        return `The bulkhead is unmarked tonight. The moment has already closed.`;
      }
      return `She does not reach for the folded lingerie yet. She stays with her back to you, the yellow pigment plate still between the two of you and the cold bulkhead. The line of her spine is exact. The earlier yellow circle holds its place on the wall.

"This measurement is private," she says without turning. "The rest of the ship can keep its own."

She moves only after the silence has been allowed its full weight.`;
    },
    get choices() {
      if (!isAlive("sela") || !state.romance.sela) {
        return [{ text: "Leave.", next: "debt_notice" }];
      }
      return [
        { text: "Accept that cost. Leave before the corridor invents the rest.", next: "debt_notice", affinity: { sela: 5 }, lean: { living: 1 } },
        { text: "Match her silence a minute longer. Then go.", next: "debt_notice" }
      ];
    },
    onEnter: () => {
      if (!isAlive("sela") || !state.romance.sela) return "debt_notice";
      state.flags.sela_rear_done = true;
    },
    image: "images/rear_sela.jpg"
  }
});
