// Sunsplitter — scenes-late-a.js
// Split from scenes-late.js (0.28.1c size hygiene). Pure mechanical.
// Act 3 lethals: Lena + Tomas packages through tomas_structure.
// Strict scene shape only: text | choices | onEnter | image
// Extends global `scenes` object.

registerScenes({


  // ═══════════════════════════════════════════════════════════════
  // 0.25 Lethal opportunities chain
  // Lena clock → vault_face; after tomas_break → Tomas cost → Elias → Mira → faction_split
  // Every lethal end uses kill() only in onEnter; dead never speak.
  // In-flight: VERSION < 0.25 skips Elias + Mira only (loadedGameVersion).
  // ═══════════════════════════════════════════════════════════════

// ═══ SCENE DECLARATION ═══════════════════════════════════════════
// SCENE_ID: act3_lethal_lena_clock
// VERSION:  0.25.0        TICKET: Lethal opportunities
// PACKAGE:  Lena — The Last Sterile Field
// SPINE:    on-spine after act3_reckoning_briefing
//
// PRECONDITIONS (live predicates, evaluated at render — never baked
// at author time; must remain true if later versions add death vectors):
//   rendered branch requires: isAlive('lena')
//   rendered branch requires: Boolean(state.dying.lena)
//   otherwise onEnter redirects: act3_vault_face
//
// STATE WRITES (exhaustive — every mutation this scene can cause):
//   choice 1 effects: state.supplies -= 8
//   choice 2 effects: state.embryos -= 10
//   lethal choice writes NOTHING here; destination onEnter owns death
//   writes NOTHING else.
//
// DEATH EXPOSURE: can kill lena via the final choice
// DEAD-SPEECH CHECK: Lena dialogue/action exists only after live onEnter guard;
//   choices are also rebuilt behind isAlive('lena')
// IMAGE: images/medbay_dim.jpg [REUSE generic medical plate; EXISTS; ART-HONEST]
// ═════════════════════════════════════════════════════════════════
act3_lethal_lena_clock: {
  onEnter: () => {
    if (!isAlive("lena") || !state.dying || !state.dying.lena) {
      return "act3_vault_face";
    }
  },
  get text() {
    if (!isAlive("lena")) return `Medical is empty. The watch continues.`;

    let t = `The treatment-bay alarm is not a patient call. It is Lena's blood chemistry crossing the red limit she posted after Jiro's prognosis.

She catches herself on the sterile-field frame, looks past the red trace, and reaches for the triage slate.

"Who's hurt?"

She reads the trace again.

"Me. Put it under my name."`;

    if (state.flags.lena_regen) {
      t += `\n\nThe last regenerative bought months. It did not become a second dose. The cold drawer is empty.`;
    }

    t += `\n\nA sealed trauma circuit can be built from the remaining sterile packs and light stabilizer ampoules. It will keep her functional; it will not reverse the exposure. The other clean power source is the vault cradle bus. Ten viability points will not survive the transfer.

Without either, Lena can finish the watch. The clock will finish with her.`;
    return t;
  },
  get choices() {
    if (!isAlive("lena")) {
      return [{ text: "Continue without medical.", next: "act3_vault_face" }];
    }

    const opts = [
      {
        text: "Open the sterile packs. Build the trauma circuit and keep Lena functional.",
        next: "act3_lethal_lena_sterile",
        effects: { supplies: -8 },
        requires: { supplies: { min: 8 } },
        alive: "lena"
      },
      {
        text: "Take the vault cradle bus. Keep Lena alive and accept the viability loss.",
        next: "act3_lethal_lena_power",
        effects: { embryos: -10 },
        requires: { embryos: { min: 10 } },
        alive: "lena"
      }
    ];

    opts.push({
      text: state.flags.vault_sacrifice === "future"
        ? "Keep the cradle bus on the vault. Let Lena finish the watch on the time left."
        : "Keep the packs and power committed elsewhere. Let Lena finish the watch on the time left.",
      next: "act3_lethal_lena_end",
      alive: "lena"
    });
    return opts;
  },
  image: "images/medbay_dim.jpg"
},

// ═══ SCENE DECLARATION ═══════════════════════════════════════════
// SCENE_ID: act3_lethal_lena_sterile
// VERSION:  0.25.0        TICKET: Lethal opportunities
// PACKAGE:  Lena — The Last Sterile Field
// SPINE:    off-spine, reached via act3_lethal_lena_clock choice 1
//
// PRECONDITIONS (live predicates, evaluated at render — never baked
// at author time; must remain true if later versions add death vectors):
//   requires: isAlive('lena')
//
// STATE WRITES (exhaustive — every mutation this scene can cause):
//   onEnter deletes: state.dying.lena
//   writes NOTHING else.
//
// DEATH EXPOSURE: none
// DEAD-SPEECH CHECK: Lena dialogue/action guarded by isAlive('lena'); dead entry
//   redirects before image/text/choices
// IMAGE: images/medbay_dim.jpg [REUSE generic medical plate; EXISTS; ART-HONEST]
// ═════════════════════════════════════════════════════════════════
act3_lethal_lena_sterile: {
  onEnter: () => {
    if (!isAlive("lena")) return "act3_vault_face";
    delete state.dying.lena;
  },
  get text() {
    if (!isAlive("lena")) return `Medical is empty. The expenditure remains on the board.`;
    return `Eight points leave Supplies as sealed packs come open.

The circuit takes two attempts to hold pressure. On the third, Lena's blood trace comes back under the red line and stays there.

She inventories the empty wrappers before she sits down.

"Functional," she says. "Not cured. Who's next?"`;
  },
  choices: [
    { text: "Leave the empty shelf visible. Continue.", next: "act3_vault_face" }
  ],
  image: "images/medbay_dim.jpg"
},

// ═══ SCENE DECLARATION ═══════════════════════════════════════════
// SCENE_ID: act3_lethal_lena_power
// VERSION:  0.25.0        TICKET: Lethal opportunities
// PACKAGE:  Lena — The Last Sterile Field
// SPINE:    off-spine, reached via act3_lethal_lena_clock choice 2
//
// PRECONDITIONS (live predicates, evaluated at render — never baked
// at author time; must remain true if later versions add death vectors):
//   requires: isAlive('lena')
//
// STATE WRITES (exhaustive — every mutation this scene can cause):
//   onEnter deletes: state.dying.lena
 //   writes NOTHING else.
//
// DEATH EXPOSURE: none
// DEAD-SPEECH CHECK: Lena dialogue/action guarded by isAlive('lena'); dead entry
//   redirects before image/text/choices
// IMAGE: images/medbay_dim.jpg [REUSE generic medical plate; EXISTS; NO BAKED TEXT]
// ═════════════════════════════════════════════════════════════════
act3_lethal_lena_power: {
  onEnter: () => {
    if (!isAlive("lena")) return "act3_vault_face";
    delete state.dying.lena;
  },
  get text() {
    if (!isAlive("lena")) return `The vault transfer remains in the power log. Medical is empty.`;
    return `The outer cradle pumps go dark in sequence. Ten viability points leave the board before the medical isolator reaches full current.

Lena's trace falls below the red line. The vault trace does not recover.

She checks the cradle count first, then her own pulse.

"Both patients are on the board," she says. "Keep them there."`;
  },
  choices: [
    { text: "Keep both numbers visible. Continue.", next: "act3_vault_face" }
  ],
  image: "images/medbay_dim.jpg"
},

// ═══ SCENE DECLARATION ═══════════════════════════════════════════
// SCENE_ID: act3_lethal_lena_end
// VERSION:  0.25.0        TICKET: Lethal opportunities
// PACKAGE:  Lena — The Last Sterile Field
// SPINE:    off-spine, reached via act3_lethal_lena_clock final choice
//
// PRECONDITIONS (live predicates, evaluated at render — never baked
// at author time; must remain true if later versions add death vectors):
//   requires: isAlive('lena')
//   requires: Boolean(state.dying.lena)
//
// STATE WRITES (exhaustive — every mutation this scene can cause):
//   Future branch onEnter sets: state.dying.lena = 'resources diverted to the vault'
//   all other branches onEnter sets: state.dying.lena =
//     'kept working until the clock ran out'
//   onEnter calls: kill('lena', state.dying.lena)
//   kill appends 'lena' to state.dead, decrements state.survivors by 1,
//     and sets state.deathCause.lena = state.dying.lena
//   writes NOTHING else.
//
// DEATH EXPOSURE: Lena dies onEnter
// DEAD-SPEECH CHECK: post-onEnter text contains no Lena dialogue or action;
//   only instruments, work product, and witnessed absence
// IMAGE: images/covered_body.jpg [REUSE rourke_end; EXISTS]
// ═════════════════════════════════════════════════════════════════
act3_lethal_lena_end: {
  onEnter: () => {
    if (!isAlive("lena") || !state.dying || !state.dying.lena) {
      return "act3_vault_face";
    }
    state.dying.lena = state.flags.vault_sacrifice === "future"
      ? "resources diverted to the vault"
      : "kept working until the clock ran out";
    kill("lena", state.dying.lena);
  },
  get text() {
    const keptVault = state.dying && state.dying.lena === "resources diverted to the vault";
    return keptVault
      ? `The cradle bus remains on the vault. Medical stays on reduced power.

The watch closes with every treatment entry complete except the one bearing Lena's name. Her terminal stops accepting pulse data at 03:17. The sterile packs remain sealed. The vault count does not move.

Medical is now a room with records and no doctor.`
      : `The watch closes. Every treatment entry is complete except the one bearing Lena's name.

Her terminal stops accepting pulse data at 03:17. The last line in the active chart is an unfinished set of observations on someone else.

Medical is now a room with records and no doctor.`;
  },
  choices: [
    { text: "Close the active chart. Continue.", next: "act3_vault_face" }
  ],
  image: "images/covered_body.jpg"
},

// ═══ SCENE DECLARATION ═══════════════════════════════════════════
// SCENE_ID: act3_lethal_tomas_cost
// VERSION:  0.25.0        TICKET: Lethal opportunities
// PACKAGE:  Tomas — The Cost Comes Back
// SPINE:    on-spine after tomas_break
//
// PRECONDITIONS (live predicates, evaluated at render — never baked
// at author time; must remain true if later versions add death vectors):
//   rendered branch requires: isAlive('tomas')
//   rendered branch requires: state.recovered.tomas === true
//   pure Future branch requires: flags.vault_sacrifice === 'future' and
//     (flags.tomas === 'future' or hasMark('tomas', 'broke'))
//   pure Future branch also requires: one living stranded cast member
//   recovery-debt branch requires: !flags.trays_dead
//   otherwise onEnter redirects: act3_lethal_elias_order
//
// STATE WRITES (exhaustive — every mutation this scene can cause):
//   choice 1 effects: state.supplies -= 8
//   pure Future choice 2 effects: state.embryos -= 8
//   recovery-debt choice 2 effects: state.integrity -= 7
//   lethal choice writes NOTHING here; destination onEnter owns death
//   writes NOTHING else.
//
// DEATH EXPOSURE: can kill tomas via the final choice
// DEAD-SPEECH CHECK: Tomas dialogue/action guarded by isAlive('tomas'); the
//   stranded named character is chosen through isAlive() and does not speak
// IMAGE: images/tomas_break.jpg [REUSE tomas_break; EXISTS]
// ═════════════════════════════════════════════════════════════════
act3_lethal_tomas_cost: {
  onEnter: () => {
    if (!isAlive("tomas") || !state.recovered || !state.recovered.tomas) {
      return "act3_lethal_elias_order";
    }
    const pureFuture = state.flags.vault_sacrifice === "future" &&
      (state.flags.tomas === "future" || hasMark("tomas", "broke"));
    if (pureFuture) {
      const stranded = ["sela", "jiro", "vess", "amara", "mira", "elias", "lena"]
        .find(key => isAlive(key));
      if (!stranded) return "act3_lethal_elias_order";
    } else if (state.flags.trays_dead) {
      return "act3_lethal_elias_order";
    }
  },
  get text() {
    if (!isAlive("tomas")) return `The warning has no living speaker. The watch continues.`;

    const pureFuture = state.flags.vault_sacrifice === "future" &&
      (state.flags.tomas === "future" || hasMark("tomas", "broke"));
    if (pureFuture) {
      const stranded = ["sela", "jiro", "vess", "amara", "mira", "elias", "lena"]
        .find(key => isAlive(key));
      if (!stranded) return `The service throat is empty. The seal closes without an order.`;
      const name = crew[stranded].first;

      return `The cascade reaches the service throat with ${name} on the far side.

The automatic seal will protect the vault transfer and leave the far section without pressure. Reserve oxygen and patch compound can hold the throat. One outer embryo rack carries enough nitrogen to do the same if it is quenched now.

Tomas has one hand on the suit rack.

"Who pays?"

Tomas reads the far-side tag. "${name}. Unless the stores or the vault take the loss instead."

The manual release is inside the throat, on the side the automatic seal will vent.

The seal timer reaches ten seconds.

"Confirm it and I go through. I open the throat from the vented side. You can call that refusal before or after."`;
    }

    return `The recovered annex collar begins peeling away from the spine.

Eight points of viable food stock remain behind it: root cultures, water algae, the seed trays Tomas carried home. Cut the annex loose and the ship keeps pressure. Torque the hull against the drift and the collar may reseat, at a permanent cost to the spine.

The manual reseat takes twelve minutes. The suit has nine at the present leak rate. Tomas is already at the rack.

"Who pays if we cut it loose? The mouths. Who pays if we keep it? Me, if you leave the stock and hull where they are."

He sets the helmet down long enough to leave the decision with you.`;
  },
  get choices() {
    if (!isAlive("tomas") || !state.recovered || !state.recovered.tomas) {
      return [{ text: "Continue without him.", next: "act3_lethal_elias_order" }];
    }

    const pureFuture = state.flags.vault_sacrifice === "future" &&
      (state.flags.tomas === "future" || hasMark("tomas", "broke"));
    if (pureFuture) {
      const stranded = ["sela", "jiro", "vess", "amara", "mira", "elias", "lena"]
        .find(key => isAlive(key));
      if (!stranded || !crew[stranded]) {
        return [{ text: "The throat has no living tag. Continue.", next: "act3_lethal_elias_order" }];
      }
      const name = crew[stranded].first;
      return [
        {
          text: `Spend reserve oxygen and patch compound. Bring ${name} through.`,
          next: "act3_lethal_tomas_stores",
          effects: { supplies: -8 },
          requires: { supplies: { min: 8 } },
          alive: "tomas"
        },
        {
          text: "Quench the outer embryo rack. Use its nitrogen to hold the throat.",
          next: "act3_lethal_tomas_structure",
          effects: { embryos: -8 },
          requires: { embryos: { min: 8 } },
          alive: "tomas"
        },
        {
          text: "Confirm the seal. Tomas has told you he will open the throat from the vented side.",
          next: "act3_lethal_tomas_end",
          alive: "tomas"
        }
      ];
    }

    if (state.flags.trays_dead) {
      return [{ text: "The recovered stock is already dead. Continue.", next: "act3_lethal_elias_order" }];
    }

    return [
      {
        text: "Cut the annex loose. Lose the viable stock and keep Tomas inside.",
        next: "act3_lethal_tomas_stores",
        effects: { supplies: -8 },
        requires: { supplies: { min: 8 } },
        alive: "tomas"
      },
      {
        text: "Torque the hull. Let the spine pay and reseat the collar remotely.",
        next: "act3_lethal_tomas_structure",
        effects: { integrity: -7 },
        requires: { integrity: { min: 17 } },
        alive: "tomas"
      },
      {
        text: "Preserve the stock and the hull. Let Tomas enter with nine minutes of feed for a twelve-minute reseat.",
        next: "act3_lethal_tomas_end",
        alive: "tomas"
      }
    ];
  },
  image: "images/tomas_break.jpg"
},

// ═══ SCENE DECLARATION ═══════════════════════════════════════════
// SCENE_ID: act3_lethal_tomas_stores
// VERSION:  0.25.0        TICKET: Lethal opportunities
// PACKAGE:  Tomas — The Cost Comes Back
// SPINE:    off-spine, reached via act3_lethal_tomas_cost choice 1
//
// PRECONDITIONS (live predicates, evaluated at render — never baked
// at author time; must remain true if later versions add death vectors):
//   requires: isAlive('tomas')
//   requires: state.recovered.tomas === true
//   loyalty-break predicate: flags.vault_sacrifice === 'future' and
//     (flags.tomas === 'future' or hasMark('tomas', 'broke'))
//   pure Future requires: one living stranded candidate selected via isAlive()
//   recovery-debt requires: !state.flags.trays_dead
//
// STATE WRITES (exhaustive — every mutation this scene can cause):
//   writes NOTHING.
//
// DEATH EXPOSURE: none
// DEAD-SPEECH CHECK: Tomas dialogue/action guarded by isAlive('tomas'); any
//   stranded named character is selected through isAlive() before acting
// IMAGE: images/quiet_tomas.jpg [REUSE quiet_tomas; EXISTS; NO BAKED TEXT]
// ═════════════════════════════════════════════════════════════════
act3_lethal_tomas_stores: {
  onEnter: () => {
    if (!isAlive("tomas") || !state.recovered || !state.recovered.tomas) {
      return "act3_lethal_elias_order";
    }
    const pureFuture = state.flags.vault_sacrifice === "future" &&
      (state.flags.tomas === "future" || hasMark("tomas", "broke"));
    if (pureFuture) {
      const stranded = ["sela", "jiro", "vess", "amara", "mira", "elias", "lena"]
        .find(key => isAlive(key));
      if (!stranded) return "act3_lethal_elias_order";
    } else if (state.flags.trays_dead) {
      return "act3_lethal_elias_order";
    }
  },
  get text() {
    if (!isAlive("tomas")) return `The expenditure is logged. Tomas is not there to read it.`;

    const pureFuture = state.flags.vault_sacrifice === "future" &&
      (state.flags.tomas === "future" || hasMark("tomas", "broke"));
    if (pureFuture) {
      const stranded = ["sela", "jiro", "vess", "amara", "mira", "elias", "lena"]
        .find(key => isAlive(key));
      if (!stranded || !crew[stranded]) return `The service throat has no living tag. The watch continues.`;
      const name = crew[stranded].first;
      return `Reserve oxygen enters the service throat hard enough to make the bulkhead ring. Patch compound follows in a white sheet.

${name} crosses before the temporary pressure fails. Tomas closes the manual release only after the living body is on this side.

"Eight from stores," he says. "Put it beside the name."`;
    }

    return `The collar charges fire. The annex falls away.

Eight points leave Supplies before the green strip becomes too small to see. Tomas watches it without touching the suit.

"The mouths pay," he says. "Write that. Not me. Not this time."`;
  },
  choices: [
    { text: "Post the expenditure. Continue.", next: "act3_lethal_elias_order" }
  ],
  image: "images/quiet_tomas.jpg"
},

// ═══ SCENE DECLARATION ═══════════════════════════════════════════
// SCENE_ID: act3_lethal_tomas_structure
// VERSION:  0.25.0        TICKET: Lethal opportunities
// PACKAGE:  Tomas — The Cost Comes Back
// SPINE:    off-spine, reached via act3_lethal_tomas_cost choice 2
//
// PRECONDITIONS (live predicates, evaluated at render — never baked
// at author time; must remain true if later versions add death vectors):
//   requires: isAlive('tomas')
//   requires: state.recovered.tomas === true
//   loyalty-break predicate: flags.vault_sacrifice === 'future' and
//     (flags.tomas === 'future' or hasMark('tomas', 'broke'))
//   pure Future requires: one living stranded candidate selected via isAlive()
//   recovery-debt requires: !state.flags.trays_dead
//
// STATE WRITES (exhaustive — every mutation this scene can cause):
//   writes NOTHING.
//
// DEATH EXPOSURE: none
// DEAD-SPEECH CHECK: Tomas dialogue/action guarded by isAlive('tomas'); any
//   stranded named character is selected through isAlive() before acting
// IMAGE: images/quiet_tomas.jpg [REUSE quiet_tomas; EXISTS; NO BAKED TEXT]
// ═════════════════════════════════════════════════════════════════
act3_lethal_tomas_structure: {
  onEnter: () => {
    if (!isAlive("tomas") || !state.recovered || !state.recovered.tomas) {
      return "act3_lethal_elias_order";
    }
    const pureFuture = state.flags.vault_sacrifice === "future" &&
      (state.flags.tomas === "future" || hasMark("tomas", "broke"));
    if (pureFuture) {
      const stranded = ["sela", "jiro", "vess", "amara", "mira", "elias", "lena"]
        .find(key => isAlive(key));
      if (!stranded) return "act3_lethal_elias_order";
    } else if (state.flags.trays_dead) {
      return "act3_lethal_elias_order";
    }
  },
  get text() {
    if (!isAlive("tomas")) return `The structural cost remains. Tomas does not.`;

    const pureFuture = state.flags.vault_sacrifice === "future" &&
      (state.flags.tomas === "future" || hasMark("tomas", "broke"));
    if (pureFuture) {
      const stranded = ["sela", "jiro", "vess", "amara", "mira", "elias", "lena"]
        .find(key => isAlive(key));
      if (!stranded || !crew[stranded]) return `The service throat has no living tag. The watch continues.`;
      const name = crew[stranded].first;
      return `The rack quench is clean.

Nitrogen leaves the vault, holds the service throat, and carries ${name} back through it. Eight viability points vanish without making a sound.

Tomas releases the hatch when the crossing is complete.

"Eight from the vault," Tomas says. He keeps ${name}'s suit tag beside the new count.`;
    }

    return `The Sunsplitter rolls three degrees against the drift.

The spine takes the load. Seven Integrity points leave the board. The annex collar reseats with a sound felt through every deck.

Tomas reads the new fracture line, then the green strip.

"Seven from Integrity," Tomas says. He keeps the annex pressure trace beside the new fracture line.`;
  },
  choices: [
    { text: "Keep the cost on the board. Continue.", next: "act3_lethal_elias_order" }
  ],
  image: "images/quiet_tomas.jpg"
},
});
