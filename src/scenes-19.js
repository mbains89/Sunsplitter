// Sunsplitter — scenes-19.js
// 0.28.1c size hygiene. Pure mechanical. late: lena clock + sterile
// Strict scene shape only: text | choices | onEnter | image
registerScenes({

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
  image: "images/act3_lethal_lena_clock.jpg"
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
// IMAGE: images/act3_lethal_lena_sterile.jpg [LOCKED ART-INTEGRATION-R2 plate]
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
  image: "images/act3_lethal_lena_sterile.jpg"
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
// IMAGE: images/act3_lethal_lena_power.jpg [LOCKED ART-INTEGRATION-R2 plate]
// ═════════════════════════════════════════════════════════════════
});
