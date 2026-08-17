// Sunsplitter — scenes-23.js
// 0.28.1c size hygiene. Pure mechanical. late: elias order + sealant + brace + end
// Strict scene shape only: text | choices | onEnter | image
registerScenes({

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
});
