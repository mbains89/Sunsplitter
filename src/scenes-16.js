// Sunsplitter — scenes-16.js
// 0.28.1c size hygiene. Pure mechanical. crises: spine_next + vess_signal + cost
// Strict scene shape only: text | choices | onEnter | image

// SUN-HUB-RESUME-01: the Tomas allusion is due while his promise is made, he lives and the line is
// unspent. Text and choices read only this saved state, so Continue prints exactly what the live
// visit printed: the visit that shows the line keeps it on resume, and a return never replays it.
function act3SpineTomasAllusionDue() {
  return state.promises.tomas === "made" && isAlive("tomas") && !state.flags.prom_tomas_alluded;
}

registerScenes({

  // PRE: post-vault spine, Vess recovered, living Tomas with made unalluded promise | WRITES: none on entry;
  //   on the visit that shows the Tomas allusion, every exit spends it (choice flag prom_tomas_alluded)
  // DEATH: none | DEAD SPEECH/APPEARANCE: Tomas prose/options are living-gated | IMAGE: roster-neutral corridor_variant_2; distinct from immediate warmth returns
  // SUN-DIET-HUB-01: the corridor paragraph prints on the first visit of a run; a return prints one
  // roster-neutral line instead. The Tomas allusion still fires on whichever visit consumes it.
  act3_spine_next: {
    image: "images/corridor_variant_2.jpg",
    onEnter: () => {
      // 0.24: Vess arrival window opens once after vault face; guaranteed, no refuse-contact
      if ((!state.recovered || !state.recovered.vess) && !state.dead.includes("vess")) return "vess_signal";
    },
    text: () => {
      // SUN-DIET-HUB-01: a return is read from existing state, never written here. Each key below is
      // spent only by an offer this hub makes after the vault: the warmth, favor and crew-friction pair
      // scenes are offered nowhere else, and the Tomas, Jiro and Amara-Tomas offers elsewhere need a
      // recovered Tomas or Jiro, which the opening walk and the private hours never have. Elias's hour
      // is left out because the opening walk can spend it; a return that spent none of these shows the
      // paragraph again, which errs toward the old text, never toward hiding the first visit. Telling
      // that return apart needs a visit record the state does not keep (L-061, unruled).
      // SUN-HUB-REPEAT-01: one count per offer, so `spent` is the number of this hub's own offers the
      // run has taken; with Elias's hour added it rises by one on every return the hub can tell apart.
      const f = state.flags;
      const spent = [f.warmth_meal, f.warmth_laughter, f.warmth_music, f.pair_favor, f.pair_grudge,
        f.pair_seal, f.pair_burn, f.pair_fix, f.quiet_tomas_done,
        state.romance.amara_tomas || hasMark("amara", "privacy_left") || hasMark("amara", "interrupted"),
        hasMark("tomas", "bonded") || hasMark("tomas", "bond_skipped"),
        hasMark("jiro", "bonded") || hasMark("jiro", "bond_skipped")].filter(Boolean).length;
      let t;
      if (spent) {
        // SUN-HUB-REPEAT-01: the vault refrain prints on one return at most, and a later return names
        // only the corridor, so it never claims where the player has just come from. When nothing but
        // the Continue exit is left, the line says so.
        const step = spent + (hasMark("elias", "bonded") || hasMark("elias", "bond_skipped") ? 1 : 0);
        const offersLeft = scenes.act3_spine_next.choices.length - 1;
        if (!offersLeft) t = `The spine is quiet. Nothing along it is waiting on you now, except the work.`;
        else if (step === 1) t = `The vault light is still on. There is still work.`;
        else t = [
          `Back in the spine corridor. The deck hums underfoot.`,
          `The corridor again. Down the spine, a hatch cycles shut and settles.`,
          `You step back into the spine. The air handlers hold their one low note.`
        ][(step - 2) % 3];
      } else {
        // SUN-HUB-REPEAT-01: the first visit follows Vess's arrival, not the vault, so the light is
        // placed down the corridor rather than behind the player.
        t = `At the far end of the spine, the vault light stays on.`;
        if (isAlive("tomas") && isAlive("jiro")) t += ` The ship has two men back who were written off, and a list of names that is no longer only numbers.`;
        if (isAlive("vess")) {
          t += `\n\nA third name is on the board now. The Dawnbreak survivor is still finding which bulkheads answer.`;
        }
        // SUN-RECAP-HONESTY-01: the fracture is named only when a private hour was spent.
        t += privateHourTaken() ? `\n\nThere is still work. There is still the fracture the private hours left in the corridor.` : `\n\nThere is still work.`;
      }
      // 0.27.2 Tomas allusion carrier — one-shot after make (bond return re-enters here)
      if (act3SpineTomasAllusionDue()) {
        t += `\n\nTomas finds you in the corridor on the way past. "Names first, then numbers. You put the order of mercy on record once. I count easier since."`;
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
      // 0.28.1b: Amara+Tomas private — closed by shared encounter OR privacy leave (not a fabricated relationship)
      // SUN-AMARA-WALKIN-GATE-01: asking them to stop closes it too.
      if (isAlive("amara") && isAlive("tomas") && !state.romance.amara_tomas && !hasMark("amara", "privacy_left") && !hasMark("amara", "interrupted") && state.flags.hydro === "full") {
        opts.push({ text: "Walk in on Amara and Tomas — and decide whether to stay.", next: "romance_amara_tomas", aliveAll: ["amara", "tomas"], tag: "private" });
      }
      if (isAlive("jiro") && !hasMark("jiro", "bonded") && !hasMark("jiro", "bond_skipped")) {
        opts.push({ text: "Join Jiro on a competence hang at the star tracker.", next: "bond_jiro", effects: { cohesion: 1 }, alive: "jiro", tag: "bond" });
      }
      // 0.28: pair settle + warmth optional one-shots (gated)
      // SUN-V036-CREW-CONFLICT-01: existing pair offers named as living-vs-living conflict. No new flags.
      if (isAlive("elias") && !isAlive("mira") && attributableDeath("mira") && !state.flags.pair_shield) {
        opts.push({ text: "Elias is still at the board after Mira. The argument is not finished.", next: "pair_shield_cold" });
      }
      if (isAlive("tomas") && isAlive("jiro") && !state.flags.tomas_scapegoated && !state.flags.pair_grudge) {
        opts.push({ text: "Step into the trunk, where Tomas and Jiro are working and not speaking.", next: "pair_grudge_settle" });
      }
      if (isAlive("amara") && isAlive("sela") && stillFavoring("sela") && !state.flags.pair_favor) {
        opts.push({ text: "Hear Amara out. She wants a quiet word about who you keep favoring.", next: "pair_favor_confront" });
      }
      // SUN-CREW-FRICTION-01 (§14A Wave 1, workstream 3): crew disagreeing with each other, one-shot,
      // gated on both living and on the run fact they argue about. One flag per pair, written by the answer.
      if (isAlive("elias") && isAlive("tomas") && !state.flags.tomas_scapegoated && state.flags.ship_memory && !state.flags.pair_seal) {
        opts.push({ text: "Go to the Deck 4 dog. Elias and Tomas are arguing about the feedstock.", next: "pair_seal_ledger" });
      }
      if (isAlive("mira") && isAlive("jiro") && state.flags.margin_committed && !state.flags.pair_burn) {
        opts.push({ text: "Go to the records bay. Jiro has asked Mira for her solution, and the pane is closed.", next: "pair_burn_archive" });
      }
      if (isAlive("jiro") && isAlive("vess") && state.flags.position_certain && !state.flags.pair_fix) {
        opts.push({ text: "Go to the tracker board, where Jiro's fix and Vess's night log sit side by side.", next: "pair_fix_track" });
      }
      if (isAlive("tomas") && !state.flags.warmth_meal) {
        opts.push({ text: state.flags.trays_dead ? "Follow the sound of the whole crew in one room." : "Follow the smell of green down-corridor.", next: "warmth_meal" });
      }
      if (["lena","elias","mira","tomas","amara","jiro","sela","vess"].filter(isAlive).length >= 2 && !state.flags.warmth_laughter) {
        opts.push({ text: "There's laughter around the spine bend. Stop before they see you.", next: "warmth_laughter" });
      }
      if (!state.flags.warmth_music) {
        opts.push({ text: "Follow the music coming from the empty berths.", next: "warmth_music" });
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
      // SUN-HUB-RESUME-01: leaving the visit that shows the allusion spends it, by whichever exit.
      if (act3SpineTomasAllusionDue()) opts.forEach(c => { c.flag = Object.assign({}, c.flag, { prom_tomas_alluded: true }); });
      return opts;
    }
  },

  // ═════════════════════════════════════════════
  // 0.24 — Vess Arrival + short asymmetric 5th romance
  // Structural asymmetry: informed run-reading offer, transmission currency,
  // power stays hers, fewer beats, one explicit sufficient. Not a fifth ladder.
  // ═════════════════════════════════════════════

  vess_signal: {
    image: "images/transmission.jpg",
    onEnter: () => {},
    text: () => {
      let t = `The long-range board lights on a carrier that has lived in the noise floor for eleven months. `;
      if (isAlive("mira")) {
        t += `Mira's filters finally pull a clean string.`;
      } else {
        t += `The automatic filters finally pull a clean string.`;
      }
      t += `\n\nAuthentication request. Protocol three. Dawnbreak fragment. Sole survivor. Docking on your aft collar. Acknowledge.\n\nThe voice is flat, timestamped, log-trained — a woman who has been her own captain for six years.`;
      if (isAlive("mira")) {
        t += `\n\nThe board shows the intercept geometry: relative velocity is matchable, and there is no second window on this heading. Mira does not look away from the board. "Reaction-mass cost is not optional. The bus will have to run degraded to keep her relay core online."`;
      } else {
        t += `\n\nThe geometry is clear from the boards: matchable, but the docking burn will spend reaction mass now, and the environmental bus will run degraded to power her relay core. No second window.`;
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
    image: "images/transmission.jpg",
    onEnter: () => {
      state.flags.busDowngraded = true;
      state.flags.reaction_mass_spent = true;
      remember("Spent reaction mass on the docking burn to recover Vess from Dawnbreak.");
      remember("Environmental bus runs degraded for her relay core.");
    },
    text: () => `Matching the fragment requires an immediate docking burn. The reaction-mass gauge falls and does not come back. The environmental bus is already being re-routed; lights will be dimmer on the outer ring and the air will cycle slower.\n\nThe window does not stay open by hesitation.\n\nShe is coming aboard.`,
    choices: [
      { text: "Dock the fragment.", next: "vess_boarding", effects: { supplies: -3, integrity: -1 }, reply: [{ who: "mira", text: `The burn is clean and expensive. Mira reads the reaction-mass figure aloud once, to the tenth of a percent, and never says it again.` }] },
      { text: "Dock on dead systems. Accept the rough seal.", next: "vess_boarding", reply: [{ who: "mira", text: `The seal takes on the third try. Mira stays at the collar with her palm flat on the weld until the pressure has held for an hour. "Rough," she reports. "Not failing. Rough is a condition I can live with. I will check it at oh-four-hundred."` }] }
    ]
  },

});
