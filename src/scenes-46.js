// Sunsplitter — scenes-46.js
// 0.28.2 size hygiene. Pure mechanical. promises: line + direct
// Strict scene shape only: text | choices | onEnter | image
registerScenes({

  prom_line: {
    image: "images/medbay_dim.jpg",
    onEnter: () => {
      if (state.promises.lena !== "made" || !isAlive("lena")) return "prom_direct";
      const v = (state.flags.custody_answer === "severed" && isAlive("mira")) ? "mira"
              : ["jiro", "vess"].find(k => isAlive(k));
      if (!v) return "prom_direct";
      state.flags.prom_line_other = v;
    },
    get text() {
      const v = state.flags.prom_line_other;
      if (!v || !crew[v] || !isAlive(v) || !isAlive("lena")) return `The med-loop passes its load test. The watch continues.`;
      const intro = v === "mira"
        ? `The same fault drops Mira where she stands. The cold she carried out of the junction cut has been waiting for exactly this much slack.

"I priced the cut when I made it," she manages. "The bill came early. Don't refinance me with her line."`
        : v === "jiro"
        ? `The fault arcs through the nav bay first. Jiro is carried in with burns already going gray at the edges.

"I've run out of margin twice before," he says. "Take the reading, Commander. Don't round it kindly."`
        : `The fault takes the relay bench with it. Vess comes in walking wrong and insisting she isn't.

"Dawnbreak protocol for shared air was: youngest yields," she says, flat. "I never got to yield. Filed, in case it matters now."`;
      return `The med-loop fails its load test mid-cycle. One sustained line survives the fault.

Lena is on the floor beside her own crash cart before the alarm finishes. The exposure the circuit never reversed is finally collecting.

${intro}

Lena, half-conscious, finds enough voice for one line. "Two patients. One line." It costs her breath she does not have. "You know my orders. I wrote them on you."`;
    },
    get choices() {
      const v = state.flags.prom_line_other;
      const name = v && crew[v] ? crew[v].first : "them";
      return [
        { text: "Hold the line where it is.",
          next: "prom_line_keep",
          effects: { supplies: -2 },
          flag: { prom_line_held: true },
          remember: `You kept the promise to Lena. The line stayed with ${name}.` },
        { text: "Move the line to Lena.",
          next: "prom_line_break",
          remember: `You broke the promise to Lena. ${name} died on the shared line.` }
      ];
    }
  },

  // PRE: from prom_line choice 1 | WRITES: onEnter promises.lena="kept" (idempotent) | DEATH: none | IMG: reuse
  prom_line_keep: {
    image: "images/medbay_dim.jpg",
    onEnter: () => {
      if (state.promises.lena === "made") state.promises.lena = "kept";
    },
    get text() {
      const v = state.flags.prom_line_other;
      const name = v && crew[v] ? crew[v].first : "The other patient";
      let t = `The line stays. ${name}'s trace steadies by degrees while Lena rides the crash on her own margin and loses a piece of it permanently.`;
      if (isAlive("lena")) {
        t += `\n\nShe surfaces two days later, slower by a measurable fraction, and finds you before you find her.

"Casualty report: nobody. Cost report: some of me. You held. Charted." A beat. "Don't visit for a while. I'm bad company when I'm this grateful."`;
      }
      return t;
    },
    choices: [ { text: "Leave both numbers on the board. Continue.", next: "prom_direct" } ]
  },

  // PRE: from prom_line choice 2 | WRITES: onEnter kill(victim) + promises.lena="broken" (idempotent) | DEATH: victim dies onEnter | IMG: reuse
  prom_line_break: {
    image: "images/covered_body.jpg",
    onEnter: () => {
      if (state.promises.lena === "made") {
        state.promises.lena = "broken";
        if (state.flags.prom_line_other) {
          kill(state.flags.prom_line_other, "lost the shared medical line to Lena");
        }
      }
    },
    get text() {
      const v = state.flags.prom_line_other;
      const name = v && crew[v] ? crew[v].first : "The other trace";
      let t = `The line moves. Lena's trace comes back under the red.

${name}'s does not.`;
      if (isAlive("lena")) {
        t += `\n\nShe is awake within the day, and the first thing she reads is the board.

"You said: I will never kill one of them to keep you." Chart-flat. "Correction filed. Update my allergies: your mercy."

Med-bay stays open after that. She does not.`;
      }
      return t;
    },
    choices: [ { text: "Sign the board. Continue.", next: "prom_direct" } ]
  },

  // PRE: promises.mira made && isAlive(mira) | WRITES: none | DEATH: none | IMG: reuse
  prom_direct: {
    image: "images/power_crisis.jpg",
    onEnter: () => {
      if (state.promises.mira !== "made" || !isAlive("mira")) return "faction_split";
    },
    text: () => `The offer arrives on every console at once, in the flat idiom of the ship's founders: restore Earth-era directive authority. Every safety interlock, ration schedule, and triage rule re-bound to the commissioning library. Signed by the dead. Rated for a species.

Mira has already modeled it twice.

"Under their rules the hull fails eleven percent less often and we get zero votes. Both numbers are load-bearing."`,
    choices: [
      { text: "Refuse the binding. The living keep authority.",
        next: "prom_direct_keep",
        effects: { integrity: -1 },
        remember: "You refused the Earth-era binding. The living kept authority." },
      { text: "Accept the binding. The ark runs safer under the old rules.",
        next: "prom_direct_break",
        effects: { integrity: 2 },
        remember: "You bound the ark to directives written by the dead." }
    ]
  },

  // PRE: from prom_direct choice 1 | WRITES: onEnter promises.mira="kept" (idempotent) | DEATH: none | IMG: reuse
  prom_direct_keep: {
    image: "images/power_crisis.jpg",
    onEnter: () => {
      if (state.promises.mira === "made") state.promises.mira = "kept";
    },
    get text() {
      let t = `The refusal costs what refusals cost. The commissioning library thins as the arbitration cores are reclaimed; some of the old world goes with it, unread forever.`;
      if (isAlive("mira")) {
        t += `\n\nMira starts the deletion herself. "Confirmed. Deleting their signatures from the interlocks. It will be quieter in the walls."

She does not say safer. She says, "Ours."`;
      }
      return t;
    },
    choices: [ { text: "Let the walls go quiet. Continue.", next: "faction_split" } ]
  },

  // PRE: from prom_direct choice 2 | WRITES: onEnter promises.mira="broken" (idempotent) | DEATH: none | IMG: reuse
  prom_direct_break: {
    image: "images/power_crisis.jpg",
    onEnter: () => {
      if (state.promises.mira === "made") state.promises.mira = "broken";
    },
    get text() {
      let t = `The changeover takes an hour. The interlocks harden. The ration boards recalculate under signatures eight years dead, and the numbers are, in fact, better.`;
      if (isAlive("mira")) {
        t += `\n\nMira initials it like any other work order, exact.

"You said: the living will decide what the future becomes." The panel closes. "Decision logged. Not ours. I'll get you there, Commander. Wherever it is, I wouldn't call it a human future. I'd call it a delivery."`;
      }
      return t;
    },
    choices: [ { text: "Take the better numbers. Continue.", next: "faction_split" } ]
  },

  // ═══════════════ C. SELA TEST (Custody insertion) ═══════════════

  // PRE: promises.sela made && isAlive(sela); reached only via custody_onset | WRITES: none | DEATH: none | IMG: reuse
});
