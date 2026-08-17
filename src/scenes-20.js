// Sunsplitter — scenes-20.js
// 0.28.1c size hygiene. Pure mechanical. late: lena power + end
// Strict scene shape only: text | choices | onEnter | image
registerScenes({

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
});
