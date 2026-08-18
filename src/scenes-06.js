// Sunsplitter — scenes-06.js
// 0.28.2 size hygiene. Pure mechanical. mid-a: arc_fork + future_1 + future_2
// Strict scene shape only: text | choices | onEnter | image
registerScenes({

  arc_fork: {
    get text() {
      const shape = ideologyShape();
      let t = `The quiet after the vault voice does not last.\n\n`;
      t += `Two kinds of work are waiting. One lives in the numbers — drive, trajectory, the restart package that still draws power in the cold. The other lives in the warm sections — air, food, the people who still argue in the corridors.\n\n`;
      if (shape === "future") t += `You have already leaned toward the future. The ship has noticed.\n\n`;
      else if (shape === "living") t += `You have already leaned toward the living. The ship has noticed.\n\n`;
      else t += `You have not yet forced the ship to choose a single language.\n\n`;
      t += `Leadership is a separate question from ideology. You can hold hard rules and still protect the living. You can speak softly and still feed the vault. The next stretch of the voyage will not let you pretend those are the same choice.\n\n`;
      t += `Embryo viability, hull, and cohesion will all be asked to pay. The board already knows which meters are soft.\n\n`;
      t += `Where do you put your weight?`;
      return t;
    },
    choices: [
      { text: "The future work. Drive, vault, trajectory — keep the restart package honest.", next: "arc_future_1", flag: { mid_arc: "future" }, lean: { future: 4 }, affinity: { elias: 4, jiro: 4, mira: 3 } },
      { text: "The living work. Habitation, food, the people who still have names.", next: "arc_living_1", flag: { mid_arc: "living" }, lean: { living: 4 }, affinity: { lena: 4, tomas: 4, amara: 3, sela: 3 } }
    ]
  },

  arc_future_1: {
    get text() {
      let t = `Engineering smells of ozone and overheated insulation.\n\n`;
      if (isAlive("mira")) {
        t += `Mira Solis has the drive schematic spread across three cracked screens. She does not look up when you enter.\n\n`;
        t += `"The primary is dead. Auxiliary will not carry a colony burn. I can cannibalize habitation relays for a partial restart — or I can keep those relays where they keep people breathing."\n\n`;
        if (hasMark("mira", "drive_first")) t += `She already knows which answer you gave her once.\n\n`;
        if (state.flags.leadership === "hard") t += `Under hard rules she works faster and talks less.\n\n`;
      } else {
        t += `The drive schematic runs without its engineer. The board does not care who reads it.\n\n`;
      }
      if (isAlive("elias")) t += `Elias stands at the hatch. "Every hour we spend on comfort is an hour the package spends closer to a dead battery."`;
      return t;
    },
    choices: [
      { text: "Cannibalize habitation relays. Get the drive to answer, even partially.", next: "arc_future_2", effects: { integrity: 6, cohesion: -6, supplies: -3 }, lean: { future: 3 }, affinity: { mira: 6, elias: 6, lena: -4 }, trust: { mira: 4, elias: 5, lena: -4 } },
      { text: "Leave habitation alone. Find another path that does not steal breath.", next: "arc_future_2", effects: { cohesion: 4, integrity: -2, supplies: -5 }, lean: { living: 2 }, affinity: { lena: 5, mira: 2 }, requires: { supplies: { min: 10 } } },
      { text: "Order a limited pull — enough for diagnostics, not a full restart.", next: "arc_future_2", effects: { integrity: 2, supplies: -4, cohesion: -1 }, lean: { future: 1 }, affinity: { mira: 4 } }
    ]
  },

  arc_future_2: {
    get text() {
      let t = ``;
      const emb = state.embryos || 100;
      if (isAlive("jiro")) {
        t += `Jiro meets you at the vault hatch with a tablet and a face that has not slept.\n\n`;
        t += `"Embryo viability is ${emb}%. Power draw is not. If we keep the current grid split, we will lose percentage points every cycle we refuse to name."\n\n`;
        t += `He scrolls. Names of genetic lines. A mission profile that still assumes a destination with a sky.\n\n`;
        t += `"I can lock the vault into conservation mode. Habitation takes the brownouts — cold corridors, tighter rations, people noticing who the package ranks above. Or we keep the brownouts off the living and accept a permanent bleed in the cylinders. The ceiling does not recover."\n\n`;
      } else {
        t += `The vault hatch is unmanned. The board still reports: embryo viability ${emb}%, power draw not. Conservation mode or permanent slow bleed. The numbers do not soften without him.\n\n`;
      }
      if (emb < 70) {
        t += `The count is already wounded. Full conservation will only hold what is left; it will not restore what was spent.\n\n`;
      }
      if (isAlive("elias") && state.flags.leadership === "together") {
        t += `Elias: "Soft leadership does not change thermodynamics. It only changes who gets blamed for the brownouts."`;
      } else if (isAlive("elias")) {
        t += `Elias does not bother to argue. He is already counting which brownouts he can enforce and which people will notice.`;
      } else if (isAlive("lena")) {
        t += `Lena, if she is near: "Every brownout is a medical problem I will have to solve with fewer supplies."`;
      }
      return t;
    },
    choices: [
      { text: "Lock conservation mode. Habitation takes the brownouts.", next: "arc_future_3", effects: { embryos: 5, cohesion: -9, integrity: -4, supplies: -3 }, lean: { future: 4 }, affinity: { jiro: 8, elias: 6, tomas: -8, lena: -4 }, trust: { jiro: 6, tomas: -6 }, requires: { embryos: { min: 55 } } },
      { text: "Refuse the brownouts. Accept the permanent vault bleed.", next: "arc_future_3", effects: { embryos: -10, cohesion: 6, supplies: -2 }, lean: { living: 3 }, affinity: { tomas: 7, lena: 5, jiro: -6 }, flag: { embryo_ceiling: "lowered" } },
      { text: "Split the pain on a schedule. Publish the numbers to the crew.", next: "arc_future_3", effects: { embryos: -3, cohesion: 2, supplies: -4 }, lean: { future: 1, living: 1 }, requires: { cohesion: { min: 28 } } }
    ]
  },

});
