// Sunsplitter — scenes-late.js
// Version 0.25 — Lethal opportunities
// Act 3: faction_split through ending_check (reckoning, final choice, ending router).
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

// ═══ SCENE DECLARATION ═══════════════════════════════════════════
// SCENE_ID: act3_lethal_tomas_end
// VERSION:  0.25.0        TICKET: Lethal opportunities
// PACKAGE:  Tomas — The Cost Comes Back
// SPINE:    off-spine, reached via act3_lethal_tomas_cost final choice
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
//   pure Future onEnter sets: state.dying.tomas =
//     'refused the order and paid for it'
//   recovery-debt onEnter sets: state.dying.tomas =
//     'went back for the living and did not return'
//   onEnter calls: kill('tomas', state.dying.tomas)
//   kill appends 'tomas' to state.dead, decrements state.survivors by 1,
//     and sets state.deathCause.tomas = state.dying.tomas
//   writes NOTHING else.
//
// DEATH EXPOSURE: Tomas dies onEnter
// DEAD-SPEECH CHECK: post-onEnter text contains no Tomas dialogue or action;
//   rescue completion is carried by pressure and suit telemetry
// IMAGE: images/corridor_variant.jpg [REUSE death-neutral corridor; EXISTS; NO BAKED TEXT]
// ═════════════════════════════════════════════════════════════════
act3_lethal_tomas_end: {
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
    state.dying.tomas = pureFuture
      ? "refused the order and paid for it"
      : "went back for the living and did not return";
    kill("tomas", state.dying.tomas);
  },
  get text() {
    if (state.dying && state.dying.tomas === "refused the order and paid for it") {
      return `The automatic seal confirms. The manual release opens anyway.

The far-side suit tag crosses the inner line before the pressure trace ends. One beacon stays green. Tomas's goes black inside the service throat.

Security records a disobeyed order. Medical records exposure. The casualty board keeps the cause neither report can hold alone.`;
    }

    return `Pressure steadies. The annex remains attached. Eight points stay on the supply board.

Tomas's suit tag remains beyond the hatch after the collar reports seated.`;
  },
  choices: [
    { text: "Post the cause. Continue.", next: "act3_lethal_elias_order" }
  ],
  image: "images/corridor_variant.jpg"
},

// ═══ SCENE DECLARATION ═══════════════════════════════════════════
// SCENE_ID: act3_lethal_elias_order
// VERSION:  0.25.0        TICKET: Lethal opportunities
// PACKAGE:  Elias — Station B-Four
// SPINE:    on-spine after every Tomas-package outcome
//
// PRECONDITIONS (live predicates, evaluated at render — never baked
// at author time; must remain true if later versions add death vectors):
//   rendered branch requires: isAlive('elias')
//   otherwise onEnter redirects: act3_lethal_mira_board
//
// STATE WRITES (exhaustive — every mutation this scene can cause):
//   choice 1 effects: state.supplies -= 8
//   choice 2 effects: state.integrity -= 7
//   lethal choice writes NOTHING here; destination onEnter owns death
//   writes NOTHING else.
//
// DEATH EXPOSURE: can kill elias via the final choice
// DEAD-SPEECH CHECK: Elias dialogue/action and lethal choice are guarded by
//   isAlive('elias'); dead entry redirects before image/text/choices
// IMAGE: images/bond_elias.jpg [REUSE live Elias portrait; EXISTS; NO BAKED TEXT]
// ═════════════════════════════════════════════════════════════════
act3_lethal_elias_order: {
  onEnter: () => {
    // Lock 5: in-flight saves from <0.25 skip Elias + Mira lethals (new plants)
    if (typeof loadedGameVersion === "string" && loadedGameVersion < "0.25") {
      return "faction_split";
    }
    if (!isAlive("elias")) return "act3_lethal_mira_board";
  },
  get text() {
    if (!isAlive("elias")) return `Security is a set of permissions with no living holder.`;

    let t;
    if (state.flags.ship_memory === "proper_seal") {
      t = `The Deck 4 seal stays shut. The frame beside it does not.

Metal folds around Station B-four and leaves the pressure dog reporting CLOSED while pressure keeps falling. The feedstock held. The adjacent frame failed.`;
    } else if (state.flags.ship_memory === "open_wound") {
      t = `Deck 4 opens along the seam left underfunded. First a white line of frost. Then the inner plate bows far enough for Station B-four to report CLOSED while pressure keeps falling.`;
    } else {
      t = `Deck 4's thin patch separates one fastener at a time. The jury-rig keeps its shape and loses its seal. Station B-four reports CLOSED while pressure keeps falling.`;
    }

    t += `\n\nElias reads the access map before the gauge.

"What's the threat? The pressure front behind it. Six minutes to habitation. Remote is lying."

The last pressure-rated sealant cartridges can force the dog from this side. The exterior brace can be blown clear, taking a permanent piece of the ship's structural envelope with it. The remaining control is inside the failing section.

A manual hold takes longer than the station suit feed.

Elias keeps one finger on B-four.

"No retrieval until pressure is flat."`;
    return t;
  },
  get choices() {
    if (!isAlive("elias")) {
      return [{ text: "Continue without security.", next: "act3_lethal_mira_board" }];
    }

    const volunteers = hasMark("elias", "bonded") || state.flags.elias_power === "high";
    return [
      {
        text: "Fire the last pressure-rated sealant cartridges. Seat B-four from here.",
        next: "act3_lethal_elias_sealant",
        effects: { supplies: -8 },
        requires: { supplies: { min: 8 } },
        alive: "elias"
      },
      {
        text: "Blow the exterior brace. Stop the pressure front and let the hull pay.",
        next: "act3_lethal_elias_brace",
        effects: { integrity: -7 },
        requires: { integrity: { min: 17 } },
        alive: "elias"
      },
      {
        text: volunteers
          ? "Accept Elias's assessment. Seal him into Station B-four."
          : "Order Elias inside. Close upstream behind him.",
        next: "act3_lethal_elias_end",
        alive: "elias"
      }
    ];
  },
  image: "images/bond_elias.jpg"
},

// ═══ SCENE DECLARATION ═══════════════════════════════════════════
// SCENE_ID: act3_lethal_elias_sealant
// VERSION:  0.25.0        TICKET: Lethal opportunities
// PACKAGE:  Elias — Station B-Four
// SPINE:    off-spine, reached via act3_lethal_elias_order choice 1
//
// PRECONDITIONS (live predicates, evaluated at render — never baked
// at author time; must remain true if later versions add death vectors):
//   requires: isAlive('elias')
//
// STATE WRITES (exhaustive — every mutation this scene can cause):
//   writes NOTHING.
//
// DEATH EXPOSURE: none
// DEAD-SPEECH CHECK: Elias dialogue/action guarded by isAlive('elias'); dead
//   entry redirects before image/text/choices
// IMAGE: images/bond_elias.jpg [REUSE live Elias portrait; EXISTS; NO BAKED TEXT]
// ═════════════════════════════════════════════════════════════════
act3_lethal_elias_sealant: {
  onEnter: () => {
    if (!isAlive("elias")) return "act3_lethal_mira_board";
  },
  get text() {
    if (!isAlive("elias")) return `The sealant rack is empty. Security is gone.`;
    return `The cartridges fire together. Grey compound crosses the seam, expands, and hardens around the lying dog.

Pressure falls for another four seconds, then stops. The rack now reads empty.

Elias watches every downstream compartment hold before he releases the board.

"Threat contained. Next breach gets a different answer."`;
  },
  choices: [
    { text: "Log the empty rack. Continue.", next: "act3_lethal_mira_board" }
  ],
  image: "images/bond_elias.jpg"
},

// ═══ SCENE DECLARATION ═══════════════════════════════════════════
// SCENE_ID: act3_lethal_elias_brace
// VERSION:  0.25.0        TICKET: Lethal opportunities
// PACKAGE:  Elias — Station B-Four
// SPINE:    off-spine, reached via act3_lethal_elias_order choice 2
//
// PRECONDITIONS (live predicates, evaluated at render — never baked
// at author time; must remain true if later versions add death vectors):
//   requires: isAlive('elias')
//
// STATE WRITES (exhaustive — every mutation this scene can cause):
//   writes NOTHING.
//
// DEATH EXPOSURE: none
// DEAD-SPEECH CHECK: Elias dialogue/action guarded by isAlive('elias'); dead
//   entry redirects before image/text/choices
// IMAGE: images/debris_field.jpg [REUSE abandoned_section; EXISTS]
// ═════════════════════════════════════════════════════════════════
act3_lethal_elias_brace: {
  onEnter: () => {
    if (!isAlive("elias")) return "act3_lethal_mira_board";
  },
  get text() {
    if (!isAlive("elias")) return `The missing brace remains visible on the hull schematic. Security does not.`;
    return `The brace charges fire in order.

Seven Integrity points leave the board as the exterior frame turns away into the dark. The pressure front follows it out instead of moving toward habitation. B-four seats without anyone crossing the access line.

Elias reads the narrower structural envelope once.

"Threat contained. That side of the ship is no longer ours to spend."`;
  },
  choices: [
    { text: "Keep the missing brace on the schematic. Continue.", next: "act3_lethal_mira_board" }
  ],
  image: "images/debris_field.jpg"
},

// ═══ SCENE DECLARATION ═══════════════════════════════════════════
// SCENE_ID: act3_lethal_elias_end
// VERSION:  0.25.0        TICKET: Lethal opportunities
// PACKAGE:  Elias — Station B-Four
// SPINE:    off-spine, reached via act3_lethal_elias_order final choice
//
// PRECONDITIONS (live predicates, evaluated at render — never baked
// at author time; must remain true if later versions add death vectors):
//   requires: isAlive('elias')
//
// STATE WRITES (exhaustive — every mutation this scene can cause):
//   onEnter sets: state.dying.elias = 'held the line'
//   onEnter calls: kill('elias', state.dying.elias)
//   kill appends 'elias' to state.dead, decrements state.survivors by 1,
//     and sets state.deathCause.elias = state.dying.elias
//   writes NOTHING else.
//
// DEATH EXPOSURE: Elias dies onEnter
// DEAD-SPEECH CHECK: post-onEnter text contains no Elias dialogue or action;
//   only door state, pressure, suit feed, and witnessed absence
// IMAGE: images/corridor_variant.jpg [REUSE death-neutral corridor; EXISTS; NO BAKED TEXT]
// ═════════════════════════════════════════════════════════════════
act3_lethal_elias_end: {
  onEnter: () => {
    if (!isAlive("elias")) return "act3_lethal_mira_board";
    state.dying.elias = "held the line";
    kill("elias", state.dying.elias);
  },
  text: `The upstream door seats.

The pressure front breaks against B-four and falls away from habitation. Station B-four remains on the breach side. Its suit feed reaches zero before the section is safe to open.

The line holds. Security authority remains on the board with no living name beside it.`,
  choices: [
    { text: "Mark the station sealed. Continue.", next: "act3_lethal_mira_board" }
  ],
  image: "images/corridor_variant.jpg"
},

// ═══ SCENE DECLARATION ═══════════════════════════════════════════
// SCENE_ID: act3_lethal_mira_board
// VERSION:  0.25.0        TICKET: Lethal opportunities
// PACKAGE:  Mira — The Cross-Feed
// SPINE:    on-spine after every Elias-package outcome
//
// PRECONDITIONS (live predicates, evaluated at render — never baked
// at author time; must remain true if later versions add death vectors):
//   rendered branch requires: isAlive('mira')
//   otherwise onEnter redirects: faction_split
//
// STATE WRITES (exhaustive — every mutation this scene can cause):
//   choice 1 effects: state.supplies -= 9
//   choice 2 effects: state.integrity -= 8
//   lethal choice writes NOTHING here; destination onEnter owns death
//   writes NOTHING else.
//
// DEATH EXPOSURE: can kill mira via the final choice
// DEAD-SPEECH CHECK: Mira dialogue/action and lethal choice are guarded by
//   isAlive('mira'); dead entry redirects before image/text/choices
// IMAGE: images/quiet_mira.jpg [REUSE live Mira portrait; EXISTS; NO BAKED TEXT]
// ═════════════════════════════════════════════════════════════════
act3_lethal_mira_board: {
  onEnter: () => {
    if (typeof loadedGameVersion === "string" && loadedGameVersion < "0.25") {
      return "faction_split";
    }
    if (!isAlive("mira")) return "faction_split";
  },
  get text() {
    if (!isAlive("mira")) return `Engineering answers with automatic traces and no living engineer.`;

    let t = `The secondary transfer loop loses phase during a routine load shift.

Two pumps begin driving against each other. The remote cutout reports OPEN. Temperature says it is lying. Every correction adds heat to the same sealed bay.`;

    if (state.flags.coolant === "loop") {
      t += `\n\nThe earlier tank bought three weeks and a clean maintenance window. Both are spent. The welded contactor is a new failure on the same old line.`;
    } else if (state.flags.coolant === "medical") {
      t += `\n\nThe tank went to the sterile field. The transfer loop has no reserve left to drown the cross-feed.`;
    } else {
      t += `\n\nThe tank was split. Both systems lasted longer. Neither has enough margin now.`;
    }

    t += `\n\nMira asks the question she trusts.

"What's broken?"

She answers from the trace.

"Cross-feed contactor welded. Remote drive stripped. Twelve minutes until heat reaches the pressure envelope."

The sealed reserve can flood the bay and force the contactor open. The transfer collar can be cut loose, taking a permanent piece of the drive with it. The clean repair is local: one person at the phase board until both traces lie flat, with the access door sealed against the heat.`;

    t += `\n\nThe phase cannot flatten before the bay exceeds suit tolerance.`;

    if (state.romance.mira && state.pursuit.mira) {
      t += `\n\nMira removes her command key and places it in your palm.

"I am taking local. You can overrule me with coolant or with the collar. Do not confuse what was private with a veto."`;
    } else {
      t += `\n\nMira points once at the local station.

"I can flatten phase before the envelope fails. No one else can. You still have to authorize local."`;
    }
    return t;
  },
  get choices() {
    if (!isAlive("mira")) {
      return [{ text: "Continue without engineering.", next: "faction_split" }];
    }

    const volunteer = state.romance.mira && state.pursuit.mira;
    return [
      {
        text: "Crack the sealed reserve. Flood the hot bay and force the contactor open.",
        next: "act3_lethal_mira_reserve",
        effects: { supplies: -9 },
        requires: { supplies: { min: 9 } },
        alive: "mira"
      },
      {
        text: "Cut the transfer collar loose. Save Mira and accept a permanently weaker drive.",
        next: "act3_lethal_mira_collar",
        effects: { integrity: -8 },
        requires: { integrity: { min: 18 } },
        alive: "mira"
      },
      {
        text: volunteer
          ? "Accept her decision. Seal the bay behind her."
          : "Order Mira to local. Seal the bay behind her.",
        next: "act3_lethal_mira_end",
        alive: "mira"
      }
    ];
  },
  image: "images/quiet_mira.jpg"
},

// ═══ SCENE DECLARATION ═══════════════════════════════════════════
// SCENE_ID: act3_lethal_mira_reserve
// VERSION:  0.25.0        TICKET: Lethal opportunities
// PACKAGE:  Mira — The Cross-Feed
// SPINE:    off-spine, reached via act3_lethal_mira_board choice 1
//
// PRECONDITIONS (live predicates, evaluated at render — never baked
// at author time; must remain true if later versions add death vectors):
//   requires: isAlive('mira')
//
// STATE WRITES (exhaustive — every mutation this scene can cause):
//   writes NOTHING.
//
// DEATH EXPOSURE: none
// DEAD-SPEECH CHECK: Mira dialogue/action guarded by isAlive('mira'); dead
//   entry redirects before image/text/choices
// IMAGE: images/quiet_mira.jpg [REUSE live Mira portrait; EXISTS; NO BAKED TEXT]
// ═════════════════════════════════════════════════════════════════
act3_lethal_mira_reserve: {
  onEnter: () => {
    if (!isAlive("mira")) return "faction_split";
  },
  get text() {
    if (!isAlive("mira")) return `The reserve reads empty. Engineering has no living witness.`;
    return `The reserve opens into the hot bay.

Coolant turns to white vapor against the contactor housing. The false OPEN signal flickers, disappears, and returns true. Both phase traces settle on the same line.

The sealed reserve reads empty.

Mira watches the line remain flat for a full minute.

"Remote is true. Keep the reserve marked empty."`;
  },
  choices: [
    { text: "Log the empty reserve. Continue.", next: "faction_split" }
  ],
  image: "images/quiet_mira.jpg"
},

// ═══ SCENE DECLARATION ═══════════════════════════════════════════
// SCENE_ID: act3_lethal_mira_collar
// VERSION:  0.25.0        TICKET: Lethal opportunities
// PACKAGE:  Mira — The Cross-Feed
// SPINE:    off-spine, reached via act3_lethal_mira_board choice 2
//
// PRECONDITIONS (live predicates, evaluated at render — never baked
// at author time; must remain true if later versions add death vectors):
//   requires: isAlive('mira')
//
// STATE WRITES (exhaustive — every mutation this scene can cause):
//   writes NOTHING.
//
// DEATH EXPOSURE: none
// DEAD-SPEECH CHECK: Mira dialogue/action guarded by isAlive('mira'); dead
//   entry redirects before image/text/choices
// IMAGE: images/debris_field.jpg [REUSE abandoned_section; EXISTS]
// ═════════════════════════════════════════════════════════════════
act3_lethal_mira_collar: {
  onEnter: () => {
    if (!isAlive("mira")) return "faction_split";
  },
  get text() {
    if (!isAlive("mira")) return `The missing collar remains on the schematic. Engineering is empty.`;
    return `The collar separates on the third charge.

A section of transfer hardware turns slowly beyond the observation strip, still glowing at the cut. The cross-feed vanishes because half the system no longer exists.

The drive returns inside a smaller envelope.

Mira reads the limit twice.

"Cross-feed gone. Post the lower ceiling."`;
  },
  choices: [
    { text: "Put the lower ceiling on the board. Continue.", next: "faction_split" }
  ],
  image: "images/debris_field.jpg"
},

// ═══ SCENE DECLARATION ═══════════════════════════════════════════
// SCENE_ID: act3_lethal_mira_end
// VERSION:  0.25.0        TICKET: Lethal opportunities
// PACKAGE:  Mira — The Cross-Feed
// SPINE:    off-spine, reached via act3_lethal_mira_board final choice
//
// PRECONDITIONS (live predicates, evaluated at render — never baked
// at author time; must remain true if later versions add death vectors):
//   requires: isAlive('mira')
//
// STATE WRITES (exhaustive — every mutation this scene can cause):
//   romance-volunteer onEnter sets: state.dying.mira = 'would not leave the board'
//   ordered onEnter sets: state.dying.mira = 'finished the repair'
//   onEnter calls: kill('mira', state.dying.mira)
//   kill appends 'mira' to state.dead, decrements state.survivors by 1,
//     and sets state.deathCause.mira = state.dying.mira
//   writes NOTHING else.
//
// DEATH EXPOSURE: Mira dies onEnter
// DEAD-SPEECH CHECK: post-onEnter text contains no Mira dialogue or action;
//   only traces, temperature, completed work, and witnessed absence
// IMAGE: images/corridor_variant.jpg [REUSE death-neutral corridor; EXISTS; NO BAKED TEXT]
// ═════════════════════════════════════════════════════════════════
act3_lethal_mira_end: {
  onEnter: () => {
    if (!isAlive("mira")) return "faction_split";
    state.dying.mira = state.romance.mira && state.pursuit.mira
      ? "would not leave the board"
      : "finished the repair";
    kill("mira", state.dying.mira);
  },
  get text() {
    let t = `The phase traces meet.

The cross-feed opens. Contactor heat begins falling before the pressure envelope fails. The repair is clean.

The access door remains above safe-open temperature longer than the suit feed lasts. When the bay finally cools, the local station reads COMPLETE. The corrected phase persists through the next load shift.`;

    if (state.dying && state.dying.mira === "would not leave the board") {
      t += `\n\nHer command key remains in your palm.`;
    } else {
      t += `\n\nThe order remains in the command log.`;
    }
    return t;
  },
  choices: [
    { text: "Leave the completed trace on the board. Continue.", next: "faction_split" }
  ],
  image: "images/corridor_variant.jpg"
},

  faction_split: {
    onEnter: () => {
      if (state.crisisPath == null) return "act3_crisis_router"; // existing 0.26
      if (!state.flags.junctionChoice) return "offshift_open";   // 0.28
    },
    get text() {
      let t = `The crew is no longer one group.\n\n`;
      const shape = ideologyShape();
      const futureVoices = voicesFor("future");
      const livingVoices = voicesFor("living");

      if ((state.romance.mira && isAlive("mira")) || (state.romance.amara_tomas && isAlive("amara") && isAlive("tomas")) || (state.romance.lena && isAlive("lena"))) {
        t += `Those who have shared a bed move differently around each other. Knowledge travels. So does resentment.\n\n`;
      }

      if (state.flags.vault_sacrifice === "future") {
        t += `The vault is intact. Habitation is colder.\n\n`;
      } else if (state.flags.vault_sacrifice === "living") {
        t += `The living are warmer. The embryo counts are lower.`;
        if (isAlive("jiro")) t += ` Jiro has not spoken since the numbers updated.`;
        t += `\n\n`;
      }

      if (futureVoices.length) {
        t += `Future still has a voice: ${futureVoices.join(", ")}. They speak in numbers, order, and the mission that justified the escape.\n\n`;
      }
      if (livingVoices.length) {
        t += `Living still has a voice: ${livingVoices.join(", ")}. They speak in breath, plants, drawings, and the refusal to treat the present as cargo.\n\n`;
      }
      if (!futureVoices.length && !livingVoices.length) {
        t += `Too few remain for ideology to have a proper argument. The ship is mostly quiet.\n\n`;
      }

      if (shape === "future") t += `The ship has leaned Future. The cold is policy now.\n\n`;
      else if (shape === "living") t += `The ship has leaned Living. The warmth has a permanent cost on the screens.\n\n`;
      else t += `Neither side owns the ship. The argument is still live.\n\n`;

      const fav = favoritism();
      if (fav && crew[fav.favored] && isAlive(fav.favored)) {
        t += `More than one person has noticed how often you turn toward ${crew[fav.favored].name}. The observation is no longer private.\n\n`;
      }
      if (hasMark("sela", "spoken") && isAlive("sela")) {
        t += `Sela's yellow circles have multiplied across spare plating. The ritual is no longer private.\n\n`;
      }
      if (state.flags.crisis === "vent") {
        t += `The sealed section is still sealed. No one has asked to open it.\n\n`;
      }
      if (isAlive("elias")) t += `Elias has begun keeping his own informal watch list.`;
      if (isAlive("amara")) t += ` Amara has stopped pretending the hydroponics bay is only about food.`;
      t += `\n\nYou can feel the lines hardening. The next order will not be answered the same way by everyone.`;
      
      if (state.flags.cascade_truth === "open") t += `The cascade records are out. Trust is a different shape now.\n\n`;
      else if (state.flags.cascade_truth === "sealed") t += `You sealed the cascade records. Someone will unseal them eventually.\n\n`;
      if (hasMark("conflict", "held")) t += `You held the line when the corridor refused you. That fact is still walking around.\n\n`;
      else if (hasMark("conflict", "backed")) {
        t += `You backed down a step when the crew pushed.`;
        if (isAlive("elias")) t += ` Elias has not forgotten.`;
        t += ` Neither have the people who needed it.\n\n`;
      }
      if (state.flags.mid_arc === "future") t += `The mid-voyage work leaned Future. The living sections felt it.\n\n`;
      else if (state.flags.mid_arc === "living") t += `The mid-voyage work leaned Living. The vault sections felt it.\n\n`;
      if (state.flags.elias_power === "high") {
        t += isAlive("elias")
          ? `Elias still holds the security authority you gave him. That has not been free.\n\n`
          : `The security authority you gave Elias has no holder. The rules he wrote are still being followed.\n\n`;
      }
      if (hasMark("elias", "bonded") && isAlive("elias")) t += `Elias still answers faster when you ask without an audience.\n\n`;
      if (hasMark("tomas", "bonded") && isAlive("tomas")) t += `Tomas's silence toward you is less braced.\n\n`;
      if (hasMark("jiro", "bonded") && isAlive("jiro")) t += `Jiro's reports carry an extra careful line.\n\n`;
      const debtors = typeof relationshipDebtors === "function" ? relationshipDebtors() : [];
      if (debtors.length) {
        t += `Some of the living have gone quiet in practical ways — not speeches, just fewer offers: ${debtors.map(k => crew[k] ? crew[k].name : k).join(", ")}.\n\n`;
      }
      if (state.past_known_by && state.past_known_by.lena && isAlive("lena")) {
        t += `Lena knows enough of your ground-side file to factor it into medical priorities. She has not made a speech about it.\n\n`;
      }
      if (state.flags.past === "threatened" && isAlive("elias")) {
        t += `Elias has not spent the file. He has also not forgotten the threat.\n\n`;
      }
      if (state.flags.mira_favor && isAlive("mira")) {
        t += `Mira's one-time stock release is already spent. She will not invent another.\n\n`;
      }
      if (state.flags.elias_power === "limited" && isAlive("elias")) t += `Elias works without freelancing. He has not forgotten the leash.\n\n`;
      if (state.flags.past === "owned") {
        t += isAlive("elias")
          ? `Your past is not only Elias's private resource now. You owned it once in front of him.\n\n`
          : `You owned your past out loud once, in front of Elias. That was the last time it was anyone's leverage.\n\n`;
      }
      else if (state.flags.past === "deflected" || state.flags.past === "denied") {
        t += isAlive("elias")
          ? `Your past is still a lever. Elias has not spent it yet — or has not needed to.\n\n`
          : `Your past is still on file somewhere. The man who knew where stopped being able to say.\n\n`;
      }
      if (isAlive("lena") && state.dying && state.dying.lena) t += `Lena's clock is still running. The crew knows.\n\n`;
      if (state.cohesion <= 0) t += `Cohesion is gone. People still obey the minimum. They do not offer anything extra. Conversations stop when you enter a room.\n\n`;
      else if (state.cohesion <= 12) t += `Cohesion is near the floor. Offers of help arrive late or not at all.\n\n`;
      if (state.supplies <= 0) t += `Supplies are at zero. The next real expenditure will come out of bodies or hull.\n\n`;
      else if (state.supplies <= 8) t += `Supplies are thin enough that every request is already an argument.\n\n`;

return t;
    },
    choices: [
      { text: "Call them together and force the fracture into the open.", next: "reckon_summary", effects: { cohesion: -3, integrity: -2 }, lean: { living: 2 }, requires: { cohesion: { min: 25 }, survivors: { min: 4 } }, flag: { reckon: "public" } },
      { text: "Keep the work moving. Ignore the sides until you cannot.", next: "reckon_summary", effects: { cohesion: 1, supplies: -2, integrity: 2 }, requires: { supplies: { min: 2 } }, flag: { reckon: "suppress" } },
      { text: "Pick a side yourself and make it visible.", next: "reckon_summary", effects: { cohesion: -6, integrity: 1 }, lean: { future: 2 }, requires: { survivors: { min: 5 }, cohesion: { min: 15 } }, flag: { reckon: "public" } },
      { text: "Give them the right to remember the dead and the near-loss in their own words.", next: "reckon_summary", effects: { cohesion: 2 }, flag: { reckon: "memory" }, lean: { living: 1 } },
      { text: "Tell them the truth you have been carrying — planet, odds, and what remains.", next: "reckon_summary", effects: { cohesion: 1 }, flag: { reckon: "truth" }, lean: { living: 1 } }
    ]
  },
  reckon_public: {
    get text() {
      let t = `You gather the living in the common area.

You do not soften what was done. You name the dead if there are dead. You name the living. You state the costs in supplies, hull, and time.

Some cry. Some stare at the floor.`;
      if (isAlive("tomas")) t += ` Tomas nods through the entire accounting.`;
      t += `\n\n`;
      if (isAlive("mira")) {
        t += `When it is finished, Mira stands.

"We're still here. That's the only order that matters."

The others rise, unevenly.`;
      } else {
        t += `When it is finished, the room does not produce a speech. The others rise, unevenly.`;
      }
      return t;
    },
    choices: [
      { text: "Hold the room a moment longer. Then decide the mission.", next: "sun_payoff", effects: { cohesion: 2 } },
      { text: "End it. Make the final order now.", next: "sun_payoff" }
    ]
  },
  reckon_suppress: {
    get text() {
      let t = `You issue the order: no further discussion of the crisis. Work continues. Rations continue. The ship continues.

`;
      if (isAlive("elias")) t += `Elias enforces it without being asked.\n\n`;
      else t += `Compliance is enforced without being asked.\n\n`;
      t += `The silence that follows is different from the earlier silence. It has edges.

`;
      if (isAlive("tomas")) t += `Tomas stops leading the quiet evening gatherings. `;
      if (isAlive("amara")) t += `Amara no longer meets anyone's eyes.`;
      t += `\n\nOrder holds. Something else does not.`;
      return t;
    },
    choices: [
      { text: "Let the silence stand. Make the final order.", next: "sun_payoff", effects: { cohesion: -2 } },
      { text: "Break it once — name one cost — then decide the mission.", next: "sun_payoff", effects: { cohesion: 1 } }
    ]
  },
  reckon_memory: {
    get text() {
      if (state.flags.crisis === "vent") {
        let t = `You give the remaining survivors the right to decide how the dead are remembered.\n\nThey keep Sela's last circle on the bulkhead. They keep Amara's key on a shelf in the common area.`;
        t += isAlive("tomas")
          ? ` Tomas speaks the three names once, carefully, and then does not speak them again.`
          : ` The three names are read off the manifest once, by whoever is holding it, and then not again.`;
        t += `\n\nAfter that, the ship feels slightly less like a place where people disappear without record.`;
        return t;
      }
      return `You give the survivors the right to decide how the near-loss is remembered.

They do not make a ceremony. They simply refuse to pretend it did not happen. Sela's yellow circle stays where it is — a quiet adult mark no one has asked to take down.

The ship continues.`;
    },
    choices: [
      { text: "Let the memory stand. Make the final order.", next: "sun_payoff", effects: { cohesion: 2 } },
      { text: "Close it. The mission still needs a decision.", next: "sun_payoff" }
    ]
  },
  reckon_truth: {
    text: `You tell them the truth you have been carrying.

The rogue planet may have water under the ice. It may have nothing. Fourteen months is a long time for a damaged ship and a small group of people who have already begun to break.

You ask what they still want from the time that remains.

The answers are not unified. Some want the planet. Some want speed. Some want comfort. Some want a final transmission aimed at nothing in particular.

You listen. Then you decide.`,
    choices: [
      { text: "You have heard enough. Make the final order.", next: "sun_payoff" },
      { text: "Ask one more person what they still want. Then decide.", next: "sun_payoff", effects: { cohesion: 2, supplies: -1 } }
    ]
  },
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

  sun_payoff: {
    get text() {
      let t = `The yellow marks have become a fact of the ship.\n\n`;
      if (isAlive("sela")) {
        t += `Sela does not ask permission for the next circle. She asks what you will do with the ones already there.\n\n`;
        t += `"If you paint them over, the corridor becomes regulation again. If you leave them, people will keep using them as landmarks — and as an argument that warmth is not a soft metric."\n\n`;
      } else {
        t += `Their author is gone. The pigment remains. Someone will decide whether the ship keeps them.\n\n`;
      }
      if (isAlive("jiro")) t += `Jiro: "They are not navigation. They are also the only consistent marks on a deck that lost half its signage."\n\n`;
      if (isAlive("elias")) t += `Elias wants them gone. "Symbols that are not orders become competing orders."\n\n`;
      t += `This is not decoration. It is a doctrine decision.`;
      return t;
    },
    get choices() {
      const opts = [];
      if (isAlive("sela") || hasMark("sela", "spoken")) {
        opts.push({ text: "Let the yellow marks stand as unofficial doctrine.", next: "ship_memory_payoff", effects: { cohesion: 5 }, flag: { sun_doctrine: "doctrine" }, lean: { living: 3 }, affinity: { sela: 10, jiro: 4, elias: -6 }, trust: { sela: 8 } });
      }
      opts.push({ text: "Order them removed. One ship, one visual language.", next: "ship_memory_payoff", effects: { cohesion: -4, integrity: 1 }, flag: { sun_doctrine: "scrubbed" }, lean: { future: 2 }, affinity: { elias: 6, sela: -12, jiro: -4 }, trust: { sela: -10 } });
      opts.push({ text: "Leave them without a speech. Neither doctrine nor ban.", next: "ship_memory_payoff", effects: { cohesion: 1 }, flag: { sun_doctrine: "silent" }, lean: { living: 1 } });
      return opts;
    },
    image: "images/sela_ritual.jpg"
  },

  ship_memory_payoff: {
    get text() {
      const mem = state.flags.ship_memory;
      let t = `Before the last orders, the ship collects its debts.\n\n`;
      if (mem === "jury_rig") {
        t += `Deck 4's thin patch has been humming at the edge of tolerance for days. Any hard course change or full burn will ask it to hold under stress it was never given material for.\n\n`;
      } else if (mem === "open_wound") {
        t += `Deck 4 never got its seal. The section is living on pressure luck and remote valves. A destination burn will find the soft place.\n\n`;
      } else if (mem === "proper_seal") {
        t += `Deck 4's proper seal still holds. That feedstock is gone from the galley math — but the bulkhead does not argue when the drive spins up.\n\n`;
      } else {
        t += `Structural memory is quiet for once. Other debts are louder.\n\n`;
      }
      if (state.flags.sun_doctrine === "doctrine") t += `The yellow marks remain. People orient by them without being told to.\n\n`;
      else if (state.flags.sun_doctrine === "scrubbed") t += `Where the yellow was, there is only primer and the ghost of a circle.\n\n`;
      if (state.flags.departure_truth === "plural") t += `No single boarding story won. The crew lives with the friction.\n\n`;
      else if (state.flags.departure_truth === "records") t += `The records version of boarding is the one the officers cite when they need a hard sentence.\n\n`;
      t += `The last choice is still yours. The ship has already made some of them permanent.`;
      return t;
    },
    choices: [
      { text: "Face the final orders.", next: "final_choice" }
    ],
    image: "images/bulkhead.jpg"
  },

  patch_fails: {
    text: `The course change loads Deck 4.

The jury-rig — or the absence of a seal — gives a sound like a metal animal losing an argument. Remote valves slam. Hull numbers step down in public view.

You can still hold the destination. You will hold it with a wounded ring and a crew that watched the schematic predict this.`,
    choices: [
      { text: "Hold course anyway. Pay the structural cost.", next: "ending_check", effects: { integrity: -12, cohesion: -4 }, flag: { final: "hold", patch: "failed" } },
      { text: "Abort the hard burn. Choose a softer final path.", next: "final_choice", effects: { integrity: -3, cohesion: 2 }, flag: { patch: "aborted" } }
    ],
    image: "images/vent.jpg"
  },

  final_choice: {
    get text() {
      let t = `The remaining decisions are the ones that will define what the Sunsplitter becomes.\n\n`;
      if (state.flags.planet === "committed") {
        t += `The course is still locked on the rogue planet. You can hold it, alter it, or abandon it.\n\n`;
      } else {
        t += `You still have no destination. You can set one, or refuse the idea that a destination is required.\n\n`;
      }
      const debt = typeof relationshipDebtors === "function" ? relationshipDebtors() : [];
      if (debt.length) {
        t += `Some of the people you still need have been rationing their help: ${debt.map(k => crew[k] ? crew[k].name : k).join(", ")}.\n\n`;
      }
      t += `What do you order?`;
      return t;
    },
    get choices() {
      const debt = typeof relationshipDebtors === "function" ? relationshipDebtors() : [];
      const opts = [];
      // Hold course needs Jiro or Mira trusting enough — structural dependence
      const holdNext = (state.flags.ship_memory === "jury_rig" || state.flags.ship_memory === "open_wound") ? "patch_fails" : "ending_check";
      if (isAlive("jiro") && (state.trust.jiro || 0) >= 35 && !debt.includes("jiro")) {
        opts.push({ text: "Hold course for the rogue planet. We finish what we started.", next: holdNext, flag: { final: "hold" }, requires: { integrity: { min: 30 }, supplies: { min: 10 } }, lean: { future: 3 }, alive: "jiro" });
      } else if (isAlive("mira") && (state.trust.mira || 0) >= 40 && !debt.includes("mira")) {
        opts.push({ text: "Hold course — Mira can keep the drive honest even without Jiro's full voice.", next: holdNext, flag: { final: "hold" }, requires: { integrity: { min: 28 }, supplies: { min: 10 } }, lean: { future: 2 }, alive: "mira" });
      } else {
        opts.push({ text: "Hold course anyway. Navigation will be rougher without full crew buy-in.", next: holdNext, flag: { final: "hold" }, effects: { integrity: -4, cohesion: -3 }, requires: { integrity: { min: 35 }, supplies: { min: 12 } }, lean: { future: 2 } });
      }
      // Comfort path needs living-side trust
      if (!debt.includes("amara") && !debt.includes("tomas")) {
        opts.push({ text: "Abandon the destination. Spend the remaining fuel on speed and comfort.", next: "ending_check", flag: { final: "comfort" }, requires: { supplies: { min: 15 } }, lean: { living: 3 } });
      } else {
        opts.push({ text: "Push for comfort anyway — even if some of the living will not thank you.", next: "ending_check", flag: { final: "comfort" }, effects: { cohesion: -4 }, requires: { supplies: { min: 18 } }, lean: { living: 2 } });
      }
      opts.push({ text: "Turn the ship. Send a final transmission into the dark and then go quiet.", next: "ending_check", flag: { final: "transmission" }, requires: { integrity: { min: 20 } } });
      opts.push({ text: "Keep them alive one day at a time. No speeches. No grand purpose.", next: "ending_check", flag: { final: "endure" }, lean: { living: 2 } });
      return opts;
    }
  },
  ending_check: {
    text: ``,
    choices: []
  }
});
