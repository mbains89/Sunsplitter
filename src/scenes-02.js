// Sunsplitter — scenes-02.js
// 0.28.1c size hygiene. Pure mechanical. mid-a: cut_out + vent + self_risk
// Strict scene shape only: text | choices | onEnter | image
registerScenes({

  // PRE: lower-ring crisis cut route | WRITES: paid choices affect resources/affinity/lean; governed floor writes nothing
  // DEATH: none here | DEAD SPEECH/APPEARANCE: Jiro text is isAlive-gated; Amara/Sela are survivors on this route
  // IMAGE: REUSE images/cut_out.jpg; no new art request
  cut_out: {
    get text() {
      let t = `You order the cut.\n\n${isAlive("mira") ? `Mira works like someone who has already accepted she might die today. Sparks. Screaming metal. The bulkhead finally gives.` : ""}\n\n`;
      if (isAlive("jiro") && isAlive("amara") && isAlive("sela")) {
        t += `All three come out alive. Sela is silent with shock. Amara is shaking. Jiro will not release Sela.\n\n`;
      } else if (isAlive("amara") && isAlive("sela")) {
        t += `Amara and Sela come out alive. Sela is silent with shock. Amara is shaking.\n\n`;
      }
      if (state.flags.priority === "repairs") {
        t += `The cascade Mira feared is smaller than it could have been. Hull still drops, but the ship holds.\n\n`;
      } else {
        t += `The cascade Mira feared begins twenty minutes later in a different system. Hull drops hard. You will feel this decision for the rest of the voyage.\n\n`;
      }
      if (isAlive("amara")) t += `When Amara looks at you, she does not look away.`;
      return t;
    },
    choices: [
      { text: "Send them to triage. The cut is already paid.", next: "aftermath" }
    ]
  },
  // PRE: lower-ring crisis vent route | WRITES: onEnter kills Amara/Sela and present-or-recovered Jiro, writes marks/memory; paid choices affect cohesion/affinity; governed floor writes nothing
  // DEATH: Amara/Sela and present-or-recovered Jiro die on entry | DEAD SPEECH/APPEARANCE: names are the authored memorial list for those killed here
  // IMAGE: REUSE images/vent.jpg; no new art request
  vent: {
    get text() {
      // 0.22.0: only name those present / killed here
      const names = ["Amara"];
      if (isAlive("jiro") || isRecovered("jiro")) names.push("Jiro");
      names.push("Sela");
      const n = names.length;
      return `You give the order.\n\nThe section seals. The vents open. The screaming on the intercom lasts eleven seconds.\n\nThen only the sound of the ship.\n\n${n} fewer survivors. One of them was twenty years old and still drawing suns on the bulkhead the day she died.\n\n${names.join(". ")}.\n\nNo one speaks to you for a long time. ${isAlive("elias") ? `Elias puts a hand on your shoulder and leaves it there.` : ""} ${isAlive("lena") ? `Lena returns to her work as if nothing happened.` : ""}\n\nSela's last yellow circle remains fixed above the sealed bulkhead. No one has asked permission to remove it.`;
    },
    choices: [
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
    get text() { return `You go yourself.\n\n${isAlive("mira") && isAlive("elias") ? `With Mira directing, you and Elias force a secondary access.` : ""} You take the worst of the exposure. Your lungs burn. Your vision tunnels.\n\nYou get them out. The ones who were behind the bulkhead are breathing.\n\n${isAlive("lena") ? `You spend the next day in medical under Lena's care. She does not scold you. She simply says:\n\n"Do not make a habit of this. We cannot afford to lose the only person they still listen to."` : ""}\n\nThe ship is weaker. You are weaker. The people are still alive.\n\n${isAlive("elias") ? `While you recovered, Elias held temporary command. He did not enjoy it. That is the only reason you still have it.` : ""}`; },
    choices: [
      { text: "Get up. The crew needs to see you upright.", next: "aftermath" }
    ]
  },
});
