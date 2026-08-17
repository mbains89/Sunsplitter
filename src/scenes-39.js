// Sunsplitter — scenes-39.js
// 0.28.1c size hygiene. Pure mechanical. early: intro_lena through status
// Strict scene shape only: text | choices | onEnter | image
registerScenes({

  intro_lena: {
    text: `Dr. Lena Voss does not waste words.

She finishes sealing the body bag, washes her hands twice, then faces you.

"I have enough antibiotics for two serious infections and one surgical kit with no anesthetics left. The air scrubbers are already filtering blood particulates. If we lose another hull seal, the CO₂ will climb faster than I can treat the symptoms."

She glances once at the empty recovery racks — capacity for a full medical wing. Nine people do not need a wing.

"I will keep them alive as long as the ship lets me. That is the only promise I can make."`,
    choices: [
      { text: "Give her authority over all medical decisions without question.", next: "intro_elias", effects: { cohesion: 4, supplies: -3 }, flag: { lena_authority: true }, affinity: { lena: 15 }, trust: { lena: 12 } },
      { text: "Tell her every major intervention needs your approval. Resources are that tight.", next: "intro_elias", effects: { cohesion: -3, supplies: 2 }, flag: { lena_authority: false }, affinity: { lena: -8 }, trust: { lena: -10 } },
      { text: "Ask her what she needs most right now.", next: "intro_elias", effects: { cohesion: 2, supplies: -5 }, flag: { lena_authority: true }, affinity: { lena: 10 }, trust: { lena: 8 } }
    ],
    onEnter: () => { if (!state.dead.includes("rourke")) kill("rourke", "died while command was taken"); }
  },
  intro_elias: {
    text: `Elias Kane is waiting in the corridor outside medical. He does not wait long for people.

"Rourke was always going to die. The question is how many more we write off before the math forces your hand."

He is tall, scarred, and already thinking three crises ahead.

"I can keep order. I can keep people working. I can keep the weapons locked and the corridors quiet. What I cannot do is pretend soft leadership will survive the first real shortage."

He studies you.

"Decide how hard you intend to hold this ship before the empty decks decide for you."`,
    choices: [
      { text: "Give him security authority and the right to enforce work quotas.", next: "vault_reveal", effects: { integrity: 3, cohesion: -6 }, flag: { elias_power: "high", leadership_style: "hard" }, affinity: { elias: 12 }, trust: { elias: 15, lena: -5, tomas: -5 } },
      { text: "Keep security under your direct control. No freelancing.", next: "vault_reveal", effects: { cohesion: 3 }, flag: { elias_power: "limited", leadership_style: "balanced" }, affinity: { elias: 4 }, trust: { elias: 0 } },
      { text: "Tell him you will not rule by fear. He will have to adapt.", next: "vault_reveal", effects: { cohesion: 5, integrity: -2 }, flag: { elias_power: "low", leadership_style: "soft" }, affinity: { elias: -10 }, trust: { elias: -12, tomas: 8 } }
    ]
  },





  vault_reveal: {
    text: `Mira stops you in the corridor outside the sealed cargo section.

"You need to see this before you give any more orders."

She opens a secondary hatch. Cold air rolls out. Rows of cryogenic cylinders line the walls, each one marked with a genetic code and a viability percentage. Below them, sealed containers of soil starters, fertilizer compounds, and genetic archives.

"This is what the Sunsplitter was actually built for. Not a lifeboat. A colonization ark. Restart package first — embryos, archives, soil starters. The living complement was supposed to be thousands. We got nine through the hatch when the cascade closed the sky."

The monitoring panel still cycles: EMBRYOS VIABLE — 100%. POWER DRAW — STABLE. Empty crew manifests scroll in a side pane and nobody has had the nerve to clear them.

Elias stands in the doorway, arms folded. "Now you know what the real cargo is. Every decision from here on is about which future we feed."

Lena, from behind you: "We are also still alive. Do not forget which side of the glass you are on."

The argument that will define the rest of the voyage has names now. Future. Living. This lean will return — in who trusts you, what options stay open, and what the ship remembers. Leadership is a separate question: how hard you hold the living while you answer it.`,
    choices: [
      { text: "The living come first. We protect the people who are already breathing.", next: "status", effects: { cohesion: 4 }, flag: { vault_priority: "living" }, lean: { living: 6 }, affinity: { lena: 8, tomas: 10, elias: -6 }, trust: { lena: 10, tomas: 12, elias: -8, jiro: -4 } },
      { text: "This is the only future that matters. Everything else is temporary.", next: "status", effects: { cohesion: -3 }, flag: { vault_priority: "future" }, lean: { future: 6 }, affinity: { elias: 10, jiro: 8, lena: -6, tomas: -8 }, trust: { elias: 12, jiro: 10, lena: -6, tomas: -10 } },
      { text: "We protect both until the ship forces a choice.", next: "status", effects: { cohesion: 1 }, flag: { vault_priority: "both" }, lean: { future: 2, living: 2 }, affinity: { mira: 6 } }
    ]
  },
  status: {
    get text() {
      const n = state.survivors;
      let t = `You gather what remains of your people in the corridor outside medical.\n\n`;
      t += `${n} living.`;
      if (!isAlive("rourke")) t += ` One body already cooling.`;
      t += ` The manifests still list capacity for a colony. Most of those berths will never be filled.\n\n`;
      t += `Behind a sealed hatch: one hundred percent of a future that has never drawn breath.\n\n`;
      if (isAlive("mira")) {
        t += `Mira gives the report in a thin voice:\n\n"Primary drive offline. Auxiliary power only. Life support holding at sixty-two percent. Food and water maybe five weeks if we ration hard. Hull breach on Deck 3 sealed but temporary. Navigation half-blind. No destination. Vault power stable — for now."\n\n`;
      } else {
        t += `The systems board gives the report without a voice: drive offline, life support at sixty-two percent, vault power stable — for now.\n\n`;
      }
      if (isAlive("elias")) t += `Elias: "And no one is coming for us."\n\n`;
      if (isAlive("lena")) t += `Lena asks the question no one else will:\n\n"What are your orders, Commander?"`;
      else t += `Someone asks, without rank: "What are your orders?"`;
      return t;
    },
    choices: [
      { text: "Prioritize life support and hull. Everything else secondary.", next: "priority_repairs", effects: { integrity: 12, supplies: -7 }, flag: { priority: "repairs" }, lean: { living: 3 }, affinity: { mira: 6, amara: 4 } },
      { text: "Ration immediately. Strict. No exceptions.", next: "priority_ration", effects: { supplies: 10, cohesion: -8 }, flag: { priority: "ration" }, lean: { future: 2 }, affinity: { elias: 6, amara: -4 } },
      { text: "We need a destination. Find anything that can still be a world.", next: "priority_planet", effects: { cohesion: 5, supplies: -3 }, flag: { priority: "planet" }, lean: { future: 3, living: 2 }, affinity: { jiro: 8, sela: 6 } }
    ]
  },
});
