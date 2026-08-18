// Sunsplitter — scenes-33.js
// 0.28.2 size hygiene. Pure mechanical. mid-b: pursuit_amara + sex + pursuit_sela + sex
// Strict scene shape only: text | choices | onEnter | image
registerScenes({

  pursuit_amara: {
    get text() {
      let t = `Amara does not pretend this is accidental. The lingerie is practical and deliberate — straps she can work in, fabric that will not snag on a tray rail. She locks the bay hatch a second time.\n\n`;
      t += `"Tomas knows what the first night was. He does not get a vote on the second. You do. But I am not offering a free private hour."\n\n`;
      t += `She opens the purge schedule on the grow-deck panel. The contaminated compartment is flagged for vent this watch.\n\n`;
      t += `"I can delay one cycle and keep the viable roots. You claim the delay on the board. Publicly. No soft private order. The clean-air margin moves. Elias and Jiro will see who asked for the living things. If you stay, the cost is visible and I will not hide it. I will not become the Commander's soft place that costs the ship nothing."\n\n`;
      t += `The trays hum. The house key sits on the shelf. She is already undoing the collar.`;
      return t;
    },
    choices: [
      { text: "Delay the vent and claim it publicly. Stay.", next: "pursuit_amara_sex", effects: { supplies: -4, integrity: -2, cohesion: -3 }, lean: { living: 3 }, affinity: { amara: 12, elias: -4, jiro: -3 }, trust: { amara: 6 }, flag: { pursuit_amara_cost: "vent_delay", amara_vent_delayed: true } },
      { text: "Negotiate: delay half a cycle, still claim it, still stay.", next: "pursuit_amara_sex", effects: { supplies: -2, cohesion: -1 }, lean: { living: 1 }, affinity: { amara: 8 }, flag: { pursuit_amara_cost: "half" } },
      { text: "Refuse. Let the compartment vent. You will not stack a public Living cost and a second claim the same night.", next: "debt_notice", affinity: { amara: 2 }, mark: { amara: "pursuit_declined" } }
    ],
    onEnter: () => { if (!isAlive("amara")) return "pursuit_window"; },
    image: "images/lingerie_amara.jpg"
  },

  pursuit_amara_sex: {
    get text() {
      let t = `She is vocal again — less performance, more insistence. The bay smells of damp green and skin. Afterward she puts the key back around her neck and looks at you without soft focus. The lingerie is on the deck. The purge timer has been pushed.\n\n`;
      if (state.flags.pursuit_amara_cost === "vent_delay") {
        t += `"If they ask, tell the truth," she says. "I delayed a contaminated vent to keep roots alive. You claimed it while you were inside me. That is the version I will not edit."\n\n`;
      } else {
        t += `"Half a cycle is still a choice," she says. "The board will see the claim. I am done managing other people's feelings about who you choose and what it costs."\n\n`;
      }
      t += `The intimacy and the filtration decision share the same lock cycle.`;
      return t;
    },
    get choices() {
      const opts = [
        { text: "Match her honesty. Leave the bay together.", next: "prom_make_amara_ag", affinity: { amara: 8 }, lean: { living: 1 } },
        { text: "Say less than she did. Leave before the next status walk.", next: "prom_make_amara_ag", affinity: { amara: 4 } }
      ];
      // 0.22.1 optional one-shot rear linger
      if (isAlive("amara") && !state.flags.amara_rear_done) {
        opts.push({ text: "Stay a moment longer. Watch her before either of you reaches for the key.", next: "amara_rear" });
      }
      return opts;
    },
    onEnter: () => {
      if (!isAlive("amara")) return "debt_notice";
      if (!state.pursuit.amara) {
        state.pursuit.amara = true;
        addAffinity("amara", 22);
        if (isAlive("tomas")) addAffinity("tomas", -8);
        if (state.flags.amara_vent_delayed) {
          remember("Amara claimed a second night and a public delay of a contaminated grow vent. The clean-air margin moved for living stock.");
        } else {
          remember("Amara claimed a second night and a partial vent delay. Tomas and the ledger both have a version.");
        }
      }
    },
    image: "images/afterglow_amara.jpg"
  },

  pursuit_sela: {
    get text() {
      let t = `Sela does not raise her voice. She never needs to. The lingerie is simple, exact, adult. The pigment plate is between you again.\n\n`;
      t += `"You already know the true version. I am asking whether it was a single measurement or a series."\n\n`;
      t += `She does not move closer until the next sentence is finished.\n\n`;
      t += `"Neither of us may use command authority to secure the other a place in the vault. Survival value alone. If you stay, you speak that vow where the ship can log it. I will not be the private exception. The relationship has to cost the discretion, or it is only a soft place for you. I refuse that."\n\n`;
      t += `She is exact. She is not offering a symbol as a substitute for her body. The bulkhead is cold behind her.`;
      return t;
    },
    choices: [
      { text: "Speak the vow. Let the ship log it. Stay.", next: "pursuit_sela_sex", effects: { cohesion: 1 }, lean: { living: 2 }, affinity: { sela: 14, jiro: -2, elias: -2 }, trust: { sela: 9 }, flag: { pursuit_sela_cost: "vow", sela_vault_vow: "accepted" } },
      { text: "Negotiate: private vow between the two of you only, still stay.", next: "pursuit_sela_sex", lean: { living: 1 }, affinity: { sela: 10 }, trust: { sela: 5 }, flag: { pursuit_sela_cost: "private_vow", sela_vault_vow: "accepted" } },
      { text: "Refuse the vow. One measurement was the honest limit. Leave the plate.", next: "debt_notice", affinity: { sela: 3 }, mark: { sela: "pursuit_declined" }, flag: { sela_vault_vow: "refused" } }
    ],
    onEnter: () => { if (!isAlive("sela")) return "pursuit_window"; },
    image: "images/lingerie_sela.jpg"
  },

  pursuit_sela_sex: {
    get text() {
      let t = `She is as precise as before. The intimacy is quiet, exact, adult. Afterward she draws nothing on your skin. The lingerie is folded once. She only says:\n\n`;
      if (state.flags.pursuit_sela_cost === "vow") {
        t += `"The log has the entry. Jiro will see it if he looks. That is his measurement. I will not solve it for you. Neither of us gets a private vault privilege because of this."\n\n`;
      } else {
        t += `"The private word is not nothing, but it is less than a logged cost. I accepted it. Do not make me soft in the story. The vow still holds between us."\n\n`;
      }
      t += `The bulkhead still holds the earlier yellow circle. The ship has a new private mark and a new irreversible one.`;
      return t;
    },
    get choices() {
      const opts = [
        { text: "Accept that cost. Leave before the corridor invents the rest.", next: "debt_notice", affinity: { sela: 9 }, lean: { living: 1 } },
        { text: "Match her silence a minute longer. Then go.", next: "debt_notice", affinity: { sela: 6 } }
      ];
      // 0.22.1 optional one-shot rear linger
      if (isAlive("sela") && !state.flags.sela_rear_done) {
        opts.push({ text: "Stay. Let the silence hold a little longer before either of you moves.", next: "sela_rear" });
      }
      return opts;
    },
    onEnter: () => {
      if (!isAlive("sela")) return "debt_notice";
      if (!state.pursuit.sela) {
        state.pursuit.sela = true;
        addAffinity("sela", 24);
        if (isAlive("jiro")) addAffinity("jiro", -5);
        if (state.flags.sela_vault_vow === "accepted") {
          remember("Sela chose a second series and logged an irrevocable vow: no command privilege for vault places between you.");
        } else {
          remember("Sela chose a second series under a private vow only.");
        }
      }
    },
    image: "images/afterglow_sela.jpg"
  },

});
