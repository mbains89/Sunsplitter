// Sunsplitter — scenes-24.js
// 0.28.1c size hygiene. Pure mechanical. late: mira board + reserve + collar + end
// Strict scene shape only: text | choices | onEnter | image
registerScenes({

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
  image: "images/act3_lethal_mira_end.jpg"
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
