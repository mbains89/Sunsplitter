// Sunsplitter — scenes-04.js
// 0.28.1c size hygiene. Pure mechanical. mid-a: romance_lena_sex + past_leak + transmission
// Strict scene shape only: text | choices | onEnter | image
registerScenes({

  // PRE: Lena living; reached only after the explicit romance_lena_1 consent choice
  // WRITES: first entry sets romance.lena, affinity/trust, mark.lena=dying_held, and one memory
  // DEATH: none | DEAD SPEECH/APPEARANCE: dead Lena redirects before text/image/choices
  // IMAGE: REUSE images/afterglow_lena.jpg; earned aftermath, Commander absent; L-025 audited
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
    image: "images/afterglow_lena.jpg"
  },


  // PRE: early Elias confrontation on an Elias-live route | WRITES: onEnter past_known; paid choices affect cohesion/past flag; governed floor writes nothing
  // DEATH: none | DEAD SPEECH/APPEARANCE: Elias is guaranteed living by the route
  // IMAGE: REUSE images/elias.jpg; no new art request
  past_leak: {
    text: `Elias is waiting when you leave the blister.

He does not raise his voice. He never needs to.

"I know what you did to get your place on this ship. The people who should have been in your seat are not here because of a decision you made on the ground. I have the records. I have kept them quiet because a ship without a commander is worse than a ship with a compromised one."

He lets that sit.

"I am not asking for a confession. I am telling you that the truth is a resource. If cohesion keeps falling, I will spend it."`,
    choices: [
      { text: "Admit it. Own the cost in front of him.", next: "transmission", effects: { cohesion: -4 }, flag: { past: "owned" }, reply: [{ who: "elias", text: `Elias hears all of it without interrupting. When you finish, he nods once. "Now it is yours instead of mine," he says. "That is worth something. Less than you think." The records stay where they are.` }] },
      { text: "Tell him that the past is dead and the only ledger that matters is the living.", next: "transmission", effects: { cohesion: -6 }, flag: { past: "denied" }, reply: [{ who: "elias", text: `"The living," Elias repeats. "The living are the ones who will read the records, Commander." He does not argue further. He has the records.` }] },
      { text: "Ask what he wants in exchange for silence.", next: "transmission", effects: { cohesion: -2 }, flag: { past: "deal" }, reply: [{ who: "elias", text: `"Nothing yet," Elias says. "Good order. Quiet corridors. When I want something, I will ask in a way you cannot misread." He leaves the price unnamed, which is the price.` }] },
      { text: "End the conversation. Give him nothing else tonight.", next: "transmission", reply: [{ who: "elias", text: `Elias steps aside to let you pass. "Tonight," he agrees.` }] }
    ],
    onEnter: () => { state.past_known = true; }
  },
  // SUN-SIGNAL-RETURN-01: hearing Elias out first is a detour, not a decision. history_elias ->
  // prom_make_elias -> prom_r_elias come back here while flags.signal is unset. A return is read
  // from past_known_by.elias, which only history_elias writes (and only this scene leads there):
  // it prints one short line instead of the briefing and offers the same signal choices, less the detour.
  transmission: {
    get text() {
      if (state.past_known_by && state.past_known_by.elias) {
        return `The signal is still repeating on the board when you get back: the same degraded string, the same coordinates that match nothing. No one has logged an order on it.`;
      }
      if (isAlive("jiro")) {
        return `Jiro intercepts you with a tablet.

"There is a signal. Faint. Repeating. It is not natural and it is not from the vault. It appears to be a human carrier wave, degraded, looping a short identification string and coordinates that do not match any known system."

He looks at you without expression.

"Investigating it will cost fuel and time we may not recover. Ignoring it means we accept that we are the only ones left. Or that we are being hunted."`;
      }
      if (isAlive("mira")) {
        return `Mira finds you with a tablet and a face that has not slept.

"There is a signal. Faint. Repeating. Not natural, not from the vault. Human carrier wave, degraded — short identification string and coordinates that do not match any known system."

She does not soften it.

"Investigating it will cost fuel and time we may not recover. Ignoring it means we accept that we are the only ones left. Or that we are being hunted."`;
      }
      return `A repeating carrier wave surfaces on the passive array. Faint. Degraded. Human-shaped identification string and coordinates that match no known system.

No one living claims the discovery as a conversation. The board simply reports the cost: fuel and time you may not recover if you chase it, or the acceptance that you are alone if you do not.`;
    },
    get choices() {
      const heardElias = !!(state.past_known_by && state.past_known_by.elias);
      return [
        { text: "Change course enough to investigate. We have to know.", next: "vault_voice", effects: { supplies: -8, cohesion: 3, integrity: -3 }, flag: { signal: "chase" }, requires: { supplies: { min: 15 }, integrity: { min: 35 } }, lean: { living: 2 }, reply: [`The burn goes in as ordered. The ship leans toward coordinates that match nothing, and the hull complains about it for an hour.`, { who: "mira", text: `"Drive's holding the load you asked for," Mira says. "The frame isn't. I'll watch the welds. You watch the fuel."` }] },
        ...(heardElias ? [] : [{ text: "Before the signal — hear Elias out on the ground-side file.", next: "history_elias", alive: "elias" }]),
        { text: "Log it and hold course. We cannot afford ghosts.", next: "vault_voice", effects: { cohesion: -2, integrity: 2 }, flag: { signal: "ignore" }, lean: { future: 2 }, reply: [`You log the carrier and hold course. The string keeps repeating under the entry.`, { who: "mira", text: `"Logged. Cause unknown," Mira says. "I'm putting that in the entry too, so nobody reads it later and thinks we checked."` }] },
        { text: "Have Mira try to decode more before we decide.", next: "vault_voice", effects: { supplies: -3, cohesion: 1, integrity: -1 }, flag: { signal: "study" }, requires: { supplies: { min: 8 }, trust: { mira: 35 } }, alive: "mira", reply: [{ who: "mira", text: `Mira gives the string three hours of spare power. "Identification block is forty percent recoverable. That isn't enough to name it, and I won't guess."` }] }
      ];
    }
  },
});
