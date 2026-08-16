// Sunsplitter — scenes-mid-a.js
// Version 0.22.1 — Explicit Art Utilization (lena_shower optional from romance_lena_sex)
// Act 2a: time_pass through vault_sacrifice (crisis + exclusive arcs)
// Strict scene shape only: text | choices | onEnter | image
// Extends global `scenes` object.

registerScenes({

  time_pass: {
    get text() {
      let base = `Days pass. Or what pass for days on a ship with no sun.

The hull produces a recurring metallic knock that people initially mistake for another person moving in the dark sections. The daylight panels still rise and set on a schedule that no longer means anything.`;

      if (state.flags.priority === "repairs") {
        if (isAlive("mira")) base += `\n\nMira's early work on the seals pays off in small ways. The temporary patches hold better than expected. She has begun sleeping in engineering rather than the common area.`;
        else base += `\n\nThe early seal work pays off in small ways. The temporary patches hold better than expected. Engineering stays occupied even without her.`;
      } else if (state.flags.priority === "ration") {
        base += `\n\nThe rationing is working. Supplies fall more slowly. People move more carefully.`;
        if (isAlive("sela")) base += ` Sela has stopped asking for more paste.`;
        if (isAlive("amara")) base += ` Amara has started weighing every tray twice.`;
      } else if (state.flags.priority === "planet") {
        if (isAlive("jiro") && isAlive("sela")) base += `\n\nJiro spends hours with the planetary data. He has begun teaching Sela the orbital mechanics of a world without a star. She listens as if the numbers might become a sky.`;
        else if (isAlive("jiro")) base += `\n\nJiro spends hours with the planetary data. The orbital mechanics of a world without a star fill the quiet cycles.`;
        else base += `\n\nThe planetary data keeps updating. Someone still reads the orbital mechanics of a world without a star.`;
      }

      if (state.flags.hydro === "full") {
        base += `\n\nThe hydroponics trays have begun to green again. People stop by the bay just to look at something living.`;
        if (isAlive("amara")) base += ` Amara sleeps less and talks more.`;
      } else if (state.flags.hydro === "minimal") {
        base += `\n\nThe remaining plants are barely surviving. The bay smells of damp failure.`;
        if (isAlive("amara")) base += ` Amara works in silence.`;
      }

      if (state.flags.power === "cut") {
        base += `\n\nLarge sections of the ship remain dark. The observation blister is cold and unused. People stay closer together in the lit areas.`;
      } else if (state.flags.power === "burn") {
        if (isAlive("mira")) base += `\n\nSystems remain online, but Mira has already written off any realistic chance of restoring full drive power without a miracle.`;
        else base += `\n\nSystems remain online, but any realistic chance of restoring full drive power has already been written off.`;
      }

      if (state.flags.planet === "committed") {
        base += `\n\nThe course remains locked on the rogue planet. Fourteen months. No one speaks of turning back, but no one speaks of arrival either.`;
      } else {
        base += `\n\nYou still have no destination. The ship drifts. Purpose is a resource you have not yet spent.`;
      }

      // v0.08 delayed personal echoes
      if (hasMark("sela", "spoken") && isAlive("sela")) {
        base += `\n\nSela has fixed a second yellow circle beside the first — same diameter, cleaner line. No one has taken either down.`;
      }
      if (hasMark("mira", "drive_first") && isAlive("mira")) {
        base += `\n\nMira has begun leaving short technical notes for you on the engineering hatch. They are not requests. They are facts she wants on the record.`;
      }
      if (hasMark("amara", "plants_matter") && isAlive("amara")) {
        base += `\n\nAmara left a second leaf on the common-area table. It is already browning. No one has thrown it away.`;
      }
      if (state.deathCause.rourke) {
        base += `\n\nSomeone has moved Rourke's body bag to a colder section. The corner of medical is empty now. The absence is noticed.`;
      }

      base += `\n\nThen the alarm sounds.`;
      base += `\n\nIn the quiet cycles the ship shows its original scale: corridors that never warm fully, a mess hall with nine places set and a hundred left stacked, a PA system that still has channels labeled for departments that do not exist on this voyage.`;
      if (isAlive("mira") && state.flags.power === "risk") {
        base += ` Mira's risky grid still holds. Competence without applause.`;
      }
      if (state.flags.stores === "seize") {
        if (isAlive("elias")) base += ` The seized private stores sit in a locked cabinet Elias checks twice a cycle.`;
        else base += ` The seized private stores sit in a locked cabinet someone still checks twice a cycle.`;
      } else if (state.flags.stores === "ignore") {
        base += ` Somewhere, small private stores remain. The ship has not forgotten the exception.`;
      }
      if (state.flags.ship_memory === "open_wound") {
        base += ` Deck 4's soft seal still appears on every status walk-through. Someone always notices.`;
      } else if (state.flags.ship_memory === "jury_rig") {
        base += ` The jury-rigged Deck 4 seal holds for now. Mira's notes call it provisional.`;
      }

      return base;
    },
    choices: [
      { text: "Go to the alarm yourself.", next: "crisis", effects: { cohesion: 2 } },
      { text: "Order Mira and Elias ahead. You follow.", next: "crisis", effects: { integrity: 1 } }
    ]
  },
  crisis: {
    get text() {
      // 0.22.0: Jiro/Tomas may still be missing; name only the living trapped
      const trapped = ["Amara Vale"];
      if (isAlive("jiro")) trapped.push("Jiro Okada");
      trapped.push("Sela"); // Sela always present early
      const countWord = trapped.length === 3 ? "Three" : "Two";
      let t = `The alarm is not loud. It does not need to be.

Life support on the lower habitation ring is failing. CO₂ climbing. ${countWord} people are trapped behind a warped bulkhead: ${trapped.join(", ")}.

Mira is already at the panel.`;

      if (state.flags.priority === "repairs") {
        t += `\n\n"The seals we reinforced earlier are buying us minutes. I can try to cut them out. The risk of cascade is lower than it would have been."`;
      } else {
        t += `\n\n"I can vent the section and save the rest of the ship, or I can try to cut them out. Cutting risks a cascade. If I fail, we lose more than ${trapped.length === 3 ? "three" : "two"}."`;
      }

      if (state.flags.priority === "ration") {
        t += `\n\nThe trapped have been on reduced oxygen for two days. They will not last as long as they should.`;
      }

      t += `\n\nElias: "Vent it. Now."

Lena: "Sela is in there."

`;
      if (isAlive("tomas")) t += `Tomas looks only at you.\n\n`;
      t += `You have less than four minutes.`;
      return t;
    },
    choices: [
      { text: "Cut them out. We do not leave people behind a wall.", next: "cut_out", effects: { integrity: -14, cohesion: 12 }, flag: { crisis: "cut" }, lean: { living: 5 }, affinity: { amara: 10, jiro: 8, sela: 10, elias: -6 } },
      { text: "Vent the section. Protect the ship and the majority.", next: "vent", effects: { integrity: 5, cohesion: -18 }, flag: { crisis: "vent" }, lean: { future: 5 }, affinity: { elias: 10, lena: -15, tomas: -12 } },
      { text: "Go yourself. Buy time with your own body.", next: "self_risk", effects: { integrity: -7, cohesion: 8, supplies: -4 }, flag: { crisis: "self" }, lean: { living: 3 }, affinity: { mira: 6, lena: 8 } }
    ]
  },
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
      { text: "Send Lena. You need to account for the cascade.", next: "aftermath", effects: { integrity: 3, cohesion: -1, supplies: -2 }, lean: { future: 1 } }
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
      { text: "Do not linger. The ship still needs orders.", next: "aftermath", effects: { cohesion: -6 }, affinity: { elias: 5 } }
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
        { text: "Ask her whether the vault should outrank her own remaining time.", next: "prom_make_lena", effects: { cohesion: -2 }, flag: { vault_priority: "future" }, lean: { future: 2 } }
      ];
      // Intimate path: needs some trust and not already completed
      if (!state.romance.lena && !hasMark("lena", "declined")) {
        opts.unshift({ text: "Take her hand. Stay longer than duty requires.", next: "romance_lena_1", effects: { cohesion: 4 }, affinity: { lena: 8 } });
      }
      return opts;
    }
  },
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

  romance_lena_sex: {
    text: `What happens next is not gentle and not slow. Clothes are pushed aside against the cold bulkhead of the observation blister. Her mouth is hungry, almost angry. Your hands find the places she has kept armored.

She is explicit in what she wants and does not ask you to be careful. The sex is hard, close, desperate — the kind that leaves marks and does not pretend it is about the future. When it is over she rests her forehead against yours for three long breaths, then straightens her clothes as if the moment can be sealed back into the wall.

"That does not change the math," she says. "But I am glad it happened. Do not make it cheap by lying about what it costs the crew if they notice."`,
    get choices() {
      // Context-aware exit: early path → past_leak; mid path (after past already known) → pursuit_window
      const next = state.past_known ? "pursuit_window" : "past_leak";
      const opts = [
        { text: "Tell her you will find a way to buy her more time.", next, effects: { cohesion: 3 }, affinity: { lena: 6 } },
        { text: "Say nothing. The body already said enough.", next, effects: { cohesion: 2 } }
      ];
      // 0.22.1 optional one-shot shower linger (only if not yet done)
      if (isAlive("lena") && !state.flags.lena_shower_done) {
        opts.push({ text: "Linger. Rinse together before the corridor takes you back.", next: "lena_shower" });
      }
      return opts;
    },
    onEnter: () => {
      const next = state.past_known ? "pursuit_window" : "past_leak";
      if (!isAlive("lena")) return next;
      if (!state.romance.lena) {
        state.romance.lena = true;
        addAffinity("lena", 35);
        addTrust("lena", 12);
        mark("lena", "dying_held");
        remember("You and Lena crossed a line in the observation blister. The crew will notice who you keep close.");
      }
    },
    image: "images/romance_lena_1.jpg"
  },


  past_leak: {
    text: `Elias is waiting when you leave the blister.

He does not raise his voice. He never needs to.

"I know what you did to get your place on this ship. The people who should have been in your seat are not here because of a decision you made on the ground. I have the records. I have kept them quiet because a ship without a commander is worse than a ship with a compromised one."

He lets that sit.

"I am not asking for a confession. I am telling you that the truth is a resource. If cohesion keeps falling, I will spend it."`,
    choices: [
      { text: "Admit it. Own the cost in front of him.", next: "transmission", effects: { cohesion: -4 }, flag: { past: "owned" } },
      { text: "Tell him that the past is dead and the only ledger that matters is the living.", next: "transmission", effects: { cohesion: -6 }, flag: { past: "denied" } },
      { text: "Ask what he wants in exchange for silence.", next: "transmission", effects: { cohesion: -2 }, flag: { past: "deal" } }
    ],
    onEnter: () => { state.past_known = true; }
  },
  transmission: {
    get text() {
      if (isAlive("jiro")) {
        return `Jiro intercepts you with a tablet.

"There is a signal. Faint. Repeating. It is not natural and it is not from the vault. It appears to be a human carrier wave, degraded, looping a short identification string and coordinates that do not match any known system."

He looks at you without expression.

"Investigating it will cost fuel and time we may not recover. Ignoring it means we accept that we are the only ones left. Or that we are being hunted."`;
      }
      if (isAlive("mira")) {
        return `Mira finds you with a tablet and a face that has not slept.

"There is a signal. Faint. Repeating. Not natural, not from the vault. Human carrier wave, degraded — short identification string and coordinates that do not match any known system."

She does not soften it.

"Investigating it will cost fuel and time we may not recover. Ignoring it means we accept that we are the only ones left. Or that we are being hunted."`;
      }
      return `A repeating carrier wave surfaces on the passive array. Faint. Degraded. Human-shaped identification string and coordinates that match no known system.

No one living claims the discovery as a conversation. The board simply reports the cost: fuel and time you may not recover if you chase it, or the acceptance that you are alone if you do not.`;
    },
    choices: [
      { text: "Change course enough to investigate. We have to know.", next: "vault_voice", effects: { supplies: -8, cohesion: 3, integrity: -3 }, flag: { signal: "chase" }, requires: { supplies: { min: 15 }, integrity: { min: 35 } }, lean: { living: 2 } },
      { text: "Before the signal — hear Elias out on the ground-side file.", next: "history_elias", alive: "elias" },
      { text: "Log it and hold course. We cannot afford ghosts.", next: "vault_voice", effects: { cohesion: -2, integrity: 2 }, flag: { signal: "ignore" }, lean: { future: 2 } },
      { text: "Have Mira try to decode more before we decide.", next: "vault_voice", effects: { supplies: -3, cohesion: 1, integrity: -1 }, flag: { signal: "study" }, requires: { supplies: { min: 8 }, trust: { mira: 35 } }, alive: "mira" }
    ]
  },
  vault_voice: {
    get text() {
      let t = `The vault monitoring panel has begun speaking.

Not an alarm. A voice. Soft, almost childlike, cycling through fragments of the original mission briefing and then, without warning, the names of the dead.

`;
      if (isAlive("mira")) {
        t += `Mira stands in front of it with her arms crossed tightly.

"It is a residual interface. The system was designed to report status to a living crew at the destination. Something in the power fluctuations woke a deeper layer. It is not conscious. It is worse. It is obedient to a purpose that no longer has a world."

`;
      } else {
        t += `The residual interface was designed to report status to a living crew at the destination. Power fluctuations woke a deeper layer. It is not conscious. It is obedient to a purpose that no longer has a world.

`;
      }
      if (isAlive("tomas")) {
        t += `Tomas is also there. He has not told anyone else.

`;
      }
      t += `"Some of the crew have started treating it as a presence.`;
      if (isAlive("amara")) t += ` Amara left a plant cutting on the hatch.`;
      if (isAlive("elias")) t += ` Elias wants the audio disabled.`;
      t += `"`;
      return t;
    },
    onEnter: () => {
      if (state.flags.past === "lena_only") state.past_known_by.lena = true;
    },
    choices: [
      { text: "Disable the voice. It is a system, not a ghost.", next: "arc_fork", effects: { cohesion: -3, integrity: 2 }, flag: { vault_voice: "off" }, lean: { future: 2 } },
      { text: "Leave it. Let people hear what they need to hear.", next: "boarding_stories", effects: { cohesion: 4, supplies: -1 }, flag: { vault_voice: "on" }, lean: { living: 2 }, requires: { cohesion: { min: 30 } } },
      { text: "Restrict access. Only you and Mira hear it from now on.", next: "arc_fork", effects: { cohesion: -1, integrity: 1 }, flag: { vault_voice: "restricted" }, requires: { trust: { mira: 40 } }, alive: "mira" }
    ]
  },

  arc_fork: {
    get text() {
      const shape = ideologyShape();
      let t = `The quiet after the vault voice does not last.\n\n`;
      t += `Two kinds of work are waiting. One lives in the numbers — drive, trajectory, the restart package that still draws power in the cold. The other lives in the warm sections — air, food, the people who still argue in the corridors.\n\n`;
      if (shape === "future") t += `You have already leaned toward the future. The ship has noticed.\n\n`;
      else if (shape === "living") t += `You have already leaned toward the living. The ship has noticed.\n\n`;
      else t += `You have not yet forced the ship to choose a single language.\n\n`;
      t += `Leadership is a separate question from ideology. You can hold hard rules and still protect the living. You can speak softly and still feed the vault. The next stretch of the voyage will not let you pretend those are the same choice.\n\n`;
      t += `Embryo viability, hull, and cohesion will all be asked to pay. The board already knows which meters are soft.\n\n`;
      t += `Where do you put your weight?`;
      return t;
    },
    choices: [
      { text: "The future work. Drive, vault, trajectory — keep the restart package honest.", next: "arc_future_1", flag: { mid_arc: "future" }, lean: { future: 4 }, affinity: { elias: 4, jiro: 4, mira: 3 } },
      { text: "The living work. Habitation, food, the people who still have names.", next: "arc_living_1", flag: { mid_arc: "living" }, lean: { living: 4 }, affinity: { lena: 4, tomas: 4, amara: 3, sela: 3 } }
    ]
  },

  arc_future_1: {
    get text() {
      let t = `Engineering smells of ozone and overheated insulation.\n\n`;
      if (isAlive("mira")) {
        t += `Mira Solis has the drive schematic spread across three cracked screens. She does not look up when you enter.\n\n`;
        t += `"The primary is dead. Auxiliary will not carry a colony burn. I can cannibalize habitation relays for a partial restart — or I can keep those relays where they keep people breathing."\n\n`;
        if (hasMark("mira", "drive_first")) t += `She already knows which answer you gave her once.\n\n`;
        if (state.flags.leadership === "hard") t += `Under hard rules she works faster and talks less.\n\n`;
      } else {
        t += `The drive schematic runs without its engineer. The board does not care who reads it.\n\n`;
      }
      if (isAlive("elias")) t += `Elias stands at the hatch. "Every hour we spend on comfort is an hour the package spends closer to a dead battery."`;
      return t;
    },
    choices: [
      { text: "Cannibalize habitation relays. Get the drive to answer, even partially.", next: "arc_future_2", effects: { integrity: 6, cohesion: -6, supplies: -3 }, lean: { future: 3 }, affinity: { mira: 6, elias: 6, lena: -4 }, trust: { mira: 4, elias: 5, lena: -4 } },
      { text: "Leave habitation alone. Find another path that does not steal breath.", next: "arc_future_2", effects: { cohesion: 4, integrity: -2, supplies: -5 }, lean: { living: 2 }, affinity: { lena: 5, mira: 2 }, requires: { supplies: { min: 10 } } },
      { text: "Order a limited pull — enough for diagnostics, not a full restart.", next: "arc_future_2", effects: { integrity: 2, supplies: -4, cohesion: -1 }, lean: { future: 1 }, affinity: { mira: 4 } }
    ]
  },

  arc_future_2: {
    get text() {
      let t = ``;
      const emb = state.embryos || 100;
      if (isAlive("jiro")) {
        t += `Jiro meets you at the vault hatch with a tablet and a face that has not slept.\n\n`;
        t += `"Embryo viability is ${emb}%. Power draw is not. If we keep the current grid split, we will lose percentage points every cycle we refuse to name."\n\n`;
        t += `He scrolls. Names of genetic lines. A mission profile that still assumes a destination with a sky.\n\n`;
        t += `"I can lock the vault into conservation mode. Habitation takes the brownouts — cold corridors, tighter rations, people noticing who the package ranks above. Or we keep the brownouts off the living and accept a permanent bleed in the cylinders. The ceiling does not recover."\n\n`;
      } else {
        t += `The vault hatch is unmanned. The board still reports: embryo viability ${emb}%, power draw not. Conservation mode or permanent slow bleed. The numbers do not soften without him.\n\n`;
      }
      if (emb < 70) {
        t += `The count is already wounded. Full conservation will only hold what is left; it will not restore what was spent.\n\n`;
      }
      if (isAlive("elias") && state.flags.leadership === "together") {
        t += `Elias: "Soft leadership does not change thermodynamics. It only changes who gets blamed for the brownouts."`;
      } else if (isAlive("elias")) {
        t += `Elias does not bother to argue. He is already counting which brownouts he can enforce and which people will notice.`;
      } else if (isAlive("lena")) {
        t += `Lena, if she is near: "Every brownout is a medical problem I will have to solve with fewer supplies."`;
      }
      return t;
    },
    choices: [
      { text: "Lock conservation mode. Habitation takes the brownouts.", next: "arc_future_3", effects: { embryos: 5, cohesion: -9, integrity: -4, supplies: -3 }, lean: { future: 4 }, affinity: { jiro: 8, elias: 6, tomas: -8, lena: -4 }, trust: { jiro: 6, tomas: -6 }, requires: { embryos: { min: 55 } } },
      { text: "Refuse the brownouts. Accept the permanent vault bleed.", next: "arc_future_3", effects: { embryos: -10, cohesion: 6, supplies: -2 }, lean: { living: 3 }, affinity: { tomas: 7, lena: 5, jiro: -6 }, flag: { embryo_ceiling: "lowered" } },
      { text: "Split the pain on a schedule. Publish the numbers to the crew.", next: "arc_future_3", effects: { embryos: -3, cohesion: 2, supplies: -4 }, lean: { future: 1, living: 1 }, requires: { cohesion: { min: 28 } } }
    ]
  },

  arc_future_3: {
    get text() {
      let t = `The cascade records were not supposed to open without a dual command key.\n\n`;
      if (isAlive("mira")) {
        t += `Mira finds a bypass in a maintenance layer. What comes up is not engineering data.\n\n`;
      } else {
        t += `A maintenance-layer bypass opens them anyway. What comes up is not engineering data.\n\n`;
      }
      t += `Boarding windows. Priority lists. Atmospheric collapse projections dated before the public alerts. The official story — hours, maybe two days — was the story given to the people on the pads. The people who wrote the manifests had longer.\n\n`;
      if (isAlive("jiro")) t += `Jiro reads without blinking. "They knew enough to choose who the ark was for. We were not a rescue. We were a sample."\n\n`;
      if (isAlive("elias")) t += `Elias: "Then stop mourning the empty bunks as an accident. Treat them as a design."\n\n`;
      if (isAlive("lena")) t += `Lena's voice is flat. "Design or not, the people who did board still bleed."\n\n`;
      t += `The vault framing suddenly looks less like hope and more like the reason the ship existed at all.`;
      return t;
    },
    choices: [
      { text: "Seal the records. The crew cannot use this truth yet.", next: "arc_future_4", effects: { cohesion: 2, integrity: 1 }, flag: { cascade_truth: "sealed" }, lean: { future: 2 }, affinity: { elias: 5 } },
      { text: "Tell the senior crew. No more official stories between us.", next: "arc_future_4", effects: { cohesion: -5, supplies: -1 }, flag: { cascade_truth: "senior" }, lean: { living: 1 }, affinity: { lena: 4, tomas: 4, jiro: 3 } },
      { text: "Broadcast it. The empty ship already knows. The living should too.", next: "arc_future_4", effects: { cohesion: -10, integrity: -2 }, flag: { cascade_truth: "open" }, lean: { living: 2 }, affinity: { tomas: 6, elias: -6 }, trust: { elias: -8, tomas: 6 } }
    ]
  },

  arc_future_4: {
    get text() {
      let t = `A pressure fault opens in the sealed cargo spine`;
      if (isAlive("mira")) t += ` — the abandoned section Mira has been warning about`;
      else t += ` — the abandoned section the board has been flagging`;
      t += `.\n\n`;
      t += `Opening it could yield parts, sealed stores, maybe intact embryo transit gear. It could also vent a corridor you still use.\n\n`;
      if (state.flags.cascade_truth === "open" && isAlive("tomas")) {
        t += `Tomas finds you before you reach the hatch. "If you open that door to feed the vault, say so. Do not call it safety."\n\n`;
      }
      if (state.flags.leadership === "hard" && isAlive("mira")) {
        t += `Mira: "Under your rules I should already be cutting. Give the order or someone else will."\n\n`;
      }
      if (hasMark("mira", "people_first") && isAlive("mira")) {
        t += `She waits longer than the schedule allows. People-first is still a mark she carries.\n\n`;
      }
      t += `What is behind the seal is not neutral. Neither is leaving it closed.`;
      return t;
    },
    choices: [
      { text: "Open it. Take what the future can use.", next: "vault_sacrifice", effects: { supplies: 8, integrity: -8, embryos: 3 }, flag: { abandoned: "opened" }, lean: { future: 3 }, requires: { integrity: { min: 28 } } },
      { text: "Leave it sealed. Some risks are not worth the parts.", next: "vault_sacrifice", effects: { cohesion: 3, integrity: 2 }, flag: { abandoned: "sealed" }, lean: { living: 1 } },
      { text: "Remote scan only. Spend power, not hull.", next: "vault_sacrifice", effects: { supplies: -5, integrity: -1, cohesion: 1 }, flag: { abandoned: "scanned" }, requires: { supplies: { min: 8 }, trust: { mira: 35 } }, alive: "mira" }
    ]
  },

  arc_living_1: {
    get text() {
      let t = `The habitation ring is warmer than the rest of the ship — and failing in smaller, meaner ways.\n\n`;
      if (isAlive("amara")) {
        t += `Amara Vale has rerouted a water line with her own hands. The house key from Lagos hangs at her throat while she works.\n\n`;
        t += `"I can keep the trays and the wash cycle if you give me supply margin. Or I can shut the green down to keep the recyclers honest."\n\n`;
        if (hasMark("amara", "plants_matter")) t += `She already heard you say living things matter. She is waiting to see if that was a sentence or a policy.\n\n`;
        if (hasMark("amara", "math_first")) t += `She does not look at you when she speaks. The math-first answer still sits between you.\n\n`;
      } else {
        t += `The trays run without their keeper. The recyclers do not care about grief.\n\n`;
      }
      if (isAlive("lena") && state.flags.leadership === "hard") {
        t += `Lena, from the hatch: "Hard rules do not grow food. They only decide who goes without."`;
      }
      return t;
    },
    choices: [
      { text: "Give Amara the margin. Keep something green alive.", next: "arc_living_2", effects: { supplies: -6, cohesion: 6, integrity: -2 }, lean: { living: 3 }, affinity: { amara: 10, lena: 3 }, trust: { amara: 8 }, flag: { hydro: "full" }, requires: { supplies: { min: 8 } }, alive: "amara" },
      { text: "Shut the green down. Recyclers and paste first.", next: "arc_living_2", effects: { supplies: 4, cohesion: -5, integrity: 3 }, lean: { future: 2 }, affinity: { amara: -6, elias: 4 }, trust: { amara: -6 } },
      { text: "Split the difference — half trays, tighter wash schedule.", next: "arc_living_2", effects: { supplies: -2, cohesion: 2, integrity: 1 }, lean: { living: 1 }, affinity: { amara: 4 } }
    ]
  },

  arc_living_2: {
    get text() {
      let t = ``;
      if (isAlive("sela")) {
        t += `Sela is not at the bulkhead to be observed. She is working.\n\n`;
        t += `The yellow circle is tighter than last time. Cleaner. When she speaks, it is without asking permission.\n\n`;
        t += `"The panels still run an Earth sunrise. That is a lie with a schedule. I am not trying to replace the sky. I am keeping a measurement the ship keeps trying to delete."\n\n`;
        t += `She turns the plate so you can see the latest version.\n\n`;
        t += `"Jiro thinks I am mourning. He is half right. The other half is refusal. If we only optimize for what survives the dark, we will arrive as the dark."\n\n`;
        if (state.flags.sela_attention === "ignored") t += `She does not mention that you walked past her once. She does not need to.\n\n`;
        if (state.flags.sela_attention === "present" || hasMark("sela", "spoken")) t += `She treats your presence as a fact, not a favor.\n\n`;
        if (isAlive("jiro")) t += `Jiro appears in the hatch, hears the last sentence, and does not correct her.`;
      } else {
        t += `The yellow marks remain on the bulkhead. Their author does not. The ship keeps the pigment and loses the argument.`;
      }
      return t;
    },
    choices: [
      { text: "Tell her refusal is a kind of navigation. Keep the ritual protected.", next: "arc_living_3", effects: { cohesion: 4, supplies: -1 }, lean: { living: 3 }, affinity: { sela: 12, jiro: 6 }, trust: { sela: 10 }, mark: { sela: "spoken" }, flag: { sela_attention: "present" }, alive: "sela" },
      { text: "Ask what she would spend to keep a warm world possible.", next: "arc_living_3", effects: { cohesion: 2 }, lean: { living: 2 }, affinity: { sela: 8 }, trust: { sela: 8 }, mark: { sela: "spoken" }, alive: "sela" },
      { text: "Tell her the ship runs on numbers, not pigment.", next: "arc_living_3", effects: { cohesion: -3, integrity: 1 }, lean: { future: 2 }, affinity: { sela: -4, jiro: -2 }, flag: { sela_attention: "ignored" }, alive: "sela" },
      { text: "Leave the marks where they are.", next: "arc_living_3" }
    ],
    onEnter: () => {
      if (isAlive("sela")) {
        remember("Sela said refusal is half of what the yellow is for.");
        mark("sela", "spoken");
      }
    }
  },

  arc_living_3: {
    get text() {
      // Reactive crew conflict — branches on prior behavior
      let t = `The conflict does not wait for a meeting.\n\n`;
      const hard = state.flags.leadership === "hard";
      const seized = state.flags.stores === "seize";
      const vented = state.flags.crisis === "vent";
      const futurePri = state.flags.vault_priority === "future";

      if (isAlive("tomas") && (hard || seized || futurePri)) {
        t += `Tomas blocks the corridor outside the common area. Not with a weapon. With a refusal.\n\n`;
        if (hard) t += `"Your hard rules are turning the living into inventory. I will not help enforce the next cut."\n\n`;
        else if (seized) t += `"You seized food to teach a lesson. The lesson landed. So did the line between us."\n\n`;
        else t += `"You said the future justifies the cost. I am done pretending that sentence is neutral."\n\n`;
        if (vented) t += `He does not mention the bulkhead. He does not have to. Everyone still feels the missing air.\n\n`;
        t += `Elias, if he is present, waits to see whether you treat this as mutiny or information.`;
      } else if (isAlive("amara") && hasMark("amara", "plants_matter") && state.flags.hydro === "minimal") {
        t += `Amara has shut down a recycler branch without authorization to keep one tray alive.\n\n`;
        t += `"You told me living things matter. Then you starved them. I chose the tray. Write me up or live with it."\n\n`;
        t += `The ship remembers what you promised when it was still cheap.`;
      } else if (isAlive("lena") && state.flags.lena_authority === false) {
        t += `Lena has treated a wound with stock you did not approve. She does not apologize.\n\n`;
        t += `"I will not wait for signatures while someone bleeds. You wanted control. This is what control costs in trust."\n\n`;
      } else {
        t += `Mira and Elias argue in the open about a parts allocation. The crew stops working to listen.\n\n`;
        t += `This is what soft fractures look like before they become factions.`;
      }
      if (state.flags.past === "owned" && isAlive("elias")) {
        t += `\n\nElias's eyes flick to you once. The past you owned in front of him is still on the table between the words.`;
      }
      return t;
    },
    choices: [
      { text: "Back down a step. Adjust the rule that caused this.", next: "arc_living_4", effects: { cohesion: 6, integrity: -2, supplies: -2 }, lean: { living: 2 }, affinity: { tomas: 8, lena: 4 }, trust: { tomas: 10 }, mark: { conflict: "backed" } },
      { text: "Hold the line. Refusal does not rewrite orders.", next: "arc_living_4", effects: { cohesion: -8, integrity: 3 }, lean: { future: 2 }, affinity: { elias: 8, tomas: -8 }, trust: { elias: 8, tomas: -12 }, mark: { conflict: "held" } },
      { text: "Take the argument private. Do not let the corridor become a stage.", next: "arc_living_4", effects: { cohesion: 1, supplies: -1 }, mark: { conflict: "private" }, requires: { trust: { tomas: 40 } } }
    ]
  },

  arc_living_4: {
    get text() {
      let t = `Power, food, and hull come due on the same board.\n\n`;
      t += `You can stabilize the ring for another stretch by burning supply margin. You can protect the margin and accept colder corridors. You can ask the crew to work a double cycle for a temporary patch that will fail later.\n\n`;
      if (hasMark("conflict", "held") && isAlive("tomas")) {
        t += `Tomas is present and silent. Holding the line earlier has a cost in how he looks at the options.\n\n`;
      }
      if (hasMark("conflict", "backed") && isAlive("elias")) {
        t += `Elias: "Every time you bend, the next refusal gets cheaper."\n\n`;
      }
      if (state.flags.cascade_truth === "open") {
        t += `Someone has written a yellow circle on the status board. It is not Sela's hand.\n\n`;
      }
      t += `There is no clean package. Only which shortage you schedule first.`;
      return t;
    },
    choices: [
      { text: "Burn supplies to keep the ring warm and lit.", next: "vault_sacrifice", effects: { supplies: -8, cohesion: 5, integrity: 3 }, lean: { living: 3 }, affinity: { amara: 4, lena: 4 }, requires: { supplies: { min: 10 } } },
      { text: "Protect the margin. Accept colder habitation.", next: "vault_sacrifice", effects: { supplies: 3, cohesion: -6, integrity: 2 }, lean: { future: 2 }, affinity: { elias: 5, jiro: 3 } },
      { text: "Double cycle the crew for a temporary patch. Borrow time.", next: "vault_sacrifice", effects: { cohesion: -4, integrity: 5, supplies: -2 }, lean: { living: 1 }, affinity: { mira: 4 }, requires: { cohesion: { min: 25 } } }
    ]
  },
  vault_sacrifice: {
    get text() {
      const pri = state.flags.vault_priority || "both";
      let t = `A power fault hits the vault and habitation ring at the same time.\n\nMira can stabilize only one grid fully. The other will take irreversible damage. The embryo count will not recover from a living choice; the living will not recover from a full vault divert.\n\n`;
      if (pri === "future") {
        t += `You already said the future is what matters. Elias watches to see if you meant it.\n\n`;
      } else if (pri === "living") {
        t += `You already said the living come first. The vault panel is still cycling viability percentages in the corner of your vision.\n\n`;
      } else {
        t += `You tried to protect both. The ship is no longer offering that luxury.\n\n`;
      }
      // Personal voices — Future vs Living embodied
      if (isAlive("elias")) t += `Elias: "If the vault dies, this was just a slow funeral with better lighting. Feed the future."\n\n`;
      if (isAlive("jiro")) t += `Jiro: "The trajectory was always for the package. We were the escort."\n\n`;
      if (isAlive("lena")) t += `Lena: "I can treat the people in this room. I cannot treat a percentage on a screen."\n\n`;
      if (isAlive("tomas")) t += `Tomas: "Whatever you choose, someone will carry it. Choose knowing that."\n\n`;
      if (isAlive("amara")) t += `Amara: "The trays are still green. That is not a percentage. That is breath."\n\n`;
      if (isAlive("sela")) t += `Sela says nothing. Her latest yellow circle is taped above the vault hatch.\n\n`;
      t += `Mira waits on the switch. "I need an order."`;
      return t;
    },
    choices: [
      { text: "Divert everything to the vault. Protect the embryos and the restart package.", next: "intimacy_window", effects: { integrity: -10, cohesion: -12, supplies: -6 }, flag: { vault_sacrifice: "future" }, lean: { future: 10 }, affinity: { elias: 12, jiro: 10, lena: -10, tomas: -12, amara: -8 }, trust: { elias: 15, jiro: 12, lena: -12, tomas: -15 }, requires: { integrity: { min: 15 }, supplies: { min: 8 } } },
      { text: "Divert everything to life support and habitation. Protect the living.", next: "intimacy_window", effects: { embryos: -28, integrity: 5, cohesion: 8, supplies: 4 }, flag: { vault_sacrifice: "living" }, lean: { living: 10 }, affinity: { lena: 12, tomas: 12, amara: 10, elias: -12, jiro: -10 }, trust: { lena: 14, tomas: 15, elias: -14, jiro: -12 } },
      { text: "Split the difference. Both systems degrade.", next: "intimacy_window", effects: { embryos: -12, integrity: -5, cohesion: -4 }, flag: { vault_sacrifice: "split" }, lean: { future: 3, living: 3 }, affinity: { mira: 6 } }
    ]
  }
});
