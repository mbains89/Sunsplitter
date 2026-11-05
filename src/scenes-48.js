// Sunsplitter — scenes-48.js
// 0.28.1c size hygiene. Pure mechanical. crewpairs: open + lena + elias
// Strict scene shape only: text | choices | onEnter | image
registerScenes({

  // L-026: zero-eligible bypass and one-eligible auto-route are defensive
  // save-recovery guards, not ordinary playable content. Preserve junctionChoice:
  // zero writes "none"; one defers the write to its destination scene; two-or-more
  // leaves the existing value untouched while rendering the ordinary selector.
  offshift_open: {
    image: "images/corridor_variant.jpg",
    onEnter: () => {
      const eligible = [];
      if (eligLena())  eligible.push("lena");
      if (eligElias()) eligible.push("elias");
      if (eligMira())  eligible.push("mira");
      if (eligTomas()) eligible.push("tomas");
      if (eligAmara()) eligible.push("amara");
      if (eligJiro())  eligible.push("jiro");
      if (eligSela())  eligible.push("sela");
      if (eligVess())  eligible.push("vess");
      if (eligible.length === 0) {
        state.flags.junctionChoice = "none";
        return "faction_split";
      }
      if (eligible.length === 1) {
        return eligible[0] === "sela" ? "filters_stencil" : "offshift_" + eligible[0];
      }
      // ≥2: render asks
    },
    get text() {
      let t = `The ship is quiet the way it never is: on purpose. The crisis is paid for, the watch rotation holds without you, and for one shift the deck under your feet ticks as it cools instead of shuddering. You have an hour that belongs to no alarm. The air handler breathes in, holds, breathes out. Then the hour starts asking for itself.\n\n`;
      if (eligLena())  t += `The medbay channel clicks once. Lena, verdict first, as always: "Medbay. One hour. Bring nothing. That is the entire prescription."\n\n`;
      if (eligElias()) t += `Two knocks at your hatch, spaced like a countdown. No voice with them. You know whose knock keeps its own clock.\n\n`;
      if (eligMira())  t += `A message with a timestamp and nothing wasted: "Deck two, junction seventeen. Nine minutes of your time. I've timed it."\n\n`;
      if (eligTomas() && !state.flags.trays_dead) t += `From the grow deck: "The trays smell like rain tonight. Come eat something that grew."\n\n`;
      if (eligTomas() && state.flags.trays_dead) t += `From the grow deck: "The paste is still the enemy. Come lose to it in company for once."\n\n`;
      if (eligAmara()) t += `No message from hydroponics. Just the light left on past cycle, the way she leaves it. That was always the whole invitation.\n\n`;
      if (eligJiro())  t += `From observation: "Any hour you keep tonight, Commander. I have numbers that should be heard sitting down."\n\n`;
      if (eligSela())  t += `A written note, folded once, complete sentences: "I will perform the ritual at yellow. I am asking you to attend. I have never asked anyone before."\n\n`;
      if (eligVess())  t += `The relay bay pings, log-flat: "Query, non-urgent. One item held for review. Yours specifically. It will keep until it won't."\n\n`;
      t += `One hour. One door.`;
      return t;
    },
    get choices() {
      const c = [];
      if (eligLena())  c.push({ text: "Answer the medbay channel.", next: "offshift_lena" });
      if (eligElias()) c.push({ text: "Answer the two knocks.", next: "offshift_elias" });
      if (eligMira())  c.push({ text: "Go to junction seventeen.", next: "offshift_mira" });
      if (eligTomas()) c.push({ text: "Eat what the grow deck made.", next: "offshift_tomas" });
      if (eligAmara()) c.push({ text: "Walk toward the light left on.", next: "offshift_amara" });
      if (eligJiro())  c.push({ text: "Take the chair in observation.", next: "offshift_jiro" });
      if (eligSela())  c.push({ text: "Attend at yellow.", next: "filters_stencil" });
      if (eligVess())  c.push({ text: "Review the item Vess is holding.", next: "offshift_vess" });
      return c;
    }
  },

  offshift_lena: {
    image: "images/medical_bay.jpg",
    onEnter: () => {
      state.flags.junctionChoice = "lena";
      state.flags.lena_notes = true;
      remember("took Lena's succession notes and heard how she wants the clock to end");
    },
    get text() {
      let t = `The sterilizer hood is dark for once, and the medbay smells like tea instead of antiseptic — real leaves, hoarded from somewhere, steaming in two specimen cups. That's the hour, right there: steam you can watch rise, going nowhere, answering no alarm.\n\n`;
      t += `Two paper folders on the exam table, her handwriting on both. "Succession notes," she says. "Every living body on this ship, what keeps it running, in the order the next person will need to know it. Handwriting, because handwriting survives power loss and I won't."\n\n`;
      t += `Then the other folder, thinner. "How I want the clock to end. Short version: when it runs out, no last dose. I want the last hour, not the last treatment. Awake. Working if I can stand, watching someone competent work if I can't. Cause of death gets logged as the disease. It did the work; it gets the credit."\n\n`;
      if (state.flags.lena_regen) {
        t += `"The treatment bought me steadiness, not distance. Worth it. I'd sign for it again."\n\n`;
      } else {
        t += `"The math got shorter when we spent that dose elsewhere. I signed for that too. Both signatures were mine."\n\n`;
      }
      if (state.romance.lena) {
        t += `She waits until you've taken the folders, then uses your name — the one from before the rank, the one she spends only in private, only before something true. "That's everything I know about keeping them alive. This hour is the one thing I know about keeping me."`;
      }
      const close = closingPartnerLine();
      if (close) t += `\n\n` + close;
      return t;
    },
    get choices() {
      const c = [
        { text: "Take both folders.", next: "faction_split" },
        { text: "Ask what she wants said at yellow.", next: "faction_split" }
      ];
      if (state.romance.lena) {
        c.push({ text: "Stay the hour.", next: "faction_split" });
      }
      return c;
    }
  },

  // LOCK 4: only Mira-dead branch ships
  offshift_elias: {
    image: "images/elias.jpg",
    onEnter: () => {
      state.flags.junctionChoice = "elias";
      remember("Elias surrendered his off-log contingency");
    },
    get text() {
      let t = `His quarters smell of gun oil and thread. He's mending a jacket — not his — in tight even rows, needle hand steady, and for the length of the hour that small sound of thread through canvas is the only clock in the room.\n\n`;
      // Branch B only (Mira dead)
      t += `The jacket on the table is torn at the shoulder and unmended. His kit sits closed beside it. He sees you see it and doesn't explain.\n\n`;
      if (!attributableDeath("mira")) {
        t += `"You never asked what she was. She was what the job was for." He says it once, at the floor, and picks up the wafer instead of the needle. "That's the once."\n\n`;
      } else {
        t += `"You heard what she was. Once was the count."\n\n`;
      }
      t += `The key-wafer crosses the table the same way, with less ceremony. "Deck one, aft. A door that answered my thumb. Now it answers no one's. Post it however you want, Commander."`;
      const close = closingPartnerLine();
      if (close) t += `\n\n` + close;
      return t;
    },
    choices: [
      { text: "Take the wafer.", next: "faction_split" },
      { text: "Ask who mends the jacket now.", next: "faction_split" }
    ]
  },

});
