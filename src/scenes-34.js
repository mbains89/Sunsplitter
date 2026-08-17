// Sunsplitter — scenes-34.js
// 0.28.1c size hygiene. Pure mechanical. mid-b: pursuit_lena + sex + debt_notice
// Strict scene shape only: text | choices | onEnter | image
registerScenes({

  pursuit_lena: {
    get text() {
      let t = `Lena's second approach is clinical until it is not. The lingerie is under the open medical coat — practical, deliberate, not soft. She stops you outside the treatment bay, not for a report.\n\n`;
      t += `"I am not improved. The math is the same. If you are here out of pity, walk."\n\n`;
      t += `She does not look away. She opens the cold drawer just far enough for you to see the sealed regenerative.\n\n`;
      t += `"This is the last uncontaminated dose. It buys months. It does not cure. If you stay, you authorize it for me. The board will see a private name on a medical expenditure that was meant for the next triage. I will not take it as an invisible favor. The living will notice who the last treatment went to."\n\n`;
      t += `The bay smells of antiseptic and her skin. The body clock and the medical clock are the same instrument.`;
      return t;
    },
    choices: [
      { text: "Authorize the last regenerative for her. Stay. Accept the public cost.", next: "pursuit_lena_sex", effects: { supplies: -4, cohesion: -4 }, affinity: { lena: 12, elias: -3, mira: -2 }, trust: { lena: 8 }, flag: { pursuit_lena_cost: "regen", lena_regen: true }, lean: { living: 2 } },
      { text: "Negotiate: authorize it, but record that the private history is not invisible.", next: "pursuit_lena_sex", effects: { supplies: -3, cohesion: -2 }, affinity: { lena: 9 }, trust: { lena: 5 }, flag: { pursuit_lena_cost: "honest_regen", lena_regen: true } },
      { text: "Walk. You will not take comfort that spends the last dose on private history.", next: "debt_notice", affinity: { lena: 3 }, mark: { lena: "pursuit_declined" } }
    ],
    onEnter: () => { if (!isAlive("lena")) return "pursuit_window"; },
    image: "images/lingerie_lena.jpg"
  },

  pursuit_lena_sex: {
    get text() {
      let t = `It is slower this time. She still does not ask you to be careful. The intimacy is frank, close, unsentimental. Afterward she buttons the coat over the lingerie like a uniform and checks the time. The cold drawer is open.\n\n`;
      if (state.flags.pursuit_lena_cost === "regen") {
        t += `"The dose is spent," she says. "If the next triage list is written while I am still breathing, the board already knows where the last regenerative went. Do not make me a soft story in the crew's theory."\n\n`;
      } else {
        t += `"The dose is spent and the history is on the record," she says. "Do not let either one become a story you use to feel less brutal."\n\n`;
      }
      t += `The medical clock is still running. The private hour and the last treatment share the same expenditure.`;
      return t;
    },
    get choices() {
      const opts = [
        { text: "Refuse the soft story. Leave on her terms.", next: "prom_make_lena_ag", affinity: { lena: 8 } },
        { text: "Hold the silence with her a minute longer. Then go.", next: "prom_make_lena_ag", affinity: { lena: 6 } }
      ];
      // 0.22.1 optional one-shot rear linger
      if (isAlive("lena") && !state.flags.lena_rear_done) {
        opts.push({ text: "Stay a breath longer. Watch her before the coat is fully buttoned.", next: "lena_rear" });
      }
      return opts;
    },
    onEnter: () => {
      if (!isAlive("lena")) return "debt_notice";
      if (!state.pursuit.lena) {
        state.pursuit.lena = true;
        addAffinity("lena", 22);
        if (state.flags.lena_regen) {
          remember("Lena came back while her clock was still running and made the second night cost the last regenerative treatment.");
        } else {
          remember("Lena came back while her clock was still running.");
        }
      }
    },
    image: "images/afterglow_lena.jpg"
  },

  debt_notice: {
    get text() {
      const debt = typeof relationshipDebtors === "function" ? relationshipDebtors() : [];
      let t = `The private hours end. The ship does not.\n\n`;
      if (debt.length) {
        t += `When you return to the common corridor, the temperature has changed.\n\n`;
        if (debt.includes("elias")) t += `Elias's reports get shorter. He does not argue. He also does not offer.\n`;
        if (debt.includes("tomas")) t += `Tomas stops looking for you when he prays. That is not nothing.\n`;
        if (debt.includes("jiro")) t += `Jiro answers navigation questions and nothing else.\n`;
        if (debt.includes("mira") && !state.romance.mira) t += `Mira is in engineering with the door more closed than usual.\n`;
        if (debt.includes("amara") && !state.romance.amara) t += `Amara works the trays with her back to the hatch.\n`;
        if (debt.includes("lena") && !state.romance.lena) t += `Lena's medical updates arrive as text only.\n`;
        if (debt.includes("sela") && !state.romance.sela) t += `Sela's yellow circles continue. She does not look up when you pass.\n`;
        t += `\nThis is not a mutiny. It is people rationing what they give a commander who has already rationed his attention.`;
      } else {
        t += `No one makes a speech about who you kept close. That does not mean no one measured it.`;
      }
      return t;
    },
    get choices() {
      // 0.23: after private hours close → Tomas recovery (Green Tether) if not yet recovered
      const next = state.recovered && state.recovered.tomas ? (state.recovered.jiro ? "act3_spine_next" : "act3_reckoning_pattern") : "act2_tether_sighting";
      return [
        { text: "Take the temperature change as data. Move on.", next },
        { text: "Spend one public hour fixing something with your own hands.", next, effects: { cohesion: 3, integrity: 1 } }
      ];
    }
  },

});
