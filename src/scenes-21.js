// Sunsplitter — scenes-21.js
// 0.28.1c size hygiene. Pure mechanical. late: tomas cost (stores and structure results are its replies, SUN-DIET-REPLY-FOLD-01)
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

    // SUN-CALLBACKS-01: the stores decision, cited by the man who keeps the ledger of mouths. Text only.
    const stores = state.flags.stores === "seize"
      ? `\n\n"You seized the private stores before I came aboard; I heard it from the two who kept them. They paid then. The mouths pay now. I am only saying it so the ledger is in one place."`
      : state.flags.stores === "vote"
        ? `\n\n"You put the stores to a vote once. Whoever pays this one did not get a vote."`
        : "";
    return `The recovered annex collar begins peeling away from the spine.

Eight points of viable food stock remain behind it: root cultures, water algae, the seed trays Tomas carried home. Cut the annex loose and the ship keeps pressure. Torque the hull against the drift and the collar may reseat, at a permanent cost to the spine.

The manual reseat takes twelve minutes. The suit has nine at the present leak rate. Tomas is already at the rack.

"Who pays if we cut it loose? The mouths. Who pays if we keep it? Me, if you leave the stock and hull where they are."${stores}

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
      // SUN-DIET-REPLY-FOLD-01 (L-057): the non-lethal results are the replies; act3_lethal_tomas_stores
      // and act3_lethal_tomas_structure retired. ${name} lines are gated on the stranded crew member.
      return [
        {
          text: `Spend reserve oxygen and patch compound. Bring ${name} through.`,
          next: "act3_lethal_elias_order",
          effects: { supplies: -8 },
          requires: { supplies: { min: 8 } },
          alive: "tomas",
          reply: [
            `Reserve oxygen enters the service throat hard enough to make the bulkhead ring. Patch compound follows in a white sheet.`,
            { who: stranded, text: `${name} crosses before the temporary pressure fails. Tomas closes the manual release only after the living body is on this side.` },
            { who: "tomas", text: `"Eight from stores," he says. "Put it beside the name."` }
          ]
        },
        {
          text: "Quench the outer embryo rack. Use its nitrogen to hold the throat.",
          next: "act3_lethal_elias_order",
          effects: { embryos: -8 },
          requires: { embryos: { min: 8 } },
          alive: "tomas",
          reply: [
            `The rack quench is clean.`,
            { who: stranded, text: `Nitrogen leaves the vault, holds the service throat, and carries ${name} back through it. Eight viability points vanish without making a sound.` },
            { who: "tomas", text: `Tomas releases the hatch when the crossing is complete. "Eight from the vault," he says. He keeps ${name}'s suit tag beside the new count.` }
          ]
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
        next: "act3_lethal_elias_order",
        effects: { supplies: -8 },
        requires: { supplies: { min: 8 } },
        alive: "tomas",
        reply: [
          `The collar charges fire. The annex falls away.`,
          `Eight points leave Supplies before the green strip becomes too small to see.`,
          { who: "tomas", text: `Tomas watches it without touching the suit. "The mouths pay," he says. "Write that. Not me. Not this time."` }
        ]
      },
      {
        text: "Torque the hull. Let the spine pay and reseat the collar remotely.",
        next: "act3_lethal_elias_order",
        effects: { integrity: -7 },
        requires: { integrity: { min: 17 } },
        alive: "tomas",
        reply: [
          `The Sunsplitter rolls three degrees against the drift.`,
          `The spine takes the load. Seven Integrity points leave the board. The annex collar reseats with a sound felt through every deck.`,
          { who: "tomas", text: `Tomas reads the new fracture line, then the green strip. "Seven from Integrity," he says. He keeps the annex pressure trace beside the new fracture line.` }
        ]
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
});
