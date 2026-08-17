// Sunsplitter — scenes-mid-a-a3.js
// Split from scenes-mid-a.js (0.28.1c size hygiene). Pure mechanical.
// Mid-a: past_leak through vault_voice.
// Strict scene shape only: text | choices | onEnter | image
registerScenes({

  past_leak: {
    text: `Elias is waiting when you leave the blister.

He does not raise his voice. He never needs to.

"I know what you did to get your place on this ship. The people who should have been in your seat are not here because of a decision you made on the ground. I have the records. I have kept them quiet because a ship without a commander is worse than a ship with a compromised one."

He lets that sit.

"I am not asking for a confession. I am telling you that the truth is a resource. If cohesion keeps falling, I will spend it."`,
    choices: [
      { text: "Admit it. Own the cost in front of him.", next: "transmission", effects: { cohesion: -4 }, flag: { past: "owned" } },
      { text: "Tell him that the past is dead and the only ledger that matters is the living.", next: "transmission", effects: { cohesion: -6 }, flag: { past: "denied" } },
      { text: "Ask what he wants in exchange for silence.", next: "transmission", effects: { cohesion: -2 }, flag: { past: "deal" } }
    ],
    onEnter: () => { state.past_known = true; }
  },
  transmission: {
    get text() {
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
    choices: [
      { text: "Change course enough to investigate. We have to know.", next: "vault_voice", effects: { supplies: -8, cohesion: 3, integrity: -3 }, flag: { signal: "chase" }, requires: { supplies: { min: 15 }, integrity: { min: 35 } }, lean: { living: 2 } },
      { text: "Before the signal — hear Elias out on the ground-side file.", next: "history_elias", alive: "elias" },
      { text: "Log it and hold course. We cannot afford ghosts.", next: "vault_voice", effects: { cohesion: -2, integrity: 2 }, flag: { signal: "ignore" }, lean: { future: 2 } },
      { text: "Have Mira try to decode more before we decide.", next: "vault_voice", effects: { supplies: -3, cohesion: 1, integrity: -1 }, flag: { signal: "study" }, requires: { supplies: { min: 8 }, trust: { mira: 35 } }, alive: "mira" }
    ]
  },
  vault_voice: {
    get text() {
      let t = `The vault monitoring panel has begun speaking.

Not an alarm. A voice. Soft, almost childlike, cycling through fragments of the original mission briefing and then, without warning, the names of the dead.

`;
      if (isAlive("mira")) {
        t += `Mira stands in front of it with her arms crossed tightly.

"It is a residual interface. The system was designed to report status to a living crew at the destination. Something in the power fluctuations woke a deeper layer. It is not conscious. It is worse. It is obedient to a purpose that no longer has a world."

`;
      } else {
        t += `The residual interface was designed to report status to a living crew at the destination. Power fluctuations woke a deeper layer. It is not conscious. It is obedient to a purpose that no longer has a world.

`;
      }
      if (isAlive("tomas")) {
        t += `Tomas is also there. He has not told anyone else.

`;
      }
      t += `"Some of the crew have started treating it as a presence.`;
      if (isAlive("amara")) t += ` Amara left a plant cutting on the hatch.`;
      if (isAlive("elias")) t += ` Elias wants the audio disabled.`;
      t += `"`;
      return t;
    },
    onEnter: () => {
      if (state.flags.past === "lena_only") state.past_known_by.lena = true;
    },
    choices: [
      { text: "Disable the voice. It is a system, not a ghost.", next: "arc_fork", effects: { cohesion: -3, integrity: 2 }, flag: { vault_voice: "off" }, lean: { future: 2 } },
      { text: "Leave it. Let people hear what they need to hear.", next: "boarding_stories", effects: { cohesion: 4, supplies: -1 }, flag: { vault_voice: "on" }, lean: { living: 2 }, requires: { cohesion: { min: 30 } } },
      { text: "Restrict access. Only you and Mira hear it from now on.", next: "arc_fork", effects: { cohesion: -1, integrity: 1 }, flag: { vault_voice: "restricted" }, requires: { trust: { mira: 40 } }, alive: "mira" }
    ]
  },

});
