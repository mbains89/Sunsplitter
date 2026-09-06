// Sunsplitter — scenes-35.js
// 0.28.1c size hygiene. Pure mechanical. mid-b: favor_mira + coolant_trade + seal_or_food
// Strict scene shape only: text | choices | onEnter | image
registerScenes({

  favor_mira: {
    text: `Mira listens to the request without looking up from the board.\n\n"You want me to free sealed maintenance stock that is inventory-locked to a department that does not exist on this voyage. That is a favor, not a work order."\n\nShe finally meets your eyes.\n\n"I will do it once. After that, the next time you need a miracle, the answer is the board."`,
    choices: [
      { text: "Take the favor. Accept that she will remember the debt the other way.", next: "prom_make_mira", effects: { supplies: 8, integrity: 3 }, flag: { mira_favor: true }, trust: { mira: 4 }, affinity: { mira: 6 } },
      { text: "Withdraw the ask. You will not spend her goodwill on parts.", next: "prom_make_mira", trust: { mira: 2 } }
    ],
    onEnter: () => {
      if (!isAlive("mira")) return "pursuit_window";
      state.favors.mira = true;
    }
  },

  // PRE: after power_crisis; may precede or follow private_stores, before Deck 4
  // WRITES: existing coolant flag, costs and lean only; return checks stores/coolant
  // DEATH: none | DEAD SPEECH/APPEARANCE: unchanged early roster, before lethal beats
  // IMAGE: unchanged corridor_variant.jpg; no art work
  coolant_trade: {
    onEnter: () => { if (state.flags.coolant) return "seal_or_food"; },
    get text() {
      let t = isAlive("mira") && isAlive("lena")
        ? `Mira and Lena are arguing over the same tank of coolant-grade fluid.` : "";

      if (isAlive("mira")) {
        t += `\n\n"I can stabilize the secondary loop for three weeks if I take it," Mira says. She keeps one hand on the secondary-loop trace.\n\n"What's broken is remote authority. The tank buys time; it does not restore the contactor. If the cross-feed welds, control goes local. Whoever takes the phase board stays until both traces are flat."`;
      }
      if (isAlive("lena")) {
        t += `\n\nLena does not raise her voice. "Or I can keep the last sterile field cold enough that surgery remains possible. Choose which future injury you prefer."`;
      }

      t += `\n\nThe tank is not big enough for both uses.`;
      return t;
    },
    get choices() {
      const routes = [
        {
          text: "Give it to the loop. Keep the ship from shaking apart.",
          next: "seal_or_food",
          effects: { integrity: 8, supplies: -2, cohesion: -3 },
          flag: { coolant: "loop" },
          lean: { future: 1 },
          requires: { trust: { mira: 30 } },
          alive: "mira"
        },
        {
          text: "Give it to medical. Keep the option to cut and sew.",
          next: "seal_or_food",
          effects: { cohesion: 4, integrity: -4, supplies: -2 },
          flag: { coolant: "medical" },
          lean: { living: 1 },
          requires: { trust: { lena: 30 } },
          alive: "lena"
        }
      ];
      const enabled = routes.some(choice =>
        (!choice.alive || isAlive(choice.alive)) &&
        (!choice.requires || meetsRequirements(choice.requires)) &&
        (!choice.effects || canAffordEffects(choice.effects))
      );
      if (!enabled) {
        routes.push({
          text: "Split it. Both systems degrade slower — neither is saved.",
          next: "seal_or_food",
          effects: { integrity: 2, cohesion: 1, supplies: -3 },
          flag: { coolant: "split" }
        });
      }
      return routes;
    },
    image: "images/corridor_variant.jpg"
  },

  // PRE: both existing stores/coolant decisions completed; if coolant came
  // first, return for stores before presenting this unchanged Deck 4 decision
  // WRITES: existing feedstock/ship_memory choices only | DEATH: none
  // DEAD SPEECH/APPEARANCE: unchanged early living roster | IMAGE: unchanged
  seal_or_food: {
    onEnter: () => { if (!state.flags.stores) return "private_stores"; },
    get text() {
      let t = `A pressure seal on Deck 4 is failing in slow motion. The same fabrication feedstock can patch it for months — or be rendered into calorie paste that extends ration estimates by ten days.`;

      if (isAlive("elias")) {
        t += `\n\nElias wants the seal. He tests the manual dog.\n\n"What's the threat? The status light that says a bad seal held. Remote is lying. Close upstream once. No retrieval team until pressure is flat."`;
      }
      if (isAlive("amara")) {
        t += `\n\nAmara wants the paste.`;
      }

      t += `\n\nEvery claim on the table is correct. Whatever you choose will stay in the bulkhead. The ship does not forget structural decisions the way people forget arguments.`;
      return t;
    },
    get choices() {
      const routes = [
        {
          text: "Patch the seal properly. A dead crew does not need calories.",
          next: "time_pass",
          effects: { integrity: 7, supplies: -6, cohesion: -2 },
          flag: { feedstock: "seal", ship_memory: "proper_seal" },
          lean: { future: 1 },
          requires: { integrity: { min: 20 } },
          remember: "You spent the feedstock on a proper Deck 4 seal. The ship will hold that line — or fail louder if something else gives."
        },
        {
          text: "Render the paste. People eat every day; the seal might hold.",
          next: "time_pass",
          effects: { supplies: 9, integrity: -5, cohesion: 3 },
          flag: { feedstock: "food", ship_memory: "open_wound" },
          lean: { living: 1 },
          alive: "amara",
          remember: "You left Deck 4's seal to chance for food. The open wound stays on the schematic."
        }
      ];
      const enabled = routes.some(choice =>
        (!choice.alive || isAlive(choice.alive)) &&
        (!choice.requires || meetsRequirements(choice.requires)) &&
        (!choice.effects || canAffordEffects(choice.effects))
      );
      if (!enabled) {
        routes.push({
          text: "Jury-rig a thin patch and stretch half-rations. Both problems deferred.",
          next: "time_pass",
          effects: { integrity: 2, supplies: 2, cohesion: -1 },
          flag: { feedstock: "thin", ship_memory: "jury_rig" },
          remember: "Deck 4 is a jury-rig. It will ask to be paid later."
        });
      }
      return routes;
    },
    image: "images/corridor_variant.jpg"
  },

});
