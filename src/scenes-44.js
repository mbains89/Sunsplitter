// Sunsplitter — scenes-44.js
// 0.28.1c size hygiene. Pure mechanical. promises: make/r tomas + elias + sela + mira
// Strict scene shape only: text | choices | onEnter | image
registerScenes({

  prom_make_tomas: {
    image: "images/quiet_tomas.jpg",
    onEnter: () => {
      if (!isAlive("tomas") || state.promises.tomas) {
        return state.flags.vault_sacrifice ? "act3_spine_next" : "lead_prompt";
      }
    },
    get text() {
      let t = `Tomas is thinning sprouts into a tin he'll eat from later, because nothing green dies twice on his watch.

"I did the arithmetic in the annex every day," he says. "Vault on one side, me on the other. I know exactly what I decided, because I'm standing here and a third of the germplasm isn't."`;
      if (state.flags.manifest_lie) {
        t += `\n\n"You logged my hunger as breach loss. I carry that with you now. So this is me asking the one who shares my books, not the Commander who keeps them."`;
      }
      t += `\n\nHe sets the tin down. "One day the ship puts that sum in front of you with people in it. I'd like to know now what kind of answer you are."`;
      return t;
    },
    choices: [
      { text: `"If the vault and the living need the same mercy, the living get it."`,
        flag: { prom_tomas: true },
        remember: "You promised Tomas the living get the mercy before the vault.",
        next: "prom_r_tomas" },
      { text: `"You'll get my answer when the ship asks the question."`,
        next: "prom_r_tomas" }
    ]
  },

  // PRE: entered from prom_make_tomas only | WRITES: onEnter promises.tomas (idempotent) | DEATH: none | IMG: reuse
  prom_r_tomas: {
    image: "images/quiet_tomas.jpg",
    onEnter: () => {
      if (!state.promises.tomas) state.promises.tomas = state.flags.prom_tomas ? "made" : "declined";
    },
    get text() {
      if (!isAlive("tomas")) return `The tin stays where he left it.`;
      return state.promises.tomas === "made"
        ? `He takes the sprouts up again, slower, like the work got lighter and he doesn't trust it.

"Then I'll hold the vault to it too. It's outlived every promise anyone made near it. Not this one. I'll see to that."`
        : `He nods at the tin, not at you. "Fair. The annex taught me the difference between refusing an answer and not having one yet. I'll wait. The vault's patient. Hunger isn't."`;
    },
    get choices() {
      const back = state.flags.vault_sacrifice ? "act3_spine_next" : "lead_prompt";
      return [ { text: "Leave him to the trays.", next: back } ];
    }
  },

  // PRE: isAlive(elias) && !promises.elias | WRITES: choice flag + remember | DEATH: none | IMG: reuse
  prom_make_elias: {
    image: "images/elias.jpg",
    onEnter: () => {
      if (!isAlive("elias") || state.promises.elias) return "vault_voice";
    },
    get text() {
      let t = `Elias is at the Deck Four seal with a hand lamp, reading the frame the way other men read faces.`;
      if (state.flags.ship_memory) {
        t += `\n\n"Feedstock loop pushed back three fragments last night. Voice, partial. Manifest header, partial. It rebuilds what it digests. Nobody designed that. It does it anyway."`;
      } else {
        t += `\n\n"The ship keeps chewing on what Deck Four used to be. Some of it is coming back up. Records. Partials. Nobody designed that. It happens anyway."`;
      }
      t += `\n\nHe kills the lamp. "Four of my people are in that record. When it comes back, somebody decides who hears it first, and in what condition."

He looks at you once. That is the whole request.`;
      return t;
    },
    choices: [
      { text: `"If Deck Four comes back, you hear it from me first."`,
        flag: { prom_elias: true },
        remember: "You promised Elias first word if Deck Four comes back.",
        next: "prom_r_elias" },
      { text: "Say nothing.", next: "prom_r_elias" }
    ]
  },

  // PRE: entered from prom_make_elias only | WRITES: onEnter promises.elias (idempotent) | DEATH: none | IMG: reuse
  prom_r_elias: {
    image: "images/elias.jpg",
    onEnter: () => {
      if (!state.promises.elias) state.promises.elias = state.flags.prom_elias ? "made" : "declined";
    },
    get text() {
      if (!isAlive("elias")) return `The seal keeps its own watch.`;
      return state.promises.elias === "made"
        ? `"Noted." He re-shoulders the lamp. At the corridor junction he stops, not turning.

"First. Not first among the officers. First."

Then he's gone, at patrol pace, exactly.`
        : `"Understood." The lamp comes back on. He starts the seal check over from the top plate, which is not a thing the seal needs. You leave him to it.`;
    },
    choices: [ { text: "Leave him the corridor.", next: "vault_voice" } ]
  },

  // PRE: isAlive(sela) && !promises.sela | WRITES: choice flag + remember | DEATH: none | IMG: reuse
  prom_make_sela: {
    image: "images/quiet_sela.jpg",
    onEnter: () => {
      if (!isAlive("sela") || state.promises.sela) return "lead_prompt";
    },
    get text() {
      let t = `Sela is recalibrating the lamp, unhurried, each turn of the collar a full sentence of its own.

"I have been watching the crew watch the vault," she says. "They do not see embryos. They see the reason we ration, the reason we risk, the reason people have died. Fear needs a shape it can put hands on. I am the shape that is nearest."`;
      if (state.flags.sela_vault_vow === "accepted") {
        t += `\n\n"You have already promised not to spend authority to put me inside the vault's shelter. I am speaking now of the other direction. What authority does when the crowd wants someone put out."`;
      }
      t += `\n\nShe sets the lamp to yellow and does not look away from it. "I am not asking. I am informing you of the weather."`;
      return t;
    },
    choices: [
      { text: `"No one will use you as the price of their fear."`,
        flag: { prom_sela: true },
        remember: "You promised Sela no one would make her the price of their fear.",
        next: "prom_r_sela" },
      { text: `"I'll answer the crowd when the crowd asks."`,
        next: "prom_r_sela" }
    ]
  },

  // PRE: entered from prom_make_sela only | WRITES: onEnter promises.sela (idempotent) | DEATH: none | IMG: reuse
  prom_r_sela: {
    image: "images/quiet_sela.jpg",
    onEnter: () => {
      if (!state.promises.sela) state.promises.sela = state.flags.prom_sela ? "made" : "declined";
    },
    get text() {
      if (!isAlive("sela")) return `The lamp finishes its cycle alone.`;
      return state.promises.sela === "made"
        ? `For a moment she is twenty years old and has nowhere to put her hands. Then the moment is filed.

"I keep very few sentences. That one will be stored at temperature, with the seeds. I will know exactly where it is."`
        : `"I see. Thank you for the accurate forecast. I will pack accordingly."

She says it without heat and returns to the collar. One full turn. Another.`;
    },
    choices: [ { text: "Leave her the lamp's hour.", next: "lead_prompt" } ]
  },

  // PRE: isAlive(mira) && !promises.mira | WRITES: choice flag + remember | DEATH: none | IMG: reuse
  prom_make_mira: {
    image: "images/mira.jpg",
    onEnter: () => {
      if (!isAlive("mira") || state.promises.mira) return "pursuit_window";
    },
    text: () => `Mira has a maintenance panel open and a printout taped beside it, which for her is the equivalent of shouting.

"Junction eleven refused my override at 0413. Cited a directive written eight years before the cascade, by a committee that is now vapor. I complied, verified, re-ran it my way at 0446. My way held. Theirs was rated for a ship that no longer exists."

She taps the printout. "The ship keeps their signatures on file. Living engineers, it audits. Dead ones, it obeys. That is a fault, and I am naming both nouns: the ship, and the dead."`,
    choices: [
      { text: `"The living will decide what the future becomes."`,
        flag: { prom_mira: true },
        remember: "You promised Mira the living decide what the future becomes.",
        next: "prom_r_mira" },
      { text: `"The dead built her. They get a vote."`,
        next: "prom_r_mira" }
    ]
  },

  // PRE: entered from prom_make_mira only | WRITES: onEnter promises.mira (idempotent) | DEATH: none | IMG: reuse
  prom_r_mira: {
    image: "images/mira.jpg",
    onEnter: () => {
      if (!state.promises.mira) state.promises.mira = state.flags.prom_mira ? "made" : "declined";
    },
    get text() {
      if (!isAlive("mira")) return `The panel closes on schedule.`;
      return state.promises.mira === "made"
        ? `She unpins the printout, folds it once, precisely, and files it in her breast pocket like evidence.

"Logged. Time-stamped. I'll hold you to tolerance on that. Plus nothing, minus nothing. The dead get a memorial. They don't get a console."`
        : `"A vote." She weighs it like a part of unknown provenance. "Then I'll log the constituency: the living we can count on one console, and several billion dead. Noted for when the count matters."`;
    },
    choices: [ { text: "Leave her the panel.", next: "pursuit_window" } ]
  },

  // ═══════════════ B. POST-CRISIS TEST CHAIN ═══════════════
  // breath_after / custody_after → prom_vent → prom_deck4 → prom_line → prom_direct → faction_split

  // PRE: crisisPath breath && promises.amara made && isAlive(amara) && ladder(jiro→vess) | WRITES: onEnter prom_line_other | DEATH: none here | IMG: reuse
});
