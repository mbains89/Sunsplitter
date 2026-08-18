// Sunsplitter — scenes-41.js
// 0.28.2 size hygiene. Pure mechanical. early: empty_berths through quiet_amara
// Strict scene shape only: text | choices | onEnter | image
registerScenes({

  empty_berths: {
    text: `The habitation spine was never meant to feel this hollow.

You pass berth tags still waiting for check-in: families, specialists, a whole hydroponics cohort that never left the pad. Someone's handwritten list is taped inside a locker door — first names only, a few crossed out in a different ink, the rest left open as if the cascade might reverse.

In the laundry nook, uniforms hang in sizes that will not be filled. The ship's inventory system still politely requests biometric updates for three hundred and forty-one missing crew IDs.

This is not a mystery. It is a design that assumed a different launch day. The Sunsplitter did not become empty by accident. It launched incomplete.`,
    choices: [
      { text: "Take one name from the list into memory. Then go back to the living.", next: "lead_prompt", effects: { cohesion: 2 }, remember: "You kept one name from a locker list of people who never boarded." },
      { text: "Close the locker. The living are waiting for orders.", next: "lead_prompt", effects: { integrity: 1 } }
    ]
  },

  competence_watch: {
    get text() {
      let t = `Not every hour is a crisis.

`;
      if (isAlive("mira")) t += `Mira has the auxiliary grid balanced without being asked. The knock in the hull is quieter. She does not look for praise; she looks at the next fault light.

`;
      if (isAlive("jiro")) t += `Jiro has recalibrated the star tracker against a dead catalog and still gotten a usable fix. When he speaks, it is one sentence: "We know where we are. That is not nothing."

`;
      if (isAlive("amara")) t += `Amara's trays are not saving the ship. They are keeping one corridor honest about green things. She works as if the original bay roster might still arrive.

`;
      if (isAlive("lena")) t += `Lena restocks a cabinet that will never be full again and still labels every vial. Competence is not hope. It is refusal to get sloppy.

`;
      if (isAlive("sela")) t += `Sela's yellow circles have not multiplied into chaos. They have gotten tighter. Precision is her form of care.

`;
      t += `The ship is still dying on a long fuse. The people left are still good at what they were trained to be.`;
      return t;
    },
    choices: [
      // Forward only — must not re-enter lead_prompt declaration (0.20.2)
      { text: "Let them work. Do not turn competence into another speech.", next: "power_crisis", effects: { cohesion: 3 }, lean: { living: 1 } },
      { text: "Log the gains. Quiet success still has to be counted.", next: "power_crisis", effects: { integrity: 2, cohesion: 1 }, lean: { future: 1 } }
    ]
  },

  quiet_sela: {
    text: `Sela works at the bulkhead that no longer opens — the one the crew walks past without looking.

Yellow pigment on salvaged plating. The same circle, tightened, revised. A sun that has no right to exist out here.

She does not startle when you sit. After a stretch of silence she speaks without looking up, voice low and exact:

"The daylight panels are still running an Earth schedule. That is not comfort. That is a system that has not been told the truth."

She turns the plate so you can see the latest version.

"It was warm. Not a memory to cry over — a fact. If we only keep what the dark allows, we will forget what we were trying to arrive as."

When you leave she has already started the next circle — same diameter, cleaner line. The hatch stays empty.`,
    choices: [
      { text: "Tell her the yellow is a fact worth protecting.", next: "prom_make_sela", affinity: { sela: 10 }, effects: { cohesion: 3, supplies: -1 }, lean: { living: 2 }, mark: { sela: "spoken" }, flag: { sela_attention: "present" } },
      { text: "Ask what she would refuse to optimize away.", next: "prom_make_sela", affinity: { sela: 8 }, effects: { cohesion: 2 }, lean: { living: 1 }, mark: { sela: "spoken" } },
      { text: "Say nothing. Leave the plate where it is.", next: "prom_make_sela", affinity: { sela: 4 }, effects: { cohesion: 1 } }
    ],
    onEnter: () => {
      remember("Sela called the Earth sunrise panels a system that has not been told the truth.");
      mark("sela", "spoken");
      if (state.flags.sela_attention !== "ignored") {
        state.flags.sela_attention = state.flags.sela_attention || "present";
      }
    }
  },


  quiet_mira: {
    text: `You touch her shoulder. Mira Solis jerks awake with a sound that is almost a word.

Drive systems specialist. The patch on her suit is the first clean name you get for the woman who has been keeping the boards from going dark.

"How long?" she asks. Then she sees the fault light still open and answers herself.

"I can chase the drive, or I can keep patching the things that keep people breathing. I cannot do both at full effort. Someone has to tell me which failure we are allowed to live with."

She waits. Not soft. Hungry for an answer that will let her work.`,
    choices: [
      { text: "Tell her people come first when it is that or the ship.", next: "lead_prompt", affinity: { mira: 8 }, trust: { mira: 6 }, mark: { mira: "people_first" }, lean: { living: 1 } },
      { text: "Tell her the ship has to hold or none of this matters.", next: "lead_prompt", affinity: { mira: 6 }, trust: { mira: 5 }, mark: { mira: "drive_first" }, lean: { future: 1 } },
      { text: "Say nothing. Let the quiet stand.", next: "lead_prompt", affinity: { mira: 4 } }
    ]
  },


  quiet_tomas: {
    onEnter: () => { state.flags.quiet_tomas_done = true; },
    text: `Brother Tomas sits where the common area still has a shadow that feels intentional.

He has no rank and no console. He was a hospital chaplain before the pads. On this ship he keeps the human cost on the ledger when everyone else is trying to close it.

"They will come to you with numbers," he says. "I will come to you with names. I am not asking you to ignore the numbers. I am asking you not to pretend the names are noise."

He does not ask for a promise. He waits to see whether you can sit without filling the silence with orders.`,
    choices: [
      { text: "Tell him you heard him.", next: "act3_spine_next", affinity: { tomas: 10 }, trust: { tomas: 8 }, effects: { cohesion: 2 }, lean: { living: 1 } },
      { text: "Leave the silence unbroken.", next: "act3_spine_next", affinity: { tomas: 5 }, trust: { tomas: 3 } }
    ]
  },


  quiet_amara: {
    text: `Amara is on her knees between the trays, checking root systems by hand. When she sees you she does not stand.

"The paste will keep us alive," she says. "It will not keep us human. That is not a metaphor. I have watched people forget the taste of green things and then forget why they were supposed to care about anything else."

She presses a small leaf into your palm. It is pale and not much, but it is alive.

"If you decide the plants are a luxury, say so clearly. I would rather know."`,
    choices: [
      { text: "Promise the living things still matter.", next: "prom_make_amara", affinity: { amara: 8 }, mark: { amara: "plants_matter" } },
      { text: "Tell her the math will decide, not sentiment.", next: "prom_make_amara", affinity: { amara: -4 }, mark: { amara: "math_first" } }
    ],
    onEnter: () => remember("Amara put a living leaf in your hand.")
  },

});
