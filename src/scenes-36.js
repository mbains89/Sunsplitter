// Sunsplitter — scenes-36.js
// 0.28.2 size hygiene. Pure mechanical. mid-b: history_elias + pregnancy_check + tomas_break
// Strict scene shape only: text | choices | onEnter | image
registerScenes({

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

});
