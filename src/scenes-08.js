// Sunsplitter — scenes-08.js
// 0.28.1c size hygiene. Pure mechanical. mid-a: arc_living_1 + living_2
// Strict scene shape only: text | choices | onEnter | image
registerScenes({

  arc_living_1: {
    get text() {
      let t = `The habitation ring is warmer than the rest of the ship — and failing in smaller, meaner ways.\n\n`;
      if (isAlive("amara")) {
        t += `Amara Vale has rerouted a water line with her own hands. The house key from Lagos hangs at her throat while she works.\n\n`;
        t += `"I can keep the trays and the wash cycle if you give me supply margin. Or I can shut the green down to keep the recyclers honest."\n\n`;
        if (hasMark("amara", "plants_matter")) t += `She already heard you say living things matter. She is waiting to see if that was a sentence or a policy.\n\n`;
        if (hasMark("amara", "math_first")) t += `She does not look at you when she speaks. The math-first answer still sits between you.\n\n`;
      } else {
        t += `The trays run without their keeper. The recyclers do not care about grief.\n\n`;
      }
      if (isAlive("lena") && state.flags.leadership === "hard") {
        t += `Lena, from the hatch: "Hard rules do not grow food. They only decide who goes without."`;
      }
      return t;
    },
    choices: [
      { text: "Give Amara the margin. Keep something green alive.", next: "arc_living_2", effects: { supplies: -6, cohesion: 6, integrity: -2 }, lean: { living: 3 }, affinity: { amara: 10, lena: 3 }, trust: { amara: 8 }, flag: { hydro: "full" }, requires: { supplies: { min: 8 } }, alive: "amara" },
      { text: "Shut the green down. Recyclers and paste first.", next: "arc_living_2", effects: { supplies: 4, cohesion: -5, integrity: 3 }, lean: { future: 2 }, affinity: { amara: -6, elias: 4 }, trust: { amara: -6 } },
      { text: "Split the difference — half trays, tighter wash schedule.", next: "arc_living_2", effects: { supplies: -2, cohesion: 2, integrity: 1 }, lean: { living: 1 }, affinity: { amara: 4 } }
    ]
  },

  arc_living_2: {
    get text() {
      let t = ``;
      if (isAlive("sela")) {
        t += `Sela is not at the bulkhead to be observed. She is working.\n\n`;
        t += `The yellow circle is tighter than last time. Cleaner. When she speaks, it is without asking permission.\n\n`;
        t += `"The panels still run an Earth sunrise. That is a lie with a schedule. I am not trying to replace the sky. I am keeping a measurement the ship keeps trying to delete."\n\n`;
        t += `She turns the plate so you can see the latest version.\n\n`;
        if (isAlive("jiro")) {
          t += `"Jiro thinks I am mourning. He is half right. The other half is refusal. If we only optimize for what survives the dark, we will arrive as the dark."\n\n`;
        } else {
          t += `"Some people think I am mourning. They are half right. The other half is refusal. If we only optimize for what survives the dark, we will arrive as the dark."\n\n`;
        }
        if (state.flags.sela_attention === "ignored") t += `She does not mention that you walked past her once. She does not need to.\n\n`;
        if (state.flags.sela_attention === "present" || hasMark("sela", "spoken")) t += `She treats your presence as a fact, not a favor.\n\n`;
        if (isAlive("jiro")) t += `Jiro appears in the hatch, hears the last sentence, and does not correct her.`;
      } else {
        t += `The yellow marks remain on the bulkhead. Their author does not. The ship keeps the pigment and loses the argument.`;
      }
      return t;
    },
    choices: [
      { text: "Tell her refusal is a kind of navigation. Keep the ritual protected.", next: "arc_living_3", effects: { cohesion: 4, supplies: -1 }, lean: { living: 3 }, affinity: { sela: 12, jiro: 6 }, trust: { sela: 10 }, mark: { sela: "spoken" }, flag: { sela_attention: "present" }, alive: "sela" },
      { text: "Ask what she would spend to keep a warm world possible.", next: "arc_living_3", effects: { cohesion: 2 }, lean: { living: 2 }, affinity: { sela: 8 }, trust: { sela: 8 }, mark: { sela: "spoken" }, alive: "sela" },
      { text: "Tell her the ship runs on numbers, not pigment.", next: "arc_living_3", effects: { cohesion: -3, integrity: 1 }, lean: { future: 2 }, affinity: { sela: -4, jiro: -2 }, flag: { sela_attention: "ignored" }, alive: "sela" },
      { text: "Leave the marks where they are.", next: "arc_living_3" }
    ],
    onEnter: () => {
      if (isAlive("sela")) {
        remember("Sela said refusal is half of what the yellow is for.");
        mark("sela", "spoken");
      }
    }
  },

});
