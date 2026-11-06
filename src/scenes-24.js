// Sunsplitter — scenes-24.js
// 0.28.1c size hygiene. Pure mechanical. late: mira board + reserve + collar + end
// Strict scene shape only: text | choices | onEnter | image
registerScenes({

act3_lethal_mira_board: {
  onEnter: () => {
    if (isGameVersionBefore(loadedGameVersion, "0.25")) {
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
    // SUN-CALLBACKS-01: the answer she was given at the schematic, applied. Text only.
    if (hasMark("mira", "drive_first")) t += `\n\n"You told me once the ship comes first. On the board then. Still on the board. Apply it."`;
    else if (hasMark("mira", "people_first")) t += `\n\n"You told me once the people come first. I am a person. I am also the repair. Both readings are on the board."`;
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
  get choices() {
    // SUN-ROMANCE-ARC-02 (L-050): a partner is asked for the root cause before the watch resumes.
    return [{ text: "Log the empty reserve. Continue.", next: state.romance.mira ? "mira_root_cause" : "faction_split" }];
  },
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
  get choices() {
    // SUN-ROMANCE-ARC-02 (L-050): a partner is asked for the root cause before the watch resumes.
    return [{ text: "Put the lower ceiling on the board. Continue.", next: state.romance.mira ? "mira_root_cause" : "faction_split" }];
  },
  image: "images/debris_field.jpg"
},

// ═══ SCENE DECLARATION ═══════════════════════════════════════════
// SCENE_ID: mira_root_cause           TICKET: SUN-ROMANCE-ARC-02 (L-050, Wave 1)
// PRE: Mira living and romance.mira; reached only from act3_lethal_mira_reserve or
//   act3_lethal_mira_collar, i.e. after the Commander overrode local to keep her.
// WRITES: none on entry. The three answers write flags.mira_root_cause ("drive" | "you" |
//   "both") plus affinity/trust; no resource change.
// DEATH: none. DEAD SPEECH/APPEARANCE: entry redirects to faction_split when Mira is dead or
//   not a partner (onEnter + living-cast contract in scenes-55).
// IMAGE: REUSE images/quiet_mira.jpg (the board scene's own plate). No new art.
// ═════════════════════════════════════════════════════════════════
mira_root_cause: {
  onEnter: () => {
    if (!isAlive("mira") || !state.romance.mira) return "faction_split";
  },
  get text() {
    if (!isAlive("mira")) return `Engineering answers with automatic traces and no living engineer.`;
    let t = `The bay cools by the numbers. Mira stays at the phase board until the line has been flat for the five minutes she gives it. Then she turns from the console to you.\n\n`;
    if (state.pursuit.mira) {
      t += `"I handed you my key and told you private was not a veto. You overrode local anyway. The ledger has the margin you spent. It does not have the reason."\n\n`;
    } else {
      t += `"I told you I could flatten phase before the envelope failed, and you spent the ship's margin to keep me out of that bay. The ledger has the margin. It does not have the reason."\n\n`;
    }
    if (state.flags.pursuit_mira_cost === "disclosed") {
      t += `"The status board already carries the first night's audio. Everyone aboard has a root cause they would assign to this. Their variance is not my problem. Yours is."\n\n`;
    } else if (state.flags.pursuit_mira_cost === "partial") {
      t += `"The status board carries the vault talk and not the rest. The crew will assign a root cause from half a record. That is their variance. I want yours."\n\n`;
    } else {
      t += `"The crew will read the margin on the board. They will not read the rest. They will assign a root cause from outside the bay. I want yours."\n\n`;
    }
    t += `"Root cause. Was it the drive, or was it me? I cannot verify the answer from the trace. Say it anyway."`;
    return t;
  },
  get choices() {
    if (!isAlive("mira")) return [{ text: "Continue without engineering.", next: "faction_split" }];
    return [
      { text: "The drive. The ship needs its engineer.", next: "mira_root_cause_logged", flag: { mira_root_cause: "drive" }, trust: { mira: 4 } },
      { text: "You.", next: "mira_root_cause_logged", flag: { mira_root_cause: "you" }, affinity: { mira: 8 } },
      { text: "Both. The variance is unresolved.", next: "mira_root_cause_logged", flag: { mira_root_cause: "both" }, affinity: { mira: 4 }, trust: { mira: 2 } }
    ];
  },
  image: "images/quiet_mira.jpg"
},

// ═══ SCENE DECLARATION ═══════════════════════════════════════════
// SCENE_ID: mira_root_cause_logged    TICKET: SUN-ROMANCE-ARC-02 (L-050, Wave 1)
// PRE: Mira living; flags.mira_root_cause set by mira_root_cause. Her answer to the answer.
// WRITES: none. DEATH: none. DEAD SPEECH/APPEARANCE: entry redirects when Mira is dead.
// IMAGE: REUSE images/quiet_mira.jpg. No new art.
// NOTE: the "you" branch spends CHARACTER_BIBLE's spoken self fault-log ("Mira. Error. ...
//   Corrective action: ...") here, once.
// ═════════════════════════════════════════════════════════════════
mira_root_cause_logged: {
  onEnter: () => {
    if (!isAlive("mira")) return "faction_split";
    if (!state.flags.mira_root_cause) return "faction_split";
  },
  get text() {
    if (!isAlive("mira")) return `Engineering answers with automatic traces and no living engineer.`;
    let t;
    if (state.flags.mira_root_cause === "drive") {
      t = `She turns back to the board before she answers.\n\n"Logged. Root cause, drive. Confidence sixty percent. The other forty is not yours to measure."\n\nA pause the length of a trace settling.\n\n"Sixty is more than I had."`;
    } else if (state.flags.mira_root_cause === "you") {
      t = `"Then the ledger is wrong, and I know what to file."\n\nShe says it to the board, not to you, in the voice she keeps for the fault log.\n\n"Mira. Error. Public margin spent on a private root cause. Root cause: me. Corrective action: none available. Status: operating."\n\nShe does not turn around for a while. When she does, the reading is steady.`;
    } else {
      t = `"Variance unresolved."\n\nShe writes it on the status board, beside the number you just paid.\n\n"That is a measurement. I can run a drive under a measurement. I could not run one under a rumor."`;
    }
    t += `\n\nThe traces hold flat. She posts the numbers that are true and nothing that is not.`;
    return t;
  },
  choices: [
    { text: "Back to the watch.", next: "faction_split" }
  ],
  image: "images/quiet_mira.jpg"
},

// ═══ SCENE DECLARATION ═══════════════════════════════════════════
// SCENE_ID: act3_lethal_mira_end
// VERSION:  0.25.0        TICKET: Lethal opportunities
// PACKAGE:  Mira — The Cross-Feed
// SPINE:    off-spine, reached via act3_lethal_mira_board final choice;
//   routes through the one-shot Elias pair consequence when eligible
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
// IMAGE: images/corridor_variant.jpg [REUSE; shows Amara + Jiro, NOT death-neutral; engine renders
//   corridor_variant_2.jpg unless both are alive and aboard; EXISTS; NO BAKED TEXT]
// ═════════════════════════════════════════════════════════════════
act3_lethal_mira_end: {
  onEnter: () => {
  // SUN-LEGACY-DEATHBEAT-01: a resume without the sceneEntered marker re-runs onEnter after this
  // scene already wrote the death; render the beat instead of redirecting past it.
    if (state.dead.includes("mira") && state.deathCause &&
        ["would not leave the board", "finished the repair"].includes(state.deathCause.mira)) return;
    if (!isAlive("mira")) {
      return isAlive("elias") && attributableDeath("mira") && !state.flags.pair_shield
        ? "pair_shield_cold"
        : "faction_split";
    }
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
  get choices() {
    const next = isAlive("elias") && attributableDeath("mira") && !state.flags.pair_shield
      ? "pair_shield_cold"
      : "faction_split";
    return [
      { text: "Leave the completed trace on the board. Continue.", next }
    ];
  },
  image: "images/corridor_variant.jpg"
},

});
