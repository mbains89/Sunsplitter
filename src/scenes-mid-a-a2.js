// Sunsplitter — scenes-mid-a-a2.js
// Split from scenes-mid-a.js (0.28.1c size hygiene). Pure mechanical.
// Mid-a: aftermath through romance_lena_sex.
// Strict scene shape only: text | choices | onEnter | image
registerScenes({

  aftermath: {
    get text() {
      let t = `The immediate crisis is over. What remains is the cost.\n\n`;
      const n = state.survivors;
      t += `${n} still living. The manifests still pretend there could be more.\n\n`;

      if (state.flags.crisis === "vent") {
        t += `Three empty bunks.`;
        if (!isAlive("sela")) t += ` Sela's last yellow circle still fixed on the bulkhead — adult work, left where she put it.`;
        t += ` The air recyclers still carry a faint metallic taste`;
        if (isAlive("lena")) t += ` that Lena says is not chemical`;
        t += `.\n\n`;
        if (!isAlive("amara")) t += `Amara's house key from Lagos is found on the deck outside the sealed section. No one picks it up for a long time.\n\n`;
        if (isAlive("tomas")) t += `Tomas sits on the floor of the common area with his cross in both hands and does not move when people pass.\n`;
        if (isAlive("mira")) t += `Mira has disabled the intercom channel that still loops the last eleven seconds.\n`;
        if (isAlive("elias")) t += `Elias does not apologize.\n`;
        t += `\n`;
      } else if (state.flags.crisis === "cut") {
        if (isAlive("amara")) t += `Amara sits with her back to a bulkhead and will not speak for the first hour.\n`;
        if (isAlive("jiro") && isAlive("sela")) t += `Jiro holds Sela until she finally sleeps.\n`;
        else if (isAlive("jiro")) t += `Jiro stands near the sealed bulkhead and does not answer when spoken to.\n`;
        else if (isAlive("sela")) t += `Sela sits against the bulkhead with her pigment stick unopened.\n`;
        if (isAlive("mira")) t += `Mira has not left engineering. The ship still makes the same metallic knock.\n`;
        if (isAlive("amara")) t += `\nWhen Amara finally looks up she says your name once, as if testing whether it still works.\n`;
        t += `\n`;
      } else {
        // self_risk
        if (isAlive("amara")) t += `Amara sits with her back to a bulkhead and will not speak.\n`;
        if (isAlive("jiro") && isAlive("sela")) t += `Jiro holds Sela until she finally sleeps.\n`;
        else if (isAlive("sela")) t += `Sela is quiet. The yellow circle above the bulkhead has not changed.\n`;
        if (isAlive("mira")) t += `Mira has not left engineering. The ship still makes the same metallic knock.\n`;
        t += `\nYou can still taste the exposure in the back of your throat.`;
        if (isAlive("lena")) t += ` Lena checked your oxygen levels twice.`;
        t += `\n\n`;
      }

      if (state.flags.leadership === "together") {
        t += `People come to you without being ordered. They want to know what happens next. They still believe the answer might include them.\n\n`;
      } else if (state.flags.leadership === "hard") {
        t += `People wait for orders. They do not offer opinions.`;
        if (isAlive("elias")) t += ` Elias reports that compliance is high and that two of the remaining survivors have stopped eating full rations without being told.`;
        t += `\n\n`;
      } else {
        t += `People watch you more carefully than before.`;
        if (isAlive("elias")) t += ` The names Elias gave you have not been forgotten. Neither has the fact that you asked for them.`;
        t += `\n\n`;
      }

      if (state.flags.stores === "seize") {
        t += `The seized private stores sit in a locked crate. Nobody thanks you for them.\n\n`;
      }
      if (state.flags.ship_memory === "jury_rig" || state.flags.ship_memory === "open_wound") {
        if (isAlive("mira")) t += `Mira's eye keeps tracking the Deck 4 pressure icon even while she talks about the bulkhead. The seal is still soft in her head.\n\n`;
        else t += `Someone has marked the Deck 4 pressure icon in red on the status board. The seal is still soft in the ship's memory.\n\n`;
      }
      if (typeof favoritism === "function") {
        const fav = favoritism();
        if (fav && isAlive(fav.favored) && isAlive("elias") && fav.favored !== "elias") {
          t += `Elias's glance lands on ${crew[fav.favored] ? crew[fav.favored].name.split(" ").pop() : fav.favored} a fraction longer than on anyone else. The gap is already public.\n\n`;
        }
      }

      // Lena's confession only if alive
      if (isAlive("lena")) {
        t += `Lena finds you in the observation blister.\n\n"I can keep the remaining bodies alive for a while. I cannot keep their promises. You need to decide what this ship is for now. Because if you do not, someone else will."\n\nShe hesitates, then adds quietly: "And there is something else. My own readings. The exposure from the earlier work is not reversible. I have months, not years. Maybe less if we keep taking risks."`;
      } else {
        t += `There is no medical officer left to translate the cost into months. The ship simply continues, thinner than it was.`;
      }
      return t;
    },
    get choices() {
      const out = [];
      if (isAlive("lena")) {
        out.push({ text: "Stay with Lena. Ask what she needs.", next: "lena_dying", effects: { cohesion: 3 }, affinity: { lena: 10 } });
        out.push({ text: "Acknowledge it and move to the larger accounting.", next: "past_leak", effects: { cohesion: 1 } });
      } else {
        out.push({ text: "Medical is empty. Move to the larger accounting.", next: "past_leak", effects: { cohesion: -2 } });
      }
      return out;
    },
    onEnter: () => {
      if (isAlive("lena")) {
        if (!state.dying || typeof state.dying !== "object") state.dying = {};
        state.dying.lena = "kept working until the clock ran out";
      }
    }
  },
  lena_dying: {
    get text() {
      if (!isAlive("lena")) return `Medical is empty. The conversation you meant to have has nowhere to go.`;
      return `You stay.

Lena sits on the edge of the observation blister, looking at the drifting stars. For the first time since the launch she looks younger and older at the same time.

"I am not asking you to fix this," she says. "I am asking you to see it. The clock is real. The work is still real. If you want the last regenerative treatment for me, say so while the board still has it. If you want it for the vault or for the majority, say that too. I will not make the choice for you."`;
    },
    choices: [
      { text: "Stay. Listen.", next: "romance_lena_1", tag: "private", alive: "lena" },
      { text: "I will come back when there is something I can do.", next: "past_leak", alive: "lena" }
    ]
  },
  romance_lena_1: {
    onEnter: () => {
      if (!isAlive("lena")) return "past_leak";
    },
    get text() {
      let t = `She does not soft-pedal. The medical bay is the only place on the ship that still smells like a hospital, and she uses that.\n\n`;
      t += `"I am not asking for a future. I am asking whether the present is allowed to include this."\n\n`;
      t += `The offer is clear. The clock is still running.`;
      return t;
    },
    choices: [
      { text: "Yes.", next: "romance_lena_sex", tag: "private", affinity: { lena: 12 }, trust: { lena: 8 }, alive: "lena" },
      { text: "Not like this. Not while the clock is the only thing we share.", next: "past_leak", mark: { lena: "declined" }, affinity: { lena: 2 }, alive: "lena" }
    ]
  },
  romance_lena_sex: {
    onEnter: () => {
      if (!isAlive("lena")) return "past_leak";
      if (!state.romance) state.romance = {};
      if (!state.romance.lena) {
        state.romance.lena = true;
        addAffinity("lena", 35);
        addTrust("lena", 12);
        mark("lena", "dying_held");
        remember("You and Lena crossed a line in the observation blister. The crew will notice who you keep close.");
      }
    },
    get text() {
      let t = `It is careful and frank and unfinished in the way that medical people finish things — clean, documented, without the luxury of pretending the body is only a body.\n\n`;
      t += `Afterward she buttons the coat and checks the time. The cold drawer is still open.\n\n`;
      t += `"The dose is still there," she says. "If the next triage list is written while I am still breathing, the board already knows where the last regenerative went. Do not make me a soft story in the crew's theory."`;
      return t;
    },
    choices: [
      { text: "I will not.", next: "past_leak", affinity: { lena: 6 }, alive: "lena" }
    ],
    image: "images/romance_lena_1.jpg"
  },

});
