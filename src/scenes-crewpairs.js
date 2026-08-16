// Sunsplitter — scenes-crewpairs.js
// Package: 0.28 Crew Pairs + The Last Off-Shift + Scheduled Warmth
// Entry: faction_split onEnter guard → offshift_open
// Exit: all offshift_* → faction_split; pair/warmth → host next or act3_spine_next
// Flags written: junctionChoice, lena_notes, mira_fault_known, course_briefed,
//   pair_shield, pair_grudge, pair_favor, pair_turn, warmth_meal, warmth_laughter, warmth_music
// Version 0.28 — LOCK 4: Elias alive-Mira branch + A.3 swap cut

const scenesCrewpairs = {

  // ═══════════════════════════════════════════════════════════════
  // THE LAST OFF-SHIFT
  // ═══════════════════════════════════════════════════════════════

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
        return "offshift_" + eligible[0];
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
      if (eligSela())  c.push({ text: "Attend at yellow.", next: "offshift_sela" });
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

  offshift_mira: {
    image: "images/quiet_mira.jpg",
    onEnter: () => {
      state.flags.junctionChoice = "mira";
      state.flags.mira_fault_known = true;
      remember("was told about the weld behind junction seventeen");
    },
    get text() {
      let t = `Junction seventeen, deck two. The access panel is already off, her worklight clipped to her collar, and the hour smells of hot flux and cold metal — solder smoke curling up through the lamp beam, unhurried, the first smoke on this ship in weeks that doesn't mean anything. She works the iron with the hand that still reads temperature. The other one she uses for holding things now. She doesn't mention it, so neither do you.\n\n`;
      t += `"The weld behind this panel. I rebuilt it in the dark during the crisis with forty percent of the correct filler and one hundred percent of the available time. Sixty percent it holds to landfall, error of ten either side. Sixty is not a number I log. A number without a root cause is a rumor in a uniform."\n\n`;
      t += `She hands you the worklight so you'll look where she's looking. "Nobody else knows the panel comes off in one move. Now two people do. You're the only redundancy I've got that isn't made of the same alloy as me. If it lets go, you'll know what's behind the alarm before the alarm does."`;
      if (state.romance.mira) {
        t += `\n\n"Your pulse is down eight from the hatch. Mine isn't. Noted for the record. Stay while I close this up, or don't — but decide before I re-solder, I only heat this once."`;
      }
      const close = closingPartnerLine();
      if (close) t += `\n\n` + close;
      return t;
    },
    get choices() {
      const c = [
        { text: "Keep it between the two of you.", next: "faction_split" },
        { text: "Order it into the log anyway.", next: "faction_split", effects: { cohesion: -1 } }
      ];
      if (state.romance.mira) {
        c.push({ text: "Stay while she closes it up.", next: "faction_split" });
      }
      return c;
    }
  },

  offshift_tomas: {
    image: "images/quiet_tomas.jpg",
    onEnter: () => {
      state.flags.junctionChoice = "tomas";
    },
    get text() {
      let t = "";
      if (!state.flags.trays_dead) {
        t += `The grow deck at night is the warmest room on the ship and the only one that smells alive — wet soil under the lamps, the green breathing out what everyone else breathed in all day. He's eating standing up, unhurried, and hands you a bowl without asking. The chard in it came up crooked. "Grows away from the lamp like it knows something," he says.\n\n`;
      } else {
        t += `The grow deck is clean and dead and he eats paste in it anyway, at the empty racks, on purpose. He hands you a ration without asking. "We eat it here so the room stays a room," he says. "Rooms die when you stop eating in them."\n\n`;
      }
      // MAKE iff promises.tomas absent
      if (!state.promises.tomas) {
        t += `He tastes the soil first, bare-handed, the way he does, and then looks at you the way he doesn't. "I want six words, said where I can hear them. If the vault and the living need the same mercy, the living get it. That's the whole ask. Words are cheap tonight. That's exactly when they're worth taking."`;
      } else {
        // BREAK-ASK or FLOOR
        const made = [];
        if (state.promises.lena === "made") made.push("lena");
        if (state.promises.sela === "made") made.push("sela");
        if (state.promises.elias === "made") made.push("elias");
        if (state.promises.mira === "made") made.push("mira");
        // priority lena > sela > elias > mira
        const priority = ["lena", "sela", "elias", "mira"];
        const named = priority.find(p => made.includes(p));
        if (named) {
          const names = { lena: "Lena", sela: "Sela", elias: "Elias", mira: "Mira" };
          t += `He sets his bowl down. "You made a promise once, with witnesses. I've been running the cost of keeping it, and the cost lands on somebody breathing. ${names[named]}. A promise kept at the wrong price is pride with a receipt. If it comes to that, break it in daylight, with me standing there, and I'll carry my share of the breaking. That's the ask. Nobody makes it twice."`;
        } else {
          t += `He doesn't ask for anything. He counts the room the way he counts trays, names not numbers, and puts yours last so the count ends on someone still deciding things. "That's the whole meal," he says. "Eat."`;
        }
      }
      return t;
    },
    get choices() {
      if (!state.promises.tomas) {
        return [
          { text: "Say the six words.", next: "offshift_tomas_r", flag: { prom_tomas: true } },
          { text: "Refuse the words.", next: "offshift_tomas_r" }
        ];
      }
      const made = ["lena", "sela", "elias", "mira"].some(p => state.promises[p] === "made");
      if (made) {
        return [
          { text: "Agree to weigh it in daylight.", next: "faction_split" },
          { text: "Tell him a promise is a promise.", next: "faction_split" }
        ];
      }
      return [
        { text: "Eat with him.", next: "faction_split" },
        { text: "Take yours and go.", next: "faction_split" }
      ];
    }
  },

  offshift_tomas_r: {
    image: "images/quiet_tomas.jpg",
    onEnter: () => {
      if (!state.promises.tomas) {
        state.promises.tomas = state.flags.prom_tomas ? "made" : "declined";
        if (state.promises.tomas === "made") {
          remember("If the vault and the living need the same mercy, the living get it.");
        }
      }
    },
    get text() {
      let t = "";
      if (state.flags.prom_tomas) {
        t = `He nods once, the way he does at a tray that's finally rooted. "Heard. Witnessed by me and the chard." Your name, not your rank, the whole rest of the hour.`;
      } else {
        t = `He goes back to his bowl. "Then I'll guard what I guard and count what I count, Commander." Rank, not name. The room stays warm. He doesn't.`;
      }
      const close = closingPartnerLine();
      if (close) t += `\n\n` + close;
      return t;
    },
    choices: [ { text: "Finish the meal.", next: "faction_split" } ]
  },

  offshift_amara: {
    image: "images/quiet_amara.jpg",
    onEnter: () => {
      state.flags.junctionChoice = "amara";
    },
    get text() {
      const first = firstAttributableDeath();
      const whoName = first ? first.name : "the dead";
      let t = `Night-cycle hydroponics. Condensation ticks off the leaves one drop at a time, the only clock she keeps, and the kettle between you is real heat you can hold your hands over — an hour of warmth spent here and nowhere else on the ship. Two cups. She was expecting you or she always sets two.\n\n`;
      t += `"You'll have come about ${whoName}," she says, no cruelty in it, no cushion either. "Sit. The kettle's honest even when the company isn't."\n\n`;
      t += `She lets you get all the way to the bottom of the first cup before she says the rest. "I'll not tell you it wasn't your doing. I'll tell you I'm still here. Mind the difference."\n\n`;
      // Granted vs withheld from favoritism / debt read
      const granted = stillFavoring("amara") || (state.affinity.amara || 0) >= 20;
      if (granted) {
        t += `"And I'll say the name with you at yellow. Every yellow, for as long as I'm here to stand at one. That's absolution as I keep it, love. It doesn't wash anything. It just means you don't carry it in a room by yourself. Take it or leave it, but it's offered the once."`;
        remember("Amara offered absolution for " + whoName);
      } else {
        t += `"The rest, you haven't earned back. The garden's had no hour from you since, the crew's had no face at meals. Absolution isn't a thing I pour, it's a thing you grow. Mind I said back, not never."`;
        remember("Amara withheld absolution for " + whoName);
      }
      const close = closingPartnerLine();
      if (close) t += `\n\n` + close;
      return t;
    },
    choices: [
      { text: "Ask her to say it wasn't yours.", next: "faction_split" },
      { text: "Ask what you owe.", next: "faction_split" },
      { text: "Say nothing and drink.", next: "faction_split" }
    ]
  },

  offshift_jiro: {
    image: "images/jiro.jpg",
    onEnter: () => {
      state.flags.junctionChoice = "jiro";
      state.flags.course_briefed = true;
      remember("took the course numbers privately");
    },
    get text() {
      let t = `Observation, and he's turned the lights up. That alone is a briefing. The glass is cold enough to fog where you breathe near it, and past your own faint reflection the starfield sits still — an hour of looking at where you're going instead of what's failing. There's a chair set out. He waits until you're in it.\n\n`;
      t += `"Arrival window, real numbers, no audience. `;
      if (state.flags.position_certain) t += `We are where I say to the meter. `;
      t += `Insertion margin as of tonight: `;
      if (state.flags.margin_spent_extra || state.flags.margin_committed) {
        t += `thinner than the public figure by the width of what we spent cutting me out of the blister. I flew that burn; I get to say what it cost. `;
      } else {
        t += `thin, and honest about it. `;
      }
      if (state.flags.burn_unverified) {
        t += `There's a burn in our history I never got to verify. It lives in the error bars now. It always will. `;
      }
      t += `Call it threading, not landing. Threading is a skill. We have the skill. What we don't have is a second thread."\n\n`;
      if (state.flags.clock_known && isAlive("lena")) {
        t += `He squares the chart edges. "The crew knows Lena's clock to the cycle. So do I. It fits inside the window. Barely. That sentence took me four days to be able to say sitting down."\n\n`;
      }
      t += `"Now it's a briefing," he says. "Left alone, it arrives as a crisis at the worst possible hour. I've run that hour. You'd rather have this one."`;
      const close = closingPartnerLine();
      if (close) t += `\n\n` + close;
      return t;
    },
    get choices() {
      const c = [
        { text: "Ask for the worst number.", next: "faction_split" }
      ];
      if (isAlive("mira")) {
        c.push({ text: "Ask what he needs to make it true.", next: "faction_split" });
      } else {
        c.push({ text: "Ask what he needs to make it true.", next: "faction_split" });
      }
      return c;
    }
  },

  offshift_sela: {
    image: "images/sela_ritual.jpg",
    onEnter: () => {
      state.flags.junctionChoice = "sela";
      remember("attended the ritual performed for one person");
    },
    get text() {
      let t = `The lamp is already warming when you arrive, amber climbing toward yellow, and the filter behind it hums at the pitch of a held breath. The light crosses her hands first. For one hour this small yellow circle is the only sunrise anyone on this ship will get, and she is spending it on an audience of one.\n\n`;
      // Names of the dead
      const deadList = (state.dead || []).filter(k => k !== "rourke").map(k => (crew[k] && crew[k].name) || k);
      if (deadList.length) {
        t += `She says the names of this run's dead at yellow, each one complete, unhurried: ${deadList.join(", ")}. Then she is quiet for exactly as long as the names took, which you understand, watching her, is the point.\n\n`;
      } else {
        t += `She is quiet for a long count. No names yet. The lamp still climbs.\n\n`;
      }
      t += `"I have performed this for the ship since I boarded," she says. "Tonight I perform it for one person. That has never happened before. You are the person. I wanted the sentence said in the light, so that neither of us can misfile it later."`;
      if (romanceOpen("sela")) {
        t += `\n\nThe lamp holds at full yellow. "The next part is not liturgy. The next part is a question, and I am only asking it once, because I only have the one." She waits. She does not fill the silence. She never has.`;
      }
      const close = closingPartnerLine();
      if (close) t += `\n\n` + close;
      return t;
    },
    get choices() {
      if (romanceOpen("sela")) {
        return [
          { text: "Stay past the yellow.", next: "faction_split" },
          { text: "Let the lamp go amber and step back.", next: "faction_split", mark: { sela: "declined" } }
        ];
      }
      return [ { text: "Stand with her until amber.", next: "faction_split" } ];
    }
  },

  offshift_vess: {
    image: "images/transmission.jpg",
    onEnter: () => {
      state.flags.junctionChoice = "vess";
      remember("heard the beacon Vess was holding");
    },
    get text() {
      let t = `The relay bay runs on console light, cyan off the racks, and her chair is worn pale on one arm where six years of one elbow rested. She gives you the other seat. The hour smells of cold solder and old plastic — the smell of equipment kept alive past its design life by somebody who had to.\n\n`;
      t += `"Item one. Logged receipt forty-one cycles ago, oh-two-hundred. Automated. Ark-band handshake, station-keeping power signature. Verified eleven times."\n\n`;
      t += `She plays it. A preamble tone. A ship designator, repeating, patient as a metronome. Then the gap where an answer would go, and the preamble again.\n\n`;
      t += `"Crews don't maintain station-keeping beacons," she says, and for once she answers slowly, at human tempo — from her, slow is a gift. "Orphans do. Somewhere out there a ship is saying its own name to nobody, on schedule. I did that for six years. I know the accent." A beat, half a beat late, checking the joke is still allowed: "It's good work. Whoever's not alive over there is doing good work."\n\n`;
      t += `"Disposition is yours. The registry stays exact either way. This one gets its own page."`;
      if (state.romance.vess) {
        t += `\n\n"Item two, if you're staying: the chair is rated for one and I'm not moving. Solve it."`;
      }
      const close = closingPartnerLine();
      if (close) t += `\n\n` + close;
      return t;
    },
    get choices() {
      const c = [
        { text: "Tell the crew.", next: "faction_split", effects: { cohesion: -1 }, remember: "relayed the orphan beacon to the crew" },
        { text: "Hold it between you.", next: "faction_split", remember: "kept the orphan beacon between the two of you" }
      ];
      if (!state.flags.last_tx_spent) {
        c.push({
          text: "Answer it.",
          next: "faction_split",
          flag: { last_tx_spent: true },
          remember: "spent the last long-range window answering a dead ship's beacon"
        });
      }
      return c;
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // CREW PAIRS — full scenes
  // ═══════════════════════════════════════════════════════════════

  // Pair 2 settle
  pair_grudge_settle: {
    image: "images/observation.jpg",
    onEnter: () => {
      state.flags.pair_grudge = true;
      remember("Tomas and Jiro settled the aft-trunk account");
    },
    get text() {
      return `They're inventorying the trunk spares together, and it's the together that stops you at the hatch. Tomas hands tools before they're asked for. Jiro gives the schedule back in Tomas's own units: "Water the third rack in forty minutes; we're twenty from done, error of five." No apology has been said. You can hear that none is coming. Tomas, at the last crate: "I stopped needing to know where you were. Costs less." Jiro seals the lid. "Insufficient data was the true answer the whole time. Both columns." That's the entire treaty. They ratify it by carrying the crate together, badly, arguing about the weight.`;
    },
    choices: [
      { text: "Leave them to it.", next: "act3_spine_next" },
      { text: "Carry the third corner.", next: "act3_spine_next" }
    ]
  },

  // Pair 3 confront
  pair_favor_confront: {
    image: "images/hydroponics_amara.jpg",
    onEnter: () => {
      state.flags.pair_favor = true;
    },
    get text() {
      let t = `She waits until the pumps cycle loud enough to cover a conversation, which tells you she's rehearsed having it quietly. "You water one bed, love. I keep the books; I'm allowed to say it. Every ration of your attention that lands on Sela, the rest of the garden grows in her shade — and she hasn't noticed yet. She thinks it's the sun. When she does notice, it'll cost her the whole crew, and I'm not having that for her."\n\n`;
      if (!state.romance.amara && !state.romance.sela) {
        t += `Her thumb moves once along the spine of a small cloth-bound book on the bench — the one Sela reads to her at yellow. She doesn't explain it and doesn't hide it.\n\n`;
      }
      t += `"So. Stop isolating the girl. Not less care. Less ceremony about where it lands."`;
      return t;
    },
    choices: [
      { text: "You're right.", next: "act3_spine_next", affinity: { amara: 1 } },
      { text: "She's not your concern.", next: "act3_spine_next", affinity: { amara: -1 } },
      { text: "Say nothing.", next: "act3_spine_next" }
    ]
  },

  // Pair 1 cold (micro, reachable when Mira dead + Elias alive + attributable)
  pair_shield_cold: {
    image: "images/elias.jpg",
    onEnter: () => {
      state.flags.pair_shield = true;
      remember("Elias said she was what the job was for");
    },
    get text() {
      let t = `Elias gives the watch report in full sentences with nothing in them. When it's done he doesn't leave. "You asked me once what the exits were for. She was what the job was for." He says it at the bulkhead, not at you, and it is the only time he will ever say it. "You did the math. I'm not arguing the math. Live in it like I have to." After that, "Commander" is the warmest word you get. On his table, from then on: a torn jacket, kit closed beside it, unmended on purpose.`;
      return t;
    },
    choices: [ { text: "Continue.", next: "act3_spine_next" } ]
  },

  // ═══════════════════════════════════════════════════════════════
  // SCHEDULED WARMTH
  // ═══════════════════════════════════════════════════════════════

  warmth_meal: {
    image: "images/hydroponics.jpg",
    onEnter: () => {
      state.flags.warmth_meal = true;
    },
    get text() {
      let t = "";
      if (!state.flags.trays_dead) {
        const deadNames = (state.dead || []).filter(k => k !== "rourke").map(k => (crew[k] && crew[k].name) || k);
        t += `The first grown meal. Bowls that steam. Tomas serves everyone, then sets one portion on the soil bed, names attached`;
        if (deadNames.length) t += ` — ${deadNames.join(", ")}`;
        t += ` — "One for the soil. It's owed," and that's the whole ceremony.\n\n`;
      } else {
        t += `Paste, eaten together at the empty racks on purpose. Tomas: "We eat it here so the room stays a room."\n\n`;
      }
      if (isAlive("lena"))  t += `Lena doses herself on the exact schedule, mid-meal, not mid-task, and tells the table: "Eat slower. You all metabolize like you're being chased."\n\n`;
      if (isAlive("elias")) t += `Elias eats standing where he can see the hatch. He takes seconds. From him that's a toast.\n\n`;
      if (isAlive("mira"))  t += `Mira: "Nutrient density up forty percent on the paste. Flavor: present. That's a measurement, not praise." She has thirds.\n\n`;
      if (isAlive("jiro"))  t += `Jiro: "Eleven months since anything on this ship had a season. Logging it."\n\n`;
      if (isAlive("amara")) t += `Amara watches who passes dishes to whom, and pours for the one who poured for no one.\n\n`;
      if (isAlive("sela"))  t += `Sela: "I will say the grace of the old way. It is short. It is the count of the living, said aloud." She counts. The count is exact.\n\n`;
      if (isAlive("vess"))  t += `Vess: "It's quiet on every band tonight. First time I've liked that." Half a beat late, checking the room. The room lets her have it.`;
      return t.trim();
    },
    choices: [
      { text: "Stay for the second pot.", next: "act3_spine_next" },
      { text: "Take yours and go.", next: "act3_spine_next" }
    ]
  },

  warmth_laughter: {
    image: "images/corridor.jpg",
    onEnter: () => {
      state.flags.warmth_laughter = true;
    },
    get text() {
      const living = ["lena", "elias", "mira", "tomas", "amara", "jiro", "sela", "vess"].filter(isAlive);
      let t = `You stop short of the bend and don't round it. Two of them`;
      if (isAlive("vess")) t += ` — and Vess is one`;
      t += ` — and Vess is telling a joke a half-beat behind her own timing, like reading music at sight. The setup is old. Rourke's, by the shape of it. Someone else lands it now, and the laugh that comes back is real — short, ugly, the kind that survives on this ship because it has to be fed so little.\n\n`;
      if (living.length <= 3) {
        t += `It's two voices where there used to be a mess hall of them, and it is quieter, and it still counts. It counts more.`;
      }
      return t;
    },
    choices: [
      { text: "Listen one more minute from the dark.", next: "act3_spine_next" },
      { text: "Move on.", next: "act3_spine_next" }
    ]
  },

  warmth_music: {
    image: "images/corridor.jpg",
    onEnter: () => {
      state.flags.warmth_music = true;
    },
    get text() {
      let t = `A small speaker, rigged low on a stanchion, cycling somebody's dead playlist down the berth rows at half volume — music from a world that doesn't exist, playing to two hundred fourteen berths that were never filled.\n\n`;
      if (isAlive("vess")) {
        t += `Vess is sitting against the row's end, not hiding, not performing. "Somebody should hear music in them," she says. "I used to read the manifest to the dark. This is better. Fewer names, same job."\n\n`;
      } else {
        t += `No one claims the speaker. It's wired off a maintenance bus with a timer, set by a hand that wanted it to outlast shifts, or people.\n\n`;
      }
      if (isAlive("sela")) {
        t += `Sela stands at the far end of the row, listening, filling no silence. From her that is participation.\n\n`;
      }
      t += `Crew pass, and slow, and don't turn it off.`;
      return t;
    },
    choices: [
      { text: "Stay until the track ends.", next: "act3_spine_next" },
      { text: "Go.", next: "act3_spine_next" }
    ]
  }

};

registerScenes(scenesCrewpairs);
