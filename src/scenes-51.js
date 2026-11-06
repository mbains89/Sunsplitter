// Sunsplitter — scenes-51.js
// 0.29 Cascade Allusive: Sela stencil insertion + existing Sela/Vess scenes
// Strict scene shape only: text | choices | onEnter | image
registerScenes({

  // ═══ SCENE GROUP DECLARATION ═════════════════════════════════════
  // SCENE_IDS: filters_stencil, filters_stencil_luck, filters_stencil_silent
  // VERSION: 0.29        TICKET: Cascade Allusive 5/6
  // PACKAGE: The Stencil
  // SPINE: adjacent before offshift_sela; never inside its locked ritual prose
  // PRECONDITIONS: isAlive("sela"); one-shot inherited from Last Off-Shift routing
  // STATE WRITES: none; pure texture
  // DEATH EXPOSURE: none
  // DEAD-SPEECH CHECK: every node redirects when !isAlive("sela")
  // IMAGE: REUSE images/sela_ritual.jpg; NO ART_REQUEST
  // PHRASE: spends "I am the hand-off." once, here
  // ═════════════════════════════════════════════════════════════════

  filters_stencil: {
    image: "images/sela_ritual.jpg",
    onEnter: () => { if (!isAlive("sela")) return "faction_split"; },
    text: `Sela is drawing a filter from the crate. The stencil on its side gives a congregation's name and a quantity meant for thousands. She sees you reading it and does not cover it.\n\n"I carried the congregation's crate through the tube, and the tube closed. I was meant to hand it off and walk back. The hand-off did not occur. I am the hand-off."`,
    choices: [
      { text: "Luck, then.", next: "filters_stencil_luck", alive: "sela" },
      { text: "Say nothing.", next: "filters_stencil_silent", alive: "sela" }
    ]
  },

  filters_stencil_luck: {
    image: "images/sela_ritual.jpg",
    onEnter: () => { if (!isAlive("sela")) return "faction_split"; },
    text: `"They will say luck, or they will say selection. I decline both. Something was asked of me, and I have not yet been told what."`,
    choices: [ { text: "Attend at yellow.", next: "offshift_sela" } ]
  },

  filters_stencil_silent: {
    image: "images/sela_ritual.jpg",
    onEnter: () => { if (!isAlive("sela")) return "faction_split"; },
    text: `She seats the filter and says its count aloud — just the number — the way one says a name at a graveside, when the name is all that is left to say.`,
    choices: [ { text: "Attend at yellow.", next: "offshift_sela" } ]
  },

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

  // SUN-V035-PLAYTEST-OFFSHIFT-VESS-01 — image-only repair.
  // PRECONDITION: eligVess() / isAlive("vess") via offshift_open.
  // WRITES (unchanged): onEnter junctionChoice + beacon memory; choices may
  // write cohesion -1, last_tx_spent, and the selected beacon memory.
  // DEATH EXPOSURE: none. Vess speaks; live admission unchanged. Invalid-save
  // appearance is guarded by resolveSceneImage; no prose/gate rewrite here.
  // IMAGE: REUSE official images/vess.jpg (L-029), declared in ART_REQUESTS.
  offshift_vess: {
    image: "images/vess.jpg",
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
      // SUN-ROMANCE-ARC-03 (L-050): item two has a scene behind it. Partner only; she initiated above.
      if (state.romance.vess) {
        c.push({ text: "Solve it.", next: "vess_item_two", tag: "private" });
      }
      return c;
    }
  },

  // ═══ SCENE DECLARATION ═══════════════════════════════════════════
  // SCENE_ID: vess_item_two              TICKET: SUN-ROMANCE-ARC-03 (L-050, Wave 1)
  // PRE: Vess recovered and living, romance.vess; reached only from offshift_vess "Solve it.";
  //   junctionChoice is already "vess". Text branches on flags.vess_intimate.
  // WRITES: none on entry. The two answers write flags.vess_item_two ("floor" | "chair") plus
  //   affinity/trust; no resource change.
  // DEATH: none. DEAD/UNRECOVERED: entry redirects to faction_split (onEnter + living-cast
  //   contract in scenes-55); no dead text is rendered.
  // IMAGE: REUSE images/vess.jpg, the official portrait offshift_vess already uses. No new art.
  // LOCK: ROADMAP §2 — shorter, different currency, asymmetric, power stays hers. She sets the
  //   problem and rules on the answer; nothing here spends a ship resource.
  // ═════════════════════════════════════════════════════════════════
  vess_item_two: {
    image: "images/vess.jpg",
    onEnter: () => {
      if (!isAlive("vess") || !state.romance.vess) return "faction_split";
    },
    get text() {
      if (!isAlive("vess")) return `The relay bay runs on console light and nobody.`;
      let t = `She does not get up. That is the problem as stated.\n\n`;
      t += `The chair is rated for one. The arm is worn pale where her elbow has lived. The other seat, the one she gave you for item one, is on the far side of the rack, which is not where item two is.\n\n`;
      if (state.flags.vess_intimate) {
        t += `"I said I would not ask again. I'm not asking. I'm stating a load rating and an occupancy of one, and I'm not moving." A beat, the half-beat-late one. "Dawnbreak solved this with a rota. There's no rota. Solve it."\n\n`;
      } else {
        t += `"The attempt was accepted and the window stayed with the ship. Logged as: pending. I don't reopen pending items. I state them." A beat, the half-beat-late one. "Load rating one. Occupancy one. Not moving. Solve it."\n\n`;
      }
      t += `"Captain—" The correction comes a beat behind, the way it always does. "Commander."`;
      return t;
    },
    get choices() {
      if (!isAlive("vess")) return [{ text: "Leave the bay.", next: "faction_split" }];
      return [
        { text: "Take the deck beside the chair. Let her keep it.", next: "vess_item_two_logged", flag: { vess_item_two: "floor" }, affinity: { vess: 4 } },
        { text: "Share the chair. It is rated for one.", next: "vess_item_two_logged", flag: { vess_item_two: "chair" }, affinity: { vess: 6 }, trust: { vess: 2 } }
      ];
    }
  },

  // ═══ SCENE DECLARATION ═══════════════════════════════════════════
  // SCENE_ID: vess_item_two_logged       TICKET: SUN-ROMANCE-ARC-03 (L-050, Wave 1)
  // PRE: Vess living; flags.vess_item_two set by vess_item_two. Her ruling on the answer.
  // WRITES: none. DEATH: none. DEAD/UNRECOVERED: entry redirects.
  // IMAGE: REUSE images/vess.jpg. No new art.
  // NOTE: spends two CHARACTER_BIBLE beats here, once each: the "Dawnbreak log, personal" register
  //   and the day she stops correcting "Captain".
  // ═════════════════════════════════════════════════════════════════
  vess_item_two_logged: {
    image: "images/vess.jpg",
    onEnter: () => {
      if (!isAlive("vess")) return "faction_split";
      if (!state.flags.vess_item_two) return "faction_split";
    },
    get text() {
      if (!isAlive("vess")) return `The relay bay runs on console light and nobody.`;
      let t;
      if (state.flags.vess_item_two === "chair") {
        t = `The chair takes the load. It complains in the arm she does not use, and she lets it. Her elbow goes to the pale place out of six years of habit, finds yours there instead, and stays.\n\n"Rated for one. Occupancy two. No fault found." Then, in log register and not quite in log register: "Dawnbreak log, personal. Rating exceeded. Holding."\n\n`;
      } else {
        t = `You sit on the deck plating with your back to the rack, below the worn arm. She looks down at the arrangement for the length of a verification cycle.\n\n"Occupancy one. Company present. No fault found." Then, in log register and not quite in log register: "Dawnbreak log, personal. Chair held. Didn't have to."\n\n`;
      }
      t += `The console light does what it does. She answers the next thing you say a full second late, at human tempo, and this time it is not a gift she is handing you. It is the tempo she has.\n\n"Captain." She does not correct it.`;
      return t;
    },
    choices: [
      { text: "Let the item stay open.", next: "faction_split" }
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // CREW PAIRS — full scenes
  // ═══════════════════════════════════════════════════════════════

  // Pair 2 settle
});
