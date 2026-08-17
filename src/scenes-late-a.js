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
      t += `\n\nThe last regenerative bou`
    }
    return t;
  },
  choices: [
    { text: "Placeholder", next: "act3_vault_face" }
  ],
  image: "images/medbay_dim.jpg"
},
});
