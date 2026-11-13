// Sunsplitter — scenes-52.js
// 0.28.1c size hygiene. Pure mechanical. crewpairs: pairs + warmth
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
      { text: "Leave them to it.", next: "act3_spine_next", reply: [`You leave them to it. From the far end of the corridor you can still hear the argument about the weight. Neither of them is winning, and neither of them wants to.`] },
      { text: "Carry the third corner.", next: "act3_spine_next", reply: [`You take the third corner without asking.`, { who: "jiro", text: `"Load per person down a third," Jiro reports, flat. "The argument about the weight continues at the same volume."` }, { who: "tomas", text: `Tomas takes some of the weight off your corner when he thinks you are not looking.` }] }
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
      { text: "You're right.", next: "act3_spine_next", affinity: { amara: 1 }, reply: [{ who: "amara", text: `"I know, love. Agreeing's the cheap part." Amara turns back to the pump log. "The rest you pay out where the whole garden can see it."` }] },
      { text: "She's not your concern.", next: "act3_spine_next", affinity: { amara: -1 }, reply: [{ who: "amara", text: `"Everyone aboard is my concern. I wrote that job description myself." Amara lets the pumps have the silence. "Go on, then. I've said it once. I'll not nag."` }] },
      { text: "Say nothing.", next: "act3_spine_next", reply: [`Amara reads the silence the way she reads a yield sheet. She nods once, as if you had answered, and lets the pumps have the room.`] }
    ]
  },

  // ═══ SCENE DECLARATION ═══════════════════════════════════════════
  // SCENE_ID: pair_shield_cold
  // PRECONDITIONS: Elias alive; Mira dead from an attributable cause;
  //   pair_shield not already spent on fresh entry
  // STATE WRITES: eligible fresh entry sets pair_shield and records one memory;
  //   invalid or spent fresh entry redirects to faction_split
  // DEATH EXPOSURE: none
  // DEAD-SPEECH CHECK: Elias speech is predicate-guarded; a saved invalid
  //   scene-entry marker renders neutral fallback text instead of dead speech
  // IMAGE: images/elias.jpg only while the same roster/cause predicate holds;
  //   engine resolves invalid saved state to a roster-neutral corridor plate
  // ═════════════════════════════════════════════════════════════════
  pair_shield_cold: {
    image: "images/elias.jpg",
    onEnter: () => {
      if (!isAlive("elias") || isAlive("mira") || !attributableDeath("mira") || state.flags.pair_shield) {
        return "faction_split";
      }
      state.flags.pair_shield = true;
      remember("Elias said she was what the job was for");
    },
    get text() {
      if (!isAlive("elias") || isAlive("mira") || !attributableDeath("mira")) {
        return `The watch report remains in the command log. There is no private accounting to add. The ship moves on.`;
      }
      return `Elias gives the watch report in full sentences with nothing in them. When it's done he doesn't leave. "You never asked what the job was for. She was what the job was for." He says it at the bulkhead, not at you, and it is the only time he will ever say it. "You did the math. I'm not arguing the math. Live in it like I have to." After that, "Commander" is the warmest word you get. On his table, from then on: a torn jacket, kit closed beside it, unmended on purpose.`;
    },
    choices: [ { text: "Continue.", next: "faction_split" } ]
  },

  // ═══════════════════════════════════════════════════════════════
  // CREW FRICTION — SUN-CREW-FRICTION-01 (ROADMAP §14A Wave 1, workstream 3)
  // Four one-shot pair scenes where two crew disagree with each other in front of the Commander,
  // each answering their own reflex question (CHARACTER_BIBLE ensemble rule). One flag per pair,
  // written by the Commander's answer; no resource effects; the reply scene shows both of them
  // acting on the ruling. Dead or unrecovered crew never render: living-cast contracts in
  // scenes-55 plus an onEnter redirect on each scene.
  // ═══════════════════════════════════════════════════════════════

  // ═══ SCENE DECLARATION ═══════════════════════════════════════════
  // SCENE_ID: pair_triage_chart          TICKET: SUN-CREW-FRICTION-01 (§14A Wave 1, workstream 3)
  // PRE: Lena and Tomas living; reached only from act2_spine_next (Tomas just recovered, Rourke
  //   already dead on every path); pair_triage unset. Text keys on flags.rourke.
  // WRITES: none on entry. Each answer writes flags.pair_triage ("chart" | "count" | "open") and a
  //   small affinity nudge; no resource change.
  // DEATH: none. DEAD SPEECH/APPEARANCE: entry redirects to act3_reckoning_pattern when either is
  //   dead (onEnter + living-cast contract); Rourke is named as a chart entry, never speaks.
  // IMAGE: REUSE images/corridor_pressure_2.jpg (Tomas in the frosted corridor; face-gated to Tomas;
  //   no baked text). Lena is out of frame. No new art.
  // ═════════════════════════════════════════════════════════════════
  pair_triage_chart: {
    image: "images/corridor_pressure_2.jpg",
    onEnter: () => {
      if (!isAlive("lena") || !isAlive("tomas")) return "act3_reckoning_pattern";
    },
    get text() {
      if (!isAlive("lena") || !isAlive("tomas")) return `The medbay hatch is shut. The boards keep working.`;
      let t = `Lena has signed Tomas out of the chair and is writing him up on the hatch board without looking at him. "Sprouted stock and reclaimed water. Lamp burn, both corneas. Malnourished. Treatable." The last word goes to the board. He stands in the corridor where the frost still hasn't come off the pipes and reads the board through the open hatch, upside down, the way he reads a tray schedule, and he has found the line below the living.\n\n`;
      const r = state.flags.rourke;
      if (r === "stopped") {
        t += `"Rourke," Tomas says. "Treatment stopped. By order." He reads it the way he'd read a seed count that came up short. "I wasn't aboard to be asked about that. I'm aboard now. He goes in the count. A name, not an entry."\n\n`;
        t += `"He goes in the chart as what he was." Lena caps the pen. "Chest full of shrapnel from the ring. The last stabilizers were in him before anyone gave an order. The order moved the time of death. It did not move the death. That line is for prognoses."\n\n`;
      } else if (r === "stayed") {
        t += `"Rourke," Tomas says. "Died with company." He reads it twice. "Somebody sat with him. That's the first thing I've found on this ship I'd have done myself. He goes in the count. A name, not an entry."\n\n`;
        t += `"He goes in the chart as already lost on first look." Lena caps the pen. "Chest full of shrapnel from the ring. The last stabilizers were in him before anyone sat down. The sitting was for the room. I don't chart the room. That line is for prognoses."\n\n`;
      } else if (r === "tried") {
        t += `"Rourke," Tomas says. "Forty-three minutes." He reads it the way he'd read a seed count that came up short. "Forty-three minutes of supplies went into a man she'd already called, because you asked her to. Somebody breathing pays for those minutes down the line. I count him. I count the minutes too."\n\n`;
        t += `"I knew at minute one what I knew at forty-three." Lena caps the pen. "Chart the minutes as mine, not the ship's. He stays on that line as what he was: ring shrapnel, chest, already lost. That line is for prognoses."\n\n`;
      } else {
        t += `"Rourke," Tomas says. He reads the cause twice. "Died while the room was getting itself a Commander. That's a sentence I'd like out of the count, and I can't have it out. He goes in. A name, not an entry."\n\n`;
        t += `"He died of the ring." Lena caps the pen. "Chest full of shrapnel. The last stabilizers were in him before the room did anything at all. Who was in charge is not a medical finding. That line is for prognoses."\n\n`;
      }
      t += `"A manifest with a dead man on it is still a manifest," Tomas says, "and he goes in it the same as every tray and every mouth that ever fed this ship goes in it, because a count that leaves out the dead isn't a count, it's a menu. Who paid for the line below the living? Everyone on it. That's why I keep it."\n\n`;
      t += `"Who's hurt on the line below the living? Nobody." Lena turns the board face down. "That's why I don't."\n\n`;
      t += `Neither of them looks at you. The pen is capped. The count is open.`;
      return t;
    },
    choices: [
      { text: "The chart stands. That line is for prognoses.", next: "pair_triage_after", flag: { pair_triage: "chart" }, affinity: { lena: 2, tomas: -1 } },
      { text: "Count him. Names go on the list, the dead included.", next: "pair_triage_after", flag: { pair_triage: "count" }, affinity: { tomas: 2, lena: -1 } },
      { text: "Leave them both their lists.", next: "pair_triage_after", flag: { pair_triage: "open" } }
    ]
  },

  // ═══ SCENE DECLARATION ═══════════════════════════════════════════
  // SCENE_ID: pair_triage_after          TICKET: SUN-CREW-FRICTION-01
  // PRE: Lena and Tomas living; flags.pair_triage set by pair_triage_chart.
  // WRITES: one memory keyed on the answer (dedupes). No flag or resource change.
  // DEATH: none. DEAD SPEECH/APPEARANCE: entry redirects when either is dead or no answer exists.
  // IMAGE: REUSE images/corridor_pressure_2.jpg, as above.
  // ═════════════════════════════════════════════════════════════════
  pair_triage_after: {
    image: "images/corridor_pressure_2.jpg",
    onEnter: () => {
      if (!isAlive("lena") || !isAlive("tomas") || !state.flags.pair_triage) return "act3_reckoning_pattern";
      const a = state.flags.pair_triage;
      remember(a === "chart" ? "ruled Rourke a prognosis, not a name, with Tomas at the hatch"
        : a === "count" ? "put Rourke in Tomas's count by name, in Lena's margin"
        : "left Lena's chart and Tomas's count to disagree about Rourke");
    },
    get text() {
      if (!isAlive("lena") || !isAlive("tomas")) return `The medbay hatch is shut. The boards keep working.`;
      const a = state.flags.pair_triage;
      if (a === "chart") {
        return `Tomas straightens up off the frame carefully, the way a man straightens who has been half-blind for a while. "Then the count's mine," he says. "I'll keep it where it doesn't need a line on her board." He uses the rank on the way down the corridor.${state.flags.tomas_scapegoated ? "" : " At the manifest it was your name."}\n\nLena turns the board face up and does not amend it. "Prognosis stands," she says, to the board. "It did before he came out."`;
      }
      if (a === "count") {
        return `Lena writes it. Not on the line; beside it, in the margin where she keeps the things that are true and not medical. A name, the cause, nothing softer. "That's a margin note," she says. "It doesn't change the prognosis. Nothing does."\n\nTomas reads it upside down through the hatch and nods once, the way he nods at a tray that came up full. "That's the count," he says. "${state.dead.length > 1 ? "It was never only him" : "It isn't a long one yet"}. ${state.flags.tomas_scapegoated ? `Thank you, Commander." The rank, still. The thanks is new.` : `Thank you." He uses your name for it, the way he did at the manifest.`}`;
      }
      return `Nobody rules. Tomas takes the count with him when he goes, and uses the rank at the bend in the corridor.${state.flags.tomas_scapegoated ? "" : " At the manifest it was your name."} Lena turns the board face up and leaves the line as it was.\n\n"It'll come up again," she says. "It presents that way."`;
    },
    choices: [ { text: "Back to the work.", next: "act3_reckoning_pattern" } ]
  },

  // ═══ SCENE DECLARATION ═══════════════════════════════════════════
  // SCENE_ID: pair_seal_ledger           TICKET: SUN-CREW-FRICTION-01 (§14A Wave 1, workstream 3)
  // PRE: Elias and Tomas living; Tomas not scapegoated; reached from the act3_spine_next pair block;
  //   pair_seal unset. Text keys on flags.ship_memory and flags.ship_interrupt.
  // WRITES: none on entry. Each answer writes flags.pair_seal ("bulkhead" | "names" | "both") and a
  //   small affinity nudge; no resource change.
  // DEATH: none. DEAD SPEECH/APPEARANCE: entry redirects to act3_spine_next when either is dead
  //   (onEnter + living-cast contract). Amara, who argued the paste, is not named and does not appear.
  // IMAGE: REUSE images/arc_living_3.jpg (Tomas and Elias in the red-lit corridor, Commander's back;
  //   Muse roster 2026-11-05, face-gated to both; no baked text). Never shown before. No new art.
  // ═════════════════════════════════════════════════════════════════
  pair_seal_ledger: {
    image: "images/arc_living_3.jpg",
    onEnter: () => {
      if (!isAlive("elias") || !isAlive("tomas")) return "act3_spine_next";
    },
    get text() {
      if (!isAlive("elias") || !isAlive("tomas")) return `Deck 4 is quiet. The boards keep working.`;
      const mem = state.flags.ship_memory;
      const spend = mem === "jury_rig" ? "the halves" : "the ten days";
      let t = `Elias has his hand flat on the Deck 4 manual dog, the way he checks it every watch, and Tomas has the galley slate, and neither of them says the word that started it. You hear the end.\n\n`;
      if (mem === "open_wound") {
        t += `"Ten days of paste fed this ship," Tomas says. "I've counted it on the ledger since I came aboard. That's the kind of debt I like. Eaten."\n\n`;
        t += `"The schematic shows a wound where a seal should be." Elias's hand stays on the dog. "That argument was held once, in this corridor. I don't hold it twice. The section will."\n\n`;
      } else if (mem === "jury_rig") {
        t += `"Half-rations and a thin patch," Tomas says. "This ship paid in halves. I count halves as whole mouths by the end of the month, because that's what they come to."\n\n`;
        t += `"A thin patch is a threat with a date on it." Elias's hand stays on the dog. "The date isn't on your slate. When it comes, I'll tell you which section."\n\n`;
      } else {
        t += `"Ten days of paste is what went into that patch instead," Tomas says. "Ten days is thirty meals a mouth. I wasn't aboard to be asked. I'm asking now who paid, because it's paid."\n\n`;
        t += `"The seal." Elias doesn't take his hand off the dog. "The threat was the seal. The seal holds. That's the account."\n\n`;
      }
      if (state.flags.ship_interrupt === "deferred") {
        t += `"It talked back, last flex," Elias adds. "Somebody answered late. The schematic has that too."\n\n`;
      }
      t += `"Somebody eats ${spend}," Tomas says. "I want them on the slate under names. Not under 'bulkhead.'"\n\n`;
      t += `Elias looks at the dog, not at either of you. "Put 'bulkhead' on the slate. It's the one line on it that can take the rest."\n\n`;
      t += `Both of them wait. The dog is cold under his hand. The slate is full.`;
      return t;
    },
    get choices() {
      const spend = state.flags.ship_memory === "jury_rig" ? "the halves" : "the ten days";
      return [
        { text: "The bulkhead is the line. Keep the slate to the living.", next: "pair_seal_after", flag: { pair_seal: "bulkhead" }, affinity: { elias: 2, tomas: -1 } },
        { text: `Put ${spend} under names. Tomas keeps the slate.`, next: "pair_seal_after", flag: { pair_seal: "names" }, affinity: { tomas: 2, elias: -1 } },
        { text: "Keep both accounts. The section will present one of them.", next: "pair_seal_after", flag: { pair_seal: "both" } }
      ];
    }
  },

  // ═══ SCENE DECLARATION ═══════════════════════════════════════════
  // SCENE_ID: pair_seal_after            TICKET: SUN-CREW-FRICTION-01
  // PRE: Elias and Tomas living; flags.pair_seal set by pair_seal_ledger.
  // WRITES: one memory keyed on the answer (dedupes). No flag or resource change.
  // DEATH: none. DEAD SPEECH/APPEARANCE: entry redirects when either is dead or no answer exists.
  // IMAGE: REUSE images/arc_living_3.jpg, as above.
  // ═════════════════════════════════════════════════════════════════
  pair_seal_after: {
    image: "images/arc_living_3.jpg",
    onEnter: () => {
      if (!isAlive("elias") || !isAlive("tomas") || !state.flags.pair_seal) return "act3_spine_next";
      const a = state.flags.pair_seal;
      remember(a === "bulkhead" ? "ruled the Deck 4 feedstock a bulkhead line, not a name"
        : a === "names" ? "put the Deck 4 feedstock on Tomas's slate under names"
        : "left Elias's dog and Tomas's slate both open on Deck 4");
    },
    get text() {
      if (!isAlive("elias") || !isAlive("tomas")) return `Deck 4 is quiet. The boards keep working.`;
      const a = state.flags.pair_seal;
      if (a === "bulkhead") {
        return `Elias takes his hand off the dog. "Bulkhead," he says, and that is the whole acknowledgment.\n\nTomas writes it on the slate under the last name. One word, underlined nothing. "It's on the slate, Commander. I'll count what it eats when it eats it."`;
      }
      if (a === "names") {
        return `Tomas writes them. Not the paste; the mouths, by name, down the slate, with the days beside them. Elias watches him do it with his hand still on the dog.\n\n"Names on a slate don't hold pressure," Elias says. "The dog does. Check it every watch." He goes.\n\nTomas finishes the column. "I'll check the dog too," he says. "A name's no good to me with the air gone."`;
      }
      return `Neither account closes. Elias checks the dog on his way out, the way he checks it every watch. Tomas keeps the slate under his arm, the way he keeps the count.\n\nThe section says nothing yet.`;
    },
    choices: [ { text: "Back to the corridor.", next: "act3_spine_next" } ]
  },

  // ═══ SCENE DECLARATION ═══════════════════════════════════════════
  // SCENE_ID: pair_burn_archive          TICKET: SUN-CREW-FRICTION-01 (§14A Wave 1, workstream 3)
  // PRE: Mira and Jiro living; margin_committed (a reckoning burn happened); reached from the
  //   act3_spine_next pair block; pair_burn unset. Text keys on burn_unverified / margin_spent_extra.
  // WRITES: none on entry. Each answer writes flags.pair_burn ("finding" | "width" | "both") and a
  //   small affinity nudge; no resource change.
  // DEATH: none. DEAD SPEECH/APPEARANCE: entry redirects to act3_spine_next when either is dead
  //   (onEnter + living-cast contract). Lane rule kept: Mira diagnostic, Jiro positional.
  // IMAGE: REUSE images/arc_future_3.jpg (Mira and Jiro at a console in the records bay, Commander's
  //   back; Muse roster 2026-11-05, face-gated to both; no baked text). Never shown before. No new art.
  // ═════════════════════════════════════════════════════════════════
  pair_burn_archive: {
    image: "images/arc_future_3.jpg",
    onEnter: () => {
      if (!isAlive("mira") || !isAlive("jiro")) return "act3_spine_next";
    },
    get text() {
      if (!isAlive("mira") || !isAlive("jiro")) return `The records bay is dark. The boards keep working.`;
      let t = `They're at the nav console in the records bay, and the pane between them is closed. Jiro has asked for something. Mira has not opened it.\n\n`;
      if (state.flags.burn_unverified) {
        t += `"The solution is archived," Mira says. "Archived means I finished it after the burn. It changes nothing a burn can still change."\n\n`;
        t += `"It changes the width of the bar I live in." Jiro doesn't look up from the pane. "I flew nineteen days inside that bar. I'd like its edges. To the meter if you have it, to the kilometer if you don't."\n\n`;
        t += `"The edges are a fault report. Root cause: a burn ordered on eleven-day-old numbers I had not checked yet. If I open it, that sentence goes in the log with a figure under it."\n\n`;
        t += `"Then it's in the log. A position doesn't care what caused it. I log where."\n\n`;
        t += `"And the next reader of that log trusts the width, and the cause that made it wide isn't under it." She has not raised her voice. The pane is still closed.\n\n`;
      } else if (state.flags.margin_spent_extra) {
        t += `"The solution was verified," Mira says. "The figure is in the archive. The cycle the ship spent arguing cost margin. It did not cost confidence. Two line items."\n\n`;
        t += `"One item." Jiro doesn't look up from the pane. "Eight corrections by hand at six-hour intervals while the ship argued it properly, and a width I can give you to the meter. The margin went where the width went, Commander. One column. Mine."\n\n`;
        t += `"Your column has the symptom. The gauge fell further than the solution required. Root cause: the cycle, not the solution. Log the width without the cause and the solution takes the blame from whoever reads it next."\n\n`;
        t += `"Day one hundred eighty-one, one corridor, one pass. We make it or we don't. Nobody who needs that log will be reading it."\n\n`;
      } else {
        t += `"Ninety-four," Mira says. "The other six belongs to the universe. That's the finding. It hasn't changed since I gave it."\n\n`;
        t += `"Six is a width." Jiro doesn't look up from the pane. "Percent is a confidence. I fly a width."\n\n`;
        t += `"Width is derived. The confidence is the finding."\n\n`;
        t += `"Thirty-eight minutes of my air loop went into the finding, Commander. I was breathing them. I'd like the width to the meter, so I know what they bought."\n\n`;
        t += `"They bought ninety-four." She says it exactly as she said it the first time, because it has not changed.\n\n`;
      }
      t += state.flags.burn_unverified ? `"What broke is the order of operations," Mira says. "That is the finding."\n\n`
        : state.flags.margin_spent_extra ? `"The cycle broke the margin. The solution held," Mira says. "That is the finding."\n\n`
        : `"Nothing broke," Mira says.\n\n`;
      t += `"Where we are is inside forty kilometers," Jiro says. "That is the fix."\n\n`;
      t += `Neither of them has moved off the sentence they came in with. The pane stays closed until somebody says which log it goes in.`;
      return t;
    },
    get choices() {
      const rootCause = state.flags.burn_unverified || state.flags.margin_spent_extra;
      return [
        { text: rootCause ? "Log Mira's finding, with its root cause." : "Log Mira's finding. Ninety-four, nothing under it.", next: "pair_burn_after", flag: { pair_burn: "finding" }, affinity: { mira: 2, jiro: -1 } },
        { text: "Log Jiro's width, to the meter. Nothing under it.", next: "pair_burn_after", flag: { pair_burn: "width" }, affinity: { jiro: 2, mira: -1 } },
        { text: "Log both, and let the record disagree.", next: "pair_burn_after", flag: { pair_burn: "both" } }
      ];
    }
  },

  // ═══ SCENE DECLARATION ═══════════════════════════════════════════
  // SCENE_ID: pair_burn_after            TICKET: SUN-CREW-FRICTION-01
  // PRE: Mira and Jiro living; flags.pair_burn set by pair_burn_archive.
  // WRITES: one memory keyed on the answer (dedupes). No flag or resource change.
  // DEATH: none. DEAD SPEECH/APPEARANCE: entry redirects when either is dead or no answer exists.
  // IMAGE: REUSE images/arc_future_3.jpg, as above.
  // ═════════════════════════════════════════════════════════════════
  pair_burn_after: {
    image: "images/arc_future_3.jpg",
    onEnter: () => {
      if (!isAlive("mira") || !isAlive("jiro") || !state.flags.pair_burn) return "act3_spine_next";
      const a = state.flags.pair_burn;
      remember(a === "finding" ? ((state.flags.burn_unverified || state.flags.margin_spent_extra) ? "logged the burn as Mira's fault report, root cause and figure" : "logged the burn as Mira's finding, ninety-four and nothing under it")
        : a === "width" ? "logged the burn as Jiro's width, nothing under it"
        : "let the burn stand in two logs that disagree");
    },
    get text() {
      if (!isAlive("mira") || !isAlive("jiro")) return `The records bay is dark. The boards keep working.`;
      const a = state.flags.pair_burn;
      const rootCause = state.flags.burn_unverified || state.flags.margin_spent_extra;
      if (a === "finding") {
        return (rootCause ? `Mira opens the pane. The figure is there, and the sentence under it, in her hand, with the time.` : `Mira opens the pane. The figure is there, in her hand, with the time, and nothing under it.`)
          + `\n\nJiro reads it once and does not read it twice. "Width noted," he says. "I'll fly it.${rootCause ? ` The cause is yours.` : ``}" He logs the width in his own pane${rootCause ? ` without the sentence` : ``}. The two entries carry the same timestamp.`;
      }
      if (a === "width") {
        return `Jiro logs the width. To the meter, with the bar, and nothing under it.\n\n`
          + (rootCause ? `Mira watches the entry close. "Fault report stays archived," she says. "Root cause unlogged, by order. Those five words are in my log, with a time on them." She closes her pane.`
            : `Mira watches the entry close. "The finding stays as given," she says. "Ninety-four. I have logged that the width was ordered beside it, with the time." She closes her pane.`)
          + `\n\nHe does not look up. "Where we are hasn't changed," he says. "It's the only thing on this console that hasn't."`;
      }
      return (rootCause ? `Two entries, one timestamp. Hers: finding, root cause, figure. His: width, to the meter, no cause.` : `Two entries, one timestamp. Hers: finding, ninety-four. His: width, to the meter.`)
        + ` They do not reconcile them, and nobody asks them to.\n\nMira closes her pane first. "The record disagrees with itself," she says. "That's accurate. So do we."\n\n"Position unchanged," Jiro says. It is the closest the two of them come to agreeing, and it is close.`;
    },
    choices: [ { text: "Back to the corridor.", next: "act3_spine_next" } ]
  },

  // ═══ SCENE DECLARATION ═══════════════════════════════════════════
  // SCENE_ID: pair_fix_track             TICKET: SUN-CREW-FRICTION-01 (§14A Wave 1, workstream 3)
  // PRE: Jiro and Vess living (Vess recovered); position_certain (Jiro's fix exists); reached from
  //   the act3_spine_next pair block; pair_fix unset.
  // WRITES: none on entry. Each answer writes flags.pair_fix ("fix" | "track" | "both") and a small
  //   affinity nudge; no resource change.
  // DEATH: none. DEAD SPEECH/APPEARANCE: entry redirects to act3_spine_next when either is dead or
  //   unrecovered (onEnter + living-cast contract). Vess's Dawnbreak dead are a count she keeps,
  //   not speakers. The held item from her night log (offshift_vess) is not named here.
  // IMAGE: REUSE images/art_r2_observation_wreck.jpg (people-free, text-free; the observation
  //   deck after the cut). No crew faces. No new art.
  // ═════════════════════════════════════════════════════════════════
  pair_fix_track: {
    image: "images/art_r2_observation_wreck.jpg",
    onEnter: () => {
      if (!isAlive("jiro") || !isAlive("vess")) return "act3_spine_next";
    },
    get text() {
      if (!isAlive("jiro") || !isAlive("vess")) return `The tracker board is dark. The boards keep working.`;
      let t = `Jiro has the fix on the tracker board: one line, one bar, the number under it to the meter. Vess has her night log on a slate beside it, eleven months long, and she has set the two down next to each other without being asked to.\n\n`;
      t += `"Eleven months of your hull ID," she says. "Every night. Bearing and strength, timestamped. It walked across my sky at a rate. The rate has a number. I'm not rounding it."\n\n`;
      t += `"A bearing is a direction with a time on it." Jiro says it to the board. "A fix is where. Your log says where you were when you heard us. It doesn't say where we were."\n\n`;
      t += `"It says what was out there listening, and from where. That's a track. Dawnbreak ran two logs. Nav and ears."\n\n`;
      t += `"And when they disagreed?"\n\n`;
      t += `"We trusted the one that was still alive." Flat. Timestamp, stop. It is not a joke, and she does not check whether it was allowed to be one.\n\n`;
      t += `"The one that's still alive is on the board," Jiro says. "Inside forty kilometers, fixed from independent sources since I came out. Yours is one source."\n\n`;
      t += `"One source that never missed a night. Eleven months." She doesn't look at him. "Two logs, Commander. Which one does the ship fly?"`;
      return t;
    },
    choices: [
      { text: "The fix is the ship's. One log.", next: "pair_fix_after", flag: { pair_fix: "fix" }, affinity: { jiro: 2, vess: -1 } },
      { text: "Vess's track goes on the board. The ears have the longer record.", next: "pair_fix_after", flag: { pair_fix: "track" }, affinity: { vess: 2, jiro: -1 } },
      { text: "Both logs on the board. Reconcile them, now, together.", next: "pair_fix_after", flag: { pair_fix: "both" }, affinity: { jiro: 1, vess: 1 } }
    ]
  },

  // ═══ SCENE DECLARATION ═══════════════════════════════════════════
  // SCENE_ID: pair_fix_after             TICKET: SUN-CREW-FRICTION-01
  // PRE: Jiro and Vess living; flags.pair_fix set by pair_fix_track.
  // WRITES: one memory keyed on the answer (dedupes). No flag or resource change.
  // DEATH: none. DEAD SPEECH/APPEARANCE: entry redirects when either is dead or no answer exists.
  // IMAGE: REUSE images/art_r2_observation_wreck.jpg, as above.
  // ═════════════════════════════════════════════════════════════════
  pair_fix_after: {
    image: "images/art_r2_observation_wreck.jpg",
    onEnter: () => {
      if (!isAlive("jiro") || !isAlive("vess") || !state.flags.pair_fix) return "act3_spine_next";
      const a = state.flags.pair_fix;
      remember(a === "fix" ? "flew Jiro's fix as the ship's one column"
        : a === "track" ? "put Vess's eleven-month track on the board beside Jiro's fix"
        : "Jiro and Vess reconciled the board, and the ship took it as gospel");
    },
    get text() {
      if (!isAlive("jiro") || !isAlive("vess")) return `The tracker board is dark. The boards keep working.`;
      const a = state.flags.pair_fix;
      if (a === "fix") {
        return `Jiro leaves the one line on the board. Vess closes the night log.\n\n"Confirmed," she says. "Ears stand down. Say again if the board changes."\n\n"It will, inside the bar," he says, and gives her the number under it, to the meter, with a timestamp, the way she keeps hers.`;
      }
      if (a === "track") {
        return `Jiro puts her track on the board under his line and does not take his line down. The two run close and not together.\n\n"The ears have eleven months," he says. "The board has one bar. I'll hold both until one of them is wrong."\n\n"Negative on wrong," Vess says. "One of them is coarser." It is the first thing she has corrected him on, and she does it in the register she keeps for her dead: exact, in order, nothing rounded.`;
      }
      return `They put the two logs on the board together and run them against each other, out loud, for most of an hour. Bearing against position. Rate against bar. Timestamp against timestamp.\n\nThe ears and the nav agree to inside his bar. Neither of them says so. Jiro changes nothing on the board. Vess closes the log. "Confirmed," she says. "Position holds," he says.\n\nBy the next watch the whole ship has it: the two of them agreed, so the board is where the ship is, and nobody asks again.`;
    },
    choices: [ { text: "Back to the corridor.", next: "act3_spine_next" } ]
  },

  // ═══════════════════════════════════════════════════════════════
  // SCHEDULED WARMTH
  // ═══════════════════════════════════════════════════════════════

  warmth_meal: {
    image: "images/hydroponics.jpg",
    onEnter: () => {
      if (!isAlive("tomas")) return "act3_spine_next";
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
      { text: "Stay for the second pot.", next: "act3_spine_next", reply: [`You stay for the second pot, and for the scraping of it.`, { who: "tomas", text: `Tomas fills your bowl again without asking. "Seconds are a vote," he says. "I count those too."` }] },
      { text: "Take yours and go.", next: "act3_spine_next", reply: [`You take your bowl and go.`, { who: "tomas", text: `"Bring the bowl back," Tomas calls after you. "And yourself, some night. The table keeps a count."` }] }
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
      if (isAlive("vess")) {
        t += ` — and Vess is one — and Vess is telling a joke a half-beat behind her own timing, like reading music at sight.`;
      } else {
        t += ` — and one of them is telling a joke, timing it by the other voice.`;
      }
      t += ` The setup is old. Rourke's, by the shape of it. Someone else lands it now, and the laugh that comes back is real — short, ugly, the kind that survives on this ship because it has to be fed so little.`;
      if (living.length <= 3) {
        t += `\n\nIt's two voices where there used to be a mess hall of them, and it is quieter, and it still counts. It counts more.`;
      }
      return t;
    },
    choices: [
      { text: "Listen one more minute from the dark.", next: "act3_spine_next", reply: [`You give it the minute. There is a second joke, worse than the first, and it gets a laugh too. When you walk on, you take the long way round, so they never learn they had an audience.`] },
      { text: "Move on.", next: "act3_spine_next", reply: [`You go back the way you came. The laugh follows you a few hatches down the corridor, then drops below hearing, which is not the same as stopping.`] }
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
      { text: "Stay until the track ends.", next: "act3_spine_next", reply: [`You stay until the track ends. It ends on a held note the little speaker cannot quite carry, and then the next one starts, and nobody moves to stop it.`, { who: "vess", text: `Vess doesn't look over. "You stayed," she says, a half-beat late. "Logged. Not as a complaint."` }] },
      { text: "Go.", next: "act3_spine_next", reply: [`You go. Behind you the music keeps playing to the empty berths at the same half volume, as if it expected nothing else.`] }
    ]
  }
});
