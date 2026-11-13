// Sunsplitter — scenes-26.js
// 0.28.1c size hygiene. Pure mechanical. late: reckon public + suppress + memory + truth
// Strict scene shape only: text | choices | onEnter | image
registerScenes({

  reckon_public: {
    get text() {
      let t = `You gather the living in the common area.\n\nYou do not soften what was done. You name the dead if there are dead. You name the living. You state the costs in supplies, hull, and time.\n\nSome cry. Some stare at the floor.`;
      // SUN-CASCADE-SECOND-FLAG-PAYOFF-01: late pay of midgame manifest write.
      if (state.flags.manifest === "read") {
        t += isAlive("tomas")
          ? ` Tomas does not ask for the boarding list. Two hundred fourteen confirmed berths are already in the accounting.`
          : ` The boarding list is already in the accounting. Two hundred fourteen confirmed berths. No one has to open the tablet.`;
      } else if (state.flags.manifest === "declined") {
        t += isAlive("tomas")
          ? ` Tomas asks once for the names. You let the manifest stay closed; he counts the estimates and does not nod.`
          : ` The accounting uses estimates. You let the manifest stay closed.`;
      } else if (isAlive("tomas")) {
        t += ` Tomas nods through the entire accounting.`;
      }
      // SUN-CALLBACKS-01: a tested promise and a vented pocket, cited where the accounting is public. Text only.
      if (isAlive("amara") && isAlive("tomas") && state.promises.amara === "broken") {
        t += ` Amara has not set a plate for you since the pocket was vented. Tomas sets it and says nothing.`;
      }
      t += `\n\n`;
      if (isAlive("mira")) {
        t += `When it is finished, Mira stands.\n\n`;
        if (state.promises.mira === "kept") t += `"The old rules were refused. The living kept the vote. I check that against the drive every watch. It holds."\n\n`;
        else if (state.promises.mira === "broken") t += `"The old rules are back. The hull fails eleven percent less often. We get zero votes. I said both numbers were load-bearing. One of them is bearing more."\n\n`;
        t += `"We're still here. That's the only order that matters."\n\nThe others rise, unevenly.`;
      } else {
        t += `When it is finished, the room does not produce a speech. The others rise, unevenly.`;
      }
      return t;
    },
    choices: [
      { text: "Hold the room a moment longer.", next: "sun_payoff", effects: { cohesion: 2 }, reply: [`You hold the room. Someone passes water down the row, cup by cup, and nobody leaves until you do.`] },
      { text: "End it. Send them back to work.", next: "sun_payoff", reply: [`You end it there. The room empties fast, the way rooms do when people have heard the costs said plainly and have work to get back to.`] }
    ]
  },
  reckon_suppress: {
    get text() {
      let t = `You issue the order: no further discussion of the crisis. Work continues. Rations continue. The ship continues.\n\n`;
      if (isAlive("elias")) {
        t += `Elias enforces it without being asked.\n\n`;
        // SUN-CALLBACKS-01: Deck Four's record, kept or edited, cited by its holder. Text only.
        if (state.promises.elias === "kept") t += `He adds one thing. "Deck Four's record stays whole. I had it from you first. Suppress the rest if you have to. Not that."\n\n`;
        else if (state.promises.elias === "broken") t += `He adds one thing. "${state.flags.prom_deck4_edited ? "You cut a door out of Deck Four." : "Deck Four came out of a buffer, not from you."} This is an order. I enforce orders. I tell the room less than I used to."\n\n`;
      }
      else t += `Compliance is enforced without being asked.\n\n`;
      t += `The silence that follows is different from the earlier silence. It has edges.\n\n`;
      if (isAlive("tomas")) t += `Tomas stops leading the quiet evening gatherings. `;
      if (isAlive("amara")) t += `Amara no longer meets anyone's eyes.`;
      t += `\n\nOrder holds. Something else does not.`;
      return t;
    },
    choices: [
      { text: "Let the silence stand.", next: "sun_payoff", effects: { cohesion: -2 }, reply: [`The silence stands. Over the next few shifts it sets into something that no longer needs enforcing. Nobody mistakes that for agreement.`] },
      { text: "Break it once. Name one cost.", next: "sun_payoff", effects: { cohesion: 1 }, reply: [`You break it once, at the evening meal: one cost, named out loud, by you. Then you let the silence close again. It closes a little looser than before.`] }
    ]
  },
  reckon_memory: {
    get text() {
      if (state.flags.crisis === "vent") {
        let t = `You give the remaining survivors the right to decide how the dead are remembered.\n\nThey keep Sela's last circle on the bulkhead. They keep Amara's key on a shelf in the common area.`;
        // SUN-DEATH-REACTIONS-01: every crew death, in order of death. Tomas knows the ones before his
        // recovery from the casualty board (pair_triage_chart: Rourke "goes in the count. A name, not an
        // entry."); the rest died after he came aboard.
        const named = (state.dead || []).slice();
        const words = ["no", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
        const nameWord = `${words[named.length] || named.length} name${named.length === 1 ? "" : "s"}`;
        const list = whatRemainsJoinNames(named);
        t += isAlive("tomas")
          ? ` Tomas speaks the ${nameWord} once, carefully — ${list} — and then does not speak them again.`
          : ` The ${nameWord} are read off the manifest once — ${list} — by whoever is holding it, and then not again.`;
        t += `\n\nAfter that, the ship feels slightly less like a place where people disappear without record.`;
        return t;
      }
      // Only when someone besides Rourke has died; the list itself is the whole count, Rourke first.
      const named = (state.dead || []).slice();
      let dead = "";
      if (named.some(k => k !== "rourke")) {
        dead = isAlive("tomas")
          ? ` Tomas speaks the names of the dead once — ${whatRemainsJoinNames(named)} — and then does not speak them again.`
          : ` The names of the dead are read off the manifest once — ${whatRemainsJoinNames(named)} — and then not again.`;
      }
      return `You give the survivors the right to decide how the near-loss${dead ? " and the dead are" : " is"} remembered.\n\nThey do not make a ceremony. They simply refuse to pretend it did not happen.${dead} Sela's yellow circle stays where it is — a quiet adult mark no one has asked to take down.\n\nThe ship continues.`;
    },
    choices: [
      { text: "Let the memory stand.", next: "sun_payoff", effects: { cohesion: 2 }, reply: [`You let it stand, all of it. Nobody takes anything down, and over the next shifts people start choosing the corridors that pass it.`] },
      { text: "Close it. The mission still needs a decision.", next: "sun_payoff", reply: [`You close it with one sentence and the next duty roster. Nothing is taken down, and nobody adds to it while you are watching.`] }
    ]
  },
  reckon_truth: {
    // SUN-STILL-BURNING-CORRIDOR-01 / PX6-F02: pay course_briefed; keep months line otherwise.
    get text() {
      const destination = state.flags.course_briefed
        ? `The rogue planet may have water under the ice. It may have nothing. The verified corridor is day 181 through day 184, one pass. That is still a long time for a damaged ship and a small group of people who have already begun to break.`
        : `The rogue planet may have water under the ice. It may have nothing. Fourteen months is a long time for a damaged ship and a small group of people who have already begun to break.`;
      return `You tell them the truth you have been carrying.\n\n${destination}\n\nYou ask what they still want from the time that remains.\n\nThe answers are not unified. Some want the planet. Some want speed. Some want comfort. Some want a final transmission aimed at nothing in particular.\n\nYou listen. Then you decide.`;
    },
    choices: [
      { text: "You have heard enough. Close it there.", next: "sun_payoff", reply: [`You close it there. Not everyone was finished. You watch them fold the rest away for later, and you let them.`] },
      { text: "Ask one more person what they still want.", next: "sun_payoff", effects: { cohesion: 2, supplies: -1 }, reply: [`You ask one more. The answer is small and specific and has nothing to do with the planet, and you write it down as carefully as an order.`] }
    ]
  },
});

// SUN-STILL-BURNING-CORRIDOR-01 — wrap buildStillBurningText after engine.js loads.
// engine.js is too large to remint; this file already shares the Fourteen-months lie.
(function wireStillBurningCorridor() {
  function wrap() {
    if (typeof buildStillBurningText !== "function") return;
    if (buildStillBurningText.__ssCorridorWired) return;
    const prior = buildStillBurningText;
    function buildStillBurningTextCorridor(crisis, shape, final, planet) {
      const text = prior(crisis, shape, final, planet);
      if (final === "hold" && state && state.flags && state.flags.course_briefed) {
        return String(text).replace(
          "The course remains locked on the rogue planet. Fourteen months. No guarantee.",
          "The course remains locked on the rogue planet. Verified corridor: day 181 through day 184. One pass."
        );
      }
      return text;
    }
    buildStillBurningTextCorridor.__ssCorridorWired = true;
    buildStillBurningText = buildStillBurningTextCorridor;
  }
  if (typeof document !== "undefined" && document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", wrap);
  } else {
    wrap();
  }
})();
