// Sunsplitter — scenes-14.js
// 0.28.1c size hygiene. Pure mechanical. crises: reckoning burns + delay + cut
// Strict scene shape only: text | choices | onEnter | image
registerScenes({

  act3_reckoning_burn_stale: {
    image: "images/act3_reckoning_burn_stale.jpg",
    onEnter: () => {
      state.flags.burn_unverified = true;
      state.flags.course_option_lost = true;
      state.flags.margin_committed = true;
      remember("Committed the correction burn on unverified blister telemetry.");
    },
    text: () => {
      let t = `The burn goes at the top of the hour, on numbers eleven days old, written by a man breathing his own exhaust. Ninety seconds of thrust. The margin gauge falls and does not come back.

Nothing feels wrong. That is the honest description: nothing feels wrong.`;
      if (isAlive("mira")) {
        t += `\n\nMira finishes her verification anyway, after, because that's who she is. She reads the result once, closes the pane, and says two words to nobody in particular. "Solution archived." She doesn't offer it, and you don't ask.`;
      }
      return t;
    },
    choices: [
      { text: "Take us to the blister.", next: "act3_reckoning_cut" }
    ]
  },

  act3_reckoning_burn_verified: {
    image: "images/act3_reckoning_burn_verified.jpg",
    onEnter: () => {
      state.flags.margin_committed = true;
      remember("Committed the verified correction burn; spent the insertion margin.");
    },
    text: () => {
      let t = `Mira takes thirty-eight of her forty minutes.

"Ninety-four percent confidence," she says. "The other six belongs to the universe, not to me." The heading goes on the log with her number beside it, and the burn goes at the top of the hour. Ninety seconds of thrust. The margin gauge falls and does not come back.`;
      if (isAlive("tomas") && state.recovered.tomas) {
        t += `\n\nTomas watches the gauge the whole time. "You heard me and you spent it anyway," he says afterward, without heat. "That's your job. Mine is remembering the price every time we sit down to eat, and I'm good at my job too."`;
      }
      return t;
    },
    choices: [
      { text: "Take us to the blister.", next: "act3_reckoning_cut" }
    ]
  },

  act3_reckoning_delay: {
    image: "images/observation_bridge.jpg",
    onEnter: () => {
      state.flags.margin_spent_extra = true;
      state.flags.margin_committed = true;
      remember("Delayed one full cycle to hear objections; spent additional propellant margin.");
    },
    text: () => {
      let t = `You give it the cycle. Tomas takes it — all of it — and he doesn't waste a minute: mouths per day, calories per tray, the arithmetic of the margin laid out in food because food is the only currency he trusts.`;
      if (isAlive("amara")) {
        t += `\n\n"He's not wrong," Amara says at the end of it, "and neither are you, which is why this one's yours and not a vote. Just so we're clear that everyone in this room knows exactly what's being bought and who's owed for it."`;
      }
      t += `\n\nAnd through the whole argument, every six hours to the second, the ring corrects. Four adjustments. A pause. Four more. A man you cannot hear, keeping his appointment.

The burn goes a full cycle late, on ${isAlive("mira") ? "Mira's verified solution" : "the best solution the boards can make"}, and the correction for the wait costs margin the original plot never owed. The gauge falls further than it should have. Everyone watches it do it.`;
      return t;
    },
    choices: [
      { text: "Take us to the blister.", next: "act3_reckoning_cut" }
    ]
  },

  act3_reckoning_cut: {
    image: "images/cut_out.jpg",
    onEnter: () => {
      if (!isRecovered("jiro")) {
        state.recovered.jiro = true;
        state.flags.position_certain = true;
        remember("Cut through the buckled spine; recovered Jiro alive from the astrogation blister.");
      }
    },
    text: () => {
      let t = `The cut is a one-way decision made of six hours of torch work. Buckled spine doesn't reseal; what opens stays open. `;
      if (isAlive("elias")) {
        t += `Elias runs the torch himself and doesn't hand it off once.`;
      } else {
        t += `The torch work goes in shifts, and nobody talks over it.`;
      }
      t += `\n\nThe blister opens on stale air and a man surrounded by paper. Printed starcharts, margins black with handwritten fixes — nineteen days of positions run by hand, every four hours, in a place with no one to report them to. Jiro comes out on his own, logs first, then himself, in that order.`;
      if (state.flags.burn_unverified) {
        t += `\n\nOn the way in he asks for the burn log. He reads it once, top to bottom, at his own pace. "Logged," he says, and nothing else.`;
      }
      if (isAlive("tomas") && state.recovered.tomas && !state.flags.tomas_scapegoated) {
        t += `\n\nTomas is there when the blister opens. The two of them look at each other across nineteen days and one breach. "Rourke," Tomas says — just the name, the whole accusation and the whole grief in two syllables — and walks away before anyone can make it a conversation.`;
      } else if (isAlive("tomas") && state.recovered.tomas && state.flags.tomas_scapegoated) {
        t += `\n\nTomas doesn't come down for it. The absence stands in the corridor like a posted notice.`;
      }
      t += `\n\nJiro straightens as much as nineteen days will let him, logs against his chest.\n\n"I know exactly where we are now. You won't like how far that is."`;
      return t;
    },
    choices: [
      { text: "Briefing. One hour.", next: "act3_reckoning_briefing" }
    ]
  },

});
