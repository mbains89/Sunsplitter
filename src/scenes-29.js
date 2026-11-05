// Sunsplitter — scenes-29.js
// 0.28.1c size hygiene. Pure mechanical. mid-b: ship_interrupt + resolve + boarding + intimacy_window
// Strict scene shape only: text | choices | onEnter | image
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

  // PRE: post-vault private window; each individual offer must satisfy romanceOpen()
  // WRITES: none on entry; outgoing choices route only and preserve existing effects
  // DEATH: romanceOpen() excludes dead partners | DEAD SPEECH/APPEARANCE: same gate controls text and choices
  // IMAGE: REUSE images/observation_bridge_alt.jpg; no new art request
  intimacy_window: {
    get text() {
      const avail = [];
      if (romanceOpen("mira")) avail.push("Mira");
      if (romanceOpen("amara")) avail.push("Amara");
      if (romanceOpen("sela")) avail.push("Sela");
      if (romanceOpen("lena")) avail.push("Lena");
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
      if (romanceOpen("mira")) {
        opts.push({ text: "Find Mira in engineering.", next: "bond_mira", alive: "mira", tag: "private" });
      }
      if (romanceOpen("amara")) {
        opts.push({ text: "Find Amara alone among the trays.", next: "bond_amara", alive: "amara", tag: "private" });
      }
      if (romanceOpen("sela")) {
        opts.push({ text: "Sit with Sela at the bulkhead without an agenda.", next: "bond_sela", alive: "sela", tag: "private" });
      }
      if (romanceOpen("lena")) {
        opts.push({ text: "Return to Lena while there is still time.", next: "bond_lena", alive: "lena", tag: "private" });
      }
      if (isAlive("amara") && isAlive("tomas") && !state.romance.amara_tomas && state.flags.hydro === "full") {
        opts.push({ text: "Walk in on Amara and Tomas — and decide whether to stay.", next: "romance_amara_tomas", aliveAll: ["amara", "tomas"], tag: "private" });
      }
      opts.push({ text: "Keep the private hours for work. Move on.", next: "debt_notice", effects: { integrity: 1 } });
      return opts;
    }
  },


});
