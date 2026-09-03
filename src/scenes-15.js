// Sunsplitter — scenes-15.js
// 0.29 Cascade Allusive: Jiro night shift + Tomas vault bolts
// Strict scene shape only: text | choices | onEnter | image
registerScenes({

  // ═══ SCENE GROUP DECLARATION ═════════════════════════════════════
  // SCENE_IDS: observation_nightshift, observation_nightshift_ask,
  //   observation_nightshift_leave
  // VERSION: 0.29        TICKET: Cascade Allusive 4/6
  // PACKAGE: Night Shift
  // SPINE: adjacent after act3_reckoning_briefing; exits to act3_lethal_lena_clock
  // PRECONDITIONS: isAlive("jiro"); one-shot inherited from briefing route
  // STATE WRITES: none; pure texture; future private hook remains cold
  // DEATH EXPOSURE: none
  // DEAD-SPEECH CHECK: every node redirects when !isAlive("jiro")
  // IMAGE: REUSE images/observation.jpg; NO ART_REQUEST
  // LANE RULE: no reference to Mira's change orders, ever
  // ═════════════════════════════════════════════════════════════════

  act3_reckoning_briefing: {
    image: "images/cascade_records.jpg",
    onEnter: () => {
      if (isAlive("lena")) state.flags.clock_known = true;
    },
    text: () => {
      let t = `Jiro briefs standing, charts spread, voice steadier than his hands.

"Position: confirmed to inside forty kilometers. Arrival window: opens day one hundred eighty-one, closes day one hundred eighty-four. Insertion: one corridor, one pass. That's what the burn bought, and that's what it cost.`;
      if (state.flags.margin_spent_extra) {
        t += ` The cycle we waited narrowed the corridor further. Still one pass. Thinner.`;
      }
      t += `"`;
      t += `\n\nThe room is quiet in a new way. For months every plan aboard has been built on fog. The fog is gone, and it turns out fog was doing some work: nobody can round anything off anymore.`;
      if (isAlive("lena")) {
        t += `\n\nLena breaks it, because of course she does. "He did my math while he was at it. I asked — don't make faces. Ninety to a hundred twenty cycles, and he refused to give me the kind number. First honest prognosis I've had that I didn't write myself."

"Insufficient data would have been a lie," Jiro says. "You had sufficient data."

Day one hundred eighty-one is on the board behind him. Nobody does the subtraction out loud.`;
      }
      if (isAlive("sela")) {
        t += `\n\n"We have traded a comfortable fog for an exact horizon," Sela says. "I prefer the horizon. I understand if others do not. They should say so to the horizon, not to Jiro."`;
      }
      return t;
    },
    choices: [
      { text: "Dismissed. Get some rest — that's an order that includes you, Jiro.", next: "observation_nightshift" }
    ]
  },

  observation_nightshift: {
    image: "images/observation.jpg",
    onEnter: () => { if (!isAlive("jiro")) return "act3_lethal_lena_clock"; },
    text: `Jiro has charts spread under the observation glass, working by less light than the work needs.\n\n"Alignment sims run at night. Still do. The sky picked the night shift once; I keep the shift out of superstition."\n\nHe squares a printout without looking up.\n\n"The burn we flew was computed nine weeks before the cascade. Contingency file. Somebody asked for it in June. Name is not in the header."`,
    choices: [
      { text: "Then ask. Out loud. Now.", next: "observation_nightshift_ask", alive: "jiro" },
      { text: "Let it lie.", next: "observation_nightshift_leave", alive: "jiro" }
    ]
  },

  observation_nightshift_ask: {
    image: "images/observation.jpg",
    onEnter: () => { if (!isAlive("jiro")) return "act3_lethal_lena_clock"; },
    text: `"Not tonight. Position I can give you to the meter. Cause is not my column."\n\nA beat.\n\n"Not tonight."`,
    choices: [ { text: "Return to the work.", next: "act3_lethal_lena_clock" } ]
  },

  observation_nightshift_leave: {
    image: "images/observation.jpg",
    onEnter: () => { if (!isAlive("jiro")) return "act3_lethal_lena_clock"; },
    text: `He rolls the chart. The tube of it makes a sound like a door that closes politely.`,
    choices: [ { text: "Return to the work.", next: "act3_lethal_lena_clock" } ]
  },

  // ═══════════════════════════════════════════════════════════════
  // Package C — "Vault needs a face"
  // ═══════════════════════════════════════════════════════════════

  // ═══ SCENE GROUP DECLARATION ═════════════════════════════════════
  // SCENE_IDS: hold_bolts, hold_bolts_again, hold_bolts_silent
  // VERSION: 0.29        TICKET: Cascade Allusive 3/6
  // PACKAGE: The Bolts
  // SPINE: adjacent after act3_vault_face / act3_vault_face_read;
  //   exits to act3_spine_next
  // PRECONDITIONS: isAlive("tomas"); one-shot inherited from vault-face route
  // STATE WRITES: none; pure texture
  // DEATH EXPOSURE: none
  // DEAD-SPEECH CHECK: every node redirects when !isAlive("tomas")
  // IMAGE: REUSE images/vault.jpg; NO ART_REQUEST
  // PHRASE: tier-four line remains reserved; do not place in text
  // ═════════════════════════════════════════════════════════════════

  act3_vault_face: {
    image: "images/vault.jpg",
    onEnter: () => { state.flags.vault_face = true; },
    text: () => {
      let t = `Third watch. You take the long way back. Two decks up the annex still smells of soil; down here the vault is odorless, and a light is on that shouldn't be.`;
      if (isAlive("sela")) {
        t += `\n\nSela is sitting with the manifest terminal, reading aloud to a room of frost and steel. She does not stop when you come in. She finishes the entry first.

"E-6103. Female. Donor pair deceased, Jakarta arcology. Name field completed at deposit: Noor."

She looks up. "Most of the name fields are empty. The parents left the naming to whoever will raise them. Some could not bear to choose. This pair could not bear not to." Her finger rests beside the line, not on it. "I read one entry aloud each day. There are fourteen thousand and six. I will not finish. That is not the point. The point is that each one I reach has been said once, out loud, by a living voice, inside the ship that carries her."`;
      } else if (isAlive("elias")) {
        t += `\n\nElias is at the manifest terminal. He doesn't startle, because he heard you thirty meters ago.

"Started at one," he says. "E-0001 through E-0214 so far. One a shift." He turns the tablet so you can see today's line. "This one has a name filled in. E-6103 — I skipped ahead once, to check if any did. Noor. Jakarta. Parents dead."

He sets the tablet down flat. "I count exits. My whole life. These don't have any yet. Somebody should still be counting them."`;
      } else {
        t += `\n\nThe terminal is dark and no one is here to read it, so you read it yourself, for the first time — the manifest, entry by entry, fourteen thousand and six lines of the argument the vault has never once made out loud.

Most of the name fields are empty. At E-6103 one isn't. Female. Donor pair deceased, Jakarta arcology. Name field completed at deposit: Noor. Two people on a dying planet filled in a form for a person who does not exist yet, and could not bear to leave that line blank.

You say it out loud, once, to the frost. It is the first name anyone has spoken in this room.`;
      }
      return t;
    },
    get choices() {
      const opts = [];
      if (isAlive("sela") || isAlive("elias")) {
        opts.push({ text: "Read the next one.", next: "act3_vault_face_read" });
      }
      opts.push({ text: "Stay until the entry's done, then go quietly.", next: "hold_bolts" });
      opts.push({ text: "Leave the light on behind you.", next: "hold_bolts" });
      return opts;
    }
  },

  act3_vault_face_read: {
    image: "images/vault.jpg",
    onEnter: () => { state.flags.vault_face_read = true; },
    text: () => {
      let t = `You read the next line. E-6104. Male. Donor pair deceased. The name field is empty, so you read the emptiness too, the way you'd log a silence on a comm check.`;
      if (isAlive("sela")) {
        t += `\n\nSela does not thank you. She moves her finger down to the following entry and waits — the way people wait for a thing they expect to continue. Tomorrow's line is yours now, if you want it. She will not ask. She has already spent the words.`;
      } else if (isAlive("elias")) {
        t += `\n\nElias slides the tablet the rest of the way over and doesn't watch you read it. He watches the vault. When you finish he takes the tablet back and marks the count forward by one, in his own column, next to yours.`;
      }
      return t;
    },
    choices: [
      { text: "Back to the watch.", next: "hold_bolts" }
    ]
  },

  hold_bolts: {
    image: "images/vault.jpg",
    onEnter: () => { if (!isAlive("tomas")) return "act3_spine_next"; },
    text: `Tomas is torquing the vault's deck bolts. They do not need it. He does it anyway, on a schedule only he keeps.\n\n"I bolted this down myself. Mass margin said the vault or the second printer. The vault does not eat. We do."\n\nHe tips his slate: the load-out deviation, his signature at the bottom of it.\n\n"Somebody signed that trade, and it was me."`,
    choices: [
      { text: "You'd sign it again?", next: "hold_bolts_again", alive: "tomas" },
      { text: "Say nothing.", next: "hold_bolts_silent", alive: "tomas" }
    ]
  },

  hold_bolts_again: {
    image: "images/vault.jpg",
    onEnter: () => { if (!isAlive("tomas")) return "act3_spine_next"; },
    text: `"Ask me on a day the trays are full. You will get a cleaner answer, and it will be worth less."`,
    choices: [ { text: "Return to the watch.", next: "act3_spine_next" } ]
  },

  hold_bolts_silent: {
    image: "images/vault.jpg",
    onEnter: () => { if (!isAlive("tomas")) return "act3_spine_next"; },
    text: `"Check the torque yourself if you want. The bolts hold. That was never the question."`,
    choices: [ { text: "Return to the watch.", next: "act3_spine_next" } ]
  },

  // Spine after vault face → Vess window (0.24) then tomas_break / pregnancy / faction
});
