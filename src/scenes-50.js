// Sunsplitter — scenes-50.js
// 0.28.1c size hygiene. Pure mechanical. crewpairs: amara + jiro
// Strict scene shape only: text | choices | onEnter | image
registerScenes({

  // PRE: Last Off-Shift selects living Amara | WRITES: junction choice and one deduplicated absolution memory on entry
  // DEATH: none | DEAD SPEECH/APPEARANCE: Amara is eligibility-gated by offshift_open | IMAGE: existing quiet-Amara plate
  offshift_amara: {
    image: "images/quiet_amara.jpg",
    onEnter: () => {
      state.flags.junctionChoice = "amara";
      const first = firstAttributableDeath();
      const whoName = first ? first.name : "the dead";
      const granted = stillFavoring("amara") || (state.affinity.amara || 0) >= 20;
      remember(`Amara ${granted ? "offered" : "withheld"} absolution for ${whoName}`);
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
      } else {
        t += `"The rest, you haven't earned back. The garden's had no hour from you since, the crew's had no face at meals. Absolution isn't a thing I pour, it's a thing you grow. Mind I said back, not never."`;
      }
      const close = closingPartnerLine();
      if (close) t += `\n\n` + close;
      return t;
    },
    get choices() {
      const c = [
        { text: "Ask her to say it wasn't yours.", next: "faction_split" },
        { text: "Ask what you owe.", next: "faction_split" },
        { text: "Say nothing and drink.", next: "faction_split" }
      ];
      // SUN-ROMANCE-ARC-04 (L-050): a partner may stay past the light; her ledger is behind it.
      if (state.romance.amara) c.push({ text: "Stay past the light.", next: "amara_page", tag: "private" });
      return c;
    }
  },

  // ═══ SCENE DECLARATION ═══════════════════════════════════════════
  // SCENE_ID: amara_page                 TICKET: SUN-ROMANCE-ARC-04 (L-050, Wave 1)
  // PRE: Amara living and romance.amara (solo shape only; the shared bay is untouched under
  //   L-041); reached only from offshift_amara "Stay past the light."; junctionChoice is "amara".
  //   Text reads pursuit_amara_cost, hydro, breath_answer and promises.amara (kept/broken only;
  //   untested promises are not read aloud, L-024).
  // WRITES: none on entry. The three answers write flags.amara_page ("open" | "closed" | "hers")
  //   plus affinity/trust; no resource change.
  // DEATH: none. DEAD SPEECH/APPEARANCE: entry redirects to faction_split when she is dead or
  //   not a partner (onEnter + living-cast contract in scenes-55).
  // IMAGE: REUSE images/quiet_amara.jpg, the off-shift plate. No new art.
  // NOTE: spends CHARACTER_BIBLE's handwritten favor ledger, opened to the Commander's page.
  // ═════════════════════════════════════════════════════════════════
  amara_page: {
    image: "images/quiet_amara.jpg",
    onEnter: () => {
      if (!isAlive("amara") || !state.romance.amara) return "faction_split";
    },
    get text() {
      if (!isAlive("amara")) return `The light in hydroponics is off. Nobody left it on.`;
      let t = `The kettle's gone cold and she doesn't refill it. That's how you know the hour's run over into something else.\n\n`;
      t += `She takes a book down from behind the seed trays — cloth-bound, swollen with damp — and opens it to a page with your rank at the top and no name under it.\n\n`;
      t += `"There's a book I keep on who's owed what aboard," she says. "Handwritten, so it can't be pulled or argued with. This is your page."\n\n`;
      t += `She reads it to you the way she reads a yield sheet.\n\n`;
      if (state.flags.pursuit_amara_cost === "vent_delay") {
        t += `"One cycle of a contaminated vent, held for roots, claimed on the board in your name while you were inside me. I said I'd not edit that line. I haven't. Debit the ship: supplies, hull, the room's temper. Credit you: the roots lived. Both columns, my hand."\n\n`;
      } else if (state.flags.pursuit_amara_cost === "half") {
        t += `"Half a cycle of a contaminated vent, held for roots, haggled down. Debit the ship: a little. Credit you: a little. It's an honest half, love. I've seen it written up as a whole."\n\n`;
      } else {
        t += `"The bay. One entry. Blank's honest."\n\n`;
      }
      if (state.flags.hydro === "full") t += `"Margin given to the green when the ship wanted it elsewhere. Credit."\n\n`;
      if (state.flags.breath_answer === "garden") t += `"The garden, spent on breathing. That one's in your credit and it's in my hand. Mind the ink. It doesn't clear the other."\n\n`;
      if (state.promises.amara === "kept") t += `"A vent held shut with a reader inside it. Kept. That's not credit, love. That's the line you wrote, honored. Different column."\n\n`;
      else if (state.promises.amara === "broken") t += `"A pocket vented with a reader still breathing. Broken. I don't write that in your column. I write it in mine, as the thing I'll not forget."\n\n`;
      else if (state.promises.amara === "made") t += `"And a line of yours, banked. Not called yet, so not read."\n\n`;
      t += `She lays her hand flat on the page, not the book.\n\n`;
      t += `"Who's owed? That's the question I'm for, and I'll not answer it on your page for you. I read it out so you'd know it's kept."\n\n`;
      // Same read as the absolution hour: a withheld Amara says the harder thing.
      if (!(stillFavoring("amara") || (state.affinity.amara || 0) >= 20)) t += `"You're drawing more than you return on this page, love. I said it kindly. I didn't say it wasn't so."\n\n`;
      t += `"Now. Do I leave it open?"`;
      return t;
    },
    get choices() {
      if (!isAlive("amara")) return [{ text: "Leave the bay.", next: "faction_split" }];
      return [
        { text: "Leave it open.", next: "amara_page_reply", flag: { amara_page: "open" }, affinity: { amara: 5 }, trust: { amara: 2 } },
        { text: "Ask her to close it.", next: "amara_page_reply", flag: { amara_page: "closed" }, affinity: { amara: 5 }, trust: { amara: 2 } },
        { text: "Ask to see her own page.", next: "amara_page_reply", flag: { amara_page: "hers" }, affinity: { amara: 5 }, trust: { amara: 2 } }
      ];
    }
  },

  // ═══ SCENE DECLARATION ═══════════════════════════════════════════
  // SCENE_ID: amara_page_reply           TICKET: SUN-ROMANCE-ARC-04 (L-050, Wave 1)
  // PRE: Amara living; flags.amara_page set by amara_page. Her answer to the answer.
  // WRITES: none. DEATH: none. DEAD SPEECH/APPEARANCE: entry redirects.
  // IMAGE: REUSE images/quiet_amara.jpg. No new art.
  // ═════════════════════════════════════════════════════════════════
  amara_page_reply: {
    image: "images/quiet_amara.jpg",
    onEnter: () => {
      if (!isAlive("amara")) return "faction_split";
      if (!state.flags.amara_page) return "faction_split";
    },
    get text() {
      if (!isAlive("amara")) return `The light in hydroponics is off. Nobody left it on.`;
      let t;
      if (state.flags.amara_page === "open") {
        t = `"Open, then." She writes nothing. "Interest runs on an open page. I'll not pretend it doesn't, and I'll not charge it tonight." She puts the book back behind the trays with the page marked by a seed packet.`;
      } else if (state.flags.amara_page === "closed") {
        t = `"Closed." She draws one line under the last entry, straight, with the rule she keeps for it. "Closed isn't forgiven, love. Closed is I've stopped counting. You'll learn the difference the first time you want me to start again."`;
      } else {
        t = `She turns the book around. Her page is long, every name on it in the same hand, and none of them aboard.\n\n"Three habitats' worth. One street in Lagos. All of them owed me and none of them paid, because they couldn't, because they're dead. That's not a grievance. It's what the book's for."${state.promises.amara === "broken" ? ` A beat. "And one from this ship, this watch. That ink's not dry."` : ""} She takes the book back before you can read the names. "Yours is short. Keep it short."`;
      }
      t += `\n\nThe light stays on when you go.`;
      return t;
    },
    choices: [
      { text: "Back to the watch.", next: "faction_split" }
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
        { text: "Ask for the worst number.", next: "faction_split", reply: [{ who: "jiro", text: `"One," Jiro says. "That's the number of passes. Every other figure I've given you tonight comes with an error bar. That one doesn't." He lets it sit, then turns the lights back down.` }] }
      ];
      const needs = [{ who: "jiro", text: `"The helm for four days," Jiro says. "One eighty-one through one eighty-four, and nobody leaning over my shoulder. Give me that and you get an honest error bar the whole way through."` }];
      if (isAlive("mira")) {
        c.push({ text: "Ask what he needs to make it true.", next: "faction_split", reply: needs });
      } else {
        c.push({ text: "Ask what he needs to make it true.", next: "faction_split", reply: needs });
      }
      return c;
    }
  },

});
