// Sunsplitter — scenes-32.js
// 0.28.1c size hygiene. Pure mechanical. mid-b: pursuit_window + pursuit_mira + sex
// Strict scene shape only: text | choices | onEnter | image
registerScenes({

  pursuit_window: {
    onEnter: () => {
      if (!state.flags.ship_interrupt_fired && (state.flags.ship_memory === "jury_rig" || state.flags.ship_memory === "open_wound")) {
        return "ship_interrupt";
      }
    },
    get text() {
      const open = [];
      for (const who of ["mira", "amara", "sela", "lena"]) {
        if (state.romance[who] && !state.pursuit[who] && isAlive(who)) open.push(crew[who].name);
      }
      let t = `Private time is almost spent.\n\n`;
      if (open.length) {
        t += `Someone you already crossed a line with may still come looking: ${open.join(", ")}. A second approach is not free — the crew will read it as a pattern.\n\n`;
      } else {
        t += `No one is initiating a second private claim right now.\n\n`;
      }
      if (typeof hasOpenRomanceGates === "function" && hasOpenRomanceGates()) {
        t += `There is still room for one first-time bond if you insist — but every hour here is an hour not spent on the ship.\n\n`;
      }
      const debt = typeof relationshipDebtors === "function" ? relationshipDebtors() : [];
      if (debt.length) {
        t += `Already, ${debt.map(k => crew[k].name).join(", ")} have gone quieter when you pass.`;
      }
      return t;
    },
    get choices() {
      const opts = [];
      if (typeof hasOpenRomanceGates === "function" && hasOpenRomanceGates()) {
        opts.push({ text: "Use the last private window on someone new.", next: "intimacy_window" });
      }
      for (const who of ["mira", "amara", "sela", "lena"]) {
        if (state.romance[who] && !state.pursuit[who] && isAlive(who)) {
          const label = {
            mira: "Mira finds you again in the drive bay.",
            amara: "Amara locks the bay hatch a second time.",
            sela: "Sela is waiting at the bulkhead with the pigment still wet.",
            lena: "Lena stops you outside medical — not for a report."
          }[who];
          opts.push({ text: label, next: "pursuit_" + who, alive: who });
        }
      }
      if (isAlive("mira") && !state.favors.mira && (state.trust.mira || 0) >= 45) {
        opts.push({ text: "Ask Mira for one quiet favor — parts only she can free.", next: "favor_mira", alive: "mira" });
      }
      // 0.23.3: close private hours into debt_notice so recovery spine (Tomas/Jiro + vault face) is reachable
      opts.push({ text: "Close the private hours. Return to the fracture.", next: "debt_notice" });
      return opts;
    }
  },

  pursuit_mira: {
    get text() {
      let t = `Mira has washed the grease off. The lingerie is deliberate — not soft, not accidental. She stands between you and the only exit of the drive bay and does not pretend this is spontaneous.\n\n`;
      t += `"I will stay. But the price is not private."\n\n`;
      t += `She taps the console. The ship retained the first night: intimate audio fragments and the private command language you used about the vault.\n\n`;
      t += `"Disclose the full retention to the status board. Not a summary. The intimate record and the vault talk together. If you want me again, the closed door ends. People will know what we said when we thought the ship was only listening for systems. That is the cost."\n\n`;
      t += `The bay is dim. She is already half out of the suit. The request is the same shape as an order she is forcing you to own.`;
      return t;
    },
    choices: [
      { text: "Authorize full disclosure. Stay. Let the record go public.", next: "pursuit_mira_sex", effects: { cohesion: -5, integrity: -1 }, lean: { future: 2 }, affinity: { mira: 12, tomas: -3, elias: -3 }, trust: { mira: 7 }, flag: { pursuit_mira_cost: "disclosed", mira_memory_public: true } },
      { text: "Negotiate: disclose the vault talk, keep the intimate retention sealed.", next: "pursuit_mira_sex", effects: { cohesion: -2 }, lean: { future: 1 }, affinity: { mira: 8 }, trust: { mira: 3 }, flag: { pursuit_mira_cost: "partial" } },
      { text: "Refuse the price. One crossing was enough.", next: "debt_notice", affinity: { mira: 2 }, trust: { mira: 1 }, mark: { mira: "pursuit_declined" } }
    ],
    onEnter: () => { if (!isAlive("mira")) return "pursuit_window"; },
    image: "images/lingerie_mira.jpg"
  },

  pursuit_mira_sex: {
    get text() {
      let t = `What follows is quieter than the first time and more exposing. She is specific about what she wants and does not look away. The bay smells of ozone and skin. Afterward she does not dress immediately. She sits on the deck plating with her back against the console, lingerie discarded, and breathes like someone who has decided the public cost is acceptable.\n\n`;
      if (state.flags.pursuit_mira_cost === "disclosed") {
        t += `"The board has the file," she says. "Intimate and vault language both. That is the accurate version of what we just did. You lost the closed door because I asked and you said yes."\n\n`;
      } else {
        t += `"They have the vault talk," she says. "The intimate retention stays sealed for now. Less than full honesty, but enough that the knowing is no longer only ours."\n\n`;
      }
      t += `Still naked, she puts your palm flat to the drive vibration.\n\n"If a clean repair ever needs one body behind a sealed hatch, I will tell you if I choose it. What happened in this bay is data. It is not a veto."\n\n`;
      t += `Outside the hatch the ship is already adjusting who can open which logs. The intimacy and the disclosure share the same hour.`;
      return t;
    },
    get choices() {
      const opts = [
        { text: "Accept the accuracy. Leave with her before the corridor fills.", next: "debt_notice", affinity: { mira: 8 } },
        // Edit D: drop cohesion gate on afterglow choice 2
        { text: "Ask her to keep the remaining details private even if the fact is not.", next: "debt_notice", effects: { cohesion: -2 }, affinity: { mira: 4 } }
      ];
      // 0.22.1 optional one-shot rear linger
      if (isAlive("mira") && !state.flags.mira_rear_done) {
        opts.push({ text: "Stay a breath longer. Watch her before either of you reaches for clothes.", next: "mira_rear" });
      }
      return opts;
    },
    onEnter: () => {
      if (!isAlive("mira")) return "debt_notice";
      if (!state.pursuit.mira) {
        state.pursuit.mira = true;
        addAffinity("mira", 22);
        if (state.flags.mira_memory_public) {
          remember("Mira came back. The second crossing forced full disclosure of the retained intimate and vault record. The closed door is gone.");
        } else {
          remember("Mira came back. Partial disclosure of the vault talk. The pattern is public enough.");
        }
      }
    },
    image: "images/afterglow_mira.jpg"
  },

});
