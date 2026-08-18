// Sunsplitter — scenes-25.js
// 0.28.2 size hygiene. Pure mechanical. late: faction_split
// Strict scene shape only: text | choices | onEnter | image
registerScenes({

  faction_split: {
    onEnter: () => {
      if (state.crisisPath == null) return "act3_crisis_router"; // existing 0.26
      if (!state.flags.junctionChoice) return "offshift_open";   // 0.28
    },
    get text() {
      let t = `The crew is no longer one group.\n\n`;
      const shape = ideologyShape();
      const futureVoices = voicesFor("future");
      const livingVoices = voicesFor("living");

      if ((state.romance.mira && isAlive("mira")) || (state.romance.amara_tomas && isAlive("amara") && isAlive("tomas")) || (state.romance.lena && isAlive("lena"))) {
        t += `Those who have shared a bed move differently around each other. Knowledge travels. So does resentment.\n\n`;
      }

      if (state.flags.vault_sacrifice === "future") {
        t += `The vault is intact. Habitation is colder.\n\n`;
      } else if (state.flags.vault_sacrifice === "living") {
        t += `The living are warmer. The embryo counts are lower.`;
        if (isAlive("jiro")) t += ` Jiro has not spoken since the numbers updated.`;
        t += `\n\n`;
      }

      if (futureVoices.length) {
        t += `Future still has a voice: ${futureVoices.join(", ")}. They speak in numbers, order, and the mission that justified the escape.\n\n`;
      }
      if (livingVoices.length) {
        t += `Living still has a voice: ${livingVoices.join(", ")}. They speak in breath, plants, drawings, and the refusal to treat the present as cargo.\n\n`;
      }
      if (!futureVoices.length && !livingVoices.length) {
        t += `Too few remain for ideology to have a proper argument. The ship is mostly quiet.\n\n`;
      }

      if (shape === "future") t += `The ship has leaned Future. The cold is policy now.\n\n`;
      else if (shape === "living") t += `The ship has leaned Living. The warmth has a permanent cost on the screens.\n\n`;
      else t += `Neither side owns the ship. The argument is still live.\n\n`;

      const fav = favoritism();
      if (fav && crew[fav.favored] && isAlive(fav.favored)) {
        t += `More than one person has noticed how often you turn toward ${crew[fav.favored].name}. The observation is no longer private.\n\n`;
      }
      if (hasMark("sela", "spoken") && isAlive("sela")) {
        t += `Sela's yellow circles have multiplied across spare plating. The ritual is no longer private.\n\n`;
      }
      if (state.flags.crisis === "vent") {
        t += `The sealed section is still sealed. No one has asked to open it.\n\n`;
      }
      if (isAlive("elias")) t += `Elias has begun keeping his own informal watch list.`;
      if (isAlive("amara")) t += ` Amara has stopped pretending the hydroponics bay is only about food.`;
      t += `\n\nYou can feel the lines hardening. The next order will not be answered the same way by everyone.`;
      
      if (state.flags.cascade_truth === "open") t += `The cascade records are out. Trust is a different shape now.\n\n`;
      else if (state.flags.cascade_truth === "sealed") t += `You sealed the cascade records. Someone will unseal them eventually.\n\n`;
      if (hasMark("conflict", "held")) t += `You held the line when the corridor refused you. That fact is still walking around.\n\n`;
      else if (hasMark("conflict", "backed")) {
        t += `You backed down a step when the crew pushed.`;
        if (isAlive("elias")) t += ` Elias has not forgotten.`;
        t += ` Neither have the people who needed it.\n\n`;
      }
      if (state.flags.mid_arc === "future") t += `The mid-voyage work leaned Future. The living sections felt it.\n\n`;
      else if (state.flags.mid_arc === "living") t += `The mid-voyage work leaned Living. The vault sections felt it.\n\n`;
      if (state.flags.elias_power === "high") {
        t += isAlive("elias")
          ? `Elias still holds the security authority you gave him. That has not been free.\n\n`
          : `The security authority you gave Elias has no holder. The rules he wrote are still being followed.\n\n`;
      }
      if (hasMark("elias", "bonded") && isAlive("elias")) t += `Elias still answers faster when you ask without an audience.\n\n`;
      if (hasMark("tomas", "bonded") && isAlive("tomas")) t += `Tomas's silence toward you is less braced.\n\n`;
      if (hasMark("jiro", "bonded") && isAlive("jiro")) t += `Jiro's reports carry an extra careful line.\n\n`;
      const debtors = typeof relationshipDebtors === "function" ? relationshipDebtors() : [];
      if (debtors.length) {
        t += `Some of the living have gone quiet in practical ways — not speeches, just fewer offers: ${debtors.map(k => crew[k] ? crew[k].name : k).join(", ")}.\n\n`;
      }
      if (state.past_known_by && state.past_known_by.lena && isAlive("lena")) {
        t += `Lena knows enough of your ground-side file to factor it into medical priorities. She has not made a speech about it.\n\n`;
      }
      if (state.flags.past === "threatened" && isAlive("elias")) {
        t += `Elias has not spent the file. He has also not forgotten the threat.\n\n`;
      }
      if (state.flags.mira_favor && isAlive("mira")) {
        t += `Mira's one-time stock release is already spent. She will not invent another.\n\n`;
      }
      if (state.flags.elias_power === "limited" && isAlive("elias")) t += `Elias works without freelancing. He has not forgotten the leash.\n\n`;
      if (state.flags.past === "owned") {
        t += isAlive("elias")
          ? `Your past is not only Elias's private resource now. You owned it once in front of him.\n\n`
          : `You owned your past out loud once, in front of Elias. That was the last time it was anyone's leverage.\n\n`;
      }
      else if (state.flags.past === "deflected" || state.flags.past === "denied") {
        t += isAlive("elias")
          ? `Your past is still a lever. Elias has not spent it yet — or has not needed to.\n\n`
          : `Your past is still on file somewhere. The man who knew where stopped being able to say.\n\n`;
      }
      if (isAlive("lena") && state.dying && state.dying.lena) t += `Lena's clock is still running. The crew knows.\n\n`;
      if (state.cohesion <= 0) t += `Cohesion is gone. People still obey the minimum. They do not offer anything extra. Conversations stop when you enter a room.\n\n`;
      else if (state.cohesion <= 12) t += `Cohesion is near the floor. Offers of help arrive late or not at all.\n\n`;
      if (state.supplies <= 0) t += `Supplies are at zero. The next real expenditure will come out of bodies or hull.\n\n`;
      else if (state.supplies <= 8) t += `Supplies are thin enough that every request is already an argument.\n\n`;

return t;
    },
    choices: [
      { text: "Call them together and force the fracture into the open.", next: "reckon_summary", effects: { cohesion: -3, integrity: -2 }, lean: { living: 2 }, requires: { cohesion: { min: 25 }, survivors: { min: 4 } }, flag: { reckon: "public" } },
      { text: "Keep the work moving. Ignore the sides until you cannot.", next: "reckon_summary", effects: { cohesion: 1, supplies: -2, integrity: 2 }, requires: { supplies: { min: 2 } }, flag: { reckon: "suppress" } },
      { text: "Pick a side yourself and make it visible.", next: "reckon_summary", effects: { cohesion: -6, integrity: 1 }, lean: { future: 2 }, requires: { survivors: { min: 5 }, cohesion: { min: 15 } }, flag: { reckon: "public" } },
      { text: "Give them the right to remember the dead and the near-loss in their own words.", next: "reckon_summary", effects: { cohesion: 2 }, flag: { reckon: "memory" }, lean: { living: 1 } },
      { text: "Tell them the truth you have been carrying — planet, odds, and what remains.", next: "reckon_summary", effects: { cohesion: 1 }, flag: { reckon: "truth" }, lean: { living: 1 } }
    ]
  },
});
