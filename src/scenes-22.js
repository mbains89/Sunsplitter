// Sunsplitter — scenes-22.js
// 0.28.1c size hygiene. Pure mechanical. late: tomas end (structure result is a reply on act3_lethal_tomas_cost, SUN-DIET-REPLY-FOLD-01)
// Strict scene shape only: text | choices | onEnter | image
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
// IMAGE: images/corridor_variant.jpg [REUSE; shows Amara + Jiro, NOT death-neutral; engine renders
//   corridor_variant_2.jpg unless both are alive and aboard; EXISTS; NO BAKED TEXT]
// ═════════════════════════════════════════════════════════════════
act3_lethal_tomas_end: {
  onEnter: () => {
  // SUN-LEGACY-DEATHBEAT-01: a resume without the sceneEntered marker re-runs onEnter after this
  // scene already wrote the death; render the beat instead of redirecting past it.
    if (state.dead.includes("tomas") && state.deathCause &&
        ["refused the order and paid for it", "went back for the living and did not return"].includes(state.deathCause.tomas)) return;
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
  // SUN-DEATH-REACTIONS-01: one living voice answers the death, once, at the top of the next screen.
  get choices() {
    const where = state.dying && state.dying.tomas === "refused the order and paid for it" ? "Service throat, past the inner line" : "Annex collar, beyond the hatch";
    const reply = isAlive("amara")
      ? { who: "amara", text: `Amara opens her ledger to his page and leaves it open. "He kept the books on everyone else. Somebody has to keep his."` }
      : isAlive("lena")
        ? { who: "lena", text: `Lena closes his chart herself. "Exposure. He was the only patient I ever had who asked who else was waiting."` }
        : isAlive("jiro")
          ? { who: "jiro", text: `Jiro logs it before anyone asks. "Brother Tomas. ${where}. Final position."` }
          : `The meal rota prints with one name fewer. Nobody sets the table.`;
    return [
      { text: "Post the cause. Continue.", next: "act3_lethal_elias_order", reply: [reply] }
    ];
  },
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
});
