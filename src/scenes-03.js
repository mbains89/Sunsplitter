// Sunsplitter — scenes-03.js
// 0.28.1c size hygiene. Pure mechanical. mid-a: aftermath + lena_dying + romance_lena_1
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

"I already used the last of the heavy stabilizers on Rourke. There is nothing left that will change the timeline. I can work until I can't. That is the only useful version of this."

Her hand is close to yours. The ship is quiet around you.`;
    },
    get choices() {
      if (!isAlive("lena")) return [{ text: "Move on.", next: "past_leak" }];
      const opts = [
        { text: "Promise her the work will matter. Then go deal with the crew.", next: "prom_make_lena", effects: { cohesion: 2 }, affinity: { lena: 6 }, trust: { lena: 4 } },
        { text: "Ask her whether the vault should outrank her own remaining time.", next: "prom_make_lena", effects: { cohesion: -2 }, lean: { future: 2 } }
      ];
      // Intimate path: needs some trust and not already completed
      if (!state.romance.lena && !hasMark("lena", "declined")) {
        opts.unshift({ text: "Take her hand. Stay longer than duty requires.", next: "romance_lena_1", effects: { cohesion: 4 }, affinity: { lena: 8 } });
      }
      return opts;
    }
  },
  // PRE: Lena living; reached from lena_dying before the intimacy decision
  // WRITES: choices only; scene entry writes nothing
  // DEATH: none | DEAD SPEECH/APPEARANCE: dead Lena gets the empty-blister exit
  // IMAGE: REUSE images/shower_lena.jpg via sceneImages; solo Lena, Commander absent; L-025 audited
  romance_lena_1: {
    get text() {
      if (!isAlive("lena")) return `The blister is empty. Whatever might have happened here has nowhere to land.`;
      return `You take her hand.

Lena looks at your fingers as if they are a diagnosis. When she speaks it is clinical and raw at once.

"I am not asking for rescue. I am asking whether you will be here while I still am. If this is pity, stop. If this is something else, say so with your body or leave."

The observation blister is cold. The ship is quiet. The line between comfort and crossing is still intact — barely.`;
    },
    get choices() {
      if (!isAlive("lena")) return [{ text: "Move on.", next: "past_leak" }];
      return [
        { text: "Cross the line. Meet her without pity.", next: "romance_lena_sex", effects: { cohesion: 3 }, affinity: { lena: 10 }, trust: { lena: 8 } },
        { text: "Hold her hand only. Stay present without sex.", next: "past_leak", effects: { cohesion: 4 }, affinity: { lena: 12 }, trust: { lena: 10 }, mark: { lena: "held_only" } },
        { text: "Step back. You will not take this from her fear.", next: "past_leak", effects: { cohesion: 1 }, affinity: { lena: 4 }, trust: { lena: 2 }, mark: { lena: "declined" } }
      ];
    }
  },

});
