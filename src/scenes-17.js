// Sunsplitter — scenes-17.js
// 0.28.1c size hygiene. Pure mechanical. crises: vess boarding + offer
// Strict scene shape only: text | choices | onEnter | image
registerScenes({

  vess_boarding: {
    image: "images/vess_boarding.jpg",
    onEnter: () => {
      if (!isRecovered("vess")) {
        state.recovered.vess = true;
        state.survivors = Math.min((state.survivors || 0) + 1, 20);
        if (state.affinity.vess === undefined) state.affinity.vess = 0;
        if (state.trust.vess === undefined) state.trust.vess = 35;
        remember("Recovered Vess, sole survivor of the Dawnbreak fragment.");
      }
    },
    text: () => {
      let t = `The fragment docks ugly — no working attitude thrusters, only a hard magnetic grab and a pressure equalize that makes the whole ring complain. The hatch opens on a tall, wiry figure in a suit patched by the same hands for six years. Long white-silver hair still held back from six years of solo work. She looks at you too long, then not at all.

"Commander. Your hull ID has been in my night log for eleven months. I said the names of the Dawnbreak dead every night so somebody did. Yours I already knew."

The flat voice cracks on the last word. She recovers it immediately, the way a log entry recovers from a dropped packet.`;
      if (isAlive("lena")) {
        t += `\n\nLena is already moving toward the hatch with a med kit. "Six years closed-loop. Hypercapnia baseline, possible calcium loss, treatable. Let me see her before anyone else does."`;
      }
      return t;
    },
    choices: [
      { text: "Get her through the collar. Then talk.", next: "vess_offer" }
    ]
  },

  vess_offer: {
    image: "images/vess_offer.jpg",
    onEnter: () => {
      if (!isAlive("vess")) return "act3_spine_next";
    },
    text: () => {
      let t = `She finds you in the observation blister before the first full watch is over. The suit is off; the underlayer is clean enough to show she cared about the first impression. She stands too close or too far — the distance is wrong in both directions.

"I have read the manuals on pair-bonding under isolation. The success rate is low. The failure mode is worse. I am offering the attempt. You may refuse. The refusal will be logged as a clean decision."`;
      // Informed / run-reading first offer — cites actual run state
      if (state.flags.vault_sacrifice === "future") {
        t += `\n\n"Your vault choice is already in the traffic. You kept the package. I understand the arithmetic. I also understand what it costs the people who are still breathing."`;
      } else if (state.flags.vault_sacrifice === "living") {
        t += `\n\n"Your vault choice is already in the traffic. You kept the living. I have been alone long enough to know what that decision is worth."`;
      }
      const deadNamed = (state.dead || []).filter(k => k !== "rourke" && crew[k]).map(k => crew[k].first || k);
      if (deadNamed.length) {
        let list;
        if (deadNamed.length === 1) list = deadNamed[0];
        else if (deadNamed.length === 2) list = deadNamed[0] + " and " + deadNamed[1];
        else list = deadNamed.slice(0, -1).join(", ") + ", and " + deadNamed[deadNamed.length - 1];
        t += `\n\n"I heard the casualty list. ${list}. I said their names once when the beacon logged the update. That is all I can offer the dead."`;
      }
      // Minimal cross-route seed: awareness as witnessed fact only
      const activeRoms = ["lena", "mira", "amara", "sela"].filter(k => state.romance[k] && isAlive(k));
      if (activeRoms.length) {
        const firstNames = activeRoms.map(k => crew[k] ? crew[k].first : k);
        if (firstNames.length === 1) {
          t += `\n\n"Your private channels are not as sealed as the manuals assume. One of them is still warm. ${firstNames[0]}. I am not asking you to close it. I am asking whether there is room for a second log."`;
        } else {
          const names = firstNames.length === 2
            ? firstNames[0] + " and " + firstNames[1]
            : firstNames.slice(0, -1).join(", ") + ", and " + firstNames[firstNames.length - 1];
          t += `\n\n"Your private channels are not as sealed as the manuals assume. Some of them are still warm. ${names}. I am not asking you to close it. I am asking whether there is room for a second log."`;
        }
      } else {
        t += `\n\n"I have been talking to this hull longer than you have been answering. The first yes is the only one that matters. After that the procedure is either mutual or it is not."`;
      }
      t += `\n\nShe waits. The flatness is a skill; the waiting is not.`;
      return t;
    },
    get choices() {
      if (!isAlive("vess") || state.romance.vess || hasMark("vess", "declined")) {
        return [{ text: "Return to the watch.", next: "act3_spine_next" }];
      }
      return [
        { text: "Accept the offer. Power stays with her.", next: "vess_transmission", tag: "private", mark: { vess: "accepted" }, affinity: { vess: 6 }, trust: { vess: 4 } },
        { text: "Decline. Log it clean.", next: "act3_spine_next", mark: { vess: "declined" }, affinity: { vess: 1 } }
      ];
    }
  },

});
