// Sunsplitter — scenes-21.js
// 0.28.1c size hygiene. Pure mechanical. late: tomas cost + stores
// Strict scene shape only: text | choices | onEnter | image
registerScenes({

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
});
