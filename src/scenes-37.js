// Sunsplitter — scenes-37.js
// 0.28.2 size hygiene. Pure mechanical. mid-b: lena/mira shower + rear set
// Strict scene shape only: text | choices | onEnter | image
registerScenes({

  lena_shower: {
    get text() {
      if (!isAlive("lena") || !state.romance.lena) {
        return `The rinse station is empty. The moment has already closed.`;
      }
      return `The observation blister has a rinse station that still works. She does not wait for invitation. Water is cold, then warmer. Skin under the spray, the marks still visible, her back to you for a long moment before she turns and rinses the last of the sweat from her collarbones.

"This is the part that is not for the crew," she says. "The rest of it they will invent whether you give them details or not."

She shuts the water off herself. The clock is still running.`;
    },
    get choices() {
      const next = state.past_known ? "pursuit_window" : "past_leak";
      if (!isAlive("lena") || !state.romance.lena) {
        return [{ text: "Leave.", next }];
      }
      return [
        { text: "Tell her you will find a way to buy her more time.", next, effects: { cohesion: 2 }, affinity: { lena: 4 } },
        { text: "Say nothing. The body already said enough.", next }
      ];
    },
    onEnter: () => {
      const next = state.past_known ? "pursuit_window" : "past_leak";
      if (!isAlive("lena") || !state.romance.lena) return next;
      state.flags.lena_shower_done = true;
    },
    image: "images/shower_lena.jpg"
  },

  mira_shower: {
    get text() {
      if (!isAlive("mira") || !state.romance.mira) {
        return `The engineering rinse is empty. The moment has already closed.`;
      }
      return `There is a rinse station off the engineering console that still holds pressure. She pulls you into it without ceremony. Water over skin, ozone and heat, her hands still exact even when they are not working the board.

"They will still invent the rest," she says. "This part is just for the two of us and the ship that is already adjusting power."

She turns the water off. The bay is waiting.`;
    },
    get choices() {
      if (!isAlive("mira") || !state.romance.mira) {
        return [{ text: "Leave.", next: "pursuit_window" }];
      }
      return [
        { text: "Tell her you want more of this, whatever the public cost.", next: "pursuit_window", effects: { cohesion: 2 }, affinity: { mira: 5 } },
        { text: "Hold the silence a moment longer. Then leave together.", next: "pursuit_window" }
      ];
    },
    onEnter: () => {
      if (!isAlive("mira") || !state.romance.mira) return "pursuit_window";
      state.flags.mira_shower_done = true;
    },
    image: "images/shower_mira.jpg"
  },

  lena_rear: {
    get text() {
      if (!isAlive("lena") || !state.romance.lena) {
        return `The bay is empty. The moment has already closed.`;
      }
      return `She does not dress yet. She stays on the edge of the treatment couch, back to you, the curve of her spine and the marks still visible under the low medical light. The ship hums. Neither of you speaks for a full minute.

Then she reaches for the coat without turning around.

"That is the version they do not get," she says. "The rest is already on the board."`;
    },
    get choices() {
      if (!isAlive("lena") || !state.romance.lena) {
        return [{ text: "Leave.", next: "prom_make_lena_ag" }];
      }
      return [
        { text: "Accept the accuracy. Leave on her terms.", next: "prom_make_lena_ag", affinity: { lena: 5 } },
        { text: "Hold the silence a minute longer. Then go.", next: "prom_make_lena_ag" }
      ];
    },
    onEnter: () => {
      if (!isAlive("lena") || !state.romance.lena) return "prom_make_lena_ag";
      state.flags.lena_rear_done = true;
    },
    image: "images/rear_lena.jpg"
  },

  mira_rear: {
    get text() {
      if (!isAlive("mira") || !state.romance.mira) {
        return `The bay is empty. The moment has already closed.`;
      }
      return `She does not dress immediately. She stays on the deck plating, back against the console, the line of her shoulders and the marks still clear under the low work lights. The ship is already adjusting who can open which logs.

"They get the record," she says without turning. "This part is not for the ledger."

She reaches for the discarded lingerie only after the minute has been spent.`;
    },
    get choices() {
      if (!isAlive("mira") || !state.romance.mira) {
        return [{ text: "Leave.", next: "debt_notice" }];
      }
      return [
        { text: "Accept the accuracy. Leave with her before the corridor fills.", next: "debt_notice", affinity: { mira: 5 } },
        { text: "Match her silence a moment longer. Then go.", next: "debt_notice" }
      ];
    },
    onEnter: () => {
      if (!isAlive("mira") || !state.romance.mira) return "debt_notice";
      state.flags.mira_rear_done = true;
    },
    image: "images/rear_mira.jpg"
  },

  amara_rear: {
    get text() {
      if (!isAlive("amara") || !state.romance.amara) {
        return `The bay is empty. The trays keep their own time.`;
      }
      return `She does not reach for the key yet. She stays among the warm trays, back to you, the curve of her body still open to the humid air and the low grow lights. The house key rests on the shelf. The purge timer has been pushed.

"They will see the claim on the board," she says. "This is the part that is only for us."

She turns only when the minute has been allowed to finish.`;
    },
    get choices() {
      if (!isAlive("amara") || !state.romance.amara) {
        return [{ text: "Leave.", next: "prom_make_amara_ag" }];
      }
      return [
        { text: "Match her honesty. Leave the bay together.", next: "prom_make_amara_ag", affinity: { amara: 5 }, lean: { living: 1 } },
        { text: "Say less. Leave before the next status walk.", next: "prom_make_amara_ag" }
      ];
    },
    onEnter: () => {
      if (!isAlive("amara") || !state.romance.amara) return "prom_make_amara_ag";
      state.flags.amara_rear_done = true;
    },
    image: "images/rear_amara.jpg"
  },

  sela_rear: {
    get text() {
      if (!isAlive("sela") || !state.romance.sela) {
        return `The bulkhead is unmarked tonight. The moment has already closed.`;
      }
      return `She does not reach for the folded lingerie yet. She stays with her back to you, the yellow pigment plate still between the two of you and the cold bulkhead. The line of her spine is exact. The earlier yellow circle holds its place on the wall.

"This measurement is private," she says without turning. "The rest of the ship can keep its own."

She moves only after the silence has been allowed its full weight.`;
    },
    get choices() {
      if (!isAlive("sela") || !state.romance.sela) {
        return [{ text: "Leave.", next: "debt_notice" }];
      }
      return [
        { text: "Accept that cost. Leave before the corridor invents the rest.", next: "debt_notice", affinity: { sela: 5 }, lean: { living: 1 } },
        { text: "Match her silence a minute longer. Then go.", next: "debt_notice" }
      ];
    },
    onEnter: () => {
      if (!isAlive("sela") || !state.romance.sela) return "debt_notice";
      state.flags.sela_rear_done = true;
    },
    image: "images/rear_sela.jpg"
  }
});
