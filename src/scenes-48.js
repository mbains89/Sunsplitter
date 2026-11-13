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
      let t = `The ship is quiet the way it never is: on purpose. You have an hour that belongs to no alarm. Then the hour starts asking for itself.\n\n`;
      if (eligLena())  t += `The medbay channel clicks once. Lena, verdict first, as always: "Medbay. One hour. Bring nothing. That is the entire prescription."\n\n`;
      if (eligElias()) t += `Two knocks at your hatch, spaced like a countdown. You know whose knock keeps its own clock.\n\n`;
      if (eligMira())  t += `A message with a timestamp: "Deck two, junction seventeen. Nine minutes of your time. I've timed it."\n\n`;
      if (eligTomas() && !state.flags.trays_dead) t += `From the grow deck: "The trays smell like rain tonight. Come eat something that grew."\n\n`;
      if (eligTomas() && state.flags.trays_dead) t += `From the grow deck: "The paste is still the enemy. Come lose to it in company for once."\n\n`;
      if (eligAmara()) t += `No message from hydroponics. Just the light left on past cycle, the way she leaves it.\n\n`;
      if (eligJiro())  t += `From observation: "I have numbers that should be heard sitting down."\n\n`;
      if (eligSela())  t += `A written note, complete sentences: "I will perform the ritual at yellow. I am asking you to attend. I have never asked anyone before."\n\n`;
      if (eligVess())  t += `The relay bay pings, log-flat: "Query, non-urgent. One item held for review. It will keep until it won't."\n\n`;
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

  // SUN-ROMANCE-ENDINGS-REACH-01: also the late hour of a partner (or held-only) when the Commander
  // spent the junction hour with someone else; then junctionChoice keeps that pick, a bridge line
  // opens the scene and no closing line prints. Every exit is afterHour("lena").
  offshift_lena: {
    image: "images/medical_bay.jpg",
    onEnter: () => {
      if (!lateHour("lena")) state.flags.junctionChoice = "lena";
      state.flags.lena_notes = true;
      remember("took Lena's succession notes and heard how she wants the clock to end");
    },
    get text() {
      let t = lateHour("lena") ? `Down-corridor, the medbay channel light is still burning past cycle-turn. The prescription stands.\n\n` : ``;
      t += `The sterilizer hood is dark for once, and the medbay smells like tea instead of antiseptic — real leaves, hoarded from somewhere, steaming in two specimen cups. That's the hour, right there: steam you can watch rise, going nowhere, answering no alarm.\n\n`;
      t += `Two paper folders on the exam table, her handwriting on both. "Succession notes," she says. "Every living body on this ship, what keeps it running, in the order the next person will need to know it. Handwriting, because handwriting survives power loss and I won't."\n\n`;
      t += `Then the other folder, thinner. "How I want the clock to end. Short version: when it runs out, no last dose. I want the last hour, not the last treatment. Awake. Working if I can stand, watching someone competent work if I can't. Cause of death gets logged as the disease. It did the work; it gets the credit."\n\n`;
      if (state.flags.lena_regen) {
        t += `"The treatment bought me steadiness, not distance. Worth it. I'd sign for it again."\n\n`;
      } else {
        t += `"The math got shorter when we spent that dose elsewhere. I signed for that too. Both signatures were mine."\n\n`;
      }
      if (state.romance.lena) {
        t += `She waits until you've taken the folders, then uses your name — the one from before the rank, the one she spends only in private, only before something true. "That's everything I know about keeping them alive. This hour is the one thing I know about keeping me."`;
      } else if (hasMark("lena", "held_only")) {
        // SUN-ROMANCE-ARC-01 (L-050): the held-only partner is asked for the hour too. She initiates.
        t += `She waits until you've taken the folders. "That's everything I know about keeping them alive. You sat with me once and took nothing; I charted it under the right word: competent. This hour is the one thing I know about keeping me."`;
      }
      const close = lateHour("lena") ? "" : closingPartnerLine();
      if (close) t += `\n\n` + close;
      return t.trimEnd(); // SUN-EMPTY-PARAGRAPHS-01: no trailing "\n\n" when no folder line or close follows
    },
    get choices() {
      const c = [
        { text: "Take both folders.", next: afterHour("lena") },
        { text: "Ask what she wants said at yellow.", next: afterHour("lena") }
      ];
      // A broken medical line closes her offers (the existing romanceOpen rule); the hour follows it.
      if ((state.romance.lena || hasMark("lena", "held_only")) && state.promises.lena !== "broken") {
        c.push({ text: "Stay the hour.", next: "lena_last_hour", tag: "private" });
      }
      return c;
    }
  },

  // ═══ SCENE DECLARATION ═══════════════════════════════════════════
  // SCENE_ID: lena_last_hour            TICKET: SUN-ROMANCE-ARC-01 (L-050, Wave 1)
  // PRE: Lena living; reached only from offshift_lena "Stay the hour." (romance.lena or the
  //   held_only mark). junctionChoice is "lena", or another crew member's when offshift_lena was
  //   her late hour (SUN-ROMANCE-ENDINGS-REACH-01); exits go to afterHour("lena").
  // WRITES: flags.lena_last_hour = true on first entry, plus one memory. No resource change.
  // DEATH: none. DEAD SPEECH/APPEARANCE: entry redirects to faction_split when Lena is dead
  //   (onEnter + living-cast contract in scenes-55); no dead text is rendered.
  // IMAGE: REUSE images/medbay_dim.jpg, the owner's pick for offshift_lena (quiet late medbay).
  //   The face gate shows it only while Lena and Jiro are both present and otherwise serves the
  //   corridor fallback. No new art.
  // ═════════════════════════════════════════════════════════════════
  lena_last_hour: {
    image: "images/medbay_dim.jpg",
    onEnter: () => {
      if (!isAlive("lena")) return "faction_split";
      if (!state.flags.lena_last_hour) {
        state.flags.lena_last_hour = true;
        remember("counted Lena's cabinet with her, line by line, variance zero");
      }
    },
    get text() {
      let t = `She does not let the hour be quiet.\n\n`;
      t += `"Working if I can stand," she says, and stands. The sterilizer hood comes up. The cabinet comes open. She starts the count you have watched her start from the corridor side of the glass more than once, and then she stops and hands you the slate.\n\n`;
      t += `"You count. I check. If I die on a watch, the ship loses the only person who knows this cabinet by feel. The folders fix that on paper. This fixes it in your hands."\n\n`;
      t += `So you count. Ampoules by lot. What is left of the packs, by date. She corrects you twice without looking up — "that one is expired; it stays, expired is not empty" — and once she says nothing at all, and you understand later that was the one you got right.\n\n`;
      t += `Halfway down the second shelf she takes a thin ampoule from her coat pocket, the size of a finger bone, and doses herself in the middle of a sentence about filter cartridges. The sentence does not pause. The hand holding the slate for you does not shake, and then, for a count of three, it does.\n\n`;
      t += `"Charted," she says, when she sees you see it. "Under my name. Keep counting."\n\n`;
      if (state.romance.lena) {
        t += `Then the name again — the private one, the second time tonight, which she rations harder than ampoules. "This hour is on a ledger with everyone else's name on it. They will count it. Let them. I am not spending it apologizing."\n\n`;
      } else {
        t += `"You stayed once and did not take the rest," she says. "Correct dose. Do not revise it now out of sentiment. I would notice, and I would chart it."\n\n`;
      }
      t += `The count finishes. She reads your tally against hers, line by line, and does not round. "Variance zero. Charted." She shuts the cabinet with her hip, the way she does when both hands are full.\n\n`;
      t += `"When the clock runs out, someone will stand where you are standing and need to know this cabinet. Now they can. That is what this hour was for. The last one I keep for watching them get it right."\n\n`;
      t += `She turns the sterilizer hood off. The medbay is the dark it was when you came in.\n\n`;
      t += `"Take the ship back. Charted."`;
      return t;
    },
    get choices() {
      return [
        { text: "Take the ship back.", next: afterHour("lena") },
        { text: "Tell her the count will be kept.", next: afterHour("lena"), affinity: { lena: 4 } }
      ];
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
      // SUN-MYTH-WORDING-01: the mending opener belonged to the cut alive-Mira branch (LOCK 4). Every
      // player who reaches this scene has a dead Mira, and the unmended jacket is the cold-Elias
      // symptom (CHARACTER_BIBLE §2); the mending sentence contradicted the paragraph under it.
      let t = `His quarters smell of gun oil and thread. The jacket on the table is torn at the shoulder and unmended. His kit sits closed beside it. He sees you see it and doesn't explain.\n\n`;
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
    get choices() {
      // SUN-ROMANCE-ENDINGS-REACH-01: a partner's late hour follows this one.
      return [
        { text: "Take the wafer.", next: afterHour("elias") },
        { text: "Ask who mends the jacket now.", next: afterHour("elias") }
      ];
    }
  },

});
