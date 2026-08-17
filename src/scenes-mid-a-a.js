// Sunsplitter — scenes-mid-a-a.js
// Split from scenes-mid-a.js (0.28.1c size hygiene). Pure mechanical.
// Mid-a: time_pass through vault_voice.
// Strict scene shape only: text | choices | onEnter | image
// Extends global `scenes` object.

registerScenes({


  time_pass: {
    get text() {
      let base = `Days pass. Or what pass for days on a ship with no sun.

The hull produces a recurring metallic knock that people initially mistake for another person moving in the dark sections. The daylight panels still rise and set on a schedule that no longer means anything.`;

      if (state.flags.priority === "repairs") {
        if (isAlive("mira")) base += `\n\nMira's early work on the seals pays off in small ways. The temporary patches hold better than expected. She has begun sleeping in engineering rather than the common area.`;
        else base += `\n\nThe early seal work pays off in small ways. The temporary patches hold better than expected. Engineering stays occupied even without her.`;
      } else if (state.flags.priority === "ration") {
        base += `\n\nThe rationing is working. Supplies fall more slowly. People move more carefully.`;
        if (isAlive("sela")) base += ` Sela has stopped asking for more paste.`;
        if (isAlive("amara")) base += ` Amara has started weighing every tray twice.`;
      } else if (state.flags.priority === "planet") {
        if (isAlive("jiro") && isAlive("sela")) base += `\n\nJiro spends hours with the planetary data. He has begun teaching Sela the orbital mechanics of a world without a star. She listens as if the numbers might become a sky.`;
        else if (isAlive("jiro")) base += `\n\nJiro spends hours with the planetary data. The orbital mechanics of a world without a star fill the quiet cycles.`;
        else base += `\n\nThe planetary data keeps updating. Someone still reads the orbital mechanics of a world without a star.`;
      }

      if (state.flags.hydro === "full") {
        base += `\n\nThe hydroponics trays have begun to green again. People stop by the bay just to look at something living.`;
      }

      return base;
    },
    choices: [
      { text: "Check the status board.", next: "crisis" }
    ]
  },

  crisis: {
    get text() {
      let t = `A pressure alarm cuts the quiet.\n\nDeck 4, section 7 — the same corridor the feedstock argument was about — is reporting a slow leak. The board cannot tell whether the seals are failing or something is chewing through them from the other side.\n\n`;
      if (isAlive("mira")) t += `Mira is already moving. "I need hands and a decision before the differential becomes a problem the patch kits cannot fix."\n\n`;
      if (isAlive("elias")) t += `Elias: "We have three options. All of them cost."\n\n`;
      t += `The ship is asking which resource you are willing to spend.`;
      return t;
    },
    choices: [
      { text: "Cut the section out. Sacrifice the corridor to save the rest.", next: "cut_out", effects: { integrity: -4, cohesion: -3, supplies: -2 }, lean: { future: 1 } },
      { text: "Vent and reseal. Spend air and time.", next: "vent", effects: { supplies: -5, integrity: -1, cohesion: -1 }, lean: { living: 1 }, requires: { supplies: { min: 6 } } },
      { text: "Send someone into the differential. Risk a body for a clean fix.", next: "self_risk", effects: { cohesion: 2 }, lean: { living: 2 } }
    ]
  },

  cut_out: {
    onEnter: () => {
      state.flags.crisis = "cut";
      remember("Cut Deck 4 section 7 out of the pressure map.");
    },
    text: () => {
      let t = `The bulkhead closes. The corridor becomes a sealed tomb of bad air and whatever was trying to get through.\n\n`;
      if (isAlive("mira")) t += `Mira does the cut herself. She does not look at anyone while the torch runs.\n\n`;
      if (isAlive("tomas")) t += `Tomas stands at the new seal for a long time after. "That was someone's berth once."\n\n`;
      t += `The differential stabilizes. The cost is a piece of the ship you will never walk again.`;
      return t;
    },
    choices: [
      { text: "Continue.", next: "aftermath" }
    ]
  },

  vent: {
    onEnter: () => {
      state.flags.crisis = "vent";
      remember("Vent-and-resealed Deck 4 section 7.");
    },
    text: () => {
      let t = `The air leaves in a long, controlled scream. The patch kits go in while the section is still cold.\n\n`;
      if (isAlive("mira")) t += `Mira times the cycle. "We have enough margin for one more of these. After that the boards start lying."\n\n`;
      if (isAlive("amara")) t += `Amara: "That air was tomorrow's air. I will remember the number."\n\n`;
      t += `The seal holds. The ship is a little thinner.`;
      return t;
    },
    choices: [
      { text: "Continue.", next: "aftermath" }
    ]
  },

  self_risk: {
    onEnter: () => {
      state.flags.crisis = "risk";
      remember("Sent a body into the differential to fix Deck 4.");
    },
    get text() {
      let t = `Someone goes in with a suit and a kit. The differential is not dramatic — it is just wrong, and the body inside it is the only sensor that can feel how wrong.\n\n`;
      if (isAlive("mira")) t += `Mira talks them through every step on a private channel. She does not raise her voice.\n\n`;
      if (isAlive("elias")) t += `Elias stands at the lock with a timer. "If the primary shear ring binds, you have twelve seconds."\n\n`;
      t += `The fix holds. The body comes back. The cost is written in the suit telemetry and in the way the crew looks at the next open hatch.`;
      return t;
    },
    choices: [
      { text: "Continue.", next: "aftermath" }
    ]
  },

  aftermath: {
    get text() {
      let t = `The quiet after a crisis is never quiet.\n\nPeople count what was spent. Some count what was saved. The yellow marks on one bulkhead have a new neighbor — a short vertical line in the same pigment.\n\n`;
      if (state.flags.crisis === "cut") t += `The cut section is already becoming a story. Some stories are useful. This one is not.\n\n`;
      if (state.flags.crisis === "vent") t += `The air margin is thinner. Everyone who breathes knows it.\n\n`;
      if (state.flags.crisis === "risk") t += `Someone went into the differential and came back. The ship noticed.\n\n`;
      t += `The boards keep updating. So does the list of names that still answer.`;
      return t;
    },
    choices: [
      { text: "Check on Lena.", next: "lena_dying", alive: "lena" },
      { text: "Keep moving.", next: "past_leak" }
    ]
  },

  lena_dying: {
    onEnter: () => {
      if (!isAlive("lena")) return "past_leak";
      if (!state.dying) state.dying = {};
      if (!state.dying.lena) state.dying.lena = "the medical clock is running";
    },
    get text() {
      if (!isAlive("lena")) return `The medical bay is quiet. The board still carries her name.`;
      let t = `Lena is in the medical bay with the lights low. She does not look surprised to see you.\n\n`;
      t += `"The stabilizers are finite. I have been running the numbers on what happens when they run out. The answer is not a percentage. It is a person."\n\n`;
      t += `She does not ask for anything yet. She is measuring whether you will notice the clock before she has to name it.`;
      return t;
    },
    choices: [
      { text: "Stay. Listen.", next: "romance_lena_1", tag: "private", alive: "lena" },
      { text: "I will come back when there is something I can do.", next: "past_leak", alive: "lena" }
    ]
  },

  romance_lena_1: {
    onEnter: () => {
      if (!isAlive("lena")) return "past_leak";
    },
    get text() {
      let t = `She does not soft-pedal. The medical bay is the only place on the ship that still smells like a hospital, and she uses that.\n\n`;
      t += `"I am not asking for a future. I am asking whether the present is allowed to include this."\n\n`;
      t += `The offer is clear. The clock is still running.`;
      return t;
    },
    choices: [
      { text: "Yes.", next: "romance_lena_sex", tag: "private", affinity: { lena: 12 }, trust: { lena: 8 }, alive: "lena" },
      { text: "Not like this. Not while the clock is the only thing we share.", next: "past_leak", mark: { lena: "declined" }, affinity: { lena: 2 }, alive: "lena" }
    ]
  },

  romance_lena_sex: {
    onEnter: () => {
      if (!isAlive("lena")) return "past_leak";
      if (!state.romance) state.romance = {};
      if (!state.romance.lena) {
        state.romance.lena = true;
        addAffinity("lena", 18);
        remember("Shared a private hour with Lena while her clock was still running.");
      }
    },
    get text() {
      let t = `It is careful and frank and unfinished in the way that medical people finish things — clean, documented, without the luxury of pretending the body is only a body.\n\n`;
      t += `Afterward she buttons the coat and checks the time. The cold drawer is still open.\n\n`;
      t += `"The dose is still there," she says. "If the next triage list is written while I am still breathing, the board already knows where the last regenerative went. Do not make me a soft story in the crew's theory."`;
      return t;
    },
    choices: [
      { text: "I will not.", next: "past_leak", affinity: { lena: 6 }, alive: "lena" }
    ],
    image: "images/romance_lena_1.jpg"
  },

  past_leak: {
    text: `Elias is waiting when you leave the blister.

He does not raise his voice. He never needs to.

"I know what you did to get your place on this ship. The people who should have been in your seat are not here because of a decision you made on the ground. I have the records. I have kept them quiet because a ship without a commander is worse than a ship with a compromised one."

He lets that sit.

"I am not asking for a confession. I am telling you that the truth is a resource. If cohesion keeps falling, I will spend it."`,
    choices: [
      { text: "Admit it. Own the cost in front of him.", next: "transmission", effects: { cohesion: -4 }, flag: { past: "owned" } },
      { text: "Tell him that the past is dead and the only ledger that matters is the living.", next: "transmission", effects: { cohesion: -6 }, flag: { past: "denied" } },
      { text: "Ask what he wants in exchange for silence.", next: "transmission", effects: { cohesion: -2 }, flag: { past: "deal" } }
    ],
    onEnter: () => { state.past_known = true; }
  },

  transmission: {
    get text() {
      if (isAlive("jiro")) {
        return `Jiro intercepts you with a tablet.

"Long-range is still open for one more directed burst before the bus degradation takes the high-gain permanently. I can spend it on a status packet toward the residual Earth noise, or I can keep the window for something that is not a ghost. Your call."`;
      }
      return `The long-range board still shows one clean window. The bus is already degrading. Someone has to decide whether the ship speaks outward one more time.`;
    },
    choices: [
      { text: "Send the status. Let something outside know we are still here.", next: "vault_voice", effects: { cohesion: 2 }, flag: { last_tx: "status" } },
      { text: "Keep the window. We may need it for something that is not a memorial.", next: "vault_voice", flag: { last_tx: "held" } }
    ]
  },

  vault_voice: {
    onEnter: () => {
      if (state.flags.past_known_by && state.flags.past_known_by.lena) return;
      // owned by this scene in later versions; keep light
    },
    get text() {
      let t = `The vault has a voice.\n\nNot a person. A recorded set of procedural prompts that were meant to walk a full colony through the first thirty days after landfall. Someone left it running on a low loop in the cold section.\n\n`;
      if (isAlive("mira")) t += `Mira found it while tracing a power draw. "It is not haunted. It is a checklist that no longer has a destination. I can leave it, kill it, or restrict who hears it."\n\n`;
      else t += `The board found it while tracing a power draw. A checklist that no longer has a destination.\n\n`;
      t += `People have started standing near the hatch to listen. Some call it comfort. Some call it a lie with a pleasant voice.`;
      return t;
    },
    choices: [
      { text: "Disable the voice. It is a system, not a ghost.", next: "arc_fork", effects: { cohesion: -3, integrity: 2 }, flag: { vault_voice: "off" }, lean: { future: 2 } },
      { text: "Leave it. Let people hear what they need to hear.", next: "boarding_stories", effects: { cohesion: 4, supplies: -1 }, flag: { vault_voice: "on" }, lean: { living: 2 }, requires: { cohesion: { min: 30 } } },
      { text: "Restrict access. Only you and Mira hear it from now on.", next: "arc_fork", effects: { cohesion: -1, integrity: 1 }, flag: { vault_voice: "restricted" }, requires: { trust: { mira: 40 } }, alive: "mira" }
    ]
  }

});
