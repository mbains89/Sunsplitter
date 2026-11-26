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
      return t.trimEnd(); // SUN-EMPTY-PARAGRAPHS-01: no trailing "\n\n" when the last line is skipped
    },
    get choices() {
      const routes = [
        { text: "Give Amara the margin. Keep something green alive.", next: "arc_living_2", effects: { supplies: -6, cohesion: 6, integrity: -2 }, lean: { living: 3 }, affinity: { amara: 10, lena: 3 }, trust: { amara: 8 }, flag: { hydro: "full" }, requires: { supplies: { min: 8 } }, alive: "amara", reply: [{ who: "amara", text: `Amara takes the margin without ceremony and has the wash cycle running by next shift. "That was a policy, then," she says. "Good. I will hold you to it, and so will the tomatoes."` }] },
        { text: "Shut the green down. Recyclers and paste first.", next: "arc_living_2", effects: { supplies: 4, cohesion: -5, integrity: 3 }, lean: { future: 2 }, affinity: { amara: -6, elias: 4 }, trust: { amara: -6 }, reply: [`The trays go dark row by row.`, { who: "amara", text: `Amara shuts them down herself and asks no one to help. When she is done she touches the key at her throat, once. "Paste it is," she says. "I will remember who ordered the paste."` }] }
      ];
      const legal = choice => (!choice.alive || isAlive(choice.alive)) &&
        (!choice.requires || meetsRequirements(choice.requires)) &&
        canAffordEffects(choice.effects);
      if (!routes.some(legal)) {
        routes.push({ text: "Leave the ring as it is.", next: "arc_living_2", reply: [`The ring stays as it is: warm, failing, and patient.`] });
      }
      return routes;
    }
  },

  // SUN-V035-PLAYTEST-SELA-ANSWER-01: only the Ask destination changes.
  // PRE: existing Living arc; Sela/Jiro text and addressed choices are live-gated.
  // WRITES: original cohesion/supplies/integrity, lean, affinity/trust, spoken
  // marks and sela_attention choices; entry retains its original memory/mark.
  // DEATH: none. IMAGE: existing sela_ritual / absent-Sela resolver unchanged.
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
      return t.trimEnd(); // SUN-EMPTY-PARAGRAPHS-01: no trailing "\n\n" when Jiro's line is skipped
    },
    get choices() {
      const routes = [
        { text: "Tell her refusal is a kind of navigation. Keep the ritual protected.", next: "arc_living_3", effects: { cohesion: 4, supplies: -1 }, lean: { living: 3 }, affinity: { sela: 12, jiro: 6 }, trust: { sela: 10 }, mark: { sela: "spoken" }, flag: { sela_attention: "present" }, alive: "sela" },
        // SUN-DIET-REPLY-FOLD-01 (L-057): her answer (exact quiet_sela prose, SUN-V035-PLAYTEST-SELA-ANSWER-01)
        // is the reply above the conflict; arc_living_sela_answer retired.
        { text: "Ask what she would spend to keep a warm world possible.", next: "arc_living_3", effects: { cohesion: 2 }, lean: { living: 2 }, affinity: { sela: 8 }, trust: { sela: 8 }, mark: { sela: "spoken" }, alive: "sela",
          reply: [{ who: "sela", text: `Sela answers.` }, { who: "sela", text: `"I would spend all that is mine. It is a short list: the pigment, the hours, the word no. I will not spend what belongs to someone else."` }] },
        { text: "Tell her the ship runs on numbers, not pigment.", next: "arc_living_3", effects: { cohesion: -3, integrity: 1 }, lean: { future: 2 }, affinity: { sela: -4, jiro: -2 }, flag: { sela_attention: "ignored" }, alive: "sela" }
      ];
      if (!isAlive("sela")) {
        return [{ text: "Leave the marks where they are.", next: "arc_living_3" }];
      }
      return routes;
    },
    onEnter: () => {
      if (isAlive("sela")) {
        remember("Sela said refusal is half of what the yellow is for.");
        mark("sela", "spoken");
      }
    }
  }
});
