// Sunsplitter — scenes-52.js
// 0.28.2 size hygiene. Pure mechanical. crewpairs: pairs + warmth
// Strict scene shape only: text | choices | onEnter | image
registerScenes({

  pair_grudge_settle: {
    image: "images/observation.jpg",
    onEnter: () => {
      state.flags.pair_grudge = true;
      remember("Tomas and Jiro settled the aft-trunk account");
    },
    get text() {
      return `They're inventorying the trunk spares together, and it's the together that stops you at the hatch. Tomas hands tools before they're asked for. Jiro gives the schedule back in Tomas's own units: "Water the third rack in forty minutes; we're twenty from done, error of five." No apology has been said. You can hear that none is coming. Tomas, at the last crate: "I stopped needing to know where you were. Costs less." Jiro seals the lid. "Insufficient data was the true answer the whole time. Both columns." That's the entire treaty. They ratify it by carrying the crate together, badly, arguing about the weight.`;
    },
    choices: [
      { text: "Leave them to it.", next: "act3_spine_next" },
      { text: "Carry the third corner.", next: "act3_spine_next" }
    ]
  },

  // Pair 3 confront
  pair_favor_confront: {
    image: "images/hydroponics_amara.jpg",
    onEnter: () => {
      state.flags.pair_favor = true;
    },
    get text() {
      let t = `She waits until the pumps cycle loud enough to cover a conversation, which tells you she's rehearsed having it quietly. "You water one bed, love. I keep the books; I'm allowed to say it. Every ration of your attention that lands on Sela, the rest of the garden grows in her shade — and she hasn't noticed yet. She thinks it's the sun. When she does notice, it'll cost her the whole crew, and I'm not having that for her."\n\n`;
      if (!state.romance.amara && !state.romance.sela) {
        t += `Her thumb moves once along the spine of a small cloth-bound book on the bench — the one Sela reads to her at yellow. She doesn't explain it and doesn't hide it.\n\n`;
      }
      t += `"So. Stop isolating the girl. Not less care. Less ceremony about where it lands."`;
      return t;
    },
    choices: [
      { text: "You're right.", next: "act3_spine_next", affinity: { amara: 1 } },
      { text: "She's not your concern.", next: "act3_spine_next", affinity: { amara: -1 } },
      { text: "Say nothing.", next: "act3_spine_next" }
    ]
  },

  // Pair 1 cold (micro, reachable when Mira dead + Elias alive + attributable)
  pair_shield_cold: {
    image: "images/elias.jpg",
    onEnter: () => {
      state.flags.pair_shield = true;
      remember("Elias said she was what the job was for");
    },
    get text() {
      let t = `Elias gives the watch report in full sentences with nothing in them. When it's done he doesn't leave. "You asked me once what the exits were for. She was what the job was for." He says it at the bulkhead, not at you, and it is the only time he will ever say it. "You did the math. I'm not arguing the math. Live in it like I have to." After that, "Commander" is the warmest word you get. On his table, from then on: a torn jacket, kit closed beside it, unmended on purpose.`;
      return t;
    },
    choices: [ { text: "Continue.", next: "act3_spine_next" } ]
  },

  // ═══════════════════════════════════════════════════════════════
  // SCHEDULED WARMTH
  // ═══════════════════════════════════════════════════════════════

  warmth_meal: {
    image: "images/hydroponics.jpg",
    onEnter: () => {
      state.flags.warmth_meal = true;
    },
    get text() {
      let t = "";
      if (!state.flags.trays_dead) {
        const deadNames = (state.dead || []).filter(k => k !== "rourke").map(k => (crew[k] && crew[k].name) || k);
        t += `The first grown meal. Bowls that steam. Tomas serves everyone, then sets one portion on the soil bed, names attached`;
        if (deadNames.length) t += ` — ${deadNames.join(", ")}`;
        t += ` — "One for the soil. It's owed," and that's the whole ceremony.\n\n`;
      } else {
        t += `Paste, eaten together at the empty racks on purpose. Tomas: "We eat it here so the room stays a room."\n\n`;
      }
      if (isAlive("lena"))  t += `Lena doses herself on the exact schedule, mid-meal, not mid-task, and tells the table: "Eat slower. You all metabolize like you're being chased."\n\n`;
      if (isAlive("elias")) t += `Elias eats standing where he can see the hatch. He takes seconds. From him that's a toast.\n\n`;
      if (isAlive("mira"))  t += `Mira: "Nutrient density up forty percent on the paste. Flavor: present. That's a measurement, not praise." She has thirds.\n\n`;
      if (isAlive("jiro"))  t += `Jiro: "Eleven months since anything on this ship had a season. Logging it."\n\n`;
      if (isAlive("amara")) t += `Amara watches who passes dishes to whom, and pours for the one who poured for no one.\n\n`;
      if (isAlive("sela"))  t += `Sela: "I will say the grace of the old way. It is short. It is the count of the living, said aloud." She counts. The count is exact.\n\n`;
      if (isAlive("vess"))  t += `Vess: "It's quiet on every band tonight. First time I've liked that." Half a beat late, checking the room. The room lets her have it.`;
      return t.trim();
    },
    choices: [
      { text: "Stay for the second pot.", next: "act3_spine_next" },
      { text: "Take yours and go.", next: "act3_spine_next" }
    ]
  },

  warmth_laughter: {
    image: "images/corridor.jpg",
    onEnter: () => {
      state.flags.warmth_laughter = true;
    },
    get text() {
      const living = ["lena", "elias", "mira", "tomas", "amara", "jiro", "sela", "vess"].filter(isAlive);
      let t = `You stop short of the bend and don't round it. Two of them`;
      if (isAlive("vess")) t += ` — and Vess is one`;
      t += ` — and Vess is telling a joke a half-beat behind her own timing, like reading music at sight. The setup is old. Rourke's, by the shape of it. Someone else lands it now, and the laugh that comes back is real — short, ugly, the kind that survives on this ship because it has to be fed so little.\n\n`;
      if (living.length <= 3) {
        t += `It's two voices where there used to be a mess hall of them, and it is quieter, and it still counts. It counts more.`;
      }
      return t;
    },
    choices: [
      { text: "Listen one more minute from the dark.", next: "act3_spine_next" },
      { text: "Move on.", next: "act3_spine_next" }
    ]
  },

  warmth_music: {
    image: "images/corridor.jpg",
    onEnter: () => {
      state.flags.warmth_music = true;
    },
    get text() {
      let t = `A small speaker, rigged low on a stanchion, cycling somebody's dead playlist down the berth rows at half volume — music from a world that doesn't exist, playing to two hundred fourteen berths that were never filled.\n\n`;
      if (isAlive("vess")) {
        t += `Vess is sitting against the row's end, not hiding, not performing. "Somebody should hear music in them," she says. "I used to read the manifest to the dark. This is better. Fewer names, same job."\n\n`;
      } else {
        t += `No one claims the speaker. It's wired off a maintenance bus with a timer, set by a hand that wanted it to outlast shifts, or people.\n\n`;
      }
      if (isAlive("sela")) {
        t += `Sela stands at the far end of the row, listening, filling no silence. From her that is participation.\n\n`;
      }
      t += `Crew pass, and slow, and don't turn it off.`;
      return t;
    },
    choices: [
      { text: "Stay until the track ends.", next: "act3_spine_next" },
      { text: "Go.", next: "act3_spine_next" }
    ]
  }
});
