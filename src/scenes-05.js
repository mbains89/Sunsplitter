// Sunsplitter — scenes-05.js
// 0.28.2 size hygiene. Pure mechanical. mid-a: vault_voice
// Strict scene shape only: text | choices | onEnter | image
registerScenes({

  vault_voice: {
    get text() {
      let t = `The vault monitoring panel has begun speaking.

Not an alarm. A voice. Soft, almost childlike, cycling through fragments of the original mission briefing and then, without warning, the names of the dead.

`;
      if (isAlive("mira")) {
        t += `Mira stands in front of it with her arms crossed tightly.

"It is a residual interface. The system was designed to report status to a living crew at the destination. Something in the power fluctuations woke a deeper layer. It is not conscious. It is worse. It is obedient to a purpose that no longer has a world."

`;
      } else {
        t += `The residual interface was designed to report status to a living crew at the destination. Power fluctuations woke a deeper layer. It is not conscious. It is obedient to a purpose that no longer has a world.

`;
      }
      if (isAlive("tomas")) {
        t += `Tomas is also there. He has not told anyone else.

`;
      }
      t += `"Some of the crew have started treating it as a presence.`;
      if (isAlive("amara")) t += ` Amara left a plant cutting on the hatch.`;
      if (isAlive("elias")) t += ` Elias wants the audio disabled.`;
      t += `"`;
      return t;
    },
    onEnter: () => {
      if (state.flags.past === "lena_only") state.past_known_by.lena = true;
    },
    choices: [
      { text: "Disable the voice. It is a system, not a ghost.", next: "arc_fork", effects: { cohesion: -3, integrity: 2 }, flag: { vault_voice: "off" }, lean: { future: 2 } },
      { text: "Leave it. Let people hear what they need to hear.", next: "boarding_stories", effects: { cohesion: 4, supplies: -1 }, flag: { vault_voice: "on" }, lean: { living: 2 }, requires: { cohesion: { min: 30 } } },
      { text: "Restrict access. Only you and Mira hear it from now on.", next: "arc_fork", effects: { cohesion: -1, integrity: 1 }, flag: { vault_voice: "restricted" }, requires: { trust: { mira: 40 } }, alive: "mira" }
    ]
  },

});
