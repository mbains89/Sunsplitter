// Sunsplitter — scenes-mid-a-a2b.js
// Split from scenes-mid-a.js (0.28.1c size hygiene). Pure mechanical.
// Mid-a: lena_dying through romance_lena_sex.
// Strict scene shape only: text | choices | onEnter | image
registerScenes({

  lena_dying: {
    get text() {
      if (!isAlive("lena")) return `Medical is empty. The conversation you meant to have has nowhere to go.`;
      return `You stay.

Lena sits on the edge of the observation blister, looking at the drifting stars. For the first time since the launch she looks younger and older at the same time.

"I already used the last of the heavy stabilizers on Rourke. There is nothing left that will change the timeline. I can work until I can't. That is the only useful version of this."

Her hand is close to yours. The ship is quiet around you.`;
    },
    get choices() {
      if (!isAlive("lena")) return [{ text: "Move on.", next: "past_leak" }];
      const opts = [
        { text: "Promise her the work will matter. Then go deal with the crew.", next: "prom_make_lena", effects: { cohesion: 2 }, affinity: { lena: 6 }, trust: { lena: 4 } },
        { text: "Ask her whether the vault should outrank her own remaining time.", next: "prom_make_lena", effects: { cohesion: -2 }, flag: { vault_priority: "future" }, lean: { future: 2 } }
      ];
      // Intimate path: needs some trust and not already completed
      if (!state.romance.lena && !hasMark("lena", "declined")) {
        opts.unshift({ text: "Take her hand. Stay longer than duty requires.", next: "romance_lena_1", effects: { cohesion: 4 }, affinity: { lena: 8 } });
      }
      return opts;
    }
  },
  romance_lena_1: {
    get text() {
      if (!isAlive("lena")) return `The blister is empty. Whatever might have happened here has nowhere to land.`;
      return `You take her hand.

Lena looks at your fingers as if they are a diagnosis. When she speaks it is clinical and raw at once.

"I am not asking for rescue. I am asking whether you will be here while I still am. If this is pity, stop. If this is something else, say so with your body or leave."

The observation blister is cold. The ship is quiet. The line between comfort and crossing is still intact — barely.`;
    },
    get choices() {
      if (!isAlive("lena")) return [{ text: "Move on.", next: "past_leak" }];
      return [
        { text: "Cross the line. Meet her without pity.", next: "romance_lena_sex", effects: { cohesion: 3 }, affinity: { lena: 10 }, trust: { lena: 8 } },
        { text: "Hold her hand only. Stay present without sex.", next: "past_leak", effects: { cohesion: 4 }, affinity: { lena: 12 }, trust: { lena: 10 }, mark: { lena: "held_only" } },
        { text: "Step back. You will not take this from her fear.", next: "past_leak", effects: { cohesion: 1 }, affinity: { lena: 4 }, trust: { lena: 2 }, mark: { lena: "declined" } }
      ];
    }
  },

  romance_lena_sex: {
    text: `What happens next is not gentle and not slow. Clothes are pushed aside against the cold bulkhead of the observation blister. Her mouth is hungry, almost angry. Your hands find the places she has kept armored.

She is explicit in what she wants and does not ask you to be careful. The sex is hard, close, desperate — the kind that leaves marks and does not pretend it is about the future. When it is over she rests her forehead against yours for three long breaths, then straightens her clothes as if the moment can be sealed back into the wall.

"That does not change the math," she says. "But I am glad it happened. Do not make it cheap by lying about what it costs the crew if they notice."`,
    get choices() {
      // Context-aware exit: early path → past_leak; mid path (after past already known) → pursuit_window
      const next = state.past_known ? "pursuit_window" : "past_leak";
      const opts = [
        { text: "Tell her you will find a way to buy her more time.", next, effects: { cohesion: 3 }, affinity: { lena: 6 } },
        { text: "Say nothing. The body already said enough.", next, effects: { cohesion: 2 } }
      ];
      // 0.22.1 optional one-shot shower linger (only if not yet done)
      if (isAlive("lena") && !state.flags.lena_shower_done) {
        opts.push({ text: "Linger. Rinse together before the corridor takes you back.", next: "lena_shower" });
      }
      return opts;
    },
    onEnter: () => {
      const next = state.past_known ? "pursuit_window" : "past_leak";
      if (!isAlive("lena")) return next;
      if (!state.romance.lena) {
        state.romance.lena = true;
        addAffinity("lena", 35);
        addTrust("lena", 12);
        mark("lena", "dying_held");
        remember("You and Lena crossed a line in the observation blister. The crew will notice who you keep close.");
      }
    },
    image: "images/romance_lena_1.jpg"
  },


});
