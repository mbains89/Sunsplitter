// Sunsplitter — scenes-43.js
// 0.28.1c size hygiene. Pure mechanical. promises: make/r amara + lena
// Strict scene shape only: text | choices | onEnter | image
registerScenes({

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

"This is the part where you're meant to make a speech," she says. "Don't. I've heard the speeches. They compost badly."

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

She kills the display. "Notice we're alone and I'm not calling you Commander. That's the dosage information for what comes next. Someday I crash with somebody else on that line. And you reach for the scalpel that saves what you love. I've watched you do the math with your face."`,
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
});
