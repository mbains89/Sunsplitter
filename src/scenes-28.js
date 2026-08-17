// Sunsplitter — scenes-28.js
// 0.28.1c size hygiene. Pure mechanical. late: sun_payoff + ship_memory + patch + final + ending_check
// Strict scene shape only: text | choices | onEnter | image
registerScenes({

  sun_payoff: {
    get text() {
      let t = `The yellow marks have become a fact of the ship.\n\n`;
      if (isAlive("sela")) {
        t += `Sela does not ask permission for the next circle. She asks what you will do with the ones already there.\n\n`;
        t += `"If you paint them over, the corridor becomes regulation again. If you leave them, people will keep using them as landmarks — and as an argument that warmth is not a soft metric."\n\n`;
      } else {
        t += `Their author is gone. The pigment remains. Someone will decide whether the ship keeps them.\n\n`;
      }
      if (isAlive("jiro")) t += `Jiro: "They are not navigation. They are also the only consistent marks on a deck that lost half its signage."\n\n`;
      if (isAlive("elias")) t += `Elias wants them gone. "Symbols that are not orders become competing orders."\n\n`;
      t += `This is not decoration. It is a doctrine decision.`;
      return t;
    },
    get choices() {
      const opts = [];
      if (isAlive("sela") || hasMark("sela", "spoken")) {
        opts.push({ text: "Let the yellow marks stand as unofficial doctrine.", next: "ship_memory_payoff", effects: { cohesion: 5 }, flag: { sun_doctrine: "doctrine" }, lean: { living: 3 }, affinity: { sela: 10, jiro: 4, elias: -6 }, trust: { sela: 8 } });
      }
      opts.push({ text: "Order them removed. One ship, one visual language.", next: "ship_memory_payoff", effects: { cohesion: -4, integrity: 1 }, flag: { sun_doctrine: "scrubbed" }, lean: { future: 2 }, affinity: { elias: 6, sela: -12, jiro: -4 }, trust: { sela: -10 } });
      opts.push({ text: "Leave them without a speech. Neither doctrine nor ban.", next: "ship_memory_payoff", effects: { cohesion: 1 }, flag: { sun_doctrine: "silent" }, lean: { living: 1 } });
      return opts;
    },
    image: "images/sela_ritual.jpg"
  },

  ship_memory_payoff: {
    get text() {
      const mem = state.flags.ship_memory;
      let t = `Before the last orders, the ship collects its debts.\n\n`;
      if (mem === "jury_rig") {
        t += `Deck 4's thin patch has been humming at the edge of tolerance for days. Any hard course change or full burn will ask it to hold under stress it was never given material for.\n\n`;
      } else if (mem === "open_wound") {
        t += `Deck 4 never got its seal. The section is living on pressure luck and remote valves. A destination burn will find the soft place.\n\n`;
      } else if (mem === "proper_seal") {
        t += `Deck 4's proper seal still holds. That feedstock is gone from the galley math — but the bulkhead does not argue when the drive spins up.\n\n`;
      } else {
        t += `Structural memory is quiet for once. Other debts are louder.\n\n`;
      }
      if (state.flags.sun_doctrine === "doctrine") t += `The yellow marks remain. People orient by them without being told to.\n\n`;
      else if (state.flags.sun_doctrine === "scrubbed") t += `Where the yellow was, there is only primer and the ghost of a circle.\n\n`;
      if (state.flags.departure_truth === "plural") t += `No single boarding story won. The crew lives with the friction.\n\n`;
      else if (state.flags.departure_truth === "records") t += `The records version of boarding is the one the officers cite when they need a hard sentence.\n\n`;
      t += `The last choice is still yours. The ship has already made some of them permanent.`;
      return t;
    },
    choices: [
      { text: "Face the final orders.", next: "final_choice" }
    ],
    image: "images/bulkhead.jpg"
  },

  patch_fails: {
    text: `The course change loads Deck 4.

The jury-rig — or the absence of a seal — gives a sound like a metal animal losing an argument. Remote valves slam. Hull numbers step down in public view.

You can still hold the destination. You will hold it with a wounded ring and a crew that watched the schematic predict this.`,
    choices: [
      { text: "Hold course anyway. Pay the structural cost.", next: "ending_check", effects: { integrity: -12, cohesion: -4 }, flag: { final: "hold", patch: "failed" } },
      { text: "Abort the hard burn. Choose a softer final path.", next: "final_choice", effects: { integrity: -3, cohesion: 2 }, flag: { patch: "aborted" } }
    ],
    image: "images/vent.jpg"
  },

  final_choice: {
    get text() {
      let t = `The remaining decisions are the ones that will define what the Sunsplitter becomes.\n\n`;
      if (state.flags.planet === "committed") {
        t += `The course is still locked on the rogue planet. You can hold it, alter it, or abandon it.\n\n`;
      } else {
        t += `You still have no destination. You can set one, or refuse the idea that a destination is required.\n\n`;
      }
      const debt = typeof relationshipDebtors === "function" ? relationshipDebtors() : [];
      if (debt.length) {
        t += `Some of the people you still need have been rationing their help: ${debt.map(k => crew[k] ? crew[k].name : k).join(", ")}.\n\n`;
      }
      t += `What do you order?`;
      return t;
    },
    get choices() {
      const debt = typeof relationshipDebtors === "function" ? relationshipDebtors() : [];
      const opts = [];
      // Hold course needs Jiro or Mira trusting enough — structural dependence
      const holdNext = (state.flags.ship_memory === "jury_rig" || state.flags.ship_memory === "open_wound") ? "patch_fails" : "ending_check";
      if (isAlive("jiro") && (state.trust.jiro || 0) >= 35 && !debt.includes("jiro")) {
        opts.push({ text: "Hold course for the rogue planet. We finish what we started.", next: holdNext, flag: { final: "hold" }, requires: { integrity: { min: 30 }, supplies: { min: 10 } }, lean: { future: 3 }, alive: "jiro" });
      } else if (isAlive("mira") && (state.trust.mira || 0) >= 40 && !debt.includes("mira")) {
        opts.push({ text: "Hold course — Mira can keep the drive honest even without Jiro's full voice.", next: holdNext, flag: { final: "hold" }, requires: { integrity: { min: 28 }, supplies: { min: 10 } }, lean: { future: 2 }, alive: "mira" });
      } else {
        opts.push({ text: "Hold course anyway. Navigation will be rougher without full crew buy-in.", next: holdNext, flag: { final: "hold" }, effects: { integrity: -4, cohesion: -3 }, requires: { integrity: { min: 35 }, supplies: { min: 12 } }, lean: { future: 2 } });
      }
      // Comfort path needs living-side trust
      if (!debt.includes("amara") && !debt.includes("tomas")) {
        opts.push({ text: "Abandon the destination. Spend the remaining fuel on speed and comfort.", next: "ending_check", flag: { final: "comfort" }, requires: { supplies: { min: 15 } }, lean: { living: 3 } });
      } else {
        opts.push({ text: "Push for comfort anyway — even if some of the living will not thank you.", next: "ending_check", flag: { final: "comfort" }, effects: { cohesion: -4 }, requires: { supplies: { min: 18 } }, lean: { living: 2 } });
      }
      opts.push({ text: "Turn the ship. Send a final transmission into the dark and then go quiet.", next: "ending_check", flag: { final: "transmission" }, requires: { integrity: { min: 20 } } });
      opts.push({ text: "Keep them alive one day at a time. No speeches. No grand purpose.", next: "ending_check", flag: { final: "endure" }, lean: { living: 2 } });
      return opts;
    }
  },
  ending_check: {
    text: ``,
    choices: []
  }
});
