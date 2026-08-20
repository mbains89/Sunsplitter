// Sunsplitter — scenes-47.js
// 0.28.1c size hygiene. Pure mechanical. promises: price
// Strict scene shape only: text | choices | onEnter | image
registerScenes({

  prom_price: {
    image: "images/prom_price.jpg",
    onEnter: () => {
      if (state.promises.sela !== "made" || !isAlive("sela")) return "custody_hub";
    },
    get text() {
      let t = `It arrives as arithmetic and lands as a crowd.

Three of the crew came to you separately inside one watch. A petition is on the mess board by second shift: marks, not signatures. The ask never uses the word, but it has a shape, and the shape is Sela. Put the vault's keeper out of its keeping. Give fear a body it can spend.`;
      if (isAlive("vess")) t += `\n\n"Dawnbreak had a petition like this once," Vess says. "I have it filed under: before."`;
      if (isAlive("tomas")) t += `\n\n"They're not wrong that somebody pays," Tomas says. "They're wrong about the somebody."`;
      if (isAlive("jiro")) t += `\n\n"We are a long way from any court but this room," Jiro says. "I can give you the distance in months. It won't help."`;
      t += `\n\nSela reads the petition once, completely. "They have decided the vault must cost someone who can feel it. That is not mathematics. That is liturgy. I recognize liturgy."`;
      return t;
    },
    choices: [
      { text: "Stand between her and the room.",
        next: "prom_price_keep",
        effects: { cohesion: -2 },
        remember: "You stood between Sela and the crew's fear." },
      { text: "Let the room have its answer.",
        next: "prom_price_break",
        effects: { cohesion: 1 },
        remember: "You let the crew put its fear on Sela." }
    ]
  },

  // PRE: from prom_price choice 1 | WRITES: onEnter promises.sela="kept" (idempotent) | DEATH: none | IMG: reuse
  prom_price_keep: {
    image: "images/prom_price_keep.jpg",
    onEnter: () => {
      if (state.promises.sela === "made") state.promises.sela = "kept";
    },
    get text() {
      if (!isAlive("sela")) return `The petition stays on the board with no one named under it.`;
      return `You put it on the record in the mess, in front of the marks: the keeper is not the price, and fear does not get to sign orders on this ship.

Sela steps up beside you. Not behind.

"I keep your future at temperature," she says to the room. "I will keep your fear there also. It will last longer than you want it to. And when the heat question is answered, I will offer shared custody of what I keep, so that no one has to trust one pair of hands again."`;
    },
    choices: [ { text: "Open the custody question.", next: "custody_hub" } ]
  },

  // PRE: from prom_price choice 2 | WRITES: onEnter promises.sela="broken" (idempotent) | DEATH: none | IMG: reuse
  prom_price_break: {
    image: "images/prom_price_break.jpg",
    onEnter: () => {
      if (state.promises.sela === "made") state.promises.sela = "broken";
    },
    get text() {
      if (!isAlive("sela")) return `The petition stands unanswered. The room takes that as its answer.`;
      return `You let the room keep its answer. No order confirms it. None is needed.

"Spent, then."

The first incomplete sentence you have heard from her. Then complete ones, exact.

"You said: no one will use you as the price of their fear. The sentence is spent. I will be precise for you from now on, Commander. Precision is what I have left to give. You will receive all of it."`;
    },
    choices: [ { text: "Open the custody question.", next: "custody_hub" } ]
  }
});
