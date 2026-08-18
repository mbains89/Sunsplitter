// Sunsplitter — scenes-16.js
// 0.28.2 size hygiene. Pure mechanical. crises: spine_next + vess_signal + cost
// Strict scene shape only: text | choices | onEnter | image
registerScenes({

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

});
