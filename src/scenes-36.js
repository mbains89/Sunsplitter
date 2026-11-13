// Sunsplitter — scenes-36.js
// 0.28.1c size hygiene. Pure mechanical. mid-b: history_elias + pregnancy_check + tomas_break
// Strict scene shape only: text | choices | onEnter | image
registerScenes({

  history_elias: {
    text: `Elias finds you alone near the docking ring — where Rourke took the shrapnel.

"You already know I have the ground-side file. What you do not know is which names on the original boarding list were struck so yours could clear."

He does not open a tablet. He does not need to.

"I am not offering absolution. I am offering a fact: two specialists who should have been in hydroponics never made the ring because a commander-shaped slot was protected. That is the file. I am still not spending it."`,
    choices: [
      { text: "Thank him for the silence without pretending it is free.", next: "prom_make_elias", flag: { past: "owned" }, affinity: { elias: 4 }, trust: { elias: 6 }, reply: [{ who: "elias", text: `"Not free," Elias agrees. "Deferred." He looks at the docking ring a moment longer. "That is the most you get from me, Commander. It is more than the two specialists got."` }] },
      { text: "Tell him if he spends it, he had better be ready for what comes after.", next: "prom_make_elias", effects: { cohesion: -3 }, affinity: { elias: -2 }, flag: { past: "threatened" }, reply: [{ who: "elias", text: `"Noted, Commander." Elias does not move. "I do not spend things because I am threatened. I spend them when they buy something." He goes back to watching the ring.` }] },
      { text: "Ask him to tell Lena only — medical may need the truth more than security.", next: "prom_make_elias", flag: { past: "lena_only" }, affinity: { lena: 4 }, trust: { lena: 4 }, alive: "lena", reply: [{ who: "elias", text: `Elias takes exactly as long as it takes to agree. "Medical, then. Once, in private, the whole file. After that it is hers to carry too."` }] }
    ],
    onEnter: () => {
      state.past_known = true;
      state.past_known_by.elias = true;
      remember("Elias named the cost of your seat. The file is still his.");
    }
  },

  // PRE: medical route with an existing dead-Lena exit | WRITES: paid choices affect resources/pregnancy_risk/lean; governed floor writes pregnancy_risk="unknown"
  // PREGNANCY-LENA-01: living participant opening reads romance.lena only; entry/render write nothing
  // DEATH: none | DEAD SPEECH/APPEARANCE: Lena text and recovered-Tomas routing are guarded
  // IMAGE: unchanged living images/lena.jpg / absent images/corridor_pressure_3.jpg resolver; no art work
  pregnancy_check: {
    get text() {
      if (!isAlive("lena")) {
        return `There is no medical officer left to translate private risk into protocol. Whatever has happened between people on this ship will have to surface some other way — or not at all.`;
      }
      const opening = state.romance.lena
        ? "We crossed that line together. We need to talk about the medical reality."
        : "If you have been with anyone, we need to talk about the medical reality.";
      return `Lena stops you in the corridor. Her expression is clinical and something else underneath.

"${opening} This ship does not have the margin for an unplanned pregnancy. The vault already carries the future. A living pregnancy competes for the same resources and the same oxygen."

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
        { text: "There is a possibility. Prepare for both outcomes.", next: after, effects: { cohesion: -2, supplies: -6, embryos: -3 }, flag: { pregnancy_risk: true }, requires: { supplies: { min: 12 }, trust: { lena: 40 } }, lean: { living: 3 }, reply: [{ who: "lena", text: `"Then I plan for both and stock for both," Lena says, already writing. "Some of it comes out of the vault margin. The draw goes on the board as medical. No names."` }] },
        { text: "It will not become a problem. Handle prevention.", next: after, effects: { supplies: -3, cohesion: 1 }, flag: { pregnancy_risk: false }, reply: [{ who: "lena", text: `Lena handles it that shift with the medical hatch shut and logs one line: prophylaxis, elective, complete. "Chart closed," she says. "Not because it was small. Because it belongs to the people in it."` }] },
        { text: "That is private. Do your job when asked.", next: after, effects: { cohesion: -5, integrity: -1 }, flag: { pregnancy_risk: "unknown" }, reply: [{ who: "lena", text: `"Understood, Commander." Lena writes one word on her chart and turns it face down. "When you do ask, ask early. Late costs more. That is not a threat. That is pharmacology."` }] },
        { text: "End the discussion. There is nothing left to spend.", next: after, flag: { pregnancy_risk: "unknown" }, reply: [{ who: "lena", text: `Lena does not argue. "Then it stays an open question," she says. "In my department those get more expensive by the day. If the answer changes, I want to be the first to know."` }] }
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

      let t = `Tomas finds you alone.\n\nFor the first time since he came aboard his calm is gone. His voice is low and raw.\n\n`;
      if (state.flags.vault_sacrifice === "future") {
        t += `"You chose the vault before I was aboard to argue it. I have walked the habitation ring since, and I can tell you the names of the people who sleep in the dark it left. People noticed. I noticed."\n\n`;
      } else if (state.flags.vault_sacrifice === "living") {
        t += `"You chose the living. The vault numbers dropped. Some of them will not forgive that. I am not sure I will either — or that I should."\n\n`;
      } else {
        t += `"I have held every confession this crew has offered. I have sat with the dying and the guilty and the ones who want permission to stop caring. I am running out of something. Not faith. Something quieter."\n\n`;
      }
      // SUN-CALLBACKS-01: the ring's dead, through a present habit. Text only.
      // SUN-DEATH-REACTIONS-01: and the dead he ate beside after the tether, in order of death.
      const table = deadSinceTether();
      const tableNames = whatRemainsJoinNames(table);
      if (state.flags.crisis === "vent") {
        t += `"I set a plate for Amara and one for Sela at the evening meal. I never got to eat with them here.`;
        if (table.length) t += ` I did eat with ${tableNames}, and ${table.length === 1 ? "that plate is" : "those plates are"} the hardest to set.`;
        t += ` Habit is cheaper than grief, and it keeps longer."\n\n`;
      } else if (table.length) {
        t += `"I set a plate${table.length > 1 ? " each" : ""} for ${tableNames} at the evening meal, in the ${table.length > 1 ? "places" : "place"} I am used to seeing filled. Habit is cheaper than grief, and it keeps longer."\n\n`;
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
          alive: "tomas",
          reply: [{ who: "tomas", text: `Tomas lets out a breath he has been holding for longer than this conversation. "Always is a long word," he says. "I am going to hold you to every letter of it." The calm comes back slowly, and this time it holds.` }]
        },
        {
          text: "Tell him the future is the only thing that justifies any of this.",
          next: "act3_lethal_tomas_cost",
          effects: { cohesion: -4, integrity: 2 },
          flag: { tomas: "future" },
          lean: { future: 4 },
          mark: { tomas: "broke" },
          alive: "tomas",
          reply: [{ who: "tomas", text: `Tomas hears it the way he would hear a ration cut. "Then that is the ledger, Commander." The calm comes back into his face all at once, and it is worse than the rawness was. He does not argue.` }]
        },
        {
          text: "Ask him to hold on a little longer. You need him intact.",
          next: "act3_lethal_tomas_cost",
          effects: { cohesion: 2, supplies: -1 },
          flag: { tomas: "hold" },
          requires: { trust: { tomas: 45 } },
          mark: { tomas: "held" },
          alive: "tomas",
          reply: [{ who: "tomas", text: `"A little longer," Tomas repeats, weighing it like a seed tray. "I can do a little longer. I have done it on less." He looks up. "Intact is your word. I will remember you chose it."` }]
        }
      ];
    },
    image: "images/tomas_break.jpg"
  },

  // --- 0.22.1 Explicit Art Utilization (one-shot pure-data aftermath variants) ---
  // Gates: romance + isAlive + !done flag. Declining original choices leaves spine identical.
  // Dead characters never speak or appear.

});
