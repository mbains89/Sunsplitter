// Sunsplitter — scenes-39.js
// 0.28.1c size hygiene. Pure mechanical. early: intro_lena through status
// Strict scene shape only: text | choices | onEnter | image
registerScenes({

  intro_lena: {
    text: `Dr. Lena Voss does not waste words.

She finishes sealing the body bag, washes her hands twice, then faces you.

"I have enough antibiotics for two serious infections and one surgical kit with no anesthetics left. If we lose another hull seal, the CO₂ will climb faster than I can treat the symptoms."

She glances once at the empty recovery racks.

"I will keep the rest alive as long as the ship lets me. That is the only promise I can make."`,
    choices: [
      { text: "Give her authority over all medical decisions without question.", next: "intro_elias", effects: { cohesion: 4, supplies: -3 }, flag: { lena_authority: true }, affinity: { lena: 15 }, trust: { lena: 12 }, reply: [{ who: "lena", text: `"Noted," Lena says. "Authority received, prognosis unchanged." She turns back to the racks. "I will waste nothing. Starting with your time."` }] },
      { text: "Tell her every major intervention needs your approval. Resources are that tight.", next: "intro_elias", effects: { cohesion: -3, supplies: 2 }, flag: { lena_authority: false }, affinity: { lena: -8 }, trust: { lena: -10 }, reply: [{ who: "lena", text: `Lena dries her hands before she answers. "Then every dose goes through you, and so does every death I could have stopped while I waited for a signature. Put that on the chart, Commander. I will."` }] }
    ],
    onEnter: () => { if (!state.dead.includes("rourke")) kill("rourke", "died while command was taken"); }
  },
  intro_elias: {
    text: `Elias Kane is waiting in the corridor outside medical. He does not wait long for people.

"Rourke. Docking crew. He was always going to die. The question is how many more we write off before the math forces your hand. I can keep order. I can keep people working. I can keep the weapons locked and the corridors quiet. What I cannot do is pretend soft leadership will survive the first real shortage."

He studies you.

"Decide how hard you intend to hold this ship before the empty decks decide for you."`,
    choices: [
      { text: "Give him security authority and the right to enforce work quotas.", next: "vault_reveal", effects: { integrity: 3, cohesion: -6 }, flag: { elias_power: "high", leadership_style: "hard" }, affinity: { elias: 12 }, trust: { elias: 15, lena: -5, tomas: -5 }, reply: [{ who: "elias", text: `Elias does not thank you. He takes the locker keys himself. "Quotas start next shift. Anyone who argues, you hear the name from me first. That is the courtesy, Commander. There is only one."` }] },
      { text: "Keep security under your direct control. No freelancing.", next: "vault_reveal", effects: { cohesion: 3 }, flag: { elias_power: "limited", leadership_style: "balanced" }, affinity: { elias: 4 }, trust: { elias: 0 }, reply: [{ who: "elias", text: `"Understood, Commander." He holds your eye one beat longer than the word needs. "Your corridors. When one goes wrong at oh-three-hundred, I will be standing in it, waiting on your order."` }] }
    ]
  },





  // PRE: intro_elias exit | WRITES: vault_priority, immediate resource allocation, ideology lean, affinity, trust; degraded floor preserves L-021
  // DEATH: none | DEAD SPEECH/APPEARANCE: all named speakers are present at this early fixed-roster beat
  // IMAGE: REUSE images/vault_reveal.jpg; ART-R2 remains separate
  vault_reveal: {
    get text() { return `${isAlive("mira") ? `${["stayed", "stopped", "tried"].includes(state.flags.rourke) ? "Mira" : "Mira Solis, the drive engineer,"} stops you in the corridor outside the sealed cargo section.\n\n"You need to see this before you give any more orders."` : ""}\n\n${isAlive("mira") ? `She opens a secondary hatch.` : ""} Cold air rolls out. Rows of cryogenic cylinders line the walls, each one marked with a genetic code and a viability percentage. Below them, sealed containers of soil starters, fertilizer compounds, and genetic archives.\n\n${isAlive("mira") ? `"This is what the Sunsplitter was actually built for. Restart package first — embryos, archives, soil starters."` : ""}\n\nThe monitoring panel still cycles: EMBRYOS VIABLE — 100%. POWER DRAW — STABLE. Empty crew manifests scroll in a side pane and nobody has had the nerve to clear them.\n\n${isAlive("elias") ? `Elias stands in the doorway, arms folded. "Now you know what the real cargo is. Every decision from here on is about which future we feed."` : ""}\n\n${isAlive("lena") ? `Lena, from behind you: "We are also still alive. Do not forget which side of the glass you are on."` : ""}\n\nThe order is not a virtue test. It is a declaration of which reserve takes the first loss.`; },
    get choices() {
      const mandates = [
        { text: "Living priority — divert vault power to habitation now. Cohesion rises; embryo viability takes the first loss.", next: "status", effects: { cohesion: 4, embryos: -5 }, flag: { vault_priority: "living" }, lean: { living: 6 }, affinity: { lena: 8, tomas: 10, elias: -6 }, trust: { lena: 10, tomas: 12, elias: -8, jiro: -4 }, reply: [{ who: "mira", text: `Mira logs the reallocation without looking up. "Vault draw down twelve percent. Viability takes the loss first. I will post the number daily, so nobody has to ask."` }, { who: "lena", text: `Behind you, Lena lets out a breath she has been holding since the hatch opened.` }] },
        { text: "Future priority — ring-fence vault power and the restart package. Preserve the full embryo ceiling; cohesion takes the first loss.", next: "status", effects: { cohesion: -3 }, flag: { vault_priority: "future" }, lean: { future: 6 }, affinity: { elias: 10, jiro: 8, lena: -6, tomas: -8 }, trust: { elias: 12, jiro: 10, lena: -6, tomas: -10 }, reply: [{ who: "elias", text: `"Correct call," Elias says, to nobody in particular, and goes to tell the habitation ring why it will be colder.` }, { who: "lena", text: `Lena stays at the glass. "Write down that we chose," she says. "Not that it happened to us. That we chose."` }] },
        { text: "Dual mandate — keep both grids funded for now. Spend active stores to carry the overlap.", next: "status", effects: { cohesion: 1, supplies: -3 }, flag: { vault_priority: "both" }, lean: { future: 2, living: 2 }, affinity: { mira: 6 }, reply: [{ who: "mira", text: `"Both grids." Mira is already rerouting. "That holds until it does not. I will tell you which week. I will not be early."` }] }
      ];
      if (!mandates.some(choice => canAffordEffects(choice.effects))) {
        mandates.push({ text: "No reserve can move. Record a dual mandate without reallocating power.", next: "status", flag: { vault_priority: "both" }, lean: { future: 1, living: 1 }, reply: [{ who: "mira", text: `The mandate goes on the board in your words. Nothing moves. Mira reads it twice and says nothing, which from Mira is a sentence.` }] });
      }
      return mandates;
    }
  },
  status: {
    get text() {
      const n = visibleLivingCrewCount();
      let t = `You gather what remains of your people in the corridor outside medical.\n\n`;
      t += `${n} living besides you.`;
      if (!isAlive("rourke")) t += ` One body already cooling.`;
      t += `\n\n`;
      const roll = [];
      if (isAlive("lena")) roll.push(`Lena Voss, medical.`);
      if (isAlive("elias")) roll.push(`Elias Kane, security.`);
      if (isAlive("mira")) roll.push(`Mira Solis, drive systems.`);
      if (isAlive("amara")) roll.push(`Amara Vale, hydroponics.`);
      if (isAlive("sela")) roll.push(`Sela, twenty, no posting, who paints yellow suns on the bulkheads.`);
      if (roll.length) t += `The roll is short. ${roll.join(" ")}\n\n`;
      if (isAlive("mira")) {
        t += `Mira gives the report in a thin voice:\n\n"Primary drive offline. Auxiliary power only. Life support holding at sixty-two percent. Food and water maybe five weeks if we ration hard. Hull breach on Deck 3 sealed but temporary. Navigation half-blind. No destination."\n\n`;
      } else {
        t += `The systems board gives the report without a voice: drive offline, life support at sixty-two percent.\n\n`;
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
