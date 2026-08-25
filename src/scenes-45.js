// Sunsplitter — scenes-45.js
// 0.28.1c size hygiene. Pure mechanical. promises: vent + deck4
// Strict scene shape only: text | choices | onEnter | image
registerScenes({

  prom_vent: {
    image: "images/prom_vent.jpg",
    onEnter: () => {
      if (state.crisisPath !== "breath" || state.promises.amara !== "made" || !isAlive("amara")) return "prom_deck4";
      const v = ["jiro", "vess"].find(k => isAlive(k));
      if (!v) return "prom_deck4";
      state.flags.prom_line_other = v;
    },
    get text() {
      const v = state.flags.prom_line_other;
      if (!v || !crew[v] || !isAlive(v)) return `The service run reads clear. The loop holds.`;
      const name = crew[v].first;
      const line = v === "jiro"
        ? `"I've run out of margin twice before," Jiro says over the panel channel, even now. "Take the reading, Commander. Don't round it kindly."`
        : `"Dawnbreak protocol for shared air was: youngest yields," Vess says, log-flat. "I never got to yield. Filed, in case it matters now."`;
      return `The biofilm is not finished. Its last pocket re-blooms in the dead-end service run behind the scrubber manifold, and the loop's answer is already queued: vent the pocket, keep the margin it just paid for.

${name} is inside it, taking the manual readings the rebuilt loop still cannot.

${line}

Amara is at the panel with her hand flat beside the vent control, not on it. "The pocket reads one body and bad air," she says. "The loop reads margin. Somebody here keeps the other book."`;
    },
    get choices() {
      const v = state.flags.prom_line_other;
      const name = v && crew[v] ? crew[v].first : "them";
      return [
        { text: `Hold the vent. Cut ${name} out by hand.`,
          next: "prom_vent_keep",
          effects: { integrity: -2 },
          remember: `You kept the promise to Amara. ${name} came out of the pocket breathing.` },
        { text: "Vent the pocket now. The margin holds.",
          next: "prom_vent_break",
          remember: `You broke the promise to Amara. ${name} was vented breathing.` }
      ];
    }
  },

  // PRE: from prom_vent choice 1 | WRITES: onEnter promises.amara="kept" (idempotent) | DEATH: none | IMG: reuse
  prom_vent_keep: {
    image: "images/prom_vent_keep.jpg",
    onEnter: () => {
      if (state.promises.amara === "made") state.promises.amara = "kept";
    },
    get text() {
      const v = state.flags.prom_line_other;
      const name = v && crew[v] ? crew[v].first : "The reader";
      let t = `The cut takes most of a watch and a hull rating you did not have to spare. ${name} comes out coughing, breathing, carried the last three meters.

The pocket re-fouls the margin it was going to buy. The boards show it without comment.`;
      if (isAlive("amara")) {
        t += `\n\nAmara closes the vent queue herself, every field, exact. "Balanced," she says. "The beds stay in the fight. So do I."`;
      }
      return t;
    },
    choices: [ { text: "Log the cost. Continue.", next: "prom_deck4" } ]
  },

  // PRE: from prom_vent choice 2 | WRITES: onEnter kill(victim) + promises.amara="broken" (idempotent) | DEATH: victim dies onEnter | IMG: reuse
  prom_vent_break: {
    image: "images/prom_vent_break.jpg",
    onEnter: () => {
      if (state.promises.amara === "made") {
        state.promises.amara = "broken";
        if (state.flags.prom_line_other) {
          kill(state.flags.prom_line_other, "vented breathing in the service pocket");
        }
      }
    },
    get text() {
      const v = state.flags.prom_line_other;
      const name = v && crew[v] ? crew[v].first : "The suit tag";
      let t = `The pocket vents. The margin holds.

${name}'s suit tag stops before the pressure does.`;
      if (isAlive("amara")) {
        t += `\n\nAmara takes her hand off the panel like it burned her.

"You said: I will not vent anyone who is still breathing."

She logs the vent herself, every field, exact. "The next time you say living to me, I will show you this entry." She does not stay near you after.`;
      }
      return t;
    },
    choices: [ { text: "Close the log. Continue.", next: "prom_deck4" } ]
  },

  // PRE: promises.elias made && isAlive(elias) && ship_memory open_wound|jury_rig | WRITES: none | DEATH: none | IMG: reuse
  prom_deck4: {
    image: "images/bulkhead.jpg",
    onEnter: () => {
      if (state.promises.elias !== "made" || !isAlive("elias") ||
          (state.flags.ship_memory !== "open_wound" && state.flags.ship_memory !== "jury_rig")) {
        return "prom_line";
      }
    },
    text: () => `The ship finishes a sentence it started years ago.

Deck Four's record comes back at 0300, unasked: a manifest header, names with berth codes, and half a minute of audio. People organizing, calm. A door query repeating like a metronome. Then carrier tone.

The reconstruction flags itself complete and sits in the buffer, unread by anyone. For now.`,
    choices: [
      { text: "Take it to Elias first. Whole.",
        next: "prom_deck4_keep",
        effects: { cohesion: -2 },
        remember: "You brought the Deck Four record to Elias first, whole." },
      { text: "Release it to the general log. After review.",
        next: "prom_deck4_break",
        flag: { prom_deck4_edited: true },
        remember: "You released the Deck Four record edited." },
      { text: "Bury it in the buffer.",
        next: "prom_deck4_break",
        flag: { prom_deck4_buried: true },
        remember: "You buried the Deck Four record." }
    ]
  },

  // PRE: from prom_deck4 choice 1 | WRITES: onEnter promises.elias="kept" (idempotent) | DEATH: none | IMG: reuse
  prom_deck4_keep: {
    image: "images/observation.jpg",
    onEnter: () => {
      if (state.promises.elias === "made") state.promises.elias = "kept";
    },
    get text() {
      if (!isAlive("elias")) return `The record waits in an empty security queue.`;
      return `Elias listens to the whole of it standing, at parade rest, like the audio outranks him. When the carrier tone comes he lets it run nine seconds before he cuts it.

"Reyes. The rest I knew by corridor, not by name. Now I know them by name."

By second shift the whole ship has heard it. He played it in the mess, once, at full volume, and stood by the speaker while it ran. "They were organized," he tells the room. "To the end. That's the report."

Nobody works well that day.`;
    },
    choices: [ { text: "Let the ship carry it. Continue.", next: "prom_line" } ]
  },

  // PRE: from prom_deck4 choices 2/3 | WRITES: onEnter promises.elias="broken" (idempotent) | DEATH: none | IMG: reuse
  prom_deck4_break: {
    image: "images/bulkhead.jpg",
    onEnter: () => {
      if (state.promises.elias === "made") state.promises.elias = "broken";
    },
    get text() {
      if (!isAlive("elias")) return `The record keeps its edit history. No one is left to read it.`;
      if (state.flags.prom_deck4_edited) {
        return `You release it curated: the names, the header, the calm. The door query and the carrier tone stay in the buffer.

Elias finds the seam by the third listen. He has spent his life on doors, and you cut a door out of the record.

"You said: if Deck Four comes back, I hear it from you first." He hands the slate back. "Amend the log. First to hear the edited version. Everything you touch comes back cleaner. That's the problem."`;
      }
      const vessLine = isAlive("vess")
        ? `Eleven days later Vess, sweeping stale channels, surfaces it in a routine pass and routes it wide before anyone can decide otherwise. She keeps her dead in order. She extends the courtesy.`
        : `Eleven days later a routine buffer purge routes it wide, unread and unclaimed.`;
      return `The buffer holds it. ${vessLine}

Elias hears the record standing in the mess with everyone else.

"You said: if Deck Four comes back, I hear it from you first." His voice stays at report volume. "I heard it from the wall."`;
    },
    choices: [ { text: "Take the report. Continue.", next: "prom_line" } ]
  },

  // PRE: promises.lena made && isAlive(lena) && ladder(mira-if-severed→jiro→vess) | WRITES: onEnter prom_line_other (deterministic recompute) | DEATH: none here | IMG: reuse
});
