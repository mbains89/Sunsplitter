// Sunsplitter — scenes-02.js
// 0.28.2 size hygiene. Pure mechanical. mid-a: cut_out + vent + self_risk
// Strict scene shape only: text | choices | onEnter | image
registerScenes({

  cut_out: {
    get text() {
      let t = `You order the cut.

Mira works like someone who has already accepted she might die today. Sparks. Screaming metal. The bulkhead finally gives.

`;
      if (isAlive("jiro")) {
        t += `All three come out alive. Sela is silent with shock. Amara is shaking. Jiro will not release Sela.\n\n`;
      } else {
        t += `Amara and Sela come out alive. Sela is silent with shock. Amara is shaking. The space where a third body should have been stays empty.\n\n`;
      }
      if (state.flags.priority === "repairs") {
        t += `The cascade Mira feared is smaller than it could have been. Hull still drops, but the ship holds.

`;
      } else {
        t += `The cascade Mira feared begins twenty minutes later in a different system. Hull drops hard. You will feel this decision for the rest of the voyage.

`;
      }
      t += `When Amara looks at you, she does not look away.`;
      return t;
    },
    choices: [
      { text: "Check on Amara and Sela yourself.", next: "aftermath", effects: { cohesion: 3, supplies: -1 }, affinity: { amara: 8, sela: 6 }, lean: { living: 2 } },
      { text: "Send Lena. You need to account for the cascade.", next: "aftermath", effects: { integrity: 3, cohesion: -1, supplies: -2 }, lean: { future: 1 } },
      { text: "Send them to triage. Spend nothing more here.", next: "aftermath" }
    ]
  },
  vent: {
    get text() {
      // 0.22.0: only name those present / killed here
      const names = ["Amara"];
      if (isAlive("jiro") || isRecovered("jiro")) names.push("Jiro");
      names.push("Sela");
      const n = names.length;
      return `You give the order.

The section seals. The vents open. The screaming on the intercom lasts eleven seconds.

Then only the sound of the ship.

${n} fewer survivors. One of them was twenty years old and still drawing suns on the bulkhead the day she died.

${names.join(". ")}.

No one speaks to you for a long time. Elias puts a hand on your shoulder and leaves it there. Lena returns to her work as if nothing happened.

Sela's last yellow circle remains fixed above the sealed bulkhead. No one has asked permission to remove it.`;
    },
    choices: [
      { text: "Stand at the sealed bulkhead. Let them see you there.", next: "aftermath", effects: { cohesion: -4 } },
      { text: "Do not linger. The ship still needs orders.", next: "aftermath", effects: { cohesion: -6 }, affinity: { elias: 5 } },
      { text: "Leave the order on the record. Move on.", next: "aftermath" }
    ],
    onEnter: () => {
      kill("amara", "vented with the lower ring");
      if (isAlive("jiro") || isRecovered("jiro")) kill("jiro", "vented with the lower ring");
      kill("sela", "vented at twenty");
      if (isAlive("tomas")) mark("tomas", "grief");
      mark("lena", "watched_vent");
      mark("elias", "approved_vent");
      remember("Amara's key still on the deck. Sela's yellow circle still on the bulkhead.");
    }
  },
  self_risk: {
    text: `You go yourself.

With Mira directing, you and Elias force a secondary access. You take the worst of the exposure. Your lungs burn. Your vision tunnels.

You get them out. The ones who were behind the bulkhead are breathing.

You spend the next day in medical under Lena's care. She does not scold you. She simply says:

"Do not make a habit of this. We cannot afford to lose the only person they still listen to."

The ship is weaker. You are weaker. The people are still alive.

While you recovered, Elias held temporary command. He did not enjoy it. That is the only reason you still have it.`,
    choices: [
      { text: "Thank Elias for holding the line. Then face the cost.", next: "aftermath", effects: { cohesion: 2, integrity: 1 }, affinity: { elias: 6 } },
      { text: "Go straight to the crew. They need to see you upright.", next: "aftermath", effects: { cohesion: 4, supplies: -1 } }
    ]
  },
});
