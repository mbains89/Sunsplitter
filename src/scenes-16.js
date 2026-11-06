// Sunsplitter — scenes-16.js
// 0.28.1c size hygiene. Pure mechanical. crises: spine_next + vess_signal (the cost screen merged in,
// SUN-DIET-VESS-MERGE-01)
// Strict scene shape only: text | choices | onEnter | image
let act3SpineTomasAllusionOnEntry = false;

registerScenes({

  // PRE: post-vault spine, Vess recovered, living Tomas with made unalluded promise | WRITES: consumes Tomas allusion flag on entry
  // DEATH: none | DEAD SPEECH/APPEARANCE: Tomas prose/options are living-gated | IMAGE: roster-neutral corridor_variant_2; distinct from immediate warmth returns
  // SUN-DIET-HUB-01: the corridor paragraph prints on the first visit of a run; a return prints one
  // roster-neutral line instead. The Tomas allusion still fires on whichever visit consumes it.
  act3_spine_next: {
    image: "images/corridor_variant_2.jpg",
    onEnter: () => {
      act3SpineTomasAllusionOnEntry = false;
      // 0.24: Vess arrival window opens once after vault face; guaranteed, no refuse-contact
      if ((!state.recovered || !state.recovered.vess) && !state.dead.includes("vess")) return "vess_signal";
      act3SpineTomasAllusionOnEntry = state.promises.tomas === "made" && isAlive("tomas") && !state.flags.prom_tomas_alluded;
      if (act3SpineTomasAllusionOnEntry) state.flags.prom_tomas_alluded = true;
    },
    text: () => {
      // SUN-DIET-HUB-01: a return is read from existing state, never written here. Each key below is
      // spent only by an offer this hub makes after the vault: the warmth, favor and crew-friction pair
      // scenes are offered nowhere else, and the Tomas, Jiro and Amara-Tomas offers elsewhere need a
      // recovered Tomas or
      // Jiro, which the opening walk and the private hours never have. Elias's hour is left out
      // because the opening walk can spend it; a return that spent none of these shows the paragraph
      // again, which errs toward the old text, never toward hiding the first visit.
      const f = state.flags;
      const returning = !!(f.warmth_meal || f.warmth_laughter || f.warmth_music || f.pair_favor ||
        f.pair_grudge || f.pair_seal || f.pair_burn || f.pair_fix || f.quiet_tomas_done || state.romance.amara_tomas ||
        hasMark("tomas", "bonded") || hasMark("tomas", "bond_skipped") ||
        hasMark("jiro", "bonded") || hasMark("jiro", "bond_skipped") ||
        hasMark("amara", "privacy_left") || hasMark("amara", "interrupted"));
      let t;
      if (returning) {
        t = `The vault light is still on. There is still work.`;
      } else {
        t = `The vault light stays on behind you.`;
        if (isAlive("tomas") && isAlive("jiro")) t += ` The ship has two men back who were written off, and a list of names that is no longer only numbers.`;
        if (isAlive("vess")) {
          t += `\n\nA third name is on the board now. The Dawnbreak survivor is still finding which bulkheads answer.`;
        }
        t += `\n\nThere is still work. There is still the fracture the private hours left in the corridor.`;
      }
      // 0.27.2 Tomas allusion carrier — one-shot after make (bond return re-enters here)
      if (state.promises.tomas === "made" && isAlive("tomas") &&
          (act3SpineTomasAllusionOnEntry || (renderingSavedScene && state.flags.prom_tomas_alluded))) {
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
        opts.push({ text: "Tomas and Jiro are working the same trunk and not speaking.", next: "pair_grudge_settle" });
      }
      if (isAlive("amara") && isAlive("sela") && stillFavoring("sela") && !state.flags.pair_favor) {
        opts.push({ text: "Amara wants a quiet word about who you keep favoring.", next: "pair_favor_confront" });
      }
      // SUN-CREW-FRICTION-01 (§14A Wave 1, workstream 3): crew disagreeing with each other, one-shot,
      // gated on both living and on the run fact they argue about. One flag per pair, written by the answer.
      if (isAlive("elias") && isAlive("tomas") && !state.flags.tomas_scapegoated && state.flags.ship_memory && !state.flags.pair_seal) {
        opts.push({ text: "Elias and Tomas are at the Deck 4 dog. The argument is about the feedstock.", next: "pair_seal_ledger" });
      }
      if (isAlive("mira") && isAlive("jiro") && state.flags.margin_committed && !state.flags.pair_burn) {
        opts.push({ text: "Jiro has asked Mira for her solution. The pane is closed.", next: "pair_burn_archive" });
      }
      if (isAlive("jiro") && isAlive("vess") && state.flags.position_certain && !state.flags.pair_fix) {
        opts.push({ text: "Jiro's fix is on the tracker board, Vess's night log beside it. They are not looking at each other.", next: "pair_fix_track" });
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

  // ═════════════════════════════════════════════
  // 0.24 — Vess Arrival + short asymmetric 5th romance
  // Structural asymmetry: informed run-reading offer, transmission currency,
  // power stays hers, fewer beats, one explicit sufficient. Not a fifth ladder.
  // ═════════════════════════════════════════════

  // PRE: act3_spine_next routes here once per run while Vess is unrecovered and not dead (the
  // scenes-55 living-cast contract exits to the hub if she is recorded dead)
  // WRITES: on entry, the docking cost — flags busDowngraded + reaction_mass_spent and their two
  // memories (moved here from the retired vess_cost; remember() dedupes, so a re-entry is idempotent)
  // DEATH: none | DEAD SPEECH/APPEARANCE: Mira's and Elias's lines are living-gated; the plate shows
  // Mira and Elias and is face-gated by PLATE_FACES | IMAGE: images/vess_signal.jpg via the HITL
  // event-plate map (scene.image transmission.jpg is the pre-HITL default it shadows)
  // SUN-DIET-VESS-MERGE-01 (D11 Deep step 1, item C10): the vess_cost screen is merged in below the
  // signal. Its only exit ("Prepare the intercept. Bring her in.") carried no effect, so the two
  // docking choices sit on this screen now, unchanged. One sentence of the cost paragraph is dropped
  // because it restated Mira's "no second window" from the paragraph above; the rest is the author's
  // text. A save parked on vess_cost resumes here (RETIRED_SCENE_EXITS) as a live entry. A save parked
  // on the pre-merge vess_signal resumes with its entry skipped, so both docking choices also set the
  // two cost flags (idempotent); only the two memories stay unwritten on that one legacy path.
  vess_signal: {
    image: "images/transmission.jpg",
    onEnter: () => {
      state.flags.busDowngraded = true;
      state.flags.reaction_mass_spent = true;
      remember("Spent reaction mass on the docking burn to recover Vess from Dawnbreak.");
      remember("Environmental bus runs degraded for her relay core.");
    },
    text: () => {
      let t = `The long-range board lights on a carrier that has lived in the noise floor for eleven months. `;
      if (isAlive("mira")) {
        t += `Mira's filters finally pull a clean string.`;
      } else {
        t += `The automatic filters finally pull a clean string.`;
      }
      t += `\n\nAuthentication request. Protocol three. Dawnbreak fragment. Sole survivor. Requesting docking authority.\n\nThe voice is flat, timestamped, log-trained — a woman who has been her own captain for six years.`;
      if (isAlive("mira")) {
        t += `\n\nMira does not look away from the board. "Relative velocity is matchable. Reaction-mass cost is not optional. The bus will have to run degraded to keep her relay core online. There is no second window on this heading."`;
      } else {
        t += `\n\nThe geometry is clear from the boards: matchable, but the docking burn will spend reaction mass now, and the environmental bus will run degraded to power her relay core. No second window.`;
      }
      if (isAlive("elias")) {
        t += `\n\n"Eleven months of listening," Elias says. "She already knows our hull ID. Decide whether that is a gift or a problem after she is aboard."`;
      }
      t += `\n\nMatching the fragment requires an immediate docking burn. The reaction-mass gauge falls and does not come back. The environmental bus is already being re-routed; lights will be dimmer on the outer ring and the air will cycle slower.\n\nThere is no refuse-contact option that still leaves a second chance.\n\nShe is coming aboard.`;
      return t;
    },
    choices: [
      { text: "Dock the fragment.", next: "vess_boarding", effects: { supplies: -3, integrity: -1 }, flag: { busDowngraded: true, reaction_mass_spent: true }, reply: [{ who: "mira", text: `The burn is clean and expensive. Mira reads the reaction-mass figure aloud once, to the tenth of a percent, and never says it again.` }] },
      { text: "Dock on dead systems. Accept the rough seal.", next: "vess_boarding", flag: { busDowngraded: true, reaction_mass_spent: true }, reply: [{ who: "mira", text: `The seal takes on the third try. Mira stays at the collar with her palm flat on the weld until the pressure has held for an hour. "Rough," she reports. "Not failing. Rough is a condition I can live with. I will check it at oh-four-hundred."` }] }
    ]
  },

});
