// Sunsplitter — scenes-51.js
// 0.29 Cascade Allusive: Sela stencil insertion + existing Sela/Vess scenes
// Strict scene shape only: text | choices | onEnter | image
registerScenes({

  // ═══ SCENE GROUP DECLARATION ═════════════════════════════════════
  // SCENE_IDS: filters_stencil (filters_stencil_luck/_silent folded into its replies, SUN-DIET-REPLY-FOLD-01)
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
    // SUN-DIET-REPLY-FOLD-01 (L-057): her answer is the reply over the ritual; filters_stencil_luck/_silent retired.
    choices: [
      { text: "Luck, then.", next: "offshift_sela", alive: "sela",
        reply: [{ who: "sela", text: `"They will say luck, or they will say selection. I decline both. Something was asked of me, and I have not yet been told what."` }] },
      { text: "Say nothing.", next: "offshift_sela", alive: "sela",
        reply: [{ who: "sela", text: `She seats the filter and says its count aloud — just the number — the way one says a name at a graveside, when the name is all that is left to say.` }] }
    ]
  },

  // SUN-ROMANCE-ENDINGS-REACH-01: also a partner's late hour after the Commander spent the junction
  // hour with someone else (entered directly, without filters_stencil); then junctionChoice keeps
  // that pick, the held lamp opens the scene and no closing line prints. Exits: afterHour("sela").
  offshift_sela: {
    image: "images/sela_ritual.jpg",
    onEnter: () => {
      if (!lateHour("sela")) state.flags.junctionChoice = "sela";
      remember("attended the ritual performed for one person");
    },
    get text() {
      let t = lateHour("sela") ? `${lateHourOpener("sela")}, the yellow lamp is still held at amber. She has not let it reach yellow.\n\n` : ``;
      t += `The lamp is already warming when you arrive, amber climbing toward yellow, and the filter behind it hums at the pitch of a held breath. The light crosses her hands first. For one hour this small yellow circle is the only sunrise anyone on this ship will get, and she is spending it on an audience of one.\n\n`;
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
      const close = lateHour("sela") ? "" : closingPartnerLine();
      if (close) t += `\n\n` + close;
      return t;
    },
    get choices() {
      if (romanceOpen("sela")) {
        return [
          { text: "Stay past the yellow.", next: afterHour("sela") },
          { text: "Let the lamp go amber and step back.", next: afterHour("sela"), mark: { sela: "declined" } }
        ];
      }
      const c = [ { text: "Stand with her until amber.", next: afterHour("sela") } ];
      // SUN-ROMANCE-ARC-05 (L-050): a partner may stay past amber; what follows is not the ritual.
      if (state.romance.sela) c.push({ text: "Stay past amber.", next: "sela_past_amber", tag: "private" });
      return c;
    }
  },

  // ═══ SCENE DECLARATION ═══════════════════════════════════════════
  // SCENE_ID: sela_past_amber            TICKET: SUN-ROMANCE-ARC-05 (L-050, Wave 1)
  // PRE: Sela living and romance.sela; reached only from offshift_sela "Stay past amber.";
  //   junctionChoice is "sela", or another pick when offshift_sela was her late hour
  //   (SUN-ROMANCE-ENDINGS-REACH-01); the reply's exit goes to afterHour("sela").
  //   Text reads pursuit_sela_cost, sela_vault_vow, custody_answer and promises.sela (kept/broken
  //   only; an untested promise is not read aloud, L-024). Adjacent to, never inside, the locked
  //   lamp-ritual prose: the lamp is amber before she speaks.
  // WRITES: none on entry. The three answers write flags.sela_amber ("meaning" | "sentence" |
  //   "silence") plus affinity/trust; no resource change.
  // DEATH: none. DEAD SPEECH/APPEARANCE: entry redirects to faction_split when she is dead or not
  //   a partner (onEnter + living-cast contract in scenes-55).
  // IMAGE: REUSE images/sela.jpg, the portrait the resolver already serves for the off-shift. No new art.
  // ═════════════════════════════════════════════════════════════════
  sela_past_amber: {
    image: "images/sela.jpg",
    onEnter: () => {
      if (!isAlive("sela") || !state.romance.sela) return "faction_split";
    },
    get text() {
      if (!isAlive("sela")) return `The lamp is cold. Nobody lit it.`;
      let t = `The lamp goes amber on schedule. She does not relight it.\n\n`;
      t += `"The ritual is finished," she says. "What follows is not the ritual, so I will say it in ordinary sentences, and I will say it with the lamp down, so that it is not mistaken for liturgy later."\n\n`;
      if (state.flags.pursuit_sela_cost === "vow") {
        t += `"You spoke the vow where the ship could log it. Neither of us secures the other a place in the vault. I have not read the entry since. I know where it is. It is the only entry about us I wanted to exist."\n\n`;
      } else if (state.flags.pursuit_sela_cost === "private_vow") {
        t += `"You spoke the vow to me and not to the ship. I accepted that. I have not forgotten that I accepted it. If the room ever asks, there is no entry to show them. There is my sentence, and I keep my sentences."\n\n`;
      } else if (state.flags.sela_vault_vow === "refused") {
        t += `"You refused the vow and left the plate. I counted that as honest. It is still counted. A refusal is also a complete sentence."\n\n`;
      } else {
        t += `"There was one measurement. Nothing was asked after it, by either of us. The measurement stands."\n\n`;
      }
      if (state.flags.custody_answer === "shared") {
        t += `"You hold the first key to the vault and I hold the second. I told you in the corridor what the second key is not. The sentence it is has one meaning. I will not translate it. The key does not change with the translation."\n\n`;
      }
      if (state.promises.sela === "kept") {
        t += `"You stood between me and the room. I have not thanked you, because it was promised, and one does not thank a kept promise. One records it."\n\n`;
      } else if (state.promises.sela === "broken") {
        t += `"You let the room have its answer. I said the word spent and I meant it. It is still spent. I am standing here regardless, because standing here is not a claim on you. It is a fact about me."\n\n`;
      }
      t += `"Tonight is not a claim on the next watch either. I say that each time so that it stays true."\n\n`;
      t += `She waits. She does not fill the silence. She never has.`;
      return t;
    },
    get choices() {
      if (!isAlive("sela")) return [{ text: "Leave the lamp.", next: "faction_split" }];
      return [
        { text: "Ask what the ritual means when it is for one person.", next: "sela_past_amber_reply", flag: { sela_amber: "meaning" }, affinity: { sela: 5 }, trust: { sela: 2 } },
        { text: "Ask her for the sentence she is holding.", next: "sela_past_amber_reply", flag: { sela_amber: "sentence" }, affinity: { sela: 5 }, trust: { sela: 2 } },
        { text: "Say nothing. Stay until the filter stops.", next: "sela_past_amber_reply", flag: { sela_amber: "silence" }, affinity: { sela: 5 }, trust: { sela: 2 } }
      ];
    }
  },

  // ═══ SCENE DECLARATION ═══════════════════════════════════════════
  // SCENE_ID: sela_past_amber_reply      TICKET: SUN-ROMANCE-ARC-05 (L-050, Wave 1)
  // PRE: Sela living; flags.sela_amber set by sela_past_amber. Her answer to the answer.
  // WRITES: none. DEATH: none. DEAD SPEECH/APPEARANCE: entry redirects.
  // IMAGE: REUSE images/sela.jpg. No new art.
  // ═════════════════════════════════════════════════════════════════
  sela_past_amber_reply: {
    image: "images/sela.jpg",
    onEnter: () => {
      if (!isAlive("sela")) return "faction_split";
      if (!state.flags.sela_amber) return "faction_split";
    },
    get text() {
      if (!isAlive("sela")) return `The lamp is cold. Nobody lit it.`;
      let t;
      if (state.flags.sela_amber === "meaning") {
        t = `"For the ship it means the dead are named and the living are counted. For one person it means the person is counted on purpose."\n\nA pause the length of a name.\n\n"That is the whole of the meaning. I have not simplified it. There was never more than that, and it was never less."`;
      } else if (state.flags.sela_amber === "sentence") {
        t = `"No."\n\nShe says it in the same voice as everything else.\n\n"A finished sentence is a claim, and I said this was not one. I keep one sentence unfinished. It is mine. You may stand near it. That is what you are doing."`;
      } else {
        t = `The filter runs down to nothing. When the dark is complete she says, "That was the correct amount of speech."`;
      }
      t += `\n\nShe leaves the lamp where it is. Tomorrow it will be lit for the ship again.`;
      return t;
    },
    get choices() { return [ { text: "Let it stay down.", next: afterHour("sela") } ]; }
  },

  // SUN-V035-PLAYTEST-OFFSHIFT-VESS-01 — image-only repair.
  // PRECONDITION: eligVess() / isAlive("vess") via offshift_open, or a partner's late hour after
  // the Commander spent the junction hour with someone else (SUN-ROMANCE-ENDINGS-REACH-01): then
  // junctionChoice keeps that pick, a bridge line opens the scene and no closing line prints.
  // WRITES (unchanged): onEnter junctionChoice + beacon memory; choices may
  // write cohesion -1, last_tx_spent, and the selected beacon memory.
  // DEATH EXPOSURE: none. Vess speaks; live admission unchanged. Invalid-save
  // appearance is guarded by resolveSceneImage; no prose/gate rewrite here.
  // IMAGE: REUSE official images/vess.jpg (L-029), declared in ART_REQUESTS.
  offshift_vess: {
    image: "images/vess.jpg",
    onEnter: () => {
      if (!lateHour("vess")) state.flags.junctionChoice = "vess";
      remember("heard the beacon Vess was holding");
    },
    get text() {
      let t = lateHour("vess") ? `${lateHourOpener("vess")}, the relay bay light is still on when you pass. The bay pings once, log-flat: "Query, non-urgent, still open. The item kept."\n\n` : ``;
      t += `The relay bay runs on console light, cyan off the racks, and her chair is worn pale on one arm where six years of one elbow rested. She gives you the other seat. The hour smells of cold solder and old plastic — the smell of equipment kept alive past its design life by somebody who had to.\n\n`;
      t += `"Item one. Logged receipt forty-one cycles ago, oh-two-hundred. Automated. Ark-band handshake, station-keeping power signature. Verified eleven times."\n\n`;
      t += `She plays it. A preamble tone. A ship designator, repeating, patient as a metronome. Then the gap where an answer would go, and the preamble again.\n\n`;
      t += `"Crews don't maintain station-keeping beacons," she says, and for once she answers slowly, at human tempo — from her, slow is a gift. "Orphans do. Somewhere out there a ship is saying its own name to nobody, on schedule. I did that for six years. I know the accent." A beat, half a beat late, checking the joke is still allowed: "It's good work. Whoever's not alive over there is doing good work."\n\n`;
      // SUN-ROMANCE-ARC-03: the Captain reflex, seeded once here; vess_item_two_logged lets it stand.
      t += `"Disposition is yours, Captain—" A beat. "Commander. The registry stays exact either way. This one gets its own page."`;
      if (state.romance.vess) {
        t += `\n\n"Item two, if you're staying: the chair is rated for one and I'm not moving. Solve it."`;
      }
      const close = lateHour("vess") ? "" : closingPartnerLine();
      if (close) t += `\n\n` + close;
      return t;
    },
    get choices() {
      const c = [
        { text: "Tell the crew.", next: afterHour("vess"), effects: { cohesion: -1 }, remember: "relayed the orphan beacon to the crew" },
        { text: "Hold it between you.", next: afterHour("vess"), remember: "kept the orphan beacon between the two of you" }
      ];
      if (!state.flags.last_tx_spent) {
        c.push({
          text: "Answer it.",
          next: afterHour("vess"),
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
  //   junctionChoice is "vess", or another pick when offshift_vess was her late hour
  //   (SUN-ROMANCE-ENDINGS-REACH-01). Text branches on flags.vess_intimate.
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
      t += `The chair is rated for one. The arm is worn pale where her elbow has lived. The other seat, the one she gave you for item one, is on the far side of the rack.\n\n`;
      t += `"Item one stays on my page until you dispose of it. It'll keep. It kept forty-one cycles."\n\n`;
      if (state.flags.vess_intimate) {
        t += `"I said I would not ask again. I'm not asking. I'm stating a load rating and an occupancy of one, and I'm not moving." Half a beat late: "Procedure for this is a rota. A rota needs two shifts. Solve it."\n\n`;
      } else {
        t += `"Attempt accepted. Window kept by the ship. Status: pending. I don't reopen pending items. I state them." Half a beat late: "Load rating one. Occupancy one. Not moving. Solve it."\n\n`;
      }
      t += `"Captain—" She hears it a beat after you do. "Commander."`;
      return t;
    },
    get choices() {
      if (!isAlive("vess")) return [{ text: "Leave the bay.", next: "faction_split" }];
      return [
        { text: "Take the deck beside the chair. Let her keep it.", next: "vess_item_two_logged", flag: { vess_item_two: "floor" }, affinity: { vess: 5 }, trust: { vess: 2 } },
        { text: "Share the chair. It is rated for one.", next: "vess_item_two_logged", flag: { vess_item_two: "chair" }, affinity: { vess: 5 }, trust: { vess: 2 } }
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
        t = `The chair takes the load. It complains in the arm she does not use, and she lets it. Her elbow goes to the pale place out of six years of habit, finds yours there instead, and stays.\n\n"Rated for one. Occupancy two. Confirmed." Then, in log register and not quite in log register: "Dawnbreak log, personal: rating exceeded. Holding."\n\n`;
      } else {
        t = `You sit on the deck plating with your back to the rack, below the worn arm. She looks down at the arrangement for the length of a verification cycle.\n\n"Occupancy one. Company present. Confirmed." Then, in log register and not quite in log register: "Dawnbreak log, personal: chair held. Uncontested."\n\n`;
      }
      t += `The console light does what it does. She answers the next thing you say a full second late. Not a gift this time. Just her tempo.\n\n"Captain." She does not correct it.`;
      return t;
    },
    get choices() { return [ { text: "Let the entry stand.", next: afterHour("vess") } ]; }
  },

  // ═══════════════════════════════════════════════════════════════
  // CREW PAIRS — full scenes
  // ═══════════════════════════════════════════════════════════════

  // Pair 2 settle
});
