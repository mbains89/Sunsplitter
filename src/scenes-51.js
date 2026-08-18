// Sunsplitter — scenes-51.js
// 0.28.2 size hygiene. Pure mechanical. crewpairs: sela + vess
// Strict scene shape only: text | choices | onEnter | image
registerScenes({

  offshift_sela: {
    image: "images/sela_ritual.jpg",
    onEnter: () => {
      state.flags.junctionChoice = "sela";
      remember("attended the ritual performed for one person");
    },
    get text() {
      let t = `The lamp is already warming when you arrive, amber climbing toward yellow, and the filter behind it hums at the pitch of a held breath. The light crosses her hands first. For one hour this small yellow circle is the only sunrise anyone on this ship will get, and she is spending it on an audience of one.\n\n`;
      // Names of the dead
      const deadList = (state.dead || []).filter(k => k !== "rourke").map(k => (crew[k] && crew[k].name) || k);
      if (deadList.length) {
        t += `She says the names of this run's dead at yellow, each one complete, unhurried: ${deadList.join(", ")}. Then she is quiet for exactly as long as the names took, which you understand, watching her, is the point.\n\n`;
      } else {
        t += `She is quiet for a long count. No names yet. The lamp still climbs.\n\n`;
      }
      t += `"I have performed this for the ship since I boarded," she says. "Tonight I perform it for one person. That has never happened before. You are the person. I wanted the sentence said in the light, so that neither of us can misfile it later."`;
      if (romanceOpen("sela")) {
        t += `\n\nThe lamp holds at full yellow. "The next part is not liturgy. The next part is a question, and I am only asking it once, because I only have the one." She waits. She does not fill the silence. She never has.`;
      }
      const close = closingPartnerLine();
      if (close) t += `\n\n` + close;
      return t;
    },
    get choices() {
      if (romanceOpen("sela")) {
        return [
          { text: "Stay past the yellow.", next: "faction_split" },
          { text: "Let the lamp go amber and step back.", next: "faction_split", mark: { sela: "declined" } }
        ];
      }
      return [ { text: "Stand with her until amber.", next: "faction_split" } ];
    }
  },

  offshift_vess: {
    image: "images/transmission.jpg",
    onEnter: () => {
      state.flags.junctionChoice = "vess";
      remember("heard the beacon Vess was holding");
    },
    get text() {
      let t = `The relay bay runs on console light, cyan off the racks, and her chair is worn pale on one arm where six years of one elbow rested. She gives you the other seat. The hour smells of cold solder and old plastic — the smell of equipment kept alive past its design life by somebody who had to.\n\n`;
      t += `"Item one. Logged receipt forty-one cycles ago, oh-two-hundred. Automated. Ark-band handshake, station-keeping power signature. Verified eleven times."\n\n`;
      t += `She plays it. A preamble tone. A ship designator, repeating, patient as a metronome. Then the gap where an answer would go, and the preamble again.\n\n`;
      t += `"Crews don't maintain station-keeping beacons," she says, and for once she answers slowly, at human tempo — from her, slow is a gift. "Orphans do. Somewhere out there a ship is saying its own name to nobody, on schedule. I did that for six years. I know the accent." A beat, half a beat late, checking the joke is still allowed: "It's good work. Whoever's not alive over there is doing good work."\n\n`;
      t += `"Disposition is yours. The registry stays exact either way. This one gets its own page."`;
      if (state.romance.vess) {
        t += `\n\n"Item two, if you're staying: the chair is rated for one and I'm not moving. Solve it."`;
      }
      const close = closingPartnerLine();
      if (close) t += `\n\n` + close;
      return t;
    },
    get choices() {
      const c = [
        { text: "Tell the crew.", next: "faction_split", effects: { cohesion: -1 }, remember: "relayed the orphan beacon to the crew" },
        { text: "Hold it between you.", next: "faction_split", remember: "kept the orphan beacon between the two of you" }
      ];
      if (!state.flags.last_tx_spent) {
        c.push({
          text: "Answer it.",
          next: "faction_split",
          flag: { last_tx_spent: true },
          remember: "spent the last long-range window answering a dead ship's beacon"
        });
      }
      return c;
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // CREW PAIRS — full scenes
  // ═══════════════════════════════════════════════════════════════

  // Pair 2 settle
});
