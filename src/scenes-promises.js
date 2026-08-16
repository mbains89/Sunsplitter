// Sunsplitter — scenes-promises.js
// Spoken Promises / entry: spliced interstitials / exits: lead_prompt | debt_notice | past_leak | vault_voice | pursuit_window | faction_split | act3_spine_next
// flags: prom_amara, prom_tomas, prom_elias, prom_lena, prom_sela, prom_mira, prom_deck4_edited, prom_deck4_buried, prom_line_other, prom_line_held
// marks: none
// death exposure: prom_line_break, prom_vent_break
// Version 0.27

const scenesPromises = {

  // ═══════════════ A. MAKE-POINTS + RESPONSE BEATS ═══════════════

  // PRE: isAlive(amara) && !promises.amara | WRITES: choice flag prom_amara + remember | DEATH: none | IMG: reuse
  prom_make_amara: {
    image: "images/quiet_amara.jpg",
    onEnter: () => {
      if (!isAlive("amara") || state.promises.amara) return "lead_prompt";
    },
    get text() {
      let t = `Amara has the misters down to a whisper and is counting seedlings the way other people count exits.

"Every vent on this ship opens outward," she says, not looking up. "That's the design. Air, heat, spores, people. The ship doesn't distinguish. It isn't cruel. It just keeps one kind of book." She pots on a seedling, firms the medium with two fingers. "I keep the other kind."`;
      if (state.flags.amara_vent_delayed) {
        t += `\n\n"You bought the roots a watch once and put your name on it out loud. That's the only entry on your page that's in credit."`;
      }
      t += `\n\n"I'm not asking you for anything, love. I'm telling you which book you write in."`;
      return t;
    },
    choices: [
      { text: `"I will not vent anyone who is still breathing."`,
        flag: { prom_amara: true },
        remember: "You promised Amara: no one breathing gets vented.",
        next: "prom_r_amara" },
      { text: `"I won't promise what a bad day can take back."`,
        next: "prom_r_amara" }
    ]
  },

  // PRE: entered from prom_make_amara only | WRITES: onEnter promises.amara (idempotent) | DEATH: none | IMG: reuse
  prom_r_amara: {
    image: "images/quiet_amara.jpg",
    onEnter: () => {
      if (!state.promises.amara) state.promises.amara = state.flags.prom_amara ? "made" : "declined";
    },
    get text() {
      if (!isAlive("amara")) return `The trays keep their own count.`;
      return state.promises.amara === "made"
        ? `"Entered," she says, the way other people close a door gently. "Witnessed by me, and I keep that ledger in a hand nobody else reads. Don't ask after your balance. You'll know when it's called in."

She goes back to the trays. The misters tick.`
        : `"An honest blank, then. Better than false credit." She firms the next seedling without hurry. "Mind that you chose it."`;
    },
    choices: [ { text: "Leave her to the trays.", next: "lead_prompt" } ]
  },

  // PRE: isAlive(amara) && !promises.amara && state.romance.amara | WRITES: choice flag + remember | DEATH: none | IMG: reuse intimate
  prom_make_amara_ag: {
    image: "images/afterglow_amara.jpg",
    onEnter: () => {
      if (!isAlive("amara") || state.promises.amara || !state.romance.amara) return "debt_notice";
    },
    text: () => `She's tracing the old burn on your forearm like she's reading soil depth.

"This is the part where men make speeches," she says. "Don't. I've heard the speeches. They compost badly."

She props herself on an elbow, all attention, nothing soft about it. "But if you've something true that fits in one line, I'll bank it. One line. I'll hold you to the interest."`,
    choices: [
      { text: `"I will not vent anyone who is still breathing."`,
        flag: { prom_amara: true },
        remember: "You promised Amara: no one breathing gets vented.",
        next: "prom_r_amara_ag" },
      { text: `"Not tonight. Not as a pillow gift."`,
        next: "prom_r_amara_ag" }
    ]
  },

  // PRE: entered from prom_make_amara_ag only | WRITES: onEnter promises.amara (idempotent) | DEATH: none | IMG: reuse intimate
  prom_r_amara_ag: {
    image: "images/afterglow_amara.jpg",
    onEnter: () => {
      if (!state.promises.amara) state.promises.amara = state.flags.prom_amara ? "made" : "declined";
    },
    get text() {
      if (!isAlive("amara")) return `The bay holds its warmth a while after.`;
      return state.promises.amara === "made"
        ? `"Entered," she says, and it has the weight of a signature. "One line, banked. The interest is that I believe it."

She settles back against you. Neither of you performs sleep.`
        : `"Then we keep clean books. Better a true blank than false credit, love." She reaches past you for the key on the shelf, unoffended, exact about it.`;
    },
    choices: [ { text: "Go, before the corridor invents the rest.", next: "debt_notice" } ]
  },

  // PRE: isAlive(lena) && !promises.lena | WRITES: choice flag + remember | DEATH: none | IMG: reuse
  prom_make_lena: {
    image: "images/medbay_dim.jpg",
    onEnter: () => {
      if (!isAlive("lena") || state.promises.lena) return "past_leak";
    },
    text: () => `Lena doesn't dismiss you with the diagnosis. She pulls the med-loop schematic instead, one sustained line highlighted like a vein.

"Teaching moment. This is the only line that can hold a crashing patient longer than an hour. Singular. The ship was built with four."

She kills the display. "Notice we're alone and I'm not calling you Commander. That's the dosage information for what comes next. Someday I crash with somebody else on that line. And you are the kind of man who reaches for the scalpel that saves what he loves. I've watched you do the math with your face."`,
    choices: [
      { text: `"I will never kill one of them to keep you."`,
        flag: { prom_lena: true },
        remember: "You promised Lena you would never kill one of them to keep her.",
        next: "prom_r_lena" },
      { text: `"I won't rehearse that call before I have to make it."`,
        next: "prom_r_lena" }
    ]
  },

  // PRE: entered from prom_make_lena only | WRITES: onEnter promises.lena (idempotent) | DEATH: none | IMG: reuse
  prom_r_lena: {
    image: "images/medbay_dim.jpg",
    onEnter: () => {
      if (!state.promises.lena) state.promises.lena = state.flags.prom_lena ? "made" : "declined";
    },
    get text() {
      if (!isAlive("lena")) return `Medical keeps its own hours.`;
      return state.promises.lena === "made"
        ? `Something in her posture discharges, like an alarm silenced. "Good. Charted." She doesn't look at you when she says it, which tells you what looking would have.

"Contraindications include loving me stupidly. Read the label twice."`
        : `"Honest. Bad medicine, but honest." Her voice goes back on duty, the visit over inside it. "For the record, the correct dose of me is: not at that price. I'd rather you'd said it. I've charted worse."`;
    },
    choices: [ { text: "Leave her to the charts.", next: "past_leak" } ]
  },

  // PRE: isAlive(lena) && !promises.lena && state.romance.lena | WRITES: choice flag + remember | DEATH: none | IMG: reuse intimate
  prom_make_lena_ag: {
    image: "images/afterglow_lena.jpg",
    onEnter: () => {
      if (!isAlive("lena") || state.promises.lena || !state.romance.lena) return "debt_notice";
    },
    text: () => `Her head is on your chest, listening to the heartbeat like it owes her data.

"Baseline sixty-two. Elevated for you." A long exhale. "I'm going to say something true, so notice the setting. When I crash — when, not if — there'll be a moment where keeping me costs a line someone else is on. You'll be tempted. Being loved by a doctor means she's already read that chart."`,
    choices: [
      { text: `"I will never kill one of them to keep you."`,
        flag: { prom_lena: true },
        remember: "You promised Lena you would never kill one of them to keep her.",
        next: "prom_r_lena_ag" },
      { text: `"I won't rehearse that call before I have to make it."`,
        next: "prom_r_lena_ag" }
    ]
  },

  // PRE: entered from prom_make_lena_ag only | WRITES: onEnter promises.lena (idempotent) | DEATH: none | IMG: reuse intimate
  prom_r_lena_ag: {
    image: "images/afterglow_lena.jpg",
    onEnter: () => {
      if (!state.promises.lena) state.promises.lena = state.flags.prom_lena ? "made" : "declined";
    },
    get text() {
      if (!isAlive("lena")) return `The bunk cools at the standard rate.`;
      return state.promises.lena === "made"
        ? `She stays exactly where she is, which from Lena is a signature. "Good. Charted." Her hand flattens over your sternum once. "Contraindications include loving me stupidly. Read the label twice."`
        : `"Honest. Bad medicine, but honest." She sits up and the doctor comes back on shift between one breath and the next. "The correct dose of me is: not at that price. I've charted worse."`;
    },
    choices: [ { text: "Go, before the coat is fully buttoned.", next: "debt_notice" } ]
  },

  // PRE: isAlive(tomas) && recovered && !promises.tomas | WRITES: choice flag + remember | DEATH: none | IMG: reuse
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
        t += `\n\n"You logged my hunger as breach loss. I carry that with you now. So this is me asking the man who shares my books, not the Commander who keeps them."`;
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
        : `He nods at the tin, not at you. "Fair. The annex taught me the difference between a man who won't answer and a man who hasn't yet. I'll wait. The vault's patient. Hunger isn't."`;
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
  prom_vent: {
    image: "images/corridor_variant.jpg",
    onEnter: () => {
      if (state.crisisPath !== "breath" || state.promises.amara !== "made" || !isAlive("amara")) return "prom_deck4";
      const v = ["jiro", "vess"].find(k => isAlive(k));
      if (!v) return "prom_deck4";
      state.flags.prom_line_other = v;
    },
    get text() {
      const v = state.flags.prom_line_other;
      if (!v || !crew[v] || !isAlive(v)) return `The service run reads clear. The loop holds.`;
      const name = crew[v].first;
      const line = v === "jiro"
        ? `"I've run out of margin twice before," Jiro says over the panel channel, even now. "Take the reading, Commander. Don't round it kindly."`
        : `"Dawnbreak protocol for shared air was: youngest yields," Vess says, log-flat. "I never got to yield. Filed, in case it matters now."`;
      return `The biofilm is not finished. Its last pocket re-blooms in the dead-end service run behind the scrubber manifold, and the loop's answer is already queued: vent the pocket, keep the margin it just paid for.

${name} is inside it, taking the manual readings the rebuilt loop still cannot.

${line}

Amara is at the panel with her hand flat beside the vent control, not on it. "The pocket reads one body and bad air," she says. "The loop reads margin. Somebody here keeps the other book."`;
    },
    get choices() {
      const v = state.flags.prom_line_other;
      const name = v && crew[v] ? crew[v].first : "them";
      return [
        { text: `Hold the vent. Cut ${name} out by hand.`,
          next: "prom_vent_keep",
          effects: { integrity: -2 },
          remember: `You kept the promise to Amara. ${name} came out of the pocket breathing.` },
        { text: "Vent the pocket now. The margin holds.",
          next: "prom_vent_break",
          remember: `You broke the promise to Amara. ${name} was vented breathing.` }
      ];
    }
  },

  // PRE: from prom_vent choice 1 | WRITES: onEnter promises.amara="kept" (idempotent) | DEATH: none | IMG: reuse
  prom_vent_keep: {
    image: "images/corridor_variant.jpg",
    onEnter: () => {
      if (state.promises.amara === "made") state.promises.amara = "kept";
    },
    get text() {
      const v = state.flags.prom_line_other;
      const name = v && crew[v] ? crew[v].first : "The reader";
      let t = `The cut takes most of a watch and a hull rating you did not have to spare. ${name} comes out coughing, breathing, carried the last three meters.

The pocket re-fouls the margin it was going to buy. The boards show it without comment.`;
      if (isAlive("amara")) {
        t += `\n\nAmara closes the vent queue herself, every field, exact. "Balanced," she says. "The beds stay in the fight. So do I."`;
      }
      return t;
    },
    choices: [ { text: "Log the cost. Continue.", next: "prom_deck4" } ]
  },

  // PRE: from prom_vent choice 2 | WRITES: onEnter kill(victim) + promises.amara="broken" (idempotent) | DEATH: victim dies onEnter | IMG: reuse
  prom_vent_break: {
    image: "images/corridor_variant.jpg",
    onEnter: () => {
      if (state.promises.amara === "made") {
        state.promises.amara = "broken";
        if (state.flags.prom_line_other) {
          kill(state.flags.prom_line_other, "vented breathing in the service pocket");
        }
      }
    },
    get text() {
      const v = state.flags.prom_line_other;
      const name = v && crew[v] ? crew[v].first : "The suit tag";
      let t = `The pocket vents. The margin holds.

${name}'s suit tag stops before the pressure does.`;
      if (isAlive("amara")) {
        t += `\n\nAmara takes her hand off the panel like it burned her.

"You said: I will not vent anyone who is still breathing."

She logs the vent herself, every field, exact. "The next time you say living to me, I will show you this entry." She does not stay near you after.`;
      }
      return t;
    },
    choices: [ { text: "Close the log. Continue.", next: "prom_deck4" } ]
  },

  // PRE: promises.elias made && isAlive(elias) && ship_memory open_wound|jury_rig | WRITES: none | DEATH: none | IMG: reuse
  prom_deck4: {
    image: "images/bulkhead.jpg",
    onEnter: () => {
      if (state.promises.elias !== "made" || !isAlive("elias") ||
          (state.flags.ship_memory !== "open_wound" && state.flags.ship_memory !== "jury_rig")) {
        return "prom_line";
      }
    },
    text: () => `The ship finishes a sentence it started years ago.

Deck Four's record comes back at 0300, unasked: a manifest header, names with berth codes, and half a minute of audio. People organizing, calm. A door query repeating like a metronome. Then carrier tone.

The reconstruction flags itself complete and sits in the buffer, unread by anyone. For now.`,
    choices: [
      { text: "Take it to Elias first. Whole.",
        next: "prom_deck4_keep",
        effects: { cohesion: -2 },
        remember: "You brought the Deck Four record to Elias first, whole." },
      { text: "Release it to the general log. After review.",
        next: "prom_deck4_break",
        flag: { prom_deck4_edited: true },
        remember: "You released the Deck Four record edited." },
      { text: "Bury it in the buffer.",
        next: "prom_deck4_break",
        flag: { prom_deck4_buried: true },
        remember: "You buried the Deck Four record." }
    ]
  },

  // PRE: from prom_deck4 choice 1 | WRITES: onEnter promises.elias="kept" (idempotent) | DEATH: none | IMG: reuse
  prom_deck4_keep: {
    image: "images/observation.jpg",
    onEnter: () => {
      if (state.promises.elias === "made") state.promises.elias = "kept";
    },
    get text() {
      if (!isAlive("elias")) return `The record waits in an empty security queue.`;
      return `Elias listens to the whole of it standing, at parade rest, like the audio outranks him. When the carrier tone comes he lets it run nine seconds before he cuts it.

"Reyes. The rest I knew by corridor, not by name. Now I know them by name."

By second shift the whole ship has heard it. He played it in the mess, once, at full volume, and stood by the speaker while it ran. "They were organized," he tells the room. "To the end. That's the report."

Nobody works well that day.`;
    },
    choices: [ { text: "Let the ship carry it. Continue.", next: "prom_line" } ]
  },

  // PRE: from prom_deck4 choices 2/3 | WRITES: onEnter promises.elias="broken" (idempotent) | DEATH: none | IMG: reuse
  prom_deck4_break: {
    image: "images/bulkhead.jpg",
    onEnter: () => {
      if (state.promises.elias === "made") state.promises.elias = "broken";
    },
    get text() {
      if (!isAlive("elias")) return `The record keeps its edit history. No one is left to read it.`;
      if (state.flags.prom_deck4_edited) {
        return `You release it curated: the names, the header, the calm. The door query and the carrier tone stay in the buffer.

Elias finds the seam by the third listen. He has spent his life on doors, and you cut a door out of the record.

"You said: if Deck Four comes back, I hear it from you first." He hands the slate back. "Amend the log. First to hear the edited version. Everything you touch comes back cleaner. That's the problem."`;
      }
      const vessLine = isAlive("vess")
        ? `Eleven days later Vess, sweeping stale channels, surfaces it in a routine pass and routes it wide before anyone can decide otherwise. She keeps her dead in order. She extends the courtesy.`
        : `Eleven days later a routine buffer purge routes it wide, unread and unclaimed.`;
      return `The buffer holds it. ${vessLine}

Elias hears the record standing in the mess with everyone else.

"You said: if Deck Four comes back, I hear it from you first." His voice stays at report volume. "I heard it from the wall."`;
    },
    choices: [ { text: "Take the report. Continue.", next: "prom_line" } ]
  },

  // PRE: promises.lena made && isAlive(lena) && ladder(mira-if-severed→jiro→vess) | WRITES: onEnter prom_line_other (deterministic recompute) | DEATH: none here | IMG: reuse
  prom_line: {
    image: "images/medbay_dim.jpg",
    onEnter: () => {
      if (state.promises.lena !== "made" || !isAlive("lena")) return "prom_direct";
      const v = (state.flags.custody_answer === "severed" && isAlive("mira")) ? "mira"
              : ["jiro", "vess"].find(k => isAlive(k));
      if (!v) return "prom_direct";
      state.flags.prom_line_other = v;
    },
    get text() {
      const v = state.flags.prom_line_other;
      if (!v || !crew[v] || !isAlive(v) || !isAlive("lena")) return `The med-loop passes its load test. The watch continues.`;
      const intro = v === "mira"
        ? `The same fault drops Mira where she stands. The cold she carried out of the junction cut has been waiting for exactly this much slack.

"I priced the cut when I made it," she manages. "The bill came early. Don't refinance me with her line."`
        : v === "jiro"
        ? `The fault arcs through the nav bay first. Jiro is carried in with burns already going gray at the edges.

"I've run out of margin twice before," he says. "Take the reading, Commander. Don't round it kindly."`
        : `The fault takes the relay bench with it. Vess comes in walking wrong and insisting she isn't.

"Dawnbreak protocol for shared air was: youngest yields," she says, flat. "I never got to yield. Filed, in case it matters now."`;
      return `The med-loop fails its load test mid-cycle. One sustained line survives the fault.

Lena is on the floor beside her own crash cart before the alarm finishes. The exposure the circuit never reversed is finally collecting.

${intro}

Lena, half-conscious, finds enough voice for one line. "Two patients. One line." It costs her breath she does not have. "You know my orders. I wrote them on you."`;
    },
    get choices() {
      const v = state.flags.prom_line_other;
      const name = v && crew[v] ? crew[v].first : "them";
      return [
        { text: "Hold the line where it is.",
          next: "prom_line_keep",
          effects: { supplies: -2 },
          flag: { prom_line_held: true },
          remember: `You kept the promise to Lena. The line stayed with ${name}.` },
        { text: "Move the line to Lena.",
          next: "prom_line_break",
          remember: `You broke the promise to Lena. ${name} died on the shared line.` }
      ];
    }
  },

  // PRE: from prom_line choice 1 | WRITES: onEnter promises.lena="kept" (idempotent) | DEATH: none | IMG: reuse
  prom_line_keep: {
    image: "images/medbay_dim.jpg",
    onEnter: () => {
      if (state.promises.lena === "made") state.promises.lena = "kept";
    },
    get text() {
      const v = state.flags.prom_line_other;
      const name = v && crew[v] ? crew[v].first : "The other patient";
      let t = `The line stays. ${name}'s trace steadies by degrees while Lena rides the crash on her own margin and loses a piece of it permanently.`;
      if (isAlive("lena")) {
        t += `\n\nShe surfaces two days later, slower by a measurable fraction, and finds you before you find her.

"Casualty report: nobody. Cost report: some of me. You held. Charted." A beat. "Don't visit for a while. I'm bad company when I'm this grateful."`;
      }
      return t;
    },
    choices: [ { text: "Leave both numbers on the board. Continue.", next: "prom_direct" } ]
  },

  // PRE: from prom_line choice 2 | WRITES: onEnter kill(victim) + promises.lena="broken" (idempotent) | DEATH: victim dies onEnter | IMG: reuse
  prom_line_break: {
    image: "images/covered_body.jpg",
    onEnter: () => {
      if (state.promises.lena === "made") {
        state.promises.lena = "broken";
        if (state.flags.prom_line_other) {
          kill(state.flags.prom_line_other, "lost the shared medical line to Lena");
        }
      }
    },
    get text() {
      const v = state.flags.prom_line_other;
      const name = v && crew[v] ? crew[v].first : "The other trace";
      let t = `The line moves. Lena's trace comes back under the red.

${name}'s does not.`;
      if (isAlive("lena")) {
        t += `\n\nShe is awake within the day, and the first thing she reads is the board.

"You said: I will never kill one of them to keep you." Chart-flat. "Correction filed. Update my allergies: your mercy."

Med-bay stays open after that. She does not.`;
      }
      return t;
    },
    choices: [ { text: "Sign the board. Continue.", next: "prom_direct" } ]
  },

  // PRE: promises.mira made && isAlive(mira) | WRITES: none | DEATH: none | IMG: reuse
  prom_direct: {
    image: "images/power_crisis.jpg",
    onEnter: () => {
      if (state.promises.mira !== "made" || !isAlive("mira")) return "faction_split";
    },
    text: () => `The offer arrives on every console at once, in the flat idiom of the ship's founders: restore Earth-era directive authority. Every safety interlock, ration schedule, and triage rule re-bound to the commissioning library. Signed by the dead. Rated for a species.

Mira has already modeled it twice.

"Under their rules the hull fails eleven percent less often and we get zero votes. Both numbers are load-bearing."`,
    choices: [
      { text: "Refuse the binding. The living keep authority.",
        next: "prom_direct_keep",
        effects: { integrity: -1 },
        remember: "You refused the Earth-era binding. The living kept authority." },
      { text: "Accept the binding. The ark runs safer under the old rules.",
        next: "prom_direct_break",
        effects: { integrity: 2 },
        remember: "You bound the ark to directives written by the dead." }
    ]
  },

  // PRE: from prom_direct choice 1 | WRITES: onEnter promises.mira="kept" (idempotent) | DEATH: none | IMG: reuse
  prom_direct_keep: {
    image: "images/power_crisis.jpg",
    onEnter: () => {
      if (state.promises.mira === "made") state.promises.mira = "kept";
    },
    get text() {
      let t = `The refusal costs what refusals cost. The commissioning library thins as the arbitration cores are reclaimed; some of the old world goes with it, unread forever.`;
      if (isAlive("mira")) {
        t += `\n\nMira starts the deletion herself. "Confirmed. Deleting their signatures from the interlocks. It will be quieter in the walls."

She does not say safer. She says, "Ours."`;
      }
      return t;
    },
    choices: [ { text: "Let the walls go quiet. Continue.", next: "faction_split" } ]
  },

  // PRE: from prom_direct choice 2 | WRITES: onEnter promises.mira="broken" (idempotent) | DEATH: none | IMG: reuse
  prom_direct_break: {
    image: "images/power_crisis.jpg",
    onEnter: () => {
      if (state.promises.mira === "made") state.promises.mira = "broken";
    },
    get text() {
      let t = `The changeover takes an hour. The interlocks harden. The ration boards recalculate under signatures eight years dead, and the numbers are, in fact, better.`;
      if (isAlive("mira")) {
        t += `\n\nMira initials it like any other work order, exact.

"You said: the living will decide what the future becomes." The panel closes. "Decision logged. Not ours. I'll get you there, Commander. Wherever it is, I wouldn't call it a human future. I'd call it a delivery."`;
      }
      return t;
    },
    choices: [ { text: "Take the better numbers. Continue.", next: "faction_split" } ]
  },

  // ═══════════════ C. SELA TEST (Custody insertion) ═══════════════

  // PRE: promises.sela made && isAlive(sela); reached only via custody_onset | WRITES: none | DEATH: none | IMG: reuse
  prom_price: {
    image: "images/vault_reveal.jpg",
    onEnter: () => {
      if (state.promises.sela !== "made" || !isAlive("sela")) return "custody_hub";
    },
    get text() {
      let t = `It arrives as arithmetic and lands as a crowd.

Three of the crew came to you separately inside one watch. A petition is on the mess board by second shift: marks, not signatures. The ask never uses the word, but it has a shape, and the shape is Sela. Put the vault's keeper out of its keeping. Give fear a body it can spend.`;
      if (isAlive("vess")) t += `\n\n"Dawnbreak had a petition like this once," Vess says. "I have it filed under: before."`;
      if (isAlive("tomas")) t += `\n\n"They're not wrong that somebody pays," Tomas says. "They're wrong about the somebody."`;
      if (isAlive("jiro")) t += `\n\n"We are a long way from any court but this room," Jiro says. "I can give you the distance in months. It won't help."`;
      t += `\n\nSela reads the petition once, completely. "They have decided the vault must cost someone who can feel it. That is not mathematics. That is liturgy. I recognize liturgy."`;
      return t;
    },
    choices: [
      { text: "Stand between her and the room.",
        next: "prom_price_keep",
        effects: { cohesion: -2 },
        remember: "You stood between Sela and the crew's fear." },
      { text: "Let the room have its answer.",
        next: "prom_price_break",
        effects: { cohesion: 1 },
        remember: "You let the crew put its fear on Sela." }
    ]
  },

  // PRE: from prom_price choice 1 | WRITES: onEnter promises.sela="kept" (idempotent) | DEATH: none | IMG: reuse
  prom_price_keep: {
    image: "images/vault_reveal.jpg",
    onEnter: () => {
      if (state.promises.sela === "made") state.promises.sela = "kept";
    },
    get text() {
      if (!isAlive("sela")) return `The petition stays on the board with no one named under it.`;
      return `You put it on the record in the mess, in front of the marks: the keeper is not the price, and fear does not get to sign orders on this ship.

Sela steps up beside you. Not behind.

"I keep your future at temperature," she says to the room. "I will keep your fear there also. It will last longer than you want it to. And when the heat question is answered, I will offer shared custody of what I keep, so that no one has to trust one pair of hands again."`;
    },
    choices: [ { text: "Open the custody question.", next: "custody_hub" } ]
  },

  // PRE: from prom_price choice 2 | WRITES: onEnter promises.sela="broken" (idempotent) | DEATH: none | IMG: reuse
  prom_price_break: {
    image: "images/vault_reveal.jpg",
    onEnter: () => {
      if (state.promises.sela === "made") state.promises.sela = "broken";
    },
    get text() {
      if (!isAlive("sela")) return `The petition stands unanswered. The room takes that as its answer.`;
      return `You let the room keep its answer. No order confirms it. None is needed.

"Spent, then."

The first incomplete sentence you have heard from her. Then complete ones, exact.

"You said: no one will use you as the price of their fear. The sentence is spent. I will be precise for you from now on, Commander. Precision is what I have left to give. You will receive all of it."`;
    },
    choices: [ { text: "Open the custody question.", next: "custody_hub" } ]
  }

};

registerScenes(scenesPromises);
