// Sunsplitter — scenes-27.js
// 0.28.1c size hygiene. Pure mechanical. late: reckon_summary
// Strict scene shape only: text | choices | onEnter | image
registerScenes({

  reckon_summary: {
    get text() {
      const deadList = namedDead();
      const pri = state.flags.vault_priority || "both";
      const sac = state.flags.vault_sacrifice;
      let t = `Before the final order, you take stock.\n\n`;
      t += `Survivors: ${state.survivors}. Hull ${state.integrity}%. Cohesion ${state.cohesion}%. Supplies ${state.supplies}%.\n`;
      t += `Embryos ${state.embryos}%.

`;
      if (deadList.length) t += `Dead: ${deadList.join("; ")}.\n\n`;
      t += `Early priority: ${pri}.`;
      if (sac) t += ` Vault crisis: ${sac}.`;
      if (state.flags.abandoned === "opened") t += ` Abandoned section opened.`;
      else if (state.flags.abandoned === "sealed") t += ` Abandoned section left sealed.`;
      else if (state.flags.abandoned === "scanned") t += ` Abandoned section scanned only.`;
      if (state.flags.signal === "chase") t += ` Signal pursued.`;
      else if (state.flags.signal === "ignore") t += ` Signal ignored.`;
      else if (state.flags.signal === "study") t += ` Signal studied.`;
      if (state.flags.vault_voice === "off") t += ` Vault voice silenced.`;
      else if (state.flags.vault_voice === "on") t += ` Vault voice left running.`;
      else if (state.flags.vault_voice === "restricted") t += ` Vault voice restricted.`;
      if (state.flags.sela_attention === "present") t += ` You sat with Sela's ritual.`;
      else if (state.flags.sela_attention === "ignored") t += ` You walked past Sela's ritual.`;
      if (state.flags.rourke === "stopped") t += ` Rourke was ordered cut.`;
      else if (state.flags.rourke === "stayed") t += ` You stayed with Rourke.`;
      else if (state.flags.rourke === "tried") t += ` You spent supplies on Rourke.`;
      t += `\n`;
      if (state.romance.mira && isAlive("mira")) t += `You and Mira crossed a line.\n`;
      else if (state.romance.mira) t += `You and Mira crossed a line. She is no longer here to carry it.\n`;
      if (state.romance.lena && isAlive("lena")) t += `You and Lena crossed a line.\n`;
      else if (state.romance.lena) t += `You and Lena crossed a line. That fact outlived her.\n`;
      if (state.romance.amara && isAlive("amara")) t += `You and Amara claimed the bay as more than hydroponics.\n`;
      else if (state.romance.amara) t += `You and Amara claimed the bay. That fact outlived her.\n`;
      if (state.romance.sela && isAlive("sela")) t += `Sela chose you without an audience. The yellow is still a fact.\n`;
      else if (state.romance.sela) t += `Sela chose you without an audience. That fact remains after her.\n`;
      if (state.romance.amara_tomas && isAlive("amara") && isAlive("tomas")) t += `Amara and Tomas claimed something private — and may have included you.\n`;
      else if (state.romance.amara_tomas) t += `Amara and Tomas claimed something private. Not all of them remain.\n`;
      if (state.romance.vess && isAlive("vess")) t += `Vess offered the attempt and you accepted. Power stayed hers.\n`;
      else if (state.romance.vess) t += `Vess offered the attempt and you accepted. That fact outlived her.\n`;
      if (state.flags.pregnancy_risk === true) t += `A living pregnancy is possible.\n`;
      if (state.past_known && isAlive("elias")) t += `Elias knows how you got your seat.\n`;
      else if (state.past_known) t += `Your past leaked. The man who used it is gone.\n`;
      if (isAlive("lena") && state.dying && state.dying.lena) t += `Lena is on a clock.\n`;
      // Tomas memory only if the private conversation actually happened
      if (state.flags.tomas === "living" && isAlive("tomas")) t += `Tomas was told the living come first.\n`;
      else if (state.flags.tomas === "future" && isAlive("tomas")) t += `Tomas was told the future justifies the cost.\n`;
      else if (state.flags.tomas === "future") t += `Tomas was told the future justifies the cost. That conversation is finished.\n`;
      else if (state.flags.tomas === "hold" && isAlive("tomas")) t += `Tomas was asked to hold.\n`;
      else if (hasMark("tomas", "broke") && isAlive("tomas")) t += `Tomas broke when you chose the future over him.\n`;
      else if (hasMark("tomas", "broke")) t += `Tomas broke when you chose the future over him. That conversation is finished.\n`;
      else if (hasMark("tomas", "held") && isAlive("tomas")) t += `Tomas is still holding after you asked him to.\n`;
      else if (hasMark("tomas", "warned") && isAlive("tomas")) t += `Tomas warned you he was running out of something quieter than faith.\n`;
      // Favoritism = private hours / affinity gap only (not policy alignment)
      const fav = favoritism();
      if (fav && crew[fav.favored] && isAlive(fav.favored)) t += `The crew has noticed your private preference for ${crew[fav.favored].name}.\n`;
      else if (fav && crew[fav.favored]) t += `The crew noticed your private preference for ${crew[fav.favored].name}. That preference is now a ghost.\n`;
      if (state.memories.length) t += `\nSomething private still sits with you: ${state.memories[state.memories.length - 1]}\n`;
      t += `\nThe crew is watching. The next decision is the one the ship will remember.`;
      return t;
    },
    get choices() {
      // Route into the matching reckon_* beat by flag, then sun_payoff
      const r = state.flags.reckon;
      const next =
        r === "public" ? "reckon_public" :
        r === "suppress" ? "reckon_suppress" :
        r === "memory" ? "reckon_memory" :
        r === "truth" ? "reckon_truth" :
        "sun_payoff";
      return [
        { text: "Make the final decision now.", next },
        { text: "One more look at the numbers. Then decide.", next, effects: { cohesion: 1 } }
      ];
    }
  },

});
