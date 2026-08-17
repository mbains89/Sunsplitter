// Sunsplitter — scenes-late-b.js
// Split from scenes-late.js (0.28.1c size hygiene). Pure mechanical.
// Act 3 lethals: Tomas_end + Elias + Mira packages.
// Strict scene shape only: text | choices | onEnter | image
// Extends global `scenes` object.

registerScenes({


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

});
