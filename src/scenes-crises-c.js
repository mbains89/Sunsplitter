// Sunsplitter — scenes-crises-c.js
// Split from scenes-crises.js (0.28.1c size hygiene). Pure mechanical.
// Crises: act3_spine_next + Vess arrival/romance package.
// Pure data only. registerScenes merges this map.

const scenesCrisesC = {

  act3_spine_next: {
    image: "images/corridor.jpg",
    onEnter: () => {
      // 0.24: Vess arrival window opens once after vault face; guaranteed, no refuse-contact
      if (!state.recovered || !state.recovered.vess) return "vess_signal";
    },
    text: () => {
      let t = `The vault light stays on behind you. The ship has two men back who were written off, and a list of names that is no longer only numbers.`;
      if (state.recovered && state.recovered.vess) {
        t += `\n\nA third name is on the board now. The Dawnbreak survivor is still finding which bulkheads answer.`;
      }
      t += `\n\nThere is still work. There is still the fracture the private hours left in the corridor.`;
      // 0.27.2 Tomas allusion carrier — one-shot after make (bond return re-enters here)
      if (state.promises.tomas === "made" && isAlive("tomas") && !state.flags.prom_tomas_alluded) {
        t += `\n\nTomas finds you in the corridor on the way past. "Names first, then numbers. You put the order of mercy on record once. I count easier since."`;
        state.flags.prom_tomas_alluded = true;
      }
      return t;
    },
    get choices() {
      const opts = [];
      // 0.23.3: post-recovery bond reachability (early crew_walk could not offer Tomas/Jiro while missing)
      // One-shot: only if alive and not already bonded/skipped. Reuses existing bond_* scenes.
      if (isAlive("elias") && !hasMark("elias", "bonded") && !hasMark("elias", "bond_skipped")) {
        opts.push({ text: "Share a quiet hour with Elias — no orders.", next: "bond_elias", effects: { cohesion: 1 }, alive: "elias", tag: "bond" });
      }
      if (isAlive("tomas") && !hasMark("tomas", "bonded") && !hasMark("tomas", "bond_skipped")) {
        opts.push({ text: "Sit a low-stakes game with Tomas if he will play.", next: "bond_tomas", effects: { cohesion: 1 }, alive: "tomas", tag: "bond" });
      }
      // 0.28.1b: quiet_tomas was early-only while Tomas starts unrecovered — offer once post-recovery
      if (isAlive("tomas") && !state.flags.quiet_tomas_done) {
        opts.push({ text: "Sit with Tomas without asking for anything.", next: "quiet_tomas", effects: { cohesion: 3 }, affinity: { tomas: 10 }, alive: "tomas", tag: "bond" });
      }
      // 0.28.1b: Amara+Tomas private — intimacy_window can fire before Tomas recovery
      if (isAlive("amara") && isAlive("tomas") && !state.romance.amara_tomas && state.flags.hydro === "full") {
        opts.push({ text: "Walk in on Amara and Tomas — and decide whether to stay.", next: "romance_amara_tomas", aliveAll: ["amara", "tomas"], tag: "private" });
      }
      if (isAlive("jiro") && !hasMark("jiro", "bonded") && !hasMark("jiro", "bond_skipped")) {
        opts.push({ text: "Join Jiro on a competence hang at the star tracker.", next: "bond_jiro", effects: { cohesion: 1 }, alive: "jiro", tag: "bond" });
      }
      // 0.28: pair settle + warmth optional one-shots (gated)
      if (isAlive("elias") && !isAlive("mira") && attributableDeath("mira") && !state.flags.pair_shield) {
        opts.push({ text: "Elias is still at the board after the report.", next: "pair_shield_cold" });
      }
      if (isAlive("tomas") && isAlive("jiro") && !state.flags.tomas_scapegoated && !state.flags.pair_grudge) {
        opts.push({ text: "The sound of two people working carries from the trunk.", next: "pair_grudge_settle" });
      }
      if (isAlive("amara") && isAlive("sela") && stillFavoring("sela") && !state.flags.pair_favor) {
        opts.push({ text: "Hydroponics wants a quiet word.", next: "pair_favor_confront" });
      }
      if (isAlive("tomas") && !state.flags.warmth_meal) {
        opts.push({ text: state.flags.trays_dead ? "Follow the sound of the whole crew in one room." : "Follow the smell of green down-corridor.", next: "warmth_meal" });
      }
      if (["lena","elias","mira","tomas","amara","jiro","sela","vess"].filter(isAlive).length >= 2 && !state.flags.warmth_laughter) {
        opts.push({ text: "There's laughter around the spine bend. Stop before they see you.", next: "warmth_laughter" });
      }
      if (!state.flags.warmth_music) {
        opts.push({ text: "There's music coming from the empty berths.", next: "warmth_music" });
      }
      // Preserve pregnancy check if any romance occurred; then tomas_break is reachable
      // 0.24.2: Vess pregnancy gate keys on physical intimacy (vess_intimate), not offer acceptance
      const anyRomance = !!(state.romance.lena || state.romance.mira || state.romance.amara || state.romance.sela || state.flags.vess_intimate || state.romance.amara_tomas);
      if (anyRomance && state.flags.pregnancy_risk === undefined) {
        opts.push({ text: "Continue.", next: "pregnancy_check" });
      } else if (isAlive("tomas") && state.recovered && state.recovered.tomas) {
        opts.push({ text: "Continue.", next: "tomas_break" });
      } else {
        opts.push({ text: "Continue.", next: "act3_lethal_elias_order" });
      }
      return opts;
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // 0.24 — Vess Arrival + short asymmetric 5th romance
  // Structural asymmetry: informed run-reading offer, transmission currency,
  // power stays hers, fewer beats, one explicit sufficient. Not a fifth ladder.
  // ═══════════════════════════════════════════════════════════════

  vess_signal: {
    image: "images/vess_signal.jpg",
    onEnter: () => {},
    text: () => {
      let t = `The long-range board lights on a carrier that has lived in the noise floor for eleven months. `;
      if (isAlive("mira")) {
        t += `Mira's filters finally pull a clean string.`;
      } else {
        t += `The automatic filters finally pull a clean string.`;
      }
      t += `

Authentication request. Protocol three. Dawnbreak fragment. Sole survivor. Requesting docking authority.

The voice is flat, timestamped, log-trained — a woman who has been her own captain for six years.`;
      if (isAlive("mira")) {
        t += `\n\nMira does not look away from the board. "Relative velocity is matchable. Reaction-mass cost is not optional. The bus will have to run degraded to keep her relay core online. There is no second window on this heading."`;
      } else {
        t += `\n\nThe geometry is clear from the boards: matchable, but the reaction-mass reserve held for a late course option will be spent, and the environmental bus will run degraded to power her relay core. No second window.`;
      }
      if (isAlive("elias")) {
        t += `\n\n"Eleven months of listening," Elias says. "She already knows our hull ID. Decide whether that is a gift or a problem after she is aboard."`;
      }
      return t;
    },
    choices: [
      { text: "Prepare the intercept. Bring her in.", next: "vess_cost" }
    ]
  },

  vess_cost: {
    image: "images/vess_signal.jpg",
    onEnter: () => {
      state.flags.busDowngraded = true;
      state.flags.reaction_mass_spent = true;
      // Distinct from Jiro burn course_option_lost (0.24.2)
      state.flags.vess_course_lost = true;
      remember("Spent the last clean reaction-mass reserve to recover Vess from Dawnbreak.");
      remember("Environmental bus runs degraded for her relay core.");
    },
    text: () => `Matching the fragment costs the last clean reaction-mass reserve that was held back for a late course correction. The environmental bus is already being re-routed; lights will be dimmer on the outer ring and the air will cycle slower.

The window does not stay open by hesitation. There is no refuse-contact option that still leaves a second chance.

She is coming aboard.`,
    choices: [
      { text: "Dock the fragment.", next: "vess_boarding", effects: { supplies: -3, integrity: -1 } }
    ]
  },

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
      let t = `The fragment docks ugly — no working attitude thrusters, only a hard magnetic grab and a pressure equalize that makes the whole ring complain. The hatch opens on a tall, wiry figure in a suit patched by the same hands for six years. Long dark hair cut with a knife at the jawline. She looks at you too long, then not at all.

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
        else list = deadNamed.slice(0, 2).join(", ") + ", and others";
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
        { text: "Accept the offer. Power stays with her.", next: "vess_transmission", tag: "private", affinity: { vess: 6 }, trust: { vess: 4 } },
        { text: "Decline. Log it clean.", next: "act3_spine_next", mark: { vess: "declined" }, affinity: { vess: 1 } }
      ];
    }
  },

  vess_transmission: {
    image: "images/vess_signal.jpg",
    onEnter: () => {
      if (!isAlive("vess")) return "act3_spine_next";
      state.romance.vess = true;
    },
    text: () => {
      let t = `She does not celebrate the yes. She opens a second request the same way she opened the first — as procedure.

"There is one long-range window left on this bus before the degradation takes the high-gain permanently. I want it. One directed burst toward the Dawnbreak debris field, or the residual Earth noise if the geometry still favors it. After that the external contact lane is closed. The logs I kept for six years can live in your memory instead of only mine."

The currency is forward-looking and external. It is not Mira's archival lane. It is the last time this ship speaks outward.`;
      if (isAlive("mira")) {
        t += `\n\nMira, if she is listening on the secondary, does not interrupt. The board already shows the window count.`;
      }
      return t;
    },
    choices: [
      { text: "Give her the window. Last outward voice.", next: "vess_intimate", effects: { cohesion: 1 }, flag: { last_tx_spent: true }, affinity: { vess: 4 } },
      { text: "Keep the window for the ship. Her logs can wait.", next: "act3_spine_next", affinity: { vess: 2 }, trust: { vess: -2 } }
    ]
  },

  vess_intimate: {
    image: "images/vess_intimate.jpg",
    onEnter: () => {
      if (!isAlive("vess") || !state.romance.vess) return "act3_spine_next";
      state.flags.vess_intimate = true;
      remember("Shared the last long-range window and a private hour with Vess.");
    },
    text: () => {
      let t = `She does not wait for a second invitation. The door override is hers — she has been reading the ship's access tree since the beacon first resolved your hull. The underlayer comes off on her schedule. She is inexperienced with people and exact with survival; the difference is visible in the way she does not ask whether the light stays on.

Power stays with her. The pace is hers. When the flat voice finally cracks again it is not procedure. It is the first sound she has made in six years that was not logged for a dead crew.

Afterward she sits with her back against the bulkhead and looks at the observation blister the way someone looks at a map they already memorized.

"I will not ask again. The attempt either holds or it does not. I have the window. You have the record. That is the exchange."`;
      return t;
    },
    choices: [
      { text: "Let the hour end on her terms.", next: "act3_spine_next", affinity: { vess: 5 }, trust: { vess: 3 } }
    ]
  }
};

registerScenes(scenesCrisesC);
