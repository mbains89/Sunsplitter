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

});
